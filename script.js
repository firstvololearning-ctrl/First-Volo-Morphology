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

/* ========================================
   MASTER WORD INVENTORY LOOKUP
   ======================================== */

const WORD_INVENTORY = window.FIRST_VOLO_WORD_INVENTORY || [];

const WORD_INVENTORY_BY_WORD = new Map(
  WORD_INVENTORY.map(item => [item.word.toLowerCase(), item])
);

function getWordInventoryEntry(word) {
  if (!word) return null;

  return WORD_INVENTORY_BY_WORD.get(
    String(word).trim().toLowerCase()
  ) || null;
}

function getWordMetadata(word) {
  const entry = getWordInventoryEntry(word);

  if (!entry) {
    return null;
  }

  return {
    word: entry.word,
    practiceBand: entry.practiceBand || null,
    accessibilityBand: entry.accessibilityBand || null,
    morphemeIntroBand: entry.morphemeIntroBand || null,
    vocabLevel: entry.vocabLevel || null,
    transparency: entry.transparency || null,
    gradeConfidence: entry.gradeConfidence || null,
    vocabConfidence: entry.vocabConfidence || null,
    ccssSkill: entry.ccssSkill || null,
    recommendedActivityUse:
      entry.recommendedActivityUse || null,
    reviewCaution: entry.reviewCaution || null,
    evidence: entry.evidence || {}
  };
}

function getWordPracticeBand(word) {
  return getWordMetadata(word)?.practiceBand || null;
}

function isReservedTransferWord(word) {
  const central =
    window
      .FirstVoloInstructionalProtection;

  if (
    central?.isProtected
  ) {
    return central.isProtected(
      word
    );
  }

  /*
    Compatibility fallback for older pages.
    The hardened registry should normally be loaded.
  */
  return Boolean(
    window.FirstVoloTransferChallenge
      ?.isReservedWord?.(word)
  );
}


function isWordEligibleForSelectedGrade(word) {
  /*
    Transfer Challenge words stay out of
    ordinary instruction/practice so they
    remain available for independent transfer.
  */
  if (isReservedTransferWord(word)) {
    return false;
  }

  if (gradeBand === "all") {
    return true;
  }

  return getWordPracticeBand(word) === gradeBand;
}

function filterWordsBySelectedGrade(items) {
  return items.filter(
    (item) =>
      item?.word &&
      isWordEligibleForSelectedGrade(item.word)
  );
}

function filterWordsBySelectedFilters(items) {
  return items.filter(
    (item) =>
      item?.word &&
      isWordEligibleForSelectedGrade(item.word) &&
      isWordEligibleForSelectedVocabulary(item.word)
  );
}

function isWordHuntEligibleForSelectedGrade(question) {
  const questionWords =
    Array.isArray(question?.words)
      ? question.words
      : [];

  /*
    Reject the whole Word Hunt question if a
    reserved transfer word appears anywhere,
    including as a distractor.
  */
  if (
    questionWords.some(
      (item) =>
        isReservedTransferWord(item?.word)
    )
  ) {
    return false;
  }

  if (gradeBand === "all") {
    return true;
  }

  const correctWords =
    questionWords
      .filter((item) => item.correct)
      .map((item) => item.word);

  return (
    correctWords.length > 0 &&
    correctWords.every(
      (word) =>
        isWordEligibleForSelectedGrade(word)
    )
  );
}

function isWordHuntEligibleForSelectedVocabulary(question) {
  if (vocabLevel === "all") {
    return true;
  }

  const correctWords = question.words
    .filter((item) => item.correct)
    .map((item) => item.word);

  return (
    correctWords.length > 0 &&
    correctWords.every(
      (word) =>
        isWordEligibleForSelectedVocabulary(word)
    )
  );
}

function getWordVocabularyLevel(word) {
  return getWordMetadata(word)?.vocabLevel || null;
}

function isWordEligibleForSelectedVocabulary(word) {
  if (vocabLevel === "all") {
    return true;
  }

  return (
    getWordVocabularyLevel(word) === vocabLevel
  );
}

function getVocabularyLevelLabel() {
  const labels = {
    all: "All Vocabulary",
    familiar: "Familiar",
    academic: "Academic",
    challenge: "Stretch Words"
  };

  return labels[vocabLevel] || "All Vocabulary";
}

function getLearnExamplesForSelectedVocabulary(item) {
  /*
    Do not expose reserved Transfer Challenge
    words on Learn cards either.
  */
  const examples =
    (item?.examples || []).filter(
      (word) =>
        !isReservedTransferWord(word)
    );

  if (vocabLevel === "all") {
    return examples;
  }

  return examples.filter(
    (word) =>
      isWordEligibleForSelectedVocabulary(word)
  );
}

function getLearnExampleLabel() {
  if (vocabLevel === "all") {
    return "Common words";
  }

  return `${getVocabularyLevelLabel()} words`;
}

function getActiveWordFilterLabel() {
  const parts = [];

  if (gradeBand !== "all") {
    parts.push(getGradeBandLabel());
  }

  if (vocabLevel !== "all") {
    parts.push(getVocabularyLevelLabel());
  }

  return parts.join(" + ");
}

function getWordTransparency(word) {
  return getWordMetadata(word)?.transparency || null;
}

function wordHasReviewCaution(word) {
  return Boolean(getWordMetadata(word)?.reviewCaution);
}

function getWordRecommendedUse(word) {
  return (
    getWordMetadata(word)?.recommendedActivityUse || ""
  ).toLowerCase();
}

function getWordReviewText(word) {
  return (
    getWordMetadata(word)?.reviewCaution || ""
  ).toLowerCase();
}

function isWordEligibleForFind(word) {
  const metadata = getWordMetadata(word);

  if (!metadata) return false;

  return (
    metadata.transparency !== "low" &&
    getWordRecommendedUse(word).includes("find")
  );
}

function isWordEligibleForInference(word) {
  const metadata = getWordMetadata(word);

  if (!metadata) return false;

  const recommendedUse =
    getWordRecommendedUse(word);

  const caution =
    getWordReviewText(word);

  if (metadata.transparency === "low") {
    return false;
  }

  if (
    caution.includes("avoid independent inference") ||
    caution.includes("avoid inference") ||
    caution.includes("recognition only")
  ) {
    return false;
  }

  return recommendedUse.includes("figure it out");
}

function isWordEligibleForBuild(word) {
  const metadata = getWordMetadata(word);

  if (!metadata) return false;

  const recommendedUse =
    getWordRecommendedUse(word);

  const caution =
    getWordReviewText(word);

  if (!metadata.segmentation) {
    return false;
  }

  if (metadata.transparency === "low") {
    return false;
  }

  if (
    caution.includes("avoid build") ||
    caution.includes("not simple") ||
    caution.includes("do not simplify")
  ) {
    return false;
  }

  return recommendedUse.includes("build");
}

function normalizeMorphemeForMatch(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, "")
    .replace(/^-|-$/g, "");
}

function wordContainsTaughtMorpheme(
  word,
  targetMorpheme
) {
  const entry = getWordInventoryEntry(word);

  if (!entry || !targetMorpheme) {
    return false;
  }

  const target =
    normalizeMorphemeForMatch(targetMorpheme);

  return (entry.morphemes || []).some(
    (morpheme) => {
      const variants = String(morpheme)
        .split(/[\/,]/)
        .map(normalizeMorphemeForMatch);

      return variants.includes(target);
    }
  );
}

