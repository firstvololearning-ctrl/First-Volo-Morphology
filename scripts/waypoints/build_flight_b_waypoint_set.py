#!/usr/bin/env python3
"""
Build the full Flight B Waypoint PDF set using REAL local Morpho assets.

Inputs expected on the user's Mac:
  Repo:
    ~/Documents/First Volo Learning/Digital Products/First Volo Morphology
      images/logo/logo.png
      images/prefixes/
      images/roots/
      images/suffixes/

  Meaning images:
    ~/Documents/word-meanings/
      one PNG/JPG/WEBP per Flight B word
      recommended filenames contain:
        invisible, instruction, interaction, conformity, transportation,
        eruption, prospective, predictive, description, geographic,
        microscopic, thermal

Output:
  <repo>/waypoints/flight-b/*.pdf
"""

from pathlib import Path
import sys
from typing import List, Tuple

from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth

HOME = Path.home()
REPO = HOME / "Documents" / "First Volo Learning" / "Digital Products" / "First Volo Morphology"
MEANING_DIR = HOME / "Documents" / "word-meanings"
OUTDIR = REPO / "waypoints" / "flight-b"

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
GRAY = HexColor("#6B7A89")
BORDER = HexColor("#0D5AA7")

W, H = letter

# ---------- CONFIG ----------
# Each tile = (kind, display label, short meaning, candidate filenames)
# kind must be one of: prefixes, roots, suffixes
WORDS = [
    {
        "flight": "B",
        "word": "Invisible",
        "meaning_keys": ["invisible"],
        "tiles": [
            ("prefixes", "in-", "not", ["in.png", "im.png", "in-not.png"]),
            ("roots", "vis", "see", ["vis.png", "vid-vis.png", "vis-vid.png"]),
            ("suffixes", "-ible", "able to be", ["ible.png", "able-ible.png", "able_ible.png"]),
        ],
        "word_sum": "in- + vis + -ible → invisible",
        "parts": "not + see + able to be",
        "bridge": "not able to be seen",
        "definition": "unable to be seen; not visible.",
        "context": "The special ink was invisible until the paper was heated.",
        "family": "visible · invisible · visibility · visibly",
    },
    {
        "flight": "B",
        "word": "Instruction",
        "meaning_keys": ["instruction"],
        "tiles": [
            ("prefixes", "in-", "in / into", ["in.png", "im.png", "in-into.png"]),
            ("roots", "struct", "build", ["struct.png"]),
            ("suffixes", "-ion", "act / process", ["ion.png", "tion.png", "sion.png"]),
        ],
        "word_sum": "in- + struct + -ion → instruction",
        "parts": "in / into + build + act / process",
        "bridge": "a process of building understanding or giving directions",
        "definition": "teaching or directions about what to do.",
        "context": "The teacher gave clear instruction before the activity started.",
        "family": "structure · instruct · instruction · instructor",
    },
    {
        "flight": "B",
        "word": "Interaction",
        "meaning_keys": ["interaction"],
        "tiles": [
            ("prefixes", "inter-", "between", ["inter.png"]),
            ("roots", "act", "do / act", ["act.png"]),
            ("suffixes", "-ion", "act / process", ["ion.png", "tion.png", "sion.png"]),
        ],
        "word_sum": "inter- + act + -ion → interaction",
        "parts": "between + do / act + act / process",
        "bridge": "an act or process happening between people or things",
        "definition": "communication or action between people or things.",
        "context": "The game encouraged interaction among the students.",
        "family": "act · interact · interaction · interactive",
    },
    {
        "flight": "B",
        "word": "Conformity",
        "meaning_keys": ["conformity"],
        "tiles": [
            ("prefixes", "con-", "together / with", ["con.png", "com.png"]),
            ("roots", "form", "shape / form", ["form.png"]),
            ("suffixes", "-ity", "state / quality", ["ity.png"]),
        ],
        "word_sum": "con- + form + -ity → conformity",
        "parts": "together / with + form + state / quality",
        "bridge": "a state of taking the same form or pattern",
        "definition": "following the behavior, rules, or expectations of a group.",
        "context": "The students showed conformity by following the same dress code.",
        "family": "form · conform · conformity · reform · transform",
    },
    {
        "flight": "B",
        "word": "Transportation",
        "meaning_keys": ["transportation", "transport"],
        "tiles": [
            ("prefixes", "trans-", "across", ["trans.png"]),
            ("roots", "port", "carry", ["port.png"]),
            ("suffixes", "-ation", "act / process", ["ation.png", "ion.png", "tion.png"]),
        ],
        "word_sum": "trans- + port + -ation → transportation",
        "parts": "across + carry + act / process",
        "bridge": "the process of carrying across",
        "definition": "the movement of people or things from one place to another.",
        "context": "Buses and trains are forms of public transportation.",
        "family": "transport · transportation · import · export",
    },
    {
        "flight": "B",
        "word": "Eruption",
        "meaning_keys": ["eruption", "erupt"],
        "tiles": [
            ("prefixes", "e-/ex-", "out", ["e-ex.png", "ex.png", "e.png"]),
            ("roots", "rupt", "break", ["rupt.png"]),
            ("suffixes", "-ion", "act / process", ["ion.png", "tion.png", "sion.png"]),
        ],
        "word_sum": "e-/ex- + rupt + -ion → eruption",
        "parts": "out + break + act / process",
        "bridge": "a breaking out",
        "definition": "a sudden bursting out, such as lava from a volcano.",
        "context": "The eruption sent ash and lava into the air.",
        "family": "erupt · eruption · rupture · disrupt",
    },
    {
        "flight": "B",
        "word": "Prospective",
        "meaning_keys": ["prospective"],
        "tiles": [
            ("prefixes", "pro-", "forward", ["pro.png"]),
            ("roots", "spect", "look / see", ["spect.png"]),
            ("suffixes", "-ive", "relating to", ["ive.png"]),
        ],
        "word_sum": "pro- + spect + -ive → prospective",
        "parts": "forward + look / see + relating to",
        "bridge": "looking ahead to what may happen or become true",
        "definition": "expected or likely in the future; possible as a future choice or member.",
        "context": "The prospective student compared several college flyers.",
        "family": "inspect · spectator · prospect · prospective",
    },
    {
        "flight": "B",
        "word": "Predictive",
        "meaning_keys": ["predictive", "predict"],
        "tiles": [
            ("prefixes", "pre-", "before", ["pre.png"]),
            ("roots", "dict", "say / tell", ["dict.png", "dic-dict.png"]),
            ("suffixes", "-ive", "relating to", ["ive.png"]),
        ],
        "word_sum": "pre- + dict + -ive → predictive",
        "parts": "before + say / tell + relating to",
        "bridge": "relating to telling what will happen beforehand",
        "definition": "helping to tell or show what will happen before it happens.",
        "context": "Dark clouds can be a predictive sign of rain.",
        "family": "dictate · predict · prediction · predictive",
    },
    {
        "flight": "B",
        "word": "Description",
        "meaning_keys": ["description", "describe"],
        "tiles": [
            ("prefixes", "de-", "down / about", ["de.png"]),
            ("roots", "script", "write", ["script.png", "scrib-script.png", "scrib.png"]),
            ("suffixes", "-ion", "act / process", ["ion.png", "tion.png", "sion.png"]),
        ],
        "word_sum": "de- + script + -ion → description",
        "parts": "down / about + write + act / process",
        "bridge": "the process of writing down details about something",
        "definition": "a spoken or written account of what something is like.",
        "context": "Her description of the tree included its size, color, and shape.",
        "family": "scribe · script · describe · description",
    },
    {
        "flight": "B",
        "word": "Geographic",
        "meaning_keys": ["geographic", "geography"],
        "tiles": [
            ("roots", "geo", "earth", ["geo.png"]),
            ("roots", "graph", "write / draw", ["graph.png"]),
            ("suffixes", "-ic", "relating to", ["ic.png"]),
        ],
        "word_sum": "geo + graph + -ic → geographic",
        "parts": "earth + write / draw + relating to",
        "bridge": "relating to describing or mapping the Earth",
        "definition": "relating to places, the Earth, and their features.",
        "context": "The atlas showed important geographic features of Italy.",
        "family": "geography · geographic · geographer",
    },
    {
        "flight": "B",
        "word": "Microscopic",
        "meaning_keys": ["microscopic", "microscope"],
        "tiles": [
            ("roots", "micro", "small", ["micro.png"]),
            ("roots", "scop", "look / view", ["scop.png", "scope.png"]),
            ("suffixes", "-ic", "relating to", ["ic.png"]),
        ],
        "word_sum": "micro + scop + -ic → microscopic",
        "parts": "small + look / view + relating to",
        "bridge": "relating to viewing very small things",
        "definition": "so small that it must be viewed with a microscope.",
        "context": "The students examined microscopic organisms in science class.",
        "family": "scope · microscope · microscopic",
    },
    {
        "flight": "B",
        "word": "Thermal",
        "meaning_keys": ["thermal", "therm"],
        "tiles": [
            ("roots", "therm", "heat", ["therm.png"]),
            ("suffixes", "-al", "relating to", ["al.png"]),
        ],
        "word_sum": "therm + -al → thermal",
        "parts": "heat + relating to",
        "bridge": "relating to heat",
        "definition": "related to heat or temperature.",
        "context": "A thermal camera can show warm and cool areas.",
        "family": "therm · thermal · thermometer · geothermal",
    },
]

