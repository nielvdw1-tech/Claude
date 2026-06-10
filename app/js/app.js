// VDW Compliance Control System - App Shell & Bootstrap

const App = {
  navItems: [
    { path: 'dashboard', label: 'Dashboard', icon: '&#128202;', roles: ['Admin', 'Manager', 'Inspector'] },
    { path: 'assets', label: 'Assets', icon: '&#127981;', roles: ['Admin', 'Manager', 'Inspector'] },
    { path: 'inspections', label: 'Inspection History', icon: '&#128203;', roles: ['Admin', 'Manager', 'Inspector'] },
    { path: 'cars', label: 'Corrective Actions', icon: '&#9888;', roles: ['Admin', 'Manager', 'Inspector'] },
    { path: 'documents', label: 'Documents', icon: '&#128193;', roles: ['Admin', 'Manager', 'Inspector'] },
    { path: 'reports', label: 'Reports', icon: '&#128200;', roles: ['Admin', 'Manager'] },
    { section: 'Administration' },
    { path: 'clients', label: 'Clients', icon: '&#127970;', roles: ['Admin'] },
    { path: 'branches', label: 'Branches / Sites', icon: '&#128205;', roles: ['Admin', 'Manager'] },
    { path: 'users', label: 'User Management', icon: '&#128100;', roles: ['Admin'] },
    { path: 'settings', label: 'Settings', icon: '&#9881;', roles: ['Admin'] }
  ],

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
      return `<a href="#/${item.path}" class="${active}"><span aria-hidden="true">${item.icon}</span> ${item.label}</a>`;
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
