/* ==========================================================================
   People Management (specification module 6)
   --------------------------------------------------------------------------
   - Employee register: everyone in the company, with or without a system
     login: employee number, job title, branch, department, supervisor,
     status; transfers and leavers keep their history.
   - Legal appointments, two methods in ONE register:
       Digital  — the manager completes the appointment and issues it; the
                  employee opens and reads it in their app, acknowledges it,
                  then accepts it with a signature (or declines with a reason,
                  or asks for clarification). Identity and times are recorded;
                  it is never "accepted" before the employee has done this.
                  A material change makes a new version that must be accepted
                  again; earlier versions are kept.
       Uploaded — an appointment signed on paper elsewhere is uploaded with
                  its signed letter. It is labelled "Uploaded" and is never
                  shown as digitally accepted.
     Not every appointment has an end date.
   - Responsibilities: operational responsibilities (optionally linked to a
     legal requirement), acknowledged by the person where required.
   - Competency records: qualifications, certificates, experience,
     registrations and competency assessments with documents.
   The employer's statutory duties stay with the employer.
   ========================================================================== */
'use strict';

const canPeople = () => can('people.manage');
const APT_DIGITAL = ['Draft', 'Sent to employee', 'Awaiting acknowledgement', 'Awaiting acceptance', 'Accepted', 'Active', 'Declined', 'Clarification requested', 'Ended', 'Withdrawn'];
const APT_UPLOADED = ['Draft', 'Awaiting supporting documents', 'Uploaded', 'Active', 'Ended', 'Withdrawn'];
const APT_TONE = { 'Draft': 'grey', 'Sent to employee': 'blue', 'Awaiting acknowledgement': 'blue', 'Awaiting acceptance': 'amber', 'Accepted': 'green', 'Active': 'green', 'Declined': 'red', 'Clarification requested': 'orange', 'Ended': 'grey', 'Withdrawn': 'grey', 'Awaiting supporting documents': 'amber', 'Uploaded': 'green' };
const COMP_KINDS = ['Qualification', 'Certificate', 'Experience', 'Registration', 'Competency assessment'];
const apptTypes = () => S.config.apptTypes || [];
const aptType = a => apptTypes().find(t => t.id === a.type) || { name: a.type };
// Status shown: an accepted / uploaded appointment becomes Active from its effective date and Ended after its end date
function aptStatus(a) {
  if (['Accepted', 'Uploaded'].includes(a.status)) { if (a.end && daysTo(a.end) < 0) return 'Ended'; return daysTo(a.effective) <= 0 ? 'Active' : a.status; }
  return a.status;
}
const aptOpen = a => ['Sent to employee', 'Awaiting acknowledgement', 'Awaiting acceptance', 'Clarification requested'].includes(a.status);
const aptMissingDocs = a => a.method === 'Uploaded' && !['Ended', 'Withdrawn'].includes(aptStatus(a)) && (!a.file || (aptType(a).competency && !(a.compDocs || []).length));
const appointments = () => (S.appointments || []).filter(a => a.org === S.ui.org && inSite(a, S.ui.site));
function aptHist(a, action, comment) { (a.history = a.history || []).push({ ts: nowTs(), by: S.ui.user, action, comment: comment || '' }); }
const employees = () => S.people.filter(p => p.org === S.ui.org && (S.ui.site === 'ALL' || p.site === S.ui.site));

/* ---------------- Route ---------------- */
ROUTES.people = (p, q = {}) => {
  if (!canPeople() && !can('report.view') && !(p[0] && /^(APT|P)-/.test(p[0]))) return ROUTES.me([]);
  if (p[0] && /^APT-/.test(p[0])) return aptDetail(p[0]);
  if (p[0] && /^P-/.test(p[0])) return personProfile(p[0]);
  const tab = ['employees', 'appointments', 'responsibilities'].includes(p[0]) ? p[0] : 'employees';
  const A = appointments(), emp = employees().filter(x => x.status !== 'Deactivated'), R = (S.responsibilities || []).filter(r => r.org === S.ui.org);
  const unalloc = (S.legalReqs || []).filter(r => r.org === S.ui.org && r.applicability === 'Applicable' && !r.owner).length + R.filter(r => !r.person).length;
  const tabs = [['employees', 'Employees', emp.length], ['appointments', 'Legal appointments', A.length], ['responsibilities', 'Responsibilities', R.length]];
  let body = '', fab = '';
  if (tab === 'employees') { body = employeesHtml(q); fab = canPeople() ? fabBtn('empNew', 'Add employee') : ''; }
  if (tab === 'appointments') { body = appointmentsHtml(A, q); fab = canPeople() ? fabStack([{ act: 'aptNew', label: 'New appointment' }]) : ''; }
  if (tab === 'responsibilities') { body = respHtml(R); fab = canPeople() ? fabBtn('respNew', 'Allocate responsibility') : ''; }
  const st = s => A.filter(a => aptStatus(a) === s).length;
  const html = `${pageHead('People Management', 'Employees, legal appointments, responsibilities and competency. Appointments can be issued digitally for the employee to accept in their app, or an existing signed appointment can be uploaded — both in one register.', '', scopePill())}${fab}
    <div class="kpis kpis-8">${kpi('Employees', emp.length, `${emp.filter(x => !x.sysRole).length} without a system login`, 'blue', '#/people/employees', 'people')}
      ${kpi('Active appointments', st('Active'), `${A.filter(a => a.method === 'Digital').length} digital · ${A.filter(a => a.method === 'Uploaded').length} uploaded`, 'green', '#/people/appointments?fstatus=Active', 'checkCircle')}
      ${kpi('Awaiting acceptance', A.filter(aptOpen).length - st('Clarification requested'), 'Sent, not yet accepted', A.filter(aptOpen).length ? 'amber' : 'green', '#/people/appointments?fflag=open', 'clock')}
      ${kpi('Declined', st('Declined'), 'Needs a decision', st('Declined') ? 'red' : 'green', '#/people/appointments?fstatus=Declined', 'x')}
      ${kpi('Clarification requested', st('Clarification requested'), 'Employee asked a question', st('Clarification requested') ? 'amber' : 'green', '#/people/appointments?fstatus=Clarification%20requested', 'info')}
      ${kpi('Missing documents', A.filter(aptMissingDocs).length, 'Uploaded without the signed letter or competency proof', A.filter(aptMissingDocs).length ? 'amber' : 'green', '#/people/appointments?fflag=docs', 'docs')}
      ${kpi('Ended / withdrawn', st('Ended') + st('Withdrawn'), 'Kept on record', 'blue', '#/people/appointments?fstatus=Ended', 'docs')}
      ${kpi('Unallocated responsibilities', unalloc, 'Legal requirements or responsibilities without a person', unalloc ? 'amber' : 'green', '#/people/responsibilities', 'target')}</div>
    ${tabsHtml('#/people', tabs, tab)}${body}`;
  return { title: 'People Management', nav: 'people', crumbs: [['People', '#/people']], html };
};

/* ---------------- Employees ---------------- */
const EMP_F = {
  fsite: { all: 'All branches', list: () => orgSites().length > 1 ? branchOpts() : [], test: (x, v) => x.site === v },
  fdept: { all: 'All departments', list: () => S.departments.map(d => ({ value: d, label: d })), test: (x, v) => x.dept === v },
  ftype: { all: 'Employees and contractors', list: () => [{ value: 'Employee', label: 'Employees' }, { value: 'Contractor', label: 'Contractors' }, { value: 'Consultant', label: 'Consultants' }], test: (x, v) => x.type === v },
  fstatus: { all: 'Current employees', list: () => [{ value: 'left', label: 'Left / deactivated' }, { value: 'all', label: 'Everyone' }], test: () => true }
};
function employeesHtml(q) {
  const all = employees(), base = regFilter(all, q, EMP_F), rows = base.filter(x => q.fstatus === 'all' ? true : q.fstatus === 'left' ? x.status === 'Deactivated' : x.status !== 'Deactivated');
  return `<div class="card">${regFilterBar('#/people/employees', q, all, rows.length, EMP_F, 'Search name, employee number, job title…')}<div class="card-body flush">${rows.length ? `<div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Employee</th><th>Job title</th><th>Branch / department</th><th>Reports to</th><th>Appointments</th><th>System login</th></tr></thead><tbody>
    ${rows.map(x => { const ap = (S.appointments || []).filter(a => a.person === x.id && ['Active', 'Accepted', 'Uploaded'].includes(aptStatus(a))).length, open = (S.appointments || []).filter(a => a.person === x.id && aptOpen(a)).length;
      return `<tr class="rowlink ${x.status === 'Deactivated' ? 'row-paused' : ''}" data-href="#/people/${x.id}"><td data-label="Employee"><b>${esc(x.name)}</b><div class="t-sub mono">${esc(x.empNo || x.id)}</div></td><td data-label="Job title">${esc(x.jobTitle || '')}${x.type !== 'Employee' ? ' ' + badge(x.type, 'grey', true) : ''}</td><td data-label="Branch">${esc(sname(x.site))}<div class="t-sub">${esc(x.dept || '')}</div></td><td data-label="Reports to">${x.supervisor ? esc(pname(x.supervisor)) : '—'}</td><td data-label="Appointments">${ap}${open ? ` · <span class="due amber">${open} awaiting</span>` : ''}</td><td data-label="Login">${x.status === 'Deactivated' ? badge('Left', 'grey', true) : x.sysRole ? esc(x.sysRole) : '<span class="muted">No login</span>'}</td></tr>`; }).join('')}
  </tbody></table></div>` : emptyList('No employees match these filters.')}</div></div>`;
}
function empForm(x) { return `<div class="form-grid">
  ${fld({ name: 'name', label: 'Full name', value: x ? x.name : '', required: true })}
  ${fld({ name: 'empNo', label: 'Employee number', value: x ? x.empNo || '' : '' })}
  ${fld({ name: 'jobTitle', label: 'Job title', value: x ? x.jobTitle || '' : '', required: true })}
  ${fld({ name: 'type', label: 'Type', type: 'select', options: opts(['Employee', 'Contractor', 'Consultant'], x ? x.type : 'Employee') })}
  ${x ? '' : fld({ name: 'site', label: 'Branch', type: 'select', options: siteOptions(defaultSite(), false), required: true })}
  ${x ? '' : fld({ name: 'dept', label: 'Department', type: 'select', options: opts(S.departments, 'Warehouse & Logistics'), required: true })}
  ${fld({ name: 'supervisor', label: 'Reports to (supervisor / manager)', type: 'select', options: personOptions(x ? x.supervisor : '', p => !x || p.id !== x.id) })}
  ${fld({ name: 'email', label: 'E-mail (optional — needed only for e-mails or a login)', type: 'email', value: x ? x.email || '' : '' })}
  ${fld({ name: 'phone', label: 'Mobile number (optional)', value: x ? x.phone || '' : '' })}
  ${fld({ name: 'startDate', label: 'Start date', type: 'date', value: x ? x.startDate || '' : TODAY })}</div>
  <p class="muted" style="font-size:12px">A system login is given separately under Administration → Users & roles. Employees without a login still appear in registers, appointments and training.</p>`; }
