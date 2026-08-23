"use strict";

global.window = global;

require("./word-inventory.js");
require("./instructional-protection-registry.js");

try {
  require("./instructional-check-transfer.js");
} catch (error) {
  console.error("Check Transfer module could not be loaded:", error.message);
  process.exit(1);
}

require("./instructional-session-item-bank.js");

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

const targets = Array.isArray(global.FIRST_VOLO_MORPHEME_INVENTORY)
  ? global.FIRST_VOLO_MORPHEME_INVENTORY
  : [];

const bank = global.FirstVoloSessionItemBank;

if (!bank || typeof bank.auditTarget !== "function") {
  console.error("Teacher material item bank is unavailable.");
  process.exit(1);
}

if (typeof bank.activityApplicability !== "function") {
  console.error(
    "Teacher material item bank does not expose activityApplicability()."
  );
  process.exit(1);
}

const uncoveredApplicable = [];
const nonApplicable = [];
const coveredByActivity = Object.fromEntries(
  activities.map(activity => [activity, 0])
);
const nonApplicableByActivity = Object.fromEntries(
  activities.map(activity => [activity, 0])
);

let applicableCells = 0;
let coveredApplicableCells = 0;

for (const target of targets) {
  const result = bank.auditTarget({
    target,
    activities
  });

  for (const activity of activities) {
    const applicability = bank.activityApplicability(target, activity);

    if (!applicability?.applicable) {
      const reason = String(applicability?.reason || "").trim();

      nonApplicableByActivity[activity] += 1;
      nonApplicable.push({
        id: target.id,
        label: target.label,
        type: target.type,
        activity,
        reason
      });

      if (!reason) {
        uncoveredApplicable.push({
          id: target.id,
          label: target.label,
          type: target.type,
          activity,
          reason:
            "Activity was marked not applicable but no instructional reason was provided."
        });
      }

      continue;
    }

    applicableCells += 1;

    if (result[activity]) {
      coveredApplicableCells += 1;
      coveredByActivity[activity] += 1;
    } else {
      uncoveredApplicable.push({
        id: target.id,
        label: target.label,
        type: target.type,
        activity,
        reason: "No ordinary teacher material was generated for an applicable cell."
      });
    }
  }
}

const totalCells = targets.length * activities.length;

console.log("Teacher material bank:", bank.version);
console.log("Targets audited:", targets.length);
console.log("Activities per target:", activities.length);
console.log("Total target/activity cells:", totalCells);
console.log("Applicable cells:", applicableCells);
console.log("Covered applicable cells:", coveredApplicableCells);
console.log("Intentionally not applicable cells:", nonApplicable.length);
console.log("Unexplained applicable gaps:", uncoveredApplicable.length);
console.log("Covered by activity:", coveredByActivity);
console.log("Not applicable by activity:", nonApplicableByActivity);

if (nonApplicable.length) {
  console.log("\nDocumented intentionally not applicable cells:");
  for (const item of nonApplicable) {
    console.log(
      `- ${item.id} (${item.label}) · ${item.activity}: ${item.reason}`
    );
  }
}

if (uncoveredApplicable.length) {
  console.log("\nUnexplained applicable gaps:");
  for (const item of uncoveredApplicable) {
    console.log(
      `- ${item.id} (${item.label}) · ${item.activity}: ${item.reason}`
    );
  }
  process.exitCode = 2;
} else {
  console.log("\nApplicable coverage complete: true");
}
