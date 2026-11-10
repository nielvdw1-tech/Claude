/* ==========================================================================
   Document control: read and acknowledge, and change requests
   --------------------------------------------------------------------------
   Read and acknowledge: a document says who must read it (by role, and/or
   named people) within a number of days. When a revision is issued, each of
   those people gets a task, opens the document and confirms "I have read and
   understood". The document shows who has and who has not, and the owner can
   send a reminder. A new revision starts the list again.

   Change requests: anyone who can see an issued document can ask for a change.
   The document owner (or someone who may create documents) accepts it, which
   starts a new draft revision, or declines it with a reason.
   ========================================================================== */
'use strict';

/* ---------------- Read and acknowledge ---------------- */
function ackDays(d) { return (d.readers && +d.readers.days) || 14; }
// People who must read and acknowledge the document: active accounts of the same company, at the document's branch
function requiredReaders(d) {
  const R = d.readers; if (!R || (!(R.roles || []).length && !(R.people || []).length)) return [];
  return S.people.filter(p => p.org === d.org && p.sysRole && p.status !== 'Deactivated' && (d.site === 'ALL' || p.site === d.site) && ((R.roles || []).includes(p.sysRole) || (R.people || []).includes(p.id))).map(p => p.id);
}
// { rev, req, done, outstanding, due, overdue } for the revision in use, or null when nothing has to be acknowledged
function ackState(d) {
  const r = docIssued(d); if (!r || !docActive(d)) return null;
  const req = requiredReaders(d); if (!req.length) return null;
  const acks = r.acks || [], done = req.filter(u => acks.some(a => a.by === u)), outstanding = req.filter(u => !done.includes(u));
  const due = addDays(r.ackFrom || r.effective || TODAY, ackDays(d));
  return { rev: r, req, done, outstanding, due, overdue: daysTo(due) < 0 ? outstanding : [] };
}
function mustAck(d, uid = S.ui.user) { const a = ackState(d); return !!a && a.outstanding.includes(uid); }
function docsToRead(uid = S.ui.user) { return S.documents.filter(d => mustAck(d, uid)); }

// Tasks: each person sees the documents they still have to read
const _myTasksBeforeAck = myTasks;
myTasks = function () {
  const out = _myTasksBeforeAck();
  docsToRead().forEach(d => { const a = ackState(d), late = daysTo(a.due) < 0; out.push({ title: `Read and acknowledge ${d.number}: ${d.title}`, sub: `${revLabel(a.rev)} · ${late ? 'overdue since' : 'by'} ${fmt(a.due)}`, link: (isFieldUser() ? '#/read/' : '#/documents/') + d.id, sev: late ? 'red' : 'amber' }); });
  S.documents.filter(d => inSite(d, S.ui.site) || involvedIn(d, S.ui.user)).forEach(d => (d.changeRequests || []).filter(c => c.status === 'Open' && canDecideCR(d)).forEach(c => out.push({ title: `Change request on ${d.number}`, sub: `${pname(c.by)}: ${c.text.slice(0, 80)}`, link: '#/documents/' + d.id, sev: 'blue' })));
  return out;
};

// Opening the revision in use is what makes "I have read and understood" available
const _viewDocFileBeforeAck = ACT.viewDocFile;
ACT.viewDocFile = (el) => {
  const d = byId('documents', el.dataset.id), issued = d && docIssued(d), openedBefore = d && openedIssued(d);
  if (issued) { const ri = el.dataset.ri != null ? +el.dataset.ri : d.revisions.length - 1; if (d.revisions[ri] === issued) { S.ui.docOpened = S.ui.docOpened || {}; S.ui.docOpened[d.id + ':' + issued.rev] = true; save(); setTimeout(() => { const box = document.querySelector(`.ack-banner[data-doc="${d.id}"]`); if (box && !openedBefore) { box.outerHTML = ackBannerHtml(d); initAckPad(); } }, 0); } }
  _viewDocFileBeforeAck(el);
};
function openedIssued(d) { const r = docIssued(d); return !!(r && S.ui.docOpened && S.ui.docOpened[d.id + ':' + r.rev]); }

