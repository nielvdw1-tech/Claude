// View: Corrective Actions List
(function () {

Views.cars = function () {
  App.setTitle('Corrective Actions', 'Track and close out non-conformances');
  render({});
};

function carScope(user) {
  let cars = DB.getAll('corrective_actions');
  if (user.role === 'Manager') {
    const assets = DB.query('assets', a => a.branch_id === user.branch_id).map(a => a.id);
    cars = cars.filter(c => assets.includes(c.asset_id));
  } else {
    const viewClientId = Auth.viewClientId();
    if (viewClientId) {
      const assets = DB.query('assets', a => a.client_id === viewClientId).map(a => a.id);
      cars = cars.filter(c => assets.includes(c.asset_id));
    }
  }
  return cars;
}

function render(filters) {
  const user = Auth.currentUser();
  let cars = carScope(user).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const viewClientId = Auth.viewClientId();
  const branches = user.role === 'Owner'
    ? (viewClientId ? DB.query('branches', b => b.client_id === viewClientId) : DB.getAll('branches'))
    : user.role === 'Admin' ? DB.query('branches', b => b.client_id === user.client_id)
    : [];

  if (filters.branchId) {
    const branchAssetIds = DB.query('assets', a => a.branch_id === Number(filters.branchId)).map(a => a.id);
    cars = cars.filter(c => branchAssetIds.includes(c.asset_id));
  }
  if (filters.status) cars = cars.filter(c => c.status === filters.status);
  if (filters.priority) cars = cars.filter(c => c.priority === filters.priority);

  const rows = cars.map(c => `
    <tr>
      <td>${UI.escapeHtml(c.car_number)}</td>
      <td>${UI.escapeHtml(UI.assetName(c.asset_id))}</td>
      <td>${UI.escapeHtml(c.issue_description)}</td>
      <td>${UI.priorityBadge(c.priority)}</td>
      <td>${UI.escapeHtml(UI.userName(c.assigned_to))}</td>
      <td>${UI.formatDate(c.due_date)}</td>
      <td>${UI.statusBadge(c.status)}</td>
      <td><a class="btn btn-outline btn-sm" href="#/cars/${c.id}">View</a></td>
    </tr>`).join('');

  const openCount = cars.filter(c => c.status !== 'Closed').length;
  const overdueCount = cars.filter(c => c.status === 'Overdue').length;

  App.renderContent(`
    <div class="grid grid-3">
      <div class="stat-card"><div class="stat-label">Total CARs</div><div class="stat-value">${cars.length}</div></div>
      <div class="stat-card"><div class="stat-label">Open</div><div class="stat-value warn">${openCount}</div></div>
      <div class="stat-card"><div class="stat-label">Overdue</div><div class="stat-value alert">${overdueCount}</div></div>
    </div>

    <div class="card">
      <div class="section-header"><h2>Corrective Actions (${cars.length})</h2></div>
      <div class="toolbar">
        ${branches.length ? `
        <select class="form-control" id="branchFilter">
          <option value="">All Branches</option>
          ${branches.map(b => `<option value="${b.id}" ${String(filters.branchId) === String(b.id) ? 'selected' : ''}>${UI.escapeHtml(b.branch_name)}</option>`).join('')}
        </select>` : ''}
        <select class="form-control" id="statusFilter">
          <option value="">All Statuses</option>
          <option value="Open" ${filters.status === 'Open' ? 'selected' : ''}>Open</option>
          <option value="In Progress" ${filters.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Overdue" ${filters.status === 'Overdue' ? 'selected' : ''}>Overdue</option>
          <option value="Closed" ${filters.status === 'Closed' ? 'selected' : ''}>Closed</option>
        </select>
        <select class="form-control" id="priorityFilter">
          <option value="">All Priorities</option>
          <option value="Critical" ${filters.priority === 'Critical' ? 'selected' : ''}>Critical</option>
          <option value="High" ${filters.priority === 'High' ? 'selected' : ''}>High</option>
          <option value="Medium" ${filters.priority === 'Medium' ? 'selected' : ''}>Medium</option>
          <option value="Low" ${filters.priority === 'Low' ? 'selected' : ''}>Low</option>
        </select>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>CAR #</th><th>Asset</th><th>Issue</th><th>Priority</th><th>Assigned To</th><th>Due</th><th>Status</th><th></th></tr></thead>
          <tbody>${rows || '<tr><td colspan="8">No corrective actions found.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `);

  document.getElementById('statusFilter').addEventListener('change', (e) => render({ ...filters, status: e.target.value }));
  document.getElementById('priorityFilter').addEventListener('change', (e) => render({ ...filters, priority: e.target.value }));
  const branchFilter = document.getElementById('branchFilter');
  if (branchFilter) branchFilter.addEventListener('change', (e) => render({ ...filters, branchId: e.target.value }));
}

Router.add('cars', Views.cars);
})();
