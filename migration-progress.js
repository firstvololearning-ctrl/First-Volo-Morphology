"use strict";

/*
  First Volo Morphology — Volo Migration Progress

  The migration is a kid-facing visualization of the
  existing Volo Token achievement system.

  Token rules are NOT changed here.

  Journey structure:
    Home Tree
    Meadow
    River
    Forest
    Mountains
    Village
    Coast
    Destination

  Tokens move Volo from Home Tree through the Coast.

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
      label: "Summer Home"
    },
    {
      id: "meadow",
      label: "Meadow"
    },
    {
      id: "river",
      label: "River"
    },
    {
      id: "forest",
      label: "Forest"
    },
    {
      id: "mountains",
      label: "Mountains"
    },
    {
      id: "village",
      label: "Village"
    },
    {
      id: "coast",
      label: "Coast"
    },
    {
      id: "destination",
      label: "Winter Home"
    }
  ]);

  const FLIGHTS = Object.freeze({
    "2-3": {
      id: "A",
      label: "Flight A",
      collection: "Foundation",
      badgeLabel: "Foundation Badge"
    },

    "4-5": {
      id: "B",
      label: "Flight B",
      collection: "Expansion",
      badgeLabel: "Expansion Badge"
    },

    "6-8": {
      id: "C",
      label: "Flight C",
      collection: "Advanced",
      badgeLabel: "Advanced Badge"
    }
  });


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

    /*
      Token progress occupies stops 0–6:
      Home Tree through Coast.

      Stop 7 (Destination) is reserved
      for successful transfer.
    */
    const coastIndex =
      STOPS.length - 2;

    const tokenRoutePosition =
      tokenRatio * coastIndex;

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

    const routePosition =
      journeyComplete
        ? STOPS.length - 1
        : tokenRoutePosition;

    const currentStopIndex =
      Math.min(
        STOPS.length - 1,
        Math.floor(
          routePosition + 0.000001
        )
      );

    const currentStop =
      STOPS[currentStopIndex];

    const nextStop =
      currentStopIndex <
        STOPS.length - 1
        ? STOPS[
            currentStopIndex + 1
          ]
        : null;

    return {
      flight,
      stops: STOPS,

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

      routePosition,

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
    getFlightStatuses,
    getProgress
  };

})();
