/* ==========================================================================
   Assets & Equipment, QR access, Maintenance & Defects
   (inspections live in mod-incidents-audits.js)
   ========================================================================== */
'use strict';

function assetType(a) { return byId('assetTypes', a.type) || { name: '?', reqDocs: [] }; }
function assetOpenDefects(a) { return S.defects.filter(d => d.asset === a.id && d.status !== 'Closed'); }
function assetActions(a) {
  const ids = new Set();
  S.defects.filter(d => d.asset === a.id && d.action).forEach(d => ids.add(d.action));
  S.inspections.filter(i => i.asset === a.id).forEach(i => (i.actions || []).forEach(x => ids.add(x)));
  S.actions.filter(x => x.source === 'Maintenance' && (byId('maintenance', x.sourceId) || {}).asset === a.id).forEach(x => ids.add(x.id));
  return [...ids].map(id => byId('actions', id)).filter(Boolean);
}
function assetDocSummary(a) { const ds = assetDocStatus(a); const ok = ds.filter(d => d.status === 'Valid' || d.status === 'Expiring').length; const bad = ds.some(d => d.status === 'Expired' || d.status === 'Missing'); const warn = ds.some(d => d.status === 'Expiring'); return `<span class="due ${bad ? 'red' : warn ? 'amber' : 'green'}">${ok}/${ds.length} valid</span>${bad ? '<div class="t-sub" style="color:var(--red)">Expired / missing</div>' : warn ? '<div class="t-sub">Expiring soon</div>' : ''}`; }
function nextInsp(a) { const s = scheduleFor(a.id).sort((x, y) => x.nextDue.localeCompare(y.nextDue))[0]; return s; }

ROUTES.assets = (p, q) => {
  if (p[0]) return assetDetail(p[0], q);
  const rows = scoped('assets');
  const docIssues = rows.filter(a => assetDocStatus(a).some(d => d.status === 'Expired' || d.status === 'Missing'));
  const inspOver = rows.filter(a => scheduleFor(a.id).some(s => daysTo(s.nextDue) < 0));
  const lv = listView('assets', { rows, initial: { status: q.status || '', issue: q.issue || '' }, resetState: !!(q.status || q.issue), placeholder: 'Search tag, name, serial, QR…', search: a => [a.id, a.tag, a.name, a.serial, a.qr, a.make, a.model].join(' '), href: a => '#/assets/' + a.id,
    rowClass: a => a.status === 'Out of Service' ? 'row-red' : assetDocStatus(a).some(d => d.status === 'Expired' || d.status === 'Missing') ? 'row-amber' : '',
    filters: [
      { id: 'type', label: 'All asset types', options: S.assetTypes.map(t => ({ value: t.id, label: t.name })), test: (a, v) => a.type === v },
      { id: 'status', label: 'All statuses', options: ['In Service', 'Out of Service', 'Under Maintenance', 'Decommissioned'], test: (a, v) => a.status === v },
      { id: 'site', label: 'All sites', options: orgSites().map(s => ({ value: s.id, label: s.short })), test: (a, v) => a.site === v },
      { id: 'issue', label: 'Any compliance state', options: [{ value: 'docs', label: 'Certificate expired / missing' }, { value: 'insp', label: 'Inspection overdue' }], test: (a, v) => v === 'docs' ? assetDocStatus(a).some(d => d.status === 'Expired' || d.status === 'Missing') : scheduleFor(a.id).some(s => daysTo(s.nextDue) < 0) }
    ],
    columns: [
      { label: 'Asset', render: a => `<div class="t-title">${esc(a.tag)} — ${esc(a.name)}</div><div class="t-sub">${esc(a.make)} ${esc(a.model)} · S/N ${esc(a.serial)}</div>` },
      { label: 'Type', render: a => esc(assetType(a).name) },
      { label: 'Site / location', render: a => `${esc(sname(a.site))}<div class="t-sub">${esc(a.location)}</div>` },
      { label: 'Responsible', render: a => esc(pname(a.responsible)) },
      { label: 'Status', render: a => sbadge(a.status) },
      { label: 'Required documents', render: a => assetDocSummary(a) },
      { label: 'Next inspection', render: a => { const s = nextInsp(a); return s ? dueText(s.nextDue) : '<span class="muted">Not scheduled</span>'; } },
      { label: 'Open defects', render: a => { const d = assetOpenDefects(a); return d.length ? `<span class="badge b-${d.some(x => x.severity === 'Critical') ? 'red' : 'amber'}">${d.length}</span>` : '—'; } }
    ] });
  const html = `${pageHead('Assets & equipment', 'Asset register with type-specific document requirements, inspection schedules, maintenance history, defects, actions and QR identification.', `<button class="btn" data-act="qrScan">${icon('qr', 'sm')} Scan asset QR (simulated)</button>${permBtn('inspect', `<button class="btn primary" data-act="assetNew">${icon('plus', 'sm')} Add asset</button>`)}`, scopePill())}
    <div class="kpis">
      ${kpi('Assets', rows.length, `${S.assetTypes.length} configurable asset types`, 'blue', '#/assets', 'forklift')}
      ${kpi('Out of service', rows.filter(a => a.status === 'Out of Service').length, 'Critical defects / removed from use', rows.some(a => a.status === 'Out of Service') ? 'red' : 'green', '#/assets?status=Out of Service', 'power')}
      ${kpi('Certificates expired / missing', docIssues.length, 'Assets with non-compliant documents', docIssues.length ? 'red' : 'green', '#/assets?issue=docs', 'file')}
      ${kpi('Inspections overdue', inspOver.length, 'Assets with overdue inspections', inspOver.length ? 'red' : 'green', '#/assets?issue=insp', 'clipboard')}
    </div>${lv}`;
  return { title: 'Assets & equipment', crumbs: [['Assets & equipment', '#/assets']], html };
};

