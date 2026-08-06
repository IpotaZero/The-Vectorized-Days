type LessThan<N extends number, Acc extends unknown[] = []> = Acc["length"] extends N
    ? never
    : Acc["length"] | LessThan<N, [...Acc, unknown]>

type test = LessThan<3> // 0 | 1 | 2
