"use strict";

/*
  First Volo Morphology — Persistent Family Printable Readiness V1.3

  Resource guidance, not mastery.
  PORT / STRUCT / TRACT family printables use root-family progression.
  COOK / VIEW are base-word centers for affix work and are triggered ONLY by
  matching affix progress. COOK Roll & Build is likewise affix-triggered.
  Once Ready, the status stays saved until explicit Clear Progress.
  Completed is a separate educator-controlled status.

  V1.1 safety correction:
  When progressClearedAt exists, evidence at or before that timestamp is ignored.
  This prevents old sessions from immediately re-earning Ready after Clear Progress.
*/

(function initFamilyPrintableReadiness(root) {
  const STORAGE_KEY = "firstVoloMorphologyProgressV1";

  const ACTIVITY_SEQUENCE = Object.freeze([
    "learn","find","hunt","meaning","morpheme",
    "break","infer","build","use","change"
  ]);

  const REGISTRY = Object.freeze(
    [
  {
    "id": "cook-family",
    "family": "COOK",
    "flight": "Flight A",
    "title": "COOK Affix Practice Printable",
    "kind": "affix-practice",
    "triggerMode": "affix",
    "targetIds": ["pre", "re", "over", "under", "ed", "ing", "er-or", "s-es"],
    "minActivity": "break",
    "filename": "COOK-flight-A-color.pdf",
    "href": "printables/COOK-flight-A-color.pdf"
  },
  {
    "id": "cook-roll-build",
    "family": "COOK",
    "flight": "Flight A",
    "title": "COOK Roll & Build",
    "kind": "roll-build",
    "triggerMode": "affix",
    "targetIds": ["pre", "re", "over", "under", "ed", "ing", "er-or", "s-es"],
    "minActivity": "build",
    "filename": "COOK-roll-and-build.pdf",
    "href": "printables/COOK-roll-and-build.pdf"
  },
  {
    "id": "view-family",
    "family": "VIEW",
    "flight": "Flight A",
    "title": "VIEW Affix Practice Printable",
    "kind": "affix-practice",
    "triggerMode": "affix",
    "targetIds": ["pre", "re", "ed", "ing", "er-or", "able-ible", "s-es"],
    "minActivity": "break",
    "filename": "VIEW-flight-A-color.pdf",
    "href": "printables/VIEW-flight-A-color.pdf"
  },
  {
    "id": "port-family",
    "family": "PORT",
    "flight": "Flight B",
    "title": "PORT Family Printable",
    "kind": "family",
    "minActivity": "break",
    "filename": "PORT-flight-B-color.pdf",
    "href": "printables/PORT-flight-B-color.pdf"
  },
  {
    "id": "port-roll-build",
    "family": "PORT",
    "flight": "Flight B",
    "title": "PORT Roll & Build",
    "kind": "roll-build",
    "minActivity": "build",
    "filename": "PORT-roll-and-build.pdf",
    "href": "printables/PORT-roll-and-build.pdf"
  },
  {
    "id": "struct-family",
    "family": "STRUCT",
    "flight": "Flight B",
    "title": "STRUCT Family Printable",
    "kind": "family",
    "minActivity": "break",
    "filename": "STRUCT-flight-B-color.pdf",
    "href": "printables/STRUCT-flight-B-color.pdf"
  },
  {
    "id": "tract-family",
    "family": "TRACT",
    "flight": "Flight B",
    "title": "TRACT Family Printable",
    "kind": "family",
    "minActivity": "break",
    "filename": "TRACT-flight-B-color.pdf",
    "href": "printables/TRACT-flight-B-color.pdf"
  }
].map(item => Object.freeze(item))
  );

  const RESOURCE_BY_ID = new Map(REGISTRY.map(item => [item.id, item]));
  const FAMILY_NAMES = new Set(REGISTRY.map(item => item.family));

  const arr = value => Array.isArray(value) ? value : [];

  function normalizeFamily(value) {
    const family = String(value || "").trim().toUpperCase();
    return FAMILY_NAMES.has(family) ? family : null;
  }

  function normalizeTarget(value) {
    const normalized = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[‐‑‒–—−]/g, "-")
      .replace(/^-+|-+$/g, "");

    const aliases = {
      "able": "able-ible",
      "ible": "able-ible",
      "able/ible": "able-ible",
      "able, ible": "able-ible",
      "or": "er-or",
      "er/or": "er-or",
      "er, or": "er-or",
      "er-agent": "er-or",
      "or-agent": "er-or",
      "s": "s-es",
      "es": "s-es",
      "s/es": "s-es",
      "s, es": "s-es"
    };

    return aliases[normalized] || normalized;
  }


  function targetFromEvidence(response) {
    return [
      response?.primaryTargetId,
      response?.targetId,
      response?.primaryTarget,
      response?.target
    ]
      .map(normalizeTarget)
      .find(Boolean) ||
      null;
  }

  function activityIndex(value) {
    return ACTIVITY_SEQUENCE.indexOf(
      String(value || "").trim().toLowerCase()
    );
  }


  function targetDisplayLabel(targetId) {
    const labels = {
      "pre": "pre-",
      "re": "re-",
      "over": "over-",
      "under": "under-",
      "ed": "-ed",
      "ing": "-ing",
      "er-or": "-er/-or",
      "s-es": "-s/-es",
      "able-ible": "-able/-ible"
    };

    return labels[targetId] || targetId;
  }

  function evidenceTimestamp(session, response) {
    return String(
      response?.recordedAt ||
      response?.completedAt ||
      session?.completedAt ||
      session?.startedAt ||
      session?.createdAt ||
      ""
    );
  }

  function evidenceIsAfterClear(student, session, response) {
    const clearedAt = String(student?.progressClearedAt || "");
    if (!clearedAt) return true;

    const timestamp = evidenceTimestamp(session, response);

    /*
      If evidence is undated after an explicit clear, do not let it
      resurrect readiness. New normal progress records are timestamped.
    */
    if (!timestamp) return false;

    return timestamp > clearedAt;
  }

  function familyFromEvidence(session, response) {
    const explicit = [
      response?.familyId,
      response?.family,
      response?.materialFamily,
      session?.familyId,
      session?.family,
      session?.materialFamily
    ].map(normalizeFamily).find(Boolean);

    if (explicit) return explicit;

    const targets = [
      response?.primaryTargetId,
      response?.targetId,
      response?.primaryTarget,
      response?.target
    ].map(normalizeTarget).filter(Boolean);

    for (const target of targets) {
      if (["port","struct","tract","cook","view"].includes(target)) {
        return target.toUpperCase();
      }
    }

    return null;
  }

  function deriveEligibilityEvidence(student) {
    const evidence = new Map();

    function addEvidence(resource, details) {
      const current =
        evidence.get(resource.id) || {
          resourceId: resource.id,
          triggerMode:
            resource.triggerMode ||
            "family",
          targetIds: new Set(),
          activities: new Set(),
          family: resource.family
        };

      if (details.targetId) {
        current.targetIds.add(details.targetId);
      }

      if (details.activity) {
        current.activities.add(details.activity);
      }

      evidence.set(resource.id, current);
    }

    for (const session of arr(student?.sessions)) {
      const responses = arr(session?.responses);
      const rows = responses.length ? responses : [null];

      for (const response of rows) {
        if (!evidenceIsAfterClear(student, session, response)) {
          continue;
        }

        const activity = response?.skill || session?.activity || "";
        const current = activityIndex(activity);

        if (current < 0) {
          continue;
        }

        const targetId = targetFromEvidence(response);
        const family = familyFromEvidence(session, response);

        for (const resource of REGISTRY) {
          const minimum = activityIndex(resource.minActivity);

          if (minimum < 0 || current < minimum) {
            continue;
          }

          if (resource.triggerMode === "affix") {
            const allowedTargets =
              Array.isArray(resource.targetIds)
                ? resource.targetIds.map(normalizeTarget)
                : [];

            if (targetId && allowedTargets.includes(targetId)) {
              addEvidence(
                resource,
                {
                  targetId,
                  activity
                }
              );
            }

            continue;
          }

          if (family && resource.family === family) {
            addEvidence(
              resource,
              {
                targetId,
                activity
              }
            );
          }
        }
      }
    }

    return new Map(
      [...evidence.entries()].map(
        ([resourceId, details]) => [
          resourceId,
          {
            resourceId,
            triggerMode: details.triggerMode,
            family: details.family,
            targetIds: [...details.targetIds],
            targetLabels:
              [...details.targetIds]
                .map(targetDisplayLabel),
            activities:
              [...details.activities]
          }
        ]
      )
    );
  }


  function deriveEligibleResourceIds(student) {
    return new Set(
      deriveEligibilityEvidence(student)
        .keys()
    );
  }

  function normalizeStatusMap(student) {
    if (!student || typeof student !== "object") return {};

    const existing = student.familyPrintableReadiness;
    const map =
      existing &&
      typeof existing === "object" &&
      !Array.isArray(existing)
        ? existing
        : {};

    const clearedAt = String(student.progressClearedAt || "");

    if (clearedAt) {
      Object.keys(map).forEach(id => {
        const readyAt = String(map[id]?.readyAt || "");

        if (!readyAt || readyAt <= clearedAt) {
          delete map[id];
        }
      });
    }

    student.familyPrintableReadiness = map;
    return map;
  }

  function resourcesForStudent(student) {
    const map = normalizeStatusMap(student);

    return REGISTRY
      .filter(resource => map[resource.id]?.ready === true)
      .map(resource => ({
        ...resource,
        status: {...map[resource.id]}
      }));
  }

  function refreshStudent(student, now = new Date().toISOString()) {
    if (!student) return {changed:false, resources:[]};

    const before = JSON.stringify(student.familyPrintableReadiness || {});
    const map = normalizeStatusMap(student);
    const eligibility =
      deriveEligibilityEvidence(
        student
      );

    eligibility.forEach((details, id) => {
      const resource = RESOURCE_BY_ID.get(id);
      const existing = map[id];

      if (existing?.ready === true) {
        /*
          Backfill/explain an already-earned status without resetting readyAt.
          This also lets the explanation expand as more relevant progress
          becomes available.
        */
        existing.readyEvidenceTargetIds =
          details.targetIds;
        existing.readyEvidenceTargetLabels =
          details.targetLabels;
        existing.readyEvidenceActivities =
          details.activities;
        return;
      }

      map[id] = {
        resourceId: id,
        ready: true,
        readyAt: now,
        readyFromActivity: resource?.minActivity || null,
        readyEvidenceTargetIds:
          details.targetIds,
        readyEvidenceTargetLabels:
          details.targetLabels,
        readyEvidenceActivities:
          details.activities,
        completed: Boolean(existing?.completed),
        completedAt: existing?.completedAt || null
      };
    });

    return {
      changed: before !== JSON.stringify(map),
      resources: resourcesForStudent(student)
    };
  }

  function setCompleted(student, resourceId, completed, now = new Date().toISOString()) {
    if (!student || !RESOURCE_BY_ID.has(resourceId)) return false;

    const map = normalizeStatusMap(student);
    const status = map[resourceId];

    if (!status || status.ready !== true) return false;

    status.completed = Boolean(completed);
    status.completedAt = completed ? now : null;
    return true;
  }

  function readLocal() {
    try {
      return JSON.parse(root.localStorage?.getItem(STORAGE_KEY) || "{}");
    } catch (error) {
      console.warn("Could not read printable readiness progress.", error);
      return {};
    }
  }

  function activeFromData(data) {
    return arr(data?.students).find(
      student => student?.id === data?.activeStudentId
    ) || null;
  }

  function getActiveStudent() {
    return (
      root.FirstVoloProgress?.getActiveStudent?.() ||
      root.FirstVoloActivityProgress?.getActiveStudent?.() ||
      activeFromData(readLocal())
    );
  }

  function saveFallback(student) {
    const data = readLocal();
    const index = arr(data.students).findIndex(item => item?.id === student?.id);

    if (index < 0) return false;

    data.students[index] = student;
    root.localStorage?.setItem(STORAGE_KEY, JSON.stringify(data));
    root.FirstVoloMorphologyCloud?.queueSync?.();

    if (
      typeof root.CustomEvent === "function" &&
      typeof root.dispatchEvent === "function"
    ) {
      root.dispatchEvent(new root.CustomEvent("firstvoloprogresschange"));
    }

    return true;
  }

  function saveActiveStudent(student) {
    if (root.FirstVoloProgress?.save) {
      root.FirstVoloProgress.save();
      return true;
    }

    if (root.FirstVoloActivityProgress?.save) {
      root.FirstVoloActivityProgress.save();
      return true;
    }

    return saveFallback(student);
  }

  function refreshActiveStudent() {
    const student = getActiveStudent();

    if (!student) {
      return {student:null, changed:false, resources:[]};
    }

    const result = refreshStudent(student);

    if (result.changed) {
      saveActiveStudent(student);
    }

    return {student, ...result};
  }

  function setActiveCompleted(resourceId, completed) {
    const student = getActiveStudent();
    if (!student) return false;

    if (!setCompleted(student, resourceId, completed)) {
      return false;
    }

    saveActiveStudent(student);
    return true;
  }

  const api = Object.freeze({
    STORAGE_KEY,
    ACTIVITY_SEQUENCE,
    REGISTRY,
    evidenceTimestamp,
    evidenceIsAfterClear,
    targetDisplayLabel,
    deriveEligibilityEvidence,
    deriveEligibleResourceIds,
    refreshStudent,
    resourcesForStudent,
    setCompleted,
    getActiveStudent,
    refreshActiveStudent,
    setActiveCompleted
  });

  root.FirstVoloFamilyPrintableReadiness = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(
  typeof window !== "undefined" ? window : globalThis
);
