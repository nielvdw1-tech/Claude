/* ==========================================================================
   Phone view for every role
   - On a phone, managers, supervisors, consultants and administrators open
     on a phone home screen (same design as the employee app): what needs
     their attention, their key figures, Scan & inspect, Report incident, the
     areas their role can open, and their own appointments, PPE and training.
     "Full dashboard" opens the complete dashboard when they need the detail.
   - Everyone gets the bottom bar on a phone: Home, Tasks, Scan, Report and
     (for office roles) Menu, or My items for employees.
   ========================================================================== */
'use strict';

const PHONE_MAX = 760;
const isPhone = () => window.innerWidth <= PHONE_MAX;

function mobileHome() {
  const x = me(), c = typeof empCounts === 'function' ? empCounts() : {}, SEV = { red: 0, amber: 1, blue: 2 };
  const tasks = myTasks().sort((a, b) => (SEV[a.sev] ?? 3) - (SEV[b.sev] ?? 3)), sid = S.ui.site, comp = compliance(sid);
  const acts = S.actions.filter(a => inSite(a, sid) && actionOpen(a)), od = acts.filter(actionOverdue).length;
  const insOver = S.schedules.filter(s => inSite(s, sid) && daysTo(s.nextDue) < 0).length, incOpen = S.incidents.filter(i => inSite(i, sid) && i.status !== 'Closed').length;
  const L = typeof legalCounts === 'function' && canArea('legal') ? legalCounts(legalReqs()) : null;
  const stat = (href, label, val, tone, sub) => `<a class="mob-stat t-${tone}" href="${href}"><span>${label}</span><b>${val}</b><small>${sub}</small></a>`;
  const tile = (href, ic, label, sub, n, tone, act) => `<${act ? `button type="button" data-act="${act}"` : `a href="${href}"`} class="emp-tile${tone ? ' t-' + tone : ''}"><span class="et-ic">${icon(ic)}</span><span class="et-txt"><b>${label}</b><small>${sub}</small></span>${n ? `<span class="et-n">${n}</span>` : ''}</${act ? 'button' : 'a'}>`;
  const SKIP = ['dashboard', 'notifications', 'me', 'myppe', 'mytraining', 'team', 'clients'];
  const areas = NAV.flatMap(g => g.items).filter(([k]) => !SKIP.includes(k) && canArea(k));
  const team = typeof myTeam === 'function' ? myTeam() : [];
  const html = `<div class="emp">
    <section class="emp-hero"><div class="eh-av">${esc(initials(x.name))}</div><div class="eh-txt"><span>${greeting()},</span><h1>${esc(x.name.split(' ')[0])}</h1><small>${esc(x.sysRole || x.jobTitle || '')} · ${esc(scopeLabel())}</small></div>
      <div class="eh-status ${tasks.length ? 'is-todo' : 'is-ok'}">${tasks.length ? `<b>${tasks.length}</b> thing${tasks.length > 1 ? 's' : ''} need${tasks.length > 1 ? '' : 's'} your attention` : `${icon('checkCircle', 'sm')} You are up to date`}</div></section>
    <div class="mob-stats">${stat('#/dashboard?full=1', 'Control score', comp.overall + '%', scoreColour(comp.overall), 'Full dashboard')}${L && L.pct != null ? stat('#/legal', 'Legal compliance', L.pct + '%', scoreColour(L.pct), `${L.non} non-compliant`) : stat('#/incidents', 'Open incidents', incOpen, incOpen ? 'amber' : 'green', 'Not yet closed')}
      ${stat('#/actions?status=overdue', 'Overdue actions', od, od ? 'red' : 'green', `${acts.length} open`)}${stat('#/inspections/schedule?due=overdue', 'Inspections overdue', insOver, insOver ? 'red' : 'green', 'Past due date')}</div>
    <div class="emp-quick">${tile('', 'qr', 'Scan & inspect', 'Scan the QR code on equipment', 0, 'primary', 'qrScan')}${tile('#/report', 'siren', 'Report incident', 'Injury, near miss or damage', 0, 'accent')}</div>
    ${tasks.length ? `<section class="emp-card"><header><h2>Needs your attention</h2><a href="#/notifications">See all</a></header><ul class="emp-todo">${tasks.slice(0, 6).map(t => `<li class="sev-${t.sev}"><a href="${t.link}"><b>${esc(t.title)}</b><small>${esc(t.sub || '')}</small></a>${icon('chevronR', 'sm')}</li>`).join('')}</ul></section>` : ''}
    <h3 class="emp-h">My areas</h3>
    <div class="emp-grid mob-areas">${team.length ? tile('#/team', 'people', 'My team', `${team.length} people`, 0, '') : ''}${myOrgs().length > 1 || can('clients.manage') ? tile('#/clients', 'building', 'My clients', 'Compare and visit', 0, '') : ''}${areas.map(([k, label, ic]) => tile('#/' + k, ic, label, '', 0, '')).join('')}</div>
    <h3 class="emp-h">Me</h3>
    <div class="emp-grid">${tile('#/me', 'user', 'My appointments', c.apt ? `${c.apt} to accept` : 'Read, accept and sign', c.apt, c.apt ? 'warn' : '')}${tile('#/myppe', 'hardhat', 'My PPE', c.ppe ? `${c.ppe} to sign for` : 'Issued to me', c.ppe, c.ppe ? 'warn' : '')}${tile('#/mytraining', 'checkCircle', 'My training', c.tr ? `${c.tr} need attention` : 'Courses and certificates', c.tr, c.tr ? 'warn' : '')}${tile('#/notifications', 'bell', 'Notifications', c.notif ? `${c.notif} unread` : 'All read', c.notif, '')}</div>
    <a class="btn mob-full" href="#/dashboard?full=1">${icon('dashboard', 'sm')} Open the full dashboard</a>
  </div>`;
  return { title: 'Home', nav: 'dashboard', crumbs: [['Home', '#/dashboard']], html };
}
const _dashBeforeMobile = ROUTES.dashboard;
ROUTES.dashboard = (p, q = {}) => (isPhone() && !q.full && !isFieldUser()) ? mobileHome() : _dashBeforeMobile(p, q);
// the full dashboard on a phone gets a way back to the phone home screen
const _needsBackBeforeMobile = needsBack;
// on a phone every page except the home screen gets Back: there is no side menu in view to find your way
needsBack = function (parts) { if (isPhone()) { const k = parts[0] || (isFieldUser() ? 'field' : 'dashboard'); return !(k === 'field' || (k === 'dashboard' && !/full=1/.test(location.hash))); } return _needsBackBeforeMobile(parts); };
// with no history (page opened directly) a top-level page goes back to Home rather than to itself
const _goBackBeforeMobile = ACT.goBack;
ACT.goBack = (el) => { const here = location.hash.split('?')[0]; if (!NAV_STACK.length && (BACK_PARENT === here || BACK_PARENT === location.hash)) { navigate(isFieldUser() ? '#/field' : '#/dashboard'); return; } return _goBackBeforeMobile(el); };

