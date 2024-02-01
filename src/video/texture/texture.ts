import Renderer from "../renderer"
import { createTexture } from "../utils/texture"

export class BaseTexture {
    texture: WebGLTexture
    width: number
    height: number

    constructor(renderer: Renderer, image: TexImageSource) {
        this.texture = createTexture(renderer.gl, image)
        if (image instanceof VideoFrame) {
            throw new Error("VideoFrame is currently not supported");
        }else{
            this.width = image.width
            this.height = image.height
        }
    }
}

export class Texture {
    baseTexture: BaseTexture | null
    constructor(baseTexture: BaseTexture) {
        this.baseTexture = baseTexture
    }
    static Form(renderer: Renderer, image: TexImageSource) {
        return new Texture(new BaseTexture(renderer, image))
    }
}

export class AltasTexture {

}
