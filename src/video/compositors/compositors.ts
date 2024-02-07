import GLShader from "../glshader"
import { Renderer } from "../renderer"
import { AttributeInfo, ICompositorOptions } from "../../interface"
import VertexArrayBuffer from "../vertex_array"
import { createBuffer } from "../utils/program"
import pool from "../../system/pool"
import { Color } from "../../main"
import Path from "../../math/path"

/**
 * Compositor 管理 webgl 状态，每个Compositor有个Shader
 * 如果shader同样也就是 合成器 相同，那么就无需多余的webgl操作
 * 照成不必要的开销，每次使用该合成器都会调用 bind （renderer调用）
 */
abstract class Compositor {
    protected gl: WebGLRenderingContext
    protected renderer: Renderer
    /** shader */
    protected shader: GLShader
    /** 顶点缓冲区信息 */
    protected attributes: AttributeInfo[] = []
    /** 一个顶点有几个 byte 用于 stride */
    protected vertexByteSize: number = 0
    /** 一个顶点有几个 float32 用于 VertexArrayBuffer 设置大小 */
    protected vertexFloatSize: number = 0

    protected bufferArray: VertexArrayBuffer
    protected buffer: WebGLBuffer

    protected color: Color
    protected colorDirty: boolean = true
    public path: Path
    protected abstract drawCallMode: number

    lastVert: number[] = []

    currentShader: GLShader

    constructor(options: ICompositorOptions) {
        this.gl = options.renderer.gl

        options.attributes.forEach((info) => {
            this.addAttributeInfo(info)
        })
        this.renderer = options.renderer
        this.shader = new GLShader(this.gl, options.vertexShader, options.fragmentShader)
        this.currentShader = this.shader
        this.buffer = createBuffer(this.gl)
        this.bufferArray = new VertexArrayBuffer(this.vertexFloatSize, options.vertexPerObj ?? 6)
        this.color = pool.Color.pull(1, 1, 1, 1)
        this.path = this.renderer.path
    }
    setColor(color: Color) {
        if (!this.color.equals(color)) {
            this.colorDirty = true
            this.color.copy(color)
        }

    }

    setColorByRGBA(r = 1, g = 1, b = 1, a = 1) {
        const newColor = pool.Color.pull(r, g, b, a)
        if (!this.color.equals(newColor)) {
            this.colorDirty = true
            this.color.copy(newColor)
        }
        pool.Color.push(newColor)
    }
    protected setUnifrom() {
        if (this.colorDirty) {
            const gl = this.gl
            gl.uniform4f(
                this.currentShader.getUnifromLocation("uColor"),
                this.color.r,
                this.color.g,
                this.color.b,
                this.color.alpha,
            )
        }
    }

    /**
     * 添加一个顶点信息
     * @param info 信息
     */
    protected addAttributeInfo(info: AttributeInfo) {
        let bytesPerElement = 0
        switch (info.type) {
            case this.gl.BYTE:
                bytesPerElement = Int8Array.BYTES_PER_ELEMENT;
                break;
            case this.gl.UNSIGNED_BYTE:
                bytesPerElement = Uint8Array.BYTES_PER_ELEMENT;
                break;
            case this.gl.SHORT:
                bytesPerElement = Int16Array.BYTES_PER_ELEMENT;
                break;
            case this.gl.UNSIGNED_SHORT:
                bytesPerElement = Uint16Array.BYTES_PER_ELEMENT;
                break;
            case this.gl.INT:
                bytesPerElement = Int32Array.BYTES_PER_ELEMENT;
                break;
            case this.gl.UNSIGNED_INT:
                bytesPerElement = Uint32Array.BYTES_PER_ELEMENT;
                break;
            case this.gl.FLOAT:
                bytesPerElement = Float32Array.BYTES_PER_ELEMENT;
                break;
            default:
                throw new Error("Invalid GL Attribute type");
        }
        this.attributes.push({
            name: info.name,
            size: info.size,
            type: info.type,
            normalized: info.normalized,
            offset: info.offset
        });

        this.vertexByteSize += bytesPerElement * info.size
        this.vertexFloatSize = this.vertexByteSize / Float32Array.BYTES_PER_ELEMENT
    }
    /**
     * 使用该合成器
     */
    bind(customShader?: GLShader) {
        const gl = this.gl
        this.currentShader = customShader ?? this.shader
        this.renderer.useShader(this.currentShader)
        gl.uniformMatrix4fv(
            this.currentShader.getUnifromLocation("uProjectionMatrix"),
            false,
            this.renderer.projectionMatrix
        )
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
        this.currentShader.setVertexAttributes(this.gl, this.attributes, this.vertexByteSize)
        this.colorDirty = true
    }
    /**
     * 绘制到屏幕
     */

    flush() {
        const gl = this.renderer.gl

        const vertexCount = this.bufferArray.vertexCount
        const vertexSize = this.bufferArray.vertexSize
        this.setUnifrom()
        gl.bufferData(gl.ARRAY_BUFFER, this.bufferArray.toFloat32(0, vertexCount * vertexSize), gl.STATIC_DRAW)
        gl.drawArrays(this.drawCallMode, 0, vertexCount)

        this.colorDirty = false
        this.bufferArray.clear()
    }
}

export default Compositor