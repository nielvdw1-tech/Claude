/* ==========================================================================
   Inspections: calendar, and default intervals per equipment type
   --------------------------------------------------------------------------
   Calendar: a month view of the inspections due (from each schedule's next
   due date, repeated at its interval) and those carried out, per branch, with
   a filter per inspector. On a phone it becomes a list by day.

   Equipment types: a competent person sets, per type of equipment, the
   default checklist and how often it is inspected. New assets of that type
   then get a schedule with those values. The system does not supply legal
   intervals: the competent person sets them from the legal requirements,
   manufacturer's instructions and risk assessment, and records the basis.
   ========================================================================== */
'use strict';

/* ---------------- Calendar ---------------- */
function monthGrid(ym) {
  const first = new Date(ym + '-01T00:00:00'), start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7));   // weeks start on Monday
  const days = []; for (let k = 0; k < 42; k++) { const d = new Date(start); d.setDate(start.getDate() + k); days.push(isoDate(d)); }
  return days.slice(0, days[35].slice(0, 7) === ym ? 42 : 35);
}
function addMonthYm(ym, n) { const d = new Date(ym + '-01T00:00:00'); d.setMonth(d.getMonth() + n); return isoDate(d).slice(0, 7); }
// Everything that falls in the month: inspections done, and due dates (the next due date, then every interval after it)
function calendarItems(ym, who) {
  const from = ym + '-01', to = addMonthYm(ym, 1) + '-01', items = [];
  scoped('schedules').filter(s => !who || s.assignee === who).forEach(s => {
    let d = s.nextDue, k = 0;
    while (d < to && k < 60) { if (d >= from) items.push({ date: d, kind: k === 0 && daysTo(d) < 0 ? 'overdue' : 'due', s, projected: k > 0 }); d = addDays(d, s.freqDays || 30); k++; }
  });
  scoped('inspections').filter(i => i.date >= from && i.date < to && (!who || i.inspector === who)).forEach(i => items.push({ date: i.date, kind: 'done', i }));
  return items;
}
function calChip(x) {
  if (x.kind === 'done') return `<a class="cal-chip done" href="#/inspections/${x.i.id}" title="${esc(x.i.target)} — done by ${esc(pname(x.i.inspector))}${x.i.results.some(r => r.result === 'Fail') ? ', failed items' : ''}">${icon('check', 'sm')}<span>${esc(x.i.target)}</span></a>`;
  const late = x.kind === 'overdue';
  return `<a class="cal-chip ${late ? 'late' : x.projected ? 'later' : 'due'}" href="#/inspect/${x.s.id}" title="${esc(x.s.target)} — ${late ? 'overdue' : 'due'} · ${esc(pname(x.s.assignee))}${x.projected ? ' (following inspection)' : ''}">${icon(late ? 'alert' : 'clock', 'sm')}<span>${esc(x.s.target)}</span></a>`;
}
function inspCalendarHtml(q) {
  const ym = /^\d{4}-\d{2}$/.test(q.m || '') ? q.m : TODAY.slice(0, 7), who = q.who === 'me' ? S.ui.user : q.who || '';
  const items = calendarItems(ym, who), days = monthGrid(ym), byDay = d => items.filter(x => x.date === d);
  const people = [...new Set(scoped('schedules').map(s => s.assignee))].filter(Boolean);
  const label = new Date(ym + '-01T00:00:00').toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
  const link = (m, w) => `#/inspections/calendar?m=${m}${w ? '&who=' + encodeURIComponent(w) : ''}`;
  const n = { late: items.filter(x => x.kind === 'overdue').length, due: items.filter(x => x.kind === 'due').length, done: items.filter(x => x.kind === 'done').length };
  return `<div class="card cal-card"><div class="cal-bar">
      <div class="cal-nav"><a class="btn sm" href="${link(addMonthYm(ym, -1), q.who)}" aria-label="Previous month">${icon('arrowL', 'sm')}</a><h2>${esc(label)}</h2><a class="btn sm" href="${link(addMonthYm(ym, 1), q.who)}" aria-label="Next month">${icon('chevronR', 'sm')}</a>${ym !== TODAY.slice(0, 7) ? `<a class="btn sm ghost" href="${link(TODAY.slice(0, 7), q.who)}">Today</a>` : ''}</div>
      <label class="cal-who">Inspector <select id="calWho"><option value="">Everyone</option><option value="me" ${q.who === 'me' ? 'selected' : ''}>Me</option>${people.map(p => `<option value="${p}" ${q.who === p ? 'selected' : ''}>${esc(pname(p))}</option>`).join('')}</select></label>
    </div>
    <div class="cal-legend"><span><i class="cl late"></i>Overdue ${n.late}</span><span><i class="cl due"></i>Due ${n.due}</span><span><i class="cl done"></i>Done ${n.done}</span><span class="muted">Click an inspection to open it.</span></div>
    <div class="cal-grid" role="grid" aria-label="Inspections in ${esc(label)}">
      ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div class="cal-dow" role="columnheader">${d}</div>`).join('')}
      ${days.map(d => { const its = byDay(d), out = d.slice(0, 7) !== ym; return `<div class="cal-day${out ? ' out' : ''}${d === TODAY ? ' today' : ''}${its.length ? '' : ' empty'}" role="gridcell"><div class="cal-num">${+d.slice(8)}<span class="cal-mon">${MONTHS[+d.slice(5, 7) - 1]}</span></div>${its.map(calChip).join('')}</div>`; }).join('')}
    </div>
  </div>`;
}
document.addEventListener('change', e => { if (e.target.id === 'calWho') { const m = (parseHash().q.m) || TODAY.slice(0, 7); navigate(`#/inspections/calendar?m=${m}${e.target.value ? '&who=' + encodeURIComponent(e.target.value) : ''}`); } });

