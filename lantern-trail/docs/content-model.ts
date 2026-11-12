/**
 * The Lantern Trail: content model.
 * Every devotional night in every age band and language is stored in this shape.
 * See CONTENT-GUIDE.md for the rules the text itself must follow.
 */

export type Lang = "en" | "af";
export type Band = "2-3" | "4-5" | "6-7" | "8-9" | "10-12";
export type Gender = "boy" | "girl";
export type Look = "adventure" | "starlight";
/** Friendship Compass directions: Talk, Listen, Trust, Love. */
export type Compass = "talk" | "listen" | "trust" | "love";
/** The Five Lights (CONTENT-GUIDE.md section 2). */
export type Light = "father" | "jesus" | "spirit" | "speaks" | "love-obey";

/** Text in every launch language. */
export type L10n = Record<Lang, string>;

/** A Bible reference stored once, rendered per language (book names and numbering differ). */
export interface ScriptureRef {
  /** USFM book code, e.g. "GEN", "ISA", "MAT". */
  book: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  /** Where the Afrikaans numbering differs (e.g. Isaiah 9:6 -> Jesaja 9:5). */
  af?: { chapter: number; verseStart?: number; verseEnd?: number };
}

export interface Verse {
  text: string;
  ref: ScriptureRef;
  /** "simple" = our child-friendly wording; "bsb" = quoted Berean Standard Bible. */
  wording: "simple" | "bsb";
}

/** A trail is one region on the Lantern map. Journey trails play in order; seasonal trails are inserted by date. */
export interface Trail {
  id: string;                 // "t01-makers-garden"
  kind: "journey" | "seasonal";
  season?: "christmas" | "easter";
  order: number;              // position in the journey (journey trails only)
  title: L10n;
  blurb: L10n;
  expeditions: Expedition[];
}

export interface Expedition {
  id: string;
  title: L10n;
  blurb: L10n;
  /** The expedition's memory ("Treasure") verse, per language and band group. */
  memoryVerse: Record<Lang, Verse>;
  nights: Night[];
}

/** One night. The Bible story, treasure and picture are shared by every band; the words are per band and language. */
export interface Night {
  id: string;                 // "t01-n001"
  kind: "story" | "campfire";
  story: ScriptureRef[];      // the Bible passage(s) this night is about
  lights: Light[];            // which of the Five Lights it serves
  treasure: { gem: L10n; trait: L10n };
  /** Scene code for the illustration renderer, e.g. "dawn garden ; 🦁70,165,44 🌳310,152,64". */
  scene: string;
  bands: Partial<Record<Band, Record<Lang, NightText>>>;
  review?: { reviewer: string; date: string; lang: Lang; band: Band }[];
}

/**
 * The words for one night in one band and language.
 * Text may contain personalisation tokens (see TOKENS below).
 * Optional fields are used by the bands listed in CONTENT-GUIDE.md section 4.
 */
export interface NightText {
  title: string;
  story: string[];            // paragraphs
  verse: Verse;
  passage?: Verse;            // 8–9 and 10–12: the real Bible passage to read
  lessons: string[];          // "Treasure found"
  questions: string[];
  deeper?: string;            // 6–7+: "Think deeper"
  fact?: string;              // 6–7+: "Did you know?"
  action?: string;            // 2–3: a body action or song
  listen?: string;            // 8–12: guided quiet "listen to God" moment
  prayer: string[];           // lines
  prayerStyle: "repeat" | "together" | "own";
  mission?: { compass: Compass; text: string };
  journal?: string;
  parentCheckIn?: string;     // 10–12: weekly question for the parent
  /** Campfire nights only. */
  campfire?: { intro: string; game: string };
}

/* ---------- Personalisation ---------- */

/** Tokens allowed in parent-facing and story text. Capitalised forms start a sentence. */
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
