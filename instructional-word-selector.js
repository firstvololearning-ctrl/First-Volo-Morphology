"use strict";

/*
  First Volo Morphology
  Instructional Word Selector v1

  One generic authority for:
  objective fit -> linguistic accuracy -> age accessibility ->
  target transparency/supportability -> stage/freshness/protection.

  No target-specific branch belongs in this file.
*/

(function initializeFirstVoloInstructionalWordSelector() {
  const VERSION =
    "instructional-word-selector-v1";

  function asArray(value) {
    return Array.isArray(value)
      ? value
      : [];
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[‐‑‒–—−]/g, "-")
      .replace(/\s+/g, "")
      .replace(/^-+|-+$/g, "");
  }

  function cleanSurface(value) {
    return normalize(value)
      .replace(/[()]/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  function variants(value) {
    return String(value || "")
      .split(/(?:->|→|\/|,)/)
      .map(normalize)
      .filter(Boolean);
  }

  function bandRank(value) {
    const text =
      String(value || "");

    if (/2\s*-\s*3/.test(text)) return 1;
    if (/4\s*-\s*5/.test(text)) return 2;
    if (/6\s*-\s*8/.test(text)) return 3;
    return 99;
  }

  function vocabRank(value) {
    const text =
      String(value || "")
        .trim()
        .toLowerCase();

    if (
      text === "familiar" ||
      text === "everyday"
    ) return 1;

    if (
      text === "general" ||
      text === "core"
    ) return 2;

    if (
      text === "academic" ||
      text === "specialized"
    ) return 3;

    return 2;
  }

  /*
    Teacher-led vocabulary SELECTION progression.
    Keep this separate from vocabRank(), which also feeds the existing
    accessibility/scoring model. This pass corrects the selection ceiling
    without silently changing accessibility categories at the same time.
  */
  function selectionVocabRank(value) {
    const text =
      String(value || "")
        .trim()
        .toLowerCase();

    if (
      text === "familiar" ||
      text === "everyday"
    ) return 1;

    if (
      text === "academic" ||
      text === "general" ||
      text === "core"
    ) return 2;

    if (
      text === "challenge" ||
      text === "specialized"
    ) return 3;

    return 2;
  }


  function nextHarderVocabularyLevel(value) {
    const text =
      String(value || "")
        .trim()
        .toLowerCase();

    /*
      Preserve the corrected ceiling:
      Familiar -> Familiar only.
      Academic -> Familiar + Academic.
      Challenge -> Familiar + Academic + Challenge.

      The only fallback needed to preserve a previously available guided
      context after correcting the old ordering is Academic -> Challenge.
    */
    if (
      text === "academic" ||
      text === "general" ||
      text === "core"
    ) {
      return "challenge";
    }

    return null;
  }


  function transparencyRank(value) {
    const text =
      String(value || "")
        .trim()
        .toLowerCase();

    if (text === "high") return 3;
    if (text === "medium") return 2;
    if (text === "low") return 1;
    return 2;
  }

  function extensionApi() {
    return (
      window
        .FirstVoloTeacherWordExtensions ||
      null
    );
  }

  function nonTargetSupports(item) {
    return asArray(
      item?.nonTargetSupports
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
            ).trim()
        })
      )
      .filter(
        support =>
          support.part &&
          support.meaning
      );
  }

  function nonTargetSupportPreservesTarget(
    item,
    target,
    meta = null
  ) {
    const targetSet =
      new Set(
        targetForms(
          target,
          meta
        )
      );

    return nonTargetSupports(
      item
    ).every(
      support =>
        !variants(
          support.part
        )
          .map(cleanSurface)
          .some(
            form =>
              form &&
              targetSet.has(
                form
              )
          )
    );
  }

  function nonTargetSupportLine(
    item
  ) {
    const supports =
      nonTargetSupports(
        item
      );

    if (!supports.length) {
      return null;
    }

    return (
      "If needed after the independent attempt, supply only the non-target information: " +
      supports
        .map(
          support =>
            `${support.part} = ${support.meaning}`
        )
        .join("; ") +
      ". Then retry the same item while keeping the target reasoning as the student's job."
    );
  }

  function targetForms(
    target,
    meta = null
  ) {
    const aliases =
      extensionApi()
        ?.aliasesForTarget?.(
          target ||
          meta
        ) ||
      [];

    return [
      ...new Set([
        ...variants(target?.id),
        ...variants(target?.label),
        ...variants(target?.target),
        ...variants(meta?.id),
        ...variants(meta?.label),
        ...aliases.flatMap(variants)
      ])
    ]
      .map(cleanSurface)
      .filter(Boolean);
  }


  function targetSurfaceInWord(
    item,
    target,
    meta = null
  ) {
    const word =
      cleanSurface(
        item?.word
      );

    const explicit =
      cleanSurface(
        item?.targetSurfaceForm
      );

    if (
      explicit &&
      word.includes(
        explicit
      )
    ) {
      return explicit;
    }

    return (
      targetForms(
        target,
        meta
      )
        .slice()
        .sort(
          (a, b) =>
            b.length -
            a.length
        )
        .find(
          form =>
            form &&
            word.includes(
              form
            )
        ) ||
      null
    );
  }


  function wordFormationInfo(
    item
  ) {
    const raw =
      item?.wordFormation;

    if (
      !raw ||
      typeof raw !==
        "object"
    ) {
      return null;
    }

    const baseForm =
      String(
        raw.baseForm ||
        ""
      ).trim();

    const suffix =
      String(
        raw.suffix ||
        ""
      ).trim();

    const wordSum =
      String(
        raw.wordSum ||
        ""
      ).trim();

    const spellingChange =
      String(
        raw.spellingChange ||
        ""
      ).trim();

    const teachingNote =
      String(
        raw.teachingNote ||
        ""
      ).trim();

    if (
      !baseForm ||
      !wordSum
    ) {
      return null;
    }

    return {
      baseForm,
      suffix,
      wordSum,
      spellingChange,
      teachingNote
    };
  }


  function freshnessKey(
    item
  ) {
    return cleanSurface(
      item?.freshnessFamily ||
      item?.lemma ||
      item?.lexeme ||
      item?.baseForm ||
      item?.word ||
      ""
    );
  }


  function sameFreshnessFamily(
    left,
    right
  ) {
    const leftKey =
      freshnessKey(
        left
      );

    const rightKey =
      freshnessKey(
        right
      );

    return Boolean(
      leftKey &&
      rightKey &&
      leftKey === rightKey
    );
  }

  function segmentationParts(item) {
    const raw =
      String(
        item?.segmentation ||
        ""
      )
        .split(";")[0]
        .trim();

    if (!raw) return [];

    return raw
      .split(/\s*\+\s*/)
      .map(
        part =>
          String(part || "")
            .trim()
      )
      .filter(Boolean);
  }

  function itemMorphemeForms(item) {
    return asArray(
      item?.morphemes
    )
      .flatMap(variants)
      .map(cleanSurface)
      .filter(Boolean);
  }
  const SENSE_DISAMBIGUATED_TARGET_IDS = new Set([
    "er-more",
    "er-or",
    "un-negation",
    "un-reversative",
    "ly-adverb",
    "ly-adjective",
    "ant-ent-agent",
    "ant-ent-adjective",
    "negative-in-family",
    "location-in-family"
  ]);

  function targetSenseCompatible(item, target, meta = null) {
    const targetId = String(
      target?.id ||
      target?.targetId ||
      meta?.id ||
      ""
    ).trim();

    if (!SENSE_DISAMBIGUATED_TARGET_IDS.has(targetId)) {
      return true;
    }

    const explicit = asArray(item?.targetSenseIds)
      .map(value => String(value || "").trim())
      .filter(Boolean);

    if (explicit.length) {
      return explicit.includes(targetId);
    }

    const extensionTargetId = String(
      item?._teacherLedExtensionTargetId ||
      ""
    ).trim();

    if (extensionTargetId) {
      return extensionTargetId === targetId;
    }

    /*
      Same spelling is not enough for ambiguous morphemes.
      Untagged -er and in-/im- words are rejected until their sense is
      explicitly validated, preventing writer from serving comparative -er
      or impossible from serving locative in-.
    */
    return false;
  }

  function targetRelationship(
    item,
    target,
    meta = null
  ) {
    if (!targetSenseCompatible(item, target, meta)) {
      return {
        matched: false,
        form: null,
        source: "sense-mismatch"
      };
    }

    const forms =
      new Set(
        targetForms(
          target,
          meta
        )
      );

    if (!forms.size) {
      return {
        matched: false,
        form: null,
        source: null
      };
    }

    const visibleForm =
      targetSurfaceInWord(
        item,
        target,
        meta
      );

    for (
      const form
      of itemMorphemeForms(item)
    ) {
      if (forms.has(form)) {
        return {
          matched: true,
          form:
            visibleForm ||
            form,
          source: "morphemes"
        };
      }
    }

    for (
      const part
      of segmentationParts(item)
    ) {
      const clean =
        cleanSurface(part);

      if (forms.has(clean)) {
        return {
          matched: true,
          form:
            visibleForm ||
            clean,
          source: "segmentation"
        };
      }
    }

    return {
      matched: false,
      form: null,
      source: null
    };
  }


  function segmentationPartDisplaySafe(
    rawPart,
    item,
    target,
    meta = null
  ) {
    const raw =
      String(rawPart || "")
        .trim()
        .toLowerCase()
        .replace(/[‐‑‒–—−]/g, "-");

    if (!raw) return false;

    const clean =
      cleanSurface(raw);

    if (!clean) return false;

    if (
      targetForms(target, meta)
        .includes(clean)
    ) {
      return true;
    }

    /*
      A displayed non-target morpheme must be explicitly authored for this
      word. Merely sharing a spelling with some morpheme elsewhere in the
      program is not enough to validate the analysis of this item.
    */
    if (
      itemMorphemeForms(item)
        .includes(clean)
    ) {
      return true;
    }

    const isExplicitSupportedPart =
      nonTargetSupports(item)
        .some(
          support =>
            variants(
              support.part
            )
              .map(cleanSurface)
              .includes(clean)
        );

    if (isExplicitSupportedPart) {
      return true;
    }

    /*
      A free lexical base may be displayed when that exact base is itself an
      authored word in the shared inventory. This validates true bases such
      as structure in superstructure without promoting residual strings such
      as ure, -ical, -ation, or spelling notation into meaningful pieces.
    */
    const isKnownWholeWord =
      asArray(
        window
          .FIRST_VOLO_WORD_INVENTORY
      )
        .some(
          entry =>
            cleanSurface(
              entry?.word
            ) === clean
        );

    if (isKnownWholeWord) {
      return true;
    }

    /*
      High-quality teacher extensions are separately authored and may carry
      a validated compositional analysis even when a lexical base is not a
      regular student-practice inventory entry.
    */
    if (
      (
        item?._teacherLedExtension ||
        item?.instructionalSource ===
          "teacher-word-extension"
      ) &&
      String(
        item?.semanticBridgeQuality ||
        ""
      )
        .trim()
        .toLowerCase() ===
        "high"
    ) {
      return true;
    }

    return false;
  }


  function segmentationPieceValidation(
    item,
    target,
    meta = null
  ) {
    const parts =
      segmentationParts(item);

    if (!parts.length) {
      return {
        valid: false,
        parts: [],
        unsafeParts: []
      };
    }

    const unsafeParts =
      parts.filter(
        part =>
          !segmentationPartDisplaySafe(
            part,
            item,
            target,
            meta
          )
      );

    return {
      valid:
        unsafeParts.length === 0,
      parts,
      unsafeParts
    };
  }

  function fullSegmentationInfo(
    item,
    target,
    meta = null
  ) {
    const word =
      cleanSurface(
        item?.word
      );

    const parts =
      segmentationParts(item);

    const cleanParts =
      parts
        .map(cleanSurface)
        .filter(Boolean);

    const forms =
      new Set(
        targetForms(
          target,
          meta
        )
      );

    const targetIndex =
      cleanParts.findIndex(
        part =>
          forms.has(part)
      );

    const reconstructs =
      Boolean(
        word &&
        cleanParts.length >= 2 &&
        cleanParts.join("") ===
          word
      );

    const pieceValidation =
      segmentationPieceValidation(
        item,
        target,
        meta
      );

    const allPartsDisplaySafe =
      pieceValidation.valid;

    return {
      valid:
        reconstructs &&
        targetIndex >= 0 &&
        allPartsDisplaySafe,
      word,
      parts,
      cleanParts,
      targetIndex,
      allPartsDisplaySafe,
      targetForm:
        targetIndex >= 0
          ? cleanParts[
              targetIndex
            ]
          : null,
      otherParts:
        targetIndex >= 0
          ? parts.filter(
              (_, index) =>
                index !==
                targetIndex
            )
          : []
    };
  }

  function cautionText(item) {
    return String(
      item?.reviewCaution ||
      item?.caution ||
      ""
    )
      .trim()
      .toLowerCase();
  }

  function fullSegmentationCautionBlocks(
    item
  ) {
    return (
      /opaque|false morph|do not break|avoid break|not a clean segmentation|lexicalized|do not teach.*productive|layered|too complex|do not present as a simple|recognition rather than a simple/.test(
        cautionText(item)
      )
    );
  }

  function inferenceCautionBlocks(
    item
  ) {
    return (
      /avoid independent|do not infer|not for infer|opaque|false morph/.test(
        cautionText(item)
      )
    );
  }

  function accessibilityInfo({
    item,
    gradeBand,
    stage,
    objective
  }) {
    const current =
      bandRank(
        gradeBand
      );

    const access =
      bandRank(
        item?.accessibilityBand ||
        item?.practiceBand ||
        item?.gradeBand ||
        ""
      );

    const practice =
      bandRank(
        item?.practiceBand ||
        item?.gradeBand ||
        item?.accessibilityBand ||
        ""
      );

    const accessOkay =
      current === 99 ||
      access === 99 ||
      access <= current;

    const independentDemand =
      stage === "apply" ||
      objective === "build" ||
      objective === "infer";

    const practiceOkay =
      !independentDemand ||
      current === 99 ||
      practice === 99 ||
      practice <= current;

    const vocab =
      vocabRank(
        item?.vocabLevel
      );

    const hasPlainMeaning =
      Boolean(
        item?.studentFriendlyDefinition ||
        item?.definition ||
        item?.literal
      );

    /* FIRST_VOLO_TEACHER_LED_COMPOSITIONAL_ACCESS_V1
       Teacher-led instruction is not limited to words that already have a
       stored dictionary-style definition. A validated explicit segmentation
       can itself provide fair teaching access because the system can show or
       supply non-target information while preserving the target reasoning.

       Recognition/form-retrieval activities also do not require independent
       whole-word vocabulary knowledge before the target can be practiced.
    */
    const meaningCanBeTaughtFromStructure =
      Boolean(
        item?.segmentation ||
        item?.wordFormation?.wordSum
      );

    const wholeWordMeaningIsIncidental =
      [
        "find",
        "hunt",
        "meaning",
        "morpheme"
      ].includes(
        objective
      );

    const hasTeacherLedAccess =
      hasPlainMeaning ||
      meaningCanBeTaughtFromStructure ||
      wholeWordMeaningIsIncidental;

    let category =
      "D";

    if (
      accessOkay &&
      practiceOkay
    ) {
      if (vocab <= 1) {
        category = "A";
      } else if (
        vocab === 2
      ) {
        category = "B";
      } else if (
        hasTeacherLedAccess
      ) {
        category = "C";
      }
    }

    return {
      accessOkay,
      practiceOkay,
      category,
      accessRank:
        access,
      practiceRank:
        practice,
      vocabRank:
        vocab,
      hasPlainMeaning,
      hasTeacherLedAccess,
      meaningCanBeTaughtFromStructure,
      wholeWordMeaningIsIncidental
    };
  }

  function vocabularyAllows(
    item,
    vocabularyLevel
  ) {
    const requested =
      String(
        vocabularyLevel ||
        ""
      )
        .trim()
        .toLowerCase();

    if (
      !requested ||
      requested === "all" ||
      requested === "any"
    ) {
      return true;
    }

    return (
      selectionVocabRank(
        item?.vocabLevel
      ) <=
      selectionVocabRank(
        requested
      )
    );
  }

  function flightAllows(
    item,
    flight
  ) {
    const current =
      String(
        flight ||
        ""
      )
        .trim()
        .toUpperCase();

    const itemFlight =
      String(
        item?.flight ||
        item?.practiceFlight ||
        ""
      )
        .trim()
        .toUpperCase();

    return (
      !current ||
      !itemFlight ||
      current === itemFlight
    );
  }
  function recommendationAllows(
    item,
    objective,
    stage,
    demand
  ) {
    const activities =
      asArray(
        item?.activities
      );

    const guidedBreakNonFull =
      objective === "break" &&
      stage !== "apply" &&
      (
        demand ===
          "target-recognition" ||
        demand ===
          "form-change"
      );

    if (activities.length) {
      if (
        activities.includes(
          objective
        )
      ) {
        return true;
      }

      if (
        guidedBreakNonFull &&
        activities.some(
          value =>
            [
              "find",
              "hunt",
              "meaning",
              "morpheme",
              "use"
            ].includes(value)
        )
      ) {
        return true;
      }

      return false;
    }

    const text =
      String(
        item?.recommendedActivityUse ||
        ""
      )
        .trim()
        .toLowerCase();

    if (!text) {
      return true;
    }

    if (
      text.includes(
        "full practice"
      )
    ) {
      return true;
    }

    const tokens = {
      learn: [
        "learn"
      ],
      find: [
        "find"
      ],
      hunt: [
        "word hunt",
        "hunt"
      ],
      meaning: [
        "meaning"
      ],
      morpheme: [
        "word part"
      ],
      break: [
        "break it apart",
        "break"
      ],
      infer: [
        "figure it out",
        "infer"
      ],
      build: [
        "build"
      ],
      use: [
        "use"
      ],
      change: [
        "change"
      ]
    };

    if (
      asArray(
        tokens[objective]
      )
        .some(
          token =>
            text.includes(
              token
            )
        )
    ) {
      return true;
    }

    if (
      guidedBreakNonFull &&
      [
        "find",
        "meaning",
        "word part",
        "use"
      ]
        .some(
          token =>
            text.includes(
              token
            )
        )
    ) {
      return true;
    }

    /* FIRST_VOLO_RECOMMENDATION_IS_GUIDANCE_NOT_BOUNDARY_V1
       recommendedActivityUse ranks/describes a word's best-known uses; it is
       not the universe of what teacher-led instruction may do. The objective
       rules above still enforce the real linguistic constraints: Build needs
       an approved full decomposition, Figure It Out rejects opaque/cautioned
       words, Break Apply needs full segmentation, protection still applies,
       and target/non-target support must remain valid.

       Therefore an omitted activity is allowed when the objective-specific
       linguistic checks already passed. Explicit negative cautions remain
       authoritative.
    */
    const explicitBlockPatterns = {
      build: /(?:do not|don['’]t|avoid|not for|not a clean).*build|build.*(?:do not|avoid|not for|only if segmentation is clean)/,
      infer: /(?:do not|don['’]t|avoid|not for).*infer|infer.*(?:do not|avoid|not for)/,
      break: /(?:do not|don['’]t|avoid|not for).*break|break.*(?:do not|avoid|not for)/
    };

    const block =
      explicitBlockPatterns[
        objective
      ];

    if (
      block &&
      block.test(text)
    ) {
      return false;
    }

    /* High-risk objectives keep the inventory's explicit recommendation as
       a safety gate. These tasks can accidentally turn a merely historical
       or lexicalized analysis into student-facing morphology if we overreach.
       Lower-risk teaching/application activities may use the word when the
       objective-specific linguistic checks above have already passed. */
    if (
      objective === "build" ||
      objective === "infer"
    ) {
      return false;
    }

    if (objective === "break") {
      return Boolean(
        item?.literal ||
        item?.wordFormation?.wordSum
      );
    }

    return true;
  }
  function supportFor({
    objective,
    stage,
    demand,
    segmentation,
    wordFormation = null,
    item = null
  }) {
    if (
      objective === "break" &&
      demand ===
        "form-change"
    ) {
      return [
        "Begin with the base form and suffix shown in the prompt. Ask the student what changes when the word is formed.",
        (
          wordFormation?.teachingNote ||
          "State the spelling-change rule only after the student's first attempt, then retry the same word formation."
        ),
        "Have the student say or write the accurate word sum, then fade the spelling cue on the next opportunity."
      ];
    }

    if (
      objective === "break" &&
      demand ===
        "target-recognition"
    ) {
      return [
        "Give the whole-word meaning or a brief age-accessible context if needed.",
        "Do not point out the target form before the student's first attempt.",
        "This is a guided target-recognition move, not a full-segmentation score."
      ];
    }

    if (
      objective === "break" &&
      stage === "apply"
    ) {
      return [
        "Begin with an independent whole-word segmentation attempt.",
        "If a non-target part blocks the student, name or explain only that non-target part, then retry the same word.",
        "Do not mark the target boundary or state the target contribution before the retry."
      ];
    }

    if (
      objective === "break" &&
      demand ===
        "full-segmentation"
    ) {
      const other =
        asArray(
          segmentation
            ?.otherParts
        )
          .filter(Boolean);

      const supports = [
        (
          other.length
            ? (
                "If needed, name or explain a non-target part (" +
                other.join(", ") +
                ") while keeping the target analysis as the student's job."
              )
            : "If needed, supply only non-target information that preserves the target demand."
        )
      ];

      const concreteNonTarget =
        nonTargetSupportLine(
          item
        );

      if (concreteNonTarget) {
        supports.unshift(
          concreteNonTarget
        );
      }

      if (
        wordFormation?.teachingNote
      ) {
        supports.push(
          wordFormation.teachingNote
        );
      }

      supports.push(
        "Retry the same word after support.",
        "Fade support on the next opportunity."
      );

      return supports;
    }

    if (
      objective === "infer"
    ) {
      const concreteNonTarget =
        nonTargetSupportLine(
          item
        );

      return [
        "Begin with the student's independent morphology-based inference.",
        concreteNonTarget ||
          "If an unfamiliar non-target morpheme blocks the inference, the educator may explicitly supply only that non-target meaning or function after the first attempt.",
        "The student must still use the target morphology to infer the whole word.",
        "Retry the same inference after support."
      ];
    }

    const concreteNonTarget =
      nonTargetSupportLine(
        item
      );

    return [
      "Begin with the student's independent attempt.",
      ...(concreteNonTarget
        ? [concreteNonTarget]
        : []),
      "Use the least relevant support only if a barrier appears.",
      "Retry the same demand and fade support."
    ];
  }

  function scoreCandidate(
    item,
    {
      gradeBand = null,
      objective = null,
      stage = "guided",
      demand = null
    } = {}
  ) {
    const access =
      accessibilityInfo({
        item,
        gradeBand,
        stage,
        objective
      });

    let score = 0;

    if (
      access.category ===
      "A"
    ) {
      score += 50;
    } else if (
      access.category ===
      "B"
    ) {
      score += 36;
    } else if (
      access.category ===
      "C"
    ) {
      score += 18;
    } else {
      score -= 80;
    }

    const transparency =
      transparencyRank(
        item?.transparency
      );

    if (
      transparency === 3
    ) {
      score += 28;
    } else if (
      transparency === 2
    ) {
      score += 14;
    } else {
      score -= 24;
    }

    if (
      item?.studentFriendlyDefinition ||
      item?.definition ||
      item?.literal
    ) {
      score += 7;
    }

    if (
      item?.studentFriendlyDefinition
    ) {
      score += 5;
    }

    if (
      item?.segmentation
    ) {
      score += 6;
    }

    /*
      Across teacher-led activities, prefer examples whose validated
      morphology can be explicitly connected to a student-friendly
      whole-word meaning. This is a ranking preference, not permission
      to invent a decomposition.
    */
    if (
      item?.literal &&
      item?.segmentation &&
      (
        item?.studentFriendlyDefinition ||
        item?.definition
      )
    ) {
      score += 12;
    }

    if (
      item?.teachingContext ||
      item?.studentFriendlyContext ||
      item?.contextSentence
    ) {
      score += 3;
    }

    if (item?.semanticBridgeQuality === "high") {
      score += 16;
    } else if (item?.semanticBridgeQuality === "avoid") {
      score -= 20;
    }

    if (objective === "change" && item?.changeTask?.expectedWord) {
      score += 60;
    }

    if (
      cautionText(item)
    ) {
      score -= 5;
    }

    if (
      demand ===
        "full-segmentation"
    ) {
      score += 12;
    }

    if (
      stage === "apply" &&
      demand ===
        "full-segmentation"
    ) {
      score += 8;
    }

    return score;
  }

  function evaluateCandidate({
    item,
    target,
    targetMeta = null,
    objective = "learn",
    stage = "guided",
    gradeBand = null,
    vocabularyLevel = null,
    flight = null,
    isProtected = null
  } = {}) {
    if (
      !item ||
      !item.word
    ) {
      return {
        eligible: false,
        reason:
          "Missing candidate word."
      };
    }

    if (
      String(
        item.status ||
        "current"
      )
        .toLowerCase() ===
        "excluded"
    ) {
      return {
        eligible: false,
        reason:
          "Candidate is excluded."
      };
    }

    if (
      typeof isProtected ===
        "function" &&
      isProtected(item.word)
    ) {
      return {
        eligible: false,
        reason:
          "Protected assessment or transfer word."
      };
    }

    if (
      !flightAllows(
        item,
        flight
      )
    ) {
      return {
        eligible: false,
        reason:
          "Candidate belongs to a different instructional flight."
      };
    }

    if (
      !vocabularyAllows(
        item,
        vocabularyLevel
      )
    ) {
      return {
        eligible: false,
        reason:
          "Candidate exceeds the selected vocabulary level."
      };
    }

    const relationship =
      targetRelationship(
        item,
        target,
        targetMeta
      );

    if (!relationship.matched) {
      return {
        eligible: false,
        reason:
          "Candidate does not contain the requested target."
      };
    }

    if (
      !nonTargetSupportPreservesTarget(
        item,
        target,
        targetMeta
      )
    ) {
      return {
        eligible: false,
        reason:
          "Configured non-target support would reveal the instructional target."
      };
    }

    const access =
      accessibilityInfo({
        item,
        gradeBand,
        stage,
        objective
      });

    if (
      !access.accessOkay ||
      !access.practiceOkay ||
      access.category ===
        "D"
    ) {
      return {
        eligible: false,
        reason:
          "Candidate meaning is not sufficiently accessible for this learner/objective/stage.",
        accessibility:
          access.category
      };
    }

    const segmentation =
      fullSegmentationInfo(
        item,
        target,
        targetMeta
      );

    const fullOkay =
      segmentation.valid &&
      !fullSegmentationCautionBlocks(
        item
      ) &&
      String(
        item?.transparency ||
        ""
      )
        .toLowerCase() !==
        "low";

    const wordFormation =
      wordFormationInfo(
        item
      );

    let demand = null;

    switch (objective) {
      case "break":
        if (
          stage === "apply"
        ) {
          if (!fullOkay) {
            return {
              eligible: false,
              reason:
                "Apply requires a fresh linguistically sound full segmentation."
            };
          }

          demand =
            "full-segmentation";
        } else if (
          fullOkay
        ) {
          demand =
            "full-segmentation";
        } else if (
          wordFormation?.wordSum &&
          wordFormation?.spellingChange
        ) {
          demand =
            "form-change";
        } else {
          demand =
            "target-recognition";
        }
        break;

      case "build":
        if (!fullOkay) {
          return {
            eligible: false,
            reason:
              "Build requires an approved full decomposition."
          };
        }

        demand =
          "full-segmentation";
        break;

      case "infer":
        if (
          String(
            item?.transparency ||
            ""
          )
            .toLowerCase() ===
            "low" ||
          inferenceCautionBlocks(
            item
          )
        ) {
          return {
            eligible: false,
            reason:
              "Candidate is too opaque or cautioned against inference."
          };
        }

        demand =
          "morphology-inference";
        break;

      case "find":
      case "hunt":
        demand =
          "target-recognition";
        break;

      case "meaning":
      case "morpheme":
        if (
          String(
            item?.transparency ||
            ""
          )
            .toLowerCase() ===
            "low"
        ) {
          return {
            eligible: false,
            reason:
              "Candidate is too opaque for this meaning/form demand."
          };
        }

        demand =
          "target-meaning";
        break;

      case "learn":
        demand =
          "modeled-connection";
        break;

      case "use":
      case "change":
      default:
        demand =
          "target-application";
        break;
    }

    if (
      !recommendationAllows(
        item,
        objective,
        stage,
        demand
      )
    ) {
      return {
        eligible: false,
        reason:
          "Candidate is not recommended for this instructional objective."
      };
    }

    const selection = {
      eligible: true,
      item,
      word:
        item.word,
      objective,
      stage,
      demand,
      accessibility:
        access.category,
      transparency:
        item?.transparency ||
        null,
      expectedTargetForm:
        relationship.form ||
        segmentation.targetForm ||
        null,
      segmentation,
      wordFormation,
      freshnessFamily:
        freshnessKey(
          item
        ),
      allowedSupport:
        supportFor({
          objective,
          stage,
          demand,
          segmentation,
          wordFormation,
          item
        }),
      nonTargetSupports:
        nonTargetSupports(
          item
        ),
      candidateSource:
        item?.instructionalSource ||
        (
          item?._teacherLedExtension
            ? "teacher-word-extension"
            : "shared-word-inventory"
        ),
      teacherLedOnly:
        Boolean(
          item?.teacherLedOnly ||
          item?._teacherLedExtension
        ),
      whyEligible:
        (
          demand ===
            "full-segmentation"
            ? (
                "Accessible word with an approved full segmentation that preserves the target as a complete part."
              )
            : (
                demand ===
                  "form-change"
                  ? (
                      "Accessible target-bearing word with an explicit base + suffix word formation and spelling-change rule."
                    )
                  : (
                      "Accessible target-bearing word that fits the requested objective without forcing a false full segmentation."
                    )
              )
        )
    };

    selection.score =
      scoreCandidate(
        item,
        {
          gradeBand,
          objective,
          stage,
          demand
        }
      );

    return selection;
  }

  function deriveTransparentPrefixSegmentation(
    item,
    target
  ) {
    if (
      !item?.word ||
      item?.segmentation ||
      target?.type !== "prefix" ||
      String(
        item?.transparency ||
        ""
      ).toLowerCase() !== "high"
    ) {
      return item;
    }

    const relationship =
      targetRelationship(
        item,
        target,
        target
      );

    if (!relationship.matched) {
      return item;
    }

    const word =
      cleanSurface(
        item.word
      );

    const prefix =
      targetForms(
        target,
        target
      )
        .filter(
          form =>
            form &&
            word.startsWith(
              form
            ) &&
            word.length >
              form.length + 1
        )
        .sort(
          (a, b) =>
            b.length -
            a.length
        )[0] ||
      null;

    if (!prefix) {
      return item;
    }

    const base =
      word.slice(
        prefix.length
      );

    if (!base) {
      return item;
    }

    /* FIRST_VOLO_TRANSPARENT_PREFIX_DERIVED_SEGMENTATION_V1
       This derivation is allowed only when the master inventory already
       identifies the target as a morpheme in a HIGH-transparency prefix word.
       It is not a letter-pattern guess and it never applies to suffixes or
       roots, where form changes/etymology can make surface stripping unsafe.
    */
    return {
      ...item,
      segmentation:
        `${prefix}- + ${base}`,
      derivedSegmentation:
        true,
      segmentationSource:
        "validated-high-transparency-prefix-surface"
    };
  }


  function sourceCandidates({
    target,
    candidates = null
  } = {}) {
    const base =
      Array.isArray(candidates)
        ? candidates
        : asArray(
            window
              .FIRST_VOLO_WORD_INVENTORY
          );

    const extensions =
      extensionApi()
        ?.forTarget?.(
          target
        ) ||
      [];

    const byWord =
      new Map();

    for (
      const item
      of base
    ) {
      const key =
        cleanSurface(
          item?.word
        );

      if (!key) continue;

      byWord.set(
        key,
        deriveTransparentPrefixSegmentation(
          {
            ...item
          },
          target
        )
      );
    }

    for (
      const item
      of extensions
    ) {
      const key =
        cleanSurface(
          item?.word
        );

      if (!key) continue;

      byWord.set(
        key,
        deriveTransparentPrefixSegmentation(
          {
            ...(byWord.get(key) || {}),
            ...item,
            _teacherLedExtension:
              true,
            _teacherLedExtensionTargetId:
              String(target?.id || target?.targetId || ""),
            instructionalSource:
              item?.instructionalSource ||
              "teacher-word-extension"
          },
          target
        )
      );
    }

    return [
      ...byWord.values()
    ];
  }

  function selectCandidates({
    target,
    targetMeta = null,
    objective = "learn",
    stage = "guided",
    gradeBand = null,
    vocabularyLevel = null,
    flight = null,
    candidates = null,
    isProtected = null,
    excludeWords = null,
    limit = null
  } = {}) {
    const excluded =
      new Set(
        asArray(
          excludeWords
        )
          .map(cleanSurface)
          .filter(Boolean)
      );

    const source =
      sourceCandidates({
        target,
        candidates
      });

    function collect(
      effectiveVocabularyLevel,
      fallback = false
    ) {
      const seen =
        new Set();

      return source
        .map(
          item =>
            evaluateCandidate({
              item,
              target,
              targetMeta,
              objective,
              stage,
              gradeBand,
              vocabularyLevel:
                effectiveVocabularyLevel,
              flight,
              isProtected
            })
        )
        .filter(
          result =>
            result.eligible
        )
        .filter(
          result => {
            const key =
              cleanSurface(
                result.word
              );

            if (
              !key ||
              seen.has(key) ||
              excluded.has(key)
            ) {
              return false;
            }

            seen.add(key);
            return true;
          }
        )
        .map(
          result =>
            fallback
              ? {
                  ...result,
                  vocabularyFallback:
                    true,
                  requestedVocabularyLevel:
                    vocabularyLevel,
                  effectiveVocabularyLevel,
                  whyEligible:
                    (
                      result.whyEligible ||
                      "Eligible teacher-led candidate."
                    ) +
                    " Used as a one-level-harder guided fallback because no eligible candidate was available at or below the requested vocabulary level."
                }
              : {
                  ...result,
                  vocabularyFallback:
                    false,
                  requestedVocabularyLevel:
                    vocabularyLevel,
                  effectiveVocabularyLevel:
                    vocabularyLevel
                }
        )
        .sort(
          (a, b) =>
            b.score -
            a.score
        );
    }

    let selections =
      collect(
        vocabularyLevel,
        false
      );

    /*
      Guided teacher-led work may step ONE vocabulary level harder only
      when the preferred cumulative pool is completely empty. Apply-stage
      selection does not receive this fallback because Apply is the more
      independent demand.
    */
    if (
      selections.length === 0 &&
      stage === "guided"
    ) {
      const fallbackLevel =
        nextHarderVocabularyLevel(
          vocabularyLevel
        );

      if (fallbackLevel) {
        selections =
          collect(
            fallbackLevel,
            true
          );
      }
    }

    const hasExplicitLimit =
      limit !== null &&
      limit !== undefined &&
      limit !== "";

    if (
      hasExplicitLimit &&
      Number.isFinite(
        Number(limit)
      ) &&
      Number(limit) >= 0
    ) {
      return selections.slice(
        0,
        Number(limit)
      );
    }

    return selections;
  }
  function buildBreakPlan({
    target,
    targetMeta = null,
    gradeBand = null,
    vocabularyLevel = null,
    flight = null,
    candidates = null,
    isProtected = null,
    partACount = 1
  } = {}) {
    const desiredPartA =
      Math.max(
        1,
        Number(partACount) ||
          1
      );

    const guided =
      selectCandidates({
        target,
        targetMeta,
        objective:
          "break",
        stage:
          "guided",
        gradeBand,
        vocabularyLevel,
        flight,
        candidates,
        isProtected
      });

    const applies =
      selectCandidates({
        target,
        targetMeta,
        objective:
          "break",
        stage:
          "apply",
        gradeBand,
        vocabularyLevel,
        flight,
        candidates,
        isProtected
      });

    /*
      Keep instruction-rich spelling/form examples available for guided
      teaching when a cleaner full-segmentation Apply candidate exists.
      This is generic: any candidate with explicit word-formation teaching
      data is still allowed for Apply when needed, but it is not consumed
      first merely because its accessibility score is high.
    */
    const applyChoices =
      applies
        .slice()
        .sort(
          (a, b) => {
            const aTeaching =
              Boolean(
                a?.wordFormation
                  ?.spellingChange ||
                a?.wordFormation
                  ?.teachingNote
              );

            const bTeaching =
              Boolean(
                b?.wordFormation
                  ?.spellingChange ||
                b?.wordFormation
                  ?.teachingNote
              );

            if (
              aTeaching !==
              bTeaching
            ) {
              return (
                Number(aTeaching) -
                Number(bTeaching)
              );
            }

            return (
              b.score -
              a.score
            );
          }
        );

    for (
      const apply
      of applyChoices
    ) {
      const pool =
        guided.filter(
          item =>
            !sameFreshnessFamily(
              item.item,
              apply.item
            )
        );

      const full =
        pool.filter(
          item =>
            item.demand ===
              "full-segmentation"
        );

      const formChange =
        pool.filter(
          item =>
            item.demand ===
              "form-change"
        );

      const recognition =
        pool.filter(
          item =>
            item.demand ===
              "target-recognition"
        );

      const chosen = [];
      const used =
        new Set();

      function takeFrom(list) {
        const unused =
          list.filter(
            item =>
              !used.has(
                cleanSurface(
                  item.word
                )
              )
          );

        if (!unused.length) {
          return false;
        }

        const usedFamilies =
          new Set(
            chosen.map(
              item =>
                freshnessKey(
                  item.item
                )
            )
          );

        const next =
          unused.find(
            item =>
              !usedFamilies.has(
                freshnessKey(
                  item.item
                )
              )
          ) ||
          unused[0];

        used.add(
          cleanSurface(
            next.word
          )
        );

        chosen.push(next);
        return true;
      }

      /*
        Guided Part A varies legitimate teaching demands:
        full analysis -> form change -> full analysis -> form change -> recognition.
        Apply remains a different lexical/inflectional family and a full segmentation.
      */
      const preferred =
        [
          full,
          formChange,
          full,
          formChange,
          recognition
        ];

      for (
        let index = 0;
        index < desiredPartA;
        index += 1
      ) {
        if (
          !takeFrom(
            preferred[
              index %
              preferred.length
            ]
          )
        ) {
          if (
            !takeFrom(full) &&
            !takeFrom(formChange) &&
            !takeFrom(recognition)
          ) {
            break;
          }
        }
      }

      if (
        chosen.length ===
          desiredPartA &&
        chosen.some(
          item =>
            item.demand ===
              "full-segmentation"
        )
      ) {
        return {
          complete:
            true,
          partA:
            chosen,
          apply,
          reason:
            "",
          guidedCandidateCount:
            guided.length,
          applyCandidateCount:
            applies.length
        };
      }
    }

    return {
      complete:
        false,
      partA:
        [],
      apply:
        null,
      reason:
        (
          `A complete Break It Apart sequence needs ${desiredPartA} ` +
          `guided Part A item${desiredPartA === 1 ? "" : "s"} plus one ` +
          `distinct fresh full-segmentation Apply item from a different lexical/inflectional family. ` +
          `${guided.length} guided candidate${guided.length === 1 ? "" : "s"} ` +
          `and ${applies.length} fresh full-segmentation candidate${applies.length === 1 ? "" : "s"} ` +
          `are currently eligible.`
        ),
      guidedCandidateCount:
        guided.length,
      applyCandidateCount:
        applies.length
    };
  }

  window
    .FirstVoloInstructionalWordSelector =
    Object.freeze({
      version:
        VERSION,
      normalize,
      targetForms,
      targetSurfaceInWord,
      targetRelationship,
      segmentationPieceValidation,
      fullSegmentationInfo,
      wordFormationInfo,
      freshnessKey,
      sameFreshnessFamily,
      nonTargetSupports,
      nonTargetSupportPreservesTarget,
      scoreCandidate,
      evaluateCandidate,
      sourceCandidates,
      selectCandidates,
      buildBreakPlan
    });
})();
