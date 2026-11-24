/* ==========================================================================
   Legal texts from the owner's documents (Nov 2026)
   - LEGAL_TEXTS (legal-texts.js) holds the wording of 44 documents as extracted
     from the PDFs the owner provided. The wording is not stored in the
     browser's saved data: it is attached to the library entries when the page
     loads, so only the checking status and the company's choices are saved.
   - Legal library: documents grouped by subject (e.g. Asbestos: regulations,
     amendment, guide), with their kind (regulations, amendment, draft,
     guidance, form …), status, notice and gazette, and how reliable the copy
     is (Gazette copy, scanned/OCR, publisher reproduction, unofficial copy).
   - Checking: a competent person compares each regulation with the original
     and marks it checked, or records a difference. Nothing is corrected
     automatically.
   - Identifying what applies: "Select what applies" on regulations in force
     lists every regulation (and every amendment to it) with a tick box; the
     ticked ones become requirements in the legal register, linked to the
     wording. Drafts, guidance and references cannot be selected.
   ========================================================================== */
'use strict';

const LTX = typeof LEGAL_TEXTS === 'object' ? LEGAL_TEXTS : {};
const LTX_TONE = { Regulations: 'green', Amendment: 'amber', Correction: 'grey', Exemption: 'amber', Direction: 'blue', 'Incorporated standard': 'blue', Form: 'grey', Draft: 'red', Guidance: 'purple', Reference: 'grey' };
const LTX_SELECTABLE = ['Regulations', 'Direction', 'Incorporated standard'];
const LTX_FAMILY = { 'LEG-ASB': 'Asbestos', 'LEG-COC': 'Certificates of competency', 'LEG-LEPC': 'Lifts, escalators and passenger conveyors', 'LEG-DMR': 'Driven machinery and lifting equipment', 'LEG-DIVE': 'Diving', 'LEG-CR': 'Construction',
  'LEG-GMR': 'General machinery', 'LEG-PER': 'Pressure equipment', 'LEG-EIR': 'Electrical installations', 'LEG-EMR': 'Electrical machinery', 'LEG-ERG': 'Ergonomics', 'LEG-MHI': 'Major hazard installations', 'LEG-EXP': 'Explosives', 'LEG-FAC': 'Facilities',
  'LEG-GSR': 'General safety', 'LEG-GAR': 'General administration', 'LEG-HBA': 'Hazardous biological agents', 'LEG-CHILD': 'Hazardous work by children', 'LEG-LEAD': 'Lead', 'LEG-NOISE': 'Noise', 'LEG-PHYS': 'Physical agents', 'LEG-HCA': 'Hazardous chemical agents', 'LEG-GHS': 'Chemical classification (international)' };
// demonstration placeholders that the real documents replace
const LTX_REPLACES = { 'LEG-GSR': 'LT-GSR', 'LEG-GAR': 'LT-GAR', 'LEG-FAC': 'LT-FAC', 'LEG-EIR': 'LT-EIR', 'LEG-HCA': 'LT-HCA', 'LEG-ERG': 'LT-ERG', 'LEG-CR': 'LT-CR' };
const ltxMeta = l => l && l.ltx ? LTX[l.ltx] : null;
const ltxAmendments = id => Object.values(LTX).filter(m => m.amends === id);
const ltxRelated = id => Object.values(LTX).filter(m => m.relates === id);

/* ---------- loading: one library entry per document; the wording is attached, not saved ---------- */
MIGRATIONS.push(() => {
  if (S.migr && S.migr.ltx1) return; S.migr = S.migr || {}; S.migr.ltx1 = true; S.legislation = S.legislation || [];
  Object.values(LTX).forEach(m => { if (byId('legislation', m.id)) return;
    S.legislation.push({ id: m.id, ltx: m.id, family: m.leg, name: m.name, short: m.short, type: m.kind === 'Regulations' ? 'Regulations' : m.kind, status: m.kind === 'Draft' ? 'Draft' : 'Current', sourceUrl: '', notes: '', verifiedOn: '', verifiedBy: '',
      items: (m.items || []).map(i => ({ id: i.id, ref: i.ref, title: i.title, page: i.page })) }); });
  Object.entries(LTX_REPLACES).forEach(([old, nu]) => { const d = byId('legislation', old); if (d && !d.ltx) { d.hidden = true; d.replacedBy = nu; }
    (S.legalReqs || []).forEach(r => { if (r.leg === old) { r.leg = nu; r.item = r.item && (byId('legislation', nu).items || []).some(i => i.id === r.item) ? r.item : null; } }); });
});
let LTX_HYDRATED = null;
function ltxHydrate() { if (!S || !S.legislation || LTX_HYDRATED === S) return; LTX_HYDRATED = S;
  S.legislation.forEach(l => { const m = ltxMeta(l); if (!m) return; const map = {}; (m.items || []).forEach(i => { map[i.id] = i.text; });
    const pg = {}; (m.items || []).forEach(i => { pg[i.id] = i.page; });
    (l.items || []).forEach(it => { if (map[it.id] != null) { Object.defineProperty(it, 'text', { value: map[it.id], enumerable: false, configurable: true, writable: true });
      Object.defineProperty(it, 'source', { value: `${m.file || m.name}, page ${pg[it.id]} — ${m.copyNote}`, enumerable: false, configurable: true, writable: true }); } }); }); }
