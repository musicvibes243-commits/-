/* Карточка для Авито из настоящей фотографии: снимок фоном,
   затемнение слева, крупный текст поверх. 1200x900 (4:3).
   Картинка вшивается в страницу как base64 — браузер здесь
   не открывает локальные файлы по ссылке file://
   Запуск:  node foto-kartochka.js <путь к фото> <файл результата>   */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const src = process.argv[2];
const outName = process.argv[3] || 'foto-glavnaya.jpg';
const out = path.join(__dirname,'..','foto','avito-kartinki');
fs.mkdirSync(out,{recursive:true});
const b64 = 'data:image/jpeg;base64,' + fs.readFileSync(src).toString('base64');

const html = size => `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:900px;overflow:hidden;position:relative;background:#0a0b0f;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif;color:#fff}
img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:62% 46%}
/* затемнение слева — чтобы текст читался, а фотография осталась видна справа */
.tint{position:absolute;inset:0;background:
  linear-gradient(100deg, rgba(8,9,12,.94) 0%, rgba(8,9,12,.88) 38%, rgba(8,9,12,.42) 62%, rgba(8,9,12,.14) 100%)}
.in{position:absolute;inset:0;padding:66px 64px;display:flex;flex-direction:column;justify-content:center;z-index:2}
.big{font-size:${size}px;font-weight:700;line-height:1.0;letter-spacing:-.025em;text-transform:uppercase;max-width:640px}
.big em{font-style:normal;color:#e8663f;display:block}
.sub{margin-top:26px;font-size:29px;line-height:1.3;color:#d7d4dc;max-width:560px}
.chips{margin-top:40px;display:flex;flex-wrap:wrap;gap:14px;max-width:640px}
.chip{padding:13px 24px;border-radius:999px;border:1px solid rgba(255,255,255,.3);
  background:rgba(255,255,255,.1);font-size:24px;font-weight:600}
</style></head><body>
<img src="${b64}" alt="">
<div class="tint"></div>
<div class="in">
  <div class="big">Авито<em>не продаёт?</em></div>
  <div class="sub">Напишите слово РАЗБОР — посмотрю ваше объявление и скажу, что мешает людям его открыть</div>
  <div class="chips"><span class="chip">Бесплатно</span><span class="chip">Оплата после работы</span><span class="chip">По всей России</span></div>
</div></body></html>`;

(async()=>{
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:1200,height:900}, deviceScaleFactor:1});
  let size=104, bad=null;
  for(; size>=46; size-=4){
    await p.setContent(html(size),{waitUntil:'load'});
    await p.waitForTimeout(120);
    bad = await p.evaluate(()=>{
      const o=[], box=document.querySelector('.in').getBoundingClientRect();
      const L=box.left+64, R=box.right-64, T=box.top+66, B=box.bottom-66;
      document.querySelectorAll('.in *').forEach(e=>{
        const r=e.getBoundingClientRect();
        if(r.width===0) return;
        if(r.right>R+0.5||r.left<L-0.5) o.push('за поля: '+e.textContent.slice(0,22));
      });
      const inner=document.querySelector('.in');
      if(inner.scrollHeight>inner.clientHeight+1) o.push('не помещается по высоте');
      // фотография реально загрузилась, а не пустая
      const im=document.querySelector('img');
      if(!im.naturalWidth) o.push('!! фотография не загрузилась');
      return o;
    });
    if(!bad.length) break;
  }
  if(bad.length){ console.log('!! '+bad.join('\n!! ')); await b.close(); process.exit(1); }
  const f = path.join(out,outName);
  await p.screenshot({path:f, type:'jpeg', quality:92});
  console.log(`кегль ${size}px, фотография на месте`);
  console.log('файл:', f, (fs.statSync(f).size/1024).toFixed(0)+' КБ');
  await b.close();
})();
