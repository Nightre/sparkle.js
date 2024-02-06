import { SparkleEngine, Sprite } from "../../src/main";
import { ITool } from "../test";

export default async function (sparkle: SparkleEngine, tool: ITool) {
    sparkle.loader.baseUrl = "/test/static"

    const cat = new Sprite({
        engine: sparkle,
        texture: await sparkle.texture.textureFromUrl("cat.png"),
    })

    setTimeout(async () => {
        cat.texture = await sparkle.texture.textureFromUrl("cat2.jpg")
    }, 333);

    setTimeout(async () => {
        cat.enableRegion = true
        cat.position.set(150, 150)
        cat.offset.set(50, 50)
        cat.rotation = 0.5
        cat.textureRegion = {
            x: 50, y: 50, w: 250, h: 250
        }
        cat.color.setColor(1, 1, 1, 0.5)
    }, 1000);

    sparkle.root.addChild(
        cat
    )
}