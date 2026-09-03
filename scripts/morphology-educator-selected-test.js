"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const cloudSource = fs.readFileSync("js/cloud/morphology-cloud.js", "utf8");
const accessSource = fs.readFileSync("js/auth/morphology-access.js", "utf8");

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";

function student(id = A, name = "Student A", marker = "server-a") {
  return {
    id,
    name,
    createdAt: "2026-09-03T10:00:00.000Z",
    sessions: [{ id: marker, responses: [] }],
    paperPractice: [],
    voloTokens: {},
    voloGoals: [],
    voloGoalsUpdatedAt: null,
    progressClearedAt: null
  };
}

function selectedContext(id = A, options = {}) {
  return {
    status: "authorized",
    mode: "educator-selected",
    userId: "educator-auth-1",
    educatorId: "educator-auth-1",
    studentId: id,
    studentName: id === A ? "Student A" : "Student B",
    learnerProfileId: options.hasState === false ? null : `profile-${id}`,
    hasState: options.hasState !== false,
    stateData: options.data || (options.hasState === false ? {} : student(id, id === A ? "Student A" : "Student B")),
    clientUpdatedAt: options.clientUpdatedAt || "2026-09-03T10:00:00.000Z",
    updatedAt: "2026-09-03T10:00:01.000Z",
    classId: null
  };
}

function bootSelected(options = {}) {
  const calls = [];
  const storage = new Map(options.storage || []);
  const timers = new Map();
  let timerId = 0;
  let context = options.context || selectedContext();
  let listener = null;
  const saveResults = [...(options.saveResults || [])];

  const client = {
    rpc(name, args) {
      calls.push({ kind: "rpc", name, args: structuredClone(args || null) });
      return {
        abortSignal(signal) {
          if (name !== "save_morphology_student_state_for_educator") {
            throw new Error(`Unexpected RPC ${name}`);
          }
          const configured = saveResults.shift();
          if (typeof configured === "function") {
            return configured(signal, args);
          }
          const result = configured || {
            result_code: "updated",
            write_applied: true,
            data: args.p_data,
            client_updated_at: args.p_client_updated_at,
            updated_at: "2026-09-03T10:00:02.000Z"
          };
          return Promise.resolve({ data: [result], error: null });
        }
      };
    },
    from(table) {
      calls.push({ kind: "table", table });
      throw new Error(`Selected mode must not access ${table}`);
    }
  };
  const access = {
    client,
    getContext: () => context,
    getUser: () => ({ id: "educator-auth-1", is_anonymous: false }),
    localProgressKey(value = context) {
      return value.mode === "educator-selected"
        ? `firstVoloMorphologyProgressV1:educator-selected:${value.studentId}`
        : "firstVoloMorphologyProgressV1";
    },
    subscribe(next) {
      listener = next;
      next(context);
      return () => {};
    }
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
    clearTimeout(id) { timers.delete(id); },
    console,
    document: { readyState: "loading", addEventListener() {} },
    localStorage: {
      getItem(key) { return storage.get(key) || null; },
      setItem(key, value) { storage.set(key, value); }
    },
    setTimeout(callback) {
      const id = ++timerId;
      timers.set(id, callback);
      return id;
    },
    structuredClone,
    window
  };

  vm.runInNewContext(cloudSource, sandbox);

  function key(id = context.studentId) {
    return `firstVoloMorphologyProgressV1:educator-selected:${id}`;
  }

  return {
    calls,
    storage,
    cloud: window.FirstVoloMorphologyCloud,
    read(id = context.studentId) {
      return JSON.parse(storage.get(key(id)));
    },
    mutate(mutate) {
      const progress = this.read();
      mutate(progress.students[0]);
      storage.set(key(), JSON.stringify(progress));
    },
    async runTimers() {
      while (timers.size) {
        const pending = [...timers.values()];
        timers.clear();
        for (const callback of pending) await callback();
      }
    },
    switchContext(next) {
      context = next;
      listener(next);
    }
  };
}

