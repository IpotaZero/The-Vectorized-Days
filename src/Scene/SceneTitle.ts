import { Scene } from "../utils/Scene/Scene"
import { GltfViewer } from "../utils/GltfViewer"
import { bm } from "../bm"
import { Menu } from "../utils/Menu/Menu"
import { input } from "../input"
import { Dom } from "../Dom"

export class SceneTitle extends Scene {
    private gltfViewer = new GltfViewer(window.innerWidth, window.innerHeight)
    private menu!: Menu

    constructor() {
        super()
    }

    update() {
        this.gltfViewer.update()
        this.menu.update()
    }

    async start(): Promise<void> {
        this.playBgm()

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
                                options: () => [[{ type: "select", label: "test", onSelect: () => {} }]],
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

        Dom.container.appendChild(this.gltfViewer.canvas)
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
    }
}
