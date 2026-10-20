/* Карточки для телеграм-канала AYKO.
   Запуск:  NODE_PATH=/opt/node22/lib/node_modules node generate.js
   Тексты берутся из cards.json, картинки кладутся в ../foto/kartochki/  */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const cards = JSON.parse(fs.readFileSync(path.join(__dirname, 'cards.json'), 'utf8'));
const out = path.join(__dirname, '..', 'foto', 'kartochki');
fs.mkdirSync(out, { recursive: true });

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const html = c => `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;background:#0a0a0c;color:#f4f3f0;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif;overflow:hidden;position:relative}
.glow{position:absolute;width:1100px;height:1100px;border-radius:50%;filter:blur(150px);opacity:.42;
  background:radial-gradient(circle,#8b6cff 0%,#ee4fa6 55%,transparent 72%);top:-340px;right:-330px}
.glow2{position:absolute;width:820px;height:820px;border-radius:50%;filter:blur(160px);opacity:.22;
  background:radial-gradient(circle,#ee4fa6 0%,transparent 70%);bottom:-330px;left:-260px}
.in{position:relative;z-index:2;height:100%;padding:96px 88px 80px;display:flex;flex-direction:column}
.eyebrow{display:inline-block;align-self:flex-start;padding:14px 30px;border-radius:999px;
  border:1px solid #45454f;background:rgba(255,255,255,.05);
  font-size:30px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#c3b3ff}
.body{margin-top:auto}
.big{font-size:${c.legend ? 146 : 162}px;font-weight:700;line-height:.98;letter-spacing:-.02em;
  background:linear-gradient(100deg,#ffffff 12%,#c3b3ff 58%,#ee9fd0 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.legend{display:flex;gap:44px;margin-top:40px;flex-wrap:wrap}
.legend span{font-size:33px;color:#a4a3ad;font-weight:600}
.legend i{display:inline-block;width:13px;height:13px;border-radius:50%;margin-right:14px;
  background:linear-gradient(120deg,#8b6cff,#ee4fa6)}
.sub{margin-top:${c.legend ? 44 : 56}px;font-size:40px;line-height:1.42;color:#dcdbe2;max-width:880px}
.foot{margin-top:70px;padding-top:52px;display:flex;justify-content:space-between;align-items:flex-end;
  border-top:1px solid #26262d}
.logo{font-size:56px;font-weight:700;letter-spacing:.14em}
.url{font-size:34px;color:#a4a3ad}
</style></head><body>
<div class="glow"></div><div class="glow2"></div>
<div class="in">
  <div class="eyebrow">${esc(c.eyebrow)}</div>
  <div class="body">
    <div class="big">${esc(c.big)}</div>
    ${c.legend ? `<div class="legend">${c.legend.map(l => `<span><i></i>${esc(l)}</span>`).join('')}</div>` : ''}
    <div class="sub">${esc(c.sub)}</div>
  </div>
  <div class="foot"><div class="logo">AYKO</div><div class="url">aykoweb.ru</div></div>
</div></body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const c of cards) {
    await p.setContent(html(c), { waitUntil: 'load' });
    await p.waitForTimeout(120);
    const f = path.join(out, c.file + '.jpg');
    await p.screenshot({ path: f, type: 'jpeg', quality: 90 });
    console.log(Math.round(fs.statSync(f).size / 1024) + ' КБ  ' + c.file + '.jpg');
  }
  await b.close();
})();
