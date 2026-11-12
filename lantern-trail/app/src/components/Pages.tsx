import { useApp } from "../ctx";
import type { Lang } from "../lib/model";

type Copy = Record<Lang, {
  guideTitle: string; guideIntro: string[]; rhythmTitle: string; rhythmYoung: [string, string][]; rhythmOlder: [string, string][];
  seasonsTitle: string; seasons: string[]; tipsTitle: string; tips: string[]; tipsOlder: string[]; storage: string;
  compassTitle: string; compassIntro: string; points: [string, string][]; becomeTitle: string; becomeIntro: string; become: [string, string][]; becomeEnd: string;
}>;

const COPY: Copy = {
  en: {
    guideTitle: "How the Lantern Trail works",
    guideIntro: [
      "Each night is one stop on the trail. Every Bible story uncovers a treasure: one part of who God is, such as God is holy, God provides or Jesus never stops looking for me. Along the way {name} learns what it means to be a child of God and a friend of Jesus.",
      "Every few nights a Campfire Night reviews the treasures with a game and a Treasure Verse, so the truths sink in.",
    ],
    rhythmTitle: "Tonight's rhythm",
    rhythmYoung: [
      ["Light the lantern.", "Dim the lights and switch on a torch or bedside lamp. It becomes {poss} signal that trail time has started."],
      ["Story trail.", "Read the story aloud. Let {obj} do the sound effects and point at the picture."],
      ["God's Word says.", "Read the verse in the speech bubble and say it three times: whisper, normal, big explorer voice."],
      ["Treasure found.", "Read the three short lessons. The first one is usually the main idea."],
      ["Adventure talk.", "Ask one or two questions. Short answers are fine."],
      ["Talk to God.", "Say a line, {subj} repeats it. Then give {obj} a moment to add {poss} own words."],
      ["Explorer mission.", "A small thing to try tomorrow."],
      ["Goodnight words.", "Say together: “I am a child of God and a friend of Jesus!” Said every night, it becomes who {subj} knows {subj} is."],
    ],
    rhythmOlder: [
      ["Light the lantern.", "Dim the lights and switch on a lamp."],
      ["Story trail.", "Read aloud, or take turns reading a paragraph each."],
      ["God's Word says.", "Let {obj} read the verse, find it in {poss} own Bible, then try saying it from memory."],
      ["Treasure found.", "Read the lessons and the “Did you know?” fact."],
      ["Adventure talk.", "Use the “Think deeper” question on chatty nights. Real conversations matter more than right answers."],
      ["Talk to God.", "Read the prayer together, then give {obj} space to pray in {poss} own words."],
      ["Explorer mission and journal.", "A small thing to try tomorrow, plus a writing or drawing prompt for {poss} notebook."],
      ["Goodnight words.", "Say together: “I am a child of God and a friend of Jesus!”"],
    ],
    seasonsTitle: "Missed a night? Christmas? Easter?",
    seasons: [
      "The trail never runs out and never punishes. It moves on only when you tap “We did it”, so a missed night simply waits for you.",
      "In December the Christmas trail opens by itself and ends on Christmas Day. At Easter the Easter trail does the same. Afterwards you carry on exactly where you left off.",
      "Each child has their own trail and progress. Use the name buttons on the Trail Map to switch. If you do the night with brothers and sisters together, they stay on the same Bible story, each at their own level, so you can talk about it together.",
    ],
    tipsTitle: "Tips",
    tips: [
      "Keep it warm and short rather than complete. Missing a part is better than a tired, grumpy end to the day.",
      "Children learn most from watching your own walk with God. Share a short “God helped me today when…” story now and then.",
      "The verses are given in simple wording for children, with the reference so you can look them up in your own Bible.",
    ],
    tipsOlder: [
      "Give {obj} a special notebook for the Explorer's Journal. A drawing or a sentence both count.",
      "Expect big questions. It is fine to say “I don't know, let's ask God and find out together.”",
    ],
    storage: "For now your family and progress are saved on this device only. Accounts that sync across devices are coming.",
    compassTitle: "Child of God, friend of Jesus",
    compassIntro: "God wants to be {name}'s loving Father, and Jesus wants to be {poss} best friend. A child stays close to a good dad, and friends spend time together: they talk, they listen, they trust each other and they show love. Every Explorer Mission points to one of these four directions.",
    points: [
      ["Talk", "We talk to God in prayer. We can tell Him anything: thank you, sorry, please, and what happened today. He always hears."],
      ["Listen", "God speaks to us through the Bible and in our hearts by His Spirit. What He says always agrees with the Bible and sounds like love."],
      ["Trust", "A child trusts a good father. We believe God is good and do what He says, even when it is hard or seems strange."],
      ["Love", "We love God most of all, and we show it by loving the people around us. We obey because we love Him, not so that He will love us. He already does."],
    ],
    becomeTitle: "How do I become a child of God and a friend of Jesus?",
    becomeIntro: "Explain it in three simple steps, the same way the trail tells it:",
    become: [
      ["God made me and loves me.", "He made me in His image and wants to be close to me."],
      ["Sin puts a wall between us.", "Everyone has sin inside, and the wrong things we do keep us far from God."],
      ["Jesus broke down the wall.", "He took my place on the cross and came alive again. When I say sorry and receive Jesus, I am born again: God forgives me, I become His child, and His Holy Spirit lives in me."],
    ],
    becomeEnd: "The last night of the trail includes a simple prayer {subj} can pray if {subj} wants to follow Jesus.",
  },
  af: {
    guideTitle: "Hoe die Lanternpad werk",
    guideIntro: [
      "Elke aand is een stop op die pad. Elke Bybelverhaal ontbloot ’n skat: een deel van wie God is, soos God is heilig, God voorsien of Jesus hou nooit op om na my te soek nie. Langs die pad leer {name} wat dit beteken om ’n kind van God en ’n vriend van Jesus te wees.",
      "Elke paar aande hersien ’n Kampvuuraand die skatte met ’n speletjie en ’n Skatvers, sodat die waarhede kan insink.",
    ],
    rhythmTitle: "Vanaand se ritme",
    rhythmYoung: [
      ["Steek die lantern aan.", "Maak die ligte dof en skakel ’n flitslig of bedlampie aan. Dit word {poss} teken dat dit tyd is vir die pad."],
      ["Storiepad.", "Lees die storie hardop. Laat {obj} die klankeffekte maak en na die prent wys."],
      ["God se Woord sê.", "Lees die vers in die praatborrel en sê dit drie keer: fluisterend, gewoon, en met ’n groot ontdekkerstem."],
      ["Skat gevind.", "Lees die drie kort lesse. Die eerste een is gewoonlik die hoofgedagte."],
      ["Avontuurgesels.", "Vra een of twee vrae. Kort antwoorde is goed."],
      ["Praat met God.", "Sê ’n reël, {subj} sê dit agterna. Gee {obj} dan ’n oomblik om {poss} eie woorde by te voeg."],
      ["Ontdekkersending.", "’n Klein dingetjie om môre te probeer."],
      ["Goeienag-woorde.", "Sê saam: “Ek is ’n kind van God en ’n vriend van Jesus!” As julle dit elke aand sê, word dit wie {subj} weet {subj} is."],
    ],
    rhythmOlder: [
      ["Steek die lantern aan.", "Maak die ligte dof en skakel ’n lampie aan."],
      ["Storiepad.", "Lees hardop, of lees om die beurt ’n paragraaf."],
      ["God se Woord sê.", "Laat {obj} die vers lees, dit in {poss} eie Bybel opsoek, en dit dan uit die kop probeer sê."],
      ["Skat gevind.", "Lees die lesse en die “Het jy geweet?”-feit."],
      ["Avontuurgesels.", "Gebruik die “Dink dieper”-vraag op aande wanneer {subj} lus is om te gesels. Regte gesprekke is belangriker as regte antwoorde."],
      ["Praat met God.", "Lees die gebed saam, en gee {obj} dan ruimte om in {poss} eie woorde te bid."],
      ["Ontdekkersending en joernaal.", "’n Klein dingetjie om môre te probeer, plus ’n skryf- of tekenopdrag vir {poss} notaboek."],
      ["Goeienag-woorde.", "Sê saam: “Ek is ’n kind van God en ’n vriend van Jesus!”"],
    ],
    seasonsTitle: "’n Aand gemis? Kersfees? Paasfees?",
    seasons: [
      "Die pad raak nooit op nie en straf nooit nie. Dit beweeg eers aan as jy op “Ons het dit gedoen” tik, so ’n gemiste aand wag net vir jou.",
      "In Desember gaan die Kerspad vanself oop en eindig op Kersdag. Met Paasfees doen die Paaspad dieselfde. Daarna gaan julle voort presies waar julle opgehou het.",
      "Elke kind het sy of haar eie pad en vordering. Gebruik die naamknoppies op die Roetekaart om te wissel. As julle die aand saam met broers en susters doen, bly hulle by dieselfde Bybelverhaal, elkeen op sy of haar eie vlak, sodat julle saam daaroor kan gesels.",
    ],
    tipsTitle: "Wenke",
    tips: [
      "Hou dit liewer warm en kort as volledig. ’n Deel oorslaan is beter as ’n moeë, knorrige einde van die dag.",
      "Kinders leer die meeste deur jou eie wandel met God te sien. Vertel nou en dan ’n kort “God het my vandag gehelp toe…”-storie.",
      "Die verse word in eenvoudige woorde vir kinders gegee, met die verwysing sodat jy dit in jou eie Bybel kan opsoek.",
    ],
    tipsOlder: [
      "Gee {obj} ’n spesiale notaboek vir die Ontdekkersjoernaal. ’n Tekening of ’n sin tel albei.",
      "Verwag groot vrae. Dit is reg om te sê “Ek weet nie, kom ons vra vir God en vind saam uit.”",
    ],
    storage: "Vir nou word jou gesin en vordering net op hierdie toestel gestoor. Rekeninge wat oor toestelle sinkroniseer, is op pad.",
    compassTitle: "Kind van God, vriend van Jesus",
    compassIntro: "God wil {name} se liefdevolle Vader wees, en Jesus wil {poss} beste vriend wees. ’n Kind bly naby ’n goeie pa, en vriende spandeer tyd saam: hulle praat, hulle luister, hulle vertrou mekaar en hulle wys liefde. Elke Ontdekkersending wys na een van hierdie vier rigtings.",
    points: [
      ["Praat", "Ons praat met God in gebed. Ons kan Hom enigiets vertel: dankie, jammer, asseblief, en wat vandag gebeur het. Hy hoor altyd."],
      ["Luister", "God praat met ons deur die Bybel en deur sy Gees in ons harte. Wat Hy sê, stem altyd ooreen met die Bybel en klink na liefde."],
      ["Vertrou", "’n Kind vertrou ’n goeie pa. Ons glo God is goed en doen wat Hy sê, selfs as dit moeilik is of vreemd lyk."],
      ["Liefhê", "Ons het God die liefste van almal, en ons wys dit deur die mense rondom ons lief te hê. Ons gehoorsaam omdat ons Hom liefhet, nie sodat Hy ons sal liefhê nie. Hy doen dit klaar."],
    ],
    becomeTitle: "Hoe word ek ’n kind van God en ’n vriend van Jesus?",
    becomeIntro: "Verduidelik dit in drie eenvoudige stappe, op dieselfde manier as die pad:",
    become: [
      ["God het my gemaak en het my lief.", "Hy het my na sy beeld gemaak en wil naby my wees."],
      ["Sonde sit ’n muur tussen ons.", "Almal het sonde binne-in, en die verkeerde dinge wat ons doen, hou ons ver van God af."],
      ["Jesus het die muur afgebreek.", "Hy het my plek aan die kruis ingeneem en weer lewendig geword. As ek jammer sê en Jesus aanneem, word ek weergebore: God vergewe my, ek word sy kind, en sy Heilige Gees woon in my."],
    ],
    becomeEnd: "Die laaste aand van die pad sluit ’n eenvoudige gebed in wat {subj} kan bid as {subj} Jesus wil volg.",
  },
};