function isWordEligibleForWordHunt(
  word,
  targetMorpheme
) {
  const metadata = getWordMetadata(word);

  if (!metadata) return false;

  /*
    Word Hunt is recognition, not whole-word
    inference. Medium transparency and selected
    cautioned words can therefore still be valid
    when the target morpheme itself is explicitly
    taught and visibly locatable.
  */
  return wordContainsTaughtMorpheme(
    word,
    targetMorpheme
  );
}

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
    examples: ["disagree", "disconnect", "disobey"]
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
  },
  {
    id: "retro",
    type: "prefix",
    label: "retro-",
    speech: "retro",
    meaning: "backward; back",
    image: "images/prefixes/retro.png",
    examples: ["retrospective", "retroactive", "retrofit"]
  },
  {
    id: "circum",
    type: "prefix",
    label: "circum-",
    speech: "circum",
    meaning: "around",
    image: "images/prefixes/circum.png",
    examples: ["circumference", "circumnavigate", "circumscribe"]
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
    examples: ["suspend", "pendant", "pendulum"]
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
    examples: ["inspect", "spectator", "inspector"]
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
  examples: ["vocal", "vocalize", "vocalist"]
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
  speech: "moat or move",
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
},
{
  id: "micro",
  type: "root",
  label: "micro",
  speech: "micro",
  meaning: "small",
  image: "images/roots/micro.png",
  examples: ["microscope", "microscopic", "microorganism"]
},
{
  id: "tele",
  type: "root",
  label: "tele",
  speech: "tele",
  meaning: "far; distant",
  image: "images/roots/tele.png",
  examples: ["telegraph", "telescope", "television"]
},
{
  id: "auto",
  type: "root",
  label: "auto",
  speech: "auto",
  meaning: "self",
  image: "images/roots/auto.png",
  examples: ["autograph", "autobiography", "automatic"]
},
{
  id: "biblio",
  type: "root",
  label: "biblio",
  speech: "biblio",
  meaning: "book",
  image: "images/roots/biblio.png",
  examples: ["bibliography", "bibliographic", "bibliophile"]
},
{
  id: "derma",
  type: "root",
  label: "derma",
  speech: "derma",
  meaning: "skin",
  image: "images/roots/derma.png",
  examples: ["dermatology", "dermatologist", "dermal"]
},
{
  id: "phon",
  type: "root",
  label: "phon/phone",
  speech: "phon or phone",
  meaning: "sound",
  image: "images/roots/phon-phone.png",
  examples: ["phonics", "telephone", "phonograph"]
},
{
  id: "scop",
  type: "root",
  label: "scop/scope",
  speech: "scop or scope",
  meaning: "look; examine",
  image: "images/roots/scop-scope.png",
  examples: ["microscope", "telescope", "periscope"]
},
{
  id: "metr",
  type: "root",
  label: "metr/meter",
  speech: "metr or meter",
  meaning: "measure",
  image: "images/roots/metr-meter.png",
  examples: ["metric", "diameter", "thermometer"]
},
{
  id: "therm",
  type: "root",
  label: "therm",
  speech: "therm",
  meaning: "heat",
  image: "images/roots/therm.png",
  examples: ["thermal", "thermometer", "geothermal"]
},
{
  id: "geo",
  type: "root",
  label: "geo",
  speech: "geo",
  meaning: "earth",
  image: "images/roots/geo.png",
  examples: ["geology", "geography", "geothermal"]
},
{
  id: "terr",
  type: "root",
  label: "terr",
  speech: "terr",
  meaning: "earth; land",
  image: "images/roots/terr.png",
  examples: ["terrain", "territory", "subterranean"]
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
    meaning: "an action, or a state or quality someone or something has",
    image: "images/suffixes/ance.png",
    examples: ["performance", "importance", "acceptance"]
  },
  {
    id: "ence",
    type: "suffix",
    label: "-ence",
    speech: "ence",
    meaning: "an action, or a state or quality someone or something has",
    image: "images/suffixes/ence.png",
    examples: ["existence", "persistence", "dependence"]
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
    meaning: "a state or quality someone or something has",
    image: "images/suffixes/ity.png",
    examples: ["activity", "clarity", "security"]
  },
  {
    id: "ive",
    type: "suffix",
    label: "-ive",
    speech: "ive",
    meaning: "describes what someone or something is like or tends to do",
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
    meaning: "a state or quality someone or something has",
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
    meaning: "an action, process, or result",
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
    meaning: "an action, process, result, or state",
    image: "images/suffixes/ment.png",
    examples: ["movement", "development", "enjoyment"]
  },
{
  id: "ous",
  type: "suffix",
  label: "-ous",
  speech: "us",
  meaning: "having a quality",
  image: "images/suffixes/ous.png",
  examples: ["joyous", "dangerous", "famous"]
},
  {
    id: "ant-ent",
    type: "suffix",
    label: "-ant, -ent",
    speech: "ant or ent",
    meaning: "a person or thing that does something; describes a quality",
    image: "images/suffixes/ant-ent.png",
    examples: ["assistant", "dependent", "resistant"]
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
   SUFFIX GRAMMATICAL FUNCTION
   ======================================== */

const suffixFunctionInfo = {
  "al": {
    role: "Often forms an adjective",
    function: "Helps make a describing word that means related to the base."
  },

  "ance": {
    role: "Forms a noun",
    function: "Helps make a noun that names an action, or a state or quality someone or something has."
  },

  "ence": {
    role: "Forms a noun",
    function: "Helps make a noun that names an action, or a state or quality someone or something has."
  },

  "ic": {
    role: "Often forms an adjective",
    function: "Helps make a describing word related to the base."
  },

  "ity": {
    role: "Forms a noun",
    function: "Helps make a word that names a state or quality someone or something has."
  },

  "ive": {
    role: "Often forms an adjective",
    function: "Helps make a describing word that tells what someone or something is like or tends to do."
  },

  "ist": {
    role: "Forms a noun",
    function: "Often names a person who does, practices, or studies something."
  },

  "ize": {
    role: "Forms a verb",
    function: "Helps make an action word meaning make or become."
  },

  "ify": {
    role: "Forms a verb",
    function: "Helps make an action word meaning make or cause to become."
  },

  "ness": {
    role: "Forms a noun",
    function: "Helps make a word that names a state or quality someone or something has."
  },

  "ology": {
    role: "Forms a noun",
    function: "Helps name a field or study of something."
  },

  "able-ible": {
    role: "Often forms an adjective",
    function: "Helps make a describing word meaning can be or able to be."
  },

  "er-or": {
    role: "Forms a noun",
    function: "Often names a person or thing that does something."
  },

  "ful": {
    role: "Often forms an adjective",
    function: "Helps make a describing word meaning full of or having."
  },

  "ion": {
    role: "Forms a noun",
    function: "Helps make a word that names an action, process, or result."
  },

  "less": {
    role: "Forms an adjective",
    function: "Helps make a describing word meaning without."
  },

  "ly": {
    role: "Often forms an adverb",
    function: "Often tells how an action is done."
  },

  "ment": {
    role: "Forms a noun",
    function: "Helps make a noun that names an action, process, result, or state."
  },

  "ous": {
    role: "Forms an adjective",
    function: "Helps make a describing word that shows a quality someone or something has."
  },

  "ant-ent": {
    role: "Can form a noun or adjective",
    function: "Can name a person or thing that does something, or make a describing word that shows a quality."
  }
};
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
    id: "ant",
    type: "suffix",
    label: "-ant",
    meaning: "a person or thing that does something; describes a quality",
    image: "images/suffixes/ant.png"
  },
  {
    id: "ent",
    type: "suffix",
    label: "-ent",
    meaning: "a person or thing that does something; describes a quality",
    image: "images/suffixes/ent.png"
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
    base: "-ence = an action, or a state or quality someone or something has",
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
  base: "in- = not; -ive = describes what someone or something is like or tends to do",
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
  base: "-ion = an action, process, or result",
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
,
  {
    "type": "root",
    "word": "perspective",
    "before": "per",
    "target": "spect",
    "after": "ive",
    "answer": "spect",
    "choices": [
      "spect",
      "struct",
      "tract",
      "script"
    ],
    "itemId": "spect",
    "image": "images/roots/spect.png",
    "base": "spect = look or watch",
    "literal": "a way of looking",
    "definition": "a particular way of viewing or thinking about something"
  },
  {
    "type": "root",
    "word": "transport",
    "before": "trans",
    "target": "port",
    "after": "",
    "answer": "port",
    "choices": [
      "port",
      "mit",
      "tract",
      "duct"
    ],
    "itemId": "port",
    "image": "images/roots/port.png",
    "base": "trans- = across",
    "literal": "carry across",
    "definition": "to move people or things from one place to another"
  },
  {
    "type": "root",
    "word": "dictate",
    "before": "",
    "target": "dict",
    "after": "ate",
    "answer": "dict",
    "choices": [
      "dict",
      "voc",
      "scrib/script",
      "aud"
    ],
    "itemId": "dict",
    "image": "images/roots/dict.png",
    "base": "dict = say or speak",
    "literal": "say or speak",
    "definition": "to say words aloud so another person can write them down"
  },
  {
    "type": "root",
    "word": "reject",
    "before": "re",
    "target": "ject",
    "after": "",
    "answer": "ject",
    "choices": [
      "ject",
      "mit",
      "port",
      "tract"
    ],
    "itemId": "ject",
    "image": "images/roots/ject.png",
    "base": "re- = back",
    "literal": "throw back",
    "definition": "to refuse to accept, use, or believe something"
  },
  {
    "type": "root",
    "word": "construction",
    "before": "con",
    "target": "struct",
    "after": "ion",
    "answer": "struct",
    "choices": [
      "struct",
      "rupt",
      "tract",
      "spect"
    ],
    "itemId": "struct",
    "image": "images/roots/struct.png",
    "base": "con- = together; -ion = an action, process, or result",
    "literal": "process of building together",
    "definition": "the process of building or putting something together"
  },
  {
    "type": "root",
    "word": "distraction",
    "before": "dis",
    "target": "tract",
    "after": "ion",
    "answer": "tract",
    "choices": [
      "tract",
      "struct",
      "port",
      "sequ"
    ],
    "itemId": "tract",
    "image": "images/roots/tract.png",
    "base": "dis- = apart or away; -ion = an action, process, or result",
    "literal": "a pulling away",
    "definition": "something that draws attention away from what a person is doing"
  },
  {
    "type": "root",
    "word": "emit",
    "before": "e",
    "target": "mit",
    "after": "",
    "answer": "mit",
    "choices": [
      "mit",
      "port",
      "fer",
      "ject"
    ],
    "itemId": "mit",
    "image": "images/roots/mit.png",
    "base": "e- = out",
    "literal": "send out",
    "definition": "to send out light, sound, heat, gas, or another substance"
  },
  {
    "type": "root",
    "word": "auditory",
    "before": "",
    "target": "aud",
    "after": "itory",
    "answer": "aud",
    "choices": [
      "aud",
      "vis/vid",
      "spect",
      "voc"
    ],
    "itemId": "aud",
    "image": "images/roots/aud.png",
    "base": "aud = hear",
    "literal": "related to hearing",
    "definition": "connected with hearing or the sense of hearing"
  },
  {
    "type": "root",
    "word": "incredible",
    "before": "in",
    "target": "cred",
    "after": "ible",
    "answer": "cred",
    "choices": [
      "cred",
      "dict",
      "val",
      "aud"
    ],
    "itemId": "cred",
    "image": "images/roots/cred.png",
    "base": "in- = not; -ible = able to be",
    "literal": "not able to be believed",
    "definition": "so unusual or impressive that it is hard to believe"
  },
  {
    "type": "root",
    "word": "geography",
    "before": "geo",
    "target": "graph",
    "after": "y",
    "answer": "graph",
    "choices": [
      "graph",
      "scrib/script",
      "dict",
      "spect"
    ],
    "itemId": "graph",
    "image": "images/roots/graph.png",
    "base": "geo = earth",
    "literal": "writing or description of the earth",
    "definition": "the study of Earth's places, features, and people"
  },
  {
    "type": "root",
    "word": "invisible",
    "before": "in",
    "target": "vis",
    "after": "ible",
    "answer": "vis/vid",
    "choices": [
      "vis/vid",
      "spect",
      "aud",
      "graph"
    ],
    "itemId": "vis",
    "image": "images/roots/vis.png",
    "base": "in- = not; -ible = able to be",
    "literal": "not able to be seen",
    "definition": "unable to be seen"
  },
  {
    "word": "phoneme",
    "before": "",
    "target": "phon",
    "after": "eme",
    "answer": "phon/phone",
    "choices": [
      "phon/phone",
      "aud",
      "voc",
      "graph"
    ],
    "itemId": "phon",
    "image": "images/roots/phon-phone.png",
    "base": "phon = sound"
  },
  {
    "word": "biodiversity",
    "before": "",
    "target": "bio",
    "after": "diversity",
    "answer": "bio",
    "choices": [
      "bio",
      "geo",
      "micro",
      "phon/phone"
    ],
    "itemId": "bio",
    "image": "images/roots/bio.png",
    "base": "bio = life"
  },
  {
    "word": "microscopic",
    "before": "",
    "target": "micro",
    "after": "scopic",
    "answer": "micro",
    "choices": [
      "micro",
      "tele",
      "auto",
      "geo"
    ],
    "itemId": "micro",
    "image": "images/roots/micro.png",
    "base": "micro = small"
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
      { word: "inspector", correct: true, before: "in", target: "spect", after: "or" },
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
,

  // ADDITIONAL PREFIXES
  {
    type: "prefix",
    itemId: "un",
    label: "un-",
    meaning: "not; opposite of",
    words: [
      { word: "unhappy", correct: true, before: "", target: "un", after: "happy" },
      { word: "unfair", correct: true, before: "", target: "un", after: "fair" },
      { word: "unlock", correct: true, before: "", target: "un", after: "lock" },
      { word: "untie", correct: true, before: "", target: "un", after: "tie" },
      { word: "rebuild", correct: false },
      { word: "misread", correct: false },
      { word: "preview", correct: false },
      { word: "nonverbal", correct: false }
    ]
  },

  {
    type: "prefix",
    itemId: "dis",
    label: "dis-",
    meaning: "apart; away; not; opposite of",
    words: [
      { word: "disconnect", correct: true, before: "", target: "dis", after: "connect" },
      { word: "dislike", correct: true, before: "", target: "dis", after: "like" },
      { word: "disagree", correct: true, before: "", target: "dis", after: "agree" },
      { word: "disobey", correct: true, before: "", target: "dis", after: "obey" },
      { word: "rebuild", correct: false },
      { word: "preview", correct: false },
      { word: "submarine", correct: false },
      { word: "transport", correct: false }
    ]
  },

  {
    type: "prefix",
    itemId: "trans",
    label: "trans-",
    meaning: "across",
    words: [
      { word: "transport", correct: true, before: "", target: "trans", after: "port" },
      { word: "transform", correct: true, before: "", target: "trans", after: "form" },
      { word: "transmit", correct: true, before: "", target: "trans", after: "mit" },
      { word: "transfer", correct: true, before: "", target: "trans", after: "fer" },
      { word: "preview", correct: false },
      { word: "rebuild", correct: false },
      { word: "submarine", correct: false },
      { word: "nonverbal", correct: false }
    ]
  },

  {
    type: "prefix",
    itemId: "non",
    label: "non-",
    meaning: "not",
    words: [
      { word: "nonverbal", correct: true, before: "", target: "non", after: "verbal" },
      { word: "nonfiction", correct: true, before: "", target: "non", after: "fiction" },
      { word: "nonstop", correct: true, before: "", target: "non", after: "stop" },
      { word: "nonliving", correct: true, before: "", target: "non", after: "living" },
      { word: "unhappy", correct: false },
      { word: "misread", correct: false },
      { word: "preview", correct: false },
      { word: "transport", correct: false }
    ]
  },

  // ADDITIONAL ROOTS
  {
    type: "root",
    itemId: "dict",
    label: "dict",
    meaning: "say; tell",
    words: [
      { word: "predict", correct: true, before: "pre", target: "dict", after: "" },
      { word: "dictate", correct: true, before: "", target: "dict", after: "ate" },
      { word: "prediction", correct: true, before: "pre", target: "dict", after: "ion" },
      { word: "predictive", correct: true, before: "pre", target: "dict", after: "ive" },
      { word: "inspect", correct: false },
      { word: "portable", correct: false },
      { word: "sequence", correct: false },
      { word: "construct", correct: false }
    ]
  },

  {
    type: "root",
    itemId: "graph",
    label: "graph",
    meaning: "write; draw",
    words: [
      { word: "biography", correct: true, before: "bio", target: "graph", after: "y" },
      { word: "geography", correct: true, before: "geo", target: "graph", after: "y" },
      { word: "bibliography", correct: true, before: "biblio", target: "graph", after: "y" },
      { word: "graphical", correct: true, before: "", target: "graph", after: "ical" },
      { word: "portable", correct: false },
      { word: "sequence", correct: false },
      { word: "audible", correct: false },
      { word: "construct", correct: false }
    ]
  },

  {
    type: "root",
    itemId: "ject",
    label: "ject",
    meaning: "throw",
    words: [
      { word: "project", correct: true, before: "pro", target: "ject", after: "" },
      { word: "projection", correct: true, before: "pro", target: "ject", after: "ion" },
      { word: "reject", correct: true, before: "re", target: "ject", after: "" },
      { word: "inject", correct: true, before: "in", target: "ject", after: "" },
      { word: "inspect", correct: false },
      { word: "transport", correct: false },
      { word: "sequence", correct: false },
      { word: "credible", correct: false }
    ]
  },

  {
    type: "root",
    itemId: "tract",
    label: "tract",
    meaning: "pull; draw",
    words: [
      { word: "attract", correct: true, before: "at", target: "tract", after: "" },
      { word: "distraction", correct: true, before: "dis", target: "tract", after: "ion" },
      { word: "extraction", correct: true, before: "ex", target: "tract", after: "ion" },
      { word: "retractable", correct: true, before: "re", target: "tract", after: "able" },
      { word: "portable", correct: false },
      { word: "construct", correct: false },
      { word: "inspect", correct: false },
      { word: "sequence", correct: false }
    ]
  },

  // ADDITIONAL SUFFIXES
  {
    type: "suffix",
    itemId: "ly",
    label: "-ly",
    meaning: "in a certain way",
    words: [
      { word: "quickly", correct: true, before: "quick", target: "ly", after: "" },
      { word: "slowly", correct: true, before: "slow", target: "ly", after: "" },
      { word: "carefully", correct: true, before: "careful", target: "ly", after: "" },
      { word: "suddenly", correct: true, before: "sudden", target: "ly", after: "" },
      { word: "movement", correct: false },
      { word: "helpful", correct: false },
      { word: "walked", correct: false },
      { word: "portable", correct: false }
    ]
  },

  {
    type: "suffix",
    itemId: "ment",
    label: "-ment",
    meaning: "act; process; result",
    words: [
      { word: "movement", correct: true, before: "move", target: "ment", after: "" },
      { word: "agreement", correct: true, before: "agree", target: "ment", after: "" },
      { word: "treatment", correct: true, before: "treat", target: "ment", after: "" },
      { word: "development", correct: true, before: "develop", target: "ment", after: "" },
      { word: "quickly", correct: false },
      { word: "hopeful", correct: false },
      { word: "prediction", correct: false },
      { word: "visible", correct: false }
    ]
  },

  {
    type: "suffix",
    itemId: "ion",
    label: "-ion",
    meaning: "act; process; result",
    words: [
      { word: "motion", correct: true, before: "mot", target: "ion", after: "" },
      { word: "prediction", correct: true, before: "predict", target: "ion", after: "" },
      { word: "projection", correct: true, before: "project", target: "ion", after: "" },
      { word: "inspection", correct: true, before: "inspect", target: "ion", after: "" },
      { word: "movement", correct: false },
      { word: "quickly", correct: false },
      { word: "portable", correct: false },
      { word: "helpful", correct: false }
    ]
  },

  {
    type: "suffix",
    itemId: "able-ible",
    label: "-able / -ible",
    meaning: "able to be",
    words: [
      { word: "portable", correct: true, before: "port", target: "able", after: "" },
      { word: "visible", correct: true, before: "vis", target: "ible", after: "" },
      { word: "credible", correct: true, before: "cred", target: "ible", after: "" },
      { word: "audible", correct: true, before: "aud", target: "ible", after: "" },
      { word: "movement", correct: false },
      { word: "quickly", correct: false },
      { word: "prediction", correct: false },
      { word: "hopeful", correct: false }
    ]
  },


  {
    type: "root",
    itemId: "put",
    label: "put",
    meaning: "think; consider",
    words: [
      {
        word: "compute",
        correct: true,
        before: "com",
        target: "put",
        after: "e"
      },
      {
        word: "dispute",
        correct: true,
        before: "dis",
        target: "put",
        after: "e"
      },
      {
        word: "reputation",
        correct: true,
        before: "re",
        target: "put",
        after: "ation"
      },
      { word: "position", correct: false },
      { word: "valid", correct: false },
      { word: "transfer", correct: false },
      { word: "retention", correct: false }
    ]
  },


  {
    type: "prefix",
    itemId: "a-ad",
    label: "a-, ad-",
    meaning: "to; toward",
    words: [
      {
        word: "adjoin",
        correct: true,
        before: "",
        target: "ad",
        after: "join"
      },
      {
        word: "adhere",
        correct: true,
        before: "",
        target: "ad",
        after: "here"
      },
      {
        word: "advance",
        correct: true,
        before: "",
        target: "ad",
        after: "vance"
      },
      { word: "abduct", correct: false },
      { word: "retroactive", correct: false },
      { word: "transfer", correct: false },
      { word: "underpaid", correct: false }
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
    word: "rebuild",
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
    type: "prefix",
    knownLabel: "trans-",
    knownMeaning: "across",
    word: "transport",
    correct: "to carry or move something from one place to another",
    choices: [
      "to carry or move something from one place to another",
      "to build something again",
      "to pull something apart",
      "to keep something in one place"
    ],
    literal: "carry across",
    definition: "to move people or things from one place to another",
    image: "images/prefixes/trans.png"
  },
  {
    type: "prefix",
    knownLabel: "inter-",
    knownMeaning: "between; among",
    word: "international",
    correct: "involving or occurring between nations",
    choices: [
      "involving or occurring between nations",
      "happening inside one classroom",
      "taking place before a nation exists",
      "moving away from a nation"
    ],
    literal: "between nations",
    definition: "involving two or more countries or nations",
    image: "images/prefixes/inter.png"
  },
  {
    type: "prefix",
    knownLabel: "non-",
    knownMeaning: "not",
    word: "nonverbal",
    correct: "not using spoken words",
    choices: [
      "not using spoken words",
      "using words again",
      "speaking before someone else",
      "speaking very loudly"
    ],
    literal: "not verbal",
    definition: "communicating without spoken words",
    image: "images/prefixes/non.png"
  },
  {
    type: "prefix",
    knownLabel: "ab-",
    knownMeaning: "away",
    word: "abduct",
    correct: "to take or lead someone away",
    choices: [
      "to take or lead someone away",
      "to bring someone together",
      "to build something underneath",
      "to send something forward"
    ],
    literal: "lead away",
    definition: "to take a person away, especially by force",
    image: "images/prefixes/ab.png"
  },
  {
    type: "prefix",
    knownLabel: "ex-",
    knownMeaning: "out",
    word: "export",
    correct: "to send goods or materials out to another place",
    choices: [
      "to send goods or materials out to another place",
      "to bring goods into a place",
      "to carry goods underneath something",
      "to make goods again"
    ],
    literal: "carry out",
    definition: "to send goods or information out to another country or place",
    image: "images/prefixes/e-ex.png"
  },
  {
    type: "prefix",
    knownLabel: "pro-",
    knownMeaning: "forward",
    word: "project",
    correct: "to send, extend, or show something forward",
    choices: [
      "to send, extend, or show something forward",
      "to pull something backward",
      "to hide something underneath",
      "to break something apart"
    ],
    literal: "throw forward",
    definition: "to extend, send, or show something forward",
    image: "images/prefixes/pro.png"
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
    "type": "root",
    "knownLabel": "dict",
    "knownMeaning": "say; speak",
    "word": "dictate",
    "correct": "to say words aloud for someone else to write down",
    "choices": [
      "to say words aloud for someone else to write down",
      "to carry written words somewhere",
      "to erase words from a page",
      "to organize pictures into groups"
    ],
    "literal": "say or speak",
    "definition": "to say words aloud so that another person can write them down",
    "image": "images/roots/dict.png"
  },
  {
    "type": "root",
    "knownLabel": "spect",
    "knownMeaning": "look; watch",
    "word": "perspective",
    "correct": "a particular way of looking at or thinking about something",
    "choices": [
      "a particular way of looking at or thinking about something",
      "a way of carrying something",
      "a process of breaking something apart",
      "a written list arranged by time"
    ],
    "literal": "a way of looking",
    "definition": "a particular way of viewing or thinking about something",
    "image": "images/roots/spect.png"
  },
  {
    "type": "root",
    "knownLabel": "struct",
    "knownMeaning": "build",
    "word": "reconstruct",
    "correct": "to build or put something together again",
    "choices": [
      "to build or put something together again",
      "to break something into smaller pieces",
      "to carry something to another place",
      "to look closely at something"
    ],
    "literal": "build again",
    "definition": "to build, form, or create something again",
    "image": "images/roots/struct.png"
  },
  {
    "type": "root",
    "knownLabel": "aud",
    "knownMeaning": "hear",
    "word": "auditory",
    "correct": "related to hearing",
    "choices": [
      "related to hearing",
      "related to seeing",
      "related to writing",
      "related to movement"
    ],
    "literal": "related to hearing",
    "definition": "connected with hearing or the sense of hearing",
    "image": "images/roots/aud.png"
  },
  {
    "type": "root",
    "knownLabel": "chron",
    "knownMeaning": "time",
    "word": "chronology",
    "correct": "the arrangement of events in time order",
    "choices": [
      "the arrangement of events in time order",
      "a drawing of different places",
      "a list of sounds",
      "a group of objects organized by size"
    ],
    "literal": "organization by time",
    "definition": "the arrangement of events in the order in which they happened",
    "image": "images/roots/chron.png"
  },
  {
    "type": "root",
    "knownLabel": "cred",
    "knownMeaning": "believe; trust",
    "word": "credible",
    "correct": "able to be believed or trusted",
    "choices": [
      "able to be believed or trusted",
      "unable to be heard",
      "easy to carry",
      "likely to break"
    ],
    "literal": "able to be believed",
    "definition": "believable or worthy of trust",
    "image": "images/roots/cred.png"
  },
  {
    "type": "root",
    "knownLabel": "duct",
    "knownMeaning": "lead",
    "word": "abduct",
    "correct": "to lead or take someone away",
    "choices": [
      "to lead or take someone away",
      "to build something together",
      "to write something again",
      "to look beneath something"
    ],
    "literal": "lead away",
    "definition": "to take a person away, especially by force",
    "image": "images/roots/duct-duce.png"
  },
  {
    "type": "root",
    "knownLabel": "graph",
    "knownMeaning": "write; draw",
    "word": "bibliography",
    "correct": "a list of written sources or books",
    "choices": [
      "a list of written sources or books",
      "a recording of spoken sounds",
      "a timeline of historical events",
      "a tool used to measure distance"
    ],
    "literal": "writing about books",
    "definition": "a list of books and other sources used or referred to in a work",
    "image": "images/roots/graph.png"
  },
  {
    "type": "root",
    "knownLabel": "ject",
    "knownMeaning": "throw",
    "word": "reject",
    "correct": "to refuse or throw back something that is offered",
    "choices": [
      "to refuse or throw back something that is offered",
      "to carry something across",
      "to build something again",
      "to listen to something carefully"
    ],
    "literal": "throw back",
    "definition": "to refuse to accept, use, or believe something",
    "image": "images/roots/ject.png"
  },
  {
    "type": "root",
    "knownLabel": "mit",
    "knownMeaning": "send",
    "word": "transmit",
    "correct": "to send something from one place to another",
    "choices": [
      "to send something from one place to another",
      "to pull something backward",
      "to look at something closely",
      "to arrange something by time"
    ],
    "literal": "send across",
    "definition": "to send information, sound, energy, or something else from one place to another",
    "image": "images/roots/mit.png"
  },
  {
    "type": "root",
    "knownLabel": "sequ",
    "knownMeaning": "follow",
    "word": "sequence",
    "correct": "a set of things that follow one another in order",
    "choices": [
      "a set of things that follow one another in order",
      "a group of things scattered randomly",
      "an object carried from place to place",
      "a structure that has been broken apart"
    ],
    "literal": "things that follow",
    "definition": "a set of things arranged so that one follows another",
    "image": "images/roots/sequ.png"
  },
  {
    "type": "root",
    "knownLabel": "tract",
    "knownMeaning": "pull; draw",
    "word": "distraction",
    "correct": "something that pulls attention away",
    "choices": [
      "something that pulls attention away",
      "something that builds attention",
      "something that sends a message",
      "something arranged in time order"
    ],
    "literal": "a pulling away",
    "definition": "something that draws or pulls attention away from what a person is doing",
    "image": "images/roots/tract.png"
  },
  {
    "type": "root",
    "knownLabel": "tract",
    "knownMeaning": "pull; draw",
    "word": "retractable",
    "correct": "able to be pulled back",
    "choices": [
      "able to be pulled back",
      "able to be written on",
      "able to be heard clearly",
      "able to be built again"
    ],
    "literal": "able to be pulled back",
    "definition": "able to be drawn or pulled back into a smaller or hidden position",
    "image": "images/roots/tract.png"
  },
  {
    "type": "root",
    "knownLabel": "vert",
    "knownMeaning": "turn",
    "word": "convert",
    "correct": "to turn or change something into another form",
    "choices": [
      "to turn or change something into another form",
      "to carry something away",
      "to break something apart",
      "to hear something again"
    ],
    "literal": "turn or change",
    "definition": "to change something into a different form, use, or system",
    "image": "images/roots/vert.png"
  },
  {
    "type": "root",
    "knownLabel": "voc",
    "knownMeaning": "voice; call",
    "word": "vocalist",
    "correct": "a person who uses the voice to sing",
    "choices": [
      "a person who uses the voice to sing",
      "a person who writes music",
      "a person who builds instruments",
      "a person who studies time"
    ],
    "literal": "a person connected with voice",
    "definition": "a singer, especially one who performs with a group",
    "image": "images/roots/voc.png"
  },
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
  },

  {
    type: "prefix",
    itemId: "un",
    knownLabel: "un-",
    knownMeaning: "not; opposite of",
    word: "unhappy",
    correct: "sad or not feeling happy",
    choices: [
      "sad or not feeling happy",
      "happy again",
      "happier than before",
      "happy before something happens"
    ],
    literal: "not happy",
    definition: "sad or not feeling happy",
    image: "images/prefixes/un.png"
  },

  {
    type: "prefix",
    itemId: "dis",
    knownLabel: "dis-",
    knownMeaning: "apart or away; not; opposite of",
    word: "disagree",
    correct: "to have a different opinion or not agree",
    choices: [
      "to have a different opinion or not agree",
      "to agree again",
      "to agree before someone else",
      "to agree very strongly"
    ],
    literal: "not agree",
    definition: "to have a different opinion or not agree",
    image: "images/prefixes/dis.png"
  },

  {
    type: "prefix",
    itemId: "semi",
    knownLabel: "semi-",
    knownMeaning: "half; partly",
    word: "semifinal",
    correct: "a round near the end of a competition that comes before the final",
    choices: [
      "a round near the end of a competition that comes before the final",
      "the very first round of a competition",
      "a competition with no final round",
      "a competition that has already ended"
    ],
    literal: "part of the final stage",
    definition: "a round that determines who advances to the final",
    image: "images/prefixes/semi.png"
  },

  {
    type: "root",
    itemId: "scrib",
    knownLabel: "scrib/script",
    knownMeaning: "write",
    word: "manuscript",
    correct: "an original written or typed document",
    choices: [
      "an original written or typed document",
      "a tool used to erase writing",
      "a picture made without words",
      "a speech that is never written down"
    ],
    literal: "written by hand",
    definition: "an original written or typed document",
    image: "images/roots/scrib-script.png"
  },

  {
    type: "root",
    itemId: "bio",
    knownLabel: "bio",
    knownMeaning: "life",
    word: "biography",
    correct: "a written account of a person's life",
    choices: [
      "a written account of a person's life",
      "a map showing where a person lives",
      "a study of rocks and landforms",
      "a list of sounds in a language"
    ],
    literal: "writing about a life",
    definition: "a written account of a person's life",
    image: "images/roots/bio.png"
  },

  {
    type: "root",
    itemId: "geo",
    knownLabel: "geo",
    knownMeaning: "earth",
    word: "geography",
    correct: "the study of Earth, places, and people",
    choices: [
      "the study of Earth, places, and people",
      "the study of living things",
      "the study of sound and speech",
      "the study of heat and temperature"
    ],
    literal: "description or study of Earth",
    definition: "the study of Earth, places, and people",
    image: "images/roots/geo.png"
  },

  {
    type: "root",
    itemId: "form",
    knownLabel: "form",
    knownMeaning: "shape; form",
    word: "transform",
    correct: "to change into a different form",
    choices: [
      "to change into a different form",
      "to return to the same place",
      "to write something again",
      "to measure something carefully"
    ],
    literal: "change form",
    definition: "to change into a different form",
    image: "images/roots/form.png"
  },

  {
    type: "root",
    itemId: "mot",
    knownLabel: "mot/mov",
    knownMeaning: "move",
    word: "motion",
    correct: "movement or the act of moving",
    choices: [
      "movement or the act of moving",
      "the act of stopping completely",
      "a written set of directions",
      "the shape of an object"
    ],
    literal: "act or process of moving",
    definition: "movement or the act of moving",
    image: "images/roots/mot-mov.png"
  },

  {
    type: "suffix",
    itemId: "ity",
    knownLabel: "-ity",
    knownMeaning: "a state or quality someone or something has",
    word: "activity",
    correct: "being active or doing things",
    choices: [
      "being active or doing things",
      "a person who does something",
      "able to be active",
      "without being active"
    ],
    literal: "a state or quality of being active",
    definition: "being active or doing things",
    image: "images/suffixes/ity.png"
  },

  {
    type: "root",
    itemId: "tract",
    knownLabel: "tract",
    knownMeaning: "pull; draw",
    word: "attract",
    correct: "to draw something or someone toward",
    choices: [
      "to draw something or someone toward",
      "to push something far away",
      "to break something into parts",
      "to carry something across"
    ],
    literal: "pull toward",
    definition: "to draw something or someone toward",
    image: "images/roots/tract.png"
  },

  {
    type: "root",
    itemId: "biblio",
    knownLabel: "biblio",
    knownMeaning: "book",
    word: "bibliography",
    correct: "a list of books or sources used in a work",
    choices: [
      "a list of books or sources used in a work",
      "a person who writes a life story",
      "a picture showing Earth's surface",
      "a tool used to measure a book"
    ],
    literal: "book or source listing",
    definition: "a list of books or sources used in a work",
    image: "images/roots/biblio.png"
  },


  {
    type: "prefix",
    itemId: "en-em",
    knownLabel: "en-, em-",
    knownMeaning: "put into; cause to become",
    word: "encircle",
    correct: "to form a circle around something",
    choices: [
      "to form a circle around something",
      "to move something away from a circle",
      "to form the same circle again",
      "to form only half of a circle"
    ],
    literal: "put into or inside a circle",
    definition: "to form a circle around something",
    image: "images/prefixes/en-em.png"
  },

  {
    type: "prefix",
    itemId: "en-em",
    knownLabel: "en-, em-",
    knownMeaning: "put into; cause to become",
    word: "enrich",
    correct: "to improve something or make it richer",
    choices: [
      "to improve something or make it richer",
      "to make something poorer or less valuable",
      "to make something rich again",
      "to compare how rich two things are"
    ],
    literal: "cause to become richer",
    definition: "to improve something or make it richer",
    image: "images/prefixes/en-em.png"
  },

  {
    type: "prefix",
    itemId: "over",
    knownLabel: "over-",
    knownMeaning: "above; too much",
    word: "overcook",
    correct: "to cook something too much",
    choices: [
      "to cook something too much",
      "to cook something too little",
      "to cook something again",
      "to cook something before it is needed"
    ],
    literal: "cook too much",
    definition: "to cook something too much",
    image: "images/prefixes/over.png"
  },

  {
    type: "prefix",
    itemId: "over",
    knownLabel: "over-",
    knownMeaning: "above; too much",
    word: "overuse",
    correct: "to use something too much",
    choices: [
      "to use something too much",
      "to use something too little",
      "to use something again",
      "to stop using something"
    ],
    literal: "use too much",
    definition: "to use something too much",
    image: "images/prefixes/over.png"
  },

  {
    type: "prefix",
    itemId: "fore",
    knownLabel: "fore-",
    knownMeaning: "before; in front",
    word: "forecast",
    correct: "a prediction about what is expected to happen",
    choices: [
      "a prediction about what is expected to happen",
      "a report about what already happened",
      "a description of what is happening right now",
      "a guess made after the result is already known"
    ],
    literal: "tell or predict beforehand",
    definition: "a prediction about what is expected to happen",
    image: "images/prefixes/fore.png"
  },

  {
    type: "prefix",
    itemId: "fore",
    knownLabel: "fore-",
    knownMeaning: "before; in front",
    word: "forehead",
    correct: "the front part of the head above the eyes",
    choices: [
      "the front part of the head above the eyes",
      "the back part of the head above the neck",
      "the lower part of the head around the chin",
      "the side of the head near the ear"
    ],
    literal: "front of the head",
    definition: "the front part of the head above the eyes",
    image: "images/prefixes/fore.png"
  },

  {
    type: "prefix",
    itemId: "mid",
    knownLabel: "mid-",
    knownMeaning: "middle",
    word: "midday",
    correct: "the middle of the day; around noon",
    choices: [
      "the middle of the day; around noon",
      "the beginning of the day; around sunrise",
      "the end of the day; around sunset",
      "the time before the day begins"
    ],
    literal: "middle of the day",
    definition: "the middle of the day; around noon",
    image: "images/prefixes/mid.png"
  },

  {
    type: "prefix",
    itemId: "mid",
    knownLabel: "mid-",
    knownMeaning: "middle",
    word: "midpoint",
    correct: "the point in the middle of something",
    choices: [
      "the point in the middle of something",
      "the point where something begins",
      "the point where something ends",
      "a point beyond the end of something"
    ],
    literal: "middle point",
    definition: "the point in the middle of something",
    image: "images/prefixes/mid.png"
  },

  {
    type: "prefix",
    itemId: "under",
    knownLabel: "under-",
    knownMeaning: "below; too little",
    word: "undercook",
    correct: "to cook something too little",
    choices: [
      "to cook something too little",
      "to cook something too much",
      "to cook something again",
      "to cook something before it is needed"
    ],
    literal: "cook too little",
    definition: "to cook something too little",
    image: "images/prefixes/under.png"
  },

  {
    type: "prefix",
    itemId: "under",
    knownLabel: "under-",
    knownMeaning: "below; too little",
    word: "underground",
    correct: "below the surface of the ground",
    choices: [
      "below the surface of the ground",
      "above the surface of the ground",
      "around the outside of the ground",
      "across the surface of the ground"
    ],
    literal: "below the ground",
    definition: "below the surface of the ground",
    image: "images/prefixes/under.png"
  },

  {
    type: "prefix",
    itemId: "de",
    knownLabel: "de-",
    knownMeaning: "off; from; down",
    word: "destruction",
    correct: "the act or process of destroying something",
    choices: [
      "the act or process of destroying something",
      "the act or process of building something up",
      "the act or process of building something again",
      "the act or process of joining built parts together"
    ],
    literal: "act or process of breaking down",
    definition: "the act or process of destroying something",
    image: "images/prefixes/de.png"
  },

  {
    type: "prefix",
    itemId: "de",
    knownLabel: "de-",
    knownMeaning: "off; from; down",
    word: "destructive",
    correct: "causing damage or destruction",
    choices: [
      "causing damage or destruction",
      "causing something to be built up",
      "causing something to be built again",
      "causing built parts to stay together"
    ],
    literal: "causing something to be broken down",
    definition: "causing damage or destruction",
    image: "images/prefixes/de.png"
  },

  {
    type: "prefix",
    itemId: "super",
    knownLabel: "super-",
    knownMeaning: "above; beyond",
    word: "superhero",
    correct: "a hero with extraordinary powers or abilities",
    choices: [
      "a hero with extraordinary powers or abilities",
      "a hero with only ordinary abilities",
      "a hero with less ability than an ordinary person",
      "a person who works against heroes"
    ],
    literal: "a hero beyond the ordinary",
    definition: "a hero with extraordinary powers or abilities",
    image: "images/prefixes/super.png"
  },

  {
    type: "prefix",
    itemId: "super",
    knownLabel: "super-",
    knownMeaning: "above; beyond",
    word: "superhuman",
    correct: "beyond normal human ability",
    choices: [
      "beyond normal human ability",
      "within ordinary human ability",
      "below normal human ability",
      "opposed to human beings"
    ],
    literal: "beyond ordinary human ability",
    definition: "beyond normal human ability",
    image: "images/prefixes/super.png"
  },

  {
    type: "prefix",
    itemId: "anti",
    knownLabel: "anti-",
    knownMeaning: "against",
    word: "antifreeze",
    correct: "a substance that helps prevent a liquid from freezing",
    choices: [
      "a substance that helps prevent a liquid from freezing",
      "a substance that makes a liquid freeze faster",
      "a substance used only after a liquid has frozen",
      "a substance that makes only part of a liquid freeze"
    ],
    literal: "against freezing",
    definition: "a substance that helps prevent a liquid from freezing",
    image: "images/prefixes/anti.png"
  },

  {
    type: "prefix",
    itemId: "anti",
    knownLabel: "anti-",
    knownMeaning: "against",
    word: "antisocial",
    correct: "avoiding or opposing social interaction",
    choices: [
      "avoiding or opposing social interaction",
      "actively seeking social interaction",
      "repeating the same social interaction",
      "taking place between social groups"
    ],
    literal: "against or away from social interaction",
    definition: "avoiding or opposing social interaction",
    image: "images/prefixes/anti.png"
  },

  {
    type: "prefix",
    itemId: "circum",
    knownLabel: "circum-",
    knownMeaning: "around",
    word: "circumference",
    correct: "the distance around a circle",
    choices: [
      "the distance around a circle",
      "the distance straight across a circle",
      "the distance from the center to the edge",
      "the distance halfway around a circle"
    ],
    literal: "measure around",
    definition: "the distance around a circle",
    image: "images/prefixes/circum.png"
  },

  {
    type: "prefix",
    itemId: "circum",
    knownLabel: "circum-",
    knownMeaning: "around",
    word: "circumnavigate",
    correct: "to travel all the way around something",
    choices: [
      "to travel all the way around something",
      "to travel straight through something",
      "to travel away without going around it",
      "to travel only halfway around something"
    ],
    literal: "navigate around",
    definition: "to travel all the way around something",
    image: "images/prefixes/circum.png"
  },

  {
    type: "root",
    itemId: "phon",
    knownLabel: "phon/phone",
    knownMeaning: "sound",
    word: "phonology",
    correct: "the study of sound systems in language",
    choices: [
      "the study of sound systems in language",
      "the study of written letter shapes in language",
      "the study of word meanings in language",
      "the study of sentence order in language"
    ],
    literal: "study of sounds",
    definition: "the study of sound systems in language",
    image: "images/roots/phon-phone.png"
  },

  {
    type: "root",
    itemId: "phon",
    knownLabel: "phon/phone",
    knownMeaning: "sound",
    word: "phonics",
    correct: "a method of reading that connects letters with sounds",
    choices: [
      "a method of reading that connects letters with sounds",
      "a method of reading that connects letters only with pictures",
      "a method of reading that connects words only with definitions",
      "a method of reading that focuses only on punctuation"
    ],
    literal: "letters connected with sounds",
    definition: "a method of reading that connects letters with sounds",
    image: "images/roots/phon-phone.png"
  },

  {
    type: "root",
    itemId: "tele",
    knownLabel: "tele",
    knownMeaning: "far; distant",
    word: "telegraph",
    correct: "a system for sending messages over a long distance",
    choices: [
      "a system for sending messages over a long distance",
      "a system for sending messages only a short distance",
      "a system for keeping messages in one place",
      "a system for sending messages back to where they started"
    ],
    literal: "write or record from far away",
    definition: "a system for sending messages over a long distance",
    image: "images/roots/tele.png"
  },

  {
    type: "root",
    itemId: "tele",
    knownLabel: "tele",
    knownMeaning: "far; distant",
    word: "telescope",
    correct: "an instrument used to view distant objects",
    choices: [
      "an instrument used to view distant objects",
      "an instrument used to view very small nearby objects",
      "an instrument used to view objects beneath the ground",
      "an instrument used to view objects inside the body"
    ],
    literal: "look far away",
    definition: "an instrument used to view distant objects",
    image: "images/roots/tele.png"
  },

  {
    type: "root",
    itemId: "micro",
    knownLabel: "micro",
    knownMeaning: "small",
    word: "microscope",
    correct: "an instrument used to view very small objects",
    choices: [
      "an instrument used to view very small objects",
      "an instrument used to view very distant objects",
      "an instrument used to view only very large objects",
      "an instrument used to view only moving objects"
    ],
    literal: "look at something small",
    definition: "an instrument used to view very small objects",
    image: "images/roots/micro.png"
  },

  {
    type: "root",
    itemId: "micro",
    knownLabel: "micro",
    knownMeaning: "small",
    word: "microorganism",
    correct: "a living thing too small to see clearly without magnification",
    choices: [
      "a living thing too small to see clearly without magnification",
      "a living thing that is unusually large",
      "a living thing defined by being very far away",
      "a living thing that is only partly formed"
    ],
    literal: "small organism",
    definition: "a living thing too small to see clearly without magnification",
    image: "images/roots/micro.png"
  },

  {
    type: "root",
    itemId: "therm",
    knownLabel: "therm",
    knownMeaning: "heat",
    word: "thermostat",
    correct: "a device that controls temperature",
    choices: [
      "a device that controls temperature",
      "a device that controls sound volume",
      "a device that controls distance",
      "a device that controls the passage of time"
    ],
    literal: "heat or temperature control",
    definition: "a device that controls temperature",
    image: "images/roots/therm.png"
  },

  {
    type: "root",
    itemId: "therm",
    knownLabel: "therm",
    knownMeaning: "heat",
    word: "thermal",
    correct: "related to heat",
    choices: [
      "related to heat",
      "related to sound",
      "related to distance",
      "related to writing"
    ],
    literal: "having to do with heat",
    definition: "related to heat",
    image: "images/roots/therm.png"
  },

  {
    type: "root",
    itemId: "metr",
    knownLabel: "metr/meter",
    knownMeaning: "measure",
    word: "millimeter",
    correct: "one thousandth of a meter",
    choices: [
      "one thousandth of a meter",
      "a unit used to describe sound",
      "a unit used to describe heat",
      "a unit used to describe time"
    ],
    literal: "a small unit of measure",
    definition: "one thousandth of a meter",
    image: "images/roots/metr-meter.png"
  },

  {
    type: "root",
    itemId: "metr",
    knownLabel: "metr/meter",
    knownMeaning: "measure",
    word: "metric",
    correct: "related to a system of measurement based on meters",
    choices: [
      "related to a system of measurement based on meters",
      "related to a system for recording sounds",
      "related to a system for producing heat",
      "related to a system for organizing written words"
    ],
    literal: "related to measuring",
    definition: "related to a system of measurement based on meters",
    image: "images/roots/metr-meter.png"
  },

  {
    type: "root",
    itemId: "scop",
    knownLabel: "scop/scope",
    knownMeaning: "look; examine",
    word: "microscope",
    correct: "an instrument used to look at very small objects",
    choices: [
      "an instrument used to look at very small objects",
      "an instrument used to measure very small objects",
      "an instrument used to hear very small objects",
      "an instrument used to record very small objects"
    ],
    literal: "look at something small",
    definition: "an instrument used to look at very small objects",
    image: "images/roots/scop-scope.png"
  },

  {
    type: "root",
    itemId: "scop",
    knownLabel: "scop/scope",
    knownMeaning: "look; examine",
    word: "telescope",
    correct: "an instrument used to look at distant objects",
    choices: [
      "an instrument used to look at distant objects",
      "an instrument used to measure distant objects",
      "an instrument used to hear distant objects",
      "an instrument used to record distant objects"
    ],
    literal: "look far away",
    definition: "an instrument used to look at distant objects",
    image: "images/roots/scop-scope.png"
  },

  {
    type: "root",
    itemId: "auto",
    knownLabel: "auto",
    knownMeaning: "self",
    word: "autobiography",
    correct: "a person's written account of their own life",
    choices: [
      "a person's written account of their own life",
      "a written account of another person's life",
      "a written account of many people's lives",
      "a written account of the history of a place"
    ],
    literal: "self + life + writing",
    definition: "a person's written account of their own life",
    image: "images/roots/auto.png"
  },

  {
    type: "root",
    itemId: "auto",
    knownLabel: "auto",
    knownMeaning: "self",
    word: "autograph",
    correct: "a person's own signature",
    choices: [
      "a person's own signature",
      "another person's signature copied by someone else",
      "a printed version of a person's name",
      "a signature written for an entire group"
    ],
    literal: "self-written",
    definition: "a person's own signature",
    image: "images/roots/auto.png"
  },

  {
    type: "prefix",
    itemId: "a-ad",
    knownLabel: "a-, ad-",
    knownMeaning: "to; toward",
    word: "adjoin",
    correct: "to be next to or joined to something",
    choices: [
      "to be next to or joined to something",
      "to move away from or separate from something",
      "to be placed underneath something",
      "to break something into separate pieces"
    ],
    literal: "join to or toward",
    definition: "to be next to or joined to something",
    image: "images/prefixes/ad.png"
  },

  {
    type: "prefix",
    itemId: "retro",
    knownLabel: "retro-",
    knownMeaning: "backward; back",
    word: "retrospect",
    correct: "a look back at past events",
    choices: [
      "a look back at past events",
      "a look forward at future events",
      "a look only at what is happening now",
      "a look around without considering time"
    ],
    literal: "look back",
    definition: "a look back at past events",
    image: "images/prefixes/retro.png"
  },

  {
    type: "prefix",
    itemId: "retro",
    knownLabel: "retro-",
    knownMeaning: "backward; back",
    word: "retroactive",
    correct: "taking effect from a date in the past",
    choices: [
      "taking effect from a date in the past",
      "taking effect only from a future date",
      "taking effect only from the present moment",
      "no longer having any effect"
    ],
    literal: "acting back into the past",
    definition: "taking effect from a date in the past",
    image: "images/prefixes/retro.png"
  },

  {
    type: "root",
    itemId: "fer",
    knownLabel: "fer",
    knownMeaning: "carry; bear",
    word: "refer",
    correct: "to direct someone to another source or person for information or help",
    choices: [
      "to direct someone to another source or person for information or help",
      "to keep someone with the same source or person",
      "to pull information away from every source",
      "to build a new source instead of directing someone"
    ],
    literal: "carry or direct back",
    definition: "to direct someone to another source or person for information or help",
    image: "images/roots/fer.png"
  },

  {
    type: "root",
    itemId: "fer",
    knownLabel: "fer",
    knownMeaning: "carry; bear",
    word: "transfer",
    correct: "to move or carry something from one place or person to another",
    choices: [
      "to move or carry something from one place or person to another",
      "to keep something in the same place or with the same person",
      "to move something back to where it originally started",
      "to break something into separate pieces"
    ],
    literal: "carry across",
    definition: "to move or carry something from one place or person to another",
    image: "images/roots/fer.png"
  },

  {
    type: "root",
    itemId: "pel",
    knownLabel: "pel",
    knownMeaning: "push; drive",
    word: "compel",
    correct: "to force or drive someone to do something",
    choices: [
      "to force or drive someone to do something",
      "to politely invite someone without pressure",
      "to prevent someone from doing something",
      "to watch someone do something"
    ],
    literal: "push or drive",
    definition: "to force or drive someone to do something",
    image: "images/roots/pel.png"
  },

  {
    type: "root",
    itemId: "pel",
    knownLabel: "pel",
    knownMeaning: "push; drive",
    word: "propel",
    correct: "to push or drive something forward",
    choices: [
      "to push or drive something forward",
      "to pull something backward",
      "to hold something completely still",
      "to turn something in place without moving it forward"
    ],
    literal: "drive forward",
    definition: "to push or drive something forward",
    image: "images/roots/pel.png"
  },

  {
    type: "root",
    itemId: "pend",
    knownLabel: "pend/pens",
    knownMeaning: "hang",
    word: "pendant",
    correct: "an object that hangs from a necklace or chain",
    choices: [
      "an object that hangs from a necklace or chain",
      "an object that rests flat on top of a necklace",
      "an object that stands upright from a necklace",
      "an object hidden inside a necklace"
    ],
    literal: "hanging thing",
    definition: "an object that hangs from a necklace or chain",
    image: "images/roots/pend-pens.png"
  },

  {
    type: "root",
    itemId: "pend",
    knownLabel: "pend/pens",
    knownMeaning: "hang",
    word: "suspend",
    correct: "to hang something so that it is supported from above",
    choices: [
      "to hang something so that it is supported from above",
      "to set something firmly on the ground",
      "to push something across a surface",
      "to place something completely inside another object"
    ],
    literal: "hang beneath",
    definition: "to hang something so that it is supported from above",
    image: "images/roots/pend-pens.png"
  },

  {
    type: "root",
    itemId: "pos",
    knownLabel: "pos",
    knownMeaning: "put; place",
    word: "compose",
    correct: "to put parts together to make something",
    choices: [
      "to put parts together to make something",
      "to take parts apart from one another",
      "to move all the parts away",
      "to leave the parts scattered without arranging them"
    ],
    literal: "put together",
    definition: "to put parts together to make something",
    image: "images/roots/pos.png"
  },

  {
    type: "root",
    itemId: "pos",
    knownLabel: "pos",
    knownMeaning: "put; place",
    word: "position",
    correct: "the place where something is located",
    choices: [
      "the place where something is located",
      "the time when something happens",
      "the sound that something makes",
      "the way that something moves"
    ],
    literal: "place or put",
    definition: "the place where something is located",
    image: "images/roots/pos.png"
  },

  {
    type: "root",
    itemId: "ten",
    knownLabel: "ten",
    knownMeaning: "hold",
    word: "detention",
    correct: "the state of being kept or held back",
    choices: [
      "the state of being kept or held back",
      "the state of being released immediately",
      "the state of moving forward freely",
      "the state of being broken into parts"
    ],
    literal: "holding back",
    definition: "the state of being kept or held back",
    image: "images/roots/ten.png"
  },

  {
    type: "root",
    itemId: "ten",
    knownLabel: "ten",
    knownMeaning: "hold",
    word: "retention",
    correct: "the act of keeping or holding something",
    choices: [
      "the act of keeping or holding something",
      "the act of releasing or letting go of something",
      "the act of moving something far away",
      "the act of breaking something apart"
    ],
    literal: "holding or keeping",
    definition: "the act of keeping or holding something",
    image: "images/roots/ten.png"
  },

  {
    type: "root",
    itemId: "val",
    knownLabel: "val",
    knownMeaning: "be strong; be of worth",
    word: "value",
    correct: "the worth or importance of something",
    choices: [
      "the worth or importance of something",
      "the physical location of something",
      "the shape or size of something",
      "the speed at which something moves"
    ],
    literal: "worth",
    definition: "the worth or importance of something",
    image: "images/roots/val.png"
  },

  {
    type: "root",
    itemId: "val",
    knownLabel: "val",
    knownMeaning: "be strong; be of worth",
    word: "valid",
    correct: "acceptable, sound, or having legal force",
    choices: [
      "acceptable, sound, or having legal force",
      "rejected as weak, unsound, or unacceptable",
      "hidden so that it cannot be examined",
      "moved from one place to another"
    ],
    literal: "having worth or strength",
    definition: "acceptable, sound, or having legal force",
    image: "images/roots/val.png"
  },

  {
    type: "root",
    itemId: "derma",
    knownLabel: "derma",
    knownMeaning: "skin",
    word: "dermal",
    correct: "related to the skin",
    choices: [
      "related to the skin",
      "related to the bones",
      "related to the muscles",
      "related to the blood"
    ],
    literal: "related to skin",
    definition: "related to the skin",
    image: "images/roots/derma.png"
  },

  {
    type: "root",
    itemId: "derma",
    knownLabel: "derma",
    knownMeaning: "skin",
    word: "dermatitis",
    correct: "inflammation of the skin",
    choices: [
      "inflammation of the skin",
      "inflammation of the bones",
      "inflammation of the muscles",
      "inflammation of the lungs"
    ],
    literal: "skin inflammation",
    definition: "inflammation of the skin",
    image: "images/roots/derma.png"
  },

  {
    type: "root",
    itemId: "terr",
    knownLabel: "terr",
    knownMeaning: "earth; land",
    word: "terrain",
    correct: "an area of land and its physical features",
    choices: [
      "an area of land and its physical features",
      "an area made entirely of water",
      "a pattern of sounds and their features",
      "a written record and its features"
    ],
    literal: "land",
    definition: "an area of land and its physical features",
    image: "images/roots/terr.png"
  },

  {
    type: "root",
    itemId: "terr",
    knownLabel: "terr",
    knownMeaning: "earth; land",
    word: "territory",
    correct: "an area of land controlled or claimed by someone or something",
    choices: [
      "an area of land controlled or claimed by someone or something",
      "a period of time controlled or claimed by someone",
      "a collection of sounds controlled or claimed by someone",
      "a written list controlled or claimed by someone"
    ],
    literal: "area of land",
    definition: "an area of land controlled or claimed by someone or something",
    image: "images/roots/terr.png"
  },

  {
    type: "suffix",
    itemId: "ant-ent",
    knownLabel: "-ant, -ent",
    knownMeaning: "one who; having or being",
    word: "assistant",
    correct: "a person who helps someone",
    choices: [
      "a person who helps someone",
      "the act or process of helping someone",
      "something that is able to be helped",
      "something that was helped in the past"
    ],
    literal: "one who assists",
    definition: "a person who helps someone",
    image: "images/suffixes/ant-ent.png"
  },

  {
    type: "suffix",
    itemId: "ant-ent",
    knownLabel: "-ant, -ent",
    knownMeaning: "one who; having or being",
    word: "dependent",
    correct: "relying on someone or something else for support",
    choices: [
      "relying on someone or something else for support",
      "the act or process of relying on something",
      "a person who causes someone else to rely",
      "able to be relied on by someone else"
    ],
    literal: "being dependent",
    definition: "relying on someone or something else for support",
    image: "images/suffixes/ant-ent.png"
  },
  {
    "type": "prefix",
    "knownLabel": "non-",
    "knownMeaning": "not",
    "word": "nonlinear",
    "correct": "not forming a straight-line relationship",
    "choices": [
      "not forming a straight-line relationship",
      "forming the same straight-line relationship again",
      "forming a relationship below another line",
      "forming a relationship between two lines"
    ],
    "literal": "not linear",
    "definition": "not linear; in mathematics, not forming a straight-line relationship",
    "image": "images/prefixes/non.png"
  },
  {
    "type": "prefix",
    "knownLabel": "dis-",
    "knownMeaning": "apart; away; not",
    "word": "disruption",
    "correct": "a break or interruption in normal activity",
    "choices": [
      "a break or interruption in normal activity",
      "the restarting of normal activity in the same way",
      "the movement of normal activity to another place",
      "the preparation of normal activity before it begins"
    ],
    "literal": "a breaking apart",
    "definition": "an interruption that prevents something from continuing normally",
    "image": "images/prefixes/dis.png"
  },
  {
    "type": "root",
    "knownLabel": "port",
    "knownMeaning": "carry",
    "word": "transportation",
    "correct": "the movement or carrying of people or things from one place to another",
    "choices": [
      "the movement or carrying of people or things from one place to another",
      "the building of places for people or things",
      "the writing of information about people or things",
      "the viewing of people or things from a distance"
    ],
    "literal": "act or process of carrying across",
    "definition": "the movement of people or things from one place to another",
    "image": "images/roots/port.png"
  },
  {
    "type": "root",
    "knownLabel": "tract",
    "knownMeaning": "pull; draw",
    "word": "detract",
    "correct": "to take or draw attention, value, or importance away from something",
    "choices": [
      "to take or draw attention, value, or importance away from something",
      "to add attention, value, or importance to something",
      "to send information about something to another place",
      "to arrange information about something in time order"
    ],
    "literal": "pull away",
    "definition": "to take away from the value, quality, or importance of something",
    "image": "images/roots/tract.png"
  },
  {
    "type": "root",
    "knownLabel": "terr",
    "knownMeaning": "earth; land",
    "word": "subterranean",
    "correct": "located beneath the surface of the earth",
    "choices": [
      "located beneath the surface of the earth",
      "located high above the surface of the earth",
      "located between two bodies of water",
      "moving through the air above the earth"
    ],
    "literal": "under the earth",
    "definition": "existing or occurring beneath the surface of the earth",
    "image": "images/roots/terr.png"
  },
  {
    "type": "root",
    "knownLabel": "scrib/script",
    "knownMeaning": "write",
    "word": "transcribe",
    "correct": "to put spoken or recorded words into writing",
    "choices": [
      "to put spoken or recorded words into writing",
      "to send spoken words across a room",
      "to look at written words again without changing them",
      "to break a written passage into separate sections"
    ],
    "literal": "write across or copy into writing",
    "definition": "to make a written copy of spoken words or another source",
    "image": "images/roots/scrib-script.png"
  },
  {
    "type": "root",
    "knownLabel": "vis/vid",
    "knownMeaning": "see",
    "word": "revise",
    "correct": "to look over something again and make changes to improve it",
    "choices": [
      "to look over something again and make changes to improve it",
      "to hear something again and repeat it exactly",
      "to carry something back to where it started",
      "to break something apart and remove a section"
    ],
    "literal": "see again",
    "definition": "to look over something again and make changes to improve it",
    "image": "images/roots/vis-vid.png"
  },
  {
    "type": "prefix",
    "knownLabel": "mis-",
    "knownMeaning": "wrongly",
    "word": "misinterpret",
    "correct": "to understand or explain something incorrectly",
    "choices": [
      "to understand or explain something incorrectly",
      "to understand or explain something again",
      "to understand or explain something before it happens",
      "to understand or explain something without words"
    ],
    "literal": "interpret wrongly",
    "definition": "to understand or explain something incorrectly",
    "image": "images/prefixes/mis.png"
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
    suffixMeaning: "a person or thing that does something",
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
    suffixMeaning: "a person or thing that does something",
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
    suffixMeaning: "an action, process, result, or state",
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
    suffixMeaning: "having a quality",
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
    suffixMeaning: "a state or quality someone or something has",
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
    suffixMeaning: "describes what someone or something is like or tends to do",
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
    suffixMeaning: "a person who does or studies",
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
    suffixMeaning: "an action, or a state or quality someone or something has",
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
    suffixMeaning: "an action, or a state or quality someone or something has",
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
,
  {
    word: "audible",
    baseId: "aud",
    base: "aud",
    baseMeaning: "hear",
    suffixId: "ible",
    suffix: "-ible",
    suffixMeaning: "can be; able to be",
    literal: "able to be heard",
    definition: "loud or clear enough to be heard"
  },
  {
    word: "credible",
    baseId: "cred",
    base: "cred",
    baseMeaning: "believe; trust",
    suffixId: "ible",
    suffix: "-ible",
    suffixMeaning: "can be; able to be",
    literal: "able to be believed",
    definition: "believable or worthy of trust"
  },
  {
    word: "chronology",
    baseId: "chron",
    base: "chron",
    baseMeaning: "time",
    suffixId: "ology",
    suffix: "-ology",
    suffixMeaning: "study or organization",
    literal: "organization by time",
    definition: "the arrangement of events in the order they happened"
  },
  {
    word: "sequence",
    baseId: "sequ",
    base: "sequ",
    baseMeaning: "follow",
    suffixId: "ence",
    suffix: "-ence",
    suffixMeaning: "an action, or a state or quality someone or something has",
    literal: "things that follow",
    definition: "a set of things arranged in a particular order"
  },
  {
    word: "dependence",
    baseId: "depend",
    base: "depend",
    baseMeaning: "rely on",
    suffixId: "ence",
    suffix: "-ence",
    suffixMeaning: "an action, or a state or quality someone or something has",
    literal: "state of depending",
    definition: "the state of relying on someone or something"
  },
  {
    word: "persistence",
    baseId: "persist",
    base: "persist",
    baseMeaning: "continue despite difficulty",
    suffixId: "ence",
    suffix: "-ence",
    suffixMeaning: "an action, or a state or quality someone or something has",
    literal: "state of persisting",
    definition: "the quality of continuing even when something is difficult"
  }

];
/* ========================================
   PREFIX + ROOT / BASE + SUFFIX BUILDING DATA
   ======================================== */

const prefixRootSuffixBuildWords = [
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
    suffixMeaning: "an action, process, or result",
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
    suffixMeaning: "describes what someone or something is like or tends to do",
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
    suffixMeaning: "a person or thing that does something",
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
    suffixMeaning: "an action, process, or result",
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
  },

  {
    word: "extraction",
    prefixId: "ex",
    prefix: "ex-",
    prefixMeaning: "out",
    baseId: "tract",
    base: "tract",
    baseMeaning: "pull; draw",
    suffixId: "ion",
    suffix: "-ion",
    suffixMeaning: "an action, process, or result",
    literal: "act or process of pulling out",
    definition: "the act or process of pulling or taking something out"
  },

];
/* ========================================
   DOM REFERENCES
   ======================================== */

const studySelect = document.getElementById("studySelect");

const studyChoiceButtons = [
  ...document.querySelectorAll(".study-choice-button")
];
const gradeBandSelect = document.getElementById("gradeBandSelect");
const vocabLevelSelect = document.getElementById("vocabLevelSelect");
const studyAvailability =
  document.getElementById("studyAvailability");

const currentPracticeSummary =
  document.getElementById("currentPracticeSummary");

const currentPracticeSummaryValue =
  document.getElementById("currentPracticeSummaryValue");

const activityButtons = [
  ...document.querySelectorAll(".activity-button")
];

const wordBuilderPathTrack =
  document.getElementById("wordBuilderPathTrack");

const wordBuilderPathNote =
  document.getElementById("wordBuilderPathNote");

const wordBuilderPathSummary =
  document.getElementById("wordBuilderPathSummary");

const wordBuilderPathSteps = [
  {
    mode: "learn",
    icon: "📖",
    label: "Learn"
  },
  {
    mode: "find",
    icon: "🔎",
    label: "Find"
  },
  {
    mode: "hunt",
    icon: "🎯",
    label: "Word Hunt"
  },
  {
    mode: "meaning",
    icon: "✅",
    label: "Meaning"
  },
  {
    mode: "morpheme",
    icon: "🧩",
    label: "Word Part"
  },
  {
    mode: "break",
    icon: "🔨",
    label: "Break It Apart"
  },
  {
    mode: "infer",
    icon: "💡",
    label: "Figure It Out"
  },
  {
    mode: "build",
    icon: "🏗️",
    label: "Build Words"
  },
  {
    mode: "use",
    icon: "✏️",
    label: "Use It"
  },
  {
    mode: "change",
    icon: "🔄",
    label: "Change It"
  }
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
  break: document.getElementById("breakActivity"),
  infer: document.getElementById("inferActivity"),
  build: document.getElementById("buildActivity"),
  use: document.getElementById("useActivity"),
  change: document.getElementById("changeActivity")
};

const learningGrid = document.getElementById("learningGrid");
const learnExploreButton =
  document.getElementById("learnExploreButton");
const learnSortButton =
  document.getElementById("learnSortButton");
const learnSortWorkspace =
  document.getElementById("learnSortWorkspace");

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
const meaningQuestionAudioButton =
  document.getElementById("meaningQuestionAudioButton");
const meaningChoices = document.getElementById("meaningChoices");
const meaningFeedback = document.getElementById("meaningFeedback");

const morphemeMeaning = document.getElementById("morphemeMeaning");
const morphemeChoices = document.getElementById("morphemeChoices");
const morphemeFeedback = document.getElementById("morphemeFeedback");

const breakWord = document.getElementById("breakWord");
const breakChoices = document.getElementById("breakChoices");
const breakFeedback = document.getElementById("breakFeedback");

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
let learnMode = "explore";
let sortRoundIndex = 0;
let gradeBand = gradeBandSelect?.value || "all";
let vocabLevel = vocabLevelSelect?.value || "all";

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

function getMorphemeInventoryEntry(itemOrId) {
  const id =
    typeof itemOrId === "string"
      ? itemOrId
      : itemOrId?.id;

  if (!id) {
    return null;
  }

  return (
    window.FIRST_VOLO_MORPHEME_INVENTORY || []
  ).find(
    (entry) => entry.id === id
  ) || null;
}

/* ========================================
   CANONICAL PROGRESS MORPHEME IDS
   ======================================== */

const PROGRESS_MORPHEME_ID_ALIASES = {
  "a": "a-ad",
  "ad": "a-ad",
  "con": "con-com",
  "com": "con-com",
  "e": "e-ex",
  "ex": "e-ex",
  "en": "en-em",
  "em": "en-em",
  "able": "able-ible",
  "ible": "able-ible",
  "er-agent": "er-or",
  "or-agent": "er-or",
  "er-more-build": "er-more",
  "s": "s-es",
  "es": "s-es"
};

function normalizeProgressMorphemeSurface(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[‐-‒–—−]/g, "-")
    .trim()
    .replace(/^-+|-+$/g, "");
}

