#!/usr/bin/env node
"use strict";

/*
  First Volo Morphology — Waypoint Placement / Eligibility Audit

  This is a read-only audit. It validates the canonical registry against:
    - token-sets.js
    - migration-progress.js
    - the finalized active and held Waypoint PDF directories

  Usage:
    node waypoint-placement-audit.js
    node waypoint-placement-audit.js --report audits/waypoints/report.json
*/

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const REPO_ROOT = __dirname;
const registry = require("./waypoint-registry.js");
const tokenSets = require("./token-sets.js");

const errors = [];
const warnings = [];
const notes = [];

function error(code, message, detail = null) {
  errors.push({ code, message, detail });
}

function warning(code, message, detail = null) {
  warnings.push({ code, message, detail });
}

function sameArray(actual, expected) {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();

  values.forEach((value) => {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  });

  return [...duplicates];
}

function uniqueSorted(values) {
  return [...new Set(values)].sort();
}

function getReportPath() {
  const index = process.argv.indexOf("--report");

  if (index === -1) {
    return null;
  }

  const value = process.argv[index + 1];

  if (!value || value.startsWith("--")) {
    error("REPORT_PATH_MISSING", "--report requires a file path.");
    return null;
  }

  return path.resolve(REPO_ROOT, value);
}

function loadMigrationConfiguration() {
  const sourcePath = path.join(REPO_ROOT, "migration-progress.js");
  const source = fs.readFileSync(sourcePath, "utf8");
  const sandbox = {
    window: {
      location: {
        hostname: "localhost"
      }
    },
    console
  };

  vm.runInNewContext(source, sandbox, {
    filename: sourcePath
  });

  return sandbox.window.FirstVoloMigration;
}

function getOrderedFlightStops(migration, flight) {
  if (typeof migration.getFlightStops === "function") {
    return migration.getFlightStops(flight);
  }

  const stopById = new Map(
    migration.STOPS.map((stop) => [stop.id, stop])
  );

  return flight.activeStopIds
    .map((stopId) => stopById.get(stopId))
    .filter(Boolean);
}

function listPdfWords(directory, flight) {
  const absoluteDirectory = path.join(REPO_ROOT, directory);

  if (!fs.existsSync(absoluteDirectory)) {
    error(
      "PDF_DIRECTORY_MISSING",
      `Missing PDF directory for Flight ${flight}: ${directory}`
    );
    return [];
  }

  const pattern = new RegExp(`^Flight-${flight}-Waypoint-(.+)\\.pdf$`);

  return fs.readdirSync(absoluteDirectory)
    .filter((filename) => filename.toLowerCase().endsWith(".pdf"))
    .map((filename) => {
      const match = filename.match(pattern);

      if (!match) {
        warning(
          "NONCANONICAL_PDF_FILENAME",
          `Unexpected PDF filename in ${directory}: ${filename}`
        );
        return null;
      }

      return match[1];
    })
    .filter(Boolean)
    .sort();
}

const migration = loadMigrationConfiguration();
const morphemeToSet = new Map();

tokenSets.forEach((set) => {
  set.morphemeIds.forEach((morphemeId) => {
    if (morphemeToSet.has(morphemeId)) {
      error(
        "MORPHEME_IN_MULTIPLE_SETS",
        `${morphemeId} occurs in both ${morphemeToSet.get(morphemeId).id} and ${set.id}.`
      );
      return;
    }

    morphemeToSet.set(morphemeId, set);
  });
});

const flightOrder = ["A", "B", "C"];
const collectionOrder = ["Foundation", "Expansion", "Advanced"];
const byFlight = {};

const waypointIds = registry.waypoints.map((item) => item.id);
const waypointWords = registry.waypoints.map((item) => item.word);

duplicateValues(waypointIds).forEach((id) => {
  error("DUPLICATE_WAYPOINT_ID", `Duplicate active Waypoint ID: ${id}`);
});

duplicateValues(waypointWords).forEach((word) => {
  error("DUPLICATE_WAYPOINT_WORD", `Duplicate active Waypoint word: ${word}`);
});

const heldWords = registry.heldWaypoints.map((item) => item.word);

duplicateValues(heldWords).forEach((word) => {
  error("DUPLICATE_HELD_WORD", `Duplicate held Waypoint word: ${word}`);
});

const activeHeldOverlap = waypointWords.filter((word) => heldWords.includes(word));

activeHeldOverlap.forEach((word) => {
  error("HELD_WORD_ACTIVE", `Held Waypoint leaked into the active registry: ${word}`);
});

