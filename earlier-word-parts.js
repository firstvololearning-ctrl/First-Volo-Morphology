(function () {
  "use strict";

  const panel = document.getElementById("earlierWordParts");
  const access = window.FirstVoloMorphologyAccess;
  if (!panel || !access) return;

  const routes = ["2-3", "4-5", "6-8"];
  const reviewIds = [
    ["pre", "re", "un-negation", "ed", "ful", "less"],
    ["port", "dict", "struct", "trans", "inter"]
  ];
  const relatedParts = { dict: "pre", struct: "re", tract: "re", pel: "re" };
  const lessons = window.FirstVoloLessonChoices;
  const partsByRoute = routes.map(lessons.choices);
  const sets = window.FIRST_VOLO_TOKEN_SETS || [];
  const pick = id => document.getElementById(id);
  const mapRoute = pick("studentMapRoute");
  const setChooser = pick("earlierSetChoice");
  const checkSet = pick("checkEarlierSet");
  const check = pick("earlierPartsCheck");
  const title = pick("earlierCheckTitle");
  const options = pick("earlierCheckOptions");
  const feedback = pick("earlierCheckFeedback");
  const next = pick("earlierCheckNext");
  const close = pick("earlierCheckClose");
  let route = "";
  let learnerKey = "";
  let round;

  function shuffled(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function resetCheck() {
    check.hidden = true;
    panel.hidden = routes.indexOf(route) < 1;
    pick("earlierPartsChoices").hidden = false;
    round = null;
  }

  function partsIn(set) {
    const parts = partsByRoute[routes.indexOf(set.introBand)];
    return set.morphemeIds.map(id => parts.find(part => part.id === id)).filter(Boolean);
  }

  function knownParts() {
    const student = window.FirstVoloActivityProgress?.getActiveStudent();
    if (!student) return new Set();
    const results = window.FirstVoloTokens?.evaluateStudent(student) || [];
    return new Set(results.flatMap(set => set.morphemes.filter(part =>
      part.knowledgeReady || (part.profile !== "recognition-only" && part.applicationReady)
    ).map(part => part.id)));
  }

  function updateSet() {
    const set = sets.find(item => item.id === setChooser.value);
    const parts = set ? partsIn(set) : [];
    checkSet.disabled = !parts.length;
    const shown = parts.length ? knownParts() : new Set();
    const allShown = parts.length && parts.every(part => shown.has(part.id));
    pick("earlierSetParts").textContent = parts.length
      ? `${parts.length} parts to check.${allShown ? " You’ve shown you know these parts. Review if you’d like." : ""}`
      : "";
  }

  function updateRoute() {
    const context = access.getContext();
    const nextRoute = context?.status === "authorized" && context.mode === "student" ? mapRoute?.value : "";
    const nextLearnerKey = nextRoute ? JSON.stringify([context.userId, context.studentId]) : "";
    if (route === nextRoute && learnerKey === nextLearnerKey) return;
    route = nextRoute;
    learnerKey = nextLearnerKey;
    resetCheck();
    const routeIndex = routes.indexOf(route);
    panel.hidden = routeIndex < 1;
    panel.open = false;
    if (panel.hidden) return;
    pick("earlierPartsIntro").textContent = routeIndex === 1
      ? "Choose a set from Route 1."
      : "Choose a set from Route 1 or 2.";
    setChooser.replaceChildren(new Option("Choose a set", ""));
    for (const [index, band] of routes.slice(0, routeIndex).entries()) {
      const group = document.createElement("optgroup");
      group.label = `Route ${index + 1}`;
      for (const set of sets.filter(item => item.introBand === band)) {
        const label = set.label.replace(/^Migration Route \d+ (?:Set \d+ · )?/, "");
        group.append(new Option(`${group.label} · ${label}`, set.id));
      }
      setChooser.append(group);
    }
    updateSet();
  }

  function showQuestion() {
    const part = round.questions[round.index];
    const example = part.currentExamples.split(" · ")[0];
    const word = document.createElement("strong");
    word.textContent = example;
    const label = document.createElement("strong");
    label.textContent = part.label;
    pick("earlierCheckPrompt").replaceChildren(
      `${round.index + 1} of ${round.questions.length}. In `, word, ", what does ", label, " mean or do?"
    );
    feedback.textContent = "";
    next.hidden = true;
    const alternatives = new Map();
    for (const other of shuffled(round.pool)) {
      if (other.label !== part.label && other.meaning !== part.meaning) alternatives.set(other.meaning, other);
    }
    options.replaceChildren();
    for (const choice of shuffled([part, ...[...alternatives.values()].slice(0, 2)])) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = choice.meaning;
      button.addEventListener("click", () => {
        for (const answer of options.children) answer.disabled = true;
        if (choice !== part) round.missed.push(part);
        feedback.textContent = `${choice === part ? "Yes." : "Take a look."} In ${example}, ${part.label} means ${part.meaning}.`;
        next.textContent = round.index + 1 < round.questions.length ? "Next question" : "See what to do next";
        next.hidden = false;
        next.focus();
      });
      options.append(button);
    }
  }

  function startCheck({ set, lessonId, continueLesson, assigned = false }) {
    const routeIndex = routes.indexOf(route);
    if (!set && routeIndex < 1) return false;
    const pools = set ? [shuffled(partsIn(set))] : partsByRoute.slice(0, routeIndex).map((parts, index) =>
      shuffled(reviewIds[index].map(id => parts.find(part => part.id === id)).filter(Boolean)));
    const pool = pools.flat();
    const shown = continueLesson ? knownParts() : new Set();
    const candidates = pools.map(parts => parts.filter(part => !shown.has(part.id)));
    const related = relatedParts[lessonId];
    const starters = candidates.map(items => items.find(part => part.id === related) || items[0]).filter(Boolean);
    const questionCount = set ? pool.length : 2;
    const questions = [...new Set([...starters, ...candidates.flat()])].slice(0, questionCount);
    if (!questions.length) return false;
    round = { pool, questions, index: 0, missed: [], continueLesson, assigned };
    panel.hidden = false;
    panel.open = true;
    pick("earlierPartsChoices").hidden = assigned || Boolean(continueLesson);
    check.hidden = false;
    title.textContent = continueLesson ? "Quick warm-up" : "Set check";
    close.classList.remove("plan-primary");
    close.textContent = continueLesson ? "Skip to lesson" : "Close check";
    showQuestion();
    title.focus();
    return true;
  }

  function finishCheck() {
    const current = round;
    resetCheck();
    if (current?.continueLesson) {
      panel.open = false;
      current.continueLesson();
    } else {
      panel.open = false;
      if (current?.finished && pick("studentAssignedPracticeStart")) {
        pick("studentAssignedPracticeStart").dispatchEvent(new Event("firstvoloopenreviewedlesson"));
      } else {
        (current?.assigned ? pick("studentAssignedReviewStart") : panel.querySelector("summary"))?.focus();
      }
    }
  }

  function openLearn(part) {
    const reviewedRoute = route;
    if (!window.FirstVoloPracticeChoices?.apply(lessons.plan(part.introBand, part.id))) {
      feedback.textContent = "This Learn card could not open. Go back to the map and try again.";
      return;
    }
    resetCheck();
    // Opening Learn uses the part’s original route. Keep the map on the route being reviewed.
    if (mapRoute.value !== reviewedRoute) {
      mapRoute.value = reviewedRoute;
      mapRoute.dispatchEvent(new Event("change"));
    }
    document.querySelectorAll("[data-plan-workspace-hidden]").forEach(element =>
      element.removeAttribute("data-plan-workspace-hidden")
    );
    const detail = pick("learnDetailPanel");
    detail.tabIndex = -1;
    detail.focus({ preventScroll: true });
    detail.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showResults() {
    round.finished = true;
    title.textContent = round.missed.length ? "Practice the parts you missed" : "You got these parts right";
    pick("earlierCheckPrompt").textContent = round.missed.length
      ? "Open a Learn card for an example and another try."
      : "You’re ready to move on from this quick check.";
    options.replaceChildren();
    for (const [index, part] of round.missed.entries()) {
      const button = document.createElement("button");
      button.type = "button";
      if (index === 0) button.className = "plan-primary";
      button.textContent = `Learn ${part.label} · ${part.meaning}`;
      button.addEventListener("click", () => openLearn(part));
      options.append(button);
    }
    feedback.textContent = "";
    next.hidden = true;
    close.classList.toggle("plan-primary", !round.missed.length);
    close.textContent = round.continueLesson || pick("studentAssignedPracticeStart")
      ? "Go to today’s lesson" : "Back to the map";
    title.focus();
  }

  setChooser.addEventListener("change", () => {
    resetCheck();
    updateSet();
  });
  checkSet.addEventListener("click", () => startCheck({ set: sets.find(item => item.id === setChooser.value) }));
  next.addEventListener("click", () => {
    if (!round) return;
    if (++round.index >= round.questions.length) return showResults();
    showQuestion();
    pick("earlierCheckPrompt").tabIndex = -1;
    pick("earlierCheckPrompt").focus();
  });
  close.addEventListener("click", finishCheck);
  mapRoute?.addEventListener("change", updateRoute);
  pick("gradeBandSelect")?.addEventListener("change", updateRoute);
  window.addEventListener("firstvolopracticeplanroutechange", () => {
    resetCheck();
    updateRoute();
  });
  access.subscribe(updateRoute);

  function showRoute(band) {
    if (mapRoute.value !== band) {
      mapRoute.value = band;
      mapRoute.dispatchEvent(new Event("change"));
    }
  }

  window.FirstVoloEarlierWordParts = {
    openAssigned(plan) {
      const set = sets.find(item => item.id === plan.reviewSet);
      if (!mapRoute || !set) return false;
      showRoute(plan.flight);
      return startCheck({ set, assigned: true });
    },
    warmUp(plan, continueLesson) {
      if (!mapRoute || routes.indexOf(plan.flight) < 1) return false;
      showRoute(plan.flight);
      return startCheck({ lessonId: plan.lesson, continueLesson });
    }
  };
}());
