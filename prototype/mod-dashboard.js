/* ==========================================================================
   Dashboard — compliance status first, then trends, then the detail tiles.
   --------------------------------------------------------------------------
   Built for a managing director: the control status of the organisation (and
   each branch) at the top, 12-month graphs below, and the operational tiles
   after that. Every number opens the records behind it. Charts are plain
   HTML/SVG with a hover/focus tooltip and a data table for each.
   ========================================================================== */
'use strict';

/* ---------------- Status bands (same thresholds as scoreColour) ---------------- */
const STATUS_BAND = {
  green: { label: 'On track', icon: 'checkCircle', cls: 'good' },
  amber: { label: 'Needs attention', icon: 'alert', cls: 'warn' },
  red: { label: 'At risk', icon: 'x', cls: 'bad' }
};
function band(v) { return STATUS_BAND[scoreColour(v)]; }
function statusChip(v) { const b = band(v); return `<span class="st-chip st-${b.cls}">${icon(b.icon, 'sm')}${b.label}</span>`; }
// Pie (ring) chart for one score out of 100: the filled share carries the status colour, the rest is a light track.
function scorePie(v, size, label) {
  const b = band(v), r = 42, c = 2 * Math.PI * r, f = Math.max(0, Math.min(100, v)) / 100;
  return `<div class="pie pie-${b.cls}" style="width:${size}px;height:${size}px" tabindex="0" role="img" aria-label="${esc(label)}: ${v}% — ${b.label}" ${tip([[label, ''], [v + '%', b.label], [(100 - v) + '%', 'still to close']])}>
    <svg viewBox="0 0 100 100"><circle class="pie-track" cx="50" cy="50" r="${r}"/>${f ? `<circle class="pie-fill" cx="50" cy="50" r="${r}" stroke-dasharray="${(f * c).toFixed(2)} ${c.toFixed(2)}" transform="rotate(-90 50 50)"/>` : ''}</svg>
    <span class="pie-v"><span>${v}<small>%</small></span></span></div>`;
}
function meter(v, label) { const b = band(v); return `<div class="meter m-${b.cls}" role="img" aria-label="${esc(label || 'Score')}: ${v}% — ${b.label}"><span style="width:${Math.max(0, Math.min(100, v))}%"></span></div>`; }

