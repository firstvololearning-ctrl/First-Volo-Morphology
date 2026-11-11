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
    const remaining = new Map(parts.map(item => [item.id, item]));
    for (const set of window.FIRST_VOLO_TOKEN_SETS || []) {
      if (set.introBand !== route) continue;
      const group = select.ownerDocument.createElement("optgroup");
      group.label = set.label;
      for (const id of set.morphemeIds) {
        const item = remaining.get(id);
        if (!item) continue;
        group.append(new Option(`${item.label} · ${item.meaning}`, item.id));
        remaining.delete(id);
      }
      if (group.children.length) select.append(group);
    }
    if (remaining.size) {
      const group = select.ownerDocument.createElement("optgroup");
      group.label = "Additional lessons";
      for (const item of remaining.values()) {
        group.append(new Option(`${item.label} · ${item.meaning}`, item.id));
      }
      select.append(group);
    }
    select.value = parts.some(item => item.id === selected) ? selected : "";
  }

  function plan(route, lesson) {
    const item = choices(route).find(part => part.id === lesson);
    return item && { flight: route, study: studyFor[item.type], activity: "learn", challenge: false, lesson };
  }

  window.FirstVoloLessonChoices = { choices, populate, plan, starter: route => starters[route] };
}());
