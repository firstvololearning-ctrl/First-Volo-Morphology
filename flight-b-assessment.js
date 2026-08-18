"use strict";

const PROGRESS_KEY = "firstVoloMorphologyProgressV1";
const ASSESSMENT_KEY = "firstVoloMorphologyAssessmentV1";

const FORMS = {
  pre: {
    label: "Pre · Form A",
    items: [
      {
        id: "pre-01",
        challenge: "Break It Apart",
        type: "multi",
        prompt: "Tap all the meaningful word parts you can find in interrupt.",
        help: "Choose every word part that belongs in the word.",
        choices: ["inter-", "trans-", "rupt", "spect", "-ion", "-ive"],
        answer: ["inter-", "rupt"],
        skill: "analysis",
        reportGroup: "practiced",
        trainedStatus: "practiced",
        support: "given a field of 6 word-part choices",
        ccss: "RF.4.3a / RF.5.3a supporting; L.4.4b / L.5.4b"
      },
      {
        id: "pre-02",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What does spect mean?",
        choices: ["look or watch", "carry", "break or burst", "build"],
        answer: "look or watch",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "pre-03",
        challenge: "Mystery Word",
        type: "choice",
        prompt: "Which meaning best fits transportable?",
        help: "Use the word parts as clues.",
        choices: [
          "able to be carried from place to place",
          "able to be watched from place to place",
          "able to be broken into smaller pieces",
          "able to be built again"
        ],
        answer: "able to be carried from place to place",
        skill: "inference",
        reportGroup: "transfer",
        trainedStatus: "transfer",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "pre-04",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What does struct mean?",
        choices: ["build", "life", "say", "move"],
        answer: "build",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "pre-05",
        challenge: "Word Connection",
        type: "text",
        prompt: "Complete the sentence frames to explain how the prefix affects the meaning of each word.",
        help: "Complete all four blanks.",
        responseFrame: [
          { lead: "In the word inspect, the prefix in- means", middle: "so inspect is about" },
          { lead: "In the word inactive, the prefix in- means", middle: "so inactive is about" }
        ],
        skill: "flexibleMeaning",
        reportGroup: "constructed",
        trainedStatus: "practiced",
        support: "independently in a written response",
        ccss: "L.4.4 / L.5.4; L.4.4b / L.5.4b",
        rubricTitle: "Multiple meanings of in-/im-",
        rubricReference: "2 = distinguishes both meanings: inspect uses in- as in/into; inactive uses in- as not. 1 = accurately explains one meaning or shows a partial distinction. 0 = does not distinguish the meanings."
      },
      {
        id: "pre-06",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What does -ive usually tell you?",
        choices: ["describes a quality or tendency", "names an action or process", "names a person who does something", "means not"],
        answer: "describes a quality or tendency",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "pre-07",
        challenge: "Break It Apart",
        type: "multi",
        prompt: "Tap all the meaningful word parts you can find in inspection.",
        help: "Choose every word part that belongs in the word.",
        choices: ["in-", "inter-", "spect", "struct", "-ion", "-ive"],
        answer: ["in-", "spect", "-ion"],
        skill: "analysis",
        reportGroup: "practiced",
        trainedStatus: "practiced",
        support: "given a field of 6 word-part choices",
        ccss: "RF.4.3a / RF.5.3a supporting; L.4.4b / L.5.4b"
      },
      {
        id: "pre-08",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What does trans- mean?",
        choices: ["across or through", "between or among", "under", "again"],
        answer: "across or through",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "pre-09",
        challenge: "Figure It Out",
        type: "choice",
        prompt: "Workers had to reconstruct the damaged wall. What does reconstruct most likely mean?",
        choices: ["build again", "look again", "carry across", "break into pieces"],
        answer: "build again",
        skill: "inference",
        reportGroup: "practiced",
        trainedStatus: "practiced",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "pre-10",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What does port mean?",
        choices: ["carry", "look or watch", "break or burst", "build"],
        answer: "carry",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "pre-11",
        challenge: "Break It Apart",
        type: "multi",
        prompt: "Tap all the meaningful word parts you can find in interruption.",
        help: "Choose every word part that belongs in the word.",
        choices: ["inter-", "trans-", "rupt", "spect", "-ion", "-ive"],
        answer: ["inter-", "rupt", "-ion"],
        skill: "analysis",
        reportGroup: "transfer",
        trainedStatus: "transfer",
        support: "given a field of 6 word-part choices",
        ccss: "RF.4.3a / RF.5.3a supporting; L.4.4b / L.5.4b"
      },
      {
        id: "pre-12",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What does -ion / -tion / -sion usually mean?",
        choices: ["names an action or process", "describes a quality or tendency", "names a person who does something", "means not"],
        answer: "names an action or process",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "pre-13",
        challenge: "Break It Apart",
        type: "choice",
        prompt: "Which word-part split correctly shows the meaningful parts in transport?",
        choices: ["trans-port", "tran-sport", "tra-nsport", "transp-ort"],
        answer: "trans-port",
        skill: "analysis",
        reportGroup: "practiced",
        trainedStatus: "practiced",
        support: "given a field of 4 possible word-part splits",
        ccss: "RF.4.3a / RF.5.3a supporting; L.4.4b / L.5.4b"
      },
      {
        id: "pre-14",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What does rupt mean?",
        choices: ["break or burst", "carry", "write or record", "heat"],
        answer: "break or burst",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "pre-15",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What does inter- mean?",
        choices: ["between or among", "across or through", "before", "against"],
        answer: "between or among",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "pre-16",
        challenge: "Word Connection",
        type: "text",
        prompt: "Complete the sentence frames to explain how the suffix affects the meaning of each word.",
        help: "Complete all four blanks.",
        responseFrame: [
          { lead: "In the word inspector, the suffix -or means/shows", middle: "so inspector is about" },
          { lead: "In the word inspected, the suffix -ed means/shows", middle: "so inspected is about" }
        ],
        skill: "suffixReasoning",
        reportGroup: "constructed",
        trainedStatus: "near-transfer",
        support: "independently in a written response",
        ccss: "Morphological word analysis; L.4.4b / L.5.4b supporting application",
        rubricTitle: "Same base, different suffixes",
        rubricReference: "2 = explains both endings: inspector uses -or for a person/one who inspects; inspected uses -ed to show a completed/past action or that something was examined. 1 = accurately explains one ending or gives a partial contrast. 0 = does not explain the suffix contrast."
      }
    ]
  },

  post: {
    label: "Post · Form B",
    items: [
      {
        id: "post-01",
        challenge: "Break It Apart",
        type: "multi",
        prompt: "Tap all the meaningful word parts you can find in disrupt.",
        help: "Choose every word part that belongs in the word.",
        choices: ["dis-", "inter-", "rupt", "struct", "-ion", "-ive"],
        answer: ["dis-", "rupt"],
        skill: "analysis",
        reportGroup: "practiced",
        trainedStatus: "practiced",
        support: "given a field of 6 word-part choices",
        ccss: "RF.4.3a / RF.5.3a supporting; L.4.4b / L.5.4b"
      },
      {
        id: "post-02",
        challenge: "Quick Match",
        type: "choice",
        prompt: "Which word part means build?",
        choices: ["struct", "spect", "port", "rupt"],
        answer: "struct",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "post-03",
        challenge: "Mystery Word",
        type: "choice",
        prompt: "Which meaning best fits exportable?",
        help: "Use the word parts as clues.",
        choices: [
          "able to be carried or sent out of a place",
          "able to be carried into a place",
          "able to be watched from outside",
          "able to be built again"
        ],
        answer: "able to be carried or sent out of a place",
        skill: "inference",
        reportGroup: "transfer",
        trainedStatus: "transfer",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "post-04",
        challenge: "Quick Match",
        type: "choice",
        prompt: "Which word part means between or among?",
        choices: ["inter-", "trans-", "re-", "anti-"],
        answer: "inter-",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "post-05",
        challenge: "Word Connection",
        type: "text",
        prompt: "Complete the sentence frames to explain how the prefix affects the meaning of each word.",
        help: "Complete all four blanks.",
        responseFrame: [
          { lead: "In the word import, the prefix im- means", middle: "so import is about" },
          { lead: "In the word impossible, the prefix im- means", middle: "so impossible is about" }
        ],
        skill: "flexibleMeaning",
        reportGroup: "constructed",
        trainedStatus: "practiced",
        support: "independently in a written response",
        ccss: "L.4.4 / L.5.4; L.4.4b / L.5.4b",
        rubricTitle: "Multiple meanings of in-/im-",
        rubricReference: "2 = distinguishes both meanings: import uses im-/in- as in/into; impossible uses im- as not. 1 = accurately explains one meaning or shows a partial distinction. 0 = does not distinguish the meanings."
      },
      {
        id: "post-06",
        challenge: "Quick Match",
        type: "choice",
        prompt: "Which word part means look or watch?",
        choices: ["spect", "struct", "port", "rupt"],
        answer: "spect",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "post-07",
        challenge: "Break It Apart",
        type: "multi",
        prompt: "Tap all the meaningful word parts you can find in destructive.",
        help: "Choose every word part that belongs in the word.",
        choices: ["de-", "struct", "-ive", "spect", "rupt", "-ion"],
        answer: ["de-", "struct", "-ive"],
        skill: "analysis",
        reportGroup: "practiced",
        trainedStatus: "practiced",
        support: "given a field of 6 word-part choices",
        ccss: "RF.4.3a / RF.5.3a supporting; L.4.4b / L.5.4b"
      },
      {
        id: "post-08",
        challenge: "Quick Match",
        type: "choice",
        prompt: "Which word part means carry?",
        choices: ["port", "spect", "struct", "rupt"],
        answer: "port",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "post-09",
        challenge: "Build It",
        type: "choice",
        prompt: "Which word-part split correctly builds transform?",
        choices: ["trans-form", "inter-form", "trans-port", "re-form"],
        answer: "trans-form",
        skill: "build",
        reportGroup: "practiced",
        trainedStatus: "practiced",
        support: "given a field of 4 word-part combinations",
        ccss: "L.4.4b / L.5.4b supporting application"
      },
      {
        id: "post-10",
        challenge: "Break It Apart",
        type: "multi",
        prompt: "Tap all the meaningful word parts you can find in disruption.",
        help: "Choose every word part that belongs in the word.",
        choices: ["dis-", "rupt", "-ion", "inter-", "spect", "-ive"],
        answer: ["dis-", "rupt", "-ion"],
        skill: "analysis",
        reportGroup: "transfer",
        trainedStatus: "transfer",
        support: "given a field of 6 word-part choices",
        ccss: "RF.4.3a / RF.5.3a supporting; L.4.4b / L.5.4b"
      },
      {
        id: "post-11",
        challenge: "Quick Match",
        type: "choice",
        prompt: "Which word part means across or through?",
        choices: ["trans-", "inter-", "circum-", "sub-"],
        answer: "trans-",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "post-12",
        challenge: "Figure It Out",
        type: "choice",
        prompt: "A spectator is most likely...",
        help: "Use spect as a clue.",
        choices: [
          "a person who watches an event",
          "a person who carries supplies",
          "a person who builds structures",
          "a person who breaks things apart"
        ],
        answer: "a person who watches an event",
        skill: "inference",
        reportGroup: "practiced",
        trainedStatus: "practiced",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "post-13",
        challenge: "Quick Match",
        type: "choice",
        prompt: "Which ending can describe a quality or tendency?",
        choices: ["-ive", "-ion", "-ist", "-ology"],
        answer: "-ive",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "post-14",
        challenge: "Quick Match",
        type: "choice",
        prompt: "Which word part means break or burst?",
        choices: ["rupt", "port", "struct", "spect"],
        answer: "rupt",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "post-15",
        challenge: "Quick Match",
        type: "choice",
        prompt: "Which ending can name an action or process?",
        choices: ["-ion / -tion / -sion", "-ive", "-ist", "-ous"],
        answer: "-ion / -tion / -sion",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.4.4b / L.5.4b"
      },
      {
        id: "post-16",
        challenge: "Word Connection",
        type: "text",
        prompt: "Complete the sentence frames to explain how the suffix affects the meaning of each word.",
        help: "Complete all four blanks.",
        responseFrame: [
          { lead: "In the word importer, the suffix -er means/shows", middle: "so importer is about" },
          { lead: "In the word imported, the suffix -ed means/shows", middle: "so imported is about" }
        ],
        skill: "suffixReasoning",
        reportGroup: "constructed",
        trainedStatus: "near-transfer",
        support: "independently in a written response",
        ccss: "Morphological word analysis; L.4.4b / L.5.4b supporting application",
        rubricTitle: "Same base, different suffixes",
        rubricReference: "2 = explains both endings: importer uses -er for a person/thing that imports; imported uses -ed to show a completed/past action or that something was brought in. 1 = accurately explains one ending or gives a partial contrast. 0 = does not explain the suffix contrast."
      }
    ]
  }
};

