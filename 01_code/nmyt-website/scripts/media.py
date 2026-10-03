"""Convert public/media/raw/*.png -> public/media/<name>.webp (2000w) + <name>-sm.webp (900w).
Adds no colour changes — grading is done in CSS so the source photograph stays intact."""
import os, sys
from PIL import Image
root = os.path.join(os.path.dirname(__file__), '..', 'public', 'media')
raw = os.path.join(os.path.dirname(__file__), '..', 'media-src', 'raw')
for f in sorted(os.listdir(raw)):
    if not f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        continue
    name = os.path.splitext(f)[0]
    out = os.path.join(root, name + '.webp')
    if os.path.exists(out) and os.path.getmtime(out) > os.path.getmtime(os.path.join(raw, f)) and '--force' not in sys.argv:
        continue
    im = Image.open(os.path.join(raw, f)).convert('RGB')
    for suffix, W, q in (('', 2000, 84), ('-sm', 900, 80)):
        w, h = im.size
        s = min(1, W / w)
        im2 = im.resize((round(w * s), round(h * s)), Image.LANCZOS) if s < 1 else im
        im2.save(os.path.join(root, name + suffix + '.webp'), 'WEBP', quality=q, method=6)
    print('ok', name, im.size)
