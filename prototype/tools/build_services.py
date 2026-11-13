"""Generate the three VDW service pages for the prototype from one template."""
import sys, os

OUT = sys.argv[1]
ASSESS = "https://vdwassessment.zite.so"

ICONS = {
    "search": '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    "camera": '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    "list": '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
    "shield": '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    "folder": '<path d="M3 6h7l2 2h9v11H3z"/>',
    "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "chart": '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 15l3-3 3 2 4-5"/>',
    "people": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.4 0 4 1.6 4.5 4"/>',
    "doc": '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    "alert": '<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5v.5"/>',
    "brand": '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 15l2.5-6L13 15M9 13h3M15 9v6"/>',
    "calendar": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    "chat": '<path d="M4 5h16v11H9l-5 4z"/>',
    "fire": '<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 1 1 1.5 2 1.5 3 1-2 1.5-5 1.5-8z"/>',
    "hardhat": '<path d="M3 17h18M5 17v-3a7 7 0 0 1 14 0v3M10 7V5h4v2"/>',
    "warehouse": '<path d="M3 21V9l9-6 9 6v12"/><path d="M7 21v-8h10v8M7 17h10"/>',
    "gear": '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    "factory": '<path d="M3 21V11l5 3V11l5 3V7l8-4v18z"/>',
    "check": '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
    "pin": '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
}

def icon(name):
    return f'<svg viewBox="0 0 24 24">{ICONS[name]}</svg>'

def btn(label, href=ASSESS, cls="btn btn-primary"):
    ext = ' target="_blank" rel="noopener"' if href.startswith("http") else ""
    return f'<a class="{cls}" href="{href}"{ext}>{label}</a>'

SERVICES = [
    ("gap-audit.html", "Compliance Audits"),
    ("safety-file.html", "Compliance System"),
    ("compliance-management.html", "Ongoing Management"),
]

def header(current):
    cur = ' aria-current="page"'
    links = "".join(
        f'<li><a href="{f}"{cur if f == current else ""}>{n}</a></li>'
        for f, n in SERVICES)
    return f'''<header class="site-header" id="top">
  <div class="container header-inner">
    <a class="logo" href="index.html" aria-label="VDW Health and Safety Solutions home">
      <img src="assets/vdw-logo.png" alt="VDW Health and Safety Solutions" width="218" height="114">
    </a>
    <nav class="main-nav" id="main-nav" aria-label="Primary">
      <ul>
        <li><a href="index.html">Home</a></li>
        {links}
        <li><a href="#faq">FAQ</a></li>
      </ul>
    </nav>
    <div class="header-actions">
      <!-- TODO: replace with your real phone number -->
      <a class="header-phone" href="tel:+27120000000" aria-label="Call us on 012 000 0000">
        <span class="phone-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg></span>
        <span class="phone-number">012 000 0000</span>
      </a>
      <a class="btn btn-outline btn-sm header-cta" href="free-assessment.html">Free Compliance Check</a>
      <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="main-nav" aria-label="Toggle navigation menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>'''

FOOTER = '''<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <img src="assets/vdw-logo.png" alt="VDW Health and Safety Solutions" width="218" height="114">
      <p>One centralised health &amp; safety compliance system for every branch. Pretoria-based, working nationwide.</p>
    </div>
    <nav aria-label="Footer services">
      <h4>Services</h4>
      <ul>
        <li><a href="gap-audit.html">Multi-Branch Compliance Audit</a></li>
        <li><a href="safety-file.html">Centralised Compliance System</a></li>
        <li><a href="compliance-management.html">Ongoing Compliance Management</a></li>
        <li><a href="free-assessment.html">Free Compliance Check</a></li>
      </ul>
    </nav>
    <nav aria-label="Footer company">
      <h4>Company</h4>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="index.html#about">About</a></li>
        <li><a href="index.html#how-it-works">How It Works</a></li>
        <li><a href="index.html#areas">Areas We Serve</a></li>
      </ul>
    </nav>
    <div class="footer-contact">
      <h4>Get in Touch</h4>
      <p><a href="tel:+27120000000">012 000 0000</a></p>
      <p><a href="mailto:hello@vdwsafety.co.za">hello@vdwsafety.co.za</a></p>
      <p>Pretoria, South Africa &middot; Nationwide</p>
    </div>
  </div>
  <div class="container footer-bottom">
    <p>&copy; <span id="year"></span> VDW Health &amp; Safety Solutions. All rights reserved.</p>
  </div>
</footer>'''

