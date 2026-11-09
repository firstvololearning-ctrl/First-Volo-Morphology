"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "..");
const source = file => fs.readFileSync(path.join(root, file), "utf8");

async function openSession(parameters, { omitTeacherExtensions = false } = {}) {
  const dom = new JSDOM(source("session-materials.html"), {
    url: `http://localhost/session-materials.html?${new URLSearchParams(parameters)}`,
    runScripts: "outside-only"
  });
  const { document, MutationObserver } = dom.window;
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
    morpheme: ["en-em", "sub", "a-ad", "e-ex", "retro", "circum", "able-ible", "er-or", "ant-ent-adjective"],
    use: [
      "en-em", "sub", "e-ex", "retro", "mit", "sequ", "ten", "vert", "phon",
      "therm", "ance", "ity", "ify", "ology", "able-ible", "er-or", "ant-ent-adjective"
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
