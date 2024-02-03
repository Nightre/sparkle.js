import { SparkleEngine } from "../engine";
import { IRenderOptions } from "../interface";
import Matrix from "../math/martix";
import Container from "../nodes/container";
import { ObjectPool } from "../pool";
import Compositor from "./compositors/compositors";
import TextureCompositors from "./compositors/texture_compositor";
import GLShader from "./glshader";
import getContext from "./utils/get_context";


class Renderer {
    canvas: HTMLCanvasElement

    gl: WebGLRenderingContext
    backgroundColor: number[] = [0, 0, 0]

    private compositors: Map<string, Compositor> = new Map

    currentCompositors!: Compositor
    currentShader!: GLShader

    projectionMatrix: Float32Array

    private matrixStack: Matrix[] = []
    modelMatrix: Matrix = new Matrix()

    engine: SparkleEngine
    pool: ObjectPool
    private root: Container

    constructor(engine: SparkleEngine, options: IRenderOptions) {
        this.engine = engine
        this.pool = engine.pool
        this.root = this.engine.root
        this.canvas = options.canvas
        this.gl = getContext(this.canvas, {
            alpha: true,
            antialias: options.antialias ?? false,
            stencil: true,
        })
        this.gl.enable(this.gl.SCISSOR_TEST)

        this.projectionMatrix = this.createOrthographicProjectionMatrix(
            0,
            this.width,
            this.height,
            0
        )

        this.addCompositors("texture", new TextureCompositors(this))
        this.setCompositors("texture")

        this.pool.register("Matrix", Matrix)
    }

    private createOrthographicProjectionMatrix(left: number, right: number, bottom: number, top: number): Float32Array {
        return new Float32Array([
            2 / (right - left), 0, 0, 0,
            0, 2 / (top - bottom), 0, 0,
            0, 0, -1, 0,
            -(right + left) / (right - left), -(top + bottom) / (top - bottom), 0, 1
        ]);
    }

    get height() {
        return this.canvas.height;
    }

    set height(value) {
        this.resize(this.width, value);
    }

    get width() {
        return this.canvas.width;
    }

    set width(value) {
        this.resize(value, this.height);
    }

    reset() {
        this.matrixStack.forEach((matrix) => {
            this.pool.push(matrix);
        });
        this.clear();
    }

    /**
     * 存储状态（入栈）
     */
    save() {
        this.matrixStack.push(this.modelMatrix.clone(this.pool))
    }
    /**
     * 退回上个保存的状态（出栈）
     */
    restore() {
        if (this.matrixStack.length > 0) {
            const matrix = this.matrixStack.pop()!;
            this.modelMatrix.copy(matrix)
            this.pool.push(matrix)
        }
    }

    addCompositors(name: string, compositors: Compositor) {
        if (!this.compositors.has(name)) {
            this.compositors.set(name, compositors)
        }
    }

    setCompositors(compositorsName: string, shader?: GLShader) {
        const compositors = this.compositors.get(compositorsName)
        if (compositors && (this.currentCompositors !== compositors || shader !== this.currentShader)) {
            this.currentCompositors = compositors
            compositors.bind(shader)
        }
    }

    useShader(shader: GLShader) {
        this.currentShader = shader
        shader.bind()
    }

    clear() {
        const gl = this.gl
        gl.clearColor(0.5, 0.5, 0.5, 1)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    }

    resize(width: number, height: number) {
        const canvas = this.canvas
        if (width !== canvas.width || height !== canvas.height) {
            canvas.width = width;
            canvas.height = height;
        }
    }

    draw() {
        this.clear()
        this.root.draw()
        this.root.postDraw()
    }
}

export { Renderer }