#!/usr/bin/env python3
"""
Define the approved Flight C Waypoint content used by the canonical all-flight
landscape builder. The direct renderer below is retained as a supporting tool;
canonical builds should use build_all_waypoint_pdfs_v4_GRADE_BAND_WORDING.py.

Expected local structure:
  ~/Documents/First Volo Learning/Digital Products/First Volo Morphology/
    images/logo/logo.png
    images/prefixes/
    images/roots/
    images/suffixes/
    waypoints/flight-c/flight-c-word-meanings/
      deduction.png
      intervention.png
      incredible.png
      distraction.png
      tenable.png
      sequence.png
      vocalize.png
      interjection.png
      submission.png
      reference.png
      inversion.png
      admittance.png
      prevalent.png

The meaning-image filenames may contain the target word rather than match it exactly.

Outputs:
  waypoints/flight-c/pdfs/Flight-C-Waypoint-<WORD>.pdf
  waypoints/flight-c/Flight-C-Waypoints-review-packet.pdf
  waypoints/flight-c/Flight-C-Waypoint-PDFs.zip

Design rules:
  - Same visual model as the polished Flight B Waypoints.
  - Real First Volo logo and real Morpho morpheme tiles.
  - Word sum before meaning image.
  - Meaning-from-parts literal composition and semantic bridge on separate lines.
  - Vector arrows (not visible ASCII ->).
  - White page, blue outer frame, standard First Volo footer.
"""

from pathlib import Path
import sys
import zipfile
from typing import List, Tuple

from PIL import Image, ImageChops
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth

try:
    import fitz
except Exception:
    fitz = None

REPO = Path(__file__).resolve().parents[2]
FLIGHT_DIR = REPO / "waypoints" / "flight-c"
MEANING_DIR = FLIGHT_DIR / "flight-c-word-meanings"
CROPPED_DIR = FLIGHT_DIR / "_cropped"
OUTDIR = FLIGHT_DIR / "pdfs"

LOGO = REPO / "images" / "logo" / "logo.png"
PREFIX_DIR = REPO / "images" / "prefixes"
ROOT_DIR = REPO / "images" / "roots"
SUFFIX_DIR = REPO / "images" / "suffixes"

# ---------- STYLE ----------
NAVY = HexColor("#0B3B78")
BLUE = HexColor("#1769AA")
GREEN = HexColor("#4D8B3B")
ORANGE = HexColor("#D97706")
PURPLE = HexColor("#744A9E")
LIGHT_BLUE = HexColor("#EEF5FB")
LIGHT_GREEN = HexColor("#F2F7EC")
LIGHT_ORANGE = HexColor("#FFF6E8")
LIGHT_PURPLE = HexColor("#F6F1FA")
SOFT_BLUE = HexColor("#C7DDF1")
SOFT_GREEN = HexColor("#BED7B0")
SOFT_ORANGE = HexColor("#EAC99B")
SOFT_PURPLE = HexColor("#D0B9DE")
INK = HexColor("#17324D")
BORDER = HexColor("#0D5AA7")

W, H = letter