async function bootAccess(search, user, selectedResponse) {
  const calls = [];
  let authListener = null;
  const elements = new Map();
  const gate = {
    hidden: false,
    innerHTML: "",
    querySelector() { return null; }
  };
  elements.set("morphologyAccessGate", gate);
  const anchor = (href) => ({
    href,
    getAttribute(name) { return name === "href" ? this.href : null; },
    setAttribute(name, value) {
      if (name === "href") this.href = value;
    }
  });
  const links = [
    anchor("index.html"),
    anchor("program-progress.html?view=summary#evidence"),
    anchor("#instructionalGuidancePanel"),
    anchor("printables/VIEW-flight-A-color.pdf"),
    anchor("https://firstvololearning.com"),
    anchor("https://firstvololearning-ctrl.github.io/First-Volo-Account/")
  ];
  const client = {
    rpc(name, args) {
      calls.push({ name, args });
      if (name === "get_morphology_access_context") {
        return Promise.resolve({
          data: [{
            access_mode: user.is_anonymous ? "student" : "educator",
            educator_id: "educator-auth-1",
            student_id: user.is_anonymous ? A : null,
            class_id: user.is_anonymous ? "class-1" : null,
            display_name: "Anonymous Student"
          }],
          error: null
        });
      }
      if (name === "get_morphology_student_state_for_educator") {
        return {
          abortSignal() {
            return Promise.resolve(selectedResponse);
          }
        };
      }
      throw new Error(`Unexpected RPC ${name}`);
    },
    auth: {
      onAuthStateChange(listener) { authListener = listener; },
      getSession() { return Promise.resolve({ data: { session: null }, error: null }); }
    }
  };
  const document = {
    readyState: "complete",
    body: { prepend() {} },
    documentElement: { dataset: {} },
    getElementById(id) { return elements.get(id) || null; },
    querySelectorAll(selector) { return selector === "a[href]" ? links : []; },
    createElement() { return gate; },
    addEventListener() {}
  };
  const window = {
    supabase: { createClient: () => client },
    location: {
      search,
      pathname: "/First-Volo-Morphology/index.html",
      href: `https://firstvololearning-ctrl.github.io/First-Volo-Morphology/index.html${search}`,
      origin: "https://firstvololearning-ctrl.github.io"
    },
    dispatchEvent() {}
  };
  const sandbox = {
    AbortController,
    CustomEvent: class CustomEvent {},
    URL,
    URLSearchParams,
    clearTimeout,
    console,
    document,
    Promise,
    window
  };
  vm.runInNewContext(accessSource, sandbox);
  await new Promise(resolve => setImmediate(resolve));
  await window.FirstVoloMorphologyAccess.resolveForSession({ user });
  assert.ok(authListener);
  return {
    calls,
    context: window.FirstVoloMorphologyAccess.getContext(),
    gate,
    links
  };
}

async function bootStartupAccess(search, user) {
  const calls = [];
  let authListener = null;
  let publishEvents = 0;
  const gate = {
    hidden: false,
    innerHTML: "",
    querySelector() { return null; }
  };
  const client = {
    rpc(name, args) {
      calls.push({ name, args });
      if (name === "get_morphology_access_context") {
        return Promise.resolve({
          data: [{
            access_mode: args?.anonymous ? "student" : "educator",
            educator_id: user.id
          }],
          error: null
        });
      }
      if (name === "get_morphology_student_state_for_educator") {
        const studentId = args.p_student_id;
        return {
          abortSignal() {
            return Promise.resolve({
              data: [{
                educator_user_id: user.id,
                student_id: studentId,
                student_display_name: studentId === A ? "Student A" : "Student B",
                learner_profile_id: `profile-${studentId}`,
                has_state: true,
                data: student(studentId),
                client_updated_at: "2026-09-03T10:00:00.000Z",
                updated_at: "2026-09-03T10:00:01.000Z"
              }],
              error: null
            });
          }
        };
      }
      throw new Error(`Unexpected RPC ${name}`);
    },
    auth: {
      onAuthStateChange(listener) { authListener = listener; },
      getSession() {
        return Promise.resolve({ data: { session: { user } }, error: null });
      }
    }
  };
  const document = {
    readyState: "complete",
    body: { prepend() {} },
    documentElement: { dataset: {} },
    getElementById(id) { return id === "morphologyAccessGate" ? gate : null; },
    createElement() { return gate; },
    addEventListener() {}
  };
  const window = {
    supabase: { createClient: () => client },
    location: { search, pathname: "/index.html" },
    dispatchEvent(event) {
      if (event.type === "firstvolomorphologyaccesschange") {
        publishEvents += 1;
      }
    }
  };
  vm.runInNewContext(accessSource, {
    AbortController,
    CustomEvent: class CustomEvent {
      constructor(type) { this.type = type; }
    },
    URLSearchParams,
    clearTimeout,
    console,
    document,
    Promise,
    window
  });
  await new Promise(resolve => setImmediate(resolve));
  await window.FirstVoloMorphologyAccess.whenReady();
  return {
    calls,
    context: () => window.FirstVoloMorphologyAccess.getContext(),
    publishEvents: () => publishEvents,
    setSearch(value) { window.location.search = value; },
    async emit(event, session) {
      authListener(event, session);
      await window.FirstVoloMorphologyAccess.whenReady();
    }
  };
}

