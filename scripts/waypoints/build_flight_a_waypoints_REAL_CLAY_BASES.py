#!/usr/bin/env python3
from pathlib import Path
import sys, zipfile
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

HOME = Path.home()
REPO = HOME / "Documents" / "First Volo Learning" / "Digital Products" / "First Volo Morphology"

FLIGHT_DIR = REPO / "waypoints" / "flight-a"
MEANING_DIR = FLIGHT_DIR / "images"
OUTDIR = FLIGHT_DIR / "pdfs"
WAYPOINT_BASE_DIR = FLIGHT_DIR / "flight-a-bases"

LOGO = REPO / "images" / "logo" / "logo.png"
PREFIX_DIR = REPO / "images" / "prefixes"
SUFFIX_DIR = REPO / "images" / "suffixes"

OUTDIR.mkdir(parents=True, exist_ok=True)

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

WORDS = [
    {
        "word": "REWRITING",
        "image": ["rewriting.png"],
        "tiles": [
            ("prefix", "re", "re-", "again"),
            ("base", "write", "write", "write"),
            ("suffix", "ing", "-ing", "ongoing action"),
        ],
        "sum": "re- + write + -ing -> rewriting",
        "parts": "again + write + ongoing action",
        "bridge": "writing something again or in a new way",
        "definition": "writing something again, usually to improve or change it.",
        "context": "She is rewriting her paragraph to make it clearer.",
        "family": "write · writer · rewrite · rewriting · written",
    },
    {
        "word": "DISCONNECTION",
        "image": ["disconnection.png"],
        "tiles": [
            ("prefix", "dis", "dis-", "apart / away"),
            ("base", "connect", "connect", "join"),
            ("suffix", "ion", "-ion", "act / state"),
        ],
        "sum": "dis- + connect + -ion -> disconnection",
        "parts": "apart / away + connect + act / state",
        "bridge": "the act or state of breaking a connection",
        "definition": "a break or loss of a connection.",
        "context": "The loose cable caused a disconnection from the internet.",
        "family": "connect · disconnect · disconnected · disconnection",
    },
    {
        "word": "PREVIEWS",
        "image": ["previews.png"],
        "tiles": [
            ("prefix", "pre", "pre-", "before"),
            ("base", "view", "view", "see"),
            ("suffix", "s-es", "-s", "more than one"),
        ],
        "sum": "pre- + view + -s -> previews",
        "parts": "before + view + more than one",
        "bridge": "more than one look at something before the full thing",
        "definition": "short looks at something before it is fully shown or released.",
        "context": "We watched previews before the movie began.",
        "family": "view · preview · previews",
    },
    {
        "word": "EMPOWERMENT",
        "image": ["empowerment.png"],
        "tiles": [
            ("prefix", "em", "em-", "cause to / put into"),
            ("base", "power", "power", "strength / control"),
            ("suffix", "ment", "-ment", "act / state / result"),
        ],
        "sum": "em- + power + -ment -> empowerment",
        "parts": "cause to have + power + act / state / result",
        "bridge": "the process or state of gaining or giving power",
        "definition": "the process of gaining or giving power, confidence, or control.",
        "context": "Learning to speak up gave her a sense of empowerment.",
        "family": "power · empower · empowered · empowerment",
    },
    {
        "word": "UNEVENNESS",
        "image": ["unevenness.png", "uneveness.png"],
        "tiles": [
            ("prefix", "un", "un-", "not"),
            ("base", "even", "even", "level / equal"),
            ("suffix", "ness", "-ness", "state / quality"),
        ],
        "sum": "un- + even + -ness -> unevenness",
        "parts": "not + even + state / quality",
        "bridge": "the quality of not being even or level",
        "definition": "the quality of being irregular, bumpy, or not level.",
        "context": "The unevenness of the path made him walk carefully.",
        "family": "even · uneven · unevenly · unevenness",
    },
    {
        "word": "OVERUSED",
        "image": ["overused.png"],
        "tiles": [
            ("prefix", "over", "over-", "too much"),
            ("base", "use", "use", "use"),
            ("suffix", "ed", "-ed", "already happened"),
        ],
        "sum": "over- + use + -ed -> overused",
        "parts": "too much + use + already happened",
        "bridge": "used too much",
        "definition": "used so much that it becomes less effective or interesting.",
        "context": "The writer overused the same phrase in every paragraph.",
        "family": "use · overuse · overused",
    },
    {
        "word": "NONFICTION",
        "image": ["nonfiction.png"],
        "tiles": [
            ("prefix", "non", "non-", "not"),
            ("base", "fiction", "fiction", "made-up writing"),
        ],
        "sum": "non- + fiction -> nonfiction",
        "parts": "not + fiction",
        "bridge": "writing that is not fiction",
        "definition": "writing based on real people, facts, or events.",
        "context": "She chose a nonfiction book about dolphins.",
        "family": "fiction · nonfiction · fictional",
    },
    {
        "word": "MISLEADING",
        "image": ["misleading.png"],
        "tiles": [
            ("prefix", "mis", "mis-", "wrongly"),
            ("base", "lead", "lead", "guide"),
            ("suffix", "ing", "-ing", "ongoing action"),
        ],
        "sum": "mis- + lead + -ing -> misleading",
        "parts": "wrongly + lead + ongoing action",
        "bridge": "leading someone the wrong way",
        "definition": "causing someone to believe something incorrect or go the wrong way.",
        "context": "The map is misleading him because the school is not where it appears to be.",
        "family": "lead · mislead · misleading · misled",
    },
    {
        "word": "SUBSOIL",
        "image": ["subsoil.png"],
        "tiles": [
            ("prefix", "sub", "sub-", "below"),
            ("base", "soil", "soil", "soil"),
        ],
        "sum": "sub- + soil -> subsoil",
        "parts": "below + soil",
        "bridge": "soil below the top layer",
        "definition": "the layer of soil beneath the topsoil.",
        "context": "The roots reached down into the subsoil.",
        "family": "soil · topsoil · subsoil",
    },
    {
        "word": "REMOVABLE",
        "image": ["removable.png"],
        "tiles": [
            ("base", "remove", "remove", "take off / away"),
            ("suffix", "able", "-able", "able to be"),
        ],
        "sum": "remove + -able -> removable",
        "parts": "remove + able to be",
        "bridge": "able to be removed",
        "definition": "able to be taken off or away.",
        "context": "The bottle has a removable sticker.",
        "family": "remove · removable · removal",
    },
    {
        "word": "SUCCESSFULLY",
        "image": ["successfully.png"],
        "tiles": [
            ("base", "success", "success", "achieving a goal"),
            ("suffix", "ful", "-ful", "full of / having"),
            ("suffix", "ly", "-ly", "in a way"),
        ],
        "sum": "success + -ful + -ly -> successfully",
        "parts": "success + full of / having + in a way",
        "bridge": "in a way that achieves success",
        "definition": "in a way that achieves the intended result.",
        "context": "She successfully completed the experiment.",
        "family": "success · successful · successfully · succeed",
    },
]

