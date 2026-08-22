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

  const ACTIVITY_APPLICABILITY_OVERRIDES = Object.freeze({
    put: Object.freeze({
      break:
        "PUT words in the master inventory do not have an approved transparent segmentation. Do not force word-part boundaries on synchronically opaque forms.",
      infer:
        "PUT words are low-transparency recognition/stretch items, and the master inventory explicitly warns against independent Figure It Out.",
      build:
        "PUT words are low-transparency recognition/stretch items, and the master inventory explicitly warns against independent Build Words."
    }),

    chron: Object.freeze({
      build:
        "The only currently approved clean CHRON decomposition is reserved/protected; the safe ordinary CHRON words do not yet have an approved clean segmentation."
    }),

    pos: Object.freeze({
      build:
        "The safe ordinary POS words in the master inventory do not currently have an approved clean decomposition for movable Build tiles."
    }),

    val: Object.freeze({
      build:
        "The cleanest available VAL candidate is protected, while the safe ordinary VAL words do not currently have an approved clean decomposition for Build."
    }),

    aud: Object.freeze({
      build:
        "The currently cleanly segmented AUD words are protected; the safe ordinary AUD words do not have an approved clean decomposition for Build."
    })
  });

  function activityApplicability(target, activity) {

    /* FIRST_VOLO_BREAK_NOT_APPLICABLE_V1

       Break It Apart requires a defensible full morphological segmentation.

       These targets retain other appropriate activities but do not force

       opaque or instructionally misleading boundaries. */

    const breakNotApplicable =

      new Set(["ab", "aud", "chron", "pos", "val"]);


    if (

      activity === "break" &&

      breakNotApplicable.has(

        target?.id

      )

    ) {

      return {

        applicable: false,

        reason:

          "Break It Apart is intentionally not applicable: no clean ordinary full segmentation is approved for this target."

      };

    }

    const targetId = target?.id || null;
    const reason =
      ACTIVITY_APPLICABILITY_OVERRIDES[targetId]?.[activity] || null;

    return reason
      ? {
          applicable: false,
          reason
        }
      : {
          applicable: true,
          reason: null
        };
  }

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

  const TARGET_FORM_ALIASES = Object.freeze({
    derma: Object.freeze([
      "derm"
    ])
  });

  function targetVariants(target, meta = targetMeta(target)) {
    const aliases =
      TARGET_FORM_ALIASES[
        target?.id ||
        meta?.id
      ] || [];

    return [
      ...new Set([
        ...variants(target?.label),
        ...variants(meta?.label),
        ...aliases.flatMap(variants)
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

  function activityEligible(entry, activity, target, meta) {
    if (!entry?.word) return false;


    if (
      activity === "break" &&
      !String(
        entry?.segmentation ||
        ""
      ).trim()
    ) {
      return false;
    }

    const use = useText(entry);
    const caution = cautionText(entry);
    const full = use.includes("full practice");
    const targetId = target?.id || meta?.id || null;

    switch (activity) {
      case "find":
      case "hunt":
        if (targetId === "put" && use.includes("recognition")) {
          return true;
        }

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

  function legacyCandidatesFor({
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
      activityEligible(entry, activity, target, meta)
    );

    return sortCandidates(candidates, gradeBand, vocabLevel);
  }

  function candidatesFor({
    target,
    activity,
    gradeBand,
    vocabLevel
  }) {
    const selector =
      window
        .FirstVoloInstructionalWordSelector;

    if (
      !selector
        ?.selectCandidates
    ) {
      return legacyCandidatesFor({
        target,
        activity,
        gradeBand,
        vocabLevel
      });
    }

    return selector
      .selectCandidates({
        target,
        targetMeta:
          targetMeta(target),
        objective:
          activity,
        stage:
          "guided",
        gradeBand,
        vocabularyLevel:
          vocabLevel,
        isProtected
      })
      .map(
        selection =>
          selection.item
      );
  }


  function exampleAnswer(entry) {
    return (
      entry.definition ||
      entry.literal ||
      null
    );
  }

  function cleanDisplayPart(value) {
    return String(value || "")
      .trim()
      .replace(/^[+\s]+|[+\s]+$/g, "")
      .trim();
  }

  function firstSegmentationParts(entry) {
    const first = String(entry?.segmentation || "")
      .split(";")[0]
      .trim();

    if (!first) return [];

    return first
      .split("+")
      .map(cleanDisplayPart)
      .filter(Boolean);
  }

  function visibleTargetMatch(word, target, meta) {
    const rawWord = String(word || "");
    const lowerWord = rawWord.toLowerCase();

    const forms = targetVariants(target, meta)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    for (const form of forms) {
      const index = lowerWord.indexOf(form);

      if (index === -1) continue;

      return {
        form,
        surface: rawWord.slice(index, index + form.length),
        before: rawWord.slice(0, index),
        after: rawWord.slice(index + form.length)
      };
    }

    return null;
  }

  function constructionCue(target, meta, entry) {
    const label =
      target?.label ||
      meta?.label ||
      "the target word part";

    const targetType =
      target?.type ||
      meta?.type ||
      null;

    const targetForms =
      new Set(targetVariants(target, meta));

    const segmentationParts =
      firstSegmentationParts(entry);

    if (segmentationParts.length > 1) {
      const targetIndex =
        segmentationParts.findIndex(part =>
          variants(part).some(value =>
            targetForms.has(value)
          )
        );

      if (targetIndex !== -1) {
        const targetPart =
          segmentationParts[targetIndex];

        const otherParts =
          segmentationParts.filter(
            (_, index) => index !== targetIndex
          );

        if (otherParts.length) {
          return {
            kind: "construction",
            targetPart,
            otherParts,
            prompt:
              `Combine ${targetPart} with ${otherParts.join(" + ")} to make a real word. ` +
              `Say the word, then explain what ${label} contributes.`
          };
        }
      }
    }

    if (targetType === "prefix" || targetType === "suffix") {
      const match =
        visibleTargetMatch(entry?.word, target, meta);

      if (match) {
        const other =
          cleanDisplayPart(
            `${match.before}${match.after}`
          );

        if (other) {
          const targetPart =
            targetType === "prefix"
              ? `${match.surface}-`
              : `-${match.surface}`;

          return {
            kind: "construction",
            targetPart,
            otherParts: [other],
            prompt:
              `Combine ${targetPart} with ${other} to make a real word. ` +
              `Say the word, then explain what ${label} contributes.`
          };
        }
      }
    }

    return null;
  }

  function targetRole(target, meta) {
    return (
      target?.role ||
      (
        target?.type === "prefix"
          ? "prefix"
          : target?.type === "suffix"
            ? "suffix"
            : (
                String(
                  target?.role ||
                  meta?.role ||
                  ""
                ).toLowerCase().includes("greek")
                  ? "Greek combining form"
                  : "root"
              )
      )
    );
  }

  function buildInteractionDetails(target, meta, entry) {
    const cue =
      constructionCue(
        target,
        meta,
        entry
      );

    if (!cue) {
      return null;
    }

    const role =
      targetRole(
        target,
        meta
      );

    const targetForms =
      new Set(
        targetVariants(
          target,
          meta
        )
      );

    let parts = [];
    let targetIndex = -1;

    const segmented =
      firstSegmentationParts(
        entry
      );

    if (segmented.length > 1) {
      targetIndex =
        segmented.findIndex(part =>
          variants(part).some(
            value =>
              targetForms.has(value)
          )
        );

      if (targetIndex !== -1) {
        /*
          Preserve the approved surface allomorph from the segmentation
          instead of replacing it with the broader target label.
        */
        parts =
          segmented.slice();
      }
    }

    if (!parts.length) {
      if (role === "suffix") {
        parts = [
          ...cue.otherParts,
          cue.targetPart
        ];

        targetIndex =
          parts.length - 1;
      } else {
        parts = [
          cue.targetPart,
          ...cue.otherParts
        ];

        targetIndex = 0;
      }
    }

    if (
      parts.length < 2 ||
      targetIndex < 0
    ) {
      return null;
    }

    const allAcceptedRoles = [
      "prefix",
      "suffix",
      "root",
      "Greek combining form",
      "base word",
      "word part"
    ];

    const tiles =
      parts.map((part, index) => {
        let partRole =
          "word part";

        if (index === targetIndex) {
          partRole = role;
        } else if (
          String(part).endsWith("-")
        ) {
          partRole = "prefix";
        } else if (
          String(part).startsWith("-")
        ) {
          partRole = "suffix";
        } else if (
          role === "prefix" ||
          role === "suffix"
        ) {
          partRole =
            "base word";
        }

        return {
          id:
            `inventory-build-${normalize(entry.word)}-${index + 1}`,
          label:
            part,
          meaning:
            index === targetIndex
              ? (
                  target?.meaning ||
                  meta?.meaning ||
                  null
                )
              : null,
          role:
            partRole,
          image:
            null,
          movable:
            true,
          printable:
            true
        };
      });

    const slots =
      tiles.map((tile, index) => {
        let label =
          `WORD PART ${index + 1}`;

        if (tile.role === "prefix") {
          label = "PREFIX";
        } else if (
          tile.role === "suffix"
        ) {
          label = "SUFFIX";
        } else if (
          tile.role === "base word"
        ) {
          label = "BASE WORD";
        } else if (
          tile.role === "root"
        ) {
          label = "ROOT";
        } else if (
          tile.role ===
          "Greek combining form"
        ) {
          label =
            "ROOT / GREEK COMBINING FORM";
        }

        return {
          id:
            `part-${index + 1}`,
          label,
          accepts:
            allAcceptedRoles.slice(),
          required:
            true
        };
      });

    return {
      parts,
      tiles,
      slots
    };
  }


  function buildPromptDetails(target, meta, entry) {
    const label =
      target?.label ||
      meta?.label ||
      "the target word part";

    const definition =
      entry?.definition ||
      entry?.literal ||
      null;

    if (definition) {
      return {
        kind: "semantic-goal",
        prompt:
          `Build or say a real word containing ${label} that matches this meaning: ` +
          `“${definition}”. Do not show the answer before the student's attempt.`
      };
    }

    const cue =
      constructionCue(target, meta, entry);

    if (cue) return cue;

    return {
      kind: "open-production",
      prompt:
        `Make a real word containing ${label}. ` +
        `Say the word and explain what ${label} contributes.`
    };
  }

  function promptFor(activity, target, meta, entry) {
    const label =
      target?.label ||
      meta?.label ||
      "the target word part";

    const meaning =
      target?.meaning ||
      meta?.meaning ||
      "the target meaning";

    const definition =
      entry?.definition ||
      entry?.literal ||
      null;

    const word =
      entry?.word ||
      "the word";

    switch (activity) {
      case "learn":
        return `What does ${label} mean? After the student responds, use ${word} as a clear example.`;

      case "find":
        return `Find ${label} in ${word}. Do not mark or separate it before the student's first attempt.`;

      case "meaning":
        return `What does ${label} mean? Begin without choices or a visual cue. Use ${word} only as an example after the response.`;

      case "morpheme":
        return `Which word part means “${meaning}”?`;

      case "break":
        return `Break ${word} into meaningful parts. Do not pre-mark the boundaries.`;

      case "infer":
        return `What do you think ${word} means? Start with what ${label} tells you before adding context or another clue.`;

      case "build":
        return buildPromptDetails(
          target,
          meta,
          entry
        ).prompt;

      case "use":
        return definition
          ? `Give the word containing ${label} that matches this meaning: “${definition}”. Then use it in a new sentence.`
          : `Use ${word} in a new sentence. Then explain what ${label} contributes.`;

      case "change":
        return `Say or write another form from the same word family as ${word}. Compare the forms and explain what changes while keeping attention on ${label}.`;

      default:
        return `Work with ${word} and explain what ${label} contributes.`;
    }
  }

  function educatorKeyFor(activity, target, meta, entry) {
    const label =
      target?.label ||
      meta?.label ||
      "target";

    const meaning =
      target?.meaning ||
      meta?.meaning ||
      null;

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
          : `${entry.word}: use a different Break It Apart item with an approved word-part analysis.`;

      case "infer":
        return `${entry.word}: ${exampleAnswer(entry) || "Use the inventory meaning and the known morphology; accept a reasonable inference."}`;

      case "build": {
        const details =
          buildPromptDetails(target, meta, entry);

        if (details.kind === "open-production") {
          return (
            `Open response. Accept a real word that genuinely contains ${label} ` +
            `and a correct explanation of what ${label} contributes.`
          );
        }

        return (
          `Expected word: ${entry.word}` +
          `${entry.segmentation ? ` (${entry.segmentation})` : ""}.`
        );
      }

      case "use":
        return `Target word: ${entry.word}${exampleAnswer(entry) ? ` — ${exampleAnswer(entry)}` : ""}.`;

      case "change":
        return `Open response. Accept a legitimate related form; verify that the student can explain the morphological change and the contribution of ${label}.`;

      default:
        return entry.word;
    }
  }

  function applyDetails(
    activity,
    target,
    meta,
    practiceEntry,
    applyEntry
  ) {
    const label =
      target?.label ||
      meta?.label ||
      "the target word part";

    const meaning =
      target?.meaning ||
      meta?.meaning ||
      null;

    const selector =
      window
        .FirstVoloInstructionalWordSelector;

    if (
      applyEntry &&
      selector
        ?.evaluateCandidate
    ) {
      const applyEligibility =
        selector
          .evaluateCandidate({
            item:
              applyEntry,
            target,
            targetMeta:
              meta,
            objective:
              activity,
            stage:
              "apply",
            isProtected
          });

      if (
        !applyEligibility
          ?.eligible
      ) {
        applyEntry =
          null;
      }
    }


    const hasDistinctItem =
      Boolean(
        applyEntry &&
        applyEntry.word &&
        normalize(applyEntry.word) !==
          normalize(practiceEntry?.word) &&
        !(
          selector?.sameFreshnessFamily &&
          selector.sameFreshnessFamily(
            practiceEntry,
            applyEntry
          )
        )
      );

    if (
      hasDistinctItem &&
      (
        activity !== "break" ||
        Boolean(
          applyEntry
            ?.segmentation
        )
      )
    ) {
      const word =
        applyEntry.word;

      switch (activity) {
        case "learn":
          return {
            kind:
              "specific-new-item",
            word,
            prompt:
              `Use a different example, ${word}. Explain what ${label} means and what it contributes to the whole word.`,
            educatorKey:
              `${label}${meaning ? ` = ${meaning}` : ""}; Apply example: ${word}.`,
            segmentation:
              applyEntry.segmentation ||
              null
          };

        case "find":
          return {
            kind:
              "specific-new-item",
            word,
            prompt:
              `Find ${label} in ${word}. Do not highlight or separate it before the student's first attempt. Then point to where the target appears.`,
            educatorKey:
              `${word} contains ${label}.`,
            segmentation:
              applyEntry.segmentation ||
              null
          };

        case "meaning":
          return {
            kind:
              "specific-new-item",
            word,
            prompt:
              `In ${word}, explain what ${label} means and what it contributes to the whole word.`,
            educatorKey:
              `${label}${meaning ? ` = ${meaning}` : ""}; Apply example: ${word}.`,
            segmentation:
              applyEntry.segmentation ||
              null
          };

        /* FIRST_VOLO_WORD_PART_PARTB_TEACHER_DIRECTIONS_V4L3 */
        case "morpheme":
          return {
            kind:
              "specific-new-item",
            word,
            prompt:
              meaning
                ? (
                    `Present the meaning without naming the word part: “${meaning}.” Ask the student to name the word part. After the student responds, present ${word} and ask them to find the word part in the word. Do not show or say ${word} before the student responds.`
                  )
                : (
                    `Ask the student to name the target word part. After the student responds, present ${word} and ask them to find the word part in the word. Do not show or say ${word} before the student responds.`
                  ),
            educatorKey:
              `Expected word part: ${label}.`,
            segmentation:
              applyEntry.segmentation ||
              null
          };

        case "break":
          return {
            kind:
              "specific-new-item",
            word,
            prompt:
              `Break ${word} into meaningful parts. Do not pre-mark the boundaries. Then explain what ${label} contributes.`,
            educatorKey:
              applyEntry.segmentation
                ? `${word}: ${applyEntry.segmentation}`
                : (
                    `${word}: use a different Break It Apart item with an approved word-part analysis.`
                  ),
            segmentation:
              applyEntry.segmentation ||
              null
          };

        case "infer":
          return {
            kind:
              "specific-new-item",
            word,
            prompt:
              `Use ${label} and any other meaningful parts you recognize to infer what ${word} probably means. Explain the morphology first; add context only if needed.`,
            educatorKey:
              `${word}: ${exampleAnswer(applyEntry) || "Accept a reasonable morphology-based inference supported by the known target."}`,
            segmentation:
              applyEntry.segmentation ||
              null
          };

        case "build": {
          const build =
            buildPromptDetails(
              target,
              meta,
              applyEntry
            );

          if (
            build.kind !==
              "open-production"
          ) {
            return {
              kind:
                "specific-new-item",
              word,
              prompt:
                `${build.prompt} Then use the word in a new sentence.`,
              educatorKey:
                `Expected Apply word: ${word}` +
                `${applyEntry.segmentation ? ` (${applyEntry.segmentation})` : ""}.`,
              segmentation:
                applyEntry.segmentation ||
                null
            };
          }

          break;
        }

        case "use":
          return {
            kind:
              "specific-new-item",
            word,
            prompt:
              `Use ${word} in a new sentence that shows its meaning. Then explain what ${label} contributes.`,
            educatorKey:
              `Target word: ${word}. Verify an appropriate sentence and a correct explanation of ${label}.`,
            segmentation:
              applyEntry.segmentation ||
              null
          };

        case "change":
          return {
            kind:
              "open-new-item",
            word:
              null,
            prompt:
              `Starting from ${word}, give a related form from the same word family. Use the new form in a sentence and explain what changed morphologically.`,
            educatorKey:
              `Open response. Verify a legitimate related form of ${word}, appropriate sentence use, and an accurate explanation of the morphological change.`,
            segmentation:
              null
          };

        default:
          break;
      }
    }

    switch (activity) {
      case "find":
        return {
          kind:
            "open-new-item",
          word:
            null,
          prompt:
            `Name a different real word containing ${label} that was not used in Teach / Practice. Point to where ${label} appears in the whole word.`,
          educatorKey:
            `Open response. Verify that the new word genuinely contains ${label} and that the student locates the target correctly.`,
          segmentation:
            null
        };

      case "break":
        return {
          kind:
            "open-new-item",
          word:
            null,
          prompt:
            `Use a different real word containing ${label} that was not used in Teach / Practice. Write the whole word first, then break it into meaningful parts without pre-marked boundaries. Explain what ${label} contributes.`,
          educatorKey:
            `Open response. Verify a real new word containing ${label}, defensible morphological boundaries, and an accurate explanation of the target's contribution.`,
          segmentation:
            null
        };

      case "infer":
        return {
          kind:
            "open-new-item",
          word:
            null,
          prompt:
            `Have the educator supply a new ordinary word containing ${label} that was not used in Teach / Practice. Infer the whole-word meaning from morphology first; add context only if needed.`,
          educatorKey:
            `Open response. Verify that the student used a different appropriate word containing ${label} and made a morphology-based inference.`,
          segmentation:
            null
        };

      case "morpheme":
        return {
          kind:
            "open-new-item",
          word:
            null,
          prompt:
            meaning
              ? (
                  `Give another real word containing a word part that means “${meaning}.” Name the word part and explain its contribution.`
                )
              : (
                  `Give another real word containing ${label}. Name the target word part and explain its contribution.`
                ),
          educatorKey:
            `Open response. Expected target word part: ${label}.`,
          segmentation:
            null
        };

      case "learn":
      case "meaning":
        return {
          kind:
            "open-new-item",
          word:
            null,
          prompt:
            `Give another real word containing ${label} that was not used in Teach / Practice. Explain what ${label} means and what it contributes to that word.`,
          educatorKey:
            `Open response. Verify a real new word containing ${label} and an accurate meaning/contribution explanation.`,
          segmentation:
            null
        };

      case "use":
        return {
          kind:
            "open-new-item",
          word:
            null,
          prompt:
            `Give another real word containing ${label} that was not used in Teach / Practice. Use it in a new sentence that shows its meaning and explain what ${label} contributes.`,
          educatorKey:
            `Open response. Verify the new word, sentence meaning, and the contribution of ${label}.`,
          segmentation:
            null
        };

      case "change":
        return {
          kind:
            "open-new-item",
          word:
            null,
          prompt:
            `Give a related form from a word family containing ${label}. Use the form in a sentence and explain what changed morphologically.`,
          educatorKey:
            `Open response. Verify a legitimate related form, appropriate sentence use, and an accurate explanation of the morphological change.`,
          segmentation:
            null
        };

      case "build":
      default:
        return {
          kind:
            "open-new-item",
          word:
            null,
          prompt:
            `Build another real word containing ${label} that was not used in Teach / Practice. Use it in a new sentence and explain what ${label} contributes.`,
          educatorKey:
            `Open response. Verify that the new word genuinely contains ${label}, was not the Teach / Practice word, and that the student can explain the contribution of ${label}.`,
          segmentation:
            null
        };
    }
  }


  function makeRecipe(
    activity,
    target,
    meta,
    entry,
    index,
    applyEntry = null
  ) {
    const label =
      target?.label ||
      meta?.label ||
      "word part";

    const activityPrompt =
      promptFor(
        activity,
        target,
        meta,
        entry
      );

    const educatorKey =
      educatorKeyFor(
        activity,
        target,
        meta,
        entry
      );

    const definition =
      entry.definition ||
      entry.literal ||
      null;

    const promptDetails =
      activity === "build"
        ? buildPromptDetails(
            target,
            meta,
            entry
          )
        : {
            kind: "activity-specific"
          };

    const buildInteraction =
      activity === "build"
        ? buildInteractionDetails(
            target,
            meta,
            entry
          )
        : null;

    const apply =
      applyDetails(
        activity,
        target,
        meta,
        entry,
        applyEntry
      );

    const applyInteraction =
      (
        activity === "build" &&
        apply.kind ===
          "specific-new-item" &&
        applyEntry
      )
        ? buildInteractionDetails(
            target,
            meta,
            applyEntry
          )
        : null;

    return {
      id:
        `inventory-${activity}-${target?.id || normalize(label)}-${index + 1}`,

      word:
        entry.word,

      parts:
        buildInteraction
          ?.parts
          ?.slice() ||
        [label],

      buildTiles:
        buildInteraction
          ?.tiles
          ?.map(tile => ({ ...tile })) ||
        [],

      buildSlots:
        buildInteraction
          ?.slots
          ?.map(slot => ({
            ...slot,
            accepts:
              Array.isArray(slot.accepts)
                ? slot.accepts.slice()
                : []
          })) ||
        [],

      targetId:
        target?.id ||
        meta?.id ||
        null,

      targetLabel:
        label,

      activity,

      activityPrompt,

      wordPrompt:
        activityPrompt,

      promptKind:
        promptDetails.kind,

      applyPrompt:
        apply.prompt,

      applyEducatorKey:
        apply.educatorKey,

      applyWord:
        apply.word,

      applyKind:
        apply.kind,

      applySegmentation:
        apply.segmentation ||
        null,

      applyParts:
        applyInteraction
          ?.parts
          ?.slice() ||
        [],

      applyBuildTiles:
        applyInteraction
          ?.tiles
          ?.map(tile => ({ ...tile })) ||
        [],

      applyBuildSlots:
        applyInteraction
          ?.slots
          ?.map(slot => ({
            ...slot,
            accepts:
              Array.isArray(slot.accepts)
                ? slot.accepts.slice()
                : []
          })) ||
        [],

      applyMode:
        applyInteraction
          ? "build"
          : "prompt",

      answer:
        educatorKey,

      educatorKey,

      definition,

      segmentation:
        entry.segmentation ||
        null,

      mode:
        (
          activity === "build" &&
          buildInteraction
        )
          ? "build"
          : "prompt",

      source:
        "master-word-inventory",

      metadata: {
        status:
          entry.status ||
          null,

        practiceBand:
          entry.practiceBand ||
          null,

        accessibilityBand:
          entry.accessibilityBand ||
          null,

        vocabLevel:
          entry.vocabLevel ||
          null,

        transparency:
          entry.transparency ||
          null,

        recommendedActivityUse:
          entry.recommendedActivityUse ||
          null,

        reviewCaution:
          entry.reviewCaution ||
          null
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
          `Name a new word containing ${label} that was not in the Word Hunt list. Use it in a sentence and explain what ${label} contributes.`,
        applyEducatorKey:
          `Open response. Verify that the new word genuinely contains ${label}, was not in the Word Hunt list, and that the student explains what ${label} contributes.`,
        applyWord: null,
        applyKind: "open-new-item",
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

    const applicability = activityApplicability(target, activity);

    if (!applicability.applicable) {
      return [];
    }

    if (activity === "hunt") {
      return makeHuntItems({
        target,
        gradeBand,
        vocabLevel,
        limit
      });
    }

    const meta = targetMeta(target);
    let candidates =
      candidatesFor({
        target,
        activity,
        gradeBand,
        vocabLevel
      }).filter(entry =>
        activity !== "build" ||
        Boolean(
          buildInteractionDetails(
            target,
            targetMeta(target),
            entry
          )
        )
      );

    /* FIRST_VOLO_IVE_WORD_PART_SEQUENCE_V1
       Curated Word Part recognition sequence:
       - creative is the first meaningful Notice example
       - sensitive stays in the selected recipe pool only so it can be
         reserved as the fresh Apply word and removed from Part A
       - active is the transparent act + -ive Connect example
       - constructive supports comparison
       - destructive is available for the 30-minute pattern set

       This ordering deliberately works with the duration resolver:
       10 min selects 2 recipes -> 1 Part A + sensitive Apply
       15 min selects 3 recipes -> 2 Part A + sensitive Apply
       30 min selects 5 recipes -> 4 Part A + sensitive Apply
    */
    const targetId =
      target?.id ||
      meta?.id ||
      null;

    if (
      activity === "morpheme" &&
      targetId === "ive"
    ) {
      const preferredOrder = [
        "creative",
        "sensitive",
        "active",
        "constructive",
        "destructive"
      ];

      const rank =
        new Map(
          preferredOrder.map(
            (word, index) => [
              word,
              index
            ]
          )
        );

      candidates =
        candidates
          .slice()
          .sort(
            (a, b) => {
              const aWord =
                normalize(a?.word);
              const bWord =
                normalize(b?.word);

              const aRank =
                rank.has(aWord)
                  ? rank.get(aWord)
                  : preferredOrder.length;

              const bRank =
                rank.has(bWord)
                  ? rank.get(bWord)
                  : preferredOrder.length;

              if (aRank !== bRank) {
                return aRank - bRank;
              }

              return String(
                a?.word || ""
              ).localeCompare(
                String(
                  b?.word || ""
                )
              );
            }
          );
    }

    const selected =
      candidates.slice(
        0,
        Math.max(1, Number(limit) || 1)
      );

    return selected.map((entry, index) => {
      const preferredApplyEntry =
        (
          activity === "morpheme" &&
          targetId === "ive"
        )
          ? (
              candidates.find(
                candidate =>
                  normalize(
                    candidate?.word
                  ) === "sensitive"
              ) ||
              null
            )
          : null;

      const applyEntry =
        (
          preferredApplyEntry &&
          normalize(
            preferredApplyEntry.word
          ) !==
          normalize(
            entry.word
          )
        )
          ? preferredApplyEntry
          : (
              candidates.find(
                candidate =>
                  normalize(candidate.word) !==
                    normalize(entry.word) &&
                  !(
                    window
                      .FirstVoloInstructionalWordSelector
                      ?.sameFreshnessFamily &&
                    window
                      .FirstVoloInstructionalWordSelector
                      .sameFreshnessFamily(
                        entry,
                        candidate
                      )
                  )
              ) ||
              null
            );

      const recipe =
        makeRecipe(
          activity,
          target,
          meta,
          entry,
          index,
          applyEntry
        );

      if (
        activity === "morpheme" &&
        targetId === "ive" &&
        normalize(
          recipe?.applyWord
        ) === "sensitive"
      ) {
        return {
          ...recipe,
          applyPriority: 100
        };
      }

      return recipe;
    });
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
    version: "teacher-session-item-bank-v6-activity-specific-apply",
    buildItems,
    auditTarget,
    activityApplicability,
    isProtected,
    targetVariants
  };
})();

/* ================================================================
   FIRST VOLO STRUCTURED RECIPE PROTECTION HARDENING

   Ordinary teacher materials may not expose protected whole words
   through actual recipe words, movable parts, or tiles.

   - Unsafe primary recipe -> exclude it.
   - Safe primary recipe with unsafe Apply -> keep primary recipe and
     replace Apply with a constrained open response.

   Prompt-language collisions are not treated as lexical exposure here.
   ================================================================ */
(function hardenStructuredRecipeProtection() {
  "use strict";

  const api =
    window.FirstVoloSessionItemBank;

  if (
    !api?.buildItems ||
    api.__structuredProtectionHardened
  ) {
    return;
  }

  const originalBuildItems =
    api.buildItems.bind(api);

  function normalizeWord(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[‐‑‒–—−]/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function isProtected(value) {
    const word =
      normalizeWord(value);

    if (!word) {
      return false;
    }

    return Boolean(
      window
        .FirstVoloInstructionalProtection
        ?.isProtected?.(
          word
        )
    );
  }

  function structuredValueHasProtected(
    value
  ) {
    if (
      typeof value ===
      "string"
    ) {
      return isProtected(
        value
      );
    }

    if (
      Array.isArray(value)
    ) {
      return value.some(
        structuredValueHasProtected
      );
    }

    if (
      value &&
      typeof value ===
        "object"
    ) {
      return Object.entries(
        value
      ).some(
        ([key, child]) => {
          if (
            [
              "word",
              "label",
              "text",
              "value",
              "answer"
            ].includes(
              key
            )
          ) {
            return (
              structuredValueHasProtected(
                child
              )
            );
          }

          if (
            Array.isArray(
              child
            ) ||
            (
              child &&
              typeof child ===
                "object"
            )
          ) {
            return (
              structuredValueHasProtected(
                child
              )
            );
          }

          return false;
        }
      );
    }

    return false;
  }

  function primaryRecipeIsUnsafe(
    recipe
  ) {
    return (
      structuredValueHasProtected(
        recipe?.word
      ) ||
      structuredValueHasProtected(
        recipe?.parts
      ) ||
      structuredValueHasProtected(
        recipe?.buildTiles
      )
    );
  }

  function applyRecipeIsUnsafe(
    recipe
  ) {
    return (
      structuredValueHasProtected(
        recipe?.applyWord
      ) ||
      structuredValueHasProtected(
        recipe?.applyParts
      ) ||
      structuredValueHasProtected(
        recipe?.applyBuildTiles
      )
    );
  }

  function openApply(
    recipe
  ) {
    return {
      ...recipe,

      applyKind:
        "open-new-item",

      applyWord:
        null,

      applyParts:
        [],

      applyBuildTiles:
        [],

      applyBuildSlots:
        [],

      applyPrompt:
        (
          "Give another real word containing the target word part " +
          "that was not used in this activity. Use the word in a " +
          "sentence and explain what the target contributes."
        ),

      applyEducatorKey:
        (
          "Open response. Verify that the student gives a different " +
          "real word containing the target, uses it in a sentence, " +
          "and explains what the target contributes."
        )
    };
  }

  api.buildItems =
    function protectedBuildItems(
      options = {}
    ) {
      const recipes =
        originalBuildItems(
          options
        ) || [];

      if (
        !window
          .FirstVoloInstructionalProtection
          ?.isProtected
      ) {
        return recipes;
      }

      const safeRecipes = [];

      for (
        const recipe of recipes
      ) {
        if (
          primaryRecipeIsUnsafe(
            recipe
          )
        ) {
          continue;
        }

        safeRecipes.push(
          applyRecipeIsUnsafe(
            recipe
          )
            ? openApply(
                recipe
              )
            : recipe
        );
      }

      return safeRecipes;
    };

  api.__structuredProtectionHardened =
    true;
})();

/* ================================================================
   FIRST VOLO VISIBLE PROMPT PROTECTION HARDENING

   Final ordinary-material protection boundary:
   - protected whole words may not appear in visible primary prompts
   - protected whole words may not appear in visible Apply prompts
   - unsafe primary recipe -> exclude
   - unsafe Apply prompt -> replace with constrained open Apply

   This runs after the structured word/part/tile protection layer.
   ================================================================ */
(function hardenVisiblePromptProtection() {
  "use strict";

  const api =
    window.FirstVoloSessionItemBank;

  if (
    !api?.buildItems ||
    api.__visiblePromptProtectionHardened
  ) {
    return;
  }

  const originalBuildItems =
    api.buildItems.bind(api);

  const PRIMARY_PROMPT_FIELDS =
    Object.freeze([
      "activityPrompt",
      "wordPrompt",
      "educatorKey",
      "contextPrompt",
      "sentencePrompt",
      "educatorDoes",
      "studentDoes"
    ]);

  const APPLY_PROMPT_FIELDS =
    Object.freeze([
      "applyPrompt",
      "applyEducatorKey",
      "followUpPrompt"
    ]);

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[‐‑‒–—−]/g, "-");
  }

  function tokens(text) {
    return (
      String(text || "")
        .toLowerCase()
        .match(
          /[a-z]+(?:['-][a-z]+)*/g
        ) ||
      []
    );
  }

  function isProtected(
    value
  ) {
    const wanted =
      normalize(
        value
      );

    if (!wanted) {
      return false;
    }

    return Boolean(
      window
        .FirstVoloInstructionalProtection
        ?.isProtected?.(
          wanted
        )
    );
  }

  function textHasProtected(
    value
  ) {
    if (
      typeof value !==
      "string"
    ) {
      return false;
    }

    return tokens(
      value
    ).some(
      isProtected
    );
  }

  function fieldsHaveProtected(
    recipe,
    fields
  ) {
    return fields.some(
      field =>
        textHasProtected(
          recipe?.[field]
        )
    );
  }

  function openApply(
    recipe
  ) {
    return {
      ...recipe,

      applyKind:
        "open-new-item",

      applyWord:
        null,

      applyParts:
        [],

      applyBuildTiles:
        [],

      applyBuildSlots:
        [],

      applyPrompt:
        (
          "Give another real word containing the target word part " +
          "that was not used in this activity. Use that word in a " +
          "sentence and explain what the target contributes."
        ),

      applyEducatorKey:
        (
          "Open response. Verify that the student gives a different " +
          "real word containing the target, uses it in a sentence, " +
          "and explains what the target contributes."
        ),

      followUpPrompt:
        null
    };
  }

  api.buildItems =
    function visibleProtectedBuildItems(
      options = {}
    ) {
      const recipes =
        originalBuildItems(
          options
        ) || [];

      if (
        !window
          .FirstVoloInstructionalProtection
          ?.isProtected
      ) {
        return recipes;
      }

      const safeRecipes = [];

      for (
        const recipe of
        recipes
      ) {
        if (
          fieldsHaveProtected(
            recipe,
            PRIMARY_PROMPT_FIELDS
          )
        ) {
          continue;
        }

        safeRecipes.push(
          fieldsHaveProtected(
            recipe,
            APPLY_PROMPT_FIELDS
          )
            ? openApply(
                recipe
              )
            : recipe
        );
      }

      return safeRecipes;
    };

  api.__visiblePromptProtectionHardened =
    true;
})();
