import { Renderer } from "../renderer";
import Compositor from "./compositors";

import vertexShader from "../shader/quad.vert?raw"
import fragmentShader from "../shader/quad.frag?raw"
import VertexArray from "../vertex_array";
import { createBuffer } from "../utils/program";
import { BaseTexture } from "../texture/texture";
import Color from "../../math/color";
import GLShader from "../glshader";

class TextureCompositors extends Compositor {
    private bufferArray: VertexArray
    private buffer: WebGLBuffer
    private color: Color
    private colorDirty: boolean = true

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
        this.color = this.pool.pull("Color", 1, 1, 1, 1)
        this.bufferArray = new VertexArray(this.vertexFloatSize, 6)
    }

    setColor(color: Color) {
        if (!this.color.equals(color)) {
            this.colorDirty = true
            this.color.copy(color)
        }
    }

    private addVertex(x: number, y: number, u: number, v: number) {
        this.bufferArray.pushVertex(
            ...this.renderer.modelMatrix.apply(x, y), u, v
        )
    }

    bind(customShader?: GLShader) {
        super.bind(customShader)
        this.colorDirty = true
        const gl = this.renderer.gl
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
        this.currentShader.setVertexAttributes(this.gl, this.attributes, this.vertexByteSize)
    }

    addQuad(
        texture: BaseTexture,
        width: number,
        height: number
    ) {
        const gl = this.gl
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture.texture);

        this.addVertex(
            0, 0, 0, 0
        )
        this.addVertex(
            width, 0, 1, 0
        )
        this.addVertex(
            width, height, 1, 1
        )

        this.addVertex(
            0, 0, 0, 0
        )
        this.addVertex(
            width, height, 1, 1
        )
        this.addVertex(
            0, height, 0, 1
        )

    }

    private setUnifrom() {
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

    flush() {
        const gl = this.renderer.gl

        const vertexCount = this.bufferArray.vertexCount
        const vertexSize = this.bufferArray.vertexSize
        this.setUnifrom()
        gl.bufferData(gl.ARRAY_BUFFER, this.bufferArray.toFloat32(0, vertexCount * vertexSize), gl.STATIC_DRAW)
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount)

        this.colorDirty = false
        this.bufferArray.clear()
    }
}

export default TextureCompositors