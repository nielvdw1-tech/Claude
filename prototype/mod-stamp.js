/* ==========================================================================
   Stamped downloads of controlled documents
   --------------------------------------------------------------------------
   A document downloaded from the Document Manager carries the same control
   stamp as a printed copy, on every page: "UNCONTROLLED WHEN PRINTED" for the
   issued revision, "DRAFT — NOT FOR USE" for anything still in approval, with
   the number, revision, who downloaded it and when. PDFs are stamped page by
   page, images are placed on a stamped PDF page, and demo documents (no real
   file) become a stamped summary sheet. Word/Excel files cannot carry a stamp,
   so their file name says UNCONTROLLED and the download is recorded.
   Library: vendor/pdf-lib (MIT), loaded on first use.
   ========================================================================== */
'use strict';

let PDFLIB_READY = null;
function ensurePdfLib() { if (window.PDFLib) return Promise.resolve(window.PDFLib); if (!PDFLIB_READY) PDFLIB_READY = loadScript('vendor/pdf-lib/pdf-lib.min.js').then(() => window.PDFLib).catch(e => { PDFLIB_READY = null; throw e; }); return PDFLIB_READY; }
// The standard PDF fonts only know Latin characters; replace anything else
function pdfText(s) { return String(s || '').replace(/[→←]/g, '-').replace(/[^\x20-\x7E -ÿ–—‘’“”…]/g, '-'); }
function downloadStamp(d, r) {
  const draft = r.status !== 'Issued for Use';
  return { draft, text: pdfText(`${draft ? 'DRAFT — NOT FOR USE' : 'UNCONTROLLED WHEN PRINTED'} · ${d.number} ${revLabel(r)} · ${r.status} · Downloaded by ${pname(S.ui.user)} on ${fmtTs(nowTs())}`) };
}
// Draw the stamp band across the top of a page
function drawStamp(page, st, font, rgb) {
  const { width, height } = page.getSize(), size = 7.5, col = st.draft ? rgb(0.69, 0, 0.13) : rgb(0.54, 0.23, 0);
  const pad = 16, tw = Math.min(width - pad * 2, font.widthOfTextAtSize(st.text, size) + 14), bx = (width - tw) / 2, by = height - 22;
  page.drawRectangle({ x: bx, y: by, width: tw, height: 15, color: rgb(1, 1, 1), opacity: 0.92, borderColor: col, borderWidth: 0.8 });
  let t = st.text; while (font.widthOfTextAtSize(t, size) > tw - 10 && t.length > 10) t = t.slice(0, -2);
  page.drawText(t, { x: bx + (tw - font.widthOfTextAtSize(t, size)) / 2, y: by + 4.6, size, font, color: col });
}
/* Draws the document's sample sheet (as shown by "Open document") onto an A4 page: controlled header
   with the company logo, the details row, change summary, approval table and the note. */
