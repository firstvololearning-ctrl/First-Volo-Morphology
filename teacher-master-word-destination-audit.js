"use strict";

/*
  First Volo Morphology
  Master Word Destination / Decision Audit

  Purpose
  -------
  Build one rerunnable, source-derived map of:
    word -> target -> protection -> Flight -> activity -> stage -> destination

  This audit deliberately distinguishes:
    ACTUAL_FIXED                  fixed protected assessment/transfer placement
    AUTHORED_ELIGIBLE             authored ordinary digital item, available when filters match
    AUTHORED_FILTERED_PROTECTED   still present in source, but central runtime protection blocks it
    GENERATED_ELIGIBLE            generated from canonical inventory/runtime eligibility
    ELIGIBLE_DYNAMIC              teacher-led word can be selected dynamically
    HISTORY_DEPENDENT             Retrieve can reuse a previously encountered saved word
    NOT_APPLICABLE                target/activity is intentionally not applicable

  It does NOT create a second instructional source of truth. It reads the
  current repo and reports what the current code/data say.
*/

const fs = require("fs");
const path = require("path");
const vm = require("vm");

global.window = global;

const ROOT = process.cwd();
const AUDIT_VERSION = "master-word-destination-decision-audit-v1.3.3";

function fail(message) {
  console.error(`STOP: ${message}`);
  process.exit(1);
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function requireLocal(rel, optional = false) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    if (optional) return null;
    fail(`Required file is missing: ${rel}`);
  }

  try {
    return require(full);
  } catch (error) {
    if (optional) {
      console.warn(`WARN: Could not load ${rel}: ${error.message}`);
      return null;
    }
    throw error;
  }
}

function read(rel, optional = false) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    if (optional) return "";
    fail(`Required file is missing: ${rel}`);
  }
  return fs.readFileSync(full, "utf8");
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeWord(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[‐‑‒–—−]/g, "-");
}

function normalizeTarget(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[‐‑‒–—−]/g, "-")
    .replace(/\s+/g, "")
    .replace(/^-+|-+$/g, "");
}

function bandToFlight(value) {
  const text = String(value || "");
  if (/2\s*-\s*3/.test(text)) return "A";
  if (/4\s*-\s*5/.test(text)) return "B";
  if (/6\s*-\s*8/.test(text)) return "C";
  return null;
}

function roleForTarget(target) {
  if (target?.type === "prefix") return "prefix";
  if (target?.type === "suffix") return "suffix";
  if (target?.type === "root") return "root";
  return "word part";
}

function unique(values) {
  return [...new Set(asArray(values).filter(v => v !== null && v !== undefined && v !== ""))];
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key);
}

function studyModeForType(type) {
  if (type === "prefix") return "prefixes";
  if (type === "root") return "roots";
  if (type === "suffix") return "suffixes";
  return "combinations";
}

function studyModeForTargetId(id) {
  return studyModeForType(targetById(id)?.type);
}

function vocabLevelFor(rec, item = null) {
  const explicit =
    item?.vocabLevel ||
    item?.vocabularyLevel ||
    item?.level ||
    null;

  if (explicit) return String(explicit);

  const levels = [...(rec?.vocabLevels || [])].sort();
  return levels.length ? levels.join(" | ") : "unspecified";
}

function buildPatternForPool(name) {
  if (name === "buildWords") return "prefix+root";
  if (name === "rootSuffixBuildWords") return "root+suffix";
  if (name === "prefixRootSuffixBuildWords") return "prefix+root+suffix";
  return name || "unknown-build-pattern";
}

