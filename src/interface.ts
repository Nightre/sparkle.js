import { SparkleEngine } from "./engine"
import Vector2 from "./math/vector"
import { PoolManager } from "./system/pool"
import Color from "./math/color"
import { Renderer } from "./video/renderer"
import { Texture } from "./video/texture/texture"
import Collision from "./nodes/collision"
import { EventEmitter } from "./main"

export interface ICopyable<T> {
    copy: (obj: T) => void
    clone: (pool: PoolManager) => T
}
export interface IDestoryable {
    destory: () => void
}

// engine //
export interface ISparkleEngineOption {
    canvas: HTMLCanvasElement,
    antialias?: boolean,
    maxFPS?: number,
    pixelDensity?: number
    width?: number
    height?: number
    scaleMode: SCALE_MODE
}

// Pool //

// eslint-disable-next-line @typescript-eslint/no-explicit-any

export interface PoolTypes {
    [key: string]: IPoolable
}

export type Constructor<T> = new (...args: any[]) => T;
export interface IPoolable {
    className: string;
    poolReset(...args: any[]): void;
}

// Node //
export interface IDrawableOptions extends ITransform2DOptions {
    color?: Color
}
export interface IContainerOptions {
    engine: SparkleEngine
    resident?: boolean
}
export interface ITransform2DOptions extends IContainerOptions {
    position?: Vector2;
    scale?: Vector2;
    rotation?: number;
    skew?: Vector2;
    offset?: Vector2;
}
export interface ISpriteOptions extends IDrawableOptions {
    texture?: Texture;
}
export interface ICollisionOptions extends ITransform2DOptions {
    shape: IRect
}
// Compositor //
export interface ICompositorOptions {
    renderer: Renderer
    attributes: AttributeInfo[]
    vertexShader: string
    fragmentShader: string
}

// Render Attribute //
export enum SCALE_MODE {
    /**
     * 在这种模式下，NativeSize会根据canvas
     * 的实际大小变化而动态调整，以保持内容与canvas大小的一致性。
     */
    ADAPTIVE,
    /**
     * 在这种模式下，无论canvas的实际大小如何变化，NativeSize保持
     * 不变。这意味着内容可能会被拉伸或压缩以适应canvas的大小，但其原始比例不会改变。
     */
    FIXED,
}
export type AttributesLocation = Record<string, number>
export interface AttributeInfo {
    name: string
    size: number
    type: number
    normalized?: boolean
    offset: number
}
export type TextureUniId = string | TexImageSource
// Render  //
export interface IRenderOptions {
    /** canvas */
    canvas: HTMLCanvasElement
    /** 是否启用抗锯齿 */
    antialias?: boolean
    pixelDensity?: number
    width?: number
    height?: number,
    scaleMode: SCALE_MODE
}

// Input //
export interface IInputEvents {
    onKeyDown: (key: string) => void
    onKeyPress: (key: string) => void
    onKeyPressRepeat: (key: string) => void
    onKeyRelease: (key: string) => void
}

// Input > Mouse //
export interface IMouseEvents {
    onMouseDown: (position: IMouseData) => void;
    onMouseMove: (position: IMouseData) => void;
    onMouseUp: (position: IMouseData) => void;
}
export interface IMouseData {
    position: Vector2
    event: MouseEvent
}

// 

export interface IRect {
    x: number,
    y: number,
    w: number,
    h: number
}
export enum PRIMITIVE_MODE {
    FILL,
    LINE
}
export interface ICollisionResult {
    body: Collision,
    overlap: Vector2
}
export interface IListened {
    emitter: EventEmitter<any>
    eventName: string
    func: Function
}