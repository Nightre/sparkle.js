import Color from "../math/color";
import Transform2D from "./transform_2d";
import { IDrawableOptions } from "../interface"

/**
 * 所有可显示的游戏对象的基类
 * @category GameNode
 */
class Drawable extends Transform2D {
    color: Color
    visible: boolean = true
    constructor(options: IDrawableOptions) {
        super(options)
        this.color = options.color ?? this.pool.pull("Color", 1, 1, 1, 1)
    }
    show() {
        this.visible = true
    }
    hide() {
        this.visible = false
    }
    destory() {
        this.pool.push(this.color)
    }
}

export default Drawable