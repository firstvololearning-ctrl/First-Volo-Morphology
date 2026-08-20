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
    }

  };


  /* =========================================
     3. ACCESS SUPPORTS
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
     4. MORPHOLOGY SCAFFOLD LADDERS
     Always least → more support.
     ========================================= */

  const scaffoldLadders = {

    meaning: [
      "Offer two meaning choices.",

      "Provide the established visual meaning cue.",

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
     5. LAST WORK → NEXT WORK TRANSITION LOGIC
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
     6. RETURN ONLY THE RELEVANT SUPPORT LADDER
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
