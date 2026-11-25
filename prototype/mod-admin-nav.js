/* ==========================================================================
   Administration: navigation at the top, the chosen page below it
   --------------------------------------------------------------------------
   The administration pages are grouped in areas. The top of every
   administration page has one navigation bar:
     row 1: the areas (Company and people, Documents and approvals, …)
     row 2: the pages of the area you are in
   Below the bar comes the name of the page you are on, then its content.
   Loaded last: it rebuilds the grouped tabs the earlier modules made.
   ========================================================================== */
'use strict';

// The end of the element that starts at index i (matching <div …> / </div>)
function divEnd(html, i) { const re = /<div\b|<\/div>/g; re.lastIndex = i; let depth = 0, m; while ((m = re.exec(html))) { depth += m[0] === '</div>' ? -1 : 1; if (!depth) return re.lastIndex; } return -1; }

const _adminBeforeNav = ROUTES.admin;
ROUTES.admin = (p, q) => { const r = _adminBeforeNav(p, q); if (!r || !r.html) return r;
  const i = r.html.indexOf('<div class="adm-nav">'); if (i < 0) return r; const j = divEnd(r.html, i); if (j < 0) return r;
  const nav = r.html.slice(i, j); let html = r.html.slice(0, i) + r.html.slice(j);
  // the areas and their pages, as the earlier modules grouped them
  const groups = []; nav.replace(/<div class="adm-grp"><span>([^<]*)<\/span><div class="tabs adm-tabs" role="tablist">([\s\S]*?)<\/div><\/div>/g, (m, label, tabs) => {
    const pages = []; tabs.replace(/<a role="tab" href="#\/admin\/([\w-]+)"[^>]*>([\s\S]*?)<\/a>/g, (a, k, t) => { pages.push({ k, t: t.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim() }); return a; });
    if (pages.length) groups.push({ label: label.replace(/&amp;/g, '&'), pages }); return m; });
  if (!groups.length) return r;
  const cur = p[0] || 'orgs', g = groups.find(x => x.pages.some(y => y.k === cur)) || groups[0], page = g.pages.find(y => y.k === cur);
  const bar = `<nav class="adm-bar" aria-label="Administration">
    <div class="adm-areas" role="tablist">${groups.map(x => `<a role="tab" href="#/admin/${x === g ? cur : x.pages[0].k}" class="${x === g ? 'active' : ''}" aria-selected="${x === g}">${esc(x.label)}<span class="adm-n">${x.pages.length}</span></a>`).join('')}</div>
    <div class="adm-pages" role="tablist" aria-label="${esc(g.label)}">${g.pages.map(y => `<a role="tab" href="#/admin/${y.k}" class="${y.k === cur ? 'active' : ''}" aria-selected="${y.k === cur}">${esc(y.t)}</a>`).join('')}</div>
  </nav>${page ? `<div class="adm-here"><span>${esc(g.label)}</span><h2>${esc(page.t)}</h2></div>` : ''}`;
  // straight after the page heading: navigation first, then whatever page is chosen
  const h = html.indexOf('<div class="page-head">'), he = h > -1 ? divEnd(html, h) : -1;
  r.html = he > -1 ? html.slice(0, he) + bar + html.slice(he) : bar + html;
  return r; };