# ---------- HELPERS ----------
def need(path: Path, label: str):
    if not path.exists():
        print(f"\nMISSING {label}:\n  {path}")
        sys.exit(2)

def find_meaning_image(keys: List[str]) -> Path:
    if not MEANING_DIR.exists():
        print(f"\nMISSING word-meanings folder:\n  {MEANING_DIR}")
        sys.exit(2)

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
        f"Could not find a meaning image in {MEANING_DIR} matching any of: {', '.join(keys)}"
    )

def find_asset(kind: str, candidates: List[str]) -> Path:
    base = {"prefixes": PREFIX_DIR, "roots": ROOT_DIR, "suffixes": SUFFIX_DIR}[kind]
    exts = ["", ".png", ".PNG", ".webp", ".WEBP", ".jpg", ".JPG", ".jpeg", ".JPEG"]
    for cand in candidates:
        for ext in exts:
            p = base / (cand if cand.lower().endswith((".png", ".webp", ".jpg", ".jpeg")) else cand + ext)
            if p.exists():
                return p
    raise FileNotFoundError(
        f"Missing {kind} asset. Tried: {', '.join(candidates)} in {base}"
    )

def img_size(path: Path) -> Tuple[int, int]:
    with Image.open(path) as im:
        return im.size

def draw_fit(c, path: Path, x, y, w, h):
    iw, ih = img_size(path)
    scale = min(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    dx = x + (w - dw) / 2
    dy = y + (h - dh) / 2
    c.drawImage(ImageReader(str(path)), dx, dy, dw, dh, preserveAspectRatio=True, mask="auto")

def round_box(c, x, y, w, h, fill, stroke, radius=13, lw=1.1):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(lw)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)

