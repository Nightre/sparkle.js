
import { IPoolable } from "../interface"
import pool from "../system/pool"

/**
 * 矩形
 * @category Math
 */
class Rect implements IPoolable {
    /** 坐标x */
    x: number = 0
    /** 坐标y */
    y: number = 0
    /** 宽度 */
    w: number = 0
    /** 高度 */
    h: number = 0
    constructor(x: number, y: number, w: number, h: number) {
        this.poolReset(x, y, w, h)
    }
    /**
     * @ignore
     * @param x 
     * @param y 
     * @param w 
     * @param h 
     */
    poolReset(x = 0, y = 0, w = 0, h = 0): void {
        this.setRect(
            x, y, w, h
        )
    }
    /**
     * 直接设置矩形
     * @param x 
     * @param y 
     * @param w 
     * @param h 
     */
    setRect(x = this.x, y = this.y, w = this.w, h = this.h) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }
    /**
     * 裁剪 
     * @param r 
     * @param out 
     */
    clip(r: Rect, out?: Rect) {
        const d = [
            r.x + this.x,
            r.y + this.y,
            Math.min(this.w, r.w),
            Math.min(this.h, r.h)
        ]
        if (out) {
            out.setRect(...d)
        } else {
            this.setRect(...d)
        }
    }
    /**
     * 复制一个矩形到该矩形
     * @param c 
     */
    copy(c: Rect) {
        this.setRect(
            c.x, c.y, c.w, c.h
        )
    }
    /**
     * 克隆该矩形
     * @returns 
     */
    clone() {
        return pool.Rect.pull(this.x, this.y, this.w, this.h)
    }
}

export default Rect