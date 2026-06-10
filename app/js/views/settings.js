// View: Settings (Admin) - Inspection Templates & System Settings
(function () {

Views.settings = function () {
  App.setTitle('Settings', 'Inspection templates, checklist questions and system options');
  render('templates');
};

function render(tab, openTemplateId) {
  const templates = DB.getAll('inspection_templates');

  App.renderContent(`
    <div class="toolbar">
      <button class="btn ${tab === 'templates' ? 'btn-primary' : 'btn-outline'} btn-sm" data-tab="templates">Inspection Templates</button>
      <button class="btn ${tab === 'system' ? 'btn-primary' : 'btn-outline'} btn-sm" data-tab="system">System</button>
    </div>
    <div id="settingsTab"></div>
  `);

  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => render(btn.dataset.tab));
  });

  if (tab === 'templates') renderTemplates(openTemplateId);
  else renderSystem();
}

function renderTemplates(openTemplateId) {
  const templates = DB.getAll('inspection_templates');

  document.getElementById('settingsTab').innerHTML = `
    <div class="section-header">
      <h2>Inspection Templates</h2>
      <button class="btn btn-primary" id="addTemplateBtn">+ Add Template</button>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Template</th><th>Asset Type</th><th>Frequency (days)</th><th>Questions</th><th>Active</th><th></th></tr></thead>
          <tbody>
            ${templates.map(t => `
              <tr>
                <td><strong>${UI.escapeHtml(t.template_name)}</strong></td>
                <td>${UI.escapeHtml(t.asset_type)}</td>
                <td>${t.inspection_frequency}</td>
                <td>${DB.query('template_questions', q => q.template_id === t.id).length}</td>
                <td>${UI.statusBadge(t.active ? 'Active' : 'Inactive')}</td>
                <td><button class="btn btn-outline btn-sm" data-manage="${t.id}">Manage Questions</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <div id="questionsPanel"></div>
  `;

  document.getElementById('addTemplateBtn').addEventListener('click', () => {
    UI.openFormModal('Add Inspection Template', [
      { name: 'template_name', label: 'Template Name', required: true },
      { name: 'asset_type', label: 'Asset Type', required: true },
      { name: 'inspection_frequency', label: 'Inspection Frequency (days)', type: 'number', required: true, default: 30 },
      { name: 'active', label: 'Active', type: 'checkbox', default: true }
    ], {}, (values) => {
      DB.insert('inspection_templates', { ...values, created_at: Utils.nowISO() });
      UI.toast('Template created', 'success');
      render('templates');
    });
  });

  document.querySelectorAll('[data-manage]').forEach(btn => {
    btn.addEventListener('click', () => renderQuestions(Number(btn.dataset.manage)));
  });

  if (openTemplateId) renderQuestions(openTemplateId);
}

function renderQuestions(templateId) {
  const template = DB.getById('inspection_templates', templateId);
  const questions = DB.query('template_questions', q => q.template_id === templateId);

  document.getElementById('questionsPanel').innerHTML = `
    <div class="card">
      <div class="section-header">
        <h2>Checklist Questions &mdash; ${UI.escapeHtml(template.template_name)}</h2>
        <button class="btn btn-primary btn-sm" id="addQuestionBtn">+ Add Question</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Question</th><th>Category</th><th>Risk Level</th><th>Critical</th><th>Weight</th><th>Photo Req.</th><th></th></tr></thead>
          <tbody>
            ${questions.map(q => `
              <tr>
                <td>${UI.escapeHtml(q.question_text)}</td>
                <td>${UI.escapeHtml(q.category)}</td>
                <td>${UI.priorityBadge(q.risk_level)}</td>
                <td>${q.critical ? 'Yes' : 'No'}</td>
                <td>${q.weight}</td>
                <td>${q.photo_required ? 'Yes' : 'No'}</td>
                <td>
                  <button class="btn btn-outline btn-sm" data-edit-q="${q.id}">Edit</button>
                  <button class="btn btn-danger btn-sm" data-del-q="${q.id}">Delete</button>
                </td>
              </tr>`).join('') || '<tr><td colspan="7">No questions yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('addQuestionBtn').addEventListener('click', () => openQuestionForm(templateId, null));
  document.querySelectorAll('[data-edit-q]').forEach(btn => {
    btn.addEventListener('click', () => openQuestionForm(templateId, DB.getById('template_questions', btn.dataset.editQ)));
  });
  document.querySelectorAll('[data-del-q]').forEach(btn => {
    btn.addEventListener('click', () => {
      UI.confirm('Delete this checklist question? This will not affect past inspections.', () => {
        DB.remove('template_questions', btn.dataset.delQ);
        UI.toast('Question deleted', 'success');
        renderQuestions(templateId);
      });
    });
  });
}

function openQuestionForm(templateId, question) {
  const fields = [
    { name: 'question_text', label: 'Question Text', type: 'textarea', required: true },
    { name: 'category', label: 'Category', required: true },
    { name: 'legal_reference', label: 'Legal Reference' },
    { name: 'risk_level', label: 'Risk Level', type: 'select', options: [
      { value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }, { value: 'Critical', label: 'Critical' }
    ] },
    { name: 'default_corrective_action', label: 'Default Corrective Action', type: 'textarea' },
    { name: 'weight', label: 'Weight', type: 'number', default: 1 },
    { name: 'photo_required', label: 'Photo Required', type: 'checkbox' },
    { name: 'critical', label: 'Critical Item', type: 'checkbox' },
    { name: 'active', label: 'Active', type: 'checkbox', default: true }
  ];

  UI.openFormModal(question ? 'Edit Question' : 'Add Question', fields, question || { risk_level: 'Medium' }, (values) => {
    if (question) {
      DB.update('template_questions', question.id, values);
      UI.toast('Question updated', 'success');
    } else {
      DB.insert('template_questions', { ...values, template_id: templateId });
      UI.toast('Question added', 'success');
    }
    renderQuestions(templateId);
  });
}

function renderSystem() {
  document.getElementById('settingsTab').innerHTML = `
    <div class="card">
      <div class="section-header"><h2>System Information</h2></div>
      <div class="kv-list">
        <div class="k">System</div><div class="v">VDW Compliance Control System</div>
        <div class="k">Total Clients</div><div class="v">${DB.getAll('clients').length}</div>
        <div class="k">Total Branches</div><div class="v">${DB.getAll('branches').length}</div>
        <div class="k">Total Assets</div><div class="v">${DB.getAll('assets').length}</div>
        <div class="k">Total Inspections</div><div class="v">${DB.getAll('inspections').length}</div>
        <div class="k">Total Corrective Actions</div><div class="v">${DB.getAll('corrective_actions').length}</div>
      </div>
    </div>
    <div class="card">
      <div class="section-header"><h2>Maintenance</h2></div>
      <p style="color:var(--text-light);font-size:.85rem;">Run scheduled compliance jobs manually, or reset this demo environment back to its initial state.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-outline" id="runChecksBtn">Run Overdue Checks Now</button>
        <button class="btn btn-danger" id="resetBtn">Reset Demo Data</button>
      </div>
    </div>
  `;

  document.getElementById('runChecksBtn').addEventListener('click', () => {
    Automations.runDailyChecks();
    UI.toast('Overdue inspections and corrective actions refreshed', 'success');
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    UI.confirm('This will erase all data and restore the original demo dataset. Continue?', () => {
      DB.reset();
      UI.toast('Demo data reset', 'success');
      window.location.hash = '#/dashboard';
      window.location.reload();
    });
  });
}

Router.add('settings', Views.settings, { roles: ['Owner', 'Admin'] });
})();
