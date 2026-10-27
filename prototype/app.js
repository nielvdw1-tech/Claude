/* ==========================================================================
   VDW HSEQ Management System — Interactive Prototype
   Core: state, routing, shell, shared components, compliance engine,
   notification engine, central action (CAPA) workflow, dashboard.
   --------------------------------------------------------------------------
   PROTOTYPE ONLY. Data lives in this browser's localStorage. There is no
   server, no real authentication and no permanent document storage.
   ========================================================================== */
'use strict';

const STORE_KEY = 'vdw-hseq-prototype-v4';
let S = null;                        // application state (demo data)
const TODAY = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return isoDate(d); })();
const ROUTES = {};                   // page renderers registered by module files
const ACT = {};                      // click handlers: data-act="name"

/* ---------------- Persistence ---------------- */
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) { const parsed = JSON.parse(raw); if (parsed && parsed.version === 4) { S = parsed; return; } }
  } catch (e) { console.warn('Could not read local storage; using fresh demo data.', e); }
  S = buildSeed(); save();
}
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { console.warn('Local storage unavailable — changes will not persist.', e); } }
function resetDemo() { S = buildSeed(); save(); }

/* ---------------- Utilities ---------------- */
function isoDate(d) { const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); }
function addDays(date, n) { const d = new Date(date + 'T00:00:00'); d.setDate(d.getDate() + n); return isoDate(d); }
function addMonths(date, n) { const d = new Date(date + 'T00:00:00'); d.setMonth(d.getMonth() + Number(n)); return isoDate(d); }
function daysTo(date) { if (!date) return null; return Math.round((new Date(date + 'T00:00:00') - new Date(TODAY + 'T00:00:00')) / 86400000); }
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmt(date) { if (!date) return '—'; const d = new Date(String(date).slice(0, 10) + 'T00:00:00'); if (isNaN(d)) return '—'; return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function fmtTs(ts) { if (!ts) return '—'; const d = new Date(ts); if (isNaN(d)) return fmt(ts); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear() + ', ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
function nowTs() { return new Date().toISOString(); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function byId(coll, id) { return (S[coll] || []).find(x => x.id === id); }
function person(id) { return S.people.find(p => p.id === id); }
function pname(id) { if (!id) return '—'; if (id === 'System') return 'System'; const p = person(id); return p ? p.name : id; }
function site(id) { return S.sites.find(s => s.id === id); }
function sname(id) { if (!id || id === 'ALL') return 'All sites'; const s = site(id); return s ? s.short : id; }
function orgOf(id) { return S.orgs.find(o => o.id === id); }
function initials(name) { return String(name || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase(); }
function me() { return person(S.ui.user); }
function myRole() { const p = me(); return S.roles.find(r => r.name === (p && p.sysRole)) || S.roles[S.roles.length - 1]; }
function can(perm) { return myRole().perms.includes(perm); }
function nextId(prefix, coll, pad = 3, start = 1) {
  let max = start - 1; (S[coll] || []).forEach(x => { const m = String(x.id).match(/(\d+)$/); if (m && x.id.startsWith(prefix)) max = Math.max(max, Number(m[1])); });
  return prefix + String(max + 1).padStart(pad, '0');
}
function log(text, link) { S.activity.unshift({ ts: nowTs(), by: S.ui.user, text, link: link || '' }); S.activity = S.activity.slice(0, 200); }
function addEvent(sev, cat, title, text, link, site) { S.events.unshift({ key: 'EV-' + Date.now() + '-' + Math.floor(Math.random() * 1000), sev, cat, title, text, link, date: TODAY, ts: nowTs(), site: site || 'ALL', org: S.ui.org }); }
function fileMeta(f) { return f ? { name: f.name, size: f.size, type: f.type || 'unknown', demo: true, selectedOn: nowTs() } : null; }
function fsize(b) { if (!b && b !== 0) return ''; return b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }
function fileChip(f) {
  if (!f) return '<span class="muted">No file</span>';
  return `<span class="file-chip" title="Demo file reference only — the file content is not stored by this prototype">${icon('file', 'sm')}<span class="fc-name">${esc(f.name)}</span><span class="muted">${fsize(f.size)}</span><span class="fc-note">${f.seeded ? 'Demo record' : 'Local demo file'}</span></span>`;
}
function uniq(a) { return [...new Set(a)]; }
function pct(n, d) { return d ? Math.round((n / d) * 100) : 100; }
function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

/* ---------------- Icons (inline SVG, stroke style) ---------------- */
const ICON_PATHS = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  docs: '<path d="M15 2H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6z"/><path d="M15 2v4h4"/><path d="M9 11h6M9 15h4"/><path d="M5 6H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-1"/>',
  scale: '<path d="M12 3v18M7 21h10M5 7h14"/><path d="M5 7l-3 7a3.5 3.5 0 0 0 6 0z"/><path d="M19 7l-3 7a3.5 3.5 0 0 0 6 0z"/>',
  risk: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  people: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  truck: '<path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  forklift: '<path d="M3 17V8h7l3 5v4"/><path d="M17 3v16h4"/><circle cx="6" cy="18" r="2"/><circle cx="12" cy="18" r="2"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  flask: '<path d="M9 3h6M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21.5h11.6a2 2 0 0 0 1.7-3L14 9V3"/><path d="M7 15h10"/>',
  siren: '<path d="M7 18v-6a5 5 0 0 1 10 0v6"/><path d="M5 21h14v-3H5z"/><path d="M12 3v2M4.2 6.2l1.4 1.4M19.8 6.2l-1.4 1.4"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  chevronR: '<path d="m9 18 6-6-6-6"/>',
  menu: '<path d="M3 12h18M3 6h18M3 18h18"/>',
  tasks: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  grid: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
  plug: '<path d="M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  crane: '<path d="M4 21V3h3v18M7 5h14M7 9l7-4M18 5v6M16 11h4v3h-4z"/>',
  chain: '<path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 1 1 0 10h-2M8 12h8"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  refresh: '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  arrowR: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  power: '<path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  hardhat: '<path d="M2 18h20v2H2zM4 18v-3a8 8 0 0 1 16 0v3"/><path d="M10 7V4h4v3"/>'
};
function icon(name, cls = '') { return `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON_PATHS[name] || ICON_PATHS.info}</svg>`; }

/* ---------------- Status badges ---------------- */
const STATUS_COLOURS = {
  // legal
  'Compliant': 'green', 'Partially Compliant': 'amber', 'Non-Compliant': 'red', 'Not Assessed': 'grey', 'Not Applicable': 'navy', 'Awaiting Verification': 'purple',
  // documents
  'Draft': 'grey', 'Submitted for Review': 'blue', 'Under Review': 'blue', 'Approved': 'green', 'Issued for Use': 'green', 'Returned for Correction': 'amber', 'Resubmitted': 'blue', 'Rejected': 'red', 'Obsolete': 'grey', 'Archived': 'grey', 'Superseded': 'grey',
  // actions
  'Created': 'grey', 'Assigned': 'blue', 'Acknowledged': 'blue', 'In Progress': 'blue', 'Submitted for Verification': 'purple', 'Verified': 'green', 'Closed': 'green', 'Reopened': 'orange',
  // assets
  'In Service': 'green', 'Out of Service': 'red', 'Under Maintenance': 'amber', 'Decommissioned': 'grey',
  // incidents
  'Reported': 'orange', 'Under Investigation': 'blue', 'Actions in Progress': 'blue', 'Awaiting Closure': 'purple',
  // misc
  'Planned': 'blue', 'Scheduled': 'blue', 'Completed': 'green', 'Reviewed': 'green', 'Overdue': 'red', 'Open': 'red', 'Action Raised': 'amber', 'Awaiting Approval': 'amber',
  'Valid': 'green', 'Expiring': 'amber', 'Expired': 'red', 'Missing': 'red', 'Not accepted': 'amber', 'Superseded draft': 'grey', 'Repaired – awaiting verification': 'purple',
  'Critical': 'red', 'High': 'orange', 'Medium': 'amber', 'Low': 'green', 'Major NC': 'red', 'Minor NC': 'amber', 'Observation': 'blue', 'OFI': 'grey', 'Major': 'orange', 'Minor': 'amber'
};
const STATUS_LABELS = { 'Rejected': 'Rejected', 'Submitted for Verification': 'Awaiting verification' };
function badge(text, colour, plain) { return `<span class="badge b-${colour || STATUS_COLOURS[text] || 'grey'}${plain ? ' plain' : ''}">${esc(text)}</span>`; }
function sbadge(status) { return badge(status, STATUS_COLOURS[status]); }
function dueText(date, done) {
  if (!date) return '<span class="due grey">—</span>';
  if (done) return `<span class="due grey">${fmt(date)}</span>`;
  const n = daysTo(date);
  if (n < 0) return `<span class="due red">${fmt(date)} · ${-n}d overdue</span>`;
  if (n === 0) return `<span class="due red">${fmt(date)} · due today</span>`;
  if (n <= 30) return `<span class="due amber">${fmt(date)} · in ${n}d</span>`;
  return `<span class="due green">${fmt(date)}</span>`;
}
function validity(expiry, lead = 30) { if (!expiry) return 'Valid'; const n = daysTo(expiry); return n < 0 ? 'Expired' : n <= lead ? 'Expiring' : 'Valid'; }

/* ---------------- Scope (organisation / branch) ---------------- */
function inScope(rec, opts = {}) {
  if (!rec) return false;
  const org = rec.org || (rec.site && site(rec.site) ? site(rec.site).org : null);
  if (org && org !== S.ui.org) return false;
  if (S.ui.site === 'ALL' || opts.ignoreSite) return true;
  return !rec.site || rec.site === 'ALL' || rec.site === S.ui.site;
}
function scoped(coll) { return (S[coll] || []).filter(r => inScope(r)); }
function orgSites() { return S.sites.filter(s => s.org === S.ui.org); }
function scopeLabel() { return S.ui.site === 'ALL' ? (orgOf(S.ui.org).short + ' — all branches') : (orgOf(S.ui.org).short + ' — ' + site(S.ui.site).short); }
function scopePill() { return `<div class="scope-pill">${icon(S.ui.site === 'ALL' ? 'building' : 'target', 'sm')} ${esc(scopeLabel())}</div>`; }
function peopleInScope() { return S.people.filter(p => inScope(p)); }
function personOptions(sel, filter) { const list = S.people.filter(p => p.org === S.ui.org && (!filter || filter(p))); return '<option value="">— Select —</option>' + list.map(p => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(p.name)} — ${esc(p.jobTitle)}${p.site ? ' (' + esc(sname(p.site)) + ')' : ''}</option>`).join(''); }
function siteOptions(sel, includeAll = true) { return (includeAll ? `<option value="ALL" ${sel === 'ALL' ? 'selected' : ''}>All sites (organisation-wide)</option>` : '<option value="">— Select —</option>') + orgSites().map(s => `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${esc(s.name)}</option>`).join(''); }
function opts(list, sel, blank) { return (blank ? `<option value="">${esc(blank)}</option>` : '') + list.map(o => { const v = typeof o === 'object' ? o.value : o, l = typeof o === 'object' ? o.label : o; return `<option value="${esc(v)}" ${String(v) === String(sel) ? 'selected' : ''}>${esc(l)}</option>`; }).join(''); }
function defaultSite() { return S.ui.site !== 'ALL' ? S.ui.site : (me() && me().org === S.ui.org ? me().site : orgSites()[0].id); }

/* ---------------- Risk matrix ---------------- */
function riskBand(score) { const b = S.config.riskMatrix.bands.find(x => score <= x.max) || S.config.riskMatrix.bands[S.config.riskMatrix.bands.length - 1]; return b; }
function ratingChip(L, Sv) { if (!L || !Sv) return '<span class="muted">—</span>'; const sc = L * Sv, b = riskBand(sc); return `<span class="rating"><i class="r-${b.cls}">${sc}</i>${esc(b.name)}</span>`; }

/* ---------------- Toasts / modal / confirm ---------------- */
function toast(msg, type = 'success') {
  const box = document.getElementById('toasts'); const el = document.createElement('div');
  el.className = 'toast ' + type; el.setAttribute('role', 'status');
  el.innerHTML = icon(type === 'error' ? 'alert' : type === 'info' ? 'info' : 'checkCircle') + `<div>${msg}</div>`;
  box.appendChild(el); setTimeout(() => el.remove(), type === 'error' ? 6000 : 4200);
}
let modalStack = [];
function openModal({ title, sub, body, size, buttons, onOpen }) {
  const back = document.createElement('div'); back.className = 'modal-back';
  back.innerHTML = `<div class="modal ${size || ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="modal-head"><div><h2>${esc(title)}</h2>${sub ? `<p>${sub}</p>` : ''}</div><button class="modal-close" aria-label="Close">${icon('x')}</button></div>
    <div class="modal-body">${body}</div><div class="modal-foot"></div></div>`;
  const foot = back.querySelector('.modal-foot');
  const all = [{ label: 'Cancel', cls: '', close: true }].concat(buttons || []);
  all.forEach(b => {
    const btn = document.createElement('button'); btn.className = 'btn ' + (b.cls || ''); btn.type = 'button'; btn.innerHTML = b.label;
    if (b.id) btn.id = b.id;
    btn.addEventListener('click', () => { if (b.close) return closeModal(); const res = b.onClick(back.querySelector('.modal')); if (res !== false) closeModal(); });
    foot.appendChild(btn);
  });
  back.querySelector('.modal-close').addEventListener('click', closeModal);
  back.addEventListener('mousedown', e => { if (e.target === back) closeModal(); });
  document.body.appendChild(back); modalStack.push(back);
  if (onOpen) onOpen(back.querySelector('.modal'));
  const first = back.querySelector('input:not([type=hidden]):not([type=file]):not([type=checkbox]), select, textarea'); if (first) setTimeout(() => first.focus(), 30);
  return back.querySelector('.modal');
}
function closeModal() { const m = modalStack.pop(); if (m) m.remove(); }
function confirmBox(title, text, okLabel, cb, cls = 'primary') { openModal({ title, size: 'narrow', body: `<p>${text}</p>`, buttons: [{ label: okLabel, cls, onClick: () => { cb(); } }] }); }

/* ---------------- Form helpers ---------------- */
function fld(o) {
  const id = 'f_' + o.name; const req = o.required ? '<span class="req">*</span>' : '';
  let input;
  const v = o.value == null ? '' : o.value;
  switch (o.type) {
    case 'select': input = `<select id="${id}" name="${o.name}" ${o.required ? 'data-req="1"' : ''}>${o.options}</select>`; break;
    case 'textarea': input = `<textarea id="${id}" name="${o.name}" ${o.required ? 'data-req="1"' : ''} placeholder="${esc(o.placeholder || '')}" rows="${o.rows || 3}">${esc(v)}</textarea>`; break;
    case 'file': input = `<input id="${id}" name="${o.name}" type="file" ${o.required ? 'data-req="1"' : ''} ${o.accept ? `accept="${o.accept}"` : ''} ${o.capture ? 'capture="environment"' : ''}><div class="file-note">${icon('info', 'sm')} Prototype: only the file name and size are kept in this browser as a demo reference. Production stores the file in secure, permanent document storage.</div>`; break;
    case 'checkbox': return `<div class="field ${o.full ? 'full' : ''}"><label class="check"><input type="checkbox" id="${id}" name="${o.name}" ${o.value ? 'checked' : ''}> <span>${o.label}</span></label>${o.hint ? `<div class="hint">${o.hint}</div>` : ''}</div>`;
    default: input = `<input id="${id}" name="${o.name}" type="${o.type || 'text'}" value="${esc(v)}" ${o.required ? 'data-req="1"' : ''} placeholder="${esc(o.placeholder || '')}" ${o.min != null ? `min="${o.min}"` : ''} ${o.max != null ? `max="${o.max}"` : ''} ${o.readonly ? 'readonly' : ''}>`;
  }
  return `<div class="field ${o.full ? 'full' : ''}" data-field="${o.name}"><label for="${id}">${esc(o.label)}${req}</label>${input}${o.hint ? `<div class="hint">${o.hint}</div>` : ''}</div>`;
}
function readForm(root) {
  const out = {};
  root.querySelectorAll('input[name], select[name], textarea[name]').forEach(el => {
    if (el.type === 'checkbox') out[el.name] = el.checked;
    else if (el.type === 'file') out[el.name] = el.files && el.files[0] ? fileMeta(el.files[0]) : null;
    else out[el.name] = el.value.trim();
  });
  return out;
}
function validateForm(root, extra) {
  let ok = true;
  root.querySelectorAll('.field').forEach(f => { f.classList.remove('invalid'); const e = f.querySelector('.err'); if (e) e.remove(); });
  const fail = (el, msg) => { ok = false; const f = el.closest('.field'); if (f) { f.classList.add('invalid'); f.insertAdjacentHTML('beforeend', `<div class="err">${esc(msg)}</div>`); } };
  root.querySelectorAll('[data-req="1"]').forEach(el => {
    if (el.type === 'file') { if (!el.files || !el.files[0]) fail(el, 'Please select a file.'); }
    else if (!el.value.trim()) fail(el, 'This field is required.');
  });
  if (extra) extra(fail);
  if (!ok) { toast('Please correct the highlighted fields.', 'error'); const first = root.querySelector('.invalid input, .invalid select, .invalid textarea'); if (first) first.focus(); }
  return ok;
}

/* ---------------- List view component (search + filters + table) ---------------- */
const LV = { cfg: {}, state: {} };
function listView(key, cfg) {
  LV.cfg[key] = cfg;
  const st = LV.state[key] = LV.state[key] && !cfg.resetState ? LV.state[key] : { q: '', f: {} };
  if (cfg.initial) Object.keys(cfg.initial).forEach(k => { if (cfg.initial[k] != null && cfg.initial[k] !== '') st.f[k] = cfg.initial[k]; });
  const filters = (cfg.filters || []).filter(f => !f.hidden).map(f => `<select data-lv="${key}" data-lvf="${f.id}" aria-label="${esc(f.label)}">${opts(f.options, st.f[f.id] || '', f.label)}</select>`).join('');
  return `<div class="card" id="lvc-${key}">
    ${cfg.head ? `<div class="card-head"><h2>${cfg.head}</h2>${cfg.headRight || ''}</div>` : ''}
    <div class="toolbar"><div class="search">${icon('search', 'sm')}<input type="search" data-lv="${key}" data-lvf="__q" placeholder="${esc(cfg.placeholder || 'Search…')}" value="${esc(st.q)}" aria-label="Search list"></div>${filters}<span class="tb-count" id="lvn-${key}"></span></div>
    <div id="lvb-${key}">${listBody(key)}</div></div>`;
}
function listRows(key) {
  const cfg = LV.cfg[key], st = LV.state[key];
  let rows = cfg.rows.slice();
  (cfg.filters || []).forEach(f => { const v = st.f[f.id]; if (v) rows = rows.filter(r => f.test(r, v)); });
  if (st.q) { const q = st.q.toLowerCase(); rows = rows.filter(r => cfg.search(r).toLowerCase().includes(q)); }
  return rows;
}
function listBody(key) {
  const cfg = LV.cfg[key];
  const rows = listRows(key);
  setTimeout(() => { const n = document.getElementById('lvn-' + key); if (n) n.textContent = `${rows.length} of ${cfg.rows.length} records`; }, 0);
  if (!rows.length) return `<div class="empty">${icon('search')}<div>${esc(cfg.empty || 'No records match the current search and filters.')}</div></div>`;
  return `<div class="table-wrap"><table class="tbl stackable"><thead><tr>${cfg.columns.map(c => `<th>${esc(c.label)}</th>`).join('')}</tr></thead><tbody>
    ${rows.map(r => `<tr class="${cfg.href ? 'rowlink' : ''} ${cfg.rowClass ? cfg.rowClass(r) : ''}" ${cfg.href ? `data-href="${cfg.href(r)}"` : ''}>${cfg.columns.map(c => `<td data-label="${esc(c.label)}">${c.render(r)}</td>`).join('')}</tr>`).join('')}
  </tbody></table></div>`;
}
function refreshList(key) { const b = document.getElementById('lvb-' + key); if (b) b.innerHTML = listBody(key); }

/* ---------------- Simulated QR identifier ---------------- */
function qrSvg(text) {
  const n = 25; let h = 2166136261; for (const c of text) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
  let cells = '';
  const finder = (x, y) => { cells += `<rect x="${x}" y="${y}" width="7" height="7" fill="#0A2A6B"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#0A2A6B"/>`; };
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const inF = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9); if (!inF && rnd() > .52) cells += `<rect x="${x}" y="${y}" width="1" height="1" fill="#0A2A6B"/>`; }
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
  return `<svg viewBox="-1 -1 ${n + 2} ${n + 2}" shape-rendering="crispEdges" role="img" aria-label="Simulated QR code ${esc(text)}"><rect x="-1" y="-1" width="${n + 2}" height="${n + 2}" fill="#fff"/>${cells}</svg>`;
}

/* ==========================================================================
   COMPLIANCE ENGINE — indicative scores computed from the demo records
   ========================================================================== */
function inSite(rec, siteId) { if (!rec) return false; const org = rec.org || (site(rec.site) || {}).org; if (org && org !== S.ui.org) return false; return !siteId || siteId === 'ALL' || !rec.site || rec.site === 'ALL' || rec.site === siteId; }
const LEGAL_WEIGHT = { 'Compliant': 1, 'Awaiting Verification': .75, 'Partially Compliant': .5, 'Non-Compliant': 0, 'Not Assessed': 0 };
function docIssued(d) { return d.revisions.find(r => r.status === 'Issued for Use'); }
function docLatest(d) { return d.revisions[d.revisions.length - 1]; }
function docStatus(d) { return docLatest(d).status; }
function docActive(d) { return !['Obsolete', 'Archived'].includes(docStatus(d)); }
function docReviewOverdue(d) { return docActive(d) && docIssued(d) && d.nextReview && daysTo(d.nextReview) < 0; }
function actionOpen(a) { return !['Verified', 'Closed'].includes(a.status); }
function actionOverdue(a) { return actionOpen(a) && daysTo(a.due) < 0; }
function trainingStatus(personId, courseId) {
  const recs = S.training.filter(t => t.person === personId && t.course === courseId).sort((a, b) => b.date.localeCompare(a.date));
  if (!recs.length) return { status: 'Missing', rec: null };
  return { status: validity(recs[0].expiry, S.config.notify.trainingLead), rec: recs[0] };
}
function requiredCourses(p) { return S.roleReqs[p.jobTitle] || []; }
function apptStatus(a) { if (!a.accepted) return 'Not accepted'; return validity(a.expiry, S.config.notify.appointmentLead); }
function scheduleFor(assetId) { return S.schedules.filter(s => s.asset === assetId); }
function assetDocStatus(a) {
  const t = byId('assetTypes', a.type); if (!t) return [];
  return t.reqDocs.map(rd => { const c = a.certs.filter(x => x.type === rd.name).sort((x, y) => (y.issued || '').localeCompare(x.issued || ''))[0]; return { req: rd, cert: c || null, status: !c ? 'Missing' : rd.months === 0 ? 'Valid' : validity(c.expiry, S.config.notify.certLead) }; });
}
function assetChecks(a) {
  const docs = assetDocStatus(a);
  const sch = scheduleFor(a.id);
  const checks = docs.map(d => d.status !== 'Missing' && d.status !== 'Expired');
  sch.forEach(s => checks.push(daysTo(s.nextDue) >= 0));
  checks.push(a.status !== 'Out of Service');
  return checks;
}
function compliance(siteId) {
  const legal = S.legal.filter(l => inSite(l, siteId) && l.status !== 'Not Applicable');
  const legalScore = legal.length ? Math.round(legal.reduce((s, l) => s + (LEGAL_WEIGHT[l.status] || 0), 0) / legal.length * 100) : 100;
  const docs = S.documents.filter(d => inSite(d, siteId) && docActive(d) && docIssued(d) && d.reviewMonths);
  const docScore = pct(docs.filter(d => !docReviewOverdue(d)).length, docs.length);
  let tReq = 0, tOk = 0;
  S.people.filter(p => inSite(p, siteId) && p.type !== 'Contractor').forEach(p => requiredCourses(p).forEach(c => { tReq++; const st = trainingStatus(p.id, c).status; if (st === 'Valid' || st === 'Expiring') tOk++; }));
  const appts = S.appointments.filter(a => inSite(a, siteId));
  const apScore = pct(appts.filter(a => ['Valid', 'Expiring'].includes(apptStatus(a))).length, appts.length);
  let aTot = 0, aOk = 0; S.assets.filter(a => inSite(a, siteId) && a.status !== 'Decommissioned').forEach(a => assetChecks(a).forEach(c => { aTot++; if (c) aOk++; }));
  const acts = S.actions.filter(a => inSite(a, siteId) && actionOpen(a));
  const actScore = pct(acts.filter(a => !actionOverdue(a)).length, acts.length);
  const parts = { legal: legalScore, documents: docScore, training: pct(tOk, tReq), appointments: apScore, assets: pct(aOk, aTot), actions: actScore };
  const w = S.config.complianceWeights; let tw = 0, ts = 0; Object.keys(parts).forEach(k => { tw += Number(w[k]); ts += parts[k] * Number(w[k]); });
  return { overall: Math.round(ts / tw), parts, legalCounts: countBy(legal, 'status'), openActions: acts.length, overdueActions: acts.filter(actionOverdue).length };
}
function countBy(arr, key) { const o = {}; arr.forEach(x => { const k = typeof key === 'function' ? key(x) : x[key]; o[k] = (o[k] || 0) + 1; }); return o; }
function scoreColour(v) { return v >= 85 ? 'green' : v >= 70 ? 'amber' : 'red'; }
const PART_LABELS = { legal: 'Legal compliance', documents: 'Document reviews current', training: 'Training valid', appointments: 'Appointments valid', assets: 'Asset certificates & inspections', actions: 'Actions on schedule' };
const PART_LINKS = { legal: '#/legal', documents: '#/documents?review=overdue', training: '#/people/matrix', appointments: '#/people/appointments', assets: '#/assets', actions: '#/actions?status=overdue' };

/* ==========================================================================
   NOTIFICATION ENGINE — rule-based alerts derived from the live demo data
   ========================================================================== */
function buildNotifs() {
  const n = [], cfg = S.config.notify, cats = cfg.categories;
  const push = (o) => { if (cats[o.cat] !== false) n.push(o); };
  // Documents
  S.documents.filter(d => inSite(d, S.ui.site) && docActive(d) && docIssued(d) && d.nextReview).forEach(d => {
    const dd = daysTo(d.nextReview);
    if (dd < 0) push({ key: 'doc-od-' + d.id + d.nextReview, sev: 'red', cat: 'documents', title: `Document review overdue: ${d.number}`, text: `${d.title} was due for review ${-dd} days ago.`, link: '#/documents/' + d.id, date: d.nextReview, site: d.site });
    else if (dd <= cfg.docReviewLead) push({ key: 'doc-up-' + d.id + d.nextReview, sev: 'amber', cat: 'documents', title: `Document review due: ${d.number}`, text: `${d.title} is due for review in ${dd} days.`, link: '#/documents/' + d.id, date: d.nextReview, site: d.site });
  });
  S.documents.filter(d => inSite(d, S.ui.site) && ['Submitted for Review', 'Under Review', 'Resubmitted', 'Approved'].includes(docStatus(d))).forEach(d => {
    const r = docLatest(d);
    push({ key: 'doc-ap-' + d.id + r.rev + '-' + r.draft + r.status, sev: 'blue', cat: 'documents', title: r.status === 'Approved' ? `Approved — awaiting issue: ${d.number}` : `Document awaiting ${r.status === 'Under Review' ? 'review decision' : 'review'}: ${d.number}`, text: `${d.title} — ${revLabel(r)}.`, link: '#/documents/' + d.id, date: r.date, site: d.site, task: true, owner: r.status === 'Approved' ? r.approver : r.reviewer });
  });
  // Legal
  S.legal.filter(l => inSite(l, S.ui.site) && l.status !== 'Not Applicable').forEach(l => {
    const dd = daysTo(l.nextReview);
    if (dd != null && dd < 0) push({ key: 'leg-od-' + l.id + l.nextReview, sev: 'red', cat: 'legal', title: `Legal assessment overdue: ${l.id}`, text: `${l.reference} (${sname(l.site)}) — assessment was due ${fmt(l.nextReview)}.`, link: '#/legal/' + l.id, date: l.nextReview, site: l.site, owner: l.responsible });
    else if (dd != null && dd <= cfg.legalLead) push({ key: 'leg-up-' + l.id + l.nextReview, sev: 'amber', cat: 'legal', title: `Legal assessment due: ${l.id}`, text: `${l.reference} (${sname(l.site)}) due ${fmt(l.nextReview)}.`, link: '#/legal/' + l.id, date: l.nextReview, site: l.site, owner: l.responsible });
  });
  // People
  S.appointments.filter(a => inSite(a, S.ui.site)).forEach(a => {
    const st = apptStatus(a);
    if (st === 'Expired') push({ key: 'app-ex-' + a.id + a.expiry, sev: 'red', cat: 'people', title: `Appointment expired: ${a.type}`, text: `${pname(a.person)} (${sname(a.site)}) — expired ${fmt(a.expiry)}.`, link: '#/people/appointments?id=' + a.id, date: a.expiry, site: a.site });
    else if (st === 'Expiring') push({ key: 'app-up-' + a.id + a.expiry, sev: 'amber', cat: 'people', title: `Appointment expiring: ${a.type}`, text: `${pname(a.person)} (${sname(a.site)}) — expires ${fmt(a.expiry)}.`, link: '#/people/appointments?id=' + a.id, date: a.expiry, site: a.site });
    else if (st === 'Not accepted') push({ key: 'app-na-' + a.id, sev: 'amber', cat: 'people', title: `Appointment not accepted: ${a.type}`, text: `${pname(a.person)} has not signed acceptance.`, link: '#/people/appointments?id=' + a.id, date: a.date, site: a.site });
  });
  S.people.filter(p => inSite(p, S.ui.site)).forEach(p => requiredCourses(p).forEach(c => {
    const t = trainingStatus(p.id, c); const crs = byId('courses', c);
    if (t.status === 'Expired') push({ key: 'trn-ex-' + p.id + c + t.rec.expiry, sev: 'red', cat: 'people', title: `Training expired: ${crs.name}`, text: `${p.name} (${sname(p.site)}) — expired ${fmt(t.rec.expiry)}.`, link: '#/people/' + p.id, date: t.rec.expiry, site: p.site });
    else if (t.status === 'Expiring') push({ key: 'trn-up-' + p.id + c + t.rec.expiry, sev: 'amber', cat: 'people', title: `Training expiring: ${crs.name}`, text: `${p.name} (${sname(p.site)}) — expires ${fmt(t.rec.expiry)}.`, link: '#/people/' + p.id, date: t.rec.expiry, site: p.site });
  }));
  // Assets: inspections, maintenance, defects, certificates
  S.schedules.filter(s => inSite(s, S.ui.site)).forEach(s => {
    const dd = daysTo(s.nextDue), t = byId('templates', s.template);
    if (dd < 0) push({ key: 'ins-od-' + s.id + s.nextDue, sev: 'red', cat: 'assets', title: `Inspection overdue: ${s.target}`, text: `${t.title} was due ${fmt(s.nextDue)}.`, link: '#/inspect/' + s.id, date: s.nextDue, site: s.site, task: true, owner: s.assignee });
    else if (dd <= cfg.inspectionLead) push({ key: 'ins-up-' + s.id + s.nextDue, sev: 'amber', cat: 'assets', title: `Inspection due: ${s.target}`, text: `${t.title} due ${fmt(s.nextDue)}.`, link: '#/inspect/' + s.id, date: s.nextDue, site: s.site, task: true, owner: s.assignee });
  });
  S.maintenance.filter(m => !m.completed && inSite(byId('assets', m.asset), S.ui.site)).forEach(m => {
    const a = byId('assets', m.asset), dd = daysTo(m.due);
    if (dd < 0) push({ key: 'mt-od-' + m.id, sev: 'red', cat: 'assets', title: `Maintenance overdue: ${a.tag}`, text: `${m.description} — due ${fmt(m.due)}.`, link: '#/assets/' + a.id + '?tab=maintenance', date: m.due, site: a.site, owner: m.by });
    else if (dd <= cfg.maintenanceLead) push({ key: 'mt-up-' + m.id + m.due, sev: 'amber', cat: 'assets', title: `Maintenance due: ${a.tag}`, text: `${m.description} — due ${fmt(m.due)}.`, link: '#/assets/' + a.id + '?tab=maintenance', date: m.due, site: a.site, owner: m.by });
  });
  S.defects.filter(d => d.status !== 'Closed' && d.severity === 'Critical' && inSite(byId('assets', d.asset), S.ui.site)).forEach(d => {
    const a = byId('assets', d.asset);
    push({ key: 'df-' + d.id, sev: 'red', cat: 'assets', title: `Critical defect: ${a.tag} ${a.status === 'Out of Service' ? '— OUT OF SERVICE' : ''}`, text: d.description, link: '#/assets/' + a.id + '?tab=defects', date: d.reported, site: a.site });
  });
  S.assets.filter(a => inSite(a, S.ui.site)).forEach(a => assetDocStatus(a).forEach(ds => {
    if (ds.status === 'Expired') push({ key: 'cert-ex-' + a.id + ds.req.name + (ds.cert && ds.cert.expiry), sev: 'red', cat: 'assets', title: `Certificate expired: ${a.tag}`, text: `${ds.req.name} expired ${fmt(ds.cert.expiry)}.`, link: '#/assets/' + a.id + '?tab=documents', date: ds.cert.expiry, site: a.site });
    else if (ds.status === 'Expiring') push({ key: 'cert-up-' + a.id + ds.req.name + ds.cert.expiry, sev: 'amber', cat: 'assets', title: `Certificate expiring: ${a.tag}`, text: `${ds.req.name} expires ${fmt(ds.cert.expiry)}.`, link: '#/assets/' + a.id + '?tab=documents', date: ds.cert.expiry, site: a.site });
    else if (ds.status === 'Missing' && ds.req.months > 0) push({ key: 'cert-mi-' + a.id + ds.req.name, sev: 'red', cat: 'assets', title: `Required document missing: ${a.tag}`, text: `${ds.req.name} not on file.`, link: '#/assets/' + a.id + '?tab=documents', date: TODAY, site: a.site });
  }));
  // Chemicals
  S.chemicals.filter(c => inSite(c, S.ui.site)).forEach(c => {
    const dd = daysTo(c.sdsReviewDue);
    if (!c.sds) push({ key: 'sds-mi-' + c.id + (c.sdsReviewDue || ''), sev: 'red', cat: 'chemicals', title: `SDS not on file: ${c.name}`, text: `${sname(c.site)} — obtain supplier SDS and link it in Document Control.`, link: '#/chemicals/' + c.id, date: c.sdsReviewDue || TODAY, site: c.site });
    else if (dd < 0) push({ key: 'sds-od-' + c.id + c.sdsReviewDue, sev: 'red', cat: 'chemicals', title: `SDS review overdue: ${c.name}`, text: `${sname(c.site)} — SDS review was due ${fmt(c.sdsReviewDue)}.`, link: '#/chemicals/' + c.id, date: c.sdsReviewDue, site: c.site });
    else if (dd <= cfg.docReviewLead) push({ key: 'sds-up-' + c.id + c.sdsReviewDue, sev: 'amber', cat: 'chemicals', title: `SDS review due: ${c.name}`, text: `${sname(c.site)} — due ${fmt(c.sdsReviewDue)}.`, link: '#/chemicals/' + c.id, date: c.sdsReviewDue, site: c.site });
  });
  // Emergency drills
  S.drills.filter(d => d.status === 'Scheduled' && inSite(d, S.ui.site)).forEach(d => {
    const dd = daysTo(d.scheduled);
    if (dd < 0) push({ key: 'dr-od-' + d.id + d.scheduled, sev: 'red', cat: 'emergency', title: `Emergency drill overdue: ${sname(d.site)}`, text: `${d.type} drill was scheduled for ${fmt(d.scheduled)}.`, link: '#/emergency/drills?id=' + d.id, date: d.scheduled, site: d.site });
    else if (dd <= cfg.drillLead) push({ key: 'dr-up-' + d.id + d.scheduled, sev: 'amber', cat: 'emergency', title: `Emergency drill due: ${sname(d.site)}`, text: `${d.type} drill scheduled for ${fmt(d.scheduled)}.`, link: '#/emergency/drills?id=' + d.id, date: d.scheduled, site: d.site });
  });
  // Incidents
  S.incidents.filter(i => inSite(i, S.ui.site) && ['Reported', 'Under Investigation'].includes(i.status)).forEach(i => {
    push({ key: 'inc-' + i.id + i.status, sev: i.status === 'Reported' ? 'red' : 'amber', cat: 'incidents', title: i.status === 'Reported' ? `Incident awaiting investigation: ${i.id}` : `Investigation in progress: ${i.id}`, text: `${i.title} (${sname(i.site)}).`, link: '#/incidents/' + i.id, date: i.date, site: i.site, task: true, owner: i.investigator });
  });
  // Actions
  S.actions.filter(a => inSite(a, S.ui.site)).forEach(a => {
    if (actionOverdue(a)) push({ key: 'act-od-' + a.id + a.due + a.status, sev: 'red', cat: 'actions', title: `Action overdue: ${a.id}${a.escalated ? ' (escalated)' : ''}`, text: `${a.title} — owner ${pname(a.owner)}, due ${fmt(a.due)}.`, link: '#/actions/' + a.id, date: a.due, site: a.site, task: true, owner: a.owner });
    if (a.status === 'Submitted for Verification') push({ key: 'act-ver-' + a.id + (a.history.length), sev: 'blue', cat: 'actions', title: `Action awaiting verification: ${a.id}`, text: `${a.title} — evidence submitted by ${pname(a.owner)}.`, link: '#/actions/' + a.id, date: a.due, site: a.site, task: true, verify: true });
  });
  // Event notifications (from user activity)
  S.events.filter(e => e.org === S.ui.org && (S.ui.site === 'ALL' || e.site === 'ALL' || e.site === S.ui.site)).forEach(e => n.push(e));
  const sevRank = { red: 0, amber: 1, blue: 2, green: 3 };
  return n.sort((a, b) => (sevRank[a.sev] - sevRank[b.sev]) || String(a.date).localeCompare(String(b.date)));
}
function myTasks() {
  const uid = S.ui.user, out = [];
  S.actions.filter(a => inSite(a, S.ui.site) && actionOpen(a) && a.owner === uid).forEach(a => out.push({ title: `${a.id}: ${a.title}`, sub: `Action · ${a.status} · due ${fmt(a.due)}`, link: '#/actions/' + a.id, sev: actionOverdue(a) ? 'red' : 'blue' }));
  if (can('action.verify')) S.actions.filter(a => inSite(a, S.ui.site) && a.status === 'Submitted for Verification' && a.owner !== uid).forEach(a => out.push({ title: `Verify ${a.id}: ${a.title}`, sub: `Evidence submitted by ${pname(a.owner)}`, link: '#/actions/' + a.id, sev: 'blue' }));
  S.documents.filter(d => inSite(d, S.ui.site)).forEach(d => { const r = docLatest(d);
    if (['Submitted for Review', 'Resubmitted', 'Under Review'].includes(r.status) && (r.reviewer === uid || r.approver === uid)) out.push({ title: `Review ${d.number}: ${d.title}`, sub: `${revLabel(r)} · ${r.status}`, link: '#/documents/' + d.id, sev: 'blue' });
    if (r.status === 'Approved' && can('doc.issue')) out.push({ title: `Issue ${d.number}: ${d.title}`, sub: `${revLabel(r)} approved — not yet issued`, link: '#/documents/' + d.id, sev: 'blue' });
    if (r.status === 'Returned for Correction' && r.author === uid) out.push({ title: `Correct ${d.number}`, sub: 'Returned for correction', link: '#/documents/' + d.id, sev: 'amber' });
  });
  S.schedules.filter(s => inSite(s, S.ui.site) && s.assignee === uid && daysTo(s.nextDue) <= 7).forEach(s => out.push({ title: `Inspect: ${s.target}`, sub: `Due ${fmt(s.nextDue)}`, link: '#/inspect/' + s.id, sev: daysTo(s.nextDue) < 0 ? 'red' : 'amber' }));
  S.incidents.filter(i => inSite(i, S.ui.site) && i.investigator === uid && !['Closed'].includes(i.status)).forEach(i => out.push({ title: `Investigate ${i.id}: ${i.title}`, sub: i.status, link: '#/incidents/' + i.id, sev: 'amber' }));
  S.legal.filter(l => inSite(l, S.ui.site) && l.responsible === uid && l.nextReview && daysTo(l.nextReview) < 30 && l.status !== 'Not Applicable').forEach(l => out.push({ title: `Assess ${l.id}: ${l.reference}`, sub: `Due ${fmt(l.nextReview)}`, link: '#/legal/' + l.id, sev: daysTo(l.nextReview) < 0 ? 'red' : 'amber' }));
  return out;
}

/* ==========================================================================
   CENTRAL ACTION (CAPA) WORKFLOW
   Created → Assigned → Acknowledged → In Progress → Submitted for Verification
   → Verified → Closed   (+ Rejected, Reopened, overdue escalation)
   ========================================================================== */
const ACTION_FLOW = ['Created', 'Assigned', 'Acknowledged', 'In Progress', 'Submitted for Verification', 'Verified', 'Closed'];
const SOURCE_MODULES = ['Legal', 'Risk Assessment', 'Audit', 'Inspection', 'Incident', 'Asset Defect', 'Maintenance', 'Training', 'Document Review', 'Chemical', 'Emergency Drill'];
function sourceLink(a) {
  const m = { 'Legal': ['legal', '#/legal/'], 'Risk Assessment': ['risks', '#/risks/'], 'Inspection': ['inspections', '#/inspections/'], 'Incident': ['incidents', '#/incidents/'], 'Asset Defect': ['defects', null], 'Maintenance': ['maintenance', null], 'Training': ['people', '#/people/'], 'Document Review': ['documents', '#/documents/'], 'Chemical': ['chemicals', '#/chemicals/'], 'Emergency Drill': ['drills', null], 'Audit': ['findings', null] }[a.source];
  if (!m) return esc(a.sourceId || '—');
  let href = m[1] ? m[1] + a.sourceId : null;
  if (a.source === 'Asset Defect') { const d = byId('defects', a.sourceId); href = d ? '#/assets/' + d.asset + '?tab=defects' : null; }
  if (a.source === 'Maintenance') { const d = byId('maintenance', a.sourceId); href = d ? '#/assets/' + d.asset + '?tab=maintenance' : null; }
  if (a.source === 'Emergency Drill') href = '#/emergency/drills?id=' + a.sourceId;
  if (a.source === 'Audit') { const f = byId('findings', a.sourceId); href = f ? '#/audits/' + f.audit : null; }
  return href ? `<a href="${href}">${esc(a.sourceId)}</a>` : esc(a.sourceId);
}
function createAction(o) {
  const id = nextId('ACT-', 'actions', 4, 1000);
  const site = o.site || defaultSite();
  const a = { id, org: (siteOrgOf(site)), title: o.title, action: o.action, source: o.source, sourceId: o.sourceId, priority: o.priority || 'Medium', site, owner: o.owner || '', createdBy: S.ui.user, created: TODAY, due: o.due || addDays(TODAY, (S.config.priorities.find(p => p.name === (o.priority || 'Medium')) || { days: 30 }).days), status: 'Created', progress: [], evidence: [], verification: null, closed: null, escalated: false, history: [{ ts: nowTs(), by: S.ui.user, action: 'Created', from: '', to: '', comment: o.comment || '' }] };
  if (a.owner) { a.status = 'Assigned'; a.history.push({ ts: nowTs(), by: S.ui.user, action: 'Assigned', from: '', to: a.owner, comment: '' }); addEvent('blue', 'actions', `Action assigned: ${a.id}`, `${pname(a.owner)} was assigned "${a.title}" (simulated notification — no email sent).`, '#/actions/' + a.id, a.site); }
  S.actions.push(a);
  log(`Raised ${a.id} from ${a.source} ${a.sourceId || ''}: ${a.title}`, '#/actions/' + a.id);
  return a;
}
function siteOrgOf(siteId) { if (!siteId || siteId === 'ALL') return S.ui.org; const s = site(siteId); return s ? s.org : S.ui.org; }
function actionTransition(a, to, comment, extra = {}) {
  const from = a.status; a.status = to;
  a.history.push({ ts: nowTs(), by: S.ui.user, action: extra.label || to, from, to: extra.toWho || '', comment: comment || '' });
  if (to === 'Closed') a.closed = TODAY;
  if (to === 'Reopened') { a.closed = null; a.verification = null; }
  onActionStatus(a, to, from);
  save();
}
/* Cross-module consequences of action status changes */
function onActionStatus(a, to) {
  const otherOpen = (pred) => S.actions.some(x => x.id !== a.id && pred(x) && actionOpen(x));
  if (a.source === 'Legal') {
    const l = byId('legal', a.sourceId); if (!l) return;
    if (to === 'Submitted for Verification' && l.status !== 'Awaiting Verification') { a.prevLegalStatus = l.status; l.status = 'Awaiting Verification'; l.assessments.unshift({ date: TODAY, by: S.ui.user, status: 'Awaiting Verification', note: `Evidence submitted on ${a.id}.` }); log(`${l.id} status → Awaiting Verification (evidence on ${a.id})`, '#/legal/' + l.id); }
    if (to === 'Rejected' && l.status === 'Awaiting Verification') { l.status = a.prevLegalStatus || 'Partially Compliant'; l.assessments.unshift({ date: TODAY, by: S.ui.user, status: l.status, note: `Evidence on ${a.id} not accepted — status reverted.` }); }
    if (to === 'Verified' && !otherOpen(x => x.source === 'Legal' && x.sourceId === l.id)) {
      l.status = 'Compliant'; l.lastReviewed = TODAY; l.nextReview = addMonths(TODAY, l.freq || 12); l.gaps = '';
      (a.evidence || []).forEach(e => l.evidence.unshift({ name: e.name, date: TODAY, by: a.owner, note: `Verified evidence from ${a.id}` }));
      l.assessments.unshift({ date: TODAY, by: S.ui.user, status: 'Compliant', note: `Corrective action ${a.id} verified; requirement re-assessed as Compliant. Next review ${fmt(l.nextReview)}.` });
      log(`${l.id} updated to Compliant following verification of ${a.id}`, '#/legal/' + l.id);
      toast(`Linked requirement ${l.id} updated to <b>Compliant</b>; next review ${fmt(l.nextReview)}.`, 'info');
    }
    if (to === 'Reopened') { l.status = 'Partially Compliant'; l.assessments.unshift({ date: TODAY, by: S.ui.user, status: 'Partially Compliant', note: `${a.id} reopened.` }); }
  }
  if (a.source === 'Risk Assessment') {
    const r = byId('risks', a.sourceId); if (!r) return;
    const c = r.controls.find(x => x.action === a.id);
    if (to === 'Verified' && c) { c.status = 'Implemented'; c.implemented = TODAY; r.needsReview = true; r.history.unshift({ ts: nowTs(), by: S.ui.user, action: `Control "${c.text}" implemented (verified via ${a.id})`, comment: 'Residual risk and review date to be re-assessed.' }); toast(`Control on ${r.id} marked <b>Implemented</b>. Review the assessment to update residual risk.`, 'info'); }
    if (to === 'Reopened' && c) { c.status = 'Planned'; }
  }
  if (a.source === 'Asset Defect' || a.source === 'Inspection' || a.source === 'Maintenance') {
    const d = S.defects.find(x => x.action === a.id);
    if (d && to === 'Submitted for Verification') d.status = 'Repaired – awaiting verification';
    if (d && to === 'Verified') { d.status = 'Closed'; d.closed = TODAY; const as = byId('assets', d.asset); if (as) assetHistory(as, `Defect ${d.id} closed — corrective action ${a.id} verified by ${pname(S.ui.user)}`); }
    if (d && to === 'Rejected') d.status = 'Action Raised';
  }
  if (a.source === 'Incident') {
    const i = byId('incidents', a.sourceId); if (!i) return;
    if (to === 'Verified' && !otherOpen(x => x.source === 'Incident' && x.sourceId === i.id) && i.status === 'Actions in Progress') { i.status = 'Awaiting Closure'; i.history.push({ ts: nowTs(), by: S.ui.user, action: 'All corrective actions verified — awaiting closure review', comment: '' }); toast(`All actions for ${i.id} verified — incident ready for closure review.`, 'info'); }
    if (to === 'Reopened' && ['Awaiting Closure', 'Closed'].includes(i.status)) i.status = 'Actions in Progress';
  }
  if (a.source === 'Chemical' && to === 'Verified') { const c = byId('chemicals', a.sourceId); if (c) log(`Chemical ${c.name}: action ${a.id} verified`, '#/chemicals/' + c.id); }
}
function assetHistory(asset, text) { asset.history = asset.history || []; asset.history.unshift({ ts: nowTs(), by: S.ui.user, text }); }

/* Action modal: raise a corrective action from any module */
function raiseActionModal(o, after) {
  const pri = S.config.priorities;
  openModal({ title: 'Raise corrective action', sub: `Source: ${esc(o.source)} ${esc(o.sourceId || '')} — the action is recorded in the central action register.`, body: `<div class="form-grid">
      ${fld({ name: 'title', label: 'Finding / problem', value: o.title || '', required: true, full: true })}
      ${fld({ name: 'action', label: 'Required corrective action', type: 'textarea', value: o.action || '', required: true, full: true })}
      ${fld({ name: 'priority', label: 'Priority', type: 'select', options: opts(pri.map(p => ({ value: p.name, label: `${p.name} (${p.days} days)` })), o.priority || 'Medium'), required: true })}
      ${fld({ name: 'site', label: 'Site', type: 'select', options: siteOptions(o.site || defaultSite(), false), required: true })}
      ${fld({ name: 'owner', label: 'Responsible owner', type: 'select', options: personOptions(o.owner), required: true, hint: 'The owner is notified (simulated in-app notification).' })}
      ${fld({ name: 'due', label: 'Due date', type: 'date', value: o.due || addDays(TODAY, 30), required: true })}
    </div>`,
    onOpen: (m) => { m.querySelector('[name=priority]').addEventListener('change', e => { const p = pri.find(x => x.name === e.target.value); m.querySelector('[name=due]').value = addDays(TODAY, p.days); }); },
    buttons: [{ label: 'Raise action', cls: 'primary', onClick: (m) => {
      if (!validateForm(m, (fail) => { const due = m.querySelector('[name=due]'); if (due.value && due.value < TODAY) fail(due, 'Due date cannot be in the past.'); })) return false;
      const v = readForm(m); const a = createAction(Object.assign({}, o, v));
      save(); toast(`${a.id} raised and assigned to ${esc(pname(a.owner))}.`); if (after) after(a); else rerender();
    } }]
  });
}

/* ==========================================================================
   SHELL: sidebar, topbar, routing
   ========================================================================== */
const NAV = [
  { group: 'Overview', items: [['dashboard', 'Dashboard', 'dashboard'], ['notifications', 'Notifications & Tasks', 'bell']] },
  { group: 'Establish & control', items: [['documents', 'Document Control', 'docs'], ['legal', 'Legal Compliance', 'scale'], ['risks', 'Risk Management', 'risk'], ['people', 'People & Competency', 'people']] },
  { group: 'Operational safety', items: [['assets', 'Assets & Equipment', 'forklift'], ['maintenance', 'Maintenance & Defects', 'wrench'], ['ppe', 'PPE Management', 'hardhat'], ['chemicals', 'Hazardous Chemicals', 'flask'], ['emergency', 'Emergency Preparedness', 'siren']] },
  { group: 'Monitor & correct', items: [['incidents', 'Incidents & Injuries', 'alert'], ['audits', 'Audits & Inspections', 'clipboard'], ['actions', 'Actions (CAPA)', 'target']] },
  { group: 'Assurance', items: [['reports', 'Management Reports', 'chart']] },
  { group: 'Administration', items: [['admin', 'Administration', 'settings']] }
];
function navCounts() {
  const c = {};
  c.actions = S.actions.filter(a => inSite(a, S.ui.site) && actionOverdue(a)).length;
  c.notifications = buildNotifs().filter(n => !S.readNotifs[n.key]).length;
  c.incidents = S.incidents.filter(i => inSite(i, S.ui.site) && i.status === 'Reported').length;
  c.documents = S.documents.filter(d => inSite(d, S.ui.site) && ['Submitted for Review', 'Under Review', 'Resubmitted'].includes(docStatus(d))).length;
  return c;
}
function renderSidebar(active) {
  const cnt = navCounts(), u = me();
  const sites = orgSites();
  return `<div class="sb-brand"><div class="logo-mark">VDW</div><div class="logo-text"><b>VDW HSEQ</b><span>Management System · Prototype</span></div></div>
  <div class="sb-scope">
    <label for="orgSel">Organisation</label>
    <select id="orgSel">${S.orgs.map(o => `<option value="${o.id}" ${o.id === S.ui.org ? 'selected' : ''}>${esc(o.short)}</option>`).join('')}</select>
    <label for="siteSel">Branch / site</label>
    <select id="siteSel"><option value="ALL">All branches (organisation view)</option>${sites.map(s => `<option value="${s.id}" ${s.id === S.ui.site ? 'selected' : ''}>${esc(s.short)}</option>`).join('')}</select>
  </div>
  <nav class="sb-nav" aria-label="Main navigation">
    ${NAV.map((g, gi) => `<div class="nav-group ${S.ui.navCollapsed && S.ui.navCollapsed[gi] ? 'collapsed' : ''}"><button class="nav-group-title" data-act="toggleNavGroup" data-g="${gi}" aria-expanded="${!(S.ui.navCollapsed && S.ui.navCollapsed[gi])}">${esc(g.group)} ${icon('chevron')}</button><div class="nav-items">
      ${g.items.map(([k, label, ic]) => `<a class="nav-item ${active === k ? 'active' : ''}" href="#/${k}">${icon(ic)}<span>${esc(label)}</span>${cnt[k] ? `<span class="count" title="${k === 'actions' ? 'Overdue actions' : k === 'notifications' ? 'Unread' : 'Requires attention'}">${cnt[k]}</span>` : ''}</a>`).join('')}
    </div></div>`).join('')}
  </nav>
  <div class="sb-user"><div class="avatar">${initials(u.name)}</div><div class="who"><b>${esc(u.name)}</b><span>${esc(u.sysRole)}</span></div></div>`;
}
function renderTopbar(crumbs) {
  const notifs = buildNotifs(); const unread = notifs.filter(n => !S.readNotifs[n.key]).length; const tasks = myTasks().length; const u = me();
  return `<button class="icon-btn menu-btn" data-act="toggleNav" aria-label="Open menu">${icon('menu')}</button>
  <div class="crumbs">${crumbs.map((c, i) => i < crumbs.length - 1 ? `<a href="${c[1]}">${esc(c[0])}</a>${icon('chevronR', 'sm')}` : `<b>${esc(c[0])}</b>`).join('')}</div>
  <div class="top-search">${icon('search', 'sm')}<input id="globalSearch" type="search" placeholder="Search records, IDs, people, assets…" autocomplete="off" aria-label="Global search"><div class="search-results hidden" id="searchResults"></div></div>
  <button class="icon-btn" data-act="openTasks" title="My tasks requiring attention" aria-label="My tasks">${icon('tasks')}${tasks ? `<span class="dot orange">${tasks}</span>` : ''}</button>
  <button class="icon-btn" data-act="openNotifs" title="Notifications" aria-label="Notifications">${icon('bell')}${unread ? `<span class="dot">${unread > 99 ? '99+' : unread}</span>` : ''}</button>
  <button class="user-menu-btn" data-act="userMenu" aria-label="User menu"><span class="avatar sm">${initials(u.name)}</span><span class="um-text">${esc(u.name)}<span>${esc(u.sysRole)}</span></span>${icon('chevron', 'sm')}</button>`;
}
function parseHash() {
  const h = location.hash.replace(/^#\/?/, '') || 'dashboard';
  const [path, qs] = h.split('?'); const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  const q = {}; if (qs) qs.split('&').forEach(kv => { const [k, v] = kv.split('='); q[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
  return { parts, q };
}
function navigate(h) { if (location.hash === h) rerender(); else location.hash = h; }
let lastRoute = '';
function rerender(keepScroll = true) {
  const { parts, q } = parseHash(); const key = parts[0] || 'dashboard';
  const fn = ROUTES[key] || ROUTES.notfound;
  let page;
  try { page = fn(parts.slice(1), q); }
  catch (e) { console.error(e); page = { title: 'Error', crumbs: [['Error', '#']], html: `<div class="alert danger">${icon('alert')}<div>Something went wrong rendering this page: ${esc(e.message)}</div></div>` }; }
  const routeId = location.hash.split('?')[0];
  const y = window.scrollY;
  document.getElementById('sidebar').innerHTML = renderSidebar(page.nav || key);
  document.getElementById('topbar').innerHTML = renderTopbar(page.crumbs || [[page.title, '#']]);
  document.getElementById('content').innerHTML = page.html;
  document.title = (page.title ? page.title + ' · ' : '') + 'VDW HSEQ (Prototype)';
  if (page.after) page.after();
  if (routeId !== lastRoute) { window.scrollTo(0, 0); lastRoute = routeId; } else if (keepScroll) window.scrollTo(0, y);
  document.body.classList.remove('nav-open');
}
function pageHead(title, lead, actions = '', extra = '') {
  return `<div class="page-head"><div class="ph-text"><h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}${extra}</div>${actions ? `<div class="ph-actions">${actions}</div>` : ''}</div>`;
}
function tabsHtml(base, tabs, active) { return `<div class="tabs" role="tablist">${tabs.map(t => `<a role="tab" href="${base.endsWith('=') ? base + t[0] : base + '/' + t[0]}" class="${t[0] === active ? 'active' : ''}">${esc(t[1])}${t[2] ? `<span class="tc ${t[3] || ''}">${t[2]}</span>` : ''}</a>`).join('')}</div>`; }
function noPerm(perm) { const d = S.permissionDefs.find(p => p[0] === perm); return `Your demo role (${myRole().name}) does not have the "${d ? d[1] : perm}" permission. Switch user from the user menu to try another role.`; }
function permBtn(perm, html) { return can(perm) ? html : html.replace('<button', `<button disabled title="${esc(noPerm(perm))}"`); }

/* ---------------- Global event delegation ---------------- */
document.addEventListener('click', (e) => {
  const actEl = e.target.closest('[data-act]');
  if (actEl) {
    if (actEl.disabled) { toast(actEl.title || 'Not permitted for this role.', 'error'); return; }
    const fn = ACT[actEl.dataset.act];
    if (fn) { e.preventDefault(); fn(actEl, e); return; }
  }
  const row = e.target.closest('tr[data-href]');
  if (row && !e.target.closest('a, button, input, select, label')) { navigate(row.dataset.href); return; }
  if (!e.target.closest('.dropdown') && !e.target.closest('[data-act=userMenu]')) document.querySelectorAll('.dropdown').forEach(d => d.remove());
  if (!e.target.closest('.top-search')) { const r = document.getElementById('searchResults'); if (r) r.classList.add('hidden'); }
});
document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset && el.dataset.lv) { const st = LV.state[el.dataset.lv]; if (el.dataset.lvf === '__q') st.q = el.value; else st.f[el.dataset.lvf] = el.value; refreshList(el.dataset.lv); }
  if (el.id === 'globalSearch') globalSearch(el.value);
});
document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.id === 'orgSel') { S.ui.org = el.value; S.ui.site = 'ALL'; save(); toast(`Switched to ${esc(orgOf(el.value).name)}.`, 'info'); if (parseHash().parts.length > 1) navigate('#/dashboard'); else rerender(); }
  if (el.id === 'siteSel') { S.ui.site = el.value; save(); toast(el.value === 'ALL' ? 'Showing organisation-wide view (all branches).' : `Showing branch: ${esc(site(el.value).name)}.`, 'info'); rerender(); }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalStack.length) closeModal();
  if (e.key === 'Enter' && e.target.id === 'globalSearch') { const first = document.querySelector('#searchResults a'); if (first) { navigate(first.getAttribute('href')); document.getElementById('searchResults').classList.add('hidden'); } }
  if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) { const g = document.getElementById('globalSearch'); if (g) { e.preventDefault(); g.focus(); } }
});
window.addEventListener('hashchange', () => rerender(false));

