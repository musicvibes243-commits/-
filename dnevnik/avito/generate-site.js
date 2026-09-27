/* Фотографии для объявления на Авито.
   Формат 1200x900 (4:3) — его Авито рекомендует и не обрезает в ленте.
   Запуск:  node generate.js     (кладёт файлы в ../foto/avito/)          */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const cards = JSON.parse(fs.readFileSync(path.join(__dirname,'cards.json'),'utf8'));
const SITE = process.env.SITE === '1';
const W = SITE ? 1200 : 1200, H = SITE ? 750 : 900;
const out = SITE ? path.join(__dirname,'..','..','ayko','img','k') : path.join(__dirname,'..','foto','avito');
fs.mkdirSync(out,{recursive:true});
const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;');

/* три «одежды», все из палитры сайта */
const SKIN = {
  paper: { bg:'#f7f5f1', text:'#14151a', dim:'#5f5c56', eye:'#c0452a', rule:'#ddd8ce', chip:'#ffffff', chipL:'#e2ddd3', dot:'#c0452a', logo:'#14151a' },
  brick: { bg:'#c0452a', text:'#ffffff', dim:'#f6dcd4', eye:'#ffe6de', rule:'rgba(255,255,255,.34)', chip:'rgba(255,255,255,.12)', chipL:'rgba(255,255,255,.28)', dot:'#ffffff', logo:'#ffffff' },
  ink:   { bg:'#101115', text:'#ffffff', dim:'#cbc7bf', eye:'#e8836a', rule:'rgba(255,255,255,.2)',  chip:'rgba(255,255,255,.07)', chipL:'rgba(255,255,255,.2)', dot:'#e8836a', logo:'#ffffff' }
};

/* размер заголовка подбираем по длине, чтобы ничего не уехало за край */
function bigSize(t, hasList){
  const n = t.length;
  let s = n <= 22 ? 128 : n <= 30 ? 112 : n <= 40 ? 96 : 84;
  if (hasList) s = Math.min(s, 86);
  return s;
}

const html = c => { const k = SKIN[c.skin] || SKIN.paper; const hasList = !!(c.list && c.list.length); return `
<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;background:${k.bg};color:${k.text};overflow:hidden;position:relative;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif}
.in{position:relative;z-index:2;height:100%;padding:${SITE?56:70}px 76px ${SITE?56:58}px;display:flex;flex-direction:column}
.eyebrow{align-self:flex-start;padding:11px 26px;border-radius:999px;border:1px solid ${k.chipL};
  background:${k.chip};font-size:25px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:${k.eye}}
.body{margin-top:auto}
.big{font-size:${bigSize(c.big, hasList)}px;font-weight:700;line-height:1.0;letter-spacing:-.015em;
  text-transform:uppercase;color:${k.text}}
.list{margin-top:34px;display:grid;gap:17px}
.list div{display:flex;align-items:flex-start;gap:17px;font-size:33px;line-height:1.25;color:${k.dim};font-weight:600}
.list i{flex:none;width:13px;height:13px;border-radius:50%;background:${k.dot};margin-top:12px}
.sub{margin-top:30px;font-size:34px;line-height:1.38;color:${k.dim};max-width:1000px}
.foot{margin-top:44px;padding-top:34px;display:flex;justify-content:space-between;align-items:flex-end;
  border-top:1px solid ${k.rule}}
.logo{font-size:48px;font-weight:700;letter-spacing:.16em;color:${k.logo}}
.url{font-size:29px;color:${k.dim}}
</style></head><body><div class="in">
  <div class="eyebrow">${esc(c.eyebrow)}</div>
  <div class="body">
    <div class="big">${esc(c.big)}</div>
    ${hasList ? `<div class="list">${c.list.map(l=>`<div><i></i><span>${esc(l)}</span></div>`).join('')}</div>` : ''}
    ${c.sub ? `<div class="sub">${esc(c.sub)}</div>` : ''}
  </div>
  ${SITE ? "" : `<div class="foot"><div class="logo">AYKO</div><div class="url">По всей России</div></div>`}
</div></body></html>`; };

(async()=>{
  const b = await chromium.launch();
  const p = await b.newPage({ viewport:{width:W,height:H} });
  for (const c of cards){
    await p.setContent(html(c), { waitUntil:'load' });
    /* проверка: содержимое не должно быть выше 900 px */
    const over = await p.evaluate((h)=>document.querySelector('.in').scrollHeight - h, H);
    if (over > 0) console.log('  ! не влезает на ' + over + ' px: ' + c.file);
    await p.waitForTimeout(100);
    const f = path.join(out, (SITE ? c.file.replace(/^\d+-/,'') : c.file) + '.jpg');
    await p.screenshot({ path:f, type:'jpeg', quality:88 });
    console.log(Math.round(fs.statSync(f).size/1024) + ' КБ  ' + path.basename(f));
  }
  await b.close();
})();