ACT.empNew = () => openModal({ title: 'Add employee', size: 'wide', body: empForm(null), buttons: [{ label: 'Add employee', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m);
  if (v.empNo && S.people.some(p => p.org === siteOrgOf(v.site) && p.empNo === v.empNo)) { toast('This employee number is already used.', 'error'); return false; }
  const id = 'P-' + String(Math.max(...S.people.map(p => +p.id.slice(2) || 0)) + 1).padStart(3, '0');
  S.people.push({ id, name: v.name, empNo: v.empNo, jobTitle: v.jobTitle, type: v.type, site: v.site, org: siteOrgOf(v.site), dept: v.dept, supervisor: v.supervisor || null, email: v.email, phone: v.phone, startDate: v.startDate, sysRole: null, status: 'Active', history: [{ ts: nowTs(), by: S.ui.user, text: `Added at ${sname(v.site)}, ${v.dept}` }] });
  log(`Added employee ${v.name} (${id})`, '#/people/' + id); save(); navigate('#/people/' + id); } }] });
ACT.empEdit = (el) => { const x = person(el.dataset.id); openModal({ title: `Edit ${x.name}`, size: 'wide', body: empForm(x), buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m);
  Object.assign(x, { name: v.name, empNo: v.empNo, jobTitle: v.jobTitle, type: v.type, supervisor: v.supervisor || null, email: v.email, phone: v.phone, startDate: v.startDate }); (x.history = x.history || []).push({ ts: nowTs(), by: S.ui.user, text: 'Details updated' }); log(`Updated employee ${x.name}`, '#/people/' + x.id); save(); rerender(); } }] }); };
ACT.empTransfer = (el) => { const x = person(el.dataset.id); openModal({ title: `Transfer ${x.name}`, sub: 'The move is kept in the employee\'s history. Records stay linked to the person.', body: `<div class="form-grid">
    ${fld({ name: 'site', label: 'New branch', type: 'select', options: siteOptions(x.site, false), required: true })}${fld({ name: 'dept', label: 'New department', type: 'select', options: opts(S.departments, x.dept), required: true })}
    ${fld({ name: 'jobTitle', label: 'Job title', value: x.jobTitle || '', required: true })}${fld({ name: 'date', label: 'Effective date', type: 'date', value: TODAY, required: true })}
    ${fld({ name: 'reason', label: 'Reason', full: true })}</div>${(S.appointments || []).some(a => a.person === x.id && aptStatus(a) === 'Active') ? `<div class="alert info mt-s" style="margin-bottom:0">${icon('info')}<div>${esc(x.name)} has active appointments. Review them after the transfer — end or replace those that no longer apply.</div></div>` : ''}`,
  buttons: [{ label: 'Transfer', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m), from = `${sname(x.site)}, ${x.dept}, ${x.jobTitle}`;
    Object.assign(x, { site: v.site, dept: v.dept, jobTitle: v.jobTitle }); (x.history = x.history || []).push({ ts: nowTs(), by: S.ui.user, date: v.date, text: `Transferred from ${from} to ${sname(v.site)}, ${v.dept}, ${v.jobTitle}${v.reason ? ' — ' + v.reason : ''}` });
    log(`Transferred ${x.name} to ${sname(v.site)}`, '#/people/' + x.id); save(); rerender(); } }] }); };
ACT.empLeave = (el) => { const x = person(el.dataset.id); openModal({ title: `${x.name} is leaving`, sub: 'The person is deactivated (and loses any login). All records are kept. Active appointments are ended.', body: `<div class="form-grid">${fld({ name: 'date', label: 'Last working day', type: 'date', value: TODAY, required: true })}${fld({ name: 'reason', label: 'Reason', full: true })}</div>`,
  buttons: [{ label: 'Deactivate', cls: 'danger', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); x.status = 'Deactivated'; x.leftOn = v.date; (x.history = x.history || []).push({ ts: nowTs(), by: S.ui.user, date: v.date, text: `Left the company${v.reason ? ' — ' + v.reason : ''}` });
    (S.appointments || []).filter(a => a.person === x.id && ['Active', 'Accepted', 'Uploaded'].includes(aptStatus(a))).forEach(a => { a.status = 'Ended'; a.end = v.date; aptHist(a, 'Ended', 'Employee left the company'); });
    (S.appointments || []).filter(a => a.person === x.id && aptOpen(a)).forEach(a => { a.status = 'Withdrawn'; aptHist(a, 'Withdrawn', 'Employee left the company'); });
    log(`${x.name} left the company (deactivated)`, '#/people/' + x.id); save(); rerender(); } }] }); };

/* ---------------- Employee profile ---------------- */
function personProfile(id) {
  const x = person(id); if (!x || x.org !== S.ui.org) return ROUTES.notfound();
  const own = x.id === S.ui.user; if (!canPeople() && !own && !can('report.view')) return ROUTES.notfound();
  const A = (S.appointments || []).filter(a => a.person === x.id), R = (S.responsibilities || []).filter(r => r.person === x.id), C = (S.competencies || []).filter(c => c.person === x.id);
  const T = typeof trainingFor === 'function' ? trainingFor(x) : null;
  const html = `<div class="status-hero"><div><div class="sh-id">${esc(x.empNo || x.id)} · ${esc(x.type)}</div><h1 style="margin:2px 0 6px">${esc(x.name)}</h1><div class="btn-row">${x.status === 'Deactivated' ? badge('Left ' + (x.leftOn ? fmt(x.leftOn) : ''), 'grey') : badge('Active', 'green')} <span class="tag">${esc(x.jobTitle || '')}</span> <span class="tag">${esc(sname(x.site))} · ${esc(x.dept || '')}</span></div></div>
    <div class="sh-actions">${canPeople() && x.status !== 'Deactivated' ? `<button class="btn" data-act="empEdit" data-id="${x.id}">${icon('edit', 'sm')} Edit</button><button class="btn" data-act="empTransfer" data-id="${x.id}">Transfer</button><button class="btn danger" data-act="empLeave" data-id="${x.id}">Leaving</button><button class="btn primary" data-act="aptNew" data-person="${x.id}">New appointment</button>` : ''}</div></div>
  <div class="detail"><div class="stack">
    <div class="card"><div class="card-head"><h2>Legal appointments</h2><span class="ch-sub">${A.length}</span></div><div class="card-body flush">${A.length ? aptTable(A, true) : '<div class="card-body muted">No appointments.</div>'}</div></div>
    ${T ? T : ''}
    <div class="card"><div class="card-head"><h2>Competency records</h2>${canPeople() ? `<button class="btn sm" data-act="compNew" data-person="${x.id}">${icon('plus', 'sm')} Add</button>` : ''}</div><div class="card-body flush">${C.length ? `<div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Record</th><th>Kind</th><th>Issued by</th><th>Date</th><th>Valid until</th><th>Document</th></tr></thead><tbody>${C.map(c => `<tr><td data-label="Record"><b>${esc(c.title)}</b>${c.notes ? `<div class="t-sub">${esc(c.notes)}</div>` : ''}</td><td data-label="Kind">${esc(c.kind)}</td><td data-label="Issued by">${esc(c.issuer || '—')}</td><td data-label="Date">${c.date ? fmt(c.date) : '—'}</td><td data-label="Valid until">${c.expires ? dueText(c.expires) : '<span class="muted">No expiry</span>'}</td><td data-label="Document">${c.file ? `<button type="button" class="link-btn" ${fileAttrs(c.file)}>${esc(c.file.name)}</button>` : '—'}</td></tr>`).join('')}</tbody></table></div>` : '<div class="card-body muted">No competency records.</div>'}</div></div>
    <div class="card"><div class="card-head"><h2>Responsibilities</h2></div><div class="card-body flush">${R.length ? `<ul class="link-list">${R.map(r => `<li><div class="ll-main"><b>${esc(r.title)}</b><div class="t-sub">${esc(r.description || '')}${r.legalReq ? ` · <a href="#/legal/${r.legalReq}">${r.legalReq}</a>` : ''}</div></div>${r.ackRequired ? (r.ack ? badge('Acknowledged ' + fmt(r.ack.ts.slice(0, 10)), 'green', true) : badge('Not yet acknowledged', 'amber', true)) : ''}</li>`).join('')}</ul>` : '<div class="card-body muted">None allocated.</div>'}</div></div>
  </div><div class="stack">
    <div class="card"><div class="card-head"><h2>Details</h2></div><div class="card-body"><div class="kv">
      <div>Employee number</div><div class="mono">${esc(x.empNo || '—')}</div><div>Job title</div><div>${esc(x.jobTitle || '')}</div><div>Branch</div><div>${esc(sname(x.site))}</div><div>Department</div><div>${esc(x.dept || '')}</div>
      <div>Reports to</div><div>${x.supervisor ? esc(pname(x.supervisor)) : '—'}</div><div>Reports to them</div><div>${S.people.filter(p => p.supervisor === x.id && p.status !== 'Deactivated').map(p => `<a href="#/people/${p.id}">${esc(p.name)}</a>`).join(', ') || '—'}</div>
      <div>System login</div><div>${x.sysRole ? esc(x.sysRole) : '<span class="muted">None</span>'}</div><div>Start date</div><div>${x.startDate ? fmt(x.startDate) : '—'}</div></div></div></div>
    <div class="card"><div class="card-head"><h2>History</h2></div><div class="card-body">${(x.history || []).length ? `<ul class="timeline">${x.history.slice().reverse().map(h => `<li><b>${esc(h.text)}</b><div class="t-sub">${fmtTs(h.ts)} · ${esc(pname(h.by))}</div></li>`).join('')}</ul>` : '<p class="muted">No changes recorded.</p>'}</div></div>
  </div></div>`;
  return { title: x.name, nav: 'people', crumbs: [['People', '#/people'], [x.name, '#']], html };
}
ACT.compNew = (el) => { const x = person(el.dataset.person); openModal({ title: `Competency record — ${x.name}`, body: `<div class="form-grid">
    ${fld({ name: 'kind', label: 'Kind', type: 'select', options: opts(COMP_KINDS), required: true })}${fld({ name: 'title', label: 'Title', required: true, placeholder: 'e.g. Lift truck operator certificate' })}
    ${fld({ name: 'issuer', label: 'Issued by / provider / registration body' })}${fld({ name: 'date', label: 'Date issued / assessed', type: 'date', value: TODAY })}
    ${fld({ name: 'expires', label: 'Valid until (leave empty if it does not expire)', type: 'date' })}${fld({ name: 'file', label: 'Document', type: 'file', full: true })}
    ${fld({ name: 'notes', label: 'Notes (e.g. years of experience)', full: true })}</div>`,
  buttons: [{ label: 'Add', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); S.competencies = S.competencies || []; S.competencies.push({ id: nextId('CMP-', 'competencies'), person: x.id, org: x.org, kind: v.kind, title: v.title, issuer: v.issuer, date: v.date, expires: v.expires, file: v.file, notes: v.notes, by: S.ui.user, on: TODAY }); log(`Added ${v.kind.toLowerCase()} "${v.title}" for ${x.name}`, '#/people/' + x.id); save(); rerender(); } }] }); };

