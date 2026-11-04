/* ==========================================================================
   Bulk import from Excel (.xlsx) or CSV
   --------------------------------------------------------------------------
   Load assets, people, inspection schedules and an existing document
   register from a spreadsheet. Columns are matched by their heading; every
   row is checked and shown in a preview before anything is saved. Rows with
   errors are skipped; rows that already exist are not duplicated.
   Excel files are read in the browser (unzip + XML) — no add-on library.
   ========================================================================== */
'use strict';

/* ---------------- Reading files ---------------- */
function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const first = text.split(/\r?\n/)[0] || '', delim = ['\t', ';', ','].map(d => [d, first.split(d).length]).sort((a, b) => b[1] - a[1])[0][0];
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === delim) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
// Minimal .xlsx reader: first worksheet → rows of text
async function readXlsx(file) {
  const buf = new Uint8Array(await file.arrayBuffer()), dv = new DataView(buf.buffer), td = new TextDecoder();
  let eocd = -1; for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('This file is not a valid .xlsx workbook.');
  const files = {}; let off = dv.getUint32(eocd + 16, true);
  for (let k = 0, n = dv.getUint16(eocd + 10, true); k < n; k++) {
    const nlen = dv.getUint16(off + 28, true), xlen = dv.getUint16(off + 30, true), clen = dv.getUint16(off + 32, true);
    files[td.decode(buf.subarray(off + 46, off + 46 + nlen))] = { method: dv.getUint16(off + 10, true), csize: dv.getUint32(off + 20, true), lho: dv.getUint32(off + 42, true) };
    off += 46 + nlen + xlen + clen;
  }
  const get = async (name) => {
    const f = files[name]; if (!f) return null;
    const start = f.lho + 30 + dv.getUint16(f.lho + 26, true) + dv.getUint16(f.lho + 28, true), data = buf.subarray(start, start + f.csize);
    if (f.method === 0) return td.decode(data);
    if (typeof DecompressionStream === 'undefined') throw new Error('This browser cannot open .xlsx files. Save the sheet as CSV and import that.');
    return td.decode(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
  };
  const xml = (s) => new DOMParser().parseFromString(s, 'application/xml');
  const wb = xml(await get('xl/workbook.xml')), rels = xml(await get('xl/_rels/workbook.xml.rels'));
  const sheet = wb.getElementsByTagName('sheet')[0]; if (!sheet) throw new Error('The workbook has no worksheet.');
  const rid = sheet.getAttribute('r:id') || sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
  const rel = [...rels.getElementsByTagName('Relationship')].find(r => r.getAttribute('Id') === rid);
  let target = rel ? rel.getAttribute('Target') : 'worksheets/sheet1.xml'; target = target.replace(/^\//, ''); if (!target.startsWith('xl/')) target = 'xl/' + target;
  const ssx = await get('xl/sharedStrings.xml'), shared = ssx ? [...xml(ssx).getElementsByTagName('si')].map(si => [...si.getElementsByTagName('t')].map(t => t.textContent).join('')) : [];
  const ws = xml(await get(target)), rows = [];
  const colIdx = (ref) => { let n = 0; for (const ch of ref.replace(/[0-9]/g, '')) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };
  [...ws.getElementsByTagName('row')].forEach(r => {
    const out = []; let auto = 0;
    [...r.getElementsByTagName('c')].forEach(c => {
      const ref = c.getAttribute('r'), i = ref ? colIdx(ref) : auto; auto = i + 1;
      const t = c.getAttribute('t'), v = c.getElementsByTagName('v')[0];
      out[i] = t === 's' ? (shared[+(v && v.textContent)] || '') : t === 'inlineStr' ? [...c.getElementsByTagName('t')].map(x => x.textContent).join('') : t === 'b' ? (v && v.textContent === '1' ? 'TRUE' : 'FALSE') : (v ? v.textContent : '');
    });
    rows[+(r.getAttribute('r') || rows.length + 1) - 1] = Array.from(out, x => x == null ? '' : String(x));
  });
  return Array.from(rows, r => r || []);
}
async function readSheet(file) {
  if (/\.xlsx$/i.test(file.name)) return readXlsx(file);
  if (/\.xls$/i.test(file.name)) throw new Error('Old .xls files are not supported. In Excel, use Save As → Excel Workbook (.xlsx) or CSV.');
  return parseCsv(await file.text());
}

/* ---------------- Lookups and value checks ---------------- */
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9@.]/g, '');
function findSite(v, allowAll) { const n = norm(v); if (allowAll && ['all', 'allsites', 'allbranches', 'organisationwide'].includes(n)) return 'ALL'; const s = orgSites().find(x => [x.id, x.short, x.name].some(k => norm(k) === n)); return s ? s.id : null; }
function findPersonRef(v) { const n = norm(v); if (!n) return null; const p = S.people.find(x => x.org === S.ui.org && x.status !== 'Deactivated' && (norm(x.email) === n || norm(x.name) === n)); return p ? p.id : null; }
function parseDateCell(v) {
  const s = String(v || '').trim(); if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  let m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/); if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;   // day/month/year
  if (/^\d{5}(\.\d+)?$/.test(s)) { const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(+s) * 86400000); return d.toISOString().slice(0, 10); }   // Excel date number
  return 'invalid';
}

