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
  rewrite: "The ending is unclear, so I’ll ___ the last paragraph.",
  untie: "Please ___ the knot so we can open the bag.",
  disconnect: "Before moving the lamp, ___ its cord from the wall.",
  undercook: "If you take the bread out too early, you might ___ it.",
  overuse: "A single word can sound repetitive if you ___ it in a story.",
  nonfiction: "Our class reads ___ to learn facts about real animals.",
  darkness: "When the flashlight went out, the cave fell into ___.",
  enjoyment: "Their laughter showed how much ___ they got from the game.",
  bendable: "The ___ wire curved around the jar without breaking.",
  playful: "The ___ kitten pounced on a ball of yarn.",
  cloudless: "The sky was ___, with nothing to hide the sun.",
  antifreeze: "The mechanic added ___ to keep the coolant from freezing in winter.",
  semifinal: "We won the ___ and will play in the final tomorrow.",
  superhuman: "Lifting a car with one hand would take ___ strength.",
  thermal: "The ___ camera shows where heat is escaping from the building.",
  graphic: "The designer made a ___ display that uses pictures to show each step.",
  historic: "The town protected the ___ building where its first council met.",
  transfer: "Use a funnel to ___ the water from the jug into the bottle.",
  submit: "Please ___ your assignment for the teacher to review by Friday.",
  propel: "The paddles ___ the boat forward.",
  deposit: "The machine lets you ___ coins into your savings account.",
  dermal: "The researcher tested ___ patches that stick to the skin.",
  claimant: "The ___ asked for payment for the damage to her bike.",
  resistant: "The waterproof cover is ___ to rain.",
  performance: "The judges scored the dancer’s ___ after she left the stage.",
  scripted:
    "The actors followed a ___ scene so each line and action happened as planned.",

  convert:
    "The device can ___ sunlight into electrical energy.",


  construct:
    "The students will ___ a model bridge from wooden sticks.",

  interrupt:
    "Please do not ___ the speaker while she is explaining the experiment.",
  import:
    "The company will ___ coffee from another country.",
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
    "Thousands of people attended the science ___ this weekend.",

portable:
"The small speaker is ___, so we can easily carry it from room to room.",

readable:
"Her handwriting was neat and ___, so everyone could understand the note.",

visible:
"The bright moon was clearly ___ through the clouds.",

teacher:
"Our ___ explained the new lesson and answered our questions.",

taller:
"The sunflower grew ___ than the other plants in the garden.",

fastest:
"Of all the runners, Maya was the ___ to reach the finish line.",

hopeless:
"At first the problem seemed ___, but the team eventually found a solution.",

quickly:
"The students worked ___ so they could finish before the bell rang.",

movement:
"The sudden ___ of the branches showed that something was in the tree.",

dangerous:
"The broken stairs were ___, so the area was closed until they could be repaired.",

musical:
"The play included several ___ performances with singing and instruments.",

poetic:
"The author's ___ description of the sunset sounded almost like a poem.",

artist:
"The ___ used paint and charcoal to create the portrait.",

modernize:
"The city plans to ___ the old train station with updated equipment.",

classify:
"Scientists use shared traits to ___ living things into groups.",

performance:
"The audience applauded loudly after the band's ___ ended.",

existence:
"Fossils provide evidence of the ___ of animals that lived long ago.",

jumped:
"The frog ___ from the rock into the pond.",

jumping:
"The children were ___ over puddles after the rain.",

books:
"She returned three ___ to the library.",

boxes:
"We packed the supplies into two large ___ before moving them.",

  chronology:
    "The historian arranged the events in ___ so readers could follow when each one happened.",

  sequence:
    "Put the steps in the correct ___ so the procedure is easy to follow.",

  dependence:
    "The young plant's ___ on sunlight and water is necessary for its growth.",

  persistence:
    "Her ___ helped her keep working even when the problem was difficult."
};


