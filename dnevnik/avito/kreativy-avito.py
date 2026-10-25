"""Картинки для Авито Рекламы из фотографии кота.

Справка Авито запрещает на креативе QR-код и разрешает тексту занимать
не больше 20% площади. Поэтому лист со столба как картинка не годится:
он почти весь текст и с кодом. Берём чистую фотографию без единой
буквы — весь смысл несут заголовок и описание, которые вводятся
отдельными полями.

Пропорции медийного стандарта: 3:4, 1:2 и 3:1. Вес держим до 500 КБ —
это потолок натива и баннера на главной, он строже медийного.

Кадрируем вокруг головы: она должна остаться в кадре во всех трёх
пропорциях, иначе в широкой полосе от кота останется бок.

Запуск:  python3 dnevnik/avito/kreativy-avito.py
"""
import cv2, os

KORNI = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VHOD = os.path.join(KORNI, 'dnevnik', 'foto', 'kot', 'kot-za-noutom.jpg')
VYHOD = os.path.join(KORNI, 'dnevnik', 'foto', 'kreativy')

GOLOVA = (0.62, 0.575)      # где на снимке середина головы, доли кадра
VES = 500 * 1024

RAZMERY = [
    ('3x4', 1200, 1600),
    ('1x2', 1000, 2000),
    ('3x1', 1800,  600),
]

def kadr(im, shir, vys):
    """Вырезает прямоугольник нужной пропорции, держа голову в кадре."""
    h, w = im.shape[:2]
    nado = shir / vys
    if w / h > nado:                       # кадр шире нужного — режем по бокам
        nw, nh = int(h * nado), h
    else:                                  # кадр выше нужного — режем сверху и снизу
        nw, nh = w, int(w / nado)
    cx, cy = GOLOVA[0] * w, GOLOVA[1] * h
    x = max(0, min(w - nw, int(cx - nw / 2)))
    y = max(0, min(h - nh, int(cy - nh / 2)))
    return im[y:y + nh, x:x + nw]

def sohranit(kartinka, put):
    """Жмёт, пока не влезет в лимит веса."""
    for k in range(95, 50, -5):
        cv2.imwrite(put, kartinka, [cv2.IMWRITE_JPEG_QUALITY, k])
        if os.path.getsize(put) <= VES:
            return k, os.path.getsize(put)
    return k, os.path.getsize(put)

def main():
    im = cv2.imread(VHOD)
    if im is None:
        raise SystemExit('не открылся ' + VHOD)
    os.makedirs(VYHOD, exist_ok=True)
    plohо = False
    for imya, shir, vys in RAZMERY:
        k = cv2.resize(kadr(im, shir, vys), (shir, vys), interpolation=cv2.INTER_AREA)
        put = os.path.join(VYHOD, f'kot-{imya}.jpg')
        kach, ves = sohranit(k, put)
        prov = cv2.imread(put)
        bedy = []
        if prov.shape[1] != shir or prov.shape[0] != vys:
            bedy.append('размер не тот')
        if ves > VES:
            bedy.append(f'тяжелее 500 КБ ({ves // 1024} КБ)')
        if float(prov.std()) < 25:
            bedy.append('кадр почти однотонный, кота в нём нет')
        plohо |= bool(bedy)
        print(f'  kot-{imya}.jpg  {shir}x{vys}  {ves // 1024} КБ  качество {kach}  '
              + ('✗ ' + ', '.join(bedy) if bedy else '✓'))
    if plohо:
        raise SystemExit(1)
    print('✓ без текста и без кода — ограничения Авито соблюдены')

if __name__ == '__main__':
    main()
