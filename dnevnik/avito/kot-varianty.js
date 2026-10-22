/* Варианты карточки с котом: разные фоны, форматы и реплики.
   Кот вырезан с прозрачностью, поэтому ложится на любой фон.
   Шок на морде работает только с приятной неожиданностью — низкой ценой
   или «бесплатно». К дорогим услугам этот кот не подходит, и таких
   вариантов тут нет.
   Запуск:  node kot-varianty.js                                         */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const KOT = 'data:image/png;base64,' +
  fs.readFileSync(path.join(__dirname, '..', 'foto', 'kot', 'kot-alpha.png')).toString('base64');
const OUT = path.join(__dirname, '..', 'foto', 'kot');

const SKIN = {
  belyy:  { fon: '#ffffff', tekst: '#17161a', tusk: '#56525c', akcent: '#e8663f', niz: '#9a949f' },
  oranzh: { fon: 'linear-gradient(145deg,#e8663f 0%,#c4482a 100%)', tekst: '#ffffff', tusk: 'rgba(255,255,255,.82)', akcent: '#ffffff', niz: 'rgba(255,255,255,.72)' },
  temnyy: { fon: '#0d0e12', tekst: '#ffffff', tusk: '#a9a4b2', akcent: '#e8663f', niz: '#6b6775' },
  bumaga: { fon: '#f6f1ea', tekst: '#17161a', tusk: '#6b6670', akcent: '#e8663f', niz: '#9a938a' },
};

// доля кота и высота реплики свои у каждого формата: в широком кадре
// кот той же доли перекрывает текст, в вертикальном — реплику
const FORMAT = {
  '4x5':  { W: 1080, H: 1350, kot: 0.68, repNiz: 0.21 },
  '4x3':  { W: 1200, H: 900,  kot: 0.44, repNiz: 0.17 },
  '1x1':  { W: 1080, H: 1080, kot: 0.60, repNiz: 0.19 },
  '9x16': { W: 1080, H: 1920, kot: 0.62, repNiz: 0.42 },
};

const VAR = [
  { f: '1-sayt-belyy',     fmt: '4x5',  skin: 'belyy',
    ker: 'Сколько стоит сайт', big: '2 000 ₽', pod: 'в месяц. <b>Не 50 тысяч.</b>', rep: 'а чё, так<br>можно было?' },
  { f: '2-sayt-oranzh',    fmt: '4x5',  skin: 'oranzh',
    ker: 'Сайт целиком', big: '2 000 ₽', pod: 'в месяц. Домен и хостинг внутри.', rep: 'и это<br>всё?' },
  { f: '3-razbor-temnyy',  fmt: '4x5',  skin: 'temnyy',
    ker: 'Разбор объявления', big: 'Бесплатно', pod: 'Посмотрю и скажу, что мешает.', rep: 'прям<br>совсем?' },
  { f: '4-vhodit-bumaga',  fmt: '4x3',  skin: 'bumaga',
    ker: 'Домен, хостинг, правки', big: 'Всё внутри', pod: 'Доплачивать ничего не нужно.', rep: 'подождите,<br>а подвох?' },
  { f: '5-sayt-kvadrat',   fmt: '1x1',  skin: 'belyy',
    ker: 'Сайт для вашего дела', big: '2 000 ₽', pod: 'в месяц', rep: 'а чё, так<br>можно было?' },
  { f: '6-sayt-storis',    fmt: '9x16', skin: 'temnyy',
    ker: 'Сайт для вашего дела', big: '2 000 ₽', pod: 'в месяц. <b>Не 50 тысяч.</b>', rep: 'а чё, так<br>можно было?' },
];

const html = (v, bigPx) => {
  const F = FORMAT[v.fmt], { W, H } = F, s = SKIN[v.skin];
  const k = H / 1350;                      // всё кратно высоте, чтобы форматы были в одном духе
  const kot = Math.round(W * F.kot);
  const px = n => Math.round(n * k);
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;background:${s.fon};position:relative;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif;color:${s.tekst}}
.kot{position:absolute;right:-${Math.round(kot*0.05)}px;bottom:-${Math.round(kot*0.03)}px;width:${kot}px;z-index:1}
.kot img{width:100%;display:block}
.in{position:absolute;left:${Math.round(W*0.07)}px;top:${Math.round(H*0.09)}px;z-index:2;max-width:${Math.round(W*0.76)}px}
.ker{font-size:${px(34)}px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
  color:${s.akcent};margin-bottom:${px(24)}px}
