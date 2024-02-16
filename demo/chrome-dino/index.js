import { 
    SparkleEngine,
    Scene,
    Container,
    Sprite,
    Rect,
    Vector2,
    Collision,
    Text,
    TextAnchor,
    Timer,
} from "../../src/main"//"https://unpkg.com/sparkle-engine/dist/sparkle.js"

const engine = new SparkleEngine({
    // 指定游戏画布元素
    canvas: document.getElementById("game"),
    antialias: false, // 像素画就关闭抗锯齿
    width: 740,
    height: 370
})

// 有多种方法实现一个节点或者是组件，Player 使用了状态函数
// 可以使用继承的方法，请查看 下面的MovingObject以及Coin
const Player = () => {
    let velocityY = 0 // 加速度，用于跳跃
    let isGrounded = false // 是否触碰到地面
    // 对 gameManager 的引用。根据 tag 查找
    // 注意：必须在ready后查找
    let gameManager
    // 创建player节点
    const player = new Sprite({
        position: new Vector2(80, 240),
        scale: new Vector2(5),
        animations: engine.getAssets("player_ani")
    })
    // 创建玩家的碰撞体
    const collision = new Collision({
        shape: Collision.rectShape(0, 0, 12, 10)
    })
    // 将碰撞体作为子节点（组件）
    player.addChild(
        collision
    )
    player.onReady = () => {
        // 当准备就绪
        gameManager = player.root.findByTag("game_manager")
    }

    // 添加标签，标签可以拥有多个，标签可以用于检测到碰撞时识别
    // 也可以用于查找节点，比如说要获取场景里面所有的怪物，那么
    // 就应该给每个怪都加一个“zombie”标签，然后玩家碰撞到一个物体
    // 时，就检测这个物体有没有 zombie 标签
    player.tag.add("player")

    player.onUpdate = (dt) => {
        // 每一帧
        velocityY += 800 * dt
        player.position.y += velocityY * dt
        if (player.position.y > 240) {
            player.position.y = 240
            isGrounded = true
            // 播放动画
            player.play("run", true)
        } else {
            isGrounded = false
            // 播放动画
            player.play("fly", true)
        }
    }
    // 也可以使用事件监听onBodyEnter事件
    // 有其他碰撞体进入该碰撞体内触发
    collision.onBodyEnter = (res) => {
        const body = res.body
        if (body.tag.has("obstacle")) {
            // 如果碰到的碰撞体有 obstacle 标签
            // 获取资源并播放
            engine.getAssets("die_muisc").play()
            // 切换场景
            engine.changeToScene(LoseScene)
        } else if (body.tag.has("coin")) {
            // 拾取金币
            body.parent.pick()
            gameManager.getCoin();
        }
    }

    // 使用这种方法监听，可以在该节点被移出场景树的时候自动取消监听
    // 若希望在节点被摧毁时，监听依然存在可以使用 engine.input.on
    player.onEvent(engine.input, "onKeyDown", (key) => {
        if (key == 'w' && isGrounded) { // jump key
            velocityY = -600
            engine.getAssets("jump_muisc").play()
        } else if (key == 's') {
            velocityY += 250
        }
    })

    return player
}
    
// 这是另外一种编写模式，是继承某个类
// 若你觉得这种方法不和你口味，可以使用上面的 playerScene的
// 状态函数方式来写
class GameManager extends Container { // Container 是所有节点的基类，他能有多个子节点，一个父节点
    constructor(options) {
        super(options)
        this.timer = this.addChild(
            new Timer({
                waitTime: 1,
                initTimeLeft: 1,
                start: true
            })
        )
        this.coin = 0
        // 使用这种方法监听，可以在该节点被移出场景树的时候自动取消监听
        // 若希望在节点被摧毁时，监听依然存在可以使用 engine.input.on
        this.onEvent(this.timer, "timeout", this.createObstacle.bind(this))
    }

    onReady() {
        // onReady 在其所有子节点被加载完毕并准备好后被引擎调用
        this.tag.add("game_manager")
        this.scoreText = this.root.findByTag("score_text")
    }
    // 创建一个障碍物
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
    // 得到金币
    getCoin() {
        this.coin++
        this.scoreText.text = "分数：" + this.coin
    }
}
// 若你不喜欢这样写，可以查看Player的另外一种的写法
class MovingObject extends Sprite {
    constructor(
        texture,
        shape,
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
    onUpdate(_dt) {
        this.position.x -= _dt * 200
        if (this.position.x < -50) {
            this.destory()
        }
    }
}
class Obstacle extends MovingObject {
    constructor() {
        super(engine.getAssets("obstacle"), Collision.rectShape(0, 0, 10, 35))
        this.collision.tag.add("obstacle")
    }
}
class Coin extends MovingObject {
    constructor() {
        super(engine.getAssets("coin"), Collision.rectShape(0, 0, 8, 8))
        this.collision.tag.add("coin")
        this.offset.set(4, 4)
        this.collision.offset.set(4, 4)
    }
    pick() {
        this.destory()
    }
    onUpdate(dt) {
        super.onUpdate(dt)
        this.rotation += dt * 1
    }
}
class GameScene extends Scene {
    preload() {
        // 在preload函数中加载所需资源
        // 切换到场景的时候会先preload之后create
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
        // loadAnimation 也可以从url加载动画json
        // 使用 loadData 然后在animations 字段写 资源ID即可
    }
    create(engine) {
        // 切换到场景的时候会先preload之后create

        const root = new Container() // 创建一个根节点
        // 创建地面节点
        const ground = new Sprite({
            texture: engine.getAssets("ground"),
            position: new Vector2(0, 30)
        })
        // 创建背景节点
        const bg = new Sprite({
            texture: engine.getAssets("background"),
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

// 重来按钮
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
        if (collision.mouseDetection()) { // 这个函数用检测是否碰到鼠标指针
            playAgin.color.setColor(0, 0, 0, 1)
        } else {
            playAgin.color.setColor(1, 1, 1, 1)
        }
    }
    // 当被点击时触发，也可以用事件
    collision.onClick = () => {
        engine.changeToScene(GameScene)
    }
    return playAgin
}
class LoseScene extends Scene {
    create(_engine) {
        const root = new Container()
        root.addChild(new Text({
            text: "你输了",
            font: "40px Arial",
            position: new Vector2(740 / 2, 50),
            anchor: TextAnchor.CENTER
        }))
        root.addChild(new Text({
            text: "分数：" + (engine.root.findByTag("game_manager")).coin,
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

// 切换到游戏场景
engine.changeToScene(GameScene)