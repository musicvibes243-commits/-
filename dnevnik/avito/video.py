# -*- coding: utf-8 -*-
"""Склейка кадров в mp4 для сторис.

Длительность каждого кадра — целое число долей выбранного темпа,
поэтому склейки попадают на биты и ролик «щёлкает» под музыку.
Короткое слово — одна доля, фраза из трёх слов — две, финал — четыре.
Общая длина добивается до целого числа тактов (8 долей), иначе трек
обрывается на середине такта.

Запуск:  python3 video.py [BPM] [имя_файла]
Пример:  python3 video.py 128 ayko-rolik-128.mp4
"""
import os, sys, subprocess, imageio_ffmpeg

BPM  = float(sys.argv[1]) if len(sys.argv) > 1 else 120.0
NAME = sys.argv[2] if len(sys.argv) > 2 else 'ayko-rolik.mp4'
BEAT = 60.0 / BPM

FF   = imageio_ffmpeg.get_ffmpeg_exe()
HERE = os.path.dirname(os.path.abspath(__file__))
KADR = os.path.join(HERE, '..', 'foto', 'kadry')
OUT  = os.path.join(HERE, '..', 'foto', NAME)

TEXTS = ['Объявление','висит','а звонков','нет','Значит','его просто','не открывают',
 'В ленте видно','заголовок','и первое фото','остальное','не читают','Перепишу',
 'заголовок','текст','фото','категорию','без','предоплаты','Платите когда',
 'увидите готовое','Два года','септики','дренаж','отопление','знаю вашу работу',
 'Сайт по подписке','2 000 ₽ в месяц','всё включено','Звонков не обещаю',
 'отвечаю за то','что объявление','станут открывать чаще',
 '+7 977 556-76-01','AYKO aykoweb.ru']

files = sorted(f for f in os.listdir(KADR) if f.endswith('.jpg'))
assert len(files) == len(TEXTS), f'кадров {len(files)}, текстов {len(TEXTS)}'

def beats(i, t):
    if i >= len(TEXTS) - 2: return 4        # телефон и адрес — по такту
    return 1 if len(t.split()) <= 2 else 2  # длинную фразу надо успеть прочесть

b = [beats(i, t) for i, t in enumerate(TEXTS)]
pad = (-sum(b)) % 8                          # добиваем до целого числа тактов
b[-1] += pad
durs = [n * BEAT for n in b]

lst = os.path.join(HERE, 'concat.txt')
with open(lst, 'w', encoding='utf-8') as f:
    for name, d in zip(files, durs):
        f.write(f"file '{os.path.join(KADR,name)}'\nduration {d:.4f}\n")
    f.write(f"file '{os.path.join(KADR,files[-1])}'\n")

subprocess.run([FF,'-y','-f','concat','-safe','0','-i',lst,
    '-f','lavfi','-i','anullsrc=channel_layout=stereo:sample_rate=44100',
    '-vf','fps=30,format=yuv420p,scale=1080:1920',
    '-c:v','libx264','-preset','slow','-crf','20',
    '-c:a','aac','-b:a','64k','-shortest','-movflags','+faststart', OUT],
    check=True, capture_output=True)
os.remove(lst)

print(f'темп {BPM:g} BPM, доля {BEAT:.3f} c')
print(f'долей всего {sum(b)} = {sum(b)//8} тактов ровно')
print('длительность: %.2f c' % sum(durs))
print('файл:', os.path.basename(OUT), '%.1f МБ' % (os.path.getsize(OUT)/1048576))
