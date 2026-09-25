import { Scene } from "../utils/Scene/Scene"
import { GltfViewer } from "../utils/GltfViewer"
import { bm } from "../bm"
import { Menu } from "../utils/Menu/Menu"
import { input } from "../input"
import { Dom } from "../Dom"
import { sc } from "../main"
import { SceneGame } from "./SceneGame"
import StageTutorial from "../Stage/StageTutorial"
import { T } from "../T"

export class SceneTitle extends Scene {
    private gltfViewer = new GltfViewer(window.innerWidth, window.innerHeight)
    private menu!: Menu
    private titleUI!: HTMLElement

    constructor() {
        super()
    }

    update() {
        this.gltfViewer.update()
        this.menu.update()
    }

    async start(): Promise<void> {
        this.playBgm()

        await this.gltfViewer.show("assets/3d/Hare.glb", {
            scale: 12,
            p: [5, -4, -16],
            rotateY: (T * 4.5) / 8,
            animationName: "wait",
        })

        this.titleUI = document.createElement("div")
        this.titleUI.className = "title-ui"
        this.titleUI.innerHTML = `
            <div class="title-version">ver. Tentative</div>
            <div class="title-copyright">© 2026 - Ososikirackets</div>
            <div class="title-logo">THE<br>VECTORIZED<br>DAYS! (仮)</div>
        `

        this.menu = new Menu(
            `
                <div id="root"></div>
                <div id="stages" class="fadeout"></div>
            `,
            {
                elementId: "root",
                options: () => [
                    [
                        {
                            type: "submenu",
                            label: "Stages",
                            hides: [],
                            subMenu: () => ({
                                elementId: "stages",
                                options: () => [
                                    [
                                        {
                                            type: "select",
                                            label: "test",
                                            onSelect: () => {
                                                sc.goto(async () => {
                                                    const stage = await StageTutorial.create()
                                                    return new SceneGame(stage)
                                                })
                                            },
                                        },
                                    ],
                                ],
                            }),
                        },
                    ],
                    [
                        {
                            type: "select",
                            label: "くしくし",
                            onSelect: () => {
                                this.gltfViewer.playOnce("grooming")
                            },
                        },
                    ],
                ],
            },
            input,
            { playCancel: () => {}, playCursor: () => {}, playDisable: () => {}, playOk: () => {} },
        )
        this.menu.container.classList.add("title-menu")

        Dom.container.appendChild(this.gltfViewer.canvas)
        Dom.container.appendChild(this.titleUI)
        Dom.container.appendChild(this.menu.container)
    }

    private async playBgm() {
        if (bm.isPlaying()) {
            await bm.fadeOut(2)
        }
        await bm.load({ src: "assets/bgm/title.mp3" })
        await bm.play()
    }

    async end(): Promise<void> {
        this.gltfViewer.dispose()
        this.gltfViewer.canvas.remove()
        this.titleUI.remove()
        this.menu.container.remove()
    }
}
