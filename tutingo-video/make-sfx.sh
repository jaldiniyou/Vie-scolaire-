#!/bin/sh
# Génère sfx.wav (pops + whoosh synthétiques, 14 s) calés sur l'animation.
cd "$(dirname "$0")"
pop() { echo "aevalsrc='0.5*sin(2*PI*($2+900*exp(-30*t))*t)*exp(-22*t)':d=0.25,adelay=$(( $1 ))|$(( $1 ))"; }
F=""; i=0; L=""
ping() { echo "aevalsrc='$3*sin(2*PI*$2*t)*exp(-3.5*t)*min(1\,t*200)':d=1.4,adelay=$(( $1 ))|$(( $1 ))"; }
# pops : maison, élève, bulle, profs, coche, bandeau, logo, accroche, tap
for spec in "150 520" "400 700" "850 600" "1750 560" "2000 760" "5450 880" "6600 760" "8250 520" "8800 660" "10450 990"; do
  set -- $spec; F="$F$(pop $1 $2)[p$i];"; L="$L[p$i]"; i=$((i+1))
done
# radar (sonar) + « ding » quand la prof accepte
for spec in "1250 1320 0.22" "2150 1320 0.16" "2950 1568 0.3" "3050 2093 0.25"; do
  set -- $spec; F="$F$(ping $1 $2 $3)[p$i];"; L="$L[p$i]"; i=$((i+1))
done
ffmpeg -y -v error -filter_complex "\
${F}\
anoisesrc=d=1.8:c=pink:a=0.35,bandpass=f=900:w=1400,afade=t=in:d=0.9,afade=t=out:st=0.9:d=0.9,adelay=5600|5600[w1];\
anoisesrc=d=1.2:c=pink:a=0.3,bandpass=f=1400:w=1800,afade=t=in:d=0.5,afade=t=out:st=0.5:d=0.7,adelay=7700|7700[w2];\
${L}[w1][w2]amix=inputs=$((i+2)):normalize=0,apad=whole_dur=14,atrim=0:14,volume=1.4,aformat=channel_layouts=stereo[a]" \
  -map "[a]" -ar 44100 sfx.wav
