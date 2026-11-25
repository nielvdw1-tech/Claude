/* ==========================================================================
   Contractor upload link (contractor portal)
   --------------------------------------------------------------------------
   1. On the contractor's page: "Share upload link". The system makes a
      private link for that contractor (valid for 30 days, can be revoked)
      and e-mails it to the contractor's contact person.
   2. The contractor opens the link without an account. The page shows,
      under the company's name, which documents they must provide for the
      kinds of work they will do, and they upload each one (with its expiry
      date where the document expires). They can also list the people who
      will work on site. A rejected document shows the reason, to upload again.
   3. Every upload goes to "Awaiting review": the contractor's contact person
      and the contractor managers get a task to approve or reject it.
   4. When the last required document is approved, the reviewer is asked to
      clear the contractor to start work. The contractor's page and the link
      then say "Cleared to start work" — until a document expires.
   PROTOTYPE: everything is kept in this browser, so the link only works in
   the browser that made it. In the live system it is a secure, expiring
   link to the server.
   ========================================================================== */
'use strict';

const CP_DAYS = 30;
const cpToken = () => 'cp' + Array.from(crypto.getRandomValues(new Uint8Array(12)), b => b.toString(36).padStart(2, '0')).join('').slice(0, 20);
const cpLink = c => `${location.href.split('#')[0]}#/cportal/${c.portal.token}`;
const cpValid = c => !!(c && c.portal && c.portal.active && c.portal.expires >= TODAY);
const cpFind = t => (S.contractors || []).find(c => c.portal && c.portal.token === t);
// cleared to start work: approved and every required document in order
const conCleared = c => c.status === 'Approved' && conCompliance(c) === 'Compliant';
function cpMail(c, subject, text) { if (!c.email) return; S.outbox = S.outbox || []; const org = orgOf(c.org) || S.orgs[0];
  S.outbox.unshift({ id: 'EM-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6), ts: nowTs(), org: org.id, to: c.id, toEmail: c.email, cat: 'contractor', subject,
    body: `Hello ${(c.contact || '').split(' ')[0] || 'there'},\n\n${text}\n\nRegards\n${org.short} HSEQ\nPowered by VDW`, link: c.portal ? cpLink(c) : '', status: 'Not sent (prototype)' }); }

/* ---------------- On the contractor's page ---------------- */
ACT.cpShare = (el) => { const c = byId('contractors', el.dataset.id);
  if (!cpValid(c)) { c.portal = { token: cpToken(), created: TODAY, by: S.ui.user, expires: addDays(TODAY, CP_DAYS), active: true }; conHist(c, 'Upload link created for the contractor'); save(); }
  const link = cpLink(c), n = reqsFor(c).length;
  openModal({ title: 'Share the upload link', sub: `${c.name} — the contractor opens it without an account and uploads the ${n} document(s) required for their work.`, size: 'wide',
    body: `<div class="field full"><label for="cpLink">Link for ${esc(c.contact || c.name)}</label><div class="cp-linkrow"><input id="cpLink" type="text" readonly value="${esc(link)}"><button type="button" class="btn" data-act="cpCopy">${icon('link', 'sm')} Copy</button></div>
      <div class="hint">Valid until ${fmt(c.portal.expires)}. Anyone with the link can upload documents for ${esc(c.name)}, so send it only to them.</div></div>
      <div class="alert info mt-s" style="margin-bottom:0">${icon('info')}<div>Prototype: the data stays in this browser, so the link only works here. Use "Open it as the contractor" to see what they will see. In the live system it is a secure link to the server.</div></div>`,
    buttons: [{ label: 'Revoke the link', cls: 'ghost', onClick: () => { c.portal.active = false; conHist(c, 'Upload link revoked'); save(); toast('The link no longer works.'); rerender(); } },
      { label: 'Open it as the contractor', onClick: () => { window.open(link, '_blank'); return false; } },
      { label: c.email ? `E-mail it to ${c.email}` : 'Done', cls: 'primary', onClick: () => { if (!c.email) { rerender(); return; }
        cpMail(c, `Documents required before you work on site — ${(orgOf(c.org) || {}).short || ''}`, `Before ${c.name} may work on our sites, we need the documents listed on this page. Please open the link, upload each document and add the people who will work on site:\n\n${link}\n\nThe link is valid until ${fmt(c.portal.expires)}. We review each document and let you know when you are cleared to start work.`);
        conHist(c, `Upload link e-mailed to ${c.email}`); log(`E-mailed the upload link to ${c.name}`, '#/contractors/' + c.id); save(); toast('E-mail written to the outbox.'); rerender(); } }] });
};
ACT.cpCopy = () => { const i = document.getElementById('cpLink'); if (!i) return; i.select(); (navigator.clipboard ? navigator.clipboard.writeText(i.value) : Promise.reject()).then(() => toast('Link copied.')).catch(() => { try { document.execCommand('copy'); toast('Link copied.'); } catch (e) { toast('Select the link and copy it.', 'error'); } }); };
ACT.cpClear = (el) => { const c = byId('contractors', el.dataset.id); if (conCompliance(c) !== 'Compliant') { toast('Every required document must be approved first.', 'error'); return; }
  openModal({ title: 'Clear the contractor to start work', sub: c.name, body: `<p>All ${reqsFor(c).length} required documents are approved and current.</p><div class="form-grid">${fld({ name: 'start', label: 'May start work from', type: 'date', value: TODAY, required: true })}${fld({ name: 'note', label: 'Note for the contractor (optional)', full: true, placeholder: 'e.g. Report to reception for site induction at 07:00' })}</div>`,
    buttons: [{ label: 'Clear to start work', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m);
      c.status = 'Approved'; c.cleared = { by: S.ui.user, on: TODAY, start: v.start, note: v.note }; conHist(c, `Cleared to start work from ${fmt(v.start)}${v.note ? ': ' + v.note : ''}`);
      cpMail(c, `Cleared to start work — ${(orgOf(c.org) || {}).short || ''}`, `All your documents are approved. ${c.name} is cleared to start work from ${fmt(v.start)}.${v.note ? '\n\n' + v.note : ''}\n\nRemember that contractor employees need a site induction before they start, and some work needs a permit to work.`);
      if (c.host) addEvent('green', 'contractors', `${c.name} cleared to start work`, `From ${fmt(v.start)}`, '#/contractors/' + c.id, (c.sites || ['ALL'])[0], [c.host]);
      log(`Cleared ${c.name} to start work`, '#/contractors/' + c.id); save(); toast(`${c.name} is cleared to start work.`); rerender(); } }] }); };
