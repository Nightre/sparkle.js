import { Container, SparkleEngine } from "../main";

abstract class Sence {
    preload() { }
    abstract create(_engine: SparkleEngine):Container
}

export default Sence