type eventMap<T> = Record<keyof T, Array<(...args: any[]) => void>>

class EventEmitter<T extends Record<string | symbol, any>> {
    private eventMap: eventMap<T> = {} as eventMap<T>;

    /**
     * 监听事件
     * @param eventName 
     * @param listener 
     * @returns 
     */
    on<K extends keyof T>(eventName: K, listener: T[K]): this {
        if (!this.eventMap[eventName]) {
            this.eventMap[eventName] = [];
        }
        this.eventMap[eventName].push(listener);
        return this;
    }

    /**
     * 触发事件
     * @param eventName 
     * @param args 
     * @returns 
     */
    emit<K extends keyof T>(eventName: K, ...args: Parameters<T[K]>): boolean {
        const listeners = this.eventMap[eventName];
        if (!listeners || listeners.length === 0) return false;
        listeners.forEach((listener) => {
            listener(...args);
        });
        return true;
    }

    /**
     * 取消监听事件
     * @param eventName 
     * @param listener 
     * @returns 
     */
    off<K extends keyof T>(eventName: K, listener: T[K]): this {
        const listeners = this.eventMap[eventName];
        if (listeners && listeners.length > 0) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
        return this;
    }

    /**
     * 监听一次性事件
     * @param eventName 
     * @param listener 
     * @returns 
     */
    once<K extends keyof T>(eventName: K, listener: T[K]): this {
        const onceHandler = (...args: any[]) => {
            this.off(eventName, onceHandler as any);
            listener(...args);
        };
        return this.on(eventName, onceHandler as any);
    }
}

export default EventEmitter;