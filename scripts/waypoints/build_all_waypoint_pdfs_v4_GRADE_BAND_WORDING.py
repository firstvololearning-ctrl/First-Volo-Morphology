#!/usr/bin/env python3
"""
FIRST VOLO MORPHOLOGY — REFRESH ALL WAYPOINT PDFs v4 — GRADE-BAND WORDING

PURPOSE
-------
Generate the complete Waypoint PDF set in the approved CONFORMITY pilot style:

  - sharp ORIGINAL full-resolution morpheme tiles
  - edge-connected black background removed from tile copies
  - whole word color-coded by word-part type
  - plus signs centered between tiles
  - literal meaning from the parts
  - dictionary meaning
  - in-context sentence
  - existing whole-word meaning visual
  - footer:
        First Volo Learning | firstvololearning.com

OUTPUT SAFETY
-------------
This script writes only the canonical generated Waypoint outputs under:
  waypoints/flight-a/
  waypoints/flight-b/
  waypoints/flight-c/

Repository source art and configuration are read-only inputs.

SOURCES
-------
Flight A:
  Reads the WORDS data from the current local Flight A builder under:
    scripts/waypoints/
  Reads meaning images from:
    waypoints/flight-a/images/

Flight B:
  Uses the approved current Flight B Waypoint content encoded below
  from the existing Flight-B-Waypoints-FIXED-review-packet.pdf.
  Reads whole-word visuals from:
    waypoints/flight-b/word-meanings/

Flight C:
  Reads the WORDS data from:
    scripts/waypoints/build_flight_c_waypoint_set.py
  Reads meaning images from:
    waypoints/flight-c/flight-c-word-meanings/

REQUIREMENTS
------------
  .pdfvenv/bin/python -m pip install reportlab pillow pymupdf

RUN ALL FLIGHTS
---------------
  .pdfvenv/bin/python scripts/waypoints/build_all_waypoint_pdfs_v4_GRADE_BAND_WORDING.py

RUN ONE FLIGHT
--------------
  .pdfvenv/bin/python scripts/waypoints/build_all_waypoint_pdfs_v4_GRADE_BAND_WORDING.py --flight B

OUTPUT
------
For each selected flight:
  flight-a/pdfs/Flight-A-Waypoint-<WORD>.pdf
  flight-a/Flight-A-Waypoints-review-packet.pdf
  flight-a/Flight-A-Waypoint-PDFs.zip

(and equivalent B/C folders)

No source art or configuration is changed.
"""

from pathlib import Path
from collections import deque
import argparse
import ast
import math
import re
import shutil
import sys
import zipfile

try:
    from PIL import Image, ImageDraw, ImageFont
    import fitz
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import landscape, letter
    from reportlab.lib.colors import HexColor
    from reportlab.lib.utils import ImageReader
    from reportlab.pdfbase.pdfmetrics import stringWidth
except ImportError as e:
    print("Missing Python package:", e)
    print("Run:")
    print("  .pdfvenv/bin/python -m pip install reportlab pillow pymupdf")
    sys.exit(2)


# ---------------------------------------------------------------------------
# PATHS
# ---------------------------------------------------------------------------

REPO = Path(__file__).resolve().parents[2]
OUT_ROOT = REPO / "waypoints"
CLEAN_TILE_CACHE = Path("/tmp") / "first-volo-waypoint-sharp-transparent-tiles"
GENERATED_BASE_CACHE = Path("/tmp") / "first-volo-waypoint-generated-base-tiles"

PREFIX_DIR = REPO / "images" / "prefixes"
ROOT_DIR = REPO / "images" / "roots"
SUFFIX_DIR = REPO / "images" / "suffixes"
BASE_WORD_DIR = REPO / "images" / "base-words"
# Canonical Flight A clay base-word tiles stored in the repository.
FLIGHT_A_REAL_BASE_DIR = REPO / "waypoints" / "flight-a" / "flight-a-bases"

A_MEANING_DIR = REPO / "waypoints" / "flight-a" / "images"
B_MEANING_DIR = REPO / "waypoints" / "flight-b" / "word-meanings"
C_MEANING_DIR = REPO / "waypoints" / "flight-c" / "flight-c-word-meanings"
POS_ICON_DIR = REPO / "waypoints" / "shared" / "pos-icons"

POS_BY_WORD = {
    "REWRITING": "verb",
    "DISCONNECTION": "noun",
    "PREVIEWS": "noun",
    "EMPOWERMENT": "noun",
    "UNEVENNESS": "noun",
    "OVERUSED": "adjective",
    "NONFICTION": "noun",
    "MISLEADING": "adjective",
    "SUBSOIL": "noun",
    "COUNTABLE": "adjective",
    "SUCCESSFULLY": "adverb",
    "CONFORMITY": "noun",
    "DESCRIPTION": "noun",
    "ERUPTION": "noun",
    "GEOGRAPHIC": "adjective",
    "INTERACTION": "noun",
    "MICROSCOPIC": "adjective",
    "PREDICTIVE": "adjective",
    "PROSPECTIVE": "adjective",
    "THERMAL": "adjective",
    "DEDUCTION": "noun",
    "INTERVENTION": "noun",
    "INCREDIBLE": "adjective",
    "DISTRACTION": "noun",
    "TENABLE": "adjective",
    "SEQUENCE": "noun",
    "VOCALIZE": "verb",
    "INTERJECTION": "noun",
    "SUBMISSION": "noun",
    "REFERENCE": "noun",
    "INVERSION": "noun",
    "ADMITTANCE": "noun",
    "PREVALENT": "adjective",
}

OLD_DIR_NAMES = {"prefixes old", "roots old", "suffixes old"}


# ---------------------------------------------------------------------------
# STYLE — APPROVED LANDSCAPE WAYPOINT MODEL
# ---------------------------------------------------------------------------

W, H = landscape(letter)

