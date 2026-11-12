/* Family profile and progress, kept on this device for now (step 3 moves it to accounts).
   Every read and write is wrapped: storage can be unavailable (private mode, blocked site data). */
import type { Band, Gender, Lang, Look } from "./model";
import { bandForAge } from "./model";

export const MAX_CHILDREN = 4;

export interface Child { id: string; name: string; age: number; gender: Gender; look: Look }
export interface Family {
  lang: Lang;
  children: Child[];
  activeChildId: string;
  /** Night ids the family has completed in the current journey cycle (journey is shared by siblings). */
  completed: string[];
  /** Seasonal night ids completed, kept per year, e.g. "2026:xmas-n03". */
  seasonalCompleted: string[];
  cycle: number;
}

const KEY = "lantern-trail:family:v1";

export function loadFamily(): Family | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const f = JSON.parse(raw) as Family;
    if (!f.children?.length) return null;
    return { ...f, seasonalCompleted: f.seasonalCompleted ?? [], cycle: f.cycle ?? 0, completed: f.completed ?? [] };
  } catch { return null; }
}

export function saveFamily(f: Family): void {
  try { localStorage.setItem(KEY, JSON.stringify(f)); } catch { /* storage unavailable: keep working in memory */ }
}

export const newId = () => Math.random().toString(36).slice(2, 10);
export const activeChild = (f: Family): Child => f.children.find(c => c.id === f.activeChildId) ?? f.children[0];
export const childBand = (c: Child): Band => bandForAge(c.age);
