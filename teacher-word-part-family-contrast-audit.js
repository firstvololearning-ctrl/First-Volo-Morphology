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
    .replace(/[^a-z0-9]+/g, "");
}

function load(context, filename) {
  const source = fs.readFileSync(path.join(root, filename), "utf8");
  vm.runInContext(source, context, { filename });
  return source;
}

console.log("=== Compare the Family audit ===");

const context = { window: {}, console };
vm.createContext(context);

load(context, "word-inventory.js");

try {
  load(context, "instructional-protection-registry.js");
  load(context, "instructional-session-item-bank.js");
} catch (error) {
  fail(`Could not load protection/item-bank modules: ${error.message}`);
}

load(context, "word-part-family-contrast.js");

const uiSource = fs.readFileSync(
  path.join(root, "session-materials-ui.js"),
  "utf8"
);

const htmlSource = fs.readFileSync(
  path.join(root, "session-materials.html"),
  "utf8"
);

const api = context.window.FirstVoloWordPartFamilyContrast;
const bank = context.window.FirstVoloSessionItemBank;

if (!api) {
  fail("FirstVoloWordPartFamilyContrast API missing");
}

const families = Array.isArray(api?.families) ? api.families : [];

if (families.length !== 2) {
  fail(`Expected exactly 2 initial curated families; found ${families.length}`);
}

for (const family of families) {
  if (!family.id || !family.base) {
    fail("Curated family missing id/base");
  }

  if (!Array.isArray(family.choices) || family.choices.length !== 4) {
    fail(`${family.id}: expected exactly 4 family choices`);
    continue;
  }

  const answers = family.choices.filter(choice => choice.answer === true);
  if (answers.length !== 1) {
    fail(`${family.id}: expected exactly one correct answer; found ${answers.length}`);
  }

  const words = family.choices.map(choice => normalize(choice.word));
  if (new Set(words).size !== words.length) {
    fail(`${family.id}: duplicate word choices`);
  }

  const suffixes = family.choices.map(choice => normalize(choice.suffix));
  if (new Set(suffixes).size !== suffixes.length) {
    fail(`${family.id}: family choices must contrast 4 different endings`);
  }

  for (const choice of family.choices) {
    if (!choice.job) {
      fail(`${family.id}: ${choice.word} is missing its word-family job explanation`);
    }

    if (bank?.isProtected?.(choice.word)) {
      fail(`${family.id}: curated family word is protected: ${choice.word}`);
    }
  }

  if (
    !family.followUp ||
    !Array.isArray(family.support) ||
    family.support.length < 2 ||
    !Array.isArray(family.explanation) ||
    family.explanation.length < 2
  ) {
    fail(`${family.id}: incomplete follow-up/support/explanation`);
  }
}

if (api) {
  const ive = { id: "ive", label: "-ive" };

  const thirty = api.select({
    target: ive,
    words: ["creative", "active", "constructive", "destructive"],
    minutes: 30
  });

  const fifteen = api.select({
    target: ive,
    words: ["creative", "active"],
    minutes: 15
  });

  const createFallback = api.select({
    target: ive,
    words: ["creative"],
    minutes: 30
  });

  if (thirty?.id !== "act-family") {
    fail("30-minute -ive session should select ACT family first");
  }

  if (fifteen !== null) {
    fail("Compare the Family must remain unavailable at 15 minutes");
  }

  if (createFallback?.id !== "create-family") {
    fail("CREATE family should be the fallback when active is not present");
  }

  if (thirty?.optional !== true || thirty?.scored !== false) {
    fail("Compare the Family must be optional and unscored");
  }

  const actAnswerIndex =
    thirty?.choices?.findIndex(
      choice => choice.answer === true
    );

  const createAnswerIndex =
    createFallback?.choices?.findIndex(
      choice => choice.answer === true
    );

  if (actAnswerIndex !== 1) {
    fail(
      `ACT family correct answer should be position 2; found ${actAnswerIndex + 1}`
    );
  }

  if (createAnswerIndex !== 2) {
    fail(
      `CREATE family correct answer should be position 3; found ${createAnswerIndex + 1}`
    );
  }
}

for (const marker of [
  "FIRST_VOLO_WORD_PART_FAMILY_CONTRAST_UI_V1",
  "readyWordPartFamilyContrastMarkup",
  "readyPrintableFamilyContrastMarkup",
  "Optional · Compare the family"
]) {
  if (!uiSource.includes(marker)) {
    fail(`session-materials-ui.js missing ${marker}`);
  }
}

if (uiSource.includes('class="ready-practice-question ready-word-part-family-contrast"')) {
  fail("Compare the Family must not be part of the scored ready-practice-question surface");
}

const familyScriptIndex = htmlSource.indexOf("word-part-family-contrast.js");
const uiScriptIndex = htmlSource.indexOf("session-materials-ui.js");

if (
  familyScriptIndex < 0 ||
  uiScriptIndex < 0 ||
  familyScriptIndex > uiScriptIndex
) {
  fail("family contrast engine must load before session-materials-ui.js");
}

console.log(`Curated families audited: ${families.length}`);
console.log(`Hard failures: ${failures.length}`);

if (failures.length) {
  for (const failure of failures) {
    console.log(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("Four real same-family choices with different endings: true");
  console.log("Protected ordinary-assessment words excluded: true");
  console.log("30-minute optional / unscored policy: true");
  console.log("ACT live family + CREATE fallback: true");
  console.log("Screen + print extension wiring present: true");
  console.log("Curated correct-answer positions vary: true");
}
