/* ==========================================================================
   Workflow improvements (review of every module, Nov 2026)
   A2  Closing an incident asks which risk assessments must be reviewed; the
       request becomes a task and shows on the assessment until the review is recorded.
   A3  A hazard can be added to an existing or a new risk assessment from the hazard itself.
   A4  Hazardous substance: raise a corrective action; create its risk assessment.
   A5  A scheduled drill can be moved to another date or cancelled.
   ========================================================================== */
'use strict';

/* ---------- A2. Incident → review of the risk assessment ---------- */
const raReviewOpen = a => (a.reviewRequests || []).filter(r => !r.done);
let INC_CLOSING = null;
const _incCloseBeforeFlow = ACT.incClose;
ACT.incClose = (el) => { INC_CLOSING = el.dataset.id; return _incCloseBeforeFlow(el); };
const _rerenderBeforeFlow = rerender;
rerender = function (...a) { const r = _rerenderBeforeFlow.apply(this, a);
  if (INC_CLOSING) { const i = byId('incidents', INC_CLOSING); if (i && i.status === 'Closed') { const id = INC_CLOSING; INC_CLOSING = null; setTimeout(() => incRaPrompt(id), 80); } }
  return r; };
function incRaPrompt(incId) {
  const i = byId('incidents', incId); if (!i) return;
  const linked = new Set((S.hazards || []).filter(h => h.incident === i.id).flatMap(h => h.assessments || []));
  const ras = (S.riskAssessments || []).filter(a => a.org === (siteOrgOf(i.site)) && a.status !== 'Superseded' && (a.site === i.site || linked.has(a.id)))
    .sort((x, y) => (linked.has(y.id) - linked.has(x.id)) || x.id.localeCompare(y.id));
  if (!ras.length) return;
  openModal({ title: 'Review the risk assessments?', sub: `${i.id} is closed. An incident is a reason to check that the risk assessment for the activity is still right.`,
    body: `<p class="t-sub" style="margin-top:0">Tick the assessments to review. The assessor gets a task; the review is recorded on the assessment ("After an incident").</p><div class="chk-col">${ras.map(a => `<label class="check"><input type="checkbox" name="ra_${a.id}" ${linked.has(a.id) ? 'checked' : ''}> <span><b>${a.id}</b> ${esc(a.title)} <span class="t-sub">· ${esc(sname(a.site))}${linked.has(a.id) ? ' · linked through a hazard from this incident' : ''}</span></span></label>`).join('')}</div>`,
    buttons: [{ label: 'Request review', cls: 'primary', onClick: m => { const pick = ras.filter(a => m.querySelector(`[name=ra_${a.id}]`).checked); if (!pick.length) { toast('Tick at least one, or choose "Not now".', 'error'); return false; }
      pick.forEach(a => { (a.reviewRequests = a.reviewRequests || []).push({ reason: 'After an incident', ref: i.id, on: TODAY, by: S.ui.user, done: false });
        queueEmail([a.assessor], 'actions', `Review risk assessment ${a.id} after incident ${i.id}`, `Incident ${i.id} "${i.title}" was closed. Please review risk assessment ${a.id} "${a.title}" and record the review.`, '#/risk/' + a.id); });
      log(`Requested review of ${pick.map(a => a.id).join(', ')} after ${i.id}`, '#/incidents/' + i.id); save(); toast(`Review requested for ${pick.length} risk assessment(s).`); rerender(); } }] });
}
// the assessment shows the request; "Record review" is filled in from it
const _riskBeforeFlow = ROUTES.risk;
ROUTES.risk = (p, q) => { const r = _riskBeforeFlow(p, q);
  if (r && r.html && p[0] && /^RA-/.test(p[0]) && !p[1]) { const a = byId('riskAssessments', p[0]), open = a ? raReviewOpen(a) : [];
    if (open.length && a.status !== 'Superseded') r.html = r.html.replace('<div class="detail">', `<div class="alert warn">${icon('refresh')}<div><b>Review requested:</b> ${open.map(x => `${esc(x.reason)}${x.ref ? ` (<a href="#/incidents/${x.ref}">${x.ref}</a>)` : ''} on ${fmt(x.on)}`).join('; ')}. ${canRisk() ? `<button class="btn sm primary" data-act="raReview" data-id="${a.id}">Record the review</button>` : ''}</div></div><div class="detail">`); }
  if (r && r.html && p[0] && /^HZ-/.test(p[0]) && canRisk()) { const h = byId('hazards', p[0]);
    if (h) { r.html = r.html.replace('<div class="sh-actions">', `<div class="sh-actions"><button class="btn primary" data-act="hzToRa" data-id="${h.id}">${icon('plus', 'sm')} Add to a risk assessment</button>`)
      .replace('Not assessed yet — add it to a risk assessment.', `Not assessed yet. <button class="btn sm" data-act="hzToRa" data-id="${h.id}">${icon('plus', 'sm')} Add to a risk assessment</button>`); } }
  return r; };
