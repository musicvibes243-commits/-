#!/usr/bin/env python3
"""Cut / speed / caption the three shorts from the stabilised 1080x1920 masters."""
import os, subprocess, sys

# Каталог с мастер-файлами mA.mp4 / mB.mp4 / mC.mp4 (по умолчанию — рядом со скриптом).
SP = os.environ.get("SHORTS_DIR", os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(SP, "out")
TMP = os.path.join(SP, "seg")
TXT = os.path.join(SP, "txt")
for d in (OUT, TMP, TXT):
    os.makedirs(d, exist_ok=True)

FONT = "/usr/share/fonts/truetype/montserrat/Montserrat-ExtraBold.ttf"
FONT_B = "/usr/share/fonts/truetype/montserrat/Montserrat-Bold.ttf"
M = {k: os.path.join(SP, f"m{k}.mp4") for k in "ABC"}

GREEN = "0x2BD97A"
RED = "0xFF4D4D"


def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAIL:", cmd, file=sys.stderr)
        print(r.stderr[-3000:], file=sys.stderr)
        sys.exit(1)
    return r


def build_cuts(name, shots):
    """shots: list of (master, in, out, speed). Returns concat file path + durations."""
    seg_dir = os.path.join(TMP, name)
    os.makedirs(seg_dir, exist_ok=True)
    listing, marks, t = [], [], 0.0
    for i, (src, a, b, sp) in enumerate(shots):
        p = os.path.join(seg_dir, f"s{i:02d}.mp4")
        run(f'ffmpeg -v error -y -ss {a} -to {b} -i {M[src]} '
            f'-vf "setpts=(PTS-STARTPTS)/{sp},fps=30" '
            f'-c:v libx264 -crf 16 -preset veryfast -pix_fmt yuv420p -an {p}')
        d = float(run(f'ffprobe -v error -show_entries format=duration '
                      f'-of csv=p=0 {p}').stdout.strip())
        listing.append(p)
        marks.append((round(t, 3), round(t + d, 3)))
        t += d
    lf = os.path.join(seg_dir, "list.txt")
    with open(lf, "w") as f:
        for p in listing:
            f.write(f"file '{p}'\n")
    cat = os.path.join(seg_dir, "cat.mp4")
    run(f'ffmpeg -v error -y -f concat -safe 0 -i {lf} -c copy {cat}')
    return cat, marks, round(t, 3)


def dt(idx, text, size, x, y, start, end, color="white", box=None,
       font=FONT, pad=24, name="x"):
    """Build one drawtext, text passed via file to dodge escaping."""
    tf = os.path.join(TXT, f"{name}_{idx}.txt")
    with open(tf, "w") as f:
        f.write(text)
    fade = 0.14
    alpha = (f"if(lt(t,{start}+{fade}),(t-{start})/{fade},"
             f"if(gt(t,{end}-{fade}),({end}-t)/{fade},1))")
    parts = [
        f"fontfile={font}", f"textfile={tf}", f"fontsize={size}",
        f"fontcolor={color}", f"x={x}", f"y={y}",
        f"enable='between(t,{start},{end})'", f"alpha='{alpha}'",
        "line_spacing=12",
    ]
    if box:
        parts += [f"box=1", f"boxcolor={box}", f"boxborderw={pad}"]
    else:
        parts += ["borderw=5", "bordercolor=black@0.85",
                  "shadowcolor=black@0.5", "shadowx=3", "shadowy=4"]
    return "drawtext=" + ":".join(parts)


def render(name, cat, texts, total):
    vf = ",".join(texts) if texts else "null"
    out = os.path.join(OUT, f"{name}.mp4")
    run(f'ffmpeg -v error -y -i {cat} -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 '
        f'-vf "{vf}" -map 0:v -map 1:a -t {total} '
        f'-c:v libx264 -profile:v high -level 4.1 -crf 20 -preset slow '
        f'-maxrate 10M -bufsize 20M -pix_fmt yuv420p -g 60 -keyint_min 30 '
        f'-c:a aac -b:a 128k -ar 44100 -movflags +faststart {out}')
    return out


# ───────────────────────────── SHORT 1 — полный цикл ─────────────────────────
s1_shots = [
    ("A", 24.3, 25.5, 1.00),   # 0 hook: крышка крупно
    ("C",  1.2,  3.6, 1.50),   # 1 копка
    ("C",  4.8,  7.5, 1.50),   # 2 двойная траншея
    ("B",  6.4,  8.7, 1.25),   # 3 бетонный колодец
    ("B", 10.2, 12.6, 1.00),   # 4 HERO станция
    ("B",  3.2,  5.4, 1.15),   # 5 станция + трубы
    ("B", 15.0, 18.6, 1.50),   # 6 труба + уровень
    ("B", 21.0, 24.2, 1.50),   # 7 глубокая траншея
    ("C", 19.5, 22.5, 1.35),   # 8 красная труба, небо
    ("B", 30.0, 33.4, 1.50),   # 9 параллельные траншеи
    ("B", 43.5, 46.5, 1.35),   # 10 рабочий засыпает
    ("B", 54.5, 57.0, 1.40),   # 11 засыпано вдоль фасада
    ("A", 11.0, 14.0, 1.15),   # 12 результат фасад
    ("A", 19.8, 22.6, 1.00),   # 13 HERO результат
    ("A", 25.0, 26.6, 1.00),   # 14 крышка крупно
]

# ───────────────────────────── SHORT 2 — до / после ──────────────────────────
s2_shots = [
    ("C", 14.0, 16.2, 1.30),
    ("A", 12.6, 14.8, 1.30),
    ("B", 31.5, 33.9, 1.40),
    ("A", 29.0, 31.4, 1.40),
    ("B",  6.8,  8.6, 1.20),
    ("A", 24.6, 26.4, 1.00),
    ("A", 19.8, 22.4, 1.00),
]

# ───────────────────────────── SHORT 3 — траншеи ─────────────────────────────
s3_shots = [
    ("C",  4.8,  8.0, 1.00),
    ("C",  9.8, 13.2, 1.15),
    ("B", 30.0, 34.0, 1.20),
    ("B", 15.5, 18.5, 1.15),
    ("C", 19.5, 23.0, 1.20),
    ("B", 26.2, 29.0, 1.20),
]

CX = "(w-tw)/2"

if __name__ == "__main__":
    # ---------- 1 ----------
    cat, mk, total = build_cuts("s1", s1_shots)
    print("short1 marks:", mk, "total", total)
    ph = [
        (mk[1][0],  mk[3][1], "1 · КОПАЕМ ТРАНШЕИ"),
        (mk[4][0],  mk[5][1], "2 · СТАВИМ СТАНЦИЮ"),
        (mk[6][0],  mk[9][1], "3 · ТРУБЫ ПОД УКЛОН"),
        (mk[10][0], mk[11][1], "4 · ЗАСЫПКА И ТРАМБОВКА"),
        (mk[12][0], mk[14][1], "5 · РЕЗУЛЬТАТ"),
    ]
    t1 = [
        f"drawbox=x=0:y=236:w=1080:h=420:color=black@0.42:t=fill:"
        f"enable='between(t,0,{mk[0][1]})'",
        dt(0, "СЕПТИК\nПОД КЛЮЧ", 104, CX, 290, 0.0, mk[0][1], name="s1"),
        dt(1, "полный цикл работ", 56, CX, 552, 0.15, mk[0][1],
           color=GREEN, name="s1"),
    ]
    cta_in = round(total - 3.4, 3)
    for i, (a, b, s_) in enumerate(ph):
        b = min(b, cta_in - 0.15) if i == len(ph) - 1 else b
        t1.append(dt(10 + i, s_, 52, 56, 1330, a, b,
                     box="black@0.62", pad=22, name="s1"))
    t1.append(dt(30, "Сохрани — пригодится", 62, CX, 1150,
                 cta_in, total, name="s1"))
    t1.append(dt(31, "Подписывайся — показываю\nмонтаж от А до Я", 44, CX, 1258,
                 cta_in + 0.1, total, font=FONT_B, name="s1"))
    render("1_septik_polnyy_cikl", cat, t1, total)
    print("short1 ok")

    # ---------- 2 ----------
    cat, mk, total = build_cuts("s2", s2_shots)
    print("short2 marks:", mk, "total", total)
    t2 = []
    labels = [("БЫЛО", RED), ("СТАЛО", GREEN)] * 3
    for i, (lab, col) in enumerate(labels):
        a, b = mk[i]
        t2.append(dt(i, f" {lab} ", 76, CX, 270, a, b - 0.02,
                     color="black" if col == GREEN else "white",
                     box=f"{col}@0.92", pad=26, name="s2"))
    a, b = mk[6]
    t2.append(dt(20, "Септик и ливнёвка\nпод ключ", 76, CX, 250, a, b, name="s2"))
    t2.append(dt(21, "Сохрани, если строишь дом", 52, CX, 1330, a + 0.3, b,
                 color=GREEN, box="black@0.62", pad=22, name="s2"))
    render("2_do_posle", cat, t2, total)
    print("short2 ok")

    # ---------- 3 ----------
    cat, mk, total = build_cuts("s3", s3_shots)
    print("short3 marks:", mk, "total", total)
    t3 = [
        f"drawbox=x=0:y=246:w=1080:h=290:color=black@0.42:t=fill:"
        f"enable='between(t,0,2.9)'",
        dt(0, "ПОЧЕМУ ВОДА\nНЕ СТОИТ У ДОМА", 78, CX, 290, 0.0, 2.9, name="s3"),
        dt(1, "Уклон 2 см на метр", 50, 56, 1330, mk[1][0], mk[2][1],
           box="black@0.62", pad=22, name="s3"),
        dt(2, "Ровно по уровню, без прогибов", 46, 56, 1330,
           mk[3][0], mk[4][1], box="black@0.62", pad=22, name="s3"),
        dt(3, "Сохрани, если строишь", 60, CX, 1150, total - 2.6, total,
           name="s3"),
    ]
    render("3_transhei", cat, t3, total)
    print("short3 ok")
