/* ==========================================================================
   Locked records, amendments and a tamper-evident audit trail
   --------------------------------------------------------------------------
   • Closed incidents, verified/closed corrective actions and submitted
     inspections are LOCKED: a fingerprint (SHA-256) of the record is written
     to the audit trail. Corrections are added as amendments with a reason;
     the original stays as it was.
   • Every logged event is appended to a hash chain: each entry carries the
     hash of the one before it, so an entry that is edited or removed later
     breaks the chain. "Check integrity" recomputes the chain and every lock.
   PROTOTYPE: the chain lives in this browser, so someone could rebuild it.
   The live system keeps it on the server, signed and out of users' reach.
   ========================================================================== */
'use strict';

const LOCKABLE = {
  incidents: { label: 'incident', link: id => '#/incidents/' + id, perm: 'incident.investigate', exclude: ['lock', 'amendments', 'history', 'effectiveness', 'effHistory', 'escalations', 'reporting', 'links'] },
  actions: { label: 'corrective action', link: id => '#/actions/' + id, perm: 'action.verify', exclude: ['lock', 'amendments', 'history', 'escalated'] },
  inspections: { label: 'inspection', link: id => '#/inspections/' + id, perm: 'action.create', exclude: ['lock', 'amendments', 'reviewer', 'reviewedOn', 'status', 'reviewComment'] }
};

/* Fingerprint of the parts of a record that must not change once it is locked. */
function fingerprint(kind, rec) {
  const o = {}; Object.keys(rec).sort().forEach(k => { if (!LOCKABLE[kind].exclude.includes(k)) o[k] = rec[k]; });
  return sha256(JSON.stringify(o));
}

/* ---------------- Hash chain ---------------- */
function auditHash(e) { return sha256([e.seq, e.ts, e.by, e.text, e.ref, e.rid, e.fp, e.prev].join('|')); }
function auditAppend(text, ref, rid, fp) {
  S.audit = S.audit || [];
  const prev = S.audit.length ? S.audit[S.audit.length - 1].hash : 'GENESIS';
  const e = { seq: S.audit.length + 1, ts: nowTs(), by: S.ui.user || 'System', text, ref: ref || '', rid: rid || '', fp: fp || '', prev };
  e.hash = auditHash(e); S.audit.push(e);
}
// First use: start the chain from the existing activity log and lock every record that is already final.
function ensureAudit() {
  if (S.audit) return;
  S.audit = [];
  S.activity.slice().reverse().forEach(a => { const prev = S.audit.length ? S.audit[S.audit.length - 1].hash : 'GENESIS'; const e = { seq: S.audit.length + 1, ts: a.ts, by: a.by, text: a.text, ref: a.link || '', rid: '', fp: '', prev }; e.hash = auditHash(e); S.audit.push(e); });
  S.incidents.filter(i => i.status === 'Closed').forEach(i => lockRecord('incidents', i, 'already closed'));
  S.actions.filter(a => ['Verified', 'Closed'].includes(a.status)).forEach(a => lockRecord('actions', a, 'already ' + a.status.toLowerCase()));
  S.inspections.forEach(x => lockRecord('inspections', x, 'already submitted'));
  save();
}
function lockRecord(kind, rec, why) {
  const fp = fingerprint(kind, rec);
  rec.lock = { ts: nowTs(), by: S.ui.user || 'System', fp };
  auditAppend(`Locked ${LOCKABLE[kind].label} ${rec.id}${why ? ' (' + why + ')' : ''}`, LOCKABLE[kind].link(rec.id), kind + ':' + rec.id, fp);
}
function unlockRecord(kind, rec, reason) {
  if (!rec.lock) return;
  rec.lock = null;
  auditAppend(`Unlocked ${LOCKABLE[kind].label} ${rec.id}: ${reason}`, LOCKABLE[kind].link(rec.id), kind + ':' + rec.id, '');
}
// The latest fingerprint the chain holds for a record ('' when it was unlocked last)
function chainFp(kind, id) { const rid = kind + ':' + id; for (let k = S.audit.length - 1; k >= 0; k--) if (S.audit[k].rid === rid) return S.audit[k].fp; return null; }
function recordIntact(kind, rec) { return !rec.lock || (fingerprint(kind, rec) === rec.lock.fp && chainFp(kind, rec.id) === rec.lock.fp); }

