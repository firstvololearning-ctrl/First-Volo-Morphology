'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<button id="source">Arcade</button>', {
  runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost'
});
const w = dom.window;
const d = w.document;
w.matchMedia = () => ({ matches: true });
w.Math.random = () => .999;
let frame;
w.requestAnimationFrame = callback => { frame = callback; return 1; };
w.cancelAnimationFrame = () => { frame = null; };
for (const file of [
  'word-inventory.js', 'token-sets.js', 'instructional-protection-registry.js',
  'reward-registry.js', 'reward-word-choices.js', 'reward-hoops.js', 'reward-jump.js'
]) w.eval(fs.readFileSync(file, 'utf8'));

const rewards = w.FirstVoloRewardRegistry.definitions;
const questions = w.FirstVoloGameQuestions;
const $ = selector => d.querySelector(selector);
const source = $('#source');
const buildDeck = questions.deck;
for (const reward of rewards) {
  const deck = buildDeck(reward);
  assert.equal(deck.length, 5);
  assert(deck.some(question => question.explanations));
  for (const question of deck) {
    assert(question.choices.includes(question.answer));
    if (question.explanations) {
      assert(question.parts.every(part => reward.eligibleContent.morphemeIds.includes(part)));
      assert(question.choices.every(word => !w.FirstVoloInstructionalProtection.isProtected(word)));
    }
  }
}
const prefixReward = rewards.find(reward => reward.id === 'prefix-meaning-flight');
const prefixes = buildDeck(prefixReward);
assert(prefixes.some(question => question.answer === 'impolite'));
const contrast = prefixes.find(question => question.answer === 'invisible');
assert(contrast);

questions.deck = () => [contrast];
const choice = word => [...d.querySelectorAll('.hoops-choice')].find(button => button.textContent === word);
w.FirstVoloHoops.open(prefixReward, source);
choice('insert').click();
$('.hoops-shoot').click();
assert.match($('.hoops-feedback').textContent, /into a place/);
assert.equal(frame, undefined);
choice('invisible').click();
$('.hoops-assist').click();
$('.hoops-shoot').click();
frame(w.performance.now() + 200);
assert.equal($('.hoops-score').textContent, '2 points');
$('.hoops-close').click();

w.FirstVoloHoops.open(prefixReward, source, { mode: 'toss' });
assert.equal($('.toss-balloon').parentElement.tagName.toLowerCase(), 'g');
choice('invisible').click();
$('.hoops-shoot').click();
frame(w.performance.now() + 200);
assert($('.toss-target.is-popped'));
assert.match($('.hoops-feedback').textContent, /Splash!.*not able to be seen/);
$('.hoops-close').click();

const core = buildDeck(rewards[0]).find(question => question.answer === 'jumped');
assert(core);
questions.deck = () => [core];
w.FirstVoloWordJump.open(rewards[0], source);
const course = $('.jump-course');
const key = (type, name, code = name) =>
  course.dispatchEvent(new w.KeyboardEvent(type, { key: name, code, bubbles: true }));
let now = 0;
function step(count) {
  for (let i = 0; i < count; i++) frame(now += 20);
}
key('keydown', 'ArrowRight');
step(33);
key('keyup', 'ArrowRight');
assert.equal($('.jump-score').textContent, '0 collected', 'walking below a tile does not collect it');
key('keydown', ' ', 'Space');
step(25);
assert.equal($('.jump-score').textContent, '1 collected');
assert($('.jump-tile.is-collected'));
$('.jump-next').click();
assert.match($('.jump-prompt').textContent, /Course complete/);
$('.jump-close').click();
assert.equal(frame, null);
assert.equal(d.activeElement, source);
assert.equal(w.localStorage.length, 0);
w.close();
console.log('PASS: eligible, unprotected word rounds, basketball meaning feedback, balloon splash, physical jump collection, and session-only scores');
