#!/bin/bash
# Склейка ролика о напарнике из готовых холстов.
# Каждый кадр — отдельный клип с медленным наездом или отъездом камеры:
# статичная подборка картинок в ТикТоке смотрится как презентация, а
# движение превращает её в видео. Направление чередуется, иначе наезд
# в одну сторону утомляет к середине.
# Холсты вдвое крупнее ролика, поэтому наезд остаётся чётким.
#
# Два набора кадров — свои фотографии и мемы, — поэтому папка и имя
# ролика берутся из аргументов:
#   bash ril-naparnik-sborka.sh naparnik-holsty ril-naparnik-foto
#   bash ril-naparnik-sborka.sh memy-holsty     ril-memy
set -e
cd "$(dirname "$0")/../.."
H=dnevnik/foto/${1:-naparnik-holsty}
IMYA=${2:-ril-naparnik-foto}
K=dnevnik/foto/${1:-naparnik-holsty}-klipy
rm -rf $K && mkdir -p $K
[ -d "$H" ] || { echo "нет папки $H"; exit 1; }
[ "$(ls $H/*.png 2>/dev/null | wc -l)" = 12 ] || { echo "в $H должно быть 12 кадров"; exit 1; }

# длительности взяты из текстовой версии ролика: они уже выверены
DLIT=(2.6 2.3 2.2 2.2 4.4 2.4 2.7 2.3 2.4 2.3 2.4 3.4)

: > $K/spisok.txt
SPIS=($(ls $H/*.png | sort))
for i in $(seq 1 12); do
  n=$(printf %02d $i)
  ISH=${SPIS[$((i-1))]}
  d=${DLIT[$((i-1))]}
  kadrov=$(python3 -c "print(int($d*30))")
  # за клип масштаб меняется на 8 процентов
  shag=$(python3 -c "print(0.08/$kadrov)")
  if [ $((i % 2)) -eq 1 ]; then
    z="min(1.0+$shag*on,1.08)"      # наезд
  else
    z="max(1.08-$shag*on,1.0)"      # отъезд
  fi
  ffmpeg -v error -loop 1 -i "$ISH" -t $d \
    -vf "zoompan=z='$z':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$kadrov:s=1080x1920:fps=30,format=yuv420p" \
    -c:v libx264 -preset slow -crf 20 -r 30 $K/$n.mp4 -y
  echo "file '$PWD/$K/$n.mp4'" >> $K/spisok.txt
  echo "  $n — $d с, $kadrov кадров, $([ $((i % 2)) -eq 1 ] && echo наезд || echo отъезд)"
done

ffmpeg -v error -f concat -safe 0 -i $K/spisok.txt \
  -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
  -c:v copy -c:a aac -b:a 96k -shortest -movflags +faststart \
  dnevnik/foto/$IMYA.mp4 -y
echo
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 dnevnik/foto/$IMYA.mp4
