"""Готовит кота для объявления на столб.

Такие листы печатают на обычном чёрно-белом принтере и клеят на улице.
Поэтому цвет не нужен, а нужен контраст: на дешёвой печати полутона
слипаются в серое пятно, и морда пропадает.

Берём профиль кота, переводим в серое, растягиваем контраст по-умному
(CLAHE — он тянет локально и не выбивает стену в чистый белый), потом
слегка подрезаем уровни и подчёркиваем края.

Запуск:  python3 dnevnik/avito/kot-cherno-belyy.py
"""
import cv2, numpy as np, os

KORNI = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VHOD = os.path.join(KORNI, 'dnevnik', 'foto', 'kot', 'kot-za-noutom.jpg')
VYHOD = os.path.join(KORNI, 'dnevnik', 'foto', 'kot', 'kot-cb.jpg')

# доля кадра, в которой сидит голова с плечами
ZONA = (.40, .78, .44, .90)

def main():
    im = cv2.imread(VHOD)
    if im is None:
        raise SystemExit('не открылся ' + VHOD)
    h, w = im.shape[:2]
    y0, y1, x0, x1 = ZONA
    kadr = im[int(y0 * h):int(y1 * h), int(x0 * w):int(x1 * w)]

    g = cv2.cvtColor(kadr, cv2.COLOR_BGR2GRAY)
    g = cv2.createCLAHE(clipLimit=2.6, tileGridSize=(8, 8)).apply(g)

    # уровни: тени в чёрное, стена в белое, середина растянута
    niz, verh = 28, 232
    g = np.clip((g.astype(np.float32) - niz) * (255.0 / (verh - niz)), 0, 255).astype(np.uint8)

    # лёгкая резкость, чтобы шерсть и усы не смазались в печати
    g = cv2.addWeighted(g, 1.45, cv2.GaussianBlur(g, (0, 0), 2.2), -0.45, 0)

    cv2.imwrite(VYHOD, g, [cv2.IMWRITE_JPEG_QUALITY, 95])

    # проверка: если всё ушло в один тон, на столбе будет серое пятно
    razbros = float(g.std())
    temnyh = float((g < 90).mean())
    svetlyh = float((g > 200).mean())
    print(f'  {g.shape[1]}x{g.shape[0]}, разброс {razbros:.0f}, '
          f'тёмного {temnyh:.0%}, светлого {svetlyh:.0%}')
    if razbros < 40:
        raise SystemExit('✗ контраста мало, в печати будет пятно')
    if temnyh < .08:
        raise SystemExit('✗ почти нет тёмного, кот потеряется на белом листе')
    print('✓ kot-cb.jpg готов')

if __name__ == '__main__':
    main()
