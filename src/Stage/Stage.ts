import { Actor } from "../Game/Actor/Actor"
import { Edge } from "../Game/StageObject/Edge"
import { Enemy } from "../Game/Actor/Enemy"
import { Game } from "../Game/Game"

import { loadStageFromUrl } from "./loadStageFromJson"
import { StageObject } from "../Game/StageObject/StageObject"

export class Stage {
    protected static readonly mapUrl: string

    isBossBattle = false

    readonly edges: readonly Edge[]

    constructor(
        readonly width: number,
        readonly height: number,
        readonly start: { x: number; y: number },
        readonly stageObject: StageObject[],
        readonly enemies: Enemy[],
    ) {
        this.edges = stageObject.filter((m) => m instanceof Edge)
    }

    static async create(game: Game): Promise<Stage> {
        const { width, height, stageObject, start, enemies } = await loadStageFromUrl(game, this.mapUrl)

        return new this(width, height, start, stageObject, enemies)
    }
}
