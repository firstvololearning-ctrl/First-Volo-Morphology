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

const initialTokenSync =
  window.FirstVoloTokens
    ?.updateEarnedTokens(
      progressData
    );

if (initialTokenSync?.changed) {
  localStorage.setItem(
    FV_PROGRESS_KEY,
    JSON.stringify(progressData)
  );
}

const studentSelect =
  document.getElementById("studentSelect");

const progressStudentChips =
  document.getElementById("progressStudentChips");

const studentName =
  document.getElementById("studentName");
const addStudentButton = document.getElementById("addStudentButton");
const studentSummary = document.getElementById("studentSummary");
const studentSummaryName = document.getElementById("studentSummaryName");
const studentSummaryText = document.getElementById("studentSummaryText");
const renameStudentButton = document.getElementById("renameStudentButton");
const clearStudentProgressButton = document.getElementById("clearStudentProgressButton");
const deleteStudentButton = document.getElementById("deleteStudentButton");

function saveProgressData() {
  localStorage.setItem(
    FV_PROGRESS_KEY,
    JSON.stringify(progressData)
  );

  window.FirstVoloMorphologyCloud
    ?.queueSync
    ?.();
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

function getProgressStudentInitial(name) {
  const trimmed =
    String(name || "").trim();

  return trimmed
    ? trimmed.charAt(0).toUpperCase()
    : "?";
}

function updateProgressStudentChips() {
  if (!progressStudentChips) return;

  const activeId =
    progressData.activeStudentId || "";

  progressStudentChips
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

function renderProgressStudentChips() {
  if (!progressStudentChips) return;

  progressStudentChips.innerHTML = "";

  progressData.students
    .slice()
    .sort(
      (a, b) =>
        a.name.localeCompare(b.name)
    )
    .forEach((student) => {
      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "student-chip";
      button.dataset.studentId = student.id;

      button.setAttribute(
        "aria-label",
        `Select ${student.name}`
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
        getProgressStudentInitial(
          student.name
        );

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
            studentSelect.value ===
            student.id
          ) {
            return;
          }

          studentSelect.value =
            student.id;

          studentSelect.dispatchEvent(
            new Event(
              "change",
              { bubbles: true }
            )
          );
        }
      );

      progressStudentChips.append(
        button
      );
    });

  updateProgressStudentChips();
}

function renderStudentRoster() {
  studentSelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a learner";
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

  studentSelect.value =
    progressData.activeStudentId || "";

  renderProgressStudentChips();
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
    nameUpdatedAt: new Date().toISOString(),
    sessions: [],
    voloTokens: {}
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
  progressData.activeStudentId =
    studentSelect.value || null;

  saveProgressData();
  updateProgressStudentChips();
  renderStudentSummary();
});

renameStudentButton.addEventListener("click", () => {
  const student = getActiveStudent();
  if (!student) return;

  const updatedName = window.prompt(
    "Rename learner:",
    student.name
  );

  if (!updatedName || !updatedName.trim()) return;

  student.name = updatedName.trim();

  /*
    Record when this learner was intentionally
    renamed so the newest rename can win
    across devices.
  */
  student.nameUpdatedAt =
    new Date().toISOString();

  saveProgressData();
  renderStudentRoster();
});

clearStudentProgressButton.addEventListener("click", () => {
  const student = getActiveStudent();
  if (!student) return;

  const confirmed = window.confirm(
    `Clear all saved program progress for ${student.name}? The learner profile will be kept.`
  );

  if (!confirmed) return;

  student.sessions = [];
  student.voloTokens = {};

  /*
    Record this intentional reset so an
    older cloud copy cannot restore the
    cleared sessions or Tokens.
  */
  student.progressClearedAt =
    new Date().toISOString();

  saveProgressData();
  renderStudentRoster();
});

