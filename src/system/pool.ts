import { IPoolable, Constructor } from "../interface";
import { Color, Matrix, Vector2 } from "../main";

// TODO: Register
class PoolManager {
    Matrix!: ObjectPool<Matrix>
    Color!: ObjectPool<Color>
    Vector2!: ObjectPool<Vector2>

    register() {
        this.Matrix = new ObjectPool(Matrix)
        this.Color = new ObjectPool(Color)
        this.Vector2 = new ObjectPool(Vector2);
    }
}
/**
 * 一个基本的对象池，对象池用于重复利用某些频繁删除或创建的对象
 * 来减少创建创建所造成的开销，每个对象池的对象都必须是{@link IPoolable}
 * 也就是说必须实现`poolReset`方法，这将会在拉取旧的对象时被调用
 * @example
 * class MyType {
 *      constructor(coin){
 *          coin = coin ?? 0
 *      }
 *      poolReset(coin){
 *          coin = coin ?? 0
 *      }
 * }
 * let pool = new ObjectPool(MyType)
 * pool.push(obj)
 * pool.pull(arg)
 */
class ObjectPool<T extends IPoolable = IPoolable>{
    factory: Constructor<T>
    objects: T[] = []
    /** 对象池中最大对象数量 */
    maxObject: number = 1024

    constructor(type: Constructor<T>) {
        this.factory = type
    }
    /**
     * 回收一个对象
     * @example
     * let pool = new ObjectPool(MyType)
     * pool.push(obj)
     * @param obj 
     */
    push(obj: T) {
        if (this.objects.length < this.maxObject) {
            this.objects.push(obj)
        }
    }
    /**
     * 拉取一个对象
     * @example
     * let pool = new ObjectPool(MyType)
     * pool.pull(...arg)
     * @param obj 
     */
    pull(...arg: Parameters<T["poolReset"]>): T {
        let obj: T
        if (this.objects.length > 0) {
            obj = this.objects.pop()!;
            obj.poolReset(...arg)
        } else {
            obj = new this.factory(...arg)
        }
        return obj
    }
}
const pool = new PoolManager()
export { ObjectPool, PoolManager }
export default pool