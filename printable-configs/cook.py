"""COOK family - Flight A Build & Discover packet."""

FAMILY = "COOK"
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
    {
        "label": "over-",
        "meaning": "too much; above",
        "image": "images/prefixes/over.png",
    },
    {
        "label": "under-",
        "meaning": "too little; below",
        "image": "images/prefixes/under.png",
    },
]

ROOTS = [
    {
        "label": "cook",
        "meaning": "prepare food with heat",
        "image": "images/base-words/cook.png",
    },
]

SUFFIXES = [
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
        "meaning": "a person or thing that does something",
        "image": "images/suffixes/er-agent.png",
    },
    {
        "label": "-s",
        "meaning": "present-tense verb; or more than one",
        "image": "images/suffixes/s.png",
    },
]

EXTENSIONS = []

CARD_INTRO = (
    "Cut apart the cards. Use them with the build mats on page 2."
)

CARD_NOTE = (
    "Keep COOK as the base word. Add a prefix, a suffix, or both "
    "to build and compare related words."
)

MAT_NOTE = (
    "Start with COOK in the blue base-word slot. "
    "Mat A adds a prefix. Mat B adds a suffix. "
    "Mat C adds both a prefix and a suffix."
)

WORD_LEVEL_CLUES = [
    "Build a word that means to cook something before.",
    "Build a word that means to cook something again.",
    "Build a word that means to cook something too much.",
    "Build a word that means to cook something too little.",
    "Build a word that means cooked in the past.",
    "Build a word that means cooking right now.",
    "Build a word for a person or thing that cooks.",
    "Build a word that means cooked too much.",
]

CONTEXT_CLUES = [
    "The recipe says to ______ the crust before adding the filling.",
    "The chicken was still raw, so we had to ______ it.",
    "We left the vegetables in too long, so they were ______.",
    "The potatoes were still hard because they were ______.",
    "Yesterday, Dad ______ dinner for everyone.",
    "We are ______ pasta right now.",
    "The slow ______ keeps the soup warm all day.",
    "She ______ dinner every Friday.",
]

EXTENSION_PROMPTS = []

CLUE_NOTE = (
    "Build each word from COOK. Notice what changes when a prefix, "
    "suffix, or both are added."
)

RECORD_NOTE = (
    "Record each word you build. Word sum = show the parts you joined. "
    "Literal meaning = what the parts suggest; definition = what the whole word means."
)


# Roll & Build
ROLL_PREFIXES = [
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
    {
        "label": "over-",
        "meaning": "too much; above",
        "image": "images/prefixes/over.png",
    },
    {
        "label": "under-",
        "meaning": "too little; below",
        "image": "images/prefixes/under.png",
    },
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

ROLL_SUFFIXES = [
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
        "meaning": "a person or thing that does something",
        "image": "images/suffixes/er-agent.png",
    },
    {
        "label": "-s",
        "meaning": "present-tense verb; or more than one",
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
]

ROLL_BASE = {
    "label": "COOK",
    "image": "images/base-words/cook.png",
}

ROLL_NOTE = (
    "Use two regular dice. Roll once for a prefix and once for a suffix. "
    "Some high-use word parts appear twice."
)

SESSION_RECIPES = [
    {
        "word": "precook",
        "parts": ["pre-", "cook"],
        "word_prompt_index": 0,
        "context_prompt_index": 0,
    },
    {
        "word": "recook",
        "parts": ["re-", "cook"],
        "word_prompt_index": 1,
        "context_prompt_index": 1,
    },
    {
        "word": "undercook",
        "parts": ["under-", "cook"],
        "word_prompt_index": 3,
    },
    {
        "word": "cooked",
        "parts": ["cook", "-ed"],
        "word_prompt_index": 4,
        "context_prompt_index": 4,
    },
    {
        "word": "cooking",
        "parts": ["cook", "-ing"],
        "word_prompt_index": 5,
        "context_prompt_index": 5,
    },
    {
        "word": "cooker",
        "parts": ["cook", "-er"],
        "word_prompt_index": 6,
        "context_prompt_index": 6,
    },
    {
        "word": "cooks",
        "parts": ["cook", "-s"],
        "context_prompt_index": 7,
    },
]
