/* ==========================================================================
   Module 3 — Legal Compliance Control
   Module 4 — Risk Management
   ========================================================================== */
'use strict';

const LEGAL_STATUSES = ['Compliant', 'Partially Compliant', 'Non-Compliant', 'Not Assessed', 'Not Applicable', 'Awaiting Verification'];
const LEGAL_DISCLAIMER = `<div class="alert warn">${icon('alert')}<div><b>Illustrative legal data — verification required.</b> Requirements in this prototype are sample entries for demonstration. Legislation names are real South African instruments, but section/regulation references, wording and applicability must be verified by a competent person against current legislation. The system supports compliance management; it does not guarantee legal compliance.</div></div>`;
function legalActions(l) { return S.actions.filter(a => a.source === 'Legal' && a.sourceId === l.id); }

ROUTES.legal = (p, q) => {
  if (p[0]) return legalDetail(p[0]);
  const rows = scoped('legal');
  const cnt = countBy(rows, 'status');
  const lv = listView('legal', {
    rows, initial: { status: q.status || '', review: q.review || '' }, resetState: !!(q.status || q.review), placeholder: 'Search legislation, reference, requirement…',
    search: l => [l.id, l.source, l.reference, l.requirement, pname(l.responsible)].join(' '),
    href: l => '#/legal/' + l.id,
    rowClass: l => l.status === 'Non-Compliant' ? 'row-red' : l.status === 'Partially Compliant' ? 'row-amber' : '',
    filters: [
      { id: 'status', label: 'All statuses', options: [{ value: 'gaps', label: 'Gaps (non / partially compliant)' }].concat(LEGAL_STATUSES), test: (l, v) => v === 'gaps' ? ['Non-Compliant', 'Partially Compliant'].includes(l.status) : l.status === v },
      { id: 'source', label: 'All sources', options: uniq(rows.map(l => l.source)), test: (l, v) => l.source === v },
      { id: 'site', label: 'All sites', options: [{ value: 'ALL', label: 'Organisation-wide' }].concat(orgSites().map(s => ({ value: s.id, label: s.short }))), test: (l, v) => l.site === v },
      { id: 'review', label: 'Any review date', options: [{ value: 'overdue', label: 'Assessment overdue' }, { value: 'due', label: 'Due ≤ 30 days' }], test: (l, v) => l.status !== 'Not Applicable' && l.nextReview && (v === 'overdue' ? daysTo(l.nextReview) < 0 : daysTo(l.nextReview) <= 30) }
    ],
    columns: [
      { label: 'ID', render: l => `<span class="mono">${l.id}</span>` },
      { label: 'Legislation / reference', render: l => `<div class="t-title">${esc(l.reference)}</div><div class="t-sub">${esc(l.source)}</div>` },
      { label: 'Site', render: l => esc(sname(l.site)) },
      { label: 'Responsible', render: l => esc(pname(l.responsible)) },
      { label: 'Status', render: l => sbadge(l.status) },
      { label: 'Next review', render: l => l.status === 'Not Applicable' ? '<span class="muted">—</span>' : dueText(l.nextReview) },
      { label: 'Actions', render: l => { const a = legalActions(l).filter(actionOpen); return a.length ? `<span class="badge b-${a.some(actionOverdue) ? 'red' : 'blue'}">${a.length} open</span>` : '<span class="muted">—</span>'; } }
    ]
  });
  const html = `${pageHead('Legal compliance control', 'Register of applicable South African HSEQ legal and other requirements per site — with assessments, evidence, gaps and linked corrective actions.', permBtn('legal.assess', `<button class="btn primary" data-act="legalNew">${icon('plus', 'sm')} Add requirement</button>`), scopePill())}
    ${LEGAL_DISCLAIMER}
    <div class="kpis">
      ${kpi('Compliant', cnt['Compliant'] || 0, 'Evidence on file', 'green', '#/legal?status=Compliant', 'checkCircle')}
      ${kpi('Partially compliant', cnt['Partially Compliant'] || 0, 'Gaps identified', 'amber', '#/legal?status=Partially Compliant', 'alert')}
      ${kpi('Non-compliant', cnt['Non-Compliant'] || 0, 'Corrective action required', (cnt['Non-Compliant'] ? 'red' : 'green'), '#/legal?status=Non-Compliant', 'alert')}
      ${kpi('Awaiting verification', cnt['Awaiting Verification'] || 0, 'Evidence submitted', 'blue', '#/legal?status=Awaiting Verification', 'clock')}
      ${kpi('Not assessed', cnt['Not Assessed'] || 0, 'Assessment outstanding', cnt['Not Assessed'] ? 'amber' : 'green', '#/legal?status=Not Assessed', 'info')}
      ${kpi('Assessments overdue', rows.filter(l => l.status !== 'Not Applicable' && l.nextReview && daysTo(l.nextReview) < 0).length, 'Past next review date', 'red', '#/legal?review=overdue', 'clock')}
    </div>${lv}`;
  return { title: 'Legal compliance', crumbs: [['Legal compliance', '#/legal']], html };
};

