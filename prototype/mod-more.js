/* ==========================================================================
   Smaller gaps in the focus modules
   --------------------------------------------------------------------------
   - Corrective actions: a follow-up check some time after closing — did the
     fix actually work? "Not effective" reopens the action.
   - Incidents: costs (lost time, medical, repairs, other) and the lessons
     learned, which can be shared with staff as a company notice.
   - Assets: hour-meter or odometer readings; maintenance due at a reading.
   - Lifting equipment register (Reports).
   - External documents: publisher, edition and when to check for a newer one.
   - Reading check: optional questions a reader answers before signing.
   ========================================================================== */
'use strict';

if (LOCKABLE.incidents && !LOCKABLE.incidents.exclude.includes('costs')) LOCKABLE.incidents.exclude.push('costs', 'lessons', 'lessonsShared');
if (LOCKABLE.actions && !LOCKABLE.actions.exclude.includes('followUp')) LOCKABLE.actions.exclude.push('followUp');

/* ---------------- Corrective action follow-up check ---------------- */
function followUpDays() { return +rules().actionFollowUpDays || 60; }
const _actionTransitionBeforeFU = actionTransition;
actionTransition = function (a, to, comment, extra) {
  const r = _actionTransitionBeforeFU(a, to, comment, extra);
  if (to === 'Closed' && !(a.followUp && !a.followUp.done)) a.followUp = { due: addDays(TODAY, followUpDays()), by: (a.verification && a.verification.by) || S.ui.user, done: null };
  return r;
};
function followUpCardHtml(a) {
  const f = a.followUp; if (!f) return '';
  const late = !f.done && daysTo(f.due) < 0;
  return `<div class="card" id="fuCard"><div class="card-head"><h2>Follow-up check</h2>${f.done ? badge(f.done.result === 'Effective' ? 'Worked' : 'Did not work', f.done.result === 'Effective' ? 'green' : 'red') : late ? badge('Overdue', 'red') : badge('Due ' + fmt(f.due), 'amber')}</div><div class="card-body">
    ${f.done ? `<p><b>${f.done.result === 'Effective' ? 'The fix worked.' : 'The fix did not work — the action was reopened.'}</b></p><p class="t-sub">${esc(pname(f.done.by))} · ${fmtTs(f.done.ts)}${f.done.comment ? ' · ' + esc(f.done.comment) : ''}</p>`
      : `<p>Some time after closing, check on site that the problem has not come back. Due <b>${fmt(f.due)}</b>, by ${esc(pname(f.by))} (or the HSEQ Manager).</p>${permBtn('action.verify', `<button class="btn sm primary" data-act="fuRecord" data-id="${a.id}">${icon('checkCircle', 'sm')} Record follow-up check</button>`)}`}
  </div></div>`;
}
ACT.fuRecord = (el) => {
  const a = byId('actions', el.dataset.id); if (!a || !a.followUp) return;
  openModal({ title: 'Follow-up check', sub: `${a.id}: ${a.title} — did the fix work?`, body: `<div class="form-grid">${fld({ name: 'result', label: 'Result', type: 'select', options: opts([{ value: 'Effective', label: 'It worked — the problem has not come back' }, { value: 'Not effective', label: 'It did not work — reopen the action' }]), required: true, full: true })}${fld({ name: 'comment', label: 'What did you check?', type: 'textarea', required: true, full: true })}</div>`,
    buttons: [{ label: 'Save', cls: 'primary', onClick: m => {
      if (!validateForm(m)) return false; const v = readForm(m);
      a.followUp.done = { result: v.result, by: S.ui.user, ts: nowTs(), comment: v.comment };
      if (v.result === 'Not effective') { if (typeof unlockRecord === 'function' && a.lock) unlockRecord('actions', a, 'follow-up check: fix did not work'); _actionTransitionBeforeFU(a, 'Reopened', 'Follow-up check: the fix did not work. ' + v.comment); a.due = addDays(TODAY, 14); addEvent('red', 'actions', `Reopened after follow-up: ${a.id}`, `The fix did not work: ${v.comment}`, '#/actions/' + a.id, a.site, [a.owner]); }
      else a.history.push({ ts: nowTs(), by: S.ui.user, action: 'Follow-up check: the fix worked', comment: v.comment });
      log(`Follow-up check on ${a.id}: ${v.result === 'Effective' ? 'worked' : 'did not work — reopened'}`, '#/actions/' + a.id); save(); toast(v.result === 'Effective' ? 'Recorded: the fix worked.' : 'Recorded: the action is reopened and back with the owner.'); rerender();
    } }] });
};
const _myTasksBeforeMore = myTasks;
myTasks = function () {
  const out = _myTasksBeforeMore();
  if (can('action.verify')) S.actions.filter(a => inSite(a, S.ui.site) && a.followUp && !a.followUp.done && daysTo(a.followUp.due) <= 7 && (a.followUp.by === S.ui.user || hseqManagers(a.org).includes(S.ui.user))).forEach(a => out.push({ title: `Follow-up check: ${a.id}`, sub: `Did the fix work? Due ${fmt(a.followUp.due)}`, link: '#/actions/' + a.id, sev: daysTo(a.followUp.due) < 0 ? 'red' : 'amber' }));
  // Meter-based maintenance coming due
  S.maintenance.filter(m => !m.completed && m.dueMeter != null).forEach(m => { const a = byId('assets', m.asset); if (!a || !inSite(a, S.ui.site) || !(m.by === S.ui.user || a.responsible === S.ui.user)) return; const st = meterState(a, m); if (st && st.left <= st.warn) out.push({ title: `Maintenance ${m.id}: ${a.tag} at ${fmtNum(m.dueMeter)} ${meterUnit(a)}`, sub: `${m.description} · now ${fmtNum(a.meter.value)} ${meterUnit(a)}`, link: '#/assets/' + a.id + '?tab=maintenance', sev: st.left <= 0 ? 'red' : 'amber' }); });
  return out;
};

