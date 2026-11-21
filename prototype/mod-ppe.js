/* ==========================================================================
   PPE Management (specification module 12)
   - PPE types with replacement interval and stock (minimum level).
   - Requirements: everyone, by job title, or by activity (named people),
     optionally linked to the risk assessment that calls for it.
   - Issues: person, item, quantity, date, reason, replacement date; the
     employee acknowledges receipt (in "My appointments & PPE").
   - Register: per person what is required and its status — Issued,
     Replacement due, Outstanding, Not acknowledged. Issue history export.
   ========================================================================== */
'use strict';

const canPPE = () => can('ppe.manage');
const ppeTypes = () => (S.ppeTypes || []).filter(t => t.org === S.ui.org);
const ppeType = id => byId('ppeTypes', id);
const PPE_TONE = { 'Issued': 'green', 'Replacement due': 'amber', 'Outstanding': 'red', 'Not signed': 'blue' };
function ppeReqFor(x) { const out = []; (S.ppeReqs || []).filter(r => r.org === x.org).forEach(r => { const hit = r.by === 'all' || (r.by === 'job' && r.value === x.jobTitle) || (r.by === 'activity' && (r.people || []).includes(x.id)); if (hit && ppeType(r.ppe) && !out.some(o => o.ppe === r.ppe)) out.push({ ppe: r.ppe, qty: r.qty || 1, why: r.by === 'all' ? 'Everyone' : r.by === 'job' ? 'Job title: ' + r.value : 'Activity: ' + r.value, ra: r.ra }); }); return out; }
const lastIssue = (pid, tid) => (S.ppeIssues || []).filter(i => i.person === pid && i.ppe === tid).sort((a, b) => b.date.localeCompare(a.date))[0] || null;
// PPE counts as received only when the employee signed for it (or it was signed on the paper issue register before the system)
function ppeSigned(i) { return !!(i && i.ack && (i.ack.sig || i.ack.paper)); }
function ppeStatus(pid, tid) { const i = lastIssue(pid, tid); if (!i) return 'Outstanding'; if (i.replaceBy && daysTo(i.replaceBy) <= 14) return 'Replacement due'; if (!ppeSigned(i)) return 'Not signed'; return 'Issued'; }
const ppePeople = () => S.people.filter(p => p.org === S.ui.org && p.status !== 'Deactivated' && p.type === 'Employee' && (S.ui.site === 'ALL' || p.site === S.ui.site));

