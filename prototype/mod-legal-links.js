/* ==========================================================================
   The modules feed the legal register
   1. Link at the source: documents, risk assessments, appointments, training
      courses, inspection schedules, medical examination types and emergency
      drills carry "Legal requirements this supports" (rec.legalReqs). They can
      be linked from the record or from the requirement, with suggestions.
   2. Evidence from the system: each requirement lists every linked record with
      its current state (e.g. "Issued Rev 3 · review due 18 May 2027").
   3. Evidence gaps: linked evidence that is missing, obsolete, not issued,
      expired, overdue for review or not in order, and overdue compliance
      tasks, show as an evidence gap. A requirement assessed "Compliant" with
      an evidence gap counts as "Partially compliant" until the gap is closed,
      so the legal compliance figure on the dashboard reflects it.
   4. Link evidence also takes risk assessments, training records and PPE issues.
   ========================================================================== */
'use strict';

const LK_KINDS = {
  'Document': { coll: 'documents', href: '#/documents/', live: true,
    list: () => S.documents.filter(d => inSite(d, 'ALL') && docActive(d)),
    title: d => `${d.number} ${d.title}`,
    state: d => { if (!docActive(d)) return { text: docStatus(d), gap: 'document is ' + docStatus(d).toLowerCase() }; const is = docIssued(d);
      if (!is) return { text: 'Not issued yet (' + docStatus(d) + ')', gap: 'document not issued yet' };
      if (docReviewOverdue(d)) return { text: `Issued Rev ${is.rev} · review overdue since ${fmt(d.nextReview)}`, gap: 'document review overdue' };
      return { text: `Issued Rev ${is.rev}${d.nextReview ? ' · review due ' + fmt(d.nextReview) : ''}` }; } },
  'Risk assessment': { coll: 'riskAssessments', href: '#/risk/', live: true,
    list: () => (S.riskAssessments || []).filter(a => a.org === S.ui.org && a.status !== 'Superseded'),
    current: a => { let x = a, n = 0; while (x && x.status === 'Superseded' && x.supersededBy && n++ < 20) x = byId('riskAssessments', x.supersededBy) || x; return x; },
    title: a => `${a.id} ${a.title}`,
    state: a => { const st = raStatus(a); if (st === 'Approved') return { text: `Approved${a.reviewDate ? ' · review due ' + fmt(a.reviewDate) : ''}` };
      if (st === 'Review overdue') return { text: `Review overdue since ${fmt(a.reviewDate)}`, gap: 'risk assessment review overdue' };
      return { text: st, gap: 'risk assessment not approved yet' }; } },
  'Appointment': { coll: 'appointments', href: '#/people/', live: true,
    list: () => (S.appointments || []).filter(a => a.org === S.ui.org && !['Draft', 'Withdrawn'].includes(a.status)),
    title: a => `${a.id} ${((S.config.apptTypes || []).find(t => t.id === a.type) || {}).name || ''} — ${pname(a.person)}`,
    state: a => { const st = typeof aptStatus === 'function' ? aptStatus(a) : a.status; return st === 'Active' ? { text: `Active since ${fmt(a.effective)}` } : { text: st, gap: `appointment ${st.toLowerCase()}` }; } },
  'Training course': { coll: 'courses', href: '#/training/courses', fixedHref: true, live: true,
    list: () => (S.courses || []).filter(c => c.org === S.ui.org),
    title: c => c.name,
    state: c => { const req = (typeof trainees === 'function' ? trainees() : []).filter(pp => requiredFor(pp).some(r => r.course === c.id));
      if (!req.length) return { text: 'Nobody is required to attend yet', gap: 'no training requirement set for the course' };
      const bad = req.filter(pp => ['Missing', 'Expired', 'Not yet competent', 'Assessment outstanding'].includes(trStatus(pp.id, c.id))).length;
      return bad ? { text: `${req.length - bad} of ${req.length} people trained`, gap: `${bad} person(s) not trained` } : { text: `All ${req.length} required people trained` }; } },
  'Inspection schedule': { coll: 'schedules', href: '#/inspections/schedule', fixedHref: true, live: true,
    list: () => S.schedules.filter(s => inSite(s, 'ALL')),
    title: s => `${(byId('templates', s.template) || {}).title || 'Inspection'} — ${s.asset ? ((byId('assets', s.asset) || {}).tag || '') : s.target || ''}`,
    state: s => daysTo(s.nextDue) < 0 ? { text: `Overdue since ${fmt(s.nextDue)}`, gap: 'inspection overdue' } : { text: `Next due ${fmt(s.nextDue)}` } },
  'Medical examination type': { coll: 'medReqs', href: '#/medical/types', fixedHref: true, live: true,
    list: () => (S.medReqs || []).filter(r => r.org === S.ui.org),
    title: r => r.name,
    state: r => { if (typeof medFor !== 'function') return { text: '' }; const ppl = S.people.filter(pp => pp.org === S.ui.org && pp.status !== 'Deactivated' && (r.jobTitles || []).includes(pp.jobTitle));
      const bad = ppl.filter(pp => ['Missing', 'Overdue', 'Unfit'].includes(medStatus(pp.id, r.id))).length;
      return !ppl.length ? { text: 'No job titles require it yet' } : bad ? { text: `${ppl.length - bad} of ${ppl.length} examined and current`, gap: `${bad} medical examination(s) missing or overdue` } : { text: `All ${ppl.length} examined and current` }; } },
  'Emergency drill': { coll: 'drills', href: '#/emergency/', live: true,
    list: () => (S.drills || []).filter(d => d.org === S.ui.org && d.status !== 'Cancelled'),
    title: d => `${d.id} ${d.scenario} — ${sname(d.site)}`,
    state: d => typeof drillDue === 'function' && daysTo(drillDue(d.site)) < 0 ? { text: `${d.status}${d.held ? ' ' + fmt(d.held) : ''} · next drill overdue at the branch`, gap: 'emergency drill overdue' } : { text: `${d.status}${d.held ? ' ' + fmt(d.held) : ''}` } },
  // point-in-time evidence (kept on the requirement)
  'Inspection': { coll: 'inspections', href: '#/inspections/', list: () => S.inspections.filter(i => inSite(i, 'ALL')).slice(-60), title: i => `${i.id} ${(i.template && i.template.title) || ''} ${i.target || ''} (${fmt(i.date)})`, state: () => ({ text: 'Inspection record' }) },
  'Audit': { coll: 'audits', href: '#/audits/', list: () => (S.audits || []).filter(a => a.org === S.ui.org && a.status === 'Completed'), title: a => `${a.id} ${a.template.title} (${fmt(a.date)})`, state: a => ({ text: `Audit ${fmt(a.date)}${a.score ? ' · ' + a.score.pct + '%' : ''}` }) },
  'Training record': { coll: 'trainingRecs', href: '#/training/records', fixedHref: true, list: () => (S.trainingRecs || []).filter(r => r.org === S.ui.org).slice(-80), title: r => `${pname(r.person)} — ${((S.courses || []).find(c => c.id === r.course) || {}).name || r.course} (${fmt(r.date)})`,
    state: r => r.expires && daysTo(r.expires) < 0 ? { text: `Expired ${fmt(r.expires)}`, gap: 'training record expired' } : { text: r.expires ? `Valid until ${fmt(r.expires)}` : 'Training record' } },
  'PPE issue': { coll: 'ppeIssues', href: '#/ppe/issues', fixedHref: true, list: () => (S.ppeIssues || []).filter(i => i.org === S.ui.org).slice(-80), title: i => `${pname(i.person)} — ${((S.ppeTypes || []).find(t => t.id === i.ppe) || {}).name || 'PPE'} (${fmt(i.date)})`,
    state: i => typeof ppeSigned === 'function' && !ppeSigned(i) ? { text: 'Issued, not signed by the employee', gap: 'PPE issue not signed' } : { text: 'Issued and signed' } }
};
const lkHref = (k, rec) => LK_KINDS[k].fixedHref ? LK_KINDS[k].href : LK_KINDS[k].href + rec.id;
const lkKindOfColl = coll => Object.keys(LK_KINDS).find(k => LK_KINDS[k].coll === coll);