NAVY = HexColor("#173A63")
GREEN = HexColor("#4C963F")
BLUE = HexColor("#1F78C8")
PURPLE = HexColor("#7046B3")
GOLD = HexColor("#C98A16")
PALE_GREEN = HexColor("#F3F8EF")
GREEN_BORDER = HexColor("#B7D6A9")
PALE_BLUE = HexColor("#EFF6FC")
BLUE_BORDER = HexColor("#B9D7EB")
PALE_PURPLE = HexColor("#F6F1FB")
PURPLE_BORDER = HexColor("#D8C4EA")
LIGHT_RULE = HexColor("#D5E2EC")
INK = HexColor("#17324D")
FOOTER_GRAY = HexColor("#53697E")

KIND_COLORS = {
    "prefix": GREEN,
    "prefixes": GREEN,
    "root": BLUE,
    "roots": BLUE,
    "base": BLUE,
    "suffix": PURPLE,
    "suffixes": PURPLE,
}

BLACK_THRESHOLD = 52
FRINGE_THRESHOLD = 86


# ---------------------------------------------------------------------------
# CURRENT FLIGHT B CONTENT
# ---------------------------------------------------------------------------

FLIGHT_B_WORDS = [
    {
        "word": "CONFORMITY",
        "meaning_keys": ["conformity"],
        "tiles": [
            ("prefixes", ["con.png"]),
            ("roots", ["form.png"]),
            ("suffixes", ["ity.png"]),
        ],
        "sum": "con- + form + -ity -> conformity",
        "parts": "together / with + form + state / quality",
        "bridge": "a state of taking the same form or pattern",
        "definition": "following the behavior, rules, or expectations of a group.",
        "context": "The students showed conformity by following the same dress code.",
        "title_parts": [("Con", "prefixes"), ("form", "roots"), ("ity", "suffixes")],
    },
    {
        "word": "DESCRIPTION",
        "meaning_keys": ["description"],
        "tiles": [
            ("prefixes", ["de.png"]),
            ("roots", ["scrib-script.png"]),
            ("suffixes", ["ion.png"]),
        ],
        "sum": "de- + script + -ion -> description",
        "parts": "down / about + write + act / process",
        "bridge": "the process of writing down details about something",
        "definition": "a spoken or written account of what something is like.",
        "context": "Her description of the tree included its size, color, and shape.",
        "title_parts": [("De", "prefixes"), ("script", "roots"), ("ion", "suffixes")],
    },
    {
        "word": "ERUPTION",
        "meaning_keys": ["eruption"],
        "tiles": [
            ("prefixes", ["e-ex.png", "e.png", "ex.png"]),
            ("roots", ["rupt.png"]),
            ("suffixes", ["ion.png"]),
        ],
        "sum": "e-/ex- + rupt + -ion -> eruption",
        "parts": "out + break + act / process",
        "bridge": "a breaking out",
        "definition": "a sudden bursting out, such as lava from a volcano.",
        "context": "The eruption sent ash and lava into the air.",
        "title_parts": [("E", "prefixes"), ("rupt", "roots"), ("ion", "suffixes")],
    },
    {
        "word": "GEOGRAPHIC",
        "meaning_keys": ["geographic"],
        "tiles": [
            ("roots", ["geo.png"]),
            ("roots", ["graph.png"]),
            ("suffixes", ["ic.png"]),
        ],
        "sum": "geo + graph + -ic -> geographic",
        "parts": "earth + write / draw + relating to",
        "bridge": "relating to describing or mapping the Earth",
        "definition": "relating to places, the Earth, and their features.",
        "context": "The atlas showed important geographic features of Italy.",
        "title_parts": [("Geo", "roots"), ("graph", "roots"), ("ic", "suffixes")],
    },
    {
        "word": "INTERACTION",
        "meaning_keys": ["interaction"],
        "tiles": [
            ("prefixes", ["inter.png"]),
            ("roots", ["act.png"]),
            ("suffixes", ["ion.png"]),
        ],
        "sum": "inter- + act + -ion -> interaction",
        "parts": "between + do / act + act / process",
        "bridge": "an act or process happening between people or things",
        "definition": "communication or action between people or things.",
        "context": "The game encouraged interaction among the students.",
        "title_parts": [("Inter", "prefixes"), ("act", "roots"), ("ion", "suffixes")],
    },
    {
        "word": "MICROSCOPIC",
        "meaning_keys": ["microscopic"],
        "tiles": [
            ("roots", ["micro.png"]),
            ("roots", ["scop-scope.png", "scop.png"]),
            ("suffixes", ["ic.png"]),
        ],
        "sum": "micro + scop + -ic -> microscopic",
        "parts": "small + look / view + relating to",
        "bridge": "relating to viewing very small things",
        "definition": "so small that it must be viewed with a microscope.",
        "context": "The students examined microscopic organisms in science class.",
        "title_parts": [("Micro", "roots"), ("scop", "roots"), ("ic", "suffixes")],
    },
    {
        "word": "PREDICTIVE",
        "meaning_keys": ["predict", "predictive"],
        "tiles": [
            ("prefixes", ["pre.png"]),
            ("roots", ["dict.png"]),
            ("suffixes", ["ive.png"]),
        ],
        "sum": "pre- + dict + -ive -> predictive",
        "parts": "before + say / tell + relating to",
        "bridge": "relating to telling what will happen beforehand",
        "definition": "helping to tell or show what will happen before it happens.",
        "context": "Dark clouds can be a predictive sign of rain.",
        "title_parts": [("Pre", "prefixes"), ("dict", "roots"), ("ive", "suffixes")],
    },
    {
        "word": "PROSPECTIVE",
        "meaning_keys": ["prospective"],
        "tiles": [
            ("prefixes", ["pro.png"]),
            ("roots", ["spect.png"]),
            ("suffixes", ["ive.png"]),
        ],
        "sum": "pro- + spect + -ive -> prospective",
        "parts": "forward + look / see + relating to",
        "bridge": "looking ahead to what may happen or become true",
        "definition": "expected or likely in the future; possible as a future choice or member.",
        "context": "The prospective student compared several college flyers.",
        "title_parts": [("Pro", "prefixes"), ("spect", "roots"), ("ive", "suffixes")],
    },
    {
        "word": "THERMAL",
        "meaning_keys": ["thermal"],
        "tiles": [
            ("roots", ["therm.png"]),
            ("suffixes", ["al.png"]),
        ],
        "sum": "therm + -al -> thermal",
        "parts": "heat + relating to",
        "bridge": "relating to heat",
        "definition": "related to heat or temperature.",
        "context": "A thermal camera can show warm and cool areas.",
        "title_parts": [("Therm", "roots"), ("al", "suffixes")],
    },
]


