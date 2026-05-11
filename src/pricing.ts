// Turn a week of habits into an itemized list of credits (good) and debits (bad).
// Prices are deterministic from input — no random component, no clock dependency.

export interface WeekInput {
  // counts / hours for the past 7 days
  movement_sessions: number;     // workouts, walks, gym, sport
  water_liters: number;          // total
  sleep_hours_avg: number;       // average per night
  read_minutes_total: number;    // reading
  sunlight_minutes_total: number;
  doomscroll_hours: number;      // total
  skipped_gym: number;           // count of skipped commitments
  late_night_anxiety: number;    // count of 3am-thought nights
  random_joy?: string;           // free-form "found $20" line (optional)
  date_label?: string;           // e.g. "2026-W19"
}

export interface LineItem {
  label: string;
  amount: number; // positive = credit, negative = debit
}

const CREDIT_RULES = {
  movement: (n: number) => n * 3,           // $3 per session
  water:    (l: number) => Math.min(l, 14) * 1.0, // $1/L capped at 14L
  sleep:    (h: number) => h >= 7 ? 9 : (h >= 6 ? 6 : (h >= 5 ? 2 : 0)),
  read:     (m: number) => Math.min(Math.floor(m / 15), 12), // $1 per 15min, cap $12
  sun:      (m: number) => Math.min(Math.floor(m / 10), 8),  // $1 per 10min, cap $8
};

const DEBIT_RULES = {
  doomscroll: (h: number) => -Math.floor(h * 1.5),  // -$1.5/h
  skipped:    (n: number) => -n * 5,                 // -$5/skip
  anxiety:    (n: number) => -n * 2,                 // -$2/night
};

export interface ReceiptData {
  date_label: string;
  credits: LineItem[];
  debits: LineItem[];
  bonus?: LineItem;
  subtotal: number;
  total: number;
  stars: number; // 0–5
}

export function priceWeek(input: WeekInput): ReceiptData {
  const credits: LineItem[] = [];
  const debits: LineItem[] = [];

  if (input.movement_sessions > 0) {
    credits.push({ label: `MOVED ${input.movement_sessions}x`, amount: CREDIT_RULES.movement(input.movement_sessions) });
  }
  if (input.water_liters > 0) {
    credits.push({ label: `WATER ${input.water_liters}L`, amount: CREDIT_RULES.water(input.water_liters) });
  }
  if (input.sleep_hours_avg > 0) {
    credits.push({ label: `SLEEP ${input.sleep_hours_avg}h avg`, amount: CREDIT_RULES.sleep(input.sleep_hours_avg) });
  }
  if (input.read_minutes_total > 0) {
    credits.push({ label: `READ ${input.read_minutes_total}m`, amount: CREDIT_RULES.read(input.read_minutes_total) });
  }
  if (input.sunlight_minutes_total > 0) {
    credits.push({ label: `SUNLIGHT ${input.sunlight_minutes_total}m`, amount: CREDIT_RULES.sun(input.sunlight_minutes_total) });
  }

  if (input.doomscroll_hours > 0) {
    debits.push({ label: `DOOMSCROLL ${input.doomscroll_hours}h`, amount: DEBIT_RULES.doomscroll(input.doomscroll_hours) });
  }
  if (input.skipped_gym > 0) {
    debits.push({ label: `SKIPPED GYM ${input.skipped_gym}x`, amount: DEBIT_RULES.skipped(input.skipped_gym) });
  }
  if (input.late_night_anxiety > 0) {
    debits.push({ label: `3AM ANXIETY ${input.late_night_anxiety}x`, amount: DEBIT_RULES.anxiety(input.late_night_anxiety) });
  }

  const subtotal = sum(credits) + sum(debits);

  const bonus: LineItem | undefined = input.random_joy
    ? { label: `✻ ${input.random_joy.toUpperCase().slice(0, 20)}`, amount: 20 }
    : undefined;

  const total = subtotal + (bonus?.amount ?? 0);
  const stars = starRating(total);
  const date_label = input.date_label || isoWeekLabel(new Date());

  return { date_label, credits, debits, bonus, subtotal, total, stars };
}

function sum(items: LineItem[]): number {
  return items.reduce((a, b) => a + b.amount, 0);
}

function starRating(total: number): number {
  if (total >= 60) return 5;
  if (total >= 40) return 4;
  if (total >= 20) return 3;
  if (total >= 0)  return 2;
  return 1;
}

function isoWeekLabel(d: Date): string {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export function demoWeek(): WeekInput {
  return {
    movement_sessions: 4,
    water_liters: 7,
    sleep_hours_avg: 6.2,
    read_minutes_total: 90,
    sunlight_minutes_total: 38,
    doomscroll_hours: 14,
    skipped_gym: 3,
    late_night_anxiety: 2,
    random_joy: "found $20 outside",
    date_label: "2026-W19",
  };
}
