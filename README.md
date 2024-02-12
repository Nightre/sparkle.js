# SPARKLE GAME ENGINE

Sparkle is a HTML5 game engine that offers a simple and joyful approach to game development
Sparkle.js 是一个基于webgl的html5轻量级游戏引擎，让游戏开发变得简单且有趣！

还在制作，快完成了

# 目录

* [Demo](https://nightre.github.io/sparkle.js/demo/chrome-dino)
* [API Reference](https://nightre.github.io/sparkle.js/docs/index)
* [快速开始]()
* [第一个项目：Hello Word]()
* [场景]()
* [节点]()
    * [生命周期]()
    * [事件]()
    * [标签查找]()
* [游戏节点]()
    * [精灵]()
    * [文字]()
    * [计时器]()
    * [碰撞]()
* [资源]()
    * [资源预加载]()
    * [纹理]()
    * [音频]()
    * [动画]()
* [调试工具]()
* [输入]()
    * [鼠标输入]()
    * [键盘输入]()
* [其他]()
    * [自定义绘制]()


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

# 第一个项目： Hello Word

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
class MainSence extends Sence {
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
engine.changeToSence(MainSence)
```
然后你就能看见屏幕上有个大大的`Hello World`了

# 场景

MainSence是一个`场景`，`场景`的preload方法用于加载资源，比如`纹理`，`音频`等等资源
当所有资源都加载成功后，会调用场景的`create`方法，并将该方法返回的节点作为`场景树`的根节点
场景树是组织和管理游戏场景中各个元素的数据结构。它类似于一棵树，而每个节点可以包含子节点。
在sparkle.js中`组件`（比如下图的Timer就是一个组件）也是一个节点
```
Sprite（用于显示）
  |
  +-- Timer（计时器，可以用于计时加分）
  |
  +-- Collision（碰撞，可以用于检测碰撞）
```
通过场景树，游戏开发者可以方便地管理场景中的元素，以及它们的相对位置、旋转、缩放等属性都是相对于父节点。

使用`engine.changeToSence`来切换场景，如果想直接切换到一个节点那么可以使用`engine.changeSenceToContainer`

# 节点

节点是构成场景树的基本单元，每个节点可以包含多个子节点和一个父节点，这样就可以形成一个层次化的结构。编写节点的代码时有两种方法
```js
const player = ()=>{
    // 创建节点
    const node = new Sprite({
        texture:YourTexture
    })
    const timer = new Timer({
        // ...
    })
    node.addChild(
        // 将timer节点加入到player节点，作为一个组件
        timer
    )
    return player
}
// root 指向场景根节点
engine.root.addChild(player())
// 另外一种写法
class Player extends Sprite{
    constructor(){
        super({
            texture:YourTexture
        })
        this.timer = new Timer({
            // ...
        })
        this.addChild(
            this.timer
        )
    }
}
engine.root.addChild(new Player())
```
两种写法都可以

### 生命周期
节点的生命周期
```js
// 创建这个节点
const node = new Container()
node.onReady = () => {
    // 当前节点且其子节点都已准备就绪
}
node.onUpdate = (dt) => {
    // 每一帧调用
}
node.onEnterTree = () => {
    // 当节点进入场景树
}
node.onExitTree = () => {
    // 当节点离开场景树
}
// 销毁这个节点
node.destory()
```
#### 常驻节点
常驻节点在场景切换时不会被销毁
`new Container({resident:true})` 来创建一个常驻节点，注意：常驻节点只能作为根节点的子节点

### 事件
节点有可以监听事件，或者发出事件
使用下面这种方法监听事件，当节点被销毁时或是被移除场景树时自动取消监听
```js
const node = new Container()
node.onEvent(timer, "timeout", ()=>{
    alert("timeout !")
})
// 使用offEvent来取消监听
```
还可以使用`waitEvent`来等待一个事件发出
```js
const node = new Container()
await node.awaitEvent(timer, "timeout")
alert("timeout !")
```
若想知道每个节点的具体事件有那些，请查阅[API 文档](https://nightre.github.io/sparkle.js/docs/index)

### 标签查找

当场景树中的节点变得越来越多，很难管理，这个时候就需要`TAG`了
在实例化节点的时候可以设置tag，也可以在未来修改
```js
const node = new Container({
    tags:[
        "enemy","monster"
    ]
})
```

```js
// 可以根据tag来查找节点
engine.root.findByTag(["enemy","monster"])
// 或者查看某个节点是否包含tag
node.tags.has("enemy")
```

# 游戏节点