flightOrder.forEach((flightId) => {
  const flightConfig = registry.flights[flightId];

  if (!flightConfig) {
    error("FLIGHT_CONFIG_MISSING", `Registry is missing Flight ${flightId}.`);
    return;
  }

  const migrationFlight = Object.values(migration.FLIGHTS)
    .find((flight) => flight.id === flightId);

  if (!migrationFlight) {
    error("MIGRATION_FLIGHT_MISSING", `migration-progress.js is missing Flight ${flightId}.`);
    return;
  }

  if (migrationFlight.collection !== flightConfig.collection) {
    error(
      "FLIGHT_COLLECTION_MISMATCH",
      `Flight ${flightId} collection is ${migrationFlight.collection}; registry expects ${flightConfig.collection}.`
    );
  }

  if (migrationFlight.gradeBand && migrationFlight.gradeBand !== flightConfig.gradeBand) {
    error(
      "FLIGHT_GRADE_BAND_MISMATCH",
      `Flight ${flightId} grade band does not match the registry.`
    );
  }

  const actualSetIds = tokenSets
    .filter((set) => set.collection === flightConfig.collection)
    .map((set) => set.id);

  if (!sameArray(actualSetIds, flightConfig.expectedSetIds)) {
    error(
      "TOKEN_SET_ORDER_CHANGED",
      `Flight ${flightId} token-set order no longer matches the approved Waypoint plan.`,
      {
        expected: flightConfig.expectedSetIds,
        actual: actualSetIds
      }
    );
  }

  const routeStops = getOrderedFlightStops(migration, migrationFlight)
    .map((stop) => stop.id);
  const instructionalStops = routeStops.slice(1, -1);

  if (!sameArray(instructionalStops, flightConfig.expectedInstructionalStopIds)) {
    error(
      "MIGRATION_ROUTE_CHANGED",
      `Flight ${flightId} instructional stops no longer match the approved Waypoint plan.`,
      {
        expected: flightConfig.expectedInstructionalStopIds,
        actual: instructionalStops
      }
    );
  }

  if (actualSetIds.length !== instructionalStops.length) {
    error(
      "SET_STOP_COUNT_MISMATCH",
      `Flight ${flightId} has ${actualSetIds.length} token sets but ${instructionalStops.length} instructional stops.`
    );
  }

  const items = registry.waypoints.filter((item) => item.flight === flightId);

  if (items.length !== flightConfig.expectedWaypointCount) {
    error(
      "WAYPOINT_COUNT_MISMATCH",
      `Flight ${flightId} has ${items.length} active Waypoints; expected ${flightConfig.expectedWaypointCount}.`
    );
  }

  const activePdfWords = listPdfWords(
    `waypoints/flight-${flightId.toLowerCase()}/pdfs`,
    flightId
  );
  const registryWords = items.map((item) => item.word).sort();

  if (!sameArray(activePdfWords, registryWords)) {
    error(
      "ACTIVE_PDF_INVENTORY_MISMATCH",
      `Flight ${flightId} registry words do not exactly match its finalized PDF directory.`,
      {
        registryOnly: registryWords.filter((word) => !activePdfWords.includes(word)),
        pdfOnly: activePdfWords.filter((word) => !registryWords.includes(word))
      }
    );
  }

  const placements = {};
  instructionalStops.forEach((stopId) => {
    placements[stopId] = [];
  });

  items.forEach((item) => {
    if (item.word !== item.word.toUpperCase()) {
      error("WAYPOINT_WORD_NOT_UPPERCASE", `${item.id} must use an uppercase word.`);
    }

    if (!item.components.length) {
      error("COMPONENTS_MISSING", `${item.word} has no component display data.`);
    }

    const duplicateComponentIds = duplicateValues(item.componentMorphemeIds);
    const duplicateRequiredIds = duplicateValues(item.requiredMorphemeIds);
    const duplicatePriorIds = duplicateValues(item.assumedPriorMorphemeIds);

    if (duplicateComponentIds.length) {
      error("DUPLICATE_COMPONENT_ID", `${item.word} repeats component IDs: ${duplicateComponentIds.join(", ")}.`);
    }
    if (duplicateRequiredIds.length) {
      error("DUPLICATE_REQUIRED_ID", `${item.word} repeats required IDs: ${duplicateRequiredIds.join(", ")}.`);
    }
    if (duplicatePriorIds.length) {
      error("DUPLICATE_PRIOR_ID", `${item.word} repeats prior IDs: ${duplicatePriorIds.join(", ")}.`);
    }

    const overlap = item.requiredMorphemeIds
      .filter((id) => item.assumedPriorMorphemeIds.includes(id));

    if (overlap.length) {
      error(
        "REQUIRED_PRIOR_OVERLAP",
        `${item.word} lists IDs as both required and assumed prior: ${overlap.join(", ")}.`
      );
    }

    const classifiedIds = uniqueSorted([
      ...item.requiredMorphemeIds,
      ...item.assumedPriorMorphemeIds
    ]);

    if (!sameArray(uniqueSorted(item.componentMorphemeIds), classifiedIds)) {
      error(
        "COMPONENT_CLASSIFICATION_MISMATCH",
        `${item.word} component IDs must be classified as required or assumed prior.`,
        {
          componentMorphemeIds: item.componentMorphemeIds,
          requiredMorphemeIds: item.requiredMorphemeIds,
          assumedPriorMorphemeIds: item.assumedPriorMorphemeIds
        }
      );
    }

    item.componentMorphemeIds.forEach((morphemeId) => {
      if (!morphemeToSet.has(morphemeId)) {
        error(
          "UNKNOWN_COMPONENT_MORPHEME",
          `${item.word} references unknown canonical morpheme ID: ${morphemeId}`
        );
      }
    });

    item.requiredMorphemeIds.forEach((morphemeId) => {
      const set = morphemeToSet.get(morphemeId);
      if (set && set.collection !== flightConfig.collection) {
        error(
          "REQUIRED_MORPHEME_WRONG_FLIGHT",
          `${item.word} requires ${morphemeId} from ${set.collection}, not current Flight ${flightId} (${flightConfig.collection}).`
        );
      }
    });

    const currentCollectionIndex = collectionOrder.indexOf(flightConfig.collection);

    item.assumedPriorMorphemeIds.forEach((morphemeId) => {
      const set = morphemeToSet.get(morphemeId);
      if (!set) {
        return;
      }

      const priorCollectionIndex = collectionOrder.indexOf(set.collection);

      if (priorCollectionIndex >= currentCollectionIndex) {
        error(
          "PRIOR_MORPHEME_NOT_EARLIER",
          `${item.word} treats ${morphemeId} as prior, but it belongs to ${set.collection}.`
        );
      }
    });

    const derivedSetIds = uniqueSorted(
      item.requiredMorphemeIds
        .map((morphemeId) => morphemeToSet.get(morphemeId)?.id)
        .filter(Boolean)
    ).sort((left, right) => actualSetIds.indexOf(left) - actualSetIds.indexOf(right));

    if (!sameArray(derivedSetIds, item.requiredSetIds)) {
      error(
        "REQUIRED_SET_MISMATCH",
        `${item.word} requiredSetIds do not match its required morphemes.`,
        {
          expectedFromMorphemes: derivedSetIds,
          configured: item.requiredSetIds
        }
      );
    }

    const latestSetIndex = Math.max(
      ...derivedSetIds.map((setId) => actualSetIds.indexOf(setId))
    );
    const calculatedEarliestStop = instructionalStops[latestSetIndex];

    if (!calculatedEarliestStop) {
      error(
        "EARLIEST_STOP_UNRESOLVED",
        `${item.word} has no calculable earliest eligible stop.`
      );
    } else if (item.earliestEligibleStop !== calculatedEarliestStop) {
      error(
        "EARLIEST_STOP_INCORRECT",
        `${item.word} is configured for ${item.earliestEligibleStop}; its required parts make it first eligible at ${calculatedEarliestStop}.`
      );
    }

    const earliestIndex = instructionalStops.indexOf(item.earliestEligibleStop);
    const displayIndex = instructionalStops.indexOf(item.displayStop);

    if (earliestIndex === -1) {
      error("INVALID_EARLIEST_STOP", `${item.word} uses invalid earliest stop ${item.earliestEligibleStop}.`);
    }
    if (displayIndex === -1) {
      error("INVALID_DISPLAY_STOP", `${item.word} uses invalid display stop ${item.displayStop}.`);
    }
    if (earliestIndex !== -1 && displayIndex !== -1 && displayIndex < earliestIndex) {
      error(
        "WAYPOINT_DISPLAYED_EARLY",
        `${item.word} displays at ${item.displayStop} before it is eligible at ${item.earliestEligibleStop}.`
      );
    }

    const shouldBeDelayed = displayIndex > earliestIndex;
    if (item.delayedForPacing !== shouldBeDelayed) {
      error(
        "DELAY_FLAG_INCORRECT",
        `${item.word} delayedForPacing does not match its stops.`
      );
    }

    const expectedPdfPath =
      `waypoints/flight-${flightId.toLowerCase()}/pdfs/Flight-${flightId}-Waypoint-${item.word}.pdf`;

    if (item.pdfPath !== expectedPdfPath) {
      error(
        "NONCANONICAL_ACTIVE_PDF_PATH",
        `${item.word} PDF path should be ${expectedPdfPath}; found ${item.pdfPath}.`
      );
    }

    if (!fs.existsSync(path.join(REPO_ROOT, item.pdfPath))) {
      error("ACTIVE_PDF_MISSING", `${item.word} points to a missing PDF: ${item.pdfPath}`);
    }

    if (placements[item.displayStop]) {
      placements[item.displayStop].push(item.word);
    }
  });

  Object.entries(placements).forEach(([stopId, words]) => {
    if (words.length > 5) {
      warning(
        "LARGE_DESTINATION_CLUSTER",
        `Flight ${flightId} has ${words.length} Waypoints displayed at ${stopId}.`,
        { flight: flightId, stop: stopId, words }
      );
    }
  });

  byFlight[flightId] = {
    gradeBand: flightConfig.gradeBand,
    collection: flightConfig.collection,
    tokenSetCount: actualSetIds.length,
    instructionalStopCount: instructionalStops.length,
    activeWaypointCount: items.length,
    activePdfCount: activePdfWords.length,
    routeStops,
    placements
  };
});

