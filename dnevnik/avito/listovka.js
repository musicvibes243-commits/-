/* Листовка А5 для подъезда, 148×210 мм при 300 dpi = 1748×2480.
   Фон светлый: в подъезде темно, на тёмной бумаге там ничего не прочесть,
   да и печать дешевле. Структура лесенкой, как у «ЗемляКа»: три двери,
   человек входит в ту, на которой стоит сейчас.
   Место под QR размечено, но пустое — код вставляется при вёрстке в печати.
   Запуск:  node listovka.js                                             */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const QR = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname,'..','foto','qr','qr-sayt.png')).toString('base64');

const W = 1748, H = 2480, PAD = 110;
const LENTA = 440;        // высота ленты с отрывными полосками
const POLOS = 8;          // сколько полосок — по ширине это около 1,8 см на каждую

const BLOKI = [
  { t: 'Сайт с ботом для заявок',
    p: 'Домен, хостинг и правки входят в эти 2 000 ₽. Первый платёж — когда увидите готовый сайт, а не раньше.' },
  { t: 'Объявление на Авито',
    p: 'Перепишу текст и подберу фотографии, чтобы карточку открывали, а не листали мимо. Разбор — бесплатно.' },
  { t: 'Карточки для Wildberries и Ozon',
    p: 'Фото товара на модели, инфографика, описание. Без студии и без аренды — за день.' },
];

const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;background:#f6f1ea;color:#17161a;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif;padding:${PAD}px ${PAD}px 0;
  display:flex;flex-direction:column}
