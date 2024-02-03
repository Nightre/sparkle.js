import Container from "./nodes/container"
import { ObjectPool } from "./pool"
import { Renderer } from "./video/renderer"
import Color from "./math/color";
import Matrix from "./math/martix";
import Vector2 from "./math/vector";
import { ISparkleEngineOption } from "./interface";

class SparkleEngine {
    renderer: Renderer
    pool: ObjectPool

    root: Container

    /**
     * SparkleEngine 是一个轻量的游戏，易于上手
     * @example 
     * html
     * ```html
     * <canvas id="canvas" width="800" height="800"></canvas>
     * ```
     * js
     * ```js
     * const sparkle = new SparkleEngine({
     *      // 游戏 Canvas
     *      canvas: document.getElementById("canvas")
     * })
     * ```
     * @param options
     */
    constructor(options: ISparkleEngineOption) {
        this.pool = new ObjectPool();
        this.initPool();
        this.root = new Container({ engine: this });
        this.renderer = new Renderer(this, { ...options });
    }

    update(dt: number) {
        this.root.update(dt);
        this.root.postUpdate(dt);
    }

    initPool() {
        this.pool.register("Matrix", Matrix);
        this.pool.register("Color", Color);
        this.pool.register("Vector2", Vector2);
    }
}

export { SparkleEngine }