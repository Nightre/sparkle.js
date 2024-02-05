import { BaseTexture } from "../video/texture/texture";
import Drawable from "./drawable";
import { ITextOptions } from "../interface"
import { Color } from "../main";

/**
 * 精灵
 * @category GameNode
 */
class Text extends Drawable {
    private texture!: BaseTexture;
    color: Color = this.pool.Color.pull(0, 0, 0, 1);
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
        this.text = options.text ?? " "
        this.font = options.font ?? "16px Arial"
        this.setText(this.text)
    }
    draw(): void {
        super.draw();
    }
    setText(text: string) {
        this.texture.setImage(
            this.engine.text.drawText(
                text,
                this.font,
                this.color
            )
        )
    }
}

export default Text