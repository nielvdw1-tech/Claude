// Retakes the free check result screenshots at double resolution, using example answers.
// Run from the prototype folder: node tools/take_check_screenshots.js "$PWD" <output-folder>
const { chromium } = require('playwright');
const DIR = process.argv[2], OUT = process.argv[3];
// Example answers: a realistic "Moderate Risk" company with gaps in every area
const A = { S1:'yes',S2:'no',S3:'yes',S4:'no',S5:'yes', 1:'yes',2:'no',3:'yes',4:'no',5:'yes',6:'yes',7:'na',
            8:'yes',9:'no',10:'yes',11:'no', 12:'yes',13:'no',14:'yes',15:'no', 16:'yes',17:'no',18:'yes' };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 760, height: 1000 }, deviceScaleFactor: 2 });
  await p.goto('file://' + DIR + '/assessment.html');
  await p.addStyleTag({ content: '.whatsapp-float{display:none!important}' });
  await p.selectOption('#branches', { index: 3 }); await p.selectOption('#employees', { index: 4 }); await p.selectOption('#industry', { index: 1 });
  await p.click('label.choice:has(input[value=Regularly])'); await p.click('#companyForm button[type=submit]');
  for (let s = 0; s < 5; s++) {
    const step = p.locator('[data-step^=section-]:visible');
    const qs = step.locator('fieldset.question'); const n = await qs.count();
    for (let i = 0; i < n; i++) { const id = (await qs.nth(i).getAttribute('id')).slice(2); await qs.nth(i).locator('label.choice-' + A[id]).click(); }
    await step.locator('button[type=submit]').click(); await p.waitForTimeout(150);
  }
  await p.fill('#fullName', 'Example Person'); await p.fill('#company', 'Example Supplies (Pty) Ltd');
  await p.fill('#phone', '0000000000'); await p.fill('#email', 'example@example.com');
  await p.click('label.consent'); await p.click('#contactForm button[type=submit]'); await p.waitForTimeout(800);
  console.log('score', await p.textContent('#scoreNum'), await p.textContent('#resultsTitle'), '|', await p.textContent('#gapsTitle'));
  const box = async sel => (await p.locator(sel).first().boundingBox());
  const union = (a, c) => ({ x: Math.min(a.x, c.x), y: Math.min(a.y, c.y), width: Math.max(a.x + a.width, c.x + c.width) - Math.min(a.x, c.x), height: Math.max(a.y + a.height, c.y + c.height) - Math.min(a.y, c.y) });
  const pad = (r, n = 12) => ({ x: r.x - n, y: r.y - n, width: r.width + 2 * n, height: r.height + 2 * n });
  const shot = async (name, rect) => { await p.screenshot({ path: OUT + '/' + name + '.png', clip: pad(rect), fullPage: true }); console.log('saved', name, Math.round(rect.width) + 'x' + Math.round(rect.height)); };
  // 1. Score summary: score card, sub-scores and area bars
  await shot('check-score', union(await box('.results-head'), await box('.card:has(#sectionBars)')));
  // Gap list sections
  const card = await box('.card:has(#gapList)');
  const groups = p.locator('#gapList .gap-group'); const g = await groups.count();
  const gb = []; for (let i = 0; i < g; i++) gb.push(await groups.nth(i).boundingBox());
  const gapsTitle = await box('#gapsTitle');
  // 2. Audit-readiness and legal gaps: from the gap list title to the end of the legal group
  await shot('check-gaps-legal', { x: card.x, y: card.y, width: card.width, height: gb[2].y - card.y - 8 });
  // 3. Training and first-aid gaps
  await shot('check-gaps-training', { x: card.x, y: gb[2].y - 20, width: card.width, height: gb[4].y - gb[2].y });
  // 4. Equipment and incident gaps, to the end of the card
  await shot('check-gaps-incidents', { x: card.x, y: gb[4].y - 20, width: card.width, height: card.y + card.height - gb[4].y + 20 });
  await b.close();
})();