/* ---------------- Appointments register ---------------- */
const APT_F = {
  fperson: { all: 'All employees', list: () => personOpts(p => (S.appointments || []).some(a => a.person === p.id)), test: (a, v) => a.person === v },
  fsite: { all: 'All branches', list: () => orgSites().length > 1 ? branchOpts() : [], test: (a, v) => a.site === v },
  ftype: { all: 'All appointment types', list: () => apptTypes().map(t => ({ value: t.id, label: t.name })), test: (a, v) => a.type === v },
  fmethod: { all: 'Digital and uploaded', list: () => [{ value: 'Digital', label: 'Digital' }, { value: 'Uploaded', label: 'Uploaded' }], test: (a, v) => a.method === v },
  fstatus: { all: 'All statuses', list: () => [...new Set(APT_DIGITAL.concat(APT_UPLOADED))].map(s => ({ value: s, label: s })), test: (a, v) => aptStatus(a) === v },
  fflag: { all: 'Anything', list: () => [{ value: 'open', label: 'Awaiting the employee' }, { value: 'docs', label: 'Missing documents' }], test: (a, v) => v === 'open' ? aptOpen(a) : aptMissingDocs(a) }
};
function appointmentsHtml(A, q) { const rows = regFilter(A, q, APT_F).sort((x, y) => (y.issued || y.created).localeCompare(x.issued || x.created));
  return `<div class="card">${regFilterBar('#/people/appointments', q, A, rows.length, APT_F, 'Search employee, number, type, reference…')}<div class="card-body flush">${rows.length ? aptTable(rows) : emptyList(A.length ? 'No appointments match these filters.' : 'No appointments yet.')}</div></div>`; }
function aptTable(rows, compact) {
  return `<div class="table-wrap"><table class="tbl stackable"><thead><tr>${compact ? '' : '<th>Employee</th>'}<th>Appointment</th><th>Method</th><th>Effective</th><th>End</th><th>Status</th><th>Accepted / signed</th></tr></thead><tbody>
  ${rows.map(a => { const x = person(a.person) || {}, s = aptStatus(a);
    return `<tr class="rowlink" data-href="#/people/${a.id}">${compact ? '' : `<td data-label="Employee"><b>${esc(x.name || a.person)}</b><div class="t-sub mono">${esc(x.empNo || '')} · ${esc(sname(a.site))}</div></td>`}<td data-label="Appointment"><b>${esc(aptType(a).name)}</b><div class="t-sub"><span class="mono">${a.id}</span>${a.ref ? ' · ' + esc(a.ref) : ''}${a.version > 1 ? ` · version ${a.version}` : ''}</div></td><td data-label="Method">${badge(a.method, a.method === 'Digital' ? 'blue' : 'purple', true)}</td><td data-label="Effective">${a.effective ? fmt(a.effective) : '—'}</td><td data-label="End">${a.end ? fmt(a.end) : '<span class="muted">No end date</span>'}</td><td data-label="Status">${badge(s, APT_TONE[s])}${aptMissingDocs(a) ? `<div class="t-sub due amber">Documents missing</div>` : ''}</td><td data-label="Accepted">${a.method === 'Digital' ? (a.accept ? fmtTs(a.accept.ts) : '—') : a.signedOn ? 'Signed ' + fmt(a.signedOn) + ' (uploaded)' : '—'}</td></tr>`; }).join('')}
  </tbody></table></div>`;
}

/* ---------------- Create / issue / upload ---------------- */
function aptForm(a, personId) {
  const legItems = (S.legislation || []).flatMap(l => (l.items || []).map(i => ({ value: l.id + '|' + i.id, label: `${l.short || l.name} — ${i.ref}${i.title ? ' ' + i.title : ''}` }))).concat((S.legislation || []).map(l => ({ value: l.id + '|', label: `${l.name} (whole instrument)` })));
  return `<div class="form-grid">
    ${a ? '' : `<div class="field full"><label>Appointment method<span class="req">*</span></label><div class="seg-pick"><label class="check"><input type="radio" name="method" value="Digital" checked> <span><b>Digital appointment</b> — complete it here; the employee reads and accepts it in their app</span></label><label class="check"><input type="radio" name="method" value="Uploaded"> <span><b>Upload an existing appointment</b> — already signed on paper</span></label></div></div>`}
    ${fld({ name: 'person', label: 'Employee', type: 'select', options: personOptions(a ? a.person : personId || '', p => p.status !== 'Deactivated'), required: true })}
    ${fld({ name: 'type', label: 'Appointment type', type: 'select', options: opts(apptTypes().map(t => ({ value: t.id, label: t.name })), a ? a.type : '', '— Select —'), required: true })}
    ${fld({ name: 'site', label: 'Branch', type: 'select', options: siteOptions(a ? a.site : (person(personId) || {}).site || defaultSite(), false), required: true })}
    ${fld({ name: 'legal', label: 'Relevant legislation (from the legal library)', type: 'select', options: opts(legItems, a && a.legal ? a.legal : '', '— Not linked —'), full: true })}
    ${fld({ name: 'ref', label: 'Appointment reference', value: a ? a.ref || '' : '' })}
    ${fld({ name: 'authority', label: 'Appointing authority', type: 'select', options: personOptions(a ? a.authority : (S.people.find(p => p.org === S.ui.org && p.sysRole === 'Managing Director') || {}).id, p => !!p.sysRole), required: true })}
    ${fld({ name: 'effective', label: 'Effective date', type: 'date', value: a ? a.effective : TODAY, required: true })}
    ${fld({ name: 'end', label: 'End date (only if the appointment ends)', type: 'date', value: a ? a.end || '' : '' })}
    <div class="field full apt-digital" data-field="duties"><label for="f_duties">Duties and responsibilities<span class="req">*</span></label><textarea id="f_duties" name="duties" rows="7">${esc(a ? a.duties || '' : '')}</textarea><div class="hint">Filled from the appointment type; adjust for this person.</div></div>
    ${fld({ name: 'attach', label: 'Supporting document for the employee to read (optional)', type: 'file', full: true })}
    <div class="apt-upload hidden full form-grid" style="grid-column:1/-1">
      ${fld({ name: 'signedOn', label: 'Date the appointment was signed', type: 'date' })}
      ${fld({ name: 'file', label: 'Signed appointment letter (PDF or image)', type: 'file', accept: '.pdf,image/*,.doc,.docx', full: true })}
      ${fld({ name: 'compDoc', label: 'Competency document (if needed for this type)', type: 'file', full: true })}
    </div>
    ${fld({ name: 'notes', label: 'Additional information', type: 'textarea', rows: 2, full: true, value: a ? a.notes || '' : '' })}</div>`;
}
function aptFormWire(m) {
  const sync = () => { const up = (m.querySelector('[name=method]:checked') || {}).value === 'Uploaded'; m.querySelectorAll('.apt-upload').forEach(e => e.classList.toggle('hidden', !up)); m.querySelectorAll('.apt-digital').forEach(e => e.classList.toggle('hidden', up)); };
  m.querySelectorAll('[name=method]').forEach(r => r.addEventListener('change', sync)); sync();
  const t = m.querySelector('[name=type]'), d = m.querySelector('[name=duties]'); t.addEventListener('change', () => { const ty = apptTypes().find(x => x.id === t.value); if (ty && (!d.value.trim() || d.dataset.auto)) { d.value = ty.duties || ''; d.dataset.auto = '1'; } if (ty && ty.legal && !m.querySelector('[name=legal]').value) m.querySelector('[name=legal]').value = ty.legal; });
  d.addEventListener('input', () => { delete d.dataset.auto; });
}
ACT.aptNew = (el) => openModal({ title: 'New appointment', sub: 'Digital: you prepare it, review it and issue it; the employee accepts it in their app. Upload: record an appointment already signed on paper.', size: 'wide', body: aptForm(null, el && el.dataset && el.dataset.person), onOpen: aptFormWire,
  buttons: [{ label: 'Save as draft', cls: '', onClick: m => aptCreate(m, false) }, { label: 'Continue', cls: 'primary', onClick: m => aptCreate(m, true) }] });
