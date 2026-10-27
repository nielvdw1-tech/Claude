/* ==========================================================================
   Module 2 — Document Control
   Draft → Submitted for Review → Under Review → Approved → Issued for Use
   (+ Returned for Correction, Resubmitted, Rejected, Obsolete, Archived)
   Revisions are never overwritten: each draft iteration and each issued
   revision is retained in the revision history.
   ========================================================================== */
'use strict';

const DOC_PREFIX = { 'Policy': 'POL', 'Procedure': 'PRO', 'Safe Work Procedure': 'SWP', 'Risk Assessment': 'RA', 'Method Statement': 'MS', 'Emergency Plan': 'EP', 'Environmental': 'ENV', 'Quality': 'QMS', 'Form / Template': 'FRM', 'Manual / Work Instruction': 'MAN', 'Register': 'REG', 'Legal Appointment': 'APP', 'Training Material': 'TRN', 'Safety Data Sheet': 'SDS', 'Certificate': 'CERT', 'Audit / Inspection Report': 'AUD', 'Equipment Manual': 'EQM', 'Other Controlled Record': 'REC' };
const DOC_PENDING = ['Submitted for Review', 'Under Review', 'Resubmitted', 'Approved'];
function revLabel(r) { return r ? `Rev ${r.rev}${r.draft ? ` (draft ${r.draft})` : ''}` : '—'; }
function suggestDocNumber(cat) {
  const pre = (orgOf(S.ui.org).id === 'ORG-2' ? 'RPV-' : 'KIE-') + (DOC_PREFIX[cat] || 'DOC') + '-';
  let max = 0; S.documents.forEach(d => { if (d.number.startsWith(pre)) { const m = d.number.slice(pre.length).match(/^(\d+)/); if (m) max = Math.max(max, Number(m[1])); } });
  return pre + String(max + 1).padStart(3, '0');
}
function docRelated(d) {
  const rel = [];
  S.legal.filter(l => l.docs.includes(d.id)).forEach(l => rel.push(['Legal requirement', l.id, l.reference, '#/legal/' + l.id, l.status]));
  S.risks.filter(r => r.docs.includes(d.id)).forEach(r => rel.push(['Risk assessment', r.id, r.activity, '#/risks/' + r.id, r.approval]));
  S.courses.filter(c => c.doc === d.id).forEach(c => rel.push(['Training course', c.id, c.name, '#/people/training?course=' + c.id, '']));
  S.chemicals.filter(c => c.sds === d.id).forEach(c => rel.push(['Chemical (SDS)', c.id, c.name, '#/chemicals/' + c.id, '']));
  Object.entries(S.emergency.plans).filter(([, v]) => v === d.id).forEach(([k]) => rel.push(['Emergency plan', k, sname(k), '#/emergency/plans', '']));
  S.incidents.filter(i => i.links.docs.includes(d.id)).forEach(i => rel.push(['Incident', i.id, i.title, '#/incidents/' + i.id, i.status]));
  S.actions.filter(a => a.source === 'Document Review' && a.sourceId === d.id).forEach(a => rel.push(['Corrective action', a.id, a.title, '#/actions/' + a.id, a.status]));
  S.templates.filter(t => t.procedure === d.id).forEach(t => rel.push(['Inspection checklist', t.docNumber, t.title, '#/audits/templates', '']));
  S.audits.filter(a => a.report === d.id).forEach(a => rel.push(['Audit', a.id, a.title, '#/audits/' + a.id, a.status]));
  (d.related || []).forEach(x => rel.push(x));
  return rel;
}

