#!/usr/bin/env python3
"""Рекламный рилс под платное продвижение.

Отличия от органических роликов:
- хук бьёт в проблему, а не в процесс: аудитория холодная и бренд не знает;
- в конце оффер и призыв, иначе платный показ не конвертируется;
- текст держится выше нижних 22%: там в рекламе кнопка и имя аккаунта;
- 16 секунд: на платном показе длинный ролик дороже за досмотр.

Исходники — реframe с 360-камеры: выцветшие, с вотермарком и с оператором
в кадре на последних секундах четвёртого клипа.
"""
import os, subprocess, sys

SP = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(SP, "out")
SEG = os.path.join(SP, "seg", "ad")
TXT = os.path.join(SP, "txt")
for d in (OUT, SEG, TXT):
    os.makedirs(d, exist_ok=True)

FONT = "/usr/share/fonts/truetype/montserrat/Montserrat-ExtraBold.ttf"
FONT_B = "/usr/share/fonts/truetype/montserrat/Montserrat-Bold.ttf"
GREEN = "0x2BD97A"

# вотермарк Insta360 сидит в одном месте на всех четырёх клипах
DELOGO = "delogo=x=90:y=282:w=250:h=58"
# картинка вялая и засвеченная: S-образная кривая возвращает контраст,
# не задирая и без того выбитое небо
GRADE = ("curves=all='0/0 0.20/0.10 0.45/0.44 0.72/0.82 1/0.97',"
         "eq=contrast=1.14:saturation=1.42:gamma=0.96,"
         "unsharp=5:5:0.6:5:5:0.0")

# (клип, начало, конец) — V4 обрезан на 2.25: дальше в кадр входит оператор
SHOTS = [
    ("V1", 0.20, 2.40),
    ("V4", 0.15, 2.25),
    ("V3", 0.40, 3.00),
    ("V2", 0.60, 3.20),
    ("V2", 4.20, 6.80),
    ("V1", 2.50, 4.05),
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
for i, (clip, a, b) in enumerate(SHOTS):
    p = os.path.join(SEG, f"s{i}.mp4")
    run(f'ffmpeg -v error -y -ss {a} -to {b} -i {os.path.join(SP, clip + ".mp4")} '
        f'-vf "{DELOGO},{GRADE},fps=30,setpts=PTS-STARTPTS" '
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


def dt(idx, s, size, y, start, end, color="white", box=None, pad=22,
       font=FONT, maxw=1080 - 90):
    # длинная строка иначе уезжает за край: ширина знака ≈ 0.56 кегля
    while len(s) * size * 0.56 + 2 * pad > maxw and size > 30:
        size -= 2
    p = os.path.join(TXT, f"ad_{idx}.txt")
    with open(p, "w") as f:
        f.write(s)
    fade = 0.15
    alpha = (f"if(lt(t,{start}+{fade}),(t-{start})/{fade},"
             f"if(gt(t,{end}-{fade}),({end}-t)/{fade},1))")
    parts = [f"fontfile={font}", f"textfile={p}", f"fontsize={size}",
             f"fontcolor={color}", "x=(w-tw)/2", f"y={y}",
             f"enable='between(t,{start},{end})'", f"alpha='{alpha}'",
             "line_spacing=12"]
    if box:
        parts += ["box=1", f"boxcolor={box}", f"boxborderw={pad}"]
    else:
        parts += ["borderw=5", "bordercolor=black@0.85",
                  "shadowcolor=black@0.55", "shadowx=3", "shadowy=4"]
    return "drawtext=" + ":".join(parts)


hook_end = marks[0][1] - 0.05
offer_a, offer_b = marks[1][0], marks[2][1]
mid_a, mid_b = marks[3][0], marks[4][1]
cta_a = marks[5][0]

f = [
    # хук: бьём в проблему, а не в процесс
    f"drawbox=x=0:y=250:w=1080:h=250:color=black@0.5:t=fill:"
    f"enable='between(t,0,{hook_end})'",
    dt(0, "ВОДА СТОИТ У ДОМА?", 84, 288, 0.0, hook_end),
    dt(1, "приедем, посмотрим, посчитаем", 40, 400, 0.2, hook_end, color=GREEN),

    dt(2, "ДРЕНАЖ И ЛИВНЁВКА", 74, 1150, offer_a, offer_b),
    dt(3, "под ключ", 46, 1250, offer_a + 0.1, offer_b, color=GREEN),

    dt(4, "Септик · канализация · дренаж · электрика", 40, 1200,
       mid_a, mid_b, box="black@0.62", pad=20, font=FONT_B),

    # призыв: на платном показе без него ролик не окупается
    f"drawbox=x=0:y=1090:w=1080:h=300:color=black@0.58:t=fill:"
    f"enable='between(t,{cta_a},{total})'",
    dt(5, "НАПИШИТЕ В ДИРЕКТ", 66, 1128, cta_a, total),
    dt(6, "посчитаем ваш участок", 44, 1228, cta_a + 0.1, total,
       color=GREEN),
    dt(7, "выезд по области", 36, 1300, cta_a + 0.2, total, font=FONT_B),
]

out = os.path.join(OUT, "7_reklama_drenazh.mp4")
run(f'ffmpeg -v error -y -i {cat} '
    f'-f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 '
    f'-vf "{",".join(f)}" -map 0:v -map 1:a -t {total} '
    f'-c:v libx264 -profile:v high -level 4.1 -crf 20 -preset slow '
    f'-maxrate 10M -bufsize 20M -pix_fmt yuv420p -g 60 -keyint_min 30 '
    f'-c:a aac -b:a 128k -ar 44100 -movflags +faststart {out}')
print("ad ok ->", out, f"{os.path.getsize(out)/1048576:.1f} MiB")
