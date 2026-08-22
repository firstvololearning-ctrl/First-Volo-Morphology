"use strict";

/*
  First Volo Morphology
  Rich Word Part Instruction v1

  Pure instructional-spec layer for teacher-led Word Part sessions.
  It does not save progress, score responses, choose protected transfer
  words, or alter the session planner.
*/

(function initializeFirstVoloWordPartInstruction() {
  const VERSION = "word-part-rich-instruction-v1";

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
    return asArray(
      window.FIRST_VOLO_MORPHEME_INVENTORY
    );
  }

  function wordInventory() {
    return asArray(
      window.FIRST_VOLO_WORD_INVENTORY
    );
  }

  function targetMeta(target) {
    if (!target) {
      return null;
    }

    if (target.id) {
      const exact =
        morphemeInventory().find(
          item =>
            item?.id === target.id
        );

      if (exact) {
        return exact;
      }
    }

    const wanted =
      new Set([
        ...variants(target.label),
        ...variants(target.target)
      ]);

    return (
      morphemeInventory().find(
        item =>
          variants(item?.label)
            .some(
              value =>
                wanted.has(value)
            )
      ) ||
      null
    );
  }

  function targetLabel(target) {
    return (
      target?.label ||
      target?.target ||
      targetMeta(target)?.label ||
      "the target word part"
    );
  }

  function targetMeaning(target) {
    return (
      target?.meaning ||
      targetMeta(target)?.meaning ||
      "the target meaning"
    );
  }

  function targetRole(target) {
    const meta =
      targetMeta(target);

    const explicit =
      String(
        target?.role ||
        meta?.role ||
        ""
      )
        .toLowerCase();

    if (
      explicit.includes("greek")
    ) {
      return "Greek combining form";
    }

    const type =
      target?.type ||
      meta?.type ||
      explicit;

    if (type === "prefix") {
      return "prefix";
    }

    if (type === "suffix") {
      return "suffix";
    }

    if (
      explicit.includes("combining")
    ) {
      return "Greek combining form";
    }

    return "root";
  }

  function taskWord(task) {
    return String(
      task?.recipe?.word ||
      task?.word ||
      ""
    ).trim();
  }

  function wordEntry(taskOrWord) {
    const word =
      typeof taskOrWord === "string"
        ? taskOrWord
        : taskWord(taskOrWord);

    const wanted =
      normalize(word);

    return (
      wordInventory().find(
        entry =>
          normalize(entry?.word) ===
          wanted
      ) ||
      null
    );
  }

  function wordDefinition(task) {
    const entry =
      wordEntry(task);

    return (
      task?.recipe?.definition ||
      task?.recipe?.literal ||
      task?.definition ||
      task?.literal ||
      entry?.definition ||
      entry?.literal ||
      null
    );
  }

  function segmentationParts(task) {
    const entry =
      wordEntry(task);

    const raw =
      String(
        task?.recipe?.segmentation ||
        task?.segmentation ||
        entry?.segmentation ||
        ""
      )
        .split(";")[0]
        .trim();

    if (!raw) {
      return [];
    }

    return raw
      .split("+")
      .map(
        part =>
          String(part || "")
            .trim()
      )
      .filter(Boolean);
  }

  function targetForms(target) {
    const meta =
      targetMeta(target);

    return new Set([
      ...variants(targetLabel(target)),
      ...variants(meta?.label)
    ]);
  }

  function morphemeMetaFor(part) {
    const wanted =
      new Set(
        variants(part)
      );

    return (
      morphemeInventory().find(
        item =>
          variants(item?.label)
            .some(
              value =>
                wanted.has(value)
            )
      ) ||
      null
    );
  }

  function supportingPart(task, target) {
    const targetSet =
      targetForms(target);

    for (
      const part
      of segmentationParts(task)
    ) {
      const partValues =
        variants(part);

      if (
        partValues.some(
          value =>
            targetSet.has(value)
        )
      ) {
        continue;
      }

      const meta =
        morphemeMetaFor(part);

      if (
        meta?.meaning
      ) {
        return {
          label:
            meta.label || part,
          meaning:
            meta.meaning
        };
      }
    }

    return null;
  }

  function distinctWords(allTasks) {
    const seen =
      new Set();

    return asArray(allTasks)
      .map(taskWord)
      .filter(Boolean)
      .filter(
        word => {
          const key =
            normalize(word);

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

  function moveFor(index, total) {
    if (total >= 4) {
      return [
        "notice",
        "connect",
        "compare",
        "pattern"
      ][
        Math.min(index, 3)
      ];
    }

    if (total === 3) {
      return [
        "notice",
        "compare",
        "pattern"
      ][
        Math.min(index, 2)
      ];
    }

    if (total === 2) {
      return index === 0
        ? "notice"
        : "pattern";
    }

    return "notice";
  }

  function roleJobSentence(
    role,
    label,
    meaning
  ) {
    if (role === "prefix") {
      return (
        `${label} is a prefix. It adds the idea “${meaning}” ` +
        "at the beginning of a word."
      );
    }

    if (role === "suffix") {
      return (
        `${label} is a suffix. It helps add the job or meaning ` +
        `“${meaning}” at the end of a word.`
      );
    }

    if (
      role ===
      "Greek combining form"
    ) {
      return (
        `${label} is a Greek combining form. It carries the idea ` +
        `“${meaning}” inside words.`
      );
    }

    return (
      `${label} is a root. It carries the idea “${meaning}” ` +
      "inside words."
    );
  }

  /* FIRST_VOLO_WORD_PART_DEMAND_SUPPORT_V1 */

  function targetFirstLetter(target) {
    const cleaned =
      String(
        targetLabel(target) ||
        ""
      )
        .replace(
          /[^A-Za-z]/g,
          ""
        );

    return cleaned
      ? cleaned[0].toLowerCase()
      : "";
  }

  function positionLanguage(role) {
    if (role === "prefix") {
      return "the beginning of the word";
    }

    if (role === "suffix") {
      return "the end of the word";
    }

    return "the meaningful part inside the word";
  }

  function genericDemandSupport({
    target,
    task,
    spec
  }) {
    const move =
      spec?.move ||
      "notice";

    const role =
      targetRole(target);

    const word =
      taskWord(task);

    const label =
      targetLabel(target);

    if (move === "notice") {
      return [
        `Restate the whole-word meaning and ask the student to look at ${positionLanguage(role)} for the meaningful part carrying the target idea.`,
        `If needed, direct attention to ${positionLanguage(role)} without naming ${label}. Retry the same Notice question.`,
        "If the target is still missed, visually isolate the target word part, then retry before showing the full explanation."
      ];
    }

    if (move === "connect") {
      return [
        "Keep the known base/root or other meaningful-part information visible. Ask what that known part contributes before asking what the target adds.",
        "If needed, offer two meaning/function possibilities for what the target contributes; do not switch to a form cue.",
        "Retry the same meaning-connection question before showing the explanation."
      ];
    }

    if (move === "compare") {
      return [
        "Put the meaningful parts or comparison words side by side. Ask what stays connected and what changes.",
        "If needed, restate the known base/root meaning and ask what changes when the target word part is present.",
        "Retry the same Compare question before showing the explanation."
      ];
    }

    return [
      "First ask what repeats across the words and what kind of job the words are doing.",
      "If needed, visually underline or box the common word part across the examples.",
      "Then retry the Pattern question: what meaning or job stays connected across the words?"
    ];
  }

  function iveDemandSupport({
    task,
    spec
  }) {
    const move =
      spec?.move ||
      "notice";

    const word =
      normalize(
        taskWord(task)
      );

    if (
      move === "notice" &&
      word === "creative"
    ) {
      return [
        "Compare create and creative. Ask what changed at the end of the word.",
        "If needed, underline the final -ive only after the student's first attempt.",
        "Retry: Which part helps make creative a word that describes what someone is like?"
      ];
    }

    if (
      move === "connect" &&
      word === "active"
    ) {
      return [
        "Keep act = to do visible. Ask: Is active naming the action, or describing someone or something that is doing, moving, or taking part?",
        "If needed, point to act + ___ and ask what ending was added to make active. Do not switch to a form cue.",
        "Retry what -ive tells us about someone or something before showing the explanation."
      ];
    }

    if (
      move === "compare" &&
      word === "constructive"
    ) {
      return [
        "Keep construct = build visible. Ask what constructive feedback does to an idea: it helps build or improve it.",
        "If needed, contrast construct (the action) with constructive (a word describing something that helps build or improve).",
        "Retry: What does -ive add to constructive?"
      ];
    }

    if (move === "pattern") {
      return [
        "Ask which of the examples are describing words before asking about the ending.",
        "Then ask what ending repeats. If needed, underline -ive in each example.",
        "Retry: What does that shared ending seem to help the words do?"
      ];
    }

    return [];
  }

  function demandSupport({
    target,
    task,
    spec
  }) {
    const meta =
      targetMeta(target);

    const id =
      target?.id ||
      meta?.id ||
      null;

    if (
      id === "ive" ||
      normalize(
        targetLabel(target)
      ) === "ive"
    ) {
      const specific =
        iveDemandSupport({
          task,
          spec
        });

      if (specific.length) {
        return specific;
      }
    }

    return genericDemandSupport({
      target,
      task,
      spec
    });
  }


  function genericSpec({
    target,
    task,
    move,
    allTasks
  }) {
    const word =
      taskWord(task);

    const label =
      targetLabel(target);

    const meaning =
      targetMeaning(target);

    const role =
      targetRole(target);

    const definition =
      wordDefinition(task);

    const support =
      supportingPart(
        task,
        target
      );

    const parts =
      segmentationParts(task);

    if (move === "notice") {
      return {
        move: "notice",
        moveLabel: "Notice it",
        word,
        context:
          definition
            ? (
                `In this example, ${word} means ${definition}.`
              )
            : (
                `Look closely at the whole word ${word}.`
              ),
        prompt:
          `Which part of ${word} carries the idea “${meaning}”?`,
        responseType: "text",
        responseLabel: "Word part",
        structure: null,
        patternWords: [],
        explanation: [
          `${label} carries the target idea “${meaning}” in this word.`,
          roleJobSentence(
            role,
            label,
            meaning
          )
        ],
        teacherDirection:
          "Let the student use the whole word and meaning first. After the attempt, connect the identified form to its meaning and job."
      };
    }

    if (move === "connect") {
      if (support) {
        return {
          move: "connect",
          moveLabel: "Connect it",
          word,
          context:
            `${support.label} carries the idea “${support.meaning}.” Look at ${word}.`,
          prompt:
            `Which part of ${word} carries that idea? How does ${label} add to the whole word?`,
          responseType: "text",
          responseLabel: "What do you notice?",
          structure:
            parts.length > 1
              ? `${parts.join(" + ")} → ${word}`
              : null,
          patternWords: [],
          explanation: [
            `${support.label} carries the idea “${support.meaning}.”`,
            roleJobSentence(
              role,
              label,
              meaning
            ),
            `Together, the meaningful parts help explain ${word}.`
          ],
          teacherDirection:
            "Keep the scored demand at recognition, but use the word to connect more than one meaningful part when the analysis is transparent."
        };
      }

      return {
        move: "connect",
        moveLabel: "Connect it",
        word,
        context:
          definition
            ? `${word} means ${definition}.`
            : `Look at ${word}.`,
        prompt:
          `How does the meaning of ${label} help explain the whole word ${word}?`,
        responseType: "text",
        responseLabel: "Meaning connection",
        structure: null,
        patternWords: [],
        explanation: [
          roleJobSentence(
            role,
            label,
            meaning
          ),
          definition
            ? (
                `That meaning gives a useful clue to why ${word} means ${definition}.`
              )
            : (
                `That meaning is the clue to carry into other words with ${label}.`
              )
        ],
        teacherDirection:
          "Ask for a meaning connection rather than another repetition of the target label."
      };
    }

    if (move === "compare") {
      const words =
        distinctWords(allTasks);

      const comparison =
        words.find(
          item =>
            normalize(item) !==
            normalize(word)
        ) ||
        null;

      return {
        move: "compare",
        moveLabel: "Compare it",
        word,
        context:
          parts.length > 1
            ? (
                `Look at how the meaningful parts work together in ${word}.`
              )
            : (
                comparison
                  ? (
                      `Compare ${word} with ${comparison}.`
                    )
                  : (
                      `Look again at ${word}.`
                    )
              ),
        prompt:
          parts.length > 1
            ? (
                `What does ${label} contribute when these parts combine?`
              )
            : (
                `What meaning stays connected to ${label}, even as the whole word changes?`
              ),
        responseType: "text",
        responseLabel: "What changes or stays the same?",
        structure:
          parts.length > 1
            ? `${parts.join(" + ")} → ${word}`
            : null,
        patternWords:
          comparison
            ? [word, comparison]
            : [],
        explanation: [
          roleJobSentence(
            role,
            label,
            meaning
          ),
          definition
            ? (
                `In ${word}, that contribution works with the other parts to support the meaning ${definition}.`
              )
            : (
                `The whole word changes, but the meaning carried by ${label} stays connected.`
              )
        ],
        teacherDirection:
          "Use comparison to make the relationship among form, meaning, and whole-word meaning explicit."
      };
    }

    const words =
      distinctWords(
        allTasks
      );

    return {
      move: "pattern",
      moveLabel: "Find the pattern",
      word,
      context: null,
      prompt:
        `What do these words have in common? What meaning or job stays connected to ${label} across the words?`,
      responseType: "text",
      responseLabel: "What pattern do you notice?",
      structure: null,
      patternWords:
        words.length
          ? words
          : [word].filter(Boolean),
      explanation: [
        `Across these examples, ${label} keeps carrying the idea “${meaning}.”`,
        roleJobSentence(
          role,
          label,
          meaning
        )
      ],
      teacherDirection:
        "Ask the student to generalize across examples instead of naming the same word part again."
    };
  }

  function iveSpec({
    target,
    task,
    move,
    allTasks
  }) {
    const word =
      taskWord(task);

    const principle =
      "Adding -ive helps turn the base word into a word that describes what someone or something is like.";

    if (
      move === "notice" &&
      normalize(word) ===
        "creative"
    ) {
      return {
        move: "notice",
        moveLabel: "Notice it",
        word: "creative",
        context:
          "When someone is able to create new things or ideas, we can say they are creative.",
        prompt:
          "Which part of the word helps make it a word that describes what someone is like?",
        responseType: "text",
        responseLabel: "Word part",
        structure: null,
        patternWords: [],
        explanation: [
          "The base word create means to make new things or ideas.",
          "Adding -ive gives us creative, which describes someone who is able to make new things or ideas.",
          principle
        ],
        teacherDirection:
          "Let the student notice the suffix from the meaningful example first. Then make the base-word and suffix relationship explicit."
      };
    }

    if (
      move === "connect" &&
      normalize(word) ===
        "active"
    ) {
      return {
        move: "connect",
        moveLabel: "Connect it",
        word: "active",
        context:
          "The base/root act means to do.",
        prompt:
          "What does adding the suffix -ive tell us about someone or something?",
        responseType: "text",
        choices: [],
        responseLabel:
          "What does -ive tell us?",
        structure:
          "act + -ive → active",
        patternWords: [],
        explanation: [
          "The base/root act means to do.",
          "Adding -ive gives us active, which describes someone or something that is doing, moving, or taking part in an action.",
          principle
        ],
        teacherDirection:
          "Keep the scored demand at recognition. Use act + -ive → active to connect the base meaning with what the suffix tells us about the whole describing word."
      };
    }

    if (
      move === "compare" &&
      normalize(word) ===
        "constructive"
    ) {
      return {
        move: "compare",
        moveLabel: "Compare it",
        word: "constructive",
        context:
          "To construct means to build.",
        prompt:
          "What does adding -ive tell us about constructive?",
        responseType: "text",
        responseLabel: "What does -ive add?",
        structure:
          "construct + -ive → constructive",
        patternWords: [],
        explanation: [
          "The base word construct means to build.",
          "Adding -ive gives us constructive, a word that describes something that helps to build or improve.",
          "For example: That feedback was constructive — it helped me build and improve my idea.",
          principle
        ],
        teacherDirection:
          "Show the base-to-derived-word relationship. Ask what the suffix contributes before giving the explanation."
      };
    }

    if (move === "pattern") {
      const words =
        distinctWords(allTasks);

      const preferred =
        [
          "creative",
          "active",
          "constructive",
          "destructive"
        ];

      const actual =
        preferred.filter(
          item =>
            words.some(
              wordItem =>
                normalize(wordItem) ===
                item
            )
        );

      const patternWords =
        actual.length >= 2
          ? actual
          : words;

      return {
        move: "pattern",
        moveLabel: "Find the pattern",
        word,
        context: null,
        prompt:
          "What do these words have in common? What does -ive seem to help these words do?",
        responseType: "text",
        responseLabel: "What pattern do you notice?",
        structure: null,
        patternWords,
        explanation: [
          "These words use -ive as part of a describing word.",
          "Across the examples, -ive helps us describe what someone or something is like or tends to do.",
          principle
        ],
        teacherDirection:
          "Ask the student to generalize the suffix's job across the examples instead of simply naming -ive again."
      };
    }

    return genericSpec({
      target,
      task,
      move,
      allTasks
    });
  }

  function buildPartASpec({
    target = null,
    task = null,
    index = 0,
    total = 1,
    allTasks = []
  } = {}) {
    if (
      !target ||
      !task
    ) {
      return null;
    }

    const safeTotal =
      Math.max(
        1,
        Number(total) || 1
      );

    const safeIndex =
      Math.max(
        0,
        Number(index) || 0
      );

    const move =
      moveFor(
        safeIndex,
        safeTotal
      );

    const meta =
      targetMeta(target);

    const id =
      target?.id ||
      meta?.id ||
      null;

    const spec =
      (
        id === "ive" ||
        normalize(
          targetLabel(target)
        ) === "ive"
      )
        ? iveSpec({
            target,
            task,
            move,
            allTasks
          })
        : genericSpec({
            target,
            task,
            move,
            allTasks
          });

    return {
      ...spec,
      support:
        demandSupport({
          target,
          task,
          spec
        })
    };
  }

  function buildStep5Recognition({
    target = null,
    task = null
  } = {}) {
    const role =
      targetRole(target);

    const meaning =
      targetMeaning(target);

    const word =
      taskWord(task);

    const definition =
      wordDefinition(task);

    const id =
      target?.id ||
      targetMeta(target)?.id ||
      null;

    if (
      word &&
      (
        id === "ive" ||
        normalize(
          targetLabel(target)
        ) === "ive"
      ) &&
      normalize(word) ===
        "active"
    ) {
      return {
        demand:
          "recognition",
        anchorWord:
          "active",
        prompt:
          "The base/root act means to do. In active, which suffix was added to act?",
        cue:
          "Active describes someone or something that is doing, moving, or taking part in an action.",
        support: [
          "Compare act and active. Ask what letters were added at the end.",
          "If needed, reduce the suffix choices to two and retry.",
          "If recognition is still blocked, visually point to the ending of active and retry."
        ]
      };
    }

    if (word) {
      const prompt =
        role === "suffix"
          ? (
              `In ${word}, which suffix is the target suffix that helps carry the idea “${meaning}”?`
            )
          : role === "prefix"
            ? (
                `In ${word}, which prefix is the target prefix that adds the idea “${meaning}”?`
              )
            : role ===
                "Greek combining form"
              ? (
                  `In ${word}, which Greek combining form carries the idea “${meaning}”?`
                )
              : (
                  `In ${word}, which root carries the idea “${meaning}”?`
                );

      return {
        demand:
          "recognition",
        anchorWord:
          word,
        prompt,
        cue:
          definition
            ? (
                `Whole-word meaning: ${word} means ${definition}.`
              )
            : (
                `Use the real word ${word}.`
              ),
        support: [
          `Direct attention to ${positionLanguage(role)} in ${word}.`,
          "If needed, reduce the choices to two and retry the same recognition question.",
          "If recognition is still blocked, visually isolate the target location in the word, then retry."
        ]
      };
    }

    if (role === "suffix") {
      return {
        demand:
          "recognition",
        anchorWord:
          null,
        prompt:
          "Which suffix matches the target meaning from this session?",
        cue:
          meaning,
        support: [
          "Use an already-taught real word for the target before adding a form cue.",
          "If needed, reduce the choices to two.",
          "Retry the recognition demand before moving to recall."
        ]
      };
    }

    return {
      demand:
        "recognition",
      anchorWord:
        null,
      prompt:
        `Which ${role} matches the target meaning from this session?`,
      cue:
        meaning,
      support: [
        "Return to an already-taught real-word example for recognition.",
        "If needed, reduce the choices to two.",
        "Retry the recognition demand before moving to recall."
      ]
    };
  }

  function buildStep5Recall({
    target = null,
    task = null
  } = {}) {
    const role =
      targetRole(target);

    const firstLetter =
      targetFirstLetter(target);

    return {
      demand:
        "recall",
      anchorWord:
        taskWord(task) ||
        null,
      prompt:
        `Without looking back, what ${role} did you just identify?`,
      cue:
        "Think back to the meaning and real-word example from Item 1. Do not look back at the word.",
      support: [
        "First ask the student to remember the word part from Item 1 without reopening the word or choices.",
        firstLetter
          ? (
              `If needed, give only the first sound or letter: ${firstLetter}. Retry before showing the whole word part.`
            )
          : (
              "If needed, give a minimal sound or form cue. Retry before showing the whole word part."
            ),
        "If recall is still blocked, show the familiar visual tile, then retry. Fade that support on the next opportunity."
      ]
    };
  }

  function buildSillyChallenge({
    target = null
  } = {}) {
    const role =
      targetRole(target);

    const id =
      target?.id ||
      targetMeta(target)?.id ||
      null;

    if (
      id === "ive" ||
      normalize(
        targetLabel(target)
      ) === "ive"
    ) {
      return {
        title: "Make a Silly Word",
        optional: true,
        scored: false,
        prompt:
          "Invent a pretend base word and decide what it means. Use the word part you just retrieved to turn it into a describing word. What would your new word describe?",
        starter:
          "Try swoof. Pretend swoof means “to hop around while making a funny noise.” What word would describe someone or something that tends to swoof?"
      };
    }

    if (role === "suffix") {
      return {
        title: "Make a Silly Word",
        optional: true,
        scored: false,
        prompt:
          "Invent a pretend base word and decide what it means. Add the word part you just retrieved. What would your new pretend word mean?",
        starter:
          "Try swoof as your pretend base. Decide what swoof means first, then add the word part you just retrieved and explain the new word."
      };
    }

    if (role === "prefix") {
      return {
        title: "Make a Silly Word",
        optional: true,
        scored: false,
        prompt:
          "Invent a pretend base word and decide what it means. Put the word part you just retrieved at the beginning. How does the new word's meaning change?",
        starter:
          "Try swoof as your pretend base. Decide what swoof means first, then put the word part you just retrieved in front and explain the new word."
      };
    }

    return {
      title: "Make a Silly Word",
      optional: true,
      scored: false,
      prompt:
        "Invent a pretend word that contains the word part you just retrieved. Decide what the pretend part means. What real meaning clue would the known word part give a reader?",
      starter:
        "Try combining the word part you just retrieved with the pretend part swoof. Decide what swoof means, then explain what clue the real word part contributes."
    };
  }

  window.FirstVoloWordPartInstruction =
    Object.freeze({
      version: VERSION,
      buildPartASpec,
      buildStep5Recognition,
      buildStep5Recall,
      buildSillyChallenge
    });
})();
