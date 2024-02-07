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

    hFrames: number = 1
    vFrames: number = 1
    gapSize: number = 0
    
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
    setAnimation(frame: number) {
        if (!this.texture || !this.texture.baseTexture) {
            return;
        }
        if (this.vFrames > 0 && this.hFrames > 0) {
            if (frame > this.vFrames * this.hFrames - 1) {
                throw new Error("There aren't as many animations, please adjust vFrames and hFrames");
            }
            const cordx = frame % this.vFrames;
            const cordy = Math.floor(frame / this.hFrames);
    
            this.enableRegion = true;
            const fsw = (this.texture.baseTexture.width / this.hFrames) + this.gapSize; // Add gapSize for horizontal gap
            const fsh = (this.texture.baseTexture.height / this.vFrames) + this.gapSize; // Add gapSize for vertical gap
    
            this.textureRegion = {
                x: cordx * fsw,
                y: cordy * fsh,
                w: fsw - this.gapSize, // Subtract gapSize to maintain frame size
                h: fsh - this.gapSize // Subtract gapSize to maintain frame size
            };
        } else {
            throw new Error("vFrames and hFrames should be greater than 0");
        }
    }
}

export default Sprite