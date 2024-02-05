import { InputManager } from "../input/input"
import { Color, IDebuggerDraw as IDebuggerFrame, PRIMITIVE_MODE, SparkleEngine } from "../main"
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

    drawDebugFrame(w: number, h: number) {
        const renderer = this.engine.renderer
        renderer.setCompositors("primitive");
        const compositors = renderer.currentCompositors as PrimitiveCompositors;
        const path = renderer.path
        this.color.setColor(0, 0, 1)
        compositors.setColor(this.color)
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

    addDebugCross() {
        this.debugger
        const renderer = this.engine.renderer
        renderer.setCompositors("primitive");
        const compositors = renderer.currentCompositors as PrimitiveCompositors;
        const path = renderer.path
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