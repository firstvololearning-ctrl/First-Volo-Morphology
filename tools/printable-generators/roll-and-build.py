#!/usr/bin/env python3

from __future__ import annotations

import argparse
import importlib.util
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader


REPO = Path(__file__).resolve().parents[2]

NAVY = HexColor("#12347B")
BLUE = HexColor("#1459D9")

GREEN = HexColor("#178A35")
GREEN_BG = HexColor("#F4FAF1")

PURPLE = HexColor("#6C2CE3")
PURPLE_BG = HexColor("#F9F5FF")

ORANGE = HexColor("#F26A16")
ORANGE_BG = HexColor("#FFF7EF")
LIGHT_BLUE = HexColor("#F3F7FE")

GRAY = HexColor("#5D6675")
LINE = HexColor("#C8D4E8")
WHITE = HexColor("#FFFFFF")


def load_config(name: str):
    path = REPO / "printable-configs" / f"{name}.py"
    if not path.exists():
        raise SystemExit(f"Config not found: {path}")

    spec = importlib.util.spec_from_file_location(f"roll_config_{name}", path)
    mod = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(mod)
    return mod


def fit_image(c, path: Path, x, y, w, h, pad=3):
    if not path.exists():
        raise FileNotFoundError(path)

    img = ImageReader(str(path))
    iw, ih = img.getSize()

    scale = min((w - 2 * pad) / iw, (h - 2 * pad) / ih)
    dw = iw * scale
    dh = ih * scale

    c.drawImage(
        img,
        x + (w - dw) / 2,
        y + (h - dh) / 2,
        width=dw,
        height=dh,
        preserveAspectRatio=True,
        mask="auto",
    )


def rounded_box(c, x, y, w, h, stroke, fill=None, radius=8, width=1):
    c.setLineWidth(width)
    c.setStrokeColor(stroke)
    c.setFillColor(fill if fill else WHITE)
    c.roundRect(x, y, w, h, radius, stroke=1, fill=1)


def die_pips(c, x, y, size, n, color):
    rounded_box(c, x, y, size, size, color, WHITE, radius=6, width=1.5)

    c.setFillColor(color)
    r = 1.8

    pts = {
        "tl": (x + size * .28, y + size * .72),
        "tc": (x + size * .50, y + size * .72),
        "tr": (x + size * .72, y + size * .72),
        "ml": (x + size * .28, y + size * .50),
        "mc": (x + size * .50, y + size * .50),
        "mr": (x + size * .72, y + size * .50),
        "bl": (x + size * .28, y + size * .28),
        "bc": (x + size * .50, y + size * .28),
        "br": (x + size * .72, y + size * .28),
    }

    mapping = {
        1: ["mc"],
        2: ["tl", "br"],
        3: ["tl", "mc", "br"],
        4: ["tl", "tr", "bl", "br"],
        5: ["tl", "tr", "mc", "bl", "br"],
        6: ["tl", "ml", "bl", "tr", "mr", "br"],
    }

    for key in mapping[n]:
        px, py = pts[key]
        c.circle(px, py, r, stroke=0, fill=1)


def special_badge(c, x, y, w, h, label, color):
    c.setFillColor(WHITE)
    c.setStrokeColor(color)
    c.setLineWidth(1)
    c.roundRect(x, y, w, h, 5, stroke=1, fill=1)

    c.setFillColor(color)
    c.setFont("Helvetica-Bold", 6.5)

    words = label.split()
    if len(words) == 1:
        c.drawCentredString(x + w / 2, y + h / 2 - 2, words[0])
    else:
        c.drawCentredString(x + w / 2, y + h / 2 + 2, words[0])
        c.drawCentredString(x + w / 2, y + h / 2 - 7, " ".join(words[1:]))