test("selected existing state hydrates server state with zero boot writes", () => {
  const cached = student(A, "Wrong Local Name", "stale-local");
  const key = `firstVoloMorphologyProgressV1:educator-selected:${A}`;
  const boot = bootSelected({ storage: [[key, JSON.stringify({ students: [cached], activeStudentId: A })]] });
  assert.equal(boot.read().students[0].sessions[0].id, "server-a");
  assert.equal(boot.read().students[0].name, "Student A");
  assert.equal(boot.calls.length, 0);
});

test("selected has_state=false creates only a local usable shell", () => {
  const boot = bootSelected({ context: selectedContext(A, { hasState: false }) });
  assert.equal(boot.read().students[0].id, A);
  assert.deepEqual(boot.read().students[0].sessions, []);
  assert.equal(boot.calls.length, 0);
});

test("selected identical explicit sync performs no RPC", async () => {
  const boot = bootSelected();
  await boot.cloud.syncNow();
  assert.equal(boot.calls.length, 0);
});

test("selected genuine mutation uses only the educator save RPC", async () => {
  const boot = bootSelected();
  boot.mutate(value => value.sessions.push({ id: "guided", responses: [] }));
  boot.cloud.queueSync();
  await boot.runTimers();
  assert.deepEqual(boot.calls.map(call => call.name), ["save_morphology_student_state_for_educator"]);
  assert.equal(boot.calls[0].args.p_student_id, A);
  assert.equal(boot.calls.filter(call => call.kind === "table").length, 0);
});

for (const resultCode of ["no_change", "created", "updated"]) {
  test(`selected ${resultCode} adopts revision and remains clean`, async () => {
    const returned = student(A, "Student A", `server-${resultCode}`);
    const boot = bootSelected({ saveResults: [{
      result_code: resultCode,
      write_applied: resultCode !== "no_change",
      data: returned,
      client_updated_at: "2026-09-03T11:00:00.000Z",
      updated_at: "2026-09-03T11:00:01.000Z"
    }] });
    boot.mutate(value => value.sessions.push({ id: "guided", responses: [] }));
    boot.cloud.queueSync();
    await boot.runTimers();
    boot.cloud.queueSync();
    await boot.runTimers();
    assert.equal(boot.calls.length, 1);
    assert.equal(boot.read().students[0].sessions[0].id, `server-${resultCode}`);
  });
}

test("selected stale_revision preserves server and does not retry", async () => {
  const server = student(A, "Student A", "newer-server");
  const boot = bootSelected({ saveResults: [{
    result_code: "stale_revision",
    write_applied: false,
    data: server,
    client_updated_at: "2026-09-03T12:00:00.000Z",
    updated_at: "2026-09-03T12:00:01.000Z"
  }] });
  boot.mutate(value => value.sessions.push({ id: "stale-local", responses: [] }));
  boot.cloud.queueSync();
  await boot.runTimers();
  await boot.runTimers();
  assert.equal(boot.calls.length, 1);
  assert.equal(boot.read().students[0].sessions[0].id, "newer-server");
});

test("selected A to B keeps dedicated caches isolated", () => {
  const boot = bootSelected();
  boot.switchContext(selectedContext(B, { data: student(B, "Student B", "server-b") }));
  assert.equal(boot.read(A).students[0].sessions[0].id, "server-a");
  assert.equal(boot.read(B).students[0].sessions[0].id, "server-b");
});

test("returning to selected A rehydrates A without B evidence", () => {
  const boot = bootSelected();
  boot.switchContext(selectedContext(B, { data: student(B, "Student B", "server-b") }));
  boot.switchContext(selectedContext(A, { data: student(A, "Student A", "server-a-return") }));
  assert.equal(boot.read(A).students[0].sessions[0].id, "server-a-return");
  assert.equal(boot.read(A).students[0].id, A);
  assert.equal(boot.read(B).students[0].id, B);
});

