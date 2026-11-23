/* ==========================================================================
   Connecting the new OHS modules (committee, toolbox talks, permits, medical
   surveillance, management of change) to the rest of the system:
   - dashboard tiles under "Compliance management";
   - a sixth part of the control score, "Safety programmes";
   - reports for each module;
   - the employee's profile (committee/representative, talks signed, permits,
     medical status for those allowed to see it);
   - the contractor's page (its permits to work);
   - Administration → "Safety programme settings" (permit types and their
     precautions, representatives' inspection interval, committee meeting
     interval, toolbox talk categories) and the set-up checklist.
   ========================================================================== */
'use strict';

/* ---------- 1. Dashboard tiles ---------- */
const _compSecBeforeOhs = complianceSection;
complianceSection = function () {
  const html = _compSecBeforeOhs(); const tiles = [];
  const add = (area, t) => { if (canArea(area)) tiles.push(t); };
  { const C = committees(), od = C.filter(c => daysTo(comNextDue(c)) < 0).length, reps = [...new Set(shReps(S.ui.site))], ro = reps.filter(r => daysTo(repDue(r)) < 0).length;
    add('committee', kpi('H&S committee', od ? `${od} meeting(s) overdue` : C.length ? 'On schedule' : 'Not set up', `${reps.length} representative(s) · ${ro} inspection(s) overdue`, !C.length || od ? 'red' : ro ? 'amber' : 'green', '#/committee', 'people')); }
  { const T = talks(), month = TODAY.slice(0, 7), held = T.filter(t => t.status === 'Held' && t.date.slice(0, 7) === month).length, uns = T.filter(t => t.status === 'Held').reduce((n, t) => n + (t.attendees || []).filter(a => !a.sig).length, 0);
    add('toolbox', kpi('Toolbox talks this month', held, `${uns} attendance signature(s) outstanding`, !held ? 'amber' : uns ? 'amber' : 'green', '#/toolbox', 'clipboard')); }
  { const P = permits(), exp = P.filter(ptwExpired).length, act = P.filter(x => x.status === 'Issued' && !ptwExpired(x)).length, req = P.filter(x => x.status === 'Requested').length;
    add('permits', kpi('Permits to work', exp ? `${exp} expired, not closed` : `${act} active`, `${req} awaiting issue`, exp ? 'red' : req ? 'amber' : 'green', exp ? '#/permits?fstatus=Expired%20—%20not%20closed' : '#/permits', 'lock')); }
  if (canMed()) { const m = medSummary(); add('medical', kpi('Medical examinations', m.bad, `missing or overdue · ${m.restricted} with restrictions`, m.bad ? 'red' : m.restricted ? 'amber' : 'green', '#/medical', 'shield')); }
  { const X = mocs(), aw = X.filter(x => x.status === 'Awaiting approval').length, open = X.filter(x => !['Closed', 'Rejected'].includes(x.status)).length;
    add('moc', kpi('Changes in progress', open, `${aw} awaiting approval`, aw ? 'amber' : 'blue', '#/moc', 'refresh')); }
  if (!tiles.length) return html;
  if (!html) return `<h3 class="dash-sec">${icon('scale', 'sm')} Compliance management</h3><div class="kpis kpis-8 dash-comp">${tiles.join('')}</div>`;
  const k = html.lastIndexOf('</div>'); return html.slice(0, k) + tiles.join('') + html.slice(k);
};
function medSummary(sid = S.ui.site) { let bad = 0, restricted = 0, req = 0, ok = 0;
  ohsPeople(pp => (sid === 'ALL' || pp.site === sid) && medFor(pp).length).forEach(pp => medFor(pp).forEach(r => { const st = medStatus(pp.id, r.id); req++; if (['Missing', 'Overdue', 'Unfit'].includes(st)) bad++; else ok++; if (st === 'Restrictions') restricted++; }));
  return { bad, restricted, req, ok }; }

