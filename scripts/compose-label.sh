#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 3 || $# -gt 4 ]]; then
  echo "Użycie: $0 OBRAZ_WEJŚCIOWY PNG_WYJŚCIOWY 'TYTUŁ\\nDRUGI WIERSZ' [ROZMIAR_PISMA]" >&2
  exit 2
fi

input_file="$1"
output_file="$2"
title="$3"
point_size="${4:-78}"
font_file="/usr/share/fonts/opentype/urw-base35/NimbusRoman-Bold.otf"

if command -v magick >/dev/null 2>&1; then
  image_command=(magick)
elif command -v convert >/dev/null 2>&1; then
  image_command=(convert)
else
  echo "Brak ImageMagick (polecenie magick lub convert)." >&2
  exit 1
fi

if [[ ! -f "$font_file" ]]; then
  echo "Brak fontu: $font_file" >&2
  exit 1
fi

mkdir -p "$(dirname "$output_file")"
printf -v rendered_title '%b' "$title"
temporary_file="${output_file%.*}.$$.tmp.png"
trap 'rm -f "$temporary_file"' EXIT

"${image_command[@]}" "$input_file" \
  -resize 945x945\! \
  -colorspace sRGB \
  \( -background none -fill '#651b18' -font "$font_file" \
     -pointsize "$point_size" -interline-spacing -5 -gravity center \
     -size 790x245 "caption:$rendered_title" \) \
  -gravity north -geometry +0+105 -composite \
  \( -size 945x945 xc:black -fill white -draw 'circle 472.5,472.5 472.5,16' \) \
  -alpha off -compose CopyOpacity -composite \
  -dither FloydSteinberg -colors 256 \
  -units PixelsPerInch -density 300 \
  -define png:compression-level=9 \
  "PNG8:$temporary_file"

mv -f "$temporary_file" "$output_file"
trap - EXIT
