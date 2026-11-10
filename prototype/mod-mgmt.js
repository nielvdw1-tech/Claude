/* ==========================================================================
   Reporting for management
   --------------------------------------------------------------------------
   1. Monthly management report: one page per month for the MD or client:
      control score and change, key figures, LTIFR, the 12-month incident
      trend, what needs attention, overdue corrective actions and the
      branches side by side. Shown on screen, downloaded as a PDF, and
      e-mailed to management (automatically after each month ends).
   2. Weekly summary: every manager gets an e-mail on Monday with what is
      overdue and what needs their action (their own tasks and their
      branch's figures). People can switch it off in Notification settings.
   3. Hours worked reminder: on the 1st, the administrators and HSEQ
      Managers are e-mailed when last month's hours are missing (the LTI
      frequency rate cannot be calculated without them).
   E-mails are written to the outbox in the prototype; they are not sent.
   ========================================================================== */
'use strict';

MAIL_CATS.summary = 'Monthly management report and weekly summary';

/* ---------------- Figures for one month ---------------- */
function mgmtData(sid, ym) {
  const org = S.ui.org, inS = x => inSite(x, sid), inM = d => (d || '').startsWith(ym), monthEnd = addDays(addMonthYm(ym, 1) + '-01', -1);
  const hist = (S.scoreHistory && S.scoreHistory[org]) || {};
  const live = compliance(sid), snap = hist[ym] && hist[ym][sid], prevSnap = hist[prevMonth(ym)] && hist[prevMonth(ym)][sid];
  const score = snap ? snap.overall : live.overall, parts = snap ? snap.parts : live.parts;
  const incs = S.incidents.filter(inS), incM = incs.filter(i => inM(i.date));
  const lti = incs.filter(i => injClass(i) === 'Lost Time Injury').sort((a, b) => b.date.localeCompare(a.date));
  const lastLti = lti.find(i => i.date <= monthEnd);
  const f = ltifr(sid, ym), fPrev = ltifr(sid, prevMonth(ym));
  const acts = S.actions.filter(inS), overdue = acts.filter(actionOverdue).sort((a, b) => a.due.localeCompare(b.due));
  const ins = S.inspections.filter(inS), insM = ins.filter(i => inM(i.date));
  const sch = S.schedules.filter(inS), schOver = sch.filter(s => daysTo(s.nextDue) < 0);
  const assets = S.assets.filter(inS), oos = assets.filter(a => a.status === 'Out of Service');
  const docs = S.documents.filter(inS), docOver = docs.filter(docReviewOverdue), inAppr = docs.filter(d => docStatus(d) === 'In Approval');
  const ackOut = docs.map(d => typeof ackState === 'function' && ackState(d)).filter(Boolean).reduce((n, a) => n + a.overdue.length, 0);
  const months = monthsBack(12, ym), perMonth = months.map(m => incs.filter(i => i.date.startsWith(m)).length);
  // What needs attention, most serious first
  const att = [];
  oos.forEach(a => att.push({ sev: 3, text: `${a.tag} ${a.name} is out of service`, link: '#/assets/' + a.id }));
  incs.forEach(i => { if (typeof reportingState !== 'function') return; const st = reportingState(i); if (st.label === 'Report overdue' || (st.label === 'Decision needed' && ['Lost Time Injury', 'Fatality'].includes(injClass(i)))) att.push({ sev: 3, text: `${i.id}: external reporting — ${st.label.toLowerCase()}`, link: '#/incidents/' + i.id }); });
  overdue.filter(a => ['Critical', 'High'].includes(a.priority)).forEach(a => att.push({ sev: 3, text: `${a.id} (${a.priority}) overdue since ${fmt(a.due)}: ${a.title}`, link: '#/actions/' + a.id }));
  incs.filter(i => i.status === 'Reported').forEach(i => att.push({ sev: 2, text: `${i.id} has no investigator yet`, link: '#/incidents/' + i.id }));
  incs.filter(i => i.injury && !injClass(i) && i.status !== 'Closed').forEach(i => att.push({ sev: 2, text: `${i.id}: injury not yet classified`, link: '#/incidents/' + i.id }));
  if (schOver.length) att.push({ sev: 2, text: `${schOver.length} inspection(s) overdue`, link: '#/inspections/schedule?due=overdue' });
  if (docOver.length) att.push({ sev: 1, text: `${docOver.length} document review(s) overdue`, link: '#/reports/docreviews' });
  if (ackOut) att.push({ sev: 1, text: `${ackOut} overdue document read-and-acknowledge confirmation(s)`, link: '#/documents' });
  if (f.value == null) att.push({ sev: 1, text: `Hours worked missing for ${f.missing} branch-month(s): the LTI frequency rate cannot be calculated`, link: '#/admin/hours' });
  att.sort((a, b) => b.sev - a.sev);
  const branches = sid === 'ALL' ? orgSites().map(s => { const c = (hist[ym] && hist[ym][s.id]) || compliance(s.id); return { s, score: c.overall, inc: incM.filter(i => i.site === s.id).length, lti: incM.filter(i => i.site === s.id && injClass(i) === 'Lost Time Injury').length, actOver: overdue.filter(a => a.site === s.id).length, insOver: schOver.filter(x => x.site === s.id).length }; }) : [];
  return {
    org: orgOf(org), sid, scope: sid === 'ALL' ? 'All branches' : site(sid).name, ym, label: new Date(ym + '-01T00:00:00').toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' }),
    score, parts, prevScore: prevSnap ? prevSnap.overall : null, fromHistory: !!snap,
    inc: { n: incM.length, byType: INC_TYPES.map(t => [t, incM.filter(i => i.type === t).length]).filter(x => x[1]), lti: incM.filter(i => injClass(i) === 'Lost Time Injury').length, hipo: incM.filter(i => i.potentialSev >= 4).length, open: incs.filter(i => i.status !== 'Closed').length, daysSinceLti: lastLti ? Math.round((new Date(monthEnd) - new Date(lastLti.date)) / 864e5) : null, months, perMonth, list: incM },
    ltifr: f, ltifrPrev: fPrev,
    act: { raised: acts.filter(a => inM(a.created)).length, done: acts.filter(a => inM(actionDoneDate(a))).length, open: acts.filter(actionOpen).length, overdue: overdue.length, top: overdue.slice(0, 8) },
    insp: { done: insM.length, failed: insM.reduce((n, i) => n + i.results.filter(r => r.result === 'Fail').length, 0), overdue: schOver.length, oos: oos.length },
    docs: { reviewOver: docOver.length, inAppr: inAppr.length, ackOut },
    attention: att.slice(0, 10), branches
  };
}
const fmtRate = f => f.value == null ? 'n/a' : f.value.toFixed(2);
function lastCompleteMonth() { return prevMonth(TODAY.slice(0, 7)); }

