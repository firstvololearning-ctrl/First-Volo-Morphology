(function () {
  "use strict";
  const studyFor = { prefix: "prefixes", root: "roots", suffix: "suffixes" };
  const starters = { "2-3": "un-negation", "4-5": "port", "6-8": "pel" };
  const inventory = window.FIRST_VOLO_MORPHEME_INVENTORY || [];

  function choices(route) {
    return inventory.filter(item => item.introBand === route && Object.hasOwn(studyFor, item.type) &&
      (route !== "2-3" || item.type !== "root"));
  }

  function populate(select, route, selected = "") {
    const parts = choices(route);
    select.replaceChildren(new Option("Choose a word part", ""));
    for (const item of parts) select.add(new Option(`${item.label} · ${item.meaning}`, item.id));
    select.value = parts.some(item => item.id === selected) ? selected : "";
  }

  function plan(route, lesson) {
    const item = choices(route).find(part => part.id === lesson);
    return item && { flight: route, study: studyFor[item.type], activity: "learn", challenge: false, lesson };
  }

  window.FirstVoloLessonChoices = { choices, populate, plan, starter: route => starters[route] };
}());
