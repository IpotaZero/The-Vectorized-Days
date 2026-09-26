import { Vec, vec } from "@ipota/vec"
import { GameObject } from "../GameNode"
import { Game } from "../Game"

export abstract class StageObject extends GameObject {
    constructor(
        protected readonly game: Game,
        readonly p: Vec,
    ) {
        super()
    }

    abstract draw(ctx: CanvasRenderingContext2D): void
}
