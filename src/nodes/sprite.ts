import { AltasTexture, Texture } from "../video/texture/texture";
import TextureCompositors from "../video/compositors/texture_compositor";
import Drawable from "./drawable";
import { ISpriteOptions } from "../interface"
import { IAnimations, ISpriteAnimations, Rect } from "../main";
import Timer from "./timer"
/**
 * 精灵
 * @category GameNode
 */
class Sprite extends Drawable {
    texture?: Texture;
    /**
     * 纹理裁剪区域
     */
    textureRegion: Rect = this.pool.Rect.pull()
    enableRegion: boolean = false
    private region: Rect = this.pool.Rect.pull()  // 纹理真实大小
    hFrames: number = 1
    vFrames: number = 1
    gapSize: number = 0

    private textureWidth: number = 0
    private textureHight: number = 0

    private animationTimer: Timer
    private animatiosFarme: number = 0
    animations: ISpriteAnimations
    animationPaused: boolean = false
    currentAnimationName?: string

    constructor(options: ISpriteOptions) {
        super(options);
        this.texture = options.texture;
        this.hFrames = options.hFrames ?? 0
        this.vFrames = options.vFrames ?? 0
        this.gapSize = options.gapSize ?? 0
        if (this.gapSize > 0) {
            this.setAnimation(options.frames ?? 0)
        }
        this.animations = options.animations ?? {}
        this.animationTimer = new Timer({
            start: false,
            waitTime: 0,
            engine: this.engine
        })
        this.animationTimer.on("timeout", this.animationsTimeOut.bind(this))
    }

    public get currentAnimation(): IAnimations | null {
        if (!this.currentAnimationName) {
            return null
        }
        return this.animations[this.currentAnimationName]
    }

    play(name: string) {
        if (this.currentAnimationName == name) {
            return
        }
        this.stop()
        this.currentAnimationName = name
        this.animationTimer.start = true
        this.animatiosFarme = 0
        this.setAnimation(this.currentAnimation!.fromFrames)
    }
    stop() {
        this.animationTimer.stop()
        this.currentAnimationName = undefined
    }
    private animationsTimeOut() {
        if (!this.currentAnimationName) {
            return
        }
        this.animatiosFarme++
        this.setAnimation(this.currentAnimation!.fromFrames + this.animatiosFarme)
        if (this.animatiosFarme > this.currentAnimation!.toFrames) {
            this.stop()
        }
    }
    update(dt: number): void {
        super.update(dt)
        this.animationTimer.start = !this.animationPaused
        this.animationTimer.update(dt)
    }
    draw(): void {
        super.draw();
        if (!this.texture || !this.visible) {
            return;
        }
        const baseTexture = this.texture.baseTexture!;
        this.renderer.setCompositors("texture");
        const compositors = this.renderer.currentCompositors as TextureCompositors;
        this.region.copy(this.textureRegion)
        let enableRegion = this.enableRegion
        if (this.texture instanceof AltasTexture) {
            this.region.add(this.texture.region)
            enableRegion = true
        }
        this.textureWidth = this.region.w
        this.textureHight = this.region.h
        if (this.enableRegion) {
            this.region.w = this.textureRegion.w
            this.region.h = this.textureRegion.h
        }
        const { w, h } = compositors.addQuad(baseTexture, enableRegion, this.region);
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
            const cordx = frame % this.hFrames;
            const cordy = Math.floor(frame / this.hFrames);

            this.enableRegion = true;
            const fsw = Math.floor(this.textureWidth / this.hFrames) + this.gapSize; // Add gapSize for horizontal gap
            const fsh = Math.floor(this.textureHight / this.vFrames) + this.gapSize; // Add gapSize for vertical gap

            this.textureRegion.setRect(
                cordx * fsw,
                cordy * fsh,
                fsw - this.gapSize, // Subtract gapSize to maintain frame size
                fsh - this.gapSize  // Subtract gapSize to maintain frame size
            )
        } else {
            throw new Error("vFrames and hFrames should be greater than 0");
        }
    }
}

export default Sprite