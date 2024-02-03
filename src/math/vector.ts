import { ICopyable } from "../interface"
import { IPoolable } from "../interface"
import pool from "../system/pool"

/**
 * 2D向量
 * @category Math
 */
class Vector2 implements IPoolable, ICopyable<Vector2> {
    className = "Vector2"
    x: number = 0
    y: number = 0

    constructor(x: number, y = x) {
        this.poolReset(x, y)
    }

    get magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    set magnitude(value: number) {
        const dir = this.direction;
        this.x = Math.cos(dir) * value;
        this.y = Math.sin(dir) * value;
    }
    get direction(): number {
        return Math.atan2(this.y, this.x);
    }
    set direction(value: number) {
        const mag = this.magnitude;
        this.x = Math.cos(value) * mag;
        this.y = Math.sin(value) * mag;
    }

    poolReset(x: number, y = x): void {
        this.set(x, y)
    }

    set(x: number, y = x) {
        this.x = x
        this.y = y
        return this
    }
    copy(obj: Vector2) {
        this.set(
            obj.x,
            obj.y
        )
    }
    clone() {
        return pool.Vector2.pull(this.x, this.y)
    }
    dot(v: Vector2): number {
        return this.x * v.x + this.y * v.y;
    }
    cross(v: Vector2): number {
        return this.x * v.y - this.y * v.x;
    }
    sub(v: Vector2) {
        return pool.Vector2.pull(this.x - v.x, this.y - v.y)
    }
    add(v: Vector2) {
        return pool.Vector2.pull(this.x + v.x, this.y + v.y)
    }
    mul (scalar: number): Vector2 {
        return pool.Vector2.pull(this.x * scalar, this.y * scalar);
    }

    div(scalar: number): Vector2 {
        if (scalar === 0) throw new Error("Cannot divide by zero");
        return pool.Vector2.pull(this.x / scalar, this.y / scalar);
    }
}

export default Vector2