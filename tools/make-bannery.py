#!/usr/bin/env python3
"""Собирает рекламные карточки из фотографий с объектов.

Зачем. Владелица прислала образцы «оформления» для Яндекс Карт и баннеров
для Директа: фотография, поверх неё крупная надпись, внизу телефон.
Такие картинки нужны везде, где объявление показывают не текстом,
а плиткой: Авито, Яндекс Бизнес, истории.

Почему не рисуем картинки, а берём свои. На образцах стоковые руки
и чужие ремонты. У нас есть три десятка снимков со своих объектов —
они и убеждают. Выдуманная картинка в стройке видна сразу и работает
против: человек ищет тех, кто копал, а не тех, кто нарисовал.

Как устроено. Каждая карточка — это кусок HTML, который открывается
в браузере и снимается в PNG. Шрифты и цвета берутся те же, что
на сайте, чтобы объявление и сайт выглядели одной конторой.

Все надписи — только то, что уже написано на сайте. Ничего нового
здесь не придумывается: цена дренажа, бесплатный выезд, уклон
нивелиром — всё это есть на страницах и проверено.

Запуск:  python3 tools/make-bannery.py [папка-куда-класть]
"""

import json
import pathlib
import subprocess
import sys
import tempfile

KORNI = pathlib.Path(__file__).resolve().parent.parent
FOTO = KORNI / "docs/assets/photos"
SHRIFTY = KORNI / "docs/assets/fonts"

CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
TELEFON = "+7 (915) 346-97-28"
SAYT = "stroyinvest-mo.ru"

# Цвета сайта, docs/assets/tokens.css
AKCENT = "#F0A62E"
INK = "#FCF7F1"
TEMNYY = "#1E1815"

# (файл, надзаголовок, заголовок, подпись внизу)
KARTOCHKI = [
    # Вертикальный кадр с установленным корпусом: в срез 9:16 попадает
    # целиком и сразу читается «септик». У montazh-01 в вертикали
    # остаётся тёмная середина ямы, на плитке не понять, что это.
    ("septik-optima-01.jpg", "Септики",
     "СЕПТИК<br>ПОД КЛЮЧ", "Выезд, замер и подбор оборудования — бесплатно"),
    ("drenazh-geotekstil-01.jpg", "Дренаж участка",
     "2 680 ₽<br><small>за погонный метр</small>",
     "В цену входит выезд, доставка и работа. От вас — песок и щебень"),
    ("opalubka-yama-01.jpg", "Сложные участки",
     "ВЫСОКИЕ<br>ГРУНТОВЫЕ<br>ВОДЫ", "Крепим стенки, откачиваем воду, якорим корпус"),
    ("shchit-schneider-01.jpg", "Электрика",
     "ЩИТ<br>И РАЗВОДКА<br>ПО ДОМУ", "Автоматы, УЗО, кабель по дому и участку"),
    ("transhea-01.jpg", "Как делаем",
     "УКЛОН<br>БЬЁМ<br>НИВЕЛИРОМ", "Два миллиметра на метр: на глаз такое не выставить"),
    ("uchastok-rabota-01.jpg", "Своя бригада",
     "РАБОТАЕМ<br>КРУГЛЫЙ ГОД", "Москва и Московская область. Опыт мастеров 10+ лет"),
]

# Форматы: имя папки → (ширина, высота)
FORMATY = {
    "istorii-9x16": (1080, 1920),
    "kvadrat-1x1": (1080, 1080),
    "avito-4x3": (1200, 900),
}


def shrift(imya):
    return (SHRIFTY / imya).as_uri()


