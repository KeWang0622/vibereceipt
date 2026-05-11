## Title
Show HN: vibereceipt – your week, itemized (local CLI, no accounts)

## Body

I built vibereceipt over an afternoon. It's a tiny CLI that turns 9 quick prompts about the past 7 days into a thermal-receipt SVG. Credits for movement / sleep / sunlight; debits for doomscrolling / skipped gym / 3am anxiety; total at the bottom; star rating; barcode derived from a sha256 of the week+total.

    npx github:KeWang0622/vibereceipt

That drops a `vibereceipt.svg` in your current directory. `--demo` produces a built-in week. `--input file.json` reads a JSON struct.

Three things I cared about:

1. **Zero accounts, zero OAuth, zero network.** Everything happens on your laptop. The whole point of itemizing your week is that the categories are personal and you don't want them in someone's analytics warehouse. (Receiptify-style receipts are the inspiration, but they need a Spotify login and only itemize positives.)

2. **Deterministic from input.** Same `date_label` + same answers → byte-identical SVG. There's no `Date.now()` or `Math.random()` in the rendering path (verified by `test/determinism.test.ts`). The barcode is `sha256(week:total)`, the foil is template-string SVG. Two machines, same answers, same artifact.

3. **The debit column is the joke.** Receiptify only itemizes positives because Spotify only has positives. The week has both. DOOMSCROLL 14h at −$21 is the line that makes someone want to post their own.

Repo: https://github.com/KeWang0622/vibereceipt (MIT, Node 20+, zero runtime deps, ~300 LOC of TypeScript)

There's a related repo `iamxoghks/codex-receipts` from 10 days ago that does the same thermal aesthetic for Codex coding sessions. vibereceipt is the *human-week* version. Both can coexist.

Two open questions I'd love feedback on:

1. The pricing table (`src/pricing.ts`) is the comedic core. A community-tuned version (kids, alcohol, screen-time-by-app, …) would be better than my one-person calibration.
2. PNG export today goes through `qlmanage` or any browser. Worth baking in a pure-JS rasterizer or staying SVG-first?
