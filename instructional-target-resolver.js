"use strict";

/*
  First Volo Morphology
  Instructional Target Resolver

  PURPOSE
  -------
  Resolve the actual instructional morphology before
  the Session Planner chooses digital or print materials.

  Precedence:
    1. explicit next-session / educator-selected target
    2. saved primaryTargetId / primaryTarget
    3. explicit saved supporting-target metadata
    4. word segmentation only as structural fallback

  IMPORTANT:
  - Never infer a target from Practice Flight.
  - Never silently choose one part of a multi-part word.
  - Exact linguistic role comes from the role registry.
  - Ambiguous structure remains explicit rather than guessed.
*/

(function initializeFirstVoloInstructionalTargetResolver() {

  const DIRECT_TARGET_ACTIVITIES =
    new Set([
      "learn",
      "find",
      "hunt",
      "meaning",
      "morpheme"
    ]);

  function asArray(value) {
    return Array.isArray(value)
      ? value
      : [];
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[‐-‒–—−]/g, "-");
  }

  function bare(value) {
    return normalize(value)
      .replace(/^-+|-+$/g, "");
  }

  function uniqueBy(values, keyFn) {
    const seen = new Set();

    return values.filter((value) => {
      const key = keyFn(value);

      if (!key || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }

  function morphemes() {
    return asArray(
      window.FIRST_VOLO_MORPHEME_INVENTORY
    );
  }

  function words() {
    return asArray(
      window.FIRST_VOLO_WORD_INVENTORY
    );
  }

  function wordMeta(word) {
    const target =
      normalize(word);

    if (!target) {
      return null;
    }

    return (
      words().find(
        (entry) =>
          normalize(entry.word) ===
          target
      ) || null
    );
  }

  function labelVariants(entry) {
    return [
      entry?.id,
      entry?.label
    ]
      .flatMap((value) =>
        String(value || "")
          .split(/[\/,]/)
      )
      .map((value) =>
        bare(value)
      )
      .filter(Boolean);
  }

  function morphemeCandidates({
    id = null,
    label = null
  } = {}) {
    const normalizedId =
      normalize(id);

    const normalizedLabel =
      bare(label);

    return morphemes().filter(
      (entry) => {
        if (
          normalizedId &&
          normalize(entry.id) ===
            normalizedId
        ) {
          return true;
        }

        if (!normalizedLabel) {
          return false;
        }

        return labelVariants(entry)
          .includes(
            normalizedLabel
          );
      }
    );
  }

  function exactMorpheme({
    id = null,
    label = null
  } = {}) {
    if (id) {
      const byId =
        morphemes().find(
          (entry) =>
            normalize(entry.id) ===
            normalize(id)
        );

      if (byId) {
        return byId;
      }
    }

    const candidates =
      morphemeCandidates({
        label
      });

    return candidates.length === 1
      ? candidates[0]
      : null;
  }

  function resolveRole({
    id = null,
    label = null,
    type = null,
    linguisticRole = null,
    familyId = null
  } = {}) {
    const resolver =
      window.FirstVoloLinguisticRoles
        ?.resolveRole;

    if (resolver) {
      return resolver({
        linguisticRole,
        targetId: id,
        targetLabel: label,
        familyId,
        targetType: type
      });
    }

    if (linguisticRole) {
      return linguisticRole;
    }

    if (type === "prefix") {
      return "prefix";
    }

    if (type === "suffix") {
      return "suffix";
    }

    return "word part";
  }

  function makeTarget({
    id = null,
    label = null,
    meaning = null,
    type = null,
    linguisticRole = null,
    familyId = null,
    source = null,
    explicit = false,
    structuralFallback = false
  } = {}) {
    const meta =
      exactMorpheme({
        id,
        label
      });

    const finalId =
      id ||
      meta?.id ||
      null;

    const finalLabel =
      label ||
      meta?.label ||
      null;

    if (!finalLabel) {
      return null;
    }

    const finalType =
      type ||
      meta?.type ||
      null;

    const finalMeaning =
      meaning ||
      meta?.meaning ||
      null;

    return {
      id: finalId,
      label: finalLabel,
      meaning: finalMeaning,
      type: finalType,

      role:
        resolveRole({
          id: finalId,
          label: finalLabel,
          type: finalType,
          linguisticRole,
          familyId
        }),

      source,
      explicit:
        Boolean(explicit),

      structuralFallback:
        Boolean(
          structuralFallback
        )
    };
  }

  function asInstructionalTarget(
    target
  ) {
    if (!target) {
      return null;
    }

    /*
      COOK / VIEW and any future base-word material centers
      are instructional materials, not morphology targets.
    */
    if (
      target.role ===
      "base word"
    ) {
      return null;
    }

    return target;
  }


  function explicitTargetRecord(
    target,
    familyId = null
  ) {
    if (!target) {
      return null;
    }

    if (
      typeof target === "string"
    ) {
      return asInstructionalTarget(makeTarget({
        label: target,
        familyId,
        source:
          "explicit-next-session-target",
        explicit: true
      }));
    }

    return asInstructionalTarget(makeTarget({
      id:
        target.id ||
        target.targetId ||
        target.primaryTargetId ||
        null,

      label:
        target.label ||
        target.targetLabel ||
        target.primaryTarget ||
        null,

      meaning:
        target.meaning ||
        null,

      type:
        target.type ||
        target.targetType ||
        null,

      linguisticRole:
        target.role ||
        target.linguisticRole ||
        null,

      familyId:
        target.familyId ||
        familyId ||
        null,

      source:
        "explicit-next-session-target",

      explicit: true
    }));
  }

  function savedPrimaryTarget(
    response,
    familyId = null
  ) {
    if (
      !response?.primaryTargetId &&
      !response?.primaryTarget
    ) {
      return null;
    }

    return asInstructionalTarget(makeTarget({
      id:
        response.primaryTargetId ||
        null,

      label:
        response.primaryTarget ||
        null,

      type:
        response.targetType ||
        null,

      linguisticRole:
        response.linguisticRole ||
        null,

      familyId:
        response.familyId ||
        familyId ||
        null,

      source:
        "saved-primary-target",

      explicit: true
    }));
  }

  function savedSupportingTargets(
    response,
    familyId = null
  ) {
    const ids =
      asArray(
        response
          ?.supportingTargetIds
      );

    const labels =
      asArray(
        response
          ?.supportingTargets
      );

    const roles =
      asArray(
        response
          ?.supportingTargetRoles
      );

    const length =
      Math.max(
        ids.length,
        labels.length,
        roles.length
      );

    const results = [];

    for (
      let index = 0;
      index < length;
      index += 1
    ) {
      const target =
        makeTarget({
          id:
            ids[index] ||
            null,

          label:
            labels[index] ||
            null,

          linguisticRole:
            roles[index] ||
            null,

          familyId:
            response?.familyId ||
            familyId ||
            null,

          source:
            "saved-supporting-target",

          explicit: true
        });

      if (
        target &&
        target.role !==
          "base word"
      ) {
        results.push(target);
      }
    }

    return uniqueBy(
      results,
      (target) =>
        target.id ||
        normalize(target.label)
    );
  }

  function firstSegmentation(
    segmentation
  ) {
    return String(
      segmentation || ""
    )
      .split(";")[0]
      .split("+")
      .map((part) =>
        part.trim()
      )
      .filter(Boolean);
  }

  function structuralTargetsFromWord(
    word
  ) {
    const meta =
      wordMeta(word);

    if (!meta) {
      return [];
    }

    return uniqueBy(
      firstSegmentation(
        meta.segmentation
      )
        .map((part) => {
          const candidates =
            morphemeCandidates({
              label: part
            });

          if (
            candidates.length === 1
          ) {
            const candidate =
              candidates[0];

            return makeTarget({
              id:
                candidate.id,

              label:
                candidate.label,

              meaning:
                candidate.meaning,

              type:
                candidate.type,

              source:
                "word-segmentation-fallback",

              structuralFallback:
                true
            });
          }

          return makeTarget({
            label: part,
            source:
              "word-segmentation-fallback",

            structuralFallback:
              true
          });
        })
        .filter(
          target =>
            target &&
            target.role !==
              "base word"
        ),

      (target) =>
        target.id ||
        normalize(target.label)
    );
  }

  function sameTarget(
    a,
    b
  ) {
    if (!a || !b) {
      return false;
    }

    if (
      a.id &&
      b.id &&
      normalize(a.id) ===
        normalize(b.id)
    ) {
      return true;
    }

    return (
      bare(a.label) ===
      bare(b.label)
    );
  }

  function resolve({
    explicitTarget = null,
    response = null,
    activity = null,
    word = null,
    familyId = null
  } = {}) {
    const resolvedWord =
      word ||
      response?.word ||
      null;

    const resolvedActivity =
      activity ||
      response?.skill ||
      null;

    const explicit =
      explicitTargetRecord(
        explicitTarget,
        familyId
      );

    const savedPrimary =
      savedPrimaryTarget(
        response,
        familyId
      );

    const savedSupporting =
      savedSupportingTargets(
        response,
        familyId
      );

    const structural =
      structuralTargetsFromWord(
        resolvedWord
      );

    const primary =
      explicit ||
      savedPrimary ||
      null;

    const supportingPool =
      savedSupporting.length
        ? savedSupporting
        : structural;

    const supporting =
      uniqueBy(
        supportingPool.filter(
          (target) =>
            !sameTarget(
              target,
              primary
            )
        ),
        (target) =>
          target.id ||
          normalize(target.label)
      );

    const directActivity =
      DIRECT_TARGET_ACTIVITIES
        .has(
          resolvedActivity
        );

    /*
      If a direct activity somehow contains exactly one
      explicit supporting target but no saved primary,
      we still do NOT silently promote it. The missing
      primary metadata should be repaired upstream.
    */
    const needsPrimarySelection =
      !primary &&
      (
        supporting.length > 0 ||
        Boolean(resolvedWord)
      );

    const ambiguousMultiPart =
      !primary &&
      supporting.length > 1;

    const notes = [];

    if (explicit) {
      notes.push(
        "Primary target came from the explicit next-session target."
      );
    } else if (savedPrimary) {
      notes.push(
        "Primary target came from saved primary-target metadata."
      );
    } else if (
      needsPrimarySelection
    ) {
      notes.push(
        "No explicit primary target was saved; the resolver did not guess one."
      );
    }

    if (
      !savedSupporting.length &&
      structural.length
    ) {
      notes.push(
        "Supporting structure came from the word inventory segmentation fallback."
      );
    }

    if (
      directActivity &&
      !primary
    ) {
      notes.push(
        "A direct-target activity is missing primary-target metadata and should be repaired upstream."
      );
    }

    return {
      activity:
        resolvedActivity,

      word:
        resolvedWord,

      familyId:
        familyId ||
        response?.familyId ||
        null,

      primary,

      supporting,

      allTargets:
        primary
          ? [
              primary,
              ...supporting
            ]
          : supporting,

      primarySource:
        primary?.source ||
        null,

      needsPrimarySelection,

      ambiguousMultiPart,

      usedStructuralFallback:
        !savedSupporting.length &&
        structural.length > 0,

      notes
    };
  }

  function resolveFromGuidance(
    guidance
  ) {
    return resolve({
      explicitTarget:
        guidance?.nextWork
          ?.target ||
        null,

      response:
        guidance?.lastWork
          ?.latestResponse ||
        null,

      activity:
        guidance?.nextWork
          ?.activity ||
        guidance?.lastWork
          ?.activity ||
        null,

      word:
        guidance?.nextWork
          ?.word ||
        guidance?.lastWork
          ?.word ||
        null,

      familyId:
        guidance?.nextWork
          ?.familyId ||
        guidance?.lastWork
          ?.familyId ||
        null
    });
  }

  window.FirstVoloInstructionalTargetResolver = {
    DIRECT_TARGET_ACTIVITIES,
    wordMeta,
    exactMorpheme,
    makeTarget,
    savedPrimaryTarget,
    savedSupportingTargets,
    structuralTargetsFromWord,
    resolve,
    resolveFromGuidance
  };

})();
