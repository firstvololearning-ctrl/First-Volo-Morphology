"use strict";

(() => {
  const gradeBandSelect =
    document.getElementById("gradeBandSelect");

  if (
    !gradeBandSelect ||
    !window.FirstVoloMigration
  ) {
    return;
  }

  const SCENE_IMAGES =
    Object.freeze({
      "home-tree":
        "images/migration/scenes/home-tree.png",

      "meadow":
        "images/migration/scenes/meadow.png",

      "river":
        "images/migration/scenes/river.png",

      "forest":
        "images/migration/scenes/forest.png",

      "mountains":
        "images/migration/scenes/mountains.png",

      "village":
        "images/migration/scenes/village.png",

      "coast":
        "images/migration/scenes/coast.png",

      "destination":
        "images/migration/scenes/destination.png"
    });

  const POSITIONS =
    Object.freeze({
      "home-tree": {
        x: 13,
        y: 62
      },

      "meadow": {
        x: 27,
        y: 48
      },

      "river": {
        x: 40,
        y: 60
      },

      "forest": {
        x: 53,
        y: 44
      },

      "mountains": {
        x: 65,
        y: 56
      },

      "village": {
        x: 76,
        y: 42
      },

      "coast": {
        x: 86,
        y: 55
      },

      "destination": {
        x: 90,
        y: 39
      }
    });

  const VOLO_POSES =
    Object.freeze([
      "images/volo/poses/volo-waving.png",
      "images/volo/poses/volo-flying-2.png",
      "images/volo/poses/volo-jumping.png",
      "images/volo/poses/volo-pointing.png",
      "images/volo/poses/volo-thinking.png",
      "images/volo/poses/volo-reading.png",
      "images/volo/poses/volo-flying-2.png",
      "images/volo/poses/volo-waving.png"
    ]);

  function getStudent() {
    return (
      window.FirstVoloActivityProgress
        ?.getActiveStudent?.() ||
      null
    );
  }

  const selectWrap =
    gradeBandSelect.closest(
      ".select-wrap"
    );

  const flightControl =
    gradeBandSelect.closest(
      ".practice-flight-control"
    );

  if (!selectWrap || !flightControl) {
    return;
  }

  const actions =
    document.createElement("div");

  actions.className =
    "migration-flight-actions";

  selectWrap.parentNode.insertBefore(
    actions,
    selectWrap
  );

  actions.append(selectWrap);

  const launchButton =
    document.createElement("button");

  launchButton.type = "button";

  launchButton.className =
    "migration-map-launch-button";

  launchButton.innerHTML =
    '<span aria-hidden="true">🧭</span>' +
    "<span>Volo's Migration Map</span>";

  actions.append(launchButton);

  const overlay =
    document.createElement("div");

  overlay.className =
    "migration-modal-overlay";

  overlay.hidden = true;

  const dialog =
    document.createElement("section");

  dialog.className =
    "migration-modal";

  dialog.setAttribute(
    "role",
    "dialog"
  );

  dialog.setAttribute(
    "aria-modal",
    "true"
  );

  dialog.setAttribute(
    "aria-labelledby",
    "migrationModalTitle"
  );

  const dialogHeader =
    document.createElement("div");

  dialogHeader.className =
    "migration-modal-header";

  const headerCopy =
    document.createElement("div");

  const eyebrow =
    document.createElement("p");

  eyebrow.className =
    "migration-modal-eyebrow";

  eyebrow.textContent =
    "Volo’s Migration Journey";

  const title =
    document.createElement("h2");

  title.id =
    "migrationModalTitle";

  title.textContent =
    "🧭 Volo's Migration Map";

  const subtitle =
    document.createElement("p");

  subtitle.className =
    "migration-modal-subtitle";

  subtitle.textContent =
    "Earn Volo Tokens to help Volo migrate from Summer Home to Winter Home.";

  headerCopy.append(
    eyebrow,
    title,
    subtitle
  );

  const closeButton =
    document.createElement("button");

  closeButton.type = "button";

  closeButton.className =
    "migration-modal-close";

  closeButton.setAttribute(
    "aria-label",
    "Close Volo's Migration Map"
  );

  closeButton.textContent =
    "×";

  dialogHeader.append(
    headerCopy,
    closeButton
  );

  const content =
    document.createElement("div");

  content.className =
    "migration-modal-content";

  dialog.append(
    dialogHeader,
    content
  );

  overlay.append(dialog);

  document.body.append(overlay);

  let returnFocus = null;

  function makeMapSketch() {
    const ns =
      "http://www.w3.org/2000/svg";

    const svg =
      document.createElementNS(
        ns,
        "svg"
      );

    svg.classList.add(
      "migration-map-sketch"
    );

    svg.setAttribute(
      "viewBox",
      "0 0 100 100"
    );

    svg.setAttribute(
      "preserveAspectRatio",
      "none"
    );

    svg.setAttribute(
      "aria-hidden",
      "true"
    );

    svg.innerHTML = `

      <!-- ==========================================
           LARGE LAND CONTOURS
           These make the board read as one region.
           ========================================== -->

      <g class="geo-contours">
        <path d="
          M3 31
          C13 25 22 24 31 28
          C42 33 50 31 59 26
          C68 21 78 20 87 24
          C93 27 97 28 99 28
        " />

        <path d="
          M3 39
          C13 34 23 33 32 37
          C42 42 51 39 60 34
          C69 29 78 29 87 33
          C93 36 97 36 99 36
        " />

        <path d="
          M3 73
          C14 67 25 67 35 72
          C45 77 55 76 64 71
          C74 66 84 66 94 71
          C96 72 98 73 99 73
        " />

        <path d="
          M4 82
          C15 76 26 76 37 81
          C48 86 59 84 69 79
          C79 74 89 75 99 80
        " />
      </g>


      <!-- ==========================================
           SUMMER HOME + MEADOW COUNTRY
           Soft rolling open land.
           ========================================== -->

      <g class="geo-meadow">
        <path d="
          M5 51
          C10 46 15 44 20 47
          C25 50 30 50 35 46
        " />

        <path d="
          M6 56
          C12 51 17 50 22 53
          C27 56 32 55 37 51
        " />

        <path d="M17 38 C21 35 25 35 29 38" />
        <path d="M16 42 C21 39 26 39 31 42" />
        <path d="M16 46 C21 43 27 43 32 46" />

        <path d="
          M9 66
          C14 63 18 63 23 65
          C27 67 31 67 35 64
        " />
      </g>


      <!-- ==========================================
           RIVER BASIN
           One recognisable winding water system.
           ========================================== -->

      <g class="geo-river">
        <path d="
          M37 19
          C34 27 39 32 36 39
          C33 46 38 51 36 58
          C34 65 38 70 43 75
          C46 78 48 81 49 85
        " />

        <path d="
          M40 19
          C37 27 42 32 39 39
          C36 46 41 51 39 58
          C37 65 41 69 46 74
          C49 77 51 80 52 84
        " />

        <path d="
          M24 57
          C29 54 33 54 38 58
        " />

        <path d="
          M39 47
          C44 44 48 45 52 49
        " />
      </g>


      <!-- ==========================================
           FOREST REGION
           Irregular woodland edges, not icons.
           ========================================== -->

      <g class="geo-forest">
        <path d="
          M39 23
          C41 18 45 16 48 18
          C50 14 55 14 57 18
          C61 16 65 19 64 23
          C67 26 64 30 60 30
          C58 34 53 34 50 31
          C46 34 41 31 42 27
          C39 27 38 25 39 23
        " />

        <path d="
          M42 28
          C46 26 50 26 54 28
          C58 30 61 29 64 27
        " />

        <path d="
          M43 32
          C47 30 51 30 55 32
          C58 34 61 33 63 31
        " />

        <path d="M46 22 L46 28" />
        <path d="M51 20 L51 28" />
        <path d="M56 21 L56 29" />
        <path d="M60 23 L60 29" />
      </g>


      <!-- ==========================================
           MOUNTAIN COUNTRY
           Long ridgelines instead of triangles.
           ========================================== -->

      <g class="geo-mountains">
        <path d="
          M51 47
          C55 42 58 36 61 31
          C64 35 66 40 69 43
          C72 39 75 33 78 30
          C81 34 84 40 88 44
        " />

        <path d="
          M49 52
          C54 48 58 46 62 48
          C66 51 70 50 74 46
          C78 43 82 44 87 49
        " />

        <path d="
          M54 57
          C59 53 63 53 67 56
          C71 59 76 58 80 54
        " />

        <path d="M60 34 C62 37 64 37 66 35" />
        <path d="M76 33 C78 36 80 36 82 34" />
      </g>


      <!-- ==========================================
           VILLAGE / FARMLAND
           Parcels and gentle cultivated curves.
           ========================================== -->

      <g class="geo-fields">
        <path d="
          M68 48
          C72 45 76 45 80 48
          C84 51 88 50 92 47
        " />

        <path d="M69 53 C74 50 79 50 84 53" />
        <path d="M69 57 C74 54 79 54 84 57" />
        <path d="M69 61 C74 58 79 58 84 61" />
        <path d="M69 65 C74 62 79 62 84 65" />

        <path d="M73 51 C74 56 74 61 73 66" />
        <path d="M79 50 C80 56 80 61 79 66" />

        <path d="
          M84 42
          C87 39 90 39 93 42
          C95 44 97 44 99 42
        " />
      </g>


      <!-- ==========================================
           COASTAL REGION
           Land edge flows toward Winter Home.
           ========================================== -->

      <g class="geo-coast">
        <path d="
          M75 68
          C79 65 82 67 85 70
          C88 72 91 69 93 66
          C95 63 97 64 99 65
        " />

        <path d="
          M77 73
          C81 70 84 72 87 75
          C90 77 93 74 95 72
          C97 70 98 70 99 71
        " />

        <path d="
          M79 78
          C83 75 86 77 89 79
          C92 81 95 79 99 76
        " />

        <path d="M82 83 C86 81 90 83 94 82" />
        <path d="M87 87 C90 85 94 87 98 86" />
      </g>


      <!-- ==========================================
           WINTER HOME / TROPICAL END REGION
           A small island/coast hint.
           ========================================== -->

      <g class="geo-destination">
        <path d="
          M87 25
          C90 21 94 20 97 23
          C99 25 99 29 97 31
          C94 34 89 33 87 30
          C86 28 86 27 87 25
        " />

        <path d="M92 26 C92 22 93 18 94 15" />
        <path d="M94 15 C91 13 89 15 88 17" />
        <path d="M94 15 C97 13 99 14 99 17" />
      </g>


      <!-- ==========================================
           SMALL SUPPORTING DETAILS
           ========================================== -->

      <g class="geo-birds">
        <path d="M27 18 C28 17 29 17 30 18 C31 17 32 17 33 18" />
        <path d="M68 15 C69 14 70 14 71 15 C72 14 73 14 74 15" />
      </g>

      <g class="geo-compass">
        <circle class="compass-ring" cx="8" cy="12" r="4.4" />
        <circle class="compass-center" cx="8" cy="12" r=".7" />

        <path class="compass-main"
          d="M8 6.5 L9.2 10.8 L13.5 12 L9.2 13.2 L8 17.5 L6.8 13.2 L2.5 12 L6.8 10.8 Z" />

        <path class="compass-diagonal"
          d="M4.3 8.3 L7.2 11.2 L11.7 8.3 L8.8 11.2 L11.7 15.7 L8.8 12.8 L4.3 15.7 L7.2 12.8 Z" />

        <text class="compass-n" x="8" y="5.2" text-anchor="middle">N</text>
      </g>
    `;

    return svg;
  }



  function makeRoute(
    progress
  ) {
    const ns =
      "http://www.w3.org/2000/svg";

    const svg =
      document.createElementNS(
        ns,
        "svg"
      );

    svg.classList.add(
      "migration-map-route"
    );

    svg.setAttribute(
      "viewBox",
      "0 0 100 100"
    );

    svg.setAttribute(
      "preserveAspectRatio",
      "none"
    );

    svg.setAttribute(
      "aria-hidden",
      "true"
    );

    const pathData =
      [
        "M 13 62",
        "C 18 59, 23 50, 27 48",
        "C 32 47, 36 56, 40 60",
        "C 45 59, 49 48, 53 44",
        "C 57 43, 62 52, 65 56",
        "C 69 55, 73 46, 76 42",
        "C 80 41, 83 50, 86 55",
        "C 89 53, 90 45, 90 39"
      ].join(" ");

    const base =
      document.createElementNS(
        ns,
        "path"
      );

    base.setAttribute(
      "d",
      pathData
    );

    base.classList.add(
      "migration-map-route-base"
    );

    const traveled =
      document.createElementNS(
        ns,
        "path"
      );

    traveled.setAttribute(
      "d",
      pathData
    );

    traveled.setAttribute(
      "pathLength",
      "1"
    );

    traveled.classList.add(
      "migration-map-route-traveled"
    );

    const ratio =
      Math.max(
        0,
        Math.min(
          1,
          progress.routePosition /
            (
              progress.stops.length -
              1
            )
        )
      );

    if (ratio <= 0) {
      traveled.style.display =
        "none";
    } else if (ratio >= 1) {
      traveled.style.strokeDasharray =
        "1 0";
    } else {
      traveled.style.strokeDasharray =
        `${ratio} ${Math.max(
          0.0001,
          1 - ratio
        )}`;
    }

    svg.append(
      base,
      traveled
    );

    return svg;
  }

  function positionRewardOnRoute(
    map,
    rewardAccess,
    progress
  ) {
    const tokenIndex =
      progress.tokenStatuses.findIndex(
        (status) =>
          status.setId ===
          rewardAccess.dataset.unlockToken
      );

    if (
      tokenIndex < 0 ||
      progress.totalTokens < 1
    ) {
      return false;
    }

    const tokenOrdinal =
      tokenIndex + 1;

    const tokenRatio =
      tokenOrdinal /
      progress.totalTokens;

    const routePosition =
      tokenRatio *
      (progress.stops.length - 2);

    const routeRatio =
      routePosition /
      (progress.stops.length - 1);

    const routePath =
      map.querySelector(
        ".migration-map-route-base"
      );

    if (!routePath?.getTotalLength) {
      return false;
    }

    const point =
      routePath.getPointAtLength(
        routePath.getTotalLength() *
        routeRatio
      );

    rewardAccess.style.left =
      `${point.x}%`;

    rewardAccess.style.top =
      `${point.y}%`;

    rewardAccess.dataset.routePosition =
      String(routePosition);

    rewardAccess.dataset.routeRatio =
      String(routeRatio);

    return true;
  }

  function makeVolo(index) {
    const image =
      document.createElement("img");

    image.className =
      "migration-moving-volo";

    image.src =
      VOLO_POSES[index] ||
      VOLO_POSES[1];

    image.alt =
      "Volo is here";

    return image;
  }

  function makePlace(
    stop,
    index,
    progress
  ) {
    const position =
      POSITIONS[stop.id];

    const place =
      document.createElement("div");

    place.className =
      `migration-map-place migration-place-${stop.id}`;

    place.style.left =
      `${position.x}%`;

    place.style.top =
      `${position.y}%`;

    const current =
      index ===
      progress.currentStopIndex;

    const reached =
      progress.routePosition >=
      index - 0.000001;

    const locked =
      stop.id === "destination" &&
      !progress.journeyComplete;

    if (current) {
      place.classList.add(
        "is-current"
      );
    }

    if (reached) {
      place.classList.add(
        "is-reached"
      );
    }

    if (locked) {
      place.classList.add(
        "is-locked"
      );
    }

    const scene =
      document.createElement("div");

    scene.className =
      "migration-map-scene";

    const sceneImage =
      document.createElement("img");

    sceneImage.src =
      SCENE_IMAGES[stop.id];

    sceneImage.alt = "";

    scene.append(
      sceneImage
    );

    const marker =
      document.createElement("span");

    marker.className =
      "migration-map-marker";

    marker.textContent =
      reached &&
      !current
        ? "✓"
        : String(index + 1);

    marker.setAttribute(
      "aria-hidden",
      "true"
    );

    const label =
      document.createElement("span");

    label.className =
      "migration-map-label";

    label.textContent =
      stop.label;

    place.append(
      scene,
      marker,
      label
    );

    if (current) {
      place.append(
        makeVolo(index)
      );
    }

    let state =
      "ahead";

    if (current) {
      state =
        "current location";
    } else if (reached) {
      state =
        "reached";
    } else if (locked) {
      state =
        "locked until transfer";
    }

    place.setAttribute(
      "aria-label",
      `${stop.label}: ${state}`
    );

    return place;
  }

  function makeLegend() {
    const legend =
      document.createElement("div");

    legend.className =
      "migration-map-legend";

    legend.innerHTML =
      `
        <span>
          <i class="migration-legend-line is-traveled"></i>
          Route traveled
        </span>

        <span>
          <i class="migration-legend-line"></i>
          Route ahead
        </span>

        <span>
          <b aria-hidden="true">★</b>
          Winter Home unlocks after the Migration Challenge
        </span>
      `;

    return legend;
  }

  function renderMessage(
    progress
  ) {
    const box =
      document.createElement("div");

    box.className =
      "migration-map-message";

    const strong =
      document.createElement("strong");

    const text =
      document.createElement("span");

    if (
      progress.journeyComplete
    ) {
      strong.textContent =
        "Migration complete.";

      text.textContent =
        "Volo reached Winter Home. This Flight is ready for the post-test.";
    } else if (
      progress.tokensComplete
    ) {
      strong.textContent =
        "Volo reached the Coast.";

      text.textContent =
        `Complete the final Migration Challenge to show what you know about the word parts you learned in ${progress.flight.label}. Complete the challenge successfully to help Volo reach Winter Home.`;
    } else if (
      progress.earnedTokens === 0
    ) {
      strong.textContent =
        "Volo is ready to migrate.";

      text.textContent =
        "Earn Volo Tokens to help Volo travel from Summer Home toward Winter Home.";
    } else {
      strong.textContent =
        `Volo reached ${progress.currentStop.label}.`;

      text.textContent =
        progress.nextStop
          ? `Keep earning Tokens to travel toward ${progress.nextStop.label}.`
          : "Keep going.";
    }

    box.append(
      strong,
      text
    );

    /*
      Once every Volo Token in this Flight
      is earned, the Transfer Challenge is
      the final step before Winter Home.
    */
    const transferTestMode =
      new URLSearchParams(
        window.location.search
      ).get("transferTest") === "1";

    if (
      (
        progress.tokensComplete ||
        transferTestMode
      ) &&
      !progress.transferPassed
    ) {
      const transferButton =
        document.createElement("button");

      transferButton.type =
        "button";

      transferButton.className =
        "transfer-challenge-launch-button";

      transferButton.textContent =
        "🧠 Start Migration Challenge";

      transferButton.addEventListener(
        "click",
        () => {
          window.FirstVoloTransferChallengeUI
            ?.open?.(
              getStudent(),
              gradeBandSelect.value
            );
        }
      );

      box.append(
        transferButton
      );
    }

    return box;
  }

  function renderNoFlight() {
    content.innerHTML = "";

    const message =
      document.createElement("div");

    message.className =
      "migration-map-empty";

    message.innerHTML =
      `
        <strong>Choose a Practice Flight.</strong>
        <span>
          Select Flight A, B, or C to see Volo's migration journey.
        </span>
      `;

    content.append(message);
  }

  function renderNoStudent() {
    content.innerHTML = "";

    const message =
      document.createElement("div");

    message.className =
      "migration-map-empty";

    message.innerHTML =
      `
        <strong>Choose a learner first.</strong>
        <span>
          Volo's Migration Map uses that learner's earned Volo Tokens.
        </span>
      `;

    content.append(message);
  }

  function render() {
    content.innerHTML = "";

    const flightValue =
      gradeBandSelect.value;

    const flight =
      window.FirstVoloMigration
        .getFlight(
          flightValue
        );

    if (!flight) {
      renderNoFlight();
      return;
    }

    let student =
      getStudent();

    const rewardTestState =
      window.FirstVoloRewards
        ?.getTestState?.();

    if (!student && rewardTestState) {
      student = {
        id: "reward-preview",
        name: "Reward Preview"
      };
    }

    if (!student) {
      renderNoStudent();
      return;
    }

    let progress =
      window.FirstVoloMigration
        .getProgress(
          student,
          flightValue
        );

    if (!progress) {
      return;
    }

    /*
      TEST MODE ONLY

      The real migration engine remains untouched.

      ?transferTest=1 visually simulates:
        all Flight tokens earned -> Coast
        Migration Challenge passed -> Winter Home

      No Volo Tokens are written or awarded here.
    */
    const transferTestMode =
      new URLSearchParams(
        window.location.search
      ).get("transferTest") === "1";

    if (transferTestMode) {
      const destinationIndex =
        progress.stops.length - 1;

      const coastIndex =
        destinationIndex - 1;

      const simulatedJourneyComplete =
        Boolean(
          progress.transferPassed
        );

      const simulatedStopIndex =
        simulatedJourneyComplete
          ? destinationIndex
          : coastIndex;

      progress = {
        ...progress,

        earnedTokens:
          progress.totalTokens,

        tokenRatio: 1,

        tokensComplete: true,
        transferUnlocked: true,

        journeyComplete:
          simulatedJourneyComplete,

        postTestReady:
          simulatedJourneyComplete,

        badgeEarned:
          simulatedJourneyComplete,

        routePosition:
          simulatedStopIndex,

        currentStopIndex:
          simulatedStopIndex,

        currentStop:
          progress.stops[
            simulatedStopIndex
          ],

        nextStop:
          simulatedJourneyComplete
            ? null
            : progress.stops[
                destinationIndex
              ]
      };
    }

    const summary =
      document.createElement("div");

    summary.className =
      "migration-map-summary";

    const learner =
      document.createElement("span");

    learner.textContent =
      `${student.name} · ${progress.flight.label}`;

    const tokens =
      document.createElement("span");

    tokens.className =
      "migration-map-token-count";

    tokens.innerHTML =
      `<b>${progress.earnedTokens}</b> of ${progress.totalTokens} Volo Tokens`;

    summary.append(
      learner,
      tokens
    );

    const scroll =
      document.createElement("div");

    scroll.className =
      "migration-map-scroll";

    const map =
      document.createElement("div");

    map.className =
      "migration-connected-map";

    map.append(
      makeMapSketch(),
      makeRoute(progress)
    );

    progress.stops.forEach(
      (stop, index) => {
        map.append(
          makePlace(
            stop,
            index,
            progress
          )
        );
      }
    );

    const rewardAccess =
      window.FirstVoloRewards
        ?.createJourneyAccess?.(
          student,
          flightValue
        );

    if (rewardAccess) {
      map.append(rewardAccess);
      positionRewardOnRoute(
        map,
        rewardAccess,
        progress
      );
    }

    scroll.append(map);

    content.append(
      summary,
      scroll,
      makeLegend(),
      renderMessage(progress)
    );
  }

  function openModal() {
    returnFocus =
      document.activeElement;

    render();

    overlay.hidden =
      false;

    document.body.classList.add(
      "migration-modal-open"
    );

    closeButton.focus();
  }

  function closeModal() {
    overlay.hidden =
      true;

    document.body.classList.remove(
      "migration-modal-open"
    );

    returnFocus?.focus?.();
  }

  launchButton.addEventListener(
    "click",
    openModal
  );

  closeButton.addEventListener(
    "click",
    closeModal
  );

  overlay.addEventListener(
    "click",
    (event) => {
      if (
        event.target === overlay
      ) {
        closeModal();
      }
    }
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape" &&
        !overlay.hidden
      ) {
        closeModal();
      }
    }
  );

  gradeBandSelect.addEventListener(
    "change",
    () => {
      if (!overlay.hidden) {
        render();
      }
    }
  );

  document
    .getElementById(
      "activityStudentSelect"
    )
    ?.addEventListener(
      "change",
      () => {
        if (!overlay.hidden) {
          setTimeout(
            render,
            0
          );
        }
      }
    );

  window.addEventListener(
    "firstvoloprogresschange",
    () => {
      if (!overlay.hidden) {
        render();
      }
    }
  );

  window.addEventListener(
    "firstvolotokenearned",
    () => {
      if (!overlay.hidden) {
        render();
      }
    }
  );

  window.FirstVoloMigrationMap = {
    open: openModal,
    close: closeModal,
    render
  };
})();
