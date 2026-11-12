/**
 * The Lantern Trail: which night does a family see tonight?
 *
 * Rules (see docs/PLAN.md):
 * 1. The journey never ends and is not tied to the calendar. It advances only when a night is
 *    completed, so missed nights never lose progress (no streak shaming).
 *    Trails play in order; after the last one, the cycle starts again.
 * 2. Seasonal trails override the journey by date, then the journey resumes where it paused:
 *    - Christmas ends on 25 December. A trail of N nights (up to 25) runs 25-N+1 .. 25 December.
 *    - Easter ends on Easter Sunday. A trail of N nights (up to 8) starts N-1 days before it
 *      (8 nights = Palm Sunday to Easter Sunday).
 *    A season with 0 nights published is skipped.
 * 3. Each child has their own journey position. Siblings who do the night together stay on the
 *    same Bible story (each in their own age band).
 */

export interface DateOnly { y: number; m: number; d: number } // m = 1..12

const toUTC = (x: DateOnly) => Date.UTC(x.y, x.m - 1, x.d);
const DAY = 86_400_000;
export const daysBetween = (a: DateOnly, b: DateOnly) => Math.round((toUTC(b) - toUTC(a)) / DAY);
export const addDays = (x: DateOnly, n: number): DateOnly => {
  const t = new Date(toUTC(x) + n * DAY);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
};
export const today = (now = new Date()): DateOnly => ({ y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() });

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

export interface SeasonLengths { christmas: number; easter: number }

export type Tonight =
  | { kind: "seasonal"; season: "christmas" | "easter"; nightIndex: number } // 0-based within the seasonal trail
  | { kind: "journey"; trailIndex: number; nightIndex: number; cycle: number };

/** Seasonal night for this date, or null if no season is active. */
export function seasonalNight(date: DateOnly, seasons: SeasonLengths): Tonight | null {
  const xn = Math.min(seasons.christmas, 25);
  if (xn > 0 && date.m === 12 && date.d <= 25) {
    const first = 25 - xn + 1;
    if (date.d >= first) return { kind: "seasonal", season: "christmas", nightIndex: date.d - first };
  }
  const en = Math.min(seasons.easter, 8);
  if (en > 0) {
    const easter = easterSunday(date.y);
    const i = daysBetween(addDays(easter, -(en - 1)), date);
    if (i >= 0 && i < en) return { kind: "seasonal", season: "easter", nightIndex: i };
  }
  return null;
}

/**
 * @param journeyPosition 0-based position in the whole journey (normally the first night not yet completed)
 * @param journeyTrailLengths number of nights in each journey trail, in order
 */
export function tonight(date: DateOnly, journeyPosition: number, journeyTrailLengths: number[], seasons: SeasonLengths): Tonight {
  const s = seasonalNight(date, seasons);
  if (s) return s;
  const total = journeyTrailLengths.reduce((a, b) => a + b, 0);
  if (total === 0) throw new Error("No journey content published");
  const cycle = Math.floor(journeyPosition / total);
  let pos = journeyPosition % total;
  for (let t = 0; t < journeyTrailLengths.length; t++) {
    if (pos < journeyTrailLengths[t]) return { kind: "journey", trailIndex: t, nightIndex: pos, cycle };
    pos -= journeyTrailLengths[t];
  }
  throw new Error("unreachable");
}
