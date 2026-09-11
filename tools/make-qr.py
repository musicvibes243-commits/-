#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""QR-коды для сайта студии «Аникор».

    python3 tools/make-qr.py "https://anikor-yoga.ru" light

Кладёт в qr/: SVG (вектор, для печати) и PNG (для мессенджеров),
плюс карточку-визитку со сканируемым кодом.
"""
import sys, os, subprocess, segno

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QR = os.path.join(ROOT, 'qr')

THEMES = {
    'light': {'dark': '#35513F', 'light': '#F7F4EE', 'ink': '#1C271F',
              'accent': '#8F6229', 'font': 'Georgia, serif'},
    'dark':  {'dark': '#0A0A0A', 'light': '#EDE8DF', 'ink': '#0A0A0A',
              'accent': '#5A554C', 'font': '"Playfair Display", Georgia, serif'},
}

def build(url, theme='light', name='anikor', caption='студия йоги · Дзержинского, 4А'):
    t = THEMES[theme]
    os.makedirs(QR, exist_ok=True)
    qr = segno.make(url, error='h')          # error='h' — код читается даже частично закрытым
    svg_path = os.path.join(QR, f'{name}-{theme}.svg')
    png_path = os.path.join(QR, f'{name}-{theme}.png')
    qr.save(svg_path, scale=10, border=3, dark=t['dark'], light=t['light'])
    qr.save(png_path, scale=14, border=3, dark=t['dark'], light=t['light'])

    # в карточку кладём тот самый PNG, который проверен на считывание,
    # а не повторный рендер: так картинка в карточке гарантированно рабочая
    import base64
    with open(png_path, 'rb') as fh:
        inline = ('<img alt="QR-код на сайт студии" src="data:image/png;base64,'
                  + base64.b64encode(fh.read()).decode() + '">')
    card = os.path.join(QR, f'{name}-{theme}-card.html')
    with open(card, 'w') as f:
        f.write(f'''<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&family=Raleway:wght@400;600&display=swap">
<style>
  * {{ box-sizing: border-box; margin: 0; }}
  body {{ width: 720px; height: 1010px; display: grid; place-items: center;
         background: {t['light']}; color: {t['ink']}; font-family: Raleway, sans-serif; }}
  .card {{ display: grid; justify-items: center; gap: 30px; text-align: center; padding: 60px; }}
  .name {{ font-family: {t['font']}; font-size: 62px; letter-spacing: .16em; text-transform: uppercase; }}
  .sub {{ font-size: 15px; letter-spacing: .24em; text-transform: uppercase; color: {t['accent']}; }}
  .qr {{ padding: 14px; background: {t['light']}; border: 1px solid {t['accent']}33; }}
  .qr img {{ display: block; width: 380px; height: 380px; image-rendering: pixelated; }}
  .hint {{ font-size: 17px; letter-spacing: .04em; }}
  .tel {{ font-family: {t['font']}; font-size: 30px; letter-spacing: .04em; }}
</style></head><body>
<div class="card">
  <div>
    <p class="name">Аникор</p>
    <p class="sub" style="margin-top:10px">{caption}</p>
  </div>
  <div class="qr">{inline}</div>
  <div>
    <p class="hint">Наведите камеру телефона,<br>чтобы открыть сайт студии</p>
    <p class="tel" style="margin-top:18px">+7 916 030-44-36</p>
  </div>
</div></body></html>''')
    print('готово:', svg_path, png_path, card, sep='\n  ')
    return card

if __name__ == '__main__':
    url = sys.argv[1] if len(sys.argv) > 1 else 'https://example.com'
    theme = sys.argv[2] if len(sys.argv) > 2 else 'light'
    build(url, theme)
