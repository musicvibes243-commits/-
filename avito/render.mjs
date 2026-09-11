/**
 * Рендер макетов объявления в PNG (1800×2400) для загрузки на Авито.
 * Запуск: node avito/render.mjs
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(dir, 'images');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 900, height: 1200 },
  deviceScaleFactor: 2,
});

await page.goto('file://' + path.join(dir, 'posters.html'));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);

const posters = page.locator('.poster');
const total = await posters.count();

for (let i = 0; i < total; i++) {
  const el = posters.nth(i);
  const name = await el.getAttribute('data-name');
  const file = path.join(outDir, `${name}.png`);
  await el.screenshot({ path: file });
  const kb = Math.round(fs.statSync(file).size / 1024);
  console.log(`✓ ${name}.png — ${kb} KB`);
}

await browser.close();
console.log(`\nГотово: ${total} изображений в ${outDir}`);
