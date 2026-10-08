/* Главное фото для объявления про маркетплейсы: слева снимок вещи на вешалке,
   справа она же на модели. Разница должна читаться в ленте, где картинка
   размером с ноготь, поэтому никаких длинных надписей — два слова на панель.
   1200x900 (4:3). Фотографии вшиваются как base64: file:// браузер не отдаёт.
   Запуск:  node mp-do-posle.js                                               */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const src = path.join(__dirname, '..', 'foto', 'mp-primer');
const out = path.join(__dirname, '..', 'foto', 'avito-kartinki');
const b64 = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(src, f)).toString('base64');

const html = (left, right, labL, labR) => `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:900px;overflow:hidden;display:flex;background:#111;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif}
.pan{position:relative;width:600px;height:900px;overflow:hidden}
.pan img{width:100%;height:100%;object-fit:cover;object-position:center 22%;display:block}
.pan::after{content:"";position:absolute;left:0;right:0;bottom:0;height:200px;
  background:linear-gradient(to top, rgba(10,9,12,.82) 0%, rgba(10,9,12,0) 100%)}
.lab{position:absolute;left:34px;bottom:30px;z-index:2;color:#fff;
  font-size:27px;font-weight:700;letter-spacing:.055em;text-transform:uppercase;
  white-space:nowrap;text-shadow:0 2px 14px rgba(0,0,0,.6)}
.lab i{display:block;width:38px;height:4px;background:#e8663f;margin-bottom:13px;border-radius:2px}
.sep{position:absolute;left:598px;top:0;width:4px;height:900px;background:#fff;z-index:3}
</style></head><body>
<div class="pan"><img src="${left}" alt=""><div class="lab"><i></i>${labL}</div></div>
<div class="pan"><img src="${right}" alt=""><div class="lab"><i></i>${labR}</div></div>
<div class="sep"></div>
</body></html>`;

const VAR = [
  { file: '15-mp-do-posle.jpg',  r: 'posle-pered.jpg', labL: 'Ваше фото', labR: 'Что увидит покупатель' },
  { file: '16-mp-do-posle-2.jpg', r: 'posle-spina.jpg', labL: 'Снято на телефон', labR: 'Готово к загрузке' },
];

(async () => {
  const b = await chromium.launch();
  for (const v of VAR) {
    const p = await b.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
    await p.setContent(html(b64('do-veshalka.jpg'), b64(v.r), v.labL, v.labR));
    await p.waitForTimeout(400);

    const bad = await p.evaluate(() => {
      const err = [];
      // обе фотографии должны реально прогрузиться, иначе получим чёрный прямоугольник
      document.querySelectorAll('img').forEach((im, i) => {
        if (!im.naturalWidth) err.push(`фотография ${i + 1} не загрузилась`);
      });
      // подписи не должны переноситься и вылезать за панель
      document.querySelectorAll('.lab').forEach(e => {
        const r = e.getBoundingClientRect();
        const pan = e.closest('.pan').getBoundingClientRect();
        if (r.right > pan.right - 20) err.push(`подпись «${e.textContent}» не влезает в панель`);
        const rng = document.createRange(); rng.selectNodeContents(e);
        const rows = new Set([...rng.getClientRects()].map(x => Math.round(x.top))).size;
        if (rows > 2) err.push(`подпись «${e.textContent}» переносится`);
      });
      return err;
    });

    if (bad.length) console.log('✗', v.file, '—', [...new Set(bad)].join('; '));
    else { await p.screenshot({ path: path.join(out, v.file), type: 'jpeg', quality: 93 }); console.log('✓', v.file); }
    await p.close();
  }
  await b.close();
})();
