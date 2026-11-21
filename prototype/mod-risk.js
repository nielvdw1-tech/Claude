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
  return `<div class="card cq-wide">${regFilterBar('#/risk/assessments', q, A, rows.length, RA_F, 'Search title, activity, assessor…')}<div class="card-body flush">${rows.length ? `<div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Assessment</th><th>Type</th><th>Branch / department</th><th>Hazards</th><th>Highest current risk</th><th>Open controls</th><th>Review</th><th>Status</th></tr></thead><tbody>
    ${rows.map(a => { const top = (a.rows || []).map(rowRisk).filter(rScore).sort((x, y) => rScore(y) - rScore(x))[0], st = raStatus(a);
      return `<tr class="rowlink" data-href="#/risk/${a.id}"><td data-label="Assessment"><span class="mono">${a.id}</span>${a.version > 1 ? ` <span class="t-sub">v${a.version}</span>` : ''}<div class="t-title">${esc(a.title)}</div></td><td data-label="Type">${esc(a.type)}</td><td data-label="Branch">${esc(sname(a.site))}<div class="t-sub">${esc(a.dept || '')}</div></td><td data-label="Hazards">${(a.rows || []).length}</td><td data-label="Highest">${top ? rChip(top) : '—'}</td><td data-label="Open controls">${openCtrls(a).length || '—'}</td><td data-label="Review">${a.reviewDate ? dueText(a.reviewDate) : '—'}</td><td data-label="Status">${badge(st, st === 'Approved' ? 'green' : st === 'Draft' ? 'grey' : st === 'Superseded' ? 'grey' : 'red')}</td></tr>`; }).join('')}
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
    <div class="ra-grid"><div><span class="t-sub">Possible consequences</span><div>${esc(r.consequences || '—')}</div></div><div><span class="t-sub">Exposed persons</span><div>${esc(r.exposed || '—')}</div></div><div class="full"><span class="t-sub">Existing controls</span><div>${esc(r.existing || '—')}</div></div></div>
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
  return `<div class="field"><label for="f_${prefix}l">${label} — likelihood</label><select id="f_${prefix}l" name="${prefix}l">${opts(L.map((x, i) => ({ value: i + 1, label: `${i + 1} — ${x.name}` })), r && r.l ? String(r.l) : '', '—')}</select></div>
    <div class="field"><label for="f_${prefix}s">${label} — severity</label><select id="f_${prefix}s" name="${prefix}s">${opts(Sv.map((x, i) => ({ value: i + 1, label: `${i + 1} — ${x.name}` })), r && r.s ? String(r.s) : '', '—')}</select></div>`;
}
ACT.raNew = () => openModal({ title: 'New risk assessment', size: 'wide', body: raForm(null), buttons: [{ label: 'Create', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); S.riskAssessments = S.riskAssessments || [];
  const a = Object.assign({ id: nextId('RA-', 'riskAssessments'), org: siteOrgOf(v.site), status: 'Draft', version: 1, rows: [], reviews: [], evidence: [], created: TODAY }, raRead(m, v)); S.riskAssessments.push(a); log(`Created risk assessment ${a.id}: ${a.title}`, '#/risk/' + a.id); save(); navigate('#/risk/' + a.id); } }] });
