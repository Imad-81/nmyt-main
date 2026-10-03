import sys, glob
from PIL import Image, ImageDraw
prefix, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 2
tw = int(sys.argv[4]) if len(sys.argv) > 4 else 760
files = sorted(glob.glob(prefix + '-*.jpg'))
ims = [Image.open(f) for f in files]
th = int(tw * ims[0].height / ims[0].width)
rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * tw + (cols + 1) * 8, rows * th + (rows + 1) * 8), (60, 60, 60))
for i, im in enumerate(ims):
    r, c = divmod(i, cols)
    t = im.resize((tw, th), Image.LANCZOS)
    S.paste(t, (8 + c * (tw + 8), 8 + r * (th + 8)))
    ImageDraw.Draw(S).text((14 + c * (tw + 8), 12 + r * (th + 8)), str(i), fill=(255, 0, 255))
S.save(out, quality=85)
print(out, S.size)
