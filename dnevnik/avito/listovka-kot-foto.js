/* Листовка А5, надписи прямо по фото: 148×210 мм при 300 dpi = 1748×2480.
   Фото занимает лист до ленты, верх снимка — пустая стена, по ней и идёт текст.
   Код ведёт на прайс, страницы портфолио лежат в том же PDF.
   Запуск:  node listovka-kot-foto.js                                       */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const W = 1748, H = 2480, PAD = 110;
const LENTA = 420;                 // лента с отрывными полосками
const POLOS = 8;                   // по ширине выходит около 1,8 см на каждую
const FOTO_H = H - LENTA;          // 2060 — столько фото занимает по высоте
const STENA = 940;                 // ниже этой черты на снимке начинается кот

const b64 = (p, t) => `data:image/${t};base64,` + fs.readFileSync(path.join(__dirname, '..', 'foto', p)).toString('base64');
const FOTO = b64('kot/kot-za-noutom.jpg', 'jpeg');
const QR   = b64('qr/qr-prays.png', 'png');

// пять пунктов в один столбик уехали бы коту на морду, поэтому в две колонки
const USLUGI = ['Сайт с ботом для заявок', 'Объявления на Авито', 'Карточки для WB и Ozon',
                'CRM-система', 'Приложения в Телеграме'];
const RYADOV = 3;

const html = bigPx => `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;background:#fff;color:#17161a;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif;position:relative}
.foto{position:absolute;left:0;top:0;width:${W}px;height:${FOTO_H}px;overflow:hidden}
.foto img{width:100%;height:100%;object-fit:cover;object-position:50% 0%;display:block}
.verh{position:absolute;left:${PAD}px;top:${PAD}px;width:${W - PAD * 2}px;z-index:3}
.shapka{display:flex;align-items:baseline;gap:24px}
.mark{font-size:58px;font-weight:700;letter-spacing:.14em}
.mark i{font-style:normal;color:#e8663f}
.tag{font-size:28px;color:#55505a}
.ker{width:fit-content;margin-top:56px;font-size:33px;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:#e8663f}
.cena{width:fit-content;margin-top:20px;font-size:${bigPx}px;font-weight:700;line-height:.92;
  letter-spacing:-.04em;white-space:nowrap}
.pod{width:fit-content;margin-top:24px;font-size:46px;font-weight:600}
.spis{width:fit-content;margin-top:46px;display:grid;grid-auto-flow:column;
  grid-template-rows:repeat(${RYADOV},auto);row-gap:18px;column-gap:70px}
.spis div{width:fit-content;font-size:36px;font-weight:600;padding-left:44px;position:relative;line-height:1.3}
.spis div::before{content:"";position:absolute;left:0;top:.46em;width:16px;height:10px;
  border-left:5px solid #e8663f;border-bottom:5px solid #e8663f;transform:rotate(-45deg)}
.dov{width:fit-content;margin-top:30px;font-size:32px;color:#45414a}
.plita{position:absolute;left:${PAD}px;bottom:${H - FOTO_H + 96}px;z-index:3;display:flex;gap:34px;
  align-items:center;background:#fff;border-radius:22px;padding:34px 44px 34px 34px;
  box-shadow:0 18px 50px rgba(0,0,0,.18)}
.qr{width:240px;height:240px;flex:none;background:#fff}
.qr img{width:100%;height:100%;display:block}
.ctc{min-width:0}
.zov{font-size:30px;font-weight:600;color:#55505a;line-height:1.3}
.tel{margin-top:14px;font-size:62px;font-weight:700;letter-spacing:-.02em;white-space:nowrap}
.dom{margin-top:6px;font-size:38px;font-weight:600;color:#e8663f}
.rez{position:absolute;left:0;bottom:0;width:${W}px;height:${LENTA}px;background:#fff;
  border-top:4px dashed #b6afa6;display:flex;z-index:4}
.pol{position:relative;flex:1;border-right:3px dashed #cfc7bc}
.pol:last-child{border-right:none}
.pol span{position:absolute;left:50%;top:50%;white-space:nowrap;
  transform:translate(-50%,-50%) rotate(-90deg);font-size:36px;font-weight:700}
.pol span i{font-style:normal;display:block;font-size:.6em;font-weight:600;color:#6b6670;
  letter-spacing:.04em;text-align:center;margin-top:7px}
</style></head><body>
<div class="foto"><img src="${FOTO}" alt=""></div>
<div class="verh">
  <div class="shapka"><span class="mark">AYK<i>O</i></span><span class="tag">сайты · Авито · маркетплейсы</span></div>
  <div class="ker">Сколько стоит сайт</div>
  <div class="cena">2 000 ₽</div>
  <div class="pod">в месяц. Не 50 тысяч.</div>
  <div class="spis">${USLUGI.map(u => `<div>${u}</div>`).join('')}</div>
  <div class="dov">Делаю сама, без студии и менеджеров.</div>
</div>
<div class="plita">
  <div class="qr"><img src="${QR}" alt=""></div>
  <div class="ctc">
    <div class="zov">Наведите камеру —<br>прайс и примеры работ</div>
    <div class="tel">+7 977 556-76-01</div>
    <div class="dom">aykoweb.ru</div>
  </div>
</div>
<div class="rez">${Array.from({length: POLOS}, () =>
  '<div class="pol"><span>+7 977 556-76-01<i>AYKO · сайт 2 000 ₽/мес</i></span></div>').join('')}</div>
</body></html>`;

