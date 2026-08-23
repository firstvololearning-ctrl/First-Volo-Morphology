"use strict";

/*
  First Volo Morphology
  Exact Educator-Facing Linguistic Roles

  PURPOSE
  -------
  The student-facing app intentionally groups some bases and
  Greek combining forms inside the broader blue "Roots" category.

  Teacher-facing instructional guidance must therefore NOT infer
  "root" from that category alone.

  Resolution order:
    1. exact role supplied by item/session metadata
    2. exact target/family role in this registry
    3. generic prefix/suffix type
    4. neutral "word part"

  Flight is NEVER used to infer linguistic role.
*/

(function initializeFirstVoloLinguisticRoles() {

  const TARGET_ROLES = Object.freeze({

    /*
      Explicit base-word families.
      Evidence:
      printable-configs/cook.py
      printable-configs/view.py
    */
    cook: "base word",
    view: "base word",


    /*
      Explicit Greek combining forms.
      Evidence:
      - site About language explicitly identifies
        bio, geo, micro, tele
      - connected-text target metadata explicitly
        identifies bio, tele, scop/scope, therm
    */
    bio: "Greek combining form",
    geo: "Greek combining form",
    micro: "Greek combining form",
    tele: "Greek combining form",
    scop: "Greek combining form",
    therm: "Greek combining form",


    /*
      Exact roots already used as roots in
      teacher-facing / connected-text metadata.
    */
    struct: "root",
    tract: "root",
    aud: "root",
    sequ: "root",
    terr: "root",
    vert: "root",

    /*
      PORT family contains both a root (port)
      and a Greek combining form (tele).
      The family printable therefore uses the
      mixed heading ROOT / GREEK COMBINING FORM.
    */
    port: "root"
  });


  const TARGET_ALIASES = Object.freeze({
    scope: "scop",
    "scop/scope": "scop"
  });


  const FAMILY_ROLES = Object.freeze({
    COOK: "base word",
    VIEW: "base word"
  });


  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[‐-‒–—−]/g, "-")
      .replace(/^-+|-+$/g, "");
  }


  function canonicalTarget(value) {
    const normalized =
      normalize(value);

    return (
      TARGET_ALIASES[normalized] ||
      normalized
    );
  }


  function normalizeRole(value) {
    const role =
      String(value || "")
        .trim();

    if (!role) {
      return null;
    }

    const lower =
      role.toLowerCase();

    const canonical = {
      "base": "base word",
      "base word": "base word",
      "root": "root",
      "greek combining form":
        "Greek combining form",
      "combining form":
        "Greek combining form",
      "prefix": "prefix",
      "suffix": "suffix",
      "word part": "word part",
      "word structure": "word structure"
    };

    return canonical[lower] || role;
  }


  function exactTargetRole({
    targetId = null,
    targetLabel = null
  } = {}) {
    const candidates = [
      targetId,
      targetLabel
    ]
      .map(canonicalTarget)
      .filter(Boolean);

    for (const candidate of candidates) {
      if (TARGET_ROLES[candidate]) {
        return TARGET_ROLES[candidate];
      }
    }

    return null;
  }


  function exactFamilyRole(
    familyId = null
  ) {
    if (!familyId) {
      return null;
    }

    return (
      FAMILY_ROLES[
        String(familyId)
          .trim()
          .toUpperCase()
      ] || null
    );
  }


  function resolveRole({
    linguisticRole = null,
    targetId = null,
    targetLabel = null,
    familyId = null,
    targetType = null
  } = {}) {

    /*
      1. Item/session metadata wins.
    */
    const supplied =
      normalizeRole(
        linguisticRole
      );

    if (supplied) {
      return supplied;
    }


    /*
      2. Exact target registry.
    */
    const targetRole =
      exactTargetRole({
        targetId,
        targetLabel
      });

    if (targetRole) {
      return targetRole;
    }


    /*
      3. Exact family registry.
    */
    const familyRole =
      exactFamilyRole(
        familyId
      );

    if (familyRole) {
      return familyRole;
    }


    /*
      4. Prefix and suffix are safe
         generic inventory types.
    */
    if (targetType === "prefix") {
      return "prefix";
    }

    if (targetType === "suffix") {
      return "suffix";
    }


    /*
      Deliberately DO NOT convert
      targetType === "root" to "root".

      The student-facing Roots category
      contains roots, bases, and Greek
      combining forms.
    */
    return "word part";
  }


  window.FirstVoloLinguisticRoles = {
    TARGET_ROLES,
    TARGET_ALIASES,
    FAMILY_ROLES,
    normalizeRole,
    canonicalTarget,
    exactTargetRole,
    exactFamilyRole,
    resolveRole
  };

})();
