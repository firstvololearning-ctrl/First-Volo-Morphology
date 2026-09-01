"use strict";

/*
  First Volo Morphology — Canonical Waypoint Registry

  This file is the approved source of truth for Waypoint eligibility and
  placement. It does not render Waypoints or change migration-map behavior.

  Eligibility rules:
    - requiredMorphemeIds are introduced in the Waypoint's current Flight.
    - assumedPriorMorphemeIds were introduced in an earlier Flight.
    - lexical bases used only as anchors (for example, write or soil) are
      represented in components but do not gate a Flight token.
    - earliestEligibleStop is derived from the last required current-Flight
      token set.
    - displayStop may intentionally be later for pacing, but never earlier.
*/

const FIRST_VOLO_WAYPOINT_REGISTRY_VERSION = "2026-09-01-v1";

const FIRST_VOLO_WAYPOINT_FLIGHTS = Object.freeze({
  A: Object.freeze({
    gradeBand: "2-3",
    collection: "Foundation",
    expectedWaypointCount: 11,
    expectedSetIds: Object.freeze([
      "foundation-prefixes-1",
      "foundation-prefixes-2",
      "foundation-suffixes-1",
      "foundation-suffixes-2"
    ]),
    expectedInstructionalStopIds: Object.freeze([
      "meadow",
      "forest",
      "village",
      "coast"
    ])
  }),

  B: Object.freeze({
    gradeBand: "4-5",
    collection: "Expansion",
    expectedWaypointCount: 9,
    expectedSetIds: Object.freeze([
      "expansion-prefixes-1",
      "expansion-prefixes-2",
      "expansion-roots-1",
      "expansion-roots-2",
      "expansion-roots-3",
      "expansion-suffixes-1",
      "expansion-suffixes-2"
    ]),
    expectedInstructionalStopIds: Object.freeze([
      "meadow",
      "river",
      "forest",
      "mountains",
      "pond",
      "village",
      "coast"
    ])
  }),

  C: Object.freeze({
    gradeBand: "6-8",
    collection: "Advanced",
    expectedWaypointCount: 13,
    expectedSetIds: Object.freeze([
      "advanced-prefixes",
      "advanced-roots-1",
      "advanced-roots-2",
      "advanced-roots-3",
      "advanced-suffixes"
    ]),
    expectedInstructionalStopIds: Object.freeze([
      "meadow",
      "forest",
      "mountains",
      "village",
      "coast"
    ])
  })
});

function waypoint({
  word,
  flight,
  components,
  componentMorphemeIds,
  requiredMorphemeIds,
  assumedPriorMorphemeIds = [],
  requiredSetIds,
  earliestEligibleStop,
  displayStop,
  pdfPath
}) {
  return Object.freeze({
    id: `${flight.toLowerCase()}-${word.toLowerCase()}`,
    word,
    flight,
    components: Object.freeze(components),
    componentMorphemeIds: Object.freeze(componentMorphemeIds),
    requiredMorphemeIds: Object.freeze(requiredMorphemeIds),
    assumedPriorMorphemeIds: Object.freeze(assumedPriorMorphemeIds),
    requiredSetIds: Object.freeze(requiredSetIds),
    earliestEligibleStop,
    displayStop,
    delayedForPacing: earliestEligibleStop !== displayStop,
    pdfPath
  });
}

