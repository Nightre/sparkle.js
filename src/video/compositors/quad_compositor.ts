import Renderer from "../renderer";
import Compositor from "./compositors";

import vertexShader from "../shader/quad.vert?raw"
import fragmentShader from "../shader/quad.frag?raw"
import VertexArray from "../vertex_array";
import { createBuffer } from "../utils/program";
import { BaseTexture } from "../texture/texture";

class QuadCompositors extends Compositor {
    bufferArray: VertexArray
    buffer: WebGLBuffer

    constructor(renderer: Renderer) {
        const gl = renderer.gl
        super({
            renderer,
            attributes: [
                { name: 'aPosition', size: 2, type: gl.FLOAT, normalized: false, offset: 0 },
                { name: 'aRegion', size: 2, type: gl.FLOAT, normalized: false, offset: 2 },
            ],
            vertexShader,
            fragmentShader
        })
        this.buffer = createBuffer(gl)
        this.bufferArray = new VertexArray(this.vertexSize, 6)
    }

    addVertex(x: number, y: number, u: number, v: number) {
        this.bufferArray.pushVertex(
            ...this.renderer.modelMatrix.apply(x, y), u, v
        )
    }

    bind() {
        super.bind()
        const gl = this.renderer.gl
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
        this.shader.setVertexAttributes(this.gl, this.attributes, this.vertexByteSize)
    }

    addQuad(
        texture: BaseTexture
    ) {
        const gl = this.gl
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture.texture);
        this.addVertex(
            0, 0, 0, 0
        )
        this.addVertex(
            50, 0, 1, 0
        )
        this.addVertex(
            50, 50, 1, 1
        )

        this.addVertex(
            0, 0, 0, 0
        )
        this.addVertex(
            50, 50, 1, 1
        )
        this.addVertex(
            0, 50, 0, 1
        )

    }

    flush() {
        const gl = this.renderer.gl


        const vertexCount = this.bufferArray.vertexCount
        const vertexSize = this.bufferArray.vertexSize

        gl.bufferData(gl.ARRAY_BUFFER, this.bufferArray.toFloat32(0, vertexCount * vertexSize), gl.STATIC_DRAW)
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount)

        this.bufferArray.clear()
    }
}

export default QuadCompositors