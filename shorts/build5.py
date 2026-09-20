#!/usr/bin/env python3
"""Short 5 — отзыв заказчика. Keeps audio, burns in subtitles.

Subtitle text comes from the CapCut auto-captions burned into the .mov the
user sent; timings were read off that file frame by frame. The clean take
(no burned captions) is the source, so the captions here are our own.
"""
import os, subprocess, sys

SP = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(SP, "out")
SEG = os.path.join(SP, "seg", "s5")
TXT = os.path.join(SP, "txt")
for d in (OUT, SEG, TXT):
    os.makedirs(d, exist_ok=True)

FONT = "/usr/share/fonts/truetype/montserrat/Montserrat-ExtraBold.ttf"
GREEN = "0x2BD97A"


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


# ── 1. master with audio: stabilised/graded video + original sound ──────────
MDA = os.path.join(SP, "mDa.mp4")
if not os.path.exists(MDA):
    run(f'ffmpeg -v error -y -i {os.path.join(SP,"mD.mp4")} -i {os.path.join(SP,"D.mp4")} '
        f'-map 0:v -map 1:a -c:v copy -c:a copy -shortest {MDA}')

# ── 2. segments (source in/out), speed 1.0 so speech stays natural ──────────
SEGS = [
    (22.40, 25.50),   # A  хук: заказчик в кадре, «спасибо, всё отлично»
    (0.30, 19.00),    # B  перечень работ под b-roll
    (25.50, 33.20),   # C  остаток отзыва
]

paths, marks, t = [], [], 0.0
for i, (a, b) in enumerate(SEGS):
    p = os.path.join(SEG, f"s{i}.mp4")
    run(f'ffmpeg -v error -y -ss {a} -to {b} -i {MDA} '
        f'-vf "fps=30,setpts=PTS-STARTPTS" -af "asetpts=PTS-STARTPTS" '
        f'-c:v libx264 -crf 16 -preset veryfast -pix_fmt yuv420p '
        f'-c:a aac -b:a 192k -ar 44100 {p}')
    d = dur(p)
    paths.append(p)
    marks.append((round(t, 2), round(t + d, 2), a))
    t += d

lf = os.path.join(SEG, "list.txt")
with open(lf, "w") as f:
    for p in paths:
        f.write(f"file '{p}'\n")
cat = os.path.join(SEG, "cat.mp4")
run(f'ffmpeg -v error -y -f concat -safe 0 -i {lf} -c copy {cat}')
total = round(dur(cat), 2)
print("marks:", marks, "total", total)

# ── 3. subtitles: (source_start, source_end, text) → shifted per segment ────
SUBS = [
    (22.50, 24.00, "Спасибо, всё отлично"),
    (24.00, 25.45, "Всё вовремя сделали"),
    (0.50, 4.45, "Провели монтаж котельной"),
    (4.50, 7.95, "Обустроили фильтр, воду"),
    (8.00, 10.45, "Сделали, всё поставили"),
    (10.50, 12.45, "Расширительный бак, давление"),
    (12.50, 13.95, "Есть пол тёплый"),
    (14.00, 15.45, "Также собрали гребёнки"),
    (15.50, 17.00, "Под тёплый пол"),
    (18.00, 18.95, "И под радиаторы"),
    (25.50, 26.95, "Вот, всегда были"),
    (27.00, 27.95, "На связи"),
    (28.00, 28.95, "Вот, всё было"),
    (29.00, 31.95, "Отлично. Спасибо, спасибо"),
    (32.00, 33.15, "Обращайтесь"),
]


def seg_for(src):
    """Index of the segment a source timestamp starts in.

    The end of one segment can equal the start of the next, so the match is
    half-open — otherwise a line starting exactly on the seam lands in the
    segment that just finished.
    """
    for i, (sa, sb) in enumerate(SEGS):
        if sa - 0.001 <= src < sb:
            return i
    return None


def map_pair(sa, sb):
    """Map a subtitle's source span onto the edited timeline."""
    i = seg_for(sa)
    if i is None:
        return None, None
    seg_a, seg_b = SEGS[i]
    tl_a = marks[i][0]
    return tl_a + (sa - seg_a), tl_a + (min(sb, seg_b) - seg_a)


def dt(idx, text, size, y, start, end, color="white", box=None, pad=22):
    tf = os.path.join(TXT, f"s5_{idx}.txt")
    with open(tf, "w") as f:
        f.write(text)
    fade = 0.10
    alpha = (f"if(lt(t,{start}+{fade}),(t-{start})/{fade},"
             f"if(gt(t,{end}-{fade}),({end}-t)/{fade},1))")
    parts = [f"fontfile={FONT}", f"textfile={tf}", f"fontsize={size}",
             f"fontcolor={color}", "x=(w-tw)/2", f"y={y}",
             f"enable='between(t,{start},{end})'", f"alpha='{alpha}'",
             "line_spacing=10"]
    if box:
        parts += ["box=1", f"boxcolor={box}", f"boxborderw={pad}"]
    else:
        parts += ["borderw=5", "bordercolor=black@0.85",
                  "shadowcolor=black@0.5", "shadowx=3", "shadowy=4"]
    return "drawtext=" + ":".join(parts)


filters = []
n = 0
for sa, sb, text in SUBS:
    a, b = map_pair(sa, sb)
    if a is None or b is None or b <= a:
        print("  skip (вне выбранных кусков):", text)
        continue
    b = min(b, total - 0.05)
    filters.append(dt(n, text, 54, 1320, round(a, 2), round(b, 2),
                      box="black@0.58", pad=22))
    print(f"  {a:5.2f}–{b:5.2f}  {text}")
    n += 1

# заголовок поверх хука
hook_end = marks[0][1] - 0.1
filters.insert(0, f"drawbox=x=0:y=250:w=1080:h=130:color=black@0.5:t=fill:"
                  f"enable='between(t,0,{hook_end})'")
filters.insert(1, dt(90, "ОТЗЫВ ЗАКАЗЧИКА", 62, 278, 0.0, hook_end,
                     color=GREEN))

vf = ",".join(filters)
out = os.path.join(OUT, "5_otzyv.mp4")
# звук в исходнике очень тихий (-29 LUFS), поднимаю к вещательному уровню
run(f'ffmpeg -v error -y -i {cat} -vf "{vf}" '
    f'-af "highpass=f=90,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.95" '
    f'-c:v libx264 -profile:v high -level 4.1 -crf 20 -preset slow '
    f'-maxrate 10M -bufsize 20M -pix_fmt yuv420p -g 60 -keyint_min 30 '
    f'-c:a aac -b:a 160k -ar 44100 -movflags +faststart {out}')
print("short5 ok ->", out, f"{os.path.getsize(out)/1048576:.1f} MiB")
