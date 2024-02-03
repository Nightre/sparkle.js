import { SparkleEngine } from "../engine";
import { EventEmitter, IMouseEvents, IMouseData, Vector2 } from "../main";
import pool from "../system/pool";


class MouseManager extends EventEmitter<IMouseEvents> {
    engine: SparkleEngine;
    canvas: HTMLCanvasElement;

    mousePosition: Vector2 = pool.Vector2.pull(0)

    constructor(engine: SparkleEngine, canvas: HTMLCanvasElement) {
        super();
        this.engine = engine;
        this.canvas = canvas;

        this.initMouseEvents();
    }

    private getMouseData(event: MouseEvent): IMouseData {
        const rect = this.canvas.getBoundingClientRect();
        const data = {
            position: pool.Vector2.pull(
                event.clientX - rect.left,
                event.clientY - rect.top
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
        this.emit('onMouseDown', data);
    }

    private handleMouseMove(event: MouseEvent): void {
        const data = this.getMouseData(event);
        this.emit('onMouseMove', data);
    }

    private handleMouseUp(event: MouseEvent): void {
        const data = this.getMouseData(event);
        this.emit('onMouseUp', data);
    }
}

export default MouseManager;