/* ---------- what is linked to a requirement ---------- */
function lkLinked(r) {
  const out = [];
  Object.entries(LK_KINDS).filter(([, K]) => K.live).forEach(([k, K]) => (S[K.coll] || []).filter(x => (x.legalReqs || []).includes(r.id)).forEach(x => { const cur = K.current ? K.current(x) : x; out.push({ kind: k, rec: cur, via: 'record', st: K.state(cur) }); }));
  (r.evidence || []).forEach((e, i) => { const k = e.kind === 'Risk assessment' ? 'Risk assessment' : e.kind; const K = LK_KINDS[k]; if (!K || !e.ref) return; let rec = byId(K.coll, e.ref); if (!rec) return; if (K.current) rec = K.current(rec);
    if (out.some(o => o.kind === k && o.rec.id === rec.id)) return; out.push({ kind: k, rec, via: 'evidence', st: K.state(rec) }); });
  return out;
}
function lkGaps(r) {
  if (!r || r.applicability !== 'Applicable') return [];
  const L = lkLinked(r), gaps = L.filter(x => x.st.gap).map(x => `${x.kind} ${LK_KINDS[x.kind].title(x.rec)}: ${x.st.gap}`);
  if (typeof ctForReq === 'function') ctForReq(r.id).filter(ctOverdue).forEach(t => gaps.push(`Compliance task overdue: ${t.what} (due ${fmt(t.due)})`));
  const any = L.length || (r.evidence || []).length; if (!any && (r.evidenceReq || []).length) gaps.push('No evidence linked yet');
  return gaps;
}
// a requirement assessed "Compliant" with an evidence gap counts as partially compliant
const _lrStatusBeforeLk = lrStatus;
lrStatus = function (r) { const s = _lrStatusBeforeLk(r); return s === 'Compliant' && lkGaps(r).length ? 'Partially compliant' : s; };

