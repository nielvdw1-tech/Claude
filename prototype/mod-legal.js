/* ==========================================================================
   Legal Requirements (specification module 4)
   --------------------------------------------------------------------------
   - Legal library: Acts, Regulations, standards, codes of practice, industry
     and customer requirements, with their sections / regulations. Maintained
     by a consultant or administrator. The OFFICIAL WORDING is pasted or
     uploaded from the official source (SAFLII, gov.za, Department of
     Employment and Labour) with the source and the date it was checked; the
     system never writes legal text itself. Demo titles are marked "verify".
   - Requirements register: each obligation for this company, with the
     system's interpretation kept apart from the legal text, applicability
     (with the reason), responsible person, required evidence, linked
     evidence, compliance assessments (history kept) and corrective actions.
   - Legislative changes: record a change, see the affected requirements and
     clients, mark them for reassessment, raise actions and notify management.
   Allocating a requirement to a person does not transfer the employer's
   statutory duties.
   ========================================================================== */
'use strict';

const LEG_TYPES = ['Act', 'Regulations', 'Standard', 'Code of practice', 'Industry requirement', 'Customer requirement'];
const LEG_STATUS = ['Current', 'Amended', 'Repealed', 'Superseded'];
const LR_STATUSES = ['Compliant', 'Partially compliant', 'Non-compliant', 'Not assessed'];
const canLegal = () => can('legal.manage');
const legOf = r => byId('legislation', r.leg);
const legItem = r => { const l = legOf(r); return l && (l.items || []).find(i => i.id === r.item); };
const lastAssess = r => (r.assessments || []).slice(-1)[0] || null;
function lrStatus(r) { if (r.applicability === 'Not applicable') return 'Not applicable'; if (r.applicability !== 'Applicable') return 'Pending assessment'; const a = lastAssess(r); return a ? a.status : 'Not assessed'; }
const lrDue = r => r.applicability === 'Applicable' && (r.reassess || (lastAssess(r) && lastAssess(r).nextReview && daysTo(lastAssess(r).nextReview) < 0));
const lrOpenActs = r => S.actions.filter(a => a.source === 'Legal requirement' && a.sourceId === r.id && actionOpen(a));
const lrNoEvidence = r => r.applicability === 'Applicable' && !(r.evidence || []).length;
const legalReqs = () => (S.legalReqs || []).filter(r => inSites(r, S.ui.site));
function legalCounts(list) {
  const app = list.filter(r => r.applicability === 'Applicable'), st = s => app.filter(r => lrStatus(r) === s).length;
  return { applicable: app.length, compliant: st('Compliant'), partial: st('Partially compliant'), non: st('Non-compliant'), notAssessed: st('Not assessed'), pending: list.filter(r => r.applicability === 'Pending assessment').length, noEvidence: app.filter(lrNoEvidence).length, withActions: app.filter(r => lrOpenActs(r).length).length, due: app.filter(lrDue).length,
    pct: app.length ? Math.round(((st('Compliant') + st('Partially compliant') * 0.5) / app.length) * 100) : null };
}
const LR_F = {
  fleg: { all: 'All legislation', list: () => (S.legislation || []).filter(l => (S.legalReqs || []).some(r => r.leg === l.id && r.org === S.ui.org)).map(l => ({ value: l.id, label: l.short || l.name })), test: (r, v) => r.leg === v },
  fsite: { all: 'All branches', list: () => orgSites().length > 1 ? branchOpts() : [], test: (r, v) => inSites(r, v) },
  fowner: { all: 'All responsible people', list: () => personOpts(p => (S.legalReqs || []).some(r => r.owner === p.id)), test: (r, v) => r.owner === v },
  fstatus: { all: 'All statuses', list: () => LR_STATUSES.concat(['Pending assessment', 'Not applicable']).map(s => ({ value: s, label: s })), test: (r, v) => lrStatus(r) === v },
  fflag: { all: 'Anything', list: () => [{ value: 'noev', label: 'Without evidence' }, { value: 'acts', label: 'With open corrective actions' }, { value: 'due', label: 'Due for reassessment' }], test: (r, v) => v === 'noev' ? lrNoEvidence(r) : v === 'acts' ? lrOpenActs(r).length > 0 : lrDue(r) }
};

/* ---------------- Route ---------------- */
ROUTES.legal = (p, q = {}) => {
  if (p[0] && /^LR-/.test(p[0])) return legalDetail(p[0]);
  if (p[0] === 'lib' && p[1]) return legislationDetail(p[1]);
  const tab = ['register', 'library', 'changes'].includes(p[0]) ? p[0] : 'register', all = legalReqs(), c = legalCounts(all);
  const tabs = [['register', 'Requirements register', all.length], ['library', 'Legal library', (S.legislation || []).length], ['changes', 'Legislative changes', (S.legalChanges || []).length]];
  let body = '';
  if (tab === 'register') { const rows = regFilter(all, q, LR_F); body = `<div class="card">${regFilterBar('#/legal/register', q, all, rows.length, LR_F, 'Search reference, legislation, requirement…')}<div class="card-body flush">${rows.length ? lrTable(rows) : emptyList(all.length ? 'No requirements match these filters.' : 'No legal requirements recorded yet.')}</div></div>`; }
  if (tab === 'library') body = libraryHtml();
  if (tab === 'changes') body = changesHtml();
  const fab = tab === 'register' ? (canLegal() ? fabBtn('lrNew', 'Add requirement') : '') : tab === 'library' ? (canLegal() ? fabBtn('legNew', 'Add legislation') : '') : (canLegal() ? fabBtn('lcNew', 'Record a change') : '');
  const k = (label, v, sub, tone, href, ic) => kpi(label, v, sub, tone, href, ic);
  const html = `${pageHead('Legal requirements', 'What this company must comply with, whether it complies, who is responsible and where the evidence is. The legal text comes from the official source; the system\'s interpretation is shown separately.', '', scopePill())}${fab}
    
    <div class="kpis kpis-8">${k('Applicable requirements', c.applicable, `${c.pending} pending applicability`, 'blue', '#/legal/register', 'scale')}
      ${k('Compliant', c.compliant, c.pct == null ? 'Not yet assessed' : `Legal compliance ${c.pct}%`, 'green', '#/legal/register?fstatus=Compliant', 'checkCircle')}
      ${k('Partially compliant', c.partial, 'Gaps remain', c.partial ? 'amber' : 'green', '#/legal/register?fstatus=Partially%20compliant', 'alert')}
      ${k('Non-compliant', c.non, 'Needs action', c.non ? 'red' : 'green', '#/legal/register?fstatus=Non-compliant', 'x')}
      ${k('Not assessed', c.notAssessed, 'Applicable, no assessment yet', c.notAssessed ? 'amber' : 'green', '#/legal/register?fstatus=Not%20assessed', 'clock')}
      ${k('Without evidence', c.noEvidence, 'No evidence linked', c.noEvidence ? 'amber' : 'green', '#/legal/register?fflag=noev', 'docs')}
      ${k('With open actions', c.withActions, 'Corrective actions open', c.withActions ? 'amber' : 'green', '#/legal/register?fflag=acts', 'target')}
      ${k('Due for reassessment', c.due, 'Review date passed or law changed', c.due ? 'red' : 'green', '#/legal/register?fflag=due', 'refresh')}</div>
    ${tabsHtml('#/legal', tabs, tab)}${body}
    <p class="page-note">${icon('scale', 'sm')} Allocating a requirement to a person is an operational responsibility; <b>the employer's statutory duties stay with the employer</b>. The compliance figures show what the assessor recorded — they do not guarantee legal compliance.</p>`;
  return { title: 'Legal requirements', nav: 'legal', crumbs: [['Legal Requirements', '#/legal']], html };
};
function lrTable(rows) {
  return `<div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Reference</th><th>Requirement</th><th>Branches</th><th>Responsible</th><th>Status</th><th>Evidence</th><th>Next review</th></tr></thead><tbody>
  ${rows.map(r => { const l = legOf(r), it = legItem(r), a = lastAssess(r);
    return `<tr class="rowlink" data-href="#/legal/${r.id}"><td data-label="Reference"><span class="mono">${r.id}</span><div class="t-sub">${esc(l ? l.short || l.name : '')}${it ? ' · ' + esc(it.ref) : ''}</div></td><td data-label="Requirement"><b>${esc(r.title)}</b>${lrDue(r) ? ' ' + badge('Reassess', 'red', true) : ''}</td><td data-label="Branches">${esc(sitesLabel(r.sites))}</td><td data-label="Responsible">${r.owner ? esc(pname(r.owner)) : '<span class="muted">Not allocated</span>'}</td><td data-label="Status">${cbadge(lrStatus(r))}</td><td data-label="Evidence">${(r.evidence || []).length || (r.applicability === 'Applicable' ? '<span class="due amber">None</span>' : '—')}</td><td data-label="Next review">${a && a.nextReview ? dueText(a.nextReview) : '—'}</td></tr>`; }).join('')}
  </tbody></table></div>`;
}

