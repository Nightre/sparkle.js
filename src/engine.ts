import Container from "./nodes/container"
import { Renderer } from "./video/renderer"
import { ISparkleEngineOption } from "./interface";
import { Loader } from "./main";
import { TextureManager } from "./video/texture/texture";
import pool from "./system/pool";

//TODO:按键
class SparkleEngine {
    renderer: Renderer

    root!: Container
    residents: Set<Container> = new Set
    loader: Loader
    texture: TextureManager

    lastTime: number = 0
    /**
     * SparkleEngine 是一个轻量的游戏，易于上手
     * @example 
     * html
     * ```html
     * <canvas id="canvas" width="800" height="800"></canvas>
     * ```
     * js
     * ```js
     * const sparkle = new SparkleEngine({
     *      // 游戏 Canvas
     *      canvas: document.getElementById("canvas")
     * })
     * ```
     * @param options
     */
    constructor(options: ISparkleEngineOption) {
        pool.init()
        this.loader = new Loader(this)
        this.texture = new TextureManager(this)
        this.changeSenceTo(new Container({ engine: this }))
        this.renderer = new Renderer(this, { ...options });
        requestAnimationFrame(this.loop.bind(this))
    }
    changeSenceTo(sence: Container) {
        this.residents.forEach((c) => {
            c.setParent(sence)
        })
        if (this.root) {
            this.root.destory()
            this.root.postDestory()
        }
        this.root = sence
    }
    removeResident(child: Container) {
        this.residents.delete(child)
    }
    addResident(child: Container) {
        child.setParent(this.root)
        this.residents.add(child)
    }
    update(dt: number) {
        this.root.update(dt);
        this.root.postUpdate(dt);
    }
    loop(currentTime: number) {
        const dt = (currentTime - this.lastTime) / 1000
        this.lastTime = currentTime
        this.update(dt)
        this.renderer.draw()
        requestAnimationFrame(this.loop.bind(this))
    }
}

export { SparkleEngine }