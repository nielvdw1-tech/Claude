/* ==========================================================================
   QR codes: real, printable labels and scanning
   --------------------------------------------------------------------------
   • Each asset's QR code is a real, scannable code holding a link to the
     asset's QR page (…#/qr/AS-002), so any phone camera can read it.
   • Labels print as a sheet (small or large), with the company logo, tag,
     asset name and code.
   • "Scan asset QR code" uses the phone or laptop camera. Where the camera
     cannot be used, the person takes a photo of the label instead, and the
     code is read from the photo. Choosing from a list stays for demos.
   Libraries: vendor/qr (qrcode.js MIT; jsQR Apache-2.0), no network needed.
   ========================================================================== */
'use strict';

function assetQrPayload(a) { return location.href.split('#')[0] + '#/qr/' + a.id; }
// Find the asset a scanned text points to: the link on our labels, the asset's QR code, its tag or its id
function assetFromScan(text) {
  const t = String(text || '').trim(); if (!t) return null;
  const m = t.match(/#\/qr\/([A-Za-z0-9-]+)/); if (m) return byId('assets', m[1]) || null;
  const up = t.toUpperCase();
  return S.assets.find(x => (x.qr || '').toUpperCase() === up || x.tag.toUpperCase() === up || x.id === up) || null;
}
function assetQrSvg(a) { return qrSvg(assetQrPayload(a), `${a.tag} — ${a.name}`); }

/* ---------------- Label sheet ---------------- */
const LABEL_SIZES = { small: { name: 'Small (50 × 30 mm)', cls: 'lbl-s' }, large: { name: 'Large (70 × 50 mm)', cls: 'lbl-l' } };
ROUTES.labels = (p, q) => {
  const all = scoped('assets').filter(a => a.status !== 'Decommissioned').sort((x, y) => x.tag.localeCompare(y.tag));
  const pick = q.ids ? q.ids.split(',') : all.map(a => a.id), size = LABEL_SIZES[q.size] ? q.size : 'large';
  const chosen = all.filter(a => pick.includes(a.id));
  const html = `<div class="no-print">${pageHead('QR labels', 'Print labels and stick them on the assets. Scanning a label opens the asset to inspect it or report an incident.', '', scopePill())}
    <div class="card mb"><div class="card-body" style="padding-top:14px">
      <div class="form-grid">${fld({ name: 'lsize', label: 'Label size', type: 'select', options: opts(Object.keys(LABEL_SIZES).map(k => ({ value: k, label: LABEL_SIZES[k].name })), size) })}<div class="field"><label>&nbsp;</label><div class="btn-row"><button class="btn primary" data-act="print">${icon('print', 'sm')} Print labels (${chosen.length})</button><button class="btn sm" data-act="lblAll" data-v="1">Select all</button><button class="btn sm" data-act="lblAll" data-v="0">Clear</button></div></div></div>
      <div class="lbl-pick">${all.map(a => `<label class="check"><input type="checkbox" data-lbl="${a.id}" ${pick.includes(a.id) ? 'checked' : ''}> <span><b>${esc(a.tag)}</b> ${esc(a.name)}</span></label>`).join('')}</div>
      <p class="muted mt-s">Print at 100% scale (no "fit to page"). Use weatherproof label stock outdoors.</p>
    </div></div></div>
    <div class="lbl-sheet ${LABEL_SIZES[size].cls}">${chosen.map(a => { const org = orgOf(a.org || siteOrgOf(a.site)); return `<div class="lbl"><div class="lbl-qr">${assetQrSvg(a)}</div><div class="lbl-txt"><div class="lbl-org">${orgMark(org, 'lblorg')}<span>${esc(org.short)}</span></div><b class="lbl-tag">${esc(a.tag)}</b><span class="lbl-name">${esc(a.name)}</span><span class="lbl-cta">Scan to inspect or report</span><span class="lbl-code mono">${esc(a.qr)}</span></div></div>`; }).join('') || '<p class="muted">Choose at least one asset.</p>'}</div>`;
  return { title: 'QR labels', nav: 'assets', crumbs: [['Assets & equipment', '#/assets'], ['QR labels', '#']], html, after: () => {
    const go = () => { const ids = [...document.querySelectorAll('[data-lbl]')].filter(c => c.checked).map(c => c.dataset.lbl); navigate(`#/labels?size=${document.querySelector('[name=lsize]').value}&ids=${ids.join(',') || 'none'}`); };
    document.querySelectorAll('[data-lbl]').forEach(c => c.addEventListener('change', go));
    document.querySelector('[name=lsize]').addEventListener('change', go);
  } };
};
ACT.lblAll = (el) => { document.querySelectorAll('[data-lbl]').forEach(c => { c.checked = el.dataset.v === '1'; }); document.querySelector('[data-lbl]') && document.querySelector('[data-lbl]').dispatchEvent(new Event('change')); };

/* ---------------- Reading QR codes ---------------- */
let JSQR_READY = null;
function ensureJsQR() { if (window.jsQR) return Promise.resolve(window.jsQR); if (!JSQR_READY) JSQR_READY = loadScript('vendor/qr/jsQR.js').then(() => window.jsQR).catch(e => { JSQR_READY = null; throw e; }); return JSQR_READY; }
// Decode a QR code from an image, video frame or canvas source. Uses the browser's own reader when it has one.
async function decodeQr(source, w, h) {
  if ('BarcodeDetector' in window) { try { const d = new window.BarcodeDetector({ formats: ['qr_code'] }); const r = await d.detect(source); if (r && r[0]) return r[0].rawValue; } catch (e) { /* fall back to jsQR */ } }
  const jsQR = await ensureJsQR();
  const c = document.createElement('canvas'), k = Math.min(1, 1000 / Math.max(w, h)); c.width = Math.round(w * k); c.height = Math.round(h * k);
  const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(source, 0, 0, c.width, c.height);
  const img = g.getImageData(0, 0, c.width, c.height), r = jsQR(img.data, img.width, img.height, { inversionAttempts: 'attemptBoth' });
  return r ? r.data : null;
}
async function decodeQrFile(file) {
  const url = URL.createObjectURL(file);
  try { const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; }); return await decodeQr(img, img.naturalWidth, img.naturalHeight); }
  finally { URL.revokeObjectURL(url); }
}
function openScanned(text) {
  const a = assetFromScan(text);
  if (!a) { toast('That QR code is not an asset label from this system.', 'error'); return false; }
  if ((a.org || siteOrgOf(a.site)) !== S.ui.org) { toast('That asset belongs to another organisation.', 'error'); return false; }
  stopScanCamera(); document.querySelectorAll('.modal-back').forEach(m => m.remove());
  log(`Scanned the QR code of ${a.tag}`, '#/qr/' + a.id); save(); navigate('#/qr/' + a.id); return true;
}

