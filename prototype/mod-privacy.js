/* ==========================================================================
   Privacy (POPIA) features
   --------------------------------------------------------------------------
   • Medical (injury) details are hidden until someone allowed to see them
     asks to; every viewing is recorded (who, when, which incident).
   • Retention periods per type of record, set by the company: records past
     their period are listed for review. The prototype never deletes records.
   • Removing a former employee's personal details on request: their profile
     (name, e-mail, job title, sign-in) is removed; safety records the company
     keeps stay, showing "Former employee".
   The legal periods and what must be kept are for the company and its legal
   adviser to decide; the system only applies their decisions.
   ========================================================================== */
'use strict';

const MED_SHOWN = new Set();   // incidents whose medical details were opened in this session (not stored)
function privacyLog(action, ref) { S.privacyLog = S.privacyLog || []; S.privacyLog.unshift({ ts: nowTs(), by: S.ui.user, action, ref: ref || '' }); S.privacyLog = S.privacyLog.slice(0, 1000); }
function medicalBlock(i) {
  const j = i.injury;
  if (!MED_SHOWN.has(i.id)) return `<div class="med-gate"><div>${icon('lock', 'sm')} <b>Medical details are private.</b> <span class="muted">Opening them is recorded (who and when).</span></div><button type="button" class="btn sm" data-act="medShow" data-id="${i.id}">${icon('eye', 'sm')} Show medical details</button></div>`;
  return `<div class="kv"><div>Nature of injury</div><div>${esc(j.nature || '—')}</div><div>Body part</div><div>${esc(j.body || '—')}</div><div>First aid given</div><div>${esc(j.firstAid || '—')}</div><div>Sent for medical treatment</div><div>${esc(j.sentForMedical || 'Not known')}</div></div><p class="muted" style="font-size:11.5px">${icon('eye', 'sm')} Your viewing was recorded.</p>`;
}
ACT.medShow = (el) => { const i = byId('incidents', el.dataset.id); if (!can('incident.investigate')) return; MED_SHOWN.add(i.id); privacyLog(`Viewed medical details of ${i.id}`, '#/incidents/' + i.id); save(); rerender(); };

/* ---------------- Retention ---------------- */
const RETENTION_TYPES = {
  incidents: { label: 'Closed incidents', date: i => i.status === 'Closed' && i.closure ? i.closure.date : null, list: () => S.incidents, link: i => '#/incidents/' + i.id, name: i => `${i.id} ${i.title}` },
  inspections: { label: 'Inspection records', date: x => x.date, list: () => S.inspections, link: x => '#/inspections/' + x.id, name: x => `${x.id} ${x.target}` },
  actions: { label: 'Closed corrective actions', date: a => a.status === 'Closed' ? a.closed : null, list: () => S.actions, link: a => '#/actions/' + a.id, name: a => `${a.id} ${a.title}` },
  documents: { label: 'Obsolete or archived documents', date: d => ['Obsolete', 'Archived'].includes(docStatus(d)) ? (docLatest(d).date || null) : null, list: () => S.documents, link: d => '#/documents/' + d.id, name: d => `${d.number} ${d.title}` },
  notices: { label: 'Expired company notices', date: n => n.expires && n.expires < TODAY ? n.expires : null, list: () => S.notices || [], link: n => '#/notices/' + n.id, name: n => `${n.id} ${n.title}` }
};
function retention() { return S.config.retention || {}; }
function pastRetention(type) {
  const yrs = +retention()[type]; if (!(yrs > 0)) return [];
  const T = RETENTION_TYPES[type], cutoff = addMonths(TODAY, -12 * yrs);
  return T.list().filter(r => (r.org || siteOrgOf(r.site) || S.ui.org) === S.ui.org).filter(r => { const d = T.date(r); return d && d < cutoff; });
}

/* ---------------- Removing a person's personal details ---------------- */
ACT.privacyRemove = (el) => {
  const p = person(el.dataset.id);
  if (!p || p.status !== 'Deactivated') { toast('Deactivate the person first.', 'error'); return; }
  confirmBox('Remove personal details', `${esc(p.name)}'s name, e-mail address, job title and sign-in will be removed and cannot be restored. Safety records the company keeps (incidents, inspections, signatures, actions) stay, showing <b>Former employee</b>.<br><br><span class="muted">Check with your legal adviser which records must be kept before removing details.</span>`, 'Remove personal details', () => {
    const old = p.name, label = `Former employee (${p.id})`;
    Object.assign(p, { name: label, email: '', jobTitle: '', personalRemoved: TODAY }); delete p.auth; delete p.emailPrefs; delete p.company;
    S.outbox = (S.outbox || []).filter(e => e.to !== p.id);   // e-mails addressed to them held their name and address
    privacyLog(`Removed the personal details of a former employee (${p.id}) on request`, '#/admin/privacy');
    log(`Removed personal details of ${p.id} on request`, '#/admin/privacy'); save(); toast(`${esc(old)}'s personal details were removed.`); rerender();
  }, 'danger solid');
};

