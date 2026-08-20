"use strict";

(function () {

  const aliases = {
    none: "independent",
    independent: "independent",

    meaning: "meaning",
    morpheme_meaning_recall: "meaning",

    identify: "identify",
    morpheme_identification: "identify",
    morpheme_recognition_across_words: "identify",
    word_segmentation: "identify",

    connect: "connect",
    word_construction: "connect",

    infer: "infer",
    whole_word_inference: "infer",

    context: "context",
    contextual_application: "context",
    morphological_form_selection: "context",

    retrieval: "retrieval",
    morpheme_form_retrieval: "retrieval",

    directions: "directions",
    decoding: "decoding"
  };


  function normalizeDifficulty(value) {
    return value
      ? aliases[String(value).trim()] || null
      : null;
  }


  function label(target) {
    return target?.label || "the target";
  }


  function catalog(target) {
    const t = label(target);

    return {
      meaning: {
        ifStudent:
          `cannot remember what ${t} means`,

        educator: [
          `Show the established visual meaning cue for ${t}.`,
          "If still needed, give two meaning choices.",
          "Once the student accesses the meaning, continue with the session."
        ]
      },

      retrieval: {
        ifStudent:
          `knows the meaning but cannot retrieve ${t}`,

        educator: [
          `Keep the meaning of ${t} available without supplying the form.`,
          "If needed, provide a partial first-sound, form, or established visual cue.",
          "If retrieval is still blocked, reduce the response field to two choices."
        ]
      },

      identify: {
        ifStudent:
          `cannot locate ${t} in a word`,

        educator: [
          "Ask what meaningful part the student recognizes.",
          `If needed, compare two words containing ${t} and ask what part stays the same.`,
          `If the target is still overlooked, visually isolate or highlight ${t}.`
        ]
      },

      connect: {
        ifStudent:
          `finds ${t} but cannot connect the meaningful parts`,

        educator: [
          `Ask what ${t} contributes to the word.`,
          "If needed, provide the meaning of another meaningful part without solving the whole word.",
          "Ask the student to combine the parts into a possible whole-word meaning."
        ]
      },

      infer: {
        ifStudent:
          `can identify ${t} but cannot infer the whole word`,

        educator: [
          `Ask what ${t} contributes to the word.`,
          "Ask what another meaningful part contributes, if known.",
          "If the whole word is still unclear, add sentence context.",
          "If needed after that, offer two plausible whole-word meanings."
        ]
      },

      context: {
        ifStudent:
          "understands the morphology but has difficulty using sentence context",

        educator: [
          "Ask which word or phrase in the sentence gives useful information.",
          "Direct attention to the clearest context clue without explaining the answer.",
          "If needed, offer two plausible choices after the student attempts to combine morphology and context."
        ]
      },

      directions: {
        ifStudent:
          "does not understand what the task is asking",

        educator: [
          "Clarify or read the directions without helping with the morphology answer.",
          "If the task is still unclear, demonstrate with an example that does not appear in the activity."
        ]
      },

      decoding: {
        ifStudent:
          "is blocked by a nonessential word",

        educator: [
          "Provide or help decode the nonessential word.",
          "Keep the morphology demand unchanged and return control of the task to the student."
        ]
      }
    };
  }


  function relevantDifficulties(activity) {
    const activityRule =
      window.FirstVoloInstructionalRules
        ?.activities
        ?.[activity];

    return [
      ...(activityRule?.difficulties || []),
      "directions",
      "decoding"
    ];
  }


  function conditionals({
    activity,
    target,
    priorDifficulty = null,
    succeededWithSupport = false
  }) {
    const choices =
      catalog(target);

    const prior =
      normalizeDifficulty(
        priorDifficulty
      );

    const ordered = [
      prior,
      ...relevantDifficulties(activity)
    ].filter(Boolean);

    const unique =
      [...new Set(ordered)];

    const results =
      unique
        .filter(
          difficulty =>
            difficulty !== "independent" &&
            choices[difficulty]
        )
        .map(
          difficulty => ({
            difficulty,
            ...choices[difficulty]
          })
        );

    if (succeededWithSupport) {
      results.unshift({
        difficulty: "fade",

        ifStudent:
          "succeeded previously with support",

        educator: [
          "Begin the next opportunity with less support than was used previously.",
          "If the same barrier reappears, use the least support that addresses it."
        ]
      });
    }

    return results;
  }


  function build({
    activity,
    target,
    lastResponse = null
  } = {}) {
    const rules =
      window.FirstVoloInstructionalRules;

    const activityRule =
      rules?.activities?.[activity] || null;

    const priorDifficulty =
      lastResponse?.difficultyType || null;

    const succeededWithSupport =
      lastResponse?.outcomeAfterSupport ===
        "successful_after_support";

    return {
      activity,

      activityLabel:
        activityRule?.label || activity,

      target,

      purpose:
        activityRule?.purpose || null,

      educatorDoes:
        activityRule?.educator ||
        "Allow an independent attempt before adding support.",

      studentDoes:
        activityRule?.student ||
        "Completes the selected morphology task.",

      conditionals:
        conditionals({
          activity,
          target,
          priorDifficulty,
          succeededWithSupport
        }),

      supportOrder:
        rules?.supportOrder ||
        "attempt → identify barrier → least support → another attempt → fade"
    };
  }


  window.FirstVoloDynamicSessionGuidance = {
    normalizeDifficulty,
    conditionals,
    build
  };

})();