function escapeCsv(value) {
  const text = Array.isArray(value)
    ? value.join(" | ")
    : value && typeof value === "object"
      ? JSON.stringify(value)
      : String(value ?? "");

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function writeCsv(filePath, rows, columns) {
  const lines = [
    columns.join(","),
    ...rows.map(row =>
      columns.map(column => escapeCsv(row[column])).join(",")
    )
  ];
  fs.writeFileSync(filePath, lines.join("\n") + "\n", "utf8");
}

function wordBoundaryContains(text, word) {
  const escaped = String(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^A-Za-z])${escaped}([^A-Za-z]|$)`, "i").test(text);
}

/*
  Extract a top-level array/object literal assigned with:
    const NAME = [...]
    const NAME = {...}

  This avoids executing browser UI files in Node.
*/
function extractConstLiteral(source, name) {
  const marker = new RegExp(`\\bconst\\s+${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*=\\s*`, "m");
  const match = marker.exec(source);
  if (!match) return null;

  let i = match.index + match[0].length;
  while (i < source.length && /\s/.test(source[i])) i += 1;

  const opener = source[i];
  if (opener !== "[" && opener !== "{") return null;
  const closer = opener === "[" ? "]" : "}";

  const stack = [closer];
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let j = i + 1; j < source.length; j += 1) {
    const ch = source[j];
    const next = source[j + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        j += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      j += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      j += 1;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "[" || ch === "{") {
      stack.push(ch === "[" ? "]" : "}");
      continue;
    }

    if (ch === "]" || ch === "}") {
      if (stack[stack.length - 1] !== ch) {
        throw new Error(`Unbalanced literal while extracting ${name}`);
      }

      stack.pop();

      if (!stack.length) {
        return source.slice(i, j + 1);
      }
    }
  }

  throw new Error(`Could not find end of literal for ${name}`);
}

function parseConstLiteral(source, name, findings, sourceFile) {
  const literal = extractConstLiteral(source, name);
  if (!literal) {
    findings.push({
      severity: "REVIEW",
      category: "source-extraction",
      word: "",
      destination: "",
      message: `Could not find const ${name} in ${sourceFile}.`
    });
    return null;
  }

  try {
    return vm.runInNewContext(`(${literal})`, Object.create(null), {
      timeout: 2000
    });
  } catch (error) {
    findings.push({
      severity: "REVIEW",
      category: "source-extraction",
      word: "",
      destination: "",
      message: `Could not parse const ${name} in ${sourceFile}: ${error.message}`
    });
    return null;
  }
}

function flattenStrings(value, result = []) {
  if (typeof value === "string") {
    result.push(value);
    return result;
  }

  if (Array.isArray(value)) {
    value.forEach(item => flattenStrings(item, result));
    return result;
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach(item => flattenStrings(item, result));
  }

  return result;
}

/* ================================================================
   LOAD CANONICAL RUNTIME SOURCES
   ================================================================ */

requireLocal("word-inventory.js");
requireLocal("token-sets.js");
requireLocal("instructional-protection-registry.js");
requireLocal("transfer-challenge-data.js");

/*
  transfer-challenge-data.js exports a frozen API object.
  instructional-check-transfer.js adds compatibility helpers to that API
  when it initializes. In the browser the project load order/state allows
  that integration, but a standalone Node audit must give the Check Transfer
  module a mutable top-level wrapper first.
*/
if (
  global.FirstVoloTransferChallenge &&
  Object.isFrozen(global.FirstVoloTransferChallenge)
) {
  global.FirstVoloTransferChallenge = {
    ...global.FirstVoloTransferChallenge
  };
}

requireLocal("instructional-check-transfer.js");
requireLocal("instructional-teacher-word-extensions.js", true);
requireLocal("instructional-word-selector.js");
requireLocal("instructional-material-families.js", true);
requireLocal("instructional-session-item-bank.js");

const targets = asArray(global.FIRST_VOLO_MORPHEME_INVENTORY);
const masterWords = asArray(global.FIRST_VOLO_WORD_INVENTORY);
const tokenSets = asArray(global.FIRST_VOLO_TOKEN_SETS);
const protection = global.FirstVoloInstructionalProtection || {};
const migrationApi = global.FirstVoloTransferChallenge || {};
const checkTransferApi = global.FirstVoloCheckTransfer || {};
const extensionsApi = global.FirstVoloTeacherWordExtensions || {};
const selector = global.FirstVoloInstructionalWordSelector || {};
const bank = global.FirstVoloSessionItemBank || {};
const familiesApi = global.FirstVoloInstructionalMaterialFamilies || {};

if (targets.length !== 96) {
  fail(`Expected 96 canonical targets; found ${targets.length}.`);
}
if (!masterWords.length) fail("FIRST_VOLO_WORD_INVENTORY is empty.");
if (typeof bank.buildItems !== "function") fail("Teacher-led item bank is unavailable.");
if (typeof bank.activityApplicability !== "function") fail("Teacher-led activity applicability API is unavailable.");
if (typeof selector.selectCandidates !== "function") fail("Instructional word selector is unavailable.");

/* ================================================================
   FLIGHT MAP
   ================================================================ */

const collectionToFlight = {
  Foundation: "A",
  Expansion: "B",
  Advanced: "C"
};

const targetFlight = new Map();
const targetSetMembership = new Map();

for (const set of tokenSets) {
  const flight =
    collectionToFlight[set.collection] ||
    bandToFlight(set.introBand);

  for (const id of asArray(set.morphemeIds)) {
    if (!targetSetMembership.has(id)) {
      targetSetMembership.set(id, []);
    }
    targetSetMembership.get(id).push({
      flight,
      collection: set.collection,
      setId: set.id,
      introBand: set.introBand
    });

    if (flight) {
      targetFlight.set(id, flight);
    }
  }
}

const findings = [];

for (const target of targets) {
  const memberships = targetSetMembership.get(target.id) || [];
  if (memberships.length !== 1) {
    findings.push({
      severity: "HARD",
      category: "target-flight",
      word: "",
      destination: "",
      message: `${target.id} has ${memberships.length} Flight memberships; expected exactly 1.`
    });
  }
}

function targetById(id) {
  return targets.find(item => item.id === id) || null;
}

function flightForTarget(id) {
  return targetFlight.get(id) || null;
}

/* ================================================================
   PROTECTION
   ================================================================ */

const formalWords = new Set(asArray(protection.formalPrePost).map(normalizeWord));
const migrationWords = new Set(asArray(protection.migrationChallenge).map(normalizeWord));
const checkWords = new Set(
  [
    ...asArray(protection.connectedTextTransfer),
    ...asArray(checkTransferApi.getReservedWords?.())
  ].map(normalizeWord)
);
const lexicalBlockWords = new Set(
  asArray(protection.instructionalLexicalFamilyBlocks).map(normalizeWord)
);

function protectionCategories(word) {
  const wanted = normalizeWord(word);
  const result = [];
  if (formalWords.has(wanted)) result.push("formal-pre-post");
  if (migrationWords.has(wanted)) result.push("migration-challenge");
  if (checkWords.has(wanted)) result.push("check-transfer");
  if (lexicalBlockWords.has(wanted)) result.push("lexical-family-instruction-block");
  return result;
}

function isProtected(word) {
  return protectionCategories(word).length > 0;
}

function overlap(a, b) {
  return [...a].filter(item => b.has(item));
}

for (const [label, values] of [
  ["formal vs migration", overlap(formalWords, migrationWords)],
  ["formal vs check-transfer", overlap(formalWords, checkWords)],
  ["migration vs check-transfer", overlap(migrationWords, checkWords)]
]) {
  if (values.length) {
    findings.push({
      severity: "HARD",
      category: "protected-pool-overlap",
      word: values.join(" | "),
      destination: "",
      message: `${label} overlap: ${values.join(", ")}`
    });
  }
}

/* ================================================================
   WORD UNIVERSE + TARGET RESOLUTION
   ================================================================ */

const masterByWord = new Map();
for (const entry of masterWords) {
  const key = normalizeWord(entry.word);
  if (!key) continue;
  if (!masterByWord.has(key)) masterByWord.set(key, []);
  masterByWord.get(key).push(entry);
}

const extensionByWord = new Map();
for (const [targetId, items] of Object.entries(extensionsApi.candidatesByTarget || {})) {
  for (const item of asArray(items)) {
    const key = normalizeWord(item.word);
    if (!key) continue;
    if (!extensionByWord.has(key)) extensionByWord.set(key, []);
    extensionByWord.get(key).push({
      ...item,
      _extensionTargetId: targetId
    });
  }
}

const targetCache = new Map();

function targetsForMasterEntry(entry) {
  const cacheKey = normalizeWord(entry?.word) + "::" + JSON.stringify(entry?.targetSenseIds || []);
  if (targetCache.has(cacheKey)) return targetCache.get(cacheKey);

  const found = [];

  for (const target of targets) {
    const resolution = {
      primary: {
        ...target,
        role: roleForTarget(target)
      },
      allTargets: [target]
    };

    let selections = [];
    try {
      selections = selector.selectCandidates({
        target: resolution.primary,
        targetMeta: target,
        objective: "learn",
        stage: "guided",
        candidates: [entry],
        isProtected: () => false
      });
    } catch (error) {
      findings.push({
        severity: "REVIEW",
        category: "target-resolution",
        word: entry.word,
        destination: "",
        message: `Selector error while resolving ${entry.word} to ${target.id}: ${error.message}`
      });
      continue;
    }

    if (
      selections.some(
        selection =>
          normalizeWord(selection.word) === normalizeWord(entry.word) &&
          !selection.item?._teacherLedExtension
      )
    ) {
      found.push(target.id);
    }
  }

  /*
    Exact sense IDs are authoritative when supplied.
    Add them even if a generic selector relationship is conservative.
  */
  for (const id of asArray(entry?.targetSenseIds)) {
    if (targetById(id) && !found.includes(id)) {
      found.push(id);
    }
  }

  const result = unique(found);
  targetCache.set(cacheKey, result);
  return result;
}

const wordRecords = new Map();

function ensureWord(word) {
  const key = normalizeWord(word);
  if (!key) return null;

  if (!wordRecords.has(key)) {
    wordRecords.set(key, {
      word: String(word).trim(),
      normalizedWord: key,
      sources: new Set(),
      targetIds: new Set(),
      practiceBands: new Set(),
      accessibilityBands: new Set(),
      vocabLevels: new Set(),
      transparency: new Set(),
      segmentations: new Set(),
      recommendedActivityUse: new Set(),
      reviewCaution: new Set(),
      protection: new Set(),
      evidence: new Set()
    });
  }

  return wordRecords.get(key);
}

function absorbMasterEntry(entry) {
  const rec = ensureWord(entry.word);
  if (!rec) return;

  rec.sources.add("master-word-inventory");

  for (const id of targetsForMasterEntry(entry)) rec.targetIds.add(id);
  if (entry.practiceBand) rec.practiceBands.add(entry.practiceBand);
  if (entry.accessibilityBand) rec.accessibilityBands.add(entry.accessibilityBand);
  if (entry.vocabLevel) rec.vocabLevels.add(entry.vocabLevel);
  if (entry.transparency) rec.transparency.add(entry.transparency);
  if (entry.segmentation) rec.segmentations.add(entry.segmentation);
  if (entry.recommendedActivityUse) rec.recommendedActivityUse.add(entry.recommendedActivityUse);
  if (entry.reviewCaution) rec.reviewCaution.add(entry.reviewCaution);
}

for (const entry of masterWords) absorbMasterEntry(entry);

for (const [word, entries] of extensionByWord) {
  const rec = ensureWord(word);
  rec.sources.add("teacher-word-extension");
  for (const entry of entries) {
    if (entry._extensionTargetId) rec.targetIds.add(entry._extensionTargetId);
    if (entry.practiceBand) rec.practiceBands.add(entry.practiceBand);
    if (entry.accessibilityBand) rec.accessibilityBands.add(entry.accessibilityBand);
    if (entry.vocabLevel) rec.vocabLevels.add(entry.vocabLevel);
    if (entry.transparency) rec.transparency.add(entry.transparency);
    if (entry.segmentation) rec.segmentations.add(entry.segmentation);
    if (entry.reviewCaution) rec.reviewCaution.add(entry.reviewCaution);
  }
}

for (const set of [formalWords, migrationWords, checkWords, lexicalBlockWords]) {
  for (const word of set) ensureWord(word);
}

for (const rec of wordRecords.values()) {
  for (const category of protectionCategories(rec.word)) {
    rec.protection.add(category);
  }
}

/* ================================================================
   DESTINATION ROWS
   ================================================================ */

const destinations = [];

function addDestination(word, info = {}) {
  const rec = ensureWord(word);
  if (!rec) return;

  const wordMorphemeIds = unique([...rec.targetIds]);

  const instructionalTargetIds = unique(
    hasOwn(info, "instructionalTargetIds")
      ? asArray(info.instructionalTargetIds)
      : hasOwn(info, "targetIds")
        ? asArray(info.targetIds)
        : wordMorphemeIds
  );

  if (info.source) rec.sources.add(info.source);
  if (info.evidence) rec.evidence.add(info.evidence);

  for (const id of instructionalTargetIds) {
    if (targetById(id)) rec.targetIds.add(id);
  }

  const instructionalTargetLabels = instructionalTargetIds
    .map(id => targetById(id)?.label || id)
    .filter(Boolean);

  const canonicalFlights = unique(
    instructionalTargetIds.map(flightForTarget).filter(Boolean)
  );

  const practiceFlights = unique(
    [...rec.practiceBands].map(bandToFlight).filter(Boolean)
  );

  destinations.push({
    word: rec.word,
    normalizedWord: rec.normalizedWord,

    /*
      v1.3 separates the instructional target from the word's complete
      morpheme signature. targetIds remains as a compatibility alias for
      instructionalTargetIds so older downstream inspection scripts do not
      silently reinterpret every morpheme in a word as a required activity cell.
    */
    targetIds: instructionalTargetIds.join(" | "),
    instructionalTargetIds: instructionalTargetIds.join(" | "),
    instructionalTargetLabels: instructionalTargetLabels.join(" | "),
    wordMorphemeIds: wordMorphemeIds.join(" | "),
    targetLabels: instructionalTargetLabels.join(" | "),
    canonicalTargetFlights: canonicalFlights.join(" | "),
    practiceFlights: practiceFlights.join(" | "),

    runtimePoolType: info.runtimePoolType || "",
    runtimePool: info.runtimePool || "",
    studyMode: info.studyMode || "",
    runtimePattern: info.runtimePattern || "",
    runtimeFlight: info.runtimeFlight || "",
    runtimeVocabLevel: info.runtimeVocabLevel || "",

    channel: info.channel || "",
    activity: info.activity || "",
    stage: info.stage || "",
    destination: info.destination || "",
    status: info.status || "",
    protection: protectionCategories(rec.word).join(" | "),
    source: info.source || "",
    evidence: info.evidence || "",
    reason: info.reason || "",
    detail: info.detail || ""
  });
}

/* ================================================================
   FORMAL PRE / POST — FIXED DESTINATIONS
   ================================================================ */

function auditAssessmentFile(flight) {
  const file = `flight-${flight.toLowerCase()}-assessment.js`;
  const source = read(file);
  const forms = parseConstLiteral(source, "FORMS", findings, file);

  if (!forms) return;

  for (const [formKey, form] of Object.entries(forms)) {
    const destination =
      formKey === "pre"
        ? `Pretest ${flight}`
        : formKey === "post"
          ? `Posttest ${flight}`
          : `${formKey} ${flight}`;

    const serialized = JSON.stringify(form);

    for (const word of formalWords) {
      if (wordBoundaryContains(serialized, word)) {
        addDestination(word, {
          channel: "Formal Assessment",
          activity: formKey === "pre" ? "Pretest" : "Posttest",
          stage: "Fixed Form",
          destination,
          status: "ACTUAL_FIXED",
          source: file,
          evidence: `protected formal word found in ${formKey} form source`,
          reason: "Reserved formal-assessment word; blocked from ordinary instruction/practice."
        });
      }
    }
  }
}

["A", "B", "C"].forEach(auditAssessmentFile);

for (const word of formalWords) {
  const count = destinations.filter(
    row =>
      row.normalizedWord === word &&
      row.channel === "Formal Assessment"
  ).length;

  if (!count) {
    findings.push({
      severity: "HARD",
      category: "formal-assessment-placement",
      word,
      destination: "",
      message: "Word is protected as formal Pre/Post but was not found in any parsed Flight A/B/C assessment form."
    });
  }
}

/* ================================================================
   MIGRATION CHALLENGE — FIXED PROTECTED DESTINATIONS
   ================================================================ */

for (const [band, flight] of Object.entries(migrationApi.FLIGHTS || {})) {
  const flightId = flight.flightId || bandToFlight(band);
  for (const [formId, form] of Object.entries(flight.forms || {})) {
    for (const item of asArray(form.items)) {
      const ids = unique([
        ...asArray(item.primaryTargetIds),
        ...asArray(item.supportingTargetIds)
      ]);

      addDestination(item.word, {
        targetIds: ids,
        channel: "Migration Challenge",
        activity: item.skill || "Transfer",
        stage: form.label || formId,
        destination: `Migration Challenge · Flight ${flightId} · ${form.label || formId}`,
        status: "ACTUAL_FIXED",
        source: "transfer-challenge-data.js",
        evidence: item.id || "",
        reason: "Reserved Migration Challenge word; blocked from ordinary instruction/practice."
      });
    }
  }
}

const migrationApiWords = new Set(
  asArray(migrationApi.getReservedWords?.()).map(normalizeWord)
);

for (const word of migrationWords) {
  if (!migrationApiWords.has(word)) {
    findings.push({
      severity: "HARD",
      category: "migration-registry-sync",
      word,
      destination: "Migration Challenge",
      message: "Protection registry marks this word as Migration Challenge, but the Migration API does not return it as reserved."
    });
  }
}

/* ================================================================
   CHECK TRANSFER — FIXED PROTECTED DESTINATIONS
   ================================================================ */

for (const item of asArray(checkTransferApi.items)) {
  const ids = asArray(item.targetIds);
  const flightIds = unique(ids.map(flightForTarget).filter(Boolean));
  const flightText = flightIds.length ? flightIds.join("/") : "Custom";

  addDestination(item.word, {
    targetIds: ids,
    channel: "Teacher-Led Online/Printable",
    activity: "Check Transfer",
    stage: "Check Transfer",
    destination: `Check Transfer · Flight ${flightText}`,
    status: "ACTUAL_FIXED",
    source: "instructional-check-transfer.js",
    evidence: `${item.id || ""} · grades ${asArray(item.gradeBands).join("/")}`,
    reason: "Protected Check Transfer word; used only after the independent first-attempt rule and blocked from ordinary practice."
  });
}

/* ================================================================
   DIGITAL STUDENT PRACTICE — RUNTIME-POOL MODEL (v1.3)
   ================================================================ */

const scriptSource = read("script.js");
const useSource = read("use-it.js", true);
const changeSource = read("change-it.js", true);

/*
  Fail visibly if the runtime selection architecture drifts away from the
  model encoded below. These are intentionally broad structural checks,
  not formatting-sensitive source snapshots.
*/
const runtimeModelChecks = [
  {
    label: "Find/Figure It Out grade+vocabulary filtering",
    ok:
      /function\s+filterWordsBySelectedFilters\s*\(/.test(scriptSource) &&
      /mode\s*===\s*["']find["']/.test(scriptSource) &&
      /mode\s*===\s*["']infer["']/.test(scriptSource)
  },
  {
    label: "Learn vocabulary-filtered examples",
    ok: /function\s+getLearnExamplesForSelectedVocabulary\s*\(/.test(scriptSource)
  },
  {
    label: "Word Hunt whole-question grade/vocabulary eligibility",
    ok:
      /function\s+isWordHuntEligibleForSelectedGrade\s*\(/.test(scriptSource) &&
      /function\s+isWordHuntEligibleForSelectedVocabulary\s*\(/.test(scriptSource)
  },
  {
    label: "Build pattern selector",
    ok:
      /function\s+getActiveBuildWords\s*\(/.test(scriptSource) &&
      /rootSuffixBuildWords/.test(scriptSource) &&
      /prefixRootSuffixBuildWords/.test(scriptSource) &&
      /buildWords/.test(scriptSource)
  },
  {
    label: "Use It derives eligibility from active Build words",
    ok:
      !useSource ||
      /function\s+getUseItEligibleWords\s*\(/.test(useSource) &&
      /getActiveBuildWords\s*\(/.test(useSource)
  }
];

for (const check of runtimeModelChecks) {
  if (!check.ok) {
    findings.push({
      severity: "REVIEW",
      category: "audit-runtime-model-drift",
      word: "",
      destination: "Student Digital runtime architecture",
      message:
        `The v1.3 runtime-pool audit assumption was not found in current source: ${check.label}. Review the audit model before relying on pool-health results.`
    });
  }
}

const digitalTargetCollections = [
  ...asArray(parseConstLiteral(scriptSource, "prefixes", findings, "script.js")),
  ...asArray(parseConstLiteral(scriptSource, "roots", findings, "script.js")),
  ...asArray(parseConstLiteral(scriptSource, "suffixes", findings, "script.js"))
];

function digitalStatus(word) {
  return isProtected(word)
    ? "AUTHORED_FILTERED_PROTECTED"
    : "AUTHORED_ELIGIBLE";
}

function digitalReason(word, activity) {
  if (isProtected(word)) {
    return `Authored in ${activity} source, but central ordinary-practice filtering blocks protected words at runtime.`;
  }
  return `Authored for ${activity}; available when the learner's actual runtime pool filters match.`;
}

/* Learn — target-level example availability, not a word-morpheme-combination cell. */
for (const target of digitalTargetCollections) {
  const id = target?.id || null;
  const flight = id ? flightForTarget(id) || "?" : "?";
  const studyMode = id ? studyModeForTargetId(id) : studyModeForType(target?.type);

  for (const word of asArray(target?.examples)) {
    const rec = ensureWord(word);
    const vocab = vocabLevelFor(rec);
    const runtimePool = `Learn · ${studyMode} · Flight ${flight} · target:${id || target?.label || "unresolved"} · vocab:${vocab}`;
    addDestination(word, {
      instructionalTargetIds: id ? [id] : [],
      channel: "Student Digital",
      activity: "Learn",
      stage: "Authored Example",
      destination: `Flight ${flight} Digital Learn`,
      status: digitalStatus(word),
      source: "script.js",
      evidence: `Learn examples for ${id || target?.label || "unresolved target"}`,
      reason: digitalReason(word, "Learn"),
      runtimePoolType: "target-example-pool",
      runtimePool,
      studyMode,
      runtimeFlight: flight,
      runtimeVocabLevel: vocab
    });
  }
}

/* Find — selected from study-mode × Flight × vocabulary pools. */
for (const [name, studyMode] of [
  ["prefixFindQuestions", "prefixes"],
  ["rootFindQuestions", "roots"],
  ["suffixFindQuestions", "suffixes"]
]) {
  const questions = asArray(parseConstLiteral(scriptSource, name, findings, "script.js"));
  for (const q of questions) {
    if (!q?.word) continue;
    const id = q.itemId || q.targetId || null;
    const rec = ensureWord(q.word);
    const practiceFlight =
      bandToFlight([...rec.practiceBands][0]) ||
      (id ? flightForTarget(id) : null) ||
      "?";
    const vocab = vocabLevelFor(rec, q);
    const runtimePool = `Find · ${studyMode} · Flight ${practiceFlight} · vocab:${vocab}`;

    addDestination(q.word, {
      instructionalTargetIds: id ? [id] : [],
      channel: "Student Digital",
      activity: "Find",
      stage: "Authored Question",
      destination: `Flight ${practiceFlight} Digital Find`,
      status: digitalStatus(q.word),
      source: "script.js",
      evidence: `${name}${id ? ` · ${id}` : ""}`,
      reason: digitalReason(q.word, "Find"),
      runtimePoolType: "study-flight-vocab-pool",
      runtimePool,
      studyMode,
      runtimeFlight: practiceFlight,
      runtimeVocabLevel: vocab
    });
  }
}

/* Word Hunt — whole-question gate; target ID is the question target. */
const huntQuestions = asArray(
  parseConstLiteral(scriptSource, "wordHuntQuestions", findings, "script.js")
);

for (const q of huntQuestions) {
  const id = q.itemId || q.targetId || q.morphemeId || null;
  const words = asArray(q.words);
  const correct = words.filter(item => item?.correct);
  const questionBlocked = words.some(item => item?.word && isProtected(item.word));
  const studyMode = studyModeForType(q.type || targetById(id)?.type);

  const correctFlight =
    unique(
      correct
        .map(item => {
          const rec = ensureWord(item?.word);
          return bandToFlight([...rec.practiceBands][0]);
        })
        .filter(Boolean)
    )[0] ||
    (id ? flightForTarget(id) : null) ||
    "?";

  const runtimePool = `Word Hunt · ${studyMode} · Flight ${correctFlight} · target:${id || q.target || "unresolved"}`;

  for (const item of words) {
    if (!item?.word) continue;
    const rec = ensureWord(item.word);

    addDestination(item.word, {
      instructionalTargetIds: item.correct && id ? [id] : [],
      channel: "Student Digital",
      activity: "Word Hunt",
      stage: item.correct ? "Target Word" : "Distractor",
      destination: `Flight ${correctFlight} Digital Word Hunt`,
      status: questionBlocked
        ? "QUESTION_FILTERED_PROTECTED"
        : digitalStatus(item.word),
      source: "script.js",
      evidence: `${id || q.target || "unresolved target"} · ${item.correct ? "correct" : "distractor"}`,
      reason: questionBlocked
        ? "The entire Word Hunt question is filtered because at least one authored word is protected, including distractors."
        : digitalReason(item.word, "Word Hunt"),
      runtimePoolType: "whole-question",
      runtimePool,
      studyMode,
      runtimeFlight: correctFlight,
      runtimeVocabLevel: vocabLevelFor(rec, q)
    });
  }
}

/*
  Meaning and Word Part are target-level digital activities generated from
  the current morpheme study items. They do not have a fixed whole-word pool.
*/

/* Figure It Out — selected from study-mode × Flight × vocabulary pools. */
const inferQuestions = asArray(
  parseConstLiteral(scriptSource, "inferQuestions", findings, "script.js")
);

for (const q of inferQuestions) {
  if (!q?.word) continue;

  const explicitId = q.itemId || q.targetId || null;
  const rec = ensureWord(q.word);
  const practiceFlight =
    bandToFlight([...rec.practiceBands][0]) ||
    (explicitId ? flightForTarget(explicitId) : null) ||
    "?";
  const studyMode = studyModeForType(q.type || targetById(explicitId)?.type);
  const vocab = vocabLevelFor(rec, q);
  const runtimePool = `Figure It Out · ${studyMode} · Flight ${practiceFlight} · vocab:${vocab}`;

  addDestination(q.word, {
    instructionalTargetIds: explicitId ? [explicitId] : [],
    channel: "Student Digital",
    activity: "Figure It Out",
    stage: "Authored Question",
    destination: `Flight ${practiceFlight} Digital Figure It Out`,
    status: digitalStatus(q.word),
    source: "script.js",
    evidence: q.knownLabel || explicitId || "",
    reason: digitalReason(q.word, "Figure It Out"),
    runtimePoolType: "study-flight-vocab-pool",
    runtimePool,
    studyMode,
    runtimeFlight: practiceFlight,
    runtimeVocabLevel: vocab
  });
}

/* Break It Apart — generated eligible inventory × instructional target/study mode. */
for (const entry of masterWords) {
  if (!entry?.word) continue;

  const ids = targetsForMasterEntry(entry);
  const eligibleTargets = [];

  for (const id of ids) {
    const target = targetById(id);
    if (!target) continue;

    const applicability = bank.activityApplicability(target, "break");
    if (applicability?.applicable === false) continue;

    try {
      const selected = selector.selectCandidates({
        target: {
          ...target,
          role: roleForTarget(target)
        },
        targetMeta: target,
        objective: "break",
        stage: "guided",
        candidates: [entry],
        isProtected
      });

      if (selected.some(item => normalizeWord(item.word) === normalizeWord(entry.word))) {
        eligibleTargets.push(id);
      }
    } catch (error) {
      findings.push({
        severity: "REVIEW",
        category: "digital-break",
        word: entry.word,
        destination: "Digital Break It Apart",
        message: error.message
      });
    }
  }

  if (eligibleTargets.length) {
    const flight =
      bandToFlight(entry.practiceBand) ||
      flightForTarget(eligibleTargets[0]) ||
      "?";
    const modes = unique(eligibleTargets.map(studyModeForTargetId));
    const studyMode = modes.length === 1 ? modes[0] : "combinations";
    const vocab = entry.vocabLevel || "unspecified";
    const runtimePool = `Break It Apart · ${studyMode} · Flight ${flight} · vocab:${vocab}`;

    addDestination(entry.word, {
      instructionalTargetIds: eligibleTargets,
      channel: "Student Digital",
      activity: "Break It Apart",
      stage: "Generated from Inventory",
      destination: `Flight ${flight} Digital Break It Apart`,
      status: "GENERATED_ELIGIBLE",
      source: "word-inventory.js + instructional-word-selector.js",
      evidence: entry.segmentation || "",
      reason: "Canonical inventory word passes full-segmentation, protection, target, and activity-eligibility gates.",
      runtimePoolType: "generated-study-flight-vocab-pool",
      runtimePool,
      studyMode,
      runtimeFlight: flight,
      runtimeVocabLevel: vocab
    });
  }
}

/* Build Words — pattern × Flight × vocabulary pools, not one required cell per word morpheme signature. */
const buildPools = [];
const buildPatternsByWord = new Map();

for (const name of [
  "buildWords",
  "rootSuffixBuildWords",
  "prefixRootSuffixBuildWords"
]) {
  const pool = asArray(parseConstLiteral(scriptSource, name, findings, "script.js"));
  const pattern = buildPatternForPool(name);

  for (const item of pool) {
    if (!item?.word) continue;
    const annotated = { ...item, _poolName: name, _pattern: pattern };
    buildPools.push(annotated);

    const rec = ensureWord(item.word);
    const practiceFlight =
      bandToFlight([...rec.practiceBands][0]) ||
      unique([...rec.targetIds].map(flightForTarget).filter(Boolean))[0] ||
      "?";
    const vocab = vocabLevelFor(rec, item);
    const runtimePool = `Build Words · ${pattern} · Flight ${practiceFlight} · vocab:${vocab}`;

    if (!buildPatternsByWord.has(rec.normalizedWord)) {
      buildPatternsByWord.set(rec.normalizedWord, new Set());
    }
    buildPatternsByWord.get(rec.normalizedWord).add(pattern);

    addDestination(item.word, {
      instructionalTargetIds: [],
      channel: "Student Digital",
      activity: "Build Words",
      stage: "Authored Build Pool",
      destination: `Flight ${practiceFlight} Digital Build Words`,
      status: digitalStatus(item.word),
      source: "script.js",
      evidence: name,
      reason: digitalReason(item.word, "Build Words"),
      runtimePoolType: "build-pattern-flight-vocab-pool",
      runtimePool,
      studyMode: "combinations",
      runtimePattern: pattern,
      runtimeFlight: practiceFlight,
      runtimeVocabLevel: vocab
    });
  }
}

const buildWordSet = new Set(buildPools.map(item => normalizeWord(item.word)));

/* Use It — sentence availability is downstream of the active Build pool. */
const useBank =
  useSource
    ? parseConstLiteral(useSource, "useItSentenceBank", findings, "use-it.js")
    : null;

if (useBank && typeof useBank === "object") {
  for (const word of Object.keys(useBank)) {
    const rec = ensureWord(word);
    const practiceFlight =
      bandToFlight([...rec.practiceBands][0]) ||
      unique([...rec.targetIds].map(flightForTarget).filter(Boolean))[0] ||
      "?";
    const vocab = vocabLevelFor(rec);
    const patterns = [...(buildPatternsByWord.get(rec.normalizedWord) || [])];

    let status = digitalStatus(word);
    let reason = digitalReason(word, "Use It");

    if (!isProtected(word) && !buildWordSet.has(normalizeWord(word))) {
      status = "AUTHORED_NOT_IN_ACTIVE_BUILD_POOL";
      reason =
        "A Use It sentence is authored, but current Use It eligibility begins with the active Build pool; this word is not in the extracted Build pools.";
    }

    const patternLabels = patterns.length ? patterns : ["not-in-active-build-pool"];

    for (const pattern of patternLabels) {
      const runtimePool = `Use It · ${pattern} · Flight ${practiceFlight} · vocab:${vocab}`;

      addDestination(word, {
        instructionalTargetIds: [],
        channel: "Student Digital",
        activity: "Use It",
        stage: "Sentence Bank",
        destination: `Flight ${practiceFlight} Digital Use It`,
        status,
        source: "use-it.js",
        evidence: String(useBank[word]),
        reason,
        runtimePoolType: "build-derived-sentence-pool",
        runtimePool,
        studyMode: "combinations",
        runtimePattern: pattern,
        runtimeFlight: practiceFlight,
        runtimeVocabLevel: vocab
      });
    }
  }
}

/* Change It — whole authored family/question gate. */
const changeQuestions =
  changeSource
    ? asArray(parseConstLiteral(changeSource, "changeItQuestions", findings, "change-it.js"))
    : [];

for (const q of changeQuestions) {
  const choices = asArray(q.choices);
  const questionBlocked = choices.some(word => isProtected(word));
  const flight = bandToFlight(q.practiceBand) || "?";
  const vocab = q.vocabLevel || q.vocabularyLevel || "unspecified";
  const runtimePool = `Change It · Flight ${flight} · family:${q.family || "unlabeled"}`;

  for (const word of choices) {
    addDestination(word, {
      instructionalTargetIds: [],
      channel: "Student Digital",
      activity: "Change It",
      stage: word === q.answer ? "Correct Answer" : "Choice",
      destination: `Flight ${flight} Digital Change It`,
      status: questionBlocked
        ? "QUESTION_FILTERED_PROTECTED"
        : "AUTHORED_ELIGIBLE",
      source: "change-it.js",
      evidence: q.family || "",
      reason: questionBlocked
        ? "The entire Change It question is filtered because at least one choice is protected."
        : "Authored Change It word-family choice; available when study-mode, Flight, and vocabulary filters match.",
      runtimePoolType: "whole-question",
      runtimePool,
      studyMode: "combinations",
      runtimeFlight: flight,
      runtimeVocabLevel: vocab
    });
  }
}

/* ================================================================
   TEACHER-LED ONLINE / PRINTABLE — DYNAMIC DECISION PATH
   ================================================================ */

const teacherActivities = [
  ["learn", "Learn"],
  ["find", "Find"],
  ["hunt", "Word Hunt"],
  ["meaning", "Meaning"],
  ["morpheme", "Word Part"],
  ["break", "Break It Apart"],
  ["infer", "Figure It Out"],
  ["build", "Build Words"],
  ["use", "Use It"],
  ["change", "Change It"]
];

const targetExceptions = [];

for (const target of targets) {
  const flight = flightForTarget(target.id) || "?";
  const targetResolution = {
    primary: {
      ...target,
      role: roleForTarget(target)
    },
    allTargets: [target]
  };

  for (const [activityId, activityLabel] of teacherActivities) {
    const applicability = bank.activityApplicability(target, activityId);

    if (applicability?.applicable === false) {
      targetExceptions.push({
        targetId: target.id,
        targetLabel: target.label,
        flight,
        activity: activityLabel,
        status: "NOT_APPLICABLE",
        reason: applicability.reason || ""
      });
      continue;
    }

    let recipes = [];

    try {
      recipes = bank.buildItems({
        targetResolution,
        activity: activityId,
        gradeBand: null,
        vocabLevel: null,
        limit: 999
      });
    } catch (error) {
      findings.push({
        severity: "HARD",
        category: "teacher-bank-runtime",
        word: "",
        destination: `Flight ${flight} Teacher-Led ${activityLabel}`,
        message: `${target.id}: ${error.message}`
      });
      continue;
    }

    for (const recipe of recipes) {
      if (recipe?.word) {
        if (isProtected(recipe.word)) {
          findings.push({
            severity: "HARD",
            category: "protected-leakage-teacher",
            word: recipe.word,
            destination: `Flight ${flight} Teacher-Led ${activityLabel} · Part A`,
            message: "Protected word escaped into ordinary teacher-led Part A."
          });
        }

        addDestination(recipe.word, {
          targetIds: [target.id],
          channel: "Teacher-Led Online/Printable",
          activity: activityLabel,
          stage: "Word Part · Part A",
          destination: `Flight ${flight} Teacher-Led ${activityLabel} · Word Part · Part A`,
          status: "ELIGIBLE_DYNAMIC",
          source: recipe.source || "instructional-session-item-bank.js",
          evidence: recipe.id || "",
          reason: "Ordinary unprotected activity-specific recipe selected by the current teacher-led item bank."
        });

        addDestination(recipe.word, {
          targetIds: [target.id],
          channel: "Teacher-Led Online/Printable",
          activity: activityLabel,
          stage: "Optional Practice Set",
          destination: `Flight ${flight} Teacher-Led ${activityLabel} · Optional Practice Set`,
          status: "ELIGIBLE_DYNAMIC",
          source: recipe.source || "instructional-session-item-bank.js",
          evidence: recipe.id || "",
          reason: "Eligible ordinary recipe can be used in the optional practice stage when time/need remains and freshness rules permit."
        });

        addDestination(recipe.word, {
          targetIds: [target.id],
          channel: "Teacher-Led Online/Printable",
          activity: activityLabel,
          stage: "Retrieve",
          destination: `Flight ${flight} Teacher-Led ${activityLabel} · Retrieve`,
          status: "HISTORY_DEPENDENT",
          source: "instructional-session-planner.js",
          evidence: "saved-student-work retrieval rule",
          reason: "Retrieve has no fixed word pool. A previously encountered saved word may reappear on cumulative retrieval; the exact target can also be retrieved without a whole word."
        });
      }

      if (recipe?.applyWord) {
        if (isProtected(recipe.applyWord)) {
          findings.push({
            severity: "HARD",
            category: "protected-leakage-teacher-apply",
            word: recipe.applyWord,
            destination: `Flight ${flight} Teacher-Led ${activityLabel} · Part B`,
            message: "Protected word escaped into ordinary teacher-led Part B / Apply."
          });
        }

        addDestination(recipe.applyWord, {
          targetIds: [target.id],
          channel: "Teacher-Led Online/Printable",
          activity: activityLabel,
          stage: "Word Part · Part B",
          destination: `Flight ${flight} Teacher-Led ${activityLabel} · Word Part · Part B`,
          status: "ELIGIBLE_DYNAMIC",
          source: recipe.applySource || "instructional-session-item-bank.js",
          evidence: `${recipe.id || ""} · ${recipe.applyKind || ""}`,
          reason: "Fresh Apply word selected separately from Part A when an appropriate word/freshness family is available."
        });

        addDestination(recipe.applyWord, {
          targetIds: [target.id],
          channel: "Teacher-Led Online/Printable",
          activity: activityLabel,
          stage: "Optional Practice Set",
          destination: `Flight ${flight} Teacher-Led ${activityLabel} · Optional Practice Set`,
          status: "ELIGIBLE_DYNAMIC",
          source: recipe.applySource || "instructional-session-item-bank.js",
          evidence: `${recipe.id || ""} · Apply`,
          reason: "Fresh ordinary Apply candidate can remain available for later optional practice when sequencing/freshness permits."
        });
      }
    }
  }
}

/* ================================================================
   FLIGHT PRINT INSTRUCTIONAL MATS / MATERIALS
   ================================================================ */

function collectFamilyWordObjects(value, pathParts = [], result = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      collectFamilyWordObjects(item, [...pathParts, String(index)], result)
    );
    return result;
  }

  if (!value || typeof value !== "object") {
    return result;
  }

  if (typeof value.word === "string" && value.word.trim()) {
    result.push({
      word: value.word,
      path: pathParts.join("."),
      object: value
    });
  }

  for (const [key, child] of Object.entries(value)) {
    collectFamilyWordObjects(child, [...pathParts, key], result);
  }

  return result;
}

