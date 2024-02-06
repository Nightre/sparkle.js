import { Color, SparkleEngine, Text } from "../../src/main";
import { ITool } from "../test";

export default async function (sparkle: SparkleEngine, tool: ITool) {
    sparkle.loader.baseUrl = "/test/static"
    sparkle.debugger!.toggleDebugger()

    let z = new Text({
        engine: sparkle,
        text: "I want my tears back!",
        color: new Color(1, 1, 1, 1),
        font:"32px Arial"
    })
    z.position.set(100, 100)
    sparkle.root.addChild(z)
}