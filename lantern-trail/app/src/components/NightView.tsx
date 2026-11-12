import { useState } from "react";
import { svg, useApp } from "../ctx";
import { compassMini, gem, scene } from "../lib/art";
import { fill } from "../lib/i18n";
import { pickText, type Verse } from "../lib/model";

function Sign({ n, children }: { n: string | number; children: string }) {
  return <h2 className="sign"><b>{n}</b>{children}</h2>;
}
function Bubble({ v }: { v: Verse }) {
  return <blockquote className="bubble"><q>{v.text}</q><cite>{v.refText}</cite></blockquote>;
}
function Prayer({ lines, own }: { lines: string[]; own?: string }) {
  const { p } = useApp();
  return <div className="prayer">{lines.map((l, i) => <span className="line" key={i}>{p(l)}</span>)}{own && <p className="own">{p(own)}</p>}</div>;
}

function Certificate() {
  const { s, child } = useApp();
  const [name, setName] = useState(child.name);
  return (
    <div className="cert">
      <span className="eyebrow">{s.appName}</span><h3>{s.certHeading}</h3><span className="eyebrow">{s.certSub}</span>
      <span className="nm">{name || " "}</span><p>{s.certBody}</p>
      <div className="row"><label htmlFor="cert-name">{s.obName}</label><input id="cert-name" type="text" maxLength={30} value={name} onChange={e => setName(e.target.value)} /></div>
      <p className="tip">{s.certTip}</p>
    </div>
  );
}