function assetDetail(id, q) {
  const a = byId('assets', id); if (!a) return ROUTES.notfound();
  const t = assetType(a), tab = q.tab || 'overview';
  const docs = assetDocStatus(a), sch = scheduleFor(a.id), ins = S.inspections.filter(i => i.asset === a.id).sort((x, y) => y.date.localeCompare(x.date));
  const mt = S.maintenance.filter(m => m.asset === a.id).sort((x, y) => (y.completed || y.due).localeCompare(x.completed || x.due)), dfs = S.defects.filter(d => d.asset === a.id), acts = assetActions(a);
  const openCrit = assetOpenDefects(a).filter(d => d.severity === 'Critical');
  const T = (k, l, n, cls) => [k, l, n, cls];
  const tabs = [T('overview', 'Overview'), T('documents', 'Required documents', docs.filter(d => ['Expired', 'Missing'].includes(d.status)).length || '', 'red'), T('inspections', 'Inspections', ins.length), T('maintenance', 'Maintenance', mt.length), T('defects', 'Defects', assetOpenDefects(a).length || '', 'red'), T('actions', 'Actions', acts.filter(actionOpen).length || ''), T('history', 'Asset history')];
  let body = '';
  if (tab === 'overview') body = `<div class="grid g2"><div class="card"><div class="card-head"><h2>Asset details</h2>${permBtn('inspect', `<button class="btn sm" data-act="assetEdit" data-id="${a.id}">Edit</button>`)}</div><div class="card-body"><div class="kv">
      <div>Asset ID / tag</div><div class="mono">${a.id} · ${esc(a.tag)}</div><div>Type</div><div>${esc(t.name)}</div><div>Make / model</div><div>${esc(a.make)} ${esc(a.model)}</div><div>Serial number</div><div class="mono">${esc(a.serial)}</div><div>Year</div><div>${a.year || '—'}</div>
      <div>Site / location</div><div>${esc(site(a.site).name)} · ${esc(a.location)}</div><div>Responsible person</div><div>${esc(pname(a.responsible))}</div><div>Operational status</div><div>${sbadge(a.status)}</div>
      ${Object.entries(a.custom || {}).map(([k, v]) => `<div>${esc(k)}</div><div>${esc(v)}</div>`).join('')}
    </div></div></div>
    <div class="stack"><div class="card"><div class="card-head"><h2>QR identifier</h2><a class="btn sm" href="#/qr/${a.id}">${icon('qr', 'sm')} Open mobile QR view</a></div><div class="card-body" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><div><div class="qr-box">${qrSvg(a.qr)}</div><div class="qr-caption mono">${esc(a.qr)}</div></div><p class="muted" style="flex:1;min-width:180px">Simulated QR pattern for demonstration. In production the label encodes a secure link to this asset so field users can open its status, documents and inspection form by scanning.</p></div></div>
    <div class="card"><div class="card-head"><h2>Compliance snapshot</h2></div><div class="card-body"><ul class="link-list">
      ${docs.map(d => `<li><div class="ll-main"><b>${esc(d.req.name)}</b><div>${d.cert ? (d.cert.expiry ? 'Expires ' + fmt(d.cert.expiry) : 'No expiry') : 'Not on file'}</div></div>${sbadge(d.status)}</li>`).join('')}
      ${sch.map(s => `<li><div class="ll-main"><b>${esc(byId('templates', s.template).title)}</b><div>Every ${s.freqDays} days</div></div>${dueText(s.nextDue)}</li>`).join('')}
    </ul></div></div></div></div>`;
  if (tab === 'documents') body = `<div class="alert info">${icon('info')}<div>Document requirements are configured per asset type (<b>${esc(t.name)}</b>) in Administration → Asset types. A different type (e.g. vehicle vs forklift) requires different documents.</div></div><div class="card"><div class="card-head"><h2>Required documents & certificates</h2>${permBtn('inspect', `<button class="btn sm primary" data-act="certUpload" data-id="${a.id}">${icon('upload', 'sm')} Upload certificate</button>`)}</div><div class="card-body flush"><table class="tbl stackable"><thead><tr><th>Requirement</th><th>Validity</th><th>Certificate no.</th><th>Issued</th><th>Expiry</th><th>File</th><th>Status</th><th></th></tr></thead><tbody>
    ${docs.map(d => `<tr class="${d.status === 'Expired' || d.status === 'Missing' ? 'row-red' : d.status === 'Expiring' ? 'row-amber' : ''}"><td data-label="Requirement"><b>${esc(d.req.name)}</b></td><td data-label="Validity">${d.req.months ? d.req.months + ' months' : 'No expiry'}</td><td data-label="Cert. no." class="mono">${d.cert ? esc(d.cert.number) : '—'}</td><td data-label="Issued">${d.cert ? fmt(d.cert.issued) : '—'}</td><td data-label="Expiry">${d.cert && d.cert.expiry ? dueText(d.cert.expiry) : '—'}</td><td data-label="File">${d.cert ? fileChip(d.cert.file) : '—'}</td><td data-label="Status">${sbadge(d.status)}</td><td data-label="">${permBtn('inspect', `<button class="btn sm" data-act="certUpload" data-id="${a.id}" data-req="${esc(d.req.name)}">${d.cert ? 'Renew' : 'Upload'}</button>`)}</td></tr>`).join('')}
    </tbody></table></div></div>${a.certs.filter(c => !t.reqDocs.some(r => r.name === c.type)).length ? '' : ''}`;
  if (tab === 'inspections') body = `<div class="card mb"><div class="card-head"><h2>Inspection schedule</h2></div><div class="card-body flush">${sch.length ? `<table class="tbl stackable"><thead><tr><th>Template</th><th>Frequency</th><th>Next due</th><th>Assigned</th><th></th></tr></thead><tbody>${sch.map(s => { const tp = byId('templates', s.template); const r = tp.revisions.find(x => x.status === 'Approved'); return `<tr><td data-label="Template"><b>${esc(tp.title)}</b><div class="t-sub">${esc(tp.docNumber)} Rev ${r.rev}</div></td><td data-label="Frequency">Every ${s.freqDays} days</td><td data-label="Next due">${dueText(s.nextDue)}</td><td data-label="Assigned">${esc(pname(s.assignee))}</td><td data-label="">${permBtn('inspect', `<a class="btn sm primary" href="#/inspect/${s.id}">Start inspection</a>`.replace('<a', '<button data-act="go" data-href="#/inspect/' + s.id + '"').replace('</a>', '</button>'))}</td></tr>`; }).join('')}</tbody></table>` : '<div class="empty">No schedule.</div>'}</div></div>
    <div class="card"><div class="card-head"><h2>Inspection history</h2><span class="ch-sub">Each record retains the template revision used at the time</span></div><div class="card-body flush">${inspTable(ins)}</div></div>`;
  if (tab === 'maintenance') body = `<div class="card"><div class="card-head"><h2>Maintenance</h2>${permBtn('inspect', `<button class="btn sm primary" data-act="mtNew" data-asset="${a.id}">${icon('plus', 'sm')} Schedule maintenance</button>`)}</div><div class="card-body flush">${mtTable(mt)}</div></div>`;
  if (tab === 'defects') body = `<div class="card"><div class="card-head"><h2>Defects</h2><button class="btn sm danger" data-act="defectNew" data-asset="${a.id}">${icon('alert', 'sm')} Report defect</button></div><div class="card-body flush">${defectTable(dfs)}</div></div>`;
  if (tab === 'actions') body = `<div class="card"><div class="card-body flush">${actionsMiniTable(acts)}</div></div>`;
  if (tab === 'history') {
    const ev = [];
    (a.history || []).forEach(h => ev.push({ ts: h.ts, text: h.text, by: h.by, cls: /OUT OF SERVICE|out of service/i.test(h.text) ? 't-red' : /return/i.test(h.text) ? 't-green' : '' }));
    ins.forEach(i => ev.push({ ts: i.date + 'T12:00:00', text: `Inspection ${i.id} (${i.template.docNumber} Rev ${i.template.rev}) — ${i.results.filter(r => r.result === 'Fail').length} failed item(s)`, by: i.inspector, link: '#/inspections/' + i.id, cls: i.results.some(r => r.result === 'Fail') ? 't-amber' : 't-green' }));
    mt.filter(m => m.completed).forEach(m => ev.push({ ts: m.completed + 'T12:00:00', text: `Maintenance completed: ${m.description}`, by: m.by, cls: 't-green' }));
    dfs.forEach(d => ev.push({ ts: d.reported + 'T11:00:00', text: `Defect ${d.id} reported (${d.severity}): ${d.description}`, by: d.by, cls: 't-red' }));
    a.certs.forEach(c => ev.push({ ts: (c.issued || TODAY) + 'T10:00:00', text: `Certificate on file: ${c.type} (${c.number})`, by: a.responsible, cls: 't-grey' }));
    ev.sort((x, y) => String(y.ts).localeCompare(String(x.ts)));
    body = `<div class="card"><div class="card-head"><h2>Asset history</h2><span class="ch-sub">Inspections, defects, maintenance, status changes and certificates</span></div><div class="card-body"><ul class="timeline">${ev.map(e => `<li class="${e.cls}">${e.link ? `<a href="${e.link}">${esc(e.text)}</a>` : esc(e.text)}<div class="tl-meta">${esc(pname(e.by))} · ${fmtTs(e.ts)}</div></li>`).join('')}</ul></div></div>`;
  }
  const s0 = sch.sort((x, y) => x.nextDue.localeCompare(y.nextDue))[0];
  const html = `<div class="status-hero"><div><div class="sh-id">${a.id} · ${esc(t.name)} · ${esc(sname(a.site))}</div><h1 style="margin:2px 0 6px">${esc(a.tag)} — ${esc(a.name)}</h1><div class="btn-row">${sbadge(a.status)} ${docs.some(d => ['Expired', 'Missing'].includes(d.status)) ? badge('Document non-compliance', 'red') : badge('Documents OK', 'green')} ${s0 ? `<span class="tag">Next inspection ${fmt(s0.nextDue)}</span>` : ''}</div></div>
    <div class="sh-actions">${s0 ? `<button class="btn primary" data-act="go" data-href="#/inspect/${s0.id}" ${can('inspect') ? '' : `disabled title="${esc(noPerm('inspect'))}"`}>${icon('clipboard', 'sm')} Start inspection</button>` : ''}<button class="btn danger" data-act="defectNew" data-asset="${a.id}">${icon('alert', 'sm')} Report defect</button>${a.status === 'Out of Service' ? permBtn('action.verify', `<button class="btn success" data-act="returnToService" data-id="${a.id}">${icon('power', 'sm')} Return to service</button>`) : permBtn('inspect', `<button class="btn" data-act="takeOOS" data-id="${a.id}">${icon('power', 'sm')} Remove from service</button>`)}</div></div>
  ${a.status === 'Out of Service' ? `<div class="alert danger">${icon('alert')}<div><b>OUT OF SERVICE — do not use.</b> ${openCrit.length ? `Open critical defect(s): ${openCrit.map(d => `${d.id} (${esc(d.description)})`).join('; ')}. Return to service requires the corrective action to be verified and authorised by a person with verification rights.` : 'All critical defects are closed — an authorised person may now return the asset to service.'}</div></div>` : ''}
  ${tabsHtml('#/assets/' + a.id + '?tab=', tabs, tab)}${body}`;
  return { title: a.tag, nav: 'assets', crumbs: [['Assets & equipment', '#/assets'], [a.tag, '#']], html };
}
function inspTable(ins) { return ins.length ? `<table class="tbl stackable"><thead><tr><th>Inspection</th><th>Date</th><th>Template (revision used)</th><th>Inspector</th><th>Result</th><th>Status</th></tr></thead><tbody>${ins.map(i => { const f = i.results.filter(r => r.result === 'Fail').length; return `<tr class="rowlink" data-href="#/inspections/${i.id}"><td data-label="ID" class="mono">${i.id}</td><td data-label="Date">${fmt(i.date)}</td><td data-label="Template">${esc(i.template.docNumber)} <b>Rev ${i.template.rev}</b><div class="t-sub">${esc(i.template.title)}</div></td><td data-label="Inspector">${esc(pname(i.inspector))}</td><td data-label="Result">${f ? `<span class="badge b-red">${f} failed</span>` : '<span class="badge b-green">All passed</span>'}</td><td data-label="Status">${sbadge(i.status)}</td></tr>`; }).join('')}</tbody></table>` : '<div class="empty">No inspections recorded.</div>'; }
function mtTable(mt) { return mt.length ? `<table class="tbl stackable"><thead><tr><th>ID</th><th>Asset</th><th>Type</th><th>Description</th><th>Due</th><th>Responsible</th><th>Status</th><th></th></tr></thead><tbody>${mt.map(m => { const a = byId('assets', m.asset); return `<tr class="${!m.completed && daysTo(m.due) < 0 ? 'row-red' : ''}"><td data-label="ID" class="mono">${m.id}</td><td data-label="Asset"><a href="#/assets/${a.id}?tab=maintenance">${esc(a.tag)}</a></td><td data-label="Type">${esc(m.type)}</td><td data-label="Description">${esc(m.description)}${m.notes ? `<div class="t-sub">${esc(m.notes)}</div>` : ''}${m.evidence.length ? `<div class="mt-s">${m.evidence.map(fileChip).join(' ')}</div>` : ''}</td><td data-label="Due">${dueText(m.due, !!m.completed)}</td><td data-label="Responsible">${esc(pname(m.by))}</td><td data-label="Status">${m.completed ? badge('Completed ' + fmt(m.completed), 'green') : daysTo(m.due) < 0 ? badge('Overdue', 'red') : badge('Scheduled', 'blue')}</td><td data-label="">${m.completed ? '' : permBtn('inspect', `<button class="btn sm primary" data-act="mtComplete" data-id="${m.id}">Complete</button>`)}</td></tr>`; }).join('')}</tbody></table>` : '<div class="empty">No maintenance recorded.</div>'; }
function defectTable(dfs) { return dfs.length ? `<table class="tbl stackable"><thead><tr><th>ID</th><th>Asset</th><th>Reported</th><th>Description</th><th>Severity</th><th>Out of service</th><th>Action</th><th>Status</th></tr></thead><tbody>${dfs.map(d => { const a = byId('assets', d.asset), act = d.action && byId('actions', d.action); return `<tr class="${d.status !== 'Closed' && d.severity === 'Critical' ? 'row-red' : ''}"><td data-label="ID" class="mono">${d.id}</td><td data-label="Asset"><a href="#/assets/${a.id}?tab=defects">${esc(a.tag)}</a></td><td data-label="Reported">${fmt(d.reported)}<div class="t-sub">${esc(pname(d.by))}</div></td><td data-label="Description">${esc(d.description)}${d.source ? `<div class="t-sub">From <a href="#/inspections/${d.source}">${d.source}</a></div>` : ''}</td><td data-label="Severity">${sbadge(d.severity)}</td><td data-label="OOS">${d.outOfService ? badge('Yes', 'red') : 'No'}</td><td data-label="Action">${act ? `<a href="#/actions/${act.id}">${act.id}</a> ${sbadge(act.status)}` : d.status !== 'Closed' ? permBtn('action.create', `<button class="btn sm" data-act="defectAction" data-id="${d.id}">Raise action</button>`) : '—'}</td><td data-label="Status">${sbadge(d.status)}</td></tr>`; }).join('')}</tbody></table>` : '<div class="empty">No defects recorded.</div>'; }
function actionsMiniTable(acts) { return acts.length ? `<table class="tbl stackable"><thead><tr><th>Action</th><th>Source</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead><tbody>${acts.map(a => `<tr class="rowlink" data-href="#/actions/${a.id}"><td data-label="Action"><span class="mono">${a.id}</span><div class="t-title">${esc(a.title)}</div></td><td data-label="Source">${esc(a.source)} · ${esc(a.sourceId)}</td><td data-label="Owner">${esc(pname(a.owner))}</td><td data-label="Due">${dueText(a.due, !actionOpen(a))}</td><td data-label="Status">${sbadge(a.status)}</td></tr>`).join('')}</tbody></table>` : '<div class="empty">No actions linked.</div>'; }