function aptCreate(m, go) {
  const method = (m.querySelector('[name=method]:checked') || {}).value || 'Digital'; if (!validateForm(m)) return false; const v = readForm(m);
  if (method === 'Digital' && !v.duties) { toast('Describe the duties and responsibilities.', 'error'); return false; }
  if (v.end && v.end < v.effective) { toast('The end date is before the effective date.', 'error'); return false; }
  S.appointments = S.appointments || []; const id = nextId('APT-', 'appointments'), x = person(v.person);
  const a = { id, org: siteOrgOf(v.site), person: v.person, type: v.type, site: v.site, legal: v.legal || '', ref: v.ref, authority: v.authority, effective: v.effective, end: v.end, method, duties: v.duties, attach: v.attach, notes: v.notes, version: 1, versions: [], created: TODAY, createdBy: S.ui.user, history: [] };
  if (method === 'Uploaded') { Object.assign(a, { signedOn: v.signedOn, file: v.file, compDocs: v.compDoc ? [v.compDoc] : [] }); a.status = v.file ? (aptType(a).competency && !v.compDoc ? 'Awaiting supporting documents' : 'Uploaded') : 'Draft'; aptHist(a, 'Uploaded', v.file ? 'Signed appointment uploaded' : 'Saved without the signed letter'); }
  else { a.status = 'Draft'; aptHist(a, 'Draft created'); }
  S.appointments.push(a); log(`${method === 'Digital' ? 'Prepared' : 'Uploaded'} appointment ${id}: ${aptType(a).name} — ${x.name}`, '#/people/' + id); save(); navigate('#/people/' + id);
}

/* ---------------- Appointment detail (manager and employee) ---------------- */
const APTSIG = { sig: null };
function aptDoc(a) { // the appointment as the employee reads it
  const x = person(a.person), t = aptType(a), L = a.legal ? a.legal.split('|') : null, l = L && byId('legislation', L[0]), it = l && L[1] && (l.items || []).find(i => i.id === L[1]);
  return `<div class="apt-doc"><div class="apt-doc-head"><div>${orgMark(orgOf(a.org), 'doc')}</div><div><b>${esc(orgOf(a.org).name)}</b><div class="t-sub">Appointment ${a.id}${a.ref ? ' · ' + esc(a.ref) : ''}${a.version > 1 ? ' · version ' + a.version : ''}</div></div></div>
    <h2>${esc(t.name)}</h2>
    <div class="kv"><div>Appointed person</div><div><b>${esc(x.name)}</b> (${esc(x.empNo || x.id)}), ${esc(x.jobTitle || '')}</div><div>Branch</div><div>${esc(sname(a.site))}</div>${l ? `<div>Legislation</div><div>${esc(l.name)}${it ? ' — ' + esc(it.ref) : ''}</div>` : ''}<div>Appointed by</div><div>${esc(pname(a.authority))}</div><div>Effective from</div><div>${fmt(a.effective)}</div><div>Until</div><div>${a.end ? fmt(a.end) : 'Until ended or replaced'}</div></div>
    ${a.method === 'Digital' ? `<h3>Duties and responsibilities</h3><div class="apt-duties">${esc(a.duties || '')}</div>` : ''}
    ${a.attach ? `<p>Supporting document: <button type="button" class="link-btn" ${fileAttrs(a.attach)}>${icon('docs', 'sm')} ${esc(a.attach.name)}</button></p>` : ''}
    ${a.notes ? `<p class="t-sub">${esc(a.notes)}</p>` : ''}
    <p class="t-sub">This appointment assigns operational duties. The employer's statutory duties remain with the employer.</p></div>`;
}
function aptDetail(id) {
  const a = byId('appointments', id); if (!a || a.org !== S.ui.org) return ROUTES.notfound();
  const mine = a.person === S.ui.user, mgr = canPeople(); if (!mine && !mgr && !can('report.view')) return ROUTES.notfound();
  if (mine && a.status === 'Sent to employee') { a.status = 'Awaiting acknowledgement'; a.opened = nowTs(); aptHist(a, 'Opened by the employee'); save(); }
  const s = aptStatus(a), x = person(a.person);
  const respond = mine && ['Awaiting acknowledgement', 'Awaiting acceptance', 'Clarification requested'].includes(a.status);
  const html = `<div class="status-hero"><div><div class="sh-id">${a.id} · ${esc(x.name)} · ${esc(sname(a.site))}</div><h1 style="margin:2px 0 6px">${esc(aptType(a).name)}</h1><div class="btn-row">${badge(s, APT_TONE[s])} ${badge(a.method === 'Digital' ? 'Digital appointment' : 'Uploaded appointment (signed elsewhere)', a.method === 'Digital' ? 'blue' : 'purple', true)}${aptMissingDocs(a) ? ' ' + badge('Documents missing', 'amber', true) : ''}</div></div>
    <div class="sh-actions">${mgr ? aptMgrButtons(a) : ''}${a.method === 'Digital' && ['Accepted', 'Active', 'Ended'].includes(s) || a.method === 'Uploaded' ? `<button class="btn" data-act="aptPdf" data-id="${a.id}">${icon('download', 'sm')} Download</button>` : ''}</div></div>
  <div class="detail"><div class="stack">
    ${a.status === 'Draft' && a.method === 'Digital' && mgr ? `<div class="alert info">${icon('info')}<div><b>Review before issuing.</b> This is exactly what ${esc(x.name)} will see. When you issue it, they are notified and can read, acknowledge and accept it in their app.</div></div>` : ''}
    <div class="card"><div class="card-body" style="padding-top:16px">${a.method === 'Uploaded' ? `${aptDoc(a)}<div class="mt-s"><b>Signed appointment letter:</b> ${a.file ? `<button type="button" class="link-btn" ${fileAttrs(a.file)}>${icon('docs', 'sm')} ${esc(a.file.name)}</button> · signed ${a.signedOn ? fmt(a.signedOn) : '—'}` : '<span class="due amber">Not uploaded yet</span>'}</div><div><b>Competency documents:</b> ${(a.compDocs || []).length ? a.compDocs.map(f => `<button type="button" class="link-btn" ${fileAttrs(f)}>${esc(f.name)}</button>`).join(', ') : aptType(a).competency ? '<span class="due amber">Required, not uploaded</span>' : '<span class="muted">None</span>'}</div>` : aptDoc(a)}</div></div>
    ${respond ? aptRespondHtml(a) : ''}
    ${(a.clarify || []).length ? `<div class="card"><div class="card-head"><h2>Clarification</h2></div><div class="card-body">${a.clarify.map(c => `<div class="mb-s"><b>${esc(pname(c.by))}:</b> ${esc(c.q)} <span class="t-sub">${fmtTs(c.ts)}</span>${c.answer ? `<div class="apt-answer"><b>${esc(pname(c.answeredBy))}:</b> ${esc(c.answer)} <span class="t-sub">${fmtTs(c.answeredTs)}</span></div>` : mgr ? `<div><button class="btn sm primary mt-s" data-act="aptAnswer" data-id="${a.id}">Answer</button></div>` : '<div class="t-sub">Waiting for an answer.</div>'}</div>`).join('')}</div></div>` : ''}
    ${(a.versions || []).length ? `<div class="card"><div class="card-head"><h2>Previous versions</h2></div><div class="card-body flush"><ul class="link-list">${a.versions.map(v => `<li><div class="ll-main"><b>Version ${v.version}</b><div class="t-sub">${v.accept ? 'Accepted ' + fmtTs(v.accept.ts) : 'Not accepted'} · replaced ${fmtTs(v.replaced)}: ${esc(v.reason || '')}</div></div></li>`).join('')}</ul></div></div>` : ''}
  </div><div class="stack">
    <div class="card"><div class="card-head"><h2>Acceptance record</h2></div><div class="card-body"><div class="kv">
      <div>Method</div><div>${esc(a.method)}</div>
      ${a.method === 'Digital' ? `<div>Issued</div><div>${a.issued ? fmtTs(a.issued) + ' by ' + esc(pname(a.issuedBy)) : '—'}</div><div>Opened by employee</div><div>${a.opened ? fmtTs(a.opened) : '—'}</div><div>Acknowledged</div><div>${a.ack ? fmtTs(a.ack.ts) : '—'}</div><div>Accepted</div><div>${a.accept ? `${fmtTs(a.accept.ts)}<div class="t-sub">by ${esc(a.accept.name)} (signed in as ${esc(a.accept.user)})</div>${a.accept.sig ? `<span class="sig-show"><img src="${a.accept.sig}" alt="Signature"></span>` : ''}` : '—'}</div>${a.decline ? `<div>Declined</div><div>${fmtTs(a.decline.ts)}<div class="t-sub">${esc(a.decline.reason)}</div></div>` : ''}`
        : `<div>Signed on paper</div><div>${a.signedOn ? fmt(a.signedOn) : '—'}</div><div>Uploaded</div><div>${fmt(a.created)} by ${esc(pname(a.createdBy))}</div><div>Note</div><div class="t-sub">Uploaded appointment — not digitally accepted in the system.</div>`}
    </div></div></div>
    <div class="card"><div class="card-head"><h2>History</h2></div><div class="card-body"><ul class="timeline">${(a.history || []).slice().reverse().map(h => `<li><b>${esc(h.action)}</b>${h.comment ? ` — ${esc(h.comment)}` : ''}<div class="t-sub">${fmtTs(h.ts)} · ${esc(pname(h.by))}</div></li>`).join('')}</ul></div></div>
  </div></div>`;
  return { title: a.id, nav: mine && !mgr ? 'me' : 'people', crumbs: mine && !mgr ? [['My appointments', '#/me'], [a.id, '#']] : [['People', '#/people/appointments'], [a.id, '#']], html, after: respond && a.status === 'Awaiting acceptance' ? () => { APTSIG.sig = null; initSigPad('aptSig', APTSIG, 'sig', 'aptSigField'); } : null };
}
function aptMgrButtons(a) { const s = aptStatus(a), b = [];
  if (a.method === 'Digital' && a.status === 'Draft') b.push(`<button class="btn" data-act="aptEdit" data-id="${a.id}">${icon('edit', 'sm')} Edit</button>`, `<button class="btn primary" data-act="aptIssue" data-id="${a.id}">Issue to employee</button>`);
  if (a.method === 'Digital' && aptOpen(a)) b.push(`<button class="btn" data-act="aptResend" data-id="${a.id}">Resend</button>`);
  if (a.method === 'Uploaded' && a.status !== 'Withdrawn' && a.status !== 'Ended') b.push(`<button class="btn" data-act="aptUploadMore" data-id="${a.id}">${icon('upload', 'sm')} Upload documents</button>`);
  if (a.method === 'Digital' && ['Accepted', 'Active', 'Declined'].includes(s)) b.push(`<button class="btn" data-act="aptRevise" data-id="${a.id}">Change (new version)</button>`);
  if (['Active', 'Accepted', 'Uploaded'].includes(s)) b.push(`<button class="btn" data-act="aptEnd" data-id="${a.id}">End</button>`);
  if (!['Ended', 'Withdrawn'].includes(s)) b.push(`<button class="btn danger" data-act="aptWithdraw" data-id="${a.id}">Withdraw</button>`);
  return b.join(''); }