for (const [familyId, family] of Object.entries(familiesApi.families || {})) {
  const flightMatch = String(family.flight || "").match(/Flight\s+([ABC])/i);
  const flight = flightMatch ? flightMatch[1].toUpperCase() : "?";

  for (const item of collectFamilyWordObjects(family)) {
    const rec = ensureWord(item.word);
    const ids = [...rec.targetIds];

    if (isProtected(item.word)) {
      findings.push({
        severity: "HARD",
        category: "protected-leakage-print-family",
        word: item.word,
        destination: `Flight ${flight} Print Instructional Mats and Materials · ${familyId}`,
        message: "Protected whole word appears in ordinary shared print-family configuration."
      });
    }

    addDestination(item.word, {
      targetIds: ids,
      channel: "Print Instructional Mats and Materials",
      activity: "Shared Family Resource",
      stage: familyId,
      destination: `Flight ${flight} Print Instructional Mats and Materials · ${familyId}`,
      status: "ACTUAL_SHARED_RESOURCE",
      source: family.sourceConfig || "instructional-material-families.js",
      evidence: item.path,
      reason: "Word appears in the shared family configuration used to keep interactive and printable materials aligned."
    });
  }
}

/* ================================================================
   BLOCKED ORDINARY DESTINATIONS FOR PROTECTED WORDS
   ================================================================ */