/* Bottom bar for everyone on a phone */
empBottomNav = function () {
  let bar = document.getElementById('empBar'); const on = S && S.ui && S.ui.user && typeof signedIn === 'function' && signedIn();
  if (!on) { if (bar) bar.remove(); document.body.classList.remove('has-empbar'); return; }
  const field = isFieldUser(), cur = (location.hash.replace(/^#\/?/, '').split(/[/?]/)[0]) || (field ? 'field' : 'dashboard'), c = typeof empCounts === 'function' ? empCounts() : {};
  const it = (k, ic, label, n, act) => `<${act ? `button type="button" data-act="${act}"` : `a href="#/${k}"`} class="eb-i ${cur === k ? 'on' : ''}" aria-label="${label}">${icon(ic)}<span>${label}</span>${n ? `<b>${n > 99 ? '99+' : n}</b>` : ''}</${act ? 'button' : 'a'}>`;
  const html = field ? it('field', 'dashboard', 'Home', 0) + it('notifications', 'bell', 'Alerts', c.notif) + it('scan', 'qr', 'Scan', 0, 'qrScan') + it('report', 'siren', 'Report', 0) + it('me', 'user', 'My items', (c.apt || 0) + (c.ppe || 0))
    : it('dashboard', 'dashboard', 'Home', 0) + it('notifications', 'tasks', 'Tasks', myTasks().length) + it('scan', 'qr', 'Scan', 0, 'qrScan') + it('report', 'siren', 'Report', 0) + it('menu', 'menu', 'Menu', 0, 'toggleNav');
  if (!bar) { bar = document.createElement('nav'); bar.id = 'empBar'; bar.className = 'emp-bar'; bar.setAttribute('aria-label', 'Phone menu'); document.body.appendChild(bar); }
  bar.innerHTML = html; document.body.classList.add('has-empbar');
};
// switching between phone and larger screens redraws the home screen
let PHONE_WAS = isPhone();
window.addEventListener('resize', () => { const now = isPhone(); if (now !== PHONE_WAS) { PHONE_WAS = now; if (S && S.ui && S.ui.user && /^#\/?(dashboard)?($|\?)/.test(location.hash || '#/')) rerender(); } });
