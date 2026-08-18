#!/usr/bin/env python3
"""Generate a First Volo Morphology Flight B Build & Discover packet.

The layout is intentionally locked to the approved PORT packet geometry.
Family-specific content lives in printable-configs/<family>.py.

Design goals:
- true US Letter page sizes
- exact, unmodified repo PNG assets placed into fixed image boxes
- 2.22 x 1.08 inch cut-apart cards sized to fit the narrowest build-mat slot
- portrait cards / landscape mats / portrait clues / portrait recording sheet
- validation and rendered previews before calling the packet finished

Usage:
    python3 tools/printable-generators/build-word-family-packet.py port

Optional:
    python3 tools/printable-generators/build-word-family-packet.py port --output printables/PORT-flight-B-color.pdf
"""

from __future__ import annotations

import argparse
import importlib.util
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

try:
    import fitz  # PyMuPDF
    from PIL import Image
    from reportlab.lib.colors import HexColor, black, white
    from reportlab.lib.pagesizes import letter, landscape
    from reportlab.lib.utils import ImageReader
    from reportlab.pdfbase.pdfmetrics import stringWidth
    from reportlab.pdfgen import canvas
except ImportError as exc:  # fail clearly rather than improvising
    raise SystemExit(
        "Missing PDF generator dependency. Install with:\n"
        "  python3 -m pip install reportlab pillow pymupdf\n"
        f"Original error: {exc}"
    )


# -----------------------------------------------------------------------------
# Locked First Volo visual system
# -----------------------------------------------------------------------------

NAVY = HexColor("#0B2B7E")
GREEN = HexColor("#137A24")
BLUE = HexColor("#155ECD")
PURPLE = HexColor("#6A20CB")
ORANGE = HexColor("#F26716")
GRAY = HexColor("#5B6577")
LINE = HexColor("#CBD4E3")

LIGHT_GREEN = HexColor("#F8FCF5")
LIGHT_BLUE = HexColor("#F6F9FF")
LIGHT_PURPLE = HexColor("#FCF8FF")
LIGHT_ORANGE = HexColor("#FFF9F3")
HEADER_FILL = HexColor("#F4F6FA")

PORTRAIT = letter            # 612 x 792 pt = 8.5 x 11 in
LANDSCAPE = landscape(letter)  # 792 x 612 pt = 11 x 8.5 in

CARD_W = 2.22 * 72
CARD_H = 1.08 * 72
CARD_COL_GAP = 0.18 * 72
CARD_ROW_GAP = 0.10 * 72

# Mat geometry: the 4-slot row is intentionally the narrowest.
MAT_X = 20
MAT_RIGHT = 20
MAT_GAP = 10
MAT_B_SLOT_W = (LANDSCAPE[0] - MAT_X - MAT_RIGHT - 3 * MAT_GAP) / 4

ROLE_STYLE = {
    "prefix": (GREEN, LIGHT_GREEN),
    "root": (BLUE, LIGHT_BLUE),
    "suffix": (PURPLE, LIGHT_PURPLE),
    "extension": (ORANGE, LIGHT_ORANGE),
}


@dataclass(frozen=True)
class Part:
    label: str
    meaning: str
    image: str
    note: str = ""


# -----------------------------------------------------------------------------
# Config loading / validation
# -----------------------------------------------------------------------------

def find_repo_root(script_path: Path) -> Path:
    """The script lives at repo/tools/printable-generators/..."""
    return script_path.resolve().parents[2]


