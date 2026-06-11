// View: Corrective Action Detail
(function () {

Views.carDetail = function (params) {
  const car = DB.getById('corrective_actions', params.id);
  if (!car) {
    App.setTitle('Corrective Action Not Found');
    App.renderContent('<div class="card empty-state"><div class="icon">&#10060;</div><h2>Corrective Action Not Found</h2><a href="#/cars">Back to Corrective Actions</a></div>');
    return;
  }

  App.setTitle(car.car_number, 'Corrective Action Detail');
  render();

  function render() {
    const asset = DB.getById('assets', car.asset_id);
    const inspection = DB.getById('inspections', car.inspection_id);
    const item = DB.getById('inspection_items', car.inspection_item_id);
    const users = DB.getAll('users');

    App.renderContent(`
      <div class="breadcrumbs"><a href="#/cars">&larr; Back to Corrective Actions</a></div>

      <div class="grid grid-2">
        <div class="card">
          <div class="section-header"><h2>${UI.escapeHtml(car.car_number)}</h2>${UI.statusBadge(car.status)}</div>
          <div class="kv-list">
            <div class="k">Asset</div><div class="v"><a href="#/assets/${asset.id}">${UI.escapeHtml(asset.asset_name)}</a></div>
            <div class="k">Source Inspection</div><div class="v"><a href="#/inspections/${inspection.id}/summary">${UI.escapeHtml(inspection.inspection_number)}</a></div>
            <div class="k">Priority</div><div class="v">${UI.priorityBadge(car.priority)}</div>
            <div class="k">Due Date</div><div class="v">${UI.formatDate(car.due_date)}</div>
            <div class="k">Completion Date</div><div class="v">${UI.formatDate(car.completion_date)}</div>
            <div class="k">Created</div><div class="v">${UI.formatDateTime(car.created_at)}</div>
          </div>
          <div class="form-group" style="margin-top:14px;">
            <label>Issue Description</label>
            <p>${UI.escapeHtml(car.issue_description)}</p>
          </div>
          <div class="form-group">
            <label>Required Corrective Action</label>
            <p>${UI.escapeHtml(car.corrective_action)}</p>
          </div>
          ${item && item.legal_reference ? `<div class="tag-pill">${UI.escapeHtml(item.legal_reference)}</div>` : ''}
          ${item && item.photo ? `<div><label style="display:block;margin-top:12px;font-weight:700;">Inspection Photo</label><img src="${item.photo}" class="photo-thumb"></div>` : ''}
        </div>

        <div class="card">
          <div class="section-header"><h2>Manage Action</h2></div>
          <div class="form-group">
            <label for="assignedTo">Assigned To</label>
            <select class="form-control" id="assignedTo">
              ${users.map(u => `<option value="${u.id}" ${u.id === car.assigned_to ? 'selected' : ''}>${UI.escapeHtml(u.full_name)} (${u.role})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="statusSelect">Status</label>
            <select class="form-control" id="statusSelect">
              <option value="Open" ${car.status === 'Open' ? 'selected' : ''}>Open</option>
              <option value="In Progress" ${car.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Overdue" ${car.status === 'Overdue' ? 'selected' : ''}>Overdue</option>
              <option value="Closed" ${car.status === 'Closed' ? 'selected' : ''}>Closed</option>
            </select>
          </div>
          <div class="form-group">
            <label for="dueDate">Due Date</label>
            <input type="date" class="form-control" id="dueDate" value="${car.due_date || ''}">
          </div>
          <div class="form-group">
            <label for="evidenceNote">Evidence / Resolution Notes</label>
            <textarea class="form-control" id="evidenceNote" placeholder="Describe how this was resolved...">${UI.escapeHtml(car.evidence || '')}</textarea>
          </div>
          <div class="form-group">
            <label for="evidencePhoto">Evidence Photo</label>
            <input type="file" accept="image/*" class="form-control" id="evidencePhoto">
            ${car.evidence_photo ? `<img src="${car.evidence_photo}" class="photo-thumb">` : ''}
          </div>
          <button class="btn btn-primary btn-block" id="saveBtn">Save Changes</button>
        </div>
      </div>
    `);

    document.getElementById('saveBtn').addEventListener('click', () => {
      const status = document.getElementById('statusSelect').value;
      const photoInput = document.getElementById('evidencePhoto');
      const patch = {
        assigned_to: Number(document.getElementById('assignedTo').value),
        status,
        due_date: document.getElementById('dueDate').value,
        evidence: document.getElementById('evidenceNote').value,
        completion_date: status === 'Closed' ? (car.completion_date || Utils.todayISO()) : null
      };

      const finish = () => {
        DB.update('corrective_actions', car.id, patch);
        UI.toast('Corrective action updated', 'success');
        Views.carDetail({ id: car.id });
      };

      if (photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = () => {
          patch.evidence_photo = reader.result;
          finish();
        };
        reader.readAsDataURL(photoInput.files[0]);
      } else {
        finish();
      }
    });
  }
};

Router.add('cars/:id', Views.carDetail);
})();
