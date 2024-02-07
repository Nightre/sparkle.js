
import { IPoolable, IRect } from "../interface"
import pool from "../system/pool"

class Rect implements IRect, IPoolable {
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
    add(r: Rect, self: boolean = true){
        const d = [
            r.x + this.x,
            r.y + this.y,
            r.w,
            r.h
        ]
        if (self) {
            r.setRect(...d)
        }else{
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