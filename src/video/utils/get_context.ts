

const getContext = (canvas: HTMLCanvasElement, attr: WebGLContextAttributes): WebGLRenderingContext => {
    const gl = canvas.getContext("webgl", attr)
    if (!gl) {
        throw new Error("Your browser does not support webgl");
    }
    return gl
}

export default getContext