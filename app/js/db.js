// VDW Compliance Control System - Mock Data Layer
// Persists to localStorage. Acts as the "database" for this prototype.

const DB_KEY = 'vdw_ccs_db_v1';
const SESSION_KEY = 'vdw_ccs_session_v1';

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function nowISO() {
  return new Date().toISOString();
}

function seedData() {
  return {
    nextIds: {
      clients: 3, branches: 4, users: 6, assets: 6, inspection_templates: 4,
      template_questions: 16, inspections: 3, inspection_items: 100, corrective_actions: 3,
      documents: 1, notifications: 1
    },
    clients: [
      { id: 1, client_name: 'Sasol Polymers', client_code: 'SAS-001', contact_person: 'J. Naidoo', contact_email: 'j.naidoo@sasol.com', contact_phone: '011 555 0101', status: 'Active', created_at: nowISO(), updated_at: nowISO() },
      { id: 2, client_name: 'Transnet Logistics', client_code: 'TRN-002', contact_person: 'M. van Wyk', contact_email: 'm.vanwyk@transnet.net', contact_phone: '012 555 0202', status: 'Active', created_at: nowISO(), updated_at: nowISO() }
    ],
    branches: [
      { id: 1, client_id: 1, branch_name: 'Sasolburg Plant', branch_code: 'SAS-SB', address: '1 Sasol Road, Sasolburg, 1947', region: 'Free State', manager_id: 2, status: 'Active', created_at: nowISO(), updated_at: nowISO() },
      { id: 2, client_id: 1, branch_name: 'Secunda Warehouse', branch_code: 'SAS-SEC', address: '14 Industrial Avenue, Secunda, 2302', region: 'Mpumalanga', manager_id: 2, status: 'Active', created_at: nowISO(), updated_at: nowISO() },
      { id: 3, client_id: 2, branch_name: 'City Deep Depot', branch_code: 'TRN-CD', address: '8 Rail Street, City Deep, Johannesburg', region: 'Gauteng', manager_id: 5, status: 'Active', created_at: nowISO(), updated_at: nowISO() }
    ],
    users: [
      { id: 1, full_name: 'Niel van der Walt', email: 'admin@vdwsafety.com', password: 'admin123', role: 'Admin', branch_id: null, active: true, last_login: null, created_at: nowISO() },
      { id: 2, full_name: 'Sarah Pretorius', email: 'sarah.manager@vdwsafety.com', password: 'manager123', role: 'Manager', branch_id: 1, active: true, last_login: null, created_at: nowISO() },
      { id: 3, full_name: 'Thabo Mokoena', email: 'thabo.inspector@vdwsafety.com', password: 'inspect123', role: 'Inspector', branch_id: 1, active: true, last_login: null, created_at: nowISO() },
      { id: 4, full_name: 'Lerato Dube', email: 'lerato.inspector@vdwsafety.com', password: 'inspect123', role: 'Inspector', branch_id: 2, active: true, last_login: null, created_at: nowISO() },
      { id: 5, full_name: 'Pieter Botha', email: 'pieter.manager@vdwsafety.com', password: 'manager123', role: 'Manager', branch_id: 3, active: true, last_login: null, created_at: nowISO() }
    ],
    inspection_templates: [
      { id: 1, template_name: 'Fire Extinguisher Monthly Check', asset_type: 'Fire Extinguisher', inspection_frequency: 30, active: true, created_at: nowISO() },
      { id: 2, template_name: 'Forklift Pre-Use Inspection', asset_type: 'Forklift', inspection_frequency: 7, active: true, created_at: nowISO() },
      { id: 3, template_name: 'Electrical Distribution Board Inspection', asset_type: 'Electrical Panel', inspection_frequency: 180, active: true, created_at: nowISO() }
    ],
    template_questions: [
      // Fire Extinguisher (template 1)
      { id: 1, template_id: 1, question_text: 'Pressure gauge reading is in the green zone', category: 'Equipment Condition', legal_reference: 'SANS 1475', risk_level: 'High', default_corrective_action: 'Recharge or replace the extinguisher immediately', photo_required: true, critical: true, weight: 3, active: true },
      { id: 2, template_id: 1, question_text: 'Safety pin and tamper seal are intact', category: 'Safety Devices', legal_reference: 'OHS Act Section 8', risk_level: 'Medium', default_corrective_action: 'Replace seal and pin', photo_required: false, critical: false, weight: 2, active: true },
      { id: 3, template_id: 1, question_text: 'Extinguisher is mounted, signed and unobstructed', category: 'Accessibility', legal_reference: 'SANS 1475', risk_level: 'Medium', default_corrective_action: 'Clear access path / remount on bracket', photo_required: true, critical: false, weight: 1, active: true },
      { id: 4, template_id: 1, question_text: 'No visible corrosion, dents or physical damage', category: 'Equipment Condition', legal_reference: 'SANS 1475', risk_level: 'High', default_corrective_action: 'Remove from service and replace unit', photo_required: true, critical: true, weight: 3, active: true },
      { id: 5, template_id: 1, question_text: 'Service inspection tag is up to date', category: 'Documentation', legal_reference: 'OHS Act Section 8', risk_level: 'Low', default_corrective_action: 'Schedule service with accredited provider', photo_required: false, critical: false, weight: 1, active: true },
      // Forklift (template 2)
      { id: 6, template_id: 2, question_text: 'Service and parking brakes function correctly', category: 'Mechanical', legal_reference: 'Driven Machinery Regulations', risk_level: 'Critical', default_corrective_action: 'Take forklift out of service and notify maintenance', photo_required: false, critical: true, weight: 3, active: true },
      { id: 7, template_id: 2, question_text: 'Hydraulic system free of leaks', category: 'Mechanical', legal_reference: 'DMR Regulation 18', risk_level: 'High', default_corrective_action: 'Report leak and schedule repair', photo_required: true, critical: true, weight: 3, active: true },
      { id: 8, template_id: 2, question_text: 'Horn and reverse alarm are operational', category: 'Safety Devices', legal_reference: 'DMR Regulation 18', risk_level: 'Medium', default_corrective_action: 'Repair horn / reverse alarm before next use', photo_required: false, critical: false, weight: 2, active: true },
      { id: 9, template_id: 2, question_text: 'Operator license is displayed and valid', category: 'Documentation', legal_reference: 'DMR Regulation 18', risk_level: 'Medium', default_corrective_action: 'Verify and renew operator license', photo_required: false, critical: false, weight: 1, active: true },
      { id: 10, template_id: 2, question_text: 'Tyres are in acceptable condition', category: 'Mechanical', legal_reference: 'DMR Regulation 18', risk_level: 'Medium', default_corrective_action: 'Replace worn tyres', photo_required: true, critical: false, weight: 2, active: true },
      // Electrical Panel (template 3)
      { id: 11, template_id: 3, question_text: 'Panel cover is closed and securely fastened', category: 'Electrical Safety', legal_reference: 'SANS 10142-1', risk_level: 'High', default_corrective_action: 'Secure panel cover immediately', photo_required: false, critical: true, weight: 3, active: true },
      { id: 12, template_id: 3, question_text: 'Circuit breakers are correctly labelled', category: 'Documentation', legal_reference: 'SANS 10142-1', risk_level: 'Low', default_corrective_action: 'Update circuit labelling', photo_required: false, critical: false, weight: 1, active: true },
      { id: 13, template_id: 3, question_text: 'No signs of overheating, scorch marks or burning smell', category: 'Electrical Safety', legal_reference: 'SANS 10142-1', risk_level: 'Critical', default_corrective_action: 'De-energise board and call a qualified electrician', photo_required: true, critical: true, weight: 3, active: true },
      { id: 14, template_id: 3, question_text: 'Clear access of 1m maintained in front of panel', category: 'Accessibility', legal_reference: 'OHS Act Section 8', risk_level: 'Medium', default_corrective_action: 'Remove obstruction from panel access', photo_required: true, critical: false, weight: 2, active: true },
      { id: 15, template_id: 3, question_text: 'Earth leakage / RCD test button is functional', category: 'Electrical Safety', legal_reference: 'SANS 10142-1', risk_level: 'High', default_corrective_action: 'Replace faulty RCD unit', photo_required: false, critical: true, weight: 3, active: true }
    ],
    assets: [
      { id: 1, asset_name: 'Fire Extinguisher - Loading Bay A', asset_tag: 'FE-SB-001', serial_number: 'FX0019283', asset_type: 'Fire Extinguisher', client_id: 1, branch_id: 1, template_id: 1, location_description: 'Loading Bay A, near Door 3', qr_code_url: '', status: 'Active', last_inspection_date: null, next_inspection_date: todayISO(-2), compliance_status: 'Pending', created_at: nowISO(), updated_at: nowISO() },
      { id: 2, asset_name: 'Forklift - Toyota 8FG25', asset_tag: 'FL-SB-002', serial_number: 'TY8FG25-4471', asset_type: 'Forklift', client_id: 1, branch_id: 1, template_id: 2, location_description: 'Warehouse Floor, Bay 2', qr_code_url: '', status: 'Active', last_inspection_date: todayISO(-10), next_inspection_date: todayISO(-3), compliance_status: 'Non-Compliant', created_at: nowISO(), updated_at: nowISO() },
      { id: 3, asset_name: 'Electrical DB - Main Distribution', asset_tag: 'EDB-SEC-001', serial_number: 'EDB-2021-118', asset_type: 'Electrical Panel', client_id: 1, branch_id: 2, template_id: 3, location_description: 'Plant Room, Secunda Warehouse', qr_code_url: '', status: 'Active', last_inspection_date: todayISO(-30), next_inspection_date: todayISO(150), compliance_status: 'Compliant', created_at: nowISO(), updated_at: nowISO() },
      { id: 4, asset_name: 'Fire Extinguisher - Office Block Reception', asset_tag: 'FE-CD-004', serial_number: 'FX0044192', asset_type: 'Fire Extinguisher', client_id: 2, branch_id: 3, template_id: 1, location_description: 'Reception Area, City Deep Depot', qr_code_url: '', status: 'Active', last_inspection_date: null, next_inspection_date: todayISO(5), compliance_status: 'Pending', created_at: nowISO(), updated_at: nowISO() },
      { id: 5, asset_name: 'Forklift - Hyster H2.5FT', asset_tag: 'FL-CD-005', serial_number: 'HY25FT-9981', asset_type: 'Forklift', client_id: 2, branch_id: 3, template_id: 2, location_description: 'Yard, City Deep Depot', qr_code_url: '', status: 'Active', last_inspection_date: null, next_inspection_date: todayISO(2), compliance_status: 'Pending', created_at: nowISO(), updated_at: nowISO() }
    ],
    inspections: [],
    inspection_items: [],
    corrective_actions: [],
    documents: [],
    notifications: []
  };
}

