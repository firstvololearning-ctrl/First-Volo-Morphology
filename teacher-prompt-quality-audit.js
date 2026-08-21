"use strict";

global.window = global;

require("./word-inventory.js");

try {
  require("./linguistic-role-registry.js");
} catch (error) {}

require("./instructional-session-item-bank.js");

const bank =
  global.FirstVoloSessionItemBank;

const targets =
  Array.isArray(
    global.FIRST_VOLO_MORPHEME_INVENTORY
  )
    ? global.FIRST_VOLO_MORPHEME_INVENTORY
    : [];

const activities = [
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
];

const failures = [];
const openOnlyCells = [];

let recipesChecked = 0;
let specificApplyRecipes = 0;
let validConstrainedOpenResponses = 0;

function norm(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function roleFor(target) {
  if (target.type === "prefix") {
    return "prefix";
  }

  if (target.type === "suffix") {
    return "suffix";
  }

  return "root";
}

function targetResolution(target) {
  const resolved = {
    ...target,
    role:
      roleFor(target)
  };

  return {
    primary:
      resolved,
    allTargets: [
      resolved
    ]
  };
}

function addFailure(
  target,
  activity,
  recipe,
  message
) {
  failures.push(
    `${target.id} (${target.label}) · ${activity} · ${recipe?.word || "no word"}: ${message}`
  );
}

function validOpenPrompt(
  recipe,
  target
) {
  const prompt =
    norm(
      recipe.applyPrompt
    );

  const key =
    norm(
      recipe.applyEducatorKey
    );

  const asksForNewWord =
    prompt.includes(
      "another real word"
    ) ||
    prompt.includes(
      "a new word"
    ) ||
    prompt.includes(
      "new word"
    );

  const asksForUse =
    prompt.includes(
      "sentence"
    ) ||
    prompt.includes(
      "use it"
    );

  const asksForExplanation =
    prompt.includes(
      "explain"
    ) ||
    prompt.includes(
      "contributes"
    );

  const openKey =
    key.includes(
      "open response"
    ) ||
    key.includes(
      "verify that"
    );

  return (
    asksForNewWord &&
    asksForUse &&
    asksForExplanation &&
    openKey &&
    !recipe.applyWord
  );
}

for (const target of targets) {
  const resolution =
    targetResolution(
      target
    );

  for (const activity of activities) {
    const applicability =
      bank.activityApplicability?.(
        target,
        activity
      ) || {
        applicable: true
      };

    if (
      applicability
        .applicable === false
    ) {
      continue;
    }

    const recipes =
      bank.buildItems({
        targetResolution:
          resolution,
        activity,
        limit:
          5
      }) || [];

    if (!recipes.length) {
      addFailure(
        target,
        activity,
        null,
        "No ordinary recipe was generated for an applicable activity."
      );
      continue;
    }

    let openCount = 0;

    for (const recipe of recipes) {
      recipesChecked += 1;

      const practicePrompt =
        String(
          recipe.activityPrompt ||
          recipe.wordPrompt ||
          ""
        ).trim();

      const educatorKey =
        String(
          recipe.educatorKey ||
          recipe.answer ||
          ""
        ).trim();

      if (
        practicePrompt.length < 8
      ) {
        addFailure(
          target,
          activity,
          recipe,
          "Teach / Practice prompt is missing or too vague."
        );
      }

      if (!educatorKey) {
        addFailure(
          target,
          activity,
          recipe,
          "Educator key is missing."
        );
      }

      if (
        !String(
          recipe.applyPrompt ||
          ""
        ).trim()
      ) {
        addFailure(
          target,
          activity,
          recipe,
          "Apply prompt is missing."
        );
      }

      if (
        !String(
          recipe.applyEducatorKey ||
          ""
        ).trim()
      ) {
        addFailure(
          target,
          activity,
          recipe,
          "Apply educator key is missing."
        );
      }

      if (
        recipe.applyKind ===
        "specific-new-item"
      ) {
        specificApplyRecipes += 1;

        if (!recipe.applyWord) {
          addFailure(
            target,
            activity,
            recipe,
            "Specific Apply is missing its expected word."
          );
        }

        if (
          recipe.applyWord &&
          norm(recipe.applyWord) ===
            norm(recipe.word)
        ) {
          addFailure(
            target,
            activity,
            recipe,
            "Specific Apply reuses the Teach / Practice word."
          );
        }

        if (
          recipe.applyWord &&
          !norm(
            recipe.applyEducatorKey
          ).includes(
            norm(
              recipe.applyWord
            )
          )
        ) {
          addFailure(
            target,
            activity,
            recipe,
            "Specific Apply educator key does not identify the expected Apply word."
          );
        }
      } else if (
        recipe.applyKind ===
        "open-new-item"
      ) {
        openCount += 1;

        if (
          validOpenPrompt(
            recipe,
            target
          )
        ) {
          validConstrainedOpenResponses += 1;
        } else {
          addFailure(
            target,
            activity,
            recipe,
            "Open Apply is weak or unconstrained. It must require a genuinely new word, sentence use, explanation, and an open-response verification key."
          );
        }
      } else {
        addFailure(
          target,
          activity,
          recipe,
          `Unknown Apply kind: ${recipe.applyKind || "missing"}.`
        );
      }
    }

    if (
      openCount ===
      recipes.length
    ) {
      openOnlyCells.push({
        target:
          target.id,
        label:
          target.label,
        activity,
        recipes:
          recipes.length
      });
    }
  }
}

console.log(
  "Teacher material bank:",
  bank.version
);

console.log(
  "Recipes checked:",
  recipesChecked
);

console.log(
  "Specific Apply recipes:",
  specificApplyRecipes
);

console.log(
  "Valid constrained open responses:",
  validConstrainedOpenResponses
);

console.log(
  "Open-only target/activity cells (informational):",
  openOnlyCells.length
);

console.log(
  "Prompt-quality hard failures:",
  failures.length
);

if (openOnlyCells.length) {
  console.log(
    "\nOpen-only cells are not failures when the open prompt is constrained."
  );

  for (
    const item of
    openOnlyCells.slice(0, 20)
  ) {
    console.log(
      `- ${item.target} (${item.label}) · ${item.activity}`
    );
  }

  if (
    openOnlyCells.length > 20
  ) {
    console.log(
      `... ${openOnlyCells.length - 20} more informational cell(s)`
    );
  }
}

if (failures.length) {
  console.log(
    "\nPrompt-quality failures:"
  );

  for (
    const failure of
    failures.slice(0, 100)
  ) {
    console.log(
      `- ${failure}`
    );
  }

  if (failures.length > 100) {
    console.log(
      `... ${failures.length - 100} more failure(s)`
    );
  }

  process.exitCode = 2;
} else {
  console.log(
    "\nPrompt quality complete: true"
  );
}
