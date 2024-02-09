import { BaseTexture } from "../video/texture/texture";
import Drawable from "./drawable";
import { ITextOptions } from "../interface"
import { Color, TextureCompositors } from "../main";

/**
 * 精灵
 * @category GameNode
 */
class Text extends Drawable {
    private texture!: BaseTexture;
    color: Color
    font: string
    private _text!: string;
    public get text(): string {
        return this._text;
    }
    public set text(v: string) {
        this.setText(v)
        this._text = v;
    }

    constructor(options: ITextOptions) {
        super(options);
        this.color = options.color ?? this.pool.Color.pull(1, 1, 1, 1)
        this.font = options.font ?? "16px Arial"
        this.text = options.text ?? " "        
    }
    draw(): void {
        super.draw();
        if (!this.visible) {
            return
        }
        this.renderer.setCompositors("texture");
        const compositors = this.renderer.currentCompositors as TextureCompositors;
        compositors.addQuad(this.texture, false);
        compositors.setColorByRGBA(1,1,1,1)

        compositors.flush();
    }
    setText(text: string) {
        const texImageSource = this.engine.text.drawText(
            text,
            this.font,
            this.color
        )
        if (this.texture) {
            this.texture.setImage(
                texImageSource
            )
        } else {
            this.texture = this.engine.texture.createBaseTexture(
                texImageSource
            )
        }
        this.drawSize.set(
            this.texture.width,
            this.texture.height,
        )
    }
}

export default Text