def wrap_lines(text: str, font: str, size: float, maxw: float) -> List[str]:
    words = text.split()
    lines = []
    cur = ""
    for word in words:
        test = word if not cur else cur + " " + word
        if stringWidth(test, font, size) <= maxw:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines

def draw_wrapped(c, text: str, x: float, y_top: float, maxw: float, font="Helvetica",
                 size=12, leading=15, color=INK):
    c.setFont(font, size)
    c.setFillColor(color)
    y = y_top
    for ln in wrap_lines(text, font, size, maxw):
        c.drawString(x, y, ln)
        y -= leading
    return y

def footer(c):
    footer_y = 34
    left = "First Volo Learning"
    right = "firstvololearning.com"
    fs = 9.3
    c.setFont("Helvetica", fs)
    lw = stringWidth(left, "Helvetica", fs)
    rw = stringWidth(right, "Helvetica", fs)
    rule_gap = 11
    total = lw + rw + rule_gap * 2 + 1
    fx = (W - total) / 2
    c.setFillColor(NAVY)
    c.drawString(fx, footer_y, left)
    rule_x = fx + lw + rule_gap
    c.setStrokeColor(HexColor("#8DA6BC"))
    c.setLineWidth(0.8)
    c.line(rule_x, footer_y - 2, rule_x, footer_y + 9)
    c.setFillColor(NAVY)
    c.drawString(rule_x + rule_gap, footer_y, right)