/* ---------- 2. Control score: "Safety programmes" ---------- */
function programmesPart(sid) {
  const inSid = x => x.org === S.ui.org && (sid === 'ALL' || !x.site || x.site === 'ALL' || x.site === sid), m = [];
  const C = (S.committees || []).filter(inSid); if (C.length) m.push(['Committee meetings on schedule', C.filter(c => daysTo(comNextDue(c)) >= 0).length, C.length, 'committee meeting(s) overdue']);
  const reps = [...new Set(shReps(sid))]; if (reps.length) m.push(['Representatives\' inspections on time', reps.filter(r => daysTo(repDue(r)) >= 0).length, reps.length, 'representative inspection(s) overdue']);
  const att = (S.talks || []).filter(t => inSid(t) && t.status === 'Held' && daysTo(t.date) > -90).flatMap(t => t.attendees || []); if (att.length) m.push(['Toolbox talk attendance signed (90 days)', att.filter(a => a.sig).length, att.length, 'toolbox talk signature(s) outstanding']);
  const P = (S.permits || []).filter(x => inSid(x) && ['Issued', 'Closed'].includes(x.status) && daysTo(x.validFrom.slice(0, 10)) > -90); if (P.length) m.push(['Permits closed out properly (90 days)', P.filter(x => !ptwExpired(x)).length, P.length, 'permit(s) expired without close-out']);
  const med = medSummary(sid); if (med.req) m.push(['Medical examinations current', med.ok, med.req, 'medical examination(s) missing or overdue']);
  if (!m.length) return null;
  const pct = Math.round(m.reduce((s, x) => s + x[1] / x[2], 0) / m.length * 100);
  return { pct, measures: m };
}
PART_TITLE.programmes = 'Safety programmes'; PART_ICON.programmes = 'people'; PART_LABELS.programmes = 'Safety programmes (committee, talks, permits, medical)';
const _complianceBeforeOhs = compliance;
compliance = function (sid) { const c = _complianceBeforeOhs(sid), pr = programmesPart(sid); if (!pr) return c;
  c.parts = Object.assign({}, c.parts, { programmes: pr.pct }); const w = S.config.complianceWeights; let tw = 0, ts = 0; Object.keys(c.parts).forEach(k => { tw += Number(w[k] || 0); ts += c.parts[k] * Number(w[k] || 0); }); c.overall = tw ? Math.round(ts / tw) : c.overall; return c; };
const _partDriversBeforeOhs = partDrivers;
partDrivers = function (sid) { const d = _partDriversBeforeOhs(sid), pr = programmesPart(sid);
  if (pr) d.programmes = { line: pr.measures.map(x => `${x[0]}: ${x[1]} of ${x[2]}`).slice(0, 2).join(' · '), issues: pr.measures.filter(x => x[1] < x[2]).map(x => `${x[2] - x[1]} ${x[3]}`) }; return d; };
const _dashBeforeOhs = ROUTES.dashboard;
ROUTES.dashboard = (p, q) => { const r = _dashBeforeOhs(p, q); if (r && r.html && r.html.indexOf('class="cs-grid') > -1) { const n = Object.keys(compliance(S.ui.site).parts).length, words = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];
    r.html = r.html.replace(/weighted from the (four|five|six) areas/, `weighted from the ${words[n]} areas`); if (n >= 6) r.html = r.html.replace(/<div class="cs-grid( cs-six)?">/, '<div class="cs-grid cs-seven">'); } return r; };
MIGRATIONS.push(() => { if (S.migr && S.migr.progScore) return; S.migr = S.migr || {}; S.migr.progScore = true; if (S.config.complianceWeights.programmes == null) S.config.complianceWeights.programmes = 10; });

