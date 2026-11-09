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
