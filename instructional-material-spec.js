"use strict";

/*
  First Volo Morphology
  Shared Instructional Material Specification

  One material specification can be consumed by:
    - interactive digital renderer
    - therapist print renderer

  Family-specific content comes from the existing
  printable-configs through the generated material registry.
*/

(function initializeFirstVoloInstructionalMaterialSpec() {

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

  function registry() {
    return (
      window
        .FirstVoloInstructionalMaterialFamilies
        ?.families ||
      {}
    );
  }

  function familyById(familyId) {
    if (!familyId) {
      return null;
    }

    return (
      registry()[
        String(familyId)
          .trim()
          .toUpperCase()
      ] ||
      null
    );
  }

  function familyForTarget(target) {
    if (!target?.label) {
      return null;
    }

    const wanted =
      normalize(
        target.label
      );

    for (
      const family of
      Object.values(registry())
    ) {
      const centerMatch =
        asArray(
          family.tiles?.centers
        ).some(
          (tile) =>
            normalize(
              tile.label
            ) === wanted
        );

      if (centerMatch) {
        return family;
      }
    }

    return null;
  }

  function resolveTileRole(
    tile,
    family
  ) {
    if (
      tile.section === "prefix"
    ) {
      return "prefix";
    }

    if (
      tile.section === "suffix" ||
      tile.section === "extension"
    ) {
      return "suffix";
    }

    const resolver =
      window
        .FirstVoloLinguisticRoles
        ?.resolveRole;

    if (resolver) {
      return resolver({
        targetLabel:
          tile.label,

        familyId:
          family?.family ||
          null,

        targetType:
          "root"
      });
    }

    if (
      family?.layout ===
      "base-word"
    ) {
      return "base word";
    }

    return "word part";
  }

  function materialSlots(family) {
    if (
      family?.layout ===
      "base-word"
    ) {
      return [
        {
          id: "prefix",
          label: "PREFIX",
          accepts: [
            "prefix"
          ]
        },
        {
          id: "center",
          label: "BASE WORD",
          accepts: [
            "base word"
          ],
          required: true
        },
        {
          id: "suffix",
          label: "SUFFIX",
          accepts: [
            "suffix"
          ]
        }
      ];
    }

    const centerLabel =
      family?.labels
        ?.rootSection ||
      "ROOT";

    const prefixLabel =
      family?.labels
        ?.matAPrefix ||
      "PREFIX";

    return [
      {
        id: "prefix",
        label:
          prefixLabel,
        accepts: [
          "prefix",
          "Greek combining form"
        ]
      },
      {
        id: "center",
        label:
          centerLabel,
        accepts: [
          "root",
          "Greek combining form",
          "word part"
        ],
        required: true
      },
      {
        id: "suffix",
        label:
          "SUFFIX",
        accepts: [
          "suffix"
        ]
      }
    ];
  }

  function familyTiles(family) {
    if (!family) {
      return [];
    }

    return [
      ...asArray(
        family.tiles?.prefixes
      ),
      ...asArray(
        family.tiles?.centers
      ),
      ...asArray(
        family.tiles?.suffixes
      ),
      ...asArray(
        family.tiles?.extensions
      )
    ].map(
      (tile) => ({
        ...tile,

        role:
          resolveTileRole(
            tile,
            family
          ),

        movable:
          true,

        printable:
          true
      })
    );
  }

  function genericTiles(
    targetResolution
  ) {
    return asArray(
      targetResolution
        ?.allTargets
    ).map(
      (target, index) => ({
        id:
          target.id ||
          `target-${index + 1}`,

        section:
          "resolved-target",

        label:
          target.label,

        meaning:
          target.meaning ||
          null,

        role:
          target.role ||
          "word part",

        image:
          null,

        movable:
          true,

        printable:
          true
      })
    );
  }

  function genericSlots(
    targetResolution
  ) {
    const roles =
      new Set(
        asArray(
          targetResolution
            ?.allTargets
        ).map(
          (target) =>
            target.role
        )
      );

    const slots = [];

    if (
      roles.has("prefix")
    ) {
      slots.push({
        id: "prefix",
        label: "PREFIX",
        accepts: [
          "prefix"
        ]
      });
    }

    if (
      roles.has("base word")
    ) {
      slots.push({
        id: "center",
        label: "BASE WORD",
        accepts: [
          "base word"
        ],
        required: true
      });
    } else {
      slots.push({
        id: "center",
        label:
          roles.has(
            "Greek combining form"
          )
            ? "ROOT / GREEK COMBINING FORM"
            : (
                roles.has("root")
                  ? "ROOT"
                  : "WORD PART"
              ),

        accepts: [
          "root",
          "Greek combining form",
          "word part"
        ],

        required: true
      });
    }

    if (
      roles.has("suffix")
    ) {
      slots.push({
        id: "suffix",
        label: "SUFFIX",
        accepts: [
          "suffix"
        ]
      });
    }

    return slots;
  }

  function buildWordBuildingSpec({
    targetResolution,
    familyId = null
  } = {}) {
    const explicitFamily =
      familyById(
        familyId ||
        targetResolution
          ?.familyId
      );

    const inferredFamily =
      familyForTarget(
        targetResolution
          ?.primary
      );

    const family =
      explicitFamily ||
      inferredFamily ||
      null;

    const tiles =
      family
        ? familyTiles(family)
        : genericTiles(
            targetResolution
          );

    const slots =
      family
        ? materialSlots(family)
        : genericSlots(
            targetResolution
          );

    return {
      version:
        "material-spec-v1",

      kind:
        "word-building-mat",

      family:
        family?.family ||
        null,

      targetResolution,

      title:
        family
          ? `${family.family} Word Building`
          : "Word Building",

      directions:
        "Build, take apart, compare, and explain words using the available word-part tiles.",

      slots,

      tiles,

      prompts: {
        wordLevel:
          asArray(
            family
              ?.prompts
              ?.wordLevel
          ),

        context:
          asArray(
            family
              ?.prompts
              ?.context
          ),

        extension:
          asArray(
            family
              ?.prompts
              ?.extension
          )
      },

      digital: {
        enabled: true,

        interaction:
          "drag-or-click-to-place",

        touch:
          true,

        keyboard:
          true,

        reusableTiles:
          true,

        showMeaningOnRequest:
          true
      },

      print: {
        enabled: true,

        pageSize:
          "US Letter",

        matOrientation:
          "landscape",

        cardPageOrientation:
          "portrait",

        cutCardWidthInches:
          2.22,

        cutCardHeightInches:
          1.08,

        includeOnlyNeededPages:
          true,

        useRepositoryImages:
          true,

        preserveImageAspectRatio:
          true
      },

      notes:
        family?.notes ||
        {},

      needsFamilyExpansion:
        !family
    };
  }

  window.FirstVoloInstructionalMaterials = {
    familyById,
    familyForTarget,
    resolveTileRole,
    materialSlots,
    familyTiles,
    buildWordBuildingSpec
  };

})();
