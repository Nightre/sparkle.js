uniform sampler2D uSampler;

uniform vec4 uColor;
varying vec2 vRegion;

void main(void) {
    gl_FragColor = texture2D(uSampler, vRegion) * uColor;
}
