/* ==========================================================================
   Roles: areas of the system and what each role may do
   --------------------------------------------------------------------------
   Two layers for every role:
   • Areas — which parts of the system (menu items) the role can open.
   • Permissions — what the role can do inside them (approve, verify, ...).
   Administrators create roles, copy an existing one as a start, and open or
   close areas and permissions per role. The System Administrator role has
   everything, including permissions added later, and cannot be changed.
   PROTOTYPE: applied in the browser; the live system enforces it on the server.
   ========================================================================== */
'use strict';

const ADMIN_ROLE = 'System Administrator';
// Route → the area permission that opens it (routes not listed are always open, e.g. tasks, settings, password)
const AREA_OF = { dashboard: 'area.dashboard', notices: 'area.notices', documents: 'area.documents', assets: 'area.assets', labels: 'area.assets', inspections: 'area.inspections', print: 'area.inspections', maintenance: 'area.maintenance', incidents: 'area.incidents', actions: 'area.actions', reports: 'area.reports', admin: 'area.admin' };
function roleHas(r, perm) { return !!r && (!!r.allPerms || (r.perms || []).includes(perm)); }
function canArea(key) { const a = AREA_OF[key]; return !a || roleHas(myRole(), a); }
function roleUsers(name) { return S.people.filter(p => p.sysRole === name && p.status !== 'Deactivated'); }
function permGroups() { return [['area', 'Areas of the system it can open'], ['do', 'What it can do']].map(([g, label]) => [label, S.permissionDefs.filter(d => (d[2] || 'do') === g)]); }
// At least one active person must always be able to configure the system
function adminsLeft(exceptPerson, roleOverride) {
  return S.people.filter(p => p.status !== 'Deactivated' && p.sysRole && p.id !== exceptPerson && roleHas(roleOverride && roleOverride.name === p.sysRole ? roleOverride : S.roles.find(r => r.name === p.sysRole), 'admin')).length;
}

/* ---------------- Area closed page ---------------- */
function areaClosedPage(key) {
  const open = NAV.flatMap(g => g.items).filter(([k]) => canArea(k) && k !== 'clients');
  return { title: 'Not available', crumbs: [['Not available', '#']], html: `<div class="alert info">${icon('lock')}<div><b>This part of the system is not open for your role (${esc(myRole().name)}).</b> An administrator can open it under Administration → Roles &amp; permissions.${open.length ? `<div class="btn-row mt-s">${open.map(([k, l, ic]) => `<a class="btn sm" href="#/${k}">${icon(ic, 'sm')} ${esc(l)}</a>`).join('')}</div>` : ''}</div></div>` };
}

