import { Texture } from "../video/texture/texture";
import TextureCompositors from "../video/compositors/texture_compositor";
import Drawable from "./drawable";
import { ISpriteOptions, IRect } from "../interface"

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
        const { sx, sy, ex, ey } = compositors.addQuad(baseTexture, this.enableRegion, this.textureRegion);
        compositors.flush();
        if (this.engine.debugger) {
            this.engine.debugger.addDebugFrame({
                x: sx, y: sy, w: ex - sx, h: ey - sy
            })            
        }
    }
}

export default Sprite