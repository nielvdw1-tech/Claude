// View: Documents Library
(function () {

Views.documents = function () {
  App.setTitle('Documents Library', 'Compliance certificates, evidence and supporting files');
  render({});
};

function render(filters) {
  const user = Auth.currentUser();
  let docs = DB.getAll('documents').sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
  let assets = DB.getAll('assets');
  const viewClientId = Auth.viewClientId();
  if (viewClientId) assets = assets.filter(a => a.client_id === viewClientId);
  if (user.role !== 'Owner' && user.role !== 'Admin' && user.branch_id) assets = assets.filter(a => a.branch_id === user.branch_id);
  const assetIds = assets.map(a => a.id);
  docs = docs.filter(d => !d.asset_id || assetIds.includes(d.asset_id));

  if (filters.assetId) docs = docs.filter(d => d.asset_id === Number(filters.assetId));
  if (filters.type) docs = docs.filter(d => d.document_type === filters.type);

  const docTypes = [...new Set(DB.getAll('documents').map(d => d.document_type))];

  const today = Utils.todayISO();
  const expiring = docs.filter(d => d.expiry_date && d.expiry_date <= Utils.todayISO(30));

  const rows = docs.map(d => {
    let expiryCell = '—';
    if (d.expiry_date) {
      const expired = d.expiry_date < today;
      const expiringSoon = !expired && d.expiry_date <= Utils.todayISO(30);
      const badge = expired ? '<span class="badge badge-red">Expired</span>' : expiringSoon ? '<span class="badge badge-orange">Expiring Soon</span>' : '';
      expiryCell = `${UI.formatDate(d.expiry_date)} ${badge}`;
    }
    return `
    <tr>
      <td><strong>${UI.escapeHtml(d.document_name)}</strong></td>
      <td>${UI.escapeHtml(d.document_type)}</td>
      <td>${d.asset_id ? `<a href="#/assets/${d.asset_id}">${UI.escapeHtml(UI.assetName(d.asset_id))}</a>` : '—'}</td>
      <td>${UI.escapeHtml(UI.userName(d.uploaded_by))}</td>
      <td>${UI.formatDateTime(d.uploaded_at)}</td>
      <td>${expiryCell}</td>
      <td><a class="btn btn-outline btn-sm" href="${d.file_url}" download="${UI.escapeHtml(d.document_name)}" target="_blank">Download</a></td>
    </tr>`;
  }).join('');

  App.renderContent(`
    <div class="section-header">
      <h2>Documents (${docs.length})</h2>
      <button class="btn btn-primary" id="uploadBtn">+ Upload Document</button>
    </div>
    ${expiring.length ? `
    <div class="card" style="border-color:var(--orange);background:var(--orange-bg);">
      <div class="section-header"><h2>Document Expiry Notice</h2></div>
      <ul style="margin:0;padding-left:18px;">
        ${expiring.map(d => {
          const expired = d.expiry_date < today;
          return `<li>${UI.escapeHtml(d.document_name)} &mdash; ${expired ? 'expired on' : 'expires on'} ${UI.formatDate(d.expiry_date)}</li>`;
        }).join('')}
      </ul>
    </div>` : ''}
    <div class="card">
      <div class="toolbar">
        <select class="form-control" id="assetFilter">
          <option value="">All Assets</option>
          ${assets.map(a => `<option value="${a.id}" ${String(filters.assetId) === String(a.id) ? 'selected' : ''}>${UI.escapeHtml(a.asset_name)}</option>`).join('')}
        </select>
        <select class="form-control" id="typeFilter">
          <option value="">All Types</option>
          ${docTypes.map(t => `<option value="${UI.escapeHtml(t)}" ${filters.type === t ? 'selected' : ''}>${UI.escapeHtml(t)}</option>`).join('')}
        </select>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Name</th><th>Type</th><th>Asset</th><th>Uploaded By</th><th>Date</th><th>Expiry</th><th></th></tr></thead>
          <tbody>${rows || '<tr><td colspan="7">No documents uploaded yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `);

  document.getElementById('assetFilter').addEventListener('change', (e) => render({ ...filters, assetId: e.target.value }));
  document.getElementById('typeFilter').addEventListener('change', (e) => render({ ...filters, type: e.target.value }));
  document.getElementById('uploadBtn').addEventListener('click', () => openUploadModal(assets));
}

function openUploadModal(assets) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <h3>Upload Document</h3>
      <form id="uploadForm">
        <div class="form-group">
          <label for="docName">Document Name *</label>
          <input class="form-control" id="docName" required placeholder="e.g. Fire Extinguisher Service Certificate">
        </div>
        <div class="form-group">
          <label for="docType">Document Type *</label>
          <select class="form-control" id="docType" required>
            <option value="Certificate">Certificate</option>
            <option value="Inspection Report">Inspection Report</option>
            <option value="Method Statement">Method Statement</option>
            <option value="Risk Assessment">Risk Assessment</option>
            <option value="Policy">Policy</option>
            <option value="Appointment">Appointment</option>
            <option value="Procedure">Procedure</option>
            <option value="Safe Operating Procedure">Safe Operating Procedure</option>
            <option value="Safe Work Procedure">Safe Work Procedure</option>
            <option value="Legal Register">Legal Register</option>
            <option value="Training Record">Training Record</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label for="docAsset">Related Asset</label>
          <select class="form-control" id="docAsset">
            <option value="">None</option>
            ${assets.map(a => `<option value="${a.id}">${UI.escapeHtml(a.asset_name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="docExpiry">Expiry Date</label>
          <input type="date" class="form-control" id="docExpiry">
          <p class="form-hint" style="margin:4px 0 0;">Optional. We'll flag this document when it's expiring soon.</p>
        </div>
        <div class="form-group">
          <label for="docFile">File *</label>
          <input type="file" class="form-control" id="docFile" required>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button type="button" class="btn btn-outline" data-action="cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Upload</button>
        </div>
      </form>
    </div>`;

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop || e.target.dataset.action === 'cancel') backdrop.remove();
  });

  backdrop.querySelector('#uploadForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const file = document.getElementById('docFile').files[0];
    const reader = new FileReader();
    reader.onload = () => {
      DB.insert('documents', {
        document_name: document.getElementById('docName').value,
        document_type: document.getElementById('docType').value,
        file_url: reader.result,
        asset_id: document.getElementById('docAsset').value ? Number(document.getElementById('docAsset').value) : null,
        expiry_date: document.getElementById('docExpiry').value || null,
        inspection_id: null,
        uploaded_by: Auth.currentUser().id,
        uploaded_at: Utils.nowISO()
      });
      backdrop.remove();
      UI.toast('Document uploaded', 'success');
      render({});
    };
    reader.readAsDataURL(file);
  });

  document.body.appendChild(backdrop);
}

Router.add('documents', Views.documents);
})();
