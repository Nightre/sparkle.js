<div  align="center">    
<img src="https://github.com/Nightre/sparkle.js/assets/149653910/8a891dbe-9086-4ced-a99c-b21149176e18" alt="图片" align=center style="image-rendering: pixelated;" />
</div>
<div  align="center">    
<h1>SPARKLE.JS GAME ENGINE</h1>
</div>

Sparkle.js 是一个基于WebGL的HTML5的0依赖轻量级小巧的游戏引擎，让游戏开发变得简单且有趣！
^_^ [教程](./tutorial_ZN.md)

# 目录

* [API 文档](https://nightre.github.io/sparkle.js/docs/index)
* [Demo](#Demo)
    * [HelloWorld](https://nightre.github.io/sparkle.js/demo/hello-world)
    * [小鸟跑步](https://nightre.github.io/sparkle.js/demo/chrome-dino)
    * [乒乓](https://nightre.github.io/sparkle.js/demo/pong)
* [快速开始](#快速开始)
* [第一个项目：HelloWord](#第一个项目HelloWord)
* [第二个项目：乒乓球](#第二个项目乒乓球)
* [教程](./tutorial_ZN.md)
    * [场景](./tutorial_ZN.md#场景)
    * [节点](./tutorial_ZN.md#节点)
        * [生命周期](./tutorial_ZN.md#生命周期)
        * [事件](./tutorial_ZN.md#事件)
        * [标签查找](./tutorial_ZN.md#标签查找)
    * [游戏节点](./tutorial_ZN.md#游戏节点)
        * [精灵](./tutorial_ZN.md#精灵)
        * [文字](./tutorial_ZN.md#文字)
        * [计时器](./tutorial_ZN.md#计时器)
        * [碰撞](./tutorial_ZN.md#碰撞)
    * [资源](./tutorial_ZN.md#资源)
        * [资源预加载](./tutorial_ZN.md#资源预加载)
        * [纹理](./tutorial_ZN.md#纹理)
        * [音频](./tutorial_ZN.md#音频)
        * [动画](./tutorial_ZN.md#动画)
    * [调试工具](./tutorial_ZN.md#调试工具)
    * [输入](./tutorial_ZN.md#输入)
        * [鼠标输入](./tutorial_ZN.md#鼠标输入)
        * [键盘输入](./tutorial_ZN.md#键盘输入)

# 快速开始

安装

```
npm i sparkle-engine
```

或者是使用unpkg

```html
<script src="https://unpkg.com/sparkle-engine/dist/sparkle.umd.cjs"></script>
```

引入

```js
import { SparkleEngine } from "sparkle-engine";
```

# 第一个项目HelloWord

使用 SPARKLE GAME ENGINE 编写一个 Helloworld

```html
<canvas id="game"></canvas>
```

```js
const engine = new SparkleEngine({
    // 指定游戏画布元素
    canvas: document.getElementById("game"),
})
```

然后创建一个场景，切换到该场景

```js
class MainScene extends Scene {
    preload(){
        // 在这里加载资源，不过这个Helloworld项目不需要加载资源
        // 所以无需写任何代码
    }
    create(){
        const text = new Text({
            text: "Hello World!",
            font: "40px Arial"
        }) 
        return text
    }
}
// 切换场景
engine.changeToScene(MainScene)
```

然后你就能看见屏幕上有个`Hello World`了

# 第二个项目乒乓球
使用 SPARKLE GAME ENGINE 编写一个 乒乓球 游戏，项目[源码](https://github.com/Nightre/sparkle.js/blob/main/demo/pong)
，[在线玩这个项目](https://nightre.github.io/sparkle.js/demo/pong/)

该项目需要一个音频资源，在[此处](https://github.com/Nightre/sparkle.js/blob/main/demo/pong/jump.mp3)下载，或者用你自己的

先创建一个引擎实列
```html
<canvas id="game"></canvas>
```

```js
const engine = new SparkleEngine({
    // 指定游戏画布元素
    canvas: document.getElementById("game"),
    backgroundColor: Color.fromHex("#FFFFCC"),
    width: 600,
    height: 300
})
```

然后编写一个[场景](./tutorial_ZN.md#场景)，这个场景比 Helloworld 中的场景多了一个`preload`方法，在`preload`方法中加载需要预加载的资源，当`perload`方法中的所有资源加载完毕，会调用场景的`create`方法返回的节点将作为场景根节点，资源可以使用`engine.getAssets("jump")`获取
```js
class MainScene extends Scene {
    preload(){
        engine.loader.baseUrl = "."
        // 加载一个资源
        // "jump" 是资源id，"jump.mp3"是资源的路径
        engine.resource.loadAudio("jump","jump.mp3")
    }
    create() {
        // 创建一个根节点
        const root = new Container()

        return root
    }
}
// 切换到目标场景
engine.changeToScene(MainScene)
```
接下来创建乒乓球游戏的板子，他接收一个position作为坐标，Graphical 可以用来显示图形（多边形，圆形，方形等），然后创建一个`Collision`子节点，作为一个组件。在Sparklejs中组件也是一个节点，比如`Collision`和`Timer`都是节点

更多信息请查看[节点](./tutorial_ZN.md#节点)
```js
class Board extends Graphical {
    constructor(position) {
        super({
            type: GraphicalType.RECT,
            // 一个方形
            rect: new Rect(0, 0, 20, 80),
            // 是否填充这个图形
            fill: true,
            // 图形的颜色
            color: Color.fromHex("#003300"),
            position, // 需要两个板子，所以position不是固定的，让使用者来设定
            offset: new Vector2(0, 40),// 偏移
        })
        this.addChild(
            // 添加这个碰撞子节点
            new Collision({
                shape: Collision.rectShape(0, 0, 20, 80), // 碰撞的形状
                offset: new Vector2(0, 40),
                tags: ["board"] // 一个标签，可以用于查找或者判断节点
            })
        )
    }
    onUpdate(dt) {
        // 每一帧时将自己的坐标设置为鼠标的坐标
        this.position.y = this.getMouseGlobalPositon().y
    }
}
```
标签是一个很有用的东西，能简化很多工作，详细信息请查看[标签查找](./tutorial_ZN.md#标签查找)

然后实例化两个板子，并加入到主场景
```js
class MainScene extends Scene {
    preload(){
        engine.loader.baseUrl = "."
        engine.resource.loadAudio("jump","jump.mp3")
    }
    create() {
        const root = new Container()
        root.addChild(new Panel(new Vector2(30, 150)))
        root.addChild(new Panel(new Vector2(560, 150)))
        return root
    }
}

```
然后打开看看效果，可以使用`Ctrl+B`来打开调试模式，能看见碰撞体，以及中心坐标等，接下来创建一个球
```js
class Ball extends Graphical {
    constructor() {
        super({
            // 创建形状
            type: GraphicalType.CIRCLE,
            radius: 20, // 半径
            fill: true,
            color: Color.fromHex("#808080"),
            position: new Vector2(300, 150),
        })
        this.speed = 300
        // 创建一个方向向量，球的方向
        this.direction = Vector2.fromAngle(1)
        // 创建一个碰撞体，也可以使用继承的方法创碰撞体
        this.collision = new Collision({
            // 形状
            shape: Collision.rectShape(0, 0, 40, 40),
            // 偏移
            offset: new Vector2(20, 20),
        })
        // 添加这个碰撞体
        this.addChild(
            this.collision
        )
    }
    // 游戏重来
    reStart() {
        // 重设方向
        this.direction = Vector2.fromAngle(1)
        // 重设坐标
        this.position.set(300, 150)
    }
    onUpdate(dt) {
        // 坐标加速，scale后面的true代表创建一个新值是缩放该向量的新向量
        // 因为缩放不应该改变direction而是创建一个新的
        this.position.add(this.direction.scale(dt * this.speed, true))
        // 碰到上墙壁和下墙壁
        if (this.position.y + 20 > 300 || this.position.y - 20 < 0) {
            // 反转y方向的速度
            this.direction.y = -this.direction.y
        }
        // 检查是否碰到了左右边界
        if (this.position.x > 600 || this.position.x < 0) {
            // 重来
            this.reStart()
        }
    }
}
```
`onUpdate`是每一帧都会调用的一个函数，`onReady`是该节点准备好且其子节点也准备好时被调用。具体请查看[生命周期](./tutorial_ZN.md#生命周期)

二维向量操作函数一般后面都一个`create`参数，代表是否创建一个新的向量或者是修改原本的向量，然后把ball加入到主场景

```js
class MainScene extends Scene {
    //...
    create() {
        const root = new Container()
        root.addChild(new Panel(new Vector2(30, 150)))
        root.addChild(new Panel(new Vector2(560, 150)))
        // new
        root.addChild(new Ball())
        return root
    }
}
```
现在你应该能看见一个能弹的球了，但是碰到板子还不会被弹开，接下来就编写碰到板子的逻辑

注意：是使用`SAT`碰撞实现，所以仅支持凸多边形
```js

class Ball extends Graphical {
    constructor() {
        // ...
        this.collision.onBodyEnter = (res) => {
            // res 返回碰到的碰撞体，以及overlap
            const body = res.body
            if (body.tag.has("board")) { // 判断是不是板子
                // 获取与板子之间的差
                const rebound = this.globalPosition.sub(body.globalPosition,true)
                // 设置方向
                this.direction.direction = rebound.direction
                // 播放声音
                engine.getAssets("jump").play()
            }
        }
    }
}
```
`engine.getAssets("jump")`用于获取资源，`onBodyEnter`将在有物理体进入ball时被调用，但你也可使用[事件](./tutorial_ZN.md#事件)来监听，好了现在你可以看见球碰到板子会反弹了

接下来添加一个分数
```js
class scoreText extends Text{
    constructor(){
        // 继承于文字
        super({
            position: new Vector2(300, 0),
            text: "0", // 初始显示一个 0
            font: "32px Arial", // 字体
            color: Color.black(), // 颜色
            anchor: TextAnchor.CENTER, // 文字在中心
            tags: ['scoreText'] // 有个标签方便其他节点访问
        })
        // 分数
        this.score = 0
    }
    addScore(){
        this.score++
        // 修改文字可以直接设置text属性
        this.text = this.score.toString()
    }
    reStart(){
        this.score = 0
        this.text = "0"
    }
}
```
你可能会好奇，为什么scoreText和collision写法有点不一样，这两种都是可以的，具体查看[节点](./tutorial_ZN.md#节点)，然后把scoreText加入到主场景，并在碰撞到板子的时候加分，球跑出屏幕外时restart
```js
class Ball extends Graphical {
    constructor() {
        // ...
        this.collision.onBodyEnter = (res) => {
            const body = res.body
            if (body.tag.has("board")) {
                this.scoreText.addScore() // 添加这个
                // ...
            }
        }
        // ...
    }
    onReady() {
        this.scoreText = engine.root.findByTag("scoreText")
    }
    reStart() {
        // ...
        this.scoreText.reStart() // 添加这个
    }
}

class MainScene extends Scene {
    //...
    create() {
        //...
        root.addChild(new scoreText())
        return root
    }
}
```

好了接下来你应该就可以运行这个游戏了，若无法运行或遇到问题，可查看[源码](https://github.com/Nightre/sparkle.js/blob/main/demo/pong)，

### 接下来干什么...：
* 阅读[小鸟跑步](https://nightre.github.io/sparkle.js/demo/chrome-dino)demo的源码
* 阅读[教程](./tutorial_ZN.md)
* 阅读[API](https://nightre.github.io/sparkle.js/docs/index)
* 或者点个 star ？滑稽
