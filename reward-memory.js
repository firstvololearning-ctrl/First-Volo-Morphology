/* Optional memory game using each reward's eligible word parts. */
(function () {
  'use strict';

  const registry = window.FirstVoloRewardRegistry;
  const { shuffled } = window.FirstVoloGameQuestions;

  function makePairs(reward) {
    const eligible = reward.eligibleContent.morphemeIds;
    const focus = new Set(window.FIRST_VOLO_TOKEN_SETS.find(set => set.id === reward.unlockToken)?.morphemeIds);
    const ordered = [...shuffled(eligible.filter(id => focus.has(id))), ...shuffled(eligible.filter(id => !focus.has(id)))];
    const usedLabels = new Set();
    const usedMeanings = new Set();
    const pairs = [];
    for (const id of ordered) {
      const label = registry.promptLabel(id);
      const meaning = registry.meaningSense(id);
      if (usedLabels.has(label) || usedMeanings.has(meaning)) continue;
      usedLabels.add(label);
      usedMeanings.add(meaning);
      pairs.push({ id, label, meaning });
      if (pairs.length === 4) break;
    }
    return pairs;
  }

  function open(reward, source) {
    const dialog = document.createElement('dialog');
    dialog.className = 'hoops reward-memory';
    dialog.setAttribute('aria-labelledby', 'rewardMemoryTitle');
    dialog.innerHTML = `
      <header>
        <div><small>WORD-PART ARCADE</small><h2 id="rewardMemoryTitle">Memory Match</h2></div>
        <button type="button" class="memory-close">Close</button>
      </header>
      <p class="hoops-help">Flip a word-part card and a meaning card. Find the meaning or job that matches each part.</p>
      <div class="hoops-hud"><span class="memory-count"></span><span class="memory-turns"></span></div>
      <div class="memory-board" aria-label="Memory cards"></div>
      <p class="hoops-feedback memory-feedback" role="status"></p>
      <div class="hoops-controls">
        <button type="button" class="memory-continue" hidden>Turn cards back over</button>
        <button type="button" class="memory-reset">Shuffle and play again</button>
      </div>`;
    const find = selector => dialog.querySelector(selector);
    const board = find('.memory-board');
    const feedback = find('.memory-feedback');
    const next = find('.memory-continue');
    const close = find('.memory-close');
    let openCards = [];
    let matched = 0;
    let turns = 0;
    let pairCount = 0;

    function updateScore() {
      find('.memory-count').textContent = `${matched} of ${pairCount} pairs`;
      find('.memory-turns').textContent = `Turns: ${turns}`;
    }

    function showCard(card, faceUp) {
      const { kind, text, button } = card;
      button.textContent = faceUp ? text : kind;
      button.setAttribute('aria-label', faceUp ? `${kind}: ${text}` : card.coverLabel);
      button.setAttribute('aria-pressed', String(faceUp));
    }

    function turn(card) {
      if (openCards.length === 2 || openCards.includes(card) || card.button.disabled) return;
      showCard(card, true);
      openCards.push(card);
      if (openCards.length === 1) {
        feedback.textContent = `You found ${card.text}. Turn over a ${card.kind === 'Word part' ? 'meaning' : 'word-part'} card.`;
        return;
      }

      turns += 1;
      const [first, second] = openCards;
      if (first.id === second.id) {
        const part = first.kind === 'Word part' ? first : second;
        const meaning = part === first ? second : first;
        feedback.textContent = `Match! ${part.text} means “${meaning.text}”.`;
        matched += 1;
        for (const card of openCards) {
          card.button.classList.add('is-matched');
          card.button.disabled = true;
        }
        openCards = [];
        if (matched === pairCount) {
          feedback.textContent += ` You found every pair in ${turns} turns!`;
          find('.memory-reset').focus();
        } else {
          board.querySelector('button:not(:disabled)').focus();
        }
      } else {
        feedback.textContent = `${first.text} and ${second.text} are different cards. Look at both before turning them back over.`;
        next.hidden = false;
        next.focus();
      }
      updateScore();
    }

    function reset() {
      const pairs = makePairs(reward);
      pairCount = pairs.length;
      openCards = [];
      turns = 0;
      matched = 0;
      next.hidden = true;
      board.replaceChildren();
      feedback.textContent = 'Choose any card to start.';
      const cards = shuffled(pairs.flatMap(({ id, label, meaning }) => [
        { id, kind: 'Word part', text: label },
        { id, kind: 'Meaning', text: meaning }
      ]));
      cards.forEach((card, index) => {
        card.button = document.createElement('button');
        card.button.type = 'button';
        card.button.className = 'memory-card';
        card.button.dataset.kind = card.kind;
        card.coverLabel = `Card ${index + 1}, ${card.kind.toLowerCase()}, face down`;
        showCard(card, false);
        card.button.addEventListener('click', () => turn(card));
        board.append(card.button);
      });
      updateScore();
    }

    next.addEventListener('click', () => {
      const first = openCards[0];
      openCards.forEach(card => showCard(card, false));
      openCards = [];
      next.hidden = true;
      feedback.textContent = 'Try another pair.';
      first.button.focus();
    });
    find('.memory-reset').addEventListener('click', () => {
      reset();
      board.firstElementChild?.focus();
    });
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      dialog.remove();
      source?.focus();
    });
    document.body.append(dialog);
    reset();
    dialog.showModal();
  }

  window.FirstVoloMemoryMatch = { open, makePairs };
})();
