"use strict";

const fs = require("fs");
const path = require("path");

global.window = global;

/*
  Reuse the same local modules that the established coverage audit loads,
  then add the resolver if the coverage audit does not already load it.
*/
const coverageSource =
  fs.readFileSync(
    path.join(
      __dirname,
      "teacher-material-coverage-audit.js"
    ),
    "utf8"
  );

const requirePattern =
  /require\(\s*["'](\.\/[^"']+)["']\s*\)/g;

const loaded = new Set();

for (
  const match
  of coverageSource.matchAll(
    requirePattern
  )
) {
  const localPath =
    match[1];

  if (
    localPath.includes(
      "teacher-material-coverage-audit"
    )
  ) {
    continue;
  }

  const full =
    path.join(
      __dirname,
      localPath
    );

  if (
    fs.existsSync(full) &&
    !loaded.has(full)
  ) {
    require(full);
    loaded.add(full);
  }
}

for (
  const localFile
  of [
    "./instructional-material-families.js",
    "./instructional-material-spec.js",
    "./instructional-material-resolver.js"
  ]
) {
  const full =
    path.join(
      __dirname,
      localFile
    );

  if (
    fs.existsSync(full) &&
    !loaded.has(full)
  ) {
    require(full);
    loaded.add(full);
  }
}

const bank =
  global.FirstVoloSessionItemBank;

const resolver =
  global.FirstVoloInstructionalMaterialResolver;

const targets =
  Array.isArray(
    global.FIRST_VOLO_MORPHEME_INVENTORY
  )
    ? global.FIRST_VOLO_MORPHEME_INVENTORY
    : [];

if (
  !bank?.buildItems ||
  !bank?.activityApplicability
) {
  console.error(
    "Teacher material item bank is unavailable."
  );
  process.exit(1);
}

if (
  !resolver?.resolve
) {
  console.error(
    "Instructional material resolver is unavailable."
  );
  process.exit(1);
}

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

const expected = {
  learn: [/mean/, /contribut/, /example/],
  find: [/find/, /locat/, /point/],
  hunt: [/contain/, /which/, /find/, /new word/],
  meaning: [/mean/, /contribut/],
  morpheme: [/word part/, /prefix/, /suffix/, /root/, /known meaning/, /name the/],
  break: [/break/, /meaningful part/, /boundar/, /segment/],
  infer: [
    /infer/,
    /probably mean/,
    /suggest/,
    /morphology/,
    /what do you think .* means/,
    /start with what .* tells you/
  ],
  build: [/build/, /combine/, /assemble/],
  use: [/sentence/, /context/, /use /],
  change: [/related form/, /word family/, /changed morphologically/, /form/]
};

const forbidden = {
  find: [/build or say/, /combine .* to make/, /build a real word/],
  meaning: [/build or say/, /combine .* to make/],
  morpheme: [/build or say/, /combine .* to make/],
  break: [/build or say/, /combine .* to make/, /build a real word/, /make a real word/],
  infer: [/build or say/, /combine .* to make/, /build a real word/]
};

function targetRole(target) {
  return (
    target.role ||
    target.linguisticRole ||
    (
      target.type === "prefix"
        ? "prefix"
        : (
            target.type === "suffix"
              ? "suffix"
              : "root"
          )
    )
  );
}

function resolutionFor(target) {
  const primary = {
    ...target,
    role:
      targetRole(target)
  };

  return {
    primary,
    allTargets: [
      primary
    ]
  };
}

function lower(value) {
  return String(
    value || ""
  ).toLowerCase();
}

function hasAny(value, patterns) {
  const source =
    lower(value);

  return patterns.some(
    pattern =>
      pattern.test(source)
  );
}

const hard = [];
const review = [];

let cells = 0;
let recipesChecked = 0;
let breakCells = 0;
let breakCellsWithSegmentation = 0;

