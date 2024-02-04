import { Texture } from "../video/texture/texture";
import TextureCompositors from "../video/compositors/texture_compositor";
import Drawable from "./drawable";
import { ISpriteOptions, IRect, PRIMITIVE_MODE } from "../interface"
import PrimitiveCompositors from "../video/compositors/primitive_compositor";

/**
 * 精灵
 * @category GameNode
 */
class Sprite extends Drawable {
    texture?: Texture;
    /**
     * 纹理裁剪区域
     */
    textureRegion: IRect = { x: 0, y: 0, w: 5, h: 5 }
    enableRegion: boolean = false
    constructor(options: ISpriteOptions) {
        super(options);
        this.texture = options.texture;
    }
    draw(): void {
        if (!this.texture || !this.visible) {
            return;
        }
        super.draw();
        const baseTexture = this.texture.baseTexture!;

        this.renderer.setCompositors("texture");
        const compositors = this.renderer.currentCompositors as TextureCompositors;
        compositors.addQuad(baseTexture, this.enableRegion, this.textureRegion);
        compositors.flush();

        // this.renderer.setCompositors("primitive");
        // const debug_compositors = this.renderer.currentCompositors as PrimitiveCompositors;
        // this.color.setColor(
        //     1, 0.5, 1, 0.2
        // )

        // debug_compositors.setColor(this.color)
        // debug_compositors.path.beginPath()
        // debug_compositors.path.moveTo(0, 0)
        // debug_compositors.path.lineTo(0, 100)
        // debug_compositors.path.lineTo(100, 200)
        // debug_compositors.path.lineTo(300, 250)

        // debug_compositors.path.moveTo(300, 0)
        // debug_compositors.path.lineTo(300, 250)

        // debug_compositors.setMode(PRIMITIVE_MODE.LINE)
        // debug_compositors.flush()
    }
}

export default Sprite