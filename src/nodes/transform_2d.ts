import Vector2 from "../math/vector";
import Container from "./container";
import { ITransform2DOptions } from "../interface"
import { Matrix } from "../main";


/**
 * 变换2D，是drawable的基类
 * @category GameNode
 */
class Transform2D extends Container {
    position?: Vector2;
    scale?: Vector2;
    rotation?: number;
    skew?: Vector2;
    offset?: Vector2;

    get global_position() {
        const [x, y] =
            this.modelMatrix.apply(this.position!.x, this.position!.y)
        return this.pool.Vector2.pull(x, y)
    }
    set global_position(v: Vector2) {
        const invert = this.modelMatrix.invert()
        const [x, y] = invert!.apply(v.x, v.y)
        this.position?.set(x, y)
    }

    get global_rotation() {
        return this.modelMatrix.getRotation()
    }
    set global_rotation(r: number) {
        const invert = this.modelMatrix.invert()
        this.rotation = r + invert!.getRotation()
    }
    getMouseLocalPositon() {
        return this.global_position.sub(this.engine.mouse.mousePosition, false)
    }
    modelMatrix: Matrix

    constructor(options: ITransform2DOptions) {
        super(options)
        this.modelMatrix = this.pool.Matrix.pull()
        this.position = options.position ?? this.pool.Vector2.pull(0, 0);
        this.scale = options.scale ?? this.pool.Vector2.pull(1, 1);
        this.skew = options.skew ?? this.pool.Vector2.pull(0, 0);
        this.offset = options.offset ?? this.pool.Vector2.pull(0, 0);
        this.rotation = options.rotation ?? 0;
    }


    draw() {
        super.draw()
        this.renderer.save()
        
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

        this.renderer.modelMatrix.translate(
            -this.offset!.x, -this.offset!.y
        );
        this.modelMatrix.copy(this.renderer.modelMatrix)
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

        this.scale = undefined;
        this.position = undefined;
        this.skew = undefined;
        this.offset = undefined;
    }
}

export default Transform2D