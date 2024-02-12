import { Animations, AnimationsStore, EventEmitter, IAnimationOption, ILoadAnimationOptions, IResources, IResourcesManagerEvent, IResourcesStore, Images, Rect, Resources, SparkleEngine, Texture } from "../main";
import { AltasTexture } from "../video/texture/texture";

/**
 * 资源管理器
 */
class ResourcesManager extends EventEmitter<IResourcesManagerEvent>  {
    /** 所有资源 */
    assets: IResourcesStore = {}
    private loadingAssets: { [key: string]: Promise<IResources> } = {}
    private currectRegion: number = -1
    private regions: { [key: string]: number } = {}
    private engine: SparkleEngine
    private regionsCallback: { [key: string]: () => void } = {}
    private regionsCount: number = 0

    constructor(engine: SparkleEngine) {
        super()
        this.engine = engine
    }
    private getRegion() {
        return this.regionsCount++
    }
    /**
     * 加载一个纹理
     * @param id 资源id
     * @param data 可以是字符串（从url加载）或者是图片数据
     * @returns 返回的纹理
     */
    async loadTexture(id: string, data: string | Images) {
        if (typeof data === "string") {
            // 如果数据是字符串证，从url加载
            return await this.load(id, this.engine.texture.textureFromUrl(data))
        } else {
            this.assets[id] = this.engine.texture.textureFromImage(data as Images)
            return this.assets[id] as Texture
        }
    }
    /**
     * 加载一个裁剪纹理
     * @param id 资源id
     * @param textureId 纹理
     * @param rect 裁剪的矩形
     * @returns 返回的纹理
     */
    async loadAltasTexture(id: string, textureId: string, rect?: Rect) {
        const load = async () => {
            const r = await this.getAsyncAssets(textureId)
            if (r instanceof Texture) {
                this.assets[id] = this.engine.texture.altasFromTexture(r, rect)
                return this.assets[id] as AltasTexture
            } else {
                throw new Error(`assets ${textureId} is not a texture`);
            }
        }
        return await this.load(id, load())
    }
    /**
     * 加载一个音频
     * @param id 音频id
     * @param url 音频url
     * @returns 
     */
    async loadAudio(id: string, url: string) {
        return await this.load(id, this.engine.audio.audioFromUrl(url))
    }
    /**
     * 加载一个动画资源
     * @param id 资源
     * @param textureId 纹理id 
     * @param options 动画数据
     * @returns 
     */
    async loadAnimation(id: string, textureId: string, options: ILoadAnimationOptions) {
        const load = async () => {
            const r = await this.getAsyncAssets(textureId)
            if (r instanceof Texture) {
                let ani: AnimationsStore = {}
                if (typeof options.animations === "string") {
                    const json = await this.getAsyncAssets(options.animations) as DataResources
                    ani = json.data as AnimationsStore
                } else {
                    ani = options.animations
                }
                const createOptions: IAnimationOption = {
                    ...options,
                    texture: r,
                    animations: ani
                }
                this.assets[id] = new Animations(createOptions)
                return this.assets[id] as Animations
            } else {
                throw new Error(`assets ${textureId} is not a texture`);
            }
        }
        return await this.load(id, load())
    }
    /**
     * 加载一个JSON
     * @param id 资源id
     * @param url 资源url
     * @returns 
     */
    async loadJSON(id: string, url: string) {
        return await this.load(id, this.engine.loader.loadData(url))
    }
    private async load<T extends IResources>(id: string, p: Promise<T>): Promise<T> {

        const inRegion = this.currectRegion !== -1
        const region = this.currectRegion
        this.loadingAssets[id] = p

        if (inRegion) this.regions[region]++
        const r = await p
        r.resourcesId = id
        delete this.loadingAssets[id]
        if (inRegion) this.regions[region]--
        if (inRegion && this.regions[region] == 0) {
            this.regionsCallback[region]()
        }
        this.emit("loaded", r)
        if (Object.keys(this.loadingAssets)) {
            this.emit("idle")
        }
        this.assets[id] = r
        return r
    }
    /**
     * 获取某个资源
     * @param id 
     * @returns 
     */
    get<T extends IResources>(id: string): T {
        if (typeof this.assets[id] === "undefined") {
            throw new Error(`assets ${id} dose not exist`);
        }
        return this.assets[id] as T
    }

    private async getAsyncAssets(id: string) {
        const assets = this.assets[id]
        if (assets) {
            return assets
        }
        const loadingAssets = this.loadingAssets[id]
        if (loadingAssets) {
            return loadingAssets
        } else {
            throw new Error(`Assets ${id} dose not exsit`);
        }
    }
    /**
     * 一般不会用到
     * 创建一个加载区域，可以监听该区域所有资源加载完成
     * @returns 
     */
    startRegion() {
        this.currectRegion = this.getRegion()
        this.regions[this.currectRegion] = 0
    }
    /**
     * 一般不会用到
     * 结束加载区域，可以监听该区域所有资源加载完成
     * @returns 
     */
    endRegion(fn: () => void) {
        this.regionsCallback[this.currectRegion] = fn
        if (this.regions[this.currectRegion] == 0) {
            // 没有任何
            fn()
        }
        this.currectRegion = -1
    }
}


/**
 * 加载器，注意：不会将加载的结果转化为游戏引擎封装
 * 比如{@link loadImage} 会直接返回 HTMLImageElement
 * 若想加载游戏引擎封装资源，请使用engine resource属性
 * {@link ResourcesManager}
 */
class Loader {
    engine: SparkleEngine
    baseUrl?: string

    constructor(engine: SparkleEngine, baseUrl?: string) {
        this.engine = engine
        this.baseUrl = baseUrl
    }
    /**
     * 加载一个数据
     * @param path 
     * @returns 
     */
    async loadData(path: string): Promise<DataResources> {
        const response = await fetch(this.baseUrl ? `${this.baseUrl}/${path}` : path)
        if (!response.ok) {
            throw new Error(`An error occurred while loading the data: ${response.statusText}`)
        }
        return new DataResources(await response.json())
    }
    /**
     * 加载一个音频
     * @param path 
     * @returns 
     */
    async loadAudio(path: string): Promise<AudioBuffer> {
        const response = await fetch(this.baseUrl ? `${this.baseUrl}/${path}` : path)
        if (!response.ok) {
            throw new Error(`An error occurred while loading the audio: ${response.statusText}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        return await this.engine.audio.decode(arrayBuffer)
    }
    /**
     * 加载一个图像
     * @param path 
     * @returns 
     */
    async loadImage(path: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image()
            image.onload = () => {
                resolve(image)
            }
            image.onerror = reject
            image.src = this.baseUrl ? `${this.baseUrl}/${path}` : path
        })
    }
}

/**
 * 数据资源，LoadJSON会创建该资源
 */
class DataResources<T = unknown> extends Resources {
    data: T
    constructor(data: T) {
        super()
        this.data = data
    }
}
export { Loader, ResourcesManager, DataResources }