// The banner on the document for the person who still has to read it
function ackBannerHtml(d) {
  if (!mustAck(d)) return '';
  const a = ackState(d), r = a.rev, ri = d.revisions.indexOf(r), opened = openedIssued(d), late = daysTo(a.due) < 0;
  return `<div class="alert ${late ? 'danger' : 'warn'} ack-banner" data-doc="${d.id}">${icon('docs')}<div class="ack-body"><b>Please read ${esc(d.number)} ${revLabel(r)}, then tick and sign.</b> You are on the list of people who must read this document${late ? `; it was due ${fmt(a.due)}` : ` by ${fmt(a.due)}`}.
    <div class="btn-row mt-s"><button class="btn" data-act="viewDocFile" data-id="${d.id}" data-ri="${ri}">${icon('eye', 'sm')} ${opened ? 'Open it again' : 'Step 1: open ' + revLabel(r)}</button></div>
    ${opened ? `<div class="ack-sign">
      <label class="check"><input type="checkbox" id="ackTick" data-doc="${d.id}"> <span><b>I have read and understood ${esc(d.number)} ${esc(d.title)} (${revLabel(r)})</b> and will follow it.</span></label>
      <div class="field" id="ackSigField"><label for="ackPad">Your signature<span class="req">*</span></label><div class="sig-wrap"><canvas id="ackPad" class="sig-pad" aria-label="Signature pad: sign with your finger or mouse"></canvas><div class="sig-foot"><span>${esc(pname(S.ui.user))} · sign with your finger or mouse</span><button type="button" class="btn sm" data-act="ackSigClear">Clear</button></div></div></div>
      <button class="btn success" data-act="docAck" data-id="${d.id}">${icon('check', 'sm')} Confirm and sign</button>
    </div>` : `<p class="t-sub mt-s" style="margin-bottom:0">Step 2 appears once you have opened it: tick that you have read and understood it, and sign.</p>`}
  </div></div>`;
}
const ACKSIG = { sig: null };
function initAckPad() { ACKSIG.sig = null; if (document.getElementById('ackPad')) initSigPad('ackPad', ACKSIG, 'sig', 'ackSigField'); }
ACT.ackSigClear = () => { ACKSIG.sig = null; const c = document.getElementById('ackPad'); if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height); };
ACT.docAck = (el) => {
  const d = byId('documents', el.dataset.id), r = docIssued(d);
  if (!r || !mustAck(d)) { rerender(); return; }
  if (!openedIssued(d)) { toast('Open the document first.', 'error'); return; }
  const tick = document.getElementById('ackTick');
  if (!tick || !tick.checked) { toast('Tick that you have read and understood the document.', 'error'); if (tick) tick.closest('label').classList.add('invalid'); return; }
  if (!ACKSIG.sig) { toast('Please sign to confirm.', 'error'); const f = document.getElementById('ackSigField'); if (f) f.classList.add('invalid'); return; }
  r.acks = r.acks || []; r.acks.push({ by: S.ui.user, ts: nowTs(), sig: ACKSIG.sig, statement: `I have read and understood ${d.number} ${d.title} (${revLabel(r)}) and will follow it.` });
  ACKSIG.sig = null;
  log(`Read, understood and signed ${d.number} ${revLabel(r)}`, '#/documents/' + d.id); save(); toast(`Thank you — your signed confirmation for ${esc(d.number)} is recorded.`); rerender();
};
// The signature pad is drawn after each page render
const _rerenderBeforeAck = rerender;
rerender = function (keepScroll) { _rerenderBeforeAck(keepScroll); if (document.getElementById('ackPad')) initAckPad(); };

