import { InputManager } from "../input/input"
import { Color, IDebuggerDraw as IDebuggerFrame, PRIMITIVE_MODE, SparkleEngine, Vector2 } from "../main"
import pool from "../system/pool"
import PrimitiveCompositors from "../video/compositors/primitive_compositor"

class Debugger {
    engine: SparkleEngine
    frames: IDebuggerFrame[] = []
    private input: InputManager
    private pressedDebugger: boolean = false
    debugger: boolean = false
    color: Color = pool.Color.pull()
    scale: number[] = []

    constructor(engine: SparkleEngine) {
        this.engine = engine
        this.input = engine.input
    }

    toggleDebugger() {
        this.debugger = !this.debugger
    }

    /**
     * @ignore
     */
    update() {
        this.frames = []
        if (this.input.pressedKeys.has("b") && this.input.pressedKeys.has("Control")) {
            if (!this.pressedDebugger) {
                this.toggleDebugger()
            }
            this.pressedDebugger = true
        } else {
            this.pressedDebugger = false
        }
    }
    /**
     * @ignore
     */
    drawDebugFrame(w: number, h: number, color?: Color) {
        const { path, compositors } = this.init()
        this.color.setColor(0, 0, 1)
        compositors.setColor(color ?? this.color)
        compositors.setMode(PRIMITIVE_MODE.LINE)
        compositors.lineWidth = 10

        const rect = pool.Rect.pull(0, 0, w*this.scale[0], h*this.scale[1])
        path.rectPath(rect)
        compositors.flush()
        pool.Rect.push(rect)

        this.engine.renderer.restore()
    }
    /**
     * @ignore
     */
    drawDebugCollision(vs: Vector2[]) {
        if (vs.length == 0) {
            return
        }
        const { path, compositors } = this.init()
        this.color.setColor(0, 1, 0, 0.6)
        compositors.setColor(this.color)
        compositors.setMode(PRIMITIVE_MODE.FILL)
        compositors.lineWidth = 2
        path.beginPath()
        path.moveTo(vs[0].x, vs[0].y)
        for (let index = 1; index < vs.length; index++) {
            const v = vs[index]
            path.lineTo(v.x*this.scale[0], v.y*this.scale[1])
        }
        path.lineTo(vs[0].x, vs[0].y)

        compositors.flush()
        this.engine.renderer.restore()
    }
    /**
     * @ignore
     */
    addDebugCross() {
        const { path, compositors } = this.init()
        compositors.setMode(PRIMITIVE_MODE.LINE)
        compositors.lineWidth = 2
        this.color.setColor(1, 0, 0)
        compositors.setColor(this.color)
        path.beginPath()
        path.moveTo(- 10, 0)
        path.lineTo(10, 0)

        path.moveTo(0, - 10)
        path.lineTo(0, 10)
        compositors.flush()
        this.engine.renderer.restore()
    }
    /**
     * @ignore
     */
    init() {
        const renderer = this.engine.renderer

        renderer.save()
        this.scale = renderer.modelMatrix.getScale()
        renderer.modelMatrix.setAbsoluteScale(1)
        renderer.setCompositors("primitive");
        const compositors = renderer.currentCompositors as PrimitiveCompositors;
        const path = renderer.path

        return {
            compositors,
            path
        }
    }
}

export default Debugger