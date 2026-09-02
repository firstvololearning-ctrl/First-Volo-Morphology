"use strict";

(function () {
  const GRADES = {
    foundation: {
      label: "Grades 2–3 · Foundation",
      expectation: "Work across all five morphology objectives with familiar, transparent prefixes and suffixes first, then grow toward more derivational and less transparent forms. Increase the number of meaningful parts, spelling or sound changes, lexical load, independence, and transfer gradually.",
      material: "transparent, familiar words with one or two meaningful parts, growing toward less transparent derivational forms",
      transfer: "supported transfer to new transparent words and short reading or writing contexts"
    },
    expansion: {
      label: "Grades 4–5 · Expansion",
      expectation: "Coordinate prefixes, roots, and suffixes in words with multiple meaningful parts. Expect increasing tolerance for spelling, sound, and form changes, broader vocabulary load, and transfer to academic text.",
      material: "words with multiple affixes and roots, including moderate spelling, sound, or form changes",
      transfer: "increasingly independent transfer to unfamiliar words and curriculum-related text"
    },
    advanced: {
      label: "Grades 6–8 · Advanced",
      expectation: "Analyze complex and less transparent morphological families, including classical roots and derivational patterns. Emphasize flexible reasoning, lexical precision, independence, and generalization across academic disciplines.",
      material: "complex, less transparent, and academically useful words with several meaningful parts",
      transfer: "independent generalization across novel words, connected text, writing, and content areas"
    }
  };

  const FOCUSES = {
    know: {
      label: "Know the Parts / Understand word parts",
      action: "explain the meaning and role of taught word parts in words",
      activities: ["Meaning", "Word Part", "Find", "Word Hunt"],
      monitor: "Accuracy and specificity when identifying a word part, explaining its meaning, and distinguishing it from the base or other meaningful parts."
    },
    analyze: {
      label: "Analyze Words",
      action: "identify meaningful word-part boundaries and explain how the parts work together",
      activities: ["Break It Apart", "Word Part", "Find", "Figure It Out"],
      monitor: "Boundary accuracy, completeness of the analysis, attention to form changes, and whether the learner explains relationships rather than only naming pieces."
    },
    meaning: {
      label: "Figure Out Meaning",
      action: "use meaningful word parts and context to infer and explain the meaning of unfamiliar words",
      activities: ["Figure It Out", "Meaning", "Break It Apart", "Word Hunt"],
      monitor: "Use of both morphology and context, quality of the meaning explanation, revision after feedback, and transfer to unfamiliar words."
    },
    build: {
      label: "Build & Use Words",
      action: "build morphologically related words and use them accurately in speaking or writing",
      activities: ["Build", "Use It", "Change It", "Meaning"],
      monitor: "Selection and combination of meaningful parts, spelling or form changes, grammatical fit, meaning, and accurate use in context."
    },
    apply: {
      label: "Apply Independently",
      action: "independently apply morphological knowledge to analyze, interpret, build, and use words in new contexts",
      activities: ["Word Hunt", "Figure It Out", "Use It", "Change It"],
      monitor: "Independent strategy initiation, flexible application, explanation of reasoning, self-correction, and generalization beyond practiced words."
    }
  };

  const SUPPORTS = {
    program: {
      label: "Program supports available as needed",
      condition: "Given First Volo visual, meaning, and word-part supports available as needed",
      ideas: ["Program word-part references", "Meaning choices after an independent attempt", "Visible word-part boundaries when access is needed"]
    },
    guided: {
      label: "Teacher-guided support as needed",
      condition: "Given an independent attempt followed by the least teacher-guided support needed",
      ideas: ["Prompt the learner to notice meaningful parts", "Ask a focused meaning or boundary question", "Retry the same demand and fade the prompt"]
    },
    independent: {
      label: "Independent",
      condition: "Without morphology-specific prompts or cues",
      ideas: ["Allow adequate processing time", "Use neutral directions", "Record self-initiated strategies and self-corrections"]
    },
    explicit: {
      label: "Explicit teaching / high support",
      condition: "Following explicit teaching with modeling, guided practice, and accessible word-part references",
      ideas: ["Model think-aloud analysis", "Use color or spacing to mark meaningful parts", "Move from guided practice to an immediate independent retry"]
    }
  };

  const state = { grade: "foundation", focus: "know", support: "program" };
  const planResult = document.getElementById("planResult");
  const supportSelect = document.getElementById("supportSelect");
  const criterionSelect = document.getElementById("criterionSelect");
  const acrossSelect = document.getElementById("acrossSelect");
  const iepPreview = document.getElementById("iepPreview");
  const copyIepButton = document.getElementById("copyIepButton");

  function list(items) {
    return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  }

  function objectiveWording() {
    const grade = GRADES[state.grade];
    const focus = FOCUSES[state.focus];
    return `The learner will ${focus.action} using ${grade.material}.`;
  }

  function renderPlan() {
    const grade = GRADES[state.grade];
    const focus = FOCUSES[state.focus];
    const support = SUPPORTS[state.support];
    planResult.innerHTML = `
      <article class="result-card result-card-wide"><h3>Suggested objective wording</h3><p>${objectiveWording()}</p></article>
      <article class="result-card"><h3>Possible condition</h3><p>${support.condition}.</p></article>
      <article class="result-card"><h3>Developmental expectation</h3><p><strong>${grade.label}:</strong> ${grade.expectation}</p></article>
      <article class="result-card"><h3>Recommended Morpho activities</h3>${list(focus.activities)}</article>
      <article class="result-card"><h3>Possible supports</h3>${list(support.ideas)}</article>
      <article class="result-card result-card-wide"><h3>What to monitor</h3><p>${focus.monitor} Also monitor ${grade.transfer}.</p></article>
    `;
    renderIep();
  }

  function planText() {
    const grade = GRADES[state.grade];
    const focus = FOCUSES[state.focus];
    const support = SUPPORTS[state.support];
    return [
      "FIRST VOLO MORPHOLOGY — SUGGESTED PLAN",
      `Grade band: ${grade.label}`,
      `Focus: ${focus.label}`,
      `Suggested objective: ${objectiveWording()}`,
      `Possible condition: ${support.condition}.`,
      `Developmental expectation: ${grade.expectation}`,
      `Recommended Morpho activities: ${focus.activities.join(", ")}`,
      `Possible supports: ${support.ideas.join("; ")}`,
      `What to monitor: ${focus.monitor} Also monitor ${grade.transfer}.`
    ].join("\n\n");
  }

  function iepText() {
    if (!criterionSelect.value) return "";
    return `${SUPPORTS[state.support].condition}, the learner will ${FOCUSES[state.focus].action} using ${GRADES[state.grade].material}, with ${criterionSelect.value}, measured across ${acrossSelect.value}.`;
  }

  function renderIep() {
    const text = iepText();
    copyIepButton.disabled = !text;
    iepPreview.setAttribute("aria-disabled", String(!text));
    iepPreview.textContent = text || "Choose a criterion to generate optional IEP-style wording.";
  }

  function selectButton(container, button, key) {
    container.querySelectorAll("button").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    state[key] = button.dataset[key];
    renderPlan();
  }

  async function copyText(text, statusElement) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        const copied = document.execCommand("copy");
        area.remove();
        if (!copied) throw new Error("Copy command was unavailable.");
      }
      statusElement.textContent = "Copied to clipboard.";
    } catch (error) {
      statusElement.textContent = "Copy is unavailable in this browser. Select the wording above and copy it manually.";
    }
  }

  document.getElementById("gradeChoices").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-grade]");
    if (button) selectButton(event.currentTarget, button, "grade");
  });

  document.getElementById("focusChoices").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-focus]");
    if (button) selectButton(event.currentTarget, button, "focus");
  });

  supportSelect.addEventListener("change", () => {
    state.support = supportSelect.value;
    renderPlan();
  });
  criterionSelect.addEventListener("change", renderIep);
  acrossSelect.addEventListener("change", renderIep);
  document.getElementById("copyPlanButton").addEventListener("click", () => copyText(planText(), document.getElementById("planCopyStatus")));
  copyIepButton.addEventListener("click", () => copyText(iepText(), document.getElementById("iepCopyStatus")));

  renderPlan();
})();
