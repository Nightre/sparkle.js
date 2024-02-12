import { SparkleEngine, Sprite, Vector2 } from "../../src/main";
import { ITool } from "../test";

export default async function (sparkle: SparkleEngine, tool: ITool) {
    sparkle.loader.baseUrl = "/test/static"
    sparkle.debugger!.toggleDebugger()
    const cat = new Sprite({
        engine: sparkle,
        texture: await sparkle.texture.textureFromUrl("cat2.jpg"),
    })
    const cat1 = new Sprite({
        engine: sparkle,
        texture: await sparkle.texture.textureFromUrl("cat.png"),
    })
    cat.addChild(cat1)
    const cat2 = new Sprite({
        engine: sparkle,
        texture: await sparkle.texture.textureFromUrl("cat.gif"),
    })
    cat1.addChild(cat2)



    cat.position.set(50, 50)
    cat1.position.set(20, 20)
    cat2.position.set(20, 20)
    cat2.offset.set(100,100)

    // setTimeout(() => {
    //     if (
    //         cat2.globalPosition.x != 50 + 20 + 20 ||
    //         cat2.globalPosition.y != 50 + 20 + 20
    //     ) {
    //         tool.fail("global_position")
    //     }
    //     //cat2.setGlobalPosition(new Vector2(50, 50))
    //     setTimeout(() => {
    //         if (
    //             cat2.globalPosition.x != 50 ||
    //             cat2.globalPosition.y != 50
    //         ) {
    //             tool.fail("global_position" + cat2.globalPosition.x)
    //         }
    //     }, 1000);
    // }, 1000);

    sparkle.changeSenceToContainer(cat)
}