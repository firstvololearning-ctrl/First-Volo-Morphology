"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(
  "js/cloud/morphology-cloud.js",
  "utf8"
);

function extractFunction(name) {
  const marker = `  function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${name} must exist in production source`);

  const bodyStart = source.indexOf("{", start);
  let depth = 0;

  for (let index = bodyStart; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(start, index + 1).trim();
  }

  throw new Error(`Could not extract ${name}`);
}

const context = {};
vm.runInNewContext(
  [
    extractFunction("hasStudentEvidence"),
    extractFunction("sameJsonValue"),
    extractFunction("studentStateNeedsSync"),
    "this.sameJsonValue = sameJsonValue;",
    "this.studentStateNeedsSync = studentStateNeedsSync;"
  ].join("\n"),
  context
);

const { sameJsonValue, studentStateNeedsSync } = context;

const STUDENT_CONTEXT = Object.freeze({
  status: "authorized",
  mode: "student",
  userId: "auth-student-1",
  studentId: "student-1",
  studentName: "Student",
  classId: "class-1",
  educatorId: "educator-1"
});

function student(overrides = {}) {
  return {
    id: "student-1",
    name: "Student",
    createdAt: "2026-09-01T00:00:00.000Z",
    sessions: [{ id: "session-1", responses: [{ correct: true }] }],
    paperPractice: [],
    voloTokens: { flightA: { earned: true, earnedAt: "2026-09-01T01:00:00.000Z" } },
    voloGoals: [],
    voloGoalsUpdatedAt: null,
    ...overrides
  };
}

async function bootCloud({ localStudent, cloudStudent }) {
  const calls = [];
  const storageKey = "firstVoloMorphologyProgressV1:student:student-1";
  const storage = new Map([
    [storageKey, JSON.stringify({
      students: localStudent ? [localStudent] : [],
      activeStudentId: "student-1"
    })]
  ]);
  const client = {
    rpc(name, args) {
      calls.push({ name, args });
      return {
        abortSignal() {
          if (name === "get_morphology_student_state") {
            return Promise.resolve({
              data: cloudStudent ? [{
                learner_profile_id: "profile-1",
                data: cloudStudent
              }] : [],
              error: null
            });
          }
          if (name === "save_morphology_student_state") {
            return Promise.resolve({
              data: [{ data: args.p_data, write_applied: true }],
              error: null
            });
          }
          throw new Error(`Unexpected RPC: ${name}`);
        }
      };
    }
  };
  const access = {
    client,
    getContext: () => STUDENT_CONTEXT,
    getUser: () => ({ id: STUDENT_CONTEXT.userId, is_anonymous: true }),
    localProgressKey: () => storageKey,
    subscribe(listener) {
      listener(STUDENT_CONTEXT);
      return () => {};
    }
  };
  const window = {
    FirstVoloMorphologyAccess: access,
    dispatchEvent() {}
  };
  const localStorage = {
    getItem: key => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value)
  };
  const sandbox = {
    AbortController,
    CustomEvent: class CustomEvent {
      constructor(type, options) {
        this.type = type;
        this.detail = options?.detail;
      }
    },
    clearTimeout,
    console,
    document: {
      readyState: "loading",
      addEventListener() {}
    },
    localStorage,
    setTimeout,
    window
  };

  vm.runInNewContext(source, sandbox);
  await new Promise(resolve => setTimeout(resolve, 30));

  return {
    calls,
    queueSync: () => window.FirstVoloMorphologyCloud.queueSync(),
    readStudent: () => JSON.parse(storage.get(storageKey)).students[0],
    writeStudent(nextStudent) {
      storage.set(storageKey, JSON.stringify({
        students: [nextStudent],
        activeStudentId: STUDENT_CONTEXT.studentId
      }));
    },
    waitForSync: () => new Promise(resolve => setTimeout(resolve, 760))
  };
}

test("identical state with the same key order does not sync", () => {
  const local = student();
  assert.equal(studentStateNeedsSync(local, structuredClone(local), true), false);
});

