import { ICollisionOptions, ICollisionResult, Transform2D, Vector2, ICollisionEvent, EventEmitter } from "../main";
import PhysicsManager from "../physics/physics";

/**
 * @category GameNode
 * @category Physics
 */
class Collision extends Transform2D {
    shape: Vector2[] = []
    ShapePosition: Vector2[] = []
    physics: PhysicsManager
    results: ICollisionResult[] = []
    collisions: Collision[] = []
    declare event: EventEmitter<ICollisionEvent>;
    
    constructor(options: ICollisionOptions) {
        super(options)
        this.setShape(options.shape ?? [])
        this.physics = this.engine.physics
        this.onEvent(this.engine.mouse, "onMouseUp", this.onMouseClick.bind(this))
        // 获取所有 Collision this.physics.getCollision(this)
    }
    update(dt: number): void {
        super.update(dt)
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
        this.physics.remove(this)
        super.exitTree()
        
    }
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