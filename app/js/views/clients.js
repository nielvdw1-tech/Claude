// View: Clients List (Admin)
(function () {

Views.clients = function () {
  App.setTitle('Clients', 'Companies receiving compliance services');
  render();
};

function render() {
  const clients = DB.getAll('clients');

  const rows = clients.map(c => {
    const branches = DB.query('branches', b => b.client_id === c.id).length;
    const assets = DB.query('assets', a => a.client_id === c.id).length;
    return `
      <tr>
        <td><strong>${UI.escapeHtml(c.client_name)}</strong></td>
        <td>${UI.escapeHtml(c.client_code)}</td>
        <td>${UI.escapeHtml(c.contact_person)}</td>
        <td>${UI.escapeHtml(c.contact_email)}<br><span class="form-hint">${UI.escapeHtml(c.contact_phone)}</span></td>
        <td>${branches}</td>
        <td>${assets}</td>
        <td>${UI.statusBadge(c.status)}</td>
        <td>
          <button class="btn btn-outline btn-sm" data-edit="${c.id}">Edit</button>
        </td>
      </tr>`;
  }).join('');

  App.renderContent(`
    <div class="section-header">
      <h2>All Clients</h2>
      <button class="btn btn-primary" id="addClientBtn">+ Add Client</button>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Client</th><th>Code</th><th>Contact</th><th>Email / Phone</th><th>Branches</th><th>Assets</th><th>Status</th><th></th></tr></thead>
          <tbody>${rows || '<tr><td colspan="8">No clients yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `);

  document.getElementById('addClientBtn').addEventListener('click', () => openClientForm());
  document.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openClientForm(DB.getById('clients', btn.dataset.edit)));
  });
}

function openClientForm(client) {
  const fields = [
    { name: 'client_name', label: 'Client Name', required: true },
    { name: 'client_code', label: 'Client Code', required: true },
    { name: 'contact_person', label: 'Contact Person', required: true },
    { name: 'contact_email', label: 'Contact Email', type: 'email', required: true },
    { name: 'contact_phone', label: 'Contact Phone' },
    { name: 'status', label: 'Status', type: 'select', options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }] }
  ];

  UI.openFormModal(client ? 'Edit Client' : 'Add Client', fields, client || { status: 'Active' }, (values) => {
    if (client) {
      DB.update('clients', client.id, { ...values, updated_at: Utils.nowISO() });
      UI.toast('Client updated', 'success');
    } else {
      DB.insert('clients', { ...values, created_at: Utils.nowISO(), updated_at: Utils.nowISO() });
      UI.toast('Client created', 'success');
    }
    render();
  });
}

Router.add('clients', Views.clients, { roles: ['Owner', 'Admin'] });
})();
