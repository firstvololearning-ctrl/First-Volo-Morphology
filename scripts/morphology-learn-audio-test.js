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

w.eval(source.slice(source.indexOf('function speak(text)'), source.indexOf('function hideAllPanels()')));
const calls=[];
w.FirstVoloInstructionalAudio={available:()=>true,speak:text=>calls.push({text}),speakWithControlledMorphemes:(text,parts)=>calls.push({text,parts}),stop:()=>calls.push({stop:true})};
w.studyMode='roots';w.gradeBand='4-5';w.vocabLevel='standard';w.renderSortItActivity();
const doc=w.document;
doc.querySelector('.sort-audio-instructions .audio-button').click();assert.match(calls.at(-1).text,/Earth or writing/);
doc.querySelector('[data-sort-audio-target="geo"] .audio-button').click();assert.match(calls.at(-1).text,/geo means earth/);assert.equal(calls.at(-1).parts[0].id,'geo');
const card=doc.querySelector('[data-sort-card="earth-writing-geology"]');
doc.querySelector('[data-sort-audio-card="earth-writing-geology"] .audio-button').click();assert.match(calls.at(-1).text,/geology.*Geology is the study/s);assert.equal(card.getAttribute('aria-pressed'),'false');assert.equal(card.hidden,false);
card.click();doc.querySelector('[data-sort-target="graph"]').click();doc.querySelector('.sort-audio-feedback').click();assert.match(calls.at(-1).text,/Try the earth group/);
doc.querySelector('[data-sort-target="geo"]').click();assert.equal(card.closest('.sort-word-option').hidden,true);
doc.querySelector('.sort-audio-stop').click();assert.equal(calls.at(-1).stop,true);
assert.equal(doc.querySelectorAll('button button').length,0);
w.FirstVoloInstructionalAudio={available:()=>false};w.renderSortItActivity();assert.ok([...doc.querySelectorAll('.audio-button,.sort-audio-feedback,.sort-audio-stop')].every(b=>b.disabled));
console.log('PASS: instruction/meaning/word/sentence/feedback playback routing, controlled descriptors, no answer submission when listening, hidden placed controls, stop, unavailable state, no nested buttons.');