// after a review: when the last document is approved, offer to clear the contractor
const _conReviewBeforeCp = ACT.conReview;
ACT.conReview = (el) => { const c = byId('contractors', el.dataset.id), was = conCompliance(c); _conReviewBeforeCp(el);
  const t = setInterval(() => { if (document.querySelector('.modal')) return; clearInterval(t);
    const d = latestDoc(c, el.dataset.r); if (d && d.status === 'Rejected' && d.reviewedOn === TODAY) cpMail(c, `Document not accepted: ${(conReqs().find(x => x.id === el.dataset.r) || {}).name}`, `We could not accept the document you uploaded: ${d.comment}\n\nPlease open your link and upload it again.`);
    if (was !== 'Compliant' && conCompliance(c) === 'Compliant' && !conCleared(c)) ACT.cpClear(el); }, 150); };
const _conBeforeCp = ROUTES.contractors;
ROUTES.contractors = (p, q) => { const r = _conBeforeCp(p, q); if (!r || !r.html || !p[0] || !/^CON-/.test(p[0])) return r; const c = byId('contractors', p[0]); if (!c) return r;
  const gaps = conGaps(c), wait = reqsFor(c).filter(x => docState(c, x) === 'Awaiting review').length;
  if (canCon()) r.html = r.html.replace('<div class="sh-actions">', `<div class="sh-actions">${!conCleared(c) && !gaps.length ? `<button class="btn primary" data-act="cpClear" data-id="${c.id}">${icon('checkCircle', 'sm')} Clear to start work</button>` : ''}<button class="btn ${gaps.length && !wait ? 'primary' : ''}" data-act="cpShare" data-id="${c.id}">${icon('link', 'sm')} Share upload link</button>`).replace('<button class="btn primary" data-act="conDoc"', '<button class="btn" data-act="conDoc"');
  const banner = conCleared(c) ? `<div class="alert success">${icon('checkCircle')}<div><b>Cleared to start work</b>${c.cleared ? ` from ${fmt(c.cleared.start)} (${esc(pname(c.cleared.by))}, ${fmt(c.cleared.on)})` : ''}. Every required document is approved and current.</div></div>`
    : `<div class="alert ${wait ? 'info' : 'warn'}">${icon(wait ? 'info' : 'alert')}<div><b>Not cleared to start work.</b> ${wait ? `${wait} document(s) are waiting for your review. ` : ''}${gaps.filter(x => docState(c, x) !== 'Awaiting review').length ? `Still needed: ${gaps.filter(x => docState(c, x) !== 'Awaiting review').map(x => esc(x.name) + ' (' + docState(c, x).toLowerCase() + ')').join(', ')}. ` : ''}${!gaps.length ? 'All documents are approved: clear them to start work.' : cpValid(c) ? `The contractor has an upload link (valid until ${fmt(c.portal.expires)}).` : 'Share the upload link so the contractor can upload them.'}</div></div>`;
  r.html = r.html.replace(/<div class="alert warn">[^]*?Do not allow work that needs these documents until they are in order\.<\/div><\/div>/, '').replace('<div class="detail">', banner + '<div class="detail">');
  return r; };

