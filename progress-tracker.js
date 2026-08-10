"use strict";

const FV_PROGRESS_KEY = "firstVoloMorphologyProgressV1";

function loadProgressData() {
  try {
    const saved = JSON.parse(localStorage.getItem(FV_PROGRESS_KEY));
    if (saved && Array.isArray(saved.students)) {
      return saved;
    }
  } catch (error) {
    console.warn("Could not read saved First Volo progress data.", error);
  }

  return {
    students: [],
    activeStudentId: null
  };
}

let progressData = loadProgressData();

const studentSelect = document.getElementById("studentSelect");
const studentName = document.getElementById("studentName");
const addStudentButton = document.getElementById("addStudentButton");
const studentSummary = document.getElementById("studentSummary");
const studentSummaryName = document.getElementById("studentSummaryName");
const studentSummaryText = document.getElementById("studentSummaryText");
const renameStudentButton = document.getElementById("renameStudentButton");
const clearStudentProgressButton = document.getElementById("clearStudentProgressButton");
const deleteStudentButton = document.getElementById("deleteStudentButton");

function saveProgressData() {
  localStorage.setItem(FV_PROGRESS_KEY, JSON.stringify(progressData));
}

function makeStudentId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `student-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getActiveStudent() {
  return progressData.students.find(
    (student) => student.id === progressData.activeStudentId
  ) || null;
}

function renderStudentRoster() {
  studentSelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a student";
  studentSelect.append(placeholder);

  progressData.students
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((student) => {
      const option = document.createElement("option");
      option.value = student.id;
      option.textContent = student.name;
      studentSelect.append(option);
    });

  studentSelect.value = progressData.activeStudentId || "";
  renderStudentSummary();
}

function renderStudentSummary() {
  const student = getActiveStudent();

  if (!student) {
    studentSummary.hidden = true;
    return;
  }

  studentSummary.hidden = false;
  studentSummaryName.textContent = student.name;

  const sessions = Array.isArray(student.sessions)
  ? student.sessions
  : [];

const completedCount = sessions.filter(
  (session) => Boolean(session.completedAt)
).length;

const inProgressCount = sessions.filter(
  (session) =>
    !session.completedAt &&
    Array.isArray(session.responses) &&
    session.responses.length > 0
).length;

studentSummaryText.textContent =
  completedCount === 0 && inProgressCount === 0
    ? "No saved progress yet."
    : `${completedCount} completed ${completedCount === 1 ? "session" : "sessions"}` +
      (inProgressCount > 0
        ? ` · ${inProgressCount} in progress`
        : "");

renderStudentProgressDetails(student);
}

addStudentButton.addEventListener("click", () => {
  const name = studentName.value.trim();

  if (!name) {
    studentName.focus();
    return;
  }

  const student = {
    id: makeStudentId(),
    name,
    createdAt: new Date().toISOString(),
    sessions: []
  };

  progressData.students.push(student);
  progressData.activeStudentId = student.id;

  saveProgressData();
  studentName.value = "";
  renderStudentRoster();
});

studentName.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addStudentButton.click();
  }
});

studentSelect.addEventListener("change", () => {
  progressData.activeStudentId = studentSelect.value || null;
  saveProgressData();
  renderStudentSummary();
});

renameStudentButton.addEventListener("click", () => {
  const student = getActiveStudent();
  if (!student) return;

  const updatedName = window.prompt(
    "Rename student:",
    student.name
  );

  if (!updatedName || !updatedName.trim()) return;

  student.name = updatedName.trim();
  saveProgressData();
  renderStudentRoster();
});

clearStudentProgressButton.addEventListener("click", () => {
  const student = getActiveStudent();
  if (!student) return;

  const confirmed = window.confirm(
    `Clear all saved program progress for ${student.name}? The student profile will be kept.`
  );

  if (!confirmed) return;

  student.sessions = [];
  saveProgressData();
  renderStudentRoster();
});

deleteStudentButton.addEventListener("click", () => {
  const student = getActiveStudent();
  if (!student) return;

  const confirmed = window.confirm(
    `Delete ${student.name} and all saved progress for this student?`
  );

  if (!confirmed) return;

  progressData.students = progressData.students.filter(
    (item) => item.id !== student.id
  );

  progressData.activeStudentId = null;

  saveProgressData();
  renderStudentRoster();
});

window.FirstVoloProgress = {
  getData: () => progressData,
  getActiveStudent,
  save: saveProgressData
};

renderStudentRoster();

function getProgressActivityLabel(activity) {
  const labels = {
    find: "Find",
    hunt: "Word Hunt",
    meaning: "Meaning",
    morpheme: "Word Part",
    break: "Break It Apart",
    infer: "Figure It Out",
    use: "Use It",
    change: "Change It"
  };

  return labels[activity] || activity || "Activity";
}

function getProgressSkillLabel(skill) {
  const labels = {
    find: "Find",
    hunt: "Word Hunt",
    meaning: "Meaning",
    morpheme: "Word Part",
    break: "Break It Apart",
    infer: "Figure It Out",
    use: "Use It",
    change: "Change It"
  };

  return labels[skill] || skill || "Activity";
}

function renderStudentProgressDetails(student) {
  let details =
    document.getElementById("studentProgressDetails");

  if (!details) {
    details = document.createElement("div");
    details.id = "studentProgressDetails";
    details.className = "student-progress-details";

    studentSummary.append(details);
  }

  details.innerHTML = "";

  const sessions = Array.isArray(student.sessions)
    ? student.sessions
    : [];

  if (sessions.length === 0) {
    return;
  }

  const recentHeading = document.createElement("h4");
  recentHeading.textContent = "Recent Sessions";
  details.append(recentHeading);

  sessions
    .slice()
    .sort((a, b) => {
      const aDate = a.completedAt || a.startedAt || "";
      const bDate = b.completedAt || b.startedAt || "";
      return bDate.localeCompare(aDate);
    })
    .slice(0, 20)
    .forEach((session) => {
      const row = document.createElement("div");
      row.className = "progress-session-row";

      const responses = Array.isArray(session.responses)
        ? session.responses
        : [];

      const attempted = responses.length;

      const correct =
        Number.isFinite(session.correct)
          ? session.correct
          : responses.filter((response) => response.correct).length;

      const accuracy =
        Number.isFinite(session.accuracy)
          ? session.accuracy
          : attempted > 0
            ? Math.round((correct / attempted) * 100)
            : null;

      const dateValue =
        session.completedAt ||
        session.startedAt;

      const dateLabel = dateValue
        ? new Date(dateValue).toLocaleDateString()
        : "Saved session";

      const totalItems = Number(session.totalItems) || attempted;

      const isComplete =
        Boolean(session.completedAt) ||
        (totalItems > 0 && attempted >= totalItems);

      const scoreText =
        attempted > 0
          ? `${correct}/${attempted} correct` +
            (accuracy !== null ? ` (${accuracy}%)` : "")
          : "No answers yet";

      row.textContent =
        `${dateLabel} · ` +
        `${getProgressActivityLabel(session.activity)} · ` +
        `${attempted}/${totalItems} answered · ` +
        `${scoreText} · ` +
        `${isComplete ? "Session complete" : "In progress"}`;

      details.append(row);
    });

  const wordParts = new Map();

  sessions.forEach((session) => {
    const responses = Array.isArray(session.responses)
      ? session.responses
      : [];

    responses.forEach((response) => {
      if (!response.primaryTarget) {
        return;
      }

      const type =
        response.targetType || "word part";

      const key =
        `${type}::${response.primaryTarget}`;

      if (!wordParts.has(key)) {
        wordParts.set(key, {
          label: response.primaryTarget,
          type,
          attempts: 0,
          correct: 0,
          skills: {}
        });
      }

      const entry = wordParts.get(key);

      entry.attempts += 1;

      if (response.correct) {
        entry.correct += 1;
      }

      const skill =
        response.skill || "activity";

      if (!entry.skills[skill]) {
        entry.skills[skill] = {
          attempts: 0,
          correct: 0
        };
      }

      entry.skills[skill].attempts += 1;

      if (response.correct) {
        entry.skills[skill].correct += 1;
      }
    });
  });

  const wordPartHeading = document.createElement("h4");
  wordPartHeading.textContent = "Word-Part Performance";
  details.append(wordPartHeading);

  if (wordParts.size === 0) {
    const empty = document.createElement("p");
    empty.textContent =
      "No word-part-specific responses saved yet.";
    details.append(empty);
    return;
  }

  [...wordParts.values()]
    .sort((a, b) =>
      a.type.localeCompare(b.type) ||
      a.label.localeCompare(b.label)
    )
    .forEach((entry) => {
      const row = document.createElement("div");
      row.className = "word-part-progress-row";

      const accuracy =
        Math.round(
          (entry.correct / entry.attempts) * 100
        );

      const main = document.createElement("div");
      main.textContent =
        `${entry.label} (${entry.type}) — ` +
        `${entry.correct}/${entry.attempts} (${accuracy}%)`;

      row.append(main);

      const skillLine = document.createElement("small");

      skillLine.textContent =
        Object.entries(entry.skills)
          .map(([skill, score]) =>
            `${getProgressSkillLabel(skill)} ` +
            `${score.correct}/${score.attempts}`
          )
          .join(" · ");

      row.append(skillLine);
      details.append(row);
    });
}


function refreshProgressFromStorage() {
  progressData = loadProgressData();
  renderStudentRoster();
}

window.addEventListener("focus", refreshProgressFromStorage);
window.addEventListener("storage", (event) => {
  if (event.key === FV_PROGRESS_KEY) {
    refreshProgressFromStorage();
  }
});
