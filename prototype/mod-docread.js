/* ==========================================================================
   Reading a document's own header on upload
   --------------------------------------------------------------------------
   Most controlled documents already carry a header with the company logo,
   document number, title and revision. When a PDF is chosen, the top of its
   first page is read (PDF.js text layer) to fill in the form, and anything in
   the header that does not match the record — a different number, title or
   revision — is shown and must be confirmed before the document is saved.
   Scanned PDFs without a text layer, Word and Excel files cannot be read:
   then nothing is filled in and nothing is checked.
   ========================================================================== */
'use strict';

const normKey = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const normWords = s => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2);

/* Read number, title and revision from the top of page 1 of a PDF. Returns null when there is no readable text. */
async function readPdfHeader(file) {
  const lib = await ensurePdfJs();
  const pdf = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false }).promise;
  const pg = await pdf.getPage(1), vp = pg.getViewport({ scale: 1 }), tc = await pg.getTextContent();
  const items = tc.items.filter(it => it.str && it.str.trim()).map(it => ({ s: it.str.trim(), x: it.transform[4], y: it.transform[5], w: it.width || 0, size: Math.hypot(it.transform[2], it.transform[3]) || it.height || 10 }));
  if (!items.length) return null;
  const top = items.filter(it => it.y > vp.height * 0.68);   // the header area: top third of the page
  if (!top.length) return null;
  // Group into lines (same baseline), then split each line into blocks: headers are often tables, so a
  // wide gap or a change of text size starts a new block (e.g. the title cell and the revision cell)
  const rows = [];
  top.sort((a, b) => b.y - a.y || a.x - b.x).forEach(it => { const r = rows.find(R => Math.abs(R.y - it.y) < 2.5); if (r) r.parts.push(it); else rows.push({ y: it.y, parts: [it] }); });
  const lines = [];
  rows.forEach(r => {
    let cur = null;
    r.parts.sort((a, b) => a.x - b.x).forEach(it => {
      const gap = cur ? it.x - cur.end : 0;
      if (!cur || gap > Math.max(cur.size, it.size) * 2.5 || Math.abs(it.size - cur.size) > 2) { cur = { y: r.y, size: it.size, parts: [], end: 0 }; lines.push(cur); }
      cur.parts.push(it); cur.size = Math.max(cur.size, it.size); cur.end = it.x + (it.w || it.s.length * it.size * 0.5);
    });
  });
  lines.forEach(l => { l.text = l.parts.map(p => p.s).join(' ').replace(/\s+/g, ' ').trim(); });
  const all = lines.map(l => l.text).join('\n');
  const numM = all.match(/(?:doc(?:ument)?\.?\s*(?:no|nr|number|ref)\.?|reference(?:\s*no\.?)?)\s*[:#]?\s*([A-Z0-9][A-Z0-9\/._-]{2,})/i) || all.match(/\b([A-Z]{2,6}(?:-[A-Z0-9]{2,6}){1,3})\b/);
  const revM = all.match(/\brev(?:ision)?\.?\s*(?:no\.?|nr\.?|number)?\s*[:#]?\s*(\d{1,3})\b/i);
  const labelled = /^(doc(ument)?\.?\s*(no|nr|number|ref)|rev(ision)?|date|effective|page|status|approved|prepared|owner|issue)/i;
  // Title: the largest text in the header that is not a label line, the number or the company name line
  const cands = lines.filter(l => !labelled.test(l.text) && !(numM && l.text.includes(numM[1]) && l.text.length < numM[1].length + 6) && /[a-z]/i.test(l.text) && l.text.length >= 4);
  let title = '';
  if (cands.length) {
    const big = Math.max(...cands.map(l => l.size)), heads = cands.filter(l => l.size >= big - 0.5).sort((a, b) => b.y - a.y);
    title = heads.map(l => l.text).join(' ').slice(0, 140);
  }
  return { number: numM ? numM[1].replace(/[.,;:]$/, '') : '', rev: revM ? +revM[1] : null, title };
}

/* Differences between what the file's header says and what the record will say */
function headerDiffs(h, e) {
  const out = [];
  if (!h) return out;
  if (h.number && e.number && normKey(h.number) !== normKey(e.number)) out.push(`The file's header says document number <b>${esc(h.number)}</b>; the record says <b>${esc(e.number)}</b>.`);
  if (h.rev != null && e.rev != null && +h.rev !== +e.rev) out.push(`The file's header says <b>Rev ${h.rev}</b>; the system will record it as <b>Rev ${e.rev}</b>.`);
  if (h.title && e.title) {
    const a = normWords(h.title), b = new Set(normWords(e.title)), common = a.filter(w => b.has(w)).length;
    if (a.length && b.size && common / Math.min(a.length, b.size) < 0.6) out.push(`The file's header title is <b>${esc(h.title)}</b>; the record's title is <b>${esc(e.title)}</b>.`);
  }
  return out;
}

/* Wire the check into an upload modal. expect() returns { number, title, rev } as the record will have them;
   autofill(header) may fill empty fields. Returns { problems(), acknowledged(), header() }. */
function wireHeaderCheck(m, { expect, autofill }) {
  const inp = m.querySelector('[name=file]'); if (!inp) return null;
  const box = document.createElement('div'); box.className = 'field full hdr-check'; inp.closest('.field').after(box);
  const st = { h: null, ack: false, reading: false };
  const render = () => {
    if (st.reading) { box.innerHTML = `<div class="muted">${icon('clock', 'sm')} Reading the document's header…</div>`; return; }
    if (!st.h) { box.innerHTML = ''; return; }
    const d = headerDiffs(st.h, expect()), found = [st.h.number && `number <b>${esc(st.h.number)}</b>`, st.h.title && `title <b>${esc(st.h.title)}</b>`, st.h.rev != null && `<b>Rev ${st.h.rev}</b>`].filter(Boolean);
    box.innerHTML = `<div class="alert ${d.length ? 'warn' : 'success'}" style="margin:0">${icon(d.length ? 'alert' : 'checkCircle')}<div>
      <div>Read from the file's header: ${found.join(' · ') || 'nothing recognisable'}.</div>
      ${d.length ? `<ul class="hdr-diffs">${d.map(x => `<li>${x}</li>`).join('')}</ul><label class="check"><input type="checkbox" class="hdr-ack" ${st.ack ? 'checked' : ''}> <span>The header does not match — save anyway</span></label>` : '<div>It matches the record.</div>'}
    </div></div>`;
    const ack = box.querySelector('.hdr-ack'); if (ack) ack.addEventListener('change', () => { st.ack = ack.checked; box.querySelector('.field-err') && box.querySelector('.field-err').remove(); });
  };
  inp.addEventListener('change', async () => {
    st.h = null; st.ack = false; const f = inp.files[0];
    if (!f || fileKind(f.type, f.name) !== 'pdf') { render(); return; }
    st.reading = true; render();
    try { st.h = await readPdfHeader(f); if (st.h && autofill) autofill(st.h); } catch (e) { st.h = null; }
    st.reading = false; render();
  });
  m.addEventListener('input', e => { if (['number', 'title', 'startRev'].includes(e.target.name) && st.h) { st.ack = false; render(); } });
  return { problems: () => headerDiffs(st.h, expect()), acknowledged: () => st.ack, header: () => st.h, box };
}
// Shared save-time guard: false (and a visible reason) while differences are not confirmed
function headerCheckOk(hc) {
  if (!hc || !hc.problems().length || hc.acknowledged()) return true;
  if (!hc.box.querySelector('.field-err')) hc.box.insertAdjacentHTML('beforeend', '<div class="field-err err">Confirm that you want to save although the header does not match, or correct the details.</div>');
  hc.box.scrollIntoView({ behavior: 'smooth', block: 'center' }); return false;
}
function headerHistory(hc, rev) {
  if (!hc || !hc.header()) return;
  const h = hc.header(); rev.fileHeader = h;
  const p = hc.problems();
  rev.history.push({ ts: nowTs(), by: S.ui.user, action: p.length ? 'Saved although the file header does not match the record' : 'File header checked: matches the record', comment: [h.number && 'Number ' + h.number, h.title && 'Title ' + h.title, h.rev != null && 'Rev ' + h.rev].filter(Boolean).join(' · ') });
}
