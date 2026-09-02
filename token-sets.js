"use strict";

/*
  First Volo Morphology — Volo Token Sets

  Token sets group the existing canonical morpheme IDs.
  They do NOT replace introBand or other curriculum metadata.
*/

const FIRST_VOLO_TOKEN_SETS = [

  /* ========================================
     FOUNDATION
     Morphemes introduced in Grades 2–3
     ======================================== */

  {
    id: "foundation-core-word-parts",
    collection: "Foundation",
    label: "Foundation I · Core Word Parts",
    introBand: "2-3",
    type: "mixed",
    morphemeTypes: ["prefix", "suffix"],
    morphemeIds: [
      "un-negation",
      "re",
      "s-es",
      "ed",
      "ing",
      "er-more",
      "est"
    ]
  },

  {
    id: "foundation-common-meaning-changes",
    collection: "Foundation",
    label: "Foundation II · Common Meaning Changes",
    introBand: "2-3",
    type: "mixed",
    morphemeTypes: ["prefix", "suffix"],
    morphemeIds: [
      "er-or",
      "un-reversative",
      "dis",
      "pre",
      "mis",
      "ful",
      "less"
    ]
  },

  {
    id: "foundation-expanding-system",
    collection: "Foundation",
    label: "Foundation III · Expanding the System",
    introBand: "2-3",
    type: "mixed",
    morphemeTypes: ["prefix", "suffix"],
    morphemeIds: [
      "non",
      "over",
      "sub",
      "mid",
      "under",
      "ly-adverb",
      "ness"
    ]
  },

  {
    id: "foundation-grade3-bridge",
    collection: "Foundation",
    label: "Foundation IV · Grade 3 Bridge",
    introBand: "2-3",
    type: "mixed",
    morphemeTypes: ["prefix", "suffix"],
    morphemeIds: [
      "en-em",
      "fore",
      "able-ible",
      "ion",
      "ment"
    ],
    pendingMorphemeIds: [
      "ly-adjective"
    ]
  },


  /* ========================================
     EXPANSION
     Morphemes introduced in Grades 4–5
     ======================================== */

  {
    id: "expansion-prefixes-1",
    collection: "Expansion",
    label: "Expansion Prefixes I",
    introBand: "4-5",
    type: "prefix",
    morphemeIds: [
      "negative-in-family",
      "location-in-family",
      "inter",
      "trans",
      "con-com",
      "e-ex"
    ]
  },

  {
    id: "expansion-prefixes-2",
    collection: "Expansion",
    label: "Expansion Prefixes II",
    introBand: "4-5",
    type: "prefix",
    morphemeIds: [
      "de",
      "super",
      "semi",
      "anti",
      "pro",
      "circum"
    ]
  },

  {
    id: "expansion-roots-1",
    collection: "Expansion",
    label: "Expansion Roots I",
    introBand: "4-5",
    type: "root",
    morphemeIds: [
      "port",
      "dict",
      "scrib",
      "spect",
      "vis",
      "graph",
      "phon"
    ]
  },

  {
    id: "expansion-roots-2",
    collection: "Expansion",
    label: "Expansion Roots II",
    introBand: "4-5",
    type: "root",
    morphemeIds: [
      "bio",
      "geo",
      "tele",
      "micro",
      "therm",
      "metr",
      "scop"
    ]
  },

  {
    id: "expansion-roots-3",
    collection: "Expansion",
    label: "Expansion Roots III",
    introBand: "4-5",
    type: "root",
    morphemeIds: [
      "rupt",
      "struct",
      "act",
      "form",
      "mot",
      "auto"
    ]
  },

  {
    id: "expansion-suffixes-1",
    collection: "Expansion",
    label: "Expansion Suffixes I",
    introBand: "4-5",
    type: "suffix",
    morphemeIds: [
      "al",
      "ic",
      "ous",
      "ive",
      "ity"
    ]
  },

  {
    id: "expansion-suffixes-2",
    collection: "Expansion",
    label: "Expansion Suffixes II",
    introBand: "4-5",
    type: "suffix",
    morphemeIds: [
      "ist",
      "ize",
      "ify",
      "ology"
    ]
  },


  /* ========================================
     ADVANCED
     Morphemes introduced in Grades 6–8
     ======================================== */

  {
    id: "advanced-prefixes",
    collection: "Advanced",
    label: "Advanced Prefixes",
    introBand: "6-8",
    type: "prefix",
    evidenceProfiles: {
      "a-ad": "limited-application"
    },
    morphemeIds: [
      "ab",
      "a-ad",
      "retro"
    ]
  },

  {
    id: "advanced-roots-1",
    collection: "Advanced",
    label: "Advanced Roots I",
    introBand: "6-8",
    type: "root",
    morphemeIds: [
      "duct",
      "ject",
      "mit",
      "fer",
      "tract",
      "sequ",
      "vert"
    ]
  },

  {
    id: "advanced-roots-2",
    collection: "Advanced",
    label: "Advanced Roots II",
    introBand: "6-8",
    type: "root",
    morphemeIds: [
      "pel",
      "pend",
      "pos",
      "ten",
      "voc",
      "aud",
      "cred"
    ]
  },

  {
    id: "advanced-roots-3",
    collection: "Advanced",
    label: "Advanced Roots III",
    introBand: "6-8",
    type: "root",
    evidenceProfiles: {
      put: "recognition-only"
    },
    morphemeIds: [
      "chron",
      "put",
      "val",
      "ven",
      "biblio",
      "derm",
      "terr"
    ]
  },

  {
    id: "advanced-suffixes",
    collection: "Advanced",
    label: "Advanced Suffixes",
    introBand: "6-8",
    type: "suffix",
    morphemeIds: [
      "ance",
      "ence",
      "ant-ent-agent",
      "ant-ent-adjective"
    ]
  }
];

if (typeof window !== "undefined") {
  window.FIRST_VOLO_TOKEN_SETS =
    FIRST_VOLO_TOKEN_SETS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = FIRST_VOLO_TOKEN_SETS;
}