test("unrelated generic educator cache is never read or rewritten", () => {
  const genericKey = "firstVoloMorphologyProgressV1";
  const unrelated = JSON.stringify({ students: [student(B)], activeStudentId: B });
  const boot = bootSelected({ storage: [[genericKey, unrelated]] });
  assert.equal(boot.storage.get(genericKey), unrelated);
  assert.equal(boot.calls.length, 0);
});

test("queued A save is cancelled when B becomes current", async () => {
  const boot = bootSelected();
  boot.mutate(value => value.sessions.push({ id: "a-change", responses: [] }));
  boot.cloud.queueSync();
  boot.switchContext(selectedContext(B, { data: student(B, "Student B", "server-b") }));
  await boot.runTimers();
  assert.equal(boot.calls.length, 0);
});

test("repeated selected no-action boots always perform zero saves", () => {
  const first = bootSelected();
  const second = bootSelected();
  assert.equal(first.calls.length + second.calls.length, 0);
});

test("malformed selected target fails closed without educator read", async () => {
  const boot = await bootAccess("?studentId=not-a-uuid", { id: "educator-auth-1", is_anonymous: false });
  assert.equal(boot.context.status, "selected-error");
  assert.deepEqual(boot.calls.map(call => call.name), ["get_morphology_access_context"]);
});

test("educator without studentId remains generic educator", async () => {
  const boot = await bootAccess("", { id: "educator-auth-1", is_anonymous: false });
  assert.equal(boot.context.mode, "educator");
  assert.equal(boot.context.studentId, null);
  assert.deepEqual(boot.calls.map(call => call.name), ["get_morphology_access_context"]);
});

test("multiple selected targets fail closed without educator read", async () => {
  const boot = await bootAccess(`?studentId=${A}&studentId=${B}`, { id: "educator-auth-1", is_anonymous: false });
  assert.equal(boot.context.status, "selected-error");
  assert.deepEqual(boot.calls.map(call => call.name), ["get_morphology_access_context"]);
});

test("unauthorized selected target never falls back to generic educator", async () => {
  const boot = await bootAccess(`?studentId=${A}`, { id: "educator-auth-1", is_anonymous: false }, { data: null, error: { message: "denied" } });
  assert.equal(boot.context.status, "selected-error");
  assert.equal(boot.context.mode, "educator-selected");
});

test("anonymous Student Mode ignores educator-selected URL privilege", async () => {
  const boot = await bootAccess(`?studentId=${B}`, { id: "anonymous-auth-1", is_anonymous: true });
  assert.equal(boot.context.mode, "student");
  assert.equal(boot.context.studentId, A);
  assert.equal(boot.calls.some(call => call.name === "get_morphology_student_state_for_educator"), false);
});

test("authorized educator-selected identity comes only from read RPC", async () => {
  const response = { data: [{
    educator_user_id: "educator-auth-1",
    student_id: A,
    student_display_name: "Canonical Student A",
    learner_profile_id: "profile-a",
    has_state: true,
    data: student(A, "Canonical Student A"),
    client_updated_at: "2026-09-03T10:00:00.000Z",
    updated_at: "2026-09-03T10:00:01.000Z"
  }], error: null };
  const boot = await bootAccess(`?studentId=${A}`, { id: "educator-auth-1", is_anonymous: false }, response);
  assert.equal(boot.context.mode, "educator-selected");
  assert.equal(boot.context.studentName, "Canonical Student A");
  assert.equal(boot.calls.filter(call => call.name === "get_morphology_student_state_for_educator").length, 1);
});

test("educator-selected navigation preserves target only on internal HTML pages", async () => {
  const user = { id: "educator-auth-1", is_anonymous: false };
  const boot = await bootAccess(`?studentId=${A}`, user, {
    data: [{
      educator_user_id: user.id,
      student_id: A,
      student_display_name: "Student A",
      learner_profile_id: `profile-${A}`,
      has_state: true,
      data: student(A)
    }],
    error: null
  });

  assert.equal(
    boot.links[0].href,
    `https://firstvololearning-ctrl.github.io/First-Volo-Morphology/index.html?studentId=${A}`
  );
  assert.equal(
    boot.links[1].href,
    `https://firstvololearning-ctrl.github.io/First-Volo-Morphology/program-progress.html?view=summary&studentId=${A}#evidence`
  );
  assert.equal(boot.links[2].href, "#instructionalGuidancePanel");
  assert.equal(boot.links[3].href, "printables/VIEW-flight-A-color.pdf");
  assert.equal(boot.links[4].href, "https://firstvololearning.com");
  assert.equal(
    boot.links[5].href,
    "https://firstvololearning-ctrl.github.io/First-Volo-Account/"
  );
});

