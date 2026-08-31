#!/usr/bin/env python3
from pathlib import Path
import sys, zipfile
from PIL import Image, ImageChops, ImageDraw, ImageFont
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
GEN_BASE_DIR = FLIGHT_DIR / "_generated-base-tiles"

LOGO = REPO / "images" / "logo" / "logo.png"
PREFIX_DIR = REPO / "images" / "prefixes"
SUFFIX_DIR = REPO / "images" / "suffixes"
BASE_DIR = REPO / "images" / "base-words"
FLIGHT_BASE_DIR = FLIGHT_DIR / "flight-a-bases"
CROPPED_INPUT_DIR = FLIGHT_DIR / "_cropped"

OUTDIR.mkdir(parents=True, exist_ok=True)
GEN_BASE_DIR.mkdir(parents=True, exist_ok=True)

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
            ("suffix", "ing", "-ing", "action happening now"),
        ],
        "sum": "re- + write + -ing -> rewriting",
        "parts": "again + write + action happening now",
        "bridge": "writing something again to change or improve it",
        "definition": "writing something again to change it or make it better.",
        "context": "She is rewriting her paragraph to make it clearer.",
        "family": "write · writer · rewrite · rewriting · written",
    },
    {
        "word": "DISCONNECTION",
        "image": ["disconnection.png"],
        "tiles": [
            ("prefix", "dis", "dis-", "apart / away"),
            ("base", "connect", "connect", "join"),
            ("suffix", "ion", "-ion", "action / state"),
        ],
        "sum": "dis- + connect + -ion -> disconnection",
        "parts": "apart / away + connect + state",
        "bridge": "the state of no longer being connected",
        "definition": "when things that were connected are no longer connected.",
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
        "parts": "before + look + more than one",
        "bridge": "more than one look before you see the whole thing",
        "definition": "short looks at something before you see the whole thing.",
        "context": "We watched previews before the movie began.",
        "family": "view · preview · previews",
    },
    {
        "word": "EMPOWERMENT",
        "image": ["empowerment.png"],
        "tiles": [
            ("prefix", "em", "em-", "cause to have / put into"),
            ("base", "power", "power", "strength / control"),
            ("suffix", "ment", "-ment", "act / state / result"),
        ],
        "sum": "em- + power + -ment -> empowerment",
        "parts": "cause to have + power + state / result",
        "bridge": "gaining or being given power to act or make choices",
        "definition": "gaining or being given power and confidence to do something.",
        "context": "Learning to speak up gave her a feeling of empowerment.",
        "family": "power · empower · empowered · empowerment",
    },
    {
        "word": "UNEVENNESS",
        "image": ["unevenness.png", "uneveness.png"],
        "tiles": [
            ("prefix", "un", "un-", "not"),
            ("base", "even", "even", "level / equal"),
            ("suffix", "ness", "-ness", "state of being"),
        ],
        "sum": "un- + even + -ness -> unevenness",
        "parts": "not + even + state of being",
        "bridge": "the state of not being even or level",
        "definition": "when a surface is bumpy or not level.",
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
        "definition": "used too much or too often.",
        "context": "The overused phrase made the paragraph sound repetitive.",
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
        "bridge": "writing that is not made up",
        "definition": "writing about real people, facts, or events.",
        "context": "She would like to read nonfiction about dolphins.",
        "family": "fiction · nonfiction · fictional",
    },
    {
        "word": "MISLEADING",
        "image": ["misleading.png"],
        "tiles": [
            ("prefix", "mis", "mis-", "wrongly"),
            ("base", "lead", "lead", "guide"),
            ("suffix", "ing", "-ing", "action happening now"),
        ],
        "sum": "mis- + lead + -ing -> misleading",
        "parts": "wrongly + lead + ongoing action",
        "bridge": "leading someone the wrong way",
        "definition": "making someone believe something that is not true or go the wrong way.",
        "context": "The map is misleading because it makes the school look like it is right in front of him.",
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
        "definition": "the layer of soil under the topsoil.",
        "context": "The roots reached down into the subsoil.",
        "family": "soil · topsoil · subsoil",
    },
    {
        "word": "COUNTABLE",
        "image": ["countable.png"],
        "tiles": [
            ("base", "count", "count", "find how many"),
            ("suffix", "able", "-able", "able to be"),
        ],
        "sum": "count + -able -> countable",
        "parts": "count + able to be",
        "bridge": "able to be counted",
        "definition": "able to be counted.",
        "context": "The marbles on the table are countable.",
        "family": "count · counted · counting · countable",
    },
    {
        "word": "SUCCESSFULLY",
        "image": ["successfully.png"],
        "tiles": [
            ("base", "success", "success", "reaching a goal"),
            ("suffix", "ful", "-ful", "full of / having"),
            ("suffix", "ly", "-ly", "in a way"),
        ],
        "sum": "success + -ful + -ly -> successfully",
        "parts": "success -> successful -> in a successful way",
        "bridge": "in a way that works or reaches the goal",
        "definition": "in a way that works or reaches the goal.",
        "context": "She successfully built the tower so it stayed standing.",
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
]:
    need(p, label)

def find_meaning(candidates):
    # Normal meaning-image folder first; allow already-prepared replacements in _cropped.
    for folder in (MEANING_DIR, CROPPED_INPUT_DIR):
        for n in candidates:
            p = folder / n
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

