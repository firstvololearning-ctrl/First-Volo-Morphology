/* ========================================
   FIRST VOLO MORPHOLOGY
   Initial interactive version
   ======================================== */


/* ========================================
   PREFIX DATA

   Combined families are used for learning
   meanings. Individual spellings are used
   in words and generative activities.
   ======================================== */

const prefixes = [
  {
    id: "un",
    type: "prefix",
    label: "un-",
    speech: "un",
    meaning: "not; opposite of",
    image: "images/prefixes/un.png",
    examples: ["unhappy", "untie", "unfair"]
  },
  {
    id: "re",
    type: "prefix",
    label: "re-",
    speech: "ree",
    meaning: "again; back",
    image: "images/prefixes/re.png",
    examples: ["rebuild", "reread", "return"]
  },
  {
    id: "negative-in-family",
    type: "prefix",
    label: "in-, im-, il-, ir-",
    speech: "in, im, il, or ir",
    meaning: "not",
    image: "images/prefixes/in-im-il-ir.png",
    examples: ["inactive", "impossible", "illegal", "irregular"]
  },
  {
    id: "dis",
    type: "prefix",
    label: "dis-",
    speech: "dis",
    meaning: "apart or away; not; opposite of",
    image: "images/prefixes/dis.png",
    examples: ["disagree", "disconnect", "dismiss"]
  },
  {
    id: "en-em",
    type: "prefix",
    label: "en-, em-",
    speech: "en or em",
    meaning: "put into; cause to become",
    image: "images/prefixes/en-em.png",
    examples: ["encircle", "enrich", "empower", "embed"]
  },
  {
    id: "non",
    type: "prefix",
    label: "non-",
    speech: "non",
    meaning: "not",
    image: "images/prefixes/non.png",
    examples: ["nonverbal", "nonfiction", "nonstop"]
  },
  {
    id: "location-in-family",
    type: "prefix",
    label: "in-, im-",
    speech: "in or im",
    meaning: "in; into; inside",
    image: "images/prefixes/in-im-01.png",
    examples: ["inbound", "insert", "import", "immerse"]
  },
  {
    id: "over",
    type: "prefix",
    label: "over-",
    speech: "over",
    meaning: "above; too much",
    image: "images/prefixes/over.png",
    examples: ["overhead", "overcook", "overuse"]
  },
  {
    id: "mis",
    type: "prefix",
    label: "mis-",
    speech: "mis",
    meaning: "wrongly; badly",
    image: "images/prefixes/mis.png",
    examples: ["misread", "mistake", "misfire"]
  },
  {
    id: "sub",
    type: "prefix",
    label: "sub-",
    speech: "sub",
    meaning: "under; below",
    image: "images/prefixes/sub.png",
    examples: ["submarine", "subsoil", "submerge"]
  },
  {
    id: "pre",
    type: "prefix",
    label: "pre-",
    speech: "pree",
    meaning: "before",
    image: "images/prefixes/pre.png",
    examples: ["preview", "preheat", "preschool"]
  },
  {
    id: "inter",
    type: "prefix",
    label: "inter-",
    speech: "inter",
    meaning: "between; among",
    image: "images/prefixes/inter.png",
    examples: ["interact", "interstate", "international"]
  },
  {
    id: "fore",
    type: "prefix",
    label: "fore-",
    speech: "fore",
    meaning: "before; in front",
    image: "images/prefixes/fore.png",
    examples: ["forecast", "foretell", "forehead"]
  },
  {
    id: "de",
    type: "prefix",
    label: "de-",
    speech: "dee",
    meaning: "off; from; down",
    image: "images/prefixes/de.png",
    examples: ["defrost", "detach", "descend"]
  },
  {
    id: "trans",
    type: "prefix",
    label: "trans-",
    speech: "trans",
    meaning: "across; through",
    image: "images/prefixes/trans.png",
    examples: ["transport", "transfer", "transatlantic"]
  },
  {
    id: "super",
    type: "prefix",
    label: "super-",
    speech: "super",
    meaning: "above; beyond",
    image: "images/prefixes/super.png",
    examples: ["superhero", "superhuman", "superstructure"]
  },
  {
    id: "semi",
    type: "prefix",
    label: "semi-",
    speech: "semi",
    meaning: "half; partly",
    image: "images/prefixes/semi.png",
    examples: ["semicircle", "semicolon", "semifinal"]
  },
  {
    id: "anti",
    type: "prefix",
    label: "anti-",
    speech: "anti",
    meaning: "against",
    image: "images/prefixes/anti.png",
    examples: ["antifreeze", "antisocial", "antibacterial"]
  },
  {
    id: "mid",
    type: "prefix",
    label: "mid-",
    speech: "mid",
    meaning: "middle",
    image: "images/prefixes/mid.png",
    examples: ["midpoint", "midday", "midfield"]
  },
  {
    id: "under",
    type: "prefix",
    label: "under-",
    speech: "under",
    meaning: "below; too little",
    image: "images/prefixes/under.png",
    examples: ["underground", "underpaid", "undercook"]
  },
  {
    id: "ab",
    type: "prefix",
    label: "ab-",
    speech: "ab",
    meaning: "away; from",
    image: "images/prefixes/ab.png",
    examples: ["abduct", "absent", "abnormal"]
  },
  {
    id: "a-ad",
    type: "prefix",
    label: "a-, ad-",
    speech: "a or ad",
    meaning: "to; toward",
    image: "images/prefixes/ad.png",
    examples: ["advance", "adhere", "adjoin"]
  },
  {
    id: "con-com",
    type: "prefix",
    label: "con-, com-",
    speech: "con or com",
    meaning: "with; together",
    image: "images/prefixes/com-com.png",
    examples: ["connect", "combine", "communicate"]
  },
  {
    id: "e-ex",
    type: "prefix",
    label: "e-, ex-",
    speech: "e or ex",
    meaning: "out; from",
    image: "images/prefixes/e-ex.png",
    examples: ["emit", "export", "exhale"]
  },
  {
    id: "pro",
    type: "prefix",
    label: "pro-",
    speech: "pro",
    meaning: "forward; for",
    image: "images/prefixes/pro.png",
    examples: ["proceed", "promote", "project"]
  }
];


/* ========================================
   ROOT DATA
   ======================================== */

const roots = [
  {
    id: "bio",
    type: "root",
    label: "bio",
    speech: "bio",
    meaning: "life",
    image: "images/roots/bio.png",
    examples: ["biology", "biography", "biodegradable"]
  },
  {
    id: "chron",
    type: "root",
    label: "chron",
    speech: "chron",
    meaning: "time",
    image: "images/roots/chron.png",
    examples: ["chronology", "chronological", "synchronize"]
  },
  {
    id: "duct",
    type: "root",
    label: "duct/duce",
    speech: "duct or duce",
    meaning: "lead",
    image: "images/roots/duct-duce.png",
   examples: ["conduct", "introduce", "produce"]
  },
  {
    id: "fer",
    type: "root",
    label: "fer",
    speech: "fer",
    meaning: "carry; bear",
    image: "images/roots/fer.png",
  examples: ["transfer", "refer", "confer"]
  },
  {
    id: "ject",
    type: "root",
    label: "ject",
    speech: "ject",
    meaning: "throw",
    image: "images/roots/ject.png",
    examples: ["reject", "project", "eject"]
  },
  {
    id: "mit",
    type: "root",
    label: "mit",
    speech: "mit",
    meaning: "send",
    image: "images/roots/mit.png",
    examples: ["submit", "transmit", "emit"]
  },
  {
    id: "pel",
    type: "root",
    label: "pel",
    speech: "pel",
    meaning: "push; drive",
    image: "images/roots/pel.png",
    examples: ["repel", "compel", "propel"]
  },
  {
    id: "pend",
    type: "root",
    label: "pend/pens",
    speech: "pend or pens",
    meaning: "hang",
    image: "images/roots/pend-pens.png",
    examples: ["suspend", "pendant", "depend"]
  },
  {
    id: "port",
    type: "root",
    label: "port",
    speech: "port",
    meaning: "carry",
    image: "images/roots/port.png",
    examples: ["transport", "portable", "import"]
  },
  {
    id: "pos",
    type: "root",
    label: "pos",
    speech: "pos",
    meaning: "put; place",
    image: "images/roots/pos.png",
    examples: ["position", "deposit", "compose"]
  },
  {
    id: "put",
    type: "root",
    label: "put",
    speech: "put",
    meaning: "think; consider",
    image: "images/roots/put.png",
    examples: ["compute", "dispute", "reputation"]
  },
  {
    id: "rupt",
    type: "root",
    label: "rupt",
    speech: "rupt",
    meaning: "break",
    image: "images/roots/rupt.png",
    examples: ["rupture", "interrupt", "disrupt"]
  },
  {
    id: "scrib",
    type: "root",
    label: "scrib/script",
    speech: "scrib or script",
    meaning: "write",
    image: "images/roots/scrib-script.png",
    examples: ["describe", "scripted", "manuscript"]
  },
  {
    id: "sequ",
    type: "root",
    label: "sequ",
    speech: "sequ",
    meaning: "follow",
    image: "images/roots/sequ.png",
    examples: ["sequence", "consequence", "subsequent"]
  },
  {
    id: "spect",
    type: "root",
    label: "spect",
    speech: "spect",
    meaning: "look; watch",
    image: "images/roots/spect.png",
    examples: ["inspect", "spectator", "respect"]
  },
  {
    id: "struct",
    type: "root",
    label: "struct",
    speech: "struct",
    meaning: "build",
    image: "images/roots/struct.png",
    examples: ["construct", "structure", "instruct"]
  },
  {
    id: "ten",
    type: "root",
    label: "ten",
    speech: "ten",
    meaning: "hold",
    image: "images/roots/ten.png",
   examples: ["detention", "retention", "tenable"]
  },
  {
    id: "tract",
    type: "root",
    label: "tract",
    speech: "tract",
    meaning: "pull; draw",
    image: "images/roots/tract.png",
    examples: ["attract", "tractor", "extract"]
  },
  {
    id: "val",
    type: "root",
    label: "val",
    speech: "val",
    meaning: "be strong; be of worth",
    image: "images/roots/val.png",
    examples: ["value", "valid", "evaluate"]
  },
  {
    id: "ven",
    type: "root",
    label: "ven/vent",
    speech: "ven or vent",
    meaning: "come",
    image: "images/roots/ven-vent.png",
    examples: ["prevent", "convention", "intervene"]
  },
  {
    id: "vert",
    type: "root",
    label: "vert",
    speech: "vert",
    meaning: "turn",
    image: "images/roots/vert.png",
   examples: ["convert", "divert", "invert"]
  },
  {
    id: "voc",
    type: "root",
    label: "voc",
    speech: "voke",
    meaning: "call; voice",
    image: "images/roots/voc.png",
  examples: ["vocal", "vocation", "vocabulary"]
  },
  {
  id: "act",
  type: "root",
  label: "act",
  speech: "act",
  meaning: "do; act",
  image: "images/roots/act.png",
  examples: ["active", "activity", "inactive"]
},
{
  id: "aud",
  type: "root",
  label: "aud",
  speech: "aud",
  meaning: "hear",
  image: "images/roots/aud.png",
  examples: ["audio", "audible", "audience"]
},
{
  id: "cred",
  type: "root",
  label: "cred",
  speech: "cred",
  meaning: "believe; trust",
  image: "images/roots/cred.png",
  examples: ["credible", "credit", "incredible"]
},
{
  id: "dict",
  type: "root",
  label: "dict",
  speech: "dict",
  meaning: "say; tell",
  image: "images/roots/dict.png",
  examples: ["predict", "dictionary", "contradict"]
},
{
  id: "form",
  type: "root",
  label: "form",
  speech: "form",
  meaning: "shape; form",
  image: "images/roots/form.png",
  examples: ["transform", "reform", "formation"]
},
{
  id: "graph",
  type: "root",
  label: "graph",
  speech: "graph",
  meaning: "write; record",
  image: "images/roots/graph.png",
  examples: ["biography", "autograph", "graphic"]
},
{
  id: "mot",
  type: "root",
  label: "mot/mov",
  speech: "mot or move",
  meaning: "move",
  image: "images/roots/mot-mov.png",
  examples: ["motion", "movement", "remove"]
},
{
  id: "vis",
  type: "root",
  label: "vis/vid",
  speech: "vis or vid",
  meaning: "see",
  image: "images/roots/vis-vid.png",
  examples: ["visible", "vision", "video"]
}
];

/* ========================================
   SUFFIX DATA
   ======================================== */

