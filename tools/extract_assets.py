#!/usr/bin/env python3
"""Извлечение и оптимизация картинок из PDF/DOCX для наполнения assets/img/.

Использование:
  # PDF (методичка): извлекает все встроенные изображения
  python3 tools/extract_assets.py pdf "Лабораторная работа 1.pdf" assets/img/lab1/methodic

  # DOCX (отчёт): распаковывает word/media
  python3 tools/extract_assets.py docx "Lab 1_1.docx" assets/img/lab1/reports --prefix lab1_1

Зависимости: pdftotext, pdfimages (poppler-utils), Pillow (python3 -c "pip install pillow").
"""
import sys
import os
import shutil
import subprocess
import zipfile
import tempfile


def convert_and_compress(src_dir, dest_dir, prefix=None, max_width=1600, quality=82):
    try:
        from PIL import Image
    except ImportError:
        print("ОШИБКА: нужен Pillow — pip install pillow", file=sys.stderr)
        sys.exit(1)

    os.makedirs(dest_dir, exist_ok=True)
    files = sorted(
        f for f in os.listdir(src_dir)
        if f.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff"))
    )
    saved = 0
    for i, fname in enumerate(files, 1):
        path = os.path.join(src_dir, fname)
        try:
            im = Image.open(path)
            if im.mode in ("RGBA", "P", "LA"):
                bg = Image.new("RGB", im.size, (255, 255, 255))
                im = im.convert("RGBA")
                bg.paste(im, mask=im.split()[-1])
                im = bg
            elif im.mode != "RGB":
                im = im.convert("RGB")

            if im.width > max_width:
                ratio = max_width / im.width
                im = im.resize((max_width, int(im.height * ratio)), Image.LANCZOS)

            name = (prefix or os.path.splitext(fname)[0]) + ".jpg"
            if not prefix:
                name = os.path.splitext(fname)[0] + ".jpg"
            out = os.path.join(dest_dir, name)
            if prefix:
                out = os.path.join(dest_dir, f"{prefix}-{i}.jpg")
            im.save(out, "JPEG", quality=quality, optimize=True)
            saved += 1
            print(f"  OK  {fname} -> {os.path.relpath(out)} ({os.path.getsize(out)//1024} КБ)")
        except Exception as e:
            print(f"  SKIP {fname}: {e}", file=sys.stderr)
    print(f"Сохранено изображений: {saved}")


def cmd_pdf(pdf_path, dest_dir):
    if not shutil.which("pdfimages"):
        print("ОШИБКА: нужен poppler-utils (pdfimages)", file=sys.stderr)
        sys.exit(1)
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["pdfimages", "-png", pdf_path, os.path.join(tmp, "fig")], check=True)
        print(f"Извлечено из {pdf_path}, конвертирую...")
        convert_and_compress(tmp, dest_dir)


def cmd_docx(docx_path, dest_dir, prefix=None):
    with tempfile.TemporaryDirectory() as tmp:
        with zipfile.ZipFile(docx_path) as z:
            media = [n for n in z.namelist() if n.startswith("word/media/")]
            if not media:
                print("В DOCX нет картинок (word/media/).", file=sys.stderr)
                sys.exit(1)
            for n in media:
                z.extract(n, tmp)
        src = os.path.join(tmp, "word", "media")
        print(f"Извлечено {len(media)} файлов из {docx_path}, конвертирую...")
        convert_and_compress(src, dest_dir, prefix=prefix)


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(1)
    kind, src, dest = sys.argv[1], sys.argv[2], sys.argv[3]
    prefix = None
    if "--prefix" in sys.argv:
        prefix = sys.argv[sys.argv.index("--prefix") + 1]

    if kind == "pdf":
        cmd_pdf(src, dest)
    elif kind == "docx":
        cmd_docx(src, dest, prefix=prefix)
    else:
        print(f"Неизвестный тип: {kind} (используйте pdf или docx)", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
