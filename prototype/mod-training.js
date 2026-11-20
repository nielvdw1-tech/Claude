/* ==========================================================================
   Training Management (specification module 7)
   --------------------------------------------------------------------------
   - Courses with provider, category and validity (empty = does not expire);
     a course can need a separate competency assessment after attendance.
   - Requirements: who needs which course — everyone, by job title, by
     appointment type (e.g. first aiders) or by activity (named people).
   - Training records with certificates and validity; competency assessment
     results recorded separately (Competent / Not yet competent).
   - Training sessions: schedule a course (e.g. a refresher), invite the
     people who need it, then record attendance and results for all at once.
   - Training matrix: required courses per person with status Valid,
     Expiring, Expired, Missing, Booked or Assessment outstanding.
   - Reminders: 60 days before a certificate expires (person and supervisor),
     and when it has expired (also the HSEQ Manager).
   ========================================================================== */
'use strict';

const canTraining = () => can('training.manage');
const TR_TONE = { 'Valid': 'green', 'Expiring': 'amber', 'Expired': 'red', 'Missing': 'red', 'Booked': 'blue', 'Assessment outstanding': 'amber', 'Not yet competent': 'red' };
const EXPIRING_DAYS = 60;
const courses = () => (S.courses || []).filter(c => c.org === S.ui.org);
const course = id => byId('courses', id);
const trainees = () => S.people.filter(p => p.org === S.ui.org && p.status !== 'Deactivated' && p.type === 'Employee' && (S.ui.site === 'ALL' || p.site === S.ui.site));
function hasActiveAppt(x, type) { return (S.appointments || []).some(a => a.person === x.id && a.type === type && ['Active', 'Accepted', 'Uploaded'].includes(typeof aptStatus === 'function' ? aptStatus(a) : a.status)); }
// Which courses a person needs, and why
function requiredFor(x) {
  const out = []; (S.trainingReqs || []).filter(r => r.org === x.org).forEach(r => {
    const hit = r.by === 'all' || (r.by === 'job' && r.value === x.jobTitle) || (r.by === 'appointment' && hasActiveAppt(x, r.value)) || (r.by === 'activity' && (r.people || []).includes(x.id));
    if (hit && course(r.course) && !out.some(o => o.course === r.course)) out.push({ course: r.course, why: reqLabel(r) }); });
  return out;
}
function reqLabel(r) { return r.by === 'all' ? 'Everyone' : r.by === 'job' ? `Job title: ${r.value}` : r.by === 'appointment' ? `Appointment: ${((S.config.apptTypes || []).find(t => t.id === r.value) || {}).name || r.value}` : `Activity: ${r.value}`; }
const lastRecord = (pid, cid) => (S.trainingRecs || []).filter(t => t.person === pid && t.course === cid).sort((a, b) => b.date.localeCompare(a.date))[0] || null;
const bookedFor = (pid, cid) => (S.trainingSessions || []).find(s => s.course === cid && s.status === 'Scheduled' && s.people.includes(pid));
function trStatus(pid, cid) {
  const r = lastRecord(pid, cid), c = course(cid);
  if (!r) return bookedFor(pid, cid) ? 'Booked' : 'Missing';
  if (c && c.competency && r.result !== 'Competent') return r.result === 'Not yet competent' ? 'Not yet competent' : 'Assessment outstanding';
  if (r.expires && daysTo(r.expires) < 0) return bookedFor(pid, cid) ? 'Booked' : 'Expired';
  if (r.expires && daysTo(r.expires) <= EXPIRING_DAYS) return 'Expiring';
  return 'Valid';
}
const gap = s => ['Missing', 'Expired', 'Not yet competent', 'Assessment outstanding'].includes(s);
function trainingSummary(list) { let need = 0, ok = 0, missing = 0, expired = 0, expiring = 0, assess = 0, people = 0, full = 0;
  list.forEach(x => { const req = requiredFor(x); if (!req.length) return; people++; let all = true;
    req.forEach(q => { need++; const s = trStatus(x.id, q.course); if (s === 'Valid' || s === 'Expiring') ok++; if (s === 'Missing') missing++; if (s === 'Expired') expired++; if (s === 'Expiring') expiring++; if (s === 'Assessment outstanding' || s === 'Not yet competent') assess++; if (gap(s)) all = false; });
    if (all) full++; });
  return { need, ok, missing, expired, expiring, assess, people, full, pct: need ? Math.round(ok / need * 100) : null }; }

