// Website images of the VDW Compliance Control System (fictional demonstration data).
// Composes the screenshots in src/ into framed images on a brand background.
// Run: node compose.js   → images in ./images (PNG) — then python3 webp.py for WebP copies.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const SRC = '';   // the page is written next to the screenshots in src/
const OUT = path.join(__dirname, 'images'); fs.mkdirSync(OUT, { recursive: true });

const css = `
*{box-sizing:border-box;margin:0;padding:0} html,body{width:100%;height:100%}
body{font-family:Inter,Arial,sans-serif;overflow:hidden;position:relative}
.light{background:radial-gradient(70% 90% at 85% 10%,#d9e7fd 0%,rgba(217,231,253,0) 60%),radial-gradient(60% 70% at 5% 100%,#ffe9d4 0%,rgba(255,233,212,0) 55%),linear-gradient(160deg,#f7f9fd 0%,#eef3fb 100%)}
.dark{background:radial-gradient(90% 80% at 100% 100%,#1a6fe0 0%,rgba(26,111,224,0) 60%),linear-gradient(160deg,#081634 0%,#0b1f4b 50%,#0d3279 100%)}
.win{position:absolute;border-radius:14px;overflow:hidden;background:#fff;border:1px solid rgba(15,35,80,.12);box-shadow:0 30px 70px rgba(11,31,75,.22),0 6px 16px rgba(11,31,75,.10)}
.dark .win{border-color:rgba(255,255,255,.18);box-shadow:0 40px 90px rgba(0,0,0,.5)}
.bar{height:30px;background:#edf1f7;border-bottom:1px solid #dfe5ee;display:flex;align-items:center;gap:8px;padding-left:16px}
.bar i{width:11px;height:11px;border-radius:50%;background:#cdd5e1;display:block} .bar i:nth-child(1){background:#f3a09a}.bar i:nth-child(2){background:#f5cf7d}.bar i:nth-child(3){background:#9fd8a8}
.bar span{margin-left:14px;flex:0 1 46%;height:16px;border-radius:8px;background:#fff;border:1px solid #e1e6ee}
.win .view{overflow:hidden} .win .view img{width:100%;display:block}
.phone{position:absolute;border:12px solid #0c1429;border-radius:44px;overflow:hidden;background:#fff;box-shadow:0 30px 70px rgba(11,31,75,.35)}
.phone img{width:100%;display:block}
.card{position:absolute;border-radius:12px;overflow:hidden;background:#fff;border:1px solid rgba(15,35,80,.10);box-shadow:0 24px 60px rgba(11,31,75,.20)}
.card img{width:100%;display:block}
.dot{position:absolute;border-radius:50%;filter:blur(2px)}
`;
const win = (img, { x, y, w, h, pos = 'top left' }) => `<div class="win" style="left:${x}px;top:${y}px;width:${w}px"><div class="bar"><i></i><i></i><i></i><span></span></div><div class="view" style="height:${h}px"><img src="${SRC}${img}" style="height:100%;object-fit:cover;object-position:${pos}"></div></div>`;
const phone = (img, { x, y, w, h }) => `<div class="phone" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><img src="${SRC}${img}" style="height:100%;object-fit:cover;object-position:top"></div>`;
const card = (img, { x, y, w }) => `<div class="card" style="left:${x}px;top:${y}px;width:${w}px"><img src="${SRC}${img}"></div>`;

// W×H in CSS pixels, rendered at 1.5× → final pixels
const IMAGES = [
  ['01_hero_dashboard_and_phone', 1600, 900, 'dark', win('dashboard.png', { x: 360, y: 110, w: 1180, h: 700 }) + phone('phone_home.png', { x: 120, y: 150, w: 330, h: 690 })],
  ['02_legal_library_official_wording', 1600, 1200, 'light', win('c_regulation.png', { x: 110, y: 110, w: 1380, h: 980 })],
  ['03_live_legal_register_evidence', 1600, 1200, 'light', win('c_library.png', { x: 90, y: 90, w: 1080, h: 720 }) + card('x_evidence.png', { x: 600, y: 640, w: 900 }) + card('x_gap.png', { x: 420, y: 930, w: 1080 })],
  ['04_control_score_dashboard', 1600, 1200, 'light', card('x_score.png', { x: 130, y: 110, w: 1340 })],
  ['05_document_control_and_attendance', 1600, 1200, 'light', win('c_document.png', { x: 90, y: 90, w: 1100, h: 820 }) + card('x_attendance.png', { x: 700, y: 560, w: 820 })],
  ['06_risk_assessment_workflow', 1600, 1200, 'light', win('c_risk.png', { x: 90, y: 90, w: 1120, h: 820 }) + win('c_hazardmodal.png', { x: 900, y: 330, w: 620, h: 780 })],
  ['07_assets_and_qr_inspections', 1600, 1200, 'light', win('c_assets.png', { x: 90, y: 150, w: 1150, h: 880 }) + phone('phone_qr.png', { x: 1120, y: 200, w: 380, h: 800 })],
  ['08_corrective_actions', 1600, 1200, 'light', win('c_actions.png', { x: 110, y: 110, w: 1380, h: 980 })],
  ['09_incident_management', 1600, 1200, 'light', win('c_incidents.png', { x: 110, y: 110, w: 1380, h: 980 })],
  ['10_audits', 1600, 1200, 'light', win('c_audits.png', { x: 110, y: 110, w: 1380, h: 980 })],
  ['11_contractors_upload_link', 1600, 1200, 'light', win('c_contractor.png', { x: 90, y: 150, w: 1150, h: 880 }) + phone('phone_contractor.png', { x: 1120, y: 200, w: 380, h: 800 })],
  ['12_training_matrix', 1600, 1200, 'light', win('c_training.png', { x: 110, y: 110, w: 1380, h: 980 })],
  ['13_employee_phone_app', 1600, 1200, 'light', phone('phone_home.png', { x: 160, y: 170, w: 400, h: 860 }) + phone('phone_qr.png', { x: 600, y: 120, w: 400, h: 860 }) + phone('phone_talks.png', { x: 1040, y: 170, w: 400, h: 860 })],
  ['14_management_reports', 1600, 1200, 'light', win('c_reports.png', { x: 110, y: 110, w: 1380, h: 980 })],
];

(async () => {
  const b = await chromium.launch();
  for (const [name, W, H, theme, body] of IMAGES) {
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1.5 });
    const f = path.join(__dirname, 'src', '_page.html');
    fs.writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body class="${theme}">${body}</body></html>`);
    await p.goto('file://' + f, { waitUntil: 'load' }); await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(OUT, name + '.png') });
    await p.close(); console.log(name);
  }
  await b.close(); fs.unlinkSync(path.join(__dirname, 'src', '_page.html'));
})();
