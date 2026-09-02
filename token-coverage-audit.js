"use strict";

const fs = require("fs");
const vm = require("vm");

const tokenSets = require("./token-sets.js");


/* ========================================
   LOAD MORPHEME INVENTORY
   ======================================== */

const context = {
  window: {}
};

vm.createContext(context);

vm.runInContext(
  fs.readFileSync("word-inventory.js", "utf8"),
  context
);

const inventory =
  context.window.FIRST_VOLO_MORPHEME_INVENTORY || [];

const inventoryById = new Map(
  inventory.map(item => [item.id, item])
);


/* ========================================
   BASIC TOKEN-SET INTEGRITY
   ======================================== */

const activeAssignedIds = [];
const pendingAssignedIds = [];
const assignedIds = [];
const integrityProblems = [];

for (const set of tokenSets) {

  const memberships = [
    ...(set.morphemeIds || []).map(id => ({ id, pending: false })),
    ...(set.pendingMorphemeIds || []).map(id => ({ id, pending: true }))
  ];

  for (const { id, pending } of memberships) {

    assignedIds.push(id);
    (pending ? pendingAssignedIds : activeAssignedIds).push(id);

    const item = inventoryById.get(id);

    if (!item) {
      integrityProblems.push(
        `${set.label}: unknown morpheme ID "${id}"`
      );
      continue;
    }

    if (item.introBand !== set.introBand) {
      integrityProblems.push(
        `${set.label}: ${id} is ${item.introBand}, not ${set.introBand}`
      );
    }

    const allowedTypes =
      set.type === "mixed"
        ? set.morphemeTypes || []
        : [set.type];

    if (!allowedTypes.includes(item.type)) {
      integrityProblems.push(
        `${set.label}: ${id} is type ${item.type}, not one of ${allowedTypes.join(", ")}`
      );
    }
  }
}


const duplicateIds = [
  ...new Set(
    assignedIds.filter(
      (id, index, array) =>
        array.indexOf(id) !== index
    )
  )
];

for (const id of duplicateIds) {
  integrityProblems.push(
    `Morpheme "${id}" appears in more than one token set.`
  );
}


const unassigned = inventory.filter(
  item => !assignedIds.includes(item.id)
);

for (const item of unassigned) {
  integrityProblems.push(
    `Unassigned morpheme: ${item.id} (${item.label})`
  );
}


/* ========================================
   SIMPLE CSV PARSER
   ======================================== */

