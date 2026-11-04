/* ==========================================================================
   Hours worked and the LTI frequency rate (LTIFR)
   --------------------------------------------------------------------------
   Hours worked are recorded per branch per month (Administration → Hours
   worked). The LTIFR is the number of lost time injuries per a fixed number
   of hours worked (200 000 or 1 000 000 — the company chooses the base it
   reports on), calculated over a rolling 12 months so one month's figure is
   not distorted by a quiet or busy month.
   ========================================================================== */
'use strict';

function monthsBack(n, end) {   // n calendar months ending with `end` (YYYY-MM), oldest first
  const out = [], d = new Date((end || TODAY.slice(0, 7)) + '-01T00:00:00');
  for (let k = n - 1; k >= 0; k--) { const x = new Date(d); x.setMonth(d.getMonth() - k); out.push(isoDate(x).slice(0, 7)); }
  return out;
}
function prevMonth(m) { return monthsBack(2, m)[0]; }
function ltifrBase() { return (S.config && S.config.ltifrBase) || 200000; }
function hoursOf(siteId, month) { const h = (S.hours || {})[siteId]; return h && h[month] != null ? +h[month] : null; }
function scopeSites(sid) { return sid === 'ALL' ? orgSites().map(s => s.id) : [sid]; }
/* Rolling 12-month LTIFR ending with `month` for a branch or the whole organisation.
   Returns { value, ltis, hours, missing } — value is null when hours are missing for any month. */
function ltifr(sid, month) {
  const ms = monthsBack(12, month), sites = scopeSites(sid);
  let hours = 0, missing = 0;
  ms.forEach(m => sites.forEach(s => { const h = hoursOf(s, m); if (h == null) missing++; else hours += h; }));
  const ltis = S.incidents.filter(i => sites.includes(i.site) && injClass(i) === 'Lost Time Injury' && ms.includes(i.date.slice(0, 7))).length;
  return { value: missing || !hours ? null : Math.round((ltis * ltifrBase() / hours) * 100) / 100, ltis, hours, missing };
}
function fmtNum(n) { return Number(n).toLocaleString('en-ZA'); }

/* ---------------- Administration → Hours worked ---------------- */
function hoursAdminHtml(ro) {
  const ms = monthsBack(12).reverse(), sites = orgSites();
  const last = prevMonth(TODAY.slice(0, 7)), lastMissing = sites.filter(s => hoursOf(s.id, last) == null);
  return `<div class="alert info">${icon('info')}<div>Enter the total <b>hours worked</b> by employees (and contractors, if your company counts them) at each branch every month, from payroll or time records. The dashboard uses them for the <b>LTI frequency rate</b>.${lastMissing.length ? ` <b>${monthLabel(last, true)} is still missing for ${lastMissing.map(s => esc(s.short)).join(', ')}.</b>` : ''}</div></div>
  <div class="card mb"><div class="card-head"><h2>LTIFR base</h2></div><div class="card-body"><form id="baseForm" class="form-grid">${fld({ name: 'base', label: 'Lost time injuries per', type: 'select', options: opts([{ value: 200000, label: '200 000 hours worked' }, { value: 1000000, label: '1 000 000 hours worked' }], ltifrBase()) })}<div class="field"><label>&nbsp;</label><p class="muted" style="margin:6px 0 0">Use the base your company or client reports on, so figures can be compared.</p></div></form>${ro ? '' : `<button class="btn sm mt-s" data-act="ltifrBaseSave">Save</button>`}</div></div>
  <div class="card"><div class="card-head"><h2>Hours worked per month</h2><span class="ch-sub">Last 12 months · latest first</span></div><div class="card-body flush"><form id="hoursForm"><div class="table-wrap"><table class="tbl compact hours-tbl"><thead><tr><th>Month</th>${sites.map(s => `<th>${esc(s.short)}</th>`).join('')}<th>Total</th></tr></thead><tbody>
    ${ms.map(m => `<tr><td class="nowrap"><b>${monthLabel(m, true)}</b></td>${sites.map(s => { const h = hoursOf(s.id, m); return `<td>${ro ? (h == null ? '<span class="due amber">Missing</span>' : fmtNum(h)) : `<input type="number" min="0" step="1" name="h_${s.id}_${m}" value="${h == null ? '' : h}" placeholder="—" aria-label="Hours worked, ${esc(s.short)}, ${monthLabel(m, true)}">`}</td>`; }).join('')}<td class="mono">${sites.every(s => hoursOf(s.id, m) != null) ? fmtNum(sites.reduce((a, s) => a + hoursOf(s.id, m), 0)) : '<span class="muted">incomplete</span>'}</td></tr>`).join('')}
  </tbody></table></div></form></div></div>
  ${ro ? '' : `<button class="btn primary mt" data-act="hoursSave">Save hours worked</button>`}`;
}
ACT.hoursSave = () => {
  const f = document.getElementById('hoursForm'); let bad = 0, n = 0; S.hours = S.hours || {};
  f.querySelectorAll('input[name^="h_"]').forEach(inp => {
    const [, sid, m] = inp.name.split('_'), v = inp.value.trim(); S.hours[sid] = S.hours[sid] || {};
    if (v === '') { delete S.hours[sid][m]; return; }
    if (!(+v >= 0) || !Number.isFinite(+v)) { bad++; inp.closest('td').classList.add('cell-bad'); return; }
    if (S.hours[sid][m] !== +v) n++;
    S.hours[sid][m] = Math.round(+v);
  });
  if (bad) { toast(`${bad} value(s) are not valid hours. Nothing else was lost; correct them and save again.`, 'error'); save(); return; }
  log(`Updated hours worked (${n} value(s) changed)`, '#/admin/hours'); save(); toast('Hours worked saved.'); rerender();
};
ACT.ltifrBaseSave = () => { S.config.ltifrBase = +readForm(document.getElementById('baseForm')).base; log(`Set the LTIFR base to ${fmtNum(S.config.ltifrBase)} hours`, '#/admin/hours'); save(); toast('Saved.'); rerender(); };
// A task for administrators when last month's hours have not been entered yet
function hoursTasks() {
  if (!can('admin')) return [];
  const last = prevMonth(TODAY.slice(0, 7)), miss = orgSites().filter(s => hoursOf(s.id, last) == null);
  return miss.length ? [{ title: `Enter hours worked for ${monthLabel(last, true)}`, sub: `Missing for ${miss.map(s => s.short).join(', ')} — needed for the LTI frequency rate`, link: '#/admin/hours', sev: 'amber' }] : [];
}
