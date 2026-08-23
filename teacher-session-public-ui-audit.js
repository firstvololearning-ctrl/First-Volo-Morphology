"use strict";

const fs =
  require("fs");

const files = [
  "session-materials-ui.js",
  "session-materials.html",
  "instructional-session-item-bank.js"
];

if (
  fs.existsSync(
    "check-transfer-ui.js"
  )
) {
  files.push(
    "check-transfer-ui.js"
  );
}

const source =
  Object.fromEntries(
    files.map(
      file => [
        file,
        fs.readFileSync(
          file,
          "utf8"
        )
      ]
    )
  );

const failures = [];

function fail(message) {
  failures.push(
    message
  );
}

const ui =
  source[
    "session-materials-ui.js"
  ] || "";

const bank =
  source[
    "instructional-session-item-bank.js"
  ] || "";

const html =
  source[
    "session-materials.html"
  ] || "";

const checkUi =
  source[
    "check-transfer-ui.js"
  ] || "";

const combinedPublicRenderer =
  `${ui}\n${html}\n${checkUi}`;

for (
  const phrase
  of [
    "master inventory metadata",
    "Check Transfer is protected and fail-closed",
    "No protected Check Transfer item",
    "protected or instructional pool",
    "Protected Check Transfer item not yet"
  ]
) {
  if (
    combinedPublicRenderer.includes(
      phrase
    )
  ) {
    fail(
      `Public renderer still contains internal phrase: ${phrase}`
    );
  }
}

if (
  !bank.includes(
    'activity === "break"'
  ) ||
  !bank.includes(
    "entry?.segmentation"
  )
) {
  fail(
    "Break It Apart does not visibly enforce recipe-level segmentation."
  );
}

for (
  const activity
  of [
    "learn",
    "find",
    "hunt",
    "meaning",
    "morpheme",
    "infer",
    "use",
    "change"
  ]
) {
  if (
    !ui.includes(
      `${activity}: Object.freeze({`
    )
  ) {
    fail(
      `${activity}: no concrete response configuration found.`
    );
  }
}

if (
  !ui.includes(
    "renderBreakBoundarySelector"
  )
) {
  fail(
    "Break It Apart boundary interaction is missing."
  );
}

if (
  !ui.includes(
    "configurePrintActivityMaterial"
  ) ||
  !ui.includes(
    "print-response-item"
  )
) {
  fail(
    "Program-wide printable activity response renderer is missing."
  );
}

if (
  !ui.includes(
    "renderTodaySessionOverview"
  )
) {
  fail(
    "Today's Session concrete overview is missing."
  );
}

if (
  !ui.includes(
    "reorderGuidanceAfterAttempt"
  ) ||
  !ui.includes(
    "Support if needed after the independent attempt"
  )
) {
  fail(
    "Support-after-attempt layout is missing."
  );
}

if (
  !ui.includes(
    "Transfer check not available for this target today."
  )
) {
  fail(
    "Teacher-facing Check Transfer unavailable message is missing."
  );
}

console.log(
  "Teacher-session public UI failures:",
  failures.length
);

if (failures.length) {
  for (
    const item
    of failures
  ) {
    console.log(
      `- ${item}`
    );
  }

  process.exitCode =
    2;
} else {
  console.log(
    "Teacher-session public UI complete: true"
  );
}
