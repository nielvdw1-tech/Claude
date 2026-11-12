import { describe, expect, it } from "vitest";
import { easterSunday, seasonalNight, tonight } from "./schedule";
import { bandForAge, personalise, pickText, type Night } from "./model";

const full = { christmas: 25, easter: 8 };

describe("schedule", () => {
  it("computes Easter Sunday", () => {
    expect(easterSunday(2024)).toEqual({ y: 2024, m: 3, d: 31 });
    expect(easterSunday(2025)).toEqual({ y: 2025, m: 4, d: 20 });
    expect(easterSunday(2026)).toEqual({ y: 2026, m: 4, d: 5 });
    expect(easterSunday(2027)).toEqual({ y: 2027, m: 3, d: 28 });
  });
  it("runs a full Christmas trail 1–25 December", () => {
    expect(seasonalNight({ y: 2026, m: 12, d: 1 }, full)).toEqual({ kind: "seasonal", season: "christmas", nightIndex: 0 });
    expect(seasonalNight({ y: 2026, m: 12, d: 25 }, full)).toEqual({ kind: "seasonal", season: "christmas", nightIndex: 24 });
    expect(seasonalNight({ y: 2026, m: 12, d: 26 }, full)).toBeNull();
  });
  it("ends a short Christmas trail on Christmas Day", () => {
    const s = { christmas: 8, easter: 0 };
    expect(seasonalNight({ y: 2026, m: 12, d: 17 }, s)).toBeNull();
    expect(seasonalNight({ y: 2026, m: 12, d: 18 }, s)).toEqual({ kind: "seasonal", season: "christmas", nightIndex: 0 });
    expect(seasonalNight({ y: 2026, m: 12, d: 25 }, s)).toEqual({ kind: "seasonal", season: "christmas", nightIndex: 7 });
  });
  it("runs Easter from Palm Sunday, and skips an unpublished season", () => {
    expect(seasonalNight({ y: 2026, m: 3, d: 29 }, full)).toEqual({ kind: "seasonal", season: "easter", nightIndex: 0 });
    expect(seasonalNight({ y: 2026, m: 4, d: 5 }, full)).toEqual({ kind: "seasonal", season: "easter", nightIndex: 7 });
    expect(seasonalNight({ y: 2026, m: 4, d: 6 }, full)).toBeNull();
    expect(seasonalNight({ y: 2026, m: 4, d: 5 }, { christmas: 25, easter: 0 })).toBeNull();
  });
  it("walks the journey and cycles", () => {
    const L = [42, 48, 40];
    const d = { y: 2026, m: 6, d: 1 };
    expect(tonight(d, 0, L, full)).toEqual({ kind: "journey", trailIndex: 0, nightIndex: 0, cycle: 0 });
    expect(tonight(d, 42, L, full)).toEqual({ kind: "journey", trailIndex: 1, nightIndex: 0, cycle: 0 });
    expect(tonight(d, 131, L, full)).toEqual({ kind: "journey", trailIndex: 0, nightIndex: 1, cycle: 1 });
  });
});

describe("personalisation", () => {
  it("fills pronouns in English and Afrikaans", () => {
    expect(personalise("Let {obj} pick {poss} treasure. {Subj} can!", { name: "Mia", gender: "girl" }, "en")).toBe("Let her pick her treasure. She can!");
    expect(personalise("{Subj} is {name}, gee {obj} {poss} skat.", { name: "Ben", gender: "boy" }, "af")).toBe("Hy is Ben, gee hom sy skat.");
  });
  it("maps ages to bands", () => {
    expect([2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map(bandForAge)).toEqual(["2-3", "2-3", "4-5", "4-5", "6-7", "6-7", "8-9", "8-9", "10-12", "10-12"]);
  });
  it("falls back to the nearest band, then the other language", () => {
    const t = (title: string) => ({ title, story: [], lessons: [], questions: [], prayer: [], prayerStyle: "repeat" as const });
    const n: Night = { id: "x", kind: "story", scene: "", bands: { "4-5": { en: t("en45"), af: t("af45") }, "6-7": { en: t("en67") } } };
    expect(pickText(n, "6-7", "en")?.text.title).toBe("en67");
    expect(pickText(n, "6-7", "af")?.text.title).toBe("af45");
    expect(pickText(n, "10-12", "en")?.text.title).toBe("en67");
    expect(pickText(n, "2-3", "af")?.band).toBe("4-5");
  });
});
