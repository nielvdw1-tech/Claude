/* ==========================================================================
   Sign-in (simulated) — accounts, passwords, sign-out, deactivation
   --------------------------------------------------------------------------
   Shows how sign-in will work in the live system: each person signs in with
   their own e-mail and password, an administrator can add people, reset a
   password (the person must change it at next sign-in) and deactivate
   people who leave. PROTOTYPE ONLY: passwords are hashed and kept in this
   browser, so this is not security — production signs in on a server.
   ========================================================================== */
'use strict';

const DEMO_PASSWORD = 'demo1234';
const MAX_FAILED = 5, LOCK_MINUTES = 15;

/* Small synchronous SHA-256 (hex) so passwords are never kept as plain text, even in the demo. */
function sha256(str) {
  const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  const bytes = new TextEncoder().encode(str), l = bytes.length, n = ((l + 9 + 63) >> 6) << 6, m = new Uint8Array(n);
  m.set(bytes); m[l] = 0x80; const dv = new DataView(m.buffer); dv.setUint32(n - 4, l * 8); dv.setUint32(n - 8, Math.floor(l / 0x20000000));
  let h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const w = new Uint32Array(64), r = (x, y) => (x >>> y) | (x << (32 - y));
  for (let o = 0; o < n; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4);
    for (let i = 16; i < 64; i++) { const s0 = r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0; }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const t1 = (hh + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) >>> 0, t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h = h.map((x, i) => (x + [a, b, c, d, e, f, g, hh][i]) >>> 0);
  }
  return h.map(x => x.toString(16).padStart(8, '0')).join('');
}
function passHash(uid, pw) { return sha256(uid + ':' + pw); }
// Every person with a system role has an account; demo accounts start with the demo password.
function account(p) {
  if (!p.auth) p.auth = { hash: passHash(p.id, DEMO_PASSWORD), mustChange: false, failed: 0, lockedUntil: null, lastSignIn: null };
  return p.auth;
}
function isActive(p) { return !!p && p.status !== 'Deactivated'; }
function signedIn() { const p = me(); return !!(p && p.sysRole && isActive(p)); }
function tempPassword() { const c = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 8; i++) s += c[Math.floor(Math.random() * c.length)]; return s; }
function pwProblem(pw) { if (pw.length < 8) return 'Use at least 8 characters.'; if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return 'Use letters and at least one number.'; return ''; }

function startSession(p) {
  NAV_STACK.length = 0;   // a new session starts a new back history
  const a = account(p); a.failed = 0; a.lockedUntil = null; a.lastSignIn = nowTs();
  S.ui.user = p.id; S.ui.org = p.org; S.ui.site = 'ALL';   // each sign-in starts in the person's own default view (branch-limited people are then narrowed to their branch)
  log(`${p.name} signed in`, ''); save();
  document.body.classList.remove('auth-mode');
  if (a.mustChange) { location.hash = '#/password'; rerender(); return; }
  if (S.ui.returnTo) { const back = S.ui.returnTo; S.ui.returnTo = null; save(); if (location.hash === back) rerender(); else location.hash = back; return; }   // e.g. back to the QR page that asked to sign in
  if (isFieldUser()) { if (location.hash !== '#/field') location.hash = '#/field'; else rerender(); }
  else if (!location.hash || location.hash === '#/' || location.hash === '#/signin' || location.hash === '#/password') { location.hash = '#/dashboard'; } else rerender();
}

