import { InputManager } from "../input/input"
import { Color, IDebuggerDraw as IDebuggerFrame, SparkleEngine, Vector2 } from "../main"
import pool from "../system/pool"

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
    drawDebugFrame(w: number, h: number) {
        const path = this.init()
        this.color.setColor(0, 0, 1,1)
        const rect = pool.Rect.pull(0, 0, w*this.scale[0], h*this.scale[1])
        path.rectPath(rect)
        const pos = pool.Vector2.pull(0, 0)

        this.engine.renderer.drawLine({
            color: this.color,
            position: pos,
            lineWdith: 3
        })
        pool.Rect.push(rect)
        pool.Vector2.push(pos)
        this.engine.renderer.restore()
    }
    /**
     * @ignore
     */
    drawDebugCollision(vs: Vector2[]) {
        if (vs.length == 0) {
            return
        }
        const path = this.init()
        const pos = pool.Vector2.pull(0, 0)

        this.color.setColor(0, 1, 0, 0.6)
        path.beginPath()
        path.moveTo(vs[0].x, vs[0].y)
        vs!.forEach((v) => {
            path.lineTo(v.x*this.scale[0], v.y*this.scale[1])
        })
        path.lineTo(vs[0].x, vs[0].y)
        this.engine.renderer.drawPolygon({
            color: this.color,
            position: pos,
        })
        pool.Vector2.push(pos)
        this.engine.renderer.restore()
    }
    /**
     * @ignore
     */
    addDebugCross() {
        const path = this.init()
        const pos = pool.Vector2.pull(0, 0)

        path.beginPath()
        path.moveTo(- 10, 0)
        path.lineTo(10, 0)

        path.moveTo(0, - 10)
        path.lineTo(0, 10)
        this.color.setColor(1, 0, 0)
        this.engine.renderer.drawLine({
            color: this.color,
            position: pos,
            lineWdith: 2
        })
        pool.Vector2.push(pos) 
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
        return renderer.path
    }
}

export default Debugger