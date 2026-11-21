/* ==========================================================================
   Install the app on the phone's home screen
   - The app has a manifest (name, icon, colours) and a service worker that
     keeps it working without signal once opened.
   - Employees see an "Install the app" card on their home screen until it is
     installed (or they close it). On Android/Chrome the button installs
     straight away; on an iPhone the card shows the two taps needed in Safari.
   - Also offered from the person's menu ("Install the app").
   ========================================================================== */
'use strict';

let INSTALL_EVT = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); INSTALL_EVT = e; if (typeof rerender === 'function' && S && S.ui && S.ui.user) rerender(); });
window.addEventListener('appinstalled', () => { INSTALL_EVT = null; toast('The app is installed — find "VDW Safety" on your home screen.'); });
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) { window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { /* not allowed here (e.g. inside a preview frame) */ }); }); }

const isStandalone = () => (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const installHidden = () => { try { return localStorage.getItem('vdw-install-hide') === '1'; } catch (e) { return false; } };
function installCardHtml() {
  if (isStandalone() || installHidden()) return '';
  return `<section class="emp-card install-card"><div class="ic-icon"><img src="icons/icon-192.png" alt=""></div><div class="ic-txt"><b>Install the app on your phone</b><small>Open it from your home screen like any other app — it also works without signal once opened.</small></div>
    <div class="ic-btns"><button class="btn sm primary" data-act="installApp">Install</button><button class="btn sm ghost" data-act="installHide" aria-label="Not now">Not now</button></div></section>`;
}
ACT.installApp = async () => {
  if (INSTALL_EVT) { INSTALL_EVT.prompt(); const r = await INSTALL_EVT.userChoice.catch(() => ({})); INSTALL_EVT = null; if (r && r.outcome === 'accepted') toast('Installing…'); return; }
  openModal({ title: 'Install the app', sub: 'Put "VDW Safety" on your phone\'s home screen.', body: `<div class="install-steps">
      <div><h3>iPhone (Safari)</h3><ol><li>Open this page in <b>Safari</b>.</li><li>Tap the <b>Share</b> button (the square with an arrow pointing up).</li><li>Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b>.</li></ol></div>
      <div><h3>Android (Chrome)</h3><ol><li>Open this page in <b>Chrome</b>.</li><li>Tap the <b>⋮</b> menu at the top right.</li><li>Tap <b>Install app</b> (or <b>Add to Home screen</b>), then <b>Install</b>.</li></ol></div></div>
    <p class="muted" style="font-size:12.5px">The app opens full screen from its icon and keeps working without signal once opened. ${isIOS() ? 'You are on an iPhone or iPad: use the Safari steps.' : ''}</p>`, buttons: [{ label: 'Done', cls: 'primary', onClick: () => {} }] });
};
ACT.installHide = () => { try { localStorage.setItem('vdw-install-hide', '1'); } catch (e) { /* storage blocked */ } rerender(); };
const _fieldBeforeInstall = ROUTES.field;
ROUTES.field = (p, q) => { const r = _fieldBeforeInstall(p, q); if (r && r.html) { const c = installCardHtml(); if (c) r.html = r.html.replace('<h3 class="emp-h">', c + '<h3 class="emp-h">'); } return r; };
const _userMenuBeforeInstall = ACT.userMenu;
ACT.userMenu = (el) => { _userMenuBeforeInstall(el); setTimeout(() => { const d = document.querySelector('.dropdown'); if (d && !isStandalone() && !d.querySelector('[data-act=installApp]')) d.insertAdjacentHTML('beforeend', `<button class="dd-item install-dd" data-act="installApp">${icon('download', 'sm')} Install the app on this device</button>`); }, 0); };
