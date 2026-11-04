/* ==========================================================================
   Several clients (companies) in one system
   --------------------------------------------------------------------------
   • Everyone works in their own company only; the organisation selector
     offers only the companies a person may see.
   • A VDW safety consultant serves several clients: "My clients" shows each
     client's control status side by side, and opens any of them.
   • New clients are set up with a short wizard: company, branches and the
     client's first administrator (who gets a temporary password).
   PROTOTYPE: separation is applied in the browser; the live system enforces
   it on the server for every request.
   ========================================================================== */
'use strict';

function myOrgs() { const p = me(); if (!p) return []; const ids = new Set([p.org, ...(p.clients || [])]); return S.orgs.filter(o => ids.has(o.id)); }
function canSeeOrg(id) { return myOrgs().some(o => o.id === id); }
// Keep the person inside the companies they may see (e.g. after switching user or a role change)
function ensureOrgAccess() { const p = me(); if (p && !canSeeOrg(S.ui.org)) { S.ui.org = p.org; S.ui.site = 'ALL'; save(); } }
// Run fn as if the given company were selected (for side-by-side figures)
function withOrg(id, fn) { const keep = [S.ui.org, S.ui.site]; S.ui.org = id; S.ui.site = 'ALL'; try { return fn(); } finally { [S.ui.org, S.ui.site] = keep; } }

ROUTES.clients = () => {
  if (myOrgs().length < 2 && !can('clients.manage')) return ROUTES.notfound();
  const rows = myOrgs().map(o => withOrg(o.id, () => {
    const c = compliance('ALL'), sites = orgSites(), users = S.people.filter(p => p.org === o.id && p.sysRole && p.status !== 'Deactivated').length;
    const lti = S.incidents.filter(i => i.org === o.id && injClass(i) === 'Lost Time Injury' && daysTo(i.date) > -365).length;
    return { o, c, sites: sites.length, users, lti };
  }));
  const html = `${pageHead('My clients', 'The companies you look after. Each company\'s data is kept separate; open a client to work in it.', can('clients.manage') ? `<button class="btn primary" data-act="clientNew">${icon('plus', 'sm')} New client</button>` : '')}
    <div class="card"><div class="card-body flush"><div class="table-wrap"><table class="tbl stackable"><thead><tr><th>Client</th><th>Branches</th><th>Users</th><th>Control score</th><th>Open actions</th><th>Overdue</th><th>Open incidents</th><th>LTIs (12 months)</th><th></th></tr></thead><tbody>
      ${rows.map(r => `<tr class="${r.o.id === S.ui.org ? 'hm-sel' : ''}"><td data-label="Client"><div class="client-cell">${orgMark(r.o, 'cl')}<div><b>${esc(r.o.name)}</b><div class="t-sub">${esc(r.o.industry || '')}</div></div></div></td><td data-label="Branches">${r.sites}</td><td data-label="Users">${r.users}</td>
        <td data-label="Control score"><span class="hm-cell st-bg-${band(r.c.overall).cls}">${icon(band(r.c.overall).icon, 'sm')}${r.c.overall}%</span></td><td data-label="Open actions">${r.c.openActions}</td><td data-label="Overdue">${r.c.overdueActions ? `<b class="t-bad">${r.c.overdueActions}</b>` : '0'}</td><td data-label="Open incidents">${r.c.openIncidents}</td><td data-label="LTIs">${r.lti}</td>
        <td data-label="">${r.o.id === S.ui.org ? badge('Open now', 'blue') : `<button class="btn sm" data-act="openClient" data-id="${r.o.id}">Open</button>`}</td></tr>`).join('')}
    </tbody></table></div></div></div>
    <p class="muted mt">Inspection templates, asset types, document categories and approval routes are shared from the VDW library, so every client starts with the same controlled set.</p>`;
  return { title: 'My clients', nav: 'clients', crumbs: [['My clients', '#/clients']], html };
};
ACT.openClient = (el) => { if (!canSeeOrg(el.dataset.id)) { toast('You do not have access to that company.', 'error'); return; } S.ui.org = el.dataset.id; S.ui.site = 'ALL'; save(); toast(`Now working in ${esc(orgOf(el.dataset.id).name)}.`, 'info'); navigate('#/dashboard'); };

