"""Готовит кадры ролика из присланных картинок.

Половина картинок горизонтальные, а ролик вертикальный. Обрезать их
нельзя: надписи идут во всю ширину и срежутся по краям. Поэтому
вписываем целиком, а пустоту закрываем размытой и притемнённой копией
той же картинки — так кадр не выглядит дырявым.

Холст делаем вдвое крупнее ролика: потом ffmpeg медленно наезжает
камерой, и с запасом по разрешению наезд остаётся чётким.

Запуск:  python3 dnevnik/avito/ril-naparnik-foto.py
"""
import cv2, numpy as np, os, glob

KORNI = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VHOD = os.path.join(KORNI, 'dnevnik', 'foto', 'naparnik-kadry-foto')
VYHOD = os.path.join(KORNI, 'dnevnik', 'foto', 'naparnik-holsty')
W, H = 2160, 3840          # вдвое больше 1080x1920

def holst(im):
    h, w = im.shape[:2]
    # фон: растягиваем по максимуму, режем лишнее, размываем и гасим
    k = max(W / w, H / h)
    fon = cv2.resize(im, (int(w * k) + 1, int(h * k) + 1), interpolation=cv2.INTER_AREA)
    y0 = (fon.shape[0] - H) // 2
    x0 = (fon.shape[1] - W) // 2
    fon = fon[y0:y0 + H, x0:x0 + W]
    fon = cv2.GaussianBlur(fon, (0, 0), 60)
    fon = (fon * 0.45).astype(np.uint8)

    # Вписываем не впритык, а с запасом в 7 процентов: потом камера
    # наезжает и съедает края, а надписи на картинках идут почти во всю
    # ширину — без запаса у них отрезает последние буквы.
    ZAPAS = 0.93
    k2 = min(W / w, H / h) * ZAPAS
    nw, nh = int(w * k2), int(h * k2)
    perd = cv2.resize(im, (nw, nh), interpolation=cv2.INTER_AREA)
    y1, x1 = (H - nh) // 2, (W - nw) // 2
    fon[y1:y1 + nh, x1:x1 + nw] = perd
    return fon, nw, nh

if __name__ == '__main__':
    os.makedirs(VYHOD, exist_ok=True)
    fajly = sorted(glob.glob(os.path.join(VHOD, '*.jpg')))
    if not fajly:
        raise SystemExit('не нашёл картинок в ' + VHOD)
    for f in fajly:
        im = cv2.imread(f)
        if im is None:
            raise SystemExit('не открылась ' + f)
        k, nw, nh = holst(im)
        put = os.path.join(VYHOD, os.path.basename(f).replace('.jpg', '.png'))
        cv2.imwrite(put, k)
        dolya = 100 * nw * nh / (W * H)
        print(f'  {os.path.basename(f)} → {nw}x{nh} в кадре, картинка занимает {dolya:.0f}%',
              '' if dolya > 25 else '← маловато, проверьте')
    print(f'✓ {len(fajly)} холстов {W}x{H}')