/* ---------------- Requirement detail ---------------- */
function legalDetail(id) {
  const r = byId('legalReqs', id); if (!r || r.org !== S.ui.org) return ROUTES.notfound();
  const l = legOf(r), it = legItem(r), st = lrStatus(r), acts = S.actions.filter(a => a.source === 'Legal requirement' && a.sourceId === r.id);
  const html = `<div class="status-hero"><div><div class="sh-id">${r.id} · ${esc(l ? l.name : '')}${it ? ' · ' + esc(it.ref) : ''}</div><h1 style="margin:2px 0 6px">${esc(r.title)}</h1><div class="btn-row">${cbadge(st)} ${badge(r.applicability, r.applicability === 'Applicable' ? 'blue' : 'grey', true)} ${lrDue(r) ? badge(r.reassess ? 'Reassess — the law changed' : 'Reassessment due', 'red') : ''}</div></div>
    <div class="sh-actions">${canLegal() ? `<button class="btn" data-act="lrApplic" data-id="${r.id}">Applicability</button>${r.applicability === 'Applicable' ? `<button class="btn primary" data-act="lrAssess" data-id="${r.id}">Record assessment</button>` : ''}` : ''}</div></div>
  <div class="detail"><div class="stack">
    <div class="card"><div class="card-head"><h2>Legal text (official wording)</h2>${l && l.sourceUrl ? `<a class="btn sm" href="${esc(l.sourceUrl)}" target="_blank" rel="noopener">Official source</a>` : ''}</div><div class="card-body">
      ${it && it.text ? `<blockquote class="legal-text">${esc(it.text)}</blockquote><p class="t-sub">${esc(it.ref)} · source: ${esc(it.source || (l && l.sourceUrl) || '—')} · checked ${it.verifiedOn ? fmt(it.verifiedOn) : '—'}${it.verifiedBy ? ' by ' + esc(pname(it.verifiedBy)) : ''}</p>`
        : `<div class="alert warn" style="margin:0">${icon('alert')}<div><b>Official wording not loaded yet.</b> A competent person must paste or upload the exact wording of ${esc(it ? it.ref : 'this provision')} from the official source in the <a href="#/legal/lib/${r.leg}">legal library</a>. The system does not write legal text.</div></div>`}
      ${it && it.demoTitle ? `<p class="t-sub mt-s">The title of this provision is demonstration data — verify it against the official text.</p>` : ''}
    </div></div>
    <div class="card"><div class="card-head"><h2>What the company must do</h2><span class="ch-sub">${badge('System interpretation — not legal text', 'purple', true)}</span></div><div class="card-body">
      ${r.description ? `<p>${esc(r.description)}</p>` : ''}${r.mustDo ? `<p><b>Action required:</b> ${esc(r.mustDo)}</p>` : ''}
      <div><b>Evidence required</b>${(r.evidenceReq || []).length ? `<ul class="plain-list">${r.evidenceReq.map(e => `<li>${esc(e)}</li>`).join('')}</ul>` : '<p class="muted">Not specified.</p>'}</div>
      ${canLegal() ? `<button class="btn sm mt-s" data-act="lrEdit" data-id="${r.id}">${icon('edit', 'sm')} Edit</button>` : ''}</div></div>
    <div class="card"><div class="card-head"><h2>Evidence</h2>${canLegal() || r.owner === S.ui.user ? `<button class="btn sm" data-act="lrEvidence" data-id="${r.id}">${icon('plus', 'sm')} Link evidence</button>` : ''}</div><div class="card-body flush">${(r.evidence || []).length ? `<ul class="link-list">${r.evidence.map((e, k) => `<li><div class="ll-main">${evidenceLink(e)}<div class="t-sub">${esc(e.kind)} · linked ${fmt(e.on)} by ${esc(pname(e.by))}${e.note ? ' · ' + esc(e.note) : ''}</div></div>${canLegal() ? `<button class="btn sm ghost" data-act="lrEvDel" data-id="${r.id}" data-k="${k}" title="Unlink" aria-label="Unlink evidence">${icon('x', 'sm')}</button>` : ''}</li>`).join('')}</ul>` : `<div class="card-body">${r.applicability === 'Applicable' ? '<span class="due amber">No evidence linked yet.</span>' : '<span class="muted">No evidence needed while not applicable.</span>'}</div>`}</div></div>
    <div class="card"><div class="card-head"><h2>Compliance assessments</h2><span class="ch-sub">${(r.assessments || []).length} recorded — history is kept</span></div><div class="card-body flush">${(r.assessments || []).length ? `<div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Date</th><th>Status</th><th>Findings and gaps</th><th>Assessor</th><th>Next review</th></tr></thead><tbody>${r.assessments.slice().reverse().map(a => `<tr><td data-label="Date">${fmt(a.date)}</td><td data-label="Status">${cbadge(a.status)}</td><td data-label="Findings">${esc(a.findings || '')}${a.gaps ? `<div class="t-sub">Gaps: ${esc(a.gaps)}</div>` : ''}${a.recommendations ? `<div class="t-sub">Recommendation: ${esc(a.recommendations)}</div>` : ''}${a.evidenceReviewed ? `<div class="t-sub">Evidence reviewed: ${esc(a.evidenceReviewed)}</div>` : ''}</td><td data-label="Assessor">${esc(pname(a.by))}</td><td data-label="Next review">${a.nextReview ? fmt(a.nextReview) : '—'}</td></tr>`).join('')}</tbody></table></div>` : `<div class="card-body muted">Not assessed yet.</div>`}</div></div>
    <div class="card"><div class="card-head"><h2>Corrective actions</h2>${can('action.create') ? `<button class="btn sm" data-act="lrAction" data-id="${r.id}">${icon('plus', 'sm')} Raise action</button>` : ''}</div><div class="card-body flush">${acts.length ? `<ul class="link-list">${acts.map(a => `<li><div class="ll-main"><a href="#/actions/${a.id}" class="mono">${a.id}</a> ${esc(a.title)}<div class="t-sub">${esc(pname(a.owner))} · due ${fmt(a.due)}</div></div>${sbadge(a.status)}</li>`).join('')}</ul>` : '<div class="card-body muted">None.</div>'}</div></div>
  </div><div class="stack">
    <div class="card"><div class="card-head"><h2>Details</h2></div><div class="card-body"><div class="kv">
      <div>Legislation</div><div>${l ? `<a href="#/legal/lib/${l.id}">${esc(l.name)}</a> ${l.status !== 'Current' ? badge(l.status, 'amber', true) : ''}` : '—'}</div>
      <div>Section / regulation</div><div>${it ? esc(it.ref + (it.title ? ' — ' + it.title : '')) : '—'}</div>
      <div>Branches</div><div>${esc(sitesLabel(r.sites))}</div>
      <div>Responsible person</div><div>${r.owner ? esc(pname(r.owner)) : '<span class="muted">Not allocated</span>'}</div>
      <div>Applicability</div><div>${esc(r.applicability)}${r.applicReason ? `<div class="t-sub">${esc(r.applicReason)}</div>` : ''}</div>
      <div>Last assessed</div><div>${lastAssess(r) ? fmt(lastAssess(r).date) : '—'}</div>
      <div>Next review</div><div>${lastAssess(r) && lastAssess(r).nextReview ? dueText(lastAssess(r).nextReview) : '—'}</div>
    </div></div></div>
  </div></div>`;
  return { title: r.id, nav: 'legal', crumbs: [['Legal Requirements', '#/legal'], [r.id, '#']], html };
}
function evidenceLink(e) {
  const f = e.file; if (f) return `<button type="button" class="link-btn" ${fileAttrs(f)}>${icon('docs', 'sm')} ${esc(f.name)}</button>`;
  const href = { Document: '#/documents/', Audit: '#/audits/', Inspection: '#/inspections/', Asset: '#/assets/', Appointment: '#/people/', Training: '#/training/' }[e.kind];
  const rec = { Appointment: () => { const a = byId('appointments', e.ref); return a && { title: `${a.id} ${(S.config.apptTypes || []).find(t => t.id === a.type) ? S.config.apptTypes.find(t => t.id === a.type).name : ''} — ${pname(a.person)}` }; }, Document: () => byId('documents', e.ref), Audit: () => byId('audits', e.ref), Inspection: () => byId('inspections', e.ref), Asset: () => byId('assets', e.ref) }[e.kind];
  const x = rec ? rec() : null, label = e.label || (x ? (x.number ? x.number + ' ' + x.title : x.title || x.name || x.tag || e.ref) : e.ref);
  return href ? `<a href="${href}${e.ref}">${esc(label)}</a>` : esc(label);
}

