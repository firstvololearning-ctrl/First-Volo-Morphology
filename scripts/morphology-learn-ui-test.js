"use strict";
// Run with NODE_PATH pointing to an installation of jsdom 26.
const { JSDOM } = require("jsdom");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const source = fs.readFileSync("script.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const dom = new JSDOM(html, { runScripts: "outside-only", url: "https://example.test/" });
const w = dom.window;
w.HTMLElement.prototype.scrollIntoView = function () {};
for (const name of ["word-inventory.js", "instructional-protection-registry.js", "learn-content.js"]) w.eval(fs.readFileSync(name, "utf8"));
let definitions = '';
for (const name of ["prefixes", "roots", "suffixes", "wordHuntQuestions"]) definitions += source.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\n\\];`))[0] + '\n';
definitions += source.slice(source.indexOf('const suffixFunctionInfo ='), source.indexOf('\n};',source.indexOf('const suffixFunctionInfo ='))+3);
// Preserve lexical bindings across this test's eval calls.
w.eval(definitions.replace(/const /g,'var '));
w.eval(source.slice(source.indexOf("const WORD_INVENTORY ="), source.indexOf("function isReservedTransferWord")).replace(/const WORD_INVENTORY/g,'var WORD_INVENTORY'));
w.eval(source.slice(source.indexOf("function isReservedTransferWord"), source.indexOf("function isWordEligibleForSelectedGrade")));
w.eval(source.slice(source.indexOf("function isLearnWordEligible"), source.indexOf("function getLearnExampleLabel")));
w.eval(`
var gradeBand = 'all', vocabLevel = 'all', studyMode = 'roots', learnMode = 'sort', sortRoundIndex = 0;
var learningGrid = document.getElementById('learningGrid'), learnSortWorkspace = document.getElementById('learnSortWorkspace');
var workspaceTitle = {}, workspaceSubtitle = {}, workspaceActions = {}, activityProgress = {};
var panels = {learn: document.getElementById('learnActivity')};
var learnSortButton = document.getElementById('learnSortButton'), learnExploreButton = document.getElementById('learnExploreButton');
function isMorphemeEligibleForSelectedGrade(item) { return gradeBand === 'all' || window.FIRST_VOLO_MORPHEME_INVENTORY.find(m=>m.id===item.id && m.type===item.type)?.introBand===gradeBand; }
function getCurrentStudyItems() { return (studyMode==='roots'?roots:studyMode==='suffixes'?suffixes:prefixes).filter(isMorphemeEligibleForSelectedGrade); }
function shuffle(items) { return [...items]; }
function escapeHTML(value) { const e=document.createElement('div'); e.textContent=String(value); return e.innerHTML; }
function getTypeClass(type) { return type; }
function getLearnExampleLabel() { return 'Examples'; }
function getVocabularyLevelLabel() { return 'Selected'; }
function instructionalAudioDescriptor(id, token) { return {id,token}; }
function setAudioButton(container,text) { window.lastAudioText=text; }
`);
w.eval(source.slice(source.indexOf('function renderSortItActivity()'),source.indexOf('/* ========================================\n   BREAK IT APART QUESTION GENERATION')));
let roundsTested = 0;
for (const mode of ['roots','suffixes','prefixes']) {
  w.studyMode=mode; w.learnMode='sort'; w.sortRoundIndex=0; w.renderLearnActivity();
  assert.match(w.document.getElementById('learnIntroduction').textContent,/sort/);
  const rounds=w.FirstVoloLearnContent.buildRounds(mode,w[mode],()=>true,w.isLearnWordEligible);
  for (const round of rounds) {
    for (const card of round.cards) {
      const cardElement = w.document.querySelector(`[data-sort-card="${card.cardId}"]`);
      assert.equal(cardElement.querySelector(".sort-word-context").textContent, card.context);
      cardElement.click();
      const wrong=round.targets.find(t=>t.id!==card.targetId);
      w.document.querySelector(`[data-sort-target="${wrong.id}"]`).click();
      assert.match(w.document.getElementById('sortItFeedback').textContent,round.type === "meaning-sort" ? /You can use the picture/ : round.type === "prefix-family" ? /Try another group/ : /Use that clue/);
      assert.equal(w.document.querySelector(`[data-sort-card="${card.cardId}"]`).hidden,false);
      w.document.querySelector(`[data-sort-target="${card.targetId}"]`).click();
      assert.equal(w.document.querySelector(`[data-sort-card="${card.cardId}"]`).hidden,true);
    }
    assert.match(w.document.getElementById('sortItFeedback').textContent,/Round complete/);
    assert.equal(w.document.activeElement.id,'sortNextRoundButton');
    w.document.getElementById('sortNextRoundButton').click();
    roundsTested++;
  }
  assert.equal(w.sortRoundIndex,0,'round navigation wraps');
}
for (const [id,lesson] of Object.entries(w.FirstVoloLearnContent.worked)) {
  const item=[...w.prefixes,...w.roots,...w.suffixes].find(item=>item.id===id);
  w.studyMode=item.type==='prefix'?'prefixes':item.type==='root'?'roots':'suffixes'; w.learnMode='explore';w.renderLearnActivity();w.renderLearnDetail(item);
  assert.ok(w.document.querySelector('.learn-worked-example').textContent.toLowerCase().includes(lesson.word), 'worked example names its word');
  w.document.querySelector(`[data-learn-choice="${1-lesson.answer}"]`).click();
  assert.match(w.document.querySelector('.learn-check-feedback').textContent,/Try again/);
  w.document.querySelector(`[data-learn-choice="${lesson.answer}"]`).click();
  assert.match(w.document.querySelector('.learn-check-feedback').textContent,/Yes/);
  assert.ok(w.lastAudioText.includes(lesson.sentence));
}
let applicationsTested = 0;
for (const id of Object.keys(w.FirstVoloLearnContent.worked)) {
  const item=[...w.prefixes,...w.roots,...w.suffixes].find(item=>item.id===id);
  const lessons=w.FirstVoloLearnContent.lessons(item);
  w.renderLearnDetail(item);
  for (let i=0;i<lessons.length;i++) {
    const lesson=lessons[i], practice=w.FirstVoloLearnContent.practiceFor(lesson,w.isLearnWordEligible);
    assert.ok(w.document.querySelector('.learn-worked-example h5').textContent.includes(lesson.word));
    assert.equal(w.document.querySelector('.learn-practice').hidden,true);
    assert.equal(w.document.querySelector('.learn-complete').hidden,true);
    if (lesson.reflection) assert.equal(w.document.querySelector('.learn-reflection').hidden,true);
    w.document.querySelector(`[data-learn-choice="${1-lesson.answer}"]`).click();
    assert.equal(w.document.querySelector('.learn-continue').hidden,true,'wrong answer cannot advance');
    w.document.querySelector(`[data-learn-choice="${lesson.answer}"]`).click();
    w.document.querySelector('.learn-continue').click();
    assert.equal(w.document.activeElement.tagName,'H6');
    w.document.querySelector(`[data-learn-practice="${1-practice.answer}"]`).click();
    assert.equal(w.document.querySelector('.learn-complete').hidden,true);
    assert.ok(w.document.querySelector('.learn-practice-feedback').textContent.includes(practice.feedback[1-practice.answer]));
    w.document.querySelector(`[data-learn-practice="${practice.answer}"]`).click();
    assert.equal(w.document.querySelector('.learn-complete').hidden,false);
    if (lesson.reflection) {
      assert.equal(w.document.querySelector('.learn-reflection').hidden,false);
      assert.equal(w.document.querySelector('.learn-reflection details').open,false);
      assert.equal(w.document.querySelectorAll('.learn-build-steps li').length,3);
      assert.ok(w.lastAudioText.includes(lesson.spellingNote));
    }
    applicationsTested++;
    assert.ok(w.lastAudioText.includes(practice.sentence));
    if(i+1<lessons.length) {
      w.document.querySelector('.learn-next-example').click();
      assert.equal(w.document.activeElement.tagName,'H5');
    }
  }
}
// Filtering a paired word removes it from the follow-up, contrast and navigation.
const pairedEligibility = w.isLearnWordEligible;
w.isLearnWordEligible = word => word !== 'subway' && pairedEligibility(word);
w.renderLearnDetail(w.prefixes.find(i => i.id === 'sub'));
assert.ok(!w.document.querySelector('.learn-worked-example').textContent.toLowerCase().includes('subway'));
assert.equal(w.document.querySelector('.learn-contrast'), null);
assert.ok(!w.lastAudioText.toLowerCase().includes('subway'), 'filtered comparison cannot leak into audio');
assert.equal(w.document.querySelector('.learn-continue').textContent, 'Try a new sentence');
w.isLearnWordEligible = pairedEligibility;
// A newly reserved secondary lesson must disappear, including its navigation label.
const baseEligibility=w.isLearnWordEligible;
w.isLearnWordEligible=word=>word!=='unroll' && baseEligibility(word);
w.renderLearnDetail(w.prefixes.find(i=>i.id==='un-reversative'));
assert.equal(w.document.querySelector('.learn-next-example'),null);
w.isLearnWordEligible=baseEligibility;
// Every new comparison and different-word question respects later exclusions.
for (const id of ['un-negation','re','pre','mis','dis','over','ed','ing','s-es','ful','less','est']) {
  const item=[...w.prefixes,...w.suffixes].find(item=>item.id===id);
  const lesson=w.FirstVoloLearnContent.worked[id];
  const paired=w.FirstVoloLearnContent.practice[lesson.word].transfer.word;
  w.isLearnWordEligible=word=>word!==paired && baseEligibility(word);
  w.renderLearnDetail(item);
  assert.equal(w.document.querySelector('.learn-contrast'),null, `${id}: filtered comparison`);
  assert.equal(w.document.querySelector('.learn-continue').textContent,'Try a new sentence');
  assert.ok(!new RegExp('\\b'+paired+'\\b','i').test(w.lastAudioText), `${id}: audio excludes paired word`);
}
w.isLearnWordEligible=baseEligibility;
w.gradeBand='6-8';w.vocabLevel='standard';w.studyMode='prefixes';w.learnMode='sort';w.renderLearnActivity();
assert.equal(w.document.querySelector('[data-sort-card]'),null,'specialist sort hidden from Standard');
w.document.getElementById('learnExploreEmpty').click();
assert.equal(w.learnMode,'explore');
w.renderLearnDetail(w.prefixes.find(i=>i.id==='retro'));
assert.equal(w.document.querySelector('.learn-worked-example'),null);
assert.match(w.document.getElementById('learnDetailPanel').textContent,/Standard \+ Stretch/);
w.gradeBand='all';w.vocabLevel='all';
w.studyMode='prefixes';w.learnMode='sort';w.renderLearnActivity();
assert.ok(w.document.querySelector('[data-sort-card]'), 'existing prefix sorting remains available');
for (const card of w.document.querySelectorAll('[data-sort-card]')) assert.ok(!w.FirstVoloInstructionalProtection.isProtected(card.textContent.trim()));
w.vocabLevel='challenge';w.studyMode='roots';w.learnMode='sort';w.renderLearnActivity();
assert.match(w.learnSortWorkspace.textContent,/No Sort It rounds/);
w.learnMode='explore';w.renderLearnActivity();w.renderLearnDetail(w.roots.find(i=>i.id==='tele'));
assert.equal(w.document.querySelector('.learn-worked-example'),null,'lesson cannot bypass selected vocabulary');
assert.ok(html.indexOf('learn-content.js')<html.indexOf('<script src="script.js'));
assert.equal(w.document.querySelectorAll('[onclick]').length,0);
console.log(`PASS: ${roundsTested} complete sorting rounds, ${Object.keys(w.FirstVoloLearnContent.worked).length} worked families, ${applicationsTested} two-step lessons, retry/completion/navigation, audio text, reserved secondary lesson exclusion, empty filters, focus and CSP-compatible handlers.`);
w.close();