/* ---------------- Sign-in page (shown instead of the app when nobody is signed in) ---------------- */
function renderSignIn(msg) {
  document.body.classList.add('auth-mode');
  document.getElementById('sidebar').innerHTML = ''; document.getElementById('topbar').innerHTML = '';
  const org = orgOf(S.ui.org) || S.orgs[0];
  const users = S.people.filter(p => p.sysRole && isActive(p));
  document.getElementById('content').innerHTML = `<div class="auth-wrap">
    <form class="card auth-card" id="signinForm" novalidate>
      <div class="auth-brand">${orgMark(org, 'sb')}<div><b>${esc(org.short)}</b><span>HSEQ Management System</span></div></div>
      <h1>Sign in</h1>
      ${msg ? `<div class="alert ${msg.type || 'danger'}">${icon(msg.type === 'info' ? 'info' : 'alert')}<div>${esc(msg.text)}</div></div>` : ''}
      ${fld({ name: 'email', label: 'Work e-mail', type: 'email', required: true, full: true, placeholder: 'name@company.co.za' })}
      ${fld({ name: 'password', label: 'Password', type: 'password', required: true, full: true })}
      <button class="btn primary auth-go" type="submit">Sign in</button>
      <p class="muted auth-help">Forgot your password? Ask your administrator to reset it.</p>
      <div class="auth-powered"><span class="logo-mark xs">VDW</span>Powered by VDW HSEQ</div>
    </form>
    <div class="card auth-demo"><div class="card-head"><h2>Demo accounts</h2><span class="ch-sub">Prototype only</span></div><div class="card-body">
      <p class="muted" style="margin-top:0">Every demo account uses the password <b class="mono">${DEMO_PASSWORD}</b>. Click a person to sign in as them.</p>
      <div class="auth-users">${users.map(u => `<button type="button" class="auth-user" data-act="demoSignIn" data-id="${u.id}"><span class="avatar sm">${initials(u.name)}</span><span><b>${esc(u.name)}</b><small>${esc(u.sysRole)} · ${esc(orgOf(u.org).short)}</small></span></button>`).join('')}</div>
      <p class="muted" style="font-size:11.5px">Passwords are checked in this browser only. In the live system sign-in happens on a secure server.</p>
    </div></div>
  </div>`;
  document.title = 'Sign in · VDW HSEQ';
  const f = document.getElementById('signinForm');
  f.addEventListener('submit', e => { e.preventDefault(); signInSubmit(f); });
  setTimeout(() => { const em = f.querySelector('[name=email]'); if (em) em.focus(); }, 30);
}
function signInSubmit(f) {
  if (!validateForm(f)) return;
  const v = readForm(f), p = S.people.find(x => x.sysRole && (x.email || '').toLowerCase() === v.email.trim().toLowerCase());
  const fail = (text) => renderSignIn({ text });
  if (!p) return fail('The e-mail or password is not correct.');
  const a = account(p);
  if (!isActive(p)) return fail('This account has been deactivated. Contact your administrator.');
  if (a.lockedUntil && a.lockedUntil > Date.now()) return fail(`Too many failed attempts. Try again in ${Math.ceil((a.lockedUntil - Date.now()) / 60000)} minute(s), or ask your administrator to reset your password.`);
  if (passHash(p.id, v.password) !== a.hash) {
    a.failed = (a.failed || 0) + 1;
    if (a.failed >= MAX_FAILED) { a.lockedUntil = Date.now() + LOCK_MINUTES * 60000; a.failed = 0; save(); return fail(`Too many failed attempts. The account is locked for ${LOCK_MINUTES} minutes.`); }
    save(); return fail(`The e-mail or password is not correct. ${MAX_FAILED - a.failed} attempt(s) left before the account is locked.`);
  }
  startSession(p);
}
ACT.demoSignIn = (el) => { const p = person(el.dataset.id); if (p && isActive(p)) startSession(p); };
ACT.signOut = () => { document.querySelectorAll('.dropdown').forEach(d => d.remove()); const p = me(); if (p) log(`${p.name} signed out`, ''); S.ui.user = null; save(); history.replaceState(null, '', '#/dashboard'); renderSignIn({ type: 'info', text: 'You have signed out.' }); };

