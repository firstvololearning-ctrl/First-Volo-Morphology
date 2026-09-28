"use strict";
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const context = { window: {} };
vm.createContext(context);
for (const name of ["word-inventory.js", "instructional-protection-registry.js", "learn-content.js"]) {
  vm.runInContext(fs.readFileSync(name, "utf8"), context);
}
const source = fs.readFileSync("script.js", "utf8");
const arrays = {};
for (const name of ["prefixes", "roots", "suffixes"]) {
  arrays[name] = vm.runInContext(source.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\n\\];`))[0] + `;${name}`, context);
}
const content = context.window.FirstVoloLearnContent;
const protectedWords = context.window.FirstVoloInstructionalProtection;
const inventory = context.window.FIRST_VOLO_WORD_INVENTORY;
const morphemes = context.window.FIRST_VOLO_MORPHEME_INVENTORY;
// Exercise the actual eligibility and example-merging code with production metadata.
vm.runInContext(source.slice(source.indexOf("const WORD_INVENTORY ="), source.indexOf("function isReservedTransferWord")), context);
vm.runInContext(source.slice(source.indexOf("function isReservedTransferWord"), source.indexOf("function isWordEligibleForSelectedGrade")), context);
vm.runInContext(source.slice(source.indexOf("function isLearnWordEligible"), source.indexOf("function getLearnExampleLabel")), context);
vm.runInContext('var gradeBand = "all", vocabLevel = "all";', context);
let combinations = 0;
const coverage = [];
for (const flight of ["all", "2-3", "4-5", "6-8"]) {
  for (const vocabulary of ["all", "standard", "familiar", "academic", "challenge"]) {
    context.gradeBand = flight; context.vocabLevel = vocabulary;
    for (const mode of ["prefixes", "roots", "suffixes"]) {
      const eligibleItem = item => flight === "all" || morphemes.find(entry => entry.id === item.id && entry.type === item.type)?.introBand === flight;
      const rounds = content.buildRounds(mode, arrays[mode], eligibleItem, context.isLearnWordEligible);
      coverage.push({ flight, vocabulary, mode, rounds: rounds.length });
      if (flight === "all" && vocabulary === "all") assert.equal(rounds.length, mode === "prefixes" ? 11 : mode === "roots" ? 14 : 11, `${mode}: available rounds`);
      for (const round of rounds) {
        assert.ok(round.targets.length >= 2 && round.cards.length >= 4);
        assert.equal(new Set(round.cards.map(card => card.word)).size, round.cards.length, 'unambiguous word destinations');
        for (const card of round.cards) {
          assert.ok(!protectedWords.isProtected(card.word), card.word);
          assert.ok(context.isLearnWordEligible(card.word), `${flight}/${vocabulary}: ${card.word}`);
          assert.equal(card.before + card.target + card.after, card.word);
          assert.ok(card.context.toLowerCase().includes(card.word), `${card.word}: sentence context required`);
          assert.ok(!["servant", "prevent", "instruct", "refer", "confer", "mistake"].includes(card.word));
          assert.ok(round.targets.some(target => target.id === card.targetId && eligibleItem(target)));
        }
      }
      combinations++;
    }
  }
}
// Each curated contrast must survive its intended Standard flight filters.
for (const spec of content.meaningSorts) {
  const flight = morphemes.find(m => m.id === spec.groups[0].id).introBand;
  context.gradeBand = flight; context.vocabLevel = "standard";
  const eligibleItem = item => morphemes.find(m => m.id === item.id).introBand === flight;
  const round = content.buildMeaningRounds(spec.mode, arrays[spec.mode], eligibleItem, context.isLearnWordEligible).find(r => r.id === spec.id);
  assert.ok(round, `${spec.id}: missing from intended flight`);
  assert.ok(round.cards.every(c => c.context && c.explanation && c.target), `${spec.id}: complete support`);
}
context.gradeBand = "all"; context.vocabLevel = "all";
for (const [id, words] of Object.entries(content.additions)) {
  const item = Object.values(arrays).flat().find(item => item.id === id);
  assert.ok(context.getLearnExamplesForSelectedVocabulary(item).length >= 2, id);
  for (const word of words) {
    assert.ok(!protectedWords.isProtected(word), word);
    assert.ok(inventory.find(entry => entry.word === word) || content.metadata[word], word);
  }
}
for (const [id, lesson] of Object.entries(content.worked)) {
  assert.ok(!protectedWords.isProtected(lesson.word), `${id}: protected lesson`);
  assert.ok(lesson.sentence.toLowerCase().includes(lesson.word));
  assert.equal(lesson.choices.length, 2);
  assert.ok(lesson.answer === 0 || lesson.answer === 1);
  assert.ok(context.isLearnWordEligible(lesson.word));
}
assert.ok(!Object.values(content.additions).flat().includes("servant"));
assert.ok(content.additions["ant-ent-agent"].includes("claimant"));
for (const id of ["ant-ent-agent", "ant-ent-adjective"]) {
  assert.match(content.worked[id].parts, /Word family/);
  assert.doesNotMatch(content.worked[id].parts, /→|\+/);
}
assert.doesNotMatch(content.worked.geo.explanation, /shared|twice/);
for (const item of Object.values(arrays).flat()) {
  for (const lesson of content.lessons(item)) {
    assert.ok(!protectedWords.isProtected(lesson.word), `lesson: ${lesson.word}`);
    const practice=content.practice[lesson.word];
    assert.ok(practice, `${item.id}: missing follow-up application`);
    assert.ok(practice.sentence.toLowerCase().includes(lesson.word));
    assert.equal(practice.feedback.length,practice.choices.length);
    assert.ok(practice.answer >= 0 && practice.answer < practice.choices.length);
  }
}
// Every card needs a usable example and active teaching at its own Standard flight.
for (const flight of ["2-3", "4-5", "6-8"]) {
  context.gradeBand = flight; context.vocabLevel = "standard";
  const eligibleItem = item => morphemes.find(m => m.id === item.id).introBand === flight;
  for (const mode of Object.keys(arrays)) {
    const rounds = content.buildRounds(mode, arrays[mode], eligibleItem, context.isLearnWordEligible);
    const targets = new Set(rounds.flatMap(r => r.targets.map(t => t.id)));
    for (const item of arrays[mode].filter(eligibleItem)) {
      assert.ok(context.getLearnExamplesForSelectedVocabulary(item).length >= 2, `${flight}/${item.id}: needs two examples`);
      const lessons = content.lessons(item).filter(l => context.isLearnWordEligible(l.word));
      assert.ok(lessons.length || targets.has(item.id), `${flight}/${item.id}: reference only`);
    }
    if (flight === "6-8" && mode === "prefixes") assert.ok(rounds.length, "Flight C prefix practice");
  }
}
context.gradeBand = "all"; context.vocabLevel = "all";
// Paired application remains inside the same flight and respects protected words.
for (const id of ['sub','ion','ment','circum','spect','mit','biblio']) {
  const item = Object.values(arrays).flat().find(x => x.id === id);
  context.gradeBand = morphemes.find(m => m.id === id).introBand;
  context.vocabLevel = 'standard';
  const lessons = content.lessons(item).filter(l => context.isLearnWordEligible(l.word));
  assert.ok(lessons.length >= 2, `${id}: two worked examples`);
  const first = lessons[0], application = content.practiceFor(first, context.isLearnWordEligible);
  assert.ok(application.word && application.word !== first.word, `${id}: different-word application`);
  assert.ok(!protectedWords.isProtected(application.word));
  assert.ok(application.sentence.toLowerCase().includes(application.word));
  assert.equal(content.practiceFor(first, w => w !== application.word).word, undefined, 'filtered transfer falls back to original practice');
}
context.gradeBand='all';context.vocabLevel='all';
// Ambiguous words and newly reserved words disappear, including their empty targets.
const duplicateItems = [
  { id: "struct", type: "root", label: "struct", examples: ["construct", "structure"] },
  { id: "dict", type: "root", label: "struct", examples: ["construct", "structure"] }
];
assert.equal(content.buildRounds("roots", duplicateItems, () => true, () => true).length, 0);
assert.equal(content.buildRounds("roots", arrays.roots, () => true, () => false).length, 0);
assert.equal(content.buildRounds("root-suffix", arrays.roots, () => true, () => true).length, 0);
// A meaning contrast needs both groups with two unreserved examples each.
context.gradeBand="4-5"; context.vocabLevel="standard";
const meaningRounds = eligible => content.buildMeaningRounds("roots", arrays.roots, () => true, eligible).filter(r => r.id === "earth-writing");
const earthWriting=meaningRounds(context.isLearnWordEligible)[0];
assert.equal(earthWriting.id,"earth-writing");
assert.deepEqual(Array.from(earthWriting.cards,c=>c.word).sort(),["autograph","biography","geology","geothermal"]);
assert.ok(earthWriting.targets.every(t=>t.heading && earthWriting.cards.filter(c=>c.targetId===t.id).length===2));
assert.equal(meaningRounds(w=>w!=="geology"&&context.isLearnWordEligible(w)).length,0);
for(const flight of ["2-3","6-8"]){context.gradeBand=flight;assert.equal(meaningRounds(context.isLearnWordEligible).length,0);}
context.gradeBand="4-5";
for(const vocabulary of ["familiar","academic","challenge"]){context.vocabLevel=vocabulary;assert.equal(meaningRounds(context.isLearnWordEligible).length,0);}
context.vocabLevel="standard";
content.meaningSorts[0].groups[0].cards.push({word:"geography",explanation:"Ambiguous fixture"});
assert.ok(meaningRounds(context.isLearnWordEligible)[0].cards.every(c=>c.word!=="geography"));
content.meaningSorts[0].groups[0].cards.pop();
content.meaningSorts[0].groups[0].cards.push(content.meaningSorts[0].groups[1].cards[0]);
assert.equal(meaningRounds(context.isLearnWordEligible).length,0);
content.meaningSorts[0].groups[0].cards.pop();
console.log(JSON.stringify({ passed: true, filterCombinations: combinations, workedExamples: Object.keys(content.worked).length, addedWords: Object.values(content.additions).flat().length, coverage }, null, 2));
