"use strict";

/*
  First Volo Morphology
  Volo Token earned celebration

  Sequence:
  1. Bird flies in carrying Token
  2. Bird hovers above collection slot
  3. Token drops into collection
  4. Counter updates
  5. Earned message appears
*/

(function () {

  const celebrationQueue = [];
  let celebrationOpen = false;


  function getDisplayLabel(token) {
    const label =
      String(token?.label || "Volo Token");

    const collection =
      String(token?.collection || "");

    if (
      collection &&
      label.startsWith(
        `${collection} `
      )
    ) {
      return label.slice(
        collection.length + 1
      );
    }

    return label;
  }


  function getCurrentLearningSetIds() {
    return new Set(
      (window.FIRST_VOLO_TOKEN_SETS || [])
        .map((set) => set.id)
        .filter(Boolean)
    );
  }


  function getCurrentLearningSetTotal() {
    return getCurrentLearningSetIds().size;
  }


  function getActiveStudentTokenCount() {
    try {
      const saved =
        JSON.parse(
          localStorage.getItem(
            "firstVoloMorphologyProgressV1"
          )
        );

      const student =
        saved?.students?.find(
          (item) =>
            item.id === saved.activeStudentId
        );

      const currentIds =
        getCurrentLearningSetIds();

      return Object.keys(
        student?.voloTokens || {}
      )
        .filter((id) => currentIds.has(id))
        .length;
    } catch (error) {
      return 0;
    }
  }


  function closeCelebration(
    overlay,
    escapeHandler
  ) {
    overlay.classList.remove(
      "is-visible"
    );

    document.removeEventListener(
      "keydown",
      escapeHandler
    );

    window.setTimeout(() => {
      overlay.remove();
      celebrationOpen = false;
      showNextCelebration();
    }, 220);
  }


  function showNextCelebration() {
    if (
      celebrationOpen ||
      !celebrationQueue.length
    ) {
      return;
    }

    celebrationOpen = true;

    const tokens =
      celebrationQueue.shift();

    const newestToken =
      tokens[tokens.length - 1];

    const currentEarned =
      getActiveStudentTokenCount();

    const previousEarned =
      Math.max(
        0,
        currentEarned - tokens.length
      );


    const overlay =
      document.createElement("div");

    overlay.className =
      "volo-token-celebration";

    overlay.setAttribute(
      "role",
      "dialog"
    );

    overlay.setAttribute(
      "aria-modal",
      "true"
    );

    overlay.setAttribute(
      "aria-labelledby",
      "voloTokenCelebrationTitle"
    );


    const card =
      document.createElement("div");

    card.className =
      "volo-token-celebration-card";


    /* -------------------------
       FLIGHT SCENE
       ------------------------- */

    const scene =
      document.createElement("div");

    scene.className =
      "volo-token-flight-scene";


    const bird =
      document.createElement("div");

    bird.className =
      "volo-token-delivery-bird";

    bird.setAttribute(
      "aria-hidden",
      "true"
    );

    bird.innerHTML = `
      <span class="volo-bird-tail"></span>
      <span class="volo-bird-body"></span>
      <span class="volo-bird-wing"></span>
      <span class="volo-bird-head"></span>
      <span class="volo-bird-eye"></span>
      <span class="volo-bird-beak"></span>
    `;


    const flyingToken =
      document.createElement("img");

    flyingToken.className =
      "volo-token-flying-token";

    flyingToken.src =
      "images/volo-token.png";

    flyingToken.alt = "";


    const collection =
      document.createElement("div");

    collection.className =
      "volo-token-collection-bank";


    const slot =
      document.createElement("div");

    slot.className =
      "volo-token-collection-slot";


    const collectionLabel =
      document.createElement("div");

    collectionLabel.className =
      "volo-token-collection-label";

    collectionLabel.textContent =
      "VOLO";


    const counter =
      document.createElement("div");

    counter.className =
      "volo-token-celebration-counter";

    counter.innerHTML =
      `<strong>${previousEarned}</strong>/${getCurrentLearningSetTotal()} Tokens`;


    collection.append(
      slot,
      collectionLabel
    );

    scene.append(
      bird,
      flyingToken,
      collection
    );


    /* -------------------------
       TEXT
       ------------------------- */

    const messageArea =
      document.createElement("div");

    messageArea.className =
      "volo-token-earned-content";


    const eyebrow =
      document.createElement("div");

    eyebrow.className =
      "volo-token-celebration-eyebrow";

    eyebrow.textContent =
      `${newestToken.collection} Token`;


    const heading =
      document.createElement("h2");

    heading.id =
      "voloTokenCelebrationTitle";

    heading.textContent =
      tokens.length === 1
        ? "Volo Token earned!"
        : `${tokens.length} Volo Tokens earned!`;


    const tokenName =
      document.createElement("div");

    tokenName.className =
      "volo-token-celebration-name";

    tokenName.textContent =
      tokens.length === 1
        ? getDisplayLabel(newestToken)
        : tokens
            .map(getDisplayLabel)
            .join(" · ");


    const message =
      document.createElement("p");

    message.className =
      "volo-token-celebration-message";

    message.textContent =
      "Your practice showed strong evidence across this set of word parts.";


    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "volo-token-celebration-button";

    button.textContent =
      "Keep flying ✈️";


    messageArea.append(
      eyebrow,
      heading,
      tokenName,
      message,
      button
    );


    card.append(
      scene,
      counter,
      messageArea
    );

    overlay.append(card);
    document.body.append(overlay);


    const escapeHandler =
      (event) => {
        if (event.key === "Escape") {
          closeCelebration(
            overlay,
            escapeHandler
          );
        }
      };


    button.addEventListener(
      "click",
      () => {
        closeCelebration(
          overlay,
          escapeHandler
        );
      }
    );


    document.addEventListener(
      "keydown",
      escapeHandler
    );


    requestAnimationFrame(() => {
      overlay.classList.add(
        "is-visible"
      );

      card.classList.add(
        "is-delivering"
      );
    });


    /*
      Update the visual collection count
      after the Token lands.
    */
    window.setTimeout(() => {
      counter.classList.add(
        "is-updated"
      );

      counter.innerHTML =
        `<strong>${currentEarned}</strong>/${getCurrentLearningSetTotal()} Tokens`;
    }, 1900);


    /*
      Reveal the earned message
      after delivery finishes.
    */
    window.setTimeout(() => {
      messageArea.classList.add(
        "is-visible"
      );

      button.focus();
    }, 2150);
  }


  window.addEventListener(
    "firstvolotokenearned",
    (event) => {

      const tokens =
        Array.isArray(
          event.detail?.tokens
        )
          ? event.detail.tokens
          : [];

      if (!tokens.length) {
        return;
      }

      celebrationQueue.push(tokens);
      showNextCelebration();
    }
  );

})();
