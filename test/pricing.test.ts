import { test } from "node:test";
import { strict as assert } from "node:assert";
import { priceWeek, demoWeek } from "../src/pricing.js";

test("demoWeek prices to a known positive total", () => {
  const r = priceWeek(demoWeek());
  assert.ok(r.total > 0, `expected positive total, got ${r.total}`);
  assert.ok(r.credits.length >= 5);
  assert.ok(r.debits.length >= 3);
  assert.ok(r.bonus, "demo includes random_joy bonus");
  assert.equal(r.date_label, "2026-W19");
});

test("all-zero week is a Common rating", () => {
  const r = priceWeek({
    movement_sessions: 0, water_liters: 0, sleep_hours_avg: 0,
    read_minutes_total: 0, sunlight_minutes_total: 0,
    doomscroll_hours: 0, skipped_gym: 0, late_night_anxiety: 0,
  });
  assert.equal(r.total, 0);
  assert.equal(r.stars, 2);
  assert.equal(r.credits.length, 0);
  assert.equal(r.debits.length, 0);
});

test("doomscroll-heavy week goes negative", () => {
  const r = priceWeek({
    movement_sessions: 0, water_liters: 0, sleep_hours_avg: 0,
    read_minutes_total: 0, sunlight_minutes_total: 0,
    doomscroll_hours: 30, skipped_gym: 5, late_night_anxiety: 4,
  });
  assert.ok(r.total < 0);
  assert.equal(r.stars, 1);
});