function getProgressMorphemeSurfaceMatches(
  value,
  type = ""
) {
  const target =
    normalizeProgressMorphemeSurface(value);

  if (!target) {
    return [];
  }

  const inventory =
    window.FIRST_VOLO_MORPHEME_INVENTORY || [];

  return inventory.filter((entry) => {
    if (type && entry.type !== type) {
      return false;
    }

    const rawVariants = [
      entry.id,
      entry.label
    ];

    const variants = [
      ...rawVariants,
      ...rawVariants.flatMap((variant) =>
        String(variant || "").split(/[\/,]/)
      )
    ]
      .map(normalizeProgressMorphemeSurface)
      .filter(Boolean);

    return variants.includes(target);
  });
}

function getCanonicalProgressMorphemeId(
  value,
  {
    type = "",
    meaning = ""
  } = {}
) {
  if (!value) {
    return null;
  }

  const raw = String(value).trim();
  const direct = getMorphemeInventoryEntry(raw);

  if (
    direct &&
    (!type || direct.type === type)
  ) {
    return direct.id;
  }

  const surface =
    normalizeProgressMorphemeSurface(raw);

  const meaningText =
    String(meaning || "").toLowerCase();

  /*
    in-/im- can represent two different
    instructional morpheme families.
    Use meaning when the context supplies it.
  */
  if (
    type === "prefix" &&
    ["in", "im", "il", "ir"].includes(surface)
  ) {
    if (
      surface === "il" ||
      surface === "ir" ||
      /\bnot\b|\bopposite\b|\bwithout\b/.test(
        meaningText
      )
    ) {
      return "negative-in-family";
    }

    if (
      /\bin\b|\binto\b|\binside\b|\bwithin\b/.test(
        meaningText
      )
    ) {
      return "location-in-family";
    }
  }

  /*
    -er is ambiguous between comparative -er
    and the person/agent suffix family.
  */
  if (
    type === "suffix" &&
    surface === "er"
  ) {
    if (
      /\bperson\b|\bone who\b|\bagent\b/.test(
        meaningText
      )
    ) {
      return "er-or";
    }

    if (
      /\bmore\b|\bcomparative\b/.test(
        meaningText
      )
    ) {
      return "er-more";
    }
  }

  const aliasId =
    PROGRESS_MORPHEME_ID_ALIASES[surface];

  if (aliasId) {
    const aliasEntry =
      getMorphemeInventoryEntry(aliasId);

    if (
      aliasEntry &&
      (!type || aliasEntry.type === type)
    ) {
      return aliasEntry.id;
    }
  }

  const matches =
    getProgressMorphemeSurfaceMatches(
      surface,
      type
    );

  /*
    Only accept an inferred surface form when
    it maps to exactly one taught morpheme.
    Ambiguous forms such as bare in-/im-
    are intentionally left unresolved.
  */
  return matches.length === 1
    ? matches[0].id
    : null;
}