/* ---------- requirement page: evidence from the system and gaps ---------- */
const _legalBeforeLk = ROUTES.legal;
ROUTES.legal = (p, q) => { const r0 = _legalBeforeLk(p, q);
  if (r0 && r0.html && p[0] && /^LR-/.test(p[0])) { const r = byId('legalReqs', p[0]); if (!r || r.org !== S.ui.org) return r0;
    const L = lkLinked(r), gaps = lkGaps(r), assessed = _lrStatusBeforeLk(r);
    const gapBox = gaps.length && r.applicability === 'Applicable' ? `<div class="alert ${assessed === 'Compliant' ? 'danger' : 'warn'} lk-gap">${icon('alert')}<div><b>Evidence gap${gaps.length > 1 ? 's' : ''}</b>${assessed === 'Compliant' ? ' — assessed compliant, but shown as partially compliant until the gap is closed' : ''}:<ul class="plain-list">${gaps.map(g => `<li>${esc(g)}</li>`).join('')}</ul></div></div>` : '';
    const card = `<div class="card lk-card"><div class="card-head"><h2>Evidence from the system</h2><span class="ch-sub">${L.length} linked record(s) — their current state is shown live</span>${canLegal() ? `<button class="btn sm" data-act="lrEvidence" data-id="${r.id}">${icon('link', 'sm')} Link a record</button>` : ''}</div>
      <div class="card-body flush">${L.length ? `<ul class="link-list">${L.map(x => `<li><div class="ll-main"><span class="tag">${esc(x.kind)}</span> <a href="${lkHref(x.kind, x.rec)}">${esc(LK_KINDS[x.kind].title(x.rec))}</a><div class="t-sub">${esc(x.st.text || '')}${x.via === 'record' ? ' · linked on the record' : ''}</div></div>${x.st.gap ? badge('Gap', 'red', true) : badge('In order', 'green', true)}${canLegal() && x.via === 'record' ? `<button class="btn sm ghost" data-act="lkUnlink" data-k="${esc(x.kind)}" data-id="${x.rec.id}" data-r="${r.id}" title="Unlink" aria-label="Unlink">${icon('x', 'sm')}</button>` : ''}</li>`).join('')}</ul>`
        : `<div class="card-body muted">No documents, risk assessments, appointments, training, inspections, medical examinations or drills are linked yet.${lkSuggest(r).length ? ` <b>${lkSuggest(r).length} suggestion(s)</b> — use "Link a record".` : ''}</div>`}</div></div>`;
    r0.html = r0.html.replace('<div class="detail">', gapBox + '<div class="detail">').replace('<div class="card"><div class="card-head"><h2>Evidence</h2>', card + '<div class="card"><div class="card-head"><h2>Other evidence</h2>'); }
  return r0; };