/* ---------------- Change password (also forced after a reset) ---------------- */
ROUTES.password = () => {
  const a = account(me()), forced = a.mustChange;
  const html = `<div class="auth-wrap single"><form class="card auth-card" id="pwForm" novalidate>
    <h1>${forced ? 'Choose a new password' : 'Change password'}</h1>
    ${forced ? `<div class="alert info">${icon('lock')}<div>Your password was reset by an administrator. Choose your own password to continue.</div></div>` : ''}
    ${forced ? '' : fld({ name: 'current', label: 'Current password', type: 'password', required: true, full: true })}
    ${fld({ name: 'pw1', label: 'New password', type: 'password', required: true, full: true, hint: 'At least 8 characters, with letters and a number.' })}
    ${fld({ name: 'pw2', label: 'Repeat new password', type: 'password', required: true, full: true })}
    <button class="btn primary auth-go" type="button" data-act="pwSave">Save password</button>
    ${forced ? '' : `<a class="btn ghost mt-s" href="#/dashboard">Cancel</a>`}
  </form></div>`;
  return { title: 'Password', crumbs: [['Password', '#']], html };
};
ACT.pwSave = () => {
  const f = document.getElementById('pwForm'), p = me(), a = account(p), forced = a.mustChange;
  const v = readForm(f);
  if (!validateForm(f, fail => {
    if (!forced && passHash(p.id, v.current) !== a.hash) fail(f.querySelector('[name=current]'), 'This is not your current password.');
    const prob = pwProblem(v.pw1); if (prob) fail(f.querySelector('[name=pw1]'), prob);
    if (v.pw1 !== v.pw2) fail(f.querySelector('[name=pw2]'), 'The passwords do not match.');
    if (passHash(p.id, v.pw1) === a.hash) fail(f.querySelector('[name=pw1]'), 'Choose a password different from the current one.');
  })) return;
  a.hash = passHash(p.id, v.pw1); a.mustChange = false; log(`${p.name} changed their password`, ''); save();
  toast('Password changed.'); navigate(isFieldUser() ? '#/field' : '#/dashboard');
};

