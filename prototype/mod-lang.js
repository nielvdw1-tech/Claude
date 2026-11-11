/* ==========================================================================
   Field screens in Afrikaans and isiZulu
   --------------------------------------------------------------------------
   The screens operators use on their phone (home, QR scan, the asset's QR
   page, inspections, incident reporting, documents to read and notices) can
   be shown in English, Afrikaans or isiZulu. Each person chooses their
   language; it is remembered on their account.

   What is translated: the screen's own words (headings, buttons, labels,
   help text). What is not: content people wrote (checklist questions,
   notices, document titles, names), which stays as written.

   The translations are a first draft and must be checked by first-language
   speakers before they are used with a client.
   ========================================================================== */
'use strict';

const LANGS = { en: 'English', af: 'Afrikaans', zu: 'isiZulu' };
// English → [Afrikaans, isiZulu]
const TR = {
  'Scan the QR code on an asset to inspect it, or report an incident.': ['Skandeer die QR-kode op ’n bate om dit te inspekteer, of rapporteer ’n voorval.', 'Skena ikhodi ye-QR esempahleni ukuze uyihlole, noma ubike isehlakalo.'],
  'Notices for you': ['Kennisgewings vir jou', 'Izaziso zakho'],
  'Important': ['Belangrik', 'Kubalulekile'], 'Acknowledged': ['Erken', 'Kwamukelwe'], 'Notice': ['Kennisgewing', 'Isaziso'], 'All notices': ['Alle kennisgewings', 'Zonke izaziso'],
  'Scan asset QR code': ['Skandeer bate se QR-kode', 'Skena ikhodi ye-QR yempahla'],
  'Report incident': ['Rapporteer voorval', 'Bika isehlakalo'],
  'Documents to read': ['Dokumente om te lees', 'Amadokhumenti okufundwa'], 'To read': ['Om te lees', 'Okufundwayo'], 'Overdue': ['Agterstallig', 'Sekwedlule isikhathi'],
  'My inspections': ['My inspeksies', 'Ukuhlola kwami'],
  "Scan the asset's QR code to start": ['Skandeer die bate se QR-kode om te begin', 'Skena ikhodi ye-QR yempahla ukuze uqale'],
  'No inspections are assigned to you.': ['Geen inspeksies is aan jou toegeken nie.', 'Akukho ukuhlola okunikwe wena.'],
  'Incidents I reported': ['Voorvalle wat ek gerapporteer het', 'Izehlakalo engizibikile'],
  'You have not reported any incidents.': ['Jy het nog geen voorvalle gerapporteer nie.', 'Awukabiki sehlakalo.'],
  'Closed': ['Gesluit', 'Kuvaliwe'], 'Reported': ['Gerapporteer', 'Kubikiwe'], 'Under Investigation': ['Word ondersoek', 'Kuyaphenywa'],
  'On this phone': ['Op hierdie foon', 'Kule foni'], 'Waiting to send': ['Wag om te stuur', 'Kulindile ukuthunyelwa'], 'Draft': ['Konsep', 'Okusalungiswa'],
  'Back': ['Terug', 'Emuva'], 'Home': ['Tuis', 'Ekhaya'], 'Scan & inspect': ['Skandeer en inspekteer', 'Skena uhlole'], 'Notices': ['Kennisgewings', 'Izaziso'],
  'Report an incident': ['Rapporteer ’n voorval', 'Bika isehlakalo'],
  'Quick reporting form — works on a phone in the field. Investigation details are added afterwards by the investigator.': ['Vinnige verslagvorm wat op ’n foon in die veld werk. Die ondersoeker voeg later die ondersoekbesonderhede by.', 'Ifomu lokubika ngokushesha elisebenza efonini emsebenzini. Imininingwane yophenyo yengezwa kamuva ngumphenyi.'],
  'Incident type': ['Soort voorval', 'Uhlobo lwesehlakalo'], 'Near Miss': ['Byna-ongeluk', 'Cishe kwenzeka ingozi'], 'Injury': ['Besering', 'Ukulimala'], 'Property Damage': ['Skade aan eiendom', 'Umonakalo wempahla'], 'Environmental': ['Omgewing', 'Imvelo'],
  'Short title': ['Kort titel', 'Isihloko esifushane'], 'Date': ['Datum', 'Usuku'], 'Time': ['Tyd', 'Isikhathi'], 'Site / branch': ['Perseel / tak', 'Indawo / igatsha'], 'Exact location': ['Presiese plek', 'Indawo ngqo'],
  'Person involved': ['Betrokke persoon', 'Umuntu othintekayo'], '— Select —': ['— Kies —', '— Khetha —'], '— None —': ['— Geen —', '— Lutho —'],
  'Other persons involved (names)': ['Ander betrokke persone (name)', 'Abanye abantu abathintekayo (amagama)'],
  'What happened?': ['Wat het gebeur?', 'Kwenzekeni?'], 'Immediate response / actions taken': ['Onmiddellike reaksie / stappe gedoen', 'Okwenziwe ngokushesha'],
  'Injury details': ['Besonderhede van die besering', 'Imininingwane yokulimala'], 'Nature of injury': ['Aard van die besering', 'Uhlobo lokulimala'], 'Body part': ['Liggaamsdeel', 'Ingxenye yomzimba'], 'First aid given': ['Noodhulp gegee', 'Usizo lokuqala olunikeziwe'],
  'Sent to a doctor, nurse or clinic?': ['Na ’n dokter, verpleegster of kliniek gestuur?', 'Uthunyelwe kudokotela, kunesi noma emtholampilo?'],
  'Not known': ['Onbekend', 'Akwaziwa'], 'Yes': ['Ja', 'Yebo'], 'No': ['Nee', 'Cha'],
  'You only describe the injury. The HSEQ team classifies it (first aid, medical treatment, lost time and so on) during the investigation.': ['Jy beskryf net die besering. Die HSEQ-span klassifiseer dit tydens die ondersoek (noodhulp, mediese behandeling, verlore tyd ensovoorts).', 'Wena uchaza ukulimala kuphela. Ithimba le-HSEQ liyakuhlukanisa ngesikhathi sophenyo (usizo lokuqala, ukwelashwa, isikhathi esilahlekile njalo njalo).'],
  'Medical details are restricted to authorised roles in production.': ['In die regte stelsel kan net gemagtigde rolle mediese besonderhede sien.', 'Ohlelweni lwangempela imininingwane yezempilo ibonwa kuphela ngabagunyaziwe.'],
  'Actual severity': ['Werklike erns', 'Ubucayi bangempela'], 'Potential severity (worst credible)': ['Moontlike erns (ergste wat kon gebeur)', 'Ubucayi obungenzeka (okubi kakhulu okungenzeka)'],
  '1 — Insignificant': ['1 — Onbeduidend', '1 — Akubalulekile'], '2 — Minor': ['2 — Gering', '2 — Okuncane'], '3 — Moderate': ['3 — Matig', '3 — Okuphakathi'], '4 — Major': ['4 — Ernstig', '4 — Okukhulu'], '5 — Catastrophic': ['5 — Katastrofies', '5 — Inhlekelele'],
  'Equipment involved': ['Betrokke toerusting', 'Imishini ethintekayo'], 'Witnesses': ['Getuies', 'Ofakazi'],
  'Photographs / attachments': ['Foto’s / aanhegsels', 'Izithombe / okunamathiselwe'], 'Take photo': ['Neem foto', 'Thatha isithombe'], 'Upload': ['Laai op', 'Layisha'],
  'Take photos with the camera, or upload photos and PDFs from your phone or computer (up to 10 files, 20 MB each). Prototype: files are kept in this browser only.': ['Neem foto’s met die kamera, of laai foto’s en PDF’s van jou foon of rekenaar op (tot 10 lêers van 20 MB elk). Prototipe: lêers word net in hierdie blaaier gehou.', 'Thatha izithombe ngekhamera, noma ulayishe izithombe nama-PDF efonini noma kukhompyutha (kufika kumafayela ayi-10, ngalinye kufika ku-20 MB). Isibonelo: amafayela agcinwa kulesi siphequluli kuphela.'],
  'Cancel': ['Kanselleer', 'Khansela'], 'Submit report': ['Dien verslag in', 'Thumela umbiko'],
  'What happened, in a few words': ['Wat het gebeur, in ’n paar woorde', 'Kwenzekeni, ngamagama ambalwa'],
  'Company notices': ['Maatskappy-kennisgewings', 'Izaziso zenkampani'],
  'Memos and important information shared with staff. Notices marked "Please acknowledge" need you to confirm that you have read and understood them.': ['Memo’s en belangrike inligting vir personeel. By kennisgewings gemerk "Erken asseblief" moet jy bevestig dat jy dit gelees en verstaan het.', 'Amamemo nolwazi olubalulekile kubasebenzi. Ezazisweni ezimakwe ngokuthi "Sicela uvume" kumele uqinisekise ukuthi uzifundile futhi uziqondile.'],
  'Step 2 appears once you have opened it: tick that you have read and understood it, and sign.': ['Stap 2 verskyn sodra jy dit oopgemaak het: merk dat jy dit gelees en verstaan het, en teken.', 'Isinyathelo sesi-2 sivela uma usuyivulile: khetha ukuthi uyifundile futhi uyiqondile, bese usayina.'],
  'Open it again': ['Maak dit weer oop', 'Yivule futhi'], 'and will follow it.': ['en sal dit volg.', 'futhi ngizoyilandela.'],
  'Your signature': ['Jou handtekening', 'Isiginesha yakho'], 'Confirm and sign': ['Bevestig en teken', 'Qinisekisa usayine'],
  'Something in this document is wrong or out of date?': ['Is iets in hierdie dokument verkeerd of verouderd?', 'Kukhona okungalungile noma okuphelelwe yisikhathi kule dokhumenti?'],
  'Request a change': ['Vra vir ’n verandering', 'Cela ushintsho'],
  'Safe to use — documents current': ['Veilig om te gebruik — dokumente is geldig', 'Kuphephile ukusebenzisa — amadokhumenti asasebenza'],
  'Out of service — do not use': ['Buite diens — moenie gebruik nie', 'Akusebenzi — ungakusebenzisi'],
  'Make / model': ['Fabrikaat / model', 'Umkhiqizi / imodeli'], 'Serial number': ['Reeksnommer', 'Inombolo yomkhiqizo'], 'Year': ['Jaar', 'Unyaka'], 'Responsible person': ['Verantwoordelike persoon', 'Umuntu obhekele'], 'QR label': ['QR-etiket', 'Ilebula ye-QR'],
  'Start inspection': ['Begin inspeksie', 'Qala ukuhlola'], 'Report defect': ['Rapporteer defek', 'Bika iphutha'],
  'Last inspection': ['Laaste inspeksie', 'Ukuhlola kokugcina'], 'Inspected by': ['Geïnspekteer deur', 'Kuhlolwe ngu'], 'Checklist': ['Kontrolelys', 'Uhlu lokuhlola'], 'Result': ['Uitslag', 'Umphumela'],
  'All items passed': ['Alle items het geslaag', 'Konke kuphumelele'], 'Reviewed by': ['Nagegaan deur', 'Kubuyekezwe ngu'], 'Next inspection': ['Volgende inspeksie', 'Ukuhlola okulandelayo'],
  'View only': ['Net lees', 'Ukubuka kuphela'], 'Expiring': ['Verval binnekort', 'Kuzophelelwa yisikhathi'], 'Valid': ['Geldig', 'Kusebenza'], 'Expired': ['Verval', 'Kuphelelwe yisikhathi'], 'Missing': ['Ontbreek', 'Akukho'], 'View': ['Bekyk', 'Buka'],
  'Your answers are saved on this phone as you go.': ['Jou antwoorde word gaandeweg op hierdie foon gestoor.', 'Izimpendulo zakho zigcinwa kule foni njengoba uqhubeka.'],
  'Controlled header from the approved template — not editable during inspections.': ['Beheerde opskrif uit die goedgekeurde sjabloon; dit kan nie tydens inspeksies verander word nie.', 'Isihloko esilawulwayo esivela kusifanekiso esivunyiwe; asikwazi ukushintshwa ngesikhathi sokuhlola.'],
  'Asset / area': ['Bate / area', 'Impahla / indawo'], 'Site': ['Perseel', 'Indawo'], 'Schedule': ['Skedule', 'Uhlelo'], 'Inspector': ['Inspekteur', 'Umhloli'], 'Inspection date': ['Inspeksiedatum', 'Usuku lokuhlola'],
  'Critical item': ['Kritieke item', 'Into ebucayi'], 'Pass': ['Slaag', 'Kuphasile'], 'Fail': ['Druip', 'Kwehlulekile'], 'N/A': ['N.v.t.', 'Akusebenzi'], 'Comment': ['Opmerking', 'Amazwana'], 'Photos': ['Foto’s', 'Izithombe'],
  'Your supervisor will review this failure and decide on the corrective action.': ['Jou toesighouer sal hierdie fout nagaan en oor die regstellende aksie besluit.', 'Umphathi wakho uzobuyekeza leli phutha bese enquma ngesenzo sokulungisa.'],
  'General findings / comments': ['Algemene bevindinge / opmerkings', 'Okutholakele / amazwana'], 'Reviewer (sign-off)': ['Nagaan deur (aftekening)', 'Obuyekezayo (ukusayina)'],
  'I declare that this inspection was carried out as recorded.': ['Ek verklaar dat hierdie inspeksie uitgevoer is soos aangeteken.', 'Ngiyaqinisekisa ukuthi lokhu kuhlola kwenziwe njengoba kubhaliwe.'],
  'Inspector signature': ['Inspekteur se handtekening', 'Isiginesha yomhloli'], 'Clear': ['Vee uit', 'Sula'], 'Submit inspection': ['Dien inspeksie in', 'Thumela ukuhlola'],
  'Describe the failure': ['Beskryf die fout', 'Chaza iphutha'], 'Optional': ['Opsioneel', 'Akuphoqelekile'],
  'Point the camera at the QR label on the asset.': ['Rig die kamera op die QR-etiket op die bate.', 'Khombisa ikhamera kulebula ye-QR esempahleni.'],
  'The camera is not available. Take a photo of the label instead.': ['Die kamera is nie beskikbaar nie. Neem eerder ’n foto van die etiket.', 'Ikhamera ayitholakali. Esikhundleni salokho thatha isithombe selebula.'],
  'Take a photo of the label': ['Neem ’n foto van die etiket', 'Thatha isithombe selebula'], 'No label? Type the code or choose the asset': ['Geen etiket nie? Tik die kode of kies die bate', 'Ayikho ilebula? Thayipha ikhodi noma ukhethe impahla'],
  'QR code / tag': ['QR-kode / merker', 'Ikhodi ye-QR / ithegi'], 'Or choose an asset': ['Of kies ’n bate', 'Noma khetha impahla'], 'Open asset': ['Maak bate oop', 'Vula impahla'], 'Close': ['Maak toe', 'Vala'],
  'Asset': ['Bate', 'Impahla'], 'Defect description': ['Beskrywing van die defek', 'Incazelo yephutha'], 'Severity': ['Erns', 'Ubucayi'], 'Critical': ['Kritiek', 'Kubucayi'], 'Major': ['Ernstig', 'Kukhulu'], 'Minor': ['Gering', 'Kuncane'],
  'Photo (optional)': ['Foto (opsioneel)', 'Isithombe (akuphoqelekile)'], 'Remove asset from service immediately': ['Haal die bate dadelik uit diens', 'Susa impahla emsebenzini ngokushesha'],
  'Critical defects remove the asset from service until the corrective action is verified.': ['’n Kritieke defek haal die bate uit diens totdat die regstellende aksie geverifieer is.', 'Iphutha elibucayi likhipha impahla emsebenzini kuze kuqinisekiswe isenzo sokulungisa.'],
  'Inspections': ['Inspeksies', 'Ukuhlola'], 'Incidents & injuries': ['Voorvalle en beserings', 'Izehlakalo nokulimala'], 'Report': ['Rapporteer', 'Bika'], 'Assets & equipment': ['Bates en toerusting', 'Izimpahla nemishini'],
  'No signal': ['Geen sein nie', 'Ayikho isiginali'], 'Language': ['Taal', 'Ulimi'], 'Discard draft': ['Gooi konsep weg', 'Lahla okusalungiswa']
};
// Sentences with names, numbers or dates in them
const TR_RX = [
  [/^Hello, (.+)$/, ['Hallo, $1', 'Sawubona, $1']],
  [/^Checklist — (\d+) items$/, ['Kontrolelys — $1 items', 'Uhlu lokuhlola — izinto ezingu-$1']],
  [/^· (\d+) of (\d+) answered$/, ['· $1 van $2 beantwoord', '· $1 kwezingu-$2 ziphenduliwe']],
  [/^(.+) · sign with your finger or mouse$/, ['$1 · teken met jou vinger of muis', '$1 · sayina ngomunwe noma ngegundane']],
  [/^Unsafe to use — remove (.+) from service$/, ['Onveilig om te gebruik — haal $1 uit diens', 'Akuphephile — susa i-$1 emsebenzini']],
  [/^Step 1: open (Rev \d+)$/, ['Stap 1: maak $1 oop', 'Isinyathelo 1: vula i-$1']],
  [/^Please read (.+), then tick and sign\.$/, ['Lees asseblief $1, merk dan en teken.', 'Sicela ufunde i-$1, bese ukhetha futhi usayine.']],
  [/^You are on the list of people who must read this document; it was due (.+)\.$/, ['Jy is op die lys van mense wat hierdie dokument moet lees; dit moes teen $1 klaar wees.', 'Usohlwini lwabantu okumele bayifunde le dokhumenti; bekumele kuqedwe ngomhla ka-$1.']],
  [/^You are on the list of people who must read this document by (.+)\.$/, ['Jy is op die lys van mense wat hierdie dokument moet lees, teen $1.', 'Usohlwini lwabantu okumele bayifunde le dokhumenti ngomhla ka-$1.']],
  [/^I have read and understood (.+)$/, ['Ek het $1 gelees en verstaan', 'Ngiyifundile futhi ngiyiqondile i-$1']],
  [/^Saved on this phone (.+)$/, ['Op hierdie foon gestoor $1', 'Kugcinwe kule foni $1']],
  [/^Draft restored — saved on this phone (.+)$/, ['Konsep herstel — op hierdie foon gestoor $1', 'Okusalungiswa kubuyisiwe — kugcinwe kule foni $1']],
  [/^\((\d+) day\(s\) ago\)$/, ['($1 dag(e) gelede)', '(izinsuku ezingu-$1 ezedlule)']],
  [/^(\d+) open defect\(s\) being dealt with$/, ['$1 oop defek(te) word hanteer', 'Amaphutha avulekile angu-$1 ayalungiswa']],
  [/^(.+) · Rev (\d+) · by (.+)$/, ['$1 · Rev $2 · teen $3', '$1 · Rev $2 · ngomhla ka-$3']],
  [/^ — work is saved on this phone(.*)$/, [' — werk word op hierdie foon gestoor$1', ' — umsebenzi ugcinwa kule foni$1']]
];
function curLang() { const p = S && S.ui && S.ui.user && person(S.ui.user); return (p && p.lang && LANGS[p.lang]) ? p.lang : 'en'; }
function trStr(s) {
  const L = curLang(); if (L === 'en' || !s) return s;
  const k = L === 'af' ? 0 : 1, lead = s.match(/^\s*/)[0], tail = s.match(/\s*$/)[0], t = s.trim();
  if (TR[t]) return lead + TR[t][k] + tail;
  for (const [rx, out] of TR_RX) if (rx.test(t)) return lead + t.replace(rx, out[k]) + tail;
  return s;
}
const TR_ROUTES = ['field', 'report', 'qr', 'inspect', 'notices', 'read'];
function onFieldScreen() { return TR_ROUTES.includes(parseHash().parts[0] || '') || (typeof isFieldUser === 'function' && S.ui.user && isFieldUser()); }
function translateTree(root) {
  if (curLang() === 'en' || !root || !onFieldScreen()) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { const p = n.parentElement; if (!p || p.closest('script,style,textarea,[data-no-tr]')) continue; const v = trStr(n.textContent); if (v !== n.textContent) n.textContent = v; }
  (root.querySelectorAll ? root.querySelectorAll('[placeholder],[aria-label],[title]') : []).forEach(e => ['placeholder', 'aria-label', 'title'].forEach(a => { const v = e.getAttribute(a); if (v) { const t = trStr(v); if (t !== v) e.setAttribute(a, t); } }));
}
// After each page is drawn, and for anything added later (forms, answers, toasts)
const _rerenderBeforeLang = rerender;
rerender = function (keepScroll) { _rerenderBeforeLang(keepScroll); try { translateTree(document.body); } catch (e) { console.error(e); } };
new MutationObserver(ms => { if (!S || curLang() === 'en') return; ms.forEach(m => m.addedNodes.forEach(nd => { if (nd.nodeType === 1) translateTree(nd); else if (nd.nodeType === 3 && nd.parentElement) translateTree(nd.parentElement); })); }).observe(document.body, { childList: true, subtree: true });

/* Choosing the language */
function langPickHtml() {
  const L = curLang();
  return `<div class="lang-pick" data-no-tr role="group" aria-label="Language">${icon('info', 'sm')}<span>${esc(TR.Language ? (L === 'en' ? 'Language' : TR.Language[L === 'af' ? 0 : 1]) : 'Language')}:</span>${Object.keys(LANGS).map(k => `<button type="button" class="${k === L ? 'on' : ''}" data-act="setLang" data-l="${k}" aria-pressed="${k === L}">${LANGS[k]}</button>`).join('')}</div>`;
}
ACT.setLang = (el) => {
  const p = me(), l = el.dataset.l; if (!p || !LANGS[l]) return;
  p.lang = l; save(); document.querySelectorAll('.dropdown').forEach(d => d.remove());
  log(`${p.name} chose ${LANGS[l]} for the field screens`, ''); toast(`${LANGS[l]}.`, 'info'); rerender();
};
