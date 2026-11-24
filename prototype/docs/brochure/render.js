const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + __dirname + '/brochure.html'); await p.waitForTimeout(800);
  await p.pdf({ path: __dirname + '/VDW_Compliance_Control_System_Overview.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close(); })();