ACT.toggleNav = () => document.body.classList.toggle('nav-open');
ACT.toggleNavGroup = (el) => { const g = el.dataset.g; S.ui.navCollapsed = S.ui.navCollapsed || {}; S.ui.navCollapsed[g] = !S.ui.navCollapsed[g]; save(); el.closest('.nav-group').classList.toggle('collapsed'); };
ACT.openNotifs = () => navigate('#/notifications');
ACT.openTasks = () => navigate('#/notifications/tasks');
ACT.go = (el) => navigate(el.dataset.href);
ACT.print = () => window.print();
ACT.userMenu = (el) => {
  document.querySelectorAll('.dropdown').forEach(d => d.remove());
  const r = el.getBoundingClientRect(); const dd = document.createElement('div'); dd.className = 'dropdown';
  dd.style.top = (r.bottom + 6) + 'px'; dd.style.right = Math.max(8, window.innerWidth - r.right) + 'px'; dd.style.position = 'fixed';
  const users = S.people.filter(p => p.sysRole);
  dd.innerHTML = `<div class="dd-head">Switch demo user (role)</div>
    ${users.map(u => `<button class="dd-item ${u.id === S.ui.user ? 'current' : ''}" data-act="switchUser" data-id="${u.id}"><span class="avatar sm">${initials(u.name)}</span><span><b>${esc(u.name)}</b><br><small>${esc(u.sysRole)} · ${esc(orgOf(u.org).short)} · ${esc(sname(u.site))}</small></span></button>`).join('')}
    <hr><button class="dd-item" data-act="go" data-href="#/admin/roles">${icon('lock', 'sm')} Roles & permissions</button>
    <button class="dd-item" data-act="resetDemo">${icon('refresh', 'sm')} Reset demo data</button>
    <div class="dd-head" style="text-transform:none;letter-spacing:0">Prototype only — no real sign-in. Role switching demonstrates intended permissions; production enforces access on the server.</div>`;
  dd.style.maxHeight = '75vh'; dd.style.overflowY = 'auto';
  document.body.appendChild(dd);
};
ACT.switchUser = (el) => { const p = person(el.dataset.id); S.ui.user = p.id; if (p.org !== S.ui.org) { S.ui.org = p.org; S.ui.site = 'ALL'; } save(); document.querySelectorAll('.dropdown').forEach(d => d.remove()); toast(`Now acting as <b>${esc(p.name)}</b> (${esc(p.sysRole)}).`, 'info'); rerender(); };
ACT.resetDemo = () => confirmBox('Reset demo data?', 'This restores all demonstration records to their original state and discards changes made in this browser.', 'Reset demo data', () => { resetDemo(); LV.state = {}; toast('Demo data has been reset.'); navigate('#/dashboard'); }, 'danger solid');
ACT.markRead = (el) => { S.readNotifs[el.dataset.key] = true; save(); };