for (const rec of wordRecords.values()) {
  const categories = protectionCategories(rec.word);
  if (!categories.length) continue;

  for (const [activityId, activityLabel] of teacherActivities) {
    addDestination(rec.word, {
      targetIds: [...rec.targetIds],
      channel: "Ordinary Instruction / Practice",
      activity: activityLabel,
      stage: "Protection Rule",
      destination: `Ordinary ${activityLabel}`,
      status: "BLOCKED_PROTECTED",
      source: "instructional-protection-registry.js",
      evidence: categories.join(" | "),
      reason: "Protected words must not be selected for ordinary digital or teacher-led practice."
    });
  }
}

/* ================================================================
   WORD-MASTER AGGREGATION
   ================================================================ */

const destinationsByWord = new Map();
for (const row of destinations) {
  const key = row.normalizedWord;
  if (!destinationsByWord.has(key)) destinationsByWord.set(key, []);
  destinationsByWord.get(key).push(row);
}

const wordMasterRows = [...wordRecords.values()]
  .map(rec => {
    const rows = destinationsByWord.get(rec.normalizedWord) || [];
    const ids = [...rec.targetIds].sort();
    const targetLabels = ids
      .map(id => targetById(id)?.label || id)
      .filter(Boolean);

    const canonicalFlights = unique(
      ids.map(flightForTarget).filter(Boolean)
    ).sort();

    const actual = unique(
      rows
        .filter(row =>
          [
            "ACTUAL_FIXED",
            "AUTHORED_ELIGIBLE",
            "GENERATED_ELIGIBLE",
            "ACTUAL_SHARED_RESOURCE"
          ].includes(row.status)
        )
        .map(row => row.destination)
    ).sort();

    const dynamic = unique(
      rows
        .filter(row =>
          [
            "ELIGIBLE_DYNAMIC",
            "HISTORY_DEPENDENT"
          ].includes(row.status)
        )
        .map(row => row.destination)
    ).sort();

    const blocked = unique(
      rows
        .filter(row =>
          [
            "BLOCKED_PROTECTED",
            "AUTHORED_FILTERED_PROTECTED",
            "QUESTION_FILTERED_PROTECTED"
          ].includes(row.status)
        )
        .map(row => row.destination)
    ).sort();

    const sourceOnlyFiltered = unique(
      rows
        .filter(row =>
          row.status === "AUTHORED_FILTERED_PROTECTED" ||
          row.status === "QUESTION_FILTERED_PROTECTED"
        )
        .map(row => row.destination)
    ).sort();

    return {
      word: rec.word,
      sourceTypes: [...rec.sources].sort().join(" | "),
      targetIds: ids.join(" | "),
      targetLabels: targetLabels.join(" | "),
      canonicalTargetFlights: canonicalFlights.join(" | "),
      practiceBands: [...rec.practiceBands].sort().join(" | "),
      practiceFlights: unique(
        [...rec.practiceBands].map(bandToFlight).filter(Boolean)
      ).sort().join(" | "),
      accessibilityBands: [...rec.accessibilityBands].sort().join(" | "),
      vocabLevels: [...rec.vocabLevels].sort().join(" | "),
      transparency: [...rec.transparency].sort().join(" | "),
      segmentation: [...rec.segmentations].sort().join(" | "),
      protection: [...rec.protection].sort().join(" | "),
      actualFixedOrAuthoredDestinations: actual.join(" || "),
      dynamicEligibleDestinations: dynamic.join(" || "),
      blockedDestinations: blocked.join(" || "),
      sourceOnlyButRuntimeFiltered: sourceOnlyFiltered.join(" || "),
      recommendedActivityUse: [...rec.recommendedActivityUse].join(" || "),
      reviewCaution: [...rec.reviewCaution].join(" || ")
    };
  })
  .sort((a, b) => a.word.localeCompare(b.word));

