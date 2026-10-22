"""Затирает чужие телефоны на карточках портфолио.

На сайте ателье в шапке стоит номер заказчицы. Прайс уходит посторонним
и на него ведёт код с листовки в подъезде, поэтому номер надо убрать.
Не замазываем пятном, а заливаем фоном самого сайта: вёрстка выглядит
нетронутой, просто в шапке нет телефона.

Колонки с текстом находим по разбросу яркости: там, где буквы, разброс
большой, на пустом фоне — почти нулевой.
"""
import cv2, numpy as np, sys

def najti_tekst(polosa, porog=16, razryv=18):
    """Возвращает отрезки колонок, в которых есть текст."""
    razbros = polosa.std(axis=(0, 2))
    est = razbros > porog
    otrezki, nach = [], None
    for i, v in enumerate(est):
        if v and nach is None:
            nach = i
        elif not v and nach is not None:
            otrezki.append((nach, i)); nach = None
    if nach is not None:
        otrezki.append((nach, len(est)))
    # склеиваем буквы одного слова
    sklej = []
    for a, b in otrezki:
        if sklej and a - sklej[-1][1] <= razryv:
            sklej[-1] = (sklej[-1][0], b)
        else:
            sklej.append((a, b))
    return sklej

def zalit(im, x0, y0, x1, y1):
    """Заливает прямоугольник цветом фона, взятым слева и справа от него."""
    pole = 6
    sl = im[y0:y1, max(0, x0 - pole):x0]
    sp = im[y0:y1, x1:min(im.shape[1], x1 + pole)]
    obrazcy = [o for o in (sl, sp) if o.size]
    fon = np.median(np.concatenate([o.reshape(-1, 3) for o in obrazcy]), axis=0)
    im[y0:y1, x0:x1] = fon
    return fon

def najti_stroki(polosa, porog=16, razryv=4):
    """То же самое, но по строкам: находим вертикальные границы текста."""
    razbros = polosa.std(axis=(1, 2))
    est = razbros > porog
    otrezki, nach = [], None
    for i, v in enumerate(est):
        if v and nach is None:
            nach = i
        elif not v and nach is not None:
            otrezki.append((nach, i)); nach = None
    if nach is not None:
        otrezki.append((nach, len(est)))
    sklej = []
    for a, b in otrezki:
        if sklej and a - sklej[-1][1] <= razryv:
            sklej[-1] = (sklej[-1][0], b)
        else:
            sklej.append((a, b))
    return sklej

if __name__ == '__main__':
    # Коробка берётся с запасом. Внутри неё стираем только САМЫЙ ПРАВЫЙ
    # кусок текста — номер в шапке всегда крайний справа. Иначе заливка
    # съедает соседние пункты меню.
    ZADANIYA = [
        # коробка обрывается на .70 — дальше начинается макет телефона,
        # и «самым правым» оказывался текст уже из него
        ('dnevnik/foto/portfolio/karta-atelier.jpg',   [(.285, .350, .45, .70)]),
        ('dnevnik/foto/portfolio/karta-atelier-2.jpg', [(.285, .350, .45, .70),
                                                        (.330, .420, .84, 1.0)]),
    ]
    for put, korobki in ZADANIYA:
        im = cv2.imread(put)
        if im is None:
            sys.exit(f'не открылась: {put}')
        h, w = im.shape[:2]
        for ry0, ry1, rx0, rx1 in korobki:
            y0, y1 = int(ry0 * h), int(ry1 * h)
            x0, x1 = int(rx0 * w), int(rx1 * w)
            kol = najti_tekst(im[y0:y1, x0:x1])
            if not kol:
                print(f'  {put.split("/")[-1]}: в коробке текста нет')
                continue
            a, b = x0 + kol[-1][0] - 8, x0 + kol[-1][1] + 8      # только правый кусок
            stroki = najti_stroki(im[y0:y1, a:b])
            if not stroki:
                print(f'  {put.split("/")[-1]}: строк не нашлось')
                continue
            c, d = y0 + stroki[0][0] - 5, y0 + stroki[-1][1] + 5
            fon = zalit(im, a, c, b, d)
            print(f'  {put.split("/")[-1]}: стёрто x {a}-{b}, y {c}-{d}, фон {tuple(int(v) for v in fon)}')
        cv2.imwrite(put, im, [cv2.IMWRITE_JPEG_QUALITY, 94])
    print('готово')