.big{font-size:${bigPx}px;font-weight:700;line-height:.9;letter-spacing:-.04em;white-space:nowrap}
.pod{margin-top:${px(24)}px;font-size:${px(40)}px;font-weight:600;color:${s.tusk};line-height:1.3}
.pod b{color:${s.tekst}}
.rep{position:absolute;left:${Math.round(W*0.07)}px;bottom:${Math.round(H*F.repNiz)}px;z-index:3;
  font-size:${px(40)}px;font-weight:700;line-height:1.25;max-width:${Math.round(W*0.46)}px}
.rep i{font-style:normal;display:block;width:${px(64)}px;height:${Math.max(3,px(4))}px;
  background:${s.akcent};margin-bottom:${px(18)}px;border-radius:2px}
.niz{position:absolute;left:${Math.round(W*0.07)}px;bottom:${Math.round(H*0.055)}px;z-index:3;
  font-size:${px(29)}px;font-weight:700;letter-spacing:.14em;color:${s.niz}}
.niz span{color:${s.akcent}}
</style></head><body>
<div class="kot"><img src="${KOT}" alt=""></div>
<div class="in"><div class="ker">${v.ker}</div><div class="big">${v.big}</div><div class="pod">${v.pod}</div></div>
<div class="rep"><i></i>${v.rep}</div>
<div class="niz">AYK<span>O</span> · AYKOWEB.RU</div>
</body></html>`;
};

(async () => {
  const br = await chromium.launch();
  for (const v of VAR) {
    const { W, H } = FORMAT[v.fmt];
    const p = await br.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
    // подбираем кегль главной строки сверху вниз, пока не влезет в колонку
    let bigPx = Math.round(190 * (H / 1350)), vlez = false;
    for (; bigPx >= 60; bigPx -= 4) {
      await p.setContent(html(v, bigPx));
      vlez = await p.evaluate(() => {
        const b = document.querySelector('.big');
        return b.scrollWidth <= b.clientWidth + 2 && b.getBoundingClientRect().width <= b.parentElement.getBoundingClientRect().width + 2;
      });
      if (vlez) break;
    }
    if (!vlez) { console.log('✗', v.f, '— главная строка не влезает даже мелкой'); await p.close(); continue; }
    await p.waitForTimeout(250);
    const bad = await p.evaluate(({ W, H }) => {
      const e = [], q = s => document.querySelector(s).getBoundingClientRect();
      if (!document.querySelector('.kot img').naturalWidth) e.push('кот не загрузился');
      const naezd = (a,b) => a.right > b.left+10 && a.left < b.right-10 && a.bottom > b.top+10 && a.top < b.bottom-10;
      const kot=q('.kot'), in_=q('.in'), rep=q('.rep'), niz=q('.niz');
      if (naezd(in_,kot)) e.push('текст наезжает на кота');
      if (naezd(rep,kot)) e.push('реплика наезжает на кота');
      if (in_.bottom > rep.top - 8) e.push('текст налезает на реплику');
      if (rep.bottom > niz.top - 8) e.push('реплика налезает на подпись');
      document.querySelectorAll('.in *,.rep,.niz').forEach(el=>{
        const r = el.getBoundingClientRect();
        if (r.right > W-10 || r.left < 10) e.push(`«${el.textContent.slice(0,16)}» вылезает вбок`);
        if (el.scrollWidth > el.clientWidth+2) e.push(`«${el.textContent.slice(0,16)}» обрезан`);
      });
      return [...new Set(e)];
    }, { W, H });
    if (bad.length) console.log('✗', v.f, '—', bad.join('; '));
    else { await p.screenshot({ path: path.join(OUT, `kot-${v.f}.jpg`), type:'jpeg', quality:93 }); console.log('✓', `kot-${v.f}.jpg`, `${W}×${H}`); }
    await p.close();
  }
  await br.close();
})();
