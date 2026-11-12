/* Loads published trails. Today they are static files in /content; later the same shape comes from the server. */
import type { ContentIndex, Expedition, Night, Trail } from "./model";

export interface NightRef {
  night: Night;
  trail: Trail;
  expedition: Expedition;
  /** 1-based position within its trail. */
  number: number;
  /** 0-based position in the whole journey (journey nights only). */
  journeyIndex?: number;
}

export interface Library {
  version: string;
  journey: Trail[];
  christmas?: Trail;
  easter?: Trail;
  /** Every journey night in order. */
  journeyNights: NightRef[];
  byId: Map<string, NightRef>;
  christmasNights: NightRef[];
  easterNights: NightRef[];
}

const base = new URL("content/", document.baseURI);

async function getJSON<T>(file: string): Promise<T> {
  const res = await fetch(new URL(file, base));
  if (!res.ok) throw new Error(`Could not load ${file} (${res.status})`);
  return res.json() as Promise<T>;
}

function flatten(trail: Trail, startIndex?: number): NightRef[] {
  const out: NightRef[] = []; let n = 0;
  for (const expedition of trail.expeditions)
    for (const night of expedition.nights) {
      n++;
      out.push({ night, trail, expedition, number: n, journeyIndex: startIndex === undefined ? undefined : startIndex + n - 1 });
    }
  return out;
}

export async function loadLibrary(): Promise<Library> {
  const index = await getJSON<ContentIndex>("index.json");
  const trails = await Promise.all(index.trails.map(t => getJSON<Trail>(t.file)));
  const journey = trails.filter(t => t.kind === "journey").sort((a, b) => a.order - b.order);
  const christmas = trails.find(t => t.season === "christmas");
  const easter = trails.find(t => t.season === "easter");
  const journeyNights: NightRef[] = [];
  journey.forEach(t => journeyNights.push(...flatten(t, journeyNights.length)));
  const christmasNights = christmas ? flatten(christmas) : [];
  const easterNights = easter ? flatten(easter) : [];
  const byId = new Map<string, NightRef>();
  [...journeyNights, ...christmasNights, ...easterNights].forEach(r => byId.set(r.night.id, r));
  return { version: index.version, journey, christmas, easter, journeyNights, byId, christmasNights, easterNights };
}
