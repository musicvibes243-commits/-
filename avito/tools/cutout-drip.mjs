/**
 * Вырезает подтёки со скриншота: обрезает интерфейс, делает внешний белый фон
 * прозрачным (заливкой от краёв, чтобы светлые блики внутри массы остались).
 *
 * Запуск: node avito/tools/cutout-drip.mjs <исходник.jpg> <результат.png>
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [src, out] = process.argv.slice(2);
if (!src || !out) { console.error('usage: cutout-drip.mjs <src> <out>'); process.exit(1); }

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + path.resolve(src));

const dataUrl = await page.evaluate(async () => {
  const img = document.querySelector('img');
  await img.decode();
  const W = img.naturalWidth, H = img.naturalHeight;

  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const src = ctx.getImageData(0, 0, W, H);
  const d = src.data;

  // именно жёлтый (тёплый) пиксель, а не элементы интерфейса
  const isYellow = (i) => {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    return r > 175 && g > 145 && b < g - 25 && r >= g;
  };

  // границы массы: строки, где жёлтого заметно много
  let top = H, bottom = 0;
  const step = 2, perRow = Math.ceil(W / step);
  for (let y = 0; y < H; y++) {
    let count = 0;
    for (let x = 0; x < W; x += step) if (isYellow((y * W + x) * 4)) count++;
    if (count / perRow > 0.08) { if (y < top) top = y; bottom = y; }
  }
  top = Math.max(0, top - 6);
  bottom = Math.min(H - 1, bottom + 10);
  const ch = bottom - top + 1;

  // перенос нужной полосы на новый холст
  const c2 = document.createElement('canvas');
  c2.width = W; c2.height = ch;
  const x2 = c2.getContext('2d', { willReadFrequently: true });
  x2.drawImage(c, 0, top, W, ch, 0, 0, W, ch);
  const im = x2.getImageData(0, 0, W, ch);
  const p = im.data;

  // заливка от краёв по «почти белым» пикселям → прозрачность
  const isBg = (i) => {
    const r = p[i], g = p[i + 1], b = p[i + 2];
    return r > 224 && g > 222 && b > 214 && Math.max(r, g, b) - Math.min(r, g, b) < 22;
  };
  const seen = new Uint8Array(W * ch);
  const stack = [];
  for (let x = 0; x < W; x++) { stack.push(x); stack.push((ch - 1) * W + x); }
  for (let y = 0; y < ch; y++) { stack.push(y * W); stack.push(y * W + W - 1); }

  while (stack.length) {
    const n = stack.pop();
    if (seen[n]) continue;
    const i = n * 4;
    if (!isBg(i)) continue;
    seen[n] = 1;
    p[i + 3] = 0;
    const x = n % W, y = (n - x) / W;
    if (x > 0) stack.push(n - 1);
    if (x < W - 1) stack.push(n + 1);
    if (y > 0) stack.push(n - W);
    if (y < ch - 1) stack.push(n + W);
  }

  // край: снимаем светлый ореол от джипега — два прохода эрозии
  const alphaAt = (n) => p[n * 4 + 3];
  for (let pass = 0; pass < 2; pass++) {
    const kill = [];
    for (let y = 1; y < ch - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const n = y * W + x;
        if (alphaAt(n) === 0) continue;
        if (alphaAt(n - 1) && alphaAt(n + 1) && alphaAt(n - W) && alphaAt(n + W)) continue;
        kill.push(n);
      }
    }
    for (const n of kill) p[n * 4 + 3] = 0;
  }

  // мягкая полупрозрачность по новому краю
  for (let y = 1; y < ch - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const n = y * W + x;
      if (alphaAt(n) === 0) continue;
      if (alphaAt(n - 1) && alphaAt(n + 1) && alphaAt(n - W) && alphaAt(n + W)) continue;
      p[n * 4 + 3] = 150;
    }
  }

  x2.putImageData(im, 0, 0);
  return { url: c2.toDataURL('image/png'), W, H: ch, top, bottom };
});

fs.writeFileSync(out, Buffer.from(dataUrl.url.split(',')[1], 'base64'));
console.log(`вырезано: ${dataUrl.W}×${dataUrl.H} (строки ${dataUrl.top}–${dataUrl.bottom}) → ${out}`);
await browser.close();
