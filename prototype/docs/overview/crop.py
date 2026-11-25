# Crops the full screenshots from shots.js to the content area (without the menu and top bar).
# Run after shots.js and shots_detail.js:  python3 crop.py   then   node render.js
from PIL import Image
import os
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'img')
for f in ['library', 'regulation', 'document', 'assets', 'actions', 'incidents', 'audits']:
    im = Image.open(os.path.join(D, f + '.png')); W, H = im.size
    im.crop((int(W * 520 / 2880), int(H * 120 / 1800), W, H)).save(os.path.join(D, 'c_' + f + '.png'))
# the hazard form (a dialog in the middle of the screen)
im = Image.open(os.path.join(D, 'hazardform.png')); W, H = im.size
im.crop((int(W * 270 / 1440), int(H * 40 / 900), int(W * 1170 / 1440), H)).save(os.path.join(D, 'c_hazardmodal.png'))
print('ok')
