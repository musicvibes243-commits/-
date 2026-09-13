"""Собирает страницы услуг: отопление, электрика, автополив.

Шапка, форма, подвал и мобильная панель у всех одинаковые — они взяты
с главной страницы, чтобы посетитель не заметил перехода. Отличается
только содержимое: заголовок, карточки услуг, этапы и вопросы.
"""
import pathlib, json, html

SITE = "https://stroyinvest-mo.ru"
PHONE_HREF = "tel:+79153469728"
PHONE_TEXT = "+7 (915) 346-97-28"
WA = "https://wa.me/79153469728"
TG = "https://t.me/+79153469728"

LOGO = '''<svg class="logo__mark" viewBox="0 0 32 32" aria-hidden="true" fill="none">
        <rect x="1.6" y="1.6" width="28.8" height="28.8" rx="3" stroke="currentColor" stroke-width="2"/>
        <path d="M16 6c0 0 6 7.2 6 11a6 6 0 1 1-12 0c0-3.8 6-11 6-11z" fill="#F0A62E"/>
        <path d="M2 23h28M2 27h28" stroke="currentColor" stroke-width="1.6" opacity=".55"/>
      </svg>'''

ICO_PHONE = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1.1 1A16 16 0 0 1 4 5.1 1 1 0 0 1 5 4z"/></svg>'
ICO_WA = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 20.5l1.8-5.2A8.5 8.5 0 1 1 21 11.5z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5"/></svg>'
ICO_TG = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M21.7 4.4 3 11.6c-.6.2-.6 1 0 1.2l4.7 1.5 1.8 5.4c.2.5.8.6 1.2.2l2.5-2.7 4.5 3.3c.4.3 1 .1 1.1-.4l3.4-14.8c.2-.6-.4-1.1-1-.9z"/><path d="M8 14.4 18.4 7.2 10.5 16.1"/></svg>'
ICO_MAIL = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/></svg>'
ICO_PIN = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>'