/* ---------------- The page the contractor opens ---------------- */
const _rerenderBeforeCp = rerender;
rerender = function (k) { const ph = parseHash(); if (ph.parts[0] === 'cportal') { if (S) runMigrations(); cpRender(ph.parts[1]); return; } document.body.classList.remove('cp-mode'); _rerenderBeforeCp(k); };
function cpRender(token) {
  const c = cpFind(token); document.body.classList.add('auth-mode', 'cp-mode');
  ['sidebar', 'topbar'].forEach(id => { const e = document.getElementById(id); if (e) e.innerHTML = ''; });
  const box = document.getElementById('content');
  if (!c || !cpValid(c)) { box.innerHTML = `<div class="cp-page"><div class="card"><div class="card-body"><h1>This link does not work</h1><p class="muted">${c ? 'It has expired or was revoked.' : 'It is not a valid upload link.'} Please ask your contact person for a new link.</p></div></div></div>`; document.title = 'Upload link'; return; }
  const org = orgOf(c.org) || S.orgs[0], R = reqsFor(c), done = R.filter(r => ['Approved', 'Expiring'].includes(docState(c, r))).length;
  const head = conCleared(c) ? `<div class="alert success">${icon('checkCircle')}<div><b>You are cleared to start work${c.cleared ? ` from ${fmt(c.cleared.start)}` : ''}.</b>${c.cleared && c.cleared.note ? ' ' + esc(c.cleared.note) : ''} Contractor employees need a site induction before they start.</div></div>`
    : `<div class="alert info">${icon('info')}<div><b>Upload the documents below.</b> ${esc(org.short)} reviews each one. You may start work once every document is approved and you are cleared. <b>${done} of ${R.length}</b> approved so far.</div></div>`;
  const row = r => { const d = latestDoc(c, r.id), s = docState(c, r), need = ['Outstanding', 'Rejected', 'Expired', 'Expiring'].includes(s);
    return `<li class="cp-doc"><div class="cp-doc-h"><div><b>${esc(r.name)}</b><small>${esc(r.work === 'All' ? 'Required for all contractors' : 'Required for ' + r.work)}${r.expires ? ' · has an expiry date' : ''}</small></div>${badge(s === 'Awaiting review' ? 'Received — being reviewed' : s, DOC_TONE[s], true)}</div>
      ${d ? `<div class="t-sub">${esc(d.file.name)} · uploaded ${fmt(d.submitted)}${d.expires ? ' · valid until ' + fmt(d.expires) : ''}</div>` : ''}
      ${s === 'Rejected' ? `<div class="alert danger cp-why">${icon('alert', 'sm')}<div><b>Not accepted:</b> ${esc(d.comment || '')}</div></div>` : ''}
      ${need ? `<form class="cp-up" data-r="${r.id}" onsubmit="return false"><div class="field"><label>File<span class="req">*</span></label><input type="file" name="file" data-req="1" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"></div>${r.expires ? `<div class="field"><label>Valid until<span class="req">*</span></label><input type="date" name="expires" data-req="1" min="${TODAY}"></div>` : ''}<button type="button" class="btn primary" data-act="cpUpload" data-t="${token}" data-r="${r.id}">${icon('upload', 'sm')} Upload</button></form>` : ''}</li>`; };
  box.innerHTML = `<div class="cp-page">
    <div class="auth-brand mb">${orgMark(org, 'sb')}<div><b>${esc(org.name)}</b><span>Contractor documents</span></div></div>
    <div class="card"><div class="card-body"><h1 class="cp-h1">${esc(c.name)}</h1><p class="muted">Work: ${esc((c.work || []).join(', ') || 'General')} · Contact person at ${esc(org.short)}: ${esc(c.host ? pname(c.host) : '—')}</p>${head}</div></div>
    <div class="card"><div class="card-head"><h2>Documents required</h2><span class="ch-sub">${done} of ${R.length} approved</span></div><ul class="cp-docs">${R.map(row).join('')}</ul></div>
    <div class="card"><div class="card-head"><h2>People who will work on site</h2></div><div class="card-body">${(c.employees || []).length ? `<ul class="cp-emps">${c.employees.map(e => `<li><b>${esc(e.name)}</b> ${esc(e.role || '')}${e.induction ? ` <span class="badge b-green plain">Inducted ${fmt(e.induction)}</span>` : ' <span class="badge b-amber plain">Induction on site</span>'}</li>`).join('')}</ul>` : '<p class="muted">Nobody listed yet.</p>'}
      <form class="cp-emp" onsubmit="return false"><div class="field"><label>Name and surname<span class="req">*</span></label><input type="text" name="name" data-req="1"></div><div class="field"><label>Role</label><input type="text" name="role" placeholder="e.g. Electrician"></div><div class="field"><label>Qualification / competency</label><input type="text" name="competency"></div><button type="button" class="btn" data-act="cpEmp" data-t="${token}">${icon('plus', 'sm')} Add person</button></form></div></div>
    <p class="auth-powered t-sub">This page is only for ${esc(c.name)}. Link valid until ${fmt(c.portal.expires)}. Powered by VDW.</p></div>`;
  document.title = `${c.name} · documents for ${org.short}`;
}
ACT.cpUpload = (el) => { const c = cpFind(el.dataset.t); if (!cpValid(c)) { rerender(); return; } const f = el.closest('form'), r = conReqs().find(x => x.id === el.dataset.r);
  if (!validateForm(f)) return; const v = readForm(f);
  (c.docs = c.docs || []).push({ req: r.id, file: v.file, expires: v.expires || '', submitted: TODAY, by: 'CONTRACTOR', byName: c.contact || c.name, status: 'Submitted', via: 'upload link' });
  (c.history = c.history || []).push({ ts: nowTs(), by: 'CONTRACTOR', text: `${r.name} uploaded by ${c.contact || 'the contractor'} (upload link)` });
  const to = [c.host].concat(S.people.filter(p => p.org === c.org && p.status !== 'Deactivated' && ['HSEQ Manager'].includes(p.sysRole)).map(p => p.id)).filter(Boolean);
  addEvent('blue', 'contractors', `Contractor document to review: ${c.name}`, r.name, '#/contractors/' + c.id, (c.sites || ['ALL'])[0], to);
  queueEmail(to, 'actions', `Contractor document to review: ${c.name} — ${r.name}`, `${c.contact || c.name} uploaded "${r.name}" through the upload link. Please review it.`, '#/contractors/' + c.id);
  save(); toast('Uploaded. It will be reviewed.'); cpRender(el.dataset.t); };
ACT.cpEmp = (el) => { const c = cpFind(el.dataset.t); if (!cpValid(c)) { rerender(); return; } const f = el.closest('form'); if (!validateForm(f)) return; const v = readForm(f);
  (c.employees = c.employees || []).push({ name: v.name, role: v.role, competency: v.competency, induction: null, via: 'upload link' }); (c.history = c.history || []).push({ ts: nowTs(), by: 'CONTRACTOR', text: `${v.name} added as a worker (upload link)` });
  save(); toast('Added.'); cpRender(el.dataset.t); };
// a history line written through the link has no person: show the contractor
const _pnameBeforeCp = pname; pname = function (id) { return id === 'CONTRACTOR' ? 'Contractor (upload link)' : _pnameBeforeCp(id); };

/* ==========================================================================
   Choosing the documents each contractor must submit
   --------------------------------------------------------------------------
   The kinds of work give a starting selection (Administration → Contractor
   requirements), but each contractor has its own list: tick or untick any
   document, or add a document that is not in the list (it is added to the
   company's list for this contractor only).
   ========================================================================== */
const defaultReqs = c => conReqs().filter(r => r.work === 'All' || ((c && c.work) || []).includes(r.work));
reqsFor = function (c) { if (c && Array.isArray(c.reqs)) return conReqs().filter(r => c.reqs.includes(r.id)); return defaultReqs(c); };
function conReqPickHtml(c) {
  const sel = c ? reqsFor(c).map(r => r.id) : defaultReqs({ work: [] }).map(r => r.id);
  return `<div class="field full conreq-pick"><label>Documents this contractor must submit<span class="req">*</span></label>
    <div class="hint">Ticked for you from the kinds of work. Untick what this contractor does not need, or tick more.</div>
    <div class="chk-col">${conReqs().map(r => `<label class="check"><input type="checkbox" name="rq_${r.id}" data-work="${esc(r.work)}" ${sel.includes(r.id) ? 'checked' : ''}> <span>${esc(r.name)} <small class="muted">${r.work === 'All' ? 'usually for all contractors' : r.work === 'Selected only' ? 'only where selected' : 'usually for ' + esc(r.work)}${r.expires ? ' · expires' : ''}</small></span></label>`).join('')}</div>
    <div class="conreq-new"><input type="text" name="rqNew" placeholder="Another document, e.g. Crane operator certificate"><label class="check"><input type="checkbox" name="rqNewExp"> <span>It expires</span></label></div></div>`;
}
function conReqRead(m) {
  const ids = conReqs().filter(r => { const x = m.querySelector(`[name=rq_${r.id}]`); return x && x.checked; }).map(r => r.id);
  const nm = (m.querySelector('[name=rqNew]') || {}).value; if (nm && nm.trim()) { const id = 'CR' + (Math.max(0, ...conReqs().map(r => +String(r.id).replace(/\D/g, '') || 0)) + 1);
    S.config.contractorReqs.push({ id, name: nm.trim(), work: 'Selected only', expires: !!(m.querySelector('[name=rqNewExp]') || {}).checked }); ids.push(id); }
  return ids;
}
// a kind of work ticked or unticked moves its documents along, unless they were changed by hand
document.addEventListener('change', e => { const w = e.target; if (!w.closest || !w.closest('.modal') || !/^w_/.test(w.name || '')) return; const m = w.closest('.modal'), label = (w.closest('label') || {}).textContent.trim();
  m.querySelectorAll(`.conreq-pick input[data-work]`).forEach(x => { if (x.dataset.work === label && !x.dataset.touched) x.checked = w.checked; }); });
document.addEventListener('change', e => { const x = e.target; if (x.closest && x.closest('.conreq-pick') && x.dataset.work) x.dataset.touched = '1'; });
const _conFormBeforePick = conForm; conForm = function (c) { return _conFormBeforePick(c).replace(/<\/div>$/, conReqPickHtml(c) + '</div>'); };
const _conReadBeforePick = conRead; conRead = function (m) { const o = _conReadBeforePick(m); o.reqs = conReqRead(m); return o; };
// at least one document, and the change is recorded
const _conNewBeforePick = ACT.conNew; ACT.conNew = () => { _conNewBeforePick(); cpGuardModal(); };
const _conEditBeforePick = ACT.conEdit; ACT.conEdit = (el) => { _conEditBeforePick(el); cpGuardModal(); };
function cpGuardModal() { const m = document.querySelector('.modal:last-of-type') || document.querySelector('.modal'); if (!m) return; const b = m.querySelector('.modal-foot .btn.primary'); if (!b) return;
  b.addEventListener('click', ev => { const n = m.querySelectorAll('.conreq-pick input[data-work]:checked').length + (((m.querySelector('[name=rqNew]') || {}).value || '').trim() ? 1 : 0); if (!n) { ev.stopImmediatePropagation(); ev.preventDefault(); toast('Choose at least one document the contractor must submit.', 'error'); } }, true); }
ACT.cpReqs = (el) => { const c = byId('contractors', el.dataset.id), before = reqsFor(c).map(r => r.name);
  openModal({ title: 'Documents this contractor must submit', sub: c.name, size: 'wide', body: `<div class="form-grid">${conReqPickHtml(c)}</div>`,
    buttons: [{ label: 'Save', cls: 'primary', onClick: m => { const ids = conReqRead(m); if (!ids.length) { toast('Choose at least one document.', 'error'); return false; }
      c.reqs = ids; const now = reqsFor(c).map(r => r.name), add = now.filter(x => !before.includes(x)), rem = before.filter(x => !now.includes(x));
      conHist(c, `Documents required changed${add.length ? ' — added: ' + add.join(', ') : ''}${rem.length ? ' — removed: ' + rem.join(', ') : ''}`);
      if (add.length && cpValid(c)) cpMail(c, `More documents needed — ${(orgOf(c.org) || {}).short || ''}`, `We also need: ${add.join(', ')}. Please upload them through your link:\n\n${cpLink(c)}`);
      log(`Changed the documents required from ${c.name}`, '#/contractors/' + c.id); save(); rerender(); } }] }); };
const _conBeforePick = ROUTES.contractors;
ROUTES.contractors = (p, q) => { const r = _conBeforePick(p, q); if (r && r.html && p[0] && /^CON-/.test(p[0]) && canCon()) r.html = r.html.replace(/(<h2>Required documents<\/h2><span class="ch-sub">)[^<]*(<\/span>)/, `$1${reqsFor(byId('contractors', p[0])).length} document(s) chosen for this contractor$2<button class="btn sm" data-act="cpReqs" data-id="${p[0]}">${icon('edit', 'sm')} Choose documents</button>`); return r; };
