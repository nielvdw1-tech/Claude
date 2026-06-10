// View: Reports
(function () {

let state = {};

Views.reports = function () {
  App.setTitle('Reports', 'Compliance and performance reporting');

  const user = Auth.currentUser();
  const isOwner = user.role === 'Owner';
  const viewClientId = Auth.viewClientId();
  const accessibleClients = viewClientId ? DB.query('clients', c => c.id === viewClientId) : DB.getAll('clients');

  state = {
    clientId: viewClientId || (isOwner ? null : (accessibleClients[0] ? accessibleClients[0].id : null)),
    branchId: null
  };

  render(user, isOwner && !viewClientId, accessibleClients);
};

function render(user, isOwner, accessibleClients) {
  const accessibleClientIds = accessibleClients.map(c => c.id);

  let accessibleBranches = DB.query('branches', b => accessibleClientIds.includes(b.client_id));
  if (state.clientId) accessibleBranches = accessibleBranches.filter(b => b.client_id === state.clientId);

  let assets = DB.query('assets', a => accessibleClientIds.includes(a.client_id));
  let inspections = DB.query('inspections', i => accessibleClientIds.includes(i.client_id));

  if (state.clientId) {
    assets = assets.filter(a => a.client_id === state.clientId);
    inspections = inspections.filter(i => i.client_id === state.clientId);
  }
  if (state.branchId) {
    assets = assets.filter(a => a.branch_id === state.branchId);
    inspections = inspections.filter(i => i.branch_id === state.branchId);
  }

  const assetIds = assets.map(a => a.id);
  const cars = DB.query('corrective_actions', c => assetIds.includes(c.asset_id));

  // Compliance by branch / site
  const branchRows = accessibleBranches.map(b => {
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

  // Individual inspection reports
  const inspectionRows = [...inspections].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  App.renderContent(`
    <div class="section-header">
      <h2>Compliance Reports</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm" id="exportAssetsBtn">Export Assets CSV</button>
        <button class="btn btn-outline btn-sm" id="exportCarsBtn">Export CARs CSV</button>
        <button class="btn btn-outline btn-sm" id="exportInspectionsBtn">Export Inspections CSV</button>
      </div>
    </div>

    <div class="card">
      <div class="toolbar">
        ${isOwner ? `
          <select class="form-control" id="clientFilter">
            <option value="">All Clients</option>
            ${accessibleClients.map(c => `<option value="${c.id}" ${state.clientId === c.id ? 'selected' : ''}>${UI.escapeHtml(c.client_name)}</option>`).join('')}
          </select>
        ` : `
          <span class="badge badge-blue">Client: ${UI.escapeHtml(UI.clientName(state.clientId))}</span>
        `}
        <select class="form-control" id="branchFilter" ${accessibleBranches.length ? '' : 'disabled'}>
          <option value="">All Branches</option>
          ${accessibleBranches.map(b => `<option value="${b.id}" ${state.branchId === b.id ? 'selected' : ''}>${UI.escapeHtml(b.branch_name)}</option>`).join('')}
        </select>
      </div>
      <p class="form-hint" style="margin:0;">Choose a client and/or branch to scope every report below. ${isOwner ? 'As Owner, you can view reports across all clients and branches.' : 'Reports are limited to your assigned client and its branches.'}</p>
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

    <div class="card">
      <div class="section-header"><h2>Inspection Reports (${inspectionRows.length})</h2></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Inspection #</th><th>Asset</th><th>Branch</th><th>Client</th><th>Inspector</th><th>Date</th><th>Status</th><th>Score</th><th></th></tr></thead>
          <tbody>
            ${inspectionRows.map(i => `
              <tr>
                <td>${UI.escapeHtml(i.inspection_number)}</td>
                <td>${UI.escapeHtml(UI.assetName(i.asset_id))}</td>
                <td>${UI.escapeHtml(UI.branchName(i.branch_id))}</td>
                <td>${UI.escapeHtml(UI.clientName(i.client_id))}</td>
                <td>${UI.escapeHtml(UI.userName(i.inspector_id, i.inspector_name))}</td>
                <td>${UI.formatDate(i.inspection_date)}</td>
                <td>${UI.statusBadge(i.status)}</td>
                <td>${i.compliance_score === null || i.compliance_score === undefined ? '—' : i.compliance_score + '%'}</td>
                <td>${i.status === 'Completed' ? `<a class="btn btn-outline btn-sm" href="#/inspections/${i.id}/summary">View Report</a>` : `<a class="btn btn-outline btn-sm" href="#/inspections/${i.id}/form">Open</a>`}</td>
              </tr>`).join('') || '<tr><td colspan="9">No inspections found for this selection.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `);

  const clientFilter = document.getElementById('clientFilter');
  if (clientFilter) {
    clientFilter.addEventListener('change', () => {
      state.clientId = clientFilter.value ? Number(clientFilter.value) : null;
      state.branchId = null;
      render(user, isOwner, accessibleClients);
    });
  }

  document.getElementById('branchFilter').addEventListener('change', (e) => {
    state.branchId = e.target.value ? Number(e.target.value) : null;
    render(user, isOwner, accessibleClients);
  });

  document.getElementById('exportAssetsBtn').addEventListener('click', () => exportCSV('assets.csv', assets, [
    'id', 'asset_name', 'asset_tag', 'serial_number', 'asset_type', 'compliance_status', 'last_inspection_date', 'next_inspection_date'
  ]));

  document.getElementById('exportCarsBtn').addEventListener('click', () => exportCSV('corrective_actions.csv', cars, [
    'car_number', 'asset_id', 'priority', 'issue_description', 'status', 'due_date', 'completion_date'
  ]));

  document.getElementById('exportInspectionsBtn').addEventListener('click', () => exportCSV('inspections.csv', inspectionRows.map(i => ({
    ...i,
    asset_name: UI.assetName(i.asset_id),
    branch_name: UI.branchName(i.branch_id),
    client_name: UI.clientName(i.client_id),
    inspector_name: UI.userName(i.inspector_id, i.inspector_name)
  })), [
    'inspection_number', 'asset_name', 'branch_name', 'client_name', 'inspector_name',
    'inspection_date', 'completion_date', 'status', 'compliance_score', 'total_items', 'pass_count', 'fail_count'
  ]));
}

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

Router.add('reports', Views.reports, { roles: ['Owner', 'Admin', 'Manager'] });
})();
