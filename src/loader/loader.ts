import { SparkleEngine } from "../main";

class Loader {
    engine: SparkleEngine
    baseUrl?: string

    constructor(engine: SparkleEngine, baseUrl?: string) {
        this.engine = engine
        this.baseUrl = baseUrl
    }

    async loadData(path: string): Promise<any> {
        const response = await fetch(this.baseUrl ? `${this.baseUrl}/${path}` : path)
        if (!response.ok) {
            throw new Error(`An error occurred while loading the data: ${response.statusText}`)
        }
        return await response.json()
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

export default Loader