const additionalUseItWords = [
  {
    study: "prefix-root",
    word: "microscope",
    rootId: "micro",
    root: "micro",
    rootMeaning: "small",
    baseId: "scop",
    base: "scope",
    baseMeaning: "look at",
    definition: "a tool for looking at things too small to see clearly",
    sentence: "The class used a ___ to see tiny cells in a drop of pond water."
  },
  {
    study: "prefix-root",
    word: "biography",
    rootId: "bio",
    root: "bio",
    rootMeaning: "life",
    baseId: "graph",
    base: "graph",
    baseMeaning: "write",
    definition: "a written account of someone’s life",
    sentence: "I read a ___ to learn what the inventor did before she became famous."
  },
  {
    study: "prefix-root",
    word: "suspend",
    rootId: "pend",
    root: "pend",
    rootMeaning: "hang",
    definition: "to hang something from above",
    sentence: "The workers will ___ the sign from two hooks in the ceiling."
  },
  {
    study: "root-suffix",
    word: "vocalist",
    rootId: "voc",
    root: "voc",
    rootMeaning: "voice",
    suffixId: "ist",
    suffix: "-ist",
    suffixMeaning: "a person who does something",
    definition: "a singer",
    sentence: "The ___ stepped to the microphone and sang the first verse."
  },
  {
    "study": "root-suffix",
    "word": "playful",
    "baseId": "play",
    "base": "play",
    "baseMeaning": "have fun",
    "suffixId": "ful",
    "suffix": "-ful",
    "suffixMeaning": "full of",
    "definition": "ready to have fun",
    "sentence": "The ___ puppy kept dropping its ball at our feet."
  },
  {
    "study": "root-suffix",
    "word": "cloudless",
    "baseId": "cloud",
    "base": "cloud",
    "baseMeaning": "a mass of tiny water drops in the sky",
    "suffixId": "less",
    "suffix": "-less",
    "suffixMeaning": "without",
    "definition": "without clouds",
    "sentence": "The sky was ___, with nothing to hide the sun."
  },
  {
    "study": "root-suffix",
    "word": "writer",
    "baseId": "write",
    "base": "write",
    "baseMeaning": "put words into written form",
    "suffixId": "er-agent",
    "suffix": "-er",
    "suffixMeaning": "a person who does something",
    "definition": "a person who writes",
    "sentence": "The ___ revised the last chapter of her novel."
  },
  {
    "study": "root-suffix",
    "word": "painted",
    "baseId": "paint",
    "base": "paint",
    "baseMeaning": "put color on a surface",
    "suffixId": "ed",
    "suffix": "-ed",
    "suffixMeaning": "marks an action that already happened",
    "definition": "put paint on something in the past",
    "sentence": "Yesterday we ___ the fence blue."
  },
  {
    "study": "prefix-root",
    "word": "interact",
    "prefixId": "inter",
    "prefix": "inter-",
    "prefixMeaning": "between; with one another",
    "baseId": "act",
    "base": "act",
    "baseMeaning": "do; act",
    "definition": "to act with or respond to one another",
    "sentence": "At the workshop, students will ___ with a visiting author by asking questions and sharing ideas."
  },
  {
    "study": "prefix-root",
    "word": "predict",
    "prefixId": "pre",
    "prefix": "pre-",
    "prefixMeaning": "before",
    "baseId": "dict",
    "base": "dict",
    "baseMeaning": "say",
    "definition": "to say what you think will happen before it happens",
    "sentence": "Meteorologists use weather data to ___ when a storm will arrive."
  },
  {
    "study": "prefix-root",
    "word": "transform",
    "prefixId": "trans",
    "prefix": "trans-",
    "prefixMeaning": "across; into a different form",
    "baseId": "form",
    "base": "form",
    "baseMeaning": "shape",
    "definition": "to change into a different form",
    "sentence": "The artist used scissors and glue to ___ the flat paper into a three-dimensional model."
  },
  {
    "study": "prefix-root-suffix",
    "word": "prediction",
    "prefixId": "pre",
    "prefix": "pre-",
    "prefixMeaning": "before",
    "baseId": "dict",
    "base": "dict",
    "baseMeaning": "say",
    "suffixId": "ion",
    "suffix": "-ion",
    "suffixMeaning": "an action, process, or result",
    "definition": "a statement about what someone thinks will happen",
    "sentence": "Her ___ that the storm would end by noon turned out to be right."
  },
  {
    "study": "prefix-root-suffix",
    "word": "interaction",
    "prefixId": "inter",
    "prefix": "inter-",
    "prefixMeaning": "between; with one another",
    "baseId": "act",
    "base": "act",
    "baseMeaning": "do; act",
    "suffixId": "ion",
    "suffix": "-ion",
    "suffixMeaning": "an action, process, or result",
    "definition": "an exchange in which people or things respond to one another",
    "sentence": "The researchers observed the ___ between the bees and the flowers as the bees gathered nectar and moved pollen."
  },
  {
    "study": "prefix-root-suffix",
    "word": "destructive",
    "prefixId": "de",
    "prefix": "de-",
    "prefixMeaning": "down; away",
    "baseId": "struct",
    "base": "struct",
    "baseMeaning": "build",
    "suffixId": "ive",
    "suffix": "-ive",
    "suffixMeaning": "having a quality or tendency",
    "definition": "likely to damage or destroy things",
    "sentence": "The ___ waves broke the wooden pier into pieces."
  },
  {
    "study": "prefix-root",
    "word": "transfer",
    "prefixId": "trans",
    "prefix": "trans-",
    "prefixMeaning": "across; from one place to another",
    "baseId": "fer",
    "base": "fer",
    "baseMeaning": "carry",
    "definition": "to move something from one place to another",
    "sentence": "Use the funnel to ___ water from the bowl into the bottle."
  },
  {
    "study": "prefix-root",
    "word": "submit",
    "prefixId": "sub",
    "prefix": "sub-",
    "prefixMeaning": "under",
    "baseId": "mit",
    "base": "mit",
    "baseMeaning": "send",
    "definition": "to send something in for review",
    "sentence": "Please ___ your application by Friday so the committee can review it."
  },
  {
    "study": "root-suffix",
    "word": "resistant",
    "baseId": "resist",
    "base": "resist",
    "baseMeaning": "oppose or withstand",
    "suffixId": "ant-ent-adjective",
    "suffix": "-ant",
    "suffixMeaning": "having a quality or tendency",
    "definition": "able to withstand the effects of something",
    "sentence": "The fabric is ___ to stains, so spills usually wipe away."
  },
  {
    "study": "prefix-root-suffix",
    "word": "extraction",
    "prefixId": "e-ex",
    "prefix": "ex-",
    "prefixMeaning": "out; from",
    "baseId": "tract",
    "base": "tract",
    "baseMeaning": "pull; draw",
    "suffixId": "ion",
    "suffix": "-ion",
    "suffixMeaning": "an action, process, or result",
    "definition": "the process of taking something out",
    "sentence": "The dentist scheduled the ___ of a damaged tooth."
  },
  {
    "study": "prefix-root-suffix",
    "word": "transportation",
    "prefixId": "trans",
    "prefix": "trans-",
    "prefixMeaning": "across",
    "baseId": "port",
    "base": "port",
    "baseMeaning": "carry",
    "suffixId": "ion",
    "suffix": "-ation",
    "suffixMeaning": "an action, process, or result",
    "definition": "the movement of people or goods from place to place",
    "sentence": "Road closures disrupted the ___ of food and supplies between the two towns."
  }
];

