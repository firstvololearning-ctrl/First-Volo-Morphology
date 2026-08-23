"use strict";

(function initializeFirstVoloSessionMaterialsUI() {

  const STORAGE_KEY =
    "firstVoloMorphologyProgressV1";

  const DEMO_FAMILIES = {
    COOK: {
      targetId: "pre",
      target: "pre-",
      role: "prefix",
      meaning:
        "before",
      word:
        "precook",
      gradeBand: "2-3"
    },

    VIEW: {
      targetId: "able",
      target: "-able",
      role: "suffix",
      meaning:
        "can be; able to be",
      word:
        "viewable",
      gradeBand: "2-3"
    },

    PORT: {
      target: "port",
      role: "root",
      meaning:
        "carry",
      gradeBand: "4-5"
    },

    TRACT: {
      target: "tract",
      role: "root",
      meaning:
        "pull; draw",
      gradeBand: "4-5"
    }
  };


  const state = {
    student: null,
    demoFamily: null,
    minutes: 15,

    sessionSource: "recommended",
    teacherSelection: null,

    plan: null,
    material: null,

    familyOverride: null,
    familyCandidates: [],

    tasks: [],
    taskIndex: 0,

    digitalTiles: [],
    selectedTileId: null,
    draggedTileId: null,
    placed: {},

    showMeanings: false
  };


  function byId(id) {
    return document.getElementById(id);
  }


  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[‐-‒–—−]/g, "-")
      .replace(/^-+|-+$/g, "");
  }


  function variants(value) {
    return String(value || "")
      .split(
        /(?:->|→|\/|,)/
      )
      .map(normalize)
      .filter(Boolean);
  }


  function labelsMatch(a, b) {
    const aValues =
      variants(a);

    const bValues =
      variants(b);

    return aValues.some(
      value =>
        bValues.includes(value)
    );
  }


  function query() {
    return new URLSearchParams(
      window.location.search
    );
  }


  function sessionGradeBand() {
    return (
      state.plan
        ?.lastWork
        ?.gradeBand ||
      state.student
        ?.sessions
        ?.slice()
        ?.reverse()
        ?.find(
          session =>
            session?.gradeBand
        )
        ?.gradeBand ||
      null
    );
  }


  function speakText(text) {
    const audio =
      window
        .FirstVoloInstructionalAudio;

    if (
      !audio?.available?.()
    ) {
      return false;
    }

    return audio.speak(
      text,
      {
        gradeBand:
          sessionGradeBand()
      }
    );
  }


  function queryMinutes() {
    const value =
      Number(
        query().get("minutes")
      );

    return [10, 15, 30]
      .includes(value)
        ? value
        : 15;
  }


  function querySessionSelection() {
    const params =
      query();

    if (
      params.get("sessionSource") !==
        "teacher-selected"
    ) {
      return null;
    }

    const targetId =
      String(
        params.get("teacherTarget") ||
        ""
      )
        .trim();

    const activity =
      String(
        params.get("teacherActivity") ||
        ""
      )
        .trim();

    if (
      !targetId ||
      !Object.prototype
        .hasOwnProperty.call(
          ACTIVITY_LABELS,
          activity
        )
    ) {
      return null;
    }

    return {
      source: "teacher-selected",
      targetId,
      activity
    };
  }


  function loadProgress() {
    try {
      const data =
        JSON.parse(
          localStorage.getItem(
            STORAGE_KEY
          ) || "{}"
        );

      return {
        students:
          Array.isArray(data.students)
            ? data.students
            : [],

        activeStudentId:
          data.activeStudentId ||
          null
      };
    } catch (error) {
      console.warn(
        "Could not read First Volo progress.",
        error
      );

      return {
        students: [],
        activeStudentId: null
      };
    }
  }


  function makeDemoStudent(
    familyId
  ) {
    const family =
      DEMO_FAMILIES[
        familyId
      ];

    if (!family) {
      return null;
    }

    const now =
      new Date()
        .toISOString();

    return {
      id:
        `demo-${familyId}`,

      name:
        `Demo · ${familyId}`,

      sessions: [
        {
          id:
            `demo-session-${familyId}`,

          startedAt:
            now,

          completedAt:
            now,

          activity:
            "meaning",

          studyMode:
            "combos",

          gradeBand:
            family.gradeBand,

          vocabLevel:
            "all",

          totalItems:
            1,

          correct:
            1,

          accuracy:
            100,

          responses: [
            {
              id:
                `demo-response-${familyId}`,

              skill:
                "meaning",

              correct:
                true,

              independentCorrect:
                true,

              primaryTarget:
                family.target,

              primaryTargetId:
                family.target,

              targetType:
                (
                  family.role ===
                    "base word"
                    ? "root"
                    : family.role
                ),

              linguisticRole:
                family.role,

              familyId:
                familyId,

              supportingTargets:
                [],

              supportingTargetIds:
                [],

              word:
                family.word ||
                family.target,

              difficultyType:
                "none",

              accessSupportsUsed:
                [],

              instructionalScaffoldsUsed:
                [],

              supportHistory:
                [],

              outcomeAfterSupport:
                "not_needed"
            }
          ]
        }
      ]
    };
  }


  function resolveStudent() {
    const demo =
      String(
        query().get("demo") ||
        ""
      )
        .trim()
        .toUpperCase();

    if (
      DEMO_FAMILIES[
        demo
      ]
    ) {
      state.demoFamily =
        demo;

      return makeDemoStudent(
        demo
      );
    }

    const data =
      loadProgress();

    const requested =
      query().get(
        "studentId"
      );

    const id =
      requested ||
      data.activeStudentId;

    return (
      data.students.find(
        student =>
          student.id === id
      ) ||
      null
    );
  }


  function targetPhrase(target) {
    if (!target?.label) {
      return "Exact target needs selection";
    }

    const role =
      target.role ||
      "word part";

    if (target.meaning) {
      return (
        `${role} ${target.label} = ` +
        `${target.meaning}`
      );
    }

    return (
      `${role} ${target.label}`
    );
  }


  function latestInstructionalResponse() {
    return (
      state.plan
        ?.lastWork
        ?.latestResponse ||
      null
    );
  }


  function buildDynamicSessionGuidance() {
    const engine =
      window
        .FirstVoloDynamicSessionGuidance;

    const activity =
      state.plan
        ?.teachPractice
        ?.activity ||
      state.plan
        ?.nextWork
        ?.activity ||
      state.plan
        ?.lastWork
        ?.activity ||
      "learn";

    const target =
      state.plan
        ?.targetResolution
        ?.primary ||
      state.plan
        ?.teachPractice
        ?.target ||
      state.plan
        ?.nextWork
        ?.target ||
      state.plan
        ?.lastWork
        ?.target ||
      null;

    if (!engine?.build) {
      return {
        activity,
        target,

        educatorDoes:
          state.plan
            ?.teachPractice
            ?.educatorDoes ||
          "Allow an independent attempt before adding support.",

        studentDoes:
          state.plan
            ?.teachPractice
            ?.studentDoes ||
          "Completes the morphology task as independently as possible.",

        conditionals: []
      };
    }

    return engine.build({
      activity,
      target,
      lastResponse:
        latestInstructionalResponse()
    });
  }


  function renderDynamicSessionGuidance() {
    const guidance =
      buildDynamicSessionGuidance();

    const response =
      latestInstructionalResponse();

    const engine =
      window
        .FirstVoloDynamicSessionGuidance;

    const priorDifficulty =
      engine
        ?.normalizeDifficulty
        ? (
            engine.normalizeDifficulty(
              response?.difficultyType
            )
          )
        : (
            response?.difficultyType ||
            null
          );

    byId(
      "sessionEducatorDoes"
    ).textContent =
      guidance.educatorDoes ||
      "Allow an independent attempt before adding support.";

    byId(
      "sessionStudentDoes"
    ).textContent =
      guidance.studentDoes ||
      "Completes the morphology task as independently as possible.";

    byId(
      "printEducatorDoes"
    ).textContent =
      guidance.educatorDoes ||
      "";

    byId(
      "printStudentDoes"
    ).textContent =
      guidance.studentDoes ||
      "";

    const conditions =
      Array.isArray(
        guidance.conditionals
      )
        ? guidance.conditionals
        : [];

    const container =
      byId(
        "sessionConditionalGuidance"
      );

    if (!conditions.length) {
      container.innerHTML = `
        <div class="session-ifthen-empty">
          Begin without added support. If a barrier appears,
          identify the barrier before selecting a scaffold.
        </div>
      `;
    } else {
      container.innerHTML =
        conditions
          .map(
            item => {
              const isCurrent =
                item.difficulty ===
                priorDifficulty;

              const open =
                isCurrent ||
                item.difficulty ===
                  "fade";

              return `
                <details
                  class="session-ifthen-item${
                    isCurrent
                      ? " is-current"
                      : ""
                  }"
                  ${open ? "open" : ""}
                >
                  <summary>
                    <span>
                      If the student
                      ${esc(item.ifStudent)}…
                    </span>

                    ${
                      isCurrent
                        ? `
                          <strong class="session-current-barrier-badge">
                            Based on latest work
                          </strong>
                        `
                        : ""
                    }
                  </summary>

                  <div class="session-ifthen-body">
                    <strong>
                      Educator:
                    </strong>

                    <ul>
                      ${(item.educator || [])
                        .map(
                          step => `
                            <li>
                              ${esc(step)}
                            </li>
                          `
                        )
                        .join("")}
                    </ul>
                  </div>
                </details>
              `;
            }
          )
          .join("");
    }

    const preferredForPrint = [];

    const addPrintCondition = item => {
      if (
        item &&
        !preferredForPrint.some(
          existing =>
            existing.difficulty ===
            item.difficulty
        )
      ) {
        preferredForPrint.push(
          item
        );
      }
    };

    addPrintCondition(
      conditions.find(
        item =>
          item.difficulty ===
            "fade"
      )
    );

    addPrintCondition(
      conditions.find(
        item =>
          item.difficulty ===
            priorDifficulty
      )
    );

    if (
      !priorDifficulty ||
      priorDifficulty ===
        "independent"
    ) {
      addPrintCondition(
        conditions.find(
          item =>
            ![
              "directions",
              "decoding",
              "fade"
            ].includes(
              item.difficulty
            )
        )
      );
    }

    addPrintCondition(
      conditions.find(
        item =>
          item.difficulty ===
            "directions"
      )
    );

    addPrintCondition(
      conditions.find(
        item =>
          item.difficulty ===
            "decoding"
      )
    );

    const printConditions =
      preferredForPrint
        .slice(
          0,
          4
        );

    byId(
      "printSupportList"
    ).innerHTML =
      printConditions.length
        ? printConditions
            .map(
              item => `
                <li>
                  <strong>
                    If the student
                    ${esc(item.ifStudent)}:
                  </strong>

                  ${(item.educator || [])
                    .map(esc)
                    .join(" ")}
                </li>
              `
            )
            .join("")
        : `
            <li>
              Begin without added support.
              Identify the barrier before adding
              a scaffold.
            </li>
          `;
  }


  function allFamilies() {
    return (
      window
        .FirstVoloInstructionalMaterialFamilies
        ?.families ||
      {}
    );
  }


  function familyTiles(
    family
  ) {
    return [
      ...(family
        ?.tiles
        ?.prefixes || []),

      ...(family
        ?.tiles
        ?.centers || []),

      ...(family
        ?.tiles
        ?.suffixes || []),

      ...(family
        ?.tiles
        ?.extensions || [])
    ];
  }


  function familyCandidatesForTarget(
    target
  ) {
    if (!target?.label) {
      return [];
    }

    return Object.values(
      allFamilies()
    )
      .filter(
        family =>
          familyTiles(
            family
          ).some(
            tile =>
              labelsMatch(
                tile.label,
                target.label
              )
          )
      )
      .map(
        family =>
          family.family
      );
  }


  function familyFromLastWord(
    word,
    candidates
  ) {
    if (!word) {
      return null;
    }

    const wanted =
      normalize(word);

    const matches =
      candidates.filter(
        familyId =>
          (
            allFamilies()[
              familyId
            ]
              ?.sessionRecipes ||
            []
          ).some(
            recipe =>
              normalize(
                recipe.word
              ) === wanted
          )
      );

    return matches.length === 1
      ? matches[0]
      : null;
  }


  function rebuildMaterial() {
    const resolution =
      state.plan
        ?.targetResolution;

    const primary =
      resolution
        ?.primary;

    state.familyCandidates =
      familyCandidatesForTarget(
        primary
      );

    const inferredFromWord =
      familyFromLastWord(
        state.plan
          ?.lastWork
          ?.word,

        state.familyCandidates
      );

    const familyId =
      state.familyOverride ||
      inferredFromWord ||
      (
        state.familyCandidates
          .length === 1
          ? state
              .familyCandidates[0]
          : null
      );

    if (
      state.plan
        ?.sessionMaterial
        ?.ready
    ) {
      state.material =
        state.plan
          .sessionMaterial;

      return;
    }

    if (!familyId) {
      state.material =
        null;

      return;
    }

    const materialSpec =
      window
        .FirstVoloInstructionalMaterials
        ?.buildWordBuildingSpec?.({
          familyId,

          targetResolution:
            resolution
        });

    state.material =
      window
        .FirstVoloInstructionalMaterialResolver
        ?.resolve?.({
          targetResolution:
            resolution,

          sessionMinutes:
            state.minutes,

          activity:
            state.plan
              ?.teachPractice
              ?.activity ||
            state.plan
              ?.nextWork
              ?.activity ||
            "learn",

          materialSpec
        }) ||
      null;
  }


  const ACTIVITY_LABELS = Object.freeze({
    learn: "Learn",
    find: "Find",
    hunt: "Word Hunt",
    meaning: "Meaning",
    morpheme: "Word Part",
    break: "Break It Apart",
    infer: "Figure It Out",
    build: "Build Words",
    use: "Use It",
    change: "Change It"
  });


  function currentActivity() {
    return (
      state.material
        ?.activity ||
      state.plan
        ?.teachPractice
        ?.activity ||
      state.plan
        ?.nextWork
        ?.activity ||
      "learn"
    );
  }


  function currentActivityLabel() {
    return (
      ACTIVITY_LABELS[
        currentActivity()
      ] ||
      "Instructional Activity"
    );
  }


  function morphemeInventory() {
    return Array.isArray(
      window
        .FIRST_VOLO_MORPHEME_INVENTORY
    )
      ? window
          .FIRST_VOLO_MORPHEME_INVENTORY
      : [];
  }


  function teacherTargetMeta(
    targetId
  ) {
    return (
      morphemeInventory()
        .find(
          item =>
            String(item?.id || "") ===
            String(targetId || "")
        ) ||
      null
    );
  }


  function teacherTargetObject(
    targetId
  ) {
    const meta =
      teacherTargetMeta(
        targetId
      );

    if (!meta) {
      return null;
    }

    return {
      ...meta,
      id: meta.id,
      targetId: meta.id,
      morphemeId: meta.id,
      label: meta.label,
      name: meta.label,
      meaning: meta.meaning || null,
      type: meta.type || null,
      role: meta.type || "word part"
    };
  }


  function activeSessionSelection() {
    return (
      state.sessionSource ===
        "teacher-selected" &&
      state.teacherSelection
    )
      ? {
          source:
            "teacher-selected",
          targetId:
            state.teacherSelection
              .targetId,
          activity:
            state.teacherSelection
              .activity
        }
      : null;
  }


  function updateSessionSourceUrl() {
    const url =
      new URL(
        window.location.href
      );

    if (
      state.sessionSource ===
        "teacher-selected" &&
      state.teacherSelection
    ) {
      url.searchParams.set(
        "sessionSource",
        "teacher-selected"
      );
      url.searchParams.set(
        "teacherTarget",
        state.teacherSelection
          .targetId
      );
      url.searchParams.set(
        "teacherActivity",
        state.teacherSelection
          .activity
      );
    } else {
      url.searchParams.delete(
        "sessionSource"
      );
      url.searchParams.delete(
        "teacherTarget"
      );
      url.searchParams.delete(
        "teacherActivity"
      );
    }

    window.history
      .replaceState(
        {},
        "",
        url
      );
  }


  function teacherActivityApplicability(
    targetId,
    activity
  ) {
    const target =
      teacherTargetObject(
        targetId
      );

    if (!target) {
      return {
        applicable: false,
        reason:
          "Choose a valid word part first."
      };
    }

    const structural =
      window
        .FirstVoloInstructionalSessionPlanner
        ?.activityApplicability?.(
          target,
          activity
        ) ||
      {
        applicable: true,
        reason: null
      };

    if (structural?.applicable === false) {
      return structural;
    }

    /*
      Teacher-selected activity choices are revalidated against the actual
      system-generated teacher-led word universe. This is NOT a prebuilt-family
      gate: First Volo asks the shared item bank/selector to generate a real
      10-minute Part A + Apply sequence using the full validated inventory and
      teacher extensions. Only a genuine generation failure blocks the choice.
    */
    const bank =
      window
        .FirstVoloSessionItemBank;

    if (!bank?.buildItems) {
      return structural;
    }

    const recipes =
      bank.buildItems({
        targetResolution: {
          primary: target,
          allTargets: [target]
        },
        activity,
        gradeBand:
          readyCurrentBand() ||
          target.introBand ||
          null,
        vocabLevel:
          readyCurrentVocabLevel() ||
          null,
        limit: 2
      }) || [];

    const hasGuided =
      recipes.length > 0;

    const hasApply =
      recipes.some(
        recipe =>
          recipe?.applyKind &&
          recipe.applyKind !==
            "unavailable"
      );

    if (!hasGuided || !hasApply) {
      return {
        applicable: false,
        reason:
          `First Volo could not find enough suitable instructional words to build an accurate ${ACTIVITY_LABELS[activity] || activity} Part A + Apply sequence for this target. This is a linguistic-safety or coverage limit, not a missing reusable-material rule.`
      };
    }

    return {
      applicable: true,
      reason: null
    };
  }


  function renderTeacherUnavailableActivities() {
    const host =
      byId(
        "teacherUnavailableActivities"
      );

    const targetSelect =
      byId(
        "teacherTargetSelect"
      );

    if (!host || !targetSelect) {
      return;
    }

    const targetId =
      targetSelect.value;

    const unavailable =
      Object.keys(
        ACTIVITY_LABELS
      )
        .map(
          activity => ({
            activity,
            label:
              ACTIVITY_LABELS[
                activity
              ],
            result:
              teacherActivityApplicability(
                targetId,
                activity
              )
          })
        )
        .filter(
          item =>
            item.result
              ?.applicable ===
            false
        );

    if (!unavailable.length) {
      host.innerHTML =
        "";
      return;
    }

    if (
      unavailable.length ===
      Object.keys(
        ACTIVITY_LABELS
      ).length
    ) {
      host.innerHTML = `
        <strong>No teacher-selected activity is instructionally appropriate for this word part.</strong>
        These choices are blocked by explicit target/activity rules, not by the absence of a prebuilt material family.
      `;
      return;
    }

    host.innerHTML = `
      <details>
        <summary>
          ${unavailable.length} ${unavailable.length === 1 ? "activity is" : "activities are"} unavailable for this word part
        </summary>
        <ul>
          ${unavailable
            .map(
              item =>
                `<li><strong>${esc(item.label)}</strong> — ${esc(item.result.reason || "This activity is not instructionally appropriate for the selected target.")}</li>`
            )
            .join("")}
        </ul>
      </details>
    `;
  }


  function updateTeacherActivityOptions() {
    const targetSelect =
      byId(
        "teacherTargetSelect"
      );

    const activitySelect =
      byId(
        "teacherActivitySelect"
      );

    if (!targetSelect || !activitySelect) {
      return;
    }

    const targetId =
      targetSelect.value;

    let firstAvailable =
      null;

    [
      ...activitySelect.options
    ].forEach(
      option => {
        const result =
          teacherActivityApplicability(
            targetId,
            option.value
          );

        option.disabled =
          result
            ?.applicable ===
          false;

        option.title =
          option.disabled
            ? (
                result.reason ||
                "This activity is not appropriate for this target."
              )
            : "";

        if (
          !option.disabled &&
          !firstAvailable
        ) {
          firstAvailable =
            option.value;
        }
      }
    );

    const selected =
      activitySelect
        .selectedOptions[0];

    if (
      selected?.disabled &&
      firstAvailable
    ) {
      activitySelect.value =
        firstAvailable;
    }

    const buildButton =
      byId(
        "buildTeacherSelectedSessionButton"
      );

    if (buildButton) {
      buildButton.disabled =
        !firstAvailable;
      buildButton.setAttribute(
        "aria-disabled",
        String(
          !firstAvailable
        )
      );
    }

    renderTeacherUnavailableActivities();
  }


  function populateTeacherSessionControls() {
    const targetSelect =
      byId(
        "teacherTargetSelect"
      );

    const activitySelect =
      byId(
        "teacherActivitySelect"
      );

    if (!targetSelect || !activitySelect) {
      return;
    }

    if (!targetSelect.options.length) {
      const groupLabels = {
        prefix: "Prefixes",
        root: "Roots",
        suffix: "Suffixes"
      };

      [
        "prefix",
        "root",
        "suffix"
      ].forEach(
        type => {
          const group =
            document
              .createElement(
                "optgroup"
              );

          group.label =
            groupLabels[type];

          morphemeInventory()
            .filter(
              item =>
                item?.type === type
            )
            .forEach(
              item => {
                const option =
                  document
                    .createElement(
                      "option"
                    );

                option.value =
                  item.id;

                option.textContent =
                  `${item.label} — ${item.meaning || "meaning not listed"}`;

                group
                  .appendChild(
                    option
                  );
              }
            );

          targetSelect
            .appendChild(
              group
            );
        }
      );
    }

    if (!activitySelect.options.length) {
      Object.entries(
        ACTIVITY_LABELS
      ).forEach(
        ([activity, label]) => {
          const option =
            document
              .createElement(
                "option"
              );

          option.value =
            activity;
          option.textContent =
            label;

          activitySelect
            .appendChild(
              option
            );
        }
      );
    }

    const primaryId =
      state.teacherSelection
        ?.targetId ||
      state.plan
        ?.targetResolution
        ?.primary
        ?.id ||
      morphemeInventory()[0]
        ?.id ||
      "";

    const activity =
      state.teacherSelection
        ?.activity ||
      currentActivity();

    if (primaryId) {
      targetSelect.value =
        primaryId;
    }

    if (activity) {
      activitySelect.value =
        activity;
    }

    updateTeacherActivityOptions();
  }


  function renderSessionSource() {
    const eyebrow =
      byId(
        "sessionModeEyebrow"
      );

    const sourceLine =
      byId(
        "sessionSourceLine"
      );

    const recommendedButton =
      byId(
        "useRecommendedSessionButton"
      );

    const teacherSelected =
      state.sessionSource ===
        "teacher-selected";

    if (eyebrow) {
      eyebrow.textContent =
        teacherSelected
          ? "Teacher-selected session"
          : "Recommended session";
    }

    if (sourceLine) {
      sourceLine.textContent =
        teacherSelected
          ? (
              "Session source: Teacher selected · Opening this session has not replaced the adaptive recommendation."
            )
          : (
              "Session source: Recommended · First Volo selected this next step from the student's recent work."
            );
    }

    if (recommendedButton) {
      recommendedButton.disabled =
        !teacherSelected;
    }
  }


  function makeTasks(
    material,
    applyPlan = null
  ) {
    const recipes =
      material
        ?.recipes ||
      [];

    if (!recipes.length) {
      return [];
    }

    const activity =
      material?.activity ||
      currentActivity();

    const applyItem =
      applyPlan
        ?.item ||
      null;

    const applyWord =
      String(
        applyItem?.word || ""
      )
        .trim()
        .toLowerCase();

    let practiceRecipes =
      recipes.filter(
        recipe =>
          recipes.length === 1 ||
          String(
            recipe?.word || ""
          )
            .trim()
            .toLowerCase() !==
          applyWord
      );

    if (
      !practiceRecipes.length
    ) {
      practiceRecipes =
        recipes.slice(
          0,
          1
        );
    }

    const tasks =
      practiceRecipes.map(
        recipe => ({
          stage:
            "Teach / Practice",

          recipe,

          prompt:
            recipe.activityPrompt ||
            recipe.wordPrompt ||
            (
              activity === "build"
                ? `Build ${recipe.word} and explain the word parts.`
                : `Complete the ${currentActivityLabel()} task with ${recipe.word}.`
            ),

          teacherDirection:
            recipe.teacherDirection ||
            null,

          followUp:
            null
        })
      );

    if (applyItem) {
      tasks.push({
        stage:
          "Apply",

        recipe:
          applyItem,

        prompt:
          applyItem.prompt,

        teacherDirection:
          applyPlan
            ?.educatorDoes ||
          null,

        followUp:
          applyItem
            .followUpPrompt ||
          null
      });
    }

    return tasks;
  }

  function slotById(slotId) {
    return (
      state.material
        ?.slots
        ?.find(
          slot =>
            slot.id === slotId
        ) ||
      null
    );
  }


  function tileById(tileId) {
    return (
      state.digitalTiles
        .find(
          tile =>
            tile.id === tileId
        ) ||
      state.material
        ?.tiles
        ?.find(
          tile =>
            tile.id === tileId
        ) ||
      null
    );
  }


  function safeDigitalTiles() {
    const family =
      window
        .FirstVoloInstructionalMaterialFamilies
        ?.families
        ?.[
          state.material?.family
        ] ||
      null;

    if (!family) {
      return (
        state.material
          ?.tiles || []
      );
    }

    const protection =
      window
        .FirstVoloInstructionalMaterialResolver;

    const safeParts = [
      ...new Set(
        (
          family.sessionRecipes ||
          []
        )
          .filter(
            recipe =>
              !protection
                ?.isProtected?.(
                  recipe.word
                )
          )
          .flatMap(
            recipe =>
              recipe.parts || []
          )
      )
    ];

    const spec =
      window
        .FirstVoloInstructionalMaterials
        ?.buildWordBuildingSpec?.({
          familyId:
            family.family,

          targetResolution:
            state.plan
              ?.targetResolution
        });

    return (
      spec?.tiles || []
    ).filter(
      tile =>
        safeParts.some(
          part =>
            labelsMatch(
              tile.label,
              part
            )
        )
    );
  }


  function canPlace(
    tile,
    slot
  ) {
    return (
      tile &&
      slot &&
      Array.isArray(
        slot.accepts
      ) &&
      slot.accepts.includes(
        tile.role
      )
    );
  }


  function clearMat() {
    state.selectedTileId =
      null;

    state.draggedTileId =
      null;

    state.placed =
      {};

    byId(
      "buildFeedback"
    ).textContent =
      "";

    renderInteractiveMat();
    renderTileBank();
    renderWordSum();
  }


  function selectTile(
    tileId
  ) {
    const tile =
      tileById(
        tileId
      );

    if (!tile) {
      return;
    }

    const matchingSlots =
      (
        state.material
          ?.slots || []
      ).filter(
        slot =>
          canPlace(
            tile,
            slot
          )
      );

    if (
      matchingSlots.length === 1
    ) {
      placeTile(
        matchingSlots[0].id,
        tileId
      );

      return;
    }

    state.selectedTileId =
      state.selectedTileId ===
        tileId
        ? null
        : tileId;

    renderTileBank();
  }


  function placeTile(
    slotId,
    tileId
  ) {
    const slot =
      slotById(
        slotId
      );

    const tile =
      tileById(
        tileId
      );

    if (
      !canPlace(
        tile,
        slot
      )
    ) {
      return false;
    }

    for (
      const existingSlot
      of Object.keys(
        state.placed
      )
    ) {
      if (
        state.placed[
          existingSlot
        ] === tileId
      ) {
        delete state.placed[
          existingSlot
        ];
      }
    }

    state.placed[
      slotId
    ] = tileId;

    state.selectedTileId =
      null;

    byId(
      "buildFeedback"
    ).textContent =
      "";

    renderInteractiveMat();
    renderTileBank();
    renderWordSum();

    return true;
  }


  function removeTile(
    slotId
  ) {
    delete state.placed[
      slotId
    ];

    byId(
      "buildFeedback"
    ).textContent =
      "";

    renderInteractiveMat();
    renderTileBank();
    renderWordSum();
  }


  function tileContent(
    tile,
    {
      includeMeaning = false
    } = {}
  ) {
    const image =
      tile.image
        ? `
          <img
            src="${esc(tile.image)}"
            alt=""
          >
        `
        : "";

    return `
      ${image}

      <span class="material-tile-label">
        ${esc(tile.label)}
      </span>

      ${
        includeMeaning &&
        tile.meaning
          ? `
            <span class="material-tile-meaning">
              ${esc(tile.meaning)}
            </span>
          `
          : ""
      }
    `;
  }


  function renderInteractiveMat() {
    const mat =
      byId(
        "interactiveBuildMat"
      );

    mat.innerHTML =
      "";

    for (
      const slot
      of state.material
        ?.slots || []
    ) {
      const button =
        document.createElement(
          "button"
        );

      button.type =
        "button";

      button.className =
        "interactive-build-slot";

      button.dataset.slotId =
        slot.id;

      const tileId =
        state.placed[
          slot.id
        ];

      const tile =
        tileById(
          tileId
        );

      button.setAttribute(
        "aria-label",
        tile
          ? (
              `${slot.label}: ${tile.label}. ` +
              "Activate to remove."
            )
          : (
              `${slot.label}. ` +
              "Activate after selecting a tile."
            )
      );

      if (tile) {
        button.classList.add(
          "has-tile"
        );

        button.innerHTML = `
          <span class="interactive-slot-heading">
            ${esc(slot.label)}
          </span>

          <span class="interactive-slot-card">
            ${tileContent(
              tile,
              {
                includeMeaning:
                  state.showMeanings
              }
            )}
          </span>

          <span class="interactive-remove-hint">
            Remove
          </span>
        `;
      } else {
        button.innerHTML = `
          <span class="interactive-slot-heading">
            ${esc(slot.label)}
          </span>

          <span class="interactive-empty-hint">
            Place a tile here
          </span>
        `;
      }

      button.addEventListener(
        "click",
        () => {
          if (tile) {
            removeTile(
              slot.id
            );

            return;
          }

          if (
            state.selectedTileId
          ) {
            placeTile(
              slot.id,
              state.selectedTileId
            );
          }
        }
      );

      button.addEventListener(
        "dragover",
        event => {
          const dragged =
            tileById(
              state.draggedTileId
            );

          if (
            canPlace(
              dragged,
              slot
            )
          ) {
            event.preventDefault();

            button.classList.add(
              "is-drag-over"
            );
          }
        }
      );

      button.addEventListener(
        "dragleave",
        () => {
          button.classList.remove(
            "is-drag-over"
          );
        }
      );

      button.addEventListener(
        "drop",
        event => {
          event.preventDefault();

          button.classList.remove(
            "is-drag-over"
          );

          const draggedId =
            state.draggedTileId ||
            event.dataTransfer
              ?.getData(
                "text/plain"
              );

          if (draggedId) {
            placeTile(
              slot.id,
              draggedId
            );
          }

          state.draggedTileId =
            null;
        }
      );

      mat.append(
        button
      );
    }
  }


  function renderTileBank() {
    const bank =
      byId(
        "interactiveTileBank"
      );

    bank.innerHTML =
      "";

    for (
      const tile
      of state.digitalTiles
    ) {
      const button =
        document.createElement(
          "button"
        );

      button.type =
        "button";

      button.className =
        "interactive-material-tile";

      button.draggable =
        true;

      button.dataset.tileId =
        tile.id;

      const selected =
        state.selectedTileId ===
        tile.id;

      const used =
        Object.values(
          state.placed
        ).includes(
          tile.id
        );

      button.classList.toggle(
        "is-selected",
        selected
      );

      button.classList.toggle(
        "is-used",
        used
      );

      button.setAttribute(
        "aria-pressed",
        String(selected)
      );

      button.setAttribute(
        "aria-label",
        (
          `${tile.label}` +
          (
            state.showMeanings &&
            tile.meaning
              ? `, ${tile.meaning}`
              : ""
          )
        )
      );

      button.innerHTML =
        tileContent(
          tile,
          {
            includeMeaning:
              state.showMeanings
          }
        );

      button.addEventListener(
        "click",
        () => {
          selectTile(
            tile.id
          );
        }
      );

      button.addEventListener(
        "dragstart",
        event => {
          state.draggedTileId =
            tile.id;

          event.dataTransfer
            ?.setData(
              "text/plain",
              tile.id
            );
        }
      );

      button.addEventListener(
        "dragend",
        () => {
          state.draggedTileId =
            null;
        }
      );

      bank.append(
        button
      );
    }
  }


  function placedLabels() {
    return (
      state.material
        ?.slots || []
    )
      .map(
        slot =>
          tileById(
            state.placed[
              slot.id
            ]
          )
      )
      .filter(Boolean)
      .map(
        tile =>
          tile.label
      );
  }


  function renderWordSum() {
    const parts =
      placedLabels();

    byId(
      "interactiveWordSum"
    ).textContent =
      parts.length
        ? (
            "Word sum: " +
            parts.join(
              " + "
            )
          )
        : "Word sum:";
  }


  function buildMatchesRecipe(
    recipe
  ) {
    const actual =
      placedLabels();

    const expected =
      Array.isArray(
        recipe?.parts
      )
        ? recipe.parts
        : [];

    if (
      actual.length !==
      expected.length
    ) {
      return false;
    }

    return expected.every(
      (part, index) =>
        labelsMatch(
          actual[index],
          part
        )
    );
  }


  function checkBuild() {
    const task =
      state.tasks[
        state.taskIndex
      ];

    const feedback =
      byId(
        "buildFeedback"
      );

    if (!task?.recipe) {
      feedback.textContent =
        "No build is available for this prompt.";

      return;
    }

    if (
      buildMatchesRecipe(
        task.recipe
      )
    ) {
      feedback.className =
        "session-build-feedback is-correct";

      feedback.textContent =
        (
          `✓ Yes — ${task.recipe.word}.` +
          (
            task.stage === "Apply" &&
            task.followUp
              ? ` ${task.followUp}`
              : ""
          )
        );

      /*
        Pronounce the completed word only AFTER
        the student has built it correctly.
      */
      speakText(
        task.recipe.word
      );

      return;
    }

    feedback.className =
      "session-build-feedback is-retry";

    feedback.textContent =
      "Not yet. Check the meaningful parts and try again.";
  }


  function ensurePromptEducatorKey() {
    let key =
      byId(
        "sessionPromptEducatorKey"
      );

    if (key) {
      return key;
    }

    const currentTask =
      document.querySelector(
        ".session-current-task"
      );

    if (!currentTask) {
      return null;
    }

    key =
      document.createElement(
        "details"
      );

    key.id =
      "sessionPromptEducatorKey";

    key.className =
      "session-prompt-educator-key";

    key.innerHTML = `

      <summary>
        What to listen for
      </summary>
      <div data-educator-key-content></div>
    `;

    currentTask.append(
      key
    );

    return key;
  }


  function setTaskDisplayMode(task) {
    const buildMode =
      task?.mode === "build";

    const ids = [
      "interactiveBuildMat",
      "interactiveWordSum",
      "checkBuildButton",
      "toggleMeaningsButton",
      "clearMatButton"
    ];

    ids.forEach(id => {
      const element =
        byId(id);

      if (element) {
        element.hidden =
          !buildMode;
      }
    });

    [
      ".session-interaction-help-row",
      ".session-check-row",
      ".interactive-tile-area"
    ].forEach(selector => {
      const element =
        document.querySelector(
          selector
        );

      if (element) {
        element.hidden =
          !buildMode;
      }
    });

    const key =
      ensurePromptEducatorKey();

    if (key) {
      /*
        The legacy generic Educator key sat above the student's response and
        exposed implementation scaffolding (for example, "Open response. Use
        the educator key..."). Item-specific review criteria now live with
        the ready-to-use task, after the response opportunity.
      */
      key.hidden = true;
    }

    byId(
      "digitalMaterialTitle"
    ).textContent =
      buildMode
        ? (
            state.material
              ?.family
              ? `${state.material.family} Word Building`
              : "Word Building"
          )
        : (
            state.plan
              ?.teachPractice
              ?.activityLabel ||
            "Teacher-Led Practice"
          );
  }



  /* FIRST_VOLO_READY_MATERIALS_V1
     A ready-to-use material means the educator can open this page and teach
     without writing a word, inventing a card, drawing a boundary task, or
     locating a separate support visual.
  */

  const READY_ACTIVITY_LABELS = Object.freeze({
    learn: "Learn",
    find: "Find",
    hunt: "Word Hunt",
    meaning: "Meaning",
    morpheme: "Word Part",
    break: "Break It Apart",
    infer: "Figure It Out",
    build: "Build Words",
    use: "Use It",
    change: "Change It"
  });


  function readyActivity(task) {
    const raw =
      task?.activity ||
      task?.recipe?.activity ||
      (
        task?.stage === "Apply"
          ? (
              state.plan
                ?.teachPractice
                ?.activity ||
              state.plan
                ?.nextWork
                ?.activity
            )
          : null
      ) ||
      state.plan
        ?.teachPractice
        ?.activity ||
      state.plan
        ?.nextWork
        ?.activity ||
      state.plan
        ?.lastWork
        ?.activity ||
      "learn";

    const value =
      String(raw || "")
        .trim()
        .toLowerCase();

    const aliases = {
      wordpart: "morpheme",
      "word-part": "morpheme",
      "word part": "morpheme",
      figure: "infer",
      "figure-it-out": "infer",
      "figure it out": "infer",
      "break-it-apart": "break",
      "break it apart": "break",
      buildwords: "build",
      "build-words": "build",
      "build words": "build",
      wordhunt: "hunt",
      "word-hunt": "hunt",
      "word hunt": "hunt",
      useit: "use",
      "use-it": "use",
      "use it": "use",
      changeit: "change",
      "change-it": "change",
      "change it": "change"
    };

    return aliases[value] || value;
  }


  function readyTarget() {
    return (
      state.plan
        ?.targetResolution
        ?.primary ||
      state.plan
        ?.teachPractice
        ?.target ||
      state.plan
        ?.nextWork
        ?.target ||
      state.plan
        ?.lastWork
        ?.target ||
      null
    );
  }


  function readyTargetLabel() {
    return (
      readyTarget()?.label ||
      readyTarget()?.target ||
      "the target word part"
    );
  }


  function readyTargetMeaning() {
    return (
      readyTarget()?.meaning ||
      state.plan
        ?.teachPractice
        ?.target
        ?.meaning ||
      ""
    );
  }


  function readyWord(task) {
    const recipe =
      task?.recipe ||
      {};

    return String(
      recipe.word ||
      task?.word ||
      recipe.wholeWord ||
      recipe.exampleWord ||
      task?.applyWord ||
      ""
    ).trim();
  }


  function readyContext(task) {
    const recipe =
      task?.recipe ||
      {};

    return String(
      recipe.context ||
      recipe.sentence ||
      recipe.contextSentence ||
      task?.context ||
      task?.sentence ||
      ""
    ).trim();
  }


  function readyText(value) {
    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      return String(value).trim();
    }

    if (
      value &&
      typeof value === "object"
    ) {
      return String(
        value.word ||
        value.label ||
        value.text ||
        value.value ||
        value.answer ||
        ""
      ).trim();
    }

    return "";
  }


  function readyList(value) {
    return (
      Array.isArray(value)
        ? value
        : []
    )
      .map(readyText)
      .filter(Boolean);
  }


  function readyChoices(task) {
    const recipe =
      task?.recipe ||
      {};

    const keys = [
      "choices",
      "options",
      "answers",
      "responseChoices",
      "meaningChoices"
    ];

    for (const key of keys) {
      const values =
        readyList(
          recipe[key] ||
          task?.[key]
        );

      if (values.length) {
        return values;
      }
    }

    return [];
  }


  function readyWordSet(task) {
    const recipe =
      task?.recipe ||
      {};

    const keys = [
      "words",
      "wordSet",
      "huntWords",
      "options",
      "choices",
      "items",
      "contrastWords",
      "distractors"
    ];

    const values = [];

    for (const key of keys) {
      values.push(
        ...readyList(
          recipe[key] ||
          task?.[key]
        )
      );
    }

    const ownWord =
      readyWord(task);

    if (ownWord) {
      values.unshift(
        ownWord
      );
    }

    return [
      ...new Set(values)
    ];
  }


  function readyTargetVariants() {
    return variants(
      readyTargetLabel()
    )
      .map(
        value =>
          String(value || "")
            .toLowerCase()
            .replace(
              /[^a-z]/g,
              ""
            )
      )
      .filter(Boolean);
  }


  function readyWordLetters(word) {
    return String(word || "")
      .split("");
  }


  function readyCleanPart(part) {
    return String(part || "")
      .toLowerCase()
      .replace(
        /[^a-z]/g,
        ""
      );
  }
function readyMaterialTilePool() {
    const values = [
      ...(state.material
        ?.tiles || []),
      ...(state.digitalTiles || [])
    ];

    const families =
      allFamilies();

    for (
      const familyId
      of state.familyCandidates || []
    ) {
      const family =
        families?.[
          familyId
        ];

      if (family) {
        values.push(
          ...familyTiles(
            family
          )
        );
      }
    }

    const seen =
      new Set();

    return values.filter(
      tile => {
        const key =
          `${tile?.label || ""}|${tile?.image || ""}`;

        if (
          !tile ||
          seen.has(key)
        ) {
          return false;
        }

        seen.add(key);

        return true;
      }
    );
  }
function ensureReadyMaterialContainer() {
    let container =
      byId(
        "readyStudentMaterial"
      );

    if (container) {
      return container;
    }

    container =
      document.createElement(
        "section"
      );

    container.id =
      "readyStudentMaterial";

    container.className =
      "ready-material-shell";

    const help =
      document.querySelector(
        ".session-interaction-help-row"
      );

    const currentTask =
      document.querySelector(
        ".session-current-task"
      );

    if (
      help?.parentElement
    ) {
      help.parentElement
        .insertBefore(
          container,
          help
        );
    } else if (
      currentTask?.parentElement
    ) {
      currentTask
        .insertAdjacentElement(
          "afterend",
          container
        );
    }

    return container;
  }
  function readyEducatorKeyMarkup(task) {
    const wordSum =
      readyExpectedWordSum(
        task
      );

    if (!wordSum) {
      return "";
    }

    return `
      <details class="ready-educator-key">

        <summary>
          Answer
        </summary>

        <p>
          ${esc(wordSum)}
        </p>
      </details>
    `;
  }


  function readyBigWordMarkup(word) {
    return `
      <div
        class="ready-big-word"
        aria-label="${esc(word)}"
      >
        ${esc(word)}
      </div>
    `;
  }


  function renderReadyFind(
    container,
    task
  ) {
    const word =
      readyWord(task);

    const letters =
      readyWordLetters(
        word
      );

    container.innerHTML = `
      <div class="ready-material-heading">
        <span>
          Ready-to-use student material
        </span>

        <h3>
          Find
        </h3>

        <p>
          Click the letters that make the target word part
          <strong>${esc(readyTargetLabel())}</strong>.
        </p>
      </div>

      <div
        class="ready-letter-word"
        id="readyFindWord"
        aria-label="${esc(word)}"
      >
        ${letters
          .map(
            (letter, index) => `
              <button
                type="button"
                class="ready-letter-button"
                data-ready-letter-index="${index}"
                aria-pressed="false"
              >
                ${esc(letter)}
              </button>
            `
          )
          .join("")}
      </div>

      <div class="ready-check-row">
        <button
          type="button"
          class="session-primary-button"
          id="readyCheckFind"
        >
          Check Find
        </button>

        <span
          id="readyFindFeedback"
          aria-live="polite"
        ></span>
      </div>

      ${readySupportDetailsMarkup()}
    `;

    const selected =
      new Set();

    container
      .querySelectorAll(
        "[data-ready-letter-index]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              const index =
                Number(
                  button.dataset
                    .readyLetterIndex
                );

              if (
                selected.has(index)
              ) {
                selected.delete(
                  index
                );
              } else {
                selected.add(
                  index
                );
              }

              const isSelected =
                selected.has(index);

              button.classList
                .toggle(
                  "is-selected",
                  isSelected
                );

              button.setAttribute(
                "aria-pressed",
                String(
                  isSelected
                )
              );
            }
          );
        }
      );

    byId(
      "readyCheckFind"
    )?.addEventListener(
      "click",
      () => {
        const value =
          [
            ...selected
          ]
            .sort(
              (a, b) =>
                a - b
            )
            .map(
              index =>
                letters[index]
            )
            .join("")
            .toLowerCase()
            .replace(
              /[^a-z]/g,
              ""
            );

        const feedback =
          byId(
            "readyFindFeedback"
          );

        if (!value) {
          feedback.textContent =
            "Mark the target word part first.";

          return;
        }

        const correct =
          readyTargetVariants()
            .includes(value);

        feedback.textContent =
          correct
            ? "✓ Yes."
            : "Not yet. Look again at the target word part.";
      }
    );
  }
  function renderReadyHunt(
    container,
    task
  ) {
    const words =
      readyWordSet(
        task
      );

    if (
      words.length <= 1
    ) {
      const word =
        words[0] ||
        readyWord(task);

      container.innerHTML = `
        <div class="ready-material-heading">
          <span>
            Ready-to-use student material
          </span>

          <h3>
            Word Hunt
          </h3>

          <p>
            Decide whether this intact word contains
            <strong>${esc(readyTargetLabel())}</strong>.
          </p>
        </div>

        ${readyBigWordMarkup(word)}

        <div class="ready-choice-row">
          <button
            type="button"
            class="ready-choice-button"
          >
            Contains the target
          </button>

          <button
            type="button"
            class="ready-choice-button"
          >
            Does not contain the target
          </button>
        </div>

        ${readySupportDetailsMarkup()}
      `;

      return;
    }

    container.innerHTML = `
      <div class="ready-material-heading">
        <span>
          Ready-to-use student material
        </span>

        <h3>
          Word Hunt
        </h3>

        <p>
          Select every intact word that contains
          <strong>${esc(readyTargetLabel())}</strong>.
        </p>
      </div>

      <div class="ready-hunt-grid">
        ${words
          .map(
            word => `
              <button
                type="button"
                class="ready-hunt-word"
                aria-pressed="false"
              >
                ${esc(word)}
              </button>
            `
          )
          .join("")}
      </div>

      ${readySupportDetailsMarkup()}
    `;

    container
      .querySelectorAll(
        ".ready-hunt-word"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              const selected =
                button.getAttribute(
                  "aria-pressed"
                ) !== "true";

              button.setAttribute(
                "aria-pressed",
                String(selected)
              );

              button.classList
                .toggle(
                  "is-selected",
                  selected
                );
            }
          );
        }
      );
  }


  function renderReadyLearn(
    container,
    task
  ) {
    const word =
      readyWord(task);

    container.innerHTML = `
      <div class="ready-material-heading">
        <span>
          Ready-to-use student material
        </span>

        <h3>
          Learn
        </h3>

        <p>
          Connect the target with its meaning and a whole-word example.
        </p>
      </div>

      <div class="ready-learn-grid">
        ${readyTileMarkup(
          readySupportTile(),
          {
            includeMeaning: true
          }
        )}

        ${
          word
            ? `
              <div class="ready-example-card">
                <span>
                  Example word
                </span>

                ${readyBigWordMarkup(word)}
              </div>
            `
            : ""
        }
      </div>

      ${readyV7ActivitySupportMarkup(
        "learn",
        task
      )}
    `;
  }


  function renderReadyMeaning(
    container,
    task
  ) {
    const choices =
      readyChoices(
        task
      );

    const word =
      readyWord(
        task
      );

    const generatedPrompt =
      String(
        task?.prompt ||
        task?.recipe?.activityPrompt ||
        task?.recipe?.wordPrompt ||
        ""
      ).trim();

    const prompt =
      generatedPrompt ||
      (
        word
          ? (
              `What does ${readyTargetLabel()} mean? ` +
              `How does that meaning contribute to ${word}?`
            )
          : `What does ${readyTargetLabel()} mean?`
      );

    container.innerHTML = `
      <div class="ready-material-heading">
        <span>
          Ready-to-use student material
        </span>

        <h3>
          Meaning
        </h3>

        <p>
          ${esc(prompt)}
        </p>
      </div>

      <div class="ready-big-target">
        ${esc(readyTargetLabel())}
      </div>

      ${
        word
          ? readyBigWordMarkup(
              word
            )
          : ""
      }

      ${
        choices.length
          ? `
            <div class="ready-choice-grid">
              ${choices
                .map(
                  choice => `
                    <button
                      type="button"
                      class="ready-choice-button"
                    >
                      ${esc(choice)}
                    </button>
                  `
                )
                .join("")}
            </div>
          `
          : `
            <label class="ready-response-label">
              Student response
              <textarea
                class="ready-response-textarea"
                rows="2"
              ></textarea>
            </label>
          `
      }

      ${readySupportDetailsMarkup()}
    `;
  }


  function renderReadyMorphemeLegacy(
    container,
    task
  ) {
    const meaning =
      readyTargetMeaning() ||
      task?.recipe?.meaning ||
      task?.meaning ||
      "Use the meaning in the prompt.";

    const choices =
      readyChoices(
        task
      );

    container.innerHTML = `
      <div class="ready-material-heading">
        <span>
          Ready-to-use student material
        </span>

        <h3>
          Word Part
        </h3>

        <p>
          Which word part matches this meaning?
        </p>
      </div>

      <div class="ready-big-meaning">
        ${esc(meaning)}
      </div>

      ${
        choices.length
          ? `
            <div class="ready-choice-grid">
              ${choices
                .map(
                  choice => `
                    <button
                      type="button"
                      class="ready-choice-button"
                    >
                      ${esc(choice)}
                    </button>
                  `
                )
                .join("")}
            </div>
          `
          : `
            <label class="ready-response-label">
              Word part
              <input
                type="text"
                class="ready-response-input"
                autocomplete="off"
              >
            </label>
          `
      }

      ${readySupportDetailsMarkup()}
    `;
  }


  /* FIRST_VOLO_RICH_WORD_PART_UI_V1 */

  function readyWordPartInstructionEngine() {
    return (
      window
        .FirstVoloWordPartInstruction ||
      null
    );
  }


  function readyWordPartPartATasks() {
    return (
      state.tasks || []
    ).filter(
      item =>
        readyActivity(
          item
        ) ===
          "morpheme" &&
        item?.stage !==
          "Apply"
    );
  }


  function readyWordPartSpecFor(
    task
  ) {
    if (
      readyActivity(task) !==
        "morpheme" ||
      task?.stage ===
        "Apply"
    ) {
      return null;
    }

    const engine =
      readyWordPartInstructionEngine();

    if (
      !engine
        ?.buildPartASpec
    ) {
      return null;
    }

    const tasks =
      readyWordPartPartATasks();

    const index =
      tasks.indexOf(task);

    return (
      engine.buildPartASpec({
        target:
          readyTarget(),
        task,
        index:
          index >= 0
            ? index
            : 0,
        total:
          Math.max(
            1,
            tasks.length
          ),
        allTasks:
          tasks
      }) ||
      null
    );
  }


  function readyWordPartResponseMarkup(
    spec
  ) {
    if (
      spec?.responseType ===
        "choice" &&
      Array.isArray(
        spec?.choices
      ) &&
      spec.choices.length
    ) {
      return `
        <div
          class="ready-choice-grid"
          data-rich-word-part-choices
        >
          ${spec.choices
            .map(
              choice => `
                <button
                  type="button"
                  class="ready-choice-button"
                  data-rich-word-part-choice="${esc(choice)}"
                  aria-pressed="false"
                >
                  ${esc(choice)}
                </button>
              `
            )
            .join("")}
        </div>
      `;
    }

    return `
      <label class="ready-response-label">
        ${esc(
          spec?.responseLabel ||
          "What do you notice?"
        )}

        <textarea
          class="ready-response-textarea"
          rows="2"
          data-rich-word-part-response
        ></textarea>
      </label>
    `;
  }


  function readyWordPartExplanationMarkup(
    spec
  ) {
    const lines =
      Array.isArray(
        spec?.explanation
      )
        ? spec.explanation
            .filter(Boolean)
        : [];

    if (!lines.length) {
      return "";
    }

    return `
      <details class="ready-support-panel ready-word-part-explanation">
        <summary>
          Educator: show explanation after the student's attempt
        </summary>

        <div class="ready-support-panel-body">
          ${lines
            .map(
              line => `
                <p>
                  ${esc(line)}
                </p>
              `
            )
            .join("")}
        </div>
      </details>
    `;
  }


  /* FIRST_VOLO_WORD_PART_DEMAND_SUPPORT_UI_V1 */

  function readyWordPartSupportMarkup(
    spec
  ) {
    const lines =
      Array.isArray(
        spec?.support
      )
        ? spec.support
            .filter(Boolean)
        : [];

    if (!lines.length) {
      return "";
    }

    return `
      <details class="ready-support-panel ready-word-part-demand-support">
        <summary>
          Support for this ${esc(spec?.moveLabel || "Word Part")} demand if needed
        </summary>

        <div class="ready-support-panel-body">
          <p>
            Independent attempt first. Use the least support that matches
            this demand, retry the same question, then fade.
          </p>

          <ol>
            ${lines
              .map(
                line => `
                  <li>
                    ${esc(line)}
                  </li>
                `
              )
              .join("")}
          </ol>
        </div>
      </details>
    `;
  }


  function readyWordPartPatternBridgesMarkup(
    spec
  ) {
    const bridges =
      Array.isArray(
        spec?.patternBridges
      )
        ? spec.patternBridges
            .filter(
              bridge =>
                bridge?.word
            )
        : [];

    if (!bridges.length) {
      return "";
    }

    return `
      <div class="ready-word-part-pattern-bridges">
        ${bridges
          .map(
            bridge => `
              <div class="ready-context-card ready-word-part-pattern-bridge">
                <strong>${esc(bridge.word)}</strong>
                ${
                  bridge.definition
                    ? `<span> — ${esc(bridge.definition)}</span>`
                    : ""
                }
                ${
                  bridge.support?.label &&
                  bridge.support?.meaning
                    ? `
                      <div class="ready-small-note">
                        ${esc(bridge.support.label)} can mean
                        <strong>${esc(bridge.support.meaning)}</strong>.
                      </div>
                    `
                    : ""
                }
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }


  function readyWordPartStep5AnchorTask() {
    const tasks =
      readyWordPartPartATasks();

    if (!tasks.length) {
      return null;
    }

    const target =
      readyTargetMorphemeMeta();

    const targetId =
      target?.id ||
      readyTarget()?.id ||
      "";

    if (
      targetId === "ive" ||
      readyLettersOnly(
        readyTargetLabel()
      ) === "ive"
    ) {
      const active =
        tasks.find(
          task =>
            readyLettersOnly(
              readyWord(task)
            ) === "active"
        );

      if (active) {
        return active;
      }
    }

    return (
      tasks.find(
        task =>
          Boolean(
            readyWord(task)
          )
      ) ||
      tasks[0] ||
      null
    );
  }


  function readyWordPartStep5Distractors(
    count = 3
  ) {
    const target =
      readyTargetMorphemeMeta();

    const targetMeaning =
      String(
        target?.meaning ||
        readyTargetMeaning() ||
        ""
      )
        .trim()
        .toLowerCase();

    return readyMorphemeDistractors(
      Math.max(
        12,
        Number(count) || 3
      )
    )
      .filter(
        item => {
          const itemMeaning =
            String(
              item?.meaning ||
              ""
            )
              .trim()
              .toLowerCase();

          return (
            !targetMeaning ||
            !itemMeaning ||
            itemMeaning !==
              targetMeaning
          );
        }
      )
      .slice(
        0,
        Math.max(
          0,
          Number(count) || 3
        )
      );
  }


  function readyWordPartStep5SupportMarkup(
    spec
  ) {
    const lines =
      Array.isArray(
        spec?.support
      )
        ? spec.support
            .filter(Boolean)
        : [];

    if (!lines.length) {
      return "";
    }

    const label =
      spec?.demand ===
        "recall"
        ? "Support for independent recall if needed"
        : "Support for recognition if needed";

    return `
      <details class="ready-support-panel ready-word-part-step5-support">
        <summary>
          ${esc(label)}
        </summary>

        <div class="ready-support-panel-body">
          <ol>
            ${lines
              .map(
                line => `
                  <li>
                    ${esc(line)}
                  </li>
                `
              )
              .join("")}
          </ol>
        </div>
      </details>
    `;
  }


  /* FIRST_VOLO_WORD_PART_FAMILY_CONTRAST_UI_V1 */

  function readyWordPartFamilyContrastEngine() {
    return window.FirstVoloWordPartFamilyContrast || null;
  }


  function readyWordPartFamilyContrastSpec() {
    const engine = readyWordPartFamilyContrastEngine();

    if (!engine?.select) {
      return null;
    }

    const words = readyWordPartPartATasks()
      .map(task => readyWord(task))
      .filter(Boolean);

    return engine.select({
      target: readyTarget(),
      words,
      minutes: readyV13DurationMinutes()
    });
  }


  function readyWordPartFamilyChoiceMarkup(choice, familyId) {
    return `
      <label class="ready-choice-button ready-family-choice">
        <input
          type="radio"
          name="ready-family-${esc(familyId)}"
          value="${esc(choice.word)}"
        >
        <span>${esc(choice.word)}</span>
      </label>
    `;
  }


  function readyWordPartFamilyContrastMarkup(task, spec) {
    if (spec?.move !== "pattern") {
      return "";
    }

    const family = readyWordPartFamilyContrastSpec();

    if (!family) {
      return "";
    }

    return `
      <details class="ready-word-part-family-contrast">
        <summary>Optional · Compare the family</summary>

        <div class="ready-family-contrast-body">
          <span class="session-eyebrow">Time permitting · unscored</span>

          <h3>${esc(family.title)}</h3>

          <p>
            These words belong to the same word family, but their
            different endings help them do different jobs.
          </p>

          <p class="ready-family-question">
            <strong>${esc(family.prompt)}</strong>
          </p>

          <div class="ready-choice-grid ready-family-choice-grid">
            ${family.choices
              .map(choice => readyWordPartFamilyChoiceMarkup(choice, family.id))
              .join("")}
          </div>

          <label class="ready-response-label">
            ${esc(family.followUp)}
            <textarea class="ready-response-textarea" rows="2"></textarea>
          </label>

          <details class="ready-support-panel">
            <summary>Support if needed after the independent attempt</summary>
            <div class="ready-support-panel-body">
              <ol>
                ${family.support
                  .map(line => `<li>${esc(line)}</li>`)
                  .join("")}
              </ol>
            </div>
          </details>

          <details class="ready-educator-key">
            <summary>
              Educator: show the family jobs after the student's choice
            </summary>

            ${family.explanation
              .map(line => `<p>${esc(line)}</p>`)
              .join("")}

            <ul>
              ${family.choices
                .map(
                  choice => `
                    <li>
                      <strong>${esc(choice.word)} (${esc(choice.suffix)})</strong>
                      — ${esc(choice.job)}
                    </li>
                  `
                )
                .join("")}
            </ul>
          </details>
        </div>
      </details>
    `;
  }


  function readyPrintableFamilyContrastMarkup() {
    const family = readyWordPartFamilyContrastSpec();

    if (!family) {
      return "";
    }

    return `
      <section class="print-ready-task print-ready-family-contrast">
        <div class="print-ready-task-heading">
          <span>Optional · Time permitting · Unscored</span>
          <h2>Compare the family</h2>
          <p>${esc(family.title)}</p>
        </div>

        <p><strong>${esc(family.prompt)}</strong></p>

        <div class="print-ready-word-grid">
          ${family.choices
            .map(choice => `<span>○ ${esc(choice.word)}</span>`)
            .join("")}
        </div>

        <p>${esc(family.followUp)}</p>
        <div class="print-ready-lines"></div>
      </section>
    `;
  }


  function renderReadyMorpheme(
    container,
    task
  ) {
    if (
      task?.stage ===
        "Apply"
    ) {
      const meaning =
        readyTargetMeaning() ||
        task?.recipe?.meaning ||
        task?.meaning ||
        "the target meaning";

      const target =
        readyTargetLabel();

      const word =
        readyWord(task);

      const definition =
        task?.recipe?.definition ||
        task?.definition ||
        null;

      container.innerHTML = `
        <div class="ready-material-heading">
          <span>
            Ready-to-use student material
          </span>

          <h3>
            Word Part
          </h3>

          <p>
            First retrieve the word part from its meaning. Do not preview the fresh word.
          </p>
        </div>

        <div class="ready-big-meaning">
          ${esc(meaning)}
        </div>

        <label class="ready-response-label">
          Word part
          <input
            type="text"
            class="ready-response-input"
            autocomplete="off"
          >
        </label>

        ${readySupportDetailsMarkup()}

        ${
          word
            ? `
              <details class="ready-support-panel ready-word-part-apply-reveal">
                <summary>
                  After the student responds: reveal the fresh word
                </summary>

                <div class="ready-support-panel-body">
                  ${readyBigWordMarkup(word)}

                  <p class="ready-practice-cue">
                    <strong>
                      Find ${esc(target)} in ${esc(word)}. What does ${esc(target)} contribute to the meaning of the whole word?
                    </strong>
                  </p>

                  <label class="ready-response-label">
                    Meaning connection
                    <textarea
                      class="ready-response-textarea"
                      rows="2"
                    ></textarea>
                  </label>

                  <details class="ready-support-panel ready-word-part-fresh-support">
                    <summary>
                      Support for the fresh word if needed
                    </summary>

                    <div class="ready-support-panel-body">
                      ${
                        definition
                          ? `
                            <p>
                              If the whole-word meaning is the barrier, you may supply:
                              <strong>${esc(word)}</strong> means ${esc(definition)}.
                              Then retry the target-meaning connection.
                            </p>
                          `
                          : ""
                      }

                      ${readyTaskNonTargetSupportMarkup(task)}
                      ${readyTaskTeachingAccessMarkup(task, "morpheme")}

                      <p>
                        Do not give the target meaning or identify the target for the student before retrying.
                      </p>
                    </div>
                  </details>
                </div>
              </details>
            `
            : `
              <div class="ready-part-b-unavailable">
                <strong>
                  No system-selected fresh Word Part example is available today.
                </strong>
                <p>
                  Do not substitute an unplanned word. Continue to Check Transfer.
                </p>
              </div>
            `
        }
      `;

      return;
    }

    const spec =
      readyWordPartSpecFor(
        task
      );

    if (!spec) {
      renderReadyMorphemeLegacy(
        container,
        task
      );

      return;
    }

    const patternWords =
      Array.isArray(
        spec.patternWords
      )
        ? spec.patternWords
            .filter(Boolean)
        : [];

    container.innerHTML = `
      <div class="ready-material-heading">
        <span>
          Ready-to-use student material
        </span>

        <h3>
          Word Part
        </h3>

        <p class="ready-word-part-move">
          <strong>
            ${esc(spec.moveLabel)}
            ${
              spec.word &&
              spec.move !==
                "pattern"
                ? ` · ${esc(spec.word)}`
                : ""
            }
          </strong>
        </p>
      </div>

      ${
        spec.context
          ? `
            <div class="ready-context-card ready-word-part-context">
              ${esc(spec.context)}
            </div>
          `
          : ""
      }

      ${
        spec.structure
          ? `
            <div class="ready-big-meaning ready-word-part-structure">
              ${esc(spec.structure)}
            </div>
          `
          : ""
      }

      ${
        patternWords.length
          ? `
            <div class="ready-practice-cue ready-word-part-pattern">
              <strong>
                ${patternWords
                  .map(esc)
                  .join(" · ")}
              </strong>
            </div>
          `
          : ""
      }

      ${readyWordPartPatternBridgesMarkup(
        spec
      )}

      <p class="ready-practice-cue ready-word-part-question">
        <strong>
          ${esc(spec.prompt)}
        </strong>
      </p>

      ${readyWordPartResponseMarkup(
        spec
      )}

      ${readyWordPartExplanationMarkup(
        spec
      )}

      ${readyWordPartSupportMarkup(
        spec
      )}
      ${readyTaskTeachingAccessMarkup(task, "morpheme")}
      ${readyWordPartFamilyContrastMarkup(
        task,
        spec
      )}
    `;

    container
      .querySelectorAll(
        "[data-rich-word-part-choice]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              container
                .querySelectorAll(
                  "[data-rich-word-part-choice]"
                )
                .forEach(
                  other => {
                    other.setAttribute(
                      "aria-pressed",
                      "false"
                    );

                    other.classList
                      .remove(
                        "is-selected"
                      );
                  }
                );

              button.setAttribute(
                "aria-pressed",
                "true"
              );

              button.classList
                .add(
                  "is-selected"
                );
            }
          );
        }
      );
  }

  function renderReadyInfer(
    container,
    task
  ) {
    const word =
      readyWord(task);

    const context =
      readyContext(task);

    container.innerHTML = `
      <div class="ready-material-heading">
        <span>
          Ready-to-use student material
        </span>

        <h3>
          Figure It Out
        </h3>

        <p>
          Use the known morphology to infer the unfamiliar whole word.
        </p>
      </div>

      ${readyBigWordMarkup(word)}

      ${
        context
          ? `
            <p class="ready-context-sentence">
              ${esc(context)}
            </p>
          `
          : ""
      }

      <label class="ready-response-label">
        What do you think the whole word means?
        <textarea
          class="ready-response-textarea"
          rows="3"
        ></textarea>
      </label>

      <label class="ready-response-label">
        How did the known word part help?
        <textarea
          class="ready-response-textarea"
          rows="3"
        ></textarea>
      </label>

      ${readySupportDetailsMarkup()}
    `;
  }


  function renderReadyUse(
    container,
    task
  ) {
    const word =
      readyWord(task);

    const context =
      readyContext(task);

    container.innerHTML = `
      <div class="ready-material-heading">
        <span>
          Ready-to-use student material
        </span>

        <h3>
          Use It
        </h3>

        <p>
          Complete the actual context task, then explain how the word part contributes.
        </p>
      </div>

      ${
        word
          ? readyBigWordMarkup(
              word
            )
          : ""
      }

      <div class="ready-context-card">
        ${esc(
          context ||
          task?.prompt ||
          ""
        )}
      </div>

      <label class="ready-response-label">
        Student response
        <textarea
          class="ready-response-textarea"
          rows="3"
        ></textarea>
      </label>

      <label class="ready-response-label">
        How does the morphology help?
        <textarea
          class="ready-response-textarea"
          rows="2"
        ></textarea>
      </label>

      ${readySupportDetailsMarkup()}
    `;
  }


  function renderReadyChange(
    container,
    task
  ) {
    const word =
      readyWord(task);

    const context =
      readyContext(task);

    container.innerHTML = `
      <div class="ready-material-heading">
        <span>
          Ready-to-use student material
        </span>

        <h3>
          Change It
        </h3>

        <p>
          Change the word to the form the context needs, then explain the morphological change.
        </p>
      </div>

      ${
        word
          ? readyBigWordMarkup(
              word
            )
          : ""
      }

      <div class="ready-context-card">
        ${esc(
          context ||
          task?.prompt ||
          ""
        )}
      </div>

      <label class="ready-response-label">
        New word form
        <input
          type="text"
          class="ready-response-input"
          autocomplete="off"
        >
      </label>

      <label class="ready-response-label">
        What changed?
        <textarea
          class="ready-response-textarea"
          rows="2"
        ></textarea>
      </label>

      ${readySupportDetailsMarkup()}
    `;
  }


  function renderReadyGeneric(
    container,
    task,
    activity
  ) {
    const word =
      readyWord(task);

    container.innerHTML = `
      <div class="ready-material-heading">
        <span>
          Ready-to-use student material
        </span>

        <h3>
          ${esc(
            READY_ACTIVITY_LABELS[
              activity
            ] ||
            activity
          )}
        </h3>

        <p>
          ${esc(
            task?.prompt ||
            ""
          )}
        </p>
      </div>

      ${
        word
          ? readyBigWordMarkup(
              word
            )
          : ""
      }

      <label class="ready-response-label">
        Student response
        <textarea
          class="ready-response-textarea"
          rows="3"
        ></textarea>
      </label>

      ${readySupportDetailsMarkup()}
    `;
  }


  function readyToggleLegacyBuildChrome(
    activity
  ) {
    const build =
      activity === "build";

    const ids = [
      "interactiveBuildMat",
      "interactiveWordSum",
      "checkBuildButton",
      "toggleMeaningsButton",
      "clearMatButton",
      "interactiveTileBank"
    ];

    for (const id of ids) {
      const element =
        byId(id);

      if (!element) {
        continue;
      }

      if (
        id ===
          "interactiveTileBank" &&
        element.closest(
          ".interactive-tile-area"
        )
      ) {
        element.closest(
          ".interactive-tile-area"
        ).hidden =
          !build;

        continue;
      }

      if (
        id ===
          "checkBuildButton" &&
        element.closest(
          ".session-check-row"
        )
      ) {
        element.closest(
          ".session-check-row"
        ).hidden =
          !build;

        continue;
      }

      element.hidden =
        !build;
    }

    const help =
      document.querySelector(
        ".session-interaction-help-row"
      );

    if (help) {
      help.hidden =
        !build;
    }
  }
  function readyPrintableTaskMarkup(
    task
  ) {
    const selectorDemand =
      task
        ?.recipe
        ?._readySelectorDemand ||
      null;

    if (
      readyActivity(
        task
      ) ===
        "break" &&
      selectorDemand &&
      selectorDemand !==
        "full-segmentation"
    ) {
      return `
        <section class="print-ready-task">
          <div class="print-ready-task-heading">
            <span>
              ${
                selectorDemand ===
                  "form-change"
                  ? "Part A · Form change"
                  : "Part A · Guided target connection"
              }
            </span>

            <h2>
              ${esc(
                readyWord(task)
              )}
            </h2>
          </div>

          <p>
            ${esc(
              task?.prompt ||
              ""
            )}
          </p>

          <div class="print-ready-response-lines">
            <div></div>
            <div></div>
          </div>
        </section>
      `;
    }


    const activity =
      readyActivity(
        task
      );

    const label =
      READY_ACTIVITY_LABELS[
        activity
      ] ||
      activity;

    const word =
      readyWord(
        task
      );

    const context =
      readyContext(
        task
      );

    const heading = `
      <div class="print-ready-task-heading">
        <span>
          ${esc(
            task?.stage ||
            "Teach / Practice"
          )}
        </span>

        <h2>
          ${esc(label)}
        </h2>

        <p>
          ${esc(
            task?.prompt ||
            ""
          )}
        </p>
      </div>
    `;

    if (activity === "learn") {
      return `
        <section class="print-ready-task">
          ${heading}

          <div class="print-ready-target">
            ${esc(
              readyTargetLabel()
            )}
          </div>

          ${
            readyTargetMeaning()
              ? `
                <p class="print-ready-meaning">
                  ${esc(
                    readyTargetMeaning()
                  )}
                </p>
              `
              : ""
          }

          ${
            word
              ? `
                <div class="print-ready-word">
                  ${esc(word)}
                </div>
              `
              : ""
          }
        </section>
      `;
    }

    if (activity === "find") {
      return `
        <section class="print-ready-task">
          ${heading}

          <p>
            Find and mark
            <strong>
              ${esc(
                readyTargetLabel()
              )}
            </strong>
            in the whole word.
          </p>

          <div class="print-ready-word">
            ${esc(word)}
          </div>
        </section>
      `;
    }

    if (activity === "hunt") {
      const words =
        readyWordSet(
          task
        );

      return `
        <section class="print-ready-task">
          ${heading}

          <p>
            Circle every word that contains
            <strong>
              ${esc(
                readyTargetLabel()
              )}
            </strong>.
          </p>

          <div class="print-ready-word-grid">
            ${words
              .map(
                item => `
                  <span>
                    ${esc(item)}
                  </span>
                `
              )
              .join("")}
          </div>
        </section>
      `;
    }

    if (activity === "meaning") {
      const prompt =
        String(
          task?.prompt ||
          task?.recipe?.activityPrompt ||
          task?.recipe?.wordPrompt ||
          ""
        ).trim() ||
        (
          word
            ? (
                `What does ${readyTargetLabel()} mean? ` +
                `How does that meaning contribute to ${word}?`
              )
            : `What does ${readyTargetLabel()} mean?`
        );

      return `
        <section class="print-ready-task">
          <div class="print-ready-task-heading">
            <span>
              ${esc(
                task?.stage ||
                "Teach / Practice"
              )}
            </span>

            <h2>
              ${esc(label)}
            </h2>
          </div>

          <div class="print-ready-target">
            ${esc(
              readyTargetLabel()
            )}
          </div>

          ${
            word
              ? `
                <div class="print-ready-word">
                  ${esc(word)}
                </div>
              `
              : ""
          }

          <p>
            ${esc(prompt)}
          </p>

          <div class="print-ready-lines"></div>
        </section>
      `;
    }

    if (activity === "morpheme") {
      const spec =
        task?.stage !==
          "Apply"
          ? readyWordPartSpecFor(
              task
            )
          : null;

      if (spec) {
        const patternWords =
          Array.isArray(
            spec.patternWords
          )
            ? spec.patternWords
                .filter(Boolean)
            : [];

        return `
          <section class="print-ready-task">
            <div class="print-ready-task-heading">
              <span>
                ${esc(
                  task?.stage ||
                  "Teach / Practice"
                )}
              </span>

              <h2>
                ${esc(spec.moveLabel)}
                ${
                  spec.word &&
                  spec.move !==
                    "pattern"
                    ? ` · ${esc(spec.word)}`
                    : ""
                }
              </h2>
            </div>

            ${
              spec.context
                ? `
                  <p class="print-ready-context">
                    ${esc(spec.context)}
                  </p>
                `
                : ""
            }

            ${
              spec.structure
                ? `
                  <div class="print-ready-word">
                    ${esc(spec.structure)}
                  </div>
                `
                : ""
            }

            ${
              patternWords.length
                ? `
                  <p class="print-ready-practice-word">
                    ${patternWords
                      .map(esc)
                      .join(" · ")}
                  </p>
                `
                : ""
            }

            ${readyWordPartPatternBridgesMarkup(spec)}

            <p>
              ${esc(spec.prompt)}
            </p>

            <div class="print-ready-lines"></div>
          </section>
        `;
      }

      return `
        <section class="print-ready-task">
          ${heading}

          <div class="print-ready-meaning">
            ${esc(
              readyTargetMeaning()
            )}
          </div>

          <p>
            Write the word part that matches this meaning.
          </p>

          <div class="print-ready-lines"></div>
        </section>
      `;
    }

    if (activity === "break") {
      return `
        <section class="print-ready-task print-ready-break-task">
          ${heading}

          <p>
            Look at the whole word. Draw a line between
            the meaningful word parts.
          </p>

          <div class="print-ready-word print-ready-break-word">
            ${esc(word)}
          </div>

          <div class="print-ready-boundary-line"></div>

          <p class="print-ready-small">
            Optional word sum:
          </p>

          <div class="print-ready-lines"></div>
        </section>
      `;
    }

    if (activity === "infer") {
      return `
        <section class="print-ready-task">
          ${heading}

          <div class="print-ready-word">
            ${esc(word)}
          </div>

          ${
            context
              ? `
                <p class="print-ready-context">
                  ${esc(context)}
                </p>
              `
              : ""
          }

          <p>
            What do you think the whole word means?
          </p>

          <div class="print-ready-lines"></div>

          <p>
            How did the known word part help?
          </p>

          <div class="print-ready-lines"></div>
        </section>
      `;
    }

    if (
      activity === "use" ||
      activity === "change"
    ) {
      return `
        <section class="print-ready-task">
          ${heading}

          ${
            word
              ? `
                <div class="print-ready-word">
                  ${esc(word)}
                </div>
              `
              : ""
          }

          ${
            context
              ? `
                <p class="print-ready-context">
                  ${esc(context)}
                </p>
              `
              : ""
          }

          <p>
            Student response:
          </p>

          <div class="print-ready-lines"></div>

          <p>
            Explain the morphology:
          </p>

          <div class="print-ready-lines"></div>
        </section>
      `;
    }

    if (activity === "build") {
      return `
        <section class="print-ready-task">
          ${heading}

          <p>
            Use the cut-apart First Volo word-part cards
            and the matching word-building mat in this packet.
          </p>
        </section>
      `;
    }

    return `
      <section class="print-ready-task">
        ${heading}

        ${
          word
            ? `
              <div class="print-ready-word">
                ${esc(word)}
              </div>
            `
            : ""
        }

        <div class="print-ready-lines"></div>
      </section>
    `;
  }


  function ensureReadyPrintPage(
    id,
    title,
    className
  ) {
    let page =
      byId(id);

    if (page) {
      return page;
    }

    page =
      document.createElement(
        "article"
      );

    page.id =
      id;

    page.className =
      `print-page ${className}`;

    page.innerHTML = `
      <header class="print-page-header">
        <div>
          <span>
            First Volo Morphology
          </span>

          <h1>
            ${esc(title)}
          </h1>
        </div>
      </header>

      <div
        class="print-ready-page-body"
        data-ready-page-body
      ></div>
    `;

    byId(
      "printSessionPacket"
    )?.append(
      page
    );

    return page;
  }


  /* FIRST_VOLO_TEACHER_SESSION_REBUILD_V3 */

  function readyNorm(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[‐-‒–—−]/g, "-")
      .replace(/[^a-z0-9-]+/g, "");
  }


  function readyLettersOnly(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z]/g, "");
  }


  function readyTargetIds() {
    const target =
      readyTarget() || {};

    const values = [
      target.id,
      target.targetId,
      target.canonicalId,
      target.label,
      target.target,
      ...readyTargetVariants()
    ];

    return [
      ...new Set(
        values
          .flatMap(
            value =>
              variants(value || "")
          )
          .map(
            value =>
              readyLettersOnly(value)
          )
          .filter(Boolean)
      )
    ];
  }


  function readyMorphemeInventory() {
    return Array.isArray(
      window.FIRST_VOLO_MORPHEME_INVENTORY
    )
      ? window.FIRST_VOLO_MORPHEME_INVENTORY
      : [];
  }


  function readyWordInventory() {
    return Array.isArray(
      window.FIRST_VOLO_WORD_INVENTORY
    )
      ? window.FIRST_VOLO_WORD_INVENTORY
      : [];
  }


  function readyMorphemeMetaFor(value) {
    const wanted =
      readyLettersOnly(value);

    if (!wanted) {
      return null;
    }

    return (
      readyMorphemeInventory()
        .find(
          item => {
            const ids = [
              item?.id,
              item?.label
            ]
              .flatMap(
                entry =>
                  variants(entry || "")
              )
              .map(
                entry =>
                  readyLettersOnly(entry)
              );

            return ids.includes(wanted);
          }
        ) ||
      null
    );
  }


  function readyTargetMorphemeMeta() {
    const ids =
      readyTargetIds();

    const label =
      readyTargetLabel();

    return (
      readyMorphemeInventory()
        .find(
          item =>
            ids.includes(
              readyLettersOnly(
                item?.id
              )
            ) ||
            labelsMatch(
              item?.label,
              label
            )
        ) ||
      null
    );
  }


  function readyTileForTarget(
    target
  ) {
    const label =
      target?.label ||
      target?.target ||
      readyTargetLabel();

    const existing =
      readyMaterialTilePool()
        .find(
          tile =>
            labelsMatch(
              tile?.label,
              label
            )
        ) ||
      null;

    const meta =
      [
        target?.id,
        target?.label,
        target?.target,
        label
      ]
        .filter(Boolean)
        .flatMap(
          value =>
            variants(value)
        )
        .map(
          value =>
            readyMorphemeMetaFor(
              value
            )
        )
        .find(Boolean) ||
      null;

    const meaning =
      target?.meaning ||
      meta?.meaning ||
      "";

    if (existing) {
      return {
        ...existing,
        label:
          existing.label ||
          meta?.label ||
          label,
        meaning:
          existing.meaning ||
          meaning,
        image:
          existing.image ||
          meta?.imagePath ||
          ""
      };
    }

    if (meta) {
      return {
        id:
          meta.id ||
          readyLettersOnly(
            meta.label
          ),
        label:
          meta.label ||
          label,
        meaning:
          meaning,
        image:
          meta.imagePath ||
          ""
      };
    }

    return {
      label,
      meaning,
      image: ""
    };
  }


  function readySupportTile() {
    return readyTileForTarget(
      readyTarget()
    );
  }


  function readyRetrieveSupportItem() {
    const items =
      state.plan
        ?.retrieve
        ?.items ||
      [];

    if (!items.length) {
      return null;
    }

    const currentLabel =
      readyTargetLabel();

    return (
      items.find(
        item =>
          labelsMatch(
            item?.target?.label,
            currentLabel
          )
      ) ||
      items[0]
    );
  }


  function readyRetrieveSupportTarget() {
    return (
      readyRetrieveSupportItem()
        ?.target ||
      readyTarget()
    );
  }


  function readyRetrieveSupportMeaning() {
    return (
      readyRetrieveSupportTarget()
        ?.meaning ||
      ""
    );
  }


  function readyRetrieveSupportTile() {
    return readyTileForTarget(
      readyRetrieveSupportTarget()
    );
  }


  function readyTileMarkup(
    tile,
    {
      includeMeaning = false,
      cueOnly = true
    } = {}
  ) {
    const label =
      tile?.label ||
      readyTargetLabel();

    const meaning =
      tile?.meaning ||
      readyTargetMeaning();

    if (tile?.image) {
      return `
        <div class="ready-support-image-tile">
          <div
            class="ready-support-tile-frame${
              cueOnly
                ? " is-cue-only"
                : ""
            }${readyV7TileRoleClass(label)}"
          >
            <img
              class="ready-support-tile-image"
              src="${esc(tile.image)}"
              alt="${esc(label)} visual support tile"
            >
          </div>

          ${
            includeMeaning &&
            meaning
              ? `
                <span class="ready-support-inline-meaning">
                  ${esc(meaning)}
                </span>
              `
              : ""
          }
        </div>
      `;
    }

    return `
      <div class="ready-support-fallback">
        <strong>
          ${esc(label)}
        </strong>

        ${
          includeMeaning &&
          meaning
            ? `
              <span>
                ${esc(meaning)}
              </span>
            `
            : ""
        }
      </div>
    `;
  }


  function readyTaskNonTargetSupports(
    task
  ) {
    const recipe =
      task?.recipe ||
      task ||
      null;

    return Array.isArray(
      recipe?.nonTargetSupports
    )
      ? recipe.nonTargetSupports
          .filter(
            support =>
              support?.part &&
              (
                support?.meaning ||
                support?.function
              )
          )
          .map(
            support => ({
              part:
                String(
                  support.part
                ).trim(),
              meaning:
                String(
                  support.meaning ||
                  support.function
                ).trim(),
              role:
                support.role ||
                "word part"
            })
          )
      : [];
  }


  function readyTaskNonTargetSupportMarkup(
    task
  ) {
    const recipe =
      task?.recipe ||
      task ||
      {};

    if (
      Array.isArray(recipe.educatorPrompts) &&
      recipe.educatorPrompts.length
    ) {
      return "";
    }

    const supports =
      readyTaskNonTargetSupports(
        task
      );

    if (!supports.length) {
      return "";
    }

    return `
      <div class="ready-approved-non-target-support">
        <p>
          <strong>Approved non-target information for this item:</strong>
          ${supports
            .map(
              support =>
                `${esc(support.part)} = ${esc(support.meaning)}`
            )
            .join("; ")}
        </p>
        <p>
          Give this only after the student's first attempt and only if the
          non-target part is the barrier. Then retry the same item. Do not
          supply the target meaning or complete the target reasoning.
        </p>
      </div>
    `;
  }


  function readyTaskTeachingAccess(
    task
  ) {
    const recipe =
      task?.recipe ||
      task ||
      {};

    return {
      definition:
        recipe.studentFriendlyDefinition ||
        recipe.definition ||
        null,
      literalMeaning:
        recipe.literalMeaning ||
        recipe.literal ||
        null,
      semanticBridge:
        recipe.semanticBridge ||
        null,
      contextSentence:
        recipe.contextSentence ||
        recipe.teachingContext ||
        null,
      clozeSupport:
        recipe.clozeSupport ||
        null,
      educatorPrompts:
        Array.isArray(recipe.educatorPrompts)
          ? recipe.educatorPrompts
          : []
    };
  }


  function readyEducatorPromptTiming(step) {
    return String(step?.timing || "")
      .trim()
      .toLowerCase();
  }


  function readyEducatorPromptIsPreTask(step) {
    const timing =
      readyEducatorPromptTiming(step);

    return [
      "teaching-setup",
      "before-context-use",
      "before-context-use-when-helpful",
      "before-target-question-when-helpful"
    ].includes(timing);
  }


  function readyEducatorPromptIsTargetDemand(step) {
    return readyEducatorPromptTiming(step) === "target-demand";
  }


  function readyEducatorPromptLabel(label) {
    const value = String(label || "Prompt").trim();

    if (value === "Retry") return "Then";
    if (value === "Teach/review") return "Review";
    if (value === "Optional model/context") return "Optional context";
    if (value === "If sentence generation is the barrier, give") {
      return "If sentence generation is the barrier";
    }
    return value;
  }


  function readyEducatorPromptParagraphs(steps) {
    return (steps || [])
      .map(
        step => `
          <p>
            <strong>${esc(readyEducatorPromptLabel(step?.label))}:</strong>
            ${esc(step?.text || "")}
          </p>
        `
      )
      .join("");
  }


  function readyTaskPreResponsePrompts(
    task,
    activity = null
  ) {
    const access =
      readyTaskTeachingAccess(task);

    const resolvedActivity =
      activity ||
      readyActivity(task);

    return access.educatorPrompts
      .filter(
        step => {
          if (readyEducatorPromptIsPreTask(step)) {
            return true;
          }

          /*
            Build Words may provide an unfamiliar NON-TARGET piece meaning as
            access information while the student is working. That is not a
            "failed independent attempt" cue because the non-target meaning is
            not the instructional demand.
          */
          if (
            resolvedActivity === "build" &&
            readyEducatorPromptTiming(step) ===
              "when-non-target-piece-blocks-build"
          ) {
            return true;
          }

          return false;
        }
      );
  }


  function readyPreResponseAccessMarkup(
    task,
    activity = null
  ) {
    const resolvedActivity =
      activity ||
      readyActivity(task);

    const prompts =
      readyTaskPreResponsePrompts(
        task,
        resolvedActivity
      );

    if (!prompts.length) {
      return "";
    }

    const heading =
      resolvedActivity === "build"
        ? "Access information you may give without answering the target"
        : "Before the student responds";

    return `
      <div class="ready-pre-response-access">
        <p>
          <strong>${esc(heading)}</strong>
        </p>
        ${readyEducatorPromptParagraphs(prompts)}
      </div>
    `;
  }


  function readyItemReviewItems(task) {
    const activity =
      readyActivity(task);

    const recipe =
      task?.recipe ||
      task ||
      {};

    const word =
      readyWord(task);

    const targetLabel =
      readyTargetLabel() ||
      recipe.targetLabel ||
      "the target word part";

    const targetMeaning =
      readyTargetMeaning() ||
      recipe.meaning ||
      null;

    const definition =
      recipe.studentFriendlyDefinition ||
      recipe.definition ||
      null;

    const literal =
      recipe.literalMeaning ||
      recipe.literal ||
      null;

    const segmentation =
      recipe.segmentation ||
      null;

    const items = [];
    const add = (label, text) => {
      const clean = String(text || "").trim();
      if (!clean) return;
      items.push({ label, text: clean });
    };

    switch (activity) {
      case "learn":
        if (targetMeaning) {
          add(
            "Listen for",
            `The student connects ${targetLabel} with “${targetMeaning}” and explains how that meaning shows up in ${word || "the example word"}.`
          );
        }
        if (definition) {
          add(
            "Whole-word meaning",
            `${word} means ${definition}.`
          );
        }
        break;

      case "find":
        add(
          "Answer",
          `${targetLabel} is the target meaningful part in ${word || "this word"}.`
        );
        if (targetMeaning) {
          add(
            "Listen for",
            `The student explains that ${targetLabel} contributes the idea “${targetMeaning}.”`
          );
        }
        break;

      case "hunt":
        add(
          "Accept",
          `Only real words that genuinely contain ${targetLabel} with the target meaning/sense.`
        );
        break;

      case "meaning":
        if (targetMeaning) {
          add(
            "Answer",
            `${targetLabel} = ${targetMeaning}.`
          );
        }
        break;

      case "morpheme":
        add(
          "Answer",
          `${targetLabel}${targetMeaning ? ` carries the idea “${targetMeaning}”` : " is the target word part"}.`
        );
        if (definition && word) {
          add(
            "Whole-word meaning",
            `${word} means ${definition}.`
          );
        }
        break;

      case "break":
        if (segmentation) {
          add(
            "Expected analysis",
            `${word}: ${segmentation}.`
          );
        } else {
          add(
            "Listen for",
            `Defensible meaningful parts and a correct explanation of what ${targetLabel} contributes.`
          );
        }
        break;

      case "infer":
        if (definition) {
          add(
            "Expected whole-word meaning",
            `${word} means ${definition}.`
          );
        } else {
          add(
            "Accept",
            `A reasonable context-supported whole-word meaning that uses the known meaning of ${targetLabel}.`
          );
        }
        if (targetMeaning) {
          add(
            "Morphology",
            `${targetLabel} = ${targetMeaning}.`
          );
        }
        break;

      case "build":
        if (word) {
          add(
            "Expected word",
            `${word}${segmentation ? ` (${segmentation})` : ""}.`
          );
        }
        if (targetMeaning) {
          add(
            "Morphology",
            `${targetLabel} = ${targetMeaning}.`
          );
        }
        break;

      case "use":
        if (definition && word) {
          add(
            "Accept",
            `Any sentence that clearly shows ${word} means ${definition}.`
          );
        } else if (word) {
          add(
            "Accept",
            `Any appropriate sentence that makes the meaning of ${word} clear.`
          );
        }
        if (targetMeaning) {
          add(
            "Morphology",
            `The student explains that ${targetLabel} means ${targetMeaning} and contributes that meaning to ${word || "the word"}.`
          );
        }
        break;

      case "change": {
        const change =
          recipe.changeTask ||
          null;

        if (change?.expectedWord) {
          add(
            "Answer",
            change.expectedWord
          );
        } else if (recipe.answer) {
          add(
            "Answer",
            recipe.answer
          );
        }
        if (change?.changeExplanation) {
          add(
            "Listen for",
            change.changeExplanation
          );
        } else {
          add(
            "Listen for",
            `The selected form fits the context and the student explains the morphological change.`
          );
        }
        break;
      }

      default:
        if (recipe.answer || task?.answer) {
          add(
            "Answer",
            recipe.answer || task.answer
          );
        }
        break;
    }

    if (literal) {
      add(
        "Literal morphology",
        literal
      );
    }

    if (definition && ![
      "learn",
      "morpheme",
      "infer",
      "use"
    ].includes(activity)) {
      add(
        "Student-friendly meaning",
        definition
      );
    }

    return items;
  }


  function readyItemReviewMarkup(task) {
    const items =
      readyItemReviewItems(task);

    if (!items.length) {
      return "";
    }

    return `
      <details class="ready-item-review">
        <summary>What to listen for</summary>
        <div class="ready-item-review-body">
          ${items
            .map(
              item => `
                <p>
                  <strong>${esc(item.label)}:</strong>
                  ${esc(item.text)}
                </p>
              `
            )
            .join("")}
        </div>
      </details>
    `;
  }


  function readyItemReviewPlainText(task) {
    return readyItemReviewItems(task)
      .map(
        item => `${item.label}: ${item.text}`
      )
      .join(" ");
  }


  function readyPartAInstructionNote(
    task,
    { number = null, total = null } = {}
  ) {
    const activity =
      readyActivity(task);

    const prefix =
      number && total && total > 1
        ? `Practice item ${number} of ${total}. `
        : "";

    const notes = {
      learn:
        "Teach with the target meaning and example shown below, then ask the student to explain the connection.",
      find:
        "Give the whole-word meaning when it helps the student access the word. The independent work is finding the target and explaining its contribution.",
      hunt:
        "Let the student identify words that genuinely contain the target. Add support only if target recognition or word retrieval becomes the barrier.",
      meaning:
        "Begin with independent retrieval of the target meaning. Open support only after that attempt.",
      morpheme:
        "Give the whole-word context and any listed non-target information before the target question. The student independently identifies the target word part.",
      break:
        "Begin with the student's independent morphology analysis. Open support only after that attempt.",
      infer:
        "Read the context, then let the student infer the whole-word meaning from morphology. Do not give the whole-word meaning before the first inference attempt.",
      build:
        "Present the build goal and tiles. You may give listed non-target piece meanings if they are needed; keep the target meaning as the student's reasoning job.",
      use:
        "Give the whole-word meaning shown below before asking for the sentence. The independent work is using the word meaningfully and explaining the target word part.",
      change:
        "Give the context and whole-word meaning needed to understand the transformation. The student independently supplies the form the context requires and explains the change."
    };

    return prefix + (
      notes[activity] ||
      "Present the task, preserve the activity's target demand, and add only the access information that does not answer that demand."
    );
  }


  function readyTaskTeachingAccessMarkup(
    task,
    activity = null
  ) {
    const access =
      readyTaskTeachingAccess(
        task
      );

    if (
      !access.definition &&
      !access.literalMeaning &&
      !access.semanticBridge &&
      !access.clozeSupport &&
      !access.educatorPrompts.length
    ) {
      return "";
    }

    const preResponsePrompts =
      readyTaskPreResponsePrompts(
        task,
        activity
      );

    const preResponseSet =
      new Set(preResponsePrompts);

    const supportPrompts =
      access.educatorPrompts
        .filter(
          step =>
            !preResponseSet.has(step) &&
            !readyEducatorPromptIsTargetDemand(step) &&
            String(step?.label || "").trim() !== "Expected"
        );

    if (access.educatorPrompts.length) {
      return `
        <div class="ready-teaching-access ready-generated-educator-prompts">
          ${
            supportPrompts.length
              ? `
                <p>
                  <strong>Teacher support</strong>
                </p>
                ${readyEducatorPromptParagraphs(supportPrompts)}
              `
              : ""
          }

          ${
            access.literalMeaning
              ? `
                <p class="ready-teaching-key-line">
                  <strong>Literal meaning from the parts:</strong>
                  ${esc(access.literalMeaning)}
                </p>
              `
              : ""
          }

          ${
            access.definition
              ? `
                <p class="ready-teaching-key-line">
                  <strong>Student-friendly meaning:</strong>
                  ${esc(access.definition)}
                </p>
              `
              : ""
          }
        </div>
      `;
    }

    return `
      <div class="ready-teaching-access">
        ${
          access.definition
            ? `
              <p>
                <strong>Student-friendly meaning:</strong>
                ${esc(access.definition)}
              </p>
            `
            : ""
        }

        ${
          access.literalMeaning
            ? `
              <p>
                <strong>Literal meaning from the parts:</strong>
                ${esc(access.literalMeaning)}
              </p>
            `
            : ""
        }

        ${
          access.clozeSupport
            ? `
              <p>
                <strong>If sentence generation is the barrier:</strong>
                ${esc(access.clozeSupport)}
              </p>
            `
            : ""
        }

        ${
          activity === "infer"
            ? `
              <p class="ready-small-note">
                Ask the student to use the word part first, then use the sentence to check or refine the idea.
              </p>
            `
            : ""
        }
      </div>
    `;
  }


  function readySupportDetailsMarkup() {
    const currentTask =
      state.tasks
        ?.[
          state.taskIndex || 0
        ] ||
      state.tasks
        ?.[0] ||
      null;

    return readyV7ActivitySupportMarkup(
      readyActivity(
        currentTask
      ),
      currentTask
    );
  }


  function readySegmentationParts(value) {
    return String(value || "")
      .split(/\s*\+\s*/)
      .map(
        part =>
          String(part || "")
            .trim()
      )
      .filter(Boolean);
  }


  function readyTaskParts(task) {
    const recipe =
      task?.recipe ||
      {};

    const explicit =
      Array.isArray(
        recipe.parts
      )
        ? recipe.parts
            .map(
              part =>
                String(part || "")
                  .trim()
            )
            .filter(Boolean)
        : [];

    if (explicit.length >= 2) {
      return explicit;
    }

    const segmentation =
      recipe.segmentation ||
      task?.segmentation ||
      "";

    return readySegmentationParts(
      segmentation
    );
  }


  function readyExpectedBoundaries(task) {
    const word =
      readyLettersOnly(
        readyWord(task)
      );

    const parts =
      readyTaskParts(task);

    const cleanParts =
      parts
        .map(
          readyLettersOnly
        )
        .filter(Boolean);

    if (
      cleanParts.length < 2 ||
      cleanParts.join("") !== word
    ) {
      return [];
    }

    let total = 0;

    return cleanParts
      .slice(0, -1)
      .map(
        part => {
          total +=
            part.length;

          return total;
        }
      );
  }


  function readyExpectedWordSum(task) {
    const parts =
      readyTaskParts(task);

    return parts.length >= 2
      ? parts.join(" + ")
      : "";
  }


  function readyBreakItemIsFair(
    item,
    stage = "apply"
  ) {
    const result =
      readyWordSelector()
        ?.evaluateCandidate?.({
          item,
          target:
            readyTarget(),
          objective:
            "break",
          stage,
          gradeBand:
            readyCurrentBand(),
          vocabularyLevel:
            readyCurrentVocabLevel(),
          flight:
            readyCurrentFlight(),
          isProtected:
            readyProtectedWord
        });

    return Boolean(
      result
        ?.eligible &&
      result
        ?.demand ===
        "full-segmentation"
    );
  }


  function readyBreakTaskIsFair(
    task
  ) {
    return readyBreakItemIsFair(
      {
        word:
          readyWord(task),
        segmentation:
          task?.recipe
            ?.segmentation ||
          readyExpectedWordSum(
            task
          ),
        morphemes:
          task?.recipe
            ?.morphemes ||
          readyTaskParts(
            task
          ),
        definition:
          task?.recipe
            ?.definition ||
          task?.definition ||
          "",
        literal:
          task?.recipe
            ?.literal ||
          "",
        reviewCaution:
          task?.recipe
            ?.reviewCaution,
        transparency:
          task?.recipe
            ?.transparency,
        practiceBand:
          task?.recipe
            ?.practiceBand ||
          readyCurrentBand(),
        accessibilityBand:
          task?.recipe
            ?.accessibilityBand ||
          readyCurrentBand(),
        vocabLevel:
          task?.recipe
            ?.vocabLevel ||
          readyCurrentVocabLevel()
      },
      task?.stage ===
        "Apply"
        ? "apply"
        : "guided"
    );
  }


  function readyProtectedWord(word) {
    return Boolean(
      window
        .FirstVoloInstructionalMaterialResolver
        ?.isProtected?.(
          word
        )
    );
  }


  function readyCurrentBand() {
    return (
      state.plan
        ?.gradeBand ||
      state.plan
        ?.lastWork
        ?.gradeBand ||
      state.plan
        ?.teachPractice
        ?.gradeBand ||
      readyTarget()
        ?.practiceBand ||
      readyTarget()
        ?.introBand ||
      ""
    );
  }


  function readyBandRank(value) {
    const text =
      String(value || "");

    if (/2\s*-\s*3/.test(text)) {
      return 1;
    }

    if (/4\s*-\s*5/.test(text)) {
      return 2;
    }

    if (/6\s*-\s*8/.test(text)) {
      return 3;
    }

    return 99;
  }


  function readyBandAllows(item) {
    const current =
      readyBandRank(
        readyCurrentBand()
      );

    const itemBand =
      readyBandRank(
        item?.practiceBand ||
        item?.accessibilityBand ||
        ""
      );

    return (
      current === 99 ||
      itemBand === 99 ||
      itemBand <= current
    );
  }


  function readyCurrentFlight() {
    return String(
      state.plan
        ?.flight ||
      state.plan
        ?.lastWork
        ?.flight ||
      state.plan
        ?.teachPractice
        ?.flight ||
      ""
    )
      .trim()
      .toUpperCase();
  }


  function readyFlightAllows(item) {
    const current =
      readyCurrentFlight();

    const itemFlight =
      String(
        item?.flight ||
        item?.practiceFlight ||
        ""
      )
        .trim()
        .toUpperCase();

    return (
      !current ||
      !itemFlight ||
      current === itemFlight
    );
  }


  function readyInventoryMatchesTarget(item) {
    const targetIds =
      readyTargetIds();

    const itemMorphemes =
      Array.isArray(
        item?.morphemes
      )
        ? item.morphemes
        : [];

    const morphemeMatch =
      itemMorphemes
        .flatMap(
          value =>
            variants(value || "")
        )
        .map(
          readyLettersOnly
        )
        .some(
          value =>
            targetIds.includes(value)
        );

    if (morphemeMatch) {
      return true;
    }

    const parts =
      readySegmentationParts(
        item?.segmentation
      )
        .map(
          readyLettersOnly
        );

    return parts.some(
      part =>
        targetIds.includes(part)
    );
  }
    /* FIRST_VOLO_SYSTEM_WIDE_WORD_SELECTOR_V1
     Thin UI adapter. Candidate eligibility/ranking belongs to
     instructional-word-selector.js.
  */
  function readyWordSelector() {
    return (
      window
        .FirstVoloInstructionalWordSelector ||
      null
    );
  }


  function readyCurrentVocabLevel() {
    return (
      state.plan
        ?.vocabLevel ||
      state.plan
        ?.lastWork
        ?.vocabLevel ||
      state.plan
        ?.teachPractice
        ?.vocabLevel ||
      null
    );
  }


  function readyCandidateScore(item) {
    const vocab =
      String(
        item?.vocabLevel ||
        ""
      )
        .toLowerCase();

    const transparency =
      String(
        item?.transparency ||
        ""
      )
        .toLowerCase();

    let score = 0;

    if (
      vocab === "familiar" ||
      vocab === "everyday"
    ) {
      score += 30;
    } else if (
      vocab === "general" ||
      vocab === "core"
    ) {
      score += 20;
    } else if (
      vocab === "academic"
    ) {
      score += 10;
    }

    if (transparency === "high") {
      score += 20;
    } else if (
      transparency === "medium"
    ) {
      score += 10;
    }

    if (
      readyBandRank(
        item?.practiceBand
      ) ===
      readyBandRank(
        readyCurrentBand()
      )
    ) {
      score += 8;
    }

    return score;
  }


  /* FIRST_VOLO_ACTIVITY_AWARE_TEACHER_CANDIDATES_V1
     Teacher-led supplemental candidates live only in Session Materials.
     They do not add words to the regular student online activity bank.

     The registry is activity-aware: a word may be useful for one demand
     without being eligible for another.
  */


  function readyBreakTargetSurfaceForms() {
    const forms =
      new Set(
        readyTargetIds()
      );

    const targetId =
      readyLettersOnly(
        readyTarget()?.id ||
        ""
      );

    if (targetId === "mot") {
      forms.add("mot");
      forms.add("mov");
      forms.add("move");
    }

    return forms;
  }


  function readyActivityCandidateIsFair(
    item,
    activity,
    stage = "guided"
  ) {
    return Boolean(
      readyWordSelector()
        ?.evaluateCandidate?.({
          item,
          target:
            readyTarget(),
          objective:
            activity,
          stage,
          gradeBand:
            readyCurrentBand(),
          vocabularyLevel:
            readyCurrentVocabLevel(),
          flight:
            readyCurrentFlight(),
          isProtected:
            readyProtectedWord
        })
        ?.eligible
    );
  }


  function readyInventoryCandidates(
    activity
  ) {
    const selector =
      readyWordSelector();

    if (
      !selector
        ?.selectCandidates
    ) {
      return [];
    }

    return selector
      .selectCandidates({
        target:
          readyTarget(),
        objective:
          activity,
        stage:
          "guided",
        gradeBand:
          readyCurrentBand(),
        vocabularyLevel:
          readyCurrentVocabLevel(),
        flight:
          readyCurrentFlight(),
        isProtected:
          readyProtectedWord
      })
      .map(
        selection => ({
          ...selection.item,
          _readySelectorSelection:
            selection
        })
      );
  }


  function readyCandidateFromRecipe(
    recipe
  ) {
    if (!recipe?.word) {
      return null;
    }

    return {
      word:
        recipe.word,
      segmentation:
        recipe.segmentation ||
        (
          Array.isArray(
            recipe.parts
          )
            ? recipe.parts
                .join(" + ")
            : ""
        ),
      morphemes:
        recipe.parts ||
        [],
      definition:
        recipe.definition ||
        recipe.expectedMeaning ||
        "",
      literal:
        recipe.literal ||
        "",
      sentence:
        recipe.sentence ||
        recipe.context ||
        recipe.contextSentence ||
        "",
      practiceBand:
        recipe.practiceBand ||
        "",
      vocabLevel:
        recipe.vocabLevel ||
        "",
      transparency:
        recipe.transparency ||
        "",
      reviewCaution:
        recipe.reviewCaution ||
        "",
      nonTargetSupports:
        Array.isArray(
          recipe.nonTargetSupports
        )
          ? recipe.nonTargetSupports
              .map(
                support => ({
                  ...support
                })
              )
          : [],
      teacherLedOnly:
        Boolean(
          recipe.teacherLedOnly
        ),
      instructionalSource:
        recipe.source ||
        recipe?.metadata
          ?.instructionalSource ||
        ""
    };
  }


  function readyAllPracticeCandidates(
    activity
  ) {
    const values = [
      ...readyInventoryCandidates(
        activity
      )
    ];

    for (
      const recipe
      of state.material
        ?.recipes || []
    ) {
      const candidate =
        readyCandidateFromRecipe(
          recipe
        );

      if (
        readyActivityCandidateIsFair(
          candidate,
          activity,
          "guided"
        )
      ) {
        values.push(
          candidate
        );
      }
    }

    const families =
      allFamilies();

    for (
      const familyId
      of state.familyCandidates || []
    ) {
      const family =
        families?.[
          familyId
        ];

      for (
        const recipe
        of family
          ?.sessionRecipes || []
      ) {
        const candidate =
          readyCandidateFromRecipe(
            recipe
          );

        if (
          readyActivityCandidateIsFair(
            candidate,
            activity,
            "guided"
          )
        ) {
          values.push(
            candidate
          );
        }
      }
    }

    const seen =
      new Set();

    return values.filter(
      item => {
        const key =
          readyLettersOnly(
            item?.word
          );

        if (
          !key ||
          seen.has(key)
        ) {
          return false;
        }

        seen.add(key);
        return true;
      }
    );
  }


  function readyTaskFromCandidate(
    item,
    stage
  ) {
    const activity =
      "break";

    const segmentation =
      item.segmentation ||
      "";

    return {
      stage,
      activity,
      recipe: {
        activity,
        word:
          item.word,
        segmentation,
        parts:
          readySegmentationParts(
            segmentation
          ),
        definition:
          item.definition ||
          "",
        sentence:
          item.sentence ||
          "",
        transparency:
          item.transparency ||
          "",
        reviewCaution:
          item.reviewCaution ||
          ""
      },
      prompt:
        `Break ${item.word} into meaningful parts. ` +
        `Start with the whole word and mark the boundaries yourself. ` +
        `Then explain what ${readyTargetLabel()} contributes.`,
      followUp:
        null
    };
  }


    /* FIRST_VOLO_SELECTOR_DRIVEN_BREAK_PLAN_V1
     Break word selection, fallback, and duration all consume the same
     system-wide objective-aware selector.
  */
  function readyBreakPlanForDuration(
    minutes
  ) {
    const selector =
      readyWordSelector();

    const policy =
      readyV13DurationPolicy[
        Number(minutes)
      ];

    if (
      !selector
        ?.buildBreakPlan ||
      !policy
    ) {
      return {
        complete:
          false,
        partA:
          [],
        apply:
          null,
        reason:
          "Selector or duration policy is unavailable."
      };
    }

    return selector
      .buildBreakPlan({
        target:
          readyTarget(),
        gradeBand:
          readyCurrentBand(),
        vocabularyLevel:
          readyCurrentVocabLevel(),
        flight:
          readyCurrentFlight(),
        candidates:
          readyAllPracticeCandidates(
            "break"
          ),
        isProtected:
          readyProtectedWord,
        partACount:
          policy
            ?.partAItems ||
          1
      });
  }
  function readyBreakSelectionPrompt(
    selection,
    stage
  ) {
    const item =
      selection?.item ||
      {};

    const word =
      item?.word ||
      "";

    const meaning =
      item?.definition ||
      item?.literal ||
      "";

    const formation =
      selection?.wordFormation ||
      null;

    if (
      selection?.demand ===
        "form-change"
    ) {
      return (
        `${word} comes from ${formation?.baseForm || "the base word"}` +
        `${formation?.suffix ? ` + ${formation.suffix}` : ""}. ` +
        `What happens to the final e when the new word is formed?`
      );
    }

    if (
      selection?.demand ===
        "target-recognition"
    ) {
      return (
        (
          meaning
            ? (
                `${word} means ${meaning}. `
              )
            : ""
        ) +
        `Which visible part or form in ${word} connects to the idea ${readyTargetMeaning()}?`
      );
    }

    if (
      stage ===
      "Apply"
    ) {
      return (
        `Break ${word} into meaningful parts. ` +
        `Begin independently with the whole word.`
      );
    }

    const formQuestion =
      formation?.spellingChange ===
        "keep-final-e"
        ? (
            ` After you mark the parts, look at the base ${formation.baseForm}. ` +
            `Does its final e stay or drop in this word?`
          )
        : "";

    return (
      `Break ${word} into meaningful parts. ` +
      `Start with the whole word. If another part is unfamiliar, ` +
      `the educator may explain that non-target part after the first attempt.` +
      formQuestion
    );
  }
  function readyBreakSelectionKey(
    selection
  ) {
    const formation =
      selection?.wordFormation ||
      null;

    if (
      selection?.demand ===
        "form-change"
    ) {
      return (
        `${formation?.wordSum || "Use the approved word sum."}` +
        `${formation?.teachingNote ? ` ${formation.teachingNote}` : ""}`
      );
    }

    if (
      selection?.demand ===
        "target-recognition"
    ) {
      return (
        `Expected visible target form: ${selection?.expectedTargetForm || readyTargetLabel()}. ` +
        `Do not score this teaching move as a full segmentation.`
      );
    }

    const parts =
      selection?.segmentation?.parts ||
      [];

    return (
      (
        parts.length
          ? parts.join(
              " + "
            )
          : (
              `Verify a linguistically accurate segmentation containing ${readyTargetLabel()}.`
            )
      ) +
      (
        formation?.teachingNote
          ? ` ${formation.teachingNote}`
          : ""
      )
    );
  }


  function readyTaskFromBreakSelection(
    selection,
    stage
  ) {
    const task =
      readyTaskFromCandidate(
        selection.item,
        stage
      );

    const prompt =
      readyBreakSelectionPrompt(
        selection,
        stage
      );

    const educatorKey =
      readyBreakSelectionKey(
        selection
      );

    return {
      ...task,
      prompt,
      wordPrompt:
        prompt,
      answer:
        educatorKey,
      recipe: {
        ...(task?.recipe || {}),
        word:
          selection
            ?.item
            ?.word ||
          task?.recipe
            ?.word ||
          "",
        educatorKey,
        _readySelectorDemand:
          selection
            ?.demand ||
          null,
        _readySelectorAllowedSupport:
          Array.isArray(
            selection
              ?.allowedSupport
          )
            ? selection
                .allowedSupport
                .slice()
            : [],
        _readySelectorWhyEligible:
          selection
            ?.whyEligible ||
          "",
        _readySelectorExpectedTargetForm:
          selection
            ?.expectedTargetForm ||
          null,
        _readySelectorWordFormation:
          selection
            ?.wordFormation ||
          null,
        _readySelectorFreshnessFamily:
          selection
            ?.freshnessFamily ||
          null,
        _readySelectorScored:
          selection
            ?.demand ===
          "full-segmentation"
      }
    };
  }


  function readyBreakUnscoredFallback(
    task
  ) {
    const choices =
      readyWordSelector()
        ?.selectCandidates?.({
          target:
            readyTarget(),
          objective:
            "break",
          stage:
            "guided",
          gradeBand:
            readyCurrentBand(),
          vocabularyLevel:
            readyCurrentVocabLevel(),
          flight:
            readyCurrentFlight(),
          candidates:
            readyAllPracticeCandidates(
              "break"
            ),
          isProtected:
            readyProtectedWord
        }) ||
      [];

    const selection =
      choices.find(
        item =>
          item.demand ===
          "target-recognition"
      ) ||
      choices[0] ||
      null;

    if (!selection) {
      return null;
    }

    return {
      selection,
      word:
        selection.word,
      prompt:
        readyBreakSelectionPrompt(
          selection,
          "Teach / Practice"
        ),
      expected:
        selection
          .expectedTargetForm ||
        readyTargetLabel()
    };
  }


  function readyBreakUnavailablePrompt(
    task
  ) {
    const fallback =
      readyBreakUnscoredFallback(
        task
      );

    return (
      fallback
        ? (
            "Unscored target connection — " +
            fallback.prompt
          )
        : (
            "No complete scored Break It Apart sequence is available today. " +
            "Do not force an unsuitable word or segmentation."
          )
    );
  }


  function readyBreakUnavailableMarkup(
    task
  ) {
    const fallback =
      readyBreakUnscoredFallback(
        task
      );

    if (!fallback) {
      return `
        <div class="ready-material-heading">
          <span>
            Break It Apart
          </span>

          <h3>
            No complete scored sequence is available yet
          </h3>

          <p>
            Do not force an unsuitable word or segmentation.
            Continue with another appropriate activity.
          </p>
        </div>
      `;
    }

    return `
      <div class="ready-material-heading">
        <span>
          Break It Apart · unscored target connection
        </span>

        <h3>
          ${esc(
            fallback.word
          )}
        </h3>

        <p>
          ${esc(
            fallback.prompt
          )}
        </p>
      </div>

      <details class="ready-support-panel">

        <summary>
          Answer
        </summary>

        <div class="ready-support-panel-body">
          <p>
            Expected target form:
            <strong>
              ${esc(
                fallback.expected
              )}
            </strong>
          </p>

          <p>
            Use this only as an unscored target connection.
            It does not count as independent Break It Apart performance.
          </p>
        </div>
      </details>
    `;
  }


  function readySelectorBreakSupportMarkup(
    task
  ) {
    let supports =
      Array.isArray(
        task
          ?.recipe
          ?._readySelectorAllowedSupport
      )
        ? task
            .recipe
            ._readySelectorAllowedSupport
            .map(
              item =>
                String(item || "")
                  .trim()
            )
            .filter(Boolean)
        : [];

    const demand =
      task
        ?.recipe
        ?._readySelectorDemand ||
      null;

    const formation =
      task
        ?.recipe
        ?._readySelectorWordFormation ||
      null;

    if (
      !supports.length &&
      demand ===
        "form-change"
    ) {
      supports = [
        "Begin with the base form and suffix shown in the prompt. Ask the student what changes when the word is formed.",
        (
          formation?.teachingNote ||
          "State the spelling-change rule only after the student's first attempt, then retry the same word formation."
        ),
        "Have the student say or write the accurate word sum, then fade the spelling cue on the next opportunity."
      ];
    }

    if (!supports.length) {
      return "";
    }

    return `
      <details class="ready-support-panel">
        <summary>
          If support is needed
        </summary>

        <div class="ready-support-panel-body">
          <ul>
            ${supports
              .map(
                item =>
                  `<li>${esc(item)}</li>`
              )
              .join("")}
          </ul>
        </div>
      </details>
    `;
  }


  function readyPrepareEffectiveTasks() {
    if (
      !Array.isArray(
        state.tasks
      ) ||
      !state.tasks.length
    ) {
      return;
    }

    const activity =
      readyActivity(
        state.tasks[0]
      );

    if (
      activity !==
      "break"
    ) {
      return;
    }

    const minutes =
      readyV13DurationMinutes();

    const signature =
      [
        readyTargetLabel(),
        activity,
        minutes || "",
        ...state.tasks.map(
          task =>
            `${task?.stage || ""}:${readyWord(task)}`
        )
      ].join("|");

    if (
      state
        ._readyBreakPreparedSignature ===
      signature
    ) {
      return;
    }

    const plan =
      readyBreakPlanForDuration(
        minutes
      );

    if (
      plan
        ?.complete
    ) {
      state.tasks = [
        ...plan.partA.map(
          selection =>
            readyTaskFromBreakSelection(
              selection,
              "Teach / Practice"
            )
        ),
        readyTaskFromBreakSelection(
          plan.apply,
          "Apply"
        )
      ];
    } else {
      const base =
        state.tasks.find(
          task =>
            task?.stage ===
            "Teach / Practice"
        ) ||
        state.tasks[0];

      const fallback =
        readyBreakUnscoredFallback(
          base
        );

      state.tasks = [
        {
          ...base,
          prompt:
            readyBreakUnavailablePrompt(
              base
            ),
          recipe: {
            ...(base
              ?.recipe ||
              {}),
            word:
              fallback?.word ||
              base
                ?.recipe
                ?.word ||
              "",
            _readyBreakUnavailable:
              true,
            _readySelectorDemand:
              fallback
                ?.selection
                ?.demand ||
              "target-recognition",
            _readySelectorScored:
              false
          }
        }
      ];
    }

    state
      ._readyBreakPreparedSignature =
      [
        readyTargetLabel(),
        activity,
        minutes || "",
        ...state.tasks.map(
          task =>
            `${task?.stage || ""}:${readyWord(task)}`
        )
      ].join("|");
  }

  function readyEnsureStepFlow() {
    const digital =
      document.querySelector(
        ".session-digital-card"
      );

    const transfer =
      document.querySelector(
        ".session-transfer-card"
      );

    if (
      !digital ||
      !transfer
    ) {
      return;
    }

    let step2 =
      byId(
        "sessionStep2Card"
      );

    if (!step2) {
      step2 =
        document.createElement(
          "section"
        );

      step2.id =
        "sessionStep2Card";

      step2.className =
        "session-step-flow-card session-step-two";

      step2.innerHTML = `
        <span class="session-eyebrow">
          Step 2
        </span>

        <h2>
          Teach / Practice
        </h2>

        <p class="session-step-note">
          Teach or practice the exact target skill.
          Begin with an independent attempt, then support only if a barrier appears.
        </p>

        <div
          class="session-integrated-guidance"
          id="sessionStep2Guidance"
        ></div>

        <div
          id="sessionStep2Mount"
          class="session-step-material-mount"
        ></div>
      `;

      transfer.parentElement
        ?.insertBefore(
          step2,
          transfer
        );
    }

    let step3 =
      byId(
        "sessionStep3Card"
      );

    if (!step3) {
      step3 =
        document.createElement(
          "section"
        );

      step3.id =
        "sessionStep3Card";

      step3.className =
        "session-step-flow-card session-step-three";

      step3.innerHTML = `
        <span class="session-eyebrow">
          Step 3
        </span>

        <h2>
          Apply
        </h2>

        <p class="session-step-note">
          Use a fresh ordinary instructional word with the same task demand.
          Do not turn Apply into a different activity.
        </p>

        <div
          class="session-integrated-guidance"
          id="sessionStep3Guidance"
        ></div>

        <div
          id="sessionStep3Mount"
          class="session-step-material-mount"
        ></div>
      `;

      transfer.parentElement
        ?.insertBefore(
          step3,
          transfer
        );
    }

    let practice =
      byId(
        "sessionPracticeSetCard"
      );

    if (!practice) {
      practice =
        document.createElement(
          "section"
        );

      practice.id =
        "sessionPracticeSetCard";

      practice.className =
        "session-step-flow-card session-step-five";

      practice.innerHTML = `
        <span class="session-eyebrow">
          Step 5
        </span>

        <h2>
          Practice Set
        </h2>

        <p class="session-step-note">
          Five additional items matched to this exact target and skill.
          Continue for five more when appropriate.
        </p>

        <div
          id="sessionPracticeSet"
        ></div>
      `;

      transfer.insertAdjacentElement(
        "afterend",
        practice
      );
    }

    const plan =
      document.querySelector(
        ".session-plan-strip"
      );

    if (
      plan &&
      !plan.querySelector(
        "[data-ready-step-five]"
      )
    ) {
      const item =
        document.createElement(
          "div"
        );

      item.dataset
        .readyStepFive =
          "true";

      item.innerHTML = `
        <strong>
          5. Practice Set
        </strong>

        <span>
          5–10 items
        </span>
      `;

      plan.append(
        item
      );
    }

    const instruction =
      document.querySelector(
        ".session-instruction-card"
      );

    if (instruction) {
      instruction.hidden =
        true;
    }

    const protection =
      document.querySelector(
        ".session-protection-note"
      );

    if (protection) {
      protection.hidden =
        true;
    }

    const note =
      document.querySelector(
        ".session-teacher-led-note p"
      );

    if (note) {
      note.textContent =
        "Begin each new demand with an independent attempt. " +
        "If a barrier appears, use the least support needed, retry the same demand, then fade support.";
    }

    const unavailable =
      byId(
        "sessionMaterialUnavailable"
      );

    if (unavailable) {
      const eyebrow =
        unavailable.querySelector(
          ".session-eyebrow"
        );

      const heading =
        unavailable.querySelector(
          "h2"
        );

      const paragraph =
        unavailable.querySelector(
          "p"
        );

      if (eyebrow) {
        eyebrow.textContent =
          "Materials not available yet";
      }

      if (heading) {
        heading.textContent =
          "This target does not yet have ready-to-use session materials.";
      }

      if (paragraph) {
        paragraph.textContent =
          "Choose another appropriate activity or target for this session.";
      }
    }

    const familyChoice =
      byId(
        "sessionFamilyChoice"
      );

    if (familyChoice) {
      const eyebrow =
        familyChoice.querySelector(
          ".session-eyebrow"
        );

      const paragraph =
        familyChoice.querySelector(
          "p"
        );

      if (eyebrow) {
        eyebrow.textContent =
          "Choose a word family";
      }

      if (paragraph) {
        paragraph.textContent =
          "Choose the word family you want to use for this session.";
      }
    }
  }


  function readyGuidanceHtml(stage) {
    const educator =
      byId(
        "sessionEducatorDoes"
      )
        ?.textContent
        ?.trim() ||
      "";

    const student =
      byId(
        "sessionStudentDoes"
      )
        ?.textContent
        ?.trim() ||
      "";

    const conditional =
      byId(
        "sessionConditionalGuidance"
      )
        ?.innerHTML ||
      "";

    const collapsedConditional =
      conditional
        .replace(
          /\sopen(?:=(?:""|''|"open"))?/gi,
          ""
        );

    return `
      <div class="session-role-grid session-role-grid-integrated">
        <div class="session-role-box">
          <h3>
            Educator
          </h3>

          <p>
            ${esc(educator)}
          </p>
        </div>

        <div class="session-role-box">
          <h3>
            Student
          </h3>

          <p>
            ${esc(student)}
          </p>
        </div>
      </div>

      <details class="session-integrated-support">
        <summary>
          ${
            stage === "Apply"
              ? "Support during Apply if needed"
              : "If the student needs support"
          }
        </summary>

        <p class="session-ifthen-note">
          Independent attempt first. Use the least support needed,
          retry the same demand, then fade.
        </p>

        <div class="session-integrated-conditionals">
          ${collapsedConditional}
        </div>
      </details>
    `;
  }


  function readyStepSummary(
    task,
    label
  ) {
    if (!task) {
      return `
        <div class="session-step-placeholder">
          ${esc(label)}
        </div>
      `;
    }

    const word =
      readyWord(task);

    return `
      <div class="session-step-placeholder">
        <strong>
          ${esc(label)}
        </strong>

        ${
          word
            ? `
              <span>
                ${esc(word)}
              </span>
            `
            : ""
        }
      </div>
    `;
  }


  function readySyncStepFlow(
    task
  ) {
    readyEnsureStepFlow();

    const digital =
      document.querySelector(
        ".session-digital-card"
      );

    const step2Mount =
      byId(
        "sessionStep2Mount"
      );

    const step3Mount =
      byId(
        "sessionStep3Mount"
      );

    const step2Guidance =
      byId(
        "sessionStep2Guidance"
      );

    const step3Guidance =
      byId(
        "sessionStep3Guidance"
      );

    if (step2Guidance) {
      step2Guidance.innerHTML =
        readyCompactGuidanceHtml(
          "Practice"
        );
    }

    if (step3Guidance) {
      step3Guidance.innerHTML =
        readyCompactGuidanceHtml(
          "Apply"
        );
    }

    const isApply =
      task?.stage ===
      "Apply";

    const practiceTask =
      state.tasks
        ?.find(
          item =>
            item?.stage !==
            "Apply"
        ) ||
      null;

    const applyTask =
      state.tasks
        ?.find(
          item =>
            item?.stage ===
            "Apply"
        ) ||
      null;

    if (
      digital &&
      step2Mount &&
      step3Mount
    ) {
      if (isApply) {
        step3Mount.innerHTML =
          "";

        step3Mount.append(
          digital
        );

        if (
          !step2Mount.contains(
            digital
          )
        ) {
          step2Mount.innerHTML =
            readyStepSummary(
              practiceTask,
              "Teach / Practice item — use Previous to reopen"
            );
        }
      } else {
        step2Mount.innerHTML =
          "";

        step2Mount.append(
          digital
        );

        if (
          !step3Mount.contains(
            digital
          )
        ) {
          step3Mount.innerHTML =
            readyStepSummary(
              applyTask,
              "Next: fresh Apply item using the same skill"
            );
        }
      }
    }

    const stage =
      byId(
        "taskStage"
      );

    const count =
      byId(
        "taskCount"
      );

    if (stage) {
      stage.textContent =
        isApply
          ? "STEP 3 · APPLY"
          : "STEP 2 · TEACH / PRACTICE";
    }

    if (count) {
      count.textContent =
        isApply
          ? "Fresh item"
          : "Practice item";
    }

    const previous =
      byId(
        "previousTaskButton"
      );

    const next =
      byId(
        "nextTaskButton"
      );

    if (previous) {
      previous.textContent =
        isApply
          ? "← Step 2 · Teach / Practice"
          : "← Previous";
    }

    if (next) {
      const nextTask =
        state.tasks
          ?.[
            state.taskIndex + 1
          ];

      next.textContent =
        nextTask
          ?.stage === "Apply"
            ? "Step 3 · Apply →"
            : "Next →";
    }

    const title =
      byId(
        "digitalMaterialTitle"
      );

    if (title) {
      title.textContent =
        readyPartTitle(
          task
        );
    }

    readyPolishSessionUI(
      task
    );
  }
  function renderReadyBreak(
    container,
    task
  ) {
    if (
      task?.recipe
        ?._readyBreakUnavailable
    ) {
      container.innerHTML =
        readyBreakUnavailableMarkup(
          task
        );

      return;
    }

    const selectorDemand =
      task?.recipe
        ?._readySelectorDemand ||
      "full-segmentation";

    if (
      selectorDemand !==
        "full-segmentation"
    ) {
      container.innerHTML = `
        <div class="ready-material-heading">
          <span>
            ${
              task?.stage === "Apply"
                ? "Step 3 · Apply material"
                : "Step 2 · Teach / Practice material"
            }
          </span>

          <h3>
            ${
              selectorDemand ===
                "form-change"
                ? "Break It Apart · Form Change"
                : "Break It Apart · Target Connection"
            }
          </h3>

          <p>
            ${esc(
              task?.prompt ||
              ""
            )}
          </p>
        </div>

        <div class="ready-break-guided-word">
          ${esc(
            readyWord(task)
          )}
        </div>

        ${readyEducatorKeyMarkup(task)}
        ${readySelectorBreakSupportMarkup(task)}
      `;

      return;
    }

    const word =
      readyWord(task);

    const letters =
      readyWordLetters(
        word
      );

    const expected =
      readyExpectedBoundaries(
        task
      );

    container.innerHTML = `
      <div class="ready-material-heading">
        <span>
          ${
            task?.stage === "Apply"
              ? "Step 3 · Apply material"
              : "Step 2 · Teach / Practice material"
          }
        </span>

        <h3>
          Break It Apart
        </h3>

        <p>
          Look at the whole word. Click between letters
          to mark the meaningful word-part boundaries.
        </p>
      </div>

      <div
        class="ready-break-word"
        id="readyBreakWord"
        aria-label="${esc(word)}"
      >
        ${letters
          .map(
            (letter, index) => `
              <span class="ready-break-letter">
                ${esc(letter)}
              </span>

              ${
                index <
                letters.length - 1
                  ? `
                    <button
                      type="button"
                      class="ready-boundary-button"
                      data-ready-boundary="${
                        index + 1
                      }"
                      aria-label="Place a boundary after ${esc(letter)}"
                      aria-pressed="false"
                    >
                      <span></span>
                    </button>
                  `
                  : ""
              }
            `
          )
          .join("")}
      </div>

      <div class="ready-check-row">
        <button
          type="button"
          class="session-primary-button"
          id="readyCheckBreak"
        >
          Check Break It Apart
        </button>

        <span
          id="readyBreakFeedback"
          aria-live="polite"
        ></span>
      </div>

      ${readyEducatorKeyMarkup(task)}
      ${readySelectorBreakSupportMarkup(task)}
    `;

    const chosen =
      new Set();

    container
      .querySelectorAll(
        "[data-ready-boundary]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              const boundary =
                Number(
                  button.dataset
                    .readyBoundary
                );

              if (
                chosen.has(
                  boundary
                )
              ) {
                chosen.delete(
                  boundary
                );
              } else {
                chosen.add(
                  boundary
                );
              }

              const active =
                chosen.has(
                  boundary
                );

              button.classList
                .toggle(
                  "is-active",
                  active
                );

              button.setAttribute(
                "aria-pressed",
                String(active)
              );
            }
          );
        }
      );

    byId(
      "readyCheckBreak"
    )?.addEventListener(
      "click",
      () => {
        const feedback =
          byId(
            "readyBreakFeedback"
          );

        if (!chosen.size) {
          feedback.textContent =
            "Place the boundary line or lines first.";

          return;
        }

        if (!expected.length) {
          feedback.textContent =
            "This item should not be scored as a boundary task.";

          return;
        }

        const actual =
          [
            ...chosen
          ].sort(
            (a, b) =>
              a - b
          );

        const correct =
          actual.length ===
            expected.length &&
          actual.every(
            (value, index) =>
              value ===
              expected[index]
          );

        feedback.textContent =
          correct
            ? "✓ Yes — those boundaries match the meaningful parts."
            : (
                actual.length !==
                  expected.length
                  ? (
                      `Not yet. You marked ${actual.length} ` +
                      `${actual.length === 1 ? "boundary" : "boundaries"}; ` +
                      `this word needs ${expected.length}.`
                    )
                  : "Not yet. Reconsider where the taught word part begins and ends."
              );
      }
    );
  }


  function renderReadyStudentMaterial(
    task
  ) {
    readySyncStepFlow(
      task
    );

    const container =
      ensureReadyMaterialContainer();

    if (!container) {
      return;
    }

    const activity =
      readyActivity(
        task
      );

    readyToggleLegacyBuildChrome(
      activity
    );

    if (
      byId(
        "taskPrompt"
      )
    ) {
      byId(
        "taskPrompt"
      ).textContent =
        task?.prompt ||
        "";
    }

    if (activity === "build") {
      container.innerHTML = `
        <div class="ready-material-heading ready-build-heading">
          <span>
            ${
              task?.stage === "Apply"
                ? "Step 3 · Apply material"
                : "Step 2 · Teach / Practice material"
            }
          </span>

          <h3>
            Build Words
          </h3>

          <p>
            Use the First Volo word-part tiles and mat below.
            Begin without showing meanings; open support only if needed.
          </p>
        </div>

        ${readyPreResponseAccessMarkup(task, "build")}
        ${readyItemReviewMarkup(task)}
        ${readySupportDetailsMarkup()}
      `;

      readyRenderPracticeSet();
      return;
    }

    const renderers = {
      learn:
        renderReadyLearn,
      find:
        renderReadyFind,
      hunt:
        renderReadyHunt,
      meaning:
        renderReadyMeaning,
      morpheme:
        renderReadyMorpheme,
      break:
        renderReadyBreak,
      infer:
        renderReadyInfer,
      use:
        renderReadyUse,
      change:
        renderReadyChange
    };

    (
      renderers[
        activity
      ] ||
      (
        (node, item) =>
          renderReadyGeneric(
            node,
            item,
            activity
          )
      )
    )(
      container,
      task
    );

    const reviewMarkup =
      readyItemReviewMarkup(task);

    if (reviewMarkup) {
      const wrapper =
        document.createElement("div");

      wrapper.innerHTML =
        reviewMarkup;

      const review =
        wrapper.firstElementChild;

      const support =
        container.querySelector(
          ":scope > .ready-support-panel, :scope > .ready-practice-support"
        );

      if (support) {
        container.insertBefore(
          review,
          support
        );
      } else {
        container.appendChild(
          review
        );
      }
    }

    readyRenderPracticeSet();
  }


  function readyMorphemeDistractors(
    count = 3
  ) {
    const targetMeta =
      readyTargetMorphemeMeta();

    const type =
      targetMeta?.type ||
      readyTarget()?.type ||
      "";

    const currentRank =
      readyBandRank(
        readyCurrentBand()
      );

    return readyMorphemeInventory()
      .filter(
        item =>
          item &&
          item.id !==
            targetMeta?.id &&
          (
            !type ||
            item.type === type
          ) &&
          (
            currentRank === 99 ||
            readyBandRank(
              item.introBand
            ) <=
            currentRank
          )
      )
      .slice(0, count);
  }


  function readyShuffle(values) {
    const result =
      values.slice();

    for (
      let i =
        result.length - 1;
      i > 0;
      i -= 1
    ) {
      const j =
        Math.floor(
          Math.random() *
          (i + 1)
        );

      [
        result[i],
        result[j]
      ] = [
        result[j],
        result[i]
      ];
    }

    return result;
  }


  function readyPracticeSetItems() {
    const activity =
      readyActivity(
        state.tasks?.[0] ||
        null
      );

    if (
      activity === "meaning"
    ) {
      return Array.from(
        {
          length: 10
        },
        (_, index) => ({
          word: "",
          _practiceTargetOnly:
            true,
          _practiceTrial:
            index + 1
        })
      );
    }

    const usedWords =
      new Set(
        (state.tasks || [])
          .map(
            task =>
              readyLettersOnly(
                readyWord(task)
              )
          )
          .filter(Boolean)
      );

    const positives =
      readyAllPracticeCandidates(
        activity
      )
        .filter(
          item =>
            !usedWords.has(
              readyLettersOnly(
                item.word
              )
            )
        );

    if (activity === "hunt") {
      const negatives =
        readyWordInventory()
          .filter(
            item =>
              item?.word &&
              !readyProtectedWord(
                item.word
              ) &&
              readyBandAllows(item) &&
              readyFlightAllows(item) &&
              !readyInventoryMatchesTarget(
                item
              )
          )
          .slice()
          .sort(
            (a, b) =>
              readyCandidateScore(b) -
              readyCandidateScore(a)
          );

      const mixed = [
        ...positives
          .slice(0, 5)
          .map(
            item => ({
              ...item,
              _practiceCorrect:
                true
            })
          ),
        ...negatives
          .slice(0, 5)
          .map(
            item => ({
              ...item,
              _practiceCorrect:
                false
            })
          )
      ];

      return readyShuffle(
        mixed
      ).slice(0, 10);
    }

    return positives
      .slice(0, 10);
  }


  function readyFindTargetRange(
    word
  ) {
    const lower =
      String(word || "")
        .toLowerCase();

    const targets =
      readyTargetVariants()
        .slice()
        .sort(
          (a, b) =>
            b.length -
            a.length
        );

    for (
      const target
      of targets
    ) {
      const index =
        lower.indexOf(
          target
        );

      if (index >= 0) {
        return {
          start: index,
          end:
            index +
            target.length
        };
      }
    }

    return null;
  }


  function readyPracticeQuestionMarkup(
    item,
    index,
    activity
  ) {
    const number =
      index + 1;

    const word =
      item?.word ||
      "";

    if (activity === "break") {
      const letters =
        readyWordLetters(
          word
        );

      return `
        <section
          class="ready-practice-question"
          data-practice-question="${index}"
          data-practice-activity="break"
          data-practice-segmentation="${esc(
            item.segmentation ||
            ""
          )}"
        >
          <h3>
            ${number}. Break It Apart
          </h3>

          <div class="ready-practice-break-word">
            ${letters
              .map(
                (letter, letterIndex) => `
                  <span class="ready-break-letter">
                    ${esc(letter)}
                  </span>

                  ${
                    letterIndex <
                    letters.length - 1
                      ? `
                        <button
                          type="button"
                          class="ready-boundary-button"
                          data-practice-boundary="${
                            letterIndex + 1
                          }"
                          aria-pressed="false"
                          aria-label="Place a boundary after ${esc(letter)}"
                        >
                          <span></span>
                        </button>
                      `
                      : ""
                  }
                `
              )
              .join("")}
          </div>

          <p
            class="ready-practice-feedback"
            aria-live="polite"
          ></p>
        </section>
      `;
    }

    if (activity === "find") {
      const letters =
        readyWordLetters(
          word
        );

      const range =
        readyFindTargetRange(
          word
        );

      return `
        <section
          class="ready-practice-question"
          data-practice-question="${index}"
          data-practice-activity="find"
          data-practice-find-start="${
            range?.start ?? -1
          }"
          data-practice-find-end="${
            range?.end ?? -1
          }"
        >
          <h3>
            ${number}. Find ${esc(readyTargetLabel())}
          </h3>

          <div class="ready-practice-find-word">
            ${letters
              .map(
                (letter, letterIndex) => `
                  <button
                    type="button"
                    class="ready-letter-button"
                    data-practice-letter="${letterIndex}"
                    aria-pressed="false"
                  >
                    ${esc(letter)}
                  </button>
                `
              )
              .join("")}
          </div>

          <p
            class="ready-practice-feedback"
            aria-live="polite"
          ></p>
        </section>
      `;
    }

    if (
      activity === "meaning" ||
      activity === "learn"
    ) {
      const target =
        readyTargetMorphemeMeta();

      const correct =
        target?.meaning ||
        readyTargetMeaning();

      const distractors =
        readyMorphemeDistractors(3)
          .map(
            item =>
              item.meaning
          )
          .filter(Boolean);

      const choices =
        readyShuffle([
          correct,
          ...distractors
        ])
          .filter(Boolean)
          .slice(0, 4);

      return `
        <section
          class="ready-practice-question"
          data-practice-question="${index}"
          data-practice-activity="choice"
          data-practice-answer="${esc(correct)}"
        >
          ${
            (() => {
              const variant =
                readyV12MeaningPrompt(
                  index,
                  readyV12TargetCore()
                );

              return `
                <div class="ready-v12-practice-move">
                  Practice move · ${esc(variant.move)}
                </div>

                <h3>
                  ${number}. ${esc(variant.prompt)}
                </h3>
              `;
            })()
          }

          <div class="ready-choice-grid">
            ${choices
              .map(
                choice => `
                  <button
                    type="button"
                    class="ready-choice-button"
                    data-practice-choice="${esc(choice)}"
                    aria-pressed="false"
                  >
                    ${esc(choice)}
                  </button>
                `
              )
              .join("")}
          </div>

          <p
            class="ready-practice-feedback"
            aria-live="polite"
          ></p>
        </section>
      `;
    }

    if (activity === "morpheme") {
      const target =
        readyTargetMorphemeMeta();

      const correct =
        target?.label ||
        readyTargetLabel();

      const engine =
        readyWordPartInstructionEngine();

      const anchorTask =
        readyWordPartStep5AnchorTask();

      const recognitionSpec =
        engine
          ?.buildStep5Recognition
          ?.({
            target:
              readyTarget(),
            task:
              anchorTask
          }) ||
        null;

      const recallSpec =
        engine
          ?.buildStep5Recall
          ?.({
            target:
              readyTarget(),
            task:
              anchorTask
          }) ||
        null;

      if (index === 0) {
        const distractors =
          readyWordPartStep5Distractors(3)
            .map(
              item =>
                item.label
            )
            .filter(Boolean);

        const choices =
          readyShuffle([
            correct,
            ...distractors
          ])
            .filter(Boolean)
            .slice(0, 4);

        const prompt =
          recognitionSpec
            ?.prompt ||
          "Which word part matches this meaning?";

        const cue =
          recognitionSpec
            ?.cue ||
          readyTargetMeaning();

        return `
          <section
            class="ready-practice-question"
            data-practice-question="${index}"
            data-practice-activity="choice"
            data-practice-answer="${esc(correct)}"
          >
            <h3>
              ${number}. ${esc(prompt)}
            </h3>

            <p class="ready-practice-cue">
              ${esc(cue)}
            </p>

            <div class="ready-choice-grid">
              ${choices
                .map(
                  choice => `
                    <button
                      type="button"
                      class="ready-choice-button"
                      data-practice-choice="${esc(choice)}"
                      aria-pressed="false"
                    >
                      ${esc(choice)}
                    </button>
                  `
                )
                .join("")}
            </div>

            <p
              class="ready-practice-feedback"
              aria-live="polite"
            ></p>

            ${readyWordPartStep5SupportMarkup(
              recognitionSpec
            )}

            <button
              type="button"
              class="session-secondary-button"
              data-practice-continue-recall
              hidden
            >
              Continue to independent recall →
            </button>
          </section>
        `;
      }

      const recallPrompt =
        recallSpec
          ?.prompt ||
        "Without looking back, what word part matches that meaning?";

      const recallCue =
        recallSpec
          ?.cue ||
        readyTargetMeaning();

      return `
        <section
          class="ready-practice-question"
          data-practice-question="${index}"
          data-practice-activity="text"
          data-practice-answer="${esc(correct)}"
          data-practice-recall="true"
          hidden
        >
          <h3>
            ${number}. ${esc(recallPrompt)}
          </h3>

          <p class="ready-practice-cue">
            ${esc(recallCue)}
          </p>

          <label class="ready-response-label">
            Word part
            <input
              type="text"
              class="ready-response-input"
              data-practice-text
              autocomplete="off"
            >
          </label>

          <p
            class="ready-practice-feedback"
            aria-live="polite"
          ></p>

          ${readyWordPartStep5SupportMarkup(
            recallSpec
          )}
        </section>
      `;
    }

    if (activity === "hunt") {
      return `
        <section
          class="ready-practice-question ready-practice-hunt-item"
          data-practice-question="${index}"
          data-practice-activity="hunt"
          data-practice-answer="${
            item._practiceCorrect
              ? "yes"
              : "no"
          }"
        >
          <h3>
            ${number}.
          </h3>

          <button
            type="button"
            class="ready-hunt-word"
            data-practice-hunt
            aria-pressed="false"
          >
            ${esc(word)}
          </button>

          <p
            class="ready-practice-feedback"
            aria-live="polite"
          ></p>
        </section>
      `;
    }

    if (activity === "build") {
      const parts =
        readySegmentationParts(
          item.segmentation
        );

      return `
        <section
          class="ready-practice-question"
          data-practice-question="${index}"
          data-practice-activity="build"
          data-practice-answer="${esc(
            parts.join("|")
          )}"
        >
          <h3>
            ${number}. Build ${esc(word)}
          </h3>

          <div class="ready-practice-build-bank">
            ${readyShuffle(parts)
              .map(
                part => {
                  const meta =
                    readyMorphemeMetaFor(
                      part
                    );

                  return `
                    <button
                      type="button"
                      class="ready-practice-build-tile"
                      data-practice-build-part="${esc(part)}"
                    >
                      ${
                        meta?.imagePath
                          ? `
                            <img
                              src="${esc(meta.imagePath)}"
                              alt="${esc(part)}"
                            >
                          `
                          : `
                            <strong>
                              ${esc(part)}
                            </strong>
                          `
                      }
                    </button>
                  `;
                }
              )
              .join("")}
          </div>

          <div
            class="ready-practice-build-line"
            data-practice-build-line
          ></div>

          <button
            type="button"
            class="session-secondary-button"
            data-practice-build-clear
          >
            Clear
          </button>

          <p
            class="ready-practice-feedback"
            aria-live="polite"
          ></p>
        </section>
      `;
    }

    const key =
      item.definition ||
      item.literal ||
      "";

    const prompt =
      activity === "infer"
        ? (
            `Use the known morphology to infer what ${word} probably means. ` +
            `Explain how ${readyTargetLabel()} helped.`
          )
        : activity === "change"
          ? (
              `Write another form from the same word family as ${word}. ` +
              `Explain what changed.`
            )
          : (
              `Use ${word} in a sentence that shows its meaning. ` +
              `Then explain what ${readyTargetLabel()} contributes.`
            );

    return `
      <section
        class="ready-practice-question"
        data-practice-question="${index}"
        data-practice-activity="teacher-check"
      >
        <h3>
          ${number}. ${esc(word)}
        </h3>

        <p>
          ${esc(prompt)}
        </p>

        <textarea
          class="ready-response-textarea"
          rows="3"
        ></textarea>

        <div class="ready-practice-teacher-check">
          ${
            key
              ? `
                <details>
                  <summary>

                    Review after the attempt
                  </summary>

                  <p>
                    ${esc(key)}
                  </p>
                </details>
              `
              : ""
          }

          <button
            type="button"
            class="session-secondary-button"
            data-practice-mark="correct"
          >
            ✓ Got it
          </button>

          <button
            type="button"
            class="session-secondary-button"
            data-practice-mark="retry"
          >
            Retry
          </button>
        </div>

        <p
          class="ready-practice-feedback"
          aria-live="polite"
        ></p>
      </section>
    `;
  }


  function readyBindPracticeQuestions(
    container
  ) {
    container
      .querySelectorAll(
        ".ready-practice-question"
      )
      .forEach(
        question => {
          const kind =
            question.dataset
              .practiceActivity;

          const feedback =
            question.querySelector(
              ".ready-practice-feedback"
            );

          if (kind === "break") {
            const selected =
              new Set();

            question
              .querySelectorAll(
                "[data-practice-boundary]"
              )
              .forEach(
                button => {
                  button.addEventListener(
                    "click",
                    () => {
                      const value =
                        Number(
                          button.dataset
                            .practiceBoundary
                        );

                      if (
                        selected.has(value)
                      ) {
                        selected.delete(value);
                      } else {
                        selected.add(value);
                      }

                      const active =
                        selected.has(value);

                      button.classList
                        .toggle(
                          "is-active",
                          active
                        );

                      button.setAttribute(
                        "aria-pressed",
                        String(active)
                      );

                      question.dataset
                        .practiceSelected =
                          [
                            ...selected
                          ]
                            .sort(
                              (a, b) =>
                                a - b
                            )
                            .join(",");
                    }
                  );
                }
              );
          }

          if (kind === "find") {
            const selected =
              new Set();

            question
              .querySelectorAll(
                "[data-practice-letter]"
              )
              .forEach(
                button => {
                  button.addEventListener(
                    "click",
                    () => {
                      const value =
                        Number(
                          button.dataset
                            .practiceLetter
                        );

                      if (
                        selected.has(value)
                      ) {
                        selected.delete(value);
                      } else {
                        selected.add(value);
                      }

                      const active =
                        selected.has(value);

                      button.classList
                        .toggle(
                          "is-selected",
                          active
                        );

                      button.setAttribute(
                        "aria-pressed",
                        String(active)
                      );

                      question.dataset
                        .practiceSelected =
                          [
                            ...selected
                          ]
                            .sort(
                              (a, b) =>
                                a - b
                            )
                            .join(",");
                    }
                  );
                }
              );
          }

          if (kind === "text") {
            const input =
              question.querySelector(
                "[data-practice-text]"
              );

            input?.addEventListener(
              "input",
              () => {
                question.dataset
                  .practiceSelected =
                    input.value ||
                    "";
              }
            );
          }

          if (kind === "choice") {
            question
              .querySelectorAll(
                "[data-practice-choice]"
              )
              .forEach(
                button => {
                  button.addEventListener(
                    "click",
                    () => {
                      question
                        .querySelectorAll(
                          "[data-practice-choice]"
                        )
                        .forEach(
                          other => {
                            other.setAttribute(
                              "aria-pressed",
                              "false"
                            );
                          }
                        );

                      button.setAttribute(
                        "aria-pressed",
                        "true"
                      );

                      question.dataset
                        .practiceSelected =
                          button.dataset
                            .practiceChoice ||
                          "";

                      const continueRecall =
                        question.querySelector(
                          "[data-practice-continue-recall]"
                        );

                      if (continueRecall) {
                        continueRecall.hidden =
                          false;
                      }
                    }
                  );
                }
              );
          }

          question
            .querySelector(
              "[data-practice-continue-recall]"
            )
            ?.addEventListener(
              "click",
              () => {
                const recall =
                  container.querySelector(
                    "[data-practice-recall='true']"
                  );

                if (!recall) {
                  return;
                }

                question.dataset
                  .practiceSequentialComplete =
                    "true";

                question.hidden =
                  true;

                recall.hidden =
                  false;

                const check =
                  byId(
                    "readyCheckPracticeSet"
                  );

                if (check) {
                  check.hidden =
                    false;
                }

                recall
                  .querySelector(
                    "[data-practice-text]"
                  )
                  ?.focus();
              }
            );

          if (kind === "hunt") {
            const button =
              question.querySelector(
                "[data-practice-hunt]"
              );

            button?.addEventListener(
              "click",
              () => {
                const active =
                  button.getAttribute(
                    "aria-pressed"
                  ) !== "true";

                button.setAttribute(
                  "aria-pressed",
                  String(active)
                );

                button.classList
                  .toggle(
                    "is-selected",
                    active
                  );

                question.dataset
                  .practiceSelected =
                    active
                      ? "yes"
                      : "no";
              }
            );
          }

          if (kind === "build") {
            const chosen = [];

            const line =
              question.querySelector(
                "[data-practice-build-line]"
              );

            const refresh = () => {
              if (line) {
                line.innerHTML =
                  chosen
                    .map(
                      part => `
                        <span class="ready-practice-built-part">
                          ${esc(part)}
                        </span>
                      `
                    )
                    .join(
                      '<span class="ready-practice-plus">+</span>'
                    );
              }

              question.dataset
                .practiceSelected =
                  chosen.join("|");
            };

            question
              .querySelectorAll(
                "[data-practice-build-part]"
              )
              .forEach(
                button => {
                  button.addEventListener(
                    "click",
                    () => {
                      chosen.push(
                        button.dataset
                          .practiceBuildPart ||
                        ""
                      );

                      refresh();
                    }
                  );
                }
              );

            question
              .querySelector(
                "[data-practice-build-clear]"
              )
              ?.addEventListener(
                "click",
                () => {
                  chosen.length = 0;
                  refresh();
                }
              );
          }

          question
            .querySelectorAll(
              "[data-practice-mark]"
            )
            .forEach(
              button => {
                button.addEventListener(
                  "click",
                  () => {
                    const value =
                      button.dataset
                        .practiceMark;

                    question.dataset
                      .practiceManual =
                        value ===
                        "correct"
                          ? "correct"
                          : "retry";

                    if (feedback) {
                      feedback.textContent =
                        value ===
                        "correct"
                          ? "✓ Counted as correct."
                          : "Retry the same demand with the least support needed.";
                    }
                  }
                );
              }
            );
        }
      );

    byId(
      "readyCheckPracticeSet"
    )?.addEventListener(
      "click",
      () => {
        const visible =
          [
            ...container
              .querySelectorAll(
                ".ready-practice-question:not([hidden]), " +
                ".ready-practice-question[data-practice-sequential-complete='true']"
              )
          ];

        let scorable = 0;
        let correct = 0;

        visible.forEach(
          question => {
            const kind =
              question.dataset
                .practiceActivity;

            const feedback =
              question.querySelector(
                ".ready-practice-feedback"
              );

            let result =
              null;

            if (kind === "break") {
              scorable += 1;

              const segmentation =
                question.dataset
                  .practiceSegmentation ||
                "";

              const parts =
                readySegmentationParts(
                  segmentation
                )
                  .map(
                    readyLettersOnly
                  );

              let total = 0;

              const expected =
                parts
                  .slice(0, -1)
                  .map(
                    part => {
                      total +=
                        part.length;

                      return total;
                    }
                  )
                  .join(",");

              result =
                (
                  question.dataset
                    .practiceSelected ||
                  ""
                ) === expected;
            } else if (
              kind === "find"
            ) {
              scorable += 1;

              const start =
                Number(
                  question.dataset
                    .practiceFindStart
                );

              const end =
                Number(
                  question.dataset
                    .practiceFindEnd
                );

              const expected =
                [];

              for (
                let i = start;
                i < end;
                i += 1
              ) {
                if (i >= 0) {
                  expected.push(i);
                }
              }

              result =
                (
                  question.dataset
                    .practiceSelected ||
                  ""
                ) ===
                expected.join(",");
            } else if (
              kind === "text"
            ) {
              scorable += 1;

              result =
                readyLettersOnly(
                  question.dataset
                    .practiceSelected ||
                  ""
                ) ===
                readyLettersOnly(
                  question.dataset
                    .practiceAnswer ||
                  ""
                );
            } else if (
              kind === "choice"
            ) {
              scorable += 1;

              result =
                (
                  question.dataset
                    .practiceSelected ||
                  ""
                ) ===
                (
                  question.dataset
                    .practiceAnswer ||
                  ""
                );
            } else if (
              kind === "hunt"
            ) {
              scorable += 1;

              result =
                (
                  question.dataset
                    .practiceSelected ||
                  "no"
                ) ===
                (
                  question.dataset
                    .practiceAnswer ||
                  "no"
                );
            } else if (
              kind === "build"
            ) {
              scorable += 1;

              result =
                (
                  question.dataset
                    .practiceSelected ||
                  ""
                ) ===
                (
                  question.dataset
                    .practiceAnswer ||
                  ""
                );
            } else if (
              kind ===
              "teacher-check"
            ) {
              if (
                question.dataset
                  .practiceManual
              ) {
                scorable += 1;

                result =
                  question.dataset
                    .practiceManual ===
                  "correct";
              }
            }

            if (result === true) {
              correct += 1;

              if (feedback) {
                feedback.textContent =
                  "✓ Correct.";
              }
            } else if (
              result === false
            ) {
              if (feedback) {
                feedback.textContent =
                  "Not yet. Retry the same demand; use support only if needed.";
              }
            }
          }
        );

        const summary =
          byId(
            "readyPracticeSummary"
          );

        if (summary) {
          summary.textContent =
            scorable
              ? `${correct}/${scorable} correct on the items checked.`
              : "Complete or educator-score the visible items first.";
        }

        if (
          currentActivity() ===
            "morpheme" &&
          scorable >= 2
        ) {
          const actions =
            byId(
              "readyCheckPracticeSet"
            )
              ?.closest(
                ".ready-practice-actions"
              );

          const engine =
            readyWordPartInstructionEngine();

          const challenge =
            engine
              ?.buildSillyChallenge
              ?.({
                target:
                  readyTarget()
              }) ||
            null;

          if (
            actions &&
            challenge &&
            !container.querySelector(
              "[data-word-part-silly-challenge]"
            )
          ) {
            const node =
              document.createElement(
                "section"
              );

            node.className =
              "ready-v12-after-response ready-word-part-silly-challenge";

            node.dataset
              .wordPartSillyChallenge =
                "true";

            node.innerHTML = `
              <strong>
                Optional · ${esc(
                  challenge.title ||
                  "Make a Silly Word"
                )}
              </strong>

              <p>
                ${esc(challenge.prompt)}
              </p>

              <label class="ready-response-label">
                Your pretend word and what it means
                <textarea
                  class="ready-response-textarea"
                  rows="2"
                ></textarea>
              </label>

              <details class="ready-support-panel">
                <summary>
                  Need a silly-word starter?
                </summary>

                <div class="ready-support-panel-body">
                  <p>
                    ${esc(challenge.starter)}
                  </p>
                </div>
              </details>

              <p class="session-ifthen-note">
                This challenge is optional and is not scored.
              </p>
            `;

            actions.insertAdjacentElement(
              "afterend",
              node
            );
          }
        }
        if (
          currentActivity() ===
            "morpheme" &&
          scorable >= 2 &&
          correct === scorable
        ) {
          const actions =
            byId(
              "readyCheckPracticeSet"
            )
              ?.closest(
                ".ready-practice-actions"
              );

          if (
            actions &&
            !container.querySelector(
              "[data-word-part-teacher-follow-up]"
            )
          ) {
            const applicationWords =
              readyV12ApplicationWords();

            const applicationWord =
              applicationWords[0] ||
              "";

            const target =
              readyV12TargetCore();

            if (
              applicationWord &&
              target
            ) {
              const note =
                document.createElement(
                  "div"
                );

              note.className =
                "ready-v12-after-response ready-teacher-follow-up";

              note.dataset
                .wordPartTeacherFollowUp =
                  "true";

              note.innerHTML = `
                <strong>
                  Teacher follow-up (optional):
                </strong>
                The two Word Part responses are complete.
                If additional application is helpful, ask the student to locate
                <strong>
                  ${esc(target)}
                </strong>
                in
                <strong>
                  ${esc(applicationWord)}
                </strong>.
                Use this only after independent recall so the whole word does not cue the answer.
                This follow-up is not part of the scored Practice Set.
              `;

              actions.insertAdjacentElement(
                "afterend",
                note
              );
            }
          }
        }
      }
    );

    byId(
      "readyContinuePracticeSet"
    )?.addEventListener(
      "click",
      event => {
        container
          .querySelectorAll(
            ".ready-practice-question[data-practice-extra='true']"
          )
          .forEach(
            question => {
              question.hidden =
                false;
            }
          );

        event.currentTarget
          .hidden =
            true;
      }
    );
  }


  /* FIRST_VOLO_WORD_PART_OPTIONAL_NAV_LABEL_V4P */

  /* FIRST_VOLO_WORD_PART_FINAL_COPY_POLISH_V4O */

  /* FIRST_VOLO_WORD_PART_STEP5_PRINT_SAFETY_V4N */

  function readyV14Step5Items(
    activity,
    ordinaryItems
  ) {
    if (
      activity !==
      "morpheme"
    ) {
      return ordinaryItems;
    }

    /*
     * Word Part Step 5 is recognition + independent recall of the
     * already-taught target. These two opportunities do not consume
     * additional whole-word inventory.
     */
    return [
      {
        word:
          readyTargetLabel(),
        step5Mode:
          "recognition"
      },
      {
        word:
          readyTargetLabel(),
        step5Mode:
          "recall"
      }
    ];
  }


  function readyStep5Copy(
    activity =
      readyActivity(
        state.tasks?.[0] ||
        null
      ),
    minutes =
      readyV13DurationMinutes(),
    itemCount = null
  ) {
    const policy =
      readyV13DurationPolicy[
        Number(minutes)
      ] ||
      readyV13DurationPolicy[15];

    const hasExplicitItemCount =
      itemCount !== null &&
      itemCount !== undefined &&
      Number.isFinite(
        Number(itemCount)
      );

    const availableCount =
      hasExplicitItemCount
        ? Number(itemCount)
        : (
            activity === "morpheme"
              ? 2
              : Math.min(
                  readyPracticeSetItems()
                    .length,
                  policy.step5Limit
                )
          );

    if (activity === "morpheme") {
      return {
        heading:
          "Optional Practice Set",
        time:
          "2 targeted items",
        planDetail:
          "2 targeted Word Part opportunities if additional practice is helpful",
        intro:
          "Two targeted Word Part opportunities: recognition first, then independent recall."
      };
    }

    if (availableCount <= 0) {
      return {
        heading:
          "Optional Practice Set",
        time:
          "No additional items",
        planDetail:
          "no additional appropriate items are available today",
        intro:
          "No additional appropriate items are available for this target and activity today."
      };
    }

    if (Number(minutes) === 30) {
      if (availableCount < 5) {
        return {
          heading:
            "Practice Set",
          time:
            `${availableCount} available ${availableCount === 1 ? "item" : "items"}`,
          planDetail:
            `use all ${availableCount} available ${availableCount === 1 ? "item" : "items"} as appropriate`,
          intro:
            `Use all ${availableCount} available ${availableCount === 1 ? "item" : "items"} as appropriate. Do not manufacture or repeat items to reach five.`
        };
      }

      const extra =
        Math.max(
          0,
          availableCount - 5
        );

      return {
        heading:
          "Practice Set",
        time:
          extra
            ? `5 + up to ${extra} more`
            : "5 items",
        planDetail:
          extra
            ? `first 5 items, with up to ${extra} more as appropriate`
            : "5 available items",
        intro:
          extra
            ? `Complete the first five items. Continue with up to ${extra} additional ${extra === 1 ? "item" : "items"} as appropriate.`
            : "Complete the five available items as appropriate."
      };
    }

    const optionalLabel =
      Number(minutes) === 10
        ? "Optional extension"
        : "Optional practice";

    return {
      heading:
        "Optional Practice Set",
      time:
        `Up to ${availableCount} ${availableCount === 1 ? "item" : "items"}`,
      planDetail:
        `up to ${availableCount} ${availableCount === 1 ? "item" : "items"} if time remains or additional practice is indicated`,
      intro:
        `${optionalLabel}. Use up to ${availableCount} ${availableCount === 1 ? "item" : "items"} if time remains or additional practice is indicated.`
    };
  }


  function readyV14StudentPrintPrompt(
    task,
    {
      includeMeaning =
        true
    } = {}
  ) {
    const activity =
      readyActivity(task);

    const isApply =
      task?.stage ===
      "Apply";

    if (
      activity ===
        "morpheme" &&
      isApply
    ) {
      const meaning =
        readyTargetMeaning();

      const firstSentence =
        meaning &&
        includeMeaning
          ? `Which word part matches this meaning: “${meaning}”?`
          : "Which word part matches this meaning?";

      return (
        `${firstSentence} ` +
        "After you respond, your teacher will reveal the fresh word selected for this session. " +
        "Find the word part in that word and explain what it contributes."
      );
    }

    return task?.prompt || "";
  }


  function readyV14StudentPrintableTask(
    task
  ) {
    if (
      readyActivity(task) !==
        "morpheme" ||
      task?.stage !==
        "Apply"
    ) {
      return task;
    }

    return {
      ...task,
      word: null,
      prompt:
        readyV14StudentPrintPrompt(
          task,
          {
            includeMeaning:
              false
          }
        ),
      recipe: {
        ...(task?.recipe || {}),
        word: null,
        applyWord: null
      }
    };
  }


  function readyRenderPracticeSet() {
    readyEnsureStepFlow();

    const container =
      byId(
        "sessionPracticeSet"
      );

    if (!container) {
      return;
    }

    const activity =
      readyActivity(
        state.tasks?.[0] ||
        null
      );

    const ordinaryItems =
      readyPracticeSetItems();

    const items =
      readyV14Step5Items(
        activity,
        ordinaryItems
      );

    const minutes =
      readyV13DurationMinutes();

    const policy =
      readyV13DurationPolicy[
        minutes
      ] ||
      readyV13DurationPolicy[
        15
      ];

    const activityStep5Limit =
      activity === "morpheme"
        ? 2
        : policy.step5Limit;

    const allowedItems =
      items.slice(
        0,
        activityStep5Limit
      );

    const allowMore =
      activity !== "morpheme" &&
      policy.step5Limit >
      5;

    const step5Copy =
      readyStep5Copy(
        activity,
        minutes,
        allowedItems.length
      );

    const introText =
      step5Copy.intro;

    const signature =
      [
        readyTargetLabel(),
        activity,
        readyCurrentBand(),
        readyCurrentFlight(),
        minutes,
        ...allowedItems.map(
          item =>
            item.word
        )
      ].join("|");

    if (
      container.dataset
        .practiceSignature ===
      signature
    ) {
      return;
    }

    container.dataset
      .practiceSignature =
        signature;

    const minimumPracticeItems =
      activity === "morpheme"
        ? 2
        : 1;

    if (
      items.length <
      minimumPracticeItems
    ) {
      container.innerHTML = `
        <div class="ready-practice-unavailable">
          <strong>
            Practice set not available for this target yet.
          </strong>

          <p>
            There are currently no appropriate additional words
            for this exact activity at the learner's current level.
            Use Part A and Part B today rather than repeating or forcing unsuitable words.
          </p>
        </div>
      `;

      readyV7PolishPracticeSetCopy();

      return;
    }

    container.innerHTML = `
      <div class="ready-practice-set-heading">
        <strong>
          ${esc(readyTargetLabel())}
          ·
          ${esc(
            READY_ACTIVITY_LABELS[
              activity
            ] ||
            activity
          )}
        </strong>

        <span>
          ${esc(introText)}
        </span>
      </div>

      <div class="ready-practice-question-list">
        ${allowedItems
          .map(
            (item, index) => {
              const markup =
                readyPracticeQuestionMarkup(
                  item,
                  index,
                  activity
                );

              if (index < 5) {
                return markup;
              }

              return markup.replace(
                'class="ready-practice-question',
                'hidden data-practice-extra="true" class="ready-practice-question'
              );
            }
          )
          .join("")}
      </div>

      <div class="ready-practice-actions">
        ${
          allowMore &&
          allowedItems.length > 5
            ? `
              <button
                type="button"
                class="session-secondary-button"
                id="readyContinuePracticeSet"
              >
                Continue for ${
                  Math.min(
                    5,
                    allowedItems.length - 5
                  )
                } more
              </button>
            `
            : ""
        }

        <button
          type="button"
          class="session-primary-button"
          id="readyCheckPracticeSet"
          ${
            activity === "morpheme"
              ? "hidden"
              : ""
          }
        >
          Check Practice Set
        </button>

        <strong
          id="readyPracticeSummary"
          aria-live="polite"
        ></strong>
      </div>

      ${
        activity === "morpheme"
          ? ""
          : readyV7PracticeSupportMarkup(
              activity
            )
      }
    `;

    readyBindPracticeQuestions(
      container
    );

    if (
      activity === "meaning" ||
      activity === "morpheme"
    ) {
      const applicationWords =
        readyV12ApplicationWords();

      const target =
        readyV12TargetCore();

      [
        ...container.querySelectorAll(
          ".ready-practice-question h3"
        )
      ].forEach(
        (
          node,
          index
        ) => {
          readyV12WireApplication(
            node,
            applicationWords[
              index %
              Math.max(
                applicationWords.length,
                1
              )
            ] ||
            "",
            target
          );
        }
      );
    }

    readyV7PolishPracticeSetCopy();
  }


  function readyPrintablePracticeMarkup() {
    const activity =
      readyActivity(
        state.tasks?.[0] ||
        null
      );

    const ordinaryItems =
      readyPracticeSetItems();

    const items =
      readyV14Step5Items(
        activity,
        ordinaryItems
      );

    const minutes =
      readyV13DurationMinutes();

    const policy =
      readyV13DurationPolicy[
        minutes
      ] ||
      readyV13DurationPolicy[
        15
      ];

    const activityStep5Limit =
      activity === "morpheme"
        ? 2
        : policy.step5Limit;

    const allowedItems =
      items.slice(
        0,
        activityStep5Limit
      );

    const step5Copy =
      readyStep5Copy(
        activity,
        minutes,
        allowedItems.length
      );

    const printIntro =
      step5Copy.intro;

    const minimumPracticeItems =
      activity === "morpheme"
        ? 2
        : 1;

    if (
      items.length <
      minimumPracticeItems
    ) {
      return `
        <section class="print-ready-task">
          <div class="print-ready-task-heading">
            <span>
              Step 5
            </span>

            <h2>
              Practice Set
            </h2>
          </div>

          <p>
            ${
              activity === "morpheme"
                ? (
                    "This Word Part practice set requires two targeted opportunities. " +
                    "Use recognition followed by independent recall."
                  )
                : (
                    "This target does not yet have five appropriate additional items " +
                    "for this activity at the learner's current level. " +
                    "Use the available session activities rather than repeating or forcing unsuitable items."
                  )
            }
          </p>
        </section>
      `;
    }

    const rows =
      allowedItems
        .map(
          (item, index) => {
            if (activity === "break") {
              return `
                <div class="print-ready-practice-item">
                  <strong>
                    ${index + 1}.
                  </strong>

                  <span class="print-ready-practice-word">
                    ${esc(item.word)}
                  </span>

                  <div class="print-ready-boundary-line"></div>
                </div>
              `;
            }

            if (
              activity === "find" ||
              activity === "hunt"
            ) {
              return `
                <div class="print-ready-practice-item">
                  <strong>
                    ${index + 1}.
                  </strong>

                  <span class="print-ready-practice-word">
                    ${esc(item.word)}
                  </span>
                </div>
              `;
            }

            if (activity === "meaning") {
              const variant =
                readyV12MeaningPrompt(
                  index,
                  readyV12TargetCore()
                );

              return `
                <div class="print-ready-practice-item">
                  <strong>
                    ${index + 1}. ${esc(variant.prompt)}
                  </strong>

                  <div class="print-ready-lines"></div>
                </div>
              `;
            }

            if (activity === "morpheme") {
              const engine =
                readyWordPartInstructionEngine();

              const anchorTask =
                readyWordPartStep5AnchorTask();

              const recognitionSpec =
                engine
                  ?.buildStep5Recognition
                  ?.({
                    target:
                      readyTarget(),
                    task:
                      anchorTask
                  }) ||
                null;

              const recallSpec =
                engine
                  ?.buildStep5Recall
                  ?.({
                    target:
                      readyTarget(),
                    task:
                      anchorTask
                  }) ||
                null;

              const legacyRecallPrompt =
                "Cover Item 1. Then write the word part from memory.";

              if (index === 0) {
                const target =
                  readyTargetMorphemeMeta();

                const correct =
                  target?.label ||
                  readyTargetLabel();

                const distractors =
                  readyWordPartStep5Distractors(3)
                    .map(
                      item =>
                        item.label
                    )
                    .filter(Boolean);

                const choices =
                  readyShuffle([
                    correct,
                    ...distractors
                  ])
                    .filter(Boolean)
                    .slice(0, 4);

                const prompt =
                  recognitionSpec
                    ?.prompt ||
                  "Which word part matches this meaning?";

                const cue =
                  recognitionSpec
                    ?.cue ||
                  readyTargetMeaning();

                return `
                  <div class="print-ready-practice-item">
                    <strong>
                      ${index + 1}. ${esc(prompt)}
                    </strong>

                    <p>
                      ${esc(cue)}
                    </p>

                    <div class="print-ready-word-grid">
                      ${choices
                        .map(
                          choice => `
                            <span>
                              ${esc(choice)}
                            </span>
                          `
                        )
                        .join("")}
                    </div>
                  </div>
                `;
              }

              const prompt =
                recallSpec
                  ?.prompt
                  ? (
                      `Cover Item 1. ${recallSpec.prompt}`
                    )
                  : legacyRecallPrompt;

              return `
                <div class="print-ready-practice-item">
                  <strong>
                    ${index + 1}. ${esc(prompt)}
                  </strong>

                  <p>
                    ${esc(
                      recallSpec
                        ?.cue ||
                      readyTargetMeaning()
                    )}
                  </p>

                  <div class="print-ready-lines"></div>
                </div>
              `;
            }

            if (activity === "build") {
              return `
                <div class="print-ready-practice-item">
                  <strong>
                    ${index + 1}. Build:
                  </strong>

                  <span class="print-ready-practice-word">
                    ${esc(item.word)}
                  </span>

                  <div class="print-ready-lines"></div>
                </div>
              `;
            }

            return `
              <div class="print-ready-practice-item">
                <strong>
                  ${index + 1}. ${esc(item.word)}
                </strong>

                <div class="print-ready-lines"></div>
              </div>
            `;
          }
        )
        .join("");

    return `
      <section class="print-ready-task print-ready-practice-set">
        <div class="print-ready-task-heading">
          <span>
            Step 5
          </span>

          <h2>
            ${
              step5Copy.heading
            } · ${
              esc(
                READY_ACTIVITY_LABELS[
                  activity
                ] ||
                activity
              )
            }
          </h2>

          <p>
            ${esc(printIntro)}
          </p>
        </div>

        ${rows}
      </section>
    `;
  }


  function renderReadyPrintable() {
    const materialPage =
      ensureReadyPrintPage(
        "printReadyStudentMaterials",
        "Student Activity Materials",
        "print-ready-material-page"
      );

    const supportPage =
      ensureReadyPrintPage(
        "printReadyEducatorSupport",
        "Educator Support Visual",
        "print-ready-support-page"
      );

    const materialBody =
      materialPage
        ?.querySelector(
          "[data-ready-page-body]"
        );

    if (materialBody) {
      materialBody.innerHTML =
        (state.tasks || [])
          .map(
            task =>
              task?.recipe
                ?._readyBreakUnavailable
                ? `
                    <section class="print-ready-task">
                      <div class="print-ready-task-heading">
                        <span>
                          Part B · Apply
                        </span>

                        <h2>
                          ${esc(
                            readyActivityDisplayName(
                              task
                            )
                          )}
                        </h2>
                      </div>

                      <p>
                        No second fair whole-word item is currently available.
                        Do not reuse the Part A word as a fresh Apply item.
                      </p>
                    </section>
                  `
                : readyPrintableTaskMarkup(
                    readyV14StudentPrintableTask(
                      task
                    )
                  )
          )
          .join("") +
        readyPrintableFamilyContrastMarkup() +
        readyPrintablePracticeMarkup();
    }

    const supportBody =
      supportPage
        ?.querySelector(
          "[data-ready-page-body]"
        );

    if (supportBody) {
      const breakKeys =
        (state.tasks || [])
          .map(
            task => ({
              activity:
                readyActivity(
                  task
                ),
              word:
                readyWord(task),
              key:
                readyExpectedWordSum(
                  task
                )
            })
          )
          .filter(
            item =>
              item.activity ===
                "break" &&
              item.key
          );

      const teachingKeys =
        (state.tasks || [])
          .map(
            task => ({
              stage:
                task?.stage ||
                "Practice",
              activity:
                readyActivityDisplayName(
                  task
                ),
              word:
                readyWord(task),
              teaching:
                readyTaskTeachingAccessMarkup(
                  task,
                  readyActivity(task)
                ),
              nonTarget:
                readyTaskNonTargetSupportMarkup(
                  task
                )
            })
          )
          .filter(
            item =>
              item.teaching ||
              item.nonTarget
          );

      supportBody.innerHTML = `
        <div class="print-ready-support-warning">
          <strong>
            Educator support
          </strong>

          <p>
            Use the item-specific prompts below. When a whole-word meaning or non-target word part is incidental to the lesson, First Volo may provide it so the student can focus on the target. Check Transfer still begins with an unsupported whole-word inference attempt.
          </p>
        </div>

        <div class="print-ready-support-tile">
          ${readyTileMarkup(
            readySupportTile(),
            {
              includeMeaning: false
            }
          )}
        </div>

        ${
          readyTargetMeaning()
            ? `
              <section class="print-ready-key-section">
                <h2>
                  Optional meaning cue
                </h2>

                <p>
                  ${esc(
                    readyTargetMeaning()
                  )}
                </p>
              </section>
            `
            : ""
        }

        ${
          teachingKeys.length
            ? `
              <section class="print-ready-key-section">
                <h2>
                  Instructional teaching bridges
                </h2>

                <p>
                  These are educator-only teaching prompts for the actual words in this session.
                </p>

                ${teachingKeys
                  .map(
                    item => `
                      <div class="print-ready-teaching-bridge">
                        <p>
                          <strong>
                            ${esc(item.stage)} · ${esc(item.activity)}${item.word ? ` · ${esc(item.word)}` : ""}
                          </strong>
                        </p>
                        ${item.nonTarget}
                        ${item.teaching}
                      </div>
                    `
                  )
                  .join("")}
              </section>
            `
            : ""
        }

        ${
          breakKeys.length
            ? `
              <section class="print-ready-key-section">
                <h2>

                  Break It Apart answers
                </h2>

                ${breakKeys
                  .map(
                    item => `
                      <p>
                        <strong>
                          ${esc(item.word)}:
                        </strong>

                        ${esc(item.key)}
                      </p>
                    `
                  )
                  .join("")}
              </section>
            `
            : ""
        }
      `;
    }

    const retrieveSupport =
      document.querySelector(
        ".session-retrieve-support"
      );

    if (retrieveSupport) {
      let wrap =
        retrieveSupport.querySelector(
          ".ready-retrieve-visual-support"
        );

      if (!wrap) {
        wrap =
          document.createElement(
            "details"
          );

        wrap.className =
          "ready-retrieve-visual-support ready-support-panel";

        retrieveSupport.append(
          wrap
        );
      }

      wrap.innerHTML = `
        <summary>
          Open the familiar visual tile if needed
        </summary>

        <div class="ready-support-panel-body">
          <p>
            Show after the independent retrieval attempt, then retry.
          </p>

          ${readyTileMarkup(
            readyRetrieveSupportTile(),
            {
              includeMeaning: false
            }
          )}

          ${
            readyRetrieveSupportMeaning()
              ? `
                <details class="ready-meaning-reveal">
                  <summary>
                    Show meaning if still needed
                  </summary>

                  <p>
                    ${esc(
                      readyRetrieveSupportMeaning()
                    )}
                  </p>
                </details>
              `
              : ""
          }
        </div>
      `;

      const oldLists =
        retrieveSupport
          .querySelectorAll(
            ":scope > strong, :scope > ul"
          );

      oldLists.forEach(
        node => {
          node.hidden =
            true;
        }
      );
    }

    const activity =
      readyActivity(
        state.tasks?.[0] ||
        null
      );

    document
      .querySelectorAll(
        ".print-mat-page, .print-cards-prompts-page"
      )
      .forEach(
        page => {
          page.hidden =
            activity !== "build";
        }
      );

    document
      .querySelectorAll(
        ".print-session-roles, .print-support-box"
      )
      .forEach(
        node => {
          node.hidden =
            true;
        }
      );
  }




  /* FIRST_VOLO_ACTIVITY_PARTS_POLISH_V4 */

  function readyActivityDisplayName(task) {
    return (
      READY_ACTIVITY_LABELS[
        readyActivity(task)
      ] ||
      "Target Activity"
    );
  }


  function readyPartTitle(task) {
    const activity =
      readyActivityDisplayName(task);

    return (
      task?.stage === "Apply"
        ? `${activity} — Part B: Apply`
        : `${activity} — Part A: Practice`
    );
  }


  function readyHideLegacyDuplicateSurface(task) {
    const digital =
      document.querySelector(
        ".session-digital-card"
      );

    if (!digital) {
      return;
    }

    const activity =
      readyActivity(task);

    if (activity === "build") {
      return;
    }

    const anchors = [
      ...digital.querySelectorAll(
        "input[placeholder], textarea, button"
      )
    ];

    anchors.forEach(
      anchor => {
        const placeholder =
          String(
            anchor.getAttribute?.(
              "placeholder"
            ) ||
            ""
          )
            .trim()
            .toLowerCase();

        const buttonText =
          String(
            anchor.textContent ||
            ""
          )
            .trim()
            .toLowerCase();

        const looksLegacy =
          placeholder.startsWith(
            "example:"
          ) ||
          buttonText.startsWith(
            "review "
          );

        if (!looksLegacy) {
          return;
        }

        let node =
          anchor;

        while (
          node.parentElement &&
          node.parentElement !==
            digital
        ) {
          node =
            node.parentElement;
        }

        if (
          node.parentElement ===
            digital &&
          !node.querySelector?.(
            ".ready-student-material"
          )
        ) {
          node.hidden =
            true;
        }
      }
    );
  }


  function readyCompactGuidanceHtml(stage) {
    const educator =
      byId(
        "sessionEducatorDoes"
      )
        ?.textContent
        ?.trim() ||
      "";

    const student =
      byId(
        "sessionStudentDoes"
      )
        ?.textContent
        ?.trim() ||
      "";

    const conditional =
      byId(
        "sessionConditionalGuidance"
      )
        ?.innerHTML ||
      "";

    const collapsedConditional =
      conditional
        .replace(
          /\sopen(?:=(?:""|''|"open"))?/gi,
          ""
        );

    const hasGuidance =
      educator ||
      student ||
      collapsedConditional.trim();

    if (!hasGuidance) {
      return "";
    }

    return `
      <details class="session-integrated-support session-compact-guidance">
        <summary>
          Teacher guidance if needed
        </summary>

        <div class="session-compact-guidance-body">
          ${
            educator
              ? `
                <p>
                  <strong>
                    Educator:
                  </strong>
                  ${esc(educator)}
                </p>
              `
              : ""
          }

          ${
            student
              ? `
                <p>
                  <strong>
                    Student:
                  </strong>
                  ${esc(student)}
                </p>
              `
              : ""
          }

          ${
            collapsedConditional.trim()
              ? `
                <div class="session-integrated-conditionals">
                  ${collapsedConditional}
                </div>
              `
              : ""
          }

          <p class="session-ifthen-note">
            Independent attempt first. Use the least support needed,
            retry the same demand, then fade.
          </p>
        </div>
      </details>
    `;
  }


  function readyPolishSessionUI(task) {
    const activity =
      readyActivityDisplayName(task);

    const step2 =
      byId(
        "sessionStep2Card"
      );

    const step3 =
      byId(
        "sessionStep3Card"
      );

    const step2Title =
      step2?.querySelector(
        "h2"
      );

    const step3Title =
      step3?.querySelector(
        "h2"
      );

    if (step2Title) {
      step2Title.textContent =
        `${activity} — Part A: Practice`;
    }

    if (step3Title) {
      step3Title.textContent =
        `${activity} — Part B: Apply`;
    }

    const step2Note =
      step2?.querySelector(
        ".session-step-note"
      );

    const step3Note =
      step3?.querySelector(
        ".session-step-note"
      );

    if (step2Note) {
      step2Note.textContent =
        "Part A introduces or practices this exact activity demand. " +
        "Let the student try first; add support only if a barrier appears.";
    }

    if (step3Note) {
      step3Note.textContent =
        "Part B repeats the same activity demand with a fresh instructional item. " +
        "The task stays the same; the word changes.";
    }

    const step2Guidance =
      byId(
        "sessionStep2Guidance"
      );

    const step3Guidance =
      byId(
        "sessionStep3Guidance"
      );

    if (step2Guidance) {
      step2Guidance.innerHTML =
        readyCompactGuidanceHtml(
          "Practice"
        );
    }

    if (step3Guidance) {
      step3Guidance.innerHTML =
        readyCompactGuidanceHtml(
          "Apply"
        );
    }

    const step2Mount =
      byId(
        "sessionStep2Mount"
      );

    const step3Mount =
      byId(
        "sessionStep3Mount"
      );

    if (
      step2 &&
      step2Guidance &&
      step2Mount &&
      step2Guidance
        .compareDocumentPosition(
          step2Mount
        ) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ) {
      step2Mount.insertAdjacentElement(
        "afterend",
        step2Guidance
      );
    }

    if (
      step3 &&
      step3Guidance &&
      step3Mount &&
      step3Guidance
        .compareDocumentPosition(
          step3Mount
        ) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ) {
      step3Mount.insertAdjacentElement(
        "afterend",
        step3Guidance
      );
    }

    const practiceTask =
      state.tasks
        ?.find(
          item =>
            item?.stage !==
            "Apply"
        ) ||
      null;

    const applyTask =
      state.tasks
        ?.find(
          item =>
            item?.stage ===
            "Apply"
        ) ||
      null;

    if (
      step2Mount &&
      !step2Mount.querySelector(
        ".session-digital-card"
      )
    ) {
      step2Mount.innerHTML =
        readyStepSummary(
          practiceTask,
          `${activity} · Part A: Practice`
        );
    }

    if (
      step3Mount &&
      !step3Mount.querySelector(
        ".session-digital-card"
      )
    ) {
      if (
        applyTask
          ?.recipe
          ?._readyBreakUnavailable
      ) {
        step3Mount.innerHTML = `
          <div class="session-step-placeholder session-step-unavailable">
            <strong>
              ${esc(activity)} · Part B: Apply
            </strong>

            <span>
              No second fair whole-word item is available yet.
              Do not reuse Part A as if it were a fresh Apply item.
            </span>
          </div>
        `;
      } else {
        step3Mount.innerHTML =
          readyStepSummary(
            applyTask,
            `${activity} · Part B: Apply`
          );
      }
    }

    const taskStage =
      byId(
        "taskStage"
      );

    if (taskStage) {
      taskStage.textContent =
        task?.stage === "Apply"
          ? "PART B · APPLY"
          : "PART A · PRACTICE";
    }

    const taskCount =
      byId(
        "taskCount"
      );

    if (taskCount) {
      taskCount.textContent =
        task?.stage === "Apply"
          ? "Fresh item"
          : "Practice item";
    }

    const digitalTitle =
      byId(
        "digitalMaterialTitle"
      );

    if (digitalTitle) {
      digitalTitle.textContent =
        readyPartTitle(task);
    }

    const sectionHeading =
      document.querySelector(
        ".session-digital-card .session-section-heading .session-eyebrow"
      );

    if (sectionHeading) {
      sectionHeading.textContent =
        "Target activity";
    }

    const next =
      byId(
        "nextTaskButton"
      );

    if (next) {
      const nextTask =
        state.tasks
          ?.[
            state.taskIndex + 1
          ];

      next.textContent =
        nextTask
          ?.stage === "Apply"
            ? "Part B: Apply →"
            : "Next →";
    }

    const previous =
      byId(
        "previousTaskButton"
      );

    if (
      previous &&
      task?.stage === "Apply"
    ) {
      previous.textContent =
        "← Part A: Practice";
    }

    const planItems =
      document.querySelectorAll(
        ".session-plan-strip > div"
      );

    if (planItems[1]) {
      planItems[1]
        .querySelector(
          "strong"
        )
        .textContent =
          `2. ${activity} · Part A`;
    }

    if (planItems[2]) {
      planItems[2]
        .querySelector(
          "strong"
        )
        .textContent =
          `3. ${activity} · Part B`;
    }

    const step5 =
      document.querySelector(
        ".session-plan-strip [data-ready-step-five] strong"
      );

    if (step5) {
      step5.textContent =
        "5. Optional Practice Set";
    }

    readyHideLegacyDuplicateSurface(
      task
    );

    readyV7ApplyAll(
      task
    );

    readyV8Apply(
      task
    );

    readyV9Apply(
      task
    );

    readyV10Apply(
      task
    );

    readyV12InstallPracticeObserver();

    readyV13Install();

    readyPolishPrintUI();

    const printButton =
      document.querySelector(
        "#printSessionButton, [data-print-session], .session-print-button"
      );

    if (
      printButton &&
      !printButton.dataset
        .readyPartPolishBound
    ) {
      printButton.dataset
        .readyPartPolishBound =
          "true";

      printButton.addEventListener(
        "click",
        () => {
          readyPolishPrintUI();
        },
        true
      );
    }
  }


  function readyPolishPrintUI() {
    const activityTask =
      state.tasks?.[0] ||
      null;

    const activity =
      readyActivityDisplayName(
        activityTask
      );

    const practiceHeading =
      byId(
        "printPracticeList"
      )
        ?.closest(
          ".print-step"
        )
        ?.querySelector(
          "h3"
        );

    const applyHeading =
      byId(
        "printApplyPrompt"
      )
        ?.closest(
          ".print-step"
        )
        ?.querySelector(
          "h3"
        );

    if (practiceHeading) {
      practiceHeading.textContent =
        `2. ${activity} — Part A: Practice`;
    }

    if (applyHeading) {
      applyHeading.textContent =
        `3. ${activity} — Part B: Apply`;
    }

    const applyTask =
      state.tasks
        ?.find(
          item =>
            item?.stage ===
            "Apply"
        ) ||
      null;

    if (
      applyTask
        ?.recipe
        ?._readyBreakUnavailable
    ) {
      const printApply =
        byId(
          "printApplyPrompt"
        );

      if (printApply) {
        printApply.innerHTML = `
          <p>
            No second fair whole-word item is currently available
            for Part B. Do not reuse the Part A word as a fresh Apply item.
          </p>
        `;
      }
    }
  }




  /* FIRST_VOLO_CONSOLIDATED_TEACHER_SESSION_V7 */

  function readyV7TileRoleClass(label) {
    const value =
      String(
        label ||
        readyTargetLabel() ||
        ""
      )
        .trim();

    if (
      value.startsWith("-")
    ) {
      return " is-suffix-tile";
    }

    if (
      value.endsWith("-")
    ) {
      return " is-prefix-tile";
    }

    return " is-root-tile";
  }


  function readyV7FirstFormCue() {
    return String(
      readyTargetLabel() ||
      ""
    )
      .replace(
        /[^A-Za-z]/g,
        ""
      )
      .slice(
        0,
        1
      );
  }


  /* FIRST_VOLO_INFER_BUILD_DEMAND_SUPPORT_V1_1
     Figure It Out and Build Words need support selected from the actual
     cognitive barrier, not a generic visual-cue sequence.

     Locked pattern:
       independent attempt -> identify barrier -> least relevant support
       -> retry the same demand -> fade
     Modeling is the exception: model with a DIFFERENT item, then return
     control to the student.
  */

  function readyInferBuildDemandSupportMarkup(
    activity,
    {
      practice = false,
      task = null
    } = {}
  ) {
    const target =
      readyTargetLabel();

    const meaning =
      readyTargetMeaning();

    const panelClass =
      practice
        ? "ready-practice-support"
        : "ready-support-panel";

    const approvedNonTarget =
      readyTaskNonTargetSupportMarkup(
        task
      );

    const teachingAccess =
      readyTaskTeachingAccessMarkup(
        task,
        activity
      );

    if (
      activity ===
      "infer"
    ) {
      return `
        <details class="${panelClass}">
          <summary>
            Support if needed after the independent attempt
          </summary>

          <div class="ready-support-panel-body">
            <p class="ready-support-sequence">
              Identify the barrier first. Do not automatically reveal the target meaning
              or replace morphology reasoning with context guessing.
            </p>

            ${approvedNonTarget}
            ${teachingAccess}

            <div class="ready-demand-support-list">
              <p>
                <strong>If the student does not recognize or remember ${esc(target)}:</strong>
                ask what familiar word part they recognize. If meaning access is the barrier,
                use the established meaning cue or two meaning choices only as needed.
                Then retry the same inference.
              </p>

              <p>
                <strong>If the student recognizes ${esc(target)} but cannot combine the word parts:</strong>
                ${
                  meaning
                    ? `keep ${esc(target)} = ${esc(meaning)} established and`
                    : `keep the known target established and`
                }
                give the meaning of another meaningful part without giving the whole-word answer.
                Ask the student to put the ideas together, then retry the same inference.
              </p>

              <p>
                <strong>If the student is guessing from context alone:</strong>
                ask, “What does the word part tell you first?”
                Have morphology form the hypothesis; use context only to confirm or refine it.
              </p>

              <p>
                <strong>If the inference is plausible but unsupported:</strong>
                ask which word-part clue supports the proposed meaning.
                If needed, offer two plausible whole-word meanings only after the morphology reasoning attempt.
              </p>

              <p>
                <strong>If the student is still blocked:</strong>
                model the reasoning with a different word, then give the student another attempt.
                Do not count the modeled example as independent evidence.
              </p>
            </div>
          </div>
        </details>
      `;
    }

    if (
      activity ===
      "build"
    ) {
      return `
        <details class="${panelClass}">
          <summary>
            Support if needed after the independent attempt
          </summary>

          <div class="ready-support-panel-body">
            <p class="ready-support-sequence">
              Watch the student's first build. Give only the help needed for the specific problem, then let the student try the same build again.
            </p>

            ${approvedNonTarget}
            ${teachingAccess}

            <div class="ready-demand-support-list">
              <p>
                <strong>If the student chooses the wrong word part:</strong>
                ask, “Which available part carries the meaning we need?”
                ${
                  meaning
                    ? `For the current target, the relevant meaning is ${esc(meaning)}.`
                    : `Do not select the part for the student.`
                }
                Then retry the same build.
              </p>

              <p>
                <strong>If the parts are right but the order is not:</strong>
                ask which part is the prefix, root/base, or suffix and where that kind of part belongs. Then let the student rearrange the build.
              </p>

              <p>
                <strong>If the student leaves out the target:</strong>
                ask, “Which part carries the meaning we still need?”
                Return to the same build.
              </p>

              <p>
                <strong>If the word is built correctly but the explanation is unclear:</strong>
                ask, “What does each meaningful part add to the word?”
              </p>

              <p>
                <strong>If the student is still blocked:</strong>
                model one different build, then return to this item and let the student try again.
              </p>
            </div>
          </div>
        </details>
      `;
    }

    return "";
  }


  function readyV7ActivitySupportMarkup(
    activity,
    task = null
  ) {
    const demandSpecific =
      readyInferBuildDemandSupportMarkup(
        activity,
        {
          task
        }
      );

    if (demandSpecific) {
      return demandSpecific;
    }

    const meaning =
      readySupportTile()
        ?.meaning ||
      readyTargetMeaning();

    const approvedNonTarget =
      readyTaskNonTargetSupportMarkup(
        task
      );

    const postCueTeachingAccess =
      readyTaskTeachingAccessMarkup(
        task,
        activity
      );

    if (
      activity ===
      "morpheme"
    ) {
      const firstCue =
        readyV7FirstFormCue();

      return `
        <details class="ready-support-panel">
          <summary>
            Support if needed after the independent attempt
          </summary>

          <div class="ready-support-panel-body">
            ${approvedNonTarget}

            ${
              firstCue
                ? `
                  <p class="ready-support-sequence">
                    First give only the first sound or letter:
                    <strong>${esc(firstCue)}</strong>.
                    Retry before giving the whole word part.
                  </p>
                `
                : `
                  <p class="ready-support-sequence">
                    Give a partial verbal cue, then retry before showing the whole word part.
                  </p>
                `
            }

            <details class="ready-form-reveal">
              <summary>
                Show the familiar visual tile if still needed
              </summary>

              ${readyTileMarkup(
                readySupportTile(),
                {
                  includeMeaning: false
                }
              )}
            </details>

            ${
              postCueTeachingAccess
                ? `
                  <details class="ready-teaching-after-cues">
                    <summary>
                      Add item-specific teaching only if the student is still blocked
                    </summary>

                    <div class="ready-support-panel-body">
                      ${postCueTeachingAccess}
                    </div>
                  </details>
                `
                : ""
            }
          </div>
        </details>
      `;
    }

    return `
      <details class="ready-support-panel">
        <summary>
          Support if needed after the independent attempt
        </summary>

        <div class="ready-support-panel-body">
          ${approvedNonTarget}

          <p class="ready-support-sequence">
            First show the familiar First Volo visual cue.
            Retry the same task before adding another cue.
          </p>

          ${readyTileMarkup(
            readySupportTile(),
            {
              includeMeaning: false
            }
          )}

          ${
            meaning
              ? `
                <details class="ready-meaning-reveal">
                  <summary>
                    Show meaning if still needed
                  </summary>

                  <p>
                    ${esc(meaning)}
                  </p>
                </details>
              `
              : ""
          }

          ${
            postCueTeachingAccess
              ? `
                <details class="ready-teaching-after-cues">
                  <summary>
                    Add item-specific teaching only if the student is still blocked
                  </summary>

                  <div class="ready-support-panel-body">
                    ${postCueTeachingAccess}
                  </div>
                </details>
              `
              : ""
          }
        </div>
      </details>
    `;
  }


  function readyV7PracticeSupportMarkup(
    activity
  ) {
    const demandSpecific =
      readyInferBuildDemandSupportMarkup(
        activity,
        {
          practice:
            true
        }
      );

    if (demandSpecific) {
      return demandSpecific;
    }

    if (
      activity ===
      "morpheme"
    ) {
      const firstCue =
        readyV7FirstFormCue();

      return `
        <details class="ready-practice-support">
          <summary>
            Support if needed after an independent attempt
          </summary>

          <p class="ready-support-sequence">
            ${
              firstCue
                ? `Give only the first sound or letter (${esc(firstCue)}) first, then retry.`
                : "Give a partial form cue first, then retry."
            }
          </p>

          <details class="ready-form-reveal">
            <summary>
              Show the familiar visual tile if still needed
            </summary>

            ${readyTileMarkup(
              readySupportTile(),
              {
                includeMeaning: false
              }
            )}
          </details>
        </details>
      `;
    }

    const meaning =
      readyTargetMeaning();

    return `
      <details class="ready-practice-support">
        <summary>
          Support if needed after an independent attempt
        </summary>

        ${readyTileMarkup(
          readySupportTile(),
          {
            includeMeaning: false
          }
        )}

        ${
          meaning
            ? `
              <details class="ready-meaning-reveal">
                <summary>
                  Show meaning if still needed
                </summary>

                <p>
                  ${esc(meaning)}
                </p>
              </details>
            `
            : ""
        }
      </details>
    `;
  }


  function readyV7LearnerEncounteredTargetIds() {
    const values =
      new Set(
        readyTargetIds()
      );

    const sessions =
      Array.isArray(
        state.student?.sessions
      )
        ? state.student.sessions
        : [];

    sessions.forEach(
      session => {
        const responses =
          Array.isArray(
            session?.responses
          )
            ? session.responses
            : [];

        responses.forEach(
          response => {
            [
              response?.primaryTargetId,
              response?.primaryTarget,
              ...(Array.isArray(
                response?.supportingTargetIds
              )
                ? response.supportingTargetIds
                : []),
              ...(Array.isArray(
                response?.supportingTargets
              )
                ? response.supportingTargets
                : [])
            ]
              .flatMap(
                value =>
                  variants(
                    value ||
                    ""
                  )
              )
              .map(
                readyLettersOnly
              )
              .filter(Boolean)
              .forEach(
                value =>
                  values.add(
                    value
                  )
              );
          }
        );
      }
    );

    return values;
  }


  function readyV7TeacherDirections(
    task
  ) {
    const wordPartSpec =
      (
        readyActivity(task) ===
          "morpheme" &&
        task?.stage !==
          "Apply"
      )
        ? readyWordPartSpecFor(
            task
          )
        : null;

    const access =
      readyTaskTeachingAccess(task);

    const preTaskPrompts =
      access.educatorPrompts
        .filter(
          step =>
            readyEducatorPromptIsPreTask(step)
        );

    const followUp =
      String(
        task?.followUp ||
        ""
      )
        .trim();

    let body = "";

    if (preTaskPrompts.length) {
      body =
        readyEducatorPromptParagraphs(
          preTaskPrompts
        );
    } else if (wordPartSpec?.teacherDirection) {
      body = `
        <p>
          ${esc(wordPartSpec.teacherDirection)}
        </p>
      `;
    } else {
      const activity =
        readyActivity(task);

      const naturalFallback =
        activity === "build"
          ? "Present the build goal and word-part tiles below. Let the student try the build before opening support."
          : activity === "infer"
            ? "Read the context and ask the inference question below. Keep the first attempt focused on the student's morphology reasoning."
            : "Present the student task below. Open support only if the student needs help with the target demand.";

      body = `
        <p>
          ${esc(naturalFallback)}
        </p>
      `;
    }

    return `
      <details class="ready-teacher-directions">
        <summary>
          Teacher directions
        </summary>

        <div class="ready-teacher-directions-body">
          ${body}

          ${
            followUp
              ? `
                <p>
                  ${esc(followUp)}
                </p>
              `
              : ""
          }
        </div>
      </details>
    `;
  }


  function readyRenderPreResponseAccess(task) {
    const taskPrompt =
      byId("taskPrompt");

    const currentTask =
      taskPrompt?.closest(
        ".session-current-task"
      );

    if (!currentTask || !taskPrompt) {
      return;
    }

    currentTask
      .querySelector(
        ".ready-pre-response-access"
      )
      ?.remove();

    const markup =
      readyPreResponseAccessMarkup(
        task,
        readyActivity(task)
      );

    if (!markup) {
      return;
    }

    const wrapper =
      document.createElement("div");

    wrapper.innerHTML = markup;

    currentTask.insertBefore(
      wrapper.firstElementChild,
      taskPrompt
    );
  }


  function readyV7CleanActivitySurface(
    task
  ) {
    const activity =
      readyActivity(
        task
      );

    if (
      activity ===
      "build"
    ) {
      return;
    }

    const digital =
      document.querySelector(
        ".session-digital-card"
      );

    const ready =
      byId(
        "readyStudentMaterial"
      );

    if (
      !digital ||
      !ready
    ) {
      return;
    }

    let directions =
      digital.querySelector(
        ".ready-teacher-directions"
      );

    if (!directions) {
      const wrapper =
        document.createElement(
          "div"
        );

      wrapper.innerHTML =
        readyV7TeacherDirections(
          task
        );

      directions =
        wrapper.firstElementChild;

      digital.insertBefore(
        directions,
        ready
      );
    } else {
      directions.outerHTML =
        readyV7TeacherDirections(
          task
        );

      directions =
        digital.querySelector(
          ".ready-teacher-directions"
        );
    }

    [
      ...digital.children
    ].forEach(
      child => {
        const keep =
          child === ready ||
          child === directions ||
          child.classList?.contains(
            "session-task-navigation"
          );

        child.hidden =
          !keep;
      }
    );

    ready.hidden =
      false;

    if (directions) {
      directions.hidden =
        false;
    }

    const heading =
      ready.querySelector(
        ".ready-material-heading"
      );

    if (heading) {
      const intro =
        heading.querySelector(
          "p"
        );

      heading
        .querySelectorAll(
          ":scope > span, :scope > h3"
        )
        .forEach(
          node => {
            node.hidden =
              true;
          }
        );

      if (
        intro &&
        !intro.textContent
          .trim()
      ) {
        intro.hidden =
          true;
      }
    }
  }


  function readyV7PolishStepCards(
    task
  ) {
    const activity =
      readyActivityDisplayName(
        task
      );

    const step2 =
      byId(
        "sessionStep2Card"
      );

    const step3 =
      byId(
        "sessionStep3Card"
      );

    const step2Title =
      step2?.querySelector(
        "h2"
      );

    const step3Title =
      step3?.querySelector(
        "h2"
      );

    if (step2Title) {
      step2Title.textContent =
        `${activity} — Part A: Practice`;
    }

    if (step3Title) {
      step3Title.textContent =
        `${activity} — Part B: Apply`;
    }

    const step2Note =
      step2?.querySelector(
        ".session-step-note"
      );

    const step3Note =
      step3?.querySelector(
        ".session-step-note"
      );

    const firstPracticeTask =
      state.tasks
        ?.find(
          item =>
            item?.stage !== "Apply"
        ) ||
      task;

    if (step2Note) {
      step2Note.textContent =
        readyPartAInstructionNote(
          firstPracticeTask
        );
    }

    if (step3Note) {
      step3Note.textContent =
        "Use the same activity-specific access rules with the fresh example; keep the student's actual target demand independent.";
    }

    const step2Guidance =
      byId(
        "sessionStep2Guidance"
      );

    const step3Guidance =
      byId(
        "sessionStep3Guidance"
      );

    if (step2Guidance) {
      step2Guidance.hidden =
        true;
    }

    if (step3Guidance) {
      step3Guidance.hidden =
        true;
    }

    const practiceTask =
      state.tasks
        ?.find(
          item =>
            item?.stage !==
            "Apply"
        ) ||
      null;

    const applyTask =
      state.tasks
        ?.find(
          item =>
            item?.stage ===
            "Apply"
        ) ||
      null;

    const step2Mount =
      byId(
        "sessionStep2Mount"
      );

    const step3Mount =
      byId(
        "sessionStep3Mount"
      );

    const digital =
      document.querySelector(
        ".session-digital-card"
      );

    if (
      step2Mount &&
      digital &&
      !step2Mount.contains(
        digital
      )
    ) {
      const example =
        readyWord(
          practiceTask
        );

      step2Mount.innerHTML = `
        <div class="session-step-placeholder">
          <strong>
            Part A: Practice
          </strong>

          ${
            example
              ? `
                <span>
                  Practice example: ${esc(example)}
                </span>
              `
              : ""
          }
        </div>
      `;
    }

    if (
      step3Mount &&
      digital &&
      !step3Mount.contains(
        digital
      )
    ) {
      if (
        applyTask
          ?.recipe
          ?._readyBreakUnavailable
      ) {
        step3Mount.innerHTML = `
          <div class="session-step-placeholder ready-part-b-unavailable">
            <strong>
              Part B: Apply is not available for this activity yet.
            </strong>

            <span>
              There is no second fair fresh item at the learner's current level.
              Do not reuse Part A.
            </span>
          </div>
        `;
      } else {
        const example =
          readyWord(
            applyTask
          );

        step3Mount.innerHTML = `
          <div class="session-step-placeholder">
            <strong>
              Part B: Apply
            </strong>

            ${
              example
                ? `
                  <span>
                    Fresh example: ${esc(example)}
                  </span>
                `
                : ""
            }
          </div>
        `;
      }
    }
  }


  function readyV7PolishCurrentTask(
    task
  ) {
    const activity =
      readyActivityDisplayName(
        task
      );

    const isApply =
      task?.stage ===
      "Apply";

    const digitalTitle =
      byId(
        "digitalMaterialTitle"
      );

    if (digitalTitle) {
      digitalTitle.textContent =
        `${activity} — ${
          isApply
            ? "Part B: Apply"
            : "Part A: Practice"
        }`;
    }

    const stage =
      byId(
        "taskStage"
      );

    if (stage) {
      stage.textContent =
        isApply
          ? "PART B · APPLY"
          : "PART A · PRACTICE";
    }

    const count =
      byId(
        "taskCount"
      );

    if (count) {
      count.textContent =
        isApply
          ? "Fresh item"
          : "Practice item";
    }

    if (
      isApply &&
      task?.recipe
        ?._readyBreakUnavailable
    ) {
      const ready =
        byId(
          "readyStudentMaterial"
        );

      if (ready) {
        ready.innerHTML = `
          <div class="ready-part-b-unavailable">
            <strong>
              Part B: Apply is not available for this activity yet.
            </strong>

            <p>
              There is no second fair fresh item for this target at the learner's
              current level. Do not reuse Part A. Continue to Check Transfer.
            </p>
          </div>
        `;
      }

      const next =
        byId(
          "nextTaskButton"
        );

      if (next) {
        next.hidden =
          true;
      }
    }
  }


  function readyV7WhatYouWillDoSection() {
    const heading =
      [
        ...document.querySelectorAll(
          "h1, h2, h3"
        )
      ].find(
        node =>
          String(
            node.textContent ||
            ""
          )
            .trim()
            .toLowerCase() ===
          "what you will do"
      );

    return (
      heading?.closest(
        "section"
      ) ||
      heading?.parentElement ||
      null
    );
  }


  function readyV7RewriteTodaySession(
    task
  ) {
    const section =
      readyV7WhatYouWillDoSection();

    if (!section) {
      return;
    }

    const activity =
      readyActivityDisplayName(
        task
      );

    const partA =
      state.tasks
        ?.find(
          item =>
            item?.stage !==
            "Apply"
        ) ||
      null;

    const partB =
      state.tasks
        ?.find(
          item =>
            item?.stage ===
            "Apply"
        ) ||
      null;

    const partAWord =
      readyWord(
        partA
      );

    const partBWord =
      readyWord(
        partB
      );

    const lines =
      [
        ...section.querySelectorAll(
          "li, p"
        )
      ];

    lines.forEach(
      node => {
        const text =
          String(
            node.textContent ||
            ""
          )
            .replace(
              /\s+/g,
              " "
            )
            .trim();

        if (
          /^2\.\s*/.test(
            text
          )
        ) {
          node.innerHTML = `
            <strong>
              2. ${esc(activity)} — Part A: Practice
            </strong>
            ${
              partAWord
                ? ` — ${esc(partAWord)}`
                : ""
            }
          `;
        }

        if (
          /^3\.\s*/.test(
            text
          )
        ) {
          if (
            partB
              ?.recipe
              ?._readyBreakUnavailable
          ) {
            node.innerHTML = `
              <strong>
                3. ${esc(activity)} — Part B: Apply
              </strong>
              — not available; continue to Check Transfer
            `;
          } else {
            node.innerHTML = `
              <strong>
                3. ${esc(activity)} — Part B: Apply
              </strong>
              ${
                partBWord
                  ? ` — ${esc(partBWord)}`
                  : ""
              }
            `;
          }
        }
      }
    );
  }


  function readyV7PolishPlanStrip(
    task
  ) {
    const activity =
      readyActivityDisplayName(
        task
      );

    const strip =
      document.querySelector(
        ".session-plan-strip"
      );

    if (!strip) {
      return;
    }

    const items =
      [
        ...strip.children
      ];

    const partB =
      state.tasks
        ?.find(
          item =>
            item?.stage ===
            "Apply"
        ) ||
      null;

    if (
      items[1]
    ) {
      const strong =
        items[1].querySelector(
          "strong"
        );

      if (strong) {
        strong.textContent =
          `2. ${activity} · Part A`;
      }
    }

    if (
      items[2]
    ) {
      const strong =
        items[2].querySelector(
          "strong"
        );

      const time =
        items[2].querySelector(
          "span"
        );

      if (strong) {
        strong.textContent =
          `3. ${activity} · Part B`;
      }

      if (
        time &&
        partB
          ?.recipe
          ?._readyBreakUnavailable
      ) {
        time.textContent =
          "Not available";
      }
    }

    const step5 =
      strip.querySelector(
        "[data-ready-step-five]"
      );

    if (step5) {
      const strong =
        step5.querySelector(
          "strong"
        );

      const time =
        step5.querySelector(
          "span"
        );

      const minutes =
        readyV13DurationMinutes();

      const step5Activity =
        readyActivity(
          state.tasks?.[0] ||
          null
        );

      const step5Copy =
        readyStep5Copy(
          step5Activity,
          minutes
        );

      if (strong) {
        strong.textContent =
          `5. ${step5Copy.heading}`;
      }

      if (time) {
        time.textContent =
          step5Copy.time;
      }
    }

  }


  function readyV7PolishPracticeSetCopy() {
    const card =
      byId(
        "sessionPracticeSetCard"
      );

    const container =
      byId(
        "sessionPracticeSet"
      );

    const note =
      card?.querySelector(
        ".session-step-note"
      );

    if (
      !card ||
      !container ||
      !note
    ) {
      return;
    }

    const practiceActivity =
      readyActivity(
        state.tasks?.[0] ||
        null
      );

    const practiceMinutes =
      readyV13DurationMinutes();

    const practiceHeading =
      card.querySelector(
        "h2"
      );

    if (practiceHeading) {
      practiceHeading.textContent =
        practiceActivity ===
          "morpheme" ||
        practiceMinutes !== 30
          ? "Optional Practice Set"
          : "Practice Set";
    }

    const unavailable =
      container.querySelector(
        ".ready-practice-unavailable"
      );

    if (unavailable) {
      const activity =
        readyActivity(
          state.tasks?.[0] ||
          null
        );

      const requiredCount =
        activity === "morpheme"
          ? 2
          : 1;

      note.textContent =
        activity === "morpheme"
          ? "Targeted Word Part practice appears here when two appropriate opportunities are available."
          : "Additional practice appears here when at least one appropriate item is available for this target and activity.";

      const paragraph =
        unavailable.querySelector(
          "p"
        );

      if (paragraph) {
        paragraph.textContent =
          `There are currently fewer than ${requiredCount} appropriate additional ${
            activity === "morpheme"
              ? "Word Part opportunities"
              : "items"
          } for this target and activity at the learner's current level. Use the available session activities today.`;
      }

      return;
    }

    const minutes =
      readyV13DurationMinutes();

    const activity =
      readyActivity(
        state.tasks?.[0] ||
        null
      );

    const step5Copy =
      readyStep5Copy(
        activity,
        minutes
      );

    note.textContent =
      step5Copy.intro;
  }


  function readyV7ApplyAll(
    task
  ) {
    readyV7CleanActivitySurface(
      task
    );

    readyV7PolishStepCards(
      task
    );

    readyV7PolishCurrentTask(
      task
    );

    readyV7RewriteTodaySession(
      task
    );

    readyV7PolishPlanStrip(
      task
    );

    readyV7PolishPracticeSetCopy();
  }




  /* FIRST_VOLO_STEP_SURFACE_DEDUP_V8 */

  function readyV8FindActivitySurface() {
    const ready =
      byId(
        "readyStudentMaterial"
      );

    if (!ready) {
      return {
        ready: null,
        surface: null,
        readyChild: null
      };
    }

    const surface =
      ready.closest(
        ".session-digital-card"
      ) ||
      ready.parentElement;

    if (!surface) {
      return {
        ready,
        surface: null,
        readyChild: null
      };
    }

    const readyChild =
      [
        ...surface.children
      ].find(
        child =>
          child === ready ||
          child.contains(
            ready
          )
      ) ||
      ready;

    return {
      ready,
      surface,
      readyChild
    };
  }


  function readyV8KeepOnlyRealStudentSurface(
    task
  ) {
    const activity =
      readyActivity(
        task
      );

    if (
      activity ===
      "build"
    ) {
      return;
    }

    const {
      ready,
      surface,
      readyChild
    } =
      readyV8FindActivitySurface();

    if (
      !ready ||
      !surface ||
      !readyChild
    ) {
      return;
    }

    let directions =
      surface.querySelector(
        ".ready-teacher-directions"
      );

    if (!directions) {
      const wrapper =
        document.createElement(
          "div"
        );

      wrapper.innerHTML =
        readyV7TeacherDirections(
          task
        );

      directions =
        wrapper.firstElementChild;

      surface.insertBefore(
        directions,
        readyChild
      );
    }

    [
      ...surface.children
    ].forEach(
      child => {
        const keep =
          child === readyChild ||
          child === directions ||
          child.classList?.contains(
            "session-task-navigation"
          );

        child.hidden =
          !keep;
      }
    );

    ready.hidden =
      false;

    if (readyChild) {
      readyChild.hidden =
        false;
    }

    if (directions) {
      directions.hidden =
        false;
    }

    const readyHeading =
      ready.querySelector(
        ".ready-material-heading"
      );

    if (readyHeading) {
      readyHeading
        .querySelectorAll(
          ":scope > span, :scope > h3"
        )
        .forEach(
          node => {
            node.hidden =
              true;
          }
        );
    }
  }


  function readyV8RemoveTargetActivityDuplication() {
    [
      byId(
        "sessionStep2Card"
      ),
      byId(
        "sessionStep3Card"
      )
    ]
      .filter(Boolean)
      .forEach(
        card => {
          const nodes =
            [
              ...card.querySelectorAll(
                "span, strong, p, h2, h3, div"
              )
            ];

          nodes.forEach(
            node => {
              const text =
                String(
                  node.textContent ||
                  ""
                )
                  .replace(
                    /\s+/g,
                    " "
                  )
                  .trim()
                  .toLowerCase();

              if (
                text ===
                "target activity"
              ) {
                const block =
                  node.closest(
                    ".session-integrated-guidance, .session-target-activity, .session-step-guidance, .session-current-task"
                  ) ||
                  node.parentElement;

                if (block) {
                  block.hidden =
                    true;
                }
              }
            }
          );
        }
      );
  }


  function readyV8PlaceActivityInActiveStep(
    task
  ) {
    const {
      surface
    } =
      readyV8FindActivitySurface();

    if (!surface) {
      return;
    }

    const isApply =
      task?.stage ===
      "Apply";

    const activeMount =
      byId(
        isApply
          ? "sessionStep3Mount"
          : "sessionStep2Mount"
      );

    const inactiveMount =
      byId(
        isApply
          ? "sessionStep2Mount"
          : "sessionStep3Mount"
      );

    if (
      activeMount &&
      !activeMount.contains(
        surface
      )
    ) {
      activeMount.innerHTML =
        "";

      activeMount.appendChild(
        surface
      );
    }

    if (inactiveMount) {
      if (isApply) {
        const completedCount =
          state.tasks
            ?.filter(
              item =>
                item?.stage !==
                "Apply"
            )
            .length ||
          0;

        inactiveMount.hidden =
          false;

        inactiveMount.innerHTML = `
          <div class="session-step-placeholder ready-completed-step">
            <strong>
              Part A: Practice complete
            </strong>

            <span>
              ${completedCount} ${
                completedCount === 1
                  ? "practice item completed"
                  : "practice items completed"
              }.
            </span>
          </div>
        `;
      } else {
        inactiveMount.innerHTML =
          "";
      }
    }
  }


  function readyV8CleanStep3Placeholder(
    task
  ) {
    const step3 =
      byId(
        "sessionStep3Card"
      );

    if (!step3) {
      return;
    }

    const isApply =
      task?.stage ===
      "Apply";

    const mount =
      byId(
        "sessionStep3Mount"
      );

    const note =
      step3.querySelector(
        ".session-step-note"
      );

    if (!isApply) {
      if (mount) {
        mount.innerHTML =
          "";
        mount.hidden =
          true;
      }

      if (note) {
        note.textContent =
          "Complete Part A, then choose Part B to try the same skill with a new example.";
      }

      step3.classList.add(
        "ready-upcoming-step"
      );

      return;
    }

    step3.classList.remove(
      "ready-upcoming-step"
    );

    if (mount) {
      mount.hidden =
        false;
    }

    if (note) {
      note.textContent =
        "Try the same skill with a new example.";
    }

    if (
      task?.recipe
        ?._readyBreakUnavailable
    ) {
      if (mount) {
        mount.innerHTML = `
          <div class="ready-part-b-unavailable">
            <strong>
              Part B: Apply is not available for this activity yet.
            </strong>

            <p>
              There is no second fair fresh item for this target at the learner's current level.
              Do not reuse Part A. Continue to Check Transfer.
            </p>
          </div>
        `;
      }
    }
  }



  function readyV8Apply(
    task
  ) {
    readyV8KeepOnlyRealStudentSurface(
      task
    );

    readyV8RemoveTargetActivityDuplication();

    readyV8PlaceActivityInActiveStep(
      task
    );

    readyV8CleanStep3Placeholder(
      task
    );
  }




  /* FIRST_VOLO_TEACHER_PLAN_ACTIVE_PART_V9 */

  function readyV9NormalizedText(
    value
  ) {
    return String(
      value ||
      ""
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
  }


  function readyV9FindTextNode(
    root,
    exactText
  ) {
    if (!root) {
      return null;
    }

    const wanted =
      readyV9NormalizedText(
        exactText
      )
        .toLowerCase();

    return [
      ...root.querySelectorAll(
        "h1, h2, h3, p, li, span, strong, div"
      )
    ].find(
      node =>
        readyV9NormalizedText(
          node.textContent
        )
          .toLowerCase() ===
        wanted
    ) || null;
  }


  function readyV9TeacherPlanSection() {
    const heading =
      readyV9FindTextNode(
        document,
        "What you will do"
      ) ||
      readyV9FindTextNode(
        document,
        "Teacher Session Plan"
      );

    return (
      heading?.closest(
        "section"
      ) ||
      heading?.parentElement ||
      null
    );
  }


  function readyV9RenderTeacherPlan(
    task
  ) {
    const section =
      byId(
        "todaySessionOverview"
      ) ||
      readyV9TeacherPlanSection();

    if (!section) {
      return;
    }

    const heading =
      readyV9FindTextNode(
        section,
        "What you will do"
      ) ||
      readyV9FindTextNode(
        section,
        "Teacher Session Plan"
      );

    if (
      heading &&
      readyV9NormalizedText(
        heading.textContent
      ) !==
        "Teacher Session Plan"
    ) {
      heading.textContent =
        "Teacher Session Plan";
    }

    const activity =
      readyActivityDisplayName(
        task ||
        state.tasks?.[0] ||
        {}
      );

    const practiceCount =
      state.tasks
        ?.filter(
          item =>
            item?.stage !==
            "Apply"
        )
        .length ||
      0;

    const partB =
      state.tasks
        ?.find(
          item =>
            item?.stage ===
            "Apply"
        ) ||
      null;

    const partBUnavailable =
      Boolean(
        partB
          ?.recipe
          ?._readyBreakUnavailable
      );

    const transferCount =
      state.plan
        ?.transfer
        ?.items
        ?.length ||
      0;

    const minutes =
      Number.parseInt(
        state.minutes ||
        state.sessionMinutes ||
        15,
        10
      ) ||
      15;

    const rows = [
      {
        label:
          "Retrieve",
        detail:
          "1 retrieval prompt"
      },
      {
        label:
          `${activity} · Part A`,
        detail:
          `${practiceCount} ${
            practiceCount === 1
              ? "practice item"
              : "practice items"
          }`
      },
      {
        label:
          `${activity} · Part B`,
        detail:
          partBUnavailable
            ? "No fresh application item is available today"
            : "1 fresh application item; do not preview the word"
      },
      {
        label:
          "Check Transfer",
        detail:
          transferCount
            ? `${transferCount} unfamiliar transfer ${
                transferCount === 1
                  ? "item"
                  : "items"
              }; do not preview the word before Step 4`
            : "No transfer check is available today; skip Step 4"
      },
      {
        label:
          readyStep5Copy(
            currentActivity(),
            minutes
          ).heading,
        detail:
          readyStep5Copy(
            currentActivity(),
            minutes
          ).planDetail
      }
    ];

    let list =
      section.querySelector(
        "ol"
      );

    if (!list) {
      list =
        document.createElement(
          "ol"
        );

      section.appendChild(
        list
      );
    }

    const existing =
      [
        ...list.children
      ].filter(
        node =>
          node.tagName ===
          "LI"
      );

    rows.forEach(
      (
        row,
        index
      ) => {
        let item =
          existing[index];

        if (!item) {
          item =
            document.createElement(
              "li"
            );

          list.appendChild(
            item
          );

          existing.push(
            item
          );
        }

        item.hidden =
          false;

        const desiredText =
          `${row.label} — ${row.detail}`;

        if (
          readyV9NormalizedText(
            item.textContent
          ) !==
          desiredText
        ) {
          item.innerHTML = `
            <strong>
              ${esc(row.label)}
            </strong>
            — ${esc(row.detail)}
          `;
        }
      }
    );

    existing
      .slice(
        rows.length
      )
      .forEach(
        item => {
          item.hidden =
            true;
        }
      );
  }

  function readyV9TargetOnlyRetrieve() {
    const card =
      byId(
        "sessionStep1Card"
      ) ||
      readyV9FindTextNode(
        document,
        "Retrieve"
      )
        ?.closest(
          "section"
        );

    if (!card) {
      return;
    }

    const target =
      readyV9NormalizedText(
        readyTargetLabel()
      )
        .toLowerCase();

    const prompts =
      [
        ...card.querySelectorAll(
          "li"
        )
      ];

    if (
      prompts.length >
      1
    ) {
      const targetPrompt =
        prompts.find(
          item =>
            readyV9NormalizedText(
              item.textContent
            )
              .toLowerCase()
              .includes(
                target
              )
        ) ||
        prompts[0];

      prompts.forEach(
        item => {
          item.hidden =
            item !==
            targetPrompt;
        }
      );
    }

    const readButton =
      [
        ...card.querySelectorAll(
          "button"
        )
      ].find(
        button =>
          /read retrieve prompts/i.test(
            readyV9NormalizedText(
              button.textContent
            )
          )
      );

    if (readButton) {
      readButton.innerHTML =
        "🔊 Read Retrieve prompt";
    }
  }


  function readyV9HighestBranchNotContaining(
    marker,
    keep
  ) {
    if (
      !marker ||
      !keep
    ) {
      return null;
    }

    let branch =
      marker;

    while (
      branch.parentElement &&
      !branch.parentElement.contains(
        keep
      )
    ) {
      branch =
        branch.parentElement;
    }

    return branch;
  }


  function readyV9HideLegacyActivityBranches() {
    const ready =
      byId(
        "readyStudentMaterial"
      );

    if (!ready) {
      return;
    }

    const activeCard =
      ready.closest(
        ".session-step-flow-card"
      ) ||
      ready.parentElement;

    if (!activeCard) {
      return;
    }

    const markers =
      [
        ...activeCard.querySelectorAll(
          "button, input, strong, span"
        )
      ].filter(
        node => {
          const text =
            readyV9NormalizedText(
              node.textContent ||
              node.value ||
              node.placeholder
            )
              .toLowerCase();

          return (
            text ===
              "read prompt" ||
            text.includes(
              "review word part response"
            ) ||
            text.includes(
              "write the word part the student retrieved"
            ) ||
            text ===
              "target activity"
          );
        }
      );

    markers.forEach(
      marker => {
        if (
          ready.contains(
            marker
          )
        ) {
          return;
        }

        const branch =
          readyV9HighestBranchNotContaining(
            marker,
            ready
          );

        if (
          branch &&
          branch !==
            activeCard
        ) {
          branch.hidden =
            true;
        }
      }
    );

    const readyHeading =
      ready.querySelector(
        ".ready-material-heading"
      );

    if (readyHeading) {
      readyHeading
        .querySelectorAll(
          ":scope > span, :scope > h3"
        )
        .forEach(
          node => {
            node.hidden =
              true;
          }
        );
    }
  }


  function readyV9EnsureTeacherDirections(
    task
  ) {
    const ready =
      byId(
        "readyStudentMaterial"
      );

    if (!ready) {
      return;
    }

    const activeCard =
      ready.closest(
        ".session-step-flow-card"
      ) ||
      ready.parentElement;

    if (!activeCard) {
      return;
    }

    let directions =
      activeCard.querySelector(
        ".ready-teacher-directions"
      );

    if (!directions) {
      const wrapper =
        document.createElement(
          "div"
        );

      wrapper.innerHTML =
        readyV7TeacherDirections(
          task
        );

      directions =
        wrapper.firstElementChild;

      ready.parentElement
        ?.insertBefore(
          directions,
          ready
        );
    }

    if (directions) {
      directions.hidden =
        false;
      directions.open =
        false;
    }
  }


  function readyV9OneActivePart(
    task
  ) {
    const step2 =
      byId(
        "sessionStep2Card"
      );

    const step3 =
      byId(
        "sessionStep3Card"
      );

    if (
      !step2 ||
      !step3
    ) {
      return;
    }

    const isApply =
      task?.stage ===
      "Apply";

    const partB =
      state.tasks
        ?.find(
          item =>
            item?.stage ===
            "Apply"
        ) ||
      null;

    const unavailable =
      Boolean(
        partB
          ?.recipe
          ?._readyBreakUnavailable
      );

    const next =
      byId(
        "nextTaskButton"
      );

    const previous =
      byId(
        "prevTaskButton"
      );

    if (isApply) {
      step2.hidden =
        false;
      step2.classList.add(
        "ready-completed-step-card"
      );

      step3.hidden =
        false;

      if (previous) {
        previous.hidden =
          false;
        previous.textContent =
          "← Part A";
      }

      if (next) {
        next.hidden =
          true;
      }

      return;
    }

    step2.hidden =
      false;
    step2.classList.remove(
      "ready-completed-step-card"
    );

    if (unavailable) {
      step3.hidden =
        false;

      const mount =
        byId(
          "sessionStep3Mount"
        );

      const note =
        step3.querySelector(
          ".session-step-note"
        );

      if (note) {
        note.textContent =
          "No fresh Part B item is available for this target today.";
      }

      if (mount) {
        mount.hidden =
          false;

        mount.innerHTML = `
          <div class="ready-part-b-unavailable">
            <strong>
              No fresh Part B item is available for this target today.
            </strong>
          </div>
        `;
      }

      if (next) {
        next.hidden =
          true;
      }

      return;
    }

    step3.hidden =
      true;

    if (next) {
      next.hidden =
        false;
      next.textContent =
        "Part B →";
    }
  }


  function readyV9SingularTransferLabel() {
    const step4 =
      byId(
        "sessionStep4Card"
      );

    if (!step4) {
      return;
    }

    const labels =
      [
        ...step4.querySelectorAll(
          "h3, h4, strong"
        )
      ].filter(
        node =>
          /^Transfer word \d+$/i.test(
            readyV9NormalizedText(
              node.textContent
            )
          )
      );

    if (
      labels.length ===
      1
    ) {
      labels[0].textContent =
        "Transfer word";
    }
  }


  function readyV9Apply(
    task
  ) {
    readyV9RenderTeacherPlan(
      task
    );

    readyV9TargetOnlyRetrieve();

    readyV9HideLegacyActivityBranches();

    readyV9EnsureTeacherDirections(
      task
    );

    readyV9OneActivePart(
      task
    );

    readyV9SingularTransferLabel();
  }




  /* FIRST_VOLO_ACTIVITY_DEMAND_READINESS_V10 */

  const readyV10DemandReadinessPolicy =
    Object.freeze({
      learn: {
        targetMustBeKnown: false,
        requiresKnownOtherMorphemes: false
      },

      find: {
        targetMustBeKnown: true,
        requiresKnownOtherMorphemes: false
      },

      hunt: {
        targetMustBeKnown: true,
        requiresKnownOtherMorphemes: false
      },

      meaning: {
        targetMustBeKnown: true,
        requiresKnownOtherMorphemes: false
      },

      morpheme: {
        targetMustBeKnown: true,
        requiresKnownOtherMorphemes: false
      },

      break: {
        targetMustBeKnown: true,
        requiresKnownOtherMorphemes: true
      },

      infer: {
        targetMustBeKnown: true,
        requiresKnownOtherMorphemes: false
      },

      build: {
        targetMustBeKnown: true,
        requiresKnownOtherMorphemes: true
      },

      use: {
        targetMustBeKnown: true,
        requiresKnownOtherMorphemes: false
      },

      change: {
        targetMustBeKnown: true,
        requiresKnownOtherMorphemes: false
      }
    });


  function readyV10PracticeTasks() {
    return (
      state.tasks || []
    ).filter(
      item =>
        item?.stage !==
        "Apply"
    );
  }


  function readyV10ApplyTask() {
    return (
      state.tasks || []
    ).find(
      item =>
        item?.stage ===
        "Apply"
    ) || null;
  }


  function readyV10PracticePosition(
    task
  ) {
    const practice =
      readyV10PracticeTasks();

    const index =
      practice.indexOf(
        task
      );

    return {
      practice,
      index,
      number:
        index >= 0
          ? index + 1
          : null,
      total:
        practice.length
    };
  }


  function readyV10PartANavigation(
    task
  ) {
    const next =
      byId(
        "nextTaskButton"
      );

    const previous =
      byId(
        "prevTaskButton"
      );

    const step2 =
      byId(
        "sessionStep2Card"
      );

    const step2Note =
      step2?.querySelector(
        ".session-step-note"
      );

    const isApply =
      task?.stage ===
      "Apply";

    if (isApply) {
      if (previous) {
        previous.hidden =
          false;
        previous.textContent =
          "← Part A";
      }

      return;
    }

    const {
      index,
      number,
      total
    } =
      readyV10PracticePosition(
        task
      );

    if (
      step2Note &&
      number
    ) {
      step2Note.textContent =
        readyPartAInstructionNote(
          task,
          { number, total }
        );
    }

    if (!next) {
      return;
    }

    if (
      index >= 0 &&
      index <
        total - 1
    ) {
      next.hidden =
        false;
      next.textContent =
        "Next practice →";
      return;
    }

    const apply =
      readyV10ApplyTask();

    if (
      apply &&
      !apply
        ?.recipe
        ?._readyBreakUnavailable
    ) {
      next.hidden =
        false;
      next.textContent =
        "Part B →";
      return;
    }

    next.hidden =
      true;
  }


  function readyV10TeacherPlanCounts(
    task
  ) {
    const section =
      readyV9TeacherPlanSection();

    if (!section) {
      return;
    }

    const activity =
      readyActivityDisplayName(
        task
      );

    const practice =
      readyV10PracticeTasks();

    const apply =
      readyV10ApplyTask();

    const rows =
      [
        ...section.querySelectorAll(
          "li, p"
        )
      ].filter(
        node =>
          /^[1-5]\.\s*/.test(
            readyV9NormalizedText(
              node.textContent
            )
          )
      );

    if (rows[1]) {
      rows[1].innerHTML = `
        <strong>
          2. ${esc(activity)} · Part A: Practice
        </strong>
        — ${practice.length} ${
          practice.length === 1
            ? "item"
            : "items"
        }
      `;
    }

    if (rows[2]) {
      if (
        apply
          ?.recipe
          ?._readyBreakUnavailable
      ) {
        rows[2].innerHTML = `
          <strong>
            3. ${esc(activity)} · Part B: Apply
          </strong>
          — not available for this target today
        `;
      } else {
        rows[2].innerHTML = `
          <strong>
            3. ${esc(activity)} · Part B: Apply
          </strong>
        `;
      }
    }
  }


  function readyV10Apply(
    task
  ) {
    readyV10PartANavigation(
      task
    );

    readyV10TeacherPlanCounts(
      task
    );
  }




  /* FIRST_VOLO_STEP5_MEANINGFUL_VARIATION_V12 */

  let readyV12PracticeObserver =
    null;


  function readyV12Normalize(
    value
  ) {
    return String(
      value ||
      ""
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
  }


  function readyV12TargetCore() {
    return readyV12Normalize(
      readyTargetLabel()
    )
      .replace(
        /^(?:prefix|suffix|root|base|greek combining form|combining form)\s+/i,
        ""
      )
      .trim();
  }


  function readyV12TargetForms() {
    return readyV12TargetCore()
      .split(
        /[\/,]/
      )
      .map(
        item =>
          item
            .replace(
              /[^A-Za-z]/g,
              ""
            )
            .toLowerCase()
      )
      .filter(
        item =>
          item.length >=
          2
      );
  }


  function readyV12PracticeRoot() {
    const direct =
      byId(
        "sessionStep5Card"
      ) ||
      byId(
        "practiceSetPanel"
      ) ||
      byId(
        "practiceSet"
      );

    if (direct) {
      return direct;
    }

    const heading =
      [
        ...document.querySelectorAll(
          "h2, h3, h4, strong"
        )
      ].find(
        node =>
          /optional practice set/i.test(
            readyV12Normalize(
              node.textContent
            )
          )
      );

    return (
      heading
        ?.closest(
          "section, .session-step-flow-card, .practice-set"
        ) ||
      heading
        ?.parentElement ||
      null
    );
  }


  function readyV12QuestionNodes(
    root
  ) {
    if (!root) {
      return [];
    }

    const candidates =
      [
        ...root.querySelectorAll(
          ".practice-question, .question-text, h4, h5, p"
        )
      ].filter(
        node => {
          const text =
            readyV12Normalize(
              node.textContent
            );

          return (
            /^Which word part means\b/i.test(
              text
            ) ||
            /^What does .+ mean\??$/i.test(
              text
            )
          );
        }
      );

    const seenCards =
      new Set();

    return candidates.filter(
      node => {
        const card =
          readyV12PracticeCard(
            node
          );

        if (
          seenCards.has(
            card
          )
        ) {
          return false;
        }

        seenCards.add(
          card
        );

        return true;
      }
    );
  }


  function readyV12PracticeCard(
    node
  ) {
    return (
      node
        ?.closest(
          ".practice-set-item, .practice-item, .practice-question-card, article, li"
        ) ||
      node
        ?.parentElement ||
      node
    );
  }


  function readyV12WrongChoice(
    card,
    target
  ) {
    if (!card) {
      return "";
    }

    const normalizedTarget =
      readyV12Normalize(
        target
      )
        .replace(
          /[^A-Za-z]/g,
          ""
        )
        .toLowerCase();

    return (
      [
        ...card.querySelectorAll(
          "button"
        )
      ]
        .map(
          button =>
            readyV12Normalize(
              button.textContent
            )
        )
        .find(
          text => {
            const normalized =
              text
                .replace(
                  /[^A-Za-z]/g,
                  ""
                )
                .toLowerCase();

            return (
              normalized &&
              normalized !==
                normalizedTarget &&
              normalized.length <=
                24 &&
              !/show|check|continue|more|support|print/i.test(
                text
              )
            );
          }
        ) ||
      ""
    );
  }


  function readyV12MeaningChunk(
    text
  ) {
    return readyV12Normalize(
      text
    )
      .replace(
        /^Which word part means\s*/i,
        ""
      )
      .replace(
        /\?$/,
        ""
      )
      .trim();
  }


  function readyV12WordPartPrompt(
    index,
    meaningChunk,
    wrongChoice
  ) {
    const meaning =
      meaningChunk ||
      "this meaning";

    const wrong =
      wrongChoice
        ? ` ${wrongChoice}`
        : " another word part";

    const variants = [
      {
        move:
          "Retrieve",
        prompt:
          `Which word part means ${meaning}?`
      },
      {
        move:
          "Correct",
        prompt:
          `A student chose${wrong}, but it does not match ${meaning}. Which word part should replace it?`
      },
      {
        move:
          "Select",
        prompt:
          `You need a word part that means ${meaning}. Which one would you choose?`
      },
      {
        move:
          "Confirm",
        prompt:
          `Check the options. Which word part actually carries the meaning ${meaning}?`
      },
      {
        move:
          "Recall",
        prompt:
          `Before looking at a whole word, retrieve the word part that means ${meaning}.`
      },
      {
        move:
          "Retrieve again",
        prompt:
          `Which word part would you use for the meaning ${meaning}?`
      },
      {
        move:
          "Correct again",
        prompt:
          `Do not choose${wrong} just because it is a word part. Which choice really matches ${meaning}?`
      },
      {
        move:
          "Choose",
        prompt:
          `Choose the word part that belongs with the meaning ${meaning}.`
      },
      {
        move:
          "Verify",
        prompt:
          `Which option gives the correct word part for ${meaning}?`
      },
      {
        move:
          "Final recall",
        prompt:
          `Retrieve the word part for ${meaning} one more time.`
      }
    ];

    return variants[
      index %
      variants.length
    ];
  }


  function readyV12MeaningPrompt(
    index,
    target
  ) {
    const variants = [
      {
        move:
          "Retrieve",
        prompt:
          `What does ${target} mean?`
      },
      {
        move:
          "Match",
        prompt:
          `Which meaning belongs with ${target}?`
      },
      {
        move:
          "Recall",
        prompt:
          `You see ${target} in a word. Which meaning should you retrieve?`
      },
      {
        move:
          "Explain",
        prompt:
          `Which option best explains what ${target} contributes to a word?`
      },
      {
        move:
          "Confirm",
        prompt:
          `Check the choices. Which meaning correctly matches ${target}?`
      },
      {
        move:
          "Retrieve again",
        prompt:
          `What meaning would you connect with ${target}?`
      },
      {
        move:
          "Select",
        prompt:
          `Choose the meaning that goes with ${target}.`
      },
      {
        move:
          "Verify",
        prompt:
          `Which choice gives the correct meaning for ${target}?`
      },
      {
        move:
          "Recall again",
        prompt:
          `When you meet ${target}, what should it make you think about?`
      },
      {
        move:
          "Final recall",
        prompt:
          `Retrieve the meaning of ${target} one more time.`
      }
    ];

    return variants[
      index %
      variants.length
    ];
  }


  function readyV12TaskWord(
    task
  ) {
    const recipe =
      task
        ?.recipe ||
      {};

    const values = [
      recipe.word,
      recipe.displayWord,
      recipe.exampleWord,
      recipe.practiceWord,
      recipe.item
        ?.word,
      task.word
    ];

    return readyV12Normalize(
      values.find(
        value =>
          typeof value ===
            "string" &&
          value.trim()
      ) ||
      ""
    );
  }


  function readyV12ApplicationWords() {
    const targetForms =
      readyV12TargetForms();

    const words =
      (
        state.tasks ||
        []
      )
        .filter(
          task =>
            !/transfer/i.test(
              String(
                task
                  ?.stage ||
                ""
              )
            )
        )
        .map(
          readyV12TaskWord
        )
        .filter(
          Boolean
        )
        .filter(
          word => {
            const clean =
              word
                .toLowerCase()
                .replace(
                  /[^a-z]/g,
                  ""
                );

            return (
              !targetForms.length ||
              targetForms.some(
                form =>
                  clean.includes(
                    form
                  )
              )
            );
          }
        );

    return [
      ...new Set(
        words
      )
    ];
  }


  function readyV12AddMoveLabel(
    questionNode,
    label
  ) {
    const card =
      readyV12PracticeCard(
        questionNode
      );

    if (
      !card ||
      card.querySelector(
        ".ready-v12-practice-move"
      )
    ) {
      return;
    }

    const badge =
      document.createElement(
        "div"
      );

    badge.className =
      "ready-v12-practice-move";

    badge.textContent =
      `Practice move · ${label}`;

    questionNode
      .parentElement
      ?.insertBefore(
        badge,
        questionNode
      );
  }


  function readyV12AfterResponse(
    card,
    word,
    target
  ) {
    if (
      !card ||
      !word ||
      card.querySelector(
        ".ready-v12-after-response"
      )
    ) {
      return;
    }

    const sequentialWordPart =
      currentActivity() ===
        "morpheme" &&
      Boolean(
        card.closest(
          "#sessionPracticeSetCard"
        )
      );

    if (sequentialWordPart) {
      return;
    }

    const strip =
      document.createElement(
        "div"
      );

    strip.className =
      "ready-v12-after-response ready-teacher-follow-up";

    strip.innerHTML = `
      <strong>
        Teacher follow-up (optional):
      </strong>
      After the independent response is complete, you may connect the target to a whole-word example.
      If useful, ask the student to locate
      <strong>
        ${esc(target)}
      </strong>
      in
      <strong>
        ${esc(word)}
      </strong>.
      This follow-up is for guided application and is not part of the scored response.
    `;

    card.appendChild(
      strip
    );
  }


  function readyV12WireApplication(
    questionNode,
    word,
    target
  ) {
    if (
      !word
    ) {
      return;
    }

    const card =
      readyV12PracticeCard(
        questionNode
      );

    if (
      !card ||
      card.dataset
        .readyV12ApplicationWired ===
        "1"
    ) {
      return;
    }

    card.dataset
      .readyV12ApplicationWired =
      "1";

    [
      ...card.querySelectorAll(
        "button"
      )
    ]
      .filter(
        button =>
          !/show|support|continue|more|print/i.test(
            readyV12Normalize(
              button.textContent
            )
          )
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              window.setTimeout(
                () =>
                  readyV12AfterResponse(
                    card,
                    word,
                    target
                  ),
                0
              );
            },
            {
              once:
                true
            }
          );
        }
      );
  }


  function readyV12VaryStep5() {
    const root =
      readyV12PracticeRoot();

    if (!root) {
      return;
    }

    const questions =
      readyV12QuestionNodes(
        root
      );

    if (!questions.length) {
      return;
    }

    const target =
      readyV12TargetCore();

    const applicationWords =
      readyV12ApplicationWords();

    questions.forEach(
      (
        node,
        index
      ) => {
        if (
          node.dataset
            .readyV12Varied ===
          "1"
        ) {
          return;
        }

        const original =
          readyV12Normalize(
            node.textContent
          );

        const card =
          readyV12PracticeCard(
            node
          );

        let variant =
          null;

        if (
          /^Which word part means\b/i.test(
            original
          )
        ) {
          const meaning =
            readyV12MeaningChunk(
              original
            );

          const wrongChoice =
            readyV12WrongChoice(
              card,
              target
            );

          variant =
            readyV12WordPartPrompt(
              index,
              meaning,
              wrongChoice
            );
        } else if (
          /^What does .+ mean\??$/i.test(
            original
          )
        ) {
          variant =
            readyV12MeaningPrompt(
              index,
              target
            );
        }

        if (!variant) {
          return;
        }

        node.dataset
          .readyV12OriginalQuestion =
          original;

        node.dataset
          .readyV12Varied =
          "1";

        node.textContent =
          variant.prompt;

        readyV12AddMoveLabel(
          node,
          variant.move
        );

        readyV12WireApplication(
          node,
          applicationWords[
            index %
            Math.max(
              applicationWords.length,
              1
            )
          ] ||
          "",
          target
        );
      }
    );
  }


  function readyV12InstallPracticeObserver() {
    readyV12VaryStep5();

    if (
      readyV12PracticeObserver
    ) {
      return;
    }

    readyV12PracticeObserver =
      new MutationObserver(
        () =>
          readyV12VaryStep5()
      );

    readyV12PracticeObserver.observe(
      document.body,
      {
        childList:
          true,
        subtree:
          true
      }
    );
  }




  /* FIRST_VOLO_SESSION_DURATION_AND_PRINT_PARITY_V13 */

  const readyV13DurationPolicy =
    Object.freeze({
      10: Object.freeze({
        partAItems: 1,
        transferItems: 1,
        step5Limit: 5,
        step5Mode: "optional",
        step5Plan:
          "Optional Practice Set — use only if time remains or additional practice is indicated"
      }),

      15: Object.freeze({
        partAItems: 2,
        transferItems: 1,
        step5Limit: 5,
        step5Mode: "optional",
        step5Plan:
          "Optional Practice Set — use up to five items if time remains or additional practice is indicated"
      }),

      30: Object.freeze({
        partAItems: 4,
        transferItems: 2,
        step5Limit: 10,
        step5Mode: "extended",
        step5Plan:
          "Practice Set — complete the first five; continue with up to five more as appropriate"
      })
    });


  function readyV13Text(
    value
  ) {
    return String(
      value ||
      ""
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
  }


  function readyV13DurationMinutes() {
    const stateValues = [
      state?.sessionMinutes,
      state?.minutes,
      state?.durationMinutes,
      state?.sessionLength,
      state?.duration
    ];

    for (
      const value
      of stateValues
    ) {
      const number =
        Number.parseInt(
          value,
          10
        );

      if (
        readyV13DurationPolicy[
          number
        ]
      ) {
        return number;
      }
    }

    const exactHeading =
      [
        ...document.querySelectorAll(
          "h1, h2, h3, h4, strong, span, div"
        )
      ].find(
        node =>
          /^(10|15|30)-MINUTE SESSION$/i.test(
            readyV13Text(
              node.textContent
            )
          )
      );

    if (
      exactHeading
    ) {
      const match =
        readyV13Text(
          exactHeading.textContent
        )
          .match(
            /^(10|15|30)-MINUTE SESSION$/i
          );

      return Number(
        match[1]
      );
    }

    const bodyMatch =
      readyV13Text(
        document.body
          ?.innerText ||
        ""
      )
        .match(
          /\b(10|15|30)-MINUTE SESSION\b/i
        );

    return bodyMatch
      ? Number(
          bodyMatch[1]
        )
      : null;
  }


  function readyV13ReplaceTextEverywhere(
    fromText,
    toText
  ) {
    const walker =
      document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );

    const nodes = [];

    while (
      walker.nextNode()
    ) {
      nodes.push(
        walker.currentNode
      );
    }

    nodes.forEach(
      node => {
        if (
          node.nodeValue
            ?.includes(
              fromText
            )
        ) {
          node.nodeValue =
            node.nodeValue.replaceAll(
              fromText,
              toText
            );
        }
      }
    );
  }


  function readyV13NormalizeTeacherLedCopy() {
    readyV13ReplaceTextEverywhere(
      "Teacher-led digital instruction",
      "Teacher-led instruction"
    );

    readyV13ReplaceTextEverywhere(
      "Begin each new demand with an independent attempt. If a barrier appears, use the least support needed, retry the same demand, then fade support.",
      "Let the student try the activity's morphology demand first. If decoding, word knowledge, retrieval, or sentence generation gets in the way, give only the access help needed. If the morphology itself is difficult, use the least support shown, retry the same demand, and fade the support after success."
    );

    readyV13ReplaceTextEverywhere(
      "Begin each new demand with the student's independent attempt. Open support only if a barrier appears.",
      "Keep the student's target reasoning independent. Give whole-word meaning, context, or non-target information when the activity allows it; if the target demand needs help, add the least support needed, retry, then reduce support when possible."
    );
  }


  function readyV13RetrieveBlocks() {
    const headings =
      [
        ...document.querySelectorAll(
          "h1, h2, h3, h4, strong, .step-title"
        )
      ].filter(
        node => {
          const text =
            readyV13Text(
              node.textContent
            );

          return (
            text ===
              "Retrieve" ||
            /^1\.\s*Retrieve$/i.test(
              text
            )
          );
        }
      );

    return [
      ...new Set(
        headings
          .map(
            heading =>
              heading.closest(
                "section, article, .session-step-flow-card, .print-page, .page"
              ) ||
              heading.parentElement
          )
          .filter(
            Boolean
          )
      )
    ];
  }


  function readyV13TargetOnlyRetrieveEverywhere() {
    const target =
      readyV13Text(
        readyTargetLabel()
      )
        .toLowerCase();

    readyV13RetrieveBlocks()
      .forEach(
        block => {
          const prompts =
            [
              ...block.querySelectorAll(
                "li"
              )
            ]
              .filter(
                item =>
                  /^What does .+ mean\??$/i.test(
                    readyV13Text(
                      item.textContent
                    )
                  )
              );

          if (
            prompts.length <=
            1
          ) {
            return;
          }

          const keep =
            prompts.find(
              item =>
                readyV13Text(
                  item.textContent
                )
                  .toLowerCase()
                  .includes(
                    target
                  )
            ) ||
            prompts[0];

          prompts.forEach(
            item => {
              item.hidden =
                item !== keep;
            }
          );
        }
      );
  }


  function readyV13TeacherPlanSections() {
    const headings =
      [
        ...document.querySelectorAll(
          "h1, h2, h3, h4, strong, div"
        )
      ].filter(
        node => {
          const text =
            readyV13Text(
              node.textContent
            );

          return (
            text ===
              "What you will do" ||
            text ===
              "Teacher Session Plan"
          );
        }
      );

    return headings
      .map(
        heading => {
          if (
            readyV13Text(
              heading.textContent
            ) ===
            "What you will do"
          ) {
            heading.textContent =
              "Teacher Session Plan";
          }

          return (
            heading.closest(
              "section, article, .print-page, .page"
            ) ||
            heading.parentElement
          );
        }
      )
      .filter(
        Boolean
      );
  }


  function readyV13RewriteTeacherPlan() {
    readyV9RenderTeacherPlan(
      state.tasks?.[
        state.taskIndex
      ] ||
      state.tasks?.[0] ||
      {}
    );
  }

  function readyV13Step5Intro() {
    const minutes =
      readyV13DurationMinutes();

    const policy =
      readyV13DurationPolicy[
        minutes
      ];

    const root =
      readyV12PracticeRoot();

    if (
      !policy ||
      !root
    ) {
      return;
    }

    const intro =
      [
        ...root.querySelectorAll(
          "p, div, span"
        )
      ].find(
        node =>
          /Use the first five items|continue through all ten|up to five/i.test(
            readyV13Text(
              node.textContent
            )
          )
      );

    if (intro) {
      intro.textContent =
        readyStep5Copy(
          readyActivity(
            state.tasks?.[0] ||
            null
          ),
          minutes
        ).intro;
    }

    if (
      policy.step5Limit ===
      5
    ) {
      const questions =
        readyV12QuestionNodes(
          root
        );

      questions.forEach(
        (
          node,
          index
        ) => {
          if (
            index >=
            5
          ) {
            const card =
              readyV12PracticeCard(
                node
              );

            if (card) {
              card.hidden =
                true;
            }
          }
        }
      );

      [
        ...root.querySelectorAll(
          "button"
        )
      ]
        .filter(
          button =>
            /continue|more|next five|all ten/i.test(
              readyV13Text(
                button.textContent
              )
            )
        )
        .forEach(
          button => {
            button.hidden =
              true;
          }
        );
    }
  }


  function readyV13CheckTransferLabel() {
    const step4 =
      byId(
        "sessionStep4Card"
      );

    if (!step4) {
      return;
    }

    const labels =
      [
        ...step4.querySelectorAll(
          "h3, h4, strong"
        )
      ].filter(
        node =>
          /^Transfer word \d+$/i.test(
            readyV13Text(
              node.textContent
            )
          )
      );

    if (
      labels.length ===
      1
    ) {
      labels[0].textContent =
        "Transfer word";
    }
  }


  function readyV13Apply() {
    readyV13NormalizeTeacherLedCopy();

    readyV13TargetOnlyRetrieveEverywhere();

    readyV13RewriteTeacherPlan();

    readyV13Step5Intro();

    readyV13CheckTransferLabel();
  }


  let readyV13Observer =
    null;


  function readyV13Install() {
    readyV13Apply();

    if (
      !readyV13Observer
    ) {
      readyV13Observer =
        new MutationObserver(
          () =>
            readyV13Apply()
        );

      readyV13Observer.observe(
        document.body,
        {
          childList: true,
          subtree: true
        }
      );
    }
  }


  window.addEventListener(
    "beforeprint",
    () =>
      readyV13Apply()
  );









  /* FIRST_VOLO_TEACHER_FACING_APPLICATION_FOLLOWUP_V4K */

  /* FIRST_VOLO_WORD_PART_SEQUENTIAL_RECALL_V4J */

  /* FIRST_VOLO_WORD_PART_STEP5_FRESH_LOAD_V4I3 */

  /* FIRST_VOLO_WORD_PART_TARGETED_STEP5_V4H */

  /* FIRST_VOLO_DIRECT_STEP5_RENDER_V4G */

  /* FIRST_VOLO_EVENT_DRIVEN_STEP_SEQUENCE_V4D */

  /* FIRST_VOLO_PERSISTENT_STEP_PRESENTATION_V4E */

  /* FIRST_VOLO_SEQUENCE_CLEANUP_V4F */

  function readySequenceTransferCard() {
    return document.querySelector(
      ".session-transfer-card"
    );
  }


  function readySequencePracticeCard() {
    return byId(
      "sessionPracticeSetCard"
    );
  }


  function readySequenceHasTransfer() {
    return Boolean(
      state.plan
        ?.transfer
        ?.items
        ?.length
    );
  }


  function readyResetFutureStepVisibility() {
    const transferCard =
      readySequenceTransferCard();

    const practiceCard =
      readySequencePracticeCard();

    if (transferCard) {
      transferCard.hidden =
        true;
    }

    if (practiceCard) {
      practiceCard.hidden =
        true;
    }
  }


  function readyRevealPracticeSet() {
    const transferCard =
      readySequenceTransferCard();

    const practiceCard =
      readySequencePracticeCard();

    if (transferCard) {
      transferCard.hidden =
        false;
      transferCard.classList.add(
        "ready-completed-step-card"
      );
    }

    if (practiceCard) {
      practiceCard.hidden =
        false;

      practiceCard
        .scrollIntoView?.({
          behavior: "smooth",
          block: "start"
        });
    }
  }


  function readyRevealCheckTransfer() {
    if (
      !readySequenceHasTransfer()
    ) {
      readyRevealPracticeSet();
      return;
    }

    const transferCard =
      readySequenceTransferCard();

    const practiceCard =
      readySequencePracticeCard();

    if (practiceCard) {
      practiceCard.hidden =
        true;
    }

    if (transferCard) {
      transferCard.hidden =
        false;

      transferCard
        .scrollIntoView?.({
          behavior: "smooth",
          block: "start"
        });
    }
  }


  function readyConfigureSequenceNextButton() {
    const next =
      byId(
        "nextTaskButton"
      );

    if (
      !next ||
      !state.tasks?.length
    ) {
      return;
    }

    const atLastTask =
      state.taskIndex >=
      state.tasks.length - 1;

    if (!atLastTask) {
      return;
    }

    next.hidden =
      false;

    next.disabled =
      false;

    next.textContent =
      readySequenceHasTransfer()
        ? "Continue to Check Transfer →"
        : (
              currentActivity() === "morpheme"
                ? "Continue to Optional Practice Set →"
                : "Continue to Practice Set →"
            );
  }


  window.FirstVoloTeacherSessionFlow = {
    ...(
      window.FirstVoloTeacherSessionFlow ||
      {}
    ),
    revealCheckTransfer:
      readyRevealCheckTransfer,
    revealPracticeSet:
      readyRevealPracticeSet,
    resetFutureSteps:
      readyResetFutureStepVisibility
  };


  function renderTask() {
    readyPrepareEffectiveTasks();

    const task =
      state.tasks[
        state.taskIndex
      ];

    byId(
      "taskStage"
    ).textContent =
      task?.stage ||
      "Teach / Practice";

    byId(
      "taskCount"
    ).textContent =
      state.tasks.length
        ? (
            `${state.taskIndex + 1} ` +
            `of ${state.tasks.length}`
          )
        : "";

    byId(
      "taskPrompt"
    ).textContent =
      task?.prompt ||
      "";

    setTaskDisplayMode(
      task
    );

    readyRenderPreResponseAccess(
      task
    );

    byId(
      "previousTaskButton"
    ).disabled =
      state.taskIndex <= 0;

    byId(
      "nextTaskButton"
    ).disabled =
      state.taskIndex >=
      state.tasks.length - 1;

    renderReadyStudentMaterial(
      task
    );

    renderReadyPrintable();

    clearMat();
    renderActivitySurface();

    readyConfigureSequenceNextButton();
  }


  function segmentationParts(value) {
    return String(
      value || ""
    )
      .split(
        /\s*(?:\+|\/|\||·)\s*/
      )
      .map(
        part =>
          normalize(part)
      )
      .filter(Boolean);
  }


  function sameSegmentation(
    actual,
    expected
  ) {
    const a =
      segmentationParts(
        actual
      );

    const b =
      segmentationParts(
        expected
      );

    return (
      a.length > 1 &&
      a.length === b.length &&
      a.every(
        (part, index) =>
          part === b[index]
      )
    );
  }


  function checkPromptResponse() {
    const feedback =
      byId(
        "promptResponseFeedback"
      );

    if (
      currentActivity() !==
        "break"
    ) {
      feedback.textContent =
        "";

      return;
    }

    const task =
      state.tasks[
        state.taskIndex
      ];

    const response =
      byId(
        "sessionPromptResponseInput"
      ).value;

    const expected =
      task
        ?.recipe
        ?.segmentation ||
      null;

    if (!response.trim()) {
      feedback.className =
        "session-build-feedback is-retry";

      feedback.textContent =
        "Enter the word parts first.";

      return;
    }

    if (!expected) {
      feedback.className =
        "session-build-feedback";


      feedback.textContent =
        "Response recorded for educator review. Use only the approved meaningful-part analysis; do not force unvalidated boundaries.";

      return;
    }

    if (
      sameSegmentation(
        response,
        expected
      )
    ) {
      feedback.className =
        "session-build-feedback is-correct";

      feedback.textContent =
        "✓ Yes — those are the approved meaningful parts.";

      return;
    }

    feedback.className =
      "session-build-feedback is-retry";

    feedback.textContent =
      "Not yet. Look again for meaningful word-part boundaries and try once more before adding support.";
  }



  const ACTIVITY_RESPONSE_CONFIG =
    Object.freeze({
      learn: Object.freeze({
        label:
          "Explain the target meaning or what it contributes.",
        placeholder:
          "Student explanation…",
        button:
          "Review explanation"
      }),

      find: Object.freeze({
        label:
          "Write the word part the student found.",
        placeholder:
          "Target word part…",
        button:
          "Review Find response"
      }),

      hunt: Object.freeze({
        label:
          "List the words the student identified as containing the target.",
        placeholder:
          "Words containing the target…",
        button:
          "Review Word Hunt response"
      }),

      meaning: Object.freeze({
        label:
          "Write the meaning the student gave.",
        placeholder:
          "Target meaning…",
        button:
          "Review meaning"
      }),

      morpheme: Object.freeze({
        label:
          "Write the word part the student retrieved.",
        placeholder:
          "Word part…",
        button:
          "Review Word Part response"
      }),

      infer: Object.freeze({
        label:
          "Write the inferred whole-word meaning and the morphology used.",
        placeholder:
          "Inferred meaning and reasoning…",
        button:
          "Review inference"
      }),

      use: Object.freeze({
        label:
          "Write the student's sentence or contextual response.",
        placeholder:
          "Student sentence / response…",
        button:
          "Review Use It response"
      }),

      change: Object.freeze({
        label:
          "Write the selected related form and explain the morphological change.",
        placeholder:
          "Related form + explanation…",
        button:
          "Review Change It response"
      })
    });


  function ensureTeacherSessionUxStyles() {
    if (
      document.getElementById(
        "teacherSessionUxStyles"
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id =
      "teacherSessionUxStyles";

    style.textContent = `
      .today-session-overview {
        background: #fff;
        border: 1px solid #d9e4ee;
        border-radius: 18px;
        margin: 0 0 16px;
        padding: 18px 20px;
      }

      .today-session-overview h2 {
        margin: 0 0 8px;
      }

      .today-session-overview ol {
        margin: 12px 0 0;
        padding-left: 1.35rem;
      }

      .today-session-overview li {
        margin: 7px 0;
      }

      .ready-pre-response-access {
        background: #f7fbff;
        border: 1px solid #d6e6f3;
        border-radius: 14px;
        margin: 12px 0;
        padding: 12px 14px;
      }

      .ready-pre-response-access p {
        margin: 6px 0;
      }

      .ready-item-review {
        border-top: 1px solid #dce5ec;
        margin-top: 14px;
        padding-top: 8px;
      }

      .ready-item-review > summary {
        cursor: pointer;
        font-weight: 800;
        padding: 8px 0;
      }

      .ready-item-review-body p {
        margin: 7px 0;
      }

      .session-activity-response {
        background: #f7f9fb;
        border: 1px solid #dce5ec;
        border-radius: 14px;
        margin-top: 14px;
        padding: 14px;
      }

      .session-activity-response label {
        display: block;
        font-weight: 700;
        margin-bottom: 8px;
      }

      .session-activity-response textarea,
      .session-activity-response input {
        box-sizing: border-box;
        font: inherit;
        min-height: 48px;
        padding: 10px 12px;
        width: 100%;
      }

      .session-activity-response textarea {
        min-height: 86px;
        resize: vertical;
      }

      .boundary-word {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        font-size: 1.35rem;
        font-weight: 700;
        gap: 0;
        margin: 4px 0 12px;
      }

      .boundary-letter {
        display: inline-block;
        padding: 4px 1px;
      }

      .boundary-toggle {
        background: transparent;
        border: 0;
        border-left: 2px solid transparent;
        border-radius: 0;
        cursor: pointer;
        height: 34px;
        margin: 0 2px;
        padding: 0 4px;
        width: 10px;
      }

      .boundary-toggle:hover,
      .boundary-toggle:focus {
        border-left-color: #2876bb;
        outline: none;
      }

      .boundary-toggle.is-marked {
        border-left-color: #1c5d94;
      }

      .session-guidance-after-attempt {
        margin-top: 16px;
      }

      .session-support-details {
        border-top: 1px solid #dce5ec;
        margin-top: 14px;
        padding-top: 8px;
      }

      .session-support-details > summary {
        cursor: pointer;
        font-weight: 800;
        padding: 8px 0;
      }

      .print-response-item {
        border: 1px solid #d9e1e8;
        border-radius: 12px;
        margin: 0 0 14px;
        padding: 14px;
      }

      .print-response-lines {
        line-height: 2;
        margin-top: 12px;
        white-space: pre-line;
      }

      .print-mat-page.is-task-response-page .print-build-mat {
        align-items: stretch;
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .print-mat-page.is-task-response-page .print-response-item {
        break-inside: avoid;
        box-sizing: border-box;
        margin: 0;
        min-width: 0;
        page-break-inside: avoid;
      }

      .print-response-instruction {
        display: block;
        font-size: 0.9em;
        margin-top: 8px;
      }

      .print-task-response-lines {
        display: grid;
        gap: 12px;
        margin-top: 14px;
      }

      .print-task-response-line {
        border-bottom: 1px solid #4f5963;
        box-sizing: border-box;
        height: 20px;
        width: 100%;
      }

      @media print {
        .print-mat-page.is-task-response-page .print-build-mat {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }


  function taskWord(task) {
    return (
      task?.recipe?.word ||
      task?.word ||
      ""
    );
  }


  function directBoundaryData(task) {
    const word =
      String(
        taskWord(task) ||
        ""
      ).trim();

    const segmentation =
      String(
        task
          ?.recipe
          ?.segmentation ||
        ""
      ).trim();

    if (
      !word ||
      !segmentation
    ) {
      return null;
    }

    const parts =
      segmentation
        .split(
          /\s*\+\s*/
        )
        .map(
          part =>
            part
              .replace(
                /^-+|-+$/g,
                ""
              )
              .trim()
        )
        .filter(Boolean);

    const joined =
      parts
        .join("")
        .toLowerCase();

    if (
      joined !==
      word.toLowerCase()
    ) {
      return null;
    }

    let cursor = 0;
    const boundaries = [];

    for (
      let index = 0;
      index <
        parts.length - 1;
      index += 1
    ) {
      cursor +=
        parts[index].length;

      boundaries.push(
        cursor
      );
    }

    return {
      word,
      boundaries
    };
  }


  function ensureActivityResponseSurface() {
    let area =
      document.getElementById(
        "sessionActivityResponse"
      );

    if (area) {
      return area;
    }

    area =
      document.createElement(
        "div"
      );

    area.id =
      "sessionActivityResponse";

    area.className =
      "session-activity-response";

    const taskCard =
      document.getElementById(
        "sessionPromptResponse"
      );

    if (taskCard) {
      taskCard.insertAdjacentElement(
        "afterend",
        area
      );
    } else {
      const material =
        document.getElementById(
          "digitalMaterialTitle"
        )
          ?.closest(
            "section"
          );

      material?.appendChild(
        area
      );
    }

    return area;
  }


  function reviewGenericActivityResponse() {
    const feedback =
      document.getElementById(
        "sessionActivityResponseFeedback"
      );

    if (!feedback) {
      return;
    }

    const input =
      document.getElementById(
        "sessionActivityResponseInput"
      );

    if (
      !String(
        input?.value ||
        ""
      ).trim()
    ) {
      feedback.textContent =
        "Enter the student's response first.";

      return;
    }

    feedback.textContent =
      "Response recorded. Use the item-specific review criteria with this task.";
  }


  function renderGenericActivityResponse() {
    const activity =
      currentActivity();

    const config =
      ACTIVITY_RESPONSE_CONFIG[
        activity
      ] || null;

    const area =
      ensureActivityResponseSurface();

    if (!config) {
      area.hidden =
        true;

      area.innerHTML =
        "";

      return;
    }

    area.hidden =
      false;

    const multiline =
      [
        "learn",
        "hunt",
        "infer",
        "use",
        "change"
      ].includes(
        activity
      );

    area.innerHTML = `
      <label
        for="sessionActivityResponseInput"
      >
        ${esc(config.label)}
      </label>

      ${
        multiline
          ? `
            <textarea
              id="sessionActivityResponseInput"
              placeholder="${esc(config.placeholder)}"
            ></textarea>
          `
          : `
            <input
              id="sessionActivityResponseInput"
              type="text"
              autocomplete="off"
              spellcheck="false"
              placeholder="${esc(config.placeholder)}"
            >
          `
      }

      <div class="session-check-row">
        <button
          class="session-primary-button"
          id="reviewActivityResponseButton"
          type="button"
        >
          ${esc(config.button)}
        </button>

        <div
          class="session-build-feedback"
          id="sessionActivityResponseFeedback"
          aria-live="polite"
        ></div>
      </div>
    `;

    document
      .getElementById(
        "reviewActivityResponseButton"
      )
      ?.addEventListener(
        "click",
        reviewGenericActivityResponse
      );
  }


  function renderBreakBoundarySelector() {
    const responseArea =
      document.getElementById(
        "sessionPromptResponse"
      );

    if (!responseArea) {
      return;
    }

    let boundaryWrap =
      document.getElementById(
        "sessionBoundaryWord"
      );

    if (!boundaryWrap) {
      boundaryWrap =
        document.createElement(
          "div"
        );

      boundaryWrap.id =
        "sessionBoundaryWord";

      boundaryWrap.className =
        "boundary-word";

      responseArea.insertBefore(
        boundaryWrap,
        responseArea.firstChild
      );
    }

    const task =
      state.tasks[
        state.taskIndex
      ];

    const data =
      directBoundaryData(
        task
      );

    boundaryWrap.innerHTML =
      "";

    if (!data) {
      const word =
        taskWord(task);

      if (word) {
        boundaryWrap.innerHTML = `
          <span>
            ${esc(word)}
          </span>
        `;
      }

      return;
    }

    const marked =
      new Set();

    const syncInput =
      () => {
        const pieces = [];
        let start = 0;

        const positions =
          [
            ...marked
          ]
            .sort(
              (a, b) =>
                a - b
            );

        for (
          const position
          of positions
        ) {
          pieces.push(
            data.word.slice(
              start,
              position
            )
          );

          start =
            position;
        }

        pieces.push(
          data.word.slice(
            start
          )
        );

        const input =
          document.getElementById(
            "sessionPromptResponseInput"
          );

        if (input) {
          input.value =
            pieces.join(
              " + "
            );
        }
      };

    for (
      let index = 0;
      index < data.word.length;
      index += 1
    ) {
      const letter =
        document.createElement(
          "span"
        );

      letter.className =
        "boundary-letter";

      letter.textContent =
        data.word[index];

      boundaryWrap.appendChild(
        letter
      );

      const position =
        index + 1;

      if (
        position <
        data.word.length
      ) {
        const button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.className =
          "boundary-toggle";

        button.setAttribute(
          "aria-label",
          `Mark a boundary after ${data.word.slice(0, position)}`
        );

        button.addEventListener(
          "click",
          () => {
            if (
              marked.has(
                position
              )
            ) {
              marked.delete(
                position
              );

              button.classList.remove(
                "is-marked"
              );
            } else {
              marked.add(
                position
              );

              button.classList.add(
                "is-marked"
              );
            }

            syncInput();
          }
        );

        boundaryWrap.appendChild(
          button
        );
      }
    }
  }


  function sessionOverviewLine(
    label,
    detail
  ) {
    return `
      <li>
        <strong>
          ${esc(label)}
        </strong>
        — ${esc(detail)}
      </li>
    `;
  }


  function renderTodaySessionOverview() {
    ensureTeacherSessionUxStyles();

    const retrieveCount =
      1;

    const practiceTasks =
      state.tasks.filter(
        task =>
          task.stage ===
          "Teach / Practice"
      );

    const applyTask =
      state.tasks.find(
        task =>
          task.stage ===
          "Apply"
      );

    const applyDetail =
      applyTask
        ? (
            currentActivity() === "morpheme"
              ? (
                  readyWord(applyTask)
                    ? "retrieve the target from its meaning, then apply it in 1 fresh system-selected word; do not preview the word"
                    : "no system-selected fresh Word Part example is available today; do not substitute an unplanned word"
                )
              : (
                  normalize(
                    state.plan
                      ?.apply
                      ?.item
                      ?.word
                  )
                    ? `1 fresh system-selected ${currentActivityLabel()} item; do not preview the word`
                    : `1 defined open-production ${currentActivityLabel()} Apply demand`
                )
          )
        : `No valid ${currentActivityLabel()} Apply demand is available today`;

    const transferCount =
      state.plan
        ?.transfer
        ?.items
        ?.length ||
      0;

    const transferDetail =
      transferCount
        ? (
            `${transferCount} unfamiliar transfer ${transferCount === 1 ? "item" : "items"}; do not preview the word before Step 4`
          )
        : "No transfer check is available for this target today; skip Step 4";

    const practiceDetail =
      `${practiceTasks.length} ${currentActivityLabel()} ${practiceTasks.length === 1 ? "practice item" : "practice items"}`;

    let overview =
      document.getElementById(
        "todaySessionOverview"
      );

    if (!overview) {
      overview =
        document.createElement(
          "section"
        );

      overview.id =
        "todaySessionOverview";

      overview.className =
        "today-session-overview";

      const retrieveHeading =
        [
          ...document.querySelectorAll(
            "h2"
          )
        ].find(
          heading =>
            heading
              .textContent
              .trim() ===
            "Retrieve"
        );

      const retrieveSection =
        retrieveHeading
          ?.closest(
            "section"
          );

      if (retrieveSection) {
        retrieveSection.insertAdjacentElement(
          "beforebegin",
          overview
        );
      }
    }

    if (!overview) {
      return;
    }

    overview.innerHTML = `
      <div class="session-kicker">
        TODAY'S SESSION
      </div>

      <h2>
        What you will do
      </h2>

      <p>
        <strong>Session source:</strong>
        ${state.sessionSource === "teacher-selected" ? "Teacher selected" : "Recommended"}.
        ${state.sessionSource === "teacher-selected" ? "This educator-selected session does not replace the student's adaptive recommendation merely because it was opened." : "First Volo selected this next step from the student's recent performance."}
      </p>

      <p>
        Let the student try each new morphology demand first. If decoding, word knowledge, retrieval, or sentence generation gets in the way, give only the access help needed. If the morphology itself is difficult, use the least support shown, retry the same demand, and fade the support after success.
      </p>

      <ol>
        ${sessionOverviewLine(
          "Retrieve",
          `${retrieveCount || "Quick"} retrieval ${retrieveCount === 1 ? "prompt" : "prompts"}`
        )}

        ${sessionOverviewLine(
          currentActivityLabel(),
          practiceDetail
        )}

        ${sessionOverviewLine(
          "Apply",
          applyDetail
        )}

        ${sessionOverviewLine(
          "Check Transfer",
          transferDetail
        )}
      </ol>
    `;
  }


  function reorderGuidanceAfterAttempt() {
    const guideHeading =
      [
        ...document.querySelectorAll(
          "h2"
        )
      ].find(
        heading =>
          heading
            .textContent
            .includes(
              "How to guide this session"
            )
      );

    const guide =
      guideHeading
        ?.closest(
          "section"
        );

    const material =
      document.getElementById(
        "digitalMaterialTitle"
      )
        ?.closest(
          "section"
        );

    if (
      !guide ||
      !material
    ) {
      return;
    }

    guide.classList.add(
      "session-guidance-after-attempt"
    );

    material.insertAdjacentElement(
      "afterend",
      guide
    );

    const supportHeading =
      [
        ...guide.querySelectorAll(
          "h3, h4"
        )
      ].find(
        heading =>
          heading
            .textContent
            .replace(
              /\s+/g,
              " "
            )
            .trim()
            .startsWith(
              "If the student"
            )
      );

    if (
      !supportHeading ||
      supportHeading.closest(
        ".session-support-details"
      )
    ) {
      return;
    }

    const details =
      document.createElement(
        "details"
      );

    details.className =
      "session-support-details";

    const summary =
      document.createElement(
        "summary"
      );

    summary.textContent =
      "Support if needed after the independent attempt";

    details.appendChild(
      summary
    );

    const nodes = [];
    let current =
      supportHeading;

    while (current) {
      nodes.push(
        current
      );

      current =
        current.nextElementSibling;
    }

    guide.appendChild(
      details
    );

    for (
      const node
      of nodes
    ) {
      details.appendChild(
        node
      );
    }
  }
  function renderActivitySurface() {
    ensureTeacherSessionUxStyles();

    const activity =
      currentActivity();

    const isBuild =
      activity === "build";

    const isBreak =
      activity === "break";

    const helpRow =
      document.querySelector(
        ".session-interaction-help-row"
      );

    const buildCheckRow =
      byId(
        "checkBuildButton"
      )?.closest(
        ".session-check-row"
      );

    const tileArea =
      byId(
        "interactiveTileBank"
      )?.closest(
        ".interactive-tile-area"
      );

    if (helpRow) {
      helpRow.hidden =
        !isBuild;
    }

    byId(
      "interactiveBuildMat"
    ).hidden =
      !isBuild;

    byId(
      "interactiveWordSum"
    ).hidden =
      !isBuild;

    if (buildCheckRow) {
      buildCheckRow.hidden =
        !isBuild;
    }

    if (tileArea) {
      tileArea.hidden =
        !isBuild;
    }

    byId(
      "toggleMeaningsButton"
    ).hidden =
      !isBuild;

    byId(
      "clearMatButton"
    ).hidden =
      !isBuild;

    const breakArea =
      byId(
        "sessionPromptResponse"
      );

    const breakUsesBoundaryResponse =
      isBreak &&
      (
        state.tasks?.[
          state.taskIndex
        ]?.recipe
          ?._readySelectorDemand ||
        "full-segmentation"
      ) ===
        "full-segmentation";

    breakArea.hidden =
      !breakUsesBoundaryResponse;

    if (
      breakUsesBoundaryResponse
    ) {
      byId(
        "sessionPromptResponseLabel"
      ).textContent =
        "Mark or write the meaningful parts. Use + or / between parts.";

      const input =
        byId(
          "sessionPromptResponseInput"
        );

      input.value =
        "";

      byId(
        "promptResponseFeedback"
      ).textContent =
        "";

      const button =
        byId(
          "checkPromptResponseButton"
        );

      button.hidden =
        false;

      if (
        button.dataset.bound !==
          "true"
      ) {
        button.addEventListener(
          "click",
          checkPromptResponse
        );

        button.dataset.bound =
          "true";
      }

      renderBreakBoundarySelector();
    }

    renderGenericActivityResponse();

    const isWordPart =
      currentActivity() ===
      "morpheme";

    const activeTask =
      state.tasks?.[
        state.taskIndex
      ] ||
      null;

    const breakUnavailable =
      currentActivity() ===
        "break" &&
      Boolean(
        activeTask?.recipe
          ?._readyBreakUnavailable
      );

    const legacyTaskPrompt =
      byId(
        "taskPrompt"
      )?.closest(
        ".session-current-task"
      );

    if (legacyTaskPrompt) {
      legacyTaskPrompt.hidden =
        isWordPart;
    }

    const legacyActivityResponse =
      byId(
        "sessionActivityResponse"
      );

    if (legacyActivityResponse) {
      /*
        Ready-to-use activity surfaces already contain the response fields.
        Keeping this generic response box created a second response area and
        the generic "Review ... / open educator key" workflow.
      */
      legacyActivityResponse.hidden = true;
    }
  }
  function configurePrintActivityMaterial() {
    const activity =
      currentActivity();

    const matPage =
      document.querySelector(
        ".print-mat-page"
      );

    const cardsSection =
      byId(
        "printCardGrid"
      )?.closest(
        "section"
      );

    const directions =
      byId(
        "printMatDirections"
      );

    if (matPage) {
      matPage.hidden =
        false;

      matPage.classList.toggle(
        "is-task-response-page",
        activity !== "build"
      );
    }

    if (
      activity === "build"
    ) {
      if (cardsSection) {
        cardsSection.hidden =
          false;
      }

      byId(
        "printMatTitle"
      ).textContent =
        state.material
          ?.family
          ? (
              `${state.material.family} Word Building Mat`
            )
          : "Word Building Mat";

      if (directions) {
        directions.textContent =
          "Place the cards in the matching slots. Read the word sum. Explain what the meaningful parts contribute.";
      }

      return;
    }

    if (cardsSection) {
      cardsSection.hidden =
        true;
    }

    const printDirections = {
      learn:
        "Explain the target meaning or contribution for each item.",
      find:
        "Locate the target in each intact word. Circle, underline, or mark the target.",
      hunt:
        "Identify which words contain the target. Circle the words and explain what the target contributes.",
      meaning:
        "Write the meaning carried by the target.",
      morpheme:
        "Respond to each Word Part prompt. Use the word, base/root, and meaning information shown for that item.",
      break:
        (
          (state.tasks || []).some(
            task =>
              (
                task?.recipe
                  ?._readySelectorDemand ||
                "full-segmentation"
              ) !==
                "full-segmentation"
          )
            ? (
                "Respond to each item according to its demand. For full segmentation, mark or write the meaningful parts. For form-change items, explain what changes when the word is formed."
              )
            : (
                "Start with each whole word. Mark the meaningful boundaries yourself. Do not pre-mark the parts."
              )
        ),
      infer:
        "Use known morphology first. Write a likely whole-word meaning and explain the clue.",
      use:
        "Complete the contextual language task and explain the morphological clue.",
      change:
        "Write the related form that fits and explain what changed morphologically."
    };

    byId(
      "printMatTitle"
    ).textContent =
      `${currentActivityLabel()} Response`;

    if (directions) {
      directions.textContent =
        printDirections[
          activity
        ] ||
        "Complete each activity response.";
    }

    /* FIRST_VOLO_CONFIGURE_PRINT_RICH_WORD_PART_V1 */
    byId(
      "printBuildMat"
    ).innerHTML =
      state.tasks
        .map(
          task => {
            const studentTask =
              readyV14StudentPrintableTask(
                task
              );

            const taskActivity =
              readyActivity(
                task
              );

            const wordPartSpec =
              (
                taskActivity ===
                  "morpheme" &&
                task?.stage !==
                  "Apply"
              )
                ? readyWordPartSpecFor(
                    task
                  )
                : null;

            const fallbackWord =
              taskWord(
                studentTask
              );

            const selectorDemand =
              taskActivity === "break"
                ? (
                    task?.recipe
                      ?._readySelectorDemand ||
                    "full-segmentation"
                  )
                : null;

            const demandLabel =
              selectorDemand ===
                "form-change"
                ? "Form Change"
                : selectorDemand ===
                    "target-recognition"
                  ? "Target Connection"
                  : selectorDemand ===
                      "full-segmentation"
                    ? "Segmentation"
                    : "";

            const label =
              wordPartSpec
                ? (
                    `${wordPartSpec.moveLabel}${
                      wordPartSpec.word &&
                      wordPartSpec.move !==
                        "pattern"
                        ? ` · ${wordPartSpec.word}`
                        : ""
                    }`
                  )
                : (
                    `${studentTask?.stage || task?.stage || ""}${
                      demandLabel
                        ? ` · ${demandLabel}`
                        : ""
                    }${
                      fallbackWord
                        ? ` · ${fallbackWord}`
                        : ""
                    }`
                  );

            const prompt =
              wordPartSpec
                ?.prompt ||
              readyV14StudentPrintPrompt(
                task
              ) ||
              studentTask
                ?.prompt ||
              "";

            const responseInstruction =
              selectorDemand ===
                "form-change"
                ? "Explain what changes. Write the accurate word sum if helpful."
                : selectorDemand ===
                    "target-recognition"
                  ? "Identify the visible target form and explain the connection."
                  : selectorDemand ===
                      "full-segmentation"
                    ? "Mark or write the meaningful parts using + or /."
                    : "Write the student's response.";

            return `
              <div class="print-response-item">
                <strong>
                  ${esc(label)}
                </strong>

                <p>
                  ${esc(prompt)}
                </p>

                <span class="print-response-instruction">
                  ${esc(responseInstruction)}
                </span>

                <div class="print-task-response-lines">
                  <div class="print-task-response-line"></div>
                  <div class="print-task-response-line"></div>
                  <div class="print-task-response-line"></div>
                </div>
              </div>
            `;
          }
        )
        .join("");
  }


  function retrieveSupportItems(
    target
  ) {
    const label =
      target?.label ||
      "the target";

    return [
      `Show the established visual meaning cue for ${label}.`,
      "If still needed, give two meaning choices.",
      "Once the student accesses the meaning, continue with the session.",
      "Begin the next retrieval opportunity with less support."
    ];
  }


  function renderRetrieveSupport() {
    const target =
      readyRetrieveSupportTarget();

    const label =
      target?.label ||
      "the target";

    const items =
      retrieveSupportItems(
        target
      );

    byId(
      "retrieveSupportTarget"
    ).textContent =
      label;

    byId(
      "printRetrieveSupportTarget"
    ).textContent =
      label;

    const html =
      items.map(
        item => `
          <li>
            ${esc(item)}
          </li>
        `
      ).join("");

    byId(
      "retrieveSupportList"
    ).innerHTML =
      html;

    byId(
      "printRetrieveSupportList"
    ).innerHTML =
      html;
  }


  function renderRetrieve() {
    const items =
      state.plan
        ?.retrieve
        ?.items ||
      [];

    const html =
      items.length
        ? items.map(
            item => `
              <li>
                ${esc(item.prompt)}
              </li>
            `
          ).join("")
        : `
            <li>
              Briefly retrieve the current target before
              beginning teaching or practice.
            </li>
          `;

    byId(
      "retrievePromptList"
    ).innerHTML =
      html;

    byId(
      "printRetrieveList"
    ).innerHTML =
      html;

    renderRetrieveSupport();
  }


  function renderFamilyChoice() {
    const section =
      byId(
        "sessionFamilyChoice"
      );

    const buttons =
      byId(
        "sessionFamilyButtons"
      );

    const needsChoice =
      !state.material &&
      state.familyCandidates
        .length > 1;

    section.hidden =
      !needsChoice;

    buttons.innerHTML =
      "";

    if (!needsChoice) {
      return;
    }

    for (
      const familyId
      of state.familyCandidates
    ) {
      const button =
        document.createElement(
          "button"
        );

      button.type =
        "button";

      button.className =
        "session-secondary-button";

      button.textContent =
        familyId;

      button.addEventListener(
        "click",
        () => {
          state.familyOverride =
            familyId;

          rebuildMaterial();
          render();
        }
      );

      buttons.append(
        button
      );
    }
  }
  function readyTransferNonTargetSupportMarkup(
    item,
    target = null
  ) {
    const supports =
      Array.isArray(
        item?.nonTargetSupports
      )
        ? item.nonTargetSupports
            .filter(
              support =>
                support?.part &&
                (
                  support?.meaning ||
                  support?.function
                )
            )
        : [];

    if (!supports.length) {
      return "";
    }

    const targetLabel =
      target?.label ||
      "the known target word part";

    return `
      <div class="ready-approved-non-target-support">
        <p>
          <strong>After the protected first whole-word attempt, if the non-target part is the barrier:</strong>
        </p>
        ${supports
          .map(
            support => `
              <p>
                <strong>Say:</strong>
                “${esc(support.part)} means ${esc(support.meaning || support.function)}.”
              </p>
            `
          )
          .join("")}
        <p>
          <strong>Ask:</strong>
          “What does ${esc(targetLabel)} tell you? Put those ideas together. What could ${esc(item?.word || "the word")} mean in this sentence?”
        </p>
        <p class="ready-small-note">
          Do not supply the target meaning before the student does the target reasoning. Retry the whole-word inference after this support.
        </p>
      </div>
    `;
  }


  function renderTransfer() {
    const transfer =
      state.plan
        ?.transfer ||
      null;

    const target =
      transfer
        ?.target ||
      state.plan
        ?.teachPractice
        ?.target ||
      state.plan
        ?.nextWork
        ?.target ||
      null;

    const items =
      Array.isArray(
        transfer?.items
      )
        ? transfer.items
        : [];

    const screen =
      byId(
        "sessionTransferContent"
      );

    if (!screen) {
      return;
    }

    if (!items.length) {
      screen.innerHTML = `
        <div class="session-transfer-unavailable">
          <strong>
            Transfer check not available for this target today.
          </strong>

          <p>
            Skip Step 4 and end the session after Apply.
          </p>
        </div>
      `;

      return;
    }

    screen.innerHTML = `
      <p>
        Present the unfamiliar word without identifying the word part first. Record the student's first attempt before adding support.
      </p>

      <details>
        <summary>
          Open the transfer item when ready
        </summary>

        ${items
          .map(
            (item, index) => `
              <div class="session-transfer-item">
                <strong>
                  Transfer item ${index + 1}
                </strong>

                <p>
                  ${esc(item.word || "")}
                </p>

                ${
                  item.sentence
                    ? `
                      <p>
                        ${esc(item.sentence)}
                      </p>
                    `
                    : ""
                }

                <p>
                  <strong>First attempt:</strong>
                  What do you think “${esc(item.word || "")}” means here?
                </p>

                <details class="ready-support-panel ready-transfer-after-attempt">
                  <summary>
                    Support after the first attempt
                  </summary>

                  <div class="ready-support-panel-body">
                    <p>
                      First ask: <strong>What part do you recognize?</strong>
                    </p>

                    ${readyTransferNonTargetSupportMarkup(item, target)}

                    <p>
                      Then ask the student to put the known target meaning together with the supplied non-target information and retry the whole-word meaning.
                    </p>
                  </div>
                </details>

                <details class="ready-transfer-key">
                  <summary>

                    Review after the attempt
                  </summary>

                  <div class="ready-support-panel-body">
                    <p>
                      <strong>Known target:</strong>
                      ${esc(target?.label || "word part")}${target?.meaning ? ` = ${esc(target.meaning)}` : ""}
                    </p>

                    ${
                      item.literalMeaning
                        ? `
                          <p>
                            <strong>Literal meaning from the parts:</strong>
                            ${esc(item.literalMeaning)}
                          </p>
                        `
                        : ""
                    }

                    <p>
                      <strong>Student-friendly meaning:</strong>
                      ${esc(item.studentFriendlyMeaning || item.expectedMeaning || "Use a reasonable context-supported meaning.")}
                    </p>
                  </div>
                </details>
              </div>
            `
          )
          .join("")}
      </details>

      <p>
        Record separately whether the student recognized the known word part and whether the student inferred the unfamiliar whole-word meaning.
      </p>
    `;
  }


  function renderPrint() {
    const primary =
      state.plan
        ?.targetResolution
        ?.primary;

    byId(
      "printLearnerName"
    ).textContent =
      state.student.name;

    byId(
      "printSessionMinutes"
    ).textContent =
      `${state.minutes}-minute session`;

    byId(
      "printTargetLabel"
    ).textContent =
      primary?.label
        ? (
            `${primary.role || "word part"} ` +
            `${primary.label}`
          )
        : "Primary target unresolved";

    byId(
      "printTargetMeaning"
    ).textContent =
      primary?.meaning
        ? (
            `Meaning: ${primary.meaning}`
          )
        : "";

    const practiceTasks =
      state.tasks.filter(
        task =>
          task.stage ===
          "Teach / Practice"
      );

    const applyTask =
      state.tasks.find(
        task =>
          task.stage ===
          "Apply"
      );

    byId(
      "printPracticeList"
    ).innerHTML =
      practiceTasks.length
        ? `
          <ol>
            ${practiceTasks.map(
              task => {
                const wordPartSpec =
                  readyActivity(task) ===
                    "morpheme"
                    ? readyWordPartSpecFor(
                        task
                      )
                    : null;

                const label =
                  wordPartSpec
                    ? (
                        `${wordPartSpec.moveLabel}${
                          wordPartSpec.word &&
                          wordPartSpec.move !==
                            "pattern"
                            ? ` · ${wordPartSpec.word}`
                            : ""
                        }`
                      )
                    : "";

                const prompt =
                  wordPartSpec
                    ?.prompt ||
                  task.prompt ||
                  "";

                return `
                  <li>
                    ${
                      label
                        ? `
                          <strong>
                            ${esc(label)}
                          </strong>
                          <br>
                        `
                        : ""
                    }
                    ${esc(prompt)}
                    ${
                      !wordPartSpec &&
                      readyItemReviewPlainText(task)
                        ? `
                          <div class="print-small-note">
                            <strong>What to listen for:</strong>
                            ${esc(readyItemReviewPlainText(task))}
                          </div>
                        `
                        : ""
                    }
                  </li>
                `;
              }
            ).join("")}
          </ol>
        `
        : `
          <p>
            Use the selected material for a brief
            supported practice opportunity.
          </p>
        `;

    byId(
      "printApplyPrompt"
    ).innerHTML =
      applyTask
        ? `
          <p>
            ${esc(applyTask.prompt)}
          </p>

          ${
            applyTask.followUp
              ? `
                <p>
                  <strong>
                    Then:
                  </strong>
                  ${esc(applyTask.followUp)}
                </p>
              `
              : ""
          }

          ${
            readyItemReviewPlainText(applyTask)
              ? `
                <p class="print-small-note">
                  <strong>
                    What to listen for:
                  </strong>
                  ${esc(readyItemReviewPlainText(applyTask))}
                </p>
              `
              : ""
          }
        `
        : `
          <p>
            No protection-aware Apply item is
            configured for this target yet.
          </p>
        `;

    const supportSteps =
      state.plan
        ?.instructionalDecision
        ?.scaffoldSteps ||
      [];

    byId(
      "printSupportList"
    ).innerHTML =
      supportSteps.length
        ? supportSteps.map(
            step => `
              <li>
                ${esc(step)}
              </li>
            `
          ).join("")
        : `
          <li>
            Follow the activity-specific access timing. Give incidental whole-word, context, or non-target information when allowed; protect the target reasoning and add target support only when needed.
          </li>
        `;

    byId(
      "printWordPartKey"
    ).innerHTML =
      state.digitalTiles
        .map(
          tile => `
            <div>
              <strong>
                ${esc(tile.label)}
              </strong>

              <span>
                ${esc(tile.role)}
                ${
                  tile.meaning
                    ? ` · ${esc(tile.meaning)}`
                    : ""
                }
              </span>
            </div>
          `
        )
        .join("");

    byId(
      "printMatTitle"
    ).textContent =
      (
        state.material
          ?.family
          ? (
              `${state.material.family} ` +
              "Word Building Mat"
            )
          : (
              state.material
                ?.displayMode === "build"
                ? "Word Building Mat"
                : (
                    state.plan
                      ?.teachPractice
                      ?.activityLabel ||
                    "Teacher-Led Practice"
                  )
            )
      );

    const printPromptMode =
      state.material
        ?.displayMode !== "build";

    const printDirections =
      document.querySelector(
        ".print-mat-directions"
      );

    if (printDirections) {
      printDirections.textContent =
        printPromptMode

          ? readyPartAInstructionNote(state.tasks?.[0] || null)
          : "Place the cards in the matching slots. Read the word sum. Explain what the meaningful parts contribute.";
    }

    const printResponseLines =
      document.querySelector(
        ".print-response-lines"
      );

    if (printResponseLines) {
      printResponseLines.hidden =
        printPromptMode;
    }

    /* FIRST_VOLO_RICH_WORD_PART_RESPONSE_PRINT_V1 */
    byId(
      "printBuildMat"
    ).innerHTML =
      printPromptMode
        ? state.tasks
            .map(
              task => {
                const studentTask =
                  readyV14StudentPrintableTask(
                    task
                  );

                const taskActivity =
                  readyActivity(
                    task
                  );

                const wordPartSpec =
                  (
                    taskActivity ===
                      "morpheme" &&
                    task?.stage !==
                      "Apply"
                  )
                    ? readyWordPartSpecFor(
                        task
                      )
                    : null;

                const label =
                  wordPartSpec
                    ? (
                        `${wordPartSpec.moveLabel}${
                          wordPartSpec.word &&
                          wordPartSpec.move !==
                            "pattern"
                            ? ` · ${wordPartSpec.word}`
                            : ""
                        }`
                      )
                    : (
                        studentTask
                          ?.stage ||
                        task?.stage ||
                        ""
                      );

                const prompt =
                  wordPartSpec
                    ?.prompt ||
                  readyV14StudentPrintPrompt(
                    task
                  ) ||
                  studentTask
                    ?.prompt ||
                  "";

                const safeAnswer =
                  taskActivity ===
                    "morpheme"
                    ? ""
                    : (
                        studentTask
                          ?.answer ||
                        task?.answer ||
                        ""
                      );

                return `
                  <div class="print-build-slot">
                    <strong>
                      ${esc(label)}
                    </strong>

                    <span>
                      ${esc(prompt)}
                    </span>

                    ${
                      safeAnswer
                        ? `
                          <span class="print-small-note">

                            <strong>Answer / review:</strong>
                            ${esc(safeAnswer)}
                          </span>
                        `
                        : ""
                    }
                  </div>
                `;
              }
            )
            .join("")
        : (
            state.material
              ?.slots || []
          )
            .map(
              slot => `
                <div class="print-build-slot">

                  <strong>
                    ${esc(slot.label)}
                  </strong>

                  <span>
                    Place card here
                  </span>

                </div>
              `
            )
            .join("");

    byId(
      "printCardGrid"
    ).innerHTML =
      state.digitalTiles
        .map(
          tile => `
            <div class="print-material-card">

              ${
                tile.image
                  ? `
                    <img
                      src="${esc(tile.image)}"
                      alt=""
                    >
                  `
                  : ""
              }

              <strong>
                ${esc(tile.label)}
              </strong>

            </div>
          `
        )
        .join("");

    byId(
      "printPromptList"
    ).innerHTML =
      state.tasks
        .map(
          (task, index) => `
            <div class="print-prompt-card">

              <span class="print-prompt-number">
                ${index + 1}
              </span>

              <div>
                <strong>
                  ${esc(task.stage)}
                </strong>

                <p>
                  ${esc(task.prompt)}
                </p>

                ${
                  task.followUp
                    ? `
                      <p>
                        <strong>Then:</strong>
                        ${esc(task.followUp)}
                      </p>
                    `
                    : ""
                }
              </div>

            </div>
          `
        )
        .join("");

    configurePrintActivityMaterial();
  }


  function renderReadyMaterial() {
    byId(
      "sessionReadyContent"
    ).hidden =
      false;

    byId(
      "sessionMaterialUnavailable"
    ).hidden =
      true;

    const printButton =
      byId(
        "sessionPrintButton"
      );

    if (printButton) {
      printButton.disabled =
        false;
      printButton.setAttribute(
        "aria-disabled",
        "false"
      );
    }

    byId(
      "digitalMaterialTitle"
    ).textContent =
      (
        currentActivity() ===
          "build" &&
        state.material.family
      )
        ? (
            `${state.material.family} ` +
            currentActivityLabel()
          )
        : currentActivityLabel();

    state.digitalTiles =
      safeDigitalTiles();

    state.tasks =
      makeTasks(
        state.material,
        state.plan
          ?.apply ||
        null
      );

    readyPrepareEffectiveTasks();

    state.taskIndex =
      Math.min(
        state.taskIndex,
        Math.max(
          state.tasks.length - 1,
          0
        )
      );

    renderRetrieve();
    renderInteractiveMat();
    renderTileBank();
    renderWordSum();
    renderTask();
    renderTransfer();
    renderPrint();
    renderTodaySessionOverview();
    reorderGuidanceAfterAttempt();
    renderDynamicSessionGuidance();

    readyResetFutureStepVisibility();

    const excluded =
      state.material
        ?.protection
        ?.excludedRecipes
        ?.length ||
      0;

    byId(
      "sessionProtectionText"
    ).textContent =
      excluded
        ? (
            `${excluded} protected family ` +
            (
              excluded === 1
                ? "word was"
                : "words were"
            ) +
            " excluded before these materials were rendered."
          )
        : (
            "Only the protection-aware session recipe bank is being rendered."
          );
  }


  function renderNotReady() {
    byId(
      "sessionReadyContent"
    ).hidden =
      true;

    const printButton =
      byId(
        "sessionPrintButton"
      );

    if (printButton) {
      printButton.disabled =
        true;
      printButton.setAttribute(
        "aria-disabled",
        "true"
      );
    }

    const unavailable =
      byId(
        "sessionMaterialUnavailable"
      );

    const eyebrow =
      byId(
        "sessionMaterialUnavailableEyebrow"
      );

    const title =
      byId(
        "sessionMaterialUnavailableTitle"
      );

    const text =
      byId(
        "sessionMaterialUnavailableText"
      );

    const primary =
      state.plan
        ?.targetResolution
        ?.primary ||
      null;

    const activityLabel =
      currentActivityLabel();

    const targetLabel =
      primary?.label ||
      "this target";

    const material =
      state.material ||
      state.plan
        ?.sessionMaterial ||
      null;

    const noAdaptiveTarget =
      state.sessionSource ===
        "recommended" &&
      !primary?.label;

    if (noAdaptiveTarget) {
      if (eyebrow) {
        eyebrow.textContent =
          "No adaptive recommendation yet";
      }

      if (title) {
        title.textContent =
          "First Volo does not yet have saved instructional work to choose the student's next target.";
      }

      if (text) {
        text.textContent =
          "Use Teacher-Selected Session below to choose a word part and activity, or save instructional performance first. Opening a teacher-selected session will not create or replace the adaptive recommendation.";
      }

      unavailable.hidden =
        false;
      return;
    }

    const recipeCount =
      Array.isArray(
        material?.recipes
      )
        ? material.recipes.length
        : 0;

    const missingParts =
      Array.isArray(
        material?.protection
          ?.missingParts
      )
        ? material.protection
            .missingParts
        : [];

    if (eyebrow) {
      eyebrow.textContent =
        `${activityLabel} · system-generated material unavailable`;
    }

    if (title) {
      title.textContent =
        recipeCount === 0
          ? `First Volo could not generate a valid ${activityLabel} item set for ${targetLabel}.`
          : `First Volo could not generate a complete ${activityLabel} session for ${targetLabel}.`;
    }

    if (text) {
      text.textContent =
        missingParts.length
          ? (
              `The generated word analysis is missing an approved Build piece for: ${missingParts.join(", ")}. First Volo will not invent or mis-segment a word part to complete the build.`
            )
          : (
              "First Volo could not find enough suitable instructional words after checking linguistic accuracy, accessibility, freshness, and protected-word rules. It will not invent or mis-segment a word part, use a protected word, or change the instructional demand just to fill the session."
            );
    }

    unavailable.hidden =
      false;
  }



  /* FIRST_VOLO_ACTIVITY_SESSION_LENGTH_AVAILABILITY_V2
     Session length is part of the instructional promise, not a cosmetic
     preference. A 10/15/30-minute option is offered only when the active
     target + activity can construct the required guided Part A sequence
     and an actual Apply demand for that length.

     Break It Apart keeps its stricter selector-owned complete-plan gate.
     Other activities are checked against the material actually produced by
     the planner for that duration. This is shared by Recommended Session
     and Teacher-Selected Session.
  */
  function readyCandidatePlanForDuration(
    minutes
  ) {
    const planner =
      window
        .FirstVoloInstructionalSessionPlanner;

    if (!planner?.buildPlan) {
      return null;
    }

    return planner.buildPlan({
      student:
        state.student,
      sessionMinutes:
        Number(minutes),
      sessionSelection:
        activeSessionSelection()
    });
  }


  function readyPracticeCountFromPlan(
    plan
  ) {
    const recipes =
      Array.isArray(
        plan?.sessionMaterial
          ?.recipes
      )
        ? plan.sessionMaterial
            .recipes
        : [];

    if (!recipes.length) {
      return 0;
    }

    const applyWord =
      normalize(
        plan?.apply
          ?.item
          ?.word
      );

    let practiceRecipes =
      recipes.filter(
        recipe =>
          recipes.length === 1 ||
          normalize(
            recipe?.word
          ) !== applyWord
      );

    if (!practiceRecipes.length) {
      practiceRecipes =
        recipes.slice(0, 1);
    }

    return practiceRecipes.length;
  }


  function readyNonBreakDurationAvailability(
    minutes
  ) {
    const plan =
      readyCandidatePlanForDuration(
        minutes
      );

    if (!plan) {
      return {
        available: false,
        reason:
          "The session planner is unavailable."
      };
    }

    if (
      plan.activityApplicability
        ?.applicable === false
    ) {
      return {
        available: false,
        reason:
          plan.activityApplicability
            .reason ||
          "This activity is not instructionally appropriate for the selected target.",
        plan
      };
    }

    const material =
      plan.sessionMaterial;

    if (!material?.ready) {
      return {
        available: false,
        reason:
          "First Volo could not find enough suitable instructional words to build an accurate item set for this target, activity, and session length.",
        plan
      };
    }

    const policy =
      readyV13DurationPolicy[
        Number(minutes)
      ];

    const requiredPartA =
      Number(
        policy?.partAItems ||
        1
      );

    const availablePartA =
      readyPracticeCountFromPlan(
        plan
      );

    if (
      availablePartA <
      requiredPartA
    ) {
      return {
        available: false,
        reason:
          `This ${ACTIVITY_LABELS[plan?.teachPractice?.activity] || "activity"} session can build ${availablePartA} of ${requiredPartA} required guided Part A ${requiredPartA === 1 ? "item" : "items"} for ${minutes} minutes.`,
        plan,
        requiredPartA,
        availablePartA
      };
    }

    const applyItem =
      plan?.apply?.item ||
      null;

    if (!applyItem) {
      return {
        available: false,
        reason:
          `A complete ${minutes}-minute session needs an Apply demand, and no valid Apply item is currently available.`,
        plan
      };
    }

    if (
      plan?.teachPractice
        ?.activity ===
          "morpheme" &&
      !normalize(
        applyItem.word
      )
    ) {
      return {
        available: false,
        reason:
          "Word Part Apply requires a fresh system-selected word after target retrieval; that fresh word is not available for this length.",
        plan
      };
    }

    return {
      available: true,
      reason: "",
      plan,
      requiredPartA,
      availablePartA
    };
  }


  function readyDurationAvailability(
    minutes
  ) {
    const value =
      Number(minutes);

    if (
      ![10, 15, 30]
        .includes(value)
    ) {
      return {
        available:
          false,
        reason:
          "Unsupported session length."
      };
    }

    state._durationAvailabilityCache =
      state._durationAvailabilityCache ||
      {};

    const cacheKey =
      [
        state.sessionSource,
        state.teacherSelection
          ?.targetId ||
          state.plan
            ?.targetResolution
            ?.primary
            ?.id ||
          "",
        state.teacherSelection
          ?.activity ||
          currentActivity(),
        value
      ].join("|");

    if (
      state._durationAvailabilityCache[
        cacheKey
      ]
    ) {
      return state
        ._durationAvailabilityCache[
          cacheKey
        ];
    }

    let result;

    if (
      currentActivity() ===
      "break"
    ) {
      const plan =
        readyBreakPlanForDuration(
          value
        );

      result = {
        available:
          Boolean(
            plan?.complete
          ),
        reason:
          plan?.complete
            ? ""
            : (
                plan?.reason ||
                "A complete Break It Apart Part A + fresh Apply sequence is not available for this duration."
              ),
        plan
      };
    } else {
      result =
        readyNonBreakDurationAvailability(
          value
        );
    }

    state._durationAvailabilityCache[
      cacheKey
    ] = result;

    return result;
  }


  function readyLongestAvailableDuration(
    requestedMinutes
  ) {
    const requested =
      Number(
        requestedMinutes
      );

    return (
      [30, 15, 10]
        .filter(
          minutes =>
            minutes <=
            requested
        )
        .find(
          minutes =>
            readyDurationAvailability(
              minutes
            ).available
        ) ||
      [10, 15, 30]
        .find(
          minutes =>
            readyDurationAvailability(
              minutes
            ).available
        ) ||
      null
    );
  }


  function readyNormalizeUnavailableDuration() {
    const current =
      Number(
        state.minutes
      );

    if (
      readyDurationAvailability(
        current
      ).available
    ) {
      return false;
    }

    const availableNext =
      readyLongestAvailableDuration(
        current
      );

    /*
      If no duration is buildable, retain the internal 10-minute shell
      so the page can explain why the selected activity is unavailable.
      All duration buttons remain disabled.
    */
    const next =
      availableNext ||
      10;

    if (
      next ===
      current
    ) {
      return false;
    }

    state.minutes =
      next;

    const url =
      new URL(
        window.location.href
      );

    url.searchParams.set(
      "minutes",
      String(next)
    );

    window.history
      .replaceState(
        {},
        "",
        url
      );

    return true;
  }


  function readyRenderDurationAvailabilityNote() {
    const existing =
      document.getElementById(
        "sessionDurationAvailabilityNote"
      );

    const buttons =
      [
        ...document.querySelectorAll(
          "[data-session-minutes]"
        )
      ];

    const host =
      buttons[0]
        ?.parentElement;

    if (!host) {
      if (existing) {
        existing.hidden =
          true;
      }

      return;
    }

    const records =
      [10, 15, 30]
        .map(
          minutes => ({
            minutes,
            ...readyDurationAvailability(
              minutes
            )
          })
        );

    const unavailable =
      records.filter(
        record =>
          !record.available
      );

    const noAdaptiveTarget =
      state.sessionSource ===
        "recommended" &&
      !state.plan
        ?.targetResolution
        ?.primary
        ?.label;

    if (noAdaptiveTarget) {
      const note =
        existing ||
        document.createElement(
          "div"
        );

      if (!existing) {
        note.id =
          "sessionDurationAvailabilityNote";
        note.className =
          "session-duration-availability-note";
        note.setAttribute(
          "role",
          "status"
        );
        host
          .insertAdjacentElement(
            "afterend",
            note
          );
      }

      note.hidden =
        false;
      note.innerHTML = `
        <strong>No adaptive session length is available yet.</strong>
        First Volo needs a saved instructional target before it can build a Recommended Session. Use Teacher-Selected Session below if you want to choose the target yourself.
      `;
      return;
    }

    if (!unavailable.length) {
      if (existing) {
        existing.hidden =
          true;
      }

      return;
    }

    const note =
      existing ||
      document.createElement(
        "div"
      );

    if (!existing) {
      note.id =
        "sessionDurationAvailabilityNote";

      note.className =
        "session-duration-availability-note";

      note.setAttribute(
        "role",
        "status"
      );

      host
        .insertAdjacentElement(
          "afterend",
          note
        );
    }

    note.hidden =
      false;

    const available =
      records.filter(
        record =>
          record.available
      );

    if (!available.length) {
      note.innerHTML = `
        <strong>
          No complete ${esc(currentActivityLabel())} session length can be generated for this target yet.
        </strong>
        First Volo will not offer a 10-, 15-, or 30-minute option unless it can find enough suitable instructional words to build the required Part A + Apply sequence accurately.
      `;

      return;
    }

    note.innerHTML = `
      <strong>
        Available:
        ${available
          .map(
            record =>
              `${record.minutes} min`
          )
          .join(" · ")}
      </strong>
      Other lengths are unavailable because the system-generated ${esc(currentActivityLabel())} Part A + Apply sequence does not yet have enough valid material for that duration.
    `;
  }


  function renderDurationButtons() {
    document
      .querySelectorAll(
        "[data-session-minutes]"
      )
      .forEach(
        button => {
          const minutes =
            Number(
              button
                .dataset
                .sessionMinutes
            );

          const availability =
            readyDurationAvailability(
              minutes
            );

          const active =
            availability
              .available &&
            minutes ===
              state.minutes;

          button
            .classList
            .toggle(
              "is-active",
              active
            );

          button
            .classList
            .toggle(
              "is-unavailable",
              !availability
                .available
            );

          button.disabled =
            !availability
              .available;

          button.setAttribute(
            "aria-pressed",
            String(active)
          );

          button.setAttribute(
            "aria-disabled",
            String(
              !availability
                .available
            )
          );

          if (
            availability
              .available
          ) {
            button
              .removeAttribute(
                "title"
              );
          } else {
            button.setAttribute(
              "title",
              availability
                .reason
            );
          }
        }
      );

    readyRenderDurationAvailabilityNote();
  }


  function render() {
    const primary =
      state.plan
        ?.targetResolution
        ?.primary;

    byId(
      "sessionLearnerName"
    ).textContent =
      state.student.name;

    renderSessionSource();

    byId(
      "sessionTargetLine"
    ).textContent =
      primary?.label
        ? [
            primary.role ||
              "word part",
            primary.label
          ]
            .filter(Boolean)
            .join(" ")
        : (
            state.sessionSource ===
              "recommended"
              ? "No adaptive target yet"
              : "Target"
          );

    const last =
      state.plan
        ?.lastWork;

    byId(
      "sessionLastWork"
    ).textContent =
      last
        ? (
            `Last work: ${last.activityLabel || last.activity || "activity"}` +
            (
              last.word
                ? ` · ${last.word}`
                : ""
            )
          )
        : "No previous saved work.";

    byId(
      "retrieveTime"
    ).textContent =
      `${state.plan.duration.retrieveMinutes} min`;

    byId(
      "teachTime"
    ).textContent =
      `${state.plan.duration.teachPracticeMinutes} min`;

    byId(
      "applyTime"
    ).textContent =
      `${state.plan.duration.applyMinutes} min`;

    byId(
      "transferTime"
    ).textContent =
      `${state.plan.duration.transferMinutes} min`;

    renderDurationButtons();

    const warning =
      byId(
        "sessionTargetWarning"
      );

    if (
      state.plan
        ?.targetResolution
        ?.needsPrimarySelection
    ) {
      warning.hidden =
        false;

      warning.innerHTML = `
        <strong>
          Primary instructional target needs selection.
        </strong>

        First Volo found meaningful structure in the
        student's saved work, but no primary target was
        recorded. The system will not choose one word
        part arbitrarily.
      `;
    } else if (
      state.sessionSource ===
        "recommended" &&
      !primary?.label
    ) {
      warning.hidden =
        false;

      warning.innerHTML = `
        <strong>
          No adaptive recommendation yet.
        </strong>

        There is no saved instructional target for this student yet.
        Choose a Teacher-Selected Session below, or save instructional
        performance first. First Volo will not invent a recommended target.
      `;
    } else {
      warning.hidden =
        true;

      warning.innerHTML =
        "";
    }

    populateTeacherSessionControls();
    renderFamilyChoice();

    if (
      state.material
        ?.ready
    ) {
      renderReadyMaterial();
    } else {
      renderNotReady();
    }
  }


  function rebuildPlan() {
    const planner =
      window
        .FirstVoloInstructionalSessionPlanner;

    if (!planner) {
      throw new Error(
        "Session planner is not available."
      );
    }

    state._durationAvailabilityCache =
      {};

    state.plan =
      planner.buildPlan({
        student:
          state.student,

        sessionMinutes:
          state.minutes,

        sessionSelection:
          activeSessionSelection()
      });

    state.familyOverride =
      null;

    state.taskIndex =
      0;

    state.digitalTiles =
      [];

    state.selectedTileId =
      null;

    state.placed =
      {};

    state.showMeanings =
      false;

    rebuildMaterial();

    if (
      readyNormalizeUnavailableDuration()
    ) {
      rebuildPlan();

      return;
    }

    render();
  }


  function setMinutes(
    minutes
  ) {
    if (
      ![10, 15, 30]
        .includes(minutes)
    ) {
      return;
    }

    if (
      !readyDurationAvailability(
        minutes
      ).available
    ) {
      renderDurationButtons();

      return;
    }

    state.minutes =
      minutes;

    const url =
      new URL(
        window.location.href
      );

    url.searchParams.set(
      "minutes",
      String(minutes)
    );

    window.history
      .replaceState(
        {},
        "",
        url
      );

    rebuildPlan();
  }


  function setupEvents() {
    document
      .querySelectorAll(
        "[data-session-minutes]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              setMinutes(
                Number(
                  button.dataset
                    .sessionMinutes
                )
              );
            }
          );
        }
      );

    byId(
      "teacherTargetSelect"
    )?.addEventListener(
      "change",
      () => {
        updateTeacherActivityOptions();
      }
    );

    byId(
      "teacherActivitySelect"
    )?.addEventListener(
      "change",
      () => {
        renderTeacherUnavailableActivities();
      }
    );

    byId(
      "buildTeacherSelectedSessionButton"
    )?.addEventListener(
      "click",
      () => {
        const targetId =
          byId(
            "teacherTargetSelect"
          )?.value ||
          "";

        const activity =
          byId(
            "teacherActivitySelect"
          )?.value ||
          "";

        const applicability =
          teacherActivityApplicability(
            targetId,
            activity
          );

        if (
          applicability
            ?.applicable ===
          false
        ) {
          const host =
            byId(
              "teacherUnavailableActivities"
            );

          if (host) {
            host.innerHTML = `
              <strong>${esc(ACTIVITY_LABELS[activity] || "This activity")} is not appropriate for this target.</strong>
              ${esc(applicability.reason || "A clean, instructionally useful task is not available.")}
            `;
          }

          return;
        }

        state.sessionSource =
          "teacher-selected";

        state.teacherSelection = {
          targetId,
          activity
        };

        updateSessionSourceUrl();
        rebuildPlan();
      }
    );

    byId(
      "useRecommendedSessionButton"
    )?.addEventListener(
      "click",
      () => {
        state.sessionSource =
          "recommended";

        state.teacherSelection =
          null;

        updateSessionSourceUrl();
        rebuildPlan();
      }
    );

    byId(
      "toggleMeaningsButton"
    ).addEventListener(
      "click",
      () => {
        state.showMeanings =
          !state.showMeanings;

        const button =
          byId(
            "toggleMeaningsButton"
          );

        button.textContent =
          state.showMeanings
            ? "Hide meanings"
            : "Show meanings";

        button.setAttribute(
          "aria-pressed",
          String(
            state.showMeanings
          )
        );

        renderInteractiveMat();
        renderTileBank();
      }
    );

    byId(
      "clearMatButton"
    ).addEventListener(
      "click",
      clearMat
    );

    byId(
      "checkBuildButton"
    ).addEventListener(
      "click",
      checkBuild
    );

    byId(
      "previousTaskButton"
    ).addEventListener(
      "click",
      () => {
        if (
          state.taskIndex > 0
        ) {
          state.taskIndex -=
            1;

          renderTask();
        }
      }
    );

    byId(
      "nextTaskButton"
    ).addEventListener(
      "click",
      () => {
        if (
          state.taskIndex <
          state.tasks.length - 1
        ) {
          state.taskIndex +=
            1;

          renderTask();
          return;
        }

        readyRevealCheckTransfer();
      }
    );

    byId(
      "readRetrieveButton"
    ).addEventListener(
      "click",
      () => {
        const prompts =
          state.plan
            ?.retrieve
            ?.items
            ?.map(
              item =>
                item.prompt
            )
            .filter(Boolean) ||
          [];

        speakText(
          prompts.join(
            ". Next. "
          )
        );
      }
    );


    byId(
      "readTaskPromptButton"
    ).addEventListener(
      "click",
      () => {
        const task =
          state.tasks[
            state.taskIndex
          ];

        speakText(
          task?.prompt ||
          ""
        );
      }
    );


    byId(
      "readDirectionsButton"
    ).addEventListener(
      "click",
      () => {
        speakText(
          "Drag a tile to the mat, or click a tile to place it in its matching slot. Click a placed tile to remove it. Then check your build."
        );
      }
    );


    byId(
      "sessionPrintButton"
    ).addEventListener(
      "click",
      () => {
        if (
          !state.material
            ?.ready
        ) {
          return;
        }

        window.print();
      }
    );
  }


  function setup() {
    state.minutes =
      queryMinutes();

    const initialSelection =
      querySessionSelection();

    if (initialSelection) {
      state.sessionSource =
        "teacher-selected";
      state.teacherSelection =
        {
          targetId:
            initialSelection.targetId,
          activity:
            initialSelection.activity
        };
    }

    state.student =
      resolveStudent();

    if (
      state.demoFamily
    ) {
      byId(
        "sessionDemoTools"
      ).hidden =
        false;
    }

    if (!state.student) {
      byId(
        "sessionEmptyState"
      ).hidden =
        false;

      byId(
        "sessionMaterialsApp"
      ).hidden =
        true;

      return;
    }

    byId(
      "sessionEmptyState"
    ).hidden =
      true;

    byId(
      "sessionMaterialsApp"
    ).hidden =
      false;

    setupEvents();
    rebuildPlan();
  }


  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      setup
    );
  } else {
    setup();
  }

})();