/* ---------------- Default intervals per equipment type (Administration → Asset types) ---------------- */
function typeDefaultHtml(t, ro) {
  const tpl = byId('templates', t.template), b = t.basis;
  const noSched = S.assets.filter(a => a.type === t.id && a.status !== 'Decommissioned' && !S.schedules.some(s => s.asset === a.id)).length;
  return `<div class="type-default"><div><h4>Inspection default</h4>
    <p><b>${tpl ? esc(tpl.docNumber) + ' — ' + esc(tpl.title) : 'No checklist'}</b>, every <b>${t.inspDays} days</b>.</p>
    ${b ? `<p class="t-sub">Basis: ${esc(b.text)} — set by ${esc(pname(b.by))}, ${fmt(b.on)}</p>` : `<p class="t-sub t-warn">${icon('alert', 'sm')} Basis not recorded: a competent person should confirm this interval.</p>`}
    ${noSched ? `<p class="t-sub">${noSched} asset(s) of this type have no inspection schedule.</p>` : ''}</div>
    ${ro ? '' : `<button class="btn sm" data-act="typeDefaultEdit" data-id="${t.id}">Change</button>`}</div>`;
}
ACT.typeDefaultEdit = (el) => {
  const t = S.assetTypes.find(x => x.id === el.dataset.id); if (!t) return;
  const assets = S.assets.filter(a => a.type === t.id && a.status !== 'Decommissioned');
  const noSched = assets.filter(a => !S.schedules.some(s => s.asset === a.id)), withSched = S.schedules.filter(s => assets.some(a => a.id === s.asset));
  openModal({ title: `Inspection default: ${t.name}`, sub: 'Set by a competent person. The system does not supply legal intervals.', body: `<div class="form-grid">
      ${fld({ name: 'template', label: 'Checklist', type: 'select', options: opts(S.templates.map(x => ({ value: x.id, label: `${x.docNumber} — ${x.title}` })), t.template), required: true, full: true })}
      ${fld({ name: 'inspDays', label: 'Inspect every (days)', type: 'number', min: 1, max: 1095, value: t.inspDays, required: true })}
      ${fld({ name: 'basis', label: 'Basis for this interval', type: 'textarea', full: true, required: true, value: t.basis ? t.basis.text : '', placeholder: 'e.g. Legal requirement checked by the competent person; manufacturer\'s manual section 7; risk assessment KIE-RA-005.' })}
      ${noSched.length ? fld({ name: 'create', label: `Create schedules for the ${noSched.length} asset(s) of this type that have none`, type: 'checkbox', value: true, full: true }) : ''}
      ${withSched.length ? fld({ name: 'update', label: `Also change the interval on the ${withSched.length} existing schedule(s) of this type`, type: 'checkbox', value: false, full: true }) : ''}
    </div>`,
    buttons: [{ label: 'Save', cls: 'primary', onClick: m => {
      if (!validateForm(m)) return false; const v = readForm(m), days = Math.round(+v.inspDays);
      const before = `${t.template} every ${t.inspDays} days`;
      Object.assign(t, { template: v.template, inspDays: days, basis: { text: v.basis.trim(), by: S.ui.user, on: TODAY } });
      let made = 0, changed = 0;
      if (v.create) noSched.forEach(a => { if (scheduleFromType(a)) made++; });
      if (v.update) withSched.forEach(s => { if (s.freqDays !== days) { s.freqDays = days; changed++; const a = byId('assets', s.asset); if (a && typeof assetHistory === 'function') assetHistory(a, `Inspection interval changed to every ${days} days (asset type default)`); } });
      log(`Changed the inspection default for ${t.name}: every ${days} days (was ${before})${made ? `; ${made} schedule(s) created` : ''}${changed ? `; ${changed} schedule(s) changed` : ''}`, '#/admin/assettypes');
      save(); toast(`Saved.${made ? ` ${made} schedule(s) created.` : ''}${changed ? ` ${changed} schedule(s) changed.` : ''}`); rerender();
    } }] });
};
function scheduleFromType(a) {
  const t = S.assetTypes.find(x => x.id === a.type); if (!t || !t.template || S.schedules.some(s => s.asset === a.id)) return null;
  const s = { id: nextId('ISCH-', 'schedules', 2), template: t.template, asset: a.id, site: a.site, target: a.tag, freqDays: t.inspDays, nextDue: TODAY, assignee: a.responsible };
  S.schedules.push(s);
  if (typeof assetHistory === 'function') assetHistory(a, `Inspection schedule ${s.id} created from the ${t.name} default: every ${t.inspDays} days`);
  return s;
}
MIGRATIONS.push(() => {
  if (S.migr && S.migr.typeBasis) return; S.migr = S.migr || {}; S.migr.typeBasis = true;
  const fl = S.assetTypes.find(t => t.id === 'AT-FL');
  if (fl && !fl.basis) fl.basis = { text: 'Demo: manufacturer\'s manual and the forklift risk assessment; legal requirement to be confirmed by the competent person.', by: 'P-006', on: addDays(TODAY, -40) };
});

