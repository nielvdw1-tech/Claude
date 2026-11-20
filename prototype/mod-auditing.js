/* ==========================================================================
   Audits
   --------------------------------------------------------------------------
   Planned audits of a branch or area against a controlled audit checklist:
   legal compliance, housekeeping, fire safety, hazardous chemical substances,
   stacking and storage, emergency preparedness, PPE — and any checklist a
   company builds itself (same control as inspection templates: a new
   template or revision is a draft until it is approved).

   - Programme: which audit, at which branch, by whom, how often; due audits
     appear in the auditor's tasks.
   - Conducting: each item is Compliant / Partially / Not compliant / N/A, with
     notes and photos; partial and non-compliant items become findings graded
     Major, Minor or Observation (a critical item not met is Major). Progress
     is saved as you go.
   - Score: weighted per section and overall; a critical item not met makes the
     result "Not acceptable" whatever the score. Repeat findings (the same item
     not met at the previous audit of that branch) are flagged.
   - Close-out: auditor and auditee sign; findings become corrective actions
     in the central register; a PDF audit report can be downloaded.

   The starter checklists are VDW's suggestions to work from. The legal
   compliance checklist does not quote legislation: a competent person adds the
   references from the official text before relying on it.
   ========================================================================== */
'use strict';

/* ---------------- Basics ---------------- */
const AUD_RES = [['C', 'Compliant'], ['P', 'Partially'], ['N', 'Not compliant'], ['NA', 'N/A']];
const AUD_GRADES = ['Major', 'Minor', 'Observation'];
const AUD_CATS = ['Legal compliance', 'Housekeeping', 'Fire safety', 'Hazardous chemical substances', 'Stacking and storage', 'Emergency preparedness and first aid', 'Personal protective equipment', 'Other'];
const atCurrent = t => (t.revisions || []).filter(r => r.status === 'Approved').slice(-1)[0] || null;
const atDraft = t => (t.revisions || []).find(r => r.status === 'Draft') || null;
const auditTemplates = () => (S.auditTemplates || []).filter(t => (!t.org || t.org === S.ui.org) && !(t.org == null && (S.auditTemplates || []).some(x => x.org === S.ui.org && x.replaces === t.id)));
// One "family" id per checklist, so a company's edited copy of a starter keeps the starter's audit history (trend, repeat findings)
const atFamily = id => { const t = byId('auditTemplates', id); return t && t.replaces ? t.replaces : id; };
// A planned audit is overdue after its due date, and escalated to the HSEQ Manager once it is this many days overdue (paused plans are neither)
const AUD_ESC_DAYS = 14;
const planOverdue = x => !x.paused && daysTo(x.nextDue) < 0;
const planEscalated = x => !x.paused && daysTo(x.nextDue) <= -AUD_ESC_DAYS;
if (!ICON_PATHS.edit)ICON_PATHS.edit = '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>';
const audItems = snap => snap.sections.flatMap(s => s.items.map(i => Object.assign({ section: s.title }, i)));
function canConduct() { return can('inspect'); }
function canManageAudits() { return can('doc.create'); }

// Weighted score: Compliant = full weight, Partially = half, Not compliant = 0, N/A left out
function auditScore(snap, ans) {
  const sec = snap.sections.map(s => { let w = 0, e = 0; s.items.forEach(i => { const a = ans[i.id]; if (!a || !a.r || a.r === 'NA') return; const wt = +i.weight || 1; w += wt; e += a.r === 'C' ? wt : a.r === 'P' ? wt / 2 : 0; }); return { title: s.title, pct: w ? Math.round((e / w) * 100) : null }; });
  let W = 0, E = 0; audItems(snap).forEach(i => { const a = ans[i.id]; if (!a || !a.r || a.r === 'NA') return; const wt = +i.weight || 1; W += wt; E += a.r === 'C' ? wt : a.r === 'P' ? wt / 2 : 0; });
  const critical = audItems(snap).filter(i => i.critical && ans[i.id] && ans[i.id].r === 'N').length;
  return { pct: W ? Math.round((E / W) * 100) : null, sections: sec, critical };
}
function auditRating(sc) {
  if (sc.pct == null) return { label: 'Not scored', tone: 'grey' };
  if (sc.critical) return { label: 'Not acceptable — critical item not met', tone: 'red' };
  return sc.pct >= 85 ? { label: 'Good', tone: 'green' } : sc.pct >= 70 ? { label: 'Acceptable — improve', tone: 'amber' } : { label: 'Poor', tone: 'red' };
}
function auditFindings(a) { return audItems(a.template).filter(i => a.answers[i.id] && ['P', 'N'].includes(a.answers[i.id].r)).map(i => Object.assign({}, i, a.answers[i.id])); }
// The previous completed audit with the same checklist at the same branch
function prevAudit(a) { return (S.audits || []).filter(x => x.id !== a.id && x.status === 'Completed' && atFamily(x.template.templateId) === atFamily(a.template.templateId) && x.site === a.site && x.date < a.date).sort((x, y) => y.date.localeCompare(x.date))[0] || null; }
function isRepeat(a, itemId) { const p = prevAudit(a); return !!(p && p.answers[itemId] && ['P', 'N'].includes(p.answers[itemId].r)); }

