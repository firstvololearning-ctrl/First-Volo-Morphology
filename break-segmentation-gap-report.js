"use strict";

const fs = require("fs");
const path = require("path");

global.window = global;

const coverageSource =
  fs.readFileSync(
    path.join(__dirname, "teacher-material-coverage-audit.js"),
    "utf8"
  );

const requirePattern =
  /require\(\s*["'](\.\/[^"']+)["']\s*\)/g;

const loaded = new Set();

for (const match of coverageSource.matchAll(requirePattern)) {
  const full =
    path.join(__dirname, match[1]);

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

const targets =
  Array.isArray(global.FIRST_VOLO_MORPHEME_INVENTORY)
    ? global.FIRST_VOLO_MORPHEME_INVENTORY
    : [];

if (!bank?.buildItems || !bank?.activityApplicability) {
  console.error("Teacher material bank unavailable.");
  process.exit(1);
}

function roleFor(target) {
  if (target.role) {
    return target.role;
  }

  if (target.type === "prefix") {
    return "prefix";
  }

  if (target.type === "suffix") {
    return "suffix";
  }

  return "root";
}

function resolutionFor(target) {
  const primary = {
    ...target,
    role: roleFor(target)
  };

  return {
    primary,
    allTargets: [primary]
  };
}

const gaps = [];

for (const target of targets) {
  const applicability =
    bank.activityApplicability(
      target,
      "break"
    );

  if (
    applicability &&
    applicability.applicable === false
  ) {
    continue;
  }

  const recipes =
    bank.buildItems({
      targetResolution:
        resolutionFor(target),
      activity:
        "break",
      limit:
        25
    });

  const segmented =
    recipes.filter(
      item =>
        String(
          item.segmentation || ""
        ).trim()
    );

  if (segmented.length) {
    continue;
  }

  gaps.push({
    target,
    recipes
  });
}

console.log(
  "Break It Apart targets with NO approved segmented practice word:",
  gaps.length
);

for (const { target, recipes } of gaps) {
  console.log("");
  console.log(
    `=== ${target.id} · ${target.label} · ${roleFor(target)} ===`
  );

  if (target.meaning) {
    console.log(
      `Target meaning: ${target.meaning}`
    );
  }

  if (!recipes.length) {
    console.log(
      "No ordinary Break It Apart recipes resolve for this target."
    );
    continue;
  }

  for (const item of recipes) {
    console.log(
      [
        `word=${item.word || "(none)"}`,
        `segmentation=${item.segmentation || "(none)"}`,
        `definition=${item.definition || "(none)"}`,
        `key=${item.educatorKey || "(none)"}`
      ].join(" | ")
    );
  }
}

console.log("");
console.log(
  "Decision needed for each target above: add at least one clean approved segmentation, or explicitly make Break It Apart not applicable when a defensible boundary task would force false morphology."
);
