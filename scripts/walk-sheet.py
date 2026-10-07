"""Stitch the screens saved by walk.mjs into contact sheets.
usage: python scripts/walk-sheet.py <dir> <out.jpg> [cols] [thumbWidth]"""
import glob, sys
from PIL import Image

d, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 3
tw = int(sys.argv[4]) if len(sys.argv) > 4 else 640
files = sorted(glob.glob(d + '/*.jpg'))
ims = [Image.open(f) for f in files]
ims = [i.resize((tw, round(i.height * tw / i.width))) for i in ims]
th = ims[0].height
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tw + (cols - 1) * 6, rows * th + (rows - 1) * 6), (60, 0, 60))
for n, im in enumerate(ims):
    sheet.paste(im, ((n % cols) * (tw + 6), (n // cols) * (th + 6)))
sheet.save(out, quality=78)
print(out, len(ims), 'screens')
