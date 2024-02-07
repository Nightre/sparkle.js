import { IDestoryable } from "../interface"
import { getMaxShaderPrecision, setPrecision } from "./utils/precision"
import { compileProgram } from "./utils/program"
import { AttributeInfo } from "../interface"

/**
 * webgl shader
 * 封装了一些方法
 */
export default class GLShader implements IDestoryable {
    private gl: WebGLRenderingContext
    program: WebGLProgram
    vertex: string
    fragment: string

    /**
     * 
     * @param gl 
     * @param vertex 顶点 shader
     * @param fragment 片元 shader
     * @param precision 质量，为空则自动使用最高支持
     */
    constructor(gl: WebGLRenderingContext, vertex: string, fragment: string, precision?: string) {
        this.gl = gl
        this.vertex = setPrecision(vertex, precision || getMaxShaderPrecision(gl))
        this.fragment = setPrecision(fragment, precision || getMaxShaderPrecision(gl))
        this.program = compileProgram(gl, this.vertex, this.fragment);
    }

    /**
     * 使用当前 shader
     */
    bind() {
        this.gl.useProgram(this.program);
    }

    /**
     * 获取 shader 中 attribute 的 location
     */
    getAttribLocation(name: string) {
        // TODO:将location缓存在cpu，可能提高性能
        return this.gl.getAttribLocation(this.program, name);
    }
    /**
     * 获取 uniform 的 Location
     * @param name 
     * @returns 
     */
    getUnifromLocation(name: string): WebGLUniformLocation | null {
        // TODO:将location缓存在cpu，可能提高性能
        return this.gl.getUniformLocation(this.program, name);
    }

    /**
     * 设置一个顶点属性 的信息
     * @param gl 
     * @param attributes 顶点属性信息 
     * @param vertexByteSize 一个顶点有多少byte，用于 stride
     */
    setVertexAttributes(gl: WebGLRenderingContext, attributes: AttributeInfo[], vertexByteSize: number) {
        // set the vertex attributes
        for (let index = 0; index < attributes.length; ++index) {
            const element = attributes[index];
            const location = this.getAttribLocation(element.name);

            if (location !== -1) {
                gl.enableVertexAttribArray(location);
                gl.vertexAttribPointer(
                    location,
                    element.size,
                    element.type,
                    element.normalized ?? false,
                    vertexByteSize,
                    element.offset
                );
            } else {
                gl.disableVertexAttribArray(index);
            }
        }
    }

    /**
     * 销毁该shader
     */
    destory() {
        this.gl.deleteProgram(this.program)
    }
}