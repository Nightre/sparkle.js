import { EventEmitter, IAudioEvent, SparkleEngine } from "../main";

/**
 * @category Audio
 */
class Audio extends EventEmitter<IAudioEvent> {
    private buffer: AudioBuffer;
    private context: AudioContext;

    constructor(audioManager: AudioManager, buffer: AudioBuffer) {
        super();
        this.context = audioManager.context;
        this.buffer = buffer;
    }

    play() {
        const source = this.context.createBufferSource();
        source.buffer = this.buffer;
        source.connect(this.context.destination);
        source.start(0);
        
        source.onended = () => {
            this.emit("onEnd");
            source.disconnect(this.context.destination);
        };
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