export function GuidePage() {
  const { lang, band, p, s } = useApp();
  const c = COPY[lang];
  const older = band !== "2-3" && band !== "4-5";
  return (
    <section className="page gutter"><div className="inner prose">
      <header className="day-head"><span className="eyebrow" style={{ ["--exc" as string]: "var(--forest)" }}>{s.navGuide}</span><h1>{c.guideTitle}</h1></header>
      {c.guideIntro.map((x, i) => <p key={i}>{p(x)}</p>)}
      <h2>{c.rhythmTitle}</h2>
      <ol className="rhythm">{(older ? c.rhythmOlder : c.rhythmYoung).map(([b, t], i) => <li key={i}><span><b>{b}</b> {p(t)}</span></li>)}</ol>
      <h2>{c.seasonsTitle}</h2>
      {c.seasons.map((x, i) => <p key={i}>{x}</p>)}
      <h2>{c.tipsTitle}</h2>
      <ul className="tips">{[...(older ? c.tipsOlder : []), ...c.tips].map((x, i) => <li key={i}>{p(x)}</li>)}</ul>
      <p className="tip">{c.storage}</p>
    </div></section>
  );
}

export function CompassPage() {
  const { lang, p, s } = useApp();
  const c = COPY[lang];
  const keys = ["talk", "listen", "trust", "love"] as const;
  return (
    <section className="page gutter"><div className="inner prose">
      <header className="day-head"><span className="eyebrow" style={{ ["--exc" as string]: "var(--forest)" }}>{s.navCompass}</span><h1>{c.compassTitle}</h1></header>
      <p>{p(c.compassIntro)}</p>
      <div className="compass-wrap">
        <svg viewBox="0 0 200 200" role="img" aria-label={keys.map(k => s.compass[k]).join(", ")}>
          <circle cx="100" cy="100" r="92" fill="var(--surface)" stroke="var(--line)" strokeWidth="4" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="var(--line)" strokeWidth="2" strokeDasharray="3 6" />
          <polygon points="100,22 112,100 88,100" fill="var(--talk)" /><polygon points="178,100 100,112 100,88" fill="var(--listen)" />
          <polygon points="100,178 88,100 112,100" fill="var(--trust)" /><polygon points="22,100 100,88 100,112" fill="var(--love)" />
          <circle cx="100" cy="100" r="9" fill="var(--amber)" />
          <text x="100" y="16" textAnchor="middle" className="cmp" fill="var(--talk)">{s.compass.talk.toUpperCase()}</text>
          <text x="100" y="196" textAnchor="middle" className="cmp" fill="var(--trust)">{s.compass.trust.toUpperCase()}</text>
          <text x="190" y="80" textAnchor="end" className="cmp" fill="var(--listen)">{s.compass.listen.toUpperCase()}</text>
          <text x="10" y="80" className="cmp" fill="var(--love)">{s.compass.love.toUpperCase()}</text>
        </svg>
        <div className="points">{c.points.map(([h, t], i) => <div className="point" key={h} style={{ ["--pc" as string]: `var(--${keys[i]})` }}><h3>{h}</h3><p>{t}</p></div>)}</div>
      </div>
      <h2>{c.becomeTitle}</h2>
      <p>{c.becomeIntro}</p>
      <ol className="tips">{c.become.map(([b, t]) => <li key={b}><b>{b}</b> {t}</li>)}</ol>
      <p>{p(c.becomeEnd)}</p>
    </div></section>
  );
}