registry.heldWaypoints.forEach((item) => {
  const expectedPrefix = `waypoints/flight-${item.flight.toLowerCase()}/held/`;

  if (!item.pdfPath.startsWith(expectedPrefix)) {
    error(
      "HELD_PDF_OUTSIDE_HELD_DIRECTORY",
      `${item.word} must remain under ${expectedPrefix}.`
    );
  }

  if (!fs.existsSync(path.join(REPO_ROOT, item.pdfPath))) {
    error("HELD_PDF_MISSING", `${item.word} held PDF is missing: ${item.pdfPath}`);
  }
});

const expectedHeldWords = ["CONDUCTIVE", "TRANSPORTATION"];
if (!sameArray([...heldWords].sort(), expectedHeldWords)) {
  error(
    "HELD_INVENTORY_CHANGED",
    "Held Waypoint inventory changed from the approved two-word list.",
    {
      expected: expectedHeldWords,
      actual: [...heldWords].sort()
    }
  );
}

const delayedWords = registry.waypoints
  .filter((item) => item.delayedForPacing)
  .map((item) => item.word)
  .sort();
const expectedDelayedWords = [
  "INTERJECTION",
  "MICROSCOPIC",
  "PREDICTIVE",
  "PROSPECTIVE",
  "SUBMISSION"
].sort();