/* ---------------- Incident costs ---------------- */
const COST_KEYS = [['lostTime', 'Lost time (wages for shifts lost)'], ['medical', 'Medical costs'], ['repairs', 'Repairs and damage'], ['other', 'Other (clean-up, fines, hire)']];
const money = v => 'R ' + Math.round(+v || 0).toLocaleString('en-ZA');
function incCost(i) { const c = i.costs || {}; return COST_KEYS.reduce((t, k) => t + (+c[k[0]] || 0), 0); }
function costCardHtml(i) {
  const c = i.costs, tot = incCost(i);
  return `<div class="card" id="costCard"><div class="card-head"><h2>Costs</h2>${permBtn('incident.investigate', `<button class="btn sm" data-act="incCosts" data-id="${i.id}">${c ? 'Update' : 'Record costs'}</button>`)}</div><div class="card-body">
    ${c ? `<div class="kv">${COST_KEYS.map(k => `<div>${esc(k[1])}</div><div>${money(c[k[0]])}</div>`).join('')}<div><b>Total</b></div><div><b>${money(tot)}</b></div></div><p class="t-sub mt-s">${esc(c.note || '')}${c.note ? ' · ' : ''}${esc(pname(c.by))}, ${fmt(c.on)}</p>` : '<p class="muted">No costs recorded yet. Costs often come in after the incident (medical bills, repairs); record them when known.</p>'}
  </div></div>`;
}
ACT.incCosts = (el) => {
  const i = byId('incidents', el.dataset.id), c = i.costs || {};
  openModal({ title: 'Incident costs', sub: `${i.id} — amounts in rand, as far as known`, body: `<div class="form-grid">${COST_KEYS.map(k => fld({ name: k[0], label: k[1], type: 'number', min: 0, value: c[k[0]] || '' })).join('')}${fld({ name: 'note', label: 'Note (e.g. still waiting for the repair quote)', full: true, value: c.note || '' })}</div>`,
    buttons: [{ label: 'Save', cls: 'primary', onClick: m => { const v = readForm(m); i.costs = { note: v.note, by: S.ui.user, on: TODAY }; COST_KEYS.forEach(k => { i.costs[k[0]] = Math.max(0, Math.round(+v[k[0]] || 0)); }); i.history.push({ ts: nowTs(), by: S.ui.user, action: `Costs recorded: ${money(incCost(i))}`, comment: v.note || '' }); log(`Recorded costs for ${i.id}: ${money(incCost(i))}`, '#/incidents/' + i.id); save(); toast('Costs saved.'); rerender(); } }] });
};