def icon_visual(ic, chips):
    chip_html = "".join(f'<span class="iv-chip iv-chip-{i+1}">{c}</span>' for i, c in enumerate(chips))
    return f'''<div class="feature-visual icon-visual" aria-hidden="true">
        <span class="iv-icon">{icon(ic)}</span>{chip_html}
      </div>'''

def tick(items):
    return "".join(f"<li>{i}</li>" for i in items)

def page(fname, d):
    vps = ""
    for i, vp in enumerate(d["value_props"]):
        visual = icon_visual(vp["icon"], vp["chips"])
        copy = f'''<div class="feature-copy">
        <p class="eyebrow">{vp["eyebrow"]}</p>
        <h2>{vp["title"]}</h2>
        <p>{vp["body"]}</p>
        {btn(vp["cta"])}
      </div>'''
        rev = " reverse" if i == 1 else ""
        inner = (copy + visual) if i == 1 else (visual + copy)
        vps += f'''
  <section class="section feature">
    <div class="container feature-grid{rev}">
      {inner}
    </div>
  </section>'''

    stats = "".join(f'<div class="card stat-card"><b>{n}</b><span>{l}</span></div>' for n, l in d["stats"])
    industries = "".join(
        f'<article class="card area"><span class="area-pin" aria-hidden="true">{icon(ic)}</span><h3>{t}</h3><p>{b}</p></article>'
        for ic, t, b in d["industries"])
    diffs = "".join(
        f'<article class="card diff"><span class="diff-icon" aria-hidden="true">{icon(ic)}</span><h3>{t}</h3><p>{b}</p></article>'
        for ic, t, b in d["diffs"])
    steps = "".join(
        f'<li class="card step"><span class="step-num">{i+1}</span><h3>{t}</h3><p>{b}</p></li>'
        for i, (t, b) in enumerate(d["steps"]))
    faqs = "".join(f'''
        <div class="accordion-item">
          <h3><button class="accordion-trigger" aria-expanded="false" aria-controls="faq-{i}" id="faq-{i}-trigger">{q}</button></h3>
          <div class="accordion-panel" id="faq-{i}" role="region" aria-labelledby="faq-{i}-trigger" hidden><p>{a}</p></div>
        </div>''' for i, (q, a) in enumerate(d["faqs"], 1))
    strip = "".join(f"<span>{s}</span>" for s in d["strip"])
    q, who, where = d["testimonial"]

    return f'''<!DOCTYPE html>
<html lang="en-ZA">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{d["title"]}</title>
<meta name="description" content="{d["meta"]}">
<link rel="icon" href="assets/vdw-logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&family=Lato:wght@400;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body>

<a class="skip-link" href="#main">Skip to main content</a>

{header(fname)}

<main id="main">

  <!-- HERO -->
  <section class="hero">
    <div class="container hero-grid">
      <div class="hero-copy">
        <h1 class="eyebrow">{d["keyword"]}</h1>
        <p class="hero-title">{d["headline"]}</p>
        <p class="lead">{d["lead"]}</p>
        {btn(d["cta"], cls="btn btn-primary btn-lg")}
        <p class="fud">{d["fud"]}</p>
        <p class="proof-line"><span class="stars" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span> {d["proof1"]}</p>
      </div>
      {icon_visual(d["hero_icon"], d["hero_chips"]).replace("feature-visual icon-visual", "feature-visual icon-visual hero-visual")}
    </div>
  </section>

  <div class="proof-strip">
    <div class="container proof-strip-inner">{strip}</div>
  </div>

  <!-- PAIN POINT -->
  <section class="section">
    <div class="container narrow text-center">
      <h2 class="section-title">{d["pain_title"]}</h2>
      <p class="section-lead">{d["pain_body"]}</p>
      {btn(d["cta_short"])}
    </div>
  </section>

  <!-- SOCIAL PROOF: STATS -->
  <section class="section section-grey">
    <div class="container">
      <h2 class="section-title">{d["stats_title"]}</h2>
      <div class="grid-3">{stats}</div>
      <div class="center-cta">{btn(d["cta"])}</div>
    </div>
  </section>

  <!-- SOCIAL PROOF: INDUSTRIES -->
  <section class="section section-grey section-flush-top">
    <div class="container">
      <h2 class="section-title">{d["industries_title"]}</h2>
      <div class="grid-3">{industries}</div>
      <div class="center-cta">{btn(d["cta"])}</div>
    </div>
  </section>
{vps}

  <!-- SOCIAL PROOF: FEATURED TESTIMONIAL -->
  <section class="section section-grey">
    <div class="container">
      <h2 class="section-title">What Clients Say</h2>
      <figure class="card featured-quote">
        <div class="stars" aria-label="5 out of 5">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
        <blockquote>&ldquo;{q}&rdquo;</blockquote>
        <figcaption><strong>{who}</strong> &middot; {where}</figcaption>
      </figure>
      <div class="center-cta">{btn(d["cta"])}</div>
    </div>
  </section>

  <!-- DIFFERENTIATORS -->
  <section class="section">
    <div class="container">
      <h2 class="section-title">{d["diff_title"]}</h2>
      <div class="grid-3 diff-grid">{diffs}</div>
      <div class="center-cta">{btn(d["cta"])}</div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section class="section section-grey">
    <div class="container">
      <h2 class="section-title">{d["steps_title"]}</h2>
      <p class="section-sub">{d["steps_sub"]}</p>
      <ol class="grid-3 steps">{steps}</ol>
      <div class="center-cta">{btn(d["cta"])}</div>
    </div>
  </section>

  <!-- MEET THE TEAM -->
  <section class="section section-grey section-flush-top">
    <div class="container">
      <h2 class="section-title">Meet the Team</h2>
      <div class="team-grid">
        <div class="card team-copy">
          <h3>We have seen the audit scramble from the inside</h3>
          <p>{d["team_body"]}</p>
        </div>
        <!-- TODO: replace with a real team or on-site photo -->
        <div class="photo-placeholder" role="img" aria-label="Team photo placeholder">
          <img src="assets/vdw-logo.png" alt="" width="218" height="114">
          <span>Your team photo here</span>
        </div>
      </div>
      <div class="center-cta">{btn("Speak to a Consultant", "#contact")}</div>
    </div>
  </section>

  <div class="proof-strip proof-strip-industries">
    <div class="container proof-strip-inner">
      <span class="strip-label">Built for</span>
      <span>Equipment suppliers</span>
      <span>Industrial distributors</span>
      <span>Plant &amp; equipment hire</span>
      <span>Suppliers to mines</span>
    </div>
  </div>

  <!-- FAQ -->
  <section class="section" id="faq">
    <div class="container faq-wrap">
      <h2 class="section-title">Frequently Asked Questions</h2>
      <div class="accordion">{faqs}
      </div>
    </div>
  </section>

  <!-- FINAL RECAP -->
  <section class="section section-grey" id="contact">
    <div class="container hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">{d["recap_eyebrow"]}</p>
        <h2 class="recap-title">{d["recap_title"]}</h2>
        <p class="lead">{d["recap_body"]}</p>
        <ul class="tick-list">{tick(d["recap_points"])}</ul>
        {btn(d["cta"], cls="btn btn-primary btn-lg")}
        <p class="fud">No obligation &middot; Practical findings &middot; Or email <a href="mailto:hello@vdwsafety.co.za">hello@vdwsafety.co.za</a></p>
      </div>
      {icon_visual(d["recap_icon"], d["recap_chips"])}
    </div>
  </section>

</main>

{FOOTER}

<script src="script.js"></script>
</body>
</html>
'''

exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pages_content.py')).read())

for fname, d in PAGES.items():
    with open(os.path.join(OUT, fname), "w") as f:
        f.write(page(fname, d))
    print("wrote", fname)
