/* Картинки для объявлений на Авито — 1200x900 (4:3).
   Рисуются целиком кодом: ни одной фотографии, ни одного чужого лица.
   Палитра сайта: почти чёрный фон и кирпично-оранжевый акцент.
   Запуск:  node kartinki.js     (кладёт файлы в ../foto/avito-kartinki/)  */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
const out = path.join(__dirname,'..','foto','avito-kartinki');
fs.rmSync(out,{recursive:true,force:true}); fs.mkdirSync(out,{recursive:true});

const INK   = { bg:'#0a0b0f', bg2:'#15171f', text:'#ffffff', dim:'#b9b6c0', acc:'#e8663f', line:'rgba(255,255,255,.14)' };
const PAPER = { bg:'#f4f1ea', bg2:'#ffffff', text:'#14151a', dim:'#5f5c56', acc:'#c0452a', line:'rgba(0,0,0,.12)' };

/* --- графика, нарисованная руками: телефон, столбики, облачка --- */
const telefon = k => `
<svg viewBox="0 0 420 520" class="art">
  <rect x="96" y="20" width="228" height="470" rx="34" fill="${k.bg2}" stroke="${k.line}" stroke-width="2"/>
  <rect x="176" y="34" width="68" height="14" rx="7" fill="${k.line}"/>
  <rect x="118" y="70" width="184" height="104" rx="12" fill="${k.acc}" opacity=".16"/>
  ${[0,1,2,3].map(i=>`<rect x="118" y="${196+i*34}" width="${184-i*26}" height="14" rx="7" fill="${k.line}"/>`).join('')}
  <rect x="118" y="340" width="184" height="40" rx="20" fill="${k.acc}"/>
  <!-- стрелка выносится правее корпуса (он кончается на x=324),
       иначе сливается с оранжевой кнопкой внутри экрана -->
  <path d="M338 472 L404 396 M404 396 L404 440 M404 396 L362 396" stroke="${k.acc}" stroke-width="13"
        stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

const stolbiki = k => `
<svg viewBox="0 0 460 520" class="art">
  ${[0,1,2,3,4,5].map(i=>`<rect x="${34+i*72}" y="${430-i*56}" width="46" height="${70+i*56}" rx="10"
      fill="${k.acc}" opacity="${0.3+i*0.14}"/>`).join('')}
  <path d="M46 392 L406 86" stroke="${k.acc}" stroke-width="10" stroke-linecap="round" fill="none"/>
  <path d="M406 86 L352 92 M406 86 L402 140" stroke="${k.acc}" stroke-width="10"
        stroke-linecap="round" fill="none"/>
</svg>`;

const oblachka = k => `
<svg viewBox="0 0 460 520" class="art">
  <rect x="30" y="60" width="300" height="104" rx="26" fill="${k.bg2}" stroke="${k.line}" stroke-width="2"/>
  <path d="M70 164 L70 200 L106 164 Z" fill="${k.bg2}" stroke="${k.line}" stroke-width="2"/>
  ${[0,1].map(i=>`<rect x="60" y="${92+i*28}" width="${236-i*74}" height="13" rx="6" fill="${k.line}"/>`).join('')}
  <rect x="130" y="250" width="300" height="104" rx="26" fill="${k.acc}"/>
  <path d="M390 354 L390 390 L354 354 Z" fill="${k.acc}"/>
  ${[0,1].map(i=>`<rect x="160" y="${282+i*28}" width="${236-i*96}" height="13" rx="6" fill="rgba(255,255,255,.55)"/>`).join('')}
  <circle cx="86" cy="430" r="13" fill="${k.acc}"/><circle cx="130" cy="430" r="13" fill="${k.acc}" opacity=".6"/>
  <circle cx="174" cy="430" r="13" fill="${k.acc}" opacity=".3"/>