/* ---------------- Administration → Roles & permissions ---------------- */
function rolesAdminHtml(ro) {
  const groups = permGroups();
  const card = r => `<div class="card role-card"><div class="card-head"><div><h2>${esc(r.name)}</h2><span class="ch-sub">${r.allPerms ? 'Everything' : r.fieldOnly ? 'Field screens' : 'Full screens'} · ${roleUsers(r.name).length} user(s) · ${r.custom ? 'Created here' : 'Built in'}</span></div>
      ${ro ? '' : `<div class="btn-row">${r.allPerms ? badge('Cannot be changed', 'grey') : `<button class="btn sm primary" data-act="roleEdit" data-name="${esc(r.name)}">Edit</button>`}<button class="btn sm" data-act="roleNew" data-from="${esc(r.name)}">Copy</button>${r.custom ? `<button class="btn sm danger" data-act="roleDelete" data-name="${esc(r.name)}">Delete</button>` : ''}</div>`}</div>
    <div class="card-body"><p class="muted" style="margin-top:0">${esc(r.desc || '')}</p>
      ${r.allPerms ? `<p style="margin:0">${icon('checkCircle', 'sm')} Every area and every permission, including any added in future.</p>` : groups.map(([label, defs]) => `<h4>${esc(label)}</h4><div class="perm-chips">${defs.filter(d => roleHas(r, d[0])).map(d => `<span class="tag">${esc(d[1])}</span>`).join('') || '<span class="muted">None</span>'}</div>`).join('')}
    </div></div>`;
  return `<div class="alert warn">${icon('lock')}<div><b>Prototype:</b> roles and permissions are applied in the browser. The live system enforces them on the server for every request.</div></div>
    ${ro ? '' : fabBtn('roleNew', 'New role')}
    <div class="grid g2">${S.roles.map(card).join('')}</div>
    <div class="card mt"><div class="card-head"><h2>Overview</h2><span class="ch-sub">Every role against every area and permission</span></div><div class="card-body flush"><div class="table-wrap"><table class="tbl compact perm-matrix"><thead><tr><th>Area / permission</th>${S.roles.map(r => `<th>${esc(r.name)}</th>`).join('')}</tr></thead><tbody>
      ${groups.map(([label, defs]) => `<tr class="pm-group"><td colspan="${S.roles.length + 1}">${esc(label)}</td></tr>` + defs.map(([k, d]) => `<tr><td><b>${esc(d)}</b><div class="t-sub mono">${k}</div></td>${S.roles.map(r => `<td>${roleHas(r, k) ? `<span class="pm-yes" title="Yes">${icon('check', 'sm')}</span>` : '<span class="muted">—</span>'}</td>`).join('')}</tr>`).join('')).join('')}
    </tbody></table></div></div></div>`;
}
function roleForm(r, isNew) {
  const groups = permGroups(), has = k => !!r && roleHas(r, k);
  return `<div class="form-grid">${fld({ name: 'name', label: 'Role name', value: r && isNew ? '' : r ? r.name : '', required: true, placeholder: 'e.g. Contractor supervisor' })}${fld({ name: 'desc', label: 'Description', value: r ? (isNew ? '' : r.desc) : '' })}
    ${fld({ name: 'fieldOnly', label: 'Field screens (simple phone screens: scan a QR code to inspect, report incidents, notices). Areas opened below are added to them.', type: 'checkbox', value: !!(r && r.fieldOnly), full: true })}
    ${groups.map(([label, defs]) => `<fieldset class="fieldset full"><legend>${esc(label)}</legend><div class="perm-grid">${defs.map(([k, d]) => `<label class="check"><input type="checkbox" name="p_${k}" ${has(k) ? 'checked' : ''}> <span>${esc(d)}</span></label>`).join('')}</div></fieldset>`).join('')}
  </div>`;
}
function readRoleForm(m) { const v = readForm(m); return { name: v.name.trim(), desc: v.desc.trim(), fieldOnly: !!v.fieldOnly, perms: S.permissionDefs.map(d => d[0]).filter(k => v['p_' + k]) }; }
ACT.roleNew = (el) => {
  const from = el && el.dataset && el.dataset.from ? S.roles.find(r => r.name === el.dataset.from) : null;
  const base = from && from.allPerms ? { perms: S.permissionDefs.map(d => d[0]), fieldOnly: false } : from;
  openModal({ title: from ? `New role — copy of ${from.name}` : 'New role', sub: 'Choose which areas the role can open and what it can do. People get the role under Users & roles.', size: 'wide', body: roleForm(base, true),
    buttons: [{ label: 'Create role', cls: 'primary', onClick: m => {
      const v = readRoleForm(m);
      if (!validateForm(m, fail => { if (S.roles.some(r => r.name.toLowerCase() === v.name.toLowerCase())) fail(m.querySelector('[name=name]'), 'A role with this name already exists.'); })) return false;
      S.roles.push({ name: v.name, desc: v.desc, perms: v.perms, fieldOnly: v.fieldOnly, custom: true });
      log(`Created role ${v.name}${from ? ' (copied from ' + from.name + ')' : ''}`, '#/admin/roles'); save(); toast(`Role "${esc(v.name)}" created.`); rerender();
    } }] });
};
ACT.roleEdit = (el) => {
  const r = S.roles.find(x => x.name === el.dataset.name); if (!r || r.allPerms) return;
  openModal({ title: `Edit role — ${r.name}`, sub: `${roleUsers(r.name).length} person(s) have this role; changes apply to them straight away.`, size: 'wide', body: roleForm(r, false),
    onOpen: m => { if (!r.custom) { const n = m.querySelector('[name=name]'); n.disabled = true; n.closest('.field').insertAdjacentHTML('beforeend', '<div class="hint">Built-in role names are fixed.</div>'); } },
    buttons: [{ label: 'Save role', cls: 'primary', onClick: m => {
      const v = readRoleForm(m); if (!r.custom) v.name = r.name;
      if (!validateForm(m, fail => {
        if (v.name !== r.name && S.roles.some(x => x.name.toLowerCase() === v.name.toLowerCase())) fail(m.querySelector('[name=name]'), 'A role with this name already exists.');
        if (!v.perms.includes('admin') && roleHas(r, 'admin') && adminsLeft(null, Object.assign({}, r, { perms: v.perms })) === 0) fail(m.querySelector('[name="p_admin"]'), 'Nobody else could configure the system. Keep this, or give another role this permission first.');
      })) return false;
      const before = new Set(r.perms), added = v.perms.filter(k => !before.has(k)), removed = r.perms.filter(k => !v.perms.includes(k));
      if (v.name !== r.name) S.people.forEach(p => { if (p.sysRole === r.name) p.sysRole = v.name; });
      Object.assign(r, { name: v.name, desc: v.desc, perms: v.perms, fieldOnly: v.fieldOnly });
      const lbl = k => (S.permissionDefs.find(d => d[0] === k) || [k, k])[1];
      log(`Changed role ${r.name}${added.length ? ' — opened: ' + added.map(lbl).join(', ') : ''}${removed.length ? ' — closed: ' + removed.map(lbl).join(', ') : ''}`, '#/admin/roles'); save(); toast('Role saved.'); rerender();
    } }] });
};
ACT.roleDelete = (el) => {
  const r = S.roles.find(x => x.name === el.dataset.name); if (!r || !r.custom) return;
  const n = S.people.filter(p => p.sysRole === r.name).length;
  if (n) { toast(`${n} person(s) still have this role. Give them another role first (Users & roles).`, 'error'); return; }
  confirmBox('Delete role', `The role "${esc(r.name)}" will be removed.`, 'Delete role', () => { S.roles = S.roles.filter(x => x !== r); log(`Deleted role ${r.name}`, '#/admin/roles'); save(); toast('Role deleted.'); rerender(); }, 'danger solid');
};
