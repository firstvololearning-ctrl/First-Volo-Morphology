"""JECT Build & Discover packet."""

FAMILY = "JECT"
FLIGHT = "Migration Route 3"
LAYOUT = "single-prefix"

PREFIXES = [
    {"label": "pro-", "meaning": "forward", "image": "images/prefixes/pro.png"},
]
ROOTS = [
    {"label": "ject", "meaning": "throw or cast", "image": "images/roots/ject.png"},
]
SUFFIXES = [
    {"label": "-ed", "meaning": "marks past tense", "image": "images/suffixes/ed.png"},
    {"label": "-ing", "meaning": "shows an action in progress", "image": "images/suffixes/ing.png"},
    {"label": "-s", "meaning": "present tense with he, she, or it", "image": ""},
    {"label": "-ion", "meaning": "forms a noun naming an action or result", "image": "images/suffixes/ion.png"},
]

CARD_NOTE = "Use after teaching ject in Roots 1. Review pro- from Route 2 and the endings from Route 1."
MAT_NOTE = "Use pro- and ject to build a verb. Compare the verb with the noun made by adding -ion."

WORD_LEVEL_CLUES = [
    "Build a verb that means cast light or an image onto a surface.",
    "Build the past-tense form of that verb.",
    "Build the form that fits after “is” for an action happening now.",
    "Build the form that fits “It ____ an image onto a screen.”",
    "Build a noun for the image cast onto a surface.",
]
CONTEXT_CLUES = [
    "The team will ____ the star map onto the ceiling.",
    "Yesterday, the team ____ the map onto a white wall.",
    "The machine is ____ an image onto the screen right now.",
    "Each night, the lamp ____ a pattern onto the wall.",
    "The ____ on the dome showed stars in the night sky.",
]