# Each tile = (kind, candidate filenames)
# kind: prefixes / roots / suffixes
WORDS = [
    {
        "word": "DEDUCTION",
        "meaning_keys": ["deduction", "deduce"],
        "tiles": [
            ("prefixes", ["de.png"]),
            ("roots", ["duct-duce.png", "duct.png", "duce.png"]),
            ("suffixes", ["ion.png"]),
        ],
        "sum": "de- + duct/duce + -ion -> deduction",
        "parts": "off / from + lead + act / process / result",
        "bridge": "clues lead you from what you know to a conclusion",
        "definition": "a conclusion reached from clues, evidence, or reasoning.",
        "context": "From the paw prints and crumbs, he made the deduction that the dog had taken the cookie.",
        "family": "deduce · deduction · deductive",
    },
    {
        "word": "INTERVENTION",
        "meaning_keys": ["intervention", "intervene"],
        "tiles": [
            ("prefixes", ["inter.png"]),
            ("roots", ["ven-vent.png", "ven.png", "vent.png"]),
            ("suffixes", ["ion.png"]),
        ],
        "sum": "inter- + ven/vent + -ion -> intervention",
        "parts": "between + come + act / process / result",
        "bridge": "the act of coming between to help or change what happens",
        "definition": "action taken to step into a situation to help or change what happens.",
        "context": "The teacher's intervention stopped the argument before it got worse.",
        "family": "intervene · intervention · intervening",
    },
    {
        "word": "INCREDIBLE",
        "meaning_keys": ["incredible"],
        "tiles": [
            ("prefixes", ["in-not.png", "in-im-il-ir.png", "im-not.png"]),
            ("roots", ["cred.png"]),
            ("suffixes", ["ible.png", "able-ible.png"]),
        ],
        "sum": "in- + cred + -ible -> incredible",
        "parts": "not + believe / trust + able to be",
        "bridge": "literally, not able to be believed; often, amazingly good or surprising",
        "definition": "so amazing or surprising that it is hard to believe.",
        "context": "The huge castle surrounded by rainbows looked incredible.",
        "family": "credible · incredible · credibility",
    },
    {
        "word": "DISTRACTION",
        "meaning_keys": ["distraction", "distracted", "distract"],
        "tiles": [
            ("prefixes", ["dis.png"]),
            ("roots", ["tract.png"]),
            ("suffixes", ["ion.png"]),
        ],
        "sum": "dis- + tract + -ion -> distraction",
        "parts": "apart / away + pull / draw + act / process / result",
        "bridge": "the act of pulling attention away",
        "definition": "something that pulls your attention away from what you are doing.",
        "context": "The ringing phone was a distraction while he was studying.",
        "family": "distract · distracted · distracting · distraction",
    },
    {
        "word": "TENABLE",
        "meaning_keys": ["tenable"],
        "tiles": [
            ("roots", ["ten.png"]),
            ("suffixes", ["able.png", "able-ible.png"]),
        ],
        "sum": "ten + -able -> tenable",
        "parts": "hold + able to be",
        "bridge": "able to hold up when questioned or challenged",
        "definition": "able to be supported or defended with good reasons or evidence.",
        "context": "After checking the evidence, her claim was still tenable.",
        "family": "tenable · untenable · tenability",
    },
    {
        "word": "SEQUENCE",
        "meaning_keys": ["sequence", "sequencing"],
        "tiles": [
            ("roots", ["sequ.png"]),
            ("suffixes", ["ence.png", "ance-ence.png"]),
        ],
        "sum": "sequ + -ence -> sequence",
        "parts": "follow + state / result",
        "bridge": "things that follow one another in order",
        "definition": "a set of things that follow one another in a particular order.",
        "context": "The pictures show the sequence from seed to sprout to plant to flower.",
        "family": "sequence · sequential · sequencing",
    },
    {
        "word": "VOCALIZE",
        "meaning_keys": ["vocalize", "vocalise", "vocal"],
        "tiles": [
            ("roots", ["voc.png"]),
            ("suffixes", ["al.png"]),
            ("suffixes", ["ize.png"]),
        ],
        "sum": "voc + -al + -ize -> vocalize",
        "parts": "voice / call + relating to + make / become",
        "bridge": "make an idea vocal - say it aloud",
        "definition": "to say or express something aloud with your voice.",
        "context": "He thought of an apple, then vocalized the word \"apple.\"",
        "family": "vocal · vocalize · vocalization",
    },
    {
        "word": "INTERJECTION",
        "meaning_keys": ["interjection", "ouch"],
        "tiles": [
            ("prefixes", ["inter.png"]),
            ("roots", ["ject.png"]),
            ("suffixes", ["ion.png"]),
        ],
        "sum": "inter- + ject + -ion -> interjection",
        "parts": "between + throw + act / result",
        "bridge": "historically, something thrown into speech",
        "definition": "a word or short expression that shows a feeling or reaction.",
        "context": "\"Ouch!\" is an interjection that shows pain.",
        "family": "interject · interjection · interjected",
    },
    {
        "word": "SUBMISSION",
        "meaning_keys": ["submission", "submissions", "submit"],
        "tiles": [
            ("prefixes", ["sub.png"]),
            ("roots", ["miss.png", "mit-miss.png", "mit.png"]),
            ("suffixes", ["ion.png"]),
        ],
        "sum": "sub- + mit/miss + -ion -> submission",
        "parts": "under / below + send + act / result",
        "bridge": "something sent in or handed in for review",
        "definition": "something handed in or sent in for review, approval, or consideration.",
        "context": "Her finished project was a submission for review.",
        "family": "submit · submitted · submission",
    },
    {
        "word": "REFERENCE",
        "meaning_keys": ["reference", "referencing", "refer"],
        "tiles": [
            ("prefixes", ["re.png"]),
            ("roots", ["fer.png"]),
            ("suffixes", ["ence.png", "ance-ence.png"]),
        ],
        "sum": "re- + fer + -ence -> reference",
        "parts": "back / again + carry / bear + state / result",
        "bridge": "something you go back to for information",
        "definition": "a source you look back to for information.",
        "context": "He used the atlas as a reference while writing his report.",
        "family": "refer · reference · referencing",
    },
    {
        "word": "INVERSION",
        "meaning_keys": ["inversion", "invert", "inverted"],
        "tiles": [
            ("prefixes", ["in-im-01.png", "in-in.png", "in.png"]),
            ("roots", ["vert.png", "vert-vers.png", "vers.png"]),
            ("suffixes", ["ion.png"]),
        ],
        "sum": "in- + vert/vers + -ion -> inversion",
        "parts": "in / into + turn + act / process / result",
        "bridge": "the act of turning something into the opposite position or order",
        "definition": "a reversal in order, position, or direction; something turned upside down.",
        "context": "Turning the flowerpot upside down created an inversion of its normal position.",
        "family": "invert · inverted · inversion",
    },
    {
        "word": "ADMITTANCE",
        "meaning_keys": ["admittance"],
        "tiles": [
            ("prefixes", ["ad.png"]),
            ("roots", ["mit.png"]),
            ("suffixes", ["ance.png", "ance-ence.png"]),
        ],
        "sum": "ad- + mit + -ance -> admittance",
        "parts": "to / toward + send + act / state / result",
        "bridge": "the act or state of being let in",
        "definition": "permission or the right to enter.",
        "context": "The ticket gave her admittance to the museum.",
        "family": "admit · admittance",
    },
    {
        "word": "PREVALENT",
        "meaning_keys": ["prevalent"],
        "tiles": [
            ("prefixes", ["pre.png"]),
            ("roots", ["val.png"]),
            ("suffixes", ["ent.png"]),
        ],
        "sum": "pre- + val + -ent -> prevalent",
        "parts": "before / in front + be strong / have power + being / having the quality of",
        "bridge": "being stronger or having greater power",
        "definition": "common or happening often; widespread.",
        "context": "Blue backpacks were prevalent in the class; most students had one.",
        "family": "prevail · prevalent · prevalence",
    },
]


