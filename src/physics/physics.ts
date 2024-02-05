import { SparkleEngine } from "../engine";
import { ICollisionResult, Vector2 } from "../main";
import Collision from "../nodes/collision"

/**
 * TODO: 使用四叉树，BVH 等优化
 */
/**
 * @category Physics
 */
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
            let r = this.SATCollision(collision.ShapePosition, c.ShapePosition)
            if (r) {
                res.push({
                    overlap: r,
                    body: collision
                })
            }
        })
        return res
    }

    SATCollision(poly1: Vector2[], poly2: Vector2[]): Vector2 | null {
        let overlapMagnitude = Infinity;
        let smallestAxis: Vector2 | null = null;

        let axes = this.getAxes(poly1).concat(this.getAxes(poly2));

        for (let axis of axes) {
            let projection1 = this.project(poly1, axis);
            let projection2 = this.project(poly2, axis);

            if (!this.overlap(projection1, projection2)) {
                return null;
            } else {
                let o = this.overlapMagnitude(projection1, projection2);
                if (o < overlapMagnitude) {
                    overlapMagnitude = o;
                    smallestAxis = axis;
                }
            }
        }

        return smallestAxis!.mul(overlapMagnitude);
    }
    overlapMagnitude([min1, max1]: [number, number], [min2, max2]: [number, number]): number {
        return Math.min(max1, max2) - Math.max(min1, min2);
    }
    getAxes(poly: Vector2[]): Vector2[] {
        let axes = [];
        for (let i = 0; i < poly.length; i++) {
            let p1 = poly[i];
            let p2 = poly[i + 1 == poly.length ? 0 : i + 1];
            let edge = p1.sub(p2);
            axes.push(edge.normal());
        }
        return axes;
    }

    project(poly: Vector2[], axis: Vector2): [number, number] {
        let min = axis.dot(poly[0]);
        let max = min;
        for (let i = 1; i < poly.length; i++) {
            let p = axis.dot(poly[i]);
            if (p < min) {
                min = p;
            } else if (p > max) {
                max = p;
            }
        }
        return [min, max];
    }

    overlap([min1, max1]: [number, number], [min2, max2]: [number, number]): boolean {
        return !(min1 > max2 || max1 < min2);
    }
}


export default PhysicsManager