// The card on the document page: progress, who is outstanding, reminders and the distribution
function ackCardHtml(d) {
  const R = d.readers || {}, a = ackState(d), roles = (R.roles || []), people = (R.people || []);
  const who = [roles.length ? roles.join(', ') : '', people.length ? people.map(pname).join(', ') : ''].filter(Boolean).join(' · ');
  const edit = permBtn('doc.create', `<button class="btn sm" data-act="docReaders" data-id="${d.id}">${who ? 'Change' : 'Set who must read it'}</button>`);
  if (!who) return `<div class="card" id="ackCard"><div class="card-head"><h2>Read and acknowledge</h2>${edit}</div><div class="card-body"><p class="muted">Nobody has to confirm they have read this document. Set the roles or people who must read it, for example everyone who operates forklifts for a forklift procedure.</p></div></div>`;
  if (!a) return `<div class="card" id="ackCard"><div class="card-head"><h2>Read and acknowledge</h2>${edit}</div><div class="card-body"><p><b>Must be read by:</b> ${esc(who)} (${d.site === 'ALL' ? 'all branches' : esc(sname(d.site))}), within ${ackDays(d)} days.</p><p class="muted">${docIssued(d) ? 'Nobody matches this list yet.' : 'The list starts when the document is issued.'}</p></div></div>`;
  const pct = Math.round((a.done.length / a.req.length) * 100), late = daysTo(a.due) < 0;
  return `<div class="card" id="ackCard"><div class="card-head"><h2>Read and acknowledge</h2>${edit}</div><div class="card-body">
    <div class="ack-head"><b class="ack-n">${a.done.length} of ${a.req.length}</b><span class="muted">have confirmed ${revLabel(a.rev)} · ${late && a.outstanding.length ? `<span class="t-bad">due ${fmt(a.due)}</span>` : `due ${fmt(a.due)}`}</span></div>
    <div class="meter ack-meter" role="img" aria-label="${a.done.length} of ${a.req.length} acknowledged"><span style="width:${pct}%"></span></div>
    <p class="t-sub mt-s">Must be read by: ${esc(who)} · ${d.site === 'ALL' ? 'all branches' : esc(sname(d.site))}</p>
    ${a.outstanding.length ? `<h4 class="mt">Still to read (${a.outstanding.length})</h4><ul class="ack-list">${a.outstanding.map(u => `<li><span class="avatar sm">${initials(pname(u))}</span><span>${esc(pname(u))}<small>${esc((person(u) || {}).jobTitle || '')}</small></span>${late ? badge('Overdue', 'red') : ''}</li>`).join('')}</ul>
      ${can('doc.create') || d.owner === S.ui.user ? `<button class="btn sm mt-s" data-act="docAckRemind" data-id="${d.id}">${icon('bell', 'sm')} Send a reminder to ${a.outstanding.length}</button>` : ''}` : `<div class="alert success mt-s" style="margin-bottom:0">${icon('checkCircle')}<div>Everyone on the list has confirmed they read ${revLabel(a.rev)}.</div></div>`}
    ${a.done.length ? `<details class="mt-s"><summary class="t-sub">Confirmed (${a.done.length})</summary><ul class="ack-list">${(a.rev.acks || []).filter(x => a.done.includes(x.by)).map(x => `<li><span class="avatar sm">${initials(pname(x.by))}</span><span>${esc(pname(x.by))}<small>${x.sig ? 'Ticked and signed' : 'Confirmed'} · ${fmtTs(x.ts)}</small></span>${x.sig ? `<img class="ack-sig" src="${x.sig}" alt="Signature of ${esc(pname(x.by))}">` : ''}</li>`).join('')}</ul></details>` : ''}
  </div></div>`;
}
ACT.docReaders = (el) => {
  const d = byId('documents', el.dataset.id), R = d.readers || {};
  const roleNames = S.roles.filter(r => !r.allPerms).map(r => r.name);
  const ppl = S.people.filter(p => p.org === d.org && p.sysRole && p.status !== 'Deactivated');
  openModal({ title: 'Who must read this document', sub: `${d.number} — each person confirms they have read and understood it`, size: 'wide',
    body: `<div class="form-grid">
      <div class="field full"><label>Roles</label><div class="check-grid">${roleNames.map(n => `<label class="check"><input type="checkbox" name="rdRole" value="${esc(n)}" ${(R.roles || []).includes(n) ? 'checked' : ''}> <span>${esc(n)}</span></label>`).join('')}</div><div class="hint">Everyone in these roles at ${d.site === 'ALL' ? 'all branches' : esc(sname(d.site))}.</div></div>
      <div class="field full"><label>Named people (in addition)</label><div class="check-grid">${ppl.map(p => `<label class="check"><input type="checkbox" name="rdPerson" value="${p.id}" ${(R.people || []).includes(p.id) ? 'checked' : ''}> <span>${esc(p.name)} <small class="muted">${esc(p.jobTitle)}</small></span></label>`).join('')}</div></div>
      ${fld({ name: 'days', label: 'Days to read it after issue', type: 'number', min: 1, max: 90, value: ackDays(d), required: true })}
    </div>`,
    buttons: [{ label: 'Save', cls: 'primary', onClick: m => {
      if (!validateForm(m)) return false;
      const roles = [...m.querySelectorAll('[name=rdRole]:checked')].map(x => x.value), people = [...m.querySelectorAll('[name=rdPerson]:checked')].map(x => x.value);
      const was = requiredReaders(d);
      d.readers = { roles, people, days: Math.max(1, Math.round(+m.querySelector('[name=days]').value || 14)) };
      const r = docIssued(d);
      if (r && !r.ackFrom && !was.length) r.ackFrom = TODAY;   // the clock starts now for a document already in use
      const added = requiredReaders(d).filter(u => !was.includes(u) && r && !(r.acks || []).some(a => a.by === u));
      if (r && added.length) queueEmail(added, 'documents', `Please read ${d.number}: ${d.title}`, `You are on the list of people who must read ${d.number} ${revLabel(r)} and confirm that you have read and understood it, by ${fmt(addDays(r.ackFrom || r.effective, ackDays(d)))}.`, '#/documents/' + d.id);
      docLatest(d).history.push({ ts: nowTs(), by: S.ui.user, action: 'Read-and-acknowledge list changed', comment: [roles.join(', '), people.map(pname).join(', ')].filter(Boolean).join(' · ') || 'Nobody' });
      log(`Set who must read ${d.number}`, '#/documents/' + d.id); save(); toast('Saved.'); rerender();
    } }] });
};
ACT.docAckRemind = (el) => {
  const d = byId('documents', el.dataset.id), a = ackState(d); if (!a || !a.outstanding.length) return;
  queueEmail(a.outstanding, 'documents', `Reminder: please read ${d.number}: ${d.title}`, `Please open ${d.number} ${revLabel(a.rev)}, read it and confirm that you have read and understood it. It is due ${fmt(a.due)}.`, '#/documents/' + d.id);
  log(`Sent a read reminder for ${d.number} to ${a.outstanding.length} person(s)`, '#/documents/' + d.id); save(); toast(`Reminder sent to ${a.outstanding.length} person(s) (written to the outbox).`);
};
// On issue: everyone on the list is told; the period starts on the effective date
function ackOnIssue(d, r) {
  const req = requiredReaders(d); if (!req.length) return;
  queueEmail(req, 'documents', `New revision to read: ${d.number} ${revLabel(r)}`, `${d.number} ${d.title} ${revLabel(r)} is issued for use from ${fmt(r.effective)}. Please read it and confirm that you have read and understood it by ${fmt(addDays(r.effective, ackDays(d)))}.`, '#/documents/' + d.id);
}

