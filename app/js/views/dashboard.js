// View: Dashboard (role-based)
(function () {

Views.dashboard = function () {
  const user = Auth.currentUser();
  App.setTitle('Dashboard', `Welcome back, ${user.full_name.split(' ')[0]}`);

  if (user.role === 'Owner') {
    const clientId = Auth.viewClientId();
    return renderAdminDashboard(clientId ? { clientId } : {});
  }
  if (user.role === 'Admin') return renderAdminDashboard({ clientId: user.client_id });
  if (user.role === 'Manager') return renderManagerDashboard(user);
  return renderInspectorDashboard(user);
};

function statCard(label, value, type = '') {
  return `
    <div class="stat-card">
      <div class="stat-label">${UI.escapeHtml(label)}</div>
      <div class="stat-value ${type}">${value}</div>
    </div>`;
}

function renderAdminDashboard(scope) {
  const m = Metrics.dashboardMetrics(scope);
  const branchPerf = Metrics.branchPerformance(scope);
  const isOwner = !scope.clientId;
  const expiring = Metrics.expiringClients(30, scope);

  const html = `
    ${expiring.length ? `
    <div class="card" style="border-color:var(--orange);background:var(--orange-bg);margin-bottom:16px;">
      <div class="section-header"><h2>Contract Expiry Notice</h2></div>
      <ul style="margin:0;padding-left:18px;">
        ${expiring.map(e => `<li>${UI.escapeHtml(e.client.client_name)} &mdash; ${e.expired ? 'contract expired on' : 'contract expires on'} ${UI.formatDate(e.client.contract_end_date)}</li>`).join('')}
      </ul>
      <p style="margin:8px 0 0;"><a href="#/clients">View Clients</a></p>
    </div>` : ''}
    <div class="grid grid-4">
      ${isOwner ? statCard('Total Clients', m.totalClients) : statCard('Total Branches', branchPerf.length)}
      ${statCard('Total Assets', m.totalAssets)}
      ${statCard('Open CARs', m.openCARs, m.openCARs > 0 ? 'warn' : 'good')}
      ${statCard('Overdue Inspections', m.overdueInspections, m.overdueInspections > 0 ? 'alert' : 'good')}
    </div>

    <div class="grid grid-2" style="margin-top:16px;">
      <div class="card">
        <div class="section-header"><h2>Overall Compliance</h2></div>
        <div class="compliance-ring ${m.compliancePercentage === null ? '' : (m.compliancePercentage >= 90 ? 'good' : m.compliancePercentage >= 70 ? '' : 'alert')}" style="color:${m.compliancePercentage === null ? '#6b7785' : m.compliancePercentage >= 90 ? '#1e8e5a' : m.compliancePercentage >= 70 ? '#d97706' : '#c0392b'}">
          ${m.compliancePercentage === null ? 'N/A' : m.compliancePercentage + '%'}
        </div>
        <p style="color:var(--text-light);font-size:.85rem;">Average compliance score across all completed inspections.</p>
      </div>
      <div class="card">
        <div class="section-header"><h2>Quick Actions</h2></div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <a class="btn btn-primary" href="#/assets">View All Assets</a>
          <a class="btn btn-outline" href="#/cars">Review Corrective Actions</a>
          <a class="btn btn-outline" href="#/reports">Open Reports</a>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px;">
      <div class="section-header"><h2>Branch Performance</h2></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Branch</th><th>Client</th><th>Assets</th><th>Inspections</th><th>Avg Compliance</th></tr></thead>
          <tbody>
            ${branchPerf.map(bp => `
              <tr>
                <td><a href="#/branches">${UI.escapeHtml(bp.branch.branch_name)}</a></td>
                <td>${UI.escapeHtml(UI.clientName(bp.branch.client_id))}</td>
                <td>${bp.assetCount}</td>
                <td>${bp.inspectionCount}</td>
                <td>${bp.compliance === null ? '—' : bp.compliance + '%'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  App.renderContent(html);
}

function renderManagerDashboard(user) {
  const branch = DB.getById('branches', user.branch_id);
  const m = Metrics.dashboardMetrics({ branchId: user.branch_id });
  const inspections = DB.query('inspections', i => i.branch_id === user.branch_id);
  const inspectors = DB.query('users', u => u.branch_id === user.branch_id && u.role === 'Inspector');

  const teamRows = inspectors.map(insp => {
    const their = inspections.filter(i => i.inspector_id === insp.id);
    const completed = their.filter(i => i.status === 'Completed');
    const compliance = Metrics.computeCompliancePercentage(their);
    return `<tr>
      <td>${UI.escapeHtml(insp.full_name)}</td>
      <td>${their.length}</td>
      <td>${completed.length}</td>
      <td>${compliance === null ? '—' : compliance + '%'}</td>
    </tr>`;
  }).join('');

  const html = `
    <div class="grid grid-4">
      ${statCard('Branch Assets', m.totalAssets)}
      ${statCard('Inspections', m.totalInspections)}
      ${statCard('Open CARs', m.openCARs, m.openCARs > 0 ? 'warn' : 'good')}
      ${statCard('Overdue Inspections', m.overdueInspections, m.overdueInspections > 0 ? 'alert' : 'good')}
    </div>

    <div class="grid grid-2" style="margin-top:16px;">
      <div class="card">
        <div class="section-header"><h2>${UI.escapeHtml(branch ? branch.branch_name : 'Branch')} Compliance</h2></div>
        <div class="compliance-ring" style="color:${m.compliancePercentage === null ? '#6b7785' : m.compliancePercentage >= 90 ? '#1e8e5a' : m.compliancePercentage >= 70 ? '#d97706' : '#c0392b'}">
          ${m.compliancePercentage === null ? 'N/A' : m.compliancePercentage + '%'}
        </div>
        <p style="color:var(--text-light);font-size:.85rem;">Average compliance for completed inspections at this branch.</p>
      </div>
      <div class="card">
        <div class="section-header"><h2>Quick Actions</h2></div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <a class="btn btn-primary" href="#/assets">View Branch Assets</a>
          <a class="btn btn-outline" href="#/cars">Review Corrective Actions</a>
          <a class="btn btn-outline" href="#/inspections">Inspection History</a>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px;">
      <div class="section-header"><h2>Team Performance</h2></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Inspector</th><th>Assigned Inspections</th><th>Completed</th><th>Avg Compliance</th></tr></thead>
          <tbody>${teamRows || '<tr><td colspan="4">No inspectors assigned to this branch.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `;
  App.renderContent(html);
}

function renderInspectorDashboard(user) {
  const myInspections = DB.query('inspections', i => i.inspector_id === user.id);
  const pending = myInspections.filter(i => i.status === 'In Progress' || i.status === 'Overdue');
  const recent = [...myInspections].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  const myAssets = DB.query('assets', a => a.branch_id === user.branch_id);
  const dueSoon = myAssets.filter(a => a.next_inspection_date <= Utils.todayISO(7));

  const html = `
    <div class="grid grid-3">
      ${statCard('Pending Inspections', pending.length, pending.length > 0 ? 'warn' : 'good')}
      ${statCard('Total Completed', myInspections.filter(i => i.status === 'Completed').length, 'good')}
      ${statCard('Assets Due Soon', dueSoon.length, dueSoon.length > 0 ? 'warn' : 'good')}
    </div>

    <div class="card" style="margin-top:16px;">
      <div class="section-header"><h2>Pending Inspections</h2></div>
      ${pending.length ? `
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Inspection #</th><th>Asset</th><th>Status</th><th>Due Date</th><th></th></tr></thead>
          <tbody>
            ${pending.map(i => `
              <tr>
                <td>${UI.escapeHtml(i.inspection_number)}</td>
                <td>${UI.escapeHtml(UI.assetName(i.asset_id))}</td>
                <td>${UI.statusBadge(i.status)}</td>
                <td>${UI.formatDate(i.due_date)}</td>
                <td><a class="btn btn-primary btn-sm" href="#/inspections/${i.id}/form">Continue</a></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>` : '<div class="empty-state"><div class="icon">&#9989;</div>No pending inspections. Great work!</div>'}
    </div>

    <div class="grid grid-2" style="margin-top:16px;">
      <div class="card">
        <div class="section-header"><h2>Recent Inspections</h2></div>
        ${recent.length ? recent.map(i => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
            <span>${UI.escapeHtml(i.inspection_number)} &mdash; ${UI.escapeHtml(UI.assetName(i.asset_id))}</span>
            <a href="#/inspections/${i.id}/summary">${UI.statusBadge(i.status)}</a>
          </div>`).join('') : '<p style="color:var(--text-light);">No inspections yet.</p>'}
      </div>
      <div class="card">
        <div class="section-header"><h2>Assets Due for Inspection</h2></div>
        ${dueSoon.length ? dueSoon.map(a => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
            <span>${UI.escapeHtml(a.asset_name)}</span>
            <a class="btn btn-sm btn-outline" href="#/assets/${a.id}">View</a>
          </div>`).join('') : '<p style="color:var(--text-light);">No assets due soon.</p>'}
      </div>
    </div>
  `;
  App.renderContent(html);
}

Router.add('dashboard', Views.dashboard);
Router.add('', Views.dashboard);
})();
