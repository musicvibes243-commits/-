/* Карточка с котом: цена сверху, реакция снизу. Шутка собирается у зрителя
   сама, поэтому объяснять её подписью нельзя — станет не смешно.
   Фон строго белый: вырезка кота тоже на белом, так её края не видны.
   Запуск:  node kot-cena.js                                              */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const KOT = 'data:image/png;base64,' +
  fs.readFileSync(path.join(__dirname, '..', 'foto', 'kot', 'kot-vyrez-chisto.png')).toString('base64');
const OUT = path.join(__dirname, '..', 'foto', 'kot');

const VAR = [
  { file: 'kot-2000-4x5.jpg', W: 1080, H: 1350, kot: 740, ker: 34, cena: 188, pod: 42, rep: 40, verh: 0.10, repNiz: 0.21 },
  { file: 'kot-2000-4x3.jpg', W: 1200, H: 900,  kot: 520, ker: 30, cena: 150, pod: 36, rep: 34, verh: 0.10, repNiz: 0.17 },
];

const html = v => `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${v.W}px;height:${v.H}px;overflow:hidden;background:#fff;position:relative;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif;color:#17161a}
.kot{position:absolute;right:-${Math.round(v.kot*0.06)}px;bottom:-${Math.round(v.kot*0.04)}px;
  width:${v.kot}px;z-index:1}
.kot img{width:100%;display:block}
.in{position:absolute;left:${Math.round(v.W*0.07)}px;top:${Math.round(v.H*v.verh)}px;z-index:2;
  max-width:${Math.round(v.W*0.72)}px}
.ker{font-size:${v.ker}px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;
  color:#e8663f;margin-bottom:${Math.round(v.ker*0.7)}px}
.cena{font-size:${v.cena}px;font-weight:700;line-height:.9;letter-spacing:-.04em;white-space:nowrap}
.pod{margin-top:${Math.round(v.pod*0.55)}px;font-size:${v.pod}px;font-weight:600;color:#56525c}
.pod b{color:#17161a}
.rep{position:absolute;left:${Math.round(v.W*0.07)}px;bottom:${Math.round(v.H*v.repNiz)}px;z-index:3;
  font-size:${v.rep}px;font-weight:700;line-height:1.25;max-width:${Math.round(v.W*0.44)}px}
.rep i{font-style:normal;display:block;width:${Math.round(v.rep*1.6)}px;height:4px;
  background:#e8663f;margin-bottom:${Math.round(v.rep*0.45)}px;border-radius:2px}
.niz{position:absolute;left:${Math.round(v.W*0.07)}px;bottom:${Math.round(v.H*0.055)}px;z-index:3;
  font-size:${Math.round(v.rep*0.72)}px;font-weight:700;letter-spacing:.14em;color:#9a949f}
.niz span{color:#e8663f}
</style></head><body>
<div class="kot"><img src="${KOT}" alt=""></div>
<div class="in">
  <div class="ker">Сколько стоит сайт</div>
  <div class="cena">2 000 ₽</div>
  <div class="pod">в месяц. <b>Не 50 тысяч.</b></div>
</div>
<div class="rep"><i></i>а чё, так<br>можно было?</div>
<div class="niz">AYK<span>O</span> · AYKOWEB.RU</div>
</body></html>`;

(async () => {
  const br = await chromium.launch();
  for (const v of VAR) {
    const p = await br.newPage({ viewport: { width: v.W, height: v.H }, deviceScaleFactor: 2 });
    await p.setContent(html(v));
    await p.waitForTimeout(350);

    const bad = await p.evaluate(({ W, H }) => {
      const e = [];
      const im = document.querySelector('.kot img');
      if (!im.naturalWidth) e.push('кот не загрузился');
      const q = s => document.querySelector(s).getBoundingClientRect();
      const kot = q('.kot'), in_ = q('.in'), rep = q('.rep'), niz = q('.niz');
      // пересечение считаем по-настоящему: текст может стоять выше кота
      // и заходить за его левый край, ничего при этом не перекрывая
      const naezd = (a, b) => a.right > b.left + 10 && a.left < b.right - 10
                           && a.bottom > b.top + 10 && a.top < b.bottom - 10;
      if (naezd(in_, kot)) e.push('цена наезжает на кота');
      if (naezd(rep, kot)) e.push('реплика наезжает на кота');
      if (rep.bottom > niz.top - 8) e.push('реплика налезает на подпись внизу');
      if (in_.bottom > rep.top - 8) e.push('цена налезает на реплику');
      // ничего не вылезает за холст
      document.querySelectorAll('.in *,.rep,.niz').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.right > W - 10 || r.left < 10) e.push(`«${el.textContent.slice(0,18)}» вылезает вбок`);
        if (el.scrollWidth > el.clientWidth + 2) e.push(`«${el.textContent.slice(0,18)}» обрезан`);
      });
      return [...new Set(e)];
    }, v);

    if (bad.length) console.log('✗', v.file, '—', bad.join('; '));
    else { await p.screenshot({ path: path.join(OUT, v.file), type: 'jpeg', quality: 93 }); console.log('✓', v.file, `${v.W}×${v.H}`); }
    await p.close();
  }
  await br.close();
})();
