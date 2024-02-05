import { Container } from "../main";
import { SparkleEngine } from "../engine"

abstract class Sence {
    abstract create(engine: SparkleEngine): Container
    abstract createOnce(engine: SparkleEngine): void
    // TODO:添加实例化方法
}

export default Sence