</svg>`;

const ICON = {
  lupa:  'M11 4a7 7 0 1 0 4.2 12.6l4.1 4.1 1.4-1.4-4.1-4.1A7 7 0 0 0 11 4zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10z',
  foto:  'M4 6h4l2-2h4l2 2h4v14H4V6zm8 3a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z',
  grafik:'M4 20h16v-2H6V4H4v16zm4-3h3V9H8v8zm5 0h3V6h-3v11z',
  cena:  'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm.9 15.3v1.3h-1.7v-1.3c-1.7-.2-2.9-1.2-3-2.7h1.9c.1.7.8 1.2 1.9 1.2 1 0 1.7-.4 1.7-1.1 0-.6-.4-.9-1.7-1.2l-1.1-.2c-1.7-.4-2.5-1.2-2.5-2.5 0-1.4 1.1-2.4 2.8-2.6V6.1h1.7v1.3c1.6.2 2.7 1.2 2.8 2.6h-1.9c-.1-.7-.7-1.1-1.7-1.1s-1.6.4-1.6 1c0 .6.4.9 1.6 1.1l1.1.3c1.8.4 2.6 1.1 2.6 2.5 0 1.5-1.1 2.4-2.9 2.6z',
  shit:  'M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z',
};

const CARDS = [
  { file:'01-ne-prodaet.jpg', skin:INK, art:telefon,
    big:['Авито','<em>не продаёт?</em>'], sub:'Найду, что мешает людям открывать ваше объявление',
    rows:[['lupa','Разбор ниши и конкурентов'],['foto','Заголовок, текст, фотографии'],['grafik','Категория и продвижение']] },

  { file:'02-pochemu-ne-otkryvayut.jpg', skin:PAPER, art:stolbiki,
    big:['Почему вас','<em>не открывают</em>'], sub:'В ленте видно заголовок и первое фото. Остальное не читают',
    rows:[['lupa','Смотрю вашу статистику'],['foto','Переписываю и переснимаю'],['grafik','Через неделю сверяем цифры']] },

  { file:'03-razbor-besplatno.jpg', skin:INK, art:oblachka,
    big:['Разбор','<em>бесплатно</em>'], sub:'Напишите слово РАЗБОР — посмотрю объявление и скажу, что менять',
    rows:[['cena','Оплата после работы'],['shit','Цена названа до начала'],['grafik','Два года в стройке']] },
];

const html = (c,k,size) => `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:900px;background:${k.bg};color:${k.text};overflow:hidden;position:relative;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif}
body::before{content:"";position:absolute;right:-16%;top:-22%;width:74%;height:88%;border-radius:50%;
  background:radial-gradient(circle,${k.acc}2e,transparent 68%)}
.in{position:relative;z-index:2;height:100%;padding:62px 64px;display:flex;align-items:center;gap:40px}
.lt{flex:1 1 56%;min-width:0}
.rt{flex:0 0 40%;display:flex;align-items:center;justify-content:center}
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
  <div class="lt">
    <div class="big" id="b">${c.big.join('<br>')}</div>
    <div class="sub">${c.sub}</div>
    <div class="rows">${c.rows.map(([i,t])=>
      `<div class="row"><span class="ic"><svg viewBox="0 0 24 24"><path d="${ICON[i]}"/></svg></span><span>${t}</span></div>`).join('')}</div>
  </div>
  <div class="rt">${c.art(k)}</div>
</div></body></html>`;

/* проверяю то, что логи не показывают: вылез ли текст за поля
   и не наехал ли один блок на другой */
const check = () => {
  const bad=[]; const q=s=>document.querySelector(s).getBoundingClientRect();
  const lt=q('.lt');
  document.querySelectorAll('.lt *').forEach(e=>{
    const r=e.getBoundingClientRect();
    if(r.right>lt.right+0.5) bad.push('вылезает вправо: '+e.textContent.slice(0,24));
    if(e.scrollWidth>e.clientWidth+1) bad.push('обрезано: '+e.textContent.slice(0,24));
  });
  if(lt.bottom>900-62+1 || q('.rows').bottom>900-62+1) bad.push('текст уходит за нижнее поле');
  return bad;
};

(async()=>{
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:1200,height:900}, deviceScaleFactor:1});
  for (const c of CARDS){
    let size=96, bad=null;
    for(; size>=46; size-=3){
      await p.setContent(html(c,c.skin,size),{waitUntil:'load'});
      await p.waitForTimeout(80);
      bad = await p.evaluate(check);
      if(!bad.length) break;
    }
    if(bad.length){ console.log('!! '+c.file+':\n!! '+bad.join('\n!! ')); await b.close(); process.exit(1); }
    await p.screenshot({path:path.join(out,c.file), type:'jpeg', quality:92});
    console.log(`${c.file} — кегль ${size}px, всё в поле`);
  }
  await b.close();
})();
