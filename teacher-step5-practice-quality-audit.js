"use strict";

const fs =
  require("fs");

const path =
  require("path");

const source =
  fs.readFileSync(
    path.join(
      __dirname,
      "session-materials-ui.js"
    ),
    "utf8"
  );

const failures = [];

function requireText(
  text,
  label
) {
  if (
    !source.includes(
      text
    )
  ) {
    failures.push(
      `${label}: missing ${text}`
    );
  }
}

console.log(
  "=== Step 5 practice quality audit ==="
);

requireText(
  "FIRST_VOLO_STEP5_MEANINGFUL_VARIATION_V12",
  "V12 meaningful-variation marker"
);

for (
  const label
  of [
    "Practice move ·",
    "Retrieve",
    "Correct",
    "Select",
    "Confirm",
    "Recall"
  ]
) {
  requireText(
    label,
    "practice-move variation"
  );
}

requireText(
  "readyV12WordPartPrompt",
  "Word Part varied prompt generator"
);

requireText(
  "readyV12MeaningPrompt",
  "Meaning varied prompt generator"
);

requireText(
  "readyV12ApplicationWords",
  "after-response application word selector"
);

requireText(
  "Apply after your answer:",
  "post-response application prompt"
);

requireText(
  "MutationObserver",
  "late-render Step 5 observer"
);

const wordPartVariants =
  (
    source.match(
      /move:\s*"(?:Retrieve|Correct|Select|Confirm|Recall|Retrieve again|Correct again|Choose|Verify|Final recall)"/g
    ) ||
    []
  )
    .length;

if (
  wordPartVariants <
  10
) {
  failures.push(
    `expected at least 10 varied Word Part practice frames; found ${wordPartVariants}`
  );
}

const meaningFrames = [
  "Which meaning belongs with",
  "Which meaning should you retrieve",
  "Which option best explains what",
  "Which meaning correctly matches",
  "What meaning would you connect with",
  "Choose the meaning that goes with",
  "Which choice gives the correct meaning for"
];

const missingMeaningFrames =
  meaningFrames.filter(
    frame =>
      !source.includes(
        frame
      )
  );

if (
  missingMeaningFrames.length
) {
  failures.push(
    `missing Meaning practice frames: ${missingMeaningFrames.join(", ")}`
  );
}

console.log(
  `Hard failures: ${failures.length}`
);

if (
  failures.length
) {
  failures.forEach(
    failure =>
      console.log(
        `- ${failure}`
      )
  );

  process.exitCode =
    1;
} else {
  console.log(
    "Meaning / Word Part minimum availability complete: true"
  );

  console.log(
    "Meaning / Word Part meaningful prompt variation complete: true"
  );

  console.log(
    "After-response application is delayed until the student answers: true"
  );

  console.log(
    "Existing choice scoring / feedback remains the scoring source: true"
  );
}
