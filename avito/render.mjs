/**
 * Рендер макетов объявления в PNG (1800×2400) для загрузки на Авито.
 * Обе темы: жёлтая (images/) и тёмная «люкс» (images-lux/).
 *
 * Запуск: node avito/render.mjs            — обе темы
 *         node avito/render.mjs lux        — только тёмная
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const dir = path.dirname(fileURLToPath(import.meta.url));

const themes = [
  { name: 'жёлтая', out: 'images', css: null },
  { name: 'тёмная', out: 'images-lux', css: path.join(dir, 'styles-lux.css') },
];

const only = process.argv[2];
const selected = only
  ? themes.filter((t) => t.out.includes(only) || t.name.includes(only))
  : themes;

const browser = await chromium.launch();

for (const theme of selected) {
  const outDir = path.join(dir, theme.out);
  fs.mkdirSync(outDir, { recursive: true });

  const page = await browser.newPage({
    viewport: { width: 900, height: 1200 },
    deviceScaleFactor: 2,
  });
  await page.goto('file://' + path.join(dir, 'posters.html'));
  if (theme.css) await page.addStyleTag({ path: theme.css });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  const posters = page.locator('.poster');
  const total = await posters.count();
  console.log(`\n${theme.name} тема → ${theme.out}/`);

  for (let i = 0; i < total; i++) {
    const el = posters.nth(i);
    const name = await el.getAttribute('data-name');
    const file = path.join(outDir, `${name}.png`);
    await el.screenshot({ path: file });
    console.log(`  ✓ ${name}.png — ${Math.round(fs.statSync(file).size / 1024)} KB`);
  }

  await page.close();
}

await browser.close();
console.log('\nГотово.');