/* ---------------- Route: Audits ---------------- */
ROUTES.audits = (p, q = {}) => {
  if (p[0] && /^AUD-/.test(p[0])) { const a = byId('audits', p[0]); if (!a) return ROUTES.notfound(); return a.status === 'In progress' && a.auditor === S.ui.user ? auditConduct(a) : auditDetail(a); }
  if (p[0] === 'builder') return auditBuilder(p[1], q);
  const tab = p[0] || 'programme';
  const plans = scoped('auditPlans').sort((a, b) => a.nextDue.localeCompare(b.nextDue)), audits = scoped('audits').sort((a, b) => b.date.localeCompare(a.date));
  const done = audits.filter(a => a.status === 'Completed'), last12 = done.filter(a => daysTo(a.date) > -365);
  const avg = last12.length ? Math.round(last12.reduce((t, a) => t + (a.score.pct || 0), 0) / last12.length) : null;
  const openF = done.reduce((n, a) => n + (a.findingsList || []).filter(f => f.action && actionOpen(byId('actions', f.action) || {})).length, 0);
  const active = plans.filter(x => !x.paused), late = active.filter(planOverdue);
  const tabs = [['programme', 'Audit programme', late.length || '', 'red'], ['records', 'Audits', audits.length]];
  let body = '';
  if (tab === 'programme') body = auditProgrammeHtml(plans);
  if (tab === 'records') body = auditRecordsHtml(audits, q);
  const fab = fabStack([canConduct() && { act: 'audStart', label: 'Start audit' }, canManageAudits() && tab === 'programme' && { act: 'audPlanNew', label: 'Plan audit', icon: 'clock', cls: 'ghost' }]);
  const html = `${pageHead('Audits', 'Planned audits of each branch against controlled checklists. Findings become corrective actions, and every audit has a signed report.' + (canArea('admin') ? ` The checklists are set up under <a href="#/admin/audittemplates">Administration → Audit checklists</a>.` : ''), '', scopePill())}${fab}
    <div class="kpis">${kpi('Audits overdue', late.length, `${late.filter(planEscalated).length} escalated · ${active.length} active in the programme${plans.length > active.length ? ` · ${plans.length - active.length} paused` : ''}`, late.length ? 'red' : 'green', '#/audits/programme', 'clock')}
      ${kpi('Due in 30 days', active.filter(x => daysTo(x.nextDue) >= 0 && daysTo(x.nextDue) <= 30).length, 'Planned audits', 'blue', '#/audits/programme', 'calendar')}
      ${kpi('Average score (12 months)', avg == null ? '—' : avg + '%', `${last12.length} audit(s) completed`, avg == null ? 'blue' : avg >= 85 ? 'green' : avg >= 70 ? 'amber' : 'red', '#/audits/records', 'chart')}
      ${kpi('Audit findings open', openF, 'Corrective actions not yet verified', openF ? 'amber' : 'green', '#/actions?source=Audit', 'target')}</div>
    ${tabsHtml('#/audits', tabs, tab)}${body}`;
  return { title: 'Audits', nav: 'audits', crumbs: [['Audits', '#/audits']], html, after: tab === 'records' ? () => fltSearch('#/audits/records') : null };
};
function auditProgrammeHtml(plans) {
  if (!plans.length) return `<div class="card">${emptyList('No audits planned yet. Use "Plan audit" to add audits to the programme.')}</div>`;
  // active audits first (soonest due first), paused ones at the bottom
  plans = plans.slice().sort((a, b) => (!!a.paused - !!b.paused) || a.nextDue.localeCompare(b.nextDue));
  return `<div class="card">${searchBar('#/audits/programme', plans.length, 'Search checklist, branch or auditor…')}<div class="card-body flush"><div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Audit</th><th>Branch / area</th><th>Auditor</th><th>Every</th><th>Last audit</th><th>Next due</th><th></th></tr></thead><tbody>
    ${plans.map(x => { const t = byId('auditTemplates', x.template), last = (S.audits || []).filter(a => a.plan === x.id && a.status === 'Completed').sort((a, b) => b.date.localeCompare(a.date))[0], open = (S.audits || []).find(a => a.plan === x.id && a.status === 'In progress');
      return `<tr class="${x.paused ? 'row-paused' : planOverdue(x) ? 'row-red' : ''}" data-plan="${x.id}"><td data-label="Audit"><b>${esc(t ? t.title : x.template)}</b><div class="t-sub">${esc(t ? t.category : '')}</div></td><td data-label="Branch">${esc(sname(x.site))}${x.area ? `<div class="t-sub">${esc(x.area)}</div>` : ''}</td><td data-label="Auditor">${esc(pname(x.auditor))}</td><td data-label="Every">${x.months} month${x.months > 1 ? 's' : ''}</td><td data-label="Last audit">${last ? `<a href="#/audits/${last.id}">${fmt(last.date)}</a> · <b class="due ${last.score.critical ? 'red' : scoreColour(last.score.pct)}">${last.score.pct}%</b>` : '—'}</td>
        <td data-label="Next due">${x.paused ? `${badge('Paused', 'grey')}<div class="t-sub">${esc(x.pauseReason || '')}</div>` : dueText(x.nextDue) + (planEscalated(x) && !open ? `<div>${badge('Escalated to HSEQ', 'red', true)}</div>` : '')}</td>
        <td><div class="btn-row nowrap">${x.paused ? '' : open ? `<a class="btn sm" href="#/audits/${open.id}">Continue</a>` : canConduct() ? `<button class="btn sm primary" data-act="audStart" data-plan="${x.id}">Start</button>` : ''}${canManageAudits() ? `<button class="btn sm" data-act="audPlanEdit" data-id="${x.id}" title="Edit, pause or remove" aria-label="Edit, pause or remove this planned audit">${icon('edit', 'sm')} Edit</button>` : ''}</div></td></tr>`; }).join('')}
  </tbody></table></div></div></div>`;
}
/* Filters on the list of audits: search, kind of audit, status, branch, result, period (the same toolbar as the other registers) */
const AUD_FLT = {
  fkind: { all: 'All kinds of audit', list: () => AUD_CATS.map(c => ({ value: c, label: c })), test: (a, v) => a.template.category === v },
  fstatus: { all: 'All statuses', list: () => [{ value: 'In progress', label: 'In progress' }, { value: 'Completed', label: 'Completed' }], test: (a, v) => a.status === v },
  fsite: { all: 'All branches', list: () => orgSites().map(x => ({ value: x.id, label: x.short || x.name })), test: (a, v) => a.site === v, show: () => orgSites().length > 1 },
  fresult: { all: 'Any result', list: () => [{ value: 'good', label: 'Good (85% and above)' }, { value: 'ok', label: 'Acceptable (70–84%)' }, { value: 'poor', label: 'Poor (below 70%)' }, { value: 'critical', label: 'Not acceptable (critical item)' }, { value: 'repeat', label: 'Has repeat findings' }, { value: 'open', label: 'Has open corrective actions' }],
    test: (a, v) => { if (a.status !== 'Completed') return false; const sc = a.score, r = auditRating(sc).tone;
      return v === 'critical' ? !!sc.critical : v === 'good' ? !sc.critical && r === 'green' : v === 'ok' ? !sc.critical && r === 'amber' : v === 'poor' ? !sc.critical && r === 'red'
        : v === 'repeat' ? (a.findingsList || []).some(f => f.repeat) : (a.findingsList || []).some(f => f.action && actionOpen(byId('actions', f.action) || {})); } },
  fperiod: { all: 'Any date', list: () => [{ value: '3', label: 'Last 3 months' }, { value: '6', label: 'Last 6 months' }, { value: '12', label: 'Last 12 months' }, { value: 'year', label: 'This year' }],
    test: (a, v) => v === 'year' ? a.date.slice(0, 4) === TODAY.slice(0, 4) : daysTo(a.date) >= -Math.round(+v * 30.44) }
};
function auditRecordsHtml(all, q = {}) {
  if (!all.length) return `<div class="card">${emptyList('No audits yet.')}</div>`;
  const base = '#/audits/records', on = Object.keys(AUD_FLT).filter(k => q[k]);
  const audits = all.filter(a => on.every(k => AUD_FLT[k].test(a, q[k])));
  const sel = k => { const f = AUD_FLT[k]; if (f.show && !f.show()) return ''; return `<select data-flt="${k}" aria-label="${esc(f.all)}"><option value="">${esc(f.all)}</option>${f.list().map(o => `<option value="${esc(o.value)}" ${q[k] === o.value ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`; };
  setTimeout(() => fltSearch(base), 0);
  const bar = `<div class="toolbar flt-bar" data-base="${base}" data-total="${all.length}" data-shown="${audits.length}">
    <div class="search">${icon('search', 'sm')}<input type="search" data-fq="${base}" placeholder="Search audits and findings…" value="${esc(FLT_Q[base] || '')}" aria-label="Search audits"></div>
    ${Object.keys(AUD_FLT).map(sel).join('')}
    ${on.length ? `<button type="button" class="link-btn" data-act="audFltClear">Clear filters</button>` : ''}
    <span class="tb-count">${audits.length} of ${all.length} records</span></div>`;
  if (!audits.length) return `<div class="card">${bar}${emptyList('No audits match these filters.')}</div>`;
  return `<div class="card">${bar}<div class="card-body flush"><div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Audit</th><th>Branch / area</th><th>Date</th><th>Auditor</th><th>Score</th><th>Findings</th><th>Status</th></tr></thead><tbody>
    ${audits.map(a => { const r = auditRating(a.score || {}), f = auditFindings(a);
      return `<tr class="rowlink" data-href="#/audits/${a.id}"><td data-label="Audit"><span class="mono">${a.id}</span><div class="t-title">${esc(a.template.title)}</div><span hidden>${esc(a.template.category)} ${f.map(x => esc(x.text + " " + (x.note || ""))).join(" ")}</span></td><td data-label="Branch">${esc(sname(a.site))}${a.area ? `<div class="t-sub">${esc(a.area)}</div>` : ''}</td><td data-label="Date">${fmt(a.date)}</td><td data-label="Auditor">${esc(pname(a.auditor))}</td><td data-label="Score">${a.status === 'Completed' ? `<b class="due ${r.tone}">${a.score.pct}%</b><div class="t-sub">${esc(r.label)}</div>` : '—'}</td><td data-label="Findings">${f.length ? `${f.filter(x => x.g === 'Major').length} major · ${f.filter(x => x.g === 'Minor').length} minor · ${f.filter(x => x.g === 'Observation').length} obs.` : a.status === 'Completed' ? 'None' : '—'}</td><td data-label="Status">${badge(a.status, a.status === 'Completed' ? 'green' : 'blue')}</td></tr>`; }).join('')}
  </tbody></table></div></div></div>`;
}
function auditTemplatesHtml() {
  return `<div class="alert info">${icon('lock')}<div>Audit checklists are <b>controlled</b>: a new checklist or a change is a draft until it is approved, and completed audits keep the revision used at the time. The VDW starter checklists are suggestions to adapt to each site. <b>The legal compliance checklist does not quote legislation</b>: add the references from the official text before relying on it.</div></div>
  <div class="grid g2">${auditTemplates().map(t => { const cur = atCurrent(t), dr = atDraft(t), shown = cur || dr, n = audItems(shown).length;
    return `<div class="card at-card"><div class="card-head"><div><h2>${can('doc.create') ? `<a href="#/audits/builder/${t.id}" class="at-link">${esc(t.title)}</a>` : esc(t.title)}</h2><span class="ch-sub">${esc(t.category)} · <span class="mono">${esc(t.docNumber)}</span>${t.starter ? ' · VDW starter checklist' : t.replaces ? ' · your version of the VDW starter' : ''}</span></div>${cur ? badge('Rev ' + cur.rev, 'green', true) : badge('Draft — not yet approved', 'amber')}</div><div class="card-body">
      <p class="t-sub">${shown.sections.length} section(s) · ${n} item(s) · ${audItems(shown).filter(i => i.critical).length} critical</p>
      <ul class="at-sections">${shown.sections.map(s => `<li>${esc(s.title)} <span class="t-sub">(${s.items.length})</span></li>`).join('')}</ul>
      <div class="btn-row mt-s">${dr ? permBtn('doc.approve', `<button class="btn sm success" data-act="audTplApprove" data-id="${t.id}">Approve Rev ${dr.rev}</button>`) + permBtn('doc.create', `<a class="btn sm" href="#/audits/builder/${t.id}">${icon('edit', 'sm')} Edit draft</a>`) : permBtn('doc.create', `<a class="btn sm primary" href="#/audits/builder/${t.id}">${icon('edit', 'sm')} Edit checklist</a>`)}${permBtn('doc.create', `<a class="btn sm ghost" href="#/audits/builder/new?copy=${t.id}">Copy as new checklist</a>`)}</div>
    </div></div>`; }).join('')}</div>`;
}

/* ---------------- Plan and start ---------------- */
ACT.audFltClear = (el) => { FLT_Q['#/audits/records'] = ''; fltGo(el.closest('.flt-bar'), Object.fromEntries(Object.keys(AUD_FLT).map(k => [k, '']))); };
ACT.audPlanNew = () => openModal({ title: 'Plan an audit', sub: 'Adds a recurring audit to the programme. The auditor gets a task when it is due.', body: `<div class="form-grid">
    ${fld({ name: 'template', label: 'Audit checklist', type: 'select', options: opts(auditTemplates().filter(atCurrent).map(t => ({ value: t.id, label: `${t.title}` })), '', '— Select —'), required: true, full: true })}
    ${fld({ name: 'site', label: 'Branch', type: 'select', options: siteOptions(defaultSite(), false), required: true })}
    ${fld({ name: 'area', label: 'Area (optional)', placeholder: 'e.g. Warehouse and dispatch' })}
    ${fld({ name: 'auditor', label: 'Auditor', type: 'select', options: personOptions(S.ui.user, x => !!x.sysRole), required: true })}
    ${fld({ name: 'months', label: 'Every (months)', type: 'number', min: 1, max: 36, value: 3, required: true })}
    ${fld({ name: 'nextDue', label: 'First / next audit due', type: 'date', value: addDays(TODAY, 14), required: true })}</div>`,
  buttons: [{ label: 'Add to programme', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); S.auditPlans = S.auditPlans || []; const id = nextId('APL-', 'auditPlans');
    S.auditPlans.push({ id, template: v.template, site: v.site, org: siteOrgOf(v.site), area: v.area, auditor: v.auditor, months: Math.max(1, Math.round(+v.months)), nextDue: v.nextDue });
    log(`Planned audit ${id}: ${byId('auditTemplates', v.template).title} at ${sname(v.site)}`, '#/audits/programme'); save(); toast('Added to the audit programme.'); rerender(); } }] });
// Edit, pause / resume or remove a planned audit
ACT.audPlanEdit = (el) => {
  const x = byId('auditPlans', el.dataset.id), open = (S.audits || []).find(a => a.plan === x.id && a.status === 'In progress');
  const tpls = auditTemplates().filter(t => atCurrent(t) || t.id === x.template);
  openModal({ title: 'Edit planned audit', sub: 'Change the checklist, branch, auditor, interval or due date, or pause the audit for a while (e.g. a branch closed for renovation).', body: `<div class="form-grid">
    ${fld({ name: 'template', label: 'Audit checklist', type: 'select', options: opts(tpls.map(t => ({ value: t.id, label: t.title })), x.template), required: true, full: true })}
    ${fld({ name: 'site', label: 'Branch', type: 'select', options: siteOptions(x.site, false), required: true })}
    ${fld({ name: 'area', label: 'Area (optional)', value: x.area || '' })}
    ${fld({ name: 'auditor', label: 'Auditor', type: 'select', options: personOptions(x.auditor, p => !!p.sysRole), required: true })}
    ${fld({ name: 'months', label: 'Every (months)', type: 'number', min: 1, max: 36, value: x.months, required: true })}
    ${fld({ name: 'nextDue', label: 'Next audit due', type: 'date', value: x.nextDue, required: true })}
    ${fld({ name: 'status', label: 'Status', type: 'select', options: opts(['Active', 'Paused'], x.paused ? 'Paused' : 'Active') })}
    ${fld({ name: 'pauseReason', label: 'Reason for pausing (required when paused)', value: x.pauseReason || '', full: true, placeholder: 'e.g. Branch closed for renovation until March' })}
    </div>${open ? `<div class="alert info mt-s" style="margin-bottom:0">${icon('info')}<div>Audit <b>${open.id}</b> is in progress for this plan. It cannot be removed until that audit is completed or discarded.</div></div>` : ''}`,
    size: 'wide',
    buttons: [
      { label: 'Remove from programme', cls: 'danger', onClick: () => { if (open) { toast(`Finish or discard audit ${open.id} first.`, 'error'); return false; }
        setTimeout(() => confirmBox('Remove this planned audit?', `${esc((byId('auditTemplates', x.template) || {}).title || '')} at ${esc(sname(x.site))} is removed from the programme. Completed audits stay on record.`, 'Remove', () => { S.auditPlans = S.auditPlans.filter(y => y.id !== x.id); log(`Removed planned audit ${x.id} (${(byId('auditTemplates', x.template) || {}).title || x.template}, ${sname(x.site)}) from the programme`, '#/audits/programme'); save(); toast('Removed from the audit programme.'); rerender(); }, 'danger solid'), 30); } },
      { label: 'Save changes', cls: 'primary', onClick: m => {
        if (!validateForm(m)) return false; const v = readForm(m);
        if (v.status === 'Paused' && !(v.pauseReason || '').trim()) { toast('Give a reason for pausing.', 'error'); const f = m.querySelector('[name=pauseReason]'); if (f) f.focus(); return false; }
        const before = JSON.stringify([x.template, x.site, x.area, x.auditor, x.months, x.nextDue, !!x.paused]);
        const changes = [];
        if (v.template !== x.template) changes.push(`checklist → ${byId('auditTemplates', v.template).title}`);
        if (v.site !== x.site) changes.push(`branch → ${sname(v.site)}`);
        if ((v.area || '') !== (x.area || '')) changes.push(`area → ${v.area || '—'}`);
        if (v.auditor !== x.auditor) changes.push(`auditor → ${pname(v.auditor)}`);
        if (+v.months !== x.months) changes.push(`every ${v.months} month(s)`);
        if (v.nextDue !== x.nextDue) changes.push(`next due → ${fmt(v.nextDue)}`);
        if ((v.status === 'Paused') !== !!x.paused) changes.push(v.status === 'Paused' ? `paused: ${v.pauseReason.trim()}` : 'resumed');
        const newAuditor = v.auditor !== x.auditor, dueMoved = v.nextDue !== x.nextDue;
        Object.assign(x, { template: v.template, site: v.site, org: siteOrgOf(v.site), area: v.area, auditor: v.auditor, months: Math.max(1, Math.round(+v.months)), nextDue: v.nextDue, paused: v.status === 'Paused', pauseReason: v.status === 'Paused' ? v.pauseReason.trim() : '' });
        if (dueMoved || newAuditor) x.sent = {};   // reminders start again for the new date or auditor
        if (JSON.stringify([x.template, x.site, x.area, x.auditor, x.months, x.nextDue, !!x.paused]) === before) return;
        (x.history = x.history || []).push({ ts: nowTs(), by: S.ui.user, text: changes.join('; ') });
        if (newAuditor && !x.paused) queueEmail([x.auditor], 'audits', `You are the auditor: ${byId('auditTemplates', x.template).title} at ${sname(x.site)}`, `${pname(S.ui.user)} made you the auditor for the ${byId('auditTemplates', x.template).title} at ${sname(x.site)}${x.area ? ' (' + x.area + ')' : ''}, every ${x.months} month(s). Next audit due ${fmt(x.nextDue)}.`, '#/audits/programme');
        log(`Changed planned audit ${x.id}: ${changes.join('; ')}`, '#/audits/programme'); save(); toast('Planned audit updated.'); rerender();
      } }] });
};
ACT.audStart = (el) => {
  const plan = el && el.dataset && el.dataset.plan && byId('auditPlans', el.dataset.plan);
  openModal({ title: 'Start an audit', sub: 'Progress is saved as you go; you can stop and continue later.', body: `<div class="form-grid">
    ${fld({ name: 'template', label: 'Audit checklist', type: 'select', options: opts(auditTemplates().filter(atCurrent).map(t => ({ value: t.id, label: t.title })), plan ? plan.template : '', '— Select —'), required: true, full: true })}
    ${fld({ name: 'site', label: 'Branch', type: 'select', options: siteOptions(plan ? plan.site : defaultSite(), false), required: true })}
    ${fld({ name: 'area', label: 'Area audited', value: plan ? plan.area || '' : '', placeholder: 'e.g. Whole site, or Workshop' })}
    ${fld({ name: 'auditee', label: 'Auditee (person responsible for the area)', type: 'select', options: personOptions(plan ? site(plan.site).manager : site(defaultSite()).manager, x => !!x.sysRole) })}
    ${fld({ name: 'date', label: 'Audit date', type: 'date', value: TODAY, required: true })}</div>`,
    buttons: [{ label: 'Start audit', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m), t = byId('auditTemplates', v.template), cur = atCurrent(t);
      S.audits = S.audits || []; const id = nextId('AUD-', 'audits', 3, 100);
      S.audits.push({ id, plan: plan ? plan.id : null, org: siteOrgOf(v.site), site: v.site, area: v.area, auditor: S.ui.user, auditee: v.auditee || null, date: v.date, status: 'In progress', template: { templateId: t.id, title: t.title, category: t.category, docNumber: t.docNumber, rev: cur.rev, sections: JSON.parse(JSON.stringify(cur.sections)) }, answers: {}, summary: '', started: nowTs() });
      log(`Started audit ${id}: ${t.title} at ${sname(v.site)}`, '#/audits/' + id); save(); navigate('#/audits/' + id); } }] });
};

/* ---------------- Conducting an audit ---------------- */
const AUDSIG = { aud: null, auditee: null };
function audItemHtml(a, i, k) {
  const an = a.answers[i.id] || {}, rep = ['P', 'N'].includes(an.r) && isRepeat(a, i.id);
  return `<div class="au-item ${an.r === 'N' ? 'is-n' : an.r === 'P' ? 'is-p' : ''}" id="ai-${i.id}">
    <div class="au-q"><span class="q-num">${k}.</span><div><b>${esc(i.text)}</b> ${i.critical ? badge('Critical item', 'red', true) : ''}${rep ? ' ' + badge('Repeat finding', 'orange', true) : ''}${i.guidance ? `<div class="t-sub">${esc(i.guidance)}</div>` : ''}${i.ref ? `<div class="t-sub">Reference: ${esc(i.ref)}</div>` : ''}</div></div>
    <div class="au-seg" role="group" aria-label="Result for item ${k}">${AUD_RES.map(([v, l]) => `<button type="button" class="${an.r === v ? 'on-' + v.toLowerCase() : ''}" data-act="audAns" data-id="${a.id}" data-i="${i.id}" data-v="${v}" aria-pressed="${an.r === v}">${l}</button>`).join('')}</div>
    <div class="au-extra">
      <input type="text" class="au-note" data-aud="${a.id}" data-i="${i.id}" value="${esc(an.note || '')}" placeholder="${['P', 'N'].includes(an.r) ? 'What was found? (required)' : 'Note (optional)'}" aria-label="Note for item ${k}">
      ${['P', 'N'].includes(an.r) ? `<select class="au-grade" data-aud="${a.id}" data-i="${i.id}" aria-label="Finding grade">${AUD_GRADES.map(g => `<option ${(an.g || (i.critical || an.r === 'N' ? 'Major' : 'Minor')) === g ? 'selected' : ''}>${g}</option>`).join('')}</select>` : ''}
      <label class="btn sm au-photo">${icon('camera', 'sm')} Photo<input type="file" accept="image/*" capture="environment" hidden data-audp="${a.id}" data-i="${i.id}"></label>
    </div>
    ${(an.photos || []).length ? `<div class="au-photos">${photoStrip(an.photos)}</div>` : ''}
  </div>`;
}
function auditConduct(a) {
  const items = audItems(a.template), done = items.filter(i => (a.answers[i.id] || {}).r).length, sc = auditScore(a.template, a.answers), r = auditRating(sc);
  let k = 0;
  const html = `<div class="mobile-card" style="max-width:900px">
    <div class="controlled-header"><div class="chh"><div class="print-logo">${orgMark(orgOf(a.org || S.ui.org), 'doc')}<div><b style="font-size:12px">${esc(orgOf(a.org || S.ui.org).short)}</b><small>Audit</small></div></div><div class="ch-title">${esc(a.template.title)}</div><div class="ch-meta">Doc no: <b class="mono">${esc(a.template.docNumber)}</b><br>Revision: <b>${a.template.rev}</b></div></div></div>
    <div class="card mb"><div class="card-body" style="padding-top:14px"><div class="kv"><div>Audit</div><div class="mono">${a.id}</div><div>Branch / area</div><div>${esc(sname(a.site))}${a.area ? ' · ' + esc(a.area) : ''}</div><div>Auditor</div><div>${esc(pname(a.auditor))}</div><div>Auditee</div><div>${a.auditee ? esc(pname(a.auditee)) : '—'}</div><div>Date</div><div>${fmt(a.date)}</div></div></div></div>
    <div class="au-progress card mb"><div class="card-body"><div><b>${done} of ${items.length}</b> answered</div><div class="meter m-good"><span style="width:${Math.round((done / items.length) * 100)}%"></span></div><div>Score so far: <b class="due ${r.tone}">${sc.pct == null ? '—' : sc.pct + '%'}</b> ${sc.critical ? badge(sc.critical + ' critical item(s) not met', 'red', true) : ''}</div><div class="t-sub">Saved as you go — you can leave and continue later.</div></div></div>
    ${a.template.sections.map(s => `<div class="card mb au-section"><div class="card-head"><h2>${esc(s.title)}</h2><span class="ch-sub">${(() => { const x = sc.sections.find(y => y.title === s.title); return x && x.pct != null ? x.pct + '%' : ''; })()}</span></div><div class="card-body">${s.items.map(i => audItemHtml(a, i, ++k)).join('')}</div></div>`).join('')}
    <div class="card mt"><div class="card-body" style="padding-top:14px"><div class="form-grid">
      ${fld({ name: 'summary', label: 'Audit summary — what is going well and what needs attention', type: 'textarea', full: true, value: a.summary || '' })}
      <div class="field full" id="audSigField"><label for="audSig">Auditor signature<span class="req">*</span></label><div class="sig-wrap"><canvas id="audSig" class="sig-pad"></canvas><div class="sig-foot"><span>${esc(pname(a.auditor))}</span><button type="button" class="btn sm" data-act="audSigClear" data-k="aud">Clear</button></div></div></div>
      <div class="field full" id="audeeSigField"><label for="audeeSig">Auditee signature (findings discussed and accepted)</label><div class="sig-wrap"><canvas id="audeeSig" class="sig-pad"></canvas><div class="sig-foot"><span>${a.auditee ? esc(pname(a.auditee)) : 'Auditee'}</span><button type="button" class="btn sm" data-act="audSigClear" data-k="auditee">Clear</button></div></div></div>
    </div></div>
    <div class="au-foot"><button class="btn danger" data-act="audDelete" data-id="${a.id}">Discard audit</button><a class="btn" href="#/audits/records">Continue later</a><button class="btn primary" data-act="audFinish" data-id="${a.id}">${icon('check', 'sm')} Complete audit</button></div></div>
  </div>`;
  return { title: a.id, nav: 'audits', crumbs: [['Audits', '#/audits'], [a.id, '#']], html, after: () => { AUDSIG.aud = a.sigAuditorDraft || null; AUDSIG.auditee = a.sigAuditeeDraft || null; initSigPad('audSig', AUDSIG, 'aud', 'audSigField'); initSigPad('audeeSig', AUDSIG, 'auditee', 'audeeSigField'); } };
}
function audRedraw(a, itemId) {
  const items = audItems(a.template), k = items.findIndex(i => i.id === itemId), el = document.getElementById('ai-' + itemId);
  if (el && k >= 0) el.outerHTML = audItemHtml(a, items[k], k + 1);
  const pr = document.querySelector('.au-progress .card-body'); if (pr) { const done = items.filter(i => (a.answers[i.id] || {}).r).length, sc = auditScore(a.template, a.answers), r = auditRating(sc); pr.innerHTML = `<div><b>${done} of ${items.length}</b> answered</div><div class="meter m-good"><span style="width:${Math.round((done / items.length) * 100)}%"></span></div><div>Score so far: <b class="due ${r.tone}">${sc.pct == null ? '—' : sc.pct + '%'}</b> ${sc.critical ? badge(sc.critical + ' critical item(s) not met', 'red', true) : ''}</div><div class="t-sub">Saved as you go — you can leave and continue later.</div>`; }
}
ACT.audAns = (el) => { const a = byId('audits', el.dataset.id); const an = a.answers[el.dataset.i] = a.answers[el.dataset.i] || {}; an.r = el.dataset.v; if (['P', 'N'].includes(an.r) && !an.g) { const it = audItems(a.template).find(i => i.id === el.dataset.i); an.g = it.critical || an.r === 'N' ? 'Major' : 'Minor'; } save(); audRedraw(a, el.dataset.i); };
document.addEventListener('input', e => { const t = e.target; if (t.classList && t.classList.contains('au-note')) { const a = byId('audits', t.dataset.aud); (a.answers[t.dataset.i] = a.answers[t.dataset.i] || {}).note = t.value; save(); } if (t.name === 'summary' && /^#\/audits\/AUD-/.test(location.hash)) { const a = byId('audits', location.hash.split('/')[2]); if (a && a.status === 'In progress') { a.summary = t.value; save(); } } });
document.addEventListener('change', async e => { const t = e.target;
  if (t.classList && t.classList.contains('au-grade')) { const a = byId('audits', t.dataset.aud); (a.answers[t.dataset.i] = a.answers[t.dataset.i] || {}).g = t.value; save(); }
  if (t.dataset && t.dataset.audp) { const a = byId('audits', t.dataset.audp), an = a.answers[t.dataset.i] = a.answers[t.dataset.i] || {}; an.photos = an.photos || []; for (const f of [...t.files].filter(f => /^image\//.test(f.type)).slice(0, 4)) { const m = fileMeta(f); m.thumb = await makeThumb(f); an.photos.push(m); } save(); audRedraw(a, t.dataset.i); }
});
document.addEventListener('pointerup', () => { if (!/^#\/audits\/AUD-/.test(location.hash)) return; setTimeout(() => { const a = byId('audits', location.hash.split('/')[2]); if (a && a.status === 'In progress') { a.sigAuditorDraft = AUDSIG.aud; a.sigAuditeeDraft = AUDSIG.auditee; save(); } }, 30); });
ACT.audSigClear = (el) => { AUDSIG[el.dataset.k] = null; const c = document.getElementById(el.dataset.k === 'aud' ? 'audSig' : 'audeeSig'); if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height); };
ACT.audDelete = (el) => confirmBox('Discard this audit?', 'The answers recorded so far are removed. This cannot be undone.', 'Discard', () => { S.audits = S.audits.filter(x => x.id !== el.dataset.id); log(`Discarded audit ${el.dataset.id}`, '#/audits/records'); save(); navigate('#/audits/records'); }, 'danger solid');
ACT.audFinish = (el) => {
  const a = byId('audits', el.dataset.id), items = audItems(a.template);
  const missing = items.filter(i => !(a.answers[i.id] || {}).r);
  if (missing.length) { toast(`Answer every item (${missing.length} still open).`, 'error'); const x = document.getElementById('ai-' + missing[0].id); if (x) x.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
  const noNote = items.filter(i => ['P', 'N'].includes(a.answers[i.id].r) && !(a.answers[i.id].note || '').trim());
  if (noNote.length) { toast('Describe what was found for every partial or non-compliant item.', 'error'); const x = document.getElementById('ai-' + noNote[0].id); if (x) { x.scrollIntoView({ behavior: 'smooth', block: 'center' }); const n = x.querySelector('.au-note'); if (n) n.focus(); } return; }
  if (!AUDSIG.aud) { toast('The auditor must sign the audit.', 'error'); document.getElementById('audSigField').classList.add('invalid'); return; }
  const F = auditFindings(a), mgr = (site(a.site) || {}).manager || a.auditee || S.ui.user;
  const dueDays = { Major: 14, Minor: 30, Observation: 60 };
  openModal({ title: 'Complete audit — findings to corrective actions', sub: `${F.length} finding(s). Major and minor findings become corrective actions; observations are optional.`, size: 'wide',
    body: F.length ? `<div class="table-wrap"><table class="tbl compact"><thead><tr><th></th><th>Finding</th><th>Grade</th><th>Owner</th><th>Due</th></tr></thead><tbody>${F.map((f, k) => `<tr><td><input type="checkbox" name="raise${k}" ${f.g !== 'Observation' ? 'checked' : ''} aria-label="Raise an action"></td><td><b>${esc(f.text)}</b><div class="t-sub">${esc(f.note || '')}${isRepeat(a, f.id) ? ' · repeat finding' : ''}</div></td><td>${badge(f.g, f.g === 'Major' ? 'red' : f.g === 'Minor' ? 'amber' : 'grey', true)}</td><td><select name="owner${k}">${personOptions(mgr, canOwnActions)}</select></td><td><input type="date" name="due${k}" value="${addDays(TODAY, dueDays[f.g] || 30)}"></td></tr>`).join('')}</tbody></table></div>` : '<p>No findings — every item was compliant or not applicable.</p>',
    buttons: [{ label: 'Complete audit', cls: 'primary', onClick: m => {
      a.findingsList = [];
      F.forEach((f, k) => { const raise = m.querySelector(`[name=raise${k}]`).checked; let act = null;
        if (raise) act = createAction({ source: 'Audit', sourceId: a.id, title: `${a.template.title} (${sname(a.site)}): ${f.text}`, action: f.note, owner: m.querySelector(`[name=owner${k}]`).value, priority: f.g === 'Major' ? 'High' : f.g === 'Minor' ? 'Medium' : 'Low', due: m.querySelector(`[name=due${k}]`).value, site: a.site });
        a.findingsList.push({ item: f.id, grade: f.g, action: act ? act.id : null, repeat: isRepeat(a, f.id) }); });
      a.score = auditScore(a.template, a.answers); a.status = 'Completed'; a.completed = nowTs();
      a.sigAuditor = { by: a.auditor, name: pname(a.auditor), ts: nowTs(), image: AUDSIG.aud }; if (AUDSIG.auditee) a.sigAuditee = { by: a.auditee, name: a.auditee ? pname(a.auditee) : 'Auditee', ts: nowTs(), image: AUDSIG.auditee };
      delete a.sigAuditorDraft; delete a.sigAuditeeDraft;
      const plan = a.plan && byId('auditPlans', a.plan); if (plan) plan.nextDue = addMonths(a.date, plan.months);
      const raised = a.findingsList.filter(x => x.action).length;
      if (a.auditee) queueEmail([a.auditee], 'actions', `Audit ${a.id} completed: ${a.template.title} — ${a.score.pct}%`, `${pname(a.auditor)} completed the ${a.template.title} at ${sname(a.site)}. Score ${a.score.pct}% (${auditRating(a.score).label}). ${F.length} finding(s); ${raised} corrective action(s) raised.`, '#/audits/' + a.id);
      log(`Completed audit ${a.id} (${a.template.title}, ${sname(a.site)}): ${a.score.pct}% — ${raised} action(s) raised`, '#/audits/' + a.id); save(); toast(`Audit completed: ${a.score.pct}%. ${raised} corrective action(s) raised.`); navigate('#/audits/' + a.id);
    } }] });
};

/* ---------------- The completed audit (and its report) ---------------- */
function auditDetail(a) {
  const sc = a.status === 'Completed' ? a.score : auditScore(a.template, a.answers), r = auditRating(sc), F = auditFindings(a), prev = prevAudit(a);
  const hist = (S.audits || []).filter(x => x.status === 'Completed' && atFamily(x.template.templateId) === atFamily(a.template.templateId) && x.site === a.site).sort((x, y) => x.date.localeCompare(y.date)).slice(-6);
  let k = 0;
  const html = `<div class="status-hero"><div><div class="sh-id">${a.id} · ${esc(a.template.category)} · ${esc(sname(a.site))}</div><h1 style="margin:2px 0 6px">${esc(a.template.title)}</h1><div class="btn-row">${badge(a.status, a.status === 'Completed' ? 'green' : 'blue')} <span class="tag">${esc(a.template.docNumber)} Rev ${a.template.rev}</span> ${a.status === 'Completed' ? badge(r.label, r.tone) : ''}</div></div>
    <div class="sh-actions">${a.status === 'Completed' ? `<button class="btn primary" data-act="audPdf" data-id="${a.id}">${icon('download', 'sm')} Audit report (PDF)</button>` : a.auditor === S.ui.user ? `<a class="btn primary" href="#/audits/${a.id}">Continue</a>` : `<span class="muted">In progress — ${esc(pname(a.auditor))} is auditing</span>`}</div></div>
  <div class="detail"><div class="stack">
    <div class="card"><div class="card-head"><h2>Result</h2>${prev ? `<span class="ch-sub">Previous audit ${fmt(prev.date)}: ${prev.score.pct}% (${sc.pct - prev.score.pct >= 0 ? '+' : ''}${sc.pct - prev.score.pct} points)</span>` : ''}</div><div class="card-body au-result">
      ${scorePie(sc.pct || 0, 140, 'Audit score')}
      <div class="au-secs">${sc.sections.map(s => `<div><span>${esc(s.title)}</span><div class="mr-track"><i style="width:${s.pct || 0}%;background:var(--st-${s.pct == null ? 'good' : band(s.pct).cls})"></i></div><b>${s.pct == null ? 'N/A' : s.pct + '%'}</b></div>`).join('')}
        ${sc.critical ? `<div class="alert danger mt-s" style="margin-bottom:0">${icon('alert')}<div><b>${sc.critical} critical item(s) not met.</b> The result is "Not acceptable" until they are put right.</div></div>` : ''}</div>
    </div></div>
    <div class="card"><div class="card-head"><h2>Findings</h2><span class="ch-sub">${F.length} finding(s)</span></div><div class="card-body flush">${F.length ? `<div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Finding</th><th>Grade</th><th>Corrective action</th></tr></thead><tbody>${F.map(f => { const fl = (a.findingsList || []).find(x => x.item === f.id), act = fl && fl.action && byId('actions', fl.action);
      return `<tr><td data-label="Finding"><b>${esc(f.text)}</b>${f.critical ? ' ' + badge('Critical', 'red', true) : ''}${(fl ? fl.repeat : isRepeat(a, f.id)) ? ' ' + badge('Repeat finding', 'orange', true) : ''}<div class="t-sub">${esc(f.section)} · ${esc(f.note || '')}</div>${(f.photos || []).length ? photoStrip(f.photos) : ''}</td><td data-label="Grade">${badge(f.g, f.g === 'Major' ? 'red' : f.g === 'Minor' ? 'amber' : 'grey', true)}</td><td data-label="Action">${act ? `<a href="#/actions/${act.id}" class="mono">${act.id}</a> ${sbadge(act.status)}<div class="t-sub">${esc(pname(act.owner))} · due ${fmt(act.due)}</div>` : a.status === 'Completed' && canManageAudits() ? `<button class="btn sm" data-act="audRaise" data-id="${a.id}" data-i="${f.id}">Raise action</button>` : '—'}</td></tr>`; }).join('')}</tbody></table></div>` : emptyList('No findings.')}</div></div>
    <div class="card"><div class="card-head"><h2>Checklist</h2><span class="ch-sub">${esc(a.template.docNumber)} Rev ${a.template.rev}</span></div><div class="card-body flush">${a.template.sections.map(s => `<details class="au-det" open><summary>${esc(s.title)}</summary><table class="tbl compact stackable"><tbody>${s.items.map(i => { const an = a.answers[i.id] || {}; k++; return `<tr class="${an.r === 'N' ? 'row-red' : an.r === 'P' ? 'row-amber' : ''}"><td data-label="#">${k}</td><td data-label="Item">${esc(i.text)}${i.critical ? ' ' + badge('Critical', 'red', true) : ''}${an.note ? `<div class="t-sub">${esc(an.note)}</div>` : ''}</td><td data-label="Result">${an.r ? badge(AUD_RES.find(x => x[0] === an.r)[1], an.r === 'C' ? 'green' : an.r === 'P' ? 'amber' : an.r === 'N' ? 'red' : 'grey', true) : '—'}</td></tr>`; }).join('')}</tbody></table></details>`).join('')}</div></div>
  </div><div class="stack">
    <div class="card"><div class="card-head"><h2>Audit details</h2></div><div class="card-body"><div class="kv"><div>Date</div><div>${fmt(a.date)}</div><div>Branch / area</div><div>${esc(sname(a.site))}${a.area ? ' · ' + esc(a.area) : ''}</div><div>Auditor</div><div>${esc(pname(a.auditor))}</div><div>Auditor signature</div><div>${a.sigAuditor && a.sigAuditor.image ? `<span class="sig-show"><img src="${a.sigAuditor.image}" alt="Auditor signature"><small>${esc(a.sigAuditor.name)} · ${fmtTs(a.sigAuditor.ts)}</small></span>` : '—'}</div><div>Auditee</div><div>${a.auditee ? esc(pname(a.auditee)) : '—'}</div><div>Auditee signature</div><div>${a.sigAuditee && a.sigAuditee.image ? `<span class="sig-show"><img src="${a.sigAuditee.image}" alt="Auditee signature"><small>${esc(a.sigAuditee.name)} · ${fmtTs(a.sigAuditee.ts)}</small></span>` : '<span class="muted">Not signed</span>'}</div></div>${a.summary ? `<p class="mt-s" style="white-space:pre-wrap">${esc(a.summary)}</p>` : ''}</div></div>
    ${hist.length > 1 ? `<div class="card"><div class="card-head"><h2>Trend at this branch</h2></div><div class="card-body">${columnChart(hist.map(x => x.date.slice(0, 7)), hist.map(x => x.score.pct), { unit: '%', aria: 'Audit scores: ' + hist.map(x => `${fmt(x.date)} ${x.score.pct}%`).join(', ') })}</div></div>` : ''}
  </div></div>`;
  return { title: a.id, nav: 'audits', crumbs: [['Audits', '#/audits/records'], [a.id, '#']], html };
}
ACT.audRaise = (el) => { const a = byId('audits', el.dataset.id), f = auditFindings(a).find(x => x.id === el.dataset.i); raiseActionModal({ source: 'Audit', sourceId: a.id, title: `${a.template.title} (${sname(a.site)}): ${f.text}`, action: f.note, site: a.site, owner: (site(a.site) || {}).manager, priority: f.g === 'Major' ? 'High' : 'Medium' }, act => { a.findingsList = a.findingsList || []; const fl = a.findingsList.find(x => x.item === f.id); if (fl) fl.action = act.id; else a.findingsList.push({ item: f.id, grade: f.g, action: act.id }); save(); }); };

/* ---------------- Audit report PDF ---------------- */
ACT.audPdf = async (el) => {
  const a = byId('audits', el.dataset.id); toast('Preparing the audit report…', 'info');
  try {
    const { PDFDocument, StandardFonts, rgb } = await ensurePdfLib();
    const pdf = await PDFDocument.create(), R = await pdf.embedFont(StandardFonts.Helvetica), B = await pdf.embedFont(StandardFonts.HelveticaBold);
    const W = 595, H = 842, M = 40, ink = rgb(0.06, 0.1, 0.2), mute = rgb(0.4, 0.45, 0.55), line = rgb(0.86, 0.89, 0.93);
    const col = { green: rgb(0.05, 0.55, 0.3), amber: rgb(0.8, 0.55, 0.05), red: rgb(0.78, 0.2, 0.2), grey: mute };
    const pages = []; let pg, y; const newPage = () => { pg = pdf.addPage([W, H]); pages.push(pg); y = H - M; }; const need = h => { if (y - h < M + 30) newPage(); };
    const T = (s, x, yy, o = {}) => pg.drawText(pdfSafe(s), { x, y: yy, size: o.size || 9, font: o.bold ? B : R, color: o.color || ink });
    const wrap = (s, size, width, f = R) => { const out = []; let cur = ''; pdfSafe(s).split(' ').forEach(w => { const t = cur ? cur + ' ' + w : w; if (f.widthOfTextAtSize(t, size) > width && cur) { out.push(cur); cur = w; } else cur = t; }); if (cur) out.push(cur); return out; };
    const head = s => { need(28); y -= 6; T(s.toUpperCase(), M, y, { size: 8.5, bold: true, color: mute }); y -= 6; pg.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: line }); y -= 13; };
    const org = orgOf(a.org || S.ui.org), sc = a.score, r = auditRating(sc), F = auditFindings(a);
    newPage();
    T(org.name, M, y - 10, { size: 10, bold: true }); T('Audit report', M, y - 30, { size: 18, bold: true }); T(`${a.template.title} · ${a.template.docNumber} Rev ${a.template.rev}`, M, y - 46, { size: 10, color: mute });
    T(`${a.id}`, W - M - B.widthOfTextAtSize(a.id, 10), y - 10, { size: 10, bold: true });
    y -= 66;
    head('Audit details');
    [['Branch / area', `${sname(a.site)}${a.area ? ' · ' + a.area : ''}`], ['Date', fmt(a.date)], ['Auditor', pname(a.auditor)], ['Auditee', a.auditee ? pname(a.auditee) : '—']].forEach(([l, v]) => { T(l, M, y, { color: mute }); T(v, M + 110, y); y -= 13; });
    y -= 4; head('Result');
    pg.drawRectangle({ x: M, y: y - 46, width: 110, height: 52, borderColor: col[r.tone], borderWidth: 1.5, color: rgb(0.98, 0.98, 0.99) });
    T(sc.pct + '%', M + 14, y - 26, { size: 24, bold: true, color: col[r.tone] }); T(wrap(r.label, 7.5, 95)[0], M + 14, y - 40, { size: 7.5, bold: true, color: col[r.tone] });
    sc.sections.forEach((s, n) => { const yy = y - 4 - n * 12; T(s.title, M + 125, yy, { size: 8.5 }); pg.drawRectangle({ x: M + 330, y: yy - 1, width: 150, height: 6, color: line }); if (s.pct != null) pg.drawRectangle({ x: M + 330, y: yy - 1, width: 1.5 * s.pct, height: 6, color: col[s.pct >= 85 ? 'green' : s.pct >= 70 ? 'amber' : 'red'] }); T(s.pct == null ? 'N/A' : s.pct + '%', M + 488, yy, { size: 8.5, bold: true }); });
    y -= Math.max(60, sc.sections.length * 12 + 12);
    if (a.summary) { head('Summary'); wrap(a.summary, 9, W - 2 * M).forEach(l => { need(12); T(l, M, y); y -= 12; }); }
    head(`Findings (${F.length})`);
    if (!F.length) { T('No findings.', M, y, { color: mute }); y -= 14; }
    F.forEach(f => { const fl = (a.findingsList || []).find(x => x.item === f.id), act = fl && fl.action && byId('actions', fl.action);
      const ls = wrap(f.text, 9, 360, B), ns = wrap(f.note || '', 8, 360); need((ls.length + ns.length) * 11 + 8);
      T(f.g + (fl && fl.repeat ? ' · repeat' : ''), M, y, { size: 8.5, bold: true, color: col[f.g === 'Major' ? 'red' : f.g === 'Minor' ? 'amber' : 'grey'] });
      ls.forEach((l, n) => T(l, M + 80, y - n * 11, { bold: true })); ns.forEach((l, n) => T(l, M + 80, y - (ls.length + n) * 11, { size: 8, color: mute }));
      if (act) T(`${act.id} · ${pname(act.owner)} · due ${fmt(act.due)}`, M + 80, y - (ls.length + ns.length) * 11, { size: 8, color: mute });
      y -= (ls.length + ns.length + (act ? 1 : 0)) * 11 + 6; pg.drawLine({ start: { x: M, y: y + 3 }, end: { x: W - M, y: y + 3 }, thickness: 0.3, color: line }); y -= 4; });
    head('Checklist');
    a.template.sections.forEach(s => { need(26); T(s.title, M, y, { bold: true, size: 9.5 }); y -= 13;
      s.items.forEach(i => { const an = a.answers[i.id] || {}, ls = wrap(i.text, 8.5, 400); need(ls.length * 10.5 + 3); ls.forEach((l, n) => T(l, M + 8, y - n * 10.5, { size: 8.5 })); const res = (AUD_RES.find(x => x[0] === an.r) || [, '—'])[1]; T(res, M + 430, y, { size: 8.5, bold: true, color: an.r === 'C' ? col.green : an.r === 'P' ? col.amber : an.r === 'N' ? col.red : mute }); y -= ls.length * 10.5 + 3; });
      y -= 4; });
    head('Sign-off'); need(80);
    for (const [lbl, sg] of [['Auditor', a.sigAuditor], ['Auditee', a.sigAuditee]]) { const x = lbl === 'Auditor' ? M : M + 260; T(lbl, x, y, { color: mute });
      if (sg && sg.image) { try { const im = await pdf.embedPng(Uint8Array.from(atob(sg.image.split(',')[1]), c => c.charCodeAt(0))); const s = Math.min(160 / im.width, 44 / im.height); pg.drawImage(im, { x, y: y - 52, width: im.width * s, height: im.height * s }); } catch (e) { /* signature image optional */ } T(`${sg.name} · ${fmtTs(sg.ts)}`, x, y - 62, { size: 7.5, color: mute }); } else T('Not signed', x, y - 20, { size: 8.5, color: mute }); }
    y -= 72;
    pages.forEach((p, n) => { p.drawLine({ start: { x: M, y: 34 }, end: { x: W - M, y: 34 }, thickness: 0.4, color: line }); p.drawText(pdfSafe(`${org.short} · ${a.id} · ${a.template.title} · The score is an indication from the checklist answers; it does not guarantee legal compliance.`), { x: M, y: 22, size: 6.8, font: R, color: mute }); p.drawText(`Page ${n + 1} of ${pages.length} · Powered by VDW`, { x: W - M - 95, y: 12, size: 6.8, font: R, color: mute }); });
    const blob = new Blob([await pdf.save()], { type: 'application/pdf' });
    if (await saveFile(`Audit_${a.id}_${sname(a.site).replace(/\W+/g, '_')}_${a.date}.pdf`, blob)) { toast('Audit report downloaded.'); log(`Downloaded the audit report for ${a.id}`, '#/audits/' + a.id); save(); }
  } catch (e) { console.error(e); toast('The report could not be made: ' + esc(e.message), 'error'); }
};

/* ---------------- Building your own audit checklist ---------------- */
let AB = null;   // the checklist being edited
function abNewItem() { return { id: 'i' + Math.random().toString(36).slice(2, 8), text: '', guidance: '', ref: '', weight: 1, critical: false }; }
function auditBuilder(id, q) {
  const mine = id && (S.auditTemplates || []).find(x => x.org === S.ui.org && x.replaces === id); if (mine) id = mine.id;   // the company already has its own version of this starter
  if (!AB || AB.key !== (id || 'new') + (q.copy || '')) {
    const src = id && id !== 'new' ? byId('auditTemplates', id) : q.copy ? byId('auditTemplates', q.copy) : null, base = src ? (atDraft(src) || atCurrent(src)) : null;
    AB = { key: (id || 'new') + (q.copy || ''), id: id && id !== 'new' ? id : null, title: src ? (q.copy ? src.title + ' (copy)' : src.title) : '', category: src ? src.category : 'Other', docNumber: src && !q.copy ? src.docNumber : '', note: '', sections: base ? JSON.parse(JSON.stringify(base.sections)) : [{ title: '', items: [abNewItem()] }] };
  }
  const t = AB.id && byId('auditTemplates', AB.id), cur = t && atCurrent(t);
  const html = `${pageHead(AB.id ? `Edit checklist: ${esc(t.title)}` : 'New audit checklist', AB.id ? `Change, add, remove or reorder sections and items. Your changes are saved as Rev ${atDraft(t) ? atDraft(t).rev : cur ? cur.rev + 1 : 1} (draft). ${cur ? `Rev ${cur.rev} stays in use until the draft is approved by someone other than you.` : ''}${t.org == null ? ' This is a VDW starter checklist: your changes become your company\'s own version; other companies keep the starter.' : ''}` : 'Build a checklist the same way as an inspection template. It is saved as a draft and must be approved before audits can use it.')}
  <div class="card mb"><div class="card-body" style="padding-top:14px"><div class="form-grid" id="abHead">
    ${fld({ name: 'title', label: 'Checklist title', value: AB.title, required: true, full: true, placeholder: 'e.g. Workshop housekeeping audit' })}
    ${fld({ name: 'category', label: 'Kind of audit', type: 'select', options: opts(AUD_CATS, AB.category), required: true })}
    ${fld({ name: 'docNumber', label: 'Document number', value: AB.docNumber, required: true, placeholder: 'e.g. KIE-AUD-010' })}
    ${AB.id ? fld({ name: 'note', label: 'What changed (change note)', value: AB.note, required: true, full: true }) : ''}
  </div></div></div>
  <div id="abSecs">${AB.sections.map((s, si) => `<div class="card mb ab-sec"><div class="card-head"><input class="ab-sec-title" data-s="${si}" value="${esc(s.title)}" placeholder="Section title, e.g. Walkways and access" aria-label="Section ${si + 1} title"><div class="btn-row">${si ? `<button class="btn sm ghost" data-act="abMove" data-s="${si}" data-d="-1" title="Move section up">↑</button>` : ''}${si < AB.sections.length - 1 ? `<button class="btn sm ghost" data-act="abMove" data-s="${si}" data-d="1" title="Move section down">↓</button>` : ''}<button class="btn sm ghost" data-act="abDelSec" data-s="${si}">Remove section</button></div></div><div class="card-body">
    ${s.items.map((it, ii) => `<div class="ab-item"><span class="q-num">${ii + 1}.</span><div class="ab-fields">
      <input class="ab-in" data-s="${si}" data-i="${ii}" data-k="text" value="${esc(it.text)}" placeholder="What is checked, e.g. Emergency exits are unlocked and clear" aria-label="Item text">
      <div class="ab-row"><input class="ab-in" data-s="${si}" data-i="${ii}" data-k="guidance" value="${esc(it.guidance || '')}" placeholder="Guidance for the auditor (optional)" aria-label="Guidance"><input class="ab-in" data-s="${si}" data-i="${ii}" data-k="ref" value="${esc(it.ref || '')}" placeholder="Reference (optional, from the official text or your procedure)" aria-label="Reference"></div>
      <div class="ab-row ab-opts"><label>Weight <select class="ab-in" data-s="${si}" data-i="${ii}" data-k="weight">${[1, 2, 3].map(w => `<option ${+it.weight === w ? 'selected' : ''}>${w}</option>`).join('')}</select></label><label class="check"><input type="checkbox" class="ab-in" data-s="${si}" data-i="${ii}" data-k="critical" ${it.critical ? 'checked' : ''}> <span>Critical item</span></label>
        <span class="ab-move">${ii ? `<button class="btn sm ghost" data-act="abMoveItem" data-s="${si}" data-i="${ii}" data-d="-1" title="Move up">↑</button>` : ''}${ii < s.items.length - 1 ? `<button class="btn sm ghost" data-act="abMoveItem" data-s="${si}" data-i="${ii}" data-d="1" title="Move down">↓</button>` : ''}<button class="btn sm ghost" data-act="abDelItem" data-s="${si}" data-i="${ii}" title="Remove item">${icon('x', 'sm')}</button></span></div>
    </div></div>`).join('')}
    <button class="btn sm" data-act="abAddItem" data-s="${si}">${icon('plus', 'sm')} Add item</button></div></div>`).join('')}</div>
  <button class="btn" data-act="abAddSec">${icon('plus', 'sm')} Add section</button>
  <p class="muted mt-s" style="font-size:12px">Weight sets how much an item counts towards the score (1–3). A critical item that is not met makes the audit "Not acceptable" whatever the score.</p>
  <div class="btn-row mt"><a class="btn" href="#/admin/audittemplates" data-act="abCancel">Cancel</a><button class="btn primary" data-act="abSave">Save as draft</button></div>`;
  return { title: 'Audit checklist', nav: 'admin', crumbs: [['Administration', '#/admin'], ['Audit checklists', '#/admin/audittemplates'], [AB.id ? 'Edit checklist' : 'New checklist', '#']], html };
}
document.addEventListener('input', e => { const t = e.target; if (!AB || !/^#\/audits\/builder/.test(location.hash)) return;
  if (t.classList.contains('ab-sec-title')) AB.sections[+t.dataset.s].title = t.value;
  if (t.classList.contains('ab-in') && t.type !== 'checkbox') { const it = AB.sections[+t.dataset.s].items[+t.dataset.i]; it[t.dataset.k] = t.dataset.k === 'weight' ? +t.value : t.value; }
  if (t.closest && t.closest('#abHead') && t.name) AB[t.name] = t.value;
});
document.addEventListener('change', e => { const t = e.target; if (!AB || !/^#\/audits\/builder/.test(location.hash)) return;
  if (t.classList.contains('ab-in')) { const it = AB.sections[+t.dataset.s].items[+t.dataset.i]; it[t.dataset.k] = t.type === 'checkbox' ? t.checked : t.dataset.k === 'weight' ? +t.value : t.value; }
  if (t.closest && t.closest('#abHead') && t.name) AB[t.name] = t.value;
});
ACT.abAddItem = (el) => { AB.sections[+el.dataset.s].items.push(abNewItem()); rerender(); setTimeout(() => { const ins = document.querySelectorAll(`.ab-in[data-s="${el.dataset.s}"][data-k=text]`); if (ins.length) ins[ins.length - 1].focus(); }, 0); };
ACT.abDelItem = (el) => { const s = AB.sections[+el.dataset.s]; s.items.splice(+el.dataset.i, 1); if (!s.items.length) s.items.push(abNewItem()); rerender(); };
ACT.abMoveItem = (el) => { const s = AB.sections[+el.dataset.s], i = +el.dataset.i, j = i + +el.dataset.d; [s.items[i], s.items[j]] = [s.items[j], s.items[i]]; rerender(); };
ACT.abAddSec = () => { AB.sections.push({ title: '', items: [abNewItem()] }); rerender(); };
ACT.abDelSec = (el) => { AB.sections.splice(+el.dataset.s, 1); if (!AB.sections.length) AB.sections.push({ title: '', items: [abNewItem()] }); rerender(); };
ACT.abMove = (el) => { const i = +el.dataset.s, j = i + +el.dataset.d; [AB.sections[i], AB.sections[j]] = [AB.sections[j], AB.sections[i]]; rerender(); };
ACT.abCancel = () => { AB = null; };
ACT.abSave = () => {
  const head = document.getElementById('abHead'); if (!validateForm(head)) return;
  const secs = AB.sections.map(s => ({ title: s.title.trim(), items: s.items.filter(i => i.text.trim()).map(i => ({ id: i.id, text: i.text.trim(), guidance: (i.guidance || '').trim(), ref: (i.ref || '').trim(), weight: +i.weight || 1, critical: !!i.critical })) })).filter(s => s.items.length);
  if (!secs.length) { toast('Add at least one item.', 'error'); return; }
  if (secs.some(s => !s.title)) { toast('Give every section a title.', 'error'); return; }
  S.auditTemplates = S.auditTemplates || [];
  if (S.auditTemplates.some(t => t.id !== AB.id && t.replaces !== AB.id && t.docNumber.toLowerCase() === AB.docNumber.trim().toLowerCase())) { toast('This document number is already used.', 'error'); return; }
  if (AB.id && byId('auditTemplates', AB.id).org == null) {   // a VDW starter: make the company's own copy, keeping the approved starter revision in use until the change is approved
    const st = byId('auditTemplates', AB.id), stCur = atCurrent(st), id = nextId('ATPL-', 'auditTemplates', 3);
    S.auditTemplates.push({ id, org: S.ui.org, replaces: st.id, title: st.title, category: st.category, docNumber: st.docNumber, owner: S.ui.user, revisions: stCur ? [JSON.parse(JSON.stringify(stCur))] : [] });
    (S.auditPlans || []).filter(x => x.template === st.id && x.org === S.ui.org).forEach(x => { x.template = id; });
    log(`Made ${S.ui.org ? orgOf(S.ui.org).short + '\'s' : 'a'} own version of the VDW starter checklist ${st.docNumber}`, '#/admin/audittemplates');
    AB.id = id;
  }
  if (AB.id) { const t = byId('auditTemplates', AB.id), cur = atCurrent(t), dr = atDraft(t); Object.assign(t, { title: AB.title.trim(), category: AB.category, docNumber: AB.docNumber.trim() });
    if (dr) Object.assign(dr, { sections: secs, changeNote: AB.note, revDate: TODAY }); else t.revisions.push({ rev: cur ? cur.rev + 1 : 1, status: 'Draft', revDate: TODAY, changeNote: AB.note, author: S.ui.user, sections: secs });
    log(`Saved a draft revision of audit checklist ${t.docNumber}`, '#/admin/audittemplates'); }
  else { const id = nextId('ATPL-', 'auditTemplates', 3); S.auditTemplates.push({ id, org: S.ui.org, title: AB.title.trim(), category: AB.category, docNumber: AB.docNumber.trim(), owner: S.ui.user, revisions: [{ rev: 1, status: 'Draft', revDate: TODAY, changeNote: 'First issue', author: S.ui.user, sections: secs }] });
    log(`Created audit checklist ${AB.docNumber.trim()} (Rev 1 draft)`, '#/admin/audittemplates'); }
  AB = null; save(); toast('Saved as a draft — approve it before audits can use it.'); navigate('#/admin/audittemplates');
};
ACT.audTplNew = () => { AB = null; navigate('#/audits/builder/new'); };
ACT.audTplApprove = (el) => { const t = byId('auditTemplates', el.dataset.id), d = atDraft(t);
  if (d.author === S.ui.user) { toast('Someone other than the author must approve the checklist.', 'error'); return; }
  confirmBox('Approve audit checklist', `Approve ${esc(t.docNumber)} Rev ${d.rev}? New audits will use this revision; completed audits keep the revision they used.`, 'Approve', () => { t.revisions.forEach(r => { if (r.status === 'Approved') r.status = 'Superseded'; }); Object.assign(d, { status: 'Approved', approvedBy: S.ui.user, approvedOn: TODAY }); log(`Approved audit checklist ${t.docNumber} Rev ${d.rev}`, '#/admin/audittemplates'); save(); toast(`Rev ${d.rev} approved.`); rerender(); }, 'success'); };

/* ---------------- Wiring: menu, areas, actions, tasks, search ---------------- */
// Checklists live in Administration; old links to the former checklist tabs open them there
const _auditsRoute = ROUTES.audits, _inspectionsRoute = ROUTES.inspections;
function checklistRedirect(tab) { history.replaceState(null, '', '#/admin/' + tab); return ROUTES.admin([tab], {}); }
ROUTES.audits = (p, q) => p[0] === 'templates' ? checklistRedirect('audittemplates') : _auditsRoute(p, q);
ROUTES.inspections = (p, q) => p[0] === 'templates' ? checklistRedirect('templates') : _inspectionsRoute(p, q);
(() => { const g = NAV.find(x => x.group === 'Assets & inspections'); if (!NAV.some(x => x.items.some(i => i[0] === 'audits'))) NAV.splice(NAV.indexOf(g) + 1, 0, { group: 'Audits', items: [['audits', 'Audits', 'shield']] }); })();
AREA_OF.audits = 'area.audits';
if (!TOP_ROUTES.includes('audits')) TOP_ROUTES.push('audits');
if (!SOURCE_MODULES.includes('Audit')) SOURCE_MODULES.splice(SOURCE_MODULES.length - 1, 0, 'Audit');
const _sourceLinkBeforeAudit = sourceLink;
sourceLink = function (a) { return a.source === 'Audit' && byId('audits', a.sourceId) ? `<a href="#/audits/${a.sourceId}">${esc(a.sourceId)}</a>` : _sourceLinkBeforeAudit(a); };
const _needsBackBeforeAudit = needsBack;
needsBack = function (parts) { if (parts[0] === 'audits' && ['programme', 'records'].includes(parts[1])) return false; return _needsBackBeforeAudit(parts); };
const _myTasksBeforeAudits = myTasks;
myTasks = function () {
  const out = _myTasksBeforeAudits();
  // the HSEQ Manager gets a task for every audit that is escalated (long overdue) in their company
  if (hseqManagers(S.ui.org).includes(S.ui.user)) (S.auditPlans || []).filter(x => inSite(x, S.ui.site) && planEscalated(x) && !(S.audits || []).some(a => a.plan === x.id && a.status === 'In progress')).forEach(x => { const t = byId('auditTemplates', x.template); out.push({ title: `Escalated: audit overdue — ${t ? t.title : x.template}, ${sname(x.site)}`, sub: `Due ${fmt(x.nextDue)} (${-daysTo(x.nextDue)} days overdue) · auditor ${pname(x.auditor)}`, link: '#/audits/programme', sev: 'red' }); });
  (S.auditPlans || []).filter(x => !x.paused && inSite(x, 'ALL') && x.auditor === S.ui.user && daysTo(x.nextDue) <= 14 && !(S.audits || []).some(a => a.plan === x.id && a.status === 'In progress')).forEach(x => { const t = byId('auditTemplates', x.template); out.push({ title: `Audit: ${t ? t.title : x.template} — ${sname(x.site)}`, sub: `Due ${fmt(x.nextDue)}`, link: '#/audits/programme', sev: daysTo(x.nextDue) < 0 ? 'red' : 'amber' }); });
  (S.audits || []).filter(a => a.status === 'In progress' && a.auditor === S.ui.user).forEach(a => out.push({ title: `Finish audit ${a.id}: ${a.template.title}`, sub: `${sname(a.site)} · started ${fmt(a.date)}`, link: '#/audits/' + a.id, sev: 'blue' }));
  if (can('doc.approve')) auditTemplates().filter(t => { const d = atDraft(t); return d && d.author !== S.ui.user; }).forEach(t => out.push({ title: `Approve audit checklist ${t.docNumber}`, sub: t.title, link: '#/admin/audittemplates', sev: 'blue' }));
  return out;
};

/* ---------------- Reminders and escalation by e-mail ----------------
   Checked whenever the system is opened (a daily server job in production). Each e-mail goes once per due date:
   - 14 days before:            the auditor
   - overdue (day after due):   the auditor and the branch manager
   - 14 days overdue:           escalated to the HSEQ Manager(s), copying the auditor
   Paused plans and plans with an audit in progress get none. */
MAIL_CATS.audits = 'Audits: due, overdue and escalated';
const _mailPrefsBeforeAudits = mailPrefs;
mailPrefs = function (p) { return Object.assign({ audits: true }, _mailPrefsBeforeAudits(p)); };
function sendAsSystem(fn) { const u = S.ui.user; S.ui.user = null; try { fn(); } finally { S.ui.user = u; } }   // scheduled e-mails also reach the person who happens to be signed in
function runAuditReminders() {
  if (!S || !S.ui || !S.ui.org || !S.auditPlans) return;
  let changed = false;
  S.auditPlans.filter(x => x.org === S.ui.org && !x.paused && !(S.audits || []).some(a => a.plan === x.id && a.status === 'In progress')).forEach(x => {
    const t = byId('auditTemplates', x.template), title = t ? t.title : x.template, d = daysTo(x.nextDue), what = `the ${title} at ${sname(x.site)}${x.area ? ' (' + x.area + ')' : ''}`;
    x.sent = x.sent || {};
    const once = (stage, to, subject, text) => { if (x.sent[stage] === x.nextDue) return; sendAsSystem(() => queueEmail(to, 'audits', subject, text, '#/audits/programme')); x.sent[stage] = x.nextDue; changed = true; };
    if (d <= 14 && d >= 0) once('due', [x.auditor], `Audit due ${fmt(x.nextDue)}: ${title} — ${sname(x.site)}`, `You are planned to do ${what}. It is due on ${fmt(x.nextDue)}. Start it from the audit programme.`);
    if (d < 0) once('overdue', [x.auditor, (site(x.site) || {}).manager], `Audit overdue: ${title} — ${sname(x.site)}`, `${what[0].toUpperCase() + what.slice(1)} was due on ${fmt(x.nextDue)} and has not been done. Auditor: ${pname(x.auditor)}. If it cannot be done soon, agree a new date and change it in the audit programme. It is escalated to the HSEQ Manager after ${AUD_ESC_DAYS} days.`);
    if (d <= -AUD_ESC_DAYS) once('escalated', hseqManagers(x.org).concat([x.auditor]), `Escalated: audit ${-d} days overdue — ${title}, ${sname(x.site)}`, `${what[0].toUpperCase() + what.slice(1)} was due on ${fmt(x.nextDue)} and is now ${-d} days overdue. Auditor: ${pname(x.auditor)}. Please make sure it is done, or reassign, reschedule or pause it in the audit programme.`);
  });
  if (changed) save();
}
const _rerenderBeforeAudits = rerender;
rerender = function (keepScroll) { if (S && typeof signedIn === 'function' && signedIn() && S.ui.user) { try { runAuditReminders(); } catch (e) { console.error(e); } } _rerenderBeforeAudits(keepScroll); };

/* ---------------- Starter checklists and demo data ---------------- */
function starterAudits() {
  const S_ = (title, items) => ({ title, items: items.map((x, k) => { const t = typeof x === 'string' ? { text: x } : x; return { id: title.slice(0, 3).toLowerCase().replace(/\W/g, '') + k + Math.random().toString(36).slice(2, 5), text: t.text.replace(/^!/, ''), guidance: t.g || '', ref: '', weight: t.text.startsWith('!') ? 2 : 1, critical: t.text.startsWith('!') }; }) });
  const T = (id, title, category, doc, sections) => ({ id, org: null, starter: true, title, category, docNumber: doc, owner: 'P-006', revisions: [{ rev: 1, status: 'Approved', revDate: addDays(TODAY, -120), approvedBy: 'P-002', approvedOn: addDays(TODAY, -118), author: 'P-006', changeNote: 'VDW starter checklist', sections }] });
  return [
    T('ATPL-LEG', 'Legal compliance audit — general', 'Legal compliance', 'VDW-AUD-001', [
      S_('Responsibilities and appointments', [{ text: '!Health and safety responsibilities are assigned in writing to named managers', g: 'Check the signed appointment letters and that they match the current organisation chart.' }, 'Appointments are signed, current and kept on file', 'Appointed people have the competence and training for their role']),
      S_('Representatives and committee', ['Health and safety representatives are designated where required', 'A health and safety committee meets regularly and keeps minutes', 'Representatives have been trained for their role']),
      S_('Hazards and risk assessment', ['!Risk assessments cover all work activities and are current', 'The controls from the risk assessments are in place on site', 'Employees have been told about the hazards of their work and the controls']),
      S_('Incidents', ['Incidents are recorded and investigated', { text: '!Incidents that must be reported are reported to the authorities by a competent person, with proof kept', g: 'The competent person decides what is reportable; check the decision and the proof of reporting.' }, 'Corrective actions from incidents are tracked until verified']),
      S_('Equipment, records and information', ['Machinery and equipment are inspected and maintained, with records', 'Certificates required for equipment are current', 'The applicable legislation is available to employees where required', 'Records needed to show compliance are kept and can be found'])]),
    T('ATPL-HK', 'Housekeeping audit', 'Housekeeping', 'VDW-AUD-002', [
      S_('Walkways and access', ['Walkways are marked and clear', 'Floors are clean, dry and free of trip hazards', '!Emergency exits and escape routes are unobstructed']),
      S_('Work areas', ['Workstations are tidy and organised', 'Tools are returned to their storage place', 'Waste bins are available, labelled and emptied', 'No oil, liquid or product spills']),
      S_('Storage', ['Materials are stored neatly and not on walkways', 'Nothing is stored unsafely at height or on top of cabinets']),
      S_('Facilities', ['Ablutions are clean and stocked', 'The eating area is clean', 'Lighting is adequate and working'])]),
    T('ATPL-FIRE', 'Fire safety audit', 'Fire safety', 'VDW-AUD-003', [
      S_('Fire equipment', ['!Fire extinguishers are present, serviced and in date', 'Fire extinguishers and hose reels are accessible and not obstructed', 'Fire equipment signs are displayed', 'Hose reels are serviced and working']),
      S_('Emergency routes', ['!Emergency exits are unlocked and clear during working hours', 'The evacuation plan is displayed', 'The assembly point is marked', 'Emergency lighting works']),
      S_('Fire risks', ['Flammable materials are stored correctly and in limited quantities', 'Hot work is controlled with a permit', 'Electrical distribution boards are clear and closed', 'Smoking is restricted to designated areas']),
      S_('Preparedness', ['Fire marshals are appointed and trained', 'An evacuation drill was held in the last 12 months and recorded', 'Emergency numbers are displayed'])]),
    T('ATPL-HCS', 'Hazardous chemical substances audit', 'Hazardous chemical substances', 'VDW-AUD-004', [
      S_('Inventory and safety data sheets', ['A register of chemicals on site is up to date', { text: '!A current safety data sheet is available for every chemical', g: 'Pick five products at random and find their safety data sheets.' }, 'Employees know where the safety data sheets are']),
      S_('Labelling and storage', ['Containers are labelled', 'Decanted containers are labelled with the product and its hazards', 'Incompatible chemicals are stored apart', 'Spill containment (bunding or drip trays) is in place', 'The storage area is ventilated']),
      S_('Controls and PPE', ['!The PPE required by the safety data sheets is available and used', '!Eyewash or emergency shower is available where needed and working', 'Ventilation and other exposure controls are working']),
      S_('Training and health', ['Employees have been trained on the chemicals they use', 'Medical surveillance is in place where the risk assessment requires it', 'A spill kit is available and stocked'])]),
    T('ATPL-STK', 'Stacking and storage audit', 'Stacking and storage', 'VDW-AUD-005', [
      S_('Racking', ['!Racking uprights and beams are undamaged', 'Safe working load signs are displayed on the racking', 'Beam locks are in place', 'The racking has been inspected by a competent person within the set interval']),
      S_('Stacking', ['Stacks are stable, level and within the height limit', 'Heavy items are stored low', 'Pallets are in good condition', 'No loads overhang the racking or pallets']),
      S_('Aisles and traffic', ['Aisles are clear and marked', 'Forklifts and pedestrians are separated', 'Floor loading areas are marked']),
      S_('Housekeeping in the store', ['Damaged stock is removed from the racking', 'Nothing is stored against sprinklers, lights or electrical panels'])]),
    T('ATPL-EMR', 'Emergency preparedness and first aid audit', 'Emergency preparedness and first aid', 'VDW-AUD-006', [
      S_('First aid', ['!First aid boxes are available and stocked', 'Enough trained first aiders are on each shift', 'First aiders\' training is current', 'First aid treatment is recorded']),
      S_('Emergency plan', ['The emergency plan is current and covers the site\'s risks', 'Emergency contact numbers are displayed', 'The emergency team knows its duties', 'Drills are held and recorded'])]),
    T('ATPL-PPE', 'Personal protective equipment audit', 'Personal protective equipment', 'VDW-AUD-007', [
      S_('Need and issue', ['The PPE needed for each task is identified in the risk assessment', 'PPE is issued free of charge and the issue is recorded', 'Spare PPE is available']),
      S_('Use and condition', ['!PPE is worn where required', 'PPE is in good condition and replaced when damaged', 'PPE is stored correctly', 'PPE signs are displayed where PPE is required', 'Employees have been trained on the use and care of their PPE'])])
  ];
}
MIGRATIONS.push(() => {
  if (S.migr && S.migr.audits) return; S.migr = S.migr || {}; S.migr.audits = true;
  // the Audits area is open for the same roles that can open Inspections
  if (!S.permissionDefs.some(d => d[0] === 'area.audits')) { const k = S.permissionDefs.findIndex(d => d[0] === 'area.inspections'); S.permissionDefs.splice(k + 1, 0, ['area.audits', 'Audits', 'area']); }
  S.roles.forEach(r => { if (!r.allPerms && (r.perms || []).includes('area.inspections') && !r.perms.includes('area.audits')) r.perms.push('area.audits'); });
  S.auditTemplates = S.auditTemplates || []; starterAudits().forEach(t => { if (!byId('auditTemplates', t.id)) S.auditTemplates.push(t); });
  S.auditPlans = S.auditPlans || []; S.audits = S.audits || [];
  const plan = (id, tpl, site, auditor, months, due, area) => { if (!byId('auditPlans', id) && byId('sites', site)) S.auditPlans.push({ id, template: tpl, site, org: siteOrgOf(site), area: area || '', auditor, months, nextDue: due }); };
  plan('APL-001', 'ATPL-HK', 'S-JHB', 'P-007', 1, addDays(TODAY, 5), 'Warehouse and dispatch');
  plan('APL-002', 'ATPL-FIRE', 'S-DBN', 'P-003', 3, addDays(TODAY, -4));
  plan('APL-003', 'ATPL-STK', 'S-CPT', 'P-004', 3, addDays(TODAY, 21), 'Warehouse');
  plan('APL-004', 'ATPL-HCS', 'S-DBN', 'P-006', 6, addDays(TODAY, 40), 'Workshop and degreasing bay');
  plan('APL-005', 'ATPL-LEG', 'S-JHB', 'P-006', 12, addDays(TODAY, 60));
  // two completed housekeeping audits at Germiston (trend and a repeat finding) and one fire safety audit at Pinetown
  const mk = (id, tplId, siteId, auditor, auditee, days, plan, pattern, notes, summary) => {
    if (byId('audits', id)) return; const t = byId('auditTemplates', tplId), cur = atCurrent(t), snap = { templateId: t.id, title: t.title, category: t.category, docNumber: t.docNumber, rev: cur.rev, sections: JSON.parse(JSON.stringify(cur.sections)) };
    const answers = {}; audItems(snap).forEach((i, k) => { const r = pattern[k] || 'C'; answers[i.id] = { r, note: notes[k] || '', g: r === 'N' ? 'Major' : r === 'P' ? 'Minor' : undefined }; });
    const a = { id, plan, org: siteOrgOf(siteId), site: siteId, area: '', auditor, auditee, date: addDays(TODAY, days), status: 'Completed', template: snap, answers, summary, score: null, findingsList: [], started: addDays(TODAY, days) + 'T08:00:00.000Z', completed: addDays(TODAY, days) + 'T11:00:00.000Z' };
    a.score = auditScore(snap, answers); a.sigAuditor = { by: auditor, name: pname(auditor), ts: a.completed, image: null };
    S.audits.push(a); a.findingsList = auditFindings(a).map(f => ({ item: f.id, grade: f.g, action: null, repeat: isRepeat(a, f.id) }));
  };
  mk('AUD-101', 'ATPL-HK', 'S-JHB', 'P-007', 'P-005', -62, 'APL-001', { 1: 'P', 3: 'N', 7: 'P', 10: 'P' }, { 1: 'Oil patch at the charging bay not cleaned', 3: 'Two pallets of returns left in the walkway at dispatch', 7: 'Stock stored on top of the office cabinets', 10: 'Ablution soap dispenser empty' }, 'Generally tidy. The returns area at dispatch needs a marked holding bay.');
  mk('AUD-102', 'ATPL-HK', 'S-JHB', 'P-007', 'P-005', -31, 'APL-001', { 3: 'P', 6: 'P' }, { 3: 'Returns pallet in the walkway again, smaller than last month', 6: 'Waste bin at packing overflowing' }, 'Better than last month. The returns holding bay is still not marked.');
  mk('AUD-103', 'ATPL-FIRE', 'S-DBN', 'P-003', 'P-011', -95, 'APL-002', { 1: 'P', 5: 'P', 13: 'N' }, { 1: 'Extinguisher in the workshop blocked by a parts trolley', 5: 'Evacuation plan in reception is out of date', 13: 'No evacuation drill recorded in the last 12 months' }, 'Fire equipment in date. A drill must be planned and recorded.');
});
