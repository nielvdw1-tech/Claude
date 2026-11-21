/* ==========================================================================
   Closing gaps found in the full review of the prototype
   1. Legal compliance is part of the control score (fifth part).
   2. "My team": supervisors and managers see their people's appointments,
      PPE, training, documents to read and inspections in one place.
   3. Administration tabs grouped into sections.
   4. A bottom navigation bar for employees on phones.
   5. Issue PPE to several people at once; issue an appointment to several
      people at once.
   6. Every report can be downloaded as a PDF.
   7. Departments can be limited to the branches where they exist.
   ========================================================================== */
'use strict';

/* ---------------- 1. Legal compliance in the control score ---------------- */
PART_LABELS.legal = 'Legal requirements compliant (assessed)';
PART_TITLE.legal = 'Legal compliance'; PART_ICON.legal = 'scale';
if (typeof PART_LINKS === 'object') PART_LINKS.legal = '#/legal/register';
function legalPart(sid) { const L = (S.legalReqs || []).filter(r => r.org === S.ui.org && r.applicability === 'Applicable' && (!sid || sid === 'ALL' || inSites(r, sid))); if (!L.length) return null;
  const st = s => L.filter(r => lrStatus(r) === s).length; return { pct: Math.round(((st('Compliant') + st('Partially compliant') * 0.5) / L.length) * 100), n: L.length, c: st('Compliant'), p: st('Partially compliant'), nc: st('Non-compliant'), na: st('Not assessed'), due: L.filter(lrDue).length }; }
const _complianceBeforeQA = compliance;
compliance = function (sid) { const c = _complianceBeforeQA(sid), l = typeof lrStatus === 'function' ? legalPart(sid) : null; if (!l) return c;
  c.parts = Object.assign({}, c.parts, { legal: l.pct }); const w = S.config.complianceWeights; let tw = 0, ts = 0; Object.keys(c.parts).forEach(k => { tw += Number(w[k] || 0); ts += c.parts[k] * Number(w[k] || 0); }); c.overall = tw ? Math.round(ts / tw) : c.overall; return c; };
const _dashBeforeQA = ROUTES.dashboard;
ROUTES.dashboard = (p, q) => { const r = _dashBeforeQA(p, q); if (r && r.html) { r.html = r.html.replace('weighted from the four areas', 'weighted from the ' + (Object.keys(compliance(S.ui.site).parts).length === 5 ? 'five' : 'four') + ' areas'); if (Object.keys(compliance(S.ui.site).parts).length === 5) r.html = r.html.replace('<div class="cs-grid">', '<div class="cs-grid cs-six">'); } return r; };
const _partDriversBeforeQA = partDrivers;
partDrivers = function (sid) { const d = _partDriversBeforeQA(sid), l = legalPart(sid);
  if (l) d.legal = { line: `${l.c} of ${l.n} applicable requirements compliant, ${l.p} partially`, issues: [[l.nc, 'non-compliant'], [l.na, 'not assessed'], [l.due, 'due for reassessment']].filter(x => x[0]).map(x => `${x[0]} ${x[1]}`) }; return d; };
MIGRATIONS.push(() => { if (S.migr && S.migr.legalScore) return; S.migr = S.migr || {}; S.migr.legalScore = true; if (S.config.complianceWeights.legal == null) S.config.complianceWeights.legal = 25; });