/* ---------------- What can be imported ---------------- */
// cols: [key, heading, required, aliases]
const IMPORTS = {
  assets: {
    label: 'Assets', keyName: 'asset tag',
    cols: [['tag', 'Asset tag', true, ['tag']], ['name', 'Asset name', true, ['name', 'description']], ['type', 'Asset type', true, ['type']], ['site', 'Branch', true, ['site']], ['location', 'Location'], ['make', 'Make'], ['model', 'Model'], ['serial', 'Serial number', false, ['serial', 'serial no']], ['responsible', 'Responsible person', false, ['responsible']], ['year', 'Year']],
    example: ['FL-09', 'Electric forklift FL-09', 'Forklift / Lift truck', 'Germiston', 'Warehouse aisle 7', 'Toyota', '8FBE20', 'TY-1234', 'bongani.z@kestrel.demo', '2024'],
    check(r, seen) {
      const e = [], w = [], t = S.assetTypes.find(x => [x.id, x.name].some(k => norm(k) === norm(r.type))), site = findSite(r.site), resp = r.responsible ? findPersonRef(r.responsible) : null;
      if (r.tag && S.assets.some(x => norm(x.tag) === norm(r.tag))) return { skip: `Asset ${r.tag} already exists` };
      if (r.tag && seen.has(norm(r.tag))) e.push('Same tag appears twice in the file');
      if (r.type && !t) e.push(`Unknown asset type "${r.type}"`);
      if (r.site && !site) e.push(`Unknown branch "${r.site}"`);
      if (r.responsible && !resp) w.push(`"${r.responsible}" not found — no responsible person set`);
      if (r.year && !/^\d{4}$/.test(r.year)) w.push('Year ignored (use 4 digits)');
      return { e, w, rec: { tag: r.tag, name: r.name, type: t && t.id, site, location: r.location, make: r.make, model: r.model, serial: r.serial, responsible: resp || '', year: /^\d{4}$/.test(r.year) ? r.year : '' }, key: norm(r.tag) };
    },
    create(v) {
      const id = nextId('AS-', 'assets'), t = byId('assetTypes', v.type);
      S.assets.push({ id, tag: v.tag, name: v.name, type: v.type, make: v.make, model: v.model, serial: v.serial, site: v.site, org: siteOrgOf(v.site), location: v.location, responsible: v.responsible, status: 'In Service', year: v.year, custom: {}, certs: [], qr: 'VDW-QR-' + id, history: [{ ts: nowTs(), by: S.ui.user, text: 'Asset registered (bulk import)' }] });
      if (t && t.template) S.schedules.push({ id: nextId('ISCH-', 'schedules', 2), template: t.template, asset: id, site: v.site, target: v.tag, freqDays: t.inspDays, nextDue: TODAY, assignee: v.responsible });
    }
  },
  people: {
    label: 'People (users)', keyName: 'e-mail',
    cols: [['name', 'Full name', true, ['name']], ['email', 'E-mail', true, ['email', 'e-mail address', 'email address']], ['jobTitle', 'Job title', true, ['job title', 'position']], ['site', 'Branch', true, ['site']], ['sysRole', 'System role', false, ['role']], ['dept', 'Department', false, ['department']]],
    example: ['Sam Botha', 'sam.botha@company.co.za', 'Storeman', 'Germiston', 'Employee', 'Warehouse & Logistics'],
    check(r, seen) {
      const e = [], w = [], site = findSite(r.site), role = r.sysRole ? S.roles.find(x => norm(x.name) === norm(r.sysRole)) : S.roles.find(x => x.name === 'Employee');
      if (r.email && S.people.some(x => norm(x.email) === norm(r.email))) return { skip: `${r.email} already has an account` };
      if (r.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email.trim())) e.push('Not a valid e-mail address');
      if (r.email && seen.has(norm(r.email))) e.push('Same e-mail appears twice in the file');
      if (r.site && !site) e.push(`Unknown branch "${r.site}"`);
      if (!role) e.push(`Unknown system role "${r.sysRole}"`);
      if (!r.sysRole) w.push('No role given — set to Employee');
      if (r.dept && !S.departments.some(d => norm(d) === norm(r.dept))) w.push(`Department "${r.dept}" is not in the list — kept as written`);
      return { e, w, rec: { name: r.name.trim(), email: (r.email || '').trim(), jobTitle: r.jobTitle, site, sysRole: role && role.name, dept: r.dept }, key: norm(r.email) };
    },
    create(v, out) {
      const id = nextId('P-', 'people'), pw = tempPassword();
      S.people.push({ id, name: v.name, jobTitle: v.jobTitle, site: v.site, org: siteOrgOf(v.site), dept: v.dept, type: 'Employee', sysRole: v.sysRole, email: v.email, status: 'Active', started: TODAY, auth: { hash: passHash(id, pw), mustChange: true, failed: 0, lockedUntil: null, lastSignIn: null } });
      queueEmail([id], 'account', 'Your account for the HSEQ Management System', `${pname(S.ui.user)} created an account for you (${v.sysRole}, ${sname(v.site)}). Sign in with this e-mail address and the temporary password your administrator gives you; you will then choose your own password.`, '');
      out.passwords.push([v.name, v.email, pw]);
    }
  },
  schedules: {
    label: 'Inspection schedules', keyName: 'asset + template',
    cols: [['asset', 'Asset tag', true, ['tag', 'asset']], ['template', 'Checklist', true, ['template', 'checklist number', 'inspection template']], ['freq', 'Every (days)', true, ['frequency', 'frequency days', 'interval', 'every days']], ['due', 'Next due', true, ['next due date', 'due date', 'first due']], ['assignee', 'Inspector', false, ['assigned to', 'inspector']]],
    example: ['FL-09', 'KIE-FRM-031', '30', '2026-12-01', 'bongani.z@kestrel.demo'],
    check(r, seen) {
      const e = [], w = [], a = S.assets.find(x => norm(x.tag) === norm(r.asset) && (x.org || siteOrgOf(x.site)) === S.ui.org), t = S.templates.find(x => [x.id, x.docNumber, x.title].some(k => norm(k) === norm(r.template))), due = parseDateCell(r.due), who = r.assignee ? findPersonRef(r.assignee) : null;
      if (r.asset && !a) e.push(`No asset with tag "${r.asset}" — import the assets first`);
      if (r.template && !t) e.push(`Unknown checklist "${r.template}"`);
      if (r.freq && !(+r.freq >= 1)) e.push('Every (days) must be a number of days');
      if (due === 'invalid') e.push(`"${r.due}" is not a date (use 2026-12-01 or 01/12/2026)`);
      if (r.assignee && !who) w.push(`"${r.assignee}" not found — no inspector set`);
      const key = a && t ? a.id + '|' + t.id : '';
      if (key && S.schedules.some(x => x.asset === a.id && x.template === t.id)) return { skip: `${a.tag} already has this checklist scheduled` };
      if (key && seen.has(key)) e.push('Same asset and checklist appear twice in the file');
      return { e, w, rec: { asset: a && a.id, template: t && t.id, freq: +r.freq, due: due !== 'invalid' ? due : null, assignee: who || (a && a.responsible) || '' }, key };
    },
    create(v) { const a = byId('assets', v.asset); S.schedules.push({ id: nextId('ISCH-', 'schedules', 2), template: v.template, asset: a.id, site: a.site, target: a.tag, freqDays: v.freq, nextDue: v.due, assignee: v.assignee }); }
  },
  documents: {
    label: 'Document register', keyName: 'document number',
    cols: [['number', 'Document number', true, ['number', 'doc number', 'doc no']], ['title', 'Title', true, ['document title']], ['category', 'Category', true, ['type']], ['site', 'Applies to', false, ['branch', 'site']], ['owner', 'Document owner', false, ['owner']], ['rev', 'Revision', false, ['rev', 'revision number']], ['issued', 'Issue date', false, ['issued', 'effective date', 'date issued']], ['months', 'Review every (months)', false, ['review months', 'review period']], ['nextReview', 'Next review', false, ['next review date', 'review date']]],
    example: ['KIE-SWP-040', 'Working at Heights Safe Work Procedure', 'Safe Work Procedure', 'All', 'johan.vw@kestrel.demo', '2', '2025-03-01', '24', ''],
    check(r, seen) {
      const e = [], w = [], cat = S.config.docCategories.find(c => norm(c) === norm(r.category)), site = r.site ? findSite(r.site, true) : 'ALL', owner = r.owner ? findPersonRef(r.owner) : null, issued = parseDateCell(r.issued), nr = parseDateCell(r.nextReview);
      if (r.number && S.documents.some(d => norm(d.number) === norm(r.number))) return { skip: `${r.number} is already in the register` };
      if (r.number && seen.has(norm(r.number))) e.push('Same document number appears twice in the file');
      if (r.category && !cat) e.push(`Unknown category "${r.category}"`);
      if (r.site && !site) e.push(`Unknown branch "${r.site}" (use a branch name or "All")`);
      if (issued === 'invalid') e.push(`"${r.issued}" is not a date`);
      if (nr === 'invalid') e.push(`"${r.nextReview}" is not a date`);
      if (r.rev && !/^\d+$/.test(r.rev)) e.push('Revision must be a number');
      if (r.owner && !owner) w.push(`"${r.owner}" not found — owner left blank`);
      const months = +r.months > 0 ? +r.months : 24; if (!(+r.months > 0)) w.push('No review period — set to 24 months');
      w.push('The file itself is not imported — attach the current file to the document afterwards');
      const iss = issued && issued !== 'invalid' ? issued : TODAY;
      return { e, w, rec: { number: r.number.trim(), title: r.title, category: cat, site, owner: owner || '', rev: +r.rev || 1, issued: iss, months, nextReview: nr && nr !== 'invalid' ? nr : addMonths(iss, months) }, key: norm(r.number) };
    },
    create(v) {
      const id = nextId('DOC-', 'documents');
      S.documents.push({ id, number: v.number, title: v.title, category: v.category, type: 'Controlled document', org: S.ui.org, site: v.site, dept: '', owner: v.owner, reviewMonths: v.months, nextReview: v.nextReview, access: 'Internal', related: [],
        revisions: [{ rev: v.rev, draft: 0, status: 'Issued for Use', date: v.issued, effective: v.issued, file: null, notes: 'Imported from the existing document register. Attach the current file.', author: v.owner || S.ui.user, history: [{ ts: nowTs(), by: S.ui.user, action: 'Imported from the existing document register (issued before this system)', comment: '' }] }] });
    }
  }
};