/* ---------------- Time buckets: the last 12 calendar months ---------------- */
function last12Months() {
  const out = [];
  for (let k = 11; k >= 0; k--) { const d = new Date(TODAY + 'T00:00:00'); d.setDate(1); d.setMonth(d.getMonth() - k); out.push(isoDate(d).slice(0, 7)); }
  return out;
}
function monthLabel(m, withYear) { return MONTHS[+m.slice(5) - 1] + (withYear ? ' ' + m.slice(2, 4) : ''); }
// opts.decimal: rates (e.g. LTIFR) get a tight axis; counts keep a minimum of 4 so single events don't fill the chart
function niceMaxDec(v) { if (!(v > 0)) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))), n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
function niceMax(v) { if (v <= 4) return 4; const p = Math.pow(10, Math.floor(Math.log10(v))), n = v / p; return (n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
// An action counts as completed on the day it was verified (or closed, for older records).
function actionDoneDate(a) {
  const h = (a.history || []).filter(x => x.action === 'Verified' || x.action === 'Closed').map(x => (x.ts || '').slice(0, 10)).filter(Boolean).sort()[0];
  return h || a.closed || null;
}

/* ---------------- What drives each part of the score ---------------- */
function partDrivers(sid) {
  const docs = S.documents.filter(d => inSite(d, sid) && docActive(d) && docIssued(d) && d.reviewMonths);
  const docOver = docs.filter(docReviewOverdue).length;
  const assets = S.assets.filter(a => inSite(a, sid) && a.status !== 'Decommissioned');
  const certBad = assets.filter(a => assetDocStatus(a).some(d => d.status === 'Expired' || d.status === 'Missing')).length;
  const insOver = S.schedules.filter(s => inSite(s, sid) && daysTo(s.nextDue) < 0).length;
  const oos = assets.filter(a => a.status === 'Out of Service').length;
  const lateReview = S.defects.filter(d => d.status === 'Awaiting Review' && daysTo(d.reviewDue) < 0 && assets.some(a => a.id === d.asset)).length;
  const open = S.actions.filter(a => inSite(a, sid) && actionOpen(a)), over = open.filter(actionOverdue).length;
  const incs = S.incidents.filter(i => inSite(i, sid) && (i.status !== 'Closed' || effOverdue(i)));
  const unassigned = incs.filter(i => i.status === 'Reported' && daysTo(i.date) < -rules().assignInvestigatorDays).length;
  const invLate = incs.filter(i => i.status === 'Under Investigation' && i.invDue && daysTo(i.invDue) < 0).length;
  const effLate = incs.filter(effOverdue).length;
  const list = (items) => items.filter(x => x[0]).map(x => `${x[0]} ${x[1]}`);
  return {
    documents: { line: `${docs.length - docOver} of ${docs.length} issued documents within their review date`, issues: list([[docOver, docOver === 1 ? 'review overdue' : 'reviews overdue']]) },
    assets: { line: `${assets.length} assets: certificates, inspections and service status`, issues: list([[certBad, certBad === 1 ? 'asset with an expired or missing certificate' : 'assets with expired or missing certificates'], [insOver, insOver === 1 ? 'inspection overdue' : 'inspections overdue'], [oos, 'out of service'], [lateReview, lateReview === 1 ? 'defect review late' : 'defect reviews late']]) },
    actions: { line: `${open.length - over} of ${open.length} open corrective actions within their due date`, issues: list([[over, 'overdue']]) },
    incidents: { line: `${incs.length - incs.filter(i => !incidentOnTrack(i)).length} of ${incs.length} open incidents on track`, issues: list([[unassigned, 'without an investigator'], [invLate, invLate === 1 ? 'investigation overdue' : 'investigations overdue'], [effLate, effLate === 1 ? 'effectiveness review overdue' : 'effectiveness reviews overdue']]) }
  };
}
const PART_TITLE = { documents: 'Documents', assets: 'Assets & inspections', actions: 'Corrective actions', incidents: 'Incidents' };
const PART_ICON = { documents: 'docs', assets: 'forklift', actions: 'target', incidents: 'alert' };

/* ---------------- Tooltip (one for the page; hover and keyboard focus) ---------------- */
function vizTipShow(el, x, y) {
  let t = document.getElementById('vizTip');
  if (!t) { t = document.createElement('div'); t.id = 'vizTip'; t.className = 'viz-tip'; t.setAttribute('role', 'tooltip'); document.body.appendChild(t); }
  t.textContent = '';
  const rows = JSON.parse(el.dataset.tip || '[]');   // [[value, label, swatchVar?], ...] — first row is the heading
  rows.forEach((r, k) => {
    const row = document.createElement('div'); row.className = k ? 'vt-row' : 'vt-head';
    if (r[2]) { const key = document.createElement('i'); key.className = 'vt-key'; key.style.background = `var(${r[2]})`; row.appendChild(key); }
    const v = document.createElement('b'); v.textContent = r[0]; row.appendChild(v);
    if (r[1]) { const l = document.createElement('span'); l.textContent = r[1]; row.appendChild(l); }
    t.appendChild(row);
  });
  t.style.display = 'block';
  const w = t.offsetWidth, h = t.offsetHeight;
  t.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, x - w / 2)) + 'px';
  t.style.top = Math.max(8, y - h - 12) + 'px';
}
function vizTipHide() { const t = document.getElementById('vizTip'); if (t) t.style.display = 'none'; }
document.addEventListener('pointerover', e => { const el = e.target.closest && e.target.closest('[data-tip]'); if (el) { const r = el.getBoundingClientRect(); vizTipShow(el, r.left + r.width / 2, r.top); } });
document.addEventListener('pointerout', e => { const el = e.target.closest && e.target.closest('[data-tip]'); if (el && !el.contains(e.relatedTarget)) vizTipHide(); });
document.addEventListener('focusin', e => { const el = e.target.closest && e.target.closest('[data-tip]'); if (el) { const r = el.getBoundingClientRect(); vizTipShow(el, r.left + r.width / 2, r.top); } else vizTipHide(); });
document.addEventListener('scroll', vizTipHide, true);
const tip = (rows) => `data-tip="${esc(JSON.stringify(rows))}"`;

/* ---------------- Chart pieces ---------------- */
// Column chart, one series (12 months). Values on the latest and the highest column only; the rest via axis, tooltip and table.
function columnChart(months, vals, opts) {
  const max = opts.decimal ? niceMaxDec(Math.max(...vals)) : niceMax(Math.max(1, ...vals)), hi = vals.indexOf(Math.max(...vals)), last = vals.length - 1;
  const ticks = [0, max / 2, max].map(t => opts.decimal ? +t.toFixed(2) : t);
  return `<div class="vc" role="img" aria-label="${esc(opts.aria)}">
    <div class="vc-plot">${ticks.map(t => `<div class="vc-grid" style="bottom:${(t / max) * 100}%"><span>${t}</span></div>`).join('')}
      <div class="vc-cols">${months.map((m, k) => `<div class="vc-col" tabindex="0" ${tip([[monthLabel(m, true), ''], [String(vals[k]), opts.unit], ...(opts.detail ? opts.detail(k) : [])])} aria-label="${esc(monthLabel(m, true))}: ${vals[k]} ${esc(opts.unit)}"${opts.href ? ` data-act="go" data-href="${opts.href}"` : ''}>
        ${opts.missing && opts.missing(k) ? '<span class="vc-na" title="No data">?</span>' : `<span class="vc-bar${k === last ? ' cur' : ''}" style="height:${(vals[k] / max) * 100}%">${(k === hi || k === last) && vals[k] ? `<em>${vals[k]}</em>` : ''}</span>`}</div>`).join('')}</div>
    </div>
    <div class="vc-x">${months.map((m, k) => `<span>${k % 2 === last % 2 ? monthLabel(m, m.endsWith('-01') || k === 0) : ''}</span>`).join('')}</div>
  </div>`;
}
// Ranked horizontal bars, one hue, value at the tip.
function rankBars(rows, opts) {
  const max = Math.max(1, ...rows.map(r => r[1]));
  return `<div class="hb">${rows.map(r => `<div class="hb-row${r[2] ? ' clickable' : ''}" tabindex="0" ${tip([[String(r[1]), `${r[0]} · ${opts.unit}`]])}${r[2] ? ` data-act="go" data-href="${r[2]}"` : ''}><span class="hb-label">${esc(r[0])}</span><span class="hb-track"><span class="hb-bar" style="width:${(r[1] / max) * 100}%"></span></span><span class="hb-val">${r[1]}</span></div>`).join('')}</div>`;
}
// Tall segmented bar: one whole split into parts (status colours, icon + label in the legend).
function segBar(parts, aria) {
  const tot = parts.reduce((a, p) => a + p.n, 0);
  if (!tot) return '<p class="muted">No open corrective actions.</p>';
  return `<div class="seg-bar" role="img" aria-label="${esc(aria)}">${parts.filter(p => p.n).map(p => `<span class="seg seg-${p.cls}" tabindex="0" style="flex:${p.n}" ${tip([[String(p.n), `${p.label} · ${Math.round((p.n / tot) * 100)}% of open actions`]])}${p.href ? ` data-act="go" data-href="${p.href}"` : ''}><em>${p.n}</em></span>`).join('')}</div>
    <div class="viz-legend">${parts.map(p => `<span><i class="lg-sw seg-${p.cls}"></i>${icon(p.icon, 'sm')}${esc(p.label)}</span>`).join('')}</div>`;
}
function dataTable(head, rows) {
  return `<details class="viz-table"><summary>Data table</summary><div class="table-wrap"><table class="tbl compact"><thead><tr>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${esc(String(c))}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>`;
}