/* ---------------- 2. My team ---------------- */
const myTeam = () => S.people.filter(p => p.supervisor === S.ui.user && p.status !== 'Deactivated');
function teamRow(x) {
  const aptOpenN = (S.appointments || []).filter(a => a.person === x.id && aptOpen(a)).length, aptDecl = (S.appointments || []).filter(a => a.person === x.id && a.status === 'Declined').length;
  let ppeOut = 0, ppeSign = 0; ppeReqFor(x).forEach(r => { const s = ppeStatus(x.id, r.ppe); if (s === 'Outstanding' || s === 'Replacement due') ppeOut++; if (s === 'Not signed') ppeSign++; });
  const trGap = requiredFor(x).filter(r => gap(trStatus(x.id, r.course))).length, trExp = requiredFor(x).filter(r => trStatus(x.id, r.course) === 'Expiring').length;
  const insOver = S.schedules.filter(s => s.assignee === x.id && daysTo(s.nextDue) < 0).length;
  const read = typeof docsToRead === 'function' ? docsToRead(x.id).length : 0;
  return { x, aptOpenN, aptDecl, ppeOut, ppeSign, trGap, trExp, insOver, read, issues: aptOpenN + aptDecl + ppeOut + ppeSign + trGap + insOver + read };
}
ROUTES.team = () => {
  const T = myTeam(); if (!T.length) return { title: 'My team', nav: 'team', crumbs: [['My team', '#']], html: `${pageHead('My team', 'People who report to you.')}<div class="card">${emptyList('Nobody reports to you in the system. Reporting lines are set on each employee in People Management.')}</div>` };
  const R = T.map(teamRow).sort((a, b) => b.issues - a.issues);
  const cell = (n, tone, label) => n ? `<span class="due ${tone}">${n} ${label}</span>` : '<span class="muted">—</span>';
  const html = `${pageHead('My team', 'Your people at a glance: what they still need to accept, sign for, complete or attend. Open a person to see the details.')}
    <div class="kpis">${kpi('People', R.length, `${R.filter(r => !r.issues).length} fully up to date`, 'blue', '#/team', 'people')}${kpi('Appointments not accepted', R.reduce((n, r) => n + r.aptOpenN + r.aptDecl, 0), 'Waiting or declined', R.some(r => r.aptOpenN + r.aptDecl) ? 'amber' : 'green', '#/team', 'user')}
      ${kpi('PPE to issue or sign', R.reduce((n, r) => n + r.ppeOut + r.ppeSign, 0), 'Outstanding, due or not signed', R.some(r => r.ppeOut + r.ppeSign) ? 'amber' : 'green', '#/team', 'hardhat')}${kpi('Training gaps', R.reduce((n, r) => n + r.trGap, 0), `${R.reduce((n, r) => n + r.trExp, 0)} expiring soon`, R.some(r => r.trGap) ? 'red' : 'green', '#/team', 'checkCircle')}</div>
    <div class="card"><div class="card-body flush"><div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Person</th><th>Appointments</th><th>PPE</th><th>Training</th><th>Inspections</th><th>Documents to read</th></tr></thead><tbody>
    ${R.map(r => `<tr class="rowlink" data-href="#/people/${r.x.id}"><td data-label="Person"><b>${esc(r.x.name)}</b><div class="t-sub">${esc(r.x.jobTitle)} · ${esc(sname(r.x.site))}</div></td><td data-label="Appointments">${r.aptOpenN || r.aptDecl ? [cell(r.aptOpenN, 'amber', 'to accept'), r.aptDecl ? cell(r.aptDecl, 'red', 'declined') : ''].join(' ') : '<span class="due green">In order</span>'}</td><td data-label="PPE">${r.ppeOut || r.ppeSign ? [r.ppeOut ? cell(r.ppeOut, 'red', 'to issue') : '', r.ppeSign ? cell(r.ppeSign, 'amber', 'not signed') : ''].join(' ') : '<span class="due green">In order</span>'}</td><td data-label="Training">${r.trGap ? cell(r.trGap, 'red', 'gap(s)') : r.trExp ? cell(r.trExp, 'amber', 'expiring') : '<span class="due green">In order</span>'}</td><td data-label="Inspections">${cell(r.insOver, 'red', 'overdue')}</td><td data-label="Documents">${cell(r.read, 'amber', 'to read')}</td></tr>`).join('')}
    </tbody></table></div></div></div>`;
  return { title: 'My team', nav: 'team', crumbs: [['My team', '#']], html };
};
(() => { const g = NAV.find(x => x.group === 'Overview'); if (g && !g.items.some(i => i[0] === 'team')) g.items.splice(2, 0, ['team', 'My team', 'people']); })();
if (!TOP_ROUTES.includes('team')) TOP_ROUTES.push('team');
// only shown in the menu to people who have someone reporting to them
const _rerenderBeforeTeam = rerender;
rerender = function (k) { _rerenderBeforeTeam(k); try { if (!myTeam().length) document.querySelectorAll('#sidebar a.nav-item[href="#/team"]').forEach(a => a.remove()); } catch (e) { /* menu not drawn */ } };

