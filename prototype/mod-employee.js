/* ==========================================================================
   Employee app (phone first; also used on a PC)
   - One home screen with everything the employee needs: what needs their
     attention now, and tiles for scan & inspect, report incident, my
     appointments, my PPE, my training, notifications, notices, documents to
     read, my inspections and my incidents. Each tile opens its own page.
   - Every employee page has a clear Back / Home bar.
   - PPE receipt is signed like an appointment: tick "received", sign, submit.
   ========================================================================== */
'use strict';

const empNotifs = () => (typeof buildNotifs === 'function' ? buildNotifs() : []).filter(n => !S.readNotifs[n.key]);
function empCounts() {
  const uid = S.ui.user, x = me();
  const apt = (S.appointments || []).filter(a => a.person === uid && ['Sent to employee', 'Awaiting acknowledgement', 'Awaiting acceptance'].includes(a.status)).length;
  const ppe = (S.ppeIssues || []).filter(i => i.person === uid && !ppeSigned(i)).length;
  const tr = x && typeof requiredFor === 'function' ? requiredFor(x).filter(r => ['Missing', 'Expired', 'Expiring', 'Not yet competent', 'Assessment outstanding'].includes(trStatus(x.id, r.course))).length : 0;
  const ins = S.schedules.filter(s => s.assignee === uid && s.asset && daysTo(s.nextDue) <= 7).length;
  const read = typeof docsToRead === 'function' ? docsToRead().length : 0;
  const notices = typeof myNotices === 'function' ? myNotices().filter(n => noticeUnread(n) || noticeNeedsAck(n)).length : 0;
  const ra = typeof raToSign === 'function' ? raToSign(uid).length : 0;
  return { apt, ppe, tr, ins, read, notices, ra, notif: empNotifs().length, inc: S.incidents.filter(i => i.reporter === uid && i.status !== 'Closed').length };
}
function greeting() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }

