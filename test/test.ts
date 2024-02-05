import { SparkleEngine } from "../src/main"

let testSucees = false
const dom = {
    test: document.getElementById("test")!,
    info: document.getElementById("info")!,
    canvas: document.getElementById("canvas") as HTMLCanvasElement,
}
const engine = new SparkleEngine({
    canvas: dom.canvas
})


export interface ITool {
    fail: (t: string) => void
    log: (t: string) => void
    nextTick: (fn: () => void) => void

}

const tool: ITool = {
    fail(t: string) {
        testSucees = false
        dom.info.innerHTML += `<p class="fail">${JSON.stringify(t)}</p>
        `
        debugger
    },
    log(t: string) {
        dom.info.innerHTML += `<p>${JSON.stringify(t)}</p>`
    },
    nextTick(fn: () => void) {
        setTimeout(() => {
            fn()
        }, 0);
    }
}

const test = async (module: any, name: string) => {

    dom.info.innerHTML += `<p>test：${name}</p>`
    tool.fail.bind(this)

    engine.reset()

    testSucees = true
    await module.default(engine, tool)
    if (testSucees) {
        dom.info.innerHTML += `<p class="sucees">test sucees</p>`
    }

    console.log(
        engine
    )
    return testSucees
}
const files = import.meta.glob('./test_script/*.ts')
for (let key in files) {
    // 检查匹配结果
    const match = key.match(/([^/]+)\.ts$/);
    if (match) {
        const fileName = match[0]; // 提取文件名
        const button = document.createElement('button'); // 创建按钮
        button.innerHTML = fileName; // 设置按钮文本
        dom.test.appendChild(button); // 将按钮添加到DOM中

        // 直接为按钮添加事件监听器
        button.addEventListener("click", async () => {
            const result = await files[key](); // 等待异步操作完成
            test(result, key); // 调用test函数
        });
    }
}