/* ---------------- Lessons learned ---------------- */
let LESSON_PREFILL = null;
function lessonsCardHtml(i) {
  if (i.status !== 'Closed' && !i.lessons) return '';
  const L = i.lessons, sh = i.lessonsShared;
  return `<div class="card" id="lessonsCard"><div class="card-head"><h2>Lessons learned</h2>${L && !sh && can('notice.publish') ? `<button class="btn sm primary" data-act="lessonsShare" data-id="${i.id}">${icon('info', 'sm')} Share with staff</button>` : ''}</div><div class="card-body">
    ${L ? `<p style="white-space:pre-wrap">${esc(L.text)}</p><p class="t-sub">${esc(pname(L.by))}, ${fmt(L.on)}${sh ? ` · shared as notice <a href="#/notices/${sh.notice}">${esc(sh.notice)}</a>` : ''}</p>` : `<p class="muted">No lessons learned recorded.</p>${permBtn('incident.investigate', `<button class="btn sm" data-act="lessonsAdd" data-id="${i.id}">Add lessons learned</button>`)}`}
  </div></div>`;
}
ACT.lessonsAdd = (el) => { const i = byId('incidents', el.dataset.id); openModal({ title: 'Lessons learned', sub: i.id, body: fld({ name: 'lessons', label: 'What should everyone learn from this incident?', type: 'textarea', required: true, full: true, rows: 5 }), buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; i.lessons = { text: readForm(m).lessons.trim(), by: S.ui.user, on: TODAY }; i.history.push({ ts: nowTs(), by: S.ui.user, action: 'Lessons learned recorded', comment: i.lessons.text }); save(); toast('Saved.'); rerender(); } }] }); };
ACT.lessonsShare = (el) => {
  const i = byId('incidents', el.dataset.id), L = i.lessons; if (!L) return;
  LESSON_PREFILL = { incident: i.id, title: `Lessons learned: ${i.title}`, body: `What happened: ${i.title} (${fmt(i.date)}, ${sname(i.site)}).\n\nWhat we learned:\n${L.text}\n\nRoot cause: ${i.investigation ? i.investigation.root : '—'}` };
  ACT.noticeNew();
};
// Fill the notice form when sharing lessons learned
const _openModalBeforeLessons = openModal;
openModal = function (o) {
  const r = _openModalBeforeLessons(o);
  if (LESSON_PREFILL && o && o.title === 'Publish notice') { const P = LESSON_PREFILL; setTimeout(() => { const m = document.querySelector('.modal'); if (!m) return; const t = m.querySelector('[name=title]'), b = m.querySelector('[name=body]'); if (t) t.value = P.title; if (b) b.value = P.body; const ack = m.querySelector('[name=ackRequired]'); if (ack) ack.checked = true; m.dataset.lessonFrom = P.incident; }, 0); LESSON_PREFILL = null; }
  return r;
};
// After a notice is published from a lessons-learned share, link it back to the incident
const _noticesPushWatch = () => { const m = document.querySelector('.modal[data-lesson-from]'); return m ? m.dataset.lessonFrom : null; };
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('.modal-foot button'); if (!b) return;
  const from = _noticesPushWatch(); if (!from) return;
  const before = (S.notices || []).length;
  setTimeout(() => { if ((S.notices || []).length > before) { const n = S.notices[S.notices.length - 1], i = byId('incidents', from); if (i && n) { i.lessonsShared = { notice: n.id, by: S.ui.user, on: TODAY }; i.history.push({ ts: nowTs(), by: S.ui.user, action: `Lessons learned shared as notice ${n.id}`, comment: '' }); save(); } } }, 50);
}, true);


