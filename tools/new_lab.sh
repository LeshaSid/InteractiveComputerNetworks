#!/usr/bin/env bash
# Создать заготовку новой лабораторной: ./tools/new_lab.sh 3
set -euo pipefail
N="${1:?Usage: tools/new_lab.sh <num>}"
SRC="$(dirname "$0")/../content/labs/lab1"
DST="$(dirname "$0")/../content/labs/lab${N}"
if [[ -d "$DST" ]]; then
  echo "Уже существует: $DST" >&2
  exit 1
fi
mkdir -p "$DST"
for f in meta.js theory.js tasks.js quiz.js flashcards.js; do
  cp "$SRC/$f" "$DST/$f"
done
# базовая замена lab1 → labN (остальное правьте руками)
for f in "$DST"/*.js; do
  sed -i "s/lab1/lab${N}/g; s/Лабораторной 1/Лабораторной ${N}/g; s/Лабораторная 1/Лабораторная ${N}/g; s/lab\.num = 1/lab.num = ${N}/g" "$f" || true
  sed -i "s/num: 1,/num: ${N},/g" "$f" || true
done
echo "Создано: $DST"
echo "Дальше:"
echo "  1) отредактируйте файлы в $DST"
echo "  2) добавьте запись в content/registry.js"
echo "  3) подключите скрипты в index.html (как lab1)"
echo "  4) картинки → assets/img/lab${N}/"
