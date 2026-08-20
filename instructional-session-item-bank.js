"use strict";

/*
  First Volo Morphology
  Program-Wide Teacher-Led Session Item Bank

  Builds ordinary teacher-led practice items from the existing
  morpheme + word inventories when no richer family material exists.

  Rules:
  - exact resolved target only
  - learner grade/vocabulary filters when saved
  - protected Pre/Post, Migration, and Check Transfer words excluded
  - activity-specific prompts (not every task becomes Build Words)
  - ambiguous surface forms fail closed to morpheme-authorized examples
*/

(function initializeFirstVoloSessionItemBank() {
  const AMBIGUOUS_EXAMPLE_ONLY_IDS = new Set([
    "negative-in-family",
    "location-in-family",
    "er-or",
    "er-more"
  ]);

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[‐‑‒–—−]/g, "-")
      .replace(/\s+/g, "")
      .replace(/^-+|-+$/g, "");
  }

  function variants(value) {
    return String(value || "")
      .split(/(?:->|→|\/|,)/)
      .map(normalize)
      .filter(Boolean);
  }

  function morphemeInventory() {
    return asArray(window.FIRST_VOLO_MORPHEME_INVENTORY);
  }

  function wordInventory() {
    return asArray(window.FIRST_VOLO_WORD_INVENTORY);
  }

  function targetMeta(target) {
    if (!target) return null;

    if (target.id) {
      const exact = morphemeInventory().find(
        item => item.id === target.id
      );

      if (exact) return exact;
    }

    const wanted = new Set(variants(target.label));

    return morphemeInventory().find(
      item => variants(item.label).some(value => wanted.has(value))
    ) || null;
  }

  function targetVariants(target, meta = targetMeta(target)) {
    return [
      ...new Set([
        ...variants(target?.label),
        ...variants(meta?.label)
      ])
    ];
  }

  function currentExamples(meta) {
    return String(meta?.currentExamples || "")
      .split(/[·|]/)
      .map(item => item.trim().toLowerCase())
      .filter(Boolean);
  }

  function protectedWords() {
    const registry =
      window.FirstVoloInstructionalProtection || {};

    const checkTransfer =
      window.FirstVoloCheckTransfer;

    const values = [
      ...asArray(registry.formalPrePost),
      ...asArray(registry.migrationChallenge),
      ...asArray(registry.connectedTextTransfer),
      ...asArray(checkTransfer?.getReservedWords?.())
    ];

    return new Set(values.map(normalize).filter(Boolean));
  }

  function isProtected(word) {
    return protectedWords().has(normalize(word));
  }

  function entryMatchesTarget(entry, target, meta) {
    if (!entry?.word || !target?.label) return false;

    if (
      target.id &&
      AMBIGUOUS_EXAMPLE_ONLY_IDS.has(target.id)
    ) {
      return currentExamples(meta).includes(
        String(entry.word).toLowerCase()
      );
    }

    const wanted = new Set(targetVariants(target, meta));

    return asArray(entry.morphemes).some(morpheme =>
      variants(morpheme).some(value => wanted.has(value))
    );
  }

  function gradeMatches(entry, gradeBand) {
    if (!gradeBand || gradeBand === "all") return true;

    return (
      entry.practiceBand === gradeBand ||
      entry.accessibilityBand === gradeBand
    );
  }

  function vocabularyMatches(entry, vocabLevel) {
    if (!vocabLevel || vocabLevel === "all") return true;
    return entry.vocabLevel === vocabLevel;
  }

  function cautionText(entry) {
    return String(entry?.reviewCaution || "").toLowerCase();
  }

  function useText(entry) {
    return String(entry?.recommendedActivityUse || "").toLowerCase();
  }

  function isLowTransparency(entry) {
    return String(entry?.transparency || "").toLowerCase() === "low";
  }

  function activityEligible(entry, activity) {
    if (!entry?.word) return false;

    const use = useText(entry);
    const caution = cautionText(entry);
    const full = use.includes("full practice");

    switch (activity) {
      case "find":
      case "hunt":
        return !isLowTransparency(entry) && (full || use.includes("find"));

      case "infer":
        return (
          !isLowTransparency(entry) &&
          !caution.includes("avoid independent inference") &&
          !caution.includes("avoid inference") &&
          !caution.includes("recognition only") &&
          (full || use.includes("figure it out"))
        );

      case "break":
        return (
          !isLowTransparency(entry) &&
          !caution.includes("do not simplify") &&
          !caution.includes("avoid break")
        );

      case "build":
        return (
          !isLowTransparency(entry) &&
          !caution.includes("avoid build") &&
          !caution.includes("do not simplify") &&
          Boolean(entry.definition || entry.literal || entry.word)
        );

      case "learn":
      case "meaning":
      case "morpheme":
      case "use":
      case "change":
      default:
        return true;
    }
  }

  function statusRank(value) {
    const ranks = {
      current: 0,
      recommended: 1
    };

    return Object.prototype.hasOwnProperty.call(ranks, value)
      ? ranks[value]
      : 2;
  }

  function transparencyRank(value) {
    const ranks = {
      high: 0,
      medium: 1,
      low: 2
    };

    return Object.prototype.hasOwnProperty.call(ranks, value)
      ? ranks[value]
      : 3;
  }

  function sortCandidates(items, gradeBand, vocabLevel) {
    return items.slice().sort((a, b) => {
      const aGrade = a.practiceBand === gradeBand ? 0 : 1;
      const bGrade = b.practiceBand === gradeBand ? 0 : 1;
      if (aGrade !== bGrade) return aGrade - bGrade;

      const aVocab = a.vocabLevel === vocabLevel ? 0 : 1;
      const bVocab = b.vocabLevel === vocabLevel ? 0 : 1;
      if (aVocab !== bVocab) return aVocab - bVocab;

      const status = statusRank(a.status) - statusRank(b.status);
      if (status) return status;

      const transparency =
        transparencyRank(a.transparency) -
        transparencyRank(b.transparency);
      if (transparency) return transparency;

      return String(a.word).localeCompare(String(b.word));
    });
  }

  function candidatesFor({
    target,
    activity,
    gradeBand,
    vocabLevel
  }) {
    const meta = targetMeta(target);

    const candidates = wordInventory().filter(entry =>
      entryMatchesTarget(entry, target, meta) &&
      !isProtected(entry.word) &&
      gradeMatches(entry, gradeBand) &&
      vocabularyMatches(entry, vocabLevel) &&
      activityEligible(entry, activity)
    );

    return sortCandidates(candidates, gradeBand, vocabLevel);
  }

  function exampleAnswer(entry) {
    return (
      entry.definition ||
      entry.literal ||
      null
    );
  }

  function promptFor(activity, target, meta, entry) {
    const label = target?.label || meta?.label || "the target word part";
    const meaning = target?.meaning || meta?.meaning || "the target meaning";
    const definition = entry?.definition || entry?.literal || null;
    const word = entry?.word || "the word";

    switch (activity) {
      case "learn":
        return `What does ${label} mean? After the student responds, use ${word} as a clear example.`;

      case "find":
        return `Find ${label} in ${word}. Do not mark or separate it before the student's first attempt.`;

      case "meaning":
        return `What does ${label} mean? Begin without choices or a visual cue. Use ${word} only as an example after the response.`;

      case "morpheme":
        return `Which word part means “${meaning}”? After the student retrieves it, connect it to ${word}.`;

      case "break":
        return `Break ${word} into meaningful parts. Do not pre-mark the boundaries.`;

      case "infer":
        return `What do you think ${word} means? Start with what ${label} tells you before adding context or another clue.`;

      case "build":
        return definition
          ? `Build or say a real word containing ${label} that matches this meaning: “${definition}”.`
          : `Build or say a real word containing ${label}. Explain how the known part contributes to the whole word.`;

      case "use":
        return definition
          ? `Produce the word containing ${label} that matches this meaning: “${definition}”. Then use it in a new sentence.`
          : `Use ${word} in a new sentence. Then explain what ${label} contributes.`;

      case "change":
        return `Say or write another form from the same word family as ${word}. Compare the forms and explain what changes while keeping attention on ${label}.`;

      default:
        return `Work with ${word} and explain what ${label} contributes.`;
    }
  }

  function educatorKeyFor(activity, target, meta, entry) {
    const label = target?.label || meta?.label || "target";
    const meaning = target?.meaning || meta?.meaning || null;

    switch (activity) {
      case "learn":
      case "meaning":
        return `${label}${meaning ? ` = ${meaning}` : ""}; example: ${entry.word}.`;

      case "morpheme":
        return `${label}${meaning ? ` = ${meaning}` : ""}.`;

      case "find":
        return `${entry.word} contains ${label}.`;

      case "break":
        return entry.segmentation
          ? `${entry.word}: ${entry.segmentation}`
          : `${entry.word}: known target ${label}. The master inventory does not supply an approved full segmentation here; do not force additional boundaries.`;

      case "infer":
        return `${entry.word}: ${exampleAnswer(entry) || "Use the inventory meaning and the known morphology; accept a reasonable inference."}`;

      case "build":
        return `Example answer: ${entry.word}${entry.segmentation ? ` (${entry.segmentation})` : ""}.`;

      case "use":
        return `Target word: ${entry.word}${exampleAnswer(entry) ? ` — ${exampleAnswer(entry)}` : ""}.`;

      case "change":
        return `Open response. Accept a legitimate related form; verify that the student can explain the morphological change and the contribution of ${label}.`;

      default:
        return entry.word;
    }
  }

  function makeRecipe(activity, target, meta, entry, index) {
    const label = target?.label || meta?.label || "word part";
    const activityPrompt = promptFor(activity, target, meta, entry);
    const educatorKey = educatorKeyFor(activity, target, meta, entry);
    const definition = entry.definition || entry.literal || null;

    return {
      id: `inventory-${activity}-${target?.id || normalize(label)}-${index + 1}`,
      word: entry.word,
      parts: [label],
      targetId: target?.id || meta?.id || null,
      targetLabel: label,
      activity,
      activityPrompt,
      wordPrompt: activityPrompt,
      applyPrompt: definition
        ? `Produce the word containing ${label} that matches this meaning: “${definition}”. Do not show the answer first. Then use the word in a new sentence and explain what ${label} contributes.`
        : `Produce a real word containing ${label}. Use it in a new sentence and explain what ${label} contributes.`,
      answer: educatorKey,
      educatorKey,
      definition,
      segmentation: entry.segmentation || null,
      mode: "prompt",
      source: "master-word-inventory",
      metadata: {
        status: entry.status || null,
        practiceBand: entry.practiceBand || null,
        accessibilityBand: entry.accessibilityBand || null,
        vocabLevel: entry.vocabLevel || null,
        transparency: entry.transparency || null,
        recommendedActivityUse: entry.recommendedActivityUse || null,
        reviewCaution: entry.reviewCaution || null
      }
    };
  }

  function huntDistractors({
    target,
    gradeBand,
    vocabLevel,
    excludedWords
  }) {
    const meta = targetMeta(target);
    const excluded = new Set(excludedWords.map(normalize));

    return wordInventory()
      .filter(entry =>
        entry?.word &&
        !isProtected(entry.word) &&
        !excluded.has(normalize(entry.word)) &&
        gradeMatches(entry, gradeBand) &&
        vocabularyMatches(entry, vocabLevel) &&
        !entryMatchesTarget(entry, target, meta) &&
        !isLowTransparency(entry)
      )
      .slice(0, 8);
  }

  function makeHuntItems({
    target,
    gradeBand,
    vocabLevel,
    limit
  }) {
    const meta = targetMeta(target);
    const matches = candidatesFor({
      target,
      activity: "hunt",
      gradeBand,
      vocabLevel
    });

    if (!matches.length) return [];

    const distractors = huntDistractors({
      target,
      gradeBand,
      vocabLevel,
      excludedWords: matches.map(item => item.word)
    });

    const label = target?.label || meta?.label || "the target";
    const count = Math.max(1, Math.min(Number(limit) || 1, matches.length));
    const items = [];

    for (let index = 0; index < count; index += 1) {
      const correct = matches
        .slice(index, index + 3)
        .map(item => item.word);

      if (!correct.length) correct.push(matches[index % matches.length].word);

      const decoys = distractors
        .slice(index * 2, index * 2 + 2)
        .map(item => item.word);

      const words = [...correct, ...decoys]
        .sort((a, b) => a.localeCompare(b));

      const entry = matches[index % matches.length];
      const activityPrompt =
        `Which of these words contain ${label}? ${words.join(" · ")}. Do not highlight the target before the first attempt.`;

      items.push({
        id: `inventory-hunt-${target?.id || normalize(label)}-${index + 1}`,
        word: entry.word,
        parts: [label],
        targetId: target?.id || meta?.id || null,
        targetLabel: label,
        activity: "hunt",
        activityPrompt,
        wordPrompt: activityPrompt,
        applyPrompt:
          `Name a new word containing ${label}, use it in a sentence, and explain what ${label} contributes.`,
        answer: `Contains ${label}: ${correct.join(", ")}.`,
        educatorKey: `Contains ${label}: ${correct.join(", ")}.`,
        mode: "prompt",
        source: "master-word-inventory",
        metadata: {
          practiceBand: entry.practiceBand || null,
          vocabLevel: entry.vocabLevel || null,
          transparency: entry.transparency || null
        }
      });
    }

    return items;
  }

  function buildItems({
    targetResolution = null,
    activity = "learn",
    gradeBand = null,
    vocabLevel = null,
    limit = 5
  } = {}) {
    const target = targetResolution?.primary || null;

    if (!target?.label) return [];

    if (activity === "hunt") {
      return makeHuntItems({
        target,
        gradeBand,
        vocabLevel,
        limit
      });
    }

    const meta = targetMeta(target);
    const candidates = candidatesFor({
      target,
      activity,
      gradeBand,
      vocabLevel
    });

    return candidates
      .slice(0, Math.max(1, Number(limit) || 1))
      .map((entry, index) =>
        makeRecipe(activity, target, meta, entry, index)
      );
  }

  function auditTarget({
    target,
    activities = [
      "learn",
      "find",
      "hunt",
      "meaning",
      "morpheme",
      "break",
      "infer",
      "build",
      "use",
      "change"
    ]
  } = {}) {
    const targetResolution = {
      primary: {
        ...target,
        role:
          target?.type === "prefix"
            ? "prefix"
            : target?.type === "suffix"
              ? "suffix"
              : "root"
      },
      allTargets: [target]
    };

    return Object.fromEntries(
      activities.map(activity => [
        activity,
        buildItems({
          targetResolution,
          activity,
          limit: 1
        }).length > 0
      ])
    );
  }

  window.FirstVoloSessionItemBank = {
    version: "teacher-session-item-bank-v1-program-wide",
    buildItems,
    auditTarget,
    isProtected,
    targetVariants
  };
})();
