#!/usr/bin/env python3
"""Один сильный кадр — в ленту, три проходных — в сторис.

Кадр с бригадой и геотекстилем держится сам и идёт отдельным постом 4:5.
Остальные три повторяют то, что уже стоит в каруселях: в ленте они бы её
разбавили, а в сторис такой материал работает — там ждут будни, а не витрину.
"""
import os, subprocess, sys

SP = "/tmp/claude-0/-home-user--/ab22f088-85f6-5f8b-9269-f223a8756ed3/scratchpad"
UP = "/root/.claude/uploads/ab22f088-85f6-5f8b-9269-f223a8756ed3"
OUT = os.path.join(SP, "out", "post_stories")
TXT = os.path.join(SP, "txt")
os.makedirs(OUT, exist_ok=True)

FONT = "/usr/share/fonts/truetype/montserrat/Montserrat-ExtraBold.ttf"
FONT_B = "/usr/share/fonts/truetype/montserrat/Montserrat-Bold.ttf"
GREEN = "0x2BD97A"
GRADE = ("eq=contrast=1.10:saturation=1.15:gamma=1.02,"
         "unsharp=5:5:0.7:5:5:0.0")


def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAIL:", cmd, file=sys.stderr)
        print(r.stderr[-2000:], file=sys.stderr)
        sys.exit(1)


def dt(idx, s, size, y, color="white", box=None, x="(w-tw)/2", font=FONT,
       pad=20):
    p = os.path.join(TXT, f"ps_{idx}.txt")
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


# ── пост в ленту: 1080x1350 ────────────────────────────────────────────────
post = os.path.join(OUT, "post_geotekstil.jpg")
run(f'ffmpeg -v error -y -i "{os.path.join(UP, "35411402-image.jpg")}" '
    f'-vf "crop=1932:2415:0:80,scale=1080:1350:flags=lanczos,{GRADE},'
    + dt(1, "Геотекстиль по грунту", 46, 1130, x="56", box="black@0.62")
    + f'" -q:v 2 "{post}"')
print(f"пост в ленту: {os.path.getsize(post)/1024:.0f} KB")

# ── сторис: 1080x1920, кадр целиком на размытой подложке ───────────────────
STORIES = [
    ("3add8580-image.jpg", "Песок засыпан и выровнен"),
    ("00b85e68-image.jpg", "Разравниваем вручную"),
    ("73d33669-image.jpg", "Замеряем перед следующим этапом"),
]
for i, (fname, label) in enumerate(STORIES, start=1):
    out = os.path.join(OUT, f"story_{i}.jpg")
    fc = (f"[0:v]scale=1080:-1,{GRADE}[fg];"
          f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,"
          f"crop=1080:1920,gblur=sigma=40,eq=brightness=-0.18[bg];"
          f"[bg][fg]overlay=(W-w)/2:(H-h)/2[v];"
          # подпись держится в середине: сверху и снизу интерфейс сторис
          f"[v]" + dt(10 + i, label, 48, 1360, box="black@0.6") + "[out]")
    run(f'ffmpeg -v error -y -i "{os.path.join(UP, fname)}" '
        f'-filter_complex "{fc}" -map "[out]" -q:v 2 "{out}"')
    print(f"сторис {i}: {os.path.getsize(out)/1024:.0f} KB  {label}")