function legalDetail(id) {
  const l = byId('legal', id); if (!l) return ROUTES.notfound();
  const acts = legalActions(l);
  const html = `<div class="status-hero"><div><div class="sh-id">${l.id} · ${esc(sname(l.site))}</div><h1 style="margin:2px 0 6px">${esc(l.reference)}</h1><div class="btn-row">${sbadge(l.status)} <span class="tag">${esc(l.source)}</span> <span class="demo-tag">Illustrative — verify</span></div></div>
    <div class="sh-actions">${permBtn('legal.assess', `<button class="btn" data-act="legalEvidence" data-id="${l.id}">${icon('upload', 'sm')} Record evidence</button>`)}${permBtn('action.create', `<button class="btn" data-act="legalAction" data-id="${l.id}">${icon('plus', 'sm')} Corrective action</button>`)}${permBtn('legal.assess', `<button class="btn primary" data-act="legalAssess" data-id="${l.id}">${icon('clipboard', 'sm')} Assess requirement</button>`)}</div></div>
  ${l.status === 'Awaiting Verification' ? `<div class="alert info">${icon('clock')}<div>Evidence has been submitted on a linked corrective action. The status updates to <b>Compliant</b> once a verifier accepts the evidence.</div></div>` : ''}
  <div class="detail"><div class="stack">
    <div class="card"><div class="card-head"><h2>Requirement</h2>${permBtn('legal.assess', `<button class="btn sm" data-act="legalEdit" data-id="${l.id}">Edit</button>`)}</div><div class="card-body"><div class="kv">
      <div>Legislation / source</div><div>${esc(l.source)}</div>
      <div>Reference / section</div><div>${esc(l.reference)}</div>
      <div>Requirement</div><div>${esc(l.requirement)}</div>
      <div>Applicability</div><div>${esc(l.applicability)}</div>
      <div>Organisation / site</div><div>${esc(orgOf(l.org).short)} · ${esc(l.site === 'ALL' ? 'All sites' : site(l.site).name)}</div>
      <div>Responsible person</div><div>${esc(pname(l.responsible))}</div>
      <div>Required controls</div><div>${esc(l.controls)}</div>
      <div>Required evidence</div><div>${esc(l.evidenceReq)}</div>
      <div>Assessment status</div><div>${sbadge(l.status)}</div>
      <div>Review frequency</div><div>${l.freq} months</div>
      <div>Last reviewed</div><div>${fmt(l.lastReviewed)}</div>
      <div>Next review</div><div>${l.status === 'Not Applicable' ? fmt(l.nextReview) : dueText(l.nextReview)}</div>
      ${l.gaps ? `<div>Identified gaps</div><div style="color:var(--red);font-weight:600">${esc(l.gaps)}</div>` : ''}
      ${l.status === 'Not Applicable' ? `<div>N/A justification</div><div>${esc(l.naJustification)}</div>` : ''}
    </div></div></div>
    <div class="card"><div class="card-head"><h2>Compliance evidence</h2>${permBtn('legal.assess', `<button class="btn sm" data-act="legalEvidence" data-id="${l.id}">Add evidence</button>`)}</div><div class="card-body">${l.evidence.length ? `<ul class="link-list">${l.evidence.map(e => `<li><div class="ll-main">${fileChip({ name: e.name, seeded: true })}<div>${esc(e.note || '')} · ${esc(pname(e.by))} · ${fmt(e.date)}</div></div></li>`).join('')}</ul>` : '<p class="muted">No evidence recorded yet.</p>'}</div></div>
    <div class="card"><div class="card-head"><h2>Assessment history</h2></div><div class="card-body">${l.assessments.length ? `<ul class="timeline">${l.assessments.map(a => `<li class="t-${STATUS_COLOURS[a.status] === 'green' ? 'green' : STATUS_COLOURS[a.status] === 'red' ? 'red' : STATUS_COLOURS[a.status] === 'amber' ? 'amber' : 'grey'}"><b>${esc(a.status)}</b><div class="tl-meta">${esc(pname(a.by))} · ${fmt(a.date)}</div>${a.note ? `<div class="tl-comment">${esc(a.note)}</div>` : ''}</li>`).join('')}</ul>` : '<p class="muted">Not yet assessed.</p>'}</div></div>
  </div><div class="stack">
    <div class="card"><div class="card-head"><h2>Corrective actions</h2></div><div class="card-body">${acts.length ? `<ul class="link-list">${acts.map(a => `<li><div class="ll-main"><a href="#/actions/${a.id}">${a.id}</a><div>${esc(a.title)} · ${esc(pname(a.owner))} · due ${fmt(a.due)}</div></div>${sbadge(a.status)}</li>`).join('')}</ul>` : '<p class="muted">No corrective actions.</p>'}</div></div>
    <div class="card"><div class="card-head"><h2>Linked documents</h2>${permBtn('legal.assess', `<button class="btn sm" data-act="legalLink" data-id="${l.id}" data-kind="docs">Link</button>`)}</div><div class="card-body">${l.docs.length ? `<ul class="link-list">${l.docs.map(did => { const d = byId('documents', did); return d ? `<li><div class="ll-main"><a href="#/documents/${d.id}">${esc(d.number)}</a><div>${esc(d.title)}</div></div>${sbadge(docStatus(d))}</li>` : ''; }).join('')}</ul>` : '<p class="muted">None linked.</p>'}</div></div>
    <div class="card"><div class="card-head"><h2>Linked risks</h2>${permBtn('legal.assess', `<button class="btn sm" data-act="legalLink" data-id="${l.id}" data-kind="risks">Link</button>`)}</div><div class="card-body">${l.risks.length ? `<ul class="link-list">${l.risks.map(rid => { const r = byId('risks', rid); return r ? `<li><div class="ll-main"><a href="#/risks/${r.id}">${r.id}</a><div>${esc(r.activity)}</div></div>${ratingChip(r.L2, r.S2)}</li>` : ''; }).join('')}</ul>` : '<p class="muted">None linked.</p>'}</div></div>
    ${LEGAL_DISCLAIMER}
  </div></div>`;
  return { title: l.id, nav: 'legal', crumbs: [['Legal compliance', '#/legal'], [l.id, '#']], html };
}

