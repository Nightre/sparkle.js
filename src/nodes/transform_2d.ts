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
    // TODO: 现在Global Position 都是上一帧的

    get globalPosition() {
        const [x, y] =
            this.modelMatrix.apply(0, 0)
        return this.pool.Vector2.pull(x, y)
    }
    setGlobalPosition(v: Vector2) {
        const invert = this.beforeModelMatrix.invert()
        const [x, y] = invert!.apply(v.x, v.y)
        this.position?.set(x, y)
    }

    get globalRotation() {
        return this.modelMatrix.getRotation()
    }
    setGlobalRotation(r: number) {
        const invert = this.modelMatrix.invert()
        this.rotation = r + invert!.getRotation()
    }
    getMouseLocalPositon() {
        return this.globalPosition.sub(this.engine.mouse.mousePosition, false)
    }
    modelMatrix: Matrix
    beforeModelMatrix: Matrix

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
        this.renderer.modelMatrix.scale(
            this.scale!.x, this.scale!.y
        );

        this.renderer.modelMatrix.skew(
            this.skew!.x, this.skew!.y
        );

        this.modelMatrix.copy(this.renderer.modelMatrix)
        this.renderer.modelMatrix.translate(
            -this.offset!.x, -this.offset!.y
        );
    }
    drawDebug(){
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

    destory() {
        super.destory()
        this.pool.Vector2.push(this.position!);
        this.pool.Vector2.push(this.scale!);
        this.pool.Vector2.push(this.skew!);
        this.pool.Vector2.push(this.offset!);
        this.pool.Matrix.push(this.modelMatrix!);
    }
}

export default Transform2D