def need(path: Path, label: str):
    if not path.exists():
        print(f"\nERROR: missing {label}:\n  {path}")
        sys.exit(2)


def find_meaning_image(keys: List[str]) -> Path:
    files = []
    for pattern in ("*.png", "*.PNG", "*.jpg", "*.JPG", "*.jpeg", "*.JPEG", "*.webp", "*.WEBP"):
        files.extend(MEANING_DIR.glob(pattern))

    lower_map = [(p, p.stem.lower()) for p in files]

    for key in keys:
        for p, stem in lower_map:
            if stem == key.lower():
                return p
    for key in keys:
        for p, stem in lower_map:
            if key.lower() in stem:
                return p

    raise FileNotFoundError(
        f"No meaning image found in {MEANING_DIR} for: {', '.join(keys)}"
    )


def find_asset(kind: str, candidates: List[str]) -> Path:
    base = {"prefixes": PREFIX_DIR, "roots": ROOT_DIR, "suffixes": SUFFIX_DIR}[kind]
    for name in candidates:
        p = base / name
        if p.exists():
            return p
    raise FileNotFoundError(
        f"Missing {kind} tile. Tried {', '.join(candidates)} in {base}"
    )


def dims(path: Path) -> Tuple[int, int]:
    with Image.open(path) as im:
        return im.size


