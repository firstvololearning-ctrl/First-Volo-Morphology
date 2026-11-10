"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "..");
const source = file => fs.readFileSync(path.join(root, file), "utf8");

async function openSession(parameters, { omitTeacherExtensions = false, student = null } = {}) {
  const dom = new JSDOM(source("session-materials.html"), {
    url: `http://localhost/session-materials.html?${new URLSearchParams(parameters)}`,
    runScripts: "outside-only"
  });
  const { document, MutationObserver } = dom.window;
  if (student) {
    dom.window.localStorage.setItem("firstVoloMorphologyProgressV1", JSON.stringify({
      activeStudentId: student.id,
      students: [student]
    }));
  }
  const observers = [];
  dom.window.MutationObserver = class extends MutationObserver {
    constructor(callback) {
      super(callback);
      observers.push(this);
    }
  };
  for (const script of document.querySelectorAll("script[src]")) {
    const src = script.getAttribute("src").split("?")[0];
    if (src.startsWith("https:") || src.startsWith("js/")) continue;
    if (omitTeacherExtensions && src === "instructional-teacher-word-extensions.js") continue;
    dom.window.eval(source(src));
  }
  if (document.readyState === "loading") {
    await new Promise(resolve => document.addEventListener("DOMContentLoaded", resolve, { once: true }));
  }
  return {
    byId: id => document.getElementById(id),
    window: dom.window,
    transfer: () => document.querySelector(".session-transfer-card"),
    close() {
      for (const observer of observers) observer.disconnect();
      dom.window.close();
    }
  };
}

test("tract reaches a separate fresh example before Check Transfer in both session modes", async () => {
  for (const selected of [false, true]) {
    const parameters = { demo: "TRACT", minutes: "10" };
    if (selected) Object.assign(parameters, {
      sessionSource: "teacher-selected",
      teacherTarget: "tract",
      teacherActivity: "morpheme"
    });
    const { close, byId, transfer } = await openSession(parameters);
    try {
      const next = byId("nextTaskButton");
      assert.match(byId("sessionStep2Mount").textContent, /Which part of attract/);
      assert.equal(transfer().hidden, true);
      assert.match(next.textContent, /Part B/);
      next.click();
      const apply = byId("sessionStep3Mount");
      assert.match(apply.textContent, /tractor/);
      const disclosure = [...apply.querySelectorAll("details")].find(details =>
        /reveal the fresh word/i.test(details.querySelector("summary")?.textContent)
      );
      assert.ok(disclosure, "the fresh word has an educator-controlled reveal");
      assert.equal(disclosure.open, false);
      assert.equal(transfer().hidden, true);
      assert.match(next.textContent, /Continue to Check Transfer/);
      next.click();
      assert.equal(transfer().hidden, false);
    } finally {
      close();
    }
  }
});

test("a session with no eligible fresh Word Part example marks Part B unavailable", async () => {
  const { close, byId } = await openSession({
    demo: "TRACT",
    minutes: "10",
    sessionSource: "teacher-selected",
    teacherTarget: "tract",
    teacherActivity: "morpheme"
  }, { omitTeacherExtensions: true });
  try {
    const overview = byId("todaySessionOverview").textContent;
    assert.match(overview, /No application task is available for this session/);
    assert.doesNotMatch(overview, /1 fresh application item/);
    assert.match(byId("nextTaskButton").textContent, /Continue to Check Transfer/);
  } finally {
    close();
  }
});

