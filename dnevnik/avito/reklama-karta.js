/* Как объявление AYKO выглядело бы в ленте Авито Рекламы.
   Формат взят со скриншота автошколы «Колесо»: снимок, заголовок,
   цена, домен. 1080x1500 — вертикаль под ленту телефона.
   Запуск:  node reklama-karta.js                                      */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const W = 1080, H = 1150;   // карточка обнимает содержимое, без пустоты снизу
const FOTO = 'data:image/png;base64,' + fs.readFileSync(
  path.join(__dirname, '..', 'foto', 'listovka-kot-foto-a5.png')).toString('base64');

const VARIANTY = [
  { f: 'reklama-1', zag: 'Сайт для мастера — не 50 тысяч, а 2 000 ₽ в месяц', cena: 'от 2 000 ₽' },
  { f: 'reklama-2', zag: 'Объявление на Авито, которое открывают, а не листают', cena: 'от 2 500 ₽' },
  { f: 'reklama-3', zag: 'Сайт, Авито и карточки для WB — делаю сама, без студии', cena: 'от 2 000 ₽' },
];

const html = v => `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;background:#f2f1f0;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif;color:#0c0c0d;
  display:flex;flex-direction:column}
.ramka{flex:none;display:flex;flex-direction:column;background:#fff;margin:28px;
  border-radius:20px;overflow:hidden;box-shadow:0 6px 28px rgba(0,0,0,.10)}
.snimok{position:relative;height:740px;flex:none;overflow:hidden;background:#dedbd6}
.snimok img{width:100%;height:100%;object-fit:cover;object-position:50% 0%;display:block}
.metka{position:absolute;left:22px;top:22px;background:rgba(255,255,255,.94);
  border-radius:9px;padding:9px 16px;font-size:24px;font-weight:600;color:#3a3a3c;
  display:flex;align-items:center;gap:10px}
.metka i{width:12px;height:12px;border-radius:50%;background:#4caf50;font-style:normal}
.tekst{padding:30px 32px 34px}
.zag{font-size:42px;font-weight:400;line-height:1.26;letter-spacing:-.01em}
.cena{margin-top:20px;font-size:46px;font-weight:700;letter-spacing:-.02em}
.dom{margin-top:26px;display:inline-block;border:1px solid #d6d4d1;border-radius:12px;
  padding:13px 22px;font-size:28px;color:#3a3a3c}
.tochki{float:right;font-size:40px;color:#8f8d8a;letter-spacing:.1em;margin-top:18px}
</style></head><body>
<div class="ramka">
  <div class="snimok">
    <img src="${FOTO}" alt="">
    <div class="metka"><i></i>РЕКЛАМА</div>
  </div>
  <div class="tekst">
    <div class="zag">${v.zag}</div>
    <div class="cena">${v.cena}</div>
    <div class="dom">aykoweb.ru</div><div class="tochki">•••</div>
  </div>
</div>
</body></html>`;

(async () => {
  const br = await chromium.launch();
  for (const v of VARIANTY) {
    const p = await br.newPage({ viewport: { width: W, height: H } });
    await p.setContent(html(v));
    await p.waitForTimeout(350);
    const bad = await p.evaluate(({ W, H }) => {
      const e = [];
      const im = document.querySelector('img');
      if (!im.naturalWidth) e.push('снимок не загрузился');
      const r = document.querySelector('.ramka').getBoundingClientRect();
      if (r.bottom > H + 1) e.push('карточка не влезла по высоте');
      const t = document.querySelector('.tekst').getBoundingClientRect();
      if (t.bottom > r.bottom + 1) e.push('текст вылез за карточку');
      if (H - r.bottom > 60) e.push(`снизу пустует ${Math.round(H - r.bottom)} px`);
      document.querySelectorAll('.zag,.cena,.dom').forEach(el => {
        if (el.scrollWidth > el.clientWidth + 2) e.push(`«${el.textContent.slice(0,22)}» обрезан`);
      });
      return e;
    }, { W, H });
    if (bad.length) { console.log(`✗ ${v.f}: ${bad.join(', ')}`); process.exit(1); }
    await p.screenshot({ path: path.join(__dirname, '..', 'foto', `${v.f}.jpg`), type: 'jpeg', quality: 92 });
    console.log(`✓ ${v.f}.jpg — «${v.zag}»`);
    await p.close();
  }
  await br.close();
})();
