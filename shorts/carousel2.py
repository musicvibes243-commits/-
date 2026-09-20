#!/usr/bin/env python3
"""Вторая карусель — разводка коммуникаций по фундаменту.

Три кадра из четырёх горизонтальные, и сюжет в них — длинная нитка трубы
вдоль стены. Кроп в 4:5 отрезал бы ровно это, поэтому кадр вписывается
целиком, а поля добиваются размытой затемнённой копией его же.
"""
import os, subprocess, sys

SP = "/tmp/claude-0/-home-user--/ab22f088-85f6-5f8b-9269-f223a8756ed3/scratchpad"
UP = "/root/.claude/uploads/ab22f088-85f6-5f8b-9269-f223a8756ed3"
OUT = os.path.join(SP, "out", "carousel2")
TXT = os.path.join(SP, "txt")
os.makedirs(OUT, exist_ok=True)

FONT = "/usr/share/fonts/truetype/montserrat/Montserrat-ExtraBold.ttf"
FONT_B = "/usr/share/fonts/truetype/montserrat/Montserrat-Bold.ttf"
GREEN = "0x2BD97A"

W, H = 1080, 1350
GRADE = ("eq=contrast=1.10:saturation=1.14:gamma=1.02,"
         "unsharp=5:5:0.7:5:5:0.0")

# (файл, ландшафтный?, crop_y для портрета, подпись)
SLIDES = [
    ("279570f4-image.jpg", True,  0, None),
    ("86cfda5a-image.jpg", True,  0, "Канализация и отводы по периметру"),
    ("aa229446-image.jpg", True,  0, "Выводы заглушены до бетона"),
    ("0b339a6d-image.jpg", False, 60, "Ввод воды с улицы"),
]
N = len(SLIDES)


def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAIL:", cmd, file=sys.stderr)
        print(r.stderr[-2000:], file=sys.stderr)
        sys.exit(1)


def txt(idx, s):
    p = os.path.join(TXT, f"c2_{idx}.txt")
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


for i, (fname, landscape, crop_y, label) in enumerate(SLIDES, start=1):
    src = os.path.join(UP, fname)

    if landscape:
        # кадр целиком по ширине, поля — размытая затемнённая копия
        base = (f"[0:v]scale={W}:-1,{GRADE}[fg];"
                f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,"
                f"crop={W}:{H},gblur=sigma=40,eq=brightness=-0.16[bg];"
                f"[bg][fg]overlay=(W-w)/2:(H-h)/2[v]")
    else:
        base = (f"[0:v]crop=1932:2415:0:{crop_y},scale={W}:{H}:flags=lanczos,"
                f"{GRADE}[v]")

    over = []
    if i == 1:
        over += [
            f"drawbox=x=0:y={H-330}:w={W}:h=250:color=black@0.55:t=fill",
            dt(10, "КОММУНИКАЦИИ ДО БЕТОНА", 62, H - 302),
            dt(11, "канализация и вода по фундаменту", 38, H - 218,
               color=GREEN),
            dt(12, "листай →", 36, H - 158, font=FONT_B),
        ]
    if label:
        over.append(dt(20 + i, label, 44, H - 220, x="56",
                       box="black@0.62", pad=20))
    over.append(dt(30 + i, f"{i}/{N}", 34, 60, x="w-tw-56",
                   box="black@0.55", pad=16, font=FONT_B))

    fc = base + (";[v]" + ",".join(over) + "[out]" if over else "")
    out = os.path.join(OUT, f"slide_{i}.jpg")
    run(f'ffmpeg -v error -y -i "{src}" -filter_complex "{fc}" '
        f'-map "[out]" -q:v 2 "{out}"')
    print(f"slide {i}: {os.path.getsize(out)/1024:.0f} KB  "
          f"{label or 'обложка'}{'  [горизонт]' if landscape else ''}")