ACT.legalAssess = (el) => {
  const l = byId('legal', el.dataset.id); const pri = S.config.priorities;
  openModal({ title: 'Assess legal requirement', sub: `${l.id} · ${esc(l.reference)} · ${esc(sname(l.site))}`, size: 'wide',
    body: `${LEGAL_DISCLAIMER}<div class="form-grid">
      ${fld({ name: 'status', label: 'Assessment outcome', type: 'select', options: opts(LEGAL_STATUSES.filter(s => s !== 'Awaiting Verification'), l.status === 'Awaiting Verification' ? 'Partially Compliant' : l.status), required: true })}
      ${fld({ name: 'nextReview', label: 'Next review date', type: 'date', value: addMonths(TODAY, l.freq || 12), required: true })}
      ${fld({ name: 'note', label: 'Assessment findings', type: 'textarea', required: true, full: true, placeholder: 'What was checked, by whom, what was observed…' })}
      <div class="full" id="gapBox">${fld({ name: 'gaps', label: 'Identified gap(s)', type: 'textarea', value: l.gaps, full: true })}</div>
      <div class="full hidden" id="naBox">${fld({ name: 'na', label: 'Justification for Not Applicable', type: 'textarea', value: l.naJustification, full: true })}</div>
      ${fld({ name: 'evidence', label: 'Evidence file (optional)', type: 'file', full: true })}
    </div>
    <fieldset class="fieldset mt" id="actBox"><legend>Corrective action</legend>
      ${fld({ name: 'raise', label: 'Generate a corrective action in the central action register for this gap', type: 'checkbox', value: true, full: true })}
      <div class="form-grid mt-s">${fld({ name: 'aTitle', label: 'Finding', value: `${l.reference} — gap at ${sname(l.site)}`, full: true })}${fld({ name: 'aAction', label: 'Required corrective action', type: 'textarea', full: true })}
      ${fld({ name: 'aOwner', label: 'Responsible owner', type: 'select', options: personOptions(l.responsible) })}${fld({ name: 'aPriority', label: 'Priority', type: 'select', options: opts(pri.map(p => p.name), 'High') })}${fld({ name: 'aDue', label: 'Due date', type: 'date', value: addDays(TODAY, 14) })}</div>
    </fieldset>`,
    onOpen: m => {
      const sync = () => { const s = m.querySelector('[name=status]').value; const gap = ['Partially Compliant', 'Non-Compliant'].includes(s); m.querySelector('#gapBox').classList.toggle('hidden', !gap); m.querySelector('#actBox').classList.toggle('hidden', !gap); m.querySelector('#naBox').classList.toggle('hidden', s !== 'Not Applicable'); };
      m.querySelector('[name=status]').addEventListener('change', sync); sync();
      m.querySelector('[name=aPriority]').addEventListener('change', e => { m.querySelector('[name=aDue]').value = addDays(TODAY, pri.find(p => p.name === e.target.value).days); });
    },
    buttons: [{ label: 'Save assessment', cls: 'primary', onClick: m => {
      const s = m.querySelector('[name=status]').value; const gap = ['Partially Compliant', 'Non-Compliant'].includes(s);
      if (!validateForm(m, fail => {
        if (gap && !m.querySelector('[name=gaps]').value.trim()) fail(m.querySelector('[name=gaps]'), 'Describe the gap.');
        if (s === 'Not Applicable' && !m.querySelector('[name=na]').value.trim()) fail(m.querySelector('[name=na]'), 'A justification is required for Not Applicable.');
        if (gap && m.querySelector('[name=raise]').checked) { if (!m.querySelector('[name=aAction]').value.trim()) fail(m.querySelector('[name=aAction]'), 'Describe the corrective action.'); if (!m.querySelector('[name=aOwner]').value) fail(m.querySelector('[name=aOwner]'), 'Assign an owner.'); }
      })) return false;
      const v = readForm(m);
      l.status = v.status; l.lastReviewed = TODAY; l.nextReview = v.nextReview; l.gaps = gap ? v.gaps : ''; if (s === 'Not Applicable') l.naJustification = v.na;
      if (v.evidence) l.evidence.unshift({ name: v.evidence.name, date: TODAY, by: S.ui.user, note: 'Assessment evidence (local demo file)' });
      l.assessments.unshift({ date: TODAY, by: S.ui.user, status: v.status, note: v.note });
      log(`Assessed ${l.id} as ${v.status}`, '#/legal/' + l.id);
      let msg = `${l.id} assessed as <b>${esc(v.status)}</b>.`;
      if (gap && v.raise) { const a = createAction({ source: 'Legal', sourceId: l.id, title: v.aTitle, action: v.aAction, owner: v.aOwner, priority: v.aPriority, due: v.aDue, site: l.site === 'ALL' ? defaultSite() : l.site }); msg += ` Corrective action <a href="#/actions/${a.id}" style="color:#fff;text-decoration:underline">${a.id}</a> assigned to ${esc(pname(a.owner))}.`; }
      save(); toast(msg); rerender();
    } }]
  });
};
ACT.legalEvidence = (el) => { const l = byId('legal', el.dataset.id); openModal({ title: 'Record compliance evidence', sub: l.id, body: `<div class="form-grid">${fld({ name: 'file', label: 'Evidence file', type: 'file', required: true, full: true })}${fld({ name: 'note', label: 'Description', type: 'text', required: true, full: true })}</div>`, buttons: [{ label: 'Save evidence', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); l.evidence.unshift({ name: v.file.name, date: TODAY, by: S.ui.user, note: v.note }); log(`Evidence added to ${l.id}: ${v.file.name}`, '#/legal/' + l.id); save(); toast('Evidence recorded (demo file reference).'); rerender(); } }] }); };
ACT.legalAction = (el) => { const l = byId('legal', el.dataset.id); raiseActionModal({ source: 'Legal', sourceId: l.id, title: `${l.reference} — gap at ${sname(l.site)}`, action: l.gaps, owner: l.responsible, site: l.site === 'ALL' ? defaultSite() : l.site, priority: l.status === 'Non-Compliant' ? 'High' : 'Medium' }); };
ACT.legalLink = (el) => {
  const l = byId('legal', el.dataset.id), kind = el.dataset.kind;
  const list = kind === 'docs' ? scoped('documents').filter(docActive).map(d => ({ value: d.id, label: `${d.number} — ${d.title}` })) : scoped('risks').map(r => ({ value: r.id, label: `${r.id} — ${r.activity}` }));
  openModal({ title: kind === 'docs' ? 'Link document' : 'Link risk assessment', sub: l.id, body: fld({ name: 'ref', label: 'Record', type: 'select', options: opts(list, '', '— Select —'), required: true }), buttons: [{ label: 'Link', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); if (!l[kind].includes(v.ref)) l[kind].push(v.ref); if (kind === 'risks') { const r = byId('risks', v.ref); if (r && !r.legal.includes(l.id)) r.legal.push(l.id); } save(); toast('Linked.'); rerender(); } }] });
};
function legalForm(l) {
  return `<div class="form-grid">
    ${fld({ name: 'source', label: 'Legislation or other source', value: l ? l.source : '', required: true, full: true, placeholder: 'e.g. Occupational Health and Safety Act 85 of 1993' })}
    ${fld({ name: 'reference', label: 'Reference / section', value: l ? l.reference : '', required: true, full: true })}
    ${fld({ name: 'requirement', label: 'Requirement description', type: 'textarea', value: l ? l.requirement : '', required: true, full: true })}
    ${fld({ name: 'applicability', label: 'Applicability', value: l ? l.applicability : '', full: true })}
    ${fld({ name: 'site', label: 'Site', type: 'select', options: siteOptions(l ? l.site : defaultSite()), required: true })}
    ${fld({ name: 'responsible', label: 'Responsible person', type: 'select', options: personOptions(l ? l.responsible : S.ui.user), required: true })}
    ${fld({ name: 'controls', label: 'Required controls', type: 'textarea', value: l ? l.controls : '', full: true })}
    ${fld({ name: 'evidenceReq', label: 'Required evidence', type: 'textarea', value: l ? l.evidenceReq : '', full: true })}
    ${fld({ name: 'freq', label: 'Review frequency (months)', type: 'number', value: l ? l.freq : 12, min: 1, max: 60, required: true })}
    ${fld({ name: 'nextReview', label: 'Next review date', type: 'date', value: l ? l.nextReview : TODAY, required: true })}
  </div>`;
}
ACT.legalNew = () => openModal({ title: 'Add legal or other requirement', sub: 'New requirements start as Not Assessed.', size: 'wide', body: LEGAL_DISCLAIMER + legalForm(null), buttons: [{ label: 'Add requirement', cls: 'primary', onClick: m => {
  if (!validateForm(m)) return false; const v = readForm(m); const id = nextId('LR-', 'legal');
  S.legal.push({ id, org: siteOrgOf(v.site), site: v.site, source: v.source, reference: v.reference, requirement: v.requirement, applicability: v.applicability, responsible: v.responsible, controls: v.controls, evidenceReq: v.evidenceReq, status: 'Not Assessed', freq: Number(v.freq), lastReviewed: null, nextReview: v.nextReview, docs: [], risks: [], evidence: [], gaps: '', naJustification: '', assessments: [] });
  log(`Added legal requirement ${id}`, '#/legal/' + id); save(); toast(`${id} added.`); navigate('#/legal/' + id);
} }] });
ACT.legalEdit = (el) => { const l = byId('legal', el.dataset.id); openModal({ title: 'Edit requirement', sub: l.id, size: 'wide', body: legalForm(l), buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); Object.assign(l, v, { freq: Number(v.freq), org: siteOrgOf(v.site) }); save(); toast('Saved.'); rerender(); } }] }); };