const FIRST_VOLO_WAYPOINTS = Object.freeze([
  // Flight A — Grades 2–3
  waypoint({
    word: "NONFICTION",
    flight: "A",
    components: ["non-", "fiction"],
    componentMorphemeIds: ["non"],
    requiredMorphemeIds: ["non"],
    requiredSetIds: ["foundation-prefixes-1"],
    earliestEligibleStop: "meadow",
    displayStop: "meadow",
    pdfPath: "waypoints/flight-a/pdfs/Flight-A-Waypoint-NONFICTION.pdf"
  }),
  waypoint({
    word: "SUBSOIL",
    flight: "A",
    components: ["sub-", "soil"],
    componentMorphemeIds: ["sub"],
    requiredMorphemeIds: ["sub"],
    requiredSetIds: ["foundation-prefixes-2"],
    earliestEligibleStop: "forest",
    displayStop: "forest",
    pdfPath: "waypoints/flight-a/pdfs/Flight-A-Waypoint-SUBSOIL.pdf"
  }),
  waypoint({
    word: "REWRITING",
    flight: "A",
    components: ["re-", "write", "-ing"],
    componentMorphemeIds: ["re", "ing"],
    requiredMorphemeIds: ["re", "ing"],
    requiredSetIds: ["foundation-prefixes-1", "foundation-suffixes-1"],
    earliestEligibleStop: "village",
    displayStop: "village",
    pdfPath: "waypoints/flight-a/pdfs/Flight-A-Waypoint-REWRITING.pdf"
  }),
  waypoint({
    word: "PREVIEWS",
    flight: "A",
    components: ["pre-", "view", "-s"],
    componentMorphemeIds: ["pre", "s-es"],
    requiredMorphemeIds: ["pre", "s-es"],
    requiredSetIds: ["foundation-prefixes-1", "foundation-suffixes-1"],
    earliestEligibleStop: "village",
    displayStop: "village",
    pdfPath: "waypoints/flight-a/pdfs/Flight-A-Waypoint-PREVIEWS.pdf"
  }),
  waypoint({
    word: "OVERUSED",
    flight: "A",
    components: ["over-", "use", "-ed"],
    componentMorphemeIds: ["over", "ed"],
    requiredMorphemeIds: ["over", "ed"],
    requiredSetIds: ["foundation-prefixes-2", "foundation-suffixes-1"],
    earliestEligibleStop: "village",
    displayStop: "village",
    pdfPath: "waypoints/flight-a/pdfs/Flight-A-Waypoint-OVERUSED.pdf"
  }),
  waypoint({
    word: "MISLEADING",
    flight: "A",
    components: ["mis-", "lead", "-ing"],
    componentMorphemeIds: ["mis", "ing"],
    requiredMorphemeIds: ["mis", "ing"],
    requiredSetIds: ["foundation-prefixes-1", "foundation-suffixes-1"],
    earliestEligibleStop: "village",
    displayStop: "village",
    pdfPath: "waypoints/flight-a/pdfs/Flight-A-Waypoint-MISLEADING.pdf"
  }),
  waypoint({
    word: "DISCONNECTION",
    flight: "A",
    components: ["dis-", "connect", "-ion"],
    componentMorphemeIds: ["dis", "ion"],
    requiredMorphemeIds: ["dis", "ion"],
    requiredSetIds: ["foundation-prefixes-1", "foundation-suffixes-2"],
    earliestEligibleStop: "coast",
    displayStop: "coast",
    pdfPath: "waypoints/flight-a/pdfs/Flight-A-Waypoint-DISCONNECTION.pdf"
  }),
  waypoint({
    word: "EMPOWERMENT",
    flight: "A",
    components: ["em-", "power", "-ment"],
    componentMorphemeIds: ["en-em", "ment"],
    requiredMorphemeIds: ["en-em", "ment"],
    requiredSetIds: ["foundation-prefixes-2", "foundation-suffixes-2"],
    earliestEligibleStop: "coast",
    displayStop: "coast",
    pdfPath: "waypoints/flight-a/pdfs/Flight-A-Waypoint-EMPOWERMENT.pdf"
  }),
  waypoint({
    word: "UNEVENNESS",
    flight: "A",
    components: ["un-", "even", "-ness"],
    componentMorphemeIds: ["un-negation", "ness"],
    requiredMorphemeIds: ["un-negation", "ness"],
    requiredSetIds: ["foundation-prefixes-1", "foundation-suffixes-2"],
    earliestEligibleStop: "coast",
    displayStop: "coast",
    pdfPath: "waypoints/flight-a/pdfs/Flight-A-Waypoint-UNEVENNESS.pdf"
  }),
  waypoint({
    word: "COUNTABLE",
    flight: "A",
    components: ["count", "-able"],
    componentMorphemeIds: ["able-ible"],
    requiredMorphemeIds: ["able-ible"],
    requiredSetIds: ["foundation-suffixes-2"],
    earliestEligibleStop: "coast",
    displayStop: "coast",
    pdfPath: "waypoints/flight-a/pdfs/Flight-A-Waypoint-COUNTABLE.pdf"
  }),
  waypoint({
    word: "SUCCESSFULLY",
    flight: "A",
    components: ["success", "-ful", "-ly"],
    componentMorphemeIds: ["ful", "ly-adverb"],
    requiredMorphemeIds: ["ful", "ly-adverb"],
    requiredSetIds: ["foundation-suffixes-1", "foundation-suffixes-2"],
    earliestEligibleStop: "coast",
    displayStop: "coast",
    pdfPath: "waypoints/flight-a/pdfs/Flight-A-Waypoint-SUCCESSFULLY.pdf"
  }),

  // Flight B — Grades 4–5
  waypoint({
    word: "DESCRIPTION",
    flight: "B",
    components: ["de-", "scrib/script", "-ion"],
    componentMorphemeIds: ["de", "scrib", "ion"],
    requiredMorphemeIds: ["de", "scrib"],
    assumedPriorMorphemeIds: ["ion"],
    requiredSetIds: ["expansion-prefixes-2", "expansion-roots-1"],
    earliestEligibleStop: "forest",
    displayStop: "forest",
    pdfPath: "waypoints/flight-b/pdfs/Flight-B-Waypoint-DESCRIPTION.pdf"
  }),
  waypoint({
    word: "ERUPTION",
    flight: "B",
    components: ["e-/ex-", "rupt", "-ion"],
    componentMorphemeIds: ["e-ex", "rupt", "ion"],
    requiredMorphemeIds: ["e-ex", "rupt"],
    assumedPriorMorphemeIds: ["ion"],
    requiredSetIds: ["expansion-prefixes-1", "expansion-roots-3"],
    earliestEligibleStop: "pond",
    displayStop: "pond",
    pdfPath: "waypoints/flight-b/pdfs/Flight-B-Waypoint-ERUPTION.pdf"
  }),
  waypoint({
    word: "INTERACTION",
    flight: "B",
    components: ["inter-", "act", "-ion"],
    componentMorphemeIds: ["inter", "act", "ion"],
    requiredMorphemeIds: ["inter", "act"],
    assumedPriorMorphemeIds: ["ion"],
    requiredSetIds: ["expansion-prefixes-1", "expansion-roots-3"],
    earliestEligibleStop: "pond",
    displayStop: "pond",
    pdfPath: "waypoints/flight-b/pdfs/Flight-B-Waypoint-INTERACTION.pdf"
  }),
  waypoint({
    word: "CONFORMITY",
    flight: "B",
    components: ["con-", "form", "-ity"],
    componentMorphemeIds: ["con-com", "form", "ity"],
    requiredMorphemeIds: ["con-com", "form", "ity"],
    requiredSetIds: ["expansion-prefixes-1", "expansion-roots-3", "expansion-suffixes-1"],
    earliestEligibleStop: "village",
    displayStop: "village",
    pdfPath: "waypoints/flight-b/pdfs/Flight-B-Waypoint-CONFORMITY.pdf"
  }),
  waypoint({
    word: "GEOGRAPHIC",
    flight: "B",
    components: ["geo", "graph", "-ic"],
    componentMorphemeIds: ["geo", "graph", "ic"],
    requiredMorphemeIds: ["geo", "graph", "ic"],
    requiredSetIds: ["expansion-roots-1", "expansion-roots-2", "expansion-suffixes-1"],
    earliestEligibleStop: "village",
    displayStop: "village",
    pdfPath: "waypoints/flight-b/pdfs/Flight-B-Waypoint-GEOGRAPHIC.pdf"
  }),
  waypoint({
    word: "THERMAL",
    flight: "B",
    components: ["therm", "-al"],
    componentMorphemeIds: ["therm", "al"],
    requiredMorphemeIds: ["therm", "al"],
    requiredSetIds: ["expansion-roots-2", "expansion-suffixes-1"],
    earliestEligibleStop: "village",
    displayStop: "village",
    pdfPath: "waypoints/flight-b/pdfs/Flight-B-Waypoint-THERMAL.pdf"
  }),
  waypoint({
    word: "MICROSCOPIC",
    flight: "B",
    components: ["micro", "scop", "-ic"],
    componentMorphemeIds: ["micro", "scop", "ic"],
    requiredMorphemeIds: ["micro", "scop", "ic"],
    requiredSetIds: ["expansion-roots-2", "expansion-suffixes-1"],
    earliestEligibleStop: "village",
    displayStop: "coast",
    pdfPath: "waypoints/flight-b/pdfs/Flight-B-Waypoint-MICROSCOPIC.pdf"
  }),
  waypoint({
    word: "PREDICTIVE",
    flight: "B",
    components: ["pre-", "dict", "-ive"],
    componentMorphemeIds: ["pre", "dict", "ive"],
    requiredMorphemeIds: ["dict", "ive"],
    assumedPriorMorphemeIds: ["pre"],
    requiredSetIds: ["expansion-roots-1", "expansion-suffixes-1"],
    earliestEligibleStop: "village",
    displayStop: "coast",
    pdfPath: "waypoints/flight-b/pdfs/Flight-B-Waypoint-PREDICTIVE.pdf"
  }),
  waypoint({
    word: "PROSPECTIVE",
    flight: "B",
    components: ["pro-", "spect", "-ive"],
    componentMorphemeIds: ["pro", "spect", "ive"],
    requiredMorphemeIds: ["pro", "spect", "ive"],
    requiredSetIds: ["expansion-prefixes-2", "expansion-roots-1", "expansion-suffixes-1"],
    earliestEligibleStop: "village",
    displayStop: "coast",
    pdfPath: "waypoints/flight-b/pdfs/Flight-B-Waypoint-PROSPECTIVE.pdf"
  }),

  // Flight C — Grades 6–8
  waypoint({
    word: "DEDUCTION",
    flight: "C",
    components: ["de-", "duct/duce", "-ion"],
    componentMorphemeIds: ["de", "duct", "ion"],
    requiredMorphemeIds: ["duct"],
    assumedPriorMorphemeIds: ["de", "ion"],
    requiredSetIds: ["advanced-roots-1"],
    earliestEligibleStop: "forest",
    displayStop: "forest",
    pdfPath: "waypoints/flight-c/pdfs/Flight-C-Waypoint-DEDUCTION.pdf"
  }),
  waypoint({
    word: "DISTRACTION",
    flight: "C",
    components: ["dis-", "tract", "-ion"],
    componentMorphemeIds: ["dis", "tract", "ion"],
    requiredMorphemeIds: ["tract"],
    assumedPriorMorphemeIds: ["dis", "ion"],
    requiredSetIds: ["advanced-roots-1"],
    earliestEligibleStop: "forest",
    displayStop: "forest",
    pdfPath: "waypoints/flight-c/pdfs/Flight-C-Waypoint-DISTRACTION.pdf"
  }),
  waypoint({
    word: "INVERSION",
    flight: "C",
    components: ["in-", "vert/vers", "-ion"],
    componentMorphemeIds: ["location-in-family", "vert", "ion"],
    requiredMorphemeIds: ["vert"],
    assumedPriorMorphemeIds: ["location-in-family", "ion"],
    requiredSetIds: ["advanced-roots-1"],
    earliestEligibleStop: "forest",
    displayStop: "forest",
    pdfPath: "waypoints/flight-c/pdfs/Flight-C-Waypoint-INVERSION.pdf"
  }),
  waypoint({
    word: "INTERJECTION",
    flight: "C",
    components: ["inter-", "ject", "-ion"],
    componentMorphemeIds: ["inter", "ject", "ion"],
    requiredMorphemeIds: ["ject"],
    assumedPriorMorphemeIds: ["inter", "ion"],
    requiredSetIds: ["advanced-roots-1"],
    earliestEligibleStop: "forest",
    displayStop: "village",
    pdfPath: "waypoints/flight-c/pdfs/Flight-C-Waypoint-INTERJECTION.pdf"
  }),
  waypoint({
    word: "SUBMISSION",
    flight: "C",
    components: ["sub-", "mit/miss", "-ion"],
    componentMorphemeIds: ["sub", "mit", "ion"],
    requiredMorphemeIds: ["mit"],
    assumedPriorMorphemeIds: ["sub", "ion"],
    requiredSetIds: ["advanced-roots-1"],
    earliestEligibleStop: "forest",
    displayStop: "village",
    pdfPath: "waypoints/flight-c/pdfs/Flight-C-Waypoint-SUBMISSION.pdf"
  }),
  waypoint({
    word: "INCREDIBLE",
    flight: "C",
    components: ["in-", "cred", "-ible"],
    componentMorphemeIds: ["negative-in-family", "cred", "able-ible"],
    requiredMorphemeIds: ["cred"],
    assumedPriorMorphemeIds: ["negative-in-family", "able-ible"],
    requiredSetIds: ["advanced-roots-2"],
    earliestEligibleStop: "mountains",
    displayStop: "mountains",
    pdfPath: "waypoints/flight-c/pdfs/Flight-C-Waypoint-INCREDIBLE.pdf"
  }),
  waypoint({
    word: "TENABLE",
    flight: "C",
    components: ["ten", "-able"],
    componentMorphemeIds: ["ten", "able-ible"],
    requiredMorphemeIds: ["ten"],
    assumedPriorMorphemeIds: ["able-ible"],
    requiredSetIds: ["advanced-roots-2"],
    earliestEligibleStop: "mountains",
    displayStop: "mountains",
    pdfPath: "waypoints/flight-c/pdfs/Flight-C-Waypoint-TENABLE.pdf"
  }),
  waypoint({
    word: "VOCALIZE",
    flight: "C",
    components: ["voc", "-al", "-ize"],
    componentMorphemeIds: ["voc", "al", "ize"],
    requiredMorphemeIds: ["voc"],
    assumedPriorMorphemeIds: ["al", "ize"],
    requiredSetIds: ["advanced-roots-2"],
    earliestEligibleStop: "mountains",
    displayStop: "mountains",
    pdfPath: "waypoints/flight-c/pdfs/Flight-C-Waypoint-VOCALIZE.pdf"
  }),
  waypoint({
    word: "INTERVENTION",
    flight: "C",
    components: ["inter-", "ven/vent", "-ion"],
    componentMorphemeIds: ["inter", "ven", "ion"],
    requiredMorphemeIds: ["ven"],
    assumedPriorMorphemeIds: ["inter", "ion"],
    requiredSetIds: ["advanced-roots-3"],
    earliestEligibleStop: "village",
    displayStop: "village",
    pdfPath: "waypoints/flight-c/pdfs/Flight-C-Waypoint-INTERVENTION.pdf"
  }),
  waypoint({
    word: "SEQUENCE",
    flight: "C",
    components: ["sequ", "-ence"],
    componentMorphemeIds: ["sequ", "ence"],
    requiredMorphemeIds: ["sequ", "ence"],
    requiredSetIds: ["advanced-roots-1", "advanced-suffixes"],
    earliestEligibleStop: "coast",
    displayStop: "coast",
    pdfPath: "waypoints/flight-c/pdfs/Flight-C-Waypoint-SEQUENCE.pdf"
  }),
  waypoint({
    word: "REFERENCE",
    flight: "C",
    components: ["re-", "fer", "-ence"],
    componentMorphemeIds: ["re", "fer", "ence"],
    requiredMorphemeIds: ["fer", "ence"],
    assumedPriorMorphemeIds: ["re"],
    requiredSetIds: ["advanced-roots-1", "advanced-suffixes"],
    earliestEligibleStop: "coast",
    displayStop: "coast",
    pdfPath: "waypoints/flight-c/pdfs/Flight-C-Waypoint-REFERENCE.pdf"
  }),
  waypoint({
    word: "ADMITTANCE",
    flight: "C",
    components: ["ad-", "mit", "-ance"],
    componentMorphemeIds: ["a-ad", "mit", "ance"],
    requiredMorphemeIds: ["a-ad", "mit", "ance"],
    requiredSetIds: ["advanced-prefixes", "advanced-roots-1", "advanced-suffixes"],
    earliestEligibleStop: "coast",
    displayStop: "coast",
    pdfPath: "waypoints/flight-c/pdfs/Flight-C-Waypoint-ADMITTANCE.pdf"
  }),
  waypoint({
    word: "PREVALENT",
    flight: "C",
    components: ["pre-", "val", "-ent"],
    componentMorphemeIds: ["pre", "val", "ant-ent-adjective"],
    requiredMorphemeIds: ["val", "ant-ent-adjective"],
    assumedPriorMorphemeIds: ["pre"],
    requiredSetIds: ["advanced-roots-3", "advanced-suffixes"],
    earliestEligibleStop: "coast",
    displayStop: "coast",
    pdfPath: "waypoints/flight-c/pdfs/Flight-C-Waypoint-PREVALENT.pdf"
  })
]);

const FIRST_VOLO_HELD_WAYPOINTS = Object.freeze([
  Object.freeze({
    word: "TRANSPORTATION",
    flight: "B",
    reason: "Held: -ation versus -ion analysis remains unresolved.",
    pdfPath: "waypoints/flight-b/held/Flight-B-Waypoint-TRANSPORTATION.pdf"
  }),
  Object.freeze({
    word: "CONDUCTIVE",
    flight: "C",
    reason: "Held from the finalized Flight C Waypoint set.",
    pdfPath: "waypoints/flight-c/held/Flight-C-Waypoint-CONDUCTIVE.pdf"
  })
]);

const FIRST_VOLO_WAYPOINT_REGISTRY = Object.freeze({
  version: FIRST_VOLO_WAYPOINT_REGISTRY_VERSION,
  flights: FIRST_VOLO_WAYPOINT_FLIGHTS,
  waypoints: FIRST_VOLO_WAYPOINTS,
  heldWaypoints: FIRST_VOLO_HELD_WAYPOINTS
});

if (typeof window !== "undefined") {
  window.FirstVoloWaypointRegistry = FIRST_VOLO_WAYPOINT_REGISTRY;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = FIRST_VOLO_WAYPOINT_REGISTRY;
}
