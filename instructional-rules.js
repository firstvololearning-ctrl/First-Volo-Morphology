"use strict";

(function () {

  /* =========================================
     1. MEANINGFUL STUDENT DIFFICULTY STATES
     ========================================= */

  const difficulties = {
    independent:
      "Successful independently",

    meaning:
      "Cannot recall morpheme meaning",

    identify:
      "Does not identify the morpheme",

    connect:
      "Identifies parts but cannot connect them",

    infer:
      "Knows parts but cannot infer whole-word meaning",

    context:
      "Difficulty using context",

    retrieval:
      "Retrieval / word-finding difficulty",

    directions:
      "Task / direction access difficulty",

    decoding:
      "Nonessential decoding access difficulty"
  };


  /* =========================================
     2. EDUCATOR + STUDENT ACTIONS BY ACTIVITY
     ========================================= */

  const activities = {

    learn: {
      label: "Learn",

      purpose:
        "Establish the target word part, meaning, and a familiar example.",

      educator:
        "Introduce or briefly review the target, then shift the thinking back to the student.",

      student:
        "Connects the target form with its meaning and notices it in a familiar example.",

      difficulties:
        ["meaning", "identify", "retrieval"]
    },


    find: {
      label: "Find",

      purpose:
        "Notice and locate the target inside whole words.",

      educator:
        "Allow the student to scan first; do not pre-highlight the target.",

      student:
        "Identifies the target word part in a whole word.",

      difficulties:
        ["identify"]
    },


    hunt: {
      label: "Word Hunt",

      purpose:
        "Recognize the same meaningful part across changing words.",

      educator:
        "Ask what meaningful part stays the same across words.",

      student:
        "Finds true examples of the target across multiple words.",

      difficulties:
        ["identify"]
    },


    meaning: {
      label: "Meaning",

      purpose:
        "Connect the target word part with its meaning.",

      educator:
        "Check meaning recall before cueing.",

      student:
        "Recalls or selects the target meaning.",

      difficulties:
        ["meaning", "retrieval"]
    },


    morpheme: {
      label: "Word Part",

      purpose:
        "Retrieve the target word part from its meaning.",

      educator:
        "Give the meaning and wait for retrieval before cueing.",

      student:
        "Recalls or selects the matching word part.",

      difficulties:
        ["retrieval", "meaning"]
    },


    break: {
      label: "Break It Apart",

      purpose:
        "Analyze a whole word into meaningful parts.",

      educator:
        "Ask the student to identify meaningful boundaries and explain the known part.",

      student:
        "Breaks a whole word into meaningful parts.",

      difficulties:
        ["identify", "connect"]
    },


    infer: {
      label: "Figure It Out",

      purpose:
        "Use known morphology to infer whole-word meaning.",

      educator:
        "Direct attention to known morphology first; add other information only as needed.",

      student:
        "Uses known morphology and available context to infer an unfamiliar word.",

      difficulties:
        ["identify", "connect", "infer", "context"]
    },


    build: {
      label: "Build Words",

      purpose:
        "Combine meaningful parts to construct a word from meaning.",

      educator:
        "Allow an independent build first and ask what each selected part contributes.",

      student:
        "Combines meaningful parts to build a word that matches the intended meaning.",

      difficulties:
        ["meaning", "connect", "retrieval"]
    },


    use: {
      label: "Use It",

      purpose:
        "Apply morphology in meaningful sentence context.",

      educator:
        "Ask the student to use both morphology and sentence meaning.",

      student:
        "Uses or selects a morphologically appropriate word in context.",

      difficulties:
        ["connect", "infer", "context", "retrieval"]
    },


    change: {
      label: "Change It",

      purpose:
        "Select the appropriate form from a morphological word family using word-part meaning and sentence context.",

      educator:
        "Allow the student to examine the sentence and word-family forms first; do not provide the grammatical or morphological clue before the student's attempt.",

      student:
        "Selects the word-family form whose morphology and sentence role fit the context and connects the relevant word part to its meaning or function.",

      difficulties:
        ["meaning", "connect", "context", "retrieval"]
    }

  };


  /* =========================================
     3. SYSTEM-WIDE TEACHER-LED MATERIAL RULES

     The online student-practice inventory is a source of candidate words,
     not a boundary on teacher-led instruction. The instructional objective
     is chosen first; then the system selects linguistically valid material
     that preserves the target demand.
     ========================================= */

  const teacherLedMaterialRules = Object.freeze({
    objectiveFirst:
      "Choose the instructional objective first. Then select a linguistically valid word that permits that exact demand; material availability must not silently redefine the task.",

    teacherLedUniverse:
      "Teacher-led instruction may use validated words outside the online student-practice pool. The shared inventory and the teacher-word extension registry are both legitimate candidate sources.",

    targetKnowledgeBoundary:
      "When the instructional objective is knowledge or use of one target morpheme, only the target morpheme must be independently known. The student is not required to know every non-target morpheme in the word.",

    nonTargetSupply:
      "After the student's first attempt, the educator/system may supply the meaning or function of an unfamiliar non-target morpheme when that information is needed to keep the target task fair.",

    preserveTargetReasoning:
      "Supplying non-target information is valid only when it does not state the target meaning, identify the target for the student, or complete the target reasoning. Retry the same item after support.",

    noFalseDecomposition:
      "Do not manufacture a student-facing decomposition from opaque, accidental, or merely historical letter structure. Every displayed or supplied word part must be synchronically defensible and instructionally useful for the task.",

    outsidePoolRule:
      "A word must not be rejected merely because it is absent from the online student-practice pool. It may be used when its target relationship is accurate, its whole-word demand is appropriate for the learner, protection rules are satisfied, and any necessary non-target information can be supplied without solving the target demand.",

    unavailableMaterial:
      "If the required item cannot be selected, use only an explicitly approved fallback for that activity or mark the component/duration unavailable. Do not silently substitute a different instructional demand."
  });


  /* =========================================
     4. SYSTEM-WIDE TEACHER-LED TEACHING LOGIC

     These rules govern how a valid word becomes an instructional example.
     Part A is teaching, not a disguised vocabulary test. The student should
     be able to see how the target morpheme contributes to the whole word.
     ========================================= */

  const teacherLedTeachingRules = Object.freeze({
    teachNotMerelyTest:
      "Part A should teach the morpheme-to-word relationship. Do not repeatedly ask for a whole-word definition without making the morphological connection visible after the student's attempt.",

    studentFriendlyDefinitions:
      "Use child- or student-friendly whole-word definitions. A dictionary-style definition may be used as access information, but it is not a substitute for showing how the morphology contributes to the word's meaning.",

    semanticBridge:
      "When a defensible literal or compositional meaning is available, explicitly bridge from the meaningful parts to that literal idea and then to the modern whole-word meaning. Example pattern: non-target meaning + target meaning -> literal bridge -> student-friendly whole-word meaning.",

    contextWhenHelpful:
      "Use a meaningful context sentence when it helps the student connect morphology with the whole-word meaning. Context should support the target reasoning rather than replace it with guessing.",

    clozeWhenHelpful:
      "A cloze sentence or sentence starter may reduce an incidental language-generation burden when that burden competes with the morphology target. Do not use a cloze that gives away the target reasoning.",

    nonTargetInformation:
      "If an unfamiliar non-target morpheme blocks the intended target demand, provide its validated meaning or function after the student's first attempt. The target morpheme remains the student's reasoning job.",

    accessSequence:
      "Independent attempt -> identify the barrier -> give the least support that addresses that barrier -> retry the same target demand -> fade support.",

    noOpaqueRescue:
      "Do not rescue a convenient word by inventing an opaque, accidental, or merely etymological student-facing word part. If the morphological relationship cannot be made accurate and instructionally useful, choose a different word.",

    transferSeparation:
      "Check Transfer remains a transfer check: present the protected word in context with no morphology cue before the first whole-word inference attempt. Teaching supports, including non-target meanings, may be added only after that first response."
  });


  /* =========================================
     5. ACCESS SUPPORTS
     These do NOT solve the morphology task.
     ========================================= */

  const accessRules = {

    directions: [
      "Clarify or read the directions without giving the answer.",

      "If the task is still unclear, model the task with an example that does not appear in the activity."
    ],


    decoding: [
      "Provide the nonessential word so decoding does not block access; do not add morphology help unless a separate morphology barrier appears."
    ]

  };


  /* =========================================
     5. MORPHOLOGY SCAFFOLD LADDERS
     Always least → more support.
     ========================================= */

  const scaffoldLadders = {

    meaning: [
      "Provide the established visual meaning cue.",

      "If still needed, offer two meaning choices.",

      "Model one different example, then immediately give a similar new item."
    ],


    identify: [
      "Ask, “What part do you recognize?”",

      "Highlight or separate the relevant word part.",

      "Model one different example, then immediately give a similar new item."
    ],


    connect: [
      "Provide the meaning of another meaningful part without solving the whole word.",

      "Add clear sentence context if needed.",

      "Model one different example, then immediately give a similar new item."
    ],


    infer: [
      "Ask, “What part do you recognize?”",

      "If the structure is overlooked, highlight or separate the relevant part.",

      "Provide the meaning of another meaningful part.",

      "Add sentence context.",

      "Offer two plausible whole-word meanings.",

      "If a model is needed, model a different item and immediately give a new item."
    ],


    context: [
      "Ask which word or phrase in the sentence helps and how it works with the morphology.",

      "Direct attention to clearer sentence context.",

      "Offer two plausible choices only after the student has attempted to use morphology and context.",

      "Model one different example, then immediately give a similar new item."
    ],


    retrieval: [
      "Provide a partial verbal, first-sound, or established visual cue.",

      "If needed, reduce the response field to two choices.",

      "Model one different example, then immediately give a similar new item."
    ]

  };


  /* =========================================
     6. LAST WORK → NEXT WORK TRANSITION LOGIC
     ========================================= */

  function transition({
    sameTarget = true,
    lastActivity = null,
    nextActivity = null,
    independent = false,
    difficulty = null,
    succeededWithSupport = false
  } = {}) {

    if (!lastActivity) {
      return (
        "Establish the selected target briefly, " +
        "then allow an independent attempt."
      );
    }


    if (!sameTarget) {
      return (
        "The target changed. Briefly establish the new target; " +
        "do not carry the previous target's difficulty forward automatically."
      );
    }


    if (independent) {
      return (
        lastActivity === nextActivity
          ? "The target was independent. Use a new item without added support."
          : "The target was independent. Do not reteach it; give a brief review/retrieval check and move into the next activity."
      );
    }


    if (succeededWithSupport) {
      return (
        "Begin the next opportunity without the previous support. " +
        "If the same barrier reappears, use a lighter scaffold first."
      );
    }


    if (difficulty === "meaning") {
      return (
        "Briefly review the target meaning, " +
        "check retrieval again, then move forward."
      );
    }


    if (difficulty === "identify") {
      return (
        "Briefly practice noticing the known word part in one new example; " +
        "do not pre-highlight the scored item."
      );
    }


    if (difficulty === "connect") {

      if (nextActivity === "infer") {
        return (
          "Do not reteach the target if it was identified. " +
          "Briefly practice connecting the known part to the rest of the word, " +
          "then move into Figure It Out; add context only if needed."
        );
      }

      return (
        "Keep the known target in place and focus on connecting " +
        "meaningful parts to the whole word."
      );
    }


    if (difficulty === "infer") {
      return (
        "Do not reteach the known word part. " +
        "Focus on using known morphology to reason about the whole word; " +
        "add another meaningful part or context only if needed."
      );
    }


    if (difficulty === "context") {
      return (
        "Keep the morphology stable and focus on combining it with " +
        "sentence context rather than reteaching the word part."
      );
    }


    if (difficulty === "retrieval") {
      return (
        "Give a retrieval opportunity first. " +
        "If needed, use the least partial cue and then retry without it."
      );
    }


    if (
      difficulty === "directions" ||
      difficulty === "decoding"
    ) {
      return (
        "Treat this as an access barrier, not a morphology error. " +
        "Remove the access barrier and keep the morphology demand unchanged."
      );
    }


    return (
      "Allow an independent attempt, identify the barrier, " +
      "use the least relevant support, then give another attempt " +
      "and fade after success."
    );
  }


  /* =========================================
     8. RETURN ONLY THE RELEVANT SUPPORT LADDER
     ========================================= */

  function scaffoldPlan(difficulty) {

    if (
      difficulty === "independent" ||
      !difficulty
    ) {
      return {
        category: "none",
        steps: [],
        fade:
          "Begin independently; add support only if a barrier appears."
      };
    }


    if (accessRules[difficulty]) {
      return {
        category: "access",

        steps:
          accessRules[difficulty].slice(),

        fade:
          "Once access is restored, return control of the morphology work to the student."
      };
    }


    return {
      category: "morphology",

      steps:
        (scaffoldLadders[difficulty] || [])
          .slice(),

      fade:
        "Use the least support first. After success, reduce support on the next opportunity."
    };
  }


  window.FirstVoloInstructionalRules = {

    difficulties,

    activities,

    teacherLedMaterialRules,

    teacherLedTeachingRules,

    accessRules,

    scaffoldLadders,

    transition,

    scaffoldPlan,

    supportOrder:
      "attempt → identify barrier → least support → another attempt → fade",

    onlineBoundary:
      "Clarify directions, decode nonessential words, or model the task with examples not in the activity; do not solve the actual morphology item for the student.",

    transferBoundary:
      "Do not preteach the transfer word. If the student does not know where to begin, ask “What part do you recognize?” before adding a stronger morphology scaffold."

  };

})();