/* ---------------- On screen (Reports → Monthly management report) ---------------- */
let MGMT_M = null;
function monthlyReportBuild() {
  const ym = MGMT_M || lastCompleteMonth(), D = mgmtData(S.ui.site, ym), b = band(D.score);
  const change = D.prevScore == null ? '' : D.score === D.prevScore ? 'same as the month before' : `${D.score > D.prevScore ? '▲' : '▼'} ${Math.abs(D.score - D.prevScore)} point(s) on the month before`;
  const monthsOpts = monthsBack(12, TODAY.slice(0, 7)).reverse().map(m => `<option value="${m}" ${m === ym ? 'selected' : ''}>${new Date(m + '-01T00:00:00').toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}${m === TODAY.slice(0, 7) ? ' (so far)' : ''}</option>`).join('');
  const fig = (l, v, s, tone) => `<div class="mr-fig${tone ? ' t-' + tone : ''}"><span>${esc(l)}</span><b>${v}</b>${s ? `<small>${s}</small>` : ''}</div>`;
  const last = (S.autoSent && S.autoSent.monthly && S.autoSent.monthly[S.ui.org]);
  const pre = `<div class="mr-bar no-print"><label>Month <select id="mrMonth">${monthsOpts}</select></label>
      <button class="btn primary" data-act="mrPdf">${icon('download', 'sm')} Download PDF</button>
      ${can('report.view') ? `<button class="btn" data-act="mrEmail">${icon('bell', 'sm')} E-mail to management</button>` : ''}
      <span class="muted">${last ? `Sent automatically for ${new Date(last + '-01T00:00:00').toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })} to ${mgmtRecipients().map(pname).join(', ')}.` : ''}</span></div>`;
  const html = `<div class="mr">
    <div class="mr-score"><div class="mr-big st-${b.cls}"><b>${D.score}%</b><span>${b.label}</span></div><div><h3>Control score — ${esc(D.label)}</h3><p class="muted">${esc(D.org.short)} · ${esc(D.scope)}${change ? ' · ' + change : ''}${D.fromHistory ? '' : ' · live figure'}</p>
      <div class="mr-parts">${Object.keys(D.parts).map(k => `<div><span>${esc(PART_TITLE[k])}</span><div class="mr-track"><i style="width:${D.parts[k]}%;background:var(--st-${band(D.parts[k]).cls})"></i></div><b>${D.parts[k]}%</b></div>`).join('')}</div></div></div>
    <div class="mr-figs">
      ${fig('Incidents in the month', D.inc.n, D.inc.byType.map(x => `${x[1]} ${x[0]}`).join(', ') || 'None')}
      ${fig('Lost time injuries', D.inc.lti, D.inc.daysSinceLti == null ? 'No LTI recorded' : `${D.inc.daysSinceLti} days since the last LTI`, D.inc.lti ? 'red' : '')}
      ${fig('LTIFR (rolling 12 months)', fmtRate(D.ltifr), D.ltifr.value == null ? 'hours worked missing' : `was ${fmtRate(D.ltifrPrev)} the month before · per ${fmtNum(ltifrBase())} h`)}
      ${fig('High-potential incidents', D.inc.hipo, 'Could have been major or worse', D.inc.hipo ? 'amber' : '')}
      ${fig('Corrective actions', `${D.act.raised} raised · ${D.act.done} completed`, `${D.act.open} open, ${D.act.overdue} overdue`, D.act.overdue ? 'red' : '')}
      ${fig('Inspections', `${D.insp.done} done`, `${D.insp.failed} failed item(s) · ${D.insp.overdue} overdue now`, D.insp.overdue ? 'amber' : '')}
      ${fig('Assets out of service', D.insp.oos, 'Until the fix is verified', D.insp.oos ? 'red' : '')}
      ${fig('Documents', `${D.docs.reviewOver} review(s) overdue`, `${D.docs.inAppr} in approval · ${D.docs.ackOut} read confirmation(s) overdue`, D.docs.reviewOver ? 'amber' : '')}
    </div>
    <div class="grid g2 mt">
      <div><h4>Incidents per month — last 12 months</h4>${columnChart(D.inc.months, D.inc.perMonth, { unit: 'incidents', aria: `Incidents per month: ${D.inc.months.map((m, k) => `${monthLabel(m, true)} ${D.inc.perMonth[k]}`).join(', ')}` })}</div>
      <div><h4>Needs attention</h4>${D.attention.length ? `<ul class="mr-att">${D.attention.map(a => `<li class="s${a.sev}"><a href="${a.link}">${esc(a.text)}</a></li>`).join('')}</ul>` : '<p class="muted">Nothing outstanding.</p>'}</div>
    </div>
    <h4 class="mt">Overdue corrective actions${D.act.overdue > D.act.top.length ? ` (oldest ${D.act.top.length} of ${D.act.overdue})` : ''}</h4>
    ${D.act.top.length ? `<div class="table-wrap"><table class="tbl compact stackable"><thead><tr><th>Action</th><th>Priority</th><th>Owner</th><th>Due</th><th>Branch</th></tr></thead><tbody>${D.act.top.map(a => `<tr><td data-label="Action"><a href="#/actions/${a.id}" class="mono">${a.id}</a> ${esc(a.title)}</td><td data-label="Priority">${esc(a.priority)}</td><td data-label="Owner">${esc(pname(a.owner))}</td><td data-label="Due">${dueText(a.due)}</td><td data-label="Branch">${esc(sname(a.site))}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No overdue corrective actions.</p>'}
    ${D.branches.length ? `<h4 class="mt">By branch</h4><div class="table-wrap"><table class="tbl compact stackable"><thead><tr><th>Branch</th><th>Score</th><th>Incidents</th><th>LTIs</th><th>Actions overdue</th><th>Inspections overdue</th></tr></thead><tbody>${D.branches.map(x => `<tr><td data-label="Branch">${esc(x.s.name)}</td><td data-label="Score"><b class="due ${scoreColour(x.score)}">${x.score}%</b></td><td data-label="Incidents">${x.inc}</td><td data-label="LTIs">${x.lti}</td><td data-label="Actions overdue">${x.actOver}</td><td data-label="Inspections overdue">${x.insOver}</td></tr>`).join('')}</tbody></table></div>` : ''}
    <p class="muted mt" style="font-size:12px">The control score is an indication from the records in the system, weighted as set in Administration → Control scoring. It does not guarantee legal compliance.</p>
  </div>`;
  const csv = [['Item', 'Value'], ['Month', D.label], ['Scope', D.scope], ['Control score', D.score + '%'], ...Object.keys(D.parts).map(k => [PART_TITLE[k], D.parts[k] + '%']), ['Incidents', D.inc.n], ['LTIs', D.inc.lti], ['LTIFR', fmtRate(D.ltifr)], ['High-potential incidents', D.inc.hipo], ['Actions raised', D.act.raised], ['Actions completed', D.act.done], ['Actions open', D.act.open], ['Actions overdue', D.act.overdue], ['Inspections done', D.insp.done], ['Failed items', D.insp.failed], ['Inspections overdue', D.insp.overdue], ['Assets out of service', D.insp.oos], ['Document reviews overdue', D.docs.reviewOver]];
  return { desc: 'One page for the MD or client: score, key figures, trends and what needs attention. Download it as a PDF or e-mail it to management.', pre, html, csv };
}
const _buildReportBeforeMgmt = buildReport;
buildReport = function (key) {
  if (key === 'monthly') return monthlyReportBuild();
  if (key === 'weekly') return weeklyReportBuild();
  return _buildReportBeforeMgmt(key);
};
REPORTS.unshift(['monthly', 'Monthly management report'], ['weekly', 'Weekly summaries (e-mail)']);
document.addEventListener('change', e => { if (e.target.id === 'mrMonth') { MGMT_M = e.target.value; rerender(); } });

/* ---------------- PDF ---------------- */
const pdfSafe = s => String(s == null ? '' : s).replace(/[▲]/g, '+').replace(/[▼]/g, '-').replace(/[→]/g, '->').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[^\x20-\x7E -ÿ–—•]/g, '');
async function monthlyPdf(D) {
  const { PDFDocument, StandardFonts, rgb } = await ensurePdfLib();
  const pdf = await PDFDocument.create(), R = await pdf.embedFont(StandardFonts.Helvetica), B = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 595, H = 842, M = 40, ink = rgb(0.06, 0.1, 0.2), mute = rgb(0.4, 0.45, 0.55), line = rgb(0.86, 0.89, 0.93);
  const tone = { good: rgb(0.05, 0.6, 0.05), warn: rgb(0.85, 0.6, 0.05), bad: rgb(0.78, 0.2, 0.2) };
  const pages = []; let pg, y;
  const newPage = () => { pg = pdf.addPage([W, H]); pages.push(pg); y = H - M; };
  const need = h => { if (y - h < M + 30) newPage(); };
  const text = (s, x, yy, o = {}) => pg.drawText(pdfSafe(s), { x, y: yy, size: o.size || 9.5, font: o.bold ? B : R, color: o.color || ink });
  const wrap = (s, size, width, font = R) => { const words = pdfSafe(s).split(' '), out = []; let cur = ''; words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (font.widthOfTextAtSize(t, size) > width && cur) { out.push(cur); cur = w; } else cur = t; }); if (cur) out.push(cur); return out; };
  const heading = s => { need(30); y -= 8; text(s.toUpperCase(), M, y, { size: 9, bold: true, color: mute }); y -= 6; pg.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: line }); y -= 14; };
  newPage();
  // Header: company logo, title, period
  let lx = M;
  try { const lg = D.org.logo; if (lg && /^data:image\/(png|jpe?g)/.test(lg)) { const bytes = Uint8Array.from(atob(lg.split(',')[1]), c => c.charCodeAt(0)); const im = /png/.test(lg) ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes); const s = Math.min(40 / im.height, 110 / im.width); pg.drawImage(im, { x: M, y: y - 40, width: im.width * s, height: im.height * s }); lx = M + im.width * s + 12; } } catch (e) { /* logo is optional */ }
  text(D.org.name, lx, y - 12, { size: 10, bold: true });
  text('Monthly HSEQ management report', lx, y - 30, { size: 17, bold: true });
  text(`${D.label} · ${D.scope}`, lx, y - 45, { size: 10, color: mute });
  text(`Generated ${fmt(TODAY)} by ${pname(S.ui.user)}`, W - M - R.widthOfTextAtSize(pdfSafe(`Generated ${fmt(TODAY)} by ${pname(S.ui.user)}`), 8.5), y - 12, { size: 8.5, color: mute });
  y -= 62;
  // Score
  heading('Control score');
  const bc = band(D.score).cls, col = tone[bc === 'good' ? 'good' : bc === 'warn' ? 'warn' : 'bad'];
  pg.drawRectangle({ x: M, y: y - 52, width: 110, height: 58, color: rgb(0.97, 0.98, 0.99), borderColor: col, borderWidth: 1.5 });
  text(D.score + '%', M + 14, y - 28, { size: 26, bold: true, color: col });
  text(band(D.score).label, M + 14, y - 45, { size: 9, bold: true, color: col });
  const ch = D.prevScore == null ? '' : D.score === D.prevScore ? 'Same as the month before' : `${D.score > D.prevScore ? '+' : '-'}${Math.abs(D.score - D.prevScore)} point(s) on the month before`;
  text(ch, M + 125, y - 4, { size: 9, color: mute });
  Object.keys(D.parts).forEach((k, n) => { const yy = y - 20 - n * 12, v = D.parts[k], c = band(v).cls; text(PART_TITLE[k], M + 125, yy, { size: 8.5 }); pg.drawRectangle({ x: M + 250, y: yy - 1, width: 200, height: 6, color: line }); pg.drawRectangle({ x: M + 250, y: yy - 1, width: 2 * v, height: 6, color: tone[c === 'good' ? 'good' : c === 'warn' ? 'warn' : 'bad'] }); text(v + '%', M + 458, yy, { size: 8.5, bold: true }); });
  y -= 78;
  // Key figures: two columns
  heading('Key figures for the month');
  const figs = [
    ['Incidents', String(D.inc.n), D.inc.byType.map(x => `${x[1]} ${x[0]}`).join(', ') || 'None'],
    ['Lost time injuries', String(D.inc.lti), D.inc.daysSinceLti == null ? 'No LTI recorded' : `${D.inc.daysSinceLti} days since the last LTI`],
    ['LTIFR (rolling 12 months)', fmtRate(D.ltifr), D.ltifr.value == null ? 'Hours worked missing' : `Was ${fmtRate(D.ltifrPrev)} · per ${fmtNum(ltifrBase())} hours`],
    ['High-potential incidents', String(D.inc.hipo), 'Could have been major or worse'],
    ['Corrective actions', `${D.act.raised} raised, ${D.act.done} completed`, `${D.act.open} open, ${D.act.overdue} overdue`],
    ['Inspections', `${D.insp.done} done`, `${D.insp.failed} failed item(s), ${D.insp.overdue} overdue now`],
    ['Assets out of service', String(D.insp.oos), 'Until the fix is verified'],
    ['Documents', `${D.docs.reviewOver} review(s) overdue`, `${D.docs.inAppr} in approval, ${D.docs.ackOut} read confirmation(s) overdue`]
  ];
  const cw = (W - 2 * M - 12) / 2;
  figs.forEach((f, n) => { const cx = M + (n % 2) * (cw + 12), cy = y - Math.floor(n / 2) * 46; pg.drawRectangle({ x: cx, y: cy - 38, width: cw, height: 42, borderColor: line, borderWidth: 0.8 }); text(f[0], cx + 8, cy - 8, { size: 8, color: mute }); text(f[1], cx + 8, cy - 21, { size: 11, bold: true }); text(wrap(f[2], 7.5, cw - 16)[0] || '', cx + 8, cy - 32, { size: 7.5, color: mute }); });
  y -= Math.ceil(figs.length / 2) * 46 + 6;
  // Incidents per month chart
  heading('Incidents per month — last 12 months');
  { const h = 70, bw = (W - 2 * M - 30) / 12, max = Math.max(4, ...D.inc.perMonth);
    pg.drawLine({ start: { x: M + 20, y: y - h }, end: { x: W - M, y: y - h }, thickness: 0.6, color: mute });
    [0, max / 2, max].forEach(t => { const yy = y - h + (t / max) * h; text(String(Math.round(t)), M, yy - 3, { size: 7, color: mute }); if (t) pg.drawLine({ start: { x: M + 20, y: yy }, end: { x: W - M, y: yy }, thickness: 0.3, color: line }); });
    D.inc.perMonth.forEach((v, k) => { const x = M + 24 + k * bw; if (v) { pg.drawRectangle({ x, y: y - h, width: bw - 8, height: (v / max) * h, color: rgb(0.16, 0.47, 0.84) }); text(String(v), x + (bw - 8) / 2 - 2, y - h + (v / max) * h + 2, { size: 7, bold: true }); } text(monthLabel(D.inc.months[k], k === 0 || D.inc.months[k].endsWith('-01')), x - 2, y - h - 10, { size: 6.5, color: mute }); });
    y -= h + 22; }
  // Needs attention
  heading('Needs attention');
  if (!D.attention.length) { text('Nothing outstanding.', M, y, { color: mute }); y -= 14; }
  D.attention.forEach(a => { const ls = wrap(a.text, 9, W - 2 * M - 16); need(ls.length * 12 + 2); pg.drawCircle({ x: M + 4, y: y + 3, size: 2.6, color: a.sev === 3 ? tone.bad : a.sev === 2 ? tone.warn : mute }); ls.forEach(l => { text(l, M + 14, y); y -= 12; }); });
  // Overdue actions
  heading(`Overdue corrective actions${D.act.overdue > D.act.top.length ? ` (oldest ${D.act.top.length} of ${D.act.overdue})` : ''}`);
  if (!D.act.top.length) { text('No overdue corrective actions.', M, y, { color: mute }); y -= 14; }
  else { const cols = [[M, 'Action'], [M + 300, 'Priority'], [M + 355, 'Owner'], [M + 450, 'Due']]; cols.forEach(c => text(c[1], c[0], y, { size: 8, bold: true, color: mute })); y -= 14;
    D.act.top.forEach(a => { const ls = wrap(`${a.id} ${a.title}`, 8.5, 290); need(ls.length * 11 + 4); ls.forEach((l, n) => text(l, M, y - n * 11, { size: 8.5 })); text(a.priority, M + 300, y, { size: 8.5 }); text(pname(a.owner), M + 355, y, { size: 8.5 }); text(fmt(a.due), M + 450, y, { size: 8.5, color: tone.bad }); y -= (ls.length - 1) * 11; pg.drawLine({ start: { x: M, y: y - 4 }, end: { x: W - M, y: y - 4 }, thickness: 0.3, color: line }); y -= 15; }); }
  // Branches
  if (D.branches.length) { heading('By branch'); const cols = [[M, 'Branch'], [M + 200, 'Score'], [M + 255, 'Incidents'], [M + 315, 'LTIs'], [M + 360, 'Actions overdue'], [M + 440, 'Inspections overdue']];
    cols.forEach(c => text(c[1], c[0], y, { size: 8, bold: true, color: mute })); y -= 12;
    D.branches.forEach(x => { need(14); const c = band(x.score).cls; text(x.s.name, M, y, { size: 8.5 }); text(x.score + '%', M + 200, y, { size: 8.5, bold: true, color: tone[c === 'good' ? 'good' : c === 'warn' ? 'warn' : 'bad'] }); [x.inc, x.lti, x.actOver, x.insOver].forEach((v, n) => text(String(v), [M + 255, M + 315, M + 360, M + 440][n], y, { size: 8.5 })); y -= 13; }); }
  // Footer on every page
  pages.forEach((p, n) => { p.drawLine({ start: { x: M, y: 34 }, end: { x: W - M, y: 34 }, thickness: 0.4, color: line });
    p.drawText(pdfSafe(`${D.org.short} · ${D.label} · Prototype — demonstration data. The control score is an indication from the records in the system; it does not guarantee legal compliance.`), { x: M, y: 22, size: 6.8, font: R, color: mute });
    p.drawText(`Page ${n + 1} of ${pages.length} · Powered by VDW`, { x: W - M - 95, y: 12, size: 6.8, font: R, color: mute }); });
  return new Blob([await pdf.save()], { type: 'application/pdf' });
}
ACT.mrPdf = async () => {
  const ym = MGMT_M || lastCompleteMonth(), D = mgmtData(S.ui.site, ym);
  toast('Preparing the PDF…', 'info');
  try { const blob = await monthlyPdf(D); MR_LAST_PDF = blob; const ok = await saveFile(`HSEQ_report_${D.org.short.replace(/\W+/g, '_')}_${ym}${S.ui.site === 'ALL' ? '' : '_' + S.ui.site}.pdf`, blob); if (ok) { toast('Monthly report downloaded.'); log(`Downloaded the monthly management report for ${D.label} (${D.scope})`, '#/reports/monthly'); save(); } }
  catch (e) { console.error(e); toast('The PDF could not be made: ' + esc(e.message), 'error'); }
};
let MR_LAST_PDF = null;