/* ---------------- Line chart (two series, drawn after mount at the real width) ---------------- */
const LINE = { data: null };
function drawLineChart() {
  const box = document.getElementById('lcActions'); if (!box || !LINE.data) return;
  const { months, series } = LINE.data, W = Math.max(280, box.clientWidth), H = 220, L = 30, R = 96, T = 14, B = 26;
  const max = niceMax(Math.max(1, ...series.flatMap(s => s.vals))), n = months.length;
  const x = k => L + (k * (W - L - R)) / (n - 1), y = v => T + (1 - v / max) * (H - T - B);
  const path = s => s.vals.map((v, k) => `${k ? 'L' : 'M'}${x(k).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const ends = series.map(s => ({ s, yy: y(s.vals[n - 1]) }));
  if (Math.abs(ends[0].yy - ends[1].yy) < 14) { const mid = (ends[0].yy + ends[1].yy) / 2, up = ends[0].yy <= ends[1].yy ? 0 : 1; ends[up].ly = mid - 8; ends[1 - up].ly = mid + 8; }
  box.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" tabindex="0" role="img" aria-label="${esc(LINE.data.aria)}. Use the left and right arrow keys to read each month.">
    ${[0, max / 2, max].map(t => `<line class="lc-grid" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text class="lc-tick" x="${L - 6}" y="${y(t) + 4}" text-anchor="end">${t}</text>`).join('')}
    ${months.map((m, k) => k % 2 === (n - 1) % 2 ? `<text class="lc-tick" x="${x(k)}" y="${H - 8}" text-anchor="middle">${monthLabel(m, m.endsWith('-01') || k === 0)}</text>` : '').join('')}
    ${series.map(s => `<path class="lc-line" d="${path(s)}" style="stroke:var(${s.v})"/>`).join('')}
    <line class="lc-cross" id="lcCross" y1="${T}" y2="${H - B}" x1="-10" x2="-10"/>
    ${series.map((s, i) => `<circle class="lc-dot" id="lcDot${i}" r="4" cx="-10" cy="-10" style="fill:var(${s.v})"/>`).join('')}
    ${ends.map(e => `<circle class="lc-dot" r="4" cx="${x(n - 1)}" cy="${e.yy}" style="fill:var(${e.s.v})"/><text class="lc-end" x="${x(n - 1) + 8}" y="${(e.ly || e.yy) + 4}">${e.s.vals[n - 1]} ${esc(e.s.short)}</text>`).join('')}
    <rect class="lc-hit" x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}"/>
  </svg>`;
  const svg = box.querySelector('svg'), hit = svg.querySelector('.lc-hit');
  const show = (k) => {
    k = Math.max(0, Math.min(n - 1, k)); LINE.k = k;
    const cx = x(k); svg.querySelector('#lcCross').setAttribute('x1', cx); svg.querySelector('#lcCross').setAttribute('x2', cx);
    series.forEach((s, i) => { const d = svg.querySelector('#lcDot' + i); d.setAttribute('cx', cx); d.setAttribute('cy', y(s.vals[k])); });
    const r = svg.getBoundingClientRect(), el = { dataset: { tip: JSON.stringify([[monthLabel(months[k], true), ''], ...series.map(s => [String(s.vals[k]), s.name, s.v])]) } };
    vizTipShow(el, r.left + cx, r.top + T);
  };
  hit.addEventListener('pointermove', e => { const r = svg.getBoundingClientRect(); show(Math.round(((e.clientX - r.left - L) / (W - L - R)) * (n - 1))); });
  hit.addEventListener('pointerleave', () => { vizTipHide(); svg.querySelector('#lcCross').setAttribute('x1', -10); svg.querySelector('#lcCross').setAttribute('x2', -10); series.forEach((s, i) => svg.querySelector('#lcDot' + i).setAttribute('cx', -10)); });
  svg.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); show((LINE.k == null ? n - 1 : LINE.k) + (e.key === 'ArrowRight' ? 1 : -1)); } });
  svg.addEventListener('focus', () => show(LINE.k == null ? n - 1 : LINE.k));
  svg.addEventListener('blur', vizTipHide);
}
let LINE_RESIZE = null;
window.addEventListener('resize', () => { clearTimeout(LINE_RESIZE); LINE_RESIZE = setTimeout(drawLineChart, 120); });

