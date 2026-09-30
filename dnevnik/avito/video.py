# -*- coding: utf-8 -*-
"""Склейка кадров в mp4 для сторис.
Длительность кадра зависит от числа слов: одно слово читается мгновенно,
фразу из трёх надо успеть прочесть. Запуск: python3 video.py"""
import os, subprocess, imageio_ffmpeg, json

FF  = imageio_ffmpeg.get_ffmpeg_exe()
HERE = os.path.dirname(os.path.abspath(__file__))
KADR = os.path.join(HERE, '..', 'foto', 'kadry')
OUT  = os.path.join(HERE, '..', 'foto', 'ayko-rolik.mp4')

TEXTS = ['Объявление','висит','а звонков','нет','Значит','его просто','не открывают',
 'В ленте видно','заголовок','и первое фото','остальное','не читают','Перепишу',
 'заголовок','текст','фото','категорию','без','предоплаты','Платите когда',
 'увидите готовое','Два года','септики','дренаж','отопление','знаю вашу работу',
 'Сайт по подписке','2 000 ₽ в месяц','всё включено','Звонков не обещаю',
 'отвечаю за то','что объявление','станут открывать чаще',
 '+7 977 556-76-01','AYKO · aykoweb.ru']

files = sorted(f for f in os.listdir(KADR) if f.endswith('.jpg'))
assert len(files) == len(TEXTS), f'кадров {len(files)}, текстов {len(TEXTS)}'

def dur(i, t):
    if i >= len(TEXTS) - 2:      # телефон и адрес держим дольше
        return 2.0
    w = len(t.split())
    return 0.40 if w == 1 else 0.58 if w == 2 else 0.74

durs = [dur(i, t) for i, t in enumerate(TEXTS)]

lst = os.path.join(HERE, 'concat.txt')
with open(lst, 'w', encoding='utf-8') as f:
    for name, d in zip(files, durs):
        f.write(f"file '{os.path.join(KADR,name)}'\nduration {d}\n")
    f.write(f"file '{os.path.join(KADR,files[-1])}'\n")   # последний кадр дублируем,
                                                          # иначе его длительность теряется

cmd = [FF, '-y', '-f','concat','-safe','0','-i',lst,
       # беззвучная дорожка: некоторые приложения капризничают на видео совсем без звука
       '-f','lavfi','-i','anullsrc=channel_layout=stereo:sample_rate=44100',
       '-vf','fps=30,format=yuv420p,scale=1080:1920',
       '-c:v','libx264','-preset','slow','-crf','20',
       '-c:a','aac','-b:a','64k','-shortest',
       '-movflags','+faststart', OUT]
subprocess.run(cmd, check=True, capture_output=True)

probe = subprocess.run([FF,'-i',OUT], capture_output=True, text=True).stderr
print('итого кадров:', len(files))
print('расчётная длительность: %.1f c' % sum(durs))
for line in probe.splitlines():
    if 'Duration' in line or 'Stream #' in line:
        print(' ', line.strip())
print('файл:', OUT, '%.1f МБ' % (os.path.getsize(OUT)/1048576))
