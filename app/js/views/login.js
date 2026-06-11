// View: Login
(function () {

Views.login = function () {
  const root = document.getElementById('root');
  document.title = 'Login | VDW Compliance Control System';

  root.innerHTML = `
    <div class="login-page">
      <div class="login-card">
        <h1>VDW Compliance Control</h1>
        <div class="subtitle">Sign in to manage inspections, assets &amp; corrective actions</div>
        <div id="loginError"></div>
        <form id="loginForm">
          <div class="form-group">
            <label for="email">Email address</label>
            <input class="form-control" type="email" id="email" required autocomplete="username">
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input class="form-control" type="password" id="password" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn btn-primary btn-lg">Sign In</button>
        </form>
        <div class="demo-creds">
          <strong>Demo accounts</strong> (password shown):<br>
          Owner &mdash; admin@vdwsafety.com / admin123<br>
          Manager &mdash; sarah.manager@vdwsafety.com / manager123
        </div>
      </div>
    </div>
  `;

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const user = Auth.login(email, password);
    if (user) {
      window.location.hash = '#/dashboard';
    } else {
      document.getElementById('loginError').innerHTML = '<div class="error-banner">Invalid email or password. Please try again.</div>';
    }
  });
};

Router.add('login', Views.login);
})();