function getCanonicalProgressMorphemeIdsFromSegmentation(
  segmentation
) {
  const ids = new Set();

  String(segmentation || "")
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const id =
        getCanonicalProgressMorphemeId(part);

      if (id) {
        ids.add(id);
      }
    });

  return [...ids];
}

function getCanonicalProgressMorphemeIdsFromBuildItem(
  item
) {
  if (!item) {
    return [];
  }

  const ids = new Set();

  const candidates = [
    {
      value: item.prefixId || item.prefix,
      type: "prefix",
      meaning: item.prefixMeaning
    },
    {
      value: item.rootId || item.root,
      type: "root",
      meaning: item.rootMeaning
    },
    {
      value: item.baseId || item.base,
      type: "root",
      meaning: item.baseMeaning
    },
    {
      value: item.suffixId || item.suffix,
      type: "suffix",
      meaning: item.suffixMeaning
    }
  ];

  candidates.forEach((candidate) => {
    const id =
      getCanonicalProgressMorphemeId(
        candidate.value,
        {
          type: candidate.type,
          meaning: candidate.meaning
        }
      );

    if (id) {
      ids.add(id);
    }
  });

  return [...ids];
}

window.FirstVoloMorphemeProgress = {
  canonicalId: getCanonicalProgressMorphemeId,
  idsFromSegmentation:
    getCanonicalProgressMorphemeIdsFromSegmentation,
  idsFromBuildItem:
    getCanonicalProgressMorphemeIdsFromBuildItem
};