const suffixes = [
   {
    id: "al",
    type: "suffix",
    label: "-al",
    speech: "al",
    meaning: "related to",
    image: "images/suffixes/al.png",
    examples: ["natural", "musical", "regional"]
  },
  {
    id: "ance",
    type: "suffix",
    label: "-ance",
    speech: "ance",
    meaning: "state, quality, or act",
    image: "images/suffixes/ance.png",
    examples: ["performance", "importance", "acceptance"]
  },
  {
    id: "ence",
    type: "suffix",
    label: "-ence",
    speech: "ence",
    meaning: "state, quality, or act",
    image: "images/suffixes/ence.png",
    examples: ["difference", "existence", "evidence"]
  },
  {
    id: "ic",
    type: "suffix",
    label: "-ic",
    speech: "ic",
    meaning: "related to",
    image: "images/suffixes/ic.png",
    examples: ["poetic", "scientific", "historic"]
  },
  {
    id: "ity",
    type: "suffix",
    label: "-ity",
    speech: "ity",
    meaning: "state or condition",
    image: "images/suffixes/ity.png",
    examples: ["activity", "clarity", "security"]
  },
  {
    id: "ive",
    type: "suffix",
    label: "-ive",
    speech: "ive",
    meaning: "having a quality; tending to",
    image: "images/suffixes/ive.png",
    examples: ["active", "creative", "sensitive"]
  },
  {
    id: "ist",
    type: "suffix",
    label: "-ist",
    speech: "ist",
    meaning: "person who does or studies",
    image: "images/suffixes/ist.png",
    examples: ["artist", "scientist", "pianist"]
  },
  {
    id: "ize",
    type: "suffix",
    label: "-ize",
    speech: "ize",
    meaning: "make; become",
    image: "images/suffixes/ize.png",
    examples: ["realize", "modernize", "organize"]
  },
  {
    id: "ify",
    type: "suffix",
    label: "-ify",
    speech: "ify",
    meaning: "make; cause to become",
    image: "images/suffixes/ify.png",
    examples: ["clarify", "simplify", "beautify"]
  },
  {
    id: "ness",
    type: "suffix",
    label: "-ness",
    speech: "ness",
    meaning: "state or quality",
    image: "images/suffixes/ness.png",
    examples: ["kindness", "darkness", "happiness"]
  },
  {
    id: "ology",
    type: "suffix",
    label: "-ology",
    speech: "ology",
    meaning: "study of",
    image: "images/suffixes/ology.png",
    examples: ["biology", "geology", "psychology"]
  },
 
  {
    id: "able-ible",
    type: "suffix",
    label: "-able, -ible",
    speech: "able or ible",
    meaning: "can be; able to be",
    image: "images/suffixes/able-ible.png",
    examples: ["portable", "readable", "visible"]
  },
  {
    id: "ed",
    type: "suffix",
    label: "-ed",
    speech: "ed",
    meaning: "past; already happened",
    image: "images/suffixes/ed.png",
    examples: ["walked", "jumped", "helped"]
  },
  {
    id: "er-or",
    type: "suffix",
    label: "-er, -or",
    speech: "er or or",
    meaning: "one who; person or thing that",
    image: "images/suffixes/er-or.png",
    examples: ["teacher", "writer", "inspector"]
  },
 {
  id: "er-more",
  type: "suffix",
  label: "-er",
  speech: "er",
  meaning: "more",
  image: "images/suffixes/er-more.png",
  examples: ["taller", "faster", "stronger"]
},
  {
    id: "est",
    type: "suffix",
    label: "-est",
    speech: "est",
    meaning: "the most",
    image: "images/suffixes/est.png",
    examples: ["tallest", "fastest", "strongest"]
  },
  {
    id: "ful",
    type: "suffix",
    label: "-ful",
    speech: "ful",
    meaning: "full of",
    image: "images/suffixes/ful.png",
    examples: ["helpful", "hopeful", "careful"]
  },
  {
    id: "ing",
    type: "suffix",
    label: "-ing",
    speech: "ing",
    meaning: "action happening now or in progress",
    image: "images/suffixes/ing.png",
    examples: ["running", "writing", "sleeping"]
  },
  {
    id: "ion",
    type: "suffix",
    label: "-ion, -tion, -sion",
    speech: "ion, tion, or sion",
    meaning: "act or process",
    image: "images/suffixes/ion.png",
    examples: ["construction", "action", "decision"]
  },
  {
    id: "less",
    type: "suffix",
    label: "-less",
    speech: "less",
    meaning: "without",
    image: "images/suffixes/less.png",
    examples: ["hopeless", "careless", "fearless"]
  },
  {
    id: "ly",
    type: "suffix",
    label: "-ly",
    speech: "lee",
    meaning: "how something is done",
    image: "images/suffixes/ly.png",
    examples: ["quickly", "slowly", "carefully"]
  },
  {
    id: "ment",
    type: "suffix",
    label: "-ment",
    speech: "ment",
    meaning: "act, result, or state",
    image: "images/suffixes/ment.png",
    examples: ["movement", "development", "enjoyment"]
  },
{
  id: "ous",
  type: "suffix",
  label: "-ous",
  speech: "us",
  meaning: "having the quality of",
  image: "images/suffixes/ous.png",
  examples: ["joyous", "dangerous", "famous"]
},
  {
    id: "s-es",
    type: "suffix",
    label: "-s, -es",
    speech: "s or es",
    meaning: "more than one",
    image: "images/suffixes/s-es.png",
    examples: ["books", "dogs", "boxes"]
  }
];
/* ========================================
   SUFFIX VARIANTS FOR WORD BUILDING
   ======================================== */

const suffixVariants = [
  {
    id: "able",
    type: "suffix",
    label: "-able",
    meaning: "can be; able to be",
    image: "images/suffixes/able.png"
  },
  {
    id: "ible",
    type: "suffix",
    label: "-ible",
    meaning: "can be; able to be",
    image: "images/suffixes/ible.png"
  },

  {
    id: "er-agent",
    type: "suffix",
    label: "-er",
    meaning: "one who; person or thing that",
    image: "images/suffixes/er-agent.png"
  },
  {
    id: "or-agent",
    type: "suffix",
    label: "-or",
    meaning: "one who; person or thing that",
    image: "images/suffixes/or.png"
  },

  {
    id: "er-more-build",
    type: "suffix",
    label: "-er",
    meaning: "more",
    image: "images/suffixes/er-more.png"
  },

  {
    id: "s",
    type: "suffix",
    label: "-s",
    meaning: "more than one",
    image: "images/suffixes/s.png"
  },
  {
    id: "es",
    type: "suffix",
    label: "-es",
    meaning: "more than one",
    image: "images/suffixes/es.png"
  }
];
/* ========================================
   FIND-THE-WORD-PART QUESTIONS
   ======================================== */

const prefixFindQuestions = [
  {
    type: "prefix",
    word: "preview",
    before: "",
    target: "pre",
    after: "view",
    answer: "pre-",
    choices: ["pre-", "re-", "un-", "dis-"],
    itemId: "pre",
    image: "images/prefixes/pre.png",
    base: "view = look at",
    literal: "view before",
    definition: "to look at or show something ahead of time"
  },
  {
    type: "prefix",
    word: "rebuild",
    before: "",
    target: "re",
    after: "build",
    answer: "re-",
    choices: ["re-", "pre-", "mis-", "sub-"],
    itemId: "re",
    image: "images/prefixes/re.png",
    base: "build = make or construct",
    literal: "build again",
    definition: "to build something again"
  },
  {
    type: "prefix",
    word: "unhappy",
    before: "",
    target: "un",
    after: "happy",
    answer: "un-",
    choices: ["un-", "non-", "re-", "over-"],
    itemId: "un",
    image: "images/prefixes/un.png",
    base: "happy = feeling pleased or glad",
    literal: "not happy",
    definition: "sad or not feeling happy"
  },
  {
    type: "prefix",
    word: "impossible",
    before: "",
    target: "im",
    after: "possible",
    answer: "im-",
    choices: ["im-", "in-", "inter-", "em-"],
    itemId: "negative-in-family",
    image: "images/prefixes/im-not.png",
    base: "possible = able to happen or be done",
    literal: "not possible",
    definition: "unable to happen or be done"
  },
  {
    type: "prefix",
    word: "illegal",
    before: "",
    target: "il",
    after: "legal",
    answer: "il-",
    choices: ["il-", "in-", "im-", "ir-"],
    itemId: "negative-in-family",
    image: "images/prefixes/il.png",
    base: "legal = allowed by law",
    literal: "not legal",
    definition: "not allowed by law"
  },
  {
    type: "prefix",
    word: "irregular",
    before: "",
    target: "ir",
    after: "regular",
    answer: "ir-",
    choices: ["ir-", "il-", "in-", "re-"],
    itemId: "negative-in-family",
    image: "images/prefixes/ir.png",
    base: "regular = following a usual pattern",
    literal: "not regular",
    definition: "not even, usual, or consistent"
  },
  {
    type: "prefix",
    word: "inactive",
    before: "",
    target: "in",
    after: "active",
    answer: "in-",
    choices: ["in-", "im-", "en-", "inter-"],
    itemId: "negative-in-family",
    image: "images/prefixes/in-not.png",
    base: "active = moving, working, or participating",
    literal: "not active",
    definition: "not moving, working, or participating"
  },
  {
    type: "prefix",
    word: "misread",
    before: "",
    target: "mis",
    after: "read",
    answer: "mis-",
    choices: ["mis-", "dis-", "re-", "non-"],
    itemId: "mis",
    image: "images/prefixes/mis.png",
    base: "read = understand written words",
    literal: "read wrongly",
    definition: "to read or understand something incorrectly"
  },
  {
    type: "prefix",
    word: "submarine",
    before: "",
    target: "sub",
    after: "marine",
    answer: "sub-",
    choices: ["sub-", "super-", "trans-", "under-"],
    itemId: "sub",
    image: "images/prefixes/sub.png",
    base: "marine = related to the sea",
    literal: "under the sea",
    definition: "a vessel designed to travel underwater"
  },
  {
    type: "prefix",
    word: "transport",
    before: "",
    target: "trans",
    after: "port",
    answer: "trans-",
    choices: ["trans-", "inter-", "pro-", "fore-"],
    itemId: "trans",
    image: "images/prefixes/trans.png",
    base: "port = carry",
    literal: "carry across",
    definition: "to move people or things from one place to another"
  },
  {
    type: "prefix",
    word: "semicircle",
    before: "",
    target: "semi",
    after: "circle",
    answer: "semi-",
    choices: ["semi-", "mid-", "sub-", "super-"],
    itemId: "semi",
    image: "images/prefixes/semi.png",
    base: "circle = a round shape",
    literal: "half a circle",
    definition: "one half of a circle"
  },
  {
    type: "prefix",
    word: "exhale",
    before: "",
    target: "ex",
    after: "hale",
    answer: "ex-",
    choices: ["ex-", "en-", "em-", "ab-"],
    itemId: "e-ex",
    image: "images/prefixes/ex.png",
    base: "hale = breathe",
    literal: "breathe out",
    definition: "to breathe air out"
  }
];

