# 目录
* [场景](#场景)
* [节点](#节点)
  * [生命周期](#生命周期)
  * [事件](#事件)
  * [标签查找](#标签查找)
* [游戏节点](#游戏节点)
  * [精灵](#精灵)
  * [文字](#文字)
  * [计时器](#计时器)
  * [碰撞](#碰撞)
* [资源]()
  * [资源预加载](#资源预加载)
  * [纹理](#纹理)
  * [音频](#音频)
  * [动画](#动画)
* [调试工具](#调试工具)
* [输入](#输入)
  * [鼠标输入](#鼠标输入)
  * [键盘输入](#键盘输入)



# 场景

上面`MainSence`是一个游戏场景，场景的preload方法用于预加载资源
当preload方法的所有资源都加载完成后，会调用场景的`create`方法，并将该方法返回的节点作为场景树的根节点
场景树是组织和管理游戏场景中各个元素的数据结构。它类似于一棵树，而每个节点可以包含子节点。
在sparkle.js中组件（比如下图的Timer就是一个组件）也是一个节点

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
await node.waitEvent(timer, "timeout")
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
在sparklejs中主要分为`资源`,`场景`,`节点`这三种，场景只是创建了一个节点，他并不存在于场景树之中
### 精灵
精灵可以显示一个[纹理](#纹理)或者是播放一个动画
```js
const node = new Sprite({
    texture: yourTexture
})
node.position.set(0,0)
node.visible = true
node.color = Color.white()

// 或者是一个动画
const player = new Sprite({
    animations: engine.getAssets("player_ani")
})
player.play("run", true) // loop
```
使用`play`来播放动画，`stop`来停止，设置aniPaused`aniPaused`属性来暂停
`play`第一个参数是动画名称，第二个参数表示是否循环若该动画播放完毕是否自动重新播放
在调用`play`播放动画时，若同名动画正在播放时不会重新播放，若像强制重新播放就设置`restart`为true

sprite仅负责播放动画，关于动画的请查看[动画](#动画)

详细信息请查看API

### 文字
用于显示一个文字
```js
const node = new Text({
    text: "Hello!",//文字
    font: "40px Arial", // 字体
    anchor: TextAnchor.CENTER // 文字位置
})
//修改文字:
node.text = "6666"
```
详细信息请查看API
### 计时器
计时器也是一个节点，可以作为组件（sparkle中组件即使节点）
计时器节点，有个`timeout`信号
timer必须在场景树里才会运行，若在场景树之外处于暂停状态
若想让在场景树之外的timer同样保持运行，请手动调用update
```js
onUpdate(dt){
    timer.update(dt)
}
```
```js
const node = new Timer({
    waitTime: 1,
    initTimeLeft: 1,
    start: true
});
node.onTimeout = () => {};
// 或者是用信号onTimeout（使用onEvent监听event当精灵被删除时或退出场景树自动取消监听）
this.onEvent(node, "timeout", this.doSomeThing.bind(this))
```
更多细节请查看API

### 碰撞
碰撞形状仅支持凸多边形，使用`SAT`检测碰撞，res有两个属性
* `body` 碰撞的碰撞体
* `overlap` 覆盖向量
```js
const collision = new Collision({
    shape: Collision.rectShape(0, 0, 12, 10)
    // 或者给一个Vector2数组
})
collision.onBodyEnter=(res)=>{} // 其他物理体进入
collision.onBodyExit=(res)=>{} // 其他物理体离开
collision.onClick=()=>{} //被鼠标点击
// 以上上个均可以用事件连接
```
详细信息请查看API
### 资源
资源使用 `engine.resource` 来加载，
比如 `engine.resource.loadJSON(id, url)` 这是一个异步的方法
加载好了的资源使用`engine.resource.get(id)`或者是`engine.getAssets(id)`来获取资源

#### 资源预加载
可以在场景的preload中，场景preload的资源全部加载完毕后才会调用场景的create函数
如果你不想preload，也可以调用这个方法 `await engine.resource.loadJSON(id, url)`

#### 纹理

有两种纹理，一种是基本的纹理，还有一种是裁剪的纹理
```js
engine.resource.loadTexture("static_img", "ground.png")
engine.resource.loadAltasTexture("background", "static_img", new Rect(12, 11, 74, 37))
engine.resource.loadAltasTexture("ground", "static_img", new Rect(10, 0, 74, 37))
```
具体请查看API
#### 音频
```js
engine.resource.loadAudio("die_muisc", "die.mp3")
engine.getAssets("die_muisc").play() // 播放
```
#### 动画
```js
engine.resource.loadTexture("player", "player.png")
engine.resource.loadAnimation("player_ani", "player", {
    hFrames: 4, // 横有几帧
    vFrames: 2, // 竖有几帧
    gapSize: 1, // 每一帧的间隔（像素）
    animations: {
        "run": {
            fromFrames: 0,
            toFrames: 3,
            time: 0.1 // 每一帧直接的时间（秒）
        },
        "fly": {
            fromFrames: 4, // 从这一帧开始
            toFrames: 7, // 到第7帧结束
            time: 0.1 // 每一帧直接的时间（秒）
        }
    }
})
// loadAnimation 也可以从url加载动画json
// 使用 loadData 然后在animations 字段写 资源ID即可
engine.resource.loadAnimation("player_ani", "player", {
    hFrames: 4, // 横有几帧
    vFrames: 2, // 竖有几帧
    gapSize: 1, // 每一帧的间隔（像素）
    animations: "json resource id"
})
```
### 调试工具
按下 `ctrl+b` 可以打开调试工具，有碰撞是绿色的，纹理边框是蓝色的，中心点是红色的十字
### 输入

### 鼠标输入
`engine.mouse`
鼠标也有一些事件，具体查看API
获取鼠标位置，可以使用Container（所有节点）的`getMouseGlobalPositon`
继承于`transfrom2d`的节点可以使用`getMouselocalPositon`获取鼠标相对于我的位置

collision有当被鼠标点击事件，可以用做按钮

具体请查看API
### 键盘输入
`engine.input`
这个有`pressedKeys`属性，还有一些事件，比如按下某个键，双击，释放等等，具体请查看API