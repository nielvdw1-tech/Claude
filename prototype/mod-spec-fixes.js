/* ==========================================================================
   Specification fixes (master specification check, 26 Nov 2026)
   --------------------------------------------------------------------------
   Small:
   1  Company contact details; branch address, activities and operational
      information; activate and deactivate branches (with history).
   2  A department filter on the dashboard.
   3  Appointment figures: total, digital and uploaded; a sortable register.
   4  Training categories editable in Administration.
   (The document description is in mod-documents.js.)
   Medium:
   5  Company Administrator and Auditor roles.
   6  Evidence files on audit items.
   7  A hazard recorded straight from a failed inspection item.
   8  Date and status filters on every report; Excel (.xlsx) export.
   9  Field-level change history: what changed, from what to what, by whom.
   Loaded before mod-admin-nav.js (which rebuilds the Administration tabs).
   ========================================================================== */
'use strict';

function sfDivEnd(html, i) { const re = /<div\b|<\/div>/g; re.lastIndex = i; let depth = 0, m; while ((m = re.exec(html))) { depth += m[0] === '</div>' ? -1 : 1; if (!depth) return re.lastIndex; } return -1; }
const sfOrgBranches = id => S.sites.filter(s => s.org === id);

/* ---------- 1. Companies and branches ---------- */
const siteActive = s => !s || s.status !== 'Inactive';
// inactive branches leave the selectors, lists and comparisons; their records stay
const _orgSitesBeforeSf = orgSites;
orgSites = function () { return _orgSitesBeforeSf().filter(siteActive); };
const sfHist = (rec, text) => (rec.history = rec.history || []).push({ ts: nowTs(), by: S.ui.user, text });
function sfOrgContactHtml(o) {
  const rows = [['Contact person', o.contact], ['Telephone', o.phone], ['E-mail', o.email], ['Physical address', o.address], ['Postal address', o.postal], ['Website', o.website]].filter(r => r[1]);
  return rows.length ? `<div class="kv sf-kv">${rows.map(([k, v]) => `<div>${esc(k)}</div><div>${esc(v)}</div>`).join('')}</div>` : '<p class="muted" style="margin:0">No contact details recorded yet.</p>';
}
function sfOrgsHtml(ro) {
  return myOrgs().map(o => {
    const sites = sfOrgBranches(o.id);
    return `<div class="card"><div class="card-head"><div class="org-head">${orgMark(o, 'admin')}<div><h2>${esc(o.name)}</h2><span class="ch-sub">${esc(o.industry || '')}${o.reg ? ' · ' + esc(o.reg) : ''}</span>${ro ? '' : `<div class="btn-row mt-s"><button class="btn sm" data-act="orgEdit" data-id="${o.id}">${icon('edit', 'sm')} Company details</button><button class="btn sm" data-act="orgLogo" data-id="${o.id}">${icon('upload', 'sm')} ${o.logo ? 'Replace logo' : 'Upload logo'}</button>${o.logo ? `<button class="btn sm" data-act="orgLogoRemove" data-id="${o.id}">Remove logo</button>` : ''}</div>`}</div></div>${o.id === S.ui.org ? badge('Selected', 'blue') : `<button class="btn sm" data-act="selOrg" data-id="${o.id}">Select organisation</button>`}</div>
      <div class="card-body sf-contact">${sfOrgContactHtml(o)}</div>
      <div class="card-body flush"><div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Branch</th><th>Address</th><th>Activities</th><th>Manager</th><th>Headcount</th><th>Status</th><th></th></tr></thead><tbody>${sites.map(s => `<tr class="${siteActive(s) ? '' : 'sf-inactive'}"><td data-label="Branch"><b>${esc(s.name)}</b><div class="t-sub mono">${s.id}${s.region ? ' · ' + esc(s.region) : ''}</div></td><td data-label="Address">${s.address ? esc(s.address) : '<span class="muted">—</span>'}</td><td data-label="Activities">${s.activities ? esc(s.activities) : '<span class="muted">—</span>'}</td><td data-label="Manager">${esc(pname(s.manager))}</td><td data-label="Headcount">${s.headcount != null ? s.headcount : '—'}</td><td data-label="Status">${siteActive(s) ? badge('Active', 'green', true) : badge('Inactive', 'grey', true)}</td><td data-label=""><div class="btn-row">${ro ? '' : `<button class="btn sm" data-act="siteEdit" data-id="${s.id}">Edit</button><button class="btn sm" data-act="siteActive" data-id="${s.id}">${siteActive(s) ? 'Deactivate' : 'Reactivate'}</button>`}${siteActive(s) ? `<button class="btn sm" data-act="selSite" data-org="${o.id}" data-id="${s.id}">View branch</button>` : ''}</div></td></tr>`).join('')}</tbody></table></div></div></div>`;
  }).join('') + `<div class="card"><div class="card-head"><h2>Departments</h2>${ro ? '' : `<button class="btn sm" data-act="addDept">Add department</button>`}</div><div class="card-body"><div class="btn-row">${S.departments.map(d => `<span class="tag">${esc(d)}</span>`).join('')}</div></div></div>` + (ro ? '' : fabBtn('addSite', 'Add site / branch'));
}
ACT.orgEdit = (el) => { const o = S.orgs.find(x => x.id === el.dataset.id);
  openModal({ title: 'Company details', sub: o.name, size: 'wide', body: `<div class="form-grid">
    ${fld({ name: 'name', label: 'Company name', value: o.name, required: true, full: true })}${fld({ name: 'short', label: 'Short name', value: o.short || '' })}${fld({ name: 'reg', label: 'Registration number', value: o.reg || '' })}
    ${fld({ name: 'industry', label: 'Industry', value: o.industry || '', full: true })}
    ${fld({ name: 'contact', label: 'Contact person', value: o.contact || '' })}${fld({ name: 'phone', label: 'Telephone', value: o.phone || '' })}
    ${fld({ name: 'email', label: 'E-mail', type: 'email', value: o.email || '' })}${fld({ name: 'website', label: 'Website', value: o.website || '' })}
    ${fld({ name: 'address', label: 'Physical address', type: 'textarea', rows: 2, value: o.address || '' })}${fld({ name: 'postal', label: 'Postal address', type: 'textarea', rows: 2, value: o.postal || '' })}</div>`,
    buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m);
      Object.assign(o, { name: v.name, short: v.short || o.short, reg: v.reg, industry: v.industry, contact: v.contact, phone: v.phone, email: v.email, website: v.website, address: v.address, postal: v.postal });
      sfHist(o, 'Company details updated'); log(`Updated the company details of ${o.name}`, '#/admin/orgs'); save(); toast('Saved.'); rerender(); } }] }); };
