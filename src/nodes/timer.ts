import Container from "./container";
import { ITimerEvents, ITimerOptions } from "../interface"
import { EventEmitter } from "../main";

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
class Timer extends Container {
    /**
     * 计时器等待的时间
     */
    waitTime: number
    /**
     * 是否只触发一次
     * 如果为`true`会一直重复循环
     */
    oneShot: boolean
    /**
     * 是否暂停
     */
    paused: boolean = false
    /**
    * timer 剩余的时间（可以更改）
    */
    timeLeft: number
    private isStart: boolean = false
    declare event: EventEmitter<ITimerEvents>;
    constructor(options: ITimerOptions) {
        super(options)
        this.waitTime = options.waitTime
        this.oneShot = options.oneShot ?? false
        if (options.start) {
            this.start()
        }
        this.timeLeft = options.initTimeLeft ?? 0
    }
    /**
     * @ignore
     * @param dt 
     * @returns 
     */
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
        this.event.emit("timeout")
        this.timeLeft = 0
    }
    /**
     * 关闭
     */
    stop() {
        this.timeLeft = 0
        this.isStart = false
    }
    /**
     * 开启
     */
    start() {
        this.timeLeft = 0
        this.isStart = true
    }
}

export default Timer