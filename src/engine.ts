import Container from "./nodes/container"
import { Renderer } from "./video/renderer"
import { ISparkleEngineOption } from "./interface";
import { AudioManager, IResources, Loader, Scene } from "./main";
import { TextureManager } from "./video/texture/texture";
import { InputManager } from "./input/input"
import pool from "./system/pool";
import MouseManager from "./input/mouse"
import Debugger from "./debugger/debugger"
import PhysicsManager from "./physics/physics"
import TextManager from "./video/text_manager"
import { ResourcesManager } from "./loader/loader";

/**
 * 引擎
 */
class SparkleEngine {
    /** 渲染器 */
    public renderer: Renderer
    /** 场景的根节点 */
    public root!: Container
    /** 管理键盘输入  */
    public input: InputManager
    /** 管理鼠标输入  */
    public mouse: MouseManager
    /** 资源加载器  */
    public loader: Loader
    /** 纹理管理  */
    public texture: TextureManager
    /** 物理管理  */
    public physics: PhysicsManager
    /** debugger管理  */
    public debugger?: Debugger
    /** 音频管理  */
    public audio: AudioManager
    /** 文字管理  */
    public text: TextManager
    /** 资源管理 */
    public resource: ResourcesManager
    /** 获取资源快捷方式，等同于 engine.resource.get */
    public getAssets: <T extends IResources>(id: string) => T

    private lastTime: number = 0
    private residents: Set<Container> = new Set
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
    /** 目前尚不支持限制帧率 */
    maxFPS: number
    /**@ignore */
    toDestory: Container[] = []
    private loadedScenes: Set<new () => Scene> = new Set()
    constructor(options: ISparkleEngineOption) {
        if (!options.canvas) {
            throw new Error("Please provide a canvas");
        }
        pool.register()

        // 初始化管理类
        this.input = new InputManager()
        this.mouse = new MouseManager(this, options.canvas)
        this.loader = new Loader(this)
        this.texture = new TextureManager(this)
        this.physics = new PhysicsManager(this)
        this.audio = new AudioManager(this)
        this.text = new TextManager(this)
        this.renderer = new Renderer(this, { ...options });
        this.debugger = options.disableDebugger ? undefined : new Debugger(this)
        this.resource = new ResourcesManager(this);
        (window as any).sparkleEngine = this
        this.changeSceneToContainer(new Container({ engine: this }))
        this.maxFPS = options.maxFPS ?? 60
        this.loop(0); // 开始游戏 循环
        this.getAssets = this.resource.get.bind(this.resource)
    }

    /**
     * 转换到某个 Container
     * @example
     * ```js
     * engine.changeSceneToContainer(Container)
     * ```
     */
    changeSceneToContainer(Scene: Container) {
        this.residents.forEach((c) => {
            c.setParent(Scene)
        })
        if (this.root) {
            this.root.doDestory()
        }
        this.root = Scene
    }
    /**
     * 删除一个常驻节点
     * @ignore
     */
    removeResident(child: Container) {
        child.resident = false
        this.residents.delete(child)
    }
    /**
     * 添加一个常驻节点
     * @ignore
     */
    addResident(child: Container) {
        child.resident = true
        child.setParent(this.root)
        this.residents.add(child)
    }
    /**
     * @ignore
     * 游戏更新
     * @param dt 
     */
    update(dt: number) {
        this.root.update(dt);
        this.root.postUpdate(dt);
    }
    /**
     * @ignore
     * 循环
     * @param currentTime 
     */
    loop(currentTime: number) {
        const dt = (currentTime - this.lastTime) / 1000
        this.lastTime = currentTime
        if (this.debugger) {
            this.debugger.update()
        }
        this.update(dt)
        this.renderer.draw()
        this.destoryChild()
        window.requestAnimationFrame(this.loop.bind(this))
    }
    private destoryChild() {
        this.toDestory.forEach(() => {
            this.toDestory.pop()!.doDestory()
        })
    }
    /**
     * 切换场景
     * @example
     * ```js
     * class GameScene extends Scene {
     *      ...
     * }
     * engine.changeToScene(GameScene)
     * ```
     * @param Scene 
     */
    async changeToScene(Scene: new () => Scene) {
        this.changeSceneToContainer(await this.instantiateScene(Scene))
    }
    /**
     * 实例化一个场景。由于场景有preload操作，所以该操作是异步的
     * @param Scene 
     * @returns 
     */
    instantiateScene<T extends Scene>(Scene: new () => T) {
        return new Promise<Container>((resolve) => {
            
            this.resource.startRegion()
            const Scene = new Scene()
            if (!this.loadedScenes.has(Scene)) {
                Scene.preload()
                this.loadedScenes.add(Scene)                
            }
            this.resource.endRegion(() => {
                resolve(Scene.create(this))
            })
        })
    }
    /**
     * 重置场景
     */
    reset() {
        // 重置场景
        const Scene = new Container({ engine: this })
        this.changeSceneToContainer(Scene)
    }
}

export { SparkleEngine }