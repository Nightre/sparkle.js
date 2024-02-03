import { SparkleEngine, Sprite, Vector2 } from "../../../src/main"

const sparkle = new SparkleEngine({
    canvas: document.getElementById("canvas")
})

sparkle.loader.baseUrl = "/example_img"
const carTexture = await sparkle.texture.textureFromUrl("cat.png")

let cat = new Sprite({
    engine: sparkle,
    texture: carTexture,
})
let cat2 = new Sprite({
    engine: sparkle,
    texture: carTexture,
})
cat.position.set(200, 200)
cat.offset.set(320 / 2, 320 / 2)
cat.addChild(cat2)

cat2.position.set(50, 50)

sparkle.root.addChild(cat)

console.log(
    sparkle
)