def die_row(c, item, n, x, y, w, h, color, bg):
    rounded_box(c, x, y, w, h, color, bg, radius=8, width=1)

    die_size = 28
    die_x = x + 7
    die_y = y + (h - die_size) / 2

    die_pips(c, die_x, die_y, die_size, n, color)

    image_x = die_x + die_size + 8
    image_w = 32

    if item.get("special"):
        special_badge(
            c,
            image_x,
            y + 5,
            image_w,
            h - 10,
            item["label"],
            color,
        )
    else:
        fit_image(
            c,
            REPO / item["image"],
            image_x,
            y + 4,
            image_w,
            h - 8,
            pad=1,
        )

    tx = image_x + image_w + 9

    c.setFillColor(color)
    c.setFont("Helvetica-Bold", 11 if not item.get("special") else 8.5)
    c.drawString(tx, y + h - 16, item["label"])

    c.setFillColor(GRAY)
    c.setFont("Helvetica", 6.6)
    c.drawString(tx, y + 8, item["meaning"])


def draw_table(c, x, y, w, h):
    widths = [36, 84, 84, 142, 72, w - 418]
    header_h = 26
    row_h = (h - header_h) / 5

    headers = [
        "#",
        "Prefix",
        "Suffix",
        "Word I built",
        "Real?",
        "Meaning (if real)",
    ]

    c.setStrokeColor(LINE)
    c.setLineWidth(.75)

    c.setFillColor(HexColor("#F7F9FC"))
    c.rect(x, y + h - header_h, w, header_h, stroke=1, fill=1)

    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 7.5)

    xx = x
    for i, width in enumerate(widths):
        c.drawCentredString(
            xx + width / 2,
            y + h - header_h / 2 - 3,
            headers[i],
        )
        xx += width

    for r in range(6):
        yy = y + h - header_h - r * row_h
        c.line(x, yy, x + w, yy)

    xx = x
    for width in widths:
        c.line(xx, y, xx, y + h)
        xx += width
    c.line(x + w, y, x + w, y + h)
    c.line(x, y, x + w, y)

    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8.5)

    for i in range(5):
        cy = y + h - header_h - row_h * (i + .5) - 3
        c.drawCentredString(x + widths[0] / 2, cy, str(i + 1))