function getMorphemeIntroBand(itemOrId) {
  return (
    getMorphemeInventoryEntry(itemOrId)
      ?.introBand || null
  );
}

function isMorphemeEligibleForSelectedGrade(item) {
  if (gradeBand === "all") {
    return true;
  }

  return (
    getMorphemeIntroBand(item) === gradeBand
  );
}

function getGradeBandLabel() {
  const labels = {
    all: "All Flights",
    "2-3": "Flight A",
    "4-5": "Flight B",
    "6-8": "Flight C"
  };

  return labels[gradeBand] || "All Flights";
}

function getStudyModeLabel() {
  const labels = {
    prefixes: "prefixes",
    roots: "roots",
    suffixes: "suffixes"
  };

  return labels[studyMode] || "word parts";
}


function getCurrentPracticeStudyLabel() {
  const labels = {
    prefixes: "Prefixes",
    roots: "Roots",
    suffixes: "Suffixes",
    "prefix-root": "Prefixes + Roots",
    "root-suffix": "Roots + Suffixes",
    "prefix-root-suffix":
      "Prefixes + Roots + Suffixes"
  };

  return labels[studyMode] || "";
}

function updateCurrentPracticeSummary() {
  if (
    !currentPracticeSummary ||
    !currentPracticeSummaryValue
  ) {
    return;
  }

  const studyLabel =
    getCurrentPracticeStudyLabel();

  if (!studyLabel) {
    currentPracticeSummary.hidden = true;
    currentPracticeSummaryValue.textContent = "";
    return;
  }

  currentPracticeSummaryValue.textContent = [
    studyLabel,
    getGradeBandLabel(),
    getVocabularyLevelLabel()
  ].join(" · ");

  currentPracticeSummary.hidden = false;
}


function getCurrentStudyItems() {
  let items = [];

  if (studyMode === "prefixes") {
    items = prefixes;
  } else if (studyMode === "roots") {
    items = roots;
  } else if (studyMode === "suffixes") {
    items = suffixes;
  } else if (studyMode === "prefix-root") {
    items = [...prefixes, ...roots];
  } else if (studyMode === "root-suffix") {
    items = [...roots, ...suffixes];
  } else if (studyMode === "prefix-root-suffix") {
    items = [
      ...prefixes,
      ...roots,
      ...suffixes
    ];
  }

  return items.filter(
    isMorphemeEligibleForSelectedGrade
  );
}


/* ========================================
   FLIGHT-DEPENDENT SETUP CONTROLS
   ======================================== */

function getAvailableMorphemeTypesForSelectedFlight() {
  const available = {
    prefix: false,
    root: false,
    suffix: false
  };

  const groups = {
    prefix: prefixes,
    root: roots,
    suffix: suffixes
  };

  Object.entries(groups).forEach(
    ([type, items]) => {
      available[type] = items.some(
        isMorphemeEligibleForSelectedGrade
      );
    }
  );

  return available;
}

function studyModeIsAvailableForSelectedFlight(mode) {
  if (gradeBand === "all") {
    return true;
  }

  const available =
    getAvailableMorphemeTypesForSelectedFlight();

  const requirements = {
    prefixes: ["prefix"],
    roots: ["root"],
    suffixes: ["suffix"],
    "prefix-root": ["prefix", "root"],
    "root-suffix": ["root", "suffix"],
    "prefix-root-suffix": [
      "prefix",
      "root",
      "suffix"
    ]
  };

  const required = requirements[mode] || [];

  return (
    required.length > 0 &&
    required.every((type) => available[type])
  );
}

function updateStudyChoiceAvailability() {
  let selectedStudyBecameUnavailable = false;

  studyChoiceButtons.forEach((button) => {
    const mode = button.dataset.studyMode;

    const isAvailable =
      studyModeIsAvailableForSelectedFlight(mode);

    const small = button.querySelector("small");

    if (
      small &&
      !button.dataset.availableLabel
    ) {
      button.dataset.availableLabel =
        small.textContent.trim();
    }

    button.disabled = !isAvailable;

    button.classList.toggle(
      "is-unavailable",
      !isAvailable
    );

    button.setAttribute(
      "aria-disabled",
      String(!isAvailable)
    );

    button.title = isAvailable
      ? ""
      : `Not available in ${getGradeBandLabel()}.`;

    if (small) {
      small.textContent = isAvailable
        ? button.dataset.availableLabel
        : "Not in this flight";
    }

    if (
      !isAvailable &&
      button.dataset.studyMode === studyMode
    ) {
      selectedStudyBecameUnavailable = true;
    }
  });

  if (selectedStudyBecameUnavailable) {
    studyMode = "";
    studySelect.value = "";

    studyChoiceButtons.forEach((button) => {
      button.classList.remove("active");
      button.setAttribute(
        "aria-pressed",
        "false"
      );
    });

    studyAvailability.textContent =
      "Choose an available option for this Practice Flight.";
  }
}

function vocabularyLevelExistsInSelectedFlight(level) {
  if (level === "all") {
    return true;
  }

  if (gradeBand === "all") {
    return WORD_INVENTORY.some(
      (entry) => entry.vocabLevel === level
    );
  }

  return WORD_INVENTORY.some(
    (entry) =>
      entry.practiceBand === gradeBand &&
      entry.vocabLevel === level
  );
}

function updateVocabularyLevelAvailability() {
  let selectedVocabularyBecameUnavailable = false;

  [...vocabLevelSelect.options].forEach(
    (option) => {
      const isAvailable =
        vocabularyLevelExistsInSelectedFlight(
          option.value
        );

      option.disabled = !isAvailable;

      if (
        !isAvailable &&
        option.value === vocabLevel
      ) {
        selectedVocabularyBecameUnavailable = true;
      }
    }
  );

  if (selectedVocabularyBecameUnavailable) {
    vocabLevel = "all";
    vocabLevelSelect.value = "all";
  }
}

