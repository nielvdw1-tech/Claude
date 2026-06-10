// VDW Compliance Control System - Hash Router

const Router = {
  routes: [],

  add(pattern, view, options = {}) {
    this.routes.push({ pattern, view, options });
  },

  match(path) {
    const pathParts = path.split('/').filter(Boolean);
    for (const route of this.routes) {
      const patternParts = route.pattern.split('/').filter(Boolean);
      if (patternParts.length !== pathParts.length) continue;
      const params = {};
      let ok = true;
      for (let i = 0; i < patternParts.length; i++) {
        const p = patternParts[i];
        if (p.startsWith(':')) {
          params[p.slice(1)] = pathParts[i];
        } else if (p !== pathParts[i]) {
          ok = false;
          break;
        }
      }
      if (ok) return { route, params };
    }
    return null;
  },

  currentPath() {
    const hash = window.location.hash || '#/dashboard';
    return hash.replace(/^#\/?/, '');
  },

  resolve() {
    const path = this.currentPath() || 'dashboard';
    const result = this.match(path);

    const user = Auth.currentUser();
    const isPublic = !!(result && result.route.options.public);

    if (path !== 'login' && !user && !isPublic) {
      window.location.hash = '#/login';
      return;
    }
    if (path === 'login' && user) {
      window.location.hash = '#/dashboard';
      return;
    }

    if (!result) {
      App.renderShell();
      App.renderContent('<div class="card empty-state"><div class="icon">404</div><h2>Page not found</h2><p>The page you requested does not exist.</p></div>');
      return;
    }

    const { route, params } = result;

    if (route.options.roles && user && !route.options.roles.includes(user.role)) {
      App.renderShell();
      App.renderContent('<div class="card empty-state"><div class="icon">&#128274;</div><h2>Access Restricted</h2><p>Your role does not have permission to view this page.</p></div>');
      return;
    }

    if (path === 'login') {
      Views.login();
      return;
    }

    if (!user && isPublic) {
      App.renderPublicShell();
    } else {
      App.renderShell();
    }
    route.view(params);
  },

  init() {
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
  }
};

window.Router = Router;
