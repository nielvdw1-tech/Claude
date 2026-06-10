// View: User Management (Admin)
(function () {

Views.users = function () {
  App.setTitle('User Management', 'Manage system users, roles and access');
  render();
};

function render() {
  const currentUser = Auth.currentUser();
  const isOwner = currentUser.role === 'Owner';

  let users = DB.getAll('users');
  let branches = DB.getAll('branches');
  let clients = DB.getAll('clients');

  const viewClientId = Auth.viewClientId();
  if (viewClientId) {
    users = users.filter(u => u.client_id === viewClientId);
    branches = branches.filter(b => b.client_id === viewClientId);
    clients = clients.filter(c => c.id === viewClientId);
  }

  const rows = users.map(u => {
    const branch = DB.getById('branches', u.branch_id);
    const client = DB.getById('clients', u.client_id);
    return `
      <tr>
        <td><strong>${UI.escapeHtml(u.full_name)}</strong></td>
        <td>${UI.escapeHtml(u.email)}</td>
        <td><span class="badge badge-blue">${UI.escapeHtml(u.role)}</span></td>
        <td>${client ? UI.escapeHtml(client.client_name) : '—'}</td>
        <td>${branch ? UI.escapeHtml(branch.branch_name) : '—'}</td>
        <td>${UI.statusBadge(u.active ? 'Active' : 'Inactive')}</td>
        <td>${UI.formatDateTime(u.last_login)}</td>
        <td>
          <button class="btn btn-outline btn-sm" data-edit="${u.id}">Edit</button>
          <button class="btn btn-outline btn-sm" data-toggle="${u.id}">${u.active ? 'Deactivate' : 'Activate'}</button>
        </td>
      </tr>`;
  }).join('');

  App.renderContent(`
    <div class="section-header">
      <h2>Users (${users.length})</h2>
      <button class="btn btn-primary" id="addUserBtn">+ Add User</button>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Client</th><th>Branch</th><th>Status</th><th>Last Login</th><th></th></tr></thead>
          <tbody>${rows || '<tr><td colspan="8">No users yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `);

  document.getElementById('addUserBtn').addEventListener('click', () => {
    UI.confirm(
      'To add a user, create them in the Supabase dashboard under Authentication > Users (set their email and a temporary password). ' +
      'A matching profile is created automatically with the "Manager" role - come back here afterwards (use "Reload" if needed) to edit their role, client and branch.',
      async () => {
        await DB.load();
        render();
      }
    );
  });
  document.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openUserForm(DB.getById('users', btn.dataset.edit), branches, clients, currentUser, isOwner));
  });
  document.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const u = DB.getById('users', btn.dataset.toggle);
      if (u.id === Auth.currentUser().id) {
        UI.toast("You can't deactivate your own account", 'error');
        return;
      }
      await DB.update('users', u.id, { active: !u.active });
      UI.toast(`User ${u.active ? 'deactivated' : 'activated'}`, 'success');
      render();
    });
  });
}

function openUserForm(user, branches, clients, currentUser, isOwner) {
  const roleOptions = isOwner
    ? [{ value: 'Owner', label: 'Owner' }, { value: 'Admin', label: 'Admin' }, { value: 'Manager', label: 'Manager' }]
    : [{ value: 'Admin', label: 'Admin' }, { value: 'Manager', label: 'Manager' }];

  const fields = [
    { name: 'full_name', label: 'Full Name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'role', label: 'Role', type: 'select', options: roleOptions, required: true },
    ...(isOwner ? [{ name: 'client_id', label: 'Client (for Admin / Manager)', type: 'select', options: [{ value: '', label: 'None (Owner)' }, ...clients.map(c => ({ value: c.id, label: c.client_name }))] }] : []),
    { name: 'branch_id', label: 'Branch (for Manager)', type: 'select', options: [{ value: '', label: 'None' }, ...branches.map(b => ({ value: b.id, label: b.branch_name }))] },
    { name: 'active', label: 'Active', type: 'checkbox' }
  ];

  UI.openFormModal('Edit User', fields, { ...user }, async (values) => {
    values.branch_id = values.branch_id ? Number(values.branch_id) : null;
    values.client_id = isOwner ? (values.client_id ? Number(values.client_id) : null) : currentUser.client_id;

    await DB.update('users', user.id, values);
    UI.toast('User updated', 'success');
    render();
  });
}

Router.add('users', Views.users, { roles: ['Owner', 'Admin'] });
})();
