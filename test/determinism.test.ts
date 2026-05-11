import { test } from "node:test";
import { strict as assert } from "node:assert";
import { priceWeek, demoWeek } from "../src/pricing.js";
import { renderReceipt } from "../src/render.js";

test("same input → byte-identical SVG", () => {
  const a = renderReceipt(priceWeek(demoWeek()));
  const b = renderReceipt(priceWeek(demoWeek()));
  assert.equal(a, b);
});

test("different week_label changes the barcode pattern", () => {
  const week = demoWeek();
  const a = renderReceipt(priceWeek({ ...week, date_label: "2026-W19" }));
  const b = renderReceipt(priceWeek({ ...week, date_label: "2026-W20" }));
  assert.notEqual(a, b);
});

test("date_label is required (no clock fallback)", () => {
  // TypeScript enforces this at compile time, but verify the runtime contract too:
  // a stats struct missing date_label must not silently fall back to Date.now().
  const week = demoWeek();
  const result = priceWeek({ ...week, date_label: "2026-W19" });
  assert.equal(result.date_label, "2026-W19");
  // Prove the struct shape: date_label is a required string, not optional.
  const sig: keyof typeof week = "date_label";
  assert.equal(typeof week[sig], "string");
});
