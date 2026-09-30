/* Вертикальный лист для сторис — 1080x1920.
   Верх 240 и низ 280 пикселей оставлены пустыми: там интерфейс приложения.
   Размер шрифта подбирается сам, пока всё не уместится без наложений.
   Запуск:  node story.js     (кладёт файл в ../foto/stories/)          */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
const out = path.join(__dirname,'..','foto','stories');
fs.mkdirSync(out,{recursive:true});

const TEL = '+7 977 556-76-01';
const TOP = 240, BOT = 280;

/* Листы. Первый бьёт в боль, второй перечисляет преимущества.
   Цену покупки сайта не пишем намеренно: крупная сумма в сторис
   отпугивает раньше, чем человек дочитает. Подписку 2 000 ₽
   показываем — она наоборот притягивает. */
const SLIDES = [
 { file:'story-stroitelyam.jpg',
   eyebrow:'Строителям и монтажникам',
   big:'Объявление<br>висит,<br>а звонков <em>нет</em>',
   sub:'Значит, его просто не открывают. В ленте видно заголовок и первую фотографию — остальное человек даже не разворачивает.',
   list:['Перепишу ваше объявление на Авито',
         'Два года веду рекламу инженеру: септики, дренаж, отопление',
         'Оплата после работы. Без предоплаты'],
   ctaL:'Разбор бесплатно', ctaT:TEL, ctaN:'Позвоните или напишите в WhatsApp' },

 { file:'story-preimushchestva.jpg',
   eyebrow:'Строителям · по всей России',
   big:'Вы работаете.<br>Рекламу беру <em>на себя</em>',
   sub:'',
   list:['Без предоплаты — платите, когда увидите готовое',
         'Цена известна до начала работы и не меняется',
         'Два года веду рекламу инженеру: септики, дренаж, отопление',
         'Не только Авито: Яндекс, соцсети, сайт',
         'Веду соцсети за вас — 4 500 просмотров за первый день',
         'Звонков не обещаю. Отвечаю за то, что объявление станут открывать чаще'],
   ctaL:'Сайт по подписке', ctaT:'2 000 ₽ в месяц',
   ctaN:'Сайт, бот для заявок, домен, хостинг и обслуживание — всё включено',
   ctaP:TEL } ];

const html = (c,k) => `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;background:#0a0b0f;color:#fff;overflow:hidden;position:relative;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif}
body::before{content:"";position:absolute;left:-18%;top:-10%;width:90%;height:52%;border-radius:50%;
  background:radial-gradient(circle,rgba(217,79,48,.30),transparent 68%)}
body::after{content:"";position:absolute;right:-24%;bottom:2%;width:86%;height:44%;border-radius:50%;
  background:radial-gradient(circle,rgba(217,79,48,.20),transparent 70%)}
.in{position:relative;z-index:2;height:100%;padding:${TOP}px 80px ${BOT}px;display:flex;flex-direction:column}

.eyebrow{align-self:flex-start;padding:${14*k}px ${30*k}px;border-radius:999px;
  border:1px solid rgba(255,255,255,.26);background:rgba(255,255,255,.07);
  font-size:${26*k}px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#f0a48f}

.big{margin-top:${38*k}px;font-size:${100*k}px;font-weight:700;line-height:.98;letter-spacing:-.02em;text-transform:uppercase}
.big em{font-style:normal;color:#e8663f}

.sub{margin-top:${30*k}px;font-size:${34*k}px;line-height:1.32;color:#c9c6cf;max-width:880px}

.list{margin-top:${38*k}px;display:grid;gap:${22*k}px}
.list div{display:flex;align-items:flex-start;gap:${20*k}px;font-size:${33*k}px;line-height:1.25;font-weight:600;color:#efedf2}
.list i{flex:none;width:${15*k}px;height:${15*k}px;border-radius:50%;background:#e8663f;margin-top:${13*k}px}

.cta{margin-top:auto;border-radius:${32*k}px;padding:${38*k}px ${42*k}px ${42*k}px;
  background:linear-gradient(158deg,#e2603f 0%,#c0452a 48%,#8d3220 100%);
  border:1px solid rgba(255,255,255,.22)}
.cta .l{font-size:${27*k}px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,.84)}
.cta .t{margin-top:${14*k}px;font-size:${74*k}px;font-weight:700;letter-spacing:-.01em;line-height:1;white-space:nowrap}
.cta .n{line-height:1.3}
.cta .n{margin-top:${16*k}px;font-size:${30*k}px;color:rgba(255,255,255,.92);font-weight:600}
.cta .p{margin-top:${14*k}px;font-size:${44*k}px;font-weight:700;white-space:nowrap;letter-spacing:-.01em}

.foot{margin-top:${26*k}px;display:flex;align-items:baseline;justify-content:space-between}
.foot b{font-size:${38*k}px;font-weight:700;letter-spacing:.24em}
.foot span{font-size:${29*k}px;color:#9b9aa3;font-weight:600}
</style></head><body><div class="in">
  <div class="eyebrow">${c.eyebrow}</div>
  <div class="big">${c.big}</div>
  ${c.sub ? `<div class="sub">${c.sub}</div>` : ''}
  <div class="list">${c.list.map(t=>`<div><i></i><span>${t}</span></div>`).join('')}</div>
  <div class="cta">
    <div class="l">${c.ctaL}</div>
    <div class="t">${c.ctaT}</div>
    <div class="n">${c.ctaN}</div>
    ${c.ctaP ? `<div class="p">${c.ctaP}</div>` : ''}
  </div>
  <div class="foot"><b>AYKO</b><span>aykoweb.ru</span></div>
</div></body></html>`;

