(function () {
  "use strict";
  const access = window.FirstVoloMorphologyAccess;
  const flight = document.getElementById("gradeBandSelect");
  const study = document.getElementById("studySelect");
  const challenge = document.getElementById("vocabLevelSelect");
  const stretch = document.getElementById("includeStretchWords");
  const start = document.getElementById("studentPracticeStart");
  const note = document.getElementById("studentPracticeResume");
  if (!flight || !study || !start) return;
  let key = null;
  let restoring = false;
  const activity = () => document.querySelector('.activity-button[aria-pressed="true"]');
  function updateStart() {
    const chosen = study.value && activity() && !activity().disabled;
    const names = {learn:"Learn",find:"Find",hunt:"Word Hunt",meaning:"Meaning",morpheme:"Word Part",break:"Break It Apart",infer:"Figure It Out",build:"Build Words",use:"Use It",change:"Change It"};
    const label = names[activity()?.dataset.mode] || "practice";
    start.textContent = chosen ? `Continue ${label}` : "Choose practice";
    note.textContent = chosen ? "Your most recent choices are ready. Change them below whenever you need to." : "Choose your Flight and word parts below, then choose an activity.";
  }
  function save() {
    updateStart();
    if (!key || restoring || !study.value || !activity() || activity().disabled) return;
    try { localStorage.setItem(key, JSON.stringify({ flight: flight.value, study: study.value, challenge: challenge?.value, mode: activity().dataset.mode })); } catch { /* Practice still works if browser storage is unavailable. */ }
  }
  function restore(context) {
    if (context?.status !== "authorized") { key = null; return; }
    const educatorStart = document.getElementById("educatorPracticeStart");
    if (educatorStart) educatorStart.href = context.mode === "educator-selected" ? "#practiceSetup" : "#currentStudentBar";
    const nextKey = access.localProgressKey(context) + ":practice-choices-v1";
    if (nextKey === key) return;
    key = nextKey;
    let saved;
    try { saved = JSON.parse(localStorage.getItem(key)); } catch { return; }
    if (!saved || ![...flight.options].some(o => o.value === saved.flight) || ![...study.options].some(o => o.value === saved.study && !o.disabled)) { updateStart(); return; }
    restoring = true;
    try {
      flight.value = saved.flight;
      flight.dispatchEvent(new Event("change", { bubbles: true }));
      const studyButton = document.querySelector(`[data-study-mode="${saved.study}"]`);
      if (!studyButton || studyButton.disabled) return;
      studyButton.click();
      if (challenge && ["standard", "all", "familiar", "academic", "challenge"].includes(saved.challenge) && [...challenge.options].some(o => o.value === saved.challenge)) {
        challenge.value = saved.challenge;
        challenge.dispatchEvent(new Event("change", { bubbles: true }));
      }
      const modeButton = [...document.querySelectorAll('.activity-button')].find(b => b.dataset.mode === saved.mode && !b.disabled);
      modeButton?.click();
    } finally { restoring = false; updateStart(); }
  }
  [flight, study, challenge, stretch].forEach(control => control?.addEventListener("change", () => queueMicrotask(save)));
  document.querySelectorAll('[data-study-mode], .activity-button').forEach(button => button.addEventListener("click", () => queueMicrotask(save)));
  start.addEventListener("click", () => {
    const chosen = study.value && activity() && !activity().disabled;
    const target = chosen ? document.getElementById("workspaceTitle") : document.getElementById("practiceSetup");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (chosen && target) { target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true }); }
    else flight.focus({ preventScroll: true });
  });
  window.FirstVoloPracticeChoices = { apply(plan) {
    if (!plan || ![...flight.options].some(o => o.value === plan.flight)) return false;
    flight.value = plan.flight; flight.dispatchEvent(new Event("change", {bubbles:true}));
    const choice = [...document.querySelectorAll('[data-study-mode]')].find(b => b.dataset.studyMode === plan.study && !b.disabled);
    if (!choice) return false;
    choice.click();
    if (challenge) { challenge.value = plan.challenge ? "all" : "standard"; challenge.dispatchEvent(new Event("change", {bubbles:true})); }
    const mode = [...document.querySelectorAll('.activity-button')].find(b => b.dataset.mode === plan.activity && !b.disabled);
    if (!mode) return false;
    mode.click();
    return document.getElementById("startPanel")?.hidden !== false;
  }};
  access?.subscribe(restore);
  if (access?.getContext) restore(access.getContext());
  updateStart();
}());
