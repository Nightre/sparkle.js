import { ICollisionOptions, ICollisionResult, Transform2D, Vector2, ICollisionEvent, EventEmitter } from "../main";
import PhysicsManager from "../physics/physics";

/**
 * @category GameNode
 * @category Physics
 * @example 示例
 * ```
 * const collision = new Collision({
 *      shape: Collision.rectShape(0, 0, 12, 10)
 * })
 * collision.onBodyEnter=(res)=>{} // 其他物理体进入
 * collision.onBodyExit=(res)=>{} // 其他物理体离开
 * collision.onClick=()=>{} //被点击
 * // 以上上个均可以用事件连接
 * ```
 * 该节点的事件，请查看：{@link ICollisionEvent}
 */
class Collision extends Transform2D {
    shape: Vector2[] = []
    ShapePosition: Vector2[] = []
    physics: PhysicsManager
    results: ICollisionResult[] = []
    collisions: Collision[] = []
    shapeReady: boolean = false
    declare event: EventEmitter<ICollisionEvent>;

    constructor(options: ICollisionOptions) {
        super(options)
        this.setShape(options.shape ?? [])
        this.physics = this.engine.physics
        this.onEvent(this.engine.mouse, "onMouseUp", this.onMouseClick.bind(this))
        // 获取所有 Collision this.physics.getCollision(this)
    }
    update(dt: number): void {
        if (this.shapeReady) {
            const nowResults = this.collisionDetection()
            const nowCollisions: Collision[] = []

            nowResults.forEach((r) => {
                if (!this.collisions.includes(r.body)) {
                    this.onBodyEnter(r)
                    this.event.emit("onBodyEnter", r)
                }
                nowCollisions.push(r.body)
            })
            this.collisions.forEach((body) => {
                if (!nowCollisions.includes(body)) {
                    this.onBodyExit(body)
                    this.event.emit("onBodyExit", body)
                }
            })

            this.collisions = nowCollisions
            this.results = nowResults            
        }

        super.update(dt)
    }
    setShape(shape: Vector2[]) {
        this.clearShape()
        shape.forEach((v) => {
            this.shape.push(v.clone())
            this.ShapePosition.push(v.clone())
        })
        this.shapeReady = false
    }
    /**
     * 检测碰撞，一般不需要手动调用
     * @returns 
     */
    collisionDetection() {
        return this.physics.collisionDetection(this)
    }
    mouseDetection() {
        if (!this.isReady) {
            return false
        }
        return this.physics.satPointInPolygon(this.getMouseGlobalPositon(), this.ShapePosition)
    }
    /**
     * @ignore
     */
    exitTree(): void {
        super.exitTree()
        this.physics.remove(this)
    }
    /**
     * @ignore
     */
    enterTree(): void {
        super.enterTree()
        this.physics.add(this)
    }
    private onMouseClick() {
        if (this.mouseDetection()) {
            this.event.emit("onClick")
            this.onClick()
        }
    }
    onClick() { }
    onBodyEnter(_res: ICollisionResult) { }
    onBodyExit(_body: Collision) { }

    draw(): void {
        super.draw()
        const model = this.renderer.modelMatrix
        this.shape.forEach((v, index) => {
            const [x, y] = model.apply(v.x, v.y)
            this.ShapePosition[index].set(
                x, y
            )
        });
        this.shapeReady = true
    }

    flushDebug(): void {
        this.engine.debugger?.drawDebugCollision(
            this.shape
        )
        super.flushDebug()
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
    doDestory(): void {
        super.doDestory()
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