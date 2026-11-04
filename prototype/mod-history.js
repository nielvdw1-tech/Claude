/* ==========================================================================
   Control score history
   --------------------------------------------------------------------------
   The control score is calculated live, so its past values are kept as a
   monthly snapshot per organisation and branch: the current month is
   updated whenever the dashboard is opened (month to date) and freezes when
   the month ends. In the live system a server job takes the snapshot.
   DEMO: the first time, 11 earlier months are filled with fictional history,
   marked as demonstration data.
   ========================================================================== */
'use strict';

function compactScore(c) { return { overall: c.overall, parts: Object.assign({}, c.parts) }; }
function recordScoreHistory() {
  S.scoreHistory = S.scoreHistory || {};
  const org = S.ui.org, m = TODAY.slice(0, 7), h = S.scoreHistory[org] = S.scoreHistory[org] || {};
  const snap = { day: TODAY, ALL: compactScore(compliance('ALL')) };
  orgSites().forEach(s => { snap[s.id] = compactScore(compliance(s.id)); });
  const first = !Object.keys(h).length;
  h[m] = snap;
  if (first) backfillDemoHistory(org, snap);
  save();
}
// Fictional earlier months: a gradual climb towards today's figures, with some month-to-month movement.
function backfillDemoHistory(org, now) {
  const h = S.scoreHistory[org], ms = monthsBack(12).slice(0, 11).reverse();   // last month first
  const clamp = v => Math.max(20, Math.min(100, Math.round(v)));
  ms.forEach((m, k) => {
    const back = k + 1, snap = { day: m + '-28', demo: true };
    Object.keys(now).filter(key => key !== 'day').forEach((key, si) => {
      const wob = (n) => ((back * 7 + si * 11 + n * 5) % 9) - 4;
      const parts = {}; Object.keys(now[key].parts).forEach((p, pi) => { parts[p] = clamp(now[key].parts[p] - back * (1.6 + pi * 0.4) + wob(pi)); });
      const w = S.config.complianceWeights, tw = Object.keys(parts).reduce((a, p) => a + Number(w[p] || 0), 0);
      snap[key] = { overall: clamp(Object.keys(parts).reduce((a, p) => a + parts[p] * Number(w[p] || 0), 0) / (tw || 1)), parts };
    });
    h[m] = snap;
  });
}
function scoreSeries(sid, months) { const h = (S.scoreHistory || {})[S.ui.org] || {}; return months.map(m => (h[m] && h[m][sid]) || null); }
function scoreDemoMonth(m) { const h = (S.scoreHistory || {})[S.ui.org] || {}; return !!(h[m] && h[m].demo); }
// Change in the overall score since last month's snapshot, for the hero card
function scoreDelta(sid) {
  const ms = monthsBack(2), [prev, cur] = scoreSeries(sid, ms);
  if (!prev || !cur) return '';
  const d = cur.overall - prev.overall, up = d > 0;
  return `<div class="cs-delta ${d === 0 ? '' : up ? 't-good' : 't-bad'}">${d === 0 ? 'No change' : `${up ? '▲' : '▼'} ${Math.abs(d)} point${Math.abs(d) === 1 ? '' : 's'}`} since ${monthLabel(ms[0], true)}</div>`;
}
function scoreHistoryCard(sid) {
  const months = monthsBack(12), ser = scoreSeries(sid, months), demo = months.filter(scoreDemoMonth).length;
  LINES.lcScore = { months, max: 100, ref: { v: 85, label: 'On track' }, aria: `Overall control score per month, last 12 months, ${scopeLabel()}`, note: k => scoreDemoMonth(months[k]) ? 'demonstration history' : k === months.length - 1 ? 'month to date' : '',
    series: [{ name: 'Overall control score', short: 'now', unit: '%', v: '--viz-1', vals: ser.map(x => x ? x.overall : null) }] };
  const PL = { documents: 'Documents', assets: 'Assets', actions: 'Actions', incidents: 'Incidents' };
  return `<div class="card mb"><div class="card-head"><h2>Control score — last 12 months</h2><span class="ch-sub">${esc(scopeLabel())} · monthly snapshot; this month is month to date</span></div><div class="card-body">
    <div id="lcScore" class="lc"></div>
    ${demo ? `<p class="muted mt-s">${icon('info', 'sm')} ${demo} earlier month(s) are <b>fictional demonstration history</b>. From now on the system records the real score each month.</p>` : ''}
    ${dataTable(['Month', 'Overall', ...Object.values(PL)], months.map((m, k) => { const x = ser[k]; return [monthLabel(m, true) + (scoreDemoMonth(m) ? ' (demo)' : ''), x ? x.overall + '%' : '—', ...Object.keys(PL).map(p => x ? x.parts[p] + '%' : '—')]; }))}
  </div></div>`;
}
