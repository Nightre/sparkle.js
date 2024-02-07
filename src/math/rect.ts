
import { IPoolable, IRect } from "../interface"
import pool from "../system/pool"

class Rect implements IRect, IPoolable {
    x!: number
    y!: number
    w!: number
    h!: number
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