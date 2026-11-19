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
// buttons to send their results by WhatsApp or email instead, so no lead is lost.

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
    score: clean(body.score, 10),
    riskLevel: clean(body.risk_level, 40),
    auditReadiness: clean(body.audit_readiness, 10),
    legalCompliance: clean(body.legal_compliance, 10),
    gaps: clean(body.gaps, LIMITS.long),
    answers: clean(body.answers, LIMITS.long),
    consent: clean(body.consent, 10)
  };

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

  const gapLines = f.gaps ? f.gaps.split('\n').filter(Boolean) : [];
  const row = (k, v) => `<tr><td style="padding:4px 12px 4px 0;color:#5a6068">${k}</td><td style="padding:4px 0"><strong>${esc(v || '-')}</strong></td></tr>`;
  const gapsHtml = gapLines.length
    ? '<ul style="padding-left:18px">' + gapLines.map(g => `<li>${esc(g.replace(/^- /, ''))}</li>`).join('') + '</ul>'
    : '<p>No gaps found.</p>';

  const leadHtml = `
    <h2 style="font-family:Arial,sans-serif;color:#1f2429">New Multi-Branch Compliance Check</h2>
    <table style="font-family:Arial,sans-serif;font-size:14px">
      ${row('Name', f.fullName + (f.role ? ' (' + f.role + ')' : ''))}
      ${row('Company', f.company)}
      ${row('Phone', f.phone)}
      ${row('Email', f.email)}
      ${row('Branches', f.branches)}
      ${row('Employees', f.employees)}
      ${row('Type', f.industry)}
      ${row('Client audits', f.clientAudits)}
      ${row('Score', f.score + ' (' + f.riskLevel + ')')}
      ${row('Audit readiness', f.auditReadiness)}
      ${row('Legal compliance', f.legalCompliance)}
    </table>
    <h3 style="font-family:Arial,sans-serif">Gaps (${gapLines.length})</h3>
    <div style="font-family:Arial,sans-serif;font-size:14px">${gapsHtml}</div>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#5a6068">Answers: ${esc(f.answers)}</p>`;

  const visitorHtml = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#1f2429;max-width:600px">
      <p>Hi ${esc(f.fullName.split(' ')[0])},</p>
      <p>Thank you for completing the Multi-Branch Compliance Check. Here are your results for <strong>${esc(f.company)}</strong>.</p>
      <table style="font-size:15px">
        ${row('Overall score', f.score + ' (' + f.riskLevel + ')')}
        ${row('Audit readiness', f.auditReadiness)}
        ${row('Legal compliance', f.legalCompliance)}
      </table>
      <h3>Your compliance gaps (${gapLines.length})</h3>
      ${gapsHtml}
      <p>Would you like to talk through what these mean for your next client audit? Reply to this email, or call or WhatsApp Niel on 072 843 8094.</p>
      <p style="font-size:12px;color:#5a6068">This check is a screening based on your answers and doesn't confirm full legal compliance.<br>
      VDW Health &amp; Safety Solutions &middot; niel@vdwsafety.com &middot; 072 843 8094</p>
    </div>`;

  try {
    await sendEmail(apiKey, {
      from,
      to: [to],
      reply_to: f.email,
      subject: `Compliance check: ${f.company} – ${f.score} (${f.riskLevel})`,
      html: leadHtml
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
        subject: 'Your Multi-Branch Compliance Check results',
        html: visitorHtml
      });
    } catch (e) {
      // The lead already reached VDW, so don't show the visitor an error
      console.error('compliance-check: visitor copy failed', e.message);
    }
  }

  return res.status(200).json({ ok: true });
};