export function NightView({ id }: { id: string }) {
  const app = useApp();
  const { s, lang, band, lib, p, child, isDone, toggleDone, toast } = app;
  const r = lib.byId.get(id);
  if (!r) return <section className="page gutter"><div className="inner"><a href="#map">{s.backMap}</a></div></section>;
  const picked = pickText(r.night, band, lang);
  if (!picked) return null;
  const { text: t } = picked, n = r.night, e = r.expedition, ec = `var(--ex${e.color})`;
  const list = r.journeyIndex === undefined ? (r.trail.season === "easter" ? lib.easterNights : lib.christmasNights) : lib.journeyNights;
  const i = list.findIndex(x => x.night.id === id), prev = list[i - 1], next = list[i + 1];
  const older = band !== "2-3" && band !== "4-5";           // 6+ read and look things up themselves
  const textBand = picked.band, together = t.prayerStyle !== "repeat";
  const done = isDone(r);
  const label = r.journeyIndex === undefined ? fill(s.christmasNight, { n: r.number }) : fill(s.night, { n: r.journeyIndex + 1 });
  const exNo = r.trail.expeditions.indexOf(e) + 1;
  const pn = (
    <span className="pn">
      {prev && <a href={`#night-${prev.night.id}`}>{s.prev}</a>}
      {next ? <a href={`#night-${next.night.id}`}>{s.next}</a> : <a href="#map">{s.navMap}</a>}
    </span>
  );
  const collect = () => {
    const on = toggleDone(r);
    if (on) toast(n.kind === "campfire" ? s.toastCamp : fill(s.toastFound, { trait: n.treasure?.trait[lang] ?? "" }));
  };
  const notes: string[] = [];
  if (textBand !== band) notes.push(fill(s.fallbackBand, { band, band2: textBand }));
  if (picked.lang !== lang) notes.push(s.fallbackLang);
  let step = 0; const st = () => ++step;

  return (
    <section className="page gutter" style={{ ["--exc" as string]: ec }}>
      <div className="inner">
        <div className="crumbs"><a href="#map">{s.backMap}</a>{pn}</div>
        <header className="day-head">
          <span className="eyebrow">{label} · {fill(s.expedition, { n: exNo })}: {e.title[lang]}</span>
          <h1>{p(t.title)}</h1>
          {t.bibleStory && <span className="ref">{fill(s.bibleStory, { ref: t.bibleStory })}</span>}
        </header>
        {notes.map(x => <p className="notice" key={x}>{x}</p>)}
        <figure className="scene" {...svg(scene(n.scene, (r.journeyIndex ?? r.number + 100) * 13, child.gender))} />

        {n.kind === "story" ? <>
          {n.treasure && <div className="trait"><span {...svg(gem(ec, 40))} /><div><small>{s.tonightsTreasure}</small><strong>{n.treasure.trait[lang]}</strong></div></div>}
          <section className="step"><Sign n={st()}>{s.stepLantern}</Sign><p className="tip">{s.lanternTip}</p></section>
          <section className="step story"><Sign n={st()}>{s.stepStory}</Sign>{t.story.map((x, k) => <p key={k}>{p(x)}</p>)}</section>
          {t.verse && <section className="step"><Sign n={st()}>{s.stepWord}</Sign><Bubble v={t.verse} />
            <p className="tip">{older ? s.wordTipRead : s.wordTipRepeat}</p>
            {older && <p className="tip"><b>{fill(s.findIt, { ref: t.verse.refText })}</b></p>}</section>}
          <section className="step"><Sign n={st()}>{s.stepTreasure}</Sign>
            <ul className="treasure">{t.lessons.map((x, k) => <li key={k}><span {...svg(gem(ec, 18))} /><span>{p(x)}</span></li>)}</ul>
            {t.fact && <div className="fact"><span {...svg(gem(ec, 24))} /><p><small>{s.didYouKnow}</small>{p(t.fact)}</p></div>}
          </section>
          <section className="step"><Sign n={st()}>{s.stepTalk}</Sign>
            <ol className="talk">{t.questions.map((x, k) => <li key={k}>{p(x)}</li>)}
              {t.deeper && <li className="deeper"><b>{s.thinkDeeper}</b> {p(t.deeper)}</li>}</ol></section>
          <section className="step"><Sign n={st()}>{s.stepPray}</Sign><p className="tip">{p(together ? s.prayTogether : s.prayRepeat)}</p>
            <Prayer lines={t.prayer} own={together ? s.ownWordsTogether : s.ownWordsRepeat} /></section>
          {t.mission && <section className="step"><Sign n={st()}>{s.stepMission}</Sign><Mission c={t.mission.compass} text={p(t.mission.text)} /></section>}
          {t.journal && <section className="step"><Sign n={st()}>{s.stepJournal}</Sign><p className="tip">{p(s.journalTip)}</p><div className="journal"><p>{p(t.journal)}</p></div></section>}
        </> : <>
          <section className="step"><Sign n={st()}>{s.campAround}</Sign>{t.story.map((x, k) => <p className="camp-intro" key={k}>{p(x)}</p>)}</section>
          <section className="step"><Sign n={st()}>{s.campGems}</Sign><p className="tip">{p(s.campGemsTip)}</p>
            <div className="gems">{e.nights.filter(x => x.kind === "story").map(x => {
              const xr = lib.byId.get(x.id)!;
              const xt = pickText(x, band, lang)?.text;
              return <a key={x.id} href={`#night-${x.id}`}><span {...svg(gem(ec, 28))} /><span><b>{x.treasure?.trait[lang]}</b><small>{xr.journeyIndex !== undefined ? fill(s.night, { n: xr.journeyIndex + 1 }) : fill(s.christmasNight, { n: xr.number })} · {xt?.title}</small></span></a>;
            })}</div></section>
          <section className="step"><Sign n={st()}>{s.memoryVerse}</Sign><Bubble v={e.memoryVerse[lang]} /><p className="tip">{s.memoryTip}</p></section>
          {t.game && <section className="step"><Sign n={st()}>{s.campGame}</Sign><div className="card"><p>{p(t.game)}</p></div></section>}
          <section className="step"><Sign n={st()}>{s.stepTalk}</Sign><ol className="talk">{t.questions.map((x, k) => <li key={k}>{p(x)}</li>)}</ol></section>
          <section className="step"><Sign n={st()}>{s.stepPray}</Sign><Prayer lines={t.prayer} /></section>
          {t.mission && <section className="step"><Sign n={st()}>{s.stepMissionCamp}</Sign><Mission c={t.mission.compass} text={p(t.mission.text)} /></section>}
          {t.journal && <section className="step"><Sign n={st()}>{s.stepJournal}</Sign><div className="journal"><p>{p(t.journal)}</p></div></section>}
          {n.special === "finale" && <>
            <section className="step"><Sign n="★">{p(s.inviteTitle)}</Sign>
              <div className="card invite"><p>{p(s.invite)}</p><Prayer lines={s.invitePrayer} /><p>{p(s.inviteAfter)}</p></div></section>
            <section className="step"><Sign n="★">{s.certTitle}</Sign><Certificate /></section>
          </>}
        </>}

        <div className="goodnight"><span>{s.goodnight}</span><p>{s.goodnightText}</p></div>
        <div className="collect">
          <button className={`btn${done ? " isdone" : ""}`} type="button" onClick={collect}>
            <span className={done ? "pop" : ""} {...svg(gem(done ? "var(--on-forest)" : "var(--on-amber)", 22))} />
            <span>{done ? s.collected : s.collect}</span>
          </button>
          {pn}
        </div>
      </div>
    </section>
  );
}

function Mission({ c, text }: { c: "talk" | "listen" | "trust" | "love"; text: string }) {
  const { s } = useApp();
  return (
    <div className="mission" style={{ ["--pc" as string]: `var(--${c})` }}>
      <div className="cbadge"><span {...svg(compassMini(c))} /><span>{s.compass[c]}</span></div><p>{text}</p>
    </div>
  );
}
