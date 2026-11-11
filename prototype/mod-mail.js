/* ==========================================================================
   E-mail outbox (simulated) and personal notification settings
   --------------------------------------------------------------------------
   Every event that would e-mail someone in the live system is written to an
   outbox with the recipient, subject and full text, so the wording and the
   recipients can be checked now. Each person chooses which kinds of e-mail
   they receive. PROTOTYPE: nothing is actually sent.
   ========================================================================== */
'use strict';

const MAIL_CATS = { documents: 'Document approvals and reviews', actions: 'Corrective actions', incidents: 'Incidents and investigations', assets: 'Assets, defects and out-of-service', notices: 'Company notices and safety alerts', account: 'My account (sign-in, password)' };
function mailPrefs(p) { return Object.assign({ documents: true, actions: true, incidents: true, assets: true, notices: true, account: true, summary: true }, p.emailPrefs || {}); }

/* Queue one e-mail per recipient. The person who caused the event is not e-mailed about their own action. */
function queueEmail(to, cat, subject, text, link) {
  S.outbox = S.outbox || [];
  const ids = [...new Set((to || []).filter(Boolean))];
  const org = orgOf(S.ui.org) || S.orgs[0];
  ids.forEach(id => {
    const p = person(id);
    if (!p || !p.email || p.status === 'Deactivated' || (id === S.ui.user && cat !== 'account' && cat !== 'summary')) return;
    if (!mailPrefs(p)[cat]) return;   // the person turned this kind of e-mail off
    S.outbox.unshift({
      id: 'EM-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6), ts: nowTs(), org: org.id, to: id, toEmail: p.email, cat, subject,
      body: `Hello ${p.name.split(' ')[0]},\n\n${text}\n\n${link ? `Open it in the system: ${link}\n\n` : ''}Regards\n${org.short} HSEQ Management System\nPowered by VDW\n\nYou receive this e-mail because of your role in the system. You can choose which e-mails you receive under Notification settings.`,
      link: link || '', status: 'Not sent (prototype)'
    });
  });
  S.outbox = S.outbox.slice(0, 600);
}

/* ---------------- Viewing e-mails ---------------- */
function mailRow(e, showTo) {
  return `<tr class="rowlink" data-act="mailOpen" data-id="${e.id}"><td data-label="When" class="nowrap">${fmtTs(e.ts)}</td>${showTo ? `<td data-label="To"><b>${esc(pname(e.to))}</b><div class="t-sub">${esc(e.toEmail)}</div></td>` : ''}<td data-label="Subject"><div class="t-title">${esc(e.subject)}</div><div class="t-sub">${esc(MAIL_CATS[e.cat] || e.cat)}</div></td><td data-label="Status">${badge(e.status, 'grey')}</td></tr>`;
}
function mailTable(list, showTo, empty) {
  return list.length ? `<div class="table-wrap"><table class="tbl compact stackable"><thead><tr><th>When</th>${showTo ? '<th>To</th>' : ''}<th>Subject</th><th>Status</th></tr></thead><tbody>${list.map(e => mailRow(e, showTo)).join('')}</tbody></table></div>` : `<div class="empty">${icon('info')}<div>${empty}</div></div>`;
}
function myEmailHtml() {
  const list = (S.outbox || []).filter(e => e.to === S.ui.user).slice(0, 100);
  return `<div class="card"><div class="card-head"><h2>E-mails to you</h2><a class="btn sm" href="#/settings">${icon('settings', 'sm')} Notification settings</a></div><div class="card-body flush">${mailTable(list, false, 'No e-mails have been addressed to you yet.')}</div></div>`;
}
function outboxAdminHtml() {
  const list = (S.outbox || []).slice(0, 200), byCat = {};
  (S.outbox || []).forEach(e => { byCat[e.cat] = (byCat[e.cat] || 0) + 1; });
  return `<div class="alert info">${icon('info')}<div>Every e-mail the live system would send is recorded here, with its recipient and full text. <b>Nothing is sent from the prototype.</b> People choose which e-mails they receive under their own Notification settings.</div></div>
    <div class="kpis mini">${Object.keys(MAIL_CATS).map(k => `<div class="kpi t-blue" style="cursor:default"><div class="k-label">${esc(MAIL_CATS[k])}</div><div class="k-value">${byCat[k] || 0}</div><div class="k-sub">e-mails</div></div>`).join('')}</div>
    <div class="card mt"><div class="card-head"><h2>Outbox</h2><span class="ch-sub">${(S.outbox || []).length} e-mails · latest first</span></div><div class="card-body flush">${mailTable(list, true, 'No e-mails yet. They appear here as people approve documents, raise actions, report incidents and so on.')}</div></div>`;
}
ACT.mailOpen = (el) => {
  const e = (S.outbox || []).find(x => x.id === el.dataset.id); if (!e) return;
  openModal({ title: e.subject, sub: `To ${pname(e.to)} <${e.toEmail}> · ${fmtTs(e.ts)}`, size: 'wide',
    body: `<div class="mail-preview"><div class="mail-hdr"><div><span>From</span>${esc((orgOf(S.ui.org) || S.orgs[0]).short)} HSEQ &lt;no-reply@vdwhseq.demo&gt;</div><div><span>To</span>${esc(pname(e.to))} &lt;${esc(e.toEmail)}&gt;</div><div><span>Subject</span><b>${esc(e.subject)}</b></div></div><div class="mail-body">${esc(e.body).replace(/\n/g, '<br>')}</div></div>
      <p class="muted mt-s">${icon('info', 'sm')} ${esc(e.status)}. In the live system this e-mail is sent from the server.</p>`,
    buttons: e.link ? [{ label: 'Open the record', cls: 'primary', onClick: () => { navigate(e.link); } }] : [] });
};

/* ---------------- Personal notification settings ---------------- */
ROUTES.settings = () => {
  const p = me(), pr = mailPrefs(p);
  const html = `<div style="max-width:720px">${pageHead('Notification settings', 'Choose which e-mails you receive. In-app notifications and tasks are always shown.')}
    <form class="card" id="prefsForm"><div class="card-body" style="padding-top:14px">
      <p class="muted" style="margin-top:0">E-mails go to <b>${esc(p.email)}</b>.</p>
      ${Object.keys(MAIL_CATS).map(k => fld({ name: k, label: MAIL_CATS[k], type: 'checkbox', value: pr[k], full: true, hint: k === 'account' ? 'Always recommended: tells you when your password is reset.' : '' })).join('')}
    </div><div class="modal-foot" style="border-radius:0 0 12px 12px"><button class="btn primary" type="button" data-act="prefsSave">Save settings</button></div></form></div>`;
  return { title: 'Notification settings', crumbs: [['Notification settings', '#']], html };
};
ACT.prefsSave = () => { const v = readForm(document.getElementById('prefsForm')), p = me(); p.emailPrefs = {}; Object.keys(MAIL_CATS).forEach(k => { p.emailPrefs[k] = !!v[k]; }); log(`${p.name} changed their notification settings`, ''); save(); toast('Settings saved.'); };
