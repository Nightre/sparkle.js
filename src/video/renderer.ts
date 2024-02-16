import { SparkleEngine } from "../engine";
import { IRenderOptions } from "../interface";
import { Color, IDrawLineOptions, IDrawOptions, IDrawPolygonOptions, PRIMITIVE_MODE, SCALE_MODE, Transform2D, Vector2 } from "../main";
import Matrix from "../math/martix";
import Container from "../nodes/container";
import pool from "../system/pool";
import Compositor from "./compositors/compositors";
import TextureCompositors from "./compositors/texture_compositor";
import GLShader from "./glshader";
import getContext from "./utils/get_context";
import PrimitiveCompositors from "./compositors/primitive_compositor";
import Path from "../math/path";

/**
 * renderer 用于绘制所以能在屏幕上看见的东西
 */
class Renderer {
    /** 背景颜色 */
    backgroundColor: Color
    /** 当前状态的合成器 */
    currentCompositors!: Compositor
    /** 当前状态的shader  */
    currentShader!: GLShader
    /** 投影矩阵  */
    projectionMatrix!: Float32Array
    /** 当前状态的模型矩阵  */
    modelMatrix: Matrix
    /** 当前状态是否隐藏  */
    visable: boolean = true
    /** 是否开启抗锯齿 */
    antialias: boolean
    /** 用于绘制多边形或线条的Path，合成器使用 */
    path: Path = new Path
    /**
     * 当canvas大小改变时的缩放策略
     * @default {@link SCALE_MODE.ADAPTIVE}
     */
    scaleMode: SCALE_MODE
    /** 游戏的canvas */
    canvas: HTMLCanvasElement
    /** webgl 上下文 */
    gl: WebGLRenderingContext

    private engine: SparkleEngine
    /** 游戏有多少像素  */
    private nativeSize: Vector2
    devicePixelRatio: number
    /** 矩阵堆栈，用于记录状态 */
    private matrixStack: Matrix[] = []
    /** 显示堆栈，用于记录状态 */
    private visableStack: boolean[] = []
    /** 合成器存储  */
    private compositors: Map<string, Compositor> = new Map
    toDraw: Array<Transform2D> = []

