/* Объявление на столб, А4 при 300 dpi — 2480x3508.
   Построено по тому же принципу, что лист автошколы «Колесо»: крупный
   заход, непроницаемое лицо, одна строка выгоды внизу. Чёрное по белому,
   чтобы печатать на обычном принтере за копейки — в этом половина дела,
   нарядный лист на столбе читается как реклама и его не смотрят.
   Отрывных полосок нет: на улице они размокают и обрываются за день,
   поэтому контакт крупный и код большой, чтобы снять с полутора метров.
   Запуск:  node stolb.js                                              */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const W = 2480, H = 3508, PAD = 170;
const b64 = (p, t) => `data:image/${t};base64,` + fs.readFileSync(path.join(__dirname, '..', 'foto', p)).toString('base64');
const KOT = b64('kot/kot-cb.jpg', 'jpeg');
const QR  = b64('qr/qr-prays.png', 'png');

const html = (bigPx, fotoPx) => `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;background:#fff;color:#000;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif;padding:${PAD}px;
  display:flex;flex-direction:column;align-items:center;text-align:center}
.zahod{width:100%}
.b1{font-size:${bigPx}px;font-weight:700;line-height:.98;letter-spacing:-.03em}
.m{font-size:${Math.round(bigPx * .52)}px;font-weight:400;line-height:1.1;margin-top:10px}
.b2{font-size:${bigPx}px;font-weight:700;line-height:.98;letter-spacing:-.03em;margin-top:6px}
.foto{margin-top:54px;width:${fotoPx}px;flex:none;border:7px solid #000;background:#fff}
.foto img{width:100%;display:block;filter:grayscale(1)}
.vygoda{margin-top:48px;font-size:96px;font-weight:700;line-height:1.14}
.vygoda em{font-style:normal;border-bottom:9px solid #000;padding-bottom:4px}
.niz{margin-top:auto;width:100%;display:flex;align-items:center;justify-content:center;gap:56px}
.qr{width:500px;height:500px;flex:none}
.qr img{width:100%;height:100%;display:block}
.kont{text-align:left}
.tel{font-size:134px;font-weight:700;letter-spacing:-.02em;white-space:nowrap;line-height:1}
.dom{margin-top:16px;font-size:76px;font-weight:600;line-height:1}
.pod{margin-top:18px;font-size:42px;line-height:1.3;color:#333}
</style></head><body>
<div class="zahod">
  <div class="b1">Ищу тех,</div>
  <div class="m">у кого нет</div>
  <div class="b2">сайта</div>
</div>
<div class="foto"><img src="${KOT}" alt=""></div>
<div class="vygoda">Сделаю за <em>2 000 ₽ в месяц</em></div>
<div class="niz">
  <div class="qr"><img src="${QR}" alt=""></div>
  <div class="kont">
    <div class="tel">+7 977 556-76-01</div>
    <div class="dom">aykoweb.ru</div>
    <div class="pod">Наведите камеру — цены и примеры работ</div>
  </div>
</div>
</body></html>`;

(async () => {
  const br = await chromium.launch();
  const p = await br.newPage({ viewport: { width: W, height: H } });

  let bigPx = 300, fotoPx = 1560, ok = false;
  for (; bigPx >= 150; bigPx -= 6) {
    await p.setContent(html(bigPx, fotoPx));
    ok = await p.evaluate(H => {
      const q = s => document.querySelector(s).getBoundingClientRect();
      const niz = q('.niz'), vyg = q('.vygoda');
      return niz.bottom <= H - 1 && niz.top > vyg.bottom + 20
          && document.querySelector('.b1').scrollWidth <= document.querySelector('.b1').clientWidth + 2;
    }, H);
    if (ok) break;
  }
  if (!ok) { console.log('✗ заход не умещается на листе'); process.exit(1); }
  await p.waitForTimeout(300);

  const bad = await p.evaluate(({ W, H, PAD }) => {
    const e = [], q = s => document.querySelector(s).getBoundingClientRect();
    document.querySelectorAll('img').forEach((im, i) => { if (!im.naturalWidth) e.push(`картинка ${i + 1} не загрузилась`); });
    const niz = q('.niz'), vyg = q('.vygoda'), foto = q('.foto');
    if (niz.bottom > H - PAD + 2) e.push('контакты вылезли за нижнее поле');
    if (foto.bottom > vyg.top - 10) e.push('фото налезает на строку с ценой');
    if (H - niz.bottom > 420) e.push(`снизу пустует ${Math.round(H - niz.bottom)} px`);
    document.querySelectorAll('.b1,.b2,.m,.vygoda,.tel,.dom,.pod').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > W - PAD + 2 || r.left < PAD - 2) e.push(`«${el.textContent.slice(0, 20)}» вылезает вбок`);
      if (el.scrollWidth > el.clientWidth + 2) e.push(`«${el.textContent.slice(0, 20)}» обрезан`);
    });
    const rng = document.createRange(); rng.selectNodeContents(document.querySelector('.tel'));
    if (new Set([...rng.getClientRects()].map(x => Math.round(x.top))).size > 1) e.push('телефон разорван на две строки');
    return [...new Set(e)];
  }, { W, H, PAD });

  if (bad.length) console.log('✗ ' + bad.join('\n✗ '));
  else { await p.screenshot({ path: path.join(__dirname, '..', 'foto', 'stolb-kot-a4.png') });
         console.log(`✓ stolb-kot-a4.png — A4 ${W}x${H}, заход ${bigPx}px`); }
  await br.close();
})();
