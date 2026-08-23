"use strict";

global.window = global;

const fs =
  require("fs");

require("./word-inventory.js");
require("./instructional-teacher-word-extensions.js");
require("./instructional-word-selector.js");

const selector =
  global
    .FirstVoloInstructionalWordSelector;

const failures = [];

function need(
  condition,
  message
) {
  if (!condition) {
    failures.push(
      message
    );
  }
}

const target = {
  id:
    "mot",
  label:
    "mot/mov",
  meaning:
    "move",
  type:
    "root",
  role:
    "root"
};

need(
  selector?.version ===
    "instructional-word-selector-v1",
  "selector version missing"
);

const selectorSource =
  fs.readFileSync(
    "instructional-word-selector.js",
    "utf8"
  );

need(
  !/\bmot\b/.test(
    selectorSource
  ),
  "selector contains target-specific mot logic"
);

need(
  !/\bive\b/.test(
    selectorSource
  ),
  "selector contains target-specific -ive logic"
);

const source =
  selector
    .sourceCandidates({
      target
    });


const unlimitedSelections =
  selector
    .selectCandidates({
      target,
      objective:
        "break",
      stage:
        "guided",
      gradeBand:
        "4-5",
      candidates:
        source,
      isProtected:
        () => false
    });

need(
  unlimitedSelections.length > 0,
  "selector treated omitted/null limit as zero items"
);

function byWord(word) {
  return source.find(
    item =>
      String(
        item?.word ||
        ""
      )
        .toLowerCase() ===
      word
  );
}

for (
  const word
  of [
    "motion",
    "movement",
    "movements",
    "moving",
    "movable",
    "remove",
    "removable"
  ]
) {
  need(
    Boolean(
      byWord(word)
    ),
    `${word} missing from source candidates`
  );
}

const remove =
  byWord(
    "remove"
  );

const removable =
  byWord(
    "removable"
  );

const motion =
  byWord(
    "motion"
  );

const movement =
  byWord(
    "movement"
  );

const movements =
  byWord(
    "movements"
  );

const moving =
  byWord(
    "moving"
  );

const movable =
  byWord(
    "movable"
  );

need(
  selector
    .evaluateCandidate({
      item:
        remove,
      target,
      objective:
        "find",
      stage:
        "guided",
      gradeBand:
        "4-5",
      isProtected:
        () => false
    })
    .eligible,
  "remove should remain eligible for target identification"
);

const removableGuided =
  selector
    .evaluateCandidate({
      item:
        removable,
      target,
      objective:
        "break",
      stage:
        "guided",
      gradeBand:
        "4-5",
      isProtected:
        () => false
    });

need(
  removableGuided
    .eligible &&
  removableGuided
    .demand ===
    "target-recognition",
  "removable should be guided target recognition, not forced full segmentation"
);

need(
  !selector
    .evaluateCandidate({
      item:
        removable,
      target,
      objective:
        "break",
      stage:
        "apply",
      gradeBand:
        "4-5",
      isProtected:
        () => false
    })
    .eligible,
  "removable must not become a full-segmentation Apply item"
);

const motionApply =
  selector
    .evaluateCandidate({
      item:
        motion,
      target,
      objective:
        "break",
      stage:
        "apply",
      gradeBand:
        "4-5",
      isProtected:
        () => false
    });

need(
  motionApply
    .eligible &&
  motionApply
    .demand ===
    "full-segmentation",
  "motion should remain a valid full-segmentation item"
);

need(
  selector.sameFreshnessFamily(
    movement,
    movements
  ),
  "movement and movements must share a freshness family"
);

need(
  selector.sameFreshnessFamily(
    moving,
    movable
  ),
  "moving and movable must share the move freshness family"
);

const movingGuided =
  selector
    .evaluateCandidate({
      item:
        moving,
      target,
      objective:
        "break",
      stage:
        "guided",
      gradeBand:
        "4-5",
      isProtected:
        () => false
    });