/* ---------- 3. Reports ---------- */
REPORTS.push(['comrep', 'H&S committee and representatives'], ['tbtrep', 'Toolbox talk attendance'], ['ptwrep', 'Permit to work register'], ['medrep', 'Medical surveillance register'], ['mocrep', 'Management of change register']);
const _buildReportBeforeOhs = buildReport;
buildReport = function (key) {
  const B = (t, tone) => H(badge(t, tone || 'grey', true), t);
  switch (key) {
    case 'comrep': { const M = comMeetings(), R = repInsps(); return { desc: 'Committee meetings (planned and held, with their decisions) and the representatives\' workplace inspections (with their findings).',
      ...tableRep(['Record', 'Kind', 'Committee / representative', 'Branch', 'Date', 'Attended', 'Decisions / findings', 'Status'], M.map(m => [m.id, 'Committee meeting', (byId('committees', m.committee) || {}).name || '', m.site === 'ALL' ? 'All branches' : sname(m.site), fmt(m.date), (m.attendees || []).length, (m.findings || []).length, B(m.status, m.status === 'Held' ? 'green' : 'blue')]).concat(R.map(r => [r.id, 'Representative inspection', pname(r.rep), sname(r.site) + ' · ' + (r.area || ''), fmt(r.date), '', (r.findings || []).length, B('Recorded', 'green')]))) }; }
    case 'tbtrep': { const T = talks().slice().sort((a, b) => b.date.localeCompare(a.date)); return { desc: 'Every toolbox talk with its presenter and attendance register: who attended and who signed.',
      ...tableRep(['Talk', 'Topic', 'Branch', 'Date', 'Presenter', 'Attendees', 'Signed', 'Not signed', 'Status'], T.map(t => [t.id, t.topic, sname(t.site), fmt(t.date), pname(t.presenter), (t.attendees || []).length, talkSigned(t), (t.attendees || []).filter(a => !a.sig).map(a => pname(a.person)).join(', '), B(t.status, t.status === 'Held' ? 'green' : 'blue')])) }; }
    case 'ptwrep': { const P = permits().slice().sort((a, b) => b.id.localeCompare(a.id)); return { desc: 'Every permit to work: type, work, location, validity, who issued it and whether it was closed out.',
      ...tableRep(['Permit', 'Type', 'Work', 'Branch / location', 'From', 'Until', 'Performed by', 'Issued by', 'Closed out', 'Status'], P.map(x => [x.id, x.type, x.work, sname(x.site) + ' · ' + (x.location || ''), fmtTs(x.validFrom), fmtTs(x.validTo), x.contractor ? (byId('contractors', x.contractor) || {}).name || '' : pname(x.performer), x.issued ? pname(x.issued.by) : '', x.closed ? fmtTs(x.closed.ts) : '', B(ptwState(x), ptwExpired(x) ? 'red' : PTW_STATUS[x.status])])) }; }
    case 'medrep': { if (!canMed()) return { desc: 'Only roles with "Manage medical surveillance" can see this report.', ...tableRep(['—'], []) };
      const rows = ohsPeople(pp => ohsInScope({ org: pp.org, site: pp.site }) && medFor(pp).length).flatMap(pp => medFor(pp).map(r => { const l = medLast(pp.id, r.id), st = medStatus(pp.id, r.id); return [pp.name, pp.jobTitle, sname(pp.site), r.name, l ? fmt(l.date) : '', l ? l.outcome : '', l ? l.restrictions || '' : '', l && l.nextDue < '9999' ? fmt(l.nextDue) : '', B(st, MED_TONE[st])]; }));
      return { desc: 'Who needs which examination, the last fitness outcome and when the next one is due. Clinical results are not kept in the system.', ...tableRep(['Employee', 'Job title', 'Branch', 'Examination', 'Last examined', 'Outcome', 'Restrictions', 'Next due', 'Status'], rows) }; }
    case 'mocrep': { const X = mocs().slice().sort((a, b) => b.id.localeCompare(a.id)); return { desc: 'Every change with its type, impact, approvals, implementation actions and status.',
      ...tableRep(['Change', 'Title', 'Type', 'Branch', 'Requested', 'Affects', 'Approvals', 'Actions open', 'Status'], X.map(x => [x.id, x.title, x.type, sname(x.site), fmt(x.date), (x.impacts || []).filter(i => i.affected).map(i => i.area).join(', '), (x.approvals || []).map(a => `${pname(a.by)}: ${a.decision || 'waiting'}`).join('; '), (x.actions || []).map(a => byId('actions', a)).filter(a => a && actionOpen(a)).length, B(x.status, MOC_TONE[x.status])])) }; }
  }
  return _buildReportBeforeOhs(key);
};

