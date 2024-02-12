import { Animations, AnimationsStore, EventEmitter, IAnimationOption, ILoadAnimationOptions, IResources, IResourcesManagerEvent, IResourcesStore, Images, Rect, ResourcesType, SparkleEngine, Texture } from "../main";
import { AltasTexture } from "../video/texture/texture";

class ResourcesManager extends EventEmitter<IResourcesManagerEvent>  {
    private loadingAssets: { [key: string]: Promise<IResources> } = {}
    assets: IResourcesStore = {}

    private engine: SparkleEngine
    constructor(engine: SparkleEngine) {
        super()
        this.engine = engine
    }

    async loadTexture(id: string, data: string | Images) {
        if (typeof data === "string") {
            // 如果数据是字符串证，从url加载
            return await this.load(id, this.engine.texture.textureFromUrl(data))
        } else {
            this.assets[id] = this.engine.texture.textureFromImage(data as Images)
            return this.assets[id] as Texture
        }
    }
    async loadAltasTexture(id: string, textureId: string, rect: Rect) {
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
    async loadAudio(id: string, url: string) {
        return await this.load(id, this.engine.audio.audioFromUrl(url))
    }
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
    async loadJSON(id: string, url: string) {
        return await this.load(id, this.engine.loader.loadData(url))
    }
    private async load<T extends IResources>(id: string, p: Promise<T>): Promise<T> {
        this.loadingAssets[id] = p
        const r = await p
        r.resourcesId = id
        delete this.loadingAssets[id]
        this.emit("loaded", r)
        if (Object.keys(this.loadingAssets)) {
            this.emit("idle")
        }
        this.assets[id] = r
        return r
    }
    get(id: string) {
        if (typeof this.assets[id] === "undefined") {
            console.log(this.assets[id], this.assets)
            throw new Error(`assets ${id} dose not exist`);
        }
        return this.assets[id]
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
}

class DataResources<T = unknown> implements IResources {
    resourcesId?: string | undefined;
    resourcesType = ResourcesType.DATA
    data: T
    constructor(data: T) {
        this.data = data
    }
}

class Loader {
    engine: SparkleEngine
    baseUrl?: string

    constructor(engine: SparkleEngine, baseUrl?: string) {
        this.engine = engine
        this.baseUrl = baseUrl
    }

    async loadData(path: string): Promise<DataResources> {
        const response = await fetch(this.baseUrl ? `${this.baseUrl}/${path}` : path)
        if (!response.ok) {
            throw new Error(`An error occurred while loading the data: ${response.statusText}`)
        }
        return new DataResources(await response.json())
    }

    async loadAudio(path: string): Promise<AudioBuffer> {
        const response = await fetch(this.baseUrl ? `${this.baseUrl}/${path}` : path)
        if (!response.ok) {
            throw new Error(`An error occurred while loading the audio: ${response.statusText}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        return await this.engine.audio.decode(arrayBuffer)
    }

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

export { Loader, ResourcesManager, DataResources as JSONResources }