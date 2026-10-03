/* Ещё четыре картинки — по одной на каждое оставшееся объявление.
   Одинаковая первая фотография в нескольких объявлениях — главный
   признак дубля для Авито, поэтому у каждого должна быть своя.
   Запуск:  node kartinki2.js                                        */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
const out = path.join(__dirname,'..','foto','avito-kartinki');
fs.mkdirSync(out,{recursive:true});

const INK   = { bg:'#0a0b0f', bg2:'#15171f', text:'#fff',    dim:'#b9b6c0', acc:'#e8663f', line:'rgba(255,255,255,.14)' };
const PAPER = { bg:'#f4f1ea', bg2:'#fff',    text:'#14151a', dim:'#5f5c56', acc:'#c0452a', line:'rgba(0,0,0,.12)' };

/* стопка фотографий */
const foto = k => `<svg viewBox="0 0 460 520" class="art">
  <rect x="60" y="40" width="300" height="220" rx="18" fill="${k.bg2}" stroke="${k.line}" stroke-width="2" transform="rotate(-7 210 150)"/>
  <rect x="100" y="90" width="300" height="220" rx="18" fill="${k.bg2}" stroke="${k.line}" stroke-width="2" transform="rotate(5 250 200)"/>
  <rect x="80" y="180" width="320" height="236" rx="20" fill="${k.acc}"/>
  <circle cx="150" cy="248" r="22" fill="rgba(255,255,255,.55)"/>
  <path d="M96 400 L190 300 L250 356 L310 292 L384 400 Z" fill="rgba(255,255,255,.45)"/>
  <path d="M398 452 L434 452 M416 434 L416 470" stroke="${k.acc}" stroke-width="11" stroke-linecap="round"/>
</svg>`;

/* календарь с отметками — про ведение */
const kalendar = k => `<svg viewBox="0 0 460 520" class="art">
  <rect x="50" y="70" width="360" height="340" rx="24" fill="${k.bg2}" stroke="${k.line}" stroke-width="2"/>
  <rect x="50" y="70" width="360" height="62" rx="24" fill="${k.acc}"/>
  <rect x="50" y="110" width="360" height="22" fill="${k.acc}"/>
  ${[0,1,2,3].map(r=>[0,1,2,3,4].map(c=>{
     const on = (r*5+c)%4===0;
     return `<rect x="${84+c*62}" y="${160+r*58}" width="34" height="34" rx="9"
       fill="${on?k.acc:k.line}" opacity="${on?1:.8}"/>`;}).join('')).join('')}
  <path d="M120 452 L190 452 M120 486 L300 486" stroke="${k.line}" stroke-width="12" stroke-linecap="round"/>
</svg>`;

/* окно браузера — про сайт */
const brauzer = k => `<svg viewBox="0 0 460 520" class="art">
  <rect x="40" y="80" width="380" height="300" rx="20" fill="${k.bg2}" stroke="${k.line}" stroke-width="2"/>
  <path d="M40 130 H420" stroke="${k.line}" stroke-width="2"/>
  <circle cx="72" cy="105" r="8" fill="${k.acc}"/><circle cx="100" cy="105" r="8" fill="${k.line}"/><circle cx="128" cy="105" r="8" fill="${k.line}"/>
  <rect x="70" y="160" width="200" height="22" rx="11" fill="${k.acc}"/>
  ${[0,1,2].map(i=>`<rect x="70" y="${206+i*30}" width="${300-i*70}" height="14" rx="7" fill="${k.line}"/>`).join('')}
  <rect x="70" y="308" width="150" height="44" rx="22" fill="${k.acc}"/>
  <rect x="120" y="410" width="220" height="70" rx="16" fill="${k.bg2}" stroke="${k.line}" stroke-width="2"/>
  <rect x="150" y="434" width="160" height="22" rx="11" fill="${k.line}"/>
</svg>`;