const rootFindQuestions = [
  {
    type: "root",
    word: "biology",
    before: "",
    target: "bio",
    after: "logy",
    answer: "bio",
    choices: ["bio", "chron", "spect", "struct"],
    itemId: "bio",
    base: "-logy = study of",
    literal: "study of life",
    definition: "the scientific study of living things"
  },
  {
    type: "root",
    word: "chronology",
    before: "",
    target: "chron",
    after: "ology",
    answer: "chron",
    choices: ["chron", "bio", "sequ", "ten"],
    itemId: "chron",
    base: "-logy = study or organization",
    literal: "organization by time",
    definition: "the arrangement of events in the order they happened"
  },
  {
    type: "root",
    word: "projection",
    before: "pro",
    target: "ject",
    after: "ion",
    answer: "ject",
    choices: ["ject", "mit", "tract", "port"],
    itemId: "ject",
    base: "pro- = forward",
    literal: "throw forward",
    definition: "something that extends, is shown, or is sent forward"
  },
  {
    type: "root",
    word: "transmit",
    before: "trans",
    target: "mit",
    after: "",
    answer: "mit",
    choices: ["mit", "port", "fer", "voc"],
    itemId: "mit",
    base: "trans- = across",
    literal: "send across",
    definition: "to send information, sound, or energy from one place to another"
  },
  {
    type: "root",
    word: "portable",
    before: "",
    target: "port",
    after: "able",
    answer: "port",
    choices: ["port", "tract", "struct", "pend"],
    itemId: "port",
    base: "-able = able to be",
    literal: "able to be carried",
    definition: "easy to carry or move"
  },
  {
    type: "root",
    word: "rupture",
    before: "",
    target: "rupt",
    after: "ure",
    answer: "rupt",
    choices: ["rupt", "struct", "scrib", "spect"],
    itemId: "rupt",
    base: "-ure = an act, condition, or result",
    literal: "a breaking",
    definition: "a break, tear, or burst"
  },
  {
    type: "root",
    word: "manuscript",
    before: "manu",
    target: "script",
    after: "",
    answer: "scrib/script",
    choices: ["scrib/script", "spect", "sequ", "struct"],
    itemId: "scrib",
    base: "manu = hand",
    literal: "written by hand",
    definition: "an original written or typed document"
  },
  {
    type: "root",
    word: "sequence",
    before: "",
    target: "sequ",
    after: "ence",
    answer: "sequ",
    choices: ["sequ", "spect", "struct", "tract"],
    itemId: "sequ",
    base: "-ence = state, quality, or act",
    literal: "things that follow",
    definition: "a set of things arranged in a particular order"
  },
  {
    type: "root",
    word: "inspect",
    before: "in",
    target: "spect",
    after: "",
    answer: "spect",
    choices: ["spect", "script", "struct", "tract"],
    itemId: "spect",
    base: "in- = in or into",
    literal: "look into",
    definition: "to look at something carefully"
  },
  {
    type: "root",
    word: "construct",
    before: "con",
    target: "struct",
    after: "",
    answer: "struct",
    choices: ["struct", "rupt", "tract", "port"],
    itemId: "struct",
    base: "con- = together",
    literal: "build together",
    definition: "to build or put parts together"
  },
  {
    type: "root",
    word: "attract",
    before: "at",
    target: "tract",
    after: "",
    answer: "tract",
    choices: ["tract", "port", "pend", "pel"],
    itemId: "tract",
    base: "at- = toward",
    literal: "pull toward",
    definition: "to draw something or someone toward"
  },
  {
    type: "root",
    word: "convert",
    before: "con",
    target: "vert",
    after: "",
    answer: "vert",
    choices: ["vert", "ven/vent", "val", "voc"],
    itemId: "vert",
    base: "con- = together or completely",
    literal: "turn or change",
    definition: "to change something into a different form"
  },
  {
  type: "root",
  word: "inactive",
  before: "in",
  target: "act",
  after: "ive",
  answer: "act",
  choices: ["act", "form", "spect", "struct"],
  itemId: "act",
  image: "images/roots/act.png",
  base: "in- = not; -ive = having a quality or tendency",
  literal: "not acting or active",
  definition: "not active or not taking part"
},
{
  type: "root",
  word: "audible",
  before: "",
  target: "aud",
  after: "ible",
  answer: "aud",
  choices: ["aud", "voc", "spect", "dict"],
  itemId: "aud",
  image: "images/roots/aud.png",
  base: "-ible = able to be",
  literal: "able to be heard",
  definition: "loud or clear enough to be heard"
},
{
  type: "root",
  word: "credible",
  before: "",
  target: "cred",
  after: "ible",
  answer: "cred",
  choices: ["cred", "dict", "val", "form"],
  itemId: "cred",
  image: "images/roots/cred.png",
  base: "-ible = able to be",
  literal: "able to be believed",
  definition: "believable or worthy of trust"
},
{
  type: "root",
  word: "predict",
  before: "pre",
  target: "dict",
  after: "",
  answer: "dict",
  choices: ["dict", "voc", "scrib/script", "sequ"],
  itemId: "dict",
  image: "images/roots/dict.png",
  base: "pre- = before",
  literal: "say before",
  definition: "to say what you think will happen before it happens"
},
{
  type: "root",
  word: "transform",
  before: "trans",
  target: "form",
  after: "",
  answer: "form",
  choices: ["form", "struct", "vert", "tract"],
  itemId: "form",
  image: "images/roots/form.png",
  base: "trans- = across; through",
  literal: "change form",
  definition: "to change into a different form"
},
{
  type: "root",
  word: "biography",
  before: "bio",
  target: "graph",
  after: "y",
  answer: "graph",
  choices: ["graph", "scrib/script", "dict", "voc"],
  itemId: "graph",
  image: "images/roots/graph.png",
  base: "bio = life",
  literal: "writing about a life",
  definition: "a written account of a person's life"
},
{
  type: "root",
  word: "motion",
  before: "",
  target: "mot",
  after: "ion",
  answer: "mot/mov",
  choices: ["mot/mov", "tract", "fer", "sequ"],
  itemId: "mot",
  image: "images/roots/mot.png",
  base: "-ion = act or process",
  literal: "act or process of moving",
  definition: "movement or the act of moving"
},
{
  type: "root",
  word: "visible",
  before: "",
  target: "vis",
  after: "ible",
  answer: "vis/vid",
  choices: ["vis/vid", "spect", "voc", "graph"],
  itemId: "vis",
  image: "images/roots/vis.png",
  base: "-ible = able to be",
  literal: "able to be seen",
  definition: "able to be seen"
}
];
const suffixFindQuestions = [
  {
    type: "suffix",
    word: "portable",
    before: "port",
    target: "able",
    after: "",
    answer: "-able",
    choices: ["-able", "-ful", "-less", "-ment"],
    itemId: "able-ible",
    image: "images/suffixes/able.png",
    base: "port = carry",
    literal: "can be carried",
    definition: "easy to carry or move"
  },
  {
    type: "suffix",
    word: "visible",
    before: "vis",
    target: "ible",
    after: "",
    answer: "-ible",
    choices: ["-ible", "-ous", "-ly", "-ed"],
    itemId: "able-ible",
    image: "images/suffixes/ible.png",
    base: "vis = see",
    literal: "can be seen",
    definition: "able to be seen"
  },
  {
    type: "suffix",
    word: "walked",
    before: "walk",
    target: "ed",
    after: "",
    answer: "-ed",
    choices: ["-ed", "-ing", "-ly", "-est"],
    itemId: "ed",
    image: "images/suffixes/ed.png",
    base: "walk = move on foot",
    literal: "walk in the past",
    definition: "moved on foot at an earlier time"
  },
  {
    type: "suffix",
    word: "teacher",
    before: "teach",
    target: "er",
    after: "",
    answer: "-er",
    choices: ["-er", "-or", "-ful", "-ment"],
    itemId: "er-or",
    image: "images/suffixes/er-agent.png",
    base: "teach = help someone learn",
    literal: "one who teaches",
    definition: "a person who teaches"
  },
  {
    type: "suffix",
    word: "inspector",
    before: "inspect",
    target: "or",
    after: "",
    answer: "-or",
    choices: ["-or", "-er", "-ous", "-less"],
    itemId: "er-or",
    image: "images/suffixes/or.png",
    base: "inspect = look at carefully",
    literal: "one who inspects",
    definition: "a person whose job is to inspect things"
  },
  {
    type: "suffix",
    word: "taller",
    before: "tall",
    target: "er",
    after: "",
    answer: "-er",
    choices: ["-er", "-est", "-ly", "-ful"],
    itemId: "er-more",
    image: "images/suffixes/er-more.png",
    base: "tall = having greater height",
    literal: "more tall",
    definition: "having more height than something else"
  },
  {
    type: "suffix",
    word: "fastest",
    before: "fast",
    target: "est",
    after: "",
    answer: "-est",
    choices: ["-est", "-er", "-ed", "-ing"],
    itemId: "est",
    image: "images/suffixes/est.png",
    base: "fast = moving quickly",
    literal: "the most fast",
    definition: "moving more quickly than all the others"
  },
  {
    type: "suffix",
    word: "helpful",
    before: "help",
    target: "ful",
    after: "",
    answer: "-ful",
    choices: ["-ful", "-less", "-ous", "-ly"],
    itemId: "ful",
    image: "images/suffixes/ful.png",
    base: "help = give assistance",
    literal: "full of help",
    definition: "giving help or making something easier"
  },
  {
    type: "suffix",
    word: "sleeping",
    before: "sleep",
    target: "ing",
    after: "",
    answer: "-ing",
    choices: ["-ing", "-ed", "-ly", "-ment"],
    itemId: "ing",
    image: "images/suffixes/ing.png",
    base: "sleep = rest",
    literal: "sleep happening now",
    definition: "being in the state of sleep"
  },
  {
    type: "suffix",
    word: "construction",
    before: "construc",
    target: "tion",
    after: "",
    answer: "-tion",
    choices: ["-tion", "-ment", "-ous", "-ful"],
    itemId: "ion",
    image: "images/suffixes/ion.png",
    base: "construct = build",
    literal: "act or process of building",
    definition: "the process of building something"
  },
  {
    type: "suffix",
    word: "hopeless",
    before: "hope",
    target: "less",
    after: "",
    answer: "-less",
    choices: ["-less", "-ful", "-ous", "-ly"],
    itemId: "less",
    image: "images/suffixes/less.png",
    base: "hope = feeling that something good may happen",
    literal: "without hope",
    definition: "having little or no hope"
  },
  {
    type: "suffix",
    word: "quickly",
    before: "quick",
    target: "ly",
    after: "",
    answer: "-ly",
    choices: ["-ly", "-ing", "-ed", "-ment"],
    itemId: "ly",
    image: "images/suffixes/ly.png",
    base: "quick = fast",
    literal: "in a quick way",
    definition: "in a fast way"
  },
  {
    type: "suffix",
    word: "movement",
    before: "move",
    target: "ment",
    after: "",
    answer: "-ment",
    choices: ["-ment", "-tion", "-ful", "-less"],
    itemId: "ment",
    image: "images/suffixes/ment.png",
    base: "move = change position",
    literal: "act or result of moving",
    definition: "the act of changing position or place"
  },
  {
    type: "suffix",
    word: "dangerous",
    before: "danger",
    target: "ous",
    after: "",
    answer: "-ous",
    choices: ["-ous", "-ful", "-less", "-ly"],
    itemId: "ous",
    image: "images/suffixes/ous.png",
    base: "danger = possibility of harm",
    literal: "having the quality of danger",
    definition: "likely to cause harm or injury"
  },
  {
    type: "suffix",
    word: "boxes",
    before: "box",
    target: "es",
    after: "",
    answer: "-es",
    choices: ["-es", "-s", "-ed", "-ing"],
    itemId: "s-es",
    image: "images/suffixes/es.png",
    base: "box = a container",
    literal: "more than one box",
    definition: "two or more boxes"
  },
  {
    type: "suffix",
    word: "books",
    before: "book",
    target: "s",
    after: "",
    answer: "-s",
    choices: ["-s", "-es", "-ed", "-ing"],
    itemId: "s-es",
    image: "images/suffixes/s.png",
    base: "book = a written work",
    literal: "more than one book",
    definition: "two or more books"
  }
];
/* ========================================
   WORD HUNT QUESTIONS
   ======================================== */

const wordHuntQuestions = [
  // PREFIXES
  {
    type: "prefix",
    itemId: "pre",
    label: "pre-",
    meaning: "before",
    words: [
      { word: "preview", correct: true, before: "", target: "pre", after: "view" },
      { word: "preheat", correct: true, before: "", target: "pre", after: "heat" },
      { word: "preschool", correct: true, before: "", target: "pre", after: "school" },
      { word: "pregame", correct: true, before: "", target: "pre", after: "game" },
      { word: "rebuild", correct: false },
      { word: "transport", correct: false },
      { word: "unhappy", correct: false },
      { word: "submarine", correct: false }
    ]
  },

  {
    type: "prefix",
    itemId: "re",
    label: "re-",
    meaning: "again; back",
    words: [
      { word: "rebuild", correct: true, before: "", target: "re", after: "build" },
      { word: "reread", correct: true, before: "", target: "re", after: "read" },
      { word: "rewrite", correct: true, before: "", target: "re", after: "write" },
      { word: "return", correct: true, before: "", target: "re", after: "turn" },
      { word: "preview", correct: false },
      { word: "misread", correct: false },
      { word: "export", correct: false },
      { word: "unhappy", correct: false }
    ]
  },

  {
    type: "prefix",
    itemId: "sub",
    label: "sub-",
    meaning: "under; below",
    words: [
      { word: "submarine", correct: true, before: "", target: "sub", after: "marine" },
      { word: "subsoil", correct: true, before: "", target: "sub", after: "soil" },
      { word: "submerge", correct: true, before: "", target: "sub", after: "merge" },
      { word: "subset", correct: true, before: "", target: "sub", after: "set" },
      { word: "superhuman", correct: false },
      { word: "transport", correct: false },
      { word: "preview", correct: false },
      { word: "nonverbal", correct: false }
    ]
  },

  {
    type: "prefix",
    itemId: "mis",
    label: "mis-",
    meaning: "wrongly; badly",
    words: [
      { word: "misread", correct: true, before: "", target: "mis", after: "read" },
      { word: "misfire", correct: true, before: "", target: "mis", after: "fire" },
      { word: "misplace", correct: true, before: "", target: "mis", after: "place" },
      { word: "mistake", correct: true, before: "", target: "mis", after: "take" },
      { word: "reread", correct: false },
      { word: "disconnect", correct: false },
      { word: "preview", correct: false },
      { word: "overcook", correct: false }
    ]
  },

  // ROOTS
  {
    type: "root",
    itemId: "struct",
    label: "struct",
    meaning: "build",
    words: [
      { word: "construct", correct: true, before: "con", target: "struct", after: "" },
      { word: "structure", correct: true, before: "", target: "struct", after: "ure" },
      { word: "reconstruct", correct: true, before: "recon", target: "struct", after: "" },
      { word: "instruct", correct: true, before: "in", target: "struct", after: "" },
      { word: "transport", correct: false },
      { word: "inspect", correct: false },
      { word: "rupture", correct: false },
      { word: "sequence", correct: false }
    ]
  },

  {
    type: "root",
    itemId: "port",
    label: "port",
    meaning: "carry",
    words: [
      { word: "transport", correct: true, before: "trans", target: "port", after: "" },
      { word: "portable", correct: true, before: "", target: "port", after: "able" },
      { word: "import", correct: true, before: "im", target: "port", after: "" },
      { word: "export", correct: true, before: "ex", target: "port", after: "" },
      { word: "construct", correct: false },
      { word: "rupture", correct: false },
      { word: "spectator", correct: false },
      { word: "sequence", correct: false }
    ]
  },

  {
    type: "root",
    itemId: "spect",
    label: "spect",
    meaning: "look; watch",
    words: [
      { word: "inspect", correct: true, before: "in", target: "spect", after: "" },
      { word: "spectator", correct: true, before: "", target: "spect", after: "ator" },
      { word: "respect", correct: true, before: "re", target: "spect", after: "" },
      { word: "perspective", correct: true, before: "per", target: "spect", after: "ive" },
      { word: "manuscript", correct: false },
      { word: "transport", correct: false },
      { word: "structure", correct: false },
      { word: "sequence", correct: false }
    ]
  },

  {
    type: "root",
    itemId: "rupt",
    label: "rupt",
    meaning: "break",
    words: [
      { word: "rupture", correct: true, before: "", target: "rupt", after: "ure" },
      { word: "interrupt", correct: true, before: "inter", target: "rupt", after: "" },
      { word: "disrupt", correct: true, before: "dis", target: "rupt", after: "" },
      { word: "eruption", correct: true, before: "e", target: "rupt", after: "ion" },
      { word: "construct", correct: false },
      { word: "portable", correct: false },
      { word: "sequence", correct: false },
      { word: "inspect", correct: false }
    ]
  },

  // SUFFIXES
  {
    type: "suffix",
    itemId: "ful",
    label: "-ful",
    meaning: "full of",
    words: [
      { word: "helpful", correct: true, before: "help", target: "ful", after: "" },
      { word: "hopeful", correct: true, before: "hope", target: "ful", after: "" },
      { word: "careful", correct: true, before: "care", target: "ful", after: "" },
      { word: "playful", correct: true, before: "play", target: "ful", after: "" },
      { word: "hopeless", correct: false },
      { word: "quickly", correct: false },
      { word: "movement", correct: false },
      { word: "walked", correct: false }
    ]
  },

  {
    type: "suffix",
    itemId: "less",
    label: "-less",
    meaning: "without",
    words: [
      { word: "hopeless", correct: true, before: "hope", target: "less", after: "" },
      { word: "careless", correct: true, before: "care", target: "less", after: "" },
      { word: "fearless", correct: true, before: "fear", target: "less", after: "" },
      { word: "speechless", correct: true, before: "speech", target: "less", after: "" },
      { word: "helpful", correct: false },
      { word: "slowly", correct: false },
      { word: "movement", correct: false },
      { word: "jumped", correct: false }
    ]
  },

  {
    type: "suffix",
    itemId: "ing",
    label: "-ing",
    meaning: "action happening now or in progress",
    words: [
      { word: "running", correct: true, before: "runn", target: "ing", after: "" },
      { word: "writing", correct: true, before: "writ", target: "ing", after: "" },
      { word: "sleeping", correct: true, before: "sleep", target: "ing", after: "" },
      { word: "jumping", correct: true, before: "jump", target: "ing", after: "" },
      { word: "walked", correct: false },
      { word: "helpful", correct: false },
      { word: "fastest", correct: false },
      { word: "movement", correct: false }
    ]
  },

  {
    type: "suffix",
    itemId: "ed",
    label: "-ed",
    meaning: "past; already happened",
    words: [
      { word: "walked", correct: true, before: "walk", target: "ed", after: "" },
      { word: "jumped", correct: true, before: "jump", target: "ed", after: "" },
      { word: "helped", correct: true, before: "help", target: "ed", after: "" },
      { word: "painted", correct: true, before: "paint", target: "ed", after: "" },
      { word: "running", correct: false },
      { word: "hopeful", correct: false },
      { word: "fastest", correct: false },
      { word: "boxes", correct: false }
    ]
  }
];