# ---------------------------------------------------------------------------
# GENERIC HELPERS
# ---------------------------------------------------------------------------

def fail(msg):
    print("\nERROR:", msg)
    sys.exit(2)


def ensure_repo():
    if not REPO.exists():
        fail(f"Morphology repo not found:\n  {REPO}")


def is_old_path(path: Path) -> bool:
    return any(part.lower() in OLD_DIR_NAMES for part in path.parts)


def read_words_literal(script_path: Path):
    """Read WORDS = [...] from a Python file WITHOUT importing/executing it."""
    text = script_path.read_text(encoding="utf-8")
    tree = ast.parse(text, filename=str(script_path))
    for node in tree.body:
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id == "WORDS":
                    return ast.literal_eval(node.value)
    raise ValueError(f"No literal WORDS assignment found in {script_path}")


def find_flight_a_builder():
    folder = REPO / "scripts" / "waypoints"
    if not folder.exists():
        fail(f"Missing scripts/waypoints folder: {folder}")

    candidates = list(folder.glob("*flight*a*waypoint*.py")) + list(folder.glob("*Flight*A*Waypoint*.py"))
    candidates = list(dict.fromkeys(candidates))

    preferred_terms = ["REAL_CLAY_BASES", "COUNTABLE", "build_flight_a_waypoints"]
    scored = []
    for p in candidates:
        try:
            txt = p.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        if "WORDS" not in txt:
            continue
        score = sum(10 for term in preferred_terms if term.lower() in p.name.lower())
        score += int(p.stat().st_mtime)
        scored.append((score, p))

    if not scored:
        fail("Could not find a current Flight A builder containing WORDS in scripts/waypoints.")

    return max(scored, key=lambda item: item[0])[1]


def find_flight_c_builder():
    exact = REPO / "scripts" / "waypoints" / "build_flight_c_waypoint_set.py"
    if exact.exists():
        return exact

    candidates = list((REPO / "scripts" / "waypoints").glob("*flight*c*waypoint*.py"))
    candidates = [p for p in candidates if "WORDS" in p.read_text(encoding="utf-8", errors="ignore")]
    if not candidates:
        fail("Could not find Flight C Waypoint builder.")
    return max(candidates, key=lambda p: p.stat().st_mtime)


def resolve_asset(kind, candidates):
    folders = {
        "prefix": PREFIX_DIR,
        "prefixes": PREFIX_DIR,
        "root": ROOT_DIR,
        "roots": ROOT_DIR,
        "suffix": SUFFIX_DIR,
        "suffixes": SUFFIX_DIR,
        "base": BASE_WORD_DIR,
    }
    folder = folders[kind]

    if isinstance(candidates, str):
        candidates = [candidates]

    for item in candidates:
        name = item if item.lower().endswith(".png") else f"{item}.png"
        p = folder / name
        if p.exists() and not is_old_path(p):
            return p
    return None


def find_meaning_image(folder: Path, keys):
    """
    Find an existing whole-word meaning image robustly.

    Accepts keys either as stems ("rewriting") or filenames
    ("rewriting.png"). Searches the preferred meaning folder first,
    then the enclosing flight folder recursively as a safe fallback.

    This is read-only: it never changes source files.
    """
    if isinstance(keys, str):
        keys = [keys]

    if not folder.exists():
        raise FileNotFoundError(f"Meaning-image folder not found: {folder}")

    # Normalize both "rewriting" and "rewriting.png" to useful forms.
    normalized = []
    for raw in keys:
        raw = str(raw).strip()
        if not raw:
            continue
        p = Path(raw)
        normalized.append({
            "raw": raw.lower(),
            "name": p.name.lower(),
            "stem": p.stem.lower(),
        })

    image_suffixes = {".png", ".jpg", ".jpeg", ".webp"}

    def image_files(search_root, recursive=False):
        iterator = search_root.rglob("*") if recursive else search_root.glob("*")
        return [
            p for p in iterator
            if p.is_file() and p.suffix.lower() in image_suffixes
        ]

    # 1. Preferred directory first.
    preferred = image_files(folder, recursive=False)

    # Exact filename match, e.g. rewriting.png.
    for key in normalized:
        for p in preferred:
            if p.name.lower() == key["name"]:
                return p

    # Exact stem match, e.g. rewriting.
    for key in normalized:
        for p in preferred:
            if p.stem.lower() == key["stem"]:
                return p

    # Stem containment as a final preferred-folder fallback.
    for key in normalized:
        for p in preferred:
            if key["stem"] and key["stem"] in p.stem.lower():
                return p

    # 2. Safe recursive fallback within the enclosing flight folder.
    # folder examples:
    #   .../waypoints/flight-a/images
    #   .../waypoints/flight-b/word-meanings
    #   .../waypoints/flight-c/flight-c-word-meanings
    flight_root = folder.parent
    recursive_files = image_files(flight_root, recursive=True)

    # Avoid derived/debug folders when a canonical-looking asset exists.
    def rank(p):
        parts = {part.lower() for part in p.parts}
        penalty = 0
        if "_cropped" in parts:
            penalty += 50
        if "_teacher_explainer_renders" in parts:
            penalty += 50
        if "renders" in parts:
            penalty += 20
        return (penalty, len(str(p)), str(p).lower())

    recursive_files = sorted(recursive_files, key=rank)

    for key in normalized:
        for p in recursive_files:
            if p.name.lower() == key["name"]:
                return p

    for key in normalized:
        for p in recursive_files:
            if p.stem.lower() == key["stem"]:
                return p

    for key in normalized:
        for p in recursive_files:
            if key["stem"] and key["stem"] in p.stem.lower():
                return p

    # Give a useful diagnostic without changing anything.
    visible = sorted(
        str(p.relative_to(flight_root))
        for p in recursive_files
    )[:60]

    raise FileNotFoundError(
        f"No meaning image found for {keys} under {flight_root}.\n"
        "Meaning-like image files found (first 60):\n  - "
        + "\n  - ".join(visible)
    )


