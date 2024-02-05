import { InputManager } from "../input/input"
import { Color, DebuggerRectType, IDebuggerRect as IDebuggerFrame, IRect, PRIMITIVE_MODE, SparkleEngine } from "../main"
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

    addDebugFrame(r: IRect) {
        this.frames.push({
            ...r,
            type: DebuggerRectType.COLLISION,
        })
    }
    addDebugCollisionFrame(r: IRect) {
        this.frames.push({
            ...r,
            type: DebuggerRectType.COLLISION,
        })
    }

    draw() {
        if (this.debugger) {
            const renderer = this.engine.renderer
            renderer.setCompositors("primitive")
            const compositors = renderer.currentCompositors as PrimitiveCompositors

            compositors.lineWidth = 3
            this.frames.forEach((rect) => {
                switch (rect.type) {
                    case DebuggerRectType.NORMAL:
                        this.color.setColor(0, 0, 1, 1)
                        compositors.setMode(PRIMITIVE_MODE.LINE)
                        break;
                    case DebuggerRectType.COLLISION:
                        this.color.setColor(0, 1, 0, 0.5)
                        compositors.setMode(PRIMITIVE_MODE.FILL)
                        break;
                }
                compositors.setColor(this.color)
                // TODO: 在render 中直接搞个draw rect
                renderer.path.beginPath()
                renderer.path.rectPath(rect)
                renderer.currentCompositors.flush()

                if (rect.type == DebuggerRectType.COLLISION) {
                    this.color.setColor(0.3, 0.4, .3, 1)
                    compositors.setColor(this.color)
                    compositors.lineWidth = 4
                    compositors.setMode(PRIMITIVE_MODE.LINE)

                    renderer.path.beginPath()
                    renderer.path.rectPath(rect)
                    renderer.currentCompositors.flush()
                }
            })
        }
    }
}


export default Debugger