/* ---------------- Route ---------------- */
ROUTES.training = (p, q = {}) => {
  const tab = ['matrix', 'records', 'courses', 'sessions'].includes(p[0]) ? p[0] : 'matrix';
  const T = trainees(), sm = trainingSummary(T), ses = (S.trainingSessions || []).filter(s => s.org === S.ui.org && s.status === 'Scheduled');
  const tabs = [['matrix', 'Training matrix'], ['records', 'Training records', (S.trainingRecs || []).filter(r => r.org === S.ui.org).length], ['sessions', 'Sessions', ses.length || ''], ['courses', 'Courses & requirements', courses().length]];
  let body = '', fab = '';
  if (tab === 'matrix') { body = matrixHtml(T, q); fab = canTraining() ? fabStack([{ act: 'trRecord', label: 'Record training' }, { act: 'trSession', label: 'Schedule training', icon: 'clock', cls: 'ghost' }]) : ''; }
  if (tab === 'records') { body = recordsHtml(q); fab = canTraining() ? fabBtn('trRecord', 'Record training') : ''; }
  if (tab === 'sessions') { body = sessionsHtml(); fab = canTraining() ? fabBtn('trSession', 'Schedule training') : ''; }
  if (tab === 'courses') { body = coursesHtml(); fab = canTraining() ? fabStack([{ act: 'crsEdit', label: 'New course' }, { act: 'treqNew', label: 'Add requirement', icon: 'target', cls: 'ghost' }]) : ''; }
  const html = `${pageHead('Training Management', 'Who needs which training, who has it, and when it expires. Requirements follow job titles, appointments and activities, so new employees and new appointments show their training needs straight away.', '', scopePill())}${fab}
    <div class="kpis">${kpi('Training up to date', sm.pct == null ? '—' : sm.pct + '%', `${sm.full} of ${sm.people} people fully trained`, sm.pct == null ? 'blue' : scoreColour(sm.pct), '#/training/matrix', 'checkCircle')}
      ${kpi('Missing training', sm.missing, 'Required, never done', sm.missing ? 'red' : 'green', '#/training/matrix?fstatus=Missing', 'x')}
      ${kpi('Expired certificates', sm.expired, `${sm.expiring} expiring within ${EXPIRING_DAYS} days`, sm.expired ? 'red' : sm.expiring ? 'amber' : 'green', '#/training/matrix?fstatus=Expired', 'clock')}
      ${kpi('Assessments outstanding', sm.assess, `${ses.length} session(s) scheduled`, sm.assess ? 'amber' : 'green', '#/training/matrix?fstatus=Assessment%20outstanding', 'target')}</div>
    ${tabsHtml('#/training', tabs, tab)}${body}`;
  return { title: 'Training Management', nav: 'training', crumbs: [['Training', '#/training']], html };
};
const MX_F = {
  fsite: { all: 'All branches', list: () => orgSites().length > 1 ? branchOpts() : [], test: (x, v) => x.site === v },
  fdept: { all: 'All departments', list: () => S.departments.map(d => ({ value: d, label: d })), test: (x, v) => x.dept === v },
  fjob: { all: 'All job titles', list: () => [...new Set(trainees().map(x => x.jobTitle))].sort().map(j => ({ value: j, label: j })), test: (x, v) => x.jobTitle === v },
  fcourse: { all: 'All courses', list: () => courses().map(c => ({ value: c.id, label: c.name })), test: (x, v) => requiredFor(x).some(r => r.course === v) },
  fstatus: { all: 'Any status', list: () => ['Missing', 'Expired', 'Expiring', 'Booked', 'Assessment outstanding', 'Valid'].map(s => ({ value: s, label: s })).concat([{ value: 'gaps', label: 'Any gap' }]), test: (x, v) => requiredFor(x).some(r => v === 'gaps' ? gap(trStatus(x.id, r.course)) : trStatus(x.id, r.course) === v) }
};
function matrixHtml(T, q) {
  const all = T.filter(x => requiredFor(x).length), rows = regFilter(all, q, MX_F), cols = courses().filter(c => rows.some(x => requiredFor(x).some(r => r.course === c.id)) && (!q.fcourse || q.fcourse === c.id));
  return `<div class="card">${regFilterBar('#/training/matrix', q, all, rows.length, MX_F, 'Search name, job title…')}
    <div class="card-body flush">${rows.length && cols.length ? `<div class="table-wrap"><table class="tbl matrix"><thead><tr><th>Employee</th>${cols.map(c => `<th class="mx-h" title="${esc(c.name)}"><span>${esc(c.short || c.name)}</span></th>`).join('')}</tr></thead><tbody>
      ${rows.map(x => { const req = requiredFor(x); return `<tr><td><a href="#/people/${x.id}"><b>${esc(x.name)}</b></a><div class="t-sub">${esc(x.jobTitle)} · ${esc(sname(x.site))}</div></td>${cols.map(c => { const r = req.find(z => z.course === c.id); if (!r) return '<td class="mx-na" title="Not required">·</td>'; const s = trStatus(x.id, c.id), rec = lastRecord(x.id, c.id);
        return `<td class="mx-c"><button type="button" class="mx-cell mx-${TR_TONE[s]}" data-act="trCell" data-p="${x.id}" data-c="${c.id}" title="${esc(c.name)} — ${s}${rec && rec.expires ? ', valid until ' + fmt(rec.expires) : ''} (${esc(r.why)})">${esc(s === 'Valid' ? '✓' : s === 'Expiring' ? fmt(rec.expires).replace(/ \d{4}$/, '') : s === 'Booked' ? 'Booked' : s === 'Missing' ? 'Missing' : s === 'Expired' ? 'Expired' : 'Assess')}</button></td>`; }).join('')}</tr>`; }).join('')}
    </tbody></table></div>
    <div class="mx-legend">${Object.entries({ Valid: 'green', Expiring: 'amber', 'Expired / missing': 'red', Booked: 'blue' }).map(([l, t]) => `<span><i class="mx-${t}"></i>${l}</span>`).join('')}<button class="btn sm" data-act="trCsv">${icon('download', 'sm')} Export to Excel (CSV)</button></div>` : emptyList(all.length ? 'Nobody matches these filters.' : 'No training requirements set up yet. Add them under Courses & requirements.')}</div></div>`;
}
ACT.trCsv = () => { const T = trainees().filter(x => requiredFor(x).length), C = courses(); const rows = [['Employee', 'Employee number', 'Job title', 'Branch', 'Department'].concat(C.map(c => c.name))];
  T.forEach(x => { const req = requiredFor(x); rows.push([x.name, x.empNo || '', x.jobTitle, sname(x.site), x.dept].concat(C.map(c => { if (!req.some(r => r.course === c.id)) return ''; const s = trStatus(x.id, c.id), r = lastRecord(x.id, c.id); return s + (r && r.expires ? ' (until ' + r.expires + ')' : ''); }))); });
  csvDownload('Training_matrix', rows); };
