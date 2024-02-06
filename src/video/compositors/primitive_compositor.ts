import { Renderer } from "../renderer";
import Compositor from "./compositors";
import vertexShader from "../shader/primitive.vert?raw"
import fragmentShader from "../shader/primitive.frag?raw"
import { GLShader, PRIMITIVE_MODE, Vector2 } from "../../main";

class PrimitiveCompositors extends Compositor {
    protected drawcallMode: number;
    lineWidth: number = 1;
    drawMode: number = PRIMITIVE_MODE.LINE
    constructor(renderer: Renderer) {
        const gl = renderer.gl
        super({
            renderer,
            attributes: [
                { name: 'aPosition', size: 2, type: gl.FLOAT, normalized: false, offset: 0 },
            ],
            vertexShader,
            fragmentShader
        })
        this.drawcallMode = gl.LINE_STRIP
    }

    setMode(mode: PRIMITIVE_MODE) {
        this.drawMode = mode
        switch (mode) {
            case PRIMITIVE_MODE.FILL:
                this.drawcallMode = this.gl.TRIANGLE_FAN
                break;
            case PRIMITIVE_MODE.LINE:
                this.drawcallMode = this.gl.TRIANGLES
                break;
            default:
                break;
        }
    }

    private addVertex(x?: number | Vector2, y?: number) {
        if (arguments.length == 1) {
            this.bufferArray.pushVertex(
                ...this.renderer.modelMatrix.apply((x as Vector2).x, (x as Vector2).y)
            )
        } else {
            this.bufferArray.pushVertex(
                ...this.renderer.modelMatrix.apply(x as number, y as number)
            )
        }

    }

    bind(customShader?: GLShader): void {
        this.setMode(PRIMITIVE_MODE.LINE)
        super.bind(customShader)
    }

    private linePathToVertex() {
        // TODO:关节
        this.path.forEachLine((start: Vector2, end: Vector2, _nextStart?: Vector2, _nextEnd?: Vector2) => {
            const dis = start.sub(end, false)
            dis.unit().normal().scale(this.lineWidth * 0.5)

            const startUp = start.add(dis, false)
            const startDown = start.sub(dis, false)

            const endUp = end.add(dis, false)
            const endDown = end.sub(dis, false)

            this.addVertex(startDown)
            this.addVertex(startUp)
            this.addVertex(endDown)

            this.addVertex(startUp)
            this.addVertex(endUp)
            this.addVertex(endDown)
        })
    }
    pointPathToVertex() {
        this.path.forEachPoint((p, index) => {
            if (index % 2 == 1) {
                this.addVertex(p)
            }
        })
    }
    private pathToVertex() {
        switch (this.drawMode) {
            case PRIMITIVE_MODE.LINE:
                this.linePathToVertex()
                break;
            case PRIMITIVE_MODE.FILL:
                this.pointPathToVertex()
                break;
            default:
                break;
        }
    }

    flush(): void {
        // 将 path 转化为Vertex
        this.pathToVertex()
        super.flush()
        this.path.clearPath()
    }
}

export default PrimitiveCompositors