def build_word_page(spec: dict):
    flight = spec["flight"]
    word = spec["word"]
    meaning_path = find_meaning_image(spec["meaning_keys"])
    tile_info = []
    for kind, label, gloss, candidates in spec["tiles"]:
        tile_info.append((find_asset(kind, candidates), label, gloss))

    out = OUTDIR / f"Flight-{flight}-Waypoint-{word.upper()}.pdf"

    c = canvas.Canvas(str(out), pagesize=letter)
    c.setTitle(f"Flight {flight} Waypoint Word - {word}")
    c.setAuthor("First Volo Learning")

    # White paper
    c.setFillColor(white)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Outer border
    c.setStrokeColor(BORDER)
    c.setLineWidth(3)
    c.roundRect(18, 18, W - 36, H - 36, 18, fill=0, stroke=1)

    # Header
    draw_fit(c, LOGO, 34, H - 84, 88, 52)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 17)
    c.drawRightString(W - 34, H - 51, f"FLIGHT {flight} · WAYPOINT WORD")
    c.setFont("Helvetica-Bold", 30 if len(word) > 12 else 32)
    c.drawCentredString(W / 2, H - 108, word.upper())

    # Tile row
    n = len(tile_info)
    tile = 103 if n == 3 else 112
    gap = 24 if n == 3 else 36
    row_w = tile * n + gap * (n - 1)
    sx = (W - row_w) / 2
    ty = H - 245 if n == 3 else H - 233

    plus_size = 25
    for i, (path, label, gloss) in enumerate(tile_info):
        x = sx + i * (tile + gap)
        round_box(c, x - 4, ty - 4, tile + 8, tile + 8, white, HexColor("#D9E1E8"), 12, 0.8)
        draw_fit(c, path, x, ty, tile, tile)
        if i < n - 1:
            c.setFillColor(NAVY)
            c.setFont("Helvetica-Bold", plus_size)
            c.drawCentredString(x + tile + gap / 2, ty + tile / 2 - 8, "+")

    # Word sum
    sum_y = ty - 54
    round_box(c, 68, sum_y, W - 136, 38, LIGHT_BLUE, SOFT_BLUE, 11, 1)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 16 if len(spec["word_sum"]) > 36 else 16.5)
    c.drawCentredString(W / 2, sum_y + 12, spec["word_sum"])

    # Meaning image
    img_y = sum_y - 167
    img_h = 148
    round_box(c, 63, img_y, W - 126, img_h, white, HexColor("#D8E1E8"), 14, 1)
    draw_fit(c, meaning_path, 73, img_y + 9, W - 146, img_h - 18)

    # Meaning from the parts
    parts_y = img_y - 88
    round_box(c, 63, parts_y, W - 126, 72, LIGHT_GREEN, SOFT_GREEN, 13, 1)
    c.setFillColor(GREEN)
    c.setFont("Helvetica-Bold", 11.5)
    c.drawString(79, parts_y + 49, "MEANING FROM THE PARTS")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(79, parts_y + 27, spec["parts"])
    c.setFillColor(GREEN)
    c.setFont("Helvetica-Oblique", 11.5)
    bridge = "→ " + spec["bridge"]
    # wrap bridge on right half if needed
    max_bridge_width = W - 250
    if stringWidth(bridge, "Helvetica-Oblique", 11.5) <= max_bridge_width:
        c.drawRightString(W - 79, parts_y + 27, bridge)
    else:
        draw_wrapped(c, bridge, 79, parts_y + 11, W - 158, font="Helvetica-Oblique", size=11.2, leading=13.5, color=GREEN)

    # Whole-word meaning
    means_y = parts_y - 78
    round_box(c, 63, means_y, W - 126, 62, LIGHT_BLUE, SOFT_BLUE, 13, 1)
    c.setFillColor(BLUE)
    c.setFont("Helvetica-Bold", 11.5)
    c.drawString(79, means_y + 40, "THE WORD MEANS")
    draw_wrapped(c, spec["definition"], 79, means_y + 18, W - 158, font="Helvetica-Bold", size=12.3, leading=14.5, color=INK)

    # Bottom row
    bottom_y = means_y - 90
    left_x = 63
    gap2 = 14
    left_w = 286
    right_x = left_x + left_w + gap2
    right_w = W - 63 - right_x

    round_box(c, left_x, bottom_y, left_w, 74, LIGHT_ORANGE, SOFT_ORANGE, 13, 1)
    c.setFillColor(ORANGE)
    c.setFont("Helvetica-Bold", 11.5)
    c.drawString(left_x + 16, bottom_y + 51, "IN CONTEXT")
    draw_wrapped(c, spec["context"], left_x + 16, bottom_y + 29, left_w - 32,
                 font="Helvetica", size=11.5, leading=14, color=INK)

    round_box(c, right_x, bottom_y, right_w, 74, LIGHT_PURPLE, SOFT_PURPLE, 13, 1)
    c.setFillColor(PURPLE)
    c.setFont("Helvetica-Bold", 11.5)
    c.drawString(right_x + 16, bottom_y + 51, "WORD FAMILY")
    draw_wrapped(c, spec["family"], right_x + 16, bottom_y + 29, right_w - 32,
                 font="Helvetica-Bold", size=11.1, leading=13.5, color=INK)

    footer(c)

    c.showPage()
    c.save()
    return out

def main():
    need(REPO, "Morphology repo")
    need(LOGO, "Morphology logo")
    need(PREFIX_DIR, "prefix folder")
    need(ROOT_DIR, "root folder")
    need(SUFFIX_DIR, "suffix folder")
    need(MEANING_DIR, "word-meanings folder")

    OUTDIR.mkdir(parents=True, exist_ok=True)

    print("Building Flight B Waypoint set...")
    built = []
    failures = []

    for spec in WORDS:
        try:
            out = build_word_page(spec)
            built.append(out)
            print(f"  ✓ {spec['word']} -> {out.name}")
        except Exception as e:
            failures.append((spec["word"], str(e)))
            print(f"  ✗ {spec['word']} -> {e}")

    print("\nOUTPUT FOLDER:")
    print(f"  {OUTDIR}")

    if built:
        print("\nBUILT FILES:")
        for p in built:
            print(f"  {p.name}")

    if failures:
        print("\nNEEDS ATTENTION:")
        for word, msg in failures:
            print(f"  {word}: {msg}")
        sys.exit(1)

    print("\nAll Flight B Waypoint PDFs built successfully.")
    print(f'Open the folder with:\n  open "{OUTDIR}"')

if __name__ == "__main__":
    main()