    constructor(engine: SparkleEngine, options: IRenderOptions) {
        this.gl = getContext(options.canvas, {
            alpha: true,
            antialias: options.antialias ?? false,
            stencil: true,
        })
        const gl = this.gl
        // 初始化
        this.engine = engine
        this.canvas = options.canvas
        this.backgroundColor = options.backgroundColor ?? pool.Color.pull(0.6, 0.6, 0.6, 1)
        this.antialias = options.antialias ?? false
        this.devicePixelRatio = options.pixelDensity ?? window.devicePixelRatio ?? 1
        this.nativeSize = pool.Vector2.pull(
            options.width ?? 300
            ,
            options.height ?? 300
        )
        this.scaleMode = options.scaleMode ?? SCALE_MODE.ADAPTIVE;
        // 设置大小
        this.updateNativeSize()
        this.resize()
        // 初始胡投影矩阵
        this.modelMatrix = pool.Matrix.pull()
        // 添加合成器
        this.addCompositors("texture", new TextureCompositors(this))
        this.addCompositors("primitive", new PrimitiveCompositors(this))
        this.setCompositors("texture")
        // 开启透明
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // 监听canvas大小变化
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                if (this.scaleMode == SCALE_MODE.ADAPTIVE) {
                    this.setNativeSize(width, height);
                }
                this.resize()
            }
        });
        resizeObserver.observe(this.canvas);
    }

    /**
     * 获得矩阵堆栈的最后一个矩阵
     */
    get lastMartix() {
        const l = this.matrixStack.length
        if (l == 0) {
            return this.modelMatrix
        } else {
            return this.matrixStack[l]
        }
    }

    /**
     * 获取根节点
     */
    get root(): Container {
        return this.engine.root
    }

    /**
     * 创建投影矩阵
     * @param left 
     * @param right 
     * @param bottom 
     * @param top 
     * @returns 矩阵
     */
    private createOrthographicProjectionMatrix(left: number, right: number, bottom: number, top: number): Float32Array {
        return new Float32Array([
            2 / (right - left), 0, 0, 0,
            0, 2 / (top - bottom), 0, 0,
            0, 0, -1, 0,
            -(right + left) / (right - left), -(top + bottom) / (top - bottom), 0, 1
        ]);
    }

    /**
     * 重置清除所有状态堆叠
     */
    reset() {
        this.matrixStack.forEach((matrix) => {
            pool.Matrix.push(matrix);
        });
        this.visableStack = []
        this.clear();
    }

    /**
     * 存储当前状态（入栈）
     */
    save() {
        this.matrixStack.push(this.modelMatrix.clone())
        this.visableStack.push(this.visable)
    }
    /**
     * 退回上个保存的状态（出栈）
     */
    restore() {
        if (this.matrixStack.length > 0) {
            const matrix = this.matrixStack.pop()!;
            this.modelMatrix.copy(matrix)
            pool.Matrix.push(matrix)
            this.visable = this.visableStack.pop()!;
        }
    }

    /**
     * 添加一个合成器
     * @param name 
     * @param compositors 
     */
    addCompositors(name: string, compositors: Compositor) {
        if (!this.compositors.has(name)) {
            this.compositors.set(name, compositors)
        }
    }
    /**
     * 设置当前的合成器
     * @param compositorsName 合成器名称
     * @param shader 自定义shader
     */
    setCompositors(compositorsName: string, shader?: GLShader) {
        const compositors = this.compositors.get(compositorsName)
        if (compositors && (this.currentCompositors !== compositors || shader !== this.currentShader)) {
            // 判断是否需要切换，因为bind有一定开销
            this.currentCompositors = compositors
            compositors.bind(shader)
        }
    }

    /**
     * 设置当前使用的 shader
     * @param shader 
     */
    useShader(shader: GLShader) {
        this.currentShader = shader
        shader.bind()
    }

    /**
     * 使用 background 擦除
     */
    clear() {
        const gl = this.gl
        const bg = this.backgroundColor
        this.toDraw = []
        this.modelMatrix.identity()
        this.visable = true
        gl.clearColor(bg.r, bg.g, bg.b, bg.alpha)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    }

    /**
     * 更新 NativeSize
     * @param width 
     * @param height 
     */
    private setNativeSize(width: number, height: number) {
        // 更新NativeSize为新的尺寸
        this.nativeSize.x = width / this.devicePixelRatio;
        this.nativeSize.y = height / this.devicePixelRatio;

        // 可能还需要重新计算投影矩阵
        this.updateNativeSize();
    }

    /**
     * 设置 nativesize
     */
    private updateNativeSize() {
        const { x, y } = this.nativeSize

        this.projectionMatrix = this.createOrthographicProjectionMatrix(
            0, x, y, 0
        )
    }

    /**
     * 更新大小
     */
    private resize() {
        const canvas = this.canvas
        const { x, y } = this.nativeSize
        const pixelRatio = this.devicePixelRatio
        canvas.width = x * pixelRatio;
        canvas.height = y * pixelRatio;
        this.gl.viewport(0, 0, canvas.width, canvas.height)
    }

    /**
     * 绘制（从根节点遍历）
     */
    draw() {
        this.clear()
        this.root.draw()
        this.root.postDraw()
        this.toDraw.sort((a, b) => a.z - b.z);
        for (const drawable of this.toDraw) {
            drawable.flush();
            if (this.engine.debugger?.debugger) {
                drawable.flushDebug();
            }
        }
    }

    private initCostumDraw(options: IDrawOptions) {
        this.setCompositors("primitive", options.shader)
        if (options.color) {
            this.currentCompositors.setColor(options.color)
        } else {
            this.currentCompositors.setColorByRGBA(0, 0, 0, 1)
        }
    }

    drawLine(options: IDrawLineOptions) {
        this.initCostumDraw(options);
        const compositors = (this.currentCompositors as PrimitiveCompositors)
        compositors.setMode(PRIMITIVE_MODE.LINE)

        compositors.lineWidth = options.lineWdith
        this.currentCompositors.flush()
    }

    drawPolygon(options: IDrawPolygonOptions) {
        this.initCostumDraw(options)
        const compositors = (this.currentCompositors as PrimitiveCompositors)
        compositors.setMode(PRIMITIVE_MODE.FILL)
        this.currentCompositors.flush()
    }
}

export { Renderer }