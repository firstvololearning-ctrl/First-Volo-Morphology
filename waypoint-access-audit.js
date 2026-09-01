#!/usr/bin/env node
"use strict";

/*
  First Volo Morphology — Waypoint Access Service Audit

  This verifies access behavior without loading or changing the migration UI.
*/

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const registry = require("./waypoint-registry.js");
const tokenSets = require("./token-sets.js");
const createWaypointAccessService = require("./waypoint-access.js");

const errors = [];
let assertions = 0;
let mapOnlySafeguards = 0;

function assert(condition, message) {
  assertions += 1;

  if (!condition) {
    errors.push(message);
  }
}

function loadMigration() {
  const sourcePath = path.join(__dirname, "migration-progress.js");
  const source = fs.readFileSync(sourcePath, "utf8");
  const sandbox = {
    window: {
      location: { hostname: "localhost" },
      FirstVoloTokens: {
        evaluateStudent(student) {
          return tokenSets.map((set) => ({
            setId: set.id,
            collection: set.collection,
            ready: Boolean(student?.voloTokens?.[set.id])
          }));
        },
        isTokenEarned(student, setId) {
          return Boolean(student?.voloTokens?.[setId]);
        }
      }
    },
    console
  };

  vm.runInNewContext(source, sandbox, { filename: sourcePath });
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

function makeStudent(setIds = [], transferCollection = null) {
  return {
    id: "waypoint-audit-student",
    voloTokens: Object.fromEntries(
      setIds.map((setId) => [
        setId,
        { setId, earnedAt: "2026-09-01T00:00:00.000Z" }
      ])
    ),
    migrationTransferChecks: transferCollection
      ? { [transferCollection]: { passed: true } }
      : {}
  };
}

const migration = loadMigration();
const tokens = {
  isTokenEarned(student, setId) {
    return Boolean(student?.voloTokens?.[setId]);
  }
};
const service = createWaypointAccessService({
  registry,
  tokens,
  migration
});

function loadBrowserService() {
  const sourcePath = path.join(__dirname, "waypoint-access.js");
  const source = fs.readFileSync(sourcePath, "utf8");
  const sandbox = {
    window: {
      FirstVoloWaypointRegistry: registry,
      FirstVoloTokens: tokens,
      FirstVoloMigration: migration
    }
  };

  vm.runInNewContext(source, sandbox, { filename: sourcePath });
  return sandbox.window.FirstVoloWaypointAccess;
}

const browserService = loadBrowserService();

assert(
  typeof browserService?.getFlightState === "function",
  "Browser loading did not expose FirstVoloWaypointAccess."
);
assert(
  browserService?.registryVersion === registry.version,
  "Browser service did not load the canonical registry version."
);

const flightValueById = new Map(
  Object.entries(migration.FLIGHTS).map(([flightValue, flight]) => [
    flight.id,
    flightValue
  ])
);

["A", "B", "C"].forEach((flightId) => {
  const flightValue = flightValueById.get(flightId);
  const flightConfig = registry.flights[flightId];
  const flight = migration.FLIGHTS[flightValue];
  const stops = getOrderedFlightStops(migration, flight);
  const stopIndexById = new Map(stops.map((stop, index) => [stop.id, index]));
  const flightWaypoints = registry.waypoints.filter(
    (waypoint) => waypoint.flight === flightId
  );

  const emptyState = service.getFlightState(makeStudent(), flightValue);

  assert(emptyState !== null, `Flight ${flightId}: empty state was not returned.`);
  assert(
    emptyState.availableCount === 0,
    `Flight ${flightId}: a learner with no tokens has available Waypoints.`
  );

  const completeStudent = makeStudent(flightConfig.expectedSetIds);
  const completeState = service.getFlightState(completeStudent, flightValue);

  assert(
    completeState.availableCount === flightWaypoints.length,
    `Flight ${flightId}: all tokens did not make every active Waypoint available.`
  );
  assert(
    completeState.currentStopId === "coast",
    `Flight ${flightId}: all tokens without transfer should stop at Coast.`
  );
  assert(
    completeState.waypointStates.every(
      (state) => !registry.heldWaypoints.some((held) => held.word === state.word)
    ),
    `Flight ${flightId}: a held Waypoint leaked into access state.`
  );

  const journeyComplete = service.getFlightState(
    makeStudent(flightConfig.expectedSetIds, flight.collection),
    flightValue
  );

  assert(
    journeyComplete.currentStopId === "destination",
    `Flight ${flightId}: successful transfer did not reach Winter Home.`
  );
  assert(
    journeyComplete.availableCount === flightWaypoints.length,
    `Flight ${flightId}: Winter Home changed existing Waypoint access.`
  );

  flightWaypoints.forEach((waypoint) => {
    const prerequisiteOnly = makeStudent(waypoint.requiredSetIds);
    const prerequisiteState = service.getWaypointState(
      prerequisiteOnly,
      waypoint.id
    );

    assert(
      prerequisiteState.instructionallyEligible,
      `${waypoint.word}: earned prerequisite sets were not recognized.`
    );

    waypoint.requiredSetIds.forEach((missingSetId) => {
      const remainingRequiredSets = waypoint.requiredSetIds.filter(
        (setId) => setId !== missingSetId
      );
      const missingState = service.getWaypointState(
        makeStudent(remainingRequiredSets),
        waypoint.id
      );

      assert(
        !missingState.instructionallyEligible,
        `${waypoint.word}: remained eligible without ${missingSetId}.`
      );
      assert(
        missingState.missingRequiredSetIds.includes(missingSetId),
        `${waypoint.word}: did not report missing prerequisite ${missingSetId}.`
      );
    });

    const displayStopIndex = stopIndexById.get(waypoint.displayStop);
    const sequentialSetsThroughDisplay = flightConfig.expectedSetIds.slice(
      0,
      displayStopIndex
    );
    const availableSetIds = [
      ...new Set([
        ...sequentialSetsThroughDisplay,
        ...waypoint.requiredSetIds
      ])
    ];
    const availableState = service.getWaypointState(
      makeStudent(availableSetIds),
      waypoint.id
    );

    assert(
      availableState.displayStopReached,
      `${waypoint.word}: configured display stop was not recognized as reached.`
    );
    assert(
      availableState.available && availableState.status === "available",
      `${waypoint.word}: did not become available when both conditions were met.`
    );

    if (waypoint.delayedForPacing) {
      const earliestStopIndex = stopIndexById.get(
        waypoint.earliestEligibleStop
      );
      const setsThroughEligibility = flightConfig.expectedSetIds.slice(
        0,
        earliestStopIndex
      );
      const waitingState = service.getWaypointState(
        makeStudent([
          ...new Set([
            ...setsThroughEligibility,
            ...waypoint.requiredSetIds
          ])
        ]),
        waypoint.id
      );

      assert(
        waitingState.instructionallyEligible &&
          !waitingState.displayStopReached &&
          !waitingState.available &&
          waitingState.status === "waiting-for-display-stop",
        `${waypoint.word}: pacing delay did not hold access until ${waypoint.displayStop}.`
      );
    }

    const nonRequiredSetIds = flightConfig.expectedSetIds.filter(
      (setId) => !waypoint.requiredSetIds.includes(setId)
    );
    const mapOnlySetIds = nonRequiredSetIds.slice(0, displayStopIndex);

    if (mapOnlySetIds.length === displayStopIndex) {
      const mapOnlyState = service.getWaypointState(
        makeStudent(mapOnlySetIds),
        waypoint.id
      );

      mapOnlySafeguards += 1;
      assert(
        mapOnlyState.displayStopReached &&
          !mapOnlyState.instructionallyEligible &&
          !mapOnlyState.available,
        `${waypoint.word}: map arrival bypassed missing instructional prerequisites.`
      );
    }
  });
});

assert(
  service.getFlightState(makeStudent(), "not-a-flight") === null,
  "Invalid flight values must return null."
);
assert(
  service.getFlightState(null, "2-3") === null,
  "A missing learner must not produce Waypoint access state."
);
assert(
  service.getWaypointState(makeStudent(), "not-a-waypoint") === null,
  "Unknown Waypoint IDs must return null."
);
assert(
  mapOnlySafeguards > 0,
  "The audit did not exercise any map-position-only safeguard cases."
);

const status = errors.length ? "FAIL" : "PASS";

console.log(`Waypoint access audit: ${status}`);
console.log(`Assertions: ${assertions}`);
console.log(`Map-only safeguard cases: ${mapOnlySafeguards}`);
console.log(`Errors: ${errors.length}`);

if (errors.length) {
  errors.forEach((message) => console.error(`  - ${message}`));
  process.exitCode = 1;
}
