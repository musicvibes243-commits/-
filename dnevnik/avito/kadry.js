/* Кадры для ролика в стиле кинетической типографики.
   Одно слово на кадр, 1080x1920. Фон чередуется чёрный/белый,
   слова-акценты — красным на чёрном.
   Размер шрифта подбирается под самое длинное слово в кадре,
   чтобы ни одно не упёрлось в поля.
   Запуск:  node kadry.js     (кладёт файлы в ../foto/kadry/)          */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
const out = path.join(__dirname,'..','foto','kadry');
fs.rmSync(out,{recursive:true,force:true}); fs.mkdirSync(out,{recursive:true});

/* b — чёрный фон, w — белый фон, r — красным на чёрном */
const FRAMES = [
 ['Объявление','b'], ['висит','b'], ['а звонков','w'], ['нет','r'],
 ['Значит','b'], ['его просто','w'], ['не открывают','r'],
 ['В ленте видно','b'], ['заголовок','w'], ['и первое фото','b'],
 ['остальное','w'], ['не читают','r'],
 ['Перепишу','b'], ['заголовок','w'], ['текст','b'], ['фото','w'], ['категорию','b'],
 ['без','w'], ['предоплаты','r'],
 ['Платите когда','b'], ['увидите готовое','w'],
 ['Два года','b'], ['септики','w'], ['дренаж','b'], ['отопление','w'],
 ['знаю вашу работу','r'],
 ['Сайт по подписке','b'], ['2 000 ₽ в месяц','r'], ['всё включено','w'],
 ['Звонков не обещаю','b'], ['отвечаю за то','w'], ['что объявление','b'],
 ['станут открывать чаще','r'],
 ['+7 977 556-76-01','b'], ['AYKO · aykoweb.ru','b'],
];

const SKIN = {
  b:{bg:'#000000', fg:'#ffffff'},
  w:{bg:'#ffffff', fg:'#000000'},
  r:{bg:'#000000', fg:'#d94f30'},
};

const html = (t,s,size) => `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;background:${SKIN[s].bg};color:${SKIN[s].fg};
  display:flex;align-items:center;justify-content:center;padding:0 70px;
  font-family:'DejaVu Sans','Liberation Sans',sans-serif;overflow:hidden}
p{font-size:${size}px;font-weight:700;text-transform:uppercase;letter-spacing:-.015em;
  line-height:1.02;text-align:center;max-width:940px}
</style></head><body><p id="t">${t}</p></body></html>`;

(async()=>{
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:1080,height:1920}, deviceScaleFactor:1});
  let i=0, warn=[];
  for (const [text,skin] of FRAMES){
    i++;
    /* подбираю кегль: начинаю с крупного и уменьшаю, пока слово
       не перестанет упираться в поля и не влезет по высоте */
    let size=190;
    for(; size>=52; size-=4){
      await p.setContent(html(text,skin,size),{waitUntil:'load'});
      const ok = await p.evaluate(()=>{
        const e=document.getElementById('t'), r=e.getBoundingClientRect();
        return r.width<=940.5 && r.height<=1400 && e.scrollWidth<=e.clientWidth+1;
      });
      if(ok) break;
    }
    if(size<70) warn.push(`«${text}» пришлось ужать до ${size}px`);
    const name = String(i).padStart(2,'0')+'-'+skin+'.jpg';
    await p.screenshot({path:path.join(out,name), type:'jpeg', quality:92});
  }
  await b.close();
  console.log(`кадров: ${i}`);
  console.log(warn.length? 'мелкий шрифт:\n  '+warn.join('\n  ') : 'все кадры крупным шрифтом');
})();