/* ---------------- Import page (Administration → Import data) ---------------- */
const IMP = { type: 'assets', file: '', rows: null, error: '' };
function checkRows(type, table) {
  const spec = IMPORTS[type], hdr = (table[0] || []).map(h => norm(h)), map = {};
  spec.cols.forEach(([k, label, req, aliases]) => { const names = [label, k, ...(aliases || [])].map(norm); const i = hdr.findIndex(h => names.includes(h)); if (i >= 0) map[k] = i; });
  const missing = spec.cols.filter(c => c[2] && map[c[0]] == null).map(c => c[1]);
  if (missing.length) return { error: `These required columns were not found in the first row: ${missing.join(', ')}. Download the template to see the expected headings.` };
  const seen = new Set(), rows = [];
  table.slice(1).forEach((cells, i) => {
    if (!cells.some(c => String(c || '').trim())) return;   // blank line
    const r = {}; spec.cols.forEach(([k]) => { r[k] = map[k] != null ? String(cells[map[k]] || '').trim() : ''; });
    const req = spec.cols.filter(c => c[2] && !r[c[0]]).map(c => `${c[1]} is empty`);
    const res = spec.check(r, seen);
    if (res.skip) { rows.push({ line: i + 2, r, status: 'skip', msgs: [res.skip] }); return; }
    const errs = req.concat(res.e);
    if (!errs.length && res.key) seen.add(res.key);
    rows.push({ line: i + 2, r, rec: res.rec, status: errs.length ? 'error' : 'ok', msgs: errs.length ? errs : res.w });
  });
  return { rows };
}
function importAdminHtml() {
  const spec = IMPORTS[IMP.type], rows = IMP.rows || [], nOk = rows.filter(r => r.status === 'ok').length, nErr = rows.filter(r => r.status === 'error').length, nSkip = rows.filter(r => r.status === 'skip').length;
  return `<div class="card mb"><div class="card-head"><h2>Import data from Excel or CSV</h2></div><div class="card-body">
    <div class="btn-row mb">${Object.keys(IMPORTS).map(k => `<button class="btn sm ${IMP.type === k ? 'primary' : ''}" data-act="impType" data-v="${k}">${esc(IMPORTS[k].label)}</button>`).join('')}</div>
    <ol class="imp-steps">
      <li><b>Prepare the sheet.</b> The first row holds the column headings: ${spec.cols.map(c => `<span class="tag">${esc(c[1])}${c[2] ? ' *' : ''}</span>`).join(' ')} <span class="muted">(* required)</span>. <button class="btn sm ghost" data-act="impTemplate">${icon('download', 'sm')} Download template</button></li>
      <li><b>Choose the file</b> (.xlsx or .csv). The first worksheet is read. <label class="btn sm"><input class="vh" type="file" id="impFile" accept=".xlsx,.csv,.txt,text/csv">${icon('upload', 'sm')} Choose file</label> ${IMP.file ? `<span class="muted">${esc(IMP.file)}</span>` : ''}</li>
      <li><b>Check the preview</b>, then import. Rows with errors are not imported; rows that already exist are skipped.</li>
    </ol>
    ${IMP.type === 'documents' ? `<p class="muted">${icon('info', 'sm')} Imported documents are recorded as issued, with their revision and review dates. Attach each current file afterwards on the document's page.</p>` : ''}
    ${IMP.type === 'people' ? `<p class="muted">${icon('info', 'sm')} Each person gets a temporary password, shown to you after the import, and must choose their own at first sign-in.</p>` : ''}
    ${IMP.type === 'assets' ? `<p class="muted">${icon('info', 'sm')} Each asset also gets its inspection schedule from the asset type, due today; adjust it afterwards or import schedules.</p>` : ''}
  </div></div>
  ${IMP.error ? `<div class="alert danger">${icon('alert')}<div>${esc(IMP.error)}</div></div>` : ''}
  ${IMP.rows ? `<div class="card"><div class="card-head"><h2>Preview — ${esc(spec.label)}</h2><div class="btn-row">${badge(`${nOk} ready`, 'green')} ${nErr ? badge(`${nErr} with errors`, 'red') : ''} ${nSkip ? badge(`${nSkip} already exist`, 'grey') : ''}<button class="btn primary sm" data-act="impRun" ${nOk ? '' : 'disabled'}>Import ${nOk} row(s)</button></div></div><div class="card-body flush"><div class="table-wrap"><table class="tbl compact"><thead><tr><th>Row</th><th>Status</th><th>Notes</th>${spec.cols.map(c => `<th>${esc(c[1])}</th>`).join('')}</tr></thead><tbody>
    ${rows.map(x => `<tr class="${x.status === 'error' ? 'imp-err' : x.status === 'skip' ? 'row-muted' : ''}"><td class="mono">${x.line}</td><td>${x.status === 'ok' ? badge('Ready', 'green') : x.status === 'skip' ? badge('Exists', 'grey') : badge('Error', 'red')}</td><td class="imp-notes">${x.msgs.map(m => `<div>${esc(m)}</div>`).join('')}</td>${spec.cols.map(c => `<td>${esc(x.r[c[0]])}</td>`).join('')}</tr>`).join('')}
  </tbody></table></div></div></div>` : ''}`;
}
function importAfter() {
  const inp = document.getElementById('impFile'); if (!inp) return;
  inp.addEventListener('change', async () => {
    const f = inp.files[0]; if (!f) return;
    IMP.file = f.name; IMP.rows = null; IMP.error = '';
    try { const table = await readSheet(f); const res = checkRows(IMP.type, table); if (res.error) IMP.error = res.error; else { IMP.rows = res.rows; if (!res.rows.length) IMP.error = 'The file has headings but no rows to import.'; } }
    catch (e) { IMP.error = e.message || 'The file could not be read.'; }
    rerender();
  });
}
ACT.impType = (el) => { IMP.type = el.dataset.v; IMP.rows = null; IMP.file = ''; IMP.error = ''; rerender(); };
ACT.impTemplate = () => {
  const spec = IMPORTS[IMP.type], q = v => /[",;\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : v;
  const csv = [spec.cols.map(c => c[1]), spec.example].map(r => r.map(q).join(',')).join('\r\n');
  saveFile(`import-template-${IMP.type}.csv`, new Blob(['\uFEFF' + csv], { type: 'text/csv' }));
};
ACT.impRun = () => {
  const spec = IMPORTS[IMP.type], ok = (IMP.rows || []).filter(r => r.status === 'ok'), out = { passwords: [] };
  ok.forEach(x => spec.create(x.rec, out));
  log(`Imported ${ok.length} ${spec.label.toLowerCase()} from ${IMP.file}`, '#/admin/import'); save();
  const label = spec.label, n = ok.length; IMP.rows = null; IMP.file = ''; rerender();
  if (out.passwords.length) setTimeout(() => openModal({ title: `${n} user(s) imported`, sub: 'Give each person their temporary password in person or by phone. They choose their own at first sign-in. This list is shown only once.', size: 'wide',
    body: `<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Name</th><th>E-mail</th><th>Temporary password</th></tr></thead><tbody>${out.passwords.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td class="mono"><b>${esc(r[2])}</b></td></tr>`).join('')}</tbody></table></div>`, buttons: [{ label: 'Print list', cls: '', onClick: () => { ACT.print(); return false; } }, { label: 'Done', cls: 'primary', onClick: () => {} }] }), 60);
  else toast(`${n} ${label.toLowerCase()} imported.`);
};
