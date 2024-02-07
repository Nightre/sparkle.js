class EventEmitter<T extends Record<string | symbol, any>> {
    private eventMap: Record<keyof T, Array<(...args: any[]) => void>> =
        {} as any;

    /**
     * 监听事件
     * @param eventName 
     * @param listener 
     * @returns 
     */
    on<K extends keyof T>(eventName: K, listener: T[K]) {
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
    emit<K extends keyof T>(eventName: K, ...args: Parameters<T[K]>) {
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
    off<K extends keyof T>(eventName: K, listener: T[K]) {
        const listeners = this.eventMap[eventName];
        if (listeners && listeners.length > 0) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
        return this;
    }
}

export default EventEmitter