"use strict";

(function initializeFirstVoloInstructionalProtection() {
  const registry = {
  "version": "instructional-protection-v3-lexical-family-freshness",
  "formalPrePost": [
    "abduct",
    "assistance",
    "assistant",
    "audible",
    "careless",
    "chronology",
    "construction",
    "disagree",
    "disrupt",
    "eject",
    "ejectable",
    "emit",
    "exportable",
    "helpful",
    "helpless",
    "hopeful",
    "hopeless",
    "import",
    "imported",
    "importer",
    "impossible",
    "inactive",
    "inaudible",
    "inspect",
    "inspected",
    "inspection",
    "inspector",
    "interrupt",
    "interruption",
    "miscount",
    "mislabel",
    "preheat",
    "preview",
    "prewash",
    "produce",
    "propelled",
    "reconstruct",
    "reheat",
    "reposition",
    "reread",
    "retractable",
    "retrospective",
    "review",
    "spectator",
    "teacher",
    "transmit",
    "transport",
    "transportable",
    "unhappy"
  ],
  "migrationChallenge": [
    "abnormal",
    "acceptance",
    "biology",
    "classify",
    "credence",
    "dependent",
    "detract",
    "evaluate",
    "export",
    "fearless",
    "intervene",
    "kindness",
    "manuscript",
    "midpoint",
    "misplace",
    "modernize",
    "overcook",
    "poetic",
    "portable",
    "pregame",
    "dejection",
    "readable",
    "rebuild",
    "retroactive",
    "semicircle",
    "speechless",
    "subsequent",
    "thermometer",
    "unfair",
    "visible"
  ],
  "connectedTextTransfer": [
    "abscond",
    "absorbent",
    "abstain",
    "counteract",
    "adjustable",
    "adjustment",
    "advent",
    "antiviral",
    "antiwar",
    "approach",
    "aquatic",
    "aqueduct",
    "arthroscope",
    "attach",
    "audition",
    "auditory",
    "autoimmune",
    "autopilot",
    "avoidance",
    "barometer",
    "bibliometrics",
    "bibliotherapy",
    "bioluminescent",
    "biosphere",
    "brighter",
    "brightest",
    "brightness",
    "cautiously",
    "chronograph",
    "chronometer",
    "circumpolar",
    "circumstellar",
    "coherence",
    "colorful",
    "compress",
    "computable",
    "convene",
    "converge",
    "converted",
    "cookbook",
    "cookware",
    "credential",
    "credulous",
    "criminology",
    "deconstruct",
    "deformable",
    "dehydrate",
    "deposition",
    "dermatitis",
    "dermatological",
    "deice",
    "dictate",
    "dictation",
    "digitize",
    "disassemble",
    "disruptive",
    "distrust",
    "diverting",
    "drifting",
    "ductwork",
    "electrify",
    "embolden",
    "emergence",
    "emission",
    "enactment",
    "encase",
    "endoscope",
    "evaporation",
    "excavator",
    "exhale",
    "expansion",
    "expel",
    "flexibility",
    "forewarn",
    "foreword",
    "formative",
    "geocentric",
    "geologist",
    "geosphere",
    "glaciers",
    "glimmered",
    "hazardous",
    "impatient",
    "implant",
    "incomplete",
    "inject",
    "injector",
    "inscription",
    "interconnect",
    "intermix",
    "invocation",
    "juxtaposition",
    "lanterns",
    "locomotive",
    "measurement",
    "meteorology",
    "microclimate",
    "microplastic",
    "midair",
    "midsummer",
    "miscalculate",
    "mispronounce",
    "motility",
    "motionless",
    "narrower",
    "narrowest",
    "nonrenewable",
    "nonslip",
    "observant",
    "odometer",
    "odorless",
    "orbital",
    "overfill",
    "overwater",
    "pendulous",
    "persuasive",
    "phonetic",
    "phonology",
    "photographic",
    "porous",
    "portability",
    "portage",
    "prepack",
    "prewrite",
    "proceeding",
    "projectile",
    "propeller",
    "protective",
    "protrude",
    "readiness",
    "recheck",
    "recomputation",
    "reliance",
    "repaint",
    "repellent",
    "resourceful",
    "retentive",
    "retraction",
    "retrograde",
    "retroreflective",
    "ruptured",
    "seismograph",
    "semiconscious",
    "semitransparent",
    "sequel",
    "sequential",
    "shimmering",
    "solidify",
    "spectacle",
    "spectate",
    "stability",
    "steadily",
    "sterilize",
    "structural",
    "subfloor",
    "subzero",
    "superheat",
    "superimpose",
    "suspension",
    "teleconference",
    "telemetry",
    "tenacity",
    "terrarium",
    "terrestrial",
    "thermodynamic",
    "thermoregulation",
    "tidal",
    "traction",
    "transcontinental",
    "transcription",
    "transferable",
    "transferral",
    "translator",
    "transmitter",
    "transpacific",
    "underfill",
    "underpay",
    "unfasten",
    "untangle",
    "equivalent",
    "valuation",
    "viewfinder",
    "viewpoint",
    "violinist",
    "visibility",
    "visualization",
    "vocation",
    "volcanic",
    "washable",
    "whispered"
  ],
  "principle": "Formal assessment targets, Migration Challenge words, Session Guide Check Transfer words, and lexical-family instructional blocks remain separate from ordinary instructional materials.",
  "instructionalLexicalFamilyBlocks": [
    "retrospect"
  ]
};

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[‐‑‒–—−]/g, "-");
  }

  function protectionReason(word) {
    const wanted =
      normalize(word);

    if (!wanted) {
      return null;
    }

    if (
      registry.formalPrePost
        .includes(wanted)
    ) {
      return "formal-pre-post";
    }

    if (
      registry.migrationChallenge
        .includes(wanted)
    ) {
      return "migration-challenge";
    }

    if (
      registry.connectedTextTransfer
        .includes(wanted)
    ) {
      return "check-transfer";
    }

    if (
      registry.instructionalLexicalFamilyBlocks
        .includes(wanted)
    ) {
      return "lexical-family-instruction-block";
    }

    return null;
  }

  function isProtected(word) {
    return Boolean(
      protectionReason(word)
    );
  }

  function allProtectedWords() {
    return [
      ...new Set([
        ...registry.formalPrePost,
        ...registry.migrationChallenge,
        ...registry.connectedTextTransfer,
        ...registry.instructionalLexicalFamilyBlocks
      ])
    ];
  }

  registry.normalize =
    normalize;

  registry.protectionReason =
    protectionReason;

  registry.isProtected =
    isProtected;

  registry.allProtectedWords =
    allProtectedWords;

  window.FirstVoloInstructionalProtection =
    registry;
})();