/* ---------- 4. Employee profile ---------- */
const _peopleBeforeOhs = ROUTES.people;
ROUTES.people = (p, q) => { const r = _peopleBeforeOhs(p, q);
  if (r && r.html && p[0] && /^P-/.test(p[0]) && !/Page not found/.test(r.html)) { const x = byId('people', p[0]); if (!x) return r;
    const coms = (S.committees || []).filter(c => c.org === x.org && (c.members || []).concat([c.chair, c.secretary]).includes(x.id)), isRep = shReps().includes(x.id);
    const T = (S.talks || []).filter(t => t.org === x.org && (t.attendees || []).some(a => a.person === x.id)).sort((a, b) => b.date.localeCompare(a.date));
    const P = (S.permits || []).filter(z => z.org === x.org && (z.performer === x.id || (z.issued && z.issued.by === x.id))).sort((a, b) => b.id.localeCompare(a.id));
    const showMed = canMed() || x.id === S.ui.user, med = medFor(x);
    const rows = [];
    if (coms.length || isRep) rows.push(`<div>H&S committee</div><div>${coms.map(c => `<a href="#/committee/${c.id}">${esc(c.name)}</a> (${c.chair === x.id ? 'chair' : c.secretary === x.id ? 'secretary' : 'member'})`).join(', ') || '—'}${isRep ? ` <span class="tag">Health and safety representative</span> · next inspection ${dueText(repDue(x.id))}` : ''}</div>`);
    rows.push(`<div>Toolbox talks</div><div>${T.length ? `${T.filter(t => (t.attendees.find(a => a.person === x.id) || {}).sig).length} of ${T.length} signed${T.length ? ` · last: <a href="#/toolbox/${T[0].id}">${esc(T[0].topic)}</a> (${fmt(T[0].date)})` : ''}` : 'None attended'}</div>`);
    if (P.length) rows.push(`<div>Permits to work</div><div>${P.slice(0, 4).map(z => `<a href="#/permits/${z.id}">${z.id}</a> ${esc(z.type)} ${badge(ptwState(z), ptwExpired(z) ? 'red' : PTW_STATUS[z.status], true)}`).join('<br>')}${P.length > 4 ? `<br><span class="t-sub">and ${P.length - 4} more</span>` : ''}</div>`);
    if (showMed && med.length) rows.push(`<div>Medical surveillance</div><div>${med.map(m => { const st = medStatus(x.id, m.id), l = medLast(x.id, m.id); return `${badge(st, MED_TONE[st], true)} ${esc(m.name)}${l && l.restrictions ? ` <span class="t-sub">— ${esc(l.restrictions)}</span>` : ''}`; }).join('<br>')}</div>`);
    const card = `<div class="card mt ohs-prof"><div class="card-head"><h2>Safety programmes</h2><span class="ch-sub">Committee, toolbox talks, permits${showMed ? ' and medical surveillance' : ''}</span></div><div class="card-body"><div class="kv">${rows.join('')}</div></div></div>`;
    r.html += card; }
  return r; };

/* ---------- 5. Contractor page: its permits to work ---------- */
const _conBeforeOhs = ROUTES.contractors;
ROUTES.contractors = (p, q) => { const r = _conBeforeOhs(p, q);
  if (r && r.html && p[0] && /^CON-/.test(p[0])) { const P = (S.permits || []).filter(z => z.contractor === p[0]).sort((a, b) => b.id.localeCompare(a.id));
    r.html += `<div class="card mt"><div class="card-head"><h2>Permits to work</h2><span class="ch-sub">${P.length} permit(s) for this contractor</span>${canArea('permits') ? `<a class="btn sm" href="#/permits">${icon('lock', 'sm')} Permits to work</a>` : ''}</div><div class="card-body flush">${P.length ? `<ul class="link-list">${P.map(z => `<li><div class="ll-main"><a href="#/permits/${z.id}" class="mono">${z.id}</a> ${esc(z.type)} — ${esc(z.work)}<div class="t-sub">${esc(sname(z.site))} · ${fmtTs(z.validFrom)} to ${fmtTs(z.validTo)}</div></div>${badge(ptwState(z), ptwExpired(z) ? 'red' : PTW_STATUS[z.status], true)}</li>`).join('')}</ul>` : '<div class="card-body muted">No permits yet.</div>'}</div></div>`; }
  return r; };

/* ---------- 6. Administration → Safety programme settings ---------- */
const canOhsSettings = () => can('admin') || can('permit.issue') || can('committee.manage');
function ohsSettingsHtml() { const ro = !canOhsSettings(), PT = ptwTypes();
  return `<div class="alert info">${icon('info')}<div>The company's own settings for the safety programmes. The permit precautions are the company's checklists (demonstration defaults): adjust them to your own procedures. They are not legal text.</div></div>
  <form id="ohsSetForm" class="card"><div class="card-head"><h2>Intervals</h2></div><div class="card-body"><div class="form-grid">
    ${fld({ name: 'comMonths', label: 'New committees meet every (months)', type: 'number', min: 1, value: S.config.comMonths || 3, required: true })}
    ${fld({ name: 'repMonths', label: 'Representatives inspect the workplace every (months)', type: 'number', min: 1, value: S.config.repInspMonths || 1, required: true })}
    ${fld({ name: 'talkCats', label: 'Toolbox talk categories (one per line)', type: 'textarea', rows: 5, value: (S.config.talkCats || TALK_CATS).join('\n'), full: true })}</div></div></form>
  ${PT.map((t, i) => `<div class="card"><div class="card-head"><h2>Permit: ${esc(t.name)}</h2>${ro ? '' : `<button type="button" class="btn sm" data-act="ptwTypeRemove" data-i="${i}">Remove</button>`}</div><div class="card-body"><div class="form-grid">${fld({ name: 'pn' + i, label: 'Name', value: t.name, required: true })}${fld({ name: 'pp' + i, label: 'Precautions the issuer must confirm (one per line)', type: 'textarea', rows: Math.max(4, t.precautions.length + 1), value: t.precautions.join('\n'), required: true, full: true })}</div></div></div>`).join('')}
  ${ro ? '' : `<div class="btn-row"><button type="button" class="btn" data-act="ptwTypeAdd">${icon('plus', 'sm')} Add a permit type</button><button type="button" class="btn primary" data-act="ohsSetSave">Save settings</button></div>`}`; }
