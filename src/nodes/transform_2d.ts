import Vector2 from "../math/vector";
import Container from "./container";
import { ITransform2DOptions } from "../interface"
import { Matrix } from "../main";


/**
 * 变换2D，是drawable的基类
 * @category GameNode
 */
class Transform2D extends Container {
    /** 坐标，坐标是相对于父的。若要设置全局坐标，请使用{@link globalPosition} */
    position: Vector2;
    /** 缩放，缩放同样是相对父的 */
    scale: Vector2;
    /** 旋转，旋转是相对于父的。若要设置全局旋转，请使用{@link globalRotation}  */
    rotation: number;
    /** 斜切 */
    skew: Vector2;
    /** 偏移 */
    offset: Vector2;

    /** 
     * 全局坐标 
     * @readonly
     */
    globalPosition: Vector2 = this.pool.Vector2.pull(0, 0)
    /** 
     * 全局旋转 
     * @readonly
     */
    globalRotation: number = 0

    private modelMatrix: Matrix

    // setGlobalPosition(v: Vector2) {
    //     const invert = this.beforeModelMatrix.invert()
    //     const [x, y] = invert!.apply(v.x, v.y)
    //     this.globalPosition.set(x, y)
    //     this.position?.set(x, y)
    // }
    // setGlobalRotation(r: number) {
    //     const invert = this.beforeModelMatrix.invert()
    //     this.globalRotation = r
    //     this.rotation = r + invert!.getRotation()
    // }
    /**
     * 获取鼠标相对于我的位置
     * @returns 
     */
    getMouseLocalPositon() {
        return this.globalPosition.sub(this.engine.mouse.mousePosition, true)
    }
    /**
     * 获取鼠标的全局位置
     * @returns 
     */
    getMouseGlobalPositon() {
        return this.engine.mouse.mousePosition
    }

    constructor(options: ITransform2DOptions) {
        super(options)
        this.modelMatrix = this.pool.Matrix.pull()

        this.position = options.position ?? this.pool.Vector2.pull(0, 0);
        this.scale = options.scale ?? this.pool.Vector2.pull(1, 1);
        this.skew = options.skew ?? this.pool.Vector2.pull(0, 0);
        this.offset = options.offset ?? this.pool.Vector2.pull(0, 0);
        this.rotation = options.rotation ?? 0;
    }

    /**
     * @ignore
     */
    draw() {
        super.draw()
        this.renderer.save()

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
        this.renderer.toDraw.push(this)
    }
    flush(){
        this.renderer.modelMatrix.copy(this.modelMatrix)
        this.flushDebug()
    }
    /**
     * @ignore
     */
    flushDebug() {
        this.engine.debugger?.addDebugCross()
    }
    /**
     * @ignore
     */
    postDraw(): void {
        super.postDraw();
        this.renderer.restore();
    }
    /**
     * @ignore
     */
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