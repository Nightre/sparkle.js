import Container from "./nodes/container"
import { Renderer } from "./video/renderer"
import { ISparkleEngineOption } from "./interface";
import { AudioManager, Loader } from "./main";
import { TextureManager } from "./video/texture/texture";
import { InputManager } from "./input/input"
import pool from "./system/pool";
import MouseManager from "./input/mouse"
import Debugger from "./debugger/debugger"
import PhysicsManager from "./physics/physics"
import Sence from "./system/sence"

class SparkleEngine {
    renderer: Renderer

    root!: Container
    residents: Set<Container> = new Set
    input: InputManager
    mouse: MouseManager
    loader: Loader
    texture: TextureManager
    physics: PhysicsManager
    debugger?: Debugger
    audio: AudioManager
    lastTime: number = 0

    loadedSence: Set<Sence> = new Set
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
        pool.register()
        this.input = new InputManager(this)
        this.mouse = new MouseManager(this, options.canvas)
        this.loader = new Loader(this)
        this.texture = new TextureManager(this)
        this.physics = new PhysicsManager(this)
        this.audio = new AudioManager(this)
        this.changeSenceToNode(new Container({ engine: this }))
        this.renderer = new Renderer(this, { ...options });
        this.debugger = options.disableDebugger ? undefined : new Debugger(this)
        requestAnimationFrame(this.loop.bind(this))
    }

    instantiateSence(sence: Sence) {
        const container = sence.create(this)
        if (!this.loadedSence.has(sence)) {
            sence.createOnce(this)
        }
        this.loadedSence.add(sence)
        return container
    }

    changeSenceTo(sence: Sence) {
        const container = this.instantiateSence(sence)
        this.changeSenceToNode(container)
    }

    changeSenceToNode(sence: Container) {
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
        child.resident = false
        this.residents.delete(child)
    }
    addResident(child: Container) {
        child.resident = true
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
        if (this.debugger) {
            this.debugger.update()
        }
        this.update(dt)
        this.renderer.draw()
        if (this.debugger) {
            this.debugger.draw()
        }
        requestAnimationFrame(this.loop.bind(this))
    }
}

export { SparkleEngine }