if (!sameArray(delayedWords, expectedDelayedWords)) {
  error(
    "APPROVED_PACING_DELAYS_CHANGED",
    "The five approved pacing delays have changed.",
    {
      expected: expectedDelayedWords,
      actual: delayedWords
    }
  );
}

notes.push({
  code: "PACING_DELAYS",
  message: `${delayedWords.length} Waypoints are intentionally displayed later than first eligibility.`,
  words: delayedWords
});

const reportPath = getReportPath();
const status = errors.length === 0 ? "PASS" : "FAIL";
const report = {
  audit: "First Volo Morphology Waypoint placement and eligibility",
  registryVersion: registry.version,
  generatedAt: new Date().toISOString(),
  status,
  summary: {
    activeWaypoints: registry.waypoints.length,
    heldWaypoints: registry.heldWaypoints.length,
    delayedForPacing: delayedWords.length,
    errors: errors.length,
    warnings: warnings.length
  },
  byFlight,
  errors,
  warnings,
  notes
};

if (reportPath) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

console.log(`Waypoint placement audit: ${status}`);
console.log(`Active Waypoints: ${report.summary.activeWaypoints}`);
console.log(`Held Waypoints: ${report.summary.heldWaypoints}`);
console.log(`Intentional pacing delays: ${report.summary.delayedForPacing}`);
console.log(`Errors: ${report.summary.errors}`);
console.log(`Warnings: ${report.summary.warnings}`);

flightOrder.forEach((flightId) => {
  const result = byFlight[flightId];
  if (!result) {
    return;
  }

  console.log(`\nFlight ${flightId} placements:`);
  Object.entries(result.placements).forEach(([stop, words]) => {
    console.log(`  ${stop}: ${words.length ? words.join(", ") : "—"}`);
  });
});

if (reportPath) {
  console.log(`\nReport: ${path.relative(REPO_ROOT, reportPath)}`);
}

if (errors.length) {
  console.error("\nErrors:");
  errors.forEach((item) => {
    console.error(`  [${item.code}] ${item.message}`);
  });
}

if (warnings.length) {
  console.warn("\nWarnings:");
  warnings.forEach((item) => {
    console.warn(`  [${item.code}] ${item.message}`);
  });
}

process.exitCode = errors.length ? 1 : 0;
