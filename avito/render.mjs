/**
 * Рендер макетов объявления в PNG (1800×2400).
 *
 * Основные 10 слайдов (MAIN) попадают в images/ и images-lux/ с номерами 01–10
 * в порядке показа в объявлении; остальные — в подпапку extra/.
 *
 * node avito/render.mjs        — обе темы
 * node avito/render.mjs lux    — только тёмная
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const dir = path.dirname(fileURLToPath(import.meta.url));

/** Порядок десяти слайдов объявления. */
const MAIN = [
  'cover',            // обложка: акция, 2 дня, 15 000 ₽
  'blyudo-klosh',     // клош и поднос: подаём готовым
  'uslugi-volna',     // услуги по волне
  'kot-otdyhayte',    // кот и ленты акции
  'podtyoki',         // подтёки: сочный дизайн
  'deadline-akciya',  // акция до 30 сентября
  'zvezda-razrez',    // звезда разрезана пополам
  'etapy-raboty',     // четыре шага до запуска
  'stili-dizayna',    // работаем в любом стиле
  'final-cta',        // цена, срок, консультация
];

const themes = [
  { name: 'жёлтая', out: 'images', css: null },
  { name: 'тёмная', out: 'images-lux', css: path.join(dir, 'styles-lux.css') },
];

const only = process.argv[2];
const selected = only ? themes.filter((t) => t.out.includes(only) || t.name.includes(only)) : themes;

const browser = await chromium.launch();

for (const theme of selected) {
  const outDir = path.join(dir, theme.out);
  const extraDir = path.join(outDir, 'extra');
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(extraDir, { recursive: true });

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
  const seen = [];
  console.log(`\n${theme.name} тема → ${theme.out}/`);

  for (let i = 0; i < total; i++) {
    const el = posters.nth(i);
    const slug = await el.getAttribute('data-name');
    seen.push(slug);

    const pos = MAIN.indexOf(slug);
    const file = pos === -1
      ? path.join(extraDir, `${slug}.png`)
      : path.join(outDir, `${String(pos + 1).padStart(2, '0')}-${slug}.png`);

    await el.screenshot({ path: file });
    console.log(`  ${pos === -1 ? '·' : String(pos + 1).padStart(2, '0')} ${path.relative(outDir, file)}`);
  }

  const missing = MAIN.filter((s) => !seen.includes(s));
  if (missing.length) console.warn(`  ! в разметке нет слайдов: ${missing.join(', ')}`);

  await page.close();
}

await browser.close();
console.log('\nГотово.');
