import { Container } from "../main";
import { SparkleEngine } from "../engine"

abstract class Sence {
    abstract create(engine: SparkleEngine): Container
    abstract createOnce(engine: SparkleEngine): void
    instantiate(engine: SparkleEngine) {
        return engine.instantiateSence(this)
    }
}

export default Sence