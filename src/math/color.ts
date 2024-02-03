import { ICopyable } from "../interface";
import { IPoolable } from "../interface";
import pool from "../system/pool";

/**
 * 颜色
 * @category Math
 */
class Color implements IPoolable, ICopyable<Color> {
    className = "Color"

    r: number = 0
    g: number = 0
    b: number = 0
    alpha: number = 0

    constructor(r = 0, g = 0, b = 0, alpha = 1) {
        this.poolReset(r, g, b, alpha)
    }
    poolReset(r = 0, g = 0, b = 0, alpha = 1): void {
        this.setColor(
            r, g, b, alpha
        )
    }
    setColor(r: number, g: number, b: number, alpha: number = 1) {
        this.r = r
        this.g = g
        this.b = b
        this.alpha = alpha
    }
    copy(c: Color) {
        this.setColor(
            c.r, c.g, c.b, c.alpha
        )
    }
    clone() {
        return pool.Color.pull(this.r, this.g, this.b, this.alpha)
    }
    equals(color: Color) {
        return color.r == this.r &&
            color.g == this.g &&
            color.b == this.b &&
            color.alpha == this.alpha
    }
}

export default Color