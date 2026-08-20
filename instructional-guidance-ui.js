"use strict";

(function initializeInstructionalGuidanceUI() {

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  function targetText(lastWork) {
    const target = lastWork?.target;

    if (!target?.label) {
      return "current word part";
    }

    const role =
      target.role || "word part";

    return [
      role,
      target.label,
      target.meaning
        ? `= ${target.meaning}`
        : ""
    ]
      .filter(Boolean)
      .join(" ");
  }


  function performanceText(lastWork) {
    const response =
      lastWork?.latestResponse;

    if (!response) {
      return "No saved response yet.";
    }

    if (response.independentCorrect) {
      return "Successful independently on the latest response.";
    }

    if (
      response.outcomeAfterSupport ===
      "successful_after_support"
    ) {
      return "Successful after support on the latest response.";
    }

    if (
      response.outcomeAfterSupport ===
      "not_successful_after_support"
    ) {
      return "Not yet successful after support.";
    }

    return "Not successful independently on the latest response.";
  }


  function lastTimeText(guidance) {
    const last =
      guidance.lastWork;

    if (!last) {
      return "No previous saved work is available yet.";
    }

    const pieces = [
      last.flight === "all"
        ? null
        : last.flight,
      last.activityLabel,
      targetText(last),
      last.word
        ? `word: ${last.word}`
        : null
    ].filter(Boolean);

    return (
      pieces.join(" · ") +
      ". " +
      performanceText(last)
    );
  }


  function todayText(guidance) {
    const decision =
      guidance.instructionalDecision;

    if (decision?.transition) {
      return decision.transition;
    }

    return (
      guidance.sequence?.[0]
        ?.educatorDoes ||
      "Briefly review the selected target and begin with an independent attempt."
    );
  }


  function studentWillText(guidance) {
    const next =
      guidance.sequence?.[1];

    return (
      next?.studentDoes ||
      "Completes the selected morphology work as independently as possible."
    );
  }


  function nextActivityText(guidance) {
    const next =
      guidance.nextWork;

    if (!next) {
      return "Choose the next activity.";
    }

    const label =
      window.FirstVoloInstructionalGuidance
        ?.ACTIVITY_LABELS?.[
          next.activity
        ] ||
      next.activity ||
      "Next activity";

    const target =
      next.target?.label
        ? targetText({
            target: next.target
          })
        : null;

    return [
      next.flight,
      target,
      label
    ]
      .filter(Boolean)
      .join(" · ");
  }


  function supportRows(guidance) {
    const decision =
      guidance.instructionalDecision;

    const steps =
      decision?.scaffoldSteps || [];

    if (!steps.length) {
      return `
        <div class="teacher-support-none">
          <strong>Begin without added morphology support.</strong>
          If a barrier appears, identify the barrier first rather than
          automatically adding a scaffold.
        </div>
      `;
    }

    return `
      <ol class="teacher-support-ladder">
        ${steps.map(
          (step, index) => `
            <li>
              <span class="teacher-support-level">
                ${index === 0
                  ? "Start here"
                  : `If still needed`}
              </span>
              <span>${esc(step)}</span>
            </li>
          `
        ).join("")}
      </ol>
    `;
  }


  function accessSupportRows() {
    const rules =
      window.FirstVoloInstructionalRules;

    if (!rules) {
      return "";
    }

    const directionRules =
      rules.accessRules
        ?.directions || [];

    const decodingRules =
      rules.accessRules
        ?.decoding || [];

    return `
      <div class="teacher-access-rule">
        <strong>If directions are the barrier</strong>
        <ul>
          ${directionRules.map(
            rule => `<li>${esc(rule)}</li>`
          ).join("")}
        </ul>
      </div>

      <div class="teacher-access-rule">
        <strong>If a nonessential word is blocking access</strong>
        <ul>
          ${decodingRules.map(
            rule => `<li>${esc(rule)}</li>`
          ).join("")}
        </ul>
      </div>
    `;
  }


  function render() {
    const panel =
      document.getElementById(
        "instructionalGuidancePanel"
      );

    const content =
      document.getElementById(
        "instructionalGuidanceContent"
      );

    if (!panel || !content) {
      return;
    }

    const student =
      window.FirstVoloProgress
        ?.getActiveStudent
        ?.();

    const engine =
      window.FirstVoloInstructionalGuidance;

    if (!student || !engine) {
      panel.hidden = true;
      content.innerHTML = "";
      return;
    }

    const guidance =
      engine.buildGuidance({
        student
      });

    const decision =
      guidance.instructionalDecision;

    const difficulty =
      decision?.difficultyLabel;

    const fade =
      decision?.fade ||
      "After success, reduce support on the next opportunity.";

    content.innerHTML = `
      <div class="teacher-guide-heading">
        <div>
          <span class="teacher-guide-eyebrow">
            Teacher Instructional Support
          </span>

          <h2 id="instructionalGuidanceTitle">
            🧭 Next Session Guide
          </h2>

          <p>
            Built from ${esc(student.name)}'s most recent saved work.
          </p>
        </div>

        <a
          class="teacher-guide-back-link"
          href="#studentTracker"
        >
          ↑ Learner progress
        </a>
      </div>


      <div class="teacher-guide-core">

        <section class="teacher-guide-row">
          <span class="teacher-guide-label">
            Last time
          </span>

          <p>
            ${esc(lastTimeText(guidance))}
          </p>
        </section>


        ${
          difficulty &&
          decision?.difficulty !==
            "independent"
            ? `
              <section class="teacher-guide-row teacher-guide-observation">
                <span class="teacher-guide-label">
                  What the data suggest
                </span>

                <p>
                  ${esc(difficulty)}
                </p>
              </section>
            `
            : ""
        }


        <section class="teacher-guide-row teacher-guide-today">
          <span class="teacher-guide-label">
            Today, before online work
          </span>

          <p>
            ${esc(todayText(guidance))}
          </p>
        </section>


        <section class="teacher-guide-row">
          <span class="teacher-guide-label">
            Student will
          </span>

          <p>
            ${esc(studentWillText(guidance))}
          </p>
        </section>


        <section class="teacher-guide-row teacher-guide-next">
          <span class="teacher-guide-label">
            Next online activity
          </span>

          <p>
            ${esc(nextActivityText(guidance))}
          </p>
        </section>

      </div>


      <details
        class="teacher-guide-details teacher-guide-ifthen"
        ${decision?.scaffoldSteps?.length ? "open" : ""}
      >
        <summary>
          <span>
            <strong>If you see this…</strong>
            <small>
              Conditional support · least to most
            </small>
          </span>
        </summary>

        <div class="teacher-guide-details-body">

          ${
            difficulty &&
            decision?.difficulty !==
              "independent"
              ? `
                <div class="teacher-current-barrier">
                  <span>Current barrier</span>
                  <strong>${esc(difficulty)}</strong>
                </div>
              `
              : ""
          }

          ${supportRows(guidance)}

          <div class="teacher-fade-rule">
            <span class="teacher-guide-label">
              Fade support when…
            </span>

            <p>
              ${esc(fade)}
            </p>
          </div>

        </div>
      </details>


      <details class="teacher-guide-details">
        <summary>
          <span>
            <strong>Online / access help</strong>
            <small>
              Help with access without solving the morphology work
            </small>
          </span>
        </summary>

        <div class="teacher-guide-details-body">
          ${accessSupportRows()}

          <p class="teacher-guide-boundary">
            <strong>Boundary:</strong>
            ${esc(
              window.FirstVoloInstructionalRules
                ?.onlineBoundary || ""
            )}
          </p>
        </div>
      </details>


      <details class="teacher-guide-details">
        <summary>
          <span>
            <strong>Check Transfer</strong>
            <small>
              Protected transfer guidance
            </small>
          </span>
        </summary>

        <div class="teacher-guide-details-body">
          <p>
            ${
              esc(
                guidance.sequence?.[3]
                  ?.educatorDoes || ""
              )
            }
          </p>

          <p>
            <strong>Student does:</strong>
            ${
              esc(
                guidance.sequence?.[3]
                  ?.studentDoes || ""
              )
            }
          </p>

          <p class="teacher-guide-boundary">
            <strong>If the student does not know where to begin:</strong>
            Ask, “What part do you recognize?” before adding a stronger
            morphology scaffold.
          </p>
        </div>
      </details>


      <details class="teacher-guide-details">
        <summary>
          <span>
            <strong>How support decisions work</strong>
            <small>
              Reference
            </small>
          </span>
        </summary>

        <div class="teacher-guide-details-body">
          <p>
            <strong>Sequence:</strong>
            ${
              esc(
                window.FirstVoloInstructionalRules
                  ?.supportOrder || ""
              )
            }
          </p>

          <p>
            The guide distinguishes access barriers from morphology
            difficulties and preserves the student's first independent
            attempt. Support does not replace the original performance
            record.
          </p>

          <p>
            Exact linguistic terminology should come from the specific
            word/family metadata. If that information is not available,
            the guide uses the neutral term <strong>word part</strong>
            rather than guessing.
          </p>
        </div>
      </details>
    `;

    panel.hidden = false;
  }


  function renderSoon() {
    window.setTimeout(
      render,
      0
    );
  }


  function setup() {
    render();

    [
      "studentSelect",
      "addStudentButton",
      "renameStudentButton",
      "clearStudentProgressButton",
      "deleteStudentButton"
    ].forEach(id => {
      const element =
        document.getElementById(id);

      if (!element) return;

      element.addEventListener(
        id === "studentSelect"
          ? "change"
          : "click",
        renderSoon
      );
    });

    window.addEventListener(
      "storage",
      renderSoon
    );

    window.addEventListener(
      "focus",
      renderSoon
    );

    window.addEventListener(
      "firstvoloprogresschange",
      renderSoon
    );

    window.FirstVoloInstructionalGuidanceUI = {
      render
    };
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