def crop_meaning(src: Path, dest: Path) -> Path:
    """Trim transparent or near-white outer margins so the scene fills the image box."""
    im = Image.open(src).convert("RGBA")
    alpha = im.getchannel("A")
    box = alpha.getbbox()

    if not box or box == (0, 0, im.width, im.height):
        rgb = im.convert("RGB")
        bg = Image.new("RGB", rgb.size, "white")
        diff = ImageChops.difference(rgb, bg).convert("L")
        diff = diff.point(lambda p: 255 if p > 18 else 0)
        box = diff.getbbox()

    if box:
        l, t, r, b = box
        pad = 12
        l = max(0, l - pad)
        t = max(0, t - pad)
        r = min(im.width, r + pad)
        b = min(im.height, b + pad)
        im = im.crop((l, t, r, b))

    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest)
    return dest


def draw_fit(c, path: Path, x: float, y: float, w: float, h: float):
    iw, ih = dims(path)
    scale = min(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    c.drawImage(
        ImageReader(str(path)),
        x + (w - dw) / 2,
        y + (h - dh) / 2,
        dw,
        dh,
        preserveAspectRatio=True,
        mask="auto",
    )


def rbox(c, x, y, w, h, fill, stroke, radius=13, lw=1.0):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(lw)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)


def wrap_lines(text: str, font: str, size: float, maxw: float) -> List[str]:
    words = text.split()
    out, cur = [], ""
    for word in words:
        test = word if not cur else cur + " " + word
        if stringWidth(test, font, size) <= maxw:
            cur = test
        else:
            if cur:
                out.append(cur)
            cur = word
    if cur:
        out.append(cur)
    return out


def fit_font(text, font, max_size, min_size, maxw, max_lines=1):
    size = max_size
    while size >= min_size:
        if len(wrap_lines(text, font, size, maxw)) <= max_lines:
            return size
        size -= 0.25
    return min_size


def draw_wrapped(c, text, x, y, maxw, font="Helvetica", size=12, leading=None, color=INK, max_lines=None):
    if leading is None:
        leading = size * 1.2
    lines = wrap_lines(text, font, size, maxw)
    if max_lines:
        lines = lines[:max_lines]
    c.setFont(font, size)
    c.setFillColor(color)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


# Draw vector arrows so the page never exposes ASCII "->".
def arrowed_width(text, font, size, arrow_w=18, gap=6):
    parts = [p.strip() for p in text.split("->")]
    if len(parts) == 1:
        return stringWidth(text, font, size)
    return sum(stringWidth(p, font, size) for p in parts) + (len(parts) - 1) * (arrow_w + 2 * gap)


def fit_arrow_font(text, font, max_size, min_size, maxw):
    size = max_size
    while size >= min_size:
        if arrowed_width(text, font, size) <= maxw:
            return size
        size -= 0.25
    return min_size


def draw_vector_arrow(c, x1, y, x2, color=INK, lw=1.7, head=4.2):
    c.setStrokeColor(color)
    c.setLineWidth(lw)
    c.line(x1, y, x2, y)
    c.line(x2, y, x2 - head, y + head * 0.72)
    c.line(x2, y, x2 - head, y - head * 0.72)


def draw_arrowed_line(c, text, y, font, size, color, center_x=None, left_x=None, arrow_w=18, gap=6):
    parts = [p.strip() for p in text.split("->")]
    total = arrowed_width(text, font, size, arrow_w, gap)
    if center_x is not None:
        x = center_x - total / 2
    elif left_x is not None:
        x = left_x
    else:
        raise ValueError("center_x or left_x required")

    c.setFillColor(color)
    c.setFont(font, size)
    for i, part in enumerate(parts):
        c.drawString(x, y, part)
        x += stringWidth(part, font, size)
        if i < len(parts) - 1:
            x += gap
            ay = y + size * 0.34
            draw_vector_arrow(c, x, ay, x + arrow_w, color=color, lw=max(1.35, size * 0.10), head=max(3.5, size * 0.25))
            x += arrow_w + gap


def footer(c):
    fy = 34
    left = "First Volo Learning"
    right = "firstvololearning.com"
    fs = 9.3
    c.setFont("Helvetica", fs)
    lw = stringWidth(left, "Helvetica", fs)
    rw = stringWidth(right, "Helvetica", fs)
    gap = 11
    total = lw + rw + gap * 2 + 1
    x = (W - total) / 2
    c.setFillColor(NAVY)
    c.drawString(x, fy, left)
    rx = x + lw + gap
    c.setStrokeColor(HexColor("#8DA6BC"))
    c.setLineWidth(0.8)
    c.line(rx, fy - 2, rx, fy + 9)
    c.setFillColor(NAVY)
    c.drawString(rx + gap, fy, right)