const setupScreen = document.getElementById("setupScreen");
const studentScreen = document.getElementById("studentScreen");
const completeScreen = document.getElementById("completeScreen");
const reportScreen = document.getElementById("reportScreen");
const formSelect = document.getElementById("formSelect");
const studentSelect = document.getElementById("studentSelect");
const studentCode = document.getElementById("studentCode");
const startButton = document.getElementById("startButton");
const savedAssessments = document.getElementById("savedAssessments");
const itemCount = document.getElementById("itemCount");
const routeStops = document.getElementById("routeStops");
const flightFill = document.getElementById("flightFill");
const flightVolo = document.getElementById("flightVolo");
const challengeLabel = document.getElementById("challengeLabel");
const questionPrompt = document.getElementById("questionPrompt");
const questionHelp = document.getElementById("questionHelp");
const responseArea = document.getElementById("responseArea");
const savedMessage = document.getElementById("savedMessage");
const continueButton = document.getElementById("continueButton");
const educatorReportButton = document.getElementById("educatorReportButton");
const backToSetupButton = document.getElementById("backToSetupButton");
const printButton = document.getElementById("printButton");

let currentFormKey = null;
let currentItems = [];
let currentIndex = 0;
let currentDraft = null;
let currentSession = null;

function loadJSON(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return parsed || fallback;
  } catch (error) {
    console.warn(`Could not read ${key}.`, error);
    return fallback;
  }
}