ACT.trCell = (el) => { const x = person(el.dataset.p), c = course(el.dataset.c), r = lastRecord(x.id, c.id), s = trStatus(x.id, c.id), req = requiredFor(x).find(z => z.course === c.id);
  openModal({ title: `${c.name} — ${x.name}`, sub: `Required because: ${req ? req.why : '—'}`, body: `<div class="kv"><div>Status</div><div>${badge(s, TR_TONE[s])}</div><div>Last trained</div><div>${r ? fmt(r.date) + (r.provider ? ' · ' + esc(r.provider) : '') : '—'}</div><div>Valid until</div><div>${r && r.expires ? dueText(r.expires) : r ? 'Does not expire' : '—'}</div>${c.competency ? `<div>Competency assessment</div><div>${r && r.result ? esc(r.result) + (r.assessedBy ? ' · ' + esc(pname(r.assessedBy)) : '') : '—'}</div>` : ''}<div>Certificate</div><div>${r && r.cert ? `<button type="button" class="link-btn" ${fileAttrs(r.cert)}>${esc(r.cert.name)}</button>` : '—'}</div></div>`,
    buttons: canTraining() ? [r && c.competency && r.result !== 'Competent' ? { label: 'Record assessment', cls: '', onClick: () => { setTimeout(() => ACT.trAssess({ dataset: { id: r.id } }), 30); } } : null, { label: 'Record training', cls: 'primary', onClick: () => { setTimeout(() => ACT.trRecord({ dataset: { p: x.id, c: c.id } }), 30); } }].filter(Boolean) : [] }); };

/* ---------------- Records ---------------- */
const REC_F = {
  fcourse: { all: 'All courses', list: () => courses().map(c => ({ value: c.id, label: c.name })), test: (r, v) => r.course === v },
  fperson: { all: 'All employees', list: () => personOpts(p => (S.trainingRecs || []).some(r => r.person === p.id)), test: (r, v) => r.person === v },
  fsite: { all: 'All branches', list: () => orgSites().length > 1 ? branchOpts() : [], test: (r, v) => (person(r.person) || {}).site === v },
  fvalid: { all: 'Any validity', list: () => [{ value: 'expired', label: 'Expired' }, { value: 'expiring', label: `Expiring in ${EXPIRING_DAYS} days` }, { value: 'valid', label: 'Valid' }], test: (r, v) => { const d = r.expires ? daysTo(r.expires) : 99999; return v === 'expired' ? d < 0 : v === 'expiring' ? d >= 0 && d <= EXPIRING_DAYS : d > EXPIRING_DAYS; } }
};
function recordsHtml(q) {
  const all = (S.trainingRecs || []).filter(r => r.org === S.ui.org && (S.ui.site === 'ALL' || (person(r.person) || {}).site === S.ui.site)).sort((a, b) => b.date.localeCompare(a.date)), rows = regFilter(all, q, REC_F);
  return `<div class="card">${regFilterBar('#/training/records', q, all, rows.length, REC_F, 'Search employee, course, provider…')}<div class="card-body flush">${rows.length ? `<div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Employee</th><th>Course</th><th>Date</th><th>Provider</th><th>Valid until</th><th>Assessment</th><th>Certificate</th></tr></thead><tbody>
    ${rows.map(r => { const c = course(r.course) || {}; return `<tr><td data-label="Employee"><a href="#/people/${r.person}">${esc(pname(r.person))}</a></td><td data-label="Course"><b>${esc(c.name || r.course)}</b>${r.session ? `<div class="t-sub">${r.session}</div>` : ''}</td><td data-label="Date">${fmt(r.date)}</td><td data-label="Provider">${esc(r.provider || c.provider || '—')}</td><td data-label="Valid until">${r.expires ? dueText(r.expires) : '<span class="muted">No expiry</span>'}</td><td data-label="Assessment">${c.competency ? (r.result ? badge(r.result, r.result === 'Competent' ? 'green' : 'red', true) : canTraining() ? `<button class="btn sm" data-act="trAssess" data-id="${r.id}">Record</button>` : '<span class="due amber">Outstanding</span>') : '<span class="muted">Not needed</span>'}</td><td data-label="Certificate">${r.cert ? `<button type="button" class="link-btn" ${fileAttrs(r.cert)}>${esc(r.cert.name)}</button>` : '—'}</td></tr>`; }).join('')}
  </tbody></table></div>` : emptyList(all.length ? 'No records match these filters.' : 'No training recorded yet.')}</div></div>`;
}
function expiryFor(cid, date) { const c = course(cid); return c && c.validity ? addMonths(date, c.validity) : ''; }
ACT.trRecord = (el) => { const d = (el && el.dataset) || {};
  openModal({ title: 'Record training', sub: 'Attendance and the certificate. For a course that needs a competency assessment, the result can be recorded now or later.', body: `<div class="form-grid">
    ${fld({ name: 'person', label: 'Employee', type: 'select', options: personOptions(d.p || '', p => p.status !== 'Deactivated'), required: true })}
    ${fld({ name: 'course', label: 'Course', type: 'select', options: opts(courses().map(c => ({ value: c.id, label: c.name })), d.c || '', '— Select —'), required: true })}
    ${fld({ name: 'date', label: 'Date attended', type: 'date', value: TODAY, required: true })}${fld({ name: 'provider', label: 'Provider / trainer' })}
    ${fld({ name: 'expires', label: 'Certificate valid until (filled from the course; empty = no expiry)', type: 'date' })}
    ${fld({ name: 'result', label: 'Competency assessment (if the course needs one)', type: 'select', options: opts(['Competent', 'Not yet competent'], '', 'Not assessed yet') })}
    ${fld({ name: 'cert', label: 'Certificate', type: 'file', full: true })}</div>`,
    onOpen: m => { const fill = () => { const cid = m.querySelector('[name=course]').value, c = course(cid); m.querySelector('[name=expires]').value = expiryFor(cid, m.querySelector('[name=date]').value); if (c && !m.querySelector('[name=provider]').value) m.querySelector('[name=provider]').value = c.provider || ''; }; m.querySelector('[name=course]').addEventListener('change', fill); m.querySelector('[name=date]').addEventListener('change', fill); fill(); },
    buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); S.trainingRecs = S.trainingRecs || []; const r = { id: nextId('TRN-', 'trainingRecs', 4), org: S.ui.org, person: v.person, course: v.course, date: v.date, provider: v.provider, expires: v.expires, cert: v.cert, result: v.result || '', assessedBy: v.result ? S.ui.user : null, by: S.ui.user, on: TODAY };
      S.trainingRecs.push(r); log(`Recorded training: ${pname(v.person)} — ${course(v.course).name}`, '#/training/records'); save(); toast('Training recorded.'); rerender(); } }] }); };
