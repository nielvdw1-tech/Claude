/* ==========================================================================
   Company notices — memos and important information for staff
   --------------------------------------------------------------------------
   Managers publish a notice to everyone or to one branch, optionally with an
   attachment and a "read and understood" acknowledgement. Every user (field
   users included) sees notices addressed to them with an unread count;
   publishers see who has read and acknowledged each notice.
   ========================================================================== */
'use strict';

function noticeFor(n, p) { return !!p && n.org === p.org && (n.audience === 'ALL' || n.audience === p.site); }
function noticeLive(n) { return !n.expires || daysTo(n.expires) >= 0; }
function noticeAudience(n) { return S.people.filter(p => p.sysRole && noticeFor(n, p)); }
function myNotices() { const u = me(); return (S.notices || []).filter(n => noticeFor(n, u) && noticeLive(n)).sort((a, b) => b.publishedOn.localeCompare(a.publishedOn)); }
function noticeUnread(n, uid) { return !(n.reads || {})[uid || S.ui.user]; }
function noticeNeedsAck(n, uid) { return n.ackRequired && !(n.acks || {})[uid || S.ui.user]; }
function myUnreadNotices() { return myNotices().filter(n => noticeUnread(n) || noticeNeedsAck(n)); }
function noticeCard(n) {
  const unread = noticeUnread(n), ack = noticeNeedsAck(n);
  return `<a class="notice ${n.priority === 'Important' ? 'notice-imp' : ''} ${unread ? 'notice-unread' : ''}" href="#/notices/${n.id}">
    <div class="notice-top">${n.priority === 'Important' ? badge('Important', 'red') : badge('Notice', 'blue')}${ack ? badge('Please acknowledge', 'amber') : n.ackRequired ? badge('Acknowledged', 'green') : ''}<span class="notice-date">${fmt(n.publishedOn)}</span></div>
    <div class="notice-title">${esc(n.title)}</div>
    <div class="notice-snip">${esc(n.body.length > 150 ? n.body.slice(0, 150).trim() + '…' : n.body)}</div>
    <div class="notice-meta">${esc(pname(n.publishedBy))} · ${esc(n.audience === 'ALL' ? 'All staff' : sname(n.audience) + ' staff')}${n.attachment ? ` · ${icon('file', 'sm')} attachment` : ''}</div>
  </a>`;
}

ROUTES.notices = (p) => {
  if (p[0]) return noticeDetail(p[0]);
  const pub = can('notice.publish');
  const mine = myNotices();
  const all = pub ? (S.notices || []).filter(n => n.org === S.ui.org && (S.ui.site === 'ALL' || n.audience === 'ALL' || n.audience === S.ui.site)).sort((a, b) => b.publishedOn.localeCompare(a.publishedOn)) : [];
  const html = `<div class="${isFieldUser() ? 'mobile-card' : ''}">
    ${pageHead('Company notices', 'Memos and important information shared with staff. Notices marked "Please acknowledge" need you to confirm that you have read and understood them.', pub ? `<button class="btn primary" data-act="noticeNew">${icon('plus', 'sm')} Publish notice</button>` : '')}
    ${pub && all.length ? `<div class="card mb"><div class="card-head"><h2>Published notices</h2><span class="ch-sub">Read and acknowledgement status</span></div><div class="card-body flush"><div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Notice</th><th>Audience</th><th>Published</th><th>Read</th><th>Acknowledged</th><th>Status</th></tr></thead><tbody>
      ${all.map(n => { const aud = noticeAudience(n), rd = aud.filter(x => !noticeUnread(n, x.id)).length, ak = aud.filter(x => (n.acks || {})[x.id]).length; return `<tr class="rowlink" data-href="#/notices/${n.id}"><td data-label="Notice"><div class="t-title">${esc(n.title)}</div><div class="t-sub">${n.priority === 'Important' ? 'Important · ' : ''}${esc(pname(n.publishedBy))}</div></td><td data-label="Audience">${esc(n.audience === 'ALL' ? 'All staff' : sname(n.audience))}</td><td data-label="Published">${fmt(n.publishedOn)}</td><td data-label="Read">${rd} of ${aud.length}</td><td data-label="Acknowledged">${n.ackRequired ? `<span class="due ${ak === aud.length ? 'green' : 'amber'}">${ak} of ${aud.length}</span>` : '<span class="muted">Not required</span>'}</td><td data-label="Status">${noticeLive(n) ? badge('Live', 'green') : badge('Expired', 'grey')}</td></tr>`; }).join('')}
    </tbody></table></div></div></div><h4 class="mb">Notices addressed to you</h4>` : ''}
    <div class="notice-list">${mine.length ? mine.map(noticeCard).join('') : `<div class="card"><div class="empty">${icon('info')}<div>There are no notices for you at the moment.</div></div></div>`}</div>
  </div>`;
  return { title: 'Company notices', nav: 'notices', crumbs: [['Company notices', '#/notices']], html };
};

