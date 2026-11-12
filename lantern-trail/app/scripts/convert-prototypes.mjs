/**
 * One-off converter: turns the three finished prototype devotionals in ../prototypes into
 * content-model JSON in public/content. Kept so the conversion can be re-run and audited.
 *
 *   English, age 4–5   <- prototypes/english-boy-age5.html
 *   English, age 6–7   <- prototypes/starlight-girl-age7.html (same text + age-7 extras)
 *   Afrikaans, age 4–5 <- prototypes/afrikaans-boy-age5.html
 *
 * Expeditions 1–6 and 8 become Journey Trail 1; Expedition 7 becomes the Christmas trail.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const proto = path.resolve(here, "../../prototypes");
const out = path.resolve(here, "../public/content");

function load(file) {
  const html = fs.readFileSync(path.join(proto, file), "utf8");
  const js = html.split("<script>")[1].split("</script>")[0];
  const code = js.slice(js.indexOf("const EX="), js.indexOf("D.forEach("));
  return vm.runInNewContext(code + ";({EX,CP,D,X:typeof X==='undefined'?null:X})", {});
}
const en = load("english-boy-age5.html");
const girl = load("starlight-girl-age7.html");
const af = load("afrikaans-boy-age5.html");
if (en.D.length !== 56 || af.D.length !== 56 || girl.D.length !== 56) throw new Error("expected 56 nights in each prototype");

/* ---- text fixes for the new structure and the content guide; every fix must apply ---- */
const FIXES = {
  en: [
    ["way back on Day 3?", "right at the start of our trail?"],
    ["Remember Isaiah’s clue from Day 27?", "Remember Isaiah’s clue?"],
    ["Let him pick his three favourite treasures", "Let {obj} pick {poss} three favourite treasures"],
    ["You did it, explorer! Fifty-six nights on the Lantern Trail.", "You did it, explorer! You have walked the whole trail."],
    ["Obey the first time you are asked tomorrow, with no grumbling!", "Tomorrow, show God you love Him: say a happy ‘yes’ the first time you’re asked."],
  ],
  af: [
    ["heel terug op Dag 3?", "heel aan die begin van ons pad?"],
    ["Onthou jy Jesaja se leidraad van Dag 27?", "Onthou jy Jesaja se leidraad?"],
    ["Laat hom sy drie gunstelingskatte kies", "Laat {obj} {poss} drie gunstelingskatte kies"],
    ["Jy het dit gedoen, ontdekker! Ses-en-vyftig aande op die Lanternpad.", "Jy het dit gedoen, ontdekker! Jy het die hele pad gestap."],
    ["Luister môre die eerste keer as jy gevra word, sonder om te kla!", "Wys môre vir God jy is lief vir Hom: sê die eerste keer bly ‘ja’ as jy gevra word."],
  ],
};
const used = { en: new Set(), af: new Set() };
function fix(lang, s) {
  if (typeof s !== "string") return s;
  FIXES[lang].forEach(([a, b], i) => { if (s.includes(a)) { s = s.split(a).join(b); used[lang].add(i); } });
  return s;
}
const fixDeep = (lang, v) => Array.isArray(v) ? v.map(x => fixDeep(lang, x))
  : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fixDeep(lang, x)]))
  : fix(lang, v);
en.D = fixDeep("en", en.D); af.D = fixDeep("af", af.D);

const COMPASS = { T: "talk", L: "listen", R: "trust", V: "love" };
const verse = v => ({ text: v[0], refText: v[1], wording: "simple" });
// Shared scenes: the child in "God made me" (Day 2) follows the child's gender.
const scene = (i) => i === 1 ? en.D[i].sc.replace("🧒200,165,48", "{child}200,165,48")
  : i === 25 ? en.D[i].sc.replace("🧒305,168,36", "👧305,168,36") : en.D[i].sc;

