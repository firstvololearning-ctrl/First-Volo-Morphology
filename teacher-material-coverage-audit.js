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

const missing = [];
const counts = Object.fromEntries(activities.map(activity => [activity, 0]));

for (const target of targets) {
  const result = global.FirstVoloSessionItemBank.auditTarget({
    target,
    activities
  });

  for (const activity of activities) {
    if (result[activity]) {
      counts[activity] += 1;
    } else {
      missing.push({
        id: target.id,
        label: target.label,
        type: target.type,
        activity
      });
    }
  }
}

console.log("Teacher material bank:", global.FirstVoloSessionItemBank.version);
console.log("Targets audited:", targets.length);
console.log("Activities per target:", activities.length);
console.log("Expected target/activity cells:", targets.length * activities.length);
console.log("Coverage by activity:", counts);
console.log("Missing cells:", missing.length);

if (missing.length) {
  console.log("\nMissing target/activity cells:");
  for (const item of missing) {
    console.log(`- ${item.id} (${item.label}) · ${item.activity}`);
  }
  process.exitCode = 2;
} else {
  console.log("Coverage complete: true");
}
