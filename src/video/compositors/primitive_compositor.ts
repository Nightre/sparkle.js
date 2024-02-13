import { Renderer } from "../renderer";
import Compositor from "./compositors";
import vertexShader from "../shader/primitive.vert?raw"
import fragmentShader from "../shader/primitive.frag?raw"
import { GLShader, PRIMITIVE_MODE, Vector2 } from "../../main";

class PrimitiveCompositors extends Compositor {
    protected drawCallMode: number;
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
            fragmentShader,
            vertexPerObj: 6
        })
        this.drawCallMode = gl.LINE_STRIP
    }

    setMode(mode: PRIMITIVE_MODE) {
        this.drawMode = mode
        switch (mode) {
            case PRIMITIVE_MODE.FILL:
                this.drawCallMode = this.gl.TRIANGLE_FAN
                break;
            case PRIMITIVE_MODE.LINE:
                this.drawCallMode = this.gl.TRIANGLES
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
        // let _prevEndUp: Vector2 | null = null;
        // let _prevEndDown: Vector2 | null = null;
    
        this.path.forEachLine((start: Vector2, end: Vector2) => {
            const dis = start.sub(end, true)
            dis.unit().normal().scale(this.lineWidth * 0.5)
    
            const startUp = start.add(dis, true)
            const startDown = start.sub(dis, true)
    
            const endUp = end.add(dis, true)
            const endDown = end.sub(dis, true)
    
            this.addVertex(startDown)
            this.addVertex(startUp)
            this.addVertex(endDown)
    
            this.addVertex(startUp)
            this.addVertex(endUp)
            this.addVertex(endDown)
    
            // _prevEndUp = endUp;
            // _prevEndDown = endDown;
        })
    }
    pointPathToVertex() {
        this.path.forEachPoint((p) => this.addVertex(p))
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
        // 用 render path避免path太多
    }
}

export default PrimitiveCompositors