def make_plain_base_tile(base, gloss):
    """
    Neutral text-only base card for familiar bases that don't have an existing
    Morpho base-word image. This intentionally does NOT invent a Morpho symbol.
    """
    out = GEN_BASE_DIR / f"{base}.png"
    if out.exists():
        return out

    size = 900
    img = Image.new("RGBA", (size, size), (255,255,255,0))
    d = ImageDraw.Draw(img)

    # cream clay-like card with blue border
    d.rounded_rectangle((70,70,830,830), radius=95,
                        fill=(249,244,226,255),
                        outline=(30,105,170,255), width=28)

    fp = font_path()
    if fp:
        big = ImageFont.truetype(str(fp), 115 if len(base) <= 7 else 94)
        small = ImageFont.truetype(str(fp), 48)
    else:
        big = ImageFont.load_default()
        small = ImageFont.load_default()

    label = base
    bbox = d.textbbox((0,0), label, font=big)
    tw = bbox[2]-bbox[0]
    d.text(((size-tw)/2, 310), label, font=big, fill=(18,83,145,255))

    gloss_text = gloss
    bbox = d.textbbox((0,0), gloss_text, font=small)
    tw = bbox[2]-bbox[0]
    d.text(((size-tw)/2, 510), gloss_text, font=small, fill=(50,70,90,255))

    bbox = d.textbbox((0,0), "BASE WORD", font=small)
    tw = bbox[2]-bbox[0]
    d.text(((size-tw)/2, 680), "BASE WORD", font=small, fill=(95,115,130,255))
    img.save(out)
    return out

def resolve_tile(kind, key, display, gloss):
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
        # Flight A's approved custom base tiles override the general base-word folder.
        flight_base = FLIGHT_BASE_DIR / f"{key}.png"
        if flight_base.exists():
            return flight_base
        existing = BASE_DIR / f"{key}.png"
        if existing.exists():
            return existing
        return make_plain_base_tile(display, gloss)
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



def arrowed_width(text,font,size,arrow_w=18,gap=6):
    parts=[p.strip() for p in text.split("->")]
    if len(parts)==1:
        return stringWidth(text,font,size)
    return sum(stringWidth(p,font,size) for p in parts) + (len(parts)-1)*(arrow_w+2*gap)

def fit_arrow_font(text,font,max_size,min_size,maxw):
    size=max_size
    while size >= min_size:
        if arrowed_width(text,font,size) <= maxw:
            return size
        size -= 0.25
    return min_size

def draw_vector_arrow(c,x1,y,x2,color=INK,lw=1.7,head=4.2):
    """Draw a true right arrow as vector artwork, not ASCII characters."""
    c.setStrokeColor(color)
    c.setLineWidth(lw)
    c.line(x1,y,x2,y)
    c.line(x2,y,x2-head,y+head*0.72)
    c.line(x2,y,x2-head,y-head*0.72)

def draw_arrowed_line(c,text,y,font,size,color,center_x=None,left_x=None,arrow_w=18,gap=6):
    parts=[p.strip() for p in text.split("->")]
    total=arrowed_width(text,font,size,arrow_w,gap)
    if center_x is not None:
        x=center_x-total/2
    elif left_x is not None:
        x=left_x
    else:
        raise ValueError("center_x or left_x is required")
    c.setFillColor(color)
    c.setFont(font,size)
    for i,part in enumerate(parts):
        c.drawString(x,y,part)
        x += stringWidth(part,font,size)
        if i < len(parts)-1:
            x += gap
            ay=y+size*0.34
            draw_vector_arrow(c,x,ay,x+arrow_w,color=color,lw=max(1.35,size*0.10),head=max(3.5,size*0.25))
            x += arrow_w+gap

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
    meaning_dest = cropped / f"{word.lower()}.png"
    # If the approved replacement already lives in _cropped, use it directly.
    if meaning_src.resolve() == meaning_dest.resolve():
        meaning = meaning_src
    else:
        meaning = crop_meaning(meaning_src, meaning_dest)

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
    fs=fit_arrow_font(spec["sum"],"Helvetica-Bold",16.5,13.0,W-180)
    draw_arrowed_line(c,spec["sum"],sum_y+12,"Helvetica-Bold",fs,NAVY,center_x=W/2)

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

    if "->" in spec["parts"]:
        lit_size=fit_arrow_font(spec["parts"],"Helvetica-Bold",13.3,10.8,W-172)
        draw_arrowed_line(c,spec["parts"],parts_y+31,"Helvetica-Bold",lit_size,INK,left_x=86)
    else:
        lit_size=fit_font(spec["parts"],"Helvetica-Bold",13.3,10.8,W-172,1)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold",lit_size)
        c.drawString(86,parts_y+31,spec["parts"])

    bridge=spec["bridge"]
    arrow_x1=86
    arrow_x2=102
    br_text_x=111
    br_size=fit_font(bridge,"Helvetica-Oblique",11.5,9.5,W-br_text_x-86,1)
    c.setFillColor(GREEN)
    c.setFont("Helvetica-Oblique",br_size)
    draw_vector_arrow(c,arrow_x1,parts_y+16,arrow_x2,color=GREEN,lw=1.55,head=4.0)
    c.drawString(br_text_x,parts_y+12,bridge)

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
