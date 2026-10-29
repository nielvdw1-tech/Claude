/* ==========================================================================
   Document Control — upload, sequential multi-person approval, issue,
   revision control, periodic review.
   --------------------------------------------------------------------------
   Draft → In Approval (step 1 → step 2 → … in a set order) → Approved → Issued
   Any approver can Return for correction (author revises & resubmits — the
   route restarts at step 1) or Reject. Every draft iteration, route decision,
   comment and timestamp is retained; issued revisions are never overwritten.
   ========================================================================== */
'use strict';

const DOC_PREFIX = { 'Policy': 'POL', 'Procedure': 'PRO', 'Safe Work Procedure': 'SWP', 'Risk Assessment': 'RA', 'Method Statement': 'MS', 'Emergency Plan': 'EP', 'Environmental': 'ENV', 'Quality': 'QMS', 'Form / Template': 'FRM', 'Manual / Work Instruction': 'MAN', 'Register': 'REG', 'Legal Appointment': 'APP', 'Training Material': 'TRN', 'Safety Data Sheet': 'SDS', 'Certificate': 'CERT', 'Audit / Inspection Report': 'AUD', 'Equipment Manual': 'EQM', 'Other Controlled Record': 'REC' };
const DOC_PENDING = ['In Approval', 'Approved'];
function revLabel(r) { return r ? `Rev ${r.rev}${r.draft ? ` (draft ${r.draft})` : ''}` : '—'; }
function suggestDocNumber(cat) {
  const pre = (S.ui.org === 'ORG-2' ? 'RPV-' : 'KIE-') + (DOC_PREFIX[cat] || 'DOC') + '-';
  let max = 0; S.documents.forEach(d => { if (d.number.startsWith(pre)) { const m = d.number.slice(pre.length).match(/^(\d+)/); if (m) max = Math.max(max, Number(m[1])); } });
  return pre + String(max + 1).padStart(3, '0');
}
function curStep(r) { return (r && r.route || []).find(s => s.status === 'Current'); }
function routeText(r) { const c = curStep(r); return c ? `step ${c.step} of ${r.route.length} — ${c.label} (${pname(c.person)})` : ''; }
function hasPerm(p, perm) { const r = S.roles.find(x => x.name === p.sysRole); return !!(r && r.perms.includes(perm)); }
function defaultRoute(cat, author) {
  const r = JSON.parse(JSON.stringify(S.config.approvalRoutes[cat] || S.config.approvalRoutes['*'])).filter(x => x.person !== author);   // nobody approves their own document
  return r.length ? r : [{ label: 'Approval', person: '' }];
}
function docRelated(d) {
  const rel = [];
  S.templates.filter(t => t.procedure === d.id).forEach(t => rel.push(['Inspection checklist', t.docNumber, t.title, '#/inspections/templates', '']));
  S.incidents.filter(i => i.links.docs.includes(d.id)).forEach(i => rel.push(['Incident', i.id, i.title, '#/incidents/' + i.id, i.status]));
  S.actions.filter(a => a.source === 'Document Review' && a.sourceId === d.id).forEach(a => rel.push(['Corrective action', a.id, a.title, '#/actions/' + a.id, a.status]));
  (d.related || []).forEach(x => rel.push(x));
  return rel;
}

