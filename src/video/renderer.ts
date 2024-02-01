import EventEmitter from "../event/event";
import Matrix from "../math/martix";
import pool from "../pool";
import Compositor from "./compositors/compositors";
import QuadCompositors from "./compositors/quad_compositor";
import GLShader from "./glshader";
import getContext from "./utils/get_context";

export interface RendererEvents {

}

export interface IRenderOptions {
    /** canvas */
    canvas: HTMLCanvasElement
    /** 是否启用抗锯齿 */
    antialias?: boolean
}

class Renderer extends EventEmitter<RendererEvents> {
    canvas: HTMLCanvasElement
    currentScissor: Int32Array
    gl: WebGLRenderingContext
    backgroundColor: number[] = [0, 0, 0]

    compositors: Map<string, Compositor> = new Map

    currentCompositors!: Compositor
    currentShader!: GLShader

    projectionMatrix: Float32Array

    matrixStack: Matrix[] = []
    modelMatrix: Matrix = new Matrix()
    
    constructor(options: IRenderOptions) {
        super()
        this.canvas = options.canvas
        this.gl = getContext(this.canvas, {
            alpha: true,
            antialias: options.antialias ?? false,
            stencil: true,
        })
        this.gl.enable(this.gl.SCISSOR_TEST)
        this.currentScissor = new Int32Array([0, 0, this.width, this.height])

        this.projectionMatrix = this.createOrthographicProjectionMatrix(
            0,
            this.width,
            this.height,
            0
        )


        this.addCompositors("quad", new QuadCompositors(this))
        this.setCompositors("quad")

        pool.register("Matrix", Matrix)
    }

    createOrthographicProjectionMatrix(left: number, right: number, bottom: number, top: number): Float32Array {
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

    reset(){
        this.matrixStack.forEach((matrix) => {
            pool.push(matrix);
        });
        this.clear();
    }

    /**
     * 存储状态（入栈）
     */
    save(){
        this.matrixStack.push(this.modelMatrix.clone())
    }
    /**
     * 退回上个保存的状态（出栈）
     */
    restore(){
        if (this.matrixStack.length > 0) {
            let matrix = this.matrixStack.pop()!;
            this.modelMatrix.copy(matrix)
            pool.push(matrix)
        }
    }

    addCompositors(name: string, compositors: Compositor) {
        if (!this.compositors.has(name)) {
            this.compositors.set(name, compositors)
        }
    }

    setCompositors(compositorsName: string) {
        const compositors = this.compositors.get(compositorsName)
        if (compositors && this.currentCompositors !== compositors) {
            this.currentCompositors = compositors
            compositors.bind()
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

    flush() {

    }

    resize(width: number, height: number) {
        const canvas = this.canvas
        if (width !== canvas.width || height !== canvas.height) {
            canvas.width = width;
            canvas.height = height;
            this.currentScissor[0] = 0;
            this.currentScissor[1] = 0;
            this.currentScissor[2] = width;
            this.currentScissor[3] = height;
        }
    }


}

export default Renderer