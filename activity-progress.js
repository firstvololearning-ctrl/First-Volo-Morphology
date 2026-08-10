"use strict";

const FV_ACTIVITY_PROGRESS_KEY = "firstVoloMorphologyProgressV1";
const activityStudentSelect = document.getElementById("activityStudentSelect");

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

function saveActivityProgressData() {
  localStorage.setItem(
    FV_ACTIVITY_PROGRESS_KEY,
    JSON.stringify(activityProgressData)
  );
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
}

activityStudentSelect.addEventListener("change", () => {
  activityProgressData.activeStudentId =
    activityStudentSelect.value || null;

  saveActivityProgressData();
});

window.FirstVoloActivityProgress = {
  getData: () => activityProgressData,
  getActiveStudent: () =>
    activityProgressData.students.find(
      (student) => student.id === activityProgressData.activeStudentId
    ) || null,
  save: saveActivityProgressData
};

renderActivityStudentSelect();
