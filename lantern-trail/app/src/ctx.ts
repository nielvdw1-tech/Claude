import { createContext, useContext } from "react";
import type { Library, NightRef } from "./lib/content";
import type { Family, Child } from "./lib/store";
import type { Band, Lang } from "./lib/model";
import type { Strings } from "./lib/i18n";
import type { DateOnly } from "./lib/schedule";

export interface AppCtx {
  family: Family;
  setFamily: (f: Family) => void;
  lib: Library;
  child: Child;
  band: Band;
  lang: Lang;
  s: Strings;
  /** Personalise a string for the active child and language. */
  p: (text: string) => string;
  date: DateOnly;
  tonight: NightRef | null;
  isDone: (r: NightRef) => boolean;
  toggleDone: (r: NightRef) => boolean;
  toast: (msg: string) => void;
}

export const Ctx = createContext<AppCtx | null>(null);
export function useApp(): AppCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("App context missing");
  return c;
}

/** Render trusted, app-generated SVG strings. */
export const svg = (html: string) => ({ dangerouslySetInnerHTML: { __html: html } });