/* ---------- QR quick view (mobile-first) ---------- */
const QR_ACCESS = { asset: null };
ROUTES.qr = (p) => {
  const a = byId('assets', p[0]); if (!a) return ROUTES.notfound();
  const docs = assetDocStatus(a), s0 = scheduleFor(a.id).sort((x, y) => x.nextDue.localeCompare(y.nextDue))[0], dfs = assetOpenDefects(a);
  const ok = a.status !== 'Out of Service' && !docs.some(d => ['Expired', 'Missing'].includes(d.status));
  const html = `<div class="mobile-card stack">
    <div class="alert demo">${icon('qr')}<div>Opened via asset QR code <span class="mono">${esc(a.qr)}</span> (simulated scan).</div></div>
    <div class="card"><div class="card-body" style="padding-top:16px"><div class="sh-id">${esc(assetType(a).name)} · ${esc(sname(a.site))} · ${esc(a.location)}</div><h1 style="margin:4px 0 8px">${esc(a.tag)} — ${esc(a.name)}</h1>
      <div class="alert ${ok ? 'success' : 'danger'}" style="margin:0">${icon(ok ? 'checkCircle' : 'alert')}<div><b>${a.status === 'Out of Service' ? 'OUT OF SERVICE — DO NOT USE' : ok ? 'Safe to use — documents current' : 'Use restricted — document non-compliance'}</b>${dfs.length ? `<br>${dfs.length} open defect(s)` : ''}</div></div></div></div>
    ${isFieldUser() ? `<div class="big-actions">
      ${s0 ? `<button class="btn primary" data-act="go" data-href="#/inspect/${s0.id}">${icon('clipboard', 'lg')} Start inspection</button>` : `<button class="btn" disabled title="No inspection is scheduled for this asset">${icon('clipboard', 'lg')} No inspection scheduled</button>`}
      <button class="btn" data-act="go" data-href="#/report?asset=${a.id}">${icon('siren', 'lg')} Report incident</button>
    </div>` : `<div class="big-actions">
      <button class="btn primary" data-act="go" data-href="${s0 ? '#/inspect/' + s0.id : '#/assets/' + a.id}">${icon('clipboard', 'lg')} Start inspection</button>
      <button class="btn danger" data-act="defectNew" data-asset="${a.id}">${icon('alert', 'lg')} Report defect</button>
      <button class="btn" data-act="go" data-href="#/assets/${a.id}?tab=documents">${icon('file', 'lg')} Documents</button>
      <button class="btn" data-act="go" data-href="#/incidents/new?asset=${a.id}">${icon('siren', 'lg')} Report incident</button>
    </div>`}
    <div class="card"><div class="card-head"><h2>Certificates</h2></div><div class="card-body"><ul class="link-list">${docs.map(d => `<li><div class="ll-main"><b>${esc(d.req.name)}</b><div>${d.cert && d.cert.expiry ? 'Expires ' + fmt(d.cert.expiry) : d.cert ? 'No expiry' : 'Not on file'}</div></div>${sbadge(d.status)}</li>`).join('')}</ul></div></div>
    <div class="card"><div class="card-head"><h2>Next inspection</h2></div><div class="card-body">${s0 ? dueText(s0.nextDue) + ` · ${esc(byId('templates', s0.template).title)}` : 'Not scheduled'}</div></div>
    ${isFieldUser() ? '' : `<a class="btn" href="#/assets/${a.id}">Open full asset record</a>`}
  </div>`;
  QR_ACCESS.asset = a.id;   // the QR page was opened for this asset: field users may now inspect it
  return { title: 'QR · ' + a.tag, nav: isFieldUser() ? 'field' : 'assets', crumbs: [['Assets & equipment', '#/assets'], ['QR · ' + a.tag, '#']], html };
};
ACT.qrScan = () => openModal({ title: 'Scan asset QR (simulated)', sub: 'A phone camera would read the QR label. For the demo, choose an asset or type its QR code.', size: 'narrow', body: `${fld({ name: 'code', label: 'QR code / tag', placeholder: 'e.g. VDW-QR-AS-002 or FL-02' })}${fld({ name: 'pick', label: 'Or choose an asset', type: 'select', options: opts(scoped('assets').map(a => ({ value: a.id, label: `${a.tag} — ${a.name}` })), '', '— Select —') })}`,
  buttons: [{ label: 'Open asset', cls: 'primary', onClick: m => { const v = readForm(m); const code = (v.code || '').toUpperCase(); const a = v.pick ? byId('assets', v.pick) : S.assets.find(x => x.qr.toUpperCase() === code || x.tag.toUpperCase() === code || x.id === code); if (!a) { toast('No asset matches that code.', 'error'); return false; } navigate('#/qr/' + a.id); } }] });

