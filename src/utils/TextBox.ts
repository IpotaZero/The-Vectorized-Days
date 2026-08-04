import { DigitalInput } from "@ipota/input"

export interface TalkConfig {
    name?: string
    /** 1文字あたりの表示に要するフレーム数（既定値: 2） */
    charInterval?: number

    canSkip?: boolean
}

export class TextBox {
    readonly box = document.createElement("div")
    private readonly name: HTMLElement
    private readonly text: HTMLElement

    constructor(private readonly input: DigitalInput.Reader<"ok" | "cancel">) {
        this.box.innerHTML = `
            <div class="name"></div>
            <div class="text"></div>
        `
        this.name = this.box.querySelector(".name") as HTMLElement
        this.text = this.box.querySelector(".text") as HTMLElement
        this.box.classList.add("hidden", "text-box")
    }

    hide() {
        this.box.classList.add("hidden")
    }

    *say(texts: readonly string[], config: TalkConfig = {}) {
        for (const text of texts) {
            yield* this.saySingle(text, config)
            yield
        }
    }

    private *saySingle(text: string, { name = "", charInterval = 2, canSkip = true }: TalkConfig) {
        this.name.innerHTML = name
        this.text.innerHTML = ""

        this.box.classList.remove("hidden")
        this.box.classList.remove("text-box--done")
        this.box.classList.add("text-box--typing")

        yield* this.typeText(text, charInterval, canSkip)

        this.box.classList.remove("text-box--typing")
        this.box.classList.add("text-box--done")

        yield* this.wait()

        this.box.classList.add("hidden")
    }

    /**
     * 1文字ずつ表示していく。ok入力で即時全文表示にスキップする。
     * HTMLタグ（<br>など）は分割せず1トークンとして丸ごと追加し、
     * 表示待ちフレームも消費しない（タグの途中が見えるのを防ぐ）。
     */
    private *typeText(text: string, interval: number, canSkip: boolean) {
        const tokens = text.match(/<[^>]+>|[\s\S]/g) ?? []
        let revealed = ""

        for (const token of tokens) {
            revealed += token
            this.text.innerHTML = revealed

            if (token.startsWith("<")) continue

            for (let f = 0; f < interval; f++) {
                yield

                if (canSkip && this.input.isPushed("ok")) {
                    this.text.innerHTML = text
                    yield
                    return
                }
            }
        }
    }

    private *wait() {
        while (!this.input.isPushed("ok")) yield
        yield
    }
}
