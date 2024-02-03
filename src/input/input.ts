import { SparkleEngine } from "../engine";
import EventEmitter from "../system/event";
import { IInputEvents } from "../interface";

class InputManager extends EventEmitter<IInputEvents> {
    engine: SparkleEngine;
    keyMap: Record<string, string> = {};
    pressedKeys: Set<string> = new Set();

    constructor(engine: SparkleEngine) {
        super();
        this.engine = engine;
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keypress', this.handleKeyPress.bind(this));
        window.addEventListener('keyup', this.handleKeyRelease.bind(this));
    }

    handleKeyDown(event: KeyboardEvent) {
        this.emit('onKeyDown', event.key);
        this.pressedKeys.add(event.key);
    }

    handleKeyPress(event: KeyboardEvent) {
        this.emit('onKeyPress', event.key);
        if (this.keyMap[event.key]) {
            this.emit('onKeyPressRepeat', event.key);
        } else {
            this.keyMap[event.key] = event.key;
        }
    }

    handleKeyRelease(event: KeyboardEvent) {
        this.emit('onKeyRelease', event.key);
        delete this.keyMap[event.key];
        this.pressedKeys.delete(event.key);
    }

    getAllPressedKeys(): Set<string> {
        return this.pressedKeys;
    }
}

export { InputManager };