def build(spec: dict) -> Path:
    word = spec["word"]
    meaning_src = find_meaning_image(spec["meaning_keys"])
    meaning_dest = CROPPED_DIR / f"{word.lower()}.png"
    meaning = crop_meaning(meaning_src, meaning_dest)
    tiles = [find_asset(kind, candidates) for kind, candidates in spec["tiles"]]

    out = OUTDIR / f"Flight-C-Waypoint-{word}.pdf"
    c = canvas.Canvas(str(out), pagesize=letter)
    c.setTitle(f"Flight C Waypoint Word - {word.title()}")
    c.setAuthor("First Volo Learning")

    c.setFillColor(white)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    c.setStrokeColor(BORDER)
    c.setLineWidth(3)
    c.roundRect(18, 18, W - 36, H - 36, 18, fill=0, stroke=1)

    # Header
    draw_fit(c, LOGO, 34, H - 84, 88, 52)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 17)
    c.drawRightString(W - 34, H - 51, "FLIGHT C · WAYPOINT WORD")

    title_size = 31
    if len(word) > 12:
        title_size = 27
    if len(word) > 15:
        title_size = 24
    c.setFont("Helvetica-Bold", title_size)
    c.drawCentredString(W / 2, H - 108, word)

    # Tile row
    n = len(tiles)
    if n == 2:
        tile, gap, ty = 112, 42, H - 232
    else:
        tile, gap, ty = 102, 24, H - 242
    roww = tile * n + gap * (n - 1)
    sx = (W - roww) / 2

    for i, path in enumerate(tiles):
        x = sx + i * (tile + gap)
        rbox(c, x - 4, ty - 4, tile + 8, tile + 8, white, HexColor("#D9E1E8"), 12, 0.8)
        draw_fit(c, path, x, ty, tile, tile)
        if i < n - 1:
            c.setFillColor(NAVY)
            c.setFont("Helvetica-Bold", 25)
            c.drawCentredString(x + tile + gap / 2, ty + tile / 2 - 8, "+")

    # Word sum
    sum_y = ty - 52
    rbox(c, 70, sum_y, W - 140, 38, LIGHT_BLUE, SOFT_BLUE, 11, 1)
    fs = fit_arrow_font(spec["sum"], "Helvetica-Bold", 16.5, 12.5, W - 180)
    draw_arrowed_line(c, spec["sum"], sum_y + 12, "Helvetica-Bold", fs, NAVY, center_x=W / 2)

    # Meaning image
    img_y = sum_y - 151
    img_h = 130
    rbox(c, 70, img_y, W - 140, img_h, white, HexColor("#D8E1E8"), 14, 1)
    draw_fit(c, meaning, 84, img_y + 8, W - 168, img_h - 16)

    # Meaning from the parts: label, literal line, bridge line
    parts_y = img_y - 88
    parts_h = 76
    rbox(c, 70, parts_y, W - 140, parts_h, LIGHT_GREEN, SOFT_GREEN, 13, 1)
    c.setFillColor(GREEN)
    c.setFont("Helvetica-Bold", 11.5)
    c.drawString(86, parts_y + 53, "MEANING FROM THE PARTS")

    lit_size = fit_font(spec["parts"], "Helvetica-Bold", 13.3, 9.8, W - 172, 1)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", lit_size)
    c.drawString(86, parts_y + 31, spec["parts"])

    bridge = spec["bridge"]
    arrow_x1, arrow_x2, text_x = 86, 102, 111
    br_size = fit_font(bridge, "Helvetica-Oblique", 11.5, 8.7, W - text_x - 86, 1)
    c.setFillColor(GREEN)
    c.setFont("Helvetica-Oblique", br_size)
    draw_vector_arrow(c, arrow_x1, parts_y + 16, arrow_x2, color=GREEN, lw=1.55, head=4.0)
    c.drawString(text_x, parts_y + 12, bridge)

    # Whole-word meaning
    means_y = parts_y - 73
    means_h = 59
    rbox(c, 70, means_y, W - 140, means_h, LIGHT_BLUE, SOFT_BLUE, 13, 1)
    c.setFillColor(BLUE)
    c.setFont("Helvetica-Bold", 11.5)
    c.drawString(86, means_y + 38, "THE WORD MEANS")

    def_size = fit_font(spec["definition"], "Helvetica-Bold", 12.3, 9.8, W - 172, 2)
    draw_wrapped(c, spec["definition"], 86, means_y + 17, W - 172,
                 font="Helvetica-Bold", size=def_size, leading=13.0, color=INK, max_lines=2)

    # Context + family
    bottom_y = means_y - 85
    lx, gap2, lw = 70, 14, 292
    rx = lx + lw + gap2
    rw = W - 70 - rx

    rbox(c, lx, bottom_y, lw, 71, LIGHT_ORANGE, SOFT_ORANGE, 13, 1)
    c.setFillColor(ORANGE)
    c.setFont("Helvetica-Bold", 11.5)
    c.drawString(lx + 16, bottom_y + 48, "IN CONTEXT")
    ctx_size = fit_font(spec["context"], "Helvetica", 11.3, 8.8, lw - 32, 3)
    draw_wrapped(c, spec["context"], lx + 16, bottom_y + 27, lw - 32,
                 font="Helvetica", size=ctx_size, leading=12.5, color=INK, max_lines=3)

    rbox(c, rx, bottom_y, rw, 71, LIGHT_PURPLE, SOFT_PURPLE, 13, 1)
    c.setFillColor(PURPLE)
    c.setFont("Helvetica-Bold", 11.5)
    c.drawString(rx + 16, bottom_y + 48, "WORD FAMILY")
    fam_size = fit_font(spec["family"], "Helvetica-Bold", 10.8, 8.8, rw - 32, 3)
    draw_wrapped(c, spec["family"], rx + 16, bottom_y + 27, rw - 32,
                 font="Helvetica-Bold", size=fam_size, leading=12.5, color=INK, max_lines=3)

    footer(c)
    c.showPage()
    c.save()
    return out