/* ---------------- Document library ---------------- */
ROUTES.documents = (p, q) => {
  if (p[0]) return docDetail(p[0]);
  const docs = scoped('documents');
  const active = docs.filter(docActive);
  const inAppr = docs.filter(d => docStatus(d) === 'In Approval');
  const mine = inAppr.filter(d => (curStep(docLatest(d)) || {}).person === S.ui.user);
  const due = active.filter(d => docIssued(d) && d.nextReview && daysTo(d.nextReview) <= S.config.notify.docReviewLead && daysTo(d.nextReview) >= 0);
  const over = active.filter(docReviewOverdue);
  const lv = listView('docs', {
    rows: docs, initial: { status: q.status || '', review: q.review || '', category: q.category || '' }, resetState: !!(q.status || q.review || q.category), placeholder: 'Search number, title, owner…',
    search: d => d.number + ' ' + d.title + ' ' + pname(d.owner) + ' ' + d.category + ' ' + d.dept,
    href: d => '#/documents/' + d.id,
    rowClass: d => docReviewOverdue(d) ? 'row-red' : (curStep(docLatest(d)) || {}).person === S.ui.user ? 'row-amber' : '',
    filters: [
      { id: 'status', label: 'All statuses', options: [{ value: 'mine', label: 'Awaiting MY approval' }, { value: 'pending', label: 'In approval or approved-not-issued' }, 'Draft', 'In Approval', 'Returned for Correction', 'Approved', 'Issued for Use', 'Rejected', 'Obsolete', 'Archived'],
        test: (d, v) => v === 'mine' ? (curStep(docLatest(d)) || {}).person === S.ui.user : v === 'pending' ? DOC_PENDING.includes(docStatus(d)) : (docStatus(d) === v || (v === 'Issued for Use' && !!docIssued(d) && docActive(d))) },
      { id: 'category', label: 'All categories', options: S.config.docCategories, test: (d, v) => d.category === v },
      { id: 'review', label: 'Any review date', options: [{ value: 'overdue', label: 'Review overdue' }, { value: 'due', label: 'Review due ≤ 30 days (incl. overdue)' }], test: (d, v) => v === 'overdue' ? docReviewOverdue(d) : (docActive(d) && docIssued(d) && d.nextReview && daysTo(d.nextReview) <= S.config.notify.docReviewLead) },
      { id: 'site', label: 'All sites', options: [{ value: 'ALL', label: 'Organisation-wide' }].concat(orgSites().map(s => ({ value: s.id, label: s.short }))), test: (d, v) => d.site === v }
    ],
    columns: [
      { label: 'Document', render: d => `<div class="t-title">${esc(d.number)}</div><div class="t-sub">${esc(d.title)}</div>` },
      { label: 'Category', render: d => esc(d.category) },
      { label: 'Site', render: d => esc(sname(d.site)) },
      { label: 'Owner', render: d => esc(pname(d.owner)) },
      { label: 'Current issued', render: d => { const i = docIssued(d); return i ? `${revLabel(i)}<div class="t-sub">${fmt(i.effective || i.date)}</div>` : '<span class="muted">Not issued</span>'; } },
      { label: 'Approval status', render: d => { const l = docLatest(d); const c = curStep(l); return sbadge(l.status) + (c ? `<div class="t-sub">Step ${c.step}/${l.route.length}: <b>${esc(pname(c.person))}</b></div>` : '') + (l.status !== 'Issued for Use' && docIssued(d) && docActive(d) ? `<div class="t-sub">${revLabel(l)} in progress</div>` : ''); } },
      { label: 'Next review', render: d => docActive(d) && docIssued(d) ? dueText(d.nextReview) : '<span class="muted">—</span>' }
    ]
  });
  const html = `${pageHead('Document Manager', 'Upload controlled documents and route them through a set sequence of approvers. Each approver signs off in turn; any approver can return the document for correction. Issued revisions are controlled and reviewed periodically.', permBtn('doc.create', `<button class="btn primary" data-act="newDoc">${icon('upload', 'sm')} Upload document</button>`), scopePill())}
    <div class="kpis">
      ${kpi('Awaiting my approval', mine.length, mine.length ? 'It is your turn on the approval route' : 'Nothing waiting for you', mine.length ? 'amber' : 'green', '#/documents?status=mine', 'user')}
      ${kpi('In approval', inAppr.length, 'Moving through approval routes', 'blue', '#/documents?status=In Approval', 'clock')}
      ${kpi('Approved — not issued', docs.filter(d => docStatus(d) === 'Approved').length, 'Ready to issue for use', 'blue', '#/documents?status=Approved', 'checkCircle')}
      ${kpi('Returned for correction', docs.filter(d => docStatus(d) === 'Returned for Correction').length, 'Author must revise and resubmit', 'amber', '#/documents?status=Returned for Correction', 'refresh')}
      ${kpi('Review due ≤ 30 days', due.length, 'Upcoming periodic reviews', due.length ? 'amber' : 'green', '#/documents?review=due', 'clock')}
      ${kpi('Review overdue', over.length, 'Issued documents past review date', over.length ? 'red' : 'green', '#/documents?review=overdue', 'alert')}
    </div>
    ${lv}`;
  return { title: 'Document Manager', crumbs: [['Document Manager', '#/documents']], html };
};

/* ---------------- Approval route display ---------------- */
function routeHtml(r) {
  if (!r.route || !r.route.length) return '<p class="muted">No approval route yet — the route is set when the document is submitted.</p>';
  const ic = { Approved: ['checkCircle', 'green'], Current: ['clock', 'blue'], Pending: ['clock', 'grey'], Returned: ['refresh', 'amber'], Rejected: ['x', 'red'], Cancelled: ['x', 'grey'] };
  return `<ol class="timeline" style="padding:0">${r.route.map(s => { const [i, c] = ic[s.status] || ic.Pending; return `<li class="t-${c === 'blue' ? '' : c}" style="list-style:none"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><b>Step ${s.step}: ${esc(s.label)}</b> — ${esc(pname(s.person))}</div><span class="badge b-${c}">${s.status === 'Current' ? 'Awaiting decision' : esc(s.status)}</span></div>${s.ts ? `<div class="tl-meta">${fmtTs(s.ts)}</div>` : ''}${s.comment ? `<div class="tl-comment">${esc(s.comment)}</div>` : ''}</li>`; }).join('')}</ol>`;
}
function docStepper(r) {
  const steps = ['Draft'].concat((r.route || []).map(s => s.label), ['Approved', 'Issued']);
  const n = (r.route || []).length; let idx = 0, warn = null;
  if (r.status === 'In Approval') idx = curStep(r).step;
  if (r.status === 'Returned for Correction' || r.status === 'Rejected') { const s = r.route.find(x => ['Returned', 'Rejected'].includes(x.status)); idx = s ? s.step : 1; warn = r.status === 'Rejected' ? 'Rejected' : 'Returned'; }
  if (r.status === 'Approved') idx = n + 1;
  if (['Issued for Use', 'Superseded', 'Obsolete', 'Archived'].includes(r.status)) idx = n + 3;
  if (r.status === 'Superseded draft') idx = -1;
  return `<div class="stepper">${steps.map((s, i) => { const cls = warn && i === idx ? 'warn' : i < idx ? 'done' : i === idx ? 'current' : ''; return `<div class="step ${cls}"><span class="sd">${cls === 'done' ? '✓' : i + 1}</span><span class="sl">${warn && i === idx ? warn + ': ' + esc(s) : esc(s)}</span></div>`; }).join('')}</div>`;
}

