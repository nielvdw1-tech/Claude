import { useState } from "react";
import { useApp } from "../ctx";
import { fill, STRINGS } from "../lib/i18n";
import type { Gender, Lang, Look } from "../lib/model";
import { bandForAge } from "../lib/model";
import { MAX_CHILDREN, newId, type Child, type Family } from "../lib/store";

const AGES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function ChildForm({ lang, initial, onSave, onCancel, submitLabel }: {
  lang: Lang; initial?: Child; onSave: (c: Child) => void; onCancel?: () => void; submitLabel: string;
}) {
  const s = STRINGS[lang];
  const [name, setName] = useState(initial?.name ?? "");
  const [age, setAge] = useState(initial?.age ?? 5);
  const [gender, setGender] = useState<Gender | null>(initial?.gender ?? null);
  const [look, setLook] = useState<Look | null>(initial?.look ?? null);
  const suggested: Look | null = gender === "girl" ? "starlight" : gender === "boy" ? "adventure" : null;
  const chosenLook = look ?? suggested;
  const ok = name.trim().length > 0 && gender && chosenLook;
  return (
    <form className="child-form" onSubmit={e => { e.preventDefault(); if (ok) onSave({ id: initial?.id ?? newId(), name: name.trim(), age, gender: gender!, look: chosenLook! }); }}>
      <div className="field"><label htmlFor="cf-name">{s.obName}</label>
        <input id="cf-name" type="text" autoComplete="given-name" maxLength={30} value={name} onChange={e => setName(e.target.value)} required /></div>
      <div className="field"><label htmlFor="cf-age">{s.obAge}</label>
        <select id="cf-age" value={age} onChange={e => setAge(+e.target.value)}>
          {AGES.map(a => <option key={a} value={a}>{fill(s.ageYears, { n: a })} · {fill(s.ageBand, { band: bandForAge(a) })}</option>)}
        </select></div>
      <fieldset className="field"><legend>{s.obGender}</legend>
        <div className="choices">{(["boy", "girl"] as const).map(g =>
          <label key={g} className={`choice${gender === g ? " on" : ""}`}><input type="radio" name="cf-gender" checked={gender === g} onChange={() => setGender(g)} />{g === "boy" ? s.boy : s.girl}</label>)}</div>
      </fieldset>
      <fieldset className="field"><legend>{s.obLook}</legend>
        <div className="choices">{(["adventure", "starlight"] as const).map(l =>
          <label key={l} className={`choice look-${l}${chosenLook === l ? " on" : ""}`}><input type="radio" name="cf-look" checked={chosenLook === l} onChange={() => setLook(l)} />
            <span className="swatch" aria-hidden="true" />{l === "adventure" ? s.adventure : s.starlight}{suggested === l && look === null ? <small> ({s.suggested})</small> : null}</label>)}</div>
      </fieldset>
      <div className="form-row">
        <button className="btn" type="submit" disabled={!ok}>{submitLabel}</button>
        {onCancel && <button className="btn ghost" type="button" onClick={onCancel}>{s.famCancel}</button>}
      </div>
    </form>
  );
}

export function Onboarding({ onDone }: { onDone: (f: Family) => void }) {
  const [lang, setLang] = useState<Lang>(() => (navigator.language || "").toLowerCase().startsWith("af") ? "af" : "en");
  const s = STRINGS[lang];
  return (
    <main className="onboard gutter">
      <div className="inner">
        <svg width="56" height="56" viewBox="0 0 26 26" aria-hidden="true" className="ob-lantern"><rect x="9" y="2" width="8" height="3" rx="1.5" fill="currentColor" /><path d="M7 7h12l-1 14H8z" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="13" cy="14" r="3.5" fill="#FFBC52" /><rect x="6" y="21" width="14" height="3" rx="1.5" fill="currentColor" /></svg>
        <h1>{s.obTitle}</h1>
        <p className="lede">{s.obLede}</p>
        <div className="ob-card">
          <fieldset className="field"><legend>{s.obLang}</legend>
            <div className="choices">{(["en", "af"] as const).map(l =>
              <label key={l} className={`choice${lang === l ? " on" : ""}`}><input type="radio" name="ob-lang" checked={lang === l} onChange={() => setLang(l)} />{l === "en" ? "English" : "Afrikaans"}</label>)}</div>
          </fieldset>
          <ChildForm lang={lang} submitLabel={s.obStart} onSave={c => onDone({ lang, children: [c], activeChildId: c.id, completed: [], seasonalCompleted: [], cycle: 0 })} />
        </div>
        <p className="tip">{s.obPrivacy}</p>
      </div>
    </main>
  );
}

export function FamilyPage() {
  const { s, lang, family, setFamily } = useApp();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const save = (c: Child) => {
    const exists = family.children.some(x => x.id === c.id);
    setFamily({ ...family, children: exists ? family.children.map(x => x.id === c.id ? c : x) : [...family.children, c], activeChildId: exists ? family.activeChildId : c.id });
    setEditing(null);
  };
  const remove = (id: string) => {
    const children = family.children.filter(x => x.id !== id);
    setFamily({ ...family, children, activeChildId: family.activeChildId === id ? children[0].id : family.activeChildId });
  };
  return (
    <section className="page gutter"><div className="inner prose">
      <header className="day-head"><h1>{s.famTitle}</h1></header>
      <p>{fill(s.famLede, { max: MAX_CHILDREN })}</p>
      <fieldset className="field"><legend>{s.obLang}</legend>
        <div className="choices">{(["en", "af"] as const).map(l =>
          <label key={l} className={`choice${lang === l ? " on" : ""}`}><input type="radio" name="fam-lang" checked={lang === l} onChange={() => setFamily({ ...family, lang: l })} />{l === "en" ? "English" : "Afrikaans"}</label>)}</div>
      </fieldset>
      <div className="kids">
        {family.children.map(c => editing === c.id
          ? <div className="kid editing" key={c.id}><ChildForm lang={lang} initial={c} submitLabel={s.famSave} onSave={save} onCancel={() => setEditing(null)} /></div>
          : <div className={`kid${family.activeChildId === c.id ? " active" : ""}`} key={c.id}>
              <span className={`kid-dot look-${c.look}`} aria-hidden="true" />
              <div className="kid-info"><b>{c.name}</b><small>{fill(s.ageYears, { n: c.age })} · {fill(s.ageBand, { band: bandForAge(c.age) })} · {c.gender === "boy" ? s.boy : s.girl} · {c.look === "adventure" ? s.adventure : s.starlight}</small></div>
              <div className="kid-actions">
                {family.activeChildId === c.id
                  ? <span className="pill">{s.famActive}</span>
                  : <button type="button" className="btn small" onClick={() => setFamily({ ...family, activeChildId: c.id })}>{s.famActive} {c.name}</button>}
                <button type="button" className="btn small ghost" onClick={() => setEditing(c.id)}>{s.famEdit}</button>
                {family.children.length > 1 && <button type="button" className="btn small ghost" onClick={() => remove(c.id)}>{s.famRemove}</button>}
              </div>
            </div>)}
      </div>
      {editing === "new"
        ? <div className="kid editing"><ChildForm lang={lang} submitLabel={s.famSave} onSave={save} onCancel={() => setEditing(null)} /></div>
        : family.children.length < MAX_CHILDREN && <p><button type="button" className="btn" onClick={() => setEditing("new")}>{s.famAdd}</button></p>}
    </div></section>
  );
}
