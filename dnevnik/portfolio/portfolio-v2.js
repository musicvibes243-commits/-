/* Портфолио, версия 2: светлое, с картинками и описанием у каждой работы.
   Описания — только то, что видно на скриншотах или записано в проекте.
   Цифр «результатов» нет: их не было, а выдумывать нельзя.
   Статусы честные: «Работает», «Сделан, не опубликован», «Скриншот»,
   «Учебный проект», «Макет», «Пример».
   Запуск:  node portfolio-v2.js                                          */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const KORNI = path.join(__dirname, '..', '..');
const F = (...p) => path.join(KORNI, 'dnevnik', 'foto', ...p);
const img = p => {
  const ext = path.extname(p).slice(1).replace('jpg', 'jpeg');
  return `data:image/${ext};base64,` + fs.readFileSync(p).toString('base64');
};

const RABOTY = [
  { id: 'ayko', img: F('portfolio', 'karta-ayko.jpg'), nazv: 'Мой сайт — aykoweb.ru', st: 'Работает', k: 'ok',
    zad: 'Показать, что я делаю, и получать заявки без посредников.',
    sd: ['Тексты и структура страниц', 'Форма заявки: заявка приходит в Telegram', 'Чат-помощник, который отвечает на частые вопросы', 'Версия для телефона'],
    kto: 'Мастера и небольшие заведения, которым нужен сайт без студии.' },
  { id: 'cosmos', img: F('portfolio', 'karta-ayko-cosmos.jpg'), nazv: 'Вариант «Космос»', st: 'Работает', k: 'ok',
    zad: 'Показать, что один и тот же сайт можно сделать в другом характере.',
    sd: ['Тёмное спокойное оформление', 'Крупный заголовок, минимум лишних элементов', 'Та же структура разделов, что у основного сайта'],
    kto: 'Тем, кому не подходит яркая подача.' },
  { id: 'atelier', img: F('portfolio', 'karta-atelier.jpg'), nazv: 'Atelier — швейное ателье в Королёве', st: 'Сделан, не опубликован', k: 'no',
    zad: 'Показать три направления ателье и дать клиенту записаться.',
    sd: ['Три направления: пошив и подгонка, школа портного, швейный коворкинг', 'Цена места по часам на первом экране', 'Кнопки «Позвонить» и «Как добраться»', 'Версия для телефона'],
    kto: 'Ателье, школы шитья и коворкинги.' },
  { id: 'anikor', img: F('rabota-anikor-yoga.jpg'), nazv: 'Аникор — студия йоги', st: 'Сделан, не опубликован', k: 'no',
    zad: 'Привести человека на пробное занятие.',
    sd: ['Практики с ценами', 'Пробное занятие за 500 ₽', 'Расписание групп и адрес', 'Раздел с отзывами'],
    kto: 'Студии йоги и небольшие фитнес-студии.' },
  { id: 'stroy', img: F('rabota-stroyinvest-septiki.jpg'), nazv: 'Стройинвест — септики и дренаж', st: 'Скриншот', k: 'no',
    zad: 'Рассказать об услугах и получить заявку на монтаж.',
    sd: ['Септики, кессоны и дренаж под ключ', 'Подбор оборудования под бюджет', 'Бесплатная доставка при заказе установки', 'Кнопки «Оставить заявку» и «Подобрать систему»'],
    kto: 'Монтажные и сервисные компании.' },
  { id: 'savva', img: F('portfolio', 'karta-savva.jpg'), nazv: 'SAVVA — кофейня в Медине', st: 'Учебный проект', k: 'no',
    zad: 'Учебный проект: сайт кофейни.',
    sd: ['Меню', 'Конструктор своей чашки', 'Три языка на сайте', 'Переключатель светлой и тёмной темы'],
    kto: 'Кофейни, которым нужны несколько языков.' },
  { id: 'kromka', img: F('portfolio', 'karta-kromka.jpg'), nazv: 'КРОМКА — кофейня авторских десертов', st: 'Макет', k: 'no',
    zad: 'Показать, как выглядит сайт кофейни с десертами.',
    sd: ['Витрина недели с ценами', 'Меню кофе', 'Бронь стола', 'Адрес и часы работы'],
    kto: 'Кофейни и кондитерские.' },
  { id: 'minutka', img: F('portfolio', 'karta-minutka.jpg'), nazv: 'На минуточку — кофейня в Измайлово', st: 'Макет', k: 'no',
    zad: 'Показать двуязычный сайт кофейни, где можно заказать через корзину.',
    sd: ['Меню с ценами', 'Отзывы', 'Корзина', 'Переключение языка'],
    kto: 'Кофейни, которым нужен заказ через сайт.' },
];

