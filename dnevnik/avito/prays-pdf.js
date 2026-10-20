/* Прайс-лист одним PDF, слайдами 16:9 — чтобы отправлять клиенту файлом.
   Тёмная тема с оранжевым: как на сайте, чтобы файл и сайт читались
   как одно целое. Цифры только настоящие: из кабинета Директа мужа
   и из портфолио. Придуманный процент здесь убил бы весь файл.
   Запуск:  node prays-pdf.js                                           */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const W = 1600, H = 900, PAD = 86;
const foto = f => {
  const p = path.join(__dirname, '..', 'foto', 'avito-kartinki', f);
  return fs.existsSync(p) ? 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64') : '';
};

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
  // 3 — прайс: объявления
  `<div class="sl"><h2>Объявления и реклама</h2>
     ${T([
       ['Разбор объявления', '1 день', 'бесплатно', 'посмотрю карточку и скажу, что мешает её открывать'],
       ['Фотографии: отбор и обработка', '2 дня', '1 500 ₽', ''],
       ['Переписать объявление', '3 дня', '2 500 ₽', ''],
       ['Объявление под ключ', '5 дней', '4 000 ₽', ''],
       ['Ведение Авито', 'месяц', '8 000 ₽', ''],
       ['Настройка рекламы в Яндексе', '7 дней', '6 000 ₽', ''],
       ['Карточка в Яндекс Картах', '3 дня', '3 000 ₽', ''],
       ['Консультация', '1 час', '2 000 ₽', ''],
       ['Оформление профиля и портфолио', '2 дня', '2 000 ₽', ''],
     ])}
   </div>`,
  // 4 — прайс: сайты
  `<div class="sl"><h2>Сайты и боты</h2>
     ${T([
       ['Сайт под ключ', '10 дней', '15 000 ₽', 'сайт ваш, со всеми исходными файлами'],
       ['Сайт по подписке', '—', '2 000 ₽/мес', 'домен, хостинг и правки входят'],
       ['Телеграм-бот для заявок', '3–7 дней', '6 000 ₽', 'бот на вашем аккаунте, абонентской платы нет'],
       ['Мини-приложение в Телеграме', '7–14 дней', 'от 5 000 ₽', 'каталог, расчёт стоимости, запись'],
     ])}
     <div class="vrez"><b>Подписка — это не рассрочка.</b> Сайт работает, пока идёт подписка. Перестали платить — сайт выключается, и он не становится вашим. Это честнее сказать сразу.</div>
   </div>`,
  // 5 — прайс: маркетплейсы + доказательство
  `<div class="sl two"><div>
     <h2>Маркетплейсы</h2>
     ${T([
       ['Комплект на карточку', '2 дня', '2 500 ₽', 'главное фото, 4 инфографики, описание'],
       ['Отдельный кадр на модели', '1 день', '400 ₽', ''],
       ['Описание с ключами', '1 день', '700 ₽', ''],
     ])}
     <p class="note">Каждый кадр сверяю с вашим исходником и показываю до загрузки: товар на картинке обязан совпадать с товаром в коробке.</p>
   </div><div class="pic">
     ${foto('17-abaya-do-posle.jpg') ? `<img src="${foto('17-abaya-do-posle.jpg')}" alt="">` : '<div class="nopic">пример работы</div>'}
     <span>Вещь на вешалке в подсобке → комплект из четырёх кадров</span>
   </div></div>`,
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
  // 9 — контакты
  `<div class="sl cover">
     <h1 class="sm">Первым трём клиентам — 30 %</h1>
     <p class="lead">В обмен на отзыв после работы. Мне нужны отзывы, вам — цена ниже.</p>
     <div class="cont"><b>+7 977 556-76-01</b><span>aykoweb.ru</span><span>Пишите в сообщения — отвечу в тот же день</span></div>
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
      if (sl.scrollHeight > sl.clientHeight + 2) err.push(`слайд ${n + 1}: содержимое не помещается по высоте`);
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
                printBackground: true, pageRanges: '1-9' });
  for (let i = 0; i < SLIDES.length; i++) {
    const el = (await p.$$('.sl'))[i];
    await el.screenshot({ path: path.join(out, `slide-${String(i + 1).padStart(2, '0')}.png`) });
  }
  console.log(`✓ AYKO-prays.pdf — ${SLIDES.length} страниц, плюс превью отдельными картинками`);
  await b.close();
})();
