type Class<T> = new (...args: any[]) => T;

export interface Poolable {
    className?: string;
    onResetEvent(...args: any[]): void;
}

interface ObjectClassRecord<T> {
    class: Class<T>;
    pool: T[] | undefined;
}

class ObjectPool {
    private objectClass: { [className: string]: ObjectClassRecord<any> } = {};
    private instance_counter: number = 0;

    /**
     * Register an object to the pool.
     * @param className as defined in the Name field of the Object Properties (in Tiled)
     * @param classObj corresponding Class to be instantiated
     */
    register<T extends Poolable>(className: string, classObj: Class<T>): void {
        if (typeof classObj !== "undefined") {
            this.objectClass[className] = {
                class: classObj,
                pool: [],
            };
        } else {
            throw new Error("Cannot register object '" + className + "', invalid class");
        }
    }

    /**
     * Pull a new instance of the requested object (if added into the object pool)
     * @param name as used in {@link pool.register}
     * @param args arguments to be passed when instantiating/reinitializing the object
     * @returns the instance of the requested object
     */
    pull<T extends Poolable>(name: string, ...args: any[]): T {
        let className = this.objectClass[name];
        if (className) {
            let proto = className.class,
                poolArray = className.pool,
                obj: T;

            if (poolArray && poolArray.length > 0) {
                obj = poolArray.pop()!;
                obj.onResetEvent.apply(obj, args);
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

    /**
     * Purge the object pool from any inactive object
     */
    purge(): void {
        for (let className in this.objectClass) {
            if (this.objectClass[className]) {
                this.objectClass[className].pool = [];
            }
        }
        this.instance_counter = 0;
    }

    /**
     * Push back an object instance into the object pool
     * @param obj instance to be recycled
     * @param throwOnError throw an exception if the object cannot be recycled
     * @returns true if the object was successfully recycled in the object pool
     */
    push(obj: Poolable): boolean {
        this.objectClass[obj.className!].pool!.push(obj);
        this.instance_counter++;

        return true;
    }

    /**
     * Check if an object with the provided name is registered
     * @param name of the registered object class
     * @returns true if the classname is registered
     */
    exists(name: string): boolean {
        return name in this.objectClass;
    }

    /**
     * Returns the amount of object instance currently in the pool
     * @returns amount of object instance
     */
    getInstanceCount(): number {
        return this.instance_counter;
    }
}

const pool: ObjectPool = new ObjectPool();

export default pool;