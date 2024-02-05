import { EventEmitter, IAudioEvent, SparkleEngine } from "../main";

/**
 * @category Audio
 */
class Audio extends EventEmitter<IAudioEvent> {
    private buffer: AudioBuffer;
    private source: AudioBufferSourceNode;
    private context: AudioContext;

    constructor(audioManager: AudioManager, buffer: AudioBuffer) {
        super()
        this.context = audioManager.context;
        this.buffer = buffer;
        this.source = this.context.createBufferSource();
        this.source.buffer = this.buffer;
    }

    play() {
        this.source.connect(this.context.destination);
        this.source.start(0);
        this.source.onended = () => {
            this.emit("onEnd");
        };
    }

    stop() {
        this.source.disconnect(this.context.destination);
        this.source.stop(0);
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