ROUTES.documents = (p, q) => {
  if (p[0]) return docDetail(p[0]);
  const docs = scoped('documents');
  const active = docs.filter(docActive);
  const pending = docs.filter(d => DOC_PENDING.includes(docStatus(d)));
  const due = active.filter(d => docIssued(d) && d.nextReview && daysTo(d.nextReview) <= S.config.notify.docReviewLead && daysTo(d.nextReview) >= 0);
  const over = active.filter(docReviewOverdue);
  const initial = { status: q.status || '', review: q.review || '', category: q.category || '' };
  const lv = listView('docs', {
    rows: docs, initial, resetState: !!(q.status || q.review || q.category), placeholder: 'Search number, title, owner…',
    search: d => d.number + ' ' + d.title + ' ' + pname(d.owner) + ' ' + d.category + ' ' + d.dept,
    href: d => '#/documents/' + d.id,
    rowClass: d => docReviewOverdue(d) ? 'row-red' : '',
    filters: [
      { id: 'category', label: 'All categories', options: S.config.docCategories, test: (d, v) => d.category === v },
      { id: 'status', label: 'All statuses', options: [{ value: 'pending', label: 'Awaiting review / approval / issue' }, 'Draft', 'Submitted for Review', 'Under Review', 'Returned for Correction', 'Resubmitted', 'Approved', 'Issued for Use', 'Rejected', 'Obsolete', 'Archived'], test: (d, v) => v === 'pending' ? DOC_PENDING.includes(docStatus(d)) : (docStatus(d) === v || (v === 'Issued for Use' && !!docIssued(d) && docActive(d))) },
      { id: 'review', label: 'Any review date', options: [{ value: 'overdue', label: 'Review overdue' }, { value: 'due', label: 'Review due ≤ 30 days (incl. overdue)' }], test: (d, v) => v === 'overdue' ? docReviewOverdue(d) : (docActive(d) && docIssued(d) && d.nextReview && daysTo(d.nextReview) <= S.config.notify.docReviewLead) },
      { id: 'site', label: 'All sites', options: [{ value: 'ALL', label: 'Organisation-wide' }].concat(orgSites().map(s => ({ value: s.id, label: s.short }))), test: (d, v) => d.site === v },
      { id: 'access', label: 'Any access class', options: ['Public', 'Internal', 'Confidential', 'Restricted'], test: (d, v) => d.access === v }
    ],
    columns: [
      { label: 'Document', render: d => `<div class="t-title">${esc(d.number)}</div><div class="t-sub">${esc(d.title)}</div>` },
      { label: 'Category', render: d => `${esc(d.category)}<div class="t-sub">${esc(d.type)}</div>` },
      { label: 'Site', render: d => esc(sname(d.site)) },
      { label: 'Owner', render: d => esc(pname(d.owner)) },
      { label: 'Current issued', render: d => { const i = docIssued(d); return i ? `${revLabel(i)}<div class="t-sub">${fmt(i.effective || i.date)}</div>` : '<span class="muted">Not issued</span>'; } },
      { label: 'Latest status', render: d => { const l = docLatest(d); return sbadge(l.status) + (l.status !== 'Issued for Use' && docIssued(d) && docActive(d) ? `<div class="t-sub">${revLabel(l)} in progress</div>` : ''); } },
      { label: 'Next review', render: d => docActive(d) && docIssued(d) ? dueText(d.nextReview) : '<span class="muted">—</span>' }
    ]
  });
  const html = `${pageHead('Document control', 'Central controlled-document library: policies, procedures, SWPs, risk assessments, plans, forms, registers, appointments, SDSs, certificates, reports and manuals — with review, approval, issue and revision control.', permBtn('doc.create', `<button class="btn primary" data-act="newDoc">${icon('upload', 'sm')} New / upload document</button>`), scopePill())}
    <div class="kpis">
      ${kpi('Active documents', active.length, `${docs.filter(d => !docActive(d)).length} obsolete / archived`, 'blue', '#/documents', 'docs')}
      ${kpi('Awaiting review / approval', pending.length, 'Submitted, under review, resubmitted or approved', pending.length ? 'blue' : 'green', '#/documents?status=pending', 'clock')}
      ${kpi('Returned for correction', docs.filter(d => docStatus(d) === 'Returned for Correction').length, 'Author must revise and resubmit', 'amber', '#/documents?status=Returned for Correction', 'refresh')}
      ${kpi('Review due ≤ 30 days', due.length, 'Upcoming periodic reviews', due.length ? 'amber' : 'green', '#/documents?review=due', 'clock')}
      ${kpi('Review overdue', over.length, 'Issued documents past review date', over.length ? 'red' : 'green', '#/documents?review=overdue', 'alert')}
    </div>
    ${lv}`;
  return { title: 'Document control', crumbs: [['Document control', '#/documents']], html };
};