const DB = {
  data: null,

  load() {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      this.data = JSON.parse(raw);
    } else {
      this.data = seedData();
      this.save();
    }
    return this.data;
  },

  save() {
    localStorage.setItem(DB_KEY, JSON.stringify(this.data));
  },

  reset() {
    this.data = seedData();
    this.save();
  },

  nextId(table) {
    const id = this.data.nextIds[table]++;
    return id;
  },

  getAll(table) {
    return this.data[table] || [];
  },

  getById(table, id) {
    return this.getAll(table).find(r => r.id === Number(id)) || null;
  },

  insert(table, record) {
    record.id = this.nextId(table);
    this.data[table].push(record);
    this.save();
    return record;
  },

  update(table, id, patch) {
    const record = this.getById(table, id);
    if (!record) return null;
    Object.assign(record, patch);
    this.save();
    return record;
  },

  remove(table, id) {
    this.data[table] = this.data[table].filter(r => r.id !== Number(id));
    this.save();
  },

  query(table, predicate) {
    return this.getAll(table).filter(predicate);
  }
};

// ---------------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------------

const Auth = {
  login(email, password) {
    const user = DB.query('users', u => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.active)[0];
    if (!user) return null;
    DB.update('users', user.id, { last_login: nowISO() });
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
    return user;
  },

  logout() {
    sessionStorage.removeItem(SESSION_KEY);
  },

  currentUser() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { userId } = JSON.parse(raw);
    return DB.getById('users', userId);
  },

  isAuthenticated() {
    return !!this.currentUser();
  }
};

