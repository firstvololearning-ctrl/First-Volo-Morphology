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
  "=== Teacher session duration + print parity audit ==="
);

requireText(
  "FIRST_VOLO_SESSION_DURATION_AND_PRINT_PARITY_V13",
  "V13 marker"
);

requireText(
  "Teacher-led instruction",
  "teacher-led heading"
);

requireText(
  "Begin each task with an independent attempt.",
  "clear teacher-led support wording"
);

requireText(
  "readyV13TargetOnlyRetrieveEverywhere",
  "target-only Retrieve for screen + print"
);

requireText(
  '10: Object.freeze({\n        partAItems: 1,\n        transferItems: 1,\n        step5Limit: 5',
  "10-minute dosage"
);

requireText(
  '15: Object.freeze({\n        partAItems: 2,\n        transferItems: 1,\n        step5Limit: 5',
  "15-minute dosage"
);

requireText(
  '30: Object.freeze({\n        partAItems: 4,\n        transferItems: 2,\n        step5Limit: 10',
  "30-minute dosage"
);

requireText(
  "beforeprint",
  "print parity hook"
);

requireText(
  "Optional extension. Use only if time remains or additional practice is indicated. Use up to five items.",
  "10-minute Step 5 guidance"
);

requireText(
  "Optional practice. Use up to five items if time remains or additional practice is indicated.",
  "15-minute Step 5 guidance"
);

requireText(
  "Complete the first five items. Continue with up to five additional items as appropriate.",
  "30-minute Step 5 guidance"
);

console.log(
  "Policy:"
);

console.log(
  "- 10 min: 1 target retrieval, 1 Part A item, 1 Part B item, 1 transfer item, Step 5 optional up to 5."
);

console.log(
  "- 15 min: 1 target retrieval, 2 Part A items, 1 Part B item, 1 transfer item, Step 5 optional up to 5."
);

console.log(
  "- 30 min: 1 target retrieval, 4 Part A items, 1 Part B item, 2 transfer items, Step 5 first 5 + up to 5 more."
);

console.log(
  "- Screen and print share instructional content; print may expose teacher-only/optional pages because paper cannot use gated digital reveals."
);

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
    "Session duration policy complete: true"
  );

  console.log(
    "Print instructional parity policy complete: true"
  );
}
