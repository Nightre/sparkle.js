import { ICopyable } from "../interface"
import { IPoolable } from "../interface"
import { ObjectPool } from "../pool"

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

    poolReset(x: number, y = x): void {
        this.set(x, y)
    }

    set(x: number, y = x) {
        this.x = x
        this.y = y
    }
    copy(obj: Vector2) {
        this.set(
            obj.x,
            obj.y
        )
    }
    clone(pool: ObjectPool) {
        return pool.pull(this.className, this.x, this.y) as Vector2
    }
}

export default Vector2