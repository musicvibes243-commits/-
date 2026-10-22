/* Карточки портфолио 1600×1000: сайт в окне браузера плюс он же в телефоне.
   Тёмный фон — чтобы светлые сайты на нём читались ярче и чтобы карточки
   можно было без переделки вставить в PDF-прайс.
   Запуск:  node portfolio-kartochki.js                                     */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const SRC = path.join(__dirname, '..', 'foto', 'portfolio', 'snimki');
const OUT = path.join(__dirname, '..', 'foto', 'portfolio');
const W = 1600, H = 1000;
const b64 = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(SRC, f)).toString('base64');

const KART = [
  { id: 'atelier',       nazv: 'Atelier',       pod: 'Школа портного и швейный коворкинг, Королёв' },
  { id: 'atelier-2',     nazv: 'Atelier',       pod: 'Второй вариант главной страницы' },
  { id: 'ayko',          nazv: 'AYKO',          pod: 'Мой сайт: Авито, реклама и сайты для мастеров' },
  { id: 'ayko-cosmos',   nazv: 'AYKO',          pod: 'Вариант оформления «Космос»' },
  { id: 'savva',         nazv: 'SAVVA',         pod: 'Спешелти-кофейня в Медине. Русский, английский, арабский' },
  { id: 'savva-arka',    nazv: 'SAVVA · Арка',  pod: 'Демо-макет: как сайт мог бы выглядеть' },
  { id: 'savva-vitrina', nazv: 'SAVVA · Витрина', pod: 'Демо-макет: как сайт мог бы выглядеть' },
  { id: 'savva-gazeta',  nazv: 'SAVVA · Газета', pod: 'Демо-макет: как сайт мог бы выглядеть' },
  { id: 'kromka',        nazv: 'КРОМКА',        pod: 'Демо-макет: кофейня авторских десертов' },
];

const html = k => `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;position:relative;background:#0d0e12;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif;color:#fff}
.glow{position:absolute;right:-200px;top:-180px;width:720px;height:720px;border-radius:50%;
  background:radial-gradient(circle,rgba(232,102,63,.2) 0%,rgba(232,102,63,0) 68%)}
.hed{position:absolute;left:80px;top:72px;z-index:3}
.hed b{display:block;font-size:52px;font-weight:700;letter-spacing:-.02em}
.hed span{display:block;margin-top:12px;font-size:26px;color:#a9a4b2}
.brau{position:absolute;left:80px;top:196px;width:1080px;border-radius:18px;overflow:hidden;
  background:#1b1c22;box-shadow:0 36px 80px rgba(0,0,0,.55);z-index:2}
.tab{height:42px;display:flex;align-items:center;gap:9px;padding-left:18px}
.tab i{width:12px;height:12px;border-radius:50%;background:#3a3b44}
.brau img{width:100%;display:block}
.fon{position:absolute;right:100px;top:262px;width:300px;border-radius:34px;padding:8px;
  background:#101115;box-shadow:0 34px 70px rgba(0,0,0,.6);z-index:4}
.fon .scr{border-radius:27px;overflow:hidden;background:#fff}
.fon img{width:100%;display:block}
</style></head><body>
<div class="glow"></div>
<div class="hed"><b>${k.nazv}</b><span>${k.pod}</span></div>
<div class="brau"><div class="tab"><i></i><i></i><i></i></div><img src="${b64(k.id + '-monitor.jpg')}" alt=""></div>
<div class="fon"><div class="scr"><img src="${b64(k.id + '-telefon.jpg')}" alt=""></div></div>
</body></html>`;

(async () => {
  const br = await chromium.launch();
  for (const k of KART) {
    const p = await br.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1.5 });
    await p.setContent(html(k));
    await p.waitForTimeout(450);

    const bad = await p.evaluate(({ W, H }) => {
      const e = [];
      document.querySelectorAll('img').forEach((im, i) => { if (!im.naturalWidth) e.push(`снимок ${i + 1} не загрузился`); });
      const br = document.querySelector('.brau').getBoundingClientRect();
      const fo = document.querySelector('.fon').getBoundingClientRect();
      const he = document.querySelector('.hed').getBoundingClientRect();
      if (br.bottom > H - 40) e.push(`окно браузера упирается в низ: ${Math.round(br.bottom)} из ${H}`);
      if (fo.bottom > H - 30) e.push(`телефон упирается в низ: ${Math.round(fo.bottom)} из ${H}`);
      if (br.right > fo.left + 2) e.push('телефон наезжает на окно браузера');
      if (he.bottom > br.top - 10) e.push('заголовок налезает на окно браузера');
      if (fo.right > W - 40) e.push('телефон вылезает за правый край');
      return e;
    }, { W, H });

    if (bad.length) console.log('✗', k.id, '—', bad.join('; '));
    else { await p.screenshot({ path: path.join(OUT, `karta-${k.id}.jpg`), type: 'jpeg', quality: 92 }); console.log('✓', `karta-${k.id}.jpg`); }
    await p.close();
  }
  await br.close();
})();