function parseCsvLine(line) {

  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {

    const char = line[i];

    if (char === '"') {

      if (
        inQuotes &&
        line[i + 1] === '"'
      ) {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);

  return values;
}


/* ========================================
   LOAD CURRICULUM COVERAGE
   ======================================== */

const coveragePath =
  "curriculum-map-coverage.csv";

if (!fs.existsSync(coveragePath)) {

  console.error(
    "\nMissing curriculum-map-coverage.csv."
  );

  console.error(
    "Run: node curriculum-map.js"
  );

  process.exit(1);
}


const csvLines = fs
  .readFileSync(coveragePath, "utf8")
  .trim()
  .split(/\r?\n/);

const headers =
  parseCsvLine(csvLines[0]);

const coverageRows =
  csvLines.slice(1).map(line => {

    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });


const coverageById = new Map(
  coverageRows.map(row => [row.ID, row])
);


const knowledgeActivities = [
  "Meaning",
  "Word Part",
  "Find",
  "Word Hunt"
];

const applicationActivities = [
  "Break It Apart",
  "Figure It Out",
  "Build",
  "Use It",
  "Change It"
];


function activeActivities(row, activities) {

  return activities.filter(
    activity =>
      Number(row?.[activity] || 0) > 0
  );
}


/* ========================================
   REPORT
   ======================================== */

console.log("");
console.log("============================================");
console.log("FIRST VOLO — VOLO TOKEN COVERAGE AUDIT");
console.log("============================================");
console.log("");

console.log(`Inventory morphemes: ${inventory.length}`);
console.log(`Token sets:          ${tokenSets.length}`);
console.log(`Active assigned IDs: ${activeAssignedIds.length}`);
console.log(`Pending IDs:         ${pendingAssignedIds.length}`);
console.log(`Assigned IDs total:  ${assignedIds.length}`);
console.log(`Unassigned:          ${unassigned.length}`);
console.log(`Duplicate IDs:       ${duplicateIds.length}`);
console.log("");


if (integrityProblems.length) {

  console.log("TOKEN-SET INTEGRITY PROBLEMS");
  console.log("--------------------------------------------");

  integrityProblems.forEach(problem => {
    console.log(`⚠ ${problem}`);
  });

  console.log("");

} else {

  console.log(
    "✓ All inventory morphemes are assigned exactly once."
  );

  console.log(
    "✓ All learning-set bands and types match the master inventory."
  );

  console.log("");
}


let totalReady = 0;
let totalGaps = 0;

for (const set of tokenSets) {

  console.log("--------------------------------------------");
  console.log(set.label);
  console.log(
    `${set.collection} · ${
      set.type === "mixed"
        ? set.morphemeTypes.join(" + ")
        : set.type
    } · introduced ${set.introBand}`
  );
  console.log("--------------------------------------------");

  let setReady = 0;
  let setGaps = 0;

  for (const id of set.morphemeIds) {

    const item = inventoryById.get(id);
    const row = coverageById.get(id);

    if (!item) {
      console.log(`⚠ ${id}: missing from inventory`);
      setGaps += 1;
      totalGaps += 1;
      continue;
    }

    if (!row) {
      console.log(
        `⚠ ${item.label}: missing coverage row`
      );
      setGaps += 1;
      totalGaps += 1;
      continue;
    }

    const knowledge =
      activeActivities(
        row,
        knowledgeActivities
      );

    const application =
      activeActivities(
        row,
        applicationActivities
      );

    const applicationOpportunities =
      [
        "Break It Apart",
        "Figure It Out",
        "Build",
        "Use It",
        "Change It"
      ].reduce(
        (sum, activity) =>
          sum + Number(row[activity] || 0),
        0
      );

    const evidenceProfile =
      set.evidenceProfiles?.[item.id] ||
      "standard";

    const knowledgeTarget =
      (
        evidenceProfile === "recognition-only" ||
        evidenceProfile === "limited-application"
      )
        ? 3
        : 2;

    const applicationTarget =
      evidenceProfile === "recognition-only"
        ? 0
        : evidenceProfile === "limited-application"
          ? 1
          : 2;

    const knowledgeReady =
      knowledge.length >= knowledgeTarget;

    const applicationReady =
      applicationOpportunities >= applicationTarget;

    const ready =
      knowledgeReady && applicationReady;

    if (ready) {

      console.log(
        `✓ ${item.label.padEnd(18)} ` +
        `K:${knowledge.length} ` +
        (
          evidenceProfile === "recognition-only"
            ? "recognition-only"
            : `A:${applicationOpportunities} opp · ${application.length} type(s)`
        )
      );

      setReady += 1;
      totalReady += 1;

    } else {

      const reasons = [];

      if (!knowledgeReady) {
        reasons.push(
          `knowledge types ${knowledge.length}/${knowledgeTarget}`
        );
      }

      if (!applicationReady) {
        reasons.push(
          `application opportunities ${applicationOpportunities}/${applicationTarget}`
        );
      }

      console.log(
        `⚠ ${item.label.padEnd(18)} ` +
        reasons.join(" · ")
      );

      console.log(
        `    Knowledge: ${
          knowledge.join(", ") || "none"
        }`
      );

      console.log(
        `    Application: ${
          application.join(", ") || "none"
        }`
      );

      setGaps += 1;
      totalGaps += 1;
    }
  }

  console.log(
    `Set coverage: ${setReady}/${set.morphemeIds.length} ready`
  );

  for (const id of set.pendingMorphemeIds || []) {
    const item = inventoryById.get(id);
    console.log(
      `○ ${item?.label || id}: pending / non-mastery-gating`
    );
  }

  if (setGaps === 0) {
    console.log("✓ Token set has sufficient activity routes.");
  } else {
    console.log(
      `⚠ ${setGaps} morpheme(s) need additional coverage.`
    );
  }

  console.log("");
}


console.log("============================================");
console.log("SUMMARY");
console.log("============================================");

console.log(
  `Active morphemes ready for token rule: ${totalReady}/${activeAssignedIds.length}`
);

console.log(
  `Pending non-mastery-gating:          ${pendingAssignedIds.length}`
);

console.log(
  `Morphemes needing coverage:     ${totalGaps}`
);

console.log("");

if (
  integrityProblems.length === 0 &&
  totalGaps === 0
) {

  console.log(
    "✓ TOKEN COVERAGE PREFLIGHT PASSED"
  );

} else {

  console.log(
    "⚠ TOKEN COVERAGE PREFLIGHT NEEDS WORK"
  );

  console.log(
    "No token earning logic has been turned on."
  );
}

console.log("");
