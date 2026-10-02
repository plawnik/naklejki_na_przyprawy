#!/usr/bin/env python3
"""Build the static browser catalogue from every category folder."""

import json
import re
import unicodedata
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
LABELS_DIR = ROOT / "assets" / "labels"
CATALOG = ROOT / "data" / "labels.js"
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
    by_folder = {category["folder"]: category for category in categories}
    by_number = {category["number"]: category for category in categories}
    previous = []
    if CATALOG.exists():
        payload = CATALOG.read_text(encoding="utf-8").split("window.LABELS =", 1)[1].strip().removesuffix(";")
        previous = json.loads(payload)
    by_source = {label["src"]: label for label in previous}
    labels = []
    used_ids = set()

    for image_path in sorted(LABELS_DIR.rglob("*")):
        if not image_path.is_file() or image_path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        relative = image_path.relative_to(LABELS_DIR)
        if any(part.startswith(".") for part in relative.parts):
            continue
        folder = relative.parts[0] if len(relative.parts) > 1 else "pozostale"
        category = by_folder.get(folder) or by_number.get(folder.split("-", 1)[0])
        category_name = category["name"] if category else re.sub(r"^\d+-", "", folder).replace("-", " ").capitalize()
        source = image_path.relative_to(ROOT).as_posix()
        old = by_source.get(source, {})
        canonical_name = category["names"].get(slug(image_path.stem)) if category else None
        name = old.get("name") or canonical_name or image_path.stem.replace("-", " ").replace("_", " ").capitalize()
        label_id = old.get("id", relative.as_posix())
        if label_id in used_ids:
            label_id = relative.as_posix()
        used_ids.add(label_id)
        with Image.open(image_path) as image:
            width, height = image.size
        label = {
            "name": name,
            "id": label_id,
            "category": category_name,
            "src": source,
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
    print(f"Katalog: {len(labels)} grafik z folderów assets/labels/.")


if __name__ == "__main__":
    generate_catalog()