function sfSiteForm(s) { return `<div class="form-grid">
  ${s ? '' : fld({ name: 'org', label: 'Organisation', type: 'select', options: opts(myOrgs().map(o => ({ value: o.id, label: o.name })), S.ui.org), required: true, full: true })}
  ${fld({ name: 'name', label: 'Branch name', value: s ? s.name : '', required: true })}${fld({ name: 'short', label: 'Short name', value: s ? s.short || '' : '', required: true })}
  ${fld({ name: 'address', label: 'Street address', type: 'textarea', rows: 2, value: s ? s.address || '' : '', full: true })}
  ${fld({ name: 'region', label: 'Province / region', value: s ? s.region || '' : '' })}${fld({ name: 'manager', label: 'Branch manager', type: 'select', options: personOptions(s ? s.manager : '', p => !!p.sysRole) })}
  ${fld({ name: 'activities', label: 'Nature of the branch\'s activities', type: 'textarea', rows: 2, value: s ? s.activities || '' : '', full: true, placeholder: 'e.g. Warehousing and dispatch; forklift operations; workshop repairs' })}
  ${fld({ name: 'operations', label: 'Operational information', type: 'textarea', rows: 2, value: s ? s.operations || '' : '', full: true, placeholder: 'e.g. Working hours, shifts, number of buildings, special hazards' })}
  ${fld({ name: 'headcount', label: 'Headcount', type: 'number', min: 0, value: s ? s.headcount : 10 })}</div>`; }
ACT.addSite = () => openModal({ title: 'Add a branch', size: 'wide', body: sfSiteForm(null), buttons: [{ label: 'Add branch', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m);
  const s = { id: 'S-' + v.short.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() + S.sites.length, org: v.org, name: v.name, short: v.short, region: v.region, address: v.address, activities: v.activities, operations: v.operations, manager: v.manager, headcount: +v.headcount || 0, status: 'Active', history: [] };
  sfHist(s, 'Branch added'); S.sites.push(s); log(`Added branch ${s.name}`, '#/admin/orgs'); save(); toast('Branch added. Add assets, inspection schedules and users for it.'); rerender(); } }] });
ACT.siteEdit = (el) => { const s = site(el.dataset.id); openModal({ title: 'Edit branch', sub: s.name, size: 'wide', body: sfSiteForm(s), buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m);
  Object.assign(s, { name: v.name, short: v.short, region: v.region, address: v.address, activities: v.activities, operations: v.operations, manager: v.manager, headcount: +v.headcount || 0 });
  sfHist(s, 'Branch details updated'); log(`Updated branch ${s.name}`, '#/admin/orgs'); save(); toast('Saved.'); rerender(); } }] }); };
ACT.siteActive = (el) => { const s = site(el.dataset.id), on = siteActive(s);
  const people = S.people.filter(p => p.site === s.id && p.status !== 'Deactivated').length;
  openModal({ title: on ? 'Deactivate the branch' : 'Reactivate the branch', sub: s.name, body: `${on ? `<p>The branch leaves the branch selector, lists and comparisons. All its records stay and remain on record.${people ? ` <b>${people} employee(s)</b> still work there — transfer them first if they move.` : ''}</p>` : '<p>The branch returns to the selector, lists and comparisons.</p>'}<div class="form-grid">${fld({ name: 'reason', label: 'Reason', required: true, full: true })}</div>`,
    buttons: [{ label: on ? 'Deactivate' : 'Reactivate', cls: on ? 'danger' : 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m);
      s.status = on ? 'Inactive' : 'Active'; sfHist(s, `${on ? 'Deactivated' : 'Reactivated'}: ${v.reason}`);
      if (on && S.ui.site === s.id) S.ui.site = 'ALL';
      log(`${on ? 'Deactivated' : 'Reactivated'} branch ${s.name}: ${v.reason}`, '#/admin/orgs'); save(); toast(on ? 'Branch deactivated.' : 'Branch reactivated.'); rerender(); } }] }); };