/* ==========================================================================
   RISK MANAGEMENT
   ========================================================================== */
function riskMatrixHtml(rows, mode, clickable) {
  const M = S.config.riskMatrix, n = M.size;
  let h = `<div class="matrix" style="grid-template-columns: 92px repeat(${n}, minmax(0,1fr))">`;
  for (let L = n; L >= 1; L--) {
    h += `<div class="mx-axis">${L}. ${esc(M.likelihood[L - 1])}</div>`;
    for (let Sv = 1; Sv <= n; Sv++) {
      const sc = L * Sv, b = riskBand(sc);
      const c = rows ? rows.filter(r => (mode === 'initial' ? r.L1 === L && r.S1 === Sv : r.L2 === L && r.S2 === Sv)).length : 0;
      h += `<div class="mx-cell r-${b.cls} ${clickable && c ? 'clickable' : ''}" ${clickable && c ? `data-act="riskCell" data-l="${L}" data-s="${Sv}" data-mode="${mode}"` : ''} title="L${L} × S${Sv} = ${sc} (${b.name})"><span class="mx-n">${sc}</span>${c ? `<span class="mx-c">${c}</span>` : ''}</div>`;
    }
  }
  h += `<div></div>${Array.from({ length: n }, (_, i) => `<div class="mx-axis">${i + 1}. ${esc(M.severity[i])}</div>`).join('')}</div>`;
  h += `<div class="legend"><span><b>Likelihood</b> (rows) × <b>Severity</b> (columns)</span>${M.bands.map(b => `<span><i class="r-${b.cls}"></i>${b.name} ≤ ${b.max}</span>`).join('')}</div>`;
  return h;
}
const RISK_UI = { mode: 'residual', cell: null };
ROUTES.risks = (p, q) => {
  if (p[0]) return riskDetail(p[0]);
  const rows = scoped('risks');
  const highInit = rows.filter(r => ['High', 'Critical'].includes(riskBand(r.L1 * r.S1).name));
  const open = rows.reduce((s, r) => s + r.controls.filter(c => c.status !== 'Implemented').length, 0);
  const lv = listView('risks', {
    rows, initial: { band: q.band || '', approval: q.approval || '' }, resetState: !!(q.band || q.approval), placeholder: 'Search activity, hazard, consequence…',
    search: r => [r.id, r.activity, r.hazard, r.consequence, pname(r.responsible)].join(' '),
    href: r => '#/risks/' + r.id,
    rowClass: r => riskBand(r.L2 * r.S2).name === 'Critical' ? 'row-red' : r.needsReview || daysTo(r.reviewDate) < 0 ? 'row-amber' : '',
    filters: [
      { id: 'band', label: 'Any rating', options: [{ value: 'high', label: 'High / critical (initial, controls outstanding)' }, { value: 'resHigh', label: 'High / critical residual' }], test: (r, v) => v === 'high' ? ['High', 'Critical'].includes(riskBand(r.L1 * r.S1).name) && r.controls.some(c => c.status !== 'Implemented') : ['High', 'Critical'].includes(riskBand(r.L2 * r.S2).name) },
      { id: 'approval', label: 'Any approval status', options: ['Draft', 'Awaiting Approval', 'Approved'], test: (r, v) => r.approval === v },
      { id: 'site', label: 'All sites', options: [{ value: 'ALL', label: 'Organisation-wide' }].concat(orgSites().map(s => ({ value: s.id, label: s.short }))), test: (r, v) => r.site === v },
      { id: 'review', label: 'Any review date', options: [{ value: 'overdue', label: 'Review overdue / required' }], test: r => daysTo(r.reviewDate) < 0 || r.needsReview },
      { id: 'cell', label: 'Matrix cell', hidden: true, options: [], test: (r, v) => { const [m, L, Sv] = v.split('|'); return m === 'initial' ? r.L1 == L && r.S1 == Sv : r.L2 == L && r.S2 == Sv; } }
    ],
    columns: [
      { label: 'ID', render: r => `<span class="mono">${r.id}</span>` },
      { label: 'Activity / hazard', render: r => `<div class="t-title">${esc(r.activity)}</div><div class="t-sub">${esc(r.hazard)}</div>` },
      { label: 'Site', render: r => esc(sname(r.site)) },
      { label: 'Initial', render: r => ratingChip(r.L1, r.S1) },
      { label: 'Residual', render: r => ratingChip(r.L2, r.S2) },
      { label: 'Controls', render: r => { const o = r.controls.filter(c => c.status !== 'Implemented').length; return o ? `<span class="badge b-amber">${o} outstanding</span>` : '<span class="badge b-green">In place</span>'; } },
      { label: 'Approval', render: r => sbadge(r.approval) + (r.needsReview ? '<div class="t-sub" style="color:var(--amber)">Review required</div>' : '') },
      { label: 'Review date', render: r => dueText(r.reviewDate) }
    ]
  });
  const html = `${pageHead('Risk management', 'Risk register and structured assessments using the configurable risk matrix. Link risks to legal obligations, procedures and assets, and generate actions for missing controls.', permBtn('risk.edit', `<button class="btn" data-act="riskUpload">${icon('upload', 'sm')} Upload existing assessment</button>`) + permBtn('risk.edit', `<button class="btn primary" data-act="riskNew">${icon('plus', 'sm')} New risk assessment</button>`), scopePill())}
    <div class="kpis">
      ${kpi('Risks in register', rows.length, `${rows.filter(r => r.approval !== 'Approved').length} not yet approved`, 'blue', '#/risks', 'risk')}
      ${kpi('High / critical (initial)', highInit.length, 'Before additional controls', highInit.length ? 'amber' : 'green', '#/risks?band=high', 'alert')}
      ${kpi('High / critical residual', rows.filter(r => ['High', 'Critical'].includes(riskBand(r.L2 * r.S2).name)).length, 'After planned controls', 'red', '#/risks?band=resHigh', 'alert')}
      ${kpi('Controls outstanding', open, 'Additional controls not yet implemented', open ? 'amber' : 'green', '#/actions?source=Risk Assessment', 'target')}
    </div>
    <div class="grid g-3-2 mb"><div class="card"><div class="card-head"><h2>Risk heat map</h2><div class="btn-row"><button class="btn sm ${RISK_UI.mode === 'initial' ? 'primary' : ''}" data-act="riskMode" data-mode="initial">Initial</button><button class="btn sm ${RISK_UI.mode === 'residual' ? 'primary' : ''}" data-act="riskMode" data-mode="residual">Residual</button></div></div><div class="card-body">${riskMatrixHtml(rows, RISK_UI.mode, true)}<p class="muted mt-s">Click a cell to filter the register. Matrix size, labels and bands are configurable in Administration.</p></div></div>
    <div class="card"><div class="card-head"><h2>Highest residual risks</h2></div><div class="card-body"><ul class="link-list">${rows.slice().sort((a, b) => b.L2 * b.S2 - a.L2 * a.S2).slice(0, 6).map(r => `<li><div class="ll-main"><a href="#/risks/${r.id}">${r.id}</a><div>${esc(r.activity)} · ${esc(sname(r.site))}</div></div>${ratingChip(r.L2, r.S2)}</li>`).join('')}</ul></div></div></div>
    <div id="riskList">${lv}</div>`;
  return { title: 'Risk management', crumbs: [['Risk management', '#/risks']], html };
};
ACT.riskMode = (el) => { RISK_UI.mode = el.dataset.mode; rerender(); };
ACT.riskCell = (el) => { const st = LV.state.risks; st.f.cell = `${el.dataset.mode}|${el.dataset.l}|${el.dataset.s}`; refreshList('risks'); const lvc = document.getElementById('lvc-risks'); if (lvc) { if (!lvc.querySelector('.active-filter')) lvc.querySelector('.toolbar').insertAdjacentHTML('beforeend', `<span class="active-filter">Matrix cell L${el.dataset.l} × S${el.dataset.s} (${el.dataset.mode}) <button data-act="riskCellClear" aria-label="Clear">${icon('x', 'sm')}</button></span>`); lvc.scrollIntoView({ behavior: 'smooth' }); } };
ACT.riskCellClear = () => { delete LV.state.risks.f.cell; rerender(); };

