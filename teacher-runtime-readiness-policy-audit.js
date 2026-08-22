"use strict";

const fs = require("fs");
const path = require("path");

const uiPath = path.join(__dirname, "session-materials-ui.js");
const source = fs.readFileSync(uiPath, "utf8");

const failures = [];

function requireText(text, label) {
  if (!source.includes(text)) {
    failures.push(`Missing ${label}: ${text}`);
  }
}

requireText(
  "FIRST_VOLO_ACTIVITY_DEMAND_READINESS_V10",
  "V10 readiness marker"
);

const expected = {
  find: false,
  hunt: false,
  meaning: false,
  morpheme: false,
  break: true,
  infer: false,
  build: true,
  use: false,
  change: false
};

for (const [activity, needsOthers] of Object.entries(expected)) {
  const pattern = new RegExp(
    `${activity}:\\s*\\{[\\s\\S]*?requiresKnownOtherMorphemes:\\s*${needsOthers}`,
    "m"
  );

  if (!pattern.test(source)) {
    failures.push(
      `${activity}: expected requiresKnownOtherMorphemes=${needsOthers}`
    );
  }
}

const breakHelperOccurrences =
  (source.match(/readyV7BreakOtherMorphemesWereEncountered\s*\(/g) || [])
    .length;

if (breakHelperOccurrences !== 2) {
  failures.push(
    `Expected the co-morpheme readiness helper to have one definition + one runtime call; found ${breakHelperOccurrences} occurrences.`
  );
}

requireText(
  'next.textContent =\n        "Next practice →";',
  "multi-item Part A navigation"
);

requireText(
  'next.textContent =\n        "Part B →";',
  "Part B transition after final Part A item"
);

console.log("=== Teacher runtime readiness policy audit ===");
console.log("Find / Hunt: target-only knowledge is sufficient.");
console.log("Meaning / Word Part: target-only knowledge is sufficient.");
console.log("Break It Apart: all analyzed boundaries must be instructionally available.");
console.log("Figure It Out: other morphemes do not all have to be previously taught.");
console.log("Build Words: construction parts must be instructionally available.");
console.log("Use It / Change It: do not impose a blanket all-morphemes-known rule.");
console.log(`Hard failures: ${failures.length}`);

if (failures.length) {
  failures.forEach((failure) => console.log(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log("Runtime readiness policy complete: true");
}
