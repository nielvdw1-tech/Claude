// View: Start Inspection (landing page after QR scan)
(function () {

Views.startInspection = function (params) {
  const asset = DB.getById('assets', params.id);
  const user = Auth.currentUser();

  if (!asset) {
    App.setTitle('Asset Not Found');
    App.renderContent('<div class="card empty-state"><div class="icon">&#10060;</div><h2>Asset Not Found</h2><p>This QR code does not match any asset in the system.</p></div>');
    return;
  }

  App.setTitle('Start Inspection', asset.asset_name);

  const inProgress = DB.query('inspections', i => i.asset_id === asset.id && (i.status === 'In Progress' || i.status === 'Overdue'))[0];
  const template = DB.getById('inspection_templates', asset.template_id);
  const questionCount = template ? DB.query('template_questions', q => q.template_id === template.id && q.active).length : 0;

  App.renderContent(`
    <div class="breadcrumbs"><a href="#/assets/${asset.id}">&larr; Back to Asset</a></div>
    <div class="card" style="max-width:560px;">
      <div class="section-header"><h2>${UI.escapeHtml(asset.asset_name)}</h2></div>
      <div class="kv-list">
        <div class="k">Asset Tag</div><div class="v">${UI.escapeHtml(asset.asset_tag)}</div>
        <div class="k">Type</div><div class="v">${UI.escapeHtml(asset.asset_type)}</div>
        <div class="k">Location</div><div class="v">${UI.escapeHtml(asset.location_description || '—')}</div>
        <div class="k">Branch</div><div class="v">${UI.escapeHtml(UI.branchName(asset.branch_id))}</div>
        <div class="k">Compliance Status</div><div class="v">${UI.statusBadge(asset.compliance_status)}</div>
        <div class="k">Checklist</div><div class="v">${template ? UI.escapeHtml(template.template_name) + ' (' + questionCount + ' items)' : 'No template assigned'}</div>
      </div>

      ${inProgress ? `
        <div class="card" style="background:var(--orange-bg);border-color:var(--orange);margin-top:18px;">
          <strong>An inspection is already in progress</strong> for this asset (${UI.escapeHtml(inProgress.inspection_number)}).
        </div>
        <a class="btn btn-primary btn-lg" style="margin-top:14px;" href="#/inspections/${inProgress.id}/form">Continue Inspection</a>
      ` : `
        <button class="btn btn-primary btn-lg" id="startBtn" style="margin-top:18px;" ${!template ? 'disabled' : ''}>Start Inspection</button>
        ${!template ? '<p class="form-hint" style="margin-top:8px;">This asset has no inspection template assigned. Contact your administrator.</p>' : ''}
      `}
    </div>
  `);

  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      const inspection = Automations.startInspection(asset.id, user.id);
      UI.toast('Inspection started', 'success');
      window.location.hash = `#/inspections/${inspection.id}/form`;
    });
  }
};

Router.add('start-inspection/:id', Views.startInspection);
})();
