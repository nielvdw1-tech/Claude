"""Builds system.html (the VDW Compliance Control System page).

It reuses the header and footer of a generated service page, so run it after build_services.py:
    python3 tools/build_services.py . && python3 tools/build_system.py .
Content follows the VDW Compliance Control System product overview. Screenshots live in
assets/screenshots/overview/ (fictional demonstration data); swap files there to update them.
"""
import json, os, re, sys

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
SHOTS = os.path.join(OUT, 'assets', 'screenshots', 'overview')
DIMS = json.load(open(os.path.join(SHOTS, 'dims.json')))

src = open(os.path.join(OUT, 'gap-audit.html')).read()
head = src[:src.index('<body>') + len('<body>')]
head = re.sub(r'<title>.*?</title>', '<title>VDW Compliance Control System | VDW Health &amp; Safety Solutions</title>', head, flags=re.S)
head = re.sub(r'<meta name="description" content="[^"]*">',
              '<meta name="description" content="The VDW Compliance Control System: know exactly what the OHS Act requires of your company, prove that you comply, and stay compliant at every branch. Legal register, documents, risk, equipment, incidents, audits and contractors in one system.">', head)
head = re.sub(r'<link rel="preload" as="image"[^>]*>\n', '', head)
header = src[src.index('<a class="skip-link"'):src.index('<main')]
header = header.replace(' aria-current="page"', '').replace('href="#faq"', 'href="index.html#faq"')
header = header.replace('<li><a href="system.html">', '<li><a href="system.html" aria-current="page">')
footer = src[src.index('<div class="back-services-bar">') if '<div class="back-services-bar">' in src else src.index('<footer'):]
footer = footer[footer.index('<footer'):]

TAG = ('<span class="shot-tag">Example from the <span class="tag-long">VDW Compliance Control System</span>'
       '<span class="tag-short">VDW system</span></span>')


def img(name, alt, cls='', eager=False):
    w, h = DIMS[name]
    c = f' class="{cls}"' if cls else ''
    load = 'eager' if eager else 'lazy'
    return f'<img{c} src="assets/screenshots/overview/{name}.webp" alt="{alt}" width="{w}" height="{h}" loading="{load}">'


def shot(name, alt, extra='', cls=''):
    return f'<figure class="feature-visual shot-visual{extra}">\n          {TAG}\n          {img(name, alt, cls)}\n        </figure>'


def ticks(items):
    return '\n'.join(f'            <li>{i}</li>' for i in items)


def feature(eyebrow, title, body, visual, points=None, reverse=False, extra=''):
    pts = f'\n          <ul class="tick-list small sys-points">\n{ticks(points)}\n          </ul>' if points else ''
    copy = f'''<div class="feature-copy">
          <p class="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{body}</p>{pts}{extra}
        </div>'''
    inner = f'{copy}\n        {visual}' if reverse else f'{visual}\n        {copy}'
    return f'''
  <section class="section feature">
    <div class="container feature-grid{' reverse' if reverse else ''}">
        {inner}
    </div>
  </section>'''


compare = [
    ('Requirements live in someone&rsquo;s head, a file or a spreadsheet.', 'Every applicable requirement is in one register, next to the official wording of the law.'),
    ('Certificates, appointments and training expire unnoticed.', 'Due dates become tasks, reminders and escalations, before anything lapses.'),
    ('Findings from inspections, audits and incidents are written down, then forgotten.', 'Every finding becomes a corrective action with an owner, a due date, evidence and independent verification.'),
    ('Signed paper registers go missing.', 'People read, acknowledge and sign on their phones; attendance registers print with the signatures.'),
    ('Proof is gathered in a rush when an inspector or client auditor arrives.', 'Evidence is linked to the requirement as the work is done, and gaps are flagged on their own.'),
    ('Management sees the real position only after something goes wrong.', 'A live control score per branch shows where you stand and what needs attention.'),
]
compare_rows = '\n'.join(f'''          <tr><td><span class="sys-x" aria-hidden="true">&times;</span> {a}</td><td><span class="sys-tick" aria-hidden="true">&#10003;</span> {b}</td></tr>''' for a, b in compare)

