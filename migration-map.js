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
        x: 8,
        y: 66
      },

      "meadow": {
        x: 23,
        y: 34
      },

      "river": {
        x: 38,
        y: 64
      },

      "forest": {
        x: 52,
        y: 30
      },

      "mountains": {
        x: 64,
        y: 60
      },

      "village": {
        x: 76,
        y: 33
      },

      "coast": {
        x: 87,
        y: 62
      },

      "destination": {
        x: 94,
        y: 24
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
    "Volo Token Journey";

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
        "M 8 66",
        "C 12 51, 17 38, 23 34",
        "S 32 52, 38 64",
        "S 48 40, 52 30",
        "S 60 47, 64 60",
        "S 72 43, 76 33",
        "S 84 49, 87 62",
        "S 92 39, 94 24"
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

    base.setAttribute(
      "pathLength",
      "1"
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

    traveled.style.strokeDasharray =
      `${ratio} ${Math.max(
        0.0001,
        1 - ratio
      )}`;

    svg.append(
      base,
      traveled
    );

    return svg;
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
          Winter Home unlocks after transfer
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
        "All Volo Tokens for this Flight are earned. Complete the Transfer Challenge to reach Winter Home.";
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

    const student =
      getStudent();

    if (!student) {
      renderNoStudent();
      return;
    }

    const progress =
      window.FirstVoloMigration
        .getProgress(
          student,
          flightValue
        );

    if (!progress) {
      return;
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
