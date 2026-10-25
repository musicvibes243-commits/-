"""Картинки для Авито Рекламы из снимка листа на столбе.

Текст на креативе Авито разрешает до 20% площади, QR запрещает. Здесь
текст внутри фотографии и занимает около восьмой части кадра, кода нет —
проходит. Это тот самый ход, которым сделана реклама автошколы.

Лист находим автоматически по светлому пятну: от него считаем, куда
смещать кадр, чтобы заход остался читаемым во всех трёх пропорциях.
В широкой полосе лист целиком не помещается, поэтому её центр
поднимаем к заходу.

Запуск:  python3 dnevnik/avito/kreativy-stolb.py
"""
import cv2, numpy as np, os

KORNI = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VHOD = os.path.join(KORNI, 'dnevnik', 'foto', 'stolb-snimok', 'stolb.jpg')
VYHOD = os.path.join(KORNI, 'dnevnik', 'foto', 'kreativy')
VES = 500 * 1024

# имя, ширина, высота, куда целиться по высоте листа (0 — верх, 1 — низ)
RAZMERY = [
    ('stolb-3x4', 1200, 1600, 0.48),
    ('stolb-1x2', 1000, 2000, 0.48),
    ('stolb-3x1', 1800,  600, 0.26),   # в полосу лист не влезает — держим заход
]

def nayti_list(im):
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    _, bel = cv2.threshold(g, 185, 255, cv2.THRESH_BINARY)
    bel = cv2.morphologyEx(bel, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    cnt, _ = cv2.findContours(bel, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    return cv2.boundingRect(max(cnt, key=cv2.contourArea))

def sohranit(k, put):
    for kach in range(95, 50, -5):
        cv2.imwrite(put, k, [cv2.IMWRITE_JPEG_QUALITY, kach])
        if os.path.getsize(put) <= VES:
            return kach, os.path.getsize(put)
    return kach, os.path.getsize(put)

def main():
    im = cv2.imread(VHOD)
    if im is None:
        raise SystemExit('не открылся ' + VHOD)
    h, w = im.shape[:2]
    lx, ly, lw, lh = nayti_list(im)
    os.makedirs(VYHOD, exist_ok=True)
    print(f'  лист найден: {lw}x{lh} в точке ({lx}, {ly})')

    plohо = False
    for imya, shir, vys, cel in RAZMERY:
        nado = shir / vys
        if w / h > nado:
            nw, nh = int(h * nado), h
        else:
            nw, nh = w, int(w / nado)
        cx = lx + lw / 2
        cy = ly + lh * cel
        x = max(0, min(w - nw, int(cx - nw / 2)))
        y = max(0, min(h - nh, int(cy - nh / 2)))
        k = cv2.resize(im[y:y + nh, x:x + nw], (shir, vys), interpolation=cv2.INTER_AREA)

        put = os.path.join(VYHOD, f'{imya}.jpg')
        kach, ves = sohranit(k, put)

        # доля листа, попавшая в кадр: если заход срезан, креатив бесполезен
        vid = max(0, min(x + nw, lx + lw) - max(x, lx)) * max(0, min(y + nh, ly + lh) - max(y, ly))
        dolya = vid / (lw * lh)
        bedy = []
        if ves > VES:
            bedy.append(f'тяжелее 500 КБ ({ves // 1024} КБ)')
        if dolya < 0.35:
            bedy.append(f'листа в кадре всего {dolya:.0%}')
        plohо |= bool(bedy)
        print(f'  {imya}.jpg  {shir}x{vys}  {ves // 1024} КБ  листа в кадре {dolya:.0%}  '
              + ('✗ ' + ', '.join(bedy) if bedy else '✓'))
    if plohо:
        raise SystemExit(1)
    print('✓ без кода, текст внутри фотографии')

if __name__ == '__main__':
    main()