/* ================================================================
   STUDENT DIGITAL RUNTIME-POOL HEALTH (v1.3)
   ================================================================ */

const runtimePoolRows = [];
const protectedSourceCleanupRows = [];

/*
  Explicit Student Digital runtime combinations that are intentionally
  unavailable because the current canonical inventory does not contain
  an instructionally clean item for that exact pattern / Flight /
  vocabulary combination.

  Do not fill these with prefix + ordinary-base words merely to make a
  Prefix + Root pool nonempty.
*/
const intentionalStudentDigitalNAPools = [
  {
    activity: "Build Words",
    runtimePoolType: "build-pattern-flight-vocab-pool",
    runtimePool: "Build Words · prefix+root · Flight B · vocab:familiar",
    studyMode: "combinations",
    runtimePattern: "prefix+root",
    runtimeFlight: "B",
    runtimeVocabLevel: "familiar",
    reason:
      "Intentional N/A: no approved unprotected familiar Flight B word currently provides a clean canonical Prefix + Root build. Transparent prefix + ordinary-base words are not substituted because this path is explicitly labeled Prefix + Root."
  },
  {
    activity: "Use It",
    runtimePoolType: "build-derived-sentence-pool",
    runtimePool: "Use It · prefix+root · Flight B · vocab:familiar",
    studyMode: "combinations",
    runtimePattern: "prefix+root",
    runtimeFlight: "B",
    runtimeVocabLevel: "familiar",
    reason:
      "Intentional N/A downstream of the corresponding Prefix + Root Build Words pool; Use It begins with the active Build pool."
  }
];

const intentionalStudentDigitalNAByKey = new Map(
  intentionalStudentDigitalNAPools.map(item => [
    `${item.activity}|||${item.runtimePool}`,
    item
  ])
);

const runtimeGroups = new Map();
for (const row of destinations.filter(
  item => item.channel === "Student Digital" && item.runtimePool
)) {
  const key = `${row.activity}|||${row.runtimePool}`;
  if (!runtimeGroups.has(key)) runtimeGroups.set(key, []);
  runtimeGroups.get(key).push(row);
}

const viableStatuses = new Set([
  "AUTHORED_ELIGIBLE",
  "GENERATED_ELIGIBLE"
]);

