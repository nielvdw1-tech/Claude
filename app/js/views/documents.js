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

  const branches = user.role === 'Owner'
    ? (viewClientId ? DB.query('branches', b => b.client_id === viewClientId) : DB.getAll('branches'))
    : user.role === 'Admin' ? DB.query('branches', b => b.client_id === user.client_id)
    : [];

  if (filters.branchId) {
    assets = assets.filter(a => a.branch_id === Number(filters.branchId));
    const branchAssetIds = assets.map(a => a.id);
    docs = docs.filter(d => d.asset_id && branchAssetIds.includes(d.asset_id));
  }
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
      <td>
        <a class="btn btn-outline btn-sm" href="${d.file_url}" download="${UI.escapeHtml(d.document_name)}" target="_blank">Download</a>
        <button class="btn btn-danger btn-sm" data-delete-doc="${d.id}">Delete</button>
      </td>
    </tr>`;
  }).join('');

  App.renderContent(`
    <div class="section-header">
      <h2>Documents (${docs.length})</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${user.role === 'Owner' ? '<button class="btn btn-outline" id="addFromLibraryBtn">+ Add from Library</button>' : ''}
        <button class="btn btn-primary" id="uploadBtn">+ Upload Document</button>
      </div>
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
        ${branches.length ? `
        <select class="form-control" id="branchFilter">
          <option value="">All Branches</option>
          ${branches.map(b => `<option value="${b.id}" ${String(filters.branchId) === String(b.id) ? 'selected' : ''}>${UI.escapeHtml(b.branch_name)}</option>`).join('')}
        </select>` : ''}
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
  const branchFilter = document.getElementById('branchFilter');
  if (branchFilter) branchFilter.addEventListener('change', (e) => render({ ...filters, branchId: e.target.value }));
  document.getElementById('uploadBtn').addEventListener('click', () => UI.openDocumentUploadModal({ assets, onUploaded: () => render(filters) }));

  const addFromLibraryBtn = document.getElementById('addFromLibraryBtn');
  if (addFromLibraryBtn) {
    addFromLibraryBtn.addEventListener('click', () => openAddFromLibraryModal(assets, filters));
  }

  document.querySelectorAll('[data-delete-doc]').forEach(btn => {
    btn.addEventListener('click', () => {
      UI.confirm('Delete this document? This cannot be undone.', () => {
        DB.remove('documents', btn.dataset.deleteDoc);
        UI.toast('Document deleted', 'success');
        render(filters);
      });
    });
  });
}

function openAddFromLibraryModal(assets, filters) {
  const libDocs = DB.getAll('library_documents').sort((a, b) => a.document_name.localeCompare(b.document_name));
  if (!libDocs.length) {
    UI.toast('The document library is empty. Upload documents to the library first.', 'info');
    return;
  }

  const sortedAssets = [...assets].sort((a, b) => a.asset_name.localeCompare(b.asset_name));
  const fields = [
    { name: 'library_document_id', label: 'Library Document', type: 'select', required: true,
      options: libDocs.map(d => ({ value: d.id, label: `${d.document_name} (${d.document_type})` })) },
    { name: 'document_name', label: 'Document Name (optional override)' },
    { name: 'asset_id', label: 'Asset', type: 'select',
      options: [{ value: '', label: 'None (general document)' }, ...sortedAssets.map(a => ({ value: a.id, label: `${a.asset_name} (${a.asset_tag})` }))] },
    { name: 'expiry_date', label: 'Expiry Date', type: 'date' }
  ];

  UI.openFormModal('Add Document from Library', fields, {}, (values) => {
    const libDoc = DB.getById('library_documents', values.library_document_id);
    DB.insert('documents', {
      document_name: values.document_name || libDoc.document_name,
      document_type: libDoc.document_type,
      file_url: libDoc.file_url,
      file_type: libDoc.file_type,
      asset_id: values.asset_id ? Number(values.asset_id) : null,
      expiry_date: values.expiry_date || null,
      inspection_id: null,
      uploaded_by: Auth.currentUser() ? Auth.currentUser().id : null,
      uploaded_at: Utils.nowISO()
    });
    UI.toast('Document added', 'success');
    render(filters);
  });
}

Router.add('documents', Views.documents);
})();