/* ---------------- Requirement: create / edit / applicability / assess / evidence / actions ---------------- */
function lrForm(r) {
  const legs = (S.legislation || []).filter(l => l.status !== 'Repealed' || (r && r.leg === l.id)), leg = r ? r.leg : (legs[0] || {}).id;
  const itemOpts = lid => { const l = byId('legislation', lid); return opts(((l && l.items) || []).map(i => ({ value: i.id, label: i.ref + (i.title ? ' — ' + i.title : '') })), r ? r.item : '', '— Whole instrument / not listed —'); };
  return { itemOpts, html: `<div class="form-grid">
    ${fld({ name: 'leg', label: 'Legislation or other requirement', type: 'select', options: opts(legs.map(l => ({ value: l.id, label: l.name })), leg), required: true, full: true })}
    ${fld({ name: 'item', label: 'Section / regulation', type: 'select', options: itemOpts(leg), full: true })}
    ${fld({ name: 'title', label: 'Requirement title', value: r ? r.title : '', required: true, full: true, placeholder: 'e.g. Health and safety representatives designated' })}
    ${fld({ name: 'description', label: 'Description (system interpretation, in plain words — not legal text)', type: 'textarea', value: r ? r.description : '', full: true })}
    ${fld({ name: 'mustDo', label: 'What the company must do', type: 'textarea', value: r ? r.mustDo : '', full: true, rows: 2 })}
    ${fld({ name: 'evidenceReq', label: 'Evidence required (one per line)', type: 'textarea', value: r ? (r.evidenceReq || []).join('\n') : '', full: true, rows: 3, placeholder: 'e.g. Signed designation letters\nTraining certificates' })}
    ${siteChecks('sites', r ? r.sites : ['ALL'])}
    ${fld({ name: 'owner', label: 'Responsible person', type: 'select', options: personOptions(r ? r.owner : '', p => !!p.sysRole) })}
  </div>` };
}
function lrFormWire(m, f) { const s = m.querySelector('[name=leg]'); s.addEventListener('change', () => { m.querySelector('[name=item]').innerHTML = f.itemOpts(s.value); }); }
function lrRead(m) { const v = readForm(m); return { leg: v.leg, item: v.item || null, title: v.title, description: v.description, mustDo: v.mustDo, evidenceReq: (v.evidenceReq || '').split('\n').map(x => x.trim()).filter(Boolean), sites: readSites(m, 'sites'), owner: v.owner || null }; }
ACT.lrNew = () => { const f = lrForm(null); openModal({ title: 'Add a legal requirement', sub: 'A new requirement starts as "Pending assessment" until its applicability is decided.', size: 'wide', body: f.html, onOpen: m => lrFormWire(m, f),
  buttons: [{ label: 'Add requirement', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; S.legalReqs = S.legalReqs || []; const id = nextId('LR-', 'legalReqs');
    const r = Object.assign({ id, org: S.ui.org, applicability: 'Pending assessment', applicReason: '', evidence: [], assessments: [], created: TODAY, createdBy: S.ui.user }, lrRead(m)); S.legalReqs.push(r);
    if (r.owner) queueEmail([r.owner], 'actions', `Legal requirement allocated to you: ${r.title}`, `${pname(S.ui.user)} made you responsible for the legal requirement ${r.id} "${r.title}". The employer's statutory duties stay with the employer; you are responsible for keeping this requirement in order and its evidence up to date.`, '#/legal/' + id);
    log(`Added legal requirement ${id}: ${r.title}`, '#/legal/' + id); save(); navigate('#/legal/' + id); } }] }); };
