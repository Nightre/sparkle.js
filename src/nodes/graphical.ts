import { GraphicalType, ICircleOptions, IGraphicalOptions, IPolygonOptions, IRectOptions, Path, Rect, Vector2 } from "../main";
import Drawable from "./drawable";

class Graphical extends Drawable {
    type: GraphicalType;
    path?: Vector2[]
    radius?: number;
    rect?: Rect;

    fill: boolean
    lineWidth: number

    constructor(options: IGraphicalOptions) {
        super(options)
        if (options.type == undefined) {
            throw new Error("must provide a type");   
        }
        this.type = options.type
        this.fill = options.fill ?? true
        this.lineWidth = options.lineWidth ?? 1

        switch (options.type) {
            case GraphicalType.RECT:
                this.rect = options.rect
                break;
            case GraphicalType.POLYGON:
                this.path = options.path
                break;
            case GraphicalType.CIRCLE:
                this.radius = options.radius

                break;
        }
    }
    /**
     * @ignore
     */
    draw(): void {
        super.draw()
        const pos = this.pool.Vector2.pull(0, 0)
        const path = this.renderer.path
        
        path.beginPath()
        switch (this.type) {
            case GraphicalType.RECT:
                if (this.rect) {

                    path.rectPath(this.rect)
                }
                break;
            case GraphicalType.POLYGON:
                if (this.path) {
                    path.polygonPath(this.path)
                }
                break;
            case GraphicalType.CIRCLE:
                if (this.radius) {
                    path.circlePath(this.radius)
                }
                break;
        }
        if (this.fill) {
            this.engine.renderer.drawPolygon({
                color: this.color,
                position: pos,
            })
        } else {
            this.engine.renderer.drawLine({
                color: this.color,
                position: pos,
                lineWdith: this.lineWidth,
            })
        }
        this.pool.Vector2.push(pos)
    }
}

export default Graphical