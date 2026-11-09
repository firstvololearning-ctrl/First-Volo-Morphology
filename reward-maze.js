/* Optional maze play with word choices shared by the arcade. */
(function () {
  'use strict';

  const questions = window.FirstVoloGameQuestions;
  const map = [
    '###############',
    '#.....#.......#',
    '#.###.#.###.#.#',
    '#.#...#...#.#.#',
    '#.#.#####.#.#.#',
    '#.........#...#',
    '#.###.#.###.#.#',
    '#.......#.....#',
    '###############'
  ];
  const directions = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
  const endpoints = [[1, 1], [13, 1], [13, 7]];

  function open(reward, source) {
    const deck = questions.deck(reward);
    if (!deck.length) return;

    const overlay = document.createElement('div');
    overlay.className = 'hoops-overlay word-maze-overlay';
    overlay.innerHTML = `
      <section class="hoops word-maze" role="dialog" aria-modal="true" aria-labelledby="wordMazeTitle">
        <header><div><small>WORD-PART ARCADE</small><h2 id="wordMazeTitle">Volo’s Word Maze</h2></div>
          <button type="button" class="maze-close">Close</button></header>
        <div class="hoops-hud"><span class="maze-round"></span><span class="maze-score">0 collected</span></div>
        <p class="hoops-prompt maze-prompt"></p>
        <div class="maze-legend" aria-label="Tokens and words"></div>
        <div class="maze-board" tabindex="0" aria-label="Maze. Use the arrow keys to steer Volo toward the matching token."></div>
        <div class="maze-controls" aria-label="Movement controls">
          <button type="button" data-direction="ArrowLeft" aria-label="Move left">←</button>
          <button type="button" data-direction="ArrowUp" aria-label="Move up">↑</button>
          <button type="button" data-direction="ArrowDown" aria-label="Move down">↓</button>
          <button type="button" data-direction="ArrowRight" aria-label="Move right">→</button>
          <button type="button" class="maze-next" hidden>Next round</button>
        </div>
        <p class="hoops-feedback maze-feedback" role="status"></p>
        <details class="jump-alternate maze-alternate">
          <summary>Choose without moving</summary><div class="jump-answers maze-answers" aria-label="Answer choices"></div>
        </details>
        <p class="hoops-help">Find the letter next to the answer, then steer Volo to that token. Use the arrow keys or hold a direction button. No timer.</p>
      </section>`;
    document.body.append(overlay);
    const find = selector => overlay.querySelector(selector);
    const board = find('.maze-board');
    const legend = find('.maze-legend');
    const next = find('.maze-next');
    const feedback = find('.maze-feedback');
    const answers = find('.maze-answers');
    const player = document.createElement('img');
    player.src = 'images/volo/volo-sky-catch.png';
    player.alt = '';
    player.className = 'maze-volo';

    const cells = map.map(row => [...row].map(symbol => {
      const cell = document.createElement('div');
      cell.className = symbol === '#' ? 'maze-wall' : 'maze-path';
      board.append(cell);
      return cell;
    }));
    let round = 0;
    let collected = 0;
    let complete = false;
    let repeat;
    let x;
    let y;
    let choices = [];

    function stopRepeat() { clearInterval(repeat); }

    function choose(choice) {
      if (complete || choice.used) return;
      const question = deck[round];
      choice.used = true;
      choice.token.remove();
      choice.button.disabled = true;
      if (choice.id === question.answer) {
        complete = true;
        stopRepeat();
        collected++;
        cells[choice.y][choice.x].classList.add('is-collected');
        find('.maze-score').textContent = `${collected} collected`;
        feedback.textContent = `Collected! ${questions.explain(question, choice.id)}`;
        next.textContent = round + 1 === deck.length ? 'See results' : 'Next round';
        next.hidden = false;
        next.focus();
      } else {
        choice.legendItem.classList.add('is-passed');
        feedback.textContent = `${questions.explain(question, choice.id)} Try another token.`;
        if (document.activeElement === choice.button) choices.find(item => !item.used)?.button.focus();
      }
    }

    function move(direction) {
      if (complete) return;
      const [dx, dy] = directions[direction];
      const nextX = x + dx;
      const nextY = y + dy;
      if (map[nextY]?.[nextX] !== '.') return;
      x = nextX;
      y = nextY;
      cells[y][x].classList.add('is-visited');
      cells[y][x].append(player);
      const choice = choices.find(item => !item.used && item.x === x && item.y === y);
      if (choice) choose(choice);
    }

    function render() {
      const question = deck[round];
      complete = false;
      x = 6;
      y = 5;
      next.hidden = true;
      find('.maze-round').textContent = `Round ${round + 1} of ${deck.length}`;
      find('.maze-prompt').textContent = question.prompt;
      feedback.textContent = 'Follow the maze to the matching token.';
      legend.replaceChildren();
      answers.replaceChildren();
      for (const row of cells) for (const cell of row) {
        cell.replaceChildren();
        cell.classList.remove('is-visited', 'is-collected');
      }
      cells[y][x].classList.add('is-visited');
      cells[y][x].append(player);
      const positions = questions.shuffled(endpoints);
      choices = questions.shuffled(question.choices).map((id, index) => {
        const [column, row] = positions[index];
        const letter = 'ABC'[index];
        const token = document.createElement('span');
        const legendItem = document.createElement('span');
        const button = document.createElement('button');
        token.className = 'maze-token';
        token.dataset.marker = letter;
        token.textContent = letter;
        legendItem.className = 'maze-legend-item';
        legendItem.dataset.marker = letter;
        legendItem.textContent = `${letter} · ${questions.label(question, id)}`;
        button.type = 'button';
        button.textContent = legendItem.textContent;
        const choice = { id, x: column, y: row, token, legendItem, button, used: false };
        button.addEventListener('click', () => choose(choice));
        cells[row][column].append(token);
        legend.append(legendItem);
        answers.append(button);
        return choice;
      });
    }

    function close() {
      stopRepeat();
      window.removeEventListener('blur', stopRepeat);
      overlay.remove();
      source?.focus();
    }

    window.addEventListener('blur', stopRepeat);
    for (const button of overlay.querySelectorAll('[data-direction]')) {
      const direction = button.dataset.direction;
      button.addEventListener('pointerdown', event => {
        stopRepeat();
        button.setPointerCapture?.(event.pointerId);
        move(direction);
        if (!complete) repeat = setInterval(() => move(direction), 125);
      });
      for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
        button.addEventListener(event, stopRepeat);
      }
      button.addEventListener('click', event => { if (event.detail === 0) move(direction); });
    }
    overlay.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
      } else if (Object.hasOwn(directions, event.key)) {
        event.preventDefault();
        move(event.key);
      } else if (event.key === 'Tab') {
        const focusable = [...overlay.querySelectorAll('button:not([disabled]), summary, [tabindex="0"]')]
          .filter(node => !node.closest('[hidden]') && (!node.closest('details:not([open])') || node.matches('summary')));
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    find('.maze-close').addEventListener('click', close);
    next.addEventListener('click', () => {
      if (round === deck.length) {
        close();
        open(reward, source);
      } else if (++round < deck.length) {
        render();
        board.focus();
      } else {
        find('.maze-alternate')?.setAttribute('hidden', '');
        legend.replaceChildren();
        answers.replaceChildren();
        find('.maze-prompt').textContent = `Maze complete! You collected ${collected} of ${deck.length}.`;
        feedback.textContent = '';
        next.textContent = 'Play again';
      }
    });
    render();
    board.focus();
  }

  window.FirstVoloWordMaze = { open };
})();