loop = [
    ('1', 'Identify', 'Your VDW consultant picks the Act and the regulations that apply to your company and ticks the sections that apply. No generic questionnaire: a professional makes the call.'),
    ('2', 'Set up', 'For each requirement, the system proposes what <strong>shows</strong> compliance (documents, appointments, training, certificates, inspections) and what <strong>maintains</strong> it, and schedules it in the compliance calendar.'),
    ('3', 'Run', 'Day-to-day work happens in the system: inspections, risk assessments, incidents, training, contractors and corrective actions, on a computer or on a phone at the workplace.'),
    ('4', 'Prove', 'Records feed back into the requirements register as they happen. Each requirement shows its live evidence, gaps are flagged automatically, and the control score shows the position per branch.'),
]
loop_html = '\n'.join(f'''        <li class="card step sys-step"><span class="step-num">{n}</span><h3>{t}</h3><p>{b}</p></li>''' for n, t, b in loop)

people = [
    ('Legal appointments', 'Issued digitally; the employee reads, signs and accepts on their phone, or declines with a reason.'),
    ('Training', 'A training matrix by job, appointment or activity, with sessions, certificates and expiry reminders.'),
    ('Health &amp; Safety Talks', 'A library of talks; attendees sign on screen, and the register prints on demand.'),
    ('PPE', 'Requirements per job, issues signed by the employee, and replacement dates.'),
    ('Medical surveillance', 'Who needs which examination, fitness outcomes and restrictions. No clinical results are kept.'),
    ('Emergency', 'Plans and assembly points per branch, marshals and first aiders, drills held and planned.'),
    ('H&amp;S committee', 'Representatives, meetings, minutes and representatives&rsquo; inspections.'),
    ('Permits to work', 'Hot work, work at height, confined spaces, isolation and excavation: issued, extended and closed out.'),
    ('Hazardous substances', 'A register with safety data sheets, storage, PPE and the related risk assessment.'),
]
people_html = '\n'.join(f'''        <article class="card sys-mini"><h3>{t}</h3><p>{b}</p></article>''' for t, b in people)

roles = [
    ('Managing Director', 'The control score, legal compliance and key risks for the company and each branch; approves documents and changes; receives the monthly management report.'),
    ('HSEQ Manager', 'Runs the system: legal register and compliance calendar, documents, risk, audits, incidents, corrective actions, training, permits and contractors.'),
    ('Safety consultant (VDW)', 'Selects the applicable legislation, checks the legal wording, sets up the company, does audits and advises.'),
    ('Branch Manager', 'The branch&rsquo;s inspections, defects, incidents, corrective actions, contractors and emergency readiness.'),
    ('Supervisor', 'Inspections, Health &amp; Safety Talks, PPE issues and the team&rsquo;s tasks, from a computer or a phone.'),
    ('Employee', 'The phone app: scan and inspect, report incidents, read and sign documents, accept appointments and sign for PPE and talks.'),
]
roles_html = '\n'.join(f'''          <tr><th scope="row">{r}</th><td>{d}</td></tr>''' for r, d in roles)

start = [
    ('Set up', 'Company, branches and users, imported from Excel.'),
    ('Identify', 'Your VDW consultant selects the regulations that apply.'),
    ('Load', 'Documents, equipment, appointments and training records.'),
    ('Go live', 'Employees on their phones; the register fills itself.'),
]
start_html = '\n'.join(f'''        <li class="card step"><span class="step-num">{i}</span><h3>{t}</h3><p>{b}</p></li>''' for i, (t, b) in enumerate(start, 1))