/* ---------------- E-mail to management ---------------- */
function mgmtRecipients(org = S.ui.org) { return S.people.filter(p => p.status !== 'Deactivated' && ['Managing Director', 'HSEQ Manager', 'Safety Consultant'].includes(p.sysRole) && (p.org === org || (p.clients || []).includes(org))).map(p => p.id); }
function mgmtEmailText(D) {
  return [`The HSEQ management report for ${D.label} (${D.org.short}, ${D.scope}) is ready.`, '',
    `Control score: ${D.score}%${D.prevScore == null ? '' : ` (${D.score >= D.prevScore ? '+' : ''}${D.score - D.prevScore} on the month before)`}`,
    `Incidents: ${D.inc.n} · Lost time injuries: ${D.inc.lti} · LTIFR: ${fmtRate(D.ltifr)}`,
    `Corrective actions: ${D.act.raised} raised, ${D.act.done} completed, ${D.act.overdue} overdue`,
    `Inspections: ${D.insp.done} done, ${D.insp.overdue} overdue · Assets out of service: ${D.insp.oos}`, '',
    D.attention.length ? 'Needs attention:\n' + D.attention.slice(0, 5).map(a => '- ' + a.text).join('\n') : 'Nothing needs urgent attention.', '',
    'Open the report to download the PDF.'].join('\n');
}
function sendMonthly(ym, auto) {
  const D = mgmtData('ALL', ym), to = mgmtRecipients();
  queueEmail(to, 'summary', `HSEQ management report — ${D.label}`, mgmtEmailText(D), '#/reports/monthly');
  return to;
}
ACT.mrEmail = () => {
  const ym = MGMT_M || lastCompleteMonth(), D = mgmtData(S.ui.site, ym), to = mgmtRecipients();
  queueEmail(to.concat(S.ui.user), 'summary', `HSEQ management report — ${D.label}${S.ui.site === 'ALL' ? '' : ' — ' + D.scope}`, mgmtEmailText(D), '#/reports/monthly');
  log(`E-mailed the monthly management report for ${D.label} to management`, '#/reports/monthly'); save(); toast(`Written to the outbox for ${to.map(pname).join(', ')}.`);
};

