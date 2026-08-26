"use strict";

(function (root) {
  const STORAGE_KEY =
    "firstVoloMorphologyProgressV1";

  const LEGACY_IDS =
    new Set([
      "un",
      "ly",
      "ant-ent"
    ]);

  function asArray(value) {
    return Array.isArray(value)
      ? value
      : [];
  }

  function currentMorphemeIds() {
    return new Set(
      asArray(
        root.FIRST_VOLO_MORPHEME_INVENTORY
      )
        .map((entry) => entry?.id)
        .filter(Boolean)
    );
  }

  function normalizeWord(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function getWordSenseIds(word) {
    const normalized =
      normalizeWord(word);

    if (!normalized) {
      return [];
    }

    const record =
      asArray(
        root.FIRST_VOLO_WORD_INVENTORY
      ).find(
        (entry) =>
          normalizeWord(entry?.word) ===
          normalized
      );

    return asArray(
      record?.targetSenseIds
    ).filter(Boolean);
  }

  function resolveLegacyId(
    value,
    {
      word = null
    } = {}
  ) {
    if (!value) {
      return null;
    }

    const raw =
      String(value).trim();

    if (
      currentMorphemeIds().has(raw)
    ) {
      return raw;
    }

    if (raw === "ly") {
      return "ly-adverb";
    }

    if (raw === "un") {
      const matches =
        getWordSenseIds(word).filter(
          (id) =>
            id === "un-negation" ||
            id === "un-reversative"
        );

      return matches.length === 1
        ? matches[0]
        : null;
    }

    if (raw === "ant-ent") {
      const matches =
        getWordSenseIds(word).filter(
          (id) =>
            id === "ant-ent-agent" ||
            id === "ant-ent-adjective"
        );

      return matches.length === 1
        ? matches[0]
        : null;
    }

    return null;
  }

  function preserveField(
    record,
    sourceField,
    legacyField
  ) {
    if (
      !Object.prototype.hasOwnProperty.call(
        record,
        legacyField
      )
    ) {
      const value =
        record?.[sourceField];

      record[legacyField] =
        Array.isArray(value)
          ? value.slice()
          : value;
    }
  }

  function migratePrimaryTarget(
    response
  ) {
    const current =
      response?.primaryTargetId;

    if (
      !LEGACY_IDS.has(current)
    ) {
      return false;
    }

    preserveField(
      response,
      "primaryTargetId",
      "legacyPrimaryTargetId"
    );

    const resolved =
      resolveLegacyId(
        current,
        {
          word: response?.word
        }
      );

    response.primaryTargetId =
      resolved;

    if (!resolved) {
      preserveField(
        response,
        "primaryTarget",
        "legacyPrimaryTarget"
      );

      response.primaryTarget =
        null;
    }

    return true;
  }

  function migrateItemId(
    response
  ) {
    const current =
      response?.itemId;

    if (
      !LEGACY_IDS.has(current)
    ) {
      return false;
    }

    preserveField(
      response,
      "itemId",
      "legacyItemId"
    );

    response.itemId =
      resolveLegacyId(
        current,
        {
          word: response?.word
        }
      );

    return true;
  }

  function migrateSupportingIds(
    response
  ) {
    const originalIds =
      asArray(
        response?.supportingTargetIds
      );

    if (
      !originalIds.some(
        (id) =>
          LEGACY_IDS.has(id)
      )
    ) {
      return false;
    }

    preserveField(
      response,
      "supportingTargetIds",
      "legacySupportingTargetIds"
    );

    const migratedIds = [];
    let unresolvedLegacy = false;

    originalIds.forEach((id) => {
      if (
        !LEGACY_IDS.has(id)
      ) {
        migratedIds.push(id);
        return;
      }

      const resolved =
        resolveLegacyId(
          id,
          {
            word: response?.word
          }
        );

      if (resolved) {
        migratedIds.push(resolved);
      } else {
        unresolvedLegacy = true;
      }
    });

    response.supportingTargetIds =
      [
        ...new Set(
          migratedIds.filter(Boolean)
        )
      ];

    if (unresolvedLegacy) {
      preserveField(
        response,
        "supportingTargets",
        "legacySupportingTargets"
      );

      preserveField(
        response,
        "supportingTargetRoles",
        "legacySupportingTargetRoles"
      );

      response.supportingTargets = [];
      response.supportingTargetRoles = [];
    }

    return true;
  }

  function migrateResponse(
    response
  ) {
    if (
      !response ||
      typeof response !== "object"
    ) {
      return false;
    }

    let changed = false;

    changed =
      migratePrimaryTarget(
        response
      ) || changed;

    changed =
      migrateItemId(
        response
      ) || changed;

    changed =
      migrateSupportingIds(
        response
      ) || changed;

    return changed;
  }

  function migrateData(data) {
    if (
      !data ||
      !Array.isArray(data.students)
    ) {
      return {
        data,
        changed: false,
        migratedResponses: 0
      };
    }

    let changed = false;
    let migratedResponses = 0;

    data.students.forEach(
      (student) => {
        asArray(
          student?.sessions
        ).forEach(
          (session) => {
            asArray(
              session?.responses
            ).forEach(
              (response) => {
                if (
                  migrateResponse(
                    response
                  )
                ) {
                  changed = true;
                  migratedResponses += 1;
                }
              }
            );
          }
        );
      }
    );

    return {
      data,
      changed,
      migratedResponses
    };
  }

  function migrateStoredProgress() {
    try {
      const storage =
        root.localStorage;

      if (!storage) {
        return {
          changed: false,
          migratedResponses: 0
        };
      }

      const raw =
        storage.getItem(
          STORAGE_KEY
        );

      if (!raw) {
        return {
          changed: false,
          migratedResponses: 0
        };
      }

      const parsed =
        JSON.parse(raw);

      const result =
        migrateData(parsed);

      if (result.changed) {
        storage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            result.data
          )
        );
      }

      return result;
    } catch (error) {
      console.warn(
        "Could not migrate saved First Volo morphology progress.",
        error
      );

      return {
        changed: false,
        migratedResponses: 0,
        error
      };
    }
  }

  root.FirstVoloProgressCompatibility = {
    STORAGE_KEY,
    resolveLegacyId,
    migrateResponse,
    migrateData,
    migrateStoredProgress
  };

  migrateStoredProgress();

  root.addEventListener?.(
    "storage",
    (event) => {
      if (
        event.key ===
        STORAGE_KEY
      ) {
        migrateStoredProgress();
      }
    }
  );
})(window);
