// Current vertex point
attribute vec2 aPosition;
uniform mat4 uProjectionMatrix;
uniform vec4 uColor;

void main(void) {
    gl_Position = uProjectionMatrix * vec4(aPosition, 0.0, 1.0);
}
