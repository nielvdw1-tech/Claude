/* ==========================================================================
   Attendance registers
   --------------------------------------------------------------------------
   An attendance register can be drawn for one specific:
   - document that had to be read and signed (per revision): everyone who had
     to read it, who read and signed it, when, with the reading check result
     and the signature, and who is still outstanding;
   - training session: who was booked, who attended, the result and how long
     the training is valid; before the session it prints as a sign-in sheet
     with an empty signature column;
   - training course: everyone with a training record for the course;
   - Health and Safety Talk: who attended and signed, with the signatures.
   Each register opens as its own page (#/attendance/<kind>/<id>) with Print,
   PDF (signatures included) and CSV. Reports → Attendance registers lists
   every register that can be drawn. The registers come from the records in
   the system; they do not guarantee legal compliance.
   ========================================================================== */
'use strict';

const ATT_KINDS = { doc: 'Document read and signed', session: 'Training session', course: 'Training course', talk: 'Health and Safety Talk' };
const attPerson = id => byId('people', id) || {};
const attBranch = id => { const x = attPerson(id); return x.site ? sname(x.site) : ''; };

// Which revision of a document a register is for: the one asked for, else the revision in use, else the latest one with signatures
function attDocRev(d, rev) {
  const R = d.revisions || [];
  if (rev != null && rev !== '') { const r = R.find(x => String(x.rev) === String(rev)); if (r) return r; }
  return docIssued(d) || R.slice().reverse().find(x => (x.acks || []).length) || null;
}

