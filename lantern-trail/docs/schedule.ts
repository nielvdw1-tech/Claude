/**
 * The Lantern Trail: which night does a family see tonight?
 *
 * Rules (see PLAN.md):
 * 1. The journey never ends and is not tied to the calendar. It advances only when a night is
 *    completed, so missed nights never lose progress (no streak shaming).
 *    Trails play in order; after the last one, the cycle starts again.
 * 2. Seasonal trails override the journey by date, then the journey resumes where it paused:
 *    - Christmas: 1–25 December, one night per date.
 *    - Easter: Palm Sunday to Easter Sunday (8 nights), one night per date.
 * 3. The journey position is kept per family, so siblings stay on the same Bible story
 *    (each in their own age band).
 */

export interface DateOnly { y: number; m: number; d: number } // m = 1..12

const toUTC = (x: DateOnly) => Date.UTC(x.y, x.m - 1, x.d);
const DAY = 86_400_000;
export const daysBetween = (a: DateOnly, b: DateOnly) => Math.round((toUTC(b) - toUTC(a)) / DAY);
const addDays = (x: DateOnly, n: number): DateOnly => {
  const t = new Date(toUTC(x) + n * DAY);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
};

/** Western (Gregorian) Easter Sunday: Anonymous Gregorian algorithm. */
export function easterSunday(year: number): DateOnly {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { y: year, m: month, d: day };
}

export type Tonight =
  | { kind: "seasonal"; season: "christmas" | "easter"; nightIndex: number } // 0-based within the seasonal trail
  | { kind: "journey"; trailIndex: number; nightIndex: number; cycle: number };

/** Seasonal night for this date, or null if no season is active. */
export function seasonalNight(today: DateOnly): Tonight | null {
  if (today.m === 12 && today.d <= 25) return { kind: "seasonal", season: "christmas", nightIndex: today.d - 1 };
  const easter = easterSunday(today.y);
  const palmSunday = addDays(easter, -7);
  const i = daysBetween(palmSunday, today);
  if (i >= 0 && i <= 7) return { kind: "seasonal", season: "easter", nightIndex: i };
  return null;
}

/**
 * @param completedJourneyNights how many journey nights the family has completed
 * @param journeyTrailLengths number of nights in each journey trail, in order
 */
export function tonight(today: DateOnly, completedJourneyNights: number, journeyTrailLengths: number[]): Tonight {
  const s = seasonalNight(today);
  if (s) return s;
  const total = journeyTrailLengths.reduce((a, b) => a + b, 0);
  const cycle = Math.floor(completedJourneyNights / total);
  let pos = completedJourneyNights % total;
  for (let t = 0; t < journeyTrailLengths.length; t++) {
    if (pos < journeyTrailLengths[t]) return { kind: "journey", trailIndex: t, nightIndex: pos, cycle };
    pos -= journeyTrailLengths[t];
  }
  throw new Error("unreachable");
}
