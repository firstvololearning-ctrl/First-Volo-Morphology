"use strict";

global.window = global;

require("./word-inventory.js");
require("./linguistic-role-registry.js");
require("./instructional-material-families.js");
require("./instructional-material-spec.js");
require("./instructional-protection-registry.js");

try {
  require("./instructional-check-transfer.js");
} catch (error) {
  console.error(
    "Check Transfer module could not be loaded:",
    error.message
  );
  process.exit(1);
}

require("./instructional-session-item-bank.js");
require("./instructional-material-resolver.js");

const targets =
  Array.isArray(
    global.FIRST_VOLO_MORPHEME_INVENTORY
  )
    ? global.FIRST_VOLO_MORPHEME_INVENTORY
    : [];

const bank =
  global.FirstVoloSessionItemBank;

const resolver =
  global.FirstVoloInstructionalMaterialResolver;

const materials =
  global.FirstVoloInstructionalMaterials;

const failures = [];
let applicableTargets = 0;
let resolvedTargets = 0;
let recipesChecked = 0;

function roleFor(target) {
  if (target.type === "prefix") {
    return "prefix";
  }

  if (target.type === "suffix") {
    return "suffix";
  }

  return "root";
}

for (const target of targets) {
  const applicability =
    bank.activityApplicability(
      target,
      "build"
    );

  if (!applicability.applicable) {
    continue;
  }

  applicableTargets += 1;

  const role =
    roleFor(target);

  const targetResolution = {
    primary: {
      ...target,
      role
    },
    allTargets: [
      {
        ...target,
        role
      }
    ]
  };

  const recipes =
    bank.buildItems({
      targetResolution,
      activity:
        "build",
      limit:
        5
    });

  if (!recipes.length) {
    failures.push(
      `${target.id}: no Build recipe with a valid movable-tile decomposition.`
    );
    continue;
  }

  for (const recipe of recipes) {
    recipesChecked += 1;

    if (recipe.mode !== "build") {
      failures.push(
        `${target.id} / ${recipe.word}: Build recipe is not in build mode.`
      );
    }

    if (
      !Array.isArray(recipe.parts) ||
      recipe.parts.length < 2
    ) {
      failures.push(
        `${target.id} / ${recipe.word}: Build recipe has fewer than 2 ordered parts.`
      );
    }

    if (
      !Array.isArray(recipe.buildTiles) ||
      recipe.buildTiles.length <
        recipe.parts.length
    ) {
      failures.push(
        `${target.id} / ${recipe.word}: Build recipe is missing movable tiles.`
      );
    }

    if (
      !Array.isArray(recipe.buildSlots) ||
      recipe.buildSlots.length <
        recipe.parts.length
    ) {
      failures.push(
        `${target.id} / ${recipe.word}: Build recipe is missing ordered slots.`
      );
    }
  }

  const spec =
    materials
      .buildWordBuildingSpec({
        targetResolution
      });

  const material =
    resolver.resolve({
      targetResolution,
      sessionMinutes:
        15,
      materialSpec:
        spec,
      activity:
        "build",
      gradeBand:
        null,
      vocabLevel:
        null
    });

  if (!material) {
    failures.push(
      `${target.id}: resolver returned no Build material.`
    );
    continue;
  }

  if (
    material.displayMode !==
    "build"
  ) {
    failures.push(
      `${target.id}: resolver displayMode is ${material.displayMode}, expected build.`
    );
  }

  if (!material.ready) {
    failures.push(
      `${target.id}: resolved Build material is not ready.`
    );
  }

  if (
    !Array.isArray(material.tiles) ||
    material.tiles.length < 2
  ) {
    failures.push(
      `${target.id}: resolved Build material has fewer than 2 tiles.`
    );
  }

  if (
    !Array.isArray(material.slots) ||
    material.slots.length < 2
  ) {
    failures.push(
      `${target.id}: resolved Build material has fewer than 2 slots.`
    );
  }

  if (
    material.recipes.some(
      recipe =>
        resolver.isProtected(
          recipe.word
        )
    )
  ) {
    failures.push(
      `${target.id}: protected word leaked into resolved Build material.`
    );
  }

  resolvedTargets += 1;
}

console.log(
  "Teacher material bank:",
  bank.version
);

console.log(
  "Applicable Build targets:",
  applicableTargets
);

console.log(
  "Resolved Build targets:",
  resolvedTargets
);

console.log(
  "Build recipes checked:",
  recipesChecked
);

console.log(
  "Build tile failures:",
  failures.length
);

if (failures.length) {
  console.log(
    "\nBuild tile failures:"
  );

  for (const failure of failures) {
    console.log(
      `- ${failure}`
    );
  }

  process.exitCode = 2;
} else {
  console.log(
    "\nBuild tile coverage complete: true"
  );
}
