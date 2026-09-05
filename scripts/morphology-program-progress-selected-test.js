"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(
  path.join(root, "program-progress.html"),
  "utf8"
);
const tracker = fs.readFileSync(
  path.join(root, "progress-tracker.js"),
  "utf8"
);
const accessCss = fs.readFileSync(
  path.join(root, "morphology-access.css"),
  "utf8"
);
const accessSource = fs.readFileSync(
  path.join(root, "js/auth/morphology-access.js"),
  "utf8"
);

test("Program Progress declares the existing logo as its favicon", () => {
  assert.match(
    html,
    /rel="icon"[\s\S]*?href="images\/logo\/logo\.png"/
  );
  assert.match(
    html,
    /rel="apple-touch-icon"[\s\S]*?href="images\/logo\/logo\.png"/
  );
  assert.equal(
    fs.existsSync(path.join(root, "images/logo/logo.png")),
    true
  );
});

test("selected Program Progress identifies the server-backed student", () => {
  assert.match(html, /id="morphologyEducatorSelectedIdentity"/);
  assert.match(
    html,
    /viewing this student’s saved Morphology progress from\s+First Volo Cloud/i
  );
  assert.match(html, /Opening this page does not change progress/i);
});

test("selected Program Progress hides generic roster and mutation controls", () => {
  assert.match(
    html,
    /class="tracker-controls"\s+data-morphology-generic-educator-only/
  );
  assert.match(
    html,
    /class="progress-student-actions"\s+data-morphology-generic-educator-only/
  );
  assert.match(
    accessCss,
    /data-morphology-generic-educator-only[\s\S]*display:\s*none\s*!important/
  );
  assert.match(accessCss, /\.paper-practice-log-controls/);
  assert.match(accessCss, /\.paper-practice-history/);
});

test("tracker binds selected mode to its dedicated access storage key", () => {
  assert.match(
    tracker,
    /localProgressKey\(context\)\s*\|\|\s*null/
  );
  assert.match(
    tracker,
    /context\.mode\s*!==\s*"educator-selected"/
  );
  assert.match(
    tracker,
    /progressData\.students\s*=\s*\[student\]/
  );
  assert.match(
    tracker,
    /progressData\.activeStudentId\s*=\s*context\.studentId/
  );
});

test("selected initialization excludes generic startup writes", () => {
  assert.match(
    tracker,
    /if \(context\.mode === "educator"\) \{\s*applyRequestedStudentSelection\(\);\s*synchronizeInitialTokens\(\);\s*\}/
  );
  assert.doesNotMatch(
    tracker,
    /normalizeSelectedProgress\([^)]*\)[\s\S]{0,120}localStorage\.setItem/
  );
});

test("generic educator progress is scoped to the signed-in educator", () => {
  assert.match(
    accessSource,
    /firstVoloMorphologyProgressV1:educator:\$\{accessContext\.userId\}/
  );
  assert.doesNotMatch(
    accessSource,
    /return "firstVoloMorphologyProgressV1";/
  );
});