def load_config(config_path: Path):
    spec = importlib.util.spec_from_file_location("first_volo_family_config", config_path)
    if spec is None or spec.loader is None:
        raise SystemExit(f"Could not load config: {config_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def require_attr(cfg, name: str):
    if not hasattr(cfg, name):
        raise SystemExit(f"Config is missing required value: {name}")
    return getattr(cfg, name)


def normalize_parts(items: Iterable[dict], role: str) -> list[Part]:
    out: list[Part] = []
    for i, item in enumerate(items, 1):
        try:
            out.append(
                Part(
                    label=str(item["label"]),
                    meaning=str(item["meaning"]),
                    image=str(item["image"]),
                    note=str(item.get("note", "")),
                )
            )
        except KeyError as exc:
            raise SystemExit(f"{role} item {i} is missing key {exc}") from exc
    return out


def validate_config(cfg, repo_root: Path):
    family = str(require_attr(cfg, "FAMILY")).strip()
    flight = str(getattr(cfg, "FLIGHT", "Flight B")).strip()

    prefixes = normalize_parts(require_attr(cfg, "PREFIXES"), "PREFIXES")
    roots = normalize_parts(require_attr(cfg, "ROOTS"), "ROOTS")
    suffixes = normalize_parts(require_attr(cfg, "SUFFIXES"), "SUFFIXES")
    extensions = normalize_parts(getattr(cfg, "EXTENSIONS", []), "EXTENSIONS")

    word_clues = list(require_attr(cfg, "WORD_LEVEL_CLUES"))
    context_clues = list(require_attr(cfg, "CONTEXT_CLUES"))
    extension_prompts = list(getattr(cfg, "EXTENSION_PROMPTS", []))

    if len(prefixes) > 6:
        raise SystemExit("Locked card page supports at most 6 prefix cards.")
    if len(roots) > 3:
        raise SystemExit("Locked card page supports at most 3 root/combining-form cards.")
    if len(suffixes) > 6:
        raise SystemExit("Locked card page supports at most 6 suffix cards.")
    if len(extensions) > 3:
        raise SystemExit("Locked card page supports at most 3 extension cards.")
    if len(word_clues) > 8:
        raise SystemExit("Build Clues page supports at most 8 word-level clues.")
    if len(context_clues) > 8:
        raise SystemExit("Build Clues page supports at most 8 context clues.")
    if len(extension_prompts) > 2:
        raise SystemExit("Build Clues page supports at most 2 extension prompts.")

    missing: list[Path] = []
    for part in prefixes + roots + suffixes + extensions:
        p = repo_root / part.image
        if not p.is_file():
            missing.append(p)

    if missing:
        msg = "\n".join(f"  - {p}" for p in missing)
        raise SystemExit(
            "Missing configured clay image(s). The generator will not substitute artwork:\n" + msg
        )

    return {
        "family": family,
        "flight": flight,
        "prefixes": prefixes,
        "roots": roots,
        "root_section_label": str(
            getattr(cfg, "ROOT_SECTION_LABEL", "ROOT")
        ),
        "suffixes": suffixes,
        "extensions": extensions,
        "word_clues": word_clues,
        "context_clues": context_clues,
        "extension_prompts": extension_prompts,
        "card_intro": str(
            getattr(
                cfg,
                "CARD_INTRO",
                "Cut apart the cards. Use them with the build mats on page 2.",
            )
        ),
        "card_note": str(
            getattr(
                cfg,
                "CARD_NOTE",
                f"Core cards build transparent {family}-family words. Later cards support noticing and extension.",
            )
        ),
        "mat_a_title": str(
            getattr(cfg, "MAT_A_TITLE", "MAT A - one prefix")
        ),
        "mat_a_prefix_label": str(
            getattr(cfg, "MAT_A_PREFIX_LABEL", "PREFIX")
        ),
        "mat_note": str(
            getattr(
                cfg,
                "MAT_NOTE",
                "Not every build needs every slot. Use Mat A for core builds, Mat B for layered prefix builds, and Mat C for extension builds.",
            )
        ),
        "clue_note": str(
            getattr(
                cfg,
                "CLUE_NOTE",
                "Try the word-level clues first. Then use the sentence clues as a second way to build or check the same target words.",
            )
        ),
        "record_note": str(
            getattr(
                cfg,
                "RECORD_NOTE",
                "Record each word you build. Literal meaning = what the word parts suggest; definition = what the whole word means.",
            )
        ),
    }


# -----------------------------------------------------------------------------
# Drawing helpers
# -----------------------------------------------------------------------------

def wrap_lines(text: str, font_name: str, font_size: float, max_width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if stringWidth(candidate, font_name, font_size) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_wrapped(
    c: canvas.Canvas,
    text: str,
    x: float,
    y_top: float,
    max_width: float,
    font_name: str = "Helvetica",
    font_size: float = 9,
    leading: float | None = None,
    max_lines: int | None = None,
) -> float:
    leading = leading or font_size * 1.25
    lines = wrap_lines(text, font_name, font_size, max_width)
    if max_lines is not None:
        lines = lines[:max_lines]
    c.setFont(font_name, font_size)
    y = y_top
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def draw_image_contain(c, path: Path, x: float, y: float, box_w: float, box_h: float):
    """Place the entire real PNG in a fixed box. Never crop or stretch."""
    with Image.open(path) as im:
        iw, ih = im.size
        scale = min(box_w / iw, box_h / ih)
        dw, dh = iw * scale, ih * scale
        c.drawImage(
            ImageReader(im),
            x + (box_w - dw) / 2,
            y + (box_h - dh) / 2,
            width=dw,
            height=dh,
            preserveAspectRatio=True,
            mask="auto",
        )


def section_header(c, text: str, y: float, color):
    c.setFillColor(color)
    c.setFont("Helvetica-Bold", 11.4)
    c.drawString(26, y, text)
    start = 26 + stringWidth(text, "Helvetica-Bold", 11.4) + 8
    c.setStrokeColor(color)
    c.setLineWidth(0.8)
    c.line(start, y + 3.2, PORTRAIT[0] - 26, y + 3.2)


def card(c, repo_root: Path, x: float, y: float, part: Part, role: str):
    border, fill = ROLE_STYLE[role]

    c.setFillColor(fill)
    c.setStrokeColor(border)
    c.setLineWidth(1.15)
    c.roundRect(x, y, CARD_W, CARD_H, 7, stroke=1, fill=1)

    image_h = CARD_H - 10
    image_w = image_h
    ix = x + 6
    iy = y + (CARD_H - image_h) / 2
    draw_image_contain(c, repo_root / part.image, ix, iy, image_w, image_h)

    tx = ix + image_w + 9
    avail = x + CARD_W - 7 - tx

    label_size = 13.5
    if stringWidth(part.label, "Helvetica-Bold", label_size) > avail:
        label_size = 11.0
    if stringWidth(part.label, "Helvetica-Bold", label_size) > avail:
        label_size = 9.4

    c.setFillColor(border)
    c.setFont("Helvetica-Bold", label_size)
    c.drawString(tx, y + CARD_H - 27, part.label)

    c.setFillColor(black)
    meaning = part.meaning if not part.note else f"{part.meaning} {part.note}"
    fs = 6.8
    draw_wrapped(
        c,
        meaning,
        tx,
        y + CARD_H - 43,
        avail,
        "Helvetica",
        fs,
        leading=8.1,
        max_lines=4,
    )


def footer(c, family: str, flight: str, page_w: float):
    c.setStrokeColor(LINE)
    c.setLineWidth(0.8)
    c.line(24, 24, page_w - 24, 24)
    c.setFillColor(NAVY)
    c.setFont("Helvetica", 7.3)
    c.drawString(24, 11, "First Volo Learning | firstvololearning.com")
    c.drawRightString(page_w - 24, 11, f"{family} Family | {flight}")


def page_header(c, family: str, title: str, subtitle: str, page_w: float):
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(24, c._pagesize[1] - 27, "First Volo Morphology")
    c.setFont("Helvetica-Bold", 28.5)
    c.drawString(24, c._pagesize[1] - 58, f"{family} Family - {title}")
    c.setFont("Helvetica", 12.5)
    c.drawString(24, c._pagesize[1] - 79, subtitle)


# -----------------------------------------------------------------------------
# Page 1 - word-part cards
# -----------------------------------------------------------------------------

def draw_cards_page(c, cfg, repo_root: Path):
    W, H = PORTRAIT
    c.setPageSize(PORTRAIT)

    page_header(c, cfg["family"], "Word-Part Cards", f'{cfg["flight"]} | Color clay tiles', W)

    c.setFillColor(black)
    c.setFont("Helvetica", 9.2)
    c.drawString(24, H - 101, cfg["card_intro"])
    c.setFillColor(NAVY)
    c.setFont("Helvetica", 8.2)
    c.drawString(24, H - 116, cfg["card_note"])

    left = (W - (3 * CARD_W + 2 * CARD_COL_GAP)) / 2
    xs = [left + i * (CARD_W + CARD_COL_GAP) for i in range(3)]

    prefix_header_y = H - 141
    section_header(c, "PREFIX", prefix_header_y, GREEN)
    prefix_row0_y = prefix_header_y - 16 - CARD_H
    for i, part in enumerate(cfg["prefixes"]):
        row, col = divmod(i, 3)
        y = prefix_row0_y - row * (CARD_H + CARD_ROW_GAP)
        card(c, repo_root, xs[col], y, part, "prefix")

    prefix_rows = max(1, (len(cfg["prefixes"]) + 2) // 3)
    prefix_bottom = prefix_row0_y - (prefix_rows - 1) * (CARD_H + CARD_ROW_GAP)

    root_header_y = prefix_bottom - 18
    section_header(c, cfg["root_section_label"], root_header_y, BLUE)
    root_y = root_header_y - 16 - CARD_H
    for i, part in enumerate(cfg["roots"]):
        card(c, repo_root, xs[i], root_y, part, "root")

    suffix_header_y = root_y - 18
    section_header(c, "SUFFIX", suffix_header_y, PURPLE)
    suffix_row0_y = suffix_header_y - 16 - CARD_H
    for i, part in enumerate(cfg["suffixes"]):
        row, col = divmod(i, 3)
        y = suffix_row0_y - row * (CARD_H + CARD_ROW_GAP)
        card(c, repo_root, xs[col], y, part, "suffix")

    suffix_rows = max(1, (len(cfg["suffixes"]) + 2) // 3)
    suffix_bottom = suffix_row0_y - (suffix_rows - 1) * (CARD_H + CARD_ROW_GAP)

    if cfg["extensions"]:
        ext_header_y = suffix_bottom - 18
        section_header(c, "C. EXTENSION", ext_header_y, ORANGE)
        ext_y = ext_header_y - 16 - CARD_H
        for i, part in enumerate(cfg["extensions"]):
            card(c, repo_root, xs[i], ext_y, part, "extension")
        lowest = ext_y
    else:
        lowest = suffix_bottom

    if lowest < 42:
        raise RuntimeError(
            "Card content overflowed the locked page. Reduce the number of cards; do not shrink them."
        )

    footer(c, cfg["family"], cfg["flight"], W)
    c.showPage()


# -----------------------------------------------------------------------------
# Page 2 - build mats
# -----------------------------------------------------------------------------

def mat_slot(c, x, y, w, h, role: str, label: str):
    border, fill = ROLE_STYLE[role]
    c.setFillColor(fill)
    c.setStrokeColor(border)
    c.setLineWidth(1.1)
    c.setDash(4, 2.5)
    c.roundRect(x, y, w, h, 7, stroke=1, fill=1)
    c.setDash()

    c.setFillColor(border)
    c.setFont("Helvetica-Bold", 9.2)
    c.drawString(x + 9, y + h - 17, label)

    c.setFillColor(GRAY)
    c.setFont("Helvetica-Oblique", 7.4)
    c.drawCentredString(x + w / 2, y + 10, "place card here")


def mat_row(c, title: str, y: float, h: float, slots: list[tuple[str, str]], page_w: float):
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 12.2)
    c.drawString(MAT_X, y + h + 10, title)

    count = len(slots)
    usable = page_w - MAT_X - MAT_RIGHT - (count - 1) * MAT_GAP
    slot_w = usable / count

    for i, (role, label) in enumerate(slots):
        x = MAT_X + i * (slot_w + MAT_GAP)
        mat_slot(c, x, y, slot_w, h, role, label)


def draw_mats_page(c, cfg):
    W, H = LANDSCAPE
    c.setPageSize(LANDSCAPE)

    page_header(
        c,
        cfg["family"],
        "Build Mats",
        f'{cfg["flight"]} | Landscape | Place the cut-apart cards directly on the mat',
        W,
    )

    c.setFillColor(black)
    c.setFont("Helvetica", 9.2)
    c.drawString(20, H - 101, cfg["mat_note"])

    mat_h = 105
    mat_row(
        c,
        cfg.get("mat_a_title", "MAT A - one prefix"),
        346,
        mat_h,
        [
            ("prefix", cfg.get("mat_a_prefix_label", "PREFIX")),
            ("root", "ROOT"),
            ("suffix", "SUFFIX"),
        ],
        W,
    )
    mat_row(
        c,
        "MAT B - two prefixes",
        190,
        94,
        [("prefix", "PREFIX"), ("prefix", "PREFIX"), ("root", "ROOT"), ("suffix", "SUFFIX")],
        W,
    )
    mat_row(
        c,
        "MAT C - extension builds",
        44,
        87,
        [("prefix", "PREFIX"), ("root", "ROOT"), ("extension", "EXTENSION SUFFIX")],
        W,
    )

    footer(c, cfg["family"], cfg["flight"], W)
    c.showPage()


# -----------------------------------------------------------------------------
# Page 3 - build clues
# -----------------------------------------------------------------------------

def clue_box(c, x: float, y: float, w: float, h: float, border, label: str, text: str):
    c.setFillColor(white)
    c.setStrokeColor(border)
    c.setLineWidth(1.1)
    c.roundRect(x, y, w, h, 7, stroke=1, fill=1)

    c.setFillColor(NAVY if border != ORANGE else ORANGE)
    c.setFont("Helvetica-Bold", 8.7)
    c.drawString(x + 10, y + h - 16, label)

    # Smaller type for the compact sentence/context boxes so wrapped text
    # remains fully inside the border. Never let text collide with the box.
    if h <= 44:
        body_size = 7.2
        leading = 8.0
        y_top = y + h - 31
        max_lines = 2
    else:
        body_size = 7.8
        leading = 9.0
        y_top = y + h - 34
        max_lines = 3

    c.setFillColor(black)
    draw_wrapped(
        c, text, x + 10, y_top, w - 20,
        "Helvetica", body_size, leading=leading, max_lines=max_lines
    )


def draw_clues_page(c, cfg):
    W, H = PORTRAIT
    c.setPageSize(PORTRAIT)

    page_header(c, cfg["family"], "Build Clues", f'{cfg["flight"]} | Use the same cards and build mat for both kinds of clues', W)

    c.setFillColor(black)
    c.setFont("Helvetica", 8.8)
    c.drawString(24, H - 101, cfg["clue_note"])

    # A. Word-level clues - locked two-column / four-row geometry.
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 11.5)
    c.drawString(24, 666, "A. WORD-LEVEL BUILD CLUES")
    c.setFillColor(GRAY)
    c.setFont("Helvetica", 7.6)
    c.drawString(24, 653, f'Build a real {cfg["family"]}-family word that matches each clue.')

    box_w = 270
    box_h = 54
    gap_x = 12
    left_x = 24
    right_x = left_x + box_w + gap_x
    start_y = 590
    row_gap = 5

    for i in range(8):
        row, col = divmod(i, 2)
        x = left_x if col == 0 else right_x
        y = start_y - row * (box_h + row_gap)
        text = cfg["word_clues"][i] if i < len(cfg["word_clues"]) else ""
        clue_box(c, x, y, box_w, box_h, GREEN, str(i + 1), text)

    # B. Sentence / context clues.
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 11.5)
    c.drawString(24, 377, "B. SENTENCE / CONTEXT CLUES")
    c.setFillColor(GRAY)
    c.setFont("Helvetica", 7.6)
    c.drawString(24, 364, f'Build the {cfg["family"]}-family word that best completes each sentence.')

    cbox_h = 42
    cstart_y = 311
    cg = 5
    letters = "ABCDEFGH"
    for i in range(8):
        row, col = divmod(i, 2)
        x = left_x if col == 0 else right_x
        y = cstart_y - row * (cbox_h + cg)
        text = cfg["context_clues"][i] if i < len(cfg["context_clues"]) else ""
        clue_box(c, x, y, box_w, cbox_h, PURPLE, letters[i], text)

    # C. Extension - remains on the same page. Never add a hidden extra page.
    if cfg["extension_prompts"]:
        c.setFillColor(ORANGE)
        c.setFont("Helvetica-Bold", 11.5)
        c.drawString(24, 117, "C. EXTENSION")
        c.setStrokeColor(ORANGE)
        c.setDash(4, 3)
        c.line(111, 121, W - 24, 121)
        c.setDash()

        c.setFillColor(GRAY)
        c.setFont("Helvetica", 7.5)
        c.drawString(24, 104, "Add more meaning with extension suffixes. Build and define the new word.")

        ext_w = 270
        ext_h = 69
        ext_y = 30
        for i, prompt in enumerate(cfg["extension_prompts"][:2]):
            x = 24 if i == 0 else 318
            suffix = prompt.get("suffix", "EXTENSION")
            # Locked extension rule: do not give students the target word.
            # The suffix is the only build cue; students generate a real family word.
            instruction = f"Build a word with {suffix}."

            c.setFillColor(white)
            c.setStrokeColor(ORANGE)
            c.setLineWidth(1.1)
            c.roundRect(x, ext_y, ext_w, ext_h, 7, stroke=1, fill=1)
            c.setFillColor(ORANGE)
            c.setFont("Helvetica-Bold", 8.2)
            c.drawString(x + 10, ext_y + ext_h - 15, f"EXTENSION SUFFIX: {suffix.upper()}")
            c.setFillColor(black)
            c.setFont("Helvetica", 7.2)
            c.drawString(x + 10, ext_y + ext_h - 29, instruction)
            c.setStrokeColor(GRAY)
            c.line(x + 10, ext_y + 31, x + ext_w - 10, ext_y + 31)
            c.setFont("Helvetica", 7.2)
            c.drawString(x + 10, ext_y + 17, "What does it mean?")
            c.line(x + 10, ext_y + 7, x + ext_w - 10, ext_y + 7)

    footer(c, cfg["family"], cfg["flight"], W)
    c.showPage()


# -----------------------------------------------------------------------------
# Page 4 - record your builds
# -----------------------------------------------------------------------------

def draw_record_page(c, cfg):
    W, H = PORTRAIT
    c.setPageSize(PORTRAIT)

    page_header(c, cfg["family"], "Record Your Builds", f'{cfg["flight"]} | Use after building with the cards and mat', W)

    c.setFillColor(black)
    c.setFont("Helvetica", 8.8)
    c.drawString(24, H - 101, cfg["record_note"])

    x = 30
    y = 52
    total_w = W - 60
    total_h = 615
    header_h = 36
    cols = [116, 128, 160, total_w - 116 - 128 - 160]
    headers = ["WORD", "WORD SUM", "LITERAL MEANING", "DEFINITION"]
    rows = 9
    row_h = (total_h - header_h) / rows

    c.setFillColor(HEADER_FILL)
    c.setStrokeColor(HexColor("#9FB1C7"))
    c.setLineWidth(0.8)
    c.rect(x, y + total_h - header_h, total_w, header_h, stroke=1, fill=1)

    cur = x
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8.8)
    for cw, head in zip(cols, headers):
        c.drawString(cur + 8, y + total_h - 22, head)
        cur += cw

    # verticals
    cur = x
    for cw in cols[:-1]:
        cur += cw
        c.line(cur, y, cur, y + total_h)

    # rows and writing lines
    top_data = y + total_h - header_h
    c.line(x, top_data, x + total_w, top_data)
    for r in range(rows):
        row_top = top_data - r * row_h
        row_bottom = row_top - row_h
        c.line(x, row_bottom, x + total_w, row_bottom)

        cur = x
        for col_i, cw in enumerate(cols):
            if col_i < 2:
                line_y = row_bottom + row_h * 0.43
                c.setStrokeColor(HexColor("#A6B5C7"))
                c.line(cur + 8, line_y, cur + cw - 8, line_y)
            else:
                c.setStrokeColor(HexColor("#A6B5C7"))
                c.line(cur + 8, row_bottom + row_h * 0.58, cur + cw - 8, row_bottom + row_h * 0.58)
                c.line(cur + 8, row_bottom + row_h * 0.18, cur + cw - 8, row_bottom + row_h * 0.18)
            cur += cw
        c.setStrokeColor(HexColor("#9FB1C7"))

    c.rect(x, y, total_w, total_h, stroke=1, fill=0)

    footer(c, cfg["family"], cfg["flight"], W)
    c.showPage()


