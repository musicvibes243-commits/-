/* Карточка для Авито: настоящий сайт на телефоне + крупная цена.
   Смысл — сломать мысль «сайт стоит от 50 тысяч» до того, как человек
   успеет её подумать. 1200x900 (4:3), Авито не режет этот формат в ленте.
   Снимок сайта вшивается как base64: file:// браузер не отдаёт.
   Запуск:  node sayt-cena.js                                            */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const shot = process.argv[2] || '/tmp/claude-0/-home-user--/ab892598-1264-5d65-8d4e-18a2e2b2db93/scratchpad/sayt-telefon.png';
const b64  = 'data:image/png;base64,' + fs.readFileSync(shot).toString('base64');
const out  = path.join(__dirname, '..', 'foto', 'avito-kartinki');
fs.mkdirSync(out, { recursive: true });

const PAD = 60;          // поле, за которое ничего не вылезает
const PHONE = { x: 726, y: 48, w: 404, h: 804 };

const html = (kick, price, per, line, note, skin) => {
  const dark = skin === 'ink';
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:900px;overflow:hidden;position:relative;
  background:${dark ? '#0d0e12' : '#f6f1ea'};
  font-family:'DejaVu Sans','Liberation Sans',sans-serif;
  color:${dark ? '#fff' : '#17161a'}}
.glow{position:absolute;width:760px;height:760px;border-radius:50%;right:-180px;top:-150px;
  background:radial-gradient(circle, rgba(232,102,63,${dark ? '.26' : '.17'}) 0%, rgba(232,102,63,0) 68%)}
.lt{position:absolute;left:${PAD}px;top:0;bottom:0;width:${PHONE.x - PAD - 40}px;
  display:flex;flex-direction:column;justify-content:center;z-index:3}
.kick{font-size:27px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
  color:#e8663f;margin-bottom:22px}
.price b{display:block;font-size:124px;font-weight:700;letter-spacing:-.035em;
  line-height:.94;white-space:nowrap}
.per{display:block;margin-top:10px;font-size:37px;font-weight:600;white-space:nowrap;
  color:${dark ? '#b9b4c0' : '#6b6670'}}
.line{margin-top:30px;font-size:33px;font-weight:600;line-height:1.26}
.note{margin-top:20px;font-size:25px;line-height:1.35;color:${dark ? '#a9a4b2' : '#716c76'}}
.note b{color:${dark ? '#fff' : '#17161a'};font-weight:600}
/* телефон */
.ph{position:absolute;left:${PHONE.x}px;top:${PHONE.y}px;width:${PHONE.w}px;height:${PHONE.h}px;
  border-radius:52px;background:#101115;padding:11px;z-index:2;
  box-shadow:0 44px 90px rgba(10,8,14,${dark ? '.7' : '.26'}), 0 0 0 1px rgba(255,255,255,.07) inset}
.scr{width:100%;height:100%;border-radius:42px;overflow:hidden;background:#fff;position:relative}
.scr img{width:100%;display:block}
.notch{position:absolute;left:50%;transform:translateX(-50%);top:14px;width:112px;height:26px;
  border-radius:999px;background:#101115;z-index:2}
</style></head><body>
<div class="glow"></div>
<div class="lt">
  <div class="kick">${kick}</div>
  <div class="price"><b>${price}</b><span class="per">${per}</span></div>
  <div class="line">${line}</div>
  <div class="note">${note}</div>
</div>
<div class="ph"><div class="scr"><div class="notch"></div><img src="${b64}" alt=""></div></div>
</body></html>`;
};

const VAR = [
  { file: '08-sayt-2000.jpg', skin: 'paper', kick: 'Сайт для строителя',
    price: '2 000 ₽', per: 'в месяц',
    line: 'Домен, хостинг, правки&nbsp;— внутри',
    note: 'Это <b>подписка, а не рассрочка</b>. Можно отменить в любой месяц.' },
  { file: '09-sayt-2000-tem.jpg', skin: 'ink', kick: 'Сайт для строителя',
    price: '2 000 ₽', per: 'в месяц',
    line: 'Не 50 тысяч. И не через полгода.',
    note: 'Домен, хостинг и правки внутри. <b>Отменить можно в любой месяц.</b>' },
];

(async () => {
  const b = await chromium.launch();
  for (const v of VAR) {
    const p = await b.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
    await p.setContent(html(v.kick, v.price, v.per, v.line, v.note, v.skin));
    await p.waitForTimeout(350);

    const bad = await p.evaluate(({ PAD, PHONE }) => {
      const err = [];
      const q = s => document.querySelector(s).getBoundingClientRect();
      // 1. ничего из текста не заходит на телефон и не вылезает за поля
      document.querySelectorAll('.lt *').forEach(e => {
        const r = e.getBoundingClientRect();
        if (!r.width) return;
        if (r.right > PHONE.x - 16) err.push(`«${e.className || e.tagName}» лезет на телефон`);
        if (r.left < PAD - 1) err.push(`«${e.className || e.tagName}» вылезает слева`);
        if (r.top < PAD - 1 || r.bottom > 900 - PAD + 1) err.push(`«${e.className || e.tagName}» выходит за поле по вертикали`);
      });
      // 2. телефон целиком внутри холста
      const ph = q('.ph');
      if (ph.right > 1200 || ph.bottom > 900 || ph.top < 0) err.push('телефон обрезан краем');
      // 3. снимок сайта реально загрузился
      const img = document.querySelector('.scr img');
      if (!img.naturalWidth) err.push('снимок сайта не загрузился');
      // 4. текст нигде не обрезан
      document.querySelectorAll('.kick,.line,.note,.price b,.per').forEach(e => {
        if (e.scrollWidth > e.clientWidth + 2) err.push(`«${e.className || e.tagName}» обрезан по ширине`);
      });
      // 5. то, что должно быть в одну строку, не перенеслось
      const lines = el => { const r = document.createRange(); r.selectNodeContents(el);
        return new Set([...r.getClientRects()].map(x => Math.round(x.top))).size; };
      [['.kick', 1], ['.price b', 1], ['.per', 1]].forEach(([sel, max]) => {
        const n = lines(document.querySelector(sel));
        if (n > max) err.push(`«${sel}» перенеслось на ${n} строки вместо ${max}`);
      });
      return err;
    }, { PAD, PHONE });

    if (bad.length) { console.log('✗', v.file, '—', [...new Set(bad)].join('; ')); }
    else { await p.screenshot({ path: path.join(out, v.file), type: 'jpeg', quality: 92 }); console.log('✓', v.file); }
    await p.close();
  }
  await b.close();
})();