function riskDetail(id) {
  const r = byId('risks', id); if (!r) return ROUTES.notfound();
  const acts = S.actions.filter(a => a.source === 'Risk Assessment' && a.sourceId === r.id);
  const html = `<div class="status-hero"><div><div class="sh-id">${r.id} · ${esc(sname(r.site))}</div><h1 style="margin:2px 0 6px">${esc(r.activity)}</h1><div class="btn-row">${sbadge(r.approval)} Initial ${ratingChip(r.L1, r.S1)} → Residual ${ratingChip(r.L2, r.S2)} ${r.needsReview ? badge('Review required', 'amber') : ''}</div></div>
    <div class="sh-actions">${permBtn('risk.edit', `<button class="btn" data-act="riskEdit" data-id="${r.id}">Edit</button>`)}${permBtn('risk.edit', `<button class="btn" data-act="riskControl" data-id="${r.id}">${icon('plus', 'sm')} Add missing control</button>`)}${permBtn('risk.edit', `<button class="btn primary" data-act="riskReview" data-id="${r.id}">${icon('refresh', 'sm')} Review assessment</button>`)}${['Draft', 'Awaiting Approval'].includes(r.approval) ? permBtn('risk.approve', `<button class="btn success" data-act="riskApprove" data-id="${r.id}">${icon('check', 'sm')} Approve</button>`) : ''}</div></div>
  ${r.needsReview ? `<div class="alert warn">${icon('alert')}<div><b>Review required:</b> a control was implemented and verified. Re-rate the residual risk and set the next review date using <b>Review assessment</b>.</div></div>` : ''}
  <div class="detail"><div class="stack">
    <div class="card"><div class="card-head"><h2>Assessment</h2></div><div class="card-body"><div class="kv">
      <div>Activity / process</div><div>${esc(r.activity)}</div><div>Hazard</div><div>${esc(r.hazard)}</div><div>Potential consequence</div><div>${esc(r.consequence)}</div><div>Persons exposed</div><div>${esc(r.exposed)}</div>
      <div>Existing controls</div><div>${esc(r.existing)}</div><div>Initial rating</div><div>L${r.L1} × S${r.S1} = ${ratingChip(r.L1, r.S1)}</div>
      <div>Residual rating</div><div>L${r.L2} × S${r.S2} = ${ratingChip(r.L2, r.S2)}</div><div>Responsible person</div><div>${esc(pname(r.responsible))}</div>
      <div>Controls due</div><div>${dueText(r.due, !r.controls.some(c => c.status !== 'Implemented'))}</div><div>Review date</div><div>${dueText(r.reviewDate)}</div>
      <div>Approval status</div><div>${sbadge(r.approval)}</div><div>Uploaded assessment</div><div>${r.file ? fileChip(r.file) : '<span class="muted">Structured assessment (no upload)</span>'}</div>
    </div></div></div>
    <div class="card"><div class="card-head"><h2>Additional control measures</h2>${permBtn('risk.edit', `<button class="btn sm" data-act="riskControl" data-id="${r.id}">Add control</button>`)}</div><div class="card-body flush">${r.controls.length ? `<table class="tbl stackable"><thead><tr><th>Control</th><th>Owner</th><th>Due</th><th>Status</th><th>Action</th></tr></thead><tbody>${r.controls.map(c => { const a = c.action && byId('actions', c.action); return `<tr><td data-label="Control">${esc(c.text)}</td><td data-label="Owner">${esc(pname(c.owner))}</td><td data-label="Due">${dueText(c.due, c.status === 'Implemented')}</td><td data-label="Status">${badge(c.status, c.status === 'Implemented' ? 'green' : 'amber')}</td><td data-label="Action">${a ? `<a href="#/actions/${a.id}">${a.id}</a> ${sbadge(a.status)}` : c.status !== 'Implemented' ? permBtn('action.create', `<button class="btn sm" data-act="riskCtrlAction" data-id="${r.id}" data-c="${c.id}">Generate action</button>`) : '—'}</td></tr>`; }).join('')}</tbody></table>` : '<div class="empty">No additional controls recorded.</div>'}</div></div>
    <div class="card"><div class="card-head"><h2>Assessment history</h2></div><div class="card-body">${r.history.length ? `<ul class="timeline">${r.history.map(h => `<li><b>${esc(h.action)}</b><div class="tl-meta">${esc(pname(h.by))} · ${fmtTs(h.ts)}</div>${h.comment ? `<div class="tl-comment">${esc(h.comment)}</div>` : ''}</li>`).join('')}</ul>` : '<p class="muted">No history.</p>'}</div></div>
  </div><div class="stack">
    <div class="card"><div class="card-head"><h2>Rating on matrix</h2></div><div class="card-body">${riskMatrixHtml([r], 'residual', false)}</div></div>
    <div class="card"><div class="card-head"><h2>Linked records</h2>${permBtn('risk.edit', `<button class="btn sm" data-act="riskLink" data-id="${r.id}">Link</button>`)}</div><div class="card-body"><ul class="link-list">
      ${r.legal.map(x => { const l = byId('legal', x); return l ? `<li><div class="ll-main"><a href="#/legal/${l.id}">${l.id}</a><div>Legal · ${esc(l.reference)}</div></div>${sbadge(l.status)}</li>` : ''; }).join('')}
      ${r.docs.map(x => { const d = byId('documents', x); return d ? `<li><div class="ll-main"><a href="#/documents/${d.id}">${esc(d.number)}</a><div>Document · ${esc(d.title)}</div></div>${sbadge(docStatus(d))}</li>` : ''; }).join('')}
      ${r.assets.map(x => { const a = byId('assets', x); return a ? `<li><div class="ll-main"><a href="#/assets/${a.id}">${esc(a.tag)}</a><div>Asset · ${esc(a.name)}</div></div>${sbadge(a.status)}</li>` : ''; }).join('')}
      ${S.incidents.filter(i => i.links.risks.includes(r.id)).map(i => `<li><div class="ll-main"><a href="#/incidents/${i.id}">${i.id}</a><div>Incident · ${esc(i.title)}</div></div>${sbadge(i.status)}</li>`).join('')}
      ${acts.map(a => `<li><div class="ll-main"><a href="#/actions/${a.id}">${a.id}</a><div>Action · ${esc(a.title)}</div></div>${sbadge(a.status)}</li>`).join('')}
    </ul></div></div>
    <div class="card"><div class="card-head"><h2>Supporting evidence</h2>${permBtn('risk.edit', `<button class="btn sm" data-act="riskEvidence" data-id="${r.id}">Add</button>`)}</div><div class="card-body">${r.evidence.length ? r.evidence.map(e => `<div class="mt-s">${fileChip(e)}</div>`).join('') : '<p class="muted">None.</p>'}</div></div>
  </div></div>`;
  return { title: r.id, nav: 'risks', crumbs: [['Risk management', '#/risks'], [r.id, '#']], html };
}
function lsSelect(name, val, labels) { return fld({ name, label: name.startsWith('L') ? 'Likelihood' : 'Severity', type: 'select', options: opts(labels.map((l, i) => ({ value: i + 1, label: `${i + 1} — ${l}` })), val), required: true }); }
function riskForm(r) {
  const M = S.config.riskMatrix;
  return `<div class="form-grid">
    ${fld({ name: 'activity', label: 'Activity or process', value: r ? r.activity : '', required: true, full: true })}
    ${fld({ name: 'hazard', label: 'Hazard', value: r ? r.hazard : '', required: true })}${fld({ name: 'consequence', label: 'Potential consequence', value: r ? r.consequence : '', required: true })}
    ${fld({ name: 'exposed', label: 'Persons exposed', value: r ? r.exposed : '' })}${fld({ name: 'site', label: 'Site', type: 'select', options: siteOptions(r ? r.site : defaultSite()), required: true })}
    ${fld({ name: 'existing', label: 'Existing controls', type: 'textarea', value: r ? r.existing : '', full: true })}
    <fieldset class="fieldset full"><legend>Initial risk (with existing controls)</legend><div class="form-grid">${lsSelect('L1', r ? r.L1 : 3, M.likelihood)}${lsSelect('S1', r ? r.S1 : 3, M.severity)}</div><div class="mt-s" id="r1"></div></fieldset>
    <fieldset class="fieldset full"><legend>Residual risk (after additional controls)</legend><div class="form-grid">${lsSelect('L2', r ? r.L2 : 2, M.likelihood)}${lsSelect('S2', r ? r.S2 : 3, M.severity)}</div><div class="mt-s" id="r2"></div></fieldset>
    ${fld({ name: 'responsible', label: 'Responsible person', type: 'select', options: personOptions(r ? r.responsible : S.ui.user), required: true })}${fld({ name: 'due', label: 'Controls due date', type: 'date', value: r ? r.due : addDays(TODAY, 30), required: true })}
    ${fld({ name: 'reviewDate', label: 'Review date', type: 'date', value: r ? r.reviewDate : addMonths(TODAY, 12), required: true })}
  </div>`;
}
function wireRatings(m) { const upd = () => { ['1', '2'].forEach(k => { const L = +m.querySelector('[name=L' + k + ']').value, Sv = +m.querySelector('[name=S' + k + ']').value; m.querySelector('#r' + k).innerHTML = 'Rating: ' + ratingChip(L, Sv); }); }; m.querySelectorAll('[name=L1],[name=S1],[name=L2],[name=S2]').forEach(x => x.addEventListener('change', upd)); upd(); }
ACT.riskNew = () => openModal({ title: 'New structured risk assessment', size: 'wide', body: riskForm(null) + `<fieldset class="fieldset mt"><legend>Missing / additional control (optional)</legend><div class="form-grid">${fld({ name: 'ctrl', label: 'Additional control measure', full: true })}${fld({ name: 'genAction', label: 'Generate a corrective action for this control', type: 'checkbox', value: true, full: true })}</div></fieldset>`, onOpen: wireRatings,
  buttons: [{ label: 'Save as draft', cls: 'primary', onClick: m => {
    if (!validateForm(m)) return false; const v = readForm(m); const id = nextId('RA-', 'risks');
    const r = { id, org: siteOrgOf(v.site), site: v.site, activity: v.activity, hazard: v.hazard, consequence: v.consequence, exposed: v.exposed, existing: v.existing, L1: +v.L1, S1: +v.S1, L2: +v.L2, S2: +v.S2, controls: [], responsible: v.responsible, due: v.due, reviewDate: v.reviewDate, approval: 'Draft', legal: [], docs: [], assets: [], evidence: [], file: null, created: TODAY, history: [{ ts: nowTs(), by: S.ui.user, action: 'Assessment created (draft)', comment: '' }] };
    S.risks.push(r);
    if (v.ctrl) { const c = { id: 'C1', text: v.ctrl, owner: v.responsible, due: v.due, status: 'Planned', action: null }; r.controls.push(c); if (v.genAction) { const a = createAction({ source: 'Risk Assessment', sourceId: id, title: `Missing control: ${v.ctrl}`, action: v.ctrl, owner: v.responsible, due: v.due, site: v.site === 'ALL' ? defaultSite() : v.site, priority: ['High', 'Critical'].includes(riskBand(v.L1 * v.S1).name) ? 'High' : 'Medium' }); c.action = a.id; } }
    log(`Created risk assessment ${id}`, '#/risks/' + id); save(); toast(`${id} created as draft.`); navigate('#/risks/' + id);
  } }] });
