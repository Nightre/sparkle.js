import { Renderer } from "../video/renderer";

import { IContainerOptions, IListened } from "../interface"
import { SparkleEngine } from "../engine";
import EventEmitter from "../system/event";
import pool, { PoolManager } from "../system/pool";

/**
 * 所有游戏对象的基类，可以容纳子节点
 * @category GameNode
 */
class Container<T extends {} = {}> extends EventEmitter<T> {
    protected engine: SparkleEngine
    protected renderer: Renderer

    /**
     * 父节点
     */
    parent?: Container | null
    /**
     * 子节点列表
     */
    children: Container[] = []
    /**
     * 休眠，若sleep为真则不会调用{@link update}等函数
     */
    sleep: boolean = false
    /**
     * 仅休眠我自己，不影响其子节点
     */
    onlySelfSleep: boolean = false

    /**
     * Tag 用于节点查找，可以有多个tag
     */
    tag: Set<string>
    /**
     * 对于对象池的引用
     */
    pool: PoolManager
    /**
     * 是否为常驻节点，如果是常驻节点的话
     * 在切换场景时不会被销毁（其子节点同样不会被销毁）
     * 注意：常驻节点必须是根节点的一级子节点
     */
    resident: boolean
    protected isReady: boolean = false
    private listened: IListened[] = []
    get root() {
        return this.engine.root
    }

    constructor(options: IContainerOptions) {
        super()
        this.engine = options.engine;
        this.resident = options.resident ?? false
        if (this.resident) {
            this.engine.addResident(this)
        }
        this.renderer = this.engine.renderer;
        this.pool = pool
        this.tag = options.tags ? new Set(options.tags) : new Set
    }

    /**
     * 使用该种方法监听事件，当节点被销毁时自动取消监听
     * @param emitter 
     * @param eventName 
     * @param func 
     */
    onEvent<T extends Record<string, any>>(emitter: EventEmitter<T>, eventName: keyof T, func: T[keyof T]) {
        emitter.on(eventName, func)
        this.listened.push({
            emitter,
            eventName: (eventName as string),
            func: func.bind(this)
        })
    }
    /**
     * 使用该方法取消 {@link onEvent} 监听的事件
     * @param emitter 
     * @param eventName 
     * @param func 
     */
    offEvent<T extends Record<string, any>>(emitter: EventEmitter<T>, eventName: keyof T, func: T[keyof T]) {
        emitter.off(eventName, func);
        this.listened = this.listened.filter(v => !(v.emitter == emitter && v.eventName == eventName));
    }
    /**
     * 添加一个子节点
     * @param child 
     */
    addChild<T extends Container>(child: T):T {
        child.setParent(this);
        return child
    }
    /**
     * 设置父节点
     * 如果当前节点已经有父节点，则先从原来的父节点中移除
     * @param parent 
     */
    setParent(parent: Container) {
        // 如果当前节点已经有父节点，则先从原来的父节点中移除
        if (this.parent) {
            this.parent.removeChild(this);
        }
        // 将当前节点添加到新的父节点中
        this.parent = parent
        if (parent) {
            parent.children.push(this);
            this.enterTree()
        } else {
            throw new Error("can't set parent to null");
        }
    }

    /**
     * 从父节点中移除当前节点
     */
    removeFromParent() {
        if (this.parent) {
            this.parent.removeChild(this);
        }
    }

    /**
     * 移除一个子节点
     * @param child 
     */
    removeChild(child: Container) {
        const index = this.children.indexOf(child)
        if (index >= 0) {
            child.exitTree()
            child.parent = undefined;
            this.children.splice(index, 1);
        }
    }

    /**
     * 设置所在的父节点的子排序
     * @param index 
     */
    setParentIndex(index: number) {
        if (this.parent) {
            const children = this.parent.children;
            const currentIndex = children.indexOf(this);

            if (currentIndex >= 0 && currentIndex !== index) {
                children.splice(currentIndex, 1);
                children.splice(index, 0, this);
            }
        }
    }

    /**
     * 判断节点是不是父节点（包括所有祖辈节点）
     * @param parent 
     */
    isParent(parent: Container) {
        /* eslint-disable @typescript-eslint/no-this-alias */
        let node: Container | undefined = this;
        while (node) {
            if (!node.parent) {
                return
            }
            if (node === parent) {
                return true;
            }
            node = node.parent;
        }
        return false;
    }

    /**
     * 判断节点是不是子节点（包括所有子孙节点）
     * @param child 
     */
    isChild(child: Container) {
        return child.isParent(this);
    }

    drawDebug() { }
    draw() { }
    postDraw() {
        this.forEachChildren((child) => {
            if (!child.sleep) {
                child.draw();
            }
            if (this.engine.debugger?.debugger) {
                child.drawDebug()
            }
            if (!child.sleep || child.onlySelfSleep) {
                child.postDraw();
            }
            if (!child.isReady) {
                child.ready()
            }
        })
    }

    update(dt: number) {
        // ready 是下一帧时调用，这个时候节点都被draw过了一次
        if (this.isReady) {
            this.onUpdate(dt)
        }
        // 子类实现
    }

    postUpdate(dt: number) {
        this.forEachChildren((child) => {
            child.update(dt);
            child.postUpdate(dt);
        })
    }

    destory() {
        this.listened.forEach((v) => {
            v.emitter.off(v.eventName, v.func)
        })
        if (this.resident) {
            this.engine.removeResident(this)
        }
        this.removeFromParent()
        this.forEachChildren((child) => {
            child.destory()
        })
    }
    /**
     * @ignore
     */
    enterTree() {
        this.onEnterTree()
    }
    /**
     * @ignore
     */
    exitTree() {
        this.onExitTree()
    }
    /**
     * @ignore
     */
    ready() {
        this.isReady = true
        this.onReady()
    }

    onEnterTree() { }
    onExitTree() { }
    onReady() { }
    onUpdate(_dt: number) { }

    getMouseGlobalPositon() {
        return this.engine.mouse.mousePosition
    }

    forEachChildren(fn: (child: Container) => void) {
        this.children.forEach(fn);
    }
    /**
     * 根据tag查找子节点
     * @param tag 要查找的tag
     * @returns 找到的子节点数组
     */
    findByTag(tag: string, deep: boolean=true): Container[] {
        const result: Container[] = [];
        this.forEachChildren((child) => {
            if (child.tag.has(tag)) {
                result.push(child);
            }
            if (deep) {
                const foundChildren = child.findByTag(tag, deep);
                result.push(...foundChildren);
            }
        });
        return result;
    }
    /**
     * 遍历所有子节点
     * @param fn 应用到每个子节点的函数。如果函数返回非false值，则停止遍历。
     * @returns 如果任何fn调用返回了非false值，则返回该值；否则返回false。
     */
    traverseChildren(fn: (child: Container) => any): any {
        // 首先应用函数到自己
        let result = fn(this);
        if (result !== false) {
            return result;
        }

        // 递归遍历每个子节点
        for (let child of this.children) {
            result = child.traverseChildren(fn); // 递归调用
            if (result !== false) {
                return result; // 如果找到了满足条件的子节点，提前返回结果
            }
        }

        // 如果所有子节点都没有满足条件，返回false
        return false;
    }
}

export default Container