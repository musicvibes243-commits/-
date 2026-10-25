/* Обложка для вакансии «Ищу напарника по продажам».
   Человек, откликающийся на работу без оклада, спрашивает себя одно:
   есть ли тут что продавать. Поэтому в обложке не только условия, но и
   полоса настоящих сайтов — ответ до прочтения текста.
   Две пропорции: 4:3 под ленту Авито и 16:9 на случай широкой обложки.
   Запуск:  node oblozhka-vakansiya.js                                 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const SNIMKI = path.join(__dirname, '..', 'foto', 'portfolio', 'snimki');
const b64 = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(SNIMKI, f)).toString('base64');
const SAYTY = ['savva-monitor.jpg', 'atelier-monitor.jpg', 'ayko-monitor.jpg', 'minutka-monitor.jpg'];

const FORMATY = [
  { f: 'oblozhka-4x3', W: 1200, H: 900,  zag: 76, lenta: 190 },
  { f: 'oblozhka-16x9', W: 1600, H: 900, zag: 82, lenta: 210 },
];

const html = (o) => `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${o.W}px;height:${o.H}px;overflow:hidden;background:#0d0e12;color:#fff;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif;padding:56px 58px 0;
  display:flex;flex-direction:column;position:relative}
body::before{content:"";position:absolute;right:-180px;top:-170px;width:620px;height:620px;
  border-radius:50%;background:radial-gradient(circle,rgba(232,102,63,.24),transparent 68%)}
body>*{position:relative;z-index:2}
.mark{font-size:34px;font-weight:700;letter-spacing:.16em}
.mark i{font-style:normal;color:#e8663f}
.ker{margin-top:30px;font-size:25px;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:#e8663f}
h1{margin-top:16px;font-size:${o.zag}px;font-weight:700;line-height:1.04;letter-spacing:-.03em}
.pod{margin-top:20px;font-size:30px;line-height:1.4;color:#c6c1cd;max-width:${o.W - 160}px}
.pod b{color:#fff;font-weight:600}
.usl{margin-top:auto;margin-bottom:26px;display:flex;gap:16px;flex-wrap:wrap}
.usl span{background:#1a1b22;border:1px solid rgba(255,255,255,.12);border-radius:999px;
  padding:14px 26px;font-size:24px;font-weight:600;white-space:nowrap}
.usl span i{font-style:normal;color:#e8663f}
.lenta{flex:none;height:${o.lenta}px;margin:0 -58px;display:flex;gap:10px;overflow:hidden}
.lenta div{flex:1;overflow:hidden;position:relative;background:#1a1b22}
.lenta img{position:absolute;left:0;top:0;width:100%;display:block}
</style></head><body>
<div class="mark">AYK<i>O</i></div>
<div class="ker">Вакансия · удалённо</div>
<h1>Ищу напарника<br>по продажам</h1>
<p class="pod">Я делаю сайты, ботов и объявления. <b>Вы находите заказчиков и договариваетесь.</b></p>
<div class="usl">
  <span><i>50%</i> с первой оплаты</span>
  <span><i>20%</i> с абонентских</span>
  <span>Оклада нет, вложений тоже</span>
</div>
<div class="lenta">${SAYTY.map(s => `<div><img src="${b64(s)}" alt=""></div>`).join('')}</div>
</body></html>`;

(async () => {
  const br = await chromium.launch();
  for (const o of FORMATY) {
    const p = await br.newPage({ viewport: { width: o.W, height: o.H } });
    await p.setContent(html(o));
    await p.waitForTimeout(400);

    const bad = await p.evaluate(({ W, H }) => {
      const e = [];
      document.querySelectorAll('img').forEach((im, i) => { if (!im.naturalWidth) e.push(`снимок ${i + 1} не загрузился`); });
      const q = s => document.querySelector(s).getBoundingClientRect();
      const h1 = q('h1'), usl = q('.usl'), lenta = q('.lenta');
      if (Math.round(lenta.bottom) > H + 1) e.push('полоса сайтов не влезла');
      if (usl.bottom > lenta.top - 6) e.push('условия налезают на полосу сайтов');
      if (h1.bottom > usl.top - 10) e.push('заголовок налезает на условия');
      document.querySelectorAll('h1,.pod,.usl span,.ker').forEach(el => {
        if (el.getBoundingClientRect().right > W - 50) e.push(`«${el.textContent.slice(0, 20)}» вылезает вбок`);
        if (el.scrollWidth > el.clientWidth + 2) e.push(`«${el.textContent.slice(0, 20)}» обрезан`);
      });
      return [...new Set(e)];
    }, o);

    if (bad.length) { console.log(`✗ ${o.f}: ${bad.join(', ')}`); process.exit(1); }
    await p.screenshot({ path: path.join(__dirname, '..', 'foto', `${o.f}.jpg`), type: 'jpeg', quality: 92 });
    console.log(`✓ ${o.f}.jpg — ${o.W}x${o.H}`);
    await p.close();
  }
  await br.close();
})();
