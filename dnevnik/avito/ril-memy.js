/* Второй ролик о напарнике — на мемах. Текст наносим сами: на этих
   картинках его нет, в отличие от прошлого набора.
   Кадр строится так же: мем вписывается целиком (обрезать нельзя,
   у мема вся соль в краях), пустота закрыта размытой копией.
   Текст — поверх, белый с чёрной обводкой: так его видно и на светлом
   мультике, и на тёмном кадре из «Гэтсби».
   Запуск:  node ril-memy.js                                           */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const W = 2160, H = 3840, BOK = 110;
// набор мемов задаётся аргументом: node ril-memy.js memy2
const NABOR = process.argv[2] || 'memy';
const MEM = path.join(__dirname, '..', 'foto', NABOR);
const OUT = path.join(__dirname, '..', 'foto', NABOR + '-holsty');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const b64 = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(MEM, f)).toString('base64');

/* Сценарий. По умолчанию — двенадцать строк, но набор может положить
   рядом свой kadry.json и задать сколько угодно кадров: короткие ролики
   в ТикТоке досматривают чаще, а досмотры и решают охват. */
const SVOY = path.join(MEM, 'kadry.json');
const KADRY_PO_UMOLCHANIYU = [
  { t: 'Отдам половину денег',                          f: '01.jpg', pauza: 0.7 },
  { t: 'тому, кто умеет продавать',                     f: '02.jpg', pauza: 0.4 },
  { t: 'Я делаю сайты',                                 f: '03.jpg', pauza: 0.3 },
  { t: 'Ботов и мини-приложения',                       f: '04.jpg', pauza: 0.3 },
  { t: 'Проще три дня писать код,<br>чем набрать номер', f: '05.jpg', pauza: 0.6 },
  { t: 'Поэтому ищу напарника',                         f: '06.jpg', pauza: 0.5 },
  { t: 'Вы находите клиента<br>и договариваетесь',      f: '07.jpg', pauza: 0.3 },
  { t: 'Всё остальное делаю я',                         f: '08.jpg', pauza: 0.4 },
  { t: '50% с первой оплаты',                           f: '09.jpg', pauza: 0.5 },
  { t: '20% с каждого месяца',                          f: '10.jpg', pauza: 0.4 },
  { t: 'Оклада нет. Вложений тоже',                     f: '11.jpg', pauza: 0.5 },
  { t: 'Напишите НАПАРНИК',                             f: '12.jpg', pauza: 1.5 },
];

const KADRY = fs.existsSync(SVOY)
  ? JSON.parse(fs.readFileSync(SVOY, 'utf8')).map((k, i) => ({
      ...k, f: k.f || `${String(i + 1).padStart(2, '0')}.jpg` }))
  : KADRY_PO_UMOLCHANIYU;

const slov = s => s.replace(/<br>/g, ' ').split(/\s+/).filter(Boolean).length;

const html = (k, razmer) => `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;background:#000;position:relative;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif}
.fon{position:absolute;inset:0;background-image:url('${b64(k.f)}');background-size:cover;
  background-position:center;filter:blur(90px) brightness(.42);transform:scale(1.2)}
.mem{position:absolute;left:0;right:0;top:980px;bottom:160px;display:flex;align-items:center;justify-content:center}
/* width/height, а не max-: мемы приходят мелкими, и по максимуму
   картинка не растягивается, а остаётся в своём натуральном размере */
.mem img{width:93%;height:78%;object-fit:contain;display:block;
  filter:drop-shadow(0 40px 90px rgba(0,0,0,.6))}
.tx{position:absolute;left:${BOK}px;right:${BOK}px;top:190px;z-index:3;text-align:center;
  font-size:${razmer}px;font-weight:700;line-height:1.06;letter-spacing:-.01em;
  color:#fff;text-transform:uppercase;
  -webkit-text-stroke:${Math.round(razmer * 0.085)}px #000;paint-order:stroke fill;
  text-shadow:0 10px 40px rgba(0,0,0,.75)}
</style></head><body>
<div class="fon"></div>
<div class="mem"><img src="${b64(k.f)}" alt=""></div>
<div class="tx">${k.t}</div>
</body></html>`;

(async () => {
  const br = await chromium.launch();
  const dlit = [];
  for (let i = 0; i < KADRY.length; i++) {
    const k = KADRY[i];
    const p = await br.newPage({ viewport: { width: W, height: H } });
    let razmer = 200, ok = false;
    for (; razmer >= 70; razmer -= 5) {
      await p.setContent(html(k, razmer));
      ok = await p.evaluate(({ W, BOK }) => {
        const t = document.querySelector('.tx');
        const r = t.getBoundingClientRect();
        return t.scrollWidth <= t.clientWidth + 2 && r.height <= 820 && r.width <= W - BOK * 2 + 2;
      }, { W, BOK });
      if (ok) break;
    }
    if (!ok) { console.log('✗ текст не влезает:', k.t.replace(/<br>/g, ' ')); process.exit(1); }
    const est = await p.evaluate(() => document.querySelector('.mem img').naturalWidth > 0);
    if (!est) { console.log('✗ мем не загрузился:', k.f); process.exit(1); }
    const dolya = await p.evaluate(({ W, H }) => {
      const im = document.querySelector('.mem img');
      const r = im.getBoundingClientRect();
      // настоящий размер картинки внутри рамки, с учётом object-fit: contain
      const k = Math.min(r.width / im.naturalWidth, r.height / im.naturalHeight);
      return Math.round(100 * (im.naturalWidth * k) * (im.naturalHeight * k) / (W * H));
    }, { W, H });
    if (dolya < 20) { console.log(`✗ мем занимает всего ${dolya}% кадра — его не разглядят`); process.exit(1); }
    // текст не должен уезжать на мем так, что мема не видно
    const peres = await p.evaluate(() => {
      const t = document.querySelector('.tx').getBoundingClientRect();
      const m = document.querySelector('.mem img').getBoundingClientRect();
      const vys = Math.max(0, Math.min(t.bottom, m.bottom) - Math.max(t.top, m.top));
      return Math.round(100 * vys / m.height);
    });
    const f = path.join(OUT, `k${String(i).padStart(2, '0')}.png`);
    await p.screenshot({ path: f });
    // читают с экрана медленнее, чем говорят: 2,1 слова в секунду,
    // и не меньше 1,9 с на кадр, даже если в нём два слова
    const d = +(Math.max(1.9, slov(k.t) / 2.1) + (k.pauza ?? 0.35)).toFixed(2);
    dlit.push(d);
    console.log(`  ${String(i + 1).padStart(2)}. ${k.f}  ${razmer}px  мем ${dolya}% кадра  ${d} с  ${k.t.replace(/<br>/g, ' ')}`);
    await p.close();
  }
  await br.close();
  fs.writeFileSync(path.join(OUT, 'dlitelnosti.txt'), dlit.join('\n') + '\n');
  const vsego = dlit.reduce((a, b) => a + b, 0);
  console.log(`\nвсего ${vsego.toFixed(1)} с ` + (vsego <= 40 ? '' : '← длинновато для ТикТока'));
  console.log(`✓ ${KADRY.length} холстов из набора «${NABOR}»`);
})();
