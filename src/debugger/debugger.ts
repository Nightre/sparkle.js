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
    constructor(engine: SparkleEngine) {
        this.engine = engine
        this.input = engine.input
    }

    toggleDebugger() {
        this.debugger = !this.debugger
    }

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

    drawDebugFrame(w: number, h: number, color?: Color) {
        const { path, compositors } = this.init()
        this.color.setColor(0, 0, 1)
        compositors.setColor(color ?? this.color)
        compositors.setMode(PRIMITIVE_MODE.LINE)
        compositors.lineWidth = 3
        path.beginPath()
        path.moveTo(0, 0)
        path.lineTo(0 + w, 0)
        path.lineTo(0 + w, 0 + h)
        path.lineTo(0, 0 + h)
        path.lineTo(0, 0)
        compositors.flush()
    }
    drawDebugPolygonFrame(vs: Vector2[]) {
        if (vs.length == 0) {
            return
        }
        const { path, compositors } = this.init()
        this.color.setColor(0, 1, 0, 0.5)
        compositors.setColor(this.color)
        compositors.setMode(PRIMITIVE_MODE.LINE)
        compositors.lineWidth = 3
        path.beginPath()
        path.moveTo(vs[0].x, vs[0].y)
        for (let index = 1; index < vs.length; index++) {
            const v = vs[index]
            path.lineTo(v.x, v.y)
        }
        path.lineTo(vs[0].x, vs[0].y)

        compositors.flush()
    }
    init() {
        const renderer = this.engine.renderer
        renderer.setCompositors("primitive");
        const compositors = renderer.currentCompositors as PrimitiveCompositors;
        const path = renderer.path
        return {
            compositors,
            path
        }
    }

    addDebugCross() {
        const { path, compositors } = this.init()
        compositors.setMode(PRIMITIVE_MODE.LINE)
        compositors.lineWidth = 4
        this.color.setColor(1, 0, 0)
        compositors.setColor(this.color)
        path.beginPath()
        path.moveTo(- 10, 0)
        path.lineTo(10, 0)

        path.moveTo(0, - 10)
        path.lineTo(0, 10)
        compositors.flush()
    }

    draw() {

    }
}


export default Debugger