function docDetail(id) {
  const d = byId('documents', id);
  if (!d) return ROUTES.notfound();
  const latest = docLatest(d), issued = docIssued(d), st = latest.status, cur = curStep(latest);
  const isAuthor = latest.author === S.ui.user, isApprover = cur && cur.person === S.ui.user;
  const B = [];
  const btn = (perm, act, label, cls = '') => B.push(permBtn(perm, `<button class="btn ${cls}" data-act="${act}" data-id="${d.id}">${label}</button>`));
  if (st === 'Draft') { btn('doc.create', 'docEdit', 'Edit details'); btn('doc.create', 'docReplaceDraft', icon('upload', 'sm') + ' ' + (latest.file ? 'Replace draft file' : 'Attach file')); btn('doc.create', 'docSubmit', 'Submit for approval', 'primary'); }
  if (st === 'In Approval') {
    if (isApprover) { B.push(`<button class="btn" data-act="docReturn" data-id="${d.id}">Return for correction</button>`, `<button class="btn danger" data-act="docReject" data-id="${d.id}">Reject</button>`, `<button class="btn success" data-act="docApprove" data-id="${d.id}">${icon('check', 'sm')} Approve step ${cur.step}</button>`); }
    else B.push(`<button class="btn" data-act="docActAsApprover" data-id="${d.id}">${icon('user', 'sm')} Act as current approver</button>`);
  }
  if (st === 'Returned for Correction') btn('doc.create', 'docResubmit', icon('upload', 'sm') + ' Revise & resubmit', 'primary');
  if (st === 'Rejected') { btn('doc.create', 'docNewRevision', 'Start new draft'); btn('doc.issue', 'docArchive', 'Archive'); }
  if (st === 'Approved') btn('doc.issue', 'docIssue', icon('checkCircle', 'sm') + ' Issue for use', 'success');
  if (st === 'Issued for Use') { btn('doc.create', 'docReviewed', 'Record periodic review'); btn('doc.create', 'docNewRevision', 'Start new revision', 'primary'); btn('doc.issue', 'docObsolete', 'Make obsolete', 'danger'); }
  if (st === 'Obsolete') btn('doc.issue', 'docArchive', 'Archive');
  if (latest.file) B.unshift(`<button class="btn ${isApprover ? 'primary' : ''}" data-act="viewDocFile" data-id="${d.id}">${icon('eye', 'sm')} Open document</button>`);
  if (latest.file) B.splice(1, 0, `<button class="btn" data-act="printDocFile" data-id="${d.id}" title="Print ${esc(latest.file.name)}">${icon('print', 'sm')} Print</button>`);
  if (issued && issued !== latest && issued.file) B.unshift(`<button class="btn" data-act="viewDocFile" data-id="${d.id}" data-ri="${d.revisions.indexOf(issued)}">${icon('eye', 'sm')} Open ${revLabel(issued)} (in use)</button>`);
  const rel = docRelated(d);
  const allHist = [];
  d.revisions.forEach(r => (r.history || []).forEach(h => allHist.push(Object.assign({ rev: revLabel(r) }, h))));
  allHist.sort((a, b) => String(b.ts).localeCompare(String(a.ts)));
  const lastDecision = latest.route && latest.route.find(s => ['Returned', 'Rejected'].includes(s.status));
  const html = `
  <div class="status-hero">
    <div><div class="sh-id">${esc(d.number)} · ${esc(d.category)}</div><h1 style="margin:2px 0 6px">${esc(d.title)}</h1>
      <div class="btn-row">${sbadge(st)} <span class="tag">${revLabel(latest)}</span> ${issued && issued !== latest ? `<span class="badge b-green plain">Current issued: ${revLabel(issued)}</span>` : ''} ${badge(d.access, d.access === 'Confidential' || d.access === 'Restricted' ? 'orange' : 'grey', true)} ${docReviewOverdue(d) ? badge('Review overdue', 'red') : ''}</div></div>
    <div class="sh-actions">${B.join('')}</div>
  </div>
  ${st === 'In Approval' ? `<div class="alert ${isApprover ? 'warn' : 'info'}">${icon(isApprover ? 'user' : 'clock')}<div>${isApprover ? `<b>It is your turn to approve</b> — ${esc(routeText(latest))}. Open the document to read it, then approve, return for correction or reject.` : `Waiting for <b>${esc(pname(cur.person))}</b> — ${esc(routeText(latest))}. Approvers sign off one after another in the order shown.`}</div></div>` : ''}
  ${issued && issued !== latest && docActive(d) ? `<div class="alert info">${icon('info')}<div><b>${revLabel(issued)} remains the controlled version in use</b> until ${revLabel(latest)} completes approval and is issued. Previous revisions are retained below and never overwritten.</div></div>` : ''}
  ${(st === 'Returned for Correction' || st === 'Rejected') && lastDecision ? `<div class="alert ${st === 'Rejected' ? 'danger' : 'warn'}">${icon('alert')}<div><b>${st} by ${esc(pname(lastDecision.person))} (step ${lastDecision.step}: ${esc(lastDecision.label)}):</b> ${esc(lastDecision.comment)}${st === 'Returned for Correction' && isAuthor ? '<br>Revise the document and resubmit — the approval route restarts at step 1.' : ''}</div></div>` : ''}
  ${st === 'Draft' && !latest.file ? `<div class="alert warn">${icon('upload')}<div>No file attached yet. Attach the document file before submitting for approval.</div></div>` : ''}
  <div class="detail">
    <div class="stack">
      <div class="card"><div class="card-head"><h2>Approval route — ${revLabel(latest)}</h2><span class="ch-sub">Sequential: each approver signs off in turn</span></div><div class="card-body">${docStepper(latest)}<div class="mt">${routeHtml(latest)}</div></div></div>
      <div class="card"><div class="card-head"><h2>Document details</h2>${permBtn('doc.create', `<button class="btn sm" data-act="docEdit" data-id="${d.id}">Edit</button>`)}</div><div class="card-body"><div class="kv">
        <div>Document number</div><div class="mono">${esc(d.number)}</div>
        <div>Title</div><div>${esc(d.title)}</div>
        <div>Category / type</div><div>${esc(d.category)} · ${esc(d.type)}</div>
        <div>Organisation</div><div>${esc(orgOf(d.org).name)}</div>
        <div>Applicable branch</div><div>${esc(d.site === 'ALL' ? 'All sites' : site(d.site).name)}</div>
        <div>Department</div><div>${esc(d.dept)}</div>
        <div>Document owner</div><div>${esc(pname(d.owner))}</div>
        <div>Author (${revLabel(latest)})</div><div>${esc(pname(latest.author))}</div>
        <div>Current revision</div><div>${issued ? revLabel(issued) : '<span class="muted">Not yet issued</span>'}</div>
        <div>Effective date</div><div>${issued ? fmt(issued.effective) : '—'}</div>
        <div>Review frequency</div><div>${d.reviewMonths ? d.reviewMonths + ' months' : 'Not subject to periodic review'}</div>
        <div>Next review date</div><div>${docActive(d) && issued ? dueText(d.nextReview) : '—'}</div>
        <div>Access classification</div><div>${esc(d.access)}</div>
        <div>File (${revLabel(latest)})</div><div>${fileChip(latest.file, { doc: d.id, ri: d.revisions.length - 1 })}</div>
      </div></div></div>
      <div class="card"><div class="card-head"><h2>Revision history</h2><span class="ch-sub">All revisions and draft iterations are retained</span></div><div class="card-body flush"><div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Revision</th><th>Status</th><th>Date</th><th>Effective</th><th>Change summary</th><th>Author</th><th>Approvers</th><th>File</th></tr></thead><tbody>
        ${d.revisions.slice().reverse().map(r => `<tr><td data-label="Revision"><b>${revLabel(r)}</b></td><td data-label="Status">${sbadge(r.status)}</td><td data-label="Date">${fmt(r.date)}</td><td data-label="Effective">${fmt(r.effective)}</td><td data-label="Changes">${esc(r.notes)}</td><td data-label="Author">${esc(pname(r.author))}</td><td data-label="Approvers">${(r.route || []).map(s => `${esc(pname(s.person))} <span class="t-sub">(${esc(s.status)})</span>`).join('<br>') || '—'}</td><td data-label="File">${fileChip(r.file, { doc: d.id, ri: d.revisions.indexOf(r) })}</td></tr>`).join('')}
      </tbody></table></div></div></div>
      <div class="card"><div class="card-head"><h2>Approval trail</h2><span class="ch-sub">Every decision, comment and timestamp</span></div><div class="card-body"><ul class="timeline">
        ${allHist.map(h => `<li class="${/Approved|Issued|approved/.test(h.action) ? 't-green' : /Returned|Rejected|obsolete/i.test(h.action) ? 't-red' : ''}"><b>${esc(h.action)}</b> <span class="tag">${esc(h.rev)}</span><div class="tl-meta">${esc(pname(h.by))} · ${fmtTs(h.ts)}</div>${h.comment ? `<div class="tl-comment">${esc(h.comment)}</div>` : ''}</li>`).join('')}
      </ul></div></div>
    </div>
    <div class="stack">
      <div class="card"><div class="card-head"><h2>Related records</h2></div><div class="card-body">${rel.length ? `<ul class="link-list">${rel.map(r => `<li><div class="ll-main"><a href="${r[3]}">${esc(r[1])}</a><div>${esc(r[0])} · ${esc(r[2])}</div></div>${r[4] ? sbadge(r[4]) : ''}</li>`).join('')}</ul>` : '<p class="muted">No linked records.</p>'}</div></div>
      <div class="card"><div class="card-head"><h2>Review reminders</h2></div><div class="card-body">
        ${d.reviewMonths && issued && docActive(d) ? `<p>A reminder appears ${S.config.notify.docReviewLead} days before the review date for the document owner (${esc(pname(d.owner))}).</p><p>${dueText(d.nextReview)}</p>` : '<p class="muted">No periodic review scheduled.</p>'}
        ${permBtn('action.create', `<button class="btn sm" data-act="docRaiseAction" data-id="${d.id}">${icon('plus', 'sm')} Raise corrective action</button>`)}
      </div></div>
      <div class="alert demo">${icon('info')}<div>Files you upload are kept <b>in this browser only</b> so they can be opened here. Production keeps them in secure, versioned document storage with access control.</div></div>
    </div>
  </div>`;
  return { title: d.number, nav: 'documents', crumbs: [['Document Manager', '#/documents'], [d.number, '#']], html };
}