ACT.raEdit = (el) => { const a = byId('riskAssessments', el.dataset.id); openModal({ title: `Edit ${a.id}`, size: 'wide', body: raForm(a), buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; Object.assign(a, raRead(m, readForm(m))); log(`Edited risk assessment ${a.id}`, '#/risk/' + a.id); save(); rerender(); } }] }); };
function raForm(a) { return `<div class="form-grid">
  ${fld({ name: 'title', label: 'Title', value: a ? a.title : '', required: true, full: true, placeholder: 'e.g. Warehouse forklift operations' })}
  ${fld({ name: 'type', label: 'Type', type: 'select', options: opts(RA_TYPES, a ? a.type : 'Baseline'), required: true })}
  ${fld({ name: 'site', label: 'Branch', type: 'select', options: siteOptions(a ? a.site : defaultSite(), false), required: true })}
  ${fld({ name: 'dept', label: 'Department', type: 'select', options: opts(S.departments, a ? a.dept : '', '— Any —') })}
  ${fld({ name: 'activity', label: 'Activity or process', value: a ? a.activity || '' : '' })}
  ${fld({ name: 'date', label: 'Assessment date', type: 'date', value: a ? a.date : TODAY, required: true })}
  ${fld({ name: 'assessor', label: 'Assessor', type: 'select', options: personOptions(a ? a.assessor : S.ui.user, p => !!p.sysRole), required: true })}
  ${fld({ name: 'asset', label: 'Equipment (if equipment-related)', type: 'select', options: opts(S.assets.filter(x => inSite(x, 'ALL')).map(x => ({ value: x.id, label: `${x.tag} — ${x.name}` })), a ? a.asset || '' : '', '— None —') })}
  ${typeof S.substances === 'object' ? fld({ name: 'substance', label: 'Hazardous substance (if applicable)', type: 'select', options: opts((S.substances || []).filter(x => x.org === S.ui.org).map(x => ({ value: x.id, label: x.name })), a ? a.substance || '' : '', '— None —') }) : ''}
  <div class="field full"><label>Participants</label><div class="chk-row">${S.people.filter(p => p.org === S.ui.org && p.status !== 'Deactivated' && p.type === 'Employee').map(p => `<label class="check"><input type="checkbox" name="pt_${p.id}" ${a && (a.participants || []).includes(p.id) ? 'checked' : ''}> <span>${esc(p.name)}</span></label>`).join('')}</div></div></div>`; }