/* ---------------- Hour meter / odometer; maintenance due at a reading ---------------- */
function meterUnit(a) { return a && a.meter ? (a.meter.unit === 'km' ? 'km' : 'h') : ''; }
function meterState(a, m) {
  if (!a || !a.meter || m.dueMeter == null) return null;
  const left = m.dueMeter - a.meter.value, span = Math.max(1, m.dueMeter - (m.fromMeter != null ? m.fromMeter : a.meter.value));
  return { left, warn: Math.max(a.meter.unit === 'km' ? 1000 : 50, Math.round(span * 0.1)) };
}
function meterDue(m) { const a = byId('assets', m.asset), st = meterState(a, m); return !!st && st.left <= 0; }
function meterCardHtml(a) {
  const M = a.meter;
  return `<div class="card" id="meterCard"><div class="card-head"><h2>${M ? (M.unit === 'km' ? 'Odometer' : 'Hour meter') : 'Hour meter / odometer'}</h2>${permBtn('inspect', `<button class="btn sm" data-act="meterRead" data-id="${a.id}">${M ? 'Update reading' : 'Set up'}</button>`)}</div><div class="card-body">
    ${M ? `<div class="meter-big">${fmtNum(M.value)} <span>${M.unit === 'km' ? 'km' : 'hours'}</span></div><p class="t-sub">Read ${fmt(M.on)} by ${esc(pname(M.by))}</p>
      ${S.maintenance.filter(m => m.asset === a.id && !m.completed && m.dueMeter != null).map(m => { const st = meterState(a, m); return `<p class="mt-s">${icon('wrench', 'sm')} ${esc(m.description)}: due at <b>${fmtNum(m.dueMeter)} ${meterUnit(a)}</b> — ${st.left <= 0 ? `<span class="t-bad">${fmtNum(-st.left)} ${meterUnit(a)} past due</span>` : `${fmtNum(st.left)} ${meterUnit(a)} to go`}</p>`; }).join('')}`
      : '<p class="muted">Record hours or kilometres to plan maintenance by use, e.g. a service every 500 hours.</p>'}
  </div></div>`;
}
ACT.meterRead = (el) => {
  const a = byId('assets', el.dataset.id), M = a.meter;
  openModal({ title: M ? 'Update reading' : 'Hour meter / odometer', sub: `${a.tag} — ${a.name}`, body: `<div class="form-grid">${M ? '' : fld({ name: 'unit', label: 'Measured in', type: 'select', options: opts([{ value: 'hours', label: 'Hours (hour meter)' }, { value: 'km', label: 'Kilometres (odometer)' }]), required: true })}${fld({ name: 'value', label: `Reading${M ? ` (last ${fmtNum(M.value)} ${meterUnit(a)})` : ''}`, type: 'number', min: M ? M.value : 0, required: true })}${fld({ name: 'on', label: 'Date read', type: 'date', value: TODAY, required: true })}</div>`,
    buttons: [{ label: 'Save', cls: 'primary', onClick: m => {
      if (!validateForm(m, fail => { const f = m.querySelector('[name=value]'); if (M && +f.value < M.value) fail(f, 'A reading cannot be lower than the last one.'); })) return false;
      const v = readForm(m), val = Math.round(+v.value);
      a.meter = { unit: M ? M.unit : v.unit, value: val, on: v.on, by: S.ui.user, log: ((M && M.log) || []).concat([{ value: val, on: v.on, by: S.ui.user }]).slice(-50) };
      assetHistory(a, `${a.meter.unit === 'km' ? 'Odometer' : 'Hour meter'} reading ${fmtNum(val)} ${meterUnit(a)}`);
      const due = S.maintenance.filter(x => x.asset === a.id && !x.completed && meterDue(x));
      if (due.length) addEvent('amber', 'assets', `Maintenance due by ${a.meter.unit === 'km' ? 'kilometres' : 'hours'}: ${a.tag}`, due.map(x => `${x.id} ${x.description}`).join('; '), '#/assets/' + a.id + '?tab=maintenance', a.site, [a.responsible].concat(due.map(x => x.by)));
      log(`Recorded ${fmtNum(val)} ${meterUnit(a)} on ${a.tag}`, '#/assets/' + a.id); save(); toast(`Reading saved${due.length ? ` — ${due.length} maintenance item(s) now due` : ''}.`); rerender();
    } }] });
};