ACT.riskUpload = () => openModal({ title: 'Upload existing risk assessment', sub: 'Register an existing (e.g. Excel/PDF) assessment. Key ratings are captured so it appears in the register and heat map.', size: 'wide', body: `<div class="form-grid">${fld({ name: 'file', label: 'Assessment file', type: 'file', required: true, full: true })}</div>` + riskForm(null), onOpen: wireRatings,
  buttons: [{ label: 'Register assessment', cls: 'primary', onClick: m => {
    if (!validateForm(m)) return false; const v = readForm(m); const id = nextId('RA-', 'risks');
    S.risks.push({ id, org: siteOrgOf(v.site), site: v.site, activity: v.activity, hazard: v.hazard, consequence: v.consequence, exposed: v.exposed, existing: v.existing, L1: +v.L1, S1: +v.S1, L2: +v.L2, S2: +v.S2, controls: [], responsible: v.responsible, due: v.due, reviewDate: v.reviewDate, approval: 'Awaiting Approval', legal: [], docs: [], assets: [], evidence: [], file: v.file, created: TODAY, history: [{ ts: nowTs(), by: S.ui.user, action: 'Existing assessment uploaded and registered', comment: v.file.name }] });
    log(`Uploaded risk assessment ${id}`, '#/risks/' + id); save(); toast(`${id} registered — awaiting approval.`); navigate('#/risks/' + id);
  } }] });