for (const rows of runtimeGroups.values()) {
  const first = rows[0];
  const uniqueWords = unique(rows.map(row => row.normalizedWord));
  const viable = rows.filter(row => viableStatuses.has(row.status));
  const viableWords = unique(viable.map(row => row.normalizedWord));
  const protectedRows = rows.filter(row =>
    row.status === "AUTHORED_FILTERED_PROTECTED" ||
    row.status === "QUESTION_FILTERED_PROTECTED"
  );
  const protectedWords = unique(protectedRows.map(row => row.normalizedWord));
  const inactiveRows = rows.filter(row => row.status === "AUTHORED_NOT_IN_ACTIVE_BUILD_POOL");

  let operationalStatus = "VIABLE";
  let cleanupDisposition = "NO_PROTECTED_SOURCE_ROWS";
  let learnDisposition = "";
  let learnDispositionReason = "";

  const intentionalNA =
    intentionalStudentDigitalNAByKey.get(
      `${first.activity}|||${first.runtimePool}`
    );

  if (intentionalNA) {
    operationalStatus = "INTENTIONALLY_UNAVAILABLE";
    cleanupDisposition =
      protectedWords.length
        ? "REMOVE_PROTECTED_SOURCE_ROWS_INTENTIONAL_NA"
        : "INTENTIONAL_NA_NO_AUTHORED_SOURCE";
  } else if (first.activity === "Use It" && first.runtimePattern === "not-in-active-build-pool") {
    operationalStatus = "INACTIVE_SOURCE_ONLY";
    cleanupDisposition = "REMOVE_OR_ARCHIVE_INACTIVE_SOURCE";
  } else if (first.runtimePoolType === "whole-question") {
    if (rows.some(row => row.status === "QUESTION_FILTERED_PROTECTED")) {
      operationalStatus = "BLOCKED_WHOLE_QUESTION";
      cleanupDisposition = "REPAIR_QUESTION_BEFORE_SOURCE_CLEANUP";
    } else if (viableWords.length) {
      operationalStatus = "VIABLE";
      cleanupDisposition = protectedWords.length
        ? "POOL_REMAINS_VIABLE_AFTER_PROTECTED_REMOVAL"
        : "NO_PROTECTED_SOURCE_ROWS";
    }
  } else if (
    first.activity === "Learn" &&
    !viableWords.length &&
    protectedWords.length
  ) {
    /*
      Learn is not operationally empty when its selected-vocabulary
      example subpool is empty. The morpheme card still renders and
      explicitly reports that no examples are currently included for
      that vocabulary level.

      The remaining known cases have now been adjudicated. Distinguish
      stable intentional scarcity from lexical-development backlog so
      the audit does not present every empty example subpool as the same
      kind of unfinished problem.
    */
    const learnTargetId =
      String(first.runtimePool || "")
        .split("target:")[1]
        ?.split(" · ")[0]
        ?.trim() ||
      "";

    const learnDispositions = {
      "e-ex": {
        kind: "intentional-scarcity",
        status: "LEARN_EXAMPLE_SUBPOOL_INTENTIONAL_SCARCITY",
        reason:
          "Exact Familiar Learn examples are protected. The ordinary unprotected e-/ex- example currently available is Academic; do not relabel vocabulary categories simply to fill this Learn example subpool."
      },
      "ab": {
        kind: "intentional-scarcity",
        status: "LEARN_EXAMPLE_SUBPOOL_INTENTIONAL_SCARCITY",
        reason:
          "Exact Academic authored Learn examples are protected. The approved ordinary ab- word absent is Familiar; preserve its vocabulary classification rather than retagging it to fill this subpool."
      },
      "retro": {
        kind: "intentional-scarcity",
        status: "LEARN_EXAMPLE_SUBPOOL_INTENTIONAL_SCARCITY",
        reason:
          "The Academic authored Learn example is protected. The approved ordinary retro- word retrofit is Challenge; preserve Challenge as the stretch category rather than flattening it into Academic."
      },
      "port": {
        kind: "intentional-scarcity",
        status: "LEARN_EXAMPLE_SUBPOOL_INTENTIONAL_SCARCITY",
        reason:
          "The exact Flight B Academic authored Learn example is protected. Transportation is Academic but is intentionally practiced in Flight C; do not pull a cross-Flight word down only to fill this Learn subpool."
      },
      "aud": {
        kind: "intentional-scarcity",
        status: "LEARN_EXAMPLE_SUBPOOL_INTENTIONAL_SCARCITY",
        reason:
          "The Academic authored Learn example is protected. Approved ordinary aud words audio and audience are Familiar; preserve their vocabulary classifications rather than retagging them."
      },
      "able-ible": {
        kind: "intentional-scarcity",
        status: "LEARN_EXAMPLE_SUBPOOL_INTENTIONAL_SCARCITY",
        reason:
          "The authored Familiar Learn examples are protected. Ordinary unprotected -able/-ible options are Academic and/or later-Flight items; do not force-fill the early Familiar subpool."
      },
      "ant-ent-agent": {
        kind: "intentional-scarcity",
        status: "LEARN_EXAMPLE_SUBPOOL_INTENTIONAL_SCARCITY",
        reason:
          "Assistant is a protected Formal Pre/Post word and is the only current exact Familiar agent example. Pendant remains a pend target and must not be reassigned to the agent suffix merely because it ends in -ant."
      },
      "semi": {
        kind: "lexical-development-backlog",
        status: "LEARN_EXAMPLE_SUBPOOL_LEXICAL_BACKLOG",
        reason:
          "Source-cleared productive semi- candidates exist, but they still require instructional-role and accessibility adjudication before any word is promoted into the live Student Digital Learn inventory."
      },
      "er-or": {
        kind: "lexical-development-backlog",
        status: "LEARN_EXAMPLE_SUBPOOL_LEXICAL_BACKLOG",
        reason:
          "Source-cleared agent -er/-or candidates exist, but they still require instructional-role, accessibility, and placement adjudication before promotion into the live Student Digital Learn inventory."
      },
      "ize": {
        kind: "lexical-development-backlog",
        status: "LEARN_EXAMPLE_SUBPOOL_LEXICAL_BACKLOG",
        reason:
          "Source-cleared productive -ize candidates exist, but they still require instructional-role, accessibility, and suffix-sense fit adjudication before promotion into the live Student Digital Learn inventory."
      }
    };

    const learnDecision =
      learnDispositions[learnTargetId] ||
      null;

    if (learnDecision) {
      learnDisposition = learnDecision.kind;
      learnDispositionReason = learnDecision.reason;
      operationalStatus = learnDecision.status;
    } else {
      learnDisposition = "unclassified-coverage";
      learnDispositionReason =
        "The Learn morpheme card remains available, but this selected-vocabulary example subpool is empty after protection and has not yet received a specific disposition.";
      operationalStatus = "LEARN_EXAMPLE_SUBPOOL_EMPTY_AFTER_PROTECTION";
    }

    cleanupDisposition = "LEARN_CARD_REMAINS_AVAILABLE_EXAMPLE_COVERAGE_EMPTY";
  } else if (!viableWords.length && protectedWords.length) {
    operationalStatus = "EMPTY_AFTER_PROTECTION";
    cleanupDisposition = "PROTECTED_REMOVAL_WOULD_LEAVE_POOL_EMPTY";
  } else if (!viableWords.length && inactiveRows.length) {
    operationalStatus = "INACTIVE_SOURCE_ONLY";
    cleanupDisposition = "NOT_IN_ACTIVE_RUNTIME_POOL";
  } else if (viableWords.length === 1 && protectedWords.length) {
    operationalStatus = "VIABLE_ONE_WORD_AFTER_PROTECTION";
    cleanupDisposition = "PROTECTED_REMOVAL_LEAVES_ONE_VIABLE_WORD";
  } else if (viableWords.length && protectedWords.length) {
    operationalStatus = "VIABLE_AFTER_PROTECTION";
    cleanupDisposition = "POOL_REMAINS_VIABLE_AFTER_PROTECTED_REMOVAL";
  }

  const poolRow = {
    activity: first.activity,
    runtimePoolType: first.runtimePoolType,
    runtimePool: first.runtimePool,
    studyMode: first.studyMode,
    runtimePattern: first.runtimePattern,
    runtimeFlight: first.runtimeFlight,
    runtimeVocabLevel: first.runtimeVocabLevel,
    operationalStatus,
    cleanupDisposition,
    learnDisposition,
    learnDispositionReason,
    authoredRows: rows.length,
    uniqueWords: uniqueWords.length,
    viableRows: viable.length,
    viableWords: viableWords.length,
    protectedRows: protectedRows.length,
    protectedWords: protectedWords.length,
    inactiveRows: inactiveRows.length,
    viableWordList: viableWords.sort().join(" | "),
    protectedWordList: protectedWords.sort().join(" | ")
  };

  runtimePoolRows.push(poolRow);

  if (operationalStatus === "EMPTY_AFTER_PROTECTION") {
    findings.push({
      severity: "REVIEW",
      category: "student-digital-runtime-pool-empty-after-protection",
      word: protectedWords.sort().join(" | "),
      destination: first.runtimePool,
      message:
        "This actual Student Digital runtime pool has authored source rows but no viable unprotected word after the protection gate. Do not solve this by treating the word's complete morpheme signature as a required target cell; review the pool itself for replacement vocabulary, fallback behavior, or intentional unavailability."
    });
  }

  if (
    String(operationalStatus)
      .startsWith("LEARN_EXAMPLE_SUBPOOL_")
  ) {
    let category =
      "student-digital-learn-example-subpool-empty-after-protection";

    if (
      operationalStatus ===
      "LEARN_EXAMPLE_SUBPOOL_INTENTIONAL_SCARCITY"
    ) {
      category =
        "student-digital-learn-example-subpool-intentional-scarcity";
    } else if (
      operationalStatus ===
      "LEARN_EXAMPLE_SUBPOOL_LEXICAL_BACKLOG"
    ) {
      category =
        "student-digital-learn-example-subpool-lexical-backlog";
    }

    findings.push({
      severity: "INFO",
      category,
      word: protectedWords.sort().join(" | "),
      destination: first.runtimePool,
      message:
        learnDispositionReason ||
        "The Learn morpheme card remains available. For this selected vocabulary level, all authored examples are protected, so the card displays its no-examples message. Treat this as example-coverage information rather than an unavailable Student Digital activity."
    });
  }

  for (const row of protectedRows.filter(item => item.protection)) {
    protectedSourceCleanupRows.push({
      word: row.word,
      protection: row.protection,
      source: row.source,
      activity: row.activity,
      runtimePoolType: row.runtimePoolType,
      runtimePool: row.runtimePool,
      studyMode: row.studyMode,
      runtimePattern: row.runtimePattern,
      runtimeFlight: row.runtimeFlight,
      runtimeVocabLevel: row.runtimeVocabLevel,
      cleanupDisposition,
      viableWordsRemaining: viableWords.length,
      viableWordList: viableWords.sort().join(" | "),
      destination: row.destination
    });
  }
}

/*
  Preserve intentional N/A pools in the audit even after their dead
  protected authored rows are removed from source.
*/
const observedRuntimePoolKeys = new Set(
  runtimePoolRows.map(
    row => `${row.activity}|||${row.runtimePool}`
  )
);

for (const item of intentionalStudentDigitalNAPools) {
  const key = `${item.activity}|||${item.runtimePool}`;

  if (observedRuntimePoolKeys.has(key)) {
    continue;
  }

  runtimePoolRows.push({
    activity: item.activity,
    runtimePoolType: item.runtimePoolType,
    runtimePool: item.runtimePool,
    studyMode: item.studyMode,
    runtimePattern: item.runtimePattern,
    runtimeFlight: item.runtimeFlight,
    runtimeVocabLevel: item.runtimeVocabLevel,
    operationalStatus: "INTENTIONALLY_UNAVAILABLE",
    cleanupDisposition: "INTENTIONAL_NA_NO_AUTHORED_SOURCE",
    authoredRows: 0,
    uniqueWords: 0,
    viableRows: 0,
    viableWords: 0,
    protectedRows: 0,
    protectedWords: 0,
    inactiveRows: 0,
    viableWordList: "",
    protectedWordList: ""
  });

  findings.push({
    severity: "INFO",
    category: "student-digital-runtime-pool-intentionally-unavailable",
    word: "",
    destination: item.runtimePool,
    message: item.reason
  });
}

runtimePoolRows.sort((a, b) =>
  a.activity.localeCompare(b.activity) ||
  a.runtimePool.localeCompare(b.runtimePool)
);

protectedSourceCleanupRows.sort((a, b) =>
  a.activity.localeCompare(b.activity) ||
  a.runtimePool.localeCompare(b.runtimePool) ||
  a.word.localeCompare(b.word)
);

/* ================================================================
   FINDINGS / SUMMARY
   ================================================================ */

const digitalProtectedSourceRows = destinations.filter(
  row =>
    row.channel === "Student Digital" &&
    Boolean(row.protection) &&
    (
      row.status === "AUTHORED_FILTERED_PROTECTED" ||
      row.status === "QUESTION_FILTERED_PROTECTED"
    )
);

for (const row of digitalProtectedSourceRows) {
  findings.push({
    severity: "INFO",
    category: "protected-word-authored-but-filtered",
    word: row.word,
    destination: row.destination,
    message:
      "Protected word remains authored in the digital source but is classified as runtime-filtered. Keep the protection gate intact."
  });
}

/*
  Surface whole-question Word Hunt protection accurately.

  The live runtime rejects the entire question when ANY authored word is
  protected, including a distractor. v1.2 therefore records all rows in
  that question as QUESTION_FILTERED_PROTECTED and emits one review
  finding per blocked question.
*/
const blockedWordHuntGroups = new Map();