function getProgressData() {
  const data = loadJSON(PROGRESS_KEY, { students: [], activeStudentId: null });
  if (!Array.isArray(data.students)) data.students = [];
  return data;
}

function getAssessmentData() {
  const data = loadJSON(ASSESSMENT_KEY, { sessions: [] });
  if (!Array.isArray(data.sessions)) data.sessions = [];
  return data;
}

function saveAssessmentData(data) {
  localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(data));
}

function makeId(prefix) {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function showOnly(screen) {
  [setupScreen, studentScreen, completeScreen, reportScreen].forEach((item) => {
    item.hidden = item !== screen;
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function populateStudentProfiles() {
  const progress = getProgressData();
  studentSelect.innerHTML = '<option value="">Not linked to an app profile</option>';
  progress.students
    .slice()
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
    .forEach((student) => {
      const option = document.createElement("option");
      option.value = student.id;
      option.textContent = student.name || "Unnamed student";
      studentSelect.append(option);
    });
  if (progress.activeStudentId && progress.students.some((s) => s.id === progress.activeStudentId)) {
    studentSelect.value = progress.activeStudentId;
  }
}

function sanitizeCode(value) {
  return String(value || "").trim().replace(/\s+/g, "-").slice(0, 32);
}

function formItems(formKey) {
  return FORMS[formKey]?.items || [];
}

function saveCurrentSession() {
  if (!currentSession) return;
  const data = getAssessmentData();
  const index = data.sessions.findIndex((session) => session.id === currentSession.id);
  if (index >= 0) data.sessions[index] = currentSession;
  else data.sessions.push(currentSession);
  saveAssessmentData(data);
  renderSavedAssessments();
}

function renderSavedAssessments() {
  const data = getAssessmentData();
  const sessions = data.sessions
    .filter((session) => session.completedAt)
    .slice()
    .sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)));

  savedAssessments.innerHTML = "";
  if (!sessions.length) {
    const empty = document.createElement("p");
    empty.className = "empty-note";
    empty.textContent = "No completed Flight B assessments saved on this browser yet.";
    savedAssessments.append(empty);
    return;
  }

  sessions.slice(0, 12).forEach((session) => {
    const row = document.createElement("div");
    row.className = "saved-row";
    const copy = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = `${session.studentCode} · ${FORMS[session.form]?.label || session.form}`;
    const small = document.createElement("small");
    small.textContent = `Completed ${new Date(session.completedAt).toLocaleDateString()}`;
    copy.append(strong, document.createElement("br"), small);
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Open report";
    button.addEventListener("click", () => openSavedReport(session.id));
    row.append(copy, button);
    savedAssessments.append(row);
  });
}

function openSavedReport(sessionId) {
  const data = getAssessmentData();
  const session = data.sessions.find((item) => item.id === sessionId);
  if (!session) return;
  currentSession = session;
  currentFormKey = session.form;
  currentItems = formItems(currentFormKey);
  renderReport();
  showOnly(reportScreen);
}

function buildRouteStops() {
  routeStops.innerHTML = "";
  currentItems.forEach((_, index) => {
    const stop = document.createElement("span");
    stop.className = "route-stop";
    stop.dataset.index = String(index);
    routeStops.append(stop);
  });
}

function updateFlightPath() {
  const total = currentItems.length;
  const completed = currentIndex;
  const percent = total > 1 ? (completed / (total - 1)) * 100 : 0;
  flightFill.style.width = `${Math.min(100, percent)}%`;
  const voloPercent = Math.min(92, Math.max(0, percent - 3));
  flightVolo.style.left = `${voloPercent}%`;
  [...routeStops.children].forEach((stop, index) => {
    stop.classList.toggle("done", index < currentIndex);
    stop.classList.toggle("current", index === currentIndex);
  });
}

function getDisplayedChoices(item) {
  const choices = [...item.choices];
  if (choices.length < 2) return choices;

  const match = String(item.id || "").match(/(\d+)$/);
  const itemNumber = match ? Number(match[1]) : 0;
  const offset = itemNumber % choices.length;

  return [...choices.slice(offset), ...choices.slice(0, offset)];
}

function renderQuestion() {
  const item = currentItems[currentIndex];
  currentDraft = item.type === "multi" ? [] : "";
  savedMessage.textContent = "";
  continueButton.disabled = true;
  itemCount.textContent = `${currentIndex + 1} of ${currentItems.length}`;
  challengeLabel.textContent = item.challenge;
  questionPrompt.textContent = item.prompt;
  questionHelp.textContent = item.help || "";
  responseArea.innerHTML = "";

  if (item.type === "choice" || item.type === "multi") {
    if (item.type === "multi") {
      const hint = document.createElement("div");
      hint.className = "multi-hint";
      hint.textContent = "You may choose more than one.";
      responseArea.append(hint);
    }
    getDisplayedChoices(item).forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-button";
      button.textContent = choice;
      button.addEventListener("click", () => {
        if (item.type === "choice") {
          currentDraft = choice;
          responseArea.querySelectorAll(".choice-button").forEach((other) => {
            other.classList.toggle("selected", other === button);
            other.setAttribute("aria-pressed", String(other === button));
          });
        } else {
          const selected = currentDraft.includes(choice);
          currentDraft = selected
            ? currentDraft.filter((value) => value !== choice)
            : [...currentDraft, choice];
          button.classList.toggle("selected", !selected);
          button.setAttribute("aria-pressed", String(!selected));
        }
        continueButton.disabled = item.type === "multi" ? currentDraft.length === 0 : !currentDraft;
      });
      button.setAttribute("aria-pressed", "false");
      responseArea.append(button);
    });
  } else if (item.type === "text" && item.responseFrame) {
    const frameValues = item.responseFrame.map(() => ["", ""]);

    const updateFrameDraft = () => {
      const complete = frameValues.every((pair) => pair.every((value) => value.trim()));
      currentDraft = item.responseFrame.map((line, index) => {
        const [meaning, wholeWord] = frameValues[index];
        return `${line.lead} ${meaning.trim()}, ${line.middle} ${wholeWord.trim()}.`;
      }).join(" ");
      continueButton.disabled = !complete;
    };

    item.responseFrame.forEach((line, lineIndex) => {
      const row = document.createElement("div");
      row.className = "response-frame-line";

      const lead = document.createElement("span");
      lead.textContent = `${line.lead} `;
      row.append(lead);

      const meaningInput = document.createElement("input");
      meaningInput.type = "text";
      meaningInput.className = "response-frame-blank response-frame-meaning";
      meaningInput.setAttribute("aria-label", `${line.lead} blank`);
      meaningInput.autocomplete = "off";
      meaningInput.addEventListener("input", () => {
        frameValues[lineIndex][0] = meaningInput.value;
        updateFrameDraft();
      });
      row.append(meaningInput);

      const middle = document.createElement("span");
      middle.textContent = `, ${line.middle} `;
      row.append(middle);

      const wholeWordInput = document.createElement("input");
      wholeWordInput.type = "text";
      wholeWordInput.className = "response-frame-blank response-frame-whole";
      wholeWordInput.setAttribute("aria-label", `${line.middle} blank`);
      wholeWordInput.autocomplete = "off";
      wholeWordInput.addEventListener("input", () => {
        frameValues[lineIndex][1] = wholeWordInput.value;
        updateFrameDraft();
      });
      row.append(wholeWordInput);

      const period = document.createElement("span");
      period.textContent = ".";
      row.append(period);

      responseArea.append(row);
    });

    const firstBlank = responseArea.querySelector(".response-frame-blank");
    if (firstBlank) setTimeout(() => firstBlank.focus(), 0);
  } else if (item.type === "text") {
    const textarea = document.createElement("textarea");
    textarea.placeholder = "Type your thinking here...";
    textarea.setAttribute("aria-label", "Written response");
    textarea.addEventListener("input", () => {
      currentDraft = textarea.value;
      continueButton.disabled = !textarea.value.trim();
    });
    responseArea.append(textarea);
    setTimeout(() => textarea.focus(), 0);
  }

  updateFlightPath();
}