// ---------------------------------------------------------------------
// AUTOMATIONS
// ---------------------------------------------------------------------

const Automations = {
  // AUTOMATION A - Create Inspection Items from template
  createInspectionItems(inspection) {
    const asset = DB.getById('assets', inspection.asset_id);
    const questions = DB.query('template_questions', q => q.template_id === asset.template_id && q.active);
    questions.forEach(q => {
      DB.insert('inspection_items', {
        inspection_id: inspection.id,
        asset_id: asset.id,
        template_question_id: q.id,
        question_text: q.question_text,
        category: q.category,
        legal_reference: q.legal_reference,
        result: null,
        comment: '',
        photo: null,
        score_value: q.weight,
        corrective_action_required: false,
        corrective_action_created: false,
        completed: false,
        created_at: nowISO()
      });
    });
    DB.update('inspections', inspection.id, {
      total_items: questions.length,
      items_created: true
    });
  },

  // Start a new inspection for an asset (creates Inspection + triggers Automation A)
  startInspection(assetId, inspectorId, inspectorName) {
    const asset = DB.getById('assets', assetId);
    const template = DB.getById('inspection_templates', asset.template_id);
    const inspectionNumber = 'INS-' + String(DB.data.nextIds.inspections).padStart(5, '0');
    const inspection = DB.insert('inspections', {
      inspection_number: inspectionNumber,
      asset_id: asset.id,
      branch_id: asset.branch_id,
      client_id: asset.client_id,
      inspector_id: inspectorId || null,
      inspector_name: inspectorName || null,
      inspection_date: todayISO(),
      completion_date: null,
      due_date: todayISO(),
      status: 'In Progress',
      total_items: 0,
      pass_count: 0,
      fail_count: 0,
      compliance_score: null,
      items_created: false,
      completed: false,
      created_at: nowISO()
    });
    this.createInspectionItems(inspection);
    return DB.getById('inspections', inspection.id);
  },

  // AUTOMATION B - Create Corrective Action when item result = Fail
  maybeCreateCorrectiveAction(item) {
    if (item.result !== 'Fail' || item.corrective_action_created) return;
    const question = DB.getById('template_questions', item.template_question_id);
    const inspection = DB.getById('inspections', item.inspection_id);
    const priorityMap = { Critical: 'Critical', High: 'High', Medium: 'Medium', Low: 'Low' };
    const carNumber = 'CAR-' + String(DB.data.nextIds.corrective_actions).padStart(5, '0');
    DB.insert('corrective_actions', {
      car_number: carNumber,
      inspection_id: inspection.id,
      inspection_item_id: item.id,
      asset_id: item.asset_id,
      assigned_to: inspection.inspector_id,
      priority: priorityMap[question.risk_level] || 'Medium',
      issue_description: item.question_text + (item.comment ? ' — ' + item.comment : ''),
      corrective_action: question.default_corrective_action,
      due_date: todayISO(question.critical ? 3 : 14),
      completion_date: null,
      status: 'Open',
      evidence: null,
      created_at: nowISO()
    });
    DB.update('inspection_items', item.id, { corrective_action_created: true, corrective_action_required: true });
  },

  // Update an inspection item's result/comment/photo and run automations
  updateInspectionItem(itemId, patch) {
    const item = DB.update('inspection_items', itemId, { ...patch, completed: !!patch.result });
    this.maybeCreateCorrectiveAction(DB.getById('inspection_items', itemId));
    return item;
  },

  // AUTOMATION C - Complete Inspection
  completeInspection(inspectionId) {
    const inspection = DB.getById('inspections', inspectionId);
    const items = DB.query('inspection_items', i => i.inspection_id === inspectionId);
    const passCount = items.filter(i => i.result === 'Pass').length;
    const failCount = items.filter(i => i.result === 'Fail').length;
    const scored = passCount + failCount;
    const complianceScore = scored > 0 ? Math.round((passCount / scored) * 100) : null;

    DB.update('inspections', inspectionId, {
      status: 'Completed',
      completed: true,
      completion_date: todayISO(),
      pass_count: passCount,
      fail_count: failCount,
      compliance_score: complianceScore
    });

    const asset = DB.getById('assets', inspection.asset_id);
    const template = DB.getById('inspection_templates', asset.template_id);
    const nextDate = todayISO(template ? template.inspection_frequency : 30);

    let complianceStatus = 'Compliant';
    if (complianceScore === null) complianceStatus = 'Pending';
    else if (complianceScore < 100) complianceStatus = 'Non-Compliant';

    DB.update('assets', asset.id, {
      last_inspection_date: todayISO(),
      next_inspection_date: nextDate,
      compliance_status: complianceStatus,
      updated_at: nowISO()
    });

    return DB.getById('inspections', inspectionId);
  },

  // AUTOMATION D - mark overdue inspections
  refreshOverdueInspections() {
    const today = todayISO();
    DB.query('inspections', i => i.due_date < today && i.status !== 'Completed' && i.status !== 'Overdue')
      .forEach(i => DB.update('inspections', i.id, { status: 'Overdue' }));
  },

  // AUTOMATION E - mark overdue corrective actions
  refreshOverdueCARs() {
    const today = todayISO();
    DB.query('corrective_actions', c => c.due_date < today && c.status !== 'Closed' && c.status !== 'Overdue')
      .forEach(c => DB.update('corrective_actions', c.id, { status: 'Overdue' }));
  },

  runDailyChecks() {
    this.refreshOverdueInspections();
    this.refreshOverdueCARs();
  }
};

