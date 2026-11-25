// Screenshots for the product overview (fictional demonstration data).
// Run: node shots.js  (from this folder)
const { chromium } = require('playwright');
const APP = 'file://' + require('path').resolve(__dirname, '../../index.html');
(async () => {
  const b = await chromium.launch();
  const login = async (p, email) => {
    await p.goto(APP); await p.evaluate(() => localStorage.clear()); await p.goto(APP); await p.waitForTimeout(500);
    await p.fill('#signinForm [name=email]', email); await p.fill('#signinForm [name=password]', 'demo1234'); await p.click('#signinForm button[type=submit]'); await p.waitForTimeout(700);
    await p.addStyleTag({ content: '.demo-ribbon{display:none!important} .toast,.toasts,#toasts{display:none!important} .fab-stack{display:none!important}' });
  };
  const go = async (p, h, y) => { await p.evaluate(h => { location.hash = h; }, h); await p.waitForTimeout(600); if (y) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(200); } await p.mouse.move(5, 890); await p.waitForTimeout(150); };
  const shot = (p, name, clip) => p.screenshot(Object.assign({ path: __dirname + '/img/' + name + '.png' }, clip ? { clip } : {}));
  require('fs').mkdirSync(__dirname + '/img', { recursive: true });

  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await login(p, 'johan.vw@kestrel.demo');
  await go(p, '#/dashboard'); await shot(p, 'dashboard');
  await go(p, '#/legal/library'); await shot(p, 'library');
  await go(p, '#/legal/lib/LT-GSR'); await shot(p, 'regulation');
  await go(p, '#/legal/LR-001'); await shot(p, 'requirement');
  await go(p, '#/compliance'); await shot(p, 'calendar');
  await go(p, '#/documents/DOC-001'); await shot(p, 'document');
  await go(p, '#/attendance/doc/DOC-001'); await shot(p, 'attendance');
  await go(p, '#/risk/RA-001'); await shot(p, 'risk');
  await go(p, '#/risk/RA-004/view', 120); await shot(p, 'riskview');
  await go(p, '#/assets'); await shot(p, 'assets');
  await go(p, '#/actions'); await shot(p, 'actions');
  await go(p, '#/incidents'); await shot(p, 'incidents');
  await go(p, '#/audits'); await shot(p, 'audits');
  await go(p, '#/contractors/CON-003'); await shot(p, 'contractor');
  await go(p, '#/training'); await shot(p, 'training');
  await go(p, '#/reports/overall'); await shot(p, 'reports');

  // the hazard form (one form, in the order of the assessment)
  await go(p, '#/risk/assessments'); await p.evaluate(() => { const a = (S.riskAssessments || []).find(x => x.status === 'Draft') || S.riskAssessments[0]; location.hash = '#/risk/' + a.id; }); await p.waitForTimeout(500);
  await p.evaluate(() => { const id = location.hash.split('/')[2]; ACT.raRow({ dataset: { id } }); }); await p.waitForTimeout(400);
  await p.evaluate(() => { const m = document.querySelector('.modal'); const set = (n, v) => { const e = m.querySelector(`[name=${n}]`); if (e) { e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); } };
    set('title', 'Reversing delivery trucks'); set('risk', 'Truck reverses into a person in the yard'); set('consequences', 'Crushing injuries, fatality'); set('il', '4'); set('is', '5');
    set('cc_0', 'Engineering controls'); set('cd_0', 'Reversing cameras and alarms on all trucks'); set('rl', '2'); set('rs', '5'); });
  await p.waitForTimeout(200); await shot(p, 'hazardform');
  await p.keyboard.press('Escape');

  // the contractor's upload page
  const tok = await p.evaluate(() => { const c = byId('contractors', 'CON-003'); c.portal = { token: 'cpoverview', created: TODAY, by: 'P-002', expires: addDays(TODAY, 30), active: true }; save(); return c.portal.token; });

  // phones
  const ph = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
  const m = await b.newPage(ph);
  await login(m, 'nomvula.s@kestrel.demo'); await go(m, '#/field'); await shot(m, 'phone_home');
  await go(m, '#/mytalks'); await shot(m, 'phone_talks');
  await go(m, '#/qr/' + (await m.evaluate(() => S.assets[0].id))); await shot(m, 'phone_qr');
  const state = await p.evaluate(() => localStorage.getItem('vdw-hseq-prototype-v16'));
  const c = await b.newPage(ph); await c.goto(APP); await c.evaluate(s => { localStorage.setItem('vdw-hseq-prototype-v16', s); const S2 = JSON.parse(s); S2.ui.user = null; localStorage.setItem('vdw-hseq-prototype-v16', JSON.stringify(S2)); }, state);
  await c.goto(APP + '#/cportal/' + tok); await c.waitForTimeout(800); await c.addStyleTag({ content: '.demo-ribbon{display:none!important}' }); await shot(c, 'phone_contractor');
  await b.close(); console.log('done');
})();