/* Field users (e.g. operators) read and confirm on a simple phone page */
ROUTES.read = (p) => {
  const d = byId('documents', p[0]);
  if (!d || !docIssued(d)) return ROUTES.notfound();
  const r = docIssued(d), mine = mustAck(d), done = (r.acks || []).find(a => a.by === S.ui.user);
  const html = `<div class="mobile-card">
    ${pageHead(esc(d.title), `${esc(d.number)} · ${revLabel(r)} · in use from ${fmt(r.effective)}`)}
    ${mine ? ackBannerHtml(d) : done ? `<div class="alert success">${icon('checkCircle')}<div>You ticked that you read and understood ${revLabel(r)} and signed on ${fmtTs(done.ts)}.${done.sig ? `<div><img class="ack-sig mt-s" src="${done.sig}" alt="Your signature"></div>` : ''}</div></div>` : ''}
    ${!mine ? `<button class="btn" data-act="viewDocFile" data-id="${d.id}" data-ri="${d.revisions.indexOf(r)}">${icon('eye', 'sm')} Open ${revLabel(r)}</button>` : ''}
    <div class="card mt"><div class="card-body"><p class="muted" style="margin:0">Something in this document is wrong or out of date?</p><button class="btn sm mt-s" data-act="crNew" data-id="${d.id}">${icon('plus', 'sm')} Request a change</button></div></div>
  </div>`;
  return { title: d.number, nav: 'field', crumbs: [['Home', '#/field'], [d.number, '#']], html };
};
if (typeof FIELD_ROUTES !== 'undefined' && !FIELD_ROUTES.includes('read')) FIELD_ROUTES.push('read');
// The field home page lists what is still to be read
function fieldReadHtml() {
  const list = docsToRead(); if (!list.length) return '';
  return `<div class="card"><div class="card-head"><h2>Documents to read</h2><span class="ch-sub">${list.length}</span></div><div class="card-body"><ul class="link-list">${list.map(d => { const a = ackState(d); return `<li><div class="ll-main"><a href="#/read/${d.id}">${esc(d.title)}</a><div>${esc(d.number)} · ${revLabel(a.rev)} · by ${fmt(a.due)}</div></div>${daysTo(a.due) < 0 ? badge('Overdue', 'red') : badge('To read', 'amber')}</li>`; }).join('')}</ul></div></div>`;
}

