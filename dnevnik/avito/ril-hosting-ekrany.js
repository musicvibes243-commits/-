/* Та же история, но текст идёт поверх настоящих экранов: письмо хостинга,
   панель сайтов, список доменов. Снимки вертикальные и выше кадра, поэтому
   каждому задана своя точка кадрирования по вертикали — чтобы нужная строка
   попадала в нижние две трети, а текст лёг сверху и ничего не перекрыл.
   Запуск:  node ril-hosting-ekrany.js                                      */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const W = 1080, H = 1920, BOK = 80;
const EKR = path.join(__dirname, '..', 'foto', 'ril-ekrany');
const OUT = path.join(__dirname, '..', 'foto', 'ril-kadry2');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const b64 = f => 'data:image/png;base64,' + fs.readFileSync(path.join(EKR, f)).toString('base64');

// foto — какой экран под текстом, tochka — куда смотрим по вертикали
const KADRY = [
  { t: 'Чуть не заплатила<br>семь тысяч<br>за пустоту', stil:'krup', pauza:0.7, foto:'pismo.png',  tochka:'0%' },
  { t: 'Через три дня<br>заблокируем',                  stil:'krup', pauza:0.4, foto:'pismo.png',  tochka:'0%' },
  { t: 'Семь тысяч<br>восемьдесят рублей',              stil:'ryad', pauza:0.5, foto:'pismo.png',  tochka:'100%' },
  { t: 'Палец уже тянулся<br>к кнопке',                 stil:'ryad', pauza:0.9, foto:'pismo.png',  tochka:'100%' },
  { t: 'И я полезла посмотреть,<br>за что плачу',       stil:'ryad' },
  { t: 'Два сайта.<br>Оба пустые',                      stil:'ryad', pauza:0.5, foto:'sayty.png',  tochka:'73%' },
  { t: 'Ни одного домена',                              stil:'ryad', pauza:0.6, foto:'domeny.png', tochka:'84%' },
  { t: 'Там не было<br>ничего',                         stil:'krup', pauza:1.3 },
  { t: 'Страх продаёт<br>лучше скидки',                 stil:'krup', pauza:0.5 },
  { t: 'А вы за что платите<br>каждый месяц?',          stil:'krup', pauza:0.9 },
  { t: 'Авито — за просмотры<br>Яндекс — за клики<br>Хостинг — за воздух', stil:'ryad' },
  { t: 'Напишите РАЗБОР',                               stil:'krup', pauza:1.4 },
  { t: 'Посмотрю ваши расходы<br>на рекламу',           stil:'ryad' },
  { t: 'Бесплатно',                                     stil:'itog', pauza:1.5 },
];

const slov = s => s.replace(/<br>/g,' ').split(/\s+/).filter(Boolean).length;

const html = (k, razmer) => {
  const cvet = k.stil === 'itog' ? '#e8663f' : '#fff';
  const ves  = k.stil === 'ryad' ? 600 : 700;
  const sfoto = !!k.foto;
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;background:#0d0e12;position:relative;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif}
.snim{position:absolute;inset:0;background-image:url('${sfoto ? b64(k.foto) : ''}');
  background-size:cover;background-position:center ${k.tochka || '50%'}}
.zat{position:absolute;inset:0;background:linear-gradient(to bottom,
  rgba(8,9,12,.97) 0%, rgba(8,9,12,.93) 30%, rgba(8,9,12,.55) 46%, rgba(8,9,12,.22) 60%, rgba(8,9,12,.30) 80%, rgba(8,9,12,.95) 97%)}
.glow{position:absolute;left:50%;top:34%;transform:translate(-50%,-50%);width:1050px;height:1050px;
  border-radius:50%;background:radial-gradient(circle,rgba(232,102,63,.16) 0%,rgba(232,102,63,0) 66%)}
.in{position:absolute;left:${BOK}px;right:${BOK}px;top:200px;height:${sfoto ? 520 : 1340}px;
  display:flex;align-items:center;justify-content:center;z-index:3}
.tx{font-size:${razmer}px;font-weight:${ves};line-height:1.08;letter-spacing:-.02em;
  color:${cvet};text-align:center;width:100%}
.mark{position:absolute;left:0;right:0;bottom:110px;text-align:center;z-index:3;
  font-size:30px;font-weight:700;letter-spacing:.2em;color:#6b6775}
.mark i{font-style:normal;color:#e8663f}
</style></head><body>
${sfoto ? '<div class="snim"></div><div class="zat"></div>' : '<div class="glow"></div>'}
<div class="in"><div class="tx">${k.t}</div></div>
<div class="mark">AYK<i>O</i></div></body></html>`;
};

(async () => {
  const br = await chromium.launch();
  const spis = [];
  for (let i = 0; i < KADRY.length; i++) {
    const k = KADRY[i];
    const p = await br.newPage({ viewport: { width: W, height: H } });
    let razmer = { cifra:190, itog:150, krup:110 }[k.stil] || 82, ok = false;
    for (; razmer >= 40; razmer -= 3) {
      await p.setContent(html(k, razmer));
      ok = await p.evaluate(({ BOK, W }) => {
        const z = document.querySelector('.in').getBoundingClientRect();
        const t = document.querySelector('.tx');
        const r = t.getBoundingClientRect();
        return r.height <= z.height - 4 && r.width <= W - BOK*2 + 2 && t.scrollWidth <= t.clientWidth + 2;
      }, { BOK, W });
      if (ok) break;
    }
    if (!ok) { console.log('✗ кадр', i+1, 'не влезает:', k.t.replace(/<br>/g,' ')); process.exit(1); }
    if (k.foto) {
      const est = await p.evaluate(() => getComputedStyle(document.querySelector('.snim')).backgroundImage.startsWith('url('));
      if (!est) { console.log('✗ кадр', i+1, 'остался без экрана'); process.exit(1); }
    }
    const f = path.join(OUT, `k${String(i).padStart(2,'0')}.png`);
    await p.screenshot({ path: f });
    // читают с экрана медленнее, чем говорят: 2,1 слова в секунду,
    // и не меньше 1,9 с на кадр, даже если в нём два слова
    const d = +(Math.max(1.9, slov(k.t)/2.1) + (k.pauza || 0.35)).toFixed(2);
    spis.push({ f, d, razmer, foto: k.foto || '—', t: k.t.replace(/<br>/g,' ') });
    await p.close();
  }
  await br.close();
  const vsego = spis.reduce((s,x)=>s+x.d,0);
  fs.writeFileSync(path.join(OUT,'spisok.txt'),
    spis.map(x=>`file '${x.f}'\nduration ${x.d}`).join('\n') + `\nfile '${spis.at(-1).f}'\n`);
  spis.forEach((x,i)=>console.log(`${String(i+1).padStart(2)}. ${x.d.toFixed(2)} с  ${x.foto.padEnd(11)} ${x.t}`));
  console.log(`\nвсего ${vsego.toFixed(1)} с ` + (vsego>=25&&vsego<=55?'— в пределах для Reels':'— ВНЕ ПРЕДЕЛОВ'));
})();
