import Color from "../math/color";
import Transform2D from "./transform_2d";
import { IDrawableOptions } from "../interface"
import { Vector2 } from "../main";

/**
 * 所有可显示的游戏对象的基类
 * @category GameNode
 */
class Drawable extends Transform2D {
    /** 颜色叠加 */ 
    color: Color
    /** 是否可见 */
    visible: boolean = true
    /** 绘制的大小 */
    drawSize: Vector2 = this.pool.Vector2.pull(0, 0)
    constructor(options: IDrawableOptions) {
        super(options)
        this.color = options.color ?? this.pool.Color.pull(0, 0, 0, 1)
        
    }
    /**
     * 显示 等同于 `this.visible = true`
     */
    show() {
        this.visible = true
    }
    /**
     * 隐藏 等同于 `this.visible = false`
     */
    hide() {
        this.visible = false
    }
    /**
     * @ignore
     */
    draw(): void {
        super.draw()
        this.visible = this.visible && this.renderer.visable
        this.renderer.visable = this.visible
    }
    /**
     * @ignore
     */
    doDestory() {
        super.doDestory()
        this.pool.Color.push(this.color)
        this.pool.Vector2.push(this.drawSize)
    }
}

export default Drawable