/* ---------------- Administration: add people, reset passwords, deactivate ---------------- */
function userOpenWork(uid) {
  return {
    actions: S.actions.filter(a => a.owner === uid && actionOpen(a)).length,
    investigations: S.incidents.filter(i => i.investigator === uid && i.status !== 'Closed').length,
    approvals: S.documents.filter(d => (curStep(docLatest(d)) || {}).person === uid).length,
    inspections: S.schedules.filter(s => s.assignee === uid).length
  };
}
function usersAdminHtml(ro) {
  const list = S.people.filter(x => x.sysRole && x.org === S.ui.org);
  return `${ro ? '' : `<div class="btn-row mb"><button class="btn primary" data-act="userNew">${icon('plus', 'sm')} Add user</button></div>`}
  <div class="card"><div class="card-body flush"><table class="tbl stackable"><thead><tr><th>User</th><th>Branch</th><th>System role</th><th>Status</th><th>Last sign-in</th><th></th></tr></thead><tbody>${list.map(u => { const a = account(u), act = isActive(u);
    return `<tr class="${act ? '' : 'row-muted'}"><td data-label="User"><b>${esc(u.name)}</b><div class="t-sub">${esc(u.email)}</div></td><td data-label="Branch">${esc(sname(u.site))}</td>
    <td data-label="Role">${ro || !act ? esc(u.sysRole) : `<select data-act-role="${u.id}" style="padding:5px;border:1px solid var(--line-strong);border-radius:6px">${opts(S.roles.map(r => r.name), u.sysRole)}</select>`}</td>
    <td data-label="Status">${act ? (a.lockedUntil && a.lockedUntil > Date.now() ? badge('Locked', 'amber') : a.mustChange ? badge('Must change password', 'blue') : badge('Active', 'green')) : badge('Deactivated', 'grey')}</td>
    <td data-label="Last sign-in">${a.lastSignIn ? fmtTs(a.lastSignIn) : '<span class="muted">Never</span>'}</td>
    <td data-label=""><div class="btn-row">${ro ? '' : act ? `<button class="btn sm" data-act="userReset" data-id="${u.id}">Reset password</button>${u.id !== S.ui.user ? `<button class="btn sm danger" data-act="userDeactivate" data-id="${u.id}">Deactivate</button>` : ''}` : `<button class="btn sm" data-act="userReactivate" data-id="${u.id}">Reactivate</button>`}${act ? `<button class="btn sm ghost" data-act="switchUser" data-id="${u.id}">Act as user</button>` : ''}</div></td></tr>`; }).join('')}</tbody></table></div></div>
  <p class="muted">Prototype: accounts and passwords are kept in this browser. In the live system the administrator's changes take effect on the server immediately.</p>`;
}
function showTempPassword(p, pw, title) {
  openModal({ title, sub: `${p.name} · ${p.email}`, body: `<div class="alert info">${icon('lock')}<div>Give this temporary password to ${esc(p.name)} in person or by phone. They must choose their own password when they sign in.</div></div><div class="temp-pw mono">${esc(pw)}</div><p class="muted">The live system e-mails a secure link instead of showing a password.</p>`, buttons: [{ label: 'Done', cls: 'primary', onClick: () => {} }] });
}
ACT.userReset = (el) => {
  const p = person(el.dataset.id);
  confirmBox('Reset password', `${esc(p.name)} will be given a temporary password and must choose a new one at next sign-in.`, 'Reset password', () => {
    const pw = tempPassword(), a = account(p); a.hash = passHash(p.id, pw); a.mustChange = true; a.failed = 0; a.lockedUntil = null;
    queueEmail([p.id], 'account', 'Your password has been reset', `${pname(S.ui.user)} reset your password for the HSEQ Management System. Your administrator will give you a temporary password; you will choose your own when you sign in. If you did not expect this, contact your administrator.`, '');
    log(`Reset the password of ${p.name}`, '#/admin/users'); save(); rerender(); setTimeout(() => showTempPassword(p, pw, 'Temporary password'), 60);   // after the confirm box has closed
  });
};
ACT.userDeactivate = (el) => {
  const p = person(el.dataset.id), w = userOpenWork(p.id), open = Object.entries(w).filter(([, n]) => n);
  const lbl = { actions: 'open corrective action(s)', investigations: 'open investigation(s)', approvals: 'document(s) waiting for their approval', inspections: 'inspection schedule(s) assigned' };
  confirmBox('Deactivate user', `${esc(p.name)} will no longer be able to sign in and will not be offered as an owner, approver or investigator. Their records stay on file.${open.length ? `<div class="alert warn mt-s">${icon('alert')}<div><b>Reassign their work first:</b> ${open.map(([k, n]) => `${n} ${lbl[k]}`).join(', ')}.</div></div>` : ''}`, 'Deactivate', () => {
    p.status = 'Deactivated'; p.deactivatedOn = TODAY; log(`Deactivated ${p.name}`, '#/admin/users'); save(); toast(`${esc(p.name)} has been deactivated.`); rerender();
  }, 'danger solid');
};
ACT.userReactivate = (el) => { const p = person(el.dataset.id); p.status = 'Active'; delete p.deactivatedOn; log(`Reactivated ${p.name}`, '#/admin/users'); save(); toast(`${esc(p.name)} is active again.`); rerender(); };
ACT.userNew = () => openModal({ title: 'Add user', sub: 'The person receives a temporary password and chooses their own at first sign-in.', size: 'wide',
  body: `<div class="form-grid">${fld({ name: 'name', label: 'Full name', required: true })}${fld({ name: 'email', label: 'Work e-mail', type: 'email', required: true })}${fld({ name: 'jobTitle', label: 'Job title', required: true })}${fld({ name: 'site', label: 'Branch', type: 'select', options: siteOptions(defaultSite(), false), required: true })}${fld({ name: 'sysRole', label: 'System role', type: 'select', options: opts(S.roles.map(r => r.name), 'Employee'), required: true })}${fld({ name: 'dept', label: 'Department', type: 'select', options: opts(S.departments) })}</div>`,
  buttons: [{ label: 'Add user', cls: 'primary', onClick: m => {
    const v = readForm(m);
    if (!validateForm(m, fail => { const em = m.querySelector('[name=email]'); if (v.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email.trim())) fail(em, 'Enter a valid e-mail address.'); else if (S.people.some(x => (x.email || '').toLowerCase() === v.email.trim().toLowerCase())) fail(em, 'Someone already uses this e-mail address.'); })) return false;
    const id = nextId('P-', 'people'), pw = tempPassword();
    const p = { id, name: v.name.trim(), jobTitle: v.jobTitle.trim(), site: v.site, org: siteOrgOf(v.site), dept: v.dept, type: 'Employee', sysRole: v.sysRole, email: v.email.trim(), status: 'Active', started: TODAY, auth: { hash: passHash(id, pw), mustChange: true, failed: 0, lockedUntil: null, lastSignIn: null } };
    S.people.push(p); queueEmail([p.id], 'account', 'Your account for the HSEQ Management System', `${pname(S.ui.user)} created an account for you (${p.sysRole}, ${sname(p.site)}). Sign in with this e-mail address and the temporary password your administrator gives you; you will then choose your own password.`, '');
    log(`Added user ${p.name} (${p.sysRole})`, '#/admin/users'); save(); rerender(); setTimeout(() => showTempPassword(p, pw, 'User added'), 60);
  } }] });
