"use strict";

global.window = global;

require("./word-inventory.js");
require("./instructional-protection-registry.js");
require("./instructional-check-transfer.js");

const api =
  global.FirstVoloCheckTransfer;

const inventory =
  Array.isArray(
    global.FIRST_VOLO_MORPHEME_INVENTORY
  )
    ? global.FIRST_VOLO_MORPHEME_INVENTORY
    : [];

if (
  !api ||
  !Array.isArray(api.items) ||
  !Array.isArray(api.coreTargetIds)
) {
  console.error(
    "FirstVoloCheckTransfer API is unavailable."
  );
  process.exit(1);
}

const BANDS = [
  "2-3",
  "4-5",
  "6-8"
];

const byId =
  new Map(
    inventory.map(
      target => [
        String(
          target?.id ||
          ""
        )
          .trim()
          .toLowerCase(),
        target
      ]
    )
  );

function normalize(value) {
  return String(
    value || ""
  )
    .trim()
    .toLowerCase();
}

function applicableBandsFromIntro(
  introBand
) {
  const index =
    BANDS.indexOf(
      introBand
    );

  if (index < 0) {
    return [];
  }

  return BANDS.slice(
    index
  );
}

function itemsForTarget(
  targetId
) {
  const wanted =
    normalize(
      targetId
    );

  return api.items.filter(
    item =>
      Array.isArray(
        item?.targetIds
      ) &&
      item.targetIds.some(
        id =>
          normalize(id) ===
          wanted
      )
  );
}

const hard = [];
const warnings = [];
const custom = [];

let auditedPairs = 0;
let fullThirtyMinutePairs = 0;

for (
  const targetId
  of api.coreTargetIds
) {
  const meta =
    byId.get(
      normalize(
        targetId
      )
    ) ||
    null;

  const targetItems =
    itemsForTarget(
      targetId
    );

  if (!meta) {
    /*
      COOK / VIEW are current teacher-material family targets rather than
      morpheme-inventory entries. We still require their declared transfer
      bands to have two items, but do not invent an introBand for them.
    */
    const declaredBands =
      [
        ...new Set(
          targetItems.flatMap(
            item =>
              Array.isArray(
                item?.gradeBands
              )
                ? item.gradeBands
                : []
          )
        )
      ]
        .filter(
          band =>
            BANDS.includes(
              band
            )
        )
        .sort(
          (a, b) =>
            BANDS.indexOf(a) -
            BANDS.indexOf(b)
        );

    if (!targetItems.length) {
      hard.push(
        `${targetId}: no Check Transfer items configured`
      );
      continue;
    }

    if (!declaredBands.length) {
      hard.push(
        `${targetId}: custom family target has no declared grade band`
      );
      continue;
    }

    custom.push(
      `${targetId}: custom family target; auditing declared bands ${declaredBands.join(", ")}`
    );

    for (
      const band
      of declaredBands
    ) {
      auditedPairs += 1;

      const count =
        targetItems.filter(
          item =>
            Array.isArray(
              item?.gradeBands
            ) &&
            item.gradeBands.includes(
              band
            )
        ).length;

      if (count < 1) {
        hard.push(
          `${targetId} · ${band}: no transfer item`
        );
      } else if (count < 2) {
        warnings.push(
          `${targetId} · ${band}: ${count} item; 10/15-minute sessions work, but a 30-minute session requests 2`
        );
      } else {
        fullThirtyMinutePairs += 1;
      }
    }

    continue;
  }

  const introBand =
    meta.introBand ||
    meta.morphemeIntroBand ||
    null;

  const applicable =
    applicableBandsFromIntro(
      introBand
    );

  if (!applicable.length) {
    hard.push(
      `${targetId}: instructional introBand is missing or invalid (${introBand || "none"})`
    );
    continue;
  }

  for (
    const band
    of applicable
  ) {
    auditedPairs += 1;

    const count =
      targetItems.filter(
        item =>
          Array.isArray(
            item?.gradeBands
          ) &&
          item.gradeBands.includes(
            band
          )
      ).length;

    if (count < 1) {
      hard.push(
        `${targetId} · ${band}: no transfer item, although target introBand is ${introBand}`
      );
    } else if (count < 2) {
      warnings.push(
        `${targetId} · ${band}: ${count} item; 10/15-minute sessions work, but a 30-minute session requests 2`
      );
    } else {
      fullThirtyMinutePairs += 1;
    }
  }
}

console.log(
  "Check Transfer core targets:",
  api.coreTargetIds.length
);

console.log(
  "Target × applicable-grade pairs audited:",
  auditedPairs
);

console.log(
  "Pairs ready for a 30-minute 2-item transfer check:",
  fullThirtyMinutePairs
);

console.log(
  "Missing target × grade pairs:",
  hard.length
);

console.log(
  "One-item-only target × grade pairs:",
  warnings.length
);

if (custom.length) {
  console.log(
    "\nCustom family targets:"
  );

  for (
    const item
    of custom
  ) {
    console.log(
      `- ${item}`
    );
  }
}

if (hard.length) {
  console.log(
    "\nMISSING TARGET × GRADE COVERAGE:"
  );

  for (
    const item
    of hard
  ) {
    console.log(
      `- ${item}`
    );
  }
}

if (warnings.length) {
  console.log(
    "\n30-MINUTE READINESS GAPS:"
  );

  for (
    const item
    of warnings
  ) {
    console.log(
      `- ${item}`
    );
  }
}

if (
  hard.length ||
  warnings.length
) {
  process.exitCode =
    2;
} else {
  console.log(
    "\nCheck Transfer target × grade-band coverage complete: true"
  );
}
