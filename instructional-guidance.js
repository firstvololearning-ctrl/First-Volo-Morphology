"use strict";

/* ========================================
   FIRST VOLO MORPHOLOGY
   DYNAMIC INSTRUCTIONAL GUIDANCE — PASS 1

   Purpose
   -------
   1. Extend the existing progress record with instructional metadata
      without changing the meaning of existing accuracy data.
   2. Read the student's most recent work.
   3. Build a structured teacher-facing handoff for the next session.

   Important design rules
   ----------------------
   - Existing `correct` remains the student's independent/first-check result.
   - Access support is separate from morphology support.
   - Support never rewrites the original independent result.
   - Terminology comes from the specific item/family metadata, never from
     Flight alone. If the exact linguistic role is unavailable, use the
     neutral term "word part" rather than guessing root/base/combining form.
   - Transfer items remain protected and separate from ordinary practice.
   ======================================== */

(function initializeFirstVoloInstructionalGuidance() {
  const ACTIVITY_SEQUENCE = [
    "find",
    "hunt",
    "meaning",
    "morpheme",
    "break",
    "infer",
    "build",
    "use",
    "change"
  ];

  const ACTIVITY_LABELS = {
    find: "Find",
    hunt: "Word Hunt",
    meaning: "Meaning",
    morpheme: "Word Part",
    break: "Break It Apart",
    infer: "Figure It Out",
    build: "Build Words",
    use: "Use It",
    change: "Change It"
  };

  const ACTIVITY_SKILLS = {
    find: {
      target: "locate the target word part inside a whole word",
      studentDoes: "Identifies the target word part in a whole word.",
      educatorFocus: "Check whether the student notices and locates the target independently."
    },
    hunt: {
      target: "recognize the same word part across multiple words",
      studentDoes: "Finds words that contain the target word part.",
      educatorFocus: "Check whether the student recognizes the target across changing word contexts."
    },
    meaning: {
      target: "connect the word part with its meaning",
      studentDoes: "Selects the meaning carried by the target word part.",
      educatorFocus: "Check independent recall of the target meaning before cueing."
    },
    morpheme: {
      target: "recall the word part when given its meaning",
      studentDoes: "Selects the target word part from its meaning.",
      educatorFocus: "Check retrieval of the form from meaning before providing a cue."
    },
    break: {
      target: "analyze the meaningful structure of a whole word",
      studentDoes: "Breaks the whole word into meaningful parts.",
      educatorFocus: "Check whether the student identifies meaningful boundaries rather than relying on visual chunks alone."
    },
    infer: {
      target: "use known morphology to infer whole-word meaning",
      studentDoes: "Uses a known word part and other available information to infer the whole word's meaning.",
      educatorFocus: "Check whether the student connects known morphology to the whole word before adding context support."
    },
    build: {
      target: "combine meaningful parts to build a word from meaning",
      studentDoes: "Selects and combines word parts to build a real word that matches the meaning.",
      educatorFocus: "Allow an independent build first; a retry means the word was not independently built on the first check."
    },
    use: {
      target: "use morphology and sentence context together",
      studentDoes: "Chooses a morphologically appropriate word that fits the sentence.",
      educatorFocus: "Ask the student to explain what information came from morphology and what came from context when appropriate."
    },
    change: {
      target: "select the appropriate member of a word family in context",
      studentDoes: "Uses suffix and sentence clues to select the word-family member that fits.",
      educatorFocus: "Check whether the student uses both morphological form and sentence role."
    }
  };

  const DEFAULT_DIFFICULTY_BY_SKILL = {
    find: "morpheme_identification",
    hunt: "morpheme_recognition_across_words",
    meaning: "morpheme_meaning_recall",
    morpheme: "morpheme_form_retrieval",
    break: "word_segmentation",
    infer: "whole_word_inference",
    build: "word_construction",
    use: "contextual_application",
    change: "morphological_form_selection"
  };

  const ACCESS_SUPPORTS = {
    directions_clarified: {
      label: "Clarify directions",
      rule: "If directions are the barrier, clarify or read the directions without helping with the answer."
    },
    nonessential_word_decoded: {
      label: "Decode a nonessential word",
      rule: "If a nonessential word is blocking access, provide that word so decoding does not interfere with the morphology task."
    },
    task_modeled_different_example: {
      label: "Model the task with a different example",
      rule: "If the student does not understand the task, model how to complete it using an example that does not appear in the activity."
    }
  };

  const INSTRUCTIONAL_SCAFFOLDS = {
    two_meaning_choices: {
      label: "Two meaning choices",
      rule: "If the student cannot recall the word-part meaning, provide a choice of two meanings."
    },
    visual_meaning_cue: {
      label: "Visual meaning cue",
      rule: "If the student needs a meaning reminder, provide the established visual meaning cue, then ask for another attempt."
    },
    show_highlight_morpheme: {
      label: "Show or highlight the word part",
      rule: "If the student does not notice the target word part, show, highlight, or separate it."
    },
    provide_other_part_meaning: {
      label: "Provide the other meaningful part",
      rule: "If the student recognizes the target but cannot connect the parts to the whole word, provide the meaning of the other meaningful part without solving the whole word."
    },
    sentence_context: {
      label: "Sentence context",
      rule: "If the student knows the relevant word part but cannot infer the whole-word meaning, provide clear sentence context."
    },
    partial_retrieval_cue: {
      label: "Partial verbal or visual cue",
      rule: "If the student appears to know the answer but cannot retrieve it, provide a partial verbal, first-sound, or established visual cue."
    },
    model_then_new_item: {
      label: "Model one, then retry with a new item",
      rule: "If the student is still unable to complete the task, model one example aloud and immediately give a similar but different item."
    }
  };

  const SUPPORT_OUTCOMES = new Set([
    "not_needed",
    "successful_after_support",
    "not_successful_after_support",
    "not_observed"
  ]);

  function makeId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function unique(values) {
    return [...new Set(asArray(values).filter(Boolean))];
  }

  function normalizeInstructionalResponse(response) {
    if (!response || typeof response !== "object") {
      return response;
    }

    if (typeof response.independentCorrect !== "boolean") {
      response.independentCorrect = Boolean(response.correct);
    }

    if (!response.difficultyType) {
      response.difficultyType = response.independentCorrect
        ? "none"
        : DEFAULT_DIFFICULTY_BY_SKILL[response.skill] || "other";
    }

    response.accessSupportsUsed = unique(response.accessSupportsUsed);
    response.instructionalScaffoldsUsed = unique(
      response.instructionalScaffoldsUsed
    );
    response.supportHistory = asArray(response.supportHistory);

    if (!SUPPORT_OUTCOMES.has(response.outcomeAfterSupport)) {
      response.outcomeAfterSupport = response.independentCorrect
        ? "not_needed"
        : "not_observed";
    }

    if (!response.linguisticRole) {
      response.linguisticRole = null;
    }

    response.supportingTargetRoles = asArray(
      response.supportingTargetRoles
    );

    return response;
  }

  function normalizeStudentProgress(student) {
    if (!student || !Array.isArray(student.sessions)) {
      return student;
    }

    student.sessions.forEach((session) => {
      asArray(session.responses).forEach(normalizeInstructionalResponse);
    });

    return student;
  }

  function getProgressApi() {
    return window.FirstVoloActivityProgress || null;
  }

  function getActiveStudent() {
    return (
      getProgressApi()?.getActiveStudent?.() ||
      window.FirstVoloProgress?.getActiveStudent?.() ||
      null
    );
  }

  function saveProgress() {
    if (getProgressApi()?.save) {
      getProgressApi().save();
      return;
    }

    window.FirstVoloProgress?.save?.();
  }

  function getLatestResponse(student = getActiveStudent()) {
    normalizeStudentProgress(student);

    if (!student || !Array.isArray(student.sessions)) {
      return null;
    }

    const sessions = student.sessions
      .slice()
      .sort((a, b) => {
        const aDate = a.completedAt || a.startedAt || "";
        const bDate = b.completedAt || b.startedAt || "";
        return bDate.localeCompare(aDate);
      });

    for (const session of sessions) {
      const responses = asArray(session.responses);

      if (responses.length) {
        return {
          session,
          response: normalizeInstructionalResponse(
            responses[responses.length - 1]
          )
        };
      }
    }

    return null;
  }

  function findResponse(responseId, student = getActiveStudent()) {
    normalizeStudentProgress(student);

    if (!student || !responseId) {
      return null;
    }

    for (const session of asArray(student.sessions)) {
      const response = asArray(session.responses).find(
        (entry) => entry.id === responseId
      );

      if (response) {
        return {
          session,
          response: normalizeInstructionalResponse(response)
        };
      }
    }

    return null;
  }

  function recordSupport({
    responseId = null,
    category,
    code,
    outcome = null
  }) {
    const student = getActiveStudent();
    const target = responseId
      ? findResponse(responseId, student)
      : getLatestResponse(student);

    if (!target?.response) {
      return null;
    }

    const response = target.response;

    if (category === "access") {
      if (!ACCESS_SUPPORTS[code]) {
        throw new Error(`Unknown First Volo access support: ${code}`);
      }

      response.accessSupportsUsed = unique([
        ...response.accessSupportsUsed,
        code
      ]);
    } else if (category === "instructional") {
      if (!INSTRUCTIONAL_SCAFFOLDS[code]) {
        throw new Error(`Unknown First Volo instructional scaffold: ${code}`);
      }

      response.instructionalScaffoldsUsed = unique([
        ...response.instructionalScaffoldsUsed,
        code
      ]);
    } else {
      throw new Error("Support category must be access or instructional.");
    }

    if (outcome !== null) {
      if (!SUPPORT_OUTCOMES.has(outcome)) {
        throw new Error(`Unknown First Volo support outcome: ${outcome}`);
      }

      response.outcomeAfterSupport = outcome;
    }

    response.supportHistory.push({
      id: makeId("support"),
      recordedAt: new Date().toISOString(),
      category,
      code,
      outcome
    });

    saveProgress();
    return response;
  }

  function setDifficulty({
    responseId = null,
    difficultyType
  }) {
    const student = getActiveStudent();
    const target = responseId
      ? findResponse(responseId, student)
      : getLatestResponse(student);

    if (!target?.response) {
      return null;
    }

    target.response.difficultyType = difficultyType || "other";
    saveProgress();
    return target.response;
  }

  function setSupportOutcome({
    responseId = null,
    outcome
  }) {
    if (!SUPPORT_OUTCOMES.has(outcome)) {
      throw new Error(`Unknown First Volo support outcome: ${outcome}`);
    }

    const student = getActiveStudent();
    const target = responseId
      ? findResponse(responseId, student)
      : getLatestResponse(student);

    if (!target?.response) {
      return null;
    }

    target.response.outcomeAfterSupport = outcome;
    saveProgress();
    return target.response;
  }

  function patchActivityProgressRecording() {
    const api = getProgressApi();

    if (!api || api.__instructionalGuidancePatched) {
      return;
    }

    const originalRecordResponse = api.recordResponse.bind(api);

    api.recordResponse = function recordResponseWithInstructionalState(details) {
      const entry = originalRecordResponse(details);

      if (!entry) {
        return entry;
      }

      normalizeInstructionalResponse(entry);

      if (details?.difficultyType) {
        entry.difficultyType = details.difficultyType;
      }

      if (details?.linguisticRole) {
        entry.linguisticRole = details.linguisticRole;
      }

      if (Array.isArray(details?.supportingTargetRoles)) {
        entry.supportingTargetRoles = details.supportingTargetRoles;
      }

      if (Array.isArray(details?.accessSupportsUsed)) {
        entry.accessSupportsUsed = unique(details.accessSupportsUsed);
      }

      if (Array.isArray(details?.instructionalScaffoldsUsed)) {
        entry.instructionalScaffoldsUsed = unique(
          details.instructionalScaffoldsUsed
        );
      }

      if (SUPPORT_OUTCOMES.has(details?.outcomeAfterSupport)) {
        entry.outcomeAfterSupport = details.outcomeAfterSupport;
      }

      api.save?.();
      return entry;
    };

    api.recordSupport = recordSupport;
    api.setDifficulty = setDifficulty;
    api.setSupportOutcome = setSupportOutcome;
    api.getLatestResponse = getLatestResponse;
    api.__instructionalGuidancePatched = true;
  }

  function getMorphemeById(id) {
    if (!id) return null;

    return asArray(window.FIRST_VOLO_MORPHEME_INVENTORY).find(
      (item) => item.id === id
    ) || null;
  }

  function getFlightLabel(gradeBand) {
    const labels = {
      "2-3": "Flight A",
      "4-5": "Flight B",
      "6-8": "Flight C"
    };

    return labels[gradeBand] || gradeBand || "Practice Flight";
  }

  function formatVocabularyLevel(value) {
    const labels = {
      all: "All Vocabulary",
      familiar: "Familiar",
      academic: "Academic",
      challenge: "Stretch Words"
    };

    return labels[value] || value || "Vocabulary level not saved";
  }

  function getExactRole({
    linguisticRole = null,
    targetType = null
  } = {}) {
    if (linguisticRole) {
      return linguisticRole;
    }

    if (targetType === "prefix") {
      return "prefix";
    }

    if (targetType === "suffix") {
      return "suffix";
    }

    /*
      Deliberately do not turn `root` into the teacher-facing word "root".
      The app's blue Roots category also contains bases / combining forms.
      The exact term must come from item/family metadata.
    */
    return "word part";
  }

  function getTargetDescriptor(response) {
    const primaryMeta = getMorphemeById(response?.primaryTargetId);
    const label =
      response?.primaryTarget ||
      primaryMeta?.label ||
      null;

    const meaning = primaryMeta?.meaning || null;
    const role = getExactRole(response);

    if (!label) {
      const supportingTargets = unique(response?.supportingTargets);

      return {
        label: supportingTargets.join(" + ") || "current word structure",
        meaning: null,
        role: response?.targetType === "word-building"
          ? "word structure"
          : "word part"
      };
    }

    return {
      label,
      meaning,
      role
    };
  }

  function sessionSummary(session) {
    const responses = asArray(session?.responses).map(
      normalizeInstructionalResponse
    );

    const attempted = responses.length;
    const independentCorrect = responses.filter(
      (response) => response.independentCorrect
    ).length;

    return {
      attempted,
      independentCorrect,
      independentAccuracy: attempted
        ? Math.round((independentCorrect / attempted) * 100)
        : null,
      responses
    };
  }

  function getLastWork(student) {
    normalizeStudentProgress(student);

    if (!student || !Array.isArray(student.sessions)) {
      return null;
    }

    const session = student.sessions
      .filter((item) => asArray(item.responses).length > 0)
      .slice()
      .sort((a, b) => {
        const aDate = a.completedAt || a.startedAt || "";
        const bDate = b.completedAt || b.startedAt || "";
        return bDate.localeCompare(aDate);
      })[0];

    if (!session) {
      return null;
    }

    const summary = sessionSummary(session);
    const latest = summary.responses[summary.responses.length - 1] || null;
    const target = getTargetDescriptor(latest);

    return {
      session,
      latestResponse: latest,
      flight: getFlightLabel(session.gradeBand),
      gradeBand: session.gradeBand || null,
      vocabularyLevel: formatVocabularyLevel(session.vocabLevel),
      vocabLevel: session.vocabLevel || null,
      studyMode: session.studyMode || null,
      activity: session.activity || latest?.skill || null,
      activityLabel: ACTIVITY_LABELS[session.activity || latest?.skill] || "Activity",
      target,
      word: latest?.word || null,
      attempted: summary.attempted,
      independentCorrect: summary.independentCorrect,
      independentAccuracy: summary.independentAccuracy,
      difficultyType: latest?.difficultyType || null,
      accessSupportsUsed: unique(latest?.accessSupportsUsed),
      instructionalScaffoldsUsed: unique(
        latest?.instructionalScaffoldsUsed
      ),
      outcomeAfterSupport: latest?.outcomeAfterSupport || null
    };
  }

  function nextActivityAfter(activity) {
    const index = ACTIVITY_SEQUENCE.indexOf(activity);

    if (index < 0 || index === ACTIVITY_SEQUENCE.length - 1) {
      return null;
    }

    return ACTIVITY_SEQUENCE[index + 1];
  }


  function getInstructionalDifficulty(lastWork) {
    const response =
      lastWork?.latestResponse || null;

    if (!response) {
      return null;
    }

    if (response.independentCorrect) {
      return "independent";
    }

    const saved =
      response.difficultyType ||
      lastWork?.difficultyType ||
      null;

    const map = {
      none:
        "independent",

      morpheme_meaning_recall:
        "meaning",

      morpheme_identification:
        "identify",

      morpheme_recognition_across_words:
        "identify",

      morpheme_form_retrieval:
        "retrieval",

      word_segmentation:
        "connect",

      whole_word_inference:
        "infer",

      word_construction:
        "connect",

      contextual_application:
        "context",

      morphological_form_selection:
        "context",

      task_directions:
        "directions",

      directions:
        "directions",

      nonessential_decoding:
        "decoding",

      decoding:
        "decoding",

      meaning:
        "meaning",

      identify:
        "identify",

      connect:
        "connect",

      infer:
        "infer",

      context:
        "context",

      retrieval:
        "retrieval"
    };

    return map[saved] || saved || null;
  }


  function buildInstructionalDecision({
    lastWork,
    nextWork
  }) {
    const rules =
      window.FirstVoloInstructionalRules;

    if (!rules) {
      return null;
    }

    const difficulty =
      getInstructionalDifficulty(lastWork);

    const response =
      lastWork?.latestResponse || null;

    const sameTarget =
      Boolean(
        lastWork?.target?.label &&
        nextWork?.target?.label &&
        lastWork.target.label ===
          nextWork.target.label
      );

    const independent =
      Boolean(
        response?.independentCorrect
      );

    const succeededWithSupport =
      response?.outcomeAfterSupport ===
        "successful_after_support";

    const transition =
      rules.transition({
        sameTarget:
          nextWork?.target?.label
            ? sameTarget
            : true,

        lastActivity:
          lastWork?.activity || null,

        nextActivity:
          nextWork?.activity || null,

        independent,

        difficulty,

        succeededWithSupport
      });

    const scaffold =
      rules.scaffoldPlan(
        difficulty
      );

    return {
      difficulty,
      difficultyLabel:
        difficulty
          ? rules.difficulties?.[difficulty] ||
            difficulty
          : null,

      sameTarget,

      independent,

      succeededWithSupport,

      lastActivity:
        lastWork?.activity || null,

      nextActivity:
        nextWork?.activity || null,

      transition,

      scaffoldCategory:
        scaffold?.category || "none",

      scaffoldSteps:
        Array.isArray(scaffold?.steps)
          ? scaffold.steps
          : [],

      fade:
        scaffold?.fade || null
    };
  }


  function relevantScaffoldCodes(lastWork) {
    if (!lastWork?.latestResponse) {
      return [];
    }

    const response = lastWork.latestResponse;
    const codes = [];

    switch (response.difficultyType) {
      case "morpheme_meaning_recall":
        codes.push("two_meaning_choices", "visual_meaning_cue");
        break;
      case "morpheme_identification":
      case "morpheme_recognition_across_words":
        codes.push("show_highlight_morpheme");
        break;
      case "morpheme_form_retrieval":
        codes.push("partial_retrieval_cue");
        break;
      case "word_segmentation":
        codes.push("show_highlight_morpheme", "provide_other_part_meaning");
        break;
      case "whole_word_inference":
        codes.push("provide_other_part_meaning", "sentence_context");
        break;
      case "word_construction":
      case "contextual_application":
      case "morphological_form_selection":
        codes.push("provide_other_part_meaning", "sentence_context");
        break;
      default:
        break;
    }

    if (!response.independentCorrect) {
      codes.push("model_then_new_item");
    }

    return unique(codes);
  }

  function formatTargetPhrase(target) {
    if (!target?.label) {
      return "the current target";
    }

    const role = target.role || "word part";

    if (target.meaning) {
      return `${role} ${target.label} = ${target.meaning}`;
    }

    return `${role} ${target.label}`;
  }

  function buildRetrieveStep(lastWork) {
    if (!lastWork) {
      return {
        heading: "Retrieve",
        educatorDoes: "Begin with a brief retrieval check of the selected target before teaching or practice.",
        studentDoes: "Recalls or identifies the selected target as independently as possible.",
        rationale: "No prior saved activity is available for this student yet."
      };
    }

    const targetPhrase = formatTargetPhrase(lastWork.target);
    const response = lastWork.latestResponse;

    if (response?.independentCorrect) {
      return {
        heading: "Retrieve",
        educatorDoes: `Briefly review ${targetPhrase} by giving one quick retrieval item. Allow the student to respond before providing help.`,
        studentDoes: `Recalls or identifies ${lastWork.target.label} independently.`,
        rationale: "The most recent saved response was independent; use retrieval as a quick check and move forward if it remains secure."
      };
    }

    if (response?.outcomeAfterSupport === "successful_after_support") {
      return {
        heading: "Retrieve",
        educatorDoes: `Revisit ${targetPhrase}, beginning with less support than was needed last time.`,
        studentDoes: `Attempts ${lastWork.target.label} first without the previous scaffold.`,
        rationale: "The student succeeded after support last time, so the next opportunity should test whether that support can be faded."
      };
    }

    return {
      heading: "Retrieve",
      educatorDoes: `Revisit ${targetPhrase}. Allow an independent attempt first, then use the least relevant support only if needed.`,
      studentDoes: `Attempts to recall, identify, or explain ${lastWork.target.label} before receiving morphology support.`,
      rationale: "The most recent saved response was not independent."
    };
  }

  function buildTeachPracticeStep(lastWork, nextWork) {
    const activity = nextWork?.activity || nextActivityAfter(lastWork?.activity);
    const profile = ACTIVITY_SKILLS[activity];
    const activityLabel = ACTIVITY_LABELS[activity] || "selected activity";
    const target = nextWork?.target || lastWork?.target || null;
    const targetPhrase = formatTargetPhrase(target);

    if (!activity || !profile) {
      return {
        heading: "Teach / Practice",
        educatorDoes: "Select the next activity and target, then provide only the support needed for access or morphology learning.",
        studentDoes: "Completes the selected work as independently as possible.",
        nextActivity: null
      };
    }

    return {
      heading: "Teach / Practice",
      educatorDoes: `Use ${activityLabel} with ${targetPhrase}. ${profile.educatorFocus}`,
      studentDoes: profile.studentDoes,
      nextActivity: activity,
      nextActivityLabel: activityLabel,
      target: target
    };
  }

  function buildApplyStep(lastWork, nextWork) {
    const target = nextWork?.target || lastWork?.target || null;
    const targetPhrase = formatTargetPhrase(target);

    return {
      heading: "Apply",
      educatorDoes: `Give a brief productive application using ${targetPhrase}: have the student build, explain, or use a related word rather than only recognize the target.`,
      studentDoes: "Uses the target in word analysis, word building, explanation, or meaningful sentence context and explains the contribution of the word part when appropriate."
    };
  }

  function buildTransferStep(lastWork, nextWork) {
    const target = nextWork?.target || lastWork?.target || null;

    return {
      heading: "Check Transfer",
      educatorDoes: "Use 1–2 protected transfer items for the target. Do not preteach the transfer word. Start with no morphology cue and add the least support only if needed.",
      studentDoes: target?.label
        ? `Attempts to recognize ${target.label} and use it to reason about an unfamiliar word.`
        : "Attempts to recognize a known meaningful part and use it to reason about an unfamiliar word.",
      protected: true,
      interpretation: "Record recognition of the known morpheme separately from successful inference of the whole word."
    };
  }

  function buildRelevantSupports(
    lastWork,
    nextWork,
    decision = null
  ) {
    const rules =
      window.FirstVoloInstructionalRules;

    const resolvedDecision =
      decision ||
      buildInstructionalDecision({
        lastWork,
        nextWork
      });

    const morphology =
      resolvedDecision?.scaffoldCategory ===
        "morphology"
        ? resolvedDecision.scaffoldSteps.map(
            (rule, index) => ({
              code:
                `conditional-${index + 1}`,
              label:
                `Support ${index + 1}`,
              rule
            })
          )
        : [];

    const access =
      resolvedDecision?.scaffoldCategory ===
        "access"
        ? resolvedDecision.scaffoldSteps.map(
            (rule, index) => ({
              code:
                `access-${index + 1}`,
              label:
                `Access support ${index + 1}`,
              rule
            })
          )
        : Object.entries(
            ACCESS_SUPPORTS
          ).map(
            ([code, value]) => ({
              code,
              ...value
            })
          );

    return {
      access,
      morphology,

      category:
        resolvedDecision?.scaffoldCategory ||
        "none",

      difficulty:
        resolvedDecision?.difficulty ||
        null,

      difficultyLabel:
        resolvedDecision?.difficultyLabel ||
        null,

      fadeRule:
        resolvedDecision?.fade ||
        rules?.supportOrder ||
        "After success, reduce support on the next opportunity."
    };
  }

  function buildGuidance({
    student = getActiveStudent(),
    nextWork = null,
    sessionMinutes = 15
  } = {}) {
    normalizeStudentProgress(student);

    const lastWork = getLastWork(student);
    const fallbackNextActivity = nextActivityAfter(lastWork?.activity);

    const resolvedNextWork = nextWork || (
      fallbackNextActivity
        ? {
            activity: fallbackNextActivity,
            target: lastWork?.target || null,
            flight: lastWork?.flight || null,
            gradeBand: lastWork?.gradeBand || null,
            vocabLevel: lastWork?.vocabLevel || null,
            studyMode: lastWork?.studyMode || null,
            isSuggested: true
          }
        : null
    );

    const instructionalDecision =
      buildInstructionalDecision({
        lastWork,
        nextWork: resolvedNextWork
      });

    return {
      generatedAt: new Date().toISOString(),
      sessionMinutes,
      lastWork,
      nextWork: resolvedNextWork,
      instructionalDecision,
      needsExplicitNextSelection: !nextWork,
      sequence: [
        buildRetrieveStep(lastWork),
        buildTeachPracticeStep(lastWork, resolvedNextWork),
        buildApplyStep(lastWork, resolvedNextWork),
        buildTransferStep(lastWork, resolvedNextWork)
      ],
      supports: buildRelevantSupports(
        lastWork,
        resolvedNextWork,
        instructionalDecision
      ),
      rules: {
        supportOrder: "attempt → identify barrier → least support → another attempt → fade",
        onlineBoundary: "Clarify directions, decode nonessential words, or model the task with examples not in the activity; do not solve the scored target item for the student.",
        terminology: "Use the exact linguistic term attached to the specific item/family. Never infer base/root/Greek combining form from Flight alone.",
        transfer: "Keep protected transfer items out of ordinary teaching/practice and do not preteach the transfer word."
      }
    };
  }

  function getGuidanceForActiveStudent(options = {}) {
    return buildGuidance({
      student: getActiveStudent(),
      ...options
    });
  }

  patchActivityProgressRecording();

  window.FirstVoloInstructionalGuidance = {
    ACTIVITY_SEQUENCE,
    ACTIVITY_LABELS,
    ACTIVITY_SKILLS,
    ACCESS_SUPPORTS,
    INSTRUCTIONAL_SCAFFOLDS,
    DEFAULT_DIFFICULTY_BY_SKILL,
    normalizeInstructionalResponse,
    normalizeStudentProgress,
    recordSupport,
    setDifficulty,
    setSupportOutcome,
    getLatestResponse,
    getLastWork,
    getInstructionalDifficulty,
    buildInstructionalDecision,
    buildGuidance,
    getGuidanceForActiveStudent,
    getExactRole,
    patchActivityProgressRecording
  };
})();
