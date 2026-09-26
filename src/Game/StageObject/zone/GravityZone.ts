import { Vec, vec } from "@ipota/vec"
import { Game } from "../../Game"
import { Zone } from "./Zone"

// 触れると重力の向き・強さが変わる円形のゾーン
export class GravityZone extends Zone {
    readonly gravity: Vec

    constructor(game: Game, p: Vec, width: number, height: number, gravity: Vec) {
        super(game, p, width, height)
        this.gravity = gravity
    }

    override *onEnter(): Generator<void, void, unknown> {
        this.game.player.g = this.gravity
    }

    override draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx)

        // 中心から重力方向への矢印
        const dir = this.gravity.normalize()
        const len = 30
        const tip = this.p.add(dir.scale(len)).add(vec(this.width / 2, this.height / 2))
        ctx.strokeStyle = "#888"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(this.p.x + this.width / 2, this.p.y + this.height / 2)
        ctx.lineTo(tip.x, tip.y)
        ctx.stroke()

        const back0 = dir.rotate((Math.PI * 4) / 5).scale(8)
        const back1 = dir.rotate((-Math.PI * 4) / 5).scale(8)
        ctx.beginPath()
        ctx.moveTo(tip.x, tip.y)
        ctx.lineTo(tip.x + back0.x, tip.y + back0.y)
        ctx.moveTo(tip.x, tip.y)
        ctx.lineTo(tip.x + back1.x, tip.y + back1.y)
        ctx.stroke()
    }
}
