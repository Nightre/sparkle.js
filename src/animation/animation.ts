import { IAnimationFrames, IAnimationOption, ResourcesType } from "../interface";
import { IResources, Texture } from "../main";
import pool from "../system/pool";

class Animations implements IResources {
    resourcesId?: string;
    resourcesType = ResourcesType.ANIMATION
    hFrames: number
    vFrames: number
    gapSize: number
    texture: Texture
    animations: { [name: string]: IAnimationFrames };

    constructor(options: IAnimationOption) {
        this.hFrames = options.hFrames
        this.vFrames = options.vFrames
        this.gapSize = options.gapSize
        this.texture = options.texture
        this.animations = options.animations
    }
    getAniData(name: string) {
        return this.animations[name]
    }

    getAnimationRegion(frame: number) {
        if (!this.texture || !this.texture.baseTexture) {
            return;
        }
        if (this.vFrames > 0 && this.hFrames > 0) {
            if (frame > this.vFrames * this.hFrames - 1) {
                throw new Error("There aren't as many animations, please adjust vFrames and hFrames");
            }
            const cordx = frame % this.hFrames;
            const cordy = Math.floor(frame / this.hFrames);

            const fsw = Math.floor(this.texture.width / this.hFrames) + this.gapSize; // Add gapSize for horizontal gap
            const fsh = Math.floor(this.texture.height / this.vFrames) + this.gapSize; // Add gapSize for vertical gap

            return pool.Rect.pull(
                cordx * fsw,
                cordy * fsh,
                fsw - this.gapSize, // Subtract gapSize to maintain frame size
                fsh - this.gapSize  // Subtract gapSize to maintain frame size
            )
        } else {
            throw new Error("vFrames and hFrames should be greater than 0");
        }
    }
}

export default Animations