/* ---------------- Weekly summary per manager ---------------- */
function weeklyRecipients(org = S.ui.org) { return S.people.filter(p => p.status !== 'Deactivated' && p.sysRole && (p.org === org || (p.clients || []).includes(org)) && (() => { const r = S.roles.find(x => x.name === p.sysRole); return r && !r.fieldOnly && roleHas(r, 'report.view'); })()).map(p => p.id); }
// Everything for one person, worked out as that person would see it
function weeklyFor(uid) {
  const keep = { user: S.ui.user, site: S.ui.site };
  try {
    S.ui.user = uid; const p = person(uid); S.ui.site = branchLimited() ? p.site : 'ALL';
    const tasks = myTasks(), sid = S.ui.site;
    const red = tasks.filter(t => t.sev === 'red'), other = tasks.filter(t => t.sev !== 'red');
    const fig = { actOver: S.actions.filter(a => inSite(a, sid) && actionOverdue(a)).length, insOver: S.schedules.filter(s => inSite(s, sid) && daysTo(s.nextDue) < 0).length, incOpen: S.incidents.filter(i => inSite(i, sid) && i.status !== 'Closed').length, oos: S.assets.filter(a => inSite(a, sid) && a.status === 'Out of Service').length, score: compliance(sid).overall };
    const week = S.incidents.filter(i => inSite(i, sid) && daysTo(i.date) >= -7).length;
    return { uid, scope: sid === 'ALL' ? orgOf(S.ui.org).short + ' — all branches' : site(sid).name, tasks, red, other, fig, week };
  } finally { S.ui.user = keep.user; S.ui.site = keep.site; }
}
function weeklyText(W) {
  const L = [`Your HSEQ summary for the week (${W.scope}).`, '',
    `Overdue or urgent for you (${W.red.length}):`, ...(W.red.length ? W.red.slice(0, 10).map(t => `- ${t.title} (${t.sub})`) : ['- Nothing overdue.']), '',
    `Also waiting for you (${W.other.length}):`, ...(W.other.length ? W.other.slice(0, 10).map(t => `- ${t.title}`) : ['- Nothing.']), W.other.length > 10 ? `- … and ${W.other.length - 10} more` : '', '',
    `${W.scope}: control score ${W.fig.score}% · ${W.fig.actOver} action(s) overdue · ${W.fig.insOver} inspection(s) overdue · ${W.fig.incOpen} open incident(s) · ${W.fig.oos} asset(s) out of service · ${W.week} incident(s) reported in the last 7 days.`];
  return L.filter((x, k) => x !== '' || L[k - 1] !== '').join('\n');
}
function sendWeekly(org = S.ui.org) {
  const ids = weeklyRecipients(org); let n = 0;
  ids.forEach(uid => { const W = weeklyFor(uid); queueEmail([uid], 'summary', `Your weekly HSEQ summary — ${W.red.length} overdue, ${W.other.length} waiting`, weeklyText(W), '#/notifications/tasks'); n++; });
  return ids;
}
function weeklyReportBuild() {
  const W = weeklyFor(S.ui.user), last = S.autoSent && S.autoSent.weekly && S.autoSent.weekly[S.ui.org];
  const ids = weeklyRecipients();
  const pre = `<div class="mr-bar no-print">${can('admin') || can('report.view') ? `<button class="btn" data-act="wkSend">${icon('bell', 'sm')} Send this week's summaries now</button>` : ''}<span class="muted">Sent automatically every Monday${last ? `; last sent for the week of ${fmt(last)}` : ''}. People can switch it off under Notification settings.</span></div>`;
  const html = `<p>Each of these ${ids.length} people gets their own summary: ${ids.map(pname).map(esc).join(', ')}.</p>
    <h4>Your summary this week (preview)</h4><pre class="wk-pre">${esc(weeklyText(W))}</pre>`;
  return { desc: 'Every Monday each manager gets an e-mail with what is overdue and what needs their action, and their branch\'s figures.', pre, html, csv: [['Person', 'Overdue', 'Waiting']].concat(ids.map(u => { const w = weeklyFor(u); return [pname(u), w.red.length, w.other.length]; })) };
}
ACT.wkSend = () => { const ids = sendWeekly(); S.autoSent = S.autoSent || {}; log(`Sent the weekly summaries to ${ids.length} people`, '#/reports/weekly'); save(); toast(`Weekly summaries written to the outbox for ${ids.length} people.`); };

