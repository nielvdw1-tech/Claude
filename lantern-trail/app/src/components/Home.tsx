import { svg, useApp } from "../ctx";
import { gem, heroArt } from "../lib/art";
import { fill } from "../lib/i18n";
import type { NightRef } from "../lib/content";
import type { Trail } from "../lib/model";

function Stone({ r, next }: { r: NightRef; next: boolean }) {
  const { s, lang, isDone } = useApp();
  const done = isDone(r), n = r.night, camp = n.kind === "campfire";
  const title = camp
    ? (n.special === "christmas-day" ? s.christmasCampfire : n.special === "finale" ? s.grandCampfire : s.campfireNight)
    : (n.bands["4-5"]?.[lang]?.title ?? n.bands["4-5"]?.en?.title ?? "");
  const sub = camp ? s.reviewNight : (done ? s.found : "") + (n.treasure?.gem[lang] ?? "");
  return (
    <a className={`stone${done ? " done" : ""}${camp ? " camp" : ""}${next && !done ? " next" : ""}`} href={`#night-${n.id}`}>
      <span className="num">{done ? "✓" : r.number}</span><span className="st">{title}</span><span className="sg">{sub}</span>
    </a>
  );
}

function TrailMap({ trail, nights, note }: { trail: Trail; nights: NightRef[]; note?: string }) {
  const { s, lang, tonight } = useApp();
  return (
    <section className="trail">
      <div className="trail-head"><h2>{trail.title[lang]}</h2><p>{note ?? trail.blurb[lang]}</p></div>
      {trail.expeditions.map((e, i) => {
        const list = nights.filter(r => r.expedition.id === e.id);
        return (
          <div key={e.id} style={{ ["--exc" as string]: `var(--ex${e.color})` }}>
            <div className="ex-head">
              <span className="ex-tag">{fill(s.expedition, { n: i + 1 })} · {fill(s.nightsRange, { a: list[0].number, b: list[list.length - 1].number })}</span>
              <h3>{e.title[lang]}</h3><p>{e.blurb[lang]}</p>
            </div>
            <div className="stones">{list.map(r => <Stone key={r.night.id} r={r} next={tonight?.night.id === r.night.id} />)}</div>
          </div>
        );
      })}
    </section>
  );
}

export function Home() {
  const { s, lang, lib, family, setFamily, child, tonight, isDone } = useApp();
  const found = lib.journeyNights.filter(r => isDone(r) && r.night.kind === "story").length;
  const total = lib.journeyNights.filter(r => r.night.kind === "story").length;
  const allDone = lib.journeyNights.every(isDone);
  const returning = family.completed.length > 0;
  const tText = tonight && (tonight.night.bands["4-5"]?.[lang]?.title ?? tonight.night.bands["4-5"]?.en?.title);
  return (
    <>
      <section className="hero gutter">
        <div className="inner">
          <h1>{lang === "af" ? <>Die <span>Lantern</span>pad</> : <>The <span>Lantern</span> Trail</>}</h1>
          <p className="lede">{s.homeLede}</p>
          <p className="theme-verse">{s.themeVerse}<small>{s.themeVerseRef}</small></p>
          {tonight ? (
            <a className="tonight" href={`#night-${tonight.night.id}`} style={{ ["--exc" as string]: `var(--ex${tonight.expedition.color})` }}>
              <span className="tn-gem" {...svg(gem(`var(--ex${tonight.expedition.color})`, 40))} />
              <span className="tn-body">
                <small>{s.tonight} · {child.name}</small>
                <b>{tText}</b>
                {tonight.night.treasure && <em>{tonight.night.treasure.trait[lang]}</em>}
              </span>
              <span className="btn">{s.startTonight}</span>
            </a>
          ) : allDone && (
            <div className="tonight done-all"><span className="tn-body"><b>{s.trailDone}</b></span>
              <button className="btn" type="button" onClick={() => setFamily({ ...family, completed: [], cycle: family.cycle + 1 })}>{s.startAgain}</button></div>
          )}
          <div className="hero-row">
            {returning && <span className="welcome">{s.welcomeBack}</span>}
            <div className="progress"><div className="track"><div className="fill" style={{ width: `${(found / total) * 100}%` }} /></div>{fill(s.treasuresFound, { n: found })}</div>
          </div>
          <div {...svg(heroArt(child.look, child.gender))} />
        </div>
      </section>
      <div className="map gutter"><div className="inner">
        {lib.journey.map(t => <TrailMap key={t.id} trail={t} nights={lib.journeyNights.filter(r => r.trail.id === t.id)} />)}
        {lib.christmas && <TrailMap trail={lib.christmas} nights={lib.christmasNights} note={`${s.christmasTrail} · ${s.christmasOpens}. ${lib.christmas.blurb[lang]}`} />}
      </div></div>
    </>
  );
}
