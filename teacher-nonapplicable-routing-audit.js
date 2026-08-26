"use strict";

global.window = global;

require("./word-inventory.js");

try {
  require("./linguistic-role-registry.js");
} catch (error) {}

require("./instructional-session-item-bank.js");
require("./instructional-session-planner.js");

const planner =
  global.FirstVoloInstructionalSessionPlanner;

const targets =
  global.FIRST_VOLO_MORPHEME_INVENTORY || [];

const failures = [];

function target(id) {
  const found =
    targets.find(
      item =>
        item.id === id
    );

  if (!found) {
    throw new Error(
      `Target ${id} not found.`
    );
  }

  return found;
}

function check({
  id,
  requested,
  expected,
  mustSkip = []
}) {
  const result =
    planner.resolveApplicableActivity({
      requestedActivity:
        requested,
      target:
        target(id)
    });

  if (
    result.activity !==
    expected
  ) {
    failures.push(
      `${id}: requested ${requested}; expected ${expected}; got ${result.activity}`
    );
  }

  const skipped =
    (result.skippedActivities || [])
      .map(
        item =>
          item.activity
      );

  for (
    const activity of
    mustSkip
  ) {
    if (
      !skipped.includes(
        activity
      )
    ) {
      failures.push(
        `${id}: ${activity} should be explicitly skipped when routing from ${requested}.`
      );
    }
  }
}

check({
  id:
    "put",
  requested:
    "break",
  expected:
    "use",
  mustSkip: [
    "break",
    "infer",
    "build"
  ]
});

check({
  id:
    "put",
  requested:
    "infer",
  expected:
    "use",
  mustSkip: [
    "infer",
    "build"
  ]
});

check({
  id:
    "put",
  requested:
    "build",
  expected:
    "use",
  mustSkip: [
    "build"
  ]
});

for (
  const id of
  [
    "chron",
    "pos",
    "val",
    "aud"
  ]
) {
  check({
    id,
    requested:
      "build",
    expected:
      "use",
    mustSkip: [
      "build"
    ]
  });
}

check({
  id:
    "un-negation",
  requested:
    "build",
  expected:
    "build",
  mustSkip: []
});

check({
  id:
    "un-reversative",
  requested:
    "build",
  expected:
    "build",
  mustSkip: []
});

console.log(
  "Routing checks:",
  9
);

console.log(
  "Routing failures:",
  failures.length
);

if (failures.length) {
  console.log(
    "\nRouting failures:"
  );

  for (const failure of failures) {
    console.log(
      `- ${failure}`
    );
  }

  process.exitCode = 2;
} else {
  console.log(
    "\nNon-applicable routing complete: true"
  );

  console.log(
    "PUT skips Break It Apart / Figure It Out / Build Words as documented."
  );

  console.log(
    "CHRON / POS / VAL / AUD skip Build Words and continue to Use It."
  );

  console.log(
    "Applicable targets such as un- remain routed to Build Words."
  );
}