function docStepper(r) {
  const flow = ['Draft', 'Submitted for Review', 'Under Review', 'Approved', 'Issued for Use'];
  let idx = flow.indexOf(r.status); let warn = null;
  if (r.status === 'Resubmitted') idx = 1;
  if (r.status === 'Returned for Correction') { idx = 2; warn = 'Returned for correction'; }
  if (r.status === 'Rejected') { idx = 2; warn = 'Rejected'; }
  if (['Superseded', 'Obsolete', 'Archived'].includes(r.status)) idx = 5;
  return `<div class="stepper">${flow.map((s, i) => { const cls = warn && i === idx ? 'warn' : i < idx || (i === idx && s === 'Issued for Use') || idx === 5 ? 'done' : i === idx ? 'current' : ''; return `<div class="step ${cls}"><span class="sd">${cls === 'done' ? '✓' : i + 1}</span><span class="sl">${warn && i === idx ? warn : s === 'Submitted for Review' && r.status === 'Resubmitted' ? 'Resubmitted' : s}</span></div>`; }).join('')}</div>`;
}

function docDetail(id) {
  const d = byId('documents', id);
  if (!d) return ROUTES.notfound();
  const latest = docLatest(d), issued = docIssued(d);
  const st = latest.status;
  const B = [];
  const btn = (perm, act, label, cls = '') => B.push(permBtn(perm, `<button class="btn ${cls}" data-act="${act}" data-id="${d.id}">${label}</button>`));
  if (st === 'Draft') { btn('doc.create', 'docEdit', 'Edit details'); btn('doc.create', 'docReplaceDraft', icon('upload', 'sm') + ' Replace draft file'); btn('doc.create', 'docSubmit', 'Submit for review', 'primary'); }
  if (st === 'Submitted for Review' || st === 'Resubmitted') btn('doc.review', 'docStartReview', 'Start review', 'primary');
  if (st === 'Under Review') { btn('doc.review', 'docReturn', 'Return for correction'); btn('doc.approve', 'docReject', 'Reject', 'danger'); btn('doc.approve', 'docApprove', icon('check', 'sm') + ' Approve', 'success'); }
  if (st === 'Returned for Correction') btn('doc.create', 'docResubmit', icon('upload', 'sm') + ' Revise & resubmit', 'primary');
  if (st === 'Rejected') { btn('doc.create', 'docNewRevision', 'Start new draft'); btn('doc.approve', 'docArchive', 'Archive'); }
  if (st === 'Approved') btn('doc.issue', 'docIssue', icon('checkCircle', 'sm') + ' Issue for use', 'success');
  if (st === 'Issued for Use') { btn('doc.create', 'docReviewed', 'Record periodic review'); btn('doc.create', 'docNewRevision', 'Start new revision', 'primary'); btn('doc.approve', 'docObsolete', 'Make obsolete', 'danger'); }
  if (st === 'Obsolete') btn('doc.approve', 'docArchive', 'Archive');
  const rel = docRelated(d);
  const allHist = [];
  d.revisions.forEach(r => (r.history || []).forEach(h => allHist.push(Object.assign({ rev: revLabel(r) }, h))));
  allHist.sort((a, b) => String(b.ts).localeCompare(String(a.ts)));
  const html = `
  <div class="status-hero">
    <div><div class="sh-id">${esc(d.number)} · ${esc(d.category)}</div><h1 style="margin:2px 0 6px">${esc(d.title)}</h1>
      <div class="btn-row">${sbadge(st)} <span class="tag">${revLabel(latest)}</span> ${issued && issued !== latest ? `<span class="badge b-green plain">Current issued: ${revLabel(issued)}</span>` : ''} ${badge(d.access, d.access === 'Confidential' || d.access === 'Restricted' ? 'orange' : 'grey', true)} ${docReviewOverdue(d) ? badge('Review overdue', 'red') : ''}</div></div>
    <div class="sh-actions">${B.join('')}</div>
  </div>
  ${issued && issued !== latest && docActive(d) ? `<div class="alert info">${icon('info')}<div><b>${revLabel(issued)} remains the controlled version in use</b> until ${revLabel(latest)} is approved and issued. Previous revisions are retained below and are never overwritten.</div></div>` : ''}
  ${st === 'Returned for Correction' || st === 'Rejected' ? `<div class="alert warn">${icon('alert')}<div><b>${st}:</b> ${esc((latest.history.slice().reverse().find(h => /Returned|Rejected/.test(h.action)) || {}).comment || '')}</div></div>` : ''}
  <div class="detail">
    <div class="stack">
      <div class="card"><div class="card-head"><h2>Workflow — ${revLabel(latest)}</h2>${latest.reviewer ? `<span class="ch-sub">Reviewer: ${esc(pname(latest.reviewer))} · Approver: ${esc(pname(latest.approver))}</span>` : ''}</div><div class="card-body">${docStepper(latest)}</div></div>
      <div class="card"><div class="card-head"><h2>Document details</h2>${permBtn('doc.create', `<button class="btn sm" data-act="docEdit" data-id="${d.id}">Edit</button>`)}</div><div class="card-body"><div class="kv">
        <div>Document number</div><div class="mono">${esc(d.number)}</div>
        <div>Title</div><div>${esc(d.title)}</div>
        <div>Category / type</div><div>${esc(d.category)} · ${esc(d.type)}</div>
        <div>Organisation</div><div>${esc(orgOf(d.org).name)}</div>
        <div>Applicable branch</div><div>${esc(d.site === 'ALL' ? 'All sites' : site(d.site).name)}</div>
        <div>Department</div><div>${esc(d.dept)}</div>
        <div>Document owner</div><div>${esc(pname(d.owner))}</div>
        <div>Current revision</div><div>${issued ? revLabel(issued) : '<span class="muted">Not yet issued</span>'}</div>
        <div>Revision date</div><div>${fmt((issued || latest).date)}</div>
        <div>Effective date</div><div>${issued ? fmt(issued.effective) : '—'}</div>
        <div>Review frequency</div><div>${d.reviewMonths ? d.reviewMonths + ' months' : 'Not subject to periodic review'}</div>
        <div>Next review date</div><div>${docActive(d) && issued ? dueText(d.nextReview) : '—'}</div>
        <div>Approval status</div><div>${sbadge(st)}</div>
        <div>Access classification</div><div>${esc(d.access)}</div>
        <div>File (${revLabel(latest)})</div><div>${fileChip(latest.file)}</div>
      </div></div></div>
      <div class="card"><div class="card-head"><h2>Revision history</h2><span class="ch-sub">All revisions and draft iterations are retained</span></div><div class="card-body flush"><div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Revision</th><th>Status</th><th>Revision date</th><th>Effective</th><th>Change summary</th><th>Author</th><th>File</th></tr></thead><tbody>
        ${d.revisions.slice().reverse().map(r => `<tr><td data-label="Revision"><b>${revLabel(r)}</b></td><td data-label="Status">${sbadge(r.status)}</td><td data-label="Rev. date">${fmt(r.date)}</td><td data-label="Effective">${fmt(r.effective)}</td><td data-label="Changes">${esc(r.notes)}</td><td data-label="Author">${esc(pname(r.author))}</td><td data-label="File">${fileChip(r.file)}</td></tr>`).join('')}
      </tbody></table></div></div></div>
      <div class="card"><div class="card-head"><h2>Review & approval trail</h2><span class="ch-sub">Decisions, comments and timestamps</span></div><div class="card-body"><ul class="timeline">
        ${allHist.map(h => `<li class="${/Approved|Issued/.test(h.action) ? 't-green' : /Returned|Rejected|obsolete/i.test(h.action) ? 't-red' : ''}"><b>${esc(h.action)}</b> <span class="tag">${esc(h.rev)}</span><div class="tl-meta">${esc(pname(h.by))} · ${fmtTs(h.ts)}</div>${h.comment ? `<div class="tl-comment">${esc(h.comment)}</div>` : ''}</li>`).join('')}
      </ul></div></div>
    </div>
    <div class="stack">
      <div class="card"><div class="card-head"><h2>Related records</h2></div><div class="card-body">${rel.length ? `<ul class="link-list">${rel.map(r => `<li><div class="ll-main"><a href="${r[3]}">${esc(r[1])}</a><div>${esc(r[0])} · ${esc(r[2])}</div></div>${r[4] ? sbadge(r[4]) : ''}</li>`).join('')}</ul>` : '<p class="muted">No linked records.</p>'}</div></div>
      <div class="card"><div class="card-head"><h2>Review reminders</h2></div><div class="card-body">
        ${d.reviewMonths && issued && docActive(d) ? `<p>Reminder sent ${S.config.notify.docReviewLead} days before review date to the document owner (${esc(pname(d.owner))}).</p><p>${dueText(d.nextReview)}</p>` : '<p class="muted">No periodic review scheduled.</p>'}
        ${permBtn('action.create', `<button class="btn sm" data-act="docRaiseAction" data-id="${d.id}">${icon('plus', 'sm')} Raise action from document review</button>`)}
      </div></div>
      <div class="alert demo">${icon('info')}<div>Files shown are <b>demo references</b>. This prototype does not upload or permanently store documents; production uses secure, versioned document storage with access control.</div></div>
    </div>
  </div>`;
  return { title: d.number, nav: 'documents', crumbs: [['Document control', '#/documents'], [d.number, '#']], html };
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
  openModal({ title: 'New controlled document', sub: 'Creates Rev 1 as a draft. Select the file from your computer (demo reference only).', size: 'wide',
    body: docForm(null) + `<div class="form-grid mt">${fld({ name: 'file', label: 'Document file', type: 'file', required: true, full: true })}${fld({ name: 'notes', label: 'Purpose / change summary', type: 'textarea', full: true, value: 'First issue.' })}
      ${fld({ name: 'reviewer', label: 'Reviewer', type: 'select', options: personOptions('P-002', p => !!p.sysRole) })}${fld({ name: 'approver', label: 'Approver', type: 'select', options: personOptions('P-002', p => ['HSEQ Manager', 'Managing Director'].includes(p.sysRole)) })}
      ${fld({ name: 'submitNow', label: 'Submit for review immediately', type: 'checkbox', full: true })}</div>`,
    onOpen: m => { m.querySelector('[name=category]').addEventListener('change', e => { m.querySelector('[name=number]').value = suggestDocNumber(e.target.value); }); },
    buttons: [{ label: 'Create document', cls: 'primary', onClick: m => {
      if (!validateForm(m, fail => { const n = m.querySelector('[name=number]'); if (S.documents.some(x => x.number.toLowerCase() === n.value.trim().toLowerCase())) fail(n, 'This document number already exists.'); })) return false;
      const v = readForm(m); const id = nextId('DOC-', 'documents');
      const rev = { rev: 1, draft: 1, status: 'Draft', date: TODAY, effective: null, file: v.file, notes: v.notes, author: S.ui.user, reviewer: v.reviewer || 'P-002', approver: v.approver || 'P-002', history: [{ ts: nowTs(), by: S.ui.user, action: 'Created draft', comment: '' }] };
      const d = { id, number: v.number, title: v.title, category: v.category, type: v.type, org: siteOrgOf(v.site), site: v.site, dept: v.dept, owner: v.owner, reviewMonths: Number(v.reviewMonths || 0), nextReview: null, access: v.access, revisions: [rev], related: [] };
      if (v.submitNow) { rev.status = 'Submitted for Review'; rev.history.push({ ts: nowTs(), by: S.ui.user, action: 'Submitted for review', comment: '' }); }
      S.documents.push(d); log(`Created ${d.number} ${d.title} (${revLabel(rev)})`, '#/documents/' + id); save();
      toast(`${esc(d.number)} created as ${rev.status.toLowerCase()}.`); navigate('#/documents/' + id);
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
function docStep(d, status, action, comment, extra) {
  const r = docLatest(d); r.status = status; r.history.push({ ts: nowTs(), by: S.ui.user, action, comment: comment || '' }); if (extra) extra(r);
  log(`${action}: ${d.number} ${revLabel(r)}`, '#/documents/' + d.id); save();
}
ACT.docReplaceDraft = (el) => {
  const d = byId('documents', el.dataset.id), r = docLatest(d);
  openModal({ title: 'Replace draft file', sub: `${d.number} ${revLabel(r)} — the replaced file name is kept in the trail.`, body: fld({ name: 'file', label: 'New draft file', type: 'file', required: true }),
    buttons: [{ label: 'Replace file', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); const old = r.file ? r.file.name : 'none'; r.file = v.file; r.history.push({ ts: nowTs(), by: S.ui.user, action: 'Draft file replaced', comment: `Previous draft file: ${old}` }); save(); toast('Draft file replaced.'); rerender(); } }] });
};
ACT.docSubmit = (el) => {
  const d = byId('documents', el.dataset.id), r = docLatest(d);
  openModal({ title: 'Submit for review', sub: `${d.number} ${revLabel(r)}`, body: `<div class="form-grid">${fld({ name: 'reviewer', label: 'Reviewer', type: 'select', options: personOptions(r.reviewer || 'P-002', p => !!p.sysRole), required: true })}${fld({ name: 'approver', label: 'Approver', type: 'select', options: personOptions(r.approver || 'P-002', p => ['HSEQ Manager', 'Managing Director'].includes(p.sysRole)), required: true })}${fld({ name: 'comment', label: 'Comment to reviewer', type: 'textarea', full: true })}</div>`,
    buttons: [{ label: 'Submit for review', cls: 'primary', onClick: m => {
      if (!r.file) { toast('Attach a file before submitting.', 'error'); return false; }
      if (!validateForm(m)) return false; const v = readForm(m);
      docStep(d, 'Submitted for Review', 'Submitted for review', v.comment, x => { x.reviewer = v.reviewer; x.approver = v.approver; });
      addEvent('blue', 'documents', `Review requested: ${d.number}`, `${pname(v.reviewer)} asked to review ${d.title} (simulated notification).`, '#/documents/' + d.id, d.site);
      toast(`Submitted to ${esc(pname(v.reviewer))} for review.`); rerender();
    } }] });
};
ACT.docStartReview = (el) => { const d = byId('documents', el.dataset.id); docStep(d, 'Under Review', 'Review started'); toast('Review started — record your decision when ready.'); rerender(); };
function decisionModal(d, title, status, action, btnCls, required, after) {
  openModal({ title, sub: `${d.number} ${revLabel(docLatest(d))}`, body: fld({ name: 'comment', label: required ? 'Reviewer comments (required)' : 'Comments', type: 'textarea', required, rows: 4 }),
    buttons: [{ label: title, cls: btnCls, onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); docStep(d, status, action, v.comment); if (after) after(); toast(`${esc(d.number)}: ${esc(action.toLowerCase())}.`); rerender(); } }] });
}
ACT.docReturn = (el) => { const d = byId('documents', el.dataset.id); decisionModal(d, 'Return for correction', 'Returned for Correction', 'Returned for correction', 'primary', true, () => addEvent('amber', 'documents', `Returned for correction: ${d.number}`, `${pname(docLatest(d).author)} to revise and resubmit.`, '#/documents/' + d.id, d.site)); };
ACT.docReject = (el) => { const d = byId('documents', el.dataset.id); decisionModal(d, 'Reject document', 'Rejected', 'Rejected', 'danger solid', true); };
ACT.docApprove = (el) => { const d = byId('documents', el.dataset.id); decisionModal(d, 'Approve', 'Approved', 'Approved', 'success', false, () => { docLatest(d).approvedBy = S.ui.user; docLatest(d).approvedOn = TODAY; }); };
ACT.docResubmit = (el) => {
  const d = byId('documents', el.dataset.id), r = docLatest(d);
  openModal({ title: 'Revise & resubmit', sub: `${d.number} — a new draft iteration (draft ${r.draft + 1}) is created. The returned draft is retained in history.`, body: `<div class="form-grid">${fld({ name: 'file', label: 'Corrected file', type: 'file', required: true, full: true })}${fld({ name: 'notes', label: 'Corrections made', type: 'textarea', required: true, full: true })}</div>`,
    buttons: [{ label: 'Resubmit for review', cls: 'primary', onClick: m => {
      if (!validateForm(m)) return false; const v = readForm(m);
      r.status = 'Superseded draft'; r.history.push({ ts: nowTs(), by: S.ui.user, action: 'Superseded by corrected draft', comment: '' });
      const nr = { rev: r.rev, draft: r.draft + 1, status: 'Resubmitted', date: TODAY, effective: null, file: v.file, notes: v.notes, author: S.ui.user, reviewer: r.reviewer, approver: r.approver, history: [{ ts: nowTs(), by: S.ui.user, action: `Revised and resubmitted (draft ${r.draft + 1})`, comment: v.notes }] };
      d.revisions.push(nr); log(`Resubmitted ${d.number} ${revLabel(nr)}`, '#/documents/' + d.id); save(); toast(`${revLabel(nr)} resubmitted for review.`); rerender();
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
      log(`Issued ${d.number} Rev ${r.rev} for use`, '#/documents/' + d.id); save(); toast(`${esc(d.number)} Rev ${r.rev} issued. Next review ${fmt(d.nextReview)}.`); rerender();
    } }] });
};
ACT.docNewRevision = (el) => {
  const d = byId('documents', el.dataset.id); const issued = docIssued(d); const n = docLatest(d).status === 'Rejected' ? docLatest(d).rev : Math.max(...d.revisions.map(r => r.rev)) + 1;
  openModal({ title: 'Start new revision', sub: `${d.number}: Rev ${n} (draft 1) will be created. ${issued ? `Rev ${issued.rev} remains in use until the new revision is issued.` : ''}`, body: `<div class="form-grid">${fld({ name: 'file', label: 'Draft file', type: 'file', required: true, full: true })}${fld({ name: 'notes', label: 'Reason for revision / change summary', type: 'textarea', required: true, full: true })}</div>`,
    buttons: [{ label: 'Create draft revision', cls: 'primary', onClick: m => {
      if (!validateForm(m)) return false; const v = readForm(m); const prev = docLatest(d);
      const nr = { rev: n, draft: prev.status === 'Rejected' && prev.rev === n ? prev.draft + 1 : 1, status: 'Draft', date: TODAY, effective: null, file: v.file, notes: v.notes, author: S.ui.user, reviewer: prev.reviewer || 'P-002', approver: prev.approver || 'P-002', history: [{ ts: nowTs(), by: S.ui.user, action: `Created draft revision ${n}`, comment: v.notes }] };
      d.revisions.push(nr); log(`Started ${d.number} ${revLabel(nr)}`, '#/documents/' + d.id); save(); toast(`${revLabel(nr)} created.`); rerender();
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
ACT.docRaiseAction = (el) => { const d = byId('documents', el.dataset.id); raiseActionModal({ source: 'Document Review', sourceId: d.id, title: `Document review: ${d.number}`, site: d.site === 'ALL' ? defaultSite() : d.site, owner: d.owner }); };