/* ---------- 2. Department filter on the dashboard ---------- */
let DASH_DEPT = '';
function deptOf(r) {
  if (!r || typeof r !== 'object') return '';
  if (r.dept) return r.dept;
  if (r.asset) { const a = byId('assets', r.asset); if (a && a.dept) return a.dept; }
  for (const f of ['person', 'owner', 'assessor', 'reporter', 'responsible', 'inspector']) { if (r[f] && typeof r[f] === 'string') { const x = person(r[f]); if (x && x.dept) return x.dept; } }
  return '';
}
const _inSiteBeforeSf = inSite;
inSite = function (rec, sid) { if (!_inSiteBeforeSf(rec, sid)) return false; return !DASH_DEPT || deptOf(rec) === DASH_DEPT; };
if (typeof recordScoreHistory === 'function') { const _rsh = recordScoreHistory; recordScoreHistory = function () { const keep = DASH_DEPT; DASH_DEPT = ''; try { return _rsh.apply(this, arguments); } finally { DASH_DEPT = keep; } }; }
const _dashBeforeSf = ROUTES.dashboard;
ROUTES.dashboard = (p, q) => {
  const d = (S.ui.dashDept && S.departments.includes(S.ui.dashDept)) ? S.ui.dashDept : '';
  DASH_DEPT = isFieldUser() ? '' : d; let r;
  try { r = _dashBeforeSf(p, q); } finally { DASH_DEPT = ''; }
  if (!r || !r.html || isFieldUser()) return r;
  const bar = `<div class="sf-deptbar"><label for="dashDept">Department</label><select id="dashDept">${['', ...S.departments].map(x => `<option value="${esc(x)}" ${x === d ? 'selected' : ''}>${x ? esc(x) : 'All departments'}</option>`).join('')}</select>${d ? `<span class="t-sub">Showing records that belong to ${esc(d)}: documents, equipment and its inspections, risk assessments, and records whose responsible person, owner or reporter is in this department.</span>` : ''}</div>`;
  const i = r.html.indexOf('<div class="page-head">'), e = i > -1 ? sfDivEnd(r.html, i) : -1;
  r.html = e > -1 ? r.html.slice(0, e) + bar + r.html.slice(e) : bar + r.html;
  return r;
};
document.addEventListener('change', e => { if (e.target && e.target.id === 'dashDept') { S.ui.dashDept = e.target.value; save(); rerender(); } });

/* ---------- 3. Appointments: total, digital and uploaded; sortable register ---------- */
const APT_SORTS = { employee: a => (person(a.person) || {}).name || '', type: a => aptType(a).name || '', method: a => a.method || '', effective: a => a.effective || '', end: a => a.end || '9999', status: a => aptStatus(a), accepted: a => (a.accept && a.accept.ts) || a.signedOn || '' };
appointmentsHtml = function (A, q) {
  const key = APT_SORTS[q.sort] ? q.sort : '', dir = q.dir === 'desc' ? -1 : 1;
  let rows = regFilter(A, q, APT_F);
  rows = key ? rows.sort((x, y) => String(APT_SORTS[key](x)).localeCompare(String(APT_SORTS[key](y))) * dir) : rows.sort((x, y) => (y.issued || y.created).localeCompare(x.issued || x.created));
  const st = s => A.filter(a => aptStatus(a) === s).length;
  const figs = [['Total', A.length], ['Digital', A.filter(a => a.method === 'Digital').length], ['Uploaded', A.filter(a => a.method === 'Uploaded').length], ['Active', st('Active') + st('Accepted') + st('Uploaded')], ['Ended', st('Ended')], ['Withdrawn', st('Withdrawn')]];
  const strip = `<div class="sf-figs" aria-label="Appointment figures">${figs.map(([k, v]) => `<div><b>${v}</b><span>${k}</span></div>`).join('')}</div>`;
  let table = rows.length ? aptTable(rows) : emptyList(A.length ? 'No appointments match these filters.' : 'No appointments yet.');
  const base = Object.assign({}, q); delete base.sort; delete base.dir;
  const link = (label, k) => { const on = key === k, nd = on && dir === 1 ? 'desc' : 'asc', qs = new URLSearchParams(Object.assign({}, base, { sort: k, dir: nd })).toString();
    return `<th aria-sort="${on ? (dir === 1 ? 'ascending' : 'descending') : 'none'}"><a class="sf-sort${on ? ' on' : ''}" href="#/people/appointments?${qs}">${label}<span aria-hidden="true">${on ? (dir === 1 ? '▲' : '▼') : '↕'}</span></a></th>`; };
  table = table.replace('<th>Employee</th>', link('Employee', 'employee')).replace('<th>Appointment</th>', link('Appointment', 'type')).replace('<th>Method</th>', link('Method', 'method')).replace('<th>Effective</th>', link('Effective', 'effective')).replace('<th>End</th>', link('End', 'end')).replace('<th>Status</th>', link('Status', 'status')).replace('<th>Accepted / signed</th>', link('Accepted / signed', 'accepted'));
  return `${strip}<div class="card">${regFilterBar('#/people/appointments', q, A, rows.length, APT_F, 'Search employee, number, type, reference…')}<div class="card-body flush">${table}</div></div>`;
};

