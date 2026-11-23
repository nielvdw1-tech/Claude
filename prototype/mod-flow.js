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

/* ---------- B7. My tasks: grouped by urgency and module, with snooze ---------- */
const taskKey = t => (t.link || '') + '|' + (t.title || '');
const snoozed = () => (S.ui.snooze = S.ui.snooze || {});
const _myTasksBeforeSnooze = myTasks;
function myTasksAll() { return _myTasksBeforeSnooze(); }
myTasks = function () { const z = snoozed(); return _myTasksBeforeSnooze().filter(t => !(z[taskKey(t)] && z[taskKey(t)] > TODAY)); };
const TASK_GROUPS = [['red', 'Overdue or urgent', 'Do these first'], ['amber', 'Needs action soon', 'Due soon or waiting on you'], ['blue', 'To do', 'When you can']];
function taskModule(link) { const k = (link || '').replace(/^#\/?/, '').split(/[/?]/)[0]; const it = NAV.flatMap(g => g.items).find(i => i[0] === k); return it ? it[1] : ({ myra: 'Risk Management', me: 'My appointments', myppe: 'My PPE', mytraining: 'My training', myreading: 'Documents to read', inspect: 'Inspections', field: 'Home' })[k] || 'Other'; }
function tasksHtml(q) {
  const all = myTasks(), mods = [...new Set(all.map(t => taskModule(t.link)))].sort(), mod = q.mod || '', list = mod ? all.filter(t => taskModule(t.link) === mod) : all;
  const z = snoozed(), hidden = myTasksAll().filter(t => z[taskKey(t)] && z[taskKey(t)] > TODAY);
  const row = t => `<div class="notif"><div class="n-ic ic-${t.sev}">${icon('tasks')}</div><div class="n-body"><div class="n-title">${esc(t.title)}</div><div class="n-text">${esc(t.sub || '')}</div><div class="n-meta"><span>${esc(taskModule(t.link))}</span></div></div><div class="btn-row nowrap"><a class="btn sm primary" href="${t.link}">Open</a><button class="btn sm ghost" data-act="taskSnooze" data-k="${esc(taskKey(t))}" title="Hide this task for 7 days">Snooze 7 days</button></div></div>`;
  const groups = TASK_GROUPS.map(([sev, h, sub]) => { const g = list.filter(t => (t.sev === sev) || (sev === 'blue' && !['red', 'amber'].includes(t.sev))); return g.length ? `<div class="task-group"><div class="tg-head sev-${sev}"><b>${h}</b> <span class="t-sub">${g.length} · ${sub}</span></div>${g.map(row).join('')}</div>` : ''; }).join('');
  return `<div class="card"><div class="card-head"><h2>My tasks — ${esc(me().name)}</h2><span class="ch-sub">${all.length} open · ${esc(myRole().name)} · ${esc(scopeLabel())}</span></div>
    ${mods.length > 1 ? `<div class="toolbar"><div class="btn-row">${['', ...mods].map(m => `<a class="btn sm ${mod === m ? 'primary' : ''}" href="#/notifications/tasks${m ? '?mod=' + encodeURIComponent(m) : ''}">${m ? esc(m) + ` (${all.filter(t => taskModule(t.link) === m).length})` : 'All modules'}</a>`).join('')}</div></div>` : ''}
    <div class="card-body flush">${list.length ? groups : `<div class="empty">${icon('checkCircle')}<div>No tasks${mod ? ' in ' + esc(mod) : ''}. You are up to date.</div></div>`}</div>
    ${hidden.length ? `<div class="card-body t-sub">${hidden.length} task(s) snoozed. <button class="link-btn" data-act="taskUnsnooze">Show them again</button></div>` : ''}</div>`;
}
const _notifBeforeFlow = ROUTES.notifications;
ROUTES.notifications = (p, q = {}) => { const r = _notifBeforeFlow(p, q);
  if ((p[0] || 'all') === 'tasks' && r && r.html) { const i = r.html.indexOf('<div class="card"><div class="card-head"><h2>My tasks'); if (i > -1) r.html = r.html.slice(0, i) + tasksHtml(q); }
  return r; };
ACT.taskSnooze = (el) => { snoozed()[el.dataset.k] = addDays(TODAY, 7); save(); toast('Snoozed for 7 days.'); rerender(); };
ACT.taskUnsnooze = () => { S.ui.snooze = {}; save(); rerender(); };

/* ---------- B8. Dashboard: sections fold away; what is open first depends on the role ---------- */
const DASH_OPEN = {   // sections open by default per role (the person's own choice is remembered)
  'Managing Director': ['Compliance status', 'Compliance management'],
  'HSEQ Manager': ['Compliance status', 'Compliance management'],
  'Safety Consultant': ['Compliance status', 'Compliance management'],
  'Branch Manager': ['Compliance status', 'Detail'],
  'Supervisor': ['Detail', 'Compliance management'],
  'System Administrator': ['Compliance status']
};
const dashOpen = (name) => { const mine = ((S.ui.dashFold = S.ui.dashFold || {})[S.ui.user] || {}); if (name in mine) return mine[name]; return (DASH_OPEN[myRole().name] || ['Compliance status']).includes(name); };
const _dashBeforeFold = ROUTES.dashboard;
ROUTES.dashboard = (p, q = {}) => { const r = _dashBeforeFold(p, q);
  if (!r || !r.html || r.html.indexOf('dash-sec') < 0 || r.html.indexOf('class="emp"') > -1) return r;
  const t = document.createElement('template'); t.innerHTML = r.html; const kids = [...t.content.childNodes]; const out = document.createDocumentFragment(); let sec = null;
  kids.forEach(n => { if (n.nodeType === 1 && n.classList.contains('dash-sec')) { const name = n.textContent.trim().replace(/^—\s*/, '').replace(/ — .*/, ''), open = dashOpen(name);
      sec = document.createElement('section'); sec.className = 'dash-fold' + (open ? ' open' : ''); sec.dataset.sec = name;
      const hb = document.createElement('button'); hb.type = 'button'; hb.className = 'dash-sec dash-toggle'; hb.dataset.act = 'dashFold'; hb.dataset.sec = name; hb.setAttribute('aria-expanded', open ? 'true' : 'false'); hb.innerHTML = n.innerHTML + `<span class="df-hint">${open ? 'Hide' : 'Show'}</span>`;
      const body = document.createElement('div'); body.className = 'df-body'; sec.appendChild(hb); sec.appendChild(body); out.appendChild(sec); return; }
    (sec ? sec.querySelector('.df-body') : out).appendChild(n); });
  const d = document.createElement('div'); d.appendChild(out); r.html = d.innerHTML; return r; };
ACT.dashFold = (el) => { const sec = el.closest('.dash-fold'), name = el.dataset.sec, open = !sec.classList.contains('open'); sec.classList.toggle('open', open); el.setAttribute('aria-expanded', open); el.querySelector('.df-hint').textContent = open ? 'Hide' : 'Show';
  S.ui.dashFold = S.ui.dashFold || {}; (S.ui.dashFold[S.ui.user] = S.ui.dashFold[S.ui.user] || {})[name] = open; save(); if (open) window.dispatchEvent(new Event('resize')); };

/* ---------- B9. Module figures show on the module's first tab; on the other tabs they fold away ---------- */
function foldTabKpis() {
  const c = document.getElementById('content'); if (!c) return; const tabs = c.querySelector('.tabs:not(.adm-tabs)'); if (!tabs) return;
  const links = [...tabs.querySelectorAll('a')], act = tabs.querySelector('.active'); if (!act || links.indexOf(act) <= 0) return;
  c.querySelectorAll(':scope > .kpis, :scope > .kpi-more').forEach(k => { if (k.compareDocumentPosition(tabs) & Node.DOCUMENT_POSITION_FOLLOWING) {
    if (k.classList.contains('kpi-more')) { k.remove(); return; }
    const d = document.createElement('details'); d.className = 'kpi-fold'; d.innerHTML = `<summary>${icon('chart', 'sm')} Show the figures</summary>`; k.parentNode.insertBefore(d, k); d.appendChild(k); } });
}
const _rerenderBeforeFold = rerender;
rerender = function (...a) { const r = _rerenderBeforeFold.apply(this, a); try { foldTabKpis(); } catch (e) { console.error(e); } return r; };

/* ---------- B10. Record pages: the next step stands out; the rest are under "More" ---------- */
function tidyRecordActions() {
  document.querySelectorAll('#content .status-hero .sh-actions').forEach(bar => {
    const btns = [...bar.children].filter(b => b.matches('.btn, a.btn, label.btn')); if (btns.length <= 3 || bar.querySelector('.more-wrap')) return;
    const keep = btns.filter(b => b.classList.contains('primary') || b.classList.contains('success')).slice(0, 2);
    btns.forEach(b => { if (keep.length < 3 && !keep.includes(b)) keep.push(b); });
    const rest = btns.filter(b => !keep.includes(b)); if (!rest.length) return;
    keep.sort((a, b) => (b.classList.contains('primary') || b.classList.contains('success')) - (a.classList.contains('primary') || a.classList.contains('success')));
    const wrap = document.createElement('div'); wrap.className = 'more-wrap';
    wrap.innerHTML = `<button type="button" class="btn more-btn" data-act="moreMenu" aria-haspopup="true" aria-expanded="false">More ${icon('chevron', 'sm')}</button><div class="more-menu" role="menu"></div>`;
    rest.forEach(b => { b.classList.remove('primary', 'success'); wrap.querySelector('.more-menu').appendChild(b); });
    bar.innerHTML = ''; keep.slice().reverse().forEach(b => bar.appendChild(b)); bar.appendChild(wrap);
  });
}
ACT.moreMenu = (el) => { const w = el.closest('.more-wrap'), open = !w.classList.contains('open'); document.querySelectorAll('.more-wrap.open').forEach(x => x.classList.remove('open')); w.classList.toggle('open', open); el.setAttribute('aria-expanded', open); };
document.addEventListener('click', e => { if (!e.target.closest || !e.target.closest('.more-wrap')) document.querySelectorAll('.more-wrap.open').forEach(x => x.classList.remove('open')); else if (e.target.closest('.more-menu')) setTimeout(() => document.querySelectorAll('.more-wrap.open').forEach(x => x.classList.remove('open')), 0); });
const _rerenderBeforeMore = rerender;
rerender = function (...a) { const r = _rerenderBeforeMore.apply(this, a); try { tidyRecordActions(); } catch (e) { console.error(e); } return r; };
