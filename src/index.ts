#!/usr/bin/env node
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { priceWeek, demoWeek, type WeekInput } from "./pricing.js";
import { renderReceipt } from "./render.js";
import { interactiveWeek } from "./prompts.js";

// Compute current ISO week label as a *display default* for interactive mode.
// The artifact itself never embeds this without explicit user confirmation —
// keeps the byte-identical-per-week property intact.
function todayWeekLabel(): string {
  const d = new Date();
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function usage(): never {
  process.stdout.write(
    [
      "vibereceipt — your week, itemized.",
      "",
      "  vibereceipt                  prompts for 8 inputs, writes vibereceipt.svg",
      "  vibereceipt --demo           uses a built-in demo week",
      "  vibereceipt --input FILE     read a JSON file with the WeekInput shape",
      "  vibereceipt --out FILE       output path (default vibereceipt.svg)",
      "  vibereceipt --stdout         write SVG to stdout",
      "  vibereceipt --help",
      "",
    ].join("\n"),
  );
  process.exit(0);
}

function parseArgs(argv: string[]): { mode: "interactive" | "demo" | "file"; input?: string; out?: string; stdout: boolean } {
  const args = argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) usage();
  let mode: "interactive" | "demo" | "file" = "interactive";
  let input: string | undefined;
  let out: string | undefined;
  let stdout = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--demo") mode = "demo";
    else if (a === "--input") { mode = "file"; input = args[++i]; }
    else if (a === "--out" || a === "-o") out = args[++i];
    else if (a === "--stdout") stdout = true;
  }
  return { mode, input, out, stdout };
}

async function main(): Promise<void> {
  const { mode, input, out, stdout } = parseArgs(process.argv);

  let week: WeekInput;
  if (mode === "demo") {
    week = demoWeek();
  } else if (mode === "file") {
    if (!input) {
      process.stderr.write("vibereceipt: --input requires a JSON file path\n");
      process.exit(2);
    }
    week = JSON.parse(readFileSync(resolve(input), "utf8"));
    if (!week.date_label) {
      process.stderr.write("vibereceipt: input JSON must include `date_label` (e.g. \"2026-W19\")\n");
      process.exit(2);
    }
  } else {
    week = await interactiveWeek(todayWeekLabel());
  }

  const data = priceWeek(week);
  const svg = renderReceipt(data);

  if (stdout) {
    process.stdout.write(svg);
    return;
  }
  const outPath = out ? resolve(out) : resolve(process.cwd(), "vibereceipt.svg");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, svg, "utf8");
  process.stdout.write(
    `vibereceipt: ${outPath}\n` +
    `  total vibe: $${data.total.toFixed(2)}  ★ ${data.stars}/5  (${data.credits.length} credits, ${data.debits.length} debits)\n`,
  );
}

main().catch((err) => {
  process.stderr.write(`vibereceipt: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
