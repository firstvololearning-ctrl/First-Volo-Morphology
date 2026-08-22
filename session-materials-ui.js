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


  function readyExpectedBoundaries(task) {
    const word =
      readyCleanPart(
        readyWord(task)
      );

    const parts =
      Array.isArray(
        task?.recipe?.parts
      )
        ? task.recipe.parts
            .map(
              readyCleanPart
            )
            .filter(Boolean)
        : [];

    if (
      parts.length < 2 ||
      parts.join("") !== word
    ) {
      return [];
    }

    let total = 0;

    return parts
      .slice(
        0,
        -1
      )
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
      Array.isArray(
        task?.recipe?.parts
      )
        ? task.recipe.parts
            .filter(Boolean)
        : [];

    return parts.length
      ? parts.join(" + ")
      : "";
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


  function readySupportTile() {
    const target =
      readyTargetLabel();

    return (
      readyMaterialTilePool()
        .find(
          tile =>
            labelsMatch(
              tile?.label,
              target
            )
        ) ||
      null
    );
  }


  function readyTileMarkup(
    tile,
    {
      includeMeaning = true
    } = {}
  ) {
    if (!tile) {
      const label =
        readyTargetLabel();

      return `
        <div class="ready-support-fallback">
          <strong>
            ${esc(label)}
          </strong>

          ${
            includeMeaning &&
            readyTargetMeaning()
              ? `
                <span>
                  ${esc(
                    readyTargetMeaning()
                  )}
                </span>
              `
              : ""
          }
        </div>
      `;
    }

    const image =
      tile.image
        ? `
          <img
            class="ready-support-tile-image"
            src="${esc(tile.image)}"
            alt=""
          >
        `
        : "";

    return `
      <div class="ready-support-tile-card">
        ${image}

        <strong>
          ${esc(tile.label)}
        </strong>

        ${
          includeMeaning &&
          (
            tile.meaning ||
            readyTargetMeaning()
          )
            ? `
              <span>
                ${esc(
                  tile.meaning ||
                  readyTargetMeaning()
                )}
              </span>
            `
            : ""
        }
      </div>
    `;
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


  function readySupportDetailsMarkup() {
    return `
      <details class="ready-support-panel">
        <summary>
          Support if needed after the independent attempt
        </summary>

        <div class="ready-support-panel-body">
          <p>
            Show this only after the student has attempted
            the same demand independently.
          </p>

          ${readyTileMarkup(
            readySupportTile(),
            {
              includeMeaning: true
            }
          )}
        </div>
      </details>
    `;
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
          Educator key
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


  function renderReadyBreak(
    container,
    task
  ) {
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
          Ready-to-use student material
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
          Check Break Apart
        </button>

        <span
          id="readyBreakFeedback"
          aria-live="polite"
        ></span>
      </div>

      ${readyEducatorKeyMarkup(task)}
      ${readySupportDetailsMarkup()}
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
            "Compare the student's boundaries with the educator key.";

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
            : "Not yet. Keep the whole word intact and reconsider the meaningful parts.";
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

    container.innerHTML = `
      <div class="ready-material-heading">
        <span>
          Ready-to-use student material
        </span>

        <h3>
          Meaning
        </h3>

        <p>
          What does this word part mean?
        </p>
      </div>

      <div class="ready-big-target">
        ${esc(readyTargetLabel())}
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
              Student response
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


  function renderReadyMorpheme(
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


  function renderReadyStudentMaterial(
    task
  ) {
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

    const title =
      byId(
        "digitalMaterialTitle"
      );

    if (title) {
      title.textContent =
        READY_ACTIVITY_LABELS[
          activity
        ] ||
        "Student Material";
    }

    if (activity === "build") {
      container.innerHTML = `
        <div class="ready-material-heading ready-build-heading">
          <span>
            Ready-to-use student material
          </span>

          <h3>
            Build Words
          </h3>

          <p>
            Use the actual First Volo word-part tiles and mat below.
            Begin without showing meanings; open support only if needed.
          </p>
        </div>
      `;

      return;
    }

    const renderers = {
      learn: renderReadyLearn,
      find: renderReadyFind,
      hunt: renderReadyHunt,
      meaning: renderReadyMeaning,
      morpheme: renderReadyMorpheme,
      break: renderReadyBreak,
      infer: renderReadyInfer,
      use: renderReadyUse,
      change: renderReadyChange
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
  }


  function readyPrintableTaskMarkup(
    task
  ) {
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
      return `
        <section class="print-ready-task">
          ${heading}

          <div class="print-ready-target">
            ${esc(
              readyTargetLabel()
            )}
          </div>

          <p>
            What does this word part mean?
          </p>

          <div class="print-ready-lines"></div>
        </section>
      `;
    }

    if (activity === "morpheme") {
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
            readyPrintableTaskMarkup
          )
          .join("");
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

      supportBody.innerHTML = `
        <div class="print-ready-support-warning">
          <strong>
            Educator support — do not show before the independent attempt.
          </strong>

          <p>
            Use the least amount of support needed, retry the same demand,
            then fade the support.
          </p>
        </div>

        <div class="print-ready-support-tile">
          ${readyTileMarkup(
            readySupportTile(),
            {
              includeMeaning: true
            }
          )}
        </div>

        ${
          breakKeys.length
            ? `
              <section class="print-ready-key-section">
                <h2>
                  Break It Apart educator key
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

    if (
      retrieveSupport &&
      !retrieveSupport.querySelector(
        ".ready-retrieve-visual-support"
      )
    ) {
      const wrap =
        document.createElement(
          "details"
        );

      wrap.className =
        "ready-retrieve-visual-support ready-support-panel";

      wrap.innerHTML = `
        <summary>
          Open the actual visual cue if needed
        </summary>

        <div class="ready-support-panel-body">
          <p>
            Show only after the student's independent retrieval attempt.
          </p>

          ${readyTileMarkup(
            readySupportTile(),
            {
              includeMeaning: true
            }
          )}
        </div>
      `;

      retrieveSupport.append(
        wrap
      );
    }
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


  function readySupportTile() {
    const target =
      readyTargetLabel();

    const existing =
      readyMaterialTilePool()
        .find(
          tile =>
            labelsMatch(
              tile?.label,
              target
            )
        ) ||
      null;

    const meta =
      readyTargetMorphemeMeta();

    if (existing) {
      return {
        ...existing,
        label:
          existing.label ||
          meta?.label ||
          target,
        meaning:
          existing.meaning ||
          meta?.meaning ||
          readyTargetMeaning(),
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
          target,
        meaning:
          meta.meaning ||
          readyTargetMeaning(),
        image:
          meta.imagePath ||
          ""
      };
    }

    return null;
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
      )
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


  function readyBreakItemIsFair(item) {
    const word =
      readyLettersOnly(
        item?.word
      );

    const segmentation =
      item?.segmentation ||
      (
        Array.isArray(
          item?.parts
        )
          ? item.parts.join(" + ")
          : ""
      );

    const parts =
      readySegmentationParts(
        segmentation
      );

    const cleanParts =
      parts
        .map(
          readyLettersOnly
        )
        .filter(Boolean);

    if (
      !word ||
      cleanParts.length < 2 ||
      cleanParts.join("") !== word
    ) {
      return false;
    }

    const targetIds =
      readyTargetIds();

    const targetIsAWholePart =
      cleanParts.some(
        part =>
          targetIds.includes(part)
      );

    if (!targetIsAWholePart) {
      return false;
    }

    if (
      !readyV7BreakOtherMorphemesWereEncountered(
        parts
      )
    ) {
      return false;
    }

    const caution =
      String(
        item?.reviewCaution ||
        item?.caution ||
        ""
      )
        .toLowerCase();

    if (
      /opaque|false morph|do not break|avoid break|not a clean segmentation/.test(
        caution
      )
    ) {
      return false;
    }

    if (
      String(
        item?.transparency ||
        ""
      )
        .toLowerCase() ===
      "low"
    ) {
      return false;
    }

    return true;
  }


  function readyBreakTaskIsFair(task) {
    return readyBreakItemIsFair({
      word:
        readyWord(task),
      segmentation:
        task?.recipe
          ?.segmentation ||
        readyExpectedWordSum(
          task
        ),
      parts:
        readyTaskParts(task),
      reviewCaution:
        task?.recipe
          ?.reviewCaution,
      transparency:
        task?.recipe
          ?.transparency
    });
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


  function readyInventoryCandidates(
    activity
  ) {
    const items =
      readyWordInventory()
        .filter(
          item =>
            item &&
            String(
              item.status ||
              "current"
            )
              .toLowerCase() !==
              "excluded" &&
            item.word &&
            !readyProtectedWord(
              item.word
            ) &&
            readyBandAllows(item) &&
            readyFlightAllows(item) &&
            readyInventoryMatchesTarget(
              item
            )
        );

    const filtered =
      activity === "break" ||
      activity === "build"
        ? items.filter(
            readyBreakItemIsFair
          )
        : items;

    return filtered
      .slice()
      .sort(
        (a, b) =>
          readyCandidateScore(b) -
          readyCandidateScore(a)
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
        candidate &&
        !readyProtectedWord(
          candidate.word
        ) &&
        readyInventoryMatchesTarget(
          candidate
        ) &&
        (
          activity !== "break" &&
          activity !== "build" ||
          readyBreakItemIsFair(
            candidate
          )
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
          candidate &&
          !readyProtectedWord(
            candidate.word
          ) &&
          readyInventoryMatchesTarget(
            candidate
          ) &&
          (
            activity !== "break" &&
            activity !== "build" ||
            readyBreakItemIsFair(
              candidate
            )
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

    if (activity !== "break") {
      return;
    }

    const signature =
      [
        readyTargetLabel(),
        activity,
        ...state.tasks.map(
          task =>
            `${task?.stage || ""}:${readyWord(task)}`
        )
      ].join("|");

    if (
      state._readyBreakPreparedSignature ===
      signature
    ) {
      return;
    }

    const safeOriginalWords =
      new Set(
        state.tasks
          .filter(
            task =>
              readyBreakTaskIsFair(
                task
              )
          )
          .map(
            task =>
              readyLettersOnly(
                readyWord(task)
              )
          )
      );

    const candidates =
      readyAllPracticeCandidates(
        "break"
      );

    const used =
      new Set();

    state.tasks =
      state.tasks.map(
        task => {
          if (
            readyActivity(task) !==
            "break"
          ) {
            return task;
          }

          const word =
            readyLettersOnly(
              readyWord(task)
            );

          if (
            readyBreakTaskIsFair(
              task
            ) &&
            !used.has(word)
          ) {
            used.add(word);

            return task;
          }

          const replacement =
            candidates.find(
              item => {
                const candidateWord =
                  readyLettersOnly(
                    item.word
                  );

                return (
                  candidateWord &&
                  !used.has(
                    candidateWord
                  ) &&
                  !safeOriginalWords.has(
                    candidateWord
                  )
                );
              }
            ) ||
            candidates.find(
              item => {
                const candidateWord =
                  readyLettersOnly(
                    item.word
                  );

                return (
                  candidateWord &&
                  !used.has(
                    candidateWord
                  )
                );
              }
            ) ||
            null;

          if (!replacement) {
            return {
              ...task,
              recipe: {
                ...(task.recipe || {}),
                _readyBreakUnavailable:
                  true
              }
            };
          }

          used.add(
            readyLettersOnly(
              replacement.word
            )
          );

          return readyTaskFromCandidate(
            replacement,
            task.stage
          );
        }
      );

    state._readyBreakPreparedSignature =
      [
        readyTargetLabel(),
        activity,
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
      container.innerHTML = `
        <div class="ready-material-heading">
          <span>
            Step ${
              task?.stage === "Apply"
                ? "3 · Apply"
                : "2 · Teach / Practice"
            }
          </span>

          <h3>
            Break It Apart
          </h3>

          <p>
            No fair whole-word boundary item is available for this target at this level
            without requiring an untaught spelling or word-part boundary.
            Do not score a forced segmentation.
          </p>
        </div>
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
      ${readySupportDetailsMarkup()}
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
      activity === "meaning" ||
      activity === "morpheme"
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
          <h3>
            ${number}. What does ${esc(readyTargetLabel())} mean${
              word
                ? ` in ${esc(word)}`
                : ""
            }?
          </h3>

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

      const distractors =
        readyMorphemeDistractors(3)
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

      return `
        <section
          class="ready-practice-question"
          data-practice-question="${index}"
          data-practice-activity="choice"
          data-practice-answer="${esc(correct)}"
        >
          <h3>
            ${number}. Which word part means “${esc(readyTargetMeaning())}”?
          </h3>

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
                    Educator key after the attempt
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
                    }
                  );
                }
              );
          }

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
                ".ready-practice-question:not([hidden])"
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

    const items =
      readyPracticeSetItems();

    const signature =
      [
        readyTargetLabel(),
        activity,
        readyCurrentBand(),
        readyCurrentFlight(),
        ...items.map(
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

    if (items.length < 5) {
      container.innerHTML = `
        <div class="ready-practice-unavailable">
          <strong>
            Practice set not available for this target yet.
          </strong>

          <p>
            There are currently fewer than five appropriate additional words
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
          Use the first five items, or continue through all ten.
        </span>
      </div>

      <div class="ready-practice-question-list">
        ${items
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
          items.length > 5
            ? `
              <button
                type="button"
                class="session-secondary-button"
                id="readyContinuePracticeSet"
              >
                Continue for ${
                  Math.min(
                    5,
                    items.length - 5
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
        >
          Check Practice Set
        </button>

        <strong
          id="readyPracticeSummary"
          aria-live="polite"
        ></strong>
      </div>

      ${readyV7PracticeSupportMarkup(
        activity
      )}
    `;

    readyBindPracticeQuestions(
      container
    );

    readyV7PolishPracticeSetCopy();
  }


  function readyPrintablePracticeMarkup() {
    const activity =
      readyActivity(
        state.tasks?.[0] ||
        null
      );

    const items =
      readyPracticeSetItems();

    if (items.length < 5) {
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
            This target does not yet have five appropriate additional items
            for this activity at the learner's current level.
            Use the available session activities rather than repeating or forcing unsuitable items.
          </p>
        </section>
      `;
    }

    const firstTen =
      items.slice(
        0,
        10
      );

    const rows =
      firstTen
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
              return `
                <div class="print-ready-practice-item">
                  <strong>
                    ${index + 1}. What does ${esc(readyTargetLabel())} mean?
                  </strong>

                  <div class="print-ready-lines"></div>
                </div>
              `;
            }

            if (activity === "morpheme") {
              return `
                <div class="print-ready-practice-item">
                  <strong>
                    ${index + 1}. Which word part means “${esc(readyTargetMeaning())}”?
                  </strong>

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
            Practice Set · ${
              esc(
                READY_ACTIVITY_LABELS[
                  activity
                ] ||
                activity
              )
            }
          </h2>

          <p>
            Use the first five items, or continue through all ten.
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
                    task
                  )
          )
          .join("") +
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

      supportBody.innerHTML = `
        <div class="print-ready-support-warning">
          <strong>
            Educator support — do not show before the independent attempt.
          </strong>

          <p>
            First use the familiar First Volo visual tile.
            Reveal the meaning only if the student still needs more support.
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
          breakKeys.length
            ? `
              <section class="print-ready-key-section">
                <h2>
                  Break It Apart educator key
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
            readySupportTile(),
            {
              includeMeaning: false
            }
          )}

          ${
            readyTargetMeaning()
              ? `
                <details class="ready-meaning-reveal">
                  <summary>
                    Show meaning if still needed
                  </summary>

                  <p>
                    ${esc(
                      readyTargetMeaning()
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


  function readyV7ActivitySupportMarkup(
    activity
  ) {
    const meaning =
      readySupportTile()
        ?.meaning ||
      readyTargetMeaning();

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
        </div>
      </details>
    `;
  }


  function readyV7PracticeSupportMarkup(
    activity
  ) {
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


  function readyV7BreakOtherMorphemesWereEncountered(
    parts
  ) {
    const targetIds =
      new Set(
        readyTargetIds()
      );

    const encountered =
      readyV7LearnerEncounteredTargetIds();

    const cleanParts =
      parts
        .map(
          readyLettersOnly
        )
        .filter(Boolean);

    for (
      const part
      of cleanParts
    ) {
      if (
        targetIds.has(
          part
        )
      ) {
        continue;
      }

      const meta =
        readyMorphemeMetaFor(
          part
        );

      if (!meta) {
        continue;
      }

      const metaIds =
        [
          meta?.id,
          meta?.label
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
          .filter(Boolean);

      const known =
        metaIds.some(
          value =>
            encountered.has(
              value
            )
        );

      if (!known) {
        return false;
      }
    }

    return true;
  }


  function readyV7TeacherDirections(
    task
  ) {
    const prompt =
      String(
        task?.prompt ||
        ""
      )
        .trim();

    const followUp =
      String(
        task?.followUp ||
        ""
      )
        .trim();

    return `
      <details class="ready-teacher-directions">
        <summary>
          Teacher directions
        </summary>

        <div class="ready-teacher-directions-body">
          <p>
            ${
              esc(
                prompt ||
                "Present the student activity. Let the student try first, then open support only if needed."
              )
            }
          </p>

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

    if (step2Note) {
      step2Note.textContent =
        "Try this skill with the first item. Let the student respond before opening support.";
    }

    if (step3Note) {
      step3Note.textContent =
        "Try the same skill with a new example.";
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

    const unavailable =
      container.querySelector(
        ".ready-practice-unavailable"
      );

    if (unavailable) {
      note.textContent =
        "Additional practice appears here when five appropriate items are available for this target and activity.";

      const paragraph =
        unavailable.querySelector(
          "p"
        );

      if (paragraph) {
        paragraph.textContent =
          "There are currently fewer than five appropriate additional items for this target and activity at the learner's current level. Use the available session activities today.";
      }

      return;
    }

    note.textContent =
      "Five additional practice items for this target and activity. Continue for five more when appropriate.";
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
      inactiveMount.innerHTML =
        "";
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

    if (heading) {
      heading.textContent =
        "Teacher Session Plan";
    }

    const activity =
      readyActivityDisplayName(
        task
      );

    const target =
      readyTargetLabel();

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

    const desired = [
      `Retrieve — target: ${target}`,
      `${activity} · Part A: Practice`,
      partBUnavailable
        ? `${activity} · Part B: Apply — not available for this target today`
        : `${activity} · Part B: Apply`,
      "Check Transfer — 1 unfamiliar transfer item",
      "Optional Practice Set"
    ];

    const existing =
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

    if (!existing.length) {
      return;
    }

    desired.forEach(
      (
        text,
        index
      ) => {
        let node =
          existing[index];

        if (!node) {
          const template =
            existing[
              existing.length - 1
            ];

          node =
            template.cloneNode(
              false
            );

          template.parentElement
            ?.appendChild(
              node
            );

          existing.push(
            node
          );
        }

        node.innerHTML = `
          <strong>
            ${index + 1}. ${esc(text)}
          </strong>
        `;
      }
    );

    for (
      let index =
        desired.length;
      index <
        existing.length;
      index += 1
    ) {
      existing[index].hidden =
        true;
    }
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
        true;
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
      number &&
      total > 1
    ) {
      step2Note.textContent =
        `Practice item ${number} of ${total}. Let the student respond before opening support.`;
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

    const strip =
      document.createElement(
        "div"
      );

    strip.className =
      "ready-v12-after-response";

    strip.innerHTML = `
      <strong>
        Apply after your answer:
      </strong>
      Find
      <strong>
        ${esc(target)}
      </strong>
      in
      <strong>
        ${esc(word)}
      </strong>.
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
      "Begin each task with an independent attempt. If the student needs help, provide the least support needed, retry the same task, then reduce support when possible."
    );

    readyV13ReplaceTextEverywhere(
      "Begin each new demand with the student's independent attempt. Open support only if a barrier appears.",
      "Begin each task with the student's independent attempt. Provide the least support needed only if help is needed, retry the same task, then reduce support when possible."
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
    const minutes =
      readyV13DurationMinutes();

    const policy =
      readyV13DurationPolicy[
        minutes
      ];

    if (!policy) {
      return;
    }

    const target =
      readyV13Text(
        readyTargetLabel()
      );

    const activity =
      readyActivityDisplayName(
        state.tasks?.[0] ||
        {}
      );

    readyV13TeacherPlanSections()
      .forEach(
        section => {
          const rows =
            [
              ...section.querySelectorAll(
                "li, p"
              )
            ]
              .filter(
                node =>
                  /^[1-5]\.\s*/.test(
                    readyV13Text(
                      node.textContent
                    )
                  )
              );

          if (
            rows.length <
            4
          ) {
            return;
          }

          const plan = [
            `1. Retrieve — target: ${target}`,
            `2. ${activity} · Part A: Practice — ${policy.partAItems} ${
              policy.partAItems === 1
                ? "item"
                : "items"
            }`,
            `3. ${activity} · Part B: Apply`,
            `4. Check Transfer — ${policy.transferItems} unfamiliar transfer ${
              policy.transferItems === 1
                ? "item"
                : "items"
            }`,
            `5. ${policy.step5Plan}`
          ];

          plan.forEach(
            (
              text,
              index
            ) => {
              if (
                rows[index]
              ) {
                rows[index].textContent =
                  text;
              }
            }
          );
        }
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
        minutes === 10
          ? "Optional extension. Use only if time remains or additional practice is indicated. Use up to five items."
          : minutes === 15
            ? "Optional practice. Use up to five items if time remains or additional practice is indicated."
            : "Complete the first five items. Continue with up to five additional items as appropriate.";
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
        ? `1 fresh ${currentActivityLabel()} item; do not preview the word`
        : `No fresh ${currentActivityLabel()} application item is available today`;

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

    const isWordPart =
      currentActivity() ===
      "morpheme";

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
      legacyActivityResponse.hidden =
        isWordPart;
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
      primary?.label
        ? [
            primary.role ||
              "word part",
            primary.label
          ]
            .filter(Boolean)
            .join(" ")
        : "Target";

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