function normalizeSet(values) {
  return [...values].sort().join("||");
}

function scoreItem(item, response) {
  if (item.type === "text") return null;
  if (item.type === "multi") return normalizeSet(response) === normalizeSet(item.answer);
  return response === item.answer;
}

function startAssessment() {
  const code = sanitizeCode(studentCode.value);
  if (!code) {
    studentCode.focus();
    studentCode.setCustomValidity("Enter an anonymous Student Code before starting.");
    studentCode.reportValidity();
    return;
  }
  studentCode.setCustomValidity("");

  currentFormKey = formSelect.value;
  currentItems = formItems(currentFormKey);
  currentIndex = 0;
  currentSession = {
    id: makeId("flight-b-assessment"),
    assessmentId: "flight-b-pre-post-v1",
    flight: "B",
    form: currentFormKey,
    studentCode: code,
    linkedStudentId: studentSelect.value || null,
    startedAt: new Date().toISOString(),
    completedAt: null,
    responses: [],
    rubricScores: {}
  };

  saveCurrentSession();
  buildRouteStops();
  renderQuestion();
  showOnly(studentScreen);
}

function recordCurrentResponse() {
  const item = currentItems[currentIndex];
  const response = item.type === "multi" ? [...currentDraft] : String(currentDraft).trim();
  const correct = scoreItem(item, response);
  currentSession.responses.push({
    itemId: item.id,
    response,
    correct,
    skill: item.skill,
    reportGroup: item.reportGroup,
    trainedStatus: item.trainedStatus || null,
    support: item.support,
    ccss: item.ccss,
    answeredAt: new Date().toISOString()
  });
  saveCurrentSession();
  savedMessage.textContent = "Response saved ✓";
  continueButton.disabled = true;

  setTimeout(() => {
    currentIndex += 1;
    if (currentIndex >= currentItems.length) finishAssessment();
    else renderQuestion();
  }, 260);
}