/* ---------- suggestions: records whose title matches the requirement ---------- */
const LK_STOP = new Set(['regulation', 'regulations', 'requirement', 'requirements', 'health', 'safety', 'company', 'employer', 'employees', 'general', 'section', 'these', 'their', 'there', 'which', 'every', 'person', 'persons', 'other', 'shall', 'where', 'before', 'after', 'about', 'under', 'within', 'records', 'record', 'system']);
const lkWords = s => new Set(String(s || '').toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter(w => w.length >= 5 && !LK_STOP.has(w)).map(w => w.replace(/(ies|es|s)$/, '')));
function lkScore(r, kind, rec) { const a = lkWords([r.title, r.description, (r.evidenceReq || []).join(' ')].join(' ')), b = lkWords(LK_KINDS[kind].title(rec) + ' ' + (rec.category || '') + ' ' + (rec.type || ''));
  let n = 0; b.forEach(w => { if (a.has(w)) n++; });
  if (kind === 'Document' && /polic/i.test(r.title + ' ' + (r.evidenceReq || []).join(' ')) && rec.category === 'Policy') n += 2;
  if (kind === 'Risk assessment' && /risk/i.test(r.title + ' ' + (r.evidenceReq || []).join(' '))) n += 1;
  return n; }
function lkSuggest(r) { const have = new Set(lkLinked(r).map(x => x.kind + x.rec.id)), out = [];
  Object.entries(LK_KINDS).filter(([, K]) => K.live).forEach(([k, K]) => K.list().forEach(x => { if (have.has(k + x.id)) return; const s = lkScore(r, k, x); if (s >= 2) out.push({ kind: k, rec: x, s }); }));
  return out.sort((a, b) => b.s - a.s).slice(0, 8); }

/* ---------- Link evidence: every kind, suggestions first ---------- */
ACT.lrEvidence = (el) => { const r = byId('legalReqs', el.dataset.id), sug = lkSuggest(r), kinds = Object.keys(LK_KINDS).concat(['Upload a file']);
  const recOpts = k => { if (k === 'Upload a file') return ''; const K = LK_KINDS[k], sk = sug.filter(x => x.kind === k).map(x => x.rec.id);
    return opts(K.list().map(x => ({ value: x.id, label: (sk.includes(x.id) ? '★ Suggested: ' : '') + K.title(x) })).sort((a, b) => (b.label.startsWith('★') ? 1 : 0) - (a.label.startsWith('★') ? 1 : 0)), '', '— Select —'); };
  const first = sug[0] ? sug[0].kind : 'Document';
  openModal({ title: 'Link evidence', sub: `${esc(r.title)} — link the record that already exists rather than uploading a second copy. Documents, risk assessments, appointments, training courses, inspection schedules, medical examinations and drills stay linked live: their current state shows on the requirement.`, size: 'wide', body: `
    ${sug.length ? `<div class="lk-sug"><b>Suggested</b>${sug.map((x, i) => `<label class="check"><input type="checkbox" name="sg${i}"> <span><span class="tag">${esc(x.kind)}</span> ${esc(LK_KINDS[x.kind].title(x.rec))} <span class="t-sub">· ${esc(x.kind === 'Document' || LK_KINDS[x.kind].live ? (LK_KINDS[x.kind].state(x.rec).text || '') : '')}</span></span></label>`).join('')}</div>` : ''}
    <div class="form-grid">${fld({ name: 'kind', label: 'Kind of evidence', type: 'select', options: opts(kinds, first), required: true })}
    <div class="field full" id="evPick">${fld({ name: 'ref', label: 'Record', type: 'select', options: recOpts(first), full: true })}</div>
    <div class="field full hidden" id="evFile">${fld({ name: 'file', label: 'File', type: 'file', full: true })}</div>
    ${fld({ name: 'note', label: 'Note (optional)', full: true })}</div>`,
    onOpen: m => { const k = m.querySelector('[name=kind]'); k.addEventListener('change', () => { const up = k.value === 'Upload a file'; m.querySelector('#evFile').classList.toggle('hidden', !up); m.querySelector('#evPick').classList.toggle('hidden', up); if (!up) m.querySelector('[name=ref]').innerHTML = recOpts(k.value); }); },
    buttons: [{ label: 'Link', cls: 'primary', onClick: m => { const v = readForm(m); let n = 0;
      sug.forEach((x, i) => { if (m.querySelector(`[name=sg${i}]`) && m.querySelector(`[name=sg${i}]`).checked) { lkAdd(x.kind, x.rec, r.id); n++; } });
      if (v.kind === 'Upload a file' && v.file) { (r.evidence = r.evidence || []).push({ kind: 'File', file: v.file, note: v.note, by: S.ui.user, on: TODAY }); n++; }
      else if (v.kind !== 'Upload a file' && v.ref) { const K = LK_KINDS[v.kind], rec = byId(K.coll, v.ref); if (K.live) lkAdd(v.kind, rec, r.id); else (r.evidence = r.evidence || []).push({ kind: v.kind, ref: v.ref, label: K.title(rec), note: v.note, by: S.ui.user, on: TODAY }); n++; }
      if (!n) { toast('Tick a suggestion, or choose a record or file.', 'error'); return false; }
      log(`Linked ${n} evidence item(s) to ${r.id}`, '#/legal/' + r.id); save(); toast(`${n} item(s) linked.`); rerender(); } }] }); };