ACT.trAssess = (el) => { const r = byId('trainingRecs', el.dataset.id); openModal({ title: 'Competency assessment', sub: `${pname(r.person)} — ${course(r.course).name}`, body: `<div class="form-grid">${fld({ name: 'result', label: 'Result', type: 'select', options: opts(['Competent', 'Not yet competent']), required: true })}${fld({ name: 'notes', label: 'Notes', full: true })}</div>`,
  buttons: [{ label: 'Save', cls: 'primary', onClick: m => { const v = readForm(m); Object.assign(r, { result: v.result, assessedBy: S.ui.user, assessedOn: TODAY, assessNotes: v.notes }); log(`Competency assessment: ${pname(r.person)} — ${course(r.course).name}: ${v.result}`, '#/training/records'); save(); rerender(); } }] }); };

/* ---------------- Sessions (scheduled / refresher training) ---------------- */
function sessionsHtml() {
  const L = (S.trainingSessions || []).filter(s => s.org === S.ui.org).sort((a, b) => (a.status === 'Scheduled' ? 0 : 1) - (b.status === 'Scheduled' ? 0 : 1) || a.date.localeCompare(b.date));
  if (!L.length) return `<div class="card">${emptyList('No training sessions scheduled. Use "Schedule training" to book a course and invite the people who need it.')}</div>`;
  return `<div class="card"><div class="card-body flush"><div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Session</th><th>Date</th><th>Provider / venue</th><th>People</th><th>Status</th><th></th></tr></thead><tbody>${L.map(s => `<tr><td data-label="Session"><b>${esc((course(s.course) || {}).name || s.course)}</b><div class="t-sub mono">${s.id}</div></td><td data-label="Date">${s.status === 'Scheduled' ? dueText(s.date) : fmt(s.date)}</td><td data-label="Provider">${esc(s.provider || '—')}${s.venue ? `<div class="t-sub">${esc(s.venue)}</div>` : ''}</td><td data-label="People">${s.people.map(pname).join(', ')}</td><td data-label="Status">${badge(s.status, s.status === 'Scheduled' ? 'blue' : s.status === 'Completed' ? 'green' : 'grey')}</td><td>${s.status === 'Scheduled' && canTraining() ? `<button class="btn sm primary" data-act="trAttend" data-id="${s.id}">Record attendance</button>` : ''}</td></tr>`).join('')}</tbody></table></div></div></div>`;
}
ACT.trSession = () => openModal({ title: 'Schedule training', sub: 'Choose the course; the people who need it (missing, expired or expiring) are ticked for you.', size: 'wide', body: `<div class="form-grid">
    ${fld({ name: 'course', label: 'Course', type: 'select', options: opts(courses().map(c => ({ value: c.id, label: c.name })), '', '— Select —'), required: true, full: true })}
    ${fld({ name: 'date', label: 'Date', type: 'date', value: addDays(TODAY, 14), required: true })}${fld({ name: 'provider', label: 'Provider / trainer' })}${fld({ name: 'venue', label: 'Venue', full: true })}
    <div class="field full"><label>People</label><div id="trPeople" class="chk-col"><p class="muted">Select the course first.</p></div></div></div>`,
  onOpen: m => { const s = m.querySelector('[name=course]'); s.addEventListener('change', () => { const c = course(s.value); if (!c) return; m.querySelector('[name=provider]').value = c.provider || '';
    const need = trainees().filter(x => requiredFor(x).some(r => r.course === c.id)), others = trainees().filter(x => !need.includes(x));
    m.querySelector('#trPeople').innerHTML = need.concat(others).map(x => { const st = need.includes(x) ? trStatus(x.id, c.id) : 'Not required'; return `<label class="check"><input type="checkbox" name="tp_${x.id}" ${['Missing', 'Expired', 'Expiring', 'Not yet competent'].includes(st) ? 'checked' : ''}> <span>${esc(x.name)} <span class="t-sub">${esc(x.jobTitle)} · ${esc(sname(x.site))} · ${esc(st)}</span></span></label>`; }).join(''); }); },
  buttons: [{ label: 'Schedule', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m), ppl = trainees().filter(x => m.querySelector(`[name=tp_${x.id}]`) && m.querySelector(`[name=tp_${x.id}]`).checked).map(x => x.id);
    if (!ppl.length) { toast('Tick at least one person.', 'error'); return false; }
    S.trainingSessions = S.trainingSessions || []; const s = { id: nextId('TS-', 'trainingSessions'), org: S.ui.org, course: v.course, date: v.date, provider: v.provider, venue: v.venue, people: ppl, status: 'Scheduled', by: S.ui.user }; S.trainingSessions.push(s);
    const sup = [...new Set(ppl.map(id => (person(id) || {}).supervisor).filter(Boolean))];
    queueEmail(ppl.concat(sup), 'training', `Training booked: ${course(v.course).name} on ${fmt(v.date)}`, `${course(v.course).name} is booked for ${fmt(v.date)}${v.venue ? ' at ' + v.venue : ''}${v.provider ? ' (' + v.provider + ')' : ''}. Attending: ${ppl.map(pname).join(', ')}.`, '#/training/sessions');
    ppl.forEach(id => addEvent('blue', 'training', `Training booked for you: ${course(v.course).name}`, `${fmt(v.date)}${v.venue ? ' · ' + v.venue : ''}`, '#/notifications', 'ALL', [id]));
    log(`Scheduled ${course(v.course).name} on ${fmt(v.date)} for ${ppl.length} people`, '#/training/sessions'); save(); navigate('#/training/sessions'); } }] });
