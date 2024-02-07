import { Container } from "../main";
import { SparkleEngine } from "../engine"

/**
 * 场景类，一个场景仅负责创建，若changeSenceTo
 * 那么会自动调用实例化，不过你也可以自己调用实例化
 */
abstract class Sence {
    /**
     * 创建该场景所需东西
     * @param engine
     */
    abstract create(engine: SparkleEngine): Container
    /**
     * 仅创建一次，你可以在这里创建 常驻节点
     * @param engine 
     */
    abstract createOnce(engine: SparkleEngine): void
    instantiate(engine: SparkleEngine) {
        return engine.instantiateSence(this)
    }
}

export default Sence