/* ---------------- Quick links for the signed-in user ----------------
   Built from the user's role (permissions) and what is waiting for them right now.
   Links with something waiting show a count and come first. */
function quickLinks() {
  const uid = S.ui.user, sid = S.ui.site, mine = (x) => inSite(x, sid);
  const n = {
    approve: S.documents.filter(d => mine(d) && (curStep(docLatest(d)) || {}).person === uid).length,
    myActs: S.actions.filter(a => mine(a) && actionOpen(a) && a.owner === uid).length,
    verify: can('action.verify') ? S.actions.filter(a => mine(a) && a.status === 'Submitted for Verification' && actionVerifiers(a).includes(uid)).length : 0,
    defects: S.defects.filter(d => { const a = byId('assets', d.asset); return d.status === 'Awaiting Review' && a && mine(a) && defectReviewers(a).includes(uid); }).length,
    insp: S.schedules.filter(x => mine(x) && x.assignee === uid && daysTo(x.nextDue) <= 7).length,
    invest: S.incidents.filter(i => mine(i) && i.investigator === uid && i.status !== 'Closed').length,
    assign: can('incident.investigate') ? S.incidents.filter(i => mine(i) && i.status === 'Reported').length : 0,
    alerts: (S.notices || []).filter(x => x.status === 'Pending approval' && x.org === S.ui.org && (noticeCurStep(x) || {}).person === uid).length,
    notices: myUnreadNotices().length
  };
  const L = [
    { label: 'My tasks', icon: 'tasks', href: '#/notifications/tasks', count: myTasks().length },
    { label: 'Documents to approve', icon: 'docs', href: '#/documents?status=mine', count: n.approve, show: can('doc.approve') },
    { label: 'My corrective actions', icon: 'target', href: '#/actions?owner=me', count: n.myActs, show: n.myActs > 0 || can('action.create') },
    { label: 'Actions to verify', icon: 'checkCircle', href: '#/actions?status=Submitted for Verification', count: n.verify, show: can('action.verify') },
    { label: 'Defects to review', icon: 'search', href: '#/maintenance/defects', count: n.defects, show: n.defects > 0 },
    { label: 'My inspections due', icon: 'clipboard', href: '#/inspections/schedule', count: n.insp, show: S.schedules.some(x => mine(x) && x.assignee === uid) },   // only for people who carry out scheduled inspections
    { label: 'Incidents to investigate', icon: 'alert', href: '#/incidents?status=open', count: n.invest, show: n.invest > 0 },
    { label: 'Assign investigators', icon: 'user', href: '#/incidents?status=Reported', count: n.assign, show: can('incident.investigate') },
    { label: 'Safety alerts to approve', icon: 'info', href: '#/notices', count: n.alerts, show: n.alerts > 0 },
    { label: 'Unread notices', icon: 'bell', href: '#/notices', count: n.notices, show: n.notices > 0 },
    { label: 'Report incident', icon: 'plus', href: '#/incidents/new', show: can('incident.report') || can('incident.investigate') },
    { label: 'Raise corrective action', icon: 'plus', act: 'actionNew', show: can('action.create') },
    { label: 'Upload document', icon: 'upload', act: 'newDoc', show: can('doc.create') },
    { label: 'Publish notice', icon: 'plus', act: 'noticeNew', show: can('notice.publish') },
    { label: 'Reports', icon: 'chart', href: '#/reports', show: can('report.view') },
    { label: 'Administration', icon: 'settings', href: '#/admin', show: can('admin') }
  ].filter(x => x.show !== false);
  // Waiting work first (largest count first), then the shortcuts in their set order
  const sorted = L.filter(x => x.count).sort((a, b) => b.count - a.count).concat(L.filter(x => !x.count));
  return `<nav class="ql" aria-label="Quick links for ${esc(pname(uid))}">${sorted.map(x => {
    const inner = `${icon(x.icon, 'sm')}<span>${esc(x.label)}</span>${x.count ? `<b class="ql-n">${x.count}</b>` : ''}`;
    return x.act ? `<button type="button" class="ql-item" data-act="${x.act}">${inner}</button>` : `<a class="ql-item${x.count ? ' has-n' : ''}" href="${x.href}">${inner}</a>`;
  }).join('')}</nav>`;
}