/* ========================================
   FIGURE-IT-OUT QUESTIONS
   ======================================== */

const inferQuestions = [
  {
    type: "prefix",
    knownLabel: "pre-",
    knownMeaning: "before",
    word: "preview",
    correct: "to look at or show something ahead of time",
    choices: [
      "to look at or show something ahead of time",
      "to look at something again",
      "to stop looking at something",
      "to look underneath something"
    ],
    literal: "view before",
    definition: "to look at or show something ahead of time",
    image: "images/prefixes/pre.png"
  },
  {
    type: "prefix",
    knownLabel: "re-",
    knownMeaning: "again",
    word: "reconstruct",
    correct: "to build something again",
    choices: [
      "to build something again",
      "to break something apart",
      "to build something underneath",
      "to carry something away"
    ],
    literal: "build again",
    definition: "to build or form something again",
    image: "images/prefixes/re.png"
  },
  {
    type: "prefix",
    knownLabel: "sub-",
    knownMeaning: "under",
    word: "subsoil",
    correct: "the layer of soil underneath the topsoil",
    choices: [
      "the layer of soil underneath the topsoil",
      "soil that has been removed",
      "soil from another place",
      "soil that is too dry"
    ],
    literal: "soil under",
    definition: "the layer of soil directly beneath the surface soil",
    image: "images/prefixes/sub.png"
  },
  {
    type: "prefix",
    knownLabel: "mis-",
    knownMeaning: "wrongly",
    word: "miscalculate",
    correct: "to calculate something incorrectly",
    choices: [
      "to calculate something incorrectly",
      "to calculate something again",
      "to calculate something before an event",
      "to avoid calculating something"
    ],
    literal: "calculate wrongly",
    definition: "to make a mistake when calculating",
    image: "images/prefixes/mis.png"
  },
  {
    type: "root",
    knownLabel: "spect",
    knownMeaning: "look or watch",
    word: "spectator",
    correct: "a person who watches an event",
    choices: [
      "a person who watches an event",
      "a person who builds something",
      "a person who carries something",
      "a person who writes a story"
    ],
    literal: "one who watches",
    definition: "a person who watches an event or performance",
    image: "images/roots/spect.png"
  },
  {
    type: "root",
    knownLabel: "rupt",
    knownMeaning: "break",
    word: "disrupt",
    correct: "to interrupt or break apart an activity",
    choices: [
      "to interrupt or break apart an activity",
      "to build an activity again",
      "to follow an activity closely",
      "to write about an activity"
    ],
    literal: "break apart",
    definition: "to interrupt something and prevent it from continuing normally",
    image: "images/roots/rupt.png"
  },
  {
    type: "root",
    knownLabel: "port",
    knownMeaning: "carry",
    word: "portable",
    correct: "easy to carry or move",
    choices: [
      "easy to carry or move",
      "difficult to break",
      "able to be written on",
      "made to remain still"
    ],
    literal: "able to be carried",
    definition: "easy to carry or move",
    image: "images/roots/port.png"
  },
  {
    type: "root",
    knownLabel: "struct",
    knownMeaning: "build",
    word: "structure",
    correct: "something that has been built or organized",
    choices: [
      "something that has been built or organized",
      "something that has been broken",
      "something that has been carried",
      "something that has been hidden"
    ],
    literal: "a building or arrangement",
    definition: "something built or arranged in an organized way",
    image: "images/roots/struct.png"
  },
  {
    type: "root",
    knownLabel: "sequ",
    knownMeaning: "follow",
    word: "subsequent",
    correct: "coming after something else",
    choices: [
      "coming after something else",
      "happening before everything else",
      "moving away from something",
      "breaking into several pieces"
    ],
    literal: "following after",
    definition: "coming after something else in time or order",
    image: "images/roots/sequ.png"
  }
  ,
  {
    type: "suffix",
    knownLabel: "-able",
    knownMeaning: "can be; able to be",
    word: "washable",
    correct: "able to be washed",
    choices: [
      "able to be washed",
      "already washed",
      "washing right now",
      "full of washing"
    ],
    literal: "can be washed",
    definition: "able to be washed without being damaged",
    image: "images/suffixes/able.png"
  },
  {
    type: "suffix",
    knownLabel: "-ible",
    knownMeaning: "can be; able to be",
    word: "visible",
    correct: "able to be seen",
    choices: [
      "able to be seen",
      "unable to be seen",
      "someone who sees",
      "the act of seeing"
    ],
    literal: "can be seen",
    definition: "able to be seen",
    image: "images/suffixes/ible.png"
  },
  {
    type: "suffix",
    knownLabel: "-ful",
    knownMeaning: "full of",
    word: "hopeful",
    correct: "having or showing hope",
    choices: [
      "having or showing hope",
      "without hope",
      "more hopeful than another",
      "the act of hoping"
    ],
    literal: "full of hope",
    definition: "feeling or showing hope that something good will happen",
    image: "images/suffixes/ful.png"
  },
  {
    type: "suffix",
    knownLabel: "-less",
    knownMeaning: "without",
    word: "fearless",
    correct: "not afraid",
    choices: [
      "not afraid",
      "full of fear",
      "more afraid",
      "acting fearfully"
    ],
    literal: "without fear",
    definition: "showing little or no fear",
    image: "images/suffixes/less.png"
  },
  {
    type: "suffix",
    knownLabel: "-er",
    knownMeaning: "one who",
    word: "teacher",
    correct: "a person who teaches",
    choices: [
      "a person who teaches",
      "something that was taught",
      "the act of teaching",
      "more difficult to teach"
    ],
    literal: "one who teaches",
    definition: "a person whose work is helping others learn",
    image: "images/suffixes/er-agent.png"
  },
  {
    type: "suffix",
    knownLabel: "-or",
    knownMeaning: "one who",
    word: "inspector",
    correct: "a person who inspects",
    choices: [
      "a person who inspects",
      "something that was inspected",
      "the act of inspecting",
      "able to be inspected"
    ],
    literal: "one who inspects",
    definition: "a person whose job is to examine something carefully",
    image: "images/suffixes/or.png"
  },
  {
    type: "suffix",
    knownLabel: "-er",
    knownMeaning: "more",
    word: "taller",
    correct: "having more height",
    choices: [
      "having more height",
      "having the most height",
      "without height",
      "a person who measures height"
    ],
    literal: "more tall",
    definition: "having greater height than someone or something else",
    image: "images/suffixes/er-more.png"
  },
  {
    type: "suffix",
    knownLabel: "-est",
    knownMeaning: "the most",
    word: "fastest",
    correct: "moving faster than all the others",
    choices: [
      "moving faster than all the others",
      "moving faster than one other thing",
      "moving slowly",
      "having moved in the past"
    ],
    literal: "the most fast",
    definition: "moving more quickly than all the others being compared",
    image: "images/suffixes/est.png"
  },
  {
    type: "suffix",
    knownLabel: "-ing",
    knownMeaning: "action happening now or in progress",
    word: "jumping",
    correct: "the action of jumping is happening",
    choices: [
      "the action of jumping is happening",
      "the jumping already happened",
      "a person who jumps",
      "able to jump"
    ],
    literal: "jump happening or in progress",
    definition: "performing the action of jumping",
    image: "images/suffixes/ing.png"
  },
  {
    type: "suffix",
    knownLabel: "-ed",
    knownMeaning: "past; already happened",
    word: "jumped",
    correct: "the jumping happened earlier",
    choices: [
      "the jumping happened earlier",
      "the jumping is happening now",
      "someone who jumps",
      "able to jump"
    ],
    literal: "jump in the past",
    definition: "performed the action of jumping at an earlier time",
    image: "images/suffixes/ed.png"
  },
  {
    type: "suffix",
    knownLabel: "-ly",
    knownMeaning: "how something is done",
    word: "slowly",
    correct: "in a slow way",
    choices: [
      "in a slow way",
      "the slowest",
      "without slowness",
      "a person who is slow"
    ],
    literal: "in a slow way",
    definition: "in a way that is not fast",
    image: "images/suffixes/ly.png"
  },
  {
    type: "suffix",
    knownLabel: "-ment",
    knownMeaning: "act, result, or state",
    word: "movement",
    correct: "the act of moving",
    choices: [
      "the act of moving",
      "someone who moves",
      "able to move",
      "moving in the past"
    ],
    literal: "act or result of moving",
    definition: "the act or process of changing position or place",
    image: "images/suffixes/ment.png"
  },
  {
    type: "suffix",
    knownLabel: "-tion",
    knownMeaning: "act or process",
    word: "construction",
    correct: "the process of building",
    choices: [
      "the process of building",
      "a person who builds",
      "able to be built",
      "building again"
    ],
    literal: "act or process of building",
    definition: "the process of building or putting something together",
    image: "images/suffixes/ion.png"
  },
  {
    type: "suffix",
    knownLabel: "-ous",
    knownMeaning: "having the quality of",
    word: "dangerous",
    correct: "having qualities that may cause harm",
    choices: [
      "having qualities that may cause harm",
      "without danger",
      "more dangerous than another",
      "the act of causing danger"
    ],
    literal: "having the quality of danger",
    definition: "likely to cause harm or injury",
    image: "images/suffixes/ous.png"
  },
  {
    type: "suffix",
    knownLabel: "-s",
    knownMeaning: "more than one",
    word: "books",
    correct: "more than one book",
    choices: [
      "more than one book",
      "a person who reads books",
      "a book from the past",
      "able to be booked"
    ],
    literal: "more than one book",
    definition: "two or more books",
    image: "images/suffixes/s.png"
  },
  {
    type: "suffix",
    knownLabel: "-es",
    knownMeaning: "more than one",
    word: "boxes",
    correct: "more than one box",
    choices: [
      "more than one box",
      "a person who makes boxes",
      "a box from the past",
      "able to be boxed"
    ],
    literal: "more than one box",
    definition: "two or more boxes",
    image: "images/suffixes/es.png"
  }
];


/* ========================================
   PREFIX + ROOT BUILDING DATA
   ======================================== */

const buildWords = [
  {
    word: "construct",
    prefixId: "con",
    prefix: "con-",
    prefixMeaning: "together",
    rootId: "struct",
    root: "struct",
    rootMeaning: "build",
    literal: "build together",
    definition: "to build or put parts together"
  },
    {
    word: "interrupt",
    prefixId: "inter",
    prefix: "inter-",
    prefixMeaning: "between",
    rootId: "rupt",
    root: "rupt",
    rootMeaning: "break",
    literal: "break between",
    definition: "to break into something; to stop it briefly"
  },
  {
    word: "transport",
    prefixId: "trans",
    prefix: "trans-",
    prefixMeaning: "across",
    rootId: "port",
    root: "port",
    rootMeaning: "carry",
    literal: "carry across",
    definition: "to move people or things from one place to another"
  },
  {
    word: "import",
    prefixId: "im",
    prefix: "im-",
    prefixMeaning: "into",
    rootId: "port",
    root: "port",
    rootMeaning: "carry",
    literal: "carry into",
    definition: "to bring goods or information into a place"
  },
  {
    word: "export",
    prefixId: "ex",
    prefix: "ex-",
    prefixMeaning: "out",
    rootId: "port",
    root: "port",
    rootMeaning: "carry",
    literal: "carry out",
    definition: "to send goods or information out to another place"
  },
  {
    word: "reject",
    prefixId: "re",
    prefix: "re-",
    prefixMeaning: "back",
    rootId: "ject",
    root: "ject",
    rootMeaning: "throw",
    literal: "throw back",
    definition: "to refuse to accept, use, or believe something"
  },
  {
    word: "project",
    prefixId: "pro",
    prefix: "pro-",
    prefixMeaning: "forward",
    rootId: "ject",
    root: "ject",
    rootMeaning: "throw",
    literal: "throw forward",
    definition: "to extend, send, or show something forward"
  },
  {
    word: "emit",
    prefixId: "e",
    prefix: "e-",
    prefixMeaning: "out",
    rootId: "mit",
    root: "mit",
    rootMeaning: "send",
    literal: "send out",
    definition: "to send out light, sound, heat, gas, or another substance"
  },
  {
    word: "transmit",
    prefixId: "trans",
    prefix: "trans-",
    prefixMeaning: "across",
    rootId: "mit",
    root: "mit",
    rootMeaning: "send",
    literal: "send across",
    definition: "to send information, sound, or energy from one place to another"
  },
  {
    word: "inspect",
    prefixId: "in",
    prefix: "in-",
    prefixMeaning: "in; into",
    rootId: "spect",
    root: "spect",
    rootMeaning: "look",
    literal: "look into",
    definition: "to look at something carefully"
  },
  {
    word: "abduct",
    prefixId: "ab",
    prefix: "ab-",
    prefixMeaning: "away",
    rootId: "duct",
    root: "duct",
    rootMeaning: "lead",
    literal: "lead away",
    definition: "to take a person away by force"
  },
  {
    word: "convert",
    prefixId: "con",
    prefix: "con-",
    prefixMeaning: "together; completely",
    rootId: "vert",
    root: "vert",
    rootMeaning: "turn",
    literal: "turn or change",
    definition: "to change something into a different form"
  }
];

