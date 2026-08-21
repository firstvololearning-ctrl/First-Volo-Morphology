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



  function applicableNextActivity(
    guidance
  ) {
    const planner =
      window
        .FirstVoloInstructionalSessionPlanner;

    const requested =
      guidance
        ?.nextWork
        ?.activity ||
      planner
        ?.nextActivityFrom?.(
          guidance
            ?.lastWork
            ?.activity
        ) ||
      null;

    const target =
      guidance
        ?.nextWork
        ?.target ||
      guidance
        ?.lastWork
        ?.target ||
      null;

    const resolved =
      planner
        ?.resolveApplicableActivity?.({
          requestedActivity:
            requested,
          lastActivity:
            guidance
              ?.lastWork
              ?.activity ||
            null,
          target
        });

    return (
      resolved
        ?.activity ||
      requested
    );
  }


  function studentWillText(guidance) {
    const activity =
      applicableNextActivity(
        guidance
      );

    const profile =
      window
        .FirstVoloInstructionalSessionPlanner
        ?.TEACH_PRACTICE_TASKS
        ?.[activity];

    const next =
      guidance.sequence?.[1];

    return (
      profile?.student ||
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

    const activity =
      applicableNextActivity(
        guidance
      );

    const label =
      window.FirstVoloInstructionalGuidance
        ?.ACTIVITY_LABELS?.[
          activity
        ] ||
      window.FirstVoloInstructionalSessionPlanner
        ?.ACTIVITY_LABELS?.[
          activity
        ] ||
      activity ||
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

    const wrap =
      document.getElementById(
        "instructionalGuidanceWrap"
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

      if (wrap) {
        wrap.hidden = true;
      }

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

          <p>
            Use the digital Session Materials together during instruction,
            or print the same learner-specific materials for hands-on practice.
          </p>
        </div>

        <div class="teacher-guide-heading-actions">

          <a
            class="teacher-guide-material-link"
            href="session-materials.html?studentId=${encodeURIComponent(student.id)}&minutes=15"
          >
            🧩 Open Teacher-Led Session
          </a>

          <a
            class="teacher-guide-back-link"
            href="#studentTracker"
          >
            ↑ Learner progress
          </a>

        </div>
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
            Start with
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
            Teacher-led digital activity
          </span>

          <p>
            ${esc(nextActivityText(guidance))}
          </p>
        </section>

      </div>


      <div class="teacher-guide-session-note">
        Support options, access help, and Check Transfer guidance are included
        inside the teacher-led session for easy access during instruction.
      </div>
    `;

    panel.hidden = false;

    if (wrap) {
      wrap.hidden = false;
    }
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