def stranica(foto, nad, zagolovok, podpis, w, h):
    """Одна карточка целиком: фон-фотография, затемнение, текст."""
    vysokaya = h / w > 1.1
    razmer_zag = int(w * (0.115 if vysokaya else 0.085))
    return f"""<!doctype html><html lang="ru"><head><meta charset="utf-8"><style>
@font-face{{font-family:Golos;src:url("{shrift('golos-text-cyrillic.woff2')}") format("woff2");font-weight:400 800}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:{w}px;height:{h}px;overflow:hidden;font-family:Golos,sans-serif;background:{TEMNYY}}}
.k{{position:relative;width:100%;height:100%}}
.k img{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}}
/* Затемнение снизу: текст должен читаться на любом кадре, а кадры
   у нас разные — от светлого песка до тёмной ямы. */
.k::after{{content:"";position:absolute;inset:0;background:
  linear-gradient(180deg,rgba(30,24,21,.72) 0%,rgba(30,24,21,.30) 32%,
                  rgba(30,24,21,.74) 64%,rgba(30,24,21,.96) 100%)}}
.t{{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;
   justify-content:space-between;padding:{int(w*0.075)}px}}
.shapka{{display:flex;align-items:center;justify-content:space-between;gap:16px}}
.logo{{font-weight:800;font-size:{int(w*0.042)}px;color:{INK};letter-spacing:.01em}}
.logo i{{font-style:normal;color:{AKCENT}}}
.nad{{display:inline-block;align-self:flex-start;background:{AKCENT};color:#2A1B02;
   font-weight:700;font-size:{int(w*0.030)}px;letter-spacing:.10em;text-transform:uppercase;
   padding:{int(w*0.016)}px {int(w*0.030)}px;border-radius:999px}}
.niz{{display:flex;flex-direction:column;gap:{int(w*0.030)}px}}
h1{{font-size:{razmer_zag}px;line-height:1.02;color:{INK};font-weight:800;
   letter-spacing:-.01em;text-shadow:0 2px 24px rgba(0,0,0,.55)}}
h1 small{{display:block;font-size:{int(razmer_zag*0.34)}px;font-weight:600;
   letter-spacing:.02em;color:{AKCENT};margin-top:{int(w*0.012)}px}}
p{{font-size:{int(w*0.034)}px;line-height:1.35;color:#E6DACF;max-width:{int(w*0.90)}px}}
.tel{{display:flex;flex-wrap:wrap;align-items:baseline;gap:{int(w*0.028)}px;
   border-top:2px solid rgba(255,255,255,.22);padding-top:{int(w*0.030)}px}}
.tel b{{font-size:{int(w*0.052)}px;color:{INK};font-weight:800;white-space:nowrap}}
.tel span{{font-size:{int(w*0.030)}px;color:{AKCENT}}}
</style></head><body><div class="k">
<img src="{(FOTO / foto).as_uri()}" alt="">
<div class="t">
  <div class="shapka"><div class="logo">Строй<i>Инвест</i></div></div>
  <div class="niz">
    <span class="nad">{nad}</span>
    <h1>{zagolovok}</h1>
    <p>{podpis}</p>
    <div class="tel"><b>{TELEFON}</b><span>{SAYT}</span></div>
  </div>
</div></div></body></html>"""


def main():
    kuda = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "bannery").resolve()
    vsego = 0
    with tempfile.TemporaryDirectory() as vremenno:
        vr = pathlib.Path(vremenno)
        for papka, (w, h) in FORMATY.items():
            (kuda / papka).mkdir(parents=True, exist_ok=True)
            for n, (foto, nad, zag, pod) in enumerate(KARTOCHKI, 1):
                html = vr / f"{papka}-{n}.html"
                html.write_text(stranica(foto, nad, zag, pod, w, h), encoding="utf-8")
                out = kuda / papka / f"{n:02d}-{pathlib.Path(foto).stem}.png"
                subprocess.run([
                    CHROME, "--headless", "--no-sandbox", "--disable-gpu",
                    "--hide-scrollbars", "--force-device-scale-factor=1",
                    f"--window-size={w},{h}", "--virtual-time-budget=4000",
                    f"--screenshot={out}", html.as_uri(),
                ], check=True, capture_output=True)
                vsego += 1
    print(f"собрано карточек: {vsego}")
    print(f"лежат в {kuda}")
    print(json.dumps({p: len(KARTOCHKI) for p in FORMATY}, ensure_ascii=False))


if __name__ == "__main__":
    main()
