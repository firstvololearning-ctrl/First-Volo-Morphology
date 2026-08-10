"use strict";

const changeItQuestions = [
  {
    family: "kind → kindness → kindly",
    sentence: "Her ___ made the new student feel welcome.",
    choices: ["kind", "kindness", "kindly", "kinder"],
    answer: "kindness",
    clue: "We need a noun that names a quality.",
    suffix: "-ness",
    explanation: "-ness forms a noun. Kindness names the quality shown by her behavior.",
    practiceBand: "2-3",
    vocabLevel: "familiar"
  },
  {
    family: "help → helper → helpful → helpfully",
    sentence: "The directions were ___ because they explained each step clearly.",
    choices: ["help", "helper", "helpful", "helpfully"],
    answer: "helpful",
    clue: "We need an adjective that describes the directions.",
    suffix: "-ful",
    explanation: "-ful often forms an adjective. Helpful describes the directions.",
    practiceBand: "2-3",
    vocabLevel: "familiar"
  },
  {
    family: "act → action → active → actively",
    sentence: "The class decided to take ___ to reduce wasted paper.",
    choices: ["act", "action", "active", "actively"],
    answer: "action",
    clue: "We need a noun: a thing the class can take.",
    suffix: "-ion",
    explanation: "-ion forms a noun. Action names what the class decided to take.",
    practiceBand: "4-5",
    vocabLevel: "familiar"
  },
  {
    family: "act → action → active → actively",
    sentence: "The students participated ___ during the science activity.",
    choices: ["act", "action", "active", "actively"],
    answer: "actively",
    clue: "We need an adverb that tells how the students participated.",
    suffix: "-ly",
    explanation: "-ly often forms an adverb. Actively tells how the students participated.",
    practiceBand: "4-5",
    vocabLevel: "familiar"
  },
  {
    family: "inspect → inspection → inspector",
    sentence: "The building ___ carefully checked the safety equipment.",
    choices: ["inspect", "inspection", "inspector", "inspecting"],
    answer: "inspector",
    clue: "We need a noun that names a person.",
    suffix: "-or",
    explanation: "-or can form a noun naming a person who does something. An inspector is a person who inspects.",
    practiceBand: "4-5",
    vocabLevel: "academic"
  },
  {
    family: "inspect → inspection → inspector",
    sentence: "The safety ___ lasted nearly an hour.",
    choices: ["inspect", "inspection", "inspector", "inspecting"],
    answer: "inspection",
    clue: "We need a noun that names an action or process.",
    suffix: "-ion",
    explanation: "-ion forms a noun. Inspection names the process of inspecting.",
    practiceBand: "4-5",
    vocabLevel: "academic"
  },
  {
    family: "construct → construction → constructive",
    sentence: "The ___ of the new bridge took several months.",
    choices: ["construct", "construction", "constructive", "constructively"],
    answer: "construction",
    clue: "We need a noun that names a process.",
    suffix: "-ion",
    explanation: "-ion forms a noun. Construction names the process of building.",
    practiceBand: "4-5",
    vocabLevel: "academic"
  },
  {
    family: "construct → construction → constructive",
    sentence: "Her feedback was ___ and helped improve the project.",
    choices: ["construct", "construction", "constructive", "constructively"],
    answer: "constructive",
    clue: "We need an adjective that describes the feedback.",
    suffix: "-ive",
    explanation: "-ive often forms an adjective. Constructive describes feedback that helps improve something.",
    practiceBand: "6-8",
    vocabLevel: "academic"
  },
  {
    family: "predict → prediction → predictive",
    sentence: "The scientist made a careful ___ about the results.",
    choices: ["predict", "predicted", "prediction", "predictive"],
    answer: "prediction",
    clue: "We need a noun after the adjective careful.",
    suffix: "-ion",
    explanation: "-ion forms a noun. Prediction names what the scientist made.",
    practiceBand: "6-8",
    vocabLevel: "academic"
  },
  {
    family: "predict → prediction → predictive",
    sentence: "The researchers created a ___ model to estimate future changes.",
    choices: ["predict", "predicted", "prediction", "predictive"],
    answer: "predictive",
    clue: "We need an adjective that describes the model.",
    suffix: "-ive",
    explanation: "-ive often forms an adjective. Predictive describes a model used to predict.",
    practiceBand: "6-8",
    vocabLevel: "academic"
  }
];

let changeItState = {
  items: [],
  index: 0,
  score: 0,
  answered: false
};

function getChangeItEligibleQuestions() {
  if (
    studyMode !== "root-suffix" &&
    studyMode !== "prefix-root-suffix"
  ) {
    return [];
  }

  return changeItQuestions.filter((item) => {
    const matchesGrade =
      gradeBand === "all" ||
      item.practiceBand === gradeBand;

    const matchesVocabulary =
      vocabLevel === "all" ||
      item.vocabLevel === vocabLevel;

    return matchesGrade && matchesVocabulary;
  });
}

