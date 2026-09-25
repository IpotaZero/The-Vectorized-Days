import { Dom } from "./Dom.js"
import { SceneChanger } from "./utils/Scene/SceneChanger.js"
import { looper } from "./looper.js"
import { input } from "./input.js"
import { se } from "./se.js"

document.addEventListener("DOMContentLoaded", async () => {
    await se.load()

    looper.start()

    sc.goto(async () => await import("./Scene/SceneTitle.js").then(({ SceneTitle }) => new SceneTitle()))
})

Dom.init()
export const sc = new SceneChanger(Dom.container)

sc.onTransitionStart = () => {
    input.pause("scene-transition")
}

sc.onTransitionEnd = () => {
    input.resume("scene-transition")
    input.clear()
}

looper.addHandler((timeScale) => {
    sc.update()
    input.update()
})

window.addEventListener("keydown", (e) => {
    if (["Tab", "Enter"].includes(e.code)) e.preventDefault()
})

window.addEventListener("contextmenu", (e) => {
    e.preventDefault()
})
