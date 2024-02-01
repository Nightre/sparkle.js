import GLShader, { AttributeInfo } from "../glshader"
import Renderer from "../renderer"

export interface ICompositorOptions {
    renderer: Renderer
    attributes: AttributeInfo[]
    vertexShader: string
    fragmentShader: string
}

abstract class Compositor {
    gl: WebGLRenderingContext
    renderer: Renderer

    shader: GLShader
    /** drawcall 模式 */
    attributes: AttributeInfo[] = []
    /** 一个顶点有几个 byte */
    vertexByteSize: number = 0
    vertexSize: number = 0

    constructor(options: ICompositorOptions) {
        this.gl = options.renderer.gl

        options.attributes.forEach((info) => {
            this.addAttributeInfo(info)
        })
        this.renderer = options.renderer
        this.shader = new GLShader(this.gl, options.vertexShader, options.fragmentShader)
    }

    addAttributeInfo(info: AttributeInfo) {
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
            offset: info.offset * bytesPerElement
        });

        this.vertexByteSize += bytesPerElement * info.size
        this.vertexSize = this.vertexByteSize / Float32Array.BYTES_PER_ELEMENT
    }

    bind() {
        const gl = this.gl
        this.renderer.useShader(this.shader)
        gl.uniformMatrix4fv(
            this.shader.getUnifromLocation("uProjectionMatrix"),
            false,
            this.renderer.projectionMatrix
        )
    }
    abstract flush(): void
}

export default Compositor