/* проверяю не «вылезло за край», а «наложилось друг на друга» —
   именно это и случилось в первой версии */
const check = () => {
  const bad=[];
  const el=s=>document.querySelector(s);
  const q=s=>el(s).getBoundingClientRect();
  /* .sub есть не на всех листах — пропускаем то, чего нет,
     и сравниваем соседей по факту, а не по жёсткому списку */
  const order=['.eyebrow','.big','.sub','.list','.cta','.foot'].filter(el);
  for(let i=0;i<order.length-1;i++){
    const a=order[i], b=order[i+1];
    /* мало «не наложилось» — нужен зазор, иначе карточка липнет
       к последнему пункту и выглядит как накладка */
    const need = (a==='.list'&&b==='.cta') ? 28 : 0.5;
    if(q(a).bottom + need > q(b).top) bad.push(`«${a}» липнет к «${b}»`);
  }
  if(q('.foot').bottom > 1920-280+1) bad.push('подвал заходит в зону интерфейса');
  if(q('.eyebrow').top < 240-1) bad.push('шапка заходит в зону интерфейса');
  /* сравниваем с полями блока, а не с краем картинки: текст,
     доехавший вплотную до края, формально «в кадре», но выглядит
     обрезанным. Именно на этом я один раз уже прошла мимо. */
  const box=q('.in'), L=box.left+80, R=box.right-80;
  document.querySelectorAll('.in *').forEach(e=>{
    const r=e.getBoundingClientRect();
    if(r.width===0) return;
    if(r.right>R+0.5||r.left<L-0.5) bad.push('заходит на поля: '+e.textContent.slice(0,26));
  });
  return bad;
};

(async()=>{
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:1080,height:1920}, deviceScaleFactor:1});
 for (const c of SLIDES) {
  /* иду сверху вниз: беру самый крупный размер, при котором ещё нет
     наложений. В сторис текст читают на вытянутой руке — чем крупнее,
     тем лучше, а пустая дыра посередине выглядит как недоделка. */
  let k=1.34, bad=null;
  for(; k>=0.7; k-=0.02){
    await p.setContent(html(c,k),{waitUntil:'load'});
    await p.waitForTimeout(120);
    bad = await p.evaluate(check);
    if(!bad.length) break;
  }
  if(bad.length){ console.log('!! '+c.file+' не уместился:\n!! '+bad.join('\n!! ')); await b.close(); process.exit(1); }
  const file = path.join(out,c.file);
  await p.screenshot({path:file, type:'jpeg', quality:92});
  console.log(`${c.file} — масштаб ${k.toFixed(2)}, наложений нет`);
 }
  await b.close();
})();
