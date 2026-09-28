#!/usr/bin/env python3
"""YouTube Short — монтаж станции очистки, закатная съёмка.

Из исходника вырезан участок 24–32 с: туда входит и говорит оператор,
которого просили в кадр не пускать.
"""
import os, subprocess, sys

SP = "/tmp/claude-0/-home-user--/ab22f088-85f6-5f8b-9269-f223a8756ed3/scratchpad"
OUT = os.path.join(SP, "out")
SEG = os.path.join(SP, "seg", "yt1")
TXT = os.path.join(SP, "txt")
for d in (OUT, SEG, TXT):
    os.makedirs(d, exist_ok=True)

FONT = "/usr/share/fonts/truetype/montserrat/Montserrat-ExtraBold.ttf"
FONT_B = "/usr/share/fonts/truetype/montserrat/Montserrat-Bold.ttf"
GREEN = "0x2BD97A"
M = os.path.join(SP, "mY1.mp4")

# (начало, конец, скорость) — 24..32 пропущены, там оператор в кадре
SHOTS = [
    (36.0, 38.0, 1.00),   # 0 хук: дом и станция на закате
    (3.5, 6.0, 1.15),     # 1 проход вдоль дома
    (10.5, 13.5, 1.15),   # 2 экскаватор копает
    (16.0, 18.8, 1.20),   # 3 отвал и техника
    (21.0, 23.6, 1.20),   # 4 экскаватор крупно
    (32.5, 35.5, 1.15),   # 5 ёмкости в котловане
    (38.0, 40.4, 1.00),   # 6 финал
]


def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAIL:", cmd, file=sys.stderr)
        print(r.stderr[-2500:], file=sys.stderr)
        sys.exit(1)
    return r


def dur(p):
    return float(run(f'ffprobe -v error -show_entries format=duration '
                     f'-of csv=p=0 {p}').stdout.strip())


paths, marks, t = [], [], 0.0
for i, (a, b, sp) in enumerate(SHOTS):
    p = os.path.join(SEG, f"s{i}.mp4")
    run(f'ffmpeg -v error -y -ss {a} -to {b} -i {M} '
        f'-vf "setpts=(PTS-STARTPTS)/{sp},fps=30" '
        f'-c:v libx264 -crf 16 -preset veryfast -pix_fmt yuv420p -an {p}')
    d = dur(p)
    paths.append(p)
    marks.append((round(t, 2), round(t + d, 2)))
    t += d

lf = os.path.join(SEG, "list.txt")
with open(lf, "w") as f:
    for p in paths:
        f.write(f"file '{p}'\n")
cat = os.path.join(SEG, "cat.mp4")
run(f'ffmpeg -v error -y -f concat -safe 0 -i {lf} -c copy {cat}')
total = round(dur(cat), 2)
print("marks:", marks, "total", total)


def dt(idx, s, size, y, start, end, color="white", box=None, pad=20,
       font=FONT, x="(w-tw)/2", maxw=1000):
    while len(s) * size * 0.56 + 2 * pad > maxw and size > 30:
        size -= 2
    p = os.path.join(TXT, f"yt1_{idx}.txt")
    with open(p, "w") as f:
        f.write(s)
    fade = 0.14
    alpha = (f"if(lt(t,{start}+{fade}),(t-{start})/{fade},"
             f"if(gt(t,{end}-{fade}),({end}-t)/{fade},1))")
    parts = [f"fontfile={font}", f"textfile={p}", f"fontsize={size}",
             f"fontcolor={color}", f"x={x}", f"y={y}",
             f"enable='between(t,{start},{end})'", f"alpha='{alpha}'",
             "line_spacing=12"]
    if box:
        parts += ["box=1", f"boxcolor={box}", f"boxborderw={pad}"]
    else:
        parts += ["borderw=5", "bordercolor=black@0.85",
                  "shadowcolor=black@0.5", "shadowx=3", "shadowy=4"]
    return "drawtext=" + ":".join(parts)


hook_end = marks[0][1] - 0.05
cta_a = marks[6][0]

f = [
    f"drawbox=x=0:y=250:w=1080:h=240:color=black@0.45:t=fill:"
    f"enable='between(t,0,{hook_end})'",
    dt(0, "СТАНЦИЯ ОЧИСТКИ", 84, 288, 0.0, hook_end),
    dt(1, "монтаж под ключ", 42, 396, 0.15, hook_end, color=GREEN),

    dt(2, "Котлован — экскаватором", 48, 1330, marks[2][0], marks[4][1],
       x="56", box="black@0.62"),
    dt(3, "Ставим ёмкости", 48, 1330, marks[5][0], marks[5][1],
       x="56", box="black@0.62"),

    f"drawbox=x=0:y=1140:w=1080:h=220:color=black@0.55:t=fill:"
    f"enable='between(t,{cta_a},{total})'",
    dt(4, "Подписывайтесь", 62, 1172, cta_a, total),
    dt(5, "показываем монтаж от А до Я", 38, 1268, cta_a + 0.1, total,
       color=GREEN, font=FONT_B),
]

out = os.path.join(OUT, "yt_1_stanciya.mp4")
run(f'ffmpeg -v error -y -i {cat} '
    f'-f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 '
    f'-vf "{",".join(f)}" -map 0:v -map 1:a -t {total} '
    f'-c:v libx264 -profile:v high -level 4.1 -crf 20 -preset slow '
    f'-maxrate 10M -bufsize 20M -pix_fmt yuv420p -g 60 -keyint_min 30 '
    f'-c:a aac -b:a 128k -ar 44100 -movflags +faststart {out}')
print("ok ->", out, f"{os.path.getsize(out)/1048576:.1f} MiB")