function finishAssessment() {
  currentSession.completedAt = new Date().toISOString();
  saveCurrentSession();
  showOnly(completeScreen);
}

function responseFor(itemId) {
  return currentSession?.responses?.find((response) => response.itemId === itemId) || null;
}

function percent(correct, total) {
  return total ? Math.round((correct / total) * 100) : 0;
}

function objectiveResponses(session = currentSession) {
  return (session?.responses || []).filter((response) => typeof response.correct === "boolean");
}

function scoreGroup(group) {
  const responses = objectiveResponses().filter((response) => response.reportGroup === group);
  const correct = responses.filter((response) => response.correct).length;
  return { correct, total: responses.length, pct: percent(correct, responses.length) };
}

function latestCompleted(code, form) {
  return getAssessmentData().sessions
    .filter((session) => session.completedAt && session.studentCode === code && session.form === form)
    .sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)))[0] || null;
}

function objectivePercent(session) {
  const responses = objectiveResponses(session);
  return percent(responses.filter((response) => response.correct).length, responses.length);
}

function renderScoreCards() {
  const scoreCards = document.getElementById("scoreCards");
  const objective = objectiveResponses();
  const objectiveCorrect = objective.filter((response) => response.correct).length;
  const knowledge = scoreGroup("knowledge");
  const practiced = scoreGroup("practiced");
  const transfer = scoreGroup("transfer");
  const rubricValues = currentItems
    .filter((item) => item.type === "text")
    .map((item) => currentSession.rubricScores?.[item.id])
    .filter((value) => Number.isFinite(Number(value)))
    .map(Number);
  const rubricEarned = rubricValues.reduce((sum, value) => sum + value, 0);
  const rubricPossible = currentItems.filter((item) => item.type === "text").length * 2;
  const rubricComplete = rubricValues.length === currentItems.filter((item) => item.type === "text").length;

  const cards = [
    ["Objective items", `${percent(objectiveCorrect, objective.length)}%`, `${objectiveCorrect}/${objective.length} correct`],
    ["Word-part knowledge", `${knowledge.pct}%`, `${knowledge.correct}/${knowledge.total} correct`],
    ["Practiced-word application", `${practiced.pct}%`, `${practiced.correct}/${practiced.total} correct`],
    ["Transfer to new words", `${transfer.pct}%`, `${transfer.correct}/${transfer.total} correct`],
    ["Written reasoning", rubricComplete ? `${rubricEarned}/${rubricPossible}` : "Pending", rubricComplete ? "rubric points" : "educator scoring needed"]
  ];

  scoreCards.innerHTML = cards.map(([label, value, note]) => `
    <div class="score-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${note}</small>
    </div>
  `).join("");
}