test("identical state with different top-level key order does not sync", () => {
  const local = student();
  const cloud = Object.fromEntries(Object.entries(local).reverse());
  assert.equal(studentStateNeedsSync(local, cloud, true), false);
});

test("identical state with different nested key order does not sync", () => {
  const local = student();
  const cloud = structuredClone(local);
  cloud.voloTokens.flightA = Object.fromEntries(
    Object.entries(cloud.voloTokens.flightA).reverse()
  );
  assert.equal(studentStateNeedsSync(local, cloud, true), false);
});

test("arrays with the same elements in the same order are equal", () => {
  assert.equal(sameJsonValue([1, { a: 2 }], [1, { a: 2 }]), true);
});

test("arrays with changed order are different", () => {
  assert.equal(sameJsonValue([1, 2, 3], [3, 2, 1]), false);
});

test("genuine local evidence absent from cloud still requires sync", () => {
  const cloud = student();
  const local = student({
    sessions: [...cloud.sessions, { id: "offline-session", responses: [] }]
  });
  assert.equal(studentStateNeedsSync(local, cloud, true), true);
});

test("cloud-only evidence hydrates without being written straight back", () => {
  const cloud = student({
    sessions: [
      { id: "session-1", responses: [{ correct: true }] },
      { id: "cloud-session", responses: [{ correct: false }] }
    ]
  });
  const hydrated = structuredClone(cloud);
  hydrated.voloTokens = Object.fromEntries(
    Object.entries(hydrated.voloTokens).reverse()
  );
  assert.equal(studentStateNeedsSync(hydrated, cloud, true), false);
});

test("a genuine progress response change still requires sync", () => {
  const cloud = student();
  const changed = structuredClone(cloud);
  changed.sessions[0].responses.push({ correct: false });
  assert.equal(studentStateNeedsSync(changed, cloud, true), true);
});

test("actual student boot hydrates identical reordered state without save RPC", async () => {
  const cloud = student();
  const local = Object.fromEntries(Object.entries(cloud).reverse());
  const boot = await bootCloud({ localStudent: local, cloudStudent: cloud });
  await boot.waitForSync();
  assert.deepEqual(
    boot.calls.map(call => call.name),
    ["get_morphology_student_state"]
  );
  assert.equal(boot.readStudent().id, STUDENT_CONTEXT.studentId);
});

test("actual student boot persists one genuine local evidence difference", async () => {
  const cloud = student();
  const local = student({
    sessions: [...cloud.sessions, { id: "offline-session", responses: [] }]
  });
  const boot = await bootCloud({ localStudent: local, cloudStudent: cloud });
  await boot.waitForSync();
  assert.deepEqual(
    boot.calls.map(call => call.name),
    ["get_morphology_student_state", "save_morphology_student_state"]
  );
});

test("actual student boot hydrates cloud-only evidence without save RPC", async () => {
  const cloud = student({
    sessions: [
      { id: "session-1", responses: [{ correct: true }] },
      { id: "cloud-session", responses: [{ correct: false }] }
    ]
  });
  const boot = await bootCloud({
    localStudent: student({ sessions: [] }),
    cloudStudent: cloud
  });
  await boot.waitForSync();
  assert.deepEqual(
    boot.calls.map(call => call.name),
    ["get_morphology_student_state"]
  );
  assert.equal(boot.readStudent().sessions.length, 2);
});

test("a genuine progress mutation after hydration still invokes the save RPC", async () => {
  const cloud = student();
  const boot = await bootCloud({
    localStudent: structuredClone(cloud),
    cloudStudent: cloud
  });
  const changed = boot.readStudent();
  changed.sessions[0].responses.push({ correct: false });
  boot.writeStudent(changed);
  boot.queueSync();
  await boot.waitForSync();
  assert.deepEqual(
    boot.calls.map(call => call.name),
    ["get_morphology_student_state", "save_morphology_student_state"]
  );
});
