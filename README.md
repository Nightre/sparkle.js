<div  align="center">    
<img src="https://github.com/Nightre/sparkle.js/assets/149653910/8a891dbe-9086-4ced-a99c-b21149176e18" alt="图片" align=center style="image-rendering: pixelated;" />
</div>
<div  align="center">    
<h1>SPARKLE.JS GAME ENGINE</h1>
</div>

Sparkle.js is a lightweight and compact game engine based on WebGL for HTML5 with zero dependencies, making game development simple and fun!

[中文文档](./README_ZN.md)

# Contents

* [API](https://nightre.github.io/sparkle.js/docs/index)
* [Demo](#Demo)
    * [HelloWorld](https://nightre.github.io/sparkle.js/demo/hello-world)
    * [chrome dino](https://nightre.github.io/sparkle.js/demo/chrome-dino)
    * [ping pong](https://nightre.github.io/sparkle.js/demo/pong)
* [Quick Start](#QuickStart)
* [First Project: HelloWorld](#first-project-helloworld)
* [Second Project: Ping Pong](#second-project-ping-pong)
* [Tutorial (tutorial.md)](./tutorial.md)
    * [Scene](./tutorial.md#Scene)
    * [Node](./tutorial.md#Node)
        * [Life Cycle](./tutorial.md#Life-Cycle)
        * [Events](./tutorial.md#Events)
        * [Tag Search](./tutorial.md#Tag-Search)
    * [GameNode](./tutorial.md#GameNode)
        * [Sprite](./tutorial.md#Sprite)
        * [Text](./tutorial.md#Text)
        * [Timer](./tutorial.md#Timer)
        * [Collision](./tutorial.md#Collision)
    * [Resources](./tutorial.md#Resources)
        * [Resource Preloading](./tutorial.md#Resource-Preloading)
        * [Texture](./tutorial.md#Texture)
        * [Audio](./tutorial.md#Audio)
        * [Animation](./tutorial.md#Animation)
    * [Debugging Tools](./tutorial.md#Debugging-Tools)
    * [Input](./tutorial.md#Input)
        * [Mouse Input](./tutorial.md#Mouse-Input)
        * [Keyboard Input](./tutorial.md#Keyboard-Input)

# Quick Start

Installation

```
npm i sparkle-engine
```

Or use unpkg

```html
<script src="https://unpkg.com/sparkle-engine/dist/sparkle.umd.cjs"></script>
```

Import

```js
import { SparkleEngine } from "sparkle-engine";
```

# First Project HelloWorld

Write a HelloWorld using SPARKLE GAME ENGINE

```html
<canvas id="game"></canvas>
```

```js
const engine = new SparkleEngine({
    // Specify the game canvas element
    canvas: document.getElementById("game"),
})
```
Then create a scene and switch to that scene

```js
class MainScene extends Scene {
    preload(){
        // Load resources here, but this HelloWorld project does not need to load resources
        // So no need to write any code
    }
    create(){
        const text = new Text({
            text: "Hello World!",
            font: "40px Arial"
        }) 
        return text
    }
}
// Switch scene
engine.changeToScene(MainScene)
```

Then you will see a 'Hello World' on the screen

# Second Project: Ping Pong
Use the SPARKLE GAME ENGINE to write a ping pong game. [source code](https://github.com/Nightre/sparkle.js/blob/main/demo/pong)
，[link to play the project online](https://nightre.github.io/sparkle.js/demo/pong/)
This project requires an audio resource. You can download it [here](https://github.com/Nightre/sparkle.js/blob/main/demo/pong/jump.mp3), or use your own.

First, create an engine instance:
```html
<canvas id="game"></canvas>
```

```js
const engine = new SparkleEngine({
    // Specify the game canvas element
    canvas: document.getElementById("game"),
    backgroundColor: Color.fromHex("#FFFFCC"),
    width: 600,
    height: 300
})
```

Then write a [Scene](./tutorial.md#Scene). This scene has an additional `preload` method compared to the scene in Helloworld. Load the resources that need to be preloaded in the `preload` method. When all the resources in the preload method are loaded, the node returned by the `create` method of the scene will be used as the root node of the scene. Resources can be obtained using `engine.getAssets("jump")`.

```js
class MainScene extends Scene {
    preload(){
        engine.loader.baseUrl = "."
        // Load a resource
        // "Jump" is the resource ID, and "jump. mp3" is the path to the resource
        engine.resource.loadAudio("jump","jump.mp3")
    }
    create() {
        // Create a root node
        const root = new Container()

        return root
    }
}
// 切换到目标场景
engine.changeToScene(MainScene)
```
Next, create a board for the table tennis game, which receives a position as a coordinate. Graphical can be used to display graphics (polygons, circles, squares, etc.), and then create a `Collision`, As a component. In Sparklejs, a component is also a node, for example, `Collision` and `Timer` are both components

For more details, please review [node](./tutorial.md#Node)
```js
class Board extends Graphical {
    constructor(position) {
        super({
            type: GraphicalType.RECT,
            // A rectangle
            rect: new Rect(0, 0, 20, 80),
            // Whether to fill this shape
            fill: true,
            // The color of the shape
            color: Color.fromHex("#003300"),
            position, // Two boards are needed, so the position is not fixed, let the user set it
            offset: new Vector2(0, 40),// Offset
        })
        this.addChild(
            // Add this collision child node
            new Collision({
                shape: Collision.rectShape(0, 0, 20, 80), // The shape of the collision
                offset: new Vector2(0, 40),
                tags: ["board"] // A tag, can be used to find or judge nodes
            })
        )
    }
    onUpdate(dt) {
        // Set your own coordinates to the mouse coordinates every frame
        this.position.y = this.getMouseGlobalPositon().y
    }
}
```
Tags are a very useful thing that can simplify a lot of work. For more information, please see [Tag Search](./tutorial.md#Tag-Search)

Then instantiate two boards and add them to the main scene
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
Then open and see the effect, you can use `Ctrl+B` to open the debug mode, you can see the collision body, and the center coordinates, etc., next create a ball
```js
class Ball extends Graphical {
    constructor() {
        super({
            // Create a shape
            type: GraphicalType.CIRCLE,
            radius: 20, // Radius
            fill: true,
            color: Color.fromHex("#808080"),
            position: new Vector2(300, 150),
        })
        this.speed = 300
        // Create a direction vector, the direction of the ball
        this.direction = Vector2.fromAngle(1)
        // Create a collision body, you can also use the inherited method to create a collision body
        this.collision = new Collision({
            // Shape
            shape: Collision.rectShape(0, 0, 40, 40),
            // Offset
            offset: new Vector2(20, 20),
        })
        // Add this collision body
        this.addChild(
            this.collision
        )
    }
    // Game restart
    reStart() {
        // Reset direction
        this.direction = Vector2.fromAngle(1)
        // Reset coordinates
        this.position.set(300, 150)
    }
    onUpdate(dt) {
        // Coordinate acceleration, the true behind scale represents creating a new value is a new vector that scales this vector
        // Because scaling should not change direction but create a new one
        this.position.add(this.direction.scale(dt * this.speed, true))
        // Hit the upper wall and lower wall
        if (this.position.y + 20 > 300 || this.position.y - 20 < 0) {
            // Reverse the speed of the y direction
            this.direction.y = -this.direction.y
        }
        // Check if it has hit the left and right boundaries
        if (this.position.x > 600 || this.position.x < 0) {
            // Restart
            this.reStart()
        }
    }
}
```

`onUpdate` is a function that will be called every frame, `onReady` is called when this node is ready and its child nodes are also ready. For details, please see [Lifecycle](./tutorial.md#Life-Cycle)

The two-dimensional vector operation function generally has a `create` parameter behind it, which means whether to create a new vector or modify the original vector, and then add the ball to the main scene
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
Now you should be able to see a bouncing ball, but it won’t bounce off when it hits the board. Next, write the logic of hitting the board

Note: It is implemented using `SAT` collision, so it only supports convex polygons
```js

class Ball extends Graphical {
    constructor() {
        // ...
        this.collision.onBodyEnter = (res) => {
            // `res` returns the collision object encountered and overlay
            const body = res.body
            if (body.tag.has("board")) { // Determine if it is a board
                // Obtain the difference in coordinates with the board
                const rebound = this.globalPosition.sub(body.globalPosition,true)
                // Set direction
                this.direction.direction = rebound.direction
                // Play Sound
                engine.getAssets("jump").play()
            }
        }
    }
}
```
`engine.getAssets("jump")` is used to get resources, `onBodyEnter` will be called when a physical body enters the ball, but you can also use [events](./tutorial.md#Events) to listen. Now you can see the ball bounce off the board.

Next, add a score
```js
class scoreText extends Text{
    constructor(){
        // Inherits from text
        super({
            position: new Vector2(300, 0),
            text: "0", // Initially display a 0
            font: "32px Arial", // Font
            color: Color.black(), // Color
            anchor: TextAnchor.CENTER, // Text in the center
            tags: ['scoreText'] // A tag for easy access by other nodes
        })
        // Score
        this.score = 0
    }
    addScore(){
        this.score++
        // To modify the text, you can directly set the text property
        this.text = this.score.toString()
    }
    reStart(){
        this.score = 0
        this.text = "0"
    }
}
```
You might be curious why the writing style of scoreText and collision is a bit different, both are possible, for details see nodes, then add scoreText to the main scene, and add points when it collides with the board, restart when the ball runs off the screen
```js
class Ball extends Graphical {
    constructor() {
        // ...
        this.collision.onBodyEnter = (res) => {
            const body = res.body
            if (body.tag.has("board")) {
                this.scoreText.addScore() // Add this
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
        this.scoreText.reStart() // Add this
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

Alright, now you should be able to run this game. If you cannot run or encounter problems, you can check the source code.

### What to do next...：
* Read the source code of the Bird Running [demo](https://nightre.github.io/sparkle.js/demo/chrome-dino)
* Read the [Tutorial](./tutorial.md)
* Read the [API](https://nightre.github.io/sparkle.js/docs/index)
* Or give a star? `*w*`