PAGES = [
{
 "file": "otoplenie.html",
 "slug": "otoplenie",
 "title": "Отопление дома под ключ — котельная, радиаторы, тёплые полы | СтройИнвест",
 "desc": "Монтаж отопления в частном доме под ключ по Москве и Московской области: котельная, радиаторы, водяные и электрические тёплые полы. Выезд, замер и расчёт бесплатно.",
 "eyebrow": "Отопление и тёплые полы",
 "h1": 'Отопление дома под ключ: <span>котельная, радиаторы, тёплый пол</span>',
 "lead": "Соберём котельную, разведём отопление по дому и уложим тёплые полы — водяные и электрические. "
         "Работаем по всей Москве и Московской области, круглый год.",
 "chips": ["Котельная под ключ", "Полы водяные и электрические", "Выезд и замер бесплатно", "Вся Москва и область"],
 "service_name": "Монтаж отопления и тёплых полов",
 "cards": [
   ("Котельная под ключ",
    "Котёл, обвязка, бойлер косвенного нагрева, группа безопасности, расширительный бак, "
    "насосы и автоматика. Собираем, запускаем и настраиваем режимы.",
    '<path d="M9 8h22v24H9z"/><path d="M14 14h12M14 20h12"/><path d="M20 32v6M14 38h12"/>'),
   ("Радиаторы и разводка",
    "Ведём трубы по дому, ставим и подключаем радиаторы, балансируем систему, "
    "чтобы дальняя комната грелась так же, как ближняя. Прокладка скрытая или открытая.",
    '<path d="M10 10h20v22H10z"/><path d="M15 10v22M20 10v22M25 10v22"/><path d="M10 36h20"/>'),
   ("Водяной тёплый пол",
    "Коллекторный шкаф, контуры по комнатам, опрессовка до заливки стяжки, подключение к котлу "
    "и настройка температуры. Дешевле в эксплуатации, греет равномерно.",
    '<path d="M8 30c4-6 8-6 12 0s8 6 12 0"/><path d="M8 22c4-6 8-6 12 0s8 6 12 0"/><path d="M8 14c4-6 8-6 12 0s8 6 12 0"/>'),
   ("Электрический тёплый пол",
    "Маты и кабель под плитку, терморегуляторы и датчики, подключение к щиту. "
    "Ставим там, где стяжку заливать негде: ванная, санузел, прихожая.",
    '<path d="M22 6l-8 16h8l-4 16 12-18h-8z"/><path d="M8 34h24"/>'),
 ],
 "steps": [
   ("Выезд и замер", "Смотрим дом: площадь, окна, утепление, что уже стоит. Считаем нужную мощность.", "бесплатно"),
   ("Подбор и смета", "Подбираем котёл и оборудование под задачу и бюджет, называем окончательную стоимость.", "1–2 дня"),
   ("Монтаж", "Котельная, трассы, радиаторы, контуры пола. Работаем аккуратно, убираем за собой.", "3–7 дней"),
   ("Опрессовка и запуск", "Проверяем систему под давлением, запускаем, настраиваем автоматику, показываем, как пользоваться.", "в день сдачи"),
 ],
 "faq": [
   ("Что выбрать — радиаторы или тёплый пол?",
    "Чаще всего и то, и другое. Тёплый пол хорош в кухне, санузлах и прихожей — там, где ходят босиком "
    "и где плитка. Радиаторы быстрее реагируют и лучше держат температуру у окон. На замере считаем, "
    "что выгоднее именно в вашем доме."),
   ("Водяной пол или электрический?",
    "Водяной дешевле в эксплуатации, но требует котла, коллектора и стяжки — его закладывают на этапе "
    "черновых работ. Электрический проще и быстрее, укладывается под плитку почти в готовом доме, "
    "но счёт за свет будет выше. В ванную часто ставят электрический, в большие комнаты — водяной."),
   ("Когда делать тёплый пол?",
    "Водяной — до заливки стяжки. Мы укладываем контуры, опрессовываем систему и заливаем стяжку, "
    "пока в трубах держится давление: так сразу видно, если что-то повреждено. Электрический можно "
    "положить позже, вместе с укладкой плитки."),
   ("Работаете зимой?",
    "Да, отопление чаще всего и делают зимой — когда стало понятно, что дом не держит тепло. "
    "Работаем круглый год."),
   ("Сколько это стоит?",
    "Зависит от площади дома, числа контуров и выбранного оборудования — котёл может стоить и 40 тысяч, "
    "и 300. Поэтому выезжаем, считаем и называем окончательную сумму до начала работ. Выезд бесплатный."),
 ],
 "select": ["Котельная под ключ", "Радиаторы и разводка", "Водяной тёплый пол",
            "Электрический тёплый пол", "Пока не определился"],
 "placeholder": "Площадь дома, есть ли котёл, какое топливо — газ, электричество или дизель",
 "other": [("Электрика в доме и на участке", "elektrika.html"),
           ("Автополив участка", "avtopoliv.html"),
           ("Септики, кессоны и дренаж", "index.html")],
},
{
 "file": "elektrika.html",
 "slug": "elektrika",
 "title": "Электрика в доме и на участке — щит, разводка, освещение | СтройИнвест",
 "desc": "Электромонтаж в частном доме и на участке по Москве и Московской области: сборка щита, разводка по дому, ввод на участок, освещение. Выезд и расчёт бесплатно.",
 "eyebrow": "Электромонтаж",
 "h1": 'Электрика <span>в доме и на участке</span>',
 "lead": "Собираем щит, ведём разводку по дому, подводим электричество на участок и делаем освещение. "
         "Москва и Московская область, выезд и расчёт бесплатно.",
 "chips": ["Щит с автоматами и УЗО", "Разводка по дому", "Ввод на участок", "Освещение дома и территории"],
 "service_name": "Электромонтажные работы в частном доме",
 "cards": [
   ("Щит и автоматика",
    "Собираем щит: вводной автомат, УЗО или дифавтоматы на группы, подписи к каждой линии. "
    "Через полгода вы будете понимать, какой автомат за что отвечает.",
    '<path d="M10 6h20v28H10z"/><path d="M14 12h5v6h-5zM21 12h5v6h-5zM14 22h5v6h-5zM21 22h5v6h-5z"/>'),
   ("Разводка по дому",
    "Разделяем на группы: розетки, свет, мощные потребители — котёл, насос, бойлер, плита. "
    "Штробим, ставим подрозетники, тянем медный кабель нужного сечения.",
    '<path d="M20 6v10"/><path d="M8 16h24"/><path d="M8 16v8M20 16v14M32 16v8"/><circle cx="8" cy="28" r="4"/><circle cx="32" cy="28" r="4"/>'),
   ("Ввод на участок и в дом",
    "Прокладываем кабель от точки подключения до дома — в траншее или по воздуху, "
    "в гофре или бронированный. Делаем заземление.",
    '<path d="M8 34h24"/><path d="M12 34V14h16v20"/><path d="M20 14V6"/><path d="M14 26h12"/>'),
   ("Освещение",
    "Свет в доме, на участке, у ворот и вдоль дорожек. Ставим датчики движения и автоматику, "
    "чтобы не искать выключатель в темноте.",
    '<path d="M20 6a10 10 0 0 1 6 18v4H14v-4a10 10 0 0 1 6-18z"/><path d="M16 34h8M17 38h6"/>'),
 ],
 "steps": [
   ("Выезд и осмотр", "Смотрим дом и участок, считаем нагрузку: сколько техники, какие мощные приборы.", "бесплатно"),
   ("Схема групп", "Раскладываем по группам и составляем смету на кабель, автоматы и работу.", "1–2 дня"),
   ("Монтаж", "Трассы, подрозетники, кабель, щит, светильники. Каждую линию подписываем.", "2–7 дней"),
   ("Проверка и сдача", "Проверяем каждую линию под нагрузкой, показываем щит и объясняем, что где.", "в день сдачи"),
 ],
 "faq": [
   ("Нужен ли проект?",
    "Для частного дома достаточно схемы групп — её мы составляем на замере: где розетки, где свет, "
    "что на отдельном автомате. Полноценный проект нужен при подключении большой мощности "
    "или в многоквартирном доме."),
   ("Какой кабель используете?",
    "Медный, негорючий, сечение под нагрузку: 1,5 мм² на освещение, 2,5 мм² на розетки, "
    "4–6 мм² на мощные потребители вроде плиты, котла или бойлера. Алюминий в доме не ставим."),
   ("Кто подключает дом к сетям?",
    "Само технологическое присоединение оформляет сетевая организация — это договор между вами и ей, "
    "мы туда не вмешиваемся. Наша часть — монтаж: щит, линии, ввод от точки подключения, "
    "подключение оборудования. Подскажем порядок действий, если вы только начинаете."),
   ("Можно ли делать электрику вместе с отоплением и септиком?",
    "Это даже удобнее: одна бригада, одни траншеи, меньше согласований между подрядчиками. "
    "Кабель к насосу септика и к котлу мы всё равно ведём сами."),
   ("Сколько стоит?",
    "Считается по количеству точек, длине трасс и мощности. Называем сумму после осмотра — "
    "выезд бесплатный, и до начала работ вы знаете окончательную цифру."),
 ],
 "select": ["Щит и автоматика", "Разводка по дому", "Ввод на участок",
            "Освещение дома и участка", "Пока не определился"],
 "placeholder": "Что уже есть: подключён ли участок, какая мощность, что планируете включать",
 "other": [("Отопление и тёплые полы", "otoplenie.html"),
           ("Автополив участка", "avtopoliv.html"),
           ("Септики, кессоны и дренаж", "index.html")],
},
{
 "file": "avtopoliv.html",
 "slug": "avtopoliv",
 "title": "Автополив участка под ключ — Москва и область | СтройИнвест",
 "desc": "Монтаж автополива газона и участка под ключ по Москве и Московской области: зоны, дождеватели, капельный полив, контроллер, консервация на зиму. Выезд и расчёт бесплатно.",
 "eyebrow": "Автополив",
 "h1": 'Автополив участка <span>под ключ</span>',
 "lead": "Газон поливается сам, по расписанию, пока вы на работе. Считаем зоны, прокладываем трубы, "
         "ставим дождеватели и автоматику. Москва и Московская область.",
 "chips": ["Газон, клумбы, грядки", "Контроллер и датчик дождя", "Консервация на зиму", "Выезд и расчёт бесплатно"],
 "service_name": "Монтаж системы автополива участка",
 "cards": [
   ("План и зоны полива",
    "Считаем, сколько воды даёт ваш источник, и делим участок на зоны: газон, клумбы, кусты. "
    "Подбираем дождеватели так, чтобы не осталось сухих углов и не заливало дорожки.",
    '<path d="M6 32h28"/><path d="M12 32V18h16v14"/><path d="M20 18V8"/><circle cx="20" cy="6" r="2"/>'),
   ("Монтаж труб и дождевателей",
    "Копаем траншеи, укладываем трубы, ставим клапаны и дождеватели вровень с газоном — "
    "косилка по ним проходит. Для грядок и кустов делаем капельный полив.",
    '<path d="M6 28h28"/><path d="M14 28V20h12v8"/><path d="M10 16c2-4 6-4 8 0M22 16c2-4 6-4 8 0"/>'),
   ("Вода и насос",
    "Подключаем к скважине, накопительной ёмкости или центральному водопроводу. "
    "Ставим насосную станцию и фильтр, чтобы форсунки не забивались песком.",
    '<path d="M20 6c0 0 9 11 9 17a9 9 0 1 1-18 0c0-6 9-17 9-17z"/><path d="M15 23a5 5 0 0 0 5 5"/>'),
   ("Автоматика и зима",
    "Контроллер с расписанием, датчик дождя — в дождь система не включится. "
    "Осенью продуваем трубы компрессором, чтобы зимой ничего не разорвало.",
    '<circle cx="20" cy="20" r="13"/><path d="M20 12v8l6 4"/>'),
 ],
 "steps": [
   ("Выезд и замер", "Смотрим участок, меряем напор и расход воды, обсуждаем, что и как часто поливать.", "бесплатно"),
   ("План системы", "Раскладываем зоны и дождеватели, считаем трубы и оборудование, называем стоимость.", "1–2 дня"),
   ("Монтаж", "Траншеи, трубы, клапаны, дождеватели, насос и контроллер. Газон восстанавливаем.", "2–5 дней"),
   ("Настройка", "Запускаем, настраиваем расписание под ваши растения и показываем, как менять режимы.", "в день сдачи"),
 ],
 "faq": [
   ("Когда делать автополив — до газона или после?",
    "Лучше до укладки газона: трубы уходят в грунт, и следов не остаётся. Но можно и на готовом "
    "участке — аккуратно вскрываем дёрн узкой траншеей и укладываем обратно, через пару недель "
    "шов не найти."),
   ("Нужна ли скважина?",
    "Не обязательно. Система работает от скважины, от накопительной ёмкости или от водопровода — "
    "главное, чтобы хватало напора и расхода. Это мы и меряем на выезде: иногда достаточно "
    "поставить насос к бочке."),
   ("Что с системой зимой?",
    "Осенью продуваем трубы компрессором и снимаем то, что боится мороза. Это делается раз в год "
    "и занимает несколько часов. Весной запускаем обратно."),
   ("Можно ли совместить с дренажем?",
    "Да, и это разумно: обе системы требуют земляных работ, а бригада и техника одни. "
    "За один заезд получаете и отвод лишней воды, и полив в засуху."),
   ("Сколько стоит?",
    "Зависит от площади полива, числа зон и источника воды. Считаем после выезда — "
    "выезд и расчёт бесплатные."),
 ],
 "select": ["Автополив газона", "Капельный полив грядок и кустов", "Насос и подключение воды",
            "Ремонт или обслуживание системы", "Пока не определился"],
 "placeholder": "Площадь участка, что поливать, откуда вода — скважина, ёмкость или водопровод",
 "other": [("Отопление и тёплые полы", "otoplenie.html"),
           ("Электрика в доме и на участке", "elektrika.html"),
           ("Септики, кессоны и дренаж", "index.html")],
},
]