/* ---------- Asset actions ---------- */
function assetForm(a) { return `<div class="form-grid">${fld({ name: 'tag', label: 'Asset tag', value: a ? a.tag : '', required: true })}${fld({ name: 'name', label: 'Description', value: a ? a.name : '', required: true })}${fld({ name: 'type', label: 'Asset type', type: 'select', options: opts(S.assetTypes.map(t => ({ value: t.id, label: t.name })), a ? a.type : ''), required: true, hint: 'Determines required documents and the inspection template.' })}${fld({ name: 'site', label: 'Site', type: 'select', options: siteOptions(a ? a.site : defaultSite(), false), required: true })}${fld({ name: 'location', label: 'Location', value: a ? a.location : '' })}${fld({ name: 'responsible', label: 'Responsible person', type: 'select', options: personOptions(a ? a.responsible : ''), required: true })}${fld({ name: 'make', label: 'Make', value: a ? a.make : '' })}${fld({ name: 'model', label: 'Model', value: a ? a.model : '' })}${fld({ name: 'serial', label: 'Serial number', value: a ? a.serial : '', required: true })}${fld({ name: 'year', label: 'Year', type: 'number', value: a ? a.year : '' })}</div>`; }
ACT.assetNew = () => openModal({ title: 'Add asset', size: 'wide', body: assetForm(null) + `<p class="muted mt-s">An inspection schedule is created automatically from the asset type.</p>`, buttons: [{ label: 'Add asset', cls: 'primary', onClick: m => {
  if (!validateForm(m, fail => { const t = m.querySelector('[name=tag]'); if (S.assets.some(x => x.tag.toLowerCase() === t.value.trim().toLowerCase())) fail(t, 'Tag already in use.'); })) return false;
  const v = readForm(m), id = nextId('AS-', 'assets'), t = byId('assetTypes', v.type);
  const a = { id, tag: v.tag, name: v.name, type: v.type, make: v.make, model: v.model, serial: v.serial, site: v.site, org: siteOrgOf(v.site), location: v.location, responsible: v.responsible, status: 'In Service', year: v.year, custom: {}, certs: [], qr: 'VDW-QR-' + id, history: [{ ts: nowTs(), by: S.ui.user, text: 'Asset registered' }] };
  S.assets.push(a); S.schedules.push({ id: nextId('ISCH-', 'schedules', 2), template: t.template, asset: id, site: v.site, target: v.tag, freqDays: t.inspDays, nextDue: TODAY, assignee: v.responsible });
  log(`Registered asset ${v.tag}`, '#/assets/' + id); save(); toast(`${esc(v.tag)} added — ${t.reqDocs.length} required document(s) to upload.`); navigate('#/assets/' + id + '?tab=documents');
} }] });
ACT.assetEdit = (el) => { const a = byId('assets', el.dataset.id); openModal({ title: 'Edit asset', sub: a.tag, size: 'wide', body: assetForm(a), buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; Object.assign(a, readForm(m)); assetHistory(a, 'Asset details edited'); save(); toast('Saved.'); rerender(); } }] }); };
ACT.certUpload = (el) => { const a = byId('assets', el.dataset.id), t = assetType(a); openModal({ title: 'Upload certificate / required document', sub: `${esc(a.tag)} — ${esc(t.name)}`, body: `<div class="form-grid">${fld({ name: 'type', label: 'Requirement', type: 'select', options: opts(t.reqDocs.map(r => r.name), el.dataset.req || ''), required: true, full: true })}${fld({ name: 'number', label: 'Certificate / reference no.', required: true })}${fld({ name: 'issued', label: 'Issue date', type: 'date', value: TODAY, required: true })}${fld({ name: 'expiry', label: 'Expiry date', type: 'date', hint: 'Defaults from the requirement validity.' })}${fld({ name: 'file', label: 'Certificate file', type: 'file', required: true, full: true })}</div>`,
  onOpen: m => { const up = () => { const r = t.reqDocs.find(x => x.name === m.querySelector('[name=type]').value); m.querySelector('[name=expiry]').value = r && r.months ? addMonths(m.querySelector('[name=issued]').value || TODAY, r.months) : ''; }; m.querySelector('[name=type]').addEventListener('change', up); m.querySelector('[name=issued]').addEventListener('change', up); up(); },
  buttons: [{ label: 'Save certificate', cls: 'primary', onClick: m => { if (!validateForm(m, fail => { const e = m.querySelector('[name=expiry]'); if (e.value && e.value < TODAY) fail(e, 'This certificate is already expired.'); })) return false; const v = readForm(m); a.certs.push({ type: v.type, number: v.number, issued: v.issued, expiry: v.expiry || null, file: v.file }); assetHistory(a, `Certificate uploaded: ${v.type} (${v.number}), valid to ${fmt(v.expiry)}`); log(`${a.tag}: ${v.type} uploaded`, '#/assets/' + a.id + '?tab=documents'); save(); toast('Certificate recorded. Previous certificate retained in history.'); rerender(); } }] }); };
