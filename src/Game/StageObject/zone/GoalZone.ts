import { Vec } from "@ipota/vec"
import { Zone } from "./Zone"
import { Game } from "../../Game"

export class GoalZone extends Zone {
    constructor(game: Game, p: Vec, width: number, height: number) {
        super(game, p, width, height)
    }

    override *onEnter(): Generator<void, void, unknown> {
        this.game.onFinish()
    }
}