/* ---------------- Global search ---------------- */
function searchIndex() {
  const ix = [];
  const add = (type, id, title, sub, link, rec) => { if (!rec || inScope(rec, { ignoreSite: true })) ix.push({ type, id, title, sub, link, text: (id + ' ' + title + ' ' + sub).toLowerCase() }); };
  S.documents.forEach(d => add('Document', d.number, d.title, d.category, '#/documents/' + d.id, d));
  S.legal.forEach(l => add('Legal', l.id, l.reference, l.source + ' · ' + sname(l.site), '#/legal/' + l.id, l));
  S.risks.forEach(r => add('Risk', r.id, r.activity, r.hazard, '#/risks/' + r.id, r));
  S.assets.forEach(a => add('Asset', a.tag, a.name, a.serial + ' ' + a.qr, '#/assets/' + a.id, a));
  S.people.forEach(p => add('Person', p.id, p.name, p.jobTitle, '#/people/' + p.id, p));
  S.incidents.forEach(i => add('Incident', i.id, i.title, i.type, '#/incidents/' + i.id, i));
  S.actions.forEach(a => add('Action', a.id, a.title, a.status + ' · ' + pname(a.owner), '#/actions/' + a.id, a));
  S.chemicals.forEach(c => add('Chemical', c.id, c.name, c.supplier, '#/chemicals/' + c.id, c));
  S.inspections.forEach(i => add('Inspection', i.id, i.template.title, i.target, '#/inspections/' + i.id, i));
  S.audits.forEach(a => add('Audit', a.id, a.title, a.type, '#/audits/' + a.id, a));
  return ix;
}
function globalSearch(q) {
  const box = document.getElementById('searchResults'); if (!box) return;
  q = q.trim().toLowerCase(); if (q.length < 2) { box.classList.add('hidden'); return; }
  const terms = q.split(/\s+/);
  const res = searchIndex().filter(x => terms.every(t => x.text.includes(t))).slice(0, 14);
  box.innerHTML = res.length ? res.map(r => `<a href="${r.link}"><span class="sr-type">${esc(r.type)}</span><span><b>${esc(r.id)}</b> ${esc(r.title)}<br><small class="muted">${esc(r.sub)}</small></span></a>`).join('') : '<div class="empty" style="padding:16px">No matching records</div>';
  box.classList.remove('hidden');
  box.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { box.classList.add('hidden'); document.getElementById('globalSearch').value = ''; }));
}