ROUTES.field = (p, q = {}) => {
  const x = me(), c = empCounts(), SEVR = { red: 0, amber: 1, blue: 2 }, tasks = myTasks().sort((a, b) => (SEVR[a.sev] ?? 3) - (SEVR[b.sev] ?? 3));
  const tile = (href, ic, label, sub, n, tone, act) => `<${act ? `button type="button" data-act="${act}"` : `a href="${href}"`} class="emp-tile${tone ? ' t-' + tone : ''}"><span class="et-ic">${icon(ic)}</span><span class="et-txt"><b>${label}</b><small>${sub}</small></span>${n ? `<span class="et-n">${n}</span>` : ''}</${act ? 'button' : 'a'}>`;
  const html = `<div class="emp">
    ${q.blocked ? `<div class="alert info">${icon('lock')}<div>That page is not available for your role.</div></div>` : ''}
    <section class="emp-hero"><div class="eh-av">${esc(initials(x.name))}</div><div class="eh-txt"><span>${greeting()},</span><h1>${esc(x.name.split(' ')[0])}</h1><small>${esc(x.jobTitle || '')} · ${esc(sname(x.site))} · ${fmt(TODAY)}</small></div>
      <div class="eh-status ${tasks.length ? 'is-todo' : 'is-ok'}">${tasks.length ? `<b>${tasks.length}</b> thing${tasks.length > 1 ? 's' : ''} need${tasks.length > 1 ? '' : 's'} your attention` : `${icon('checkCircle', 'sm')} You are up to date`}</div></section>
    <div class="emp-quick">${tile('', 'qr', 'Scan & inspect', 'Scan the QR code on equipment', 0, 'primary', 'qrScan')}${tile('#/report', 'siren', 'Report incident', 'Injury, near miss or damage', 0, 'accent')}</div>
    ${tasks.length ? `<section class="emp-card"><header><h2>Needs your attention</h2><a href="#/notifications">See all</a></header><ul class="emp-todo">${tasks.slice(0, 6).map(t => `<li class="sev-${t.sev}"><a href="${t.link}"><b>${esc(t.title)}</b><small>${esc(t.sub || '')}</small></a>${icon('chevronR', 'sm')}</li>`).join('')}</ul></section>` : ''}
    ${(() => { const nn = typeof myNotices === 'function' ? myNotices().filter(n => noticeUnread(n) || noticeNeedsAck(n) || n.priority === 'Important').slice(0, 2) : []; return nn.length ? `<section class="emp-card emp-notices"><header><h2>Notices for you</h2><a href="#/notices">All notices</a></header><div class="notice-list">${nn.map(noticeCard).join('')}</div></section>` : ''; })()}
    <h3 class="emp-h">My work</h3>
    <div class="emp-grid">
      ${tile('#/me', 'user', 'My appointments', c.apt ? `${c.apt} to accept` : 'Read, accept and sign', c.apt, c.apt ? 'warn' : '')}
      ${tile('#/myppe', 'hardhat', 'My PPE', c.ppe ? `${c.ppe} to sign for` : 'Issued to me', c.ppe, c.ppe ? 'warn' : '')}
      ${tile('#/myra', 'risk', 'Risk assessments', c.ra ? `${c.ra} to read and sign` : 'The ones I took part in', c.ra, c.ra ? 'warn' : '')}
      ${tile('#/mytraining', 'checkCircle', 'My training', c.tr ? `${c.tr} need attention` : 'Courses and certificates', c.tr, c.tr ? 'warn' : '')}
      ${tile('#/notifications', 'bell', 'Notifications', c.notif ? `${c.notif} unread` : 'All read', c.notif, '')}
      ${tile('#/notices', 'info', 'Company notices', c.notices ? `${c.notices} to read` : 'From management', c.notices, c.notices ? 'warn' : '')}
      ${tile('#/myreading', 'docs', 'Documents to read', c.read ? `${c.read} to read and sign` : 'Procedures for my work', c.read, c.read ? 'warn' : '')}
      ${tile('#/myinspections', 'clipboard', 'My inspections', c.ins ? `${c.ins} due this week` : 'Equipment I inspect', c.ins, c.ins ? 'warn' : '')}
      ${tile('#/myincidents', 'alert', 'My incident reports', c.inc ? `${c.inc} open` : 'What I reported', 0, '')}
    </div>
    ${typeof fieldQueueHtml === 'function' ? fieldQueueHtml() : ''}
  </div>`;
  return { title: 'Home', nav: 'field', crumbs: [['Home', '#/field']], html };
};

/* ---------------- Employee sub-pages ---------------- */
const empPage = (title, lead, body) => `<div class="emp"><div class="emp-head"><h1>${title}</h1>${lead ? `<p>${lead}</p>` : ''}</div>${body}</div>`;
ROUTES.mytraining = () => { const x = me(), req = typeof requiredFor === 'function' ? requiredFor(x) : [], recs = (S.trainingRecs || []).filter(r => r.person === x.id).sort((a, b) => b.date.localeCompare(a.date));
  const body = `<section class="emp-card"><header><h2>Training required for your work</h2></header>${req.length ? `<ul class="emp-list">${req.map(q => { const s = trStatus(x.id, q.course), r = lastRecord(x.id, q.course), ses = bookedFor(x.id, q.course); return `<li><div><b>${esc(course(q.course).name)}</b><small>${esc(q.why)}${r && r.expires ? ' · valid until ' + fmt(r.expires) : ''}${ses ? ' · booked for ' + fmt(ses.date) + (ses.venue ? ', ' + esc(ses.venue) : '') : ''}</small></div>${badge(s, TR_TONE[s], true)}</li>`; }).join('')}</ul>` : '<p class="emp-empty">No training is required for your work at the moment.</p>'}</section>
    <section class="emp-card"><header><h2>My training records</h2></header>${recs.length ? `<ul class="emp-list">${recs.map(r => `<li><div><b>${esc((course(r.course) || {}).name || '')}</b><small>${fmt(r.date)}${r.provider ? ' · ' + esc(r.provider) : ''}${r.expires ? ' · valid until ' + fmt(r.expires) : ''}</small></div>${r.cert ? `<button type="button" class="btn sm" ${fileAttrs(r.cert)}>Certificate</button>` : ''}</li>`).join('')}</ul>` : '<p class="emp-empty">No training recorded yet.</p>'}</section>`;
  return { title: 'My training', nav: 'mytraining', crumbs: [['Home', '#/field'], ['My training', '#']], html: empPage('My training', 'Your required courses, when they expire and your certificates.', body) }; };
