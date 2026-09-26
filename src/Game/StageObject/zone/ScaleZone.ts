import { Ease } from "@ipota/functions"
import { Vec } from "@ipota/vec"
import { Game } from "../../Game"
import { Zone } from "./Zone"

export class ScaleZone extends Zone {
    readonly scale: number

    constructor(game: Game, p: Vec, width: number, height: number, scale: number) {
        super(game, p, width, height)
        this.scale = scale
    }

    override *onEnter(): Generator<void, void, unknown> {
        const frame = 15

        const startScale = this.game.camera.scale
        const diffScale = this.scale - startScale

        for (let i = 0; i < frame; i++) {
            this.game.camera.scale = startScale + diffScale * Ease.Out((i + 1) / frame)
            yield
        }
    }
}
