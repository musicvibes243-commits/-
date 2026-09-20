#!/usr/bin/env python3
"""Instagram carousel from the foundation photos — one object, start to finish.

4:5 (1080x1350) is the tallest ratio the feed allows, so it takes the most
screen and beats 1:1 on stop rate. Portrait sources are 3:4 and give up 161px
of height, cropped from whichever edge holds the least subject.

Slide 1 is a stacked before/after built from two frames of the same corner —
the landscape "before" crops naturally into the top band.
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
RED = "0xFF4D4D"

GRADE = ("eq=contrast=1.11:saturation=1.16:gamma=1.02,"
         "colorbalance=rs=0.02:bs=-0.02,"
         "unsharp=5:5:0.7:5:5:0.0")

BEFORE = "3d540cde-image.jpg"   # 2576x1932 — голый грунт, солнечно
AFTER = "cf6bba96-image.jpg"    # 1932x2576 — подушка готова

# (file, crop_y, подпись шага)
STEPS = [
    ("a26b6d00-image.jpg", 120, "Было: голый грунт внутри"),
    ("e6adae4a-image.jpg", 100, "Геотекстиль по грунту"),
    ("1d5454b4-image.jpg",   0, "Песок носим тачками"),
    ("8a6935b3-image.jpg", 140, "Разравниваем слоями"),
    ("cf6bba96-image.jpg", 161, "Подушка готова"),
    ("b347c4a0-image.jpg",  80, "Вводы воды и электрики"),
]
N = len(STEPS) + 1


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


def counter(i):
    return dt(200 + i, f"{i}/{N}", 34, 60, x="w-tw-56", box="black@0.55",
              pad=16, font=FONT_B)


# ── слайд 1: до/после встык по вертикали ────────────────────────────────────
# верх и низ по 1080x675; "до" — ландшафтный кадр, "после" — портретный
cover = os.path.join(OUT, "slide_1.jpg")
run(
    f'ffmpeg -v error -y -i "{os.path.join(UP, BEFORE)}" -i "{os.path.join(UP, AFTER)}" '
    f'-filter_complex "'
    f'[0:v]crop=2576:1610:0:200,scale=1080:675,{GRADE}[top];'
    f'[1:v]crop=1932:1207:0:420,scale=1080:675,{GRADE}[bot];'
    f'[top][bot]vstack=inputs=2,'
    f'drawbox=x=0:y=668:w=1080:h=14:color=white@0.95:t=fill,'
    + dt(10, " БЫЛО ", 52, 40, color="white", box=f"{RED}@0.92", x="40", pad=20) + ","
    + dt(11, " СТАЛО ", 52, 712, color="black", box=f"{GREEN}@0.95", x="40", pad=20) + ","
    + "drawbox=x=0:y=1140:w=1080:h=210:color=black@0.55:t=fill,"
    + dt(12, "ЧТО ПОД ПОЛОМ", 82, 1168) + ","
    + dt(13, "подготовка основания · листай →", 38, 1268, color=GREEN)
    + f'" -q:v 2 "{cover}"')
print(f"slide 1: {os.path.getsize(cover)/1024:.0f} KB  обложка до/после")

# ── слайды 2..N: шаги ───────────────────────────────────────────────────────
for i, (fname, crop_y, label) in enumerate(STEPS, start=2):
    filters = [f"crop=1932:2415:0:{crop_y}", "scale=1080:1350:flags=lanczos",
               GRADE,
               dt(110 + i, label, 46, 1130, x="56", box="black@0.62", pad=20),
               counter(i)]
    out = os.path.join(OUT, f"slide_{i}.jpg")
    run(f'ffmpeg -v error -y -i "{os.path.join(UP, fname)}" '
        f'-vf "{",".join(filters)}" -q:v 2 "{out}"')
    print(f"slide {i}: {os.path.getsize(out)/1024:.0f} KB  {label}")