ROUTES.ppe = (p, q = {}) => {
  const tab = ['register', 'issues', 'types'].includes(p[0]) ? p[0] : 'register', P = ppePeople();
  let out = 0, due = 0, noack = 0; P.forEach(x => ppeReqFor(x).forEach(r => { const s = ppeStatus(x.id, r.ppe); if (s === 'Outstanding') out++; if (s === 'Replacement due') due++; if (s === 'Not signed') noack++; }));
  const low = ppeTypes().filter(t => t.minStock != null && t.stock != null && t.stock <= t.minStock);
  const tabs = [['register', 'PPE register'], ['issues', 'Issue history', (S.ppeIssues || []).filter(i => i.org === S.ui.org).length], ['types', 'PPE types & requirements', ppeTypes().length]];
  let body = '', fab = canPPE() ? fabBtn('ppeIssue', 'Issue PPE') : '';
  if (tab === 'register') body = ppeRegisterHtml(P, q);
  if (tab === 'issues') body = ppeIssuesHtml(q);
  if (tab === 'types') { body = ppeTypesHtml(); fab = canPPE() ? fabStack([{ act: 'ppeTypeEdit', label: 'New PPE type' }, { act: 'ppeReqNew', label: 'Add requirement', icon: 'target', cls: 'ghost' }]) : ''; }
  const html = `${pageHead('PPE management', 'Which personal protective equipment each person needs, what was issued and when it must be replaced. Employees acknowledge what they receive.', '', scopePill())}${fab}
    <div class="kpis">${kpi('Outstanding PPE', out, 'Required, never issued', out ? 'red' : 'green', '#/ppe/register?fstatus=Outstanding', 'hardhat')}${kpi('Replacement due', due, 'Within 14 days or overdue', due ? 'amber' : 'green', '#/ppe/register?fstatus=Replacement%20due', 'refresh')}
      ${kpi('Not signed', noack, 'Issued, employee has not signed', noack ? 'amber' : 'green', '#/ppe/register?fstatus=Not%20acknowledged', 'user')}${kpi('Low stock', low.length, low.map(t => t.name).join(', ') || 'Stock above minimum', low.length ? 'amber' : 'green', '#/ppe/types', 'docs')}</div>
    ${tabsHtml('#/ppe', tabs, tab)}${body}`;
  return { title: 'PPE management', nav: 'ppe', crumbs: [['PPE Management', '#/ppe']], html };
};
const PPEREG_F = {
  fsite: { all: 'All branches', list: () => orgSites().length > 1 ? branchOpts() : [], test: (x, v) => x.site === v },
  fjob: { all: 'All job titles', list: () => [...new Set(ppePeople().map(x => x.jobTitle))].sort().map(j => ({ value: j, label: j })), test: (x, v) => x.jobTitle === v },
  fppe: { all: 'All PPE', list: () => ppeTypes().map(t => ({ value: t.id, label: t.name })), test: (x, v) => ppeReqFor(x).some(r => r.ppe === v) },
  fstatus: { all: 'Any status', list: () => Object.keys(PPE_TONE).map(s => ({ value: s, label: s })), test: (x, v) => ppeReqFor(x).some(r => ppeStatus(x.id, r.ppe) === v) }
};
function ppeRegisterHtml(P, q) { const all = P.filter(x => ppeReqFor(x).length), rows = regFilter(all, q, PPEREG_F);
  return `<div class="card">${regFilterBar('#/ppe/register', q, all, rows.length, PPEREG_F, 'Search name, job title…')}<div class="card-body flush">${rows.length ? `<div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Employee</th><th>Required PPE and status</th>${canPPE() ? '<th></th>' : ''}</tr></thead><tbody>
    ${rows.map(x => `<tr><td data-label="Employee"><a href="#/people/${x.id}"><b>${esc(x.name)}</b></a><div class="t-sub">${esc(x.jobTitle)} · ${esc(sname(x.site))}</div></td><td data-label="PPE"><div class="ppe-chips">${ppeReqFor(x).filter(r => !q.fppe || r.ppe === q.fppe).map(r => { const s = ppeStatus(x.id, r.ppe), i = lastIssue(x.id, r.ppe); return `<span class="ppe-chip pc-${PPE_TONE[s]}" title="${esc(r.why)}${i ? ' · issued ' + fmt(i.date) + (i.replaceBy ? ', replace by ' + fmt(i.replaceBy) : '') : ''}">${esc(ppeType(r.ppe).name)} · ${s}</span>`; }).join('')}</div></td>${canPPE() ? `<td><button class="btn sm" data-act="ppeIssue" data-p="${x.id}">Issue</button></td>` : ''}</tr>`).join('')}
  </tbody></table></div>` : emptyList(all.length ? 'Nobody matches these filters.' : 'No PPE requirements set up yet.')}</div></div>`; }
const ISS_F = { fppe: { all: 'All PPE', list: () => ppeTypes().map(t => ({ value: t.id, label: t.name })), test: (i, v) => i.ppe === v }, fperson: { all: 'All employees', list: () => personOpts(p => (S.ppeIssues || []).some(i => i.person === p.id)), test: (i, v) => i.person === v }, fack: { all: 'Acknowledged or not', list: () => [{ value: 'no', label: 'Not signed' }, { value: 'yes', label: 'Acknowledged' }], test: (i, v) => v === 'no' ? !ppeSigned(i) : !!ppeSigned(i) } };
function ppeIssuesHtml(q) { const all = (S.ppeIssues || []).filter(i => i.org === S.ui.org).sort((a, b) => b.date.localeCompare(a.date)), rows = regFilter(all, q, ISS_F);
  return `<div class="card">${regFilterBar('#/ppe/issues', q, all, rows.length, ISS_F, 'Search employee, item…')}<div class="card-body flush">${rows.length ? `<div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Date</th><th>Employee</th><th>Item</th><th>Qty</th><th>Reason</th><th>Replace by</th><th>Signed for</th></tr></thead><tbody>${rows.map(i => `<tr><td data-label="Date">${fmt(i.date)}</td><td data-label="Employee">${esc(pname(i.person))}</td><td data-label="Item"><b>${esc((ppeType(i.ppe) || {}).name || i.ppe)}</b>${i.size ? `<div class="t-sub">Size ${esc(i.size)}</div>` : ''}</td><td data-label="Qty">${i.qty}</td><td data-label="Reason">${esc(i.reason)}</td><td data-label="Replace by">${i.replaceBy ? dueText(i.replaceBy) : '—'}</td><td data-label="Signed for">${ppeSigned(i) ? `${i.ack.sig ? `<span class="sig-show"><img src="${i.ack.sig}" alt="Signature of ${esc(pname(i.person))}"><small>${fmtTs(i.ack.ts)}</small></span>` : fmtTs(i.ack.ts)}` : '<span class="due amber">Waiting</span>'}</td></tr>`).join('')}</tbody></table></div><div class="mx-legend"><button class="btn sm" data-act="ppeCsv">${icon('download', 'sm')} Export issue history (CSV)</button></div>` : emptyList('No issues recorded.')}</div></div>`; }
