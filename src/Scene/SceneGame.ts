import { Dom } from "../Dom"
import { Game } from "../Game/Game"
import { sc } from "../main"
import { input } from "../input"
import { Scene } from "../utils/Scene/Scene"
import { Stage } from "../Stage/Stage"
import { Menu } from "../utils/Menu/Menu"

export class SceneGame extends Scene {
    private game!: Game
    private menu!: Menu
    private canvas!: HTMLCanvasElement

    private mode: "action" | "pause" | "game-over" | "clear" = "action"

    constructor(private readonly stage: Stage) {
        super()
    }

    async start(): Promise<void> {
        this.canvas = document.createElement("canvas")
        this.canvas.id = "main"
        Dom.container.appendChild(this.canvas)

        this.game = new Game(
            this.stage,
            this.canvas,
            input,
            () => {
                this.mode = "clear"
            },
            () => {
                this.mode = "game-over"
            },
        )

        Dom.container.appendChild(this.game.textBox.box)
        Dom.container.appendChild(this.game.gltfViewer.canvas)

        await this.game.loadFromStage(this.stage)
    }

    update() {
        switch (this.mode) {
            case "action":
                this.modeAction()
                break
        }
    }

    private modeAction() {
        this.game.update()

        if (input.isPushed("pause")) {
            this.mode = "pause"
        }
    }

    async end(): Promise<void> {
        this.game.dispose()
        this.canvas.remove()
        this.game.textBox.box.remove()
        this.game.gltfViewer.canvas.remove()
    }
}
