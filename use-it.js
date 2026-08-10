"use strict";

/* ========================================
   FIRST VOLO MORPHOLOGY
   USE IT — PASS 1
   Choose It
   ======================================== */


/* ========================================
   SENTENCE BANK
   ======================================== */

const useItSentenceBank = {

  construct:
    "The students will ___ a model bridge from wooden sticks.",

  interrupt:
    "Please do not ___ the speaker while she is explaining the experiment.",

  transport:
    "Trucks ___ food from the warehouse to stores.",

  import:
    "The company will ___ coffee from another country.",

  export:
    "The farm will ___ its fruit to markets in other countries.",

  reject:
    "The committee may ___ a proposal that does not meet the requirements.",

  project:
    "The screen can ___ the image onto the wall.",

  emit:
    "The lamp can ___ a bright beam of light.",

  transmit:
    "Satellites ___ signals across long distances.",

  helpful:
    "The directions were ___ because they explained each step clearly.",

  careless:
    "A ___ mistake caused the number to be copied incorrectly.",

  kindness:
    "Her ___ made the new student feel welcome.",

  active:
    "The volcano is still ___ and could erupt again.",

  action:
    "The class decided to take ___ to reduce wasted paper.",

  audible:
    "The announcement was clearly ___ from the back of the room.",

  credible:
    "The researcher used a ___ source to support the claim.",

  prediction:
    "Her ___ about tomorrow's weather turned out to be correct.",

  construction:
    "The ___ of the new library will take several months.",

  disruptive:
    "The loud noise was ___ and made it difficult to concentrate.",

  transformation:
    "The caterpillar's ___ into a butterfly is a major change.",

  projection:
    "The map shows a ___ of how the city may grow over the next decade.",

  inactive:
    "After sitting unused for months, the account became ___.",

  inspector:
    "The building ___ carefully checked the safety equipment.",

  international:
    "The conference included students from many countries and was truly ___.",

  nonverbal:
    "A facial expression is one form of ___ communication.",

  incredible:
    "The view from the top of the mountain was so impressive that it seemed ___.",

  dependent:
    "Young animals are often ___ on adults for food and protection.",

  convention:
    "Thousands of people attended the science ___ this weekend."

};


/* ========================================
   STATE
   ======================================== */

let useItState = {
  items: [],
  index: 0,
  score: 0,
  answered: false
};


/* ========================================
   HELPERS
   ======================================== */

function getUseItEligibleWords() {
  const activeWords = getActiveBuildWords();

  const inventory =
    window.FIRST_VOLO_WORD_INVENTORY || [];

  return activeWords.filter((item) => {
    const inventoryItem = inventory.find(
      (entry) => entry.word === item.word
    );

    if (!inventoryItem) {
      return false;
    }

    const matchesGrade =
      gradeBand === "all" ||
      inventoryItem.practiceBand === gradeBand;

    const matchesVocabulary =
      vocabLevel === "all" ||
      inventoryItem.vocabLevel === vocabLevel;

    const hasSentence =
      Object.prototype.hasOwnProperty.call(
        useItSentenceBank,
        item.word
      );

    return matchesGrade && matchesVocabulary && hasSentence;
  });
}
function getUseItPartsText(item) {
  const parts = [];

  if (item.prefix) {
    parts.push(
      `${item.prefix} = ${item.prefixMeaning}`
    );
  }

  if (item.root) {
    parts.push(
      `${item.root} = ${item.rootMeaning}`
    );
  }

  if (item.base) {
    parts.push(
      `${item.base} = ${item.baseMeaning}`
    );
  }

  if (item.suffix) {
    parts.push(
      `${item.suffix} = ${item.suffixMeaning}`
    );
  }

  return parts.join(" · ");
}


function makeUseItChoices(
  correctItem
) {
  const inventory =
    window.FIRST_VOLO_WORD_INVENTORY || [];

  const gradeRanks = {
    "2-3": 1,
    "4-5": 2,
    "6-8": 3
  };

  const vocabRanks = {
    familiar: 1,
    academic: 2
  };

  const distractorPool =
    getActiveBuildWords().filter((item) => {
      if (item.word === correctItem.word) {
        return false;
      }

      const inventoryItem =
        inventory.find(
          (entry) => entry.word === item.word
        );

      if (!inventoryItem) {
        return false;
      }

      const gradeOkay =
        gradeBand === "all" ||
        (
          gradeRanks[inventoryItem.practiceBand] &&
          gradeRanks[inventoryItem.practiceBand] <=
            gradeRanks[gradeBand]
        );

      const vocabOkay =
        vocabLevel === "all" ||
        (
          vocabRanks[inventoryItem.vocabLevel] &&
          vocabRanks[inventoryItem.vocabLevel] <=
            vocabRanks[vocabLevel]
        );

      return gradeOkay && vocabOkay;
    });

  let distractors =
    shuffle(distractorPool)
      .slice(0, 3)
      .map((item) => item.word);

  if (distractors.length < 3) {
    const fallback =
      shuffle(
        getActiveBuildWords().filter(
          (item) =>
            item.word !== correctItem.word &&
            !distractors.includes(item.word)
        )
      );

    distractors = [
      ...distractors,
      ...fallback
        .slice(0, 3 - distractors.length)
        .map((item) => item.word)
    ];
  }

  return shuffle([
    correctItem.word,
    ...distractors
  ]);
}


