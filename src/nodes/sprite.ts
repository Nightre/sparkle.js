import { Texture } from "../video/texture/texture";
import TextureCompositors from "../video/compositors/texture_compositor";
import Drawable from "./drawable";
import { ISpriteOptions, IRect } from "../interface"
import { Vector2 } from "../main";

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

    drawSize: Vector2 = this.pool.Vector2.pull(0, 0)
    constructor(options: ISpriteOptions) {
        super(options);
        this.texture = options.texture;

    }
    draw(): void {
        super.draw();
        if (!this.texture || !this.visible) {
            return;
        }
        const baseTexture = this.texture.baseTexture!;

        this.renderer.setCompositors("texture");
        const compositors = this.renderer.currentCompositors as TextureCompositors;
        const { w, h } = compositors.addQuad(baseTexture, this.enableRegion, this.textureRegion);
        this.drawSize.set(w, h)
        compositors.setColor(this.color)
        compositors.flush();
    }
    drawDebug() {
        this.engine.debugger?.drawDebugFrame(this.drawSize.x, this.drawSize.y)
        super.drawDebug()
    }
    destory(): void {
        super.destory()
        this.pool.Vector2.push(this.drawSize)
    }
}

export default Sprite