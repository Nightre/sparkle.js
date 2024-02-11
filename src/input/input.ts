import { SparkleEngine } from "../engine";
import EventEmitter from "../system/event";
import { IEventAble, IInputEvents } from "../interface";

/**
 * @category Input
 */
class InputManager implements IEventAble<IInputEvents> {
    engine: SparkleEngine;
    pressedKeys: Set<string> = new Set();

    event: EventEmitter<IInputEvents> = new EventEmitter

    constructor(engine: SparkleEngine) {
        this.engine = engine;
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyRelease.bind(this));
    }

    handleKeyDown(event: KeyboardEvent) {
        // 如果按键之前没有被按下，则触发 onKeyDown 事件
        if (!this.pressedKeys.has(event.key)) {
            this.event.emit('onKeyDown', event.key);
        } else {
            // 如果按键已经存在于 pressedKeys 中，表示这是一个重复的按下事件
            this.event.emit('onKeyPressRepeat', event.key);
        }
        this.pressedKeys.add(event.key);
    }

    handleKeyRelease(event: KeyboardEvent) {
        this.event.emit('onKeyRelease', event.key);
        this.pressedKeys.delete(event.key);
    }

    getAllPressedKeys(): Set<string> {
        return this.pressedKeys;
    }
}

export { InputManager };