function aptRespondHtml(a) {
  if (a.status === 'Clarification requested') return `<div class="alert info">${icon('info')}<div>You asked for clarification. You can respond once your question has been answered.</div></div>`;
  if (a.status === 'Awaiting acknowledgement') return `<div class="card apt-respond"><div class="card-head"><h2>Your response</h2></div><div class="card-body">
    <label class="check"><input type="checkbox" id="aptAck"> <span><b>I have read and understood this appointment</b>, including the duties and responsibilities.</span></label>
    <div class="btn-row mt-s"><button class="btn primary" data-act="aptAck" data-id="${a.id}">Confirm I have read it</button><button class="btn" data-act="aptClarify" data-id="${a.id}">Ask for clarification</button><button class="btn danger" data-act="aptDecline" data-id="${a.id}">Decline</button></div></div></div>`;
  return `<div class="card apt-respond"><div class="card-head"><h2>Accept the appointment</h2><span class="ch-sub">Read and understood ${fmtTs(a.ack.ts)}</span></div><div class="card-body">
    <div class="field full" id="aptSigField"><label for="aptSig">Your signature<span class="req">*</span></label><div class="sig-wrap"><canvas id="aptSig" class="sig-pad"></canvas><div class="sig-foot"><span>${esc(pname(a.person))}</span><button type="button" class="btn sm" data-act="aptSigClear">Clear</button></div></div></div>
    <div class="btn-row mt-s"><button class="btn success" data-act="aptAccept" data-id="${a.id}">${icon('check', 'sm')} Accept appointment</button><button class="btn" data-act="aptClarify" data-id="${a.id}">Ask for clarification</button><button class="btn danger" data-act="aptDecline" data-id="${a.id}">Decline</button></div></div></div>`;
}
const aptNotifyMgr = (a, subject, text) => { const to = [...new Set([a.issuedBy, a.createdBy, a.authority].filter(Boolean))]; queueEmail(to, 'people', subject, text, '#/people/' + a.id); addEvent('blue', 'people', subject, text, '#/people/' + a.id, a.site, to); };
ACT.aptIssue = (el) => { const a = byId('appointments', el.dataset.id); confirmBox('Issue this appointment?', `${esc(pname(a.person))} is notified and can read, acknowledge and accept it in their app. You cannot change it afterwards without issuing a new version.`, 'Issue', () => {
  a.status = 'Sent to employee'; a.issued = nowTs(); a.issuedBy = S.ui.user; aptHist(a, 'Issued to the employee');
  queueEmail([a.person], 'people', `Appointment for you to accept: ${aptType(a).name}`, `${pname(S.ui.user)} issued an appointment to you: ${aptType(a).name}. Open it, read it, and acknowledge and accept it (or decline it, or ask for clarification).`, '#/me/' + a.id);
  addEvent('amber', 'people', `Appointment requires your attention`, `${aptType(a).name} — open it to read and respond.`, '#/me/' + a.id, a.site, [a.person]);
  log(`Issued appointment ${a.id} (${aptType(a).name}) to ${pname(a.person)}`, '#/people/' + a.id); save(); rerender(); }); };
ACT.aptResend = (el) => { const a = byId('appointments', el.dataset.id); a.resent = (a.resent || 0) + 1; aptHist(a, 'Resent to the employee');
  queueEmail([a.person], 'people', `Reminder — appointment waiting for you: ${aptType(a).name}`, `Your appointment "${aptType(a).name}" is still waiting for your response.`, '#/me/' + a.id); addEvent('amber', 'people', 'Reminder: appointment waiting for you', aptType(a).name, '#/me/' + a.id, a.site, [a.person]); save(); toast('Sent again.'); rerender(); };
ACT.aptEdit = (el) => { const a = byId('appointments', el.dataset.id); openModal({ title: `Edit ${a.id}`, size: 'wide', body: aptForm(a), onOpen: aptFormWire, buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); Object.assign(a, { person: v.person, type: v.type, site: v.site, legal: v.legal, ref: v.ref, authority: v.authority, effective: v.effective, end: v.end, duties: v.duties, notes: v.notes }); if (v.attach) a.attach = v.attach; aptHist(a, 'Draft edited'); save(); rerender(); } }] }); };
ACT.aptAck = (el) => { const a = byId('appointments', el.dataset.id); if (!document.getElementById('aptAck').checked) { toast('Tick that you have read and understood the appointment.', 'error'); return; }
  a.ack = { ts: nowTs(), user: S.ui.user }; a.status = 'Awaiting acceptance'; aptHist(a, 'Acknowledged: read and understood'); log(`${pname(S.ui.user)} acknowledged appointment ${a.id}`, '#/people/' + a.id); save(); rerender(); };
ACT.aptSigClear = () => { APTSIG.sig = null; const c = document.getElementById('aptSig'); if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height); };
ACT.aptAccept = (el) => { const a = byId('appointments', el.dataset.id); if (!APTSIG.sig) { toast('Sign to accept the appointment.', 'error'); document.getElementById('aptSigField').classList.add('invalid'); return; }
  a.accept = { ts: nowTs(), user: S.ui.user, name: pname(S.ui.user), sig: APTSIG.sig }; a.status = 'Accepted'; aptHist(a, 'Accepted and signed by the employee');
  aptNotifyMgr(a, `Appointment accepted: ${pname(a.person)} — ${aptType(a).name}`, `${pname(a.person)} accepted the appointment ${a.id} on ${fmtTs(a.accept.ts)}.`);
  log(`${pname(S.ui.user)} accepted appointment ${a.id}`, '#/people/' + a.id); save(); toast('Appointment accepted. Thank you.'); rerender(); };
ACT.aptDecline = (el) => { const a = byId('appointments', el.dataset.id); openModal({ title: 'Decline the appointment', body: fld({ name: 'reason', label: 'Why are you declining?', type: 'textarea', required: true, full: true }), buttons: [{ label: 'Decline', cls: 'danger', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m);
  a.decline = { ts: nowTs(), user: S.ui.user, reason: v.reason }; a.status = 'Declined'; aptHist(a, 'Declined by the employee', v.reason); aptNotifyMgr(a, `Appointment declined: ${pname(a.person)} — ${aptType(a).name}`, `${pname(a.person)} declined appointment ${a.id}: ${v.reason}`); log(`${pname(S.ui.user)} declined appointment ${a.id}`, '#/people/' + a.id); save(); rerender(); } }] }); };
ACT.aptClarify = (el) => { const a = byId('appointments', el.dataset.id); openModal({ title: 'Ask for clarification', body: fld({ name: 'q', label: 'Your question', type: 'textarea', required: true, full: true }), buttons: [{ label: 'Send question', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m);
  (a.clarify = a.clarify || []).push({ ts: nowTs(), by: S.ui.user, q: v.q, from: a.status }); a.status = 'Clarification requested'; aptHist(a, 'Clarification requested', v.q); aptNotifyMgr(a, `Clarification requested on appointment ${a.id}`, `${pname(a.person)} asks: ${v.q}`); save(); rerender(); } }] }); };
ACT.aptAnswer = (el) => { const a = byId('appointments', el.dataset.id), c = a.clarify.find(x => !x.answer); openModal({ title: 'Answer the question', sub: c.q, body: fld({ name: 'answer', label: 'Answer', type: 'textarea', required: true, full: true }), buttons: [{ label: 'Send answer', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m);
  Object.assign(c, { answer: v.answer, answeredBy: S.ui.user, answeredTs: nowTs() }); a.status = a.ack ? 'Awaiting acceptance' : 'Awaiting acknowledgement'; aptHist(a, 'Clarification answered', v.answer);
  queueEmail([a.person], 'people', `Your question about appointment ${a.id} was answered`, v.answer, '#/me/' + a.id); addEvent('blue', 'people', 'Your question was answered', aptType(a).name, '#/me/' + a.id, a.site, [a.person]); save(); rerender(); } }] }); };