ACT.trAttend = (el) => { const s = byId('trainingSessions', el.dataset.id), c = course(s.course);
  openModal({ title: `Record attendance — ${c.name}`, sub: `${fmt(s.date)}. Untick anyone who did not attend.${c.competency ? ' Record each person\'s competency result.' : ''}`, size: 'wide', body: `<div class="form-grid">${fld({ name: 'date', label: 'Date held', type: 'date', value: s.date, required: true })}${fld({ name: 'cert', label: 'Attendance register / certificates (one file)', type: 'file' })}
    <div class="field full"><table class="tbl compact"><thead><tr><th>Attended</th><th>Person</th>${c.competency ? '<th>Competency</th>' : ''}</tr></thead><tbody>${s.people.map(id => `<tr><td><input type="checkbox" name="at_${id}" checked aria-label="Attended"></td><td>${esc(pname(id))}</td>${c.competency ? `<td><select name="res_${id}">${opts(['Competent', 'Not yet competent'], '', 'Not assessed yet')}</select></td>` : ''}</tr>`).join('')}</tbody></table></div></div>`,
    buttons: [{ label: 'Save attendance', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); S.trainingRecs = S.trainingRecs || []; let n = 0;
      s.people.forEach(id => { if (!m.querySelector(`[name=at_${id}]`).checked) return; n++; const res = c.competency ? m.querySelector(`[name=res_${id}]`).value : ''; S.trainingRecs.push({ id: nextId('TRN-', 'trainingRecs', 4), org: s.org, person: id, course: s.course, date: v.date, provider: s.provider, expires: expiryFor(s.course, v.date), cert: v.cert, result: res, assessedBy: res ? S.ui.user : null, session: s.id, by: S.ui.user, on: TODAY }); });
      s.status = 'Completed'; s.held = v.date; s.attended = n; log(`Recorded attendance for ${c.name} (${s.id}): ${n} of ${s.people.length} attended`, '#/training/sessions'); save(); rerender(); } }] }); };

