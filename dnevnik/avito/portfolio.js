/* Карточки портфолио для Авито. 1200x900.
   Верх каждого скриншота срезан: там шапки сайтов с телефонами
   клиентов, а Авито снимает объявления за номера на картинках. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
const IMG = path.join(__dirname, '..', '..', 'ayko', 'img');
const out = path.join(__dirname, '..', 'foto', 'portfolio');
fs.mkdirSync(out, { recursive: true });
const b64 = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(IMG, f)).toString('base64');

const WORKS = [
  { file:'p1-septiki',  img:'septic.jpg',  crop:11, tag:'Септики и дренаж',  t:'Стройинвест',      s:'Инженерные системы участка' },
  { file:'p2-vetklinika', img:'simba.jpg', crop:10, tag:'Ветклиника',        t:'Симба',            s:'Приём по записи, срочные случаи' },
  { file:'p3-kofeynya', img:'savva.jpg',   crop:10, tag:'Кофейня',           t:'Savva',            s:'Меню, адрес, часы работы' },
  { file:'p4-yoga',     img:'anikor.jpg',  crop:8,  tag:'Студия йоги',       t:'Аникор',           s:'Расписание и пробное занятие' },
  { file:'p5-atelie',   img:'atelier.jpg', crop:16,  tag:'Швейное ателье',    t:'Atelier',          s:'Услуги, цены, запись' }
];

const html = w => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:900px;background:#f7f5f1;color:#14151a;overflow:hidden;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif;padding:56px 60px 48px;
  display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;align-items:flex-start;gap:24px}
.tag{display:inline-block;padding:10px 22px;border-radius:999px;border:1px solid #e2ddd3;
  background:#fff;font-size:26px;font-weight:700;color:#c0452a;letter-spacing:.02em}
.nm{text-align:right}
.nm b{display:block;font-size:40px;font-weight:700;line-height:1}
.nm span{display:block;font-size:24px;color:#5f5c56;margin-top:8px}
.ph{flex:1;min-height:0;margin-top:30px;border-radius:18px;overflow:hidden;
  border:1px solid #ddd8ce;background:#fff;position:relative}
/* смещение задаём через transform: его проценты считаются от высоты
   самой картинки, а не рамки. Через top срезалось бы почти ничего. */
.ph img{position:absolute;left:0;top:0;width:100%;height:auto;display:block}
.foot{margin-top:26px;padding-top:22px;border-top:1px solid #ddd8ce;
  display:flex;justify-content:space-between;align-items:flex-end}
.logo{font-size:40px;font-weight:700;letter-spacing:.16em}
.url{font-size:25px;color:#5f5c56}
</style></head><body>
<div class="top">
  <span class="tag">${w.tag}</span>
  <span class="nm"><b>${w.t}</b><span>${w.s}</span></span>
</div>
<div class="ph"><img src="${b64(w.img)}" style="top:0;transform:translateY(-${w.crop}%)"></div>
<div class="foot"><div class="logo">AYKO</div><div class="url">Сайт под ключ</div></div>
</body></html>`;

(async () => {
  const br = await chromium.launch();
  const p = await br.newPage({ viewport:{ width:1200, height:900 } });
  for (const w of WORKS) {
    await p.setContent(html(w), { waitUntil:'load' });
    await p.waitForTimeout(160);
    const f = path.join(out, w.file + '.jpg');
    await p.screenshot({ path:f, type:'jpeg', quality:88 });
    console.log(Math.round(fs.statSync(f).size/1024) + ' КБ  ' + w.file + '.jpg');
  }
  await br.close();
})();