# -----------------------------------------------------------------------------
# QA
# -----------------------------------------------------------------------------

def render_previews(pdf_path: Path, out_dir: Path, dpi: int = 160):
    out_dir.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(pdf_path)
    scale = dpi / 72.0
    matrix = fitz.Matrix(scale, scale)
    for i, page in enumerate(doc, 1):
        pix = page.get_pixmap(matrix=matrix, alpha=False)
        pix.save(out_dir / f"page-{i}.png")


def qa(pdf_path: Path, cfg, repo_root: Path, preview_dir: Path):
    doc = fitz.open(pdf_path)
    expected = [PORTRAIT, LANDSCAPE, PORTRAIT, PORTRAIT]

    if len(doc) != len(expected):
        raise RuntimeError(f"Expected {len(expected)} pages; generated {len(doc)}")

    for i, (page, target) in enumerate(zip(doc, expected), 1):
        w, h = page.rect.width, page.rect.height
        tw, th = target
        if abs(w - tw) > 0.1 or abs(h - th) > 0.1:
            raise RuntimeError(f"Page {i} has wrong physical size: {w} x {h} pt")

    render_previews(pdf_path, preview_dir)

    clearance = MAT_B_SLOT_W - CARD_W
    if clearance <= 0:
        raise RuntimeError("Cut-apart cards do not fit the narrowest Mat B slot.")

    print("\n=== BUILD & DISCOVER QA ===")
    print(f"✓ family: {cfg['family']}")
    print(f"✓ real image assets found: {len(cfg['prefixes']) + len(cfg['roots']) + len(cfg['suffixes']) + len(cfg['extensions'])}")
    print(f"✓ cut-apart card: {CARD_W/72:.2f} x {CARD_H/72:.2f} in")
    print(f"✓ narrowest Mat B slot: {MAT_B_SLOT_W/72:.2f} in wide")
    print(f"✓ horizontal clearance: {clearance/72:.2f} in")
    print(f"✓ PDF pages: {len(doc)}")
    for i, page in enumerate(doc, 1):
        print(f"✓ page {i}: {page.rect.width/72:.1f} x {page.rect.height/72:.1f} in")
    print(f"✓ rendered previews: {preview_dir}")
    print("Review the PNG previews before publishing.")


# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("family", help="Config name, e.g. port for printable-configs/port.py")
    parser.add_argument("--repo-root", type=Path, default=None, help="Override repository root")
    parser.add_argument("--output", type=Path, default=None, help="Output PDF path")
    parser.add_argument("--preview-dir", type=Path, default=None, help="Rendered preview directory")
    args = parser.parse_args()

    script_path = Path(__file__)
    repo_root = args.repo_root.resolve() if args.repo_root else find_repo_root(script_path)
    config_path = repo_root / "printable-configs" / f"{args.family}.py"

    if not config_path.is_file():
        raise SystemExit(f"Config not found: {config_path}")

    cfg_module = load_config(config_path)
    cfg = validate_config(cfg_module, repo_root)

    output = args.output
    if output is None:
        safe_family = cfg["family"].replace(" ", "_")
        output = repo_root / "generated-printables" / f"{safe_family}_Build_and_Discover.pdf"
    elif not output.is_absolute():
        output = repo_root / output

    output.parent.mkdir(parents=True, exist_ok=True)

    preview_dir = args.preview_dir
    if preview_dir is None:
        preview_dir = output.parent / f"{output.stem}_render"
    elif not preview_dir.is_absolute():
        preview_dir = repo_root / preview_dir

    print("=== FIRST VOLO BUILD & DISCOVER GENERATOR ===")
    print(f"Repo root: {repo_root}")
    print(f"Config:    {config_path}")
    print(f"Output:    {output}")
    print("Using exact configured repo PNGs; no artwork will be regenerated or substituted.")

    c = canvas.Canvas(str(output), pagesize=PORTRAIT)
    draw_cards_page(c, cfg, repo_root)
    draw_mats_page(c, cfg)
    draw_clues_page(c, cfg)
    draw_record_page(c, cfg)
    c.save()

    qa(output, cfg, repo_root, preview_dir)
    print(f"\n✓ Created: {output}")


if __name__ == "__main__":
    main()
