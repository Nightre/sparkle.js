import GLShader, { AttributesLocation } from "../glshader";

/**
 * @ignore
 */
export function extractAttributes(shader: GLShader) {
    let attributes: AttributesLocation = {},
        attrRx = /attribute\s+\w+\s+(\w+)/g,
        match,
        i = 0;

    // Detect all attribute names
    while ((match = attrRx.exec(shader.vertex))) {
        attributes[match[1]] = i++;
    }

    return attributes;
}