function getUseItWordsForStudy() {
  const byWord = new Map(getActiveBuildWords().map(item => [item.word, item]));
  for (const item of additionalUseItWords) {
    if (item.study === studyMode) byWord.set(item.word, item);
  }
  return [...byWord.values()];
}

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
  const activeWords = getUseItWordsForStudy();

  const inventory =
    window.FIRST_VOLO_WORD_INVENTORY || [];

  return activeWords.filter((item) => {
    if (
      isReservedTransferWord(
        item.word
      )
    ) {
      return false;
    }

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
      isWordEligibleForSelectedVocabulary(item.word);

    const hasSentence = item.sentence ||
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


const useItAuthoredDistractors = {
  rewrite: ["untie", "overuse", "undercook"],
  untie: ["rewrite", "overuse", "undercook"],
  disconnect: ["untie", "rewrite", "undercook"],
  undercook: ["rewrite", "untie", "disconnect"],
  overuse: ["undercook", "untie", "disconnect"],
  nonfiction: ["darkness", "enjoyment", "overuse"],
  darkness: ["enjoyment", "nonfiction", "overuse"],
  enjoyment: ["darkness", "nonfiction", "overuse"],
  bendable: ["playful", "cloudless", "darkness"],
  playful: ["cloudless", "bendable", "darkness"],
  cloudless: ["playful", "bendable", "darkness"],
  antifreeze: ["graphic", "thermal", "telegraph"],
  semifinal: ["antifreeze", "telegraph", "biography"],
  superhuman: ["thermal", "graphic", "scientific"],
  thermal: ["graphic", "semifinal", "antifreeze"],
  graphic: ["antifreeze", "telegraph", "semifinal"],
  historic: ["antifreeze", "semifinal", "telegraph"],
  transfer: ["submit", "propel", "suspend"],
  submit: ["transfer", "propel", "suspend"],
  propel: ["submit", "suspend", "deposit"],
  suspend: ["submit", "deposit", "propel"],
  deposit: ["submit", "propel", "suspend"],
  dermal: ["claimant", "vocalist", "dependence"],
  claimant: ["performance", "dependence", "dermal"],
  resistant: ["claimant", "dermal", "dependence"],
  performance: ["claimant", "dependence", "dermal"],
  dependence: ["claimant", "performance", "dermal"],
  microscope: ["telegraph", "biography", "antifreeze"],
  biography: ["microscope", "telegraph", "antifreeze"],
  vocalist: ["claimant", "dependence", "dermal"],
};

function makeUseItChoices(
  correctItem
) {
  const authored = useItAuthoredDistractors[correctItem.word];
  if (authored?.every(word =>
    !isReservedTransferWord(word) && isWordEligibleForSelectedVocabulary(word)
  )) {
    return shuffle([correctItem.word, ...authored]);
  }

  const inventory =
    window.FIRST_VOLO_WORD_INVENTORY || [];

  const gradeRanks = {
    "2-3": 1,
    "4-5": 2,
    "6-8": 3
  };

  const distractorPool =
    getUseItWordsForStudy().filter((item) => {
      if (item.word === correctItem.word) {
        return false;
      }

      if (
        isReservedTransferWord(
          item.word
        )
      ) {
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
          isWordEligibleForSelectedVocabulary(item.word)
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
        getUseItWordsForStudy().filter(
          (item) =>
            item.word !== correctItem.word &&
            !isReservedTransferWord(item.word) &&
            isWordEligibleForSelectedVocabulary(item.word) &&
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
      `Not enough Use It words match the selected Migration Route and Vocabulary level for this pattern yet.`,
      "Choose another Migration Route, Vocabulary level, or word-building pattern."
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
    item.sentence || useItSentenceBank[item.word];

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
    supportingTargetIds:
      window.FirstVoloMorphemeProgress
        ?.idsFromBuildItem(item) || [],
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

      ${item.literal ? `<div class="feedback-label">
        Literal meaning
      </div>

      <div class="feedback-value">
        ${escapeHTML(
          item.literal
        )}
      </div>

      ` : ""}

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
    `${item.word} means ${item.definition}.`,
    [
      { id: item.prefixId, token: item.prefix },
      { id: item.rootId, token: item.root },
      { id: item.baseId, token: item.base },
      { id: item.suffixId, token: item.suffix }
    ]
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
