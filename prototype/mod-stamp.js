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
    // Demo record without a real file: a stamped summary sheet built from the record
    pdf = await PDFDocument.create(); const page = pdf.addPage([595.28, 841.89]), fb = await pdf.embedFont(StandardFonts.HelveticaBold), fr = await pdf.embedFont(StandardFonts.Helvetica);
    let y = 780; const line = (t, font = fr, size = 10.5, gap = 16) => { page.drawText(pdfText(t), { x: 56, y, size, font, color: rgb(0.1, 0.1, 0.15), maxWidth: 480 }); y -= gap; };
    line(orgOf(d.org).name, fb, 9, 22); line(d.title, fb, 17, 26);
    line(`Document no: ${d.number}    Revision: ${revLabel(r)}    Status: ${r.status}`); line(`Category: ${d.category}    Owner: ${pname(d.owner)}`);
    line(`${r.effective ? 'Effective' : 'Date'}: ${fmt(r.effective || r.date)}    Next review: ${fmt(d.nextReview)}`, fr, 10.5, 28);
    if (r.notes) { line('Change summary', fb, 11, 16); line(r.notes, fr, 10.5, 28); }
    if ((r.route || []).length) { line('Approval route', fb, 11, 16); r.route.forEach(s => line(`Step ${s.step}: ${s.label} — ${pname(s.person)} — ${s.status}${s.ts ? ' (' + fmtTs(s.ts) + ')' : ''}`)); }
    y -= 12; line('Demonstration record: the real document file is attached in the live system.', fr, 9, 14);
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
