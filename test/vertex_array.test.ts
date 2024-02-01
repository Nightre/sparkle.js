import VertexArray, { ARRAY_BUFFER_TYPE } from "../src/video/vertex_array"
import { expect, test, describe } from 'vitest'

describe("vertex array", () => {
    test("resize float32", () => {
        // let v = new VertexArray(2,ARRAY_BUFFER_TYPE.FLOAT32)
        // expect(v.bytePerElement).toBe(Float32Array.BYTES_PER_ELEMENT)
        // v.reSize(5)
        // expect(v.typedArray.length).toBe(16)
        // v.reSize(1)
        // expect(v.typedArray.length).toBe(16)
        let v = new VertexArray(1,ARRAY_BUFFER_TYPE.FLOAT32)
        v.push(5)
        v.push(5)
        expect(v.typedArray).toEqual(new Float32Array([5,5]))
        v.push(5)
        expect(v.typedArray).toEqual(new Float32Array([5,5,5,0]))
    })

    test("resize unit16", () => {
        let v = new VertexArray(1,ARRAY_BUFFER_TYPE.UINT16)
        expect(v.bytePerElement).toBe(Uint16Array.BYTES_PER_ELEMENT)
        v.reSize(5)
        expect(v.typedArray.length).toBe(8)
    })
})