import { SparkleEngine } from "../engine";
import { EventEmitter, IMouseEvents, IMouseData, Vector2, IEventAble } from "../main";
import pool from "../system/pool";

/**
 * 鼠标输入
 * @category Input
 */
class MouseManager implements IEventAble<IMouseEvents> {
    private engine: SparkleEngine;
    private canvas: HTMLCanvasElement;
    /**
     * 鼠标的全局位置
     */
    mousePosition: Vector2 = pool.Vector2.pull(0)
    /**
     * 鼠标是否点击
     */
    isMouseDown: boolean = false
    event: EventEmitter<IMouseEvents> = new EventEmitter

    constructor(engine: SparkleEngine, canvas: HTMLCanvasElement) {
        this.engine = engine;
        this.canvas = canvas;

        this.initMouseEvents();
    }

    private getMouseData(event: MouseEvent): IMouseData {
        const rect = this.canvas.getBoundingClientRect();
        const devicePixelRatio = this.engine.renderer.devicePixelRatio

        const data = {
            position: pool.Vector2.pull(
                (event.clientX - rect.left) / devicePixelRatio,
                (event.clientY - rect.top) / devicePixelRatio
            ),
            event
        }
        this.mousePosition.copy(data.position)
        return data;
    }

    private initMouseEvents(): void {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('mouseup', this.handleMouseUp.bind(this)); // 使用window监听确保即使鼠标离开canvas也能捕获到mouseup事件
    }

    private handleMouseDown(event: MouseEvent): void {
        const data = this.getMouseData(event);
        this.event.emit('onMouseDown', data);
        this.isMouseDown = true
    }

    private handleMouseMove(event: MouseEvent): void {
        const data = this.getMouseData(event);
        this.event.emit('onMouseMove', data);
    }

    private handleMouseUp(event: MouseEvent): void {
        const data = this.getMouseData(event);
        this.event.emit('onMouseUp', data);
        this.isMouseDown = false
    }
}

export default MouseManager;
