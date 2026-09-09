/* Пересобрать og.png (картинку для мессенджеров) и иконку сайта.
   Запуск из корня проекта:  npm i -D playwright && node tools/make-images.mjs  */
import { chromium } from 'playwright';
const b = await chromium.launch();
const og = await b.newPage({ viewport: { width: 1200, height: 630 } });
await og.goto(new URL('og-template.html', import.meta.url).href);
await og.waitForTimeout(1200);
await og.screenshot({ path: 'docs/og.png' });
const ic = await b.newPage({ viewport: { width: 180, height: 180 } });
await ic.goto(new URL('icon-template.html', import.meta.url).href);
await ic.waitForTimeout(300);
await ic.screenshot({ path: 'docs/apple-touch-icon.png' });
await b.close();
console.log('docs/og.png и docs/apple-touch-icon.png обновлены');
