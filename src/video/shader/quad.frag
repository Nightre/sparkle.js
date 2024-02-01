uniform sampler2D uSampler;
varying vec2 vRegion;
void main(void) {
    gl_FragColor = texture2D(uSampler, vRegion);
}
