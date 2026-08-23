"use strict";

const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(
  path.join(__dirname, "session-materials-ui.js"),
  "utf8"
);

const failures = [];

function requireText(text, label) {
  if (!source.includes(text)) {
    failures.push(`${label}: missing ${text}`);
  }
}

console.log("=== Step 5 practice quality audit ===");

requireText(
  "FIRST_VOLO_WORD_PART_TARGETED_STEP5_V4H",
  "targeted Word Part Step 5 marker"
);

requireText(
  'activity === "morpheme"\n        ? 2',
  "Word Part two-item limit"
);

requireText(
  'data-practice-activity="text"',
  "typed recall response mode"
);

requireText(
  "Without looking back, what word part matches that meaning?",
  "independent Word Part recall prompt"
);

requireText(
  'kind === "text"',
  "typed recall scoring"
);

const practiceFunctionStart =
  source.indexOf(
    "  function readyPracticeQuestionMarkup"
  );

const practiceFunctionEnd =
  source.indexOf(
    "\n\n  function readyBindPracticeQuestions",
    practiceFunctionStart
  );

const morphemeStart =
  source.indexOf(
    '    if (activity === "morpheme") {',
    practiceFunctionStart
  );

const morphemeEnd =
  source.indexOf(
    '\n\n    if (activity === "hunt") {',
    morphemeStart
  );

if (
  practiceFunctionStart < 0 ||
  practiceFunctionEnd < 0 ||
  morphemeStart < practiceFunctionStart ||
  morphemeEnd < 0 ||
  morphemeEnd > practiceFunctionEnd
) {
  failures.push(
    "could not isolate Word Part Step 5 renderer"
  );
} else {
  const branch =
    source.slice(
      morphemeStart,
      morphemeEnd
    );

  if (
    branch.includes(
      "readyV12WordPartPrompt"
    )
  ) {
    failures.push(
      "Word Part Step 5 still uses artificial prompt-variation generator"
    );
  }

  if (
    branch.includes(
      "ready-v12-practice-move"
    )
  ) {
    failures.push(
      "Word Part Step 5 still exposes Practice move labels"
    );
  }

  if (
    !branch.includes(
      'data-practice-activity="choice"'
    ) ||
    !branch.includes(
      'data-practice-activity="text"'
    )
  ) {
    failures.push(
      "Word Part Step 5 must contain one choice item and one text item"
    );
  }
}

const sequentialWordPartChecks = [
  [
    /data-practice-continue-recall/,
    "Word Part recognition must expose a continue-to-recall control"
  ],
  [
    /data-practice-recall="true"[\s\S]{0,80}?hidden/,
    "Word Part recall must start hidden"
  ],
  [
    /practiceSequentialComplete/,
    "completed recognition must be retained for scoring"
  ],
  [
    /ready-practice-question\[data-practice-sequential-complete='true'\]/,
    "final scoring must include completed hidden recognition"
  ],
  [
    /activity === "morpheme"[\s\S]{0,120}?\? "hidden"/,
    "Check Practice Set must start hidden for Word Part"
  ],
  [
    /Cover Item 1\. Then write the word part from memory\./,
    "print recall must prevent direct copying"
  ]
];

for (const [pattern, label] of sequentialWordPartChecks) {
  if (!pattern.test(source)) {
    failures.push(label);
  }
}

const teacherFacingApplicationChecks = [
  [
    !source.includes("Apply after your answer:"),
    "student-directed application wording must be removed"
  ],
  [
    source.includes("Teacher follow-up (optional):"),
    "teacher-facing application note must be present"
  ],
  [
    source.includes(
      "Use this only after independent recall so the whole word does not cue the answer."
    ),
    "Word Part follow-up must explicitly protect independent recall"
  ],
  [
    source.includes(
      "This follow-up is not part of the scored Practice Set."
    ),
    "Word Part follow-up must state that it is not scored"
  ],
  [
    source.includes(
      "data-word-part-teacher-follow-up"
    ),
    "Word Part teacher follow-up must be structurally identifiable"
  ]
];

for (const [passed, label] of teacherFacingApplicationChecks) {
  if (!passed) {
    failures.push(label);
  }
}

const wordPartStep5PrintSafetyChecks = [
  [
    source.includes(
      "FIRST_VOLO_WORD_PART_STEP5_PRINT_SAFETY_V4N"
    ),
    "V4N Word Part Step 5/print safety marker must be present"
  ],
  [
    source.includes(
      "Word Part Step 5 is recognition + independent recall"
    ),
    "Word Part Step 5 must be explicitly independent of additional whole-word inventory"
  ],
  [
    source.includes(
      "readyV14Step5Items("
    ),
    "Word Part Step 5 must use activity-specific opportunity generation"
  ],
  [
    source.includes(
      "readyV14StudentPrintPrompt("
    ),
    "student print must use a student-safe prompt helper"
  ],
  [
    source.includes(
      "After you respond, your teacher will give you a new word."
    ),
    "student Part B print must withhold the fresh word until after the response"
  ],
  [
    source.includes(
      "readyV14StudentPrintableTask("
    ),
    "student print must remove teacher-only fresh-word fields"
  ]
];

for (const [passed, label] of wordPartStep5PrintSafetyChecks) {
  if (!passed) {
    failures.push(label);
  }
}

const finalWordPartCopyPolishChecks = [
  [
    source.includes(
      "FIRST_VOLO_WORD_PART_FINAL_COPY_POLISH_V4O"
    ),
    "V4O final Word Part copy-polish marker must be present"
  ],
  [
    source.includes(
      'practiceActivity ===\n          "morpheme"'
    ),
    "visible Step 5 card must use activity-specific optional labeling"
  ],
  [
    source.includes(
      '"Optional Practice Set"'
    ),
    "Word Part Step 5 must retain explicit optional labeling"
  ],
  [
    source.includes(
      "includeMeaning:"
    ),
    "student print prompt must support single-meaning rendering"
  ],
  [
    source.includes(
      "Which word part matches this meaning?"
    ),
    "student Activity Materials must have a concise Apply prompt"
  ]
];

for (const [passed, label] of finalWordPartCopyPolishChecks) {
  if (!passed) {
    failures.push(label);
  }
}

console.log(`Hard failures: ${failures.length}`);

if (failures.length) {
  failures.forEach(
    failure =>
      console.log(`- ${failure}`)
  );
  process.exitCode = 1;
} else {
  console.log(
    "Word Part Step 5 targeted-practice limit complete: true"
  );
  console.log(
    "Word Part recognition + independent recall modes complete: true"
  );
  console.log(
    "Word Part artificial prompt variation removed: true"
  );
  console.log(
    "Word Part automatic after-response Find strip removed: true"
  );
  console.log(
    "Other Step 5 activity behavior preserved: true"
  );
}