/* ---------------- Change requests ---------------- */
function canDecideCR(d) { return d.owner === S.ui.user || can('doc.create'); }
ACT.crNew = (el) => {
  const d = byId('documents', el.dataset.id);
  openModal({ title: 'Request a change', sub: `${d.number} ${d.title} — the document owner (${pname(d.owner)}) decides`, body: `<div class="form-grid">${fld({ name: 'text', label: 'What should change, and why?', type: 'textarea', required: true, full: true, placeholder: 'e.g. Step 4 still refers to the old charging bay; it moved to bay C.' })}</div>`,
    buttons: [{ label: 'Send request', cls: 'primary', onClick: m => {
      if (!validateForm(m)) return false; const v = readForm(m);
      d.changeRequests = d.changeRequests || [];
      const id = 'CR-' + String(S.documents.reduce((n, x) => n + (x.changeRequests || []).length, 0) + 1).padStart(3, '0');
      d.changeRequests.push({ id, by: S.ui.user, ts: nowTs(), text: v.text.trim(), status: 'Open', rev: (docIssued(d) || docLatest(d)).rev });
      docLatest(d).history.push({ ts: nowTs(), by: S.ui.user, action: `Change requested (${id})`, comment: v.text.trim() });
      queueEmail([d.owner], 'documents', `Change request ${id} on ${d.number}`, `${pname(S.ui.user)} asks for a change to ${d.number} ${d.title}: ${v.text.trim()}`, '#/documents/' + d.id);
      log(`Requested a change to ${d.number} (${id})`, '#/documents/' + d.id); save(); toast(`Change request ${id} sent to ${esc(pname(d.owner))}.`); rerender();
    } }] });
};
ACT.crDecide = (el) => {
  const d = byId('documents', el.dataset.id), c = (d.changeRequests || []).find(x => x.id === el.dataset.cr), accept = el.dataset.ok === '1';
  if (!c || c.status !== 'Open') return;
  openModal({ title: accept ? `Accept ${c.id}` : `Decline ${c.id}`, sub: c.text, body: `<div class="form-grid">${fld({ name: 'reason', label: accept ? 'Note (optional)' : 'Reason for declining', type: 'textarea', required: !accept, full: true })}</div>${accept ? `<p class="muted">${docLatest(d).status === 'Issued for Use' ? 'A new draft revision is started next, with this request as the reason.' : `${revLabel(docLatest(d))} is already being worked on; the change is to be included in it.`}</p>` : ''}`,
    buttons: [{ label: accept ? 'Accept' : 'Decline', cls: accept ? 'success' : 'danger', onClick: m => {
      if (!validateForm(m)) return false; const v = readForm(m);
      Object.assign(c, { status: accept ? 'Accepted' : 'Declined', decidedBy: S.ui.user, decidedTs: nowTs(), reason: v.reason || '' });
      docLatest(d).history.push({ ts: nowTs(), by: S.ui.user, action: `Change request ${c.id} ${accept ? 'accepted' : 'declined'}`, comment: v.reason || '' });
      queueEmail([c.by], 'documents', `Your change request ${c.id} on ${d.number} was ${accept ? 'accepted' : 'declined'}`, accept ? `${pname(S.ui.user)} accepted your request. It will be included in the next revision.` : `${pname(S.ui.user)} declined your request: ${v.reason}`, '#/documents/' + d.id);
      log(`${accept ? 'Accepted' : 'Declined'} change request ${c.id} on ${d.number}`, '#/documents/' + d.id); save();
      if (accept && docLatest(d).status === 'Issued for Use' && can('doc.create')) { CR_PREFILL = `${c.id}: ${c.text}`; setTimeout(() => ACT.docNewRevision({ dataset: { id: d.id } }), 50); }
      else { toast(`${c.id} ${accept ? 'accepted' : 'declined'}.`); rerender(); }
    } }] });
};
let CR_PREFILL = '';
function crCardHtml(d) {
  const list = (d.changeRequests || []).slice().reverse(), open = list.filter(c => c.status === 'Open');
  const canAsk = !!docIssued(d) && docActive(d);
  return `<div class="card" id="crCard"><div class="card-head"><h2>Change requests</h2>${open.length ? `<span class="ch-sub">${open.length} open</span>` : ''}</div><div class="card-body">
    ${list.length ? `<ul class="cr-list">${list.map(c => `<li><div class="cr-top"><b class="mono">${esc(c.id)}</b> ${badge(c.status, { Open: 'blue', Accepted: 'green', Declined: 'grey' }[c.status])}<span class="t-sub">${esc(pname(c.by))} · ${fmtTs(c.ts)} · on Rev ${c.rev}</span></div><div>${esc(c.text)}</div>
      ${c.status !== 'Open' ? `<div class="t-sub">${esc(c.status)} by ${esc(pname(c.decidedBy))}${c.reason ? ': ' + esc(c.reason) : ''}${c.inRev ? ` · in Rev ${c.inRev}` : ''}</div>` : canDecideCR(d) ? `<div class="btn-row mt-s"><button class="btn sm success" data-act="crDecide" data-id="${d.id}" data-cr="${c.id}" data-ok="1">Accept</button><button class="btn sm" data-act="crDecide" data-id="${d.id}" data-cr="${c.id}" data-ok="0">Decline</button></div>` : ''}</li>`).join('')}</ul>` : '<p class="muted">No change requests.</p>'}
    ${canAsk ? `<button class="btn sm mt-s" data-act="crNew" data-id="${d.id}">${icon('plus', 'sm')} Request a change</button>` : ''}
  </div></div>`;
}

