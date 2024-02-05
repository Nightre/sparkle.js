import { ICollisionOptions, Transform2D, Vector2 } from "../main";
import PhysicsManager from "../physics/physics";

/**
 * @category GameNode
 * @category Physics
 */
class Collision extends Transform2D {
    shape!: Vector2[]
    ShapePosition: Vector2[] = []
    physics: PhysicsManager
    constructor(options: ICollisionOptions) {
        super(options)
        this.setShape(options.shape)
        this.physics = this.engine.physics
        // 获取所有 Collision this.physics.getCollision(this)
    }
    setShape(shape: Vector2[]) {
        this.clearShape()
        shape.forEach((v) => {
            this.shape.push(v.clone())
            this.ShapePosition.push(v.clone())
        })
    }
    collisionDetection() {
        // TODO: 重要：矩阵
        return this.physics.collisionDetection(this)
    }

    exitTree(): void {
        super.exitTree()
        this.physics.remove(this)
    }
    enterTree(): void {
        super.enterTree()
        this.physics.add(this)
    }
    draw(): void {
        super.draw()
        const model = this.modelMatrix
        this.shape.forEach((v, index) => {
            const [x, y] = model.apply(v.x, v.y)
            this.ShapePosition[index].set(
                x, y
            )
        });
        if (this.engine.debugger) {

        }
    }
    clearShape() {
        this.ShapePosition.forEach((v) => {
            this.pool.Vector2.push(v)
        })
        this.shape.forEach((v) => {
            this.pool.Vector2.push(v)
        })
        this.shape = []
        this.ShapePosition = []
    }
    destory(): void {
        super.destory()
        this.clearShape()
    }
}

export default Collision