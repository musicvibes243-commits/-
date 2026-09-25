#!/usr/bin/env python3
"""Три разных сюжета из одной партии — три разных формата.

Кадр из котлована держится сам и идёт отдельным постом.
Котельная снята с трёх точек — это короткая карусель.
Нутро станции сильное, но кадр один: в ленту мало, в сторис в самый раз.
"""
import os, subprocess, sys

SP = "/tmp/claude-0/-home-user--/ab22f088-85f6-5f8b-9269-f223a8756ed3/scratchpad"
UP = "/root/.claude/uploads/ab22f088-85f6-5f8b-9269-f223a8756ed3"
OUT = os.path.join(SP, "out", "batch_kotel")
TXT = os.path.join(SP, "txt")
os.makedirs(OUT, exist_ok=True)

FONT = "/usr/share/fonts/truetype/montserrat/Montserrat-ExtraBold.ttf"
FONT_B = "/usr/share/fonts/truetype/montserrat/Montserrat-Bold.ttf"
GREEN = "0x2BD97A"

# улица, пасмурно: нужен контраст и цвет
GRADE_OUT = ("eq=contrast=1.12:saturation=1.18:gamma=1.03,"
             "unsharp=5:5:0.7:5:5:0.0")
# помещение, тускло и в желтизну: поднимаем и уводим в холод
GRADE_IN = ("eq=contrast=1.10:saturation=1.10:gamma=1.24:brightness=0.04,"
            "colorbalance=rs=-0.03:bs=0.04,"
            "unsharp=5:5:0.7:5:5:0.0")


def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAIL:", cmd, file=sys.stderr)
        print(r.stderr[-2000:], file=sys.stderr)
        sys.exit(1)


def dt(idx, s, size, y, color="white", box=None, x="(w-tw)/2", font=FONT,
       pad=20, maxw=1000):
    while len(s) * size * 0.56 + 2 * pad > maxw and size > 30:
        size -= 2
    p = os.path.join(TXT, f"bk_{idx}.txt")
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


# ── 1. пост в ленту: котлован ───────────────────────────────────────────────
out = os.path.join(OUT, "post_kotlovan.jpg")
run(f'ffmpeg -v error -y -i "{os.path.join(UP, "c1712737-image.jpg")}" '
    f'-vf "crop=1932:2415:0:161,scale=1080:1350:flags=lanczos,{GRADE_OUT},'
    + dt(1, "Последний метр — руками", 48, 1130, x="56", box="black@0.62")
    + f'" -q:v 2 "{out}"')
print(f"пост «котлован»: {os.path.getsize(out)/1024:.0f} KB")

# ── 2. карусель: котельная ──────────────────────────────────────────────────
SLIDES = [
    ("47b04422-image.jpg",  0, None),
    ("fb1124b6-image.jpg",  40, "Электрокотёл и коллекторные шкафы"),
    ("3c1408d1-image.jpg",   0, "Бойлер, гидроаккумулятор, ввод воды"),
]
N = len(SLIDES)
for i, (fname, crop_y, label) in enumerate(SLIDES, start=1):
    f = [f"crop=1932:2415:0:{crop_y}", "scale=1080:1350:flags=lanczos",
         GRADE_IN]
    if i == 1:
        f += [
            "drawbox=x=0:y=1030:w=1080:h=240:color=black@0.55:t=fill",
            dt(10, "КОТЕЛЬНАЯ ПОД КЛЮЧ", 68, 1058),
            dt(11, "электрокотёл · бойлер · вода", 36, 1150, color=GREEN),
            dt(12, "листай →", 34, 1204, font=FONT_B),
        ]
    if label:
        f.append(dt(20 + i, label, 44, 1130, x="56", box="black@0.62"))
    f.append(dt(30 + i, f"{i}/{N}", 34, 60, x="w-tw-56",
               box="black@0.55", pad=16, font=FONT_B))
    p = os.path.join(OUT, f"kotel_slide_{i}.jpg")
    run(f'ffmpeg -v error -y -i "{os.path.join(UP, fname)}" '
        f'-vf "{",".join(f)}" -q:v 2 "{p}"')
    print(f"котельная {i}/{N}: {os.path.getsize(p)/1024:.0f} KB  "
          f"{label or 'обложка'}")

# ── 3. сторис: нутро станции ────────────────────────────────────────────────
st = os.path.join(OUT, "story_stanciya.jpg")
fc = (f"[0:v]scale=1080:-1,{GRADE_OUT}[fg];"
      f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,"
      f"crop=1080:1920,gblur=sigma=40,eq=brightness=-0.18[bg];"
      f"[bg][fg]overlay=(W-w)/2:(H-h)/2[v];"
      f"[v]" + dt(40, "Что внутри станции", 48, 1360, box="black@0.6")
      + "[out]")
run(f'ffmpeg -v error -y -i "{os.path.join(UP, "124cfdeb-image.jpg")}" '
    f'-filter_complex "{fc}" -map "[out]" -q:v 2 "{st}"')
print(f"сторис «станция»: {os.path.getsize(st)/1024:.0f} KB")