test("getSession plus duplicate INITIAL_SESSION performs one selected read and one hydration publish", async () => {
  const user = { id: "educator-auth-1", is_anonymous: false };
  const boot = await bootStartupAccess(`?studentId=${A}`, user);
  const publishesBeforeDuplicate = boot.publishEvents();
  await boot.emit("INITIAL_SESSION", { user });
  assert.equal(
    boot.calls.filter(call => call.name === "get_morphology_student_state_for_educator").length,
    1
  );
  assert.equal(boot.publishEvents(), publishesBeforeDuplicate);
  assert.equal(boot.context().studentId, A);
});

test("later real auth session change performs a fresh selected resolution", async () => {
  const firstUser = { id: "educator-auth-1", is_anonymous: false };
  const boot = await bootStartupAccess(`?studentId=${A}`, firstUser);
  const nextUser = { id: "educator-auth-2", is_anonymous: false };
  await boot.emit("SIGNED_IN", { user: nextUser });
  assert.equal(
    boot.calls.filter(call => call.name === "get_morphology_student_state_for_educator").length,
    2
  );
});

test("same educator changing selected target A to B performs the B read", async () => {
  const user = { id: "educator-auth-1", is_anonymous: false };
  const boot = await bootStartupAccess(`?studentId=${A}`, user);
  boot.setSearch(`?studentId=${B}`);
  await boot.emit("TOKEN_REFRESHED", { user });
  const selectedReads = boot.calls.filter(
    call => call.name === "get_morphology_student_state_for_educator"
  );
  assert.deepEqual(
    selectedReads.map(call => call.args.p_student_id),
    [A, B]
  );
  assert.equal(boot.context().studentId, B);
});

test("late selected A read is ignored after selected B becomes current", async () => {
  let resolveA;
  const calls = [];
  const gate = { hidden: false, innerHTML: "", querySelector() { return null; } };
  const client = {
    rpc(name, args) {
      calls.push({ name, args });
      if (name === "get_morphology_access_context") {
        return Promise.resolve({ data: [{ access_mode: "educator", educator_id: "educator-auth-1" }], error: null });
      }
      return {
        abortSignal() {
          if (args.p_student_id === A) {
            return new Promise(resolve => { resolveA = resolve; });
          }
          return Promise.resolve({ data: [{
            educator_user_id: "educator-auth-1",
            student_id: B,
            student_display_name: "Student B",
            learner_profile_id: "profile-b",
            has_state: true,
            data: student(B, "Student B", "server-b"),
            client_updated_at: "2026-09-03T10:00:00.000Z",
            updated_at: "2026-09-03T10:00:01.000Z"
          }], error: null });
        }
      };
    },
    auth: {
      onAuthStateChange() {},
      getSession() { return Promise.resolve({ data: { session: null }, error: null }); }
    }
  };
  const document = {
    readyState: "complete",
    body: { prepend() {} },
    documentElement: { dataset: {} },
    getElementById(id) { return id === "morphologyAccessGate" ? gate : null; },
    createElement() { return gate; },
    addEventListener() {}
  };
  const window = {
    supabase: { createClient: () => client },
    location: { search: `?studentId=${A}`, pathname: "/index.html" },
    dispatchEvent() {}
  };
  vm.runInNewContext(accessSource, {
    AbortController,
    CustomEvent: class CustomEvent {},
    URLSearchParams,
    clearTimeout,
    console,
    document,
    Promise,
    window
  });
  await new Promise(resolve => setImmediate(resolve));
  const user = { id: "educator-auth-1", is_anonymous: false };
  const pendingA = window.FirstVoloMorphologyAccess.resolveForSession({ user });
  await new Promise(resolve => setImmediate(resolve));
  window.location.search = `?studentId=${B}`;
  await window.FirstVoloMorphologyAccess.resolveForSession({ user });
  resolveA({ data: [{
    educator_user_id: "educator-auth-1",
    student_id: A,
    student_display_name: "Student A",
    learner_profile_id: "profile-a",
    has_state: true,
    data: student(A),
    client_updated_at: "2026-09-03T09:00:00.000Z",
    updated_at: "2026-09-03T09:00:01.000Z"
  }], error: null });
  await pendingA;
  assert.equal(window.FirstVoloMorphologyAccess.getContext().studentId, B);
  assert.equal(calls.filter(call => call.name === "get_morphology_student_state_for_educator").length, 2);
});
