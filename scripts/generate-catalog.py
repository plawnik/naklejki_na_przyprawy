#!/usr/bin/env python3
"""Build the static browser catalogue and small WebP thumbnails."""

import json
import re
import unicodedata
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
LABELS_DIR = ROOT / "assets" / "labels"
THUMBS_DIR = ROOT / "assets" / "thumbs"
THUMB_SIZE = 320
CATALOG = ROOT / "data" / "labels.js"
TRANSLATIONS = ROOT / "data" / "translations.json"
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}


def slug(text):
    text = text.lower().replace("ł", "l")
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def read_categories():
    categories = []
    current = None
    for line in (ROOT / "data" / "pelna_lista_etykiet_kuchennych.txt").read_text(encoding="utf-8").splitlines():
        match = re.fullmatch(r"(\d{2})\. (.+) \[\d+\]", line.strip())
        if match:
            number, title = match.groups()
            current = {
                "number": number,
                "name": title.capitalize(),
                "folder": f"{number}-{slug(title)}",
                "names": {},
                "order": len(categories),
            }
            categories.append(current)
        elif current and line.strip() and not set(line.strip()) <= {"-", "="}:
            current["names"][slug(line.strip())] = line.strip()
    return categories


def generate_catalog():
    categories = read_categories()
    translations = json.loads(TRANSLATIONS.read_text(encoding="utf-8")).get("labels", {}) if TRANSLATIONS.exists() else {}
    by_folder = {category["folder"]: category for category in categories}
    by_number = {category["number"]: category for category in categories}
    previous = []
    if CATALOG.exists():
        payload = CATALOG.read_text(encoding="utf-8").split("window.LABELS =", 1)[1].strip().removesuffix(";")
        previous = json.loads(payload)
    by_source = {label["src"]: label for label in previous}
    labels = []
    used_ids = set()
    used_thumbs = set()
    thumbnail_bytes = 0

    for image_path in sorted(LABELS_DIR.rglob("*")):
        if not image_path.is_file() or image_path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        relative = image_path.relative_to(LABELS_DIR)
        if len(relative.parts) < 2 or any(part.startswith(".") for part in relative.parts):
            continue
        folder = relative.parts[0]
        category = by_folder.get(folder) or by_number.get(folder.split("-", 1)[0])
        category_name = category["name"] if category else re.sub(r"^\d+-", "", folder).replace("-", " ").capitalize()
        source = image_path.relative_to(ROOT).as_posix()
        old = by_source.get(source, {})
        canonical_name = category["names"].get(slug(image_path.stem)) if category else None
        number_match = re.match(r"^(\d{2})(?:-|$)", folder)
        category_key = category["number"] if category else (number_match.group(1) if number_match else None)
        name = canonical_name or old.get("name") or image_path.stem.replace("-", " ").replace("_", " ").capitalize()
        file_key = f"{category_key}/{slug(image_path.stem)}"
        name_key = f"{category_key}/{slug(name)}"
        translation_key = file_key if file_key in translations else name_key
        name = translations.get(translation_key, {}).get("pl") or name
        label_id = old.get("id", relative.as_posix())
        if label_id in used_ids:
            label_id = relative.as_posix()
        used_ids.add(label_id)
        thumb_relative = relative.with_suffix(".webp")
        if thumb_relative in used_thumbs:
            thumb_relative = relative.with_name(relative.name + ".webp")
        used_thumbs.add(thumb_relative)
        thumb_path = THUMBS_DIR / thumb_relative
        thumb_path.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(image_path) as image:
            width, height = image.size
            thumbnail = ImageOps.exif_transpose(image)
            has_alpha = thumbnail.mode in {"RGBA", "LA"} or "transparency" in thumbnail.info
            thumbnail = thumbnail.convert("RGBA" if has_alpha else "RGB")
            thumbnail.thumbnail((THUMB_SIZE, THUMB_SIZE), Image.Resampling.LANCZOS)
            thumbnail.save(thumb_path, "WEBP", quality=80, method=6)
            thumb_width, thumb_height = thumbnail.size
        thumbnail_bytes += thumb_path.stat().st_size
        label = {
            "name": name,
            "id": label_id,
            "category": category_name,
            "categoryKey": category_key,
            "translationKey": translation_key,
            "src": source,
            "thumb": thumb_path.relative_to(ROOT).as_posix(),
            "thumbWidth": thumb_width,
            "thumbHeight": thumb_height,
            "width": width,
            "height": height,
            "textOverlay": old.get("textOverlay", True),
        }
        name_order = list(category["names"].values()).index(name) if category and name in category["names"].values() else 10000
        labels.append(((category["order"] if category else len(categories), name_order, source), label))

    labels.sort(key=lambda item: item[0])
    CATALOG.write_text(
        "// Generowane automatycznie z assets/labels/ podczas publikacji.\n"
        + "window.LABELS = " + json.dumps([label for _, label in labels], ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    print(f"Katalog: {len(labels)} grafik; miniatury WebP: {thumbnail_bytes / 1024:.0f} KB łącznie.")


if __name__ == "__main__":
    generate_catalog()
