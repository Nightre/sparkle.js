import { SparkleEngine, Container, Sprite, Rect, Vector2, Collision, Text, Texture, IContainerOptions, TextAnchor,Timer } from "../../src/main"


// 创建
const engine = new SparkleEngine({
    // 指定游戏画布元素
    canvas: document.getElementById("game") as HTMLCanvasElement,
    antialias: false, // 像素画就关闭抗锯齿
    width: 740,
    height: 370
})
// 设置加载资源的基础路径
engine.loader.baseUrl = "."
const staticTexture = await engine.texture.textureFromUrl("ground.png")
const entityTexture = await engine.texture.textureFromUrl("img.png")

const bgTexture = engine.texture.altasFromTexture(staticTexture, new Rect(12, 11, 74, 37))
const groundTexture = engine.texture.altasFromTexture(staticTexture, new Rect(10, 0, 74, 37))
const playerTexture = engine.texture.altasFromTexture(entityTexture, new Rect(0, 0, 50, 30))
const obstacleTexture = engine.texture.altasFromTexture(staticTexture, new Rect(0, 0, 10, 47))
const coinTexture = engine.texture.altasFromTexture(entityTexture, new Rect(51, 0, 8, 8))

const jumpMuisc = await engine.audio.audioFromUrl("jump.mp3")
const dieMuisc = await engine.audio.audioFromUrl("die.mp3")

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
        vFrames: 2,
        gapSize: 1,
        animations: {
            "run": {
                fromFrames: 0,
                toFrames: 3,
                time: 0.1
            },
            "fly": {
                fromFrames: 4,
                toFrames: 7,
                time: 0.1
            }
        }
    })
    let gameManager = player.root.findByTag("game_manager")[0] as GameManager
    const collision = new Collision({
        engine, shape: Collision.rectShape(0, 0, 12, 10)
    })
    player.addChild(
        collision
    )
    player.onReady = () => {
        player.setAnimation(0)
        gameManager = player.root.findByTag("game_manager")[0] as GameManager
    }

    // 添加标签，标签可以拥有多个，标签可以用于检测到碰撞时识别
    // 也可以用于查找节点，比如说要获取场景里面所有的怪物，那么
    // 就应该给每个怪都加一个“zombie”标签，然后玩家碰撞到一个物体
    // 时，就检测这个物体有没有 zombie 标签
    player.tag.add("player")
    
    player.onUpdate = (dt) => {
        velocityY += 800 * dt
        player.position.y += velocityY * dt
        if (player.position.y > 240) {
            player.position.y = 240
            touch_ground = true
            player.play("run", true)
        } else {
            touch_ground = false
            player.play("fly", true)
        }

        collision.collisionDetection().forEach((result) => {
            // 碰撞是基于SAT碰撞，result返回两个参数，一个是overlap向量，一个是碰撞到的collision
            if (result.body.tag.has("obstacle")) {
                dieMuisc.play()
                engine.changeSenceToNode(loseSence())
            } else if (result.body.tag.has("coin")) {
                (result.body.parent as Coin).pick()
                gameManager.getCoin();
            }
        })

        step++ // 未来将会加入 Timer 就不需要这样了
    }
    // 使用这种方法监听，可以在player被摧毁的时候自动取消监听
    // 若希望在节点被摧毁时，监听依然存在可以使用 engine.input.on
    player.onEvent(engine.input, "onKeyDown", (key: string) => {
        if (key == 'w' && touch_ground) { // jump key
            velocityY = -600
            jumpMuisc.play()
        }else if(key == 's'){
            velocityY += 250
        }
    })

    return player
}

// 这是另外一种编写模式，是继承某个类
// 若你觉得这种方法不和你口味，可以使用上面的 playerSence的
// 状态函数方式来写
class GameManager extends Container { // Container 是所有节点的基类，他能有多个子节点，一个父节点
    coin: number = 0
    score_text: Text
    timer: Timer

    constructor(options: IContainerOptions) {
        super(options)
        this.timer = this.addChild(
            new Timer({
                engine: options.engine,
                waitTime: 1,
                initTimeLeft: 1,
                start: true
            })
        )
        this.onEvent(this.timer, "timeout", this.createObstacle.bind(this))
    }

    onReady(): void {
        // onReady 在其所有子节点被加载完毕并准备好后被引擎调用
        this.tag.add("game_manager")
        this.score_text = this.root.findByTag("score_text")[0] as Text
    }

    createObstacle() {
        const obstacle = new Obstacle(engine)
        const coin = new Coin(engine)

        obstacle.position.set(740, Math.random() * 100 + 180)
        coin.position.set(760, obstacle.position.y - 40)
        this.root.addChild(
            obstacle
        )
        this.root.addChild(
            coin
        )
    }
    getCoin() {
        this.coin++
        this.score_text.setText("分数：" + this.coin)
    }
}

// 若你不喜欢这样写，可以查看Player的另外一种的写法
class MovingObject extends Sprite {
    collision: Collision
    constructor(
        texture: Texture,
        shape: Vector2[],
        engine: SparkleEngine
    ) {
        super({
            texture: texture,
            scale: new Vector2(5),
            engine
        })
        this.collision = new Collision({
            engine, shape
        })
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
class Obstacle extends MovingObject {
    constructor(engine: SparkleEngine) {
        super(obstacleTexture, Collision.rectShape(0, 0, 10, 35), engine)
        this.collision.tag.add("obstacle")
    }
}
class Coin extends MovingObject {
    constructor(engine: SparkleEngine) {
        super(coinTexture, Collision.rectShape(0, 0, 8, 8), engine)
        this.collision.tag.add("coin")
        this.offset.set(4, 4)
    }
    pick() {
        this.destory()
    }
    onUpdate(dt: number): void {
        super.onUpdate(dt)
        this.rotation += dt * 1
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
    root.addChild(new Text({
        engine,
        text: "分数：0",
        font: "30px Arial",
        position: new Vector2(5, 5),
        tags: ["score_text"]
    }))
    return root
}

const PlayAgin = () => {
    const collision = new Collision({
        engine,
        shape: Collision.rectShape(0, 0, 180, 50)
    })

    const playAgin = new Text({
        engine,
        text: "[重新开始]",
        font: "40px Arial",
        position: new Vector2(740 / 2, 250),
        anchor: TextAnchor.CENTER
    })
    playAgin.addChild(
        collision
    )
    collision.onUpdate = () => {
        if (collision.mouseDetection()) {
            playAgin.color.setColor(0,0,0,1)
        } else {
            playAgin.color.setColor(1,1,1,1)
        }
    }
    collision.onClick = () => {
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
        font: "40px Arial",
        position: new Vector2(740 / 2, 50),
        anchor: TextAnchor.CENTER
    }))
    root.addChild(new Text({
        engine,
        text: "分数：" + (engine.root.findByTag("game_manager")[0] as GameManager).coin,
        font: "40px Arial",
        position: new Vector2(740 / 2, 150),
        anchor: TextAnchor.CENTER
    }))

    root.addChild(
        PlayAgin()
    )

    return root
}

engine.changeSenceToNode(mainSence())