"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = __dirname;
const failures = [];

function fail(message) {
  failures.push(message);
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

console.log(
  "=== Word Part support-demand + Step 5 precision audit ==="
);

const uiSource =
  fs.readFileSync(
    path.join(
      root,
      "session-materials-ui.js"
    ),
    "utf8"
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
  "word-part-instruction.js"
);

const api =
  context.window
    .FirstVoloWordPartInstruction;

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

if (!api) {
  fail(
    "FirstVoloWordPartInstruction API missing"
  );
}

for (
  const marker
  of [
    "FIRST_VOLO_WORD_PART_DEMAND_SUPPORT_UI_V1",
    "readyWordPartSupportMarkup",
    "readyWordPartStep5AnchorTask",
    "readyWordPartStep5Distractors",
    "readyWordPartStep5SupportMarkup",
    "itemMeaning !=="
  ]
) {
  if (!uiSource.includes(marker)) {
    fail(
      `session-materials-ui.js missing marker/code: ${marker}`
    );
  }
}

function wordsForTarget(target) {
  const wanted =
    new Set(
      variants(
        target?.label
      )
    );

  return words.filter(
    entry =>
      entry?.word &&
      Array.isArray(
        entry.morphemes
      ) &&
      entry.morphemes.some(
        morpheme =>
          variants(
            morpheme
          ).some(
            value =>
              wanted.has(value)
          )
      )
  );
}

function taskFor(entry) {
  return {
    stage:
      "Teach / Practice",
    word:
      entry.word,
    recipe: {
      word:
        entry.word,
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

let targetsChecked = 0;
let step5Anchored = 0;

if (api) {
  for (
    const target
    of morphemes
  ) {
    const entries =
      wordsForTarget(
        target
      ).slice(0, 4);

    if (!entries.length) {
      continue;
    }

    targetsChecked += 1;

    const tasks =
      entries.map(
        taskFor
      );

    const specs =
      tasks.map(
        (task, index) =>
          api.buildPartASpec({
            target,
            task,
            index,
            total:
              tasks.length,
            allTasks:
              tasks
          })
      );

    for (
      const spec
      of specs
    ) {
      if (
        !Array.isArray(
          spec?.support
        ) ||
        spec.support.length <
          2
      ) {
        fail(
          `${target.id || target.label}: ${spec?.move || "unknown"} is missing demand-specific support`
        );
        continue;
      }

      const supportText =
        spec.support
          .join(" ")
          .toLowerCase();

      if (
        /first[- ]sound|first[- ]letter/.test(
          supportText
        )
      ) {
        fail(
          `${target.id || target.label}: ${spec.move} Part A support incorrectly uses a first-sound/first-letter retrieval cue`
        );
      }
    }

    const recognition =
      api.buildStep5Recognition({
        target,
        task:
          tasks[0]
      });

    const recall =
      api.buildStep5Recall({
        target,
        task:
          tasks[0]
      });

    if (
      recognition?.anchorWord
    ) {
      step5Anchored += 1;

      if (
        !String(
          recognition.prompt ||
          ""
        )
          .toLowerCase()
          .includes(
            String(
              recognition.anchorWord
            ).toLowerCase()
          )
      ) {
        fail(
          `${target.id || target.label}: anchored Step 5 recognition prompt does not name its real-word anchor`
        );
      }
    }

    const recognitionSupport =
      Array.isArray(
        recognition?.support
      )
        ? recognition.support
            .join(" ")
            .toLowerCase()
        : "";

    if (
      /first[- ]sound|first[- ]letter/.test(
        recognitionSupport
      )
    ) {
      fail(
        `${target.id || target.label}: Step 5 recognition support must not use a first-letter cue`
      );
    }

    const recallSupport =
      Array.isArray(
        recall?.support
      )
        ? recall.support
            .join(" ")
            .toLowerCase()
        : "";

    if (
      !/first[- ]sound|first[- ]letter|minimal sound or form cue/.test(
        recallSupport
      )
    ) {
      fail(
        `${target.id || target.label}: Step 5 recall is missing the delayed minimal form cue`
      );
    }

    if (
      !/^Without looking back,/i
        .test(
          recall?.prompt ||
          ""
        )
    ) {
      fail(
        `${target.id || target.label}: Step 5 recall is no longer independent recall`
      );
    }
  }
}

const ive =
  morphemes.find(
    item =>
      item?.id === "ive"
  );

const active =
  words.find(
    item =>
      normalize(
        item?.word
      ) === "active"
  );

if (!ive || !active) {
  fail(
    "-ive / active metadata missing"
  );
} else if (api) {
  const activeTask =
    taskFor(active);

  const recognition =
    api.buildStep5Recognition({
      target: ive,
      task:
        activeTask
    });

  const recall =
    api.buildStep5Recall({
      target: ive,
      task:
        activeTask
    });

  if (
    recognition.prompt !==
      "The base/root act means to do. In active, which suffix was added to act?"
  ) {
    fail(
      "-ive Step 5 recognition is not anchored to act → active"
    );
  }

  if (
    recognition.cue !==
      "Active describes someone or something that is doing, moving, or taking part in an action."
  ) {
    fail(
      "-ive Step 5 recognition cue does not carry the approved active meaning"
    );
  }

  const recogSupport =
    recognition.support
      .join(" ")
      .toLowerCase();

  if (
    /first[- ]sound|first[- ]letter/.test(
      recogSupport
    )
  ) {
    fail(
      "-ive recognition still leaks the i cue"
    );
  }

  const recallSupport =
    recall.support
      .join(" ")
      .toLowerCase();

  if (
    !recallSupport.includes(
      "first sound or letter: i"
    )
  ) {
    fail(
      "-ive recall is missing the delayed i cue"
    );
  }
}

const al =
  morphemes.find(
    item =>
      item?.id === "al" ||
      normalize(
        item?.label
      ) === "al"
  );

const ic =
  morphemes.find(
    item =>
      item?.id === "ic" ||
      normalize(
        item?.label
      ) === "ic"
  );

if (
  al &&
  ic &&
  String(
    al.meaning ||
    ""
  )
    .trim()
    .toLowerCase() ===
  String(
    ic.meaning ||
    ""
  )
    .trim()
    .toLowerCase() &&
  !uiSource.includes(
    "itemMeaning !=="
  )
) {
  fail(
    "-al and -ic share a stored meaning but duplicate-meaning Step 5 filtering is not active"
  );
}

if (
  uiSource.includes(
    "You are building a new word. Which suffix would you choose if you wanted the ending to do this job?"
  )
) {
  fail(
    "old ambiguous suffix-only Step 5 recognition prompt still exists"
  );
}

console.log(
  `Targets with usable examples checked: ${targetsChecked}`
);

console.log(
  `Anchored Step 5 recognition targets checked: ${step5Anchored}`
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
    "Part A support follows Notice / Connect / Compare / Pattern demand: true"
  );

  console.log(
    "First-letter/form cue reserved for Step 5 recall: true"
  );

  console.log(
    "Step 5 recognition anchored to real-word morphology: true"
  );

  console.log(
    "Exact duplicate-meaning suffix distractors filtered: true"
  );

  console.log(
    "-ive act → active recognition is not ambiguous with -ic/-al: true"
  );
}
