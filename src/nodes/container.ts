import { ObjectPool } from "../pool";
import { Renderer } from "../video/renderer";

import { IContainerOptions } from "../interface"
import { SparkleEngine } from "../engine";

/**
 * 所有游戏对象的基类，可以容纳子节点
 * @category GameNode
 */
class Container {
    engine: SparkleEngine
    renderer: Renderer
    pool: ObjectPool
    parent?: Container
    children: Container[] = []

    constructor(options: IContainerOptions) {
        this.engine = options.engine;
        this.renderer = this.engine.renderer;
        this.pool = this.engine.pool;
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
     * @param parent 
     */
    setParent(parent: Container) {
        // 如果当前节点已经有父节点，则先从原来的父节点中移除
        if (this.parent) {
            this.parent.removeChild(this);
        }

        // 将当前节点添加到新的父节点中
        this.parent = parent;
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
            child.draw();
            child.postDraw();
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

    forEachChildren(fn: (child: Container) => void) {
        this.children.forEach(fn);
    }

    destory() { }
}

export default Container