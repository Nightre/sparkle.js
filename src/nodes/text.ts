import { BaseTexture } from "../video/texture/texture";
import Drawable from "./drawable";
import { ITextOptions } from "../interface"
import { TextAnchor } from "../main";
import TextureCompositors from "../video/compositors/texture_compositor"
/**
 * 精灵
 * @category GameNode
 */
class Text extends Drawable {
    private texture!: BaseTexture;
    /**
     * 文字的字体
     */
    font: string
    /**
     * 文字锚点
     */
    anchor: TextAnchor
    private _text!: string;
    public get text(): string {
        return this._text;
    }
    public set text(v: string) {
        this.setText(v)
        this._text = v;
    }
    /**
     * 设置text显示的文字请修改text属性即可
     * @param options 
     */
    constructor(options: ITextOptions) {
        super(options);
        this.color = options.color ?? this.pool.Color.pull(1, 1, 1, 1)
        this.font = options.font ?? "16px Arial"
        this.text = options.text ?? ""
        this.anchor = options.anchor ?? TextAnchor.LEFT
    }
    /**
     * @ignore
     * @returns 
     */
    draw(): void {
        super.draw();
        const m = this.renderer.modelMatrix
        switch (this.anchor) {
            case TextAnchor.CENTER:
                m.translate(-this.drawSize.x/2, 0)
                break;
            case TextAnchor.RIGHT:
                m.translate(-this.drawSize.x, 0)
                break;
        }
        if (!this.visible) {
            return
        }
        this.renderer.setCompositors("texture");
        const compositors = this.renderer.currentCompositors as TextureCompositors;
        compositors.addQuad(this.texture, false);
        compositors.setColor(this.color)

        compositors.flush();
    }
    private setText(text: string) {
        const Images = this.engine.text.drawText(
            text,
            this.font,
            this.color
        )
        if (this.texture) {
            this.texture.setImage(
                Images
            )
        } else {
            this.texture = this.engine.texture.createBaseTexture(
                Images
            )
        }
        this.drawSize.set(
            this.texture.width,
            this.texture.height,
        )
    }
}

export default Text