ACT.ppeCsv = () => csvDownload('PPE_issues', [['Date', 'Employee', 'Employee number', 'Branch', 'Item', 'Quantity', 'Reason', 'Replace by', 'Acknowledged']].concat((S.ppeIssues || []).filter(i => i.org === S.ui.org).map(i => { const x = person(i.person) || {}; return [i.date, x.name, x.empNo || '', sname(x.site), (ppeType(i.ppe) || {}).name, i.qty, i.reason, i.replaceBy || '', ppeSigned(i) ? i.ack.ts.slice(0, 16).replace('T', ' ') : 'No']; })));
function ppeTypesHtml() { const R = (S.ppeReqs || []).filter(r => r.org === S.ui.org);
  return `<div class="card mb"><div class="card-head"><h2>PPE types</h2></div><div class="card-body flush"><div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Item</th><th>Category</th><th>Replace every</th><th>Stock</th>${canPPE() ? '<th></th>' : ''}</tr></thead><tbody>${ppeTypes().map(t => `<tr><td data-label="Item"><b>${esc(t.name)}</b></td><td data-label="Category">${esc(t.category || '')}</td><td data-label="Replace">${t.replaceMonths ? t.replaceMonths + ' months' : '<span class="muted">When worn or damaged</span>'}</td><td data-label="Stock">${t.stock == null ? '—' : `${t.stock}${t.minStock != null ? ` <span class="t-sub">(min ${t.minStock})</span>` : ''}${t.minStock != null && t.stock <= t.minStock ? ' ' + badge('Low', 'amber', true) : ''}`}</td>${canPPE() ? `<td><button class="btn sm" data-act="ppeTypeEdit" data-id="${t.id}">${icon('edit', 'sm')} Edit</button></td>` : ''}</tr>`).join('')}</tbody></table></div></div></div>
  <div class="card"><div class="card-head"><h2>PPE requirements</h2></div><div class="card-body flush">${R.length ? `<div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Item</th><th>Required for</th><th>Qty</th><th>Risk assessment</th></tr></thead><tbody>${R.map(r => `<tr><td data-label="Item"><b>${esc((ppeType(r.ppe) || {}).name || r.ppe)}</b></td><td data-label="For">${esc(r.by === 'all' ? 'Everyone' : r.by === 'job' ? 'Job title: ' + r.value : 'Activity: ' + r.value)}</td><td data-label="Qty">${r.qty || 1}</td><td data-label="RA">${r.ra ? `<a href="#/risk/${r.ra}">${r.ra}</a>` : '—'}</td></tr>`).join('')}</tbody></table></div>` : emptyList('No requirements yet.')}</div></div>`; }