/* ==========================================================================
   DASHBOARD
   ========================================================================== */
function gaugeSvg(v) {
  const r = 58, c = 2 * Math.PI * r, col = { green: '#12805C', amber: '#F2A100', red: '#C8281E' }[scoreColour(v)];
  return `<div class="gauge"><svg viewBox="0 0 140 140"><circle cx="70" cy="70" r="${r}" stroke="#E5E7EB" stroke-width="14" fill="none"/><circle cx="70" cy="70" r="${r}" stroke="${col}" stroke-width="14" fill="none" stroke-dasharray="${(v / 100) * c} ${c}" stroke-linecap="round"/></svg><div class="g-val"><div><b>${v}%</b><span>indicative score</span></div></div></div>`;
}
function barRow(label, v, href, colour) { return `<div class="bar-row ${href ? 'clickable' : ''}" ${href ? `data-act="go" data-href="${href}"` : ''}><span class="bar-label" title="${esc(label)}">${esc(label)}</span><div class="bar"><span class="fill-${colour || scoreColour(v)}" style="width:${v}%"></span></div><span class="bar-val" style="color:var(--${scoreColour(v) === 'amber' ? 'amber' : scoreColour(v)})">${v}%</span></div>`; }
function kpi(label, value, sub, tone, href, ic) { return `<button class="kpi t-${tone}" data-act="go" data-href="${href}"><div class="k-label">${ic ? icon(ic, 'sm') : ''}${esc(label)}</div><div class="k-value">${value}</div><div class="k-sub">${sub}</div><span class="k-go">${icon('arrowR', 'sm')}</span></button>`; }

