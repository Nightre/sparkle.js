import { ICopyable } from "../interface";
import { IPoolable } from "../interface";
import pool from "../system/pool";

/**
 * 颜色
 * @category Math
 */
class Color implements IPoolable, ICopyable<Color> {

    r: number = 0
    g: number = 0
    b: number = 0
    alpha: number = 0

    constructor(r = 0, g = 0, b = 0, alpha = 1) {
        this.poolReset(r, g, b, alpha)
    }
    /**
     * @ignore
     * @param r 
     * @param g 
     * @param b 
     * @param alpha 
     */
    poolReset(r = 0, g = 0, b = 0, alpha = 1): void {
        this.setColor(
            r, g, b, alpha
        )
    }
    /**
     * 直接设置颜色
     * @param r 
     * @param g 
     * @param b 
     * @param alpha 
     */
    setColor(r: number, g: number, b: number, alpha: number = 1) {
        this.r = r
        this.g = g
        this.b = b
        this.alpha = alpha
    }
    /**
     * 复制一个颜色的值到该颜色
     * @param c 
     */
    copy(c: Color) {
        this.setColor(
            c.r, c.g, c.b, c.alpha
        )
    }
    /**
     * 克隆
     * @returns 
     */
    clone() {
        return pool.Color.pull(this.r, this.g, this.b, this.alpha)
    }
    /**
     * 判断是否相等
     * @param color 
     * @returns 
     */
    equals(color: Color) {
        return color.r == this.r &&
            color.g == this.g &&
            color.b == this.b &&
            color.alpha == this.alpha
    }
    /**
     * 从Hex格式加载颜色
     * @param hexString 
     */
    static fromHex(hexString: string): Color {
        // 检查并处理前导'#'
        if (hexString.startsWith('#')) {
            hexString = hexString.slice(1);
        }
        const r = parseInt(hexString.slice(0, 2), 16) / 255;
        const g = parseInt(hexString.slice(2, 4), 16) / 255;
        const b = parseInt(hexString.slice(4, 6), 16) / 255;
        let a = 1;
        if (hexString.length >= 8) {
            a = parseInt(hexString.slice(6, 8), 16) / 255;
        }
        return new Color(r, g, b, a);
    }
    /**
     * 创建红色
     */
    static red(): Color {
        return new Color(255, 0, 0);
    }

    /**
     * 创建绿色
     */
    static green(): Color {
        return new Color(0, 255, 0);
    }

    /**
     * 创建蓝色
     */
    static blue(): Color {
        return new Color(0, 0, 255);
    }
    /**
     * 创建黄色
     */
    static yellow(): Color {
        return new Color(255, 255, 0);
    }

    /**
     * 创建白色
     */
    static white(): Color {
        return new Color(255, 255, 255);
    }

    /**
     * 创建黑色
     */
    static black(): Color {
        return new Color(0, 0, 0);
    }
}

export default Color