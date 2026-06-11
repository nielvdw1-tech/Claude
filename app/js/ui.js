// VDW Compliance Control System - UI helper utilities

window.Views = {};

const UI = {
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
  },

  formatDateTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  },

  statusBadge(status) {
    const map = {
      'Active': 'badge-green',
      'Inactive': 'badge-grey',
      'Compliant': 'badge-green',
      'Non-Compliant': 'badge-red',
      'Pending': 'badge-orange',
      'Draft': 'badge-grey',
      'In Progress': 'badge-blue',
      'Completed': 'badge-green',
      'Overdue': 'badge-red',
      'Open': 'badge-orange',
      'Closed': 'badge-green',
      'Pass': 'badge-green',
      'Fail': 'badge-red',
      'N/A': 'badge-grey'
    };
    const cls = map[status] || 'badge-grey';
    return `<span class="badge ${cls}">${UI.escapeHtml(status || 'Unknown')}</span>`;
  },

  priorityBadge(priority) {
    const map = { Critical: 'badge-red', High: 'badge-red', Medium: 'badge-orange', Low: 'badge-blue' };
    return `<span class="badge ${map[priority] || 'badge-grey'}">${UI.escapeHtml(priority || '—')}</span>`;
  },

  navigate(path) {
    window.location.hash = '#/' + path.replace(/^#?\/?/, '');
  },

  toast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;top:16px;right:16px;z-index:999;display:flex;flex-direction:column;gap:8px;';
      document.body.appendChild(container);
    }
    const colors = { info: '#1565c0', success: '#1e8e5a', error: '#c0392b', warn: '#d97706' };
    const el = document.createElement('div');
    el.textContent = message;
    el.style.cssText = `background:${colors[type] || colors.info};color:#fff;padding:12px 18px;border-radius:8px;font-weight:700;font-size:.85rem;box-shadow:0 4px 16px rgba(0,0,0,.2);max-width:320px;`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  },

  confirm(message, onConfirm) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal">
        <h3>Please confirm</h3>
        <p>${UI.escapeHtml(message)}</p>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">
          <button class="btn btn-outline" data-action="cancel">Cancel</button>
          <button class="btn btn-danger" data-action="confirm">Confirm</button>
        </div>
      </div>`;
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop || e.target.dataset.action === 'cancel') backdrop.remove();
      if (e.target.dataset.action === 'confirm') {
        backdrop.remove();
        onConfirm();
      }
    });
    document.body.appendChild(backdrop);
  },

  clientName(id) {
    const c = DB.getById('clients', id);
    return c ? c.client_name : '—';
  },

  branchName(id) {
    const b = DB.getById('branches', id);
    return b ? b.branch_name : '—';
  },

  userName(id, fallback) {
    const u = DB.getById('users', id);
    if (u) return u.full_name;
    return fallback || '—';
  },

  assetName(id) {
    const a = DB.getById('assets', id);
    return a ? a.asset_name : '—';
  },

  qrUrl(assetId) {
    return window.location.origin + window.location.pathname + '#/start-inspection/' + assetId;
  },

  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Generic modal form. fields: [{name,label,type:'text'|'select'|'date'|'number'|'textarea'|'checkbox', required, options:[{value,label}]}]
  openFormModal(title, fields, initialValues = {}, onSubmit) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const fieldsHtml = fields.map(f => {
      const val = initialValues[f.name] !== undefined ? initialValues[f.name] : (f.default !== undefined ? f.default : '');
      if (f.type === 'select') {
        return `<div class="form-group">
          <label for="f_${f.name}">${UI.escapeHtml(f.label)}</label>
          <select class="form-control" id="f_${f.name}" name="${f.name}" ${f.required ? 'required' : ''}>
            ${f.options.map(o => `<option value="${UI.escapeHtml(o.value)}" ${String(o.value) === String(val) ? 'selected' : ''}>${UI.escapeHtml(o.label)}</option>`).join('')}
          </select>
        </div>`;
      }
      if (f.type === 'textarea') {
        return `<div class="form-group">
          <label for="f_${f.name}">${UI.escapeHtml(f.label)}</label>
          <textarea class="form-control" id="f_${f.name}" name="${f.name}" ${f.required ? 'required' : ''}>${UI.escapeHtml(val)}</textarea>
        </div>`;
      }
      if (f.type === 'checkbox') {
        return `<div class="form-group">
          <label><input type="checkbox" id="f_${f.name}" name="${f.name}" ${val ? 'checked' : ''}> ${UI.escapeHtml(f.label)}</label>
        </div>`;
      }
      if (f.type === 'file') {
        return `<div class="form-group">
          <label for="f_${f.name}">${UI.escapeHtml(f.label)}</label>
          ${val ? `<div style="margin-bottom:8px;"><img src="${val}" alt="" style="max-height:60px;max-width:160px;display:block;border:1px solid var(--border);border-radius:4px;padding:4px;"></div>` : ''}
          <input type="file" class="form-control" id="f_${f.name}" name="${f.name}" accept="${f.accept || '*'}">
          ${f.hint ? `<p class="form-hint" style="margin:4px 0 0;">${UI.escapeHtml(f.hint)}</p>` : ''}
        </div>`;
      }
      return `<div class="form-group">
        <label for="f_${f.name}">${UI.escapeHtml(f.label)}</label>
        <input class="form-control" type="${f.type || 'text'}" id="f_${f.name}" name="${f.name}" value="${UI.escapeHtml(val)}" ${f.required ? 'required' : ''} ${f.step ? `step="${f.step}"` : ''}>
      </div>`;
    }).join('');

    backdrop.innerHTML = `
      <div class="modal">
        <h3>${UI.escapeHtml(title)}</h3>
        <form id="modalForm">
          ${fieldsHtml}
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:10px;">
            <button type="button" class="btn btn-outline" data-action="cancel">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>`;

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop || e.target.dataset.action === 'cancel') backdrop.remove();
    });

    backdrop.querySelector('#modalForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const result = {};
      for (const f of fields) {
        const el = backdrop.querySelector(`#f_${f.name}`);
        if (f.type === 'checkbox') {
          result[f.name] = el.checked;
        } else if (f.type === 'number') {
          result[f.name] = el.value === '' ? null : Number(el.value);
        } else if (f.type === 'file') {
          result[f.name] = el.files && el.files[0] ? await UI.readFileAsDataURL(el.files[0]) : (initialValues[f.name] || null);
        } else {
          result[f.name] = el.value;
        }
      }
      backdrop.remove();
      onSubmit(result);
    });

    document.body.appendChild(backdrop);
  },

  renderQR(elementId, text) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = '';
    if (window.QRCode) {
      new QRCode(el, { text, width: 160, height: 160, colorDark: '#0b3a66', colorLight: '#ffffff' });
    } else {
      el.textContent = text;
    }
  },

  // Generic document upload modal. Pass `assetId` to upload straight against
  // a known asset (hides the asset picker), or `assets` to let the user pick.
  openDocumentUploadModal({ assets = [], assetId = null, onUploaded } = {}) {
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
          ${assetId === null ? `
          <div class="form-group">
            <label for="docAsset">Related Asset</label>
            <select class="form-control" id="docAsset">
              <option value="">None</option>
              ${assets.map(a => `<option value="${a.id}">${UI.escapeHtml(a.asset_name)}</option>`).join('')}
            </select>
          </div>` : ''}
          <div class="form-group">
            <label for="docExpiry">Expiry Date</label>
            <input type="date" class="form-control" id="docExpiry">
            <p class="form-hint" style="margin:4px 0 0;">Optional. We'll flag this document when it's expiring soon.</p>
          </div>
          <div class="form-group">
            <label for="docFile">File *</label>
            <input type="file" class="form-control" id="docFile" accept="application/pdf,image/*" required>
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
        const docAssetEl = document.getElementById('docAsset');
        DB.insert('documents', {
          document_name: document.getElementById('docName').value,
          document_type: document.getElementById('docType').value,
          file_url: reader.result,
          file_type: file.type,
          asset_id: assetId !== null ? assetId : (docAssetEl && docAssetEl.value ? Number(docAssetEl.value) : null),
          expiry_date: document.getElementById('docExpiry').value || null,
          inspection_id: null,
          uploaded_by: Auth.currentUser() ? Auth.currentUser().id : null,
          uploaded_at: Utils.nowISO()
        });
        backdrop.remove();
        UI.toast('Document uploaded', 'success');
        if (onUploaded) onUploaded();
      };
      reader.readAsDataURL(file);
    });

    document.body.appendChild(backdrop);
  }
};

window.UI = UI;