function verifyAudit() {
  ensureAudit();
  let brokenAt = null;
  S.audit.forEach((e, k) => { if (brokenAt) return; const prev = k ? S.audit[k - 1].hash : 'GENESIS'; if (e.seq !== k + 1 || e.prev !== prev || auditHash(e) !== e.hash) brokenAt = e.seq || k + 1; });
  const bad = [];
  Object.keys(LOCKABLE).forEach(kind => S[kind].filter(r => r.lock).forEach(r => { if (!recordIntact(kind, r)) bad.push({ kind, id: r.id }); }));
  const locked = Object.keys(LOCKABLE).reduce((n, kind) => n + S[kind].filter(r => r.lock).length, 0);
  return { entries: S.audit.length, brokenAt, bad, locked, ts: nowTs() };
}

/* ---------------- Page pieces used by incident, action and inspection pages ---------------- */
function lockBadge(kind, rec) { return rec.lock ? `<span class="badge b-grey" title="Locked on ${esc(fmtTs(rec.lock.ts))}. Corrections are added as amendments.">${icon('lock', 'sm')} Locked</span>` : ''; }
function amendBtn(kind, rec) { return rec.lock ? permBtn(LOCKABLE[kind].perm, `<button class="btn" data-act="amendRec" data-kind="${kind}" data-id="${rec.id}">${icon('file', 'sm')} Add amendment</button>`) : ''; }
function lockNotices(kind, rec) {
  const out = [];
  if (rec.lock && !recordIntact(kind, rec)) out.push(`<div class="alert danger">${icon('alert')}<div><b>Integrity warning:</b> this ${LOCKABLE[kind].label} was changed after it was locked on ${fmtTs(rec.lock.ts)}, without an amendment. Check the audit trail (Administration → Audit trail).</div></div>`);
  if ((rec.amendments || []).length) out.push(`<div class="card mb"><div class="card-head"><h2>${icon('file', 'sm')} Amendments</h2><span class="ch-sub">The locked record is unchanged; corrections are recorded here</span></div><div class="card-body"><ul class="timeline">${rec.amendments.slice().reverse().map(a => `<li><b>${esc(a.text)}</b><div class="tl-meta">${esc(pname(a.by))} · ${fmtTs(a.ts)}</div><div class="tl-comment">Reason: ${esc(a.reason)}</div></li>`).join('')}</ul></div></div>`);
  return out.join('');
}
ACT.amendRec = (el) => {
  const kind = el.dataset.kind, rec = byId(kind, el.dataset.id), L = LOCKABLE[kind];
  openModal({ title: `Amend ${L.label} ${rec.id}`, sub: 'The locked record stays exactly as it was. Your correction is added next to it, with your name, the time and the reason.',
    body: `<div class="form-grid">${fld({ name: 'text', label: 'Correction', type: 'textarea', required: true, full: true, rows: 3, placeholder: 'e.g. The time of the incident was 10:45, not 10:20.' })}${fld({ name: 'reason', label: 'Reason for the correction', type: 'textarea', required: true, full: true, rows: 2 })}</div>`,
    buttons: [{ label: 'Add amendment', cls: 'primary', onClick: m => {
      if (!validateForm(m)) return false;
      const v = readForm(m); rec.amendments = rec.amendments || [];
      rec.amendments.push({ ts: nowTs(), by: S.ui.user, text: v.text.trim(), reason: v.reason.trim() });
      auditAppend(`Amendment to ${L.label} ${rec.id}: ${v.text.trim()} (reason: ${v.reason.trim()})`, L.link(rec.id), '', '');
      S.activity.unshift({ ts: nowTs(), by: S.ui.user, text: `Amended ${L.label} ${rec.id}`, link: L.link(rec.id) });
      save(); toast('Amendment added.'); rerender();
    } }] });
};