function renderGrowthSummary() {
  const box = document.getElementById("growthSummary");
  const pre = latestCompleted(currentSession.studentCode, "pre");
  const post = latestCompleted(currentSession.studentCode, "post");
  if (!pre || !post) {
    box.textContent = "Pre/Post comparison will appear here after both forms are completed with the same Student Code.";
    return;
  }
  const prePct = objectivePercent(pre);
  const postPct = objectivePercent(post);
  const change = postPct - prePct;
  const sign = change > 0 ? "+" : "";
  box.textContent = `Objective assessment growth: Pre ${prePct}% → Post ${postPct}% (${sign}${change} percentage points).`;
}

function renderSkillStatements() {
  const container = document.getElementById("skillStatements");
  const knowledge = scoreGroup("knowledge");
  const practiced = scoreGroup("practiced");
  const transfer = scoreGroup("transfer");
  const analysisResponses = objectiveResponses().filter((response) => response.skill === "analysis");
  const analysisCorrect = analysisResponses.filter((response) => response.correct).length;
  const inferenceResponses = objectiveResponses().filter((response) => response.skill === "inference");
  const inferenceCorrect = inferenceResponses.filter((response) => response.correct).length;

  const statements = [
    `The student demonstrated the ability to match targeted prefixes, roots, and suffixes with their meanings with <strong>${knowledge.pct}% accuracy</strong> given a field of 4 choices.`,
    `The student demonstrated the ability to apply targeted morphology to practiced instructional words with <strong>${practiced.pct}% accuracy</strong> across the scored selected-response tasks.`,
    `The student demonstrated the ability to apply taught word-part knowledge to new word-family or transfer items with <strong>${transfer.pct}% accuracy</strong> across the scored selected-response tasks.`,
    `The student demonstrated the ability to analyze morphologically complex words into meaningful word parts with <strong>${percent(analysisCorrect, analysisResponses.length)}% accuracy</strong> given a field of 6 word-part choices.`,
    `The student demonstrated the ability to use word parts as clues to whole-word meaning with <strong>${percent(inferenceCorrect, inferenceResponses.length)}% accuracy</strong> given a field of 4 choices.`
  ];

  const textItems = currentItems.filter((item) => item.type === "text");
  const flexible = textItems.find((item) => item.skill === "flexibleMeaning");
  const suffix = textItems.find((item) => item.skill === "suffixReasoning");
  if (flexible) {
    const value = currentSession.rubricScores?.[flexible.id];
    statements.push(`The student demonstrated the ability to distinguish between the “not” and “in/into” meanings of in-/im- across words, earning <strong>${Number.isFinite(Number(value)) ? `${value}/2 rubric points` : "a pending rubric score"}</strong> independently in a written response.`);
  }
  if (suffix) {
    const value = currentSession.rubricScores?.[suffix.id];
    statements.push(`The student demonstrated the ability to explain how suffixes change the meaning or grammatical form of a shared base word, earning <strong>${Number.isFinite(Number(value)) ? `${value}/2 rubric points` : "a pending rubric score"}</strong> independently in a written response.`);
  }

  container.innerHTML = statements.map((statement) => `<p class="skill-statement">${statement}</p>`).join("");
}

