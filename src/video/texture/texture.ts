import { Images, Rect, SparkleEngine } from "../../main"
import pool from "../../system/pool"
import { createTexture } from "../utils/texture"
import Resources from "../../loader/resources"

/**
 * @category Texture
 */
export class TextureManager {
    engine: SparkleEngine
    baseTextures: Map<string, BaseTexture> = new Map
    constructor(engine: SparkleEngine) {
        this.engine = engine
    }
    /**
     * 创建纹理
     * @param image 
     * @returns 
     */
    textureFromImage(image: Images) {
        return new Texture(this.createBaseTexture(image))
    }
    /**
     * 创建裁剪纹理
     * @param texture 
     * @param rect 
     * @returns 
     */
    altasFromTexture(texture: Texture, rect?: Rect) {
        return new AltasTexture(texture.baseTexture!, rect)
    }
    /**
     * 从url加载纹理
     * @param url 
     * @returns 
     */
    async textureFromUrl(url: string) {
        const old = this.baseTextures.get(url)
        if (old) {
            return new Texture(old)
        } else {
            const image = await this.engine.loader.loadImage(url)
            return new Texture(this.createBaseTexture(image))
        }
    }

    /**
     * 通常不会用到该方法，用于创建一个基础纹理: {@link BaseTexture}
     * @param image 
     * @returns 
     */
    createBaseTexture(image: Images) {
        return new BaseTexture(this.engine, image)
    }
}

/**
 * 基础纹理，包含一个 WebGLTexture， 由 {@link Texture} 使用
 * 通常情况下不会用到该类型，但请勿直接实例化该类，可使用 {@link SparkleEngine.texture} 使用
 * @category Texture
 */
export class BaseTexture {
    texture!: WebGLTexture
    width!: number
    height!: number
    source: Images
    engine: SparkleEngine
    constructor(engine: SparkleEngine, image: Images, text: boolean=false) {
        this.source = image
        this.engine = engine
        this.setImage(image, text)
    }
    /**
     * 重新设置纹理
     * @param image 
     */
    setImage(image: Images, text: boolean = false) {
        const engine = this.engine;
        this.texture = createTexture(engine.renderer.gl, image, engine.renderer.antialias, text);
        this.width = image.width;
        this.height = image.height;
    }
}
/**
 * 普通的纹理
 * @category Texture
 */
export class Texture extends Resources {
    /**
     * @ignore
     */
    baseTexture: BaseTexture | null
    get width() {
        return this.baseTexture?.width ?? 0
    }
    get height() {
        return this.baseTexture?.height ?? 0
    }
    constructor(baseTexture: BaseTexture) {
        super()
        this.baseTexture = baseTexture
    }
}
/**
 * 裁剪区域纹理
 * @category Texture
 */
export class AltasTexture extends Texture {
    /**
     * 裁剪区域
     */
    region: Rect = pool.Rect.pull()

    get width() {
        return this.region.w
    }
    get height() {
        return this.region.h
    }
    constructor(baseTexture: BaseTexture, region?: Rect) {
        super(baseTexture)
        if (region) {
            this.region.copy(region!)
        }
    }
}
