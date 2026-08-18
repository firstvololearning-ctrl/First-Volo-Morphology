"""VIEW family - Flight A Build & Discover packet."""

FAMILY = "VIEW"
FLIGHT = "Flight A"
LAYOUT = "base-word"

ROOT_SECTION_LABEL = "BASE WORD"

PREFIXES = [
    {
        "label": "pre-",
        "meaning": "before",
        "image": "images/prefixes/pre.png",
    },
    {
        "label": "re-",
        "meaning": "again; back",
        "image": "images/prefixes/re.png",
    },
]

ROOTS = [
    {
        "label": "view",
        "meaning": "see; look at",
        "image": "images/base-words/view.png",
    },
]

SUFFIXES = [
    {
        "label": "-s",
        "meaning": "more than one; or present-tense verb",
        "image": "images/suffixes/s.png",
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
        "label": "-er",
        "meaning": "one who; person who",
        "image": "images/suffixes/er-agent.png",
    },
    {
        "label": "-able",
        "meaning": "can be; able to be",
        "image": "images/suffixes/able.png",
    },
]

EXTENSIONS = []

CARD_INTRO = (
    "Cut apart the cards. Use them with the build mats on page 2."
)

CARD_NOTE = (
    "Keep VIEW as the base word. Add a prefix, a suffix, or both "
    "to build and compare related words."
)

MAT_NOTE = (
    "Start with VIEW in the blue base-word slot. "
    "Mat A adds a prefix. Mat B adds a suffix. "
    "Mat C adds both a prefix and a suffix."
)

WORD_LEVEL_CLUES = [
    "Build a word that means to view something before.",
    "Build a word that means to view or look at something again.",
    "Build a word that means more than one view.",
    "Build a word that means looked at in the past.",
    "Build a word that means looking at something now.",
    "Build a word for a person who views something.",
    "Build a word that means able to be viewed.",
    "Build a word that means looking at something again now.",
]

CONTEXT_CLUES = [
    "We watched a ______ of the movie before it came out.",
    "I will ______ my answers before I turn in my work.",
    "The lookout has several beautiful ______ of the mountains.",
    "Yesterday we ______ the exhibit at the museum.",
    "We are ______ the video together right now.",
    "Each ______ watched the short clip carefully.",
    "The document is ______ on the class website.",
    "She is ______ her notes before the quiz.",
]

EXTENSION_PROMPTS = []

CLUE_NOTE = (
    "Build each word from VIEW. Notice what changes when a prefix, "
    "suffix, or both are added."
)

RECORD_NOTE = (
    "Record each word you build. Word sum = show the parts you joined. "
    "Literal meaning = what the parts suggest; definition = what the whole word means."
)
