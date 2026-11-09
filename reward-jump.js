/* Untimed platform play for optional word practice. */
(function () {
  'use strict';

  const questions = window.FirstVoloGameQuestions;
  const width = 720;
  const floor = 260;

  function open(reward, source) {
    const deck = questions.deck(reward);
    if (!deck.length) return;

    const overlay = document.createElement('div');
    overlay.className = 'hoops-overlay word-jump-overlay';
    overlay.innerHTML = `
      <section class="hoops word-jump" role="dialog" aria-modal="true" aria-labelledby="wordJumpTitle">
        <header><div><small>WORD-PART ARCADE</small><h2 id="wordJumpTitle">Volo’s Word Jump</h2></div>
          <button type="button" class="jump-close">Close</button></header>
        <div class="hoops-hud"><span class="jump-round"></span><span class="jump-score">0 collected</span></div>
        <p class="hoops-prompt jump-prompt"></p>
        <div class="jump-course" tabindex="0" aria-label="Platform course. Move with left and right arrows. Press Space or Up to jump.">
          <div class="jump-hills" aria-hidden="true"></div>
          <div class="jump-tiles" aria-hidden="true"></div>
          <img class="jump-volo" src="images/volo/volo-sky-catch.png" alt="">
        </div>
        <div class="jump-controls" aria-label="Movement controls">
          <button type="button" class="jump-left" aria-label="Move left">←</button>
          <button type="button" class="jump-right" aria-label="Move right">→</button>
          <button type="button" class="jump-run" aria-pressed="false">Run</button>
          <button type="button" class="jump-up">Jump ↑</button>
          <button type="button" class="jump-next" hidden>Next round</button>
        </div>
        <p class="hoops-feedback jump-feedback" role="status"></p>
        <details class="jump-alternate">
          <summary>Choose without jumping</summary><div class="jump-answers" aria-label="Answer choices"></div>
        </details>
        <p class="hoops-help">Press Run to keep Volo moving, then jump to catch the matching tile. Use the arrow keys or direction buttons to steer. Space or Up jumps on the course.</p>
      </section>`;
    document.body.append(overlay);
    const find = selector => overlay.querySelector(selector);
    const player = find('.jump-volo');
    const course = find('.jump-course');
    const next = find('.jump-next');
    const runButton = find('.jump-run');
    const feedback = find('.jump-feedback');
    const tiles = find('.jump-tiles');
    const answers = find('.jump-answers');
    const held = new Set();
    let round = 0;
    let collected = 0;
    let finished = false;
    let x = 60;
    let y = floor;
    let velocity = 0;
    let running = false;
    let facing = 1;
    let frame;
    let lastTime;
    let choices = [];

    function positionPlayer() {
      player.style.left = `${100 * x / width}%`;
      player.style.top = `${100 * y / 300}%`;
    }

    function setRunning(active) {
      running = active;
      runButton.setAttribute('aria-pressed', String(active));
      runButton.textContent = active ? 'Pause run' : 'Run';
      if (!active) player.classList.remove('is-running');
    }

    function choose(choice, caughtInAir = false) {
      if (finished || choice.used) return;
      const question = deck[round];
      choice.used = true;
      choice.button.disabled = true;
      if (choice.id === question.answer) {
        finished = true;
        held.clear();
        setRunning(false);
        runButton.disabled = true;
        collected++;
        find('.jump-score').textContent = `${collected} collected`;
        choice.tile.classList.add('is-collected');
        if (caughtInAir) {
          choice.tile.style.setProperty('--catch-x', `${(x - choice.center) * course.clientWidth / width}px`);
          choice.tile.style.setProperty('--catch-y', `${(y - 22 - 132) * course.clientHeight / 300}px`);
          choice.tile.classList.add('is-caught-in-air');
        }
        feedback.textContent = `${caughtInAir ? 'Caught!' : 'Collected!'} ${questions.explain(question, choice.id)}`;
        next.textContent = round + 1 === deck.length ? 'See results' : 'Next round';
        if (!caughtInAir) {
          next.hidden = false;
          next.focus();
        }
      } else {
        choice.tile.classList.add('is-passed');
        feedback.textContent = `${questions.explain(question, choice.id)} Try another.`;
        if (document.activeElement === choice.button) {
          choices.find(item => !item.used)?.button.focus();
        }
      }
    }

    function render() {
      const question = deck[round];
      finished = false;
      held.clear();
      setRunning(false);
      runButton.disabled = false;
      facing = 1;
      player.style.setProperty('--facing', facing);
      x = 60;
      y = floor;
      velocity = 0;
      positionPlayer();
      next.hidden = true;
      find('.jump-round').textContent = `Round ${round + 1} of ${deck.length}`;
      find('.jump-prompt').textContent = question.prompt;
      feedback.textContent = 'Jump to catch the matching word or word part.';
      tiles.replaceChildren();
      answers.replaceChildren();
      choices = questions.shuffled(question.choices).map((id, index, list) => {
        const tile = document.createElement('span');
        const button = document.createElement('button');
        const center = list.length === 2 ? 220 + index * 280 : 170 + index * 200;
        tile.className = 'jump-tile';
        tile.style.left = `${100 * center / width}%`;
        tile.textContent = questions.label(question, id);
        button.type = 'button';
        button.textContent = tile.textContent;
        const choice = { id, center, tile, button, used: false };
        button.addEventListener('click', () => choose(choice));
        tiles.append(tile);
        answers.append(button);
        return choice;
      });
    }

    function animate(now) {
      const dt = Math.min(.04, (now - (lastTime ?? now)) / 1000);
      lastTime = now;
      const previousX = x;
      if (!finished) {
        const steering = Number(held.has('right')) - Number(held.has('left'));
        if (steering && steering !== facing) {
          facing = steering;
          player.style.setProperty('--facing', facing);
        }
        const direction = held.size ? steering : running ? facing : 0;
        x = Math.max(26, Math.min(width - 26, x + direction * 250 * dt));
        const reachedEdge = (direction < 0 && x === 26) || (direction > 0 && x === width - 26);
        if (running && reachedEdge) setRunning(false);
      }
      if (y < floor || velocity < 0) {
        velocity += 1200 * dt;
        y = Math.min(floor, y + velocity * dt);
        if (y === floor) velocity = 0;
      }
      positionPlayer();
      player.classList.toggle('is-running', x !== previousX && y === floor);
      if (!finished) {
        const hit = choices.find(choice => !choice.used &&
          Math.abs(choice.center - x) < 68 && Math.abs(132 - (y - 22)) < 24);
        if (hit) choose(hit, true);
      } else if (y === floor && next.hidden) {
        next.hidden = false;
        next.focus();
      }
      frame = requestAnimationFrame(animate);
    }

    function jump() {
      if (!finished && y === floor && velocity === 0) velocity = -500;
    }

    function close() {
      cancelAnimationFrame(frame);
      window.removeEventListener('blur', release);
      overlay.remove();
      source?.focus();
    }

    function release() {
      held.clear();
      setRunning(false);
    }
    window.addEventListener('blur', release);
    overlay.addEventListener('focusout', event => {
      if (!overlay.contains(event.relatedTarget)) release();
    });
    const movement = { ArrowLeft: 'left', ArrowRight: 'right' };
    overlay.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
      } else if (movement[event.key]) {
        event.preventDefault();
        held.add(movement[event.key]);
      } else if (event.key === 'ArrowUp' || (event.code === 'Space' && event.target === course)) {
        event.preventDefault();
        jump();
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
    overlay.addEventListener('keyup', event => held.delete(movement[event.key]));

    for (const direction of ['left', 'right']) {
      const button = find(`.jump-${direction}`);
      button.addEventListener('pointerdown', event => {
        held.add(direction);
        button.setPointerCapture?.(event.pointerId);
      });
      for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
        button.addEventListener(event, () => held.delete(direction));
      }
      button.addEventListener('click', event => {
        if (!finished && event.detail === 0) {
          facing = direction === 'left' ? -1 : 1;
          player.style.setProperty('--facing', facing);
          x = Math.max(26, Math.min(width - 26, x + facing * 36));
          positionPlayer();
        }
      });
    }
    runButton.addEventListener('click', () => {
      setRunning(!running);
      if (running) course.focus({ preventScroll: true });
    });
    find('.jump-up').addEventListener('click', jump);
    find('.jump-close').addEventListener('click', close);
    next.addEventListener('click', () => {
      if (++round < deck.length) {
        render();
        course.focus();
        return;
      }
      tiles.replaceChildren();
      answers.replaceChildren();
      find('.jump-alternate').hidden = true;
      find('.jump-prompt').textContent = `Course complete! You collected ${collected} of ${deck.length}.`;
      feedback.textContent = '';
      next.textContent = 'Play again';
      next.replaceWith(next.cloneNode(true));
      find('.jump-next').addEventListener('click', () => {
        close();
        open(reward, source);
      });
      find('.jump-next').focus();
    });

    render();
    frame = requestAnimationFrame(animate);
    course.focus();
  }

  window.FirstVoloWordJump = { open };
})();
