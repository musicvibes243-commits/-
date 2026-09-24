# Склеивает куски снимков из snyat-saity.js и кладёт готовые JPEG в ayko/img/.
# Запускать из папки, где лежат *-partNN.png:  python3 /home/user/-/tools/szhat-snimki.py
import glob, os
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'ayko', 'img')
for n in ['simba', 'savva', 'septic']:
    parts = [Image.open(f).convert('RGB') for f in sorted(glob.glob(n + '-part*.png'))]
    W = parts[0].width; H = sum(p.height for p in parts)
    im = Image.new('RGB', (W, H)); y = 0
    for p in parts: im.paste(p, (0, y)); y += p.height
    # 360 px хватает: экран телефона в рамке — 112–250 px по ширине
    r = im.resize((360, round(H * 360 / W)), Image.LANCZOS)
    path = os.path.join(OUT, n + '-full.jpg')
    r.save(path, 'JPEG', quality=45, optimize=True, progressive=True)
    print(n, r.size, os.path.getsize(path) // 1024, 'KB')