ACT.lrEdit = (el) => { const r = byId('legalReqs', el.dataset.id), f = lrForm(r); openModal({ title: `Edit ${r.id}`, size: 'wide', body: f.html, onOpen: m => lrFormWire(m, f),
  buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const old = r.owner; Object.assign(r, lrRead(m)); if (r.owner && r.owner !== old) queueEmail([r.owner], 'actions', `Legal requirement allocated to you: ${r.title}`, `${pname(S.ui.user)} made you responsible for the legal requirement ${r.id} "${r.title}".`, '#/legal/' + r.id); log(`Edited legal requirement ${r.id}`, '#/legal/' + r.id); save(); rerender(); } }] }); };
ACT.lrApplic = (el) => { const r = byId('legalReqs', el.dataset.id); openModal({ title: 'Applicability', sub: 'Decide whether this requirement applies to the company, considering its industry, activities, employees, machinery, substances, contractors and risks. Explain why.', body: `<div class="form-grid">
    ${fld({ name: 'applicability', label: 'Applicability', type: 'select', options: opts(['Applicable', 'Not applicable', 'Pending assessment'], r.applicability), required: true })}
    ${fld({ name: 'reason', label: 'Reason', type: 'textarea', value: r.applicReason || '', required: true, full: true, placeholder: 'e.g. More than 20 employees at Germiston; forklifts and overhead cranes in use' })}</div>`,
  buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); (r.applicHistory = r.applicHistory || []).push({ ts: nowTs(), by: S.ui.user, from: r.applicability, to: v.applicability, reason: v.reason });
    r.applicability = v.applicability; r.applicReason = v.reason; log(`${r.id} applicability: ${v.applicability} — ${v.reason}`, '#/legal/' + r.id); save(); rerender(); } }] }); };
ACT.lrAssess = (el) => { const r = byId('legalReqs', el.dataset.id); openModal({ title: `Compliance assessment — ${r.id}`, sub: r.title, size: 'wide', body: `<div class="form-grid">
    ${fld({ name: 'status', label: 'Compliance status', type: 'select', options: opts(LR_STATUSES.filter(s => s !== 'Not assessed'), '', '— Select —'), required: true })}
    ${fld({ name: 'date', label: 'Assessment date', type: 'date', value: TODAY, required: true })}
    ${fld({ name: 'findings', label: 'Findings', type: 'textarea', required: true, full: true })}
    ${fld({ name: 'evidenceReviewed', label: 'Evidence reviewed', type: 'textarea', full: true, rows: 2, value: (r.evidence || []).map(e => e.label || e.ref || (e.file && e.file.name)).join('; ') })}
    ${fld({ name: 'gaps', label: 'Compliance gaps', type: 'textarea', full: true, rows: 2 })}
    ${fld({ name: 'recommendations', label: 'Recommendations', type: 'textarea', full: true, rows: 2 })}
    ${fld({ name: 'nextReview', label: 'Next review date', type: 'date', value: addDays(TODAY, 365), required: true })}
    ${fld({ name: 'raise', label: 'Raise a corrective action for the gaps', type: 'checkbox', value: false, full: true })}</div>`,
  buttons: [{ label: 'Save assessment', cls: 'primary', onClick: m => { const v = readForm(m); if (!validateForm(m, fail => { if (v.status !== 'Compliant' && !v.gaps) fail(m.querySelector('[name=gaps]'), 'Describe the gaps for a status other than compliant.'); })) return false;
    r.assessments = r.assessments || []; r.assessments.push({ date: v.date, by: S.ui.user, status: v.status, findings: v.findings, evidenceReviewed: v.evidenceReviewed, gaps: v.gaps, recommendations: v.recommendations, nextReview: v.nextReview }); delete r.reassess;
    log(`Assessed ${r.id}: ${v.status}`, '#/legal/' + r.id); save();
    if (v.raise && v.status !== 'Compliant') setTimeout(() => raiseActionModal({ source: 'Legal requirement', sourceId: r.id, title: `${r.title}: ${v.gaps}`.slice(0, 140), action: v.recommendations, owner: r.owner, priority: v.status === 'Non-compliant' ? 'High' : 'Medium', site: r.sites.includes('ALL') ? defaultSite() : r.sites[0] }, () => rerender()), 40); else rerender(); } }] }); };
