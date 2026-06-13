// View: Asset Detail
(function () {

Views.assetDetail = function (params) {
  const asset = DB.getById('assets', params.id);
  if (!asset) {
    App.setTitle('Asset Not Found');
    App.renderContent('<div class="card empty-state"><div class="icon">&#10060;</div><h2>Asset Not Found</h2><a href="#/assets">Back to Assets</a></div>');
    return;
  }

  App.setTitle(asset.asset_name, asset.asset_tag);
  const user = Auth.currentUser();
  const template = DB.getById('inspection_templates', asset.template_id);

  const inspections = DB.query('inspections', i => i.asset_id === asset.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const cars = DB.query('corrective_actions', c => c.asset_id === asset.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const documents = DB.query('documents', d => d.asset_id === asset.id)
    .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));

  const overdue = asset.next_inspection_date < Utils.todayISO();

  App.renderContent(`
    <div class="breadcrumbs"><a href="#/assets">&larr; Back to Assets</a></div>

    <div class="grid grid-2">
      <div class="card">
        <div class="section-header">
          <h2>${UI.escapeHtml(asset.asset_name)}</h2>
          <button class="btn btn-outline btn-sm" id="editAssetBtn">Edit</button>
        </div>
        <div class="kv-list">
          <div class="k">Asset Tag</div><div class="v">${UI.escapeHtml(asset.asset_tag)}</div>
          <div class="k">Serial Number</div><div class="v">${UI.escapeHtml(asset.serial_number || '—')}</div>
          <div class="k">Asset Type</div><div class="v">${UI.escapeHtml(asset.asset_type)}</div>
          <div class="k">Client</div><div class="v">${UI.escapeHtml(UI.clientName(asset.client_id))}</div>
          <div class="k">Branch / Site</div><div class="v">${UI.escapeHtml(UI.branchName(asset.branch_id))}</div>
          <div class="k">Location</div><div class="v">${UI.escapeHtml(asset.location_description || '—')}</div>
          <div class="k">Inspection Template</div><div class="v">${template ? UI.escapeHtml(template.template_name) : '—'}</div>
          <div class="k">Status</div><div class="v">${UI.statusBadge(asset.status)}</div>
          <div class="k">Compliance Status</div><div class="v">${UI.statusBadge(asset.compliance_status)}</div>
          <div class="k">Last Inspection</div><div class="v">${UI.formatDate(asset.last_inspection_date)}</div>
          <div class="k">Next Inspection</div><div class="v">${UI.formatDate(asset.next_inspection_date)} ${overdue ? UI.statusBadge('Overdue') : ''}</div>
        </div>
        <div style="margin-top:18px;">
          <a class="btn btn-primary btn-lg" href="#/start-inspection/${asset.id}">Start Inspection</a>
        </div>
      </div>

      <div class="card">
        <div class="section-header"><h2>QR Code</h2></div>
        <div class="qr-box">
          <div id="qrCanvas"></div>
          <div class="qr-url">${UI.escapeHtml(UI.qrUrl(asset.id))}</div>
          <button class="btn btn-outline btn-sm" id="printQrBtn">Print QR Label</button>
        </div>
        <p class="form-hint" style="margin-top:10px;">Scanning this QR code opens the Start Inspection page for this asset.</p>
      </div>
    </div>

    <div class="card">
      <div class="section-header"><h2>Inspection History</h2></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Inspection #</th><th>Inspector</th><th>Date</th><th>Status</th><th>Compliance</th><th></th></tr></thead>
          <tbody>
            ${inspections.length ? inspections.map(i => `
              <tr>
                <td>${UI.escapeHtml(i.inspection_number)}</td>
                <td>${UI.escapeHtml(UI.userName(i.inspector_id, i.inspector_name))}</td>
                <td>${UI.formatDate(i.inspection_date)}</td>
                <td>${UI.statusBadge(i.status)}</td>
                <td>${i.compliance_score === null || i.compliance_score === undefined ? '—' : i.compliance_score + '%'}</td>
                <td>
                  ${i.status === 'Completed'
                    ? `<a class="btn btn-outline btn-sm" href="#/inspections/${i.id}/summary">View</a>`
                    : `<a class="btn btn-primary btn-sm" href="#/inspections/${i.id}/form">Continue</a>`}
                </td>
              </tr>`).join('') : '<tr><td colspan="6">No inspections yet for this asset.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="section-header"><h2>Corrective Actions</h2></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>CAR #</th><th>Issue</th><th>Priority</th><th>Status</th><th>Due</th><th></th></tr></thead>
          <tbody>
            ${cars.length ? cars.map(c => `
              <tr>
                <td>${UI.escapeHtml(c.car_number)}</td>
                <td>${UI.escapeHtml(c.issue_description)}</td>
                <td>${UI.priorityBadge(c.priority)}</td>
                <td>${UI.statusBadge(c.status)}</td>
                <td>${UI.formatDate(c.due_date)}</td>
                <td><a class="btn btn-outline btn-sm" href="#/cars/${c.id}">View</a></td>
              </tr>`).join('') : '<tr><td colspan="6">No corrective actions for this asset.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="section-header">
        <h2>Documents</h2>
        <button class="btn btn-primary btn-sm" id="uploadDocBtn">+ Upload Document</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Name</th><th>Type</th><th>Uploaded</th><th>Expiry</th><th></th></tr></thead>
          <tbody>
            ${documents.length ? documents.map(d => `
              <tr>
                <td>${UI.escapeHtml(d.document_name)}</td>
                <td>${UI.escapeHtml(d.document_type)}</td>
                <td>${UI.formatDateTime(d.uploaded_at)}</td>
                <td>${d.expiry_date ? UI.formatDate(d.expiry_date) : '—'}</td>
                <td>
                  <a class="btn btn-outline btn-sm" href="${d.file_url}" target="_blank" rel="noopener">View</a>
                  <button class="btn btn-danger btn-sm" data-delete-doc="${d.id}">Delete</button>
                </td>
              </tr>`).join('') : '<tr><td colspan="5">No documents uploaded for this asset.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `);

  UI.renderQR('qrCanvas', UI.qrUrl(asset.id));

  document.getElementById('printQrBtn').addEventListener('click', () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>${UI.escapeHtml(asset.asset_tag)} QR Label</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:40px;">
        <h2>${UI.escapeHtml(asset.asset_name)}</h2>
        <p>${UI.escapeHtml(asset.asset_tag)}</p>
        <div id="qr"></div>
        <p style="font-size:12px;color:#666;">${UI.escapeHtml(UI.qrUrl(asset.id))}</p>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
        <script>new QRCode(document.getElementById('qr'), { text: ${JSON.stringify(UI.qrUrl(asset.id))}, width: 220, height: 220 }); window.print();<\/script>
      </body></html>
    `);
    win.document.close();
  });

  const editBtn = document.getElementById('editAssetBtn');
  if (editBtn) editBtn.addEventListener('click', () => openEditAsset(asset));

  document.getElementById('uploadDocBtn').addEventListener('click', () => {
    UI.openDocumentUploadModal({ assetId: asset.id, onUploaded: () => Views.assetDetail({ id: asset.id }) });
  });

  document.querySelectorAll('[data-delete-doc]').forEach(btn => {
    btn.addEventListener('click', () => {
      UI.confirm('Delete this document? This cannot be undone.', () => {
        DB.remove('documents', btn.dataset.deleteDoc);
        UI.toast('Document deleted', 'success');
        Views.assetDetail({ id: asset.id });
      });
    });
  });
};

function openEditAsset(asset) {
  const branches = DB.getAll('branches');
  const templates = DB.query('inspection_templates', t => t.asset_type === asset.asset_type);

  const fields = [
    { name: 'asset_name', label: 'Asset Name', required: true },
    { name: 'asset_tag', label: 'Asset Tag', required: true },
    { name: 'serial_number', label: 'Serial Number' },
    { name: 'branch_id', label: 'Branch / Site', type: 'select', options: branches.map(b => ({ value: b.id, label: b.branch_name })) },
    { name: 'template_id', label: 'Inspection Template', type: 'select', options: templates.map(t => ({ value: t.id, label: t.template_name })) },
    { name: 'location_description', label: 'Location Description', type: 'textarea' },
    { name: 'status', label: 'Status', type: 'select', options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }] },
    { name: 'next_inspection_date', label: 'Next Inspection Date', type: 'date' }
  ];

  UI.openFormModal('Edit Asset', fields, { ...asset }, (values) => {
    values.branch_id = Number(values.branch_id);
    values.template_id = Number(values.template_id);
    DB.update('assets', asset.id, { ...values, updated_at: Utils.nowISO() });
    UI.toast('Asset updated', 'success');
    Views.assetDetail({ id: asset.id });
  });
}

Router.add('assets/:id', Views.assetDetail);
})();
