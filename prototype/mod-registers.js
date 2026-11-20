/* ==========================================================================
   Shared helpers for the registers added with the full specification
   (legal requirements, people & appointments, training, risk, PPE,
   hazardous substances, emergency, contractors).
   - regFilterBar: the same toolbar as the other registers (search + drop-down filters + count + Clear filters)
   - regFilter:    applies the drop-down filters from the page address
   - addArea / addPerm: register a new menu area or permission once (migration)
   ========================================================================== */
'use strict';

function regFilter(all, q, F) { const on = Object.keys(F).filter(k => q[k]); return all.filter(x => on.every(k => F[k].test(x, q[k]))); }
function regFilterBar(base, q, all, shown, F, placeholder) {
  const on = Object.keys(F).filter(k => q[k]);
  const sel = k => { const f = F[k]; if (f.show && !f.show()) return ''; const list = f.list(); if (!list.length) return '';
    return `<select data-flt="${k}" aria-label="${esc(f.all)}"><option value="">${esc(f.all)}</option>${list.map(o => `<option value="${esc(o.value)}" ${q[k] === o.value ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`; };
  setTimeout(() => fltSearch(base), 0);
  return `<div class="toolbar flt-bar" data-base="${base}" data-total="${all.length}" data-shown="${shown}">
    <div class="search">${icon('search', 'sm')}<input type="search" data-fq="${base}" placeholder="${esc(placeholder || 'Search…')}" value="${esc(FLT_Q[base] || '')}" aria-label="Search list"></div>
    ${Object.keys(F).map(sel).join('')}
    ${on.length ? `<button type="button" class="link-btn" data-act="regFltClear" data-keys="${Object.keys(F).join(',')}">Clear filters</button>` : ''}
    <span class="tb-count">${shown} of ${all.length} records</span></div>`;
}
ACT.regFltClear = (el) => { const bar = el.closest('.flt-bar'); FLT_Q[bar.dataset.base] = ''; fltGo(bar, Object.fromEntries(el.dataset.keys.split(',').map(k => [k, '']))); };
// Branch choices as filter options for the current company
const branchOpts = () => orgSites().map(x => ({ value: x.id, label: x.short || x.name }));
const personOpts = (filter) => S.people.filter(p => p.org === S.ui.org && p.status !== 'Deactivated' && (!filter || filter(p))).map(p => ({ value: p.id, label: p.name }));
// Menu area + permission set-up, once per new module
function addArea(key, label, after, likeArea) {
  if (S.permissionDefs.some(d => d[0] === key)) return;
  const k = S.permissionDefs.findIndex(d => d[0] === after); S.permissionDefs.splice(k < 0 ? S.permissionDefs.length : k + 1, 0, [key, label, 'area']);
  S.roles.forEach(r => { if (!r.allPerms && (r.perms || []).includes(likeArea || 'area.documents') && !r.perms.includes(key)) r.perms.push(key); });
}
function addPerm(key, label, roles) {
  if (!S.permissionDefs.some(d => d[0] === key)) S.permissionDefs.push([key, label]);
  S.roles.forEach(r => { if (!r.allPerms && roles.includes(r.name) && !(r.perms || []).includes(key)) r.perms.push(key); });
}
// Insert a menu group after another group (once)
function addNavGroup(afterGroup, group) {
  if (NAV.some(g => g.items.some(i => group.items.some(j => j[0] === i[0])))) return;
  const k = NAV.findIndex(g => g.group === afterGroup); NAV.splice(k < 0 ? NAV.length - 1 : k + 1, 0, group);
}
// Several branches on one record: rec.sites = ['ALL'] or a list of site ids
function inSites(rec, sid) { if (!rec || (rec.org && rec.org !== S.ui.org)) return false; const s = rec.sites || ['ALL']; return !sid || sid === 'ALL' || s.includes('ALL') || s.includes(sid); }
function sitesLabel(list) { list = list || ['ALL']; return list.includes('ALL') ? 'All branches' : list.map(sname).join(', '); }
function siteChecks(name, sel) { sel = sel || ['ALL']; return `<div class="field full" data-field="${name}"><label>Branches</label><div class="chk-row"><label class="check"><input type="checkbox" name="${name}_ALL" ${sel.includes('ALL') ? 'checked' : ''}> <span>All branches</span></label>${orgSites().map(s => `<label class="check"><input type="checkbox" name="${name}_${s.id}" ${sel.includes(s.id) ? 'checked' : ''}> <span>${esc(s.short || s.name)}</span></label>`).join('')}</div></div>`; }
function readSites(m, name) { if (m.querySelector(`[name=${name}_ALL]`).checked) return ['ALL']; const l = orgSites().filter(s => m.querySelector(`[name=${name}_${s.id}]`).checked).map(s => s.id); return l.length ? l : ['ALL']; }
// One coloured status badge per compliance status, used by every new register
const COMPLIANCE_TONE = { 'Compliant': 'green', 'Partially compliant': 'amber', 'Non-compliant': 'red', 'Not assessed': 'grey', 'Not applicable': 'grey', 'Pending assessment': 'blue' };
const cbadge = s => badge(s, COMPLIANCE_TONE[s] || 'grey');
// Export rows (first row = headings) as a CSV that opens in Excel
function csvDownload(name, rows) { const csv = rows.map(r => r.map(c => `"${String(c == null ? '' : c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  return saveFile(`${name}_${TODAY}.csv`, new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })).then(ok => { if (ok) toast(`Exported ${rows.length - 1} row(s) — opens in Excel.`); return ok; }); }