ACT.ppeTypeEdit = (el) => { const t = el && el.dataset && el.dataset.id ? ppeType(el.dataset.id) : null; openModal({ title: t ? 'Edit PPE type' : 'New PPE type', body: `<div class="form-grid">${fld({ name: 'name', label: 'Item', value: t ? t.name : '', required: true, full: true })}${fld({ name: 'category', label: 'Category', type: 'select', options: opts(['Foot', 'Hand', 'Head', 'Eye and face', 'Hearing', 'Respiratory', 'Body / clothing', 'Fall protection', 'Other'], t ? t.category : 'Other') })}${fld({ name: 'replaceMonths', label: 'Replace every (months; empty = when worn or damaged)', type: 'number', min: 1, value: t ? t.replaceMonths || '' : '' })}${fld({ name: 'stock', label: 'Stock on hand', type: 'number', min: 0, value: t && t.stock != null ? t.stock : '' })}${fld({ name: 'minStock', label: 'Minimum stock', type: 'number', min: 0, value: t && t.minStock != null ? t.minStock : '' })}</div>`,
  buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m), o = { name: v.name, category: v.category, replaceMonths: v.replaceMonths ? +v.replaceMonths : null, stock: v.stock === '' ? null : +v.stock, minStock: v.minStock === '' ? null : +v.minStock }; if (t) Object.assign(t, o); else { S.ppeTypes = S.ppeTypes || []; S.ppeTypes.push(Object.assign({ id: nextId('PPE-', 'ppeTypes'), org: S.ui.org }, o)); } log(`Saved PPE type "${v.name}"`, '#/ppe/types'); save(); rerender(); } }] }); };
ACT.ppeReqNew = () => openModal({ title: 'Add a PPE requirement', body: `<div class="form-grid">${fld({ name: 'ppe', label: 'Item', type: 'select', options: opts(ppeTypes().map(t => ({ value: t.id, label: t.name })), '', '— Select —'), required: true })}${fld({ name: 'qty', label: 'Quantity', type: 'number', min: 1, value: 1 })}
    ${fld({ name: 'by', label: 'Required for', type: 'select', options: opts([{ value: 'job', label: 'A job title' }, { value: 'activity', label: 'An activity (named people)' }, { value: 'all', label: 'Everyone' }]) })}${fld({ name: 'job', label: 'Job title', type: 'select', options: opts([...new Set(S.people.filter(p => p.org === S.ui.org).map(p => p.jobTitle))].sort()) })}
    ${fld({ name: 'activity', label: 'Activity (if by activity)', full: true })}<div class="field full"><label>People (if by activity)</label><div class="chk-col">${ppePeople().map(x => `<label class="check"><input type="checkbox" name="pa_${x.id}"> <span>${esc(x.name)}</span></label>`).join('')}</div></div>
    ${fld({ name: 'ra', label: 'Risk assessment that calls for it', type: 'select', options: opts((S.riskAssessments || []).filter(a => a.org === S.ui.org && a.status !== 'Superseded').map(a => ({ value: a.id, label: `${a.id} — ${a.title}` })), '', '— None —'), full: true })}</div>`,
  buttons: [{ label: 'Add', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); S.ppeReqs = S.ppeReqs || []; S.ppeReqs.push({ id: nextId('PRQ-', 'ppeReqs'), org: S.ui.org, ppe: v.ppe, qty: +v.qty || 1, by: v.by, value: v.by === 'job' ? v.job : v.by === 'activity' ? v.activity : '', people: v.by === 'activity' ? ppePeople().filter(x => m.querySelector(`[name=pa_${x.id}]`).checked).map(x => x.id) : [], ra: v.ra || null }); log('Added a PPE requirement', '#/ppe/types'); save(); rerender(); } }] });
