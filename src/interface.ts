import { SparkleEngine } from "./engine"
import Vector2 from "./math/vector"
import { PoolManager } from "./system/pool"
import Color from "./math/color"
import { Renderer } from "./video/renderer"
import { Texture } from "./video/texture/texture"
import Collision from "./nodes/collision"
import { Audio, EventEmitter, GLShader, Rect } from "./main"
import Animations from "./animation/animation"

export interface ICopyable<T> {
    copy: (obj: T) => void
    clone: (pool: PoolManager) => T
}
export interface IDestoryable {
    destory: () => void
}

// engine //
export interface ISparkleEngineOption extends IRenderOptions {
    maxFPS?: number,
    disableDebugger?: boolean
}

// Pool //

// eslint-disable-next-line @typescript-eslint/no-explicit-any

export interface PoolTypes {
    [key: string]: IPoolable
}

export type Constructor<T> = new (...args: any[]) => T;
export interface IPoolable {
    poolReset(...args: any[]): void;
}

// Node //
export interface IDrawableOptions extends ITransform2DOptions {
    color?: Color
}
export interface IContainerOptions {
    engine?: SparkleEngine
    resident?: boolean
    tags?: string[]
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
    animations?: Animations
}
export interface AnimationsStore { [name: string]: IAnimationFrames }
export interface ILoadAnimationOptions {
    hFrames: number;
    vFrames: number;
    gapSize: number;
    /**
     * 若为string，则从url加载
     */
    animations: string | AnimationsStore;
}
export interface IAnimationOption {
    texture: Texture;
    hFrames: number;
    vFrames: number;
    gapSize: number;
    animations: AnimationsStore;
}

export interface IAnimationFrames {
    fromFrames: number,
    toFrames: number,
    time: number
}
export interface ICollisionOptions extends ITransform2DOptions {
    shape?: Vector2[]
}
export interface ITextOptions extends IDrawableOptions {
    text?: string,
    font?: string,
    color?: Color,
    anchor?: TextAnchor
}
export enum TextAnchor {
    CENTER, LEFT, RIGHT
}
export interface ITimerOptions extends IContainerOptions {
    waitTime: number,
    oneShot?: boolean,
    start?: boolean,
    initTimeLeft?: number
}

export interface ITimerEvents extends IContainerEvent {
    timeout(): void
}

// Compositor //
export interface ICompositorOptions {
    renderer: Renderer
    attributes: AttributeInfo[]
    vertexShader: string
    fragmentShader: string
    vertexPerObj?: number
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
// Render  //
export interface IRenderOptions {
    /** canvas */
    canvas: HTMLCanvasElement
    /** 是否启用抗锯齿 */
    antialias?: boolean
    pixelDensity?: number
    width?: number
    height?: number,
    scaleMode?: SCALE_MODE
    backgroundColor?: Color
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
export interface IAudioEvent {
    onEnd: () => void
}

export enum DebuggerDrawType {
    NORMAL,
    COLLISION,
    CROSS
}

export interface IDebuggerDraw {
    type: DebuggerDrawType,
    x: number,
    y: number,
    w?: number,
    h?: number
}

export interface IDrawOptions {
    position: Vector2
    color?: Color
    shader?: GLShader
}

export interface IDrawLineOptions extends IDrawOptions {
    lineWdith: number
}

export interface IDrawPolygonOptions extends IDrawOptions {

}

export type Resources = Audio | Texture

export interface ILoaderEvent {
    complete(): void
}

export enum ResourcesType {
    TEXTURE,
    AUDIO,
    DATA,
    ANIMATION
}

export interface ICollisionEvent extends IContainerEvent {
    onBodyEnter: (body: ICollisionResult) => void
    onBodyExit: (body: Collision) => void
    onClick: () => void
}
export interface IContainerEvent {
    onEnterTree: () => void
    onExitTree: () => void
    onReady: () => void
}
export interface IEventAble<T extends Record<string | symbol, any>> {
    event: EventEmitter<T>
}
export interface IResources {
    resourcesId?: string
    resourcesType: ResourcesType
}
export type Images = HTMLImageElement | ImageBitmap | ImageData | HTMLCanvasElement | HTMLVideoElement | OffscreenCanvas
export interface IResourcesManagerEvent {
    idle: () => void
    loaded: (r: IResources) => void
}
export interface IResourcesStore<T extends IResources = IResources> { [key: string]: T }

export enum GraphicalType {
    RECT,
    POLYGON,
    CIRCLE,
}

export interface IBaseGraphicalOptions extends IDrawableOptions  {
    fill?: boolean
    lineWidth?: number
}

export interface IRectOptions extends IBaseGraphicalOptions {
    type: GraphicalType.RECT;
    rect: Rect;
}

export interface IPolygonOptions extends IBaseGraphicalOptions {
    type: GraphicalType.POLYGON;
    path: Vector2[];
}

export interface ICircleOptions extends IBaseGraphicalOptions {
    type: GraphicalType.CIRCLE;
    radius: number;
}

export type IGraphicalOptions = IRectOptions | IPolygonOptions | ICircleOptions;