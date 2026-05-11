# vibereceipt — your week, itemized

**Angle:** A local CLI / Claude Code skill that turns the past 7 days of habits (8 quick prompts or a JSON file) into a thermal-receipt-style SVG. Credits for moving / sleeping / reading / sunlight; debits for doomscrolling / skipped gym / 3am anxiety. Self-reported, no judgment.

**Closest incumbents:** https://huangdarren1106.github.io/receiptify (Receiptify — Spotify-listening as a thermal receipt, 1.2M generated 2026-04-08) and https://github.com/iamxoghks/codex-receipts (created 2026-05-01 — receipt of your *Codex coding session*, same thermal aesthetic). vibereceipt is the *human-week* version: not your music, not your coding session — your habits.

**Structural advantage over it:** Receiptify cards your *listening data* via Spotify OAuth and only itemizes positives. vibereceipt cards your *whole week of self-tracking* with zero accounts, zero OAuth, and an explicit debit column (doomscroll, skipped gym, 3am anxiety) — which is where the joke and the relatability live. The artifact runs locally; your data never leaves your laptop. The Receiptify format works *because* people want to see their own version → vibereceipt extends that loop to health/habits, where Spotify can't reach.

**Why now (URL+date):**
- Receiptify 1.2M receipts milestone, 2026-04-08 — the format is empirically viral right now.
- "I Deleted All My Habit Trackers" backlash 2025-09-15 → tracker-fatigue is the cultural moment for a *joke* tracker.
- "Smart bed needs to shut the hell up" The Verge 2026-05-01 → the comedic-anti-quantified-self vibe is in the air.

**Target user:** Anyone with a laptop who's used Receiptify, posts wellness/habit content on X/Bluesky, and would post a self-deprecating receipt of their own week.

**Shareable artifact:** A 600×760 SVG (also rasterizable to PNG). Top-of-feed compatible aspect ratio. The artifact is the product.

**Tech stack:** Node 20+, TypeScript, **zero runtime dependencies**. Pure string-template SVG. **Deterministic from input**: same `date_label` + same answers always produce a byte-identical SVG — no `Date.now()`, no `Math.random()` (verified by `test/determinism.test.ts`). `npx github:KeWang0622/vibereceipt` works without any install.

**Risks:**
1. Comedy quality of the pricing table — if the credits/debits feel arbitrary, the joke flops. (Mitigation: pricing rules are deterministic + tunable; the demo week is calibrated.)
2. People lie to make their numbers look good — but that's *part of the joke*, not a bug. The "self-reported, no judgment" footer leans in.

**Out of scope:**
- Real-time integrations (Apple Health, Strava, Whoop, Spotify, etc.) — would re-introduce OAuth and break the local-only promise.
- Image rasterization in the CLI — SVG renders inline on GitHub READMEs and converts via any browser or `qlmanage`.
- Streaks, leaderboards, social — this is a one-shot artifact, not an app.

> Reference repos used in research (wttr.in, carbon, boring-avatars) are craft samples, not a viral pattern.
