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
  const learnerEntry = document.querySelector('.learner-practice-entry');
  const startOver = document.getElementById('educatorStartOver');
  function setEducatorPath(path) {
    document.documentElement.dataset.educatorPath = path;
    if (startOver) startOver.hidden = !path;
  }
  const lessonChoices = window.FirstVoloLessonChoices;
  const sharedRoute = document.getElementById("sharedLessonRoute");
  const sharedPart = document.getElementById("sharedLessonPart");
  const sharedStart = document.getElementById("sharedLessonStart");
  function updateSharedLesson() {
    lessonChoices.populate(sharedPart, sharedRoute.value, lessonChoices.starter(sharedRoute.value));
    updateSharedStart();
  }
  function updateSharedStart() {
    sharedStart.disabled = !sharedPart.value;
    sharedStart.textContent = sharedPart.value === lessonChoices.starter(sharedRoute.value)
      ? "Start first lesson" : "Start lesson";
  }
  if (lessonChoices && sharedRoute && sharedPart && sharedStart) {
    updateSharedLesson();
    sharedRoute.addEventListener("change", updateSharedLesson);
    sharedPart.addEventListener("change", updateSharedStart);
    sharedStart.addEventListener("click", () => {
      const plan = lessonChoices.plan(sharedRoute.value, sharedPart.value);
      if (!plan) return;
      setEducatorPath("practice");
      document.documentElement.dataset.sharedLessonOpen = "";
      const target = window.FirstVoloPracticeChoices.apply(plan) && document.querySelector("#learnDetailPanel");
      if (!target) {
        delete document.documentElement.dataset.sharedLessonOpen;
        document.getElementById("learnerNextStep").textContent = "This lesson is unavailable. Choose a different activity below.";
        return;
      }
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  learnerEntry?.addEventListener("toggle", () => {
    if (learnerEntry.open) setEducatorPath("lesson");
  });
  document.getElementById("educatorPracticeStart")?.addEventListener("click", () => {
    delete document.documentElement.dataset.sharedLessonOpen;
    setEducatorPath("practice");
  });
  document.getElementById('openPracticePlan')?.addEventListener('click', () => setEducatorPath('setup'));
  startOver?.addEventListener('click', () => { setEducatorPath(''); if (learnerEntry) learnerEntry.open=false; document.getElementById('educatorEntryTitle')?.scrollIntoView({block:'start'}); });
  const openChosen = document.getElementById("openChosenPractice");
  function updateStart() {
    const chosen = study.value && activity() && !activity().disabled;
    const names = {learn:"Learn",find:"Find",hunt:"Word Hunt",meaning:"Meaning",morpheme:"Word Part",break:"Break It Apart",infer:"Figure It Out",build:"Build Words",use:"Use It",change:"Change It"};
    const label = names[activity()?.dataset.mode] || "practice";
    if (openChosen) { openChosen.disabled = !chosen; openChosen.textContent = `Open ${label}`; }
    const hint = document.getElementById("practiceNextHint");
    const learner = window.FirstVoloActivityProgress?.getActiveStudent?.();
    const who = learner?.name ? ` for ${learner.name}` : "";
    const studyName = study.selectedOptions[0]?.textContent?.trim() || "word parts";
    const flightName = flight.selectedOptions[0]?.textContent?.trim() || "";
    if (hint) hint.textContent = chosen ? `Next${who}: Open ${label} · ${studyName} · ${flightName}.` : `Next: Choose word parts${who} above, then open practice.`;
    const learnerNext = document.getElementById("learnerNextStep");
    if (learnerNext) learnerNext.textContent = learner ? `Practice will be saved for ${learner.name}.` : "Choose a learner to save progress, or teach without saving to a learner.";
    start.textContent = chosen ? `Continue ${label}` : "Choose practice";
    note.textContent = chosen ? "Your most recent choices are ready. Change them below whenever you need to." : "Choose your Route and word parts below, then choose an activity.";
  }
  function save() {
    updateStart();
    if (!key || restoring || !study.value || !activity() || activity().disabled) return;
    try { localStorage.setItem(key, JSON.stringify({ flight: flight.value, study: study.value, challenge: challenge?.value, mode: activity().dataset.mode })); } catch { /* Practice still works if browser storage is unavailable. */ }
  }
  function restore(context) {
    if (context?.status !== "authorized") { key = null; return; }
    const educatorStart = document.getElementById("educatorPracticeStart");
    if (educatorStart) educatorStart.href = "#practiceSetup";
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
    else document.querySelector("[data-study-mode]")?.focus({ preventScroll: true });
  });
  openChosen?.addEventListener("click", () => {
    activity()?.click();
    const target = document.getElementById("workspaceTitle");
    target?.scrollIntoView({behavior:"smooth",block:"start"});
    target?.setAttribute("tabindex", "-1"); target?.focus({preventScroll:true});
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
    if (plan.lesson) {
      const explore = document.getElementById("learnExploreButton");
      if (explore?.getAttribute("aria-pressed") === "false") explore.click();
      const card = [...document.querySelectorAll("[data-lesson-part]")].find(button => button.dataset.lessonPart === plan.lesson);
      if (!card) return false;
      const group = card.closest("details");
      if (group) group.open = true;
      card.click();
    }
    return document.getElementById("startPanel")?.hidden !== false;
  }};
  access?.subscribe(restore);
  if (access?.getContext) restore(access.getContext());
  window.addEventListener("firstvoloprogresschange", updateStart);
  updateStart();
}());
