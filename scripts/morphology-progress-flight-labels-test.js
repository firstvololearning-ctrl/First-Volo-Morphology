"use strict";

const fs = require("fs");
const assert = require("assert");

const source = fs.readFileSync("progress-tracker.js", "utf8");
const visibleFiles = [
  "index.html",
  "curriculum-map.html",
  "flight-a-assessment.html",
  "morphology-target-builder.html",
  "morphology-target-builder.js",
  "progress-monitoring.html",
  "reward-registry.js",
  "token-sets.js"
];

assert.match(source, /Foundation:\s*"Flight A — Typically Grades 2–3"/);
assert.match(source, /Expansion:\s*"Flight B — Typically Grades 4–5"/);
assert.match(source, /Advanced:\s*"Flight C — Typically Grades 6–8"/);
assert.match(source, /collectionLabels\[collection\]/);

for (const file of visibleFiles) {
  const content = fs.readFileSync(file, "utf8");
  assert.doesNotMatch(
    content,
    /Foundation Badge|Expansion Badge|Advanced Badge|Flight A · Foundations|Grades 2–3 · Foundation|Grades 4–5 · Expansion|Grades 6–8 · Advanced|Foundation (?:I|II|III|IV)|Expansion (?:Prefixes|Roots|Suffixes|Meaning Flight)|Advanced (?:Prefixes|Roots|Suffixes|Prefix Flight|Root Builder|Meaning Flight)/,
    `${file} still contains an old visible collection label`
  );
}

console.log("Visible Flight labels: PASS");