/* ---------------- 3. Administration tabs in sections ---------------- */
const ADMIN_GROUPS = [['Company and people', ['orgs', 'users', 'roles', 'hours', 'privacy']], ['Documents and approvals', ['approvals', 'doccats', 'rules']], ['Checklists and types', ['assettypes', 'templates', 'audittemplates', 'appttypes', 'conreqs']], ['Risk, actions and incidents', ['riskmatrix', 'priorities', 'injury', 'scoring']], ['System', ['notifications', 'outbox', 'audit', 'import', 'data']]];
const _adminBeforeQA = ROUTES.admin;
ROUTES.admin = (p, q) => { const r = _adminBeforeQA(p, q); if (!r || !r.html) return r;
  const m = r.html.match(/<div class="tabs" role="tablist">([\s\S]*?)<\/div>/); if (!m) return r;
  const tabs = {}; m[1].replace(/<a role="tab" href="#\/admin\/([\w-]+)"[^>]*>[\s\S]*?<\/a>/g, (a, k) => { tabs[k] = a; return a; });
  const used = new Set(), groups = ADMIN_GROUPS.map(([label, keys]) => { const items = keys.filter(k => tabs[k]).map(k => { used.add(k); return tabs[k]; }); return items.length ? `<div class="adm-grp"><span>${label}</span><div class="tabs adm-tabs" role="tablist">${items.join('')}</div></div>` : ''; }).join('');
  const rest = Object.keys(tabs).filter(k => !used.has(k)).map(k => tabs[k]).join('');
  r.html = r.html.replace(m[0], `<div class="adm-nav">${groups}${rest ? `<div class="adm-grp"><span>Other</span><div class="tabs adm-tabs" role="tablist">${rest}</div></div>` : ''}</div>`); return r; };