for (const row of destinations.filter(
  item =>
    item.channel === "Student Digital" &&
    item.activity === "Word Hunt" &&
    item.source === "script.js" &&
    item.status === "QUESTION_FILTERED_PROTECTED"
)) {
  const key =
    String(row.evidence || "")
      .split(" · ")[0]
      .trim() ||
    row.destination ||
    row.targetIds ||
    "unknown-word-hunt";

  if (!blockedWordHuntGroups.has(key)) {
    blockedWordHuntGroups.set(key, []);
  }

  blockedWordHuntGroups.get(key).push(row);
}

for (const [questionKey, rows] of blockedWordHuntGroups) {
  const protectedRows = rows.filter(row => row.protection);

  findings.push({
    severity: "REVIEW",
    category: "word-hunt-question-blocked-protected",
    word: unique(protectedRows.map(row => row.word)).join(" | "),
    destination:
      rows[0]?.destination ||
      `Student Digital Word Hunt · ${questionKey}`,
    message:
      `Word Hunt question "${questionKey}" is fully filtered because at least one authored word is protected. ` +
      `Protected trigger(s): ${unique(protectedRows.map(row => `${row.word} [${row.protection}]`)).join(", ")}. ` +
      "Replace protected target/distractor words with validated unprotected alternatives if this question should remain live."
  });
}

/*
  Change It also filters the whole family/question when any choice is
  protected. Emit one review finding per blocked family rather than
  treating each local family member as a separate master-inventory gap.
*/
const blockedChangeItGroups = new Map();

for (const row of destinations.filter(
  item =>
    item.channel === "Student Digital" &&
    item.activity === "Change It" &&
    item.source === "change-it.js" &&
    item.status === "QUESTION_FILTERED_PROTECTED"
)) {
  const key =
    String(row.evidence || "").trim() ||
    row.destination ||
    row.targetIds ||
    "unknown-change-it";

  if (!blockedChangeItGroups.has(key)) {
    blockedChangeItGroups.set(key, []);
  }

  blockedChangeItGroups.get(key).push(row);
}

for (const [familyKey, rows] of blockedChangeItGroups) {
  const protectedRows = rows.filter(row => row.protection);

  findings.push({
    severity: "REVIEW",
    category: "change-it-question-blocked-protected",
    word: unique(protectedRows.map(row => row.word)).join(" | "),
    destination:
      rows[0]?.destination ||
      "Student Digital Change It",
    message:
      `Change It family "${familyKey}" is fully filtered because at least one choice is protected. ` +
      `Protected trigger(s): ${unique(protectedRows.map(row => `${row.word} [${row.protection}]`)).join(", ")}. ` +
      "Replace protected family member(s) with validated unprotected alternatives if this family should remain live, or archive/remove the blocked question."
  });
}

/*
  A digital word outside the master inventory is not automatically a
  canonical inventory defect.

  - Change It intentionally uses local family/base words.
  - Approved teacher-word extensions are a sanctioned alternate source.
  - Fully runtime-filtered protected source words are source-hygiene
    information, not learner-visible master-inventory gaps.

  Only unexplained, potentially live digital words remain REVIEW.
*/
const digitalWordsMissingInventory = unique(
  destinations
    .filter(row => row.channel === "Student Digital")
    .filter(row => !masterByWord.has(row.normalizedWord))
    .map(row => row.word)
);

for (const word of digitalWordsMissingInventory) {
  const normalized = normalizeWord(word);
  const rows = destinations.filter(
    row =>
      row.channel === "Student Digital" &&
      row.normalizedWord === normalized
  );

  const hasApprovedExtension = extensionByWord.has(normalized);
  const onlyChangeIt =
    rows.length > 0 &&
    rows.every(row => row.source === "change-it.js");
  const fullyRuntimeFiltered =
    rows.length > 0 &&
    rows.every(
      row =>
        row.status === "AUTHORED_FILTERED_PROTECTED" ||
        row.status === "QUESTION_FILTERED_PROTECTED"
    );

  if (hasApprovedExtension) {
    findings.push({
      severity: "INFO",
      category: "digital-word-approved-alternate-source",
      word,
      destination: "Student Digital",
      message:
        "Digital word is not a master-word-inventory row, but it is supplied through the approved teacher-word-extension source. Do not create a duplicate master entry solely for this reason."
    });
    continue;
  }

  if (onlyChangeIt) {
    findings.push({
      severity: "INFO",
      category: fullyRuntimeFiltered
        ? "change-it-local-word-in-blocked-question"
        : "change-it-local-family-word",
      word,
      destination: "Student Digital Change It",
      message: fullyRuntimeFiltered
        ? "Change It-local family/base word is outside the master inventory and belongs only to a question already surfaced at family/question level because protection blocks it."
        : "Change It-local family/base word is intentionally authored in the Change It family source. It is not automatically a canonical master-inventory gap."
    });
    continue;
  }

  if (fullyRuntimeFiltered) {
    findings.push({
      severity: "INFO",
      category: "protected-source-word-outside-master-inventory",
      word,
      destination: "Student Digital",
      message:
        "Authored digital word is outside the master inventory but is fully blocked at runtime by protection/question filtering. Treat as source-hygiene evidence rather than a live canonical inventory gap."
    });
    continue;
  }

  findings.push({
    severity: "REVIEW",
    category: "digital-word-not-master-inventory",
    word,
    destination: "Student Digital",
    message:
      "Potentially live digital word is not a master-word-inventory entry and is not explained by an approved extension, Change It-local family role, or complete runtime protection."
  });
}

const teacherChangeExceptions = targetExceptions.filter(
  row => row.activity === "Change It"
);

const summary = {
  auditVersion: AUDIT_VERSION,
  generatedAt: new Date().toISOString(),
  repoRoot: ROOT,
  canonicalTargets: targets.length,
  masterInventoryEntries: masterWords.length,
  uniqueWordsAudited: wordMasterRows.length,
  destinationRows: destinations.length,
  formalProtectedWords: formalWords.size,
  migrationProtectedWords: migrationWords.size,
  checkTransferProtectedWords: checkWords.size,
  lexicalFamilyBlocks: lexicalBlockWords.size,
  hardFailures: findings.filter(item => item.severity === "HARD").length,
  reviewFlags: findings.filter(item => item.severity === "REVIEW").length,
  informationalFlags: findings.filter(item => item.severity === "INFO").length,
  studentDigitalRuntimePools: runtimePoolRows.length,
  runtimePoolsEmptyAfterProtection: runtimePoolRows.filter(row => row.operationalStatus === "EMPTY_AFTER_PROTECTION").length,
  runtimePoolsIntentionallyUnavailable: runtimePoolRows.filter(row => row.operationalStatus === "INTENTIONALLY_UNAVAILABLE").length,
  learnExampleSubpoolsEmptyAfterProtection: runtimePoolRows.filter(row =>
    String(row.operationalStatus).startsWith("LEARN_EXAMPLE_SUBPOOL_")
  ).length,
  learnExampleSubpoolsIntentionalScarcity: runtimePoolRows.filter(row =>
    row.operationalStatus === "LEARN_EXAMPLE_SUBPOOL_INTENTIONAL_SCARCITY"
  ).length,
  learnExampleSubpoolsLexicalBacklog: runtimePoolRows.filter(row =>
    row.operationalStatus === "LEARN_EXAMPLE_SUBPOOL_LEXICAL_BACKLOG"
  ).length,
  learnExampleSubpoolsUnclassified: runtimePoolRows.filter(row =>
    row.operationalStatus === "LEARN_EXAMPLE_SUBPOOL_EMPTY_AFTER_PROTECTION"
  ).length,
  runtimePoolsWithOneViableWordAfterProtection: runtimePoolRows.filter(row => row.operationalStatus === "VIABLE_ONE_WORD_AFTER_PROTECTION").length,
  protectedSourceRowsPoolRemainsViable: protectedSourceCleanupRows.filter(row => row.cleanupDisposition === "POOL_REMAINS_VIABLE_AFTER_PROTECTED_REMOVAL").length,
  protectedSourceRowsWouldEmptyPool: protectedSourceCleanupRows.filter(row => row.cleanupDisposition === "PROTECTED_REMOVAL_WOULD_LEAVE_POOL_EMPTY").length,
  digitalProtectedAuthoredButFilteredRows: digitalProtectedSourceRows.length,
  blockedWordHuntQuestions: findings.filter(item => item.category === "word-hunt-question-blocked-protected").length,
  blockedChangeItQuestions: findings.filter(item => item.category === "change-it-question-blocked-protected").length,
  teacherChangeTargetsNotApplicable: teacherChangeExceptions.length,
  teacherTargetActivityNotApplicableCells: targetExceptions.length,
  notes: [
    "Digital Meaning and Digital Word Part are target-level activities; they do not have a fixed whole-word pool.",
    "Teacher-Led Retrieve is history-dependent: it can reuse a previously encountered saved word, but the exact target can also be retrieved without a whole word.",
    "Teacher-Led Part A / Part B / Optional Practice are dynamic selections from the ordinary unprotected item bank, not permanent one-word buckets.",
    "Check Transfer, Migration Challenge, and Formal Pre/Post are protected fixed pools.",
    "Figure It Out is explicitly audited as internal activity id infer.",
    "Student Digital Change It has authored questions, while Teacher-Led Change It may still be not-applicable under the teacher material gate. These are separate channels.",
    "Word Hunt is audited at the whole-question level because the live runtime rejects the entire question when any protected word appears, including a distractor.",
    "v1.3 separates instructionalTargetIds from wordMorphemeIds so a complete word decomposition is never mistaken for a required target/activity cell.",
    "Student Digital Find and Figure It Out are evaluated by study-mode × Flight × vocabulary runtime pools; Build Words by build-pattern × Flight × vocabulary; Use It by its downstream active Build pattern.",
    "Learn is different: the morpheme card remains available even when its selected-vocabulary example subpool is empty. Empty Learn example subpools are informational coverage findings, not unavailable runtime pools. Known cases are dispositioned as intentional lexical scarcity or lexical-development backlog; any future unmatched case remains explicitly unclassified.",
    "The exact prefix+root · Flight B · familiar Build Words pool, and its downstream Use It pool, are explicitly intentional N/A because no approved unprotected familiar Flight B word currently provides a clean canonical Prefix + Root build. Prefix + ordinary-base words are not used to force-fill this path."
  ]
};