def main():
    for path, label in [
        (REPO, "Morphology repo"),
        (LOGO, "First Volo logo"),
        (PREFIX_DIR, "prefix tile folder"),
        (ROOT_DIR, "root tile folder"),
        (SUFFIX_DIR, "suffix tile folder"),
        (MEANING_DIR, "Flight C meaning-image folder"),
    ]:
        need(path, label)

    OUTDIR.mkdir(parents=True, exist_ok=True)
    CROPPED_DIR.mkdir(parents=True, exist_ok=True)

    # Remove only stale Flight C PDFs from this generated output folder.
    for old in OUTDIR.glob("Flight-C-Waypoint-*.pdf"):
        old.unlink()

    built, errors = [], []
    print("Building Flight C Waypoint PDFs...")
    for spec in WORDS:
        try:
            out = build(spec)
            built.append(out)
            print(f"✓ {spec['word']}")
        except Exception as exc:
            errors.append((spec["word"], str(exc)))
            print(f"✗ {spec['word']}: {exc}")

    if errors:
        print("\nNEEDS ATTENTION:")
        for word, msg in errors:
            print(f"  {word}: {msg}")
        print("\nNo packet/ZIP was finalized because one or more pages are missing inputs.")
        sys.exit(1)

    packet = FLIGHT_DIR / "Flight-C-Waypoints-review-packet.pdf"
    if fitz:
        if packet.exists():
            packet.unlink()
        merged = fitz.open()
        for p in built:
            doc = fitz.open(p)
            merged.insert_pdf(doc)
            doc.close()
        merged.save(packet, garbage=4, deflate=True)
        merged.close()
    else:
        packet = None

    zip_path = FLIGHT_DIR / "Flight-C-Waypoint-PDFs.zip"
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for p in built:
            z.write(p, arcname=p.name)

    print("\nDONE")
    print(f"Individual PDFs: {OUTDIR}")
    if packet:
        print(f"Review packet:    {packet}")
    print(f"ZIP:              {zip_path}")
    print("\nOpen them with:")
    print(f'  open "{OUTDIR}"')
    if packet:
        print(f'  open "{packet}"')


if __name__ == "__main__":
    main()
