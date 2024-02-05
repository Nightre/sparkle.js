import { ICollisionOptions, IRect, Transform2D } from "../main";
import PhysicsManager from "../physics/physics";

class Collision extends Transform2D {
    shape: IRect
    physics: PhysicsManager
    constructor(options: ICollisionOptions) {
        super(options)
        this.shape = options.shape
        this.physics = this.engine.physics
        // 获取所有 Collision this.physics.getCollision(this)
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
        if (this.engine.debugger) {
            const { x, y } = this.position!
            const [sx, sy] = this.renderer.modelMatrix.apply(x + this.shape.x, y + this.shape.y)
            const [ex, ey] = this.renderer.modelMatrix.apply(x + this.shape.x + this.shape.w, y + this.shape.y + this.shape.h)
            this.engine.debugger?.addDebugCollisionFrame({
                x: sx, y: sy, w: ex - sx, h: ey - sy
            })
        }
    }
}

export default Collision