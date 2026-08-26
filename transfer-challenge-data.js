"use strict";

/*
  First Volo Morphology — Transfer Challenge

  Purpose:
  Confirm that a learner can apply familiar morphemes
  to grade-appropriate words independently after all
  Volo Tokens for a Practice Flight have been earned.

  IMPORTANT:
  - Transfer Challenge scores do NOT affect Volo Tokens.
  - Transfer Challenge scores do NOT become practice accuracy.
  - Transfer Challenge items are separate from formal Pre/Post items.
  - Words in this file are RESERVED for transfer.
  - Regular Learn/practice activities filter these words out
    so they remain unseen for independent transfer.
  - Passing the Transfer Challenge allows the migration
    system to unlock Winter Home / Post-Test Ready.

  Two parallel forms are provided for each Practice Flight.
  A failed attempt should use the alternate form next.
*/

(function () {

  const VERSION = "v1";

  const RULES = Object.freeze({
    itemsPerAttempt: 5,
    correctNeeded: 4,
    passingPercent: 0.80,

    timed: false,
    hintsDuringAttempt: false,

    affectsTokens: false,
    affectsPracticeAccuracy: false,
    affectsFormalAssessment: false,

    alternateFormAfterFailure: true,
    sameFormTwiceInRow: false,

    passedStatusPersists: true
  });


  /*
    Grade-band design rules are deliberately conservative.

    Flight A:
      familiar vocabulary
      high transparency
      simple, prominent morphology
      4-choice contextual reasoning / clean analysis

    Flight B:
      familiar or academic vocabulary
      high or medium transparency
      one or more meaningful parts
      contextual inference + some multi-part analysis

    Flight C:
      familiar or academic vocabulary
      high or medium transparency
      greater morphological complexity is appropriate
      contextual inference + multi-part reasoning

    a-ad is excluded because it has a limited-application
    token profile.

    put is excluded because it has a recognition-only
    token profile.
  */
  const GRADE_RULES = Object.freeze({
    "2-3": {
      flightId: "A",
      label: "Flight A",
      collection: "Foundation",

      allowedVocabLevels: [
        "familiar"
      ],

      allowedTransparency: [
        "high"
      ],

      excludedTargetIds: []
    },

    "4-5": {
      flightId: "B",
      label: "Flight B",
      collection: "Expansion",

      allowedVocabLevels: [
        "familiar",
        "academic"
      ],

      allowedTransparency: [
        "high",
        "medium"
      ],

      excludedTargetIds: []
    },

    "6-8": {
      flightId: "C",
      label: "Flight C",
      collection: "Advanced",

      allowedVocabLevels: [
        "familiar",
        "academic"
      ],

      allowedTransparency: [
        "high",
        "medium"
      ],

      excludedTargetIds: [
        "a-ad",
        "put"
      ]
    }
  });


  const FLIGHTS = Object.freeze({

    /* ========================================
       FLIGHT A · GRADES 2–3
       Familiar + highly transparent
       ======================================== */

    "2-3": {
      flightId: "A",
      label: "Flight A",
      collection: "Foundation",

      forms: {

        "form-a": {
          id: "form-a",
          label: "Transfer Form A",

          items: [
            {
              id: "A-A-01",
              word: "pregame",
              type: "choice",
              skill: "context-inference",

              primaryTargetIds: [
                "pre"
              ],

              prompt:
                "The players listened to a pregame talk in the locker room. What does pregame most likely mean?",

              choices: [
                "something before the game",
                "something after the game",
                "playing the game again",
                "playing the game incorrectly"
              ],

              answer:
                "something before the game"
            },

            {
              id: "A-A-02",
              word: "misplace",
              type: "choice",
              skill: "context-inference",

              primaryTargetIds: [
                "mis"
              ],

              prompt:
                "Kai misplaced his library book and could not remember where he put it. What does misplace most likely mean?",

              choices: [
                "put something in the wrong place",
                "put something back again",
                "put something away before using it",
                "not put something anywhere"
              ],

              answer:
                "put something in the wrong place"
            },

            {
              id: "A-A-03",
              word: "fearless",
              type: "choice",
              skill: "context-inference",

              primaryTargetIds: [
                "less"
              ],

              prompt:
                "The fearless climber stayed calm near the top of the wall. What does fearless most likely mean?",

              choices: [
                "without fear",
                "full of fear",
                "afraid again",
                "more afraid"
              ],

              answer:
                "without fear"
            },

            {
              id: "A-A-04",
              word: "rebuild",
              type: "choice",
              skill: "context-inference",

              primaryTargetIds: [
                "re"
              ],

              prompt:
                "The wind knocked down the block tower, so Ava decided to rebuild it. What does rebuild mean?",

              choices: [
                "build again",
                "build before",
                "build incorrectly",
                "not build"
              ],

              answer:
                "build again"
            },

            {
              id: "A-A-05",
              word: "readable",
              type: "choice",
              skill: "analysis",

              primaryTargetIds: [
                "able-ible"
              ],

              prompt:
                "Which split shows the meaningful parts in readable?",

              choices: [
                "read-able",
                "rea-dable",
                "readab-le",
                "re-adable"
              ],

              answer:
                "read-able"
            }
          ]
        },


        "form-b": {
          id: "form-b",
          label: "Transfer Form B",

          items: [
            {
              id: "A-B-01",
              word: "overcook",
              type: "choice",
              skill: "context-inference",

              primaryTargetIds: [
                "over"
              ],

              prompt:
                "If you overcook the pasta, it may become too soft. What does overcook most likely mean?",

              choices: [
                "cook too much",
                "cook again",
                "cook before",
                "cook underneath"
              ],

              answer:
                "cook too much"
            },

            {
              id: "A-B-02",
              word: "kindness",
              type: "choice",
              skill: "analysis",

              primaryTargetIds: [
                "ness"
              ],

              prompt:
                "Which split shows the meaningful parts in kindness?",

              choices: [
                "kind-ness",
                "ki-ndness",
                "kindn-ess",
                "kin-dness"
              ],

              answer:
                "kind-ness"
            },

            {
              id: "A-B-03",
              word: "midpoint",
              type: "choice",
              skill: "context-inference",

              primaryTargetIds: [
                "mid"
              ],

              prompt:
                "The midpoint of the trail is halfway between the start and the end. What does midpoint mean?",

              choices: [
                "the point in the middle",
                "the first point",
                "the final point",
                "a point underneath"
              ],

              answer:
                "the point in the middle"
            },

            {
              id: "A-B-04",
              word: "unfair",
              type: "choice",
              skill: "context-inference",

              primaryTargetIds: [
                "un-negation"
              ],

              prompt:
                "Giving one team extra turns would be unfair. What does unfair most likely mean?",

              choices: [
                "not fair",
                "fair again",
                "fair before",
                "very fair"
              ],

              answer:
                "not fair"
            },

            {
              id: "A-B-05",
              word: "speechless",
              type: "choice",
              skill: "analysis",

              primaryTargetIds: [
                "less"
              ],

              prompt:
                "Which split shows the meaningful parts in speechless?",

              choices: [
                "speech-less",
                "spe-echless",
                "speechl-ess",
                "spee-chless"
              ],

              answer:
                "speech-less"
            }
          ]
        }
      }
    },


    /* ========================================
       FLIGHT B · GRADES 4–5
       Familiar/academic + high/medium transparency
       ======================================== */

    "4-5": {
      flightId: "B",
      label: "Flight B",
      collection: "Expansion",

      forms: {

        "form-a": {
          id: "form-a",
          label: "Transfer Form A",

          items: [
            {
              id: "B-A-01",
              word: "export",
              type: "choice",
              skill: "context-inference",

              primaryTargetIds: [
                "e-ex",
                "port"
              ],

              prompt:
                "A farm exports oranges to stores in other countries. What does export most likely mean?",

              choices: [
                "carry or send out of a place",
                "carry into a place",
                "look closely at something",
                "build something again"
              ],

              answer:
                "carry or send out of a place"
            },

            {
              id: "B-A-02",
              word: "biology",
              type: "multi",
              skill: "analysis",

              primaryTargetIds: [
                "bio",
                "ology"
              ],

              prompt:
                "Choose the two taught word parts that help explain biology.",

              choices: [
                "bio",
                "geo",
                "graph",
                "ology",
                "therm",
                "ist"
              ],

              answer: [
                "bio",
                "ology"
              ]
            },

            {
              id: "B-A-03",
              word: "classify",
              type: "choice",
              skill: "context-inference",

              primaryTargetIds: [
                "ify"
              ],

              prompt:
                "Students classify the rocks by putting similar rocks into groups. What does classify most likely mean?",

              choices: [
                "sort into groups or classes",
                "write about something",
                "measure something",
                "move something across"
              ],

              answer:
                "sort into groups or classes"
            },

            {
              id: "B-A-04",
              word: "semicircle",
              type: "choice",
              skill: "morpheme-application",

              primaryTargetIds: [
                "semi"
              ],

              prompt:
                "If semi- means half, what is a semicircle?",

              choices: [
                "half of a circle",
                "two circles",
                "a circle inside another circle",
                "a circle drawn again"
              ],

              answer:
                "half of a circle"
            },

            {
              id: "B-A-05",
              word: "portable",
              type: "choice",
              skill: "context-inference",

              primaryTargetIds: [
                "port"
              ],

              supportingTargetIds: [
                "able-ible"
              ],

              prompt:
                "A portable speaker can be carried from room to room. What does portable most likely mean?",

              choices: [
                "able to be carried",
                "able to be watched",
                "able to be broken",
                "able to be written"
              ],

              answer:
                "able to be carried"
            }
          ]
        },


        "form-b": {
          id: "form-b",
          label: "Transfer Form B",

          items: [
            {
              id: "B-B-01",
              word: "manuscript",
              type: "choice",
              skill: "context-inference",

              primaryTargetIds: [
                "scrib"
              ],

              prompt:
                "An author sent a manuscript to an editor. If scrib/script means write, what is a manuscript most likely to be?",

              choices: [
                "a written document",
                "a measuring tool",
                "a picture seen from far away",
                "a broken object"
              ],

              answer:
                "a written document"
            },

            {
              id: "B-B-02",
              word: "modernize",
              type: "choice",
              skill: "morpheme-application",

              primaryTargetIds: [
                "ize"
              ],

              prompt:
                "A school plans to modernize its old computer lab. What does modernize most likely mean?",

              choices: [
                "make it more modern",
                "study its history",
                "measure its size",
                "move it somewhere else"
              ],

              answer:
                "make it more modern"
            },

            {
              id: "B-B-03",
              word: "visible",
              type: "choice",
              skill: "context-inference",

              primaryTargetIds: [
                "vis"
              ],

              supportingTargetIds: [
                "able-ible"
              ],

              prompt:
                "The moon was clearly visible through the window. What does visible most likely mean?",

              choices: [
                "able to be seen",
                "able to be heard",
                "able to be carried",
                "able to be measured"
              ],

              answer:
                "able to be seen"
            },

            {
              id: "B-B-04",
              word: "thermometer",
              type: "multi",
              skill: "analysis",

              primaryTargetIds: [
                "therm",
                "metr"
              ],

              prompt:
                "Choose the two taught word parts that help explain thermometer.",

              choices: [
                "therm",
                "metr",
                "geo",
                "phon",
                "spect",
                "rupt"
              ],

              answer: [
                "therm",
                "metr"
              ]
            },

            {
              id: "B-B-05",
              word: "poetic",
              type: "choice",
              skill: "morpheme-application",

              primaryTargetIds: [
                "ic"
              ],

              prompt:
                "The writer used poetic language in the story. What does poetic most likely mean?",

              choices: [
                "related to or like poetry",
                "without poetry",
                "a person who studies poetry",
                "to make something into poetry"
              ],

              answer:
                "related to or like poetry"
            }
          ]
        }
      }
    },


    /* ========================================
       FLIGHT C · GRADES 6–8
       Academic/familiar + deeper reasoning
       ======================================== */

    "6-8": {
      flightId: "C",
      label: "Flight C",
      collection: "Advanced",

      forms: {

        "form-a": {
          id: "form-a",
          label: "Transfer Form A",

          items: [
            {
              id: "C-A-01",
              word: "credence",
              type: "choice",
              skill: "context-inference",

              primaryTargetIds: [
                "cred"
              ],

              prompt:
                "After the scientist repeated the experiment and got the same result, other researchers gave more credence to the claim. What does credence most likely mean?",

              choices: [
                "belief or acceptance that something is true",
                "a reason to repeat something",
                "a way to measure a result",
                "doubt that something happened"
              ],

              answer:
                "belief or acceptance that something is true"
            },

            {
              id: "C-A-02",
              word: "detract",
              type: "choice",
              skill: "context-inference",

              primaryTargetIds: [
                "tract"
              ],

              supportingTargetIds: [
                "de"
              ],

              prompt:
                "The distracting background noise detracted from the presentation. What does detracted most likely mean?",

              choices: [
                "pulled attention or value away",
                "added more detail",
                "brought ideas together",
                "sent something forward"
              ],

              answer:
                "pulled attention or value away"
            },

            {
              id: "C-A-03",
              word: "subsequent",
              type: "choice",
              skill: "context-inference",

              primaryTargetIds: [
                "sequ"
              ],

              prompt:
                "The first experiment failed, but a subsequent experiment succeeded. What does subsequent most likely mean?",

              choices: [
                "following after",
                "happening before",
                "moving away",
                "turning around"
              ],

              answer:
                "following after"
            },

            {
              id: "C-A-04",
              word: "acceptance",
              type: "choice",
              skill: "morpheme-application",

              primaryTargetIds: [
                "ance"
              ],

              prompt:
                "In acceptance, what job does -ance help do?",

              choices: [
                "name an action, state, or quality related to accepting",
                "show that something happened in the past",
                "show that something is able to be accepted",
                "show the opposite of accepting"
              ],

              answer:
                "name an action, state, or quality related to accepting"
            },

            {
              id: "C-A-05",
              word: "abnormal",
              type: "choice",
              skill: "context-inference",

              primaryTargetIds: [
                "ab"
              ],

              prompt:
                "A test result far outside the normal range may be described as abnormal. What does abnormal most likely mean?",

              choices: [
                "away from or outside what is normal",
                "exactly the same as normal",
                "normal again",
                "moving toward normal"
              ],

              answer:
                "away from or outside what is normal"
            }
          ]
        },


        "form-b": {
          id: "form-b",
          label: "Transfer Form B",

          items: [
            {
              id: "C-B-01",
              word: "evaluate",
              type: "choice",
              skill: "context-inference",

              primaryTargetIds: [
                "val"
              ],

              prompt:
                "The committee will evaluate each proposal before choosing one. What does evaluate most likely mean?",

              choices: [
                "judge its value or quality",
                "move it to another place",
                "write it again",
                "put it in order"
              ],

              answer:
                "judge its value or quality"
            },

            {
              id: "C-B-02",
              word: "intervene",
              type: "choice",
              skill: "context-inference",

              primaryTargetIds: [
                "ven"
              ],

              supportingTargetIds: [
                "inter"
              ],

              prompt:
                "A teacher intervened when the disagreement became serious. What does intervened most likely mean?",

              choices: [
                "came between to become involved",
                "moved completely away",
                "looked at something again",
                "continued without acting"
              ],

              answer:
                "came between to become involved"
            },

            {
              id: "C-B-03",
              word: "dejection",
              type: "multi",
              skill: "analysis",

              primaryTargetIds: [
                "ject"
              ],

              supportingTargetIds: [
                "de",
                "ion"
              ],

              prompt:
                "Choose the three taught word parts that help explain dejection.",

              choices: [
                "de",
                "pro",
                "ject",
                "tract",
                "ion",
                "ence"
              ],

              answer: [
                "de",
                "ject",
                "ion"
              ]
            },

            {
              id: "C-B-04",
              word: "dependent",
              type: "choice",
              skill: "morpheme-application",

              primaryTargetIds: [
                "ant-ent-adjective"
              ],

              prompt:
                "In dependent, what job does -ent help do?",

              choices: [
                "help describe someone or something that depends on something else",
                "show that something happened before",
                "show that something is without dependence",
                "show that something is happening again"
              ],

              answer:
                "help describe someone or something that depends on something else"
            },

            {
              id: "C-B-05",
              word: "retroactive",
              type: "choice",
              skill: "context-inference",

              primaryTargetIds: [
                "retro"
              ],

              prompt:
                "A retroactive rule can apply to events that happened before the rule was announced. What does retro- help suggest?",

              choices: [
                "backward or back in time",
                "across or through",
                "between or among",
                "away from"
              ],

              answer:
                "backward or back in time"
            }
          ]
        }
      }
    }
  });


  /* ========================================
     LOOKUP HELPERS
     ======================================== */

  function getFlight(flightValue) {
    return FLIGHTS[flightValue] || null;
  }


  function getForm(
    flightValue,
    formId
  ) {
    return (
      getFlight(flightValue)
        ?.forms?.[formId] ||
      null
    );
  }


  function getAllItems() {
    return Object.values(FLIGHTS)
      .flatMap(
        (flight) =>
          Object.values(
            flight.forms
          )
      )
      .flatMap(
        (form) =>
          form.items
      );
  }


  function getReservedWords() {
    return [
      ...new Set(
        getAllItems().map(
          (item) =>
            item.word.toLowerCase()
        )
      )
    ];
  }


  function isReservedWord(word) {
    return getReservedWords()
      .includes(
        String(word || "")
          .toLowerCase()
      );
  }


  /* ========================================
     ELIGIBILITY

     Match the migration engine:
     Transfer unlocks only after every token
     in the selected Flight collection is
     actually earned.
     ======================================== */

  function isEligible(
    student,
    flightValue
  ) {
    const flight =
      getFlight(flightValue);

    if (
      !student ||
      !flight ||
      typeof window === "undefined" ||
      !window.FirstVoloTokens
    ) {
      return false;
    }

    const statuses =
      window.FirstVoloTokens
        .evaluateStudent(student)
        .filter(
          (status) =>
            status.collection ===
            flight.collection
        );

    return (
      statuses.length > 0 &&
      statuses.every(
        (status) =>
          window.FirstVoloTokens
            .isTokenEarned(
              student,
              status.setId
            )
      )
    );
  }


  /* ========================================
     SCORING
     ======================================== */

  function normalizeArray(values) {
    return [
      ...new Set(
        (Array.isArray(values)
          ? values
          : []
        )
          .map(
            (value) =>
              String(value)
          )
      )
    ].sort();
  }


  function scoreItem(
    item,
    response
  ) {
    if (item.type === "multi") {
      const expected =
        normalizeArray(
          item.answer
        );

      const actual =
        normalizeArray(
          response
        );

      return (
        expected.length ===
          actual.length &&
        expected.every(
          (value, index) =>
            value === actual[index]
        )
      );
    }

    return (
      String(response ?? "") ===
      String(item.answer ?? "")
    );
  }


  function scoreAttempt(
    flightValue,
    formId,
    responses
  ) {
    const form =
      getForm(
        flightValue,
        formId
      );

    if (!form) {
      throw new Error(
        "Unknown Transfer Challenge form."
      );
    }

    const responseMap =
      responses &&
      typeof responses === "object"
        ? responses
        : {};

    const results =
      form.items.map(
        (item) => ({
          itemId: item.id,
          word: item.word,

          correct:
            scoreItem(
              item,
              responseMap[item.id]
            )
        })
      );

    const score =
      results.filter(
        (result) =>
          result.correct
      ).length;

    const total =
      form.items.length;

    const percent =
      total
        ? score / total
        : 0;

    const passed =
      score >=
      RULES.correctNeeded;

    return {
      ruleVersion: VERSION,

      flightValue,
      flightId:
        getFlight(
          flightValue
        ).flightId,

      collection:
        getFlight(
          flightValue
        ).collection,

      formId,

      score,
      total,
      percent,
      passed,

      results
    };
  }


  /* ========================================
     ALTERNATE-FORM RETRY
     ======================================== */

  function getNextFormId(
    existingCheck
  ) {
    const attempts =
      Array.isArray(
        existingCheck?.attempts
      )
        ? existingCheck.attempts
        : [];

    const lastAttempt =
      attempts[
        attempts.length - 1
      ];

    if (
      lastAttempt?.formId ===
      "form-a"
    ) {
      return "form-b";
    }

    return "form-a";
  }


  function makeAttemptRecord(
    scoredAttempt,
    completedAt =
      new Date().toISOString()
  ) {
    return {
      ...scoredAttempt,
      completedAt
    };
  }


  /*
    Passing is sticky, just like earned tokens.

    This function returns the transfer-check
    object that can later be stored at:

      student.migrationTransferChecks[
        collection
      ]

    The migration engine already reads
    check.passed.
  */
  function mergeTransferCheck(
    existingCheck,
    attempt
  ) {
    const previousAttempts =
      Array.isArray(
        existingCheck?.attempts
      )
        ? existingCheck.attempts
        : [];

    const attempts = [
      ...previousAttempts,
      attempt
    ];

    const previousPassed =
      Boolean(
        existingCheck?.passed
      );

    const passed =
      previousPassed ||
      Boolean(attempt.passed);

    const bestScore =
      Math.max(
        Number(
          existingCheck
            ?.bestScore || 0
        ),
        Number(
          attempt.score || 0
        )
      );

    const bestPercent =
      Math.max(
        Number(
          existingCheck
            ?.bestPercent || 0
        ),
        Number(
          attempt.percent || 0
        )
      );

    return {
      ruleVersion: VERSION,

      collection:
        attempt.collection,

      passed,
      bestScore,
      bestPercent,

      attempts,

      lastAttemptAt:
        attempt.completedAt,

      passedAt:
        existingCheck?.passedAt ||
        (
          attempt.passed
            ? attempt.completedAt
            : null
        )
    };
  }


  const API = Object.freeze({
    VERSION,
    RULES,
    GRADE_RULES,
    FLIGHTS,

    getFlight,
    getForm,
    getAllItems,

    getReservedWords,
    isReservedWord,

    isEligible,

    scoreItem,
    scoreAttempt,

    getNextFormId,
    makeAttemptRecord,
    mergeTransferCheck
  });


  if (
    typeof window !==
    "undefined"
  ) {
    window.FirstVoloTransferChallenge =
      API;
  }


  if (
    typeof module !==
      "undefined" &&
    module.exports
  ) {
    module.exports =
      API;
  }

})();
