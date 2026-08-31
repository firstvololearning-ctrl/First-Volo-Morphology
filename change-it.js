"use strict";

const changeItQuestions = [
  {
    family: "act → action → active → actively",
    sentence: "The class decided to take ___ to reduce wasted paper.",
    choices: ["act", "action", "active", "actively"],
    answer: "action",
    clue: "We need a noun: a thing the class can take.",
    suffix: "-ion",
    explanation: "-ion can form a noun that names an action, process, or result. Action names what the class decided to take.",
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
    family: "predict → prediction → predictive",
    sentence: "The scientist made a careful ___ about the results.",
    choices: ["predict", "predicted", "prediction", "predictive"],
    answer: "prediction",
    clue: "We need a noun after the adjective careful.",
    suffix: "-ion",
    explanation: "-ion can form a noun that names an action, process, or result. Prediction names what the scientist made.",
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
  },
  {
    family: "quick → quicker → quickly → quickness",
    sentence: "The rabbit moved ___ across the yard.",
    choices: ["quick", "quicker", "quickly", "quickness"],
    answer: "quickly",
    clue: "We need an adverb that tells how the rabbit moved.",
    suffix: "-ly",
    explanation: "-ly often forms an adverb. Quickly tells how the rabbit moved.",
    practiceBand: "2-3",
    vocabLevel: "familiar"
  },
  {
    family: "jump → jumped → jumping → jumper",
    sentence: "Yesterday, the frog ___ from the rock into the pond.",
    choices: ["jump", "jumped", "jumping", "jumper"],
    answer: "jumped",
    clue: "Yesterday tells us the action already happened.",
    suffix: "-ed",
    explanation: "-ed marks the past tense here. Jumped tells about an action that already happened.",
    practiceBand: "2-3",
    vocabLevel: "familiar"
  },
  {
    family: "jump → jumped → jumping → jumper",
    sentence: "The frog is ___ from rock to rock.",
    choices: ["jump", "jumped", "jumping", "jumper"],
    answer: "jumping",
    clue: "After is, we need the form that shows an action in progress.",
    suffix: "-ing",
    explanation: "-ing forms the action-in-progress form here. Jumping tells what the frog is doing.",
    practiceBand: "2-3",
    vocabLevel: "familiar"
  },
  {
    family: "book → books → booked → booking",
    sentence: "There are three ___ on the desk.",
    choices: ["book", "books", "booked", "booking"],
    answer: "books",
    clue: "Three tells us we need a plural noun.",
    suffix: "-s",
    explanation: "-s can mark more than one. Books means more than one book.",
    practiceBand: "2-3",
    vocabLevel: "familiar"
  },
  {
    family: "box → boxes → boxed → boxing",
    sentence: "We packed the supplies into three large ___.",
    choices: ["box", "boxes", "boxed", "boxing"],
    answer: "boxes",
    clue: "Three tells us we need a plural noun.",
    suffix: "-es",
    explanation: "-es can mark more than one. Boxes means more than one box.",
    practiceBand: "2-3",
    vocabLevel: "familiar"
  },
  {
    family: "tall → taller → tallest → tallness",
    sentence: "The sunflower is ___ than the other plants.",
    choices: ["tall", "taller", "tallest", "tallness"],
    answer: "taller",
    clue: "Than signals that two things are being compared.",
    suffix: "-er",
    explanation: "-er can form a comparative adjective. Taller means having more height.",
    practiceBand: "2-3",
    vocabLevel: "familiar"
  },
  {
    family: "fast → faster → fastest → fastness",
    sentence: "Of all the runners, Maya was the ___.",
    choices: ["fast", "faster", "fastest", "fastness"],
    answer: "fastest",
    clue: "Of all signals that one runner is being compared with the whole group.",
    suffix: "-est",
    explanation: "-est can form a superlative adjective. Fastest means faster than all the others.",
    practiceBand: "2-3",
    vocabLevel: "familiar"
  },
  {
    family: "move → movement → moving → movable",
    sentence: "The sudden ___ of the branch showed that something was in the tree.",
    choices: ["move", "movement", "moving", "movable"],
    answer: "movement",
    clue: "We need a noun that names an action or result.",
    suffix: "-ment",
    explanation: "-ment can form a noun that names an action, process, result, or state. Movement names the action or result of moving.",
    practiceBand: "4-5",
    vocabLevel: "familiar"
  },
  {
    family: "danger → dangerous → dangerously → endanger",
    sentence: "The icy road was ___ because cars could easily slide.",
    choices: ["danger", "dangerous", "dangerously", "endanger"],
    answer: "dangerous",
    clue: "We need an adjective that describes the road.",
    suffix: "-ous",
    explanation: "-ous can form an adjective. Dangerous describes something that can cause harm.",
    practiceBand: "4-5",
    vocabLevel: "familiar"
  },
  {
    family: "music → musical → musician → musically",
    sentence: "The class performed a ___ number for the audience.",
    choices: ["music", "musical", "musician", "musically"],
    answer: "musical",
    clue: "We need an adjective that describes the number.",
    suffix: "-al",
    explanation: "-al can form an adjective. Musical means related to music.",
    practiceBand: "4-5",
    vocabLevel: "familiar"
  },
  {
    family: "art → artist → artistic → artistically",
    sentence: "The ___ created a large mural for the school.",
    choices: ["art", "artist", "artistic", "artistically"],
    answer: "artist",
    clue: "We need a noun that names a person.",
    suffix: "-ist",
    explanation: "-ist can form a noun naming a person. An artist is a person who creates art.",
    practiceBand: "4-5",
    vocabLevel: "familiar"
  },
  {
    family: "credit → credible → credibility → credibly",
    sentence: "The researcher used a ___ source to support the claim.",
    choices: ["credit", "credible", "credibility", "credibly"],
    answer: "credible",
    clue: "We need an adjective that describes the source.",
    suffix: "-ible",
    explanation: "-ible can form an adjective meaning able to be. Credible means able to be believed or trusted.",
    practiceBand: "6-8",
    vocabLevel: "academic"
  },
  {
    family: "credit → credible → credibility → credibly",
    sentence: "The author's careful use of evidence increased the ___ of the argument.",
    choices: ["credit", "credible", "credibility", "credibly"],
    answer: "credibility",
    clue: "We need a noun that names a quality someone or something has.",
    suffix: "-ity",
    explanation: "-ity can form a noun that names a state or quality someone or something has. Credibility is the quality of being believable.",
    practiceBand: "6-8",
    vocabLevel: "academic"
  },
  {
    family: "persist → persistent → persistence → persistently",
    sentence: "Her ___ helped her continue working even when the problem was difficult.",
    choices: ["persist", "persistent", "persistence", "persistently"],
    answer: "persistence",
    clue: "We need a noun that names a quality someone or something has.",
    suffix: "-ence",
    explanation: "-ence can form a noun that names an action, or a state or quality someone or something has. Persistence names the quality of continuing despite difficulty.",
    practiceBand: "6-8",
    vocabLevel: "academic"
  },
  {
    family: "perform → performer → performance → performing",
    sentence: "Her ___ in the debate showed careful preparation.",
    choices: ["perform", "performer", "performance", "performing"],
    answer: "performance",
    clue: "We need a noun naming an act or result.",
    suffix: "-ance",
    explanation: "-ance can form a noun that names an action, or a state or quality someone or something has. Performance names the action or result of performing.",
    practiceBand: "6-8",
    vocabLevel: "academic"
  },
  {
    family: "exist → existing → existence → existent",
    sentence: "Scientists continue to investigate the ___ of life in extreme environments.",
    choices: ["exist", "existing", "existence", "existent"],
    answer: "existence",
    clue: "We need a noun naming a state.",
    suffix: "-ence",
    explanation: "-ence can form a noun that names an action, or a state or quality someone or something has. Existence names the state of being real or present.",
    practiceBand: "6-8",
    vocabLevel: "academic"
  },
  {
    family: "vocal → vocalist → vocalize → vocally",
    sentence: "The lead ___ performed the final song.",
    choices: ["vocal", "vocalist", "vocalize", "vocally"],
    answer: "vocalist",
    clue: "We need a noun that names a person.",
    suffix: "-ist",
    explanation: "-ist can form a noun naming a person. A vocalist is a person who sings.",
    practiceBand: "6-8",
    vocabLevel: "academic"
  },
  {
    family: "vocal → vocalist → vocalize → vocally",
    sentence: "The coach asked the actor to ___ the sound clearly.",
    choices: ["vocal", "vocalist", "vocalize", "vocally"],
    answer: "vocalize",
    clue: "After to, we need a verb naming the action.",
    suffix: "-ize",
    explanation: "-ize can form a verb. Vocalize means to produce or express with the voice.",
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
    const containsReservedTransferWord =
      (item.choices || []).some(
        (word) =>
          isReservedTransferWord(word)
      );

    if (containsReservedTransferWord) {
      return false;
    }

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
      "Choose Roots + Suffixes or Prefixes + Roots + Suffixes, or adjust the Practice Flight or Vocabulary filter."
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
    primaryTargetId:
      window.FirstVoloMorphemeProgress
        ?.canonicalId(
          item.suffix,
          {
            type: "suffix",
            meaning: item.explanation
          }
        ) || null,
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
    `${item.answer}. ${item.explanation}`,
    [{ id: getCanonicalProgressMorphemeId(item.suffix), token: item.suffix }]
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
