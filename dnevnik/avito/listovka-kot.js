/* Листовка А5 с котом: 148×210 мм при 300 dpi = 1748×2480.
   Код один и ведёт на прайс — в нём же лежат страницы портфолио,
   так что второй код не нужен и только путал бы.
   Кот шокированный: он 998 точек и в печати держится, а рабочий всего
   412 и на листе расплылся бы.
   Запуск:  node listovka-kot.js                                         */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const W = 1748, H = 2480, PAD = 110, LENTA = 420, POLOS = 8;
const b64 = (p, t) => `data:image/${t};base64,` + fs.readFileSync(path.join(__dirname, '..', 'foto', p)).toString('base64');
const KOT = b64('kot/kot-alpha.png', 'png');
const QR  = b64('qr/qr-prays.png', 'png');

const USLUGI = [
  'Сайт с ботом для заявок',
  'Объявления на Авито: текст и фото',
  'Карточки для Wildberries и Ozon',
];

const html = bigPx => `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;background:#fff;color:#17161a;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif;padding:${PAD}px ${PAD}px 0;
  display:flex;flex-direction:column;position:relative}
.kot{position:absolute;right:-80px;top:400px;width:900px;z-index:1}
.kot img{width:100%;display:block}
.shapka{display:flex;align-items:baseline;gap:24px;position:relative;z-index:3}
.mark{font-size:58px;font-weight:700;letter-spacing:.14em}
.mark i{font-style:normal;color:#e8663f}
.tag{font-size:28px;color:#6b6670}
.ker{width:fit-content;margin-top:66px;font-size:33px;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:#e8663f;position:relative;z-index:3}
.cena{width:fit-content;margin-top:24px;font-size:${bigPx}px;font-weight:700;line-height:.92;
  letter-spacing:-.04em;white-space:nowrap;position:relative;z-index:3}
.pod{width:fit-content;margin-top:26px;font-size:46px;font-weight:600;position:relative;z-index:3}
.pod b{color:#17161a}
.rep{position:absolute;left:${PAD}px;top:950px;z-index:3;font-size:48px;font-weight:700;
  line-height:1.24;max-width:760px}
.dov{position:absolute;left:${PAD}px;top:1190px;z-index:3;font-size:34px;line-height:1.4;
  color:#3b383f;max-width:720px}
.rep i{font-style:normal;display:block;width:68px;height:5px;background:#e8663f;
  margin-bottom:20px;border-radius:3px}
.spis{margin-top:auto;margin-bottom:40px;position:relative;z-index:3;display:grid;gap:18px}
.spis div{width:fit-content;font-size:36px;font-weight:600;padding-left:44px;position:relative;line-height:1.3}
.spis div::before{content:"";position:absolute;left:0;top:.46em;width:16px;height:10px;
  border-left:5px solid #e8663f;border-bottom:5px solid #e8663f;transform:rotate(-45deg)}
.low{display:flex;gap:40px;align-items:flex-end;margin-bottom:34px;position:relative;z-index:3}
.qr{width:270px;height:270px;flex:none;border-radius:16px;overflow:hidden;background:#fff}
.qr img{width:100%;height:100%;display:block}
.ctc{flex:1;min-width:0}
.zov{font-size:32px;font-weight:600;color:#3b383f;line-height:1.3}
.tel{margin-top:18px;font-size:68px;font-weight:700;letter-spacing:-.02em;white-space:nowrap}
.dom{margin-top:8px;font-size:42px;font-weight:600;color:#e8663f}
.rez{flex:none;margin:0 -${PAD}px;border-top:4px dashed #b6afa6;display:flex;height:${LENTA}px}
.pol{position:relative;flex:1;border-right:3px dashed #cfc7bc}
.pol:last-child{border-right:none}
.pol span{position:absolute;left:50%;top:50%;white-space:nowrap;
  transform:translate(-50%,-50%) rotate(-90deg);font-size:36px;font-weight:700}
.pol span i{font-style:normal;display:block;font-size:.6em;font-weight:600;color:#6b6670;
  letter-spacing:.04em;text-align:center;margin-top:7px}
</style></head><body>
<div class="kot"><img src="${KOT}" alt=""></div>
<div class="shapka"><span class="mark">AYK<i>O</i></span><span class="tag">сайты · Авито · маркетплейсы</span></div>
<div class="ker">Сколько стоит сайт</div>
<div class="cena">2 000 ₽</div>
<div class="pod">в месяц. <b>Не 50 тысяч.</b></div>
<div class="rep"><i></i>а чё, так<br>можно было?</div>
<div class="dov">Делаю сама, без студии и менеджеров.<br>Отсюда и цена.</div>
<div class="spis">${USLUGI.map(u => `<div>${u}</div>`).join('')}</div>
<div class="low">
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
    ok = await p.evaluate(() => {
      const c = document.querySelector('.cena');
      return c.scrollWidth <= c.clientWidth + 2 && c.getBoundingClientRect().height < 260;
    });
    if (ok) break;
  }
  if (!ok) { console.log('✗ цена не влезает'); process.exit(1); }
  await p.waitForTimeout(300);

  const bad = await p.evaluate(({ W, H, PAD }) => {
    const e = [], q = s => document.querySelector(s).getBoundingClientRect();
    document.querySelectorAll('img').forEach((im,i) => { if (!im.naturalWidth) e.push(`картинка ${i+1} не загрузилась`); });
    const kot = q('.kot'), rep = q('.rep'), dov = q('.dov'), spis = q('.spis'), low = q('.low'),
          rez = q('.rez'), cena = q('.cena');
    const naezd = (a,b) => a.right > b.left+12 && a.left < b.right-12 && a.bottom > b.top+12 && a.top < b.bottom-12;
    if (naezd(cena, kot)) e.push('цена наезжает на кота');
    if (naezd(rep, kot)) e.push('реплика наезжает на кота');
    if (naezd(dov, kot)) e.push('строка про цену наезжает на кота');
    if (rep.bottom > dov.top - 8) e.push('реплика налезает на строку про цену');
    if (naezd(spis, kot)) e.push('список услуг наезжает на кота');
    if (naezd(low, kot)) e.push('контакты наезжают на кота');
    if (dov.bottom > spis.top - 10) e.push('строка про цену налезает на список');
    if (low.bottom > rez.top - 6) e.push('контакты налезают на ленту');
    if (Math.round(rez.bottom) > H + 1) e.push('лента не влезла на лист');
    if (Math.round(rez.left) > 1 || Math.round(rez.right) < W - 1) e.push('лента не доходит до краёв');
    document.querySelectorAll('.ctc *,.spis div,.ker,.pod,.rep,.dov').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > W - PAD + 2) e.push(`«${el.textContent.slice(0,20)}» вылезает вбок`);
      if (el.scrollWidth > el.clientWidth + 2) e.push(`«${el.textContent.slice(0,20)}» обрезан`);
    });
    const rng = document.createRange(); rng.selectNodeContents(document.querySelector('.tel'));
    if (new Set([...rng.getClientRects()].map(x=>Math.round(x.top))).size > 1) e.push('телефон разорван на две строки');
    return [...new Set(e)];
  }, { W, H, PAD });

  if (bad.length) console.log('✗ ' + bad.join('\n✗ '));
  else { await p.screenshot({ path: path.join(__dirname, '..', 'foto', 'listovka-kot-a5.png') });
         console.log(`✓ listovka-kot-a5.png — A5 1748×2480, цена ${bigPx}px`); }
  await br.close();
})();