const output = {
  metadata: summary,
  decisionRules: {
    topLevel:
      "Word -> instructional target (when applicable) + word morphemes -> protection -> actual runtime pool -> stage -> delivery/destination",
    statuses: {
      ACTUAL_FIXED:
        "Fixed protected assessment/transfer placement.",
      AUTHORED_ELIGIBLE:
        "Authored ordinary digital item available when current learner filters match.",
      AUTHORED_FILTERED_PROTECTED:
        "Present in source, but central runtime protection blocks ordinary exposure.",
      AUTHORED_NOT_IN_ACTIVE_BUILD_POOL:
        "Use It sentence exists in source, but the word is not in the current active Build pool and cannot be selected as a Use It item.",
      QUESTION_FILTERED_PROTECTED:
        "Question is authored but filtered because one of its choices is protected.",
      GENERATED_ELIGIBLE:
        "Generated from canonical inventory and runtime eligibility gates.",
      ELIGIBLE_DYNAMIC:
        "May be selected dynamically by the teacher-led item bank.",
      HISTORY_DEPENDENT:
        "May reappear only from saved prior student work; not a fixed word pool.",
      ACTUAL_SHARED_RESOURCE:
        "Appears in shared print/material-family source.",
      BLOCKED_PROTECTED:
        "Must not appear in ordinary instruction/practice."
    },
    digitalNoFixedWholeWordPool: [
      "Meaning",
      "Word Part"
    ],
    teacherStages: [
      "Retrieve",
      "Word Part · Part A",
      "Word Part · Part B",
      "Check Transfer",
      "Optional Practice Set"
    ],
    activities: teacherActivities.map(item => ({
      id: item[0],
      label: item[1]
    }))
  },
  wordMaster: wordMasterRows,
  destinations,
  runtimePoolHealth: runtimePoolRows,
  protectedSourceCleanup: protectedSourceCleanupRows,
  targetExceptions,
  findings
};

/* ================================================================
   WRITE AUDIT ARTIFACTS
   ================================================================ */

const dateStamp = new Date().toISOString().slice(0, 10);
const outDir = path.join(ROOT, "audits", "word-destinations");
fs.mkdirSync(outDir, { recursive: true });

const base = `First_Volo_Morphology_Master_Word_Destination_Decision_Audit_${dateStamp}`;

const jsonPath = path.join(outDir, `${base}.json`);
const matrixPath = path.join(outDir, `${base}_Destination_Matrix.csv`);
const masterPath = path.join(outDir, `${base}_Word_Master.csv`);
const exceptionsPath = path.join(outDir, `${base}_Target_Exceptions.csv`);
const findingsPath = path.join(outDir, `${base}_Findings.csv`);
const runtimePoolsPath = path.join(outDir, `${base}_Runtime_Pool_Health.csv`);
const cleanupPath = path.join(outDir, `${base}_Protected_Source_Cleanup.csv`);
const readmePath = path.join(outDir, `${base}_README.md`);

fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2) + "\n", "utf8");

writeCsv(
  matrixPath,
  destinations.sort((a, b) =>
    a.word.localeCompare(b.word) ||
    a.channel.localeCompare(b.channel) ||
    a.activity.localeCompare(b.activity) ||
    a.stage.localeCompare(b.stage)
  ),
  [
    "word",
    "targetIds",
    "instructionalTargetIds",
    "instructionalTargetLabels",
    "wordMorphemeIds",
    "targetLabels",
    "canonicalTargetFlights",
    "practiceFlights",
    "runtimePoolType",
    "runtimePool",
    "studyMode",
    "runtimePattern",
    "runtimeFlight",
    "runtimeVocabLevel",
    "channel",
    "activity",
    "stage",
    "destination",
    "status",
    "protection",
    "source",
    "evidence",
    "reason",
    "detail"
  ]
);

writeCsv(
  masterPath,
  wordMasterRows,
  [
    "word",
    "sourceTypes",
    "targetIds",
    "targetLabels",
    "canonicalTargetFlights",
    "practiceBands",
    "practiceFlights",
    "accessibilityBands",
    "vocabLevels",
    "transparency",
    "segmentation",
    "protection",
    "actualFixedOrAuthoredDestinations",
    "dynamicEligibleDestinations",
    "blockedDestinations",
    "sourceOnlyButRuntimeFiltered",
    "recommendedActivityUse",
    "reviewCaution"
  ]
);

writeCsv(
  exceptionsPath,
  targetExceptions,
  [
    "targetId",
    "targetLabel",
    "flight",
    "activity",
    "status",
    "reason"
  ]
);

writeCsv(
  findingsPath,
  findings,
  [
    "severity",
    "category",
    "word",
    "destination",
    "message"
  ]
);

writeCsv(
  runtimePoolsPath,
  runtimePoolRows,
  [
    "activity",
    "runtimePoolType",
    "runtimePool",
    "studyMode",
    "runtimePattern",
    "runtimeFlight",
    "runtimeVocabLevel",
    "operationalStatus",
    "cleanupDisposition",
    "authoredRows",
    "uniqueWords",
    "viableRows",
    "viableWords",
    "protectedRows",
    "protectedWords",
    "inactiveRows",
    "viableWordList",
    "protectedWordList"
  ]
);

writeCsv(
  cleanupPath,
  protectedSourceCleanupRows,
  [
    "word",
    "protection",
    "source",
    "activity",
    "runtimePoolType",
    "runtimePool",
    "studyMode",
    "runtimePattern",
    "runtimeFlight",
    "runtimeVocabLevel",
    "cleanupDisposition",
    "viableWordsRemaining",
    "viableWordList",
    "destination"
  ]
);

const readme = `# First Volo Morphology — Master Word Destination / Decision Audit

Generated: ${summary.generatedAt}

## Decision path

**Word → instructional target (when applicable) + word morphemes → protection → actual runtime pool → stage → delivery/destination**

## What this audit distinguishes

- **ACTUAL_FIXED** — formal assessment, Migration Challenge, or Check Transfer placement.
- **AUTHORED_ELIGIBLE** — an ordinary digital word is authored and may render when filters match.
- **AUTHORED_FILTERED_PROTECTED** — the word still exists in digital source data but is blocked at runtime by the central protection rule.
- **GENERATED_ELIGIBLE** — the word is generated from canonical inventory/runtime logic.
- **ELIGIBLE_DYNAMIC** — teacher-led content may select the word dynamically.
- **HISTORY_DEPENDENT** — Retrieve may reuse the word only because it was previously encountered and saved.
- **NOT_APPLICABLE** — the target/activity is intentionally skipped.
- **BLOCKED_PROTECTED** — the word must not enter ordinary practice.

## Important structural rules

1. A word is **not forced into one bucket**, and its complete morpheme decomposition is **not** treated as a required target/activity cell.
2. Formal Pre/Post, Migration Challenge, and Check Transfer are separate protected pools.
3. **Figure It Out is included explicitly** as internal activity id \`infer\`.
4. Digital **Meaning** and **Word Part** are target-level activities and therefore do not have a fixed whole-word pool.
5. Teacher-led **Retrieve** is history-dependent, not a fixed word bank.
6. Teacher-led Part A, Part B, and Optional Practice are dynamic selections from the ordinary unprotected item bank.
7. Print family resources are audited from the shared family configuration.
8. Student Digital Change It and Teacher-Led Change It are separate systems and can legitimately have different coverage.
9. Student Digital pool health is evaluated against the runtime selection unit: Learn target examples; Find/Figure It Out study × Flight × vocabulary; Build pattern × Flight × vocabulary; Use It active Build pattern; Word Hunt/Change It whole question.

## Summary

- Canonical targets: ${summary.canonicalTargets}
- Master inventory entries: ${summary.masterInventoryEntries}
- Unique words audited: ${summary.uniqueWordsAudited}
- Destination rows: ${summary.destinationRows}
- Formal protected words: ${summary.formalProtectedWords}
- Migration protected words: ${summary.migrationProtectedWords}
- Check Transfer protected words: ${summary.checkTransferProtectedWords}
- Hard failures: ${summary.hardFailures}
- Review flags: ${summary.reviewFlags}
- Informational flags: ${summary.informationalFlags}
- Student Digital runtime pools: ${summary.studentDigitalRuntimePools}
- Runtime pools empty after protection: ${summary.runtimePoolsEmptyAfterProtection}
- Runtime pools intentionally unavailable: ${summary.runtimePoolsIntentionallyUnavailable}
- Learn example subpools empty after protection: ${summary.learnExampleSubpoolsEmptyAfterProtection}
  - Intentional lexical scarcity: ${summary.learnExampleSubpoolsIntentionalScarcity}
  - Lexical-development backlog: ${summary.learnExampleSubpoolsLexicalBacklog}
  - Unclassified Learn coverage: ${summary.learnExampleSubpoolsUnclassified}
- Runtime pools with one viable word after protection: ${summary.runtimePoolsWithOneViableWordAfterProtection}

## Output files

- \`${path.basename(jsonPath)}\`
- \`${path.basename(matrixPath)}\`
- \`${path.basename(masterPath)}\`
- \`${path.basename(exceptionsPath)}\`
- \`${path.basename(findingsPath)}\`
- \`${path.basename(runtimePoolsPath)}\`
- \`${path.basename(cleanupPath)}\`
`;

fs.writeFileSync(readmePath, readme, "utf8");

console.log("\n=== FIRST VOLO MASTER WORD DESTINATION / DECISION AUDIT ===");
console.log(`Audit version: ${AUDIT_VERSION}`);
console.log(`Canonical targets: ${summary.canonicalTargets}`);
console.log(`Master inventory entries: ${summary.masterInventoryEntries}`);
console.log(`Unique words audited: ${summary.uniqueWordsAudited}`);
console.log(`Destination rows: ${summary.destinationRows}`);
console.log(`Formal protected words: ${summary.formalProtectedWords}`);
console.log(`Migration protected words: ${summary.migrationProtectedWords}`);
console.log(`Check Transfer protected words: ${summary.checkTransferProtectedWords}`);
console.log(`Teacher Change It N/A targets: ${summary.teacherChangeTargetsNotApplicable}`);
console.log(`Hard failures: ${summary.hardFailures}`);
console.log(`Review flags: ${summary.reviewFlags}`);
console.log(`Informational flags: ${summary.informationalFlags}`);
console.log(`Student Digital runtime pools: ${summary.studentDigitalRuntimePools}`);
console.log(`Runtime pools empty after protection: ${summary.runtimePoolsEmptyAfterProtection}`);
console.log(`Runtime pools intentionally unavailable: ${summary.runtimePoolsIntentionallyUnavailable}`);
console.log(`Learn example subpools empty after protection: ${summary.learnExampleSubpoolsEmptyAfterProtection}`);
console.log(`  Intentional lexical scarcity: ${summary.learnExampleSubpoolsIntentionalScarcity}`);
console.log(`  Lexical-development backlog: ${summary.learnExampleSubpoolsLexicalBacklog}`);
console.log(`  Unclassified Learn coverage: ${summary.learnExampleSubpoolsUnclassified}`);
console.log(`Runtime pools with one viable word after protection: ${summary.runtimePoolsWithOneViableWordAfterProtection}`);
console.log(`Protected source rows that would empty a pool if removed: ${summary.protectedSourceRowsWouldEmptyPool}`);

console.log("\nOutputs:");
for (const file of [
  jsonPath,
  matrixPath,
  masterPath,
  exceptionsPath,
  findingsPath,
  runtimePoolsPath,
  cleanupPath,
  readmePath
]) {
  console.log(`- ${path.relative(ROOT, file)}`);
}

if (summary.hardFailures) {
  console.error("\nAUDIT RESULT: HARD FAILURES FOUND");
  process.exitCode = 2;
} else {
  console.log("\nAUDIT RESULT: no hard failures");
}