# ---------------------------------------------------------------------------
# SHARP TRANSPARENT TILE CLEANUP
# ---------------------------------------------------------------------------

def is_near_black(pixel):
    r, g, b, a = pixel
    return a > 0 and r <= BLACK_THRESHOLD and g <= BLACK_THRESHOLD and b <= BLACK_THRESHOLD


def clean_edge_black_image(src: Path, dst: Path) -> Path:
    """
    Remove only near-black pixels connected to the OUTER edge.
    Preserve original pixel dimensions and interior black details.
    """
    dst.parent.mkdir(parents=True, exist_ok=True)

    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()

    q = deque()
    seen = set()

    def seed(x, y):
        if (x, y) not in seen and is_near_black(px[x, y]):
            seen.add((x, y))
            q.append((x, y))

    for x in range(w):
        seed(x, 0)
        if h > 1:
            seed(x, h - 1)
    for y in range(h):
        seed(0, y)
        if w > 1:
            seed(w - 1, y)

    neighbors = [
        (-1,-1), (0,-1), (1,-1),
        (-1,0),           (1,0),
        (-1,1),  (0,1),  (1,1),
    ]

    while q:
        x, y = q.popleft()
        for dx, dy in neighbors:
            nx, ny = x + dx, y + dy
            if not (0 <= nx < w and 0 <= ny < h):
                continue
            if (nx, ny) in seen:
                continue
            if is_near_black(px[nx, ny]):
                seen.add((nx, ny))
                q.append((nx, ny))

    for x, y in seen:
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, 0)

    # Light halo cleanup only immediately adjacent to removed edge background.
    fringe = set()
    for x, y in seen:
        for dx, dy in neighbors:
            nx, ny = x + dx, y + dy
            if not (0 <= nx < w and 0 <= ny < h):
                continue
            if (nx, ny) in seen:
                continue
            r, g, b, a = px[nx, ny]
            if a == 0:
                continue
            avg = (r + g + b) / 3.0
            if avg <= FRINGE_THRESHOLD:
                fringe.add((nx, ny))

    for x, y in fringe:
        r, g, b, a = px[x, y]
        avg = (r + g + b) / 3.0
        span = max(1, FRINGE_THRESHOLD - BLACK_THRESHOLD)
        factor = max(0.18, min(1.0, (avg - BLACK_THRESHOLD) / span))
        px[x, y] = (r, g, b, int(a * factor))

    im.save(dst, "PNG", optimize=False)
    return dst


def sharp_tile(src: Path):
    """Return a cleaned, full-resolution copy in a regenerable temp cache."""
    try:
        rel = src.relative_to(REPO)
    except ValueError:
        rel = Path(src.name)

    dst = CLEAN_TILE_CACHE / rel
    if not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime:
        clean_edge_black_image(src, dst)
    return dst


# ---------------------------------------------------------------------------
# GENERATED BASE TILE FALLBACK FOR FLIGHT A
# ---------------------------------------------------------------------------

def font_path():
    candidates = [
        Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
        Path("/Library/Fonts/Arial Bold.ttf"),
        Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
    ]
    for p in candidates:
        if p.exists():
            return p
    return None


def generate_base_tile(base: str, gloss: str):
    GENERATED_BASE_CACHE.mkdir(parents=True, exist_ok=True)
    safe_name = re.sub(r"[^a-zA-Z0-9_-]+", "_", base)
    out = GENERATED_BASE_CACHE / f"{safe_name}.png"

    if out.exists():
        return out

    size = 1100
    im = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    d = ImageDraw.Draw(im)

    d.rounded_rectangle(
        (75, 75, 1025, 1025),
        radius=110,
        fill=(249, 244, 226, 255),
        outline=(31, 120, 200, 255),
        width=32,
    )

    fp = font_path()
    if fp:
        title_size = 145 if len(base) <= 7 else 112
        title_font = ImageFont.truetype(str(fp), title_size)
        gloss_font = ImageFont.truetype(str(fp), 60)
    else:
        title_font = ImageFont.load_default()
        gloss_font = ImageFont.load_default()

    def centered(text, y, font, fill):
        box = d.textbbox((0, 0), text, font=font)
        tw = box[2] - box[0]
        d.text(((size - tw) / 2, y), text, font=font, fill=fill)

    centered(base, 340, title_font, (23, 105, 170, 255))
    centered(gloss, 595, gloss_font, (38, 52, 65, 255))

    im.save(out)
    return out


# ---------------------------------------------------------------------------
# NORMALIZE A/C DATA INTO ONE SHAPE
# ---------------------------------------------------------------------------

def normalize_a_word(raw):
    tiles = []
    title_kinds = []

    for kind, key, display, gloss in raw["tiles"]:
        if kind == "prefix":
            src = resolve_asset("prefix", [key])
        elif kind == "suffix":
            src = resolve_asset("suffix", [key])
        elif kind == "base":
            # Flight A must use the REAL clay base-word tiles.
            # Never silently generate a substitute.
            canonical_name = f"{key}.png"
            preferred = FLIGHT_A_REAL_BASE_DIR / canonical_name

            if preferred.exists():
                src = preferred
            else:
                # Also allow another canonical repository base-word location.
                src = resolve_asset("base", [key])

                if src is None:
                    # Conservative live-repo search by exact filename/stem,
                    # while explicitly excluding all OLD folders.
                    candidates = []
                    for p in REPO.rglob("*.png"):
                        if is_old_path(p):
                            continue
                        if p.name.lower() == canonical_name.lower() or p.stem.lower() == key.lower():
                            candidates.append(p)

                    if candidates:
                        # Prefer paths whose folder names suggest base/word assets.
                        def base_rank(p):
                            s = str(p).lower()
                            score = 0
                            if "base" in s:
                                score -= 20
                            if "word" in s:
                                score -= 10
                            return (score, len(str(p)), str(p))
                        src = sorted(candidates, key=base_rank)[0]

            if src is None:
                raise FileNotFoundError(
                    f"{raw['word']}: REAL Flight A base-word tile '{canonical_name}' was not found.\n"
                    f"Expected first at: {preferred}\n"
                    "No fallback tile will be generated.\n"
                    "Restore the canonical Flight A base-word tile in the repository."
                )
        else:
            src = None

        if src is None:
            raise FileNotFoundError(f"{raw['word']}: missing {kind} tile for {key}")

        tiles.append({
            "kind": kind,
            "path": src,
            "display": display,
            "gloss": gloss,
        })
        title_kinds.append(kind)

    meaning = find_meaning_image(A_MEANING_DIR, raw.get("image", [raw["word"].lower()]))

    return {
        "word": raw["word"],
        "tiles": tiles,
        "sum": raw["sum"],
        "parts": raw["parts"],
        "bridge": raw["bridge"],
        "definition": raw["definition"],
        "context": raw["context"],
        "meaning_image": meaning,
        "title_parts": infer_title_parts(raw["word"], raw["sum"], title_kinds),
    }


