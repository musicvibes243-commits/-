/* Прайс-лист одним PDF, слайдами 16:9 — чтобы отправлять клиенту файлом.
   Тёмная тема с оранжевым: как на сайте, чтобы файл и сайт читались
   как одно целое. Цифры только настоящие: из кабинета Директа мужа
   и из портфолио. Придуманный процент здесь убил бы весь файл.
   Запуск:  node prays-pdf.js                                           */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const W = 1600, H = 900, PAD = 86;
const foto2 = f => {
  const p = path.join(__dirname, '..', 'foto', 'portfolio', f);
  return fs.existsSync(p) ? 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64') : '';
};
const qr = () => {
  const p = path.join(__dirname, '..', 'foto', 'qr', 'qr-sayt.png');
  return fs.existsSync(p) ? 'data:image/png;base64,' + fs.readFileSync(p).toString('base64') : '';
};
const foto = f => {
  const p = path.join(__dirname, '..', 'foto', 'avito-kartinki', f);
  return fs.existsSync(p) ? 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64') : '';
};
const sayt = f => {
  const p = path.join(__dirname, '..', '..', 'ayko', 'img', f);
  return fs.existsSync(p) ? 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64') : '';
};

// Верх каждого снимка срезан: в шапках сайтов стоят телефоны заказчиков,
// а прайс уходит чужим людям. Проценты те же, что в карточках для Авито.
const RABOTY = [
  { src: sayt('septic.jpg'),               crop: 11, t: 'Стройинвест', s: 'Септики и дренаж' },
  { src: sayt('simba.jpg'),                crop: 10, t: 'Симба',       s: 'Ветклиника' },
  { src: sayt('savva.jpg'),                crop: 10, t: 'Savva',       s: 'Учебный проект' },
  { src: sayt('anikor.jpg'),               crop:  8, t: 'Аникор',      s: 'Не запущен, скриншот' },
  { src: sayt('atelier.jpg'),              crop: 16, t: 'Atelier',     s: 'Не запущен, скриншот' },
  { src: foto2('snimki/ayko-monitor.jpg'), crop:  0, t: 'AYKO',        s: 'Этот сайт и этот прайс' },
];

// Макеты, а не работающие сайты. Подписаны отдельно и отдельной страницей,
// иначе это выдача придуманного за сделанное.
const MAKETY = [
  { src: foto2('karta-savva-arka.jpg'),    t: 'Вариант «Арка»' },
  { src: foto2('karta-savva-vitrina.jpg'), t: 'Вариант «Витрина»' },
  { src: foto2('karta-savva-gazeta.jpg'),  t: 'Вариант «Газета»' },
];
const MAKETY2 = [
  { src: foto2('karta-atelier-2.jpg'),   t: 'Atelier — вторая версия главной (скриншот)' },
  { src: foto2('karta-ayko-cosmos.jpg'), t: 'AYKO «Космос» — aykoweb.ru/cosmos.html' },
];

const T = (rows) => `<table class="pr">${rows.map(r =>
  `<tr><td class="u">${r[0]}${r[3] ? `<i>${r[3]}</i>` : ''}</td><td class="s">${r[1]}</td><td class="c">${r[2]}</td></tr>`).join('')}</table>`;

