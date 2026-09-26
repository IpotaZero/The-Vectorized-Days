import { Scene } from "../utils/Scene/Scene"
import { GltfViewer } from "../utils/GltfViewer"
import { bm } from "../bm"
import { Menu, MenuOption } from "../utils/Menu/Menu"
import { input } from "../input"
import { sc } from "../main"
import { SceneGame } from "./SceneGame"
import { Stage } from "../Stage/Stage"
import { T } from "../T"

export class SceneTitle extends Scene {
    private gltfViewer = new GltfViewer(window.innerWidth, window.innerHeight)
    private menu!: Menu
    /** タイトルロゴ・バージョン表記・3Dモデルをまとめる箱。Stages選択時はこれごとスライドアウトする */
    private content = document.createElement("div")

    constructor() {
        super()
        this.root.className = "scene-title"
    }

    update() {
        this.gltfViewer.update()
        this.menu.update()
    }

    protected async onStart(): Promise<void> {
        this.playBgm()

        await this.gltfViewer.show("assets/3d/Hare.glb", {
            scale: 12,
            p: [5, -4, -16],
            rotateY: (T * 4) / 8,
            animationName: "wait",
        })

        this.content.className = "title-content"
        this.content.innerHTML = `
            <div class="title-version">ver. Tentative</div>
            <div class="title-copyright">© 2026 - Ososikirackets</div>
            <div class="title-logo">THE<br>VECTORIZED<br>DAYS! (仮)</div>
        `
        this.content.appendChild(this.gltfViewer.canvas)

        this.menu = new Menu(
            `
                <div class="title-menu-stack">
                    <div id="root"></div>
                    <div id="stages" class="fadeout"></div>
                </div>
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
                                    [this.stageOption("test", () => import("../Stage/StageTutorial.js"))],
                                    [this.stageOption("StageTest", () => import("../Stage/StageTest.js"))],
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

        this.root.appendChild(this.content)
        this.root.appendChild(this.menu.container)
    }

    /** ステージ選択肢を組み立てる。ステージファイルは選ばれるまで遅延インポートされる */
    private stageOption<S extends typeof Stage>(label: string, load: () => Promise<{ default: S }>): MenuOption {
        return {
            type: "select",
            label,
            onSelect: () => {
                sc.goto(async () => {
                    const { default: StageClass } = await load()
                    return new SceneGame(async (game) => await StageClass.create(game))
                })
            },
        }
    }

    private async playBgm() {
        if (bm.isPlaying()) {
            await bm.fadeOut(2)
        }
        await bm.load({ src: "assets/bgm/title.mp3" })
        await bm.play()
    }

    protected async onEnd(): Promise<void> {
        this.gltfViewer.dispose()
    }
}