ACT.defectNew = (el) => {
  const pre = el.dataset.asset;
  openModal({ title: 'Report defect', sub: 'Critical defects remove the asset from service until the corrective action is verified.', body: `<div class="form-grid">${fld({ name: 'asset', label: 'Asset', type: 'select', options: opts(scoped('assets').map(a => ({ value: a.id, label: `${a.tag} — ${a.name}` })), pre || '', '— Select —'), required: true, full: true })}${fld({ name: 'description', label: 'Defect description', type: 'textarea', required: true, full: true })}${fld({ name: 'severity', label: 'Severity', type: 'select', options: opts(['Critical', 'Major', 'Minor'], 'Major'), required: true })}${fld({ name: 'photo', label: 'Photo (optional)', type: 'file', accept: 'image/*', capture: true })}${fld({ name: 'oos', label: 'Remove asset from service immediately', type: 'checkbox', full: true })}${fld({ name: 'raise', label: 'Raise corrective action', type: 'checkbox', value: true, full: true })}${fld({ name: 'owner', label: 'Action owner', type: 'select', options: personOptions('', canOwnActions) })}${fld({ name: 'due', label: 'Action due', type: 'date', value: addDays(TODAY, 14) })}</div>`,
    onOpen: m => { const sev = m.querySelector('[name=severity]'); const sync = () => { if (sev.value === 'Critical') { m.querySelector('[name=oos]').checked = true; m.querySelector('[name=due]').value = addDays(TODAY, 3); } }; sev.addEventListener('change', sync); const asel = m.querySelector('[name=asset]'); const setOwner = () => { const a = byId('assets', asel.value); if (a) m.querySelector('[name=owner]').value = a.responsible; }; asel.addEventListener('change', setOwner); setOwner(); },
    buttons: [{ label: 'Report defect', cls: 'danger solid', onClick: m => {
      if (!validateForm(m, fail => { if (m.querySelector('[name=raise]').checked && !m.querySelector('[name=owner]').value) fail(m.querySelector('[name=owner]'), 'Select an action owner.'); })) return false;
      const v = readForm(m), a = byId('assets', v.asset); const d = createDefect(a, v.description, v.severity, v.oos, null);
      if (v.raise) { const act = createAction({ source: 'Asset Defect', sourceId: d.id, title: `${a.tag}: ${v.description}`, action: `Repair defect and confirm safe for use. ${v.oos ? 'Asset may only return to service after verification.' : ''}`, owner: v.owner, due: v.due, priority: v.severity === 'Critical' ? 'Critical' : v.severity === 'Major' ? 'High' : 'Medium', site: a.site }); d.action = act.id; d.status = 'Action Raised'; }
      save(); toast(`${d.id} reported${v.oos ? ` — <b>${esc(a.tag)} is OUT OF SERVICE</b>` : ''}.`); navigate('#/assets/' + a.id + '?tab=defects');
    } }] });
};
function createDefect(a, description, severity, oos, sourceInspection) {
  const id = nextId('DF-', 'defects', 3, 300);
  const d = { id, asset: a.id, reported: TODAY, by: S.ui.user, description, severity, status: 'Open', outOfService: !!oos, action: null, source: sourceInspection };
  S.defects.push(d); assetHistory(a, `Defect ${id} reported (${severity}): ${description}`);
  if (oos && a.status !== 'Out of Service') { a.status = 'Out of Service'; assetHistory(a, `Asset placed OUT OF SERVICE due to ${severity.toLowerCase()} defect ${id}`); addEvent('red', 'assets', `${a.tag} placed out of service`, `${severity} defect ${id}: ${description}`, '#/assets/' + a.id + '?tab=defects', a.site); }
  log(`Defect ${id} on ${a.tag}${oos ? ' — out of service' : ''}`, '#/assets/' + a.id + '?tab=defects');
  return d;
}
ACT.defectAction = (el) => { const d = byId('defects', el.dataset.id), a = byId('assets', d.asset); raiseActionModal({ source: 'Asset Defect', sourceId: d.id, title: `${a.tag}: ${d.description}`, owner: a.responsible, site: a.site, priority: d.severity === 'Critical' ? 'Critical' : 'High' }, act => { d.action = act.id; d.status = 'Action Raised'; save(); rerender(); }); };
ACT.takeOOS = (el) => { const a = byId('assets', el.dataset.id); openModal({ title: 'Remove from service', sub: a.tag, body: fld({ name: 'reason', label: 'Reason', type: 'textarea', required: true }), buttons: [{ label: 'Remove from service', cls: 'danger solid', onClick: m => { if (!validateForm(m)) return false; a.status = 'Out of Service'; assetHistory(a, 'Asset placed OUT OF SERVICE: ' + readForm(m).reason); log(`${a.tag} removed from service`, '#/assets/' + a.id); save(); toast(`${esc(a.tag)} is out of service.`); rerender(); } }] }); };
ACT.returnToService = (el) => {
  const a = byId('assets', el.dataset.id); const open = assetOpenDefects(a).filter(d => d.severity === 'Critical' || d.outOfService);
  if (open.length) { openModal({ title: 'Return to service blocked', size: 'narrow', body: `<div class="alert danger">${icon('lock')}<div>${esc(a.tag)} has ${open.length} open defect(s) that removed it from service: ${open.map(d => `<b>${d.id}</b>${d.action ? ` (action <a href="#/actions/${d.action}">${d.action}</a> — ${esc(byId('actions', d.action).status)})` : ''}`).join(', ')}.<br><br>The linked corrective action must be completed, evidence submitted and <b>verified</b> before the asset can return to service.</div></div>`, buttons: [] }); return; }
  openModal({ title: 'Authorise return to service', sub: a.tag, body: `<div class="form-grid">${fld({ name: 'note', label: 'Authorisation note (checks performed)', type: 'textarea', required: true, full: true })}${fld({ name: 'file', label: 'Evidence (e.g. test certificate)', type: 'file', full: true })}</div>`, buttons: [{ label: 'Return to service', cls: 'success', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); a.status = 'In Service'; assetHistory(a, `Returned to service — authorised by ${pname(S.ui.user)}: ${v.note}`); log(`${a.tag} returned to service`, '#/assets/' + a.id); save(); toast(`${esc(a.tag)} returned to service.`); rerender(); } }] });
};

