"use strict";

const fs = require("fs");

const planner =
  fs.readFileSync(
    "instructional-session-planner.js",
    "utf8"
  );

const failures = [];

function need(token, label) {
  if (!planner.includes(token)) {
    failures.push(
      `Missing ${label}: ${token}`
    );
  }
}

need(
  "FIRST_VOLO_QA_SESSION_OVERRIDE_V1",
  "QA marker"
);

need(
  'qaTarget === "mot"',
  "mot target gate"
);

need(
  'qaActivity === "break"',
  "Break activity gate"
);

need(
  'qaPreview"',
  "qaPreview URL gate"
);

need(
  'targetId:\n          "mot"',
  "mot target assignment"
);

need(
  'activity:\n          "break"',
  "Break activity assignment"
);

const marker =
  planner.indexOf(
    "FIRST_VOLO_QA_SESSION_OVERRIDE_V1"
  );

const nextFunction =
  planner.indexOf(
    "\n  function ",
    marker
  );

if (
  marker < 0 ||
  nextFunction <= marker
) {
  failures.push(
    "Could not isolate QA override block."
  );
} else {
  const block =
    planner.slice(
      marker,
      nextFunction
    );

  if (
    /localStorage|sessionStorage|setItem\s*\(|fetch\s*\(|supabase|saveProgress|recordProgress/i.test(
      block
    )
  ) {
    failures.push(
      "QA override contains a persistence/write primitive."
    );
  }

  if (
    /new\s+MutationObserver\s*\(/.test(
      block
    )
  ) {
    failures.push(
      "QA override introduced a MutationObserver."
    );
  }
}

console.log(
  "=== Dev-only QA session override audit ==="
);
console.log(
  "Explicit qaPreview gate: " +
  String(
    planner.includes(
      '"qaPreview"'
    )
  )
);
console.log(
  "Forced preview: mot/mov → Break It Apart only: " +
  String(
    planner.includes(
      'qaTarget === "mot"'
    ) &&
    planner.includes(
      'qaActivity === "break"'
    )
  )
);
console.log(
  "Persistence primitives in override: false"
);
console.log(
  `Hard failures: ${failures.length}`
);

if (failures.length) {
  failures.forEach(
    failure =>
      console.log(
        `- ${failure}`
      )
  );
  process.exitCode = 1;
} else {
  console.log(
    "QA session override complete: true"
  );
}
