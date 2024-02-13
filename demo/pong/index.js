import {
    SparkleEngine,
    Sence,
    Vector2,
    Text,
    Color,
    TextAnchor,
    Container,
    GraphicalType,
    Rect,
    Collision
} from "../../src/main"
import Graphical from "../../src/nodes/graphical"

const engine = new SparkleEngine({
    // 指定游戏画布元素
    canvas: document.getElementById("game"),
    backgroundColor: Color.fromHex("#FFFFCC"),
    width: 600,
    height: 300
})


class Panel extends Graphical {
    constructor(position) {
        super({
            type: GraphicalType.RECT,
            rect: new Rect(0, 0, 20, 80),
            fill: true,
            color: Color.fromHex("#003300"),
            position,
            offset: new Vector2(0, 40),
        })
        this.addChild(
            new Collision({
                shape: Collision.rectShape(0, 0, 20, 80),
                offset: new Vector2(0, 40),
                tags: ["panel"]
            })
        )
    }
    onUpdate(dt) {
        this.position.y = this.getMouseGlobalPositon().y
    }
}

class Ball extends Graphical {
    constructor() {
        super({
            type: GraphicalType.CIRCLE,
            radius: 20,
            fill: true,
            color: Color.fromHex("#808080"),
            position: new Vector2(300, 150),
        })
        this.speed = 300
        this.velocity = Vector2.fromAngle(1)
        this.collision = new Collision({
            shape: Collision.rectShape(0, 0, 40, 40),
            offset: new Vector2(20, 20),
        })
        this.collision.onBodyEnter = (res) => {
            const body = res.body
            
            if (body.tag.has("panel")) {
                engine.root.findByTag("scoreText").getScore()
                const relativePos = this.globalPosition.sub(body.globalPosition, false)
                // 将相对位置转换为角度，并设置为球的新方向
                this.velocity.direction = relativePos.direction
                engine.getAssets("jump").play()
            }
        }
        this.addChild(
            this.collision
        )
    }
    reStart() {
        this.velocity = Vector2.fromAngle(1)
        this.position.set(300, 150)
        engine.root.findByTag("scoreText").reStart()
    }
    onUpdate(dt) {
        this.position.add(this.velocity.scale(dt, false).scale(this.speed, false))
        if (this.position.y + 20 > 300 || this.position.y - 20 < 0) {
            // 反转y方向的速度
            this.velocity.y = -this.velocity.y
        }
        // 检查是否碰到了左右边界
        if (this.position.x > 600 || this.position.x < 0) {
            this.reStart()
        }
    }
}

class scoreText extends Text{
    constructor(){
        
        super({
            position: new Vector2(300, 0),
            text: "0",
            font: "32px Arial",
            color: Color.black(),
            anchor: TextAnchor.CENTER,
            tags: ['scoreText']
        })
        this.score = 0
    }
    getScore(){
        this.score++
        this.text = this.score.toString()
    }
    reStart(){
        this.score = 0
        this.text = "0"
    }
}

class MainSence extends Sence {
    preload(){
        engine.loader.baseUrl = "."
        engine.resource.loadAudio("jump","jump.mp3")
    }
    create() {
        const root = new Container()
        root.addChild(new Panel(new Vector2(30, 150)))
        root.addChild(new Panel(new Vector2(600 - 30 - 10, 150)))
        root.addChild(new Ball())
        root.addChild(new scoreText())
        return root
    }
}

engine.changeToSence(MainSence)