// Vercel serverless function: receives a completed Multi-Branch Compliance Check
// and emails it to VDW, plus a copy of the results to the visitor.
//
// Environment variables (Vercel > Project > Settings > Environment Variables):
//   RESEND_API_KEY      required. API key from resend.com
//   FROM_EMAIL          required. Sender on a domain verified in Resend,
//                       e.g. "VDW Health & Safety Solutions <check@vdwsafety.com>"
//   LEAD_TO_EMAIL       optional. Where leads go (default niel@vdwsafety.com)
//   SEND_VISITOR_COPY   optional. Set to "false" to stop emailing visitors their copy
//
// If anything fails, the function returns an error and the page shows the visitor
// retries a few times in the background.

const LIMITS = { short: 120, long: 4000 };

function clean(value, max) {
  return String(value == null ? '' : value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function sendEmail(apiKey, message) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
  if (!res.ok) throw new Error('Resend ' + res.status + ': ' + (await res.text()).slice(0, 200));
}


// ---------- Email report (inline styles and tables, so it renders in Outlook and Gmail) ----------
const C = { blue: '#0b78a8', blueLight: '#e8f6fc', orange: '#f39219', charcoal: '#1f2429', muted: '#5a6068', border: '#d9dbde', grey: '#eeeff1', ok: '#1f9d55', warn: '#d97c06', bad: '#d64545' };
const FONT = 'font-family:Arial,Helvetica,sans-serif;';
const bandColour = s => (s === null ? C.muted : s < 50 ? C.bad : s < 80 ? C.warn : C.ok);

function bar(score) {
  const w = score === null ? 0 : score;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>
    <td width="${Math.max(w, 1)}%" style="background:${bandColour(score)};height:10px;font-size:0;line-height:0">&nbsp;</td>
    <td style="background:#e6e8ea;height:10px;font-size:0;line-height:0">&nbsp;</td></tr></table>`;
}

function buildReport({ f, sections, gaps, site, forVdw, hasPdf }) {
  const date = new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Johannesburg' });
  const col = bandColour(f.score);
  const kv = (k, v) => `<tr><td style="${FONT}font-size:13px;color:${C.muted};padding:5px 14px 5px 0;white-space:nowrap">${k}</td><td style="${FONT}font-size:14px;color:${C.charcoal};padding:5px 0"><strong>${esc(v || '-')}</strong></td></tr>`;

  let areas = '';
  for (const s of sections) {
    areas += `<tr><td style="${FONT}font-size:14px;color:${C.charcoal};padding:7px 12px 7px 0;width:45%">${esc(s.title)}</td>
      <td style="padding:7px 12px 7px 0">${bar(s.score)}</td>
      <td style="${FONT}font-size:14px;font-weight:bold;color:${bandColour(s.score)};padding:7px 0;text-align:right;width:48px">${s.score === null ? 'N/A' : s.score + '%'}</td></tr>`;
  }

  let gapHtml = '';
  let lastArea = '';
  gaps.forEach((g, i) => {
    if (g.area && g.area !== lastArea) {
      gapHtml += `<tr><td style="${FONT}font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${C.warn};padding:18px 0 8px">${esc(g.area)}</td></tr>`;
      lastArea = g.area;
    }
    gapHtml += `<tr><td style="padding:0 0 10px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fafbfb;border-left:4px solid ${C.bad}">
        <tr><td style="padding:12px 14px">
          <div style="${FONT}font-size:15px;font-weight:bold;color:${C.charcoal}">${i + 1}. ${esc(g.gap)}</div>
          <div style="${FONT}font-size:12px;font-weight:bold;color:${C.blue};padding:3px 0 8px">${esc(g.reference)}</div>
          ${g.why ? `<div style="${FONT}font-size:13px;color:${C.muted};padding-bottom:6px"><strong style="color:${C.charcoal}">Why it matters:</strong> ${esc(g.why)}</div>` : ''}
          ${g.fix ? `<div style="${FONT}font-size:13px;color:${C.muted}"><strong style="color:${C.charcoal}">How to fix it:</strong> ${esc(g.fix)}</div>` : ''}
        </td></tr></table></td></tr>`;
  });
  if (!gaps.length) gapHtml = `<tr><td style="${FONT}font-size:14px;color:${C.muted}">No gaps were found from the answers given. A formal on-site audit is still the only way to confirm compliance at every branch.</td></tr>`;

  const intro = forVdw
    ? `<p style="${FONT}font-size:15px;color:${C.charcoal};margin:0 0 6px"><strong>New lead from the free compliance check.</strong>${hasPdf ? ' The PDF report they received is attached.' : ''} Reply to this email to answer ${esc(f.fullName.split(' ')[0])} directly.</p>`
    : `<p style="${FONT}font-size:15px;color:${C.charcoal};margin:0 0 10px">Hi ${esc(f.fullName.split(' ')[0])},</p>
       <p style="${FONT}font-size:15px;color:${C.charcoal};margin:0 0 6px">Thank you for completing the Multi-Branch Compliance Check. Here is your report for <strong>${esc(f.company)}</strong>${hasPdf ? '. <strong>Your full report is attached as a PDF</strong>, so you can save it or share it with your team' : ''}.</p>`;

  const contact = forVdw ? `
    <tr><td style="padding:22px 28px 0">
      <div style="${FONT}font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${C.blue};padding-bottom:6px">Contact &amp; company</div>
      <table role="presentation" cellpadding="0" cellspacing="0">
        ${kv('Name', f.fullName + (f.role ? ' (' + f.role + ')' : ''))}
        ${kv('Company', f.company)}
        ${kv('Phone', f.phone)}
        ${kv('Email', f.email)}
        ${kv('Branches', f.branches)}
        ${kv('Employees', f.employees)}
        ${kv('Type of company', f.industry)}
        ${kv('Client audits', f.clientAudits)}
      </table></td></tr>` : '';

  const nextStep = forVdw
    ? `<p style="${FONT}font-size:12px;color:${C.muted};margin:0">Answers: ${esc(f.answers)}</p>`
    : `<p style="${FONT}font-size:15px;color:${C.charcoal};margin:0 0 8px"><strong>What next?</strong> Book a free 15-minute consultation and we'll walk you through these gaps and what they mean for your next client audit.</p>
       <p style="margin:14px 0"><a href="${site}/book.html" style="${FONT}display:inline-block;background:${C.orange};color:${C.charcoal};font-weight:bold;font-size:15px;text-decoration:none;padding:12px 22px;border-radius:6px">Book a consultation</a></p>
       <p style="${FONT}font-size:14px;color:${C.muted};margin:0">Or reply to this email, or call Niel on <strong>072 843 8094</strong>.</p>`;

  return `<!doctype html><html><body style="margin:0;padding:0;background:${C.grey}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.grey};padding:24px 0"><tr><td align="center">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:640px;max-width:100%;background:#ffffff;border:1px solid ${C.border}">
  <tr><td style="padding:22px 28px;border-bottom:4px solid ${C.orange}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><img src="${site}/assets/vdw-logo.png" alt="VDW Health and Safety Solutions" width="150" style="display:block;width:150px;height:auto"></td>
      <td align="right" style="${FONT}font-size:12px;color:${C.muted}">Multi-Branch Compliance Check<br><strong style="color:${C.charcoal}">${date}</strong></td>
    </tr></table></td></tr>
  <tr><td style="padding:24px 28px 0">${intro}</td></tr>
  ${contact}
  <tr><td style="padding:22px 28px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px solid ${col}"><tr>
      <td width="150" align="center" style="padding:18px;background:${col}">
        <div style="${FONT}font-size:44px;font-weight:bold;color:#ffffff;line-height:1">${f.score}%</div>
        <div style="${FONT}font-size:12px;color:#ffffff;padding-top:4px">compliant</div></td>
      <td style="padding:16px 18px">
        <div style="${FONT}font-size:20px;font-weight:bold;color:${col}">${esc(f.riskLevel)}${f.riskSub ? ': ' + esc(f.riskSub) : ''}</div>
        <div style="${FONT}font-size:14px;color:${C.muted};padding-top:6px">${esc(f.riskSummary)}</div></td>
    </tr></table></td></tr>
  <tr><td style="padding:16px 28px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="50%" style="padding-right:6px"><table role="presentation" width="100%" style="background:${C.blueLight}"><tr><td style="padding:12px 14px">
        <div style="${FONT}font-size:13px;color:${C.muted}">Audit readiness</div><div style="${FONT}font-size:26px;font-weight:bold;color:${C.blue}">${esc(f.auditReadiness)}</div></td></tr></table></td>
      <td width="50%" style="padding-left:6px"><table role="presentation" width="100%" style="background:${C.blueLight}"><tr><td style="padding:12px 14px">
        <div style="${FONT}font-size:13px;color:${C.muted}">Legal compliance</div><div style="${FONT}font-size:26px;font-weight:bold;color:${C.blue}">${esc(f.legalCompliance)}</div></td></tr></table></td>
    </tr></table></td></tr>
  <tr><td style="padding:22px 28px 0">
    <div style="${FONT}font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${C.blue};padding-bottom:4px">Score by area</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${areas}</table></td></tr>
  <tr><td style="padding:22px 28px 0">
    <div style="${FONT}font-size:18px;font-weight:bold;color:${C.charcoal}">${gaps.length ? gaps.length + ' compliance gap' + (gaps.length === 1 ? '' : 's') : 'Compliance gaps'}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${gapHtml}</table></td></tr>
  <tr><td style="padding:20px 28px 24px">${nextStep}</td></tr>
  <tr><td style="padding:16px 28px;background:${C.charcoal}">
    <div style="${FONT}font-size:12px;color:#d3d8dd">This report is a screening based on the answers given. It doesn't confirm full legal compliance; hidden gaps often only show up in a formal on-site audit.</div>
    <div style="${FONT}font-size:12px;color:#ffffff;padding-top:8px"><strong>VDW Health &amp; Safety Solutions</strong> &middot; niel@vdwsafety.com &middot; 072 843 8094</div></td></tr>
</table></td></tr></table></body></html>`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { return res.status(400).json({ ok: false, error: 'Invalid request' }); }
  }

  // Spam trap: real visitors never fill this hidden field
  if (body.bot_field) return res.status(200).json({ ok: true });

  const f = {
    fullName: clean(body.full_name, LIMITS.short),
    role: clean(body.role, LIMITS.short),
    company: clean(body.company, LIMITS.short),
    phone: clean(body.phone, 40),
    email: clean(body.email, LIMITS.short),
    branches: clean(body.branches, 40),
    employees: clean(body.employees, 40),
    industry: clean(body.industry, LIMITS.short),
    clientAudits: clean(body.client_audits, 40),
    score: Math.max(0, Math.min(100, parseInt(body.score, 10) || 0)),
    riskLevel: clean(body.risk_level, 40),
    riskSub: clean(body.risk_sub, 80),
    riskSummary: clean(body.risk_summary, 600),
    auditReadiness: clean(body.audit_readiness, 10),
    legalCompliance: clean(body.legal_compliance, 10),
    answers: clean(body.answers, LIMITS.long),
    consent: clean(body.consent, 10)
  };
  const sections = (Array.isArray(body.sections) ? body.sections : []).slice(0, 10).map(s => ({
    title: clean(s && s.title, 80),
    score: s && s.score !== null && s.score !== undefined ? Math.max(0, Math.min(100, parseInt(s.score, 10) || 0)) : null
  }));
  const gaps = (Array.isArray(body.gap_list) ? body.gap_list : []).slice(0, 40).map(g => ({
    area: clean(g && g.area, 80), gap: clean(g && g.gap, 200), reference: clean(g && g.reference, 160),
    why: clean(g && g.why, 600), fix: clean(g && g.fix, 600)
  })).filter(g => g.gap);

  // PDF report built in the visitor's browser (base64). Limit about 3 MB, must be a real PDF.
  let pdf = typeof body.pdf_base64 === 'string' ? body.pdf_base64.replace(/\s/g, '') : '';
  if (pdf && (pdf.length > 4200000 || !/^JVBER/.test(pdf) || !/^[A-Za-z0-9+/=]+$/.test(pdf))) pdf = '';
  const pdfName = 'VDW-Compliance-Check-' + (f.company.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'Report') + '.pdf';
  const attachments = pdf ? [{ filename: pdfName, content: pdf }] : undefined;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email);
  if (!f.fullName || !f.company || !f.phone || !emailOk || f.consent !== 'yes') {
    return res.status(400).json({ ok: false, error: 'Missing or invalid details' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;
  if (!apiKey || !from) {
    console.error('compliance-check: RESEND_API_KEY or FROM_EMAIL is not set');
    return res.status(500).json({ ok: false, error: 'Email is not configured' });
  }
  const to = process.env.LEAD_TO_EMAIL || 'niel@vdwsafety.com';
  const site = (process.env.SITE_URL || ('https://' + (req.headers && req.headers.host || 'vdwsafety.com'))).replace(/\/$/, '');

  const html = buildReport({ f, sections, gaps, site, forVdw: true, hasPdf: !!pdf });
  const visitorHtml = buildReport({ f, sections, gaps, site, forVdw: false, hasPdf: !!pdf });

  try {
    await sendEmail(apiKey, {
      from,
      to: [to],
      reply_to: f.email,
      subject: `New compliance check: ${f.company} – ${f.score}% (${f.riskLevel})`,
      html,
      attachments
    });
  } catch (e) {
    console.error('compliance-check: lead email failed', e.message);
    return res.status(502).json({ ok: false, error: 'Could not send' });
  }

  if (process.env.SEND_VISITOR_COPY !== 'false') {
    try {
      await sendEmail(apiKey, {
        from,
        to: [f.email],
        reply_to: to,
        subject: `Your Multi-Branch Compliance Check report – ${f.company}`,
        html: visitorHtml,
        attachments
      });
    } catch (e) {
      // The lead already reached VDW, so don't show the visitor an error
      console.error('compliance-check: visitor copy failed', e.message);
    }
  }

  return res.status(200).json({ ok: true });
};
