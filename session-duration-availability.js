"use strict";

(function initializeFirstVoloSessionDurationAvailability() {
  const STORAGE_KEY = "firstVoloMorphologyProgressV1";
  const DURATION_POLICY = Object.freeze({
    10: Object.freeze({ practiceItems: 1, transferItems: 1 }),
    15: Object.freeze({ practiceItems: 2, transferItems: 1 }),
    30: Object.freeze({ practiceItems: 4, transferItems: 2 })
  });
  const DURATIONS = Object.freeze([10, 15, 30]);

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function loadStudent() {
    if (new URLSearchParams(window.location.search).has("demo")) {
      return null;
    }
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const students = Array.isArray(data.students) ? data.students : [];
      const params = new URLSearchParams(window.location.search);
      const studentId = params.get("studentId") || data.activeStudentId || null;
      return students.find(student => student?.id === studentId) || null;
    } catch (error) {
      console.warn("Could not evaluate teacher-session duration availability.", error);
      return null;
    }
  }

  function distinctWords(recipes) {
    return [...new Set((Array.isArray(recipes) ? recipes : [])
      .map(recipe => normalize(recipe?.word))
      .filter(Boolean))];
  }

  function practiceRecipesForPlan(plan) {
    const recipes = Array.isArray(plan?.sessionMaterial?.recipes)
      ? plan.sessionMaterial.recipes
      : [];
    const applyWord = normalize(plan?.apply?.item?.word);
    let practiceRecipes = recipes.filter(recipe =>
      recipes.length === 1 || normalize(recipe?.word) !== applyWord
    );
    if (!practiceRecipes.length) {
      practiceRecipes = recipes.slice(0, 1);
    }
    return practiceRecipes;
  }

  function activityLabel(plan) {
    return plan?.teachPractice?.activityLabel || plan?.teachPractice?.activity || "practice";
  }

  function evaluateDuration(minutes, student) {
    const policy = DURATION_POLICY[minutes];
    const planner = window.FirstVoloInstructionalSessionPlanner;
    if (!policy || !planner?.buildPlan) {
      return { minutes, available: true, reason: null, indeterminate: true };
    }

    let plan;
    try {
      plan = planner.buildPlan({ student, sessionMinutes: minutes });
    } catch (error) {
      console.warn(`Could not build the ${minutes}-minute availability preview.`, error);
      return {
        minutes,
        available: false,
        reason: "The session could not be built safely for this duration.",
        plan: null
      };
    }

    const material = plan?.sessionMaterial || null;
    const label = activityLabel(plan);

    /*
      Duration availability should not replace the existing target/family
      resolution UI. If the material context itself is unresolved, leave
      the duration choices alone and let the existing page explain that
      issue.
    */
    if (!material) {
      return {
        minutes,
        available: true,
        reason: null,
        indeterminate: true,
        plan
      };
    }

    if (!material.ready) {
      return {
        minutes,
        available: false,
        reason: `The ${label} materials cannot fully populate this session length.`,
        plan
      };
    }

    const practiceWords = distinctWords(practiceRecipesForPlan(plan));
    if (practiceWords.length < policy.practiceItems) {
      return {
        minutes,
        available: false,
        reason: `Only ${practiceWords.length} fresh ${label} practice ${practiceWords.length === 1 ? "item is" : "items are"} available; ${policy.practiceItems} ${policy.practiceItems === 1 ? "is" : "are"} needed for a ${minutes}-minute session.`,
        plan
      };
    }

    const applyItem = plan?.apply?.item || null;
    if (!applyItem) {
      return {
        minutes,
        available: false,
        reason: `A fair Part B ${label} application item is not available for this session length.`,
        plan
      };
    }

    const applyWord = normalize(applyItem.word);
    if (applyWord && practiceWords.includes(applyWord)) {
      return {
        minutes,
        available: false,
        reason: `A separate fresh Part B ${label} application word is not available without repeating a practice word.`,
        plan
      };
    }

    const transferItems = Array.isArray(plan?.transfer?.items)
      ? plan.transfer.items
      : [];
    if (transferItems.length < policy.transferItems) {
      return {
        minutes,
        available: false,
        reason: `Only ${transferItems.length} unused protected transfer ${transferItems.length === 1 ? "item remains" : "items remain"}; ${policy.transferItems} ${policy.transferItems === 1 ? "is" : "are"} needed for a ${minutes}-minute session.`,
        plan
      };
    }

    return { minutes, available: true, reason: null, plan };
  }

  function ensureStyles() {
    if (document.getElementById("sessionDurationAvailabilityStyles")) return;
    const style = document.createElement("style");
    style.id = "sessionDurationAvailabilityStyles";
    style.textContent = `
      .session-duration-picker button:disabled {
        cursor: not-allowed;
        opacity: 0.48;
      }
      .session-duration-availability-note {
        margin-top: 9px;
        max-width: 430px;
        color: var(--session-muted, #667480);
        font-size: 0.78rem;
        line-height: 1.4;
      }
      .session-duration-availability-note strong {
        color: var(--session-ink, #24313d);
      }
      .session-duration-unavailable-list {
        margin: 5px 0 0;
        padding-left: 18px;
      }
      .session-duration-unavailable-list li {
        margin: 3px 0;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureNote(picker) {
    let note = document.getElementById("sessionDurationAvailabilityNote");
    if (note) return note;
    note = document.createElement("div");
    note.id = "sessionDurationAvailabilityNote";
    note.className = "session-duration-availability-note";
    note.setAttribute("aria-live", "polite");
    picker.appendChild(note);
    return note;
  }

  function requestedMinutes() {
    const value = Number(new URLSearchParams(window.location.search).get("minutes"));
    return DURATIONS.includes(value) ? value : 15;
  }

  function fallbackMinutes(requested, available) {
    const atOrBelow = available.filter(minutes => minutes <= requested);
    if (atOrBelow.length) return atOrBelow[atOrBelow.length - 1];
    return available[0] || null;
  }

  function renderAvailability() {
    const picker = document.querySelector(".session-duration-picker");
    if (!picker) return null;

    const student = loadStudent();
    if (!student) return null;

    ensureStyles();
    const results = DURATIONS.map(minutes => evaluateDuration(minutes, student));
    const note = ensureNote(picker);
    const unavailable = results.filter(result => !result.available);
    const available = results.filter(result => result.available).map(result => result.minutes);

    results.forEach(result => {
      const button = picker.querySelector(`[data-session-minutes="${result.minutes}"]`);
      if (!button) return;
      button.disabled = !result.available;
      button.textContent = result.available
        ? `${result.minutes} min`
        : `${result.minutes} min · unavailable`;
      if (result.reason) {
        button.title = result.reason;
        button.setAttribute("aria-describedby", note.id);
      } else {
        button.removeAttribute("title");
        button.removeAttribute("aria-describedby");
      }
    });

    if (!unavailable.length) {
      note.hidden = true;
      note.innerHTML = "";
    } else {
      note.hidden = false;
      const availableText = available.length
        ? available.map(minutes => `${minutes} min`).join(" · ")
        : "None";
      note.innerHTML = `
        <strong>Available for this target: ${availableText}</strong>
        <ul class="session-duration-unavailable-list">
          ${unavailable.map(result => `
            <li><strong>${result.minutes} min unavailable:</strong> ${result.reason}</li>
          `).join("")}
        </ul>
      `;
    }

    const requested = requestedMinutes();
    if (!available.includes(requested) && available.length) {
      const fallback = fallbackMinutes(requested, available);
      const fallbackButton = picker.querySelector(`[data-session-minutes="${fallback}"]`);
      if (fallbackButton && !fallbackButton.disabled) {
        fallbackButton.click();
      }
    }

    return results;
  }

  function install() {
    window.setTimeout(renderAvailability, 0);
  }

  window.FirstVoloSessionDurationAvailability = {
    DURATION_POLICY,
    evaluateDuration,
    renderAvailability
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  } else {
    install();
  }
})();
