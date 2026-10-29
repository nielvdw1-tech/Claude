/* ==========================================================================
   Company notices — memos and important information for staff
   --------------------------------------------------------------------------
   Managers publish a notice to everyone or to one branch, optionally with an
   attachment and a "read and understood" acknowledgement. Every user (field
   users included) sees notices addressed to them with an unread count;
   publishers see who has read and acknowledged each notice.

   Incident safety alerts: every reported incident produces a draft notice
   that staff only see after it is approved in sequence by the HSEQ Manager
   and then the Safety Consultant (either can decide not to share it).
   ========================================================================== */
'use strict';

function noticeFor(n, p) { return !!p && n.org === p.org && (n.audience === 'ALL' || n.audience === p.site); }
function noticeLive(n) { return !n.expires || daysTo(n.expires) >= 0; }
function noticeAudience(n) { return S.people.filter(p => p.sysRole && noticeFor(n, p)); }
function noticePublished(n) { return !n.status || n.status === 'Published'; }
function myNotices() { const u = me(); return (S.notices || []).filter(n => noticePublished(n) && noticeFor(n, u) && noticeLive(n)).sort((a, b) => b.publishedOn.localeCompare(a.publishedOn)); }
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
  const pend = (S.notices || []).filter(n => n.status === 'Pending approval' && n.org === S.ui.org && (pub || noticeCurStep(n).person === S.ui.user));
  const all = pub ? (S.notices || []).filter(n => n.org === S.ui.org && (S.ui.site === 'ALL' || n.audience === 'ALL' || n.audience === S.ui.site)).sort((a, b) => b.publishedOn.localeCompare(a.publishedOn)) : [];
  const html = `<div class="${isFieldUser() ? 'mobile-card' : ''}">
    ${pageHead('Company notices', 'Memos and important information shared with staff. Notices marked "Please acknowledge" need you to confirm that you have read and understood them.', pub ? `<button class="btn primary" data-act="noticeNew">${icon('plus', 'sm')} Publish notice</button>` : '')}
    ${pend.length ? `<div class="card mb"><div class="card-head"><h2>${icon('alert', 'sm')} Safety alerts awaiting approval</h2><span class="ch-sub">Not visible to staff until the HSEQ Manager and the Safety Consultant have both approved</span></div><div class="card-body flush"><ul class="link-list" style="padding:4px 16px">${pend.map(n => { const c = noticeCurStep(n); return `<li><div class="ll-main"><a href="#/notices/${n.id}">${esc(n.title)}</a><div>From incident ${esc(n.source.id)} · Step ${c.step} of ${n.approvals.length}: ${esc(c.label)} — ${esc(pname(c.person))}</div></div>${c.person === S.ui.user ? badge('Your approval', 'amber') : badge('Awaiting approval', 'blue')}</li>`; }).join('')}</ul></div></div>` : ''}
    ${pub && all.length ? `<div class="card mb"><div class="card-head"><h2>All notices</h2><span class="ch-sub">Read and acknowledgement status</span></div><div class="card-body flush"><div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Notice</th><th>Audience</th><th>Published</th><th>Read</th><th>Acknowledged</th><th>Status</th></tr></thead><tbody>
      ${all.map(n => { if (!noticePublished(n)) return `<tr class="rowlink" data-href="#/notices/${n.id}"><td data-label="Notice"><div class="t-title">${esc(n.title)}</div><div class="t-sub">Safety alert from ${esc(n.source.id)}</div></td><td data-label="Audience">${esc(n.audience === 'ALL' ? 'All staff' : sname(n.audience))}</td><td data-label="Published">—</td><td data-label="Read">—</td><td data-label="Acknowledged">—</td><td data-label="Status">${noticeStatusBadge(n)}</td></tr>`; const aud = noticeAudience(n), rd = aud.filter(x => !noticeUnread(n, x.id)).length, ak = aud.filter(x => (n.acks || {})[x.id]).length; return `<tr class="rowlink" data-href="#/notices/${n.id}"><td data-label="Notice"><div class="t-title">${esc(n.title)}</div><div class="t-sub">${n.priority === 'Important' ? 'Important · ' : ''}${esc(pname(n.publishedBy))}</div></td><td data-label="Audience">${esc(n.audience === 'ALL' ? 'All staff' : sname(n.audience))}</td><td data-label="Published">${fmt(n.publishedOn)}</td><td data-label="Read">${rd} of ${aud.length}</td><td data-label="Acknowledged">${n.ackRequired ? `<span class="due ${ak === aud.length ? 'green' : 'amber'}">${ak} of ${aud.length}</span>` : '<span class="muted">Not required</span>'}</td><td data-label="Status">${noticeStatusBadge(n)}</td></tr>`; }).join('')}
    </tbody></table></div></div></div><h4 class="mb">Notices addressed to you</h4>` : ''}
    <div class="notice-list">${mine.length ? mine.map(noticeCard).join('') : `<div class="card"><div class="empty">${icon('info')}<div>There are no notices for you at the moment.</div></div></div>`}</div>
  </div>`;
  return { title: 'Company notices', nav: 'notices', crumbs: [['Company notices', '#/notices']], html };
};

