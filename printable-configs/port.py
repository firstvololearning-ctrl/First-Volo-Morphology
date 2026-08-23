"""PORT family content for the locked First Volo Build & Discover generator."""

FAMILY = "PORT"
FLIGHT = "Flight B"
ROOT_SECTION_LABEL = "ROOT / GREEK COMBINING FORM"
MAT_A_TITLE = "MAT A - one prefix or combining form"
MAT_A_PREFIX_LABEL = "PREFIX / COMBINING FORM"

PREFIXES = [
    {
        "label": "in- -> im-",
        "meaning": "in; into",
        "image": "images/prefixes/in-im-01.png",
    },
    {
        "label": "ex-",
        "meaning": "out; from",
        "image": "images/prefixes/ex.png",
    },
    {
        "label": "de-",
        "meaning": "off; from; down",
        "image": "images/prefixes/de.png",
    },
    {
        "label": "re-",
        "meaning": "again; back",
        "image": "images/prefixes/re.png",
    },
    {
        "label": "trans-",
        "meaning": "across",
        "image": "images/prefixes/trans.png",
    },
    {
        "label": "sub- -> sup-",
        "meaning": "under; below",
        "image": "images/prefixes/sub.png",
    },
]

ROOTS = [
    {
        "label": "port",
        "meaning": "carry",
        "image": "images/roots/port.png",
    },
    {
        "label": "tele",
        "meaning": "far; distant",
        "image": "images/roots/tele.png",
    },
]

SUFFIXES = [
    {
        "label": "-able",
        "meaning": "can be; able to be",
        "image": "images/suffixes/able.png",
    },
    {
        "label": "-er",
        "meaning": "one who; person or thing that",
        "image": "images/suffixes/er-agent.png",
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
        "meaning": "more than one",
        "image": "images/suffixes/s.png",
    },
]

EXTENSIONS = [
    {
        "label": "-ant",
        "meaning": "person or thing; having a quality",
        "image": "images/suffixes/ant.png",
    },
    {
        "label": "-ance",
        "meaning": "state, quality, or act",
        "image": "images/suffixes/ance.png",
    },
]

CARD_INTRO = "Cut apart the cards. Use them with the build mats on page 2."
CARD_NOTE = "Core cards build transparent PORT-family words. Later cards support noticing and extension."

MAT_NOTE = (
    "Not every build needs every slot. Use Mat A for core builds, "
    "Mat B for layered prefix builds, and Mat C for extension builds."
)

WORD_LEVEL_CLUES = [
    "Build a word that means to carry something into a place.",
    "Build a word that means to carry something out from a place.",
    "Build a word that means to carry something across or from one place to another.",
    "Build a word that means to carry something far away instantly.",
    "Build an adjective that means able to be carried.",
    "Build a word for a person who carries luggage or supplies.",
    "Build a word that means to tell or carry information back.",
    "Build a word that means to hold up from below.",
]

CONTEXT_CLUES = [
    "Many tropical fruits are ______ into the country from warmer places.",
    "The company will ______ apples to another state this fall.",
    "The movers will ______ the piano across town on Saturday.",
    "In the science-fiction movie, the robot can ______ to the space station.",
    "The folding stool is light and ______.",
    "The hotel ______ carried our bags upstairs.",
    "After the experiment, each team will ______ its results to the class.",
    "Strong beams ______ the balcony from below.",
]

EXTENSION_PROMPTS = [
    {"suffix": "-ant", "instruction": "Build a word with -ant."},
    {"suffix": "-ance", "instruction": "Build a word with -ance."},
]

CLUE_NOTE = (
    "Try the word-level clues first. Then use the sentence clues as a second way "
    "to build or check the same target words."
)

RECORD_NOTE = (
    "Record each word you build. Literal meaning = what the word parts suggest; "
    "definition = what the whole word means."
)

SESSION_RECIPES = [
    {
        "word": "teleport",
        "parts": ["tele", "port"],
        "word_prompt_index": 3,
        "context_prompt_index": 3,
    },
    {
        "word": "porter",
        "parts": ["port", "-er"],
        "word_prompt_index": 5,
        "context_prompt_index": 5,
    },
    {
        "word": "report",
        "parts": ["re-", "port"],
        "word_prompt_index": 6,
        "context_prompt_index": 6,
    },
    {
        "word": "support",
        "parts": ["sub- -> sup-", "port"],
        "word_prompt_index": 7,
        "context_prompt_index": 7,
    },
]
