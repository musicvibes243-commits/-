/* Кадры для ролика про хостинг: 1080×1920, тёмный фон, крупный текст.
   Длительность каждого кадра взята из той же прикидки по словам, что и
   в сценарии: 2,8 слова в секунду, плюс отдельные паузы на смысловых
   точках. Шрифт подбирается сверху вниз, пока текст не влезет в поле.
   Запуск:  node ril-hosting.js                                          */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const W = 1080, H = 1920, TOP = 240, BOT = 280, BOK = 90;
const OUT = path.join(__dirname, '..', 'foto', 'ril-hosting');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// stil: 'krup' — ударный кадр, 'ryad' — обычный, 'itog' — финальный оранжевый
const KADRY = [
  { t: 'Чуть не заплатила<br>семь тысяч<br>за пустоту',         stil: 'krup', pauza: 0.6 },
  { t: 'Письмо от хостинга:<br>через три дня<br>заблокируем',   stil: 'ryad' },
  { t: '7 080 ₽',                                                stil: 'cifra', pauza: 0.5 },
  { t: 'Палец уже тянулся<br>к кнопке',                          stil: 'ryad', pauza: 0.8 },
  { t: 'И я полезла посмотреть,<br>за что плачу',                stil: 'ryad' },
  { t: 'Два сайта.<br>Оба пустые',                               stil: 'ryad' },
  { t: 'Доменов нет.<br>Почты нет.<br>Ни одного файла',          stil: 'ryad' },
  { t: 'Там не было<br>ничего',                                  stil: 'krup', pauza: 1.2 },
  { t: 'Страх продаёт<br>лучше скидки',                          stil: 'krup', pauza: 0.5 },
  { t: 'А вы за что платите<br>каждый месяц?',                   stil: 'krup', pauza: 0.8 },
  { t: 'Авито — за просмотры<br>Яндекс — за клики<br>Хостинг — за воздух', stil: 'ryad' },
  { t: 'Напишите РАЗБОР',                                        stil: 'krup', pauza: 1.4 },
  { t: 'Посмотрю ваши расходы<br>на рекламу',                    stil: 'ryad' },
  { t: 'Бесплатно',                                              stil: 'itog', pauza: 1.4 },
];

const slov = s => s.replace(/<br>/g, ' ').split(/\s+/).filter(Boolean).length;

const html = (k, razmer) => {
  const cvet = k.stil === 'itog' ? '#e8663f' : '#fff';
  const ves  = k.stil === 'ryad' ? 600 : 700;
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;background:#0d0e12;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif;position:relative}
.glow{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);
  width:1100px;height:1100px;border-radius:50%;
  background:radial-gradient(circle,rgba(232,102,63,.17) 0%,rgba(232,102,63,0) 66%)}
.in{position:absolute;left:${BOK}px;right:${BOK}px;top:${TOP}px;bottom:${BOT}px;
  display:flex;align-items:center;justify-content:center;z-index:2}
.tx{font-size:${razmer}px;font-weight:${ves};line-height:1.08;letter-spacing:-.02em;
  color:${cvet};text-align:center;width:100%}
.mark{position:absolute;left:0;right:0;bottom:120px;text-align:center;z-index:2;
  font-size:30px;font-weight:700;letter-spacing:.2em;color:#5c5865}
.mark i{font-style:normal;color:#e8663f}
</style></head><body>
<div class="glow"></div><div class="in"><div class="tx">${k.t}</div></div>
<div class="mark">AYK<i>O</i></div></body></html>`;
};

(async () => {
  const br = await chromium.launch();
  const spis = [];
  for (let i = 0; i < KADRY.length; i++) {
    const k = KADRY[i];
    const p = await br.newPage({ viewport: { width: W, height: H } });
    let razmer = { cifra: 190, itog: 150, krup: 110 }[k.stil] || 82, vleз = false;
    for (; razmer >= 40; razmer -= 3) {
      await p.setContent(html(k, razmer));
      const ok = await p.evaluate(({ BOK, W }) => {
        const z = document.querySelector('.in').getBoundingClientRect();
        const t = document.querySelector('.tx').getBoundingClientRect();
        return t.height <= z.height - 4 && t.width <= W - BOK * 2 + 2
            && document.querySelector('.tx').scrollWidth <= document.querySelector('.tx').clientWidth + 2;
      }, { BOK, W });
      if (ok) { vleз = true; break; }
    }
    if (!vleз) { console.log('✗ кадр', i + 1, 'не влез даже мелким:', k.t.replace(/<br>/g, ' ')); process.exit(1); }
    const f = path.join(OUT, `k${String(i).padStart(2, '0')}.png`);
    await p.screenshot({ path: f });
    // читают медленнее, чем говорят: 2,1 слова в секунду и не меньше 1,9 с на кадр
    const dlit = +(Math.max(1.9, slov(k.t) / 2.1) + (k.pauza || 0.35)).toFixed(2);
    spis.push({ f, dlit, razmer, t: k.t.replace(/<br>/g, ' ') });
    await p.close();
  }
  await br.close();

  const vsego = spis.reduce((s, x) => s + x.dlit, 0);
  fs.writeFileSync(path.join(OUT, 'spisok.txt'),
    spis.map(x => `file '${x.f}'\nduration ${x.dlit}`).join('\n') + `\nfile '${spis.at(-1).f}'\n`);
  spis.forEach((x, i) => console.log(`${String(i + 1).padStart(2)}. ${x.dlit.toFixed(2)} с  ${x.razmer}px  ${x.t}`));
  console.log(`\nвсего ${vsego.toFixed(1)} секунд ` + (vsego >= 25 && vsego <= 55 ? '— в пределах для Reels' : '— НЕ УКЛАДЫВАЕТСЯ'));
})();