/* ---------------- New-client wizard ---------------- */
ACT.clientNew = () => {
  const roleOpts = opts(['HSEQ Manager', 'Managing Director', 'Branch Manager'], 'HSEQ Manager');
  const branch = (k, req) => `<fieldset class="fieldset full"><legend>Branch ${k}${req ? '' : ' (optional)'}</legend><div class="form-grid">${fld({ name: `b${k}name`, label: 'Branch name', required: req, placeholder: k === 1 ? 'e.g. Head office, Midrand' : '' })}${fld({ name: `b${k}short`, label: 'Short name', required: req, placeholder: k === 1 ? 'e.g. Midrand' : '' })}${fld({ name: `b${k}region`, label: 'Province / region' })}${fld({ name: `b${k}head`, label: 'Headcount', type: 'number', min: 0, value: '' })}</div></fieldset>`;
  openModal({ title: 'New client', sub: 'Set up a company, its branches and its first administrator. You can add more branches and users afterwards.', size: 'wide',
    body: `<div class="form-grid">
      <h4 class="full" style="margin:0">1. Company</h4>
      ${fld({ name: 'name', label: 'Registered company name', required: true, full: true, placeholder: 'e.g. Highveld Steel Fabricators (Pty) Ltd' })}
      ${fld({ name: 'short', label: 'Short name (shown in the menu)', required: true })}${fld({ name: 'reg', label: 'Registration number' })}
      ${fld({ name: 'industry', label: 'Industry / main activity', full: true })}
      <h4 class="full" style="margin:6px 0 0">2. Branches</h4>${branch(1, true)}${branch(2, false)}${branch(3, false)}
      <h4 class="full" style="margin:6px 0 0">3. The client's first administrator</h4>
      ${fld({ name: 'aname', label: 'Full name', required: true })}${fld({ name: 'aemail', label: 'Work e-mail', type: 'email', required: true })}
      ${fld({ name: 'ajob', label: 'Job title', required: true, placeholder: 'e.g. SHE Manager' })}${fld({ name: 'arole', label: 'System role', type: 'select', options: roleOpts, required: true })}
    </div>`,
    buttons: [{ label: 'Create client', cls: 'primary', onClick: m => {
      const v = readForm(m);
      if (!validateForm(m, fail => {
        if (S.orgs.some(o => o.name.toLowerCase() === v.name.trim().toLowerCase())) fail(m.querySelector('[name=name]'), 'A client with this name already exists.');
        const em = m.querySelector('[name=aemail]'); if (v.aemail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.aemail.trim())) fail(em, 'Enter a valid e-mail address.'); else if (S.people.some(x => (x.email || '').toLowerCase() === v.aemail.trim().toLowerCase())) fail(em, 'Someone already uses this e-mail address.');
        [2, 3].forEach(k => { if ((v[`b${k}name`] || '').trim() && !(v[`b${k}short`] || '').trim()) fail(m.querySelector(`[name=b${k}short]`), 'Give the branch a short name.'); });
      })) return false;
      const oid = nextId('ORG-', 'orgs', 1), pid = nextId('P-', 'people'), pw = tempPassword(), sites = [];
      S.orgs.push({ id: oid, name: v.name.trim(), short: v.short.trim(), reg: v.reg.trim(), industry: v.industry.trim() });
      [1, 2, 3].forEach(k => {
        const nm = (v[`b${k}name`] || '').trim(); if (!nm) return;
        let base = 'S-' + v[`b${k}short`].replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'S-BR', id = base, n = 2; while (S.sites.some(s => s.id === id)) id = base + n++;
        const st = { id, org: oid, name: nm, short: v[`b${k}short`].trim(), region: v[`b${k}region`] || '', manager: pid, headcount: +v[`b${k}head`] || 0 };
        S.sites.push(st); sites.push(st);
      });
      S.people.push({ id: pid, name: v.aname.trim(), jobTitle: v.ajob.trim(), site: sites[0].id, org: oid, dept: 'HSEQ', type: 'Employee', sysRole: v.arole, email: v.aemail.trim(), status: 'Active', started: TODAY, auth: { hash: passHash(pid, pw), mustChange: true, failed: 0, lockedUntil: null, lastSignIn: null } });
      const meP = me(); meP.clients = [...new Set([...(meP.clients || []), meP.org, oid])];
      queueEmail([pid], 'account', 'Your company has been set up on the HSEQ Management System', `${pname(S.ui.user)} set up ${v.name.trim()} on the HSEQ Management System and made you its first administrator (${v.arole}). Sign in with this e-mail address and the temporary password you will be given; you will then choose your own password and can add your colleagues.`, '');
      log(`Set up new client ${v.name.trim()} with ${sites.length} branch(es)`, '#/clients'); save();
      setTimeout(() => openModal({ title: 'Client created', sub: `${v.name.trim()} · ${sites.length} branch(es)`, body: `<div class="alert success">${icon('checkCircle')}<div>The company is set up and kept separate from your other clients. Give the administrator this temporary password; they choose their own when they sign in.</div></div><div class="kv"><div>Administrator</div><div>${esc(v.aname)} · ${esc(v.aemail)}</div></div><div class="temp-pw mono">${esc(pw)}</div>`,
        buttons: [{ label: 'Open the new client', cls: 'primary', onClick: () => { S.ui.org = oid; S.ui.site = 'ALL'; save(); navigate('#/dashboard'); } }] }), 60);
      rerender();
    } }] });
};
