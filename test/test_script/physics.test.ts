import { SparkleEngine, Collision, Vector2 } from "../../src/main";
import { ITool } from "../test";

export default async function (sparkle: SparkleEngine, tool: ITool) {
    sparkle.loader.baseUrl = "/test/static"
    sparkle.debugger!.toggleDebugger()

    let z = new Collision({
        engine: sparkle, shape: [
            new Vector2(0, 0),
            new Vector2(100, 0),
            new Vector2(100, 100),
            new Vector2(0, 100),
        ]
    })
    let z1 = new Collision({
        engine: sparkle, shape: [
            new Vector2(0, 0),
            new Vector2(100, 0),
            new Vector2(0, 100),
        ]
    })
    z.position.set(100, 100)
    z.rotation = 0.5
    z1.position.set(200, 100)
    z1.scale.set(-2)
    z1.rotation = -0.5
    z1.onEnterTree = () => {
        setTimeout(() => {
            let c = z1.collisionDetection()
            z1.position.add(c[0].overlap)
        }, 1000);
    }
    sparkle.root.addChild(z)
    sparkle.root.addChild(z1)
}