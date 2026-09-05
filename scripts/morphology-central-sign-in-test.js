"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

const source = fs.readFileSync("js/auth/morphology-access.js", "utf8");

test("locked Morphology uses the central educator and student sign-in routes", () => {
  assert.match(source, /First-Volo-Account\/"/);
  assert.match(source, /\?returnTo=morphology/);
  assert.match(source, /student-login\.html\?returnTo=morphology/);
  assert.match(source, />Educator sign in</);
  assert.match(source, />Student sign in</);
  assert.doesNotMatch(
    source,
    /morphologyAccessSignIn[\s\S]*morphologyCloudButton/
  );
});
