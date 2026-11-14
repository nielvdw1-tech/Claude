// Layout check: opens every prototype page at 20 screen widths (320px to 2560px) and reports
// sideways scrolling, elements past the screen edge, clipped text and header overlaps.
// Run from the prototype folder: node tools/check_layout.js "$PWD"
const { chromium } = require('playwright');
const DIR = process.argv[2];
const pages = ['index.html','gap-audit.html','safety-file.html','compliance-management.html','free-assessment.html','assessment.html'];
const widths = [320,360,375,390,414,480,600,768,820,900,960,1024,1100,1180,1280,1366,1440,1600,1920,2560];
(async () => {
  const b = await chromium.launch();
  const issues = {};
  for (const f of pages) for (const w of widths) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto('file://' + DIR + '/' + f); await p.waitForTimeout(250);
    const r = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth, out = [];
      if (document.documentElement.scrollWidth > vw) out.push('page scrolls sideways: ' + document.documentElement.scrollWidth);
      const label = e => (e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0,2).join('.') : '') + ' "' + (e.innerText || e.alt || '').trim().slice(0, 30) + '"');
      document.querySelectorAll('body *').forEach(e => {
        const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return;
        if (e.closest('[hidden]') || e.classList.contains('skip-link') || e.closest('.whatsapp-float')) return;
        const rc = e.getBoundingClientRect(); if (!rc.width) return;
        if (cs.position !== 'fixed' && (rc.right > vw + 1 || rc.left < -1)) {
          // ignore children of an element already reported
          out.push('past edge: ' + label(e) + ' L' + Math.round(rc.left) + ' R' + Math.round(rc.right));
        }
        if (['A','BUTTON','H1','H2','H3','H4','P','SPAN','LI','B','LABEL','LEGEND'].includes(e.tagName) && e.scrollWidth > e.clientWidth + 2 && cs.overflow !== 'visible' ) out.push('clipped text: ' + label(e));
        if ((e.tagName === 'A' || e.tagName === 'BUTTON') && e.classList.contains('btn') && e.scrollWidth > e.clientWidth + 2) out.push('button text overflows: ' + label(e));
      });
      // header crowding: elements in header overlapping each other
      const hdr = [...document.querySelectorAll('.header-inner > *, .header-actions > *, .main-nav li')].filter(e => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width);
      for (let i = 0; i < hdr.length; i++) for (let j = i + 1; j < hdr.length; j++) {
        const a = hdr[i].getBoundingClientRect(), c = hdr[j].getBoundingClientRect();
        if (hdr[i].contains(hdr[j]) || hdr[j].contains(hdr[i])) continue;
        if (a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1) out.push('header overlap: ' + label(hdr[i]) + ' / ' + label(hdr[j]));
      }
      const h = document.querySelector('.site-header').getBoundingClientRect().height;
      if (h > 110) out.push('header too tall: ' + Math.round(h) + 'px');
      return out;
    });
    if (r.length) issues[f + ' @' + w] = [...new Set(r)].slice(0, 8);
    await p.close();
  }
  for (const k in issues) { console.log('\n' + k); issues[k].forEach(x => console.log('  - ' + x)); }
  console.log('\nchecked', pages.length * widths.length, 'page/width combinations;', Object.keys(issues).length, 'with issues');
  await b.close();
})();