function renderConstructedResponses() {
  const container = document.getElementById("constructedResponses");
  const textItems = currentItems.filter((item) => item.type === "text");
  container.innerHTML = "";

  textItems.forEach((item) => {
    const response = responseFor(item.id);
    const card = document.createElement("div");
    card.className = "constructed-card";
    const savedScore = currentSession.rubricScores?.[item.id];
    card.innerHTML = `
      <h3>${item.rubricTitle}</h3>
      <p><strong>Prompt:</strong> ${item.prompt}</p>
      <div class="student-response"><strong>Student response:</strong><br>${escapeHtml(response?.response || "No response saved.")}</div>
      <p class="rubric-reference"><strong>Rubric:</strong> ${item.rubricReference}</p>
      <div class="rubric-control no-print">
        <label for="rubric-${item.id}"><strong>Educator score:</strong></label>
        <select id="rubric-${item.id}">
          <option value="">Select 0–2</option>
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
        </select>
      </div>
      <p class="rubric-print-score"><strong>Rubric score:</strong> <span id="rubric-print-${item.id}">${Number.isFinite(Number(savedScore)) ? `${savedScore}/2` : "Pending"}</span></p>
    `;
    container.append(card);
    const select = card.querySelector("select");
    if (Number.isFinite(Number(savedScore))) select.value = String(savedScore);
    select.addEventListener("change", () => {
      if (!currentSession.rubricScores) currentSession.rubricScores = {};
      if (select.value === "") delete currentSession.rubricScores[item.id];
      else currentSession.rubricScores[item.id] = Number(select.value);
      saveCurrentSession();
      renderScoreCards();
      renderSkillStatements();
      document.getElementById(`rubric-print-${item.id}`).textContent = select.value === "" ? "Pending" : `${select.value}/2`;
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function activityLabel(skill) {
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
  return labels[skill] || skill || "Practice";
}

function renderAppProgressSummary() {
  const container = document.getElementById("appProgressSummary");
  if (!currentSession.linkedStudentId) {
    container.innerHTML = '<div class="app-summary-box">This assessment was not linked to a local First Volo student profile. App-practice comparison is unavailable.</div>';
    return;
  }
  const progress = getProgressData();
  const student = progress.students.find((item) => item.id === currentSession.linkedStudentId);
  if (!student) {
    container.innerHTML = '<div class="app-summary-box">The linked local profile is no longer available on this browser.</div>';
    return;
  }

  const sessions = (student.sessions || []).filter((session) => session.gradeBand === "4-5");
  const responses = sessions.flatMap((session) => Array.isArray(session.responses) ? session.responses : []);
  if (!responses.length) {
    container.innerHTML = '<div class="app-summary-box">No linked Flight B app-practice responses are saved yet.</div>';
    return;
  }

  const scored = responses.filter((response) => typeof response.correct === "boolean");
  const correct = scored.filter((response) => response.correct).length;
  const bySkill = new Map();
  scored.forEach((response) => {
    const skill = response.skill || "practice";
    if (!bySkill.has(skill)) bySkill.set(skill, { correct: 0, total: 0 });
    const row = bySkill.get(skill);
    row.total += 1;
    if (response.correct) row.correct += 1;
  });

  const skillCards = [...bySkill.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([skill, stats]) => `<div class="app-skill"><strong>${activityLabel(skill)}</strong><br>${stats.correct}/${stats.total} · ${percent(stats.correct, stats.total)}%</div>`)
    .join("");

  container.innerHTML = `
    <div class="app-summary-box">
      <strong>${sessions.length} linked Flight B app ${sessions.length === 1 ? "session" : "sessions"}</strong><br>
      ${correct}/${scored.length} scored practice responses correct · <strong>${percent(correct, scored.length)}%</strong>
      <div class="app-skill-grid">${skillCards}</div>
    </div>
  `;
}

function renderItemDetail() {
  const container = document.getElementById("itemDetail");
  const rows = currentItems.map((item, index) => {
    const response = responseFor(item.id);
    let status = "Written response";
    let statusClass = "status-rubric";
    if (typeof response?.correct === "boolean") {
      status = response.correct ? "Correct" : "Incorrect";
      statusClass = response.correct ? "status-correct" : "status-incorrect";
    }
    const responseText = Array.isArray(response?.response) ? response.response.join(" + ") : response?.response || "—";
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${item.challenge}</td>
        <td>${escapeHtml(item.prompt)}</td>
        <td>${escapeHtml(responseText)}</td>
        <td class="${statusClass}">${status}</td>
        <td>${escapeHtml(item.support)}</td>
      </tr>
    `;
  }).join("");
  container.innerHTML = `
    <table class="item-table">
      <thead><tr><th>#</th><th>Task</th><th>Prompt</th><th>Response</th><th>Score</th><th>Conditions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderReport() {
  if (!currentSession) return;
  currentItems = formItems(currentSession.form);
  document.getElementById("reportCode").textContent = currentSession.studentCode;
  document.getElementById("reportForm").textContent = FORMS[currentSession.form]?.label || currentSession.form;
  document.getElementById("reportDate").textContent = new Date(currentSession.completedAt || currentSession.startedAt).toLocaleDateString();
  renderScoreCards();
  renderGrowthSummary();
  renderSkillStatements();
  renderConstructedResponses();
  renderAppProgressSummary();
  renderItemDetail();
}

startButton.addEventListener("click", startAssessment);
continueButton.addEventListener("click", recordCurrentResponse);
educatorReportButton.addEventListener("click", () => {
  renderReport();
  showOnly(reportScreen);
});
backToSetupButton.addEventListener("click", () => {
  currentSession = null;
  currentItems = [];
  currentIndex = 0;
  populateStudentProfiles();
  renderSavedAssessments();
  showOnly(setupScreen);
});
printButton.addEventListener("click", () => window.print());
studentCode.addEventListener("input", () => studentCode.setCustomValidity(""));

populateStudentProfiles();
renderSavedAssessments();