ACT.aptRevise = (el) => { const a = byId('appointments', el.dataset.id); openModal({ title: 'Change the appointment (new version)', sub: 'A material change makes a new version. The employee must read and accept it again; the previous version is kept.', size: 'wide', body: `<div class="form-grid">${fld({ name: 'duties', label: 'Duties and responsibilities', type: 'textarea', rows: 7, value: a.duties, required: true, full: true })}${fld({ name: 'end', label: 'End date', type: 'date', value: a.end || '' })}${fld({ name: 'reason', label: 'What changed and why', required: true, full: true })}</div>`,
  buttons: [{ label: 'Issue new version', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m);
    (a.versions = a.versions || []).push({ version: a.version, duties: a.duties, end: a.end, ack: a.ack, accept: a.accept, decline: a.decline, replaced: nowTs(), reason: v.reason });
    Object.assign(a, { duties: v.duties, end: v.end, version: a.version + 1, status: 'Sent to employee', issued: nowTs(), issuedBy: S.ui.user }); delete a.ack; delete a.accept; delete a.decline; delete a.opened; aptHist(a, `Version ${a.version} issued`, v.reason);
    queueEmail([a.person], 'people', `Changed appointment for you to accept: ${aptType(a).name}`, `Your appointment was changed (${v.reason}). Read and accept the new version.`, '#/me/' + a.id); addEvent('amber', 'people', 'Changed appointment requires your attention', aptType(a).name, '#/me/' + a.id, a.site, [a.person]);
    log(`Issued version ${a.version} of appointment ${a.id}`, '#/people/' + a.id); save(); rerender(); } }] }); };
ACT.aptEnd = (el) => { const a = byId('appointments', el.dataset.id); openModal({ title: 'End the appointment', body: `<div class="form-grid">${fld({ name: 'date', label: 'End date', type: 'date', value: TODAY, required: true })}${fld({ name: 'reason', label: 'Reason', required: true, full: true })}${fld({ name: 'replace', label: 'Prepare a replacement appointment (another person or a new appointment)', type: 'checkbox', full: true })}</div>`,
  buttons: [{ label: 'End', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); a.end = v.date; a.status = 'Ended'; aptHist(a, 'Ended', v.reason); log(`Ended appointment ${a.id}: ${v.reason}`, '#/people/' + a.id); save();
    if (v.replace) setTimeout(() => { ACT.aptNew({ dataset: {} }); setTimeout(() => { const mm = document.querySelector('.modal'); if (mm) { mm.querySelector('[name=type]').value = a.type; mm.querySelector('[name=type]').dispatchEvent(new Event('change')); mm.querySelector('[name=site]').value = a.site; } }, 50); }, 50); else rerender(); } }] }); };
ACT.aptWithdraw = (el) => { const a = byId('appointments', el.dataset.id); openModal({ title: 'Withdraw the appointment', body: fld({ name: 'reason', label: 'Reason', required: true, full: true }), buttons: [{ label: 'Withdraw', cls: 'danger', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); a.status = 'Withdrawn'; aptHist(a, 'Withdrawn', v.reason);
  if (a.method === 'Digital' && a.issued) queueEmail([a.person], 'people', `Appointment withdrawn: ${aptType(a).name}`, v.reason, '#/people/' + a.id); log(`Withdrew appointment ${a.id}`, '#/people/' + a.id); save(); rerender(); } }] }); };
ACT.aptUploadMore = (el) => { const a = byId('appointments', el.dataset.id); openModal({ title: 'Upload documents', body: `<div class="form-grid">${a.file ? '' : fld({ name: 'signedOn', label: 'Date signed', type: 'date', required: true }) + fld({ name: 'file', label: 'Signed appointment letter', type: 'file', required: true, full: true })}${fld({ name: 'compDoc', label: 'Competency document', type: 'file', full: true })}</div>`,
  buttons: [{ label: 'Upload', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); if (v.file) { a.file = v.file; a.signedOn = v.signedOn; } if (v.compDoc) (a.compDocs = a.compDocs || []).push(v.compDoc);
    if (['Draft', 'Awaiting supporting documents'].includes(a.status) && a.file) a.status = aptType(a).competency && !(a.compDocs || []).length ? 'Awaiting supporting documents' : 'Uploaded'; aptHist(a, 'Documents uploaded'); save(); rerender(); } }] }); };
ACT.aptPdf = async (el) => { const a = byId('appointments', el.dataset.id);
  if (a.method === 'Uploaded') { if (a.file) ACT.viewFile({ dataset: { name: a.file.name, type: a.file.type || '', size: a.file.size || 0, blob: a.file.blobId || '', seeded: a.file.seeded ? '1' : '' } }); else toast('No signed letter uploaded yet.', 'error'); return; }
  try { const { PDFDocument, StandardFonts, rgb } = await ensurePdfLib(); const pdf = await PDFDocument.create(), R = await pdf.embedFont(StandardFonts.Helvetica), B = await pdf.embedFont(StandardFonts.HelveticaBold);
    let pg = pdf.addPage([595, 842]), y = 800; const M = 48, ink = rgb(0.07, 0.1, 0.2), mute = rgb(0.4, 0.45, 0.55);
    const T = (s, o = {}) => { const size = o.size || 10, f = o.bold ? B : R, words = pdfSafe(s).split(' '); let line = ''; const out = [];
      words.forEach(w => { const t = line ? line + ' ' + w : w; if (f.widthOfTextAtSize(t, size) > 595 - 2 * M && line) { out.push(line); line = w; } else line = t; }); if (line) out.push(line);
      out.forEach(l => { if (y < 70) { pg = pdf.addPage([595, 842]); y = 800; } pg.drawText(l, { x: M, y, size, font: f, color: o.color || ink }); y -= size + 4; }); y -= o.after || 2; };
    const x = person(a.person); T(orgOf(a.org).name, { bold: true, size: 11 }); T(`Appointment ${a.id}${a.ref ? ' · ' + a.ref : ''} · version ${a.version}`, { color: mute, after: 10 });
    T(aptType(a).name, { bold: true, size: 18, after: 8 });
    [['Appointed person', `${x.name} (${x.empNo || x.id}), ${x.jobTitle || ''}`], ['Branch', sname(a.site)], ['Appointed by', pname(a.authority)], ['Effective from', fmt(a.effective)], ['Until', a.end ? fmt(a.end) : 'Until ended or replaced']].forEach(([k, v]) => T(`${k}: ${v}`));
    y -= 6; T('Duties and responsibilities', { bold: true, size: 12 }); (a.duties || '').split('\n').forEach(l => T(l));
    y -= 8; T('Digital acceptance record', { bold: true, size: 12 }); T(`Issued ${a.issued ? fmtTs(a.issued) + ' by ' + pname(a.issuedBy) : '—'}; opened ${a.opened ? fmtTs(a.opened) : '—'}; read and understood ${a.ack ? fmtTs(a.ack.ts) : '—'}; accepted ${a.accept ? fmtTs(a.accept.ts) + ' by ' + a.accept.name + ' (signed in as ' + a.accept.user + ')' : '—'}.`);
    if (a.accept && a.accept.sig) { try { const im = await pdf.embedPng(Uint8Array.from(atob(a.accept.sig.split(',')[1]), c => c.charCodeAt(0))); const s = Math.min(180 / im.width, 50 / im.height); pg.drawImage(im, { x: M, y: y - 52, width: im.width * s, height: im.height * s }); y -= 60; } catch (e) { /* signature optional */ } }
    T('The employer\'s statutory duties remain with the employer. Prototype — demonstration data.', { size: 8, color: mute });
    if (await saveFile(`Appointment_${a.id}_${x.name.replace(/\W+/g, '_')}.pdf`, new Blob([await pdf.save()], { type: 'application/pdf' }))) { log(`Downloaded appointment ${a.id}`, '#/people/' + a.id); save(); }
  } catch (e) { console.error(e); toast('The PDF could not be made: ' + esc(e.message), 'error'); } };

/* ---------------- Responsibilities ---------------- */
function respHtml(R) {
  const unallocLR = (S.legalReqs || []).filter(r => r.org === S.ui.org && r.applicability === 'Applicable' && !r.owner);
  return `${unallocLR.length ? `<div class="alert warn">${icon('alert')}<div><b>${unallocLR.length} applicable legal requirement(s) have no responsible person:</b> ${unallocLR.map(r => `<a href="#/legal/${r.id}">${r.id}</a>`).join(', ')}.</div></div>` : ''}
  <div class="card"><div class="card-body flush">${R.length ? `<div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Responsibility</th><th>Person</th><th>Linked to</th><th>Acknowledged</th></tr></thead><tbody>${R.map(r => `<tr><td data-label="Responsibility"><b>${esc(r.title)}</b><div class="t-sub">${esc(r.description || '')}</div></td><td data-label="Person">${r.person ? `<a href="#/people/${r.person}">${esc(pname(r.person))}</a>` : '<span class="due amber">Not allocated</span>'}</td><td data-label="Linked to">${r.legalReq ? `<a href="#/legal/${r.legalReq}">${r.legalReq}</a>` : ''}${r.activity ? `<div class="t-sub">${esc(r.activity)}</div>` : ''}${!r.legalReq && !r.activity ? '—' : ''}</td><td data-label="Acknowledged">${r.ackRequired ? (r.ack ? fmtTs(r.ack.ts) : '<span class="due amber">Waiting</span>') : '<span class="muted">Not required</span>'}</td></tr>`).join('')}</tbody></table></div>` : emptyList('No responsibilities allocated yet.')}</div></div>
  <p class="muted" style="font-size:12px">Responsibilities are internal and operational. Statutory appointments are made under Legal appointments.</p>`;
}
ACT.respNew = () => openModal({ title: 'Allocate a responsibility', body: `<div class="form-grid">
    ${fld({ name: 'title', label: 'Responsibility', required: true, full: true, placeholder: 'e.g. Keep the fire equipment register up to date' })}${fld({ name: 'description', label: 'Description', type: 'textarea', rows: 2, full: true })}
    ${fld({ name: 'person', label: 'Person', type: 'select', options: personOptions('', p => p.status !== 'Deactivated') })}
    ${fld({ name: 'legalReq', label: 'Legal requirement (optional)', type: 'select', options: opts((S.legalReqs || []).filter(r => r.org === S.ui.org).map(r => ({ value: r.id, label: `${r.id} — ${r.title}` })), '', '— None —') })}
    ${fld({ name: 'activity', label: 'Activity (optional)', full: true })}${fld({ name: 'ackRequired', label: 'The person must acknowledge it', type: 'checkbox', value: true, full: true })}</div>`,
  buttons: [{ label: 'Allocate', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); S.responsibilities = S.responsibilities || []; const r = { id: nextId('RSP-', 'responsibilities'), org: S.ui.org, title: v.title, description: v.description, person: v.person || null, legalReq: v.legalReq || null, activity: v.activity, ackRequired: v.ackRequired, by: S.ui.user, on: TODAY }; S.responsibilities.push(r);
    if (r.person) { queueEmail([r.person], 'people', `Responsibility allocated to you: ${r.title}`, `${pname(S.ui.user)} allocated a responsibility to you: ${r.title}.${r.ackRequired ? ' Please acknowledge it.' : ''}`, '#/me'); addEvent('blue', 'people', 'Responsibility allocated to you', r.title, '#/me', 'ALL', [r.person]); }
    log(`Allocated responsibility "${r.title}"${r.person ? ' to ' + pname(r.person) : ''}`, '#/people/responsibilities'); save(); rerender(); } }] });