/* ---------------- Approval route editor (used on submit / resubmit) ---------------- */
const RE = { steps: [] };
function routeEditorHtml() { return `<div class="field full"><label>Approval route (in order)<span class="req">*</span></label><div id="routeEd"></div><div class="hint">Approvers sign off one after another, top to bottom. The author cannot approve their own document.</div></div>`; }
function drawRouteEd(m, author) {
  const box = m.querySelector('#routeEd'); if (!box) return;
  const ok = p => hasPerm(p, 'doc.approve') && p.id !== author;
  box.innerHTML = RE.steps.map((s, i) => `<div style="display:grid;grid-template-columns:28px minmax(0,1fr) minmax(0,1.4fr) auto;gap:8px;align-items:center;margin-bottom:6px">
      <b class="muted">${i + 1}.</b><input type="text" data-re="label" data-i="${i}" value="${esc(s.label)}" aria-label="Step ${i + 1} name" style="padding:7px 9px;border:1px solid var(--grey-300);border-radius:7px;font:inherit">
      <select data-re="person" data-i="${i}" aria-label="Step ${i + 1} approver" style="padding:7px 9px;border:1px solid var(--grey-300);border-radius:7px;font:inherit">${personOptions(s.person, ok)}</select>
      <div class="btn-row" style="flex-wrap:nowrap"><button type="button" class="btn sm ghost" data-re="up" data-i="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Move up">↑</button><button type="button" class="btn sm ghost" data-re="down" data-i="${i}" ${i === RE.steps.length - 1 ? 'disabled' : ''} aria-label="Move down">↓</button><button type="button" class="btn sm ghost" data-re="del" data-i="${i}" ${RE.steps.length === 1 ? 'disabled' : ''} aria-label="Remove step">${icon('x', 'sm')}</button></div></div>`).join('') +
    `<button type="button" class="btn sm" data-re="add">${icon('plus', 'sm')} Add approver</button>`;
}
function wireRouteEd(m, author) {
  drawRouteEd(m, author);
  m.querySelector('#routeEd').addEventListener('click', e => { const b = e.target.closest('[data-re]'); if (!b || b.tagName === 'INPUT' || b.tagName === 'SELECT') return; const i = +b.dataset.i;
    if (b.dataset.re === 'add') RE.steps.push({ label: 'Approval', person: '' });
    if (b.dataset.re === 'del') RE.steps.splice(i, 1);
    if (b.dataset.re === 'up' && i > 0) [RE.steps[i - 1], RE.steps[i]] = [RE.steps[i], RE.steps[i - 1]];
    if (b.dataset.re === 'down' && i < RE.steps.length - 1) [RE.steps[i + 1], RE.steps[i]] = [RE.steps[i], RE.steps[i + 1]];
    drawRouteEd(m, author); });
  m.querySelector('#routeEd').addEventListener('input', e => { const t = e.target; if (t.dataset.re === 'label') RE.steps[+t.dataset.i].label = t.value; });
  m.querySelector('#routeEd').addEventListener('change', e => { const t = e.target; if (t.dataset.re === 'person') RE.steps[+t.dataset.i].person = t.value; });
}
function routeErrors(author) {
  if (!RE.steps.length) return 'Add at least one approver.';
  if (RE.steps.some(s => !s.person)) return 'Choose an approver for every step.';
  if (RE.steps.some(s => !s.label.trim())) return 'Give every step a name.';
  if (RE.steps.some(s => s.person === author)) return 'The author cannot approve their own document.';
  if (new Set(RE.steps.map(s => s.person)).size !== RE.steps.length) return 'Each approver may appear only once on the route.';
  return '';
}
function startRoute(r) {
  r.route = RE.steps.map((s, i) => ({ step: i + 1, label: s.label.trim(), person: s.person, status: i === 0 ? 'Current' : 'Pending', ts: null, comment: '' }));
  r.status = 'In Approval';
}
function notifyCurrent(d) {
  const r = docLatest(d), c = curStep(r);
  if (c) addEvent('blue', 'documents', `Approval requested: ${d.number}`, `${pname(c.person)} — step ${c.step} of ${r.route.length} (${c.label}) for ${d.title}. Simulated notification.`, '#/documents/' + d.id, d.site);
}

