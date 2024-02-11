import { ICollisionOptions, Transform2D, Vector2 } from "../main";
import PhysicsManager from "../physics/physics";

/**
 * @category GameNode
 * @category Physics
 */
class Collision extends Transform2D {
    shape: Vector2[] = []
    ShapePosition: Vector2[] = []
    physics: PhysicsManager

    constructor(options: ICollisionOptions) {
        super(options)
        this.setShape(options.shape ?? [])
        this.physics = this.engine.physics
        this.onEvent(this.engine.mouse, "onMouseUp", this.onMouseClick.bind(this))
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
        return this.physics.collisionDetection(this)
    }
    mouseDetection() {
        if (!this.isReady) {
            return false
        }
        return this.physics.pointInPolygon(this.getMouseGlobalPositon(), this.ShapePosition)
    }
    exitTree(): void {
        super.exitTree()
        this.physics.remove(this)
    }
    enterTree(): void {
        super.enterTree()
        //this.onEvent(this.engine.mouse, "onMouseUp", this.onMouseClick.bind(this))
        this.physics.add(this)
    }
    private onMouseClick() {
        if (this.mouseDetection()) {
            this.onClick()
        }
    }
    onClick() { }
    draw(): void {
        super.draw()
        const model = this.renderer.modelMatrix
        this.shape.forEach((v, index) => {
            const [x, y] = model.apply(v.x, v.y)
            this.ShapePosition[index].set(
                x, y
            )
        });
    }
    drawDebug(): void {
        this.engine.debugger?.drawDebugCollision(
            this.shape
        )
        super.drawDebug()
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
    static rectShape(x: number, y: number, width: number, height: number) {
        return [
            new Vector2(x, y),
            new Vector2(x + width, y),
            new Vector2(x + width, y + height),
            new Vector2(x, y + height),
        ]
    }
}

export default Collision