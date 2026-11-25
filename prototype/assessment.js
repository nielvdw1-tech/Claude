/* VDW Multi-Branch Compliance Check: step flow, scoring and results. */
(function () {
  'use strict';

  var DATA = window.ASSESSMENT;
  if (!DATA) return;

  var CHOICES = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'na', label: 'Not applicable' }
  ];

  // Same risk bands as the original assessment
  function band(score) {
    if (score < 50) return { label: 'High Risk', key: 'bad', sub: 'Immediate action required',
      summary: 'Your answers show serious compliance gaps. If a client audited you or an inspector visited today, these gaps could lead to failed audits, lost contracts, enforcement action and personal liability for leadership.' };
    if (score < 80) return { label: 'Moderate Risk', key: 'warn', sub: 'Action recommended',
      summary: 'Some safety measures are in place, but important gaps remain, often because branches aren\'t working to one standard. These gaps could cause a failed client audit or an inspection finding.' };
    return { label: 'Lower Risk', key: 'ok', sub: 'Full audit still recommended',
      summary: 'You have a reasonable baseline in place. This screening can\'t confirm full legal compliance at every branch, though. Hidden gaps usually only show up in a formal on-site audit.' };
  }

  var answers = {};
  var company = {};
  var contact = {};

  // ---------- Build the question steps ----------
  var holder = document.getElementById('questionSteps');
  DATA.sections.forEach(function (sec, sIndex) {
    var qs = DATA.questions.filter(function (q) { return q.section === sec.id; });
    var html = '<section class="card assess-card" data-step="section-' + sec.id + '" aria-labelledby="sec-' + sec.id + '-title" hidden>' +
      '<p class="eyebrow">Section ' + (sIndex + 1) + ' of ' + DATA.sections.length + '</p>' +
      '<h2 id="sec-' + sec.id + '-title" class="assess-step-title">' + sec.title + '</h2>' +
      '<p class="assess-lead">' + sec.intro + '</p>' +
      '<form class="assess-form" novalidate data-section="' + sec.id + '">';
    qs.forEach(function (q, i) {
      html += '<fieldset class="question" id="q-' + q.id + '">' +
        '<legend><span class="q-num">' + (i + 1) + '.</span> ' + q.text + '</legend>' +
        '<div class="choice-row">';
      CHOICES.forEach(function (c) {
        html += '<label class="choice choice-' + c.value + '"><input type="radio" name="q' + q.id + '" value="' + c.value + '" required><span>' + c.label + '</span></label>';
      });
      html += '</div></fieldset>';
    });
    html += '<p class="form-error" role="alert" hidden>Please answer every question to continue.</p>' +
      '<div class="assess-nav"><button class="btn btn-outline" type="button" data-back>&larr; Back</button>' +
      '<button class="btn btn-primary" type="submit">Continue &rarr;</button></div></form></section>';
    holder.insertAdjacentHTML('beforeend', html);
  });

  // ---------- Step navigation ----------
  var steps = Array.prototype.slice.call(document.querySelectorAll('[data-step]'));
  var current = 0;
  var progress = document.getElementById('progress');
  var countedSteps = steps.length - 1; // everything except results

  function show(index) {
    current = index;
    steps.forEach(function (el, i) { el.hidden = i !== index; });
    var name = steps[index].getAttribute('data-step');
    var inFlow = name !== 'results';
    progress.hidden = !inFlow;
    if (inFlow) {
      document.getElementById('progressLabel').textContent = 'Step ' + (index + 1) + ' of ' + countedSteps;
      var title = steps[index].querySelector('.assess-step-title');
      document.getElementById('progressSection').textContent = title ? title.textContent : '';
      document.getElementById('progressFill').style.width = Math.round(index / countedSteps * 100) + '%';
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    var heading = steps[index].querySelector('h1, h2');
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-next]')) show(current + 1);
    if (e.target.closest('[data-back]')) show(current - 1);
  });

  // Company step
  document.getElementById('companyForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    var audits = f.querySelector('input[name="clientAudits"]:checked');
    var err = document.getElementById('companyError');
    if (!f.branches.value || !f.employees.value || !f.industry.value || !audits) { err.hidden = false; return; }
    err.hidden = true;
    company = { branches: f.branches.value, employees: f.employees.value, industry: f.industry.value, clientAudits: audits.value };
    show(current + 1);
  });

  // Question steps
  holder.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    var firstMissing = null;
    f.querySelectorAll('fieldset.question').forEach(function (fs) {
      var checked = fs.querySelector('input:checked');
      fs.classList.toggle('is-missing', !checked);
      if (checked) answers[fs.id.slice(2)] = checked.value;
      else if (!firstMissing) firstMissing = fs;
    });
    var err = f.querySelector('.form-error');
    if (firstMissing) {
      err.hidden = false;
      firstMissing.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstMissing.querySelector('input').focus({ preventScroll: true });
      return;
    }
    err.hidden = true;
    show(current + 1);
  });
  holder.addEventListener('change', function (e) {
    var fs = e.target.closest('fieldset.question');
    if (fs) fs.classList.remove('is-missing');
  });

  // Contact step
  document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    var err = document.getElementById('contactError');
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim());
    if (!f.fullName.value.trim() || !f.company.value.trim() || !f.phone.value.trim() || !f.email.value.trim()) {
      err.textContent = 'Please fill in your name, company, phone number and email.'; err.hidden = false; return;
    }
    if (!emailOk) { err.textContent = 'Please check your email address. It should look like name@company.co.za.'; err.hidden = false; return; }
    if (!f.consent.checked) { err.textContent = 'Please tick the box so we can send you your results.'; err.hidden = false; return; }
    err.hidden = true;
    contact = { fullName: f.fullName.value.trim(), role: f.role.value.trim(), company: f.company.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim() };
    var result = score();
    renderResults(result);
    submitResults(result);
    show(current + 1);
  });

  document.getElementById('restart').addEventListener('click', function () {
    answers = {};
    document.querySelectorAll('form').forEach(function (f) { f.reset(); });
    show(0);
  });

  // ---------- Scoring ----------
  function pct(list) {
    var answered = list.filter(function (q) { return answers[q.id] !== 'na'; });
    if (!answered.length) return null;
    var yes = answered.filter(function (q) { return answers[q.id] === 'yes'; }).length;
    return Math.round(yes / answered.length * 100);
  }

  function score() {
    var all = DATA.questions;
    var bySection = DATA.sections.map(function (s) {
      return { section: s, score: pct(all.filter(function (q) { return q.section === s.id; })) };
    });
    var overall = pct(all) || 0;
    return {
      overall: overall,
      band: band(overall),
      audit: pct(all.filter(function (q) { return q.section === 'S'; })),
      legal: pct(all.filter(function (q) { return q.section !== 'S'; })),
      sections: bySection,
      gaps: all.filter(function (q) { return answers[q.id] === 'no'; })
    };
  }

  // ---------- Results ----------
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function fmt(n) { return n === null ? 'N/A' : n + '%'; }
  function barClass(n) { return n === null ? '' : n < 50 ? ' bad' : n < 80 ? ' warn' : ''; }

  function renderResults(r) {
    var ring = document.getElementById('scoreRing');
    ring.className = 'score-big score-' + r.band.key;
    ring.style.setProperty('--p', r.overall);
    ring.setAttribute('aria-label', 'Overall score ' + r.overall + ' percent, ' + r.band.label);
    document.getElementById('scoreNum').textContent = r.overall + '%';
    document.getElementById('resultsFor').textContent = 'Results for ' + contact.company + ' · ' + company.branches + (company.branches === '1' ? ' branch' : ' branches');
    document.getElementById('resultsTitle').textContent = r.band.label + ': ' + r.band.sub;
    document.getElementById('resultsSummary').textContent = r.band.summary;
    document.getElementById('auditScore').textContent = fmt(r.audit);
    document.getElementById('legalScore').textContent = fmt(r.legal);

    document.getElementById('sectionBars').innerHTML = r.sections.map(function (s) {
      var w = s.score === null ? 0 : s.score;
      return '<li><span>' + esc(s.section.title) + '</span><span class="branch-bar' + barClass(s.score) + '"><i style="width:' + w + '%"></i></span><b>' + fmt(s.score) + '</b></li>';
    }).join('');

    var gapTitle = document.getElementById('gapsTitle');
    var list = document.getElementById('gapList');
    if (!r.gaps.length) {
      gapTitle.textContent = 'No gaps found in this check';
      list.innerHTML = '<p>You answered Yes or Not applicable to every question. A formal on-site audit is still the only way to confirm compliance at every branch.</p>';
      return;
    }
    gapTitle.textContent = 'Your ' + r.gaps.length + ' compliance gap' + (r.gaps.length === 1 ? '' : 's');
    list.innerHTML = DATA.sections.map(function (s) {
      var gaps = r.gaps.filter(function (q) { return q.section === s.id; });
      if (!gaps.length) return '';
      return '<h3 class="gap-group">' + esc(s.gap) + '</h3>' + gaps.map(function (q) {
        return '<article class="gap">' +
          '<h4>' + esc(q.missing) + '</h4>' +
          '<p class="gap-ref">' + esc(q.reference) + '</p>' +
          '<p><strong>Why it matters:</strong> ' + esc(q.why) + '</p>' +
          '<p><strong>How to fix it:</strong> ' + esc(q.fix) + '</p>' +
          '</article>';
      }).join('');
    }).join('');
  }

  // ---------- Sending results ----------
  // Each completed check is posted to the Vercel function /api/compliance-check, which emails a full
  // report to VDW and a copy to the visitor. Sending happens in the background: the visitor only sees
  // their results. A failed attempt is retried a few times.
  function pctText(n) { return n === null ? 'N/A' : n + '%'; }

  function submitResults(r) {
    var data = {
      bot_field: (document.querySelector('#contactForm [name="bot_field"]') || {}).value || '',
      submitted_at: new Date().toISOString(),
      full_name: contact.fullName,
      role: contact.role,
      company: contact.company,
      phone: contact.phone,
      email: contact.email,
      branches: company.branches,
      employees: company.employees,
      industry: company.industry,
      client_audits: company.clientAudits,
      score: r.overall,
      risk_level: r.band.label,
      risk_sub: r.band.sub,
      risk_summary: r.band.summary,
      audit_readiness: pctText(r.audit),
      legal_compliance: pctText(r.legal),
      sections: r.sections.map(function (s) { return { title: s.section.title, score: s.score }; }),
      gap_list: r.gaps.map(function (q) {
        var sec = DATA.sections.filter(function (s) { return s.id === q.section; })[0];
        return { area: sec ? sec.gap : '', gap: q.missing, reference: q.reference, why: q.why, fix: q.fix };
      }),
      answers: DATA.questions.map(function (q) { return q.id + ': ' + (answers[q.id] || '-'); }).join(', '),
      consent: 'yes'
    };
    if (!window.fetch || location.protocol === 'file:') return;
    // Build the PDF report first (it looks like the results page), then send everything.
    makePdf(r).then(function (pdf) {
      if (pdf) data.pdf_base64 = pdf;
    }).catch(function () {}).then(function () { post(data); });
  }

  function post(data) {
    var attempt = 0;
    (function send() {
      attempt++;
      fetch('/api/compliance-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (res.status >= 500 && attempt < 3) setTimeout(send, attempt * 2000);
      }).catch(function () {
        if (attempt < 3) setTimeout(send, attempt * 2000);
      });
    })();
  }

  // ---------- PDF report ----------
  // Turns a copy of the results page into an A4 PDF in the browser (html2pdf.js, in /vendor).
  function loadPdfLibrary() {
    return new Promise(function (resolve, reject) {
      if (window.html2pdf) return resolve(window.html2pdf);
      var s = document.createElement('script');
      s.src = 'vendor/html2pdf.bundle.min.js';
      s.onload = function () { resolve(window.html2pdf); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function buildPdfElement(r) {
    var results = document.querySelector('[data-step="results"]');
    var wrap = document.createElement('div');
    wrap.className = 'pdf-report';
    var date = new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
    wrap.innerHTML =
      '<div class="pdf-head"><img src="assets/vdw-logo.png" alt="VDW Health and Safety Solutions">' +
      '<div><strong>Multi-Branch Compliance Check report</strong><span>' + esc(contact.company) + ' &middot; ' + esc(date) + '</span></div></div>' +
      '<div class="pdf-meta">Prepared for ' + esc(contact.fullName) + (contact.role ? ', ' + esc(contact.role) : '') +
      ' &middot; ' + esc(company.branches) + (company.branches === '1' ? ' branch' : ' branches') + ' &middot; ' + esc(company.employees) + ' employees</div>';
    ['.results-head', '.results-scores', '.card:has(#sectionBars)', '.card:has(#gapList)'].forEach(function (sel) {
      var el = results.querySelector(sel);
      if (el) wrap.appendChild(el.cloneNode(true));
    });
    // Gap list starts on its own page; keep each area heading together with its first gap
    var gapsCard = wrap.querySelector('#gapList') && wrap.querySelector('#gapList').closest('.card');
    if (gapsCard) {
      gapsCard.classList.add('pdf-gaps');
      var brk = document.createElement('div');
      brk.className = 'html2pdf__page-break';
      gapsCard.parentNode.insertBefore(brk, gapsCard);
      gapsCard.querySelectorAll('.gap-group').forEach(function (h) {
        var next = h.nextElementSibling;
        var keep = document.createElement('div');
        keep.className = 'pdf-keep';
        h.parentNode.insertBefore(keep, h);
        keep.appendChild(h);
        if (next && next.classList.contains('gap')) keep.appendChild(next);
      });
      var title = gapsCard.querySelector('#gapsTitle');
      var firstKeep = gapsCard.querySelector('.pdf-keep');
      if (title && firstKeep) firstKeep.insertBefore(title, firstKeep.firstChild);
    }
    // html2canvas can't draw the conic-gradient score ring, so use a plain ring of the same colour
    var ring = wrap.querySelector('.score-big');
    if (ring) {
      ring.removeAttribute('style');
      ring.classList.add('pdf-ring');
      ring.style.borderColor = r.overall < 50 ? '#d64545' : r.overall < 80 ? '#f39219' : '#1f9d55';
    }
    var foot = document.createElement('div');
    foot.className = 'pdf-foot';
    foot.innerHTML = '<p><strong>Next step:</strong> book a free 30-minute consultation to go through these gaps and what they mean for your next client audit: <strong>' + location.host + '/book.html</strong></p>' +
      '<p>VDW Health &amp; Safety Solutions &middot; niel@vdwsafety.com &middot; 072 843 8094</p>' +
      '<p class="pdf-small">This report is a screening based on the answers given. It doesn&rsquo;t confirm full legal compliance; hidden gaps often only show up in a formal on-site audit.</p>';
    wrap.appendChild(foot);
    var holder = document.createElement('div');
    holder.className = 'pdf-holder';
    holder.appendChild(wrap);
    document.body.appendChild(holder);
    return holder;
  }

  function makePdf(r) {
    return loadPdfLibrary().then(function (html2pdf) {
      var holder = buildPdfElement(r);
      var opts = {
        margin: [10, 10, 12, 10],
        image: { type: 'jpeg', quality: 0.9 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollX: 0, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.pdf-keep', '.gap', '.results-head', '.sub-score', '.section-bars li', '.pdf-foot'] }
      };
      return html2pdf().set(opts).from(holder.firstChild).outputPdf('datauristring').then(function (uri) {
        holder.remove();
        return uri.split(',')[1];
      }, function (err) { holder.remove(); throw err; });
    });
  }

  // The check opens at the first step; its Back button returns to the landing page
  show(0);
})();