/* ---------------- Sending on schedule (checked whenever the system is used) ---------------- */
function mondayOf(d) { const x = new Date(d + 'T00:00:00'); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return isoDate(x); }
function runSchedules() {
  if (!S || !S.ui || !S.ui.user || !S.ui.org) return;
  S.autoSent = S.autoSent || {}; ['monthly', 'weekly', 'hours'].forEach(k => { S.autoSent[k] = S.autoSent[k] || {}; });
  const org = S.ui.org, lm = lastCompleteMonth(), wk = mondayOf(TODAY); let changed = false;
  if (S.autoSent.monthly[org] !== lm) { sendMonthly(lm, true); S.autoSent.monthly[org] = lm; changed = true; }
  if ((S.autoSent.weekly[org] || '') < wk) { sendWeekly(org); S.autoSent.weekly[org] = wk; changed = true; }
  if (S.autoSent.hours[org] !== lm) {
    const miss = orgSites().filter(s => hoursOf(s.id, lm) == null);
    if (miss.length) { const to = S.people.filter(p => p.status !== 'Deactivated' && (p.org === org) && (p.sysRole === 'HSEQ Manager' || (S.roles.find(r => r.name === p.sysRole) || {}).allPerms)).map(p => p.id);
      queueEmail(to, 'summary', `Please enter the hours worked for ${monthLabel(lm, true)}`, `Hours worked for ${monthLabel(lm, true)} are missing for ${miss.map(s => s.name).join(', ')}. The LTI frequency rate cannot be calculated without them. Enter them under Administration → Hours worked.`, '#/admin/hours'); }
    S.autoSent.hours[org] = lm; changed = true;
  }
  if (changed) save();
}
const _rerenderBeforeMgmt = rerender;
rerender = function (keepScroll) { if (S && signedIn() && S.ui.user) { try { runSchedules(); } catch (e) { console.error(e); } } _rerenderBeforeMgmt(keepScroll); };
