/* ==========================================================================
   Files — browser-local file storage and in-app viewer
   --------------------------------------------------------------------------
   Every file chosen in a file picker (documents, evidence, photos,
   certificates) is kept in this browser's IndexedDB so it can be opened
   later. PDFs are drawn page by page with PDF.js (vendored in
   vendor/pdfjs, Apache-2.0); images and text display directly.
   PROTOTYPE: files stay in this browser only. Production stores them in
   secure, versioned document storage.
   ========================================================================== */
'use strict';

const FILE_DB = { name: 'vdw-hseq-files', store: 'files', db: null };
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const FILE_PENDING = {};            // blobId → promise while a save is still in progress

function idbOpen() {
  return new Promise((resolve, reject) => {
    if (FILE_DB.db) return resolve(FILE_DB.db);
    let req;
    try { req = indexedDB.open(FILE_DB.name, 1); } catch (e) { return reject(e); }
    req.onupgradeneeded = () => req.result.createObjectStore(FILE_DB.store);
    req.onsuccess = () => { FILE_DB.db = req.result; resolve(req.result); };
    req.onerror = () => reject(req.error);
  });
}
function idbTx(mode, fn) {
  return idbOpen().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(FILE_DB.store, mode); const st = tx.objectStore(FILE_DB.store);
    const r = fn(st); tx.oncomplete = () => resolve(r && r.result); tx.onerror = () => reject(tx.error);
  }));
}
function idbPut(id, blob) { return idbTx('readwrite', st => st.put(blob, id)); }
function idbGet(id) { return idbTx('readonly', st => st.get(id)); }
function idbClear() { return idbTx('readwrite', st => st.clear()).catch(() => {}); }

