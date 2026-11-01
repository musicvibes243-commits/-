/* Обложка кворка. Kwork: минимум 660x440, вес 30 КБ — 10 МБ, jpg/png.
   Берём 1200x750: с запасом выше минимума. Справа — свой работающий сайт,
   слева — что продаётся. Цены на обложке нет: её меняют вместе с тарифом.
   Запуск:  node oblozhka.js                                             */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const W = 1200, H = 750;
const SAYT = 'data:image/jpeg;base64,' + fs.readFileSync(
  path.join(__dirname, '..', 'foto', 'portfolio', 'karta-ayko.jpg')).toString('base64');

const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;background:#0d0e12;color:#fff;position:relative;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif}
.glow{position:absolute;right:-160px;top:-140px;width:560px;height:560px;border-radius:50%;
  background:radial-gradient(circle,rgba(232,102,63,.22),rgba(232,102,63,0) 68%)}
.txt{position:absolute;left:60px;top:70px;width:500px;z-index:2}
.mark{font-size:30px;font-weight:700;letter-spacing:.16em}
.mark i{font-style:normal;color:#e8663f}
h1{margin-top:52px;font-size:58px;font-weight:700;line-height:1.08;letter-spacing:-.02em}
.pod{margin-top:26px;font-size:26px;line-height:1.4;color:#c6c1cd}
.dom{position:absolute;left:60px;bottom:56px;font-size:26px;font-weight:600;color:#e8663f}
.foto{position:absolute;right:50px;top:110px;width:560px;border-radius:18px;overflow:hidden;
  box-shadow:0 26px 60px rgba(0,0,0,.55);z-index:2;border:1px solid rgba(255,255,255,.08)}
.foto img{width:100%;display:block}
</style></head><body>
<div class="glow"></div>
<div class="txt">
  <div class="mark">AYK<i>O</i></div>
  <h1>Сайт для мастера под ключ</h1>
  <p class="pod">Тексты, дизайн, запуск и правки. Работаю удалённо, по всей России.</p>
</div>
<div class="foto"><img src="${SAYT}" alt=""></div>
<div class="dom">aykoweb.ru</div>
</body></html>`;

(async () => {
  const br = await chromium.launch();
  const p = await br.newPage({ viewport: { width: W, height: H } });
  await p.setContent(html);
  await p.waitForTimeout(400);
  const bad = await p.evaluate(({ W, H }) => {
    const e = [];
    if (!document.querySelector('.foto img').naturalWidth) e.push('сайт не загрузился');
    const t = document.querySelector('.txt').getBoundingClientRect();
    const f = document.querySelector('.foto').getBoundingClientRect();
    if (t.right > f.left - 10) e.push('текст налезает на снимок сайта');
    if (f.bottom > H - 20) e.push('снимок сайта обрезан снизу');
    document.querySelectorAll('h1,.pod,.mark').forEach(el => {
      if (el.scrollWidth > el.clientWidth + 2) e.push(`«${el.textContent.slice(0, 20)}» обрезан`);
    });
    return e;
  }, { W, H });
  if (bad.length) { console.log('✗ ' + bad.join(', ')); process.exit(1); }
  const out = path.join(__dirname, 'oblozhka.jpg');
  await p.screenshot({ path: out, type: 'jpeg', quality: 92 });
  const kb = Math.round(fs.statSync(out).size / 1024);
  const ok = kb >= 30 && kb <= 10 * 1024;
  console.log(`${ok ? '✓' : '✗'} oblozhka.jpg — ${W}x${H}, ${kb} КБ (нужно 30 КБ — 10 МБ)`);
  await br.close();
})();