/* ---------------- The page ---------------- */
ROUTES.dashboard = () => {
  const sid = S.ui.site, comp = compliance(sid), drv = partDrivers(sid), months = last12Months();
  const branchRows = orgSites().map(s => ({ s, c: compliance(s.id) }));

  /* Tiles data (detail section) */
  const docs = S.documents.filter(d => inSite(d, sid));
  const myAppr = docs.filter(d => (curStep(docLatest(d)) || {}).person === S.ui.user);
  const inAppr = docs.filter(d => docStatus(d) === 'In Approval'), toIssue = docs.filter(d => docStatus(d) === 'Approved'), returned = docs.filter(d => docStatus(d) === 'Returned for Correction'), docsOver = docs.filter(docReviewOverdue);
  const assets = S.assets.filter(a => inSite(a, sid)), oos = assets.filter(a => a.status === 'Out of Service');
  const certBad = assets.filter(a => assetDocStatus(a).some(d => d.status === 'Expired' || d.status === 'Missing'));
  const sch = S.schedules.filter(s => inSite(s, sid)), insOver = sch.filter(s => daysTo(s.nextDue) < 0), insDue = sch.filter(s => daysTo(s.nextDue) >= 0 && daysTo(s.nextDue) <= 7);
  const defOpen = S.defects.filter(d => d.status !== 'Closed' && inSite(byId('assets', d.asset), sid));
  const acts = S.actions.filter(a => inSite(a, sid)), open = acts.filter(actionOpen), overdue = acts.filter(actionOverdue), awaitingVer = acts.filter(a => a.status === 'Submitted for Verification');
  const incAll = S.incidents.filter(i => inSite(i, sid)), incOpen = incAll.filter(i => i.status !== 'Closed'), incNew = incOpen.filter(i => i.status === 'Reported');

  /* Chart data (last 12 months, current scope) */
  const inc12 = incAll.filter(i => i.date.slice(0, 7) >= months[0]);
  const incPerMonth = months.map(m => inc12.filter(i => i.date.startsWith(m)).length);
  const incTypes = INC_TYPES.map(t => [t, inc12.filter(i => i.type === t).length, `#/incidents?type=${encodeURIComponent(t)}`]).sort((a, b) => b[1] - a[1]);
  const injRows = injClasses().map(c => [c.name, inc12.filter(i => injClass(i) === c.name).length]).filter(r => r[1]).sort((a, b) => b[1] - a[1]);
  const unclassified = inc12.filter(i => i.injury && !injClass(i)).length;
  // Lost time injuries: counted by their final classification, on the date of the incident
  const ltiAll = incAll.filter(i => injClass(i) === 'Lost Time Injury').sort((a, b) => a.date.localeCompare(b.date));
  const lti12 = ltiAll.filter(i => i.date.slice(0, 7) >= months[0]);
  const ltiPerMonth = months.map(m => lti12.filter(i => i.date.startsWith(m)).length);
  const shiftsPerMonth = months.map(m => lti12.filter(i => i.date.startsWith(m)).reduce((a, i) => a + (+i.injury.daysLost || 0), 0));
  const lastLti = ltiAll.length ? ltiAll[ltiAll.length - 1] : null, ltiYtd = ltiAll.filter(i => i.date.startsWith(TODAY.slice(0, 4))).length;
  const ltiIds = k => lti12.filter(i => i.date.startsWith(months[k])).map(i => [i.id, `${i.injury.daysLost} shift(s) lost`]);
  const raised = months.map(m => acts.filter(a => (a.created || '').startsWith(m)).length);
  const done = months.map(m => acts.filter(a => (actionDoneDate(a) || '').startsWith(m)).length);
  LINE.data = { months, aria: 'Corrective actions raised and completed per month, last 12 months', series: [{ name: 'Raised', short: 'raised', v: '--viz-1', vals: raised }, { name: 'Completed (verified)', short: 'completed', v: '--viz-2', vals: done }] };
  LINE.k = null;
  const dueParts = [
    { label: 'On time', cls: 'good', icon: 'checkCircle', n: open.filter(a => daysTo(a.due) > 7).length, href: '#/actions?status=open' },
    { label: 'Due within 7 days', cls: 'warn', icon: 'clock', n: open.filter(a => daysTo(a.due) >= 0 && daysTo(a.due) <= 7).length, href: '#/actions?status=open' },
    { label: 'Overdue up to 30 days', cls: 'serious', icon: 'alert', n: open.filter(a => daysTo(a.due) < 0 && daysTo(a.due) >= -30).length, href: '#/actions?status=overdue' },
    { label: 'Overdue more than 30 days', cls: 'bad', icon: 'x', n: open.filter(a => daysTo(a.due) < -30).length, href: '#/actions?status=overdue' }
  ];

  const b = band(comp.overall);
  const html = `${pageHead('Dashboard', `Compliance control status for ${esc(scopeLabel())}, then the 12-month trends and the detail behind them. Every figure opens the records behind it.`, '', scopePill())}

  ${quickLinks()}
  <h3 class="dash-sec">${icon('shield', 'sm')} Compliance status</h3>
  <div class="cs-grid">
    <div class="card cs-hero st-edge-${b.cls}"><div class="card-body">
      <div class="cs-k">Overall control score</div>
      <div class="cs-pie-row">${scorePie(comp.overall, 150, 'Overall control score')}</div>
      <div class="cs-center">${statusChip(comp.overall)}</div>
      <p class="cs-note">${esc(scopeLabel())} · weighted from the four areas (Administration → Control scoring). Indicative, from demonstration data.</p>
    </div></div>
    ${Object.keys(comp.parts).map(k => { const v = comp.parts[k], d = drv[k]; return `<button class="card cs-part st-edge-${band(v).cls}" data-act="go" data-href="${PART_LINKS[k]}">
      <div class="cs-k">${icon(PART_ICON[k], 'sm')}${PART_TITLE[k]} <span class="cs-w">${S.config.complianceWeights[k]}%</span></div>
      <div class="cs-pie-row">${scorePie(v, 104, PART_TITLE[k])}</div><div class="cs-center">${statusChip(v)}</div>
      <div class="cs-line">${esc(d.line)}</div>
      ${d.issues.length ? `<ul class="cs-issues">${d.issues.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<div class="cs-ok">Nothing outstanding</div>'}
    </button>`; }).join('')}
  </div>

  <div class="card mb"><div class="card-head"><h2>Status by branch</h2><span class="ch-sub">Click a branch to focus the whole dashboard on it</span></div><div class="card-body flush"><div class="table-wrap"><table class="tbl hm">
    <thead><tr><th>Branch</th><th>Overall</th>${Object.keys(comp.parts).map(k => `<th>${PART_TITLE[k]}</th>`).join('')}<th>Open actions</th><th>Overdue</th><th>Open incidents</th></tr></thead>
    <tbody>${branchRows.map(r => `<tr class="${S.ui.site === r.s.id ? 'hm-sel' : ''}"><th scope="row"><button class="link-btn" data-act="focusSite" data-site="${r.s.id}">${esc(r.s.short)}</button></th>
      ${[r.c.overall, ...Object.keys(r.c.parts).map(k => r.c.parts[k])].map((v, i) => `<td><span class="hm-cell st-bg-${band(v).cls}" title="${band(v).label}">${icon(band(v).icon, 'sm')}${v}%</span></td>`).join('')}
      <td>${r.c.openActions}</td><td>${r.c.overdueActions ? `<b class="t-bad">${r.c.overdueActions}</b>` : '0'}</td><td>${r.c.openIncidents}</td></tr>`).join('')}</tbody>
  </table></div>
  <div class="viz-legend pad">${Object.values(STATUS_BAND).map(x => `<span class="st-chip st-${x.cls}">${icon(x.icon, 'sm')}${x.label}</span>`).join('')}<span class="muted">On track 85% and above · Needs attention 70–84% · At risk below 70%</span></div>
  ${S.ui.site !== 'ALL' ? `<div class="pad"><button class="btn sm" data-act="focusSite" data-site="ALL">${icon('building', 'sm')} Return to organisation-wide view</button></div>` : ''}
  </div></div>

  <h3 class="dash-sec">${icon('chart', 'sm')} Trends — last 12 months</h3>
  <div class="grid g2 mb">
    <div class="card"><div class="card-head"><h2>Incidents per month</h2><span class="ch-sub">${inc12.length} in 12 months</span></div><div class="card-body">
      ${columnChart(months, incPerMonth, { unit: 'incidents', aria: `Incidents per month, last 12 months: ${months.map((m, k) => `${monthLabel(m, true)} ${incPerMonth[k]}`).join(', ')}`, href: '#/reports/incidents', detail: k => INC_TYPES.map(t => [String(inc12.filter(i => i.date.startsWith(months[k]) && i.type === t).length), t]).filter(r => r[0] !== '0') })}
      ${dataTable(['Month', 'Incidents', ...INC_TYPES], months.map((m, k) => [monthLabel(m, true), incPerMonth[k], ...INC_TYPES.map(t => inc12.filter(i => i.date.startsWith(m) && i.type === t).length)]))}
    </div></div>
    <div class="card"><div class="card-head"><h2>Incidents by type</h2><span class="ch-sub">Last 12 months</span></div><div class="card-body">
      ${rankBars(incTypes, { unit: 'incidents' })}
      <h4 class="mt">Injuries by classification</h4>
      ${injRows.length ? rankBars(injRows, { unit: 'injuries' }) : '<p class="muted">No classified injuries in the last 12 months.</p>'}
      ${unclassified ? `<p class="muted mt-s">${icon('alert', 'sm')} ${unclassified} injury(ies) not yet classified.</p>` : ''}
      ${dataTable(['Category', 'Count'], incTypes.map(r => [r[0], r[1]]).concat(injRows.map(r => ['Injury: ' + r[0], r[1]])))}
    </div></div>
  </div>
  <div class="card mb" id="ltiCard"><div class="card-head"><h2>Lost time injuries (LTI)</h2><span class="ch-sub">By final injury classification · last 12 months</span></div><div class="card-body">
    <div class="kpis mini">
      ${kpi('Days since last LTI', lastLti ? -daysTo(lastLti.date) : '—', lastLti ? `Last: ${lastLti.id} on ${fmt(lastLti.date)}` : 'No LTI recorded', lastLti && -daysTo(lastLti.date) < 30 ? 'red' : 'green', lastLti ? '#/incidents/' + lastLti.id : '#/incidents?type=Injury', 'clock')}
      ${kpi('LTIs, last 12 months', lti12.length, `${shiftsPerMonth.reduce((a, b) => a + b, 0)} shift(s) lost`, lti12.length ? 'red' : 'green', '#/incidents?type=Injury', 'alert')}
      ${kpi('LTIs this year', ltiYtd, `Since 1 Jan ${TODAY.slice(0, 4)}`, ltiYtd ? 'amber' : 'green', '#/incidents?type=Injury', 'clipboard')}
      ${kpi('Injuries not yet classified', unclassified, 'Could still become LTIs', unclassified ? 'amber' : 'green', '#/incidents?type=Injury', 'search')}
      ${(() => { const lm = prevMonth(TODAY.slice(0, 7)), f = ltifr(sid, lm); return kpi('LTIFR (rolling 12 months)', f.value == null ? '—' : f.value.toFixed(2), f.value == null ? `Hours worked missing for ${f.missing} branch-month(s)` : `${f.ltis} LTI(s) in ${fmtNum(f.hours)} hours · per ${fmtNum(ltifrBase())} · to ${monthLabel(lm, true)}`, f.value == null ? 'amber' : f.value > 0 ? 'red' : 'green', '#/admin/hours', 'chart'); })()}
    </div>
    <div class="grid g2 mt">
      <div><h4>LTIs per month</h4>${columnChart(months, ltiPerMonth, { unit: 'LTIs', aria: `Lost time injuries per month: ${months.map((m, k) => `${monthLabel(m, true)} ${ltiPerMonth[k]}`).join(', ')}`, href: '#/incidents?type=Injury', detail: ltiIds })}</div>
      <div><h4>Shifts lost per month</h4>${columnChart(months, shiftsPerMonth, { unit: 'shifts lost', aria: `Shifts lost to lost time injuries per month: ${months.map((m, k) => `${monthLabel(m, true)} ${shiftsPerMonth[k]}`).join(', ')}`, href: '#/incidents?type=Injury', detail: ltiIds })}</div>
    </div>
    ${(() => { const fm = monthsBack(12, prevMonth(TODAY.slice(0, 7))), fr = fm.map(m => ltifr(sid, m)), vals = fr.map(f => f.value == null ? 0 : f.value), gaps = fr.filter(f => f.value == null).length;
      return `<div class="mt"><h4>LTI frequency rate — rolling 12 months, per ${fmtNum(ltifrBase())} hours worked</h4>${columnChart(fm, vals, { unit: 'LTIFR', decimal: true, missing: k => fr[k].value == null, aria: `Rolling 12-month LTIFR: ${fm.map((m, k) => `${monthLabel(m, true)} ${fr[k].value == null ? 'not available' : fr[k].value}`).join(', ')}`, href: '#/admin/hours', detail: k => fr[k].value == null ? [['—', `hours missing for ${fr[k].missing} branch-month(s)`]] : [[String(fr[k].ltis), 'LTIs'], [fmtNum(fr[k].hours), 'hours worked']] })}
        ${gaps ? `<p class="muted mt-s">${icon('alert', 'sm')} ${gaps} month(s) cannot be calculated because hours worked are missing. <a href="#/admin/hours">Enter hours worked</a>.</p>` : ''}</div>`; })()}
    ${dataTable(['Month', 'LTIs', 'Shifts lost', 'Incidents', 'Rolling 12-month LTIFR'], months.map((m, k) => { const f = ltifr(sid, m); return [monthLabel(m, true), ltiPerMonth[k], shiftsPerMonth[k], lti12.filter(i => i.date.startsWith(m)).map(i => i.id).join(', ') || '—', f.value == null ? 'hours missing' : f.value.toFixed(2)]; }))}
  </div></div>
  <div class="grid g2 mb">
    <div class="card"><div class="card-head"><h2>Corrective actions raised and completed</h2><span class="ch-sub">Per month · completed = verified</span></div><div class="card-body">
      <div class="viz-legend">${LINE.data.series.map(s => `<span><i class="lg-line" style="background:var(${s.v})"></i>${esc(s.name)}</span>`).join('')}</div>
      <div id="lcActions" class="lc"></div>
      ${dataTable(['Month', 'Raised', 'Completed'], months.map((m, k) => [monthLabel(m, true), raised[k], done[k]]))}
    </div></div>
    <div class="card"><div class="card-head"><h2>Open corrective actions against due date</h2><span class="ch-sub">${open.length} open</span></div><div class="card-body">
      ${segBar(dueParts, `Open corrective actions: ${dueParts.map(p => `${p.label} ${p.n}`).join(', ')}`)}
      <div class="kpis mini mt">
        ${kpi('Awaiting verification', awaitingVer.length, 'Evidence submitted', awaitingVer.length ? 'blue' : 'green', '#/actions?status=Submitted for Verification', 'checkCircle')}
        ${kpi('Escalated', overdue.filter(a => a.escalated).length, 'Overdue and escalated', overdue.some(a => a.escalated) ? 'red' : 'green', '#/actions?status=overdue', 'alert')}
      </div>
      ${dataTable(['Due status', 'Open actions'], dueParts.map(p => [p.label, p.n]))}
    </div></div>
  </div>

  <h3 class="dash-sec">${icon('clipboard', 'sm')} Detail</h3>
  <h4 class="mb">${icon('docs', 'sm')} Document Manager</h4>
  <div class="kpis">
    ${kpi('Awaiting my approval', myAppr.length, myAppr.length ? 'Your turn on the approval route' : 'Nothing waiting for you', myAppr.length ? 'amber' : 'green', '#/documents?status=mine', 'user')}
    ${kpi('In approval', inAppr.length, 'Moving through approval routes', 'blue', '#/documents?status=In Approval', 'clock')}
    ${kpi('Approved — not issued', toIssue.length, 'Ready to issue for use', toIssue.length ? 'blue' : 'green', '#/documents?status=Approved', 'checkCircle')}
    ${kpi('Returned for correction', returned.length, 'Author must revise', returned.length ? 'amber' : 'green', '#/documents?status=Returned for Correction', 'refresh')}
    ${kpi('Document reviews overdue', docsOver.length, 'Issued documents past review date', docsOver.length ? 'red' : 'green', '#/documents?review=overdue', 'file')}
  </div>
  <h4 class="mb">${icon('forklift', 'sm')} Assets, inspections & defects</h4>
  <div class="kpis">
    ${kpi('Out of service', oos.length, oos.length ? oos.map(a => a.tag).join(', ') : 'All assets in service', oos.length ? 'red' : 'green', '#/assets?status=Out of Service', 'power')}
    ${kpi('Inspections overdue', insOver.length, `${insDue.length} due in the next 7 days`, insOver.length ? 'red' : 'green', '#/inspections/schedule?due=overdue', 'clipboard')}
    ${kpi('Open defects', defOpen.length, `${defOpen.filter(d => d.severity === 'Critical').length} critical · ${defOpen.filter(d => d.status === 'Awaiting Review').length} awaiting review`, defOpen.some(d => d.severity === 'Critical') ? 'red' : defOpen.length ? 'amber' : 'green', '#/maintenance/defects', 'alert')}
    ${kpi('Certificates expired / missing', certBad.length, 'Assets with non-compliant documents', certBad.length ? 'red' : 'green', '#/assets?issue=docs', 'file')}
  </div>
  <h4 class="mb">${icon('alert', 'sm')} Incidents & corrective actions</h4>
  <div class="kpis">
    ${kpi('Open incidents', incOpen.length, `${incNew.length} awaiting investigation`, incNew.length ? 'red' : incOpen.length ? 'amber' : 'green', '#/incidents?status=open', 'alert')}
    ${kpi('Open corrective actions', open.length, `${open.filter(a => a.priority === 'Critical').length} critical · ${open.filter(a => a.priority === 'High').length} high`, 'blue', '#/actions?status=open', 'target')}
    ${kpi('Actions overdue', overdue.length, `${overdue.filter(a => a.escalated).length} escalated`, overdue.length ? 'red' : 'green', '#/actions?status=overdue', 'clock')}
    ${kpi('Awaiting verification', awaitingVer.length, 'Evidence submitted — verifier to decide', awaitingVer.length ? 'blue' : 'green', '#/actions?status=Submitted for Verification', 'checkCircle')}
  </div>
  <div class="grid g2">
    ${(() => { const upcoming = buildNotifs().filter(n => n.date && daysTo(n.date) >= 0 && daysTo(n.date) <= 30 && !String(n.key).startsWith('EV-') && !String(n.key).startsWith('cert-mi')).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
      return `<div class="card"><div class="card-head"><h2>Upcoming deadlines (next 30 days)</h2><a class="btn ghost sm" href="#/notifications">All notifications</a></div><div class="card-body flush">
      ${upcoming.length ? `<table class="tbl compact stackable"><tbody>${upcoming.map(n => `<tr class="rowlink" data-href="${n.link}"><td data-label="Due" class="nowrap">${dueText(n.date)}</td><td data-label="Item"><div class="t-title">${esc(n.title)}</div><div class="t-sub">${esc(n.text)}</div></td></tr>`).join('')}</tbody></table>` : '<div class="empty">No deadlines in the next 30 days.</div>'}
    </div></div>`; })()}
    <div class="card"><div class="card-head"><h2>Recent activity</h2><span class="ch-sub">Simulated audit trail (browser-local)</span></div><div class="card-body">
      <ul class="activity">${S.activity.slice(0, 9).map(a => `<li><span class="avatar sm">${initials(pname(a.by))}</span><div><div>${a.link ? `<a href="${a.link}">${esc(a.text)}</a>` : esc(a.text)}</div><div class="a-meta">${esc(pname(a.by))} · ${fmtTs(a.ts)}</div></div></li>`).join('')}</ul>
    </div></div>
  </div>`;
  return { title: 'Dashboard', crumbs: [['Dashboard', '#/dashboard']], html, after: drawLineChart };
};