/* Called by fileMeta() for every chosen file: returns the metadata kept in the record */
function storeFile(f) {
  const meta = { name: f.name, size: f.size, type: f.type || guessType(f.name), demo: true, selectedOn: nowTs() };
  if (f.size > MAX_FILE_BYTES) { meta.tooLarge = true; return meta; }
  const id = 'F-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  meta.blobId = id;
  FILE_PENDING[id] = idbPut(id, f).catch(e => { console.warn('Could not keep file in browser storage', e); meta.saveFailed = true; }).finally(() => { setTimeout(() => delete FILE_PENDING[id], 0); });
  return meta;
}
function guessType(name) {
  const ext = String(name).split('.').pop().toLowerCase();
  return { pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', txt: 'text/plain', csv: 'text/csv', md: 'text/plain', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }[ext] || '';
}
function fileKind(type, name) {
  const t = type || guessType(name);
  if (t === 'application/pdf') return 'pdf';
  if (t.startsWith('image/')) return 'image';
  if (t.startsWith('text/') || /\.(txt|csv|md)$/i.test(name)) return 'text';
  return 'other';
}

/* ---------------- PDF.js (loaded on first use) ---------------- */
let PDFJS_READY = null;
function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Could not load ' + src)); document.head.appendChild(s); }); }
function ensurePdfJs() {
  if (window.pdfjsLib && window.pdfjsWorker) return Promise.resolve(window.pdfjsLib);
  if (!PDFJS_READY) PDFJS_READY = loadScript('vendor/pdfjs/pdf.min.js').then(() => loadScript('vendor/pdfjs/pdf.worker.min.js')).then(() => {
    // The worker script sets window.pdfjsWorker, so PDF.js runs on the page itself (works from a local folder too)
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdfjs/pdf.worker.min.js';
    return window.pdfjsLib;
  }).catch(e => { PDFJS_READY = null; throw e; });
  return PDFJS_READY;
}
async function renderPdf(blob, box) {
  const lib = await ensurePdfJs();
  const pdf = await lib.getDocument({ data: new Uint8Array(await blob.arrayBuffer()), isEvalSupported: false }).promise;
  const n = pdf.numPages, max = Math.min(n, 60);
  box.innerHTML = `<div class="fv-bar"><span>${n} page${n > 1 ? 's' : ''}</span>${n > max ? `<span>Showing the first ${max}</span>` : ''}</div><div class="fv-pages"></div>`;
  const pages = box.querySelector('.fv-pages');
  const width = Math.min(860, pages.clientWidth || box.clientWidth || 800) - 2;
  for (let i = 1; i <= max; i++) {
    const page = await pdf.getPage(i);
    const v1 = page.getViewport({ scale: 1 }), scale = width / v1.width, ratio = window.devicePixelRatio || 1;
    const vp = page.getViewport({ scale: scale * ratio });
    const fig = document.createElement('figure'); fig.className = 'fv-page';
    const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height; c.style.width = (vp.width / ratio) + 'px'; c.style.height = (vp.height / ratio) + 'px';
    fig.appendChild(c); fig.insertAdjacentHTML('beforeend', `<figcaption>Page ${i} of ${n}</figcaption>`); pages.appendChild(fig);
    await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
  }
}

/* ---------------- Sample sheet for seeded demo records (no file content) ---------------- */
function sampleSheet(o) {
  const d = o.doc && byId('documents', o.doc), r = d && d.revisions[+o.ri];
  if (!d || !r) return `<div class="sample-sheet"><div class="ss-note">${icon('info', 'sm')} <span><b>${esc(o.name)}</b> is a demonstration file reference. The demo data contains no file content for it. Files you select yourself open here in full.</span></div></div>`;
  const org = orgOf(d.org), iss = docIssued(d);
  return `<div class="sample-sheet">
    <div class="controlled-header"><div class="chh"><div class="print-logo"><div class="logo-mark">VDW</div><div><b style="font-size:12px">${esc(org.short)}</b><small>Controlled document</small></div></div><div class="ch-title">${esc(d.title)}</div><div class="ch-meta">Document no: <b class="mono">${esc(d.number)}</b><br>Revision: <b>${revLabel(r)}</b><br>Status: <b>${esc(r.status)}</b><br>${r.effective ? `Effective: <b>${fmt(r.effective)}</b>` : `Date: <b>${fmt(r.date)}</b>`}</div></div></div>
    <div class="ss-grid"><div><h4>Category</h4><p>${esc(d.category)}</p></div><div><h4>Applies to</h4><p>${esc(d.site === 'ALL' ? 'All sites' : site(d.site).name)}</p></div><div><h4>Owner</h4><p>${esc(pname(d.owner))}</p></div><div><h4>Author</h4><p>${esc(pname(r.author))}</p></div></div>
    <h4>Change summary</h4><p>${esc(r.notes || '—')}</p>
    ${(r.route || []).length ? `<h4>Approval</h4><table class="rt"><thead><tr><th>Step</th><th>Approver</th><th>Decision</th><th>Date</th></tr></thead><tbody>${r.route.map(s => `<tr><td>${s.step}. ${esc(s.label)}</td><td>${esc(pname(s.person))}</td><td>${esc(s.status === 'Current' ? 'Awaiting decision' : s.status)}</td><td>${fmt(s.ts)}</td></tr>`).join('')}</tbody></table>` : ''}
    <div class="ss-note">${icon('info', 'sm')} <span>Sample sheet generated from the document record. The demo data has no file content for <b>${esc(o.name)}</b>${iss && iss !== r ? `; the controlled version in use is ${revLabel(iss)}` : ''}. Documents you upload open here in full.</span></div>
  </div>`;
}

/* ---------------- Viewer ---------------- */
async function openFileViewer(o) {
  const kind = fileKind(o.type, o.name);
  const d = o.doc && byId('documents', o.doc), r = d && d.revisions[+o.ri];
  const sub = d ? `${esc(d.number)} · ${revLabel(r)} · ${esc(r.status)}` : `${fsize(+o.size)}${o.type ? ' · ' + esc(o.type) : ''}`;
  const m = openModal({ title: o.name, sub, size: 'wide', body: `<div class="fv" id="fvBody"><div class="fv-msg">${icon('clock')} Opening…</div></div><div class="fv-foot muted" id="fvFoot"></div>`, buttons: kind === 'other' && !o.seeded && o.blob ? [] : [{ label: `${icon('print', 'sm')} Print`, cls: 'primary', id: 'fvPrint', onClick: () => { printFile(o); return false; } }] });
  const box = m.querySelector('#fvBody'), foot = m.querySelector('#fvFoot');
  const close = m.closest('.modal-back').querySelector('.modal-foot .btn'); if (close) close.textContent = 'Close';
  const msg = (ic, html) => { box.innerHTML = `<div class="fv-msg">${icon(ic)}<div>${html}</div></div>`; };
  if (o.seeded || (!o.blob && !o.tooLarge)) { box.innerHTML = sampleSheet(o); return; }
  if (o.tooLarge) return msg('alert', `This file is larger than ${fsize(MAX_FILE_BYTES)}, so the prototype did not keep a copy. Production document storage has no such limit.`);
  let blob = null;
  try { if (FILE_PENDING[o.blob]) await FILE_PENDING[o.blob]; blob = await idbGet(o.blob); } catch (e) { console.warn(e); }
  if (!blob) return msg('alert', 'The file content is not available in this browser. It may have been added in another browser, or the browser storage was cleared. Upload the file again to view it here.');
  const url = URL.createObjectURL(blob);
  const embedded = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();   // downloads are blocked inside the hosted preview
  foot.innerHTML = `${icon('lock', 'sm')} Kept in this browser only (prototype) · ${fsize(blob.size)}${embedded ? '' : ` · <a href="${url}" download="${esc(o.name)}">Download</a>`}`;
  try {
    if (kind === 'pdf') { box.innerHTML = `<div class="fv-msg">${icon('clock')} Rendering PDF…</div>`; await renderPdf(blob, box); }
    else if (kind === 'image') box.innerHTML = `<div class="fv-img"><img src="${url}" alt="${esc(o.name)}"></div>`;
    else if (kind === 'text') { const t = await blob.slice(0, 300000).text(); box.innerHTML = `<pre class="fv-text">${esc(t)}${blob.size > 300000 ? '\n\n… (preview truncated)' : ''}</pre>`; }
    else msg('file', `<b>No preview for this file type.</b> PDFs, images and text files open here. Production would convert Word, Excel and PowerPoint files to PDF so they can be read in the browser.`);
  } catch (e) {
    console.warn('Preview failed', e);
    msg('alert', `The preview could not be shown (${esc(e.message || 'unknown error')}). You can still download the file.`);
  }
}
ACT.viewFile = (el) => openFileViewer(Object.assign({}, el.dataset));
ACT.viewDocFile = (el) => { const d = byId('documents', el.dataset.id), ri = el.dataset.ri != null ? +el.dataset.ri : d.revisions.length - 1, f = d.revisions[ri].file; if (!f) { toast('No file is attached to this revision yet.', 'error'); return; } openFileViewer({ name: f.name, type: f.type, size: f.size, blob: f.blobId, seeded: f.seeded ? '1' : '', tooLarge: f.tooLarge, doc: d.id, ri }); };

/* ==========================================================================
   Printing
   --------------------------------------------------------------------------
   The open file is laid out in #printArea (one printed page per document
   page) and the browser's print dialog is opened. Every printed page carries
   the document-control marking: "UNCONTROLLED WHEN PRINTED", or "DRAFT —
   NOT FOR USE" for revisions that are not issued. The hosted online preview
   blocks the print dialog, so there the viewer explains where to print from.
   ========================================================================== */
function inPreviewFrame() { try { return window.self !== window.top; } catch (e) { return true; } }
function printBlockedNotice() {
  openModal({ title: 'Printing is not available in the online preview', size: 'narrow', body: `<p>The online preview link blocks the print dialog for everyone.</p><p>To print, open the prototype from its folder on your computer (double-click <b>index.html</b>) and use the same Print button. In the production system printing works directly from the browser.</p>`, buttons: [] });
}
function printStamp(o) {
  const d = o.doc && byId('documents', o.doc), r = d && d.revisions[+o.ri];
  const who = `Printed by ${pname(S.ui.user)} on ${fmtTs(nowTs())}`;
  if (!d) return { cls: 'pa-plain', text: `${o.name} · ${who}` };
  const draft = r.status !== 'Issued for Use';
  return { cls: draft ? 'pa-draft' : 'pa-unc', text: `${draft ? 'DRAFT — NOT FOR USE' : 'UNCONTROLLED WHEN PRINTED'} · ${d.number} ${revLabel(r)} · ${r.status} · ${who}`, d, r };
}
async function buildPrintArea(o) {
  let area = document.getElementById('printArea');
  if (!area) { area = document.createElement('div'); area.id = 'printArea'; document.body.appendChild(area); }
  const st = printStamp(o), stamp = `<div class="pa-stamp ${st.cls}">${esc(st.text)}</div>`;
  const page = (inner) => `<section class="pa-page">${stamp}<div class="pa-body">${inner}</div></section>`;
  area.innerHTML = '';
  const kind = fileKind(o.type, o.name);
  if (o.seeded || (!o.blob && !o.tooLarge)) { area.innerHTML = page(sampleSheet(o)); return st; }
  let blob = null; try { if (FILE_PENDING[o.blob]) await FILE_PENDING[o.blob]; blob = await idbGet(o.blob); } catch (e) { /* handled below */ }
  if (!blob) throw new Error('The file content is not available in this browser.');
  if (kind === 'pdf') {
    const lib = await ensurePdfJs(); const pdf = await lib.getDocument({ data: new Uint8Array(await blob.arrayBuffer()), isEvalSupported: false }).promise;
    for (let i = 1; i <= pdf.numPages; i++) {
      const pg = await pdf.getPage(i), vp = pg.getViewport({ scale: 2 });
      const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
      await pg.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
      area.insertAdjacentHTML('beforeend', page('')); area.lastElementChild.querySelector('.pa-body').appendChild(c);
    }
  } else if (kind === 'image') {
    const url = URL.createObjectURL(blob);
    area.innerHTML = page(`<img src="${url}" alt="${esc(o.name)}">`);
    await new Promise(res => { const img = area.querySelector('img'); if (img.complete) res(); else { img.onload = res; img.onerror = res; } });
  } else if (kind === 'text') {
    area.innerHTML = page(`<pre>${esc(await blob.text())}</pre>`);
  } else throw new Error('This file type cannot be printed from the prototype. PDFs, images and text files can.');
  return st;
}
async function printFile(o) {
  if (inPreviewFrame()) { printBlockedNotice(); return; }
  try {
    toast('Preparing the print copy…', 'info');
    const st = await buildPrintArea(o);
    if (st.d) { docLatestFor(st.d, st.r).history.push({ ts: nowTs(), by: S.ui.user, action: st.cls === 'pa-draft' ? 'Draft printed (marked DRAFT — NOT FOR USE)' : 'Printed copy made (marked UNCONTROLLED WHEN PRINTED)', comment: '' }); save(); }
    document.body.classList.add('printing-file');
    const done = () => { document.body.classList.remove('printing-file'); const a = document.getElementById('printArea'); if (a) a.innerHTML = ''; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
  } catch (e) { toast(esc(e.message || 'Could not prepare the print copy.'), 'error'); }
}
function docLatestFor(d, r) { return r || docLatest(d); }
ACT.printDocFile = (el) => { const d = byId('documents', el.dataset.id), ri = el.dataset.ri != null ? +el.dataset.ri : d.revisions.length - 1, f = d.revisions[ri].file; if (!f) { toast('No file is attached to this revision yet.', 'error'); return; } printFile({ name: f.name, type: f.type, size: f.size, blob: f.blobId, seeded: f.seeded ? '1' : '', doc: d.id, ri }); };