/* ---------------- Scan dialog: camera first, photo as fallback ---------------- */
const SCAN = { stream: null, busy: false };
function stopScanCamera() { if (SCAN.stream) { SCAN.stream.getTracks().forEach(t => t.stop()); SCAN.stream = null; } }
async function startScanCamera(m) {
  const v = m.querySelector('#scanVideo'), msg = m.querySelector('#scanMsg');
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { msg.innerHTML = `${icon('info', 'sm')} This browser cannot use the camera here. Take a photo of the label instead.`; return; }
  try {
    SCAN.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    v.srcObject = SCAN.stream; await v.play(); m.querySelector('.scan-cam').classList.add('live'); msg.textContent = 'Point the camera at the QR label.';
    const tick = async () => {
      if (!SCAN.stream || !document.body.contains(v)) { stopScanCamera(); return; }   // dialog closed
      if (!SCAN.busy && v.readyState >= 2 && v.videoWidth) { SCAN.busy = true; try { const t = await decodeQr(v, v.videoWidth, v.videoHeight); if (t && openScanned(t)) return; } catch (e) { /* keep trying */ } SCAN.busy = false; }
      setTimeout(tick, 250);
    };
    tick();
  } catch (e) {
    msg.innerHTML = `${icon('info', 'sm')} The camera is not available${e && e.name === 'NotAllowedError' ? ' (permission was not given)' : ''}. Take a photo of the label instead.`;
  }
}
ACT.qrScan = () => openModal({ title: 'Scan asset QR code', sub: 'Point the camera at the QR label on the asset.', size: 'narrow',
  body: `<div class="scan-cam"><video id="scanVideo" playsinline muted></video><div class="scan-frame"></div></div>
    <p id="scanMsg" class="muted scan-msg">Starting the camera…</p>
    <div class="btn-row"><label class="btn"><input class="vh" type="file" accept="image/*" capture="environment" id="scanPhoto">${icon('camera', 'sm')} Take a photo of the label</label></div>
    <details class="mt"><summary class="muted">No label? Type the code or choose the asset</summary><div class="form-grid mt-s">${fld({ name: 'code', label: 'QR code / tag', placeholder: 'e.g. VDW-QR-AS-002 or FL-02' })}${fld({ name: 'pick', label: 'Or choose an asset', type: 'select', options: opts(scoped('assets').map(a => ({ value: a.id, label: `${a.tag} — ${a.name}` })), '', '— Select —') })}</div></details>`,
  onOpen: m => {
    startScanCamera(m);
    m.querySelector('#scanPhoto').addEventListener('change', async e => {
      const f = e.target.files[0]; if (!f) return; const msg = m.querySelector('#scanMsg'); msg.textContent = 'Reading the photo…';
      try { const t = await decodeQrFile(f); if (!t) msg.innerHTML = `${icon('alert', 'sm')} No QR code found in the photo. Hold the phone closer, keep it steady and try again.`; else openScanned(t); }
      catch (err) { msg.textContent = 'The photo could not be read. Try again.'; }
      e.target.value = '';
    });
  },
  buttons: [{ label: 'Open asset', cls: 'primary', onClick: m => {
    const v = readForm(m), a = v.pick ? byId('assets', v.pick) : assetFromScan(v.code);
    if (!a) { toast('No asset matches that code.', 'error'); return false; }
    stopScanCamera(); navigate('#/qr/' + a.id);
  } }] });
