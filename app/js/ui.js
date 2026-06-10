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

  userName(id) {
    const u = DB.getById('users', id);
    return u ? u.full_name : '—';
  },

  assetName(id) {
    const a = DB.getById('assets', id);
    return a ? a.asset_name : '—';
  },

  qrUrl(assetId) {
    return window.location.origin + window.location.pathname + '#/start-inspection/' + assetId;
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

    backdrop.querySelector('#modalForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const result = {};
      fields.forEach(f => {
        const el = backdrop.querySelector(`#f_${f.name}`);
        if (f.type === 'checkbox') {
          result[f.name] = el.checked;
        } else if (f.type === 'number') {
          result[f.name] = el.value === '' ? null : Number(el.value);
        } else {
          result[f.name] = el.value;
        }
      });
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
  }
};

window.UI = UI;
