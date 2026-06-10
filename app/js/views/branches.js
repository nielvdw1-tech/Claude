// View: Branches / Sites (Admin, Manager)
(function () {

Views.branches = function () {
  App.setTitle('Branches / Sites', 'Physical locations and sites under management');
  render();
};

function render() {
  const user = Auth.currentUser();
  let branches = DB.getAll('branches');
  const viewClientId = Auth.viewClientId();
  if (user.role === 'Manager') branches = branches.filter(b => b.id === user.branch_id);
  else if (viewClientId) branches = branches.filter(b => b.client_id === viewClientId);

  const clientOptions = (user.role === 'Owner' && !viewClientId ? DB.getAll('clients') : DB.query('clients', c => c.id === viewClientId))
    .map(c => ({ value: c.id, label: c.client_name }));
  const managerOptions = DB.getAll('users').filter(u => u.role === 'Manager').map(u => ({ value: u.id, label: u.full_name }));

  const rows = branches.map(b => {
    const assets = DB.query('assets', a => a.branch_id === b.id).length;
    const manager = DB.getById('users', b.manager_id);
    return `
      <tr>
        <td><strong>${UI.escapeHtml(b.branch_name)}</strong><br><span class="form-hint">${UI.escapeHtml(b.address)}</span></td>
        <td>${UI.escapeHtml(b.branch_code)}</td>
        <td>${UI.escapeHtml(UI.clientName(b.client_id))}</td>
        <td>${UI.escapeHtml(b.region)}</td>
        <td>${manager ? UI.escapeHtml(manager.full_name) : '—'}</td>
        <td>${assets}</td>
        <td>${UI.statusBadge(b.status)}</td>
        <td>${(user.role === 'Admin' || user.role === 'Owner') ? `<button class="btn btn-outline btn-sm" data-edit="${b.id}">Edit</button>` : ''}</td>
      </tr>`;
  }).join('');

  App.renderContent(`
    <div class="section-header">
      <h2>${user.role === 'Manager' ? 'My Branch' : viewClientId ? `Branches &mdash; ${UI.escapeHtml(UI.clientName(viewClientId))}` : 'All Branches / Sites'}</h2>
      ${(user.role === 'Admin' || user.role === 'Owner') ? '<button class="btn btn-primary" id="addBranchBtn">+ Add Branch</button>' : ''}
    </div>
    <div class="card">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Branch</th><th>Code</th><th>Client</th><th>Region</th><th>Manager</th><th>Assets</th><th>Status</th><th></th></tr></thead>
          <tbody>${rows || '<tr><td colspan="8">No branches found.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `);

  if ((user.role === 'Admin' || user.role === 'Owner')) {
    document.getElementById('addBranchBtn').addEventListener('click', () => openBranchForm(null, clientOptions, managerOptions));
    document.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => openBranchForm(DB.getById('branches', btn.dataset.edit), clientOptions, managerOptions));
    });
  }
}

function openBranchForm(branch, clientOptions, managerOptions) {
  const fields = [
    { name: 'branch_name', label: 'Branch / Site Name', required: true },
    { name: 'branch_code', label: 'Branch Code', required: true },
    { name: 'client_id', label: 'Client', type: 'select', options: clientOptions, required: true },
    { name: 'address', label: 'Address', type: 'textarea' },
    { name: 'region', label: 'Region' },
    { name: 'manager_id', label: 'Branch Manager', type: 'select', options: managerOptions },
    { name: 'status', label: 'Status', type: 'select', options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }] }
  ];

  UI.openFormModal(branch ? 'Edit Branch' : 'Add Branch', fields, branch ? { ...branch } : { client_id: clientOptions[0]?.value, manager_id: managerOptions[0]?.value, status: 'Active' }, (values) => {
    values.client_id = Number(values.client_id);
    values.manager_id = values.manager_id ? Number(values.manager_id) : null;
    if (branch) {
      DB.update('branches', branch.id, { ...values, updated_at: Utils.nowISO() });
      UI.toast('Branch updated', 'success');
    } else {
      DB.insert('branches', { ...values, created_at: Utils.nowISO(), updated_at: Utils.nowISO() });
      UI.toast('Branch created', 'success');
    }
    render();
  });
}

Router.add('branches', Views.branches, { roles: ['Owner', 'Admin', 'Manager'] });
})();
