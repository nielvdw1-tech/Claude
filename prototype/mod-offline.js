/* ==========================================================================
   Inspections without signal
   --------------------------------------------------------------------------
   Warehouses, yards and vehicles often have no signal. An inspection that is
   being filled in is saved on the phone as you go (a draft), so nothing is lost
   if the screen closes. If there is no signal when it is submitted, the signed
   inspection waits on the phone ("Waiting to send") and is sent automatically
   when the connection returns. The record keeps both times: when it was signed
   and when it was sent.

   Prototype: everything already lives in this browser, so "no signal" is
   simulated with the switch in the person's menu (or a real loss of network).
   The live system would keep drafts and the queue on the device (IndexedDB /
   service worker) and send them to the server.
   ========================================================================== */
'use strict';

function isOffline() { return !!(S && S.ui && S.ui.simOffline) || (typeof navigator !== 'undefined' && navigator.onLine === false); }
const draftKey = (sid, uid) => sid + ':' + uid;

/* ---------------- Drafts saved while filling in ---------------- */
function saveInspDraft() {
  if (!INSP.sched || !/^#\/inspect\//.test(location.hash)) return;
  const f = n => { const e = document.querySelector(`#content [name=${n}]`); return e ? e.value : ''; };
  const has = Object.values(INSP.answers).some(a => a && (a.result || a.comment || (a.photos || []).length)) || INSP.sig || f('summary').trim();
  S.inspDrafts = S.inspDrafts || {};
  const k = draftKey(INSP.sched, S.ui.user);
  if (!has) { if (S.inspDrafts[k]) { delete S.inspDrafts[k]; save(); } return; }
  S.inspDrafts[k] = { sched: INSP.sched, by: S.ui.user, ts: nowTs(), answers: JSON.parse(JSON.stringify(INSP.answers)), sig: INSP.sig, idate: f('idate'), summary: f('summary'), reviewer: f('reviewer') };
  save();
  const st = document.getElementById('draftState'); if (st) st.textContent = `Saved on this phone ${fmtTs(S.inspDrafts[k].ts).split(', ')[1] || ''}`;
}
let DRAFT_T = null;
['input', 'change', 'click', 'pointerup'].forEach(ev => document.addEventListener(ev, () => { if (!INSP.sched) return; clearTimeout(DRAFT_T); DRAFT_T = setTimeout(saveInspDraft, 250); }, true));
function inspDraft(sid, uid = S.ui.user) { return (S.inspDrafts || {})[draftKey(sid, uid)] || null; }
function restoreInspDraft(sid) { const d = inspDraft(sid); if (!d) return; INSP.answers = JSON.parse(JSON.stringify(d.answers || {})); INSP.sig = d.sig || null; INSP.restored = d.ts; }
function fillInspDraftFields(sid) {
  const d = inspDraft(sid); if (!d) return;
  ['idate', 'summary', 'reviewer'].forEach(n => { const e = document.querySelector(`#content [name=${n}]`); if (e && d[n]) e.value = d[n]; });
}
function clearInspDraft(sid, uid) { if (S.inspDrafts && S.inspDrafts[draftKey(sid, uid)]) delete S.inspDrafts[draftKey(sid, uid)]; INSP.restored = null; }
ACT.inspDraftDiscard = (el) => confirmBox('Discard this draft?', 'The answers, photos and signature saved on this phone for this inspection are removed.', 'Discard draft', () => { clearInspDraft(el.dataset.id, S.ui.user); INSP.answers = {}; INSP.sig = null; INSP.sched = null; save(); toast('Draft discarded.'); rerender(); }, 'danger');

function inspOfflineBanner(sid) {
  const d = inspDraft(sid);
  return `${isOffline() ? `<div class="alert warn">${icon('alert')}<div><b>No signal.</b> Carry on: your answers, photos and signature are saved on this phone. If you submit now, the inspection waits on the phone and is sent automatically when the signal returns.</div></div>` : ''}
    <div class="draft-bar">${icon('check', 'sm')}<span id="draftState">${d ? `Draft restored — saved on this phone ${esc(fmtTs(d.ts))}` : 'Your answers are saved on this phone as you go.'}</span>${d ? `<button type="button" class="link-btn" data-act="inspDraftDiscard" data-id="${sid}">Discard draft</button>` : ''}</div>`;
}

/* ---------------- Send queue ---------------- */
function queueInspection(P) {
  S.syncQueue = S.syncQueue || [];
  S.syncQueue.push({ id: 'Q-' + Date.now().toString(36), kind: 'inspection', queuedAt: nowTs(), P });
  clearInspDraft(P.sched, P.by); save();
  const s = byId('schedules', P.sched);
  toast(`No signal: the inspection of ${esc(s.target)} is signed and saved on this phone. It will be sent automatically when the signal returns.`, 'info');
  navigate(isFieldUser() ? '#/field' : '#/inspections/schedule');
}
function myQueue() { return (S.syncQueue || []).filter(q => q.P.by === S.ui.user); }
let SENDING = false;
function sendQueue() {
  if (SENDING || isOffline() || !(S.syncQueue || []).length) return 0;
  SENDING = true; let n = 0; const me = S.ui.user;
  try {
    S.syncQueue.slice().forEach(q => {
      if (q.kind !== 'inspection' || !byId('schedules', q.P.sched)) return;
      S.ui.user = q.P.by;   // the inspection is recorded as the inspector's own work
      try { const ins = finishInspection(q.P, true); if (ins) { ins.recordedOffline.queuedAt = q.queuedAt; n++; S.syncQueue = S.syncQueue.filter(x => x !== q); } } finally { S.ui.user = me; }
    });
    save();
  } finally { SENDING = false; }
  if (n) toast(`Signal is back: ${n} inspection(s) sent.`);
  return n;
}
window.addEventListener('online', () => { if (S) { sendQueue(); rerender(); } });
window.addEventListener('offline', () => { if (S) rerender(); });
ACT.toggleOffline = () => { S.ui.simOffline = !S.ui.simOffline; save(); document.querySelectorAll('.dropdown').forEach(d => d.remove()); if (!S.ui.simOffline) sendQueue(); toast(S.ui.simOffline ? 'Demo: the phone now behaves as if it has no signal.' : 'Demo: signal restored.', 'info'); rerender(); };

/* A banner across the top while there is no signal, and the queue on the field home page */
const _rerenderBeforeOffline = rerender;
rerender = function (keepScroll) {
  _rerenderBeforeOffline(keepScroll);
  if (!S || !signedIn()) return;
  if (!isOffline() && (S.syncQueue || []).length && !SENDING) { if (sendQueue()) { _rerenderBeforeOffline(keepScroll); } }
  let b = document.getElementById('netBanner');
  const q = myQueue().length;
  if (isOffline() || q) {
    if (!b) { b = document.createElement('div'); b.id = 'netBanner'; b.setAttribute('role', 'status'); const top = document.getElementById('topbar'); top.after(b); }
    b.className = 'net-banner' + (isOffline() ? ' off' : '');
    b.innerHTML = isOffline() ? `${icon('alert', 'sm')}<span><b>No signal</b> — work is saved on this phone${q ? ` · ${q} waiting to send` : ''}</span>${S.ui.simOffline ? '<button type="button" class="link-btn" data-act="toggleOffline">Restore signal (demo)</button>' : ''}` : `${icon('refresh', 'sm')}<span>${q} waiting to send…</span>`;
  } else if (b) b.remove();
};
function fieldQueueHtml() {
  const q = myQueue(), drafts = Object.values(S.inspDrafts || {}).filter(d => d.by === S.ui.user && byId('schedules', d.sched));
  if (!q.length && !drafts.length) return '';
  return `<div class="card"><div class="card-head"><h2>On this phone</h2></div><div class="card-body"><ul class="link-list">
    ${q.map(x => { const s = byId('schedules', x.P.sched); return `<li><div class="ll-main"><b>${esc(s ? s.target : x.P.sched)}</b><div>Signed ${fmtTs(x.P.signedAt)}</div></div>${badge('Waiting to send', 'amber')}</li>`; }).join('')}
    ${drafts.map(d => { const s = byId('schedules', d.sched); return `<li><div class="ll-main"><a href="${isFieldUser() && s.asset ? '#/qr/' + s.asset : '#/inspect/' + s.id}">${esc(s.target)}</a><div>Unfinished inspection · saved ${fmtTs(d.ts)}</div></div>${badge('Draft', 'grey')}</li>`; }).join('')}
  </ul></div></div>`;
}
