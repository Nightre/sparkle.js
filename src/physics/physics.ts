import { SparkleEngine } from "../engine";
import { ICollisionResult, Vector2 } from "../main";
import Collision from "../nodes/collision"

//TODO: 使用四叉树，BVH 等优化
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
    reset(){
        this.physicsObjects.clear()
    }
    collisionDetection(c: Collision): ICollisionResult[] {
        const res: ICollisionResult[] = []

        this.physicsObjects.forEach((collision) => {
            if (collision != c) {
                let r = this.SATCollision(collision.ShapePosition, c.ShapePosition)
                if (r) {
                    res.push({
                        overlap: r,
                        body: collision
                    })
                }
            }

        })
        return res
    }
    /**
     * 
     * @param poly1 
     * @param poly2 
     * @returns overlap 向量
     */
    SATCollision(poly1: Vector2[], poly2: Vector2[]): Vector2 | null {
        let overlap = Infinity; // 保存最小重叠量
        let smallestAxis: Vector2 | null = null; // 保存导致最小重叠的轴
    
        // 合并两个多边形的所有边来获取所有可能的轴
        const axes = this.getAxes(poly1).concat(this.getAxes(poly2));
        for (const axis of axes) {
            // 投影两个多边形到轴上
            const projection1 = this.project(poly1, axis);
            const projection2 = this.project(poly2, axis);
    
            // 检查投影是否重叠
            if (!this.overlap(projection1, projection2)) {
                return null; // 如果有一个轴没有重叠，那么多边形不相交
            } else {
                // 计算重叠量，并更新最小重叠和最小轴
                const o = this.overlapMagnitude(projection1, projection2);
                if (o < overlap) {
                    overlap = o;
                    smallestAxis = axis;
                }
            }
        }
    
        // 如果存在碰撞，计算并返回最小平移向量
        if (smallestAxis) {
            const d = this.getPolygonCenter(poly1).sub(this.getPolygonCenter(poly2), false);
            if (d.dot(smallestAxis) > 0) {
                smallestAxis = smallestAxis.mul(-1);
            }
            return smallestAxis.unit(false).mul(overlap);
        }
    
        return null;
    }
    
    // Helper methods
    getAxes(poly: Vector2[]): Vector2[] {
        let axes = [];
        for (let i = 0; i < poly.length; i++) {
            const p1 = poly[i];
            const p2 = poly[(i + 1) % poly.length]; // Loop back to the first vertex
            const edge = p1.sub(p2, false);
            axes.push(edge.normal(false).unit(false)); // Add the normal of the edge to the axes
        }
        return axes;
    }
    pointInPolygon(point: Vector2, poly: Vector2[]): boolean {
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const xi = poly[i].x, yi = poly[i].y;
            const xj = poly[j].x, yj = poly[j].y;
    
            const intersect = ((yi > point.y) !== (yj > point.y))
                && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }
    project(poly: Vector2[], axis: Vector2): [number, number] {
        let min = Infinity;
        let max = -Infinity;
        for (const p of poly) {
            const dotProduct = p.dot(axis);
            if (dotProduct < min) min = dotProduct;
            if (dotProduct > max) max = dotProduct;
        }
        return [min, max];
    }
    
    overlap([minA, maxA]: [number, number], [minB, maxB]: [number, number]): boolean {
        return minA <= maxB && minB <= maxA;
    }
    
    overlapMagnitude([minA, maxA]: [number, number], [minB, maxB]: [number, number]): number {
        return Math.min(maxA, maxB) - Math.max(minA, minB);
    }
    
    getPolygonCenter(poly: Vector2[]): Vector2 {
        let centerX = 0, centerY = 0;
        poly.forEach(p => {
            centerX += p.x;
            centerY += p.y;
        });
        return new Vector2(centerX / poly.length, centerY / poly.length);
    }
    
}


export default PhysicsManager