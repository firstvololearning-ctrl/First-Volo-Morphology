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
        Educator key
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
      key.hidden =
        buildMode;

      const content =
        key.querySelector(
          "[data-educator-key-content]"
        );

      if (content) {
        content.textContent =
          task?.answer ||
          "Open response. Use the educator key for this item to review the student response.";
      }
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


  function renderTask() {
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

    byId(
      "previousTaskButton"
    ).disabled =
      state.taskIndex <= 0;

    byId(
      "nextTaskButton"
    ).disabled =
      state.taskIndex >=
      state.tasks.length - 1;

    clearMat();
    renderActivitySurface();
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
        "Response recorded for educator review. Use the educator key; do not force boundaries that are not approved.";

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
      "Response ready for educator review. Open the educator key above to compare.";
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
      state.plan
        ?.retrieve
        ?.items
        ?.length ||
      state.plan
        ?.retrieve
        ?.prompts
        ?.length ||
      0;

    const practiceTasks =
      state.tasks.filter(
        task =>
          task.stage ===
          "Teach / Practice"
      );

    const practiceWords =
      practiceTasks
        .map(
          task =>
            taskWord(task)
        )
        .filter(Boolean);

    const applyTask =
      state.tasks.find(
        task =>
          task.stage ===
          "Apply"
      );

    const applyDetail =
      taskWord(applyTask)
        ? (
            `1 fresh ${currentActivityLabel()} item: ${taskWord(applyTask)}`
          )
        : (
            `1 fresh ${currentActivityLabel()} response`
          );

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
      practiceWords.length
        ? (
            `${practiceWords.length} ${currentActivityLabel()} ${practiceWords.length === 1 ? "item" : "items"}: ${practiceWords.join(", ")}`
          )
        : (
            `${currentActivityLabel()} practice`
          );

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
        Begin each new demand with the student's independent attempt. Open support only if a barrier appears.
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

    breakArea.hidden =
      !isBreak;

    if (isBreak) {
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
        "Write the word part that matches the given meaning.",
      break:
        "Start with each whole word. Mark the meaningful boundaries yourself. Do not pre-mark the parts.",
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

    byId(
      "printBuildMat"
    ).innerHTML =
      state.tasks
        .map(
          task => {
            const word =
              taskWord(task);

            const prompt =
              task.prompt ||
              "";

            return `
              <div class="print-response-item">
                <strong>
                  ${esc(task.stage)}
                  ${
                    word
                      ? ` · ${esc(word)}`
                      : ""
                  }
                </strong>

                <p>
                  ${esc(prompt)}
                </p>

                <div class="print-response-lines">
                  __________________________________________
                  __________________________________________
                  __________________________________________
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
      state.plan
        ?.targetResolution
        ?.primary ||
      null;

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
                  Ask: What part do you recognize? What do you think the whole word means?
                </p>
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
              task => `
                <li>
                  ${esc(task.prompt)}
                  ${
                    task.answer
                      ? `
                        <div class="print-small-note">
                          <strong>Educator key:</strong>
                          ${esc(task.answer)}
                        </div>
                      `
                      : ""
                  }
                </li>
              `
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

          <p class="print-small-note">
            <strong>
              Educator key:
            </strong>
            ${esc(
              applyTask
                ?.recipe
                ?.word ||
              ""
            )}
          </p>
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
            Begin without added morphology support.
            Add support only after a specific barrier
            appears.
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
          ? "Present each prompt without revealing the educator key. Add the least support only after the student's first attempt."
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

    byId(
      "printBuildMat"
    ).innerHTML =
      printPromptMode
        ? state.tasks
            .map(
              task => `
                <div class="print-build-slot">
                  <strong>${esc(task.stage)}</strong>
                  <span>${esc(task.prompt)}</span>
                  ${
                    task.answer
                      ? `
                        <span class="print-small-note">
                          <strong>Educator key:</strong>
                          ${esc(task.answer)}
                        </span>
                      `
                      : ""
                  }
                </div>
              `
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

    const unavailable =
      byId(
        "sessionMaterialUnavailable"
      );

    const shouldShow =
      state.familyCandidates
        .length <= 1;

    unavailable.hidden =
      !shouldShow;
  }


  function renderDurationButtons() {
    document
      .querySelectorAll(
        "[data-session-minutes]"
      )
      .forEach(
        button => {
          const active =
            Number(
              button.dataset
                .sessionMinutes
            ) ===
            state.minutes;

          button.classList.toggle(
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


  function render() {
    const primary =
      state.plan
        ?.targetResolution
        ?.primary;

    byId(
      "sessionLearnerName"
    ).textContent =
      state.student.name;

    byId(
      "sessionTargetLine"
    ).textContent =
      targetPhrase(
        primary
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
    } else {
      warning.hidden =
        true;

      warning.innerHTML =
        "";
    }

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

    state.plan =
      planner.buildPlan({
        student:
          state.student,

        sessionMinutes:
          state.minutes
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
        }
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
