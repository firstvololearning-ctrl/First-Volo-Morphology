"use strict";

(function () {
  const tasks = {
    morpheme: "Name the word part from a meaning clue",
    find: "Locate the meaningful part in a word",
    meaning: "Explain what the part means or does",
    infer: "Work out a fresh word’s meaning",
    use: "Produce a word or form that fits a sentence",
    break: "Break a fresh word into meaningful parts",
    build: "Build a fresh word from meaningful parts",
    change: "Explain how a word change affects meaning or use"
  };
  const outcomes = {
    independent: "Correct independently",
    cued: "Correct after a cue",
    retry: "Needs more practice"
  };
  const sets = window.FIRST_VOLO_TOKEN_SETS || [];
  const targetIds = new Set(sets.flatMap(set => set.morphemeIds));
  const targets = new Map((window.FIRST_VOLO_MORPHEME_INVENTORY || [])
    .filter(part => targetIds.has(part.id))
    .map(part => [part.id, part.label]));

  function validate(entry) {
    return entry && targets.has(entry.targetId) &&
      Object.hasOwn(tasks, entry.task) &&
      Object.hasOwn(outcomes, entry.outcome) &&
      typeof entry.word === "string" &&
      /^[a-z]+(?:[-'][a-z]+)*$/.test(entry.word) &&
      entry.word.length <= 40 &&
      /^\d{4}-\d{2}-\d{2}$/.test(entry.date) &&
      Number.isFinite(Date.parse(entry.date)) &&
      new Date(entry.date).toISOString().slice(0, 10) === entry.date &&
      Boolean(window.FirstVoloInstructionalProtection) &&
      !window.FirstVoloInstructionalProtection.isProtected(entry.word);
  }

  function latest(student) {
    const entries = new Map();
    for (const session of student.sessions || []) {
      const entry = session.teacherObservation;
      if (session.activity !== "teacher-observation" || !entry || !validate(entry)) continue;
      const key = [entry.date, entry.targetId, entry.task, entry.word].join("|");
      const previous = entries.get(key);
      if (!previous || session.completedAt > previous.completedAt ||
          (session.completedAt === previous.completedAt && session.id > previous.id)) {
        entries.set(key, session);
      }
    }
    return [...entries.values()];
  }

  function evidenceSessions(student) {
    const sessions = new Map();
    for (const { teacherObservation: entry } of latest(student)) {
      if (entry.outcome === "cued") continue;
      if (!sessions.has(entry.date)) {
        sessions.set(entry.date, {
          id: `teacher-observation-${entry.date}`,
          completedAt: `${entry.date}T12:00:00.000Z`,
          teacherObserved: true,
          responses: []
        });
      }
      sessions.get(entry.date).responses.push({
        skill: entry.task,
        primaryTargetId: entry.targetId,
        correct: entry.outcome === "independent"
      });
    }
    return [...sessions.values()];
  }

  window.FirstVoloTeacherObservation = { sets, tasks, outcomes, targets, validate, latest, evidenceSessions };
})();
