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
  const pick = id => document.getElementById(id);
  const mapRoute = pick("studentMapRoute");
  const chooser = pick("earlierPartChoice");
  const open = pick("openEarlierPart");
  const check = pick("earlierPartsCheck");
  const title = pick("earlierCheckTitle");
  const options = pick("earlierCheckOptions");
  const feedback = pick("earlierCheckFeedback");
  const next = pick("earlierCheckNext");
  const close = pick("earlierCheckClose");
  const status = pick("earlierPartStatus");
  let route = "";
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
    pick("earlierPartsChoices").hidden = false;
    round = null;
  }

  function updateRoute() {
    const context = access.getContext();
    const nextRoute = context?.status === "authorized" && context.mode === "student" ? mapRoute?.value : "";
    if (route === nextRoute) return;
    route = nextRoute;
    resetCheck();
    const routeIndex = routes.indexOf(route);
    panel.hidden = routeIndex < 1;
    panel.open = false;
    if (panel.hidden) return;
    pick("earlierPartsIntro").textContent = routeIndex === 1
      ? "Revisit parts from Route 1."
      : "Revisit parts from Routes 1 and 2.";
    chooser.replaceChildren(new Option("Choose a word part", ""));
    for (const part of partsByRoute.slice(0, routeIndex).flat()) {
      chooser.add(new Option(`${part.label} · ${part.meaning}`, part.id));
    }
    open.disabled = true;
    status.textContent = "";
  }

  function showQuestion() {
    const part = round.questions[round.index];
    const example = part.currentExamples.split(" · ")[0];
    pick("earlierCheckPrompt").textContent = `${round.index + 1} of ${round.questions.length}. In ${example}, what does ${part.label} mean or do?`;
    feedback.textContent = "";
    next.hidden = true;
    const alternatives = shuffled(round.pool.filter(other => other.id !== part.id && other.label !== part.label));
    options.replaceChildren();
    for (const choice of shuffled([part, ...alternatives.slice(0, 2)])) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = choice.meaning;
      button.addEventListener("click", () => {
        for (const answer of options.children) answer.disabled = true;
        if (choice !== part) {
          chooser.value = part.id;
          open.disabled = false;
        }
        feedback.textContent = `${choice === part ? "Yes." : "Take a look."} In ${example}, ${part.label} means ${part.meaning}.`;
        next.textContent = round.index + 1 < round.questions.length
          ? "Next question" : round.continueLesson ? "Continue to lesson" : "Finish check";
        next.hidden = false;
        next.focus();
      });
      options.append(button);
    }
  }

  function startCheck(lessonId, continueLesson) {
    const routeIndex = routes.indexOf(route);
    if (routeIndex < 1) return false;
    const pools = partsByRoute.slice(0, routeIndex).map((parts, index) =>
      shuffled(reviewIds[index].map(id => parts.find(part => part.id === id)).filter(Boolean))
    );
    const pool = pools.flat();
    const related = relatedParts[lessonId];
    const starters = pools.map(items => items.find(part => part.id === related) || items[0]);
    const questions = [...new Set([...starters, ...pool])].slice(0, continueLesson ? 2 : 3);
    round = { pool, questions, index: 0, continueLesson };
    panel.open = true;
    pick("earlierPartsChoices").hidden = Boolean(continueLesson);
    check.hidden = false;
    title.textContent = continueLesson ? "Quick warm-up" : "Mixed check";
    close.textContent = continueLesson ? "Skip to lesson" : "Close check";
    showQuestion();
    title.focus();
    return true;
  }

  function finishCheck() {
    const continueLesson = round?.continueLesson;
    resetCheck();
    if (continueLesson) {
      panel.open = false;
      continueLesson();
    } else {
      pick("checkEarlierParts").focus();
    }
  }

  chooser.addEventListener("change", () => {
    open.disabled = !chooser.value;
    status.textContent = "";
  });
  open.addEventListener("click", () => {
    const part = partsByRoute.slice(0, routes.indexOf(route)).flat().find(item => item.id === chooser.value);
    if (!part) return;
    const reviewedRoute = route;
    if (!window.FirstVoloPracticeChoices?.apply(lessons.plan(part.introBand, part.id))) {
      status.textContent = "This review could not open. Choose another word part.";
      return;
    }
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
  });

  pick("checkEarlierParts").addEventListener("click", () => startCheck());
  next.addEventListener("click", () => {
    if (!round || ++round.index >= round.questions.length) return finishCheck();
    showQuestion();
    pick("earlierCheckPrompt").tabIndex = -1;
    pick("earlierCheckPrompt").focus();
  });
  close.addEventListener("click", finishCheck);
  mapRoute?.addEventListener("change", updateRoute);
  pick("gradeBandSelect")?.addEventListener("change", updateRoute);
  window.addEventListener("firstvolopracticeplanroutechange", updateRoute);
  access.subscribe(updateRoute);

  window.FirstVoloEarlierWordParts = {
    warmUp(plan, continueLesson) {
      if (!mapRoute || routes.indexOf(plan.flight) < 1) return false;
      if (mapRoute.value !== plan.flight) {
        mapRoute.value = plan.flight;
        mapRoute.dispatchEvent(new Event("change"));
      }
      return startCheck(plan.lesson, continueLesson);
    }
  };
}());
