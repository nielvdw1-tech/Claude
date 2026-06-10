// View: Reports
(function () {

Views.reports = function () {
  App.setTitle('Reports', 'Compliance and performance reporting');

  const user = Auth.currentUser();
  let assets = DB.getAll('assets');
  let inspections = DB.getAll('inspections');
  let cars = DB.getAll('corrective_actions');

  if (user.role === 'Manager') {
    assets = assets.filter(a => a.branch_id === user.branch_id);
    inspections = inspections.filter(i => i.branch_id === user.branch_id);
    const assetIds = assets.map(a => a.id);
    cars = cars.filter(c => assetIds.includes(c.asset_id));
  }

  // Compliance by branch
  const branches = user.role === 'Admin' ? DB.getAll('branches') : DB.query('branches', b => b.id === user.branch_id);
  const branchRows = branches.map(b => {
    const branchInspections = inspections.filter(i => i.branch_id === b.id);
    const compliance = Metrics.computeCompliancePercentage(branchInspections);
    const branchAssets = assets.filter(a => a.branch_id === b.id);
    const nonCompliant = branchAssets.filter(a => a.compliance_status === 'Non-Compliant').length;
    return { branch: b, total: branchAssets.length, nonCompliant, compliance, inspections: branchInspections.length };
  });

  // Compliance by asset type
  const assetTypes = [...new Set(assets.map(a => a.asset_type))];
  const typeRows = assetTypes.map(type => {
    const typeAssets = assets.filter(a => a.asset_type === type);
    const typeAssetIds = typeAssets.map(a => a.id);
    const typeInspections = inspections.filter(i => typeAssetIds.includes(i.asset_id));
    return { type, total: typeAssets.length, compliance: Metrics.computeCompliancePercentage(typeInspections) };
  });

  // CAR aging by priority
  const priorities = ['Critical', 'High', 'Medium', 'Low'];
  const carRows = priorities.map(p => {
    const subset = cars.filter(c => c.priority === p);
    return {
      priority: p,
      open: subset.filter(c => c.status === 'Open' || c.status === 'In Progress').length,
      overdue: subset.filter(c => c.status === 'Overdue').length,
      closed: subset.filter(c => c.status === 'Closed').length
    };
  });

  // Inspection completion
  const completed = inspections.filter(i => i.status === 'Completed').length;
  const inProgress = inspections.filter(i => i.status === 'In Progress').length;
  const overdue = inspections.filter(i => i.status === 'Overdue').length;

  App.renderContent(`
    <div class="section-header">
      <h2>Compliance Reports</h2>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-outline btn-sm" id="exportAssetsBtn">Export Assets CSV</button>
        <button class="btn btn-outline btn-sm" id="exportCarsBtn">Export CARs CSV</button>
      </div>
    </div>

    <div class="grid grid-3">
      <div class="stat-card"><div class="stat-label">Inspections Completed</div><div class="stat-value good">${completed}</div></div>
      <div class="stat-card"><div class="stat-label">Inspections In Progress</div><div class="stat-value">${inProgress}</div></div>
      <div class="stat-card"><div class="stat-label">Inspections Overdue</div><div class="stat-value alert">${overdue}</div></div>
    </div>

    <div class="card">
      <div class="section-header"><h2>Compliance by Branch / Site</h2></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Branch</th><th>Total Assets</th><th>Non-Compliant</th><th>Inspections</th><th>Avg Compliance</th></tr></thead>
          <tbody>
            ${branchRows.map(r => `
              <tr>
                <td>${UI.escapeHtml(r.branch.branch_name)}</td>
                <td>${r.total}</td>
                <td>${r.nonCompliant}</td>
                <td>${r.inspections}</td>
                <td>${r.compliance === null ? '—' : r.compliance + '%'}</td>
              </tr>`).join('') || '<tr><td colspan="5">No data</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid grid-2">
      <div class="card">
        <div class="section-header"><h2>Compliance by Asset Type</h2></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Asset Type</th><th>Assets</th><th>Avg Compliance</th></tr></thead>
            <tbody>
              ${typeRows.map(r => `
                <tr>
                  <td>${UI.escapeHtml(r.type)}</td>
                  <td>${r.total}</td>
                  <td>${r.compliance === null ? '—' : r.compliance + '%'}</td>
                </tr>`).join('') || '<tr><td colspan="3">No data</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="section-header"><h2>Corrective Actions by Priority</h2></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Priority</th><th>Open</th><th>Overdue</th><th>Closed</th></tr></thead>
            <tbody>
              ${carRows.map(r => `
                <tr>
                  <td>${UI.priorityBadge(r.priority)}</td>
                  <td>${r.open}</td>
                  <td>${r.overdue}</td>
                  <td>${r.closed}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `);

  document.getElementById('exportAssetsBtn').addEventListener('click', () => exportCSV('assets.csv', assets, [
    'id', 'asset_name', 'asset_tag', 'serial_number', 'asset_type', 'compliance_status', 'last_inspection_date', 'next_inspection_date'
  ]));

  document.getElementById('exportCarsBtn').addEventListener('click', () => exportCSV('corrective_actions.csv', cars, [
    'car_number', 'asset_id', 'priority', 'issue_description', 'status', 'due_date', 'completion_date'
  ]));
};

function exportCSV(filename, rows, columns) {
  const header = columns.join(',');
  const body = rows.map(r => columns.map(c => {
    const val = r[c] === null || r[c] === undefined ? '' : String(r[c]).replace(/"/g, '""');
    return `"${val}"`;
  }).join(',')).join('\n');
  const csv = header + '\n' + body;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

Router.add('reports', Views.reports, { roles: ['Admin', 'Manager'] });
})();
