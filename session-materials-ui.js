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

          materialSpec
        }) ||
      null;
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
              `Work with ${recipe.word} and explain what the target contributes.`
            ),

          mode:
            recipe.mode ||
            material
              ?.displayMode ||
            (
              material
                ?.family
                ? "build"
                : "prompt"
            ),

          answer:
            recipe.educatorKey ||
            recipe.answer ||
            recipe.word ||
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

        mode:
          applyItem.mode ||
          material
            ?.displayMode ||
          "prompt",

        answer:
          applyItem.answer ||
          applyItem.word ||
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
          "Open response; use the target and master inventory metadata to judge the response.";
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
        ?.transfer;

    const content =
      byId(
        "sessionTransferContent"
      );

    const printContent =
      byId(
        "printTransferPrompt"
      );

    if (
      Array.isArray(
        transfer?.items
      ) &&
      transfer.items.length
    ) {
      const html =
        transfer.items
          .map(
            item => `
              <p>
                ${esc(
                  item.prompt ||
                  item.word ||
                  ""
                )}
              </p>
            `
          )
          .join("");

      content.innerHTML =
        html;

      printContent.innerHTML =
        html;

      return;
    }

    const pending = `
      <p>
        <strong>
          Protected Check Transfer item not yet
          populated for this target.
        </strong>
      </p>

      <p>
        Do not substitute a Migration Challenge word
        or an ordinary practice word. The protected
        Session Guide transfer pool remains separate.
      </p>
    `;

    content.innerHTML =
      pending;

    printContent.innerHTML =
      pending;
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
      state.material.family
        ? (
            `${state.material.family} ` +
            "Word Building"
          )
        : (
            state.plan
              ?.teachPractice
              ?.activityLabel ||
            "Teacher-Led Practice"
          );

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
