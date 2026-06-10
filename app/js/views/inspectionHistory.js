// View: Inspection History
(function () {

Views.inspectionHistory = function () {
  App.setTitle('Inspection History', 'All inspection events across assets');
  render({});
};

function inspectionScope(user) {
  let inspections = DB.getAll('inspections');
  if (user.role === 'Inspector') inspections = inspections.filter(i => i.inspector_id === user.id);
  else if (user.role === 'Manager') inspections = inspections.filter(i => i.branch_id === user.branch_id);
  else if (user.role === 'Admin' && user.client_id) inspections = inspections.filter(i => i.client_id === user.client_id);
  return inspections;
}

function render(filters) {
  const user = Auth.currentUser();
  let inspections = inspectionScope(user).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (filters.status) inspections = inspections.filter(i => i.status === filters.status);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    inspections = inspections.filter(i =>
      i.inspection_number.toLowerCase().includes(q) ||
      UI.assetName(i.asset_id).toLowerCase().includes(q));
  }

  const rows = inspections.map(i => `
    <tr>
      <td>${UI.escapeHtml(i.inspection_number)}</td>
      <td>${UI.escapeHtml(UI.assetName(i.asset_id))}</td>
      <td>${UI.escapeHtml(UI.branchName(i.branch_id))}</td>
      <td>${UI.escapeHtml(UI.userName(i.inspector_id, i.inspector_name))}</td>
      <td>${UI.formatDate(i.inspection_date)}</td>
      <td>${UI.statusBadge(i.status)}</td>
      <td>${i.compliance_score === null || i.compliance_score === undefined ? '—' : i.compliance_score + '%'}</td>
      <td>
        ${i.status === 'Completed'
          ? `<a class="btn btn-outline btn-sm" href="#/inspections/${i.id}/summary">View</a>`
          : `<a class="btn btn-primary btn-sm" href="#/inspections/${i.id}/form">Continue</a>`}
      </td>
    </tr>`).join('');

  App.renderContent(`
    <div class="section-header"><h2>Inspections (${inspections.length})</h2></div>
    <div class="card">
      <div class="toolbar">
        <input class="form-control" id="searchInput" placeholder="Search by inspection # or asset..." value="${UI.escapeHtml(filters.search || '')}" style="min-width:240px;">
        <select class="form-control" id="statusFilter">
          <option value="">All Statuses</option>
          <option value="In Progress" ${filters.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Completed" ${filters.status === 'Completed' ? 'selected' : ''}>Completed</option>
          <option value="Overdue" ${filters.status === 'Overdue' ? 'selected' : ''}>Overdue</option>
          <option value="Draft" ${filters.status === 'Draft' ? 'selected' : ''}>Draft</option>
        </select>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Inspection #</th><th>Asset</th><th>Branch</th><th>Inspector</th><th>Date</th><th>Status</th><th>Score</th><th></th></tr></thead>
          <tbody>${rows || '<tr><td colspan="8">No inspections found.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `);

  document.getElementById('searchInput').addEventListener('input', (e) => render({ ...filters, search: e.target.value }));
  document.getElementById('statusFilter').addEventListener('change', (e) => render({ ...filters, status: e.target.value }));
}

Router.add('inspections', Views.inspectionHistory);
})();
