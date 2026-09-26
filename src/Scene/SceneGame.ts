import { Game } from "../Game/Game"
import { sc } from "../main"
import { input } from "../input"
import { Scene } from "../utils/Scene/Scene"
import { Stage } from "../Stage/Stage"
import { Menu, MenuOption } from "../utils/Menu/Menu"

export class SceneGame extends Scene {
    private game!: Game
    private menu: Menu | undefined
    private canvas!: HTMLCanvasElement

    private mode: "action" | "pause" | "game-over" | "clear" = "action"

    constructor(private readonly stage: (game: Game) => Promise<Stage>) {
        super()
        this.root.className = "scene-game"
    }

    protected async onStart(): Promise<void> {
        this.canvas = document.createElement("canvas")
        this.canvas.id = "main"
        this.root.appendChild(this.canvas)

        this.game = await Game.create(
            this.stage,
            this.canvas,
            input,
            () => {
                this.openResultMenu("clear")
            },
            () => {
                this.openResultMenu("game-over")
            },
        )

        this.root.appendChild(this.game.textBox.box)
        this.root.appendChild(this.game.gltfViewer.canvas)
    }

    update() {
        switch (this.mode) {
            case "action":
                this.modeAction()
                break
            case "pause":
            case "clear":
            case "game-over":
                this.menu?.update()
                break
        }
    }

    private modeAction() {
        this.game.update()

        if (input.isPushed("pause")) {
            this.openPauseMenu()
        }
    }

    private openPauseMenu() {
        this.mode = "pause"

        this.menu = this.createMenu([
            [{ type: "select", label: "Resume", onSelect: () => this.resume() }],
            [{ type: "select", label: "Retry", onSelect: () => this.retry() }],
            [{ type: "select", label: "Exit", onSelect: () => this.exitToTitle() }],
        ])
        this.menu.onBack = () => this.resume()
    }

    private openResultMenu(mode: "clear" | "game-over") {
        this.mode = mode

        this.menu = this.createMenu([
            [{ type: "select", label: "Exit", onSelect: () => this.exitToTitle() }],
            [{ type: "select", label: "Retry", onSelect: () => this.retry() }],
        ])
    }

    private createMenu(options: MenuOption[][]): Menu {
        const menu = new Menu(
            `<div id="game-menu-root"></div>`,
            { elementId: "game-menu-root", options: () => options },
            input,
            { playCancel: () => {}, playCursor: () => {}, playDisable: () => {}, playOk: () => {} },
        )
        menu.container.classList.add("pause-menu")
        this.root.appendChild(menu.container)
        return menu
    }

    private resume() {
        this.menu?.container.remove()
        this.menu = undefined
        this.mode = "action"
    }

    private retry() {
        sc.goto(async () => new SceneGame(this.stage))
    }

    private exitToTitle() {
        sc.goto(async () => await import("./SceneTitle.js").then(({ SceneTitle }) => new SceneTitle()))
    }

    protected async onEnd(): Promise<void> {
        this.game.dispose()
    }
}
