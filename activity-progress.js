"use strict";

const FV_ACTIVITY_PROGRESS_KEY = "firstVoloMorphologyProgressV1";
const activityStudentSelect =
  document.getElementById("activityStudentSelect");

const activityStudentChips =
  document.getElementById("activityStudentChips");

function loadActivityProgressData() {
  try {
    const saved = JSON.parse(localStorage.getItem(FV_ACTIVITY_PROGRESS_KEY));

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

let activityProgressData = loadActivityProgressData();
let currentProgressSession = null;

function notifyActivityProgressChanged() {
  window.dispatchEvent(
    new CustomEvent("firstvoloprogresschange")
  );
}

function saveActivityProgressData() {
  const tokenUpdate =
    window.FirstVoloTokens
      ?.updateEarnedTokens(
        activityProgressData
      );

  localStorage.setItem(
    FV_ACTIVITY_PROGRESS_KEY,
    JSON.stringify(activityProgressData)
  );

  notifyActivityProgressChanged();

  const activeStudentTokens =
    tokenUpdate?.newlyEarned?.filter(
      (token) =>
        token.studentId ===
        activityProgressData.activeStudentId
    ) || [];

  if (activeStudentTokens.length) {
    window.dispatchEvent(
      new CustomEvent(
        "firstvolotokenearned",
        {
          detail: {
            tokens:
              activeStudentTokens
          }
        }
      )
    );
  }
}

function makeProgressId(prefix) {
  if (crypto && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getActiveStudent() {
  return (
    activityProgressData.students.find(
      (student) => student.id === activityProgressData.activeStudentId
    ) || null
  );
}

function getStudentInitial(name) {
  const trimmed = String(name || "").trim();

  return trimmed
    ? trimmed.charAt(0).toUpperCase()
    : "?";
}

function updateActivityStudentChips() {
  if (!activityStudentChips) return;

  const activeId =
    activityProgressData.activeStudentId || "";

  activityStudentChips
    .querySelectorAll(".student-chip")
    .forEach((button) => {
      const isActive =
        button.dataset.studentId === activeId;

      button.classList.toggle(
        "is-active",
        isActive
      );

      button.setAttribute(
        "aria-pressed",
        String(isActive)
      );
    });
}

function renderActivityStudentChips() {
  if (!activityStudentChips) return;

  activityStudentChips.innerHTML = "";

  const choices = [
    {
      id: "",
      name: "Not saving",
      noStudent: true
    },
    ...activityProgressData.students
      .slice()
      .sort(
        (a, b) =>
          a.name.localeCompare(b.name)
      )
  ];

  choices.forEach((student) => {
    const button =
      document.createElement("button");

    button.type = "button";
    button.className = "student-chip";
    button.dataset.studentId = student.id;

    if (student.noStudent) {
      button.classList.add(
        "student-chip-none"
      );
    }

    button.setAttribute(
      "aria-label",
      student.noStudent
        ? "Do not save progress to a student"
        : `Study as ${student.name}`
    );

    const initial =
      document.createElement("span");

    initial.className =
      "student-chip-initial";

    initial.setAttribute(
      "aria-hidden",
      "true"
    );

    initial.textContent =
      student.noStudent
        ? "—"
        : getStudentInitial(student.name);

    const name =
      document.createElement("span");

    name.className =
      "student-chip-name";

    name.textContent =
      student.name;

    const check =
      document.createElement("span");

    check.className =
      "student-chip-check";

    check.setAttribute(
      "aria-hidden",
      "true"
    );

    check.textContent = "✓";

    button.append(
      initial,
      name,
      check
    );

    button.addEventListener(
      "click",
      () => {
        if (
          activityStudentSelect.value ===
          student.id
        ) {
          return;
        }

        activityStudentSelect.value =
          student.id;

        activityStudentSelect.dispatchEvent(
          new Event(
            "change",
            { bubbles: true }
          )
        );
      }
    );

    activityStudentChips.append(button);
  });

  updateActivityStudentChips();
}

function renderActivityStudentSelect() {
  activityStudentSelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "No student selected";
  activityStudentSelect.append(placeholder);

  activityProgressData.students
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((student) => {
      const option = document.createElement("option");
      option.value = student.id;
      option.textContent = student.name;
      activityStudentSelect.append(option);
    });

  activityStudentSelect.value =
    activityProgressData.activeStudentId || "";

  renderActivityStudentChips();
}

function startProgressSession({
  activity,
  studyMode = null,
  gradeBand = "all",
  vocabLevel = "all",
  totalItems = 0
}) {
  const student = getActiveStudent();

  if (!student) {
    currentProgressSession = null;
    return null;
  }

  currentProgressSession = {
    id: makeProgressId("session"),
    startedAt: new Date().toISOString(),
    completedAt: null,
    activity,
    studyMode,
    gradeBand,
    vocabLevel,
    totalItems,
    correct: 0,
    accuracy: null,
    responses: []
  };

  return currentProgressSession;
}

function recordProgressResponse({
  skill,
  correct,
  primaryTarget = null,
  primaryTargetId = null,
  targetType = null,
  supportingTargets = [],
  supportingTargetIds = [],
  word = null,
  itemId = null,
  response = null,
  correctAnswer = null
}) {
  if (!currentProgressSession) {
    return null;
  }

  const entry = {
    id: makeProgressId("response"),
    questionNumber: currentProgressSession.responses.length + 1,
    skill,
    correct: Boolean(correct),
    primaryTarget,
    primaryTargetId,
    targetType,
    supportingTargets,
    supportingTargetIds,
    word,
    itemId,
    response,
    correctAnswer
  };

  currentProgressSession.responses.push(entry);

  if (entry.correct) {
    currentProgressSession.correct += 1;
  }

  const student = getActiveStudent();

  if (student) {
    if (!Array.isArray(student.sessions)) {
      student.sessions = [];
    }

    const alreadySaved = student.sessions.some(
  (session) => session.id === currentProgressSession.id
);

if (!alreadySaved) {
  student.sessions = student.sessions.filter(
    (session) =>
      session.completedAt ||
      session.activity !== currentProgressSession.activity
  );

  student.sessions.push(currentProgressSession);
}

saveActivityProgressData();
  }

  if (
    currentProgressSession.totalItems > 0 &&
    currentProgressSession.responses.length >=
      currentProgressSession.totalItems
  ) {
    finishProgressSession();
  }

  return entry;
}

function finishProgressSession() {
  const student = getActiveStudent();

  if (!student || !currentProgressSession) {
    currentProgressSession = null;
    return null;
  }

  const attempted = currentProgressSession.responses.length;

  currentProgressSession.completedAt =
    new Date().toISOString();

  currentProgressSession.totalItems =
    currentProgressSession.totalItems || attempted;

  currentProgressSession.accuracy =
    attempted > 0
      ? Math.round(
          (currentProgressSession.correct / attempted) * 100
        )
      : 0;

  const savedSession = currentProgressSession;

  currentProgressSession = null;

  saveActivityProgressData();

  return savedSession;
}

function cancelProgressSession() {
  currentProgressSession = null;
}

activityStudentSelect.addEventListener("change", () => {
  activityProgressData.activeStudentId =
    activityStudentSelect.value || null;

  cancelProgressSession();
  saveActivityProgressData();
  updateActivityStudentChips();
});

window.FirstVoloActivityProgress = {
  getData: () => activityProgressData,
  getActiveStudent,
  getCurrentSession: () => currentProgressSession,
  startSession: startProgressSession,
  recordResponse: recordProgressResponse,
  finishSession: finishProgressSession,
  cancelSession: cancelProgressSession,
  save: saveActivityProgressData
};

renderActivityStudentSelect();


function refreshActivityProgressFromStorage() {
  if (currentProgressSession) {
    return;
  }

  activityProgressData = loadActivityProgressData();
  renderActivityStudentSelect();
  notifyActivityProgressChanged();
}

window.addEventListener("focus", refreshActivityProgressFromStorage);
window.addEventListener("storage", (event) => {
  if (event.key === FV_ACTIVITY_PROGRESS_KEY) {
    refreshActivityProgressFromStorage();
  }
});
