import { Renderer } from "../video/renderer";

import { IContainerOptions } from "../interface"
import { SparkleEngine } from "../engine";
import EventEmitter from "../system/event";
import pool, { PoolManager } from "../system/pool";

/**
 * 所有游戏对象的基类，可以容纳子节点
 * @category GameNode
 */
class Container extends EventEmitter<{}> {
    protected engine: SparkleEngine
    protected renderer: Renderer

    parent?: Container | null
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
     * 是否为常驻节点，如果是常驻节点的话
     * 在切换场景时不会被销毁（其子节点同样不会被销毁）
     * 注意：常驻节点必须是根节点的一级子节点
     */
    tag: Set<string> = new Set
    pool: PoolManager
    readonly resident: boolean

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
    }

    /**
     * 添加一个子节点
     * @param child 
     */
    addChild(child: Container) {
        child.setParent(this);
    }

    /**
     * 设置父节点
     * 如果当前节点已经有父节点，则先从原来的父节点中移除
     * @param parent 
     */
    setParent(parent: Container | null) {
        // 如果当前节点已经有父节点，则先从原来的父节点中移除
        if (this.parent) {
            this.parent.removeChild(this);
        }

        // 将当前节点添加到新的父节点中
        this.parent = parent
        if (parent) {
            parent.children.push(this);
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

    draw() {
        // 子类实现
    }
    postDraw() {
        this.forEachChildren((child) => {
            if (!child.sleep) {
                child.draw();
            }
            if (!child.sleep || child.onlySelfSleep) {
                child.postDraw();
            }
        })
    }

    /* eslint-disable @typescript-eslint/no-unused-vars */
    update(_dt: number) {

        // 子类实现
    }
    postUpdate(dt: number) {
        this.forEachChildren((child) => {
            child.update(dt);
            child.postUpdate(dt);
        })
    }


    destory() {
        this.engine.removeResident(this)
    }

    postDestory() {
        this.forEachChildren((child) => {
            child.destory()
            child.postDestory()
        })
    }

    forEachChildren(fn: (child: Container) => void) {
        this.children.forEach(fn);
    }
    /**
     * 根据tag查找子节点
     * @param tag 要查找的tag
     * @returns 找到的子节点数组
     */
    findByTag(tag: string): Container[] {
        const result: Container[] = [];
        this.forEachChildren((child) => {
            if (child.tag.has(tag)) {
                result.push(child);
            }
            const foundChildren = child.findByTag(tag);
            result.push(...foundChildren);
        });
        return result;
    }

}

export default Container