#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Собирает страницы сайта в самодостаточные HTML-файлы.

    python3 tools/build-standalone.py [папка-назначения]

В каждый файл вшиваются фотографии (base64) и шрифты (woff2 с npm), поэтому
страница открывается двойным щелчком и выглядит одинаково без интернета.
Такой файл можно отправить в мессенджере — ничего не подгружается снаружи.
"""
import base64, os, re, subprocess, sys, tarfile, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, '.fonts-cache')

# начертания, которые реально используются в стилях
FONT_SETS = {
    'light': [('Lora', 'lora', [('400', 'normal'), ('500', 'normal'), ('600', 'normal')]),
              ('Raleway', 'raleway', [(w, 'normal') for w in ('300', '400', '500', '600', '700')]),
              ('Cormorant Garamond', 'cormorant-garamond', [('600', 'normal')])],
    'dark':  [('Playfair Display', 'playfair-display', [('400', 'normal'), ('500', 'normal'), ('400', 'italic')]),
              ('IBM Plex Mono', 'ibm-plex-mono', [(w, 'normal') for w in ('300', '400', '500')])],
}
RANGES = {
    'latin': 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,'
             'U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
    'cyrillic': 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
}

def fetch_fonts():
    """Скачивает пакеты шрифтов с npm один раз и распаковывает в .fonts-cache."""
    files = os.path.join(CACHE, 'package', 'files')
    if os.path.isdir(files):
        return files
    os.makedirs(CACHE, exist_ok=True)
    for slug in {s for fams in FONT_SETS.values() for _, s, _ in fams}:
        subprocess.run(['npm', 'pack', f'@fontsource/{slug}', '--silent'], cwd=CACHE, check=True)
    for tgz in glob.glob(os.path.join(CACHE, '*.tgz')):
        with tarfile.open(tgz) as t:
            t.extractall(CACHE, filter='data')
    return files

def font_css(kind):
    files = fetch_fonts()
    out = []
    for family, slug, variants in FONT_SETS[kind]:
        for weight, style in variants:
            for subset, rng in RANGES.items():
                path = os.path.join(files, f'{slug}-{subset}-{weight}-{style}.woff2')
                if not os.path.exists(path):
                    continue
                uri = 'data:font/woff2;base64,' + base64.b64encode(open(path, 'rb').read()).decode()
                out.append(f"@font-face{{font-family:'{family}';font-style:{style};font-weight:{weight};"
                           f"font-display:swap;src:url({uri}) format('woff2');unicode-range:{rng};}}")
    return '\n'.join(out)

def build(src, css_rel, js_rel, kind, out_path, drop_lang=False):
    html = open(os.path.join(ROOT, src)).read()
    css = open(os.path.join(ROOT, css_rel)).read()
    js = open(os.path.join(ROOT, js_rel)).read()
    body = html[html.index('<body>') + 6: html.index('</body>')]
    body = re.sub(r'<script src="[^"]*\.js" defer></script>', '', body)
    if drop_lang:   # в одиночном файле переключателю языка некуда вести
        body = re.sub(r'<div class="lang">.*?</div>\s*', '', body, flags=re.S)
    for name in sorted(set(re.findall(r'(?:\.\./)?assets/img/([\w\-.]+)', body))):
        uri = 'data:image/jpeg;base64,' + base64.b64encode(
            open(os.path.join(ROOT, 'assets/img', name), 'rb').read()).decode()
        body = body.replace('../assets/img/' + name, uri).replace('assets/img/' + name, uri)
    head = re.search(r'<head>(.*?)</head>', html, re.S).group(1)
    head = re.sub(r'<link[^>]*fonts\.(googleapis|gstatic)[^>]*>', '', head)
    head = re.sub(r'<link rel="stylesheet" href="(?!https)[^"]*">', '', head)
    head = re.sub(r'<link rel="alternate"[^>]*>', '', head)
    lang = re.search(r'<html lang="(\w+)"', html).group(1)
    open(out_path, 'w').write(
        f'<!DOCTYPE html>\n<html lang="{lang}">\n<head>{head}\n'
        f'<style>\n{font_css(kind)}\n</style>\n<style>\n{css}\n</style>\n</head>\n'
        f'<body>{body}\n<script>\n{js}\n</script>\n</body>\n</html>\n')
    print(f'{os.path.basename(out_path)}: {os.path.getsize(out_path) / 1024 / 1024:.2f} МБ')

if __name__ == '__main__':
    dest = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'dist')
    os.makedirs(dest, exist_ok=True)
    build('index.html', 'assets/css/styles.css', 'assets/js/main.js', 'light',
          os.path.join(dest, 'anikor-demo-svetlaya.html'), drop_lang=True)
    build('editorial/index.html', 'editorial/styles.css', 'editorial/main.js', 'dark',
          os.path.join(dest, 'anikor-demo-temnaya.html'))
    build('en/index.html', 'assets/css/styles.css', 'assets/js/main.js', 'light',
          os.path.join(dest, 'anikor-demo-english.html'), drop_lang=True)
