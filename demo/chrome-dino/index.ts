import { SparkleEngine, Container, Sprite, Rect, Vector2, Collision, Text } from "../../src/main"

// 创建
const engine = new SparkleEngine({
    // 指定游戏画布元素
    canvas: document.getElementById("game") as HTMLCanvasElement,
    antialias: false, // 像素画就关闭抗锯齿
    width: 74 * 10,
    height: 37 * 10
})
// 设置加载资源的基础路径
engine.loader.baseUrl = "."
const staticTexture = await engine.texture.textureFromUrl("ground.png")
const entityTexture = await engine.texture.textureFromUrl("img.png")

const bgTexture = engine.texture.altasFromTexture(staticTexture, new Rect(12, 11, 74, 37))
const groundTexture = engine.texture.altasFromTexture(staticTexture, new Rect(10, 0, 74, 37))
const playerTexture = engine.texture.altasFromTexture(entityTexture, new Rect(0, 0, 50, 15))
const obstacleTexture = engine.texture.altasFromTexture(staticTexture, new Rect(0, 0, 10, 35))


// 可以使用状态函数（闭包函数）或者是继承 Sprite，两种都行
// playerSence 是状态函数
const Player = () => {
    let velocityY = 0 // 加速度，用于跳跃
    let step = 0 // 未来将会加入 Timer 就不需要这样了
    let touch_ground = false // 是否触碰到地面

    const player = new Sprite({
        engine: engine,
        texture: playerTexture,
        position: new Vector2(80, 240),
        scale: new Vector2(5),
        hFrames: 4,
        vFrames: 1,
        gapSize: 1
    })
    const collision = new Collision({
        engine, shape: [
            new Vector2(0, 0),
            new Vector2(10, 0),
            new Vector2(10, 10),
            new Vector2(0, 10),
        ]
    })
    player.addChild(
        collision
    )
    player.onReady = () => {
        player.setAnimation(0)
    }

    // 添加标签，标签可以拥有多个，标签可以用于检测到碰撞时识别
    // 也可以用于查找节点，比如说要获取场景里面所有的怪物，那么
    // 就应该给每个怪都加一个“zombie”标签，然后玩家碰撞到一个物体
    // 时，就检测这个物体有没有 zombie 标签
    player.tag.add("player")

    player.onUpdate = (dt) => {
        player.setAnimation(Math.ceil(step / 5) % 4)
        velocityY += 800 * dt
        player.position.y += velocityY * dt
        if (player.position.y > 240) {
            player.position.y = 240
            touch_ground = true
        } else {
            touch_ground = false
        }
        collision.collisionDetection().forEach((result) => {
            // 碰撞是基于SAT碰撞，result返回两个参数，一个是overlap向量，一个是碰撞到的collision
            if (result.body.tag.has("obstacle")) {
                engine.changeSenceToNode(loseSence())
            }
        })
        step++ // 未来将会加入 Timer 就不需要这样了
    }
    // 使用这种方法监听，可以在player被摧毁的时候自动取消监听
    // 若希望在节点被摧毁时，监听依然存在可以使用 engine.input.on
    player.onEvent(engine.input, "onKeyDown", (key: string) => {
        if (key == 'w' && touch_ground) { // jump key
            console.log("JUMP")
            velocityY = -600
        }
    })

    return player
}

// 这是另外一种编写模式，是继承某个类
// 若你觉得这种方法不和你口味，可以使用上面的 playerSence的
// 状态函数方式来写
class GameManager extends Container { // Container 是所有节点的基类，他能有多个子节点，一个父节点
    step: number = 0 // 未来将会加入 Timer 就不需要这样了
    onReady(): void {
        // onReady 在其所有子节点被加载完毕并准备好后被引擎调用

    }
    onUpdate(_dt: number): void {
        // onUpdate 会在每一帧被引擎调用
        // 未来将会加入 Timer 就不需要这样了
        if (this.step % 80 == 0 && Math.random() > 0.2) {
            this.createObstacle()
        }
        this.step++
    }
    createObstacle() {
        const obstacle = new Obstacle(engine)
        obstacle.position.set(740, Math.random() > 0.5 ? 250 : 200)
        this.root.addChild(
            obstacle
        )
    }
}

// 若你不喜欢这样写，可以查看Player的另外一种的写法
class Obstacle extends Sprite {
    collision: Collision
    constructor(engine: SparkleEngine) {
        super({
            texture: obstacleTexture,
            scale: new Vector2(5),
            engine
        })
        this.collision = new Collision({
            engine, shape: [
                new Vector2(0, 0),
                new Vector2(10, 0),
                new Vector2(10, 35),
                new Vector2(0, 35),
            ]
        })
        this.collision.tag.add("obstacle")
        this.addChild(
            this.collision
        )
    }
    onUpdate(_dt: number): void {
        this.position.x -= _dt * 200
        if (this.position.x < -50) {
            this.destory()
        }
    }
}

// 使用状态函数编写的方式，可以使用另外一中方式，请看Obstacle
const mainSence = () => {
    const root = new Container({
        engine: engine
    })

    const ground = new Sprite({
        engine: engine,
        texture: groundTexture,
        position: new Vector2(0, 30)
    })

    const bg = new Sprite({
        engine: engine,
        texture: bgTexture,
        scale: new Vector2(10)
    })

    bg.addChild(
        ground
    )
    root.addChild(bg)
    root.addChild(new GameManager({ engine }))
    root.addChild(Player())

    return root
}

const PlayAgin = () => {
    const collision = new Collision({
        engine,
        shape: [
            new Vector2(0, 0),
            new Vector2(130, 0),
            new Vector2(130, 50),
            new Vector2(0, 50),
        ]
    })

    const playAgin = new Text({
        engine,
        text: "[重新开始]",
        font: "40px Arial",
        position:new Vector2(0,150)
    })
    playAgin.addChild(
        collision
    )
    collision.onUpdate=()=>{
        if (collision.mouseDetection()) {
            playAgin.scale.set(1.5)
        }else{
            playAgin.scale.set(1)
        }
    }
    collision.onClick=()=>{
        console.log("change")
        playAgin.position.x += 50
        engine.changeSenceToNode(mainSence())
    }
    return playAgin
}

const loseSence = () => {
    const root = new Container({
        engine: engine
    })

    root.addChild(new Text({
        engine,
        text: "你输了",
        font: "40px Arial"
    }))
    root.addChild(
        PlayAgin()
    )

    return root
}

engine.changeSenceToNode(mainSence())