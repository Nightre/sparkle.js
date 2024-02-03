/* eslint-disable @typescript-eslint/no-explicit-any */
import { IObjectClassRecord, IPoolable, Class } from "./interface";

class ObjectPool {
    private objectClass: { [className: string]: IObjectClassRecord<any> } = {};
    private instance_counter: number = 0;

    register<T extends IPoolable>(className: string, classObj: Class<T>): void {
        if (typeof classObj !== "undefined") {
            this.objectClass[className] = {
                class: classObj,
                pool: [],
            };
        } else {
            throw new Error("Cannot register object '" + className + "', invalid class");
        }
    }

    pull<T extends IPoolable>(name: string, ...args: any[]): T {
        const className = this.objectClass[name];
        if (className) {
            const proto = className.class;
            const poolArray = className.pool;
            let obj: T;

            if (poolArray && poolArray.length > 0) {
                obj = poolArray.pop()!;
                obj.poolReset.call(obj, ...args);
                this.instance_counter--;
            } else {
                obj = new proto(...args);
                if (poolArray) {
                    obj.className = name;
                }
            }
            return obj;
        }
        throw new Error("Cannot instantiate object of type '" + name + "'");
    }

    purge(): void {
        for (const className in this.objectClass) {
            if (this.objectClass[className]) {
                this.objectClass[className].pool = [];
            }
        }
        this.instance_counter = 0;
    }

    push(obj: IPoolable): boolean {
        this.objectClass[obj.className!].pool!.push(obj);
        this.instance_counter++;

        return true;
    }

    exists(name: string): boolean {
        return name in this.objectClass;
    }

    getInstanceCount(): number {
        return this.instance_counter;
    }
}

export { ObjectPool }