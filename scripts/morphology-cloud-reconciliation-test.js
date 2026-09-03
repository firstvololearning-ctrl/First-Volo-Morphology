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

async function bootEducator({ localStudents, cloudStudents }) {
  const calls = [];
  const storageKey = "firstVoloMorphologyProgressV1";
  const storage = new Map([[
    storageKey,
    JSON.stringify({ students: localStudents, activeStudentId: localStudents[0]?.id || null })
  ]]);
  const profileByStudentId = new Map(
    cloudStudents.map((entry, index) => [
      entry.id,
      {
        id: `profile-${index + 1}`,
        local_profile_id: entry.id,
        display_name: entry.name,
        created_at: entry.createdAt
      }
    ])
  );
  const stateByProfileId = new Map(
    cloudStudents.map(entry => [
      profileByStudentId.get(entry.id).id,
      structuredClone(entry)
    ])
  );

  function resultFor(table, operation, payload) {
    if (operation === "upsert") {
      calls.push({ table, operation, payload: structuredClone(payload) });
      if (table === "learner_profiles") {
        const existing = profileByStudentId.get(payload.local_profile_id);
        return { data: existing || { id: `profile-new-${payload.local_profile_id}` }, error: null };
      }
      return { data: null, error: null };
    }
    calls.push({ table, operation: "select" });
    if (table === "learning_state") {
      return {
        data: [...stateByProfileId].map(([learner_profile_id, data]) => ({
          learner_profile_id,
          data: structuredClone(data)
        })),
        error: null
      };
    }
    if (table === "learner_profiles") {
      return {
        data: [...profileByStudentId.values()].map(value => structuredClone(value)),
        error: null
      };
    }
    throw new Error(`Unexpected table: ${table}`);
  }

  const client = {
    from(table) {
      let operation = "select";
      let payload = null;
      const builder = {
        select() { return builder; },
        eq() { return builder; },
        limit() { return builder; },
        upsert(next) { operation = "upsert"; payload = next; return builder; },
        single() { return Promise.resolve(resultFor(table, operation, payload)); },
        then(resolve, reject) {
          return Promise.resolve(resultFor(table, operation, payload)).then(resolve, reject);
        }
      };
      return builder;
    }
  };
  const context = {
    status: "authorized",
    mode: "educator",
    userId: "educator-1",
    studentId: null,
    classId: null,
    educatorId: "educator-1"
  };
  const access = {
    client,
    getContext: () => context,
    getUser: () => ({ id: "educator-1", is_anonymous: false }),
    subscribe(listener) { listener(context); return () => {}; }
  };
  const localStorage = {
    getItem: key => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value)
  };
  const window = {
    FirstVoloMorphologyAccess: access,
    FirstVoloTokens: { updateEarnedTokens: () => ({ changed: false }) },
    dispatchEvent() {},
    location: { reload() {} }
  };
  const sandbox = {
    AbortController,
    CustomEvent: class CustomEvent {},
    clearTimeout,
    console,
    document: { readyState: "loading", addEventListener() {} },
    localStorage,
    setTimeout,
    structuredClone,
    window
  };

  vm.runInNewContext(source, sandbox);
  await new Promise(resolve => setTimeout(resolve, 50));

  return {
    calls,
    progress: () => JSON.parse(storage.get(storageKey)),
    mutateStudent(studentId, mutate) {
      const progress = JSON.parse(storage.get(storageKey));
      mutate(progress.students.find(entry => entry.id === studentId));
      progress.activeStudentId = studentId;
      storage.set(storageKey, JSON.stringify(progress));
    },
    queueSync: () => window.FirstVoloMorphologyCloud.queueSync(),
    syncNow: () => window.FirstVoloMorphologyCloud.syncNow(),
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

test("ambiguous same-session tie preserves the server copy", () => {
  const local = [{ id: "session-1", completedAt: "2026-09-01T00:00:00Z", responses: [{ answer: "local" }] }];
  const cloud = [{ id: "session-1", completedAt: "2026-09-02T00:00:00Z", responses: [{ answer: "server" }] }];
  const mergeContext = {};
  vm.runInNewContext(
    [
      extractFunction("getSessionKey"),
      extractFunction("getSessionResponseCount"),
      extractFunction("chooseRicherSession"),
      extractFunction("mergeMorphologySessions"),
      "this.merge = mergeMorphologySessions;"
    ].join("\n"),
    mergeContext
  );
  assert.equal(
    mergeContext.merge(local, cloud, true).sessions[0].responses[0].answer,
    "server"
  );
});

test("Student Mode default same-session tie behavior remains local-first", () => {
  const local = [{ id: "session-1", responses: [{ answer: "local" }] }];
  const cloud = [{ id: "session-1", responses: [{ answer: "server" }] }];
  const mergeContext = {};
  vm.runInNewContext(
    [
      extractFunction("getSessionKey"),
      extractFunction("getSessionResponseCount"),
      extractFunction("chooseRicherSession"),
      extractFunction("mergeMorphologySessions"),
      "this.merge = mergeMorphologySessions;"
    ].join("\n"),
    mergeContext
  );
  assert.equal(mergeContext.merge(local, cloud).sessions[0].responses[0].answer, "local");
});

test("genuinely richer local and server sessions retain the richer copy", () => {
  const mergeContext = {};
  vm.runInNewContext(
    [
      extractFunction("getSessionKey"),
      extractFunction("getSessionResponseCount"),
      extractFunction("chooseRicherSession"),
      extractFunction("mergeMorphologySessions"),
      "this.merge = mergeMorphologySessions;"
    ].join("\n"),
    mergeContext
  );
  const base = { id: "session-1", responses: [{ answer: 1 }] };
  const richerLocal = { ...base, responses: [{ answer: 1 }, { answer: 2 }] };
  const richerServer = { ...base, completedAt: "2026-09-02T00:00:00Z" };
  assert.equal(mergeContext.merge([richerLocal], [base]).sessions[0].responses.length, 2);
  assert.equal(mergeContext.merge([base], [richerServer]).sessions[0].completedAt, richerServer.completedAt);
  assert.equal(mergeContext.merge([base], [{ id: "session-2", responses: [] }]).sessions.length, 2);
});

test("generic educator no-action boot hydrates with zero table writes", async () => {
  const cloud = student();
  const boot = await bootEducator({ localStudents: [structuredClone(cloud)], cloudStudents: [cloud] });
  assert.equal(boot.calls.filter(call => call.operation === "upsert").length, 0);
  assert.ok(boot.calls.some(call => call.table === "learning_state" && call.operation === "select"));
});

test("explicit educator sync applies semantic no-op protection", async () => {
  const cloud = student();
  const boot = await bootEducator({ localStudents: [structuredClone(cloud)], cloudStudents: [cloud] });
  await boot.syncNow();
  assert.equal(boot.calls.filter(call => call.operation === "upsert").length, 0);
});

test("server copy wins an ambiguous educator boot conflict without an automatic write", async () => {
  const local = student({ sessions: [{ id: "session-1", completedAt: "2026-09-01T00:00:00Z", responses: [{ answer: "local" }] }] });
  const cloud = student({ sessions: [{ id: "session-1", completedAt: "2026-09-02T00:00:00Z", responses: [{ answer: "server" }] }] });
  const boot = await bootEducator({ localStudents: [local], cloudStudents: [cloud] });
  assert.equal(boot.progress().students[0].sessions[0].responses[0].answer, "server");
  assert.equal(boot.calls.filter(call => call.operation === "upsert").length, 0);
});

test("richer local evidence remains in memory but educator boot does not write it", async () => {
  const cloud = student();
  const local = student({ sessions: [...cloud.sessions, { id: "offline", responses: [] }] });
  const boot = await bootEducator({ localStudents: [local], cloudStudents: [cloud] });
  assert.equal(boot.progress().students[0].sessions.length, 2);
  assert.equal(boot.calls.filter(call => call.operation === "upsert").length, 0);
});

test("genuine educator mutation writes only the changed learner", async () => {
  const first = student();
  const second = student({ id: "student-2", name: "Second" });
  const boot = await bootEducator({ localStudents: [first, second], cloudStudents: [structuredClone(first), structuredClone(second)] });
  boot.mutateStudent(first.id, value => value.sessions.push({ id: "new-session", responses: [] }));
  boot.queueSync();
  await boot.waitForSync();
  const writes = boot.calls.filter(call => call.operation === "upsert");
  assert.deepEqual(writes.map(call => call.table), ["learner_profiles", "learning_state"]);
  assert.equal(writes[0].payload.local_profile_id, first.id);
  assert.equal(writes[1].payload.data.id, first.id);
  assert.ok(writes.every(call => JSON.stringify(call.payload).includes(first.id)));
});

test("repeated no-action educator boots perform zero writes", async () => {
  const cloud = student();
  const first = await bootEducator({ localStudents: [structuredClone(cloud)], cloudStudents: [cloud] });
  const second = await bootEducator({ localStudents: [structuredClone(cloud)], cloudStudents: [cloud] });
  assert.equal([...first.calls, ...second.calls].filter(call => call.operation === "upsert").length, 0);
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