ROUTES.myinspections = () => { const mine = S.schedules.filter(s => s.assignee === S.ui.user && s.asset).sort((a, b) => a.nextDue.localeCompare(b.nextDue)), done = S.inspections.filter(i => i.inspector === S.ui.user).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  const body = `<button type="button" class="emp-tile t-primary wide" data-act="qrScan"><span class="et-ic">${icon('qr')}</span><span class="et-txt"><b>Scan & inspect</b><small>Scan the QR code on the equipment to start</small></span></button>
    <section class="emp-card"><header><h2>Inspections assigned to me</h2></header>${mine.length ? `<ul class="emp-list">${mine.map(s => { const a = byId('assets', s.asset); return `<li><div><b>${esc(a.tag)} — ${esc(a.name)}</b><small>${esc(a.location || '')} · every ${s.freqDays} days</small></div>${dueText(s.nextDue)}</li>`; }).join('')}</ul>` : '<p class="emp-empty">No inspections are assigned to you.</p>'}</section>
    <section class="emp-card"><header><h2>Inspections I completed</h2></header>${done.length ? `<ul class="emp-list">${done.map(i => { const f = (i.results || []).filter(r => r.result === 'Fail').length; return `<li><div><b>${esc(i.target || i.id)}</b><small>${i.id} · ${fmt(i.date)}</small></div>${badge(f ? f + ' failed' : 'All passed', f ? 'red' : 'green', true)}</li>`; }).join('')}</ul>` : '<p class="emp-empty">None yet.</p>'}</section>`;
  return { title: 'My inspections', nav: 'myinspections', crumbs: [['Home', '#/field'], ['My inspections', '#']], html: empPage('My inspections', '', body) }; };
ROUTES.myincidents = () => { const L = S.incidents.filter(i => i.reporter === S.ui.user).sort((a, b) => b.date.localeCompare(a.date));
  const body = `<a href="#/report" class="emp-tile t-accent wide"><span class="et-ic">${icon('siren')}</span><span class="et-txt"><b>Report an incident</b><small>Injury, near miss, property damage or environmental</small></span></a>
    <section class="emp-card"><header><h2>Incidents I reported</h2></header>${L.length ? `<ul class="emp-list">${L.map(i => `<li><div><b>${esc(i.title)}</b><small>${i.id} · ${fmt(i.date)} · ${esc(i.type)}</small></div>${sbadge(i.status)}</li>`).join('')}</ul>` : '<p class="emp-empty">You have not reported any incidents.</p>'}</section>`;
  return { title: 'My incident reports', nav: 'myincidents', crumbs: [['Home', '#/field'], ['My incident reports', '#']], html: empPage('My incident reports', 'You are told when the status of your report changes.', body) }; };
ROUTES.myreading = () => { const inner = typeof fieldReadHtml === 'function' ? fieldReadHtml() : '';
  return { title: 'Documents to read', nav: 'myreading', crumbs: [['Home', '#/field'], ['Documents to read', '#']], html: empPage('Documents to read', 'Open each document, read it, then tick that you understood it and sign.', inner || `<section class="emp-card"><p class="emp-empty">There are no documents for you to read.</p></section>`) }; };

