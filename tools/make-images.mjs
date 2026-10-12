/* Пересобрать og.png (картинку для мессенджеров) и иконки сайта.

   Запуск из корня проекта:  node tools/make-images.mjs

   Снимаем именно через page.screenshot() Playwright. Старый способ
   (chrome --headless --screenshot) обрезает холст и оставляет снизу
   белую полосу — так уже испортились и скрин портфолио, и сама
   иконка сайта. */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const b = await chromium.launch();

const og = await b.newPage({ viewport: { width: 1200, height: 630 } });
await og.goto(new URL('og-template.html', import.meta.url).href);
await og.waitForTimeout(1200);
await og.screenshot({ path: 'docs/og.png' });

/* 180 — для экрана «Домой» на iPhone, 192 и 512 — для манифеста
   (Android и значок установленного приложения). */
const IKONKI = [[180, 'docs/apple-touch-icon.png'], [192, 'docs/icon-192.png'], [512, 'docs/icon-512.png']];
for (const [storona, put] of IKONKI) {
  const p = await b.newPage({ viewport: { width: storona, height: storona } });
  await p.goto(new URL('icon-template.html', import.meta.url).href);
  await p.waitForTimeout(400);
  await p.screenshot({ path: put });
  await p.close();
  console.log(`${put} — ${storona}×${storona}, ${readFileSync(put).length} байт`);
}

await b.close();
console.log('og.png и иконки обновлены');
