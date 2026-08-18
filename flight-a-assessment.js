"use strict";

const PROGRESS_KEY = "firstVoloMorphologyProgressV1";
const ASSESSMENT_KEY = "firstVoloMorphologyAssessmentFlightAV1";

const FORMS = {
  pre: {
    label: "Pre · Form A",
    items: [
      {
        id: "pre-01",
        challenge: "Break It Apart",
        type: "choice",
        prompt: "Which word-part split correctly shows the meaningful parts in unhappy?",
        choices: ["un-happy", "u-nhappy", "unh-appy", "unhap-py"],
        answer: "un-happy",
        skill: "analysis",
        reportGroup: "practiced",
        trainedStatus: "practiced",
        support: "given a field of 4 possible word-part splits",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "pre-02",
        challenge: "Word Connection",
        type: "text",
        prompt: "Complete the sentence frames to explain how the prefix affects the meaning of each word.",
        help: "Complete all four blanks.",
        responseFrame: [
          { lead: "In the word preview, the prefix pre- means", middle: "so preview is about" },
          { lead: "In the word review, the prefix re- means", middle: "so review is about" }
        ],
        skill: "prefixReasoning",
        reportGroup: "constructed",
        trainedStatus: "practiced",
        support: "independently in a structured fill-in response",
        ccss: "L.2.4b-c; L.3.4b-c",
        rubricTitle: "Same base, different prefixes",
        rubricReference: "2 = explains both prefixes accurately: pre- means before, so preview is about seeing or looking before; re- means again/back, so review is about looking at or going over something again. 1 = accurately explains one prefix or gives a partial contrast. 0 = does not explain the prefix contrast."
      },
      {
        id: "pre-03",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What does -ed usually show?",
        choices: ["something already happened", "something is happening now", "more than one", "without"],
        answer: "something already happened",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "pre-04",
        challenge: "Mystery Word",
        type: "choice",
        prompt: "What does prewash most likely mean?",
        help: "Use the prefix as a clue.",
        choices: ["wash before another step", "wash again", "wash the wrong way", "not wash"],
        answer: "wash before another step",
        skill: "inference",
        reportGroup: "transfer",
        trainedStatus: "transfer",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; L.3.4b-c"
      },
      {
        id: "pre-05",
        challenge: "Word Connection",
        type: "text",
        prompt: "Complete the sentence frames to explain how the suffix affects the meaning of each word.",
        help: "Complete all four blanks.",
        responseFrame: [
          { lead: "In the word helpful, the suffix -ful means", middle: "so helpful is about" },
          { lead: "In the word helpless, the suffix -less means", middle: "so helpless is about" }
        ],
        skill: "suffixReasoning",
        reportGroup: "constructed",
        trainedStatus: "near-transfer",
        support: "independently in a structured fill-in response",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c",
        rubricTitle: "Same base, different suffixes",
        rubricReference: "2 = explains both suffixes accurately: -ful means full of/having, so helpful is about giving or having help; -less means without, so helpless is about being without help or unable to help oneself. 1 = accurately explains one suffix or gives a partial contrast. 0 = does not explain the suffix contrast."
      },
      {
        id: "pre-06",
        challenge: "Mystery Word",
        type: "choice",
        prompt: "What does mislabel most likely mean?",
        help: "Use the prefix as a clue.",
        choices: ["label something the wrong way", "label something again", "label something before", "not label something"],
        answer: "label something the wrong way",
        skill: "inference",
        reportGroup: "transfer",
        trainedStatus: "transfer",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; L.3.4b-c"
      },
      {
        id: "pre-07",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What can dis- mean?",
        choices: ["apart or away; not or opposite of", "again or back", "before", "wrongly or badly"],
        answer: "apart or away; not or opposite of",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "pre-08",
        challenge: "Break It Apart",
        type: "choice",
        prompt: "Which word-part split correctly shows the meaningful parts in careless?",
        choices: ["care-less", "car-eless", "carel-ess", "c-areless"],
        answer: "care-less",
        skill: "analysis",
        reportGroup: "practiced",
        trainedStatus: "practiced",
        support: "given a field of 4 possible word-part splits",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "pre-09",
        challenge: "Figure It Out",
        type: "choice",
        prompt: "Maya reread the directions because she missed a step. What does reread mean?",
        choices: ["read again", "read before", "read the wrong way", "stop reading"],
        answer: "read again",
        skill: "inference",
        reportGroup: "practiced",
        trainedStatus: "practiced",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; L.3.4b-c"
      },
      {
        id: "pre-10",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What can the suffix -er mean in a word like teacher?",
        choices: ["one who does something", "without", "full of", "happening now"],
        answer: "one who does something",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "pre-11",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What does mis- mean?",
        choices: ["wrongly or badly", "again or back", "before", "under"],
        answer: "wrongly or badly",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "pre-12",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What does -ing usually show?",
        choices: ["an action happening now or in progress", "something already happened", "without", "more than one"],
        answer: "an action happening now or in progress",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "pre-13",
        challenge: "Break It Apart",
        type: "choice",
        prompt: "Which word-part split correctly shows the meaningful parts in teacher?",
        choices: ["teach-er", "tea-cher", "teac-her", "t-eacher"],
        answer: "teach-er",
        skill: "analysis",
        reportGroup: "practiced",
        trainedStatus: "practiced",
        support: "given a field of 4 possible word-part splits",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "pre-14",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What do -able and -ible usually mean?",
        choices: ["can be or able to be", "full of", "without", "one who does something"],
        answer: "can be or able to be",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "pre-15",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What does un- usually mean?",
        choices: ["not or opposite of", "before", "again", "full of"],
        answer: "not or opposite of",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "pre-16",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What do -s and -es usually show?",
        choices: ["more than one", "something already happened", "an action happening now", "without"],
        answer: "more than one",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      }
    ]
  },

  post: {
    label: "Post · Form B",
    items: [
      {
        id: "post-01",
        challenge: "Break It Apart",
        type: "choice",
        prompt: "Which word-part split correctly shows the meaningful parts in disagree?",
        choices: ["dis-agree", "di-sagree", "disa-gree", "disag-ree"],
        answer: "dis-agree",
        skill: "analysis",
        reportGroup: "practiced",
        trainedStatus: "practiced",
        support: "given a field of 4 possible word-part splits",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "post-02",
        challenge: "Word Connection",
        type: "text",
        prompt: "Complete the sentence frames to explain how the prefix affects the meaning of each word.",
        help: "Complete all four blanks.",
        responseFrame: [
          { lead: "In the word preheat, the prefix pre- means", middle: "so preheat is about" },
          { lead: "In the word reheat, the prefix re- means", middle: "so reheat is about" }
        ],
        skill: "prefixReasoning",
        reportGroup: "constructed",
        trainedStatus: "practiced",
        support: "independently in a structured fill-in response",
        ccss: "L.2.4b-c; L.3.4b-c",
        rubricTitle: "Same base, different prefixes",
        rubricReference: "2 = explains both prefixes accurately: pre- means before, so preheat is about heating before another step; re- means again/back, so reheat is about heating again. 1 = accurately explains one prefix or gives a partial contrast. 0 = does not explain the prefix contrast."
      },
      {
        id: "post-03",
        challenge: "Quick Match",
        type: "choice",
        prompt: "Which ending usually shows that something already happened?",
        choices: ["-ed", "-ing", "-less", "-ful"],
        answer: "-ed",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "post-04",
        challenge: "Mystery Word",
        type: "choice",
        prompt: "What does pretest most likely mean?",
        help: "Use the prefix as a clue.",
        choices: ["a test before another test or lesson", "a test taken again", "a test done the wrong way", "not a test"],
        answer: "a test before another test or lesson",
        skill: "inference",
        reportGroup: "transfer",
        trainedStatus: "transfer",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; L.3.4b-c"
      },
      {
        id: "post-05",
        challenge: "Word Connection",
        type: "text",
        prompt: "Complete the sentence frames to explain how the suffix affects the meaning of each word.",
        help: "Complete all four blanks.",
        responseFrame: [
          { lead: "In the word hopeful, the suffix -ful means", middle: "so hopeful is about" },
          { lead: "In the word hopeless, the suffix -less means", middle: "so hopeless is about" }
        ],
        skill: "suffixReasoning",
        reportGroup: "constructed",
        trainedStatus: "near-transfer",
        support: "independently in a structured fill-in response",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c",
        rubricTitle: "Same base, different suffixes",
        rubricReference: "2 = explains both suffixes accurately: -ful means full of/having, so hopeful is about having hope; -less means without, so hopeless is about being without hope. 1 = accurately explains one suffix or gives a partial contrast. 0 = does not explain the suffix contrast."
      },
      {
        id: "post-06",
        challenge: "Mystery Word",
        type: "choice",
        prompt: "What does miscount most likely mean?",
        help: "Use the prefix as a clue.",
        choices: ["count incorrectly", "count again", "count before", "not count"],
        answer: "count incorrectly",
        skill: "inference",
        reportGroup: "transfer",
        trainedStatus: "transfer",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; L.3.4b-c"
      },
      {
        id: "post-07",
        challenge: "Quick Match",
        type: "choice",
        prompt: "Which prefix can mean apart or away, not, or opposite of?",
        choices: ["dis-", "re-", "pre-", "mis-"],
        answer: "dis-",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "post-08",
        challenge: "Break It Apart",
        type: "choice",
        prompt: "Which word-part split correctly shows the meaningful parts in misread?",
        choices: ["mis-read", "mi-sread", "misr-ead", "m-isread"],
        answer: "mis-read",
        skill: "analysis",
        reportGroup: "practiced",
        trainedStatus: "practiced",
        support: "given a field of 4 possible word-part splits",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "post-09",
        challenge: "Figure It Out",
        type: "choice",
        prompt: "Leo previewed the book before reading it. What does preview mean?",
        choices: ["look at something before", "look at something again", "look at something the wrong way", "not look at something"],
        answer: "look at something before",
        skill: "inference",
        reportGroup: "practiced",
        trainedStatus: "practiced",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; L.3.4b-c"
      },
      {
        id: "post-10",
        challenge: "Quick Match",
        type: "choice",
        prompt: "Which ending can mean one who does something?",
        choices: ["-er", "-less", "-ful", "-ed"],
        answer: "-er",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "post-11",
        challenge: "Quick Match",
        type: "choice",
        prompt: "Which prefix means wrongly or badly?",
        choices: ["mis-", "re-", "pre-", "un-"],
        answer: "mis-",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "post-12",
        challenge: "Quick Match",
        type: "choice",
        prompt: "Which ending can show an action happening now or in progress?",
        choices: ["-ing", "-ed", "-less", "-s / -es"],
        answer: "-ing",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "post-13",
        challenge: "Break It Apart",
        type: "choice",
        prompt: "Which word-part split correctly shows the meaningful parts in hopeful?",
        choices: ["hope-ful", "hop-eful", "hopef-ul", "ho-peful"],
        answer: "hope-ful",
        skill: "analysis",
        reportGroup: "practiced",
        trainedStatus: "practiced",
        support: "given a field of 4 possible word-part splits",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "post-14",
        challenge: "Quick Match",
        type: "choice",
        prompt: "Which ending can mean can be or able to be?",
        choices: ["-able / -ible", "-ful", "-less", "-er"],
        answer: "-able / -ible",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "post-15",
        challenge: "Quick Match",
        type: "choice",
        prompt: "What does un- usually mean?",
        choices: ["not or opposite of", "again", "before", "full of"],
        answer: "not or opposite of",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
      },
      {
        id: "post-16",
        challenge: "Quick Match",
        type: "choice",
        prompt: "Which ending usually shows more than one?",
        choices: ["-s / -es", "-ed", "-ing", "-less"],
        answer: "-s / -es",
        skill: "meaning",
        reportGroup: "knowledge",
        support: "given a field of 4 choices",
        ccss: "L.2.4b-c; RF.3.3a-b; L.3.4b-c"
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
    empty.textContent = "No completed Flight A assessments saved on this browser yet.";
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
    id: makeId("flight-a-assessment"),
    assessmentId: "flight-a-pre-post-v1",
    flight: "A",
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
    `The student demonstrated the ability to match targeted prefixes and suffixes with their meanings with <strong>${knowledge.pct}% accuracy</strong> given a field of 4 choices.`,
    `The student demonstrated the ability to apply targeted morphology to practiced instructional words with <strong>${practiced.pct}% accuracy</strong> across the scored selected-response tasks.`,
    `The student demonstrated the ability to apply taught word-part knowledge to new words with <strong>${transfer.pct}% accuracy</strong> across the scored selected-response tasks.`,
    `The student demonstrated the ability to identify meaningful word-part boundaries in morphologically complex words with <strong>${percent(analysisCorrect, analysisResponses.length)}% accuracy</strong> given a field of 4 possible word-part splits.`,
    `The student demonstrated the ability to use prefixes and suffixes as clues to whole-word meaning with <strong>${percent(inferenceCorrect, inferenceResponses.length)}% accuracy</strong> given a field of 4 choices.`
  ];

  const textItems = currentItems.filter((item) => item.type === "text");
  const prefix = textItems.find((item) => item.skill === "prefixReasoning");
  const suffix = textItems.find((item) => item.skill === "suffixReasoning");
  if (prefix) {
    const value = currentSession.rubricScores?.[prefix.id];
    statements.push(`The student demonstrated the ability to explain how different prefixes change the meaning of words that share a base, earning <strong>${Number.isFinite(Number(value)) ? `${value}/2 rubric points` : "a pending rubric score"}</strong> independently in a structured fill-in response.`);
  }
  if (suffix) {
    const value = currentSession.rubricScores?.[suffix.id];
    statements.push(`The student demonstrated the ability to explain how different suffixes change the meaning of words that share a base, earning <strong>${Number.isFinite(Number(value)) ? `${value}/2 rubric points` : "a pending rubric score"}</strong> independently in a structured fill-in response.`);
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

  const sessions = (student.sessions || []).filter((session) => session.gradeBand === "2-3");
  const responses = sessions.flatMap((session) => Array.isArray(session.responses) ? session.responses : []);
  if (!responses.length) {
    container.innerHTML = '<div class="app-summary-box">No linked Flight A app-practice responses are saved yet.</div>';
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
      <strong>${sessions.length} linked Flight A app ${sessions.length === 1 ? "session" : "sessions"}</strong><br>
      ${correct}/${scored.length} scored practice responses correct · <strong>${percent(correct, scored.length)}%</strong>
      <div class="app-skill-grid">${skillCards}</div>
    </div>
  `;
}

function renderItemDetail() {
  const container = document.getElementById("itemDetail");
  const rows = currentItems.map((item, index) => {
    const response = responseFor(item.id);
    let status = "Structured response";
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
