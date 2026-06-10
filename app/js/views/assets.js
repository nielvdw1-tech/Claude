// View: Asset List
(function () {

Views.assets = function () {
  App.setTitle('Assets', 'All inspectable assets across clients and branches');
  render({});
};

function scopedAssets(user) {
  let assets = DB.getAll('assets');
  const viewClientId = Auth.viewClientId();
  if (viewClientId) assets = assets.filter(a => a.client_id === viewClientId);
  if (user.role !== 'Owner' && user.role !== 'Admin' && user.branch_id) {
    assets = assets.filter(a => a.branch_id === user.branch_id);
  }
  return assets;
}

function render(filters) {
  const user = Auth.currentUser();
  let assets = scopedAssets(user);

  if (filters.branchId) assets = assets.filter(a => a.branch_id === Number(filters.branchId));
  if (filters.clientId) assets = assets.filter(a => a.client_id === Number(filters.clientId));
  if (filters.status) assets = assets.filter(a => a.compliance_status === filters.status);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    assets = assets.filter(a => a.asset_name.toLowerCase().includes(q) || a.asset_tag.toLowerCase().includes(q) || a.serial_number.toLowerCase().includes(q));
  }

  const viewClientId = Auth.viewClientId();
  const branches = user.role === 'Owner'
    ? (viewClientId ? DB.query('branches', b => b.client_id === viewClientId) : DB.getAll('branches'))
    : user.role === 'Admin' ? DB.query('branches', b => b.client_id === user.client_id)
    : DB.query('branches', b => b.id === user.branch_id);
  const clients = DB.getAll('clients');

  const rows = assets.map(a => {
    const overdue = a.next_inspection_date < Utils.todayISO();
    return `
      <tr>
        <td><strong>${UI.escapeHtml(a.asset_name)}</strong><br><span class="form-hint">${UI.escapeHtml(a.asset_tag)} &middot; ${UI.escapeHtml(a.serial_number)}</span></td>
        <td>${UI.escapeHtml(a.asset_type)}</td>
        <td>${UI.escapeHtml(UI.branchName(a.branch_id))}</td>
        <td>${UI.statusBadge(a.compliance_status)}</td>
        <td>${UI.formatDate(a.next_inspection_date)} ${overdue ? '<span class="badge badge-red">Overdue</span>' : ''}</td>
        <td>
          <a class="btn btn-outline btn-sm" href="#/assets/${a.id}">View</a>
          <a class="btn btn-primary btn-sm" href="#/start-inspection/${a.id}">Inspect</a>
        </td>
      </tr>`;
  }).join('');

  App.renderContent(`
    <div class="section-header">
      <h2>Asset Register (${assets.length})</h2>
      ${user.role !== 'Inspector' ? '<a class="btn btn-primary" href="#/assets/new">+ Add Asset</a>' : ''}
    </div>
    <div class="card">
      <div class="toolbar">
        <input class="form-control" id="searchInput" placeholder="Search by name, tag or serial number..." value="${UI.escapeHtml(filters.search || '')}" style="min-width:240px;">
        ${user.role === 'Owner' && !viewClientId ? `
        <select class="form-control" id="clientFilter">
          <option value="">All Clients</option>
          ${clients.map(c => `<option value="${c.id}" ${String(filters.clientId) === String(c.id) ? 'selected' : ''}>${UI.escapeHtml(c.client_name)}</option>`).join('')}
        </select>` : ''}
        ${branches.length > 1 ? `
        <select class="form-control" id="branchFilter">
          <option value="">All Branches</option>
          ${branches.map(b => `<option value="${b.id}" ${String(filters.branchId) === String(b.id) ? 'selected' : ''}>${UI.escapeHtml(b.branch_name)}</option>`).join('')}
        </select>` : ''}
        <select class="form-control" id="statusFilter">
          <option value="">All Compliance Statuses</option>
          <option value="Compliant" ${filters.status === 'Compliant' ? 'selected' : ''}>Compliant</option>
          <option value="Non-Compliant" ${filters.status === 'Non-Compliant' ? 'selected' : ''}>Non-Compliant</option>
          <option value="Pending" ${filters.status === 'Pending' ? 'selected' : ''}>Pending</option>
        </select>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Asset</th><th>Type</th><th>Branch</th><th>Compliance</th><th>Next Inspection</th><th></th></tr></thead>
          <tbody>${rows || '<tr><td colspan="6">No assets match your filters.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `);

  document.getElementById('searchInput').addEventListener('input', (e) => render({ ...filters, search: e.target.value }));
  document.getElementById('statusFilter').addEventListener('change', (e) => render({ ...filters, status: e.target.value }));
  const clientFilter = document.getElementById('clientFilter');
  if (clientFilter) clientFilter.addEventListener('change', (e) => render({ ...filters, clientId: e.target.value }));
  const branchFilter = document.getElementById('branchFilter');
  if (branchFilter) branchFilter.addEventListener('change', (e) => render({ ...filters, branchId: e.target.value }));
}

Router.add('assets', Views.assets);
})();