function updateFlightDependentControls() {
  updateStudyChoiceAvailability();
  updateVocabularyLevelAvailability();
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

  const activityHeaders = {
    learn: {
      title: "Learn",
      subtitle:
        "Select a card to explore its meaning and example words."
    },

    find: {
      title: "Find",
      subtitle:
        "Identify the target word part in the whole word."
    },

    hunt: {
      title: "Word Hunt",
      subtitle:
        "Find every word that contains the target word part."
    },

    meaning: {
      title: "Meaning",
      subtitle:
        "Choose what the word part means."
    },

    morpheme: {
      title: "Word Part",
      subtitle:
        "Choose the word part that matches the meaning."
    },

    break: {
      title: "Break It Apart",
      subtitle:
        "Split the whole word into its meaningful parts."
    },

    infer: {
      title: "Figure It Out",
      subtitle:
        "Use a known word part to infer the word's meaning."
    },

    use: {
      title: "Use It",
      subtitle:
        "Use morphology to choose words that fit sentences."
    },

    build: {
      title: "Build Words",
      subtitle:
        studyMode === "root-suffix"
          ? "Combine a root or base with a suffix to create a real word."
          : studyMode === "prefix-root"
            ? "Combine a prefix and a root to create a real word."
            : "Combine word parts to create a real word."
    }
  };

  const currentHeader =
    activityHeaders[activeMode];

  if (currentHeader) {
    workspaceTitle.textContent =
      currentHeader.title;

    workspaceSubtitle.textContent =
      currentHeader.subtitle;
  }

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
    const isPlaceholder = option.value === "";
    option.disabled = isPlaceholder;

    option.textContent = option.textContent.replace(
      " — coming after suffixes are added",
      ""
    );
  });

  buildPatternButtons.forEach((button) => {
    const pattern = button.dataset.pattern;

    const isReady =
      pattern === "prefix-root" ||
      pattern === "root-suffix" ||
      pattern === "prefix-root-suffix";

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

function updateStudySelectForActivity() {
  const usesWordBuildingSet =
    activeMode === "build" ||
    activeMode === "use" ||
    activeMode === "change";

  const individualModes = new Set([
    "prefixes",
    "roots",
    "suffixes"
  ]);

  const buildModes = new Set([
    "prefix-root",
    "root-suffix",
    "prefix-root-suffix"
  ]);

  [...studySelect.options].forEach((option) => {
    if (!option.value) {
      option.hidden = false;
      option.textContent = usesWordBuildingSet
        ? "Choose a word-building pattern"
        : "Choose word parts";
      return;
    }

    option.hidden = usesWordBuildingSet
      ? !buildModes.has(option.value)
      : !individualModes.has(option.value);
  });

  [...studySelect.querySelectorAll("optgroup")].forEach(
    (group) => {
      const usesWordBuildingSetGroup =
        group.label === "Word Building";

      group.hidden = usesWordBuildingSet
        ? !usesWordBuildingSetGroup
        : usesWordBuildingSetGroup;
    }
  );

  const allowedModes = new Set([
    ...individualModes,
    ...buildModes
  ]);

  if (!allowedModes.has(studyMode)) {
    studyMode = "";
    studySelect.value = "";
    studyAvailability.textContent = "";

    const activityTitles = {
      learn: "Learn",
      find: "Find",
      hunt: "Word Hunt",
      meaning: "Meaning",
      morpheme: "Word Part",
      break: "Break It Apart",
      infer: "Figure It Out",
      build: "Build Words",
      use: "Use It",
      change: "Change It"
    };

    workspaceTitle.textContent =
      activityTitles[activeMode] || "";

    workspaceSubtitle.textContent = usesWordBuildingSet
      ? "Choose a word-building pattern to begin."
      : "Choose Prefixes, Roots, or Suffixes to begin.";
  }
}

function getPracticedActivityModes() {
  const student =
    window.FirstVoloActivityProgress?.getActiveStudent?.();

  if (!student || !Array.isArray(student.sessions)) {
    return new Set();
  }

  return new Set(
    student.sessions
      .filter((session) => {
        const responses =
          Array.isArray(session.responses)
            ? session.responses
            : [];

        return responses.length > 0;
      })
      .map((session) => session.activity)
      .filter(Boolean)
  );
}

function renderWordBuilderPath() {
  if (!wordBuilderPathTrack) {
    return;
  }

  const student =
    window.FirstVoloActivityProgress?.getActiveStudent?.();

  const practicedModes =
    getPracticedActivityModes();

  const practiceModes =
    wordBuilderPathSteps
      .filter((step) => step.mode !== "learn")
      .map((step) => step.mode);

  const practicedPracticeCount =
    practiceModes.filter(
      (mode) => practicedModes.has(mode)
    ).length;

  if (wordBuilderPathSummary) {
    wordBuilderPathSummary.textContent =
      `${practicedPracticeCount} of ${practiceModes.length} ` +
      `practice ${practiceModes.length === 1 ? "activity" : "activities"} tried`;
  }

  if (wordBuilderPathNote) {
    wordBuilderPathNote.textContent = student
      ? "✓ means this activity has saved practice. Nothing is locked."
      : "Choose any step. Select a student if you want practice saved.";
  }

  wordBuilderPathTrack.innerHTML =
    wordBuilderPathSteps
      .map((step) => {
        const isCurrent =
          step.mode === activeMode;

        const isPracticed =
          practicedModes.has(step.mode);

        const classNames = [
          "word-path-step",
          isCurrent ? "current" : "",
          isPracticed ? "practiced" : ""
        ]
          .filter(Boolean)
          .join(" ");

        const statusParts = [];

        if (isCurrent) {
          statusParts.push("current activity");
        }

        if (isPracticed) {
          statusParts.push("practiced");
        } else if (step.mode !== "learn") {
          statusParts.push("not yet practiced");
        }

        return `
          <button
            class="${classNames}"
            type="button"
            data-path-mode="${step.mode}"
            ${isCurrent ? 'aria-current="step"' : ""}
            aria-label="${step.label}${
              statusParts.length
                ? `. ${statusParts.join(", ")}`
                : ""
            }"
          >
            <span class="word-path-node">

              ${
                isCurrent
                  ? `
                    <img
                      class="word-path-volo"
                      src="images/volo-flying.png"
                      alt=""
                      aria-hidden="true"
                    >
                  `
                  : ""
              }

              <span
                class="word-path-icon"
                aria-hidden="true"
              >
                ${step.icon}
              </span>

              ${
                isPracticed
                  ? `
                    <span
                      class="word-path-check"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  `
                  : ""
              }
            </span>

            <span class="word-path-label">
              ${step.label}
            </span>
          </button>
        `;
      })
      .join("");
}

function updateVocabularyFilterAvailability(mode = activeMode) {
  const vocabularyDoesNotApply =
    mode === "meaning" ||
    mode === "morpheme";

  vocabLevelSelect.disabled =
    vocabularyDoesNotApply;

  vocabLevelSelect.title =
    vocabularyDoesNotApply
      ? "Vocabulary level does not apply to direct word-part practice."
      : "";
}

function activateActivityButton(mode) {
  activityButtons.forEach((button) => {
    const isActive = button.dataset.mode === mode;

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  updateVocabularyFilterAvailability(mode);
  updateStudySelectForActivity();
  renderWordBuilderPath();
}

function renderCurrentActivity() {
  const gradeFilteredMorphemeModes =
    new Set([
      "learn",
      "meaning",
      "morpheme"
    ]);

  if (
    studyMode &&
    gradeBand !== "all" &&
    gradeFilteredMorphemeModes.has(activeMode) &&
    getCurrentStudyItems().length === 0
  ) {
    showStartMessage(
      `No ${getGradeBandLabel()} ${getStudyModeLabel()} are available here yet.`,
      "Choose another practice flight or word part, or select All Flights."
    );

    return;
  }

  if (!studyMode) {
    showStartMessage(
      "Choose what you want to study.",
      "Choose prefixes, roots, suffixes, or a word-building combination above, then select an activity."
    );

    return;
  }

  if (
    (activeMode === "build" || activeMode === "use" || activeMode === "change") &&
    studyMode !== "prefix-root" &&
    studyMode !== "root-suffix" &&
    studyMode !== "prefix-root-suffix"
  ) {
    showStartMessage(
      "Choose a word-building set.",
      "Select a word-building pattern in Step 1 to use Build Words."
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

  if (activeMode === "use") {
    renderUseItActivity();
    return;
  }

  if (activeMode === "change") {
    renderChangeItActivity();
    return;
  }

  startQuiz(activeMode);
}


/* ========================================
   LEARN ACTIVITY
   ======================================== */

function renderSortItActivity() {
  learningGrid.hidden = true;
  learnSortWorkspace.hidden = false;

  workspaceSubtitle.textContent =
    "Sort words and word parts into meaningful groups.";

  if (studyMode !== "prefixes") {
    learnSortWorkspace.innerHTML = `
      <div class="sort-it-shell">
        <div class="sort-it-heading">
          <div class="sort-it-kicker">🗂️ Sort It</div>
          <h3>Prefix sorting is ready</h3>
          <p>
            Choose <strong>Prefixes</strong> above to play the
            first Sort It learning rounds.
          </p>
        </div>
      </div>
    `;
    return;
  }

  function getPrefix(id) {
    return prefixes.find((item) => item.id === id);
  }

  function prefixIsAvailable(id) {
    const item = getPrefix(id);

    return Boolean(
      item &&
      isMorphemeEligibleForSelectedGrade(item)
    );
  }

  function makeWordFamilyRound(ids, title) {
    const targets = ids.map((id) => {
      const question = wordHuntQuestions.find(
        (item) =>
          item.type === "prefix" &&
          item.itemId === id
      );

      const morpheme = getPrefix(id);

      if (
        !question ||
        !morpheme ||
        !prefixIsAvailable(id)
      ) {
        return null;
      }

      const words = question.words
        .filter((word) => word.correct)
        .slice(0, 4);

      if (words.length < 4) {
        return null;
      }

      return {
        id,
        label: morpheme.label,
        meaning: morpheme.meaning,
        image: morpheme.image,
        words
      };
    }).filter(Boolean);

    if (targets.length < 3) {
      return null;
    }

    return {
      type: "word-family",
      kicker: "🗂️ Sort It · Prefixes",
      title,
      instructions:
        "Tap a word, then tap the prefix box where it belongs. Use the picture and meaning as clues.",
      targets,
      cards: shuffle(
        targets.flatMap((target) =>
          target.words.map((word, index) => ({
            ...word,
            targetId: target.id,
            cardId: `${target.id}-${index}`
          }))
        )
      ),
      completion:
        `You practiced ${targets.length * 4} words with ${targets.length} prefixes.`
    };
  }

  function makeChameleonRound() {
    if (!prefixIsAvailable("negative-in-family")) {
      return null;
    }

    const targets = [
      {
        id: "negative-in",
        label: "in-",
        meaning: "the basic form",
        image: "images/prefixes/in-not.png"
      },
      {
        id: "negative-im",
        label: "im-",
        meaning: "before b, m, or p",
        image: "images/prefixes/im-not.png"
      },
      {
        id: "negative-il",
        label: "il-",
        meaning: "before l",
        image: "images/prefixes/il.png"
      },
      {
        id: "negative-ir",
        label: "ir-",
        meaning: "before r",
        image: "images/prefixes/ir.png"
      }
    ];

    const cards = shuffle([
      {
        cardId: "inactive",
        word: "inactive",
        targetId: "negative-in",
        before: "",
        target: "in",
        after: "active"
      },
      {
        cardId: "impossible",
        word: "impossible",
        targetId: "negative-im",
        before: "",
        target: "im",
        after: "possible"
      },
      {
        cardId: "illegal",
        word: "illegal",
        targetId: "negative-il",
        before: "",
        target: "il",
        after: "legal"
      },
      {
        cardId: "irregular",
        word: "irregular",
        targetId: "negative-ir",
        before: "",
        target: "ir",
        after: "regular"
      }
    ]);

    return {
      type: "chameleon",
      kicker: "🦎 Chameleon Prefix",
      title: "How does in- change its spelling?",
      instructions:
        "The prefix in- meaning NOT can change its spelling to match the beginning of the base. Sort each word by the form it uses.",
      teachingNote:
        "in- is the basic form. It changes to im- before b, m, or p; il- before l; and ir- before r.",
      targets,
      cards,
      completion:
        "You practiced the four spelling forms of the negative prefix in-."
    };
  }

  function makeMeaningContrastRound() {
    if (
      !prefixIsAvailable("negative-in-family") ||
      !prefixIsAvailable("location-in-family")
    ) {
      return null;
    }

    const negative = getPrefix("negative-in-family");
    const location = getPrefix("location-in-family");

    const targets = [
      {
        id: "not-meaning",
        label: "in- / im-",
        meaning: "NOT",
        image: negative.image
      },
      {
        id: "inside-meaning",
        label: "in- / im-",
        meaning: "IN · INTO · INSIDE",
        image: location.image
      }
    ];

    const cards = shuffle([
      {
        cardId: "contrast-inactive",
        word: "inactive",
        targetId: "not-meaning",
        before: "",
        target: "in",
        after: "active"
      },
      {
        cardId: "contrast-impossible",
        word: "impossible",
        targetId: "not-meaning",
        before: "",
        target: "im",
        after: "possible"
      },
      {
        cardId: "contrast-inbound",
        word: "inbound",
        targetId: "inside-meaning",
        before: "",
        target: "in",
        after: "bound"
      },
      {
        cardId: "contrast-insert",
        word: "insert",
        targetId: "inside-meaning",
        before: "",
        target: "in",
        after: "sert"
      },
      {
        cardId: "contrast-import",
        word: "import",
        targetId: "inside-meaning",
        before: "",
        target: "im",
        after: "port"
      },
      {
        cardId: "contrast-immerse",
        word: "immerse",
        targetId: "inside-meaning",
        before: "",
        target: "im",
        after: "merse"
      }
    ]);

    return {
      type: "meaning-contrast",
      kicker: "🔍 Same Spelling · Different Meaning",
      title: "What does in- or im- mean in this word?",
      instructions:
        "The prefixes can look the same but carry different meanings. Sort each word by what its prefix means.",
      teachingNote:
        "Look at the whole word. in- and im- can mean NOT, or they can mean IN, INTO, or INSIDE.",
      targets,
      cards,
      completion:
        "You compared two different meanings of in- and im-."
    };
  }

  const rounds = [
    makeWordFamilyRound(
      ["pre", "re", "sub"],
      "Which prefix is in each word?"
    ),
    makeWordFamilyRound(
      ["mis", "re", "sub"],
      "Sort another set of prefix families"
    ),
    makeChameleonRound(),
    makeMeaningContrastRound()
  ].filter(Boolean);

  if (rounds.length === 0) {
    learnSortWorkspace.innerHTML = `
      <div class="sort-it-shell">
        <div class="sort-it-heading">
          <div class="sort-it-kicker">🗂️ Sort It</div>
          <h3>No Sort It rounds are available</h3>
          <p>
            Try a different practice flight or choose All Flights.
          </p>
        </div>
      </div>
    `;
    return;
  }

  if (sortRoundIndex >= rounds.length) {
    sortRoundIndex = 0;
  }

  const round = rounds[sortRoundIndex];
  const targets = round.targets;
  const cards = round.cards;

  const gridClass =
    targets.length === 4
      ? "four-targets"
      : targets.length === 2
        ? "two-targets"
        : "";

  learnSortWorkspace.innerHTML = `
    <div class="sort-it-shell">

      <div class="sort-it-heading">
        <div class="sort-it-kicker">
          ${escapeHTML(round.kicker)}
        </div>

        <div class="sort-round-count">
          Round ${sortRoundIndex + 1} of ${rounds.length}
        </div>

        <h3>
          ${escapeHTML(round.title)}
        </h3>

        <p>
          ${escapeHTML(round.instructions)}
        </p>

        ${
          round.teachingNote
            ? `
              <div class="sort-teaching-note">
                ${escapeHTML(round.teachingNote)}
              </div>
            `
            : ""
        }
      </div>

      <div
        class="sort-it-feedback"
        id="sortItFeedback"
        aria-live="polite"
      >
        Choose a word card to begin.
      </div>

      <div class="sort-target-grid ${gridClass}">
        ${targets.map((target) => `
          <button
            class="sort-target prefix-sort-target"
            type="button"
            data-sort-target="${escapeHTML(target.id)}"
            aria-label="${escapeHTML(target.label)}, ${escapeHTML(target.meaning)}"
          >
            <img
              class="sort-target-image"
              src="${escapeHTML(target.image)}"
              alt=""
            >

            <div class="sort-target-label">
              ${escapeHTML(target.label)}
            </div>

            <div class="sort-target-meaning">
              ${escapeHTML(target.meaning)}
            </div>

            <div
              class="sort-target-placed"
              id="sortPlaced-${escapeHTML(target.id)}"
            ></div>
          </button>
        `).join("")}
      </div>

      <div class="sort-word-bank">
        ${cards.map((card) => `
          <button
            class="sort-word-card"
            type="button"
            data-sort-card="${escapeHTML(card.cardId)}"
          >
            ${escapeHTML(card.word)}
          </button>
        `).join("")}
      </div>

      <div
        class="sort-it-actions"
        id="sortItActions"
        hidden
      >
        <button
          class="sort-next-button"
          id="sortNextRoundButton"
          type="button"
        >
          Next Round →
        </button>
      </div>

    </div>
  `;

  const feedback =
    document.getElementById("sortItFeedback");

  const actions =
    document.getElementById("sortItActions");

  const nextRoundButton =
    document.getElementById("sortNextRoundButton");

  const cardButtons = [
    ...learnSortWorkspace.querySelectorAll(
      "[data-sort-card]"
    )
  ];

  const targetButtons = [
    ...learnSortWorkspace.querySelectorAll(
      "[data-sort-target]"
    )
  ];

  let selectedCard = null;
  let placedCount = 0;

  function clearCardSelection() {
    cardButtons.forEach((button) => {
      button.classList.remove("selected");
      button.setAttribute("aria-pressed", "false");
    });
  }

  function getWrongMessage(card) {
    if (round.type === "chameleon") {
      return `Look at the beginning of the base in ${card.word}. Try another form of in-.`;
    }

    if (round.type === "meaning-contrast") {
      return `Think about what in- or im- means in ${card.word}. Try the other meaning.`;
    }

    return `Look at the beginning of ${card.word}. Try another group.`;
  }

  function getCorrectMessage(target) {
    if (round.type === "chameleon") {
      return `${target.label} — ${target.meaning}. Choose another word.`;
    }

    if (round.type === "meaning-contrast") {
      return `Yes. Here the prefix means ${target.meaning}. Choose another word.`;
    }

    return `Nice! ${target.label} means ${target.meaning}. Choose another word.`;
  }

  cardButtons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", () => {
      const card = cards.find(
        (item) =>
          item.cardId === button.dataset.sortCard
      );

      if (!card) return;

      clearCardSelection();

      selectedCard = {
        data: card,
        button
      };

      button.classList.add("selected");
      button.setAttribute("aria-pressed", "true");

      feedback.textContent =
        `Now choose the group for ${card.word}.`;
    });
  });

  targetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!selectedCard) {
        feedback.textContent =
          "Choose a word card first, then choose its group.";
        return;
      }

      const targetId = button.dataset.sortTarget;
      const card = selectedCard.data;

      if (card.targetId !== targetId) {
        feedback.textContent =
          getWrongMessage(card);

        button.classList.add("try-again");

        window.setTimeout(() => {
          button.classList.remove("try-again");
        }, 450);

        return;
      }

      const target = targets.find(
        (item) => item.id === targetId
      );

      const placedArea =
        document.getElementById(
          `sortPlaced-${targetId}`
        );

      const placedWord =
        document.createElement("span");

      placedWord.className = "sort-placed-word";

      placedWord.innerHTML =
        `${escapeHTML(card.before || "")}` +
        `<strong>${escapeHTML(card.target || "")}</strong>` +
        `${escapeHTML(card.after || "")}`;

      placedArea.append(placedWord);

      selectedCard.button.hidden = true;

      clearCardSelection();

      selectedCard = null;
      placedCount += 1;

      button.classList.add("just-sorted");

      window.setTimeout(() => {
        button.classList.remove("just-sorted");
      }, 450);

      if (placedCount === cards.length) {
        feedback.innerHTML = `
          <strong>Round complete!</strong>
          ${escapeHTML(round.completion)}
        `;

        actions.hidden = false;
        return;
      }

      feedback.textContent =
        getCorrectMessage(target);
    });
  });

  nextRoundButton?.addEventListener("click", () => {
    sortRoundIndex =
      (sortRoundIndex + 1) % rounds.length;

    renderSortItActivity();
  });
}