def cards_html(cards):
    out = []
    for name, text, path in cards:
        out.append(f'''      <article class="card">
        <svg class="ico card__ico" viewBox="0 0 40 40" aria-hidden="true">{path}</svg>
        <h3>{name}</h3>
        <p>{text}</p>
      </article>''')
    return '\n'.join(out)


def steps_html(steps):
    out = []
    for name, text, time in steps:
        out.append(f'''      <li class="step">
        <h3>{name}</h3>
        <p>{text}</p>
        <span class="step__time">{time}</span>
      </li>''')
    return '\n'.join(out)


def faq_html(faq):
    out = []
    for i, (q, a) in enumerate(faq):
        op = ' open' if i == 0 else ''
        out.append(f'''      <details{op}>
        <summary>{q}</summary>
        <p>{a}</p>
      </details>''')
    return '\n'.join(out)


def options_html(items):
    return '\n'.join(f'            <option>{i}</option>' for i in items)


def other_html(items):
    return '\n'.join(
        f'        <li><a href="{href}">{name}</a></li>' for name, href in items)


def build(p):
    ld = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": p["service_name"],
      "serviceType": p["service_name"],
      "provider": {
        "@type": "LocalBusiness",
        "name": "СтройИнвест",
        "legalName": "Общество с ограниченной ответственностью «ИнженерИнвест»",
        "taxID": "2100032923",
        "telephone": PHONE_TEXT,
        "url": SITE + "/"
      },
      "areaServed": [
        {"@type": "City", "name": "Москва"},
        {"@type": "State", "name": "Московская область"}
      ],
      "url": f"{SITE}/{p['file']}",
      "description": p["desc"]
    }
    faq_ld = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {"@type": "Question", "name": q,
         "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in p["faq"]
      ]
    }

    return f'''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{p["title"]}</title>
<meta name="description" content="{p["desc"]}">
<link rel="canonical" href="{SITE}/{p["file"]}">
<meta name="robots" content="index, follow">
<meta name="yandex-verification" content="56edeb1e88845884">
<meta name="theme-color" content="#241E1B">
<meta name="format-detection" content="telephone=no">

<meta property="og:type" content="website">
<meta property="og:locale" content="ru_RU">
<meta property="og:site_name" content="СтройИнвест">
<meta property="og:title" content="{p["title"].split(" | ")[0]}">
<meta property="og:description" content="{p["desc"]}">
<meta property="og:url" content="{SITE}/{p["file"]}">
<meta property="og:image" content="{SITE}/og.png">

<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="preload" href="assets/fonts/golos-text-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/playfair-display-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/fonts.css">
<link rel="stylesheet" href="assets/tokens.css">
<link rel="stylesheet" href="assets/page.css">
<style>
/* первый экран страницы услуги: без фотографии, только текст */
.lead-hero{{background:var(--band);padding-block:clamp(46px,7vw,86px);border-bottom:1px solid var(--line)}}
.lead-hero h1{{font-family:"Playfair Display",Georgia,"Times New Roman",serif;
  font-size:clamp(30px,5.2vw,54px);line-height:1.06;letter-spacing:-.01em;margin:0;
  color:var(--on-band);text-wrap:balance;max-width:20ch}}
.lead-hero h1 span{{color:var(--brand-text)}}
.lead-hero .lead{{margin-top:18px;max-width:56ch;color:var(--on-band-muted)}}
.crumbs{{font-size:14px;color:var(--on-band-muted);margin:0 0 18px}}
.crumbs a{{color:var(--on-band-muted)}}
.crumbs a:hover{{color:var(--accent)}}
.other{{background:var(--surface-2)}}
.other ul{{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:12px}}
.other a{{display:inline-block;border:1px solid var(--line);border-radius:100px;
  padding:10px 20px;text-decoration:none;color:var(--ink-2);font-size:15px}}
.other a:hover{{border-color:var(--accent);color:var(--accent)}}
</style>
</head>
<body>

<!-- ================= ШАПКА ================= -->
<header class="top">
  <div class="wrap top__in">
    <a class="logo" href="index.html" aria-label="СтройИнвест — на главную">
      {LOGO}
      <span>
        <span class="logo__name">СтройИнвест</span>
        <span class="logo__sub">инженерные системы дома и участка</span>
      </span>
    </a>

    <nav class="nav" aria-label="Основное меню">
      <a href="index.html">Септики и дренаж</a>
      <a href="otoplenie.html">Отопление</a>
      <a href="elektrika.html">Электрика</a>
      <a href="avtopoliv.html">Автополив</a>
    </nav>

    <a class="top__phone" href="{PHONE_HREF}">
      <b>{PHONE_TEXT}</b>
      <span>Круглосуточно</span>
    </a>
    <a class="btn btn--accent" href="#zayavka">Оставить заявку</a>
  </div>
</header>

<main id="top">

<!-- ================= ПЕРВЫЙ ЭКРАН ================= -->
<section class="lead-hero">
  <div class="wrap">
    <p class="crumbs"><a href="index.html">СтройИнвест</a> → {p["eyebrow"]}</p>
    <h1>{p["h1"]}</h1>
    <p class="lead">{p["lead"]}</p>

    <div class="hero__cta" style="display:flex;flex-wrap:wrap;gap:12px;margin-top:28px">
      <a class="btn btn--accent" href="#zayavka">Оставить заявку</a>
      <a class="btn btn--outline" href="{PHONE_HREF}">Позвонить</a>
    </div>

    <ul class="chips" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:24px;list-style:none;padding:0">
{chips_html(p["chips"])}
    </ul>
  </div>
</section>

<!-- ================= ЧТО ДЕЛАЕМ ================= -->
<section id="uslugi">
  <div class="wrap">
    <div class="head">
      <p class="eyebrow">Что делаем</p>
      <h2>Работы по направлению «{p["eyebrow"]}»</h2>
    </div>
    <div class="cards">
{cards_html(p["cards"])}
    </div>
  </div>
</section>

<!-- ================= ЭТАПЫ ================= -->
<section id="etapy" class="cases">
  <div class="wrap">
    <div class="head">
      <p class="eyebrow">Как проходит работа</p>
      <h2>От звонка до сдачи — четыре шага</h2>
    </div>
    <ol class="steps">
{steps_html(p["steps"])}
    </ol>
  </div>
</section>

<!-- ================= ВОПРОСЫ ================= -->
<section id="voprosy">
  <div class="wrap">
    <div class="head">
      <p class="eyebrow">Частые вопросы</p>
      <h2>Отвечаем до того, как вы позвоните</h2>
    </div>
    <div class="faq">
{faq_html(p["faq"])}
    </div>
  </div>
</section>

<!-- ================= ДРУГИЕ УСЛУГИ ================= -->
<section class="other">
  <div class="wrap">
    <div class="head">
      <p class="eyebrow">Ещё мы делаем</p>
      <h2>Весь участок одной бригадой</h2>
    </div>
    <ul>
{other_html(p["other"])}
    </ul>
  </div>
</section>

<!-- ================= ЗАЯВКА ================= -->
<section id="zayavka" class="form-sec">
  <div class="wrap form-grid">
    <div>
      <p class="eyebrow">Заявка на выезд</p>
      <h2>Приедем, посмотрим и назовём точную цену</h2>
      <p class="lead" style="margin-top:14px">Отвечаем круглосуточно: звоните в любое время или пишите в мессенджер — ответим там же.</p>

      <div class="contacts">
        <div class="contact">
          {ICO_PHONE}
          <div><b><a href="{PHONE_HREF}" style="text-decoration:none">{PHONE_TEXT}</a></b><span>круглосуточно, без выходных</span></div>
        </div>
        <div class="contact">
          {ICO_WA}
          <div><b><a href="{WA}" target="_blank" rel="noopener" style="text-decoration:none">Написать в WhatsApp</a></b><span>пришлите фото — сориентируем быстрее</span></div>
        </div>
        <div class="contact">
          {ICO_TG}
          <div><b><a href="{TG}" target="_blank" rel="noopener" style="text-decoration:none">Написать в Telegram</a></b><span>удобно скинуть фото и схему</span></div>
        </div>
        <div class="contact">
          {ICO_PIN}
          <div><b>Москва и область</b><span>выезд, замер и расчёт — бесплатно</span></div>
        </div>
      </div>
    </div>

    <form id="leadForm" novalidate>
      <div id="formSummary" hidden class="summary" tabindex="-1">
        <b>Проверьте, пожалуйста, поля:</b>
        <ul id="formSummaryList"></ul>
      </div>

      <div class="f-row">
        <div class="field">
          <label for="fName">Как к вам обращаться <span class="req" aria-hidden="true">*</span></label>
          <input type="text" id="fName" name="name" autocomplete="name" required aria-describedby="eName">
          <span class="err" id="eName"></span>
        </div>
        <div class="field">
          <label for="fPhone">Телефон <span class="req" aria-hidden="true">*</span></label>
          <input type="tel" id="fPhone" name="phone" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required aria-describedby="hPhone ePhone">
          <span class="hint" id="hPhone">Позвоним один раз, рассылок не будет.</span>
          <span class="err" id="ePhone"></span>
        </div>
      </div>

      <div class="f-row">
        <div class="field">
          <label for="fPlace">Населённый пункт</label>
          <input type="text" id="fPlace" name="place" autocomplete="address-level2" placeholder="например, Дмитров">
        </div>
        <div class="field">
          <label for="fSvc">Что нужно сделать</label>
          <select id="fSvc" name="service">
{options_html(p["select"])}
          </select>
        </div>
      </div>

      <div class="field">
        <label for="fText">Коротко о задаче</label>
        <textarea id="fText" name="text" placeholder="{p["placeholder"]}"></textarea>
      </div>

      <!-- Ловушка для спам-ботов: человек это поле не видит и не заполняет -->
      <div class="hp" aria-hidden="true"><label for="fSite">Не заполняйте это поле</label>
        <input type="text" id="fSite" name="_gotcha" tabindex="-1" autocomplete="off"></div>

      <label class="opt">
        <input type="checkbox" id="fAgree" name="agree" required aria-describedby="eAgree">
        <span>Согласен на обработку персональных данных в соответствии с <a href="privacy.html" target="_blank" rel="noopener">политикой конфиденциальности</a> <span class="req" aria-hidden="true">*</span>
          <span class="err" id="eAgree"></span>
        </span>
      </label>

      <button type="submit" class="btn btn--accent" id="fSubmit">Отправить заявку</button>
      <p class="hint" style="margin:0">Перезваниваем в течение 15 минут в любое время суток. Данные используем только для ответа на заявку.</p>
    </form>
  </div>
</section>

</main>

<!-- ================= ФУТЕР ================= -->
<footer class="foot">
  <div class="wrap">
    <div class="foot__grid">
      <div>
        <a class="logo" href="index.html" style="margin-bottom:14px">
          {LOGO}
          <span><span class="logo__name">СтройИнвест</span><span class="logo__sub">инженерные системы дома и участка</span></span>
        </a>
        <p style="color:var(--on-band-muted);max-width:38ch;font-size:14px">Септики, кессоны, дренаж, отопление, электрика и автополив по Москве и Московской области. Мастера работают больше 10 лет.</p>
      </div>
      <div>
        <h4>Услуги</h4>
        <ul>
          <li><a href="index.html">Септики и канализация</a></li>
          <li><a href="index.html">Кессоны и дренаж</a></li>
          <li><a href="otoplenie.html">Отопление и тёплые полы</a></li>
          <li><a href="elektrika.html">Электрика</a></li>
          <li><a href="avtopoliv.html">Автополив</a></li>
        </ul>
      </div>
      <div>
        <h4>Контакты</h4>
        <ul>
          <li><a href="{PHONE_HREF}">{PHONE_TEXT}</a></li>
          <li><a href="{WA}" target="_blank" rel="noopener">WhatsApp</a></li>
          <li><a href="{TG}" target="_blank" rel="noopener">Telegram</a></li>
          <li>Круглосуточно, без выходных</li>
          <li>Москва и Московская область</li>
        </ul>
      </div>
    </div>
    <div class="foot__bottom">
      <span>ООО «ИнженерИнвест» · ИНН 2100032923 · ОГРН 1262100002878</span>
      <span><a href="privacy.html">Политика конфиденциальности</a></span>
      <span>© <span id="year">2026</span> СтройИнвест. Информация на сайте не является публичной офертой.</span>
    </div>
  </div>
</footer>

<!-- ================= МОБИЛЬНАЯ ПАНЕЛЬ ================= -->
<nav class="callbar" aria-label="Быстрая связь">
  <a href="{PHONE_HREF}">{ICO_PHONE}Позвонить</a>
  <a href="{WA}" target="_blank" rel="noopener">{ICO_WA}WhatsApp</a>
  <a href="{TG}" target="_blank" rel="noopener">{ICO_TG}Telegram</a>
  <a class="pr" href="#zayavka">{ICO_MAIL}Заявка</a>
</nav>

<script src="assets/site.js" defer></script>

<script type="application/ld+json">
{json.dumps(ld, ensure_ascii=False, indent=2)}
</script>

<script type="application/ld+json">
{json.dumps(faq_ld, ensure_ascii=False, indent=2)}
</script>

</body>
</html>
'''


def chips_html(chips):
    out = []
    for c in chips:
        out.append(f'      <li class="chip"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true">'
                   f'<path d="M20 6L9 17l-5-5"/></svg>{c}</li>')
    return '\n'.join(out)


docs = pathlib.Path('/home/user/-/docs')
for p in PAGES:
    (docs / p["file"]).write_text(build(p), encoding='utf-8')
    print('написано', p["file"])
