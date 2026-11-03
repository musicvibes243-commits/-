/* Пример референс-листа для клиента: несколько вариантов оформления
   и простые вопросы, по которым клиент показывает, что ему ближе.
   Картинки — свои работы, подписаны как работы, а не как обещание.
   Запуск:  node referens-list.js                                      */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const PAPKA = path.join(__dirname, '..', 'foto', 'portfolio');
const b64 = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(PAPKA, f)).toString('base64');

const VARIANTY = [
  { f: 'karta-ayko.jpg',        t: 'Вариант А', s: 'Яркий заголовок, крупный текст, оранжевый акцент' },
  { f: 'karta-ayko-cosmos.jpg', t: 'Вариант Б', s: 'Спокойный, много воздуха, мелкий текст' },
  { f: 'karta-kromka.jpg',      t: 'Вариант В', s: 'Тёплые цвета, крупная подача услуг' },
  // «Арка» вместо «На минуточку»: в баннере минуточки стоит телефон, а лист уходит клиентам.
  { f: 'karta-savva-arka.jpg',  t: 'Вариант Г', s: 'Бежевый фон, арка с фото, мягкие цвета' },
];

const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1600px;background:#fff;color:#17161a;font-family:'DejaVu Sans','Liberation Sans',sans-serif;padding:60px 70px}
h1{font-size:54px;font-weight:700;letter-spacing:-.02em}
.sub{margin-top:14px;font-size:26px;color:#5f5c66;line-height:1.4}
.grid{margin-top:44px;display:grid;grid-template-columns:1fr 1fr;gap:40px 40px}
.tile{border:2px solid #e6e2da;border-radius:20px;overflow:hidden}
.tile img{width:100%;height:auto;display:block}
.cap{padding:22px 26px 26px;display:flex;flex-direction:column;gap:8px}
.cap b{font-size:30px;font-weight:700}
.cap span{font-size:24px;color:#5f5c66}
.cap label{margin-top:6px;font-size:24px;display:flex;align-items:center;gap:14px}
.box{width:26px;height:26px;border:2px solid #17161a;border-radius:6px;flex:none}
.q{margin-top:48px;border-top:2px solid #e6e2da;padding-top:34px}
.q h2{font-size:34px;font-weight:700;margin-bottom:22px}
.q p{font-size:26px;line-height:1.5;margin-bottom:18px}
.line{border-bottom:2px dashed #b9b3a9;height:46px;margin-bottom:14px}
</style></head><body>
<h1>Референс: какой сайт вам нравится</h1>
<p class="sub">Отметьте вариант, который ближе. Если ни один не подходит, напишите, что не так, или пришлите ссылку на сайт, который вам нравится.</p>
<div class="grid">
${VARIANTY.map(v => `<div class="tile"><img src="${b64(v.f)}" alt="">
  <div class="cap"><b>${v.t}</b><span>${v.s}</span>
  <label><i class="box"></i> Мне подходит</label></div></div>`).join('\n')}
</div>
<div class="q">
  <h2>Ещё три вопроса</h2>
  <p>Какие цвета вам ближе? Или есть цвета, которые точно не нравятся?</p><div class="line"></div>
  <p>Есть сайт, который вам понравился? Пришлите ссылку.</p><div class="line"></div>
  <p>Что должно быть на сайте в первую очередь: записи, заявки, цены, карта?</p><div class="line"></div>
</div>
</body></html>`;

(async () => {
  const br = await chromium.launch();
  const p = await br.newPage({ viewport: { width: 1600, height: 1200 } });
  await p.setContent(html);
  await p.waitForTimeout(400);
  const bad = await p.evaluate(() => {
    const e = [];
    document.querySelectorAll('img').forEach((im, i) => { if (!im.naturalWidth) e.push(`картинка ${i + 1} не загрузилась`); });
    document.querySelectorAll('.cap b,.cap span,.q h2,.q p').forEach(el => {
      if (el.scrollWidth > el.clientWidth + 2) e.push(`«${el.textContent.slice(0, 20)}» обрезан`);
    });
    return e;
  });
  if (bad.length) { console.log('✗ ' + bad.join(', ')); process.exit(1); }
  const out = path.join(__dirname, 'referens-list.jpg');
  await p.screenshot({ path: out, fullPage: true, type: 'jpeg', quality: 90 });
  console.log('✓ referens-list.jpg —', Math.round(fs.statSync(out).size / 1024), 'КБ');
  await br.close();
})();