function raRead(m, v) { return { title: v.title, type: v.type, site: v.site, dept: v.dept, activity: v.activity, date: v.date, assessor: v.assessor, asset: v.asset || null, substance: v.substance || null, participants: S.people.filter(p => m.querySelector(`[name=pt_${p.id}]`) && m.querySelector(`[name=pt_${p.id}]`).checked).map(p => p.id) }; }
ACT.raRow = (el) => { const a = byId('riskAssessments', el.dataset.id), k = el.dataset.k != null ? +el.dataset.k : null, r = k != null ? a.rows[k] : null;
  const hz = (S.hazards || []).filter(h => h.org === a.org && (h.site === a.site || h.site === 'ALL'));
  openModal({ title: r ? 'Edit hazard' : 'Add a hazard to the assessment', size: 'wide', body: `<div class="form-grid">
    ${fld({ name: 'hazard', label: 'From the hazard register (optional)', type: 'select', options: opts(hz.map(h => ({ value: h.id, label: `${h.id} — ${h.title}` })), r ? r.hazard || '' : '', '— Not from the register —'), full: true })}
    ${fld({ name: 'title', label: 'Hazard', value: r ? r.title : '', required: true, full: true })}${fld({ name: 'category', label: 'Category', type: 'select', options: opts(S.config.hazardCats, r ? r.category : '') })}
    ${fld({ name: 'exposed', label: 'Exposed persons', value: r ? r.exposed || '' : '' })}
    ${fld({ name: 'consequences', label: 'Possible consequences', type: 'textarea', rows: 2, value: r ? r.consequences || '' : '', full: true })}
    ${fld({ name: 'existing', label: 'Existing controls', type: 'textarea', rows: 2, value: r ? r.existing || '' : '', full: true })}
    ${lsFields('i', r && r.initial, 'Initial risk')}${lsFields('r', r && r.residual, 'Residual risk')}</div>
    <p class="muted" style="font-size:12px">Residual risk is the expected risk once the additional controls are in place. Leave it empty until the controls are decided.</p>`,
    onOpen: m => { const s = m.querySelector('[name=hazard]'); s.addEventListener('change', () => { const h = byId('hazards', s.value); if (!h) return; m.querySelector('[name=title]').value = h.title; m.querySelector('[name=category]').value = h.category; if (!m.querySelector('[name=exposed]').value) m.querySelector('[name=exposed]').value = h.exposed || ''; }); },
    buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); if (!v.il || !v.is) { toast('Rate the initial risk (likelihood and severity).', 'error'); return false; }
      const row = Object.assign(r || { id: 'r' + Math.random().toString(36).slice(2, 7), controls: [] }, { hazard: v.hazard || null, title: v.title, category: v.category, exposed: v.exposed, consequences: v.consequences, existing: v.existing, initial: { l: +v.il, s: +v.is }, residual: v.rl && v.rs ? { l: +v.rl, s: +v.rs } : null });
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

/* ---------------- View and print a risk assessment ----------------
   #/risk/RA-x/view is a clean, read-only copy laid out like a controlled
   document: header, details, every hazard with its initial risk, controls and
   residual risk, the acceptance of residual risk, sign-off and the matrix used.
   It works on a phone and prints from a normal browser; "Download PDF" makes
   an A4 landscape PDF (also where printing is blocked, e.g. a preview frame). */
function raViewHtml(a) {
  const org = orgOf(a.org || S.ui.org), st = raStatus(a);
  const chip = r => r && r.l ? `${rChip(r)}<div class="t-sub">L${r.l} × S${r.s}</div>` : '<span class="muted">Not assessed</span>';
  return `<div class="no-print btn-row mb ra-view-bar"><button class="btn" data-act="print">${icon('print', 'sm')} Print</button><button class="btn primary" data-act="raPdf" data-id="${a.id}">${icon('download', 'sm')} Download PDF</button></div>
  <div class="screen-paper print-doc ra-view"><table class="report-frame"><thead><tr><td>
    <div class="controlled-header"><div class="chh"><div class="print-logo">${orgMark(org, 'doc')}<div><b style="font-size:12px">${esc(org.short)}</b><small>HSEQ Management System</small></div></div><div class="ch-title">Risk assessment<br><span style="font-weight:500">${esc(a.title)}</span></div><div class="ch-meta">Record: <b class="mono">${a.id}</b><br>Version: <b>${a.version || 1}</b><br>Status: <b>${esc(st)}</b><br>Next review: <b>${a.reviewDate ? fmt(a.reviewDate) : '—'}</b></div></div></div>
  </td></tr></thead><tbody><tr><td>
    <div class="rep-section">Assessment details</div>
    <div class="rv-kv"><div><span>Type</span><b>${esc(a.type)}</b></div><div><span>Branch / department</span><b>${esc(sname(a.site))}${a.dept ? ' · ' + esc(a.dept) : ''}</b></div><div class="wide"><span>Activity / process</span><b>${esc(a.activity || '—')}</b></div>
      <div><span>Assessment date</span><b>${fmt(a.date)}</b></div><div><span>Assessor</span><b>${esc(pname(a.assessor))}</b></div><div class="wide"><span>Participants</span><b>${(a.participants || []).map(pname).map(esc).join(', ') || '—'}</b></div>
      ${a.asset ? `<div><span>Equipment</span><b>${esc((byId('assets', a.asset) || {}).tag || a.asset)}</b></div>` : ''}${a.substance ? `<div><span>Substance</span><b>${esc((byId('substances', a.substance) || {}).name || a.substance)}</b></div>` : ''}</div>
    <div class="rep-section">Hazards and risks (${(a.rows || []).length})</div>
    ${(a.rows || []).map((r, k) => `<div class="rv-hz">
      <div class="rv-hz-h"><b>${k + 1}. ${esc(r.title)}</b><span class="t-sub">${esc(r.category || '')}</span></div>
      <div class="rv-kv"><div><span>Possible consequences</span><b>${esc(r.consequences || '—')}</b></div><div><span>Exposed persons</span><b>${esc(r.exposed || '—')}</b></div><div class="wide"><span>Existing controls</span><b>${esc(r.existing || '—')}</b></div></div>
      <div class="rv-risk"><div><span>Initial risk</span>${chip(r.initial)}</div><div><span>Residual risk</span>${chip(r.residual)}</div><div class="wide"><span>Residual risk accepted</span><b>${r.accepted ? `${esc(pname(r.accepted.by))}, ${fmt(r.accepted.on)}</b><div class="t-sub">${esc(r.accepted.reason)}</div>` : 'Not yet accepted</b>'}</div></div>
      ${(r.controls || []).length ? `<table class="rt rv-ctrl"><thead><tr><th>Additional control</th><th>Type</th><th>Responsible</th><th>Target</th><th>Status</th></tr></thead><tbody>${r.controls.map(c => `<tr><td data-label="Control">${esc(c.desc)}</td><td data-label="Type">${esc(c.category)}</td><td data-label="Responsible">${esc(pname(c.owner))}</td><td data-label="Target">${c.due ? fmt(c.due) : '—'}</td><td data-label="Status">${esc(c.status)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted" style="margin:6px 0 0">No additional controls.</p>'}
    </div>`).join('') || '<p class="muted">No hazards assessed yet.</p>'}
    <div class="rep-section">Reviews</div>
    ${(a.reviews || []).length ? `<ul class="rv-list">${a.reviews.map(v => `<li><b>${fmt(v.date)}</b> · ${esc(v.reason)}${v.ref ? ` (${esc(v.ref)})` : ''} — ${esc(v.outcome || '')} · ${esc(pname(v.by))}</li>`).join('')}</ul>` : '<p class="muted">No reviews yet.</p>'}
    <div class="rep-section">Sign-off</div>
    <div class="rv-kv"><div><span>Assessed by</span><b>${esc(pname(a.assessor))}, ${fmt(a.date)}</b></div><div><span>Approved by</span><b>${a.approvedBy ? `${esc(pname(a.approvedBy))}, ${fmt(a.approvedOn)}` : 'Not approved yet'}</b></div></div>
    <div class="rep-section">Risk matrix used</div>
    <p class="t-sub" style="margin:0 0 6px">Risk = likelihood (1–${RM().likelihood.length}) × severity (1–${RM().severity.length}). ${RM().bands.map(b => `${esc(b.name)}: up to ${b.max}`).join(' · ')}. A score never decides on its own that a risk is acceptable; residual risk is accepted by a named person.</p>
    <p class="muted" style="font-size:10px;margin-top:10px">Generated by the VDW HSEQ Management System prototype from demonstration data on ${fmt(TODAY)}. It does not by itself show legal compliance.</p>
  </td></tr></tbody></table></div>`;
}
const _riskBeforeView = ROUTES.risk;
ROUTES.risk = (p, q) => {
  if (p[0] && /^RA-/.test(p[0]) && p[1] === 'view') { const a = byId('riskAssessments', p[0]); if (!a || a.org !== S.ui.org) return ROUTES.notfound();
    return { title: a.id + ' · view', nav: 'risk', crumbs: [['Risk Management', '#/risk'], [a.id, '#/risk/' + a.id], ['View and print', '#']], html: raViewHtml(a) }; }
  const r = _riskBeforeView(p, q);
  if (r && r.html && p[0] && /^RA-/.test(p[0])) r.html = r.html.replace('<div class="sh-actions">', `<div class="sh-actions"><a class="btn" href="#/risk/${p[0]}/view">${icon('print', 'sm')} View / print</a>`);
  return r;
};

ACT.raPdf = async (el) => {
  const a = byId('riskAssessments', el.dataset.id); toast('Preparing the risk assessment…', 'info');
  try {
    const { PDFDocument, StandardFonts, rgb } = await ensurePdfLib();
    const pdf = await PDFDocument.create(), R = await pdf.embedFont(StandardFonts.Helvetica), B = await pdf.embedFont(StandardFonts.HelveticaBold);
    const W = 842, H = 595, M = 32, ink = rgb(0.06, 0.1, 0.2), mute = rgb(0.4, 0.45, 0.55), line = rgb(0.8, 0.84, 0.89), head = rgb(0.94, 0.95, 0.97);
    const TONE = { green: [rgb(0.87, 0.95, 0.9), rgb(0.04, 0.42, 0.23)], amber: [rgb(0.99, 0.94, 0.8), rgb(0.54, 0.35, 0)], orange: [rgb(0.99, 0.89, 0.81), rgb(0.6, 0.24, 0.02)], red: [rgb(0.98, 0.84, 0.84), rgb(0.63, 0.12, 0.12)] };
    const org = orgOf(a.org || S.ui.org), pages = []; let pg, y;
    const T = (s, x, yy, o = {}) => pg.drawText(pdfSafe(s), { x, y: yy, size: o.size || 8, font: o.bold ? B : R, color: o.color || ink });
    const wrap = (s, size, width, f = R) => { const out = []; String(pdfSafe(s || '')).split('\n').forEach(par => { let cur = ''; par.split(' ').forEach(w => { const t = cur ? cur + ' ' + w : w; if (f.widthOfTextAtSize(t, size) > width && cur) { out.push(cur); cur = w; } else cur = t; }); out.push(cur); }); return out; };
    // columns of the hazard table (landscape)
    const C = [['#', 18], ['Hazard', 98], ['Consequences', 92], ['Exposed', 64], ['Existing controls', 112], ['Initial', 52], ['Additional controls (responsible, target, status)', 196], ['Residual', 52], ['Accepted', 94]];
    const TW = C.reduce((n, c) => n + c[1], 0), sx = M + (W - 2 * M - TW) / 2;
    const tableHead = () => { pg.drawRectangle({ x: sx, y: y - 16, width: TW, height: 16, color: head, borderColor: line, borderWidth: 0.5 }); let x = sx; C.forEach(([l, w]) => { const ls = wrap(l, 6.8, w - 6, B); T(ls[0] + (ls.length > 1 ? '…' : ''), x + 3, y - 10.5, { size: 6.8, bold: true, color: mute }); x += w; }); y -= 16; };
    const newPage = (withTable) => { pg = pdf.addPage([W, H]); pages.push(pg); y = H - M;
      T(org.name, M, y - 8, { size: 9, bold: true }); T(`Risk assessment · ${a.title}`, M, y - 24, { size: 14, bold: true }); const id = `${a.id} · version ${a.version || 1}`; T(id, W - M - B.widthOfTextAtSize(id, 9), y - 8, { size: 9, bold: true }); y -= 38; if (withTable) tableHead(); };
    const chip = (r, x, yy) => { if (!r || !r.l) { T('—', x + 3, yy, { color: mute }); return; } const b = rBand(r), t = TONE[b.tone] || TONE.amber, s = `${rScore(r)} ${b.name}`; pg.drawRectangle({ x: x + 2, y: yy - 3, width: Math.min(46, B.widthOfTextAtSize(s, 6.8) + 6), height: 11, color: t[0] }); T(s, x + 5, yy, { size: 6.8, bold: true, color: t[1] }); T(`L${r.l} x S${r.s}`, x + 3, yy - 11, { size: 6.5, color: mute }); };
    newPage(false);
    const det = [['Type', a.type], ['Branch / department', sname(a.site) + (a.dept ? ' · ' + a.dept : '')], ['Activity / process', a.activity || '—'], ['Assessment date', fmt(a.date)], ['Assessor', pname(a.assessor)], ['Participants', (a.participants || []).map(pname).join(', ') || '—'], ['Status', raStatus(a)], ['Approved', a.approvedBy ? `${pname(a.approvedBy)}, ${fmt(a.approvedOn)}` : 'Not approved yet'], ['Next review', a.reviewDate ? fmt(a.reviewDate) : '—']];
    det.forEach(([l, v], n) => { const x = M + (n % 3) * ((W - 2 * M) / 3), yy = y - Math.floor(n / 3) * 22; T(l.toUpperCase(), x, yy, { size: 6.5, bold: true, color: mute }); T(wrap(v, 8.5, (W - 2 * M) / 3 - 10)[0], x, yy - 10, { size: 8.5 }); });
    y -= Math.ceil(det.length / 3) * 22 + 8; tableHead();
    (a.rows || []).forEach((r, k) => {
      const ctrl = (r.controls || []).flatMap(c => wrap(`- ${c.desc} (${c.category}; ${pname(c.owner)}; ${c.due ? fmt(c.due) : 'no date'}; ${c.status})`, 7.2, C[6][1] - 6));
      const cells = [[String(k + 1)], wrap(r.title, 7.2, C[1][1] - 6, B).concat(r.category ? wrap(r.category, 6.5, C[1][1] - 6) : []), wrap(r.consequences || '—', 7.2, C[2][1] - 6), wrap(r.exposed || '—', 7.2, C[3][1] - 6), wrap(r.existing || '—', 7.2, C[4][1] - 6), null, ctrl.length ? ctrl : ['None'], null, r.accepted ? wrap(`${pname(r.accepted.by)}, ${fmt(r.accepted.on)}: ${r.accepted.reason}`, 7.2, C[8][1] - 6) : ['Not yet accepted']];
      const h = Math.max(28, ...cells.filter(Boolean).map(c => c.length * 9 + 8));
      if (y - h < M + 24) newPage(true);
      let x = sx; C.forEach(([, w], n) => { pg.drawRectangle({ x, y: y - h, width: w, height: h, borderColor: line, borderWidth: 0.5 });
        if (n === 5) chip(r.initial, x, y - 10); else if (n === 7) chip(r.residual && r.residual.l ? r.residual : null, x, y - 10);
        else cells[n].forEach((l, i) => T(l, x + 3, y - 10 - i * 9, { size: n === 1 && i >= wrap(r.title, 7.2, C[1][1] - 6, B).length ? 6.5 : 7.2, bold: n === 1 && i < wrap(r.title, 7.2, C[1][1] - 6, B).length, color: n === 1 && i >= wrap(r.title, 7.2, C[1][1] - 6, B).length ? mute : ink })); x += w; });
      y -= h;
    });
    if (!(a.rows || []).length) { T('No hazards assessed yet.', sx + 3, y - 12, { color: mute }); y -= 20; }
    // matrix bands and sign-off
    if (y < M + 90) newPage(false);
    y -= 16; T('RISK MATRIX USED', M, y, { size: 6.5, bold: true, color: mute }); y -= 11;
    T(`Risk = likelihood (1-${RM().likelihood.length}) x severity (1-${RM().severity.length}). ` + RM().bands.map(b => `${b.name}: up to ${b.max}`).join(' · ') + '. A score never decides on its own that a risk is acceptable.', M, y, { size: 7.5 }); y -= 22;
    T('SIGN-OFF', M, y, { size: 6.5, bold: true, color: mute }); y -= 12;
    [['Assessed by', `${pname(a.assessor)}, ${fmt(a.date)}`], ['Approved by', a.approvedBy ? `${pname(a.approvedBy)}, ${fmt(a.approvedOn)}` : 'Not approved yet']].forEach(([l, v], n) => { const x = M + n * 260; T(l, x, y, { size: 7.5, color: mute }); T(v, x, y - 11, { size: 8.5, bold: true }); pg.drawLine({ start: { x, y: y - 30 }, end: { x: x + 220, y: y - 30 }, thickness: 0.5, color: line }); T('Signature', x, y - 39, { size: 6.5, color: mute }); });
    pages.forEach((p, n) => { p.drawLine({ start: { x: M, y: 24 }, end: { x: W - M, y: 24 }, thickness: 0.4, color: line }); p.drawText(pdfSafe(`${org.short} · ${a.id} · Demonstration data from the VDW HSEQ prototype; this report does not by itself show legal compliance.`), { x: M, y: 13, size: 6.8, font: R, color: mute }); p.drawText(`Page ${n + 1} of ${pages.length} · Powered by VDW`, { x: W - M - 95, y: 13, size: 6.8, font: R, color: mute }); });
    const blob = new Blob([await pdf.save()], { type: 'application/pdf' });
    if (await saveFile(`Risk_assessment_${a.id}_${sname(a.site).replace(/\W+/g, '_')}.pdf`, blob)) { toast('Risk assessment downloaded.'); log(`Downloaded risk assessment ${a.id} as PDF`, '#/risk/' + a.id); save(); }
  } catch (e) { console.error(e); toast('The PDF could not be made: ' + esc(e.message), 'error'); }
};
