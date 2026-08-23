"use strict";

const assert = require("assert");
const api = require("./family-printable-readiness.js");

console.log("=== Family printable readiness audit V1.3 ===");

assert.strictEqual(api.REGISTRY.length, 7);
assert.strictEqual(new Set(api.REGISTRY.map(x => x.id)).size, 7);

const names = api.REGISTRY.map(x => x.href.split("/").pop());

[
  "COOK-flight-A-color.pdf",
  "COOK-roll-and-build.pdf",
  "VIEW-flight-A-color.pdf",
  "PORT-flight-B-color.pdf",
  "PORT-roll-and-build.pdf",
  "STRUCT-flight-B-color.pdf",
  "TRACT-flight-B-color.pdf"
].forEach(name => {
  assert(names.includes(name), `Missing ${name}`);
});

function studentWithFamily(
  family,
  activity,
  completedAt = "2026-08-22T12:00:00.000Z"
) {
  return {
    id: "s1",
    sessions: [{
      id: "session-1",
      activity,
      completedAt,
      responses: [{
        id: "r1",
        skill: activity,
        familyId: family,
        correct: false,
        independentCorrect: false
      }]
    }]
  };
}

function studentWithTarget(
  targetId,
  activity,
  completedAt = "2026-08-22T12:00:00.000Z"
) {
  return {
    id: "s1",
    sessions: [{
      id: "session-1",
      activity,
      completedAt,
      responses: [{
        id: "r1",
        skill: activity,
        primaryTargetId: targetId,
        correct: false,
        independentCorrect: false
      }]
    }]
  };
}

assert.deepStrictEqual(
  [...api.deriveEligibleResourceIds(studentWithFamily("STRUCT","morpheme"))],
  []
);

assert.deepStrictEqual(
  [...api.deriveEligibleResourceIds(studentWithFamily("STRUCT","break"))],
  ["struct-family"]
);

assert.deepStrictEqual(
  [...api.deriveEligibleResourceIds(studentWithFamily("PORT","break"))],
  ["port-family"]
);

const port = studentWithFamily("PORT","build");

assert.deepStrictEqual(
  [...api.deriveEligibleResourceIds(port)].sort(),
  ["port-family","port-roll-build"].sort()
);

assert.deepStrictEqual(
  [...api.deriveEligibleResourceIds(studentWithFamily("COOK","build"))],
  [],
  "COOK familyId must not trigger readiness."
);

assert.deepStrictEqual(
  [...api.deriveEligibleResourceIds(studentWithFamily("VIEW","build"))],
  [],
  "VIEW familyId must not trigger readiness."
);

assert.deepStrictEqual(
  [...api.deriveEligibleResourceIds(studentWithTarget("re","break"))].sort(),
  ["cook-family","view-family"].sort()
);

assert.deepStrictEqual(
  [...api.deriveEligibleResourceIds(studentWithTarget("re","build"))].sort(),
  ["cook-family","cook-roll-build","view-family"].sort()
);

const reBuildEvidence =
  api.deriveEligibilityEvidence(
    studentWithTarget(
      "re",
      "build"
    )
  );

assert.deepStrictEqual(
  reBuildEvidence
    .get("cook-family")
    .targetLabels,
  ["re-"],
  "COOK packet should explain the qualifying affix."
);

assert.deepStrictEqual(
  reBuildEvidence
    .get("cook-roll-build")
    .targetLabels,
  ["re-"],
  "COOK Roll & Build should explain the build-ready affix."
);

const multiAffixStudent = {
  id: "multi",
  sessions: [
    {
      id: "m1",
      activity: "infer",
      completedAt: "2026-08-22T10:00:00.000Z",
      responses: [{
        id: "mr1",
        skill: "infer",
        primaryTargetId: "re"
      }]
    },
    {
      id: "m2",
      activity: "use",
      completedAt: "2026-08-22T11:00:00.000Z",
      responses: [{
        id: "mr2",
        skill: "use",
        primaryTargetId: "ed"
      }]
    },
    {
      id: "m3",
      activity: "change",
      completedAt: "2026-08-22T12:00:00.000Z",
      responses: [{
        id: "mr3",
        skill: "change",
        primaryTargetId: "s-es"
      }]
    }
  ]
};

api.refreshStudent(
  multiAffixStudent,
  "2026-08-22T13:00:00.000Z"
);

assert.deepStrictEqual(
  multiAffixStudent
    .familyPrintableReadiness[
      "view-family"
    ]
    .readyEvidenceTargetLabels,
  ["re-","-ed","-s/-es"],
  "VIEW should preserve all qualifying affix evidence in encounter order."
);


