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
import afExtras from "./af-67-extras.mjs";

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
// The age-7 extras were first written for a girl; make them fit every child.
girl.X[12][1] = girl.X[12][1].replace("girls your age", "children your age");
girl.X[55][1] = girl.X[55][1].replace("a seven-year-old", "someone your age");
if (/girls your age|seven-year-old/.test(JSON.stringify(girl.X))) throw new Error("gendered or age-specific extra left");
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
    if (band === "6-7") t.journal = lang === "af"
      ? "Teken jou gunstelingskat van hierdie ekspedisie, en skryf hoekom dit vir jou spesiaal is."
      : "Draw your favourite treasure from this expedition, and write why it is special to you.";
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
      "6-7": { en: text(d, "en", "6-7", girl.X[dayNo]), af: text(a, "af", "6-7", afExtras[dayNo]) },
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

/* ---- merge hand-written band content from content-src/*.mjs ---- */
const srcDir = path.resolve(here, "../content-src");
// Native trails (Trail 2 onward) are defined in content-src/trails/*.mjs: structure, scenes and treasures.
const trailDir = path.join(srcDir, "trails");
const native = [];
for (const f of fs.existsSync(trailDir) ? fs.readdirSync(trailDir).filter(f => f.endsWith(".mjs")).sort() : []) {
  const t = (await import(path.join(trailDir, f))).default;
  t.expeditions.forEach(e => e.nights.forEach(n => { n.bands ??= {}; }));
  native.push(t);
}
const allNights = new Map([journey, christmas, ...native].flatMap(t => t.expeditions.flatMap(e => e.nights)).map(n => [n.id, n]));
const CAMP_JOURNAL = {
  en: "Draw your favourite treasure from this expedition, and write why it is special to you.",
  af: "Teken jou gunstelingskat van hierdie ekspedisie, en skryf hoekom dit vir jou spesiaal is.",
};
/** Ages 6–7 reuse the 4–5 story with extras: x67 = [did you know, think deeper, journal]. */
function derive67(t, lang, kind) {
  const { x67, ...base } = t;
  const out = { ...base, prayerStyle: "together" };
  if (kind === "story") {
    if (!x67 || x67.length !== 3) throw new Error(`missing x67 extras for 6-7 (${lang}, ${t.title})`);
    [out.fact, out.deeper, out.journal] = x67;
  } else out.journal = (x67 && x67[2]) || CAMP_JOURNAL[lang];
  return { base, out };
}
let merged = 0;
// Quality gate for hand-written band content (docs/CONTENT-GUIDE.md section 4).
const WORDS = { "2-3": [25, 140], "4-5": [150, 460], "8-9": [250, 650], "10-12": [300, 750] };
function check(f, id, band, lang, t, kind) {
  const where = `${f} ${id} ${band}/${lang}`;
  const need = ["title", "story", "lessons", "questions", "prayer", "prayerStyle"];
  if (kind === "story") need.push("verse");
  if (kind === "story" && band === "2-3") need.push("action");
  if (band === "8-9" || band === "10-12") need.push("mission", "journal", ...(kind === "story" ? ["readPassage", "listen"] : []));
  if (band === "4-5") need.push("mission", ...(kind === "campfire" ? ["game"] : []));
  if (kind === "story" && band === "4-5" && (t.lessons.length !== 3 || t.questions.length < 2)) throw new Error(`${where}: 4-5 needs 3 lessons and 2+ questions`);
  for (const k of need) if (t[k] === undefined || t[k] === "") throw new Error(`${where}: missing ${k}`);
  if (kind === "campfire" && band === "10-12" && !t.parentCheckIn) throw new Error(`${where}: 10-12 campfire needs parentCheckIn`);
  if (kind === "story" && band === "2-3" && t.lessons.length !== 1) throw new Error(`${where}: 2-3 has exactly one truth`);
  if (kind === "story" && (band === "8-9" || band === "10-12") && t.lessons.length !== 3) throw new Error(`${where}: needs 3 lessons`);
  const words = t.story.join(" ").split(/\s+/).length;
  const [lo, hi] = WORDS[band] ?? [0, 1e9];
  if (kind === "story" && (words < lo || words > hi)) throw new Error(`${where}: story is ${words} words, expected ${lo}-${hi}`);
  if (/\b(Day|Dag) \d+/.test(JSON.stringify(t))) throw new Error(`${where}: refers to a day number`);
}
for (const f of fs.existsSync(srcDir) ? fs.readdirSync(srcDir).filter(f => f.endsWith(".mjs") && fs.statSync(path.join(srcDir, f)).isFile()).sort() : []) {
  const mod = (await import(path.join(srcDir, f))).default;
  for (const [id, bands] of Object.entries(mod)) {
    const n = allNights.get(id);
    if (!n) throw new Error(`${f}: unknown night ${id}`);
    for (const [band, langs] of Object.entries(bands))
      for (const [lang, t] of Object.entries(langs)) {
        if (band === "4-5" && !bands["6-7"]) {
          const { base, out: t67 } = derive67(t, lang, n.kind);
          check(f, id, "4-5", lang, base, n.kind); (n.bands["4-5"] ??= {})[lang] = base;
          check(f, id, "6-7", lang, t67, n.kind); (n.bands["6-7"] ??= {})[lang] = t67; merged += 2;
          continue;
        }
        check(f, id, band, lang, t, n.kind); (n.bands[band] ??= {})[lang] = t; merged++;
      }
    for (const band of Object.keys(bands))
      for (const lang of ["en", "af"]) if (!bands[band][lang]) throw new Error(`${f} ${id} ${band}: missing ${lang}`);
  }
}
console.log(`merged ${merged} night texts from content-src`);

