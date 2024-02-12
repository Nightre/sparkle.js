/**
 * MathUtil 类包含一些常用的数学工具函数。
 * @category Math
 */
class MathUtil {
    /**
     * 将角度转换为弧度。
     * @param degrees 要转换的角度。
     * @returns 对应的弧度。
     */
    static degreesToRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * 将弧度转换为角度。
     * @param radians 要转换的弧度。
     * @returns 对应的角度。
     */
    static radiansToDegrees(radians: number): number {
        return radians * (180 / Math.PI);
    }

    /**
     * 返回一个介于0（包含）和1（不包含）之间的随机数。
     * @returns 随机数。
     */
    static random(): number {
        return Math.random();
    }

    /**
     * 返回一个介于min（包含）和max（包含）之间的随机整数。
     * @param min 最小值。
     * @param max 最大值。
     * @returns 随机整数。
     */
    static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 从给定的选项数组中随机选择一个元素。
     * @param options 选项数组。
     * @returns 随机选择的元素。
     */
    static choose<T>(options: T[]): T {
        const index = Math.floor(Math.random() * options.length);
        return options[index];
    }

    /**
     * 线性插值。
     * @param start 起始值。
     * @param end 结束值。
     * @param t 插值参数，介于0和1之间。
     * @returns 插值结果。
     */
    static lerp(start: number, end: number, t: number): number {
        return start * (1 - t) + end * t;
    }

    /**
     * 将数值限制在指定范围内。
     * @param value 要限制的数值。
     * @param min 最小值。
     * @param max 最大值。
     * @returns 限制在范围内的数值。
     */
    static clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }
}

export default MathUtil