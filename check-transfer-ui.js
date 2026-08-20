"use strict";

/*
  First Volo Morphology — Check Transfer recording UI

  Adds the two deliberately separate teacher observations to Step 4:
    1. known morpheme recognized?
    2. unfamiliar whole word inferred?

  These records are saved inside a completed teacher-led session with
  responses: [] so they persist with the learner but never become ordinary
  practice accuracy or drive the online activity sequence.
*/

(function initializeFirstVoloCheckTransferUI() {

  const STORAGE_KEY =
    "firstVoloMorphologyProgressV1";


  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  function makeId(prefix) {
    if (
      window.crypto &&
      typeof window.crypto.randomUUID === "function"
    ) {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }


  function selection() {
    return (
      window.FirstVoloCheckTransfer
        ?.lastSelection ||
      null
    );
  }


  function isDemoSelection(value) {
    return String(
      value?.studentId ||
      ""
    ).startsWith(
      "demo-"
    );
  }


  function readProgress() {
    try {
      const data =
        JSON.parse(
          localStorage.getItem(
            STORAGE_KEY
          ) || "{}"
        );

      return {
        ...data,
        students:
          Array.isArray(data.students)
            ? data.students
            : []
      };
    } catch (error) {
      console.warn(
        "Could not read First Volo progress while saving Check Transfer.",
        error
      );

      return {
        students: [],
        activeStudentId: null
      };
    }
  }


  function saveProgress(data) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );

    window.FirstVoloMorphologyCloud
      ?.queueSync
      ?.();

    window.dispatchEvent(
      new CustomEvent(
        "firstvoloprogresschange"
      )
    );
  }


  function injectStyles() {
    if (
      document.getElementById(
        "checkTransferStyles"
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id =
      "checkTransferStyles";

    style.textContent = `
      .protected-transfer-intro {
        background: #eef8f1;
        border: 1px solid #c9e2d0;
        border-radius: 12px;
        margin-bottom: 0.9rem;
        padding: 0.8rem 0.9rem;
      }

      .protected-transfer-intro p {
        margin: 0.3rem 0 0;
      }

      .protected-transfer-item {
        background: #ffffff;
        border: 1px solid #dbe5ef;
        border-radius: 14px;
        margin-top: 0.85rem;
        padding: 1rem;
      }

      .protected-transfer-item h3 {
        font-size: 1.05rem;
        margin: 0 0 0.55rem;
      }

      .protected-transfer-context {
        font-size: 1.05rem;
        line-height: 1.55;
        margin: 0;
      }

      .protected-transfer-question {
        font-weight: 800;
        margin: 0.7rem 0 0;
      }

      .protected-transfer-record {
        border-top: 1px solid #e2e8f0;
        margin-top: 0.9rem;
        padding-top: 0.8rem;
      }

      .protected-transfer-record > summary,
      .protected-transfer-key > summary {
        cursor: pointer;
        font-weight: 800;
      }

      .protected-transfer-record-note {
        color: #5f7081;
        font-size: 0.88rem;
        margin: 0.55rem 0 0.75rem;
      }

      .protected-transfer-measure {
        background: #f8fafc;
        border: 1px solid #e1e8ef;
        border-radius: 10px;
        margin-top: 0.65rem;
        padding: 0.75rem;
      }

      .protected-transfer-measure > span {
        display: block;
        font-weight: 800;
        margin-bottom: 0.5rem;
      }

      .protected-transfer-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
      }

      .protected-transfer-options label {
        align-items: center;
        background: #ffffff;
        border: 1px solid #cbd8e5;
        border-radius: 999px;
        cursor: pointer;
        display: inline-flex;
        font-weight: 700;
        gap: 0.4rem;
        padding: 0.5rem 0.7rem;
      }

      .protected-transfer-key {
        background: #fff9e9;
        border: 1px solid #ead9a8;
        border-radius: 10px;
        margin-top: 0.7rem;
        padding: 0.7rem 0.8rem;
      }

      .protected-transfer-key p {
        margin: 0.45rem 0 0;
      }

      .protected-transfer-save-row {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 1rem;
      }

      .protected-transfer-save-message {
        color: #315f3e;
        font-weight: 700;
      }

      .protected-transfer-save-message.is-error {
        color: #8a4141;
      }

      .protected-transfer-unavailable {
        background: #fff6dc;
        border: 1px solid #ecd895;
        border-radius: 12px;
        padding: 0.9rem;
      }

      .print-transfer-item {
        margin-bottom: 0.8rem;
      }

      .print-transfer-measures {
        font-size: 0.9rem;
        margin-top: 0.45rem;
      }

      @media print {
        .protected-transfer-record,
        .protected-transfer-save-row,
        .protected-transfer-intro {
          display: none !important;
        }
      }
    `;

    document.head.append(
      style
    );
  }


  function unavailableMessage(
    transfer
  ) {
    const status =
      transfer?.materialStatus ||
      "";

    if (
      status ===
      "protected-check-transfer-pool-exhausted"
    ) {
      return (
        "No unused protected Check Transfer word remains for this exact target for this learner. " +
        "Do not substitute a formal assessment word, Migration Challenge word, ordinary practice word, or a word for a different morpheme."
      );
    }

    if (
      status ===
      "protected-check-transfer-no-grade-eligible-item"
    ) {
      return (
        "No protected Check Transfer item is configured for this exact target at the learner's current grade band. " +
        "Do not substitute a word from another protected or instructional pool."
      );
    }

    if (
      status ===
      "protected-check-transfer-target-unresolved"
    ) {
      return (
        "The exact Check Transfer target is unresolved. First Volo will not guess a morpheme or substitute another word."
      );
    }

    return (
      "No protected Check Transfer item is configured for this exact target yet. " +
      "Do not substitute a formal assessment word, Migration Challenge word, ordinary practice word, or a word for a different morpheme."
    );
  }


  function itemScreenHTML(
    item,
    index,
    target
  ) {
    const number =
      index + 1;

    const targetLabel =
      target?.label ||
      "known morpheme";

    const targetMeaning =
      target?.meaning ||
      "";

    return `
      <article
        class="protected-transfer-item"
        data-check-transfer-item="${esc(item.id)}"
      >
        <h3>
          Transfer word ${number}
        </h3>

        <p class="protected-transfer-context">
          ${esc(item.sentence)}
        </p>

        <p class="protected-transfer-question">
          What do you think “${esc(item.word)}” means here?
        </p>

        <details class="protected-transfer-record">
          <summary>
            Record after the first attempt
          </summary>

          <p class="protected-transfer-record-note">
            Record the first attempt before opening stronger morphology support.
            Keep these two observations separate.
          </p>

          <div class="protected-transfer-measure">
            <span>
              1. Did the student recognize the known morpheme?
            </span>

            <div class="protected-transfer-options">
              <label>
                <input
                  type="radio"
                  name="ct-recognize-${esc(item.id)}"
                  value="yes"
                >
                Yes
              </label>

              <label>
                <input
                  type="radio"
                  name="ct-recognize-${esc(item.id)}"
                  value="not_yet"
                >
                Not yet
              </label>
            </div>
          </div>

          <div class="protected-transfer-measure">
            <span>
              2. Could the student infer the unfamiliar whole word?
            </span>

            <div class="protected-transfer-options">
              <label>
                <input
                  type="radio"
                  name="ct-infer-${esc(item.id)}"
                  value="yes"
                >
                Yes
              </label>

              <label>
                <input
                  type="radio"
                  name="ct-infer-${esc(item.id)}"
                  value="not_yet"
                >
                Not yet
              </label>
            </div>
          </div>

          <p class="protected-transfer-record-note">
            If support is needed after the first attempt, begin with:
            <strong>“What part do you recognize?”</strong>
          </p>

          <details class="protected-transfer-key">
            <summary>
              Educator key · open after response
            </summary>

            <p>
              <strong>Known target:</strong>
              ${esc(targetLabel)}
              ${
                targetMeaning
                  ? `= ${esc(targetMeaning)}`
                  : ""
              }
            </p>

            <p>
              <strong>Expected whole-word meaning:</strong>
              ${esc(item.expectedMeaning)}
            </p>
          </details>
        </details>
      </article>
    `;
  }


  function itemPrintHTML(
    item,
    index
  ) {
    return `
      <div class="print-transfer-item">
        <p>
          <strong>${index + 1}.</strong>
          ${esc(item.sentence)}
          <strong>
            What do you think “${esc(item.word)}” means here?
          </strong>
        </p>

        <div class="print-transfer-measures">
          <div>
            Known morpheme recognized:
            □ Yes &nbsp; □ Not yet
          </div>

          <div>
            Whole-word meaning inferred:
            □ Yes &nbsp; □ Not yet
          </div>
        </div>
      </div>
    `;
  }


  function selectedRadio(
    name
  ) {
    return document.querySelector(
      `input[name="${CSS.escape(name)}"]:checked`
    )?.value ||
    null;
  }


  function collectRecordedItems(
    transfer
  ) {
    const recorded = [];

    for (
      const item
      of transfer.items || []
    ) {
      const recognize =
        selectedRadio(
          `ct-recognize-${item.id}`
        );

      const infer =
        selectedRadio(
          `ct-infer-${item.id}`
        );

      if (!recognize || !infer) {
        return null;
      }

      recorded.push({
        id: item.id,
        word: item.word,
        targetIds:
          Array.isArray(
            item.targetIds
          )
            ? [...item.targetIds]
            : [],
        morphemeRecognized:
          recognize === "yes",
        wholeWordInferred:
          infer === "yes",
        recordedAt:
          new Date()
            .toISOString()
      });
    }

    return recorded;
  }


  function setSaveMessage(
    text,
    {
      error = false
    } = {}
  ) {
    const message =
      document.getElementById(
        "checkTransferSaveMessage"
      );

    if (!message) {
      return;
    }

    message.textContent =
      text;

    message.classList.toggle(
      "is-error",
      error
    );
  }


  function saveTransferRecord() {
    const current =
      selection();

    const transfer =
      current?.transfer;

    if (
      !current ||
      !Array.isArray(
        transfer?.items
      ) ||
      !transfer.items.length
    ) {
      return;
    }

    if (
      isDemoSelection(
        current
      )
    ) {
      setSaveMessage(
        "Local preview only — demo results are not saved."
      );
      return;
    }

    const recorded =
      collectRecordedItems(
        transfer
      );

    if (!recorded) {
      setSaveMessage(
        "Record both observations for each transfer word before saving.",
        { error: true }
      );
      return;
    }

    const data =
      readProgress();

    const student =
      data.students.find(
        item =>
          item.id ===
          current.studentId
      );

    if (!student) {
      setSaveMessage(
        "The learner record could not be found, so Check Transfer was not saved.",
        { error: true }
      );
      return;
    }

    if (!Array.isArray(student.sessions)) {
      student.sessions = [];
    }

    const now =
      new Date()
        .toISOString();

    const target =
      current.target ||
      {};

    student.sessions.push({
      id:
        makeId(
          "teacher-session"
        ),
      recordType:
        "teacher-led-session",
      startedAt:
        current.generatedAt ||
        now,
      completedAt:
        now,
      activity:
        "teacher-led-session",
      studyMode:
        current.studyMode ||
        null,
      gradeBand:
        current.gradeBand ||
        null,
      vocabLevel:
        current.vocabLevel ||
        null,
      sessionMinutes:
        current.sessionMinutes ||
        null,
      totalItems:
        0,
      correct:
        null,
      accuracy:
        null,
      responses: [],
      instructionalTarget: {
        id:
          target.id ||
          null,
        label:
          target.label ||
          null,
        meaning:
          target.meaning ||
          null,
        role:
          target.role ||
          target.linguisticRole ||
          null
      },
      applyWord:
        current.applyWord ||
        null,
      checkTransfer: {
        protected:
          true,
        pool:
          "connectedTextTransfer",
        firstAttemptUncued:
          true,
        recognitionAndInferenceSeparate:
          true,
        items:
          recorded
      }
    });

    saveProgress(
      data
    );

    const button =
      document.getElementById(
        "saveCheckTransferButton"
      );

    if (button) {
      button.disabled =
        true;
      button.textContent =
        "✓ Check Transfer saved";
    }

    document
      .querySelectorAll(
        "#sessionTransferContent input"
      )
      .forEach(
        input => {
          input.disabled =
            true;
        }
      );

    setSaveMessage(
      "Saved separately from practice accuracy. These transfer words are now marked used for this learner."
    );
  }


  function renderProtectedTransfer() {
    const screen =
      document.getElementById(
        "sessionTransferContent"
      );

    const print =
      document.getElementById(
        "printTransferPrompt"
      );

    if (!screen || !print) {
      return;
    }

    const current =
      selection();

    const transfer =
      current?.transfer;

    if (!transfer) {
      return;
    }

    const items =
      Array.isArray(
        transfer.items
      )
        ? transfer.items
        : [];

    if (!items.length) {
      const message =
        unavailableMessage(
          transfer
        );

      screen.innerHTML = `
        <div class="protected-transfer-unavailable">
          <strong>
            Check Transfer is protected and fail-closed.
          </strong>
          <p>${esc(message)}</p>
        </div>
      `;

      print.innerHTML = `
        <p>
          <strong>
            No protected Check Transfer item available.
          </strong>
          ${esc(message)}
        </p>
      `;

      return;
    }

    const signature =
      items
        .map(
          item => item.id
        )
        .join("|");

    if (
      screen.dataset
        .checkTransferSignature ===
        signature &&
      screen.querySelector(
        ".protected-transfer-item"
      )
    ) {
      return;
    }

    screen.dataset
      .checkTransferSignature =
      signature;

    screen.innerHTML = `
      <div class="protected-transfer-intro">
        <strong>
          First attempt: no morphology cue
        </strong>

        <p>
          Present the word in context and ask for the whole-word meaning first.
          Do not identify, highlight, define, or preteach the target before that attempt.
        </p>
      </div>

      ${items.map(
        (item, index) =>
          itemScreenHTML(
            item,
            index,
            current.target
          )
      ).join("")}

      <div class="protected-transfer-save-row">
        <button
          class="session-primary-button"
          id="saveCheckTransferButton"
          type="button"
        >
          Save Check Transfer
        </button>

        <span
          class="protected-transfer-save-message"
          id="checkTransferSaveMessage"
          aria-live="polite"
        ></span>
      </div>
    `;

    print.innerHTML =
      items.map(
        itemPrintHTML
      ).join("");

    document
      .getElementById(
        "saveCheckTransferButton"
      )
      ?.addEventListener(
        "click",
        saveTransferRecord
      );
  }


  function observeBaseRenderer() {
    const screen =
      document.getElementById(
        "sessionTransferContent"
      );

    if (!screen) {
      return;
    }

    const observer =
      new MutationObserver(
        () => {
          if (
            !screen.querySelector(
              ".protected-transfer-item"
            ) &&
            !screen.querySelector(
              ".protected-transfer-unavailable"
            )
          ) {
            queueMicrotask(
              renderProtectedTransfer
            );
          }
        }
      );

    observer.observe(
      screen,
      {
        childList: true,
        subtree: true
      }
    );
  }


  function setup() {
    injectStyles();
    renderProtectedTransfer();
    observeBaseRenderer();
  }


  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      setup
    );
  } else {
    setup();
  }

})();
