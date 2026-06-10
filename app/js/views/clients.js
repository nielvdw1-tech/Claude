// View: Clients List (Admin)
(function () {

Views.clients = function () {
  App.setTitle('Clients', 'Companies receiving compliance services');
  render();
};

function render() {
  const user = Auth.currentUser();
  const isOwner = user.role === 'Owner';
  const viewClientId = Auth.viewClientId();
  const clients = viewClientId ? DB.query('clients', c => c.id === viewClientId) : DB.getAll('clients');

  const today = Utils.todayISO();
  const rows = clients.map(c => {
    const branches = DB.query('branches', b => b.client_id === c.id).length;
    const assets = DB.query('assets', a => a.client_id === c.id).length;
    let contractCell = '—';
    if (c.contract_end_date) {
      const expired = c.contract_end_date < today;
      const expiringSoon = !expired && c.contract_end_date <= Utils.todayISO(30);
      const badge = expired ? '<span class="badge badge-red">Expired</span>' : expiringSoon ? '<span class="badge badge-orange">Expiring Soon</span>' : '';
      contractCell = `${UI.formatDate(c.contract_end_date)} ${badge}`;
    }
    return `
      <tr>
        <td><strong>${UI.escapeHtml(c.client_name)}</strong></td>
        <td>${UI.escapeHtml(c.client_code)}</td>
        <td>${UI.escapeHtml(c.contact_person)}</td>
        <td>${UI.escapeHtml(c.contact_email)}<br><span class="form-hint">${UI.escapeHtml(c.contact_phone)}</span></td>
        <td>${branches}</td>
        <td>${assets}</td>
        <td>${contractCell}</td>
        <td>${UI.statusBadge(c.status)}</td>
        <td>
          <button class="btn btn-outline btn-sm" data-edit="${c.id}">Edit</button>
        </td>
      </tr>`;
  }).join('');

  const expiring = Metrics.expiringClients(30, viewClientId ? { clientId: viewClientId } : {});

  App.renderContent(`
    <div class="section-header">
      <h2>${viewClientId ? 'My Client' : 'All Clients'}</h2>
      ${isOwner && !viewClientId ? '<button class="btn btn-primary" id="addClientBtn">+ Add Client</button>' : ''}
    </div>
    ${expiring.length ? `
    <div class="card" style="border-color:var(--orange);background:var(--orange-bg);">
      <div class="section-header"><h2>Contract Expiry Notice</h2></div>
      <ul style="margin:0;padding-left:18px;">
        ${expiring.map(e => `<li>${UI.escapeHtml(e.client.client_name)} &mdash; ${e.expired ? 'contract expired on' : 'contract expires on'} ${UI.formatDate(e.client.contract_end_date)}</li>`).join('')}
      </ul>
    </div>` : ''}
    <div class="card">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Client</th><th>Code</th><th>Contact</th><th>Email / Phone</th><th>Branches</th><th>Assets</th><th>Contract End</th><th>Status</th><th></th></tr></thead>
          <tbody>${rows || '<tr><td colspan="9">No clients yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `);

  const addClientBtn = document.getElementById('addClientBtn');
  if (addClientBtn) addClientBtn.addEventListener('click', () => openClientForm());
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
    { name: 'contract_end_date', label: 'Contract End Date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }] },
    { name: 'logo_url', label: 'Client Logo', type: 'file', accept: 'image/*', hint: 'Shown on PDF reports generated for this client.' }
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