ACT.lrAction = (el) => { const r = byId('legalReqs', el.dataset.id), a = lastAssess(r); raiseActionModal({ source: 'Legal requirement', sourceId: r.id, title: r.title, action: a ? a.recommendations : '', owner: r.owner, priority: lrStatus(r) === 'Non-compliant' ? 'High' : 'Medium', site: r.sites.includes('ALL') ? defaultSite() : r.sites[0] }, () => rerender()); };
ACT.lrEvidence = (el) => { const r = byId('legalReqs', el.dataset.id);
  const docs = S.documents.filter(d => inSite(d, 'ALL') && docActive(d)).map(d => ({ value: d.id, label: `${d.number} — ${d.title}` }));
  const audits = (S.audits || []).filter(a => a.org === S.ui.org && a.status === 'Completed').map(a => ({ value: a.id, label: `${a.id} — ${a.template.title} (${sname(a.site)}, ${fmt(a.date)})` }));
  const insps = S.inspections.filter(i => inSite(i, 'ALL')).slice(-40).map(i => ({ value: i.id, label: `${i.id} — ${(i.template && i.template.title) || ""} ${i.target || ""} (${fmt(i.date)})` }));
  openModal({ title: 'Link evidence', sub: 'Link a record that already exists rather than uploading a second copy. Upload only when the evidence is not in the system yet.', body: `<div class="form-grid">
    ${fld({ name: 'kind', label: 'Kind of evidence', type: 'select', options: opts(['Document', 'Appointment', 'Audit', 'Inspection', 'Upload a file']), required: true })}
    <div class="field full" data-field="ref" id="evPick">${fld({ name: 'ref', label: 'Record', type: 'select', options: opts(docs, '', '— Select —'), full: true })}</div>
    <div class="field full hidden" id="evFile">${fld({ name: 'file', label: 'File', type: 'file', full: true })}</div>
    ${fld({ name: 'note', label: 'Note (optional)', full: true })}</div>`,
    onOpen: m => { const k = m.querySelector('[name=kind]'); k.addEventListener('change', () => { const up = k.value === 'Upload a file'; m.querySelector('#evFile').classList.toggle('hidden', !up); m.querySelector('#evPick').classList.toggle('hidden', up); m.querySelector('[name=ref]').innerHTML = opts(k.value === 'Audit' ? audits : k.value === 'Inspection' ? insps : k.value === 'Appointment' ? (S.appointments || []).filter(a => a.org === S.ui.org && !['Draft', 'Withdrawn'].includes(a.status)).map(a => ({ value: a.id, label: `${a.id} — ${pname(a.person)} (${a.method})` })) : docs, '', '— Select —'); }); },
    buttons: [{ label: 'Link', cls: 'primary', onClick: m => { const v = readForm(m); if (v.kind === 'Upload a file' ? !v.file : !v.ref) { toast('Choose the record or file.', 'error'); return false; }
      r.evidence = r.evidence || []; r.evidence.push(v.kind === 'Upload a file' ? { kind: 'File', file: v.file, note: v.note, by: S.ui.user, on: TODAY } : { kind: v.kind, ref: v.ref, note: v.note, by: S.ui.user, on: TODAY });
      log(`Linked evidence to ${r.id}`, '#/legal/' + r.id); save(); rerender(); } }] }); };
ACT.lrEvDel = (el) => { const r = byId('legalReqs', el.dataset.id); confirmBox('Unlink this evidence?', 'The record itself is not deleted.', 'Unlink', () => { r.evidence.splice(+el.dataset.k, 1); log(`Unlinked evidence from ${r.id}`, '#/legal/' + r.id); save(); rerender(); }); };

/* ---------------- Legal library ---------------- */
function libraryHtml() {
  const L = S.legislation || [];
  return `<div class="alert info">${icon('lock')}<div>The library is maintained by a competent person (consultant or administrator). <b>Only the exact official wording may be loaded</b> — paste or upload it from SAFLII, gov.za or the Department of Employment and Labour, record the source and the date it was checked. Nothing is updated or interpreted automatically.</div></div>
  <div class="card"><div class="card-body flush"><div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Legislation / requirement</th><th>Type</th><th>Status</th><th>Sections loaded</th><th>Last checked</th><th>Used by</th></tr></thead><tbody>
  ${L.map(l => { const items = l.items || [], loaded = items.filter(i => i.text).length, used = (S.legalReqs || []).filter(r => r.leg === l.id && r.org === S.ui.org).length;
    return `<tr class="rowlink" data-href="#/legal/lib/${l.id}"><td data-label="Legislation"><b>${esc(l.name)}</b>${l.sourceUrl ? '' : '<div class="t-sub">No official source recorded</div>'}</td><td data-label="Type">${esc(l.type)}</td><td data-label="Status">${badge(l.status, l.status === 'Current' ? 'green' : l.status === 'Amended' ? 'amber' : 'grey', true)}</td><td data-label="Sections">${items.length ? `${loaded} of ${items.length} with official wording` : '—'}</td><td data-label="Last checked">${l.verifiedOn ? fmt(l.verifiedOn) : '<span class="due amber">Not checked</span>'}</td><td data-label="Used by">${used} requirement(s)</td></tr>`; }).join('')}
  </tbody></table></div></div></div>`;
}
function legislationDetail(id) {
  const l = byId('legislation', id); if (!l) return ROUTES.notfound();
  const html = `${pageHead(esc(l.name), `${esc(l.type)} · ${badge(l.status, l.status === 'Current' ? 'green' : 'amber', true)} ${l.amended ? ' · amended ' + fmt(l.amended) : ''} · ${l.verifiedOn ? 'last checked ' + fmt(l.verifiedOn) + (l.verifiedBy ? ' by ' + esc(pname(l.verifiedBy)) : '') : 'not checked yet'}`, canLegal() ? `<button class="btn" data-act="legEdit" data-id="${l.id}">${icon('edit', 'sm')} Edit details</button><button class="btn primary" data-act="legItemNew" data-id="${l.id}">${icon('plus', 'sm')} Add section / regulation</button>` : '')}
  <div class="card mb"><div class="card-body" style="padding-top:14px"><div class="kv"><div>Official source</div><div>${l.sourceUrl ? `<a href="${esc(l.sourceUrl)}" target="_blank" rel="noopener">${esc(l.sourceUrl)}</a>` : '<span class="muted">Not recorded</span>'}</div><div>Document</div><div>${l.file ? `<button type="button" class="link-btn" ${fileAttrs(l.file)}>${esc(l.file.name)}</button>` : '<span class="muted">None uploaded</span>'}</div>${l.notes ? `<div>Notes</div><div>${esc(l.notes)}</div>` : ''}</div></div></div>
  ${(l.items || []).length ? (l.items || []).map(i => `<div class="card mb"><div class="card-head"><div><h2>${esc(i.ref)}${i.title ? ' — ' + esc(i.title) : ''}</h2>${i.demoTitle ? '<span class="ch-sub">Title is demonstration data — verify</span>' : ''}</div>${canLegal() ? `<button class="btn sm" data-act="legItemEdit" data-id="${l.id}" data-i="${i.id}">${icon('edit', 'sm')} ${i.text ? 'Edit wording' : 'Load official wording'}</button>` : ''}</div><div class="card-body">
      ${i.text ? `<blockquote class="legal-text">${esc(i.text)}</blockquote><p class="t-sub">Source: ${esc(i.source || l.sourceUrl || '—')} · checked ${i.verifiedOn ? fmt(i.verifiedOn) : '—'}${i.verifiedBy ? ' by ' + esc(pname(i.verifiedBy)) : ''}</p>` : '<p class="muted">Official wording not loaded yet.</p>'}
      <p class="t-sub">Used by: ${(S.legalReqs || []).filter(r => r.item === i.id && r.org === S.ui.org).map(r => `<a href="#/legal/${r.id}">${r.id}</a>`).join(', ') || 'no requirements yet'}</p></div></div>`).join('') : `<div class="card">${emptyList('No sections or regulations added yet.')}</div>`}`;
  return { title: l.short || l.name, nav: 'legal', crumbs: [['Legal Requirements', '#/legal'], ['Legal library', '#/legal/library'], [l.short || l.name, '#']], html };
}
function legForm(l) { return `<div class="form-grid">
  ${fld({ name: 'name', label: 'Name (as officially titled)', value: l ? l.name : '', required: true, full: true })}
  ${fld({ name: 'short', label: 'Short name', value: l ? l.short || '' : '' })}
  ${fld({ name: 'type', label: 'Type', type: 'select', options: opts(LEG_TYPES, l ? l.type : 'Regulations'), required: true })}
  ${fld({ name: 'status', label: 'Status', type: 'select', options: opts(LEG_STATUS, l ? l.status : 'Current'), required: true })}
  ${fld({ name: 'amended', label: 'Last amendment date (if known)', type: 'date', value: l ? l.amended || '' : '' })}
  ${fld({ name: 'sourceUrl', label: 'Official source (link)', value: l ? l.sourceUrl || '' : '', full: true, placeholder: 'e.g. a SAFLII or gov.za link' })}
  ${fld({ name: 'file', label: 'Upload the official document (optional)', type: 'file', accept: '.pdf,.doc,.docx', full: true })}
  ${fld({ name: 'verified', label: 'I checked these details against the official source today', type: 'checkbox', value: false, full: true })}
  ${fld({ name: 'notes', label: 'Notes', type: 'textarea', value: l ? l.notes || '' : '', full: true, rows: 2 })}</div>`; }
