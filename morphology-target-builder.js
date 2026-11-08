"use strict";

(function () {
  const GRADES = {
    foundation: {
      label: "Flight A · Typically Grades 2–3",
      expectation: "Work across all five morphology objectives with familiar, transparent prefixes and suffixes first, then grow toward more derivational and less transparent forms. Increase the number of meaningful parts, spelling or sound changes, lexical load, independence, and transfer gradually.",
      material: "transparent, familiar words with one or two meaningful parts, growing toward less transparent derivational forms",
      transfer: "supported transfer to new transparent words and short reading or writing contexts"
    },
    expansion: {
      label: "Flight B · Typically Grades 4–5",
      expectation: "Coordinate prefixes, roots, and suffixes in words with multiple meaningful parts. Expect increasing tolerance for spelling, sound, and form changes, broader vocabulary load, and transfer to academic text.",
      material: "words with multiple affixes and roots, including moderate spelling, sound, or form changes",
      transfer: "increasingly independent transfer to unfamiliar words and curriculum-related text"
    },
    advanced: {
      label: "Flight C · Typically Grades 6–8",
      expectation: "Analyze complex and less transparent morphological families, including classical roots and derivational patterns. Emphasize flexible reasoning, lexical precision, independence, and generalization across academic disciplines.",
      material: "complex, less transparent, and academically useful words with several meaningful parts",
      transfer: "independent generalization across novel words, connected text, writing, and content areas"
    }
  };

  const FOCUSES = {
    know: {
      label: "Know the Parts / Understand word parts",
      shortLabel: "Know the Parts",
      action: "locate a taught morpheme in a word and explain the meaning it contributes",
      activities: ["Learn", "Meaning", "Word Part", "Find", "Word Hunt"],
      monitor: "Accuracy and specificity when identifying a word part, explaining its meaning, and distinguishing it from the base or other meaningful parts."
    },
    analyze: {
      label: "Analyze Words",
      shortLabel: "Analyze Words",
      action: "separate a selected word into meaningful parts and explain one part’s contribution to the whole word",
      activities: ["Break It Apart", "Word Part", "Find", "Figure It Out"],
      monitor: "Boundary accuracy, completeness of the analysis, attention to form changes, and whether the learner explains relationships rather than only naming pieces."
    },
    meaning: {
      label: "Figure Out Meaning",
      shortLabel: "Figure Out Meaning",
      action: "propose a meaning for an unfamiliar word from its meaningful parts and check that interpretation against the surrounding sentence",
      activities: ["Figure It Out", "Meaning", "Break It Apart", "Word Hunt"],
      monitor: "Use of both morphology and context, quality of the meaning explanation, revision after feedback, and transfer to unfamiliar words."
    },
    build: {
      label: "Build & Use Words",
      shortLabel: "Build & Use Words",
      action: "form a requested member of a word family and use it in a sentence that shows its meaning",
      activities: ["Build Words", "Use It", "Change It", "Meaning"],
      monitor: "Selection and combination of meaningful parts, spelling or form changes, grammatical fit, meaning, and accurate use in context."
    },
    apply: {
      label: "Apply Independently",
      shortLabel: "Apply Independently",
      action: "independently explain an unpracticed word’s meaning and identify the morpheme and context clues used",
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

  const STANDARD_ALIGNMENT = {
    foundation: {
      know: { direct: "No one-to-one CCSS code verified for explaining morpheme meanings and roles.", related: "CCSS RF.2.3d; L.2.4b–c; RF.3.3a–b; L.3.4b–c" },
      analyze: { direct: "No one-to-one CCSS code verified for morphological segmentation and structural explanation.", related: "CCSS RF.2.3d; L.2.4b–c; RF.3.3a–b; L.3.4b–c" },
      meaning: { direct: "CCSS L.2.4b–c; L.3.4b–c", related: "CCSS RF.2.3d; RF.3.3a–b" },
      build: { direct: "No one-to-one CCSS code verified for this productive target.", related: "CCSS RF.2.3d; L.2.4b–c; RF.3.3a–b; L.3.4b–c" },
      apply: { direct: "No one-to-one CCSS code verified for this broad transfer target.", related: "CCSS RF.2.3d; L.2.4b–c; RF.3.3a–b; L.3.4b–c" }
    },
    expansion: {
      know: { direct: "No one-to-one CCSS code verified for isolated morpheme knowledge.", related: "CCSS L.4.4a–c; L.5.4a–c" },
      analyze: { direct: "No one-to-one CCSS code verified for analysis alone.", related: "CCSS L.4.4a–c; L.5.4a–c" },
      meaning: { direct: "CCSS L.4.4b; L.5.4b", related: "CCSS L.4.4a, c; L.5.4a, c" },
      build: { direct: "No one-to-one CCSS code verified for this productive target.", related: "CCSS L.4.4a–c; L.5.4a–c" },
      apply: { direct: "No one-to-one CCSS code verified for this broad transfer target.", related: "CCSS L.4.4a–c; L.5.4a–c" }
    },
    advanced: {
      know: { direct: "No one-to-one CCSS code verified for isolated morpheme knowledge.", related: "CCSS L.6.4a–d; L.7.4a–d; L.8.4a–d" },
      analyze: { direct: "No one-to-one CCSS code verified for analysis alone.", related: "CCSS L.6.4a–d; L.7.4a–d; L.8.4a–d" },
      meaning: { direct: "CCSS L.6.4b; L.7.4b; L.8.4b", related: "CCSS L.6.4a, c–d; L.7.4a, c–d; L.8.4a, c–d" },
      build: { direct: "No one-to-one CCSS code verified for this productive target.", related: "CCSS L.6.4a–d; L.7.4a–d; L.8.4a–d" },
      apply: { direct: "No one-to-one CCSS code verified for this broad transfer target.", related: "CCSS L.6.4a–d; L.7.4a–d; L.8.4a–d" }
    }
  };

  const RESEARCH_SUMMARIES = {
    foundation: {
      know: "Grade 2 feasibility work shows that young students can participate in explicit, scaffolded morphology instruction. A Grade 3 randomized digital pilot also found gains on affix identification and suffix choice, supporting explicit word-part knowledge as a proximal instructional target.",
      analyze: "Early morphology instruction can go beyond recognition when the words and supports are appropriate. Grade 2 implementation evidence supports scaffolded morphological thinking, while Grades 3–6 assessment research shows that task demands and base-word transparency strongly affect difficulty.",
      meaning: "Morphology can help students form a preliminary hypothesis about an unfamiliar word, but difficulty depends on the particular word and task. Early work should favor accessible, transparent relationships, with context used to check or refine rather than replace morphological analysis.",
      build: "Direct evidence supports teaching students to work with morphological forms, not only memorize definitions. Grade 3 intervention evidence includes gains in suffix choice, while clinical/tutorial and Grade 2 implementation research support scaffolded word construction and manipulation.",
      apply: "Independence should develop gradually. Research shows that performance on directly taught material is generally stronger than transfer to untaught material, so early supported application and independent transfer should be monitored separately."
    },
    expansion: {
      know: "Grades 4–6 intervention research supports explicit knowledge of morphemes, bases, and affixes as part of structured morphology instruction. Grade 5 impact research also found improvement in real-word decomposition, although broader untaught-word outcomes did not automatically improve.",
      analyze: "Grades 4–6 intervention work produced gains in morphological awareness, decoding, and analysis, while Grades 3–6 assessment research shows that analysis difficulty varies substantially with the task and transparency of the base-word relationship.",
      meaning: "Morphological analysis can support unfamiliar-word reasoning, but successful decomposition does not guarantee independent meaning inference. Grade 5 impact research found improvement in decomposition without corresponding effects on untaught derivation or word-meaning inference, supporting the use of morphology plus context and verification.",
      build: "Intervention research with Grades 4–6 included assembly, deconstruction, and manipulation of morphologically complex words and produced gains on several proximal morphology outcomes. This supports productive word-family work while avoiding claims that word construction alone produces broad standardized literacy gains.",
      apply: "Near transfer can occur, but broader generalization is less consistent. Increasing independence is appropriate across this band, while fresh-word performance should remain a distinct outcome rather than being inferred from success with taught words."
    },
    advanced: {
      know: "Middle-grade research shows that morphological knowledge is multidimensional, including awareness, semantic knowledge, morphosyntactic knowledge, and form-related knowledge. Intervention studies with adolescents also support explicit work with roots and affixes, although outcomes differ by population and task.",
      analyze: "Adolescent intervention research provides direct support for morphological analysis. Cross-language morphology instruction produced transfer on a morphological-analysis measure, and language-disorder intervention research found transfer to new roots containing taught affixes, but not to untaught affixes.",
      meaning: "Morphological problem solving can support academic-word learning and some vocabulary outcomes in middle-grade students. The evidence does not justify assuming broad reading-comprehension effects, so morphology should generate a meaning hypothesis that is then checked against context and other information.",
      build: "Grades 5–8 assessment research supports treating morphosyntactic knowledge, such as how morphological forms relate to grammatical function, as a distinct dimension. Clinical guidance supports production and form-selection work, but direct intervention evidence for every sentence-level productive task is more limited, so claims should remain targeted.",
      apply: "Strategic transfer is a legitimate goal, but it should be measured rather than assumed. Adolescent studies show some generalization to new words containing taught morphology, while intervention studies and meta-analytic evidence show clear limits on transfer beyond what was explicitly taught."
    }
  };

  const SOURCES = {
    henbest2019: { url: "https://doi.org/10.1044/2019_PERS-SIG1-2019-0003", authors: "Henbest, Apel, & Mitchell", year: "2019", title: "Grade 2 explicit morphology instruction", type: "Feasibility study", claim: "Two teachers implemented eight weeks of scaffolded explicit morphology instruction with 30 Grade 2 students; morphology scores increased from pretest to posttest.", limitation: "No business-as-usual control group; not causal efficacy evidence." },
    wood2025: { authors: "Wood et al.", year: "2025", title: "Grade 3 supplemental digital morphology pilot", type: "Randomized intervention", claim: "Significant effects on affix identification and suffix choice.", limitation: "Findings are bounded to the measured proximal morphology outcomes." },
    apel2023: { authors: "Apel, Henbest, & Petscher", year: "2023", title: "Morphological awareness across Grades 3–6", type: "Design/assessment study", claim: "Task characteristics and base-word transparency affected performance; transparent relationships were generally easier.", limitation: "Assessment evidence; does not prove an instructional sequence or intervention effect." },
    mendes2024: { url: "https://doi.org/10.1177/07319487241259775", authors: "Mendes & Kirby", year: "2024", title: "Morphology intervention for Grades 4–6 students with dyslexia/LD", type: "Intervention study", claim: "Gains in morphological awareness, decoding, analysis, spelling, and some near morphological transfer following decomposition and assembly instruction.", limitation: "Small sample; no significant broad standardized word-reading or fluency effects." },
    foorman2021: { authors: "Foorman et al.", year: "2021", title: "Grade 5 morphology impact study", type: "Impact/intervention study", claim: "Real-word decomposition improved.", limitation: "No significant effects on untaught derivation, word-meaning inference, vocabulary, or ELA outcomes." },
    crosson2025: { authors: "Crosson et al.", year: "2025", title: "Cross-language morphology intervention with multilingual adolescents", type: "Intervention study", claim: "Effects on five of six measured outcomes, including morphological-analysis transfer (d = .32).", limitation: "Reading-comprehension effect was small and non-significant." },
    glisson2026: { authors: "Glisson et al.", year: "2026", title: "Morphology intervention for adolescents with language disorder", type: "Intervention study", claim: "Treatment advantage for taught affixes and transfer to new roots containing taught affixes.", limitation: "No transfer to untaught affixes." },
    colenbrander2024: { authors: "Colenbrander et al.", year: "2024", title: "Morphological instruction outcomes and transfer", type: "Systematic review/meta-analysis", claim: "Effects were strongest closer to trained material; some reading, spelling, and untrained spelling effects were found.", limitation: "Untrained reading was less clear, and there was no clear reading-comprehension effect." },
    goodwin2021: { authors: "Goodwin, Petscher, & Tock", year: "2021", title: "Dimensions of morphological knowledge in Grades 5–8", type: "Design/assessment study", claim: "Morphological knowledge included separable awareness, semantic, morphosyntactic, and form-related dimensions plus task variance.", limitation: "Assessment/association evidence; not an intervention effect." },
    goodwin2016: { authors: "Goodwin", year: "2016", title: "Morphological problem-solving within comprehension instruction", type: "Grades 5–6 intervention study", claim: "Improved some vocabulary and morphological-awareness outcomes.", limitation: "No significant reading-comprehension or word-reading-fluency effect.", url: "https://doi.org/10.1007/s11145-015-9581-0" },
    collins2023: { url: "https://doi.org/10.1044/2023_PERSP-23-00059", authors: "Collins", year: "2023", title: "K–12 clinical morphology instruction", type: "Clinical tutorial/review", claim: "Supports analysis, synthesis, production, word-family work, and attention to form changes as clinical instructional practices.", limitation: "Clinical/tutorial guidance; not intervention-effect evidence." },
    wolter2013: { authors: "Wolter & Green", year: "2013", title: "School-age morphological awareness and instruction", type: "Clinical review/case-study rationale", claim: "Supports morphology problem solving, word construction, and checking meaning against context.", limitation: "Clinical review and case illustration do not establish broad causal effects." }
  };

  const SOURCE_MAP = {
    foundation: {
      know: ["wood2025", "henbest2019"],
      analyze: ["henbest2019", "apel2023"],
      meaning: ["apel2023", "wolter2013"],
      build: ["wood2025", "henbest2019", "collins2023"],
      apply: ["colenbrander2024", "henbest2019"]
    },
    expansion: {
      know: ["mendes2024", "foorman2021"],
      analyze: ["mendes2024", "apel2023"],
      meaning: ["foorman2021", "mendes2024", "wolter2013"],
      build: ["mendes2024", "collins2023"],
      apply: ["colenbrander2024", "foorman2021", "mendes2024"]
    },
    advanced: {
      know: ["crosson2025", "glisson2026", "goodwin2021"],
      analyze: ["crosson2025", "glisson2026"],
      meaning: ["crosson2025", "goodwin2016", "wolter2013"],
      build: ["goodwin2021", "collins2023"],
      apply: ["colenbrander2024", "crosson2025", "glisson2026"]
    }
  };

  // Merge verified bibliographic entries without duplicating Collins (2023).
  (window.FirstVoloReviewedEvidence || []).forEach(source => { SOURCES[source.id] = {...SOURCES[source.id], ...source}; });
  const additions={foundation:{know:['park2020','apel2022'],analyze:['brimo2020','apel2022'],meaning:['brimo2020','ram2013'],build:['brimo2020','apelwerfel2014'],apply:['park2020']},expansion:{know:['apel2022'],analyze:['apel2022','brimo2020'],meaning:['greenwolter2025','ram2013'],build:['krimm2019','greenwolter2025','apelwerfel2014'],apply:['gellert2023']},advanced:{know:['brimo2020'],analyze:['brimo2020'],meaning:['woltergreen2021'],build:['woltergreen2021'],apply:['woltergreen2021']}};
  Object.entries(additions).forEach(([band,focuses])=>Object.entries(focuses).forEach(([focus,ids])=>SOURCE_MAP[band][focus].push(...ids.filter(id=>SOURCES[id]))));
  function reviewedLibrary(){return `<details class="reviewed-evidence-library"><summary>Reviewed article library · ${(window.FirstVoloReviewedEvidence||[]).length} supplied papers</summary><p>Background sources may cover different grades, populations or languages from the current selection. Study type and limits are shown to support educator judgment.</p><div class="source-list">${(window.FirstVoloReviewedEvidence||[]).map(s=>`<article class="source-card"><strong>${s.authors} (${s.year})</strong><span>${s.title}</span><span><b>Type:</b> ${s.type}</span><span><b>Population:</b> ${s.population}</span><span>${s.claim}</span><span><b>Limit:</b> ${s.limitation}</span><a href="${s.url}" target="_blank" rel="noopener">Read source / citation →</a></article>`).join('')}</div><p><b>Professional perspectives (not intervention trials):</b> <a href="https://www.shanahanonliteracy.com/blog/what-should-morphology-instruction-look-like" target="_blank" rel="noopener">Shanahan / Bowers discussion of families and affix lists</a> · <a href="https://jenniferfindley.com/morphology_scope_and_sequence/" target="_blank" rel="noopener">Findley’s suggested classroom sequence</a>. These are discussion/practitioner resources, not official grade-level morpheme requirements.</p></details>`;}

  const MORPHO_APPLICATIONS = {
    know: "Morpho explicitly teaches word-part meanings and provides repeated examples across related words.",
    analyze: "Morpho provides repeated opportunities to locate meaningful boundaries, compare related forms, and explain how bases, roots, and affixes work together.",
    meaning: "Morpho asks learners to combine morphology and context; non-target meanings may be supplied so vocabulary knowledge does not unnecessarily obscure the morphology target.",
    build: "Morpho connects word-part meanings with building, changing, and using words while attending to form and grammatical role.",
    apply: "Morpho fades support toward strategic use and monitors taught-skill performance separately from protected transfer performance."
  };

  const schoolGrade = document.getElementById("standardsGrade");
  const standardsSystem = document.getElementById("standardsSystem");
  const builderStudy = document.getElementById("builderStudy");
  const sessionsSelect = document.getElementById("sessionsSelect");
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
    return SOURCE_MAP[state.grade][state.focus]
      .map((id) => SOURCES[id]);
  }

  function sourceCards() {
    return relevantSources().map((source) => `
      <article class="source-card">
        <strong>${source.authors} (${source.year})</strong>
        <span>${source.title}</span>
        <span><b>Evidence type:</b> ${source.type}</span>
        <span><b>Supports:</b> ${source.claim}</span>
        <span><b>Required limitation:</b> ${source.limitation}</span>
        ${source.url ? `<a href="${source.url}" target="_blank" rel="noopener noreferrer">Read source / citation ↗</a>` : ""}
      </article>
    `).join("");
  }

  function evidenceNote() {
    const row=window.FirstVoloGradeStandards.connections(schoolGrade.value,state.focus,standardsSystem.value);
    return `${FOCUSES[state.focus].shortLabel}: ${row?row.system+' Grade '+row.grade+' ('+row.codes.join('; ')+'). '+row.connection:'Choose an actual grade before citing a grade-specific standard.'} Research references for ${GRADES[state.grade].label}: ${relevantSources().map(s=>s.authors+' ('+s.year+')').join('; ')}. These sources inform instruction, not product efficacy or an individual mastery decision.`;
  }

  function massachusettsAlignment() {
    if (state.grade === "expansion" && state.focus === "meaning") {
      return "Verified direct Massachusetts alignment for Grade 4 only: MA L.4.4b. No direct Grade 5 Massachusetts code is verified for this target in the current crosswalk. Related state guidance: Massachusetts Mass Literacy — Vocabulary and Morphology.";
    }
    if (state.grade === "advanced" && state.focus === "meaning") {
      return "Verified direct Massachusetts alignment for Grade 7 only: MA L.7.4b. No direct Grade 6 or Grade 8 Massachusetts code is verified for this target in the current crosswalk. Related state guidance: Massachusetts Mass Literacy — Vocabulary and Morphology.";
    }
    return "Massachusetts: no direct code verified for this specific target in the current crosswalk. Related state guidance: Massachusetts Mass Literacy — Vocabulary and Morphology.";
  }

  function federalGuidance() {
    const band = state.grade === "foundation" ? "K–3" : "Grades 4–9";
    return `IES/WWC ${band} guidance includes word-part analysis within broader vocabulary and word-learning recommendations. Any Strong Evidence rating applies to the complete recommendation, not morphology alone.`;
  }

  function gradeStandardsHtml() {
    const row=window.FirstVoloGradeStandards.connections(schoolGrade.value,state.focus,standardsSystem.value);
    if(!row)return '<h4>Choose the learner’s actual grade</h4><p>Practice Flight sets instructional complexity. It does not assign a school grade or standards level.</p>';
    return `<h4>${row.system} · Grade ${row.grade}</h4><p><b>${row.codes.join('; ')}</b> — ${row.summary}</p><p>${row.connection}</p><p>${row.condition}</p>${row.context?`<p><b>${row.context.code}</b> — ${row.context.summary}</p>`:''}<p><a href="${row.url}" target="_blank" rel="noopener">Read the official grade standards</a> · <a href="https://www.doe.mass.edu/frameworks/ela/2017-06.pdf" target="_blank" rel="noopener">MA framework</a></p><p class="alignment-note">Paraphrased connections checked November 8, 2026. Standards describe curriculum expectations; they do not establish an IEP need, mastery, or efficacy for this app.</p>`;
  }
  const ACTIVITY_MODES={'Learn':'learn','Meaning':'meaning','Word Part':'morpheme','Find':'find','Word Hunt':'hunt','Break It Apart':'break','Figure It Out':'infer','Build Words':'build','Use It':'use','Change It':'change'};
  const PROBES={know:'After a recognition response, ask the learner to explain the morpheme’s meaning without seeing answer choices.',analyze:'Ask for an explanation of each boundary and check a new word separately from the practiced examples.',meaning:'Ask for an oral or written meaning explanation and the sentence clue used; score this separately from choosing an answer.',build:'The app provides construction or word-form choices. Add a learner-generated sentence to measure productive use.',apply:'Use a fresh word or short text without word-part cues. Record cue level and transfer separately from practiced-item accuracy.'};
  function activityLinks(){
    const band={foundation:'2-3',expansion:'4-5',advanced:'6-8'}[state.grade], combo=builderStudy.value.includes('-');
    return FOCUSES[state.focus].activities.map(name=>{
      const mode=ACTIVITY_MODES[name];if(['build','use','change'].includes(mode)&&!combo)return `<li>${name}: choose a combined word-part set above to open this activity.</li>`;
      if(mode==='change'&&builderStudy.value==='prefix-root')return '<li>Change It: choose a set containing suffixes.</li>';
      if(state.grade==='foundation'&&builderStudy.value.includes('root'))return `<li>${name}: roots/combined root sets require Flight B or C.</li>`;
      const query=new URLSearchParams({from:'target-builder',flight:band,study:builderStudy.value,activity:mode});return `<li><a href="index.html?${query}">Open ${name} →</a></li>`;
    }).join('');
  }
  function renderEvidence() {
    const grade = GRADES[state.grade];
    const focus = FOCUSES[state.focus];
    const standard = STANDARD_ALIGNMENT[state.grade][state.focus];
    const content = {
      standards: gradeStandardsHtml(),
      research: `
        <h4>What research suggests for ${focus.shortLabel}</h4><p><b>Target selection:</b> Brimo &amp; Henbest (2020) recommends transparent relationships before less transparent shifts. Green &amp; Wolter (2025) illustrates connecting learner needs, standards and classroom vocabulary. These are clinical guidance, not validated placement rules.</p>
        <p>${RESEARCH_SUMMARIES[state.grade][state.focus]}</p><details><summary>Does the research describe a teaching order?</summary><p>Mendes &amp; Kirby (2024) taught inflections before derivations, transparent forms before spelling/sound shifts, and free bases before bound bases. They checked application to unpracticed bases after taught ones. This is a study-specific sequence, not a proven universal order or a grade-level morpheme list.</p><p>Moats &amp; Smith (1992), Appendix A, offers an older proposed scope and sequence. The authors call it speculative. Use its transparency/complexity principles as historical context, not current grade placement rules.</p><a href="https://doi.org/10.1177/07319487241259775" target="_blank" rel="noopener">Read the intervention methods →</a></details>
      `,
      morpho: `
        <h4>How Morpho applies this evidence</h4><details><summary>Tier 1 classroom connection</summary><p>Collins &amp; Wolter (2019) describes a Grade 3 teacher–SLP collaboration model tied to curriculum vocabulary, reading and writing.</p><ol><li>Agree on a classroom language goal and a small curriculum-linked word family.</li><li>Model how its parts contribute meaning; use a shared sort or word-building example.</li><li>Have learners explain and use a related word in classroom reading or writing.</li><li>Review independent and supported responses to decide what to reteach or practice in a smaller group.</li></ol><p>First Volo activities can support these steps. The source is a collaboration framework, not proof of efficacy for this app or a rule for assigning intervention tiers.</p><a href="https://doi.org/10.1044/2019_PERS-SIG1-2019-0006" target="_blank" rel="noopener">Tier 1 source →</a></details>
        <ul class="morpho-application-list">
          <li>${MORPHO_APPLICATIONS[state.focus]}</li>
          <li>Morpho controls word transparency and complexity developmentally.</li>
          <li>Teacher-guided work uses independent attempt → identify breakdown → least necessary support → retry the same demand → fade support.</li>
        </ul>
        <p class="morpho-evidence-note">First Volo Morphology is research-informed and standards-aligned. These sources support the instructional targets and design principles; they do not constitute direct efficacy evidence for First Volo Morphology itself.</p>
      `,
      sources: `
        <h4>Sources relevant to this selection</h4>
        <div class="source-list">${sourceCards()}</div>${reviewedLibrary()}
      `
    };
    const activeTab = [...evidenceTabs].find((tab) => tab.dataset.evidenceTab === state.evidenceTab);
    evidencePanel.setAttribute("aria-labelledby", activeTab.id);
    evidencePanel.innerHTML = content[state.evidenceTab];
  }

  function buildEvidenceAudit() {
    return Object.entries(GRADES).flatMap(([gradeId, grade]) =>
      Object.entries(FOCUSES).map(([focusId, focus]) => {
        const sources = SOURCE_MAP[gradeId][focusId].map((id) => SOURCES[id]);
        const standard = STANDARD_ALIGNMENT[gradeId][focusId];
        return Object.freeze({
          gradeBand: grade.label,
          objective: focus.label,
          researchText: RESEARCH_SUMMARIES[gradeId][focusId],
          sources: sources.map((source) => `${source.authors} (${source.year})`).join("; "),
          evidenceTypes: sources.map((source) => source.type).join("; "),
          claimsSupported: sources.map((source) => source.claim).join(" | "),
          requiredLimitations: sources.map((source) => source.limitation).join(" | "),
          directStandards: standard.direct,
          relatedStandards: standard.related
        });
      })
    );
  }

  function validateEvidenceAudit(rows) {
    if (rows.length !== 15) throw new Error("Evidence audit must contain 15 grade/objective rows.");
    rows.forEach((row) => {
      if (!row.researchText || !row.sources || !row.evidenceTypes || !row.claimsSupported || !row.requiredLimitations) {
        throw new Error(`Incomplete evidence audit row: ${row.gradeBand} / ${row.objective}`);
      }
    });
    if (SOURCES.henbest2019.type !== "Feasibility study" || !SOURCES.henbest2019.limitation.includes("No business-as-usual control group")) {
      throw new Error("Henbest et al. 2019 guardrail failed.");
    }
    if (SOURCES.apel2023.type !== "Design/assessment study" || SOURCES.goodwin2021.type !== "Design/assessment study") {
      throw new Error("Assessment evidence may not be labeled as intervention evidence.");
    }
    if (Object.values(SOURCE_MAP).some((band) => Object.values(band).flat().some((id) => id === "nrp2000"))) {
      throw new Error("NRP may not be primary morphology-specific impact evidence.");
    }
    ["foundation", "expansion", "advanced"].forEach((gradeId) => {
      const directBundles = Object.values(STANDARD_ALIGNMENT[gradeId]).map((item) => item.direct);
      if (new Set(directBundles).size === 1) throw new Error(`Direct standards were mechanically duplicated for ${gradeId}.`);
    });
  }

  const evidenceAudit = Object.freeze(buildEvidenceAudit());
  validateEvidenceAudit(evidenceAudit);
  window.FirstVoloTargetEvidenceAudit = evidenceAudit;
  if (typeof console !== "undefined" && typeof console.table === "function") {
    console.table(evidenceAudit);
  }

  function renderPlan() {
    const grade = GRADES[state.grade];
    const focus = FOCUSES[state.focus];
    const support = SUPPORTS[state.support];
    const supportHeading = state.support === "independent"
      ? "Access supports that preserve independence"
      : "Possible supports";
    planResult.innerHTML = `
      <article class="result-card result-card-wide"><h3>Suggested objective wording</h3><p>${objectiveWording()}</p></article>
      <article class="result-card"><h3>Possible condition</h3><p>${support.condition}.</p></article>
      <article class="result-card"><h3>Developmental expectation</h3><p><strong>${grade.label}:</strong> ${grade.expectation}</p></article>
      <article class="result-card"><h3>Recommended Morpho activities</h3><ul>${activityLinks()}</ul><p>${PROBES[state.focus]}</p><p>Opening applies session choices only. It does not save an independent-learning plan or mark an objective as met.</p></article>
      <article class="result-card"><h3>${supportHeading}</h3>${list(support.ideas)}</article>
      <article class="result-card result-card-wide"><h3>What to monitor</h3><p>${focus.monitor} Also monitor ${grade.transfer}.</p></article>
    `;
    renderIep();
  }

  function planText() {
    const grade = GRADES[state.grade];
    const focus = FOCUSES[state.focus];
    const support = SUPPORTS[state.support];
    return [
      "FIRST VOLO MORPHOLOGY — SUGGESTED TARGET",
      `Grade band: ${grade.label}`,
      `Focus: ${focus.label}`,
      `Suggested objective: ${objectiveWording()}`,
      `Possible condition: ${support.condition}.`,
      `Developmental expectation: ${grade.expectation}`,
      `Recommended Morpho activities: ${focus.activities.join(", ")}`,
      `${state.support === "independent" ? "Access supports that preserve independence" : "Possible supports"}: ${support.ideas.join("; ")}`,
      `What to monitor: ${focus.monitor} Also monitor ${grade.transfer}.`
    ].join("\n\n");
  }

  function iepText() {
    if (!criterionSelect.value || !sessionsSelect.value) return "";
    return `${SUPPORTS[state.support].condition}, the learner will ${FOCUSES[state.focus].action} using ${GRADES[state.grade].material}, ${criterionSelect.value === "4 out of 5 opportunities" ? "in " : "with "}${criterionSelect.value}, in ${acrossSelect.value}, sampled with ${sessionsSelect.value}, by [review date]. Record each response component and the cue level separately.`;
  }

  function renderIep() {
    const text = iepText();
    copyIepButton.disabled = !text;
    iepPreview.setAttribute("aria-disabled", String(!text));
    iepPreview.textContent = text || "Choose a performance criterion and measurement schedule to generate an example objective.";
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
  [schoolGrade,standardsSystem].forEach(control=>control.addEventListener("change",renderEvidence));
  builderStudy.addEventListener("change",renderPlan);
  sessionsSelect.addEventListener("change",renderIep);
  criterionSelect.addEventListener("change", renderIep);
  acrossSelect.addEventListener("change", renderIep);
  document.getElementById("copyPlanButton").addEventListener("click", () => copyText(objectiveWording(), document.getElementById("planCopyStatus")));
  document.getElementById("copyEvidenceButton").addEventListener("click", () => copyText(evidenceNote(), document.getElementById("evidenceCopyStatus")));
  copyIepButton.addEventListener("click", () => copyText(iepText(), document.getElementById("iepCopyStatus")));

  renderPlan();
  renderEvidence();
})();