function noticeDetail(id) {
  const n = (S.notices || []).find(x => x.id === id);
  if (!n || !((noticePublished(n) && noticeFor(n, me())) || (can('notice.publish') && n.org === S.ui.org) || (n.approvals || []).some(s => s.person === S.ui.user))) return ROUTES.notfound();
  if (!noticePublished(n)) return alertApprovalDetail(n);
  if (noticeFor(n, me()) && noticeUnread(n)) { n.reads = n.reads || {}; n.reads[S.ui.user] = nowTs(); save(); }   // opening a notice marks it as read
  const pub = can('notice.publish'), aud = noticeAudience(n), ack = noticeNeedsAck(n) && noticeFor(n, me());
  const html = `<div class="mobile-card" style="max-width:820px">
    <div class="card notice-sheet ${n.priority === 'Important' ? 'notice-imp' : ''}"><div class="card-body" style="padding-top:18px">
      <div class="notice-top">${n.priority === 'Important' ? badge('Important', 'red') : badge('Notice', 'blue')}<span class="notice-date">${fmtTs(n.publishedOn)}</span></div>
      <h1 style="margin:10px 0 6px">${esc(n.title)}</h1>
      <div class="notice-meta">From ${esc(pname(n.publishedBy))}${n.source ? ` · Safety alert approved by ${n.approvals.map(s => esc(pname(s.person))).join(' and ')}` : ''} · To ${esc(n.audience === 'ALL' ? 'all staff' : sname(n.audience) + ' staff')}${n.expires ? ` · Until ${fmt(n.expires)}` : ''}</div>
      <div class="notice-body">${esc(n.body).replace(/\n/g, '<br>')}</div>
      ${n.attachment ? `<div class="mt">${fileChip(n.attachment)}</div>` : ''}
      ${noticeFor(n, me()) && n.ackRequired ? `<div class="notice-ack">${ack ? `<div><b>Please confirm you have read and understood this notice.</b></div><button class="btn primary" data-act="noticeAck" data-id="${n.id}">${icon('check', 'sm')} I have read and understood</button>` : `${icon('checkCircle', 'sm')}<span>You acknowledged this notice on ${fmtTs(n.acks[S.ui.user])}.</span>`}</div>` : ''}
    </div></div>
    ${pub && n.source ? `<div class="card mt"><div class="card-head"><h2>Approval</h2><a class="btn sm" href="#/incidents/${n.source.id}">Open ${esc(n.source.id)}</a></div><div class="card-body">${routeHtml({ route: n.approvals })}</div></div>` : ''}
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

function noticeStatusBadge(n) {
  if (n.status === 'Pending approval') return badge('Awaiting approval', 'amber');
  if (n.status === 'Not shared') return badge('Not shared', 'grey');
  return noticeLive(n) ? badge('Live', 'green') : badge('Expired', 'grey');
}

/* ---------------- Incident safety alerts (approval before publishing) ---------------- */
const ALERT_APPROVERS = [['HSEQ Manager approval', 'HSEQ Manager'], ['Safety Consultant approval', 'Safety Consultant']];
function noticeCurStep(n) { return (n.approvals || []).find(s => s.status === 'Current'); }
function alertRoute(org) {
  const pick = role => S.people.find(p => p.sysRole === role && p.org === org && p.status === 'Active') || S.people.find(p => p.sysRole === role && p.status === 'Active');
  return ALERT_APPROVERS.map(([label, role], k) => ({ step: k + 1, label, person: (pick(role) || {}).id || null, status: k ? 'Pending' : 'Current', ts: null, comment: '' }));
}
function incidentAlerts(i) { return (S.notices || []).filter(n => n.source && n.source.type === 'Incident' && n.source.id === i.id); }
// Draft text: what happened and what was done — names and injury details are left out on purpose.
function incidentAlertBody(i) {
  return `${i.type} at ${sname(i.site)} (${i.location}) on ${fmt(i.date)}.\n\nWhat happened: ${i.description}\n\nImmediate action taken: ${i.immediate}\n\nThe incident is being investigated. Be alert to similar hazards in your own work area and report any unsafe condition to your supervisor.`;
}
function createIncidentAlert(i) {
  S.notices = S.notices || [];
  const n = { id: nextId('NT-', 'notices'), org: i.org, title: `Safety alert: ${i.title}`, body: incidentAlertBody(i), priority: i.type === 'Injury' || i.potentialSev >= 4 ? 'Important' : 'Normal', audience: i.site, ackRequired: true, attachment: null, expires: null,
    status: 'Pending approval', source: { type: 'Incident', id: i.id }, createdBy: S.ui.user, createdOn: nowTs(), publishedBy: null, publishedOn: nowTs(), approvals: alertRoute(i.org), reads: {}, acks: {} };
  S.notices.push(n);
  const c = noticeCurStep(n);
  addEvent('amber', 'notices', `Safety alert awaiting approval: ${i.id}`, `${pname(c.person)} to review the draft notice before it is shared with staff.`, '#/notices/' + n.id, i.site);
  i.history.push({ ts: nowTs(), by: S.ui.user, action: `Draft safety alert ${n.id} sent for approval (HSEQ Manager, then Safety Consultant)`, comment: '' });
  return n;
}

function alertApprovalDetail(n) {
  const c = noticeCurStep(n), mine = c && c.person === S.ui.user, inc = byId('incidents', n.source.id);
  const B = [];
  if (mine) B.push(`<button class="btn success" data-act="alertApprove" data-id="${n.id}">${icon('check', 'sm')} Review & approve</button>`, `<button class="btn danger" data-act="alertDecline" data-id="${n.id}">Do not share</button>`);
  else if (c && can('notice.publish')) B.push(`<button class="btn" data-act="alertActAs" data-id="${n.id}">${icon('user', 'sm')} Act as current approver</button>`);
  const html = `<div style="max-width:880px">
    <div class="status-hero"><div><div class="sh-id">${n.id} · Safety alert from <a href="#/incidents/${n.source.id}">${esc(n.source.id)}</a></div><h1 style="margin:2px 0 6px">${esc(n.title)}</h1><div class="btn-row">${noticeStatusBadge(n)}${c ? ` <span class="muted">Step ${c.step} of ${n.approvals.length}: ${esc(c.label)} — ${esc(pname(c.person))}</span>` : ''}</div></div><div class="sh-actions">${B.join('')}</div></div>
    ${n.status === 'Pending approval' ? `<div class="alert info mb">${icon('lock')}<div><b>Not visible to staff yet.</b> This alert is published to ${esc(n.audience === 'ALL' ? 'all staff' : sname(n.audience) + ' staff')} only after the HSEQ Manager and then the Safety Consultant approve it. Each approver can edit the wording first.</div></div>` : `<div class="alert demo mb">${icon('info')}<div>This alert was not shared with staff.</div></div>`}
    <div class="card notice-sheet ${n.priority === 'Important' ? 'notice-imp' : ''}"><div class="card-head"><h2>Draft notice</h2><span class="ch-sub">As staff will see it</span></div><div class="card-body">
      <div class="notice-top">${n.priority === 'Important' ? badge('Important', 'red') : badge('Notice', 'blue')}${n.ackRequired ? badge('Acknowledgement required', 'amber') : ''}</div>
      <div class="notice-body">${esc(n.body).replace(/\n/g, '<br>')}</div>
      <div class="notice-meta mt">To ${esc(n.audience === 'ALL' ? 'all staff' : sname(n.audience) + ' staff')}</div>
    </div></div>
    <div class="card mt"><div class="card-head"><h2>Approval route</h2></div><div class="card-body">${routeHtml({ route: n.approvals })}</div></div>
    ${inc ? `<div class="card mt"><div class="card-head"><h2>Source incident</h2></div><div class="card-body"><div class="kv"><div>Incident</div><div><a href="#/incidents/${inc.id}">${inc.id}</a> · ${esc(inc.title)}</div><div>Status</div><div>${sbadge(inc.status)}</div><div>Draft created by</div><div>${esc(pname(n.createdBy))} · ${fmtTs(n.createdOn)}</div></div></div></div>` : ''}
    <a class="btn mt" href="#/notices">← Back</a>
  </div>`;
  return { title: n.title, nav: 'notices', crumbs: [['Company notices', '#/notices'], [n.id, '#']], html };
}

ACT.alertActAs = (el) => { const c = noticeCurStep(S.notices.find(x => x.id === el.dataset.id)); if (c) ACT.switchUser({ dataset: { id: c.person } }); };
ACT.alertApprove = (el) => {
  const n = S.notices.find(x => x.id === el.dataset.id), c = noticeCurStep(n), last = c.step === n.approvals.length;
  openModal({ title: `Approve safety alert — step ${c.step} of ${n.approvals.length}`, sub: last ? 'You are the final approver. Approving publishes the alert to staff straight away.' : `After you approve, it goes to ${pname(n.approvals[c.step].person)} (${n.approvals[c.step].label}).`, size: 'wide',
    body: `<div class="form-grid">${fld({ name: 'title', label: 'Title', value: n.title, required: true, full: true })}${fld({ name: 'body', label: 'Message', type: 'textarea', value: n.body, required: true, full: true, rows: 8 })}
      ${fld({ name: 'audience', label: 'Send to', type: 'select', options: siteOptions(n.audience).replace('All sites (organisation-wide)', 'All staff (every branch)'), required: true })}
      ${fld({ name: 'priority', label: 'Priority', type: 'select', options: opts(['Normal', 'Important'], n.priority), required: true })}
      ${fld({ name: 'ackRequired', label: 'Staff must confirm "I have read and understood"', type: 'checkbox', value: n.ackRequired, full: true })}
      ${fld({ name: 'comment', label: 'Comment (optional)', full: true })}</div>
      <p class="muted mt-s">${icon('lock', 'sm')} Check that the message names no injured person and holds no medical details.</p>`,
    buttons: [{ label: last ? 'Approve & publish' : 'Approve', cls: 'success', onClick: m => {
      if (!validateForm(m)) return false;
      const v = readForm(m), inc = byId('incidents', n.source.id);
      Object.assign(n, { title: v.title, body: v.body, audience: v.audience, priority: v.priority, ackRequired: v.ackRequired });
      Object.assign(c, { status: 'Approved', ts: nowTs(), comment: v.comment || '' });
      if (!last) {
        const nx = n.approvals[c.step]; nx.status = 'Current';
        addEvent('amber', 'notices', `Safety alert awaiting approval: ${n.source.id}`, `${pname(nx.person)} to review the draft notice before it is shared with staff.`, '#/notices/' + n.id, n.audience);
        toast(`Approved. Sent to ${pname(nx.person)} for ${nx.label.toLowerCase()}.`);
      } else {
        Object.assign(n, { status: 'Published', publishedBy: S.ui.user, publishedOn: nowTs(), reads: { [S.ui.user]: nowTs() } });
        addEvent(n.priority === 'Important' ? 'red' : 'blue', 'notices', `Safety alert: ${n.title.replace(/^Safety alert:\s*/, '')}`, `Shared with ${n.audience === 'ALL' ? 'all staff' : sname(n.audience) + ' staff'} after approval.`, '#/notices/' + n.id, n.audience);
        toast(`Safety alert published to ${noticeAudience(n).length} people.`);
      }
      if (inc) inc.history.push({ ts: nowTs(), by: S.ui.user, action: last ? `Safety alert ${n.id} approved and published to staff` : `Safety alert ${n.id} approved (${c.label})`, comment: v.comment || '' });
      log(`${c.label} given for safety alert ${n.id}${last ? ' — published' : ''}`, '#/notices/' + n.id); save(); rerender();
    } }] });
};
ACT.alertDecline = (el) => {
  const n = S.notices.find(x => x.id === el.dataset.id), c = noticeCurStep(n);
  openModal({ title: 'Do not share this alert', sub: `${n.id} will not be shown to staff. It stays on record with the incident.`, body: fld({ name: 'comment', label: 'Reason', type: 'textarea', required: true, full: true }),
    buttons: [{ label: 'Do not share', cls: 'danger solid', onClick: m => {
      if (!validateForm(m)) return false;
      const why = readForm(m).comment, inc = byId('incidents', n.source.id);
      Object.assign(c, { status: 'Rejected', ts: nowTs(), comment: why }); n.approvals.filter(s => s.status === 'Pending').forEach(s => { s.status = 'Cancelled'; }); n.status = 'Not shared';
      if (inc) inc.history.push({ ts: nowTs(), by: S.ui.user, action: `Safety alert ${n.id} not shared`, comment: why });
      log(`Decided not to share safety alert ${n.id}`, '#/notices/' + n.id); save(); toast('The alert will not be shared.'); rerender();
    } }] });
};
ACT.alertPrepare = (el) => { const i = byId('incidents', el.dataset.id); const n = createIncidentAlert(i); log(`Prepared safety alert ${n.id} for ${i.id}`, '#/notices/' + n.id); save(); toast('Draft safety alert sent for approval.'); navigate('#/notices/' + n.id); };

// Incident page card: the alert's state, or a button to prepare one.
function incidentAlertCard(i) {
  const list = incidentAlerts(i), active = list.some(n => n.status !== 'Not shared');
  return `<div class="card"><div class="card-head"><h2>Safety alert to staff</h2>${!active ? permBtn('notice.publish', `<button class="btn sm" data-act="alertPrepare" data-id="${i.id}">Prepare alert</button>`) : ''}</div><div class="card-body">
    ${list.length ? `<ul class="link-list">${list.map(n => { const c = noticeCurStep(n); return `<li><div class="ll-main"><a href="#/notices/${n.id}">${n.id}</a><div>${c ? `Waiting for ${esc(pname(c.person))} (${esc(c.label)})` : n.status === 'Published' ? `Published ${fmt(n.publishedOn)}` : 'Not shared'}</div></div>${noticeStatusBadge(n)}</li>`; }).join('')}</ul>` : '<p class="muted">No alert prepared.</p>'}
    <p class="muted mt-s">Alerts reach staff only after the HSEQ Manager and the Safety Consultant approve them.</p></div></div>`;
}