/* ---------- 4. Training categories in Administration ---------- */
const TRAINING_CAT_DEFAULT = ['Induction', 'Operator', 'Emergency', 'Legal appointment', 'Hazardous substances', 'Other'];
function trainCatsHtml(ro) { const cats = S.config.trainingCats || TRAINING_CAT_DEFAULT, used = c => (S.courses || []).filter(x => x.category === c).length;
  return `<div class="card"><div class="card-head"><h2>Training categories</h2>${ro ? '' : `<button class="btn sm" data-act="tcatAdd">${icon('plus', 'sm')} Add category</button>`}</div><div class="card-body flush"><table class="tbl compact"><thead><tr><th>Category</th><th>Courses</th>${ro ? '' : '<th></th>'}</tr></thead><tbody>${cats.map((c, i) => `<tr><td>${esc(c)}</td><td><a href="#/training/courses">${used(c)}</a></td>${ro ? '' : `<td><div class="btn-row"><button class="btn sm" data-act="tcatEdit" data-i="${i}">Rename</button><button class="btn sm" data-act="tcatDel" data-i="${i}">Remove</button></div></td>`}</tr>`).join('')}</tbody></table></div></div>`; }
ACT.tcatAdd = () => openModal({ title: 'Add a training category', body: `<div class="form-grid">${fld({ name: 'name', label: 'Category', required: true, full: true })}</div>`, buttons: [{ label: 'Add', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m), cats = S.config.trainingCats = S.config.trainingCats || TRAINING_CAT_DEFAULT.slice();
  if (cats.some(c => c.toLowerCase() === v.name.toLowerCase())) { toast('That category already exists.', 'error'); return false; } cats.push(v.name); log(`Added training category ${v.name}`, '#/admin/traincats'); save(); rerender(); } }] });
ACT.tcatEdit = (el) => { const cats = S.config.trainingCats = S.config.trainingCats || TRAINING_CAT_DEFAULT.slice(), old = cats[+el.dataset.i];
  openModal({ title: 'Rename the training category', body: `<div class="form-grid">${fld({ name: 'name', label: 'Category', value: old, required: true, full: true })}</div><p class="t-sub">Courses in this category move to the new name.</p>`, buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m);
    cats[+el.dataset.i] = v.name; (S.courses || []).filter(c => c.category === old).forEach(c => { c.category = v.name; }); log(`Renamed training category ${old} to ${v.name}`, '#/admin/traincats'); save(); rerender(); } }] }); };
ACT.tcatDel = (el) => { const cats = S.config.trainingCats = S.config.trainingCats || TRAINING_CAT_DEFAULT.slice(), c = cats[+el.dataset.i], n = (S.courses || []).filter(x => x.category === c).length;
  if (n) { toast(`${n} course(s) use "${c}". Move them to another category first.`, 'error'); return; }
  confirmBox('Remove this category?', `"${c}" is removed from the list.`, 'Remove', () => { cats.splice(+el.dataset.i, 1); log(`Removed training category ${c}`, '#/admin/traincats'); save(); rerender(); }); };

