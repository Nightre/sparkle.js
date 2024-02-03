import { Renderer } from "../renderer"
import { createTexture } from "../utils/texture"

/**
 * 基础纹理，包含一个 WebGLTexture， 由 {@link Texture} 使用
 * @category Texture
 */
export class BaseTexture {
    texture: WebGLTexture
    width: number
    height: number

    constructor(renderer: Renderer, image: TexImageSource) {
        this.texture = createTexture(renderer.gl, image)
        if (image instanceof VideoFrame) {
            throw new Error("VideoFrame is currently not supported");
        } else {
            this.width = image.width
            this.height = image.height
        }
    }
}
/**
 * 普通的纹理
 * @category Texture
 */
export class Texture {
    baseTexture: BaseTexture | null
    constructor(baseTexture: BaseTexture) {
        this.baseTexture = baseTexture
    }
    static Form(renderer: Renderer, image: TexImageSource) {
        return new Texture(new BaseTexture(renderer, image))
    }
}
/**
 * 裁剪区域纹理
 * @category Texture
 */
export class AltasTexture extends Texture {

}