(async () => {
  const br = await chromium.launch();
  const p = await br.newPage({ viewport: { width: W, height: H } });
  let bigPx = 210, ok = false;
  for (; bigPx >= 90; bigPx -= 4) {
    await p.setContent(html(bigPx));
    ok = await p.evaluate(STENA => {
      const c = document.querySelector('.cena');
      return c.scrollWidth <= c.clientWidth + 2
          && document.querySelector('.verh').getBoundingClientRect().bottom <= STENA;
    }, STENA);
    if (ok) break;
  }
  if (!ok) { console.log('✗ текст не умещается на пустой части стены'); process.exit(1); }
  await p.waitForTimeout(400);

  const bad = await p.evaluate(({ W, H, PAD, FOTO_H, STENA }) => {
    const e = [], q = s => document.querySelector(s).getBoundingClientRect();
    document.querySelectorAll('img').forEach((im, i) => { if (!im.naturalWidth) e.push(`картинка ${i + 1} не загрузилась`); });
    const foto = q('.foto'), verh = q('.verh'), plita = q('.plita'), rez = q('.rez');
    if (Math.round(foto.width) !== W) e.push('фото не на всю ширину листа');
    if (Math.round(foto.bottom) !== FOTO_H) e.push('фото не доходит до ленты');
    if (verh.bottom > STENA) e.push('текст заехал ниже пустой стены, на кота');
    if (plita.top < verh.bottom + 20) e.push('плитка с телефоном налезает на текст');
    if (plita.bottom > rez.top - 20) e.push('плитка с телефоном налезает на ленту');
    if (plita.right > W - PAD + 2) e.push('плитка вылезает за правое поле');
    if (Math.round(rez.bottom) !== H) e.push('лента не прижата к низу листа');
    if (Math.round(rez.left) !== 0 || Math.round(rez.width) !== W) e.push('лента не во всю ширину');
    document.querySelectorAll('.verh *,.ctc *').forEach(el => {
      if (el.children.length) return;
      if (el.getBoundingClientRect().right > W - PAD + 2) e.push(`«${el.textContent.slice(0, 22)}» вылезает вбок`);
      if (el.scrollWidth > el.clientWidth + 2) e.push(`«${el.textContent.slice(0, 22)}» обрезан`);
    });
    const rng = document.createRange(); rng.selectNodeContents(document.querySelector('.tel'));
    if (new Set([...rng.getClientRects()].map(x => Math.round(x.top))).size > 1) e.push('телефон разорван на две строки');
    return [...new Set(e)];
  }, { W, H, PAD, FOTO_H, STENA });

  if (bad.length) console.log('✗ ' + bad.join('\n✗ '));
  else { await p.screenshot({ path: path.join(__dirname, '..', 'foto', 'listovka-kot-foto-a5.png') });
         console.log(`✓ listovka-kot-foto-a5.png — A5 1748×2480, цена ${bigPx}px`); }
  await br.close();
})();