function renderChangeItActivity() {
  const eligible = getChangeItEligibleQuestions();

  if (eligible.length < 1) {
    showStartMessage(
      "No Change It questions match this selection yet.",
      "Choose Roots + Suffixes or Prefixes + Roots + Suffixes, or adjust the Grade Band or Vocabulary filter."
    );
    return;
  }

  panels.change.hidden = false;
  workspaceTitle.textContent = "Change It";
  workspaceSubtitle.textContent =
    "Choose the word-family member whose form and word job fit the sentence.";

  activityProgress.hidden = false;
  workspaceActions.hidden = true;

  changeItState = {
    items: shuffle(eligible).slice(0, Math.min(10, eligible.length)),
    index: 0,
    score: 0,
    answered: false
  };

  window.FirstVoloActivityProgress?.startSession({
    activity: "change",
    studyMode,
    gradeBand,
    vocabLevel,
    totalItems: changeItState.items.length
  });

  renderChangeItQuestion();
}

function renderChangeItQuestion() {
  changeItState.answered = false;
  workspaceActions.hidden = true;

  const item = changeItState.items[changeItState.index];
  const changePrompt = document.getElementById("changePrompt");
  const changeChoices = document.getElementById("changeChoices");
  const changeFeedback = document.getElementById("changeFeedback");

  activityProgress.textContent =
    `Change It · ${changeItState.index + 1} of ${changeItState.items.length}`;

  changePrompt.innerHTML = `
    <div class="use-stage-label">Change It</div>
    <p class="use-directions">Choose the member of the word family that best completes the sentence.</p>
    <div class="feedback-label">Word family</div>
    <div class="feedback-value">${escapeHTML(item.family)}</div>
    <div class="use-sentence">${escapeHTML(item.sentence)}</div>
    <div class="feedback-label">Word job clue</div>
    <div class="feedback-value">${escapeHTML(item.clue)}</div>
  `;

  changeChoices.innerHTML = "";
  changeFeedback.hidden = true;
  changeFeedback.innerHTML = "";

  shuffle(item.choices).forEach((word) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button change-choice";
    button.textContent = word;
    button.addEventListener("click", () => {
      checkChangeItChoice(button, word, item);
    });
    changeChoices.append(button);
  });
}

function checkChangeItChoice(selectedButton, selectedWord, item) {
  if (changeItState.answered) {
    return;
  }

  changeItState.answered = true;
  const isCorrect = selectedWord === item.answer;

  if (isCorrect) {
    changeItState.score += 1;
  }

  window.FirstVoloActivityProgress?.recordResponse({
    skill: "change",
    correct: isCorrect,
    primaryTarget: item.suffix,
    targetType: "suffix",
    word: item.answer,
    response: selectedWord,
    correctAnswer: item.answer
  });

  document
    .querySelectorAll("#changeChoices .change-choice")
    .forEach((button) => {
      button.disabled = true;
      if (button.textContent === item.answer) {
        button.classList.add("correct");
      }
    });

  if (!isCorrect) {
    selectedButton.classList.add("incorrect");
  }

  renderChangeItFeedback(item, isCorrect);
  workspaceActions.hidden = false;

  const isLast =
    changeItState.index === changeItState.items.length - 1;

  nextQuestionButton.textContent =
    isLast
      ? `Start Again · ${changeItState.score}/${changeItState.items.length}`
      : "Next";
}

function renderChangeItFeedback(item, isCorrect) {
  const feedback = document.getElementById("changeFeedback");

  feedback.hidden = false;
  feedback.className =
    `feedback-panel ${
      isCorrect ? "correct-feedback" : "incorrect-feedback"
    }`;

  feedback.innerHTML = `
    <div class="use-feedback-content">
      <h4 class="feedback-heading">${isCorrect ? "Correct!" : "Not quite."}</h4>
      <p><strong>${escapeHTML(item.answer)}</strong> fits the sentence.</p>
      <div class="feedback-label">Why it fits</div>
      <div class="feedback-value">${escapeHTML(item.explanation)}</div>
      <div class="feedback-label">Suffix clue</div>
      <div class="feedback-value">${escapeHTML(item.suffix)}</div>
      <button class="audio-button" type="button">🔊 Hear it</button>
    </div>
  `;

  setAudioButton(
    feedback,
    `${item.answer}. ${item.explanation}`
  );
}

function goToNextChangeItQuestion() {
  const isLast =
    changeItState.index === changeItState.items.length - 1;

  if (isLast) {
    renderChangeItActivity();
    return;
  }

  changeItState.index += 1;
  renderChangeItQuestion();
}
