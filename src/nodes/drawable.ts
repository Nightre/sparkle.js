import Color from "../math/color";
import Transform2D from "./transform_2d";
import { IDrawableOptions } from "../interface"
import { Vector2 } from "../main";

/**
 * 所有可显示的游戏对象的基类
 * @category GameNode
 */
class Drawable extends Transform2D {
    color: Color
    visible: boolean = true
    drawSize: Vector2 = this.pool.Vector2.pull(0, 0)
    constructor(options: IDrawableOptions) {
        super(options)
        this.color = options.color ?? this.pool.Color.pull(1, 1, 1, 1)
    }
    show() {
        this.visible = true
    }
    hide() {
        this.visible = false
    }
    draw(): void {
        super.draw()
        this.visible = this.visible && this.renderer.visable
        this.renderer.visable = this.visible
    }
    destory() {
        super.destory()
        this.pool.Color.push(this.color)
        this.pool.Vector2.push(this.drawSize)
    }
}

export default Drawable