function text(d, lang, band, extras) {
  if (d.c) {
    const t = {
      title: d.t, story: [d.intro], lessons: [], questions: d.q, prayer: d.p.split(" / "),
      prayerStyle: band === "6-7" ? "together" : "repeat", mission: { compass: COMPASS[d.m[0]], text: d.m[1] }, game: d.game,
    };
    if (band === "6-7") t.journal = "Draw your favourite treasure from this expedition, and write why it is special to you.";
    return t;
  }
  const t = {
    title: d.t, bibleStory: d.r, story: d.s, verse: verse(d.v), lessons: d.l, questions: d.q,
    prayer: d.p.split(" / "), prayerStyle: band === "6-7" ? "together" : "repeat",
    mission: { compass: COMPASS[d.m[0]], text: d.m[1] },
  };
  if (extras) { t.fact = extras[0]; t.deeper = extras[1]; t.journal = extras[2]; }
  return t;
}

function night(i, id) {
  const d = en.D[i], a = af.D[i], dayNo = i + 1;
  const n = {
    id, kind: d.c ? "campfire" : "story", scene: scene(i),
    bands: {
      "4-5": { en: text(d, "en", "4-5"), af: text(a, "af", "4-5") },
      "6-7": { en: text(d, "en", "6-7", girl.X[dayNo]) },
    },
  };
  if (d.xmas) n.special = "christmas-day";
  if (d.fin) n.special = "finale";
  if (!d.c) n.treasure = { gem: { en: d.g, af: a.g }, trait: { en: d.tr, af: a.tr } };
  return n;
}

function expedition(k, color, prefix, counter) {
  const e = en.EX[k], x = af.EX[k];
  const nights = [];
  for (let i = e.from - 1; i < e.to; i++) nights.push(night(i, `${prefix}-n${String(++counter.n).padStart(2, "0")}`));
  return {
    id: `${prefix}-e${color}`, color,
    title: { en: e.name, af: x.name }, blurb: { en: e.blurb, af: x.blurb },
    memoryVerse: { en: verse(e.v), af: verse(x.v) }, nights,
  };
}

const jc = { n: 0 }, xc = { n: 0 };
const journey = {
  id: "j01", kind: "journey", order: 1,
  title: { en: "Trail of the First Light", af: "Die Pad van die Eerste Lig" },
  blurb: {
    en: "From the garden where it all began to the empty tomb: meet the God who made you, rescues you and calls you His child.",
    af: "Van die tuin waar alles begin het tot by die leë graf: leer die God ken wat jou gemaak het, jou red en jou sy kind noem.",
  },
  expeditions: [0, 1, 2, 3, 4, 5, 7].map(k => expedition(k, k + 1, "j01", jc)),
};
const christmas = {
  id: "xmas", kind: "seasonal", season: "christmas", order: 0,
  title: { en: en.EX[6].name, af: af.EX[6].name }, blurb: { en: en.EX[6].blurb, af: af.EX[6].blurb },
  expeditions: [expedition(6, 7, "xmas", xc)],
};

FIXES.en.forEach((_, i) => { if (!used.en.has(i)) throw new Error("English fix not applied: " + FIXES.en[i][0]); });
FIXES.af.forEach((_, i) => { if (!used.af.has(i)) throw new Error("Afrikaans fix not applied: " + FIXES.af[i][0]); });

const count = t => t.expeditions.reduce((s, e) => s + e.nights.length, 0);
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "journey-01.json"), JSON.stringify(journey));
fs.writeFileSync(path.join(out, "christmas.json"), JSON.stringify(christmas));
fs.writeFileSync(path.join(out, "index.json"), JSON.stringify({
  version: "2026.11.1",
  trails: [
    { id: journey.id, kind: "journey", order: 1, file: "journey-01.json", nights: count(journey) },
    { id: christmas.id, kind: "seasonal", season: "christmas", order: 0, file: "christmas.json", nights: count(christmas) },
  ],
}, null, 2));
const left = JSON.stringify([journey, christmas]).match(/\b(Day|Dag) \d+/g);
console.log(`journey: ${count(journey)} nights, christmas: ${count(christmas)} nights; leftover day refs: ${left ? left.join(", ") : "none"}`);
