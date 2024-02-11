import { AltasTexture, Texture } from "../video/texture/texture";
import TextureCompositors from "../video/compositors/texture_compositor";
import Drawable from "./drawable";
import { ISpriteOptions } from "../interface"
import { IAnimationFrames, Rect } from "../main";
import Timer from "./timer"
import Animations from "../animation/animation";
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
    private animationTimer: Timer
    private animatiosFarme: number = 0
    animations?: Animations
    aniPaused: boolean = false
    aniLoop: boolean = false
    private currentAniName?: string
    private currentAni?: IAnimationFrames

    constructor(options: ISpriteOptions) {
        super(options);
        this.texture = options.texture;

        this.animations = options.animations
        this.animationTimer = new Timer({
            start: false,
            waitTime: 0,
            engine: this.engine
        })
        this.animationTimer.on("timeout", this.animationsTimeOut.bind(this))
    }

    play(name: string, loop: boolean = false, restart: boolean = false) {
        if (name == this.currentAniName && !restart) {
            return
        }
        this.stop()
        this.texture = this.animations!.texture
        this.aniLoop = loop
        this.currentAniName = name
        this.currentAni = this.animations!.getAniData(name)
        this.animationTimer.waitTime = this.currentAni!.time
        this.animationTimer.start()
        this.animatiosFarme = 0
        this.setAnimation(0)
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
        if (this.currentAni!.fromFrames + this.animatiosFarme > this.currentAni!.toFrames) {
            if (this.aniLoop) {
                this.play(this.currentAniName, true, true)
            } else {
                this.stop()
            }
            return
        }
        this.setAnimation(this.animatiosFarme)
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
        
        this.renderer.setCompositors("texture");
        const compositors = this.renderer.currentCompositors as TextureCompositors;
        const baseTexture = this.texture.baseTexture!;
        
        this.region.copy(this.textureRegion)
        let enableRegion = this.enableRegion
        if (this.texture instanceof AltasTexture) {
            this.region.clip(this.texture.region)
            enableRegion = true
        }
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
        if (this.currentAni) {
            const currentFrame = this.currentAni.fromFrames + frame
            const region = this.animations!.getAnimationRegion(currentFrame)
            if (region) {
                this.textureRegion.copy(region)
                this.enableRegion = true
            }
        }
    }
}

export default Sprite