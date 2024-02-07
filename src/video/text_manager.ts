import { SparkleEngine } from "../engine";
import { Color } from "../main";

class TextManager {
    private engine: SparkleEngine
    private canvas: CanvasRenderingContext2D
    constructor(engine: SparkleEngine) {
        this.engine = engine
        this.canvas = this.getContext();
    }
    /**
     * @ignore
     * @returns canvas
     */
    private getContext() {
        const c = document.createElement("canvas").getContext("2d")
        if (!c) {
            throw new Error("unable to create canvas");
        }
        return c
    }
    /**
     * 返回 canvas 而不是绘制一个文字，若要绘制文字请使用 Text
     * @param text 文字
     * @param font 字体
     * @param color 颜色
     * @returns 返回 canvas 而不是绘制一个文字
     */
    drawText(text: string, font: string = '64px Arial', color: Color) {
        this.canvas.font = font;
        // 计算文本的宽度和高度
        let metrics = this.canvas.measureText(text);
        let textWidth = metrics.width;
        let textHeight = parseInt(font, 10); // 假设字体大小在font字符串的开始

        // 设置canvas的大小
        this.canvas.canvas.width = textWidth;
        this.canvas.canvas.height = textHeight;

        // 清除canvas
        this.canvas.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);

        // 设置字体和颜色
        this.canvas.font = font;
        this.canvas.fillStyle = `rgba(${color.r * 255},${color.g * 255},${color.b * 255},${color.alpha * 255})`;

        // 绘制文本
        this.canvas.fillText(text, 0, textHeight);

        return this.canvas.canvas
    }
}

export default TextManager