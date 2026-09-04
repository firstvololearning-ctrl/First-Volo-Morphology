"use strict";

(function (root) {
  const FLIGHT_COLLECTIONS = Object.freeze({
    "2-3": "Foundation",
    "4-5": "Expansion",
    "6-8": "Advanced"
  });

  const tokenSets = () => root.FIRST_VOLO_TOKEN_SETS || [];
  const inventory = () => root.FIRST_VOLO_MORPHEME_INVENTORY || [];

  function eligibleThrough(flight, unlockToken) {
    const collections = ["Foundation", "Expansion", "Advanced"];
    const collection = FLIGHT_COLLECTIONS[flight];
    const flightIndex = collections.indexOf(collection);
    const ownSets = tokenSets().filter((set) => set.collection === collection);
    const unlockIndex = ownSets.findIndex((set) => set.id === unlockToken);
    const priorIds = tokenSets()
      .filter((set) => collections.indexOf(set.collection) < flightIndex)
      .flatMap((set) => set.morphemeIds);
    const currentIds = ownSets.slice(0, unlockIndex + 1).flatMap((set) => set.morphemeIds);
    return [...new Set([...priorIds, ...currentIds])];
  }

  function morpheme(id) {
    return inventory().find((item) => item.id === id) || null;
  }

  function learnerLabel(id) {
    const label = morpheme(id)?.label;
    if (!label) return id;
    return label.includes(",")
      ? label.trim()
      : label.replaceAll("-", "").trim();
  }

  function promptLabel(id) {
    return morpheme(id)?.label?.trim() || learnerLabel(id);
  }

  /* Existing First Volo instructional glosses used only for game display. */
  const GAME_DISPLAY_GLOSSES = Object.freeze({
    dis: "apart; away; not",
    ing: "action happening now"
  });

  function displayMeaning(id) {
    return GAME_DISPLAY_GLOSSES[id] || morpheme(id)?.meaning || id;
  }

  function meaningSense(id) {
    return displayMeaning(id).split(";")[0].trim();
  }

  const definitions = [
    {
      id: "volos-sky-catch", flight: "2-3", title: "Volo’s Core Word-Part Catch",
      shortDescription: "Catch the right word parts and help Volo ride the wind.",
      unlockToken: "foundation-core-word-parts", gameType: "sky-catch", theme: "migration-sky", launcher: "FirstVoloRewards.launch",
      difficulty: { pace: "slow", targetSize: "large", winds: 5 },
      rounds: [
        { target: "re", meaning: "AGAIN", distractors: ["un-negation", "s-es", "ed"] },
        { target: "un-negation", meaning: "NOT", distractors: ["re", "ing", "s-es"] },
        { target: "s-es", meaning: "MORE THAN ONE", distractors: ["ed", "ing", "re"] },
        { target: "ed", meaning: "HAPPENED IN THE PAST", distractors: ["ing", "s-es", "un-negation"] },
        { target: "ing", meaning: "ACTION HAPPENING NOW", distractors: ["ed", "s-es", "re"] }
      ]
    },
    {
      id: "prefix-wind-builder", flight: "2-3", title: "Word-Part Wind Builder",
      shortDescription: "Gather familiar pieces and build a real word in the sky.",
      unlockToken: "foundation-common-meaning-changes", gameType: "build-word", theme: "migration-sky", launcher: "FirstVoloRewards.launch",
      difficulty: { pace: "slow", rounds: 4 },
      rounds: [
        { word: "rewrite", prompt: "write again", pieces: ["re", "write"], targetIds: ["re"], baseHelp: "write = put words on a page" },
        { word: "untie", prompt: "undo a tie", pieces: ["un", "tie"], targetIds: ["un-reversative"], baseHelp: "tie = fasten" },
        { word: "misread", prompt: "read wrongly", pieces: ["mis", "read"], targetIds: ["mis"], baseHelp: "read = look at and understand words" },
        { word: "preschool", prompt: "school before kindergarten", pieces: ["pre", "school"], targetIds: ["pre"], baseHelp: "school = a place for learning" }
      ]
    },
    {
      id: "suffix-meaning-flight", flight: "2-3", title: "Flight A Meaning Flight",
      shortDescription: "Fly through the meaning that matches each familiar suffix.",
      unlockToken: "foundation-grade3-bridge", gameType: "meaning-flight", theme: "migration-sky", launcher: "FirstVoloRewards.launch",
      difficulty: { pace: "slow", rounds: 5 },
      prompts: ["ness", "able-ible", "er-or", "ion", "ment"]
    },
    {
      id: "prefix-meaning-flight", flight: "4-5", title: "Prefix Meaning Flight",
      shortDescription: "Guide Volo through meanings for new Flight B prefixes.",
      unlockToken: "expansion-prefixes-1", gameType: "meaning-flight", theme: "migration-sky", launcher: "FirstVoloRewards.launch",
      difficulty: { pace: "steady", rounds: 5 },
      prompts: ["inter", "trans", "con-com", "e-ex", "location-in-family"]
    },
    {
      id: "root-word-builder", flight: "4-5", title: "Root Word Builder",
      shortDescription: "Collect taught roots and affixes to assemble familiar words.",
      unlockToken: "expansion-roots-2", gameType: "build-word", theme: "migration-sky", launcher: "FirstVoloRewards.launch",
      difficulty: { pace: "steady", rounds: 4 },
      rounds: [
        { word: "transport", prompt: "carry across", pieces: ["trans", "port"], targetIds: ["trans", "port"], baseHelp: "port = carry" },
        { word: "predict", prompt: "say before", pieces: ["pre", "dict"], targetIds: ["pre", "dict"], baseHelp: "dict = say" },
        { word: "telescope", prompt: "look far", pieces: ["tele", "scope"], targetIds: ["tele", "scop"], baseHelp: "scope = look" },
        { word: "microscope", prompt: "look at something small", pieces: ["micro", "scope"], targetIds: ["micro", "scop"], baseHelp: "scope = look" }
      ]
    },
    {
      id: "expansion-meaning-flight", flight: "4-5", title: "Flight B Meaning Flight",
      shortDescription: "Catch meanings for familiar Flight B roots and suffixes.",
      unlockToken: "expansion-suffixes-2", gameType: "meaning-flight", theme: "migration-sky", launcher: "FirstVoloRewards.launch",
      difficulty: { pace: "steady", rounds: 5 },
      prompts: ["bio", "geo", "tele", "ology", "ify"]
    },
    {
      id: "advanced-prefix-flight", flight: "6-8", title: "Flight C Prefix Flight",
      shortDescription: "Navigate meanings for more complex prefixes already introduced.",
      unlockToken: "advanced-prefixes", gameType: "meaning-flight", theme: "migration-sky", launcher: "FirstVoloRewards.launch",
      difficulty: { pace: "steady", rounds: 3 },
      prompts: ["ab", "a-ad", "retro"]
    },
    {
      id: "advanced-root-builder", flight: "6-8", title: "Flight C Root Builder",
      shortDescription: "Assemble words from more complex roots and familiar affixes.",
      unlockToken: "advanced-roots-2", gameType: "build-word", theme: "migration-sky", launcher: "FirstVoloRewards.launch",
      difficulty: { pace: "steady", rounds: 4 },
      rounds: [
        { word: "retract", prompt: "pull back", pieces: ["re", "tract"], targetIds: ["re", "tract"], baseHelp: "tract = pull" },
        { word: "project", prompt: "throw forward", pieces: ["pro", "ject"], targetIds: ["pro", "ject"], baseHelp: "ject = throw" },
        { word: "audible", prompt: "able to be heard", pieces: ["aud", "ible"], targetIds: ["aud", "able-ible"], baseHelp: "aud = hear" },
        { word: "credible", prompt: "able to be believed", pieces: ["cred", "ible"], targetIds: ["cred", "able-ible"], baseHelp: "cred = believe" }
      ]
    },
    {
      id: "advanced-meaning-flight", flight: "6-8", title: "Flight C Meaning Flight",
      shortDescription: "Ride the wind through more complex root and suffix meanings.",
      unlockToken: "advanced-suffixes", gameType: "meaning-flight", theme: "migration-sky", launcher: "FirstVoloRewards.launch",
      difficulty: { pace: "steady", rounds: 5 },
      prompts: ["duct", "sequ", "cred", "ance", "ant-ent-adjective"]
    }
  ];

  definitions.forEach((reward) => {
    reward.eligibleContent = Object.freeze({
      throughToken: reward.unlockToken,
      morphemeIds: Object.freeze(eligibleThrough(reward.flight, reward.unlockToken))
    });
    reward.displayGlosses = Object.freeze(Object.fromEntries(
      reward.eligibleContent.morphemeIds
        .filter((id) => GAME_DISPLAY_GLOSSES[id])
        .map((id) => [id, GAME_DISPLAY_GLOSSES[id]])
    ));
    Object.freeze(reward);
  });

  const api = Object.freeze({
    definitions: Object.freeze(definitions),
    flightCollections: FLIGHT_COLLECTIONS,
    eligibleThrough,
    morpheme,
    learnerLabel,
    promptLabel,
    displayMeaning,
    meaningSense,
    displayGlosses: GAME_DISPLAY_GLOSSES
  });

  root.FirstVoloRewardRegistry = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
