"use strict";

const PROGRESS_KEY = "firstVoloMorphologyProgressV1";
const ASSESSMENT_KEY = "firstVoloMorphologyAssessmentV1";

const FORMS = {
  pre: {
    label: "Pre · Form A",
    items: [
      {
        id: "pre-01", challenge: "Break It Apart", type: "choice",
        prompt: "Which word-part split correctly shows the meaningful parts in abduct?",
        choices: ["ab-duct", "a-bduct", "abd-uct", "abdu-ct"], answer: "ab-duct",
        skill: "analysis", reportGroup: "practiced", trainedStatus: "practiced",
        support: "given a field of 4 possible word-part splits", ccss: "L.6.4b / L.7.4b / L.8.4b"
      },
      {
        id: "pre-02", challenge: "Quick Match", type: "choice",
        prompt: "What does duct/duce mean?", choices: ["lead", "throw", "hear", "pull or draw"], answer: "lead",
        skill: "meaning", reportGroup: "knowledge", support: "given a field of 4 choices", ccss: "L.6.4b / L.7.4b / L.8.4b"
      },
      {
        id: "pre-03",
        challenge: "Mystery Word",
        type: "choice",
        prompt: "After moving the poster, Maya had to reposition the title. What does reposition most likely mean?",
        help: "Use the word parts and the sentence as clues.",
        choices: [
          "put or place it again",
          "send it out",
          "pull it away",
          "hear it again"
        ],
        answer: "put or place it again",
        skill: "inference",
        reportGroup: "transfer",
        trainedStatus: "transfer",
        support: "given a field of 4 choices",
        ccss: "L.6.4b / L.7.4b / L.8.4b"
      },

      {
        id: "pre-04", challenge: "Quick Match", type: "choice",
        prompt: "What does chron mean?", choices: ["time", "book", "skin", "turn"], answer: "time",
        skill: "meaning", reportGroup: "knowledge", support: "given a field of 4 choices", ccss: "L.6.4b / L.7.4b / L.8.4b"
      },
      {
        id: "pre-05", challenge: "Word Connection", type: "text",
        prompt: "Complete the sentence frames to explain how the prefix affects each word built on mit.", help: "Complete all four blanks.",
        responseFrame: [
          { lead: "In the word transmit, the prefix trans- means", middle: "so transmit is about" },
          { lead: "In the word emit, the prefix e- means", middle: "so emit is about" }
        ],
        skill: "prefixRootReasoning", reportGroup: "constructed", trainedStatus: "practiced", support: "independently in a structured fill-in response",
        ccss: "L.6.4b / L.7.4b / L.8.4b", rubricTitle: "Same root, different prefixes",
        rubricReference: "2 = explains both prefix effects and links them to mit = send: transmit uses trans- as across/through and emit uses e- as out/from. 1 = accurately explains one word or gives a partial comparison. 0 = does not show meaningful morphological reasoning."
      },
      {
        id: "pre-06", challenge: "Quick Match", type: "choice",
        prompt: "What does ject mean?", choices: ["throw", "lead", "hold", "believe or trust"], answer: "throw",
        skill: "meaning", reportGroup: "knowledge", support: "given a field of 4 choices", ccss: "L.6.4b / L.7.4b / L.8.4b"
      },
      {
        id: "pre-07", challenge: "Break It Apart", type: "choice",
        prompt: "Which word-part split correctly shows the meaningful parts in retrospective?",
        choices: ["retro-spect-ive", "ret-rospective", "retros-pective", "retrosp-ective"], answer: "retro-spect-ive",
        skill: "analysis", reportGroup: "practiced", trainedStatus: "practiced", support: "given a field of 4 possible word-part splits", ccss: "L.6.4b / L.7.4b / L.8.4b"
      },
      {
        id: "pre-08", challenge: "Quick Match", type: "choice",
        prompt: "What can -ance and -ence name?",
        choices: ["a state, quality, or act", "one who or something having a quality", "an action happening now", "something that can be done"], answer: "a state, quality, or act",
        skill: "meaning", reportGroup: "knowledge", support: "given a field of 4 choices", ccss: "L.6.4b / L.7.4b / L.8.4b"
      },
      {
        id: "pre-09",
        challenge: "Figure It Out",
        type: "choice",
        prompt: "The announcement was audible from the back of the room. What does audible most likely mean?",
        help: "Use the word parts and the sentence as clues.",
        choices: [
          "able to be heard",
          "able to be seen",
          "able to be moved",
          "able to be believed"
        ],
        answer: "able to be heard",
        skill: "inference",
        reportGroup: "practiced",
        trainedStatus: "practiced",
        support: "given a field of 4 choices",
        ccss: "L.6.4b / L.7.4b / L.8.4b"
      },

      {
        id: "pre-10",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What does fer mean?",
        choices: ["carry or bear", "hold", "turn", "follow"],
        answer: "carry or bear",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.6.4b / L.7.4b / L.8.4b"
      },

      {
        id: "pre-11",
        challenge: "Mystery Word",
        type: "choice",
        prompt: "The telescope has a retractable handle. Which meaning best fits retractable?",
        help: "Use the word parts and the sentence as clues.",
        choices: [
          "able to be pulled back",
          "able to be thrown forward",
          "able to be sent out",
          "able to be heard again"
        ],
        answer: "able to be pulled back",
        skill: "inference",
        reportGroup: "transfer",
        trainedStatus: "transfer",
        support: "given a field of 4 choices",
        ccss: "L.6.4b / L.7.4b / L.8.4b"
      },

      {
        id: "pre-12", challenge: "Quick Match", type: "choice",
        prompt: "What does retro- mean?", choices: ["backward or back", "toward", "away or from", "together"], answer: "backward or back",
        skill: "meaning", reportGroup: "knowledge", support: "given a field of 4 choices", ccss: "L.6.4b / L.7.4b / L.8.4b"
      },
      {
        id: "pre-13", challenge: "Break It Apart", type: "choice",
        prompt: "Which word-part split correctly shows the meaningful parts in eject?", choices: ["e-ject", "ej-ect", "eje-ct", "e-j-ect"], answer: "e-ject",
        skill: "analysis", reportGroup: "practiced", trainedStatus: "practiced", support: "given a field of 4 possible word-part splits", ccss: "L.6.4b / L.7.4b / L.8.4b"
      },
      {
        id: "pre-14",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What does cred mean?",
        choices: ["believe or trust", "hold", "send", "turn"],
        answer: "believe or trust",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.6.4b / L.7.4b / L.8.4b"
      },

      {
        id: "pre-15",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What does ten mean?",
        choices: ["hold", "send", "turn", "pull or draw"],
        answer: "hold",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.6.4b / L.7.4b / L.8.4b"
      },

      {
        id: "pre-16", challenge: "Word Connection", type: "text",
        prompt: "Complete the sentence frames to explain how the ending changes the related words.", help: "Complete all four blanks.",
        responseFrame: [
          { lead: "In the word assistance, the suffix -ance helps show", middle: "so assistance is about" },
          { lead: "In the word assistant, the suffix -ant helps show", middle: "so assistant is about" }
        ],
        skill: "suffixReasoning", reportGroup: "constructed", trainedStatus: "practiced", support: "independently in a structured fill-in response",
        ccss: "L.6.4b / L.7.4b / L.8.4b", rubricTitle: "Related words, different suffixes",
        rubricReference: "2 = explains both suffix functions: -ance helps form assistance, naming the act or help of assisting; -ant helps form assistant, naming a person who assists. 1 = accurately explains one suffix or gives a partial contrast. 0 = does not explain the suffix contrast."
      }
    ]
  },

  post: {
    label: "Post · Form B",
    items: [
      {
        id: "post-01", challenge: "Break It Apart", type: "choice",
        prompt: "Which word-part split correctly shows the meaningful parts in produce?", choices: ["pro-duce", "prod-uce", "produc-e", "p-roduce"], answer: "pro-duce",
        skill: "analysis", reportGroup: "practiced", trainedStatus: "practiced", support: "given a field of 4 possible word-part splits", ccss: "L.6.4b / L.7.4b / L.8.4b"
      },
      {
        id: "post-02", challenge: "Quick Match", type: "choice",
        prompt: "Which root means lead?", choices: ["duct/duce", "ject", "aud", "tract"], answer: "duct/duce",
        skill: "meaning", reportGroup: "knowledge", support: "given a field of 4 choices", ccss: "L.6.4b / L.7.4b / L.8.4b"
      },
      {
        id: "post-03",
        challenge: "Mystery Word",
        type: "choice",
        prompt: "The engineers tested the ejectable seat during the safety trial. Which meaning best fits ejectable?",
        help: "Use the word parts and the sentence as clues.",
        choices: [
          "able to be thrown out",
          "able to be pulled back",
          "able to be sent across",
          "able to be heard"
        ],
        answer: "able to be thrown out",
        skill: "inference",
        reportGroup: "transfer",
        trainedStatus: "transfer",
        support: "given a field of 4 choices",
        ccss: "L.6.4b / L.7.4b / L.8.4b"
      },

      {
        id: "post-04", challenge: "Quick Match", type: "choice",
        prompt: "Which root means time?", choices: ["chron", "terr", "voc", "vert"], answer: "chron",
        skill: "meaning", reportGroup: "knowledge", support: "given a field of 4 choices", ccss: "L.6.4b / L.7.4b / L.8.4b"
      },
      {
        id: "post-05", challenge: "Word Connection", type: "text",
        prompt: "Complete the sentence frames to explain how the prefix affects each word built on ject.", help: "Complete all four blanks.",
        responseFrame: [
          { lead: "In the word eject, the prefix e- means", middle: "so eject is about" },
          { lead: "In the word reject, the prefix re- means", middle: "so reject is about" }
        ],
        skill: "prefixRootReasoning", reportGroup: "constructed", trainedStatus: "practiced", support: "independently in a structured fill-in response",
        ccss: "L.6.4b / L.7.4b / L.8.4b", rubricTitle: "Same root, different prefixes",
        rubricReference: "2 = explains both prefix effects and links them to ject = throw: eject uses e- as out/from and reject uses re- as back/again, with accurate whole-word connections. 1 = accurately explains one word or gives a partial comparison. 0 = does not show meaningful morphological reasoning."
      },
      {
        id: "post-06", challenge: "Quick Match", type: "choice",
        prompt: "Which root means throw?", choices: ["ject", "duct/duce", "tract", "chron"], answer: "ject",
        skill: "meaning", reportGroup: "knowledge", support: "given a field of 4 choices", ccss: "L.6.4b / L.7.4b / L.8.4b"
      },
      {
        id: "post-07", challenge: "Break It Apart", type: "choice",
        prompt: "Which word-part split correctly shows the meaningful parts in chronology?", choices: ["chron-ology", "chro-nology", "chrono-l-ogy", "chronol-ogy"], answer: "chron-ology",
        skill: "analysis", reportGroup: "practiced", trainedStatus: "practiced", support: "given a field of 4 possible word-part splits", ccss: "L.6.4b / L.7.4b / L.8.4b"
      },
      {
        id: "post-08", challenge: "Quick Match", type: "choice",
        prompt: "Which endings can name a state, quality, or act?", choices: ["-ance / -ence", "-ant / -ent", "-able / -ible", "-ed"], answer: "-ance / -ence",
        skill: "meaning", reportGroup: "knowledge", support: "given a field of 4 choices", ccss: "L.6.4b / L.7.4b / L.8.4b"
      },
      {
        id: "post-09",
        challenge: "Figure It Out",
        type: "choice",
        prompt: "The strong current propelled the boat toward shore. What does propelled most likely mean?",
        help: "Use the word parts and the sentence as clues.",
        choices: [
          "pushed or drove it forward",
          "held it in one place",
          "pulled it backward",
          "made it easier to hear"
        ],
        answer: "pushed or drove it forward",
        skill: "inference",
        reportGroup: "practiced",
        trainedStatus: "practiced",
        support: "given a field of 4 choices",
        ccss: "L.6.4b / L.7.4b / L.8.4b"
      },

      {
        id: "post-10",
        challenge: "Quick Match",
        type: "choice",
        prompt: "Which root means carry or bear?",
        choices: ["fer", "ten", "vert", "sequ"],
        answer: "fer",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.6.4b / L.7.4b / L.8.4b"
      },

      {
        id: "post-11",
        challenge: "Mystery Word",
        type: "choice",
        prompt: "The speaker's last words were inaudible from the back row. What does inaudible most likely mean?",
        help: "Use the word parts and the sentence as clues.",
        choices: [
          "not able to be heard",
          "able to be heard again",
          "not able to be believed",
          "able to be pulled away"
        ],
        answer: "not able to be heard",
        skill: "inference",
        reportGroup: "transfer",
        trainedStatus: "transfer",
        support: "given a field of 4 choices",
        ccss: "L.6.4b / L.7.4b / L.8.4b"
      },

      {
        id: "post-12", challenge: "Quick Match", type: "choice",
        prompt: "Which prefix means backward or back?", choices: ["retro-", "ab-", "ad-", "trans-"], answer: "retro-",
        skill: "meaning", reportGroup: "knowledge", support: "given a field of 4 choices", ccss: "L.6.4b / L.7.4b / L.8.4b"
      },
      {
        id: "post-13", challenge: "Break It Apart", type: "choice",
        prompt: "Which word-part split correctly shows the meaningful parts in extraction?", choices: ["ex-tract-ion", "ext-ract-ion", "ex-tra-ction", "e-xtract-ion"], answer: "ex-tract-ion",
        skill: "analysis", reportGroup: "practiced", trainedStatus: "practiced", support: "given a field of 4 possible word-part splits", ccss: "L.6.4b / L.7.4b / L.8.4b"
      },
      {
        id: "post-14",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What does sequ mean?",
        choices: ["follow", "turn", "hear", "pull or draw"],
        answer: "follow",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.6.4b / L.7.4b / L.8.4b"
      },

      {
        id: "post-15",
        challenge: "Quick Match",
        type: "choice",
        prompt: "Which root means hold?",
        choices: ["ten", "mit", "vert", "tract"],
        answer: "ten",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.6.4b / L.7.4b / L.8.4b"
      },

      {
        id: "post-16", challenge: "Word Connection", type: "text",
        prompt: "Complete the sentence frames to explain how the ending changes the related words.", help: "Complete all four blanks.",
        responseFrame: [
          { lead: "In the word resistance, the suffix -ance helps show", middle: "so resistance is about" },
          { lead: "In the word resistant, the suffix -ant helps show", middle: "so resistant describes" }
        ],
        skill: "suffixReasoning", reportGroup: "constructed", trainedStatus: "practiced", support: "independently in a structured fill-in response",
        ccss: "L.6.4b / L.7.4b / L.8.4b", rubricTitle: "Related words, different suffixes",
        rubricReference: "2 = explains both suffix functions: -ance helps form resistance, naming the act or state of resisting; -ant helps form resistant, describing someone or something that resists. 1 = accurately explains one suffix or gives a partial contrast. 0 = does not explain the suffix contrast."
      }
    ]
  }
};