ACT.riskEdit = (el) => { const r = byId('risks', el.dataset.id); openModal({ title: 'Edit risk assessment', sub: r.id, size: 'wide', body: riskForm(r), onOpen: wireRatings, buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); Object.assign(r, v, { L1: +v.L1, S1: +v.S1, L2: +v.L2, S2: +v.S2, org: siteOrgOf(v.site) }); r.history.unshift({ ts: nowTs(), by: S.ui.user, action: 'Assessment edited', comment: '' }); save(); toast('Saved.'); rerender(); } }] }); };
ACT.riskControl = (el) => { const r = byId('risks', el.dataset.id); openModal({ title: 'Add missing control', sub: `${r.id} — ${esc(r.activity)}`, body: `<div class="form-grid">${fld({ name: 'text', label: 'Control measure', required: true, full: true })}${fld({ name: 'owner', label: 'Owner', type: 'select', options: personOptions(r.responsible), required: true })}${fld({ name: 'due', label: 'Due date', type: 'date', value: addDays(TODAY, 30), required: true })}${fld({ name: 'gen', label: 'Generate corrective action in the central register', type: 'checkbox', value: true, full: true })}${fld({ name: 'priority', label: 'Action priority', type: 'select', options: opts(S.config.priorities.map(p => p.name), 'High') })}</div>`,
  buttons: [{ label: 'Add control', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); const c = { id: 'C' + (r.controls.length + 1), text: v.text, owner: v.owner, due: v.due, status: 'Planned', action: null }; r.controls.push(c);
    if (v.gen) { const a = createAction({ source: 'Risk Assessment', sourceId: r.id, title: `Missing control: ${v.text}`, action: v.text, owner: v.owner, due: v.due, priority: v.priority, site: r.site === 'ALL' ? defaultSite() : r.site }); c.action = a.id; }
    r.history.unshift({ ts: nowTs(), by: S.ui.user, action: `Missing control identified: ${v.text}`, comment: c.action ? `Action ${c.action} raised` : '' }); save(); toast(c.action ? `Control added and ${c.action} raised.` : 'Control added.'); rerender(); } }] }); };
