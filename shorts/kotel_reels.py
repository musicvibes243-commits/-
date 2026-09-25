#!/usr/bin/env python3
"""Котельная — версия слайдов под рилс-слайдшоу (9:16).

Слайды 4:5 сделаны для ленты. Если те же файлы скормить «Синхронизации под
ритм», Instagram режет бока под 9:16 и съедает края текста.

Здесь кадр сразу 1080x1920, а текст держится в 70% ширины — запас на случай,
если приложение подрежет ещё.
"""
import os, subprocess, sys

SP = "/tmp/claude-0/-home-user--/ab22f088-85f6-5f8b-9269-f223a8756ed3/scratchpad"
UP = "/root/.claude/uploads/ab22f088-85f6-5f8b-9269-f223a8756ed3"
OUT = os.path.join(SP, "out", "kotel_reels")
TXT = os.path.join(SP, "txt")
os.makedirs(OUT, exist_ok=True)

FONT = "/usr/share/fonts/truetype/montserrat/Montserrat-ExtraBold.ttf"
FONT_B = "/usr/share/fonts/truetype/montserrat/Montserrat-Bold.ttf"
GREEN = "0x2BD97A"
GRADE = ("eq=contrast=1.10:saturation=1.10:gamma=1.24:brightness=0.04,"
         "colorbalance=rs=-0.03:bs=0.04,"
         "unsharp=5:5:0.7:5:5:0.0")

# 1932x2576 -> 9:16 это 1449x2576; crop_x выбран так, чтобы оборудование
# осталось в кадре, а не ушло за левый край
SLIDES = [
    ("47b04422-image.jpg", 150, None),
    ("fb1124b6-image.jpg", 241, "Электрокотёл и шкафы"),
    ("3c1408d1-image.jpg", 300, "Бойлер и гидроаккумулятор"),
]
N = len(SLIDES)
SAFE = int(1080 * 0.70)   # запас: приложение может подрезать ещё


def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAIL:", cmd, file=sys.stderr)
        print(r.stderr[-2000:], file=sys.stderr)
        sys.exit(1)


def dt(idx, s, size, y, color="white", box=None, font=FONT, pad=20):
    while len(s) * size * 0.56 + 2 * pad > SAFE and size > 28:
        size -= 2
    p = os.path.join(TXT, f"kr_{idx}.txt")
    with open(p, "w") as f:
        f.write(s)
    parts = [f"fontfile={font}", f"textfile={p}", f"fontsize={size}",
             f"fontcolor={color}", "x=(w-tw)/2", f"y={y}", "line_spacing=10"]
    if box:
        parts += ["box=1", f"boxcolor={box}", f"boxborderw={pad}"]
    else:
        parts += ["borderw=5", "bordercolor=black@0.85",
                  "shadowcolor=black@0.5", "shadowx=3", "shadowy=4"]
    return "drawtext=" + ":".join(parts)


for i, (fname, crop_x, label) in enumerate(SLIDES, start=1):
    f = [f"crop=1449:2576:{crop_x}:0", "scale=1080:1920:flags=lanczos", GRADE]
    if i == 1:
        f += [
            "drawbox=x=0:y=1140:w=1080:h=250:color=black@0.55:t=fill",
            dt(10, "КОТЕЛЬНАЯ", 88, 1168),
            dt(11, "под ключ", 52, 1272, color=GREEN),
            dt(12, "листай →", 34, 1340, font=FONT_B),
        ]
    if label:
        f.append(dt(20 + i, label, 48, 1250, box="black@0.62"))
    f.append(dt(30 + i, f"{i}/{N}", 34, 90, box="black@0.55", pad=16,
               font=FONT_B))
    out = os.path.join(OUT, f"reels_slide_{i}.jpg")
    run(f'ffmpeg -v error -y -i "{os.path.join(UP, fname)}" '
        f'-vf "{",".join(f)}" -q:v 2 "{out}"')
    print(f"слайд {i}/{N}: {os.path.getsize(out)/1024:.0f} KB  "
          f"{label or 'обложка'}")