function lkAdd(kind, rec, rid) { rec.legalReqs = [...new Set((rec.legalReqs || []).concat(rid))]; }
ACT.lkUnlink = (el) => { const K = LK_KINDS[el.dataset.k], rec = byId(K.coll, el.dataset.id); rec.legalReqs = (rec.legalReqs || []).filter(x => x !== el.dataset.r); log(`Unlinked ${el.dataset.k} ${rec.id} from ${el.dataset.r}`, '#/legal/' + el.dataset.r); save(); rerender(); };
// evidence links for the new kinds
const _evLinkBeforeLk = evidenceLink;
evidenceLink = function (e) { const K = LK_KINDS[e.kind]; if (K && e.ref && !e.file) { const rec = byId(K.coll, e.ref); return rec ? `<a href="${lkHref(e.kind, rec)}">${esc(K.title(rec))}</a>` : esc(e.label || e.ref); } return _evLinkBeforeLk(e); };

/* ---------- 1. on the record: "Legal requirements this supports" ---------- */
function lkRecordCard(kind, rec) { const reqs = (rec.legalReqs || []).map(id => byId('legalReqs', id)).filter(r => r && r.org === S.ui.org);
  const sug = (S.legalReqs || []).filter(r => r.org === S.ui.org && r.applicability === 'Applicable' && !(rec.legalReqs || []).includes(r.id) && lkScore(r, kind, rec) >= 2).length;
  return `<div class="card lk-rec"><div class="card-head"><h2>Legal requirements this supports</h2>${canLegal() || can('doc.create') || can('risk.manage') ? `<button class="btn sm" data-act="lkFromRecord" data-k="${esc(kind)}" data-id="${rec.id}">${icon('link', 'sm')} Link${sug ? ` (${sug} suggested)` : ''}</button>` : ''}</div>
    <div class="card-body${reqs.length ? ' flush' : ''}">${reqs.length ? `<ul class="link-list">${reqs.map(r => `<li><div class="ll-main"><a href="#/legal/${r.id}">${r.id}</a> ${esc(r.title)}</div>${cbadge(lrStatus(r))}</li>`).join('')}</ul>` : `<p class="muted" style="margin:0">Not linked to a legal requirement yet. Linking shows this ${esc(kind.toLowerCase())} as evidence in the legal register, with its current state.</p>`}</div></div>`; }