ACT.ppeIssue = (el) => { const d = (el && el.dataset) || {}; openModal({ title: 'Issue PPE', sub: 'The employee is asked to acknowledge receipt.', body: `<div class="form-grid">
    ${fld({ name: 'person', label: 'Employee', type: 'select', options: personOptions(d.p || '', p => p.status !== 'Deactivated'), required: true })}${fld({ name: 'ppe', label: 'Item', type: 'select', options: opts(ppeTypes().map(t => ({ value: t.id, label: `${t.name}${t.stock != null ? ' (stock ' + t.stock + ')' : ''}` })), '', '— Select —'), required: true })}
    ${fld({ name: 'qty', label: 'Quantity', type: 'number', min: 1, value: 1, required: true })}${fld({ name: 'size', label: 'Size' })}
    ${fld({ name: 'reason', label: 'Reason', type: 'select', options: opts(['New issue', 'Replacement — worn', 'Replacement — damaged', 'Replacement — lost', 'Scheduled replacement']) })}${fld({ name: 'date', label: 'Date issued', type: 'date', value: TODAY, required: true })}
    ${fld({ name: 'replaceBy', label: 'Replace by (filled from the item)', type: 'date' })}</div>`,
  onOpen: m => { const fill = () => { const t = ppeType(m.querySelector('[name=ppe]').value); m.querySelector('[name=replaceBy]').value = t && t.replaceMonths ? addMonths(m.querySelector('[name=date]').value, t.replaceMonths) : ''; }; m.querySelector('[name=ppe]').addEventListener('change', fill); m.querySelector('[name=date]').addEventListener('change', fill); },
  buttons: [{ label: 'Issue', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m), t = ppeType(v.ppe), qty = Math.max(1, +v.qty);
    if (t.stock != null && t.stock < qty) { toast(`Only ${t.stock} in stock.`, 'error'); return false; }
    S.ppeIssues = S.ppeIssues || []; const i = { id: nextId('ISS-', 'ppeIssues', 4), org: S.ui.org, person: v.person, ppe: v.ppe, qty, size: v.size, reason: v.reason, date: v.date, replaceBy: v.replaceBy, by: S.ui.user, ack: null }; S.ppeIssues.push(i); if (t.stock != null) t.stock -= qty;
    addEvent('blue', 'ppe', `PPE issued to you: ${t.name}`, 'Please confirm that you received it.', '#/myppe', 'ALL', [v.person]);
    if (t.minStock != null && t.stock != null && t.stock <= t.minStock) queueEmail(hseqManagers(S.ui.org), 'actions', `Low PPE stock: ${t.name} (${t.stock} left)`, `Stock of ${t.name} is at ${t.stock}, at or below the minimum of ${t.minStock}.`, '#/ppe/types');
    log(`Issued ${qty} × ${t.name} to ${pname(v.person)}`, '#/ppe/issues'); save(); toast('PPE issued.'); rerender(); } }] }); };
ACT.ppeAck = (el) => { const i = byId('ppeIssues', el.dataset.id); i.ack = { ts: nowTs(), user: S.ui.user }; log(`${pname(S.ui.user)} acknowledged receipt of ${ppeType(i.ppe).name}`, '#/myppe'); save(); rerender(); };
// "My PPE": what was issued to me, what to confirm and when it must be replaced (phone and PC)
ROUTES.myppe = () => {
  const L = (S.ppeIssues || []).filter(i => i.person === S.ui.user).sort((a, b) => b.date.localeCompare(a.date)), x = me(), need = x ? ppeReqFor(x) : [];
  const toAck = L.filter(i => !ppeSigned(i)), rest = L.filter(i => ppeSigned(i));
  const row = i => `<li><div class="ll-main"><b>${i.qty} × ${esc((ppeType(i.ppe) || {}).name || '')}</b>${i.size ? ` <span class="t-sub">size ${esc(i.size)}</span>` : ''}<div class="t-sub">Issued ${fmt(i.date)}${i.replaceBy ? ' · replace by ' + fmt(i.replaceBy) : ''}${i.replaceBy && daysTo(i.replaceBy) <= 14 ? ' · <span class="due amber">replacement due</span>' : ''}</div></div>${ppeSigned(i) ? badge('Received ' + fmt(i.ack.ts.slice(0, 10)), 'green', true) : `<button class="btn sm primary" data-act="ppeAck" data-id="${i.id}">I received it</button>`}</li>`;
  const html = `<div class="mobile-card"><h1 style="margin:4px 0 4px">My PPE</h1><p class="muted">The protective equipment issued to you. Confirm each item when you receive it, and ask your supervisor for a replacement when it is worn or damaged.</p>
    ${toAck.length ? `<div class="card mb apt-respond"><div class="card-head"><h2>Confirm that you received</h2><span class="ch-sub">${toAck.length}</span></div><div class="card-body flush"><ul class="link-list">${toAck.map(row).join('')}</ul></div></div>` : ''}
    <div class="card mb"><div class="card-head"><h2>Issued to you</h2><span class="ch-sub">${rest.length}</span></div>${rest.length ? `<div class="card-body flush"><ul class="link-list">${rest.slice(0, 20).map(row).join('')}</ul></div>` : `<div class="card-body muted">${L.length ? 'Nothing else issued.' : 'No PPE has been issued to you yet. Your supervisor records it here when you receive PPE.'}</div>`}</div>
    ${need.length ? `<div class="card mb"><div class="card-head"><h2>PPE required for your work</h2></div><div class="card-body flush"><ul class="link-list">${need.map(r => { const s = ppeStatus(x.id, r.ppe); return `<li><div class="ll-main"><b>${esc(ppeType(r.ppe).name)}</b><div class="t-sub">${esc(r.why)}</div></div>${badge(s, PPE_TONE[s], true)}</li>`; }).join('')}</ul></div></div>` : ''}</div>`;
  return { title: 'My PPE', nav: 'myppe', crumbs: [['My PPE', '#/myppe']], html };
};