/* ---------- 9. Field-level change history ---------- */
const FL_SKIP = new Set(['activity', 'outbox', 'events', 'fieldLog', 'audit', 'auditChain', 'notifications', 'scoreHistory']);
const FL_ROUTE = { documents: '#/documents/', assets: '#/assets/', incidents: '#/incidents/', actions: '#/actions/', riskAssessments: '#/risk/', hazards: '#/risk/', appointments: '#/people/', contractors: '#/contractors/', legalReqs: '#/legal/', audits: '#/audits/', inspections: '#/inspections/', substances: '#/substances/', permits: '#/permits/', mocs: '#/moc/', talks: '#/toolbox/', drills: '#/emergency/' };
let FL_BASE = null, FL_SYSTEM = false;
function flSnapshot() { const m = {}; Object.keys(S).forEach(k => { if (FL_SKIP.has(k) || !Array.isArray(S[k])) return; S[k].forEach(r => { if (r && typeof r === 'object' && r.id) m[k + '|' + r.id] = JSON.stringify(r); }); }); return m; }
function flValue(v) {
  if (v == null || v === '') return '—';
  if (Array.isArray(v)) return v.length + ' item(s)';
  if (typeof v === 'object') return '(details)';
  const s = String(v); if (/^data:/.test(s)) return '(file)';
  return s.length > 90 ? s.slice(0, 87) + '…' : s;
}
function flDiff() {
  if (!FL_BASE) return;   // recording starts once the first page has been drawn
  const now = flSnapshot(), out = [], who = FL_SYSTEM ? 'System' : (S.ui.user || 'Contractor (upload link)'), ts = nowTs();
  Object.keys(now).forEach(key => { const before = FL_BASE[key]; if (before === undefined || before === now[key]) return;
    const [coll, id] = key.split('|'), a = JSON.parse(before), b = JSON.parse(now[key]);
    [...new Set(Object.keys(a).concat(Object.keys(b)))].forEach(f => { if (f === 'history' || JSON.stringify(a[f]) === JSON.stringify(b[f])) return;
      const from = flValue(a[f]), to = flValue(b[f]); out.push({ ts, by: who, coll, id, field: f, from, to: from === to ? 'changed' : to }); }); });
  Object.keys(now).forEach(key => { if (FL_BASE[key] === undefined) { const [coll, id] = key.split('|'); out.push({ ts, by: who, coll, id, field: '(record)', from: '—', to: 'created' }); } });
  FL_BASE = now;
  if (out.length) { S.fieldLog = (out.reverse().concat(S.fieldLog || [])).slice(0, 4000); }
}
const _saveBeforeFl = save;
save = function () { try { flDiff(); } catch (e) { console.error(e); } return _saveBeforeFl.apply(this, arguments); };
const _rerenderBeforeFl = rerender;
rerender = function (k) { const r = _rerenderBeforeFl(k); if (!FL_BASE && S) { try { FL_BASE = flSnapshot(); } catch (e) { /* not ready */ } } return r; };
// automatic updates (migrations, escalations) are recorded as made by the system
['runMigrations', 'runEscalations'].forEach(n => { if (typeof window[n] !== 'function') return; const f = window[n]; window[n] = function () { const k = FL_SYSTEM; FL_SYSTEM = true; try { return f.apply(this, arguments); } finally { FL_SYSTEM = k; } }; });
const FL_LABEL = f => f === '(record)' ? 'Record' : f.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase());
function flRows(list, withRecord) { return list.map(e => `<tr><td data-label="When" class="mono">${esc(fmtTs(e.ts))}</td><td data-label="Who">${esc(pname(e.by))}</td>${withRecord ? `<td data-label="Record">${FL_ROUTE[e.coll] ? `<a href="${FL_ROUTE[e.coll]}${e.id}">${esc(e.id)}</a>` : esc(e.id)}</td>` : ''}<td data-label="Field">${esc(FL_LABEL(e.field))}</td><td data-label="From">${esc(e.from)}</td><td data-label="To">${esc(e.to)}</td></tr>`).join(''); }
function flCard(id) { const list = (S.fieldLog || []).filter(e => e.id === id); if (!list.length) return '';
  return `<details class="card sf-fl"><summary class="card-head"><h2>Change history</h2><span class="ch-sub">${list.length} change(s) — who changed what, and when</span></summary><div class="card-body flush"><div class="table-wrap"><table class="tbl compact stackable"><thead><tr><th>When</th><th>Who</th><th>Field</th><th>From</th><th>To</th></tr></thead><tbody>${flRows(list.slice(0, 100), false)}</tbody></table></div></div></details>`; }
['documents', 'assets', 'incidents', 'actions', 'risk', 'people', 'contractors', 'legal', 'audits', 'inspections', 'substances', 'permits', 'moc', 'toolbox'].forEach(key => { const prev = ROUTES[key]; if (!prev) return;
  ROUTES[key] = (p, q) => { const r = prev(p, q); if (r && r.html && p && p[0] && !p[1] && /^[A-Z]+-[\w-]+$/.test(p[0])) { const c = flCard(p[0]); if (c) r.html += c; } return r; }; });

/* ---------- Administration: company tab, training categories, field changes ---------- */
const _adminBeforeSf = ROUTES.admin;
ROUTES.admin = (p, q) => {
  const tc = p[0] === 'traincats', r = _adminBeforeSf(tc ? ['priorities'] : p, q); if (!r || !r.html) return r;
  const ro = !can('admin');
  if (tc) { r.html = cutAfterAdmNav(r.html).replace(/(<a role="tab"[^>]*class=")([^"]*)\bactive\b/g, '$1$2') + trainCatsHtml(ro && !can('training.manage')); r.crumbs = [['Administration', '#/admin'], ['Training categories', '#']]; }
  if ((p[0] || 'orgs') === 'orgs') { const k = r.html.indexOf('<div class="adm-nav">'), e = k > -1 ? sfDivEnd(r.html, k) : -1; if (e > -1) r.html = r.html.slice(0, e) + sfOrgsHtml(ro); }
  if (p[0] === 'audit') { const list = (S.fieldLog || []).slice(0, 200);
    r.html += `<div class="card"><div class="card-head"><h2>Field-level changes</h2><span class="ch-sub">What changed in each record: the field, the old value and the new value (latest ${list.length})</span></div><div class="card-body flush">${list.length ? `<div class="table-wrap"><table class="tbl compact stackable"><thead><tr><th>When</th><th>Who</th><th>Record</th><th>Field</th><th>From</th><th>To</th></tr></thead><tbody>${flRows(list, true)}</tbody></table></div>` : '<div class="card-body muted">No changes recorded yet. Changes are recorded from now on.</div>'}</div></div>`; }
  r.html = r.html.replace(/(<span>Checklists and types<\/span><div class="tabs adm-tabs" role="tablist">[\s\S]*?)(<\/div><\/div>)/, `$1<a role="tab" href="#/admin/traincats" class="${tc ? 'active' : ''}">Training categories</a>$2`);
  return r;
};

