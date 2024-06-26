import { ICopyable } from "../interface"
import { IPoolable } from "../interface"
import pool from "../system/pool"

/**
 * 2D向量
 * @category Math
 */
class Vector2 implements IPoolable, ICopyable<Vector2> {
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
    sub(v: Vector2, create: boolean = false) {
        const [x, y] = [this.x - v.x, this.y - v.y]
        if (!create) {
            this.set(x, y)
            return this
        }
        return pool.Vector2.pull(x, y)
    }
    add(v: Vector2, create: boolean = false) {
        const [x, y] = [this.x + v.x, this.y + v.y]
        if (!create) {
            this.set(x, y)
            return this
        }
        return pool.Vector2.pull(x, y)
    }
    mul(scalar: number, create: boolean = false): Vector2 {
        const [x, y] = [this.x * scalar, this.y * scalar]
        if (!create) {
            this.set(x, y)
            return this
        }
        return pool.Vector2.pull(x, y)
    }
    div(scalar: number, create: boolean = false): Vector2 {

        const [x, y] = [this.x / scalar, this.y / scalar]
        if (!create) {
            this.set(x, y)
            return this
        }
        return pool.Vector2.pull(x, y)
    }
    unit(create: boolean = false): Vector2 {
        const mag = this.magnitude;
        return this.div(mag, create);
    }
    normal(create: boolean = false): Vector2 {
        const [x, y] = [-this.y, this.x]
        if (!create) {
            this.set(x, y)
            return this
        }
        return pool.Vector2.pull(x, y)
    }
    scale(scalar: number, create: boolean = false): Vector2 {
        return this.mul(scalar, create);
    }

    static lerp(v1: Vector2, v2: Vector2, t: number): Vector2 {
        const x = v1.x + t * (v2.x - v1.x);
        const y = v1.y + t * (v2.y - v1.y);
        return pool.Vector2.pull(x, y);
    }
    static fromAngle(angle: number): Vector2 {
        return new Vector2(Math.cos(angle), Math.sin(angle));
    }
    static get DOWN() {
        return new Vector2(0, -1)
    }
    static get UP() {
        return new Vector2(0, -1)
    }
    static get LEFT() {
        return new Vector2(1, 0)
    }
    static get RIGHT() {
        return new Vector2(-1, 0)
    }
    static get ZERO(){
        return new Vector2(0, 0)
    }
}

export default Vector2