ACT.respAck = (el) => { const r = byId('responsibilities', el.dataset.id); r.ack = { ts: nowTs(), user: S.ui.user }; log(`${pname(S.ui.user)} acknowledged responsibility "${r.title}"`, '#/me'); save(); rerender(); };

/* ---------------- My appointments (employee app) ---------------- */
ROUTES.me = (p = []) => {
  if (p[0] && /^APT-/.test(p[0])) return aptDetail(p[0]);
  const A = (S.appointments || []).filter(a => a.person === S.ui.user && a.status !== 'Draft'), R = (S.responsibilities || []).filter(r => r.person === S.ui.user);
  const grp = (label, list) => list.length ? `<div class="card mb"><div class="card-head"><h2>${label}</h2><span class="ch-sub">${list.length}</span></div><div class="card-body flush"><ul class="link-list">${list.map(a => `<li class="rowlink" data-href="#/me/${a.id}"><div class="ll-main"><b>${esc(aptType(a).name)}</b><div class="t-sub">${esc(sname(a.site))} · from ${fmt(a.effective)}${a.end ? ' to ' + fmt(a.end) : ''} · ${a.method === 'Uploaded' ? 'signed on paper' : a.accept ? 'accepted ' + fmtTs(a.accept.ts) : 'issued ' + fmtTs(a.issued)}</div></div>${badge(aptStatus(a), APT_TONE[aptStatus(a)])}</li>`).join('')}</ul></div></div>` : '';
  const html = `<div class="mobile-card"><h1 style="margin:4px 0 4px">My appointments</h1><p class="muted">Read each new appointment fully before you respond. You can accept it, decline it or ask for clarification.</p>
    ${grp('Waiting for your response', A.filter(a => aptOpen(a)))}${grp('Active', A.filter(a => ['Active', 'Accepted', 'Uploaded'].includes(aptStatus(a))))}${grp('Declined', A.filter(a => a.status === 'Declined'))}${grp('Previous', A.filter(a => ['Ended', 'Withdrawn'].includes(aptStatus(a))))}
    ${!A.length ? `<div class="card mb">${emptyList('You have no appointments.')}</div>` : ''}
    ${R.length ? `<div class="card mb"><div class="card-head"><h2>My responsibilities</h2></div><div class="card-body flush"><ul class="link-list">${R.map(r => `<li><div class="ll-main"><b>${esc(r.title)}</b><div class="t-sub">${esc(r.description || '')}</div></div>${r.ackRequired && !r.ack ? `<button class="btn sm primary" data-act="respAck" data-id="${r.id}">Acknowledge</button>` : r.ack ? badge('Acknowledged', 'green', true) : ''}</li>`).join('')}</ul></div></div>` : ''}</div>`;
  return { title: 'My appointments', nav: 'me', crumbs: [['My appointments', '#/me']], html };
};

/* ---------------- Wiring ---------------- */
addNavGroup('Compliance', { group: 'People', items: [['people', 'People Management', 'people']] });
(() => { const g = NAV.find(x => x.group === 'Overview'); if (g && !g.items.some(i => i[0] === 'me')) g.items.splice(2, 0, ['me', 'My appointments', 'user']); })();
if (!NAV_FIELD[0].items.some(i => i[0] === 'me')) NAV_FIELD[0].items.push(['me', 'My appointments', 'user']);
if (!FIELD_ROUTES.includes('me')) FIELD_ROUTES.push('me');
AREA_OF.people = 'area.people';
['people', 'me'].forEach(k => { if (!TOP_ROUTES.includes(k)) TOP_ROUTES.push(k); });
if (typeof MAIL_CATS === 'object') MAIL_CATS.people = 'Appointments and responsibilities';
const _mailPrefsBeforePeople = mailPrefs; mailPrefs = function (p) { return Object.assign({ people: true }, _mailPrefsBeforePeople(p)); };
const _needsBackBeforePeople = needsBack;
needsBack = function (parts) { if (parts[0] === 'people' && ['employees', 'appointments', 'responsibilities'].includes(parts[1])) return false; return _needsBackBeforePeople(parts); };
const _myTasksBeforePeople = myTasks;
myTasks = function () {
  const out = _myTasksBeforePeople(), uid = S.ui.user;
  (S.appointments || []).filter(a => a.person === uid && ['Sent to employee', 'Awaiting acknowledgement', 'Awaiting acceptance'].includes(a.status)).forEach(a => out.push({ title: `Appointment to accept: ${aptType(a).name}`, sub: `Issued ${fmtTs(a.issued)} — read it and respond`, link: '#/me/' + a.id, sev: 'amber' }));
  (S.responsibilities || []).filter(r => r.person === uid && r.ackRequired && !r.ack).forEach(r => out.push({ title: `Acknowledge responsibility: ${r.title}`, sub: 'Allocated to you', link: '#/me', sev: 'blue' }));
  if (canPeople()) appointments().forEach(a => {
    if (a.status === 'Clarification requested') out.push({ title: `Answer ${pname(a.person)}'s question on appointment ${a.id}`, sub: aptType(a).name, link: '#/people/' + a.id, sev: 'amber' });
    if (a.status === 'Declined') out.push({ title: `Appointment declined: ${pname(a.person)} — ${aptType(a).name}`, sub: 'Decide: change, withdraw or appoint someone else', link: '#/people/' + a.id, sev: 'red' });
    if (aptMissingDocs(a)) out.push({ title: `Upload documents for appointment ${a.id}`, sub: `${pname(a.person)} — ${aptType(a).name}`, link: '#/people/' + a.id, sev: 'blue' });
    if (a.method === 'Digital' && a.status === 'Draft' && a.createdBy === uid) out.push({ title: `Issue appointment ${a.id} (draft)`, sub: `${pname(a.person)} — ${aptType(a).name}`, link: '#/people/' + a.id, sev: 'blue' });
  });
  return out;
};
// Field screen: appointments waiting for the employee are shown first
const _fieldBeforePeople = ROUTES.field;
ROUTES.field = (p, q) => { const r = _fieldBeforePeople(p, q), n = (S.appointments || []).filter(a => a.person === S.ui.user && ['Sent to employee', 'Awaiting acknowledgement', 'Awaiting acceptance'].includes(a.status)).length;
  if (n && r && r.html) r.html = r.html.replace('<div class="mobile-card">', `<div class="mobile-card"><a class="alert warn apt-callout" href="#/me">${icon('user')}<div><b>${n} appointment${n > 1 ? 's' : ''} waiting for you.</b> Open, read and respond.</div></a>`); return r; };

/* ---------------- Admin: appointment types ---------------- */
function apptTypesAdminHtml(ro) {
  return `<div class="alert info">${icon('info')}<div>Appointment types and the duties text each type starts with. Link a type to the relevant legislation in the legal library; the wording of the law comes from the library, never from here.</div></div>
  <div class="card"><div class="card-body flush"><div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Appointment type</th><th>Legislation</th><th>Competency proof</th><th>In use</th>${ro ? '' : '<th></th>'}</tr></thead><tbody>${apptTypes().map(t => { const L = t.legal ? t.legal.split('|') : null, l = L && byId('legislation', L[0]), it = l && (l.items || []).find(i => i.id === L[1]);
    return `<tr><td data-label="Type"><b>${esc(t.name)}</b><div class="t-sub">${esc((t.duties || '').slice(0, 110))}${(t.duties || '').length > 110 ? '…' : ''}</div></td><td data-label="Legislation">${l ? esc((l.short || l.name) + (it ? ' — ' + it.ref : '')) : '—'}</td><td data-label="Competency">${t.competency ? 'Required' : '—'}</td><td data-label="In use">${(S.appointments || []).filter(a => a.type === t.id).length}</td>${ro ? '' : `<td><button class="btn sm" data-act="aptTypeEdit" data-id="${t.id}">${icon('edit', 'sm')} Edit</button></td>`}</tr>`; }).join('')}</tbody></table></div></div></div>`;
}
ACT.aptTypeEdit = (el) => { const t = el.dataset.id ? apptTypes().find(x => x.id === el.dataset.id) : null;
  const legItems = (S.legislation || []).flatMap(l => (l.items || []).map(i => ({ value: l.id + '|' + i.id, label: `${l.short || l.name} — ${i.ref}` }))).concat((S.legislation || []).map(l => ({ value: l.id + '|', label: l.name })));
  openModal({ title: t ? 'Edit appointment type' : 'New appointment type', size: 'wide', body: `<div class="form-grid">${fld({ name: 'name', label: 'Name', value: t ? t.name : '', required: true, full: true })}${fld({ name: 'legal', label: 'Legislation', type: 'select', options: opts(legItems, t ? t.legal : '', '— Not linked —'), full: true })}${fld({ name: 'duties', label: 'Default duties and responsibilities', type: 'textarea', rows: 6, value: t ? t.duties : '', full: true })}${fld({ name: 'competency', label: 'Proof of competency must be attached', type: 'checkbox', value: t ? t.competency : false, full: true })}</div>`,
    buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); if (t) Object.assign(t, { name: v.name, legal: v.legal, duties: v.duties, competency: v.competency }); else S.config.apptTypes.push({ id: 'AT' + Date.now().toString(36), name: v.name, legal: v.legal, duties: v.duties, competency: v.competency }); log(`Saved appointment type "${v.name}"`, '#/admin/appttypes'); save(); rerender(); } }] }); };

