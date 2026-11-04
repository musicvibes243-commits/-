/* Портфолио одним PDF: его можно отправить файлом, без ссылок.
   В файл не входят: «На минуточку» (в баннере телефон), Симба (картинка
   мала для страницы). Стройинвест добавлен после согласия владельца компании.
   У каждой работы статус указан честно.
   Запуск:  node portfolio.js                                              */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const PF = path.join(__dirname, '..', 'foto', 'portfolio');
const AN = path.join(__dirname, '..', 'foto', 'rabota-anikor-yoga.jpg');
const img = p => 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64');

const RABOTY = [
  { img: img(path.join(PF, 'karta-ayko.jpg')),        nazv: 'Мой сайт — aykoweb.ru',                  st: 'Работает',           k: 'ok',
    pod: 'Сайт для мастеров: тексты, форма заявки, версия для телефона. Открывается по ссылке.' },
  { img: img(path.join(PF, 'karta-ayko-cosmos.jpg')), nazv: 'Вариант «Космос»',                         st: 'Работает',           k: 'ok',
    pod: 'Тот же сайт в другом оформлении: спокойный стиль, много воздуха.' },
  { img: img(path.join(PF, 'karta-kromka.jpg')),      nazv: 'КРОМКА — кофейня авторских десертов',      st: 'Макет',              k: 'no',
    pod: 'Демо: такой кофейни нет. Сделано, чтобы показать витрину, меню и адрес.' },
  { img: img(path.join(PF, 'karta-atelier.jpg')),     nazv: 'Atelier — швейное ателье в Королёве',      st: 'Сделан, не запущен', k: 'no',
    pod: 'Пошив, школа портного и коворкинг. Сайт готов, но не опубликован, поэтому показываю скриншотом.' },
  { img: img(AN),                                      nazv: 'Аникор — студия йоги',                     st: 'Сделан, не опубликован', k: 'no',
    pod: 'Практики с ценами, пробное занятие, расписание. Скриншот главного экрана.' },
  { img: img(path.join(__dirname, '..', 'foto', 'rabota-stroyinvest-septiki.jpg')), nazv: 'Стройинвест — септики и дренаж', st: 'Скриншот', k: 'no',
    pod: 'Монтаж септиков, кессонов и дренажа в Москве и Подмосковье. Скриншот главного экрана сайта компании.' },
  { img: img(path.join(PF, 'karta-savva.jpg')),       nazv: 'SAVVA — кофейня в Медине',                 st: 'Учебный проект',     k: 'no',
    pod: 'Учебный проект: меню, три языка, переключение темы. Сайт сейчас не опубликован.' },
];

const stranica = (inner) => `<section class="p">${inner}</section>`;
const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
@page{size:1600px 900px;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0d0e12;color:#fff;font-family:'DejaVu Sans','Liberation Sans',sans-serif}
.p{width:1600px;height:900px;padding:60px 80px;position:relative;overflow:hidden;page-break-after:always;
   background:#0d0e12;display:flex;flex-direction:column}
.p:last-child{page-break-after:auto}
.p::before{content:"";position:absolute;right:-220px;top:-200px;width:700px;height:700px;border-radius:50%;
   background:radial-gradient(circle,rgba(232,102,63,.2),rgba(232,102,63,0) 68%)}
.z{position:relative;z-index:2}
.mark{font-size:34px;font-weight:700;letter-spacing:.16em}
.mark i{font-style:normal;color:#e8663f}
.ker{font-size:24px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#e8663f;margin-top:10px}
h1{font-size:88px;font-weight:700;line-height:1.04;letter-spacing:-.02em;margin-top:30px}
.lid{font-size:32px;line-height:1.45;color:#c6c1cd;margin-top:26px;max-width:1100px}
.kont{margin-top:auto;font-size:40px;font-weight:700}
.kont span{display:block;font-size:30px;font-weight:600;color:#e8663f;margin-top:12px}
.h{display:flex;justify-content:space-between;align-items:flex-start;gap:30px;position:relative;z-index:2}
.h h2{font-size:48px;font-weight:700;letter-spacing:-.01em}
.st{flex:none;padding:12px 26px;border-radius:999px;font-size:26px;font-weight:600;color:#fff;margin-top:6px}
.st.ok{background:#2e7d32}.st.no{background:#8a8a8a}
.pod{font-size:28px;line-height:1.4;color:#c6c1cd;margin-top:14px;position:relative;z-index:2}
.pic{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;margin-top:24px;position:relative;z-index:2}
.pic img{max-height:600px;max-width:1440px;width:auto;height:auto;border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.5)}
.nomer{position:absolute;right:80px;bottom:30px;font-size:22px;color:#8f8a97;z-index:2}
</style></head><body>

${stranica(`<div class="z">
  <div class="mark">AYK<i>O</i></div>
  <div class="ker">Портфолио</div>
  <h1>Сайты, которые я делаю</h1>
  <p class="lid">Сайты для мастеров и небольших заведений. Реклама на Авито и в Яндекс Директе. Карточки для Wildberries и Ozon. Ниже каждая работа со статусом: что открывается, а что показано скриншотом.</p>
</div>
<div class="kont z">Телефон: +7 977 556-76-01<span>Пишите в сообщения, отвечу в тот же день · работаю удалённо, по всей России</span></div>`)}

${RABOTY.map((r, i) => stranica(`<div class="h"><h2>${r.nazv}</h2><span class="st ${r.k}">${r.st}</span></div>
  <p class="pod">${r.pod}</p>
  <div class="pic"><img src="${r.img}" alt=""></div>
  <div class="nomer">Работа ${i + 1} из ${RABOTY.length}</div>`)).join('\n')}

${stranica(`<div class="z">
  <div class="mark">AYK<i>O</i></div>
  <div class="ker">Что можно заказать</div>
  <h1 style="font-size:70px">Сайт, реклама, карточки</h1>
  <p class="lid">Сайт-визитка под ключ: 10 дней, дизайн, тексты, версия для телефона, форма заявки. Объявление на Авито: переписываю так, чтобы его открывали. Настройка рекламы в Яндекс Директе. Карточки для маркетплейсов.</p>
  <p class="lid">Цены и примеры — в прайсе. Отправлю его по запросу, он без ссылок: файлом.</p>
</div>
<div class="kont z">+7 977 556-76-01<span>aykoweb.ru · работаю удалённо</span></div>`)}
</body></html>`;

(async () => {
  const br = await chromium.launch();
  const p = await br.newPage();
  await p.setContent(html, { waitUntil: 'load' });
  await p.waitForTimeout(400);
  const bad = await p.evaluate(() => {
    const e = [];
    document.querySelectorAll('.p').forEach((sec, i) => {
      if (sec.scrollHeight > sec.clientHeight + 2) e.push(`страница ${i + 1}: содержимое не помещается`);
    });
    document.querySelectorAll('img').forEach((im, i) => { if (!im.naturalWidth) e.push(`картинка ${i + 1} не загрузилась`); });
    return e;
  });
  if (bad.length) { console.log('✗ ' + bad.join('\n✗ ')); process.exit(1); }
  const out = path.join(__dirname, 'AYKO-portfolio.pdf');
  await p.pdf({ path: out, width: '1600px', height: '900px', printBackground: true, preferCSSPageSize: true });
  console.log('✓ AYKO-portfolio.pdf —', Math.round(fs.statSync(out).size / 1024), 'КБ');
  await br.close();
})();
