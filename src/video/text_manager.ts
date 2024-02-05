import { SparkleEngine } from "../engine";
import { Color } from "../main";

class TextManager {
    engine: SparkleEngine
    canvas: CanvasRenderingContext2D
    constructor(engine: SparkleEngine) {
        this.engine = engine
        this.canvas = this.getContext();
    }
    getContext() {
        const c = document.createElement("canvas").getContext("2d")
        if (!c) {
            throw new Error("unable to create canvas");
        }
        return c
    }
    drawText(text: string, font: string = '16px Arial', color: Color) {
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
        this.canvas.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.alpha})`;

        // 绘制文本
        this.canvas.fillText(text, 0, 0);
        return this.canvas.canvas
    }

}

export default TextManager