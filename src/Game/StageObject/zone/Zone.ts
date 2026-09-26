import { Vec } from "@ipota/vec"
import { StageObject } from "../StageObject.js"
import { Game } from "../../Game.js"

// 触れると何かが起こる円形のゾーン
export abstract class Zone extends StageObject {
    constructor(
        game: Game,
        p: Vec,
        readonly width: number,
        readonly height: number,
    ) {
        super(game, p)

        this.addScript(() => this.checkEnter(), { loop: Infinity })
    }

    /**
     * このフレームで p がゾーンの外から中へ入った瞬間だけ true を返す。
     * 触れ続けている間は再度 true にならず、一度離れて再び触れると
     * また true になる。（SEや演出がゾーンに触れ続けている間ずっと
     * 再発火してしまうのを防ぐための「エッジ検出」方式）
     */
    private *checkEnter() {
        const nowInside = this.isInsideArea(this.game.player.p)

        if (nowInside) {
            yield* this.onEnter()
        }

        yield
    }

    private isInsideArea(p: Vec): boolean {
        return (
            Math.abs(p.x - this.p.x - this.width / 2) <= this.width / 2 &&
            Math.abs(p.y - this.p.y - this.height / 2) <= this.height / 2
        )
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = "#888"
        ctx.lineWidth = 1.5
        ctx.setLineDash([6, 6])
        ctx.beginPath()
        ctx.ellipse(
            this.p.x + this.width / 2,
            this.p.y + this.height / 2,
            this.width / 2,
            this.height / 2,
            0,
            0,
            Math.PI * 2,
        )
        ctx.stroke()
        ctx.setLineDash([])
    }

    abstract onEnter(): Generator<void, void, unknown>
}