ACT.riskCtrlAction = (el) => { const r = byId('risks', el.dataset.id), c = r.controls.find(x => x.id === el.dataset.c); raiseActionModal({ source: 'Risk Assessment', sourceId: r.id, title: `Missing control: ${c.text}`, action: c.text, owner: c.owner, due: c.due, site: r.site === 'ALL' ? defaultSite() : r.site }, a => { c.action = a.id; save(); rerender(); }); };
ACT.riskReview = (el) => { const r = byId('risks', el.dataset.id); const M = S.config.riskMatrix; openModal({ title: 'Review risk assessment', sub: `${r.id}: re-rate residual risk in light of implemented controls and set the next review date.`, body: `<div class="form-grid">${lsSelect('L2', r.L2, M.likelihood)}${lsSelect('S2', r.S2, M.severity)}<div class="full" id="r2"></div>${fld({ name: 'reviewDate', label: 'Next review date', type: 'date', value: addMonths(TODAY, 12), required: true })}${fld({ name: 'note', label: 'Review notes', type: 'textarea', required: true, full: true })}</div>`,
  onOpen: m => { const upd = () => m.querySelector('#r2').innerHTML = 'Residual rating: ' + ratingChip(+m.querySelector('[name=L2]').value, +m.querySelector('[name=S2]').value); m.querySelectorAll('select').forEach(x => x.addEventListener('change', upd)); upd(); },
  buttons: [{ label: 'Save review', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); const before = r.L2 * r.S2; r.L2 = +v.L2; r.S2 = +v.S2; r.reviewDate = v.reviewDate; r.needsReview = false; r.lastReviewed = TODAY; r.approval = can('risk.approve') ? 'Approved' : 'Awaiting Approval';
    r.history.unshift({ ts: nowTs(), by: S.ui.user, action: `Assessment reviewed — residual ${before} → ${r.L2 * r.S2} (${riskBand(r.L2 * r.S2).name}); next review ${fmt(r.reviewDate)}`, comment: v.note }); log(`Reviewed ${r.id}`, '#/risks/' + r.id); save(); toast(`Review saved. ${r.approval === 'Approved' ? 'Approved.' : 'Awaiting approval.'}`); rerender(); } }] }); };
ACT.riskApprove = (el) => { const r = byId('risks', el.dataset.id); confirmBox('Approve risk assessment', `Approve ${r.id}: ${esc(r.activity)}?`, 'Approve', () => { r.approval = 'Approved'; r.history.unshift({ ts: nowTs(), by: S.ui.user, action: 'Assessment approved', comment: '' }); log(`Approved ${r.id}`, '#/risks/' + r.id); save(); toast('Approved.'); rerender(); }, 'success'); };
ACT.riskEvidence = (el) => { const r = byId('risks', el.dataset.id); openModal({ title: 'Add supporting evidence', body: fld({ name: 'file', label: 'File', type: 'file', required: true }), buttons: [{ label: 'Add', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; r.evidence.push(readForm(m).file); save(); toast('Evidence added (demo reference).'); rerender(); } }] }); };
ACT.riskLink = (el) => { const r = byId('risks', el.dataset.id); const list = [].concat(scoped('legal').map(l => ({ value: 'legal|' + l.id, label: `Legal ${l.id} — ${l.reference}` })), scoped('documents').filter(docActive).map(d => ({ value: 'docs|' + d.id, label: `Document ${d.number} — ${d.title}` })), scoped('assets').map(a => ({ value: 'assets|' + a.id, label: `Asset ${a.tag} — ${a.name}` })));
  openModal({ title: 'Link record to risk', sub: r.id, body: fld({ name: 'ref', label: 'Record', type: 'select', options: opts(list, '', '— Select —'), required: true }), buttons: [{ label: 'Link', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const [k, id] = readForm(m).ref.split('|'); if (!r[k].includes(id)) r[k].push(id); if (k === 'legal') { const l = byId('legal', id); if (!l.risks.includes(r.id)) l.risks.push(r.id); } save(); toast('Linked.'); rerender(); } }] }); };
