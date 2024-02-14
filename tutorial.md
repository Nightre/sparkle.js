# Contents
* [Scene](#Scene)
* [Node](#Node)
  * [Life Cycle](#Life-Cycle)
  * [Events](#Events)
  * [Tag Search](#Tag-Search)
* [GameNode](#GameNode)
  * [Sprite](#Sprite)
  * [Text](#Text)
  * [Timer](#Timer)
  * [Collision](#Collision)
* [Resources](#Resources)
  * [Resource Preloading](#Resource-Preloading)
  * [Texture](#Texture)
  * [Audio](#Audio)
  * [Animation](#Animation)
* [Debugging Tools](#Debugging-Tools)
* [Input](#Input)
  * [Mouse Input](#Mouse-Input)
  * [Keyboard Input](#Keyboard-Input)



# Scene

The above `MainScene` is a game scene, the preload method of the scene is used to preload resources. 
Once all the resources of the preload method are loaded, the `create` method of the scene will be called, and the node returned by this method will be used as the root node of the scene tree. 
The scene tree is a data structure for organizing and managing various elements in the game scene. It is similar to a tree, and each node can contain child nodes. 
In sparkle.js, components (such as the Timer in the figure below) are also nodes.
```
Sprite (Used for displaying)
  |
  +-- Timer (Timer, can be used for timing bonus points)
  |
  +-- Collision (Collisions can be used to detect collisions)
```

Through the scene tree, game developers can easily manage the elements in the scene, and their relative positions, rotations, scales and other properties are relative to the parent node.

Use `engine.changeToScene` to switch scenes, if you want to switch directly to a node then you can use `engine.changeSceneToContainer`

# Node

The node is the basic unit that constitutes the scene tree. Each node can contain multiple child nodes and a parent node, so that a hierarchical structure can be formed. There are two methods when writing node code.

```js
const player = ()=>{
    // Create node
    const node = new Sprite({
        texture:YourTexture
    })
    const timer = new Timer({
        // ...
    })
    node.addChild(
        // Add the timer node to the player node as a component
        timer
    )
    return player
}
// root points to the scene root node
engine.root.addChild(player())
// Another way of writing
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

Both methods are possible.

### Life Cycle

The life cycle of a node

```js
// Create this node
const node = new Container()
node.onReady = () => {
    // The current node and its child nodes are all ready
}
node.onUpdate = (dt) => {
    // Call every frame
}
node.onEnterTree = () => {
    // When the node enters the scene tree
}
node.onExitTree = () => {
    // When the node leaves the scene tree
}
// Destroy this node
node.destory()
```

#### Resident Node

Resident nodes will not be destroyed when the scene is switched `new Container({resident:true})` to create a resident node, note: resident nodes can only be child nodes of the root node


### Events

Nodes can listen to events or emit events.
Use the following method to listen to events, which will automatically cancel the listening when the node is destroyed or removed from the scene tree:

```js
const node = new Container()
node.onEvent(timer, "timeout", ()=>{
    alert("timeout !")
})
// Use offEvent to cancel listening
```

You can also use `waitEvent` to wait for an event to be emitted:

```js
const node = new Container()
await node.waitEvent(timer, "timeout")
alert("timeout !")
```

If you want to know what specific events each node has, please refer to the [API Documentation](https://nightre.github.io/sparkle.js/docs/index)

### Tag Search

When the nodes in the scene tree become more and more, it is difficult to manage, at this time you need `TAG`.
You can set tags when instantiating nodes, and you can also modify them in the future:

```js
const node = new Container({
    tags:[
        "enemy","monster"
    ]
})
```

```js
// You can find nodes by tag
engine.root.findByTag(["enemy","monster"])
// Or check if a node contains a tag
node.tags.has("enemy")
```

# GameNode
In Sparklejs, it is mainly divided into three types: resources, scenes, and nodes. Scenes only create a node and do not exist in the scene tree

All GameNodes: [API](https://nightre.github.io/sparkle.js/docs/index)
### Sprite
Elves can display a [Texture](#Texture) or play an animation
```js
const node = new Sprite({
    texture: yourTexture
})
node.position.set(0,0)
node.visible = true
node.color = Color.white()

// Or it could be an animation
const player = new Sprite({
    animations: engine.getAssets("player_ani")
})
player.play("run", true) // loop
```
Use `play()` to play animations, `stop()` to stop, and set the aniused `aniused` property to pause

`The first parameter is the animation name, and the second parameter indicates whether to loop. If the animation is played, it will automatically replay

When calling `play` to play an animation, if the animation with the same name is currently playing, it will not be replayed. If it is forced to play again, set 'restart' to true

Sprite is only responsible for playing animations. For more information on animations, please refer to [Animation](#Animation)
### Text
Used to display a text
```js
const node = new Text({
    text: "Hello!", // text
    font: "40px Arial", // font
    anchor: TextAnchor.CENTER // text position
})
// Modify the text:
node.text = "6666"
```
For more information, please refer to the [API](https://nightre.github.io/sparkle.js/docs/index).
### Timer
The timer is also a node and can be used as a component (in Sparkle, a component is a node). The timer node has a `timeout` signal. The timer must be in the scene tree to run, if it is outside the scene tree, it is in a paused state. If you want the timer to keep running outside the scene tree, please manually call update.
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
// Or use the signal onTimeout (use onEvent to listen to the event, it will automatically cancel the listening when the sprite is deleted or exits the scene tree)
this.onEvent(node, "timeout", this.doSomeThing.bind(this))
```
For more information, please refer to the [API](https://nightre.github.io/sparkle.js/docs/index).
### Collision
Collision shapes only support convex polygons, using `SAT` to detect collisions, res has two properties
* `body` The collision body of the collision
* `overlap` Overlap vector
```js
const collision = new Collision({
    shape: Collision.rectShape(0, 0, 12, 10)
    // Or give a Vector2 array
})
collision.onBodyEnter=(res)=>{} // Other physical body enters
collision.onBodyExit=(res)=>{} // Other physical body leaves
collision.onClick=()=>{} // Clicked by the mouse
// The above can all be connected with events
```
For detailed information, please check the [API](https://nightre.github.io/sparkle.js/docs/index).
# Resources
Resources use `engine.resource` to load,
For example, `engine.resource.loadJSON(id, url)` This is an asynchronous method
The loaded resources use `engine.resource.get(id)` or `engine.getAssets(id)` to get resources

### Resource Preloading
You can preload in the scene, and the resources of the scene preload will only call the scene's create function after all are loaded
If you don't want to preload, you can also call this method `await engine.resource.loadJSON(id, url)`

### Texture

There are two types of textures, one is the basic texture, and the other is the cropped texture
```js
engine.resource.loadTexture("static_img", "ground.png")
engine.resource.loadAltasTexture("background", "static_img", new Rect(12, 11, 74, 37))
engine.resource.loadAltasTexture("ground", "static_img", new Rect(10, 0, 74, 37))
```
For details, please check the [API](https://nightre.github.io/sparkle.js/docs/index).
### Audio
```js
engine.resource.loadAudio("die_muisc", "die.mp3")
engine.getAssets("die_muisc").play() // Play
```
### Animation
```js
engine.resource.loadTexture("player", "player.png")
engine.resource.loadAnimation("player_ani", "player", {
    hFrames: 4, // How many frames are there horizontally
    vFrames: 2, // How many frames are there vertically
    gapSize: 1, // The interval between each frame (pixels)
    animations: {
        "run": {
            fromFrames: 0,
            toFrames: 3,
            time: 0.1 // The time between each frame (seconds)
        },
        "fly": {
            fromFrames: 4, // Start from this frame
            toFrames: 7, // End at the 7th frame
            time: 0.1 // The time between each frame (seconds)
        }
    }
})
// loadAnimation can also load animation json from url
// Use loadData and then write the resource ID in the animations field
engine.resource.loadAnimation("player_ani", "player", {
    hFrames: 4, // How many frames are there horizontally
    vFrames: 2, // How many frames are there vertically
    gapSize: 1, // The interval between each frame (pixels)
    animations: "json resource id"
})
```
# Debugging Tools
Press `ctrl+b` to open the debugging tools, the collision is green, the texture border is blue, and the center point is a red cross
# Input

### Mouse Input
`engine.mouse`
The mouse also has some events, please check the API for details
To get the mouse position, you can use Container (all nodes)'s `getMouseGlobalPositon`
Nodes inherited from `transfrom2d` can use `getMouselocalPositon` to get the mouse position relative to me

collision has an event when clicked by the mouse, which can be used as a button

For details, please check the [API](https://nightre.github.io/sparkle.js/docs/index).
### Keyboard Input
`engine.input`
This has a `pressedKeys` attribute, and some events, such as pressing a key, double-clicking, releasing, etc., please check the [API](https://nightre.github.io/sparkle.js/docs/index). for details