def normalize_c_word(raw):
    tiles = []
    title_kinds = []

    for kind, candidates in raw["tiles"]:
        src = resolve_asset(kind, candidates)
        if src is None:
            raise FileNotFoundError(
                f"{raw['word']}: missing {kind} tile; tried {candidates}"
            )
        tiles.append({
            "kind": kind,
            "path": src,
            "display": "",
            "gloss": "",
        })
        title_kinds.append(kind)

    meaning = find_meaning_image(C_MEANING_DIR, raw.get("meaning_keys", [raw["word"].lower()]))

    return {
        "word": raw["word"],
        "tiles": tiles,
        "sum": raw["sum"],
        "parts": raw["parts"],
        "bridge": raw["bridge"],
        "definition": raw["definition"],
        "context": raw["context"],
        "meaning_image": meaning,
        "title_parts": infer_title_parts(raw["word"], raw["sum"], title_kinds),
    }


def normalize_b_word(raw):
    tiles = []
    for kind, candidates in raw["tiles"]:
        src = resolve_asset(kind, candidates)
        if src is None:
            raise FileNotFoundError(
                f"{raw['word']}: missing {kind} tile; tried {candidates}"
            )
        tiles.append({"kind": kind, "path": src, "display": "", "gloss": ""})

    meaning = find_meaning_image(B_MEANING_DIR, raw["meaning_keys"])

    return {
        **raw,
        "tiles": tiles,
        "meaning_image": meaning,
    }


# ---------------------------------------------------------------------------
# TITLE SEGMENTATION
# ---------------------------------------------------------------------------

def clean_sum_tokens(sum_text):
    left = sum_text.split("->", 1)[0].strip()
    return [t.strip() for t in left.split("+")]


def token_variants(token):
    token = token.strip()
    token = token.replace("(", "").replace(")", "")
    token = token.strip("-")
    variants = []

    for part in token.split("/"):
        p = re.sub(r"[^A-Za-z]", "", part).lower()
        if p:
            variants.append(p)

    # Common allomorphic/orthographic possibilities.
    if "duct" in variants and "duce" not in variants:
        variants.append("duce")
    if "duce" in variants and "duct" not in variants:
        variants.append("duct")
    if "ven" in variants and "vent" not in variants:
        variants.append("vent")
    if "vent" in variants and "ven" not in variants:
        variants.append("ven")
    if "mit" in variants and "miss" not in variants:
        variants.append("miss")
    if "miss" in variants and "mit" not in variants:
        variants.append("mit")
    if "vert" in variants and "vers" not in variants:
        variants.append("vers")
    if "vers" in variants and "vert" not in variants:
        variants.append("vert")
    if "scrib" in variants and "script" not in variants:
        variants.append("script")
    if "script" in variants and "scrib" not in variants:
        variants.append("scrib")

    return sorted(set(variants), key=len, reverse=True)


def infer_title_parts(word, sum_text, kinds):
    """
    Best-effort split of whole word into visible morpheme-colored pieces.
    If exact matching fails, preserve the whole word in blue rather than
    inventing a misleading split.
    """
    low = word.lower()
    tokens = clean_sum_tokens(sum_text)

    if len(tokens) != len(kinds):
        return [(word.title(), "roots")]

    variants = [token_variants(t) for t in tokens]

    # Backtracking exact concatenation first.
    chosen = []

    def rec(i, pos):
        if i == len(variants):
            return pos == len(low)

        for v in variants[i]:
            if low.startswith(v, pos):
                chosen.append(v)
                if rec(i + 1, pos + len(v)):
                    return True
                chosen.pop()

        # spelling alternation: silent-e deletion, e.g. remove + able -> removable
        if i < len(variants) - 1:
            for v in variants[i]:
                if v.endswith("e") and low.startswith(v[:-1], pos):
                    chosen.append(v[:-1])
                    if rec(i + 1, pos + len(v) - 1):
                        return True
                    chosen.pop()
        return False

    if rec(0, 0):
        # Preserve capitalization only at beginning.
        pieces = []
        for i, (piece, kind) in enumerate(zip(chosen, kinds)):
            display = piece.capitalize() if i == 0 else piece
            pieces.append((display, kind))
        return pieces

    # Prefix/suffix anchored fallback.
    pieces = []
    start = 0
    end = len(low)

    first_prefix = kinds[0] in ("prefix", "prefixes")
    last_suffix = kinds[-1] in ("suffix", "suffixes")

    first_piece = None
    last_piece = None

    if first_prefix:
        for v in variants[0]:
            if low.startswith(v):
                first_piece = v
                start = len(v)
                break

    if last_suffix:
        for v in variants[-1]:
            if low.endswith(v):
                last_piece = v
                end = len(low) - len(v)
                break

    if first_piece is not None:
        pieces.append((first_piece.capitalize(), kinds[0]))

    middle_kind_start = 1 if first_piece is not None else 0
    middle_kind_end = len(kinds) - 1 if last_piece is not None else len(kinds)

    if middle_kind_end > middle_kind_start and end > start:
        # If there are multiple middle parts but we cannot split reliably,
        # use the corresponding whole middle span with the first middle kind color.
        pieces.append((low[start:end], kinds[middle_kind_start]))

    if last_piece is not None:
        pieces.append((last_piece, kinds[-1]))

    if pieces and "".join(p[0] for p in pieces).lower() == low:
        return pieces

    return [(word.title(), "roots")]


