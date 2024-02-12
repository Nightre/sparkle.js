import Vector2 from "../math/vector";
import Container from "./container";
import { ITransform2DOptions } from "../interface"
import { Matrix } from "../main";


/**
 * 变换2D，是drawable的基类
 * @category GameNode
 */
class Transform2D extends Container {
    position: Vector2;
    scale: Vector2;
    rotation: number;
    skew: Vector2;
    offset: Vector2;
    globalPosition: Vector2 = this.pool.Vector2.pull(0, 0)
    globalRotation: number = 0
    
    modelMatrix: Matrix
    beforeModelMatrix: Matrix

    setGlobalPosition(v: Vector2) {
        const invert = this.beforeModelMatrix.invert()
        console.log(
            this.beforeModelMatrix,
            this.renderer.lastMartix
        )

        const [x, y] = invert!.apply(v.x, v.y)
        this.globalPosition.set(x, y)
        this.position?.set(x, y)
    }
    setGlobalRotation(r: number) {
        const invert = this.beforeModelMatrix.invert()
        this.globalRotation = r
        this.rotation = r + invert!.getRotation()
    }
    getMouseLocalPositon() {
        return this.globalPosition.sub(this.engine.mouse.mousePosition, false)
    }
    getMouseGlobalPositon() {
        return this.engine.mouse.mousePosition
    }

    constructor(options: ITransform2DOptions) {
        super(options)
        this.modelMatrix = this.pool.Matrix.pull()
        this.beforeModelMatrix = this.pool.Matrix.pull()

        this.position = options.position ?? this.pool.Vector2.pull(0, 0);
        this.scale = options.scale ?? this.pool.Vector2.pull(1, 1);
        this.skew = options.skew ?? this.pool.Vector2.pull(0, 0);
        this.offset = options.offset ?? this.pool.Vector2.pull(0, 0);
        this.rotation = options.rotation ?? 0;
    }


    draw() {
        super.draw()
        this.renderer.save()
        this.beforeModelMatrix.copy(this.renderer.modelMatrix)
        this.renderer.modelMatrix.translate(
            this.position!.x, this.position!.y
        );

        this.renderer.modelMatrix.rotate(
            this.rotation!
        );
        this.globalRotation = this.renderer.modelMatrix.getRotation()

        this.renderer.modelMatrix.scale(
            this.scale!.x, this.scale!.y
        );

        this.renderer.modelMatrix.skew(
            this.skew!.x, this.skew!.y
        );

        
        const [x, y] = this.renderer.modelMatrix.apply(0, 0)
        this.globalPosition.set(x, y)
        this.modelMatrix.copy(this.renderer.modelMatrix)
        this.renderer.modelMatrix.translate(
            -this.offset!.x, -this.offset!.y
        );
    }
    drawDebug() {
        super.drawDebug()
        this.renderer.save()
        this.renderer.modelMatrix.copy(this.modelMatrix)
        this.engine.debugger?.addDebugCross()
        this.renderer.restore()
    }
    postDraw(): void {
        super.postDraw();

        this.renderer.restore();
    }

    doDestory() {
        super.doDestory()
        this.pool.Vector2.push(this.position!);
        this.pool.Vector2.push(this.scale!);
        this.pool.Vector2.push(this.skew!);
        this.pool.Vector2.push(this.offset!);
        this.pool.Matrix.push(this.modelMatrix!);
    }
}

export default Transform2D