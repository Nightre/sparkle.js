import { SparkleEngine, Sence, Container, Sprite, Rect, Vector2, Collision, Text, Texture, IContainerOptions, TextAnchor, Timer, Animations, ICollisionResult, Audio } from "../../src/main"
const engine = new SparkleEngine({
    // 指定游戏画布元素
    canvas: document.getElementById("game") as HTMLCanvasElement,
    antialias: false, // 像素画就关闭抗锯齿
    width: 740,
    height: 370
})

const Player = () => {
    let velocityY = 0 // 加速度，用于跳跃
    let step = 0 // 未来将会加入 Timer 就不需要这样了
    let touch_ground = false // 是否触碰到地面

    const player = new Sprite({
        engine: engine,
        position: new Vector2(80, 240),
        scale: new Vector2(5),
        animations: engine.getAssets<Animations>("player_ani")
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

        step++ // 未来将会加入 Timer 就不需要这样了
    }
    collision.onBodyEnter = (res: ICollisionResult) => {
        const body = res.body
        if (body.tag.has("obstacle")) {
            engine.getAssets<Audio>("die_muisc").play()
            engine.changeToSence(LoseSence)
        } else if (body.tag.has("coin")) {
            (body.parent as Coin).pick()
            gameManager.getCoin();
        }
    }

    // 使用这种方法监听，可以在player被摧毁的时候自动取消监听
    // 若希望在节点被摧毁时，监听依然存在可以使用 engine.input.on
    player.onEvent(engine.input, "onKeyDown", (key: string) => {
        if (key == 'w' && touch_ground) { // jump key
            velocityY = -600
            engine.getAssets<Audio>("jump_muisc").play()
        } else if (key == 's') {
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
        const obstacle = new Obstacle()
        const coin = new Coin()

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
        this.score_text.text = "分数：" + this.coin
    }
}
// 若你不喜欢这样写，可以查看Player的另外一种的写法
class MovingObject extends Sprite {
    collision: Collision
    constructor(
        texture: Texture,
        shape: Vector2[],
    ) {
        super({
            texture: texture,
            scale: new Vector2(5),
        })
        this.collision = new Collision({
            shape
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
    constructor() {
        super(engine.getAssets<Texture>("obstacle"), Collision.rectShape(0, 0, 10, 35))
        this.collision.tag.add("obstacle")
    }
}
class Coin extends MovingObject {
    constructor() {
        super(engine.getAssets<Texture>("coin"), Collision.rectShape(0, 0, 8, 8))
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
class GameSence extends Sence {
    preload(): void {
        engine.loader.baseUrl = "."
        engine.resource.loadTexture("static_img", "ground.png")
        engine.resource.loadTexture("entity_img", "img.png")

        engine.resource.loadAltasTexture("background", "static_img", new Rect(12, 11, 74, 37))
        engine.resource.loadAltasTexture("ground", "static_img", new Rect(10, 0, 74, 37))

        engine.resource.loadAltasTexture("obstacle", "static_img", new Rect(0, 0, 10, 47))
        engine.resource.loadAltasTexture("coin", "entity_img", new Rect(51, 0, 8, 8))
        engine.resource.loadAltasTexture("player", "entity_img", new Rect(0, 0, 50, 30))

        engine.resource.loadAudio("jump_muisc", "jump.mp3")
        engine.resource.loadAudio("die_muisc", "die.mp3")
        engine.resource.loadAnimation("player_ani", "player", {
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
    }
    create(_engine: SparkleEngine) {
        const root = new Container()
        const ground = new Sprite({
            texture: engine.getAssets<Texture>("ground"),
            position: new Vector2(0, 30)
        })
        const bg = new Sprite({
            texture: engine.getAssets<Texture>("background"),
            scale: new Vector2(10)
        })
        bg.addChild(
            ground
        )
        root.addChild(bg)
        root.addChild(new GameManager({ engine }))
        root.addChild(Player())
        root.addChild(new Text({
            text: "分数：0",
            font: "30px Arial",
            position: new Vector2(5, 5),
            tags: ["score_text"]
        }))
        return root
    }
}

class LoseSence extends Sence {
    create(_engine: SparkleEngine) {
        const root = new Container()

        root.addChild(new Text({
            text: "你输了",
            font: "40px Arial",
            position: new Vector2(740 / 2, 50),
            anchor: TextAnchor.CENTER
        }))
        root.addChild(new Text({
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
}


const PlayAgin = () => {
    const collision = new Collision({
        shape: Collision.rectShape(0, 0, 180, 50)
    })

    const playAgin = new Text({
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
            playAgin.color.setColor(0, 0, 0, 1)
        } else {
            playAgin.color.setColor(1, 1, 1, 1)
        }
    }
    collision.onClick = () => {
        engine.changeToSence(GameSence)
    }
    return playAgin
}

engine.changeToSence(GameSence)