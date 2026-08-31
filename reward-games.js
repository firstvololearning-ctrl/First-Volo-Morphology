"use strict";

/* Optional games read progress but never write instructional data. */
(function () {
  const SKY_THEME = Object.freeze({
    id: "migration-sky", className: "reward-theme-sky",
    objectStyle: "wind-puff", voloAsset: "images/volo/volo-sky-catch.png"
  });
  const REWARDS = window.FirstVoloRewardRegistry?.definitions || [];
  const ROUND_DURATION_MS = 15000;
  const MOVE_STEP = 7;
  const LIMITS = Object.freeze({ minX: 9, maxX: 83, minY: 15, maxY: 82 });
  const BEAK_POINT = Object.freeze({ xRatio: 0.78, yRatio: 0.52 });
  const BEAK_OFFSET = Object.freeze({ x: 10.75, y: 2.2 });

  let returnFocus, gameOverlay, gameBody, animationFrame;
  let roundIndex = 0, caught = 0, missed = 0, totalCaught = 0;
  let activeReward = null;
  let volo = { x: 16, y: 48 }, floaters = [], roundStart = 0, lastFrame = 0;
  let roundActive = false, nextFloaterId = 0;

  function getTestState() {
    const local = ["localhost", "127.0.0.1", "::1", ""].includes(location.hostname);
    if (!local) return null;
    const value = new URLSearchParams(location.search).get("rewardTest");
    return value === "locked" || value === "unlocked" ? value : null;
  }
  function isUnlocked(reward, student) {
    const test = getTestState();
    const testReward = new URLSearchParams(location.search).get("rewardId");
    if (test && (!testReward || testReward === reward.id)) return test === "unlocked";
    return Boolean(student && window.FirstVoloTokens?.isTokenEarned?.(student, reward.unlockToken));
  }
  function displayMorpheme(id) {
    return window.FirstVoloRewardRegistry?.learnerLabel?.(id) || id.replace(/-(negation|reversative)$/, "");
  }
  function speakPrompt(text, descriptors = []) {
    const audio = window.FirstVoloInstructionalAudio;
    if (descriptors.length && audio?.speakWithControlledMorphemes) return audio.speakWithControlledMorphemes(text, descriptors, { gradeBand: activeReward?.flight });
    return audio?.speak?.(text, { gradeBand: activeReward?.flight });
  }
  function createJourneyAccess(student, flightValue) {
    const reward = REWARDS.find((item) => item.flight === flightValue);
    return reward ? createRewardAccess(reward, student) : null;
  }
  function createJourneyAccesses(student, flightValue) {
    return REWARDS.filter((item) => item.flight === flightValue)
      .map((reward) => createRewardAccess(reward, student));
  }
  function createRewardAccess(reward, student) {
    const unlocked = isUnlocked(reward, student);
    const stop = document.createElement("div");
    stop.className = `reward-route-stop ${unlocked ? "is-unlocked" : "is-locked"}`;
    stop.dataset.rewardId = reward.id;
    stop.dataset.unlockToken = reward.unlockToken;

    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = "reward-route-marker";
    marker.setAttribute("aria-expanded", "false");
    marker.setAttribute("aria-label", unlocked
      ? `Reward unlocked: ${reward.title}`
      : `Locked reward: ${reward.title}`);
    marker.innerHTML = `<span aria-hidden="true">${unlocked ? "🎮" : "🔒"}</span><small>Reward</small>`;

    const card = document.createElement("section");
    card.className = "reward-route-popover";
    card.hidden = true;
    card.setAttribute("aria-label", `Optional reward: ${reward.title}`);
    const copy = document.createElement("div");
    copy.className = "reward-stop-copy";
    if (unlocked) {
      copy.innerHTML = '<strong>🎮 Reward Stop Unlocked</strong>' +
        `<span>${reward.title}</span>` +
        `<p>${reward.shortDescription}</p>` +
        '<small>Optional reward · Your Journey progress will not change.</small>';
      const play = document.createElement("button");
      play.type = "button";
      play.className = "reward-play-button";
      play.textContent = "Play";
      play.addEventListener("click", (event) => {
        event.stopPropagation();
        launchReward(reward, play);
      });
      card.append(copy, play);
    } else {
      copy.innerHTML = '<strong>🔒 Reward Stop</strong>' +
        '<span>Keep flying to unlock a game!</span><small>Optional reward</small>';
      card.append(copy);
    }
    marker.addEventListener("click", () => {
      card.hidden = !card.hidden;
      marker.setAttribute("aria-expanded", String(!card.hidden));
    });
    stop.append(marker, card);
    return stop;
  }

  function launchReward(reward, source) {
    if (!reward) return;
    if (reward.gameType === "sky-catch") return openSkyCatch(source, reward);
    return window.FirstVoloConfigGames?.open?.(reward, source);
  }

  function ensureDialog() {
    if (gameOverlay) return;
    gameOverlay = document.createElement("div");
    gameOverlay.className = "reward-game-overlay";
    gameOverlay.hidden = true;
    gameOverlay.innerHTML = `
      <section class="reward-game-dialog" role="dialog" aria-modal="true" aria-labelledby="rewardGameTitle">
        <header class="reward-game-header"><div><span>Optional reward</span>
          <h2 id="rewardGameTitle">Volo’s Sky Catch</h2></div>
          <button type="button" class="reward-game-exit">← Back to Journey</button></header>
        <div class="reward-game-body"></div>
      </section>`;
    gameBody = gameOverlay.querySelector(".reward-game-body");
    gameOverlay.querySelector(".reward-game-exit").addEventListener("click", closeGame);
    gameOverlay.addEventListener("click", (event) => { if (event.target === gameOverlay) closeGame(); });
    document.addEventListener("keydown", handleKeydown);
    document.body.append(gameOverlay);
  }
  function openSkyCatch(source, reward = REWARDS[0]) {
    ensureDialog();
    returnFocus = source || document.activeElement;
    gameOverlay.dataset.theme = typeof reward.theme === "string" ? reward.theme : reward.theme.id;
    roundIndex = 0;
    totalCaught = 0;
    activeReward = reward;
    gameOverlay.hidden = false;
    document.body.classList.add("reward-game-open");
    renderRoundIntro();
  }
  function closeGame() {
    stopRound();
    if (!gameOverlay) return;
    gameOverlay.hidden = true;
    document.body.classList.remove("reward-game-open");
    returnFocus?.focus?.();
  }
  function stopRound() {
    roundActive = false;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  function renderRoundIntro() {
    stopRound();
    const round = activeReward.rounds[roundIndex];
    const spokenTask = `Catch ${displayMorpheme(round.target)}. It means ${round.meaning}.`;
    const spokenDescriptors = [{ id: round.target, token: displayMorpheme(round.target) }];
    gameBody.innerHTML = `<div class="reward-sky-intro">
      <div class="reward-round-count">Wind ${roundIndex + 1} of ${activeReward.rounds.length}</div>
      <h3>Catch the word part that means <strong>${round.meaning}</strong>.</h3>
      <button type="button" class="reward-speak-button" aria-label="Hear directions again">🔊</button>
      <p>Move Volo with arrow keys, WASD, or point inside the sky.</p>
      <button type="button" class="reward-start-button">Ride the wind!</button></div>`;
    const start = gameBody.querySelector(".reward-start-button");
    gameBody.querySelector(".reward-speak-button").addEventListener("click", () => speakPrompt(spokenTask, spokenDescriptors));
    start.addEventListener("click", startRound);
    start.focus();
  }
  function startRound() {
    const round = activeReward.rounds[roundIndex];
    caught = 0; missed = 0; volo = { x: 16, y: 48 }; floaters = [];
    const spokenTask = `Catch ${displayMorpheme(round.target)}. It means ${round.meaning}.`;
    const spokenDescriptors = [{ id: round.target, token: displayMorpheme(round.target) }];
    gameBody.innerHTML = `<div class="reward-game-hud">
      <div><span>Wind ${roundIndex + 1} of 5</span><strong>Catch: ${displayMorpheme(round.target)} = ${round.meaning}</strong><button type="button" class="reward-speak-button" aria-label="Hear directions again">🔊</button></div>
      <div class="reward-score" aria-live="polite"><span>Caught: <b>0</b></span><span>Missed: <b>0</b></span></div></div>
      <div class="reward-time-track"><span></span></div>
      <div class="reward-sky-field" tabindex="0" aria-label="Move Volo with arrow keys, WASD, pointer, or touch.">
        <div class="reward-wind-line reward-wind-line-one"></div><div class="reward-wind-line reward-wind-line-two"></div>
        <div class="reward-flight-energy"><span>Flight energy</span><div><i></i></div></div>
        <div class="reward-catch-feedback" aria-live="polite">Catch every <b>${displayMorpheme(round.target)}</b> you can!</div>
        <img class="reward-volo" src="${SKY_THEME.voloAsset}" alt="Volo flying"></div>`;
    const field = gameBody.querySelector(".reward-sky-field");
    field.addEventListener("pointerdown", handlePointerMove);
    field.addEventListener("pointermove", (event) => {
      if (event.buttons || event.pointerType === "touch") handlePointerMove(event);
    });
    [round.target, ...round.distractors].forEach((id, index) =>
      spawnFloater(displayMorpheme(id), id === round.target, 53 + index * 13, 17 + index * 19));
    updateVolo();
    roundStart = performance.now(); lastFrame = roundStart; roundActive = true;
    field.focus();
    gameBody.querySelector(".reward-speak-button").addEventListener("click", () => speakPrompt(spokenTask, spokenDescriptors));
    speakPrompt(spokenTask, spokenDescriptors);
    animationFrame = requestAnimationFrame(animateRound);
  }
  function spawnFloater(label, isTarget, x, y) {
    const element = document.createElement("div");
    element.className = `reward-floater ${isTarget ? "is-target" : "is-distractor"}`;
    element.textContent = label;
    element.setAttribute("aria-hidden", "true");
    gameBody.querySelector(".reward-sky-field").append(element);
    floaters.push({ id: ++nextFloaterId, label, isTarget, x, y,
      speed: 7.2 + Math.random() * 2.4, phase: Math.random() * Math.PI * 2,
      verticalSpeed: (Math.random() - 0.5) * 1.4,
      element, bumpUntil: 0 });
  }
  function respawn(floater, stagger = 0) {
    floater.x = 103 + stagger + Math.random() * 8;
    floater.y = 15 + Math.random() * 66;
    floater.speed = 7.2 + Math.random() * 2.4;
    floater.phase = Math.random() * Math.PI * 2;
    floater.verticalSpeed = (Math.random() - 0.5) * 1.4;
    floater.bumpUntil = 0;
    floater.catchAnimation?.cancel();
    floater.catchAnimation = null;
    floater.element.classList.remove("is-caught", "is-bumped");
  }
  function animateRound(now) {
    if (!roundActive) return;
    const elapsed = now - roundStart;
    const delta = Math.min(40, now - lastFrame) / 1000;
    lastFrame = now;
    const fill = gameBody.querySelector(".reward-time-track span");
    if (fill) fill.style.width = `${Math.max(0, 100 - elapsed / ROUND_DURATION_MS * 100)}%`;
    floaters.forEach((floater, index) => {
      floater.x -= floater.speed * delta;
      floater.y += floater.verticalSpeed * delta;
      if (floater.y < 13 || floater.y > 83) {
        floater.verticalSpeed *= -1;
        floater.y = Math.max(13, Math.min(83, floater.y));
      }
      const bob = Math.sin(now / 650 + floater.phase) * 1.4;
      floater.element.style.transform = `translate(-50%,-50%) translate(${floater.x}cqw,${floater.y + bob}cqh)`;
      if (floater.x < -7) {
        if (floater.isTarget) missed += 1;
        updateScore(); respawn(floater, index * 4);
      } else checkCollision(floater, now, index);
    });
    if (elapsed >= ROUND_DURATION_MS) return finishRound();
    animationFrame = requestAnimationFrame(animateRound);
  }
  function checkCollision(floater, now, index) {
    if (now < floater.bumpUntil || floater.element.classList.contains("is-caught")) return;
    const bird = gameBody.querySelector(".reward-volo");
    if (!bird) return;
    const birdBounds = bird.getBoundingClientRect();
    const puffBounds = floater.element.getBoundingClientRect();
    const beakX = birdBounds.left + birdBounds.width * BEAK_POINT.xRatio;
    const beakY = birdBounds.top + birdBounds.height * BEAK_POINT.yRatio;
    const puffX = puffBounds.left + puffBounds.width / 2;
    const puffY = puffBounds.top + puffBounds.height / 2;
    const dx = puffX - beakX;
    const dy = puffY - beakY;
    if (Math.hypot(dx, dy) > Math.min(34, puffBounds.width * 0.38)) return;
    if (floater.isTarget) {
      caught += 1;
      floater.element.classList.add("is-caught");
      floater.catchAnimation = floater.element.animate(
        [
          { translate: "0 0", scale: "1", opacity: 1 },
          { offset: 0.62, translate: `${beakX - puffX}px ${beakY - puffY}px`, scale: 0.72, opacity: 1 },
          { translate: `${beakX - puffX}px ${beakY - puffY}px`, scale: 0.12, opacity: 0 }
        ],
        { duration: 360, easing: "ease-in", fill: "forwards" }
      );
      setTimeout(() => { if (roundActive) bird.classList.add("is-boosting"); }, 250);
      showFeedback(`✨ Caught ${floater.label}! Volo rides the wind!`, "correct");
      updateScore();
      setTimeout(() => { bird.classList.remove("is-boosting"); if (roundActive) respawn(floater, index * 3); }, 540);
    } else {
      floater.bumpUntil = now + 950; floater.element.classList.add("is-bumped"); bird?.classList.add("is-wobbling");
      showFeedback(`That’s ${floater.label}. Keep looking for ${displayMorpheme(activeReward.rounds[roundIndex].target)}!`, "gentle");
      setTimeout(() => { floater.element.classList.remove("is-bumped"); bird?.classList.remove("is-wobbling"); }, 500);
    }
  }
  function updateScore() {
    const values = gameBody.querySelectorAll(".reward-score b");
    if (values[0]) values[0].textContent = caught;
    if (values[1]) values[1].textContent = missed;
    const energy = gameBody.querySelector(".reward-flight-energy i");
    if (energy) energy.style.width = `${Math.min(100, caught * 20)}%`;
  }
  function showFeedback(message, type) {
    const feedback = gameBody.querySelector(".reward-catch-feedback");
    if (!feedback) return;
    feedback.className = `reward-catch-feedback is-${type}`;
    feedback.textContent = message;
  }
  function moveVolo(dx, dy) {
    if (!roundActive) return;
    volo.x = Math.max(LIMITS.minX, Math.min(LIMITS.maxX, volo.x + dx));
    volo.y = Math.max(LIMITS.minY, Math.min(LIMITS.maxY, volo.y + dy));
    updateVolo();
  }
  function updateVolo() {
    const bird = gameBody.querySelector(".reward-volo");
    if (bird) { bird.style.left = `${volo.x}%`; bird.style.top = `${volo.y}%`; }
  }
  function handleKeydown(event) {
    if (!roundActive || gameOverlay?.hidden) return;
    const moves = { arrowleft:[-MOVE_STEP,0],a:[-MOVE_STEP,0],arrowright:[MOVE_STEP,0],d:[MOVE_STEP,0],
      arrowup:[0,-MOVE_STEP],w:[0,-MOVE_STEP],arrowdown:[0,MOVE_STEP],s:[0,MOVE_STEP] };
    const move = moves[event.key.toLowerCase()];
    if (!move) return;
    event.preventDefault(); moveVolo(...move);
  }
  function handlePointerMove(event) {
    if (!roundActive) return;
    const field = gameBody.querySelector(".reward-sky-field"), bounds = field.getBoundingClientRect();
    volo.x = Math.max(LIMITS.minX, Math.min(LIMITS.maxX, (event.clientX - bounds.left) / bounds.width * 100 - BEAK_OFFSET.x));
    volo.y = Math.max(LIMITS.minY, Math.min(LIMITS.maxY, (event.clientY - bounds.top) / bounds.height * 100 - BEAK_OFFSET.y));
    updateVolo();
  }
  function finishRound() {
    stopRound(); totalCaught += caught;
    if (roundIndex + 1 >= activeReward.rounds.length) return renderComplete();
    gameBody.innerHTML = `<div class="reward-round-complete"><div>✨</div><h3>Great flying!</h3>
      <p>Volo caught <strong>${caught}</strong> word part${caught === 1 ? "" : "s"} in this wind.</p>
      <button type="button" class="reward-next-button">Next wind</button></div>`;
    const next = gameBody.querySelector(".reward-next-button");
    next.addEventListener("click", () => { roundIndex += 1; renderRoundIntro(); }); next.focus();
  }
  function renderComplete() {
    gameBody.innerHTML = `<div class="reward-game-complete" role="status"><div class="reward-complete-icon">✨</div>
      <h3>Nice flying!</h3><p>You caught <strong>${totalCaught}</strong> correct word part${totalCaught === 1 ? "" : "s"} while Volo rode the wind.</p>
      <p class="reward-game-only-note">Game-only flight energy · Your Journey position stayed the same.</p>
      <div class="reward-complete-actions"><button type="button" class="reward-replay-button">Play Again</button>
      <button type="button" class="reward-return-button">Back to Journey</button></div></div>`;
    const replay = gameBody.querySelector(".reward-replay-button");
    replay.addEventListener("click", () => { roundIndex = 0; totalCaught = 0; renderRoundIntro(); });
    gameBody.querySelector(".reward-return-button").addEventListener("click", closeGame); replay.focus();
  }

  let myGamesOverlay = null;
  let myGamesReturnFocus = null;
  function openMyGames(student, source) {
    myGamesReturnFocus = source || document.activeElement;
    if (!myGamesOverlay) {
      myGamesOverlay = document.createElement("div");
      myGamesOverlay.className = "reward-my-games-overlay";
      myGamesOverlay.hidden = true;
      myGamesOverlay.innerHTML = `<section class="reward-my-games" role="dialog" aria-modal="true" aria-labelledby="rewardMyGamesTitle">
        <header><div><span>Optional rewards</span><h2 id="rewardMyGamesTitle">🎮 My Games</h2></div>
        <button type="button" class="reward-my-games-close">Close</button></header><div class="reward-my-games-list"></div></section>`;
      myGamesOverlay.querySelector(".reward-my-games-close").addEventListener("click", () => {
        myGamesOverlay.hidden = true;
        myGamesReturnFocus?.focus?.();
      });
      myGamesOverlay.addEventListener("click", (event) => {
        if (event.target === myGamesOverlay) myGamesOverlay.hidden = true;
      });
      document.body.append(myGamesOverlay);
    }
    const list = myGamesOverlay.querySelector(".reward-my-games-list");
    list.innerHTML = "";
    [["2-3", "Flight A"], ["4-5", "Flight B"], ["6-8", "Flight C"]].forEach(([flight, label]) => {
      const group = document.createElement("section");
      group.className = "reward-my-games-group";
      group.innerHTML = `<h3>${label}</h3><div></div>`;
      const cards = group.querySelector("div");
      REWARDS.filter((reward) => reward.flight === flight).forEach((reward) => {
        const unlocked = isUnlocked(reward, student);
        const item = document.createElement("article");
        item.className = `reward-my-game ${unlocked ? "is-unlocked" : "is-locked"}`;
        item.innerHTML = `<div><strong>${unlocked ? "🎮" : "🔒"} ${reward.title}</strong><p>${reward.shortDescription}</p></div>`;
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = unlocked ? "Play" : "Locked";
        button.disabled = !unlocked;
        button.addEventListener("click", () => launchReward(reward, button));
        item.append(button);
        cards.append(item);
      });
      list.append(group);
    });
    myGamesOverlay.hidden = false;
    myGamesOverlay.querySelector(".reward-my-games-close").focus();
  }

  window.FirstVoloRewards = { registry: REWARDS, getTestState, isUnlocked,
    createJourneyAccess, createJourneyAccesses, launch: launchReward,
    openMyGames, open: openSkyCatch, close: closeGame };

  if (
    ["localhost", "127.0.0.1", "::1", ""].includes(location.hostname) &&
    new URLSearchParams(location.search).get("rewardQa") === "dict"
  ) {
    const reward = REWARDS.find((item) => item.id === "root-word-builder");
    if (reward) window.setTimeout(() => launchReward(reward, null), 0);
  }
})();
