#!/usr/bin/env python3
"""
Build one First Volo Morpho Waypoint PDF using REAL local assets.

Sample: Flight B - CONFORMITY

Expected local folders:
  ~/Documents/First Volo Learning/Digital Products/First Volo Morphology/
      images/prefixes/con.png
      images/roots/form.png
      images/suffixes/ity.png
      images/logo/logo.png

  ~/Documents/word-meanings/
      a PNG whose filename contains "conformity"

Output:
  <repo>/waypoints/flight-b/Flight-B-Waypoint-CONFORMITY.pdf
"""

from pathlib import Path
import sys

try:
    from PIL import Image as PILImage
except ImportError:
    print("Missing Pillow. Install with:")
    print('  .pdfvenv/bin/python -m pip install pillow')
    raise

try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.colors import HexColor, white
    from reportlab.lib.utils import ImageReader
    from reportlab.pdfbase.pdfmetrics import stringWidth
except ImportError:
    print("Missing ReportLab. Install with:")
    print('  .pdfvenv/bin/python -m pip install reportlab')
    raise


HOME = Path.home()
REPO = HOME / "Documents" / "First Volo Learning" / "Digital Products" / "First Volo Morphology"
MEANING_DIR = HOME / "Documents" / "word-meanings"

PREFIX = REPO / "images" / "prefixes" / "con.png"
ROOT = REPO / "images" / "roots" / "form.png"
SUFFIX = REPO / "images" / "suffixes" / "ity.png"
LOGO = REPO / "images" / "logo" / "logo.png"

OUTDIR = REPO / "waypoints" / "flight-b"
OUT = OUTDIR / "Flight-B-Waypoint-CONFORMITY.pdf"

NAVY = HexColor("#0B3B78")
BLUE = HexColor("#1769AA")
TEAL = HexColor("#168A8A")
GREEN = HexColor("#4D8B3B")
ORANGE = HexColor("#D97706")
PURPLE = HexColor("#744A9E")
CREAM = HexColor("#FBF7EE")
PALE_BLUE = HexColor("#EEF5FB")
PALE_GREEN = HexColor("#F2F7EC")
PALE_ORANGE = HexColor("#FFF6E8")
PALE_PURPLE = HexColor("#F6F1FA")
INK = HexColor("#17324D")
SOFT = HexColor("#63778A")
BORDER = HexColor("#0D5AA7")


def require(path: Path, label: str):
    if not path.exists():
        print(f"\nMISSING {label}:")
        print(f"  {path}")
        sys.exit(2)


def find_meaning_image():
    if not MEANING_DIR.exists():
        print("\nMISSING word-meanings folder:")
        print(f"  {MEANING_DIR}")
        sys.exit(2)

    files = []
    for ext in ("*.png", "*.PNG", "*.jpg", "*.JPG", "*.jpeg", "*.JPEG", "*.webp", "*.WEBP"):
        files.extend(MEANING_DIR.glob(ext))

    exact = [p for p in files if p.stem.lower() == "conformity"]
    if exact:
        return sorted(exact)[0]

    contains = [p for p in files if "conformity" in p.stem.lower()]
    if contains:
        return sorted(contains)[0]

    print("\nI could not find a conformity meaning image in:")
    print(f"  {MEANING_DIR}")
    print("\nRename the chosen PNG so its filename includes 'conformity', for example:")
    print("  conformity.png")
    sys.exit(2)


def img_dims(path: Path):
    with PILImage.open(path) as im:
        return im.size


def draw_img_fit(c, path: Path, x, y, w, h, pad=0, contain=True):
    """Draw image proportionally inside a box. Returns drawn rect."""
    iw, ih = img_dims(path)
    boxw = max(1, w - 2*pad)
    boxh = max(1, h - 2*pad)

    if contain:
        scale = min(boxw / iw, boxh / ih)
    else:
        scale = max(boxw / iw, boxh / ih)

    dw, dh = iw * scale, ih * scale
    dx = x + (w - dw) / 2
    dy = y + (h - dh) / 2
    c.drawImage(ImageReader(str(path)), dx, dy, dw, dh, preserveAspectRatio=True, mask="auto")
    return dx, dy, dw, dh


def round_box(c, x, y, w, h, fill, stroke, radius=12, width=1.4):
    c.setLineWidth(width)
    c.setStrokeColor(stroke)
    c.setFillColor(fill)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)


def draw_wrapped(c, text, x, y_top, max_width, font="Helvetica", size=12,
                 leading=None, color=INK, max_lines=4):
    if leading is None:
        leading = size * 1.3
    c.setFont(font, size)
    c.setFillColor(color)

    words = text.split()
    lines = []
    current = ""
    for word in words:
        test = word if not current else current + " " + word
        if stringWidth(test, font, size) <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)

    lines = lines[:max_lines]
    y = y_top
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def label(c, text, x, y, color, size=11):
    c.setFillColor(color)
    c.setFont("Helvetica-Bold", size)
    c.drawString(x, y, text)