/* ========================================
   ROOT / BASE + SUFFIX BUILDING DATA
   ======================================== */

const rootSuffixBuildWords = [
  {
    word: "portable",
    baseId: "port",
    base: "port",
    baseMeaning: "carry",
    suffixId: "able",
    suffix: "-able",
    suffixMeaning: "can be; able to be",
    literal: "able to be carried",
    definition: "easy to carry or move"
  },
  {
    word: "readable",
    baseId: "read",
    base: "read",
    baseMeaning: "understand written words",
    suffixId: "able",
    suffix: "-able",
    suffixMeaning: "can be; able to be",
    literal: "able to be read",
    definition: "easy or possible to read"
  },
  {
    word: "visible",
    baseId: "vis",
    base: "vis",
    baseMeaning: "see",
    suffixId: "ible",
    suffix: "-ible",
    suffixMeaning: "can be; able to be",
    literal: "able to be seen",
    definition: "able to be seen"
  },
  {
    word: "teacher",
    baseId: "teach",
    base: "teach",
    baseMeaning: "help someone learn",
    suffixId: "er-agent",
    suffix: "-er",
    suffixMeaning: "one who",
    literal: "one who teaches",
    definition: "a person who teaches"
  },
  {
    word: "inspector",
    baseId: "inspect",
    base: "inspect",
    baseMeaning: "look at carefully",
    suffixId: "or-agent",
    suffix: "-or",
    suffixMeaning: "one who",
    literal: "one who inspects",
    definition: "a person whose job is to inspect things"
  },
  {
    word: "taller",
    baseId: "tall",
    base: "tall",
    baseMeaning: "having greater height",
    suffixId: "er-more-build",
    suffix: "-er",
    suffixMeaning: "more",
    literal: "more tall",
    definition: "having greater height than something else"
  },
  {
    word: "fastest",
    baseId: "fast",
    base: "fast",
    baseMeaning: "moving quickly",
    suffixId: "est",
    suffix: "-est",
    suffixMeaning: "the most",
    literal: "the most fast",
    definition: "moving more quickly than all the others"
  },
  {
    word: "helpful",
    baseId: "help",
    base: "help",
    baseMeaning: "give assistance",
    suffixId: "ful",
    suffix: "-ful",
    suffixMeaning: "full of",
    literal: "full of help",
    definition: "giving help or making something easier"
  },
  {
    word: "hopeless",
    baseId: "hope",
    base: "hope",
    baseMeaning: "expect something good",
    suffixId: "less",
    suffix: "-less",
    suffixMeaning: "without",
    literal: "without hope",
    definition: "having little or no hope"
  },
  {
    word: "quickly",
    baseId: "quick",
    base: "quick",
    baseMeaning: "fast",
    suffixId: "ly",
    suffix: "-ly",
    suffixMeaning: "how something is done",
    literal: "in a quick way",
    definition: "in a fast way"
  },
  {
    word: "movement",
    baseId: "move",
    base: "move",
    baseMeaning: "change position",
    suffixId: "ment",
    suffix: "-ment",
    suffixMeaning: "act, result, or state",
    literal: "act or result of moving",
    definition: "the act or process of changing position"
  },
  {
    word: "dangerous",
    baseId: "danger",
    base: "danger",
    baseMeaning: "possibility of harm",
    suffixId: "ous",
    suffix: "-ous",
    suffixMeaning: "having the quality of",
    literal: "having the quality of danger",
    definition: "likely to cause harm or injury"
  },
  {
    word: "kindness",
    baseId: "kind",
    base: "kind",
    baseMeaning: "caring or helpful",
    suffixId: "ness",
    suffix: "-ness",
    suffixMeaning: "state or quality",
    literal: "state or quality of being kind",
    definition: "the quality of being kind"
  },
  {
    word: "musical",
    baseId: "music",
    base: "music",
    baseMeaning: "organized sound",
    suffixId: "al",
    suffix: "-al",
    suffixMeaning: "related to",
    literal: "related to music",
    definition: "related to music"
  },
  {
    word: "poetic",
    baseId: "poet",
    base: "poet",
    baseMeaning: "a person who writes poetry",
    suffixId: "ic",
    suffix: "-ic",
    suffixMeaning: "related to",
    literal: "related to poetry or a poet",
    definition: "having qualities associated with poetry"
  },
  {
    word: "active",
    baseId: "act",
    base: "act",
    baseMeaning: "do; take action",
    suffixId: "ive",
    suffix: "-ive",
    suffixMeaning: "having a quality; tending to",
    literal: "tending to act",
    definition: "doing things or being involved in activity"
  },
  {
    word: "artist",
    baseId: "art",
    base: "art",
    baseMeaning: "creative work",
    suffixId: "ist",
    suffix: "-ist",
    suffixMeaning: "person who does or studies",
    literal: "person who does art",
    definition: "a person who creates art"
  },
  {
    word: "modernize",
    baseId: "modern",
    base: "modern",
    baseMeaning: "current or up to date",
    suffixId: "ize",
    suffix: "-ize",
    suffixMeaning: "make; become",
    literal: "make modern",
    definition: "to make something more modern"
  },
  {
    word: "classify",
    baseId: "class",
    base: "class",
    baseMeaning: "group or category",
    suffixId: "ify",
    suffix: "-ify",
    suffixMeaning: "make; cause to become",
    literal: "make into a class or group",
    definition: "to arrange things into groups or categories"
  },
  {
    word: "performance",
    baseId: "perform",
    base: "perform",
    baseMeaning: "carry out or present",
    suffixId: "ance",
    suffix: "-ance",
    suffixMeaning: "state, quality, or act",
    literal: "act or result of performing",
    definition: "the act of performing or carrying something out"
  },
  {
    word: "existence",
    baseId: "exist",
    base: "exist",
    baseMeaning: "be or be present",
    suffixId: "ence",
    suffix: "-ence",
    suffixMeaning: "state, quality, or act",
    literal: "state of existing",
    definition: "the state of being real or present"
  },
  {
    word: "jumped",
    baseId: "jump",
    base: "jump",
    baseMeaning: "push oneself into the air",
    suffixId: "ed",
    suffix: "-ed",
    suffixMeaning: "past; already happened",
    literal: "jump in the past",
    definition: "performed the action of jumping earlier"
  },
  {
    word: "jumping",
    baseId: "jump",
    base: "jump",
    baseMeaning: "push oneself into the air",
    suffixId: "ing",
    suffix: "-ing",
    suffixMeaning: "action happening now or in progress",
    literal: "jump happening or in progress",
    definition: "performing the action of jumping"
  },
  {
    word: "books",
    baseId: "book",
    base: "book",
    baseMeaning: "a written work",
    suffixId: "s",
    suffix: "-s",
    suffixMeaning: "more than one",
    literal: "more than one book",
    definition: "two or more books"
  },
  {
    word: "boxes",
    baseId: "box",
    base: "box",
    baseMeaning: "a container",
    suffixId: "es",
    suffix: "-es",
    suffixMeaning: "more than one",
    literal: "more than one box",
    definition: "two or more boxes"
  }
];
/* ========================================
   PREFIX + ROOT / BASE + SUFFIX BUILDING DATA
   ======================================== */

const prefixRootSuffixBuildWords = [
  {
    word: "construction",
    prefixId: "con",
    prefix: "con-",
    prefixMeaning: "together",
    baseId: "struct",
    base: "struct",
    baseMeaning: "build",
    suffixId: "ion",
    suffix: "-tion",
    suffixMeaning: "act or process",
    literal: "process of building together",
    definition: "the process of building or putting something together"
  },
  {
    word: "projection",
    prefixId: "pro",
    prefix: "pro-",
    prefixMeaning: "forward",
    baseId: "ject",
    base: "ject",
    baseMeaning: "throw",
    suffixId: "ion",
    suffix: "-ion",
    suffixMeaning: "act or process",
    literal: "act or result of throwing forward",
    definition: "the act or result of projecting something forward"
  },
  {
    word: "inactive",
    prefixId: "in",
    prefix: "in-",
    prefixMeaning: "not",
    baseId: "act",
    base: "act",
    baseMeaning: "do; act",
    suffixId: "ive",
    suffix: "-ive",
    suffixMeaning: "having a quality; tending to",
    literal: "not tending to act",
    definition: "not active or not taking part"
  },
  {
    word: "inspector",
    prefixId: "in",
    prefix: "in-",
    prefixMeaning: "in; into",
    baseId: "spect",
    base: "spect",
    baseMeaning: "look; watch",
    suffixId: "or-agent",
    suffix: "-or",
    suffixMeaning: "one who",
    literal: "one who looks into",
    definition: "a person whose job is to examine things carefully"
  },
  {
    word: "incredible",
    prefixId: "in",
    prefix: "in-",
    prefixMeaning: "not",
    baseId: "cred",
    base: "cred",
    baseMeaning: "believe; trust",
    suffixId: "ible",
    suffix: "-ible",
    suffixMeaning: "can be; able to be",
    literal: "not able to be believed",
    definition: "so unusual or impressive that it is hard to believe"
  },
  {
    word: "convention",
    prefixId: "con",
    prefix: "con-",
    prefixMeaning: "together",
    baseId: "vent",
    base: "vent",
    baseMeaning: "come",
    suffixId: "ion",
    suffix: "-ion",
    suffixMeaning: "act or process",
    literal: "coming together",
    definition: "a meeting or gathering of people"
  },
  {
    word: "nonverbal",
    prefixId: "non",
    prefix: "non-",
    prefixMeaning: "not",
    baseId: "verb",
    base: "verb",
    baseMeaning: "word",
    suffixId: "al",
    suffix: "-al",
    suffixMeaning: "related to",
    literal: "not related to words",
    definition: "communicating without spoken words"
  },
  {
    word: "international",
    prefixId: "inter",
    prefix: "inter-",
    prefixMeaning: "between; among",
    baseId: "nation",
    base: "nation",
    baseMeaning: "country",
    suffixId: "al",
    suffix: "-al",
    suffixMeaning: "related to",
    literal: "related to between nations",
    definition: "involving two or more countries"
  }
];
/* ========================================
   DOM REFERENCES
   ======================================== */

const studySelect = document.getElementById("studySelect");
const studyAvailability = document.getElementById("studyAvailability");

const activityButtons = [
  ...document.querySelectorAll(".activity-button")
];

const startPanel = document.getElementById("startPanel");
const workspaceTitle = document.getElementById("workspaceTitle");
const workspaceSubtitle = document.getElementById("workspaceSubtitle");
const activityProgress = document.getElementById("activityProgress");

const panels = {
  learn: document.getElementById("learnActivity"),
  find: document.getElementById("findActivity"),
  hunt: document.getElementById("huntActivity"),
  meaning: document.getElementById("meaningActivity"),
  morpheme: document.getElementById("morphemeActivity"),
  infer: document.getElementById("inferActivity"),
  build: document.getElementById("buildActivity")
};

const learningGrid = document.getElementById("learningGrid");

const findWord = document.getElementById("findWord");
const findChoices = document.getElementById("findChoices");
const findFeedback = document.getElementById("findFeedback");

const huntMorpheme = document.getElementById("huntMorpheme");
const huntWordChoices = document.getElementById("huntWordChoices");
const huntSelectionCount = document.getElementById("huntSelectionCount");
const clearHuntButton = document.getElementById("clearHuntButton");
const checkHuntButton = document.getElementById("checkHuntButton");
const huntFeedback = document.getElementById("huntFeedback");

const meaningMorpheme = document.getElementById("meaningMorpheme");
const meaningChoices = document.getElementById("meaningChoices");
const meaningFeedback = document.getElementById("meaningFeedback");

const morphemeMeaning = document.getElementById("morphemeMeaning");
const morphemeChoices = document.getElementById("morphemeChoices");
const morphemeFeedback = document.getElementById("morphemeFeedback");

const knownPartBox = document.getElementById("knownPartBox");
const inferPrompt = document.getElementById("inferPrompt");
const inferWord = document.getElementById("inferWord");
const inferChoices = document.getElementById("inferChoices");
const inferFeedback = document.getElementById("inferFeedback");

const buildPatternButtons = [
  ...document.querySelectorAll(".build-pattern-button")
];

const buildDirections = document.getElementById("buildDirections");
const wordPartBanks = document.getElementById("wordPartBanks");
const wordBuildingWorkspace =
  document.getElementById("wordBuildingWorkspace");

const clearBuildButton = document.getElementById("clearBuildButton");
const checkBuildButton = document.getElementById("checkBuildButton");
const buildFeedback = document.getElementById("buildFeedback");

const workspaceActions = document.getElementById("workspaceActions");
const nextQuestionButton = document.getElementById("nextQuestionButton");

const aboutButton = document.getElementById("aboutButton");
const aboutModal = document.getElementById("aboutModal");
const aboutClose = document.getElementById("aboutClose");


/* ========================================
   APP STATE
   ======================================== */

let studyMode = "";
let activeMode = "learn";

let quizState = {
  mode: "",
  items: [],
  index: 0,
  score: 0,
  answered: false
};

let selectedHuntWords = new Set();

let currentBuildTarget = null;

let selectedBuildParts = {
  prefix: null,
  root: null,
  suffix: null
};


/* ========================================
   UTILITIES
   ======================================== */

function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [copy[index], copy[randomIndex]] =
      [copy[randomIndex], copy[index]];
  }

  return copy;
}

function uniqueBy(items, getValue) {
  const seen = new Set();

  return items.filter((item) => {
    const value = getValue(item);

    if (seen.has(value)) {
      return false;
    }

    seen.add(value);
    return true;
  });
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getItemById(id) {
  return [...prefixes, ...roots, ...suffixes]
    .find((item) => item.id === id);
}

function getCurrentStudyItems() {
  if (studyMode === "prefixes") {
    return prefixes;
  }

  if (studyMode === "roots") {
    return roots;
  }

  if (studyMode === "suffixes") {
    return suffixes;
  }

  if (studyMode === "prefix-root") {
    return [...prefixes, ...roots];
  }

  if (studyMode === "root-suffix") {
    return [...roots, ...suffixes];
  }

  if (studyMode === "prefix-root-suffix") {
    return [...prefixes, ...roots, ...suffixes];
  }

  return [];
}

function getTypeClass(type) {
  if (type === "prefix") {
    return "prefix";
  }

  if (type === "root") {
    return "root";
  }

  return "suffix";
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.88;
  utterance.pitch = 1;
  utterance.lang = "en-US";

  window.speechSynthesis.speak(utterance);
}

function setAudioButton(container, text) {
  const button = container.querySelector(".audio-button");

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    speak(text);
  });
}

