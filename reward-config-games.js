"use strict";

(function () {
  const VOLO_ASSET = "images/volo/volo-sky-catch.png";
  const LIMITS = Object.freeze({ minX: 9, maxX: 83, minY: 15, maxY: 82 });
  const BEAK = Object.freeze({ xRatio: 0.78, yRatio: 0.52 });
  let overlay = null, body = null, activeReward = null, stages = [], stageIndex = 0;
  let volo = { x: 16, y: 50 }, floaters = [], frame = null, lastFrame = 0, active = false;
  let returnFocus = null, collected = [];

  const registry = () => window.FirstVoloRewardRegistry;
  const display = (id) => registry()?.learnerLabel?.(id) || id;
  const promptLabel = (id) => registry()?.promptLabel?.(id) || display(id);
  const meaning = (id) => registry()?.meaningSense?.(id) || id;
  const speak = (text) => window.FirstVoloInstructionalAudio?.speak?.(text, { gradeBand: activeReward?.flight });
  const taskFor = (stage) => stage.mode === "build"
    ? `Build ${stage.round.word}. Catch ${stage.target}.`
    : `Catch a meaning of ${promptLabel(stage.morphemeId)}.`;

  function ensureOverlay() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "reward-config-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `<section class="reward-config-dialog" role="dialog" aria-modal="true" aria-labelledby="rewardConfigTitle">
      <header><div><span>Optional reward</span><h2 id="rewardConfigTitle"></h2></div>
      <button type="button" class="reward-config-exit">← Back to Journey</button></header><div class="reward-config-body"></div></section>`;
    body = overlay.querySelector(".reward-config-body");
    overlay.querySelector(".reward-config-exit").addEventListener("click", close);
    overlay.addEventListener("click", (event) => { if (event.target === overlay) close(); });
    document.addEventListener("keydown", handleKey);
    document.body.append(overlay);
  }

  function open(reward, source) {
    ensureOverlay();
    activeReward = reward;
    returnFocus = source || document.activeElement;
    stageIndex = 0;
    collected = [];
    stages = reward.gameType === "build-word" ? buildStages(reward) : meaningStages(reward);
    overlay.querySelector("h2").textContent = reward.title;
    overlay.hidden = false;
    const qa = window.FirstVoloRewards?.getTestState?.()
      ? new URLSearchParams(window.location.search)
      : null;
    if (qa?.get("rewardComplete") === "1") {
      renderComplete();
      return;
    }
    const qaStage = Number.parseInt(qa?.get("rewardStage") || "0", 10);
    if (Number.isInteger(qaStage) && qaStage >= 0 && qaStage < stages.length) stageIndex = qaStage;
    if (qa?.get("rewardPlay") === "1") {
      startStage();
      const qaFeedback = qa.get("rewardFeedback");
      if (qaFeedback === "correct") feedback("✨ Caught it!", "correct");
      if (qaFeedback === "gentle") feedback("Gentle turn—try another wind puff.", "gentle");
      return;
    }
    renderIntro();
  }

  function buildStages(reward) {
    return reward.rounds.flatMap((round, roundIndex) => round.pieces.map((piece, pieceIndex) => ({
      mode: "build", round, roundIndex, pieceIndex, target: piece,
      prompt: `Build ${round.word}: catch ${piece}`
    })));
  }

  function meaningStages(reward) {
    return reward.prompts.map((id, roundIndex) => ({
      mode: "meaning", roundIndex, target: meaning(id), morphemeId: id,
      prompt: `Catch a meaning of ${promptLabel(id)}`
    }));
  }

  function renderIntro() {
    stop();
    body.innerHTML = `<div class="reward-config-intro"><small>${activeReward.gameType === "build-word" ? "Build the Word" : "Meaning Flight"}</small>
      <h3>${activeReward.title}</h3><p>${activeReward.shortDescription}</p>
      <p class="reward-config-help">Move Volo with arrow keys, WASD, or point inside the sky.</p>
      <button type="button" class="reward-config-start">Start flying</button></div>`;
    const start = body.querySelector(".reward-config-start");
    start.addEventListener("click", startStage); start.focus();
  }

  function stageChoices(stage) {
    if (stage.mode === "meaning") {
      const otherMeanings = activeReward.eligibleContent.morphemeIds
        .map(meaning).filter((value) => value !== stage.target && value.length < 38);
      return [{ text: stage.target, correct: true }, ...rotated(unique(otherMeanings), stage.roundIndex, 3)
        .map((text) => ({ text, correct: false }))];
    }
    const excluded = new Set(stage.round.pieces);
    const distractors = activeReward.eligibleContent.morphemeIds.map(display)
      .filter((value) => !excluded.has(value) && value !== stage.target);
    return [{ text: stage.target, correct: true }, ...rotated(unique(distractors), stageIndex, 3)
      .map((text) => ({ text, correct: false }))];
  }

  function unique(values) { return [...new Set(values)]; }
  function rotated(values, start, count) {
    if (!values.length) return [];
    return Array.from({ length: Math.min(count, values.length) }, (_, index) => values[(start + index) % values.length]);
  }

  function startStage() {
    stop();
    const stage = stages[stageIndex];
    volo = { x: 16, y: 50 }; floaters = [];
    const build = stage.mode === "build";
    const taskText = build ? `Catch ${stage.target}.` : "";
    const spokenTask = taskFor(stage);
    body.innerHTML = `<div class="reward-config-hud"><div class="reward-config-task"><div class="reward-config-progress"><small>${build ? `Word ${stage.roundIndex + 1} of ${activeReward.rounds.length}` : `Wind ${stage.roundIndex + 1} of ${stages.length}`}</small><button type="button" class="reward-config-speak" aria-label="Hear directions again">🔊</button></div>
      <h3>${build ? `BUILD ${stage.round.word.toUpperCase()}` : `CATCH A MEANING OF ${promptLabel(stage.morphemeId)}`}</h3>${build ? `<strong>${taskText}</strong><span>${stage.round.baseHelp}</span>` : ""}</div>
      <div class="reward-build-slots">${build ? stage.round.pieces.map((piece, index) => `<b class="${index < stage.pieceIndex ? "is-filled" : ""}">${index < stage.pieceIndex ? piece : "?"}</b>`).join("") : ""}</div></div>
      <div class="reward-config-field" tabindex="0"><div class="reward-config-feedback" aria-live="polite">${build ? "Collect the next piece." : "Choose the matching meaning."}</div>
      <img class="reward-config-volo" src="${VOLO_ASSET}" alt="Volo flying"></div>`;
    body.querySelector(".reward-config-speak").addEventListener("click", () => speak(spokenTask));
    const field = body.querySelector(".reward-config-field");
    field.addEventListener("pointerdown", handlePointer);
    field.addEventListener("pointermove", (event) => { if (event.buttons || event.pointerType === "touch") handlePointer(event); });
    stageChoices(stage).forEach((choice, index) => spawn(choice, 53 + index * 13, 17 + index * 19));
    updateVolo(); active = true; lastFrame = performance.now(); field.focus(); frame = requestAnimationFrame(animate); speak(spokenTask);
  }

  function spawn(choice, x, y) {
    const el = document.createElement("div");
    el.className = `reward-config-choice ${choice.correct ? "is-target" : ""}`;
    el.textContent = choice.text;
    body.querySelector(".reward-config-field").append(el);
    floaters.push({ ...choice, x, y, speed: 6.2 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2, vertical: (Math.random() - .5) * 1.2, el, cooldown: 0 });
  }

  function respawn(item, index) {
    item.x = 102 + index * 4; item.y = 14 + Math.random() * 68; item.cooldown = 0;
    item.el.classList.remove("is-gentle", "is-caught"); item.animation?.cancel(); item.animation = null;
  }

  function animate(now) {
    if (!active) return;
    const dt = Math.min(40, now - lastFrame) / 1000; lastFrame = now;
    floaters.forEach((item, index) => {
      item.x -= item.speed * dt; item.y += item.vertical * dt;
      if (item.y < 12 || item.y > 84) item.vertical *= -1;
      item.el.style.transform = `translate(-50%,-50%) translate(${item.x}cqw,${item.y + Math.sin(now / 700 + item.phase) * 1.2}cqh)`;
      if (item.x < -8) respawn(item, index); else collision(item, now, index);
    });
    frame = requestAnimationFrame(animate);
  }

  function collision(item, now, index) {
    if (now < item.cooldown || item.el.classList.contains("is-caught")) return;
    const bird = body.querySelector(".reward-config-volo"), br = bird.getBoundingClientRect(), cr = item.el.getBoundingClientRect();
    const bx = br.left + br.width * BEAK.xRatio, by = br.top + br.height * BEAK.yRatio;
    const cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
    if (Math.hypot(cx - bx, cy - by) > Math.min(36, cr.width * .38)) return;
    if (!item.correct) {
      item.cooldown = now + 900; item.el.classList.add("is-gentle"); bird.classList.add("is-wobbling");
      feedback("Gentle turn—try another wind puff.", "gentle");
      setTimeout(() => { item.el.classList.remove("is-gentle"); bird.classList.remove("is-wobbling"); }, 500);
      return;
    }
    item.el.classList.add("is-caught");
    item.animation = item.el.animate([{ translate: "0 0", scale: 1, opacity: 1 },
      { translate: `${bx - cx}px ${by - cy}px`, scale: .12, opacity: 0 }],
      { duration: 360, easing: "ease-in", fill: "forwards" });
    feedback("✨ Caught it!", "correct"); bird.classList.add("is-boosting");
    setTimeout(() => advance(), 500);
  }

  function advance() {
    stop();
    collected.push(stages[stageIndex].target); stageIndex += 1;
    if (stageIndex >= stages.length) return renderComplete();
    const prior = stages[stageIndex - 1], next = stages[stageIndex];
    if (prior.mode === "build" && next.mode === "build" && prior.roundIndex !== next.roundIndex) {
      body.innerHTML = `<div class="reward-config-between"><div>✨ ${prior.round.word}</div><p>${prior.round.prompt}</p>
        <button type="button" class="reward-config-next">Next word</button></div>`;
      const button = body.querySelector("button"); button.addEventListener("click", startStage); button.focus();
    } else startStage();
  }

  function feedback(text, type) {
    const el = body.querySelector(".reward-config-feedback");
    if (el) { el.textContent = text; el.className = `reward-config-feedback is-${type}`; }
  }

  function move(dx, dy) {
    if (!active) return;
    volo.x = Math.max(LIMITS.minX, Math.min(LIMITS.maxX, volo.x + dx));
    volo.y = Math.max(LIMITS.minY, Math.min(LIMITS.maxY, volo.y + dy)); updateVolo();
  }
  function updateVolo() {
    const bird = body.querySelector(".reward-config-volo");
    if (bird) { bird.style.left = `${volo.x}%`; bird.style.top = `${volo.y}%`; }
  }
  function handleKey(event) {
    if (!active || overlay?.hidden) return;
    const moves = { arrowleft:[-7,0],a:[-7,0],arrowright:[7,0],d:[7,0],arrowup:[0,-7],w:[0,-7],arrowdown:[0,7],s:[0,7] };
    const delta = moves[event.key.toLowerCase()]; if (!delta) return;
    event.preventDefault(); move(...delta);
  }
  function handlePointer(event) {
    const field = body.querySelector(".reward-config-field"), r = field.getBoundingClientRect();
    volo.x = Math.max(LIMITS.minX, Math.min(LIMITS.maxX, (event.clientX - r.left) / r.width * 100 - 10.75));
    volo.y = Math.max(LIMITS.minY, Math.min(LIMITS.maxY, (event.clientY - r.top) / r.height * 100 - 2.2)); updateVolo();
  }
  function renderComplete() {
    body.innerHTML = `<div class="reward-config-complete"><div>✨</div><h3>Nice flying!</h3>
      <p>${activeReward.gameType === "build-word" ? "You built every word." : "You followed every meaning wind."}</p>
      <small>Game-only celebration · Journey progress stayed the same.</small><div>
      <button type="button" class="reward-config-replay">Play Again</button><button type="button" class="reward-config-back">Back to Journey</button></div></div>`;
    const replay = body.querySelector(".reward-config-replay"); replay.addEventListener("click", () => { stageIndex = 0; collected = []; renderIntro(); });
    body.querySelector(".reward-config-back").addEventListener("click", close); replay.focus();
  }
  function stop() { active = false; if (frame) cancelAnimationFrame(frame); frame = null; }
  function close() { stop(); if (!overlay) return; overlay.hidden = true; returnFocus?.focus?.(); }

  window.FirstVoloConfigGames = Object.freeze({ open, close });
})();