/* The register itself: { kind, ref, title, meta [[label, value]], cols, rows [{ cells, sig }], sigCol, blankSig, summary, note, revs } */
function attRegister(kind, id, q = {}) {
  if (kind === 'doc') {
    const d = byId('documents', id); if (!d) return null;
    const r = attDocRev(d, q.rev);
    if (!r) return { kind, ref: d.number, title: d.title, back: '#/documents/' + d.id, meta: [['Document', `${d.number} ${d.title}`], ['Status', docStatus(d)], ['Branch', d.site === 'ALL' ? 'All branches' : sname(d.site)]],
      cols: ['#', 'Name', 'Job title', 'Branch', 'Status', 'Read and signed on', 'Reading check'], rows: [], sigCol: true, summary: 'Not issued yet', note: 'This document has not been issued yet, so nobody has read and signed it. The register fills once it is issued and the people who must read it have signed.' };
    const inUse = r === docIssued(d), a = inUse ? ackState(d) : null, acks = r.acks || [];
    const req = a ? a.req : [], ids = req.concat(acks.map(x => x.by).filter(u => !req.includes(u)));
    const R2 = d.readers || {}, who = [(R2.roles || []).join(', '), (R2.people || []).map(pname).join(', ')].filter(Boolean).join(' · ');
    const rows = ids.map((u, i) => { const k = acks.filter(x => x.by === u).pop(), late = !k && a && daysTo(a.due) < 0;
      return { cells: [i + 1, pname(u), attPerson(u).jobTitle || '', attBranch(u), k ? 'Read and signed' : late ? 'Overdue' : 'Outstanding', k ? fmtTs(k.ts) : '', k ? (k.quiz === 'passed' ? 'Passed' : (d.quiz || []).length ? '' : 'Not required') : ''], sig: k && k.sig ? k.sig : null, tone: k ? 'green' : late ? 'red' : 'amber' }; });
    const done = rows.filter(x => x.tone === 'green').length;
    return { kind, ref: d.number, title: d.title, back: '#/documents/' + d.id,
      meta: [['Document', `${d.number} ${d.title}`], ['Revision', `${revLabel(r)}${inUse ? ' (in use)' : ' (not the revision in use)'}`], ['Effective', r.effective ? fmt(r.effective) : '—'], ['Branch', d.site === 'ALL' ? 'All branches' : sname(d.site)], ['Must be read by', who || '—'], ['Due', a ? fmt(a.due) : '—']],
      cols: ['#', 'Name', 'Job title', 'Branch', 'Status', 'Read and signed on', 'Reading check'], rows, sigCol: true,
      summary: a ? `${done} of ${a.req.length} read and signed` : done ? `${done} signed` : inUse && !req.length ? 'Nobody set to read it yet' : 'Nobody signed',
      note: !inUse ? 'This revision is no longer in use, so only the people who signed it are listed.' : !req.length ? 'Nobody has been set to read this document yet. On the document, use "Read and acknowledge" → "Set who must read it"; each person then gets a task to read and sign it, and appears here.' : '',
      revs: (d.revisions || []).filter(x => (x.acks || []).length || x === docIssued(d)).map(x => ({ rev: x.rev, label: revLabel(x), on: x === r })) };
  }
  if (kind === 'session') {
    const s = byId('trainingSessions', id); if (!s) return null;
    const c = course(s.course) || {}, recs = (S.trainingRecs || []).filter(t => t.session === s.id), held = s.status === 'Completed';
    const rows = s.people.map((u, i) => { const t = recs.find(x => x.person === u);
      return { cells: [i + 1, pname(u), attPerson(u).jobTitle || '', attBranch(u), held ? (t ? 'Attended' : 'Did not attend') : 'Booked', t ? fmt(t.date) : '', t ? (t.result || (c.competency ? 'Not assessed yet' : '—')) : '', t && t.expires ? fmt(t.expires) : t ? 'Does not expire' : ''], sig: null, tone: held ? (t ? 'green' : 'red') : 'blue' }; });
    const cert = s.status === 'Completed' && recs.find(t => t.cert);
    return { kind, ref: s.id, title: c.name || s.course, back: '#/training/sessions',
      meta: [['Course', c.name || s.course], ['Session', s.id], ['Date', fmt(s.held || s.date)], ['Provider / trainer', s.provider || '—'], ['Venue', s.venue || '—'], ['Status', held ? 'Held' : 'Scheduled']],
      cols: ['#', 'Name', 'Job title', 'Branch', 'Attendance', 'Date attended', 'Result', 'Valid until'], rows, sigCol: true, blankSig: true,
      summary: held ? `${recs.length} of ${s.people.length} attended` : `${s.people.length} booked`,
      note: held ? (cert ? `The signed attendance register / certificates are on file: ${cert.cert.name || 'uploaded file'}.` : 'Signatures for training are taken on the paper register at the session; no signed register was uploaded with the attendance.') : 'Sign-in sheet: print it for the session, have each person sign, then record the attendance and upload the signed sheet.',
      file: cert ? cert.cert : null };
  }
  if (kind === 'course') {
    const c = course(id); if (!c) return null;
    const recs = (S.trainingRecs || []).filter(t => t.course === c.id && t.org === S.ui.org && (S.ui.site === 'ALL' || attPerson(t.person).site === S.ui.site)).sort((a, b) => b.date.localeCompare(a.date) || pname(a.person).localeCompare(pname(b.person)));
    const rows = recs.map((t, i) => { const st = trStatus(t.person, c.id), latest = lastRecord(t.person, c.id) === t;
      return { cells: [i + 1, pname(t.person), attPerson(t.person).jobTitle || '', attBranch(t.person), fmt(t.date), t.session || '', t.provider || '', t.result || (c.competency ? 'Not assessed yet' : '—'), t.expires ? fmt(t.expires) : 'Does not expire', latest ? st : 'Superseded'], sig: null, tone: latest ? TR_TONE[st] || 'grey' : 'grey' }; });
    return { kind, ref: c.id, title: c.name, back: '#/training/courses',
      meta: [['Course', c.name], ['Category', c.category || '—'], ['Usual provider', c.provider || '—'], ['Valid for', c.validity ? `${c.validity} months` : 'Does not expire'], ['Branch', scopeLabel()]],
      cols: ['#', 'Name', 'Job title', 'Branch', 'Date attended', 'Session', 'Provider', 'Result', 'Valid until', 'Status now'], rows, sigCol: false,
      summary: `${rows.length} attendance record(s) · ${new Set(recs.map(t => t.person)).size} person(s)` };
  }
  if (kind === 'talk') {
    const t = byId('talks', id); if (!t) return null;
    const rows = (t.attendees || []).map((a, i) => ({ cells: [i + 1, pname(a.person), attPerson(a.person).jobTitle || '', attBranch(a.person), a.sig ? 'Signed' : 'Not signed', a.sig ? fmtTs(a.sig.ts) : ''], sig: a.sig ? a.sig.image : null, tone: a.sig ? 'green' : 'amber' }));
    return { kind, ref: t.id, title: t.topic, back: '#/toolbox/' + t.id,
      meta: [['Health and Safety Talk', `${t.id} ${t.topic}`], ['Date', fmt(t.date)], ['Branch', sname(t.site)], ['Presenter', pname(t.presenter)], ['Status', t.status]],
      cols: ['#', 'Name', 'Job title', 'Branch', 'Status', 'Signed on'], rows, sigCol: true, blankSig: t.status !== 'Held',
      summary: `${talkSigned(t)} of ${(t.attendees || []).length} signed` };
  }
  return null;
}
// Who may draw a register: not employees (field users); training registers need the training area, document registers the documents area
function attAllowed(kind) { if (isFieldUser()) return false; return canArea(kind === 'doc' ? 'documents' : kind === 'talk' ? 'toolbox' : 'training'); }