/* ---------------- Lifting equipment register (Reports) ---------------- */
const LIFT_TYPES = ['AT-FL', 'AT-CRANE', 'AT-TACKLE'];
function liftingAssets(sid) { return S.assets.filter(a => inSite(a, sid) && a.status !== 'Decommissioned' && (LIFT_TYPES.includes(a.type) || /chain block|hoist|crane|sling|lift/i.test(a.name))); }
function liftCert(a) { return assetDocStatus(a).find(d => /load test|lifting/i.test(d.name)) || null; }
function liftingBuild() {
  const rows = liftingAssets(S.ui.site);
  const cap = a => { const c = a.custom || {}; return c['SWL (t)'] ? c['SWL (t)'] + ' t' : c['Capacity (kg)'] ? fmtNum(c['Capacity (kg)']) + ' kg' : '—'; };
  const html = rows.length ? `<div class="table-wrap"><table class="tbl compact stackable"><thead><tr><th>Equipment</th><th>Safe working load</th><th>Load test / examination certificate</th><th>Last inspection</th><th>Next inspection</th><th>Status</th></tr></thead><tbody>
    ${rows.map(a => { const c = liftCert(a), last = S.inspections.filter(i => i.asset === a.id).sort((x, y) => y.date.localeCompare(x.date))[0], next = scheduleFor(a.id).sort((x, y) => x.nextDue.localeCompare(y.nextDue))[0];
      return `<tr class="${a.status === 'Out of Service' || (c && c.status !== 'Valid') ? 'row-red' : ''}"><td data-label="Equipment"><a href="#/assets/${a.id}">${esc(a.tag)}</a> ${esc(a.name)}<div class="t-sub">${esc(sname(a.site))} · ${esc(assetType(a).name)}</div></td><td data-label="SWL">${esc(cap(a))}</td><td data-label="Certificate">${c ? `${sbadge(c.status)}<div class="t-sub">${c.expires ? 'expires ' + fmt(c.expires) : ''}</div>` : '<span class="muted">Not required for this type</span>'}</td><td data-label="Last inspection">${last ? `<a href="#/inspections/${last.id}">${fmt(last.date)}</a>${last.results.some(r => r.result === 'Fail') ? ' ' + badge('Failed items', 'red', true) : ''}` : '—'}</td><td data-label="Next inspection">${next ? dueText(next.nextDue) : '—'}</td><td data-label="Status">${sbadge(a.status)}</td></tr>`; }).join('')}
    </tbody></table></div><p class="muted mt" style="font-size:12px">Lifting machines and lifting tackle in the asset register, with their safe working load, load test or examination certificate and inspections. Which certificates and intervals apply is set per asset type by a competent person.</p>` : '<p class="muted">No lifting equipment in the register.</p>';
  return { desc: 'Every lifting machine and piece of lifting tackle with its safe working load, certificate status and inspections, in one place.', html,
    csv: [['Tag', 'Equipment', 'Site', 'SWL', 'Certificate', 'Certificate status', 'Expires', 'Status']].concat(rows.map(a => { const c = liftCert(a); return [a.tag, a.name, sname(a.site), cap(a), c ? c.name : '', c ? c.status : '', c && c.expires ? c.expires : '', a.status]; })) };
}
const _buildReportBeforeLift = buildReport;
buildReport = function (key) { return key === 'lifting' ? liftingBuild() : _buildReportBeforeLift(key); };
REPORTS.splice(REPORTS.findIndex(r => r[0] === 'assets') + 1, 0, ['lifting', 'Lifting equipment register']);