/* ---------- 5. Company Administrator and Auditor roles ---------- */
MIGRATIONS.push(() => { if (S.migr && S.migr.sfRoles) return; S.migr = S.migr || {}; S.migr.sfRoles = true;
  const all = (S.permissionDefs || []).map(d => d[0]);
  if (!S.roles.some(r => r.name === 'Company Administrator')) S.roles.splice(1, 0, { name: 'Company Administrator', desc: 'Runs the system for their own company: users, branches, settings and every module. Cannot set up or open other client companies.', perms: all.filter(x => x !== 'clients.manage') });
  if (!S.roles.some(r => r.name === 'Auditor')) S.roles.push({ name: 'Auditor', desc: 'Plans and conducts audits, records findings with evidence and raises corrective actions. Can view the records an audit needs; cannot change settings or approve documents.', perms: ['area.dashboard', 'area.legal', 'area.risk', 'area.documents', 'area.assets', 'area.inspections', 'area.audits', 'area.incidents', 'area.actions', 'area.training', 'area.people', 'area.contractors', 'area.reports', 'view.all', 'inspect', 'action.create', 'report.view'] });
  S.config.trainingCats = S.config.trainingCats || TRAINING_CAT_DEFAULT.slice();
});

/* ---------- 6. Evidence files on audit items ---------- */
if (typeof audItemHtml === 'function') {
  const _audItemBeforeSf = audItemHtml;
  audItemHtml = function (a, i, k) { const h = _audItemBeforeSf(a, i, k), an = a.answers[i.id] || {}, files = an.files || [], open = a.status === 'In progress';
    let out = open ? h.replace(/(<label class="btn sm au-photo">[\s\S]*?<\/label>)/, `$1<label class="btn sm au-file">${icon('docs', 'sm')} Evidence file<input type="file" hidden data-audf="${a.id}" data-i="${i.id}" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,image/*"></label>`) : h;
    if (files.length) out = out.replace(/<\/div>\s*$/, `<div class="au-files">${files.map((f, n) => `<span class="au-filechip">${fileChip(f)}${open ? `<button type="button" class="btn sm ghost" data-act="audFileDel" data-id="${a.id}" data-i="${i.id}" data-n="${n}" aria-label="Remove ${esc(f.name)}">${icon('x', 'sm')}</button>` : ''}</span>`).join('')}</div></div>`);
    return out; };
}
document.addEventListener('change', e => { const t = e.target; if (!t || !t.dataset || !t.dataset.audf) return; const a = byId('audits', t.dataset.audf); if (!a) return;
  const an = a.answers[t.dataset.i] = a.answers[t.dataset.i] || {}; an.files = an.files || [];
  [...t.files].slice(0, 5).forEach(f => { if (f.size > 20 * 1048576) { toast(`${f.name} is larger than 20 MB.`, 'error'); return; } an.files.push(fileMeta(f)); });
  log(`Attached evidence to an item of audit ${a.id}`, '#/audits/' + a.id); save(); if (typeof audRedraw === 'function') audRedraw(a, t.dataset.i); else rerender(); });
ACT.audFileDel = (el) => { const a = byId('audits', el.dataset.id), an = a.answers[el.dataset.i]; if (!an || !an.files) return; an.files.splice(+el.dataset.n, 1); save(); if (typeof audRedraw === 'function') audRedraw(a, el.dataset.i); else rerender(); };

/* ---------- 7. A hazard straight from a failed inspection item ---------- */
const _inspBeforeSf = ROUTES.inspections;
ROUTES.inspections = (p, q) => { const r = _inspBeforeSf(p, q); if (!r || !r.html || !p[0] || p[1]) return r; const ins = byId('inspections', p[0]); if (!ins || !can('risk.manage') && !can('inspect')) return r;
  r.html = r.html.replace(/(<tr class="row-red"><td data-label="#">(\d+)<\/td>[\s\S]*?<span class="res-fail">Fail<\/span>)/g, (m, all, k) => {
    const hz = (S.hazards || []).find(h => h.inspection === ins.id && String(h.inspItem) === String(k));
    return all + (hz ? ` <a class="btn sm" href="#/risk/${hz.id}">${icon('risk', 'sm')} ${hz.id}</a>` : ` <button class="btn sm" data-act="hzFromInsp" data-id="${ins.id}" data-k="${k}">${icon('risk', 'sm')} Record as hazard</button>`); });
  return r; };