function renderUseItActivity() {
  const eligibleWords =
    getUseItEligibleWords();

  if (eligibleWords.length < 1) {
    showStartMessage(
      `Not enough Use It words match the selected Grade Band and Vocabulary level for this pattern yet.`,
      "Choose another Grade Band, Vocabulary level, or word-building pattern."
    );

    return;
  }

  panels.use.hidden = false;

  workspaceTitle.textContent =
    "Use It";

  workspaceSubtitle.textContent =
    "Use morphology to choose the word that makes sense in a sentence.";

  activityProgress.hidden = false;
  workspaceActions.hidden = true;

  useItState = {
    items: shuffle(eligibleWords).slice(
      0,
      Math.min(10, eligibleWords.length)
    ),
    index: 0,
    score: 0,
    answered: false
  };

  window.FirstVoloActivityProgress?.startSession({
    activity: "use",
    studyMode,
    gradeBand,
    vocabLevel,
    totalItems: useItState.items.length
  });

  renderUseItQuestion();
}


/* ========================================
   RENDER QUESTION
   ======================================== */

function renderUseItQuestion() {
  useItState.answered = false;

  workspaceActions.hidden = true;

  const item =
    useItState.items[
      useItState.index
    ];

  const eligibleWords =
    getUseItEligibleWords();

  const choices =
    makeUseItChoices(item);

  const sentence =
    useItSentenceBank[item.word];

  activityProgress.textContent =
    `Choose It · ${useItState.index + 1} of ${useItState.items.length}`;

  const usePrompt =
    document.getElementById(
      "usePrompt"
    );

  const useChoices =
    document.getElementById(
      "useChoices"
    );

  const useFeedback =
    document.getElementById(
      "useFeedback"
    );

  usePrompt.innerHTML = `
    <div class="use-stage-label">
      Choose It
    </div>

    <p class="use-directions">
      Choose the word that best completes the sentence.
    </p>

    <div class="use-sentence">
      ${escapeHTML(sentence)}
    </div>
  `;

  useChoices.innerHTML = "";

  useFeedback.hidden = true;
  useFeedback.innerHTML = "";

  choices.forEach((word) => {
    const button =
      document.createElement(
        "button"
      );

    button.type = "button";
    button.className =
      "answer-button use-choice";

    button.textContent = word;

    button.addEventListener(
      "click",
      () => {
        checkUseItChoice(
          button,
          word,
          item
        );
      }
    );

    useChoices.append(button);
  });
}


/* ========================================
   CHECK ANSWER
   ======================================== */

function checkUseItChoice(
  selectedButton,
  selectedWord,
  item
) {
  if (useItState.answered) {
    return;
  }

  useItState.answered = true;

  const isCorrect =
    selectedWord === item.word;

  if (isCorrect) {
    useItState.score += 1;
  }

  window.FirstVoloActivityProgress?.recordResponse({
    skill: "use",
    correct: isCorrect,
    primaryTarget: null,
    targetType: "word-application",
    supportingTargets: [item.prefix, item.base, item.suffix].filter(Boolean),
    word: item.word,
    response: selectedWord,
    correctAnswer: item.word
  });

  document
    .querySelectorAll(
      "#useChoices .use-choice"
    )
    .forEach((button) => {
      button.disabled = true;

      if (
        button.textContent ===
        item.word
      ) {
        button.classList.add(
          "correct"
        );
      }
    });

  if (!isCorrect) {
    selectedButton.classList.add(
      "incorrect"
    );
  }

  renderUseItFeedback(
    item,
    isCorrect
  );

  workspaceActions.hidden = false;

  const isLast =
    useItState.index ===
    useItState.items.length - 1;

  nextQuestionButton.textContent =
    isLast
      ? `Start Again · ${useItState.score}/${useItState.items.length}`
      : "Next";
}


/* ========================================
   FEEDBACK
   ======================================== */

function renderUseItFeedback(
  item,
  isCorrect
) {
  const feedback =
    document.getElementById(
      "useFeedback"
    );

  feedback.hidden = false;

  feedback.className =
    `feedback-panel ${
      isCorrect
        ? "correct-feedback"
        : "incorrect-feedback"
    }`;

  feedback.innerHTML = `
    <div class="use-feedback-content">

      <h4 class="feedback-heading">
        ${
          isCorrect
            ? "Correct!"
            : "Not quite."
        }
      </h4>

      <p>
        <strong>
          ${escapeHTML(item.word)}
        </strong>
        fits the sentence.
      </p>

      <div class="feedback-label">
        Word parts
      </div>

      <div class="feedback-value">
        ${escapeHTML(
          getUseItPartsText(item)
        )}
      </div>

      <div class="feedback-label">
        Literal meaning
      </div>

      <div class="feedback-value">
        ${escapeHTML(
          item.literal || ""
        )}
      </div>

      <div class="feedback-label">
        Whole-word meaning
      </div>

      <div class="feedback-value">
        ${escapeHTML(
          item.definition
        )}
      </div>

      <button
        class="audio-button"
        type="button"
      >
        🔊 Hear it
      </button>

    </div>
  `;

  setAudioButton(
    feedback,
    `${item.word}. ` +
    `${getUseItPartsText(item)}. ` +
    `${item.word} means ${item.definition}.`
  );
}


/* ========================================
   NEXT QUESTION
   ======================================== */

function goToNextUseItQuestion() {
  const isLast =
    useItState.index ===
    useItState.items.length - 1;

  if (isLast) {
    renderUseItActivity();
    return;
  }

  useItState.index += 1;

  renderUseItQuestion();
}

