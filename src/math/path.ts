import { IRect } from "../main";
import pool from "../system/pool";
import Vector2 from "./vector";

/**
 * @category Math
 */
class Path {
    private startPoint: Vector2 = pool.Vector2.pull(0)
    path: Vector2[] = []
    fistStack: boolean[] = []
    firstPoint: boolean = true

    moveTo(x: number, y: number) {
        this.firstPoint = true
        this.startPoint.set(x, y)
    }

    lineTo(x: number, y: number) {
        // firstPoint
        this.path.push(this.startPoint.clone())
        this.path.push(pool.Vector2.pull(x, y))
        this.fistStack.push(this.firstPoint)
        this.fistStack.push(false)
        this.firstPoint = false
        this.startPoint.set(x, y)
    }
    rectPath(r: IRect) {
        this.moveTo(r.x, r.y)
        this.lineTo(r.x + r.w, r.y)
        this.lineTo(r.x + r.w, r.y + r.h)
        this.lineTo(r.x, r.y + r.h)
        this.lineTo(r.x, r.y)
    }

    beginPath() {
        this.startPoint.set(0)
        this.firstPoint = true
        this.clearPath()
    }

    clearPath() {
        this.path.forEach((v: Vector2) => {
            pool.Vector2.push(v)
        })
        this.path = []
        this.fistStack = []
    }

    forEachLine(fn: (start: Vector2, end: Vector2, nextStart?: Vector2, nextEnd?: Vector2) => void) {
        for (let index = 0; index < this.path.length; index += 2) {
            let nextStart: undefined | Vector2
            let nextEnd: undefined | Vector2

            if (this.fistStack[index + 2] === false) {
                nextStart = this.path[index + 2]
                nextEnd = this.path[index + 3]
            }

            fn(
                this.path[index],
                this.path[index + 1],
                nextStart,
                nextEnd,
            )
        }
    }
    forEachPoint(fn: (point: Vector2, i: number) => void) {
        this.path.forEach(fn)
    }
}

export default Path