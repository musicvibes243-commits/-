/* Одна большая картинка со всеми сайтами. Статус каждой работы написан
   прямо под ней: учебный проект — учебный, макет — макет, не запущен — не
   запущен. Картинка для портфолио, а не для рекламы, поэтому честность
   важнее вида.
   Запуск:  node sbornik-saytov.js                                       */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const PAPKA = path.join(__dirname, '..', 'foto', 'portfolio');
const b64 = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(PAPKA, f)).toString('base64');

const RABOTY = [
  { f: 'karta-ayko.jpg',        nazv: 'Мой сайт — aykoweb.ru',                       st: 'Работает',          k: 'ok' },
  { f: 'karta-ayko-cosmos.jpg', nazv: 'Вариант «Космос» — другое оформление',         st: 'Работает',          k: 'ok' },
  { f: 'karta-savva.jpg',       nazv: 'SAVVA — кофейня в Медине',                     st: 'Учебный проект',    k: 'no' },
  { f: 'karta-atelier.jpg',     nazv: 'Atelier — швейное ателье в Королёве',          st: 'Сделан, не запущен', k: 'no' },
  { f: 'karta-kromka.jpg',      nazv: 'КРОМКА — кофейня авторских десертов',          st: 'Макет',             k: 'no' },
  { f: 'karta-minutka.jpg',     nazv: 'На минуточку — кофейня в Измайлово',           st: 'Макет',             k: 'no' },
];

const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:3380px;background:#0d0e12;color:#fff;font-family:'DejaVu Sans','Liberation Sans',sans-serif;padding:80px 60px}
h1{font-size:96px;font-weight:700;letter-spacing:-.02em;margin-bottom:12px}
.sub{font-size:40px;color:#a9a4b2;margin-bottom:64px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:70px 60px}
.cell{background:#17181e;border-radius:28px;overflow:hidden}
.cell img{width:100%;height:auto;display:block}
.cap{padding:34px 40px 38px;display:flex;align-items:center;justify-content:space-between;gap:24px}
.cap b{font-size:42px;font-weight:700}
.st{flex:none;padding:12px 26px;border-radius:999px;font-size:32px;font-weight:600;color:#fff}
.st.ok{background:#2e7d32}.st.no{background:#8a8a8a}
</style></head><body>
<h1>Сайты, которые я сделала</h1>
<div class="sub">Статус указан у каждой работы. Открыто только то, что отмечено зелёным.</div>
<div class="grid">
${RABOTY.map(r => `<div class="cell"><img src="${b64(r.f)}" alt=""><div class="cap"><b>${r.nazv}</b><span class="st ${r.k}">${r.st}</span></div></div>`).join('\n')}
</div></body></html>`;

(async () => {
  const br = await chromium.launch();
  const p = await br.newPage({ viewport: { width: 3380, height: 1000 }, deviceScaleFactor: 1 });
  await p.setContent(html);
  await p.waitForTimeout(600);
  const bad = await p.evaluate(() => {
    const e = [];
    document.querySelectorAll('img').forEach((im, i) => { if (!im.naturalWidth) e.push(`картинка ${i + 1} не загрузилась`); });
    document.querySelectorAll('.cap b').forEach(el => { if (el.scrollWidth > el.clientWidth + 2) e.push(`«${el.textContent}» обрезан`); });
    return e;
  });
  if (bad.length) { console.log('✗ ' + bad.join(', ')); process.exit(1); }
  const out = path.join(PAPKA, 'sbornik-saytov.jpg');
  await p.screenshot({ path: out, fullPage: true, type: 'jpeg', quality: 92 });
  console.log('✓ sbornik-saytov.jpg —', Math.round(fs.statSync(out).size / 1024), 'КБ');
  await br.close();
})();
