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

  const STANDARDS = {
    foundation: {
      summary: "Grades 2–3 standards support using common prefixes, suffixes, bases, and roots in both word reading and meaning-making. The selected target can involve rich analysis, inference, production, or application when the words and support are developmentally calibrated.",
      codes: "CCSS RF.2.3d; L.2.4b–c; RF.3.3a–b; L.3.4b–c"
    },
    expansion: {
      summary: "Grades 4–5 standards expect students to use Greek and Latin affixes and roots as clues to meaning, while coordinating morphology with context and reference tools when needed.",
      codes: "CCSS L.4.4a–c; L.5.4a–c"
    },
    advanced: {
      summary: "Grades 6–8 standards expect increasingly strategic use of Greek and Latin affixes and roots, context, and reference or verification strategies to determine and confirm word meaning.",
      codes: "CCSS L.6.4a–d; L.7.4a–d; L.8.4a–d"
    }
  };

  const GRADE_RESEARCH = {
    foundation: "Research supports rich morphological thinking beginning in Grade 2 when instruction uses familiar bases, relatively transparent morphology, controlled word complexity, and explicit support that can be faded. Grade 2 feasibility work has found improved morphology performance following explicit instruction, but it was not a randomized causal trial.",
    expansion: "Studies indicate that students in the middle elementary grades increasingly coordinate roots, affixes, word families, and context while working with more multimorphemic academic words. Assessment research also suggests that base transparency and task demands meaningfully affect performance.",
    advanced: "Evidence suggests that older students benefit from strategic morphological problem-solving integrated with context, grammatical information, word-family relationships, and verification. Morphology can support a preliminary meaning hypothesis, but it may not be sufficient by itself for every complex word."
  };

  const FOCUS_RESEARCH = {
    know: "For word-part knowledge, research supports explicit instruction in morpheme meanings, repeated examples, and comparison within word families.",
    analyze: "For analysis, evidence highlights segmentation, base–affix relationships, comparisons among related forms, and careful control of word transparency.",
    meaning: "For inference, studies support combining known morpheme information with context and treating the result as a meaning hypothesis that may need verification.",
    build: "For production, instruction can connect inflectional and derivational forms, grammatical or part-of-speech changes, and accurate contextual use within word families.",
    apply: "For independent application, intervention syntheses support fading assistance and monitoring taught or proximal performance separately from transfer to untrained material, which is less consistent."
  };

  const SOURCES = {
    henbest2019: { authors: "Henbest, Apel, & Mitchell", year: "2019", title: "Explicit morphology instruction in Grade 2", type: "Grade 2 feasibility study" },
    apel2023: { authors: "Apel, Henbest, & Petscher", year: "2023", title: "Morphological awareness across Grades 3–6", type: "Assessment/development evidence" },
    colenbrander2024: { authors: "Colenbrander et al.", year: "2024", title: "Morphological instruction outcomes and transfer", type: "Systematic review/meta-analysis" },
    goodwin2020: { authors: "Goodwin, Petscher, & Tock", year: "2020", title: "Morphology, vocabulary, and reading relationships", type: "Development/relationship evidence" },
    bowers2010: { authors: "Bowers, Kirby, & Deacon", year: "2010", title: "The effects of morphological instruction on literacy skills", type: "Systematic review", url: "https://doi.org/10.3102/0034654309359353" },
    goodwin2016: { authors: "Goodwin", year: "2016", title: "Morphological problem-solving within comprehension instruction", type: "Grades 5–6 intervention study", url: "https://doi.org/10.1007/s11145-015-9581-0" },
    wolter2013: { authors: "Wolter & Green", year: "2013", title: "School-age morphological awareness and instruction", type: "SLP tutorial/review" },
    npr2000: { authors: "National Reading Panel", year: "2000", title: "Teaching children to read", type: "Historical federal synthesis" }
  };

  const GRADE_SOURCES = {
    foundation: ["henbest2019", "bowers2010", "colenbrander2024"],
    expansion: ["apel2023", "goodwin2020", "bowers2010", "goodwin2016"],
    advanced: ["goodwin2016", "goodwin2020", "colenbrander2024", "wolter2013"]
  };

  const FOCUS_SOURCES = {
    know: ["bowers2010", "npr2000"],
    analyze: ["apel2023", "bowers2010"],
    meaning: ["apel2023", "goodwin2020"],
    build: ["henbest2019", "bowers2010"],
    apply: ["colenbrander2024", "goodwin2016"]
  };

  const MORPHO_APPLICATIONS = {
    know: "Morpho explicitly teaches word-part meanings and provides repeated examples across related words.",
    analyze: "Morpho provides repeated opportunities to locate meaningful boundaries, compare related forms, and explain how bases, roots, and affixes work together.",
    meaning: "Morpho asks learners to combine morphology and context; non-target meanings may be supplied so vocabulary knowledge does not unnecessarily obscure the morphology target.",
    build: "Morpho connects word-part meanings with building, changing, and using words while attending to form and grammatical role.",
    apply: "Morpho fades support toward strategic use and monitors taught-skill performance separately from protected transfer performance."
  };

  const state = { grade: "foundation", focus: "know", support: "program", evidenceTab: "standards" };
  const planResult = document.getElementById("planResult");
  const supportSelect = document.getElementById("supportSelect");
  const criterionSelect = document.getElementById("criterionSelect");
  const acrossSelect = document.getElementById("acrossSelect");
  const iepPreview = document.getElementById("iepPreview");
  const copyIepButton = document.getElementById("copyIepButton");
  const evidencePanel = document.getElementById("evidencePanel");
  const evidenceTabs = document.querySelectorAll("[data-evidence-tab]");

  function list(items) {
    return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  }

  function objectiveWording() {
    const grade = GRADES[state.grade];
    const focus = FOCUSES[state.focus];
    return `The learner will ${focus.action} using ${grade.material}.`;
  }

  function relevantSources() {
    return [...new Set([
      ...GRADE_SOURCES[state.grade],
      ...FOCUS_SOURCES[state.focus]
    ])].map((id) => SOURCES[id]);
  }

  function sourceCards() {
    return relevantSources().map((source) => `
      <article class="source-card">
        <strong>${source.authors} (${source.year})</strong>
        <span>${source.title}</span>
        <span>${source.type}</span>
        ${source.url ? `<a href="${source.url}" target="_blank" rel="noopener noreferrer">Verified source ↗</a>` : ""}
      </article>
    `).join("");
  }

  function evidenceNote() {
    return "This target is aligned with grade-level language/literacy standards and informed by research supporting explicit morphological awareness instruction. For this grade band, instruction emphasizes developmentally appropriate word complexity, explicit word-part knowledge, and increasing independent application.";
  }

  function renderEvidence() {
    const grade = GRADES[state.grade];
    const focus = FOCUSES[state.focus];
    const standard = STANDARDS[state.grade];
    const content = {
      standards: `
        <h4>${grade.label}: why this skill is grade-appropriate</h4>
        <p>${standard.summary}</p>
        <p class="standards-codes">${standard.codes}</p>
        <p class="alignment-note">Massachusetts alignment: crosswalk in development</p>
      `,
      research: `
        <h4>What research suggests for ${focus.label}</h4>
        <p>${GRADE_RESEARCH[state.grade]} ${FOCUS_RESEARCH[state.focus]}</p>
      `,
      morpho: `
        <h4>How Morpho applies this evidence</h4>
        <ul class="morpho-application-list">
          <li>${MORPHO_APPLICATIONS[state.focus]}</li>
          <li>Morpho controls word transparency and complexity developmentally.</li>
          <li>Teacher-guided work uses independent attempt → identify breakdown → least necessary support → retry the same demand → fade support.</li>
        </ul>
        <p class="morpho-evidence-note">First Volo Morphology is research-informed and standards-aligned. These sources support the instructional targets and design principles; they do not constitute direct efficacy evidence for First Volo Morphology itself.</p>
      `,
      sources: `
        <h4>Sources relevant to this selection</h4>
        <div class="source-list">${sourceCards()}</div>
      `
    };
    const activeTab = [...evidenceTabs].find((tab) => tab.dataset.evidenceTab === state.evidenceTab);
    evidencePanel.setAttribute("aria-labelledby", activeTab.id);
    evidencePanel.innerHTML = content[state.evidenceTab];
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
    renderEvidence();
  }

  function selectEvidenceTab(tab, moveFocus = false) {
    evidenceTabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.setAttribute("tabindex", selected ? "0" : "-1");
    });
    state.evidenceTab = tab.dataset.evidenceTab;
    renderEvidence();
    if (moveFocus) tab.focus();
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

  evidenceTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectEvidenceTab(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = null;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % evidenceTabs.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + evidenceTabs.length) % evidenceTabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = evidenceTabs.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      selectEvidenceTab(evidenceTabs[nextIndex], true);
    });
  });

  supportSelect.addEventListener("change", () => {
    state.support = supportSelect.value;
    renderPlan();
  });
  criterionSelect.addEventListener("change", renderIep);
  acrossSelect.addEventListener("change", renderIep);
  document.getElementById("copyPlanButton").addEventListener("click", () => copyText(objectiveWording(), document.getElementById("planCopyStatus")));
  document.getElementById("copyEvidenceButton").addEventListener("click", () => copyText(evidenceNote(), document.getElementById("evidenceCopyStatus")));
  copyIepButton.addEventListener("click", () => copyText(iepText(), document.getElementById("iepCopyStatus")));

  renderPlan();
  renderEvidence();
})();
