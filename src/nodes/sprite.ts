import { Texture } from "../video/texture/texture";
import TextureCompositors from "../video/compositors/texture_compositor";
import Drawable from "./drawable";
import { ISpriteOptions,IRect } from "../interface"

/**
 * 精灵
 * @category GameNode
 */
class Sprite extends Drawable {
    texture?: Texture;
    /**
     * 纹理裁剪区域，若为 -1 则自动检测纹理大小
     */
    textureRegion: IRect = { x: -1, y: -1, w: -1, h: -1 }
    constructor(options: ISpriteOptions) {
        super(options);
        this.texture = options.texture;
    }
    draw(): void {
        if (!this.texture || !this.visible) {
            return;
        }
        super.draw();
        this.renderer.setCompositors("texture");
        const compositors = this.renderer.currentCompositors as TextureCompositors;
        const baseTexture = this.texture.baseTexture!;
        compositors.addQuad(baseTexture, baseTexture.width, baseTexture.height);
        compositors.flush();
    }
}

export default Sprite