const body = [];
const pg = inner => body.push(`<section class="pg">${inner}<div class="ft"><b>AYK<i>O</i></b> · aykoweb.ru · +7 977 556-76-01</div></section>`);

// 1. обложка
pg(`<div class="cov">
  <div class="cov-l">
    <div class="ker">Портфолио</div>
    <h1>Сайты и реклама для мастеров и небольших заведений</h1>
    <p class="lead">Ниже работы с честным статусом: что открывается по ссылке, а что показано скриншотом или макетом.</p>
    <div class="cov-k">+7 977 556-76-01<span>пишите в сообщения, отвечу в тот же день</span></div>
  </div>
  <div class="mos">
    <img src="${img(F('portfolio','karta-ayko.jpg'))}" alt="">
    <img src="${img(F('portfolio','karta-atelier.jpg'))}" alt="">
    <img src="${img(F('portfolio','karta-savva.jpg'))}" alt="">
    <img src="${img(F('portfolio','karta-kromka.jpg'))}" alt="">
  </div>
</div>`);

// 2. что делаю
pg(`<div class="kick">Что я делаю</div>
<h2>Четыре направления, одна исполнительница</h2>
<div class="tiles">
  <div class="tile"><b>Сайты</b><p>Визитки, сайты услуг, кофеен и мастеров. Форма заявки, запись, карта, версия для телефона.</p></div>
  <div class="tile"><b>Объявления на Авито</b><p>Переписываю заголовок и описание так, чтобы их открывали. Оформляю обложку и картинки.</p></div>
  <div class="tile"><b>Яндекс Директ</b><p>Настройка и ведение кампаний. Бюджет вы платите Яндексу напрямую, я не беру процент с рекламы.</p></div>
  <div class="tile"><b>Карточки для маркетплейсов</b><p>Предметные снимки и карточки для Wildberries и Ozon. Одежда на модели — с помощью нейросети, без съёмки.</p></div>
</div>
<p class="note">Боты и мини-приложения в Telegram тоже делаю. Примеры покажу по запросу в личных сообщениях.</p>`);

// 3. как работаю
pg(`<div class="kick">Как работаю</div>
<h2>Сначала цена, потом работа</h2>
<div class="steps">
  <div class="step"><i>1</i><b>Разговор</b><p>Вы рассказываете, что нужно. Я смотрю задачу и называю цену и срок до начала.</p></div>
  <div class="step"><i>2</i><b>Цена</b><p>Цена фиксируется до работы. После согласования я её не меняю.</p></div>
  <div class="step"><i>3</i><b>Работа</b><p>Показываю результат до публикации. Правки в рамках договорённого.</p></div>
  <div class="step"><i>4</i><b>Поддержка</b><p>После сдачи — месяц бесплатных правок. Дальше — по договорённости.</p></div>
</div>`);

// 5–12. работы
RABOTY.forEach((r, i) => {
  const portret = r.id === 'stroy';
  pg(`<div class="head"><span class="kick">Работа ${i + 1} из ${RABOTY.length}</span><span class="chip ${r.k}">${r.st}</span></div>
<h2>${r.nazv}</h2>
<div class="row">
  <div class="shot ${portret ? 'portret' : ''}"><img src="${img(r.img)}" alt=""></div>
  <div class="txt">
    <h3>Задача</h3><p>${r.zad}</p>
    <h3>Что сделано</h3><ul>${r.sd.map(s => `<li>${s}</li>`).join('')}</ul>
    <h3>Для кого</h3><p>${r.kto}</p>
  </div>
</div>`);
});