function hideAllPanels() {
  Object.values(panels).forEach((panel) => {
    panel.hidden = true;
  });
}

function hideQuizControls() {
  activityProgress.hidden = true;
  workspaceActions.hidden = true;
  nextQuestionButton.textContent = "Next";
}

function showStartMessage(title, message) {
  hideAllPanels();
  hideQuizControls();

  startPanel.hidden = false;

  const heading = startPanel.querySelector("h3");
  const paragraph = startPanel.querySelector("p");

  heading.textContent = title;
  paragraph.textContent = message;
}


/* ========================================
   STUDY AVAILABILITY
   ======================================== */

function prepareUnavailableOptions() {

  [...studySelect.options].forEach((option) => {
    option.disabled = false;

    option.textContent = option.textContent.replace(
      " — coming after suffixes are added",
      ""
    );
  });

  buildPatternButtons.forEach((button) => {
    const pattern = button.dataset.pattern;

    const isReady =
      pattern === "prefix-root" ||
      pattern === "root-suffix";

    button.disabled = !isReady;

    if (isReady) {
      button.style.opacity = "";
      button.style.cursor = "";
      button.title = "";
    } else {
      button.style.opacity = "0.45";
      button.style.cursor = "not-allowed";
      button.title =
        "Prefix + Root + Suffix is coming next.";
    }
  });
}


/* ========================================
   ACTIVITY SELECTION
   ======================================== */

function activateActivityButton(mode) {
  activityButtons.forEach((button) => {
    const isActive = button.dataset.mode === mode;

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderCurrentActivity() {
  if (!studyMode) {
    showStartMessage(
      "Choose what you want to study.",
      "Begin with prefixes or roots. You can also choose Prefixes + Roots for combined practice and word building."
    );

    return;
  }

  if (
  activeMode === "build" &&
  studyMode !== "prefix-root" &&
  studyMode !== "root-suffix"
) {
  showStartMessage(
    "Choose a word-building set.",
    "Select Prefixes + Roots or Roots + Suffixes in Step 1 to use Build Words."
  );

  return;
}

  startPanel.hidden = true;
  hideAllPanels();
  hideQuizControls();

  if (activeMode === "learn") {
    renderLearnActivity();
    return;
  }

  if (activeMode === "build") {
    renderBuildActivity();
    return;
  }

  startQuiz(activeMode);
}


/* ========================================
   LEARN ACTIVITY
   ======================================== */

function renderLearnActivity() {
  panels.learn.hidden = false;

  workspaceTitle.textContent = "Learn";
  workspaceSubtitle.textContent =
    "Select a card to explore its meaning and example words.";

  activityProgress.hidden = true;
  workspaceActions.hidden = true;

  const items = getCurrentStudyItems();

  learningGrid.innerHTML = "";

  items.forEach((item) => {
    const typeClass = getTypeClass(item.type);

    const card = document.createElement("button");
    card.type = "button";
    card.className =
      `learning-card ${typeClass}-card`;

    card.innerHTML = `
      <img
        class="learning-card-image"
        src="${escapeHTML(item.image)}"
        alt="${escapeHTML(item.label)} means ${escapeHTML(item.meaning)}"
      >

      <div class="learning-card-body">
        <h4 class="learning-card-name">
          ${escapeHTML(item.label)}
        </h4>

        <p class="learning-card-meaning">
          ${escapeHTML(item.meaning)}
        </p>
      </div>
    `;

    card.addEventListener("click", () => {
      renderLearnDetail(item);
    });

    learningGrid.append(card);
  });

  const detail = document.createElement("div");
  detail.id = "learnDetailPanel";
  detail.className = "feedback-panel";
  detail.style.gridColumn = "1 / -1";
  detail.hidden = true;

  learningGrid.append(detail);
}

function renderLearnDetail(item) {
  const detail = document.getElementById("learnDetailPanel");

  if (!detail) {
    return;
  }

  const examples = item.examples.join(" · ");

  detail.hidden = false;
  detail.className = "feedback-panel correct-feedback";

  detail.innerHTML = `
    <div class="feedback-card-layout">

      <img
        class="feedback-image"
        src="${escapeHTML(item.image)}"
        alt="${escapeHTML(item.label)} means ${escapeHTML(item.meaning)}"
      >

      <div class="feedback-details">

        <h4 class="feedback-heading">
          ${escapeHTML(item.label)}
        </h4>

        <div class="feedback-label">
          Meaning
        </div>

        <div class="feedback-value">
          <strong>${escapeHTML(item.meaning)}</strong>
        </div>

        <div class="feedback-label">
          Common words
        </div>

        <div class="feedback-value">
          ${escapeHTML(examples)}
        </div>

        <button
          class="audio-button"
          type="button"
        >
          🔊 Hear it
        </button>

      </div>

    </div>
  `;

  setAudioButton(
    detail,
    `${item.speech} means ${item.meaning}. ` +
    `Examples include ${item.examples.join(", ")}.`
  );

  detail.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}


/* ========================================
   QUIZ CREATION
   ======================================== */

function startQuiz(mode) {
  let items = [];

if (mode === "find") {
  if (studyMode === "prefixes") {
    items = prefixFindQuestions;
  } else if (studyMode === "roots") {
    items = rootFindQuestions;
  } else if (studyMode === "suffixes") {
    items = suffixFindQuestions;
  } else if (studyMode === "prefix-root") {
    items = [
      ...prefixFindQuestions,
      ...rootFindQuestions
    ];
  } else if (studyMode === "root-suffix") {
    items = [
      ...rootFindQuestions,
      ...suffixFindQuestions
    ];
  } else if (studyMode === "prefix-root-suffix") {
    items = [
      ...prefixFindQuestions,
      ...rootFindQuestions,
      ...suffixFindQuestions
    ];
  }
}
  if (mode === "hunt") {
  items = wordHuntQuestions.filter((item) => {
    if (studyMode === "prefixes") {
      return item.type === "prefix";
    }

    if (studyMode === "roots") {
      return item.type === "root";
    }

    if (studyMode === "suffixes") {
      return item.type === "suffix";
    }

    if (studyMode === "prefix-root") {
      return item.type === "prefix" || item.type === "root";
    }

    if (studyMode === "root-suffix") {
      return item.type === "root" || item.type === "suffix";
    }

    if (studyMode === "prefix-root-suffix") {
      return true;
    }

    return false;
  });
}

  if (mode === "meaning") {
    items = createMeaningQuestions(getCurrentStudyItems());
  }

  if (mode === "morpheme") {
    items = createMorphemeQuestions(getCurrentStudyItems());
  }

if (mode === "infer") {
  items = inferQuestions.filter((item) => {

    if (studyMode === "prefixes") {
      return item.type === "prefix";
    }

    if (studyMode === "roots") {
      return item.type === "root";
    }

    if (studyMode === "suffixes") {
      return item.type === "suffix";
    }

    if (studyMode === "prefix-root") {
      return (
        item.type === "prefix" ||
        item.type === "root"
      );
    }

    if (studyMode === "root-suffix") {
      return (
        item.type === "root" ||
        item.type === "suffix"
      );
    }

    if (studyMode === "prefix-root-suffix") {
      return true;
    }

    return false;
  });
}

  quizState = {
    mode,
    items: shuffle(items).slice(0, 10),
    index: 0,
    score: 0,
    answered: false
  };

  renderQuizQuestion();
}

function createMeaningQuestions(items) {
  return items.map((item) => {
    const itemMeaning = normalizeMeaning(item.meaning);

    const possibleDistractors = uniqueBy(
      items.filter((other) =>
        other.id !== item.id &&
        normalizeMeaning(other.meaning) !== itemMeaning
      ),
      (other) => normalizeMeaning(other.meaning)
    );

    const distractors = shuffle(possibleDistractors)
      .slice(0, 3)
      .map((other) => other.meaning);

    return {
      item,
      correct: item.meaning,
      choices: shuffle([
        item.meaning,
        ...distractors
      ])
    };
  });
}

function normalizeMeaning(text) {
  return text.toLowerCase().replace(/[;,.]/g, "").replace(/\s+/g, " ").trim();
}

function createMorphemeQuestions(items) {
  return items.map((item) => {
    const itemMeaning = normalizeMeaning(item.meaning);

    const distractors = shuffle(
      uniqueBy(
        items.filter((other) =>
          other.id !== item.id &&
          normalizeMeaning(other.meaning) !== itemMeaning
        ),
        (other) => normalizeMeaning(other.meaning)
      )
    ).slice(0, 3);

    return {
      item,
      correctId: item.id,
      choices: shuffle([
        item,
        ...distractors
      ])
    };
  });
}

function renderQuizQuestion() {
  quizState.answered = false;

  workspaceActions.hidden = true;

  const question = quizState.items[quizState.index];

  if (!question) {
    showStartMessage(
      "No questions are available yet.",
      "Choose a different study set or activity."
    );

    return;
  }

  activityProgress.hidden = false;
  activityProgress.textContent =
    `Question ${quizState.index + 1} of ${quizState.items.length}`;

  if (quizState.mode === "find") {
    renderFindQuestion(question);
  }
  if (quizState.mode === "hunt") {
  renderHuntQuestion(question);
}

  if (quizState.mode === "meaning") {
    renderMeaningQuestion(question);
  }

  if (quizState.mode === "morpheme") {
    renderMorphemeQuestion(question);
  }

  if (quizState.mode === "infer") {
    renderInferQuestion(question);
  }
}


/* ========================================
   FIND ACTIVITY
   ======================================== */

function renderFindQuestion(question) {
  panels.find.hidden = false;

  workspaceTitle.textContent = "Find";
  workspaceSubtitle.textContent =
    "Identify the target word part in the whole word.";

  findWord.textContent = question.word;
  findFeedback.hidden = true;
  findChoices.innerHTML = "";

  shuffle(question.choices).forEach((choice) => {
    const button = document.createElement("button");
    const typeClass = getTypeClass(question.type);

    button.type = "button";
    button.className =
      `morpheme-tile ${typeClass}-tile`;
    button.textContent = choice;

    button.addEventListener("click", () => {
      answerFindQuestion(button, choice, question);
    });

    findChoices.append(button);
  });
}

function answerFindQuestion(button, choice, question) {
  if (quizState.answered) {
    return;
  }

  quizState.answered = true;

  const isCorrect = choice === question.answer;

  if (isCorrect) {
    quizState.score += 1;
  }

  [...findChoices.children].forEach((choiceButton) => {
    choiceButton.disabled = true;

    if (choiceButton.textContent === question.answer) {
      choiceButton.classList.add("correct");
    }
  });

  if (!isCorrect) {
    button.classList.add("incorrect");
  }

  const highlightClass =
    `highlight-${getTypeClass(question.type)}`;

  findWord.innerHTML = `
    ${escapeHTML(question.before)}
    <span class="${highlightClass}">
      ${escapeHTML(question.target)}
    </span>
    ${escapeHTML(question.after)}
  `;

  const item = getItemById(question.itemId);

  renderWordFeedback(
    findFeedback,
    item,
    question,
    isCorrect
  );

  showNextButton();
}

/* ========================================
   WORD HUNT
   ======================================== */

function renderHuntQuestion(question) {
  panels.hunt.hidden = false;

  workspaceTitle.textContent = "Word Hunt";
  workspaceSubtitle.textContent =
    "Find every word that contains the target word part.";

  selectedHuntWords = new Set();

  huntFeedback.hidden = true;
  huntWordChoices.innerHTML = "";

  huntMorpheme.textContent = question.label;
  styleMorphemeDisplay(huntMorpheme, question.type);

  huntSelectionCount.textContent = "0 selected";

  const words = shuffle(question.words);

  words.forEach((wordItem) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "hunt-word-button";
    button.textContent = wordItem.word;
    button.dataset.word = wordItem.word;

    button.addEventListener("click", () => {
      if (quizState.answered) {
        return;
      }

      if (selectedHuntWords.has(wordItem.word)) {
        selectedHuntWords.delete(wordItem.word);
        button.classList.remove("selected");
      } else {
        selectedHuntWords.add(wordItem.word);
        button.classList.add("selected");
      }

      const count = selectedHuntWords.size;

      huntSelectionCount.textContent =
        `${count} selected`;
    });

    huntWordChoices.append(button);
  });
}


function clearHuntSelection() {
  if (quizState.answered) {
    return;
  }

  selectedHuntWords.clear();

  [...huntWordChoices.children].forEach((button) => {
    button.classList.remove("selected");
  });

  huntSelectionCount.textContent = "0 selected";
  huntFeedback.hidden = true;
}


function checkHuntAnswers() {
  if (quizState.answered) {
    return;
  }

  if (selectedHuntWords.size === 0) {
    huntFeedback.hidden = false;
    huntFeedback.className =
      "feedback-panel incorrect-feedback";

    huntFeedback.innerHTML = `
      <h4 class="feedback-heading">
        Choose at least one word.
      </h4>

      <p>
        Select every word you think contains the target word part.
      </p>
    `;

    return;
  }

  const question = quizState.items[quizState.index];

  const correctWords = question.words
    .filter((item) => item.correct)
    .map((item) => item.word);

  const correctSet = new Set(correctWords);

  const selectedCorrectly = correctWords.filter((word) =>
    selectedHuntWords.has(word)
  );

  const incorrectSelections = [...selectedHuntWords].filter(
    (word) => !correctSet.has(word)
  );

  const missedWords = correctWords.filter(
    (word) => !selectedHuntWords.has(word)
  );

  const isPerfect =
    incorrectSelections.length === 0 &&
    missedWords.length === 0;

  quizState.answered = true;

  if (isPerfect) {
    quizState.score += 1;
  }

  [...huntWordChoices.children].forEach((button) => {
    button.disabled = true;

    const word = button.dataset.word;
    const isCorrectWord = correctSet.has(word);
    const wasSelected = selectedHuntWords.has(word);

    if (isCorrectWord && wasSelected) {
      button.classList.add("correct");
    }

    if (!isCorrectWord && wasSelected) {
      button.classList.add("incorrect");
    }

    if (isCorrectWord && !wasSelected) {
      button.classList.add("missed");
    }
  });

  renderHuntFeedback(
    question,
    selectedCorrectly.length,
    correctWords.length,
    isPerfect
  );

  showNextButton();
}


function renderHuntFeedback(
  question,
  numberFound,
  totalCorrect,
  isPerfect
) {
  const item = getItemById(question.itemId);
  const typeClass = getTypeClass(question.type);

  const correctWordMarkup = question.words
    .filter((wordItem) => wordItem.correct)
    .map((wordItem) => `
      <div class="hunt-answer-word">
        ${escapeHTML(wordItem.before || "")}
        <span class="highlight-${typeClass}">
          ${escapeHTML(wordItem.target)}
        </span>
        ${escapeHTML(wordItem.after || "")}
      </div>
    `)
    .join("");

  huntFeedback.hidden = false;

  huntFeedback.className =
    `feedback-panel ${
      isPerfect
        ? "correct-feedback"
        : "incorrect-feedback"
    }`;

  huntFeedback.innerHTML = `
    <div class="feedback-card-layout">

      <img
        class="feedback-image"
        src="${escapeHTML(item.image)}"
        alt="${escapeHTML(item.label)} means ${escapeHTML(item.meaning)}"
      >

      <div class="feedback-details">

        <h4 class="feedback-heading">
          ${isPerfect
            ? "You found them all!"
            : `You found ${numberFound} of ${totalCorrect}.`}
        </h4>

        <div class="feedback-label">
          Word part
        </div>

        <div class="feedback-value">
          <strong>${escapeHTML(item.label)}</strong>
          = ${escapeHTML(item.meaning)}
        </div>

        <div class="feedback-label">
          Words with this part
        </div>

        <div class="hunt-answer-list">
          ${correctWordMarkup}
        </div>

        <button
          class="audio-button"
          type="button"
        >
          🔊 Hear it
        </button>

      </div>

    </div>
  `;

  setAudioButton(
    huntFeedback,
    `${item.speech} means ${item.meaning}. ` +
    `Words with this word part include ${question.words
      .filter((wordItem) => wordItem.correct)
      .map((wordItem) => wordItem.word)
      .join(", ")}.`
  );
}

/* ========================================
   CHOOSE THE MEANING
   ======================================== */

function renderMeaningQuestion(question) {
  panels.meaning.hidden = false;

  workspaceTitle.textContent = "Meaning";
  workspaceSubtitle.textContent =
    "Choose the meaning carried by the word part.";

  meaningFeedback.hidden = true;
  meaningChoices.innerHTML = "";

  meaningMorpheme.textContent = question.item.label;
  styleMorphemeDisplay(meaningMorpheme, question.item.type);

  shuffle(question.choices).forEach((choice) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "answer-button";
    button.textContent = choice;

    button.addEventListener("click", () => {
      answerMeaningQuestion(
        button,
        choice,
        question
      );
    });

    meaningChoices.append(button);
  });
}

function answerMeaningQuestion(button, choice, question) {
  if (quizState.answered) {
    return;
  }

  quizState.answered = true;

  const isCorrect = choice === question.correct;

  if (isCorrect) {
    quizState.score += 1;
  }

  [...meaningChoices.children].forEach((choiceButton) => {
    choiceButton.disabled = true;

    if (choiceButton.textContent === question.correct) {
      choiceButton.classList.add("correct");
    }
  });

  if (!isCorrect) {
    button.classList.add("incorrect");
  }

  renderMorphemeFeedback(
    meaningFeedback,
    question.item,
    isCorrect
  );

  showNextButton();
}


/* ========================================
   CHOOSE THE WORD PART
   ======================================== */

function renderMorphemeQuestion(question) {
  panels.morpheme.hidden = false;

  workspaceTitle.textContent = "Word Part";
  workspaceSubtitle.textContent =
    "Choose the morpheme that carries the meaning.";

  morphemeFeedback.hidden = true;
  morphemeChoices.innerHTML = "";

  morphemeMeaning.textContent = question.item.meaning;

  question.choices.forEach((choiceItem) => {
    const button = document.createElement("button");
    const typeClass = getTypeClass(choiceItem.type);

    button.type = "button";
    button.className =
      `morpheme-tile ${typeClass}-tile`;
    button.textContent = choiceItem.label;

    button.addEventListener("click", () => {
      answerMorphemeQuestion(
        button,
        choiceItem,
        question
      );
    });

    morphemeChoices.append(button);
  });
}

function answerMorphemeQuestion(
  button,
  choiceItem,
  question
) {
  if (quizState.answered) {
    return;
  }

  quizState.answered = true;

  const isCorrect =
    choiceItem.id === question.correctId;

  if (isCorrect) {
    quizState.score += 1;
  }

  [...morphemeChoices.children].forEach(
    (choiceButton, index) => {
      choiceButton.disabled = true;

      const item = question.choices[index];

      if (item.id === question.correctId) {
        choiceButton.classList.add("correct");
      }
    }
  );

  if (!isCorrect) {
    button.classList.add("incorrect");
  }

  renderMorphemeFeedback(
    morphemeFeedback,
    question.item,
    isCorrect
  );

  showNextButton();
}


/* ========================================
   FIGURE IT OUT
   ======================================== */

function renderInferQuestion(question) {
  panels.infer.hidden = false;

  workspaceTitle.textContent = "Figure It Out";
  workspaceSubtitle.textContent =
    "Use a known word part to infer the whole word’s meaning.";

  inferFeedback.hidden = true;
  inferChoices.innerHTML = "";

  knownPartBox.innerHTML = `
    <strong>${escapeHTML(question.knownLabel)}</strong>
    <span>${escapeHTML(question.knownMeaning)}</span>
  `;
inferPrompt.textContent =
  question.type === "prefix"
    ? "Based on the prefix, what might this word mean?"
    : question.type === "root"
      ? "Based on the root, what might this word mean?"
      : "Based on the suffix, what might this word mean?";
  inferWord.textContent = question.word;

  shuffle(question.choices).forEach((choice) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "answer-button";
    button.textContent = choice;

    button.addEventListener("click", () => {
      answerInferQuestion(
        button,
        choice,
        question
      );
    });

    inferChoices.append(button);
  });
}