const _raReviewBeforeFlow = ACT.raReview;
ACT.raReview = (el) => { const a = byId('riskAssessments', el.dataset.id), open = raReviewOpen(a); _raReviewBeforeFlow(el);
  if (open.length) setTimeout(() => { const m = document.querySelector('.modal'); if (!m) return; const rs = m.querySelector('[name=reason]'), rf = m.querySelector('[name=ref]'); if (rs) rs.value = open[0].reason; if (rf && open[0].ref) { if (![...rf.options].some(o => o.value === open[0].ref)) rf.insertAdjacentHTML('beforeend', `<option value="${open[0].ref}">${open[0].ref}</option>`); rf.value = open[0].ref; } }, 30);
  // when the review is saved, the requests are done (the old version keeps them as history)
  const before = (a.reviews || []).length, sup = a.status;
  const t = setInterval(() => { if (!document.querySelector('.modal')) { clearInterval(t); if ((a.reviews || []).length > before || a.status !== sup) { open.forEach(x => { x.done = TODAY; }); const n = a.supersededBy && byId('riskAssessments', a.supersededBy); if (n) n.reviewRequests = []; save(); } } }, 150);
};
const _myTasksBeforeFlow = myTasks;
myTasks = function () { const out = _myTasksBeforeFlow(); if (isFieldUser()) return out;
  (S.riskAssessments || []).filter(a => a.org === S.ui.org && a.status !== 'Superseded' && raReviewOpen(a).length && (a.assessor === S.ui.user || (canRisk() && !byId('people', a.assessor)))).forEach(a => out.push({ title: `Review risk assessment ${a.id}: ${a.title}`, sub: raReviewOpen(a).map(x => `${x.reason}${x.ref ? ' ' + x.ref : ''}`).join('; '), link: '#/risk/' + a.id, sev: 'amber' }));
  return out; };

/* ---------- A3. Hazard → risk assessment ---------- */
ACT.hzToRa = (el) => { const h = byId('hazards', el.dataset.id);
  const ras = (S.riskAssessments || []).filter(a => a.org === h.org && a.status !== 'Superseded' && (a.site === h.site || h.site === 'ALL'));
  openModal({ title: 'Add the hazard to a risk assessment', sub: `${h.id} ${h.title}`, body: `<div class="form-grid">${fld({ name: 'ra', label: 'Risk assessment', type: 'select', options: opts([{ value: 'NEW', label: '+ Start a new risk assessment for this hazard' }].concat(ras.map(a => ({ value: a.id, label: `${a.id} — ${a.title} (${raStatus(a)})` }))), ras[0] ? ras[0].id : 'NEW'), required: true, full: true })}</div>
    <p class="t-sub">Adding it to an approved assessment changes that assessment: record a review afterwards if your procedure requires it.</p>`,
    buttons: [{ label: 'Next', cls: 'primary', onClick: m => { const v = readForm(m); let id = v.ra;
      if (id === 'NEW') { const a = { id: nextId('RA-', 'riskAssessments'), org: h.org, site: h.site === 'ALL' ? defaultSite() : h.site, title: h.title, type: 'Issue-based', activity: h.activity || '', date: TODAY, assessor: S.ui.user, participants: [], status: 'Draft', version: 1, rows: [], reviews: [], evidence: [], created: TODAY };
        S.riskAssessments.push(a); id = a.id; log(`Started risk assessment ${a.id} for hazard ${h.id}`, '#/risk/' + a.id); save(); }
      navigate('#/risk/' + id); setTimeout(() => { ACT.raRow({ dataset: { id } }); setTimeout(() => { const s = document.querySelector('.modal [name=hazard]'); if (s) { s.value = h.id; s.dispatchEvent(new Event('change', { bubbles: true })); const st = document.querySelector('.modal [name=step]'); if (st && !st.value) st.value = h.activity || ''; } }, 40); }, 80); } }] }); };

/* ---------- A4. Hazardous substance: action and risk assessment ---------- */
const _subBeforeFlow = ROUTES.substances;
ROUTES.substances = (p, q) => { const r = _subBeforeFlow(p, q);
  if (r && r.html && p[0] && /^HCS-/.test(p[0]) && canHCS()) { const x = byId('substances', p[0]);
    if (x) r.html = r.html.replace('<div class="sh-actions">', `<div class="sh-actions">${!x.ra && typeof canRisk === 'function' && canRisk() ? `<button class="btn primary" data-act="subRa" data-id="${x.id}">${icon('risk', 'sm')} Create its risk assessment</button>` : ''}<button class="btn" data-act="subAction" data-id="${x.id}">${icon('target', 'sm')} Raise action</button>`); }
  return r; };