# ---------------------------------------------------------------------------
# DRAWING HELPERS
# ---------------------------------------------------------------------------

def round_rect(c, x, y, w, h, radius, fill, stroke, sw=1.5):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(sw)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)


def draw_fragments(c, parts, center_x, y, size, font="Helvetica-Bold"):
    widths = [stringWidth(text, font, size) for text, _ in parts]
    x = center_x - sum(widths) / 2.0

    for (text, color), width in zip(parts, widths):
        c.setFont(font, size)
        c.setFillColor(color)
        c.drawString(x, y, text)
        x += width


def fit_title_size(parts, max_width, start=38, minimum=25):
    size = start
    while size > minimum:
        width = sum(stringWidth(text, "Helvetica-Bold", size) for text, _ in parts)
        if width <= max_width:
            return size
        size -= 1
    return minimum


def draw_image_contain(c, path: Path, cx, cy, box_w, box_h):
    with Image.open(path) as im:
        iw, ih = im.size

    scale = min(box_w / iw, box_h / ih)
    dw = iw * scale
    dh = ih * scale

    c.drawImage(
        ImageReader(str(path)),
        cx - dw / 2,
        cy - dh / 2,
        width=dw,
        height=dh,
        mask="auto",
    )


def wrap_text(text, font, size, max_width):
    words = text.split()
    lines = []
    current = ""

    for word in words:
        trial = word if not current else current + " " + word
        if stringWidth(trial, font, size) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word

    if current:
        lines.append(current)

    return lines


def fit_wrapped(text, max_width, max_lines, start_size, min_size=10.5, font="Helvetica"):
    size = start_size
    while size >= min_size:
        lines = wrap_text(text, font, size, max_width)
        if len(lines) <= max_lines:
            return size, lines
        size -= 0.5
    return min_size, wrap_text(text, font, min_size, max_width)[:max_lines]


def split_parts_meanings(parts_text):
    return [p.strip() for p in parts_text.split("+")]


def title_fragments(word_data):
    return [
        (text, KIND_COLORS.get(kind, BLUE))
        for text, kind in word_data["title_parts"]
    ]


# ---------------------------------------------------------------------------
# PAGE RENDERER
# ---------------------------------------------------------------------------

