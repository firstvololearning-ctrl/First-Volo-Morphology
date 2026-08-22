"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = __dirname;
const failures = [];

function fail(message) {
  failures.push(message);
}

function requireText(source, text, label) {
  if (!source.includes(text)) {
    fail(`${label}: missing ${text}`);
  }
}

function loadInto(context, filename) {
  const source = fs.readFileSync(
    path.join(root, filename),
    "utf8"
  );

  vm.runInContext(
    source,
    context,
    { filename }
  );

  return source;
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

console.log(
  "=== Rich Word Part instruction audit ==="
);

const html =
  fs.readFileSync(
    path.join(root, "session-materials.html"),
    "utf8"
  );

const uiSource =
  fs.readFileSync(
    path.join(root, "session-materials-ui.js"),
    "utf8"
  );

const itemBankSource =
  fs.readFileSync(
    path.join(root, "instructional-session-item-bank.js"),
    "utf8"
  );

const plannerSource =
  fs.readFileSync(
    path.join(root, "instructional-session-planner.js"),
    "utf8"
  );

const enginePath =
  path.join(
    root,
    "word-part-instruction.js"
  );

if (!fs.existsSync(enginePath)) {
  fail(
    "word-part-instruction.js is missing"
  );
}

requireText(
  html,
  'src="word-part-instruction.js?v=20260822-rich1"',
  "session page rich Word Part script"
);

const bankIndex =
  html.indexOf(
    "instructional-session-item-bank.js"
  );

const engineIndex =
  html.indexOf(
    "word-part-instruction.js"
  );

const uiIndex =
  html.indexOf(
    "session-materials-ui.js"
  );

if (
  bankIndex < 0 ||
  engineIndex < 0 ||
  uiIndex < 0 ||
  !(
    bankIndex <
      engineIndex &&
    engineIndex <
      uiIndex
  )
) {
  fail(
    "Word Part instruction script must load after the item bank and before session-materials-ui.js"
  );
}

requireText(
  uiSource,
  "FIRST_VOLO_RICH_WORD_PART_UI_V1",
  "rich Word Part UI marker"
);

requireText(
  itemBankSource,
  "FIRST_VOLO_IVE_WORD_PART_SEQUENCE_V1",
  "-ive curated Word Part runtime ordering"
);

requireText(
  plannerSource,
  "applyPriority",
  "planner recipe-level Apply priority support"
);

requireText(
  uiSource,
  "renderReadyMorphemeLegacy",
  "legacy Apply fallback"
);

requireText(
  uiSource,
  "readyWordPartSpecFor",
  "Part A rich spec adapter"
);

requireText(
  uiSource,
  "buildStep5Recognition",
  "meaningful Step 5 recognition"
);

requireText(
  uiSource,
  "buildStep5Recall",
  "meaningful Step 5 recall"
);

requireText(
  uiSource,
  "data-word-part-silly-challenge",
  "optional Silly Word Challenge"
);

requireText(
  uiSource,
  "This challenge is optional and is not scored.",
  "Silly Word Challenge unscored label"
);

requireText(
  uiSource,
  "readyV14StudentPrintableTask",
  "Part B print protection retained"
);

requireText(
  uiSource,
  "Use this only after independent recall so the whole word does not cue the answer.",
  "fresh-word protection retained"
);

const context = {
  window: {},
  console
};

vm.createContext(context);

loadInto(
  context,
  "word-inventory.js"
);

loadInto(
  context,
  "instructional-session-item-bank.js"
);

if (fs.existsSync(enginePath)) {
  loadInto(
    context,
    "word-part-instruction.js"
  );
}

const api =
  context.window
    .FirstVoloWordPartInstruction;

const itemBank =
  context.window
    .FirstVoloSessionItemBank;

if (!api) {
  fail(
    "FirstVoloWordPartInstruction API was not created"
  );
}

const morphemes =
  Array.isArray(
    context.window
      .FIRST_VOLO_MORPHEME_INVENTORY
  )
    ? context.window
        .FIRST_VOLO_MORPHEME_INVENTORY
    : [];

const words =
  Array.isArray(
    context.window
      .FIRST_VOLO_WORD_INVENTORY
  )
    ? context.window
        .FIRST_VOLO_WORD_INVENTORY
    : [];

function wordsForTarget(target) {
  const wanted =
    new Set(
      variants(target?.label)
    );

  return words.filter(
    entry =>
      entry?.word &&
      Array.isArray(
        entry.morphemes
      ) &&
      entry.morphemes.some(
        morpheme =>
          variants(morpheme)
            .some(
              value =>
                wanted.has(value)
            )
      )
  );
}

function taskFor(entry) {
  return {
    stage: "Teach / Practice",
    word: entry.word,
    recipe: {
      word: entry.word,
      segmentation:
        entry.segmentation ||
        null,
      definition:
        entry.definition ||
        null,
      literal:
        entry.literal ||
        null
    }
  };
}

let targetsAudited = 0;
let fourItemTargets = 0;

if (api) {
  for (
    const target
    of morphemes
  ) {
    const candidates =
      wordsForTarget(target)
        .slice(0, 4);

    if (!candidates.length) {
      continue;
    }

    targetsAudited += 1;

    const tasks =
      candidates.map(
        taskFor
      );

    const total =
      tasks.length;

    const specs =
      tasks.map(
        (task, index) =>
          api.buildPartASpec({
            target,
            task,
            index,
            total,
            allTasks: tasks
          })
      );

    if (
      specs.some(
        spec =>
          !spec ||
          !spec.move ||
          !spec.prompt ||
          !Array.isArray(
            spec.explanation
          ) ||
          !spec.explanation.length
      )
    ) {
      fail(
        `${target.id || target.label}: incomplete rich Part A spec`
      );
      continue;
    }

    if (
      specs.some(
        spec =>
          spec.explanation
            .some(
              line =>
                /^\s*yes\b/i
                  .test(line)
            )
      )
    ) {
      fail(
        `${target.id || target.label}: explanation assumes correctness with “Yes”`
      );
    }

    if (total >= 4) {
      fourItemTargets += 1;

      const moves =
        specs.map(
          spec =>
            spec.move
        );

      const expected = [
        "notice",
        "connect",
        "compare",
        "pattern"
      ];

      if (
        moves.join("|") !==
        expected.join("|")
      ) {
        fail(
          `${target.id || target.label}: 4-item Part A must be Notice → Connect → Compare → Pattern; got ${moves.join(" → ")}`
        );
      }

      const prompts =
        new Set(
          specs.map(
            spec =>
              String(
                spec.prompt ||
                ""
              )
                .trim()
                .toLowerCase()
          )
        );

      if (
        prompts.size < 4
      ) {
        fail(
          `${target.id || target.label}: 4-item Part A collapsed into repeated prompts`
        );
      }
    }

    if (total === 2) {
      const moves =
        specs.map(
          spec =>
            spec.move
        );

      if (
        moves.join("|") !==
        "notice|pattern"
      ) {
        fail(
          `${target.id || target.label}: 2-item Part A must be Notice → Pattern`
        );
      }
    }

    if (total === 1) {
      if (
        specs[0].move !==
        "notice"
      ) {
        fail(
          `${target.id || target.label}: 1-item Part A must use Notice`
        );
      }
    }

    const recognition =
      api.buildStep5Recognition({
        target
      });

    const recall =
      api.buildStep5Recall({
        target
      });

    const challenge =
      api.buildSillyChallenge({
        target
      });

    if (
      !recognition?.prompt ||
      !recognition?.cue
    ) {
      fail(
        `${target.id || target.label}: Step 5 recognition spec incomplete`
      );
    }

    if (
      !recall?.prompt ||
      !recall?.cue ||
      !/^Without looking back,/i
        .test(
          recall.prompt
        )
    ) {
      fail(
        `${target.id || target.label}: Step 5 recall must remain an independent retrieval demand`
      );
    }

    if (
      challenge?.optional !==
        true ||
      challenge?.scored !==
        false ||
      !challenge?.prompt ||
      !challenge?.starter
    ) {
      fail(
        `${target.id || target.label}: Silly Word Challenge must be optional, unscored, and scaffoldable`
      );
    }

    const rawLabel =
      String(
        target?.label ||
        ""
      ).trim();

    const challengeText =
      `${challenge.prompt || ""}\n${challenge.starter || ""}`;

    const displayForms =
      rawLabel
        .split(/(?:->|→|\/|,)/)
        .map(
          value =>
            String(value || "")
              .trim()
        )
        .filter(Boolean);

    const escapeRegExp =
      value =>
        String(value || "")
          .replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );

    const prefilledTarget =
      displayForms.some(
        form => {
          const escaped =
            escapeRegExp(form);

          const leftBoundary =
            /^[A-Za-z0-9]/
              .test(form)
              ? "(?:^|[^A-Za-z0-9])"
              : "";

          const rightBoundary =
            /[A-Za-z0-9]$/
              .test(form)
              ? "(?=$|[^A-Za-z0-9])"
              : "";

          return new RegExp(
            `${leftBoundary}${escaped}${rightBoundary}`,
            "i"
          ).test(
            challengeText
          );
        }
      );

    if (prefilledTarget) {
      fail(
        `${target.id || target.label}: Silly Word Challenge should refer to “the word part you just retrieved” rather than pre-fill the target`
      );
    }
  }
}

