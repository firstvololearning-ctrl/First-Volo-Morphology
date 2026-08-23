(function (global) {
  "use strict";

  const VERSION = "word-part-family-contrast-v1";

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");
  }

  const FAMILIES = [
    {
      id: "act-family",
      targetIds: ["ive"],
      triggerWords: ["active"],
      base: "act",
      title: "Compare the ACT family",
      prompt:
        "Which word describes someone or something that is doing, moving, or taking part?",
      choices: [
        { word: "actor", suffix: "-or", job: "names a person or thing that acts", answer: false },
        { word: "active", suffix: "-ive", job: "describes someone or something that is doing, moving, or taking part", answer: true },
        { word: "activity", suffix: "-ity", job: "names something done or a state of being active", answer: false },
        { word: "action", suffix: "-ion", job: "names an act, process, or result", answer: false }
      ],
      followUp:
        "All four words connect to act. What changes across the words even though they belong to the same family?",
      explanation: [
        "All four words belong to the ACT word family.",
        "The shared root connects the words in meaning, while different endings help the words do different jobs.",
        "Active describes; actor names who or what acts; action names an act, process, or result; activity names something done or a state of being active."
      ],
      support: [
        "Ask which choice could complete this sentence: The student is ___.",
        "If needed, identify actor as a person/thing and action as an act or process. Then retry the original question.",
        "After the student chooses, point to the different endings and ask how each ending changes the word's job."
      ]
    },
    {
      id: "create-family",
      targetIds: ["ive"],
      triggerWords: ["creative"],
      base: "create",
      title: "Compare the CREATE family",
      prompt:
        "Which word describes someone who is able to create new things or ideas?",
      choices: [
        { word: "creator", suffix: "-or", job: "names a person or thing that creates", answer: false },
        { word: "creation", suffix: "-ion", job: "names the act, process, or result of creating", answer: false },
        { word: "creative", suffix: "-ive", job: "describes someone or something connected with creating", answer: true },
        { word: "creativity", suffix: "-ity", job: "names the quality or state of being creative", answer: false }
      ],
      followUp:
        "All four words connect to create. What changes across the words even though they belong to the same family?",
      explanation: [
        "All four words belong to the CREATE word family.",
        "Different endings help related words do different jobs: creative describes, creator names who creates, creation names an act/process/result, and creativity names a quality or state.",
        "Word-family spelling can change as a word is built; the family relationship matters more than pretending every form is made by simple letter addition."
      ],
      support: [
        "Ask which choice is a describing word rather than a person, an act/result, or a quality/state.",
        "If needed, contrast creator (a person/thing) with creative (a describing word), then retry.",
        "After the choice, compare the endings and ask what job each family member is doing."
      ]
    }
  ];

  function targetId(target) {
    return normalize(
      target?.id ||
      target?.label ||
      target?.target ||
      ""
    );
  }

  function select({ target = null, words = [], minutes = 0 } = {}) {
    if (Number(minutes) < 30) {
      return null;
    }

    const wantedTarget = targetId(target);
    const seenWords = new Set(
      (Array.isArray(words) ? words : [])
        .map(normalize)
        .filter(Boolean)
    );

    const candidates = FAMILIES.filter(
      family =>
        family.targetIds.map(normalize).includes(wantedTarget) &&
        family.triggerWords.map(normalize).some(word => seenWords.has(word))
    );

    const family = candidates[0] || null;

    if (!family) {
      return null;
    }

    return {
      ...family,
      optional: true,
      scored: false,
      choices: family.choices.map(choice => ({ ...choice }))
    };
  }

  global.FirstVoloWordPartFamilyContrast = {
    version: VERSION,
    families: FAMILIES.map(
      family => ({
        ...family,
        choices: family.choices.map(choice => ({ ...choice }))
      })
    ),
    select
  };
})(typeof window !== "undefined" ? window : globalThis);
