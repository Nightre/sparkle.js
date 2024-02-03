/**
 * @ignore
 */
function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader)!);
    }

    return shader;
}

/**
 * Compile GLSL into a shader object
 * @ignore
 */
export function compileProgram(gl: WebGLRenderingContext, vertex: string, fragment: string) {
    const vertShader = compileShader(gl, gl.VERTEX_SHADER, vertex);
    const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragment);

    let program = gl.createProgram();

    if (!program) {
        throw new Error("can't create webgl program");
    }

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);


    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const error_msg =
            "Error initializing Shader " +
            "gl.VALIDATE_STATUS: " + gl.getProgramParameter(program, gl.VALIDATE_STATUS) + "\n" +
            "gl.getError()" + gl.getError() + "\n" +
            "gl.getProgramInfoLog()" + gl.getProgramInfoLog(program);
        // house cleaning
        gl.deleteProgram(program);
        program = null;
        // throw the exception
        throw new Error(error_msg);
    }

    gl.useProgram(program);

    // clean-up
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);

    return program;
}
/**
 * @ignore
 * @param gl 
 * @returns 
 */
export function createBuffer(gl: WebGLRenderingContext) {
    const buffer = gl.createBuffer()
    if (!buffer) {
        throw new Error("Unable to create buffer");
    }
    return buffer
}