ROUTES.dashboard = () => {
  const sid = S.ui.site, comp = compliance(sid);
  const legal = S.legal.filter(l => inSite(l, sid));
  const gaps = legal.filter(l => ['Non-Compliant', 'Partially Compliant'].includes(l.status));
  const notAssessed = legal.filter(l => l.status === 'Not Assessed');
  const risksHigh = S.risks.filter(r => inSite(r, sid) && ['High', 'Critical'].includes(riskBand(r.L2 * r.S2).name));
  const risksHighInit = S.risks.filter(r => inSite(r, sid) && ['High', 'Critical'].includes(riskBand(r.L1 * r.S1).name) && r.controls.some(c => c.status !== 'Implemented'));
  const acts = S.actions.filter(a => inSite(a, sid));
  const overdue = acts.filter(actionOverdue), awaitingVer = acts.filter(a => a.status === 'Submitted for Verification');
  const docs = S.documents.filter(d => inSite(d, sid));
  const docsAwait = docs.filter(d => ['Submitted for Review', 'Under Review', 'Resubmitted', 'Approved'].includes(docStatus(d)));
  const docsDue = docs.filter(d => docActive(d) && docIssued(d) && d.nextReview && daysTo(d.nextReview) <= S.config.notify.docReviewLead);
  const docsOver = docsDue.filter(d => daysTo(d.nextReview) < 0);
  const appts = S.appointments.filter(a => inSite(a, sid)).filter(a => apptStatus(a) !== 'Valid');
  let trnIssues = 0; S.people.filter(p => inSite(p, sid)).forEach(p => requiredCourses(p).forEach(c => { if (trainingStatus(p.id, c).status !== 'Valid') trnIssues++; }));
  const sch = S.schedules.filter(s => inSite(s, sid)); const insOver = sch.filter(s => daysTo(s.nextDue) < 0);
  const mtOver = S.maintenance.filter(m => !m.completed && daysTo(m.due) < 0 && inSite(byId('assets', m.asset), sid));
  const oos = S.assets.filter(a => inSite(a, sid) && a.status === 'Out of Service');
  const incOpen = S.incidents.filter(i => inSite(i, sid) && i.status !== 'Closed');
  const fndOpen = S.findings.filter(f => { const a = byId('audits', f.audit); const act = f.action && byId('actions', f.action); return inSite(a, sid) && (!act || actionOpen(act)) && f.grade !== 'OFI'; });
  const chems = S.chemicals.filter(c => inSite(c, sid)); const sdsBad = chems.filter(c => !c.sds || daysTo(c.sdsReviewDue) < 0);
  const drills = S.drills.filter(d => inSite(d, sid)); const drillOver = drills.filter(d => d.status === 'Scheduled' && daysTo(d.scheduled) < 0);
  const notifs = buildNotifs();
  const upcoming = notifs.filter(n => n.date && daysTo(n.date) >= 0 && daysTo(n.date) <= 30 && !n.key.startsWith('EV-') && !n.key.startsWith('cert-mi') && !n.key.startsWith('sds-mi')).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
  const sites = orgSites();
  const branchRows = sites.map(s => ({ s, c: compliance(s.id) }));
  const lc = comp.legalCounts;
  const legalTotal = Object.values(lc).reduce((a, b) => a + b, 0) || 1;
  const seg = (k, cls) => lc[k] ? `<span class="${cls}" style="width:${(lc[k] / legalTotal) * 100}%" title="${k}: ${lc[k]}"></span>` : '';

  const html = `${pageHead('Executive compliance dashboard', 'Live view of compliance status, gaps, risks, overdue work and evidence across the organisation. Every tile opens the underlying filtered records.', `<a class="btn" href="#/reports">${icon('chart', 'sm')} Management reports</a><a class="btn primary" href="#/notifications/tasks">${icon('tasks', 'sm')} My tasks (${myTasks().length})</a>`, scopePill())}
  <div class="alert demo">${icon('info')}<div><b>Demonstration data.</b> Kestrel Industrial Equipment and Ridgeway Pumps are fictional companies. Scores are <b>indicative</b> and calculated from the demo records using configurable weights (Administration → Compliance scoring). Legal entries are illustrative and require verification by a competent person.</div></div>
  <div class="grid g-3-2 mb">
    <div class="card"><div class="card-head"><h2>Overall compliance overview</h2><span class="ch-sub">${esc(scopeLabel())}</span></div><div class="card-body"><div class="score-wrap">${gaugeSvg(comp.overall)}<div class="bars">
      ${Object.keys(comp.parts).map(k => barRow(PART_LABELS[k], comp.parts[k], PART_LINKS[k])).join('')}
    </div></div>
    <div class="mt"><div class="section-title"><h4>Legal register status (${legalTotal} applicable)</h4><a href="#/legal" class="btn ghost sm">Open register</a></div>
      <div class="stackbar">${seg('Compliant', 'fill-green')}${seg('Awaiting Verification', 'fill-blue')}${seg('Partially Compliant', 'fill-amber')}${seg('Non-Compliant', 'fill-red')}${seg('Not Assessed', 'fill-grey')}</div>
      <div class="legend">${['Compliant', 'Awaiting Verification', 'Partially Compliant', 'Non-Compliant', 'Not Assessed'].map((k, i) => `<a href="#/legal?status=${encodeURIComponent(k)}"><i class="${['fill-green', 'fill-blue', 'fill-amber', 'fill-red', 'fill-grey'][i]}"></i>${k}: <b>${lc[k] || 0}</b></a>`).join('')}</div></div>
    </div></div>
    <div class="card"><div class="card-head"><h2>Compliance by branch</h2><span class="ch-sub">Click a branch to focus on it</span></div><div class="card-body"><div class="bars">
      ${branchRows.map(b => `<div class="bar-row clickable" data-act="focusSite" data-site="${b.s.id}"><span class="bar-label">${esc(b.s.short)}${S.ui.site === b.s.id ? ' ●' : ''}</span><div class="bar"><span class="fill-${scoreColour(b.c.overall)}" style="width:${b.c.overall}%"></span></div><span class="bar-val">${b.c.overall}%</span></div>`).join('')}
    </div>
    <table class="tbl compact mt"><thead><tr><th>Branch</th><th>Legal</th><th>Open actions</th><th>Overdue</th></tr></thead><tbody>
      ${branchRows.map(b => `<tr class="rowlink" data-href="#/reports/branches"><td>${esc(b.s.short)}</td><td>${b.c.parts.legal}%</td><td>${b.c.openActions}</td><td>${b.c.overdueActions ? `<b style="color:var(--red)">${b.c.overdueActions}</b>` : '0'}</td></tr>`).join('')}
    </tbody></table>
    ${S.ui.site !== 'ALL' ? `<button class="btn sm mt" data-act="focusSite" data-site="ALL">${icon('building', 'sm')} Return to organisation-wide view</button>` : ''}
    </div></div>
  </div>
  <h4 class="mb">Requires attention</h4>
  <div class="kpis">
    ${kpi('Legal compliance gaps', gaps.length, `${legal.filter(l => l.status === 'Non-Compliant').length} non-compliant · ${notAssessed.length} not assessed`, gaps.length ? 'red' : 'green', '#/legal?status=gaps', 'scale')}
    ${kpi('High / critical risks', risksHighInit.length, `${risksHigh.length} remain high after controls`, risksHighInit.length ? 'amber' : 'green', '#/risks?band=high', 'risk')}
    ${kpi('Overdue corrective actions', overdue.length, `${acts.filter(a => a.escalated && actionOpen(a)).length} escalated · ${acts.filter(actionOpen).length} open in total`, overdue.length ? 'red' : 'green', '#/actions?status=overdue', 'target')}
    ${kpi('Actions awaiting verification', awaitingVer.length, 'Evidence submitted — verifier decision needed', awaitingVer.length ? 'blue' : 'green', '#/actions?status=Submitted for Verification', 'checkCircle')}
    ${kpi('Documents awaiting approval', docsAwait.length, 'In review, resubmitted or approved-not-issued', docsAwait.length ? 'blue' : 'green', '#/documents?status=pending', 'docs')}
    ${kpi('Documents due for review', docsDue.length, `${docsOver.length} overdue · next ${S.config.notify.docReviewLead} days`, docsOver.length ? 'red' : docsDue.length ? 'amber' : 'green', '#/documents?review=due', 'file')}
    ${kpi('Appointments & training', appts.length + trnIssues, `${appts.length} appointment issues · ${trnIssues} training gaps/expiries`, appts.length + trnIssues ? 'amber' : 'green', '#/people/matrix', 'people')}
    ${kpi('Overdue inspections', insOver.length, `${sch.length} scheduled inspections in scope`, insOver.length ? 'red' : 'green', '#/audits/schedule?due=overdue', 'clipboard')}
    ${kpi('Maintenance & defects', mtOver.length + oos.length, `${mtOver.length} maintenance overdue · ${oos.length} asset(s) out of service`, oos.length ? 'red' : mtOver.length ? 'amber' : 'green', '#/maintenance', 'wrench')}
    ${kpi('Open incidents', incOpen.length, `${incOpen.filter(i => i.status === 'Reported').length} awaiting investigation`, incOpen.filter(i => i.status === 'Reported').length ? 'red' : incOpen.length ? 'amber' : 'green', '#/incidents?status=open', 'alert')}
    ${kpi('Open audit findings', fndOpen.length, 'NCs & observations without verified action', fndOpen.length ? 'amber' : 'green', '#/audits/findings', 'clipboard')}
    ${kpi('Chemical SDS status', sdsBad.length ? sdsBad.length + ' / ' + chems.length : 'OK', sdsBad.length ? 'SDS missing or overdue for review' : 'All SDSs current', sdsBad.length ? 'red' : 'green', '#/chemicals?sds=attention', 'flask')}
    ${kpi('Emergency drills', drillOver.length ? drillOver.length + ' overdue' : 'On track', `${drills.filter(d => d.status === 'Scheduled').length} scheduled · ${drills.filter(d => d.status === 'Completed').length} completed`, drillOver.length ? 'red' : 'green', '#/emergency/drills', 'siren')}
  </div>
  <div class="grid g2">
    <div class="card"><div class="card-head"><h2>Upcoming deadlines (next 30 days)</h2><a class="btn ghost sm" href="#/notifications">All notifications</a></div><div class="card-body flush">
      ${upcoming.length ? `<table class="tbl compact stackable"><tbody>${upcoming.map(n => `<tr class="rowlink" data-href="${n.link}"><td data-label="Due" class="nowrap">${dueText(n.date)}</td><td data-label="Item"><div class="t-title">${esc(n.title)}</div><div class="t-sub">${esc(n.text)}</div></td></tr>`).join('')}</tbody></table>` : '<div class="empty">No deadlines in the next 30 days.</div>'}
    </div></div>
    <div class="card"><div class="card-head"><h2>Recent activity</h2><span class="ch-sub">Simulated audit trail (browser-local)</span></div><div class="card-body">
      <ul class="activity">${S.activity.filter(a => !a.link || true).slice(0, 9).map(a => `<li><span class="avatar sm">${initials(pname(a.by))}</span><div><div>${a.link ? `<a href="${a.link}">${esc(a.text)}</a>` : esc(a.text)}</div><div class="a-meta">${esc(pname(a.by))} · ${fmtTs(a.ts)}</div></div></li>`).join('')}</ul>
    </div></div>
  </div>
  <div class="card mt"><div class="card-head"><h2>The VDW compliance lifecycle</h2><span class="ch-sub">Where each module fits</span></div><div class="card-body"><div class="stepper">
    ${[['Establish compliance', '#/legal'], ['Implement controls', '#/documents'], ['Monitor performance', '#/audits'], ['Correct gaps', '#/actions'], ['Verify evidence', '#/actions?status=Submitted for Verification'], ['Maintain compliance', '#/notifications'], ['Report to management', '#/reports']].map((s, i) => `<a class="step done" href="${s[1]}" style="text-decoration:none"><span class="sd">${i + 1}</span><span class="sl" style="display:inline">${s[0]}</span></a>`).join('')}
  </div></div></div>`;
  return { title: 'Dashboard', crumbs: [['Dashboard', '#/dashboard']], html };
};
ACT.focusSite = (el) => { S.ui.site = el.dataset.site; save(); toast(el.dataset.site === 'ALL' ? 'Organisation-wide view.' : `Focused on ${esc(site(el.dataset.site).name)}.`, 'info'); rerender(); };

