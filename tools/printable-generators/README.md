# First Volo Morphology - Build & Discover Generator

This is the reusable generator for Flight B word-family **Build & Discover** packets.

## Files

- `tools/printable-generators/build-word-family-packet.py`
- `printable-configs/port.py` - PORT reference config / reproduction test

## Run from the repository root

    python3 tools/printable-generators/build-word-family-packet.py port

Default output:

- `generated-printables/PORT_Build_and_Discover.pdf`
- `generated-printables/PORT_Build_and_Discover_render/page-1.png` etc.

## Locked behavior

The generator uses terminal/Python + ReportLab to place the **actual PNG files from the repository** into fixed image boxes. It does not create, crop, redraw, stretch, or silently substitute morpheme artwork.

- Page 1: portrait US Letter word-part cards
- Page 2: landscape US Letter build mats
- Page 3: portrait US Letter build clues + extension
- Page 4: portrait US Letter recording sheet
- Cut-apart cards: **2.22 x 1.08 in**
- Images are contained inside the image area with aspect ratio preserved
- Mat B is the narrowest mat; the script verifies card clearance automatically
- Prefix = green
- Root / Greek combining form = blue
- Suffix = purple
- Extension = orange
- Mat A = prefix/combining form + root + suffix
- Mat B = prefix + prefix + root + suffix
- Mat C = prefix + root + extension suffix

## Safety / QA rules

The script stops rather than improvising if:

- a configured PNG does not exist
- there are too many cards for the locked page
- a page has the wrong physical size
- the card is too wide for the narrowest mat slot
- the generated page count is not 4

After generation it prints:

- number of real image assets found
- physical card size
- narrowest mat-slot width
- card clearance
- physical size of every PDF page
- location of rendered PNG previews

Always inspect the rendered previews before publishing.

## New family workflow

1. Copy `printable-configs/port.py` to a new family config.
2. Change only family-specific content: root, prefixes, suffixes, extensions, image paths, meanings, clues, and notes.
3. Run the generator.
4. Inspect the four rendered PNG pages.
5. Approve the PDF before copying it into `printables/`.

PORT is the reference family used to verify that future layout changes have not broken the template.


## TRACT test config

`printable-configs/tract.py` is the next family test after PORT.

Current instructional plan:
- Core Flight B words stay more transparent and accessible.
- Higher-vocabulary or less-transparent family members can be treated as optional C extension.
- The config includes `sub-` and `in-` to test those choices.

Run:

`python3 tools/printable-generators/build-word-family-packet.py tract`

Important:
The generator will stop if the expected TRACT clay PNGs are not already present in the repository. It will not substitute artwork.

## LOCKED: Build & Discover v1

Validated with both the PORT and TRACT families on 2026-08-18.

The Build & Discover layout is now the reusable reference template.
Do not manually reposition individual family PDFs. Family-specific
differences belong in `printable-configs/<family>.py`.

### Locked packet structure

1. Word-Part Cards — portrait US Letter
2. Build Mats — landscape US Letter
3. Build Clues — portrait US Letter
4. Record Your Builds — portrait US Letter

### Locked physical rules

- Cut-apart cards: 2.22 x 1.08 in
- Cards must fit the narrowest Mat B slot.
- Exact repository PNG assets only.
- Preserve image aspect ratio.
- Never crop, redraw, regenerate, or silently substitute morpheme art.
- Missing assets must stop generation with a clear error.
- Generated previews must be reviewed before publishing.

### Adaptive family rules

Default root section heading:
`ROOT`

A family containing a combining form may override it, as PORT does:
`ROOT / GREEK COMBINING FORM`

Default Mat A:
`MAT A - one prefix`
`PREFIX | ROOT | SUFFIX`

A family containing a combining form may override Mat A, as PORT does:
`MAT A - one prefix or combining form`
`PREFIX / COMBINING FORM | ROOT | SUFFIX`

Mat B remains:
`PREFIX | PREFIX | ROOT | SUFFIX`

Mat C remains:
`PREFIX | ROOT | EXTENSION SUFFIX`

### C. Extension rule

Extension prompts do NOT give students the target word.

Use:
`EXTENSION SUFFIX: -___`
`Build a word with -___.`
`What does it mean?`

Higher-vocabulary, less-transparent, or more morphologically complex
family members may be treated as optional C extension even when they
use otherwise core cards.

### Recording page

The approved Record Your Builds page and its current writing-line
spacing are locked as the reusable template.

### Regression families

PORT tests:
- root + Greek combining form
- combining-form Mat A wording
- layered prefixes
- extension suffixes

TRACT tests:
- ordinary ROOT heading
- ordinary PREFIX Mat A wording
- assimilated prefix notation
- multiple prefixes including in- and sub-
- extension suffixes -ive and -ion

### Generate

`python3 tools/printable-generators/build-word-family-packet.py port`

`python3 tools/printable-generators/build-word-family-packet.py tract`

Generated files belong in `generated-printables/`.
Only approved final PDFs are copied into `printables/`.
