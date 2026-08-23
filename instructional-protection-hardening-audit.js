"use strict";

const fs = require("fs");

global.window = global;

const registryJson =
  JSON.parse(
    fs.readFileSync(
      "./instructional-protection-registry.json",
      "utf8"
    )
  );

require("./instructional-protection-registry.js");
require("./word-inventory.js");

try {
  require("./linguistic-role-registry.js");
} catch (error) {}

require("./instructional-session-item-bank.js");

const registry =
  global.FirstVoloInstructionalProtection;

const bank =
  global.FirstVoloSessionItemBank;

const targets =
  global.FIRST_VOLO_MORPHEME_INVENTORY || [];

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
const promptCollisions = [];

function norm(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[‐‑‒–—−]/g, "-");
}

function tokens(text) {
  return (
    String(text || "")
      .toLowerCase()
      .match(/[a-z]+(?:['-][a-z]+)*/g) ||
    []
  );
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

function sameArray(a, b) {
  const aa =
    [...a].sort();

  const bb =
    [...b].sort();

  return (
    aa.length === bb.length &&
    aa.every(
      (item, index) =>
        item === bb[index]
    )
  );
}

const jsPools = {
  formalPrePost:
    registry.formalPrePost || [],
  migrationChallenge:
    registry.migrationChallenge || [],
  connectedTextTransfer:
    registry.connectedTextTransfer || []
};

for (
  const poolName of
  Object.keys(jsPools)
) {
  if (
    !sameArray(
      jsPools[poolName],
      registryJson[poolName] || []
    )
  ) {
    failures.push(
      `${poolName}: JS and JSON registries do not match.`
    );
  }
}

if (
  jsPools.connectedTextTransfer
    .length !== 190
) {
  failures.push(
    `connectedTextTransfer: expected 190 words; found ${jsPools.connectedTextTransfer.length}.`
  );
}

const allProtected =
  new Set(
    registry
      .allProtectedWords()
      .map(norm)
  );

const poolTotal =
  jsPools.formalPrePost.length +
  jsPools.migrationChallenge.length +
  jsPools.connectedTextTransfer.length;

if (
  allProtected.size !==
  poolTotal
) {
  failures.push(
    "Protection pools overlap or contain duplicates."
  );
}

if (
  typeof registry.isProtected !==
    "function" ||
  typeof registry.protectionReason !==
    "function"
) {
  failures.push(
    "Central protection API is missing."
  );
}

const scriptSource =
  fs.readFileSync(
    "./script.js",
    "utf8"
  );

if (
  !scriptSource.includes(
    "FirstVoloInstructionalProtection"
  ) ||
  !scriptSource.includes(
    "central.isProtected"
  )
) {
  failures.push(
    "Main student script is not using the central protection API."
  );
}

/*
  HARD lexical fields:
  These represent actual words/examples/parts/options/context presented
  in ordinary instruction. A protected whole word here is a true leak.
*/
const HARD_KEYS =
  new Set([
    "word",
    "applyWord",
    "parts",
    "applyParts",
    "buildTiles",
    "applyBuildTiles",
    "tiles",
    "words",
    "huntWords",
    "distractors",
    "options",
    "choices",
    "examples",
    "example",
    "context",
    "contextPrompt",
    "sentence",
    "sentencePrompt"
  ]);

/*
  PROMPT-LANGUAGE fields:
  These can contain ordinary instructional verbs such as "produce",
  "review", or "construct". Report collisions for visibility, but they
  are not hard failures unless the same protected word also appears in
  a structured lexical field above.
*/
const PROMPT_KEYS =
  new Set([
    "activityPrompt",
    "wordPrompt",
    "applyPrompt",
    "followUpPrompt",
    "educatorDoes",
    "studentDoes",
    "educatorKey",
    "applyEducatorKey"
  ]);

function protectedTokens(text) {
  return [
    ...new Set(
      tokens(text)
        .map(norm)
        .filter(
          token =>
            allProtected.has(
              token
            )
        )
    )
  ];
}

function scanHardValue(
  value,
  path,
  found
) {
  if (
    typeof value === "string"
  ) {
    for (
      const token of
      protectedTokens(value)
    ) {
      found.push({
        token,
        path
      });
    }

    return;
  }

  if (
    Array.isArray(value)
  ) {
    value.forEach(
      (item, index) => {
        scanHardValue(
          item,
          `${path}[${index}]`,
          found
        );
      }
    );

    return;
  }

  if (
    value &&
    typeof value === "object"
  ) {
    for (
      const [key, child] of
      Object.entries(value)
    ) {
      /*
        Inside tile/option objects, lexical display fields are relevant.
      */
      if (
        [
          "word",
          "label",
          "text",
          "value",
          "answer"
        ].includes(key)
      ) {
        scanHardValue(
          child,
          `${path}.${key}`,
          found
        );
      } else if (
        Array.isArray(child) ||
        (
          child &&
          typeof child ===
            "object"
        )
      ) {
        scanHardValue(
          child,
          `${path}.${key}`,
          found
        );
      }
    }
  }
}

function hardLeaks(recipe) {
  const found = [];

  for (
    const key of
    HARD_KEYS
  ) {
    if (
      Object.prototype
        .hasOwnProperty
        .call(
          recipe,
          key
        )
    ) {
      scanHardValue(
        recipe[key],
        key,
        found
      );
    }
  }

  const unique = new Map();

  for (
    const item of found
  ) {
    const key =
      `${item.token}@@${item.path}`;

    unique.set(
      key,
      item
    );
  }

  return [
    ...unique.values()
  ];
}

function promptOnlyCollisions(
  recipe,
  hardTokens
) {
  const found = [];

  for (
    const key of
    PROMPT_KEYS
  ) {
    const value =
      recipe?.[key];

    if (
      typeof value !==
      "string"
    ) {
      continue;
    }

    for (
      const token of
      protectedTokens(value)
    ) {
      if (
        !hardTokens.has(
          token
        )
      ) {
        found.push({
          token,
          path:
            key
        });
      }
    }
  }

  const unique = new Map();

  for (
    const item of found
  ) {
    const key =
      `${item.token}@@${item.path}`;

    unique.set(
      key,
      item
    );
  }

  return [
    ...unique.values()
  ];
}

let ordinaryRecipesChecked = 0;

for (const target of targets) {
  const resolvedTarget = {
    ...target,
    role:
      roleFor(target)
  };

  const resolution = {
    primary:
      resolvedTarget,
    allTargets: [
      resolvedTarget
    ]
  };

  for (
    const activity of
    activities
  ) {
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

    for (
      const recipe of recipes
    ) {
      ordinaryRecipesChecked += 1;

      const hard =
        hardLeaks(
          recipe
        );

      const hardTokens =
        new Set(
          hard.map(
            item =>
              item.token
          )
        );

      if (hard.length) {
        failures.push({
          target:
            target.id,
          activity,
          word:
            recipe.word ||
            "no word",
          leaks:
            hard
        });
      }

      const collisions =
        promptOnlyCollisions(
          recipe,
          hardTokens
        );

      if (
        collisions.length
      ) {
        promptCollisions.push({
          target:
            target.id,
          activity,
          word:
            recipe.word ||
            "no word",
          collisions
        });
      }
    }
  }
}

console.log(
  "Protection registry version:",
  registry.version
);

console.log(
  "Formal Pre/Post words:",
  jsPools.formalPrePost.length
);

console.log(
  "Migration Challenge words:",
  jsPools.migrationChallenge.length
);

console.log(
  "Check Transfer words:",
  jsPools.connectedTextTransfer.length
);

console.log(
  "Total unique protected words:",
  allProtected.size
);

console.log(
  "Ordinary teacher recipes checked:",
  ordinaryRecipesChecked
);

console.log(
  "Hard lexical protection failures:",
  failures.length
);

console.log(
  "Prompt-language collisions (informational):",
  promptCollisions.length
);

if (
  promptCollisions.length
) {
  const counts =
    new Map();

  for (
    const item of
    promptCollisions
  ) {
    for (
      const collision of
      item.collisions
    ) {
      counts.set(
        collision.token,
        (
          counts.get(
            collision.token
          ) ||
          0
        ) + 1
      );
    }
  }

  console.log(
    "\nPrompt-language collision summary:"
  );

  for (
    const [token, count] of
    [...counts.entries()]
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(0, 20)
  ) {
    console.log(
      `- ${token}: ${count}`
    );
  }
}

if (
  failures.length
) {
  console.log(
    "\nTrue structured lexical protection failures:"
  );

  for (
    const failure of
    failures.slice(0, 100)
  ) {
    const leakText =
      failure.leaks
        .map(
          item =>
            `${item.token} @ ${item.path}`
        )
        .join(", ");

    console.log(
      `- ${failure.target} · ${failure.activity} · ${failure.word}: ${leakText}`
    );
  }

  if (
    failures.length > 100
  ) {
    console.log(
      `... ${failures.length - 100} more hard failure(s)`
    );
  }

  process.exitCode = 2;
} else {
  console.log(
    "\nGlobal protection hardening complete: true"
  );
}
