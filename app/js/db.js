// VDW Compliance Control System - Data Layer
// Backed by Supabase (Postgres + Auth). Reads are served synchronously from
// an in-memory cache (DB.data) that is populated by DB.load(). Writes
// (insert/update/remove) go to Supabase first, then update the cache.

const SESSION_KEY = 'vdw_ccs_session_v1';

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function nowISO() {
  return new Date().toISOString();
}

// Tables in the Supabase schema. `profiles` is exposed locally as `users`
// for backward compatibility with the rest of the app.
const TABLES = [
  'clients', 'branches', 'profiles', 'inspection_templates', 'template_questions',
  'assets', 'inspections', 'inspection_items', 'corrective_actions', 'documents', 'notifications'
];

function localTableName(table) {
  return table === 'profiles' ? 'users' : table;
}

function remoteTableName(table) {
  return table === 'users' ? 'profiles' : table;
}

const DB = {
  data: null,

  // Fetch all tables from Supabase into the in-memory cache.
  // Each user only sees rows allowed by Row Level Security.
  async load() {
    const data = {};
    const results = await Promise.all(TABLES.map(t => sb.from(t).select('*')));
    TABLES.forEach((t, i) => {
      const { data: rows, error } = results[i];
      if (error) {
        console.error(`Failed to load "${t}" from Supabase:`, error.message);
      }
      data[localTableName(t)] = rows || [];
    });
    this.data = data;
    return this.data;
  },

  getAll(table) {
    return (this.data && this.data[table]) || [];
  },

  getById(table, id) {
    return this.getAll(table).find(r => String(r.id) === String(id)) || null;
  },

  async insert(table, record) {
    const { data, error } = await sb.from(remoteTableName(table)).insert(record).select().single();
    if (error) throw error;
    this.data[table].push(data);
    return data;
  },

  async insertMany(table, records) {
    if (!records.length) return [];
    const { data, error } = await sb.from(remoteTableName(table)).insert(records).select();
    if (error) throw error;
    this.data[table].push(...data);
    return data;
  },

  async update(table, id, patch) {
    const { data, error } = await sb.from(remoteTableName(table)).update(patch).eq('id', id).select().single();
    if (error) throw error;
    const idx = this.data[table].findIndex(r => String(r.id) === String(id));
    if (idx !== -1) this.data[table][idx] = data;
    else this.data[table].push(data);
    return data;
  },

  async remove(table, id) {
    const { error } = await sb.from(remoteTableName(table)).delete().eq('id', id);
    if (error) throw error;
    this.data[table] = this.data[table].filter(r => String(r.id) !== String(id));
  },

  query(table, predicate) {
    return this.getAll(table).filter(predicate);
  }
};

// ---------------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------------

const Auth = {
  _user: null,
  _previousLogin: null,

  async login(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error || !data.user) return null;

    const { data: profile, error: profileError } = await sb.from('profiles').select('*').eq('id', data.user.id).single();
    if (profileError || !profile || !profile.active) {
      await sb.auth.signOut();
      return null;
    }

    this._previousLogin = profile.last_login;
    const { data: updated } = await sb.from('profiles').update({ last_login: nowISO() }).eq('id', profile.id).select().single();
    this._user = updated || profile;

    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ previousLogin: this._previousLogin }));
    return this._user;
  },

  async logout() {
    await sb.auth.signOut();
    this._user = null;
    this._previousLogin = null;
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('ownerClientFilter');
    sessionStorage.removeItem('viewBranchFilter');
  },

  // Restores the cached user from an existing Supabase Auth session
  // (e.g. on page reload). Returns the user, or null if not signed in.
  async restoreSession() {
    const { data } = await sb.auth.getSession();
    if (!data.session) return null;

    const { data: profile, error } = await sb.from('profiles').select('*').eq('id', data.session.user.id).single();
    if (error || !profile || !profile.active) {
      await sb.auth.signOut();
      return null;
    }

    this._user = profile;
    const raw = sessionStorage.getItem(SESSION_KEY);
    this._previousLogin = raw ? JSON.parse(raw).previousLogin || null : null;
    return this._user;
  },

  currentUser() {
    return this._user;
  },

  // The signed-in user's last_login value before this session started (null on first-ever login).
  previousLogin() {
    return this._previousLogin;
  },

  isAuthenticated() {
    return !!this._user;
  },

  // For Owners, returns the client they've chosen to focus on (or null for "All Clients").
  // For other roles, returns their assigned client_id (or null).
  viewClientId() {
    const user = this.currentUser();
    if (!user) return null;
    if (user.role === 'Owner') {
      const sel = sessionStorage.getItem('ownerClientFilter');
      return sel ? Number(sel) : null;
    }
    return user.client_id || null;
  },

  // For Owners and Admins, returns the branch they've chosen to focus on (or null for "All Branches").
  viewBranchId() {
    const user = this.currentUser();
    if (!user || (user.role !== 'Owner' && user.role !== 'Admin')) return null;
    const sel = sessionStorage.getItem('viewBranchFilter');
    return sel ? Number(sel) : null;
  }
};

// ---------------------------------------------------------------------
// AUTOMATIONS
// ---------------------------------------------------------------------