function legSave(l, v) { Object.assign(l, { name: v.name, short: v.short, type: v.type, status: v.status, amended: v.amended, sourceUrl: v.sourceUrl, notes: v.notes }); if (v.file) l.file = v.file; if (v.verified) { l.verifiedOn = TODAY; l.verifiedBy = S.ui.user; } }
ACT.legNew = () => openModal({ title: 'Add legislation or another requirement', sub: 'Acts, regulations, standards, codes of practice, industry or customer requirements.', size: 'wide', body: legForm(null),
  buttons: [{ label: 'Add', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); S.legislation = S.legislation || []; const l = { id: nextId('LEG-', 'legislation'), items: [] }; legSave(l, v); S.legislation.push(l); log(`Added ${l.name} to the legal library`, '#/legal/lib/' + l.id); save(); navigate('#/legal/lib/' + l.id); } }] });
ACT.legEdit = (el) => { const l = byId('legislation', el.dataset.id); openModal({ title: 'Edit legislation details', size: 'wide', body: legForm(l), buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const before = l.status; legSave(l, readForm(m)); log(`Updated ${l.name} in the legal library${before !== l.status ? ` (status ${before} → ${l.status})` : ''}`, '#/legal/lib/' + l.id); save(); rerender(); } }] }); };
function legItemForm(i) { return `<div class="form-grid">
  ${fld({ name: 'ref', label: 'Section / regulation number', value: i ? i.ref : '', required: true, placeholder: 'e.g. Section 17 or Regulation 2(1)' })}
  ${fld({ name: 'title', label: 'Title (as officially titled)', value: i ? i.title || '' : '' })}
  ${fld({ name: 'text', label: 'Official wording — paste exactly from the official source', type: 'textarea', value: i ? i.text || '' : '', full: true, rows: 8 })}
  ${fld({ name: 'source', label: 'Where the wording comes from (link or document)', value: i ? i.source || '' : '', full: true })}
  ${fld({ name: 'confirm', label: 'I confirm the wording is copied exactly from the official source', type: 'checkbox', value: false, full: true })}</div>`; }
function legItemSave(it, v, m) { if (v.text && !v.confirm) { toast('Confirm that the wording is copied exactly from the official source.', 'error'); return false; } if (v.text && !v.source) { toast('Record where the wording comes from.', 'error'); return false; }
  const changed = (it.text || '') !== v.text; Object.assign(it, { ref: v.ref, title: v.title, text: v.text, source: v.source }); if (v.title) delete it.demoTitle; if (v.text && (changed || v.confirm)) { it.verifiedOn = TODAY; it.verifiedBy = S.ui.user; } return true; }
ACT.legItemNew = (el) => { const l = byId('legislation', el.dataset.id); openModal({ title: `Add a section or regulation — ${l.short || l.name}`, size: 'wide', body: legItemForm(null),
  buttons: [{ label: 'Add', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const it = { id: l.id + '-' + Math.random().toString(36).slice(2, 7) }; if (!legItemSave(it, readForm(m), m)) return false; l.items = l.items || []; l.items.push(it); log(`Added ${it.ref} to ${l.name}`, '#/legal/lib/' + l.id); save(); rerender(); } }] }); };
ACT.legItemEdit = (el) => { const l = byId('legislation', el.dataset.id), it = l.items.find(x => x.id === el.dataset.i); openModal({ title: `${it.ref} — official wording`, sub: l.name, size: 'wide', body: legItemForm(it),
  buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; if (!legItemSave(it, readForm(m), m)) return false; log(`Updated the wording of ${it.ref}, ${l.name}`, '#/legal/lib/' + l.id); save(); rerender(); } }] }); };

