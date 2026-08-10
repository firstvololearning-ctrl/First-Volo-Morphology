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

  const sessionCount = Array.isArray(student.sessions)
    ? student.sessions.length
    : 0;

  studentSummaryText.textContent =
    sessionCount === 0
      ? "No saved sessions yet."
      : `${sessionCount} saved ${sessionCount === 1 ? "session" : "sessions"}.`;
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