/* ---------------- Filter by site and asset (inspection schedule, planned maintenance) ---------------- */
// items: the rows; siteOf / assetOf: how to get each row's site and asset id. The choice is kept in the page address.
function siteAssetFilter(items, q, siteOf, assetOf) {
  return items.filter(x => (!q.fsite || siteOf(x) === q.fsite) && (!q.fasset || (q.fasset === 'none' ? !assetOf(x) : assetOf(x) === q.fasset)));
}
function siteAssetFilterBar(base, q, items, siteOf, assetOf, shown) {
  const sites = [...new Set(items.map(siteOf))].filter(Boolean).map(id => site(id)).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
  const inSiteItems = items.filter(x => !q.fsite || siteOf(x) === q.fsite);
  const assets = [...new Set(inSiteItems.map(assetOf))].filter(Boolean).map(id => byId('assets', id)).filter(Boolean).sort((a, b) => a.tag.localeCompare(b.tag));
  const areas = inSiteItems.some(x => !assetOf(x));
  const on = q.fsite || q.fasset;
  return `<div class="flt-bar" data-base="${base}">
    ${sites.length > 1 ? `<label>Site <select data-flt="fsite"><option value="">All sites</option>${sites.map(s => `<option value="${s.id}" ${q.fsite === s.id ? 'selected' : ''}>${esc(s.short || s.name)}</option>`).join('')}</select></label>` : ''}
    <label>Asset <select data-flt="fasset"><option value="">All assets${areas ? ' and areas' : ''}</option>${assets.map(a => `<option value="${a.id}" ${q.fasset === a.id ? 'selected' : ''}>${esc(a.tag)} — ${esc(a.name)}</option>`).join('')}${areas ? `<option value="none" ${q.fasset === 'none' ? 'selected' : ''}>Areas (no asset)</option>` : ''}</select></label>
    <span class="muted flt-n">${shown} of ${items.length}</span>
    ${on ? `<button type="button" class="link-btn" data-act="fltClear">Clear filters</button>` : ''}
  </div>`;
}
function fltGo(bar, changes) {
  const q = Object.assign({}, parseHash().q, changes);
  Object.keys(q).forEach(k => { if (!q[k]) delete q[k]; });
  const qs = Object.keys(q).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(q[k])}`).join('&');
  navigate(bar.dataset.base + (qs ? '?' + qs : ''));
}
document.addEventListener('change', e => {
  const sel = e.target.closest && e.target.closest('[data-flt]'); if (!sel) return;
  const bar = sel.closest('.flt-bar'), ch = { [sel.dataset.flt]: sel.value };
  if (sel.dataset.flt === 'fsite') ch.fasset = '';   // a different site has different assets
  fltGo(bar, ch);
});
ACT.fltClear = (el) => fltGo(el.closest('.flt-bar'), { fsite: '', fasset: '' });