.shapka{display:flex;align-items:baseline;gap:24px}
.mark{font-size:60px;font-weight:700;letter-spacing:.14em}
.mark i{font-style:normal;color:#e8663f}
.tag{font-size:29px;color:#6b6670}
.big{font-size:130px;font-weight:700;line-height:.98;letter-spacing:-.03em;text-transform:uppercase}
.big em{font-style:normal;color:#e8663f;display:block}
.cena{margin-top:26px;font-size:152px;font-weight:700;line-height:.95;letter-spacing:-.035em;
  white-space:nowrap}
.cena span{font-size:.42em;font-weight:600;color:#6b6670}
.pod{margin-top:30px;font-size:44px;font-weight:600;color:#3b383f}
.blocks{margin-top:56px;display:grid;gap:24px}
.b{background:#17161a;color:#fff;border-radius:28px;padding:40px 48px}
.b h3{font-size:48px;font-weight:700;line-height:1.1;margin-bottom:14px}
.b p{font-size:34px;line-height:1.38;color:#cfcad4}
.b:first-child{background:linear-gradient(150deg,#e2603f 0%,#c0452a 100%)}
.b:first-child p{color:rgba(255,255,255,.92)}
.dover{margin-top:36px;font-size:34px;line-height:1.4;color:#3b383f;
  border-left:7px solid #e8663f;padding-left:30px}
.dover b{font-weight:700}
.rez{flex:none;margin:44px -${PAD}px 0;border-top:4px dashed #b6afa6;
  display:flex;height:${LENTA}px}
.pol{position:relative;flex:1;border-right:3px dashed #cfc7bc}
.pol:last-child{border-right:none}
.pol span{position:absolute;left:50%;top:50%;white-space:nowrap;
  transform:translate(-50%,-50%) rotate(-90deg);
  font-size:36px;font-weight:700;letter-spacing:.01em}
.pol span i{font-style:normal;display:block;font-size:.62em;font-weight:600;
  color:#6b6670;letter-spacing:.04em;text-align:center;margin-top:7px}
.low{margin-top:auto;display:flex;gap:44px;align-items:flex-end}
.qr{width:280px;height:280px;flex:none;border-radius:16px;overflow:hidden;background:#fff}
.qr img{width:100%;height:100%;display:block;object-fit:contain}
.ctc{flex:1;min-width:0}
.zov{font-size:33px;font-weight:600;color:#3b383f;line-height:1.3}
.tel{margin-top:18px;font-size:54px;font-weight:700;letter-spacing:-.02em;white-space:nowrap}
.dom{margin-top:10px;font-size:44px;font-weight:600;color:#e8663f}
.geo{margin-top:16px;font-size:29px;color:#6b6670}
</style></head><body>
<div class="shapka"><span class="mark">AYK<i>O</i></span><span class="tag">сайты · Авито · маркетплейсы</span></div>
<div style="margin-top:62px">
  <div class="big">Сайт для<em>вашего дела</em></div>
  <div class="cena">2 000 ₽<span> в месяц</span></div>
  <div class="pod">Не 50 тысяч. И не через полгода.</div>
</div>
<div class="blocks">${BLOKI.map(b => `<div class="b"><h3>${b.t}</h3><p>${b.p}</p></div>`).join('')}</div>
<div class="dover">Два года веду объявления инженера по септикам, отоплению и водоснабжению. <b>Примеры работ — по коду слева.</b></div>
<div class="low">
  <div class="qr"><img src="${QR}" alt=""></div>
  <div class="ctc">
    <div class="zov">Наведите камеру —<br>посмотрите мои работы</div>
    <div class="tel">+7 977 556-76-01</div>
    <div class="dom">aykoweb.ru</div>
    <div class="geo">Работаю удалённо, по всей России</div>
  </div>
</div>
<div class="rez">${Array.from({length: POLOS}, () =>
  '<div class="pol"><span>+7 977 556-76-01<i>AYKO · сайт 2 000 ₽/мес</i></span></div>').join('')}</div>
</body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.setContent(html);
  await p.waitForTimeout(400);

  const bad = await p.evaluate(({ W, H, PAD }) => {
    const err = [];
    const kus = e => (e.textContent || '').trim().slice(0, 26);
    document.querySelectorAll('body *').forEach(e => {
      // лента с полосками идёт до краёв листа нарочно, поля ей не писаны
      if (e.closest('.rez')) return;
      const r = e.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (r.right > W - PAD + 2 || r.left < PAD - 2)
        err.push(`«${e.tagName}.${e.className||'-'}» вылезает вбок: ${Math.round(r.left)}…${Math.round(r.right)} при поле ${PAD}…${W-PAD}`);
      if (r.bottom > H - PAD + 2 || r.top < PAD - 2) err.push(`«${kus(e)}» вылезает вверх или вниз`);
      // у картинок scrollWidth отдаёт исходный размер файла, а не размер на листе,
      // поэтому их проверяем только по границам поля
      if (e.tagName !== 'IMG') {
        if (e.scrollWidth > e.clientWidth + 2) err.push(`«${kus(e)}» обрезан по ширине`);
        // при line-height меньше единицы scrollHeight всегда чуть больше clientHeight
        if (e.scrollHeight > e.clientHeight + 24) err.push(`«${kus(e)}» обрезан по высоте: ${e.scrollHeight} при ${e.clientHeight}`);
      }
    });
    // кегли внутри строки разные, базовые линии не совпадают — поэтому
    // верх прямоугольника округляем грубо, иначе одна строка считается двумя
    const strok = sel => { const r = document.createRange(); r.selectNodeContents(document.querySelector(sel));
      return new Set([...r.getClientRects()].map(x => Math.round(x.top / 40))).size; };
    if (strok('.tel') > 1) err.push('телефон разорван на две строки — его не наберут');
    // у цены внутри строки два разных кегля, и базовые линии дают разные
    // прямоугольники — считать строки тут нельзя. Меряем высоту: одна строка
    // при кегле 142 и межстрочном .95 это около 135 пикселей.
    const c = document.querySelector('.cena');
    if (c.getBoundingClientRect().height > 240) err.push('цена разъехалась на две строки');
    if (document.querySelector('.qr').getBoundingClientRect().width < 260) err.push('место под QR сжалось');
    const rez = document.querySelector('.rez').getBoundingClientRect();
    if (Math.round(rez.bottom) > H + 1) err.push(`лента не влезла: низ на ${Math.round(rez.bottom)} при листе ${H}`);
    if (Math.round(rez.left) > 1 || Math.round(rez.right) < W - 1) err.push('лента не доходит до краёв листа');
    document.querySelectorAll('.pol').forEach((e, i) => {
      const sp = e.querySelector('span').getBoundingClientRect();
      const po = e.getBoundingClientRect();
      // после поворота ширина текста ложится по высоте полоски
      if (sp.height > po.height - 24) err.push(`текст полоски ${i + 1} длиннее полоски: ${Math.round(sp.height)} при ${Math.round(po.height)}`);
      if (sp.width > po.width - 14) err.push(`текст полоски ${i + 1} шире полоски`);
    });
    return [...new Set(err)];
  }, { W, H, PAD });

  if (bad.length) console.log('✗ ' + bad.join('\n✗ '));
  else {
    await p.screenshot({ path: path.join(__dirname, '..', 'foto', 'listovka-podezd-a5.png') });
    console.log('✓ listovka-podezd-a5.png — A5, 1748×2480, годится в печать');
  }
  await b.close();
})();