/* ---------------- The register page ---------------- */
let ATT_LAST = null;
ROUTES.attendance = (p, q = {}) => {
  const kind = p[0], id = p[1], reg = ATT_KINDS[kind] && attAllowed(kind) ? attRegister(kind, id, q) : null;
  if (!reg) return { title: 'Attendance register', nav: 'reports', crumbs: [['Management reports', '#/reports/attreg'], ['Attendance register', '#']], html: `<div class="empty">${ATT_KINDS[kind] && !attAllowed(kind) ? 'Your role cannot draw this attendance register.' : 'This attendance register could not be found.'}</div>` };
  ATT_LAST = reg; ATT_LAST.q = q; ATT_LAST.id = id;
  const o = orgOf(S.ui.org), cols = reg.cols.concat(reg.sigCol ? ['Signature'] : []);
  const revSel = reg.revs && reg.revs.length > 1 ? `<label class="muted" for="attRev">Revision</label><select id="attRev" data-id="${id}">${reg.revs.map(r => `<option value="${esc(r.rev)}" ${r.on ? 'selected' : ''}>${esc(r.label)}</option>`).join('')}</select>` : '';
  const html = `<div class="no-print">${pageHead('Attendance register', `${esc(ATT_KINDS[kind])}: who had to attend or read it, who did and signed, and when. Print it, or download it as a PDF with the signatures, or as CSV.`, `<a class="btn" href="${reg.back}">Back to the record</a>`)}</div>
  <div class="card att-reg"><div class="card-head no-print"><div><h2>${esc(reg.ref)} ${esc(reg.title)}</h2><div class="ch-sub">${esc(reg.summary)}</div></div><div class="btn-row">${revSel}<button class="btn sm" data-act="attCsv">${icon('download', 'sm')} CSV</button><button class="btn sm" data-act="attPdf">${icon('download', 'sm')} PDF</button><button class="btn sm primary" data-act="print">${icon('print', 'sm')} Print</button></div></div>
    <div class="card-body">
      <div class="att-head">${orgMark(o, 'doc')}<div><b>${esc(o.name)}</b><div class="att-title">ATTENDANCE REGISTER</div><div class="t-sub">${esc(ATT_KINDS[kind])} · drawn ${fmt(TODAY)} by ${esc(pname(S.ui.user))}</div></div></div>
      <div class="kv att-meta">${reg.meta.map(([k, v]) => `<div>${esc(k)}</div><div>${esc(v)}</div>`).join('')}<div>Summary</div><div><b>${esc(reg.summary)}</b></div></div>
      ${reg.note ? `<p class="t-sub att-note">${esc(reg.note)}</p>` : ''}
      ${reg.rows.length ? `<div class="table-wrap"><table class="tbl compact stackable att-tbl"><thead><tr>${cols.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${reg.rows.map(r => `<tr>${r.cells.map((c, i) => `<td data-label="${esc(reg.cols[i])}">${reg.cols[i] === 'Status' || reg.cols[i] === 'Attendance' || reg.cols[i] === 'Status now' ? badge(c, r.tone, true) : esc(c)}</td>`).join('')}${reg.sigCol ? `<td data-label="Signature" class="att-sig">${r.sig ? `<img src="${r.sig}" alt="Signature of ${esc(r.cells[1])}">` : reg.blankSig ? '<span class="att-line"></span>' : '<span class="muted">—</span>'}</td>` : ''}</tr>`).join('')}</tbody></table></div>` : '<div class="empty">Nobody is on this register yet.</div>'}
      <div class="att-sign"><div>Compiled by: <span class="att-line"></span></div><div>Signature: <span class="att-line"></span></div><div>Date: <span class="att-line"></span></div></div>
      <p class="t-sub att-foot">Drawn from the records in the system. It does not guarantee legal compliance.</p>
    </div></div>`;
  return { title: 'Attendance register', nav: kind === 'doc' ? 'documents' : kind === 'talk' ? 'toolbox' : 'training', crumbs: [['Management reports', '#/reports/attreg'], ['Attendance register', '#']], html };
};
ACT.attRev = (el) => { navigate(`#/attendance/doc/${el.dataset.id}?rev=${encodeURIComponent(el.value)}`); };
document.addEventListener('change', e => { const s = e.target.closest && e.target.closest('#attRev'); if (s) ACT.attRev(s); });
const attCsvRows = reg => [reg.cols.concat(reg.sigCol ? ['Signed'] : [])].concat(reg.rows.map(r => r.cells.concat(reg.sigCol ? [r.sig ? 'Yes' : 'No'] : [])));
ACT.attCsv = () => { const reg = ATT_LAST; if (!reg) return;
  const csv = [['Attendance register', ATT_KINDS[reg.kind]], ...reg.meta, ['Summary', reg.summary], []].concat(attCsvRows(reg)).map(r => r.map(c => `"${String(c == null ? '' : c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  saveFile(`Attendance_register_${reg.ref.replace(/[^A-Za-z0-9-]+/g, '_')}_${TODAY}.csv`, new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })).then(ok => { if (ok) toast('Attendance register exported to CSV.'); }); };
// Signatures can be PNG or SVG: draw each on a canvas so the PDF can take it as a PNG
function attPng(src) { return new Promise(res => { if (!src) { res(null); return; } const im = new Image(); im.onload = () => { try { const w = im.naturalWidth || 300, h = im.naturalHeight || 100, c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, 0, 0, w, h); res(c.toDataURL('image/png')); } catch (e) { res(null); } }; im.onerror = () => res(null); im.src = src; }); }
ACT.attPdf = async () => { const reg = ATT_LAST; if (!reg) return;
  try { const { PDFDocument, StandardFonts, rgb } = await ensurePdfLib(); const pdf = await PDFDocument.create(), R = await pdf.embedFont(StandardFonts.Helvetica), B = await pdf.embedFont(StandardFonts.HelveticaBold);
    const cols = reg.cols.concat(reg.sigCol ? ['Signature'] : []), W = 842, Hh = 595, M = 32, ink = rgb(0.06, 0.1, 0.2), mute = rgb(0.4, 0.45, 0.55), line = rgb(0.86, 0.89, 0.93);
    const wts = cols.map(h => h === '#' ? 0.35 : h === 'Signature' ? 1.6 : h === 'Name' ? 1.4 : 1), sum = wts.reduce((a, b) => a + b, 0), cw = wts.map(x => x / sum * (W - 2 * M));
    const sigs = await Promise.all(reg.rows.map(r => attPng(r.sig).then(u => u ? pdf.embedPng(u).catch(() => null) : null)));
    const pages = []; let pg, y; const T = (s, x, yy, f, size, color) => pg.drawText(pdfSafe(s), { x, y: yy, size, font: f, color: color || ink });
    const fit = (s, f, size, w) => { s = pdfSafe(s == null ? '' : String(s)); const out = []; let cur = ''; s.split(' ').forEach(word => { const t = cur ? cur + ' ' + word : word; if (f.widthOfTextAtSize(t, size) > w && cur) { out.push(cur); cur = word; } else cur = t; }); if (cur) out.push(cur); return out.map(l => { while (f.widthOfTextAtSize(l, size) > w && l.length > 3) l = l.slice(0, -2); return l; }); };
    const head = () => { let x = M; cols.forEach((h, i) => { T(h, x + 2, y, B, 8, mute); x += cw[i]; }); y -= 8; pg.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: line }); y -= 12; };
    const newPage = first => { pg = pdf.addPage([W, Hh]); pages.push(pg); y = Hh - M;
      if (first) { T(orgOf(S.ui.org).name, M, y - 8, B, 10); T('Attendance register', M, y - 28, B, 16); T(`${ATT_KINDS[reg.kind]} · drawn ${fmt(TODAY)} by ${pname(S.ui.user)}`, M, y - 42, R, 8.5, mute); y -= 62;
        reg.meta.concat([['Summary', reg.summary]]).forEach(([k, v]) => { T(k, M, y, B, 8.5, mute); fit(v, R, 8.5, W - 2 * M - 120).slice(0, 2).forEach((l, i) => T(l, M + 120, y - i * 11, k === 'Summary' ? B : R, 8.5)); y -= 13; });
        if (reg.note) { fit(reg.note, R, 8, W - 2 * M).forEach(l => { T(l, M, y, R, 8, mute); y -= 11; }); } y -= 8; }
      head(); };
    newPage(true);
    reg.rows.forEach((r, ri) => { const cells = r.cells.map((c, i) => fit(c, R, 8, cw[i] - 4)), hgt = Math.max(reg.sigCol ? 26 : 12, Math.max(1, ...cells.map(c => c.length)) * 10 + 4);
      if (y - hgt < M + 70) newPage(false);
      let x = M; cells.forEach((c, i) => { c.forEach((l, k) => T(l, x + 2, y - k * 10, R, 8)); x += cw[i]; });
      if (reg.sigCol) { const sw = cw[cw.length - 1] - 6, img = sigs[ri]; if (img) { const sc = Math.min(sw / img.width, 22 / img.height); pg.drawImage(img, { x: x + 2, y: y - 22 + 8, width: img.width * sc, height: img.height * sc }); } else if (reg.blankSig) pg.drawLine({ start: { x: x + 2, y: y - 14 }, end: { x: x + sw, y: y - 14 }, thickness: 0.5, color: mute }); }
      y -= hgt; pg.drawLine({ start: { x: M, y: y + 8 }, end: { x: W - M, y: y + 8 }, thickness: 0.3, color: line }); });
    if (!reg.rows.length) { T('Nobody is on this register yet.', M, y, R, 9, mute); y -= 14; }
    y -= 18; ['Compiled by', 'Signature', 'Date'].forEach((k, i) => { const x = M + i * 260; T(k + ':', x, y, R, 8.5, mute); pg.drawLine({ start: { x: x + 62, y: y - 2 }, end: { x: x + 240, y: y - 2 }, thickness: 0.5, color: mute }); });
    pages.forEach((p2, i) => p2.drawText(pdfSafe(`Attendance register ${reg.ref} · page ${i + 1} of ${pages.length} · drawn from the records in the system; it does not guarantee legal compliance · Powered by VDW`), { x: M, y: 16, size: 6.8, font: R, color: mute }));
    if (await saveFile(`Attendance_register_${reg.ref.replace(/[^A-Za-z0-9-]+/g, '_')}_${TODAY}.pdf`, new Blob([await pdf.save()], { type: 'application/pdf' }))) toast('Attendance register downloaded as PDF.');
  } catch (e) { console.error(e); toast('The PDF could not be made: ' + esc(e.message), 'error'); } };

/* ---------------- Reports → Attendance registers: every register that can be drawn ---------------- */
function attIndex() {
  const rows = [], open = (k, id) => H(`<a class="btn sm" href="#/attendance/${k}/${id}">Open register</a>`, `#/attendance/${k}/${id}`);
  if (attAllowed('doc')) S.documents.filter(d => d.org === S.ui.org && inSite(d, S.ui.site)).forEach(d => { const a = ackState(d), signed = (d.revisions || []).some(r => (r.acks || []).length); if (!a && !signed) return; const r = attDocRev(d);
    rows.push([ATT_KINDS.doc, d.number, d.title, d.site === 'ALL' ? 'All branches' : sname(d.site), r ? revLabel(r) : '', a ? a.req.length : '', a ? a.done.length : (r.acks || []).length, a ? a.outstanding.length : '', open('doc', d.id)]); });
  if (attAllowed('session')) (S.trainingSessions || []).filter(s => s.org === S.ui.org).sort((a, b) => b.date.localeCompare(a.date)).forEach(s => { const n = (S.trainingRecs || []).filter(t => t.session === s.id).length;
    rows.push([ATT_KINDS.session, s.id, (course(s.course) || {}).name || s.course, s.venue || '', fmt(s.held || s.date), s.people.length, s.status === 'Completed' ? n : 'Not held yet', s.status === 'Completed' ? s.people.length - n : '', open('session', s.id)]); });
  if (attAllowed('course')) courses().forEach(c => { const n = (S.trainingRecs || []).filter(t => t.course === c.id && t.org === S.ui.org && (S.ui.site === 'ALL' || attPerson(t.person).site === S.ui.site)).length; if (n) rows.push([ATT_KINDS.course, c.short || c.id, c.name, scopeLabel(), 'All dates', '', n, '', open('course', c.id)]); });
  if (attAllowed('talk') && typeof talks === 'function') talks().slice().sort((a, b) => b.date.localeCompare(a.date)).forEach(t => rows.push([ATT_KINDS.talk, t.id, t.topic, sname(t.site), fmt(t.date), (t.attendees || []).length, talkSigned(t), (t.attendees || []).length - talkSigned(t), open('talk', t.id)]));
  return rows;
}
/* ---------------- Choose what to draw a register for ---------------- */
function attChoices(kind) {
  if (kind === 'doc') return S.documents.filter(d => d.org === S.ui.org && inSite(d, S.ui.site)).sort((a, b) => a.number.localeCompare(b.number)).map(d => { const a = ackState(d); return { value: d.id, label: `${d.number} — ${d.title}${a ? ` (${a.done.length} of ${a.req.length} signed)` : docIssued(d) ? '' : ' (not issued)'}` }; });
  if (kind === 'session') return (S.trainingSessions || []).filter(s => s.org === S.ui.org).sort((a, b) => b.date.localeCompare(a.date)).map(s => ({ value: s.id, label: `${fmt(s.held || s.date)} — ${(course(s.course) || {}).name || s.course} (${s.status === 'Completed' ? 'held' : 'scheduled'})` }));
  if (kind === 'course') return courses().map(c => ({ value: c.id, label: c.name }));
  if (kind === 'talk') return typeof talks === 'function' ? talks().slice().sort((a, b) => b.date.localeCompare(a.date)).map(t => ({ value: t.id, label: `${fmt(t.date)} — ${t.topic}` })) : [];
  return [];
}
ACT.attPick = (el) => { const kinds = Object.keys(ATT_KINDS).filter(attAllowed), k0 = (el && el.dataset && el.dataset.kind) || 'doc';
  if (!kinds.length) { toast('Your role cannot draw attendance registers.', 'error'); return; }
  const itemOpts = k => attChoices(k).map(o => `<option value="${o.value}">${esc(o.label)}</option>`).join('');
  openModal({ title: 'Draw an attendance register', sub: 'Choose the document, training or Health and Safety Talk. The register shows who had to read or attend it, who did and signed, and when.', size: 'wide',
    body: `<div class="form-grid">${fld({ name: 'kind', label: 'Register of', type: 'select', options: opts(kinds.map(k => ({ value: k, label: ATT_KINDS[k] })), kinds.includes(k0) ? k0 : kinds[0]), required: true, full: true })}
      <div class="field full"><label for="attFind">Search</label><input id="attFind" type="text" placeholder="Type a number or part of the title…" autocomplete="off"></div>
      <div class="field full"><label for="attItem">Which one<span class="req">*</span></label><select id="attItem" name="item" size="8" required></select><div class="hint" id="attCount"></div></div></div>`,
    onOpen: m => { const ks = m.querySelector('[name=kind]'), sel = m.querySelector('#attItem'), find = m.querySelector('#attFind');
      const fill = () => { const all = attChoices(ks.value), w = find.value.trim().toLowerCase(), L = all.filter(o => !w || o.label.toLowerCase().includes(w));
        sel.innerHTML = L.map(o => `<option value="${o.value}">${esc(o.label)}</option>`).join(''); if (L.length) sel.selectedIndex = 0; m.querySelector('#attCount').textContent = `${L.length} of ${all.length}`; };
      ks.addEventListener('change', () => { find.value = ''; fill(); }); find.addEventListener('input', fill); sel.addEventListener('dblclick', () => { if (sel.value) { closeModal(); navigate(`#/attendance/${ks.value}/${sel.value}`); } }); fill(); setTimeout(() => find.focus(), 30); },
    buttons: [{ label: 'Open register', cls: 'primary', onClick: m => { const k = m.querySelector('[name=kind]').value, v = m.querySelector('#attItem').value; if (!v) { toast('Choose one from the list.', 'error'); return false; } navigate(`#/attendance/${k}/${v}`); } }] });
};

REPORTS.push(['attreg', 'Attendance registers']);
const _buildReportBeforeAtt = buildReport;
buildReport = function (key) {
  if (key !== 'attreg') return _buildReportBeforeAtt(key);
  return { pre: `<div class="btn-row mb no-print"><button class="btn primary" data-act="attPick" data-kind="doc">${icon('docs', 'sm')} Register of a document</button><button class="btn" data-act="attPick" data-kind="session">${icon('print', 'sm')} Of a training session or course</button><button class="btn" data-act="attPick" data-kind="talk">${icon('print', 'sm')} Of a Health and Safety Talk</button></div>`,
    desc: 'Draw the attendance register of one specific document that had to be read and signed, a training session or course, or a Health and Safety Talk. Open a register to print it or download it as a PDF with the signatures.',
    ...tableRep(['Register', 'Reference', 'Subject', 'Branch / venue', 'Date / revision', 'Required', 'Attended / signed', 'Outstanding', ''], attIndex()) };
};

/* ---------------- "Attendance register" buttons on the records ---------------- */
const attBtn = (k, id, label = 'Attendance register') => attAllowed(k) ? `<a class="btn sm" href="#/attendance/${k}/${id}">${icon('print', 'sm')} ${label}</a>` : '';
// Document: on the "Read and acknowledge" card, once there is a list or signatures
const _ackCardBeforeAtt = ackCardHtml;
ackCardHtml = function (d) { const h = _ackCardBeforeAtt(d);
  return h.replace('<h2>Read and acknowledge</h2>', `<h2>Read and acknowledge</h2><span class="btn-row att-btns">${attBtn('doc', d.id)}`).replace(/(<span class="btn-row att-btns">[\s\S]*?)(<\/div><div class="card-body">)/, '$1</span>$2'); };
// Training sessions: a sign-in sheet before, the attendance register after
const _sessionsBeforeAtt = sessionsHtml;
sessionsHtml = function () { let h = _sessionsBeforeAtt(); (S.trainingSessions || []).filter(s => s.org === S.ui.org).forEach(s => { h = h.replace(`<div class="t-sub mono">${s.id}</div>`, `<div class="t-sub mono">${s.id}</div><div class="mt-s">${attBtn('session', s.id, s.status === 'Completed' ? 'Attendance register' : 'Sign-in sheet')}</div>`); }); return h; };
// Courses: everyone who attended the course
const _coursesBeforeAtt = coursesHtml;
coursesHtml = function () { let h = _coursesBeforeAtt(); courses().forEach(c => { if (!(S.trainingRecs || []).some(t => t.course === c.id)) return; const k = `<td data-label="Course"><b>${esc(c.name)}</b>`, i = h.indexOf(k); if (i > -1) h = h.slice(0, i) + k + `<div class="mt-s">${attBtn('course', c.id)}</div>` + h.slice(i + k.length); }); return h; };
// Health and Safety Talk: on its attendance card
const _toolboxBeforeAtt = ROUTES.toolbox;
ROUTES.toolbox = (p, q) => { const r = _toolboxBeforeAtt(p, q); if (r && r.html && p[0] && /^TBT-/.test(p[0])) r.html = r.html.replace(/(<h2>Attendance register<\/h2><span class="ch-sub">[^<]*<\/span>)/, `$1${attBtn('talk', p[0], 'Print / PDF')}`); return r; };

/* ---------------- Demonstration data: signed reading of the HSEQ policy and a training session that was held ---------------- */
MIGRATIONS.push(() => { if (S.migr && S.migr.att1) return; S.migr = S.migr || {}; S.migr.att1 = true;
  const sig = (bend) => 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="60"><path d="M12 42 C 40 ${bend}, 70 52, 100 30 S 150 12, 172 36 S 214 48, 228 18" fill="none" stroke="#10213f" stroke-width="2.5"/></svg>`);
  const d = byId('documents', 'DOC-001'), r = d && docIssued(d);
  if (r && !(r.acks || []).length && typeof requiredReaders === 'function') { r.acks = []; requiredReaders(d).slice(0, 4).forEach((u, i) => r.acks.push({ by: u, ts: addDays(TODAY, -(9 - i * 2)) + 'T0' + (8 + i) + ':15:00', sig: sig(5 + i * 9), statement: `I have read and understood the ${d.title} (${d.number} ${revLabel(r)}) and will follow it.` })); }
  S.trainingSessions = S.trainingSessions || []; S.trainingRecs = S.trainingRecs || [];
  if (!byId('trainingSessions', 'TS-002') && byId('courses', 'CRS-004')) { const day = addDays(TODAY, -21), ppl = ['P-009', 'P-014', 'P-008'].filter(id => byId('people', id));
    S.trainingSessions.push({ id: 'TS-002', org: 'ORG-1', course: 'CRS-004', date: day, held: day, provider: 'Fire safety provider (demo)', venue: 'Germiston yard', people: ppl, status: 'Completed', attended: 2, by: 'P-002' });
    ppl.slice(0, 2).forEach(id => S.trainingRecs.push({ id: nextId('TRN-', 'trainingRecs', 4), org: 'ORG-1', person: id, course: 'CRS-004', date: day, provider: 'Fire safety provider (demo)', expires: expiryFor('CRS-004', day), cert: null, result: '', assessedBy: null, session: 'TS-002', by: 'P-002', on: day })); }
});

// Document Manager: "Attendance register" next to Upload document, to choose any document
const _docsBeforeAtt = ROUTES.documents;
ROUTES.documents = (p, q) => { const r = _docsBeforeAtt(p, q); if (!r || !r.html || p[0] || !attAllowed('doc')) return r;
  const b = `<button type="button" class="btn ghost fab" data-act="attPick" data-kind="doc" title="Attendance register of a document" aria-label="Attendance register of a document">${icon('print', 'sm')}<span>Attendance register</span></button>`;
  if (/<div class="fab-stack[^"]*"[^>]*>/.test(r.html)) r.html = r.html.replace(/(<div class="fab-stack[^"]*"[^>]*>[\s\S]*?<\/button>)/, `$1${b}`); else r.html += `<div class="fab-stack">${b}</div>`;
  return r; };