test("previously uncovered teacher targets have a fresh Part B at their introduction band", async () => {
  const { close, window } = await openSession({ demo: "TRACT", minutes: "10" });
  const targetsByActivity = {
    morpheme: [
      "en-em", "sub", "a-ad", "e-ex", "retro", "circum", "chron", "pos", "mit", "sequ", "ten",
      "vert", "therm", "ance", "able-ible", "er-or", "ly-adjective", "ant-ent-agent", "ant-ent-adjective"
    ],
    use: [
      "en-em", "sub", "a-ad", "e-ex", "retro", "circum", "chron", "pos", "mit", "sequ", "ten", "vert", "phon",
      "therm", "ance", "ity", "ify", "ology", "able-ible", "er-or", "ly-adjective", "ant-ent-agent", "ant-ent-adjective"
    ]
  };

  try {
    for (const [activity, targetIds] of Object.entries(targetsByActivity)) {
      for (const targetId of targetIds) {
        const target = window.FIRST_VOLO_MORPHEME_INVENTORY.find(item => item.id === targetId);
        const plan = window.FirstVoloInstructionalSessionPlanner.buildPlan({
          student: { gradeBand: target.introBand, vocabLevel: "standard" },
          sessionMinutes: 10,
          sessionSelection: { source: "teacher-selected", targetId, activity }
        });
        const label = `${activity} / ${targetId} / ${target.introBand}`;
        const recipes = plan.sessionMaterial.recipes;
        assert.equal(plan.sessionMaterial.ready, true, label);
        assert.ok(plan.apply.item?.word, label);
        assert.ok(recipes.length >= 2, label);
        for (const { word, applyKind, applyWord } of recipes) {
          assert.equal(applyKind, "specific-new-item", label);
          assert.ok(applyWord, label);
          assert.notEqual(applyWord, word, label);
          assert.equal(window.FirstVoloInstructionalProtection.isProtected(applyWord), false, label);
        }
      }
    }
  } finally {
    close();
  }
});

test("Word Part and Use It open fresh Part B before transfer from the actual session controls", async () => {
  for (const [demo, teacherTarget, teacherActivity] of [
    ["COOK", "sub", "morpheme"], ["PORT", "therm", "use"]
  ]) {
    const { byId, close, transfer } = await openSession({
      demo, minutes: "10", sessionSource: "teacher-selected", teacherTarget, teacherActivity
    });
    try {
      const next = byId("nextTaskButton");
      assert.match(next.textContent, /Part B/);
      assert.equal(transfer().hidden, true);
      next.click();
      assert.match(byId("sessionStep3Mount").textContent, /subway|submarine|geothermal|thermostat/i);
      assert.equal(transfer().hidden, true);
      next.click();
      assert.equal(transfer().hidden, false);
    } finally {
      close();
    }
  }
});


test("Use It asks for a spoken sentence and resets the item observation across all three routes", async () => {
  const route3 = {
    id: "fictional-route-3",
    name: "Demo learner",
    sessions: [{
      id: "fictional-session",
      completedAt: "2026-11-09T10:00:00Z",
      gradeBand: "6-8",
      vocabLevel: "standard",
      activity: "meaning",
      studyMode: "roots",
      totalItems: 1,
      correct: 1,
      responses: [{
        skill: "meaning",
        correct: true,
        primaryTarget: "pel",
        primaryTargetId: "pel",
        targetType: "root",
        word: "propel"
      }]
    }]
  };

  for (const [demo, teacherTarget, student] of [
    ["COOK", "ed", null], ["PORT", "therm", null], ["", "chron", route3]
  ]) {
    const { byId, close } = await openSession({
      demo, minutes: "10", sessionSource: "teacher-selected",
      teacherTarget, teacherActivity: "use"
    }, { student });
    try {
      let material = byId("readyStudentMaterial");
      assert.match(material.textContent, /Say your own sentence aloud/, teacherTarget);
      let observation = material.querySelector("[data-spoken-response]");
      assert.equal(observation.closest("[hidden]"), null, teacherTarget);
      assert.deepEqual(Array.from(observation.options, option => option.value),
        ["", "independent", "cued", "retry"], teacherTarget);
      observation.value = "cued";
      byId("nextTaskButton").click();
      material = byId("readyStudentMaterial");
      assert.match(byId("sessionStep3Mount").textContent, /Say a new sentence aloud/, teacherTarget);
      assert.equal(material.querySelector("[data-spoken-response]").value, "", teacherTarget);
    } finally {
      close();
    }
  }
});
