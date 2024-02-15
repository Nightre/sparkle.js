import { AltasTexture, Texture } from "../video/texture/texture";
import TextureCompositors from "../video/compositors/texture_compositor";
import Drawable from "./drawable";
import { ISpriteOptions } from "../interface"
import { IAnimationFrames, Rect } from "../main";
import Timer from "./timer"
import Animations from "../animation/animation";
/**
 * 精灵
 * @example 
 * ```
 * const node = new Sprite({
 *      texture: yourTexture
 * })
 * ```
 * 可以使用animations
 * ```
 * const player = new Sprite({
 *      animations: engine.getAssets("player_ani")
 * })
 * player.play("run", true) // loop
 * ```
 * @category GameNode
 */
class Sprite extends Drawable {
    /**
     * 显示的纹理
     */
    texture?: Texture;
    /**
     * 纹理裁剪区域
     */
    textureRegion: Rect = this.pool.Rect.pull()
    /**
     * 是否开启纹理裁剪
     */
    enableRegion: boolean = false

    /**
     * 动画
     */
    animations?: Animations
    /**
     * 是否暂停动画，如果想暂停动画，请设置该属性
     */
    aniPaused: boolean = false

    private aniLoop: boolean = false

    private region: Rect = this.pool.Rect.pull()  // 纹理真实大小
    private animationTimer: Timer
    private animatiosFarme: number = 0

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
        this.animationTimer.event.on("timeout", this.animationsTimeOut.bind(this))
    }
    /**
     * 播放某个动画，如果已经在播放目标动画，则不会重新播放
     * 若希望重新播放，请设置restart参数为true
     * @param name 动画名称
     * @param loop 是否循环
     * @param restart 是否重启动画
     * @returns 
     */
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
    /**
     * 停止动画
     */
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
    /**
     * @ignore
     * @param dt 
     */
    update(dt: number): void {
        super.update(dt)
        this.animationTimer.paused = this.aniPaused
        this.animationTimer.update(dt)
    }


    private clipRegion() {
        this.region.copy(this.textureRegion)
        let enableRegion = this.enableRegion
        if (this.texture instanceof AltasTexture) {
            if (this.enableRegion) {
                // 如果开启纹理裁剪，那么就从AltasTexture中裁剪一个region
                this.texture.region.clip(this.region, this.region)
            } else {
                this.region.copy(this.texture.region)
            }
            enableRegion = true
        }
        return enableRegion
    }
    /**
     * @ignore
     * @returns 
     */
    draw(): void {
        super.draw();
        if (!this.texture || !this.visible) {
            return;
        }

        this.renderer.setCompositors("texture");
        const compositors = this.renderer.currentCompositors as TextureCompositors;
        const baseTexture = this.texture.baseTexture!;
        const enableRegion = this.clipRegion()
        const { w, h } = compositors.addQuad(baseTexture, enableRegion, this.region);
        this.drawSize.set(w, h)

        compositors.setColor(this.color)
        compositors.flush();
    }
    /**
     * @ignore
     */
    drawDebug() {
        this.engine.debugger?.drawDebugFrame(this.drawSize.x, this.drawSize.y)
        super.drawDebug()
    }
    /**
     * 设置动画帧
     * @param frame 
     */
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