/* ---------------- External documents ---------------- */
function extHtml(d) {
  const e = d.ext; if (d.type !== 'External document') return '';
  return `<div class="card" id="extCard"><div class="card-head"><h2>External document</h2>${permBtn('doc.create', `<button class="btn sm" data-act="extEdit" data-id="${d.id}">${e ? 'Change' : 'Add details'}</button>`)}</div><div class="card-body">
    ${e ? `<div class="kv"><div>Publisher / source</div><div>${esc(e.publisher)}</div><div>Edition / version</div><div>${esc(e.edition)}</div><div>Check for a newer edition</div><div>${e.check ? dueText(e.check) : '—'}</div></div>${e.checked ? `<p class="t-sub mt-s">Last checked ${fmt(e.checked.on)} by ${esc(pname(e.checked.by))}: ${esc(e.checked.note)}</p>` : ''}${e.check ? permBtn('doc.create', `<button class="btn sm mt-s" data-act="extChecked" data-id="${d.id}">${icon('check', 'sm')} Checked for a newer edition</button>`) : ''}`
      : '<p class="muted">Documents from outside the company (supplier safety data sheets, manufacturer manuals, standards) are controlled too: record who publishes them, the edition you hold, and when to check for a newer one.</p>'}
  </div></div>`;
}
ACT.extEdit = (el) => { const d = byId('documents', el.dataset.id), e = d.ext || {}; openModal({ title: 'External document', sub: `${d.number} ${d.title}`, body: `<div class="form-grid">${fld({ name: 'publisher', label: 'Publisher / source', value: e.publisher || '', required: true, placeholder: 'e.g. supplier, manufacturer, standards body' })}${fld({ name: 'edition', label: 'Edition / version held', value: e.edition || '', required: true })}${fld({ name: 'check', label: 'Check for a newer edition by', type: 'date', value: e.check || addMonths(TODAY, 12) })}</div>`, buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); d.ext = Object.assign({}, e, { publisher: v.publisher, edition: v.edition, check: v.check || null }); docLatest(d).history.push({ ts: nowTs(), by: S.ui.user, action: 'External document details updated', comment: `${v.publisher} · ${v.edition}` }); save(); toast('Saved.'); rerender(); } }] }); };
ACT.extChecked = (el) => { const d = byId('documents', el.dataset.id); openModal({ title: 'Checked for a newer edition', sub: d.number, body: `<div class="form-grid">${fld({ name: 'note', label: 'Result', type: 'select', options: opts(['No newer edition — the one held is current', 'A newer edition exists — start a new revision']), required: true, full: true })}${fld({ name: 'next', label: 'Check again by', type: 'date', value: addMonths(TODAY, 12), required: true })}</div>`, buttons: [{ label: 'Save', cls: 'primary', onClick: m => { const v = readForm(m); d.ext.checked = { on: TODAY, by: S.ui.user, note: v.note }; d.ext.check = v.next; docLatest(d).history.push({ ts: nowTs(), by: S.ui.user, action: 'Checked for a newer edition', comment: v.note }); save(); toast('Saved.'); rerender(); if (/newer edition exists/.test(v.note) && can('doc.create')) setTimeout(() => ACT.docNewRevision({ dataset: { id: d.id } }), 50); } }] }); };
const _myTasksBeforeExt = myTasks;
myTasks = function () { const out = _myTasksBeforeExt(); S.documents.filter(d => d.ext && d.ext.check && docActive(d) && d.owner === S.ui.user && daysTo(d.ext.check) <= 14).forEach(d => out.push({ title: `Check ${d.number} for a newer edition`, sub: `${d.ext.publisher} · held: ${d.ext.edition} · by ${fmt(d.ext.check)}`, link: '#/documents/' + d.id, sev: daysTo(d.ext.check) < 0 ? 'red' : 'amber' })); return out; };