/* ---------------- Courses & requirements ---------------- */
function coursesHtml() {
  const R = (S.trainingReqs || []).filter(r => r.org === S.ui.org);
  return `<div class="card mb"><div class="card-head"><h2>Courses</h2></div><div class="card-body flush"><div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Course</th><th>Category</th><th>Provider</th><th>Valid for</th><th>Competency assessment</th><th>People requiring it</th>${canTraining() ? '<th></th>' : ''}</tr></thead><tbody>${courses().map(c => `<tr><td data-label="Course"><b>${esc(c.name)}</b></td><td data-label="Category">${esc(c.category || '—')}</td><td data-label="Provider">${esc(c.provider || '—')}</td><td data-label="Valid for">${c.validity ? c.validity + ' months' : '<span class="muted">Does not expire</span>'}</td><td data-label="Assessment">${c.competency ? 'Required' : '—'}</td><td data-label="Requiring">${trainees().filter(x => requiredFor(x).some(r => r.course === c.id)).length}</td>${canTraining() ? `<td><button class="btn sm" data-act="crsEdit" data-id="${c.id}">${icon('edit', 'sm')} Edit</button></td>` : ''}</tr>`).join('')}</tbody></table></div></div></div>
  <div class="card"><div class="card-head"><h2>Training requirements</h2><span class="ch-sub">Who needs which course</span></div><div class="card-body flush">${R.length ? `<div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Course</th><th>Required for</th><th>People</th>${canTraining() ? '<th></th>' : ''}</tr></thead><tbody>${R.map(r => `<tr><td data-label="Course"><b>${esc((course(r.course) || {}).name || r.course)}</b></td><td data-label="Required for">${esc(reqLabel(r))}</td><td data-label="People">${trainees().filter(x => requiredFor(x).some(z => z.course === r.course && z.why === reqLabel(r))).length}</td>${canTraining() ? `<td><button class="btn sm ghost" data-act="treqDel" data-id="${r.id}" aria-label="Remove requirement">${icon('x', 'sm')}</button></td>` : ''}</tr>`).join('')}</tbody></table></div>` : emptyList('No requirements yet.')}</div></div>`;
}
ACT.crsEdit = (el) => { const c = el && el.dataset && el.dataset.id ? course(el.dataset.id) : null;
  openModal({ title: c ? 'Edit course' : 'New course', body: `<div class="form-grid">${fld({ name: 'name', label: 'Course name', value: c ? c.name : '', required: true, full: true })}${fld({ name: 'short', label: 'Short name (matrix column)', value: c ? c.short || '' : '' })}${fld({ name: 'category', label: 'Category', type: 'select', options: opts(S.config.trainingCats || ['Induction', 'Operator', 'Emergency', 'Legal appointment', 'Hazardous substances', 'Other'], c ? c.category : 'Other') })}
    ${fld({ name: 'provider', label: 'Usual provider', value: c ? c.provider || '' : '' })}${fld({ name: 'validity', label: 'Certificate valid for (months; empty = does not expire)', type: 'number', min: 1, value: c ? c.validity || '' : '' })}${fld({ name: 'competency', label: 'Needs a competency assessment after attendance', type: 'checkbox', value: c ? c.competency : false, full: true })}</div>`,
    buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m), o = { name: v.name, short: v.short, category: v.category, provider: v.provider, validity: v.validity ? Math.round(+v.validity) : null, competency: v.competency };
      if (c) Object.assign(c, o); else { S.courses = S.courses || []; S.courses.push(Object.assign({ id: nextId('CRS-', 'courses'), org: S.ui.org }, o)); } log(`Saved course "${v.name}"`, '#/training/courses'); save(); rerender(); } }] }); };
ACT.treqNew = () => openModal({ title: 'Add a training requirement', body: `<div class="form-grid">
    ${fld({ name: 'course', label: 'Course', type: 'select', options: opts(courses().map(c => ({ value: c.id, label: c.name })), '', '— Select —'), required: true, full: true })}
    ${fld({ name: 'by', label: 'Required for', type: 'select', options: opts([{ value: 'job', label: 'A job title' }, { value: 'appointment', label: 'An appointment type' }, { value: 'activity', label: 'An activity (named people)' }, { value: 'all', label: 'Everyone' }]), required: true })}
    <div class="field" id="trqJob">${fld({ name: 'job', label: 'Job title', type: 'select', options: opts([...new Set(S.people.filter(p => p.org === S.ui.org).map(p => p.jobTitle))].sort()) })}</div>
    <div class="field hidden" id="trqApt">${fld({ name: 'apt', label: 'Appointment type', type: 'select', options: opts((S.config.apptTypes || []).map(t => ({ value: t.id, label: t.name }))) })}</div>
    <div class="field full hidden" id="trqAct">${fld({ name: 'activity', label: 'Activity', placeholder: 'e.g. Works at height' })}<div class="chk-col">${trainees().map(x => `<label class="check"><input type="checkbox" name="ta_${x.id}"> <span>${esc(x.name)} <span class="t-sub">${esc(x.jobTitle)}</span></span></label>`).join('')}</div></div></div>`,
  onOpen: m => { const b = m.querySelector('[name=by]'), sync = () => { m.querySelector('#trqJob').classList.toggle('hidden', b.value !== 'job'); m.querySelector('#trqApt').classList.toggle('hidden', b.value !== 'appointment'); m.querySelector('#trqAct').classList.toggle('hidden', b.value !== 'activity'); }; b.addEventListener('change', sync); sync(); },
  buttons: [{ label: 'Add', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); const r = { id: nextId('TRQ-', 'trainingReqs'), org: S.ui.org, course: v.course, by: v.by, value: v.by === 'job' ? v.job : v.by === 'appointment' ? v.apt : v.by === 'activity' ? v.activity : '', people: v.by === 'activity' ? trainees().filter(x => m.querySelector(`[name=ta_${x.id}]`).checked).map(x => x.id) : [] };
    if (v.by === 'activity' && (!r.value || !r.people.length)) { toast('Name the activity and tick the people who do it.', 'error'); return false; }
    S.trainingReqs = S.trainingReqs || []; S.trainingReqs.push(r); log(`Training requirement added: ${course(v.course).name} — ${reqLabel(r)}`, '#/training/courses'); save(); rerender(); } }] });
