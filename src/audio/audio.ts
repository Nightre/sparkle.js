import { EventEmitter, IAudioEvent, IEventAble, Resources, SparkleEngine } from "../main";

/**
 * @category Audio
 */
class Audio extends Resources implements IEventAble<IAudioEvent>  {

    event: EventEmitter<IAudioEvent> = new EventEmitter
    private buffer: AudioBuffer;
    private context: AudioContext;
    private source?: AudioBufferSourceNode
    constructor(audioManager: AudioManager, buffer: AudioBuffer) {
        super()
        this.context = audioManager.context;
        this.buffer = buffer;
    }
    /**
     * 播放音频
     * @param when 开始时间 
     * @returns 
     */
    play(when: number = 0) {
        this.source = this.context.createBufferSource();
        const source = this.source
        source.buffer = this.buffer;
        source.connect(this.context.destination);
        source.start(when);
        source.onended = () => {
            this.event.emit("onEnd");
            source.disconnect(this.context.destination);
            this.source = undefined
        };
        return source
    }
}



/**
 * @category Audio
 */
class AudioManager {
    context: AudioContext
    engine: SparkleEngine
    constructor(engine: SparkleEngine) {
        this.engine = engine
        this.context = new AudioContext();
    }
    async audioFromUrl(url: string) {
        const buffer = await this.engine.loader.loadAudio(url)
        return new Audio(this, buffer)
    }
    decode(audio: ArrayBuffer) {
        return this.context.decodeAudioData(audio)
    }
}

export default AudioManager
export { Audio }