/* ---------------- Reading check questions ---------------- */
function quizEditorHtml(d) {
  const Q = d.quiz || [];
  return `<div class="field full"><label>Reading check (optional)</label><div class="hint">For critical procedures: up to three questions the reader must answer correctly before they can sign. Leave empty for none.</div>
    ${[0, 1, 2].map(k => { const q = Q[k] || { q: '', opts: ['', '', ''], correct: 0 }; return `<div class="quiz-ed"><input type="text" name="qq${k}" placeholder="Question ${k + 1}" value="${esc(q.q)}">${[0, 1, 2].map(o => `<label class="quiz-opt"><input type="radio" name="qc${k}" value="${o}" ${q.correct === o ? 'checked' : ''} title="Correct answer"><input type="text" name="qo${k}_${o}" placeholder="Answer ${'ABC'[o]}" value="${esc(q.opts[o] || '')}"></label>`).join('')}</div>`; }).join('')}
    <div class="hint">Tick the circle next to the correct answer.</div></div>`;
}
function readQuiz(m) {
  const out = [];
  [0, 1, 2].forEach(k => { const q = m.querySelector(`[name=qq${k}]`).value.trim(); if (!q) return; const opts = [0, 1, 2].map(o => m.querySelector(`[name=qo${k}_${o}]`).value.trim()); const c = m.querySelector(`[name=qc${k}]:checked`); out.push({ q, opts, correct: c ? +c.value : 0 }); });
  return out;
}
function quizHtml(d) {
  if (!(d.quiz || []).length) return '';
  return `<div class="quiz">${d.quiz.map((q, k) => `<fieldset class="quiz-q"><legend>${k + 1}. ${esc(q.q)}</legend>${q.opts.map((o, i) => o ? `<label class="check"><input type="radio" name="qa${k}" value="${i}"> <span>${esc(o)}</span></label>` : '').join('')}</fieldset>`).join('')}</div>`;
}
function quizPassed(d) { return (d.quiz || []).every((q, k) => { const c = document.querySelector(`.ack-sign [name=qa${k}]:checked`); return c && +c.value === q.correct; }); }

MIGRATIONS.push(() => {
  if (S.migr && S.migr.more) return; S.migr = S.migr || {}; S.migr.more = true;
  const fl = byId('assets', 'AS-001'), ldv = byId('assets', 'AS-004');
  if (fl && !fl.meter) fl.meter = { unit: 'hours', value: 1462, on: addDays(TODAY, -2), by: 'P-007', log: [{ value: 1380, on: addDays(TODAY, -30), by: 'P-007' }, { value: 1462, on: addDays(TODAY, -2), by: 'P-007' }] };
  if (ldv && !ldv.meter) ldv.meter = { unit: 'km', value: 118640, on: addDays(TODAY, -1), by: 'P-014', log: [{ value: 118640, on: addDays(TODAY, -1), by: 'P-014' }] };
  const m1 = byId('maintenance', 'MT-201'); if (m1 && m1.dueMeter == null) { m1.dueMeter = 1500; m1.fromMeter = 1000; }
  const m5 = byId('maintenance', 'MT-205'); if (m5 && m5.dueMeter == null) { m5.dueMeter = 120000; m5.fromMeter = 105000; }
  const sds = byId('documents', 'DOC-018'); if (sds && !sds.ext) sds.ext = { publisher: 'Supplier of Solvex 300 (demo)', edition: 'Revision 4 (demo)', check: addDays(TODAY, 10) };
  const done = S.actions.filter(a => a.status === 'Closed' && !a.followUp);
  done.forEach((a, k) => { a.followUp = { due: addDays(a.closed || TODAY, rules().actionFollowUpDays || 60), by: (a.verification && a.verification.by) || 'P-002', done: null }; if (k === 0) a.followUp.due = addDays(TODAY, 3); });
  const i3 = byId('incidents', 'INC-2026-003');
  if (i3 && !i3.costs) i3.costs = { lostTime: 0, medical: 0, repairs: 1800, other: 6500, note: 'Spill kit, absorbent and waste removal (demo figures)', by: 'P-002', on: addDays(TODAY, -60) };
  if (i3 && !i3.lessons && i3.status === 'Closed') i3.lessons = { text: 'Check hoses and couplings on mobile plant before work near drains, and keep a spill kit at the wash bay. A small leak becomes a large spill if the machine keeps running.', by: 'P-002', on: addDays(TODAY, -60) };
});
