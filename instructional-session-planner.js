"use strict";

(function initializeFirstVoloInstructionalSessionPlanner() {

  const ACTIVITY_SEQUENCE = Object.freeze([
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
  ]);

  const ACTIVITY_LABELS = Object.freeze({
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
  });

  const DURATION_PLANS = Object.freeze({
    10: Object.freeze({
      totalMinutes: 10,
      retrieveMinutes: 2,
      teachPracticeMinutes: 4,
      applyMinutes: 2,
      transferMinutes: 2,
      retrieveItemCount: 2
    }),

    15: Object.freeze({
      totalMinutes: 15,
      retrieveMinutes: 3,
      teachPracticeMinutes: 6,
      applyMinutes: 3,
      transferMinutes: 3,
      retrieveItemCount: 3
    }),

    30: Object.freeze({
      totalMinutes: 30,
      retrieveMinutes: 4,
      teachPracticeMinutes: 12,
      applyMinutes: 8,
      transferMinutes: 6,
      retrieveItemCount: 4
    })
  });

  const TEACH_PRACTICE_TASKS = Object.freeze({
    learn: {
      educator:
        "Briefly establish the target meaning and show one clear example. Ask the student to explain or identify the target before moving on.",
      student:
        "Connects the target word part with its meaning and notices it in a clear example."
    },

    find: {
      educator:
        "Present a whole word containing the target. Ask the student to locate the target before highlighting or separating it.",
      student:
        "Finds the target word part inside a whole word."
    },

    hunt: {
      educator:
        "Present several words and ask which contain the target. Keep the target visually unmarked for the first attempt.",
      student:
        "Recognizes the same target across changing whole-word contexts."
    },

    meaning: {
      educator:
        "Present the target and ask for its meaning before providing a meaning choice or visual cue.",
      student:
        "Retrieves the meaning carried by the target."
    },

    morpheme: {
      educator:
        "Give the meaning and ask the student to retrieve the matching word part before providing a partial cue.",
      student:
        "Retrieves the target form from its meaning."
    },

    break: {
      educator:
        "Present a whole word and ask the student to divide it into meaningful parts. Do not pre-mark the boundaries.",
      student:
        "Breaks the word into meaningful morphological parts."
    },

    infer: {
      educator:
        "Present a word containing known morphology and ask the student what the known part suggests about the whole word before adding context.",
      student:
        "Uses known morphology and other available word parts to infer whole-word meaning."
    },

    build: {
      educator:
        "Give a meaning or word-building goal and ask the student to select and combine meaningful parts independently before cueing.",
      student:
        "Builds a real word by combining meaningful parts."
    },

    use: {
      educator:
        "Give meaningful sentence context and ask the student to use morphology to select or produce an appropriate word, then explain the morphological clue.",
      student:
        "Uses morphology and sentence context together."
    },

    change: {
      educator:
        "Present members of a word family in sentence context. Let the student use morphology and sentence role before giving a grammatical clue.",
      student:
        "Selects the word-family form whose morphology and sentence role fit the context."
    }
  });

  function asArray(value) {
    return Array.isArray(value)
      ? value
      : [];
  }

  function unique(values) {
    return [
      ...new Set(
        asArray(values).filter(Boolean)
      )
    ];
  }

  function normalizeMinutes(value) {
    const number =
      Number(value);

    if (DURATION_PLANS[number]) {
      return number;
    }

    return 15;
  }

  function getDurationPlan(value) {
    return DURATION_PLANS[
      normalizeMinutes(value)
    ];
  }

  function getMorphemeById(id) {
    if (!id) {
      return null;
    }

    return asArray(
      window.FIRST_VOLO_MORPHEME_INVENTORY
    ).find(
      (item) =>
        item.id === id
    ) || null;
  }

  function resolveRole(response, meta) {
    const resolver =
      window.FirstVoloLinguisticRoles
        ?.resolveRole;

    if (!resolver) {
      if (response?.linguisticRole) {
        return response.linguisticRole;
      }

      if (response?.targetType === "prefix") {
        return "prefix";
      }

      if (response?.targetType === "suffix") {
        return "suffix";
      }

      return "word part";
    }

    return resolver({
      linguisticRole:
        response?.linguisticRole || null,

      targetId:
        response?.primaryTargetId ||
        meta?.id ||
        null,

      targetLabel:
        response?.primaryTarget ||
        meta?.label ||
        null,

      familyId:
        response?.familyId ||
        null,

      targetType:
        response?.targetType ||
        meta?.type ||
        null
    });
  }

  function responseTarget(response) {
    if (!response) {
      return null;
    }

    const resolver =
      window
        .FirstVoloInstructionalTargetResolver;

    if (resolver?.resolve) {
      return (
        resolver.resolve({
          response,
          activity:
            response.skill ||
            null,
          word:
            response.word ||
            null
        }).primary ||
        null
      );
    }

    const meta =
      getMorphemeById(
        response.primaryTargetId
      );

    const label =
      response.primaryTarget ||
      meta?.label ||
      null;

    if (!label) {
      return null;
    }

    return {
      id:
        response.primaryTargetId ||
        meta?.id ||
        null,

      label,

      meaning:
        meta?.meaning ||
        null,

      role:
        resolveRole(
          response,
          meta
        )
    };
  }

  function recentResponses(student) {
    if (!student) {
      return [];
    }

    const sessions =
      asArray(student.sessions)
        .slice()
        .sort((a, b) => {
          const aDate =
            a.completedAt ||
            a.startedAt ||
            "";

          const bDate =
            b.completedAt ||
            b.startedAt ||
            "";

          return bDate.localeCompare(
            aDate
          );
        });

    return sessions.flatMap(
      (session) =>
        asArray(session.responses)
          .slice()
          .reverse()
          .map((response) => ({
            session,
            response
          }))
    );
  }

  function retrievalPrompt({
    target,
    word = null,
    index = 0
  }) {
    if (!target) {
      return null;
    }

    if (
      word &&
      index % 2 === 1
    ) {
      return {
        type:
          "identify-and-explain",

        prompt:
          `In "${word}", find ${target.role} ${target.label}. What does it contribute to the word?`,

        expected:
          target.meaning ||
          `Identify ${target.label} and explain its contribution.`,

        target
      };
    }

    if (target.meaning) {
      return {
        type:
          "meaning-retrieval",

        prompt:
          `What does ${target.role} ${target.label} mean?`,

        expected:
          target.meaning,

        target
      };
    }

    return {
      type:
        "target-retrieval",

      prompt:
        `Tell what you know about ${target.role} ${target.label}.`,

      expected:
        "Student recalls the known target without an initial cue.",

      target
    };
  }

  function buildRetrieveItems({
    student,
    guidance,
    duration
  }) {
    const desired =
      duration.retrieveItemCount;

    const results = [];
    const seen = new Set();

    const current =
      guidance?.lastWork
        ?.latestResponse ||
      null;

    const candidates = [
      current,
      ...recentResponses(student)
        .map(
          (entry) =>
            entry.response
        )
    ].filter(Boolean);

    for (
      const response of candidates
    ) {
      const target =
        responseTarget(response);

      if (!target?.label) {
        continue;
      }

      const key =
        target.id ||
        target.label;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);

      const item =
        retrievalPrompt({
          target,
          word:
            response.word ||
            null,
          index:
            results.length
        });

      if (item) {
        results.push({
          ...item,

          source:
            "saved-student-work",

          previousActivity:
            response.skill ||
            null,

          previouslyIndependent:
            typeof response
              .independentCorrect ===
              "boolean"
              ? response
                  .independentCorrect
              : Boolean(
                  response.correct
                )
        });
      }

      if (
        results.length >= desired
      ) {
        break;
      }
    }

    if (
      results.length === 0 &&
      guidance?.lastWork
        ?.target?.label
    ) {
      const target =
        guidance.lastWork.target;

      results.push({
        type:
          "current-target-check",

        prompt:
          target.meaning
            ? `What does ${target.role || "word part"} ${target.label} mean?`
            : `Tell what you know about ${target.role || "word part"} ${target.label}.`,

        expected:
          target.meaning ||
          "Student recalls the selected target.",

        target,

        source:
          "current-target"
      });
    }

    return results;
  }

  function formatTarget(target) {
    if (!target?.label) {
      return "the selected target";
    }

    const role =
      target.role ||
      "word part";

    if (target.meaning) {
      return (
        `${role} ${target.label} = ` +
        `${target.meaning}`
      );
    }

    return (
      `${role} ${target.label}`
    );
  }

  function nextActivityFrom(activity) {
    if (!activity) {
      return "learn";
    }

    const index =
      ACTIVITY_SEQUENCE.indexOf(
        activity
      );

    if (index < 0) {
      return null;
    }

    if (
      index ===
      ACTIVITY_SEQUENCE.length - 1
    ) {
      return null;
    }

    return (
      ACTIVITY_SEQUENCE[
        index + 1
      ]
    );
  }


  function activityApplicability(
    target,
    activity
  ) {
    const bank =
      window
        .FirstVoloSessionItemBank;

    if (
      !activity ||
      !bank?.activityApplicability
    ) {
      return {
        applicable: true,
        reason: null
      };
    }

    return (
      bank.activityApplicability(
        target,
        activity
      ) || {
        applicable: true,
        reason: null
      }
    );
  }

  function resolveApplicableActivity({
    requestedActivity = null,
    lastActivity = null,
    target = null
  } = {}) {
    let startActivity =
      requestedActivity ||
      nextActivityFrom(
        lastActivity
      ) ||
      null;

    if (!startActivity) {
      return {
        activity: null,
        requestedActivity: null,
        adjusted: false,
        skippedActivities: []
      };
    }

    let index =
      ACTIVITY_SEQUENCE.indexOf(
        startActivity
      );

    if (index < 0) {
      return {
        activity: startActivity,
        requestedActivity:
          startActivity,
        adjusted: false,
        skippedActivities: []
      };
    }

    const skippedActivities = [];

    for (
      let i = index;
      i < ACTIVITY_SEQUENCE.length;
      i += 1
    ) {
      const candidate =
        ACTIVITY_SEQUENCE[i];

      const applicability =
        activityApplicability(
          target,
          candidate
        );

      if (
        applicability
          ?.applicable !== false
      ) {
        return {
          activity:
            candidate,
          requestedActivity:
            startActivity,
          adjusted:
            candidate !==
            startActivity,
          skippedActivities
        };
      }

      skippedActivities.push({
        activity:
          candidate,
        reason:
          applicability
            ?.reason ||
          "This activity is intentionally not applicable for the selected target."
      });
    }

    return {
      activity: null,
      requestedActivity:
        startActivity,
      adjusted: true,
      skippedActivities
    };
  }


  function buildTeachPractice({
    guidance,
    duration
  }) {
    const activity =
      guidance?.nextWork
        ?.activity ||
      nextActivityFrom(
        guidance?.lastWork
          ?.activity
      );

    const target =
      guidance?.nextWork
        ?.target ||
      guidance?.lastWork
        ?.target ||
      null;

    const profile =
      TEACH_PRACTICE_TASKS[
        activity
      ] || null;

    return {
      minutes:
        duration
          .teachPracticeMinutes,

      activity,

      activityLabel:
        ACTIVITY_LABELS[
          activity
        ] ||
        "Select activity",

      target,

      targetPhrase:
        formatTarget(target),

      educatorDoes:
        profile?.educator ||
        "Select the next instructional task and allow an independent attempt before adding support.",

      studentDoes:
        profile?.student ||
        "Completes the selected morphology task.",

      materialStatus:
        "activity-bank-resolver-pending",

      items: []
    };
  }

  function chooseApplyRecipe({
    guidance,
    sessionMaterial
  } = {}) {
    const recipes =
      asArray(
        sessionMaterial
          ?.recipes
      );

    if (!recipes.length) {
      return null;
    }

    const lastWord =
      String(
        guidance
          ?.lastWork
          ?.word || ""
      )
        .trim()
        .toLowerCase();

    /*
      Prefer a different safe target word when
      the session bank contains one. If this target
      has only one configured recipe, Apply may use
      the same word but changes the response demand
      from supported building to contextual production.
    */
    const fresh =
      recipes.filter(
        recipe =>
          String(
            recipe?.word || ""
          )
            .trim()
            .toLowerCase() !==
          lastWord
      );

    const pool =
      fresh.length
        ? fresh
        : recipes;

    /* FIRST_VOLO_APPLY_PRIORITY_V1
       A recipe may explicitly reserve a safer or instructionally stronger
       Apply item. Honor that preference without changing behavior for
       ordinary recipes that do not declare a priority.
    */
    const prioritized =
      pool.filter(
        recipe =>
          Number(
            recipe?.applyPriority ||
            0
          ) > 0
      );

    const chosenPool =
      prioritized.length
        ? prioritized
        : pool;

    return (
      chosenPool[
        chosenPool.length - 1
      ] ||
      null
    );
  }


  function buildApply({
    guidance,
    duration,
    sessionMaterial = null
  }) {
    const target =
      guidance?.nextWork
        ?.target ||
      guidance?.lastWork
        ?.target ||
      null;

    const recipe =
      chooseApplyRecipe({
        guidance,
        sessionMaterial
      });

    if (!recipe) {
      return {
        minutes:
          duration.applyMinutes,

        target,

        targetPhrase:
          formatTarget(target),

        productive:
          true,

        educatorDoes:
          `Use ${formatTarget(target)} in a productive task. Ask the student to produce, use, and explain a related word rather than complete another recognition-only item.`,

        studentDoes:
          "Produces or explains a related word and states what the known morphology contributes.",

        item:
          null,

        materialStatus:
          "productive-application-item-pending",

        protectionRule:
          "Do not select a formal assessment target, Migration Challenge reserved word, or Check Transfer reserved word."
      };
    }

    const targetLabel =
      target?.label ||
      "the target word part";

    const contextPrompt =
      recipe.contextPrompt ||
      null;

    const wordPrompt =
      recipe.wordPrompt ||
      null;

    const customApplyPrompt =
      recipe.applyPrompt ||
      null;

    const applyWord =
      recipe.applyKind ===
        "open-new-item"
        ? null
        : (
            recipe.applyWord ||
            recipe.word ||
            null
          );

    const applyParts =
      asArray(
        recipe.applyParts
      ).length
        ? asArray(
            recipe.applyParts
          ).slice()
        : (
            applyWord &&
            String(
              applyWord
            )
              .trim()
              .toLowerCase() ===
            String(
              recipe.word
            )
              .trim()
              .toLowerCase()
              ? asArray(
                  recipe.parts
                ).slice()
              : []
          );

    const applyMode =
      recipe.applyMode ||
      (
        applyParts.length > 1
          ? "build"
          : "prompt"
      );

    const prompt =
      customApplyPrompt ||
      (
        contextPrompt
          ? (
              "Complete the sentence by building the word that fits: " +
              contextPrompt
            )
          : (
              wordPrompt
                ? (
                    wordPrompt +
                    " Do not show the answer before the student's attempt."
                  )
                : (
                    `Build a related word containing ${targetLabel}.`
                  )
            )
      );

    const followUpPrompt =
      customApplyPrompt
        ? null
        : (
            `Now say or write a new sentence using ${applyWord}. ` +
            `Explain what ${targetLabel} contributes to the word.`
          );

    return {
      minutes:
        duration.applyMinutes,

      target,

      targetPhrase:
        formatTarget(target),

      productive:
        true,

      educatorDoes:
        (
          "Present the Apply prompt without showing the answer. " +
          "Let the student produce or build the word from context. " +
          "After the word is correct, ask for an original sentence " +
          "and an explanation of what the target contributes."
        ),

      studentDoes:
        applyWord
          ? (
              `Produces ${applyWord} from the Apply cue, ` +
              "uses it in a new sentence, and explains the target's contribution."
            )
          : (
              "Produces a new real word with the target, uses it in a new sentence, " +
              "and explains the target's contribution."
            ),

      item: {
        word:
          applyWord,

        parts:
          applyParts,

        segmentation:
          recipe.applySegmentation ||
          null,

        family:
          sessionMaterial
            ?.family ||
          null,

        contextPrompt,

        wordPrompt,

        prompt,

        followUpPrompt,

        source:
          recipe.source ||
          "protection-aware-session-recipe",

        mode:
          applyMode,

        answer:
          recipe.applyEducatorKey ||
          recipe.educatorKey ||
          recipe.answer ||
          recipe.word
      },

      materialStatus:
        "ready-productive-application",

      protectionRule:
        (
          "Apply uses an ordinary protection-aware practice word. " +
          "It does not use formal assessment, Migration Challenge, " +
          "or Check Transfer reserved words."
        )
    };
  }

  function buildTransfer({
    guidance,
    duration
  }) {
    const target =
      guidance?.nextWork
        ?.target ||
      guidance?.lastWork
        ?.target ||
      null;

    return {
      minutes:
        duration.transferMinutes,

      target,

      targetPhrase:
        formatTarget(target),

      protected:
        true,

      itemCount:
        2,

      items: [],

      materialStatus:
        "protected-check-transfer-pool-pending",

      educatorDoes:
        "Present a protected transfer word without preteaching it. Begin without a morphology cue and use the least support only after the student's first attempt.",

      studentDoes:
        target?.label
          ? `Attempts to recognize ${target.label} and use it to reason about an unfamiliar whole word.`
          : "Recognizes a known meaningful part and uses it to reason about an unfamiliar whole word.",

      interpretation: {
        recognizeKnownPart:
          "Record whether the student recognized the known target.",

        inferWholeWord:
          "Record whole-word inference separately from recognition of the known target."
      },

      separationRule:
        "Session Guide Check Transfer is separate from the final Migration Challenge and must not reuse Migration Challenge reserved words."
    };
  }

  function buildMaterialsManifest(plan) {
    return [
      {
        section:
          "retrieve",

        needed:
          plan.retrieve.items.length >
          0,

        status:
          plan.retrieve.items.length >
          0
            ? "generated-from-saved-work"
            : "none"
      },

      {
        section:
          "teachPractice",

        needed:
          true,

        activity:
          plan.teachPractice
            .activity,

        status:
          plan.teachPractice
            .materialStatus
      },

      {
        section:
          "apply",

        needed:
          true,

        status:
          plan.apply
            .materialStatus
      },

      {
        section:
          "transfer",

        needed:
          true,

        status:
          plan.transfer
            .materialStatus
      }
    ];
  }

  function buildRecordingFields() {
    return {
      performance: [
        "independentCorrect",
        "difficultyType",
        "outcomeAfterSupport"
      ],

      support: [
        "accessSupportsUsed",
        "instructionalScaffoldsUsed",
        "supportHistory"
      ],

      adherence: [
        "retrieveCompleted",
        "teachPracticeCompleted",
        "applyCompleted",
        "transferCompleted",
        "sequenceFollowed"
      ],

      rule:
        "Adherence is descriptive implementation data and must remain separate from student performance."
    };
  }

  function buildPlan({
    student = null,
    nextWork = null,
    sessionMinutes = 15
  } = {}) {

    /* FIRST_VOLO_QA_SESSION_OVERRIDE_V1
       DEV-ONLY browser preview.
       Enabled only by:
         ?qaPreview=1&qaTarget=mot&qaActivity=break

       This changes only the in-memory nextWork used for this plan build.
       It does NOT save learner progress or rewrite the learner's next target.
    */
    const qaParams =
      (
        typeof window !== "undefined" &&
        window.location
      )
        ? new URLSearchParams(
            window.location.search
          )
        : null;

    const qaPreview =
      qaParams?.get(
        "qaPreview"
      ) ===
      "1";

    const qaTarget =
      String(
        qaParams?.get(
          "qaTarget"
        ) ||
        ""
      )
        .trim()
        .toLowerCase();

    const qaActivity =
      String(
        qaParams?.get(
          "qaActivity"
        ) ||
        ""
      )
        .trim()
        .toLowerCase();

    if (
      qaPreview &&
      qaTarget === "mot" &&
      qaActivity === "break"
    ) {
      const originalNextWork =
        (
          nextWork &&
          typeof nextWork ===
            "object"
        )
          ? nextWork
          : {};

      const originalTarget =
        (
          originalNextWork?.target &&
          typeof originalNextWork.target ===
            "object"
        )
          ? originalNextWork.target
          : {};

      const qaTargetObject = {
        ...originalTarget,
        id: "mot",
        targetId: "mot",
        morphemeId: "mot",
        label: "mot/mov",
        name: "mot/mov",
        meaning: "move",
        type: "root",
        role: "root"
      };

      nextWork = {
        ...originalNextWork,

        target:
          qaTargetObject,

        targetId:
          "mot",

        morphemeId:
          "mot",

        targetKey:
          "mot",

        targetLabel:
          "mot/mov",

        targetMeaning:
          "move",

        activity:
          "break",

        activityId:
          "break",

        activityKey:
          "break",

        nextActivity:
          "break",

        nextActivityId:
          "break",

        nextMode:
          "break",

        mode:
          "break"
      };
    }

    const guidanceApi =
      window
        .FirstVoloInstructionalGuidance;

    if (!guidanceApi?.buildGuidance) {
      throw new Error(
        "First Volo instructional guidance must load before the session planner."
      );
    }

    const minutes =
      normalizeMinutes(
        sessionMinutes
      );

    const duration =
      getDurationPlan(
        minutes
      );

    const guidance =
      guidanceApi.buildGuidance({
        student,
        nextWork,
        sessionMinutes:
          minutes
      });

    const targetResolver =
      window
        .FirstVoloInstructionalTargetResolver;

    const targetResolution =
      targetResolver
        ?.resolveFromGuidance?.(
          guidance
        ) || null;

    const resolvedPrimary =
      targetResolution
        ?.primary ||
      guidance?.nextWork
        ?.target ||
      guidance?.lastWork
        ?.target ||
      null;

    const plannerGuidance = {
      ...guidance,

      lastWork:
        guidance?.lastWork
          ? {
              ...guidance.lastWork,
              target:
                guidance.lastWork
                  .target ||
                resolvedPrimary
            }
          : null,

      nextWork:
        guidance?.nextWork
          ? {
              ...guidance.nextWork,
              target:
                resolvedPrimary
            }
          : guidance?.nextWork
    };


    const requestedNextActivity =
      plannerGuidance
        ?.nextWork
        ?.activity ||
      nextActivityFrom(
        plannerGuidance
          ?.lastWork
          ?.activity
      );

    const applicabilityResolution =
      resolveApplicableActivity({
        requestedActivity:
          requestedNextActivity,
        lastActivity:
          plannerGuidance
            ?.lastWork
            ?.activity ||
          null,
        target:
          resolvedPrimary
      });

    if (
      applicabilityResolution
        .activity
    ) {
      plannerGuidance.nextWork = {
        ...(
          plannerGuidance
            .nextWork ||
          {}
        ),
        activity:
          applicabilityResolution
            .activity,
        target:
          resolvedPrimary,
        requestedActivity:
          applicabilityResolution
            .requestedActivity,
        activityAdjusted:
          applicabilityResolution
            .adjusted,
        skippedActivities:
          applicabilityResolution
            .skippedActivities
      };
    }


    const retrieve = {
      minutes:
        duration.retrieveMinutes,

      items:
        buildRetrieveItems({
          student,
          guidance:
            plannerGuidance,
          duration
        }),

      rule:
        "Use cumulative retrieval. Begin without reteaching; if the learner previously succeeded with support, start with less support."
    };

    const teachPractice =
      buildTeachPractice({
        guidance:
          plannerGuidance,
        duration
      });

    const apply =
      buildApply({
        guidance:
          plannerGuidance,
        duration
      });

    const transfer =
      buildTransfer({
        guidance:
          plannerGuidance,
        duration
      });

    const plan = {
      version:
        "planner-core-v1",

      generatedAt:
        new Date()
          .toISOString(),

      sessionMinutes:
        minutes,

      duration,

      activitySequence:
        [...ACTIVITY_SEQUENCE],

      lastWork:
        guidance.lastWork,

      nextWork:
        plannerGuidance.nextWork,

      instructionalDecision:
        guidance
          .instructionalDecision,

      targetResolution,

      retrieve,

      teachPractice,

      apply,

      transfer,

      supports:
        guidance.supports,

      supportRule:
        "attempt → identify barrier → least support → another attempt → fade",

      terminologyRule:
        "Use item/family-specific linguistic role; never infer base/root/Greek combining form from Flight.",

      protectionRule:
        "Ordinary Apply, Session Guide Check Transfer, formal assessment targets, and Migration Challenge reserved words remain separate pools."
    };

    const materialSpec =
      window
        .FirstVoloInstructionalMaterials
        ?.buildWordBuildingSpec?.({
          targetResolution,

          familyId:
            targetResolution
              ?.familyId ||
            null
        }) ||
      null;

    const sessionMaterial =
      window
        .FirstVoloInstructionalMaterialResolver
        ?.resolve?.({
          targetResolution,

          sessionMinutes:
            minutes,

          materialSpec,

          activity:
            teachPractice
              ?.activity ||
            "learn",

          gradeBand:
            plannerGuidance
              ?.lastWork
              ?.gradeBand ||
            student
              ?.gradeBand ||
            null,

          vocabLevel:
            plannerGuidance
              ?.lastWork
              ?.vocabLevel ||
            student
              ?.vocabLevel ||
            null
        }) ||
      null;

    plan.materialSpec =
      materialSpec;

    plan.sessionMaterial =
      sessionMaterial;

    /*
      Resolve Apply only after the protection-aware
      session material has been selected.
    */
    plan.apply =
      buildApply({
        guidance:
          plannerGuidance,
        duration,
        sessionMaterial
      });

    plan.materialsManifest =
      buildMaterialsManifest(
        plan
      );

    if (sessionMaterial) {
      plan.materialsManifest.unshift({
        section:
          "shared-session-material",

        family:
          sessionMaterial.family,

        digital:
          Boolean(
            sessionMaterial
              .digital
              ?.enabled
          ),

        print:
          Boolean(
            sessionMaterial
              .print
              ?.enabled
          ),

        cards:
          sessionMaterial
            .tiles
            .length,

        recipes:
          sessionMaterial
            .recipes
            .length,

        protectedWordsExcluded:
          sessionMaterial
            .protection
            .excludedRecipes
            .length,

        status:
          sessionMaterial.ready
            ? "ready"
            : "needs-resolution"
      });
    }

    plan.recording =
      buildRecordingFields();

    return plan;
  }

  function buildPlanForActiveStudent(
    options = {}
  ) {
    const student =
      window
        .FirstVoloActivityProgress
        ?.getActiveStudent?.() ||
      window
        .FirstVoloProgress
        ?.getActiveStudent?.() ||
      null;

    return buildPlan({
      student,
      ...options
    });
  }

  window.FirstVoloInstructionalSessionPlanner = {
    ACTIVITY_SEQUENCE,
    ACTIVITY_LABELS,
    DURATION_PLANS,
    TEACH_PRACTICE_TASKS,
    normalizeMinutes,
    getDurationPlan,
    responseTarget,
    recentResponses,
    buildRetrieveItems,
    nextActivityFrom,
    activityApplicability,
    resolveApplicableActivity,
    buildTeachPractice,
    buildApply,
    buildTransfer,
    buildPlan,
    buildPlanForActiveStudent
  };

})();
