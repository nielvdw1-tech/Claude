// View: Document Library (Owner only) - master copies of policies, procedures,
// SOPs, SWPs, checklists and registers that can be copied into an asset's Documents.
(function () {

const LIBRARY_TYPES = [
  'Policy', 'Risk Assessment', 'Method Statement', 'Procedure',
  'Safe Operating Procedure', 'Safe Work Procedure', 'Checklist',
  'Legal Register', 'Appointment', 'Training Record', 'Other'
];

Views.library = function () {
  App.setTitle('Document Library', 'Master copies of policies, procedures, SOPs, SWPs, checklists and registers');
  render({});
};

function render(filters) {
  let items = DB.getAll('library_documents').sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
  if (filters.type) items = items.filter(d => d.document_type === filters.type);

  const rows = items.map(d => `
    <tr>
      <td><strong>${UI.escapeHtml(d.document_name)}</strong></td>
      <td>${UI.escapeHtml(d.document_type)}</td>
      <td>${UI.formatDateTime(d.uploaded_at)}</td>
      <td>
        <a class="btn btn-outline btn-sm" href="${d.file_url}" target="_blank" rel="noopener">View</a>
        <button class="btn btn-primary btn-sm" data-add-to-docs="${d.id}">Add to Documents</button>
        <button class="btn btn-danger btn-sm" data-delete="${d.id}">Delete</button>
      </td>
    </tr>`).join('');

  App.renderContent(`
    <div class="section-header">
      <h2>Document Library (${items.length})</h2>
      <button class="btn btn-primary" id="addLibBtn">+ Upload to Library</button>
    </div>
    <p class="form-hint" style="margin-top:-6px;">Master copies of policies, risk assessments, SOPs, SWPs, procedures, checklists and registers. Use "Add to Documents" to copy one into an asset's Documents folder.</p>
    <div class="card">
      <div class="toolbar">
        <select class="form-control" id="typeFilter">
          <option value="">All Types</option>
          ${LIBRARY_TYPES.map(t => `<option value="${UI.escapeHtml(t)}" ${filters.type === t ? 'selected' : ''}>${UI.escapeHtml(t)}</option>`).join('')}
        </select>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Name</th><th>Type</th><th>Uploaded</th><th></th></tr></thead>
          <tbody>${rows || '<tr><td colspan="4">No documents in the library yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `);

  document.getElementById('typeFilter').addEventListener('change', (e) => render({ ...filters, type: e.target.value }));
  document.getElementById('addLibBtn').addEventListener('click', openUploadModal);

  document.querySelectorAll('[data-add-to-docs]').forEach(btn => {
    btn.addEventListener('click', () => openAddToDocumentsModal(DB.getById('library_documents', btn.dataset.addToDocs)));
  });

  document.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      UI.confirm('Delete this document from the library? This will not affect copies already added to assets.', () => {
        DB.remove('library_documents', btn.dataset.delete);
        UI.toast('Library document deleted', 'success');
        render(filters);
      });
    });
  });
}

function openUploadModal() {
  const fields = [
    { name: 'document_name', label: 'Document Name', required: true },
    { name: 'document_type', label: 'Type', type: 'select', required: true, options: LIBRARY_TYPES.map(t => ({ value: t, label: t })) },
    { name: 'file', label: 'File', type: 'file', accept: 'application/pdf,image/*', required: true }
  ];

  UI.openFormModal('Upload to Library', fields, { document_type: 'Policy' }, (values) => {
    DB.insert('library_documents', {
      document_name: values.document_name,
      document_type: values.document_type,
      file_url: values.file,
      file_type: 'application/pdf',
      uploaded_by: Auth.currentUser() ? Auth.currentUser().id : null,
      uploaded_at: Utils.nowISO()
    });
    UI.toast('Document added to library', 'success');
    render({});
  });
}

function openAddToDocumentsModal(libDoc) {
  const assets = DB.getAll('assets').sort((a, b) => a.asset_name.localeCompare(b.asset_name));

  const fields = [
    { name: 'document_name', label: 'Document Name', required: true, default: libDoc.document_name },
    { name: 'asset_id', label: 'Asset', type: 'select', options: [{ value: '', label: 'None (general document)' }, ...assets.map(a => ({ value: a.id, label: `${a.asset_name} (${a.asset_tag})` }))] },
    { name: 'expiry_date', label: 'Expiry Date', type: 'date' }
  ];

  UI.openFormModal(`Add "${libDoc.document_name}" to Documents`, fields, { document_name: libDoc.document_name }, (values) => {
    DB.insert('documents', {
      document_name: values.document_name,
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
  });
}

Router.add('library', Views.library, { roles: ['Owner'] });
})();
