import Container from "./container";
import { ITimerEvents, ITimerOptions } from "../interface"

/**
 * 计时器节点，有个`timeout`信号
 * timer必须在场景树里才会运行，若在场景树之外处于暂停状态
 * 若想让在场景树之外的timer同样保持运行，请手动调用update
 * ```js
 * onUpdate(dt){
 *      timer.update(dt)
 * }
 * ```
 * @category GameNode
 */
class Timer extends Container<ITimerEvents> {
    waitTime: number
    oneShot: boolean
    paused: boolean = false
    timeLeft: number
    private isStart: boolean = false
    constructor(options: ITimerOptions) {
        super(options)
        this.waitTime = options.waitTime
        this.oneShot = options.oneShot ?? false
        if (options.start) {
            this.start()
        }
        this.timeLeft = options.initTimeLeft ?? 0
    }
    update(dt: number): void {
        super.update(dt)
        if (this.isStart && !this.paused) {
            if (this.timeLeft > this.waitTime) {
                this.timeout()
                return
            }
            this.timeLeft += dt
        }
    }
    private timeout() {
        if (this.oneShot) {
            this.isStart = false
        }
        this.emit("timeout")
        this.timeLeft = 0
    }
    stop() {
        this.timeLeft = 0
        this.isStart = false
    }
    start() {
        this.timeLeft = 0
        this.isStart = true
    }
}

export default Timer