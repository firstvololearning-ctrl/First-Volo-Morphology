"use strict";

/*
  First Volo Morphology — Migration Challenge UI

  The Migration Challenge:
  - appears only after all Volo Tokens for a Flight are earned
  - uses reserved novel words
  - gives no item-by-item correctness feedback
  - does not create a regular practice session
  - does not affect Volo Token calculations
  - stores results separately in migrationTransferChecks
  - uses the alternate form after an unsuccessful attempt
*/

(function () {

  const transfer =
    window.FirstVoloTransferChallenge;

  if (!transfer) {
    return;
  }


  /* ========================================
     STATE
     ======================================== */

  let activeStudent = null;
  let activeFlightValue = null;
  let activeFormId = null;
  let activeForm = null;

  let currentIndex = 0;
  let responses = {};
  let currentSelection = null;

  let returnFocus = null;


  /* ========================================
     DIALOG
     ======================================== */

  const overlay =
    document.createElement("div");

  overlay.className =
    "transfer-challenge-overlay";

  overlay.hidden = true;


  const dialog =
    document.createElement("section");

  dialog.className =
    "transfer-challenge-dialog";

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
    "transferChallengeTitle"
  );


  const header =
    document.createElement("div");

  header.className =
    "transfer-challenge-header";


  const headerCopy =
    document.createElement("div");


  const eyebrow =
    document.createElement("div");

  eyebrow.className =
    "transfer-challenge-eyebrow";

  eyebrow.textContent =
    "Final Migration Step";


  const title =
    document.createElement("h2");

  title.id =
    "transferChallengeTitle";

  title.textContent =
    "🧠 Migration Challenge";


  const subtitle =
    document.createElement("p");

  subtitle.className =
    "transfer-challenge-subtitle";

  subtitle.textContent =
    "Use what you know about word parts to figure out new words.";


  headerCopy.append(
    eyebrow,
    title,
    subtitle
  );


  const closeButton =
    document.createElement("button");

  closeButton.type =
    "button";

  closeButton.className =
    "transfer-challenge-close";

  closeButton.setAttribute(
    "aria-label",
    "Close Migration Challenge"
  );

  closeButton.textContent =
    "×";


  header.append(
    headerCopy,
    closeButton
  );


  const content =
    document.createElement("div");

  content.className =
    "transfer-challenge-content";


  dialog.append(
    header,
    content
  );

  overlay.append(dialog);

  document.body.append(overlay);


  /* ========================================
     HELPERS
     ======================================== */

  function getFlight() {
    return transfer.getFlight(
      activeFlightValue
    );
  }


  function getExistingCheck() {
    const flight =
      getFlight();

    if (
      !activeStudent ||
      !flight
    ) {
      return null;
    }

    return (
      activeStudent
        .migrationTransferChecks
        ?.[flight.collection] ||
      null
    );
  }


  function ensureTransferStore() {
    if (
      !activeStudent
        .migrationTransferChecks ||
      typeof activeStudent
        .migrationTransferChecks !==
        "object" ||
      Array.isArray(
        activeStudent
          .migrationTransferChecks
      )
    ) {
      activeStudent
        .migrationTransferChecks = {};
    }

    return activeStudent
      .migrationTransferChecks;
  }


  function selectionIsReady() {
    if (
      currentSelection instanceof Set
    ) {
      return (
        currentSelection.size > 0
      );
    }

    return (
      currentSelection !== null &&
      currentSelection !== undefined &&
      currentSelection !== ""
    );
  }


  function openOverlay() {
    overlay.hidden = false;

    document.body.classList.add(
      "transfer-challenge-open"
    );
  }


  function closeOverlay() {
    overlay.hidden = true;

    document.body.classList.remove(
      "transfer-challenge-open"
    );

    returnFocus?.focus?.();
  }


  /* ========================================
     INTRO / LOCKED STATES
     ======================================== */

  function renderLocked() {
    content.innerHTML = `
      <div class="transfer-challenge-state">
        <div
          class="transfer-challenge-state-icon"
          aria-hidden="true"
        >
          🔒
        </div>

        <h3>
          Migration Challenge is not ready yet.
        </h3>

        <p>
          Earn all of the Volo Tokens for this
          Practice Flight first.
        </p>

        <button
          class="transfer-secondary-button"
          type="button"
          data-transfer-close
        >
          Back to Migration Map
        </button>
      </div>
    `;

    content
      .querySelector(
        "[data-transfer-close]"
      )
      ?.addEventListener(
        "click",
        closeOverlay
      );
  }


  function renderAlreadyPassed() {
    const flight =
      getFlight();

    content.innerHTML = `
      <div class="transfer-challenge-state">
        <div
          class="transfer-challenge-state-icon"
          aria-hidden="true"
        >
          ⭐
        </div>

        <h3>
          Migration Challenge complete!
        </h3>

        <p>
          ${activeStudent.name} has already
          completed the ${flight.label}
          Migration Challenge.
        </p>

        <p>
          Volo reached Winter Home!
        </p>

        <button
          class="transfer-primary-button"
          type="button"
          data-transfer-close
        >
          Return to Migration Map
        </button>
      </div>
    `;

    content
      .querySelector(
        "[data-transfer-close]"
      )
      ?.addEventListener(
        "click",
        closeOverlay
      );
  }


  function renderIntro() {
    const flight =
      getFlight();

    const existingCheck =
      getExistingCheck();

    activeFormId =
      transfer.getNextFormId(
        existingCheck
      );

    activeForm =
      transfer.getForm(
        activeFlightValue,
        activeFormId
      );

    const priorAttempts =
      Array.isArray(
        existingCheck?.attempts
      )
        ? existingCheck.attempts.length
        : 0;

    content.innerHTML = `
      <div class="transfer-challenge-intro">

        <div class="transfer-challenge-flight">
          ${activeStudent.name}
          <span aria-hidden="true">·</span>
          ${flight.label}
        </div>

        <h3>
          Ready for the final migration step?
        </h3>

        <p>
          You will see
          <strong>5 new-word questions</strong>.
          Use the word parts you have learned
          to figure them out.
        </p>

        <div class="transfer-challenge-rules">
          <span>5 questions</span>
          <span>4 correct to pass</span>
          <span>No timer</span>
        </div>

        <p class="transfer-challenge-note">
          These words are new for this challenge.
          Your answers will not change your
          Volo Tokens.
        </p>

        ${
          priorAttempts > 0
            ? `
              <p class="transfer-challenge-retry-note">
                This attempt will use the alternate
                Migration Challenge form.
              </p>
            `
            : ""
        }

        <div class="transfer-challenge-intro-actions">

          <button
            class="transfer-secondary-button"
            type="button"
            data-transfer-close
          >
            Not Yet
          </button>

          <button
            class="transfer-primary-button"
            type="button"
            data-transfer-start
          >
            Start Challenge
          </button>

        </div>

      </div>
    `;

    content
      .querySelector(
        "[data-transfer-close]"
      )
      ?.addEventListener(
        "click",
        closeOverlay
      );

    content
      .querySelector(
        "[data-transfer-start]"
      )
      ?.addEventListener(
        "click",
        startChallenge
      );
  }


  /* ========================================
     START
     ======================================== */

  function startChallenge() {
    currentIndex = 0;
    responses = {};
    currentSelection = null;

    renderQuestion();
  }


  /* ========================================
     QUESTION
     ======================================== */

  function renderQuestion() {
    const item =
      activeForm.items[
        currentIndex
      ];

    if (!item) {
      finishChallenge();
      return;
    }

    currentSelection =
      item.type === "multi"
        ? new Set()
        : null;

    content.innerHTML = "";


    const progress =
      document.createElement("div");

    progress.className =
      "transfer-question-progress";

    progress.innerHTML = `
      <span>
        Question ${currentIndex + 1}
        of ${activeForm.items.length}
      </span>

      <span>
        ${getFlight().label}
      </span>
    `;


    const bar =
      document.createElement("div");

    bar.className =
      "transfer-progress-track";

    const fill =
      document.createElement("div");

    fill.className =
      "transfer-progress-fill";

    fill.style.width =
      `${
        (
          currentIndex /
          activeForm.items.length
        ) * 100
      }%`;

    bar.append(fill);


    const question =
      document.createElement("div");

    question.className =
      "transfer-question";


    const directions =
      document.createElement("p");

    directions.className =
      "transfer-question-directions";

    directions.textContent =
      item.type === "multi"
        ? "Choose all of the word parts that answer the question."
        : "Choose the best answer.";


    const prompt =
      document.createElement("h3");

    prompt.className =
      "transfer-question-prompt";

    prompt.textContent =
      item.prompt;


    const choices =
      document.createElement("div");

    choices.className =
      item.type === "multi"
        ? "transfer-choice-grid is-multi"
        : "transfer-choice-grid";

    choices.setAttribute(
      "role",
      item.type === "multi"
        ? "group"
        : "radiogroup"
    );


    const continueButton =
      document.createElement("button");

    continueButton.type =
      "button";

    continueButton.className =
      "transfer-primary-button transfer-next-button";

    continueButton.disabled = true;

    continueButton.textContent =
      currentIndex ===
      activeForm.items.length - 1
        ? "Finish Challenge"
        : "Next";


    function updateContinue() {
      continueButton.disabled =
        !selectionIsReady();
    }


    item.choices.forEach(
      (choice) => {

        const button =
          document.createElement("button");

        button.type =
          "button";

        button.className =
          "transfer-choice-button";

        button.textContent =
          choice;

        button.setAttribute(
          "aria-pressed",
          "false"
        );


        button.addEventListener(
          "click",
          () => {

            if (
              item.type === "multi"
            ) {
              if (
                currentSelection.has(
                  choice
                )
              ) {
                currentSelection.delete(
                  choice
                );

                button.classList.remove(
                  "is-selected"
                );

                button.setAttribute(
                  "aria-pressed",
                  "false"
                );
              } else {
                currentSelection.add(
                  choice
                );

                button.classList.add(
                  "is-selected"
                );

                button.setAttribute(
                  "aria-pressed",
                  "true"
                );
              }
            } else {
              currentSelection =
                choice;

              choices
                .querySelectorAll(
                  ".transfer-choice-button"
                )
                .forEach(
                  (other) => {
                    const selected =
                      other === button;

                    other.classList.toggle(
                      "is-selected",
                      selected
                    );

                    other.setAttribute(
                      "aria-pressed",
                      String(selected)
                    );
                  }
                );
            }

            updateContinue();
          }
        );


        choices.append(button);
      }
    );


    continueButton.addEventListener(
      "click",
      submitCurrentQuestion
    );


    question.append(
      directions,
      prompt,
      choices,
      continueButton
    );


    content.append(
      progress,
      bar,
      question
    );
  }


  /* ========================================
     SAVE ONE RESPONSE LOCALLY IN ATTEMPT
     ======================================== */

  function submitCurrentQuestion() {
    if (!selectionIsReady()) {
      return;
    }

    const item =
      activeForm.items[
        currentIndex
      ];

    responses[item.id] =
      currentSelection instanceof Set
        ? [...currentSelection]
        : currentSelection;

    const isLast =
      currentIndex ===
      activeForm.items.length - 1;

    if (isLast) {
      finishChallenge();
      return;
    }

    currentIndex += 1;

    renderQuestion();
  }


  /* ========================================
     FINISH + STORE SEPARATELY
     ======================================== */

  function finishChallenge() {
    const scored =
      transfer.scoreAttempt(
        activeFlightValue,
        activeFormId,
        responses
      );

    const attempt =
      transfer.makeAttemptRecord(
        scored
      );

    const store =
      ensureTransferStore();

    const existingCheck =
      store[
        scored.collection
      ] || null;

    const merged =
      transfer.mergeTransferCheck(
        existingCheck,
        attempt
      );

    store[
      scored.collection
    ] = merged;


    /*
      Save through the existing learner-progress
      store so local storage + cloud sync remain
      centralized.

      The Transfer Challenge itself is NOT added
      to student.sessions, so it cannot affect
      regular activity accuracy or Volo Tokens.
    */
    window.FirstVoloActivityProgress
      ?.save?.();


    window.dispatchEvent(
      new CustomEvent(
        "firstvolotransferchange",
        {
          detail: {
            studentId:
              activeStudent.id,

            flightValue:
              activeFlightValue,

            collection:
              scored.collection,

            score:
              scored.score,

            total:
              scored.total,

            passed:
              scored.passed
          }
        }
      )
    );


    renderResult(
      attempt,
      merged
    );
  }


  /* ========================================
     RESULT
     ======================================== */

  function renderResult(
    attempt,
    merged
  ) {
    const passed =
      Boolean(
        attempt.passed
      );

    content.innerHTML = `
      <div
        class="
          transfer-challenge-result
          ${
            passed
              ? "is-passed"
              : "is-not-yet"
          }
        "
      >

        <div
          class="transfer-result-icon"
          aria-hidden="true"
        >
          ${
            passed
              ? "⭐"
              : "🧭"
          }
        </div>

        <div class="transfer-result-label">
          ${
            passed
              ? "Migration Challenge complete!"
              : "Not quite yet"
          }
        </div>

        <div class="transfer-result-score">
          ${attempt.score}
          <span>
            / ${attempt.total}
          </span>
        </div>

        ${
          passed
            ? `
              <h3>
                Volo reached Winter Home!
              </h3>

              <p>
                You showed that you can use
                familiar word parts to figure out
                new words.
              </p>

              <p class="transfer-challenge-note">
                This Practice Flight is now
                Post-Test Ready.
              </p>
            `
            : `
              <h3>
                Keep building your word-part skills.
              </h3>

              <p>
                You need 4 out of 5 to complete
                the migration.
              </p>

              <p class="transfer-challenge-note">
                Your migration progress stays exactly
                where it is. The next Migration
                Challenge attempt will use the
                alternate form.
              </p>
            `
        }

        <button
          class="transfer-primary-button"
          type="button"
          data-transfer-finish
        >
          Return to Migration Map
        </button>

      </div>
    `;


    content
      .querySelector(
        "[data-transfer-finish]"
      )
      ?.addEventListener(
        "click",
        closeOverlay
      );
  }


  /* ========================================
     PUBLIC OPEN
     ======================================== */

  function open(
    student,
    flightValue
  ) {
    returnFocus =
      document.activeElement;

    activeStudent =
      student || null;

    activeFlightValue =
      flightValue || null;

    activeFormId = null;
    activeForm = null;

    currentIndex = 0;
    responses = {};
    currentSelection = null;


    if (
      !activeStudent ||
      !transfer.getFlight(
        activeFlightValue
      )
    ) {
      return;
    }


    openOverlay();


    const existingCheck =
      getExistingCheck();

    if (
      existingCheck?.passed
    ) {
      renderAlreadyPassed();
      return;
    }


    const transferTestMode =
      new URLSearchParams(
        window.location.search
      ).get("transferTest") === "1";

    if (
      !transferTestMode &&
      !transfer.isEligible(
        activeStudent,
        activeFlightValue
      )
    ) {
      renderLocked();
      return;
    }


    renderIntro();
  }


  /* ========================================
     CLOSE EVENTS
     ======================================== */

  closeButton.addEventListener(
    "click",
    closeOverlay
  );


  overlay.addEventListener(
    "click",
    (event) => {
      if (
        event.target === overlay
      ) {
        closeOverlay();
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
        closeOverlay();
      }
    }
  );


  window.FirstVoloTransferChallengeUI =
    Object.freeze({
      open,
      close: closeOverlay
    });

})();