/* ---------------- Administration → Privacy (POPIA) ---------------- */
function privacyAdminHtml(ro) {
  const logRows = (S.privacyLog || []).slice(0, 100), r = retention();
  const formers = S.people.filter(p => p.org === S.ui.org && p.status === 'Deactivated');
  return `<div class="alert info">${icon('lock')}<div>Tools to apply your company's privacy decisions under POPIA. <b>Which records to keep, and for how long, is for your company and its legal adviser to decide</b>; the system applies those decisions and records what was done.</div></div>
  <div class="card mb"><div class="card-head"><h2>Who viewed medical details</h2><span class="ch-sub">Injury details are hidden until opened; every opening is recorded</span></div><div class="card-body flush">${logRows.length ? `<div class="table-wrap"><table class="tbl compact stackable"><thead><tr><th>When</th><th>Who</th><th>What</th></tr></thead><tbody>${logRows.map(e => `<tr><td data-label="When" class="nowrap">${fmtTs(e.ts)}</td><td data-label="Who">${esc(pname(e.by))}</td><td data-label="What">${e.ref ? `<a href="${esc(e.ref)}">${esc(e.action)}</a>` : esc(e.action)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Nothing recorded yet.</div>'}</div></div>
  <div class="card mb"><div class="card-head"><h2>Retention periods</h2><span class="ch-sub">Leave blank until decided</span></div><div class="card-body"><form id="retForm" class="form-grid">${Object.keys(RETENTION_TYPES).map(k => fld({ name: k, label: `${RETENTION_TYPES[k].label} — keep for (years)`, type: 'number', min: 1, value: r[k] || '' })).join('')}</form>
    ${ro ? '' : `<button class="btn sm mt-s" data-act="retSave">Save retention periods</button>`}
    <h4 class="mt">Records past their retention period</h4>${Object.keys(RETENTION_TYPES).some(k => +r[k] > 0) ? `<ul class="link-list">${Object.keys(RETENTION_TYPES).filter(k => +r[k] > 0).map(k => { const past = pastRetention(k); return `<li><div class="ll-main"><b>${esc(RETENTION_TYPES[k].label)}</b> (${r[k]} years)<div>${past.length ? past.slice(0, 8).map(x => `<a href="${RETENTION_TYPES[k].link(x)}">${esc(RETENTION_TYPES[k].name(x))}</a>`).join(', ') + (past.length > 8 ? ` and ${past.length - 8} more` : '') : 'None'}</div></div>${past.length ? badge(`${past.length} to review`, 'amber') : badge('None', 'green')}</li>`; }).join('')}</ul><p class="muted">Prototype: records are listed for review, never deleted automatically.</p>` : '<p class="muted">Set at least one retention period to see records past it.</p>'}
  </div></div>
  <div class="card"><div class="card-head"><h2>Former employees: remove personal details on request</h2></div><div class="card-body flush">${formers.length ? `<table class="tbl compact stackable"><thead><tr><th>Person</th><th>Deactivated</th><th></th></tr></thead><tbody>${formers.map(p => `<tr><td data-label="Person"><b>${esc(p.name)}</b><div class="t-sub">${esc(p.email || '—')}</div></td><td data-label="Deactivated">${p.deactivatedOn ? fmt(p.deactivatedOn) : '—'}</td><td data-label="">${p.personalRemoved ? badge('Details removed ' + fmt(p.personalRemoved), 'grey') : ro ? '' : `<button class="btn sm danger" data-act="privacyRemove" data-id="${p.id}">Remove personal details</button>`}</td></tr>`).join('')}</tbody></table>` : '<div class="empty">No deactivated people. Deactivate a person under Users &amp; roles first.</div>'}</div></div>`;
}
ACT.retSave = () => {
  const f = document.getElementById('retForm'); if (!validateForm(f, fail => f.querySelectorAll('input').forEach(i => { if (i.value && !(+i.value >= 1)) fail(i, 'At least 1 year, or leave blank.'); }))) return;
  const v = readForm(f); S.config.retention = {}; Object.keys(RETENTION_TYPES).forEach(k => { if (+v[k] >= 1) S.config.retention[k] = Math.round(+v[k]); });
  privacyLog('Changed the retention periods', '#/admin/privacy'); log('Changed the retention periods', '#/admin/privacy'); save(); toast('Retention periods saved.'); rerender();
};