ACT.ohsSetSave = () => { const root = document.getElementById('content'); if (!validateForm(root)) return; const v = readForm(root);
  S.config.comMonths = Math.max(1, +v.comMonths || 3); S.config.repInspMonths = Math.max(1, +v.repMonths || 1);
  S.config.talkCats = (v.talkCats || '').split('\n').map(x => x.trim()).filter(Boolean);
  ptwTypes().forEach((t, i) => { t.name = (v['pn' + i] || t.name).trim(); t.precautions = (v['pp' + i] || '').split('\n').map(x => x.trim()).filter(Boolean); });
  log('Updated the safety programme settings', '#/admin/ohs'); save(); toast('Settings saved.'); rerender(); };
ACT.ptwTypeAdd = () => { openModal({ title: 'Add a permit type', body: `<div class="form-grid">${fld({ name: 'name', label: 'Name', required: true, full: true, placeholder: 'e.g. Roof work' })}${fld({ name: 'prec', label: 'Precautions (one per line)', type: 'textarea', rows: 5, required: true, full: true })}</div>`,
  buttons: [{ label: 'Add', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); S.config.permitTypes.push({ name: v.name.trim(), precautions: v.prec.split('\n').map(x => x.trim()).filter(Boolean) }); log(`Added permit type ${v.name}`, '#/admin/ohs'); save(); rerender(); } }] }); };
ACT.ptwTypeRemove = (el) => { const t = S.config.permitTypes[+el.dataset.i]; confirmBox(`Remove the permit type "${t.name}"? Permits already issued keep their precautions.`, () => { S.config.permitTypes.splice(+el.dataset.i, 1); log(`Removed permit type ${t.name}`, '#/admin/ohs'); save(); rerender(); }); };
const _adminBeforeOhs = ROUTES.admin;
function cutAfterAdmNav(html) { const i = html.indexOf('<div class="adm-nav">'); if (i < 0) return html; let k = i, depth = 0; const re = /<div\b|<\/div>/g; re.lastIndex = i; let m;
  while ((m = re.exec(html))) { depth += m[0] === '</div>' ? -1 : 1; if (!depth) { k = re.lastIndex; break; } } return html.slice(0, k); }
ROUTES.admin = (p, q) => { const ohs = p[0] === 'ohs', r = _adminBeforeOhs(ohs ? ['priorities'] : p, q); if (!r || !r.html) return r;
  if (ohs) r.html = cutAfterAdmNav(r.html).replace(/(<a role="tab"[^>]*class=")([^"]*)\bactive\b/g, '$1$2');
  r.html = r.html.replace(/(<span>Checklists and types<\/span><div class="tabs adm-tabs" role="tablist">[\s\S]*?)(<\/div><\/div>)/, `$1<a role="tab" href="#/admin/ohs" class="${ohs ? 'active' : ''}">Safety programmes</a>$2`);
  if (ohs) { r.html += ohsSettingsHtml(); r.crumbs = [['Administration', '#/admin'], ['Safety programme settings', '#']]; }
  return r; };
// talk categories and committee interval come from the settings
MIGRATIONS.push(() => { if (S.migr && S.migr.ohsSet) return; S.migr = S.migr || {}; S.migr.ohsSet = true; S.config.comMonths = S.config.comMonths || 3; S.config.talkCats = S.config.talkCats || TALK_CATS.slice(); });

/* ---------- 7. Set-up checklist ---------- */
const _setupItemsBeforeOhs = setupItems;
setupItems = function () { const it = _setupItemsBeforeOhs(), o = S.ui.org, sites = orgSites();
  return it.concat([
    ['H&S committee set up', (S.committees || []).some(c => c.org === o), '#/committee', 'Members, chair and meeting interval'],
    ['Health and safety representatives appointed', shReps('ALL').length > 0, '#/people/appointments', 'Appointment type "Health and safety representative"'],
    ['Toolbox talk library', (S.talkLib || []).some(x => x.org === o && !x.archived), '#/toolbox/library', 'Ready-made talks for supervisors'],
    ['Permit types and precautions', ptwTypes().length > 0, '#/admin/ohs', 'Hot work, heights, confined space…'],
    ['Medical surveillance', medReqs().length > 0, '#/medical/types', 'Examinations per job title'] ]); };