/* ---------------- PPE: sign for receipt (like an appointment) ---------------- */
const PPESIG = { sig: null };
ACT.ppeAck = (el) => { const ids = el.dataset.all ? (S.ppeIssues || []).filter(i => i.person === S.ui.user && !ppeSigned(i)).map(i => i.id) : [el.dataset.id], L = ids.map(id => byId('ppeIssues', id));
  openModal({ title: 'Sign for your PPE', sub: 'Check the items, then confirm and sign. Your signature is kept as the record of issue.', body: `<ul class="emp-list boxed">${L.map(i => `<li><div><b>${i.qty} × ${esc(ppeType(i.ppe).name)}</b><small>${i.size ? 'Size ' + esc(i.size) + ' · ' : ''}issued ${fmt(i.date)} by ${esc(pname(i.by))}${i.replaceBy ? ' · replace by ' + fmt(i.replaceBy) : ''}</small></div></li>`).join('')}</ul>
    <label class="check mt-s"><input type="checkbox" id="ppeOk"> <span><b>I have read this and I received the PPE above in good condition.</b> I know how to use it and look after it, and I will report it when it is worn, damaged or lost.</span></label>
    <div class="field full mt-s" id="ppeSigField"><label for="ppeSig">Your signature<span class="req">*</span></label><div class="sig-wrap"><canvas id="ppeSig" class="sig-pad"></canvas><div class="sig-foot"><span>${esc(pname(S.ui.user))} · ${fmt(TODAY)}</span><button type="button" class="btn sm" data-act="ppeSigClear">Clear</button></div></div></div>`,
    onOpen: () => { PPESIG.sig = null; initSigPad('ppeSig', PPESIG, 'sig', 'ppeSigField'); },
    buttons: [{ label: 'Sign and submit', cls: 'primary', onClick: () => { if (!document.getElementById('ppeOk').checked) { toast('Tick that you have read this and received the PPE.', 'error'); return false; } if (!PPESIG.sig) { toast('Sign to confirm.', 'error'); document.getElementById('ppeSigField').classList.add('invalid'); return false; }
      const ts = nowTs(); L.forEach(i => { i.ack = { ts, user: S.ui.user, name: pname(S.ui.user), sig: PPESIG.sig }; }); log(`${pname(S.ui.user)} signed for ${L.map(i => i.qty + ' × ' + ppeType(i.ppe).name).join(', ')}`, '#/myppe'); save(); toast('Signed. Thank you.'); rerender(); } }] }); };
ACT.ppeSigClear = () => { PPESIG.sig = null; const c = document.getElementById('ppeSig'); if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height); };
// My PPE page: a "sign for all" button when more than one item waits
const _myppeBeforeEmp = ROUTES.myppe;
ROUTES.myppe = (p) => { const r = _myppeBeforeEmp(p), n = (S.ppeIssues || []).filter(i => i.person === S.ui.user && !ppeSigned(i)).length;
  if (n > 1) r.html = r.html.replace('<h2>Confirm that you received</h2>', `<h2>Sign for what you received</h2><button class="btn sm primary" data-act="ppeAck" data-all="1">Sign for all ${n}</button>`);
  r.html = r.html.replace(/>I received it</g, '>Sign</').replace('<div class="mobile-card"><h1 style="margin:4px 0 4px">My PPE</h1>', '<div class="mobile-card emp"><div class="emp-head"><h1>My PPE</h1></div>'); r.crumbs = [['Home', '#/field'], ['My PPE', '#']]; return r; };

