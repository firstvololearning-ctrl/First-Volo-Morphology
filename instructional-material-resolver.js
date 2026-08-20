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
      ).includes(wanted)
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


  function resolve({
    targetResolution = null,
    sessionMinutes = 15,
    materialSpec = null
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

    const allRecipes =
      asArray(
        family
          ?.sessionRecipes
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

    const requiredParts = [
      ...new Set(
        selectedRecipes
          .flatMap(
            recipe =>
              asArray(
                recipe.parts
              )
          )
          .map(
            part =>
              String(part)
          )
      )
    ];

    const selectedTiles =
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
        );

    const missingParts =
      requiredParts
        .filter(
          part =>
            !selectedTiles.some(
              tile =>
                tileMatchesPart(
                  tile,
                  part
                )
            )
        );

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
        "session-material-resolver-v1",

      family:
        spec.family,

      targetResolution,

      primaryTarget:
        primary,

      sessionMinutes:
        Number(
          sessionMinutes
        ) || 15,

      slots:
        spec.slots,

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
          "Only explicit session recipes may become ordinary instructional materials. Protected whole words are rejected before rendering."
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
