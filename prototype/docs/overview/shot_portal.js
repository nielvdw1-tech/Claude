// The contractor's upload page on a phone (fictional demonstration data).
const { chromium } = require('playwright');
const APP = 'file://' + require('path').resolve(__dirname, '../../index.html');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }); const c = await ctx.newPage();
  await c.goto(APP); await c.waitForTimeout(800);
  await c.evaluate(() => { const x = byId('contractors', 'CON-003'); x.portal = { token: 'cpoverview', created: TODAY, by: 'P-002', expires: addDays(TODAY, 30), active: true }; S.ui.user = null; save(); });
  await c.goto(APP + '#/cportal/cpoverview'); await c.reload(); await c.waitForTimeout(900);
  await c.addStyleTag({ content: '.demo-ribbon{display:none!important}' }); await c.waitForTimeout(100);
  await c.screenshot({ path: __dirname + '/img/phone_contractor.png' });
  await b.close(); console.log('ok');
})();
