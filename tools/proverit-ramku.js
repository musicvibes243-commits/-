const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch(); let ok=true; const t=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false;};
for (const [w,h] of [[1440,900],[390,844]]){
 const p=await b.newPage({viewport:{width:w,height:h}}); const loaded=[];
 p.on('response',r=>{if(/img\/(simba|savva|septic)\.jpg/.test(r.url())) loaded.push(r.url())});
 await p.goto('http://localhost:8099/ayko/',{waitUntil:'networkidle'});
 t(loaded.length===0, `${w}: снимки сайтов не грузятся при открытии страницы`);
 const btns=await p.$$('#plist > *');
 for (const i of [2,3,4]){
   await btns[i].scrollIntoViewIfNeeded(); await btns[i].click();
   await p.waitForFunction(()=>{const im=document.getElementById('phoneImg');return im.complete&&im.naturalHeight>0});
   await p.waitForTimeout(200);
   const s=await p.evaluate(()=>{const sc=document.getElementById('phoneScroll');const im=document.getElementById('phoneImg');return {src:im.src.split('/').pop(),nh:im.naturalHeight,over:sc.scrollHeight-sc.clientHeight,hint:!document.getElementById('scrollHint').hidden}});
   t(s.over>1000 && s.hint, `${w}: ${s.src} ${s.nh}px, прокрутка ${s.over}px, подсказка ${s.hint}`);
   await p.$eval('#phoneScroll',e=>e.scrollTop=500); await p.waitForTimeout(200);
   const gone=await p.$eval('#scrollHint',e=>e.classList.contains('gone')); t(gone, `${w}: подсказка гаснет после прокрутки`);
   if(w===1440 && i===4){ await p.$eval('#phoneScroll',e=>e.scrollTop=0); await p.locator('.view').screenshot({path:'view-septic.png'}); }
   if(w===1440 && i===2){ await p.$eval('#phoneScroll',e=>e.scrollTop=0); await p.locator('.view').screenshot({path:'view-simba.png'}); }
 }
 await p.close();}
await b.close(); process.exit(ok?0:1)})();