ACT.hzFromInsp = (el) => { const ins = byId('inspections', el.dataset.id), k = +el.dataset.k, tpl = (typeof tplRevOf === 'function' ? tplRevOf(ins) : null) || ins.template, qs = (tpl && tpl.questions) || ((byId('templates', ins.template) || {}).questions) || [];
  const q = qs[k - 1] || {}, res = (ins.results || []).find(x => x.qid === q.id) || {}, a = byId('assets', ins.asset) || {};
  ACT.hzNew({ dataset: {} });
  setTimeout(() => { const m = document.querySelector('.modal'); if (!m) return; const set = (n, v) => { const x = m.querySelector(`[name=${n}]`); if (x && v != null && v !== '') { x.value = v; x.dispatchEvent(new Event('change', { bubbles: true })); } };
    set('site', ins.site); set('title', (q.text || 'Failed inspection item') + (res.comment ? ' — ' + res.comment : '')); set('location', a.location || ins.target || ''); set('inspection', ins.id);
    set('description', `Found during inspection ${ins.id}${a.tag ? ' of ' + a.tag : ''}: "${q.text || ''}" failed.${res.comment ? ' ' + res.comment : ''}`);
    m.dataset.inspItem = String(k); m.dataset.insp = ins.id; }, 40); };
// remember which item the hazard came from
const _hzNewBeforeSf = ACT.hzNew;
ACT.hzNew = (el) => { const before = (S.hazards || []).length; _hzNewBeforeSf(el);
  setTimeout(() => { const m = document.querySelector('.modal'); if (!m) return; const b = m.querySelector('.modal-foot .btn.primary'); if (!b) return;
    b.addEventListener('click', () => setTimeout(() => { if ((S.hazards || []).length > before && m.dataset.insp) { const h = S.hazards[S.hazards.length - 1]; if (h.inspection === m.dataset.insp) { h.inspItem = +m.dataset.inspItem; save(); } } }, 0), true); }, 30); };

/* ---------- 8. Report filters (date and status) and Excel export ---------- */
const REPF = {};       // per report: { from, to, status }
const REPF_META = {};  // per report: { dateCol, statusCol, statuses, filtered, total }
function rfIso(v) { if (v == null) return null; const s = String(v).trim(); if (!s || s === '—') return null; if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10); if (!/\b(19|20)\d{2}\b/.test(s)) return null;
  const t = Date.parse(s.replace(/ · .*$/, '').replace(/,? \d{1,2}:\d{2}.*$/, '')); if (isNaN(t)) return null; const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
const RF_DATE_PREF = /date|held|issued|reported|raised|created|submitted|started|examined|due|last|next|review|valid|until|from|effective|published|requested|on$/i;
function rfPickDate(headers, rows) { let best = -1;
  headers.forEach((h, c) => { if (best > -1) return; if (!RF_DATE_PREF.test(h)) return; const vals = rows.map(r => r[c]).filter(v => v != null && String(v).trim() && String(v).trim() !== '—'); if (vals.length && vals.filter(v => rfIso(v)).length / vals.length >= 0.6) best = c; });
  return best; }