/* ---------------- Legislative changes ---------------- */
function changesHtml() {
  const C = (S.legalChanges || []).slice().sort((a, b) => b.date.localeCompare(a.date));
  if (!C.length) return `<div class="card">${emptyList('No legislative changes recorded yet. Use "Record a change" when an Act or Regulation is amended, repealed or replaced.')}</div>`;
  return C.map(c => { const l = byId('legislation', c.leg); return `<div class="card mb"><div class="card-head"><div><h2>${esc(l ? l.name : c.leg)}</h2><span class="ch-sub">${fmt(c.date)} · recorded by ${esc(pname(c.by))}</span></div>${badge(c.affected.length + ' requirement(s) affected', c.affected.length ? 'amber' : 'grey', true)}</div><div class="card-body">
    <p>${esc(c.summary)}</p>${c.impact ? `<p><b>Impact:</b> ${esc(c.impact)}</p>` : ''}
    <p class="t-sub">Affected: ${c.affected.map(id => { const r = byId('legalReqs', id); return r ? `<a href="#/legal/${id}">${id}</a> (${esc(orgOf(r.org).short)})` : id; }).join(', ') || 'none'}${c.notified ? ` · management notified (${c.notified} e-mail(s))` : ''}</p></div></div>`; }).join('');
}
ACT.lcNew = () => { const legs = S.legislation || [];
  const reqsFor = lid => (S.legalReqs || []).filter(r => r.leg === lid && (myOrgs().some(o => o.id === r.org)));
  const list = lid => { const rs = reqsFor(lid); return rs.length ? rs.map(r => `<label class="check"><input type="checkbox" name="aff_${r.id}" checked> <span><b>${r.id}</b> ${esc(r.title)} <span class="t-sub">(${esc(orgOf(r.org).short)})</span></span></label>`).join('') : '<p class="muted">No requirements of any of your clients use this legislation.</p>'; };
  openModal({ title: 'Record a legislative change', sub: 'The affected requirements of every client you manage are listed. They are marked for reassessment.', size: 'wide', body: `<div class="form-grid">
    ${fld({ name: 'leg', label: 'Legislation', type: 'select', options: opts(legs.map(l => ({ value: l.id, label: l.name })), '', '— Select —'), required: true, full: true })}
    ${fld({ name: 'date', label: 'Date of the change', type: 'date', value: TODAY, required: true })}
    ${fld({ name: 'newStatus', label: 'Legislation status after the change', type: 'select', options: opts(LEG_STATUS, 'Amended') })}
    ${fld({ name: 'summary', label: 'What changed (summary — load the new official wording in the library)', type: 'textarea', required: true, full: true })}
    ${fld({ name: 'impact', label: 'Impact on the company / clients', type: 'textarea', full: true, rows: 2 })}
    <div class="field full"><label>Affected requirements</label><div id="lcAff" class="chk-col"><p class="muted">Select the legislation first.</p></div></div>
    ${fld({ name: 'actions', label: 'Raise a corrective action for each affected requirement (owner: the responsible person)', type: 'checkbox', value: false, full: true })}
    ${fld({ name: 'notify', label: 'Notify management and the responsible people by e-mail', type: 'checkbox', value: true, full: true })}</div>`,
    onOpen: m => { const s = m.querySelector('[name=leg]'); s.addEventListener('change', () => { m.querySelector('#lcAff').innerHTML = s.value ? list(s.value) : ''; }); },
    buttons: [{ label: 'Record change', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m), l = byId('legislation', v.leg), aff = reqsFor(v.leg).filter(r => m.querySelector(`[name=aff_${r.id}]`) && m.querySelector(`[name=aff_${r.id}]`).checked);
      S.legalChanges = S.legalChanges || []; const c = { id: nextId('LC-', 'legalChanges'), leg: v.leg, date: v.date, summary: v.summary, impact: v.impact, affected: aff.map(r => r.id), by: S.ui.user, notified: 0 }; S.legalChanges.push(c);
      if (l.status !== v.newStatus) l.status = v.newStatus; l.amended = v.date;
      aff.forEach(r => { r.reassess = c.id; if (v.actions) withOrg(r.org, () => createAction({ source: 'Legal requirement', sourceId: r.id, title: `Legislative change: reassess ${r.title}`, action: v.summary, owner: r.owner || (hseqManagers(r.org)[0] || ''), priority: 'High', site: r.sites.includes('ALL') ? (orgSites()[0] || {}).id : r.sites[0] })); });
      if (v.notify) { const to = [...new Set(aff.flatMap(r => [r.owner].concat(hseqManagers(r.org), S.people.filter(p => p.org === r.org && p.sysRole === 'Managing Director').map(p => p.id))).filter(Boolean))]; queueEmail(to, 'actions', `Legislative change: ${l.name}`, `${pname(S.ui.user)} recorded a change to ${l.name} (${fmt(v.date)}): ${v.summary}${v.impact ? '\n\nImpact: ' + v.impact : ''}\n\n${aff.length} legal requirement(s) are marked for reassessment: ${aff.map(r => r.id + ' ' + r.title).join('; ')}.`, '#/legal/changes'); c.notified = to.length; }
      log(`Recorded a legislative change to ${l.name}: ${aff.length} requirement(s) to reassess`, '#/legal/changes'); save(); navigate('#/legal/changes'); } }] }); };

/* ---------------- Wiring ---------------- */
addNavGroup('Overview', { group: 'Compliance', items: [['legal', 'Legal Requirements', 'scale']] });
AREA_OF.legal = 'area.legal';
if (!TOP_ROUTES.includes('legal')) TOP_ROUTES.push('legal');
if (!SOURCE_MODULES.includes('Legal requirement')) SOURCE_MODULES.splice(SOURCE_MODULES.length - 1, 0, 'Legal requirement');
const _sourceLinkBeforeLegal = sourceLink;
sourceLink = function (a) { return a.source === 'Legal requirement' && byId('legalReqs', a.sourceId) ? `<a href="#/legal/${a.sourceId}">${esc(a.sourceId)}</a>` : _sourceLinkBeforeLegal(a); };
const _needsBackBeforeLegal = needsBack;
needsBack = function (parts) { if (parts[0] === 'legal' && ['register', 'library', 'changes'].includes(parts[1])) return false; return _needsBackBeforeLegal(parts); };
const _myTasksBeforeLegal = myTasks;
myTasks = function () {
  const out = _myTasksBeforeLegal(), uid = S.ui.user;
  (S.legalReqs || []).filter(r => r.org === S.ui.org && r.owner === uid && lrDue(r)).forEach(r => out.push({ title: `Reassess legal requirement ${r.id}: ${r.title}`, sub: r.reassess ? 'The legislation changed' : 'Review date passed', link: '#/legal/' + r.id, sev: 'amber' }));
  if (canLegal()) { const pend = (S.legalReqs || []).filter(r => r.org === S.ui.org && r.applicability === 'Pending assessment' && inSites(r, S.ui.site)).length; if (pend) out.push({ title: `Decide the applicability of ${pend} legal requirement(s)`, sub: 'Pending assessment', link: '#/legal/register?fstatus=Pending%20assessment', sev: 'blue' }); }
  return out;
};