const _rerenderBeforeLtx = rerender;
rerender = function (...a) { try { ltxHydrate(); } catch (e) { console.error(e); } return _rerenderBeforeLtx.apply(this, a); };

/* ---------- Legal library ---------- */
const LTX_FLT = { q: '', kind: '' };
const ltxChecked = l => (l.items || []).filter(i => i.verifiedOn).length;
libraryHtml = function () {
  const L = (S.legislation || []).filter(l => !l.hidden), fams = {};
  L.forEach(l => { const f = l.family || 'OTHER'; (fams[f] = fams[f] || []).push(l); });
  const kinds = [...new Set(L.map(l => (ltxMeta(l) || {}).kind || l.type))].sort();
  const q = LTX_FLT.q.toLowerCase(), match = l => (!LTX_FLT.kind || ((ltxMeta(l) || {}).kind || l.type) === LTX_FLT.kind) && (!q || (l.name + ' ' + (l.short || '') + ' ' + (LTX_FAMILY[l.family] || '')).toLowerCase().includes(q));
  const order = ['Regulations', 'Direction', 'Amendment', 'Correction', 'Exemption', 'Incorporated standard', 'Form', 'Guidance', 'Draft', 'Reference'];
  const row = l => { const m = ltxMeta(l), items = (l.items || []).filter(i => i.ref !== 'Notice'), used = (S.legalReqs || []).filter(r => r.leg === l.id && r.org === S.ui.org).length, ck = ltxChecked(l), kind = m ? m.kind : l.type;
    return `<tr class="rowlink" data-href="#/legal/lib/${l.id}"><td data-label="Document"><b>${esc(l.name)}</b><div class="t-sub">${m ? [m.notice, m.date ? fmt(m.date) : '', m.gazette ? 'Gazette ' + m.gazette : ''].filter(Boolean).map(esc).join(' · ') : (l.notes ? esc(l.notes).slice(0, 80) : '')}</div></td>
      <td data-label="Kind">${badge(kind, LTX_TONE[kind] || 'grey', true)}</td><td data-label="Status">${esc(m ? m.status : l.status)}</td>
      <td data-label="Copy">${m ? `<span class="${['unofficial', 'reproduction', 'gazette-ocr'].includes(m.copy) ? 'due amber' : 't-sub'}">${esc(m.copyNote)}</span>` : '<span class="t-sub">Demonstration entry</span>'}</td>
      <td data-label="Checked">${items.length ? `${ck} of ${(l.items || []).length}` : '—'}</td><td data-label="Used by">${used || '—'}</td></tr>`; };
  const fkeys = Object.keys(fams).sort((a, b) => (LTX_FAMILY[a] || a).localeCompare(LTX_FAMILY[b] || b));
  const body = fkeys.map(f => { const list = fams[f].filter(match).sort((a, b) => order.indexOf((ltxMeta(a) || {}).kind || 'Regulations') - order.indexOf((ltxMeta(b) || {}).kind || 'Regulations')); if (!list.length) return '';
    return `<tr class="fam-row"><td colspan="6">${esc(LTX_FAMILY[f] || (f === 'LEG-OHSA' ? 'Occupational Health and Safety Act' : f === 'OTHER' ? 'Other' : (byId('legislation', f) || {}).name || f))}</td></tr>${list.map(row).join('')}`; }).join('');
  const nDocs = Object.keys(LTX).length, nItems = L.reduce((n, l) => n + (l.ltx ? (l.items || []).length : 0), 0), nCk = L.reduce((n, l) => n + (l.ltx ? ltxChecked(l) : 0), 0);
  return `<div class="alert info">${icon('lock')}<div><b>${nDocs} documents loaded from the owner's uploads</b> — ${nItems} regulations, annexures and notices; ${nCk} checked against the original so far. The wording is as extracted from each document and is not paraphrased. A competent person checks every regulation against the original before it is used; drafts, guidance and references cannot be used in a register. The OHS Act itself and the Driven Machinery Regulations, 2015 have not been uploaded yet.</div></div>
  <div class="card"><div class="toolbar flt-bar"><div class="search">${icon('search', 'sm')}<input type="search" id="ltxQ" placeholder="Search legislation, e.g. asbestos, noise, construction" value="${esc(LTX_FLT.q)}" aria-label="Search the legal library"></div>
    <select id="ltxKind" aria-label="Kind"><option value="">All kinds</option>${kinds.map(k => `<option ${LTX_FLT.kind === k ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select></div>
  <div class="card-body flush"><div class="table-wrap"><table class="tbl stackable ltx-lib"><thead><tr><th>Document</th><th>Kind</th><th>Status</th><th>Copy</th><th>Checked</th><th>Used by</th></tr></thead><tbody>${body || '<tr><td colspan="6" class="muted">Nothing matches.</td></tr>'}</tbody></table></div></div></div>`;
};
document.addEventListener('input', e => { if (e.target && e.target.id === 'ltxQ') { LTX_FLT.q = e.target.value; clearTimeout(LTX_FLT.t); LTX_FLT.t = setTimeout(() => { rerender(); const i = document.getElementById('ltxQ'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 250); } });
document.addEventListener('change', e => { if (e.target && e.target.id === 'ltxKind') { LTX_FLT.kind = e.target.value; rerender(); } });

/* ---------- one document ---------- */
const _legDetailBeforeLtx = legislationDetail;
legislationDetail = function (id) { const l = byId('legislation', id), m = ltxMeta(l); if (!m) return _legDetailBeforeLtx(id);
  const items = l.items || [], ams = ltxAmendments(m.id), rel = ltxRelated(m.id), canSel = LTX_SELECTABLE.includes(m.kind) && canLegal(), parent = m.amends ? LTX[m.amends] : m.relates ? LTX[m.relates] : null;
  const amFor = ref => ams.flatMap(a => (a.items || []).filter(i => i.ref === ref).map(i => ({ a, i })));
  const warn = { unofficial: 'This is an unofficial retyped copy, not the Government Gazette. Check every regulation against the Gazette, and replace this copy with the Gazette when you have it.', reproduction: 'This is a publisher\'s reproduction of the Gazette. Its text layer can contain recognition errors (for example "(e)" printed as "(c)"). Check every regulation against the printed page.', 'gazette-ocr': 'This document is scanned. Its text was read by OCR (character recognition) and will contain errors. Check every regulation against the scanned page before use.' }[m.copy];
  const html = `${pageHead(esc(l.name), `${badge(m.kind, LTX_TONE[m.kind] || 'grey', true)} · ${esc(m.status)}${m.notice ? ' · ' + esc(m.notice) : ''}${m.date ? ' · ' + fmt(m.date) : ''}${m.gazette ? ' · Gazette ' + esc(m.gazette) : ''}`, canSel ? `<button class="btn primary" data-act="ltxSelect" data-id="${l.id}">${icon('check', 'sm')} Select what applies</button>` : '')}
    ${m.kind === 'Draft' ? `<div class="alert danger">${icon('alert')}<div><b>Draft — not in force.</b> Published for public comment. It cannot be used in a client's register. Keep it to prepare for the changes.</div></div>` : ''}
    ${['Guidance', 'Reference'].includes(m.kind) ? `<div class="alert info">${icon('info')}<div><b>${esc(m.kind)} — not legislation.</b> Use it to understand and apply the regulations; it cannot be selected as a legal requirement.</div></div>` : ''}
    ${warn ? `<div class="alert warn">${icon('alert')}<div>${esc(warn)}</div></div>` : ''}
    <div class="card mb"><div class="card-body" style="padding-top:14px"><div class="kv"><div>Source document</div><div>${esc(m.file || '—')}</div><div>Copy</div><div>${esc(m.copyNote)}</div><div>Checked</div><div>${ltxChecked(l)} of ${items.length} part(s) checked against the original${l.verifiedOn ? ` · all checked ${fmt(l.verifiedOn)} by ${esc(pname(l.verifiedBy))}` : ''}</div>
      ${parent ? `<div>Belongs to</div><div><a href="#/legal/lib/${parent.id}">${esc(parent.name)}</a></div>` : ''}${ams.length ? `<div>Amended by</div><div>${ams.map(a => `<a href="#/legal/lib/${a.id}">${esc(a.notice || a.short)}${a.date ? ' (' + fmt(a.date) + ')' : ''}</a>`).join(', ')}</div>` : ''}${rel.length ? `<div>Related</div><div>${rel.map(a => `<a href="#/legal/lib/${a.id}">${esc(a.short)}</a>`).join(', ')}</div>` : ''}</div></div></div>
    ${m.notext ? `<div class="card">${emptyList('Catalogued only — this international reference is too long to load as text in the prototype.')}</div>` : items.map(it => { const am = amFor(it.ref), used = (S.legalReqs || []).filter(r => r.item === it.id && r.org === S.ui.org);
      return `<div class="card mb ltx-item" id="${it.id}"><div class="card-head"><div><h2>${esc(it.ref)}${it.title ? ' — ' + esc(it.title) : ''}</h2><span class="ch-sub">Page ${it.page} of the source${it.verifiedOn ? ` · checked ${fmt(it.verifiedOn)} by ${esc(pname(it.verifiedBy))}` : ''}${it.diff ? ' · difference reported' : ''}</span></div>
        <div class="btn-row">${it.verifiedOn ? badge('Checked', 'green', true) : badge('To check', 'amber', true)}${canLegal() ? `<button class="btn sm" data-act="ltxCheck" data-id="${l.id}" data-i="${it.id}">${it.verifiedOn ? 'Re-check' : 'Check against original'}</button>` : ''}</div></div>
        <div class="card-body"><blockquote class="legal-text">${esc(it.text || '')}</blockquote>
        ${(() => { const src = (m.items || []).find(x => x.id === it.id); return src && src.note ? `<p class="t-sub">${icon('info', 'sm')} ${esc(src.note)}</p>` : ''; })()}
        ${it.diff ? `<div class="alert warn" style="margin:8px 0 0">${icon('alert')}<div><b>Difference reported</b> (${fmt(it.diff.on)}, ${esc(pname(it.diff.by))}): ${esc(it.diff.note)}</div></div>` : ''}
        ${am.map(({ a, i }) => `<div class="ltx-amend"><b>Amended by ${esc(a.notice || '')}${a.date ? ' of ' + fmt(a.date) : ''}</b> <a href="#/legal/lib/${a.id}">open the amendment</a><blockquote class="legal-text">${esc(i.text)}</blockquote></div>`).join('')}
        ${used.length ? `<p class="t-sub">In the register: ${used.map(r => `<a href="#/legal/${r.id}">${r.id}</a> (${esc(r.applicability)})`).join(', ')}</p>` : ''}</div></div>`; }).join('')}
    ${ams.length ? ams.map(a => (a.items || []).filter(i => i.ref !== 'Notice' && !items.some(x => x.ref === i.ref)).map(i => `<div class="card mb ltx-item"><div class="card-head"><div><h2>${esc(i.ref)}${i.title ? ' — ' + esc(i.title) : ''}</h2><span class="ch-sub">Inserted by ${esc(a.notice || a.short)}${a.date ? ' of ' + fmt(a.date) : ''}</span></div><a class="btn sm" href="#/legal/lib/${a.id}">Open the amendment</a></div><div class="card-body"><blockquote class="legal-text">${esc(i.text)}</blockquote></div></div>`).join('')).join('') : ''}`;
  return { title: l.short || l.name, nav: 'legal', crumbs: [['Legal Requirements', '#/legal'], ['Legal library', '#/legal/library'], [l.short || l.name, '#']], html }; };

ACT.ltxCheck = (el) => { const l = byId('legislation', el.dataset.id), it = l.items.find(x => x.id === el.dataset.i), m = ltxMeta(l);
  openModal({ title: `Check ${it.ref} against the original`, sub: `${l.name} · page ${it.page} of ${m.file}`, size: 'wide', body: `<blockquote class="legal-text" style="max-height:260px;overflow:auto">${esc(it.text || '')}</blockquote>
    <div class="form-grid">${fld({ name: 'ok', label: `I compared this with page ${it.page} of the original and the wording is exact`, type: 'checkbox', full: true })}${fld({ name: 'diff', label: 'Or describe the difference found (the wording is not changed here — correct it in the source document)', type: 'textarea', full: true, value: it.diff ? it.diff.note : '' })}</div>`,
    buttons: [{ label: 'Save', cls: 'primary', onClick: mm => { const v = readForm(mm); if (!v.ok && !v.diff) { toast('Tick that the wording is exact, or describe the difference.', 'error'); return false; }
      if (v.ok) { it.verifiedOn = TODAY; it.verifiedBy = S.ui.user; delete it.diff; } else { it.diff = { note: v.diff, on: TODAY, by: S.ui.user }; delete it.verifiedOn; delete it.verifiedBy; }
      if ((l.items || []).every(i => i.verifiedOn)) { l.verifiedOn = TODAY; l.verifiedBy = S.ui.user; } else { l.verifiedOn = ''; l.verifiedBy = ''; }
      log(`${v.ok ? 'Checked' : 'Reported a difference in'} ${it.ref} of ${l.short || l.name}`, '#/legal/lib/' + l.id); save(); rerender(); } }] }); };

/* ---------- identifying what applies ---------- */
ACT.ltxSelect = (el) => { const l = byId('legislation', el.dataset.id), m = ltxMeta(l), ams = ltxAmendments(m.id);
  const parts = (l.items || []).filter(i => i.ref !== 'Notice').map(i => ({ leg: l.id, it: i, label: `${i.ref}${i.title ? ' — ' + i.title : ''}` }))
    .concat(ams.flatMap(a => { const al = byId('legislation', a.id); return al ? (al.items || []).filter(i => i.ref !== 'Notice' && !(l.items || []).some(x => x.ref === i.ref)).map(i => ({ leg: al.id, it: i, label: `${i.ref}${i.title ? ' — ' + i.title : ''} (inserted by ${a.notice || a.short})` })) : []; }));
  const inReg = (p) => (S.legalReqs || []).find(r => r.org === S.ui.org && r.item === p.it.id);
  openModal({ title: `Select what applies — ${l.short || l.name}`, sub: `Tick every regulation that applies to ${esc((orgOf(S.ui.org) || {}).name || 'the company')}. Each ticked regulation becomes a requirement in the legal register, linked to its wording. You decide, as the competent person — there is no questionnaire.`, size: 'wide',
    body: `<div class="btn-row mb"><button type="button" class="btn sm" data-act="ltxAll">Tick all</button><button type="button" class="btn sm" data-act="ltxNone">Clear</button></div>
      <div class="chk-col ltx-pick" style="max-height:46vh">${parts.map((p, k) => { const r = inReg(p); return `<label class="check"><input type="checkbox" name="lp${k}" ${r ? 'checked disabled' : ''}> <span>${esc(p.label)}${r ? ` <span class="t-sub">— already in the register (${r.id}, ${esc(r.applicability)})</span>` : ''}${p.it.verifiedOn ? '' : ' <span class="t-sub">· wording not checked yet</span>'}</span></label>`; }).join('')}</div>
      <div class="form-grid mt-s">${fld({ name: 'setup', label: 'Also set up the suggested compliance work for each ticked regulation (system interpretation — you can change it later)', type: 'checkbox', value: true, full: true })}${fld({ name: 'owner', label: 'Responsible person', type: 'select', options: personOptions(S.ui.user, x => !!x.sysRole) })}${fld({ name: 'na', label: 'Record the regulations that are not ticked as "Not applicable" (keeps a record of the decision)', type: 'checkbox', full: true })}${fld({ name: 'reason', label: 'Reason for not applicable (optional)', full: true })}</div>`,
    buttons: [{ label: 'Add to the register', cls: 'primary', onClick: mm => { const v = readForm(mm); S.legalReqs = S.legalReqs || []; let a = 0, n = 0;
      parts.forEach((p, k) => { if (inReg(p)) return; const on = mm.querySelector(`[name=lp${k}]`).checked; if (!on && !v.na) return;
        const ob = typeof LEGAL_OBLIGATIONS === 'object' ? LEGAL_OBLIGATIONS[p.it.id] : null;
        const r = { id: nextId('LR-', 'legalReqs'), org: S.ui.org, leg: p.leg, item: p.it.id, title: `${l.short || l.name}: ${p.it.ref.replace('Regulation ', 'reg. ')}${p.it.title ? ' — ' + p.it.title : ''}`, description: ob ? ob.summary : '', mustDo: ob ? ob.mustDo : '', evidenceReq: ob ? ob.evidence.slice() : [], sites: ['ALL'], owner: on ? v.owner || '' : '',
          applicability: on ? 'Applicable' : 'Not applicable', applicReason: on ? 'Selected by the competent person' : (v.reason || 'Not ticked when the regulations were selected'), evidence: [], assessments: [], created: TODAY, createdBy: S.ui.user, fromLibrary: true };
        S.legalReqs.push(r); on ? a++ : n++;
        if (on && v.setup && ob) ob.work.forEach(w => ctCreate(r, w, r.owner || S.ui.user, addDays(TODAY, 30))); });
      log(`Selected ${a} applicable regulation(s) from ${l.short || l.name}${n ? ` (${n} recorded as not applicable)` : ''}`, '#/legal/lib/' + l.id); save(); toast(`${a} requirement(s) added to the legal register${n ? `, ${n} recorded as not applicable` : ''}.`); navigate('#/legal/register?fleg=' + l.id); } }] }); };
ACT.ltxAll = () => document.querySelectorAll('.ltx-pick input:not(:disabled)').forEach(c => { c.checked = true; });
ACT.ltxNone = () => document.querySelectorAll('.ltx-pick input:not(:disabled)').forEach(c => { c.checked = false; });

/* ==========================================================================
   Keeping compliance: compliance tasks set up from the obligations
   - "Set up compliance work" on a requirement lists the system's interpretation
     of the work (appointments, training, assessments, inspections, monitoring,
     medical, documents, records, notifications, reviews). Each ticked item
     becomes a compliance task with an owner and a due date.
   - Completing a task records the date, a note and evidence; recurring tasks
     are then due again after their interval. Event-driven tasks ("when
     required") stay open as a standing duty and are recorded each time.
   - Compliance calendar: every task across the register, overdue first; owners
     get them in their task list; a requirement shows its tasks and how many are overdue.
   ========================================================================== */
const CT_LINK = { Training: '#/training/courses', Appointment: '#/people/appointments', Medical: '#/medical/types', Document: '#/documents', Notification: '', Inspection: '#/inspections', Monitoring: '', Assessment: '#/risk', Record: '', Review: '' };
const ctAll = () => (S.compTasks || []).filter(t => t.org === S.ui.org);
const ctForReq = id => ctAll().filter(t => t.req === id && t.status !== 'Stopped');
const ctOverdue = t => t.due && t.status !== 'Stopped' && daysTo(t.due) < 0;
const ctEvery = e => e === 'change' ? 'When required' : !e ? 'Once' : e % 12 === 0 ? (e === 12 ? 'Every year' : `Every ${e / 12} years`) : `Every ${e} month${e > 1 ? 's' : ''}`;
function ctCreate(r, w, owner, due) { S.compTasks = S.compTasks || []; const t = { id: nextId('CT-', 'compTasks', 4), org: r.org, req: r.id, type: w.type, what: w.what, every: w.every, owner: owner || r.owner || '', due: w.every === 'change' ? '' : due, status: 'Open', history: [], created: TODAY, by: S.ui.user }; S.compTasks.push(t); return t; }
ACT.ctSetup = (el) => { const r = byId('legalReqs', el.dataset.id), ob = LEGAL_OBLIGATIONS[r.item] || { work: [] }, have = ctForReq(r.id).map(t => t.what);
  const work = ob.work.filter(w => !have.includes(w.what));
  openModal({ title: 'Set up the compliance work', sub: `${esc(r.title)} · ${badge('System interpretation — check against the legal text', 'purple', true)}`, size: 'wide', body: `${work.length ? `<p class="t-sub" style="margin-top:0">Tick the work this company needs. Each ticked item becomes a compliance task with an owner and a due date; recurring tasks come round again automatically.</p>
    <div class="chk-col" style="max-height:none">${work.map((w, k) => `<label class="check"><input type="checkbox" name="w${k}" checked> <span>${badge(w.type, 'blue', true)} ${esc(w.what)} <span class="t-sub">· ${ctEvery(w.every)}</span></span></label>`).join('')}</div>` : '<p class="muted">All the suggested work is already set up. Add your own task below.</p>'}
    <div class="form-grid mt-s">${fld({ name: 'owner', label: 'Owner of the tasks', type: 'select', options: personOptions(r.owner || S.ui.user, x => !!x.sysRole), required: true })}${fld({ name: 'due', label: 'First due date', type: 'date', value: addDays(TODAY, 30), required: true })}
      ${fld({ name: 'own', label: 'Add your own task (optional)', full: true, placeholder: 'e.g. Quarterly ladder inspection' })}${fld({ name: 'ownType', label: 'Type', type: 'select', options: opts(Object.keys(CT_LINK), 'Inspection') })}${fld({ name: 'ownEvery', label: 'Every (months; 0 = once)', type: 'number', min: 0, value: 12 })}</div>`,
    buttons: [{ label: 'Set up', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); let n = 0;
      work.forEach((w, k) => { if (m.querySelector(`[name=w${k}]`).checked) { ctCreate(r, w, v.owner, v.due); n++; } });
      if (v.own && v.own.trim()) { ctCreate(r, { type: v.ownType, what: v.own.trim(), every: +v.ownEvery || 0 }, v.owner, v.due); n++; }
      if (n && v.owner) queueEmail([v.owner], 'actions', `Compliance tasks allocated to you: ${r.title}`, `${pname(S.ui.user)} set up ${n} compliance task(s) for ${r.id} "${r.title}". The first is due ${fmt(v.due)}.`, '#/legal/' + r.id);
      log(`Set up ${n} compliance task(s) for ${r.id}`, '#/legal/' + r.id); save(); toast(`${n} compliance task(s) set up.`); rerender(); } }] }); };
ACT.ctDone = (el) => { const t = byId('compTasks', el.dataset.id);
  openModal({ title: 'Record that it was done', sub: `${t.type}: ${t.what}`, body: `<div class="form-grid">${fld({ name: 'on', label: 'Done on', type: 'date', value: TODAY, required: true })}${fld({ name: 'note', label: 'Note (what was done, findings, reference)', type: 'textarea', full: true })}${fld({ name: 'file', label: 'Evidence (report, certificate, register)', type: 'file', full: true })}
    ${t.every && t.every !== 'change' ? `<p class="t-sub full">Next due: ${ctEvery(t.every).toLowerCase()} after the date it was done.</p>` : ''}</div>`,
    buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m);
      t.history.push({ on: v.on, by: S.ui.user, note: v.note, file: v.file || null });
      if (t.every === 'change') t.last = v.on; else if (t.every) { t.last = v.on; t.due = addMonths(v.on, t.every); } else { t.last = v.on; t.status = 'Done'; t.due = ''; }
      const r = byId('legalReqs', t.req); if (r && v.file) (r.evidence = r.evidence || []).push({ name: v.file.name, file: v.file, note: `${t.what} (${fmt(v.on)})`, by: S.ui.user, on: TODAY });
      log(`Completed compliance task ${t.id}: ${t.what}`, '#/legal/' + t.req); save(); toast(t.status === 'Done' ? 'Recorded. The task is complete.' : `Recorded.${t.due ? ' Next due ' + fmt(t.due) + '.' : ''}`); rerender(); } }] }); };
ACT.ctStop = (el) => { const t = byId('compTasks', el.dataset.id); confirmBox(`Stop "${t.what}"? Use this when it no longer applies; its history is kept.`, () => { t.status = 'Stopped'; log(`Stopped compliance task ${t.id}`, '#/legal/' + t.req); save(); rerender(); }); };
function ctTable(list, showReq) { return list.length ? `<div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Task</th>${showReq ? '<th>Requirement</th>' : ''}<th>Owner</th><th>How often</th><th>Due</th><th>Last done</th><th></th></tr></thead><tbody>${list.map(t => { const r = byId('legalReqs', t.req), link = CT_LINK[t.type];
    return `<tr class="${ctOverdue(t) ? 'row-red' : ''}"><td data-label="Task">${badge(t.type, 'blue', true)} ${esc(t.what)}${link ? ` <a class="t-sub" href="${link}">open module</a>` : ''}</td>${showReq ? `<td data-label="Requirement"><a href="#/legal/${t.req}">${t.req}</a><div class="t-sub">${esc(r ? r.title : '')}</div></td>` : ''}<td data-label="Owner">${esc(pname(t.owner) || '—')}</td><td data-label="How often">${ctEvery(t.every)}</td>
      <td data-label="Due">${t.status === 'Done' ? badge('Done', 'green', true) : t.status === 'Stopped' ? badge('Stopped', 'grey', true) : t.due ? dueText(t.due) : '<span class="t-sub">When required</span>'}</td><td data-label="Last done">${t.last ? fmt(t.last) : '—'}</td>
      <td data-label="">${t.status === 'Open' && (canLegal() || t.owner === S.ui.user) ? `<div class="btn-row nowrap"><button class="btn sm primary" data-act="ctDone" data-id="${t.id}">Record done</button>${canLegal() ? `<button class="btn sm ghost" data-act="ctStop" data-id="${t.id}" title="No longer applies">Stop</button>` : ''}</div>` : ''}</td></tr>`; }).join('')}</tbody></table></div>` : ''; }
// on the requirement page: the obligations and the compliance tasks
const _legalRouteBeforeCt = ROUTES.legal;
ROUTES.legal = (p, q) => { const r = _legalRouteBeforeCt(p, q);
  if (r && r.html && p[0] && /^LR-/.test(p[0])) { const req = byId('legalReqs', p[0]); if (!req || req.org !== S.ui.org) return r;
    const T = ctForReq(req.id), od = T.filter(ctOverdue).length, ob = LEGAL_OBLIGATIONS[req.item];
    const card = `<div class="card ct-card"><div class="card-head"><h2>Keeping compliance</h2><span class="ch-sub">${T.length} compliance task(s)${od ? ` · <span class="due red">${od} overdue</span>` : ''}</span>${canLegal() && req.applicability === 'Applicable' ? `<button class="btn sm primary" data-act="ctSetup" data-id="${req.id}">${icon('plus', 'sm')} Set up compliance work</button>` : ''}</div>
      <div class="card-body${T.length ? ' flush' : ''}">${T.length ? ctTable(T, false) : `<p class="muted" style="margin:0">${req.applicability !== 'Applicable' ? 'Not applicable — no compliance work needed.' : ob ? `${ob.work.length} item(s) of work are suggested for this regulation (system interpretation). Use "Set up compliance work".` : 'No suggested work for this regulation yet — add your own with "Set up compliance work".'}</p>`}</div></div>`;
    r.html = r.html.replace('<div class="card"><div class="card-head"><h2>Evidence</h2>', card + '<div class="card"><div class="card-head"><h2>Evidence</h2>'); }
  return r; };
// tasks for the owner
const _myTasksBeforeCt = myTasks;
myTasks = function () { const out = _myTasksBeforeCt(); if (isFieldUser()) return out;
  ctAll().filter(t => t.status === 'Open' && t.owner === S.ui.user && t.due && daysTo(t.due) <= 14).forEach(t => out.push({ title: `Compliance: ${t.what}`, sub: `${t.req} · ${daysTo(t.due) < 0 ? 'overdue since ' + fmt(t.due) : 'due ' + fmt(t.due)}`, link: '#/legal/' + t.req, sev: daysTo(t.due) < 0 ? 'red' : 'amber' }));
  return out; };
// the compliance calendar
ROUTES.compliance = (p, q = {}) => { const all = ctAll().filter(t => t.status !== 'Stopped'), f = q.f || 'open';
  const list = (f === 'overdue' ? all.filter(ctOverdue) : f === 'month' ? all.filter(t => t.status === 'Open' && t.due && daysTo(t.due) <= 31) : f === 'all' ? all : all.filter(t => t.status === 'Open')).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
  const html = `${pageHead('Compliance calendar', 'Everything the company does to keep compliance with the regulations it selected: assessments, inspections, monitoring, medical surveillance, training, appointments, documents and reviews — who does it and when it is due.', '', scopePill())}
    <div class="kpis">${kpi('Overdue', all.filter(ctOverdue).length, 'Past the due date', all.some(ctOverdue) ? 'red' : 'green', '#/compliance?f=overdue', 'alert')}${kpi('Due in 31 days', all.filter(t => t.status === 'Open' && t.due && daysTo(t.due) >= 0 && daysTo(t.due) <= 31).length, 'Coming up', 'amber', '#/compliance?f=month', 'clock')}${kpi('Open tasks', all.filter(t => t.status === 'Open').length, `${all.filter(t => t.every === 'change' && t.status === 'Open').length} when required`, 'blue', '#/compliance', 'tasks')}${kpi('Requirements covered', new Set(all.map(t => t.req)).size, `of ${legalReqs().filter(r => r.applicability === 'Applicable').length} applicable`, 'blue', '#/legal/register', 'scale')}</div>
    <div class="card"><div class="toolbar"><div class="btn-row">${[['open', 'Open'], ['overdue', 'Overdue'], ['month', 'Next 31 days'], ['all', 'All, incl. done']].map(([k, l]) => `<a class="btn sm ${f === k ? 'primary' : ''}" href="#/compliance?f=${k}">${l}</a>`).join('')}</div></div>
    <div class="card-body flush">${list.length ? ctTable(list, true) : emptyList(all.length ? 'Nothing in this view.' : 'No compliance tasks yet. Select the regulations that apply in the legal library, then use "Set up compliance work" on each requirement.')}</div></div>`;
  return { title: 'Compliance calendar', nav: 'compliance', crumbs: [['Compliance calendar', '#/compliance']], html }; };
(() => { const g = NAV.find(x => x.group === 'Compliance'); if (g && !g.items.some(i => i[0] === 'compliance')) { const k = g.items.findIndex(i => i[0] === 'legal'); g.items.splice(k + 1, 0, ['compliance', 'Compliance Calendar', 'clock']); } })();
AREA_OF.compliance = 'area.legal'; if (!TOP_ROUTES.includes('compliance')) TOP_ROUTES.push('compliance');