def need(path, label):
    if not path.exists():
        print(f"ERROR: missing {label}: {path}")
        sys.exit(2)

for p, label in [
    (REPO, "Morphology repo"),
    (MEANING_DIR, "Flight A meaning-image folder"),
    (LOGO, "First Volo logo"),
    (PREFIX_DIR, "prefix tiles"),
    (SUFFIX_DIR, "suffix tiles"),
    (WAYPOINT_BASE_DIR, "Flight A clay base tiles"),
]:
    need(p, label)

def find_meaning(candidates):
    for n in candidates:
        p = MEANING_DIR / n
        if p.exists():
            return p
    raise FileNotFoundError("Meaning image not found; tried: " + ", ".join(candidates))

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

def resolve_tile(kind, key, display, gloss):
    """Resolve only real tile assets. No generated fallback base cards."""
    if kind == "prefix":
        p = PREFIX_DIR / f"{key}.png"
        if not p.exists():
            raise FileNotFoundError(f"Missing prefix tile: {p}")
        return p

    if kind == "suffix":
        p = SUFFIX_DIR / f"{key}.png"
        if not p.exists():
            raise FileNotFoundError(f"Missing suffix tile: {p}")
        return p

    if kind == "base":
        p = WAYPOINT_BASE_DIR / f"{key}.png"
        if not p.exists():
            raise FileNotFoundError(
                f"Missing Flight A clay base tile: {p}\n"
                f"Expected one of the user-created individual clay tiles."
            )
        return p

    raise ValueError(kind)

def dims(path):
    with Image.open(path) as im:
        return im.size

def draw_fit(c, path, x, y, w, h):
    iw, ih = dims(path)
    s = min(w/iw, h/ih)
    dw, dh = iw*s, ih*s
    c.drawImage(ImageReader(str(path)),
                x+(w-dw)/2, y+(h-dh)/2,
                dw, dh, preserveAspectRatio=True, mask="auto")

def crop_meaning(src, dest):
    im = Image.open(src).convert("RGBA")
    alpha = im.getchannel("A")
    box = alpha.getbbox()

    # If fully opaque, trim near-white margins
    if not box or box == (0,0,im.width,im.height):
        rgb = im.convert("RGB")
        bg = Image.new("RGB", rgb.size, "white")
        diff = ImageChops.difference(rgb, bg).convert("L")
        diff = diff.point(lambda p: 255 if p > 18 else 0)
        box = diff.getbbox()

    if box:
        l,t,r,b = box
        pad = 12
        l=max(0,l-pad); t=max(0,t-pad); r=min(im.width,r+pad); b=min(im.height,b+pad)
        im = im.crop((l,t,r,b))
    im.save(dest)
    return dest