/* ---------------- Demo data (added once to existing demo data, and to a reset) ---------------- */
MIGRATIONS.push(() => {
  if (S.migr && S.migr.docAck) return; S.migr = S.migr || {}; S.migr.docAck = true;
  const fl = byId('documents', 'DOC-004'), pol = byId('documents', 'DOC-001');
  if (fl) { fl.readers = { roles: ['Employee', 'Supervisor'], people: [], days: 14 }; const r = docIssued(fl); if (r) { r.ackFrom = addDays(TODAY, -20); r.acks = [{ by: 'P-007', ts: T_(-18, 9, 12) }, { by: 'P-008', ts: T_(-17, 14, 3) }, { by: 'P-010', ts: T_(-12, 7, 41) }, { by: 'P-016', ts: T_(-11, 10, 5) }]; } }
  if (pol) { pol.readers = { roles: ['Branch Manager', 'Supervisor', 'Employee'], people: [], days: 30 }; const r = docIssued(pol); if (r) { r.ackFrom = addDays(TODAY, -6); r.acks = [{ by: 'P-003', ts: T_(-5, 8, 30) }, { by: 'P-004', ts: T_(-5, 11, 2) }, { by: 'P-007', ts: T_(-4, 7, 55) }]; } }
  if (fl) fl.changeRequests = [{ id: 'CR-001', by: 'P-009', ts: T_(-3, 13, 20), text: 'Step 6 says to charge forklifts in bay A, but charging moved to bay C in September.', status: 'Open', rev: (docIssued(fl) || {}).rev || 4 }];
});
function T_(days, hh, mm) { const d = new Date(addDays(TODAY, days) + 'T00:00:00'); d.setHours(hh, mm, 0, 0); return d.toISOString(); }
