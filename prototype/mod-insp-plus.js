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
function calendarItems(ym, who, q = {}) {
  const from = ym + '-01', to = addMonthYm(ym, 1) + '-01', items = [];
  recFilter(scoped('schedules'), q, RF.cal, true).filter(s => !who || s.assignee === who).forEach(s => {
    let d = s.nextDue, k = 0;
    while (d < to && k < 60) { if (d >= from) items.push({ date: d, kind: k === 0 && daysTo(d) < 0 ? 'overdue' : 'due', s, projected: k > 0 }); d = addDays(d, s.freqDays || 30); k++; }
  });
  recFilter(scoped('inspections'), q, RF.cal, true).filter(i => i.date >= from && i.date < to && (!who || i.inspector === who)).forEach(i => items.push({ date: i.date, kind: 'done', i }));
  return q.fstatus ? items.filter(x => x.kind === q.fstatus) : items;
}
function calChip(x) {
  if (x.kind === 'done') return `<a class="cal-chip done" href="#/inspections/${x.i.id}" title="${esc(x.i.target)} — done by ${esc(pname(x.i.inspector))}${x.i.results.some(r => r.result === 'Fail') ? ', failed items' : ''}">${icon('check', 'sm')}<span>${esc(x.i.target)}</span></a>`;
  const late = x.kind === 'overdue';
  return `<a class="cal-chip ${late ? 'late' : x.projected ? 'later' : 'due'}" href="#/inspect/${x.s.id}" title="${esc(x.s.target)} — ${late ? 'overdue' : 'due'} · ${esc(pname(x.s.assignee))}${x.projected ? ' (following inspection)' : ''}">${icon(late ? 'alert' : 'clock', 'sm')}<span>${esc(x.s.target)}</span></a>`;
}
function inspCalendarHtml(q) {
  const ym = /^\d{4}-\d{2}$/.test(q.m || '') ? q.m : TODAY.slice(0, 7), who = q.who === 'me' ? S.ui.user : q.who || '';
  const items = calendarItems(ym, who, q), days = monthGrid(ym), byDay = d => items.filter(x => x.date === d);
  const people = [...new Set(scoped('schedules').map(s => s.assignee))].filter(Boolean);
  const label = new Date(ym + '-01T00:00:00').toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
  const keep = ['ftype', 'fstatus', 'fsite', 'fcomp'].filter(k => q[k]).map(k => `&${k}=${encodeURIComponent(q[k])}`).join('');
  const link = (m, w) => `#/inspections/calendar?m=${m}${w ? '&who=' + encodeURIComponent(w) : ''}${keep}`;
  const allSch = scoped('schedules'), fltBar = recFilterBar('#/inspections/calendar', q, allSch, RF.cal, recFilter(allSch, q, RF.cal, true).length, 'Search asset, area or inspection…');
  const n = { late: items.filter(x => x.kind === 'overdue').length, due: items.filter(x => x.kind === 'due').length, done: items.filter(x => x.kind === 'done').length };
  return `<div class="card cal-card">${fltBar}<div class="cal-bar">
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
document.addEventListener('change', e => { if (e.target.id === 'calWho') { const m = (parseHash().q.m) || TODAY.slice(0, 7); const q = parseHash().q; navigate(`#/inspections/calendar?m=${m}${e.target.value ? '&who=' + encodeURIComponent(e.target.value) : ''}${['ftype', 'fstatus', 'fsite', 'fcomp'].filter(k => q[k]).map(k => `&${k}=${encodeURIComponent(q[k])}`).join('')}`); } });

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

/* ---------------- Filters on the Inspections and Maintenance & defects lists ----------------
   The same set as the asset register: search, asset type, status, site and compliance state. Asset type and
   compliance state are those of the record's asset; each list has its own statuses. Kept in the page address. */
const assetOfRec = id => (id && byId('assets', id)) || null;
const RF = {
  sched: { siteOf: s => s.site, assetOf: s => s.asset, status: [{ value: 'overdue', label: 'Overdue', test: s => daysTo(s.nextDue) < 0 }, { value: 'due7', label: 'Due in 7 days', test: s => { const d = daysTo(s.nextDue); return d >= 0 && d <= 7; } }, { value: 'later', label: 'Due later', test: s => daysTo(s.nextDue) > 7 }] },
  cal: { siteOf: x => x.site, assetOf: x => x.asset, status: [{ value: 'overdue', label: 'Overdue' }, { value: 'due', label: 'Due' }, { value: 'done', label: 'Done' }] },
  ins: { siteOf: i => i.site, assetOf: i => i.asset, status: [{ value: 'pass', label: 'All items passed', test: i => !i.results.some(r => r.result === 'Fail') }, { value: 'fail', label: 'Failed items', test: i => i.results.some(r => r.result === 'Fail') }] },
  mt: { siteOf: m => (assetOfRec(m.asset) || {}).site, assetOf: m => m.asset, status: [{ value: 'overdue', label: 'Overdue', test: m => daysTo(m.due) < 0 }, { value: 'due14', label: 'Due in 14 days', test: m => { const d = daysTo(m.due); return d >= 0 && d <= 14; } }, { value: 'later', label: 'Due later', test: m => daysTo(m.due) > 14 }] },
  mtDone: { siteOf: m => (assetOfRec(m.asset) || {}).site, assetOf: m => m.asset, status: [{ value: 'ontime', label: 'Completed on time', test: m => !m.due || String(m.completed).slice(0, 10) <= m.due }, { value: 'late', label: 'Completed late', test: m => m.due && String(m.completed).slice(0, 10) > m.due }] },
  def: { siteOf: d => (assetOfRec(d.asset) || {}).site, assetOf: d => d.asset, status: [{ value: 'open', label: 'Open (not closed)', test: d => d.status !== 'Closed' }].concat(['Awaiting Review', 'Action Raised', 'Repaired – awaiting verification', 'Closed'].map(v => ({ value: v, label: v, test: d => d.status === v }))) }
};
const COMP = [{ value: 'docs', label: 'Certificate expired / missing', test: a => assetDocStatus(a).some(d => d.status === 'Expired' || d.status === 'Missing') }, { value: 'insp', label: 'Inspection overdue', test: a => scheduleFor(a.id).some(s => daysTo(s.nextDue) < 0) }];
function recFilter(items, q, c, skipStatus) {
  const st = !skipStatus && q.fstatus && (c.status || []).find(x => x.value === q.fstatus), cp = q.fcomp && COMP.find(x => x.value === q.fcomp);
  return items.filter(x => { const a = assetOfRec(c.assetOf(x));
    if (q.fsite && c.siteOf(x) !== q.fsite) return false;
    if (q.ftype && (!a || a.type !== q.ftype)) return false;
    if (cp && (!a || !cp.test(a))) return false;
    if (st && st.test && !st.test(x)) return false;
    return true; });
}
function recFilterBar(base, q, items, c, shown, placeholder) {
  const sites = [...new Set(items.map(c.siteOf))].filter(Boolean).map(id => site(id)).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
  const sel = (key, all, list) => `<select data-flt="${key}" aria-label="${esc(all)}"><option value="">${esc(all)}</option>${list.map(o => `<option value="${esc(o.value)}" ${q[key] === o.value ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`;
  setTimeout(() => fltSearch(base), 0);
  return `<div class="toolbar flt-bar" data-base="${base}" data-total="${items.length}" data-shown="${shown}">
    <div class="search">${icon('search', 'sm')}<input type="search" data-fq="${base}" placeholder="${esc(placeholder || 'Search…')}" value="${esc(FLT_Q[base] || '')}" aria-label="Search list"></div>
    ${sel('ftype', 'All asset types', S.assetTypes.map(t => ({ value: t.id, label: t.name })))}
    ${sel('fstatus', 'All statuses', c.status || [])}
    ${sites.length > 1 || q.fsite ? sel('fsite', 'All sites', sites.map(x => ({ value: x.id, label: x.short || x.name }))) : ''}
    ${sel('fcomp', 'Any compliance state', COMP)}
    ${q.ftype || q.fstatus || q.fsite || q.fcomp ? `<button type="button" class="link-btn" data-act="fltClear">Clear filters</button>` : ''}
    <span class="tb-count">${shown} of ${items.length} records</span>
  </div>`;
}
// Older name kept for any caller that filters by site only
function siteAssetFilter(items, q, siteOf, assetOf) { return recFilter(items, q, { siteOf, assetOf, status: [] }); }
const FLT_Q = {};
// Typing in the search box narrows the rows (or calendar entries) shown, straight away
function fltSearch(base) {
  const bar = document.querySelector(`.flt-bar[data-base="${base}"]`); if (!bar) return;
  const term = (FLT_Q[base] || '').trim().toLowerCase(), card = bar.closest('.card');
  const rows = card ? [...card.querySelectorAll('tbody tr, .cal-chip')] : [];
  let n = 0; rows.forEach(r => { const hit = !term || r.textContent.toLowerCase().includes(term); r.style.display = hit ? '' : 'none'; if (hit) n++; });
  const ct = bar.querySelector('.tb-count'), tot = bar.dataset.total;
  if (ct) ct.textContent = term ? `${n} matching · ${bar.dataset.shown} of ${tot} records` : `${bar.dataset.shown} of ${tot} records`;
}
document.addEventListener('input', e => { const t = e.target; if (t.dataset && t.dataset.fq) { FLT_Q[t.dataset.fq] = t.value; fltSearch(t.dataset.fq); } });
function fltGo(bar, changes) {
  const q = Object.assign({}, parseHash().q, changes);
  Object.keys(q).forEach(k => { if (!q[k]) delete q[k]; });
  const qs = Object.keys(q).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(q[k])}`).join('&');
  navigate(bar.dataset.base + (qs ? '?' + qs : ''));
}
document.addEventListener('change', e => {
  const sel = e.target.closest && e.target.closest('[data-flt]'); if (!sel) return;
  const bar = sel.closest('.flt-bar'), ch = { [sel.dataset.flt]: sel.value };
  fltGo(bar, ch);
});
ACT.fltClear = (el) => fltGo(el.closest('.flt-bar'), { ftype: '', fstatus: '', fsite: '', fcomp: '', fasset: '' });
