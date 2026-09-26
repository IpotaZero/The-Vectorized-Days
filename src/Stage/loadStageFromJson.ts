import * as tiled from "@kayahr/tiled"

import { Vec, vec } from "@ipota/vec"
import { Actor } from "../Game/Actor/Actor.js"
import { Game } from "../Game/Game.js"
import { Enemy } from "../Game/Actor/Enemy.js"
import { StageObject } from "../Game/StageObject/StageObject.js"
import { Edge } from "../Game/StageObject/Edge.js"
import { TextObject } from "../Game/StageObject/TextObject.js"
import { GoalZone } from "../Game/StageObject/zone/GoalZone.js"
import { GravityZone } from "../Game/StageObject/zone/GravityZone.js"
import { ScaleZone } from "../Game/StageObject/zone/ScaleZone.js"

type TiledStage = {
    width: number
    height: number
    start: Vec
    enemies: Enemy[]
    stageObject: StageObject[]
}

export async function loadStageFromUrl(game: Game, url: string): Promise<TiledStage> {
    const response = await fetch(url)
    // JSON全体を tiled.Map 型としてキャスト
    const mapData = (await response.json()) as tiled.Map

    return loadStageFromMapData(game, mapData)
}

export async function loadStageFromMapData(game: Game, mapData: tiled.Map): Promise<TiledStage> {
    const enemies: Enemy[] = []
    const stageObject: StageObject[] = []
    let start = vec(0, 0)

    // "joints" (object型のlistプロパティ) が参照するオブジェクトの位置を
    // 引けるように、先にすべてのオブジェクトのIDと位置を集めておく
    const objectPositions = new Map<number, { x: number; y: number }>()
    for (const layer of mapData.layers) {
        if (!tiled.isObjectGroup(layer)) continue
        for (const obj of layer.objects) {
            objectPositions.set(obj.id, { x: obj.x, y: obj.y })
        }
    }

    for (const layer of mapData.layers) {
        // 型ガードを使って ObjectGroup（オブジェクトレイヤー）のみに絞り込む
        if (!tiled.isObjectGroup(layer)) continue

        // このブロック内では layer.objects に安全にアクセスできる
        for (const obj of layer.objects) {
            const cycle = obj.properties?.find((p) => p.name === "cycle")?.value as number | undefined

            // "joints" は Tiled 1.12 で追加された object 型のリストプロパティ。
            // @kayahr/tiled の型定義がまだ list 型に対応していないため、
            // ここだけ型を無しにして緩く扱う。
            const moveJoints = obj.properties?.find((p) => p.name === "joints") as any
            let joints: Vec[] = []

            if (moveJoints?.type === "list") {
                // list の各要素は、object 型プロパティ相当の値(参照先オブジェクトのid)、
                // または { value: id } の形で入ってくることがあるため、両方に対応する
                joints = (moveJoints.value as any[])
                    .map((item) => {
                        const objectId: number = typeof item === "object" && item !== null ? item.value : item
                        return objectPositions.get(objectId)
                    })
                    .filter((position): position is { x: number; y: number } => position !== undefined)
                    .map((position) => vec(position.x, position.y))
            }

            joints.unshift(vec(obj.x, obj.y)) // 最後にオブジェクト自身の位置を追加
            joints.push(vec(obj.x, obj.y)) // 最後にオブジェクト自身の位置を追加

            // ポリラインを持つオブジェクト
            if (obj.polyline) {
                for (let i = 0; i < obj.polyline.length - 1; i++) {
                    const p1 = obj.polyline[i]
                    const p2 = obj.polyline[i + 1]
                    stageObject.push(new Edge(game, vec(obj.x + p1.x, obj.y + p1.y), vec(obj.x + p2.x, obj.y + p2.y)))
                }
            }

            if (obj.polygon) {
                for (let i = 0; i < obj.polygon.length; i++) {
                    const p1 = obj.polygon[i]
                    const p2 = obj.polygon[(i + 1) % obj.polygon.length]
                    // polylineと同様、セグメントの始点オフセット(p1)分だけ joints をずらす
                    const segmentJoints = joints.map((j) => j.add(vec(p1.x, p1.y)))
                    stageObject.push(new Edge(game, vec(obj.x + p1.x, obj.y + p1.y), vec(obj.x + p2.x, obj.y + p2.y)))
                }
            }

            if (obj.text) {
                stageObject.push(
                    new TextObject(
                        game,
                        vec(obj.x, obj.y),
                        obj.width!,
                        obj.height!,
                        (obj.rotation! / 180) * Math.PI,
                        obj.text.text,
                        obj.text.pixelsize,
                    ),
                )
            }

            // カスタムプロパティを持つオブジェクト
            if (obj.name === "Gravity") {
                // properties から値を取り出す際も型推論が効く
                const gx = (obj.properties?.find((p) => p.name === "gx")?.value as number) ?? 0
                const gy = (obj.properties?.find((p) => p.name === "gy")?.value as number) ?? 0
                stageObject.push(
                    new GravityZone(
                        game,
                        vec(obj.x + obj.width! / 2, obj.y + obj.height! / 2),
                        obj.width!,
                        obj.height!,
                        vec(gx, gy),
                    ),
                )
            }

            if (obj.name === "Scale") {
                const gx = (obj.properties?.find((p) => p.name === "scale")?.value as number) || 1
                stageObject.push(
                    new ScaleZone(
                        game,
                        vec(obj.x, obj.y), // ← 中心座標に変換
                        obj.width!,
                        obj.height!,
                        gx,
                    ),
                )
            }

            if (obj.name === "Start") {
                start = vec(obj.x, obj.y)
            }

            if (obj.name === "Enemy") {
                const rawType = obj.properties?.find((p) => p.name === "enemy")?.value as string | undefined

                // Tiledの "enemy" プロパティは マップファイルからの相対パスになる

                enemies.push(new Enemy())
            }

            if (obj.name === "Goal") {
                stageObject.push(
                    new GoalZone(
                        game,
                        vec(obj.x, obj.y), // ← 中心座標に変換
                        obj.width!,
                        obj.height!,
                    ),
                )
            }
        }
    }

    return {
        width: mapData.width * mapData.tilewidth,
        height: mapData.height * mapData.tileheight,
        stageObject,
        start,
        enemies,
    }
}
