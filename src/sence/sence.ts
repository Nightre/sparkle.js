import { Container, SparkleEngine } from "../main";

/**
 * 场景
 * @example
 *  ```
 * class GameScene extends Scene{
 *      preload(){
 *           engine.loader.baseUrl = "."
 *           engine.resource.loadTexture("static_img", "ground.png")
 *           engine.resource.loadTexture("entity_img", "img.png")
 *      }
 *      create(){
 *          retrun Container
 *      }
 * }
 * 
 * ```
 */
abstract class Scene {
    /**
     * 预加载，所有需要的资源可以在此处加载
     */
    preload() { }
    /**
     * 创建这个场景，返回一个 Container
     * @param engine 游戏引擎
     */
    abstract create(engine: SparkleEngine): Container
}

export default Scene