ACT.subAction = (el) => { const x = byId('substances', el.dataset.id); raiseActionModal({ source: 'Hazardous substance', sourceId: x.id, title: `${x.name}: `, site: x.site }); };
ACT.subRa = (el) => { const x = byId('substances', el.dataset.id);
  const a = { id: nextId('RA-', 'riskAssessments'), org: x.org, site: x.site, title: `Hazardous substance: ${x.name}`, type: 'Hazardous substance', activity: `Use and storage of ${x.name}${x.location ? ' — ' + x.location : ''}`, date: TODAY, assessor: S.ui.user, participants: [], substance: x.id, status: 'Draft', version: 1, rows: [], reviews: [], evidence: [], created: TODAY };
  S.riskAssessments.push(a); x.ra = a.id; log(`Created risk assessment ${a.id} for substance ${x.name}`, '#/risk/' + a.id); save(); toast(`${a.id} created and linked to ${x.name}. Add its hazards.`); navigate('#/risk/' + a.id); };
if (typeof SOURCE_MODULES !== 'undefined' && !SOURCE_MODULES.includes('Hazardous substance')) SOURCE_MODULES.splice(SOURCE_MODULES.length - 1, 0, 'Hazardous substance');
const _sourceLinkBeforeFlow = sourceLink; sourceLink = function (a) { return a.source === 'Hazardous substance' && byId('substances', a.sourceId) ? `<a href="#/substances/${a.sourceId}">${esc(byId('substances', a.sourceId).name)}</a>` : _sourceLinkBeforeFlow(a); };

/* ---------- A5. Drills: move or cancel a scheduled drill ---------- */
const _emBeforeFlow = ROUTES.emergency;
ROUTES.emergency = (p, q) => { const r = _emBeforeFlow(p, q);
  if (r && r.html && p[0] && /^DRL-/.test(p[0]) && canEm()) { const d = byId('drills', p[0]);
    if (d && d.status === 'Scheduled') r.html = r.html.replace('<div class="sh-actions">', `<div class="sh-actions"><button class="btn" data-act="drillMove" data-id="${d.id}">${icon('clock', 'sm')} Change date</button><button class="btn" data-act="drillCancel" data-id="${d.id}">Cancel drill</button>`);
    if (d && d.status === 'Cancelled') r.html = r.html.replace('<div class="detail">', `<div class="alert info">${icon('info')}<div>Cancelled on ${fmt(d.cancelled.on)} by ${esc(pname(d.cancelled.by))}: ${esc(d.cancelled.reason)}</div></div><div class="detail">`); }
  return r; };
ACT.drillMove = (el) => { const d = byId('drills', el.dataset.id); openModal({ title: 'Change the drill date', sub: `${d.id} ${d.scenario}`, body: `<div class="form-grid">${fld({ name: 'date', label: 'New date', type: 'date', value: d.date, required: true })}${fld({ name: 'why', label: 'Reason', full: true })}</div>`,
  buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m), old = d.date; d.date = v.date; (d.history = d.history || []).push({ on: TODAY, by: S.ui.user, note: `Moved from ${fmt(old)} to ${fmt(v.date)}${v.why ? ': ' + v.why : ''}` });
    queueEmail([d.coordinator], 'actions', `Emergency drill moved: ${sname(d.site)} to ${fmt(v.date)}`, `The ${d.scenario} drill at ${sname(d.site)} moved from ${fmt(old)} to ${fmt(v.date)}.`, '#/emergency/' + d.id); log(`Moved drill ${d.id} to ${fmt(v.date)}`, '#/emergency/' + d.id); save(); rerender(); } }] }); };
ACT.drillCancel = (el) => { const d = byId('drills', el.dataset.id); openModal({ title: 'Cancel the drill', sub: `${d.id} ${d.scenario}`, body: fld({ name: 'reason', label: 'Reason', type: 'textarea', required: true, full: true }),
  buttons: [{ label: 'Cancel drill', cls: 'danger', onClick: m => { if (!validateForm(m)) return false; d.status = 'Cancelled'; d.cancelled = { on: TODAY, by: S.ui.user, reason: readForm(m).reason }; log(`Cancelled drill ${d.id}`, '#/emergency/' + d.id); save(); rerender(); } }] }); };
