#!/usr/bin/env python3
"""Short 4 — котельная. Reuses the helpers from build.py, new shot list."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build as B

# mD is the stabilised/graded master for the new clip
B.M["D"] = os.path.join(B.SP, "mD.mp4")

shots = [
    ("D",  7.2,  9.0, 1.00),   # 0 HOOK котёл крупно
    ("D",  0.3,  2.6, 1.25),   # 1 котёл + расширительный бак, общий
    ("D",  9.4, 11.0, 1.00),   # 2 экран котла
    ("D",  3.9,  6.0, 1.20),   # 3 гидроаккумулятор у окна
    ("D", 11.4, 13.7, 1.15),   # 4 коллектор, красные вентили
    ("D", 14.3, 16.6, 1.20),   # 5 коллектор панорама
    ("D", 16.8, 19.3, 1.20),   # 6 коллектор, расходомеры
    ("D", 19.6, 21.6, 1.15),   # 7 общий план узла
]

CX = B.CX
GREEN = B.GREEN

if __name__ == "__main__":
    cat, mk, total = B.build_cuts("s4", shots)
    print("marks:", mk, "total", total)

    cta_in = round(total - 2.4, 3)
    chips = [
        (mk[1][0], mk[2][1], "Котёл и расширительный бак"),
        (mk[3][0], mk[3][1], "Гидроаккумулятор"),
        (mk[4][0], mk[6][1], "Коллектор тёплого пола"),
    ]

    t = [
        f"drawbox=x=0:y=250:w=1080:h=330:color=black@0.45:t=fill:"
        f"enable='between(t,0,{mk[0][1]})'",
        B.dt(0, "КОТЕЛЬНАЯ ПОД КЛЮЧ", 76, CX, 296, 0.0, mk[0][1], name="s4"),
        B.dt(1, "отопление · тёплый пол · вода", 44, CX, 420, 0.15, mk[0][1],
             color=GREEN, name="s4"),
    ]
    for i, (a, b, s) in enumerate(chips):
        b = min(b, cta_in - 0.15)
        if b > a:
            t.append(B.dt(10 + i, s, 50, 56, 1330, a, b,
                          box="black@0.62", pad=22, name="s4"))
    t.append(B.dt(30, "Сохрани, если строишь дом", 56, CX, 1180,
                  cta_in, total, name="s4"))

    B.render("4_kotelnaya", cat, t, total)
    print("short4 ok")