ACT.lkFromRecord = (el) => { const kind = el.dataset.k, K = LK_KINDS[kind], rec = byId(K.coll, el.dataset.id);
  const reqs = (S.legalReqs || []).filter(r => r.org === S.ui.org && r.applicability === 'Applicable').map(r => ({ r, s: lkScore(r, kind, rec) })).sort((a, b) => b.s - a.s || a.r.id.localeCompare(b.r.id));
  openModal({ title: 'Legal requirements this supports', sub: `${esc(kind)}: ${esc(K.title(rec))}`, size: 'wide', body: reqs.length ? `<div class="chk-col" style="max-height:52vh">${reqs.map(({ r, s }, i) => `<label class="check"><input type="checkbox" name="lr${i}" ${(rec.legalReqs || []).includes(r.id) ? 'checked' : ''}> <span>${s >= 2 ? '<b>★ Suggested</b> · ' : ''}<b>${r.id}</b> ${esc(r.title)}</span></label>`).join('')}</div>` : '<p class="muted">No applicable legal requirements yet. Select the regulations that apply in the legal library first.</p>',
    buttons: [{ label: 'Save', cls: 'primary', onClick: m => { rec.legalReqs = reqs.filter((x, i) => m.querySelector(`[name=lr${i}]`).checked).map(x => x.r.id); log(`Linked ${kind.toLowerCase()} ${rec.id} to ${rec.legalReqs.join(', ') || 'no'} legal requirement(s)`, ''); save(); rerender(); } }] }); };
const lkInject = (html, kind, rec) => { const card = lkRecordCard(kind, rec); const k = html.lastIndexOf('</div></div>'); return k > -1 ? html.slice(0, k) + card + html.slice(k) : html + card; };
const _docsBeforeLk = ROUTES.documents;
ROUTES.documents = (p, q) => { const r = _docsBeforeLk(p, q); if (r && r.html && p[0] && /^DOC-/.test(p[0]) && !p[1]) { const d = byId('documents', p[0]); if (d) r.html = lkInject(r.html, 'Document', d); } return r; };
const _riskBeforeLk = ROUTES.risk;
ROUTES.risk = (p, q) => { const r = _riskBeforeLk(p, q); if (r && r.html && p[0] && /^RA-/.test(p[0]) && !p[1]) { const a = byId('riskAssessments', p[0]); if (a) r.html = lkInject(r.html, 'Risk assessment', a); } return r; };
const _peopleBeforeLk = ROUTES.people;
ROUTES.people = (p, q) => { const r = _peopleBeforeLk(p, q); if (r && r.html && p[0] && /^APT-/.test(p[0]) && !isFieldUser()) { const a = byId('appointments', p[0]); if (a) r.html = lkInject(r.html, 'Appointment', a); } return r; };
const _emBeforeLk = ROUTES.emergency;
ROUTES.emergency = (p, q) => { const r = _emBeforeLk(p, q); if (r && r.html && p[0] && /^DRL-/.test(p[0])) { const d = byId('drills', p[0]); if (d) r.html = lkInject(r.html, 'Emergency drill', d); } return r; };

/* ---------- register list: the evidence gap shows next to the status ---------- */
const _legalListBeforeLk = ROUTES.legal;
ROUTES.legal = (p, q) => { const r0 = _legalListBeforeLk(p, q);
  if (r0 && r0.html && (!p[0] || p[0] === 'register')) r0.html = r0.html.replace(/<tr class="rowlink" data-href="#\/legal\/(LR-\d+)"([^>]*)>/g, (m0, id) => { const g = lkGaps(byId('legalReqs', id)); return g.length ? m0.replace('class="rowlink"', 'class="rowlink lk-row-gap" title="Evidence gap: ' + esc(g.join('; ')) + '"') : m0; });
  return r0; };

/* ---------- demo links ---------- */
MIGRATIONS.push(() => { if (S.migr && S.migr.lk1) return; S.migr = S.migr || {}; S.migr.lk1 = true;
  const L = (coll, id, lr) => { const x = byId(coll, id); if (x && byId('legalReqs', lr)) x.legalReqs = [...new Set((x.legalReqs || []).concat(lr))]; };
  L('documents', 'DOC-001', 'LR-001'); L('riskAssessments', 'RA-001', 'LR-002'); L('riskAssessments', 'RA-004', 'LR-002'); L('appointments', 'APT-009', 'LR-004'); });
