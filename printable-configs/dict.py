"""DICT Build & Discover packet."""

FAMILY = "DICT"
FLIGHT = "Migration Route 2"
LAYOUT = "single-prefix"

PREFIXES = [
    {"label": "pre-", "meaning": "before", "image": "images/prefixes/pre.png"},
]
ROOTS = [
    {"label": "dict", "meaning": "say or tell", "image": "images/roots/dict.png"},
]
SUFFIXES = [
    {"label": "-ed", "meaning": "marks past tense", "image": "images/suffixes/ed.png"},
    {"label": "-ing", "meaning": "shows an action in progress", "image": "images/suffixes/ing.png"},
    {"label": "-s", "meaning": "present tense with he, she, or it", "image": ""},
    {"label": "-ion", "meaning": "forms a noun naming an action or result", "image": "images/suffixes/ion.png"},
]

CARD_NOTE = "Use after teaching dict in Roots 1. Review pre-, -ed, -ing, -s, and -ion from Route 1."
MAT_NOTE = "Use pre- and dict to build a verb. Add a suffix to change how the word fits a sentence."

WORD_LEVEL_CLUES = [
    "Build a verb that means say what you think will happen.",
    "Build the past-tense form of that verb.",
    "Build the form that fits after “is” for an action happening now.",
    "Build the form that fits “She ____ the weather every day.”",
    "Build a noun for a statement about what someone expects to happen.",
]
CONTEXT_CLUES = [
    "We can ____ what might happen next by looking at the clues.",
    "Yesterday, Ava ____ rain before the first drops fell.",
    "The team is ____ tomorrow's water use right now.",
    "Each morning, the station ____ how hot it will get.",
    "His ____ about when the bus would arrive turned out to be right.",
]
