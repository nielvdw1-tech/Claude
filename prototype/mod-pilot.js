/* ==========================================================================
   Before the pilot: making the modules work better together
   --------------------------------------------------------------------------
   1  All files in one place: Document Manager → All files lists every file
      kept anywhere in the system (documents, risk assessments, incidents,
      inspections, audits, actions, contractors, appointments, training…),
      with where it is used, a search, and possible duplicates flagged.
      A risk assessment can link documents from the Document Manager as
      evidence instead of uploading another copy.
   2  A department filter on every list whose records belong to a department.
   3  Per-person permissions (allow or deny on top of the role) and
      invitations (sent, resent, signed in or not).
   4  Appointments for contractor employees.
   5  Maintenance records and committee meetings as evidence on the legal
      requirements register.
   ========================================================================== */
'use strict';

/* ---------- 1. All files in one place ---------- */
const PF_SOURCE = { documents: ['Document Manager', '#/documents/'], riskAssessments: ['Risk assessment', '#/risk/'], hazards: ['Hazard', '#/risk/'], incidents: ['Incident', '#/incidents/'], inspections: ['Inspection', '#/inspections/'], defects: ['Defect', '#/maintenance'], maintenance: ['Maintenance', '#/maintenance'], audits: ['Audit', '#/audits/'], actions: ['Corrective action', '#/actions/'], contractors: ['Contractor', '#/contractors/'], appointments: ['Appointment', '#/people/'], competencies: ['Competency record', '#/people/'], trainingRecs: ['Training record', '#/training/records'], legalReqs: ['Legal requirement', '#/legal/'], talks: ['Health and Safety Talk', '#/toolbox/'], comMeetings: ['Committee meeting', '#/committee/'], notices: ['Company notice', '#/notices'], assets: ['Equipment', '#/assets/'], permits: ['Permit to work', '#/permits/'], mocs: ['Management of change', '#/moc/'], substances: ['Hazardous substance', '#/substances/'], drills: ['Emergency drill', '#/emergency/'], medRecs: ['Medical record', '#/medical'] };
const isFileMeta = o => o && typeof o === 'object' && !Array.isArray(o) && typeof o.name === 'string' && typeof o.size === 'number' && ('blobId' in o || o.seeded || o.tooLarge || o.demo || o.thumb);
function allFiles() {
  const out = [];
  Object.keys(PF_SOURCE).forEach(coll => (S[coll] || []).forEach(rec => { if (!rec || (rec.org && rec.org !== S.ui.org) || (rec.site && !inSite(rec, S.ui.site))) return;
    const seen = new Set(), walk = (v, depth) => { if (!v || depth > 6 || typeof v !== 'object') return; if (isFileMeta(v)) { if (!seen.has(v)) { seen.add(v); out.push({ f: v, coll, rec }); } return; } (Array.isArray(v) ? v : Object.values(v)).forEach(x => walk(x, depth + 1)); };
    walk(rec, 0); }));
  // the same file kept in more than one place (same name and size)
  const key = x => x.f.name.toLowerCase() + '|' + x.f.size, count = {}; out.forEach(x => { count[key(x)] = (count[key(x)] || 0) + 1; }); out.forEach(x => { x.copies = count[key(x)]; });
  return out;
}
function pfRecordLabel(x) { const r = x.rec; return r.number ? `${r.number} ${r.title || ''}` : r.title || r.topic || r.name || r.description || r.id; }
function pfLink(x) { const s = PF_SOURCE[x.coll]; return s[1].endsWith('/') ? s[1] + x.rec.id : s[1]; }
function filesHtml(q) {
  const all = allFiles(), term = (q.q || '').toLowerCase(), src = q.src || '', dup = q.dup === '1';
  const list = all.filter(x => (!src || PF_SOURCE[x.coll][0] === src) && (!dup || x.copies > 1) && (!term || (x.f.name + ' ' + pfRecordLabel(x) + ' ' + (x.rec.id || '')).toLowerCase().includes(term)))
    .sort((a, b) => String(b.f.selectedOn || '').localeCompare(String(a.f.selectedOn || '')) || a.f.name.localeCompare(b.f.name));
  const sources = [...new Set(all.map(x => PF_SOURCE[x.coll][0]))].sort(), dups = all.filter(x => x.copies > 1).length;
  const qs = o => '#/documents/files?' + new URLSearchParams(Object.assign({}, q, o)).toString();
  return `${pageHead('All files', 'Every file kept anywhere in the system, in one list: with the record it belongs to, so evidence is easy to find during an audit. Files that look like copies of each other are flagged.', `<a class="btn" href="#/documents">${icon('docs', 'sm')} Document register</a>`, scopePill())}
    <div class="card"><div class="toolbar pf-bar"><input type="search" id="pfSearch" placeholder="Search file name or record…" value="${esc(q.q || '')}" aria-label="Search files"><select id="pfSrc" aria-label="Where the file is used"><option value="">Everywhere</option>${sources.map(s => `<option ${s === src ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>
      <a class="btn sm ${dup ? 'primary' : ''}" href="${qs({ dup: dup ? '' : '1' })}">Possible duplicates (${dups})</a><span class="t-sub">${list.length} of ${all.length} file(s)</span></div>
    <div class="card-body flush">${list.length ? `<div class="table-wrap"><table class="tbl stackable"><thead><tr><th>File</th><th>Used in</th><th>Record</th><th>Size</th><th></th></tr></thead><tbody>${list.slice(0, 400).map(x => `<tr><td data-label="File"><b>${esc(x.f.name)}</b>${x.copies > 1 ? ` <span class="badge b-amber plain">${x.copies} copies</span>` : ''}</td><td data-label="Used in">${esc(PF_SOURCE[x.coll][0])}</td><td data-label="Record"><a href="${pfLink(x)}">${esc(String(pfRecordLabel(x)).slice(0, 80))}</a></td><td data-label="Size" class="nowrap">${typeof fsize === 'function' ? fsize(x.f.size) : x.f.size}</td><td><button type="button" class="btn sm" ${fileAttrs(x.f)}>${icon('eye', 'sm')} View</button></td></tr>`).join('')}</tbody></table></div>${list.length > 400 ? '<div class="card-body t-sub">First 400 shown; search to narrow the list.</div>' : ''}` : '<div class="empty">No files match.</div>'}</div></div>`;
}
const _docsBeforePf = ROUTES.documents;
ROUTES.documents = (p, q = {}) => {
  if (p[0] === 'files') return { title: 'All files', nav: 'documents', crumbs: [['Document Manager', '#/documents'], ['All files', '#']], html: filesHtml(q) };
  const r = _docsBeforePf(p, q); if (!r || !r.html || p[0]) return r;
  const b = `<a class="btn ghost fab" href="#/documents/files" title="Every file in the system" aria-label="All files">${icon('docs', 'sm')}<span>All files</span></a>`;
  if (/<div class="fab-stack[^"]*"[^>]*>/.test(r.html)) r.html = r.html.replace(/(<div class="fab-stack[^"]*"[^>]*>)/, `$1${b}`); else r.html += `<div class="fab-stack">${b}</div>`;
  return r; };
let PF_T = null;
document.addEventListener('input', e => { if (e.target && e.target.id === 'pfSearch') { clearTimeout(PF_T); const v = e.target.value; PF_T = setTimeout(() => { const q = new URLSearchParams(location.hash.split('?')[1] || ''); q.set('q', v); history.replaceState(null, '', '#/documents/files?' + q.toString()); rerender(); const i = document.getElementById('pfSearch'); if (i) { i.focus(); i.setSelectionRange(v.length, v.length); } }, 250); } });
document.addEventListener('change', e => { if (e.target && e.target.id === 'pfSrc') { const q = new URLSearchParams(location.hash.split('?')[1] || ''); q.set('src', e.target.value); navigate('#/documents/files?' + q.toString()); } });

// A risk assessment links documents from the Document Manager instead of keeping another copy
const _riskBeforePf = ROUTES.risk;
ROUTES.risk = (p, q) => { const r = _riskBeforePf(p, q); if (!r || !r.html || !p[0] || !/^RA-/.test(p[0]) || p[1]) return r; const a = byId('riskAssessments', p[0]); if (!a) return r;
  const docs = (a.docLinks || []).map(id => byId('documents', id)).filter(Boolean), edit = canRisk() && a.status !== 'Superseded';
  const html = `<div class="pf-links"><div class="t-sub">Documents from the Document Manager</div>${docs.length ? docs.map(d => `<div><a href="#/documents/${d.id}">${esc(d.number)} ${esc(d.title)}</a>${edit ? ` <button type="button" class="link-btn" data-act="raDocUnlink" data-id="${a.id}" data-d="${d.id}">Remove</button>` : ''}</div>`).join('') : '<div class="muted">None linked.</div>'}${edit ? `<button type="button" class="btn sm mt-s" data-act="raDocLink" data-id="${a.id}">${icon('link', 'sm')} Link a document</button>` : ''}</div>`;
  r.html = r.html.replace(/(<label class="btn sm mt-s">[^<]*<svg[\s\S]*?Upload evidence<input type="file" hidden data-raev="[^"]+"><\/label>)/, `$1${html}`);
  if (!r.html.includes('pf-links')) r.html = r.html.replace('<h2>Reviews and versions</h2>', `<h2>Reviews and versions</h2>`).replace(/(<div class="card"><div class="card-head"><h2>Reviews and versions<\/h2>)/, `<div class="card"><div class="card-head"><h2>Linked documents</h2></div><div class="card-body">${html}</div></div>$1`);
  return r; };
ACT.raDocLink = (el) => { const a = byId('riskAssessments', el.dataset.id), have = new Set(a.docLinks || []);
  const docs = S.documents.filter(d => d.org === a.org && !have.has(d.id) && (typeof docActive !== 'function' || docActive(d))).sort((x, y) => x.number.localeCompare(y.number));
  openModal({ title: 'Link a document as evidence', sub: `${a.id} ${a.title} — the document stays in the Document Manager; nothing is copied`, body: `<div class="form-grid">${fld({ name: 'doc', label: 'Document', type: 'select', options: opts(docs.map(d => ({ value: d.id, label: `${d.number} — ${d.title}` })), '', '— Choose —'), required: true, full: true })}</div>`,
    buttons: [{ label: 'Link', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); a.docLinks = [...have, v.doc]; log(`Linked ${byId('documents', v.doc).number} to risk assessment ${a.id}`, '#/risk/' + a.id); save(); rerender(); } }] }); };
ACT.raDocUnlink = (el) => { const a = byId('riskAssessments', el.dataset.id); a.docLinks = (a.docLinks || []).filter(x => x !== el.dataset.d); save(); rerender(); };

/* ---------- 2. Department filter on the lists ---------- */
const PF_DEPT = 'fdept';
const hasDepts = rows => (S.departments || []).length > 1 && (rows || []).some(r => typeof deptOf === 'function' && deptOf(r));
const _listViewBeforePf = listView;
listView = function (key, cfg) {
  if (cfg && Array.isArray(cfg.rows) && !(cfg.filters || []).some(f => f.id === PF_DEPT || f.id === 'dept') && hasDepts(cfg.rows))
    cfg = Object.assign({}, cfg, { filters: (cfg.filters || []).concat([{ id: PF_DEPT, label: 'All departments', options: S.departments, test: (r, v) => deptOf(r) === v }]) });
  return _listViewBeforePf(key, cfg);
};
const withDept = (all, F) => (F && !F.fdept && hasDepts(all)) ? Object.assign({}, F, { fdept: { all: 'All departments', list: () => S.departments.map(d => ({ value: d, label: d })), test: (x, v) => deptOf(x) === v } }) : F;
const _regFilterBeforePf = regFilter; regFilter = function (all, q, F) { return _regFilterBeforePf(all, q, withDept(all, F)); };
const _regFilterBarBeforePf = regFilterBar; regFilterBar = function (base, q, all, shown, F, ph) { return _regFilterBarBeforePf(base, q, all, shown, withDept(all, F), ph); };

/* ---------- 3. Per-person permissions and invitations ---------- */
const personPerm = (p, perm) => { if (!p) return null; if ((p.permDeny || []).includes(perm)) return false; if ((p.permAllow || []).includes(perm)) return true; return null; };
const _canBeforePf = can; can = function (perm) { const o = personPerm(me(), perm); return o == null ? _canBeforePf(perm) : o; };
const _canAreaBeforePf = canArea; canArea = function (key) { const a = AREA_OF[key], o = a ? personPerm(me(), a) : null; return o == null ? _canAreaBeforePf(key) : o; };
ACT.userPerms = (el) => { const u = person(el.dataset.id), role = S.roles.find(r => r.name === u.sysRole) || {}, has = k => !!role.allPerms || (role.perms || []).includes(k);
  const st = k => (u.permDeny || []).includes(k) ? 'deny' : (u.permAllow || []).includes(k) ? 'allow' : '';
  const rows = (S.permissionDefs || []).map(([k, label, grp]) => `<tr><td>${esc(label)}<div class="t-sub mono">${esc(k)}</div></td><td>${has(k) ? badge('Yes', 'green', true) : badge('No', 'grey', true)}</td><td><select name="pp_${k.replace(/\./g, '_')}" aria-label="${esc(label)} for ${esc(u.name)}"><option value="" ${st(k) === '' ? 'selected' : ''}>As the role</option><option value="allow" ${st(k) === 'allow' ? 'selected' : ''}>Allow</option><option value="deny" ${st(k) === 'deny' ? 'selected' : ''}>Do not allow</option></select></td></tr>`).join('');
  openModal({ title: `Permissions for ${u.name}`, sub: `Role: ${u.sysRole}. Change only what differs for this person; everything else follows the role.`, size: 'wide', body: `<div class="table-wrap" style="max-height:60vh"><table class="tbl compact"><thead><tr><th>Permission</th><th>Role gives</th><th>For ${esc(u.name.split(' ')[0])}</th></tr></thead><tbody>${rows}</tbody></table></div>`,
    buttons: [{ label: 'Save', cls: 'primary', onClick: m => { const allow = [], deny = [];
      (S.permissionDefs || []).forEach(([k]) => { const v = m.querySelector(`[name="pp_${k.replace(/\./g, '_')}"]`).value; if (v === 'allow' && !has(k)) allow.push(k); if (v === 'deny' && has(k)) deny.push(k); });
      u.permAllow = allow; u.permDeny = deny; log(`Changed the personal permissions of ${u.name}: ${allow.length} allowed, ${deny.length} not allowed`, '#/admin/users'); save(); toast('Saved.'); rerender(); } }] }); };
// invitations: recorded when the account e-mail goes out; can be resent until the person signs in
const _queueEmailBeforeInvite = queueEmail;
queueEmail = function (to, cat, subject, text, link) { if (cat === 'account' && /^Your account for the HSEQ Management System|^Invitation:/.test(subject || '')) (to || []).forEach(id => { const p = person(id); if (p) { p.invite = p.invite || { first: TODAY, count: 0 }; p.invite.last = TODAY; p.invite.count++; } }); return _queueEmailBeforeInvite(to, cat, subject, text, link); };
ACT.userInvite = (el) => { const u = person(el.dataset.id), pw = tempPassword();
  u.auth = Object.assign(u.auth || {}, { hash: passHash(u.id, pw), mustChange: true, failed: 0, lockedUntil: null });
  queueEmail([u.id], 'account', `Invitation: your account for the ${orgOf(u.org).short} HSEQ system`, `You are invited to use the HSEQ Management System as ${u.sysRole} (${sname(u.site)}). Sign in with this e-mail address (${u.email}) and the temporary password your administrator gives you; you will then choose your own password.`, location.href.split('#')[0]);
  log(`Resent the invitation to ${u.name}`, '#/admin/users'); save(); rerender(); setTimeout(() => showTempPassword(u, pw, 'Invitation sent again'), 60); };
const _adminBeforePf = ROUTES.admin;
ROUTES.admin = (p, q) => { const r = _adminBeforePf(p, q); if (!r || !r.html || p[0] !== 'users' || !can('admin')) return r;
  S.people.filter(u => u.sysRole && (u.org === S.ui.org)).forEach(u => { const a = u.auth || {}, extra = (u.permAllow || []).length + (u.permDeny || []).length;
    const btn = `<button class="btn sm" data-act="userPerms" data-id="${u.id}">Permissions${extra ? ` (${extra})` : ''}</button>${!a.lastSignIn && isActive(u) && u.invite ? `<button class="btn sm" data-act="userInvite" data-id="${u.id}">Resend invitation</button>` : ''}`;
    r.html = r.html.replace(new RegExp(`(<button class="btn sm" data-act="userReset" data-id="${u.id}">)`), `${btn}$1`);
    if (!a.lastSignIn && u.invite) r.html = r.html.replace(new RegExp(`(<b>${esc(u.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</b><div class="t-sub">${esc(u.email).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</div>)`), `$1<div class="t-sub">Invited ${fmt(u.invite.last)}${u.invite.count > 1 ? ` (${u.invite.count}×)` : ''} · not signed in yet</div>`);
  });
  return r; };

/* ---------- 4. Appointments for contractor employees ---------- */
const _conBeforePf = ROUTES.contractors;
ROUTES.contractors = (p, q) => { const r = _conBeforePf(p, q); if (!r || !r.html || !p[0] || !/^CON-/.test(p[0])) return r; const c = byId('contractors', p[0]); if (!c) return r;
  r.html = r.html.replace('<th>Name</th><th>Role</th><th>Competency</th><th>Induction</th>', '<th>Name</th><th>Role</th><th>Competency</th><th>Appointments</th><th>Induction</th>');
  (c.employees || []).forEach((e, k) => { const ap = (e.appointments || []).map(x => `<div>${esc(x.type)}${x.ref ? ` <span class="t-sub mono">${esc(x.ref)}</span>` : ''}${x.file ? ` · <button type="button" class="link-btn" ${fileAttrs(x.file)}>${esc(x.file.name)}</button>` : ''}<div class="t-sub">${x.effective ? 'From ' + fmt(x.effective) : ''}${x.end ? ' to ' + fmt(x.end) : ''}${x.by ? ' · appointed by ' + esc(x.by) : ''}</div></div>`).join('');
    const cell = `<td data-label="Appointments">${ap || '<span class="muted">—</span>'}${canCon() ? `<button class="btn sm mt-s" data-act="conEmpApt" data-id="${c.id}" data-k="${k}">${icon('plus', 'sm')} Appointment</button>` : ''}</td>`;
    r.html = r.html.replace(new RegExp(`(<td data-label="Name"><b>${esc(e.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</b></td><td data-label="Role">[^<]*</td><td data-label="Competency">[\\s\\S]*?</td>)(<td data-label="Induction">)`), `$1${cell}$2`); });
  return r; };
ACT.conEmpApt = (el) => { const c = byId('contractors', el.dataset.id), e = c.employees[+el.dataset.k];
  const types = (S.config.apptTypes || []).map(t => t.name).concat(['Construction supervisor', 'Construction safety officer', 'Competent person (scaffolding)', 'Competent person (fall protection)', 'Other']);
  openModal({ title: 'Record an appointment', sub: `${e.name} · ${c.name}`, size: 'wide', body: `<div class="form-grid">
    ${fld({ name: 'type', label: 'Appointment', type: 'select', options: opts([...new Set(types)], '', '— Choose —'), required: true })}${fld({ name: 'ref', label: 'Reference' })}
    ${fld({ name: 'by', label: 'Appointed by (name and position at the contractor)', required: true, full: true })}
    ${fld({ name: 'effective', label: 'Effective date', type: 'date', value: TODAY, required: true })}${fld({ name: 'end', label: 'End date (only if it ends)', type: 'date' })}
    ${fld({ name: 'file', label: 'Signed appointment letter', type: 'file', full: true })}</div>`,
    buttons: [{ label: 'Save', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m);
      (e.appointments = e.appointments || []).push({ type: v.type, ref: v.ref, by: v.by, effective: v.effective, end: v.end, file: v.file, on: TODAY, recordedBy: S.ui.user });
      conHist(c, `${v.type} appointment recorded for ${e.name}`); log(`Recorded a ${v.type} appointment for ${e.name} (${c.name})`, '#/contractors/' + c.id); save(); rerender(); } }] }); };

/* ---------- 5. Maintenance records and committee meetings as legal evidence ---------- */
if (typeof LK_KINDS === 'object') {
  LK_KINDS['Maintenance record'] = { coll: 'maintenance', href: '#/maintenance', fixedHref: true, list: () => (S.maintenance || []).filter(m => { const a = byId('assets', m.asset); return a && inSite(a, 'ALL'); }).slice(-80), title: m => `${(byId('assets', m.asset) || {}).tag || m.asset} — ${m.description} (${m.completed ? 'done ' + fmt(m.completed) : 'due ' + fmt(m.due)})`, state: m => m.completed ? { text: 'Done ' + fmt(m.completed) } : daysTo(m.due) < 0 ? { text: 'Overdue', gap: 'maintenance overdue' } : { text: 'Due ' + fmt(m.due) } };
  LK_KINDS['Committee meeting'] = { coll: 'comMeetings', href: '#/committee/', list: () => (S.comMeetings || []).filter(m => m.org === S.ui.org).slice(-40), title: m => `${((S.committees || []).find(c => c.id === m.committee) || {}).name || 'H&S committee'} — ${fmt(m.date)} (${m.status})`, state: m => ({ text: m.status === 'Held' ? 'Held ' + fmt(m.date) + ' · minutes recorded' : 'Planned ' + fmt(m.date) }) };
}

/* ---------- 6. Load a regulation from a PDF, on screen ----------
   Reads the PDF's text in the browser (PDF.js), finds the numbered regulations
   or sections, and shows them for review. Each one is added as "to check": the
   wording counts as checked only once a competent person confirms it against
   the original (as for wording pasted by hand). Scanned PDFs have no text and
   need OCR first, which the import tool does. */
const PDFIMP = { items: null, file: null };
async function pdfLines(file) {
  const lib = await ensurePdfJs(), pdf = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false }).promise, out = [];
  for (let n = 1; n <= pdf.numPages; n++) { const pg = await pdf.getPage(n), tc = await pg.getTextContent(), rows = [];
    tc.items.filter(it => it.str && it.str.trim()).forEach(it => { const y = it.transform[5], r = rows.find(R => Math.abs(R.y - y) < 2.5); if (r) r.parts.push(it); else rows.push({ y, parts: [it] }); });
    rows.sort((a, b) => b.y - a.y).forEach(r => { const t = r.parts.sort((a, b) => a.transform[4] - b.transform[4]).map(p => p.str).join(' ').replace(/\s+/g, ' ').trim(); if (t) out.push({ page: n, t }); }); }
  return { lines: out, pages: pdf.numPages };
}
function splitRegulations(lines) {
  const clean = lines.filter(l => !(/\.{4,}/.test(l.t) && l.t.length < 110) && !/^Page \d+( of \d+)?$/i.test(l.t) && !/^\d{1,4}$/.test(l.t));
  const head = /^(?:(?:Regulation|Section)\s+)?(\d{1,3}[A-Z]?)\.\s*(?:[-—–]\s*)?([A-Z][^.]{1,110}?)\.?(?:\s*[-—–]?\s*(\(1\).*|[A-Z].*))?$/;
  const items = []; let cur = null, last = 0, short = false;
  clean.forEach(l => { const m = head.exec(l.t), num = m ? parseInt(m[1], 10) : 0;
    if (m && !short && (num === last + 1 || (num === last && /[A-Z]$/.test(m[1])) || (!items.length && num <= 3))) {
      cur = { ref: (lines.some(x => /\bAct\b/.test(x.t)) && !lines.some(x => /Regulations/i.test(x.t)) ? 'Section ' : 'Regulation ') + m[1], title: m[2].trim(), page: l.page, text: m[3] ? m[3] : '' }; items.push(cur); last = num;
      if (/^short title/i.test(m[2])) short = true; return; }
    if (cur) cur.text += (cur.text ? '\n' : '') + l.t; });
  items.forEach(i => { i.text = i.text.replace(/-\n(?=[a-z])/g, '').trim(); });
  return items;
}
ACT.legImportPdf = () => { PDFIMP.items = null; PDFIMP.file = null;
  openModal({ title: 'Load a regulation from a PDF', sub: 'The system reads the text of the PDF and finds the numbered regulations or sections. You check the result before it is added. Each section is added as "to check" until a competent person confirms its wording against the original.', size: 'wide',
    body: `<div class="form-grid">${fld({ name: 'file', label: 'PDF from an official source (Government Gazette, gov.za, SAFLII, the Department of Employment and Labour)', type: 'file', accept: 'application/pdf', required: true, full: true })}
      ${fld({ name: 'name', label: 'Name (as officially titled)', required: true, full: true, placeholder: 'e.g. General Safety Regulations, 1986' })}${fld({ name: 'short', label: 'Short name' })}${fld({ name: 'type', label: 'Type', type: 'select', options: opts(LEG_TYPES, 'Regulations'), required: true })}
      ${fld({ name: 'sourceUrl', label: 'Official source (link or Gazette number)', required: true, full: true })}</div><div id="pdfImpOut"></div>`,
    buttons: [{ label: 'Read the PDF', cls: 'primary', onClick: m => { pdfImpRead(m); return false; } }] }); };
async function pdfImpRead(m) {
  if (!validateForm(m)) return; const f = m.querySelector('[name=file]').files[0], out = m.querySelector('#pdfImpOut');
  if (!f || !/\.pdf$/i.test(f.name)) { toast('Choose a PDF file.', 'error'); return; }
  out.innerHTML = `<p class="t-sub">${icon('clock', 'sm')} Reading ${esc(f.name)}…</p>`;
  try { const { lines, pages } = await pdfLines(f);
    if (lines.length < 5) { out.innerHTML = `<div class="alert warn">${icon('alert')}<div><b>No text could be read from this PDF.</b> It is probably a scan (a picture of the pages). A scanned PDF must first be converted to text (OCR); ask VDW to load it with the import tool, or use a text PDF from the official source.</div></div>`; return; }
    const items = splitRegulations(lines); PDFIMP.items = items.length ? items : [{ ref: 'Whole document', title: f.name.replace(/\.pdf$/i, ''), page: 1, text: lines.map(l => l.t).join('\n') }]; PDFIMP.file = f.name;
    out.innerHTML = `<div class="alert info">${icon('info')}<div>${pages} page(s) read. <b>${items.length ? items.length + ' regulation(s) or section(s) found' : 'No numbered sections were found, so the whole text is kept as one item'}.</b> Untick anything that was split wrongly; you can edit the titles and wording afterwards.</div></div>
      <div class="table-wrap" style="max-height:44vh"><table class="tbl compact"><thead><tr><th></th><th>Ref.</th><th>Title</th><th>Page</th><th>Start of the wording</th></tr></thead><tbody>${PDFIMP.items.map((i, k) => `<tr><td><input type="checkbox" name="imp_${k}" checked aria-label="Add ${esc(i.ref)}"></td><td class="nowrap">${esc(i.ref)}</td><td>${esc(i.title)}</td><td>${i.page}</td><td class="t-sub">${esc(i.text.slice(0, 110))}${i.text.length > 110 ? '…' : ''}</td></tr>`).join('')}</tbody></table></div>
      <div class="btn-row mt-s"><button type="button" class="btn primary" data-act="pdfImpSave">Add to the legal library</button></div>`;
  } catch (e) { console.error(e); out.innerHTML = `<div class="alert danger">${icon('alert')}<div>The PDF could not be read: ${esc(e.message || 'unknown error')}.</div></div>`; }
}
ACT.pdfImpSave = () => { const m = document.querySelector('.modal'); if (!m || !PDFIMP.items) return; const v = readForm(m);
  const keep = PDFIMP.items.filter((i, k) => { const x = m.querySelector(`[name=imp_${k}]`); return x && x.checked; }); if (!keep.length) { toast('Tick at least one section.', 'error'); return; }
  S.legislation = S.legislation || []; const l = { id: nextId('LEG-', 'legislation'), name: v.name, short: v.short || v.name, type: v.type, status: 'Current', sourceUrl: v.sourceUrl, notes: `Loaded from ${PDFIMP.file} on ${fmt(TODAY)} by ${pname(S.ui.user)}. The wording must be checked against the original before it is relied on.`, items: [] };
  keep.forEach(i => l.items.push({ id: l.id + '-' + Math.random().toString(36).slice(2, 7), ref: i.ref, title: i.title, text: i.text, source: `${PDFIMP.file}, page ${i.page}`, imported: TODAY }));
  S.legislation.push(l); log(`Loaded ${l.name} from ${PDFIMP.file}: ${keep.length} section(s), to be checked`, '#/legal/lib/' + l.id); save(); closeModal(); toast(`${keep.length} section(s) added. Check the wording against the original.`); navigate('#/legal/lib/' + l.id); };
const _legalBeforePdf = ROUTES.legal;
ROUTES.legal = (p, q) => { const r = _legalBeforePdf(p, q); if (!r || !r.html || p[0] !== 'library' || !(typeof canLegal === 'function' ? canLegal() : can('legal.manage'))) return r;
  const b = `<button type="button" class="btn ghost fab" data-act="legImportPdf" title="Load a regulation from a PDF" aria-label="Load a regulation from a PDF">${icon('upload', 'sm')}<span>Load from PDF</span></button>`;
  if (/<div class="fab-stack[^"]*"[^>]*>/.test(r.html)) r.html = r.html.replace(/(<div class="fab-stack[^"]*"[^>]*>)/, `$1${b}`); else r.html += `<div class="fab-stack">${b}</div>`;
  return r; };
