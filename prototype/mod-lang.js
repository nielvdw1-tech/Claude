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
  log(`${p.name} chose ${LANGS[l]} for the employee screens`, ''); toast(`${LANGS[l]}.`, 'info'); rerender();
};

/* ---------------- Employee app screens (added with the new employee app) ---------------- */
Object.assign(TR, {
  'Good morning,': ['Goeiemôre,', 'Sawubona ekuseni,'], 'Good afternoon,': ['Goeiemiddag,', 'Sawubona ntambama,'], 'Good evening,': ['Goeienaand,', 'Sawubona kusihlwa,'],
  'You are up to date': ['Jy is op datum', 'Konke kuhamba kahle'], 'Scan & inspect': ['Skandeer en inspekteer', 'Skena futhi uhlole'], 'Scan the QR code on equipment': ['Skandeer die QR-kode op toerusting', 'Skena ikhodi ye-QR emishinini'],
  'Injury, near miss or damage': ['Besering, byna-ongeluk of skade', 'Ukulimala, okucishe kwenzeka noma umonakalo'], 'Needs your attention': ['Vra jou aandag', 'Kudinga ukunaka kwakho'], 'See all': ['Sien alles', 'Bona konke'],
  'My work': ['My werk', 'Umsebenzi wami'], 'My appointments': ['My aanstellings', 'Ukuqokwa kwami'], 'My PPE': ['My PBT', 'Izivikelo zami (PPE)'], 'My training': ['My opleiding', 'Ukuqeqeshwa kwami'],
  'Notifications': ['Kennisgewings', 'Izaziso'], 'Company notices': ['Maatskappy-kennisgewings', 'Izaziso zenkampani'], 'My incident reports': ['My voorvalverslae', 'Imibiko yami yezehlakalo'],
  'Read, accept and sign': ['Lees, aanvaar en teken', 'Funda, yamukela futhi usayine'], 'Issued to me': ['Aan my uitgereik', 'Okunikwe mina'], 'Courses and certificates': ['Kursusse en sertifikate', 'Izifundo nezitifiketi'],
  'All read': ['Alles gelees', 'Konke kufundiwe'], 'From management': ['Van die bestuur', 'Okuvela kubaphathi'], 'Procedures for my work': ['Prosedures vir my werk', 'Izinqubo zomsebenzi wami'],
  'Equipment I inspect': ['Toerusting wat ek inspekteer', 'Imishini engiyihlolayo'], 'What I reported': ['Wat ek gerapporteer het', 'Engikubikile'],
  'Home': ['Tuis', 'Ekhaya'], 'Alerts': ['Waarskuwings', 'Izexwayiso'], 'Scan': ['Skandeer', 'Skena'], 'Report': ['Rapporteer', 'Bika'], 'My items': ['My items', 'Okwami'], 'Back': ['Terug', 'Emuva'],
  'Read each new appointment fully before you respond. You can accept it, decline it or ask for clarification.': ['Lees elke nuwe aanstelling volledig voordat jy antwoord. Jy kan dit aanvaar, weier of om verduideliking vra.', 'Funda konke ukuqokwa okusha ngaphambi kokuphendula. Ungakwamukela, ukwenqabe noma ucele ukucaciswa.'],
  'Waiting for your response': ['Wag vir jou antwoord', 'Kulinde impendulo yakho'], 'Active': ['Aktief', 'Kuyasebenza'], 'Declined': ['Geweier', 'Kwenqatshiwe'], 'Previous': ['Vorige', 'Okwedlule'], 'Being finalised': ['Word afgehandel', 'Kuyaqedelwa'],
  'Read and respond': ['Lees en antwoord', 'Funda futhi uphendule'], 'Open': ['Maak oop', 'Vula'], 'My responsibilities': ['My verantwoordelikhede', 'Imisebenzi yami'], 'Acknowledge': ['Erken', 'Qinisekisa'],
  'You have no appointments yet. When your manager issues one, it appears here for you to read and accept.': ['Jy het nog geen aanstellings nie. Wanneer jou bestuurder een uitreik, verskyn dit hier vir jou om te lees en te aanvaar.', 'Awukabi nakho ukuqokwa. Uma umphathi wakho ekhipha okukodwa, kuzovela lapha ukuze ukufunde futhi ukwamukele.'],
  'Accept the appointment': ['Aanvaar die aanstelling', 'Yamukela ukuqokwa'], 'Read it in full first': ['Lees dit eers volledig', 'Kufunde konke kuqala'], 'I have read and understood this appointment': ['Ek het hierdie aanstelling gelees en verstaan', 'Ngikufundile futhi ngikuqondile lokhu kuqokwa'],
  ', including the duties and responsibilities, and I accept it.': [', insluitend die pligte en verantwoordelikhede, en ek aanvaar dit.', ', kuhlanganise nemisebenzi nezibopho, futhi ngiyakwamukela.'],
  'Your signature': ['Jou handtekening', 'Isiginesha yakho'], 'Clear': ['Vee uit', 'Sula'], 'Sign and accept': ['Teken en aanvaar', 'Sayina futhi wamukele'], 'Ask for clarification': ['Vra verduideliking', 'Cela ukucaciswa'], 'Decline': ['Weier', 'Yenqaba'],
  'Duties and responsibilities': ['Pligte en verantwoordelikhede', 'Imisebenzi nezibopho'], 'Appointed person': ['Aangestelde persoon', 'Oqokiwe'], 'Branch': ['Tak', 'Igatsha'], 'Legislation': ['Wetgewing', 'Umthetho'], 'Appointed by': ['Aangestel deur', 'Uqokwe ngu'],
  'Effective from': ['Geldig vanaf', 'Kusebenza kusukela'], 'Until': ['Tot', 'Kuze kube'], 'Until ended or replaced': ['Totdat dit beëindig of vervang word', 'Kuze kuphele noma kushintshwe'], 'Acceptance record': ['Rekord van aanvaarding', 'Irekhodi lokwamukela'],
  "This appointment assigns operational duties. The employer's statutory duties remain with the employer.": ['Hierdie aanstelling ken bedryfspligte toe. Die werkgewer se statutêre pligte bly by die werkgewer.', 'Lokhu kuqokwa kunikeza imisebenzi yokusebenza. Imisebenzi yomqashi ngokomthetho isala kumqashi.'],
  'The protective equipment issued to you. Confirm each item when you receive it, and ask your supervisor for a replacement when it is worn or damaged.': ['Die beskermende toerusting wat aan jou uitgereik is. Bevestig elke item wanneer jy dit ontvang, en vra jou toesighouer vir ’n nuwe een wanneer dit verslyt of beskadig is.', 'Izivikelo onikezwe zona. Qinisekisa into ngayinye uma uyithola, bese ucela umphathi wakho enye uma isigugile noma yonakele.'],
  'Confirm that you received': ['Bevestig dat jy ontvang het', 'Qinisekisa ukuthi uthole'], 'Sign for what you received': ['Teken vir wat jy ontvang het', 'Sayinela okutholile'], 'Issued to you': ['Aan jou uitgereik', 'Okunikwe wena'],
  'PPE required for your work': ['PBT nodig vir jou werk', 'Izivikelo ezidingekayo emsebenzini wakho'], 'Sign': ['Teken', 'Sayina'], 'Nothing else issued.': ['Niks anders uitgereik nie.', 'Akukho okunye okunikeziwe.'],
  'No PPE has been issued to you yet. Your supervisor records it here when you receive PPE.': ['Geen PBT is nog aan jou uitgereik nie. Jou toesighouer teken dit hier aan wanneer jy PBT ontvang.', 'Awukanikezwa zivikelo. Umphathi wakho uzozibhala lapha uma uthola izivikelo.'],
  'Sign for your PPE': ['Teken vir jou PBT', 'Sayinela izivikelo zakho'], 'Check the items, then confirm and sign. Your signature is kept as the record of issue.': ['Kontroleer die items, bevestig dan en teken. Jou handtekening word as rekord van uitreiking gehou.', 'Hlola izinto, bese uqinisekisa futhi usayine. Isiginesha yakho igcinwa njengerekhodi lokunikezwa.'],
  'I have read this and I received the PPE above in good condition.': ['Ek het dit gelees en ek het die PBT hierbo in goeie toestand ontvang.', 'Ngikufundile lokhu futhi ngizitholile izivikelo ezingenhla zisesimweni esihle.'],
  'I know how to use it and look after it, and I will report it when it is worn, damaged or lost.': ['Ek weet hoe om dit te gebruik en te versorg, en ek sal dit rapporteer wanneer dit verslyt, beskadig of verlore is.', 'Ngiyazi ukuzisebenzisa nokuzinakekela, futhi ngizobika uma sezigugile, zonakele noma zilahlekile.'],
  'Sign and submit': ['Teken en dien in', 'Sayina futhi uthumele'], 'Cancel': ['Kanselleer', 'Khansela'], 'Issued': ['Uitgereik', 'Kunikeziwe'], 'Not signed': ['Nie geteken nie', 'Akusayinwanga'], 'Outstanding': ['Uitstaande', 'Kusasele'], 'Replacement due': ['Vervanging nodig', 'Kudingeka okusha'],
  'Your required courses, when they expire and your certificates.': ['Jou verpligte kursusse, wanneer hulle verval en jou sertifikate.', 'Izifundo ozidingayo, ukuthi ziphelelwa nini nezitifiketi zakho.'],
  'Training required for your work': ['Opleiding nodig vir jou werk', 'Ukuqeqeshwa okudingekayo emsebenzini wakho'], 'My training records': ['My opleidingsrekords', 'Amarekhodi okuqeqeshwa kwami'], 'Certificate': ['Sertifikaat', 'Isitifiketi'],
  'Valid': ['Geldig', 'Kuyasebenza'], 'Expiring': ['Verval binnekort', 'Kuzophelelwa'], 'Expired': ['Verval', 'Kuphelelwe'], 'Missing': ['Ontbreek', 'Akukho'], 'Booked': ['Bespreek', 'Kubhukhiwe'],
  'No training is required for your work at the moment.': ['Geen opleiding word tans vir jou werk vereis nie.', 'Akukho ukuqeqeshwa okudingekayo emsebenzini wakho okwamanje.'], 'No training recorded yet.': ['Nog geen opleiding aangeteken nie.', 'Akukabhalwa ukuqeqeshwa.'],
  'Inspections assigned to me': ['Inspeksies aan my toegeken', 'Ukuhlola okunikwe mina'], 'Inspections I completed': ['Inspeksies wat ek voltooi het', 'Ukuhlola engikuqedile'], 'Scan the QR code on the equipment to start': ['Skandeer die QR-kode op die toerusting om te begin', 'Skena ikhodi ye-QR emshinini ukuze uqale'],
  'All passed': ['Alles geslaag', 'Konke kuphumelele'], 'None yet.': ['Nog geen.', 'Akukabikho.'], 'Report an incident': ['Rapporteer ’n voorval', 'Bika isehlakalo'], 'Injury, near miss, property damage or environmental': ['Besering, byna-ongeluk, eiendomskade of omgewing', 'Ukulimala, okucishe kwenzeka, umonakalo wempahla noma imvelo'],
  'You are told when the status of your report changes.': ['Jy word laat weet wanneer die status van jou verslag verander.', 'Uzokwaziswa uma isimo sombiko wakho sishintsha.'], 'You have not reported any incidents.': ['Jy het nog geen voorvalle gerapporteer nie.', 'Awukabiki zehlakalo.'],
  'Open each document, read it, then tick that you understood it and sign.': ['Maak elke dokument oop, lees dit, merk dan dat jy dit verstaan en teken.', 'Vula idokhumenti ngayinye, uyifunde, bese ukhetha ukuthi uyiqondile futhi usayine.'],
  'There are no documents for you to read.': ['Daar is geen dokumente vir jou om te lees nie.', 'Awekho amadokhumenti okumele uwafunde.'], 'Language': ['Taal', 'Ulimi']
});
TR_RX.push(
  [/^(\d+) things need your attention$/, ['$1 dinge vra jou aandag', 'Izinto ezingu-$1 zidinga ukunaka kwakho']], [/^1 thing needs your attention$/, ['1 ding vra jou aandag', 'Into eyodwa idinga ukunaka kwakho']],
  [/^(\d+) to accept$/, ['$1 om te aanvaar', '$1 okumele kwamukelwe']], [/^(\d+) to sign for$/, ['$1 om voor te teken', '$1 okumele kusayinelwe']], [/^(\d+) need attention$/, ['$1 vra aandag', '$1 kudinga ukunakwa']],
  [/^(\d+) unread$/, ['$1 ongelees', '$1 okungafundiwe']], [/^(\d+) to read$/, ['$1 om te lees', '$1 okumele kufundwe']], [/^(\d+) to read and sign$/, ['$1 om te lees en te teken', '$1 okumele kufundwe futhi kusayinwe']],
  [/^(\d+) due this week$/, ['$1 hierdie week verskuldig', '$1 okumele kwenziwe kuleli sonto']], [/^(\d+) open$/, ['$1 oop', '$1 okuvulekile']], [/^Sign for all (\d+)$/, ['Teken vir al $1', 'Sayinela konke okungu-$1']],
  [/^Issued (.+) · replace by (.+)$/, ['Uitgereik $1 · vervang teen $2', 'Kunikezwe ngomhla ka-$1 · shintsha ngomhla ka-$2']], [/^Received (.+)$/, ['Ontvang $1', 'Kutholiwe $1']]
);
['me', 'myppe', 'mytraining', 'myinspections', 'myincidents', 'myreading', 'notifications'].forEach(k => { if (!TR_ROUTES.includes(k)) TR_ROUTES.push(k); });
// Language choice: on the employee home screen and in the person's menu
const _fieldBeforeLang = ROUTES.field;
ROUTES.field = (p, q) => { const r = _fieldBeforeLang(p, q); if (r && r.html) r.html = r.html.replace('<div class="emp-quick">', langPickHtml() + '<div class="emp-quick">'); return r; };
const _userMenuBeforeLang = ACT.userMenu;
ACT.userMenu = (el) => { _userMenuBeforeLang(el); setTimeout(() => { const d = document.querySelector('.dropdown'); if (d && !d.querySelector('.lang-pick')) d.insertAdjacentHTML('beforeend', `<div class="lang-menu">${langPickHtml()}<small>Employee screens. First-draft translations — to be checked by first-language speakers.</small></div>`); }, 0); };
// pieces of sentences built around numbers and record names
Object.assign(TR, { 'things need your attention': ['dinge vra jou aandag', 'izinto ezidinga ukunaka kwakho'], 'thing needs your attention': ['ding vra jou aandag', 'into edinga ukunaka kwakho'] });
TR_RX.push(
  [/^Acknowledge notice: (.+)$/, ['Erken kennisgewing: $1', 'Qinisekisa isaziso: $1']], [/^Read and sign: (.+)$/, ['Lees en teken: $1', 'Funda futhi usayine: $1']],
  [/^Appointment to accept: (.+)$/, ['Aanstelling om te aanvaar: $1', 'Ukuqokwa okumele kwamukelwe: $1']], [/^Confirm you received: (.+)$/, ['Teken vir ontvangs: $1', 'Sayinela ukuthi uthole: $1']],
  [/^Attend training: (.+)$/, ['Woon opleiding by: $1', 'Ya ekuqeqeshweni: $1']], [/^Inspect: (.+)$/, ['Inspekteer: $1', 'Hlola: $1']], [/^Acknowledge responsibility: (.+)$/, ['Erken verantwoordelikheid: $1', 'Qinisekisa umsebenzi: $1']],
  [/^From (.+) · (.+)$/, ['Van $1 · $2', 'Kusuka ku-$1 · $2']], [/^(.+) · overdue since (.+)$/, ['$1 · agterstallig sedert $2', '$1 · sekwedlule kusukela ngomhla ka-$2']],
  [/^Issued (.+) — read it and respond$/, ['Uitgereik $1 — lees en antwoord', 'Kukhishwe ngomhla ka-$1 — kufunde bese uphendula']], [/^Due (.+)$/, ['Verskuldig $1', 'Kufanele ngomhla ka-$1']]);