const ive =
  morphemes.find(
    item =>
      item?.id === "ive"
  );

const iveWords = [
  "creative",
  "active",
  "constructive",
  "destructive"
];

const iveEntries =
  iveWords.map(
    wanted =>
      words.find(
        entry =>
          normalize(entry?.word) ===
          wanted
      )
  );

if (!ive) {
  fail("-ive target metadata is missing");
}

if (
  iveEntries.some(
    entry =>
      !entry
  )
) {
  fail(
    "-ive audit requires creative, active, constructive, and destructive in the word inventory"
  );
}

if (
  api &&
  ive &&
  iveEntries.every(Boolean)
) {
  const tasks =
    iveEntries.map(
      taskFor
    );

  const specs =
    tasks.map(
      (task, index) =>
        api.buildPartASpec({
          target: ive,
          task,
          index,
          total: 4,
          allTasks: tasks
        })
    );

  const [
    creative,
    active,
    constructive,
    pattern
  ] = specs;

  const exactPrinciple =
    "Adding -ive helps turn the base word into a word that describes what someone or something is like.";

  if (
    creative.context !==
    "When someone is able to create new things or ideas, we can say they are creative."
  ) {
    fail(
      "-ive creative Notice context does not match the approved meaningful example"
    );
  }

  if (
    creative.prompt !==
    "Which part of the word helps make it a word that describes what someone is like?"
  ) {
    fail(
      "-ive creative Notice question does not match the approved prompt"
    );
  }

  if (
    !creative.explanation.includes(
      "The base word create means to make new things or ideas."
    ) ||
    !creative.explanation.includes(
      exactPrinciple
    )
  ) {
    fail(
      "-ive creative explanation is missing the approved base/meaning bridge"
    );
  }

  if (
    active.move !==
      "connect" ||
    active.word !==
      "active" ||
    active.context !==
      "The base/root act means to do." ||
    active.structure !==
      "act + -ive → active" ||
    active.prompt !==
      "What does adding the suffix -ive tell us about someone or something?" ||
    !active.explanation.includes(
      "The base/root act means to do."
    ) ||
    !active.explanation.includes(
      "Adding -ive gives us active, which describes someone or something that is doing, moving, or taking part in an action."
    ) ||
    !active.explanation.includes(
      exactPrinciple
    )
  ) {
    fail(
      "-ive active Connect item is missing the approved act → active meaning/function bridge"
    );
  }

  if (
    constructive.structure !==
      "construct + -ive → constructive" ||
    constructive.context !==
      "To construct means to build." ||
    !constructive.explanation.some(
      line =>
        line.includes(
          "helps to build or improve"
        )
    )
  ) {
    fail(
      "-ive constructive Compare item is missing the approved build → improve bridge"
    );
  }

  if (
    pattern.move !==
      "pattern" ||
    !pattern.prompt.startsWith(
      "What do these words have in common?"
    ) ||
    pattern.patternWords.join("|") !==
      iveWords.join("|")
  ) {
    fail(
      "-ive final Part A item must generalize across creative, sensitive, constructive, destructive"
    );
  }

  if (
    !pattern.explanation.includes(
      exactPrinciple
    )
  ) {
    fail(
      "-ive pattern explanation is missing the approved generalization"
    );
  }


  if (!itemBank?.buildItems) {
    fail(
      "-ive runtime audit could not access FirstVoloSessionItemBank.buildItems"
    );
  } else {
    const runtimeRecipes =
      itemBank.buildItems({
        targetResolution: {
          primary: {
            ...ive,
            role: "suffix"
          },
          allTargets: [
            ive
          ]
        },
        activity: "morpheme",
        gradeBand: "4-5",
        vocabLevel: null,
        limit: 5
      });

    const runtimeOrder =
      runtimeRecipes
        .map(
          recipe =>
            normalize(
              recipe?.word
            )
        );

    const expectedRuntimeOrder = [
      "creative",
      "sensitive",
      "active",
      "constructive",
      "destructive"
    ];

    if (
      runtimeOrder.join("|") !==
      expectedRuntimeOrder.join("|")
    ) {
      fail(
        `-ive runtime recipe order must reserve sensitive for Apply while preserving creative → active → constructive → destructive Part A; got ${runtimeOrder.join(" → ")}`
      );
    }

    const durationCases = [
      {
        minutes: 10,
        recipeCount: 2,
        expectedPractice: [
          "creative"
        ]
      },
      {
        minutes: 15,
        recipeCount: 3,
        expectedPractice: [
          "creative",
          "active"
        ]
      },
      {
        minutes: 30,
        recipeCount: 5,
        expectedPractice: [
          "creative",
          "active",
          "constructive",
          "destructive"
        ]
      }
    ];

    for (
      const durationCase
      of durationCases
    ) {
      const selected =
        runtimeRecipes.slice(
          0,
          durationCase.recipeCount
        );

      const prioritized =
        selected.filter(
          recipe =>
            Number(
              recipe?.applyPriority ||
              0
            ) > 0
        );

      const pool =
        prioritized.length
          ? prioritized
          : selected;

      const applyRecipe =
        pool[
          pool.length - 1
        ] ||
        null;

      const applyWord =
        applyRecipe
          ?.applyKind ===
          "open-new-item"
          ? null
          : normalize(
              applyRecipe
                ?.applyWord ||
              applyRecipe
                ?.word ||
              ""
            );

      const practiceWords =
        selected
          .filter(
            recipe =>
              normalize(
                recipe?.word
              ) !==
              applyWord
          )
          .map(
            recipe =>
              normalize(
                recipe?.word
              )
          );

      if (
        applyWord !==
        "sensitive"
      ) {
        fail(
          `-ive ${durationCase.minutes}-minute Apply must reserve sensitive as the fresh Part B word; got ${applyWord || "none"}`
        );
      }

      if (
        practiceWords.join("|") !==
        durationCase
          .expectedPractice
          .join("|")
      ) {
        fail(
          `-ive ${durationCase.minutes}-minute Part A words must be ${durationCase.expectedPractice.join(" → ")}; got ${practiceWords.join(" → ")}`
        );
      }

      if (
        practiceWords.includes(
          "sensitive"
        )
      ) {
        fail(
          `-ive ${durationCase.minutes}-minute Part A must not use sensitive as a base-analysis teaching example`
        );
      }

      const practiceEntries =
        practiceWords
          .map(
            wanted =>
              words.find(
                entry =>
                  normalize(
                    entry?.word
                  ) === wanted
              )
          )
          .filter(Boolean);

      const practiceTasks =
        practiceEntries.map(
          taskFor
        );

      const runtimeSpecs =
        practiceTasks.map(
          (task, index) =>
            api.buildPartASpec({
              target: ive,
              task,
              index,
              total:
                practiceTasks.length,
              allTasks:
                practiceTasks
            })
        );

      if (
        durationCase.minutes ===
          30
      ) {
        const runtimeMoves =
          runtimeSpecs.map(
            spec =>
              spec?.move
          );

        if (
          runtimeMoves.join("|") !==
          "notice|connect|compare|pattern"
        ) {
          fail(
            `-ive 30-minute runtime moves must be Notice → Connect → Compare → Pattern; got ${runtimeMoves.join(" → ")}`
          );
        }

        if (
          runtimeSpecs[1]
            ?.word !==
            "active" ||
          runtimeSpecs[1]
            ?.structure !==
            "act + -ive → active"
        ) {
          fail(
            "-ive 30-minute runtime second item must be the approved active Connect item"
          );
        }
      }
    }
  }

  const silly =
    api.buildSillyChallenge({
      target: ive
    });

  if (
    !silly.starter.includes(
      "swoof"
    ) ||
    !silly.starter.includes(
      "hop around while making a funny noise"
    )
  ) {
    fail(
      "-ive Silly Word Challenge is missing the agreed swoof scaffold"
    );
  }

  if (
    silly.prompt.includes("-ive") ||
    silly.starter.includes("-ive")
  ) {
    fail(
      "-ive Silly Word Challenge must not pre-fill the suffix; it should use the word part the student just retrieved"
    );
  }
}

console.log(
  `Targets with usable inventory examples audited: ${targetsAudited}`
);

console.log(
  `Targets with 4-example progression audited: ${fourItemTargets}`
);

console.log(
  `Hard failures: ${failures.length}`
);

if (failures.length) {
  for (
    const failure
    of failures
  ) {
    console.log(
      `- ${failure}`
    );
  }

  process.exitCode = 1;
} else {
  console.log(
    "Rich Word Part Part A progression complete: true"
  );
  console.log(
    "Recognition remains richer than repeated target-label naming: true"
  );
  console.log(
    "Step 5 recognition → independent recall preserved: true"
  );
  console.log(
    "Optional unscored Silly Word Challenge protected after retrieval: true"
  );
  console.log(
    "-ive runtime selection + approved examples complete: true"
  );
}