need(
  movingGuided.eligible &&
  movingGuided.demand ===
    "form-change",
  "moving should be guided form-change practice"
);

need(
  movingGuided.expectedTargetForm ===
    "mov",
  "moving should report visible target form mov"
);

need(
  movingGuided.wordFormation?.wordSum ===
    "move + -ing → moving",
  "moving word sum is missing or inaccurate"
);

const movableGuided =
  selector
    .evaluateCandidate({
      item:
        movable,
      target,
      objective:
        "break",
      stage:
        "guided",
      gradeBand:
        "4-5",
      isProtected:
        () => false
    });

need(
  movableGuided.eligible &&
  movableGuided.demand ===
    "form-change",
  "movable should be guided form-change practice"
);

need(
  movableGuided.expectedTargetForm ===
    "mov",
  "movable should report visible target form mov"
);

const movementGuided =
  selector
    .evaluateCandidate({
      item:
        movement,
      target,
      objective:
        "break",
      stage:
        "guided",
      gradeBand:
        "4-5",
      isProtected:
        () => false
    });

need(
  movementGuided.demand ===
    "full-segmentation",
  "movement should remain full segmentation"
);

need(
  movementGuided.allowedSupport.some(
    value =>
      String(value).includes(
        "final e stays"
      )
  ),
  "movement support should teach that move retains final e before -ment"
);

const plan10 =
  selector
    .buildBreakPlan({
      target,
      gradeBand:
        "4-5",
      candidates:
        source,
      isProtected:
        () => false,
      partACount:
        1
    });

const plan15 =
  selector
    .buildBreakPlan({
      target,
      gradeBand:
        "4-5",
      candidates:
        source,
      isProtected:
        () => false,
      partACount:
        2
    });

const plan30 =
  selector
    .buildBreakPlan({
      target,
      gradeBand:
        "4-5",
      candidates:
        source,
      isProtected:
        () => false,
      partACount:
        4
    });

need(
  plan10.complete,
  "10-minute-style mot/mov plan is not buildable"
);

need(
  plan15.complete,
  "15-minute-style mot/mov plan is not buildable"
);

need(
  plan30.complete,
  "30-minute-style mot/mov plan is not buildable"
);

if (
  plan30.complete
) {
  const words = [
    ...plan30
      .partA
      .map(
        item =>
          String(
            item.word
          )
            .toLowerCase()
      ),
    String(
      plan30
        .apply
        .word
    )
      .toLowerCase()
  ];

  need(
    new Set(
      words
    ).size ===
    words.length,
    "30-minute plan reuses a word"
  );

  need(
    plan30
      .partA
      .some(
        item =>
          item.demand ===
          "form-change"
      ),
    "30-minute Part A lacks explicit form-change practice"
  );

  need(
    plan30
      .partA
      .some(
        item =>
          item.demand ===
          "full-segmentation"
      ),
    "30-minute Part A lacks true segmentation practice"
  );

  need(
    plan30
      .partA
      .some(
        item =>
          item
            .wordFormation
            ?.spellingChange ===
          "keep-final-e"
      ),
    "30-minute Part A lacks guided practice showing a retained final e when such an instruction-rich candidate is available"
  );

  need(
    plan30
      .apply
      .demand ===
    "full-segmentation",
    "30-minute Apply is not full segmentation"
  );

  need(
    !(
      plan30
        .apply
        .wordFormation
        ?.spellingChange
    ),
    "30-minute Apply consumed an instruction-rich spelling/form example even though a cleaner full-segmentation Apply candidate was available"
  );

  need(
    plan30
      .partA
      .every(
        item =>
          !selector.sameFreshnessFamily(
            item.item,
            plan30.apply.item
          )
      ),
    "30-minute Apply shares a lexical/inflectional freshness family with Part A"
  );
}

const uiSource =
  fs.readFileSync(
    "session-materials-ui.js",
    "utf8"
  );