const Automations = {
  // AUTOMATION A - Create Inspection Items from template
  async createInspectionItems(inspection) {
    const asset = DB.getById('assets', inspection.asset_id);
    const questions = DB.query('template_questions', q => q.template_id === asset.template_id && q.active);
    const items = questions.map(q => ({
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
    }));
    await DB.insertMany('inspection_items', items);
    await DB.update('inspections', inspection.id, {
      total_items: questions.length,
      items_created: true
    });
  },

  // Start a new inspection for an asset (creates Inspection + triggers Automation A)
  async startInspection(assetId, inspectorId, inspectorName) {
    const asset = DB.getById('assets', assetId);
    const inspection = await DB.insert('inspections', {
      // Temporary placeholder - replaced below once we know the new id.
      inspection_number: 'INS-PENDING-' + Date.now(),
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

    const inspectionNumber = 'INS-' + String(inspection.id).padStart(5, '0');
    await DB.update('inspections', inspection.id, { inspection_number: inspectionNumber });

    await this.createInspectionItems(inspection);
    return DB.getById('inspections', inspection.id);
  },

  // AUTOMATION B - Create Corrective Action when item result = Fail
  async maybeCreateCorrectiveAction(item) {
    if (item.result !== 'Fail' || item.corrective_action_created) return;
    const question = DB.getById('template_questions', item.template_question_id);
    const inspection = DB.getById('inspections', item.inspection_id);
    const priorityMap = { Critical: 'Critical', High: 'High', Medium: 'Medium', Low: 'Low' };

    const car = await DB.insert('corrective_actions', {
      car_number: 'CAR-PENDING-' + Date.now(),
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

    const carNumber = 'CAR-' + String(car.id).padStart(5, '0');
    await DB.update('corrective_actions', car.id, { car_number: carNumber });

    await DB.update('inspection_items', item.id, { corrective_action_created: true, corrective_action_required: true });
  },

  // Update an inspection item's result/comment/photo and run automations
  async updateInspectionItem(itemId, patch) {
    const item = await DB.update('inspection_items', itemId, { ...patch, completed: !!patch.result });
    await this.maybeCreateCorrectiveAction(DB.getById('inspection_items', itemId));
    return item;
  },

  // AUTOMATION C - Complete Inspection
  async completeInspection(inspectionId) {
    const inspection = DB.getById('inspections', inspectionId);
    const items = DB.query('inspection_items', i => i.inspection_id === inspectionId);
    const passCount = items.filter(i => i.result === 'Pass').length;
    const failCount = items.filter(i => i.result === 'Fail').length;
    const scored = passCount + failCount;
    const complianceScore = scored > 0 ? Math.round((passCount / scored) * 100) : null;

    await DB.update('inspections', inspectionId, {
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

    await DB.update('assets', asset.id, {
      last_inspection_date: todayISO(),
      next_inspection_date: nextDate,
      compliance_status: complianceStatus,
      updated_at: nowISO()
    });

    return DB.getById('inspections', inspectionId);
  },

  // AUTOMATION D - mark overdue inspections
  async refreshOverdueInspections() {
    const today = todayISO();
    const overdue = DB.query('inspections', i => i.due_date < today && i.status !== 'Completed' && i.status !== 'Overdue');
    await Promise.all(overdue.map(i => DB.update('inspections', i.id, { status: 'Overdue' })));
  },

  // AUTOMATION E - mark overdue corrective actions
  async refreshOverdueCARs() {
    const today = todayISO();
    const overdue = DB.query('corrective_actions', c => c.due_date < today && c.status !== 'Closed' && c.status !== 'Overdue');
    await Promise.all(overdue.map(c => DB.update('corrective_actions', c.id, { status: 'Overdue' })));
  },

  async runDailyChecks() {
    await this.refreshOverdueInspections();
    await this.refreshOverdueCARs();
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

  branchPerformance(scope = {}) {
    let branches = DB.getAll('branches');
    if (scope.clientId) branches = branches.filter(b => b.client_id === scope.clientId);
    return branches.map(branch => {
      const assets = DB.query('assets', a => a.branch_id === branch.id);
      const inspections = DB.query('inspections', i => i.branch_id === branch.id);
      return {
        branch,
        assetCount: assets.length,
        inspectionCount: inspections.length,
        compliance: this.computeCompliancePercentage(inspections)
      };
    });
  },

  // Corrective actions raised since the given timestamp (e.g. the user's previous login), scoped by client/branch.
  newCorrectiveActions(sinceISO, scope = {}) {
    if (!sinceISO) return [];
    let cars = DB.getAll('corrective_actions').filter(c => c.created_at > sinceISO);
    if (scope.clientId) {
      const assetIds = DB.query('assets', a => a.client_id === scope.clientId).map(a => a.id);
      cars = cars.filter(c => assetIds.includes(c.asset_id));
    }
    if (scope.branchId) {
      const assetIds = DB.query('assets', a => a.branch_id === scope.branchId).map(a => a.id);
      cars = cars.filter(c => assetIds.includes(c.asset_id));
    }
    return cars.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  expiringClients(daysAhead = 30, scope = {}) {
    let clients = DB.getAll('clients');
    if (scope.clientId) clients = clients.filter(c => c.id === scope.clientId);
    const cutoff = todayISO(daysAhead);
    const today = todayISO();
    return clients
      .filter(c => c.contract_end_date && c.contract_end_date <= cutoff)
      .map(c => ({ client: c, expired: c.contract_end_date < today }))
      .sort((a, b) => a.client.contract_end_date.localeCompare(b.client.contract_end_date));
  }
};

// Expose globally (no module bundler in this prototype)
window.DB = DB;
window.Auth = Auth;
window.Automations = Automations;
window.Metrics = Metrics;
window.Utils = { todayISO, nowISO };
