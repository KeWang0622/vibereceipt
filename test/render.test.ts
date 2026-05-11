import { test } from "node:test";
import { strict as assert } from "node:assert";
import { priceWeek, demoWeek } from "../src/pricing.js";
import { renderReceipt } from "../src/render.js";

test("renderReceipt produces a parseable SVG with the headline fields", () => {
  const svg = renderReceipt(priceWeek(demoWeek()));
  assert.match(svg, /<svg[\s\S]*<\/svg>\s*$/);
  assert.match(svg, /VIBE MART/);
  assert.match(svg, /2026-W19/);
  assert.match(svg, /YOUR WEEK, ITEMIZED/);
  assert.match(svg, /TOTAL VIBE/);
  assert.match(svg, /THANK YOU FOR EXISTING TODAY/);
  assert.match(svg, /self-reported, no judgment/);
  assert.match(svg, /MOVED 4x/);
  assert.match(svg, /DOOMSCROLL 14h/);
  // barcode rendered as <rect>s, not as the literal word "(barcode)"
  assert.doesNotMatch(svg, /\(barcode\)/);
});