ACT.treqDel = (el) => confirmBox('Remove this requirement?', 'Training records are kept.', 'Remove', () => { S.trainingReqs = S.trainingReqs.filter(r => r.id !== el.dataset.id); log('Removed a training requirement', '#/training/courses'); save(); rerender(); });

/* ---------------- On the employee profile ---------------- */
function trainingFor(x) { const req = requiredFor(x), recs = (S.trainingRecs || []).filter(r => r.person === x.id);
  return `<div class="card"><div class="card-head"><h2>Training</h2><a class="btn sm" href="#/training/records?fperson=${x.id}">All records</a></div><div class="card-body flush">${req.length ? `<div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Required course</th><th>Why</th><th>Status</th><th>Valid until</th></tr></thead><tbody>${req.map(q => { const s = trStatus(x.id, q.course), r = lastRecord(x.id, q.course); return `<tr><td data-label="Course"><b>${esc(course(q.course).name)}</b></td><td data-label="Why">${esc(q.why)}</td><td data-label="Status">${badge(s, TR_TONE[s])}</td><td data-label="Valid until">${r && r.expires ? fmt(r.expires) : r ? 'No expiry' : '—'}</td></tr>`; }).join('')}</tbody></table></div>` : `<div class="card-body muted">No required training. ${recs.length} record(s) on file.</div>`}</div></div>`; }

/* ---------------- Reminders ---------------- */
if (typeof MAIL_CATS === 'object') MAIL_CATS.training = 'Training: bookings, expiring and expired certificates';
const _mailPrefsBeforeTraining = mailPrefs; mailPrefs = function (p) { return Object.assign({ training: true }, _mailPrefsBeforeTraining(p)); };
function runTrainingReminders() {
  if (!S || !S.ui || !S.ui.org || !S.trainingRecs) return; let changed = false;
  S.people.filter(x => x.org === S.ui.org && x.status !== 'Deactivated').forEach(x => requiredFor(x).forEach(q => { const r = lastRecord(x.id, q.course); if (!r || !r.expires) return; const d = daysTo(r.expires), c = course(q.course); r.sent = r.sent || {};
    const once = (stage, to, subj, text) => { if (r.sent[stage]) return; const u = S.ui.user; S.ui.user = null; try { queueEmail(to, 'training', subj, text, '#/training/matrix'); } finally { S.ui.user = u; } r.sent[stage] = TODAY; changed = true; };
    if (d >= 0 && d <= EXPIRING_DAYS && !bookedFor(x.id, q.course)) once('expiring', [x.id, x.supervisor], `${c.name} expires on ${fmt(r.expires)} — ${x.name}`, `${x.name}'s ${c.name} certificate expires on ${fmt(r.expires)}. Book a refresher in time.`);
    if (d < 0 && !bookedFor(x.id, q.course)) once('expired', [x.id, x.supervisor].concat(hseqManagers(x.org)), `Expired: ${c.name} — ${x.name}`, `${x.name}'s ${c.name} certificate expired on ${fmt(r.expires)}. It is required (${q.why}). Book training.`); }));
  if (changed) save();
}
const _rerenderBeforeTraining = rerender;
rerender = function (keepScroll) { if (S && typeof signedIn === 'function' && signedIn() && S.ui.user) { try { runTrainingReminders(); } catch (e) { console.error(e); } } _rerenderBeforeTraining(keepScroll); };

/* ---------------- Wiring ---------------- */
(() => { const g = NAV.find(x => x.group === 'People'); if (g && !g.items.some(i => i[0] === 'training')) g.items.push(['training', 'Training Management', 'checkCircle']); })();
AREA_OF.training = 'area.training';
if (!TOP_ROUTES.includes('training')) TOP_ROUTES.push('training');
const _needsBackBeforeTraining = needsBack;
needsBack = function (parts) { if (parts[0] === 'training' && ['matrix', 'records', 'courses', 'sessions'].includes(parts[1])) return false; return _needsBackBeforeTraining(parts); };
const _myTasksBeforeTraining = myTasks;
myTasks = function () {
  const out = _myTasksBeforeTraining(), uid = S.ui.user;
  (S.trainingSessions || []).filter(s => s.org === S.ui.org && s.status === 'Scheduled' && s.people.includes(uid) && daysTo(s.date) <= 14).forEach(s => out.push({ title: `Attend training: ${(course(s.course) || {}).name}`, sub: `${fmt(s.date)}${s.venue ? ' · ' + s.venue : ''}`, link: '#/notifications', sev: 'blue' }));
  if (canTraining()) { const sm = trainingSummary(trainees()); if (sm.missing + sm.expired) out.push({ title: `Training gaps: ${sm.missing} missing, ${sm.expired} expired`, sub: 'Schedule training for the people who need it', link: '#/training/matrix?fstatus=gaps', sev: sm.expired ? 'red' : 'amber' });
    (S.trainingSessions || []).filter(s => s.org === S.ui.org && s.status === 'Scheduled' && daysTo(s.date) < 0).forEach(s => out.push({ title: `Record attendance: ${(course(s.course) || {}).name} (${fmt(s.date)})`, sub: s.id, link: '#/training/sessions', sev: 'amber' })); }
  return out;
};

