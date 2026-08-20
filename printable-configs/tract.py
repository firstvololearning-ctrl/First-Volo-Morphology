"""TRACT family test config for the First Volo Build & Discover generator.

Instructional organization:
- Flight B core focuses on more transparent and accessible TRACT-family words.
- Optional C extension can include vocabulary that is less transparent,
  higher-demand, or morphologically more complex, even when one of the
  parts is technically a core card.

This config uses extension suffix cards -ion and -ive, while words such as
intractable or subtract can still appear in optional extension prompts.
"""

FAMILY = "TRACT"
FLIGHT = "Flight B"

PREFIXES = [
    {
        "label": "in-",
        "meaning": "not",
        "image": "images/prefixes/in-im-il-ir.png",
    },
    {
        "label": "ad- -> at-",
        "meaning": "to; toward",
        "image": "images/prefixes/ad.png",
        "note": "changes to at- before t",
    },
    {
        "label": "dis-",
        "meaning": "apart; away; not",
        "image": "images/prefixes/dis.png",
    },
    {
        "label": "ex-",
        "meaning": "out; from",
        "image": "images/prefixes/ex.png",
    },
    {
        "label": "re-",
        "meaning": "again; back",
        "image": "images/prefixes/re.png",
    },
    {
        "label": "sub-",
        "meaning": "under; below",
        "image": "images/prefixes/sub.png",
    },
]

ROOTS = [
    {
        "label": "tract",
        "meaning": "pull; draw",
        "image": "images/roots/tract.png",
    },
]

SUFFIXES = [
    {
        "label": "-or",
        "meaning": "one who; person or thing that",
        "image": "images/suffixes/or.png",
    },
    {
        "label": "-able",
        "meaning": "can be; able to be",
        "image": "images/suffixes/able.png",
    },
    {
        "label": "-ed",
        "meaning": "already happened; past",
        "image": "images/suffixes/ed.png",
    },
    {
        "label": "-ing",
        "meaning": "action happening now",
        "image": "images/suffixes/ing.png",
    },
    {
        "label": "-s",
        "meaning": "more than one; or present-tense verb",
        "image": "images/suffixes/s.png",
    },
]

EXTENSIONS = [
    {
        "label": "-ion",
        "meaning": "act or process",
        "image": "images/suffixes/ion.png",
    },
    {
        "label": "-ive",
        "meaning": "having the quality of; tending to",
        "image": "images/suffixes/ive.png",
    },
]

CARD_INTRO = "Cut apart the cards. Use them with the build mats on page 2."
CARD_NOTE = (
    "Core cards build more transparent TRACT-family words. Optional extension "
    "work includes more challenging family members."
)

MAT_NOTE = (
    "Not every build needs every slot. Use Mat A for core builds, Mat B for layered "
    "prefix builds, and Mat C for extension builds. Optional extension words can "
    "also use core cards."
)

WORD_LEVEL_CLUES = [
    "Build a word that means to pull or draw something toward.",
    "Build a word that means to pull attention away.",
    "Build a word that means to pull something out.",
    "Build a word that means to pull something back.",
    "Build a word for a machine that pulls farm equipment.",
    "Build a noun that means the act of pulling attention away.",
    "Build a noun that means the act of pulling something out.",
    "Build an adjective that means able to be pulled back.",
]

CONTEXT_CLUES = [
    "Bright colors can ______ attention from across the room.",
    "A loud conversation can ______ a student from reading.",
    "The dentist may need to ______ a badly damaged tooth.",
    "Press the button to ______ the awning back into its case.",
    "The farm ______ pulled a heavy trailer across the field.",
    "The funny side conversation caused a major ______ during the lesson.",
    "The lab report described the ______ of oil from the seeds.",
    "The antenna is ______, so it can slide back into the radio.",
]

EXTENSION_PROMPTS = [
    {
        "suffix": "-ive",
        "instruction": "Build a word with -ive.",
    },
    {
        "suffix": "-ion",
        "instruction": "Build a word with -ion.",
    },
]

CLUE_NOTE = (
    "Start with the more transparent clues. Then use the optional extension prompts "
    "for higher-vocabulary TRACT-family words."
)

RECORD_NOTE = (
    "Record each word you build. Literal meaning = what the word parts suggest; "
    "definition = what the whole word means."
)

SESSION_RECIPES = [
    {
        "word": "attract",
        "parts": ["ad- -> at-", "tract"],
        "word_prompt_index": 0,
        "context_prompt_index": 0,
    },
    {
        "word": "distract",
        "parts": ["dis-", "tract"],
        "word_prompt_index": 1,
        "context_prompt_index": 1,
    },
    {
        "word": "extract",
        "parts": ["ex-", "tract"],
        "word_prompt_index": 2,
        "context_prompt_index": 2,
    },
    {
        "word": "retract",
        "parts": ["re-", "tract"],
        "word_prompt_index": 3,
        "context_prompt_index": 3,
    },
    {
        "word": "tractor",
        "parts": ["tract", "-or"],
        "word_prompt_index": 4,
        "context_prompt_index": 4,
    },
    {
        "word": "distraction",
        "parts": ["dis-", "tract", "-ion"],
        "word_prompt_index": 5,
        "context_prompt_index": 5,
    },
    {
        "word": "extraction",
        "parts": ["ex-", "tract", "-ion"],
        "word_prompt_index": 6,
        "context_prompt_index": 6,
    },
]