function renderLearnActivity() {
  panels.learn.hidden = false;

  workspaceTitle.textContent = "Learn";
  workspaceSubtitle.textContent =
    "Select a card to explore its meaning and example words.";

  activityProgress.hidden = true;
  workspaceActions.hidden = true;

  learnExploreButton?.classList.toggle(
    "active",
    learnMode === "explore"
  );
  learnExploreButton?.setAttribute(
    "aria-pressed",
    String(learnMode === "explore")
  );

  learnSortButton?.classList.toggle(
    "active",
    learnMode === "sort"
  );
  learnSortButton?.setAttribute(
    "aria-pressed",
    String(learnMode === "sort")
  );

  if (learnMode === "sort") {
    renderSortItActivity();
    return;
  }

  workspaceSubtitle.textContent =
    "Select a card to explore its meaning and example words.";

  learningGrid.hidden = false;
  learnSortWorkspace.hidden = true;
  learnSortWorkspace.innerHTML = "";

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

  const filteredExamples =
  getLearnExamplesForSelectedVocabulary(item);

const examples =
  filteredExamples.length > 0
    ? filteredExamples.join(" · ")
    : `No ${getVocabularyLevelLabel().toLowerCase()} examples are currently included for this word part.`;

const exampleLabel =
  getLearnExampleLabel();
const suffixInfo =
  item.type === "suffix"
    ? suffixFunctionInfo[item.id]
    : null;

const suffixFunctionMarkup =
  suffixInfo
    ? `
        <div class="feedback-label">
          Word job
        </div>

        <div class="feedback-value">
          <strong>${escapeHTML(suffixInfo.role)}</strong>
        </div>

        <div class="feedback-label">
          What it does
        </div>

        <div class="feedback-value">
          ${escapeHTML(suffixInfo.function)}
        </div>
      `
    : "";
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
${suffixFunctionMarkup}
        <div class="feedback-label">
          ${escapeHTML(exampleLabel)}
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

  const audioExampleText =
    filteredExamples.length > 0
      ? `Examples include ${filteredExamples.join(", ")}.`
      : `No ${getVocabularyLevelLabel().toLowerCase()} examples are currently included for this word part.`;

  setAudioButton(
    detail,
    `${item.speech} means ${item.meaning}. ` +
    audioExampleText
  );

  detail.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}


/* ========================================
   BREAK IT APART QUESTION GENERATION
   ======================================== */

function getBreakSegmentationParts(segmentation) {
  return String(segmentation || "")
    .split(" + ")
    .map((part) => part.trim())
    .filter(Boolean);
}

function getBreakSurfacePart(part) {
  return part.replace(/^-+|-+$/g, "");
}

function getBreakSurfaceParts(segmentation) {
  return getBreakSegmentationParts(segmentation)
    .map(getBreakSurfacePart);
}

function getBreakMorphemeTypes(segmentation) {
  const inventory =
    window.FIRST_VOLO_MORPHEME_INVENTORY || [];

  const types = new Set();

  getBreakSegmentationParts(segmentation)
    .forEach((part) => {
      const target =
        normalizeMorphemeForMatch(part);

      inventory.forEach((entry) => {
        const variants = [
          entry.id,
          entry.label
        ]
          .flatMap((value) =>
            String(value || "").split(/[\\/,]/)
          )
          .map(normalizeMorphemeForMatch)
          .filter(Boolean);

        if (variants.includes(target)) {
          types.add(entry.type);
        }
      });
    });

  return [...types];
}

function getBreakBoundaryPositions(parts) {
  const boundaries = [];
  let position = 0;

  parts.slice(0, -1).forEach((part) => {
    position += part.length;
    boundaries.push(position);
  });

  return boundaries;
}

function splitWordAtBoundaries(word, boundaries) {
  const parts = [];
  let start = 0;

  boundaries.forEach((boundary) => {
    parts.push(word.slice(start, boundary));
    start = boundary;
  });

  parts.push(word.slice(start));

  return parts;
}

function createBreakDistractors(word, correctParts) {
  const correctBoundaries =
    getBreakBoundaryPositions(correctParts);

  const correctDisplay =
    correctParts.join(" + ");

  const distractors = [];
  const seen = new Set([correctDisplay]);

  function addCandidate(boundaries) {
    const sorted = [...boundaries].sort((a, b) => a - b);

    if (
      sorted.some(
        (boundary, index) =>
          boundary <= 0 ||
          boundary >= word.length ||
          (index > 0 && boundary <= sorted[index - 1])
      )
    ) {
      return;
    }

    const parts =
      splitWordAtBoundaries(word, sorted);

    if (parts.some((part) => !part)) {
      return;
    }

    const display = parts.join(" + ");

    if (seen.has(display)) {
      return;
    }

    seen.add(display);
    distractors.push(display);
  }

  if (correctBoundaries.length === 1) {
    const correctBoundary = correctBoundaries[0];

    for (
      let distance = 1;
      distance < word.length &&
      distractors.length < 3;
      distance += 1
    ) {
      addCandidate([
        correctBoundary - distance
      ]);

      if (distractors.length < 3) {
        addCandidate([
          correctBoundary + distance
        ]);
      }
    }
  }

  if (correctBoundaries.length === 2) {
    const [first, second] = correctBoundaries;

    const shifts = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [1, 1],
      [-1, 1],
      [1, -1],
      [-2, 0],
      [2, 0],
      [0, -2],
      [0, 2]
    ];

    shifts.forEach(([firstShift, secondShift]) => {
      if (distractors.length >= 3) {
        return;
      }

      addCandidate([
        first + firstShift,
        second + secondShift
      ]);
    });
  }

  return distractors.slice(0, 3);
}

const breakApartExcludedWords = new Set([
  "attract",
  "biology",
  "dermal",
  "perspective",
  "running",
  "rupture",
  "spectator",
  "structure",
  "writing",
  "transcribe",
  "revise",
  "subterranean",
  "phoneme",
  "biodiversity"
]);


function createBreakApartQuestions() {
  const inventory =
    window.FIRST_VOLO_WORD_INVENTORY || [];

  return inventory
    .filter(
      (entry) =>
        entry.status === "current" &&
        !breakApartExcludedWords.has(
          entry.word.toLowerCase()
        ) &&
        typeof entry.segmentation === "string" &&
        entry.segmentation.trim() &&
        !entry.segmentation.includes(";")
    )
    .map((entry) => {
      const surfaceParts =
        getBreakSurfaceParts(entry.segmentation);

      return {
        entry,
        surfaceParts
      };
    })
    .filter(({ entry, surfaceParts }) => {
      if (
        surfaceParts.length !== 2 &&
        surfaceParts.length !== 3
      ) {
        return false;
      }

      return (
        surfaceParts.join("").toLowerCase() ===
        entry.word.toLowerCase()
      );
    })
    .map(({ entry, surfaceParts }) => {
      const correct =
        surfaceParts.join(" + ");

      const distractors =
        createBreakDistractors(
          entry.word,
          surfaceParts
        );

      return {
        word: entry.word,
        segmentation: entry.segmentation,
        definition: entry.definition || "",
        types: getBreakMorphemeTypes(
          entry.segmentation
        ),
        correct,
        choices: [
          correct,
          ...distractors
        ]
      };
    })
    .filter(
      (question) =>
        question.choices.length === 4
    );
}

const breakApartQuestions =
  createBreakApartQuestions();


