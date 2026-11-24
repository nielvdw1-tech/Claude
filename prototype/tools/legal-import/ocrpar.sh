#!/bin/bash
# Parallel OCR (4 pages at a time) of every scanned upload (under 60 words a page) not yet done.
U=/root/.claude/uploads/7d4f6c8e-b914-5666-8fd6-2efd4bb672a3
D=/tmp/claude-0/-home-user-Claude/7d4f6c8e-b914-5666-8fd6-2efd4bb672a3/scratchpad/regs/pages
W=/tmp/claude-0/-home-user-Claude/7d4f6c8e-b914-5666-8fd6-2efd4bb672a3/scratchpad/regs/ocrwork
mkdir -p "$D" "$W"
export OMP_THREAD_LIMIT=1
ocr_page() { pdf="$1"; i="$2"; b="$3"; W="$4"; f="$W/$b-$(printf %04d "$i")"; [ -s "$f.txt" ] && exit 0
  pdftoppm -r 300 -gray -f "$i" -l "$i" -png "$pdf" "$f" && img=$(ls "$f"*.png | head -1) && tesseract "$img" "$f" --psm 3 -l eng >/dev/null 2>&1; rm -f "$f"*.png; }
export -f ocr_page
for pdf in "$U"/*.pdf; do
  b=$(basename "$pdf" .pdf); out="$D/$b.txt"; [ -s "$out" ] && continue
  n=$(pdfinfo "$pdf" 2>/dev/null | awk '/^Pages/{print $2}'); [ -z "$n" ] && continue
  w=$(pdftotext -raw "$pdf" - 2>/dev/null | wc -w); [ $((w / n)) -ge 60 ] && continue
  [ "$n" -gt 300 ] && { echo "skip (too long) $b"; continue; }
  seq 1 "$n" | xargs -P 4 -I{} bash -c 'ocr_page "$0" "$1" "$2" "$3"' "$pdf" {} "$b" "$W"
  : > "$out.part"; for i in $(seq 1 "$n"); do echo "@@PAGE $i" >> "$out.part"; cat "$W/$b-$(printf %04d "$i").txt" >> "$out.part" 2>/dev/null; done
  mv "$out.part" "$out"; echo "$b" >> "$D/OCR_FILES"; echo "OCR $b ($n pages) $(date +%T)"
done
echo ALL DONE $(date +%T)
