
import { IPoolable } from "../interface"
import pool from "../system/pool"

class Rect implements IPoolable {
    x: number = 0
    y: number = 0
    w: number = 0
    h: number = 0
    className: string = "Rect"
    constructor(x: number, y: number, w: number, h: number) {
        this.poolReset(x, y, w, h)
    }

    poolReset(x = 0, y = 0, w = 0, h = 0): void {
        this.setRect(
            x, y, w, h
        )
    }
    setRect(x = this.x, y = this.y, w = this.w, h = this.h) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }
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
    copy(c: Rect) {
        this.setRect(
            c.x, c.y, c.w, c.h
        )
    }
    clone() {
        return pool.Rect.pull(this.x, this.y, this.w, this.h)
    }
}

export default Rect