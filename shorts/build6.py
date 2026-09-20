#!/usr/bin/env python3
"""Short 6 — ночной муд. Тёмная съёмка при фонаре, короткий петлящий ролик."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build as B

B.M["G"] = os.path.join(B.SP, "mG.mp4")

shots = [
    ("G",  0.00,  2.90, 0.85),   # 0 двор, дальние огни, пятно фонаря
    ("G",  3.70,  4.90, 0.85),   # 1 рука над люком
    ("G",  7.30,  8.20, 1.00),   # 2 решётка и красная труба
    ("G",  9.00, 11.30, 0.90),   # 3 труба, трава, пятно света
    ("G", 13.10, 14.80, 0.90),   # 4 зелёная крышка септика, руки
]

CX = B.CX
GREEN = B.GREEN

if __name__ == "__main__":
    cat, mk, total = B.build_cuts("s6", shots)
    print("marks:", mk, "total", total)

    t = [
        B.dt(0, "СТРОЙКА НЕ СПИТ", 82, CX, 720, 0.15, mk[0][1] - 0.1,
             name="s6"),
        B.dt(1, "ночная смена", 48, CX, 1320, mk[1][0], mk[2][1],
             color=GREEN, box="black@0.55", pad=20, name="s6"),
        B.dt(2, "доделываем при фонаре", 50, CX, 1320,
             mk[4][0] - 0.3, total - 0.05, box="black@0.55", pad=20,
             name="s6"),
    ]
    B.render("6_nochnaya_smena", cat, t, total)
    print("short6 ok")
