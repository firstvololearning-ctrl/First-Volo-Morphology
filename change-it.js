"use strict";

const changeItQuestions = [
  {
    family: "dark · darker · darkest · darkness",
    sentence: "After sunset, the hikers waited for their eyes to adjust to the ___.",
    choices: ["dark", "darker", "darkest", "darkness"],
    answer: "darkness",
    clue: "Choose the noun that names a condition.",
    suffix: "-ness",
    explanation: "Adding -ness to dark names the state of having little or no light.",
    practiceBand: "2-3",
    vocabLevel: "familiar"
  },
  {
    family: "enjoy · enjoyed · enjoying · enjoyment",
    sentence: "The children got a lot of ___ from making up their own game.",
    choices: ["enjoy", "enjoyed", "enjoying", "enjoyment"],
    answer: "enjoyment",
    clue: "Choose the noun that names what the children got from the game.",
    suffix: "-ment",
    explanation: "Enjoyment names the pleasure of doing something. Adding -ment forms a noun.",
    practiceBand: "2-3",
    vocabLevel: "familiar"
  },
  {
    family: "geography · geographic · geographically · geographer",
    sentence: "The atlas shows the ___ features of the island, including its mountains and bays.",
    choices: ["geography", "geographic", "geographically", "geographer"],
    answer: "geographic",
    clue: "Choose an adjective that describes the features.",
    suffix: "-ic",
    explanation: "Geographic describes things related to the land or places. The ending -ic helps form an adjective.",
    practiceBand: "4-5",
    vocabLevel: "academic"
  },
  {
    family: "active · actively · activity · activate",
    sentence: "The students chose a quiet ___ to do while they waited for the bus.",
    choices: ["active", "actively", "activity", "activate"],
    answer: "activity",
    clue: "Choose a noun for something the students can do.",
    suffix: "-ity",
    explanation: "Activity names something someone does. The ending -ity helps form a noun.",
    practiceBand: "4-5",
    vocabLevel: "familiar"
  },
  {
    family: "simple · simpler · simplest · simplify",
    sentence: "We can ___ the directions by cutting out two steps.",
    choices: ["simple", "simpler", "simplest", "simplify"],
    answer: "simplify",
    clue: "Choose the verb that says what we can do to the directions.",
    suffix: "-ify",
    explanation: "Adding -ify to a form of simple makes a verb meaning to make something simpler.",
    practiceBand: "4-5",
    vocabLevel: "academic"
  },
  {
    family: "resist · resistance · resistant · resisted",
    sentence: "The material is ___ to heat, so it works well near the oven.",
    choices: ["resist", "resistance", "resistant", "resisted"],
    answer: "resistant",
    clue: "Choose the adjective that describes a quality of the material.",
    suffix: "-ant",
    explanation: "Here, -ant makes an adjective. Resistant describes something that can withstand heat or another force.",
    practiceBand: "6-8",
    vocabLevel: "academic",
    suffixId: "ant-ent-adjective"
  },
  {
    family: "claim · claiming · claimant · claimed",
    sentence: "The ___ sent photos to support her request for payment.",
    choices: ["claim", "claiming", "claimant", "claimed"],
    answer: "claimant",
    clue: "Choose the noun that names the person making the request.",
    suffix: "-ant",
    explanation: "Here, -ant helps form a noun for the person who makes a claim.",
    practiceBand: "6-8",
    vocabLevel: "academic",
    suffixId: "ant-ent-agent"
  },
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
  },
  {
    family: "soft · softly · softer · softness",
    sentence: "We spoke ___ so the baby could sleep.",
    choices: ["soft", "softly", "softer", "softness"],
    answer: "softly",
    clue: "Look for a word that tells how we spoke.",
    suffix: "-ly",
    explanation: "Softly tells how we spoke. Adding -ly to soft gives us an adverb.",
    practiceBand: "2-3",
    vocabLevel: "familiar"
  },
  {
    family: "paint · painted · painting · painter",
    sentence: "Yesterday, we ___ a blue stripe on the wall.",
    choices: ["paint", "painted", "painting", "painter"],
    answer: "painted",
    clue: "Yesterday tells when the action happened.",
    suffix: "-ed",
    explanation: "Painted tells what we did yesterday. Here, -ed marks past tense.",
    practiceBand: "2-3",
    vocabLevel: "familiar"
  },
  {
    family: "walk · walked · walking · walker",
    sentence: "We are ___ to the park right now.",
    choices: ["walk", "walked", "walking", "walker"],
    answer: "walking",
    clue: "Look for the verb form that goes with are to show what is happening now.",
    suffix: "-ing",
    explanation: "Walking goes with are to tell what we are doing now. The verb form ends in -ing.",
    practiceBand: "2-3",
    vocabLevel: "familiar"
  },
  {
    family: "dog · dogs · dogged · dogging",
    sentence: "Two muddy ___ ran into the house.",
    choices: ["dog", "dogs", "dogged", "dogging"],
    answer: "dogs",
    clue: "Two tells us how many.",
    suffix: "-s",
    explanation: "Dogs names more than one dog. Here, -s makes the noun plural.",
    practiceBand: "2-3",
    vocabLevel: "familiar"
  },
  {
    family: "dish · dishes · dished · dishing",
    sentence: "We washed all six ___ after dinner.",
    choices: ["dish", "dishes", "dished", "dishing"],
    answer: "dishes",
    clue: "Six tells us how many.",
    suffix: "-es",
    explanation: "Dishes names more than one dish. Add -es to make dish plural.",
    practiceBand: "2-3",
    vocabLevel: "familiar"
  },
  {
    family: "strong · stronger · strongest · strength",
    sentence: "This rope is ___ than the thin string.",
    choices: ["strong", "stronger", "strongest", "strength"],
    answer: "stronger",
    clue: "Than signals a comparison between the rope and the string.",
    suffix: "-er",
    explanation: "Stronger means having more strength. Here, -er helps compare two things.",
    practiceBand: "2-3",
    vocabLevel: "familiar"
  },
  {
    family: "young · younger · youngest · youth",
    sentence: "Of the three puppies, the ___ was born last.",
    choices: ["young", "younger", "youngest", "youth"],
    answer: "youngest",
    clue: "Of the three signals that we are comparing one puppy with the whole group.",
    suffix: "-est",
    explanation: "Youngest means younger than all the others in the group. The ending -est marks that comparison.",
    practiceBand: "2-3",
    vocabLevel: "familiar"
  },
  {
    family: "create · created · creation · creative",
    sentence: "The puppet was Nora’s latest ___.",
    choices: ["create", "created", "creation", "creative"],
    answer: "creation",
    clue: "Look for a noun that names something Nora made.",
    suffix: "-ion",
    explanation: "Creation names the result of creating something. The ending -ion helps form that noun.",
    practiceBand: "4-5",
    vocabLevel: "familiar"
  },
  {
    family: "care · careful · carefully · caring",
    sentence: "Jules carried the full bowl ___ to keep the soup from spilling.",
    choices: ["care", "careful", "carefully", "caring"],
    answer: "carefully",
    clue: "Look for an adverb that tells how Jules carried the bowl.",
    suffix: "-ly",
    explanation: "Carefully tells how Jules carried the bowl. Adding -ly to careful forms an adverb.",
    practiceBand: "4-5",
    vocabLevel: "familiar"
  },
  {
    family: "treat · treated · treatment · treatable",
    sentence: "The doctor recommended a different ___ for the rash.",
    choices: ["treat", "treated", "treatment", "treatable"],
    answer: "treatment",
    clue: "Look for a noun that names what the doctor recommended.",
    suffix: "-ment",
    explanation: "Treatment names a way of treating the rash. Adding -ment to treat forms a noun.",
    practiceBand: "4-5",
    vocabLevel: "familiar"
  },
  {
    family: "fame · famous · famously · infamous",
    sentence: "The singer became ___ for her beautiful voice and was recognized wherever she went.",
    choices: ["fame", "famous", "famously", "infamous"],
    answer: "famous",
    clue: "Look for an adjective that describes the singer.",
    suffix: "-ous",
    explanation: "Famous means known by many people. The ending -ous helps form the adjective from fame.",
    practiceBand: "4-5",
    vocabLevel: "familiar"
  },
  {
    family: "region · regional · regionally · regions",
    sentence: "The team traveled to a ___ tournament with schools from nearby towns.",
    choices: ["region", "regional", "regionally", "regions"],
    answer: "regional",
    clue: "Look for an adjective that describes the tournament.",
    suffix: "-al",
    explanation: "Regional means related to a region. Adding -al to region forms an adjective.",
    practiceBand: "4-5",
    vocabLevel: "familiar"
  },
  {
    family: "piano · pianist · pianists · pianos",
    sentence: "One skilled ___ played a solo on the grand piano.",
    choices: ["piano", "pianist", "pianists", "pianos"],
    answer: "pianist",
    clue: "Look for a singular noun naming the person who played.",
    suffix: "-ist",
    explanation: "Pianist names a person who plays the piano. The ending -ist can form a noun naming a person.",
    practiceBand: "4-5",
    vocabLevel: "familiar"
  },
  {
    family: "project · projects · projected · projection",
    sentence: "A population ___ of 120,000 residents guided the city’s plans for new schools.",
    choices: ["project", "projects", "projected", "projection"],
    answer: "projection",
    clue: "Look for a singular noun that names an estimate.",
    suffix: "-ion",
    explanation: "Projection names the result of estimating what might happen. Adding -ion to project forms a noun.",
    practiceBand: "6-8",
    vocabLevel: "academic"
  },
  {
    family: "respond · response · responsive · responsively",
    sentence: "The touch screen became more ___ after the software update.",
    choices: ["respond", "response", "responsive", "responsively"],
    answer: "responsive",
    clue: "Look for an adjective describing how readily the screen reacts.",
    suffix: "-ive",
    explanation: "Responsive describes something that responds readily. The ending -ive can help form an adjective.",
    practiceBand: "6-8",
    vocabLevel: "academic"
  },
  {
    family: "reverse · reversed · reversible · reversibly",
    sentence: "The change is ___, so the team can restore the original settings.",
    choices: ["reverse", "reversed", "reversible", "reversibly"],
    answer: "reversible",
    clue: "Look for an adjective that tells what can be done to the change.",
    suffix: "-ible",
    explanation: "Reversible means able to be reversed. The ending -ible can help form an adjective with that meaning.",
    practiceBand: "6-8",
    vocabLevel: "academic"
  },
  {
    family: "valid · validate · validity · validly",
    sentence: "The researchers questioned the ___ of the test because it measured speed instead of accuracy.",
    choices: ["valid", "validate", "validity", "validly"],
    answer: "validity",
    clue: "Look for a noun naming a quality of the test.",
    suffix: "-ity",
    explanation: "Validity names the quality of being valid. The ending -ity can form a noun naming a quality.",
    practiceBand: "6-8",
    vocabLevel: "academic"
  },
  {
    family: "depend · depended · dependence · depending",
    sentence: "The town reduced its ___ on imported fuel by installing solar panels.",
    choices: ["depend", "depended", "dependence", "depending"],
    answer: "dependence",
    clue: "Look for a noun that names the state of relying on something.",
    suffix: "-ence",
    explanation: "Dependence names the state of depending on something. The ending -ence helps form that noun.",
    practiceBand: "6-8",
    vocabLevel: "academic"
  },
  {
    family: "guide · guided · guidance · guiding",
    sentence: "The new safety manual offers practical ___ on handling chemicals.",
    choices: ["guide", "guided", "guidance", "guiding"],
    answer: "guidance",
    clue: "Look for a noun naming the help the manual provides.",
    suffix: "-ance",
    explanation: "Guidance names help that guides someone. The ending -ance can help form a noun.",
    practiceBand: "6-8",
    vocabLevel: "academic"
  },
  {
    family: "interfere · interfered · interference · interfering",
    sentence: "Radio ___ made the signal harder to hear.",
    choices: ["interfere", "interfered", "interference", "interfering"],
    answer: "interference",
    clue: "Look for a noun naming what disrupted the signal.",
    suffix: "-ence",
    explanation: "Interference names the effect of something interfering. The ending -ence can help form a noun.",
    practiceBand: "6-8",
    vocabLevel: "academic"
  },
  {
    family: "journal · journals · journalist · journalism",
    sentence: "The ___ interviewed witnesses and wrote an article about the event.",
    choices: ["journal", "journals", "journalist", "journalism"],
    answer: "journalist",
    clue: "Look for a singular noun that names the person doing the reporting.",
    suffix: "-ist",
    explanation: "Journalist names a person who reports news. The ending -ist can form a noun naming a person.",
    practiceBand: "6-8",
    vocabLevel: "academic"
  },
  {
    family: "final · finally · finalize · finalized",
    sentence: "The committee will ___ the schedule after reviewing everyone’s availability.",
    choices: ["final", "finally", "finalize", "finalized"],
    answer: "finalize",
    clue: "After will, look for the verb that names the action.",
    suffix: "-ize",
    explanation: "Finalize means to make something final. Adding -ize to final forms a verb.",
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
      (vocabLevel === "standard" ? ["familiar", "academic"].includes(item.vocabLevel) : item.vocabLevel === vocabLevel);

    return matchesGrade && matchesVocabulary;
  });
}

function renderChangeItActivity() {
  const eligible = getChangeItEligibleQuestions();

  if (eligible.length < 1) {
    showStartMessage(
      "No Change It questions match this selection yet.",
      "Choose Roots + Suffixes or Prefixes + Roots + Suffixes, or adjust the Migration Route or Vocabulary filter."
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
      item.suffixId || window.FirstVoloMorphemeProgress
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
