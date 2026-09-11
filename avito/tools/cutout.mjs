/**
 * Убирает светлый фон с фотографии: заливка от краёв (блики внутри объекта
 * сохраняются), снятие ореола и обрезка по границам объекта.
 *
 * node avito/tools/cutout.mjs <src> <out> [порог,по,каналам] [макс.насыщенность]
 * Пример: node avito/tools/cutout.mjs cat-src.jpg cat.png 243,243,238 12
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [src, out, bgArg = '226,224,216', satArg = '20', trimArg = ''] = process.argv.slice(2);
if (!src || !out) { console.error('usage: cutout.mjs <src> <out> [r,g,b] [sat] [trim]'); process.exit(1); }
const bg = bgArg.split(',').map(Number);
const maxSat = Number(satArg);
const trimDetached = trimArg === 'trim'; // отсечь всё ниже первого разрыва (тень)

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + path.resolve(src));

const res = await page.evaluate(async ({ bg, maxSat, trimDetached }) => {
  const img = document.querySelector('img');
  await img.decode();
  const W = img.naturalWidth, H = img.naturalHeight;

  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const im = ctx.getImageData(0, 0, W, H);
  const p = im.data;

  const isBg = (i) => {
    const r = p[i], g = p[i + 1], b = p[i + 2];
    return r > bg[0] && g > bg[1] && b > bg[2] &&
           Math.max(r, g, b) - Math.min(r, g, b) < maxSat;
  };

  // заливка светлого фона от краёв
  const stack = [];
  for (let x = 0; x < W; x++) { stack.push(x); stack.push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { stack.push(y * W); stack.push(y * W + W - 1); }
  const seen = new Uint8Array(W * H);
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
    if (y < H - 1) stack.push(n + W);
  }

  // снятие светлого ореола по контуру
  const a = (n) => p[n * 4 + 3];
  for (let pass = 0; pass < 2; pass++) {
    const kill = [];
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const n = y * W + x;
        if (!a(n)) continue;
        if (a(n - 1) && a(n + 1) && a(n - W) && a(n + W)) continue;
        kill.push(n);
      }
    }
    for (const n of kill) p[n * 4 + 3] = 0;
  }
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const n = y * W + x;
      if (!a(n)) continue;
      if (a(n - 1) && a(n + 1) && a(n - W) && a(n + W)) continue;
      p[n * 4 + 3] = 150;
    }
  }

  // отсечение оторванных кусков снизу (например, тени под объектом)
  const rowHas = [];
  for (let y = 0; y < H; y++) {
    let has = false;
    for (let x = 0; x < W; x++) if (p[(y * W + x) * 4 + 3]) { has = true; break; }
    rowHas.push(has);
  }
  const first = rowHas.indexOf(true);
  if (trimDetached && first !== -1) {
    let end = first;
    while (end < H && rowHas[end]) end++;
    for (let y = end; y < H; y++) {
      for (let x = 0; x < W; x++) p[(y * W + x) * 4 + 3] = 0;
    }
  }

  // обрезка по границам непрозрачного
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!p[(y * W + x) * 4 + 3]) continue;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  ctx.putImageData(im, 0, 0);

  const cw = x1 - x0 + 1, chh = y1 - y0 + 1;
  const c2 = document.createElement('canvas');
  c2.width = cw; c2.height = chh;
  c2.getContext('2d').drawImage(c, x0, y0, cw, chh, 0, 0, cw, chh);
  return { url: c2.toDataURL('image/png'), cw, chh, W, H };
}, { bg, maxSat, trimDetached });

fs.writeFileSync(out, Buffer.from(res.url.split(',')[1], 'base64'));
console.log(`${path.basename(src)}: ${res.W}×${res.H} → ${res.cw}×${res.chh}  ${out}`);
await browser.close();
