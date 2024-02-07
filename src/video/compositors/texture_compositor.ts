import { Renderer } from "../renderer";
import Compositor from "./compositors";
import vertexShader from "../shader/quad.vert?raw"
import fragmentShader from "../shader/quad.frag?raw"
import { BaseTexture } from "../texture/texture";
import { Rect } from "../../main";

class TextureCompositors extends Compositor {
    protected drawCallMode: number;
    constructor(renderer: Renderer) {
        const gl = renderer.gl
        super({
            renderer,
            attributes: [
                { name: 'aPosition', size: 2, type: gl.FLOAT, normalized: false, offset: 0 },
                { name: 'aRegion', size: 2, type: gl.FLOAT, normalized: false, offset: 2 * Float32Array.BYTES_PER_ELEMENT },
            ],
            vertexShader,
            fragmentShader,
        })
        this.drawCallMode = gl.TRIANGLES
    }

    private addVertex(x: number, y: number, u: number, v: number) {
        const pos = this.renderer.modelMatrix.apply(x, y)
        this.bufferArray.pushVertex(
            ...pos, u, v
        )
        return pos
    }

    addQuad(
        texture: BaseTexture,
        enableRegion: boolean,
        region?: Rect,
    ) {
        const gl = this.gl
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture.texture);

        const u0 = enableRegion ? region!.x / texture.width : 0
        const v0 = enableRegion ? region!.y / texture.height : 0

        const u1 = enableRegion ? u0 + region!.w / texture.width : 1
        const v1 = enableRegion ? v0 + region!.h / texture.height : 1

        const w = enableRegion ? region!.w : texture.width
        const h = enableRegion ? region!.h : texture.height
        
        this.addVertex(
            0, 0, u0, v0
        )
        this.addVertex(
            w, 0, u1, v0
        )
        this.addVertex(
            w, h, u1, v1
        )

        this.addVertex(
            0, 0, u0, v0
        )
        this.addVertex(
            w, h, u1, v1
        )
        this.addVertex(
            0, h, u0, v1
        )
        return {
            w, h
        }
    }
}

export default TextureCompositors