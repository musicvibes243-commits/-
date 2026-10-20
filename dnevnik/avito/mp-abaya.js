/* До/после для абайи. Справа — левый верхний кадр из набора (вещь на вешалке
   на чистом фоне): в ленте Авито картинка размером с ноготь, вся сетка из
   четырёх кадров там превратится в кашу. Полный набор идёт вторым слайдом. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
const src = '/home/user/-/dnevnik/foto/mp-primer';
const out = '/home/user/-/dnevnik/foto/avito-kartinki';
const b64 = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(src, f)).toString('base64');

// right: {img, zoom, posX, posY} — zoom 200% + позиция вырезают нужную четверть
const html = (L, R) => `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:900px;overflow:hidden;display:flex;background:#111;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif}
.pan{position:relative;width:600px;height:900px;overflow:hidden;background-repeat:no-repeat}
.pan::after{content:"";position:absolute;left:0;right:0;bottom:0;height:200px;
  background:linear-gradient(to top, rgba(10,9,12,.82) 0%, rgba(10,9,12,0) 100%)}
.lab{position:absolute;left:34px;bottom:30px;z-index:2;color:#fff;font-size:27px;font-weight:700;
  letter-spacing:.055em;text-transform:uppercase;white-space:nowrap;text-shadow:0 2px 14px rgba(0,0,0,.6)}
.lab i{display:block;width:38px;height:4px;background:#e8663f;margin-bottom:13px;border-radius:2px}
.sep{position:absolute;left:598px;top:0;width:4px;height:900px;background:#fff;z-index:3}
</style></head><body>
<div class="pan" style="background-image:url('${L.img}');background-size:cover;background-position:center 30%">
  <div class="lab"><i></i>${L.lab}</div></div>
<div class="pan" style="background-image:url('${R.img}');background-size:${R.zoom};background-position:${R.pos}">
  <div class="lab"><i></i>${R.lab}</div></div>
<div class="sep"></div>
</body></html>`;

(async () => {
  const b = await chromium.launch();
  const V = [
    { f: '17-abaya-do-posle.jpg',
      L: { img: b64('abaya-do.jpg'), lab: 'Ваше фото' },
      // левая верхняя четверть набора: вещь спереди на чистом фоне
      R: { img: b64('abaya-posle-set.jpg'), zoom: 'cover', pos: 'center center', lab: 'Что увидит покупатель' } },
  ];
  for (const v of V) {
    const p = await b.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
    await p.setContent(html(v.L, v.R));
    await p.waitForTimeout(500);
    const bad = await p.evaluate(() => {
      const err = [];
      document.querySelectorAll('.lab').forEach(e => {
        const r = e.getBoundingClientRect(), pan = e.closest('.pan').getBoundingClientRect();
        if (r.right > pan.right - 20) err.push(`подпись «${e.textContent}» не влезает`);
      });
      document.querySelectorAll('.pan').forEach((e, i) => {
        if (!getComputedStyle(e).backgroundImage.startsWith('url(')) err.push(`панель ${i + 1} без фотографии`);
      });
      return err;
    });
    if (bad.length) console.log('✗', v.f, '—', bad.join('; '));
    else { await p.screenshot({ path: path.join(out, v.f), type: 'jpeg', quality: 93 }); console.log('✓', v.f); }
    await p.close();
  }
  await b.close();
})();