def build_pdf(cfg, output: Path):
    prefixes = list(cfg.ROLL_PREFIXES)
    suffixes = list(cfg.ROLL_SUFFIXES)

    if len(prefixes) != 6 or len(suffixes) != 6:
        raise SystemExit("Roll & Build requires exactly 6 prefix and 6 suffix faces.")

    base = cfg.ROLL_BASE

    output.parent.mkdir(parents=True, exist_ok=True)

    c = canvas.Canvas(str(output), pagesize=letter)
    W, H = letter

    margin = 31

    # Header
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, H - 29, "First Volo Morphology")

    c.setFont("Helvetica-Bold", 27)
    c.drawString(
        margin,
        H - 60,
        f"{cfg.FAMILY} Family - Roll & Build",
    )

    c.setFont("Helvetica", 11.5)
    c.drawString(
        margin,
        H - 80,
        f"Roll a prefix. Roll a suffix. Build it with {cfg.FAMILY}. Does it make a real word?",
    )

    # Note
    note_y = H - 116
    note_h = 25
    rounded_box(c, margin, note_y, W - 2 * margin, note_h, LINE, HexColor("#F8FAFD"), 8, 1)

    c.setFillColor(GRAY)
    c.setFont("Helvetica", 7.1)
    c.drawString(margin + 12, note_y + 9, cfg.ROLL_NOTE)

    # Dice section headings
    col_gap = 18
    col_w = (W - 2 * margin - col_gap) / 2
    left_x = margin
    right_x = margin + col_w + col_gap

    heading_y = note_y - 22

    c.setFillColor(GREEN)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(left_x, heading_y, "DIE 1 · PREFIX")

    c.setFillColor(PURPLE)
    c.drawString(
        right_x,
        heading_y,
        getattr(cfg, "ROLL_SUFFIX_HEADING", "DIE 2 · SUFFIX"),
    )

    # Six rows
    row_h = 37
    row_gap = 4
    first_row_y = heading_y - 46

    for i in range(6):
        y = first_row_y - i * (row_h + row_gap)

        die_row(
            c,
            prefixes[i],
            i + 1,
            left_x,
            y,
            col_w,
            row_h,
            GREEN,
            GREEN_BG,
        )

        suffix_item = suffixes[i]
        suffix_color = ORANGE if suffix_item.get("extension") else PURPLE
        suffix_bg = ORANGE_BG if suffix_item.get("extension") else PURPLE_BG

        die_row(
            c,
            suffix_item,
            i + 1,
            right_x,
            y,
            col_w,
            row_h,
            suffix_color,
            suffix_bg,
        )

    # Build it box
    build_y = 308
    build_h = 77

    rounded_box(c, margin, build_y, W - 2 * margin, build_h, BLUE, LIGHT_BLUE, 10, 1.2)

    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin + 13, build_y + build_h - 19, "BUILD IT")

    c.setFillColor(GRAY)
    c.setFont("Helvetica", 7.4)
    c.drawString(
        margin + 13,
        build_y + build_h - 34,
        f"Put your rolls around {cfg.FAMILY}. Read the whole word.",
    )

    slot_y = build_y + 4
    slot_h = 34

    prefix_x = margin + 65
    prefix_w = 118

    base_x = prefix_x + prefix_w + 19
    base_w = 118

    suffix_x = base_x + base_w + 19
    suffix_w = 118

    # Prefix slot
    rounded_box(c, prefix_x, slot_y, prefix_w, slot_h, GREEN, WHITE, 7, 1.2)
    c.setFillColor(GREEN)
    c.setFont("Helvetica-Bold", 6.5)
    c.drawCentredString(prefix_x + prefix_w / 2, slot_y + slot_h - 10, "PREFIX")
    c.setFillColor(GRAY)
    c.setFont("Helvetica-Oblique", 6.2)
    c.drawCentredString(prefix_x + prefix_w / 2, slot_y + 8, "place rolled card")

    # +
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(prefix_x + prefix_w + 9.5, slot_y + 10, "+")

    # Base
    rounded_box(c, base_x, slot_y, base_w, slot_h, BLUE, WHITE, 7, 1.2)
    # Keep the base-word artwork and label visually separate.
    fit_image(c, REPO / base["image"], base_x + 40, slot_y + 10, 38, 22, pad=0)
    c.setFillColor(BLUE)
    c.setFont("Helvetica-Bold", 6.5)
    c.drawCentredString(base_x + base_w / 2, slot_y + 4, base["label"])

    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(base_x + base_w + 9.5, slot_y + 10, "+")

    # Suffix
    rounded_box(c, suffix_x, slot_y, suffix_w, slot_h, PURPLE, WHITE, 7, 1.2)
    c.setFillColor(PURPLE)
    c.setFont("Helvetica-Bold", 6.5)
    c.drawCentredString(suffix_x + suffix_w / 2, slot_y + slot_h - 10, "SUFFIX")
    c.setFillColor(GRAY)
    c.setFont("Helvetica-Oblique", 6.2)
    c.drawCentredString(suffix_x + suffix_w / 2, slot_y + 8, "place rolled card")

    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 13)
    c.drawCentredString(suffix_x + suffix_w + 50, slot_y + 10, "->")

    # Recording table
    table_title_y = 285

    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, table_title_y, "DOES IT MAKE A REAL WORD?")

    table_y = 75
    table_h = 198
    draw_table(c, margin, table_y, W - 2 * margin, table_h)

    # Footer
    c.setStrokeColor(LINE)
    c.setLineWidth(.8)
    c.line(margin, 54, W - margin, 54)

    c.setFillColor(NAVY)
    c.setFont("Helvetica", 7)
    c.drawString(margin, 38, "First Volo Learning | firstvololearning.com")

    footer = f"{cfg.FAMILY} Family | {cfg.FLIGHT}"
    c.drawRightString(W - margin, 38, footer)

    c.showPage()
    c.save()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("config", help="Config name, e.g. cook")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    cfg = load_config(args.config)

    required = [
        "FAMILY",
        "FLIGHT",
        "ROLL_PREFIXES",
        "ROLL_SUFFIXES",
        "ROLL_BASE",
        "ROLL_NOTE",
    ]

    for key in required:
        if not hasattr(cfg, key):
            raise SystemExit(f"Missing config value: {key}")

    output = REPO / args.output

    print("=== FIRST VOLO ROLL & BUILD GENERATOR ===")
    print(f"Family: {cfg.FAMILY}")
    print(f"Output: {output}")
    print("Using exact configured repo PNGs.")

    build_pdf(cfg, output)

    print(f"✓ Created: {output}")


if __name__ == "__main__":
    main()
