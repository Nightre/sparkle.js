import { SparkleEngine } from "./engine"
import Vector2 from "./math/vector"
import { ObjectPool } from "./pool"
import Color from "./math/color"
import { Renderer } from "./video/renderer"
import { Texture } from "./video/texture/texture"

export interface ICopyable<T> {
    copy: (obj: T) => void
    clone: (pool: ObjectPool) => T
}
export interface IDestoryable {
    destory: () => void
}

// engine //
export interface ISparkleEngineOption {
    canvas: HTMLCanvasElement,
    antialias?: boolean
}

// Pool //
export interface IPoolable {
    className?: string;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    poolReset(...args: any[]): void;
}
export type Class<T> = new (...args: any[]) => T;
export interface IObjectClassRecord<T> {
    class: Class<T>;
    pool: T[] | undefined;
}


// Node //
export interface IDrawableOptions extends ITransform2DOptions {
    color?: Color
}
export interface IContainerOptions {
    engine: SparkleEngine
}
export interface ITransform2DOptions extends IContainerOptions {
    position?: Vector2;
    scale?: Vector2;
    rotation?: number;
    skew?: Vector2;
}
export interface ISpriteOptions extends IDrawableOptions {
    texture?: Texture;
}

// Compositor //
export interface ICompositorOptions {
    renderer: Renderer
    attributes: AttributeInfo[]
    vertexShader: string
    fragmentShader: string
}

// Render Attribute //
export type AttributesLocation = Record<string, number>
export interface AttributeInfo {
    name: string
    size: number
    type: number
    normalized?: boolean
    offset: number
}
// Render  //
export interface IRenderOptions {
    /** canvas */
    canvas: HTMLCanvasElement
    /** 是否启用抗锯齿 */
    antialias?: boolean
}