def rbox(c,x,y,w,h,fill,stroke,radius=13,lw=1.0):
    c.setFillColor(fill); c.setStrokeColor(stroke); c.setLineWidth(lw)
    c.roundRect(x,y,w,h,radius,fill=1,stroke=1)

def lines(text,font,size,maxw):
    out=[]; cur=""
    for word in text.split():
        test=word if not cur else cur+" "+word
        if stringWidth(test,font,size) <= maxw:
            cur=test
        else:
            if cur: out.append(cur)
            cur=word
    if cur: out.append(cur)
    return out

def fit_font(text,font,max_size,min_size,maxw,max_lines=1):
    size=max_size
    while size >= min_size:
        if len(lines(text,font,size,maxw)) <= max_lines:
            return size
        size -= 0.25
    return min_size

def wrapped(c,text,x,y,maxw,font="Helvetica",size=12,leading=None,color=INK,max_lines=None):
    if leading is None: leading=size*1.2
    ls=lines(text,font,size,maxw)
    if max_lines:
        ls=ls[:max_lines]
    c.setFont(font,size); c.setFillColor(color)
    for ln in ls:
        c.drawString(x,y,ln)
        y -= leading
    return y

def footer(c):
    fy=34
    left="First Volo Learning"
    right="firstvololearning.com"
    fs=9.3
    c.setFont("Helvetica",fs)
    lw=stringWidth(left,"Helvetica",fs)
    rw=stringWidth(right,"Helvetica",fs)
    gap=11
    total=lw+rw+gap*2+1
    x=(W-total)/2
    c.setFillColor(NAVY); c.drawString(x,fy,left)
    rx=x+lw+gap
    c.setStrokeColor(HexColor("#8DA6BC")); c.setLineWidth(0.8)
    c.line(rx,fy-2,rx,fy+9)
    c.setFillColor(NAVY); c.drawString(rx+gap,fy,right)

def build(spec):
    word = spec["word"]
    meaning_src = find_meaning(spec["image"])
    cropped = FLIGHT_DIR / "_cropped"
    cropped.mkdir(exist_ok=True)
    meaning = crop_meaning(meaning_src, cropped / f"{word.lower()}.png")

    tile_paths = [resolve_tile(*t) for t in spec["tiles"]]

    out = OUTDIR / f"Flight-A-Waypoint-{word}.pdf"
    c=canvas.Canvas(str(out),pagesize=letter)
    c.setTitle(f"Flight A Waypoint Word - {word.title()}")
    c.setAuthor("First Volo Learning")

    c.setFillColor(white)
    c.rect(0,0,W,H,fill=1,stroke=0)

    c.setStrokeColor(BORDER)
    c.setLineWidth(3)
    c.roundRect(18,18,W-36,H-36,18,fill=0,stroke=1)

    # Header
    draw_fit(c, LOGO, 34, H-84, 88, 52)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold",17)
    c.drawRightString(W-34,H-51,"FLIGHT A · WAYPOINT WORD")

    title_size=31
    if len(word) > 12: title_size=27
    if len(word) > 15: title_size=24
    c.setFont("Helvetica-Bold",title_size)
    c.drawCentredString(W/2,H-108,word)

    # Tile row
    n=len(tile_paths)
    if n == 2:
        tile=112; gap=42; ty=H-232
    else:
        tile=102; gap=24; ty=H-242
    roww=tile*n+gap*(n-1)
    sx=(W-roww)/2

    for i,p in enumerate(tile_paths):
        x=sx+i*(tile+gap)
        rbox(c,x-4,ty-4,tile+8,tile+8,white,HexColor("#D9E1E8"),12,0.8)
        draw_fit(c,p,x,ty,tile,tile)
        if i<n-1:
            c.setFillColor(NAVY)
            c.setFont("Helvetica-Bold",25)
            c.drawCentredString(x+tile+gap/2,ty+tile/2-8,"+")

    # Word sum
    sum_y=ty-52
    rbox(c,70,sum_y,W-140,38,LIGHT_BLUE,SOFT_BLUE,11,1)
    fs=fit_font(spec["sum"],"Helvetica-Bold",16.5,13.0,W-180,1)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold",fs)
    c.drawCentredString(W/2,sum_y+12,spec["sum"])

    # Meaning image
    img_y=sum_y-151
    img_h=130
    rbox(c,70,img_y,W-140,img_h,white,HexColor("#D8E1E8"),14,1)
    draw_fit(c,meaning,84,img_y+8,W-168,img_h-16)

    # Meaning from parts - ALWAYS 3 clean lines
    parts_y=img_y-88
    parts_h=76
    rbox(c,70,parts_y,W-140,parts_h,LIGHT_GREEN,SOFT_GREEN,13,1)
    c.setFillColor(GREEN)
    c.setFont("Helvetica-Bold",11.5)
    c.drawString(86,parts_y+53,"MEANING FROM THE PARTS")

    lit_size=fit_font(spec["parts"],"Helvetica-Bold",13.3,10.8,W-172,1)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold",lit_size)
    c.drawString(86,parts_y+31,spec["parts"])

    bridge="-> "+spec["bridge"]
    br_size=fit_font(bridge,"Helvetica-Oblique",11.5,9.5,W-172,1)
    c.setFillColor(GREEN)
    c.setFont("Helvetica-Oblique",br_size)
    c.drawString(86,parts_y+12,bridge)

    # Whole meaning
    means_y=parts_y-73
    means_h=59
    rbox(c,70,means_y,W-140,means_h,LIGHT_BLUE,SOFT_BLUE,13,1)
    c.setFillColor(BLUE)
    c.setFont("Helvetica-Bold",11.5)
    c.drawString(86,means_y+38,"THE WORD MEANS")

    def_size=fit_font(spec["definition"],"Helvetica-Bold",12.3,10.2,W-172,2)
    wrapped(c,spec["definition"],86,means_y+17,W-172,
            font="Helvetica-Bold",size=def_size,leading=13.0,color=INK,max_lines=2)

    # Context + family
    bottom_y=means_y-85
    lx=70; gap2=14; lw=292
    rx=lx+lw+gap2
    rw=W-70-rx

    rbox(c,lx,bottom_y,lw,71,LIGHT_ORANGE,SOFT_ORANGE,13,1)
    c.setFillColor(ORANGE)
    c.setFont("Helvetica-Bold",11.5)
    c.drawString(lx+16,bottom_y+48,"IN CONTEXT")
    ctx_size=fit_font(spec["context"],"Helvetica",11.3,9.7,lw-32,3)
    wrapped(c,spec["context"],lx+16,bottom_y+27,lw-32,
            font="Helvetica",size=ctx_size,leading=13.0,color=INK,max_lines=3)

    rbox(c,rx,bottom_y,rw,71,LIGHT_PURPLE,SOFT_PURPLE,13,1)
    c.setFillColor(PURPLE)
    c.setFont("Helvetica-Bold",11.5)
    c.drawString(rx+16,bottom_y+48,"WORD FAMILY")
    fam_size=fit_font(spec["family"],"Helvetica-Bold",10.8,9.0,rw-32,3)
    wrapped(c,spec["family"],rx+16,bottom_y+27,rw-32,
            font="Helvetica-Bold",size=fam_size,leading=12.5,color=INK,max_lines=3)

    footer(c)
    c.showPage()
    c.save()
    return out

