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
    aniData: ISpriteAnimations
    aniPaused: boolean = false
    aniLoop: boolean = false
    currentAniName?: string

    constructor(options: ISpriteOptions) {
        super(options);
        this.texture = options.texture;
        this.hFrames = options.hFrames ?? 0
        this.vFrames = options.vFrames ?? 0
        this.gapSize = options.gapSize ?? 0
        if (this.gapSize > 0) {
            this.setAnimation(options.frames ?? 0)
        }
        this.aniData = options.animations ?? {}
        this.animationTimer = new Timer({
            start: false,
            waitTime: 0,
            engine: this.engine
        })
        this.animationTimer.on("timeout", this.animationsTimeOut.bind(this))
    }

    public get currentAni(): IAnimations | null {
        if (!this.currentAniName) {
            return null
        }
        return this.aniData[this.currentAniName]
    }

    play(name: string, loop: boolean = false) {
        this.stop()
        this.aniLoop = loop
        this.currentAniName = name
        if (this.currentAni!.fromFrames > this.currentAni!.toFrames) {
            throw new Error("fromFrames must be less than toFrames");
        }
        this.animationTimer.waitTime = this.currentAni!.time
        this.animationTimer.start()
        this.animatiosFarme = 0
        this.setAnimation(this.currentAni!.fromFrames)
    }
    stop() {
        this.aniLoop = false
        this.animationTimer.stop()
        this.currentAniName = undefined
    }
    private animationsTimeOut() {
        if (!this.currentAniName) {
            return
        }
        this.animatiosFarme++
        if (this.animatiosFarme > this.currentAni!.toFrames) {
            if (this.aniLoop) {
                this.play(this.currentAniName, true)
            } else {
                this.stop()
            }
            return
        }
        this.setAnimation(this.currentAni!.fromFrames + this.animatiosFarme)
    }
    update(dt: number): void {
        super.update(dt)
        this.animationTimer.paused = this.aniPaused
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