function answerInferQuestion(button, choice, question) {
  if (quizState.answered) {
    return;
  }

  quizState.answered = true;

  const isCorrect = choice === question.correct;

  if (isCorrect) {
    quizState.score += 1;
  }

  [...inferChoices.children].forEach((choiceButton) => {
    choiceButton.disabled = true;

    if (choiceButton.textContent === question.correct) {
      choiceButton.classList.add("correct");
    }
  });

  if (!isCorrect) {
    button.classList.add("incorrect");
  }

  inferFeedback.hidden = false;
  inferFeedback.className =
    `feedback-panel ${
      isCorrect
        ? "correct-feedback"
        : "incorrect-feedback"
    }`;

  inferFeedback.innerHTML = `
    <div class="feedback-card-layout">

      <img
        class="feedback-image"
        src="${escapeHTML(question.image)}"
        alt="${escapeHTML(question.knownLabel)} means ${escapeHTML(question.knownMeaning)}"
      >

      <div class="feedback-details">

        <h4 class="feedback-heading">
          ${isCorrect ? "Correct!" : "Not quite."}
        </h4>

        <div class="feedback-label">
          Known word part
        </div>

        <div class="feedback-value">
          <strong>${escapeHTML(question.knownLabel)}</strong>
          = ${escapeHTML(question.knownMeaning)}
        </div>

        <div class="feedback-label">
          Literal meaning
        </div>

        <div class="feedback-value">
          ${escapeHTML(question.literal)}
        </div>

        <div class="feedback-label">
          Student-friendly meaning
        </div>

        <div class="feedback-value">
          ${escapeHTML(question.definition)}
        </div>

        <button
          class="audio-button"
          type="button"
        >
          🔊 Hear the explanation
        </button>

      </div>

    </div>
  `;

  setAudioButton(
    inferFeedback,
    `${question.knownLabel} means ${question.knownMeaning}. ` +
    `${question.word} literally means ${question.literal}. ` +
    `${question.word} means ${question.definition}.`
  );

  showNextButton();
}


/* ========================================
   FEEDBACK HELPERS
   ======================================== */

function renderWordFeedback(
  container,
  item,
  question,
  isCorrect
) {
  container.hidden = false;

  container.className =
    `feedback-panel ${
      isCorrect
        ? "correct-feedback"
        : "incorrect-feedback"
    }`;

  const image = question.image || item.image;

  container.innerHTML = `
    <div class="feedback-card-layout">

      <img
        class="feedback-image"
        src="${escapeHTML(image)}"
        alt="${escapeHTML(question.answer)} means ${escapeHTML(item.meaning)}"
      >

      <div class="feedback-details">

        <h4 class="feedback-heading">
          ${isCorrect ? "Correct!" : "Not quite."}
        </h4>

        <div class="feedback-label">
          Word part
        </div>

        <div class="feedback-value">
          <strong>${escapeHTML(question.answer)}</strong>
          = ${escapeHTML(item.meaning)}
        </div>

        <div class="feedback-label">
          Other word part
        </div>

        <div class="feedback-value">
          ${escapeHTML(question.base)}
        </div>

        <div class="feedback-label">
          Literal meaning
        </div>

        <div class="feedback-value">
          ${escapeHTML(question.literal)}
        </div>

        <div class="feedback-label">
          Student-friendly meaning
        </div>

        <div class="feedback-value">
          ${escapeHTML(question.definition)}
        </div>

        <button
          class="audio-button"
          type="button"
        >
          🔊 Hear the explanation
        </button>

      </div>

    </div>
  `;

  setAudioButton(
    container,
    `${question.answer} means ${item.meaning}. ` +
    `${question.word} literally means ${question.literal}. ` +
    `${question.word} means ${question.definition}.`
  );
}

function renderMorphemeFeedback(
  container,
  item,
  isCorrect
) {
  container.hidden = false;

  container.className =
    `feedback-panel ${
      isCorrect
        ? "correct-feedback"
        : "incorrect-feedback"
    }`;

  container.innerHTML = `
    <div class="feedback-card-layout">

      <img
        class="feedback-image"
        src="${escapeHTML(item.image)}"
        alt="${escapeHTML(item.label)} means ${escapeHTML(item.meaning)}"
      >

      <div class="feedback-details">

        <h4 class="feedback-heading">
          ${isCorrect ? "Correct!" : "Not quite."}
        </h4>

        <div class="feedback-label">
          Word part
        </div>

        <div class="feedback-value">
          <strong>${escapeHTML(item.label)}</strong>
        </div>

        <div class="feedback-label">
          Meaning
        </div>

        <div class="feedback-value">
          ${escapeHTML(item.meaning)}
        </div>

        <div class="feedback-label">
          Common words
        </div>

        <div class="feedback-value">
          ${escapeHTML(item.examples.join(" · "))}
        </div>

        <button
          class="audio-button"
          type="button"
        >
          🔊 Hear it
        </button>

      </div>

    </div>
  `;

  setAudioButton(
    container,
    `${item.speech} means ${item.meaning}. ` +
    `Examples include ${item.examples.join(", ")}.`
  );
}

function styleMorphemeDisplay(element, type) {
  const colors = {
    prefix: {
      border: "var(--prefix)",
      color: "var(--prefix-dark)",
      background: "var(--prefix-soft)"
    },
    root: {
      border: "var(--root)",
      color: "var(--root-dark)",
      background: "var(--root-soft)"
    },
    suffix: {
      border: "var(--suffix)",
      color: "var(--suffix-dark)",
      background: "var(--suffix-soft)"
    }
  };

  const style = colors[type];

  element.style.borderColor = style.border;
  element.style.color = style.color;
  element.style.background = style.background;
}

function showNextButton() {
  workspaceActions.hidden = false;

  const isLast =
    quizState.index === quizState.items.length - 1;

  nextQuestionButton.textContent =
    isLast
      ? `Start Again · ${quizState.score}/${quizState.items.length}`
      : "Next";
}

/* ========================================
   BUILD WORDS
   ======================================== */

function getActiveBuildWords() {
  if (studyMode === "root-suffix") {
    return rootSuffixBuildWords;
  }

  if (studyMode === "prefix-root-suffix") {
    return prefixRootSuffixBuildWords;
  }

  return buildWords;
}


function syncBuildPatternButtons() {
  buildPatternButtons.forEach((button) => {
    const pattern = button.dataset.pattern;

    const isReady =
      pattern === "prefix-root" ||
      pattern === "root-suffix";

    const isActive =
      pattern === studyMode;

    button.disabled = !isReady;

    button.classList.toggle(
      "active",
      isActive
    );

    button.setAttribute(
      "aria-pressed",
      String(isActive)
    );
  });
}


function renderBuildActivity() {
  panels.build.hidden = false;

  workspaceTitle.textContent = "Build Words";

  if (studyMode === "root-suffix") {
    workspaceSubtitle.textContent =
      "Combine a root or base with a suffix to create a real word.";
  } else {
    workspaceSubtitle.textContent =
      "Combine a prefix and a root to create a real word.";
  }

  activityProgress.hidden = true;
  workspaceActions.hidden = true;

  syncBuildPatternButtons();
  renderBuildRound();
}


