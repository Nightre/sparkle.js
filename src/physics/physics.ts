import { SparkleEngine } from "../engine";
import { ICollisionResult, IRect, Vector2 } from "../main";
import Collision from "../nodes/collision"
import pool from "../system/pool";
class PhysicsManager {
    engine: SparkleEngine
    private physicsObjects: Set<Collision> = new Set
    constructor(game: SparkleEngine) {
        this.engine = game
    }
    add(c: Collision) {
        this.physicsObjects.add(c)
    }
    remove(c: Collision) {
        this.physicsObjects.delete(c)
    }
    collisionDetection(c: Collision): ICollisionResult[] {
        const res: ICollisionResult[] = []
        this.physicsObjects.forEach((collision) => {
            let r = this.SATCollision(collision.shape, c.shape)
            if (r) {
                res.push({
                    overlap: r,
                    body: collision
                })
            }
        })
        return res
    }
    SATCollision(rect1: IRect, rect2: IRect): Vector2 | false {
        // 将IRect转换为Vector2的四个角
        const rectToVectors = (rect: IRect) => {
            const { x, y, w, h } = rect;
            return [
                pool.Vector2.pull(x, y),
                pool.Vector2.pull(x + w, y),
                pool.Vector2.pull(x, y + h),
                pool.Vector2.pull(x + w, y + h)
            ];
        };

        const vectors1 = rectToVectors(rect1);
        const vectors2 = rectToVectors(rect2);

        let overlap = Infinity;
        let smallestAxis = pool.Vector2.pull(0, 0);

        // 检查所有可能的分离轴
        for (let i = 0; i < 4; i++) {
            const axis = vectors1[i].sub(vectors1[(i + 1) % 4]).normal();
            let minA = Infinity, maxA = -Infinity;
            let minB = Infinity, maxB = -Infinity;

            // 对于每个矩形的所有角，投影到轴并更新最小和最大值
            [vectors1, vectors2].forEach((vectors, index) => {
                vectors.forEach(vector => {
                    const projection = vector.dot(axis);
                    if (index === 0) {
                        minA = Math.min(minA, projection);
                        maxA = Math.max(maxA, projection);
                    } else {
                        minB = Math.min(minB, projection);
                        maxB = Math.max(maxB, projection);
                    }
                });
            });

            // 如果存在分离轴，则返回false
            if (maxA < minB || maxB < minA) {
                return false;
            }

            // 计算重叠量，并检查是否比之前的轴小
            const overlapA = maxA - minB;
            const overlapB = maxB - minA;
            const currentOverlap = Math.min(overlapA, overlapB);

            if (currentOverlap < overlap) {
                overlap = currentOverlap;
                smallestAxis = axis;
            }
        }

        // 没有找到分离轴，所以矩形必须相交
        // 重叠向量
        const overlapV = smallestAxis.mul(overlap);
        return overlapV;
    }

    getCollisions(_c: Collision) {
        return this.physicsObjects
    }
}


export default PhysicsManager