for (const target of targets) {
  const targetResolution =
    resolutionFor(target);

  for (const activity of activities) {
    const applicability =
      bank.activityApplicability(
        target,
        activity
      );

    if (
      applicability &&
      applicability.applicable === false
    ) {
      continue;
    }

    cells += 1;

    const recipes =
      bank.buildItems({
        targetResolution,
        activity,
        limit:
          5
      });

    if (!recipes.length) {
      hard.push(
        `${target.id} (${target.label}) · ${activity}: no resolved teacher recipe`
      );
      continue;
    }

    if (
      activity === "break"
    ) {
      breakCells += 1;

      if (
        recipes.some(
          recipe =>
            String(
              recipe.segmentation ||
              ""
            ).trim()
        )
      ) {
        breakCellsWithSegmentation += 1;
      } else {
        hard.push(
          `${target.id} (${target.label}) · break: no approved segmented practice word`
        );
      }
    }

    for (const recipe of recipes) {
      recipesChecked += 1;

      if (
        recipe.activity &&
        recipe.activity !== activity
      ) {
        hard.push(
          `${target.id} (${target.label}) · ${activity} · ${recipe.word}: recipe.activity=${recipe.activity}`
        );
      }

      const practice =
        recipe.activityPrompt ||
        recipe.wordPrompt ||
        "";

      const apply =
        recipe.applyPrompt ||
        "";

      const disallowed =
        forbidden[
          activity
        ] || [];

      if (
        disallowed.length &&
        hasAny(
          practice,
          disallowed
        )
      ) {
        hard.push(
          `${target.id} (${target.label}) · ${activity} · ${recipe.word}: Teach / Practice crosses into another activity — ${practice}`
        );
      }

      if (
        disallowed.length &&
        hasAny(
          apply,
          disallowed
        )
      ) {
        hard.push(
          `${target.id} (${target.label}) · ${activity} · ${recipe.word}: Apply crosses into another activity — ${apply}`
        );
      }

      if (
        !hasAny(
          practice,
          expected[
            activity
          ] || []
        )
      ) {
        review.push(
          `${target.id} (${target.label}) · ${activity} · ${recipe.word}: Teach / Practice wording review — ${practice}`
        );
      }

      const applyPatterns =
        activity === "build"
          ? [
              ...(expected[
                activity
              ] || []),
              /give another real word/,
              /another real word containing/
            ]
          : (
              expected[
                activity
              ] || []
            );

      if (
        !hasAny(
          apply,
          applyPatterns
        )
      ) {
        review.push(
          `${target.id} (${target.label}) · ${activity} · ${recipe.word}: Apply wording review — ${apply}`
        );
      }

      if (
        activity === "break" &&
        recipe.applyKind ===
          "specific-new-item" &&
        recipe.applyWord &&
        !String(
          recipe.applySegmentation ||
          ""
        ).trim()
      ) {
        hard.push(
          `${target.id} (${target.label}) · break · ${recipe.word}: specific Apply word ${recipe.applyWord} has no approved segmentation`
        );
      }
    }

    const resolved =
      resolver.resolve({
        targetResolution,
        activity,
        sessionMinutes:
          15,
        gradeBand:
          null,
        vocabLevel:
          null
      });

    if (!resolved) {
      hard.push(
        `${target.id} (${target.label}) · ${activity}: material resolver returned null`
      );
      continue;
    }

    const expectedMode =
      activity === "build"
        ? "build"
        : "prompt";

    if (
      resolved.displayMode !==
        expectedMode
    ) {
      hard.push(
        `${target.id} (${target.label}) · ${activity}: displayMode=${resolved.displayMode}; expected ${expectedMode}`
      );
    }

    if (
      activity !== "build" &&
      resolved.source ===
        "custom-material-family"
    ) {
      hard.push(
        `${target.id} (${target.label}) · ${activity}: non-Build activity resolved from custom Build-family recipes`
      );
    }
  }
}

console.log(
  "Resolved activity/material cells:",
  cells
);

console.log(
  "Runtime recipes checked:",
  recipesChecked
);

console.log(
  "Break It Apart applicable cells:",
  breakCells
);

console.log(
  "Break It Apart cells with approved segmented practice:",
  breakCellsWithSegmentation
);

console.log(
  "Hard semantic/material failures:",
  hard.length
);

console.log(
  "Review-only wording flags:",
  review.length
);

if (hard.length) {
  console.log(
    "\nHard semantic/material failures:"
  );

  for (
    const item
    of hard.slice(
      0,
      180
    )
  ) {
    console.log(
      `- ${item}`
    );
  }

  if (
    hard.length > 180
  ) {
    console.log(
      `... ${hard.length - 180} more hard failure(s)`
    );
  }

  process.exitCode =
    2;
} else {
  console.log(
    "\nResolved material semantics complete: true"
  );
}

if (review.length) {
  console.log(
    "\nReview-only wording flags:"
  );

  for (
    const item
    of review.slice(
      0,
      80
    )
  ) {
    console.log(
      `- ${item}`
    );
  }

  if (
    review.length > 80
  ) {
    console.log(
      `... ${review.length - 80} more review flag(s)`
    );
  }
}