// 13. макеты SAVVA
pg(`<div class="head"><span class="kick">Одна кофейня — три оформления</span><span class="chip no">Макеты</span></div>
<h2>SAVVA: три варианта главной страницы</h2>
<div class="trio">
  <figure><img src="${img(F('portfolio','karta-savva-arka.jpg'))}" alt=""><figcaption><b>«Арка»</b> — тёплый, с акцентом на фасад</figcaption></figure>
  <figure><img src="${img(F('portfolio','karta-savva-vitrina.jpg'))}" alt=""><figcaption><b>«Витрина»</b> — строгая сетка, фото в центре</figcaption></figure>
  <figure><img src="${img(F('portfolio','karta-savva-gazeta.jpg'))}" alt=""><figcaption><b>«Газета»</b> — журнальная подача, крупные заголовки</figcaption></figure>
</div>
<p class="note">Макеты, а не работающие сайты. Показываю, из чего заказчик выбирает стиль до разработки.</p>`);

// 14. объявления и обложки
pg(`<div class="head"><span class="kick">Оформление объявлений</span><span class="chip no">Пример</span></div>
<h2>Обложка и картинки для объявления на Авито</h2>
<div class="trio">
  <figure><img src="${img(F('avito','01-oblozhka.jpg'))}" alt=""><figcaption><b>Обложка</b> — заход и одна строка о главном</figcaption></figure>
  <figure><img src="${img(F('kartochki','cena.jpg'))}" alt=""><figcaption><b>Цена</b> — одна цифра на весь экран</figcaption></figure>
  <figure><img src="${img(F('kartochki','tri-vechera.jpg'))}" alt=""><figcaption><b>Проблема</b> — короткая фраза о том, что болит</figcaption></figure>
</div>
<p class="note">Один стиль на все объявления и картинки. Такое оформление делаю под вашу услугу.</p>`);

// 15. маркетплейсы
pg(`<div class="head"><span class="kick">Карточки для маркетплейсов</span><span class="chip no">Пример</span></div>
<h2>Одежда и предметные снимки для Wildberries и Ozon</h2>
<div class="duo">
  <figure><img src="${img(F('mp-primer','posle-pered.jpg'))}" alt=""><figcaption><b>Одежда на модели</b> — создано с помощью нейросети, без съёмки модели</figcaption></figure>
  <figure><img src="${img(F('mp-primer','abaya-posle-set.jpg'))}" alt=""><figcaption><b>Набор кадров вещи</b> — подбор кадров для карточки на маркетплейсе</figcaption></figure>
</div>`);

// 16. контакты
pg(`<div class="kick">Контакты</div>
<h2>Напишите, что нужно</h2>
<p class="lead">Отвечу в тот же день. Посмотрю задачу, назову цену и срок до начала работы. Работаю удалённо, по всей России.</p>
<div class="cov-k big">+7 977 556-76-01<span>aykoweb.ru · работаю удалённо, по всей России</span></div>`);