deleteStudentButton.addEventListener("click", () => {
  const student = getActiveStudent();
  if (!student) return;

  const confirmed = window.confirm(
    `Delete ${student.name} from First Volo Morphology and remove all saved Morphology progress for this learner? Other First Volo products are not affected.`
  );

  if (!confirmed) return;

  if (
    !progressData.deletedMorphologyLearners ||
    typeof progressData.deletedMorphologyLearners !==
      "object" ||
    Array.isArray(
      progressData.deletedMorphologyLearners
    )
  ) {
    progressData.deletedMorphologyLearners = {};
  }

  /*
    Keep a product-specific deletion marker.

    The learner is removed from Morphology,
    but the shared First Volo learner profile
    remains available to other products.
  */
  progressData.deletedMorphologyLearners[
    student.id
  ] = new Date().toISOString();

  progressData.students =
    progressData.students.filter(
      (item) =>
        item.id !== student.id
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

function getProgressActivityLabel(activity) {
  const labels = {
    find: "Find",
    hunt: "Word Hunt",
    meaning: "Meaning",
    morpheme: "Word Part",
    break: "Break It Apart",
    infer: "Figure It Out",
    build: "Build Words",
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
    build: "Build Words",
    use: "Use It",
    change: "Change It"
  };

  return labels[skill] || skill || "Activity";
}

const FV_STANDARD_DEFINITIONS = {
  "2-3": {
    meaning: {
      codes: "CCSS L.2.4b-c / L.3.4b-c",
      description:
        "Use known prefixes, affixes, and roots to determine or clarify word meaning."
    },
    analysis: {
      codes: "CCSS RF.2.3d / RF.3.3a-b",
      description:
        "Use common prefixes, suffixes, and morphology in word reading and analysis."
    }
  },

  "4-5": {
    meaning: {
      codes: "CCSS L.4.4b / L.5.4b",
      description:
        "Use common, grade-appropriate Greek and Latin affixes and roots as clues to word meaning."
    },
    analysis: {
      codes: "CCSS RF.4.3a / RF.5.3a",
      description:
        "Use morphology, including roots and affixes, when reading unfamiliar multisyllabic words."
    }
  },

  "6-8": {
    meaning: {
      codes: "CCSS L.6.4b / L.7.4b / L.8.4b",
      description:
        "Use common, grade-appropriate Greek and Latin affixes and roots as clues to word meaning."
    }
  }
};

const FV_ACTIVITY_STANDARD_MAP = {
  "2-3": {
    find: ["analysis"],
    hunt: ["analysis"],
    break: ["analysis"],
    meaning: ["meaning"],
    morpheme: ["meaning"],
    infer: ["meaning"],
    build: ["meaning"],
    use: ["meaning"],
    change: ["meaning"]
  },

  "4-5": {
    find: ["analysis"],
    hunt: ["analysis"],
    break: ["analysis"],
    meaning: ["meaning"],
    morpheme: ["meaning"],
    infer: ["meaning"],
    build: ["meaning"],
    use: ["meaning"],
    change: ["meaning"]
  },

  "6-8": {
    meaning: ["meaning"],
    morpheme: ["meaning"],
    infer: ["meaning"],
    build: ["meaning"],
    use: ["meaning"],
    change: ["meaning"]
  }
};

function getProgressGradeBandLabel(gradeBand) {
  const labels = {
    "2-3": "Flight A",
    "4-5": "Flight B",
    "6-8": "Flight C"
  };

  return labels[gradeBand] || gradeBand;
}


/* ========================================
   VOLO TOKEN PROGRESS DISPLAY
   ======================================== */

function formatTokenPercent(value) {
  return `${Math.round((Number(value) || 0) * 100)}%`;
}

function getTokenEarnedDate(student, setId) {
  const earned =
    student?.voloTokens?.[setId];

  if (!earned?.earnedAt) {
    return "";
  }

  const date =
    new Date(earned.earnedAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString();
}

function getTokenEvidenceStatus(
  ready,
  accuracyValue,
  threshold
) {
  if (!ready) {
    return "building evidence";
  }

  if (accuracyValue < threshold) {
    return (
      `${formatTokenPercent(accuracyValue)} · ` +
      `needs ${formatTokenPercent(threshold)}`
    );
  }

  return `ready (${formatTokenPercent(accuracyValue)})`;
}

function renderVoloTokenProgress(
  student,
  container
) {
  if (!window.FirstVoloTokens) {
    return;
  }

  const statuses =
    window.FirstVoloTokens
      .evaluateStudent(student);

  if (!statuses.length) {
    return;
  }

  const earnedCount =
    statuses.filter(
      (status) =>
        window.FirstVoloTokens
          .isTokenEarned(
            student,
            status.setId
          )
    ).length;

  const section =
    document.createElement("section");

  section.className =
    "volo-token-progress";

  const heading =
    document.createElement("h4");

  heading.className =
    "volo-token-progress-heading";

  heading.textContent =
    "🪙 Volo Tokens";

  section.append(heading);

  const summary =
    document.createElement("div");

  summary.className =
    "volo-token-summary";

  summary.textContent =
    `${earnedCount}/${statuses.length} Tokens earned`;

  section.append(summary);

  const intro =
    document.createElement("p");

  intro.className =
    "volo-token-progress-intro";

  intro.textContent =
    "Tokens recognize evidence across a set of word parts. " +
    "Once earned, a Token stays earned unless learner progress is cleared.";

  section.append(intro);

  const collections = [
    "Foundation",
    "Expansion",
    "Advanced"
  ];

  collections.forEach((collection) => {

    const collectionStatuses =
      statuses.filter(
        (status) =>
          status.collection ===
          collection
      );

    if (!collectionStatuses.length) {
      return;
    }

    const group =
      document.createElement("div");

    group.className =
      "volo-token-collection";

    const groupHeading =
      document.createElement("h5");

    groupHeading.textContent =
      collection;

    group.append(groupHeading);

    const grid =
      document.createElement("div");

    grid.className =
      "volo-token-grid";

    collectionStatuses.forEach(
      (status) => {

        const earned =
          window.FirstVoloTokens
            .isTokenEarned(
              student,
              status.setId
            );

        const card =
          document.createElement("div");

        card.className =
          "volo-token-card " +
          (earned
            ? "is-earned"
            : "is-in-progress");

        const top =
          document.createElement("div");

        top.className =
          "volo-token-card-top";

        const title =
          document.createElement("strong");

        title.className =
          "volo-token-title";

        const displayLabel =
          status.label.startsWith(
            `${status.collection} `
          )
            ? status.label.slice(
                status.collection.length + 1
              )
            : status.label;

        title.textContent =
          displayLabel;

        const badge =
          document.createElement("span");

        badge.className =
          "volo-token-status";

        badge.textContent =
          earned
            ? "✓ Earned"
            : "○ In progress";

        top.append(
          title,
          badge
        );

        card.append(top);

        if (earned) {
          const earnedLine =
            document.createElement("div");

          earnedLine.className =
            "volo-token-earned-line";

          const dateLabel =
            getTokenEarnedDate(
              student,
              status.setId
            );

          earnedLine.textContent =
            dateLabel
              ? `Volo Token earned ${dateLabel}`
              : "Volo Token earned";

          card.append(earnedLine);

          grid.append(card);
          return;
        }

        const morphemesReady =
          status.morphemes.filter(
            (item) =>
              item.knowledgeReady &&
              item.applicationReady
          ).length;

        const totalMorphemes =
          status.morphemes.length;

        const completedUnits =
          status.morphemes.reduce(
            (total, item) =>
              total +
              (item.knowledgeReady ? 1 : 0) +
              (
                item.profile !== "recognition-only" &&
                item.applicationReady
                  ? 1
                  : 0
              ),
            0
          );

        const possibleUnits =
          status.morphemes.reduce(
            (total, item) =>
              total +
              (
                item.profile === "recognition-only"
                  ? 1
                  : 2
              ),
            0
          );

        const progressPercent =
          possibleUnits
            ? Math.round(
                (completedUnits / possibleUnits) * 100
              )
            : 0;

        const progressLine =
          document.createElement("div");

        progressLine.className =
          "volo-token-progress-line";

        progressLine.textContent =
          `${morphemesReady} of ${totalMorphemes} ` +
          `word parts fully ready`;

        card.append(progressLine);

        const progressTrack =
          document.createElement("div");

        progressTrack.className =
          "volo-token-progress-track";

        progressTrack.setAttribute(
          "role",
          "progressbar"
        );

        progressTrack.setAttribute(
          "aria-valuemin",
          "0"
        );

        progressTrack.setAttribute(
          "aria-valuemax",
          "100"
        );

        progressTrack.setAttribute(
          "aria-valuenow",
          String(progressPercent)
        );

        progressTrack.setAttribute(
          "aria-label",
          `${displayLabel}: ${progressPercent}% toward Token requirements`
        );

        const progressFill =
          document.createElement("div");

        progressFill.className =
          "volo-token-progress-fill";

        progressFill.style.width =
          `${progressPercent}%`;

        progressTrack.append(progressFill);
        card.append(progressTrack);

        const knowledgeLine =
          document.createElement("small");

        knowledgeLine.className =
          "volo-token-evidence-line";

        knowledgeLine.textContent =
          "Knowledge: " +
          getTokenEvidenceStatus(
            status.allKnowledgeReady,
            status.knowledgeAccuracy,
            window.FirstVoloTokens
              .RULES.knowledgeAccuracy
          );

        card.append(knowledgeLine);

        const applicationLine =
          document.createElement("small");

        applicationLine.className =
          "volo-token-evidence-line";

        applicationLine.textContent =
          "Application: " +
          getTokenEvidenceStatus(
            status.allApplicationReady,
            status.applicationAccuracy,
            window.FirstVoloTokens
              .RULES.applicationAccuracy
          );

        card.append(applicationLine);

        const sessionsLine =
          document.createElement("small");

        sessionsLine.className =
          "volo-token-evidence-line";

        sessionsLine.textContent =
          `Sessions: ${Math.min(status.sessionCount, 2)}/2`;

        card.append(sessionsLine);

        grid.append(card);
      }
    );

    group.append(grid);
    section.append(group);
  });

  container.append(section);
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

  renderVoloTokenProgress(
    student,
    details
  );

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

      const totalItems = Number(session.totalItems) || 0;
      const isBuild = session.activity === "build";
      const isComplete = Boolean(session.completedAt);

      const progressText = isBuild
        ? `${attempted} ${attempted === 1 ? "word" : "words"} completed`
        : `${attempted}/${totalItems || attempted} answered`;

      const scoreText =
        attempted > 0
          ? isBuild
            ? `${correct}/${attempted} independent` +
              (accuracy !== null ? ` (${accuracy}%)` : "")
            : `${correct}/${attempted} correct` +
              (accuracy !== null ? ` (${accuracy}%)` : "")
          : isBuild
            ? "No completed words yet"
            : "No answers yet";

      row.textContent =
        `${dateLabel} · ` +
        `${getProgressActivityLabel(session.activity)} · ` +
        `${progressText} · ` +
        `${scoreText} · ` +
        `${isComplete ? "Session complete" : "In progress"}`;

      details.append(row);
    });

  const directWordParts = new Map();
  const applicationWordParts = new Map();

  sessions.forEach((session) => {
    const responses = Array.isArray(session.responses)
      ? session.responses
      : [];

    responses.forEach((response) => {
      if (response.primaryTarget) {
        const type =
          response.targetType || "word part";

        const key =
          `${type}::${response.primaryTarget}`;

        if (!directWordParts.has(key)) {
          directWordParts.set(key, {
            label: response.primaryTarget,
            type,
            attempts: 0,
            correct: 0,
            skills: {}
          });
        }

        const entry = directWordParts.get(key);

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
      }

      const supportingTargets =
        Array.isArray(response.supportingTargets)
          ? [...new Set(
              response.supportingTargets.filter(Boolean)
            )]
          : [];

      supportingTargets.forEach((target) => {
        if (!applicationWordParts.has(target)) {
          applicationWordParts.set(target, {
            label: target,
            opportunities: 0,
            skills: {}
          });
        }

        const entry =
          applicationWordParts.get(target);

        entry.opportunities += 1;

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
  });

  const directHeading =
    document.createElement("h4");

  directHeading.textContent =
    "Direct Word-Part Performance";

  details.append(directHeading);

  if (directWordParts.size === 0) {
    const empty = document.createElement("p");

    empty.textContent =
      "No direct word-part responses saved yet.";

    details.append(empty);
  } else {
    [...directWordParts.values()]
      .sort((a, b) =>
        a.type.localeCompare(b.type) ||
        a.label.localeCompare(b.label)
      )
      .forEach((entry) => {
        const row =
          document.createElement("div");

        row.className =
          "word-part-progress-row";

        const accuracy =
          Math.round(
            (entry.correct / entry.attempts) * 100
          );

        const main =
          document.createElement("div");

        main.textContent =
          `${entry.label} (${entry.type}) — ` +
          `${entry.correct}/${entry.attempts} ` +
          `(${accuracy}%)`;

        row.append(main);

        const skillLine =
          document.createElement("small");

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

  const applicationHeading =
    document.createElement("h4");

  applicationHeading.textContent =
    "Application & Word-Structure Evidence";

  details.append(applicationHeading);

  if (applicationWordParts.size === 0) {
    const empty = document.createElement("p");

    empty.textContent =
      "No application or word-structure responses saved yet.";

    details.append(empty);
  } else {
    [...applicationWordParts.values()]
      .sort((a, b) =>
        a.label.localeCompare(b.label)
      )
      .forEach((entry) => {
        const row =
          document.createElement("div");

        row.className =
          "word-part-progress-row";

        const main =
          document.createElement("div");

        main.textContent =
          `${entry.label} — ` +
          `${entry.opportunities} ` +
          `${entry.opportunities === 1
            ? "application opportunity"
            : "application opportunities"}`;

        row.append(main);

        const skillLine =
          document.createElement("small");

        skillLine.textContent =
          Object.entries(entry.skills)
            .map(([skill, score]) => {
              const resultLabel =
                skill === "build"
                  ? "independent"
                  : "correct";

              return (
                `${getProgressSkillLabel(skill)} ` +
                `${score.correct}/${score.attempts} ` +
                `${resultLabel}`
              );
            })
            .join(" · ");

        row.append(skillLine);
        details.append(row);
      });
  }

  const standardsPracticed = new Map();
  let allGradeResponses = 0;

  sessions.forEach((session) => {
    const band = session.gradeBand || "all";

    const responses = Array.isArray(session.responses)
      ? session.responses
      : [];

    if (band === "all") {
      allGradeResponses += responses.length;
      return;
    }

    const bandMap =
      FV_ACTIVITY_STANDARD_MAP[band];

    const definitions =
      FV_STANDARD_DEFINITIONS[band];

    if (!bandMap || !definitions) {
      return;
    }

    responses.forEach((response) => {
      const skill =
        response.skill || session.activity;

      const standardGroups =
        bandMap[skill] || [];

      standardGroups.forEach((group) => {
        const definition =
          definitions[group];

        if (!definition) {
          return;
        }

        const key =
          `${band}::${group}`;

        if (!standardsPracticed.has(key)) {
          standardsPracticed.set(key, {
            band,
            codes: definition.codes,
            description: definition.description,
            opportunities: 0,
            direct: 0,
            application: 0,
            activities: new Set(),
            wordParts: new Set()
          });
        }

        const entry =
          standardsPracticed.get(key);

        entry.opportunities += 1;
        entry.activities.add(
          getProgressSkillLabel(skill)
        );

        if (response.primaryTarget) {
          entry.direct += 1;
          entry.wordParts.add(
            response.primaryTarget
          );
        } else {
          const supportingTargets =
            Array.isArray(response.supportingTargets)
              ? response.supportingTargets
              : [];

          if (supportingTargets.length > 0) {
            entry.application += 1;

            supportingTargets
              .filter(Boolean)
              .forEach((target) =>
                entry.wordParts.add(target)
              );
          }
        }
      });
    });
  });

  const standardsHeading =
    document.createElement("h4");

  standardsHeading.textContent =
    "Standards Practiced";

  details.append(standardsHeading);

  const standardsNote =
    document.createElement("p");

  standardsNote.textContent =
    "Standards shown reflect grade-band-aligned practice opportunities in completed or in-progress activities. They do not represent a mastery determination.";

  details.append(standardsNote);

  if (standardsPracticed.size === 0) {
    const empty =
      document.createElement("p");

    empty.textContent =
      allGradeResponses > 0
        ? "Grade-specific standards are not assigned to sessions completed with All Grades selected."
        : "No grade-specific standards practice is saved yet.";

    details.append(empty);
  } else {
    [...standardsPracticed.values()]
      .sort((a, b) =>
        a.band.localeCompare(b.band) ||
        a.codes.localeCompare(b.codes)
      )
      .forEach((entry) => {
        const row =
          document.createElement("div");

        row.className =
          "word-part-progress-row";

        const main =
          document.createElement("div");

        main.textContent =
          `${getProgressGradeBandLabel(entry.band)} · ` +
          `${entry.codes}`;

        row.append(main);

        const description =
          document.createElement("small");

        description.textContent =
          entry.description;

        row.append(description);

        const opportunityLine =
          document.createElement("small");

        const evidenceParts = [
          `${entry.opportunities} ${
            entry.opportunities === 1
              ? "practice opportunity"
              : "practice opportunities"
          }`
        ];

        if (entry.direct > 0) {
          evidenceParts.push(
            `${entry.direct} direct`
          );
        }

        if (entry.application > 0) {
          evidenceParts.push(
            `${entry.application} application`
          );
        }

        opportunityLine.textContent =
          evidenceParts.join(" · ");

        row.append(opportunityLine);

        const activityLine =
          document.createElement("small");

        activityLine.textContent =
          "Activities: " +
          [...entry.activities]
            .sort()
            .join(" · ");

        row.append(activityLine);

        if (entry.wordParts.size > 0) {
          const wordPartLine =
            document.createElement("small");

          wordPartLine.textContent =
            "Word parts practiced: " +
            [...entry.wordParts]
              .sort()
              .join(" · ");

          row.append(wordPartLine);
        }

        details.append(row);
      });

    if (allGradeResponses > 0) {
      const allGradeNote =
        document.createElement("p");

      allGradeNote.textContent =
        "Additional responses from All Grades sessions are not assigned grade-specific standards.";

      details.append(allGradeNote);
    }
  }

}


function refreshProgressFromStorage() {
  progressData = loadProgressData();
  renderStudentRoster();
}

renderStudentRoster();

window.addEventListener("focus", refreshProgressFromStorage);
window.addEventListener("storage", (event) => {
  if (event.key === FV_PROGRESS_KEY) {
    refreshProgressFromStorage();
  }
});
