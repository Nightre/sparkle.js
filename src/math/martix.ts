import { ICopyable } from "../interface";
import { IPoolable } from "../interface";
import pool from "../system/pool";

/**
 * 矩阵
 * @category Math
 */
export default class Matrix implements IPoolable, ICopyable<Matrix> {
    className = "Matrix"
    /**
     * [a, b, tx]
     * [c, d, tx]
     * a 和 d 表示 X轴和Y轴的缩放
     * b 和 c 表示旋转
     * tx 和 ty 表示沿X轴和Y轴的平移
     */
    element!: Float32Array
    constructor(array?: Float32Array) {
        this.element = new Float32Array(6)
        this.poolReset(array);
    }
    poolReset(array?: Float32Array) {
        if (array) {
            this.setTransform(
                array
            );
        } else {
            this.identity();
        }
    }

    identity() {
        this.setTransform(
            [
                1, 0, 0,
                1, 0, 0
            ]
        );
    }
    rotate(r: number) {
        const a = this.element[0],
            b = this.element[1],
            c = this.element[2],
            d = this.element[3],
            sr = Math.sin(r),
            cr = Math.cos(r);

        this.element[0] = a * cr + c * sr;
        this.element[1] = b * cr + d * sr;
        this.element[2] = a * -sr + c * cr;
        this.element[3] = b * -sr + d * cr;
    }
    scale(x: number, y = x) {
        this.element[0] = this.element[0] * x;
        this.element[1] = this.element[1] * x;
        this.element[2] = this.element[2] * y;
        this.element[3] = this.element[3] * y;
    }
    translate(x: number, y: number) {
        this.element[4] = this.element[0] * x + this.element[2] * y + this.element[4];
        this.element[5] = this.element[1] * x + this.element[3] * y + this.element[5];
    }
    skew(x: number, y = x) {
        const tanX = Math.tan(x);
        const tanY = Math.tan(y);

        const a = this.element[0];
        const b = this.element[1];
        const c = this.element[2];
        const d = this.element[3];

        // 应用沿Y轴斜切，影响第一列
        this.element[0] += tanY * b;
        this.element[2] += tanY * d;

        // 应用沿X轴斜切，影响第二列
        this.element[1] += tanX * a;
        this.element[3] += tanX * c;
    }

    setTransform(v: number[] | Float32Array) {
        v.forEach((value, index) => {
            this.element[index] = value;
        })
    }

    apply(x: number, y: number) {
        return [
            x * this.element[0] + y * this.element[2] + this.element[4],
            x * this.element[1] + y * this.element[3] + this.element[5]
        ]
    }
    copy(martix: Matrix) {
        this.setTransform(
            martix.element
        )
    }
    clone() {
        return pool.Matrix.pull(this.element);
    }
    invert() {
        const det = this.element[0] * this.element[3] - this.element[1] * this.element[2];
        if (det === 0) {
            console.error("Matrix is not invertible.");
            return null;
        }

        const invertedElements = new Float32Array(6);
        invertedElements[0] = this.element[3] / det;
        invertedElements[1] = -this.element[1] / det;
        invertedElements[2] = -this.element[2] / det;
        invertedElements[3] = this.element[0] / det;
        invertedElements[4] = (this.element[2] * this.element[5] - this.element[3] * this.element[4]) / det;
        invertedElements[5] = (this.element[1] * this.element[4] - this.element[0] * this.element[5]) / det;

        return pool.Matrix.pull(invertedElements)
    }
    getRotation() {
        // 由于a = this.element[0], b = this.element[1]
        // 可以使用Math.atan2(b, a)来获得旋转角度，它会返回一个介于 -π 到 π 之间的值
        return Math.atan2(this.element[1], this.element[0]);
    }
    getScale() {
        const scaleX = Math.sqrt(this.element[0] * this.element[0] + this.element[1] * this.element[1]);
        const scaleY = Math.sqrt(this.element[2] * this.element[2] + this.element[3] * this.element[3]);
        return { scaleX, scaleY };
    }
}
