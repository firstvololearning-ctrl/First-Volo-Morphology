"use strict";

/*
  First Volo Morphology
  Protection-Aware Session Material Resolver

  This layer turns a full family material specification
  into the exact subset required for one session.

  It NEVER exposes a formal assessment target,
  Migration Challenge word, or Check Transfer word
  through ordinary Teach / Practice or Apply materials.
*/

(function initializeFirstVoloInstructionalMaterialResolver() {

  function asArray(value) {
    return Array.isArray(value)
      ? value
      : [];
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


  function protectedRegistry() {
    return (
      window
        .FirstVoloInstructionalProtection ||
      {
        formalPrePost: [],
        migrationChallenge: [],
        connectedTextTransfer: []
      }
    );
  }


  function protectionReason(word) {
    const wanted =
      normalize(word);

    if (!wanted) {
      return null;
    }

    const registry =
      protectedRegistry();

    if (
      typeof registry
        .protectionReason ===
      "function"
    ) {
      return (
        registry
          .protectionReason(
            wanted
          ) ||
        null
      );
    }

    if (
      asArray(
        registry.formalPrePost
      ).includes(wanted)
    ) {
      return "formal-pre-post";
    }

    if (
      asArray(
        registry.migrationChallenge
      ).includes(wanted)
    ) {
      return "migration-challenge";
    }

    if (
      asArray(
        registry.connectedTextTransfer
      ).map(normalize).includes(wanted)
    ) {
      return "check-transfer";
    }

    const checkTransfer =
      window.FirstVoloCheckTransfer;

    if (
      checkTransfer
        ?.isReservedWord
        ? checkTransfer.isReservedWord(word)
        : asArray(
            checkTransfer
              ?.getReservedWords?.()
          )
            .map(normalize)
            .includes(wanted)
    ) {
      return "check-transfer";
    }

    return null;
  }


  function isProtected(word) {
    return Boolean(
      protectionReason(word)
    );
  }


  function tileMatchesPart(
    tile,
    part
  ) {
    const partVariants =
      variants(part);

    const tileVariants =
      variants(
        tile?.label
      );

    return partVariants.some(
      value =>
        tileVariants.includes(
          value
        )
    );
  }


  function recipeMatchesTarget(
    recipe,
    target
  ) {
    if (!target?.label) {
      return true;
    }

    /*
      Program-wide inventory recipes carry the exact canonical target ID.
      Prefer that stable identity before comparing visible surface forms.
      This keeps allomorphs such as derm -> derma and script -> scrib/script
      attached to the correct target without weakening family-recipe matching.
    */
    if (
      recipe?.targetId &&
      target?.id &&
      String(recipe.targetId) ===
        String(target.id)
    ) {
      return true;
    }

    return asArray(
      recipe.parts
    ).some(
      part =>
        variants(part)
          .some(
            value =>
              variants(
                target.label
              ).includes(
                value
              )
          )
    );
  }


  function recipeLimit(
    minutes
  ) {
    if (
      Number(minutes) === 10
    ) {
      return 2;
    }

    if (
      Number(minutes) === 30
    ) {
      return 5;
    }

    return 3;
  }


  function uniqueTiles(tiles) {
    const seen =
      new Set();

    const output = [];

    for (const tile of asArray(tiles)) {
      const key =
        normalize(
          tile?.label
        );

      if (
        !key ||
        seen.has(key)
      ) {
        continue;
      }

      seen.add(key);

      output.push({
        ...tile
      });
    }

    return output;
  }


  function inventoryBuildTiles(
    recipes
  ) {
    return uniqueTiles(
      asArray(recipes)
        .flatMap(recipe => [
          ...asArray(
            recipe?.buildTiles
          ),
          ...asArray(
            recipe?.applyBuildTiles
          )
        ])
    );
  }


  function inventoryBuildSlots(
    recipes
  ) {
    const slotSets =
      asArray(recipes)
        .flatMap(recipe => [
          asArray(
            recipe?.buildSlots
          ),
          asArray(
            recipe?.applyBuildSlots
          )
        ])
        .filter(
          slots =>
            slots.length
        );

    const maxLength =
      slotSets.reduce(
        (max, slots) =>
          Math.max(
            max,
            slots.length
          ),
        0
      );

    if (!maxLength) {
      return [];
    }

    const accepted = [
      "prefix",
      "suffix",
      "root",
      "Greek combining form",
      "base word",
      "word part"
    ];

    return Array.from(
      {
        length:
          maxLength
      },
      (_, index) => {
        const labels = [
          ...new Set(
            slotSets
              .map(
                slots =>
                  slots[index]
                    ?.label
              )
              .filter(Boolean)
          )
        ];

        return {
          id:
            `part-${index + 1}`,

          label:
            labels.length === 1
              ? labels[0]
              : `WORD PART ${index + 1}`,

          accepts:
            accepted.slice(),

          required:
            true
        };
      }
    );
  }


  function resolve({
    targetResolution = null,
    sessionMinutes = 15,
    materialSpec = null,
    activity = "learn",
    gradeBand = null,
    vocabLevel = null
  } = {}) {
    const materials =
      window
        .FirstVoloInstructionalMaterials;

    const spec =
      materialSpec ||
      materials
        ?.buildWordBuildingSpec?.({
          targetResolution,

          familyId:
            targetResolution
              ?.familyId ||
            null
        }) ||
      null;

    if (!spec) {
      return null;
    }

    const family =
      window
        .FirstVoloInstructionalMaterialFamilies
        ?.families
        ?.[
          spec.family
        ] ||
      null;

    const primary =
      targetResolution
        ?.primary ||
      null;

    /*
      Custom family sessionRecipes are word-building recipes.
      Use them for Build Words only. Every other activity resolves
      through the activity-specific master item bank so a COOK/PORT/
      TRACT/VIEW family can never turn Find, Meaning, Break It Apart,
      etc. into a Build task simply because a custom family exists.
    */
    const familyRecipes =
      (
        family &&
        activity === "build"
      )
        ? asArray(
            family
              ?.sessionRecipes
          )
        : [];

    const inventoryRecipes =
      !familyRecipes.length &&
      window
        .FirstVoloSessionItemBank
        ?.buildItems
        ? window
            .FirstVoloSessionItemBank
            .buildItems({
              targetResolution,
              activity,
              gradeBand,
              vocabLevel,
              limit:
                Math.max(
                  recipeLimit(
                    sessionMinutes
                  ) + 2,
                  5
                )
            })
        : [];

    const allRecipes =
      familyRecipes.length
        ? familyRecipes
        : asArray(
            inventoryRecipes
          );

    const protectionReport =
      allRecipes
        .filter(
          recipe =>
            isProtected(
              recipe.word
            )
        )
        .map(
          recipe => ({
            word:
              recipe.word,

            reason:
              protectionReason(
                recipe.word
              )
          })
        );

    const safeRecipes =
      allRecipes
        .filter(
          recipe =>
            !isProtected(
              recipe.word
            )
        );

    const targetRecipes =
      safeRecipes
        .filter(
          recipe =>
            recipeMatchesTarget(
              recipe,
              primary
            )
        );

    const selectedRecipes =
      targetRecipes
        .slice(
          0,
          recipeLimit(
            sessionMinutes
          )
        );

    const inventoryBuildMode =
      (
        !familyRecipes.length &&
        activity === "build"
      );

    const requiredParts = [
      ...new Set(
        selectedRecipes
          .flatMap(recipe => [
            ...asArray(
              recipe.parts
            ),
            ...asArray(
              recipe.applyParts
            )
          ])
          .map(
            part =>
              String(part)
          )
      )
    ];

    const selectedTiles =
      inventoryBuildMode
        ? inventoryBuildTiles(
            selectedRecipes
          )
        : (
            asArray(
              spec.tiles
            )
              .filter(
                tile =>
                  requiredParts.some(
                    part =>
                      tileMatchesPart(
                        tile,
                        part
                      )
                  )
              )
          );

    const resolvedSlots =
      inventoryBuildMode
        ? inventoryBuildSlots(
            selectedRecipes
          )
        : spec.slots;

    /* FIRST_VOLO_PROMPT_ACTIVITIES_DO_NOT_REQUIRE_BUILD_TILES_V1
       Prompt-based teacher-led activities are generated from validated
       selector recipes. They do not need a prebuilt reusable family tile for
       every non-target part. Requiring those tiles turned perfectly usable
       system-generated Learn/Find/Meaning/Word Part/Figure/Use materials into
       a false “material not configured” state.

       Build Words is different: every displayed part must still have a real,
       validated tile and a clean decomposition.
    */
    const missingParts =
      inventoryBuildMode
        ? requiredParts
            .filter(
              part =>
                !selectedTiles.some(
                  tile =>
                    tileMatchesPart(
                      tile,
                      part
                    )
                )
            )
        : [];

    const buildPrompts =
      selectedRecipes
        .filter(
          recipe =>
            recipe.wordPrompt
        )
        .map(
          recipe => ({
            word:
              recipe.word,

            text:
              recipe.wordPrompt,

            parts:
              recipe.parts
          })
        );

    const contextPrompts =
      selectedRecipes
        .filter(
          recipe =>
            recipe.contextPrompt
        )
        .map(
          recipe => ({
            word:
              recipe.word,

            text:
              recipe.contextPrompt,

            parts:
              recipe.parts
          })
        );

    return {
      version:
        "session-material-resolver-v2-program-wide",

      family:
        spec.family,

      activity,

      source:
        familyRecipes.length
          ? "custom-material-family"
          : "system-generated-validated-word-universe",

      displayMode:
        (
          familyRecipes.length ||
          activity === "build"
        )
          ? "build"
          : "prompt",

      targetResolution,

      primaryTarget:
        primary,

      sessionMinutes:
        Number(
          sessionMinutes
        ) || 15,

      slots:
        resolvedSlots,

      tiles:
        selectedTiles,

      recipes:
        selectedRecipes,

      buildPrompts,

      contextPrompts,

      digital: {
        enabled:
          Boolean(
            spec.digital
              ?.enabled
          ),

        interaction:
          spec.digital
            ?.interaction ||
          "drag-or-click-to-place"
      },

      print: {
        ...spec.print,

        enabled:
          Boolean(
            spec.print
              ?.enabled
          ),

        cardCount:
          selectedTiles.length,

        promptCount:
          selectedRecipes.length
      },

      protection: {
        safe:
          protectionReport.length === 0,

        excludedRecipes:
          protectionReport,

        missingParts,

        rule:
          "Teacher-led materials are generated from the validated word universe (shared inventory plus approved teacher-only extensions) or an approved custom family. The online practice pool is not the boundary. Protected whole words are rejected before rendering, and Build Words still requires every displayed piece to be linguistically validated."
      },

      needsPrimarySelection:
        Boolean(
          targetResolution
            ?.needsPrimarySelection
        ),

      ready:
        Boolean(
          primary &&
          selectedRecipes.length &&
          selectedTiles.length &&
          missingParts.length === 0
        )
    };
  }


  window.FirstVoloInstructionalMaterialResolver = {
    protectionReason,
    isProtected,
    recipeMatchesTarget,
    recipeLimit,
    resolve
  };

})();