/* ---------------- Demo data ---------------- */
MIGRATIONS.push(() => {
  if (S.migr && S.migr.legal) return; S.migr = S.migr || {}; S.migr.legal = true;
  addArea('area.legal', 'Legal requirements', 'area.notices', 'area.documents');
  addPerm('legal.manage', 'Maintain the legal library and assess legal requirements', ['HSEQ Manager', 'Safety Consultant']);
  // Names of the instruments only. Section numbers and titles are demonstration data marked "verify"; no wording is supplied.
  const I = (lid, ref, title) => ({ id: lid + '-' + ref.replace(/\W+/g, ''), ref, title, text: '', source: '', demoTitle: true });
  const L = (id, name, short, type, items) => ({ id, name, short, type, status: 'Current', amended: '', sourceUrl: '', verifiedOn: '', verifiedBy: '', notes: 'Demonstration entry — load the official text and check the details before use.', items: items || [] });
  S.legislation = S.legislation || [];
  [L('LEG-OHSA', 'Occupational Health and Safety Act 85 of 1993', 'OHS Act', 'Act', [I('LEG-OHSA', 'Section 7', 'Health and safety policy'), I('LEG-OHSA', 'Section 8', 'General duties of employers to their employees'), I('LEG-OHSA', 'Section 13', 'Duty to inform'), I('LEG-OHSA', 'Section 16', 'Chief executive officers charged with certain duties'), I('LEG-OHSA', 'Section 17', 'Health and safety representatives'), I('LEG-OHSA', 'Section 19', 'Health and safety committees'), I('LEG-OHSA', 'Section 24', 'Report to inspector regarding certain incidents')]),
   L('LEG-GSR', 'General Safety Regulations', 'General Safety Regs', 'Regulations'), L('LEG-GAR', 'General Administrative Regulations', 'General Admin Regs', 'Regulations'),
   L('LEG-FAC', 'Facilities Regulations', 'Facilities Regs', 'Regulations'), L('LEG-DMR', 'Driven Machinery Regulations', 'Driven Machinery Regs', 'Regulations'),
   L('LEG-EIR', 'Electrical Installation Regulations', 'Electrical Installation Regs', 'Regulations'), L('LEG-HCA', 'Hazardous Chemical Agents Regulations', 'HCA Regs', 'Regulations'),
   L('LEG-ERW', 'Environmental Regulations for Workplaces', 'Environmental Regs', 'Regulations'), L('LEG-ERG', 'Ergonomics Regulations', 'Ergonomics Regs', 'Regulations'),
   L('LEG-CR', 'Construction Regulations', 'Construction Regs', 'Regulations')].forEach(l => { if (!byId('legislation', l.id)) S.legislation.push(l); });
  S.legalReqs = S.legalReqs || []; S.legalChanges = S.legalChanges || [];
  const R = (id, item, leg, title, description, mustDo, evidenceReq, owner, applicability, reason, assess, evidence, sites) => { if (byId('legalReqs', id)) return;
    S.legalReqs.push({ id, org: 'ORG-1', leg, item, title, description, mustDo, evidenceReq, sites: sites || ['ALL'], owner, applicability, applicReason: reason, evidence: (evidence || []).map(e => Object.assign({ by: 'P-006', on: addDays(TODAY, -60) }, e)), assessments: assess || [], created: addDays(TODAY, -120), createdBy: 'P-006', demo: true }); };
  const A = (days, status, findings, gaps, rec, next) => ({ date: addDays(TODAY, days), by: 'P-006', status, findings, evidenceReviewed: '', gaps: gaps || '', recommendations: rec || '', nextReview: addDays(TODAY, next) });
  R('LR-001', 'LEG-OHSA-Section7', 'LEG-OHSA', 'Written health and safety policy', 'A signed health and safety policy that is communicated to employees. (System interpretation — check against the official text.)', 'Keep the HSEQ policy signed, current and displayed; review it periodically.', ['Signed HSEQ policy', 'Proof it is displayed or communicated'], 'P-002', 'Applicable', 'Policy maintained as part of the HSEQ management system.', [A(-90, 'Compliant', 'HSEQ policy signed by the MD and displayed at all branches.', '', '', 275)], [{ kind: 'Document', ref: 'DOC-001' }]);
  R('LR-002', 'LEG-OHSA-Section8', 'LEG-OHSA', 'Safe working environment and risk control', 'Identify the hazards of the work, assess the risks and put controls in place so that the workplace is kept safe and healthy. (System interpretation — check against the official text.)', 'Keep risk assessments current for all activities and make sure the controls are in place.', ['Baseline risk assessments per branch', 'Inspection records', 'Training records'], 'P-002', 'Applicable', 'Applies to every employer.', [A(-70, 'Partially compliant', 'Workshop baseline risk assessment in place; warehouse and Pinetown assessments outdated.', 'Risk assessments for Pinetown and the warehouse not reviewed.', 'Review the warehouse and Pinetown risk assessments.', 110)], [{ kind: 'Document', ref: 'DOC-006' }]);
  R('LR-003', 'LEG-OHSA-Section16', 'LEG-OHSA', 'CEO duties and assignment of duties', 'The CEO is responsible for the duties of the employer and may assign duties to another person in writing; this does not relieve the CEO of responsibility. (System interpretation.)', 'Keep a signed assignment for the managers who carry the duties.', ['Signed assignment letter(s)'], 'P-001', 'Applicable', 'Company with a CEO / Managing Director.', [A(-60, 'Compliant', 'Assignment to the Operations Manager signed and accepted.', '', '', 305)], [{ kind: 'Document', ref: 'DOC-016' }]);
  R('LR-004', 'LEG-OHSA-Section17', 'LEG-OHSA', 'Health and safety representatives designated', 'Designate health and safety representatives where the number of employees requires it, in the numbers required. (System interpretation — check the official text for the thresholds.)', 'Designate and train representatives at each branch where required; keep the designation letters.', ['Signed designation letters', 'Training certificates'], 'P-005', 'Applicable', 'More than 20 employees at Germiston and Pinetown.', [A(-45, 'Non-compliant', 'No representative designated at Pinetown since the previous one left.', 'Pinetown has no designated representative.', 'Designate and train a representative at Pinetown.', 45)], [], ['S-JHB', 'S-DBN']);
  R('LR-005', 'LEG-OHSA-Section19', 'LEG-OHSA', 'Health and safety committee', 'Establish a health and safety committee where there are representatives, meeting at the required frequency, with minutes kept. (System interpretation.)', 'Hold committee meetings and keep minutes.', ['Committee minutes'], 'P-005', 'Applicable', 'Representatives are designated at Germiston.', [], [], ['S-JHB']);
  R('LR-006', 'LEG-OHSA-Section24', 'LEG-OHSA', 'Reporting of certain incidents to the inspector', 'Report the incidents defined in the Act to an inspector within the required time and in the required manner. (System interpretation — the competent person decides what is reportable.)', 'Use the external reporting tracker on each incident; keep proof of reporting.', ['Incident register with reporting decisions', 'Copies of reports submitted'], 'P-002', 'Applicable', 'Applies to every employer.', [A(-30, 'Compliant', 'Reporting decisions recorded on all incidents; one report submitted with proof.', '', '', 335)], [{ kind: 'Document', ref: 'DOC-003' }]);
  R('LR-007', null, 'LEG-CR', 'Construction work requirements', 'Requirements for construction work. (System interpretation.)', '', [], 'P-002', 'Not applicable', 'The company does no construction work; racking installation is done by a contractor under its own construction work arrangements.', []);
  R('LR-008', null, 'LEG-HCA', 'Hazardous chemical agents — assessment and control', 'Assess and control exposure to hazardous chemical agents used at the workplace. (System interpretation.)', 'Keep the chemical register, safety data sheets and assessments current.', ['Chemical register', 'Safety data sheets', 'Risk assessment'], 'P-002', 'Pending assessment', '', [], [{ kind: 'Document', ref: 'DOC-018' }, { kind: 'Document', ref: 'DOC-024' }]);
});