/* ==========================================================================
   NOTIFICATIONS & TASKS
   ========================================================================== */
const CAT_LABEL = { documents: 'Documents', legal: 'Legal', people: 'People & training', assets: 'Assets & inspections', chemicals: 'Chemicals', emergency: 'Emergency', incidents: 'Incidents', actions: 'Actions' };
ROUTES.notifications = (p, q) => {
  const tab = p[0] || 'all';
  const all = buildNotifs(); const tasks = myTasks();
  const unread = all.filter(n => !S.readNotifs[n.key]);
  let list = all;
  if (tab === 'unread') list = unread;
  if (q.cat) list = list.filter(n => n.cat === q.cat);
  const icMap = { documents: 'docs', legal: 'scale', people: 'people', assets: 'forklift', chemicals: 'flask', emergency: 'siren', incidents: 'alert', actions: 'target' };
  const body = tab === 'tasks'
    ? `<div class="card"><div class="card-head"><h2>My tasks — ${esc(me().name)}</h2><span class="ch-sub">${esc(myRole().name)} · ${esc(scopeLabel())}</span></div><div class="card-body flush">
      ${tasks.length ? tasks.map(t => `<div class="notif"><div class="n-ic ic-${t.sev}">${icon('tasks')}</div><div class="n-body"><div class="n-title">${esc(t.title)}</div><div class="n-text">${esc(t.sub)}</div></div><a class="btn sm primary" href="${t.link}">Open</a></div>`).join('') : `<div class="empty">${icon('checkCircle')}<div>No tasks assigned to you in this scope. Switch user from the user menu to see other people's tasks.</div></div>`}
    </div></div>`
    : `<div class="card"><div class="toolbar"><div class="btn-row">${['', ...Object.keys(CAT_LABEL)].map(c => `<a class="btn sm ${(q.cat || '') === c ? 'primary' : ''}" href="#/notifications/${tab}${c ? '?cat=' + c : ''}">${c ? CAT_LABEL[c] : 'All categories'}</a>`).join('')}</div><span class="tb-count">${list.length} notifications</span></div>
      ${list.length ? list.map(n => `<div class="notif ${S.readNotifs[n.key] ? '' : 'unread'}"><div class="n-ic ic-${n.sev}">${icon(icMap[n.cat] || 'bell')}</div><div class="n-body"><div class="n-title">${esc(n.title)}</div><div class="n-text">${esc(n.text)}</div><div class="n-meta"><span>${CAT_LABEL[n.cat] || n.cat}</span><span>${esc(sname(n.site))}</span>${n.date ? `<span>${dueText(n.date)}</span>` : ''}</div></div><div class="btn-row"><a class="btn sm primary" href="${n.link}" data-act-read="${esc(n.key)}">Open record</a>${S.readNotifs[n.key] ? '' : `<button class="btn sm" data-act="readOne" data-key="${esc(n.key)}">Mark read</button>`}</div></div>`).join('') : `<div class="empty">${icon('bell')}<div>No notifications.</div></div>`}
    </div>`;
  const html = `${pageHead('Notifications & tasks', 'Central task and notification centre. Alerts are generated automatically from the underlying records (review dates, expiries, schedules, overdue actions) and each links to the record that needs attention.', `<button class="btn" data-act="readAll">${icon('check', 'sm')} Mark all as read</button><a class="btn" href="#/admin/notifications">${icon('settings', 'sm')} Notification settings</a>`, scopePill())}
    <div class="alert info">${icon('info')}<div>In-app notifications only. <b>Email and SMS delivery are simulated</b> — the production system would send them from the server according to the notification settings.</div></div>
    ${tabsHtml('#/notifications', [['all', 'All', all.length], ['unread', 'Unread', unread.length, 'red'], ['tasks', 'My tasks', tasks.length]], tab)}
    ${body}`;
  return { title: 'Notifications & tasks', crumbs: [['Notifications & tasks', '#/notifications']], html, after: () => {
    document.querySelectorAll('[data-act-read]').forEach(a => a.addEventListener('click', () => { S.readNotifs[a.dataset.actRead] = true; save(); }));
  } };
};
ACT.readOne = (el) => { S.readNotifs[el.dataset.key] = true; save(); rerender(); };
ACT.readAll = () => { buildNotifs().forEach(n => S.readNotifs[n.key] = true); save(); toast('All notifications marked as read.'); rerender(); };

ROUTES.notfound = () => ({ title: 'Not found', crumbs: [['Not found', '#']], html: `<div class="empty">${icon('search')}<h2>Page not found</h2><p><a href="#/dashboard">Return to the dashboard</a></p></div>` });

/* ---------------- Boot ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  if (!S.people.find(p => p.id === S.ui.user)) S.ui.user = 'P-002';
  rerender();
});