function isBreakQuestionEligibleForStudyMode(question) {
  const types = question?.types || [];

  if (studyMode === "prefixes") {
    return types.includes("prefix");
  }

  if (studyMode === "roots") {
    return types.includes("root");
  }

  if (studyMode === "suffixes") {
    return types.includes("suffix");
  }

  if (studyMode === "prefix-root") {
    return (
      types.includes("prefix") ||
      types.includes("root")
    );
  }

  if (studyMode === "root-suffix") {
    return (
      types.includes("root") ||
      types.includes("suffix")
    );
  }

  if (studyMode === "prefix-root-suffix") {
    return true;
  }

  return false;
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

  if (mode === "hunt") {
  items = items.filter(
    (question) =>
      isWordHuntEligibleForSelectedGrade(question) &&
      isWordHuntEligibleForSelectedVocabulary(question)
  );

  if (
    (gradeBand !== "all" || vocabLevel !== "all") &&
    items.length === 0
  ) {
    const filterLabel =
      getActiveWordFilterLabel();

    showStartMessage(
      `No complete ${filterLabel} Word Hunt rounds are available for this word-part selection yet.`,
      "Choose another practice flight, vocabulary level, or word part."
    );

    return;
  }
}

if (mode === "meaning") {
    items = createMeaningQuestions(getCurrentStudyItems());
  }

  if (mode === "morpheme") {
    items = createMorphemeQuestions(getCurrentStudyItems());
  }

  if (mode === "break") {
    items = breakApartQuestions.filter(
      isBreakQuestionEligibleForStudyMode
    );
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

  if (
    mode === "find" ||
    mode === "break" ||
    mode === "infer"
  ) {
    items = filterWordsBySelectedFilters(items);
  }

  if (
    (
      gradeBand !== "all" ||
      vocabLevel !== "all"
    ) &&
    (
      mode === "find" ||
      mode === "break" ||
      mode === "infer"
    ) &&
    items.length === 0
  ) {
    const activityName =
      mode === "find"
        ? "Find"
        : mode === "break"
          ? "Break It Apart"
          : "Figure It Out";

    showStartMessage(
      `No ${activityName} items match ${getActiveWordFilterLabel()} for this word-part selection yet.`,
      "Choose another practice flight, vocabulary level, or word part."
    );

    return;
  }

  quizState = {
    mode,
    items: shuffle(items).slice(0, 10),
    index: 0,
    score: 0,
    answered: false
  };

  window.FirstVoloActivityProgress?.startSession({
    activity: mode,
    studyMode,
    gradeBand,
    vocabLevel,
    totalItems: quizState.items.length
  });

  renderQuizQuestion();
}

function createMeaningQuestions(items) {
  return items.map((item) => {

    const candidates = shuffle(
      uniqueBy(
        items.filter((other) =>
          other.id !== item.id &&
          normalizeMeaning(other.meaning) !==
            normalizeMeaning(item.meaning) &&
          !(
            (item.id === "location-in-family" && other.id === "negative-in-family") ||
            (item.id === "negative-in-family" && other.id === "location-in-family")
          ) &&
          !(
            ["scop", "vis", "spect"].includes(item.id) &&
            ["scop", "vis", "spect"].includes(other.id)
          )
        ),
        (other) => normalizeMeaning(other.meaning)
      )
    );

    const distractors = [];

    /*
      First preference:
      - different from the correct meaning
      - different from distractors already chosen
    */
    for (const other of candidates) {

      if (distractors.length === 3) {
        break;
      }

      if (
        meaningsAreTooSimilar(
          item.meaning,
          other.meaning
        )
      ) {
        continue;
      }

      if (
        distractors.some((chosen) =>
          meaningsAreTooSimilar(
            chosen.meaning,
            other.meaning
          )
        )
      ) {
        continue;
      }

      distractors.push(other);
    }

    /*
      If a small study set does not provide three fully
      distinct distractors, preserve separation from the
      correct answer as the next priority.
    */
    if (distractors.length < 3) {

      for (const other of candidates) {

        if (distractors.length === 3) {
          break;
        }

        if (distractors.includes(other)) {
          continue;
        }

        if (
          meaningsAreTooSimilar(
            item.meaning,
            other.meaning
          )
        ) {
          continue;
        }

        distractors.push(other);
      }
    }

    /*
      Last-resort fill so a question can still have
      four choices in unusually small study sets.
    */
    if (distractors.length < 3) {

      for (const other of candidates) {

        if (distractors.length === 3) {
          break;
        }

        if (!distractors.includes(other)) {
          distractors.push(other);
        }
      }
    }

    return {
      item,
      correct: item.meaning,
      choices: shuffle([
        item.meaning,
        ...distractors.map(
          (other) => other.meaning
        )
      ])
    };
  });
}


function normalizeMeaning(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[;,.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


function meaningsAreTooSimilar(first, second) {

  const firstMeaning = normalizeMeaning(first);
  const secondMeaning = normalizeMeaning(second);

  if (firstMeaning === secondMeaning) {
    return true;
  }

  const ignoredWords = new Set([
    "a",
    "an",
    "the",
    "to",
    "of",
    "or",
    "and",
    "be",
    "being",
    "one",
    "who",
    "that",
    "with"
  ]);

  const getMeaningWords = (meaning) =>
    new Set(
      meaning
        .split(" ")
        .filter(
          (word) =>
            word &&
            !ignoredWords.has(word)
        )
    );

  const firstWords =
    getMeaningWords(firstMeaning);

  const secondWords =
    getMeaningWords(secondMeaning);

  return [...firstWords].some(
    (word) => secondWords.has(word)
  );
}


function createMorphemeQuestions(items) {
  return items.map((item) => {
    const itemMeaning = normalizeMeaning(item.meaning);

    const distractors = shuffle(
      uniqueBy(
        items.filter((other) =>
          other.id !== item.id &&
          normalizeMeaning(other.meaning) !== itemMeaning &&
          !meaningsAreTooSimilar(
            item.meaning,
            other.meaning
          )
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

  if (quizState.mode === "break") {
    renderBreakQuestion(question);
  }

  if (quizState.mode === "infer") {
    renderInferQuestion(question);
  }
}


function recordCoreProgressResponse(details) {
  window.FirstVoloActivityProgress?.recordResponse(details);
}

/* ========================================
   STUDENT ACCESS AUDIO
   ======================================== */

function fvAccessSpeak(text) {
  const audio =
    window.FirstVoloInstructionalAudio;

  if (
    audio?.available?.()
  ) {
    audio.speak(
      text,
      {
        gradeBand
      }
    );

    return;
  }

  speak(text);
}


function fvAccessMorphemeSpeech(label) {
  const normalized =
    normalizeMorphemeForMatch(
      label
    );

  const items = [
    ...prefixes,
    ...roots,
    ...suffixes,
    ...suffixVariants
  ];

  const item =
    items.find(
      candidate =>
        normalizeMorphemeForMatch(
          candidate.label
        ) === normalized
    );

  return (
    item?.speech ||
    item?.label ||
    label
  );
}


function fvAddChoiceSpeaker(
  answerButton,
  speechText,
  ariaLabel
) {
  if (
    answerButton.querySelector(
      ".fv-access-choice-speaker"
    )
  ) {
    return;
  }

  answerButton.classList.add(
    "fv-access-choice-parent"
  );

  const speaker =
    document.createElement(
      "span"
    );

  speaker.className =
    "fv-access-choice-speaker";

  speaker.setAttribute(
    "role",
    "button"
  );

  speaker.setAttribute(
    "tabindex",
    "0"
  );

  speaker.setAttribute(
    "aria-label",
    ariaLabel
  );

  speaker.addEventListener(
    "pointerdown",
    event => {
      event.preventDefault();
      event.stopPropagation();
    }
  );

  speaker.addEventListener(
    "click",
    event => {
      event.preventDefault();
      event.stopPropagation();

      fvAccessSpeak(
        speechText
      );
    }
  );

  speaker.addEventListener(
    "keydown",
    event => {
      if (
        event.key !== "Enter" &&
        event.key !== " "
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      fvAccessSpeak(
        speechText
      );
    }
  );

  answerButton.append(
    speaker
  );
}


function fvAddDisplaySpeaker(
  element,
  speechText,
  ariaLabel
) {
  const old =
    element.parentElement
      ?.querySelector(
        `.fv-access-display-speaker[data-for="${element.id}"]`
      );

  old?.remove();

  const button =
    document.createElement(
      "button"
    );

  button.type =
    "button";

  button.className =
    "fv-access-display-speaker";

  button.dataset.for =
    element.id;

  button.textContent =
    "🔊 Hear";

  button.setAttribute(
    "aria-label",
    ariaLabel
  );

  button.addEventListener(
    "click",
    event => {
      event.preventDefault();
      event.stopPropagation();

      fvAccessSpeak(
        speechText
      );
    }
  );

  element.insertAdjacentElement(
    "afterend",
    button
  );
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

    if (
      normalizeMorphemeForMatch(choice) !==
      "struct"
    ) {
      fvAddChoiceSpeaker(
        button,
        fvAccessMorphemeSpeech(
          choice
        ),
        `Hear ${choice}`
      );
    }

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

  recordCoreProgressResponse({
    skill: "find",
    correct: isCorrect,
    primaryTarget: question.target,
    primaryTargetId: question.itemId,
    targetType: question.type,
    word: question.word,
    itemId: question.itemId,
    response: choice,
    correctAnswer: question.answer
  });

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

  if (
    normalizeMorphemeForMatch(
      question.label
    ) !== "struct"
  ) {
    fvAddDisplaySpeaker(
      huntMorpheme,
      fvAccessMorphemeSpeech(
        question.label
      ),
      `Hear ${question.label}`
    );
  }

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

  recordCoreProgressResponse({
    skill: "hunt",
    correct: isPerfect,
    primaryTarget: question.label,
    primaryTargetId: question.itemId,
    targetType: question.type,
    response: [...selectedHuntWords].join(", "),
    correctAnswer: correctWords.join(", ")
  });

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

function speakStudentAccessText(text) {
  const audio =
    window.FirstVoloInstructionalAudio;

  if (
    audio?.available?.()
  ) {
    audio.speak(
      text,
      {
        gradeBand
      }
    );

    return;
  }

  /*
    Existing site speech remains the fallback
    if the shared instructional layer is unavailable.
  */
  speak(text);
}


function renderMeaningQuestion(question) {
  panels.meaning.hidden = false;

  workspaceTitle.textContent = "Meaning";

  const meaningType =
    question.item?.type === "prefix"
      ? "prefix"
      : question.item?.type === "root"
        ? "root"
        : question.item?.type === "suffix"
          ? "suffix"
          : "word part";

  workspaceSubtitle.textContent =
    `What does this ${meaningType} mean?`;

  meaningFeedback.hidden = true;
  meaningChoices.innerHTML = "";

  meaningMorpheme.textContent = question.item.label;
  styleMorphemeDisplay(meaningMorpheme, question.item.type);

  const spokenTarget =
    question.item.speech ||
    question.item.label;

  if (meaningQuestionAudioButton) {
    meaningQuestionAudioButton.hidden = false;

    meaningQuestionAudioButton.setAttribute(
      "aria-label",
      `Hear the question about ${question.item.label}`
    );

    meaningQuestionAudioButton.onclick = () => {
      speakStudentAccessText(
        `What does ${spokenTarget} mean?`
      );
    };
  }

  shuffle(question.choices).forEach((choice) => {
    const row =
      document.createElement("div");

    const button =
      document.createElement("button");

    const audioButton =
      document.createElement("button");

    row.className =
      "answer-audio-choice";

    button.type = "button";
    button.className = "answer-button";
    button.textContent = choice;
    button.dataset.choice = choice;

    button.addEventListener("click", () => {
      answerMeaningQuestion(
        button,
        choice,
        question
      );
    });

    audioButton.type = "button";
    audioButton.className =
      "choice-audio-button";

    audioButton.textContent =
      "🔊";

    audioButton.setAttribute(
      "aria-label",
      `Hear answer choice: ${choice}`
    );

    audioButton.title =
      `Hear: ${choice}`;

    audioButton.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        speakStudentAccessText(
          choice
        );
      }
    );

    row.append(
      button,
      audioButton
    );

    meaningChoices.append(
      row
    );
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

  recordCoreProgressResponse({
    skill: "meaning",
    correct: isCorrect,
    primaryTarget: question.item.label,
    primaryTargetId: question.item.id,
    targetType: question.item.type,
    itemId: question.item.id,
    response: choice,
    correctAnswer: question.correct
  });

  meaningChoices
    .querySelectorAll(".answer-button")
    .forEach((choiceButton) => {
      choiceButton.disabled = true;

      if (
        choiceButton.dataset.choice ===
        question.correct
      ) {
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

  fvAddDisplaySpeaker(
    morphemeMeaning,
    question.item.meaning,
    `Hear meaning: ${question.item.meaning}`
  );

  question.choices.forEach((choiceItem) => {
    const button = document.createElement("button");
    const typeClass = getTypeClass(choiceItem.type);

    button.type = "button";
    button.className =
      `morpheme-tile ${typeClass}-tile`;
    button.textContent = choiceItem.label;

    if (
      normalizeMorphemeForMatch(
        choiceItem.label
      ) !== "struct"
    ) {
      fvAddChoiceSpeaker(
        button,
        choiceItem.speech ||
          fvAccessMorphemeSpeech(
            choiceItem.label
          ),
        `Hear ${choiceItem.label}`
      );
    }

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

  recordCoreProgressResponse({
    skill: "morpheme",
    correct: isCorrect,
    primaryTarget: question.item.label,
    primaryTargetId: question.item.id,
    targetType: question.item.type,
    itemId: question.item.id,
    response: choiceItem.label,
    correctAnswer: question.item.label
  });

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
   BREAK IT APART
   ======================================== */

function renderBreakQuestion(question) {
  panels.break.hidden = false;

  workspaceTitle.textContent = "Break It Apart";
  workspaceSubtitle.textContent =
    "Split the whole word into its meaningful parts.";

  breakFeedback.hidden = true;
  breakChoices.innerHTML = "";

  breakWord.textContent = question.word;

  shuffle(question.choices).forEach((choice) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "answer-button";
    button.textContent = choice;

    button.addEventListener("click", () => {
      answerBreakQuestion(
        button,
        choice,
        question
      );
    });

    breakChoices.append(button);
  });
}

function answerBreakQuestion(
  button,
  choice,
  question
) {
  if (quizState.answered) {
    return;
  }

  quizState.answered = true;

  const isCorrect =
    choice === question.correct;

  if (isCorrect) {
    quizState.score += 1;
  }

  recordCoreProgressResponse({
    skill: "break",
    correct: isCorrect,
    primaryTarget: null,
    targetType: "word-structure",
    supportingTargets: question.segmentation.split("+").map((part) => part.trim()).filter(Boolean),
    supportingTargetIds:
      getCanonicalProgressMorphemeIdsFromSegmentation(
        question.segmentation
      ),
    word: question.word,
    response: choice,
    correctAnswer: question.correct
  });

  [...breakChoices.children].forEach(
    (choiceButton) => {
      choiceButton.disabled = true;

      if (
        choiceButton.textContent ===
        question.correct
      ) {
        choiceButton.classList.add("correct");
      }
    }
  );

  if (!isCorrect) {
    button.classList.add("incorrect");
  }

  breakFeedback.hidden = false;

  breakFeedback.className =
    `feedback-panel ${
      isCorrect
        ? "correct-feedback"
        : "incorrect-feedback"
    }`;

  const definitionHTML =
    question.definition
      ? [
          '<div class="feedback-label">',
          '  Meaning',
          '</div>',
          '',
          '<div class="feedback-value">',
          `  ${escapeHTML(question.definition)}`,
          '</div>'
        ].join("\n")
      : "";

  breakFeedback.innerHTML = `
    <div class="feedback-details">

      <h4 class="feedback-heading">
        ${isCorrect ? "Correct!" : "Not quite."}
      </h4>

      <div class="feedback-label">
        Correct breakdown
      </div>

      <div class="feedback-value">
        <strong>
          ${escapeHTML(question.segmentation)}
        </strong>
      </div>

      <div class="feedback-label">
        Whole word
      </div>

      <div class="feedback-value">
        ${escapeHTML(question.word)}
      </div>

      ${definitionHTML}

      <button
        class="audio-button"
        type="button"
      >
        🔊 Hear the explanation
      </button>

    </div>
  `;

  setAudioButton(
    breakFeedback,
    `${question.word} can be broken into ${question.segmentation.replaceAll("+", " plus ")}. ` +
    (
      question.definition
        ? `${question.word} means ${question.definition}.`
        : ""
    )
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
  `;
inferPrompt.textContent =
  "Based on the word part, what might this word mean?";

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

  recordCoreProgressResponse({
    skill: "infer",
    correct: isCorrect,
    primaryTarget: question.knownLabel,
    primaryTargetId:
      getCanonicalProgressMorphemeId(
        question.knownLabel,
        {
          type: question.type,
          meaning: question.knownMeaning
        }
      ),
    targetType: question.type,
    word: question.word,
    response: choice,
    correctAnswer: question.correct
  });

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
  let items = [];

  if (studyMode === "root-suffix") {
    items = rootSuffixBuildWords;
  } else if (
    studyMode === "prefix-root-suffix"
  ) {
    items = prefixRootSuffixBuildWords;
  } else {
    items = buildWords;
  }

  return filterWordsBySelectedFilters(items);
}


function syncBuildPatternButtons() {
  buildPatternButtons.forEach((button) => {
    const pattern = button.dataset.pattern;

    const isReady =
      pattern === "prefix-root" ||
      pattern === "root-suffix" ||
      pattern === "prefix-root-suffix";

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


let buildHadRetry = false;
let buildRoundRecorded = false;

function renderBuildActivity() {
  const existingBuildSession =
    window.FirstVoloActivityProgress?.getCurrentSession();

  if (existingBuildSession?.activity === "build") {
    window.FirstVoloActivityProgress.finishSession();
  }

  const activeBuildWords =
    getActiveBuildWords();

  if (
    (
      gradeBand !== "all" ||
      vocabLevel !== "all"
    ) &&
    activeBuildWords.length === 0
  ) {
    showStartMessage(
      `No Build Words match ${getActiveWordFilterLabel()} for this pattern yet.`,
      "Choose another practice flight, vocabulary level, or word-building pattern."
    );

    return;
  }

  panels.build.hidden = false;

  workspaceTitle.textContent = "Build Words";

  if (studyMode === "root-suffix") {
    workspaceSubtitle.textContent =
      "Combine a root or base with a suffix to create a real word.";
  } else if (
    studyMode === "prefix-root-suffix"
  ) {
    workspaceSubtitle.textContent =
      "Combine a prefix, root or base, and suffix to create a real word.";
  } else {
    workspaceSubtitle.textContent =
      "Combine a prefix and a root to create a real word.";
  }

  activityProgress.hidden = true;
  workspaceActions.hidden = true;

  syncBuildPatternButtons();

  window.FirstVoloActivityProgress?.startSession({
    activity: "build",
    studyMode,
    gradeBand,
    vocabLevel,
    totalItems: 0
  });

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

  buildHadRetry = false;
  buildRoundRecorded = false;

  buildFeedback.hidden = true;

  buildDirections.textContent =
    `Build the word that means: “${currentBuildTarget.definition}”`;

  if (studyMode === "root-suffix") {
    renderRootSuffixBuildBanks(
      activeBuildWords
    );
  } else if (
    studyMode === "prefix-root-suffix"
  ) {
    renderPrefixRootSuffixBuildBanks(
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


/* PREFIX + ROOT / BASE + SUFFIX */

function renderPrefixRootSuffixBuildBanks(
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

  renderBuildOptions(
    document.getElementById(
      "suffixBankOptions"
    ),
    suffixOptions,
    "suffix"
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
    if (studyMode === "root-suffix") {
      wordBuildingWorkspace.innerHTML = `
        <span class="empty-build-message">
          Select a root or base and a suffix.
        </span>
      `;
    } else if (
      studyMode === "prefix-root-suffix"
    ) {
      wordBuildingWorkspace.innerHTML = `
        <span class="empty-build-message">
          Select a prefix, a root or base, and a suffix.
        </span>
      `;
    } else {
      wordBuildingWorkspace.innerHTML = `
        <span class="empty-build-message">
          Select a prefix and a root.
        </span>
      `;
    }

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

  const isThreePart =
    studyMode === "prefix-root-suffix";

  const hasRequiredParts =
    isRootSuffix
      ? (
          selectedBuildParts.root &&
          selectedBuildParts.suffix
        )
      : isThreePart
        ? (
            selectedBuildParts.prefix &&
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

    if (isRootSuffix) {
      buildFeedback.innerHTML = `
        <h4 class="feedback-heading">
          Choose both word parts.
        </h4>

        <p>
          Select one root or base and one suffix
          before checking the word.
        </p>
      `;
    } else if (isThreePart) {
      buildFeedback.innerHTML = `
        <h4 class="feedback-heading">
          Choose all three word parts.
        </h4>

        <p>
          Select one prefix, one root or base,
          and one suffix before checking the word.
        </p>
      `;
    } else {
      buildFeedback.innerHTML = `
        <h4 class="feedback-heading">
          Choose both word parts.
        </h4>

        <p>
          Select one prefix and one root
          before checking the word.
        </p>
      `;
    }

    return;
  }

  let isCorrect = false;

  if (isRootSuffix) {
    isCorrect =
      selectedBuildParts.root.id ===
        currentBuildTarget.baseId &&
      selectedBuildParts.suffix.id ===
        currentBuildTarget.suffixId;
  } else if (isThreePart) {
    isCorrect =
      selectedBuildParts.prefix.id ===
        currentBuildTarget.prefixId &&
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
    buildHadRetry = true;

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

  if (!buildRoundRecorded) {
    const buildBase =
      currentBuildTarget.root ||
      currentBuildTarget.base;

    recordCoreProgressResponse({
      skill: "build",
      correct: !buildHadRetry,
      primaryTarget: null,
      targetType: "word-building",
      supportingTargets: [
        currentBuildTarget.prefix,
        buildBase,
        currentBuildTarget.suffix
      ].filter(Boolean),
      supportingTargetIds:
        getCanonicalProgressMorphemeIdsFromBuildItem(
          currentBuildTarget
        ),
      word: currentBuildTarget.word,
      response: buildHadRetry
        ? "Completed after retry"
        : "Completed on first check",
      correctAnswer: currentBuildTarget.word
    });

    buildRoundRecorded = true;
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
  } else if (isThreePart) {
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
        <strong>Prefix:</strong>
        ${escapeHTML(
          currentBuildTarget.prefix
        )}
        =
        ${escapeHTML(
          currentBuildTarget.prefixMeaning
        )}
      </p>

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
      `${currentBuildTarget.prefix} means ` +
      `${currentBuildTarget.prefixMeaning}. ` +
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

studyChoiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.disabled) {
      return;
    }

    const selectedMode =
      button.dataset.studyMode;

    studySelect.value = selectedMode;

    studyChoiceButtons.forEach((choice) => {
      const isActive =
        choice === button;

      choice.classList.toggle(
        "active",
        isActive
      );

      choice.setAttribute(
        "aria-pressed",
        String(isActive)
      );
    });

    studySelect.dispatchEvent(
      new Event("change")
    );
  });
});


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
    "Combined root or base and suffix practice is ready, including Build Words.",

  "prefix-root-suffix":
    "Combined prefix, root or base, and suffix practice is ready, including Build Words."
};
  studyAvailability.textContent =
    messages[studyMode] || "";

  renderCurrentActivity();
  updateCurrentPracticeSummary();
});

activityButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextMode = button.dataset.mode;

    if (
      activeMode === "build" &&
      nextMode !== "build"
    ) {
      window.FirstVoloActivityProgress?.finishSession();
    }

    activeMode = nextMode;

    activateActivityButton(activeMode);
    renderCurrentActivity();
  });
});

wordBuilderPathTrack?.addEventListener(
  "click",
  (event) => {
    const pathButton =
      event.target.closest("[data-path-mode]");

    if (!pathButton) {
      return;
    }

    const mode =
      pathButton.dataset.pathMode;

    const activityButton =
      activityButtons.find(
        (button) =>
          button.dataset.mode === mode
      );

    activityButton?.click();
  }
);

window.addEventListener(
  "firstvoloprogresschange",
  renderWordBuilderPath
);

renderWordBuilderPath();
updateFlightDependentControls();


learnExploreButton?.addEventListener("click", () => {
  learnMode = "explore";
  renderLearnActivity();
});

learnSortButton?.addEventListener("click", () => {
  learnMode = "sort";
  renderLearnActivity();
});

gradeBandSelect.addEventListener("change", () => {
  gradeBand = gradeBandSelect.value;

  updateFlightDependentControls();
  renderCurrentActivity();
  updateCurrentPracticeSummary();
});

vocabLevelSelect.addEventListener("change", () => {
  vocabLevel = vocabLevelSelect.value;

  renderCurrentActivity();
  updateCurrentPracticeSummary();
});


nextQuestionButton.addEventListener("click", () => {
  if (activeMode === "use") {
    goToNextUseItQuestion();
    return;
  }

  if (activeMode === "change") {
    goToNextChangeItQuestion();
    return;
  }

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

if (
  window.location.hash === "#about" &&
  aboutModal &&
  aboutClose
) {
  aboutModal.hidden = false;
  aboutClose.focus();
}

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

function getAboutFocusableElements() {
  return [
    ...aboutModal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), ' +
      '[tabindex]:not([tabindex="-1"])'
    )
  ].filter(
    (element) =>
      element.getClientRects().length > 0 &&
      element.getAttribute("aria-hidden") !== "true"
  );
}

document.addEventListener("keydown", (event) => {
  if (aboutModal.hidden) {
    return;
  }

  if (event.key === "Escape") {
    aboutModal.hidden = true;
    aboutButton.focus();
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusableElements =
    getAboutFocusableElements();

  if (!focusableElements.length) {
    event.preventDefault();
    aboutClose.focus();
    return;
  }

  const firstFocusable =
    focusableElements[0];

  const lastFocusable =
    focusableElements[
      focusableElements.length - 1
    ];

  if (!aboutModal.contains(document.activeElement)) {
    event.preventDefault();
    firstFocusable.focus();
    return;
  }

  if (
    event.shiftKey &&
    document.activeElement === firstFocusable
  ) {
    event.preventDefault();
    lastFocusable.focus();
    return;
  }

  if (
    !event.shiftKey &&
    document.activeElement === lastFocusable
  ) {
    event.preventDefault();
    firstFocusable.focus();
  }
});


/* ========================================
   INITIALIZE
   ======================================== */

prepareUnavailableOptions();
activateActivityButton("learn");

showStartMessage(
  "Choose what you want to study.",
  "Choose prefixes, roots, suffixes, or a word-building combination above, then select an activity."
);