function noticeDetail(id) {
  const n = (S.notices || []).find(x => x.id === id);
  if (!n || (!noticeFor(n, me()) && !(can('notice.publish') && n.org === S.ui.org))) return ROUTES.notfound();
  if (noticeFor(n, me()) && noticeUnread(n)) { n.reads = n.reads || {}; n.reads[S.ui.user] = nowTs(); save(); }   // opening a notice marks it as read
  const pub = can('notice.publish'), aud = noticeAudience(n), ack = noticeNeedsAck(n) && noticeFor(n, me());
  const html = `<div class="mobile-card" style="max-width:820px">
    <div class="card notice-sheet ${n.priority === 'Important' ? 'notice-imp' : ''}"><div class="card-body" style="padding-top:18px">
      <div class="notice-top">${n.priority === 'Important' ? badge('Important', 'red') : badge('Notice', 'blue')}<span class="notice-date">${fmtTs(n.publishedOn)}</span></div>
      <h1 style="margin:10px 0 6px">${esc(n.title)}</h1>
      <div class="notice-meta">From ${esc(pname(n.publishedBy))} · To ${esc(n.audience === 'ALL' ? 'all staff' : sname(n.audience) + ' staff')}${n.expires ? ` · Until ${fmt(n.expires)}` : ''}</div>
      <div class="notice-body">${esc(n.body).replace(/\n/g, '<br>')}</div>
      ${n.attachment ? `<div class="mt">${fileChip(n.attachment)}</div>` : ''}
      ${noticeFor(n, me()) && n.ackRequired ? `<div class="notice-ack">${ack ? `<div><b>Please confirm you have read and understood this notice.</b></div><button class="btn primary" data-act="noticeAck" data-id="${n.id}">${icon('check', 'sm')} I have read and understood</button>` : `${icon('checkCircle', 'sm')}<span>You acknowledged this notice on ${fmtTs(n.acks[S.ui.user])}.</span>`}</div>` : ''}
    </div></div>
    ${pub ? `<div class="card mt"><div class="card-head"><h2>Read and acknowledgement</h2><div class="btn-row">${n.ackRequired && aud.some(x => !(n.acks || {})[x.id]) ? `<button class="btn sm" data-act="noticeRemind" data-id="${n.id}">${icon('bell', 'sm')} Remind outstanding</button>` : ''}${noticeLive(n) ? `<button class="btn sm danger" data-act="noticeExpire" data-id="${n.id}">Withdraw</button>` : ''}</div></div><div class="card-body flush"><table class="tbl stackable compact"><thead><tr><th>Person</th><th>Role</th><th>Read</th><th>Acknowledged</th></tr></thead><tbody>
      ${aud.map(x => `<tr><td data-label="Person"><b>${esc(x.name)}</b><div class="t-sub">${esc(sname(x.site))}</div></td><td data-label="Role">${esc(x.sysRole)}</td><td data-label="Read">${(n.reads || {})[x.id] ? fmtTs(n.reads[x.id]) : '<span class="due amber">Not yet</span>'}</td><td data-label="Acknowledged">${!n.ackRequired ? '<span class="muted">Not required</span>' : (n.acks || {})[x.id] ? `<span class="due green">${fmtTs(n.acks[x.id])}</span>` : '<span class="due red">Outstanding</span>'}</td></tr>`).join('')}
    </tbody></table></div></div>` : ''}
    <a class="btn mt" href="${isFieldUser() ? '#/field' : '#/notices'}">← Back</a>
  </div>`;
  return { title: n.title, nav: 'notices', crumbs: [['Company notices', '#/notices'], [n.title, '#']], html };
}