def main():
    for p, lab in [
        (REPO, "Morphology repo"),
        (PREFIX, "con prefix tile"),
        (ROOT, "form root tile"),
        (SUFFIX, "-ity suffix tile"),
        (LOGO, "Morpho logo"),
    ]:
        require(p, lab)

    meaning = find_meaning_image()
    OUTDIR.mkdir(parents=True, exist_ok=True)

    print("Using real assets:")
    print(f"  logo:     {LOGO}")
    print(f"  prefix:   {PREFIX}")
    print(f"  root:     {ROOT}")
    print(f"  suffix:   {SUFFIX}")
    print(f"  meaning:  {meaning}")

    W, H = letter
    c = canvas.Canvas(str(OUT), pagesize=letter)
    c.setTitle("Flight B Waypoint Word - Conformity")
    c.setAuthor("First Volo Learning")

    # Page
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setStrokeColor(BORDER)
    c.setLineWidth(3.2)
    c.roundRect(18, 18, W-36, H-36, 18, fill=0, stroke=1)

    # Header
    draw_img_fit(c, LOGO, 34, H-92, 120, 60, contain=True)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 17)
    c.drawRightString(W-36, H-54, "FLIGHT B · WAYPOINT WORD")
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(W/2, H-116, "CONFORMITY")

    # Tile row
    tile_y = H - 310
    tile_size = 116
    gap = 24
    row_w = tile_size*3 + gap*2
    start_x = (W-row_w)/2

    tiles = [
        (PREFIX, "con-", "together / with", GREEN),
        (ROOT, "form", "shape / form", ORANGE),
        (SUFFIX, "-ity", "state / quality", PURPLE),
    ]

    for i, (path, short, meaning_text, accent) in enumerate(tiles):
        x = start_x + i*(tile_size+gap)
        # subtle backing card only; actual image remains the focus
        round_box(c, x-4, tile_y-4, tile_size+8, tile_size+8, white, HexColor("#D7E0E8"), 14, 0.8)
        draw_img_fit(c, path, x, tile_y, tile_size, tile_size, contain=True)

        if i < 2:
            c.setFillColor(NAVY)
            c.setFont("Helvetica-Bold", 26)
            c.drawCentredString(x + tile_size + gap/2, tile_y + tile_size/2 - 8, "+")

        c.setFillColor(accent)
        c.setFont("Helvetica-Bold", 11)
        c.drawCentredString(x+tile_size/2, tile_y-20, short)
        c.setFillColor(SOFT)
        c.setFont("Helvetica", 9.5)
        c.drawCentredString(x+tile_size/2, tile_y-34, meaning_text)

    # Word sum strip
    sum_y = tile_y - 68
    round_box(c, 58, sum_y, W-116, 42, PALE_BLUE, HexColor("#B8D3EA"), 12, 1)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(W/2, sum_y+14, "con- + form + -ity  →  conformity")

    # Lower layout
    left_x = 54
    left_w = 300
    right_x = 370
    right_w = W - right_x - 48
    top = sum_y - 18

    # Meaning image right
    scene_h = 214
    scene_y = top - scene_h
    round_box(c, right_x, scene_y, right_w, scene_h, white, HexColor("#CCD8E2"), 16, 1)
    draw_img_fit(c, meaning, right_x+8, scene_y+8, right_w-16, scene_h-16, contain=True)

    # Meaning from parts
    box1_h = 104
    box1_y = top - box1_h
    round_box(c, left_x, box1_y, left_w, box1_h, PALE_GREEN, HexColor("#AFCB9D"), 14, 1)
    label(c, "MEANING FROM THE PARTS", left_x+16, box1_y+box1_h-24, GREEN, 11.5)
    c.setFont("Helvetica-Bold", 15)
    c.setFillColor(INK)
    c.drawString(left_x+16, box1_y+box1_h-50, "together + form + state/quality")
    c.setFont("Helvetica-Oblique", 12)
    c.setFillColor(GREEN)
    c.drawString(left_x+16, box1_y+20, "a state of taking the same form or pattern")

    # Whole-word meaning
    box2_y = box1_y - 98
    round_box(c, left_x, box2_y, left_w, 84, PALE_BLUE, HexColor("#A8C9E2"), 14, 1)
    label(c, "THE WORD MEANS", left_x+16, box2_y+60, BLUE, 11.5)
    draw_wrapped(
        c,
        "following the behavior, rules, or expectations of a group.",
        left_x+16, box2_y+39, left_w-32,
        font="Helvetica-Bold", size=12.5, leading=15.5, color=INK, max_lines=3
    )

    # Context
    context_y = box2_y - 98
    round_box(c, left_x, context_y, left_w, 84, PALE_ORANGE, HexColor("#E7BF87"), 14, 1)
    label(c, "IN CONTEXT", left_x+16, context_y+60, ORANGE, 11.5)
    draw_wrapped(
        c,
        "The students showed conformity by following the same dress code.",
        left_x+16, context_y+39, left_w-32,
        font="Helvetica", size=12, leading=15, color=INK, max_lines=3
    )

    # Word family full-width
    fam_y = 70
    fam_h = 76
    round_box(c, 54, fam_y, W-108, fam_h, PALE_PURPLE, HexColor("#C8AED9"), 14, 1)
    label(c, "WORD FAMILY / RELATED FORM WORDS", 70, fam_y+51, PURPLE, 11.5)
    c.setFont("Helvetica-Bold", 13.5)
    c.setFillColor(INK)
    c.drawCentredString(W/2, fam_y+25, "form  ·  conform  ·  conformity  ·  reform  ·  transform")

    # Footer
    c.setFillColor(SOFT)
    c.setFont("Helvetica-Oblique", 9.5)
    c.drawCentredString(W/2, 40, "Use the waypoint to connect word parts, literal meaning, and whole-word meaning.")

    c.showPage()
    c.save()

    print("\n✓ Built:")
    print(f"  {OUT}")
    print("\nOpen it with:")
    print(f'  open "{OUT}"')


if __name__ == "__main__":
    main()
