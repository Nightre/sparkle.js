// Current vertex point
attribute vec2 aPosition;
attribute vec2 aRegion;

uniform mat4 uProjectionMatrix;
varying vec2 vRegion;

void main(void) {
    gl_Position = uProjectionMatrix * vec4(aPosition, 0.0, 1.0);
    vRegion = aRegion;
}
