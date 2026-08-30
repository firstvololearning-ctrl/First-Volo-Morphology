"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");

global.window = global;
require(path.join(__dirname, "..", "word-inventory.js"));
require(path.join(__dirname, "..", "morpheme-pronunciation.js"));

const inventory = global.FIRST_VOLO_MORPHEME_INVENTORY;
const resolver = global.FirstVoloMorphemePronunciation;
assert.equal(inventory.length, 96, "canonical inventory must contain 96 morphemes");
assert.equal(resolver.entries.length, 96, "pronunciation audit must cover all 96 morphemes");
assert.equal(resolver.variantEntries.length, 7, "variant pronunciation review must cover explicit variants");

const normalizeVisible = (label) => String(label || "")
  .replace(/\s*(?:->|→)\s*/g, " changes to ")
  .replace(/\b([A-Za-z]+)-(?=\W|$)/g, "$1")
  .replace(/-([A-Za-z]+)\b/g, "$1")
  .replace(/\s*\/\s*/g, " or ")
  .replace(/\s+/g, " ")
  .trim();

const byId = new Map(resolver.entries.map((entry) => [entry.id, entry]));
const differences = inventory.map((item) => {
  const entry = byId.get(item.id);
  const direct = normalizeVisible(item.label);
  const speechSafe = resolver.getMorphemeSpeechText(item.id);
  const differs = speechSafe !== direct;
  return { id: item.id, type: item.type, visibleLabel: item.label,
    approvedExampleWord: String(item.currentExamples || item.examples?.[0] || "").split(/[ ·,]/)[0] || null,
    strategy: entry.strategy, anchorWord: null,
    currentSpeechInput: direct, speechSafe, hearingStatus: entry.hearingStatus, differs,
    reason: item.id === "inter"
      ? "prefix stress: IN-ter, not the verb-like in-TUR"
      : differs ? "canonical instructional speech form / variant family handling" : "direct reading is safe" };
});
const terminalItems = differences.filter((item) => /(?:t|ct|pt|nt|st)(?:-|\b)/i.test(item.visibleLabel));

assert.equal(resolver.entries.find((entry) => entry.id === "inter").strategy, "tts");
assert.equal(resolver.getMorphemeSpeechText("inter"), "inter");
assert.equal(resolver.controlledAudioIds.length, 39);
assert.equal(resolver.entries.find((entry) => entry.id === "un-negation").hearingStatus, "AUDIO NEEDED");
assert.equal(resolver.containsControlledMorpheme("Catch a meaning of un-."), true);
assert.equal(resolver.containsControlledMorpheme("Catch a meaning of inter-."), false);
assert.equal(resolver.variantEntries.find((entry) => entry.visibleLabel === "-tion").speechText, "tion");
assert.equal(resolver.variantEntries.find((entry) => entry.visibleLabel === "-sion").speechText, "sion");

console.log(JSON.stringify({ total: differences.length,
  explicitSpeechOverrides: differences.filter((item) => item.differs).length,
  explicitVariantPronunciations: resolver.variantEntries,
  terminalItems,
  differences }, null, 2));
