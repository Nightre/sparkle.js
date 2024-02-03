import { SparkleEngine } from "../main";

class Loader {
    engine: SparkleEngine
    baseUrl?: string

    constructor(engine: SparkleEngine, baseUrl?: string) {
        this.engine = engine
        this.baseUrl = baseUrl
    }

    async load(path: string): Promise<any> {
        const extension = path.split('.').pop()?.toLowerCase()

        switch (extension) {
            case 'json':
                return this.loadData(path)
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
                return this.loadImage(path)
            // TODO:完善音频
            // case 'mp3':
            // case 'wav':
            // case 'ogg':
            //     return this.loadAudio(path)
            default:
                throw new Error(`Unsupported file type: ${extension}`)
        }
    }

    async loadData(path: string): Promise<any> {
        const response = await fetch(this.baseUrl ? `${this.baseUrl}/${path}` : path)
        if (!response.ok) {
            throw new Error(`An error occurred while loading the data: ${response.statusText}`)
        }
        return await response.json()
    }
    // TODO:完善音频
    // async loadAudio(path: string): Promise<AudioBuffer> {
    //     const response = await fetch(this.baseUrl ? `${this.baseUrl}/${path}` : path)
    //     if (!response.ok) {
    //         throw new Error(`An error occurred while loading the audio: ${response.statusText}`)
    //     }
    //     const arrayBuffer = await response.arrayBuffer()
    //     return await this.engine.audioContext.decodeAudioData(arrayBuffer)
    // }

    async loadImage(path: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image()
            image.onload = () => resolve(image)
            image.onerror = reject
            image.src = this.baseUrl ? `${this.baseUrl}/${path}` : path
        })
    }
}

export default Loader