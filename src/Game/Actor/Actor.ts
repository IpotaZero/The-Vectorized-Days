import { vec, Vec } from "@ipota/vec"
import { GameObject } from "../GameNode"
import { Game } from "../Game"

export abstract class Actor extends GameObject {
    p: Vec = vec(0, 0)
    r: number = 8
    life = 1

    constructor(readonly game: Game) {
        super()
    }
}