const _buildReportBeforeRf = buildReport;
buildReport = function (key) {
  const rep = _buildReportBeforeRf(key); if (!rep || !Array.isArray(rep.csv) || rep.csv.length < 2) { REPF_META[key] = null; return rep; }
  const headers = rep.csv[0], rows = rep.csv.slice(1);
  const dateCol = ['incidents', 'capa'].includes(key) ? -1 : rfPickDate(headers, rows);
  let statusCol = headers.findIndex(h => /^(status|status now|state|compliance|result|outcome)$/i.test(String(h).trim())); if (statusCol < 0) statusCol = headers.findIndex(h => /status/i.test(h));
  const statuses = statusCol > -1 ? [...new Set(rows.map(r => String(r[statusCol] == null ? '' : r[statusCol]).trim()).filter(Boolean))].sort() : [];
  const f = REPF[key] || {};
  const keep = rows.map((r, i) => i).filter(i => { const r = rows[i];
    if (dateCol > -1 && (f.from || f.to)) { const d = rfIso(r[dateCol]); if (!d) return false; if (f.from && d < f.from) return false; if (f.to && d > f.to) return false; }
    if (statusCol > -1 && f.status && String(r[statusCol] == null ? '' : r[statusCol]).trim() !== f.status) return false; return true; });
  REPF_META[key] = { dateCol: dateCol > -1 ? headers[dateCol] : null, statusCol: statusCol > -1 ? headers[statusCol] : null, statuses, total: rows.length, shown: keep.length };
  if (keep.length === rows.length) return rep;
  const tb = rep.html.indexOf('<tbody>'), te = rep.html.lastIndexOf('</tbody>');
  if (tb < 0 || te < 0) return rep;
  const trs = rep.html.slice(tb + 7, te).split('</tr>').filter(x => x.trim()).map(x => x + '</tr>');
  if (trs.length !== rows.length) return rep;   // cannot match the rows safely: show everything
  return Object.assign({}, rep, { csv: [headers].concat(keep.map(i => rows[i])), html: keep.length ? rep.html.slice(0, tb + 7) + keep.map(i => trs[i]).join('') + rep.html.slice(te) : '<div class="empty">No records match these filters.</div>' });
};
const _reportsBeforeRf = ROUTES.reports;
ROUTES.reports = (p, q) => { const r = _reportsBeforeRf(p, q); if (!r || !r.html) return r;
  const key = (LAST_REPORT && LAST_REPORT.key) || p[0] || 'overall', meta = REPF_META[key], f = REPF[key] || {};
  r.html = r.html.replace('<button class="btn sm" data-act="repCsv">', `<button class="btn sm" data-act="repXlsx">${icon('download', 'sm')} Excel</button><button class="btn sm" data-act="repCsv">`);
  if (meta && (meta.dateCol || meta.statusCol)) {
    const bar = `<div class="toolbar no-print sf-rf">${meta.dateCol ? `<label class="muted" for="rfFrom">${esc(meta.dateCol)} from</label><input type="date" id="rfFrom" value="${esc(f.from || '')}"><label class="muted" for="rfTo">to</label><input type="date" id="rfTo" value="${esc(f.to || '')}">` : ''}${meta.statusCol ? `<label class="muted" for="rfStatus">${esc(meta.statusCol)}</label><select id="rfStatus"><option value="">All</option>${meta.statuses.map(s => `<option ${s === f.status ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>` : ''}<button class="btn sm" data-act="rfApply" data-k="${esc(key)}">Apply</button>${f.from || f.to || f.status ? `<button class="btn sm ghost" data-act="rfClear" data-k="${esc(key)}">Clear</button>` : ''}<span class="t-sub">${meta.shown} of ${meta.total} shown</span></div>`;
    r.html = r.html.replace('<div class="card-body" style="padding-top:12px">', bar + '<div class="card-body" style="padding-top:12px">');
  }
  return r; };
ACT.rfApply = (el) => { const k = el.dataset.k, g = id => (document.getElementById(id) || {}).value || ''; const from = g('rfFrom'), to = g('rfTo');
  if (from && to && from > to) { toast('The "from" date is after the "to" date.', 'error'); return; }
  REPF[k] = { from, to, status: g('rfStatus') }; rerender(); };
ACT.rfClear = (el) => { delete REPF[el.dataset.k]; rerender(); };

// A small .xlsx writer: one sheet, the header row in bold, numbers kept as numbers
const XL_CRC = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function xlCrc(b) { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = XL_CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function xlZip(files) {   // files: [{name, data: Uint8Array}] → Uint8Array (stored, no compression)
  const enc = new TextEncoder(), parts = [], central = []; let off = 0;
  const u16 = v => [v & 0xFF, (v >>> 8) & 0xFF], u32 = v => [v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF];
  files.forEach(f => { const name = enc.encode(f.name), crc = xlCrc(f.data), size = f.data.length;
    const local = new Uint8Array([...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(size), ...u32(size), ...u16(name.length), ...u16(0)]);
    parts.push(local, name, f.data);
    central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(size), ...u32(size), ...u16(name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off)]), name);
    off += local.length + name.length + size; });
  const cdSize = central.reduce((n, x) => n + x.length, 0);
  const end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(cdSize), ...u32(off), ...u16(0)]);
  const all = parts.concat(central, [end]), out = new Uint8Array(all.reduce((n, x) => n + x.length, 0)); let p = 0; all.forEach(x => { out.set(x, p); p += x.length; }); return out;
}
function xlsxBlob(rows, sheet = 'Report') {
  const x = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  const col = n => { let s = ''; n++; while (n) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
  const widths = (rows[0] || []).map((_, c) => Math.min(60, Math.max(8, ...rows.slice(0, 200).map(r => String(r[c] == null ? '' : r[c]).length)) + 2));
  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols><sheetData>${rows.map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => { const ref = col(ci) + (ri + 1), s = v == null ? '' : String(v);
    if (ri > 0 && /^-?\d+(\.\d+)?$/.test(s) && s.length < 15) return `<c r="${ref}"><v>${s}</v></c>`;
    return `<c r="${ref}" t="inlineStr"${ri === 0 ? ' s="1"' : ''}><is><t xml:space="preserve">${x(s)}</t></is></c>`; }).join('')}</row>`).join('')}</sheetData></worksheet>`;
  const enc = new TextEncoder(), f = (name, s) => ({ name, data: enc.encode(s) });
  const zip = xlZip([
    f('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'),
    f('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'),
    f('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${x(sheet.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || 'Report')}" sheetId="1" r:id="rId1"/></sheets></workbook>`),
    f('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'),
    f('xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf/><xf fontId="1" applyFont="1"/></cellXfs></styleSheet>'),
    f('xl/worksheets/sheet1.xml', sheetXml)]);
  return new Blob([zip], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
ACT.repXlsx = () => { if (!LAST_REPORT || !LAST_REPORT.csv || LAST_REPORT.csv.length < 2) { toast('Nothing to export.', 'error'); return; }
  const n = LAST_REPORT.csv.length - 1;
  saveFile(`VDW_${LAST_REPORT.key}_${S.ui.site}_${TODAY}.xlsx`, xlsxBlob(LAST_REPORT.csv, LAST_REPORT.title || 'Report')).then(ok => { if (ok) toast(`Exported ${n} row(s) to Excel.`); }); };