/* ---------------- 4. Bottom navigation for employees on phones ---------------- */
function empBottomNav() {
  let bar = document.getElementById('empBar'); const on = S && S.ui && S.ui.user && typeof isFieldUser === 'function' && isFieldUser() && signedIn();
  if (!on) { if (bar) bar.remove(); document.body.classList.remove('has-empbar'); return; }
  const cur = (location.hash.replace(/^#\/?/, '').split(/[/?]/)[0]) || 'field', c = typeof empCounts === 'function' ? empCounts() : {};
  const it = (k, ic, label, n, act) => `<${act ? `button type="button" data-act="${act}"` : `a href="#/${k}"`} class="eb-i ${cur === k ? 'on' : ''}" aria-label="${label}">${icon(ic)}<span>${label}</span>${n ? `<b>${n}</b>` : ''}</${act ? 'button' : 'a'}>`;
  const html = it('field', 'dashboard', 'Home', 0) + it('notifications', 'bell', 'Alerts', c.notif) + it('scan', 'qr', 'Scan', 0, 'qrScan') + it('report', 'siren', 'Report', 0) + it('me', 'user', 'My items', (c.apt || 0) + (c.ppe || 0));
  if (!bar) { bar = document.createElement('nav'); bar.id = 'empBar'; bar.className = 'emp-bar'; bar.setAttribute('aria-label', 'Employee menu'); document.body.appendChild(bar); }
  bar.innerHTML = html; document.body.classList.add('has-empbar');
}
const _rerenderBeforeBar = rerender;
rerender = function (k) { _rerenderBeforeBar(k); try { empBottomNav(); } catch (e) { console.error(e); } };

/* ---------------- 5. Issue to several people at once ---------------- */
const _ppeIssueBeforeQA = ACT.ppeIssue;
ACT.ppeIssue = (el) => { if (el && el.dataset && el.dataset.p) return _ppeIssueBeforeQA(el);
  openModal({ title: 'Issue PPE', sub: 'Choose one item and tick everyone who receives it. Each person is asked to sign for it.', size: 'wide', body: `<div class="form-grid">
    ${fld({ name: 'ppe', label: 'Item', type: 'select', options: opts(ppeTypes().map(t => ({ value: t.id, label: `${t.name}${t.stock != null ? ' (stock ' + t.stock + ')' : ''}` })), '', '— Select —'), required: true })}
    ${fld({ name: 'qty', label: 'Quantity each', type: 'number', min: 1, value: 1, required: true })}${fld({ name: 'reason', label: 'Reason', type: 'select', options: opts(['New issue', 'Replacement — worn', 'Replacement — damaged', 'Replacement — lost', 'Scheduled replacement']) })}
    ${fld({ name: 'date', label: 'Date issued', type: 'date', value: TODAY, required: true })}
    <div class="field full"><label>People <button type="button" class="link-btn" id="ppeNeed">Tick everyone who needs it</button></label><div class="chk-col" id="ppePeople">${ppePeople().map(x => `<label class="check"><input type="checkbox" name="pp_${x.id}"> <span>${esc(x.name)} <span class="t-sub">${esc(x.jobTitle)} · ${esc(sname(x.site))}</span></span></label>`).join('')}</div></div></div>`,
    onOpen: m => { m.querySelector('#ppeNeed').addEventListener('click', () => { const t = m.querySelector('[name=ppe]').value; if (!t) { toast('Choose the item first.', 'error'); return; } ppePeople().forEach(x => { const r = ppeReqFor(x).find(z => z.ppe === t); m.querySelector(`[name=pp_${x.id}]`).checked = !!r && ['Outstanding', 'Replacement due'].includes(ppeStatus(x.id, t)); }); }); },
    buttons: [{ label: 'Issue', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m), t = ppeType(v.ppe), qty = Math.max(1, +v.qty), ppl = ppePeople().filter(x => m.querySelector(`[name=pp_${x.id}]`).checked);
      if (!ppl.length) { toast('Tick at least one person.', 'error'); return false; } if (t.stock != null && t.stock < qty * ppl.length) { toast(`Only ${t.stock} in stock for ${qty * ppl.length} needed.`, 'error'); return false; }
      S.ppeIssues = S.ppeIssues || []; ppl.forEach(x => { S.ppeIssues.push({ id: nextId('ISS-', 'ppeIssues', 4), org: S.ui.org, person: x.id, ppe: v.ppe, qty, size: '', reason: v.reason, date: v.date, replaceBy: t.replaceMonths ? addMonths(v.date, t.replaceMonths) : '', by: S.ui.user, ack: null }); addEvent('blue', 'ppe', `PPE issued to you: ${t.name}`, 'Please sign that you received it.', '#/myppe', 'ALL', [x.id]); });
      if (t.stock != null) t.stock -= qty * ppl.length; log(`Issued ${t.name} to ${ppl.length} people`, '#/ppe/issues'); save(); toast(`${t.name} issued to ${ppl.length} people — each is asked to sign.`); rerender(); } }] }); };
// appointments: "Issue to several people" from the register
ACT.aptBulk = () => openModal({ title: 'Issue an appointment to several people', sub: 'One digital appointment per person, each to read, sign and accept in their app.', size: 'wide', body: `<div class="form-grid">
    ${fld({ name: 'type', label: 'Appointment type', type: 'select', options: opts(apptTypes().map(t => ({ value: t.id, label: t.name })), '', '— Select —'), required: true, full: true })}
    ${fld({ name: 'authority', label: 'Appointing authority', type: 'select', options: personOptions((S.people.find(p => p.org === S.ui.org && p.sysRole === 'Managing Director') || {}).id, p => !!p.sysRole), required: true })}${fld({ name: 'effective', label: 'Effective date', type: 'date', value: TODAY, required: true })}
    <div class="field full"><label>People</label><div class="chk-col">${S.people.filter(p => p.org === S.ui.org && p.status !== 'Deactivated' && p.type === 'Employee').map(x => `<label class="check"><input type="checkbox" name="ab_${x.id}"> <span>${esc(x.name)} <span class="t-sub">${esc(x.jobTitle)} · ${esc(sname(x.site))}</span></span></label>`).join('')}</div></div></div>`,
  buttons: [{ label: 'Issue to all ticked', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m), t = apptTypes().find(x => x.id === v.type), ppl = S.people.filter(x => m.querySelector(`[name=ab_${x.id}]`) && m.querySelector(`[name=ab_${x.id}]`).checked);
    if (!ppl.length) { toast('Tick at least one person.', 'error'); return false; } S.appointments = S.appointments || [];
    ppl.forEach(x => { const id = nextId('APT-', 'appointments'), a = { id, org: x.org, person: x.id, type: v.type, site: x.site, legal: t.legal || '', ref: '', authority: v.authority, effective: v.effective, end: '', method: 'Digital', duties: t.duties, notes: '', version: 1, versions: [], created: TODAY, createdBy: S.ui.user, status: 'Sent to employee', issued: nowTs(), issuedBy: S.ui.user, history: [{ ts: nowTs(), by: S.ui.user, action: 'Issued to the employee', comment: 'Issued to several people at once' }] };
      S.appointments.push(a); queueEmail([x.id], 'people', `Appointment for you to accept: ${t.name}`, `${pname(S.ui.user)} issued an appointment to you: ${t.name}. Open it, read it, then sign and accept it.`, '#/me/' + id); addEvent('amber', 'people', 'Appointment requires your attention', `${t.name} — open it to read, sign and accept.`, '#/me/' + id, x.site, [x.id]); });
    log(`Issued ${t.name} to ${ppl.length} people`, '#/people/appointments'); save(); toast(`Issued to ${ppl.length} people.`); navigate('#/people/appointments'); } }] });
