import { Vec } from "@ipota/vec"
import { Game } from "../Game"
import { StageObject } from "./StageObject"

const COLLISION_MARGIN = 0

export class Edge extends StageObject {
    private readonly offset: Vec

    constructor(game: Game, p0: Vec, p1: Vec) {
        super(game, p0)
        this.offset = p1.sub(p0)
    }

    get start(): Vec {
        return this.p
    }

    get end(): Vec {
        return this.p.add(this.offset)
    }

    vec(): Vec {
        return this.offset
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = "#111"
        ctx.lineWidth = 1

        const start = this.start
        const end = this.end

        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.stroke()

        const dir = end.sub(start).normalize()
        const end0 = end.add(dir.rotate((Math.PI * 4) / 5).scale(24))
        const end1 = end.add(dir.rotate((-Math.PI * 4) / 5).scale(24))

        ctx.beginPath()
        ctx.moveTo(end.x, end.y)
        ctx.lineTo(end0.x, end0.y)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(end.x, end.y)
        ctx.lineTo(end1.x, end1.y)
        ctx.stroke()

        ctx.setLineDash([])
    }

    /**
     * このEdge(床/壁)と、sweepStart→sweepEnd の移動区間との交差判定。
     * cross積ベースなので垂直・水平を含めどんな向きでも特別扱い不要。
     * 戻り値の t は sweep 上の位置(0=開始点, 1=終了点)。
     * 移動するEdgeの場合は、現在のフレームでの位置(currentStart/currentEnd)を用いる。
     *
     * ※当たり判定ロジックは一旦そのまま。start/end が Movable の p に連動する
     *   getter になったため、Edge が移動していれば現在位置に対して判定される。
     */
    getSweepHit(sweepStart: Vec, sweepEnd: Vec): { t: number; point: Vec } | null {
        const start = this.start
        const end = this.end

        const r = end.sub(start) // このEdgeの方向ベクトル
        const s = sweepEnd.sub(sweepStart) // 移動方向ベクトル

        const denom = r.cross(s)
        if (Math.abs(denom) < 1e-9) return null // 平行 or 移動量ゼロ

        const qp = sweepStart.sub(start)

        const t = qp.cross(s) / denom // このEdge上のどこで交わるか(0〜1)
        const u = qp.cross(r) / denom // sweep上のどこで交わるか(0〜1)

        const eps = COLLISION_MARGIN / r.magnitude()
        const isHit = t > -eps && t < 1 + eps && u >= 0 && u <= 1

        if (!isHit) return null

        return { t: u, point: sweepStart.add(s.scale(u)) }
    }
}