const SLIDES = [
  // 1 — обложка
  `<div class="sl cover">
     <div class="mark">AYK<i>O</i></div>
     <h1>Прайс-лист</h1>
     <p class="lead">Объявления на Авито, реклама в Яндексе, сайты, боты и карточки для маркетплейсов</p>
     <div class="foot"><span>aykoweb.ru</span><span>+7 977 556-76-01</span></div>
   </div>`,
  // 2 — направления
  `<div class="sl"><h2>Три направления</h2>
     <div class="cards">
       <div class="cd"><b>Объявления и реклама</b><p>Авито и Яндекс: тексты, фотографии, настройка, ведение. Карточка в Яндекс Картах.</p></div>
       <div class="cd"><b>Сайты и боты</b><p>Сайт под ключ или по подписке. Телеграм-бот для заявок, мини-приложение.</p></div>
       <div class="cd"><b>Маркетплейсы</b><p>Фото товара на модели, инфографика и описание для Wildberries и Ozon.</p></div>
     </div>
     <p class="note">Работаю удалённо, по всей России. Гарантия на работу — месяц бесплатных правок.</p>
   </div>`,
  // 3 — Авито
  `<div class="sl"><h2>Авито</h2>
     ${T([
       ['Разбор объявления', '1 день', 'бесплатно', 'посмотрю карточку и скажу, что мешает её открывать'],
       ['Фотографии: отбор и обработка', '2 дня', '1 500 ₽', ''],
       ['Переписать объявление', '3 дня', '2 500 ₽', 'заголовок, описание, порядок фотографий'],
       ['Объявление под ключ', '5 дней', '4 000 ₽', ''],
       ['Ведение Авито', 'месяц', '8 000 ₽', ''],
       ['Оформление профиля и портфолио', '2 дня', '2 000 ₽', ''],
     ])}
   </div>`,
  // 4 — реклама
  `<div class="sl"><h2>Реклама</h2>
     ${T([
       ['Настройка рекламы в Яндексе', '7 дней', '6 000 ₽', ''],
       ['Ведение рекламы в Яндексе', 'месяц', '7 000 ₽', 'бюджет вы платите Яндексу сами, процента с него не беру'],
       ['Авито Реклама: ведение', 'месяц', '10 000 ₽', 'кабинет открывают только юрлицам и ИП'],
       ['Карточка в Яндекс Картах', '3 дня', '3 000 ₽', 'доступ остаётся у вас'],
       ['Консультация', '1 час', '2 000 ₽', ''],
     ])}
   </div>`,
  // 5 — сайты, боты и CRM
  `<div class="sl"><h2>Сайты, боты и CRM</h2>
     ${T([
       ['Сайт под ключ', '10 дней', '15 000 ₽', 'сайт ваш, со всеми исходными файлами'],
       ['Сайт по подписке', '—', '2 000 ₽/мес', 'домен, хостинг и правки входят'],
       ['Телеграм-бот для заявок', '3–7 дней', '6 000 ₽', 'бот на вашем аккаунте, абонентской платы нет'],
       ['Бот в WhatsApp', 'неделя', '9 000 ₽', 'доступ через провайдера оплачивается отдельно'],
       ['Мини-приложение в Телеграме', '7–14 дней', 'от 5 000 ₽', ''],
       ['CRM мини-приложением', '2–3 недели', 'от 20 000 ₽', 'без лицензий и оплаты за каждого сотрудника'],
     ])}
     <div class="vrez"><b>Подписка — это не рассрочка.</b> Сайт работает, пока идёт подписка. Перестали платить — сайт выключается, и он не становится вашим. Это честнее сказать сразу.</div>
   </div>`,
  // 6 — цифры
  `<div class="sl"><h2>Цифры из кабинета</h2>
     <p class="lead">Реклама в Яндексе для инженера по септикам и отоплению. Два месяца, скриншоты из кабинета — в портфолио.</p>
     <div class="nums">
       <div><b>470</b><span>переходов на сайт</span></div>
       <div><b>19 ₽</b><span>цена перехода</span></div>
       <div><b>7,2 %</b><span>кликабельность</span></div>
     </div>
     <p class="note">Это переходы, а не заявки. Сколько из них позвонило — считает заказчик, и я не приписываю себе его продажи.</p>
   </div>`,
  // 7 — как работаю
  `<div class="sl"><h2>Как это устроено</h2>
     <div class="steps">
       <div><i>1</i><b>Разбор</b><p>Смотрю, что у вас есть сейчас, и говорю, что мешает. Бесплатно, до всякой оплаты.</p></div>
       <div><i>2</i><b>Цена</b><p>Называю сумму и срок до начала работы. После — не меняю.</p></div>
       <div><i>3</i><b>Работа</b><p>Показываю результат до публикации. Правки внутри цены.</p></div>
       <div><i>4</i><b>Месяц поддержки</b><p>Мелкие правки после сдачи — бесплатно, месяц.</p></div>
     </div>
   </div>`,
  // 8 — чего не обещаю
  `<div class="sl"><h2>Чего не обещаю</h2>
     <div class="nope">
       <div><b>Конкретное число звонков.</b> На него влияют ваша цена, район и то, как вы говорите по телефону. Я отвечаю за то, что объявление станут открывать.</div>
       <div><b>Первое место в выдаче.</b> На Авито и в Яндексе это аукцион. Место покупается ставкой, а не текстом.</div>
       <div><b>Покупных отзывов.</b> Площадки их вычисляют и режут карточку целиком. Восстанавливать дороже, чем не делать.</div>
     </div>
     <p class="note">Этот список длиннее, чем у большинства. Так и задумано: обещать меньше проще, чем потом объясняться.</p>
   </div>`,
  // портфолио: сначала все работы разом, потом по одной крупно
  `<div class="sl"><h2>Работы</h2>
     <div class="setka">${RABOTY.map(r => `<div class="tl">
       <div class="sh"><img src="${r.src}" style="transform:translateY(-${r.crop}%)" alt=""></div>
       <div class="cap"><b>${r.t}</b><span>${r.s}</span></div>
     </div>`).join('')}</div>
     <p class="note">Верх снимков срезан: в шапках сайтов стоят телефоны заказчиков. Сайты, которые не запущены, показаны скриншотами.</p>
   </div>`,
  `<div class="sl pf"><h2>Savva</h2>
     <img src="${foto2('karta-savva.jpg')}" alt="">
     <p class="note">Учебный проект: спешелти-кофейня в Медине, три языка. Сайт не запущен, поэтому показываю скриншотами.</p>
   </div>`,
  `<div class="sl pf"><h2>Atelier</h2>
     <img src="${foto2('karta-atelier.jpg')}" alt="">
     <p class="note">Школа портного и швейный коворкинг в Королёве. Сайт сделан, но не запущен, поэтому показываю скриншотами.</p>
   </div>`,
  `<div class="sl pf"><h2>AYKO</h2>
     <img src="${foto2('karta-ayko.jpg')}" alt="">
     <p class="note">Собственный сайт. На нём же бот для заявок и этот прайс — то, что я предлагаю вам, сначала сделано себе.</p>
     <p class="ssyl"><a href="https://aykoweb.ru">aykoweb.ru</a></p>
   </div>`,
  `<div class="sl"><h2>Варианты оформления</h2>
     <div class="demos">${MAKETY.map(m => `<figure>
       <img src="${m.src}" alt=""><figcaption>${m.t}</figcaption>
     </figure>`).join('')}</div>
     <p class="note">Три варианта главной для одной и той же кофейни. Это макеты, а не работающие сайты — показываю, из чего обычно выбирают.</p>
     <p class="ssyl"><a href="https://aykoweb.ru/raboty/savva-arka/">aykoweb.ru/raboty/savva-arka/</a> · <a href="https://aykoweb.ru/raboty/savva-vitrina/">savva-vitrina/</a> · <a href="https://aykoweb.ru/raboty/savva-gazeta/">savva-gazeta/</a></p>
   </div>`,
  `<div class="sl"><h2>Один сайт — разное лицо</h2>
     <div class="demos dva">${MAKETY2.map(m => `<figure>
       <img src="${m.src}" alt=""><figcaption>${m.t}</figcaption>
     </figure>`).join('')}</div>
     <p class="note">Слева — вторая версия главной для ателье, скриншот: сайт не запущен. Справа — другое оформление моего сайта, он работает: aykoweb.ru/cosmos.html.</p>
     <p class="ssyl"><a href="https://aykoweb.ru/cosmos.html">aykoweb.ru/cosmos.html</a></p>
   </div>`,
  `<div class="sl pf"><h2>На минуточку</h2>
     <img src="${foto2('karta-minutka.jpg')}" alt="">
     <p class="note">Кофейня у Измайловского парка: меню с ценами, отзывы, корзина и переключение на английский. Это макет — показываю, каким может быть сайт заведения целиком, а не одной страницей.</p>
     <p class="ssyl">Открыть и пролистать: <a href="https://aykoweb.ru/raboty/na-minutochku/">aykoweb.ru/raboty/na-minutochku/</a></p>
   </div>`,
  `<div class="sl pf"><h2>КРОМКА</h2>
     <img src="${foto2('karta-kromka.jpg')}" alt="">
     <p class="note">Кофейня авторских десертов. Такой кофейни нет — это макет. Десерты нарисованы: когда своих фотографий ещё нет, сайт всё равно можно запустить.</p>
     <p class="ssyl">Открыть и пролистать: <a href="https://aykoweb.ru/raboty/kromka/">aykoweb.ru/raboty/kromka/</a></p>
   </div>`,
  // контакты
  `<div class="sl cover">
     <h1 class="sm">Первым трём клиентам — 30 %</h1>
     <p class="lead">В обмен на отзыв после работы. Мне нужны отзывы, вам — цена ниже.</p>
     <div class="cont"><b>+7 977 556-76-01</b><span>aykoweb.ru</span><span>Пишите в сообщения — отвечу в тот же день</span></div>
     <img class="qr" src="${qr()}" alt="">
   </div>`,
];

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0d0e12;font-family:'DejaVu Sans','Liberation Sans',sans-serif;color:#fff}
.sl{width:${W}px;height:${H}px;padding:${PAD}px;position:relative;overflow:hidden;
  page-break-after:always;display:flex;flex-direction:column;background:#0d0e12}
.sl:last-child{page-break-after:auto}
.sl::before{content:"";position:absolute;right:-220px;top:-200px;width:760px;height:760px;
  border-radius:50%;background:radial-gradient(circle,rgba(232,102,63,.22) 0%,rgba(232,102,63,0) 68%)}
.sl>*{position:relative;z-index:2}
h1{font-size:104px;font-weight:700;letter-spacing:-.03em;line-height:1}
h1.sm{font-size:74px}
h2{font-size:58px;font-weight:700;letter-spacing:-.02em;margin-bottom:26px}
.mark{font-size:40px;font-weight:700;letter-spacing:.16em;margin-bottom:auto}
.mark i{font-style:normal;color:#e8663f}
.cover{justify-content:flex-start}
.lead{margin-top:26px;font-size:30px;line-height:1.45;color:#c6c1cd;max-width:1000px}
.foot{margin-top:auto;display:flex;gap:54px;font-size:28px;color:#8f8a97}
.cont{margin-top:auto}
.cont b{display:block;font-size:76px;font-weight:700;letter-spacing:-.02em}
.cont span{display:block;margin-top:14px;font-size:28px;color:#a9a4b2}
.cont span:first-of-type{color:#e8663f;font-size:34px;font-weight:600}
table.pr{width:100%;border-collapse:collapse}
table.pr td{padding:11px 0;border-bottom:1px solid rgba(255,255,255,.1);vertical-align:top}
td.u{font-size:26px;font-weight:600}
td.u i{display:block;font-style:normal;font-size:19px;font-weight:400;color:#8f8a97;margin-top:5px}
td.s{font-size:24px;color:#8f8a97;white-space:nowrap;text-align:right;padding-right:52px;width:190px}
td.c{font-size:30px;font-weight:700;color:#e8663f;white-space:nowrap;text-align:right;width:220px}
.cards{display:flex;gap:26px}
.cd{flex:1;background:#17181e;border-radius:22px;padding:34px}
.cd b{display:block;font-size:32px;margin-bottom:14px}
.cd p{font-size:23px;line-height:1.45;color:#a9a4b2}
.note{margin-top:auto;padding-top:30px;font-size:22px;line-height:1.5;color:#8f8a97}
.vrez{margin-top:34px;border-left:6px solid #e8663f;padding-left:26px;font-size:24px;
  line-height:1.5;color:#c6c1cd}
.vrez b{color:#fff}
.two{flex-direction:row;gap:48px}
.two>div:first-child{flex:1.15;display:flex;flex-direction:column}
.pic{flex:1;display:flex;flex-direction:column;justify-content:center;gap:16px}
.pic img{width:100%;border-radius:18px;display:block}
.pic span{font-size:20px;color:#8f8a97;line-height:1.4}
.nopic{height:400px;border:3px dashed #3a3b44;border-radius:18px}
.nums{margin-top:44px;display:flex;gap:56px}
.nums b{display:block;font-size:92px;font-weight:700;color:#e8663f;letter-spacing:-.03em}
.nums span{display:block;margin-top:8px;font-size:24px;color:#a9a4b2}
.steps{display:flex;gap:24px}
.steps>div{flex:1;background:#17181e;border-radius:22px;padding:32px}
.steps i{display:block;font-style:normal;font-size:30px;font-weight:700;color:#e8663f;margin-bottom:14px}
.steps b{display:block;font-size:28px;margin-bottom:12px}
.steps p{font-size:21px;line-height:1.45;color:#a9a4b2}
.nope{display:grid;gap:22px}
.nope>div{background:#17181e;border-radius:20px;padding:30px 34px;font-size:25px;
  line-height:1.5;color:#a9a4b2}
.nope b{color:#fff}
.setka{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.tl{background:#17181e;border-radius:18px;overflow:hidden}
.tl .sh{position:relative;height:158px;overflow:hidden;background:#fff}
.tl .sh img{position:absolute;left:0;top:0;width:100%;display:block}
.tl .cap{padding:16px 20px 18px}
.tl .cap b{display:block;font-size:26px;font-weight:700}
.tl .cap span{display:block;margin-top:6px;font-size:20px;color:#8f8a97;line-height:1.35}
.demos{display:flex;gap:28px;align-items:center;flex:1;min-height:0}
.demos figure{flex:1;min-width:0}
.demos.dva{gap:46px;padding:0 40px}
.demos img{width:100%;border-radius:14px;display:block;box-shadow:0 18px 40px rgba(0,0,0,.5)}
.demos figcaption{margin-top:16px;font-size:22px;color:#8f8a97;text-align:center}
.pf img{display:block;margin:0 auto;max-width:100%;max-height:460px;width:auto;
  border-radius:18px;box-shadow:0 26px 60px rgba(0,0,0,.5)}
.pf .note{margin-top:22px}
.ssyl{margin-top:16px;font-size:23px;font-weight:600;line-height:1.4}
.ssyl a{color:#e8663f;text-decoration:none;border-bottom:1px solid rgba(232,102,63,.45)}
.qr{position:absolute;right:${PAD}px;bottom:${PAD}px;width:210px;height:210px;
  border-radius:14px;z-index:3}
`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.setContent(`<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>${CSS}</style></head><body>${SLIDES.join('')}</body></html>`);
  await p.waitForTimeout(600);

  const bad = await p.evaluate(({ W, H, PAD }) => {
    const err = [];
    document.querySelectorAll('.sl').forEach((sl, n) => {
      const s = sl.getBoundingClientRect();
      if (sl.scrollHeight > sl.clientHeight + 2) err.push(
        `слайд ${n + 1}: содержимое не помещается по высоте — ${sl.scrollHeight} при ${sl.clientHeight}, ` +
        `лишние ${sl.scrollHeight - sl.clientHeight} px; внутри: ` +
        [...sl.children].map(c => `${c.tagName.toLowerCase()} ${Math.round(c.getBoundingClientRect().height)}`).join(', '));
      // ширину слайда не меряем: декоративное свечение нарочно уходит за край
      // и обрезается. Реальные вылеты ловит проверка по каждому элементу ниже.
      sl.querySelectorAll('*').forEach(e => {
        const r = e.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const kus = (e.textContent || '').trim().slice(0, 22);
        if (r.right > s.right - PAD + 3 || r.left < s.left + PAD - 3)
          err.push(`слайд ${n + 1}: «${kus}» выходит за поле`);
        if (e.scrollWidth > e.clientWidth + 2) err.push(`слайд ${n + 1}: «${kus}» обрезан по ширине`);
      });
    });
    const img = document.querySelector('.pic img');
    if (img && !img.naturalWidth) err.push('пример работы не загрузился');
    return [...new Set(err)].slice(0, 12);
  }, { W, H, PAD });

  if (bad.length) { console.log('✗ ' + bad.join('\n✗ ')); await b.close(); process.exit(1); }

  const out = path.join(__dirname, '..', 'prays');
  await p.pdf({ path: path.join(out, 'AYKO-prays.pdf'), width: `${W}px`, height: `${H}px`,
                printBackground: true, pageRanges: '1-' + SLIDES.length });
  for (let i = 0; i < SLIDES.length; i++) {
    const el = (await p.$$('.sl'))[i];
    await el.screenshot({ path: path.join(out, `slide-${String(i + 1).padStart(2, '0')}.png`) });
  }
  console.log(`✓ AYKO-prays.pdf — ${SLIDES.length} страниц, плюс превью отдельными картинками`);
  await b.close();
})();
