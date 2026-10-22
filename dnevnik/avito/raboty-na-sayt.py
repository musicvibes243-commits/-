"""Выкладывает демо-макеты на сайт, чтобы их можно было открыть и пролистать.

Каждому макету добавляются две вещи:

1. Запрет на индексацию. Иначе копия сайта кофейни на чужом домене
   попадёт в поиск и будет конкурировать с настоящим сайтом заказчика.
2. Полоса сверху: это макет, а сделала его Айым. Без неё человек, попавший
   на страницу по ссылке, примет её за официальный сайт заведения.

У «На минуточку» заменяются контакты: в исходнике стоял живой номер
+7 918 838-50-29 и телеграм кофейни. Страница ляжет в открытый доступ,
и звонить по ней будут незнакомые люди — значит вести она должна на Айым.

Запуск:  python3 dnevnik/avito/raboty-na-sayt.py
"""
import os, re, shutil, sys

KORNI = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VYHOD = os.path.join(KORNI, 'ayko', 'raboty')

TEL_AYKO = '+7 977 556-76-01'
SAYT = 'https://aykoweb.ru'

POLOSA = (
    '<div style="display:block;width:100%;background:#17131c;color:#f4ece0;'
    'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;'
    'font-weight:600;line-height:1.5;padding:12px 18px;text-align:center;'
    'letter-spacing:.01em">'
    'Демо-макет — {chto}. Сделала Айым: сайты, Авито и реклама. '
    '<a href="' + SAYT + '" style="color:#e8663f;text-decoration:underline">aykoweb.ru</a>'
    ' · <a href="tel:+79775567601" style="color:#e8663f;text-decoration:none">'
    + TEL_AYKO + '</a></div>'
)
ROBOTS = '<meta name="robots" content="noindex,nofollow">'

RABOTY = [
    ('demo-na-minutochku/index.html', 'na-minutochku', 'кофейни «На минуточку» не существует'),
    ('demo-kofeynya/index.html',      'kromka',        'кофейни «Кромка» не существует'),
    ('savva/mockups/1-arch.html',     'savva-arka',    'вариант оформления для кофейни SAVVA'),
    ('savva/mockups/2-cinema.html',   'savva-vitrina', 'вариант оформления для кофейни SAVVA'),
    ('savva/mockups/3-editorial.html','savva-gazeta',  'вариант оформления для кофейни SAVVA'),
]

# Контакты, которые нельзя оставлять на общедоступной странице.
ZAMENY = {
    '79188385029': '79775567601',
    '+7 (918) 838-50-29': TEL_AYKO,
    'https://t.me/minutka_coffee': SAYT,
}

def obrabotat(ishodnik, slug, chto):
    put = os.path.join(KORNI, ishodnik)
    with open(put, encoding='utf-8') as f:
        html = f.read()

    for bylo, stalo in ZAMENY.items():
        html = html.replace(bylo, stalo)

    if '<head>' not in html:
        return f'{slug}: не нашёл <head>'
    html = html.replace('<head>', '<head>\n' + ROBOTS, 1)

    m = re.search(r'<body[^>]*>', html)
    if not m:
        return f'{slug}: не нашёл <body>'
    html = html[:m.end()] + '\n' + POLOSA.format(chto=chto) + html[m.end():]

    papka = os.path.join(VYHOD, slug)
    os.makedirs(papka, exist_ok=True)
    with open(os.path.join(papka, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(html)

    # проверки: без них можно тихо выложить страницу с чужим номером
    besh = []
    if ROBOTS not in html:
        besh.append('нет запрета индексации')
    if 'Демо-макет —' not in html:
        besh.append('нет полосы с пометкой')
    for bylo in ZAMENY:
        if bylo in html:
            besh.append(f'остался «{bylo}»')
    if re.search(r'9188385029', html):
        besh.append('остался чужой телефон')
    return f'{slug}: ' + ('✗ ' + ', '.join(besh) if besh else
                          f'✓ {len(html) // 1024} КБ → /raboty/{slug}/')

if __name__ == '__main__':
    shutil.rmtree(VYHOD, ignore_errors=True)
    plohо = False
    for ishodnik, slug, chto in RABOTY:
        stroka = obrabotat(ishodnik, slug, chto)
        plohо |= '✗' in stroka
        print(' ', stroka)
    sys.exit(1 if plohо else 0)
