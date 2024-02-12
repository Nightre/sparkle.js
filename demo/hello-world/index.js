import {
    SparkleEngine,
    Sence,
    Vector2,
    Text,
} from "https://unpkg.com/sparkle-engine/dist/sparkle.js"

const engine = new SparkleEngine({
    // 指定游戏画布元素
    canvas: document.getElementById("game"),
})

class MainSence extends Sence {
    create(){
        const text = new Text({
            position: new Vector2(10,10),
            text: "Hello World!",
            font: "40px Arial"
        })
        return text
    }
}

engine.changeToSence(MainSence)