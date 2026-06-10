// View: Add Asset
(function () {

Views.assetNew = function () {
  App.setTitle('Add Asset', 'Register a new inspectable asset');

  const clients = DB.getAll('clients');
  const branches = DB.getAll('branches');
  const templates = DB.getAll('inspection_templates');

  const assetTypes = [...new Set(templates.map(t => t.asset_type))];

  App.renderContent(`
    <div class="breadcrumbs"><a href="#/assets">&larr; Back to Assets</a></div>
    <div class="card" style="max-width:680px;">
      <div class="section-header"><h2>New Asset</h2></div>
      <form id="assetForm">
        <div class="form-row">
          <div class="form-group">
            <label for="asset_name">Asset Name *</label>
            <input class="form-control" id="asset_name" required placeholder="e.g. Fire Extinguisher - Bay 4">
          </div>
          <div class="form-group">
            <label for="asset_tag">Asset Tag *</label>
            <input class="form-control" id="asset_tag" required placeholder="e.g. FE-SB-006">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="serial_number">Serial Number</label>
            <input class="form-control" id="serial_number" placeholder="e.g. FX0099281">
          </div>
          <div class="form-group">
            <label for="asset_type">Asset Type *</label>
            <select class="form-control" id="asset_type" required>
              ${assetTypes.map(t => `<option value="${UI.escapeHtml(t)}">${UI.escapeHtml(t)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="client_id">Client *</label>
            <select class="form-control" id="client_id" required>
              ${clients.map(c => `<option value="${c.id}">${UI.escapeHtml(c.client_name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="branch_id">Branch / Site *</label>
            <select class="form-control" id="branch_id" required></select>
          </div>
        </div>
        <div class="form-group">
          <label for="template_id">Inspection Template *</label>
          <select class="form-control" id="template_id" required></select>
          <div class="form-hint">Determines the checklist used during inspections of this asset.</div>
        </div>
        <div class="form-group">
          <label for="location_description">Location Description</label>
          <input class="form-control" id="location_description" placeholder="e.g. Loading Bay A, near Door 3">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="status">Status</label>
            <select class="form-control" id="status">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div class="form-group">
            <label for="next_inspection_date">First Inspection Due Date</label>
            <input class="form-control" type="date" id="next_inspection_date" value="${Utils.todayISO()}">
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-lg">Save Asset &amp; Generate QR Code</button>
      </form>
    </div>
  `);

  function refreshTemplates() {
    const type = document.getElementById('asset_type').value;
    const sel = document.getElementById('template_id');
    const matching = templates.filter(t => t.asset_type === type && t.active);
    sel.innerHTML = matching.map(t => `<option value="${t.id}">${UI.escapeHtml(t.template_name)}</option>`).join('')
      || '<option value="">No template available for this asset type</option>';
  }

  function refreshBranches() {
    const clientId = Number(document.getElementById('client_id').value);
    const sel = document.getElementById('branch_id');
    const matching = branches.filter(b => b.client_id === clientId);
    sel.innerHTML = matching.map(b => `<option value="${b.id}">${UI.escapeHtml(b.branch_name)}</option>`).join('')
      || '<option value="">No branches for this client</option>';
  }

  document.getElementById('asset_type').addEventListener('change', refreshTemplates);
  document.getElementById('client_id').addEventListener('change', refreshBranches);
  refreshTemplates();
  refreshBranches();

  document.getElementById('assetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const asset = await DB.insert('assets', {
      asset_name: document.getElementById('asset_name').value,
      asset_tag: document.getElementById('asset_tag').value,
      serial_number: document.getElementById('serial_number').value,
      asset_type: document.getElementById('asset_type').value,
      client_id: Number(document.getElementById('client_id').value),
      branch_id: Number(document.getElementById('branch_id').value),
      template_id: Number(document.getElementById('template_id').value) || null,
      location_description: document.getElementById('location_description').value,
      qr_code_url: '',
      status: document.getElementById('status').value,
      last_inspection_date: null,
      next_inspection_date: document.getElementById('next_inspection_date').value || Utils.todayISO(),
      compliance_status: 'Pending',
      created_at: Utils.nowISO(),
      updated_at: Utils.nowISO()
    });
    await DB.update('assets', asset.id, { qr_code_url: UI.qrUrl(asset.id) });
    UI.toast('Asset created successfully', 'success');
    window.location.hash = '#/assets/' + asset.id;
  });
};

Router.add('assets/new', Views.assetNew, { roles: ['Owner', 'Admin', 'Manager'] });
})();
