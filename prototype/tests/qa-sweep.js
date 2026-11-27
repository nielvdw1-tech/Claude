// QA sweep: every role, desktop and phone width, every menu page and its tabs.
// Reports JavaScript errors, error pages, pages wider than the screen, and buttons
// that stick out of their card. Run from the prototype folder:  node tests/qa-sweep.js
const { chromium } = require('playwright');
const path = require('path');
const APP = 'file://' + path.resolve(__dirname, '..', 'index.html');
const ROLES = ['System Administrator', 'Managing Director', 'HSEQ Manager', 'Safety Consultant', 'Branch Manager', 'Supervisor', 'Employee'];
(async () => {
  const b = await chromium.launch(), findings = [];
  for (const vw of [1366, 390]) {
    const p = await b.newPage({ viewport: { width: vw, height: 900 } }); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|ERR_FILE_NOT_FOUND/.test(m.text())) errs.push(m.text()); });
    await p.goto(APP); await p.waitForFunction(() => typeof S !== 'undefined' && S && document.querySelector('#content'));
    for (const role of ROLES) {
      const uid = await p.evaluate(r => { const u = S.people.find(x => x.sysRole === r && x.status !== 'Deactivated' && x.org === 'ORG-1'); return u && u.id; }, role);
      if (!uid) continue;
      await p.evaluate(u => { S.ui.user = u; S.ui.org = 'ORG-1'; S.ui.site = 'ALL'; save(); location.hash = '#/dashboard'; rerender(); }, uid); await p.waitForTimeout(250);
      const menu = await p.evaluate(() => [...new Set([...document.querySelectorAll('#sidebar a[href^="#/"], .emp-grid a[href^="#/"], .bottom-nav a[href^="#/"]')].map(a => a.getAttribute('href')))]);
      const seen = new Set(), queue = menu.slice(); let n = 0;
      while (queue.length && n < 220) { const h = queue.shift(); if (seen.has(h)) continue; seen.add(h); n++;
        errs.length = 0;
        await p.evaluate(h => { location.hash = h; }, h); await p.waitForTimeout(120);
        const r = await p.evaluate(() => { const vw = innerWidth, out = { wide: document.documentElement.scrollWidth > vw + 1, broken: /Something went wrong rendering this page/.test(document.body.innerText), sticking: [] };
          document.querySelectorAll('#content .card .btn').forEach(bt => { const c = bt.closest('.card'), a = bt.getBoundingClientRect(), z = c.getBoundingClientRect();
            // a button inside an area that scrolls sideways on purpose (tables, calendars) is not sticking out
            for (let el = bt.parentElement; el && el !== c; el = el.parentElement) { const ox = getComputedStyle(el).overflowX; if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') return; }
            if (a.width && (a.right > z.right + 1 || a.left < z.left - 1)) out.sticking.push((bt.textContent || '').trim().slice(0, 30)); });
          out.tabs = [...document.querySelectorAll('#content .tabs a[href^="#/"], #content .adm-areas a[href^="#/"], #content .adm-pages a[href^="#/"]')].map(a => a.getAttribute('href')); return out; });
        const add = (kind, d) => findings.push([role, vw, h, kind, d].join(' \t '));
        if (errs.length) add('script error', errs[0].slice(0, 160));
        if (r.broken) add('error page', '');
        if (r.wide) add('wider than screen', '');
        if (r.sticking.length) add('button outside its card', r.sticking.slice(0, 3).join(', '));
        r.tabs.forEach(t => { if (!seen.has(t)) queue.push(t); });
      }
      console.log(`${role} ${vw} — pages visited ${n}`);
    }
    await p.close();
  }
  require('fs').writeFileSync(path.join(__dirname, 'qa-sweep-findings.txt'), findings.join('\n'));
  console.log(findings.length + ' findings'); findings.slice(0, 15).forEach(f => console.log('  ' + f));
  await b.close();
})();