const ICON = {
  foto:  'M4 6h4l2-2h4l2 2h4v14H4V6zm8 3a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z',
  grafik:'M4 20h16v-2H6V4H4v16zm4-3h3V9H8v8zm5 0h3V6h-3v11z',
  lupa:  'M11 4a7 7 0 1 0 4.2 12.6l4.1 4.1 1.4-1.4-4.1-4.1A7 7 0 0 0 11 4zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10z',
  cena:  'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm.9 15.3v1.3h-1.7v-1.3c-1.7-.2-2.9-1.2-3-2.7h1.9c.1.7.8 1.2 1.9 1.2 1 0 1.7-.4 1.7-1.1 0-.6-.4-.9-1.7-1.2l-1.1-.2c-1.7-.4-2.5-1.2-2.5-2.5 0-1.4 1.1-2.4 2.8-2.6V6.1h1.7v1.3c1.6.2 2.7 1.2 2.8 2.6h-1.9c-.1-.7-.7-1.1-1.7-1.1s-1.6.4-1.6 1c0 .6.4.9 1.6 1.1l1.1.3c1.8.4 2.6 1.1 2.6 2.5 0 1.5-1.1 2.4-2.9 2.6z',
  chas:  'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 10.6V6h-2v7.4l5 3 1-1.7-4-2.1z',
  shit:  'M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z',
};

const CARDS = [
  { file:'04-foto.jpg', skin:PAPER, art:foto,
    big:['В ленте видно','<em>одну фотографию</em>'], sub:'По ней решают: открыть объявление или листать дальше',
    rows:[['foto','Отберу те, что работают'],['lupa','Обработаю: кадр, свет, порядок'],['grafik','Подскажу, что доснять']] },

  { file:'05-vedenie.jpg', skin:INK, art:kalendar,
    big:['Слежу каждую','<em>неделю</em>'], sub:'Разовая переделка работает, пока рынок стоит на месте. Он не стоит',
    rows:[['grafik','Отчёт раз в неделю'],['chas','Правлю то, что просело'],['cena','Бюджет платите площадке']] },

  { file:'06-sayt.jpg', skin:INK, art:brauzer,
    big:['Куда вести людей','<em>из объявления</em>'], sub:'На Авито помещается не всё: работы, отзывы, цены',
    rows:[['foto','Примеры работ и форма заявки'],['cena','15 000 ₽ или 2 000 ₽ в месяц'],['shit','Оплата после того, как увидите']] },
];

/* отдельная вёрстка для карточки с цифрами — там главное числа, а не список */
const CIFRY = { file:'07-yandex.jpg', skin:INK,
  big:['Реклама','<em>в Яндексе</em>'], sub:'Мои цифры за месяц, две кампании по инженерным системам',
  stats:[['470','переходов на сайт'],['19 ₽','цена перехода'],['7,2 %','кликабельность']] };

const htmlList = (c,k,size) => `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:900px;background:${k.bg};color:${k.text};overflow:hidden;position:relative;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif}
body::before{content:"";position:absolute;right:-16%;top:-22%;width:74%;height:88%;border-radius:50%;
  background:radial-gradient(circle,${k.acc}2e,transparent 68%)}
.in{position:relative;z-index:2;height:100%;padding:62px 64px;display:flex;align-items:center;gap:40px}
.lt{flex:1 1 56%;min-width:0}.rt{flex:0 0 40%;display:flex;align-items:center;justify-content:center}
.art{width:100%;height:auto;max-height:620px}
.big{font-size:${size}px;font-weight:700;line-height:1.0;letter-spacing:-.025em;text-transform:uppercase}
.big em{font-style:normal;color:${k.acc};display:block}
.sub{margin-top:24px;font-size:28px;line-height:1.3;color:${k.dim};max-width:580px}
.rows{margin-top:40px;display:grid;gap:20px}
.row{display:flex;align-items:center;gap:18px;font-size:26px;font-weight:600}
.ic{flex:none;width:52px;height:52px;border-radius:14px;display:grid;place-content:center;
  background:${k.acc}24;border:1px solid ${k.acc}55}
.ic svg{width:26px;height:26px;fill:${k.acc};display:block}
</style></head><body><div class="in">
  <div class="lt"><div class="big">${c.big.join('<br>')}</div><div class="sub">${c.sub}</div>
  <div class="rows">${c.rows.map(([i,t])=>`<div class="row"><span class="ic"><svg viewBox="0 0 24 24"><path d="${ICON[i]}"/></svg></span><span>${t}</span></div>`).join('')}</div></div>
  <div class="rt">${c.art(k)}</div>
</div></body></html>`;