/* ---------------- Wiring + demo data ---------------- */
addNavGroup('Assets & inspections', { group: 'Operational safety', items: [['ppe', 'PPE Management', 'hardhat']] });
AREA_OF.ppe = 'area.ppe'; ['ppe', 'myppe'].forEach(k => { if (!TOP_ROUTES.includes(k)) TOP_ROUTES.push(k); });
(() => { const g = NAV.find(x => x.group === 'Overview'), k = g ? g.items.findIndex(i => i[0] === 'me') : -1; if (g && !g.items.some(i => i[0] === 'myppe')) g.items.splice(k + 1, 0, ['myppe', 'My PPE', 'hardhat']); })();
if (!NAV_FIELD[0].items.some(i => i[0] === 'myppe')) NAV_FIELD[0].items.push(['myppe', 'My PPE', 'hardhat']);
if (!FIELD_ROUTES.includes('myppe')) FIELD_ROUTES.push('myppe');
// the phone home screen also points to PPE waiting to be confirmed
const _fieldBeforePPE = ROUTES.field;
ROUTES.field = (p, q) => { const r = _fieldBeforePPE(p, q), n = (S.ppeIssues || []).filter(i => i.person === S.ui.user && !ppeSigned(i)).length;
  if (n && r && r.html) r.html = r.html.replace('<div class="mobile-card">', `<div class="mobile-card"><a class="alert info apt-callout" href="#/myppe">${icon('hardhat')}<div><b>${n} PPE item${n > 1 ? 's' : ''} to confirm.</b> Tap to confirm you received ${n > 1 ? 'them' : 'it'}.</div></a>`); return r; };
const _needsBackBeforePPE = needsBack; needsBack = function (parts) { if (parts[0] === 'ppe' && ['register', 'issues', 'types'].includes(parts[1])) return false; return _needsBackBeforePPE(parts); };
const _myTasksBeforePPE = myTasks;
myTasks = function () { const out = _myTasksBeforePPE(); (S.ppeIssues || []).filter(i => i.person === S.ui.user && !ppeSigned(i)).forEach(i => out.push({ title: `Confirm you received: ${(ppeType(i.ppe) || {}).name}`, sub: `Issued ${fmt(i.date)}`, link: '#/myppe', sev: 'blue' }));
  if (canPPE()) { let n = 0; ppePeople().forEach(x => ppeReqFor(x).forEach(r => { if (['Outstanding', 'Replacement due'].includes(ppeStatus(x.id, r.ppe))) n++; })); if (n) out.push({ title: `${n} PPE item(s) outstanding or due for replacement`, sub: 'PPE register', link: '#/ppe/register', sev: 'amber' }); }
  return out; };
