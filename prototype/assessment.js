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
  var countedSteps = steps.length - 2; // everything except intro and results

  function show(index) {
    current = index;
    steps.forEach(function (el, i) { el.hidden = i !== index; });
    var name = steps[index].getAttribute('data-step');
    var inFlow = name !== 'intro' && name !== 'results';
    progress.hidden = !inFlow;
    if (inFlow) {
      document.getElementById('progressLabel').textContent = 'Step ' + index + ' of ' + countedSteps;
      var title = steps[index].querySelector('.assess-step-title');
      document.getElementById('progressSection').textContent = title ? title.textContent : '';
      document.getElementById('progressFill').style.width = Math.round((index - 1) / countedSteps * 100) + '%';
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
  // TODO: connect this to VDW's lead system (for example a Supabase table or an email service)
  // so that VDW receives each completed check and the visitor gets their results by email.
  function submitResults(r) {
    var payload = {
      submittedAt: new Date().toISOString(),
      contact: contact,
      company: company,
      score: r.overall,
      riskLevel: r.band.label,
      auditReadiness: r.audit,
      legalCompliance: r.legal,
      gaps: r.gaps.map(function (q) { return { id: q.id, gap: q.missing, reference: q.reference }; }),
      answers: answers
    };
    if (window.console) console.info('Compliance check completed (not sent yet: no backend connected)', payload);
    return payload;
  }

  show(0);
})();
