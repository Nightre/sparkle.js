import { ICopyable } from "../interface";
import { IPoolable } from "../interface";
import pool from "../system/pool";

/**
 * 矩阵
 * @category Math
 */
export default class Matrix implements IPoolable, ICopyable<Matrix> {
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
    /**
     * @ignore
     * @param array 
     */
    poolReset(array?: Float32Array) {
        if (array) {
            this.setMatrix(
                array
            );
        } else {
            this.identity();
        }
    }

    identity() {
        this.setMatrix(
            [
                1, 0, 0,
                1, 0, 0
            ]
        );
    }
    /**
     * 旋转这个矩阵
     * @param r 
     */
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
    /**
     * 缩放矩阵
     * @param x 
     * @param y 
     */
    scale(x: number, y = x) {
        this.element[0] = this.element[0] * x;
        this.element[1] = this.element[1] * x;
        this.element[2] = this.element[2] * y;
        this.element[3] = this.element[3] * y;
    }
    /**
     * 平移矩阵
     * @param x 
     * @param y 
     */
    translate(x: number, y: number) {
        this.element[4] = this.element[0] * x + this.element[2] * y + this.element[4];
        this.element[5] = this.element[1] * x + this.element[3] * y + this.element[5];
    }
    /**
     * 斜切
     * @param x 
     * @param y 
     */
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
    /**
     * 直接设置
     * @param v 
     */
    setMatrix(v: number[] | Float32Array) {
        v.forEach((value, index) => {
            this.element[index] = value;
        })
    }
    /**
     * 变换一个二维坐标
     * @param x 
     * @param y 
     * @returns 
     */
    apply(x: number, y: number) {
        return [
            x * this.element[0] + y * this.element[2] + this.element[4],
            x * this.element[1] + y * this.element[3] + this.element[5]
        ]
    }
    /**
     * 复制其他矩阵到该矩阵
     * @param martix 
     */
    copy(martix: Matrix) {
        this.setMatrix(
            martix.element
        )
    }
    /**
     * 克隆矩阵
     * @returns 
     */
    clone() {
        return pool.Matrix.pull(this.element);
    }
    /**
     * 逆矩阵
     * @returns 
     */
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

        return pool.Matrix.pull(invertedElements);
    }
    /**
     * 获取该矩阵的角度
     * @returns 
     */
    getRotation() {
        return Math.atan2(this.element[1], this.element[0]);
    }
    /**
     * 获取该矩阵的缩放
     * @returns 
     */
    getScale() {
        const x = Math.sqrt(this.element[0] * this.element[0] + this.element[1] * this.element[1]);
        const y = Math.sqrt(this.element[2] * this.element[2] + this.element[3] * this.element[3]);
        return [x, y];
    }
    /**
     * 设置绝对缩放
     * @param x 
     * @param y 
     */
    setAbsoluteScale(x: number, y = x) {
        const scale =  this.getScale()
        const scaleX = x / scale[0];
        const scaleY = y / scale[1];

        this.scale(scaleX, scaleY);
    }
}