FIXES.en.forEach((_, i) => { if (!used.en.has(i)) throw new Error("English fix not applied: " + FIXES.en[i][0]); });
FIXES.af.forEach((_, i) => { if (!used.af.has(i)) throw new Error("Afrikaans fix not applied: " + FIXES.af[i][0]); });

const count = t => t.expeditions.reduce((s, e) => s + e.nights.length, 0);
const isComplete = t => t.expeditions.every(e => e.nights.every(n => ["2-3", "4-5", "6-7", "8-9", "10-12"].every(b => n.bands[b]?.en && n.bands[b]?.af)));
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "journey-01.json"), JSON.stringify(journey));
fs.writeFileSync(path.join(out, "christmas.json"), JSON.stringify(christmas));
fs.writeFileSync(path.join(out, "index.json"), JSON.stringify({
  version: "2026.11.1",
  trails: [
    { id: journey.id, kind: "journey", order: 1, file: "journey-01.json", nights: count(journey) },
    { id: christmas.id, kind: "seasonal", season: "christmas", order: 0, file: "christmas.json", nights: count(christmas) },
    // A native trail is published only when every night has every band in both languages (or with DRAFT=1 for testing).
    ...native.filter(t => process.env.DRAFT === "1" || isComplete(t))
      .map(t => ({ id: t.id, kind: "journey", order: t.order, file: `journey-${String(t.order).padStart(2, "0")}.json`, nights: count(t) })),
  ],
}, null, 2));
for (const t of native) {
  fs.writeFileSync(path.join(out, `journey-${String(t.order).padStart(2, "0")}.json`), JSON.stringify(t));
  const missing = {};
  t.expeditions.forEach(e => e.nights.forEach(n => ["2-3", "4-5", "6-7", "8-9", "10-12"].forEach(b => ["en", "af"].forEach(l => {
    if (!n.bands[b]?.[l]) { const k = `${b}/${l}`; missing[k] = (missing[k] || 0) + 1; }
  }))));
  const total = count(t);
  console.log(`${t.id}: ${total} nights; ${isComplete(t) ? "complete, published" : `NOT published yet (DRAFT=1 to preview); missing texts: ${JSON.stringify(missing)}`}`);
}
const left = JSON.stringify([journey, christmas]).match(/\b(Day|Dag) \d+/g);
console.log(`journey: ${count(journey)} nights, christmas: ${count(christmas)} nights; leftover day refs: ${left ? left.join(", ") : "none"}`);