def render_waypoint_pdf(word_data, flight_letter, out_pdf):
    c = canvas.Canvas(str(out_pdf), pagesize=(W, H))
    c.setTitle(f"First Volo Morphology - Waypoint Word - {word_data['word'].title()}")

    # Header
    c.setFont("Helvetica-Bold", 10.5)
    c.setFillColor(NAVY)
    c.drawString(32, H - 31, "FIRST VOLO MORPHOLOGY")

    c.setFillColor(PURPLE)
    c.drawRightString(W - 32, H - 31, f"FLIGHT {flight_letter}  ·  WAYPOINT WORD")

    c.setStrokeColor(LIGHT_RULE)
    c.setLineWidth(0.8)
    c.line(32, H - 39, W - 32, H - 39)

    # Whole word title
    tfrags = title_fragments(word_data)
    title_size = fit_title_size(tfrags, W - 150)
    draw_fragments(c, tfrags, W / 2, H - 92, title_size)

    # Approved compact part-of-speech badge beside the title.
    pos = POS_BY_WORD.get(word_data["word"])
    if pos:
        icon = POS_ICON_DIR / f"{pos}-icon.png"
        if not icon.exists():
            fail(f"Missing {pos} POS icon: {icon}")
        title_width = sum(
            stringWidth(text, "Helvetica-Bold", title_size)
            for text, _ in tfrags
        )
        badge_x = min(W - 54, W / 2 + title_width / 2 + 24)
        draw_image_contain(c, icon, badge_x, H - 81, 28, 28)

    # Subtitle
    subtitle = "See how familiar word parts work together in a more complex word."
    c.setFont("Helvetica-Oblique", 13.3)
    c.setFillColor(NAVY)
    c.drawCentredString(W / 2, H - 119, subtitle)

    # Sharp real tiles
    n = len(word_data["tiles"])
    tile_y = H - 225
    tile_box = 94 if n <= 2 else 88

    if n == 2:
        centers = [W / 2 - 78, W / 2 + 78]
    elif n == 3:
        centers = [W / 2 - 140, W / 2, W / 2 + 140]
    else:
        # Rare fallback for 4 parts.
        centers = [
            W / 2 - 180,
            W / 2 - 60,
            W / 2 + 60,
            W / 2 + 180,
        ]

    for tile, cx in zip(word_data["tiles"], centers):
        src = tile["path"]

        # Generated fallback base tiles live outside repo and are already transparent.
        if str(src).startswith(str(REPO)):
            src = sharp_tile(src)

        draw_image_contain(c, src, cx, tile_y, tile_box, tile_box)

    # Plus signs exactly in the midpoint between adjacent tile centers
    c.setFont("Helvetica-Bold", 26)
    c.setFillColor(GOLD)
    for left, right in zip(centers[:-1], centers[1:]):
        c.drawCentredString((left + right) / 2.0, tile_y - 7, "+")

    # Literal meaning section
    c.setFont("Helvetica-Bold", 13.2)
    c.setFillColor(NAVY)
    c.drawString(42, 326, "LITERAL MEANING FROM THE PARTS")

    lit_x, lit_y, lit_w, lit_h = 40, 226, W - 80, 86
    round_rect(c, lit_x, lit_y, lit_w, lit_h, 10, PALE_GREEN, GREEN_BORDER, 1.7)

    meanings = split_parts_meanings(word_data["parts"])
    kinds = [tile["kind"] for tile in word_data["tiles"]]

    equation = []
    for i, meaning in enumerate(meanings):
        if i:
            equation.append(("   +   ", GOLD))
        kind = kinds[i] if i < len(kinds) else "roots"
        equation.append((meaning, KIND_COLORS.get(kind, BLUE)))

    # Fit meaning equation on one line.
    eq_size = 13.7
    while eq_size > 10.5:
        eq_width = sum(stringWidth(t, "Helvetica-Bold", eq_size) for t, _ in equation)
        if eq_width <= lit_w - 40:
            break
        eq_size -= 0.5

    draw_fragments(c, equation, W / 2, lit_y + 52, eq_size)

    # Semantic bridge
    c.setFont("Helvetica-Bold", 15.2)
    c.setFillColor(GOLD)
    c.drawString(lit_x + 18, lit_y + 18, "→")

    bridge_size, bridge_lines = fit_wrapped(
        word_data["bridge"],
        lit_w - 83,
        max_lines=2,
        start_size=15.2,
        min_size=11.5,
        font="Helvetica",
    )

    c.setFont("Helvetica", bridge_size)
    c.setFillColor(NAVY)

    bridge_y = lit_y + 18
    if len(bridge_lines) == 2:
        bridge_y += 7

    for i, line in enumerate(bridge_lines):
        c.drawString(lit_x + 49, bridge_y - i * (bridge_size + 2), line)

    # Dictionary meaning
    dict_x, dict_y, dict_w, dict_h = 40, 112, 465, 98
    round_rect(c, dict_x, dict_y, dict_w, dict_h, 10, PALE_BLUE, BLUE_BORDER, 1.7)

    c.setFont("Helvetica-Bold", 12.7)
    c.setFillColor(NAVY)
    c.drawString(dict_x + 16, dict_y + 68, "DICTIONARY MEANING")

    def_size, def_lines = fit_wrapped(
        word_data["definition"],
        dict_w - 32,
        max_lines=2,
        start_size=15.4,
        min_size=11.3,
    )
    c.setFont("Helvetica", def_size)
    c.setFillColor(NAVY)

    if len(def_lines) == 1:
        ys = [dict_y + 33]
    else:
        ys = [dict_y + 40, dict_y + 17]

    for y, line in zip(ys, def_lines):
        c.drawString(dict_x + 16, y, line)

    # Whole-word meaning image
    draw_image_contain(c, word_data["meaning_image"], W - 151, dict_y + 49, 190, 102)

    # Context
    ctx_x, ctx_y, ctx_w, ctx_h = 40, 43, W - 80, 51
    round_rect(c, ctx_x, ctx_y, ctx_w, ctx_h, 10, PALE_PURPLE, PURPLE_BORDER, 1.7)

    c.setFont("Helvetica-Bold", 12.4)
    c.setFillColor(PURPLE)
    c.drawString(ctx_x + 16, ctx_y + 30, "IN CONTEXT")

    ctx_size, ctx_lines = fit_wrapped(
        word_data["context"],
        ctx_w - 155,
        max_lines=2,
        start_size=14.5,
        min_size=10.7,
    )
    c.setFont("Helvetica", ctx_size)
    c.setFillColor(NAVY)

    if len(ctx_lines) == 1:
        ctx_start_y = ctx_y + 27
    else:
        ctx_start_y = ctx_y + 32

    for i, line in enumerate(ctx_lines):
        c.drawString(ctx_x + 117, ctx_start_y - i * (ctx_size + 2), line)

    # Canonical First Volo footer:
    # First Volo Learning   |   firstvololearning.com
    footer_y = 17
    left_text = "First Volo Learning"
    right_text = "firstvololearning.com"
    footer_font = "Helvetica"
    footer_size = 9.1

    left_w = stringWidth(left_text, footer_font, footer_size)
    right_w = stringWidth(right_text, footer_font, footer_size)
    gap = 13
    total_w = left_w + right_w + gap * 2 + 1

    fx = W / 2 - total_w / 2

    c.setFont(footer_font, footer_size)
    c.setFillColor(FOOTER_GRAY)
    c.drawString(fx, footer_y, left_text)

    sep_x = fx + left_w + gap
    c.setStrokeColor(FOOTER_GRAY)
    c.setLineWidth(0.8)
    c.line(sep_x, footer_y - 1, sep_x, footer_y + 10)

    c.drawString(sep_x + gap, footer_y, right_text)

    c.showPage()
    c.save()


# ---------------------------------------------------------------------------
# PACKET + ZIP
# ---------------------------------------------------------------------------

def combine_pdfs(pdf_paths, out_path):
    combined = fitz.open()
    for path in pdf_paths:
        src = fitz.open(path)
        combined.insert_pdf(src)
        src.close()
    combined.save(out_path)
    combined.close()


def make_zip(pdf_paths, out_zip):
    with zipfile.ZipFile(out_zip, "w", compression=zipfile.ZIP_DEFLATED) as z:
        for p in pdf_paths:
            z.write(p, arcname=p.name)



# ---------------------------------------------------------------------------
# GRADE-BAND WORDING OVERRIDES — APPROVED QUALITY PASS
# Flight A = Grades 2–3
# Flight B = Grades 4–5
# Flight C = Grades 6–8
# ---------------------------------------------------------------------------

CONTENT_OVERRIDES = {
    "A": {
        "REWRITING": {
            "parts": "again + write + ongoing action",
        },
        "OVERUSED": {
            "context": "The overused phrase made the paragraph sound repetitive.",
        },
        "NONFICTION": {
            "context": "She would like to read nonfiction about dolphins.",
        },
        "EMPOWERMENT": {
            "bridge": "the state of being given or having power",
            "definition": "the feeling or state of having the power to do something.",
            "context": "Getting to make her own choice gave Maya a feeling of empowerment.",
        },
        "UNEVENNESS": {
            "bridge": "the state of not being even",
            "definition": "when something is not smooth or flat.",
            "context": "The unevenness of the sidewalk made it hard to ride the scooter.",
        },
        "MISLEADING": {
            "parts": "wrongly + lead + ongoing action",
            "context": "The map was misleading because it made the school look closer than it really was.",
        },
        "COUNTABLE": {
            "context": "The marbles on the table are countable.",
        },
        "SUCCESSFULLY": {
            "context": "She successfully built the tower so it stayed standing.",
        },
    },

    "B": {
        "MICROSCOPIC": {
            "definition": "so small that it can be seen clearly only with a microscope.",
        },
        "PREDICTIVE": {
            "context": "Dark clouds can be predictive of rain.",
        },
    },

    "C": {
        "VOCALIZE": {
            "bridge": "make something vocal; express it with the voice",
            "context": "She vocalized her answer instead of writing it down.",
        },
        "INTERJECTION": {
            "definition": "a word or expression that shows a feeling or reaction.",
        },
        "SUBMISSION": {
            "bridge": "the act or result of sending something in",
            "context": "Her finished project was a submission for review.",
        },
        "REFERENCE": {
            "bridge": "a carrying or directing back to something",
        },
        "INVERSION": {
            "bridge": "the act or result of turning",
            "context": "The inversion of the image made it appear upside down.",
        },
    },
}


