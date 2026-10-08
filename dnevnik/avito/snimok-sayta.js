/* Снимок карточки «Подписка — 2 000 ₽»: число на экране телефона должно
   совпадать с числом на обложке, иначе человек видит два разных ценника.
   Плюс проверка на слова, за которые Авито сняло объявление.            */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const STOP = /instagram|facebook|\bmeta\b|инстаграм|фейсбук/i;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  await p.goto('http://127.0.0.1:8777/index.html', { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: 'html{scroll-behavior:auto !important} *{animation:none !important;transition:none !important}' });
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); }
  });
  await p.evaluate(() => {
    // прилипшие панели в кадре смотрятся обрубками — убираем
    document.querySelectorAll('body *').forEach(e => {
      if (getComputedStyle(e).position === 'fixed') e.style.display = 'none';
    });
    document.querySelector('.tile.tarif.fill').scrollIntoView({ block: 'center' });
    window.scrollBy(0, 104);   // обрезок чужого абзаца уходит за верхний край
  });
  await p.waitForTimeout(900);

  const r = await p.evaluate(() => {
    const t = document.querySelector('.tile.tarif.fill').getBoundingClientRect();
    const seen = [];
    document.querySelectorAll('body *').forEach(e => {
      const b = e.getBoundingClientRect();
      if (b.bottom > 0 && b.top < innerHeight && b.width && b.height) {
        const own = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').trim();
        if (own) seen.push(own);
      }
    });
    return { seen: seen.join(' | '), tileTop: Math.round(t.top), tileBottom: Math.round(t.bottom) };
  });

  const hit = r.seen.match(STOP);
  if (hit) { console.log('✗ в кадр попало:', hit[0]); await b.close(); process.exit(1); }
  if (r.seen.includes('15 000')) { console.log('✗ в кадре видна цена 15 000 — спорит с обложкой'); await b.close(); process.exit(1); }
  if (!r.seen.includes('2 000')) { console.log('✗ цены 2 000 в кадре нет'); await b.close(); process.exit(1); }
  console.log('✓ в кадре только 2 000 ₽, запрещённых слов нет');
  console.log('  карточка подписки:', r.tileTop, '→', r.tileBottom, 'из 844');
  await p.screenshot({ path: '/tmp/claude-0/-home-user--/ab892598-1264-5d65-8d4e-18a2e2b2db93/scratchpad/sayt-telefon.png' });
  await b.close();
})();
