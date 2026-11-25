// Renders overview.html to the PDF product overview. Run: node render.js (from this folder)
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + __dirname + '/overview.html'); await p.waitForTimeout(1200);
  await p.pdf({ path: __dirname + '/../VDW_Compliance_Control_System_Product_Overview.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close(); console.log('ok'); })();
