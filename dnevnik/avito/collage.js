/* Восьмая фотография — мои настоящие работы. Доказательство, а не обещание. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs=require('fs'), path=require('path');
const F = path.join(__dirname,'..','foto');
const b64 = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(F,f)).toString('base64');
const shots = [
  /* верх срезан: там телефон клиента, а Авито снимает объявления с номерами на фото */
  { f:'rabota-stroyinvest-septiki.jpg', t:'Септики и дренаж', cropTop:11 },
  { f:'rabota-simba-vetklinika.jpg',    t:'Ветклиника' },
  { f:'rabota-savva-kofeynya.jpg',      t:'Кофейня' }
];
const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:900px;background:#f7f5f1;color:#14151a;overflow:hidden;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif;padding:56px 60px 46px;display:flex;flex-direction:column}
h1{font-size:64px;font-weight:700;text-transform:uppercase;letter-spacing:-.015em;line-height:1}
.sub{margin-top:14px;font-size:30px;color:#5f5c56}
.row{margin-top:34px;display:grid;grid-template-columns:repeat(3,1fr);gap:26px;flex:1;min-height:0}
.c{display:flex;flex-direction:column;min-height:0}
.ph{flex:1;min-height:0;border-radius:14px;overflow:hidden;border:1px solid #ddd8ce;background:#fff}
.ph img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
.ph.crop{position:relative}
.ph.crop img{position:absolute;left:0;top:0;width:100%;height:auto}
.cap{margin-top:12px;font-size:25px;color:#5f5c56;font-weight:600}
.foot{margin-top:28px;padding-top:24px;border-top:1px solid #ddd8ce;display:flex;justify-content:space-between;align-items:flex-end}
.logo{font-size:44px;font-weight:700;letter-spacing:.16em}
.url{font-size:27px;color:#5f5c56}
</style></head><body>
<h1>Сайты, которые я сделала</h1>
<div class="sub">Одна страница, куда вести людей из объявления: работы, отзывы, кнопка связи.</div>
<div class="row">${shots.map(s=>`<div class="c"><div class="ph${s.cropTop?' crop':''}"><img src="${b64(s.f)}"${s.cropTop?` style="top:-${s.cropTop}%;height:${100+s.cropTop}%;object-fit:cover"`:''}></div><div class="cap">${s.t}</div></div>`).join('')}</div>
<div class="foot"><div class="logo">AYKO</div><div class="url">Москва и область</div></div>
</body></html>`;
(async()=>{
  const br = await chromium.launch();
  const p = await br.newPage({ viewport:{width:1200,height:900} });
  await p.setContent(html,{waitUntil:'load'});
  await p.waitForTimeout(250);
  const f = path.join(F,'avito','08-raboty.jpg');
  await p.screenshot({path:f,type:'jpeg',quality:88});
  console.log(Math.round(fs.statSync(f).size/1024)+' КБ  08-raboty.jpg');
  await br.close();
})();
