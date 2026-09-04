"use strict";

/*
  First Volo Morphology — Volo Migration Progress

  The migration is a kid-facing visualization of the
  existing Volo Token achievement system.

  Token rules are NOT changed here.

  The token/mastery engine remains the source of truth for learning.
  This module translates demonstrated learning into discrete arrivals on
  each Flight's active migration route.

  The final Destination is reserved for a future
  Transfer Check using novel words that are separate
  from formal assessment items.

  All Flight Tokens + successful Transfer Check
  = Journey Complete / Post-Test Ready.
*/

(function () {

  const STOPS = Object.freeze([
    {
      id: "home-tree",
      label: "Summer Home",
      routeRatio: 0
    },
    {
      id: "meadow",
      label: "Meadow",
      routeRatio: 0.142857
    },
    {
      id: "river",
      label: "River",
      routeRatio: 0.285714
    },
    {
      id: "forest",
      label: "Forest",
      routeRatio: 0.428571
    },
    {
      id: "mountains",
      label: "Mountains",
      routeRatio: 0.571429
    },
    {
      id: "village",
      label: "Village",
      routeRatio: 0.714286
    },
    {
      id: "pond",
      label: "Pond",
      routeRatio: 0.785714
    },
    {
      id: "coast",
      label: "Coast",
      routeRatio: 0.857143
    },
    {
      id: "destination",
      label: "Winter Home",
      routeRatio: 1
    }
  ]);

  const FLIGHTS = Object.freeze({
    "2-3": {
      id: "A",
      label: "Flight A",
      collection: "Foundation",
      badgeLabel: "Flight A Badge",
      activeStopIds: [
        "home-tree", "meadow", "forest", "village", "coast", "destination"
      ]
    },

    "4-5": {
      id: "B",
      label: "Flight B",
      collection: "Expansion",
      badgeLabel: "Flight B Badge",
      activeStopIds: [
        "home-tree", "meadow", "river", "forest", "mountains",
        "pond", "village", "coast", "destination"
      ]
    },

    "6-8": {
      id: "C",
      label: "Flight C",
      collection: "Advanced",
      badgeLabel: "Flight C Badge",
      activeStopIds: [
        "home-tree", "meadow", "forest", "mountains", "village", "coast", "destination"
      ]
    }
  });

  const STOP_BY_ID = new Map(
    STOPS.map((stop) => [stop.id, stop])
  );

  function getFlightStops(flight) {
    return flight.activeStopIds
      .map((stopId) => {
        const stop = STOP_BY_ID.get(stopId);

        if (flight.id === "B") {
          if (stopId === "pond") {
            return { ...stop, routeRatio: 0.714286 };
          }

          if (stopId === "village") {
            return { ...stop, routeRatio: 0.785714 };
          }
        }

        return stop;
      })
      .filter(Boolean);
  }

  function isDevelopment() {
    return ["", "localhost", "127.0.0.1", "::1"]
      .includes(window.location.hostname);
  }


  function getFlight(flightValue) {
    return FLIGHTS[flightValue] || null;
  }


  function getFlightStatuses(
    student,
    flightValue
  ) {
    const flight =
      getFlight(flightValue);

    if (
      !flight ||
      !window.FirstVoloTokens
    ) {
      return [];
    }

    const statuses =
      window.FirstVoloTokens
        .evaluateStudent(student);

    return statuses.filter(
      (status) =>
        status.collection ===
        flight.collection
    );
  }


  function tokenIsEarned(
    student,
    status
  ) {
    return Boolean(
      window.FirstVoloTokens
        ?.isTokenEarned?.(
          student,
          status.setId
        )
    );
  }


  /*
    Transfer Check storage is intentionally
    separate from scored practice and from
    formal Pre/Post assessment items.

    This hook is ready for the later
    Transfer Challenge build.
  */
  function getTransferCheck(
    student,
    flight
  ) {
    const checks =
      student?.migrationTransferChecks;

    if (
      !checks ||
      typeof checks !== "object" ||
      Array.isArray(checks)
    ) {
      return null;
    }

    return (
      checks[flight.collection] ||
      null
    );
  }


  function getProgress(
    student,
    flightValue
  ) {
    const flight =
      getFlight(flightValue);

    if (!student || !flight) {
      return null;
    }

    const statuses =
      getFlightStatuses(
        student,
        flightValue
      );

    const stops =
      getFlightStops(flight);

    const instructionalDestinationCount =
      Math.max(0, stops.length - 2);

    if (
      statuses.length !== instructionalDestinationCount &&
      isDevelopment()
    ) {
      console.warn(
        `[FirstVoloMigration] ${flight.label} has ${statuses.length} token-set statuses but ${instructionalDestinationCount} instructional destinations.`
      );
    }

    const totalTokens =
      statuses.length;

    const earnedTokens =
      statuses.filter(
        (status) =>
          tokenIsEarned(
            student,
            status
          )
      ).length;

    const tokenRatio =
      totalTokens > 0
        ? earnedTokens / totalTokens
        : 0;

    const tokensComplete =
      totalTokens > 0 &&
      earnedTokens === totalTokens;

    const transferCheck =
      getTransferCheck(
        student,
        flight
      );

    const transferPassed =
      Boolean(
        transferCheck?.passed
      );

    const journeyComplete =
      tokensComplete &&
      transferPassed;

    const currentStopIndex =
      journeyComplete
        ? stops.length - 1
        : Math.min(
          instructionalDestinationCount,
          earnedTokens
        );

    const currentStop =
      stops[currentStopIndex];

    const nextStop =
      currentStopIndex <
        stops.length - 1
        ? stops[
            currentStopIndex + 1
          ]
        : null;

    const routeRatio =
      currentStop?.routeRatio || 0;

    return {
      flight,
      stops,

      instructionalDestinationCount,
      totalDestinations:
        instructionalDestinationCount,

      totalTokens,
      earnedTokens,
      tokenRatio,

      tokensComplete,

      transferUnlocked:
        tokensComplete,

      transferPassed,

      journeyComplete,

      postTestReady:
        journeyComplete,

      // Kept as a discrete index for compatibility. The physical route
      // uses routeRatio, which is defined by the canonical map geometry.
      routePosition: currentStopIndex,
      routeRatio,

      currentStopIndex,
      currentStop,
      nextStop,

      badgeEarned:
        journeyComplete,

      tokenStatuses:
        statuses
    };
  }


  window.FirstVoloMigration = {
    STOPS,
    FLIGHTS,
    getFlight,
    getFlightStops,
    getFlightStatuses,
    getProgress
  };

})();