/* ---------------- Demo data ---------------- */
MIGRATIONS.push(() => {
  if (S.migr && S.migr.training) return; S.migr = S.migr || {}; S.migr.training = true;
  addArea('area.training', 'Training management', 'area.people', 'area.documents');
  addPerm('training.manage', 'Manage training: courses, requirements, records and sessions', ['HSEQ Manager', 'Safety Consultant', 'Branch Manager']);
  S.config.trainingCats = S.config.trainingCats || ['Induction', 'Operator', 'Emergency', 'Legal appointment', 'Hazardous substances', 'Other'];
  S.courses = S.courses || []; S.trainingReqs = S.trainingReqs || []; S.trainingRecs = S.trainingRecs || []; S.trainingSessions = S.trainingSessions || [];
  const C = (id, name, short, category, provider, validity, competency) => { if (!byId('courses', id)) S.courses.push({ id, org: 'ORG-1', name, short, category, provider, validity, competency }); };
  C('CRS-001', 'General HSEQ induction', 'Induction', 'Induction', 'In-house (HSEQ)', 24, false);
  C('CRS-002', 'Lift truck operator (counterbalance)', 'Lift truck', 'Operator', 'Accredited provider (demo)', 12, true);
  C('CRS-003', 'First aid level 1', 'First aid', 'Emergency', 'Training provider (demo)', 36, false);
  C('CRS-004', 'Fire fighting and evacuation', 'Fire', 'Emergency', 'Fire safety provider (demo)', 12, false);
  C('CRS-005', 'Health and safety representative training', 'SHE rep', 'Legal appointment', 'Training provider (demo)', null, false);
  C('CRS-006', 'Safe handling of hazardous chemicals', 'Chemicals', 'Hazardous substances', 'In-house (HSEQ)', 24, false);
  const R = (id, course, by, value, people) => { if (!byId('trainingReqs', id)) S.trainingReqs.push({ id, org: 'ORG-1', course, by, value, people: people || [] }); };
  R('TRQ-001', 'CRS-001', 'all', ''); R('TRQ-002', 'CRS-002', 'job', 'Forklift Operator'); R('TRQ-003', 'CRS-002', 'appointment', 'AT-FLO');
  R('TRQ-004', 'CRS-003', 'appointment', 'AT-FIRST'); R('TRQ-005', 'CRS-004', 'appointment', 'AT-FIRE'); R('TRQ-006', 'CRS-005', 'appointment', 'AT-SHEREP');
  R('TRQ-007', 'CRS-006', 'activity', 'Uses degreaser in the workshop', ['P-008', 'P-010']);
  const T = (id, person, course, days, extra) => { if (byId('trainingRecs', id)) return; const date = addDays(TODAY, days), c = byId('courses', course); S.trainingRecs.push(Object.assign({ id, org: 'ORG-1', person, course, date, provider: c.provider, expires: c.validity ? addMonths(date, c.validity) : '', cert: { name: `Certificate_${course}_${person}.pdf`, type: 'application/pdf', size: 52000, seeded: true }, result: c.competency ? 'Competent' : '', assessedBy: c.competency ? 'P-002' : null, by: 'P-002', on: date }, extra || {})); };
  // induction: most people current, two expired, one missing (Sizwe)
  ['P-001', 'P-002', 'P-003', 'P-004', 'P-005', 'P-007', 'P-008', 'P-009', 'P-010', 'P-011', 'P-012', 'P-016', 'P-019'].forEach((pid, k) => T('TRN-' + (2001 + k), pid, 'CRS-001', -60 - k * 25));
  T('TRN-2020', 'P-014', 'CRS-001', -760); T('TRN-2021', 'P-020', 'CRS-001', -2); delete (byId('trainingRecs', 'TRN-2021') || {}).cert;
  S.trainingRecs = S.trainingRecs.filter(r => r.id !== 'TRN-2021');   // Sizwe: induction still missing
  T('TRN-2030', 'P-009', 'CRS-002', -300); T('TRN-2031', 'P-012', 'CRS-002', -380); T('TRN-2032', 'P-014', 'CRS-002', -400);
  T('TRN-2040', 'P-011', 'CRS-003', -1065);  // first aid expiring in about a month
  T('TRN-2050', 'P-008', 'CRS-006', -200); T('TRN-2051', 'P-010', 'CRS-006', -30, { result: '' });
  if (!byId('trainingSessions', 'TS-001')) S.trainingSessions.push({ id: 'TS-001', org: 'ORG-1', course: 'CRS-001', date: addDays(TODAY, 9), provider: 'In-house (HSEQ)', venue: 'Germiston training room', people: ['P-020', 'P-014'], status: 'Scheduled', by: 'P-002' });
});