/* ---------------- Back buttons and menu for employees ---------------- */
const _needsBackBeforeEmp = needsBack;
needsBack = function (parts) { if (typeof isFieldUser === 'function' && isFieldUser()) return (parts[0] || 'field') !== 'field'; return _needsBackBeforeEmp(parts); };
['mytraining', 'myinspections', 'myincidents', 'myreading', 'notifications'].forEach(k => { if (!FIELD_ROUTES.includes(k)) FIELD_ROUTES.push(k); });
['mytraining', 'myinspections', 'myincidents', 'myreading'].forEach(k => { if (!TOP_ROUTES.includes(k)) TOP_ROUTES.push(k); });
(() => { const g = NAV_FIELD[0]; g.group = 'My work'; g.items = [['field', 'Home', 'dashboard'], ['me', 'My appointments', 'user'], ['myppe', 'My PPE', 'hardhat'], ['mytraining', 'My training', 'checkCircle'], ['myra', 'Risk assessments', 'risk'], ['notifications', 'Notifications', 'bell'], ['notices', 'Company notices', 'info'], ['myreading', 'Documents to read', 'docs'], ['myinspections', 'My inspections', 'clipboard'], ['myincidents', 'My incident reports', 'alert'], ['report', 'Report incident', 'siren']]; })();
// office staff also get "My training" next to their other personal pages
(() => { const g = NAV.find(x => x.group === 'Overview'), k = g ? g.items.findIndex(i => i[0] === 'myppe') : -1; if (g && k >= 0 && !g.items.some(i => i[0] === 'mytraining')) g.items.splice(k + 1, 0, ['mytraining', 'My training', 'checkCircle']); })();
// employee pages: crumbs start at Home so Back goes there
(() => { ['me'].forEach(k => { const f = ROUTES[k]; ROUTES[k] = (p, q) => { const r = f(p, q); if (r && isFieldUser() && r.crumbs && r.crumbs[0][1] !== '#/field') r.crumbs = [['Home', '#/field']].concat(r.crumbs); return r; }; }); })();

/* ---------------- Links: never send someone to a page they may not open ---------------- */
// who may open a person's profile: people managers, report viewers, the person, and their supervisor
function canViewPerson(id) { const x = person(id); return !!x && (canPeople() || can('report.view') || id === S.ui.user || x.supervisor === S.ui.user); }
function routeAllowed(href) { const h = href.replace(/^#\/?/, ''), key = h.split(/[/?]/)[0] || 'dashboard', parts = h.split('?')[0].split('/');
  if (key === 'people' && /^P-/.test(parts[1] || '')) return canViewPerson(parts[1]);
  if (isFieldUser()) return FIELD_ROUTES.includes(key) || !!(AREA_OF[key] && canArea(key));
  return !AREA_OF[key] || canArea(key); }
// employees get their own version of a page where one exists
function fieldLink(href) { const m = href.match(/^#\/(documents|incidents|assets|admin)\/?([\w-]*)/); if (!m) return href;
  if (m[1] === 'documents' && m[2]) return '#/read/' + m[2]; if (m[1] === 'incidents') return '#/myincidents'; if (m[1] === 'assets' && m[2]) return '#/qr/' + m[2]; if (m[1] === 'admin' && m[2] === 'notifications') return '#/settings'; return href; }
function tidyLinks(root) { if (!root || !S || !S.ui || !S.ui.user) return;
  root.querySelectorAll('a[href^="#/"]').forEach(a => { let h = a.getAttribute('href'); if (isFieldUser()) { const f = fieldLink(h); if (f !== h) { a.setAttribute('href', f); h = f; } }
    if (!routeAllowed(h)) { const s = document.createElement('span'); s.className = a.className.replace(/\bbtn\b.*$/, ''); s.innerHTML = a.innerHTML; if (/\bbtn\b/.test(a.className)) a.remove(); else a.replaceWith(s); } });
  root.querySelectorAll('[data-href]').forEach(r => { let h = r.dataset.href; if (isFieldUser()) { const f = fieldLink(h); if (f !== h) r.dataset.href = h = f; } if (!routeAllowed(h)) { r.removeAttribute('data-href'); r.classList.remove('rowlink'); } }); }
const _rerenderBeforeLinks = rerender;
rerender = function (keepScroll) { _rerenderBeforeLinks(keepScroll); try { tidyLinks(document.getElementById('content')); } catch (e) { console.error(e); } };
