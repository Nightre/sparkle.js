import { Rect } from "../main";
import pool from "../system/pool";
import Vector2 from "./vector";

/**
 * 表示一个路径
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
    rectPath(r: Rect) {
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

    forEachLine(fn: (start: Vector2, end: Vector2) => void) {
        for (let index = 0; index < this.path.length; index += 2) {
            fn(
                this.path[index],
                this.path[index + 1],
            )
        }
    }
    forEachPoint(fn: (point: Vector2, i: number) => void) {
        this.path.forEach((p, index) => {
            if (index % 2 == 1) {
                fn(p, index)
            }
        })
    }
    circlePath(radius: number) {
        let first = true;
        // TODO: 或许需要修改
        const segments = Math.max(100, radius * 5 + 10);
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * 2 * Math.PI;
            const dx = radius * Math.cos(theta);
            const dy = radius * Math.sin(theta);
            if (first) {
                this.moveTo(dx, dy)
                first = false
            }
            this.lineTo(dx, dy);
        }
    }
    polygonPath(path: Vector2[]) {
        this.moveTo(path[0].x, path[0].y)
        path.forEach((v) => {
            this.lineTo(v.x, v.y)
        })
        this.lineTo(path[0].x, path[0].y)
    }
}

export default Path