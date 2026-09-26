import { Vec } from "@ipota/vec"
import { StageObject } from "./StageObject"
import { Game } from "../Game"

export class TextObject extends StageObject {
    constructor(
        game: Game,
        p: Vec,
        public width: number,
        public height: number,
        public rotation: number,
        public text: string,
        public fontSize: number = 16,
    ) {
        super(game, p)
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save()
        ctx.translate(this.p.x, this.p.y)
        ctx.rotate(this.rotation)
        ctx.fillStyle = "#000"
        ctx.font = `${this.fontSize}px normal, japanese`
        // ctx.textAlign = "center"
        ctx.textBaseline = "top"
        ctx.fillText(this.text, 0, 0)
        ctx.restore()
    }
}
