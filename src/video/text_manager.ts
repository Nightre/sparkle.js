import { SparkleEngine } from "../engine";
import { Color } from "../main";

class TextManager {
    private canvas: CanvasRenderingContext2D
    constructor(_engine: SparkleEngine) {
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
    drawText(text: string, font: string = '24px monospace', color: Color) {
        const canvas = this.canvas
        canvas.font = font;
        // 计算文本的宽度和高度
        let metrics = canvas.measureText(text);
        let textWidth = metrics.width;
        let textHeight = parseInt(font, 10); // 假设字体大小在font字符串的开始

        // 设置canvas的大小
        canvas.canvas.width = textWidth + 2;
        canvas.canvas.height = textHeight * 1.25;
        // 清除canvas
        canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
        canvas.fillStyle = `rgba(${color.r * 255},${color.g * 255},${color.b * 255},${color.alpha * 255})`;

        // 绘制文本
        canvas.font = font;
        canvas.fillText(text, 0, textHeight);

        return canvas.canvas
    }
}

export default TextManager