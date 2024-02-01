import { getMaxShaderPrecision, setPrecision } from "./utils/precision"
import { compileProgram } from "./utils/program"

export type AttributesLocation = Record<string, number>

export interface AttributeInfo {
    name: string
    size: number
    type: number
    normalized?: boolean
    offset: number
}

export default class GLShader {
    program: WebGLProgram
    gl: WebGLRenderingContext

    vertex: string
    fragment: string

    constructor(gl: WebGLRenderingContext, vertex: string, fragment: string, precision?: string) {
        this.gl = gl
        this.vertex = setPrecision(vertex, precision || getMaxShaderPrecision(gl))
        this.fragment = setPrecision(fragment, precision || getMaxShaderPrecision(gl))
        this.program = compileProgram(gl, this.vertex, this.fragment);
    }

    bind() {
        this.gl.useProgram(this.program);
    }

    /**
     * 获取 shader 中 attribute 的 location
     */
    getAttribLocation(name: string) {
        let attr =  this.gl.getAttribLocation(this.program, name);
        if (typeof attr !== "undefined") {
            return attr;
        } else {
            return -1;
        }
    }

    getUnifromLocation(name: string): WebGLUniformLocation | null {
        let uniform = this.gl.getUniformLocation(this.program, name);
        if (typeof uniform !== "undefined") {
            return uniform;
        } else {
            return null;
        }
    }

    setVertexAttributes(gl: WebGLRenderingContext, attributes: AttributeInfo[], vertexByteSize: number) {
        // set the vertex attributes
        for (let index = 0; index < attributes.length; ++index) {
            let element = attributes[index];
            let location = this.getAttribLocation(element.name);

            if (location !== -1) {
                gl.enableVertexAttribArray(location);
                gl.vertexAttribPointer(location, element.size, element.type, element.normalized ?? false, vertexByteSize, element.offset);
            } else {
                gl.disableVertexAttribArray(index);
            }
        }
    }

    destory() {
        this.gl.deleteProgram(this.program)
    }
}