EXPECTED_BASES = [
    "write", "connect", "view", "power", "even", "use",
    "fiction", "lead", "soil", "remove", "success"
]

print("Checking individual Flight A clay base tiles...")
missing_bases = []
for base in EXPECTED_BASES:
    p = WAYPOINT_BASE_DIR / f"{base}.png"
    if p.exists():
        print(f"  ✓ {base}.png")
    else:
        print(f"  ✗ MISSING {base}.png")
        missing_bases.append(p)

if missing_bases:
    print("\nERROR: These clay base tiles are missing:")
    for p in missing_bases:
        print(f"  {p}")
    sys.exit(2)

print("\nRebuilding Flight A PDFs with the real clay base tiles...")

built=[]
errors=[]
for spec in WORDS:
    try:
        p=build(spec)
        built.append(p)
        print(f"✓ {spec['word']}")
    except Exception as e:
        errors.append((spec["word"],str(e)))
        print(f"✗ {spec['word']}: {e}")

if errors:
    print("\nERRORS:")
    for w,e in errors:
        print(f"  {w}: {e}")
    sys.exit(1)

# Review packet
packet = FLIGHT_DIR / "Flight-A-Waypoints-review-packet.pdf"
if fitz:
    merged=fitz.open()
    for p in built:
        d=fitz.open(p)
        merged.insert_pdf(d)
        d.close()
    merged.save(packet,garbage=4,deflate=True)
    merged.close()
else:
    packet=None

# Zip individual PDFs
zip_path = FLIGHT_DIR / "Flight-A-Waypoint-PDFs.zip"
with zipfile.ZipFile(zip_path,"w",zipfile.ZIP_DEFLATED) as z:
    for p in built:
        z.write(p,arcname=p.name)
    if packet and packet.exists():
        z.write(packet,arcname=packet.name)

print("\nDONE")
print(f"Individual PDFs: {OUTDIR}")
if packet:
    print(f"Review packet:    {packet}")
print(f"ZIP:              {zip_path}")
print("\nOpen them with:")
print(f'  open "{OUTDIR}"')
if packet:
    print(f'  open "{packet}"')
