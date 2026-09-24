const { chromium } = require('playwright');
const sites = [['simba','https://vetsimba.netlify.app/'],['savva','http://savva-kafe.site/'],['septic','https://stroyinvest-mo.ru/']];
(async () => {
  const b = await chromium.launch();
  for (const [n,u] of sites) {
    const ctx = await b.newContext({viewport:{width:430,height:932},deviceScaleFactor:2,isMobile:true,hasTouch:true,
      userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', locale:'ru-RU',ignoreHTTPSErrors:true});
    const p = await ctx.newPage();
    const failed=[];
    await p.route('**/*', async route => {
      const url = route.request().url();
      if (/mc\.yandex|metrika|\.mp4(\?|$)/.test(url)) return route.abort();
      for (let i=0;i<6;i++){
        try { const r = await route.fetch({timeout:30000}); return route.fulfill({response:r}); }
        catch(e){ await new Promise(z=>setTimeout(z,500*(i+1))); }
      }
      failed.push('GAVE UP '+url); return route.abort();
    }); 
    await p.goto(u,{waitUntil:'networkidle',timeout:60000}).catch(e=>console.log(n,'goto',e.message));
    // проскроллить, чтобы сработали ленивые картинки и анимации появления
    await p.addStyleTag({content:'*{content-visibility:visible!important}'});
    const h = await p.evaluate(()=>document.documentElement.scrollHeight);
    for (let y=0;y<h;y+=300){ await p.evaluate(y=>window.scrollTo(0,y),y); await p.waitForTimeout(150); }
    await p.waitForTimeout(1500);
    await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(1200);
    const hidden = await p.evaluate(()=>{const out=[];for(const e of document.querySelectorAll('body *')){const cs=getComputedStyle(e);if(cs.position==='fixed'&&cs.display!=='none'&&cs.visibility!=='hidden'){const r=e.getBoundingClientRect();if(r.height>0&&r.top>innerHeight/2){e.style.setProperty('display','none','important');out.push(e.tagName+'.'+e.className)}}}return out});
    console.log(n,'hidden fixed',hidden);
    const TH = await p.evaluate(()=>document.documentElement.scrollHeight);
    let k=0; for (let y=0;y<TH;y+=3000,k++){
      await p.screenshot({path:`${n}-part${String(k).padStart(2,'0')}.png`,fullPage:true,clip:{x:0,y,width:430,height:Math.min(3000,TH-y)}});
    }
    const H = await p.evaluate(()=>document.documentElement.scrollHeight);
    console.log(n,'height',H,'failed',failed.length, failed);
    await ctx.close();
  }
  await b.close();
})();