/* ---------------- Administration → Audit trail ---------------- */
let AUDIT_RESULT = null;
function auditAdminHtml(ro) {
  ensureAudit();
  const r = AUDIT_RESULT, rows = S.audit.slice(-150).reverse();
  const res = !r ? `<p class="muted" style="margin:0">Not checked in this session yet.</p>`
    : (!r.brokenAt && !r.bad.length) ? `<div class="alert success" style="margin:0">${icon('checkCircle')}<div><b>Intact.</b> All ${r.entries} audit entries link correctly and all ${r.locked} locked records match their fingerprints. Checked ${fmtTs(r.ts)}.</div></div>`
    : `<div class="alert danger" style="margin:0">${icon('alert')}<div><b>Integrity problem found</b> (checked ${fmtTs(r.ts)}).${r.brokenAt ? ` The audit chain is broken at entry ${r.brokenAt}: an entry was changed or removed.` : ''}${r.bad.length ? ` ${r.bad.length} locked record(s) were changed without an amendment: ${r.bad.map(b => `<a href="${LOCKABLE[b.kind].link(b.id)}">${b.id}</a>`).join(', ')}.` : ''}</div></div>`;
  return `<div class="card mb"><div class="card-head"><h2>Integrity</h2><div class="btn-row"><button class="btn primary sm" data-act="auditVerify">${icon('shield', 'sm')} Check integrity</button>${ro ? '' : S._tamperDemo ? `<button class="btn sm" data-act="auditUntamper">Undo demo tampering</button>` : `<button class="btn sm danger" data-act="auditTamper">Demo: tamper with a closed incident</button>`}</div></div><div class="card-body">${res}
    <p class="muted mt-s">Each entry carries the hash of the entry before it, and every locked record has a fingerprint in the chain. Editing or deleting history therefore shows up here. Prototype: the chain is kept in this browser; the live system keeps it on the server, out of users' reach.</p></div></div>
  <div class="card"><div class="card-head"><h2>Audit trail</h2><span class="ch-sub">${S.audit.length} entries · latest first</span></div><div class="card-body flush"><div class="table-wrap"><table class="tbl compact stackable"><thead><tr><th>#</th><th>When</th><th>Who</th><th>Event</th><th>Hash</th></tr></thead><tbody>
    ${rows.map(e => `<tr><td data-label="#" class="mono">${e.seq}</td><td data-label="When" class="nowrap">${fmtTs(e.ts)}</td><td data-label="Who">${esc(pname(e.by))}</td><td data-label="Event">${e.ref ? `<a href="${esc(e.ref)}">${esc(e.text)}</a>` : esc(e.text)}${e.fp ? ` ${icon('lock', 'sm')}` : ''}</td><td data-label="Hash" class="mono t-sub" title="${e.hash}">${e.hash.slice(0, 10)}…</td></tr>`).join('')}
  </tbody></table></div></div></div>`;
}
ACT.auditVerify = () => { AUDIT_RESULT = verifyAudit(); toast(!AUDIT_RESULT.brokenAt && !AUDIT_RESULT.bad.length ? 'Audit trail intact.' : 'Integrity problem found.', !AUDIT_RESULT.brokenAt && !AUDIT_RESULT.bad.length ? 'success' : 'error'); rerender(); };
// Demonstration only: edit a closed incident directly, the way someone with access to the data might.
ACT.auditTamper = () => confirmBox('Demo: tamper with a record', 'This changes the description of a closed incident directly, without an amendment, to show that the check detects it. You can undo it afterwards.', 'Tamper with record', () => {
  const i = S.incidents.find(x => x.lock); if (!i) { toast('No locked incident to tamper with.', 'error'); return; }
  S._tamperDemo = { id: i.id, description: i.description }; i.description += ' (edited later)'; save(); AUDIT_RESULT = null; toast(`${i.id} was changed behind the system's back. Now run "Check integrity".`, 'info'); rerender();
}, 'danger solid');
ACT.auditUntamper = () => { const t = S._tamperDemo, i = t && byId('incidents', t.id); if (i) i.description = t.description; delete S._tamperDemo; save(); AUDIT_RESULT = null; toast('Demo tampering undone.'); rerender(); };
