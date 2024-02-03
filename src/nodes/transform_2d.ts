import Vector2 from "../math/vector";
import Container from "./container";
import { ITransform2DOptions } from "../interface"


/**
 * 变换2D，是drawable的基类
 * @category GameNode
 */
class Transform2D extends Container {
    position?: Vector2;
    scale?: Vector2;
    rotation?: number;
    skew?: Vector2;

    // TODO:
    // get global_position() {

    // }
    // set global_position(v) {

    // }

    // get global_scale() {

    // }
    // set global_scale(v) {

    // }

    // get global_rotation() {

    // }
    // set global_rotation(v) {

    // }

    // get global_skew() {

    // }
    // set global_skew(v) {

    // }

    constructor(options: ITransform2DOptions) {
        super(options)
        this.position = options.position ?? this.pool.pull("Vector2", 0, 0);
        this.scale = options.scale ?? this.pool.pull("Vector2", 1, 1);
        this.skew = options.skew ?? this.pool.pull("Vector2", 0, 0);
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
    }

    postDraw(): void {
        super.postDraw();

        this.renderer.restore();
    }

    destory() {
        super.destory()
        this.pool.push(this.position!);
        this.pool.push(this.scale!);
        this.pool.push(this.skew!);

        this.scale = undefined;
        this.position = undefined;
        this.skew = undefined;
    }
}

export default Transform2D