const htmlCifry = (c,k,size) => `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:900px;background:${k.bg};color:${k.text};overflow:hidden;position:relative;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif}
body::before{content:"";position:absolute;right:-20%;top:-26%;width:80%;height:92%;border-radius:50%;
  background:radial-gradient(circle,${k.acc}30,transparent 68%)}
.in{position:relative;z-index:2;height:100%;padding:68px 64px;display:flex;flex-direction:column;justify-content:center}
.big{font-size:${size}px;font-weight:700;line-height:1.0;letter-spacing:-.025em;text-transform:uppercase}
.big em{font-style:normal;color:${k.acc}}
.sub{margin-top:22px;font-size:27px;line-height:1.3;color:${k.dim};max-width:720px}
.st{margin-top:52px;display:flex;gap:26px}
.st div{flex:1;border:1px solid ${k.line};border-radius:22px;padding:30px 28px;background:${k.bg2}}
.st b{display:block;font-size:72px;font-weight:700;letter-spacing:-.03em;line-height:1;color:${k.acc}}
.st span{display:block;margin-top:12px;font-size:23px;color:${k.dim};font-weight:600;line-height:1.25}
.note{margin-top:34px;font-size:23px;color:${k.dim}}
</style></head><body><div class="in">
  <div class="big">${c.big.join(' ')}</div>
  <div class="sub">${c.sub}</div>
  <div class="st">${c.stats.map(([n,t])=>`<div><b>${n}</b><span>${t}</span></div>`).join('')}</div>
  <div class="note">Скриншоты из кабинета — в портфолио</div>
</div></body></html>`;

const check = () => {
  const bad=[];
  /* проверяем только текстовую колонку: картинка справа и должна быть
     правее .lt, иначе проверка ругается на правильную вёрстку */
  const lt = document.querySelector('.lt');
  const zone = lt || document.querySelector('.in');
  const R = zone.getBoundingClientRect().right;
  zone.querySelectorAll('*').forEach(e=>{
    const r=e.getBoundingClientRect(); if(r.width===0) return;
    if(r.right>R+0.5) bad.push('за поля: '+e.textContent.slice(0,22));
    if(e.scrollWidth>e.clientWidth+1) bad.push('обрезано: '+e.textContent.slice(0,22));
  });
  const inn=document.querySelector('.in');
  if(inn.scrollHeight>inn.clientHeight+1) bad.push('не помещается по высоте');
  return bad;
};

(async()=>{
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:1200,height:900}, deviceScaleFactor:1});
  for (const c of CARDS){
    let size=92, bad=null;
    for(; size>=44; size-=3){
      await p.setContent(htmlList(c,c.skin,size),{waitUntil:'load'});
      await p.waitForTimeout(70);
      bad = await p.evaluate(check); if(!bad.length) break;
    }
    if(bad.length){ console.log('!! '+c.file+': '+bad.join('; ')); await b.close(); process.exit(1); }
    await p.screenshot({path:path.join(out,c.file),type:'jpeg',quality:92});
    console.log(`${c.file} — кегль ${size}px`);
  }
  let size=96, bad=null;
  for(; size>=44; size-=3){
    await p.setContent(htmlCifry(CIFRY,CIFRY.skin,size),{waitUntil:'load'});
    await p.waitForTimeout(70);
    bad = await p.evaluate(check); if(!bad.length) break;
  }
  if(bad.length){ console.log('!! '+CIFRY.file+': '+bad.join('; ')); await b.close(); process.exit(1); }
  await p.screenshot({path:path.join(out,CIFRY.file),type:'jpeg',quality:92});
  console.log(`${CIFRY.file} — кегль ${size}px`);
  await b.close();
})();
