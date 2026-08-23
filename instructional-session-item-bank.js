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


  function studentFriendlyDefinition(entry) {
    return (
      entry?.studentFriendlyDefinition ||
      entry?.friendlyDefinition ||
      entry?.definition ||
      null
    );
  }


  function exampleAnswer(entry) {
    return (
      studentFriendlyDefinition(entry) ||
      entry?.literal ||
      null
    );
  }


  function familyRecipeForWord(word) {
    const wanted =
      normalize(word);

    if (!wanted) {
      return null;
    }

    const families =
      window
        .FirstVoloInstructionalMaterialFamilies
        ?.families ||
      {};

    for (
      const family of
      Object.values(families)
    ) {
      const recipe =
        asArray(
          family?.sessionRecipes
        ).find(
          item =>
            normalize(
              item?.word
            ) === wanted
        );

      if (recipe) {
        return recipe;
      }
    }

    return null;
  }


  function teachingContextDetails(entry) {
    if (!entry?.word) {
      return {
        sentence: null,
        cloze: null,
        source: null
      };
    }

    const familyRecipe =
      familyRecipeForWord(
        entry.word
      );

    const directContext =
      entry.studentFriendlyContext ||
      entry.teachingContext ||
      entry.contextSentence ||
      entry.exampleSentence ||
      entry.sentence ||
      null;

    const rawContext =
      directContext ||
      familyRecipe?.contextPrompt ||
      null;

    const explicitCloze =
      entry.clozeSupport ||
      entry.clozePrompt ||
      null;

    const contextHasBlank =
      /_{2,}/.test(
        String(rawContext || "")
      );

    const cloze =
      explicitCloze ||
      (
        contextHasBlank
          ? rawContext
          : null
      );

    const sentence =
      rawContext
        ? String(rawContext)
            .replace(
              /_{2,}/g,
              entry.word
            )
        : null;

    return {
      sentence,
      cloze,
      source:
        directContext
          ? "word-entry"
          : (
              familyRecipe?.contextPrompt
                ? "shared-material-family"
                : null
            )
    };
  }

  function preferredSupportSense(
    meaning,
    literal = ""
  ) {
    const choices =
      String(meaning || "")
        .split(/[;,]/)
        .map(value => value.trim())
        .filter(Boolean);

    if (!choices.length) {
      return "";
    }

    const literalText =
      String(literal || "")
        .toLowerCase();

    return (
      choices.find(
        choice =>
          literalText.includes(
            choice.toLowerCase()
          )
      ) ||
      choices[0]
    );
  }


  function segmentationPieceValidation(
    entry,
    target = null,
    meta = null
  ) {
    const selector =
      window
        .FirstVoloInstructionalWordSelector;

    if (
      selector
        ?.segmentationPieceValidation
    ) {
      return selector
        .segmentationPieceValidation(
          entry,
          target,
          meta
        );
    }

    return {
      valid:
        !String(
          entry?.segmentation ||
          ""
        ).trim(),
      parts: [],
      unsafeParts: []
    };
  }


  function instructionalSegmentation(
    entry,
    target = null,
    meta = null
  ) {
    if (!entry) {
      return null;
    }

    const raw =
      String(
        entry.segmentation ||
        ""
      ).trim();

    if (!raw) {
      return null;
    }

    return segmentationPieceValidation(
      entry,
      target,
      meta
    ).valid
      ? raw
      : null;
  }


  function nonTargetSupports(
    entry,
    target = null
  ) {
    if (!entry) {
      return [];
    }

    const explicit =
      asArray(
        entry.nonTargetSupports
      )
        .map(
          support => ({
            part:
              String(
                support?.part ||
                ""
              ).trim(),
            meaning:
              String(
                support?.meaning ||
                support?.function ||
                ""
              ).trim(),
            role:
              String(
                support?.role ||
                "word part"
              ).trim(),
            timing:
              support?.timing ||
              "after-independent-attempt",
            purpose:
              String(
                support?.purpose ||
                ""
              ).trim(),
            source:
              "configured-non-target-support"
          })
        )
        .filter(
          support =>
            support.part &&
            support.meaning
        );

    /*
      Generic teacher-led support may also be derived from an EXPLICIT,
      validated segmentation. This never guesses a morpheme from letters
      alone and therefore cannot turn an opaque/etymological chunk into a
      student-facing word part. Only morphemes already in the inventory are
      eligible, and the instructional target itself is excluded.
    */
    const firstSegmentation =
      String(
        entry.segmentation ||
        ""
      )
        .split(";")[0]
        .trim();

    const targetSet =
      new Set(
        targetVariants(
          target,
          targetMeta(target)
        )
      );

    const literal =
      entry.literal ||
      "";

    const derived =
      firstSegmentation
        ? firstSegmentation
            .split("+")
            .map(part => String(part || "").trim())
            .filter(Boolean)
            .flatMap(
              part => {
                const partForms =
                  variants(part);

                if (
                  partForms.some(
                    form =>
                      targetSet.has(form)
                  )
                ) {
                  return [];
                }

                const meta =
                  morphemeInventory()
                    .find(
                      item =>
                        variants(
                          item?.label
                        ).some(
                          form =>
                            partForms.includes(
                              form
                            )
                        )
                    );

                if (!meta?.meaning) {
                  return [];
                }

                return [{
                  part:
                    meta.label ||
                    part,
                  meaning:
                    preferredSupportSense(
                      meta.meaning,
                      literal
                    ),
                  role:
                    meta.type ||
                    meta.role ||
                    "word part",
                  timing:
                    "after-independent-attempt",
                  purpose:
                    "Supply only if this non-target morpheme is the barrier; keep the target reasoning as the student's job.",
                  source:
                    "validated-segmentation"
                }];
              }
            )
        : [];

    const seen =
      new Set();

    return [
      ...explicit,
      ...derived
    ].filter(
      support => {
        const key =
          variants(
            support.part
          )[0] ||
          normalize(
            support.part
          );

        if (
          !key ||
          seen.has(key)
        ) {
          return false;
        }

        seen.add(key);
        return true;
      }
    );
  }


  function nonTargetMeaningForPart(
    entry,
    part,
    target = null
  ) {
    const wanted =
      new Set(
        variants(
          part
        )
      );

    const support =
      nonTargetSupports(
        entry,
        target
      )
        .find(
          item =>
            variants(
              item.part
            )
              .some(
                value =>
                  wanted.has(
                    value
                  )
              )
        );

    return support?.meaning ||
      null;
  }

  function nonTargetSupportKey(
    entry,
    target = null
  ) {
    const supports =
      nonTargetSupports(
        entry,
        target
      );

    return supports.length
      ? (
          " If needed after the independent attempt, the educator may supply only this non-target information: " +
          supports
            .map(
              support =>
                `${support.part} = ${support.meaning}`
            )
            .join("; ") +
          ". Then retry the same item; the target reasoning remains the student's job."
        )
      : "";
  }

  function teachingSupportDetails(
    entry,
    target = null,
    meta = null
  ) {
    if (!entry?.word) {
      return null;
    }

    const label =
      target?.label ||
      meta?.label ||
      "the target word part";

    const targetMeaning =
      target?.meaning ||
      meta?.meaning ||
      null;

    const safeSegmentation =
      instructionalSegmentation(
        entry,
        target,
        meta
      );

    const literal =
      safeSegmentation
        ? (
            entry.literal ||
            null
          )
        : null;

    const definition =
      studentFriendlyDefinition(
        entry
      );

    const context =
      teachingContextDetails(
        entry
      );

    const supports =
      nonTargetSupports(
        entry,
        target
      );

    const targetSense =
      targetMeaning
        ? (
            literal
              ? preferredSupportSense(
                  targetMeaning,
                  literal
                )
              : String(
                  targetMeaning
                ).trim()
          )
        : null;

    const bridgeParts = [];

    for (const support of supports) {
      bridgeParts.push(
        `${support.part} = ${support.meaning}`
      );
    }

    if (
      targetSense &&
      label
    ) {
      bridgeParts.push(
        `${label} = ${targetSense}`
      );
    }

    const bridgeQuality =
      String(
        entry?.semanticBridgeQuality ||
        ""
      ).trim().toLowerCase();

    const bridgeCaution =
      String(
        entry?.reviewCaution ||
        ""
      );

    const bridgeAllowed =
      bridgeQuality !== "avoid" &&
      !/avoid|opaque|layered|not fully taught|recognition rather than|historical|etymolog|do not simplify/i.test(
        bridgeCaution
      );

    /*
      Fail closed for literal/compositional teaching bridges. A stored literal
      gloss is not automatically safe to show merely because the segmentation
      reconstructs. If the word's own review caution says the relationship is
      layered, opaque, historical, recognition-only, or otherwise unsuitable
      as a bridge, suppress the literal gloss itself as well as the composed
      semanticBridge. This keeps the same gate authoritative for every
      activity and renderer.
    */
    const exposedLiteral =
      bridgeAllowed
        ? literal
        : null;

    let semanticBridge = null;

    /*
      A decomposition may be linguistically accurate without being a useful
      student-facing explanation of the modern word. First Volo therefore
      surfaces a compositional bridge only when an explicit literal gloss has
      been validated and the item is not marked as a poor semantic bridge.
      It never labels leftover letters as a base or invents a literal gloss
      from historical pieces merely because segmentation exists.
    */
    if (exposedLiteral) {
      const lead =
        bridgeParts.length
          ? `${bridgeParts.join("; ")}. `
          : "";

      const wholeWord =
        definition
          ? ` Modern/student-friendly meaning: ${definition}.`
          : "";

      semanticBridge =
        `${lead}Literal meaning: “${exposedLiteral}.”${wholeWord}`;
    }

    return {
      word: entry.word,
      studentFriendlyDefinition:
        definition,
      literal:
        exposedLiteral,
      literalMeaning:
        exposedLiteral,
      segmentation:
        safeSegmentation,
      semanticBridge,
      semanticBridgeQuality:
        bridgeQuality || null,
      contextSentence:
        context.sentence,
      clozeSupport:
        context.cloze,
      contextSource:
        context.source,
      nonTargetSupports:
        supports.map(
          support => ({
            ...support
          })
        ),
      rules: {
        definitionUse:
          "Use the student-friendly whole-word meaning at the activity-specific access time. In Learn, Word Part, Use It, and context-driven Change It, whole-word meaning may be given before the target response because vocabulary knowledge is incidental. In Meaning, Figure It Out, Break It Apart, and Check Transfer, preserve the independent target demand before revealing information that would answer it.",
        contextUse:
          "Use context at the activity-specific time. Context may establish access before the target question when it does not answer the morphology reasoning; in Figure It Out and Check Transfer, context supports inference but the whole-word meaning remains withheld for the protected first attempt.",
        clozeUse:
          "Use the cloze only when sentence generation or word retrieval is the incidental barrier and the cloze does not answer the morphology target."
      }
    };
  }


  function changeTaskDetails(entry) {
    const task = entry?.changeTask;

    if (
      !task ||
      typeof task !== "object" ||
      !String(task.expectedWord || "").trim() ||
      !String(task.prompt || "").trim()
    ) {
      return null;
    }

    return {
      expectedWord: String(task.expectedWord).trim(),
      prompt: String(task.prompt).trim(),
      contextSentence: String(task.contextSentence || "").trim() || null,
      expectedMeaning: String(task.expectedMeaning || "").trim() || null,
      changeExplanation: String(task.changeExplanation || "").trim() || null
    };
  }

  function educatorPromptSteps(
    activity,
    target,
    meta,
    entry,
    { stage = "guided" } = {}
  ) {
    if (!entry?.word) return [];

    const label =
      target?.label ||
      meta?.label ||
      "the target word part";

    const meaning =
      target?.meaning ||
      meta?.meaning ||
      null;

    const teaching =
      teachingSupportDetails(
        entry,
        target,
        meta
      ) || {};

    const definition =
      teaching.studentFriendlyDefinition ||
      null;

    const context =
      teaching.contextSentence ||
      null;

    const cloze =
      teaching.clozeSupport ||
      null;

    const literal =
      teaching.literalMeaning ||
      null;

    const supports =
      asArray(
        teaching.nonTargetSupports
      );

    const supportText =
      supports
        .map(
          support =>
            `${support.part} means ${support.meaning}`
        )
        .join("; ");

    const steps = [];
    const add = (labelText, text, timing) => {
      const clean = String(text || "").trim();
      if (!clean) return;
      steps.push({
        label: labelText,
        text: clean,
        timing
      });
    };

    const addLiteralBridge = () => {
      if (!literal) return;

      const segmentation =
        String(entry?.segmentation || "").trim();

      add(
        "Teach",
        `${segmentation ? `${segmentation} gives` : "The meaningful parts give"} the literal idea “${literal}.”`,
        "after-target-response"
      );

      if (definition) {
        add(
          "Connect",
          `In everyday English, ${entry.word} means ${definition}.`,
          "after-target-response"
        );
      }
    };

    const retryText = (() => {
      switch (activity) {
        case "learn":
          return (
            `Ask the student to explain again how ${label} helps explain ${entry.word}. ` +
            "If the student states the target contribution with less or no added help, remove that support on the next example; if not, give the next level of help."
          );

        case "find":
          return (
            `Ask the student to find ${label} in ${entry.word} again without the highlight or comparison if possible, then tell what it contributes. ` +
            "If the student locates the target and explains its contribution with less help, remove that support on the next word; if not, give the next level of help."
          );

        case "meaning":
          return (
            `Ask again: What does ${label} mean, and how does that meaning show up in ${entry.word}? ` +
            "If the student retrieves the meaning and makes the connection with less help, remove the cue on the next item; if not, give the next level of help."
          );

        case "morpheme":
          return (
            `Ask again which part of ${entry.word} carries the meaning “${meaning || "the target meaning"}.” ` +
            `If the student retrieves ${label} with less help, remove the cue on the next item; if not, give the next level of help.`
          );

        case "break":
          return (
            `Have the student break ${entry.word} apart again and explain what ${label} contributes. ` +
            "If the student identifies the meaningful boundaries and target contribution with less help, remove that support on the next word; if not, give the next level of help."
          );

        case "infer":
          return (
            `Ask again what ${entry.word} probably means and how ${label} supports that inference. ` +
            "If the student uses the morphology to reach or refine the whole-word meaning with less help, fade the added non-target or context support on the next item; if not, give the next level of help."
          );

        case "build":
          return (
            `Have the student build the word again from the meaning goal and explain what ${label} contributes. ` +
            "If the student selects and combines the meaningful parts with less help, remove that support on the next build; if not, give the next level of help."
          );

        case "use":
          return (
            `Ask the student to use ${entry.word} again in a sentence that makes its meaning clear and explain what ${label} contributes. ` +
            "If the student uses the word accurately and explains the morphology with less help, remove the cloze, model, or morphology support on the next opportunity; if sentence generation alone remains the barrier, keep only the access support."
          );

        case "change":
          return (
            "Ask the student to choose the word-family form again in the same sentence and explain why it fits. " +
            "If the student selects the correct form and connects its morphology to the sentence role with less help, remove the grammatical or morphological cue on the next item; if not, give the next level of help."
          );

        default:
          return null;
      }
    })();

    const addRetry = () => {
      if (!retryText) return;

      add(
        "Then",
        retryText,
        "after-support"
      );
    };

    switch (activity) {
      case "learn":
        if (context) {
          add("Say", context, "teaching-setup");
        } else if (definition) {
          add("Say", `${entry.word} means ${definition}.`, "teaching-setup");
        }
        if (supportText) {
          add("If needed, say", `${supportText}.`, "teaching-setup");
        }
        add(
          "Ask",
          `How does ${label} help explain the meaning of ${entry.word}?`,
          "target-demand"
        );
        addLiteralBridge();
        addRetry();
        break;

      case "find":
        if (definition) {
          add("Say", `${entry.word} means ${definition}.`, "before-target-question-when-helpful");
        }
        add("Ask", `Find ${label} in ${entry.word}.`, "target-demand");
        if (supportText) {
          add("If needed, say", `${supportText}.`, "after-first-attempt");
        }
        add(
          "Ask",
          `What does ${label} contribute to the meaning of ${entry.word}?`,
          "after-location"
        );
        addLiteralBridge();
        addRetry();
        break;

      case "meaning":
        add("Ask", `What does ${label} mean?`, "independent-first-attempt");
        if (definition) {
          add("Then say", `${entry.word} means ${definition}.`, "after-target-response");
        }
        add(
          "Ask",
          `How does the meaning of ${label} show up in ${entry.word}?`,
          "after-target-response"
        );
        addLiteralBridge();
        addRetry();
        break;

      case "morpheme":
        if (context) {
          add("Say", context, "teaching-setup");
        } else if (definition) {
          add("Say", `${entry.word} means ${definition}.`, "teaching-setup");
        }
        if (supportText) {
          add("If needed, say", `${supportText}.`, "teaching-setup");
        }
        add(
          "Ask",
          `Which part of ${entry.word} carries the meaning “${meaning || "the target meaning"}”?`,
          "target-demand"
        );
        addLiteralBridge();
        addRetry();
        break;

      case "break":
        add(
          "Ask",
          `Break ${entry.word} into meaningful parts. Then explain what ${label} contributes.`,
          "independent-first-attempt"
        );
        if (supportText) {
          add("If needed, say", `${supportText}.`, "after-first-attempt");
        }
        addLiteralBridge();
        addRetry();
        break;

      case "infer":
        if (context) {
          add("Read", context, "context-before-inference");
        }
        add(
          "Ask",
          `What do you think ${entry.word} means here? How does ${label} help you figure it out?`,
          "independent-first-attempt"
        );
        if (supportText) {
          add("If needed, say", `${supportText}.`, "after-first-attempt");
        }
        addLiteralBridge();
        addRetry();
        break;

      case "build":
        add(
          "Ask",
          `Build the word from the meaning/build goal shown. Explain what ${label} contributes.`,
          "target-demand"
        );
        if (supportText) {
          add("If needed, say", `${supportText}.`, "when-non-target-piece-blocks-build");
        }
        addLiteralBridge();
        addRetry();
        break;

      case "use":
        if (definition) {
          add(
            "Say",
            `${entry.word} means ${definition}.`,
            "before-context-use"
          );
        }
        if (context) {
          add("Optional model/context", context, "before-context-use-when-helpful");
        }
        add(
          "Ask",
          `Use ${entry.word} in a sentence that makes that meaning clear. Then explain what ${label} contributes.`,
          "target-demand"
        );
        if (cloze) {
          add(
            "If sentence generation is the barrier, give",
            cloze,
            "after-first-sentence-attempt"
          );
        }
        if (supportText) {
          add("If needed, say", `${supportText}.`, "after-first-attempt");
        }
        addLiteralBridge();
        addRetry();
        break;

      case "change": {
        const change =
          changeTaskDetails(entry);

        if (definition) {
          add("Say", `${entry.word} means ${definition}.`, "teaching-setup");
        }
        if (change) {
          add("Ask", change.prompt, "target-demand");
          add(
            "Expected",
            `${change.expectedWord}${change.expectedMeaning ? ` — ${change.expectedMeaning}` : ""}.`,
            "educator-key"
          );
          if (change.changeExplanation) {
            add("Teach/review", change.changeExplanation, "after-response");
          }
        }
        addRetry();
        break;
      }

      default:
        break;
    }

    if (stage === "apply") {
      return steps.map(step => ({
        ...step,
        stage: "apply"
      }));
    }

    return steps;
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
              : nonTargetMeaningForPart(
                  entry,
                  part,
                  target
                ),
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
      studentFriendlyDefinition(
        entry
      );

    const compositionalGoal =
      entry?.literal ||
      definition ||
      null;

    if (compositionalGoal) {
      return {
        kind: "semantic-goal",
        prompt:
          `Build or say a real word containing ${label} whose meaningful parts give the idea ` +
          `“${compositionalGoal}”. Explain how the meaningful parts help with the word's meaning.`
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

    const teaching =
      teachingSupportDetails(
        entry,
        target,
        meta
      );

    const word =
      entry?.word ||
      "the word";

    switch (activity) {
      case "learn":
        return (
          `Look at ${word}. How does ${label} help explain the meaning of ${word}?`
        );

      case "find":
        return (
          `Find ${label} in ${word}. What does ${label} add to the meaning of the word?`
        );

      case "meaning":
        return (
          `What does ${label} mean? How does that meaning show up in ${word}?`
        );

      case "morpheme":
        return `Which word part means “${meaning}”?`;

      case "break":
        return (
          `Break ${word} into meaningful parts. Then explain what ${label} contributes.`
        );

      case "infer":
        return teaching?.contextSentence
          ? (
              `${teaching.contextSentence} What do you think ${word} means here? ` +
              `How does ${label} help you figure it out?`
            )
          : (
              `What do you think ${word} means? How does ${label} help you figure it out?`
            );

      case "build":
        return buildPromptDetails(
          target,
          meta,
          entry
        ).prompt;

      case "use":
        return (
          `Use ${word} in a sentence that makes its meaning clear. ` +
          `Then explain what ${label} adds to the meaning of the word.`
        );

      case "change": {
        const change =
          changeTaskDetails(entry);

        return change
          ? change.prompt
          : `No validated context-driven Change It task is available for ${word}.`;
      }

      default:
        return `Work with ${word} and explain what ${label} contributes.`;
    }
  }


  function teacherDirectionFor(
    activity,
    target,
    meta,
    entry
  ) {
    const steps =
      educatorPromptSteps(
        activity,
        target,
        meta,
        entry
      );

    if (!steps.length) {
      return "Let the student attempt the target demand first. Use only the least support needed, retry the same demand, then fade support.";
    }

    return steps
      .filter(step => step.label !== "Expected")
      .map(
        step => {
          const label =
            step.label === "Teach/review"
              ? "Review"
              : step.label === "Retry"
                ? "Then"
                : step.label;

          return `${label}: ${step.text}`;
        }
      )
      .join(" ");
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

      case "break": {
        const segmentation =
          instructionalSegmentation(
            entry,
            target,
            meta
          );

        return segmentation
          ? `${entry.word}: ${segmentation}`
          : `${entry.word}: use a different Break It Apart item with an approved word-part analysis.`;
      }

      case "infer":
        return (
          `${entry.word}: ${exampleAnswer(entry) || "Use the inventory meaning and the known morphology; accept a reasonable inference."}` +
          nonTargetSupportKey(
            entry,
            target
          )
        );

      case "build": {
        const details =
          buildPromptDetails(target, meta, entry);

        if (details.kind === "open-production") {
          return (
            `Open response. Accept a real word that genuinely contains ${label} ` +
            `and a correct explanation of what ${label} contributes.`
          );
        }

        const segmentation =
          instructionalSegmentation(
            entry,
            target,
            meta
          );

        const teaching =
          teachingSupportDetails(
            entry,
            target,
            meta
          );

        return (
          `Expected word: ${entry.word}` +
          `${segmentation ? ` (${segmentation})` : ""}.` +
          `${teaching?.literalMeaning ? ` Parts-based meaning: ${teaching.literalMeaning}.` : ""}` +
          `${studentFriendlyDefinition(entry) ? ` Student-friendly whole-word meaning: ${studentFriendlyDefinition(entry)}.` : ""}`
        );
      }

      case "use":
        return `Target word: ${entry.word}${exampleAnswer(entry) ? ` — ${exampleAnswer(entry)}` : ""}.`;

      case "change": {
        const change =
          changeTaskDetails(entry);

        return change
          ? (
              `Expected form: ${change.expectedWord}. ` +
              `${change.changeExplanation || `Verify the morphological change and the contribution of ${label}.`}`
            )
          : `No validated context-driven Change It task is available for ${entry.word}.`;
      }

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

      const applyTeaching =
        teachingSupportDetails(
          applyEntry,
          target,
          meta
        );

      const applySegmentation =
        instructionalSegmentation(
          applyEntry,
          target,
          meta
        );

      switch (activity) {
        case "learn":
          return {
            kind:
              "specific-new-item",
            word,
            prompt:
              `Look at the new example ${word}. What does ${label} mean, and how does it help explain the meaning of ${word}?`,
            educatorKey:
              `${label}${meaning ? ` = ${meaning}` : ""}; Apply example: ${word}.`,
            segmentation:
              applySegmentation
          };

        case "find":
          return {
            kind:
              "specific-new-item",
            word,
            prompt:
              `Find ${label} in ${word}. How does ${label} connect to the meaning of the whole word?`,
            educatorKey:
              `${word} contains ${label}.`,
            segmentation:
              applySegmentation
          };

        case "meaning":
          return {
            kind:
              "specific-new-item",
            word,
            prompt:
              `In ${word}, what does ${label} mean? How does that meaning contribute to the whole word?`,
            educatorKey:
              `${label}${meaning ? ` = ${meaning}` : ""}; Apply example: ${word}.`,
            segmentation:
              applySegmentation
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
                    `Present the meaning without naming the word part: “${meaning}.” Ask the student to name the word part. After the student responds, reveal ${word}. Ask the student to find ${label} in ${word} and explain what ${label} contributes to the whole-word meaning. If the whole-word meaning or a non-target morpheme is the barrier, supply only that non-target information and retry the same meaning connection. Do not show or say ${word} before the student retrieves the target.`
                  )
                : (
                    `Ask the student to name the target word part. After the student responds, reveal ${word}. Ask the student to find ${label} in ${word} and explain what it contributes to the whole-word meaning. If a non-target morpheme is the barrier, supply only that non-target information and retry. Do not show or say ${word} before the student retrieves the target.`
                  ),
            educatorKey:
              `Expected word part: ${label}. Fresh word: ${word}. ${label}${meaning ? ` = ${meaning}` : ""}.` +
              nonTargetSupportKey(
                applyEntry,
                target
              ),
            segmentation:
              applySegmentation
          };

        case "break":
          return {
            kind:
              "specific-new-item",
            word,
            prompt:
              `Break ${word} into meaningful parts. Then explain what ${label} contributes.`,
            educatorKey:
              applySegmentation
                ? `${word}: ${applySegmentation}`
                : (
                    `${word}: use a different Break It Apart item with an approved word-part analysis.`
                  ),
            segmentation:
              applySegmentation
          };

        case "infer":
          return {
            kind:
              "specific-new-item",
            word,
            prompt:
              applyTeaching?.contextSentence
                ? (
                    `${applyTeaching.contextSentence} What do you think ${word} means here? ` +
                    `How does ${label} help you figure it out?`
                  )
                : (
                    `What do you think ${word} means? How does ${label} help you figure it out?`
                  ),
            educatorKey:
              `${word}: ${exampleAnswer(applyEntry) || "Accept a reasonable morphology-based inference supported by the known target."}`,
            segmentation:
              applySegmentation
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
                `${applySegmentation ? ` (${applySegmentation})` : ""}.` +
                `${applyTeaching?.literalMeaning ? ` Parts-based meaning: ${applyTeaching.literalMeaning}.` : ""}` +
                `${studentFriendlyDefinition(applyEntry) ? ` Student-friendly whole-word meaning: ${studentFriendlyDefinition(applyEntry)}.` : ""}`,
              segmentation:
                applySegmentation
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
              `Use ${word} in a new sentence that shows its meaning. Then explain what ${label} adds to the word's meaning.`,
            educatorKey:
              `Target word: ${word}. Verify an appropriate sentence and a correct explanation of ${label}.`,
            segmentation:
              applySegmentation
          };

        case "change": {
          const change =
            changeTaskDetails(
              applyEntry
            );

          if (change) {
            return {
              kind:
                "specific-new-item",
              word:
                change.expectedWord,
              prompt:
                change.prompt,
              educatorKey:
                `Expected form: ${change.expectedWord}. ${change.changeExplanation || "Verify the context-driven family change."}`,
              segmentation:
                applyEntry.segmentation ||
                null
            };
          }

          return {
            kind: "unavailable",
            word: null,
            prompt: `No fresh context-driven Change It task is available for this target today.`,
            educatorKey: `Do not substitute an open-ended family-generation task.`,
            segmentation: null
          };
        }

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
            "unavailable",
          word:
            null,
          prompt:
            "No system-selected fresh Word Part example is available for this target today. Do not substitute an unplanned word.",
          educatorKey:
            `No fresh Word Part Apply item is available. Expected target word part remains ${label}.`,
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
            "unavailable",
          word:
            null,
          prompt:
            `No fresh system-selected Use It word is available for this target today.`,
          educatorKey:
            `Use It requires First Volo to supply the target word; do not turn this into a student vocabulary-generation task.`,
          segmentation:
            null
        };

      case "change":
        return {
          kind: "unavailable",
          word: null,
          prompt: `No validated context-driven Change It task is available for this target today.`,
          educatorKey: `Change It requires a system-generated context that demands a specific related form.`,
          segmentation: null
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
      studentFriendlyDefinition(
        entry
      );

    const teachingSupport =
      teachingSupportDetails(
        entry,
        target,
        meta
      );

    const safeSegmentation =
      instructionalSegmentation(
        entry,
        target,
        meta
      );

    const applyTeachingSupport =
      teachingSupportDetails(
        applyEntry,
        target,
        meta
      );

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

      teacherDirection:
        teacherDirectionFor(
          activity,
          target,
          meta,
          entry
        ),

      educatorPrompts:
        educatorPromptSteps(
          activity,
          target,
          meta,
          entry
        ),

      applyEducatorPrompts:
        educatorPromptSteps(
          activity,
          target,
          meta,
          applyEntry,
          { stage: "apply" }
        ),

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

      applyDefinition:
        studentFriendlyDefinition(
          applyEntry
        ),

      applyStudentFriendlyDefinition:
        applyTeachingSupport
          ?.studentFriendlyDefinition ||
        null,

      applyContextSentence:
        applyTeachingSupport
          ?.contextSentence ||
        null,

      applyClozeSupport:
        applyTeachingSupport
          ?.clozeSupport ||
        null,

      applySemanticBridge:
        applyTeachingSupport
          ?.semanticBridge ||
        null,

      applyLiteral:
        applyTeachingSupport
          ?.literalMeaning ||
        null,

      applySource:
        applyEntry?.instructionalSource ||
        (
          applyEntry?._teacherLedExtension
            ? "teacher-word-extension"
            : (
                applyEntry
                  ? "master-word-inventory"
                  : null
              )
        ),

      applyTeacherLedOnly:
        Boolean(
          applyEntry?.teacherLedOnly ||
          applyEntry?._teacherLedExtension
        ),

      applyNonTargetSupports:
        nonTargetSupports(
          applyEntry,
          target
        ),

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

      studentFriendlyDefinition:
        teachingSupport
          ?.studentFriendlyDefinition ||
        null,

      literalMeaning:
        teachingSupport
          ?.literalMeaning ||
        null,

      contextSentence:
        teachingSupport
          ?.contextSentence ||
        null,

      clozeSupport:
        teachingSupport
          ?.clozeSupport ||
        null,

      semanticBridge:
        teachingSupport
          ?.semanticBridge ||
        null,

      teachingSupportRules:
        teachingSupport
          ?.rules ||
        null,

      segmentation:
        safeSegmentation,

      mode:
        (
          activity === "build" &&
          buildInteraction
        )
          ? "build"
          : "prompt",

      source:
        entry?.instructionalSource ||
        (
          entry?._teacherLedExtension
            ? "teacher-word-extension"
            : "master-word-inventory"
        ),

      teacherLedOnly:
        Boolean(
          entry?.teacherLedOnly ||
          entry?._teacherLedExtension
        ),

      nonTargetSupports:
        nonTargetSupports(
          entry,
          target
        ),

      changeTask:
        changeTaskDetails(entry),

      applyChangeTask:
        changeTaskDetails(applyEntry),

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
          null,

        instructionalSource:
          entry?.instructionalSource ||
          (
            entry?._teacherLedExtension
              ? "teacher-word-extension"
              : "master-word-inventory"
          ),

        teacherLedOnly:
          Boolean(
            entry?.teacherLedOnly ||
            entry?._teacherLedExtension
          )
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
          `Name a new word containing ${label} that was not in the Word Hunt list. Use it in a sentence and explain what ${label} contributes. If word retrieval is the only barrier, the educator may give a context sentence, cloze, or sentence starter that points to a valid example without answering the morphology decision.`,
        applyEducatorKey:
          `Open response. Verify that the new word genuinely contains ${label}, was not in the Word Hunt list, and that the student explains what ${label} contributes. A cloze/context clue is access support only when word retrieval would otherwise compete with the target recognition/generalization demand.`,
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


  function lexicalFamilyKey(entry, target, meta = null) {
    const explicit =
      entry?.freshnessFamily ||
      entry?.lemma ||
      entry?.lexeme ||
      entry?.baseForm ||
      null;

    if (explicit) {
      return normalize(explicit);
    }

    const targetSet =
      new Set(
        targetVariants(
          target,
          meta
        )
      );

    const parts =
      firstSegmentationParts(
        entry
      );

    const lexicalAnchor =
      parts.find(
        part => {
          const forms =
            variants(part);

          if (
            forms.some(
              form => targetSet.has(form)
            )
          ) {
            return false;
          }

          const raw =
            String(part || "").trim();

          if (
            raw.startsWith("-") ||
            raw.endsWith("-")
          ) {
            return false;
          }

          return raw.length > 1;
        }
      );

    return normalize(
      lexicalAnchor ||
      entry?.word ||
      ""
    );
  }

  function prioritizeLexicalDiversity(
    candidates,
    target,
    meta = null
  ) {
    const unique = [];
    const repeats = [];
    const seen = new Set();

    for (const entry of candidates) {
      const key =
        lexicalFamilyKey(
          entry,
          target,
          meta
        );

      if (!key || !seen.has(key)) {
        unique.push(entry);
        if (key) seen.add(key);
      } else {
        repeats.push(entry);
      }
    }

    return [
      ...unique,
      ...repeats
    ];
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
      }).filter(entry => {
        if (
          activity === "build" &&
          !buildInteractionDetails(
            target,
            targetMeta(target),
            entry
          )
        ) {
          return false;
        }

        if (activity === "change") {
          const change =
            changeTaskDetails(entry);

          if (
            !change ||
            isProtected(
              change.expectedWord
            )
          ) {
            return false;
          }
        }

        return true;
      });

    candidates =
      prioritizeLexicalDiversity(
        candidates,
        target,
        targetMeta(target)
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

      applyDefinition:
        null,

      applyStudentFriendlyDefinition:
        null,

      applyLiteral:
        null,

      applyContextSentence:
        null,

      applyClozeSupport:
        null,

      applySemanticBridge:
        null,

      applyNonTargetSupports:
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

      applyDefinition:
        null,

      applyStudentFriendlyDefinition:
        null,

      applyLiteral:
        null,

      applyContextSentence:
        null,

      applyClozeSupport:
        null,

      applySemanticBridge:
        null,

      applyNonTargetSupports:
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
