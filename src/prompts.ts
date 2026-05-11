import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import type { WeekInput } from "./pricing.js";

async function askNum(rl: ReturnType<typeof createInterface>, q: string, fallback: number): Promise<number> {
  const raw = (await rl.question(q)).trim();
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

async function askStr(rl: ReturnType<typeof createInterface>, q: string): Promise<string> {
  const raw = (await rl.question(q)).trim();
  return raw;
}

export async function interactiveWeek(): Promise<WeekInput> {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    stdout.write("vibe mart — answer 8 quick questions about your past 7 days (press enter to skip):\n\n");
    const movement_sessions   = await askNum(rl, "  how many workouts/walks? (e.g. 4) > ", 0);
    const water_liters        = await askNum(rl, "  total water (liters)? (e.g. 7) > ", 0);
    const sleep_hours_avg     = await askNum(rl, "  avg sleep hours/night? (e.g. 6.5) > ", 0);
    const read_minutes_total  = await askNum(rl, "  total minutes reading? (e.g. 90) > ", 0);
    const sunlight_minutes_total = await askNum(rl, "  total minutes of sunlight? (e.g. 30) > ", 0);
    const doomscroll_hours    = await askNum(rl, "  hours doomscrolled? (be honest) > ", 0);
    const skipped_gym         = await askNum(rl, "  commitments skipped? > ", 0);
    const late_night_anxiety  = await askNum(rl, "  3am-anxiety nights? > ", 0);
    const random_joy          = await askStr(rl, "  one good thing this week (≤20 chars, optional) > ");
    stdout.write("\n");
    return {
      movement_sessions, water_liters, sleep_hours_avg,
      read_minutes_total, sunlight_minutes_total,
      doomscroll_hours, skipped_gym, late_night_anxiety,
      random_joy: random_joy || undefined,
    };
  } finally {
    rl.close();
  }
}