/* ==========================================================================
   B. MAINTENANCE & DEFECTS
   ========================================================================== */
ROUTES.maintenance = (p) => {
  const tab = p[0] || 'planned';
  const assetsIn = scoped('assets').map(a => a.id);
  const mt = S.maintenance.filter(m => assetsIn.includes(m.asset));
  const dfs = S.defects.filter(d => assetsIn.includes(d.asset));
  const planned = mt.filter(m => !m.completed).sort((a, b) => a.due.localeCompare(b.due)), done = mt.filter(m => m.completed);
  const tabs = [['planned', 'Planned maintenance', planned.filter(m => daysTo(m.due) < 0).length || '', 'red'], ['records', 'Maintenance records', done.length], ['defects', 'Defects', dfs.filter(d => d.status !== 'Closed').length || '', 'red']];
  const body = tab === 'planned' ? `<div class="card"><div class="card-body flush">${mtTable(planned)}</div></div>` : tab === 'records' ? `<div class="card"><div class="card-body flush">${mtTable(done)}</div></div>` : `<div class="alert info">${icon('info')}<div>A <b>critical defect</b> places the asset <b>out of service</b>. It can only return to service once the corrective action has been completed, evidence submitted and verified (see e.g. <a href="#/assets/AS-009?tab=defects">CMP-02</a>).</div></div><div class="card"><div class="card-body flush">${defectTable(dfs.slice().sort((a, b) => (a.status === 'Closed') - (b.status === 'Closed')))}</div></div>`;
  const html = `${pageHead('Maintenance & defects', 'Planned maintenance, maintenance records, reported defects, responsible persons, due dates, evidence, verification and return-to-service control.', `<button class="btn danger" data-act="defectNew">${icon('alert', 'sm')} Report defect</button>${permBtn('inspect', `<button class="btn primary" data-act="mtNew">${icon('plus', 'sm')} Schedule maintenance</button>`)}`, scopePill())}
    <div class="kpis">${kpi('Maintenance overdue', planned.filter(m => daysTo(m.due) < 0).length, 'Planned work past due', 'red', '#/maintenance/planned', 'wrench')}${kpi('Due in 14 days', planned.filter(m => daysTo(m.due) >= 0 && daysTo(m.due) <= 14).length, 'Upcoming', 'amber', '#/maintenance/planned', 'clock')}${kpi('Open defects', dfs.filter(d => d.status !== 'Closed').length, `${dfs.filter(d => d.status !== 'Closed' && d.severity === 'Critical').length} critical`, 'red', '#/maintenance/defects', 'alert')}${kpi('Out of service', scoped('assets').filter(a => a.status === 'Out of Service').length, 'Awaiting verified repair', 'red', '#/assets?status=Out of Service', 'power')}</div>
    ${tabsHtml('#/maintenance', tabs, tab)}${body}`;
  return { title: 'Maintenance & defects', crumbs: [['Maintenance & defects', '#/maintenance']], html };
};
ACT.mtNew = (el) => openModal({ title: 'Schedule maintenance', body: `<div class="form-grid">${fld({ name: 'asset', label: 'Asset', type: 'select', options: opts(scoped('assets').map(a => ({ value: a.id, label: `${a.tag} — ${a.name}` })), el.dataset.asset || '', '— Select —'), required: true, full: true })}${fld({ name: 'type', label: 'Type', type: 'select', options: opts(['Planned', 'Breakdown', 'Statutory']), required: true })}${fld({ name: 'due', label: 'Due date', type: 'date', value: addDays(TODAY, 14), required: true })}${fld({ name: 'description', label: 'Work description', required: true, full: true })}${fld({ name: 'by', label: 'Responsible', type: 'select', options: personOptions(''), required: true })}</div>`,
  buttons: [{ label: 'Schedule', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); const id = nextId('MT-', 'maintenance', 3, 200); S.maintenance.push({ id, asset: v.asset, type: v.type, description: v.description, due: v.due, completed: null, by: v.by, notes: '', evidence: [] }); assetHistory(byId('assets', v.asset), `Maintenance ${id} scheduled: ${v.description}`); save(); toast(`${id} scheduled.`); rerender(); } }] });
