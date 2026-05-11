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
