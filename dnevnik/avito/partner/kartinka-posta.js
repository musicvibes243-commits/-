/* Картинка к посту о поиске напарника.
   Снимок Айым из кафе: ноутбук, кофе, терраса. Обещает не доход, а
   формат работы — это и есть правда про удалёнку.
   Режем под 4:5 (лента Телеграма и ВК), текст кладём на тёмный низ
   с затемнением, иначе по столу он не читается.
   Запуск:  node kartinka-posta.js                                     */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const W = 1080, H = 1350;
const FOTO = 'data:image/jpeg;base64,' + fs.readFileSync(
  path.join(__dirname, '..', '..', 'foto', 'kafe', 'kafe.jpg')).toString('base64');

const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;position:relative;background:#111;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif;color:#fff}
.foto{position:absolute;inset:0;overflow:hidden}
.foto img{width:100%;height:100%;object-fit:cover;object-position:50% 62%;display:block}
.zaten{position:absolute;left:0;right:0;bottom:0;height:62%;
  background:linear-gradient(to bottom,rgba(10,10,12,0) 0%,rgba(10,10,12,.55) 38%,rgba(10,10,12,.92) 100%)}
.tekst{position:absolute;left:62px;right:62px;bottom:64px}
.ker{font-size:30px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
  color:#ffb08a}
h1{margin-top:18px;font-size:72px;font-weight:700;line-height:1.06;letter-spacing:-.02em}
.plashki{margin-top:30px;display:flex;gap:14px;flex-wrap:wrap}
.plashki span{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.26);
  border-radius:999px;padding:14px 26px;font-size:28px;font-weight:600;white-space:nowrap;
  backdrop-filter:blur(6px)}
.plashki b{color:#ffb08a}
</style></head><body>
<div class="foto"><img src="${FOTO}" alt=""></div>
<div class="zaten"></div>
<div class="tekst">
  <div class="ker">Удалённо · своим графиком</div>
  <h1>Ищу напарника<br>по продажам</h1>
  <div class="plashki">
    <span><b>50%</b> с первой сделки</span>
    <span><b>20%</b> с абонентских</span>
  </div>
</div>
</body></html>`;

(async () => {
  const br = await chromium.launch();
  const p = await br.newPage({ viewport: { width: W, height: H } });
  await p.setContent(html);
  await p.waitForTimeout(400);

  const bad = await p.evaluate(({ W, H }) => {
    const e = [];
    const im = document.querySelector('img');
    if (!im.naturalWidth) e.push('фотография не загрузилась');
    const t = document.querySelector('.tekst').getBoundingClientRect();
    const z = document.querySelector('.zaten').getBoundingClientRect();
    if (t.top < z.top + 20) e.push('текст вылез выше затемнения, читаться не будет');
    if (t.bottom > H - 30) e.push('текст прижат к нижнему краю');
    document.querySelectorAll('h1,.ker,.plashki span').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > W - 50) e.push(`«${el.textContent.slice(0, 20)}» вылезает вбок`);
      if (el.scrollWidth > el.clientWidth + 2) e.push(`«${el.textContent.slice(0, 20)}» обрезан`);
    });
    return [...new Set(e)];
  }, { W, H });

  if (bad.length) { console.log('✗ ' + bad.join('\n✗ ')); process.exit(1); }
  const out = path.join(__dirname, '..', '..', 'foto', 'post-naparnik.jpg');
  await p.screenshot({ path: out, type: 'jpeg', quality: 92 });
  console.log(`✓ post-naparnik.jpg — ${W}x${H}, ${Math.round(fs.statSync(out).size / 1024)} КБ`);
  await br.close();
})();