const _peopleBeforeQA = ROUTES.people;
ROUTES.people = (p, q) => { const r = _peopleBeforeQA(p, q); if (r && r.html && p[0] === 'appointments' && canPeople()) r.html = r.html.replace(/(<div class="fab-stack[^"]*"[^>]*>)/, `$1<button type="button" class="btn ghost fab" data-act="aptBulk" title="Issue to several people" aria-label="Issue to several people">${icon('people', 'sm')}<span>Issue to several people</span></button>`); return r; };

/* ---------------- 6. Every report as a PDF ---------------- */
ACT.repPdf = async () => { if (!LAST_REPORT || !LAST_REPORT.csv || LAST_REPORT.csv.length < 2) { toast('Nothing to download.', 'error'); return; }
  try { const { PDFDocument, StandardFonts, rgb } = await ensurePdfLib(); const pdf = await PDFDocument.create(), R = await pdf.embedFont(StandardFonts.Helvetica), B = await pdf.embedFont(StandardFonts.HelveticaBold);
    const rows = LAST_REPORT.csv, cols = rows[0].length, W = cols > 6 ? 842 : 595, H = cols > 6 ? 595 : 842, M = 32, ink = rgb(0.06, 0.1, 0.2), mute = rgb(0.4, 0.45, 0.55), line = rgb(0.86, 0.89, 0.93), cw = (W - 2 * M) / cols;
    const pages = []; let pg, y; const T = (s, x, yy, f, size, color) => pg.drawText(pdfSafe(s), { x, y: yy, size, font: f, color: color || ink });
    const fit = (s, f, size, w) => { s = pdfSafe(s == null ? '' : String(s)); const out = []; let cur = ''; s.split(' ').forEach(word => { const t = cur ? cur + ' ' + word : word; if (f.widthOfTextAtSize(t, size) > w && cur) { out.push(cur); cur = word; } else cur = t; }); if (cur) out.push(cur); return out.map(l => { while (f.widthOfTextAtSize(l, size) > w && l.length > 3) l = l.slice(0, -2); return l; }); };
    const head = () => { let x = M; rows[0].forEach(h => { const ls = fit(h, B, 7.5, cw - 4); ls.slice(0, 2).forEach((l, i) => T(l, x + 2, y - i * 9, B, 7.5, mute)); x += cw; }); y -= 22; pg.drawLine({ start: { x: M, y: y + 8 }, end: { x: W - M, y: y + 8 }, thickness: 0.6, color: line }); };
    const newPage = (first) => { pg = pdf.addPage([W, H]); pages.push(pg); y = H - M; if (first) { T(orgOf(S.ui.org).name, M, y - 8, B, 10); T(LAST_REPORT.title, M, y - 26, B, 15); T(`${scopeLabel()} · generated ${fmt(TODAY)}`, M, y - 40, R, 8.5, mute); y -= 60; } head(); };
    newPage(true);
    rows.slice(1).forEach(r => { const cells = r.map(c => fit(c, R, 7.5, cw - 4)), hgt = Math.max(1, ...cells.map(c => c.length)) * 9 + 5; if (y - hgt < M + 20) newPage(false); let x = M; cells.forEach(c => { c.forEach((l, i) => T(l, x + 2, y - i * 9, R, 7.5)); x += cw; }); y -= hgt; pg.drawLine({ start: { x: M, y: y + 6 }, end: { x: W - M, y: y + 6 }, thickness: 0.3, color: line }); });
    pages.forEach((p2, i) => p2.drawText(pdfSafe(`${LAST_REPORT.title} · page ${i + 1} of ${pages.length} · from the records in the system; it does not guarantee legal compliance · Powered by VDW`), { x: M, y: 16, size: 6.8, font: R, color: mute }));
    if (await saveFile(`VDW_${LAST_REPORT.key}_${TODAY}.pdf`, new Blob([await pdf.save()], { type: 'application/pdf' }))) toast('PDF downloaded.');
  } catch (e) { console.error(e); toast('The PDF could not be made: ' + esc(e.message), 'error'); } };
const _reportsBeforeQA = ROUTES.reports;
ROUTES.reports = (p, q) => { const r = _reportsBeforeQA(p, q); if (r && r.html) r.html = r.html.replace('<button class="btn sm" data-act="repCsv">', `<button class="btn sm" data-act="repPdf">${icon('download', 'sm')} PDF</button><button class="btn sm" data-act="repCsv">`); return r; };

/* ---------------- 7. Departments per branch ---------------- */
// S.config.deptSites[dept] = ['ALL'] or a list of branch ids; forms only offer the departments of the chosen branch
const deptSites = d => ((S.config.deptSites || {})[d]) || ['ALL'];
const deptsFor = sid => S.departments.filter(d => !sid || sid === 'ALL' || deptSites(d).includes('ALL') || deptSites(d).includes(sid));
document.addEventListener('change', e => { const t = e.target; if (!t || t.name !== 'site' || !t.closest('.modal')) return; const m = t.closest('.modal'), d = m.querySelector('select[name=dept]'); if (!d) return;
  const keep = d.value, list = deptsFor(t.value), blank = d.querySelector('option[value=""]'); d.innerHTML = (blank ? blank.outerHTML : '') + list.map(x => `<option ${x === keep ? 'selected' : ''}>${esc(x)}</option>`).join(''); });
ACT.deptSites = () => openModal({ title: 'Departments per branch', sub: 'Tick the branches where each department exists. Forms then only offer the departments of the chosen branch.', size: 'wide', body: `<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Department</th><th>All branches</th>${orgSites().map(s => `<th>${esc(s.short || s.name)}</th>`).join('')}</tr></thead><tbody>${S.departments.map((d, i) => `<tr><td><b>${esc(d)}</b></td><td><input type="checkbox" name="ds_${i}_ALL" ${deptSites(d).includes('ALL') ? 'checked' : ''} aria-label="${esc(d)} in all branches"></td>${orgSites().map(s => `<td><input type="checkbox" name="ds_${i}_${s.id}" ${deptSites(d).includes(s.id) ? 'checked' : ''} aria-label="${esc(d)} at ${esc(s.name)}"></td>`).join('')}</tr>`).join('')}</tbody></table></div>`,
  buttons: [{ label: 'Save', cls: 'primary', onClick: m => { S.config.deptSites = {}; S.departments.forEach((d, i) => { const all = m.querySelector(`[name=ds_${i}_ALL]`).checked, list = orgSites().filter(s => m.querySelector(`[name=ds_${i}_${s.id}]`).checked).map(s => s.id); S.config.deptSites[d] = all || !list.length ? ['ALL'] : list; }); log('Updated departments per branch', '#/admin/orgs'); save(); toast('Saved.'); rerender(); } }] });
const _adminBeforeDept = ROUTES.admin;
ROUTES.admin = (p, q) => { const r = _adminBeforeDept(p, q); if (r && r.html && (p[0] || 'orgs') === 'orgs' && can('admin')) r.html = r.html.replace('data-act="addDept"', 'data-act="addDept"').replace(/(<button[^>]*data-act="addDept"[^>]*>[\s\S]*?<\/button>)/, `$1<button class="btn sm" data-act="deptSites">${icon('building', 'sm')} Departments per branch</button>`); return r; };
