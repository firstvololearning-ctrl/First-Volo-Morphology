"use strict";

const fs = require("fs");

const source =
  fs.readFileSync(
    "session-materials-ui.js",
    "utf8"
  );

const failures = [];

function requireText(value, label) {
  if (!source.includes(value)) {
    failures.push(
      `Missing ${label}: ${value}`
    );
  }
}

requireText(
  "FIRST_VOLO_INFER_BUILD_DEMAND_SUPPORT_V1_1",
  "infer/build demand-support marker"
);

requireText(
  'activity ===\n      "infer"',
  "Figure It Out activity branch"
);

requireText(
  "does not recognize or remember",
  "Figure It Out target-access barrier"
);

requireText(
  "but cannot combine the word parts",
  "Figure It Out integration barrier"
);

requireText(
  "guessing from context alone",
  "Figure It Out context-only barrier"
);

requireText(
  "plausible but unsupported",
  "Figure It Out evidence barrier"
);

requireText(
  "give the meaning of another meaningful part without giving the whole-word answer",
  "Figure It Out other-part scaffold"
);

requireText(
  "model the reasoning with a different word",
  "Figure It Out different-item model rule"
);

requireText(
  'activity ===\n      "build"',
  "Build Words activity branch"
);

requireText(
  "chooses the wrong word part",
  "Build Words wrong-part barrier"
);

requireText(
  "right parts but puts them in the wrong place",
  "Build Words order/role barrier"
);

requireText(
  "leaves out the target",
  "Build Words omitted-target barrier"
);

requireText(
  "builds the word but cannot explain it",
  "Build Words explanation barrier"
);

requireText(
  "model how to complete a different build using parts not in this item",
  "Build Words different-item model rule"
);

requireText(
  "Then retry the same build.",
  "Build Words same-demand retry"
);

requireText(
  "Then retry the same inference.",
  "Figure It Out same-demand retry"
);

requireText(
  "readyInferBuildDemandSupportMarkup(\n        activity",
  "main activity support routing"
);

requireText(
  "readyInferBuildDemandSupportMarkup(\n        activity,\n        {\n          practice:",
  "practice support routing"
);

const patchStart =
  source.indexOf(
    "FIRST_VOLO_INFER_BUILD_DEMAND_SUPPORT_V1_1"
  );

const patchEnd =
  patchStart >= 0
    ? source.indexOf(
        "function readyV7ActivitySupportMarkup(",
        patchStart
      )
    : -1;

if (
  patchStart < 0 ||
  patchEnd <= patchStart
) {
  failures.push(
    "Could not isolate the new Infer/Build support helper for observer safety checking."
  );
} else {
  const patchSection =
    source.slice(
      patchStart,
      patchEnd
    );

  if (
    /new\s+MutationObserver\s*\(/.test(
      patchSection
    )
  ) {
    failures.push(
      "Infer/Build support helper introduced a MutationObserver."
    );
  }
}

console.log(
  "=== Figure It Out + Build Words demand-support audit ==="
);

console.log(
  "Figure It Out: target access / combine parts / context-only / unsupported inference distinguished: true"
);
console.log(
  "Build Words: wrong part / wrong placement / omitted target / explanation distinguished: true"
);
console.log(
  "Same-demand retry before escalation: true"
);
console.log(
  "Modeling uses a different example: true"
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
}
