import { ICollisionOptions, IRect } from "../main";
import PhysicsManager from "../physics/physics";
import Container from "./container";

class Collision extends Container {
    shape: IRect
    physics: PhysicsManager
    constructor(options: ICollisionOptions) {
        super(options)
        this.shape = options.shape
        this.physics = this.engine.physics
        // 获取所有 Collision this.physics.getCollision(this)
    }
    collisionDetection(){
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
}

export default Collision