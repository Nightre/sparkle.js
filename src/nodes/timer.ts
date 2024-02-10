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
    start: boolean

    timeLeft:number
    constructor(options: ITimerOptions) {
        super(options)
        this.waitTime = options.waitTime
        this.oneShot = options.oneShot ?? false
        this.start = options.start ?? true
        this.timeLeft = options.initTimeLeft ?? 0
    }
    update(dt: number): void {
        super.update(dt)
        if (this.start) {
            if (this.timeLeft > this.waitTime) {
                this.timeout()
                return
            }
            this.timeLeft += dt
        }
    }
    private timeout(){
        if (this.oneShot) {
            this.start = false
        }
        this.emit("timeout")
        this.timeLeft = 0
    }
    stop(){
        this.timeLeft = 0
        this.start = false
    }
}

export default Timer