ACT.mtComplete = (el) => { const mt = byId('maintenance', el.dataset.id), a = byId('assets', mt.asset); openModal({ title: 'Complete maintenance', sub: `${mt.id} · ${esc(a.tag)} — ${esc(mt.description)}`, body: `<div class="form-grid">${fld({ name: 'date', label: 'Completion date', type: 'date', value: TODAY, required: true })}${fld({ name: 'file', label: 'Job card / evidence', type: 'file', required: true })}${fld({ name: 'notes', label: 'Work done / findings', type: 'textarea', required: true, full: true })}${fld({ name: 'defect', label: 'A defect was found that needs follow-up', type: 'checkbox', full: true })}${fld({ name: 'next', label: 'Schedule next planned maintenance on', type: 'date', value: addMonths(TODAY, 6) })}</div>`,
  buttons: [{ label: 'Complete', cls: 'success', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); mt.completed = v.date; mt.notes = v.notes; mt.evidence.push(v.file); assetHistory(a, `Maintenance ${mt.id} completed: ${mt.description}`);
    if (v.next) S.maintenance.push({ id: nextId('MT-', 'maintenance', 3, 200), asset: a.id, type: 'Planned', description: mt.description, due: v.next, completed: null, by: mt.by, notes: '', evidence: [] });
    log(`Completed maintenance ${mt.id} on ${a.tag}`, '#/assets/' + a.id + '?tab=maintenance'); save(); toast(`Maintenance completed${v.next ? '; next scheduled ' + fmt(v.next) : ''}.`); rerender(); if (v.defect) setTimeout(() => ACT.defectNew({ dataset: { asset: a.id } }), 50); } }] }); };