/* ---------------- Demo data ---------------- */
MIGRATIONS.push(() => {
  if (S.migr && S.migr.people) return; S.migr = S.migr || {}; S.migr.people = true;
  addArea('area.people', 'People management', 'area.legal', 'area.documents');
  addPerm('people.manage', 'Manage employees and issue appointments', ['HSEQ Manager', 'Safety Consultant', 'Branch Manager']);
  // employee numbers and reporting lines for the demo people
  const sup = { 'P-003': 'P-001', 'P-004': 'P-001', 'P-005': 'P-001', 'P-002': 'P-001', 'P-007': 'P-005', 'P-008': 'P-005', 'P-009': 'P-007', 'P-014': 'P-007', 'P-010': 'P-003', 'P-011': 'P-003', 'P-012': 'P-004', 'P-013': 'P-004', 'P-016': 'P-004', 'P-018': 'P-017', 'P-019': 'P-001' };
  S.people.forEach((p, k) => { if (!p.empNo && p.type === 'Employee') p.empNo = (p.org === 'ORG-2' ? 'RPV' : 'KIE') + '-' + String(1001 + k); if (!p.supervisor && sup[p.id]) p.supervisor = sup[p.id]; p.history = p.history || []; });
  if (!S.people.some(p => p.id === 'P-020')) S.people.push({ id: 'P-020', name: 'Sizwe Dube', empNo: 'KIE-1031', jobTitle: 'General Worker', site: 'S-JHB', org: 'ORG-1', dept: 'Warehouse & Logistics', type: 'Employee', sysRole: null, email: '', status: 'Active', supervisor: 'P-007', startDate: addDays(TODAY, -400), history: [] });
  // Appointment types: names and default duties only; legislation links point to library entries (wording comes from the library)
  S.config.apptTypes = S.config.apptTypes || [
    { id: 'AT-ASSIGNEE', name: 'Assignee of the CEO\'s duties', legal: 'LEG-OHSA|LEG-OHSA-Section16', competency: false, duties: 'Ensure that the duties of the employer are properly discharged at the branch(es) named, as assigned by the CEO.\nReport on health and safety performance to the CEO monthly.\nMake sure risks are assessed and controlled, and corrective actions are closed.' },
    { id: 'AT-SHEREP', name: 'Health and safety representative', legal: 'LEG-OHSA|LEG-OHSA-Section17', competency: false, duties: 'Carry out workplace inspections in your designated area at the agreed frequency.\nTake part in incident investigations in your area.\nRepresent employees on health and safety matters and attend committee meetings.' },
    { id: 'AT-FIRST', name: 'First aider', legal: '', competency: true, duties: 'Give first aid within your training.\nKeep the first aid box in your area stocked and check it monthly.\nRecord every treatment given.' },
    { id: 'AT-FIRE', name: 'Fire marshal', legal: '', competency: true, duties: 'Lead the evacuation of your area during emergencies and drills.\nCheck that escape routes and fire equipment in your area are clear monthly.' },
    { id: 'AT-STACK', name: 'Stacking and storage supervisor', legal: 'LEG-GSR|', competency: false, duties: 'Make sure goods are stacked and stored safely in your area.\nInspect racking weekly and report damage immediately.' },
    { id: 'AT-FLO', name: 'Lift truck operator', legal: 'LEG-DMR|', competency: true, duties: 'Operate only the lift trucks you are authorised and trained for.\nDo the pre-use check before every shift and report defects.\nFollow the forklift safe work procedure.' },
    { id: 'AT-INV', name: 'Incident investigator', legal: '', competency: false, duties: 'Investigate incidents assigned to you, find the root cause and propose corrective actions.' }];
  S.appointments = S.appointments || []; S.responsibilities = S.responsibilities || []; S.competencies = S.competencies || [];
  const ts = d => addDays(TODAY, d) + 'T09:00:00.000Z';
  const T = id => S.config.apptTypes.find(t => t.id === id);
  const ap = (id, o) => { if (byId('appointments', id)) return; const t = T(o.type); S.appointments.push(Object.assign({ id, org: 'ORG-1', site: 'S-JHB', legal: t.legal || '', ref: '', authority: 'P-001', end: '', notes: '', duties: t.duties, version: 1, versions: [], created: addDays(TODAY, -60), createdBy: 'P-002', history: [], demo: true }, o)); };
  ap('APT-001', { person: 'P-005', type: 'AT-ASSIGNEE', method: 'Uploaded', ref: 'KIE-APP-001', effective: addDays(TODAY, -340), signedOn: addDays(TODAY, -341), file: { name: 'KIE-APP-001_signed.pdf', type: 'application/pdf', size: 184000, seeded: true }, status: 'Uploaded', history: [{ ts: ts(-340), by: 'P-002', action: 'Uploaded', comment: 'Signed appointment uploaded' }] });
  ap('APT-002', { person: 'P-007', type: 'AT-STACK', method: 'Digital', effective: addDays(TODAY, -90), status: 'Accepted', issued: ts(-92), issuedBy: 'P-002', opened: ts(-91), ack: { ts: ts(-91), user: 'P-007' }, accept: { ts: ts(-91), user: 'P-007', name: 'Bongani Zulu', sig: null }, history: [{ ts: ts(-92), by: 'P-002', action: 'Issued to the employee' }, { ts: ts(-91), by: 'P-007', action: 'Accepted and signed by the employee' }] });
  ap('APT-003', { person: 'P-009', type: 'AT-FLO', method: 'Digital', effective: TODAY, status: 'Sent to employee', issued: ts(-2), issuedBy: 'P-002', history: [{ ts: ts(-2), by: 'P-002', action: 'Issued to the employee' }] });
  ap('APT-004', { person: 'P-011', type: 'AT-FIRST', method: 'Digital', site: 'S-DBN', effective: addDays(TODAY, -5), status: 'Clarification requested', issued: ts(-7), issuedBy: 'P-002', opened: ts(-6), clarify: [{ ts: ts(-6), by: 'P-011', q: 'My first aid certificate expires next month — must I renew it before accepting?', from: 'Awaiting acknowledgement' }], history: [{ ts: ts(-7), by: 'P-002', action: 'Issued to the employee' }, { ts: ts(-6), by: 'P-011', action: 'Clarification requested' }] });
  ap('APT-005', { person: 'P-012', type: 'AT-FIRE', method: 'Digital', site: 'S-CPT', effective: addDays(TODAY, -20), status: 'Declined', issued: ts(-25), issuedBy: 'P-004', opened: ts(-24), decline: { ts: ts(-24), user: 'P-012', reason: 'I work mostly off site on deliveries and cannot be on the floor during emergencies.' }, history: [{ ts: ts(-25), by: 'P-004', action: 'Issued to the employee' }, { ts: ts(-24), by: 'P-012', action: 'Declined by the employee' }] });
  ap('APT-006', { person: 'P-014', type: 'AT-FLO', method: 'Uploaded', effective: addDays(TODAY, -200), signedOn: addDays(TODAY, -200), file: { name: 'Lift_truck_operator_T_Molefe.pdf', type: 'application/pdf', size: 96000, seeded: true }, compDocs: [], status: 'Awaiting supporting documents', history: [{ ts: ts(-200), by: 'P-002', action: 'Uploaded', comment: 'Licence copy still to be added' }] });
  const rs = (id, o) => { if (!byId('responsibilities', id)) S.responsibilities.push(Object.assign({ id, org: 'ORG-1', by: 'P-002', on: addDays(TODAY, -30) }, o)); };
  rs('RSP-001', { title: 'Keep the fire equipment register up to date (Germiston)', description: 'Update the register after every service and monthly check.', person: 'P-008', legalReq: null, activity: 'Fire equipment', ackRequired: true, ack: { ts: ts(-28), user: 'P-008' } });
  rs('RSP-002', { title: 'Organise health and safety committee meetings', description: 'Quarterly meetings with minutes.', person: 'P-005', legalReq: 'LR-005', ackRequired: true });
  rs('RSP-003', { title: 'Monthly first aid box checks at Montague Gardens', description: '', person: null, activity: 'First aid', ackRequired: false });
  const cp = (id, o) => { if (!byId('competencies', id)) S.competencies.push(Object.assign({ id, org: 'ORG-1', by: 'P-002', on: addDays(TODAY, -100) }, o)); };
  cp('CMP-001', { person: 'P-009', kind: 'Certificate', title: 'Lift truck operator — counterbalance', issuer: 'Accredited training provider (demo)', date: addDays(TODAY, -300), expires: addDays(TODAY, 430) });
  cp('CMP-002', { person: 'P-011', kind: 'Certificate', title: 'First aid level 1', issuer: 'Training provider (demo)', date: addDays(TODAY, -1065), expires: addDays(TODAY, 30) });
  cp('CMP-003', { person: 'P-007', kind: 'Experience', title: '8 years warehouse supervision', issuer: '', date: '', expires: '', notes: 'Previous employer references on file' });
});
