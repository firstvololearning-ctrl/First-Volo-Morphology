"use strict";

/*
  First Volo Morphology — Waypoint Eligibility / Access Service

  This module does not render Waypoints or modify migration progress.

  A Waypoint becomes available only when:
    1. every required Volo Token set in the canonical registry is earned; and
    2. the learner has reached the Waypoint's configured display stop.

  Volo Tokens remain the source of truth for mastery. This service does not
  add or recalculate a separate Waypoint mastery threshold.
*/

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory;
  }

  if (
    root?.FirstVoloWaypointRegistry &&
    root?.FirstVoloTokens &&
    root?.FirstVoloMigration
  ) {
    root.FirstVoloWaypointAccess = factory({
      registry: root.FirstVoloWaypointRegistry,
      tokens: root.FirstVoloTokens,
      migration: root.FirstVoloMigration
    });
  }
})(
  typeof window !== "undefined" ? window : globalThis,
  function createWaypointAccessService({ registry, tokens, migration }) {
    function getOrderedFlightStops(flight) {
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

    if (!registry?.waypoints || !registry?.flights) {
      throw new TypeError("A valid Waypoint registry is required.");
    }

    if (typeof tokens?.isTokenEarned !== "function") {
      throw new TypeError("The Volo Token engine is required.");
    }

    if (
      !migration?.FLIGHTS ||
      !Array.isArray(migration?.STOPS) ||
      typeof migration?.getProgress !== "function"
    ) {
      throw new TypeError("The migration progress service is required.");
    }

    const SERVICE_VERSION = "2026-09-01-v1";

    const flightValueById = new Map(
      Object.entries(migration.FLIGHTS).map(([flightValue, flight]) => [
        flight.id,
        flightValue
      ])
    );

    const waypointById = new Map(
      registry.waypoints.map((waypoint) => [waypoint.id, waypoint])
    );

    function getFlightContext(flightValue) {
      const flight = migration.FLIGHTS[flightValue];

      if (!flight || !registry.flights[flight.id]) {
        return null;
      }

      if (!Array.isArray(flight.activeStopIds) &&
          typeof migration.getFlightStops !== "function") {
        return null;
      }

      const stops = getOrderedFlightStops(flight);
      const stopIndexById = new Map(
        stops.map((stop, index) => [stop.id, index])
      );

      return {
        flightValue,
        flight,
        stops,
        stopIndexById
      };
    }

    function evaluateWaypoint(student, waypoint, progress, context) {
      const missingRequiredSetIds = waypoint.requiredSetIds.filter(
        (setId) => !tokens.isTokenEarned(student, setId)
      );

      const instructionallyEligible = missingRequiredSetIds.length === 0;
      const displayStopIndex = context.stopIndexById.get(waypoint.displayStop);
      const displayStopReached =
        Number.isInteger(displayStopIndex) &&
        progress.currentStopIndex >= displayStopIndex;
      const available = instructionallyEligible && displayStopReached;

      let status = "missing-prerequisites";

      if (available) {
        status = "available";
      } else if (instructionallyEligible) {
        status = "waiting-for-display-stop";
      }

      return Object.freeze({
        id: waypoint.id,
        word: waypoint.word,
        flight: waypoint.flight,
        components: waypoint.components,
        requiredMorphemeIds: waypoint.requiredMorphemeIds,
        requiredSetIds: waypoint.requiredSetIds,
        missingRequiredSetIds: Object.freeze(missingRequiredSetIds),
        earliestEligibleStop: waypoint.earliestEligibleStop,
        displayStop: waypoint.displayStop,
        delayedForPacing: waypoint.delayedForPacing,
        pdfPath: waypoint.pdfPath,
        instructionallyEligible,
        displayStopReached,
        available,
        status
      });
    }

    function getFlightState(student, flightValue) {
      const context = getFlightContext(flightValue);

      if (!student || !context) {
        return null;
      }

      const progress = migration.getProgress(student, flightValue);

      if (!progress) {
        return null;
      }

      const waypointStates = registry.waypoints
        .filter((waypoint) => waypoint.flight === context.flight.id)
        .map((waypoint) =>
          evaluateWaypoint(student, waypoint, progress, context)
        );

      const availableWaypoints = waypointStates.filter(
        (waypoint) => waypoint.available
      );

      const instructionalStops = context.stops.slice(1, -1);
      const stopGroups = instructionalStops.map((stop) => {
        const waypoints = waypointStates.filter(
          (waypoint) => waypoint.displayStop === stop.id
        );
        const availableCount = waypoints.filter(
          (waypoint) => waypoint.available
        ).length;

        return Object.freeze({
          id: stop.id,
          label: stop.label,
          total: waypoints.length,
          availableCount,
          waypoints: Object.freeze(waypoints)
        });
      });

      return Object.freeze({
        version: SERVICE_VERSION,
        registryVersion: registry.version,
        flightValue,
        flightId: context.flight.id,
        collection: context.flight.collection,
        currentStopId: progress.currentStop?.id || null,
        currentStopIndex: progress.currentStopIndex,
        availableCount: availableWaypoints.length,
        totalCount: waypointStates.length,
        waypointStates: Object.freeze(waypointStates),
        availableWaypoints: Object.freeze(availableWaypoints),
        availableAtCurrentStop: Object.freeze(
          availableWaypoints.filter(
            (waypoint) => waypoint.displayStop === progress.currentStop?.id
          )
        ),
        stopGroups: Object.freeze(stopGroups)
      });
    }

    function getWaypointState(student, waypointId) {
      const waypoint = waypointById.get(waypointId);

      if (!waypoint) {
        return null;
      }

      const flightValue = flightValueById.get(waypoint.flight);
      const flightState = getFlightState(student, flightValue);

      return (
        flightState?.waypointStates.find(
          (state) => state.id === waypointId
        ) || null
      );
    }

    function getAvailableWaypoints(student, flightValue) {
      return getFlightState(student, flightValue)?.availableWaypoints || [];
    }

    return Object.freeze({
      version: SERVICE_VERSION,
      registryVersion: registry.version,
      getFlightState,
      getWaypointState,
      getAvailableWaypoints
    });
  }
);
