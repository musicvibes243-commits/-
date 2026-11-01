/* Обложка кворка «Продающее объявление для Авито».
   Правила Kwork: без контактов, без 18+, без кислотных фонов.
   Цены на обложке нет: она меняется вместе с тарифом.
   Запуск:  node oblozhka-avito.js                                      */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');

const W = 1200, H = 750;
const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;background:#0d0e12;color:#fff;position:relative;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif;padding:70px 70px}
.glow{position:absolute;right:-180px;top:-160px;width:620px;height:620px;border-radius:50%;
  background:radial-gradient(circle,rgba(232,102,63,.24),rgba(232,102,63,0) 68%)}
.z{position:relative;z-index:2}
.mark{font-size:30px;font-weight:700;letter-spacing:.16em}
.mark i{font-style:normal;color:#e8663f}
.ker{margin-top:44px;font-size:24px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#e8663f}
h1{margin-top:20px;font-size:72px;font-weight:700;line-height:1.06;letter-spacing:-.02em;max-width:1000px}
.pod{margin-top:26px;font-size:28px;line-height:1.4;color:#c6c1cd;max-width:900px}
.tags{position:absolute;left:70px;bottom:64px;display:flex;gap:14px;z-index:2}
.tags span{border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:12px 24px;font-size:24px;font-weight:600}
</style></head><body>
<div class="glow"></div>
<div class="z">
  <div class="mark">AYK<i>O</i></div>
  <div class="ker">Объявление на Авито</div>
  <h1>Продающее объявление, которое открывают</h1>
  <p class="pod">Заголовок с нужными словами, описание, которое читают до конца, порядок фото.</p>
</div>
<div class="tags">
  <span>SEO-теги</span><span>Разбор</span><span>Правки бесплатно</span>
</div>
</body></html>`;

(async () => {
  const br = await chromium.launch();
  const p = await br.newPage({ viewport: { width: W, height: H } });
  await p.setContent(html);
  await p.waitForTimeout(300);
  const bad = await p.evaluate(() => {
    const e = [];
    document.querySelectorAll('h1,.pod,.ker').forEach(el => {
      if (el.scrollWidth > el.clientWidth + 2) e.push(`«${el.textContent.slice(0, 20)}» обрезан`);
    });
    const h1 = document.querySelector('h1').getBoundingClientRect();
    const tg = document.querySelector('.tags').getBoundingClientRect();
    if (h1.bottom > tg.top - 10) e.push('заголовок налезает на теги');
    if (document.querySelector('.z').getBoundingClientRect().right > 1200 - 40) e.push('текст вылез вбок');
    return e;
  });
  if (bad.length) { console.log('✗ ' + bad.join(', ')); process.exit(1); }
  const out = path.join(__dirname, 'oblozhka-avito.jpg');
  await p.screenshot({ path: out, type: 'jpeg', quality: 92 });
  const kb = Math.round(require('fs').statSync(out).size / 1024);
  console.log(`${kb >= 30 && kb <= 10240 ? '✓' : '✗'} oblozhka-avito.jpg — ${W}x${H}, ${kb} КБ`);
  await br.close();
})();
