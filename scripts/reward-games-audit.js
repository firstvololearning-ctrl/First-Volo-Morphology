"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
global.window = global;
global.FIRST_VOLO_TOKEN_SETS = require(path.join(root, "token-sets.js"));
require(path.join(root, "word-inventory.js"));
const registry = require(path.join(root, "reward-registry.js"));

const collectionByFlight = registry.flightCollections;
const tokensByFlight = Object.fromEntries(Object.entries(collectionByFlight).map(([flight, collection]) => [
  flight,
  global.FIRST_VOLO_TOKEN_SETS.filter((set) => set.collection === collection)
]));

assert.equal(registry.definitions.length, 9, "expected nine reward definitions");
assert.equal(registry.learnerLabel("a-ad"), "a-, ad-", "variant-family label must remain canonical");
assert.equal(registry.learnerLabel("con-com"), "con-, com-", "variant-family label must remain canonical");
for (const flight of Object.keys(tokensByFlight)) {
  assert.equal(registry.definitions.filter((reward) => reward.flight === flight).length, 3, `${flight} should have three rewards`);
}

const report = registry.definitions.map((reward) => {
  const flightTokens = tokensByFlight[reward.flight];
  const ordinal = flightTokens.findIndex((set) => set.id === reward.unlockToken) + 1;
  assert.ok(ordinal > 0, `${reward.id}: unlock token must exist in its Flight`);

  const expectedPool = registry.eligibleThrough(reward.flight, reward.unlockToken);
  assert.deepEqual(reward.eligibleContent.morphemeIds, expectedPool, `${reward.id}: cumulative pool mismatch`);
  assert.equal(new Set(expectedPool).size, expectedPool.length, `${reward.id}: duplicate eligible IDs`);

  const contentIds = reward.gameType === "sky-catch"
    ? reward.rounds.flatMap((round) => [round.target, ...round.distractors])
    : reward.gameType === "meaning-flight"
      ? reward.prompts
      : reward.rounds.flatMap((round) => round.targetIds);
  contentIds.forEach((id) => assert.ok(expectedPool.includes(id), `${reward.id}: ${id} is not yet eligible`));

  if (reward.gameType === "sky-catch") {
    reward.rounds.forEach((round) => {
      assert.equal(round.distractors.length, 3, `${reward.id}: Sky Catch needs three distractors`);
      assert.equal(new Set([round.target, ...round.distractors]).size, 4, `${reward.id}: duplicate Sky Catch choice`);
    });
  }
  if (reward.gameType === "meaning-flight") {
    assert.ok(expectedPool.map((id) => registry.morpheme(id)?.meaning).filter(Boolean).length >= 4,
      `${reward.id}: insufficient meaning choices`);
  }
  if (reward.gameType === "build-word") {
    reward.rounds.forEach((round) => {
      assert.ok(round.word && round.prompt && round.baseHelp, `${reward.id}: word-building support missing`);
      assert.ok(round.pieces.length >= 2, `${reward.id}: build needs multiple pieces`);
    });
  }

  const tokenRatio = ordinal / flightTokens.length;
  const routePosition = tokenRatio * 6;
  const pathRatio = routePosition / 7;
  return { id: reward.id, flight: reward.flight, unlockToken: reward.unlockToken, ordinal,
    totalTokens: flightTokens.length, tokenRatio, routePosition, pathRatio, eligibleCount: expectedPool.length };
});

const rewardFiles = ["reward-registry.js", "reward-config-games.js", "reward-games.js"];
const forbiddenCalls = [
  /\brecordAttempt\s*\(/, /\brecordResponse\s*\(/, /\bstartSession\s*\(/, /\bfinishSession\s*\(/,
  /\bupdateEarnedTokens\s*\(/, /\blocalStorage\s*\.\s*(?:setItem|removeItem|clear)\s*\(/
];
rewardFiles.forEach((file) => {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  forbiddenCalls.forEach((pattern) => assert.doesNotMatch(source, pattern, `${file}: instructional writer ${pattern}`));
});

const displayedMeaningIds = [...new Set(registry.definitions
  .filter((reward) => reward.gameType === "meaning-flight")
  .flatMap((reward) => reward.eligibleContent.morphemeIds))];
const longMeanings = displayedMeaningIds
  .map((id) => ({ id, canonical: registry.morpheme(id)?.meaning || id,
    display: registry.displayMeaning(id), existingShortGloss: Boolean(registry.displayGlosses[id]) }))
  .filter((item) => item.canonical.length > 24);
assert.equal(registry.morpheme("dis").meaning, "apart or away; not; opposite of");
assert.equal(registry.displayMeaning("dis"), "apart; away; not");
assert.equal(registry.morpheme("ing").meaning, "action happening now or in progress");
assert.equal(registry.displayMeaning("ing"), "action happening now");

console.log(JSON.stringify({ rewards: report, longMeanings, writerIsolation: "pass" }, null, 2));
