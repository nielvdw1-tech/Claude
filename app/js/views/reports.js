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
        <button class="btn btn-outline btn-sm" id="exportAssetsBtn">Export Assets PDF</button>
        <button class="btn btn-outline btn-sm" id="exportCarsBtn">Export CARs PDF</button>
        <button class="btn btn-outline btn-sm" id="exportInspectionsBtn">Export Inspections PDF</button>
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

  document.getElementById('exportAssetsBtn').addEventListener('click', () => exportPDF('Asset Register', 'assets.pdf', [
    { key: 'asset_name', label: 'Asset' },
    { key: 'asset_tag', label: 'Tag' },
    { key: 'serial_number', label: 'Serial' },
    { key: 'asset_type', label: 'Type' },
    { key: 'compliance_status', label: 'Compliance' },
    { key: 'last_inspection_date', label: 'Last Inspection' },
    { key: 'next_inspection_date', label: 'Next Inspection' }
  ], assets.map(a => ({
    ...a,
    last_inspection_date: UI.formatDate(a.last_inspection_date),
    next_inspection_date: UI.formatDate(a.next_inspection_date)
  }))));

  document.getElementById('exportCarsBtn').addEventListener('click', () => exportPDF('Corrective Actions', 'corrective_actions.pdf', [
    { key: 'car_number', label: 'CAR #' },
    { key: 'asset_name', label: 'Asset' },
    { key: 'priority', label: 'Priority' },
    { key: 'issue_description', label: 'Issue' },
    { key: 'status', label: 'Status' },
    { key: 'due_date', label: 'Due' },
    { key: 'completion_date', label: 'Completed' }
  ], cars.map(c => ({
    ...c,
    asset_name: UI.assetName(c.asset_id),
    due_date: UI.formatDate(c.due_date),
    completion_date: UI.formatDate(c.completion_date)
  }))));

  document.getElementById('exportInspectionsBtn').addEventListener('click', () => exportPDF('Inspection Reports', 'inspections.pdf', [
    { key: 'inspection_number', label: 'Inspection #' },
    { key: 'asset_name', label: 'Asset' },
    { key: 'branch_name', label: 'Branch' },
    { key: 'client_name', label: 'Client' },
    { key: 'inspector_name', label: 'Inspector' },
    { key: 'inspection_date', label: 'Date' },
    { key: 'status', label: 'Status' },
    { key: 'compliance_score', label: 'Score' }
  ], inspectionRows.map(i => ({
    ...i,
    asset_name: UI.assetName(i.asset_id),
    branch_name: UI.branchName(i.branch_id),
    client_name: UI.clientName(i.client_id),
    inspector_name: UI.userName(i.inspector_id, i.inspector_name),
    inspection_date: UI.formatDate(i.inspection_date),
    compliance_score: i.compliance_score === null || i.compliance_score === undefined ? '—' : i.compliance_score + '%'
  }))));
}

// Builds and downloads a PDF report, stamping the selected client's logo at the top if one is on file.
function exportPDF(title, filename, columns, rows) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape' });
  const client = state.clientId ? DB.getById('clients', state.clientId) : null;

  let titleX = 14;
  if (client && client.logo_url) {
    const format = (client.logo_url.match(/^data:image\/(\w+);/) || [, 'PNG'])[1].toUpperCase();
    try {
      doc.addImage(client.logo_url, format, 14, 8, 28, 16, undefined, 'FAST');
      titleX = 48;
    } catch (e) { /* unsupported image format - skip logo */ }
  }

  doc.setFontSize(16);
  doc.text(title, titleX, 16);

  doc.setFontSize(10);
  doc.setTextColor(100);
  const scope = `Client: ${client ? client.client_name : 'All Clients'}` +
    (state.branchId ? ` | Branch: ${UI.branchName(state.branchId)}` : '') +
    ` | Generated: ${UI.formatDateTime(Utils.nowISO())}`;
  doc.text(scope, titleX, 23);
  doc.setTextColor(0);

  doc.autoTable({
    startY: 30,
    head: [columns.map(c => c.label)],
    body: rows.map(r => columns.map(c => r[c.key] === null || r[c.key] === undefined ? '' : String(r[c.key]))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [16, 65, 110] }
  });

  doc.save(filename);
}

Router.add('reports', Views.reports, { roles: ['Owner', 'Admin', 'Manager'] });
})();
