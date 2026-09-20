#!/usr/bin/env python3
"""Instagram carousel from the foundation photos.

4:5 (1080x1350) is the tallest ratio the feed allows, so it takes the most
screen and beats 1:1 on stop rate. Source is 3:4, so each frame loses 161px
of height — cropped from whichever edge holds the least subject.
"""
import os, subprocess, sys

SP = "/tmp/claude-0/-home-user--/ab22f088-85f6-5f8b-9269-f223a8756ed3/scratchpad"
UP = "/root/.claude/uploads/ab22f088-85f6-5f8b-9269-f223a8756ed3"
OUT = os.path.join(SP, "out", "carousel")
TXT = os.path.join(SP, "txt")
os.makedirs(OUT, exist_ok=True)
os.makedirs(TXT, exist_ok=True)

FONT = "/usr/share/fonts/truetype/montserrat/Montserrat-ExtraBold.ttf"
FONT_B = "/usr/share/fonts/truetype/montserrat/Montserrat-Bold.ttf"
GREEN = "0x2BD97A"

# (file, crop_y, step label)  — crop_y trims 161px of the 2576 height
SLIDES = [
    ("85656406-image.jpg", 161, None),                      # общий план
    ("e6adae4a-image.jpg", 100, "Геотекстиль по грунту"),   # раскатка полотна
    ("1d5454b4-image.jpg",   0, "Песчаная подушка"),        # засыпка песка
    ("b347c4a0-image.jpg",  80, "Вводы коммуникаций"),      # трубы под фундаментом
]

GRADE = ("eq=contrast=1.11:saturation=1.16:gamma=1.02,"
         "colorbalance=rs=0.02:bs=-0.02,"
         "unsharp=5:5:0.7:5:5:0.0")


def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAIL:", cmd, file=sys.stderr)
        print(r.stderr[-2000:], file=sys.stderr)
        sys.exit(1)


def txt(idx, s):
    p = os.path.join(TXT, f"car_{idx}.txt")
    with open(p, "w") as f:
        f.write(s)
    return p


def dt(idx, s, size, y, color="white", box=None, x="(w-tw)/2", font=FONT,
       pad=20):
    parts = [f"fontfile={font}", f"textfile={txt(idx, s)}", f"fontsize={size}",
             f"fontcolor={color}", f"x={x}", f"y={y}", "line_spacing=10"]
    if box:
        parts += ["box=1", f"boxcolor={box}", f"boxborderw={pad}"]
    else:
        parts += ["borderw=5", "bordercolor=black@0.85",
                  "shadowcolor=black@0.5", "shadowx=3", "shadowy=4"]
    return "drawtext=" + ":".join(parts)


n = len(SLIDES)
for i, (fname, crop_y, label) in enumerate(SLIDES):
    filters = [f"crop=1932:2415:0:{crop_y}", "scale=1080:1350:flags=lanczos",
               GRADE]

    if i == 0:
        # обложка: тёмная подложка под заголовок, иначе текст тонет в небе
        filters += [
            "drawbox=x=0:y=300:w=1080:h=330:color=black@0.48:t=fill",
            dt(100, "ЧТО ПОД ПОЛОМ", 92, 340),
            dt(101, "подготовка основания, по шагам", 40, 470, color=GREEN),
            dt(102, "листай →", 38, 552, font=FONT_B),
        ]
    if label:
        filters.append(dt(110 + i, label, 46, 1130, x="56",
                          box="black@0.62", pad=20))

    # счётчик слайдов — поднимает долистываемость
    filters.append(dt(120 + i, f"{i+1}/{n}", 34, 60, x="w-tw-56",
                      box="black@0.55", pad=16, font=FONT_B))

    out = os.path.join(OUT, f"slide_{i+1}.jpg")
    run(f'ffmpeg -v error -y -i "{os.path.join(UP, fname)}" '
        f'-vf "{",".join(filters)}" -q:v 2 "{out}"')
    print(f"slide {i+1}: {os.path.getsize(out)/1024:.0f} KB  {label or 'обложка'}")