main = f'''<main id="main">

  <!-- HERO -->
  <section class="hero sys-hero">
    <div class="container hero-grid">
      <div class="hero-copy">
        <h1 class="eyebrow">The system behind our managed service</h1>
        <p class="hero-title">VDW Compliance <span class="sys-accent">Control</span> System</p>
        <p class="lead">Know exactly what the law requires of your company. Prove that you comply. Stay compliant, every day, at every branch.</p>
        <p class="sys-law"><span aria-hidden="true"></span>Occupational Health and Safety Act 85 of 1993 and its regulations &middot; South Africa</p>
        <div class="hero-actions">
          <a class="btn btn-primary btn-lg" href="book.html">Book a Walk-Through</a>
          <a class="btn btn-outline-light btn-lg" href="free-assessment.html">Free Compliance Check</a>
        </div>
      </div>
      <figure class="sys-hero-visual">
        {img('hero-phone-dashboard', 'The VDW Compliance Control System on a phone and a computer: the employee home screen and the dashboard with the overall control score', eager=True)}
      </figure>
    </div>
  </section>

  <!-- WHY IT MATTERS -->
  <section class="section">
    <div class="container">
      <p class="eyebrow text-center">Why it matters</p>
      <h2 class="section-title">Compliance Is Easy to Lose Sight Of, Until a Client or Inspector Asks</h2>
      <p class="section-sub sys-sub">Most companies know they must comply with the OHS Act. The hard part is knowing <strong>exactly which regulations apply</strong>, <strong>what each one requires</strong>, and keeping the <strong>proof up to date</strong> while people, equipment and documents change every week.</p>
      <div class="sys-compare-wrap">
        <table class="sys-compare">
          <thead><tr><th scope="col">Without a system</th><th scope="col">With the VDW Compliance Control System</th></tr></thead>
          <tbody>
{compare_rows}
          </tbody>
        </table>
      </div>
      <div class="grid-2 sys-goals">
        <article class="sys-goal"><span class="sys-goal-tag">Goal 1</span><h3>Know what you need to comply with</h3><p>A competent person selects the Act, the regulations and the sub-regulations that apply to your company. The system shows them in the official wording and works out what is needed to show compliance.</p></article>
        <article class="sys-goal"><span class="sys-goal-tag">Goal 2</span><h3>Stay compliant over time</h3><p>Inspections, reviews, renewals, drills and training are scheduled and tracked. The daily work in the system feeds back into the compliance status, live.</p></article>
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section class="section section-grey" id="how-it-works">
    <div class="container">
      <p class="eyebrow text-center">How it works</p>
      <h2 class="section-title">One Loop: Identify, Set Up, Run, Prove</h2>
      <p class="section-sub">A professional decides what applies; the system turns that into work; the work produces the proof.</p>
      <ol class="sys-loop">
{loop_html}
      </ol>
      <div class="grid-3 sys-who">
        <article class="card"><h3>Your VDW consultant</h3><p>Selects the applicable legislation, checks the legal wording, sets up your company and reviews progress at each visit.</p></article>
        <article class="card"><h3>Your managers</h3><p>Run the system day to day: approve documents, plan inspections and audits, investigate incidents, close corrective actions.</p></article>
        <article class="card"><h3>Your employees</h3><p>Use their phones to inspect equipment, report incidents, read and sign documents, accept appointments and sign for PPE and talks.</p></article>
      </div>
      <figure class="sys-score">
        {img('control-score', 'The control score: an overall score built from separate scores for documents, assets and inspections, corrective actions, incidents, legal compliance and safety programmes')}
        <figcaption>The control score combines six areas (documents, assets &amp; inspections, corrective actions, incidents, legal compliance and safety programmes), each with its own weight. It is an indication calculated from your own records.</figcaption>
      </figure>
    </div>
  </section>
{feature('Legal requirements', 'The Law in Its Own Words, and What It Means for You, Kept Separate',
         'The legal library holds the OHS Act and its regulations as official wording, loaded from the official documents. Your consultant selects what applies; the system adds its interpretation, clearly labelled, next to the law and never in place of it.',
         shot('legal-library', 'The legal library showing the General Safety Regulations, 1986, with its source document and check against the original'),
         ['<strong>Official wording:</strong> 44 regulations and related documents, each checked against the original by a competent person before it is relied on.',
          '<strong>Select what applies:</strong> tick the regulations that apply to your company; amendments are shown on the regulation they change.',
          '<strong>System interpretation:</strong> what the company must do and the evidence that shows it, marked as interpretation, not legal text, and turned into compliance tasks.'])}
{feature('Requirements register', 'A Register That Keeps Itself Up to Date',
         'Records are linked to the legal requirement they support. Each requirement then shows its evidence live, and when evidence goes out of date the register says so before anyone has to look. A requirement with a gap counts as partially compliant until it&rsquo;s fixed, so the figure reflects reality.',
         shot('evidence-gap', 'A requirement linked to a procedure that is overdue for review, flagged as an evidence gap'),
         ['Policies, procedures and other controlled documents', 'Risk assessments and legal appointments', 'Training records, inspections, audits and emergency drills', 'Medical examinations and PPE issues'], reverse=True)}
{feature('Document control', 'Controlled Documents, Approved in Sequence and Read by the Right People',
         'Upload, approve in order, issue, read and sign, review. Only the issued revision is used: downloads are stamped and printed copies are marked uncontrolled.',
         shot('document-policy', 'An HSEQ policy issued for use, with its approval route and document details'),
         ['<strong>Approval routes</strong> per document category: several people, in a set order', '<strong>Read and acknowledge:</strong> the right roles or people read and sign on their phones', '<strong>Change requests</strong> from anyone who uses the document', '<strong>Periodic review</strong> with reminders and escalation when it is overdue', '<strong>Attendance registers on demand</strong> for any document, training session or talk, with signatures, as a PDF'])}
{feature('Risk management', 'Risk Assessments Done in the Right Order, and Controls That Actually Get Done',
         'Each hazard is assessed in one form, step by step: hazard, risk, consequence, rating before controls, the hierarchy of controls, and rating after controls. Only a complete assessment can be signed off, and every new control is followed through to evidence that it is in place.',
         shot('risk-assessment', 'Assessing a hazard step by step: reversing delivery trucks in the yard'),
         ['The assessor and team sign on screen or phone; a manager accepts the residual risks', 'Controls become corrective actions with evidence and independent verification', 'A hazard register and a configurable risk matrix that escalates high and critical risks', 'When an incident is closed, the system asks whether the risk assessment must be reviewed'], reverse=True)}
{feature('Equipment and corrective actions', 'Equipment That Is Inspected, and Fixed',
         'Every piece of equipment has its required certificates, an inspection schedule and a QR label. A failed check never disappears: it becomes a defect and a corrective action that someone else verifies.',
         f'<figure class="feature-visual shot-visual shot-combo">\n          {TAG}\n          {img("asset-register", "The assets and equipment register with certificates, inspections due and equipment out of service", "shot-back-wide")}\n          {img("asset-phone", "Scanning a forklift QR label on a phone: safe to use, documents current", "shot-phone shot-front-phone")}\n        </figure>',
         ['Controlled checklists per type of equipment, done on the phone, also without signal', 'Inspection calendar, overdue alerts, maintenance by date, hours or kilometres', 'A critical failure takes the equipment out of service until the fix is verified', 'One corrective action register for every module, with owner, due date, evidence and escalation'])}
{feature('Incidents and audits', 'Learn From Every Incident. Check the System With Audits.',
         'Incidents are reported from a phone with photos, investigated with signed witness statements and a guided 5 Whys root cause, and closed only when the corrective actions are done. Audits use ready-made or your own checklists, with scoring, findings and a PDF report.',
         f'<figure class="feature-visual shot-visual sys-pair">\n          {TAG}\n          {img("incidents", "Incidents and injuries dashboard with incident trends and lost-time injury figures")}\n          {img("audits", "The audit programme per branch with due dates and average scores")}\n        </figure>',
         ['Injury classification set by the company; shifts lost and LTIFR from hours worked', 'A tracker for external reporting, and incident costs', 'Audit checklists for legal compliance, housekeeping, fire safety, hazardous chemicals, stacking and storage, emergency preparedness, PPE, or your own', 'Audit items can be linked to legal requirements'], reverse=True)}

  <!-- PEOPLE AND CONTRACTORS -->
  <section class="section section-grey">
    <div class="container">
      <p class="eyebrow text-center">People and contractors</p>
      <h2 class="section-title">The Right People: Appointed, Trained, Protected and Cleared to Work</h2>
      <div class="grid-3 sys-minis">
{people_html}
      </div>
      <div class="card sys-contractors">
        <div class="sys-contractors-copy">
          <h3>Contractors upload their own documents</h3>
          <p>Choose the documents each contractor must provide, then share a private upload link. The contractor uploads everything (no account needed) and lists the people who will work on site.</p>
          <ol class="sys-numbered">
            <li><strong>Choose the documents</strong>, ticked for you from the kind of work.</li>
            <li><strong>Share the link</strong>, valid for 30 days and e-mailed to the contractor.</li>
            <li><strong>Review each document</strong>: approve it, or reject it with a reason the contractor sees.</li>
            <li><strong>Cleared to start work</strong> when everything is approved, until a document expires.</li>
          </ol>
        </div>
        <figure class="shot-visual shot-phones sys-contractor-phone">
          {TAG}
          {img('contractor-phone', 'A contractor uploading the documents required before starting work, on a phone', 'shot-phone shot-phone-solo')}
        </figure>
      </div>
    </div>
  </section>

  <!-- ON THE FLOOR AND IN THE OFFICE -->
  <section class="section">
    <div class="container">
      <p class="eyebrow text-center">On the floor and in the office</p>
      <h2 class="section-title">Built for the People Who Do the Work, and Those Who Answer for It</h2>
      <p class="section-sub">Employees use their phones; managers and consultants see the whole picture. Everyone sees only what their role needs, for their own branch.</p>
      <figure class="sys-phones">
        {TAG}
        {img('three-phones', 'Three phone screens: the employee home screen, scanning equipment, and Health and Safety Talks to sign')}
      </figure>
      <div class="grid-2 sys-lists">
        <div class="card"><h3>For employees</h3><ul class="tick-list small">
            <li>Works on any phone and installs like an app</li>
            <li>Inspections also without signal</li>
            <li>Field screens in English, Afrikaans and isiZulu</li>
            <li>Sign documents, appointments, PPE and talks on screen</li></ul></div>
        <div class="card"><h3>For managers</h3><ul class="tick-list small">
            <li>A dashboard per role, with the control score per branch</li>
            <li>A monthly management report as a PDF</li>
            <li>Reports for every module, to PDF or Excel (CSV)</li>
            <li>Records lock once submitted, with a tamper-evident audit trail</li></ul></div>
      </div>
    </div>
  </section>

  <!-- ROLES -->
  <section class="section section-grey">
    <div class="container">
      <p class="eyebrow text-center">Who uses it</p>
      <h2 class="section-title">The Right View for Every Role</h2>
      <div class="sys-roles-wrap">
        <table class="sys-roles">
          <tbody>
{roles_html}
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- GETTING STARTED -->
  <section class="section">
    <div class="container">
      <p class="eyebrow text-center">Getting started</p>
      <h2 class="section-title">Live in Four Steps</h2>
      <p class="section-sub">We do the set-up with you as part of Compliance System Onboarding.</p>
      <ol class="grid-2 steps sys-start">
{start_html}
      </ol>
      <div class="center-cta"><a class="btn btn-primary" href="safety-file.html">See How Onboarding Works</a></div>
    </div>
  </section>

  <!-- FINAL CTA -->
  <section class="section bg-photo" data-bg="assets/photos/truck-leaving-hd.webp" id="contact">
    <div class="container narrow text-center">
      <h2 class="section-title">See It With Your Own Company</h2>
      <p class="section-lead">Book a walk-through of the VDW Compliance Control System with your own branches, legislation and documents.</p>
      <div class="hero-actions sys-cta">
        <a class="btn btn-primary btn-lg" href="book.html">Book a Walk-Through</a>
        <a class="btn btn-outline-light btn-lg" href="free-assessment.html">Free Compliance Check</a>
      </div>
      <p class="sys-small">The VDW Compliance Control System helps a company identify, manage and evidence its compliance with the Occupational Health and Safety Act and its regulations. It does not by itself guarantee legal compliance: the employer remains responsible for its statutory duties, and applicability and compliance are decided by a competent person. Screens show fictional demonstration data.</p>
    </div>
  </section>

</main>

'''

open(os.path.join(OUT, 'system.html'), 'w').write(head + '\n\n' + header + main + footer)
print('wrote system.html')