MIGRATIONS.push(() => {
  if (S.migr && S.migr.ppe) return; S.migr = S.migr || {}; S.migr.ppe = true;
  addArea('area.ppe', 'PPE management', 'area.maintenance', 'area.assets');
  addPerm('ppe.manage', 'Manage PPE: types, requirements, issues and stock', ['HSEQ Manager', 'Safety Consultant', 'Branch Manager', 'Supervisor']);
  S.ppeTypes = S.ppeTypes || []; S.ppeReqs = S.ppeReqs || []; S.ppeIssues = S.ppeIssues || [];
  const T = (id, name, category, replaceMonths, stock, minStock) => { if (!byId('ppeTypes', id)) S.ppeTypes.push({ id, org: 'ORG-1', name, category, replaceMonths, stock, minStock }); };
  T('PPE-001', 'Safety boots', 'Foot', 12, 18, 5); T('PPE-002', 'High-visibility vest', 'Body / clothing', 12, 40, 10); T('PPE-003', 'Cut-resistant gloves', 'Hand', 3, 12, 15);
  T('PPE-004', 'Safety glasses', 'Eye and face', 12, 30, 10); T('PPE-005', 'Ear plugs (box)', 'Hearing', 6, 6, 2); T('PPE-006', 'Chemical-resistant gloves', 'Hand', 3, 8, 4);
  const R = (id, ppe, by, value, people, ra) => { if (!byId('ppeReqs', id)) S.ppeReqs.push({ id, org: 'ORG-1', ppe, qty: 1, by, value, people: people || [], ra: ra || null }); };
  R('PRQ-001', 'PPE-001', 'all', ''); R('PRQ-002', 'PPE-002', 'job', 'Forklift Operator', [], 'RA-001'); R('PRQ-003', 'PPE-002', 'job', 'Storeperson'); R('PRQ-004', 'PPE-003', 'job', 'Storeperson');
  R('PRQ-005', 'PPE-006', 'activity', 'Uses degreaser in the workshop', ['P-008', 'P-010'], 'RA-002'); R('PRQ-006', 'PPE-004', 'job', 'Workshop Technician');
  const I = (id, person, ppe, days, ack, extra) => { if (byId('ppeIssues', id)) return; const t = byId('ppeTypes', ppe), date = addDays(TODAY, days); S.ppeIssues.push(Object.assign({ id, org: 'ORG-1', person, ppe, qty: 1, size: '', reason: 'New issue', date, replaceBy: t.replaceMonths ? addMonths(date, t.replaceMonths) : '', by: 'P-007', ack: ack ? { ts: date + 'T10:00:00.000Z', user: person, paper: true } : null }, extra || {})); };
  ['P-001', 'P-002', 'P-003', 'P-004', 'P-005', 'P-007', 'P-008', 'P-009', 'P-010', 'P-011', 'P-012', 'P-016', 'P-019'].forEach((pid, k) => I('ISS-' + (3001 + k), pid, 'PPE-001', -40 - k * 20, true));
  I('ISS-3020', 'P-014', 'PPE-001', -380, true); I('ISS-3021', 'P-009', 'PPE-002', -100, true); I('ISS-3022', 'P-012', 'PPE-002', -5, false);
  I('ISS-3023', 'P-008', 'PPE-006', -80, true); I('ISS-3024', 'P-010', 'PPE-006', -20, true); I('ISS-3025', 'P-010', 'PPE-004', -200, true);
});
// Since PPE must be signed for: older demo receipts count as signed on the paper register; give the demo employees PPE to sign
MIGRATIONS.push(() => { if (S.migr && S.migr.ppe2) return; S.migr = S.migr || {}; S.migr.ppe2 = true; if (!S.ppeIssues) return;
  S.ppeIssues.filter(i => /^ISS-30\d\d$/.test(i.id) && i.ack && !i.ack.sig && !['ISS-3026', 'ISS-3027'].includes(i.id)).forEach(i => { i.ack.paper = true; });
  const add = (id, person, ppe, days) => { if (byId('ppeIssues', id) || !byId('ppeTypes', ppe)) return; const t = byId('ppeTypes', ppe), date = addDays(TODAY, days); S.ppeIssues.push({ id, org: 'ORG-1', person, ppe, qty: 1, size: '', reason: 'New issue', date, replaceBy: t.replaceMonths ? addMonths(date, t.replaceMonths) : '', by: 'P-007', ack: null }); };
  add('ISS-3026', 'P-013', 'PPE-001', -3); add('ISS-3027', 'P-013', 'PPE-002', -3); add('ISS-3028', 'P-009', 'PPE-004', -1);
  ['ISS-3026', 'ISS-3027'].forEach(id => { const i = byId('ppeIssues', id); if (i && i.ack && !i.ack.sig) i.ack = null; });
});