async function drawSampleSheet(pdf, d, r, f, { StandardFonts, rgb }) {
  const page = pdf.addPage([595.28, 841.89]), W = 595.28, M = 42, CW = W - 2 * M;
  const fr = await pdf.embedFont(StandardFonts.Helvetica), fb = await pdf.embedFont(StandardFonts.HelveticaBold), fm = await pdf.embedFont(StandardFonts.Courier);
  const ink = rgb(0.06, 0.1, 0.2), ink2 = rgb(0.2, 0.25, 0.35), muted = rgb(0.4, 0.45, 0.55), line = rgb(0.72, 0.76, 0.82);
  const org = orgOf(d.org), iss = docIssued(d);
  const wrap = (t, font, size, width) => { const out = []; let cur = ''; pdfText(t).split(/\s+/).forEach(w => { const tryL = cur ? cur + ' ' + w : w; if (font.widthOfTextAtSize(tryL, size) > width && cur) { out.push(cur); cur = w; } else cur = tryL; }); if (cur) out.push(cur); return out; };
  const text = (t, x, y, font = fr, size = 10, color = ink) => page.drawText(pdfText(t), { x, y, size, font, color });
  // ---- Controlled header: three columns in a bordered box
  const top = 841.89 - 46, hh = 92, c1 = 150, c3 = 178, c2 = CW - c1 - c3, y0 = top - hh;
  page.drawRectangle({ x: M, y: y0, width: CW, height: hh, borderColor: ink, borderWidth: 1.2 });
  page.drawLine({ start: { x: M + c1, y: y0 }, end: { x: M + c1, y: top }, thickness: 0.6, color: line });
  page.drawLine({ start: { x: M + c1 + c2, y: y0 }, end: { x: M + c1 + c2, y: top }, thickness: 0.6, color: line });
  let ly = top - 14;
  if (org.logo) {
    try { const img = await pdf.embedPng(Uint8Array.from(atob(org.logo.split(',')[1]), c => c.charCodeAt(0))); const k = Math.min(110 / img.width, 34 / img.height); page.drawImage(img, { x: M + 12, y: ly - img.height * k, width: img.width * k, height: img.height * k }); ly -= img.height * k + 10; } catch (e) { /* logo not embeddable: initials below */ }
  }
  if (ly === top - 14) { page.drawRectangle({ x: M + 12, y: ly - 32, width: 32, height: 32, color: rgb(0, 0.37, 0.94) }); const ini = pdfText(orgInitials(org)); text(ini, M + 12 + (32 - fb.widthOfTextAtSize(ini, 11)) / 2, ly - 20, fb, 11, rgb(1, 1, 1)); ly -= 42; }
  text(org.short, M + 12, ly - 2, fb, 9); text('Controlled document', M + 12, ly - 13, fr, 7, muted);
  const tl = wrap(d.title, fb, 13, c2 - 24).slice(0, 4), th = tl.length * 16;
  tl.forEach((t, k) => text(t, M + c1 + 12, y0 + hh / 2 + th / 2 - 12 - k * 16, fb, 13));
  const meta = [['Document no: ', d.number, fm], ['Revision: ', revLabel(r), fb], ['Status: ', r.status, fb], [r.effective ? 'Effective: ' : 'Date: ', fmt(r.effective || r.date), fb]];
  meta.forEach(([k, v, vf], n) => { const mx = M + c1 + c2 + 12, my = top - 22 - n * 16; text(k, mx, my, fr, 8.5, ink2); text(v, mx + fr.widthOfTextAtSize(k, 8.5), my, vf, 8.5); });
  // ---- Details row
  let y = y0 - 30; const colW = CW / 4;
  [['CATEGORY', d.category], ['APPLIES TO', d.site === 'ALL' ? 'All sites' : site(d.site).name], ['OWNER', pname(d.owner)], ['AUTHOR', pname(r.author)]].forEach(([k, v], n) => {
    text(k, M + n * colW, y, fb, 7.5, muted); wrap(v, fr, 10, colW - 10).slice(0, 2).forEach((t, q) => text(t, M + n * colW, y - 15 - q * 12, fr, 10, ink2));
  });
  y -= 52;
  text('CHANGE SUMMARY', M, y, fb, 7.5, muted); y -= 15;
  wrap(r.notes || '—', fr, 10, CW).forEach(t => { text(t, M, y, fr, 10, ink2); y -= 13; });
  // ---- Approval table
  if ((r.route || []).length) {
    y -= 14; text('APPROVAL', M, y, fb, 7.5, muted); y -= 10;
    const cols = [0.36, 0.26, 0.22, 0.16].map(w => w * CW), rh = 20, rows = [['Step', 'Approver', 'Decision', 'Date']].concat(r.route.map(st => [`${st.step}. ${st.label}`, pname(st.person), st.status === 'Current' ? 'Awaiting decision' : st.status, st.ts ? fmt(st.ts) : '—']));
    rows.forEach((row, ri) => {
      const ry = y - rh; if (ri === 0) page.drawRectangle({ x: M, y: ry, width: CW, height: rh, color: rgb(0.96, 0.97, 0.98) });
      let cx = M; row.forEach((cell, ci) => { page.drawRectangle({ x: cx, y: ry, width: cols[ci], height: rh, borderColor: line, borderWidth: 0.6 }); let t = pdfText(cell); const sz = ri ? 9 : 8, font = ri ? fr : fb; while (font.widthOfTextAtSize(t, sz) > cols[ci] - 10 && t.length > 3) t = t.slice(0, -2); text(t, cx + 6, ry + 7, font, sz, ink); cx += cols[ci]; });
      y = ry;
    });
  }
  // ---- Note
  y -= 20;
  const note = wrap(`Sample sheet generated from the document record. The demo data has no file content for ${f.name}${iss && iss !== r ? `; the controlled version in use is ${revLabel(iss)}` : ''}. Documents you upload are downloaded in full, with the stamp on every page.`, fr, 9, CW - 24);
  const nh = note.length * 12 + 14;
  page.drawRectangle({ x: M, y: y - nh, width: CW, height: nh, color: rgb(0.92, 0.95, 1), borderColor: rgb(0.7, 0.8, 0.96), borderWidth: 0.6 });
  note.forEach((t, k) => text(t, M + 12, y - 16 - k * 12, fr, 9, ink2));
}
async function stampedDocPdf(d, r, f) {
  const { PDFDocument, StandardFonts, rgb } = await ensurePdfLib();
  const st = downloadStamp(d, r), kind = fileKind(f.type, f.name);
  let blob = null;
  if (f.blobId && !f.seeded) { try { if (FILE_PENDING[f.blobId]) await FILE_PENDING[f.blobId]; blob = await idbGet(f.blobId); } catch (e) { /* treated as a demo record below */ } }
  let pdf;
  if (blob && kind === 'pdf') {
    pdf = await PDFDocument.load(new Uint8Array(await blob.arrayBuffer()), { ignoreEncryption: true });
  } else if (blob && kind === 'image') {
    pdf = await PDFDocument.create(); const page = pdf.addPage([595.28, 841.89]);
    const bytes = new Uint8Array(await blob.arrayBuffer()), img = /png/i.test(blob.type || f.name) ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    const k = Math.min((595.28 - 60) / img.width, (841.89 - 90) / img.height, 1);
    page.drawImage(img, { x: (595.28 - img.width * k) / 2, y: 841.89 - 50 - img.height * k, width: img.width * k, height: img.height * k });
  } else {
    // Demo record without a real file: the same sheet that "Open document" shows, laid out on an A4 page
    pdf = await PDFDocument.create(); await drawSampleSheet(pdf, d, r, f, PDFLib);
  }
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  pdf.getPages().forEach(pg => drawStamp(pg, st, font, rgb));
  pdf.setTitle(`${d.number} ${revLabel(r)} — ${st.draft ? 'DRAFT' : 'UNCONTROLLED'} copy`); pdf.setProducer('VDW HSEQ Management System');
  return { blob: new Blob([await pdf.save()], { type: 'application/pdf' }), st };
}
ACT.downloadDocFile = async (el) => {
  const d = byId('documents', el.dataset.id), ri = el.dataset.ri != null ? +el.dataset.ri : d.revisions.length - 1, r = d.revisions[ri], f = r.file;
  if (!f) { toast('No file is attached to this revision yet.', 'error'); return; }
  const kind = fileKind(f.type, f.name), base = `${d.number}_${revLabel(r).replace(/\s+/g, '')}`, draft = r.status !== 'Issued for Use';
  if (kind === 'other' && f.blobId && !f.seeded) {
    // Word, Excel and similar cannot carry a stamp: the name says so, and the download is recorded
    confirmBox('Download without stamp', `${esc(f.name)} is not a PDF or image, so the control stamp cannot be added. It will download as an <b>${draft ? 'uncontrolled draft' : 'uncontrolled copy'}</b> and the download is recorded. For a stamped copy, upload the issued document as a PDF.`, 'Download', async () => {
      let blob = null; try { blob = await idbGet(f.blobId); } catch (e) { /* below */ }
      if (!blob) { toast('The file content is not available in this browser.', 'error'); return; }
      const ext = (f.name.match(/\.[^.]+$/) || [''])[0];
      if (await saveFile(`${base}_${draft ? 'DRAFT' : 'UNCONTROLLED'}${ext}`, blob)) { r.history.push({ ts: nowTs(), by: S.ui.user, action: `Downloaded without stamp (${f.name}), file name marked ${draft ? 'DRAFT' : 'UNCONTROLLED'}`, comment: '' }); log(`Downloaded ${d.number} ${revLabel(r)} (unstamped ${ext})`, '#/documents/' + d.id); save(); }
    });
    return;
  }
  try {
    toast('Preparing the stamped copy…', 'info');
    const { blob, st } = await stampedDocPdf(d, r, f);
    if (await saveFile(`${base}_${st.draft ? 'DRAFT' : 'UNCONTROLLED'}.pdf`, blob)) {
      r.history.push({ ts: nowTs(), by: S.ui.user, action: st.draft ? 'Draft downloaded (stamped DRAFT — NOT FOR USE)' : 'Copy downloaded (stamped UNCONTROLLED WHEN PRINTED)', comment: '' });
      log(`Downloaded a stamped copy of ${d.number} ${revLabel(r)}`, '#/documents/' + d.id); save(); toast('Stamped copy downloaded.'); rerender();
    }
  } catch (e) { console.warn(e); toast('The stamped copy could not be made from this file. Make sure it is a valid PDF or image.', 'error'); }
};
