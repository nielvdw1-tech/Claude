/* ==========================================================================
   Tasks go to the right person
   --------------------------------------------------------------------------
   People with a company-wide view (HSEQ Manager, Managing Director, Safety
   Consultant, Company Administrator) used to receive every branch's routine
   items as their own tasks. With a real client's volume that is hundreds of
   tasks nobody can work through.
   Now:
   - A task stays on your list when it is yours: you own it, must approve,
     sign, accept, investigate, inspect or verify it, or it is company-wide.
     Incident decisions (investigator, statutory reporting, effectiveness
     review) and permits to work always stay with the company-wide roles.
   - A routine task about one branch goes to that branch's manager (who
     already sees it on their own list). You see a short summary per branch
     on the Tasks page instead: how many items, how many overdue, with whom.
   - "Show branch items too" puts them back on your list when you want them.
   The task count (badge) counts only your own tasks.
   ========================================================================== */
'use strict';

const TR_PERSON_FIELDS = ['owner', 'assignee', 'person', 'investigator', 'assessor', 'auditor', 'presenter', 'inspector', 'host', 'performer', 'responsible', 'approver', 'reporter', 'verifier', 'coordinator'];
const TR_SKIP_COLLS = new Set(['activity', 'outbox', 'events', 'fieldLog']);
let TR_INDEX = null, TR_INDEX_AT = 0;
function trIndex() {   // id → record, rebuilt for every task calculation
  const now = Date.now(); if (TR_INDEX) return TR_INDEX;
  TR_INDEX = new Map(); Object.keys(S).forEach(k => { if (TR_SKIP_COLLS.has(k) || !Array.isArray(S[k])) return; S[k].forEach(r => { if (r && r.id && !TR_INDEX.has(r.id)) TR_INDEX.set(r.id, r); }); });
  TR_INDEX_AT = now; return TR_INDEX;
}
function trRecordOf(t) { const m = /#\/[\w-]+\/([A-Z]{2,5}-[\w-]+)/.exec(t.link || ''); return m ? trIndex().get(m[1]) || null : null; }
function trIsMine(r, uid) {
  if (!r) return false;
  if (TR_PERSON_FIELDS.some(f => r[f] === uid)) return true;
  if (['participants', 'people'].some(f => Array.isArray(r[f]) && r[f].includes(uid))) return true;
  if (Array.isArray(r.attendees) && r.attendees.some(a => (a && a.person) === uid || a === uid)) return true;
  if (r.revisions && typeof docLatest === 'function' && typeof curStep === 'function') { try { const c = curStep(docLatest(r)); if (c && c.person === uid) return true; if (r.owner === uid) return true; } catch (e) { /* not a document */ } }
  return false;
}
// The branch manager a task belongs with, or null when it stays with you
function trBranchOwner(t, uid) {
  if (/^#\/(me|myra|myppe|mytraining|myreading|mytalks|myincidents|myinspections|read|field|password|settings)\b/.test(t.link || '')) return null;   // your own records
  if (/^#\/(incidents|permits)\b/.test(t.link || '')) return null;   // incident decisions (investigation, statutory reporting, effectiveness) and permits to work stay with you
  const r = trRecordOf(t); if (!r || trIsMine(r, uid)) return null;
  const sid = r.site && r.site !== 'ALL' ? r.site : null; if (!sid) return null;
  const s = site(sid); if (!s || !s.manager || s.manager === uid) return null;
  const m = person(s.manager); if (!m || m.status === 'Deactivated') return null;
  return { site: sid, manager: s.manager };
}
const trWide = () => { const u = me(); return !!u && !isFieldUser() && (can('view.all') || myRole().allPerms) && !branchLimited(); };
let TR_DELEGATED = [];
const _myTasksBeforeRoute = myTasks;
myTasks = function () {
  const all = _myTasksBeforeRoute(); TR_DELEGATED = []; TR_INDEX = null;
  if (!trWide() || S.ui.taskAll) return all;
  const uid = S.ui.user, keep = [];
  all.forEach(t => { const o = trBranchOwner(t, uid); if (o) TR_DELEGATED.push(Object.assign({ to: o }, t)); else keep.push(t); });
  return keep;
};
function trSummaryHtml() {
  if (!trWide()) return '';
  if (S.ui.taskAll) return `<div class="card tr-card"><div class="card-body"><b>Showing branch items too.</b> Routine items about one branch are on your list as well. <button class="btn sm" data-act="trToggle">Show only my own tasks</button></div></div>`;
  myTasks();   // fills TR_DELEGATED
  if (!TR_DELEGATED.length) return '';
  const by = {}; TR_DELEGATED.forEach(t => { const k = t.to.site; (by[k] = by[k] || { n: 0, red: 0, manager: t.to.manager }); by[k].n++; if (t.sev === 'red') by[k].red++; });
  return `<div class="card tr-card"><div class="card-head"><h2>With the branch managers</h2><span class="ch-sub">${TR_DELEGATED.length} routine branch item(s) are on the branch managers' lists, not yours</span></div><div class="card-body flush"><div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Branch</th><th>With</th><th>Items</th><th>Overdue or urgent</th><th></th></tr></thead><tbody>${Object.entries(by).sort((a, b) => b[1].red - a[1].red || b[1].n - a[1].n).map(([sid, v]) => `<tr><td data-label="Branch"><b>${esc(sname(sid))}</b></td><td data-label="With">${esc(pname(v.manager))}</td><td data-label="Items">${v.n}</td><td data-label="Overdue or urgent">${v.red ? `<span class="due red">${v.red}</span>` : '0'}</td><td><button class="btn sm" data-act="trBranch" data-id="${sid}">Show them</button></td></tr>`).join('')}</tbody></table></div></div>
    <div class="card-body t-sub">You stay responsible for the company's compliance; this keeps your list to what only you can do. <button class="link-btn" data-act="trToggle">Show branch items on my list too</button></div></div>`;
}
const _notifBeforeRoute = ROUTES.notifications;
ROUTES.notifications = (p, q = {}) => { const r = _notifBeforeRoute(p, q);
  if ((p[0] || 'all') === 'tasks' && r && r.html) {
    let extra = trSummaryHtml();
    if (q.branch && TR_DELEGATED.length) { const list = TR_DELEGATED.filter(t => t.to.site === q.branch);
      extra = `<div class="card tr-card"><div class="card-head"><h2>${esc(sname(q.branch))}: items with ${esc(pname((site(q.branch) || {}).manager))}</h2><a class="btn sm" href="#/notifications/tasks">Close</a></div><div class="card-body flush">${list.map(t => `<div class="notif"><div class="n-ic ic-${t.sev}">${icon('tasks')}</div><div class="n-body"><div class="n-title">${esc(t.title)}</div><div class="n-text">${esc(t.sub || '')}</div></div><a class="btn sm" href="${t.link}">Open</a></div>`).join('')}</div></div>` + extra; }
    r.html += extra;
  }
  return r; };
ACT.trToggle = () => { S.ui.taskAll = !S.ui.taskAll; save(); rerender(); };
ACT.trBranch = (el) => navigate('#/notifications/tasks?branch=' + encodeURIComponent(el.dataset.id));

/* ---------- Same kind of task grouped on the Tasks page ---------- */
const TASK_GROUP_MIN = 4;   // from this many tasks of one kind, they show as one line
function taskKind(t) {
  let k = String(t.title || '').replace(/\b[A-Z]{2,5}-[\w-]+/g, '').replace(/[:—(].*$/, '').replace(/\d+/g, 'N').replace(/\s+/g, ' ').trim();
  if (!k || k.length < 4) k = taskModule(t.link) + ' items';
  return k;
}
tasksHtml = function (q) {
  const all = myTasks(), mods = [...new Set(all.map(t => taskModule(t.link)))].sort(), mod = q.mod || '', kind = q.kind || '';
  let list = mod ? all.filter(t => taskModule(t.link) === mod) : all; if (kind) list = list.filter(t => taskKind(t) === kind);
  const z = snoozed(), hidden = myTasksAll().filter(t => z[taskKey(t)] && z[taskKey(t)] > TODAY);
  const row = t => `<div class="notif"><div class="n-ic ic-${t.sev}">${icon('tasks')}</div><div class="n-body"><div class="n-title">${esc(t.title)}</div><div class="n-text">${esc(t.sub || '')}</div><div class="n-meta"><span>${esc(taskModule(t.link))}</span></div></div><div class="btn-row nowrap"><a class="btn sm primary" href="${t.link}">Open</a><button class="btn sm ghost" data-act="taskSnooze" data-k="${esc(taskKey(t))}" title="Hide this task for 7 days">Snooze 7 days</button></div></div>`;
  const qs = o => '#/notifications/tasks?' + new URLSearchParams(Object.assign({}, mod ? { mod } : {}, o)).toString();
  const groupRow = (k, g) => { const red = g.filter(t => t.sev === 'red').length;
    return `<div class="notif tg-kind"><div class="n-ic ic-${red ? 'red' : g[0].sev}">${icon('tasks')}</div><div class="n-body"><div class="n-title">${esc(k)} <span class="tg-n">${g.length} items</span></div><div class="n-text">${esc(g.slice(0, 2).map(t => t.title).join(' · '))}${g.length > 2 ? ' …' : ''}</div><div class="n-meta"><span>${esc(taskModule(g[0].link))}</span>${red ? `<span class="due red">${red} overdue or urgent</span>` : ''}</div></div><div class="btn-row nowrap"><a class="btn sm primary" href="${qs({ kind: k })}">Show all ${g.length}</a></div></div>`; };
  const render = g => { if (kind) return g.map(row).join('');
    const byKind = new Map(); g.forEach(t => { const k = taskKind(t); if (!byKind.has(k)) byKind.set(k, []); byKind.get(k).push(t); });
    return [...byKind.entries()].map(([k, items]) => items.length >= TASK_GROUP_MIN ? groupRow(k, items) : items.map(row).join('')).join(''); };
  // a kind spread over several urgencies is shown once, under its most urgent level
  const kindSev = {}; if (!kind) list.forEach(t => { const k = taskKind(t), cnt = list.filter(x => taskKind(x) === k).length; if (cnt >= TASK_GROUP_MIN) { const r = { red: 0, amber: 1 }[t.sev] ?? 2; kindSev[k] = Math.min(kindSev[k] ?? 9, r); } });
  const sevOf = t => { const k = taskKind(t); if (kindSev[k] != null) return ['red', 'amber', 'blue'][kindSev[k]]; return ['red', 'amber'].includes(t.sev) ? t.sev : 'blue'; };
  const groups = TASK_GROUPS.map(([sev, h, sub]) => { const g = list.filter(t => sevOf(t) === sev); return g.length ? `<div class="task-group"><div class="tg-head sev-${sev}"><b>${h}</b> <span class="t-sub">${g.length} · ${sub}</span></div>${render(g)}</div>` : ''; }).join('');
  return `<div class="card"><div class="card-head"><h2>My tasks — ${esc(me().name)}</h2><span class="ch-sub">${all.length} open · ${esc(myRole().name)} · ${esc(scopeLabel())}</span></div>
    ${mods.length > 1 && !kind ? `<div class="toolbar"><div class="btn-row">${['', ...mods].map(m => `<a class="btn sm ${mod === m ? 'primary' : ''}" href="#/notifications/tasks${m ? '?mod=' + encodeURIComponent(m) : ''}">${m ? esc(m) + ` (${all.filter(t => taskModule(t.link) === m).length})` : 'All modules'}</a>`).join('')}</div></div>` : ''}
    ${kind ? `<div class="toolbar"><b>${esc(kind)}</b> <span class="t-sub">${list.length} item(s)</span> <a class="btn sm" href="${mod ? '#/notifications/tasks?mod=' + encodeURIComponent(mod) : '#/notifications/tasks'}">Back to all tasks</a></div>` : ''}
    <div class="card-body flush">${list.length ? groups : `<div class="empty">${icon('checkCircle')}<div>No tasks${mod ? ' in ' + esc(mod) : ''}. You are up to date.</div></div>`}</div>
    ${hidden.length ? `<div class="card-body t-sub">${hidden.length} task(s) snoozed. <button class="link-btn" data-act="taskUnsnooze">Show them again</button></div>` : ''}</div>`;
};

/* ---------- Daily summary e-mail instead of one e-mail per event ---------- */
const DIGEST_BYPASS = new Set(['account', 'summary']);
const _mailPrefsBeforeDigest = mailPrefs;
mailPrefs = function (p) { return Object.assign({ digest: false }, _mailPrefsBeforeDigest(p)); };
const _queueEmailBeforeDigest = queueEmail;
queueEmail = function (to, cat, subject, text, link) {
  const ids = [...new Set((to || []).filter(Boolean))], direct = [];
  ids.forEach(id => { const p = person(id);
    if (p && !DIGEST_BYPASS.has(cat) && mailPrefs(p).digest && mailPrefs(p)[cat] !== false && p.status !== 'Deactivated' && (id !== S.ui.user)) {
      S.mailDigest = S.mailDigest || {}; (S.mailDigest[id] = S.mailDigest[id] || []).push({ ts: nowTs(), cat, subject, link: link || '' });
    } else direct.push(id); });
  if (direct.length) return _queueEmailBeforeDigest(direct, cat, subject, text, link);
};
function flushDigest(force) {
  if (!S || (!force && S.digestDay === TODAY)) return 0; S.digestDay = TODAY; let n = 0;
  Object.entries(S.mailDigest || {}).forEach(([id, items]) => { if (!items.length) return;
    const lines = items.map(i => `• ${i.subject}${i.link ? `\n  ${i.link}` : ''}`).join('\n');
    _queueEmailBeforeDigest([id], 'summary', `Daily summary: ${items.length} update${items.length > 1 ? 's' : ''}`, `Here is everything that needed your attention since the last summary:\n\n${lines}\n\nYou chose to receive one daily summary instead of separate e-mails. You can change this under Notification settings.`, '#/notifications/tasks');
    S.mailDigest[id] = []; n++; });
  return n;
}
const _rerenderBeforeDigest = rerender;
rerender = function (k) { try { if (S && S.digestDay !== TODAY && Object.values(S.mailDigest || {}).some(l => l.length)) { flushDigest(); save(); } } catch (e) { console.error(e); } return _rerenderBeforeDigest(k); };
const _settingsBeforeDigest = ROUTES.settings;
ROUTES.settings = (p, q) => { const r = _settingsBeforeDigest(p, q); if (!r || !r.html || !me()) return r; const pr = mailPrefs(me()), waiting = ((S.mailDigest || {})[S.ui.user] || []).length;
  r.html = r.html.replace(/(<form[^>]*id="prefsForm"[^>]*>)/, `$1<div class="field full sf-digest"><label class="check"><input type="checkbox" name="digest" ${pr.digest ? 'checked' : ''}> <span><b>One daily summary e-mail</b> instead of a separate e-mail for each item. Sign-in and password e-mails still come straight away.</span></label>${waiting ? `<div class="hint">${waiting} item(s) waiting for tomorrow's summary.</div>` : ''}</div>`);
  return r; };
const _prefsSaveBeforeDigest = ACT.prefsSave;
ACT.prefsSave = () => { const f = document.getElementById('prefsForm'), d = f && f.querySelector('[name=digest]'); _prefsSaveBeforeDigest(); const p = me(); p.emailPrefs = p.emailPrefs || {}; p.emailPrefs.digest = !!(d && d.checked); save(); };