const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
@page{size:1600px 900px;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#faf7f2;color:#17161a;font-family:'DejaVu Sans','Liberation Sans',sans-serif}
.pg{width:1600px;height:900px;padding:56px 80px 70px;position:relative;overflow:hidden;page-break-after:always;background:#faf7f2}
.pg:last-child{page-break-after:auto}
.ft{position:absolute;left:80px;right:80px;bottom:28px;font-size:20px;color:#8a847e}
.ft b{font-size:22px;letter-spacing:.14em;color:#17161a}.ft i{font-style:normal;color:#e8663f}
.kick{font-size:22px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#e8663f}
h1{font-size:76px;line-height:1.05;letter-spacing:-.02em;margin-top:22px}
h2{font-size:56px;line-height:1.1;letter-spacing:-.01em;margin-top:14px}
.lead{font-size:30px;line-height:1.45;color:#4a4650;margin-top:26px;max-width:1000px}
.note{font-size:24px;line-height:1.45;color:#5f5a64;margin-top:26px}
.head{display:flex;justify-content:space-between;align-items:center}
.chip{padding:12px 26px;border-radius:999px;font-size:24px;font-weight:700;color:#fff}
.chip.ok{background:#2e7d32}.chip.no{background:#8a847e}
/* обложка */
.cov{display:flex;gap:60px;height:100%;align-items:center}
.cov-l{width:700px}
.cov-k{margin-top:46px;font-size:44px;font-weight:700}
.cov-k span{display:block;font-size:26px;font-weight:600;color:#5f5a64;margin-top:10px}
.cov-k.big{font-size:70px;margin-top:40px}
.mos{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:22px;height:720px}
.mos img{width:100%;height:100%;object-fit:cover;border-radius:18px;box-shadow:0 14px 40px rgba(0,0,0,.14)}
/* что делаю */
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:40px}
.tile{background:#fff;border-radius:22px;padding:34px 38px;box-shadow:0 8px 26px rgba(0,0,0,.07)}
.tile b{font-size:34px;color:#17161a}
.tile p{font-size:25px;line-height:1.45;color:#4a4650;margin-top:12px}
/* как работаю */
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:44px}
.step{background:#fff;border-radius:22px;padding:34px 30px;box-shadow:0 8px 26px rgba(0,0,0,.07)}
.step i{font-style:normal;display:block;font-size:52px;font-weight:700;color:#e8663f}
.step b{display:block;font-size:30px;margin-top:10px}
.step p{font-size:23px;line-height:1.45;color:#4a4650;margin-top:12px}
/* работы */
.row{display:flex;gap:50px;margin-top:34px;height:600px}
.shot{width:860px;flex:none;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 14px 40px rgba(0,0,0,.12)}
.shot img{width:100%;height:auto;display:block}
.shot.portret{width:600px}
.shot.portret img{width:auto;height:100%;max-height:600px}
.txt{flex:1;min-width:0}
.txt h3{font-size:22px;letter-spacing:.1em;text-transform:uppercase;color:#e8663f;margin-top:22px}
.txt h3:first-child{margin-top:0}
.txt p{font-size:26px;line-height:1.45;color:#2d2a33;margin-top:8px}
.txt ul{list-style:none;margin-top:8px}
.txt li{font-size:25px;line-height:1.42;color:#2d2a33;padding-left:34px;position:relative;margin-top:7px}
.txt li::before{content:"";position:absolute;left:0;top:.5em;width:14px;height:9px;border-left:4px solid #e8663f;border-bottom:4px solid #e8663f;transform:rotate(-45deg)}
/* трио и дуэт */
.trio{display:grid;grid-template-columns:repeat(3,1fr);gap:34px;margin-top:40px}
.trio figure,.duo figure{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 12px 34px rgba(0,0,0,.1)}
.trio img{width:100%;height:340px;object-fit:cover;display:block}
.trio figcaption,.duo figcaption{padding:22px 26px;font-size:24px;line-height:1.4;color:#4a4650}
.trio figcaption b,.duo figcaption b{color:#17161a;font-size:26px}
.duo{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px}
.duo img{width:100%;height:400px;object-fit:cover;display:block}
</style></head><body>
${body.join('\n')}
</body></html>`;

(async () => {
  const br = await chromium.launch();
  const p = await br.newPage();
  await p.setContent(html, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  const bad = await p.evaluate(() => {
    const e = [];
    document.querySelectorAll('.pg').forEach((sec, i) => {
      if (sec.scrollHeight > sec.clientHeight + 2) e.push(`страница ${i + 1}: не влезает по высоте (${sec.scrollHeight}/${sec.clientHeight})`);
      sec.querySelectorAll('.txt, .tile, .step, .trio figcaption, .duo figcaption').forEach(el => {
        const r = el.getBoundingClientRect();
        const pg = sec.getBoundingClientRect();
        if (r.bottom > pg.bottom - 60) e.push(`страница ${i + 1}: текст уходит к подвалу`);
      });
    });
    document.querySelectorAll('img').forEach((im, i) => { if (!im.naturalWidth) e.push(`картинка ${i + 1} не загрузилась`); });
    return [...new Set(e)];
  });
  if (bad.length) { console.log('✗ ' + bad.join('\n✗ ')); process.exit(1); }
  const out = path.join(__dirname, 'AYKO-portfolio-v2.pdf');
  await p.pdf({ path: out, width: '1600px', height: '900px', printBackground: true, preferCSSPageSize: true });
  console.log('✓ AYKO-portfolio-v2.pdf —', Math.round(fs.statSync(out).size / 1024), 'КБ');
  await br.close();
})();