function renderBuildRound() {
  const activeBuildWords =
    getActiveBuildWords();

  currentBuildTarget =
    activeBuildWords[
      Math.floor(
        Math.random() * activeBuildWords.length
      )
    ];

  selectedBuildParts = {
    prefix: null,
    root: null,
    suffix: null
  };

  buildFeedback.hidden = true;

  buildDirections.textContent =
    `Build the word that means: “${currentBuildTarget.definition}”`;

  if (studyMode === "root-suffix") {
    renderRootSuffixBuildBanks(
      activeBuildWords
    );
  } else {
    renderPrefixRootBuildBanks(
      activeBuildWords
    );
  }

  updateBuildWorkspace();
}


/* PREFIX + ROOT */

function renderPrefixRootBuildBanks(
  activeBuildWords
) {
  const prefixDistractors = uniqueBy(
    shuffle(
      activeBuildWords.filter(
        (item) =>
          item.prefixId !==
          currentBuildTarget.prefixId
      )
    ),
    (item) => item.prefixId
  ).slice(0, 2);

  const rootDistractors = uniqueBy(
    shuffle(
      activeBuildWords.filter(
        (item) =>
          item.rootId !==
          currentBuildTarget.rootId
      )
    ),
    (item) => item.rootId
  ).slice(0, 2);

  const prefixOptions = shuffle([
    {
      id: currentBuildTarget.prefixId,
      label: currentBuildTarget.prefix
    },

    ...prefixDistractors.map((item) => ({
      id: item.prefixId,
      label: item.prefix
    }))
  ]);

  const rootOptions = shuffle([
    {
      id: currentBuildTarget.rootId,
      label: currentBuildTarget.root
    },

    ...rootDistractors.map((item) => ({
      id: item.rootId,
      label: item.root
    }))
  ]);

  wordPartBanks.innerHTML = `
    <section class="word-part-bank prefix-bank">

      <h4 class="bank-heading">
        Prefixes
      </h4>

      <div
        class="bank-options"
        id="prefixBankOptions"
      ></div>

    </section>

    <section class="word-part-bank root-bank">

      <h4 class="bank-heading">
        Roots
      </h4>

      <div
        class="bank-options"
        id="rootBankOptions"
      ></div>

    </section>
  `;

  renderBuildOptions(
    document.getElementById(
      "prefixBankOptions"
    ),
    prefixOptions,
    "prefix"
  );

  renderBuildOptions(
    document.getElementById(
      "rootBankOptions"
    ),
    rootOptions,
    "root"
  );
}


/* ROOT / BASE + SUFFIX */

function renderRootSuffixBuildBanks(
  activeBuildWords
) {
  const baseDistractors = uniqueBy(
    shuffle(
      activeBuildWords.filter(
        (item) =>
          item.baseId !==
          currentBuildTarget.baseId
      )
    ),
    (item) => item.baseId
  ).slice(0, 2);

  const suffixDistractors = uniqueBy(
    shuffle(
      activeBuildWords.filter(
        (item) =>
          item.suffixId !==
          currentBuildTarget.suffixId
      )
    ),
    (item) => item.suffixId
  ).slice(0, 2);

  const baseOptions = shuffle([
    {
      id: currentBuildTarget.baseId,
      label: currentBuildTarget.base
    },

    ...baseDistractors.map((item) => ({
      id: item.baseId,
      label: item.base
    }))
  ]);

  const suffixOptions = shuffle([
    {
      id: currentBuildTarget.suffixId,
      label: currentBuildTarget.suffix
    },

    ...suffixDistractors.map((item) => ({
      id: item.suffixId,
      label: item.suffix
    }))
  ]);

  wordPartBanks.innerHTML = `
    <section class="word-part-bank root-bank">

      <h4 class="bank-heading">
        Roots / Bases
      </h4>

      <div
        class="bank-options"
        id="rootBankOptions"
      ></div>

    </section>

    <section class="word-part-bank suffix-bank">

      <h4 class="bank-heading">
        Suffixes
      </h4>

      <div
        class="bank-options"
        id="suffixBankOptions"
      ></div>

    </section>
  `;

  renderBuildOptions(
    document.getElementById(
      "rootBankOptions"
    ),
    baseOptions,
    "root"
  );

  renderBuildOptions(
    document.getElementById(
      "suffixBankOptions"
    ),
    suffixOptions,
    "suffix"
  );
}


function renderBuildOptions(
  container,
  options,
  type
) {
  options.forEach((option) => {
    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      `word-part-option ${type}-option`;

    button.textContent = option.label;

    button.dataset.id = option.id;
    button.dataset.type = type;

    button.addEventListener("click", () => {
      selectBuildPart(
        button,
        option,
        type
      );
    });

    container.append(button);
  });
}


function selectBuildPart(
  button,
  option,
  type
) {
  document
    .querySelectorAll(
      `.word-part-option[data-type="${type}"]`
    )
    .forEach((otherButton) => {
      otherButton.classList.remove(
        "selected"
      );
    });

  button.classList.add("selected");

  selectedBuildParts[type] =
    option;

  buildFeedback.hidden = true;

  updateBuildWorkspace();
}


function updateBuildWorkspace() {
  const parts = [];

  if (selectedBuildParts.prefix) {
    parts.push(`
      <span class="built-part prefix-part">
        ${escapeHTML(
          selectedBuildParts.prefix.label
        )}
      </span>
    `);
  }

  if (selectedBuildParts.root) {
    parts.push(`
      <span class="built-part root-part">
        ${escapeHTML(
          selectedBuildParts.root.label
        )}
      </span>
    `);
  }

  if (selectedBuildParts.suffix) {
    parts.push(`
      <span class="built-part suffix-part">
        ${escapeHTML(
          selectedBuildParts.suffix.label
        )}
      </span>
    `);
  }

  if (parts.length === 0) {
    wordBuildingWorkspace.innerHTML =
      studyMode === "root-suffix"
        ? `
          <span class="empty-build-message">
            Select a root or base and a suffix.
          </span>
        `
        : `
          <span class="empty-build-message">
            Select a prefix and a root.
          </span>
        `;

    return;
  }

  wordBuildingWorkspace.innerHTML =
    parts.join("");
}


function clearBuildSelection() {
  selectedBuildParts = {
    prefix: null,
    root: null,
    suffix: null
  };

  document
    .querySelectorAll(
      ".word-part-option"
    )
    .forEach((button) => {
      button.classList.remove(
        "selected"
      );
    });

  buildFeedback.hidden = true;

  updateBuildWorkspace();
}


function checkBuiltWord() {
  const isRootSuffix =
    studyMode === "root-suffix";

  const hasRequiredParts =
    isRootSuffix
      ? (
          selectedBuildParts.root &&
          selectedBuildParts.suffix
        )
      : (
          selectedBuildParts.prefix &&
          selectedBuildParts.root
        );

  if (!hasRequiredParts) {
    buildFeedback.hidden = false;

    buildFeedback.className =
      "feedback-panel incorrect-feedback";

    buildFeedback.innerHTML =
      isRootSuffix
        ? `
          <h4 class="feedback-heading">
            Choose both word parts.
          </h4>

          <p>
            Select one root or base and one suffix
            before checking the word.
          </p>
        `
        : `
          <h4 class="feedback-heading">
            Choose both word parts.
          </h4>

          <p>
            Select one prefix and one root
            before checking the word.
          </p>
        `;

    return;
  }

  let isCorrect = false;

  if (isRootSuffix) {
    isCorrect =
      selectedBuildParts.root.id ===
        currentBuildTarget.baseId &&
      selectedBuildParts.suffix.id ===
        currentBuildTarget.suffixId;
  } else {
    isCorrect =
      selectedBuildParts.prefix.id ===
        currentBuildTarget.prefixId &&
      selectedBuildParts.root.id ===
        currentBuildTarget.rootId;
  }

  buildFeedback.hidden = false;

  if (!isCorrect) {
    buildFeedback.className =
      "feedback-panel incorrect-feedback";

    buildFeedback.innerHTML = `
      <h4 class="feedback-heading">
        Try a different combination.
      </h4>

      <p>
        Look again at the meaning:
        <strong>
          ${escapeHTML(
            currentBuildTarget.definition
          )}
        </strong>
      </p>
    `;

    return;
  }

  buildFeedback.className =
    "feedback-panel correct-feedback";

  if (isRootSuffix) {
    buildFeedback.innerHTML = `
      <h4 class="feedback-heading">
        Correct! You built
        <strong>
          ${escapeHTML(
            currentBuildTarget.word
          )}
        </strong>.
      </h4>

    <p>
  <strong>Root / Base:</strong>
  ${escapeHTML(
    currentBuildTarget.base
  )}
  =
  ${escapeHTML(
    currentBuildTarget.baseMeaning
  )}
</p>
<p>
  <strong>Suffix:</strong>
  ${escapeHTML(
    currentBuildTarget.suffix
  )}
  =
  ${escapeHTML(
    currentBuildTarget.suffixMeaning
  )}
</p>

      <p>
        <strong>Literal meaning:</strong>
        ${escapeHTML(
          currentBuildTarget.literal
        )}
      </p>

      <p>
        <strong>
          Student-friendly meaning:
        </strong>
        ${escapeHTML(
          currentBuildTarget.definition
        )}
      </p>

      <button
        class="audio-button"
        type="button"
      >
        🔊 Hear the explanation
      </button>

      <button
        class="primary-button"
        id="nextBuildButton"
        type="button"
        style="margin-left: 10px;"
      >
        Build Another Word
      </button>
    `;

    setAudioButton(
      buildFeedback,
      `${currentBuildTarget.base} means ` +
      `${currentBuildTarget.baseMeaning}. ` +
      `${currentBuildTarget.suffix} means ` +
      `${currentBuildTarget.suffixMeaning}. ` +
      `${currentBuildTarget.word} literally means ` +
      `${currentBuildTarget.literal}. ` +
      `${currentBuildTarget.word} means ` +
      `${currentBuildTarget.definition}.`
    );
  } else {
    buildFeedback.innerHTML = `
      <h4 class="feedback-heading">
        Correct! You built
        <strong>
          ${escapeHTML(
            currentBuildTarget.word
          )}
        </strong>.
      </h4>

      <p>
        <strong>
          ${escapeHTML(
            currentBuildTarget.prefix
          )}
        </strong>
        =
        ${escapeHTML(
          currentBuildTarget.prefixMeaning
        )}
      </p>

      <p>
        <strong>
          ${escapeHTML(
            currentBuildTarget.root
          )}
        </strong>
        =
        ${escapeHTML(
          currentBuildTarget.rootMeaning
        )}
      </p>

      <p>
        <strong>Literal meaning:</strong>
        ${escapeHTML(
          currentBuildTarget.literal
        )}
      </p>

      <p>
        <strong>
          Student-friendly meaning:
        </strong>
        ${escapeHTML(
          currentBuildTarget.definition
        )}
      </p>

      <button
        class="audio-button"
        type="button"
      >
        🔊 Hear the explanation
      </button>

      <button
        class="primary-button"
        id="nextBuildButton"
        type="button"
        style="margin-left: 10px;"
      >
        Build Another Word
      </button>
    `;

    setAudioButton(
      buildFeedback,
      `${currentBuildTarget.prefix} means ` +
      `${currentBuildTarget.prefixMeaning}. ` +
      `${currentBuildTarget.root} means ` +
      `${currentBuildTarget.rootMeaning}. ` +
      `${currentBuildTarget.word} literally means ` +
      `${currentBuildTarget.literal}. ` +
      `${currentBuildTarget.word} means ` +
      `${currentBuildTarget.definition}.`
    );
  }

  document
    .getElementById(
      "nextBuildButton"
    )
    .addEventListener(
      "click",
      renderBuildRound
    );
}


/* ========================================
   EVENT LISTENERS
   ======================================== */

studySelect.addEventListener("change", () => {
  studyMode = studySelect.value;

  const messages = {
  prefixes:
    "Prefix learning, recognition, meaning, and inference activities are ready.",

  roots:
    "Root learning, recognition, meaning, and inference activities are ready.",

  suffixes:
    "Suffix learning, recognition, meaning, and inference activities are ready.",

  "prefix-root":
    "Combined prefix and root practice is ready, including Build Words.",

  "root-suffix":
    "Combined root or base and suffix practice is ready, including Build Words."
};
  studyAvailability.textContent =
    messages[studyMode] || "";

  renderCurrentActivity();
});

activityButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeMode = button.dataset.mode;

    activateActivityButton(activeMode);
    renderCurrentActivity();
  });
});

nextQuestionButton.addEventListener("click", () => {
  const isLast =
    quizState.index === quizState.items.length - 1;

  if (isLast) {
    startQuiz(quizState.mode);
    return;
  }

  quizState.index += 1;
  renderQuizQuestion();
});
buildPatternButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.disabled) {
      return;
    }

    const pattern =
      button.dataset.pattern;

    studyMode = pattern;
    studySelect.value = pattern;

    const messages = {
      "prefix-root":
        "Combined prefix and root practice is ready, including Build Words.",

      "root-suffix":
        "Combined root or base and suffix practice is ready, including Build Words."
    };

    studyAvailability.textContent =
      messages[pattern] || "";

    renderBuildActivity();
  });
});
clearBuildButton.addEventListener(
  "click",
  clearBuildSelection
);
clearHuntButton.addEventListener(
  "click",
  clearHuntSelection
);

checkHuntButton.addEventListener(
  "click",
  checkHuntAnswers
);
checkBuildButton.addEventListener(
  "click",
  checkBuiltWord
);

aboutButton.addEventListener("click", () => {
  aboutModal.hidden = false;
  aboutClose.focus();
});

aboutClose.addEventListener("click", () => {
  aboutModal.hidden = true;
  aboutButton.focus();
});

aboutModal.addEventListener("click", (event) => {
  if (event.target === aboutModal) {
    aboutModal.hidden = true;
    aboutButton.focus();
  }
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    !aboutModal.hidden
  ) {
    aboutModal.hidden = true;
    aboutButton.focus();
  }
});


/* ========================================
   INITIALIZE
   ======================================== */

prepareUnavailableOptions();
activateActivityButton("learn");

showStartMessage(
  "Choose what you want to study.",
  "Begin with prefixes or roots. You can also choose Prefixes + Roots for combined practice and word building."
);