const setupScreen = document.getElementById("setupScreen");
const paperEntryScreen = document.getElementById("paperEntryScreen");
const studentScreen = document.getElementById("studentScreen");
const completeScreen = document.getElementById("completeScreen");
const reportScreen = document.getElementById("reportScreen");
const formSelect = document.getElementById("formSelect");
const studentSelect = document.getElementById("studentSelect");
const studentCode = document.getElementById("studentCode");
const startButton = document.getElementById("startButton");
const printStudentFormButton = document.getElementById("printStudentFormButton");
const paperEntryButton = document.getElementById("paperEntryButton");
const paperEntryItems = document.getElementById("paperEntryItems");
const paperEntryMeta = document.getElementById("paperEntryMeta");
const cancelPaperEntryButton = document.getElementById("cancelPaperEntryButton");
const savePaperEntryButton = document.getElementById("savePaperEntryButton");
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
  [setupScreen, paperEntryScreen, studentScreen, completeScreen, reportScreen].forEach((item) => {
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
    .filter((session) => session.flight === "C")
    .slice()
    .sort((a, b) => String(b.completedAt || b.startedAt || "").localeCompare(String(a.completedAt || a.startedAt || "")));

  savedAssessments.innerHTML = "";
  if (!sessions.length) {
    const empty = document.createElement("p");
    empty.className = "empty-note";
    empty.textContent = "No saved Flight C assessments on this browser yet.";
    savedAssessments.append(empty);
    return;
  }

  sessions.slice(0, 20).forEach((session) => {
    const row = document.createElement("div");
    row.className = "saved-row";

    const copy = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = `${session.studentCode} · ${FORMS[session.form]?.label || session.form}`;

    const small = document.createElement("small");
    const isComplete = Boolean(session.completedAt);

    if (isComplete) {
      small.textContent = `Completed ${new Date(session.completedAt).toLocaleDateString()} · ${session.source === "paper" ? "Paper entry" : "Digital"}`;
    } else {
      const total = formItems(session.form).length;
      const saved = Array.isArray(session.responses) ? session.responses.length : 0;
      small.textContent = `In progress · ${saved}/${total} responses saved`;
    }

    copy.append(strong, document.createElement("br"), small);

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = isComplete ? "Open report" : "Resume";
    button.addEventListener("click", () => {
      if (isComplete) openSavedReport(session.id);
      else resumeSavedAssessment(session.id);
    });

    row.append(copy, button);
    savedAssessments.append(row);
  });
}

function resumeSavedAssessment(sessionId) {
  const data = getAssessmentData();
  const session = data.sessions.find((item) => item.id === sessionId);

  if (!session || session.completedAt) return;

  currentSession = session;
  currentFormKey = session.form;
  currentItems = formItems(currentFormKey);
  currentIndex = Math.min(
    Array.isArray(session.responses) ? session.responses.length : 0,
    currentItems.length
  );

  if (currentIndex >= currentItems.length) {
    finishAssessment();
    return;
  }

  buildRouteStops();
  renderQuestion();
  showOnly(studentScreen);
}function openSavedReport(sessionId) {
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
    textarea.setAttribute("aria-label", "Structured fill-in response");
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

function requireStudentCodeForEducatorAction() {
  const code = sanitizeCode(studentCode.value);
  if (!code) {
    studentCode.focus();
    studentCode.setCustomValidity("Enter an anonymous Student Code first.");
    studentCode.reportValidity();
    return null;
  }
  studentCode.setCustomValidity("");
  return code;
}

function printableAnswer(answer) {
  return Array.isArray(answer) ? answer.join(" + ") : String(answer || "");
}

function printStudentForm() {
  const formKey = formSelect.value;
  const items = formItems(formKey);
  const code = sanitizeCode(studentCode.value);
  const formLabel = FORMS[formKey]?.label || formKey;
  const hasMulti = items.some((item) => item.type === "multi");
  const studentDirections = hasMulti
    ? "Complete each item. For items with circles, choose one answer. For items with boxes, choose all meaningful word parts that apply. Complete the sentence frames where provided."
    : "Complete each item. For items with circles, choose one answer. Complete the sentence frames where provided.";

  const itemMarkup = items.map((item, index) => {
    let responseMarkup = "";
    if (item.type === "choice" || item.type === "multi") {
      const symbol = item.type === "multi" ? "☐" : "○";
      responseMarkup = `<div class="choices">${getDisplayedChoices(item).map((choice) =>
        `<div class="choice">${symbol} ${escapeHtml(choice)}</div>`
      ).join("")}</div>`;
    } else if (item.type === "text" && item.responseFrame) {
      responseMarkup = `<div class="frames">${item.responseFrame.map((line) =>
        `<p>${escapeHtml(line.lead)} <span class="blank"></span>, ${escapeHtml(line.middle)} <span class="blank long"></span>.</p>`
      ).join("")}</div>`;
    } else {
      responseMarkup = '<div class="write-lines"><span></span><span></span><span></span></div>';
    }

    return `
      <section class="student-item">
        <div class="item-head"><strong>${index + 1}. ${escapeHtml(item.challenge)}</strong></div>
        <div class="prompt">${escapeHtml(item.prompt)}</div>
        ${item.help ? `<div class="help">${escapeHtml(item.help)}</div>` : ""}
        ${responseMarkup}
      </section>
    `;
  }).join("");

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups for this site so the printable assessment can open.");
    return;
  }

  printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Flight C ${escapeHtml(formLabel)} Student Form</title>
<style>
  @page { size: letter; margin: .55in; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #1f2f42; font: 11.5pt/1.35 Arial, sans-serif; }
  header { border-bottom: 3px solid #173b66; padding-bottom: 12px; margin-bottom: 14px; }
  h1 { margin: 0; color: #173b66; font-size: 24pt; }
  .sub { margin-top: 5px; font-weight: 700; }
  .meta { display: flex; gap: 22px; margin-top: 12px; font-weight: 700; }
  .directions { margin: 12px 0 16px; padding: 9px 11px; background: #f1f6fb; border-radius: 8px; }
  .student-item { break-inside: avoid; border-top: 1px solid #cdd8e5; padding: 11px 0 12px; }
  .item-head { color: #173b66; margin-bottom: 4px; }
  .prompt { font-weight: 700; }
  .help { margin-top: 3px; color: #58697b; font-size: 10pt; }
  .choices { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 18px; margin-top: 8px; }
  .choice { padding: 3px 0; }
  .frames p { margin: 11px 0; }
  .blank { display: inline-block; width: 110px; border-bottom: 1.5px solid #26384b; height: 18px; vertical-align: bottom; }
  .blank.long { width: 180px; }
  .write-lines span { display: block; border-bottom: 1px solid #8b99a8; height: 28px; }
  footer { margin-top: 18px; padding-top: 8px; border-top: 2px solid #173b66; font-size: 9pt; color: #58697b; }
</style>
</head>
<body>
<header>
  <h1>Flight C Check-In</h1>
  <div class="sub">${escapeHtml(formLabel)}</div>
  <div class="meta">
    <span>Student Code: ${escapeHtml(code || "________________")}</span>
    <span>Date: __________________</span>
  </div>
</header>
<div class="directions">${escapeHtml(studentDirections)}</div>
${itemMarkup}
<footer>First Volo Morphology · Student assessment form</footer>
<script>window.addEventListener("load", () => setTimeout(() => window.print(), 150));<\/script>
</body>
</html>`);
  printWindow.document.close();
}

function openPaperEntry() {
  const code = requireStudentCodeForEducatorAction();
  if (!code) return;

  currentFormKey = formSelect.value;
  currentItems = formItems(currentFormKey);
  paperEntryMeta.textContent = `${code} · ${FORMS[currentFormKey]?.label || currentFormKey}`;
  paperEntryItems.innerHTML = "";

  currentItems.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "paper-entry-item";

    const answerText = printableAnswer(item.answer);
    let controls = "";

    if (item.type === "text") {
      controls = `
        <label class="paper-entry-field">
          <span>Student response <small>(optional transcription)</small></span>
          <textarea data-paper-response="${item.id}" placeholder="Type the student's paper response here if you want it saved in the report."></textarea>
        </label>
        <label class="paper-entry-field paper-rubric-field">
          <span>Rubric score</span>
          <select data-paper-rubric="${item.id}">
            <option value="">Select 0–2</option>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </label>
        <p class="paper-rubric-reference"><strong>Rubric:</strong> ${escapeHtml(item.rubricReference || "")}</p>
      `;
    } else {
      controls = `
        <div class="paper-answer-key"><strong>Correct answer:</strong> ${escapeHtml(answerText)}</div>
        <label class="paper-entry-field paper-score-field">
          <span>Score this paper item</span>
          <select data-paper-score="${item.id}">
            <option value="">Select…</option>
            <option value="correct">Correct</option>
            <option value="incorrect">Incorrect</option>
          </select>
        </label>
      `;
    }

    card.innerHTML = `
      <div class="paper-entry-item-head">
        <span>${index + 1}</span>
        <strong>${escapeHtml(item.challenge)}</strong>
      </div>
      <p class="paper-entry-prompt">${escapeHtml(item.prompt)}</p>
      ${controls}
    `;
    paperEntryItems.append(card);
  });

  showOnly(paperEntryScreen);
}

function savePaperResults() {
  const code = sanitizeCode(studentCode.value);
  const objectiveItems = currentItems.filter((item) => item.type !== "text");
  const textItems = currentItems.filter((item) => item.type === "text");

  const missingObjective = objectiveItems.find((item) => {
    const select = paperEntryItems.querySelector(`[data-paper-score="${item.id}"]`);
    return !select || !select.value;
  });

  if (missingObjective) {
    const select = paperEntryItems.querySelector(`[data-paper-score="${missingObjective.id}"]`);
    if (select) select.focus();
    alert("Score every objective item as Correct or Incorrect before saving.");
    return;
  }

  const missingRubric = textItems.find((item) => {
    const select = paperEntryItems.querySelector(`[data-paper-rubric="${item.id}"]`);
    return !select || select.value === "";
  });

  if (missingRubric) {
    const select = paperEntryItems.querySelector(`[data-paper-rubric="${missingRubric.id}"]`);
    if (select) select.focus();
    alert("Enter a 0–2 rubric score for each structured reasoning item before saving.");
    return;
  }

  const now = new Date().toISOString();
  const responses = currentItems.map((item) => {
    if (item.type === "text") {
      const textarea = paperEntryItems.querySelector(`[data-paper-response="${item.id}"]`);
      return {
        itemId: item.id,
        response: textarea?.value.trim() || "Paper response not transcribed.",
        correct: null,
        skill: item.skill,
        reportGroup: item.reportGroup,
        trainedStatus: item.trainedStatus || null,
        support: item.support,
        ccss: item.ccss,
        answeredAt: now
      };
    }

    const select = paperEntryItems.querySelector(`[data-paper-score="${item.id}"]`);
    const correct = select?.value === "correct";
    return {
      itemId: item.id,
      response: correct ? "Paper response — scored correct" : "Paper response — scored incorrect",
      correct,
      skill: item.skill,
      reportGroup: item.reportGroup,
      trainedStatus: item.trainedStatus || null,
      support: item.support,
      ccss: item.ccss,
      answeredAt: now
    };
  });

  const rubricScores = {};
  textItems.forEach((item) => {
    const select = paperEntryItems.querySelector(`[data-paper-rubric="${item.id}"]`);
    rubricScores[item.id] = Number(select.value);
  });

  currentSession = {
    id: makeId("flight-c-assessment"),
    assessmentId: "flight-c-pre-post-v1",
    flight: "C",
    form: currentFormKey,
    studentCode: code,
    linkedStudentId: studentSelect.value || null,
    source: "paper",
    startedAt: now,
    completedAt: now,
    responses,
    rubricScores
  };

  saveCurrentSession();
  renderReport();
  showOnly(reportScreen);
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
    id: makeId("flight-c-assessment"),
    assessmentId: "flight-c-pre-post-v1",
    flight: "C",
    form: currentFormKey,
    source: "digital",
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
    .filter((session) =>
      session.completedAt &&
      session.flight === "C" &&
      session.studentCode === code &&
      session.form === form
    )
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
    ["Structured reasoning", rubricComplete ? `${rubricEarned}/${rubricPossible}` : "Pending", rubricComplete ? "rubric points" : "educator scoring needed"]
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
    `The student demonstrated the ability to match targeted classical prefixes, roots, and suffixes with their meanings with <strong>${knowledge.pct}% accuracy</strong> given a field of 4 choices.`,
    `The student demonstrated the ability to apply targeted morphology to practiced instructional words with <strong>${practiced.pct}% accuracy</strong> across the scored selected-response tasks.`,
    `The student demonstrated the ability to apply taught word-part knowledge to new words with <strong>${transfer.pct}% accuracy</strong> across the scored selected-response tasks.`,
    `The student demonstrated the ability to identify meaningful word-part boundaries in morphologically complex words with <strong>${percent(analysisCorrect, analysisResponses.length)}% accuracy</strong> given a field of 4 possible word-part splits.`,
    `The student demonstrated the ability to use classical word parts as clues to whole-word meaning with <strong>${percent(inferenceCorrect, inferenceResponses.length)}% accuracy</strong> given a field of 4 choices.`
  ];

  const textItems = currentItems.filter((item) => item.type === "text");
  const prefixRoot = textItems.find((item) => item.skill === "prefixRootReasoning");
  const suffix = textItems.find((item) => item.skill === "suffixReasoning");

  if (prefixRoot) {
    const value = currentSession.rubricScores?.[prefixRoot.id];
    statements.push(`The student demonstrated the ability to explain how different prefixes combine with a shared classical root to affect whole-word meaning, earning <strong>${Number.isFinite(Number(value)) ? `${value}/2 rubric points` : "a pending rubric score"}</strong> independently in a structured fill-in response.`);
  }
  if (suffix) {
    const value = currentSession.rubricScores?.[suffix.id];
    statements.push(`The student demonstrated the ability to explain how related derivational suffixes change meaning or grammatical role within a word family, earning <strong>${Number.isFinite(Number(value)) ? `${value}/2 rubric points` : "a pending rubric score"}</strong> independently in a structured fill-in response.`);
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
      renderItemDetail();
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

  const sessions = (student.sessions || []).filter((session) => session.gradeBand === "6-8");
  const responses = sessions.flatMap((session) => Array.isArray(session.responses) ? session.responses : []);
  if (!responses.length) {
    container.innerHTML = '<div class="app-summary-box">No linked Flight C app-practice responses are saved yet.</div>';
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
      <strong>${sessions.length} linked Flight C app ${sessions.length === 1 ? "session" : "sessions"}</strong><br>
      ${correct}/${scored.length} scored practice responses correct · <strong>${percent(correct, scored.length)}%</strong>
      <div class="app-skill-grid">${skillCards}</div>
    </div>
  `;
}

function renderItemDetail() {
  const container = document.getElementById("itemDetail");
  const rows = currentItems.map((item, index) => {
    const response = responseFor(item.id);
    let status = "Pending";
    let statusClass = "status-rubric";

    if (item.type === "text") {
      const rubricScore = currentSession.rubricScores?.[item.id];
      status = Number.isFinite(Number(rubricScore))
        ? `${rubricScore}/2`
        : "Pending";
    } else if (typeof response?.correct === "boolean") {
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

printStudentFormButton.addEventListener("click", printStudentForm);
paperEntryButton.addEventListener("click", openPaperEntry);
cancelPaperEntryButton.addEventListener("click", () => {
  currentItems = [];
  currentFormKey = null;
  showOnly(setupScreen);
});
savePaperEntryButton.addEventListener("click", savePaperResults);
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
printButton.addEventListener("click", () => {
  if (!currentSession) return;

  const formLabel =
    FORMS[currentSession.form]?.label || currentSession.form;

  const oldTitle = document.title;

  document.title =
    `Flight C ${formLabel} Assessment Report`;

  window.print();

  setTimeout(() => {
    document.title = oldTitle;
  }, 500);
});
studentCode.addEventListener("input", () => studentCode.setCustomValidity(""));

populateStudentProfiles();
renderSavedAssessments();
