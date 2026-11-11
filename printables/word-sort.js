"use strict";

const samples = {
  "1": {
    words: "rewrite, replay, writing, playing",
    timing: "Use after teaching re- and -ing from Route 1 Set 1 · Core Word Parts.",
    explanation: "Group rewrite and replay by re- (“again”), and writing and playing by -ing. Then pair rewrite with writing by the base write, and replay with playing by the base play."
  },
  "2": {
    words: "thermal, thermostat, geothermal, geographic",
    timing: "Use after teaching therm and geo from Route 2 Roots 2.",
    explanation: "Group geothermal with thermal and thermostat by therm (“heat”). Then move geothermal to a group with geographic because they share geo (“earth”). Ask learners what both roots tell them about geothermal energy."
  },
  "3": {
    words: "project, projection, extract, extraction",
    timing: "Use after teaching ject and tract from Route 3 Roots 1. Review -ion from Route 1 Set 4 · Grade 3 Bridge first if needed.",
    explanation: "Use project and extract as verbs in sentences. Then sort the two verbs separately from the nouns projection and extraction, which share -ion. Sort again by ject (“throw”) and tract (“pull or draw”). Ask how each root helps explain a word in its sentence."
  }
};

const route = document.getElementById("sortRoute");
const wordBank = document.getElementById("wordBank");
const example = document.getElementById("sortExample");
const timing = document.getElementById("sortTiming");

route.addEventListener("change", () => {
  const sample = samples[route.value];
  if (sample) {
    wordBank.value = sample.words;
    timing.textContent = sample.timing;
    example.textContent = sample.explanation;
  } else {
    timing.textContent = "Use after learners have studied the word parts they will sort.";
    example.textContent = "Ask which connection the learner noticed first, what changed on the second sort, and what the word parts contribute in a sentence.";
  }
});

wordBank.addEventListener("input", () => {
  if (route.value !== "custom") {
    route.value = "custom";
    route.dispatchEvent(new Event("change"));
  }
});

document.getElementById("printSort").addEventListener("click", () => window.print());
