import { Container, SparkleEngine } from "../main";

abstract class Sence {
    /**
     * 预加载，所有需要的资源可以在此处加载
     */
    preload() { }
    /**
     * 创建这个场景，返回一个 Container
     * @param engine 游戏引擎
     */
    abstract create(engine: SparkleEngine):Container
}

export default Sence