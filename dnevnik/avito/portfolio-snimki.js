/* Снимки сайтов для портфолио: каждый в двух видах — на мониторе и в телефоне.
   Страницы оживают по скроллу, поэтому сначала прогоняем их сверху донизу,
   иначе в кадр попадут пустые блоки.
   Запуск:  node portfolio-snimki.js                                       */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const BAZA = 'http://127.0.0.1:8777';
const OUT = path.join(__dirname, '..', 'foto', 'portfolio', 'snimki');
fs.mkdirSync(OUT, { recursive: true });

const STR = [
  { id: 'atelier',        url: '/index.html',                   name: 'Atelier · Королёв' },
  { id: 'atelier-2',      url: '/2.html',                       name: 'Atelier · второй вариант' },
  { id: 'ayko',           url: '/ayko/index.html',              name: 'AYKO · мой сайт' },
  { id: 'ayko-cosmos',    url: '/ayko/cosmos.html',             name: 'AYKO · вариант «Космос»' },
  { id: 'savva',          url: '/savva/index.html',             name: 'SAVVA · кофейня в Медине' },
  { id: 'savva-arka',     url: '/savva/mockups/1-arch.html',    name: 'SAVVA · макет «Арка»' },
  { id: 'savva-vitrina',  url: '/savva/mockups/2-cinema.html',  name: 'SAVVA · макет «Витрина»' },
  { id: 'savva-gazeta',   url: '/savva/mockups/3-editorial.html', name: 'SAVVA · макет «Газета»' },
  { id: 'kromka',         url: '/demo-kofeynya/index.html',     name: 'КРОМКА · макет кофейни с арт-десертами' },
];

const ozhivit = async p => {
  await p.addStyleTag({ content: 'html{scroll-behavior:auto !important} *{animation-duration:.01s !important;transition-duration:.01s !important}' });
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 35)); }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(700);
};

(async () => {
  const b = await chromium.launch();
  const otchet = [];
  for (const s of STR) {
    // монитор
    const d = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    await d.goto(BAZA + s.url, { waitUntil: 'networkidle' });
    await ozhivit(d);
    await d.screenshot({ path: path.join(OUT, `${s.id}-monitor.jpg`), type: 'jpeg', quality: 90 });
    const diag = await d.evaluate(() => ({
      vysota: document.body.scrollHeight,
      kvadratiki: (document.body.innerText.match(/[�□]/g) || []).length,
      kartinok: [...document.images].length,
      nebitykh: [...document.images].filter(i => i.naturalWidth > 0).length,
    }));
    await d.close();

    // телефон
    const m = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
    await m.goto(BAZA + s.url, { waitUntil: 'networkidle' });
    await ozhivit(m);
    await m.screenshot({ path: path.join(OUT, `${s.id}-telefon.jpg`), type: 'jpeg', quality: 90 });
    await m.close();

    const bitykh = diag.kartinok - diag.nebitykh;
    otchet.push(`${s.name.padEnd(30)} страница ${diag.vysota}px  картинок ${diag.kartinok}` +
      (bitykh ? `, НЕ ЗАГРУЗИЛОСЬ ${bitykh}` : '') +
      (diag.kvadratiki ? `, КВАДРАТИКИ ВМЕСТО БУКВ: ${diag.kvadratiki}` : ''));
  }
  await b.close();
  console.log(otchet.join('\n'));
})();