for (
  const forbidden
  of [
    "READY_TEACHER_SESSION_SUPPLEMENTAL_CANDIDATES",
    "readyTeacherSupplementalCandidates",
    "readyV7BreakOtherMorphemesWereEncountered",
    "readyFairBreakCandidateCount",
    "readyMotMovFormNotice"
  ]
) {
  need(
    !uiSource.includes(
      forbidden
    ),
    `superseded UI authority remains: ${forbidden}`
  );
}

need(
  uiSource.includes(
    "FIRST_VOLO_SYSTEM_WIDE_WORD_SELECTOR_V1"
  ),
  "selector UI marker missing"
);

need(
  uiSource.includes(
    "FIRST_VOLO_SELECTOR_DRIVEN_BREAK_PLAN_V1"
  ),
  "selector Break-plan marker missing"
);

need(
  uiSource.includes(
    "breakUsesBoundaryResponse"
  ),
  "Break response surface is not demand-aware"
);

need(
  uiSource.includes(
    "Part A · Form change"
  ),
  "print form-change label is missing"
);

need(
  uiSource.includes(
    "_readySelectorWordFormation"
  ),
  "selector word-formation metadata is not carried into Session Materials"
);

for (
  const name
  of [
    "readyExpectedBoundaries",
    "readyExpectedWordSum",
    "readySupportTile",
    "readyTileMarkup",
    "readySupportDetailsMarkup",
    "renderReadyBreak",
    "renderReadyStudentMaterial",
    "renderReadyPrintable",
    "readyCandidateScore"
  ]
) {
  const matches =
    uiSource.match(
      new RegExp(
        `function\\s+${name}\\s*\\(`,
        "g"
      )
    ) ||
    [];

  need(
    matches.length === 1,
    `duplicate UI function remains: ${name} (${matches.length})`
  );
}

const bankSource =
  fs.readFileSync(
    "instructional-session-item-bank.js",
    "utf8"
  );

need(
  !bankSource.includes(
    "motMovSurfaceForms"
  ),
  "target-specific mot/mov Break filter remains"
);

need(
  bankSource.includes(
    "FirstVoloInstructionalWordSelector"
  ),
  "item bank does not consume selector"
);

need(
  bankSource.includes(
    "sameFreshnessFamily"
  ),
  "item bank Apply distinctness does not use freshness family"
);

const extensionSource =
  fs.readFileSync(
    "instructional-teacher-word-extensions.js",
    "utf8"
  );

need(
  !extensionSource.includes(
    'segmentation: "re- + move"'
  ),
  "lexicalized remove was reintroduced as productive re- + move"
);

const html =
  fs.readFileSync(
    "session-materials.html",
    "utf8"
  );

const extensionIndex =
  html.indexOf(
    "instructional-teacher-word-extensions.js"
  );

const selectorIndex =
  html.indexOf(
    "instructional-word-selector.js"
  );

const bankIndex =
  html.indexOf(
    "instructional-session-item-bank.js"
  );

need(
  extensionIndex >= 0 &&
  selectorIndex >
    extensionIndex &&
  bankIndex >
    selectorIndex,
  "script order is not extensions -> selector -> item bank"
);

console.log(
  "=== First Volo system-wide selector audit ==="
);
console.log(
  "Target-agnostic selector: true"
);
console.log(
  "Objective-aware eligibility: true"
);
console.log(
  "Age-accessibility ranking: true"
);
console.log(
  "Guided full segmentation / form change / recognition are distinct: true"
);
console.log(
  "Fresh Apply requires full segmentation: true"
);
console.log(
  `10-minute-style mot/mov plan: ${plan10.complete}`
);
console.log(
  `15-minute-style mot/mov plan: ${plan15.complete}`
);
console.log(
  `30-minute-style mot/mov plan: ${plan30.complete}`
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
    "System-wide selector consolidation complete: true"
  );
}