def apply_content_overrides(words, flight_letter):
    """
    Apply only the wording changes approved in the grade-band quality review.
    Structural data, morpheme assets, title segmentation, and meaning images
    remain untouched.
    """
    changes = CONTENT_OVERRIDES.get(flight_letter, {})
    changed_words = []

    for word_data in words:
        patch = changes.get(word_data["word"])
        if not patch:
            continue

        for field, value in patch.items():
            word_data[field] = value

        changed_words.append(word_data["word"])

    if changed_words:
        print(
            f"✓ Flight {flight_letter} grade-band wording updates: "
            + ", ".join(changed_words)
        )

    return words


# ---------------------------------------------------------------------------
# FLIGHT LOADERS
# ---------------------------------------------------------------------------

def load_flight_a():
    builder = find_flight_a_builder()
    print(f"Flight A source builder: {builder.relative_to(REPO)}")
    print(f"Flight A canonical base-word tiles: {FLIGHT_A_REAL_BASE_DIR.relative_to(REPO)}")
    raw_words = read_words_literal(builder)
    words = [normalize_a_word(raw) for raw in raw_words]
    words = apply_content_overrides(words, "A")
    print("✓ Flight A real clay base-word tiles resolved; no generated fallback tiles used.")
    return words


def load_flight_b():
    print("Flight B source: current fixed review-packet content + real word-meaning PNGs")
    words = [normalize_b_word(raw) for raw in FLIGHT_B_WORDS]
    return apply_content_overrides(words, "B")


def load_flight_c():
    builder = find_flight_c_builder()
    print(f"Flight C source builder: {builder.relative_to(REPO)}")
    raw_words = read_words_literal(builder)
    words = [normalize_c_word(raw) for raw in raw_words]
    return apply_content_overrides(words, "C")


# ---------------------------------------------------------------------------
# BUILD FLIGHT
# ---------------------------------------------------------------------------

def build_flight(letter, words):
    flight_slug = f"flight-{letter.lower()}"
    flight_out = OUT_ROOT / flight_slug
    pdf_dir = flight_out / "pdfs"

    if pdf_dir.exists():
        shutil.rmtree(pdf_dir)
    pdf_dir.mkdir(parents=True, exist_ok=True)

    pdfs = []

    print(f"\n=== FLIGHT {letter}: {len(words)} WAYPOINTS ===")

    for word in words:
        out = pdf_dir / f"Flight-{letter}-Waypoint-{word['word']}.pdf"
        render_waypoint_pdf(word, letter, out)
        pdfs.append(out)
        print(f"✓ {word['word']}")

    packet = flight_out / f"Flight-{letter}-Waypoints-review-packet.pdf"
    zip_path = flight_out / f"Flight-{letter}-Waypoint-PDFs.zip"

    combine_pdfs(pdfs, packet)
    make_zip(pdfs, zip_path)

    print(f"✓ Packet: {packet}")
    print(f"✓ ZIP:    {zip_path}")

    return {
        "letter": letter,
        "count": len(words),
        "folder": flight_out,
        "packet": packet,
        "zip": zip_path,
    }


# ---------------------------------------------------------------------------
# VALIDATION
# ---------------------------------------------------------------------------

def verify_outputs(results):
    print("\n=== VERIFY OUTPUTS ===")
    errors = []

    for result in results:
        packet = result["packet"]
        if not packet.exists():
            errors.append(f"Missing packet: {packet}")
            continue

        doc = fitz.open(packet)
        pages = doc.page_count
        doc.close()

        if pages != result["count"]:
            errors.append(
                f"Flight {result['letter']} packet page count {pages} != expected {result['count']}"
            )
        else:
            print(f"✓ Flight {result['letter']}: {pages} packet pages")

    if errors:
        print("\nVerification problems:")
        for e in errors:
            print(" -", e)
        sys.exit(3)


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--flight",
        choices=["A", "B", "C", "a", "b", "c"],
        help="Build only one flight. Omit to build A, B, and C.",
    )
    args = parser.parse_args()

    ensure_repo()
    OUT_ROOT.mkdir(parents=True, exist_ok=True)

    requested = [args.flight.upper()] if args.flight else ["A", "B", "C"]

    print("=== FIRST VOLO — WAYPOINT PDF SET v4 — GRADE-BAND WORDING ===")
    print(f"Repo:           {REPO}")
    print(f"Canonical output: {OUT_ROOT}")
    print("Source assets changed: 0")
    print("Tile source: original full-resolution live assets")
    print("Black background handling: edge-connected dark background -> transparency")
    print()

    loaders = {
        "A": load_flight_a,
        "B": load_flight_b,
        "C": load_flight_c,
    }

    results = []

    for letter in requested:
        try:
            words = loaders[letter]()
            results.append(build_flight(letter, words))
        except Exception as e:
            print(f"\nFAILED while preparing Flight {letter}:")
            print(e)
            print("\nBuild stopped before completing the requested flight.")
            sys.exit(2)

    verify_outputs(results)

    print("\n=== DONE ===")
    total = sum(r["count"] for r in results)
    print(f"Generated {total} individual Waypoint PDFs.")

    for r in results:
        print(f"\nFlight {r['letter']}:")
        print(f"  Folder: {r['folder']}")
        print(f"  Packet: {r['packet']}")
        print(f"  ZIP:    {r['zip']}")

    print("\nCanonical Waypoint outputs refreshed.")
    print("\nOpen the refreshed set:")
    print(f'  open "{OUT_ROOT}"')

    for r in results:
        print(f'  open "{r["packet"]}"')


if __name__ == "__main__":
    main()
