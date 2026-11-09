'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');

for (const mode of ['student', 'educator', 'educator-selected']) {
  const dom = new JSDOM('<button id="openMyGames">Open games</button>', {
    runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost'
  });
  const w = dom.window;
  if (!w.HTMLDialogElement.prototype.showModal) {
    w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
    w.HTMLDialogElement.prototype.close = function () {
      this.open = false;
      this.dispatchEvent(new w.Event('close'));
    };
  }
  w.FirstVoloMorphologyAccess = { getContext: () => ({ mode }) };
  w.FirstVoloActivityProgress = { getActiveStudent: () => null };
  for (const f of ['word-inventory.js', 'token-sets.js', 'reward-registry.js', 'reward-word-choices.js',
    'reward-hoops.js', 'reward-jump.js', 'reward-maze.js', 'reward-memory.js', 'reward-config-games.js', 'reward-games.js']) {
    w.eval(fs.readFileSync(f, 'utf8'));
  }

  w.document.querySelector('#openMyGames').click();
  const buttons = [...w.document.querySelectorAll('.reward-my-game button')];
  if (mode === 'student') {
    assert.equal(buttons.length, 9);
    assert.ok(buttons.every(b => b.disabled && b.textContent === 'Locked'));
  } else {
    for (const label of ['Preview hoops', 'Preview word jump', 'Preview word maze', 'Preview balloon pop', 'Preview Memory Match']) {
      assert.equal(buttons.filter(b => b.textContent === label && !b.disabled).length, 9);
    }
    assert.equal(buttons.filter(b => /^Preview (Cloud Catch|Cloud Builder|Meaning Flight)$/.test(b.textContent)).length, 9);
    const cloud = buttons.find(b => b.textContent === 'Preview Cloud Catch');
    cloud.click();
    assert.ok(w.document.querySelector('.reward-game-overlay:not([hidden]) .reward-sky-field'));
    assert.equal(w.document.querySelector('.reward-game-overlay:not([hidden]) .reward-start-button'), null);
    w.document.querySelector('.reward-game-exit').click();
    assert.equal(w.document.activeElement, cloud);

    const registry = w.FirstVoloRewardRegistry;
    for (const reward of registry.definitions) {
      const pairs = w.FirstVoloMemoryMatch.makePairs(reward);
      assert.equal(pairs.length, 4);
      assert.equal(new Set(pairs.map(pair => pair.label)).size, 4);
      assert.equal(new Set(pairs.map(pair => pair.meaning)).size, 4);
      assert.ok(pairs.every(pair => reward.eligibleContent.morphemeIds.includes(pair.id)));
    }

    const memory = buttons.find(b => b.textContent === 'Preview Memory Match');
    memory.click();
    const dialog = w.document.querySelector('.reward-memory');
    assert.ok(dialog.open);
    const cards = [...dialog.querySelectorAll('.memory-card')];
    assert.equal(cards.length, 8);
    const wordCards = cards.filter(card => card.dataset.kind === 'Word part');
    wordCards[0].click();
    wordCards[1].click();
    assert.equal(dialog.querySelector('.memory-continue').hidden, false);
    dialog.querySelector('.memory-continue').click();
    assert.ok(wordCards.every(card => card.textContent === 'Word part'));
    wordCards[0].click();
    const wordPart = wordCards[0].textContent;
    const matchMeaning = registry.meaningSense(registry.definitions[0].eligibleContent.morphemeIds
      .find(id => registry.promptLabel(id) === wordPart));
    for (const card of cards.filter(card => card.dataset.kind === 'Meaning')) {
      card.click();
      if (card.textContent === matchMeaning) break;
      dialog.querySelector('.memory-continue').click();
      wordCards[0].click();
    }
    assert.equal(dialog.querySelector('.memory-count').textContent, '1 of 4 pairs');
    dialog.querySelector('.memory-close').click();
    assert.equal(dialog.open, false);
  }
  assert.ok(w.FirstVoloRewardRegistry.definitions.every(r => !w.FirstVoloRewards.isUnlocked(r, null)));
  assert.equal(w.localStorage.length, 0);
  dom.window.close();
}

console.log('PASS: game previews launch directly, Memory Match stays within reward scope, student locks and saved data unchanged');
