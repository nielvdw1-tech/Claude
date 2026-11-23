/* ==========================================================================
   Risk Management (specification module 5)
   --------------------------------------------------------------------------
   - Hazard register: category, location, activity, exposed persons, who
     identified it and when, photos, links to incidents, inspections and
     risk assessments.
   - Risk assessments (baseline, issue-based, task-specific, activity-based,
     equipment-related, hazardous substance): several hazards each, with
     consequences, exposed persons, existing controls, INITIAL risk, additional
     controls (hierarchy of controls, owner, date, status, evidence, optional
     corrective action), and RESIDUAL risk recorded separately.
   - Risk matrix (likelihood × severity) configurable under Administration:
     descriptions, bands and the band from which risks are escalated.
     A score never decides on its own that a risk is acceptable: a named
     person must accept the residual risk with a reason.
   - Reviews: scheduled, after an incident, after a change, or when a control
     is ineffective. Each review keeps the previous version.
   ========================================================================== */
'use strict';

const canRisk = () => can('risk.manage');
const RA_TYPES = ['Baseline', 'Issue-based', 'Task-specific', 'Activity-based', 'Equipment-related', 'Hazardous substance'];
const HIERARCHY = ['Elimination', 'Substitution', 'Engineering controls', 'Administrative controls', 'PPE'];
const CTRL_STATUS = ['Planned', 'In progress', 'Implemented', 'Verified'];
const RV_REASONS = ['Scheduled review', 'After an incident', 'After an operational change', 'Control found ineffective', 'Other'];
const RM = () => S.config.riskMatrix;
const rScore = r => r && r.l && r.s ? r.l * r.s : null;
function rBand(r) { const v = rScore(r); if (v == null) return null; return RM().bands.find(b => v <= b.max) || RM().bands[RM().bands.length - 1]; }
const BAND_TONE = { green: 'green', amber: 'amber', orange: 'orange', red: 'red' };
function rChip(r) { const b = rBand(r); return b ? `<span class="risk-chip rc-${b.tone}" title="Likelihood ${r.l} × severity ${r.s}">${rScore(r)} · ${esc(b.name)}</span>` : '<span class="muted">—</span>'; }
const escalates = r => { const b = rBand(r), e = RM().bands.findIndex(x => x.name === RM().escalateFrom); return b && RM().bands.indexOf(b) >= e; };
const rowRisk = row => row.residual && row.residual.l ? row.residual : row.initial;   // current risk: residual if assessed, otherwise initial
const raList = () => (S.riskAssessments || []).filter(a => a.org === S.ui.org && inSite(a, S.ui.site));
const raOverdue = a => a.status === 'Approved' && a.reviewDate && daysTo(a.reviewDate) < 0;
const openCtrls = a => (a.rows || []).flatMap(r => (r.controls || []).filter(c => !['Implemented', 'Verified'].includes(c.status)));
function raStatus(a) { return a.status === 'Draft' ? 'Draft' : raOverdue(a) ? 'Review overdue' : a.status; }

