/* Карточка с работающим котом. Этот кот не удивляется, а делает дело —
   значит закрывает ведение и постоянные услуги, а не «бесплатно».
   Снимок всего 412×512, поэтому даём ему половину широкого кадра:
   растяжение выходит 1,3 раза, на глаз незаметно. В вертикальный
   формат его тянуть нельзя — там было бы 2,6 и всё поплыло бы.
   Запуск:  node kot-rabotaet.js                                         */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const FOTO = 'data:image/jpeg;base64,' +
  fs.readFileSync(path.join(__dirname, '..', 'foto', 'kot', 'kot-rabotaet.jpg')).toString('base64');
const OUT = path.join(__dirname, '..', 'foto', 'kot');
const ISHOD = 412;                       // настоящая ширина снимка
const W = 1200, H = 900, FOTO_W = 500;   // 500 / 412 = 1,21

const VAR = [
  { f: 'rab-1-vedenie', ker: 'Ведение Авито', big: 'Пока вы<br>на объекте', pod: 'Я смотрю статистику, правлю объявления и поднимаю то, что просело.' },
  { f: 'rab-2-tsena',   ker: 'Ведение Авито', big: '8 000 ₽', pod: 'в месяц. Объявления, фотографии, статистика — всё на мне.' },
  { f: 'rab-3-statistika', ker: 'Кто-то же должен', big: 'смотреть вашу<br>статистику', pod: 'Раз в неделю отчёт по-человечески: что выросло, что просело и почему.' },
];

const html = (v, bigPx) => `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;background:#c1beb6;position:relative;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif;color:#1b1a18}
.foto{position:absolute;right:0;top:0;width:${FOTO_W}px;height:${H}px;overflow:hidden}
.foto img{width:100%;height:100%;object-fit:cover;object-position:center 62%;display:block}
/* стык ровный и нарочный: полумягкий градиент читался как брак печати */
.foto::after{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:#a8a59d}
.in{position:absolute;left:78px;top:92px;z-index:3;max-width:${W - FOTO_W - 130}px}
.ker{font-size:28px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;
  color:#c04a24;margin-bottom:22px}
.big{font-size:${bigPx}px;font-weight:700;line-height:1.0;letter-spacing:-.03em}
.pod{margin-top:26px;font-size:28px;font-weight:500;line-height:1.45;color:#4a4842}
.niz{position:absolute;left:78px;bottom:66px;z-index:3;font-size:26px;font-weight:700;
  letter-spacing:.14em;color:#6f6c64}
.niz span{color:#c04a24}
</style></head><body>
<div class="foto"><img src="${FOTO}" alt=""></div>
<div class="in"><div class="ker">${v.ker}</div><div class="big">${v.big}</div><div class="pod">${v.pod}</div></div>
<div class="niz">AYK<span>O</span> · AYKOWEB.RU</div>
</body></html>`;

(async () => {
  const br = await chromium.launch();
  for (const v of VAR) {
    const p = await br.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
    let bigPx = 96, ok = false;
    for (; bigPx >= 40; bigPx -= 3) {
      await p.setContent(html(v, bigPx));
      ok = await p.evaluate(nado => {
        const b = document.querySelector('.big');
        if (b.scrollWidth > b.clientWidth + 2) return false;
        // считаем реальные строки: если их больше, чем переносов в тексте,
        // значит строка сломалась сама и слово повисло
        const r = document.createRange(); r.selectNodeContents(b);
        const strok = new Set([...r.getClientRects()].map(x => Math.round(x.top / 20))).size;
        return strok <= nado;
      }, (v.big.match(/<br>/g) || []).length + 1);
      if (ok) break;
    }
    if (!ok) { console.log('✗', v.f, '— заголовок не влезает'); await p.close(); continue; }
    await p.waitForTimeout(250);

    const bad = await p.evaluate(({ W, H, FOTO_W }) => {
      const e = [], q = s => document.querySelector(s).getBoundingClientRect();
      if (!document.querySelector('.foto img').naturalWidth) e.push('снимок не загрузился');
      const in_ = q('.in'), niz = q('.niz');
      if (in_.right > W - FOTO_W + 30) e.push('текст заезжает на снимок');
      if (in_.bottom > niz.top - 16) e.push('текст налезает на подпись');
      document.querySelectorAll('.in *,.niz').forEach(el => {
        if (el.scrollWidth > el.clientWidth + 2) e.push(`«${el.textContent.slice(0,16)}» обрезан`);
      });
      return [...new Set(e)];
    }, { W, H, FOTO_W });

    if (bad.length) console.log('✗', v.f, '—', bad.join('; '));
    else { await p.screenshot({ path: path.join(OUT, `kot-${v.f}.jpg`), type: 'jpeg', quality: 94 }); console.log('✓', `kot-${v.f}.jpg`, `заголовок ${bigPx}px`); }
    await p.close();
  }
  await br.close();
  console.log(`\nснимок растянут в ${(FOTO_W/ISHOD).toFixed(2)} раза`);
})();