assert.deepStrictEqual(
  [...api.deriveEligibleResourceIds(studentWithTarget("over","break"))],
  ["cook-family"]
);

assert.deepStrictEqual(
  [...api.deriveEligibleResourceIds(studentWithTarget("able-ible","break"))],
  ["view-family"]
);

assert.deepStrictEqual(
  [...api.deriveEligibleResourceIds(studentWithTarget("-able","break"))],
  ["view-family"]
);

api.refreshStudent(port, "2026-08-22T13:00:00.000Z");

assert.strictEqual(
  port.familyPrintableReadiness["port-family"].ready,
  true
);

port.sessions.push({
  id: "session-2",
  activity: "learn",
  completedAt: "2026-08-23T12:00:00.000Z",
  responses: [{
    id:"r2",
    skill:"learn",
    primaryTargetId:"un"
  }]
});

api.refreshStudent(port, "2026-08-23T13:00:00.000Z");

assert.strictEqual(
  port.familyPrintableReadiness["port-family"].ready,
  true
);

assert.strictEqual(
  api.setCompleted(
    port,
    "port-family",
    true,
    "2026-08-23T14:00:00.000Z"
  ),
  true
);

assert.strictEqual(
  port.familyPrintableReadiness["port-family"].completed,
  true
);

port.progressClearedAt = "2026-08-24T00:00:00.000Z";

api.refreshStudent(
  port,
  "2026-08-24T01:00:00.000Z"
);

assert.strictEqual(
  Boolean(port.familyPrintableReadiness["port-family"]),
  false
);

assert.strictEqual(
  api.deriveEligibleResourceIds(port).size,
  0,
  "Pre-clear sessions must not re-earn readiness."
);

port.sessions.push({
  id: "session-3",
  activity: "break",
  completedAt: "2026-08-25T12:00:00.000Z",
  responses: [{
    id: "r3",
    skill: "break",
    familyId: "PORT",
    correct: true,
    independentCorrect: true
  }]
});

api.refreshStudent(
  port,
  "2026-08-25T13:00:00.000Z"
);

assert.strictEqual(
  port.familyPrintableReadiness["port-family"].ready,
  true
);

assert.strictEqual(
  Boolean(port.familyPrintableReadiness["port-roll-build"]),
  false
);

const affixAfterClear = {
  id: "s2",
  progressClearedAt: "2026-08-24T00:00:00.000Z",
  sessions: [
    {
      id: "old",
      activity: "build",
      completedAt: "2026-08-23T12:00:00.000Z",
      responses: [{
        id: "old-r",
        skill: "build",
        primaryTargetId: "re"
      }]
    },
    {
      id: "new",
      activity: "break",
      completedAt: "2026-08-25T12:00:00.000Z",
      responses: [{
        id: "new-r",
        skill: "break",
        primaryTargetId: "re"
      }]
    }
  ]
};

assert.deepStrictEqual(
  [...api.deriveEligibleResourceIds(affixAfterClear)].sort(),
  ["cook-family","view-family"].sort()
);

const undatedAfterClear = {
  id: "s3",
  progressClearedAt: "2026-08-24T00:00:00.000Z",
  sessions: [{
    id: "undated",
    activity: "build",
    responses: [{
      id: "undated-r",
      skill: "build",
      primaryTargetId: "re"
    }]
  }]
};

assert.strictEqual(
  api.deriveEligibleResourceIds(undatedAfterClear).size,
  0
);

assert.strictEqual(
  api.deriveEligibleResourceIds(studentWithFamily("UNKNOWN","change")).size,
  0
);

console.log("Verified static resources: 7");
console.log("COOK / VIEW familyId trigger blocked: true");
console.log("COOK / VIEW readiness comes only from matching affixes: true");
console.log("Shared re- can unlock both COOK and VIEW packets: true");
console.log("COOK Roll & Build waits for matching-affix Build Words: true");
console.log("Ready cards expose the qualifying affix evidence: true");
console.log("PORT / STRUCT / TRACT remain root-family based: true");
console.log("Ready persists across later sessions: true");
console.log("Completed remains separate from Ready: true");
console.log("Pre-clear evidence ignored after Clear Progress: true");
console.log("Post-clear eligible work may earn Ready again: true");
console.log("Undated evidence cannot resurrect Ready after clear: true");
console.log("Readiness is progression-based, not accuracy/mastery-based: true");
console.log("Invented resources blocked: true");
console.log("Hard failures: 0");
