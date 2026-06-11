// VDW Compliance Control System - App Shell & Bootstrap

const App = {
  navItems: [
    { path: 'dashboard', label: 'Dashboard', icon: '&#128202;', roles: ['Owner', 'Admin', 'Manager'] },
    { path: 'assets', label: 'Assets', icon: '&#127981;', roles: ['Owner', 'Admin', 'Manager'] },
    { path: 'inspections', label: 'Inspection History', icon: '&#128203;', roles: ['Owner', 'Admin', 'Manager'] },
    { path: 'cars', label: 'Corrective Actions', icon: '&#9888;', roles: ['Owner', 'Admin', 'Manager'] },
    { path: 'documents', label: 'Documents', icon: '&#128193;', roles: ['Owner', 'Admin', 'Manager'] },
    { path: 'reports', label: 'Reports', icon: '&#128200;', roles: ['Owner', 'Admin', 'Manager'] },
    { section: 'Administration' },
    { path: 'clients', label: 'Clients', icon: '&#127970;', roles: ['Owner', 'Admin'] },
    { path: 'branches', label: 'Branches / Sites', icon: '&#128205;', roles: ['Owner', 'Admin', 'Manager'] },
    { path: 'users', label: 'User Management', icon: '&#128100;', roles: ['Owner', 'Admin'] },
    { path: 'settings', label: 'Settings', icon: '&#9881;', roles: ['Owner', 'Admin'] }
  ],

  scopeForUser(user) {
    if (user.role === 'Manager') return { branchId: user.branch_id };
    if (user.role === 'Admin') return { clientId: user.client_id };
    const viewClientId = Auth.viewClientId();
    return viewClientId ? { clientId: viewClientId } : {};
  },

  openCARsCount(user) {
    return Metrics.dashboardMetrics(this.scopeForUser(user)).openCARs;
  },

  // Branches the Owner/Admin can pick from for the dashboard branch switcher.
  viewBranchOptions(user) {
    if (user.role === 'Admin') return DB.query('branches', b => b.client_id === user.client_id);
    const viewClientId = Auth.viewClientId();
    return viewClientId ? DB.query('branches', b => b.client_id === viewClientId) : DB.getAll('branches');
  },

  renderShell() {
    const root = document.getElementById('root');
    const user = Auth.currentUser();
    if (!user) return;

    const currentPath = Router.currentPath().split('/')[0] || 'dashboard';

    const navHtml = this.navItems.map(item => {
      if (item.section) {
        if (!this.navItems.some(n => n.roles && n.roles.includes(user.role) && n.section === undefined)) return '';
        const visibleAfter = this.navItems
          .slice(this.navItems.indexOf(item) + 1)
          .filter(n => !n.section);
        const hasVisible = visibleAfter.some(n => n.roles.includes(user.role));
        return hasVisible ? `<div class="sidebar-section-label">${item.section}</div>` : '';
      }
      if (!item.roles.includes(user.role)) return '';
      const active = item.path === currentPath ? 'active' : '';
      const badge = item.path === 'cars' && this.openCARsCount(user) > 0
        ? `<span class="badge badge-red" style="margin-left:auto;">${this.openCARsCount(user)}</span>` : '';
      return `<a href="#/${item.path}" class="${active}" style="display:flex;align-items:center;"><span aria-hidden="true">${item.icon}</span> ${item.label} ${badge}</a>`;
    }).join('');

    const initials = user.full_name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

    root.innerHTML = `
      <div class="app-shell">
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-brand">
            <span class="badge-dot"></span>
            VDW Compliance Control
          </div>
          <nav class="sidebar-nav">${navHtml}</nav>
          <div class="sidebar-footer">
            Logged in as <strong>${UI.escapeHtml(user.role)}</strong><br>
            &copy; ${new Date().getFullYear()} VDW Safety Consulting
          </div>
        </aside>
        <div class="main-area" id="mainArea">
          <header class="topbar">
            <div class="topbar-left">
              <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu">&#9776;</button>
              <div>
                <div class="page-title" id="pageTitle">Dashboard</div>
                <div class="page-subtitle" id="pageSubtitle"></div>
              </div>
            </div>
            <div class="user-pill">
              ${user.role === 'Owner' ? `
              <select class="form-control" id="ownerClientFilter" style="max-width:200px;">
                <option value="">All Clients</option>
                ${DB.getAll('clients').map(c => `<option value="${c.id}" ${String(Auth.viewClientId()) === String(c.id) ? 'selected' : ''}>${UI.escapeHtml(c.client_name)}</option>`).join('')}
              </select>` : ''}
              ${user.role === 'Owner' || user.role === 'Admin' ? `
              <select class="form-control" id="viewBranchFilter" style="max-width:200px;">
                <option value="">All Branches</option>
                ${this.viewBranchOptions(user).map(b => `<option value="${b.id}" ${String(Auth.viewBranchId()) === String(b.id) ? 'selected' : ''}>${UI.escapeHtml(b.branch_name)}</option>`).join('')}
              </select>` : ''}
              <span class="avatar">${initials}</span>
              <span>${UI.escapeHtml(user.full_name)}</span>
              <button class="btn btn-outline btn-sm" id="logoutBtn" style="margin-left:6px;">Logout</button>
            </div>
          </header>
          <main class="content" id="content"></main>
        </div>
      </div>
    `;

    document.getElementById('menuToggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
      Auth.logout();
      window.location.hash = '#/login';
    });

    const ownerFilter = document.getElementById('ownerClientFilter');
    if (ownerFilter) {
      ownerFilter.addEventListener('change', (e) => {
        if (e.target.value) sessionStorage.setItem('ownerClientFilter', e.target.value);
        else sessionStorage.removeItem('ownerClientFilter');
        sessionStorage.removeItem('viewBranchFilter');
        Router.resolve();
      });
    }

    const branchFilter = document.getElementById('viewBranchFilter');
    if (branchFilter) {
      branchFilter.addEventListener('change', (e) => {
        if (e.target.value) sessionStorage.setItem('viewBranchFilter', e.target.value);
        else sessionStorage.removeItem('viewBranchFilter');
        Router.resolve();
      });
    }
  },

  renderPublicShell() {
    const root = document.getElementById('root');
    root.innerHTML = `
      <div class="app-shell app-shell-public">
        <div class="main-area" id="mainArea">
          <header class="topbar">
            <div class="topbar-left">
              <div>
                <div class="sidebar-brand" style="margin-bottom:4px;">
                  <span class="badge-dot"></span>
                  VDW Compliance Control
                </div>
                <div class="page-title" id="pageTitle">Inspection</div>
                <div class="page-subtitle" id="pageSubtitle"></div>
              </div>
            </div>
          </header>
          <main class="content" id="content"></main>
        </div>
      </div>
    `;
  },

  setTitle(title, subtitle = '') {
    const t = document.getElementById('pageTitle');
    const s = document.getElementById('pageSubtitle');
    if (t) t.textContent = title;
    if (s) s.textContent = subtitle;
    document.title = title + ' | VDW Compliance Control System';
  },

  renderContent(html) {
    const content = document.getElementById('content');
    if (content) content.innerHTML = html;
    // close mobile sidebar on navigation
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
    window.scrollTo(0, 0);
  }
};

window.App = App;

document.addEventListener('DOMContentLoaded', () => {
  DB.load();
  Automations.runDailyChecks();
  Router.init();
});