/* ---------------- Route ---------------- */
ROUTES.risk = (p, q = {}) => {
  if (p[0] && /^RA-/.test(p[0])) return raDetail(p[0]);
  if (p[0] && /^HZ-/.test(p[0])) return hazardDetail(p[0]);
  const tab = ['assessments', 'hazards', 'matrix'].includes(p[0]) ? p[0] : 'assessments';
  const A = raList(), H = (S.hazards || []).filter(h => h.org === S.ui.org && inSite(h, S.ui.site)), rows = A.filter(a => a.status !== 'Superseded').flatMap(a => (a.rows || []).map(r => ({ a, r })));
  const hi = rows.filter(x => { const b = rBand(rowRisk(x.r)); return b && RM().bands.indexOf(b) >= RM().bands.length - 2; });
  const tabs = [['assessments', 'Risk assessments', A.length], ['hazards', 'Hazard register', H.length], ['matrix', 'Risk matrix']];
  let body = '', fab = '';
  if (tab === 'assessments') { body = raListHtml(A, q); fab = canRisk() ? fabBtn('raNew', 'New risk assessment') : ''; }
  if (tab === 'hazards') { body = hazardsHtml(H, q); fab = fabBtn('hzNew', 'Record a hazard'); }
  if (tab === 'matrix') body = matrixPageHtml(rows);
  const bySite = orgSites().map(s => ({ s, n: rows.filter(x => x.a.site === s.id && hi.includes(x)).length, od: A.filter(a => a.site === s.id && raOverdue(a)).length }));
  const html = `${pageHead('Risk management', 'Hazards, risk assessments, controls and reviews. Initial and residual risk are recorded separately; a score never decides on its own that a risk is acceptable.', '', scopePill())}${fab}
    <div class="kpis kpis-8">${kpi('Hazards recorded', H.length, `${H.filter(h => h.status === 'Open').length} not yet controlled`, 'blue', '#/risk/hazards', 'alert')}
      ${kpi('Current assessments', A.filter(a => a.status === 'Approved').length, `${A.filter(a => a.status === 'Draft').length} draft`, 'blue', '#/risk/assessments', 'risk')}
      ${kpi('High and critical risks', hi.length, 'Current risk (residual where assessed)', hi.length ? 'red' : 'green', '#/risk/matrix', 'flame')}
      ${kpi('Outstanding controls', A.reduce((n, a) => n + openCtrls(a).length, 0), 'Planned or in progress', 'amber', '#/risk/assessments?fflag=ctrl', 'target')}
      ${kpi('Overdue reviews', A.filter(raOverdue).length, 'Review date passed', A.some(raOverdue) ? 'red' : 'green', '#/risk/assessments?fflag=overdue', 'refresh')}
      ${bySite.map(x => kpi(x.s.short || x.s.name, x.n, `high/critical · ${x.od} review(s) overdue`, x.n ? 'amber' : 'green', `#/risk/assessments?fsite=${x.s.id}`, 'building')).slice(0, 3).join('')}</div>
    ${tabsHtml('#/risk', tabs, tab)}${body}`;
  return { title: 'Risk management', nav: 'risk', crumbs: [['Risk Management', '#/risk']], html };
};
const RA_F = {
  ftype: { all: 'All types', list: () => RA_TYPES.map(t => ({ value: t, label: t })), test: (a, v) => a.type === v },
  fsite: { all: 'All branches', list: () => orgSites().length > 1 ? branchOpts() : [], test: (a, v) => a.site === v },
  fstatus: { all: 'All statuses', list: () => ['Draft', 'Approved', 'Review overdue', 'Superseded'].map(s => ({ value: s, label: s })), test: (a, v) => raStatus(a) === v },
  fflag: { all: 'Anything', list: () => [{ value: 'high', label: 'With high or critical risks' }, { value: 'ctrl', label: 'With outstanding controls' }, { value: 'overdue', label: 'Review overdue' }], test: (a, v) => v === 'ctrl' ? openCtrls(a).length > 0 : v === 'overdue' ? raOverdue(a) : (a.rows || []).some(r => { const b = rBand(rowRisk(r)); return b && RM().bands.indexOf(b) >= RM().bands.length - 2; }) }
};
function raListHtml(A, q) { const rows = regFilter(A, q, RA_F).sort((x, y) => x.id.localeCompare(y.id));
  return `<div class="card cq-wide">${regFilterBar('#/risk/assessments', q, A, rows.length, RA_F, 'Search title, activity, assessor…')}<div class="card-body flush">${rows.length ? `<div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Assessment</th><th>Type</th><th>Branch / department</th><th>Hazards</th><th>Highest current risk</th><th>Open controls</th><th>Review</th><th>Status</th><th></th></tr></thead><tbody>
    ${rows.map(a => { const top = (a.rows || []).map(rowRisk).filter(rScore).sort((x, y) => rScore(y) - rScore(x))[0], st = raStatus(a);
      return `<tr class="rowlink" data-href="#/risk/${a.id}"><td data-label="Assessment"><span class="mono">${a.id}</span>${a.version > 1 ? ` <span class="t-sub">v${a.version}</span>` : ''}<div class="t-title">${esc(a.title)}</div></td><td data-label="Type">${esc(a.type)}</td><td data-label="Branch">${esc(sname(a.site))}<div class="t-sub">${esc(a.dept || '')}</div></td><td data-label="Hazards">${(a.rows || []).length}</td><td data-label="Highest">${top ? rChip(top) : '—'}</td><td data-label="Open controls">${openCtrls(a).length || '—'}</td><td data-label="Review">${a.reviewDate ? dueText(a.reviewDate) : '—'}</td><td data-label="Status">${badge(st, st === 'Approved' ? 'green' : st === 'Draft' ? 'grey' : st === 'Superseded' ? 'grey' : 'red')}</td><td data-label=""><a class="btn sm" href="#/risk/${a.id}/view">${icon('eye', 'sm')} View</a></td></tr>`; }).join('')}
  </tbody></table></div>` : emptyList(A.length ? 'No assessments match these filters.' : 'No risk assessments yet.')}</div></div>`; }

/* ---------------- Risk assessment detail ---------------- */
function raDetail(id) {
  const a = byId('riskAssessments', id); if (!a || a.org !== S.ui.org) return ROUTES.notfound();
  const edit = canRisk() && a.status !== 'Superseded', st = raStatus(a);
  const html = `<div class="status-hero"><div><div class="sh-id">${a.id}${a.version > 1 ? ' · version ' + a.version : ''} · ${esc(a.type)} · ${esc(sname(a.site))}${a.dept ? ' · ' + esc(a.dept) : ''}</div><h1 style="margin:2px 0 6px">${esc(a.title)}</h1><div class="btn-row">${badge(st, st === 'Approved' ? 'green' : st === 'Draft' ? 'grey' : 'red')} ${a.reviewDate ? `<span class="tag">Review ${fmt(a.reviewDate)}</span>` : ''}</div></div>
    <div class="sh-actions">${edit ? `<button class="btn" data-act="raEdit" data-id="${a.id}">${icon('edit', 'sm')} Details</button><button class="btn" data-act="raRow" data-id="${a.id}">${icon('plus', 'sm')} Add hazard</button>${a.status === 'Draft' ? `<button class="btn primary" data-act="raApprove" data-id="${a.id}">Approve</button>` : `<button class="btn primary" data-act="raReview" data-id="${a.id}">Record review</button>`}` : ''}</div></div>
  ${a.status === 'Superseded' ? `<div class="alert info">${icon('info')}<div>This version was superseded by a review. <a href="#/risk/${a.supersededBy}">Open the current version</a>.</div></div>` : ''}
  <div class="detail"><div class="stack">
    ${(a.rows || []).length ? a.rows.map((r, k) => raRowHtml(a, r, k, edit)).join('') : `<div class="card">${emptyList('No hazards assessed yet. Use "Add hazard".')}</div>`}
  </div><div class="stack">
    <div class="card"><div class="card-head"><h2>Details</h2></div><div class="card-body"><div class="kv">
      <div>Activity / process</div><div>${esc(a.activity || '—')}</div><div>Assessment date</div><div>${fmt(a.date)}</div><div>Assessor</div><div>${esc(pname(a.assessor))}</div>
      <div>Participants</div><div>${(a.participants || []).map(pname).join(', ') || '—'}</div>${a.asset ? `<div>Equipment</div><div><a href="#/assets/${a.asset}">${esc((byId('assets', a.asset) || {}).tag || a.asset)}</a></div>` : ''}${a.substance ? `<div>Substance</div><div><a href="#/substances/${a.substance}">${esc((byId('substances', a.substance) || {}).name || a.substance)}</a></div>` : ''}
      <div>Approved</div><div>${a.approvedBy ? fmt(a.approvedOn) + ' by ' + esc(pname(a.approvedBy)) : '—'}</div><div>Next review</div><div>${a.reviewDate ? dueText(a.reviewDate) : '—'}</div>
      <div>Evidence</div><div>${(a.evidence || []).map(f => `<button type="button" class="link-btn" ${fileAttrs(f)}>${esc(f.name)}</button>`).join(', ') || '—'}</div></div>
      ${edit ? `<label class="btn sm mt-s">${icon('upload', 'sm')} Upload evidence<input type="file" hidden data-raev="${a.id}"></label>` : ''}</div></div>
    <div class="card"><div class="card-head"><h2>Reviews and versions</h2></div><div class="card-body">${(a.reviews || []).length || a.supersedes ? `<ul class="timeline">${(a.reviews || []).slice().reverse().map(v => `<li><b>${esc(v.reason)}</b>${v.ref ? ` (${esc(v.ref)})` : ''} — ${esc(v.outcome || '')}<div class="t-sub">${fmt(v.date)} · ${esc(pname(v.by))}${v.prev ? ` · previous version <a href="#/risk/${v.prev}">${v.prev}</a>` : ''}</div></li>`).join('')}${a.supersedes ? `<li>Replaces <a href="#/risk/${a.supersedes}">${a.supersedes}</a></li>` : ''}</ul>` : '<p class="muted">No reviews yet.</p>'}</div></div>
  </div></div>`;
  return { title: a.id, nav: 'risk', crumbs: [['Risk Management', '#/risk'], [a.id, '#']], html };
}
function raRowHtml(a, r, k, edit) {
  const hz = r.hazard && byId('hazards', r.hazard);
  return `<div class="card ra-row cq-card"><div class="card-head"><div><h2>${k + 1}. ${esc(r.title)}</h2><span class="ch-sub">${esc(r.category || '')}${hz ? ` · from <a href="#/risk/${hz.id}">${hz.id}</a>` : ''}</span></div>${edit ? `<button class="btn sm" data-act="raRow" data-id="${a.id}" data-k="${k}">${icon('edit', 'sm')} Edit</button>` : ''}</div><div class="card-body">
    <div class="ra-grid">${r.step ? `<div class="full"><span class="t-sub">Activity / task step</span><div>${esc(r.step)}</div></div>` : ''}${r.risk ? `<div class="full"><span class="t-sub">Risk (what can happen?)</span><div>${esc(r.risk)}</div></div>` : ''}<div><span class="t-sub">Consequence of the risk</span><div>${esc(r.consequences || '—')}</div></div><div><span class="t-sub">Exposed persons</span><div>${esc(r.exposed || '—')}</div></div><div class="full"><span class="t-sub">Existing controls</span><div>${esc(r.existing || '—')}</div></div></div>
    <div class="ra-risks"><div><span class="t-sub">Initial risk</span>${rChip(r.initial)}</div><span class="ra-arrow">→</span><div><span class="t-sub">Residual risk (after additional controls)</span>${r.residual && r.residual.l ? rChip(r.residual) : '<span class="muted">Not assessed yet</span>'}</div>
      <div class="ra-accept">${r.accepted ? `${icon('checkCircle', 'sm')} Residual risk accepted by <b>${esc(pname(r.accepted.by))}</b> ${fmt(r.accepted.on)}<div class="t-sub">${esc(r.accepted.reason)}</div>` : r.residual && r.residual.l ? `<span class="due amber">Residual risk not yet accepted</span>${edit ? ` <button class="btn sm" data-act="raAccept" data-id="${a.id}" data-k="${k}">Accept residual risk</button>` : ''}` : ''}</div></div>
    ${escalates(rowRisk(r)) ? `<div class="alert danger" style="margin:8px 0 0">${icon('alert')}<div><b>${esc(rBand(rowRisk(r)).name)} risk.</b> ${esc(rBand(rowRisk(r)).action || '')}</div></div>` : ''}
    <h3 class="ra-h3">Additional controls</h3>
    ${(r.controls || []).length ? `<table class="tbl compact stackable"><thead><tr><th>Control</th><th>Type</th><th>Responsible</th><th>Target</th><th>Status</th><th></th></tr></thead><tbody>${r.controls.map((c, i) => `<tr><td data-label="Control">${esc(c.desc)}${(c.evidence || []).length ? `<div class="t-sub">${c.evidence.map(f => `<button type="button" class="link-btn" ${fileAttrs(f)}>${esc(f.name)}</button>`).join(', ')}</div>` : ''}${c.action ? `<div class="t-sub">Tracked as <a href="#/actions/${c.action}">${c.action}</a></div>` : ''}</td><td data-label="Type">${esc(c.category)}</td><td data-label="Responsible">${esc(pname(c.owner))}</td><td data-label="Target">${c.due ? dueText(c.due, ['Implemented', 'Verified'].includes(c.status)) : '—'}</td><td data-label="Status">${badge(c.status, c.status === 'Verified' ? 'green' : c.status === 'Implemented' ? 'blue' : 'amber', true)}</td><td>${edit && c.status !== 'Verified' ? `<button class="btn sm" data-act="raCtrlUpd" data-id="${a.id}" data-k="${k}" data-i="${i}">Update</button>` : ''}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">No additional controls.</p>'}
    ${edit ? `<button class="btn sm mt-s" data-act="raCtrl" data-id="${a.id}" data-k="${k}">${icon('plus', 'sm')} Add control</button>` : ''}
  </div></div>`;
}
function lsFields(prefix, r, label) {
  const L = RM().likelihood, Sv = RM().severity;
  return `<div class="field"><label for="f_${prefix}l">${label} — probability / likelihood (P)</label><select id="f_${prefix}l" name="${prefix}l">${opts(L.map((x, i) => ({ value: i + 1, label: `${i + 1} — ${x.name}` })), r && r.l ? String(r.l) : '', '—')}</select></div>
    <div class="field"><label for="f_${prefix}s">${label} — impact / severity (I)</label><select id="f_${prefix}s" name="${prefix}s">${opts(Sv.map((x, i) => ({ value: i + 1, label: `${i + 1} — ${x.name}` })), r && r.s ? String(r.s) : '', '—')}</select></div>`;
}
ACT.raNew = () => openModal({ title: 'New risk assessment', size: 'wide', body: raForm(null), buttons: [{ label: 'Create', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); S.riskAssessments = S.riskAssessments || [];
  const a = Object.assign({ id: nextId('RA-', 'riskAssessments'), org: siteOrgOf(v.site), status: 'Draft', version: 1, rows: [], reviews: [], evidence: [], created: TODAY }, raRead(m, v)); S.riskAssessments.push(a); log(`Created risk assessment ${a.id}: ${a.title}`, '#/risk/' + a.id); save(); navigate('#/risk/' + a.id); } }] });
ACT.raEdit = (el) => { const a = byId('riskAssessments', el.dataset.id); openModal({ title: `Edit ${a.id}`, size: 'wide', body: raForm(a), buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; Object.assign(a, raRead(m, readForm(m))); log(`Edited risk assessment ${a.id}`, '#/risk/' + a.id); save(); rerender(); } }] }); };
function raForm(a) { return `<div class="form-grid">
  ${fld({ name: 'title', label: 'Title (document name)', value: a ? a.title : '', required: true, full: true, placeholder: 'e.g. Order picking – pallet racking' })}
  ${fld({ name: 'docNo', label: 'Document number', value: a ? a.docNo || '' : '', placeholder: 'e.g. 004 (leave empty to use the record number)' })}
  ${fld({ name: 'type', label: 'Type', type: 'select', options: opts(RA_TYPES, a ? a.type : 'Baseline'), required: true })}
  ${fld({ name: 'site', label: 'Branch', type: 'select', options: siteOptions(a ? a.site : defaultSite(), false), required: true })}
  ${fld({ name: 'dept', label: 'Department', type: 'select', options: opts(S.departments, a ? a.dept : '', '— Any —') })}
  ${fld({ name: 'activity', label: 'Activity or process', value: a ? a.activity || '' : '' })}
  ${fld({ name: 'date', label: 'Assessment date', type: 'date', value: a ? a.date : TODAY, required: true })}
  ${fld({ name: 'assessor', label: 'Assessor', type: 'select', options: personOptions(a ? a.assessor : S.ui.user, p => !!p.sysRole), required: true })}
  ${fld({ name: 'asset', label: 'Equipment (if equipment-related)', type: 'select', options: opts(S.assets.filter(x => inSite(x, 'ALL')).map(x => ({ value: x.id, label: `${x.tag} — ${x.name}` })), a ? a.asset || '' : '', '— None —') })}
  ${typeof S.substances === 'object' ? fld({ name: 'substance', label: 'Hazardous substance (if applicable)', type: 'select', options: opts((S.substances || []).filter(x => x.org === S.ui.org).map(x => ({ value: x.id, label: x.name })), a ? a.substance || '' : '', '— None —') }) : ''}
  <div class="field full"><label>Participants</label><div class="chk-row">${S.people.filter(p => p.org === S.ui.org && p.status !== 'Deactivated' && p.type === 'Employee').map(p => `<label class="check"><input type="checkbox" name="pt_${p.id}" ${a && (a.participants || []).includes(p.id) ? 'checked' : ''}> <span>${esc(p.name)}</span></label>`).join('')}</div></div></div>`; }
function raRead(m, v) { return { title: v.title, docNo: v.docNo || '', type: v.type, site: v.site, dept: v.dept, activity: v.activity, date: v.date, assessor: v.assessor, asset: v.asset || null, substance: v.substance || null, participants: S.people.filter(p => m.querySelector(`[name=pt_${p.id}]`) && m.querySelector(`[name=pt_${p.id}]`).checked).map(p => p.id) }; }
ACT.raRow = (el) => { const a = byId('riskAssessments', el.dataset.id), k = el.dataset.k != null ? +el.dataset.k : null, r = k != null ? a.rows[k] : null;
  const hz = (S.hazards || []).filter(h => h.org === a.org && (h.site === a.site || h.site === 'ALL'));
  openModal({ title: r ? 'Edit hazard' : 'Add a hazard to the assessment', size: 'wide', body: `<div class="form-grid">
    ${fld({ name: 'hazard', label: 'From the hazard register (optional)', type: 'select', options: opts(hz.map(h => ({ value: h.id, label: `${h.id} — ${h.title}` })), r ? r.hazard || '' : '', '— Not from the register —'), full: true })}
    ${fld({ name: 'step', label: 'Activity / task step', value: r ? r.step || '' : '', full: true, placeholder: 'e.g. Travel in picking aisles with MHE' })}
    ${fld({ name: 'title', label: 'Hazard (what can cause harm?)', value: r ? r.title : '', required: true, full: true })}
    ${fld({ name: 'risk', label: 'Risk (what can happen?)', value: r ? r.risk || '' : '', full: true })}${fld({ name: 'category', label: 'Category', type: 'select', options: opts(S.config.hazardCats, r ? r.category : '') })}
    ${fld({ name: 'exposed', label: 'Exposed persons', value: r ? r.exposed || '' : '' })}
    ${fld({ name: 'consequences', label: 'Consequence of the risk', type: 'textarea', rows: 2, value: r ? r.consequences || '' : '', full: true })}
    ${fld({ name: 'existing', label: 'Existing controls', type: 'textarea', rows: 2, value: r ? r.existing || '' : '', full: true })}
    ${lsFields('i', r && r.initial, 'Initial risk')}${lsFields('r', r && r.residual, 'Residual risk')}</div>
    <p class="muted" style="font-size:12px">Residual risk is the expected risk once the additional controls are in place. Leave it empty until the controls are decided.</p>`,
    onOpen: m => { const s = m.querySelector('[name=hazard]'); s.addEventListener('change', () => { const h = byId('hazards', s.value); if (!h) return; m.querySelector('[name=title]').value = h.title; m.querySelector('[name=category]').value = h.category; if (!m.querySelector('[name=exposed]').value) m.querySelector('[name=exposed]').value = h.exposed || ''; }); },
    buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); if (!v.il || !v.is) { toast('Rate the initial risk (likelihood and severity).', 'error'); return false; }
      const row = Object.assign(r || { id: 'r' + Math.random().toString(36).slice(2, 7), controls: [] }, { hazard: v.hazard || null, step: v.step, risk: v.risk, title: v.title, category: v.category, exposed: v.exposed, consequences: v.consequences, existing: v.existing, initial: { l: +v.il, s: +v.is }, residual: v.rl && v.rs ? { l: +v.rl, s: +v.rs } : null });
      if (r && JSON.stringify(r.residual) !== JSON.stringify(row.residual)) delete row.accepted;
      if (!r) a.rows.push(row); if (row.hazard) { const h = byId('hazards', row.hazard); if (h) { h.assessments = [...new Set((h.assessments || []).concat(a.id))]; if (h.status === 'Open') h.status = 'Assessed'; } }
      if (escalates(rowRisk(row)) && !row.escalated) { row.escalated = TODAY; const to = hseqManagers(a.org).concat(S.people.filter(p => p.org === a.org && p.sysRole === 'Managing Director').map(p => p.id)); queueEmail(to, 'actions', `${rBand(rowRisk(row)).name} risk: ${row.title} (${a.id})`, `${pname(S.ui.user)} rated "${row.title}" in ${a.id} ${a.title} as ${rBand(rowRisk(row)).name} (${rScore(rowRisk(row))}). ${rBand(rowRisk(row)).action || ''}`, '#/risk/' + a.id); addEvent('red', 'risk', `${rBand(rowRisk(row)).name} risk recorded`, `${row.title} — ${a.title}`, '#/risk/' + a.id, a.site, to); }
      log(`${r ? 'Updated' : 'Added'} hazard "${row.title}" in ${a.id}`, '#/risk/' + a.id); save(); rerender(); } }] }); };
ACT.raAccept = (el) => { const a = byId('riskAssessments', el.dataset.id), r = a.rows[+el.dataset.k]; openModal({ title: 'Accept the residual risk', sub: `${r.title}: residual risk ${rScore(r.residual)} (${rBand(r.residual).name}). The score does not decide this — record who accepts the risk and why.`, body: `<div class="form-grid">${fld({ name: 'by', label: 'Accepted by', type: 'select', options: personOptions(S.ui.user, p => !!p.sysRole), required: true })}${fld({ name: 'reason', label: 'Reason (professional judgement)', type: 'textarea', required: true, full: true })}</div>`,
  buttons: [{ label: 'Accept risk', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); r.accepted = { by: v.by, on: TODAY, reason: v.reason, recordedBy: S.ui.user }; log(`Residual risk of "${r.title}" in ${a.id} accepted by ${pname(v.by)}`, '#/risk/' + a.id); save(); rerender(); } }] }); };
ACT.raCtrl = (el) => { const a = byId('riskAssessments', el.dataset.id), r = a.rows[+el.dataset.k]; openModal({ title: 'Add a control', sub: r.title, body: `<div class="form-grid">
    ${fld({ name: 'desc', label: 'Control', type: 'textarea', rows: 2, required: true, full: true })}${fld({ name: 'category', label: 'Hierarchy of controls', type: 'select', options: opts(HIERARCHY), required: true })}
    ${fld({ name: 'owner', label: 'Responsible person', type: 'select', options: personOptions((site(a.site) || {}).manager, p => !!p.sysRole), required: true })}${fld({ name: 'due', label: 'Target date', type: 'date', value: addDays(TODAY, 30), required: true })}
    ${fld({ name: 'track', label: 'Track it as a corrective action (reminders, evidence and verification)', type: 'checkbox', value: true, full: true })}</div>${HIERARCHY.indexOf('PPE') ? `<p class="muted" style="font-size:12px">Prefer controls higher in the hierarchy: elimination, substitution and engineering controls before administrative controls and PPE.</p>` : ''}`,
  buttons: [{ label: 'Add control', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); const c = { desc: v.desc, category: v.category, owner: v.owner, due: v.due, status: 'Planned', evidence: [] };
    if (v.track) c.action = createAction({ source: 'Risk assessment', sourceId: a.id, title: `${a.title}: ${v.desc}`.slice(0, 140), action: `${v.category}: ${v.desc}`, owner: v.owner, due: v.due, priority: escalates(rowRisk(r)) ? 'High' : 'Medium', site: a.site }).id;
    (r.controls = r.controls || []).push(c); log(`Added control to "${r.title}" in ${a.id}`, '#/risk/' + a.id); save(); rerender(); } }] }); };
ACT.raCtrlUpd = (el) => { const a = byId('riskAssessments', el.dataset.id), r = a.rows[+el.dataset.k], c = r.controls[+el.dataset.i];
  openModal({ title: 'Update control', sub: c.desc, body: `<div class="form-grid">${fld({ name: 'status', label: 'Status', type: 'select', options: opts(CTRL_STATUS.filter(s => s !== 'Verified' || can('action.verify')), c.status), required: true })}${fld({ name: 'file', label: 'Evidence', type: 'file', full: true })}${fld({ name: 'note', label: 'Note', full: true })}</div>`,
    buttons: [{ label: 'Save', cls: 'primary', onClick: m => { const v = readForm(m); if (['Implemented', 'Verified'].includes(v.status) && !v.file && !(c.evidence || []).length && !c.action) { toast('Upload evidence that the control is in place.', 'error'); return false; }
      c.status = v.status; if (v.file) (c.evidence = c.evidence || []).push(v.file); if (v.status === 'Verified') { c.verifiedBy = S.ui.user; c.verifiedOn = TODAY; } (c.history = c.history || []).push({ ts: nowTs(), by: S.ui.user, status: v.status, note: v.note }); log(`Control "${c.desc}" in ${a.id}: ${v.status}`, '#/risk/' + a.id); save(); rerender(); } }] }); };
ACT.raApprove = (el) => { const a = byId('riskAssessments', el.dataset.id); if (!(a.rows || []).length) { toast('Add at least one hazard first.', 'error'); return; }
  openModal({ title: 'Approve the risk assessment', body: fld({ name: 'reviewDate', label: 'Review by', type: 'date', value: addMonths(TODAY, 12), required: true }), buttons: [{ label: 'Approve', cls: 'primary', onClick: m => { const v = readForm(m); Object.assign(a, { status: 'Approved', approvedBy: S.ui.user, approvedOn: TODAY, reviewDate: v.reviewDate }); log(`Approved risk assessment ${a.id}`, '#/risk/' + a.id); save(); rerender(); } }] }); };
ACT.raReview = (el) => { const a = byId('riskAssessments', el.dataset.id);
  openModal({ title: 'Record a review', sub: 'A review keeps the current version as history and continues with a new version you can update.', body: `<div class="form-grid">
    ${fld({ name: 'reason', label: 'Reason', type: 'select', options: opts(RV_REASONS), required: true })}
    ${fld({ name: 'ref', label: 'Incident, change or control concerned', type: 'select', options: opts(S.incidents.filter(i => inSite(i, 'ALL')).slice(-20).map(i => ({ value: i.id, label: `${i.id} — ${i.title}` })), '', '— None / not an incident —') })}
    ${fld({ name: 'outcome', label: 'Outcome of the review', type: 'textarea', required: true, full: true })}
    ${fld({ name: 'newVersion', label: 'Changes are needed — create a new version to update', type: 'checkbox', full: true })}
    ${fld({ name: 'reviewDate', label: 'Next review', type: 'date', value: addMonths(TODAY, 12), required: true })}</div>`,
    buttons: [{ label: 'Save review', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); const rv = { date: TODAY, by: S.ui.user, reason: v.reason, ref: v.ref, outcome: v.outcome };
      if (v.newVersion) { const n = JSON.parse(JSON.stringify(a)); Object.assign(n, { id: nextId('RA-', 'riskAssessments'), version: (a.version || 1) + 1, status: 'Draft', supersedes: a.id, date: TODAY, reviewDate: v.reviewDate, approvedBy: null, approvedOn: null, created: TODAY }); n.reviews = (a.reviews || []).concat([Object.assign({ prev: a.id }, rv)]); n.rows.forEach(r => { delete r.accepted; delete r.escalated; });
        a.status = 'Superseded'; a.supersededBy = n.id; S.riskAssessments.push(n); log(`Reviewed ${a.id} (${v.reason}); new version ${n.id} created`, '#/risk/' + n.id); save(); navigate('#/risk/' + n.id); }
      else { (a.reviews = a.reviews || []).push(rv); a.reviewDate = v.reviewDate; log(`Reviewed ${a.id} (${v.reason}): no changes needed`, '#/risk/' + a.id); save(); rerender(); } } }] }); };
document.addEventListener('change', async e => { const t = e.target; if (t.dataset && t.dataset.raev) { const a = byId('riskAssessments', t.dataset.raev); (a.evidence = a.evidence || []).push(fileMeta(t.files[0])); log(`Uploaded evidence to ${a.id}`, '#/risk/' + a.id); save(); rerender(); } });

/* ---------------- Hazard register ---------------- */
const HZ_F = {
  fcat: { all: 'All categories', list: () => S.config.hazardCats.map(c => ({ value: c, label: c })), test: (h, v) => h.category === v },
  fsite: { all: 'All branches', list: () => orgSites().length > 1 ? branchOpts() : [], test: (h, v) => h.site === v },
  fstatus: { all: 'All statuses', list: () => ['Open', 'Assessed', 'Controlled', 'Closed'].map(s => ({ value: s, label: s })), test: (h, v) => h.status === v }
};
function hazardsHtml(H, q) { const rows = regFilter(H, q, HZ_F).sort((a, b) => b.identifiedOn.localeCompare(a.identifiedOn));
  return `<div class="card cq-wide">${regFilterBar('#/risk/hazards', q, H, rows.length, HZ_F, 'Search hazard, location, activity…')}<div class="card-body flush">${rows.length ? `<div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Hazard</th><th>Category</th><th>Branch / location</th><th>Activity</th><th>Identified</th><th>Linked</th><th>Status</th></tr></thead><tbody>
    ${rows.map(h => `<tr class="rowlink" data-href="#/risk/${h.id}"><td data-label="Hazard"><span class="mono">${h.id}</span><div class="t-title">${esc(h.title)}</div></td><td data-label="Category">${esc(h.category)}</td><td data-label="Branch">${esc(sname(h.site))}<div class="t-sub">${esc(h.location || '')}</div></td><td data-label="Activity">${esc(h.activity || '—')}</td><td data-label="Identified">${fmt(h.identifiedOn)}<div class="t-sub">${esc(pname(h.identifiedBy))}</div></td><td data-label="Linked">${[(h.assessments || []).length && `${h.assessments.length} RA`, h.incident && h.incident, h.inspection && h.inspection].filter(Boolean).join(' · ') || '—'}</td><td data-label="Status">${badge(h.status, h.status === 'Open' ? 'amber' : h.status === 'Closed' ? 'grey' : 'green', true)}</td></tr>`).join('')}
  </tbody></table></div>` : emptyList(H.length ? 'No hazards match these filters.' : 'No hazards recorded yet.')}</div></div>`; }
function hazardDetail(id) { const h = byId('hazards', id); if (!h || h.org !== S.ui.org) return ROUTES.notfound();
  const html = `<div class="status-hero"><div><div class="sh-id">${h.id} · ${esc(h.category)} · ${esc(sname(h.site))}</div><h1 style="margin:2px 0 6px">${esc(h.title)}</h1>${badge(h.status, h.status === 'Open' ? 'amber' : 'green')}</div>
    <div class="sh-actions">${canRisk() ? `<button class="btn" data-act="hzEdit" data-id="${h.id}">${icon('edit', 'sm')} Edit</button>${h.status !== 'Closed' ? `<button class="btn" data-act="hzStatus" data-id="${h.id}">Change status</button>` : ''}` : ''}</div></div>
  <div class="detail"><div class="stack"><div class="card"><div class="card-body" style="padding-top:14px"><p>${esc(h.description || '')}</p>${(h.photos || []).length ? photoStrip(h.photos) : ''}</div></div>
    <div class="card"><div class="card-head"><h2>Risk assessments</h2></div><div class="card-body flush">${(h.assessments || []).length ? `<ul class="link-list">${h.assessments.map(id => { const a = byId('riskAssessments', id); return a ? `<li><a href="#/risk/${a.id}" class="mono">${a.id}</a> ${esc(a.title)} ${badge(raStatus(a), 'grey', true)}</li>` : ''; }).join('')}</ul>` : '<div class="card-body muted">Not assessed yet — add it to a risk assessment.</div>'}</div></div></div>
  <div class="stack"><div class="card"><div class="card-head"><h2>Details</h2></div><div class="card-body"><div class="kv"><div>Location</div><div>${esc(h.location || '—')}</div><div>Activity</div><div>${esc(h.activity || '—')}</div><div>Exposed persons</div><div>${esc(h.exposed || '—')}</div><div>Identified</div><div>${fmt(h.identifiedOn)} by ${esc(pname(h.identifiedBy))}</div>
    <div>Incident</div><div>${h.incident ? `<a href="#/incidents/${h.incident}">${h.incident}</a>` : '—'}</div><div>Inspection</div><div>${h.inspection ? `<a href="#/inspections/${h.inspection}">${h.inspection}</a>` : '—'}</div></div></div></div></div></div>`;
  return { title: h.id, nav: 'risk', crumbs: [['Risk Management', '#/risk/hazards'], [h.id, '#']], html }; }
function hzForm(h) { return `<div class="form-grid">
  ${fld({ name: 'title', label: 'Hazard', value: h ? h.title : '', required: true, full: true, placeholder: 'e.g. Pedestrians walking in forklift aisles' })}
  ${fld({ name: 'category', label: 'Category', type: 'select', options: opts(S.config.hazardCats, h ? h.category : ''), required: true })}
  ${fld({ name: 'site', label: 'Branch', type: 'select', options: siteOptions(h ? h.site : defaultSite(), false), required: true })}
  ${fld({ name: 'location', label: 'Location', value: h ? h.location || '' : '' })}${fld({ name: 'activity', label: 'Activity', value: h ? h.activity || '' : '' })}
  ${fld({ name: 'exposed', label: 'Exposed persons', value: h ? h.exposed || '' : '', full: true })}
  ${fld({ name: 'description', label: 'Description', type: 'textarea', value: h ? h.description || '' : '', full: true })}
  ${fld({ name: 'incident', label: 'Related incident', type: 'select', options: opts(S.incidents.filter(i => inSite(i, 'ALL')).map(i => ({ value: i.id, label: `${i.id} — ${i.title}` })), h ? h.incident || '' : '', '— None —') })}
  ${fld({ name: 'inspection', label: 'Related inspection', type: 'select', options: opts(S.inspections.filter(i => inSite(i, 'ALL')).slice(-30).map(i => ({ value: i.id, label: `${i.id} — ${i.target || ''} (${fmt(i.date)})` })), h ? h.inspection || '' : '', '— None —') })}
  ${h ? '' : fld({ name: 'photo', label: 'Photo', type: 'file', accept: 'image/*', capture: true, full: true })}</div>`; }
ACT.hzNew = (el) => { const pre = (el && el.dataset) || {}; openModal({ title: 'Record a hazard', body: hzForm(pre.incident ? { incident: pre.incident, site: (byId('incidents', pre.incident) || {}).site } : null), size: 'wide', buttons: [{ label: 'Record', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); S.hazards = S.hazards || [];
  const f = m.querySelector('[name=photo]').files[0], photos = []; if (f) { const pm = fileMeta(f); photos.push(pm); makeThumb(f).then(t => { pm.thumb = t; save(); }).catch(() => {}); }
  const h = { id: nextId('HZ-', 'hazards'), org: siteOrgOf(v.site), site: v.site, title: v.title, category: v.category, location: v.location, activity: v.activity, exposed: v.exposed, description: v.description, incident: v.incident || null, inspection: v.inspection || null, photos, identifiedBy: S.ui.user, identifiedOn: TODAY, status: 'Open', assessments: [] };
  S.hazards.push(h); const to = hseqManagers(h.org).concat([(site(h.site) || {}).manager]).filter(Boolean); queueEmail(to, 'actions', `Hazard recorded: ${h.title} (${sname(h.site)})`, `${pname(S.ui.user)} recorded a hazard: ${h.title}. ${h.description || ''}`, '#/risk/' + h.id);
  log(`Recorded hazard ${h.id}: ${h.title}`, '#/risk/' + h.id); save(); navigate('#/risk/' + h.id); } }] }); };
ACT.hzEdit = (el) => { const h = byId('hazards', el.dataset.id); openModal({ title: `Edit ${h.id}`, size: 'wide', body: hzForm(h), buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); Object.assign(h, { title: v.title, category: v.category, site: v.site, location: v.location, activity: v.activity, exposed: v.exposed, description: v.description, incident: v.incident || null, inspection: v.inspection || null }); log(`Edited hazard ${h.id}`, '#/risk/' + h.id); save(); rerender(); } }] }); };
ACT.hzStatus = (el) => { const h = byId('hazards', el.dataset.id); openModal({ title: 'Hazard status', body: `<div class="form-grid">${fld({ name: 'status', label: 'Status', type: 'select', options: opts(['Open', 'Assessed', 'Controlled', 'Closed'], h.status) })}${fld({ name: 'note', label: 'Note', full: true })}</div>`, buttons: [{ label: 'Save', cls: 'primary', onClick: m => { const v = readForm(m); h.status = v.status; log(`Hazard ${h.id} → ${v.status}${v.note ? ': ' + v.note : ''}`, '#/risk/' + h.id); save(); rerender(); } }] }); };

/* ---------------- Risk matrix ---------------- */
function matrixGrid(counts) {
  const L = RM().likelihood, Sv = RM().severity;
  return `<div class="rm-wrap"><div class="rm-scroll"><table class="rm"><thead><tr><th class="rm-corner">Likelihood ↓ · Severity →</th>${Sv.map((s, j) => `<th>${j + 1}<div class="t-sub">${esc(s.name)}</div></th>`).join('')}</tr></thead><tbody>
    ${L.map((l, i0) => { const i = L.length - i0; return `<tr><th>${i}<div class="t-sub">${esc(L[i - 1].name)}</div></th>${Sv.map((s, j) => { const r = { l: i, s: j + 1 }, b = rBand(r), n = counts ? counts[i + '-' + (j + 1)] || 0 : null; return `<td class="rc-${b.tone}" title="${esc(b.name)} (${i * (j + 1)})">${i * (j + 1)}${n ? `<b class="rm-n">${n}</b>` : ''}</td>`; }).join('')}</tr>`; }).join('')}
  </tbody></table></div><div class="rm-bands">${RM().bands.map(b => `<div><span class="risk-chip rc-${b.tone}">${esc(b.name)} (up to ${b.max})</span> ${esc(b.action || '')}</div>`).join('')}<p class="t-sub">Escalated to the HSEQ Manager and Managing Director from: <b>${esc(RM().escalateFrom)}</b>.</p></div></div>`;
}
function matrixPageHtml(rows) { const counts = {}; rows.forEach(x => { const r = rowRisk(x.r); if (rScore(r)) counts[r.l + '-' + r.s] = (counts[r.l + '-' + r.s] || 0) + 1; });
  return `<div class="card"><div class="card-head"><h2>Current risks on the matrix</h2><span class="ch-sub">Number of hazards per cell (residual risk where assessed)</span>${can('admin') ? `<a class="btn sm" href="#/admin/riskmatrix">${icon('settings', 'sm')} Configure</a>` : ''}</div><div class="card-body">${matrixGrid(counts)}</div></div>`; }
function riskMatrixAdminHtml(ro) { const M = RM();
  return `<div class="alert info">${icon('info')}<div>The matrix used in every risk assessment. Change the descriptions, the bands (highest score in each band) and the band from which risks are escalated. A score never decides on its own that a risk is acceptable.</div></div>
  <div class="card mb"><div class="card-body">${matrixGrid(null)}</div></div>
  ${ro ? '' : `<form id="rmForm" class="card"><div class="card-body form-grid" style="padding-top:14px">
    ${M.likelihood.map((x, i) => fld({ name: 'l' + i, label: `Likelihood ${i + 1}`, value: x.name, required: true })).join('')}
    ${M.severity.map((x, i) => fld({ name: 's' + i, label: `Severity ${i + 1}`, value: x.name, required: true })).join('')}
    ${M.bands.map((b, i) => `${fld({ name: 'bn' + i, label: `Band ${i + 1} name`, value: b.name, required: true })}${fld({ name: 'bm' + i, label: `Band ${i + 1} up to score`, type: 'number', min: 1, max: 25, value: b.max, required: true })}${fld({ name: 'ba' + i, label: `Band ${i + 1} required action`, value: b.action || '', full: true })}`).join('')}
    ${fld({ name: 'esc', label: 'Escalate from band', type: 'select', options: opts(M.bands.map(b => b.name), M.escalateFrom) })}
    <div class="field full"><button type="button" class="btn primary" data-act="rmSave">Save matrix</button></div></div></form>`}`; }
ACT.rmSave = () => { const m = document.getElementById('rmForm'); if (!validateForm(m)) return; const v = readForm(m), M = RM();
  M.likelihood.forEach((x, i) => { x.name = v['l' + i]; }); M.severity.forEach((x, i) => { x.name = v['s' + i]; });
  const maxes = M.bands.map((b, i) => +v['bm' + i]); if (maxes.some((x, i) => i && x <= maxes[i - 1]) || maxes[maxes.length - 1] !== 25) { toast('Band limits must go up, and the last band must end at 25.', 'error'); return; }
  M.bands.forEach((b, i) => { b.name = v['bn' + i]; b.max = maxes[i]; b.action = v['ba' + i]; }); M.escalateFrom = v.esc; log('Updated the risk matrix', '#/admin/riskmatrix'); save(); toast('Risk matrix saved.'); rerender(); };

/* ---------------- Wiring ---------------- */
(() => { const c = NAV.find(x => x.group === 'Compliance'); if (c && !c.items.some(i => i[0] === 'risk')) c.items.push(['risk', 'Risk Management', 'risk']); })();
AREA_OF.risk = 'area.risk';
if (!TOP_ROUTES.includes('risk')) TOP_ROUTES.push('risk');
if (!SOURCE_MODULES.includes('Risk assessment')) SOURCE_MODULES.splice(SOURCE_MODULES.length - 1, 0, 'Risk assessment');
const _sourceLinkBeforeRisk = sourceLink;
sourceLink = function (a) { return a.source === 'Risk assessment' && byId('riskAssessments', a.sourceId) ? `<a href="#/risk/${a.sourceId}">${esc(a.sourceId)}</a>` : _sourceLinkBeforeRisk(a); };
const _needsBackBeforeRisk = needsBack;
needsBack = function (parts) { if (parts[0] === 'risk' && ['assessments', 'hazards', 'matrix'].includes(parts[1])) return false; return _needsBackBeforeRisk(parts); };
const _myTasksBeforeRisk = myTasks;
myTasks = function () { const out = _myTasksBeforeRisk(), uid = S.ui.user;
  raList().filter(a => a.assessor === uid && raOverdue(a)).forEach(a => out.push({ title: `Review risk assessment ${a.id}: ${a.title}`, sub: `Review was due ${fmt(a.reviewDate)}`, link: '#/risk/' + a.id, sev: 'red' }));
  raList().filter(a => a.status !== 'Superseded').forEach(a => (a.rows || []).forEach(r => (r.controls || []).filter(c => c.owner === uid && !c.action && !['Implemented', 'Verified'].includes(c.status)).forEach(c => out.push({ title: `Risk control: ${c.desc}`, sub: `${a.id} · due ${fmt(c.due)}`, link: '#/risk/' + a.id, sev: daysTo(c.due) < 0 ? 'red' : 'blue' }))));
  if (canRisk()) { const n = (S.hazards || []).filter(h => h.org === S.ui.org && h.status === 'Open' && inSite(h, S.ui.site)).length; if (n) out.push({ title: `${n} hazard(s) not yet assessed`, sub: 'Add them to a risk assessment', link: '#/risk/hazards?fstatus=Open', sev: 'amber' }); }
  return out; };
// "Record a hazard" from an incident
const _incBeforeRisk = ROUTES.incidents;
ROUTES.incidents = (p, q) => { const r = _incBeforeRisk(p, q); if (r && r.html && p[0] && /^INC-/.test(p[0]) && can('incident.investigate')) r.html = r.html.replace('<div class="sh-actions">', `<div class="sh-actions"><button class="btn" data-act="hzNew" data-incident="${p[0]}">${icon('alert', 'sm')} Record hazard</button>`); return r; };

/* ---------------- Demo data and matrix ---------------- */
MIGRATIONS.push(() => {
  if (S.migr && S.migr.risk) return; S.migr = S.migr || {}; S.migr.risk = true;
  addArea('area.risk', 'Risk management', 'area.legal', 'area.documents');
  addPerm('risk.manage', 'Manage risk assessments and the hazard register', ['HSEQ Manager', 'Safety Consultant', 'Branch Manager']);
  S.config.hazardCats = S.config.hazardCats || ['Physical', 'Mechanical', 'Electrical', 'Chemical', 'Biological', 'Ergonomic', 'Psychosocial', 'Fire and explosion', 'Working at heights', 'Manual handling', 'Vehicles and mobile equipment'];
  S.config.riskMatrix = S.config.riskMatrix || {
    likelihood: [{ name: 'Rare' }, { name: 'Unlikely' }, { name: 'Possible' }, { name: 'Likely' }, { name: 'Almost certain' }],
    severity: [{ name: 'Insignificant' }, { name: 'Minor' }, { name: 'Moderate' }, { name: 'Major' }, { name: 'Catastrophic' }],
    bands: [{ name: 'Low', max: 4, tone: 'green', action: 'Manage by routine procedures.' }, { name: 'Medium', max: 9, tone: 'amber', action: 'Additional controls within a reasonable time; monitor.' }, { name: 'High', max: 16, tone: 'orange', action: 'Senior management attention; reduce the risk before work continues where possible.' }, { name: 'Critical', max: 25, tone: 'red', action: 'Stop or do not start the work until the risk is reduced.' }],
    escalateFrom: 'High' };
  S.hazards = S.hazards || []; S.riskAssessments = S.riskAssessments || [];
  const H = (id, o) => { if (!byId('hazards', id)) S.hazards.push(Object.assign({ id, org: 'ORG-1', photos: [], identifiedOn: addDays(TODAY, -90), identifiedBy: 'P-002', assessments: [], status: 'Assessed' }, o)); };
  H('HZ-001', { site: 'S-JHB', title: 'Pedestrians in forklift aisles', category: 'Vehicles and mobile equipment', location: 'Warehouse aisles 1–6', activity: 'Order picking', exposed: 'Pickers, visitors', assessments: ['RA-001'] });
  H('HZ-002', { site: 'S-JHB', title: 'Battery charging — hydrogen gas and acid', category: 'Fire and explosion', location: 'Charging bay', activity: 'Battery charging', exposed: 'Operators', assessments: ['RA-001'] });
  H('HZ-003', { site: 'S-DBN', title: 'Solvent degreaser vapour', category: 'Chemical', location: 'Workshop degreasing bay', activity: 'Parts cleaning', exposed: 'Technicians', assessments: ['RA-002'] });
  H('HZ-004', { site: 'S-CPT', title: 'Damaged racking upright in bay 4', category: 'Mechanical', location: 'Warehouse bay 4', activity: 'Storage', exposed: 'Storepersons', identifiedOn: addDays(TODAY, -6), identifiedBy: 'P-016', status: 'Open', assessments: [] });
  const A = (id, o) => { if (!byId('riskAssessments', id)) S.riskAssessments.push(Object.assign({ id, org: 'ORG-1', version: 1, reviews: [], evidence: [], participants: [], status: 'Approved', approvedBy: 'P-002', created: addDays(TODAY, -200) }, o)); };
  A('RA-001', { site: 'S-JHB', dept: 'Warehouse & Logistics', title: 'Warehouse forklift operations', type: 'Activity-based', activity: 'Receiving, storage and dispatch with forklifts', date: addDays(TODAY, -200), assessor: 'P-002', participants: ['P-007', 'P-009'], approvedOn: addDays(TODAY, -198), reviewDate: addDays(TODAY, 165),
    rows: [{ id: 'r1', hazard: 'HZ-001', title: 'Pedestrians in forklift aisles', category: 'Vehicles and mobile equipment', exposed: 'Pickers, visitors', consequences: 'Struck by forklift — serious injury or death', existing: 'Speed limit 10 km/h; reflective vests', initial: { l: 4, s: 5 }, residual: { l: 2, s: 5 }, accepted: { by: 'P-001', on: addDays(TODAY, -150), reason: 'Barriers and marked walkways installed; residual risk monitored by weekly inspections.' },
      controls: [{ desc: 'Physical barriers between pedestrian walkways and aisles', category: 'Engineering controls', owner: 'P-005', due: addDays(TODAY, -160), status: 'Verified', evidence: [{ name: 'Barriers_installed.jpg', type: 'image/jpeg', size: 80000, seeded: true }] }, { desc: 'Pedestrian exclusion zones marked on the floor', category: 'Administrative controls', owner: 'P-007', due: addDays(TODAY, -150), status: 'Implemented', evidence: [] }] },
      { id: 'r2', hazard: 'HZ-002', title: 'Battery charging — hydrogen gas and acid', category: 'Fire and explosion', exposed: 'Operators', consequences: 'Explosion, acid burns', existing: 'Charging bay ventilated; no smoking signs', initial: { l: 3, s: 4 }, residual: { l: 2, s: 4 }, controls: [{ desc: 'Install an eyewash station at the charging bay', category: 'Engineering controls', owner: 'P-005', due: addDays(TODAY, -10), status: 'In progress', evidence: [] }] }] });
  A('RA-002', { site: 'S-DBN', dept: 'Workshop & Service', title: 'Workshop parts degreasing', type: 'Hazardous substance', activity: 'Cleaning parts with solvent degreaser', date: addDays(TODAY, -400), assessor: 'P-002', approvedOn: addDays(TODAY, -398), reviewDate: addDays(TODAY, -35),
    rows: [{ id: 'r1', hazard: 'HZ-003', title: 'Solvent degreaser vapour', category: 'Chemical', exposed: 'Technicians', consequences: 'Dizziness, dermatitis, fire', existing: 'Gloves and goggles', initial: { l: 4, s: 3 }, residual: null, controls: [{ desc: 'Replace solvent degreaser with a water-based cleaner', category: 'Substitution', owner: 'P-003', due: addDays(TODAY, 20), status: 'Planned', evidence: [] }] }] });
});

/* ---------------- View, print and PDF in the company's risk assessment layout ----------------
   Laid out like the owner's own risk assessment form (e.g. "RA 004 Order Picking – Pallet Racking"):
   1. Controlled header (Doc name, Doc no, Rev no, Date, Page) and the assessment band
      (process/activity, RA date, RA name, type of risk assessment).
   2. The risk matrix (impact × probability) with the response required for each rating level,
      and the hierarchy of controls.
   3. The table: activities / task steps · hazards (what can cause harm?) · risks (what can happen?)
      · consequence · PRE-RISK rating I, P, RR · hierarchy of controls · controls (preventative
      measures) · POST-RISK rating I, P, RR.
   4. Originator and team-member signatures (signed on the screen, or on paper).
   I = impact (severity), P = probability (likelihood), RR = risk rating (I × P). */
const RA_HIER = [['Elimination', 'Physically remove the hazard'], ['Substitution', 'Replace the hazard'], ['Engineering controls', 'Isolate people from the hazard'], ['Administrative controls', 'Change the way people work'], ['PPE', 'Protect the worker with personal protective equipment']];
const RA_TONE_BG = { green: '#5DB348', amber: '#FFE94D', orange: '#F6971E', red: '#E8312E' }, RA_TONE_FG = { green: '#0B2A06', amber: '#3A3000', orange: '#2D1600', red: '#fff' };
const raDocNo = a => a.docNo || a.id.replace(/^RA-/, '');
const raRev = a => String(a.version || 1).padStart(2, '0');
const raSigs = a => a.signatures || {};
function raCell(r) { if (!r || !r.l) return '<td class="rr" colspan="3"><span class="muted">—</span></td>'; const b = rBand(r); return `<td class="rr">${r.s}</td><td class="rr">${r.l}</td><td class="rr rr-v" style="background:${RA_TONE_BG[b.tone]};color:${RA_TONE_FG[b.tone]}" title="${esc(b.name)}">${rScore(r)}</td>`; }
function raMatrixHtml() {
  const L = RM().likelihood, Sv = RM().severity;
  return `<table class="ra-mx"><thead><tr><th colspan="2" class="mx-corner">Impact →</th>${Sv.map((s, j) => `<th>${j + 1}<small>${esc(s.name)}</small></th>`).join('')}</tr></thead><tbody>
    ${L.map((l, i0) => { const i = L.length - i0; return `<tr>${i0 === 0 ? `<th rowspan="${L.length}" class="mx-side"><span>Probability</span></th>` : ''}<th>${i}<small>${esc(L[i - 1].name)}</small></th>${Sv.map((s, j) => { const b = rBand({ l: i, s: j + 1 }); return `<td style="background:${RA_TONE_BG[b.tone]};color:${RA_TONE_FG[b.tone]}">${esc(b.name)}<small>${i * (j + 1)}</small></td>`; }).join('')}</tr>`; }).join('')}
  </tbody></table>
  <table class="ra-lvl"><thead><tr><th>Rating level</th><th>Response required for risks identified</th></tr></thead><tbody>${RM().bands.slice().reverse().map(b => `<tr><td style="background:${RA_TONE_BG[b.tone]};color:${RA_TONE_FG[b.tone]}"><b>${esc(b.name)}</b><small>up to ${b.max}</small></td><td>${esc(b.action || '')}</td></tr>`).join('')}</tbody></table>`;
}
function raHierHtml() { return `<div class="ra-hier"><div class="rh-t">Hierarchy of hazard controls</div>${RA_HIER.map(([n, d], i) => `<div class="rh-row"><div class="rh-bar rh-${i}" style="width:${100 - i * 13}%">${esc(n)}</div><small>${esc(d)}</small></div>`).join('')}<div class="rh-foot"><span>Most effective</span><span>Least effective</span></div></div>`; }
function raViewHtml(a) {
  const org = orgOf(a.org || S.ui.org), st = raStatus(a), sg = raSigs(a), canSign = pid => a.status !== 'Superseded' && (canRisk() || S.ui.user === pid);
  const sigCell = pid => sg[pid] ? `<span class="sig-show"><img src="${sg[pid].image}" alt="Signature of ${esc(sg[pid].name)}"></span>` : canSign(pid) ? `<button class="btn sm no-print" data-act="raSign" data-id="${a.id}" data-p="${pid}">${icon('edit', 'sm')} Sign</button>` : '';
  const person = pid => byId('people', pid);
  const team = (a.participants || []).filter(x => x !== a.assessor);
  const ctrls = r => [r.existing ? `<div>${esc(r.existing)}</div>` : '', ...(r.controls || []).map(c => `<div class="rc-add">${esc(c.desc)}<small>${esc(pname(c.owner))}${c.due ? ' · ' + fmt(c.due) : ''} · ${esc(c.status)}</small></div>`)].join('') || '—';
  const hier = r => [...new Set((r.controls || []).map(c => c.category))].map(esc).join('<br>') || '—';
  return `<div class="no-print btn-row mb ra-view-bar"><button class="btn" data-act="print">${icon('print', 'sm')} Print</button><button class="btn primary" data-act="raPdf" data-id="${a.id}">${icon('download', 'sm')} Download PDF</button>${a.status === 'Superseded' ? '<span class="badge grey">Superseded version</span>' : ''}</div>
  <div class="screen-paper print-doc ra-view">
    <table class="ra-hd"><tbody><tr><td rowspan="3" class="ra-logo">${orgMark(org, 'doc')}<b>${esc(org.short)}</b></td><th>Doc name:</th><td colspan="5" class="c">${esc(a.title)}</td></tr>
      <tr><th>Doc no:</th><td colspan="5" class="c">${esc(raDocNo(a))}</td></tr>
      <tr><th>Rev no:</th><td class="c">${raRev(a)}</td><th>Date:</th><td class="c">${fmt(a.date)}</td><th class="hd-st">Status:</th><td class="c hd-st">${esc(st)}</td></tr></tbody></table>
    <table class="ra-band"><tbody><tr><th>Process / activity:</th><td><b>${esc(a.activity || a.title)}</b></td><th>RA date:</th><td><b>${fmt(a.date)}</b></td></tr>
      <tr><th>RA name:</th><td>${esc(pname(a.assessor))}</td><th>Type of risk assessment:</th><td>${esc(a.type)}</td></tr>
      <tr><th>Branch / department:</th><td>${esc(sname(a.site))}${a.dept ? ' · ' + esc(a.dept) : ''}</td><th>Next review:</th><td>${a.reviewDate ? fmt(a.reviewDate) : '—'}</td></tr></tbody></table>
    <div class="ra-p1"><div><div class="ra-h">Risk matrix</div>${raMatrixHtml()}</div>${raHierHtml()}</div>
    <div class="ra-tblwrap"><table class="ra-tbl"><thead><tr><th rowspan="2">Activities / task steps</th><th rowspan="2">Hazards<small>(What can cause harm?)</small></th><th rowspan="2">Risks<small>(What can happen?)</small></th><th rowspan="2">Consequence of risk</th><th colspan="3">Pre-risk rating</th><th rowspan="2">Hierarchy of controls</th><th rowspan="2">Controls<small>(Preventative measures)</small></th><th colspan="3">Post-risk rating</th></tr>
      <tr><th class="ip">I</th><th class="ip">P</th><th class="ip">RR</th><th class="ip">I</th><th class="ip">P</th><th class="ip">RR</th></tr></thead>
      <tbody>${(a.rows || []).map(r => `<tr><td data-l="Activity / task step">${esc(r.step || '—')}</td><td data-l="Hazard"><b>${esc(r.title)}</b>${r.category ? `<small>${esc(r.category)}</small>` : ''}</td><td data-l="Risk">${esc(r.risk || '—')}</td><td data-l="Consequence">${esc(r.consequences || '—')}${r.exposed ? `<small>Exposed: ${esc(r.exposed)}</small>` : ''}</td>${raCell(r.initial)}<td data-l="Hierarchy">${hier(r)}</td><td data-l="Controls">${ctrls(r)}${r.accepted ? `<small class="rc-acc">Residual risk accepted by ${esc(pname(r.accepted.by))}, ${fmt(r.accepted.on)}: ${esc(r.accepted.reason)}</small>` : ''}</td>${raCell(r.residual)}</tr>`).join('') || '<tr><td colspan="12" class="muted">No hazards assessed yet.</td></tr>'}</tbody></table></div>
    <p class="ra-key">I = impact (severity) · P = probability (likelihood) · RR = risk rating (I × P). A score never decides on its own that a risk is acceptable; residual risk is accepted by a named person.</p>
    <table class="ra-sig o"><thead><tr><th colspan="4">Originator</th></tr><tr><th>Name</th><th>Occupation</th><th>Date</th><th>Signature</th></tr></thead><tbody>
      <tr><td>${esc(pname(a.assessor))}</td><td>${esc((person(a.assessor) || {}).jobTitle || '')}</td><td>${sg[a.assessor] ? fmt(sg[a.assessor].date) : ''}</td><td>${sigCell(a.assessor)}</td></tr></tbody></table>
    <table class="ra-sig t"><thead><tr><th colspan="4">Team members signatures</th></tr><tr><th>Name</th><th>Occupation</th><th>Date</th><th>Signature</th></tr></thead><tbody>
      ${team.map(pid => `<tr><td>${esc(pname(pid))}</td><td>${esc((person(pid) || {}).jobTitle || '')}</td><td>${sg[pid] ? fmt(sg[pid].date) : ''}</td><td>${sigCell(pid)}</td></tr>`).join('')}${'<tr class="blank"><td></td><td></td><td></td><td></td></tr>'.repeat(Math.max(1, 3 - team.length))}</tbody></table>
    ${a.approvedBy ? `<p class="ra-key">Approved by ${esc(pname(a.approvedBy))} on ${fmt(a.approvedOn)}.</p>` : ''}
    <p class="muted" style="font-size:10px;margin-top:10px">Generated by the VDW HSEQ Management System prototype from demonstration data on ${fmt(TODAY)}. It does not by itself show legal compliance.</p>
  </div>`;
}
const _riskBeforeView = ROUTES.risk;
ROUTES.risk = (p, q) => {
  if (p[0] && /^RA-/.test(p[0]) && p[1] === 'view') { const a = byId('riskAssessments', p[0]); if (!a || a.org !== S.ui.org) return ROUTES.notfound();
    return { title: a.id + ' · view', nav: 'risk', crumbs: [['Risk Management', '#/risk'], [a.id, '#/risk/' + a.id], ['View and print', '#']], html: raViewHtml(a) }; }
  const r = _riskBeforeView(p, q);
  if (r && r.html && p[0] && /^RA-/.test(p[0])) { const a = byId('riskAssessments', p[0]), need = a ? raSignNeeded(a) : [];
    r.html = r.html.replace('<div class="sh-actions">', `<div class="sh-actions"><a class="btn keep" href="#/risk/${p[0]}/view">${icon('eye', 'sm')} View</a>`);
    if (a && need.length && a.status !== 'Superseded') r.html = r.html.replace('<div class="detail">', `<div class="alert info">${icon('edit')}<div>Signatures outstanding: ${need.map(pname).map(esc).join(', ')}. <a href="#/risk/${a.id}/view">Open the risk assessment to sign</a>.</div></div><div class="detail">`); }
  return r;
};
const raSignNeeded = a => [a.assessor, ...(a.participants || [])].filter((x, i, arr) => x && arr.indexOf(x) === i && !raSigs(a)[x]);

/* Signing: the originator and each team member sign on the screen. A person signs for
   themselves; the assessor (risk managers) can also collect signatures in person on their device. */
const RASIG = { sig: null };
ACT.raSign = (el) => { const a = byId('riskAssessments', el.dataset.id), pid = el.dataset.p, who = pid === a.assessor ? 'originator' : 'team member';
  RASIG.sig = null;
  openModal({ title: `Sign as ${who}`, sub: `${pname(pid)} · ${a.id} ${a.title}`, body: `<label class="check"><input type="checkbox" id="raAck"> <span>I took part in this risk assessment, and I understand the hazards, the risks and the controls in it.</span></label>
    <div class="field full mt-s" id="raSigField"><label for="raSig">Signature of ${esc(pname(pid))}<span class="req">*</span></label><div class="sig-wrap"><canvas id="raSig" class="sig-pad"></canvas><div class="sig-foot"><span>${esc(pname(pid))} · ${fmt(TODAY)}</span><button type="button" class="btn sm" data-act="raSigClear">Clear</button></div></div></div>
    ${pid !== S.ui.user ? `<p class="t-sub">Collected in person by ${esc(pname(S.ui.user))}. ${esc(pname(pid))} signs on this screen.</p>` : ''}`,
    onOpen: () => initSigPad('raSig', RASIG, 'sig', 'raSigField'),
    buttons: [{ label: 'Sign', cls: 'primary', onClick: () => { if (!document.getElementById('raAck').checked) { toast('Tick the confirmation first.', 'error'); return false; } if (!RASIG.sig) { document.getElementById('raSigField').classList.add('invalid'); toast('Sign in the box.', 'error'); return false; }
      a.signatures = a.signatures || {}; const pp = byId('people', pid) || {};
      a.signatures[pid] = { name: pname(pid), occupation: pp.jobTitle || '', date: TODAY, ts: nowTs(), image: RASIG.sig, collectedBy: S.ui.user, role: who };
      log(`${pname(pid)} signed risk assessment ${a.id} as ${who}${pid !== S.ui.user ? ` (collected by ${pname(S.ui.user)})` : ''}`, '#/risk/' + a.id); RASIG.sig = null; save(); toast('Signed.'); rerender(); } }] }); };
ACT.raSigClear = () => { RASIG.sig = null; const c = document.getElementById('raSig'); if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height); };
const _myTasksBeforeRaSig = myTasks;
const raToSign = (uid = S.ui.user) => (S.riskAssessments || []).filter(a => a.org === S.ui.org && a.status !== 'Superseded' && raSignNeeded(a).includes(uid));
myTasks = function () { const out = _myTasksBeforeRaSig();
  raToSign().forEach(a => out.push({ title: `Sign the risk assessment: ${a.title}`, sub: `${a.id} · ${a.assessor === S.ui.user ? 'as originator' : 'as team member'} — read it, then sign`, link: `#/myra/${a.id}`, sev: 'amber' })); return out; };

/* "My risk assessments": everyone (employees too) can open the risk assessments they took part
   in, read them and sign as originator or team member. */
ROUTES.myra = (p) => {
  const mine = (S.riskAssessments || []).filter(a => a.org === S.ui.org && a.status !== 'Superseded' && (a.assessor === S.ui.user || (a.participants || []).includes(S.ui.user)));
  if (p[0]) { const a = mine.find(x => x.id === p[0]); if (!a) return ROUTES.notfound();
    const signed = raSigs(a)[S.ui.user];
    const top = signed ? `<div class="alert success no-print">${icon('checkCircle')}<div>You signed this risk assessment on ${fmt(signed.date)}.</div></div>`
      : `<div class="alert warn no-print">${icon('edit')}<div><b>Please read this risk assessment and sign it.</b> Your name is in the ${a.assessor === S.ui.user ? 'Originator' : 'Team members signatures'} table at the bottom. <button class="btn sm primary" data-act="raSign" data-id="${a.id}" data-p="${S.ui.user}">${icon('edit', 'sm')} Sign now</button></div></div>`;
    return { title: a.id, nav: isFieldUser() ? 'myra' : 'risk', crumbs: [['My risk assessments', '#/myra'], [a.id, '#']], html: top + raViewHtml(a) }; }
  const row = a => { const sg = raSigs(a)[S.ui.user]; return `<li><a href="#/myra/${a.id}"><div><b>${esc(a.title)}</b><small>${a.id} · ${esc(sname(a.site))} · ${a.assessor === S.ui.user ? 'Originator' : 'Team member'}</small></div>${sg ? `<span class="badge green">Signed ${fmt(sg.date)}</span>` : '<span class="badge amber">To sign</span>'}</a></li>`; };
  const todo = mine.filter(a => !raSigs(a)[S.ui.user]), done = mine.filter(a => raSigs(a)[S.ui.user]);
  const html = `<div class="emp"><div class="emp-head"><h1>My risk assessments</h1><p>Risk assessments you took part in. Read each one and sign it to confirm you understand the hazards, the risks and the controls.</p></div>
    <section class="emp-card"><header><h2>To sign (${todo.length})</h2></header>${todo.length ? `<ul class="emp-list ra-mine">${todo.map(row).join('')}</ul>` : '<p class="muted" style="padding:0 16px 14px">Nothing to sign.</p>'}</section>
    <section class="emp-card"><header><h2>Signed (${done.length})</h2></header>${done.length ? `<ul class="emp-list ra-mine">${done.map(row).join('')}</ul>` : '<p class="muted" style="padding:0 16px 14px">None yet.</p>'}</section></div>`;
  return { title: 'My risk assessments', nav: isFieldUser() ? 'myra' : 'risk', crumbs: [['My risk assessments', '#']], html };
};
if (!FIELD_ROUTES.includes('myra')) FIELD_ROUTES.push('myra');

/* When an assessment is approved, everyone still to sign is told (e-mail and notification). */
const _raApproveBeforeSign = ACT.raApprove;
ACT.raApprove = (el) => { const a = byId('riskAssessments', el.dataset.id), was = a && a.status; const r = _raApproveBeforeSign(el);
  setTimeout(() => { if (!a || was === 'Approved' || a.status !== 'Approved') return; const to = raSignNeeded(a); if (!to.length) return;
    queueEmail(to, 'actions', `Please sign risk assessment ${a.id}: ${a.title}`, `You took part in risk assessment ${a.id} "${a.title}". Please open it, read it and sign it to confirm you understand the hazards, risks and controls.`, '#/myra/' + a.id);
    addEvent('amber', 'risk', 'Risk assessment to sign', `${a.id} ${a.title}`, '#/myra/' + a.id, a.site, to); save(); }, 0);
  return r; };

/* PDF: A4 landscape, in the same layout */
ACT.raPdf = async (el) => {
  const a = byId('riskAssessments', el.dataset.id); toast('Preparing the risk assessment…', 'info');
  try {
    const { PDFDocument, StandardFonts, rgb } = await ensurePdfLib();
    const pdf = await PDFDocument.create(), R = await pdf.embedFont(StandardFonts.Helvetica), B = await pdf.embedFont(StandardFonts.HelveticaBold);
    const W = 842, H = 595, M = 28, ink = rgb(0, 0, 0), mute = rgb(0.38, 0.42, 0.5), ln = rgb(0, 0, 0);
    const hex = h => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
    const BLUE = hex('#5B9BD5'), GOLD = hex('#FFC000'), org = orgOf(a.org || S.ui.org), pages = []; let pg, y;
    const T = (s, x, yy, o = {}) => pg.drawText(pdfSafe(s), { x, y: yy, size: o.size || 7.5, font: o.bold ? B : R, color: o.color || ink });
    const TC = (s, x, w, yy, o = {}) => { const f = o.bold ? B : R, sz = o.size || 7.5; T(s, x + (w - f.widthOfTextAtSize(pdfSafe(s), sz)) / 2, yy, o); };
    const box = (x, yy, w, h, fill) => pg.drawRectangle({ x, y: yy - h, width: w, height: h, borderColor: ln, borderWidth: 0.5, ...(fill ? { color: fill } : {}) });
    const wrap = (s, size, width, f = R) => { const out = []; String(pdfSafe(s || '')).split('\n').forEach(par => { let cur = ''; par.split(' ').forEach(w => { const t = cur ? cur + ' ' + w : w; if (f.widthOfTextAtSize(t, size) > width && cur) { out.push(cur); cur = w; } else cur = t; }); out.push(cur); }); return out; };
    let logo = null; if (org.logo) { try { const bytes = Uint8Array.from(atob(org.logo.split(',')[1]), c => c.charCodeAt(0)); logo = /png/.test(org.logo) ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes); } catch (e) { logo = null; } }
    const header = (p, n, total) => { pg = p; const top = H - M, x0 = M + 150, w = W - 2 * M - 150;
      box(M, top, 150, 54); if (logo) { const s = Math.min(130 / logo.width, 44 / logo.height); pg.drawImage(logo, { x: M + (150 - logo.width * s) / 2, y: top - 49, width: logo.width * s, height: logo.height * s }); } else TC(org.short, M, 150, top - 31, { size: 11, bold: true });
      box(x0, top, 60, 18); T('Doc Name:', x0 + 6, top - 12, { bold: true }); box(x0 + 60, top, w - 60, 18); TC(a.title, x0 + 60, w - 60, top - 12);
      box(x0, top - 18, 60, 18); T('Doc No:', x0 + 6, top - 30, { bold: true }); box(x0 + 60, top - 18, w - 60, 18); TC(raDocNo(a), x0 + 60, w - 60, top - 30);
      const c = (w - 60) / 6; box(x0, top - 36, 60, 18); T('Rev No:', x0 + 6, top - 48, { bold: true }); [[raRev(a)], ['Date:', 1], [fmt(a.date)], ['Page:', 1], [`Page ${n} of ${total}`]].forEach(([s, b], i) => { const wi = i === 4 ? c * 2 : c; const xx = x0 + 60 + c * i; box(xx, top - 36, wi, 18); TC(s, xx, wi, top - 48, { bold: !!b }); });
      pg.drawText(pdfSafe(`Demonstration data from the VDW HSEQ prototype · ${a.id} · does not by itself show legal compliance`), { x: M, y: 14, size: 6.5, font: R, color: mute }); };
    const newPage = () => { pg = pdf.addPage([W, H]); pages.push(pg); y = H - M - 66; };
    // page 1: band, matrix, rating levels, hierarchy
    newPage();
    const bw = (W - 2 * M) / 4; [['PROCESS/ACTIVITY:', a.activity || a.title, 'RA. DATE:', fmt(a.date)], ['RA. NAME:', pname(a.assessor), 'TYPE OF RISK ASSESSMENT:', a.type], ['BRANCH / DEPARTMENT:', sname(a.site) + (a.dept ? ' · ' + a.dept : ''), 'NEXT REVIEW:', a.reviewDate ? fmt(a.reviewDate) : '—']].forEach(row => { row.forEach((s, i) => { box(M + bw * i, y, bw, 15, i % 2 ? null : BLUE); T(wrap(s, 7.5, bw - 8, i % 2 ? R : B)[0], M + bw * i + 4, y - 10.5, { bold: !(i % 2), color: i % 2 ? ink : rgb(1, 1, 1) }); }); y -= 15; });
    y -= 14; TC('Risk Matrix', M, W - 2 * M, y, { size: 11, bold: true }); y -= 10;
    const Lk = RM().likelihood, Sv = RM().severity, cw = 58, ch = 26, mx = M, my = y, lw = 60;
    box(mx, my, lw + 18, ch, BLUE); TC('Impact', mx, lw + 18, my - 17, { size: 10, bold: true });
    Sv.forEach((s, j) => { box(mx + lw + 18 + cw * j, my, cw, ch, BLUE); wrap(s.name, 6.8, cw - 4).slice(0, 2).forEach((l, k) => TC(l, mx + lw + 18 + cw * j, cw, my - 11 - k * 8, { size: 6.8, bold: true })); });
    box(mx, my - ch, 18, ch * Lk.length, BLUE); pg.drawText('Probability', { x: mx + 12, y: my - ch - ch * Lk.length / 2 - 22, size: 9, font: B, color: ink, rotate: { type: 'degrees', angle: 90 } });
    Lk.forEach((l, i0) => { const i = Lk.length - i0, yy = my - ch * (i0 + 1); box(mx + 18, yy, lw, ch, BLUE); wrap(Lk[i - 1].name, 6.8, lw - 4).slice(0, 2).forEach((t, k) => TC(t, mx + 18, lw, yy - 11 - k * 8, { size: 6.8, bold: true }));
      Sv.forEach((s, j) => { const b = rBand({ l: i, s: j + 1 }); box(mx + lw + 18 + cw * j, yy, cw, ch, hex(RA_TONE_BG[b.tone])); TC(b.name, mx + lw + 18 + cw * j, cw, yy - 12, { size: 7, bold: true, color: hex(b.tone === 'red' ? '#FFFFFF' : '#000000') }); TC(String(i * (j + 1)), mx + lw + 18 + cw * j, cw, yy - 21, { size: 6.2, color: hex(b.tone === 'red' ? '#FFFFFF' : '#333333') }); }); });
    let ly = my - ch * (Lk.length + 1) - 8; const LW = lw + 18 + cw * Sv.length;
    box(mx, ly, 80, 14, BLUE); T('Rating Level', mx + 4, ly - 10, { bold: true }); box(mx + 80, ly, LW - 80, 14, BLUE); TC('Response required for risks identified', mx + 80, LW - 80, ly - 10, { bold: true }); ly -= 14;
    RM().bands.slice().reverse().forEach(b => { const ls = wrap(b.action || '', 7, LW - 88), h = Math.max(16, ls.length * 9 + 6); box(mx, ly, 80, h, hex(RA_TONE_BG[b.tone])); TC(b.name, mx, 80, ly - h / 2 - 2.5, { bold: true, color: hex(b.tone === 'red' ? '#FFFFFF' : '#000000') }); box(mx + 80, ly, LW - 80, h); ls.forEach((l, k) => T(l, mx + 84, ly - 10 - k * 9, { size: 7 })); ly -= h; });
    // hierarchy of controls (drawn, not an image)
    const hx = M + LW + 30, hw = W - M - hx; let hy = my; const HC = ['#2E7D32', '#7CB342', '#FBC02D', '#F57C00', '#D32F2F'];
    box(hx, hy, hw, 222, hex('#1F2430')); TC('HIERARCHY OF', hx, hw, hy - 20, { size: 9, color: rgb(1, 1, 1) }); TC('HAZARD CONTROLS', hx, hw, hy - 38, { size: 15, bold: true, color: rgb(1, 1, 1) }); hy -= 52;
    RA_HIER.forEach(([n, d], i) => { const bwid = (hw - 130) * (1 - i * 0.15), bx = hx + 12 + ((hw - 130) - bwid) / 2; pg.drawRectangle({ x: bx, y: hy - 26, width: bwid, height: 24, color: hex(HC[i]) }); TC(n.toUpperCase(), bx, bwid, hy - 17, { size: 8.5, bold: true, color: rgb(1, 1, 1) }); wrap(d, 6.5, 105).forEach((l, k) => T(l, hx + hw - 115, hy - 10 - k * 8, { size: 6.5, bold: true, color: rgb(1, 1, 1) })); hy -= 28; });
    T('MOST EFFECTIVE', hx + 6, hy - 6, { size: 6, color: rgb(0.8, 0.85, 0.9) }); T('LEAST EFFECTIVE', hx + 6, hy - 14, { size: 6, color: rgb(0.8, 0.85, 0.9) });
    // page 2+: the table
    const C = [['ACTIVITIES / TASK STEPS', 72], ['HAZARDS (What can cause harm?)', 82], ['RISKS (What can happen?)', 82], ['CONSEQUENCE OF RISK', 84], ['I', 18], ['P', 18], ['RR', 20], ['HIERARCHY OF CONTROLS', 70], ['CONTROLS (Preventative measures)', 288 - 36], ['I', 18], ['P', 18], ['RR', 20]];
    const TW = C.reduce((n, c) => n + c[1], 0), sx = M + (W - 2 * M - TW) / 2;
    const thead = () => { let x = sx; const h = 30, grp = []; C.forEach(([l, w], n) => { box(x, y, w, h, GOLD); if (n === 4 || n === 9) grp.push([x, n === 4 ? 'PRE-RISK RATING' : 'POST-RISK RATING']); const ls = wrap(l, 6.5, w - 4, B); ls.slice(0, 3).forEach((t, k) => TC(t, x, w, y - (n >= 4 && n <= 6 || n >= 9 ? 24 : 10 + k * 8), { size: 6.5, bold: true })); x += w; });
      grp.forEach(([gx, t]) => { box(gx, y, 56, 15, GOLD); wrap(t, 5.8, 52, B).forEach((tt, k) => TC(tt, gx, 56, y - 6.5 - k * 6.5, { size: 5.8, bold: true })); }); y -= 30; };
    newPage(); thead();
    (a.rows || []).forEach(r => {
      const ctl = [...(r.existing ? wrap(r.existing, 7, C[8][1] - 6) : []), ...(r.controls || []).flatMap(c => wrap(`${c.desc} (${pname(c.owner)}${c.due ? ', ' + fmt(c.due) : ''}; ${c.status})`, 7, C[8][1] - 6))].concat(r.accepted ? wrap(`Residual risk accepted by ${pname(r.accepted.by)}, ${fmt(r.accepted.on)}: ${r.accepted.reason}`, 6.5, C[8][1] - 6) : []);
      const hi = [...new Set((r.controls || []).map(c => c.category))].flatMap(c => wrap(c, 7, C[7][1] - 6));
      const cells = [wrap(r.step || '—', 7, C[0][1] - 6), wrap(r.title, 7, C[1][1] - 6, B), wrap(r.risk || '—', 7, C[2][1] - 6), wrap(r.consequences || '—', 7, C[3][1] - 6), null, null, null, hi.length ? hi : ['—'], ctl.length ? ctl : ['—']];
      const h = Math.max(30, ...cells.filter(Boolean).map(c => c.length * 8.6 + 8)); if (y - h < M + 22) { newPage(); thead(); }
      let x = sx; C.forEach(([, w], n) => { const rk = n >= 4 && n <= 6 ? r.initial : n >= 9 ? (r.residual && r.residual.l ? r.residual : null) : undefined;
        if (rk !== undefined) { const b = rk && rBand(rk), v = !rk ? '' : n === 4 || n === 9 ? rk.s : n === 5 || n === 10 ? rk.l : rScore(rk); box(x, y, w, h, b ? hex(RA_TONE_BG[b.tone]) : null); if (rk) TC(String(v), x, w, y - h / 2 - 3, { size: 8, bold: true, color: hex(b.tone === 'red' ? '#FFFFFF' : '#000000') }); }
        else { box(x, y, w, h); cells[n].forEach((l, k) => T(l, x + 3, y - 10 - k * 8.6, { size: n === 8 && k >= ctl.length - (r.accepted ? wrap(`Residual risk accepted by ${pname(r.accepted.by)}, ${fmt(r.accepted.on)}: ${r.accepted.reason}`, 6.5, C[8][1] - 6).length : 0) ? 6.5 : 7, bold: n === 1 })); }
        x += w; });
      y -= h; });
    if (!(a.rows || []).length) { T('No hazards assessed yet.', sx + 3, y - 12, { color: mute }); y -= 20; }
    y -= 8; T('I = impact (severity) · P = probability (likelihood) · RR = risk rating (I x P). A score never decides on its own that a risk is acceptable.', sx, y, { size: 6.5, color: mute }); y -= 8;
    // signatures
    const sg = raSigs(a), team = (a.participants || []).filter(x => x !== a.assessor), SW = W - 2 * M, cols = [SW * 0.3, SW * 0.25, SW * 0.13, SW * 0.32];
    const rowsH = 30 + 30 + 16 + 16 + Math.max(3, team.length) * 26 + 40; if (y - rowsH < M + 20) newPage(); else y -= 12;
    const sigRow = async (pid) => { let x = M; const cells = pid ? [pname(pid), (byId('people', pid) || {}).jobTitle || '', sg[pid] ? fmt(sg[pid].date) : '', ''] : ['', '', '', '']; for (let i = 0; i < 4; i++) { box(x, y, cols[i], 26); T(cells[i], x + 4, y - 16); if (i === 3 && pid && sg[pid]) { try { const im = await pdf.embedPng(Uint8Array.from(atob(sg[pid].image.split(',')[1]), c => c.charCodeAt(0))); const s = Math.min((cols[3] - 10) / im.width, 22 / im.height); pg.drawImage(im, { x: x + 5, y: y - 24, width: im.width * s, height: im.height * s }); } catch (e) { /* optional */ } } x += cols[i]; } y -= 26; };
    const sigHead = (title, fill) => { box(M, y, SW, 14, fill); TC(title, M, SW, y - 10, { bold: true }); y -= 14; let x = M; ['NAME', 'OCCUPATION', 'DATE', 'SIGNATURE'].forEach((t, i) => { box(x, y, cols[i], 13, fill); TC(t, x, cols[i], y - 9.5, { bold: true, size: 7 }); x += cols[i]; }); y -= 13; };
    sigHead('ORIGINATOR', BLUE); await sigRow(a.assessor); y -= 6;
    sigHead('TEAM MEMBERS SIGNATURES', GOLD); for (const pid of team) await sigRow(pid); for (let k = team.length; k < 3; k++) await sigRow(null);
    if (a.approvedBy) { y -= 12; T(`Approved by ${pname(a.approvedBy)} on ${fmt(a.approvedOn)}.`, M, y, { size: 7.5 }); }
    pages.forEach((p, n) => header(p, n + 1, pages.length));
    const blob = new Blob([await pdf.save()], { type: 'application/pdf' });
    if (await saveFile(`RA${raDocNo(a)}_${a.title.replace(/[^\w]+/g, '_')}.pdf`, blob)) { toast('Risk assessment downloaded.'); log(`Downloaded risk assessment ${a.id} as PDF`, '#/risk/' + a.id); save(); }
  } catch (e) { console.error(e); toast('The PDF could not be made: ' + esc(e.message), 'error'); }
};

/* Demo: task steps and "what can happen" on the existing assessments, and the owner's example
   "Order picking – pallet racking" as RA-004 (demonstration data). */
MIGRATIONS.push(() => {
  if (S.migr && S.migr.ra2) return; S.migr = S.migr || {}; S.migr.ra2 = true;
  const set = (id, k, o) => { const a = byId('riskAssessments', id); if (a && a.rows[k]) Object.keys(o).forEach(f => { if (!a.rows[k][f]) a.rows[k][f] = o[f]; }); };
  set('RA-001', 0, { step: 'Travel in warehouse aisles with forklifts', risk: 'Forklift strikes a pedestrian' });
  set('RA-001', 1, { step: 'Charge forklift batteries', risk: 'Hydrogen ignites; acid splashes on skin or eyes' });
  set('RA-002', 0, { step: 'Clean parts in the degreasing bay', risk: 'Vapour inhaled; skin contact; solvent catches fire' });
  if (!byId('riskAssessments', 'RA-004') && site('S-JHB')) {
    const row = (id, step, title, risk, cons, i, cat, ctl, r) => ({ id, step, title, risk, consequences: cons, category: 'Vehicles and mobile equipment', exposed: 'Pickers, MHE operators', existing: '', initial: { l: i[1], s: i[0] }, residual: { l: r[1], s: r[0] }, controls: [{ desc: ctl, category: cat, owner: 'P-007', due: addDays(TODAY, -100), status: 'Implemented', evidence: [] }] });
    S.riskAssessments.push({ id: 'RA-004', org: 'ORG-1', site: 'S-JHB', dept: 'Warehouse & Logistics', title: 'Order picking – pallet racking', docNo: '004', type: 'Activity-based', activity: 'Order picking — pallet racking', date: addDays(TODAY, -150), assessor: 'P-002', participants: ['P-007', 'P-009'], version: 1, reviews: [], evidence: [], status: 'Approved', approvedBy: 'P-001', approvedOn: addDays(TODAY, -148), reviewDate: addDays(TODAY, 215), created: addDays(TODAY, -150),
      rows: [row('r1', 'Travel in picking aisles with MHE', 'MHE/pedestrian collision in picking aisles', 'Picker struck by MHE', 'High risk of injury, illness or property damage', [4, 4], 'Administrative controls', 'Sound horn at aisle ends; maintain pedestrian separation zones', [3, 2]),
        row('r2', 'Pick stock from racking location', 'Load falling from racking during picking', 'Picker struck by falling stock', 'High risk of injury, illness or property damage', [4, 4], 'Administrative controls', 'Inspect racking for overhang or damaged stock before picking', [3, 2]),
        row('r3', 'Verify part number before picking', 'Incorrect pick', 'Wrong items despatched', 'Medium risk of injury, illness or property damage', [3, 3], 'Administrative controls', 'Verify barcode/part number scan before every pick', [2, 2]),
        row('r4', 'Place picked goods on picking pallet', 'Overloading picking pallet during multi-pick', 'Pallet collapses or load falls', 'Medium risk of injury, illness or property damage', [3, 3], 'Administrative controls', 'Monitor cumulative weight on picking pallet; do not overload', [2, 2]),
        row('r5', 'Carry load on forklift forks', 'MHE tip-over from uneven load', 'Forklift tips over; load falls', 'High risk of injury, illness or property damage', [4, 4], 'Engineering controls', 'Centre load on forks; do not pick from an angle', [3, 2])] });
  }
});
