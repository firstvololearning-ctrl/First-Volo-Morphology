"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

// Execute the destination audit's actual Flight mapping and validation without
// running the unrelated word-pool audit or writing its generated reports.
const source = fs.readFileSync(path.join(__dirname, "teacher-master-word-destination-audit.js"), "utf8");
const start = source.indexOf("const collectionToFlight =");
const end = source.indexOf("function targetById(", start);
assert.ok(start >= 0 && end > start, "Destination audit Flight section must exist");

function audit(tokenSets, ids) {
  const context = {
    tokenSets,
    targets: ids.map(id => ({ id })),
    asArray: value => Array.isArray(value) ? value : [],
    bandToFlight: band => ({ "2-3": "A", "4-5": "B", "6-8": "C" })[band] || null
  };
  vm.runInNewContext(source.slice(start, end) + "\nresult = { targetFlight, findings };", context);
  return context.result;
}

test("canonical pending adjective keeps its assigned Flight and remains visible as pending", () => {
  const sets = require("./token-sets.js");
  const result = audit(sets, ["ly-adjective", "ly-adverb"]);
  assert.equal(result.targetFlight.get("ly-adjective"), "A");
  assert.equal(result.targetFlight.get("ly-adverb"), "A");
  assert.equal(result.findings.filter(item => item.severity === "HARD").length, 0);
  assert.ok(result.findings.some(item => item.category === "target-flight-pending" && item.message.includes("ly-adjective")));
  assert.ok(!sets.some(set => (set.morphemeIds || []).includes("ly-adjective")), "Pending target must not become active");
});

test("a genuinely unassigned target still fails", () => {
  const result = audit([], ["missing"]);
  assert.equal(result.findings[0].severity, "HARD");
  assert.match(result.findings[0].message, /0 Flight memberships/);
});

test("active plus pending assignment is a duplicate, not an exemption", () => {
  const result = audit([{ collection: "Foundation", morphemeIds: ["same"], pendingMorphemeIds: ["same"] }], ["same"]);
  assert.ok(result.findings.some(item => item.severity === "HARD" && /2 Flight memberships/.test(item.message)));
});

test("two pending assignments still fail", () => {
  const result = audit([
    { collection: "Foundation", pendingMorphemeIds: ["same"] },
    { collection: "Expansion", pendingMorphemeIds: ["same"] }
  ], ["same"]);
  assert.ok(result.findings.some(item => item.severity === "HARD" && /2 Flight memberships/.test(item.message)));
});

test("active assignments keep their Flight without a pending finding", () => {
  const result = audit([{ collection: "Expansion", morphemeIds: ["active"] }], ["active"]);
  assert.equal(result.targetFlight.get("active"), "B");
  assert.equal(result.findings.length, 0);
});