// ---------------------------------------------------------------------
// METRICS
// ---------------------------------------------------------------------

const Metrics = {
  computeCompliancePercentage(inspections) {
    const completed = inspections.filter(i => i.compliance_score !== null && i.compliance_score !== undefined);
    if (!completed.length) return null;
    const sum = completed.reduce((acc, i) => acc + i.compliance_score, 0);
    return Math.round(sum / completed.length);
  },

  dashboardMetrics(scope = {}) {
    let assets = DB.getAll('assets');
    let inspections = DB.getAll('inspections');
    let cars = DB.getAll('corrective_actions');

    if (scope.clientId) {
      assets = assets.filter(a => a.client_id === scope.clientId);
      inspections = inspections.filter(i => i.client_id === scope.clientId);
      cars = cars.filter(c => assets.some(a => a.id === c.asset_id));
    }
    if (scope.branchId) {
      assets = assets.filter(a => a.branch_id === scope.branchId);
      inspections = inspections.filter(i => i.branch_id === scope.branchId);
      cars = cars.filter(c => assets.some(a => a.id === c.asset_id));
    }
    if (scope.inspectorId) {
      inspections = inspections.filter(i => i.inspector_id === scope.inspectorId);
    }

    return {
      totalClients: DB.getAll('clients').length,
      totalAssets: assets.length,
      totalInspections: inspections.length,
      overdueInspections: inspections.filter(i => i.status === 'Overdue').length,
      openCARs: cars.filter(c => c.status === 'Open' || c.status === 'In Progress' || c.status === 'Overdue').length,
      overdueCARs: cars.filter(c => c.status === 'Overdue').length,
      compliancePercentage: this.computeCompliancePercentage(inspections)
    };
  },

  branchPerformance() {
    return DB.getAll('branches').map(branch => {
      const assets = DB.query('assets', a => a.branch_id === branch.id);
      const inspections = DB.query('inspections', i => i.branch_id === branch.id);
      return {
        branch,
        assetCount: assets.length,
        inspectionCount: inspections.length,
        compliance: this.computeCompliancePercentage(inspections)
      };
    });
  }
};

// Expose globally (no module bundler in this prototype)
window.DB = DB;
window.Auth = Auth;
window.Automations = Automations;
window.Metrics = Metrics;
window.Utils = { todayISO, nowISO };