ACT.noticeAck = (el) => { const n = S.notices.find(x => x.id === el.dataset.id); n.acks = n.acks || {}; n.acks[S.ui.user] = nowTs(); n.reads = n.reads || {}; n.reads[S.ui.user] = n.reads[S.ui.user] || nowTs(); log(`${pname(S.ui.user)} acknowledged notice "${n.title}"`, '#/notices/' + n.id); save(); toast('Thank you — your acknowledgement has been recorded.'); rerender(); };
ACT.noticeRemind = (el) => { const n = S.notices.find(x => x.id === el.dataset.id); const out = noticeAudience(n).filter(x => !(n.acks || {})[x.id]); addEvent('amber', 'notices', `Reminder: please acknowledge "${n.title}"`, `${out.length} person(s) still to acknowledge.`, '#/notices/' + n.id, n.audience); log(`Reminder sent for notice "${n.title}" to ${out.length} person(s)`, '#/notices/' + n.id); save(); toast(`Reminder sent to ${out.length} person(s) (simulated — in-app only).`); };
ACT.noticeExpire = (el) => { const n = S.notices.find(x => x.id === el.dataset.id); confirmBox('Withdraw notice', `"${esc(n.title)}" will no longer be shown to staff. It stays on record with its read and acknowledgement history.`, 'Withdraw', () => { n.expires = addDays(TODAY, -1); log(`Withdrew notice "${n.title}"`, '#/notices/' + n.id); save(); toast('Notice withdrawn.'); rerender(); }, 'danger solid'); };
ACT.noticeNew = () => openModal({ title: 'Publish notice', sub: 'Share a memo or important information with staff. They see it in Notices and on their home screen.', size: 'wide',
  body: `<div class="form-grid">${fld({ name: 'title', label: 'Title', required: true, full: true, placeholder: 'e.g. New pedestrian walkways in the warehouse' })}${fld({ name: 'body', label: 'Message', type: 'textarea', required: true, full: true, rows: 6 })}
    ${fld({ name: 'audience', label: 'Send to', type: 'select', options: siteOptions(S.ui.site === 'ALL' ? 'ALL' : S.ui.site).replace('All sites (organisation-wide)', 'All staff (every branch)'), required: true })}
    ${fld({ name: 'priority', label: 'Priority', type: 'select', options: opts(['Normal', 'Important']), required: true })}
    ${fld({ name: 'expires', label: 'Show until (optional)', type: 'date' })}
    ${fld({ name: 'attachment', label: 'Attachment (optional — e.g. memo PDF)', type: 'file' })}
    ${fld({ name: 'ackRequired', label: 'Staff must confirm "I have read and understood"', type: 'checkbox', full: true })}</div>`,
  buttons: [{ label: 'Publish notice', cls: 'primary', onClick: m => {
    if (!validateForm(m, fail => { const e = m.querySelector('[name=expires]'); if (e.value && e.value < TODAY) fail(e, 'Choose today or a later date.'); })) return false;
    const v = readForm(m); S.notices = S.notices || [];
    const n = { id: nextId('NT-', 'notices'), org: S.ui.org, title: v.title, body: v.body, priority: v.priority, audience: v.audience, ackRequired: v.ackRequired, attachment: v.attachment, expires: v.expires || null, publishedBy: S.ui.user, publishedOn: nowTs(), reads: { [S.ui.user]: nowTs() }, acks: {} };
    S.notices.push(n);
    addEvent(v.priority === 'Important' ? 'red' : 'blue', 'notices', `${v.priority === 'Important' ? 'Important notice' : 'New notice'}: ${v.title}`, `From ${pname(S.ui.user)} to ${v.audience === 'ALL' ? 'all staff' : sname(v.audience) + ' staff'}.`, '#/notices/' + n.id, v.audience);
    log(`Published notice "${v.title}"`, '#/notices/' + n.id); save();
    toast(`Notice published to ${noticeAudience(n).length} people${v.ackRequired ? ' — acknowledgement requested' : ''}.`); navigate('#/notices/' + n.id);
  } }] });
