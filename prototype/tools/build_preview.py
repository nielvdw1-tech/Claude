"""Rebuild the preview copies: inlined homepage + supporting pages in scratchpad/site."""
import re, base64, sys, shutil, os
SRC, S = sys.argv[1], sys.argv[2]
site = os.path.join(S, 'site'); os.makedirs(site + '/assets', exist_ok=True)
for f in ['styles.css', 'script.js']: shutil.copy(os.path.join(SRC, f), site)
shutil.copy(os.path.join(SRC, 'assets/vdw-logo.png'), site + '/assets/')
for f in ['gap-audit.html', 'safety-file.html', 'compliance-management.html', 'free-assessment.html']:
    t = open(os.path.join(SRC, f)).read().replace('href="index.html', 'href="./')
    open(os.path.join(site, f), 'w').write(t)
html = open(os.path.join(SRC, 'index.html')).read(); css = open(os.path.join(SRC, 'styles.css')).read(); js = open(os.path.join(SRC, 'script.js')).read()
logo = 'data:image/png;base64,' + base64.b64encode(open(os.path.join(SRC, 'assets/vdw-logo.png'), 'rb').read()).decode()
fonts = re.search(r'<link href="https://fonts.googleapis.com[^>]*>', html).group(0)
body = re.search(r'<body>(.*)</body>', html, re.S).group(1).replace('<script src="script.js"></script>', '').replace('assets/vdw-logo.png', logo)
css = css.replace('.site-header { position: sticky; top: 0;', '.site-header { position: sticky; top: env(safe-area-inset-top, 0px);')
css += '\n:root { color-scheme: light; }\nbody::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 110; background: var(--bg-grey); }\n'
open(os.path.join(S, 'vdw-prototype.html'), 'w').write(f'<title>VDW Homepage Prototype</title>\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n{fonts}\n<style>\n{css}</style>\n{body}\n<script>\n{js}</script>\n')
print('preview rebuilt')
