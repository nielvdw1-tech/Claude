import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Ctx, type AppCtx } from "./ctx";
import { loadLibrary, type Library, type NightRef } from "./lib/content";
import { STRINGS } from "./lib/i18n";
import { personalise } from "./lib/model";
import { tonight as scheduleTonight, today, type DateOnly } from "./lib/schedule";
import { activeChild, childBand, loadFamily, saveFamily, type Family } from "./lib/store";
import { Home } from "./components/Home";
import { NightView } from "./components/NightView";
import { FamilyPage, Onboarding } from "./components/Family";
import { CompassPage, GuidePage } from "./components/Pages";

/** Hash routes: "" / "map", "night-<id>", "guide", "compass", "family". */
function useRoute(): string {
  const [h, setH] = useState(() => location.hash.slice(1));
  useEffect(() => {
    const on = () => { setH(location.hash.slice(1)); window.scrollTo(0, 0); };
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  return h;
}

/** Allow ?date=2026-12-20 to preview another day (for testing seasonal trails). */
function currentDate(): DateOnly {
  const q = new URLSearchParams(location.search).get("date");
  const m = q?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? { y: +m[1], m: +m[2], d: +m[3] } : today();
}

export function App() {
  const [family, setFamilyState] = useState<Family | null>(() => loadFamily());
  const [lib, setLib] = useState<Library | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<number>();
  const route = useRoute();
  const date = useMemo(currentDate, []);

  useEffect(() => { loadLibrary().then(setLib).catch(e => setError(String(e.message ?? e))); }, []);

  const setFamily = useCallback((f: Family) => { setFamilyState(f); saveFamily(f); }, []);
  const toast = useCallback((m: string) => {
    setToastMsg(m); clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 2600);
  }, []);

  const child = family ? activeChild(family) : null;
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.look = child?.look ?? "adventure";
    root.lang = family?.lang === "af" ? "af" : "en";
    document.title = STRINGS[family?.lang ?? "en"].appName;
  }, [child?.look, family?.lang]);

  const ctx = useMemo<AppCtx | null>(() => {
    if (!family || !lib || !child) return null;
    const lang = family.lang, s = STRINGS[lang];
    const isSeasonal = (r: NightRef) => r.journeyIndex === undefined;
    const seasonKey = (r: NightRef) => `${date.y}:${r.night.id}`;
    const isDone = (r: NightRef) => isSeasonal(r) ? family.seasonalCompleted.includes(seasonKey(r)) : family.completed.includes(r.night.id);
    const toggleDone = (r: NightRef) => {
      const on = !isDone(r);
      const flip = (list: string[], k: string) => on ? [...list, k] : list.filter(x => x !== k);
      setFamily(isSeasonal(r)
        ? { ...family, seasonalCompleted: flip(family.seasonalCompleted, seasonKey(r)) }
        : { ...family, completed: flip(family.completed, r.night.id) });
      return on;
    };
    const firstOpen = lib.journeyNights.findIndex(r => !family.completed.includes(r.night.id));
    let tonight: NightRef | null = null;
    const t = scheduleTonight(date, firstOpen === -1 ? 0 : firstOpen, lib.journey.map(tr => tr.expeditions.reduce((a, e) => a + e.nights.length, 0)),
      { christmas: lib.christmasNights.length, easter: lib.easterNights.length });
    if (t.kind === "seasonal") tonight = (t.season === "christmas" ? lib.christmasNights : lib.easterNights)[t.nightIndex] ?? null;
    else if (firstOpen !== -1) tonight = lib.journeyNights[firstOpen];
    return {
      family, setFamily, lib, child, band: childBand(child), lang, s, date, tonight, isDone, toggleDone, toast,
      p: (text: string) => personalise(text, child, lang),
    };
  }, [family, lib, child, date, setFamily, toast]);

  if (error) return <main className="page gutter"><div className="inner"><h1>Something went wrong</h1><p>{error}</p><p>Please check your internet connection and reload.</p></div></main>;
  if (!family) return <Onboarding onDone={setFamily} />;
  if (!ctx) return <main className="loading" aria-busy="true"><span className="lantern-glow" /></main>;

  let view;
  if (route.startsWith("night-")) view = <NightView id={route.slice(6)} />;
  else if (route === "guide") view = <GuidePage />;
  else if (route === "compass") view = <CompassPage />;
  else if (route === "family") view = <FamilyPage />;
  else view = <Home />;
  const tab = route.startsWith("night-") ? "" : (route || "map");

  return (
    <Ctx.Provider value={ctx}>
      <header className="bar gutter">
        <div className="inner">
          <a className="brand" href="#map">
            <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><rect x="9" y="2" width="8" height="3" rx="1.5" fill="currentColor" /><path d="M7 7h12l-1 14H8z" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="13" cy="14" r="3.5" fill="#FFBC52" /><rect x="6" y="21" width="14" height="3" rx="1.5" fill="currentColor" /></svg>
            {ctx.s.appName}
          </a>
          <nav className="tabs" aria-label="Sections">
            {([["map", ctx.s.navMap], ["guide", ctx.s.navGuide], ["compass", ctx.s.navCompass], ["family", ctx.s.navFamily]] as const).map(([k, label]) =>
              <a key={k} href={`#${k}`} aria-current={tab === k ? "page" : undefined}>{label}</a>)}
          </nav>
        </div>
      </header>
      <main>{view}</main>
      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
    </Ctx.Provider>
  );
}
