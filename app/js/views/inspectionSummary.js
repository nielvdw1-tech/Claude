// View: Inspection Summary
(function () {

Views.inspectionSummary = function (params) {
  const inspection = DB.getById('inspections', params.id);
  if (!inspection) {
    App.setTitle('Inspection Not Found');
    App.renderContent('<div class="card empty-state"><div class="icon">&#10060;</div><h2>Inspection Not Found</h2><a href="#/inspections">Back to History</a></div>');
    return;
  }

  const asset = DB.getById('assets', inspection.asset_id);
  const isAuthenticated = !!Auth.currentUser();
  App.setTitle('Inspection Summary', `${inspection.inspection_number} — ${asset.asset_name}`);

  const items = DB.query('inspection_items', i => i.inspection_id === inspection.id);
  const cars = DB.query('corrective_actions', c => c.inspection_id === inspection.id);

  const score = inspection.compliance_score;
  const scoreColor = score === null || score === undefined ? '#6b7785' : score >= 90 ? '#1e8e5a' : score >= 70 ? '#d97706' : '#c0392b';

  App.renderContent(`
    ${isAuthenticated ? `<div class="breadcrumbs"><a href="#/assets/${asset.id}">&larr; Back to Asset</a></div>` : ''}

    <div class="grid grid-2">
      <div class="card">
        <div class="section-header"><h2>${UI.escapeHtml(inspection.inspection_number)}</h2>${UI.statusBadge(inspection.status)}</div>
        <div class="kv-list">
          <div class="k">Asset</div><div class="v">${UI.escapeHtml(asset.asset_name)}</div>
          <div class="k">Inspector</div><div class="v">${UI.escapeHtml(UI.userName(inspection.inspector_id))}</div>
          <div class="k">Branch</div><div class="v">${UI.escapeHtml(UI.branchName(inspection.branch_id))}</div>
          <div class="k">Inspection Date</div><div class="v">${UI.formatDate(inspection.inspection_date)}</div>
          <div class="k">Completion Date</div><div class="v">${UI.formatDate(inspection.completion_date)}</div>
          <div class="k">Total Items</div><div class="v">${inspection.total_items}</div>
          <div class="k">Pass / Fail</div><div class="v">${inspection.pass_count} / ${inspection.fail_count}</div>
        </div>
      </div>
      <div class="card" style="text-align:center;">
        <div class="section-header"><h2>Compliance Score</h2></div>
        <div class="compliance-ring" style="color:${scoreColor};">${score === null || score === undefined ? 'N/A' : score + '%'}</div>
        <p style="color:var(--text-light);font-size:.85rem;">Pass Count / (Pass + Fail) &times; 100, N/A items excluded</p>
        ${cars.length ? `<p><strong>${cars.length}</strong> corrective action${cars.length > 1 ? 's' : ''} generated.</p>` : '<p style="color:var(--green);font-weight:700;">No corrective actions required.</p>'}
      </div>
    </div>

    <div class="card">
      <div class="section-header"><h2>Checklist Results</h2></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Question</th><th>Category</th><th>Result</th><th>Comment</th><th>Photo</th></tr></thead>
          <tbody>
            ${items.map(i => `
              <tr>
                <td>${UI.escapeHtml(i.question_text)}</td>
                <td>${UI.escapeHtml(i.category)}</td>
                <td>${UI.statusBadge(i.result || 'Pending')}</td>
                <td>${UI.escapeHtml(i.comment || '—')}</td>
                <td>${i.photo ? `<img src="${i.photo}" class="photo-thumb" style="max-width:60px;">` : '—'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    ${cars.length ? `
    <div class="card">
      <div class="section-header"><h2>Corrective Actions Generated</h2></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>CAR #</th><th>Issue</th><th>Priority</th><th>Status</th><th>Due</th><th></th></tr></thead>
          <tbody>
            ${cars.map(c => `
              <tr>
                <td>${UI.escapeHtml(c.car_number)}</td>
                <td>${UI.escapeHtml(c.issue_description)}</td>
                <td>${UI.priorityBadge(c.priority)}</td>
                <td>${UI.statusBadge(c.status)}</td>
                <td>${UI.formatDate(c.due_date)}</td>
                <td><a class="btn btn-outline btn-sm" href="#/cars/${c.id}">View</a></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>` : ''}

    ${isAuthenticated ? `
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <a class="btn btn-outline" href="#/assets/${asset.id}">Back to Asset</a>
      <a class="btn btn-primary" href="#/inspections">View All Inspections</a>
    </div>` : `
    <div class="card" style="text-align:center;">
      <p style="font-weight:700;color:var(--green);margin:0;">Thank you. Your inspection has been submitted.</p>
    </div>`}
  `);
};

Router.add('inspections/:id/summary', Views.inspectionSummary, { public: true });
})();