/* ---------------- Document actions ---------------- */
function docForm(d) {
  const cat = d ? d.category : 'Procedure';
  return `<div class="form-grid">
    ${fld({ name: 'category', label: 'Category', type: 'select', options: opts(S.config.docCategories, cat), required: true })}
    ${fld({ name: 'number', label: 'Document number', value: d ? d.number : suggestDocNumber(cat), required: true, hint: d ? 'Changing the number keeps revision history.' : 'Suggested automatically from the category.' })}
    ${fld({ name: 'title', label: 'Title', value: d ? d.title : '', required: true, full: true })}
    ${fld({ name: 'type', label: 'Type', type: 'select', options: opts(['Controlled document', 'Controlled record', 'External document'], d ? d.type : 'Controlled document'), required: true })}
    ${fld({ name: 'site', label: 'Applicable branch', type: 'select', options: siteOptions(d ? d.site : (S.ui.site || 'ALL')), required: true })}
    ${fld({ name: 'dept', label: 'Department', type: 'select', options: opts(S.departments, d ? d.dept : 'HSEQ'), required: true })}
    ${fld({ name: 'owner', label: 'Document owner', type: 'select', options: personOptions(d ? d.owner : S.ui.user), required: true })}
    ${fld({ name: 'reviewMonths', label: 'Review frequency (months)', type: 'number', value: d ? d.reviewMonths : 24, min: 0, max: 60, hint: '0 = no periodic review (e.g. certificates, reports).' })}
    ${fld({ name: 'access', label: 'Access classification', type: 'select', options: opts(['Public', 'Internal', 'Confidential', 'Restricted'], d ? d.access : 'Internal') })}
  </div>`;
}
ACT.newDoc = () => {
  RE.steps = defaultRoute('Procedure', S.ui.user);
  openModal({ title: 'Upload document', sub: 'Creates Rev 1. Select the file from your computer (demo reference only) and the approvers who must sign it off, in order.', size: 'wide',
    body: docForm(null) + `<div class="form-grid mt">${fld({ name: 'file', label: 'Document file', type: 'file', required: true, full: true })}${fld({ name: 'notes', label: 'Purpose / change summary', type: 'textarea', full: true, value: 'First issue.' })}
      ${routeEditorHtml()}${fld({ name: 'submitNow', label: 'Submit for approval now (otherwise save as draft)', type: 'checkbox', value: true, full: true })}</div>`,
    onOpen: m => { wireRouteEd(m, S.ui.user); m.querySelector('[name=category]').addEventListener('change', e => { m.querySelector('[name=number]').value = suggestDocNumber(e.target.value); RE.steps = defaultRoute(e.target.value, S.ui.user); drawRouteEd(m, S.ui.user); }); },
    buttons: [{ label: 'Save document', cls: 'primary', onClick: m => {
      const submit = m.querySelector('[name=submitNow]').checked;
      if (!validateForm(m, fail => { const n = m.querySelector('[name=number]'); if (S.documents.some(x => x.number.toLowerCase() === n.value.trim().toLowerCase())) fail(n, 'This document number already exists.'); })) return false;
      const err = submit && routeErrors(S.ui.user); if (err) { toast(err, 'error'); return false; }
      const v = readForm(m); const id = nextId('DOC-', 'documents');
      const rev = { rev: 1, draft: 1, status: 'Draft', date: TODAY, effective: null, file: v.file, notes: v.notes, author: S.ui.user, route: [], history: [{ ts: nowTs(), by: S.ui.user, action: 'Document uploaded (draft)', comment: '' }] };
      const d = { id, number: v.number, title: v.title, category: v.category, type: v.type, org: siteOrgOf(v.site), site: v.site, dept: v.dept, owner: v.owner, reviewMonths: Number(v.reviewMonths || 0), nextReview: null, access: v.access, revisions: [rev], related: [] };
      S.documents.push(d);
      if (submit) { startRoute(rev); rev.history.push({ ts: nowTs(), by: S.ui.user, action: `Submitted for approval (${rev.route.length}-step route: ${rev.route.map(s => pname(s.person)).join(' → ')})`, comment: '' }); notifyCurrent(d); }
      log(`Uploaded ${d.number} ${d.title}${submit ? ' and submitted for approval' : ''}`, '#/documents/' + id); save();
      toast(submit ? `${esc(d.number)} submitted. Waiting for ${esc(pname(rev.route[0].person))} (step 1 of ${rev.route.length}).` : `${esc(d.number)} saved as draft.`); navigate('#/documents/' + id);
    } }]
  });
};
ACT.docEdit = (el) => {
  const d = byId('documents', el.dataset.id);
  openModal({ title: 'Edit document details', sub: d.number, size: 'wide', body: docForm(d), buttons: [{ label: 'Save changes', cls: 'primary', onClick: m => {
    if (!validateForm(m)) return false; const v = readForm(m);
    Object.assign(d, { number: v.number, title: v.title, category: v.category, type: v.type, site: v.site, org: siteOrgOf(v.site), dept: v.dept, owner: v.owner, reviewMonths: Number(v.reviewMonths || 0), access: v.access });
    docLatest(d).history.push({ ts: nowTs(), by: S.ui.user, action: 'Document details edited', comment: '' }); save(); toast('Document details saved.'); rerender();
  } }] });
};
ACT.docReplaceDraft = (el) => {
  const d = byId('documents', el.dataset.id), r = docLatest(d);
  openModal({ title: r.file ? 'Replace draft file' : 'Attach file', sub: `${d.number} ${revLabel(r)}${r.file ? ' — the replaced file name is kept in the trail.' : ''}`, body: fld({ name: 'file', label: 'Draft file', type: 'file', required: true }),
    buttons: [{ label: 'Save file', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); const old = r.file ? r.file.name : 'none'; r.file = v.file; r.history.push({ ts: nowTs(), by: S.ui.user, action: r.file && old !== 'none' ? 'Draft file replaced' : 'File attached', comment: old !== 'none' ? `Previous draft file: ${old}` : '' }); save(); toast('File saved.'); rerender(); } }] });
};
ACT.docSubmit = (el) => {
  const d = byId('documents', el.dataset.id), r = docLatest(d);
  if (!r.file) { toast('Attach the document file before submitting.', 'error'); return; }
  RE.steps = r.route && r.route.length ? r.route.map(s => ({ label: s.label, person: s.person })) : defaultRoute(d.category, r.author);
  openModal({ title: 'Submit for approval', sub: `${d.number} ${revLabel(r)} — default route for "${esc(d.category)}" loaded; adjust if needed.`, size: 'wide', body: `<div class="form-grid">${routeEditorHtml()}${fld({ name: 'comment', label: 'Comment to approvers', type: 'textarea', full: true })}</div>`,
    onOpen: m => wireRouteEd(m, r.author),
    buttons: [{ label: 'Submit for approval', cls: 'primary', onClick: m => {
      const err = routeErrors(r.author); if (err) { toast(err, 'error'); return false; }
      const v = readForm(m); startRoute(r);
      r.history.push({ ts: nowTs(), by: S.ui.user, action: `Submitted for approval (${r.route.length}-step route: ${r.route.map(s => pname(s.person)).join(' → ')})`, comment: v.comment });
      notifyCurrent(d); log(`Submitted ${d.number} ${revLabel(r)} for approval`, '#/documents/' + d.id); save();
      toast(`Submitted. Step 1: ${esc(pname(r.route[0].person))} has been notified (simulated).`); rerender();
    } }] });
};
ACT.docActAsApprover = (el) => { const c = curStep(docLatest(byId('documents', el.dataset.id))); if (c) ACT.switchUser({ dataset: { id: c.person } }); };
function stepDecision(d, decision, comment) {
  const r = docLatest(d), c = curStep(r);
  if (!c || c.person !== S.ui.user) { toast('Only the current approver can record this decision.', 'error'); return false; }
  c.ts = nowTs(); c.comment = comment || '';
  if (decision === 'Approved') {
    c.status = 'Approved'; r.history.push({ ts: nowTs(), by: S.ui.user, action: `Approved — step ${c.step}: ${c.label}`, comment });
    const next = r.route.find(s => s.step === c.step + 1);
    if (next) { next.status = 'Current'; notifyCurrent(d); log(`${d.number}: step ${c.step} approved; now with ${pname(next.person)}`, '#/documents/' + d.id); toast(`Step ${c.step} approved. Passed to ${esc(pname(next.person))} (step ${next.step} of ${r.route.length}).`); }
    else { r.status = 'Approved'; r.approvedOn = TODAY; r.history.push({ ts: nowTs(), by: S.ui.user, action: 'All approval steps complete — approved', comment: '' }); addEvent('green', 'documents', `Approved — ready to issue: ${d.number}`, `${d.title} completed its approval route.`, '#/documents/' + d.id, d.site); log(`${d.number} ${revLabel(r)} fully approved`, '#/documents/' + d.id); toast('All approvers have signed off. The document is approved and ready to issue.'); }
  } else {
    c.status = decision === 'Rejected' ? 'Rejected' : 'Returned';
    r.route.filter(s => s.status === 'Pending').forEach(s => { s.status = 'Cancelled'; });
    r.status = decision === 'Rejected' ? 'Rejected' : 'Returned for Correction';
    r.history.push({ ts: nowTs(), by: S.ui.user, action: `${decision === 'Rejected' ? 'Rejected' : 'Returned for correction'} — step ${c.step}: ${c.label}`, comment });
    addEvent('amber', 'documents', `${decision === 'Rejected' ? 'Rejected' : 'Returned for correction'}: ${d.number}`, `${pname(r.author)} to act — ${comment}`, '#/documents/' + d.id, d.site);
    log(`${d.number}: ${r.status} at step ${c.step}`, '#/documents/' + d.id); toast(`${esc(d.number)} ${r.status.toLowerCase()}. The author has been notified (simulated).`);
  }
  save(); return true;
}
function decisionModal(d, title, decision, cls, required) {
  const c = curStep(docLatest(d));
  openModal({ title, sub: `${d.number} ${revLabel(docLatest(d))} — step ${c.step}: ${esc(c.label)}`, body: fld({ name: 'comment', label: required ? 'Comments (required)' : 'Comments', type: 'textarea', required, rows: 4 }),
    buttons: [{ label: title, cls, onClick: m => { if (!validateForm(m)) return false; if (stepDecision(d, decision, readForm(m).comment) === false) return false; rerender(); } }] });
}
ACT.docApprove = (el) => decisionModal(byId('documents', el.dataset.id), 'Approve', 'Approved', 'success', false);
ACT.docReturn = (el) => decisionModal(byId('documents', el.dataset.id), 'Return for correction', 'Returned', 'primary', true);
ACT.docReject = (el) => decisionModal(byId('documents', el.dataset.id), 'Reject', 'Rejected', 'danger solid', true);
ACT.docResubmit = (el) => {
  const d = byId('documents', el.dataset.id), r = docLatest(d);
  RE.steps = r.route.map(s => ({ label: s.label, person: s.person }));
  openModal({ title: 'Revise & resubmit', sub: `${d.number} — creates draft ${r.draft + 1}. The returned draft is retained; the approval route restarts at step 1.`, size: 'wide', body: `<div class="form-grid">${fld({ name: 'file', label: 'Corrected file', type: 'file', required: true, full: true })}${fld({ name: 'notes', label: 'Corrections made', type: 'textarea', required: true, full: true })}${routeEditorHtml()}</div>`,
    onOpen: m => wireRouteEd(m, r.author),
    buttons: [{ label: 'Resubmit for approval', cls: 'primary', onClick: m => {
      if (!validateForm(m)) return false; const err = routeErrors(r.author); if (err) { toast(err, 'error'); return false; }
      const v = readForm(m);
      r.status = 'Superseded draft'; r.history.push({ ts: nowTs(), by: S.ui.user, action: 'Superseded by corrected draft', comment: '' });
      const nr = { rev: r.rev, draft: r.draft + 1, status: 'Draft', date: TODAY, effective: null, file: v.file, notes: v.notes, author: r.author, route: [], history: [{ ts: nowTs(), by: S.ui.user, action: `Revised (draft ${r.draft + 1})`, comment: v.notes }] };
      startRoute(nr); nr.history.push({ ts: nowTs(), by: S.ui.user, action: `Resubmitted for approval (${nr.route.length}-step route: ${nr.route.map(s => pname(s.person)).join(' → ')})`, comment: '' });
      d.revisions.push(nr); notifyCurrent(d); log(`Resubmitted ${d.number} ${revLabel(nr)}`, '#/documents/' + d.id); save(); toast(`${revLabel(nr)} resubmitted — back to step 1 (${esc(pname(nr.route[0].person))}).`); rerender();
    } }] });
};
ACT.docIssue = (el) => {
  const d = byId('documents', el.dataset.id), r = docLatest(d);
  openModal({ title: 'Issue for use', sub: `${d.number} ${revLabel(r)} becomes Rev ${r.rev} (controlled copy). Any previous issued revision is marked Superseded.`, body: `<div class="form-grid">${fld({ name: 'effective', label: 'Effective date', type: 'date', value: TODAY, required: true })}${fld({ name: 'comment', label: 'Issue notes / distribution', type: 'textarea', full: true })}</div>`,
    buttons: [{ label: 'Issue for use', cls: 'success', onClick: m => {
      if (!validateForm(m)) return false; const v = readForm(m);
      d.revisions.forEach(x => { if (x.status === 'Issued for Use') { x.status = 'Superseded'; x.history.push({ ts: nowTs(), by: S.ui.user, action: `Superseded by Rev ${r.rev}`, comment: '' }); } });
      r.status = 'Issued for Use'; r.effective = v.effective; r.date = TODAY; r.draft = 0; r.history.push({ ts: nowTs(), by: S.ui.user, action: 'Issued for use', comment: v.comment });
      d.nextReview = d.reviewMonths ? addMonths(v.effective, d.reviewMonths) : null;
      log(`Issued ${d.number} Rev ${r.rev} for use`, '#/documents/' + d.id); save(); toast(`${esc(d.number)} Rev ${r.rev} issued.${d.nextReview ? ' Next review ' + fmt(d.nextReview) + '.' : ''}`); rerender();
    } }] });
};
ACT.docNewRevision = (el) => {
  const d = byId('documents', el.dataset.id); const issued = docIssued(d); const prev = docLatest(d);
  const n = prev.status === 'Rejected' ? prev.rev : Math.max(...d.revisions.map(r => r.rev)) + 1;
  openModal({ title: 'Start new revision', sub: `${d.number}: Rev ${n} will be created as a draft. ${issued ? `Rev ${issued.rev} remains in use until the new revision is approved and issued.` : ''}`, body: `<div class="form-grid">${fld({ name: 'file', label: 'Draft file', type: 'file', required: true, full: true })}${fld({ name: 'notes', label: 'Reason for revision / change summary', type: 'textarea', required: true, full: true })}</div>`,
    buttons: [{ label: 'Create draft revision', cls: 'primary', onClick: m => {
      if (!validateForm(m)) return false; const v = readForm(m);
      const nr = { rev: n, draft: prev.status === 'Rejected' && prev.rev === n ? prev.draft + 1 : 1, status: 'Draft', date: TODAY, effective: null, file: v.file, notes: v.notes, author: S.ui.user, route: [], history: [{ ts: nowTs(), by: S.ui.user, action: `Created draft revision ${n}`, comment: v.notes }] };
      d.revisions.push(nr); log(`Started ${d.number} ${revLabel(nr)}`, '#/documents/' + d.id); save(); toast(`${revLabel(nr)} created — submit it for approval when ready.`); rerender();
    } }] });
};
ACT.docReviewed = (el) => {
  const d = byId('documents', el.dataset.id); const r = docIssued(d);
  openModal({ title: 'Record periodic review', sub: `${d.number} Rev ${r.rev}. Use this when the document was reviewed and remains suitable without change.`, body: `<div class="form-grid">${fld({ name: 'outcome', label: 'Outcome', type: 'select', options: opts(['No change required — remains current', 'Change required — start new revision', 'Gap identified — raise corrective action']), required: true, full: true })}${fld({ name: 'comment', label: 'Review notes', type: 'textarea', required: true, full: true })}${fld({ name: 'file', label: 'Review evidence (optional)', type: 'file', full: true })}</div>`,
    buttons: [{ label: 'Record review', cls: 'primary', onClick: m => {
      if (!validateForm(m)) return false; const v = readForm(m);
      r.history.push({ ts: nowTs(), by: S.ui.user, action: 'Periodic review: ' + v.outcome, comment: v.comment + (v.file ? ` (evidence: ${v.file.name})` : '') });
      if (v.outcome.startsWith('No change')) { d.nextReview = addMonths(TODAY, d.reviewMonths || 24); toast(`Review recorded. Next review ${fmt(d.nextReview)}.`); }
      log(`Periodic review of ${d.number}: ${v.outcome}`, '#/documents/' + d.id); save(); rerender();
      if (v.outcome.startsWith('Change')) setTimeout(() => ACT.docNewRevision(el), 50);
      if (v.outcome.startsWith('Gap')) setTimeout(() => raiseActionModal({ source: 'Document Review', sourceId: d.id, title: `Document review gap: ${d.number}`, action: v.comment, site: d.site === 'ALL' ? defaultSite() : d.site, owner: d.owner }), 50);
    } }] });
};
ACT.docObsolete = (el) => { const d = byId('documents', el.dataset.id); openModal({ title: 'Make document obsolete', sub: d.number, body: fld({ name: 'comment', label: 'Reason (required)', type: 'textarea', required: true }), buttons: [{ label: 'Make obsolete', cls: 'danger solid', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); const r = docIssued(d) || docLatest(d); r.status = 'Obsolete'; r.history.push({ ts: nowTs(), by: S.ui.user, action: 'Made obsolete', comment: v.comment }); d.nextReview = null; log(`${d.number} made obsolete`, '#/documents/' + d.id); save(); toast('Document made obsolete — withdrawn from use, retained for record.'); rerender(); } }] }); };
ACT.docArchive = (el) => { const d = byId('documents', el.dataset.id); confirmBox('Archive document', `${esc(d.number)} will be archived. Archived records remain available for audit purposes.`, 'Archive', () => { const r = docLatest(d); r.status = 'Archived'; r.history.push({ ts: nowTs(), by: S.ui.user, action: 'Archived', comment: '' }); log(`${d.number} archived`, '#/documents/' + d.id); save(); toast('Archived.'); rerender(); }); };
ACT.docRaiseAction = (el) => { const d = byId('documents', el.dataset.id); raiseActionModal({ source: 'Document Review', sourceId: d.id, title: `Document: ${d.number}`, site: d.site === 'ALL' ? defaultSite() : d.site, owner: d.owner }); };
