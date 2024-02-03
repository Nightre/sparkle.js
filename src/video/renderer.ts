import { SparkleEngine } from "../engine";
import { IRenderOptions } from "../interface";
import { SCALE_MODE, Vector2 } from "../main";
import Matrix from "../math/martix";
import Container from "../nodes/container";
import pool from "../system/pool";
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

    projectionMatrix!: Float32Array

    private matrixStack: Matrix[] = []
    modelMatrix: Matrix

    engine: SparkleEngine
    antialias: boolean
    private root: Container

    NativeSize: Vector2
    devicePixelRatio: number
    /**
     * 当canvas大小改变时的缩放策略
     * @default {@link SCALE_MODE.ADAPTIVE}
     */
    scaleMode: SCALE_MODE
    constructor(engine: SparkleEngine, options: IRenderOptions) {
        this.engine = engine
        this.root = this.engine.root
        this.canvas = options.canvas
        this.gl = getContext(this.canvas, {
            alpha: true,
            antialias: options.antialias ?? false,
            stencil: true,
        })
        this.antialias = options.antialias ?? false
        this.devicePixelRatio = options.pixelDensity ?? window.devicePixelRatio ?? 1
        this.NativeSize = pool.Vector2.pull(
            options.width ?? 300
            ,
            options.height ?? 300
        )
        this.scaleMode = options.scaleMode ?? SCALE_MODE.ADAPTIVE;
        this.setNativeSize()
        this.resize()
        this.modelMatrix = pool.Matrix.pull()
        this.addCompositors("texture", new TextureCompositors(this))
        this.setCompositors("texture")


        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                if (this.scaleMode == SCALE_MODE.ADAPTIVE) {
                    this.updateNativeSize(width, height);
                }
                this.resize()
            }
        });
        resizeObserver.observe(this.canvas);

    }

    private createOrthographicProjectionMatrix(left: number, right: number, bottom: number, top: number): Float32Array {
        return new Float32Array([
            2 / (right - left), 0, 0, 0,
            0, 2 / (top - bottom), 0, 0,
            0, 0, -1, 0,
            -(right + left) / (right - left), -(top + bottom) / (top - bottom), 0, 1
        ]);
    }
    reset() {
        this.matrixStack.forEach((matrix) => {
            pool.Matrix.push(matrix);
        });
        this.clear();
    }

    /**
     * 存储状态（入栈）
     */
    save() {
        this.matrixStack.push(this.modelMatrix.clone())
    }
    /**
     * 退回上个保存的状态（出栈）
     */
    restore() {
        if (this.matrixStack.length > 0) {
            const matrix = this.matrixStack.pop()!;
            this.modelMatrix.copy(matrix)
            pool.Matrix.push(matrix)
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

    updateNativeSize(width: number, height: number) {
        // 更新NativeSize为新的尺寸
        this.NativeSize.x = width / this.devicePixelRatio;
        this.NativeSize.y = height / this.devicePixelRatio;

        // 可能还需要重新计算投影矩阵
        this.setNativeSize();
    }

    setNativeSize() {
        const { x, y } = this.NativeSize

        this.projectionMatrix = this.createOrthographicProjectionMatrix(
            0, x, y, 0
        )
    }

    resize() {
        const canvas = this.canvas
        const { x, y } = this.NativeSize
        const pixelRatio = this.devicePixelRatio
        canvas.width = x * pixelRatio;
        canvas.height = y * pixelRatio;
        this.gl.viewport(0, 0, canvas.width, canvas.height)
    }

    draw() {
        this.clear()
        this.root.draw()
        this.root.postDraw()
    }
}

export { Renderer }