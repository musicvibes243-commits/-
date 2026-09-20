#!/usr/bin/env python3
"""Третья карусель — дренаж вокруг готового дома.

Новая тема, а не повтор: тут готовый дом, траншея в геотекстиле, смотровой
колодец и — главное — нивелир со штативом и рейка прямо в кадре. Инструмент
в кадре и есть отличие от всех, кто бьёт уклон на глаз, поэтому он и вынесен
в заголовок.

Все кадры портретные, так что 4:5 берётся честным кропом без подложек.
"""
import os, subprocess, sys

SP = "/tmp/claude-0/-home-user--/ab22f088-85f6-5f8b-9269-f223a8756ed3/scratchpad"
UP = "/root/.claude/uploads/ab22f088-85f6-5f8b-9269-f223a8756ed3"
OUT = os.path.join(SP, "out", "carousel3")
TXT = os.path.join(SP, "txt")
os.makedirs(OUT, exist_ok=True)

FONT = "/usr/share/fonts/truetype/montserrat/Montserrat-ExtraBold.ttf"
FONT_B = "/usr/share/fonts/truetype/montserrat/Montserrat-Bold.ttf"
GREEN = "0x2BD97A"
GRADE = ("eq=contrast=1.11:saturation=1.16:gamma=1.02,"
         "colorbalance=rs=0.02:bs=-0.02,"
         "unsharp=5:5:0.7:5:5:0.0")

# (файл, crop_y, подпись)
SLIDES = [
    ("616f1d41-image.jpg", 140, None),                            # обложка: нивелир и рейка
    ("6ba12b69-image.jpg", 120, "Дно траншеи — по отметке"),
    ("f5300b36-image.jpg",   0, "Стенки выстилаем геотекстилем"),
    ("5519b1b4-image.jpg",  80, "Дренаж и кабель — раздельно"),
    ("fd2a941b-image.jpg", 100, "Щебень и колодец по уровню"),
    ("6531cb79-image.jpg",  80, "Труба идёт в фильтре"),
    ("70f54a13-image.jpg", 100, "Водосток заводим в трубу"),
    ("9b040b0b-image.jpg",  80, "Смотровой колодец"),
    ("ae5917e6-image.jpg", 120, "Рядом — станция очистки"),
]
N = len(SLIDES)


def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAIL:", cmd, file=sys.stderr)
        print(r.stderr[-2000:], file=sys.stderr)
        sys.exit(1)


def dt(idx, s, size, y, color="white", box=None, x="(w-tw)/2", font=FONT,
       pad=20):
    p = os.path.join(TXT, f"c3_{idx}.txt")
    with open(p, "w") as f:
        f.write(s)
    parts = [f"fontfile={font}", f"textfile={p}", f"fontsize={size}",
             f"fontcolor={color}", f"x={x}", f"y={y}", "line_spacing=10"]
    if box:
        parts += ["box=1", f"boxcolor={box}", f"boxborderw={pad}"]
    else:
        parts += ["borderw=5", "bordercolor=black@0.85",
                  "shadowcolor=black@0.5", "shadowx=3", "shadowy=4"]
    return "drawtext=" + ":".join(parts)


for i, (fname, crop_y, label) in enumerate(SLIDES, start=1):
    f = [f"crop=1932:2415:0:{crop_y}", "scale=1080:1350:flags=lanczos", GRADE]

    if i == 1:
        f += [
            "drawbox=x=0:y=1020:w=1080:h=250:color=black@0.55:t=fill",
            dt(10, "ДРЕНАЖ ВОКРУГ ДОМА", 70, 1048),
            dt(11, "уклон бьём нивелиром, а не на глаз", 36, 1140,
               color=GREEN),
            dt(12, "листай →", 34, 1196, font=FONT_B),
        ]
    if label:
        # Montserrat ExtraBold: ширина знака ≈ 0.56 кегля. Ужимаем, пока
        # подпись не влезет между левым отступом и правым краем.
        size = 46
        while 56 + 2 * 20 + len(label) * size * 0.56 > 1080 - 24 and size > 32:
            size -= 2
        if size != 46:
            print(f"   подпись длинная, кегль {46} -> {size}")
        f.append(dt(20 + i, label, size, 1130, x="56", box="black@0.62"))
    f.append(dt(30 + i, f"{i}/{N}", 34, 60, x="w-tw-56",
               box="black@0.55", pad=16, font=FONT_B))

    out = os.path.join(OUT, f"slide_{i}.jpg")
    run(f'ffmpeg -v error -y -i "{os.path.join(UP, fname)}" '
        f'-vf "{",".join(f)}" -q:v 2 "{out}"')
    print(f"slide {i}: {os.path.getsize(out)/1024:.0f} KB  {label or 'обложка'}")