/* ---------- Field home for field-only users (e.g. Employee) ---------- */
ROUTES.field = (p, q) => {
  const mine = S.schedules.filter(s => inSite(s, S.ui.site) && s.assignee === S.ui.user && s.asset).sort((a, b) => a.nextDue.localeCompare(b.nextDue));
  const reported = S.incidents.filter(i => i.reporter === S.ui.user).sort((a, b) => b.date.localeCompare(a.date));
  const html = `<div class="mobile-card">
    ${q.blocked ? `<div class="alert info">${icon('lock')}<div>That page is not available for your role. Field users can inspect assets by scanning their QR code and report incidents.</div></div>` : ''}
    ${pageHead('Hello, ' + esc(me().name.split(' ')[0]), 'Scan the QR code on an asset to inspect it, or report an incident.')}
    <div class="big-actions">
      <button class="btn primary" data-act="qrScan">${icon('qr', 'lg')} Scan asset QR code</button>
      <button class="btn accent" data-act="go" data-href="#/report">${icon('siren', 'lg')} Report incident</button>
    </div>
    <div class="card"><div class="card-head"><h2>My inspections</h2><span class="ch-sub">Scan the asset's QR code to start</span></div><div class="card-body">${mine.length ? `<ul class="link-list">${mine.map(s => { const a = byId('assets', s.asset); return `<li><div class="ll-main"><b>${esc(a.tag)} — ${esc(a.name)}</b><div>${esc(byId('templates', s.template).title)} · ${esc(a.location)}</div></div>${dueText(s.nextDue)}</li>`; }).join('')}</ul>` : '<p class="muted">No inspections are assigned to you.</p>'}</div></div>
    <div class="card"><div class="card-head"><h2>Incidents I reported</h2></div><div class="card-body">${reported.length ? `<ul class="link-list">${reported.map(i => `<li><div class="ll-main"><b>${esc(i.title)}</b><div>${esc(i.id)} · ${fmt(i.date)} · ${esc(i.type)}</div></div>${sbadge(i.status)}</li>`).join('')}</ul>` : '<p class="muted">You have not reported any incidents.</p>'}</div></div>
  </div>`;
  return { title: 'Home', nav: 'field', crumbs: [['Home', '#/field']], html };
};
