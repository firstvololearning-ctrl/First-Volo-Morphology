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
  'reward-registry.js', 'reward-word-choices.js', 'reward-hoops.js', 'reward-jump.js', 'reward-maze.js'
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
let seed = 20261108;
w.Math.random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2 ** 32;
};
const directAnswers = new Set();
const wordAnswers = new Set();
for (const reward of rewards) {
  for (let replay = 0; replay < 1500; replay++) {
    for (const question of buildDeck(reward)) {
      (question.explanations ? wordAnswers : directAnswers).add(question.answer);
    }
  }
}
const assignedParts = new Set(w.FIRST_VOLO_TOKEN_SETS.flatMap(set => set.morphemeIds));
assert.deepEqual(directAnswers, assignedParts, 'all assigned parts are reachable in dealt rounds');
assert.equal(wordAnswers.size, 15);
w.Math.random = () => .999;

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
const range = $('.hoops-court');
range.querySelector('svg').getBoundingClientRect = () => ({ left: 0, top: 0, width: 1000, height: 540 });
function pullBalloonShot(endX) {
  for (const [type, clientX, clientY] of [
    ['pointerdown', 500, 440], ['pointermove', endX, 510], ['pointerup', endX, 510]
  ]) {
    const event = new w.MouseEvent(type, { clientX, clientY, bubbles: true, cancelable: true });
    range.dispatchEvent(event);
  }
  frame(w.performance.now() + 200);
}
pullBalloonShot(448);
assert($('.toss-target.is-bumped'), 'pulling left hits the right balloon');
assert.equal($('.hoops-score').textContent, '0 points');
assert.match($('.hoops-feedback').textContent, /into a place/);
pullBalloonShot(552);
assert.equal(d.querySelectorAll('.toss-target.is-popped').length, 1);
assert.equal($('.toss-target.is-popped text').textContent, 'invisible');
const impactY = Number($('.hoops-ball').getAttribute('transform').match(/translate\([^ ]+ ([^)]+)/)[1]);
assert(impactY > 185, 'the shot stops on the upward approach to the balloon');
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
step(5);
key('keyup', 'ArrowRight');
const volo = $('.jump-volo');
const beforeRun = parseFloat(volo.style.left);
$('.jump-run').click();
step(14);
assert(parseFloat(volo.style.left) > beforeRun, 'Run continues moving without a held direction');
assert(volo.classList.contains('is-running'));
$('.jump-run').click();
const pausedAt = volo.style.left;
step(4);
assert.equal(volo.style.left, pausedAt, 'Pause run stops horizontal movement');
$('.jump-run').click();
step(14);
assert.equal($('.jump-score').textContent, '0 collected', 'walking below a tile does not collect it');
key('keydown', ' ', 'Space');
step(25);
assert.equal($('.jump-score').textContent, '1 collected');
assert.equal($('.jump-run').getAttribute('aria-pressed'), 'false');
assert($('.jump-tile.is-caught-in-air'));
assert.match($('.jump-feedback').textContent, /Caught!/);
assert($('.jump-next').hidden, 'the next round waits for Volo to land');
step(30);
assert.equal(volo.style.top, `${100 * 260 / 300}%`);
assert.equal($('.jump-next').hidden, false);
$('.jump-next').click();
assert.match($('.jump-prompt').textContent, /Course complete/);
$('.jump-close').click();
assert.equal(frame, null);
assert.equal(d.activeElement, source);
let mazeTick;
w.setInterval = callback => { mazeTick = callback; return 1; };
w.clearInterval = () => { mazeTick = undefined; };
w.FirstVoloWordMaze.open(rewards[0], source);
const board = $('.maze-board');
const mazeKey = name => board.dispatchEvent(new w.KeyboardEvent('keydown', { key: name, bubbles: true }));
const mazePosition = () => {
  const player = $('.maze-volo');
  const column = Math.floor(parseFloat(player.style.left) * 15 / 100);
  const row = Math.floor(parseFloat(player.style.top) * 9 / 100);
  return row * 15 + column;
};
const startCell = mazePosition();
mazeKey('ArrowUp');
assert.equal(mazePosition(), startCell, 'walls stop movement');
mazeKey('ArrowRight');
assert.equal(mazePosition(), startCell + 1);
mazeKey('ArrowUp');
mazeTick();
mazeTick();
assert.equal(mazePosition(), startCell + 3, 'a single arrow press keeps Volo moving');
mazeTick();
assert.equal(mazePosition(), startCell + 3 - 15, 'an early turn is taken at the next opening');
$('.maze-pause').click();
assert.equal(mazeTick, undefined);
assert.deepEqual([...d.querySelectorAll('.maze-token')].map(token => token.textContent), ['jumped', 'jumping']);

const moves = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
function pathTo(start, end) {
  const queue = [[start, []]];
  const seen = new Set([start]);
  while (queue.length) {
    const [cell, path] = queue.shift();
    if (cell === end) return path;
    const column = cell % 15;
    const row = Math.floor(cell / 15);
    for (const [key, [dx, dy]] of Object.entries(moves)) {
      const next = (row + dy) * 15 + column + dx;
      if (seen.has(next) || !board.children[next]?.classList.contains('maze-path')) continue;
      queue.push([next, [...path, key]]);
      seen.add(next);
    }
  }
  return null;
}
const cellIndex = cell => [...board.children].indexOf(cell);
const origin = mazePosition();
const endpoints = [16, 28, 118];
assert(endpoints.every(cell => pathTo(origin, cell)), 'every endpoint is reachable');
function follow(path) {
  for (const direction of path) {
    const wasMoving = Boolean(mazeTick);
    mazeKey(direction);
    if (wasMoving) mazeTick();
  }
}
const wrongCell = cellIndex($('.maze-token[data-color="1"]').parentElement);
follow(pathTo(origin, wrongCell));
assert.match($('.maze-feedback').textContent, /Try another tile/);
assert.equal($('.maze-score').textContent, '0 collected');
const rightCell = cellIndex($('.maze-token[data-color="0"]').parentElement);
follow(pathTo(wrongCell, rightCell));
assert.equal($('.maze-score').textContent, '1 collected');
$('.maze-next').click();
assert.match($('.maze-prompt').textContent, /Maze complete/);
$('.maze-close').click();
assert.equal(d.activeElement, source);
assert.equal(w.localStorage.length, 0);
w.close();
console.log('PASS: eligible, unprotected word rounds, basketball meaning feedback, balloon splash, physical jump collection, maze walls and collection, all 95 parts, 15 word rounds, and session-only scores');
