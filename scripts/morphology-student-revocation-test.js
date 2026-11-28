const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { JSDOM } = require('jsdom');

const source = fs.readFileSync('js/auth/morphology-access.js', 'utf8');
const student = { id: 'student-auth', is_anonymous: true };
const authorized = { data: [{
  access_mode: 'student',
  student_id: 'student',
  class_id: 'class',
  educator_id: 'educator'
}], error: null };

async function setup() {
  const dom = new JSDOM('<body><main id="activity">Lesson</main></body>', {
    url: 'https://example.test/index.html',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  const { window } = dom;
  const state = { result: authorized, calls: 0 };
  window.setInterval = (callback, interval) => {
    state.check = callback;
    assert.equal(interval, 15000);
    return 1;
  };
  window.supabase = { createClient: () => ({
    rpc(name) {
      assert.equal(name, 'get_morphology_access_context');
      state.calls++;
      return Promise.resolve(state.result);
    },
    auth: {
      onAuthStateChange() {},
      getSession: async () => ({ data: { session: { user: student } } })
    }
  }) };
  window.eval(source);
  await Promise.resolve();
  const access = window.FirstVoloMorphologyAccess;
  await access.whenReady();
  return { ...dom, window, access, state, close: () => window.close() };
}

test('a visible student locks on its periodic check without changing tabs', async () => {
  const { access, state, window, close } = await setup();
  try {
    assert.equal(access.getContext().status, 'authorized');
    state.result = { data: [], error: null };
    state.check();
    await new Promise(setImmediate);
    assert.equal(access.getContext().status, 'locked');
    assert.equal(window.document.documentElement.dataset.morphologyPageAllowed, 'false');
    assert.equal(window.document.getElementById('morphologyAccessGate').hidden, false);
  } finally {
    close();
  }
});

test('starting an activity requires a fresh check and shares an in-flight timer check', async () => {
  const { access, state, close } = await setup();
  try {
    let actions = 0;
    await access.withVerifiedStudentAccess(() => actions++);
    assert.equal(actions, 1);
    state.result = { data: [], error: null };
    const previousCalls = state.calls;
    state.check();
    await access.withVerifiedStudentAccess(() => actions++);
    assert.equal(state.calls, previousCalls + 1);
    assert.equal(actions, 1);
    assert.equal(access.getContext().status, 'locked');
  } finally {
    close();
  }
});
