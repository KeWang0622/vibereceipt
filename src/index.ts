#!/usr/bin/env node
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { priceWeek, demoWeek, type WeekInput } from "./pricing.js";
import { renderReceipt } from "./render.js";
import { interactiveWeek } from "./prompts.js";

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
  } else {
    week = await interactiveWeek();
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
