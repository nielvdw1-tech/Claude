// Close-ups of parts of screens for the product overview (fictional demonstration data).
const { chromium } = require('playwright');
const APP = 'file://' + require('path').resolve(__dirname, '../../index.html');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  await p.goto(APP); await p.evaluate(() => localStorage.clear()); await p.goto(APP); await p.waitForTimeout(500);
  await p.fill('#signinForm [name=email]', 'johan.vw@kestrel.demo'); await p.fill('#signinForm [name=password]', 'demo1234'); await p.click('#signinForm button[type=submit]'); await p.waitForTimeout(700);
  await p.addStyleTag({ content: '.demo-ribbon{display:none!important} .toast,.toasts,#toasts{display:none!important} .fab-stack{display:none!important}' });
  const go = async h => { await p.evaluate(h => { location.hash = h; }, h); await p.waitForTimeout(600); await p.mouse.move(5, 890); };
  const el = async (sel, name, pad = 0) => { const e = await p.$(sel); if (!e) { console.log('missing', sel); return; } await e.scrollIntoViewIfNeeded(); const bb = await e.boundingBox(); await p.screenshot({ path: __dirname + '/img/' + name + '.png', clip: { x: bb.x - pad, y: bb.y - pad, width: bb.width + 2 * pad, height: bb.height + 2 * pad } }); };
  const region = async (selA, selB, name) => { const a = await (await p.$(selA)).boundingBox(), z = await (await p.$(selB)).boundingBox(); const x = Math.min(a.x, z.x) - 8, y = a.y - 8; await p.screenshot({ path: __dirname + '/img/' + name + '.png', fullPage: true, clip: { x, y: y + await p.evaluate(() => scrollY), width: Math.max(a.x + a.width, z.x + z.width) - x + 8, height: z.y + z.height - y + 8 } }); };

  // live evidence on a requirement, with a gap
  const lr = await p.evaluate(() => (S.legalReqs.find(r => r.org === S.ui.org && lkGaps(r).length && lkLinked(r).length) || S.legalReqs[0]).id); console.log('LR', lr);
  await go('#/legal/' + lr); await el('.lk-card', 'x_evidence', 6); await el('.lk-gap', 'x_gap', 4);
  // risk assessment steps
  await go('#/risk/RA-001'); await p.evaluate(() => scrollTo(0, 0)); await region('.ra-steps', '.ra-next', 'x_rasteps');
  await el('.ra-row', 'x_rarow', 4);
  // attendance register
  await go('#/attendance/doc/DOC-001'); await el('.att-reg', 'x_attendance', 2);
  // document approval route and read & sign
  await go('#/documents/DOC-001'); await el('#ackCard', 'x_ackcard', 4);
  // contractor status
  await go('#/contractors/CON-003'); await region('.status-hero', '.detail .card', 'x_contractor');
  // dashboard compliance status
  await go('#/dashboard'); await el('.cs-grid', 'x_score', 6);
  // legal library list
  await go('#/legal/library'); await p.evaluate(() => scrollTo(0, 0));
  await b.close(); console.log('ok');
})();
