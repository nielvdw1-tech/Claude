// View: Inspection Form (checklist)
(function () {

Views.inspectionForm = function (params) {
  const inspection = DB.getById('inspections', params.id);
  if (!inspection) {
    App.setTitle('Inspection Not Found');
    App.renderContent('<div class="card empty-state"><div class="icon">&#10060;</div><h2>Inspection Not Found</h2><a href="#/inspections">Back to History</a></div>');
    return;
  }

  if (inspection.status === 'Completed') {
    window.location.hash = `#/inspections/${inspection.id}/summary`;
    return;
  }

  const asset = DB.getById('assets', inspection.asset_id);
  const isAuthenticated = !!Auth.currentUser();
  App.setTitle('Inspection Form', `${inspection.inspection_number} — ${asset.asset_name}`);
  render();

  function render() {
    const items = DB.query('inspection_items', i => i.inspection_id === inspection.id);
    const completedCount = items.filter(i => i.result).length;
    const progress = items.length ? Math.round((completedCount / items.length) * 100) : 0;
    const allDone = items.length > 0 && completedCount === items.length;

    App.renderContent(`
      ${isAuthenticated ? `<div class="breadcrumbs"><a href="#/assets/${asset.id}">&larr; Back to Asset</a></div>` : ''}

      <div class="card">
        <div class="section-header">
          <h2>${UI.escapeHtml(inspection.inspection_number)}</h2>
          ${UI.statusBadge(inspection.status)}
        </div>
        <div class="kv-list">
          <div class="k">Asset</div><div class="v">${UI.escapeHtml(asset.asset_name)} (${UI.escapeHtml(asset.asset_tag)})</div>
          <div class="k">Inspector</div><div class="v">${UI.escapeHtml(UI.userName(inspection.inspector_id))}</div>
          <div class="k">Inspection Date</div><div class="v">${UI.formatDate(inspection.inspection_date)}</div>
        </div>
        <div style="margin-top:14px;">
          <div style="display:flex;justify-content:space-between;font-size:.82rem;font-weight:700;margin-bottom:6px;">
            <span>Progress</span><span>${completedCount} / ${items.length}</span>
          </div>
          <div class="progress-bar"><div class="progress-bar-fill" style="width:${progress}%;"></div></div>
        </div>
      </div>

      <div id="itemsContainer">
        ${items.map(item => renderItem(item)).join('')}
      </div>

      <div class="card" style="position:sticky;bottom:12px;display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-outline" id="saveProgressBtn">Save Progress</button>
        <button class="btn btn-success" id="completeBtn" ${allDone ? '' : 'disabled'}>Complete Inspection</button>
        ${!allDone ? '<span class="form-hint" style="align-self:center;">Answer all items to complete the inspection.</span>' : ''}
      </div>
    `);

    items.forEach(item => {
      const card = document.getElementById(`item-${item.id}`);
      card.querySelectorAll('.result-option').forEach(opt => {
        opt.addEventListener('click', () => {
          const result = opt.dataset.result;
          Automations.updateInspectionItem(item.id, { result });
          render();
        });
      });

      const commentEl = card.querySelector('.comment-input');
      commentEl.addEventListener('change', () => {
        Automations.updateInspectionItem(item.id, { comment: commentEl.value });
      });

      const photoInput = card.querySelector('.photo-input');
      if (photoInput) {
        photoInput.addEventListener('change', () => {
          const file = photoInput.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            Automations.updateInspectionItem(item.id, { photo: reader.result });
            render();
          };
          reader.readAsDataURL(file);
        });
      }
    });

    document.getElementById('saveProgressBtn').addEventListener('click', () => {
      UI.toast('Progress saved', 'success');
    });

    const completeBtn = document.getElementById('completeBtn');
    if (!completeBtn.disabled) {
      completeBtn.addEventListener('click', () => {
        UI.confirm('Complete this inspection? Failed items will generate corrective actions and the asset compliance score will be updated.', () => {
          Automations.completeInspection(inspection.id);
          UI.toast('Inspection completed', 'success');
          window.location.hash = `#/inspections/${inspection.id}/summary`;
        });
      });
    }
  }

  function renderItem(item) {
    const failClass = item.result === 'Fail' ? 'fail' : '';
    return `
      <div class="checklist-item ${failClass}" id="item-${item.id}">
        <div class="item-meta">
          <span class="tag-pill">${UI.escapeHtml(item.category)}</span>
          <span class="tag-pill">${UI.escapeHtml(item.legal_reference)}</span>
          ${item.corrective_action_created ? '<span class="badge badge-orange">CAR Created</span>' : ''}
        </div>
        <div class="question">${UI.escapeHtml(item.question_text)}</div>
        <div class="result-options">
          <div class="result-option pass ${item.result === 'Pass' ? 'selected' : ''}" data-result="Pass">PASS</div>
          <div class="result-option fail ${item.result === 'Fail' ? 'selected' : ''}" data-result="Fail">FAIL</div>
          <div class="result-option na ${item.result === 'N/A' ? 'selected' : ''}" data-result="N/A">N/A</div>
        </div>
        <div class="form-group">
          <label>Comment</label>
          <textarea class="form-control comment-input" placeholder="Add notes or observations...">${UI.escapeHtml(item.comment || '')}</textarea>
        </div>
        <div class="form-group">
          <label>Photo ${item.photo ? '' : '(optional)'}</label>
          <input type="file" accept="image/*" capture="environment" class="form-control photo-input">
          ${item.photo ? `<img src="${item.photo}" class="photo-thumb" alt="Inspection photo">` : ''}
        </div>
      </div>`;
  }
};

Router.add('inspections/:id/form', Views.inspectionForm, { public: true });
})();
