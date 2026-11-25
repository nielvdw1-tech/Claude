# Makes WebP copies of the PNG website images (smaller files, same picture).
from PIL import Image
import glob, os
D = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(D, 'webp'), exist_ok=True)
for f in sorted(glob.glob(os.path.join(D, 'images', '*.png'))):
    Image.open(f).convert('RGB').save(os.path.join(D, 'webp', os.path.basename(f)[:-4] + '.webp'), 'WEBP', quality=88, method=6)
print('ok')
