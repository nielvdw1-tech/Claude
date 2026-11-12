/**
 * The Lantern Trail: content model.
 * Every devotional night in every age band and language is stored in this shape.
 * See docs/CONTENT-GUIDE.md for the rules the text itself must follow.
 */

export type Lang = "en" | "af";
export const LANGS: Lang[] = ["en", "af"];
export type Band = "2-3" | "4-5" | "6-7" | "8-9" | "10-12";
export const BANDS: Band[] = ["2-3", "4-5", "6-7", "8-9", "10-12"];
export type Gender = "boy" | "girl";
export type Look = "adventure" | "starlight";
/** Friendship Compass directions: Talk, Listen, Trust, Love. */
export type Compass = "talk" | "listen" | "trust" | "love";
/** The Five Lights (CONTENT-GUIDE.md section 2). */
export type Light = "father" | "jesus" | "spirit" | "speaks" | "love-obey";

/** Text in every launch language. */
export type L10n = Record<Lang, string>;

/** A structured Bible reference (optional for now; used later for Bible look-up links). */
export interface ScriptureRef {
  /** USFM book code, e.g. "GEN", "ISA", "MAT". */
  book: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
}

export interface Verse {
  text: string;
  /** The reference as written in this language's Bible, e.g. "Jesaja 9:5". */
  refText: string;
  ref?: ScriptureRef;
  /** "simple" = our child-friendly wording; "bsb" = quoted Berean Standard Bible. */
  wording: "simple" | "bsb";
}

/** Lists every published trail. Served from /content/index.json. */
export interface ContentIndex {
  version: string;
  trails: { id: string; kind: Trail["kind"]; season?: Trail["season"]; order: number; file: string; nights: number }[];
}

/** A trail is one region on the Lantern map. Journey trails play in order; seasonal trails are inserted by date. */
export interface Trail {
  id: string;
  kind: "journey" | "seasonal";
  season?: "christmas" | "easter";
  order: number;
  title: L10n;
  blurb: L10n;
  expeditions: Expedition[];
}

export interface Expedition {
  id: string;
  /** Colour slot 1–8 used by both looks. */
  color: number;
  title: L10n;
  blurb: L10n;
  /** The expedition's memory ("Treasure") verse. */
  memoryVerse: Record<Lang, Verse>;
  nights: Night[];
}

/** One night. The Bible story, treasure and picture are shared by every band; the words are per band and language. */
export interface Night {
  id: string;
  kind: "story" | "campfire";
  special?: "christmas-day" | "finale";
  story?: ScriptureRef[];
  lights?: Light[];
  treasure?: { gem: L10n; trait: L10n };
  /** Scene code for the illustration renderer, e.g. "dawn garden ; 🦁70,165,44 🌳310,152,64". */
  scene: string;
  bands: Partial<Record<Band, Partial<Record<Lang, NightText>>>>;
  review?: { reviewer: string; date: string; lang: Lang; band: Band }[];
}

/**
 * The words for one night in one band and language.
 * Text may contain personalisation tokens (see TOKENS below).
 */
export interface NightText {
  title: string;
  bibleStory?: string;        // display, e.g. "Genesis 1"
  story: string[];            // paragraphs (campfire: the intro)
  verse?: Verse;              // story nights; campfires use the expedition memory verse
  passage?: Verse;            // reserved: a quoted passage (BSB), if we ever print one
  readPassage?: string;       // 8–9 and 10–12: passage to read in the child's own Bible, e.g. "Genesis 1:1–5"
  lessons: string[];
  questions: string[];
  deeper?: string;            // 6–7+: "Think deeper"
  fact?: string;              // 6–7+: "Did you know?"
  action?: string;            // 2–3: a body action or song
  listen?: string;            // 8–12: guided quiet "listen to God" moment
  prayer: string[];
  prayerStyle: "repeat" | "together" | "own";
  mission?: { compass: Compass; text: string };
  journal?: string;
  parentCheckIn?: string;     // 10–12: weekly question for the parent
  game?: string;              // campfire nights
}

/* ---------- Personalisation ---------- */

/** Tokens allowed in text. Capitalised forms start a sentence. */
export const TOKENS = ["{name}", "{subj}", "{Subj}", "{obj}", "{Obj}", "{poss}", "{Poss}"] as const;

const PRONOUNS: Record<Lang, Record<Gender, { subj: string; obj: string; poss: string }>> = {
  en: { boy: { subj: "he", obj: "him", poss: "his" }, girl: { subj: "she", obj: "her", poss: "her" } },
  af: { boy: { subj: "hy", obj: "hom", poss: "sy" }, girl: { subj: "sy", obj: "haar", poss: "haar" } },
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Replace personalisation tokens with the child's name and pronouns. */
export function personalise(text: string, child: { name: string; gender: Gender }, lang: Lang): string {
  const p = PRONOUNS[lang][child.gender];
  return text
    .replaceAll("{name}", child.name)
    .replaceAll("{subj}", p.subj).replaceAll("{Subj}", cap(p.subj))
    .replaceAll("{obj}", p.obj).replaceAll("{Obj}", cap(p.obj))
    .replaceAll("{poss}", p.poss).replaceAll("{Poss}", cap(p.poss));
}

/** Age in years -> band. */
export function bandForAge(age: number): Band {
  if (age <= 3) return "2-3";
  if (age <= 5) return "4-5";
  if (age <= 7) return "6-7";
  if (age <= 9) return "8-9";
  return "10-12";
}

/** Bands to try, nearest first, when a night has no text for the child's band yet. */
const FALLBACK: Record<Band, Band[]> = {
  "2-3": ["2-3", "4-5", "6-7"],
  "4-5": ["4-5", "6-7", "2-3"],
  "6-7": ["6-7", "4-5", "8-9"],
  "8-9": ["8-9", "6-7", "10-12", "4-5"],
  "10-12": ["10-12", "8-9", "6-7", "4-5"],
};

/** Pick the best available text for a night: the child's band and language first, then the nearest band, then the other language. */
export function pickText(night: Night, band: Band, lang: Lang): { text: NightText; band: Band; lang: Lang } | null {
  for (const l of [lang, ...LANGS.filter(x => x !== lang)])
    for (const b of FALLBACK[band]) {
      const t = night.bands[b]?.[l];
      if (t) return { text: t, band: b, lang: l };
    }
  return null;
}
