"use strict";

/* First Volo Morphology — Family Printable Readiness UI V1.3 */

(function initFamilyPrintableReadinessUi() {
  const CARD_ID = "familyPrintableReadinessCard";

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function ensureCard() {
    let card = document.getElementById(CARD_ID);
    if (card) return card;

    card = document.createElement("section");
    card.id = CARD_ID;
    card.className = "family-printable-readiness-card";

    const summary = document.getElementById("studentSummary");

    if (summary) {
      summary.insertAdjacentElement("afterend", card);
    } else {
      document.querySelector("main")?.append(card);
    }

    return card;
  }

  function dateLabel(value) {
    const date = new Date(value || "");
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString(
      undefined,
      {month:"short", day:"numeric", year:"numeric"}
    );
  }

  function render() {
    const api = window.FirstVoloFamilyPrintableReadiness;
    if (!api) return;

    const card = ensureCard();
    const result = api.refreshActiveStudent();

    if (!result.student) {
      card.innerHTML = `
        <div class="family-printable-readiness-heading">
          <div>
            <span class="family-printable-readiness-kicker">Hands-on resources</span>
            <h2>Family printables</h2>
          </div>
        </div>
        <p class="family-printable-readiness-empty">
          Select a student to see persistent printable readiness.
        </p>
      `;
      return;
    }

    const resources = result.resources;

    card.innerHTML = `
      <div class="family-printable-readiness-heading">
        <div>
          <span class="family-printable-readiness-kicker">Hands-on resources</span>
          <h2>Ready for hands-on printables</h2>
        </div>
        <span class="family-printable-readiness-note">
          Ready stays saved · Completed is separate
        </span>
      </div>

      <p class="family-printable-readiness-explainer">
        Ready means the student's saved instructional progression has reached
        a point where the resource can be used. COOK and VIEW depend on matching
        affix progress; root-family packets depend on family/root progress.
        Ready is not a mastery score.
      </p>

      ${
        resources.length
          ? `
            <div class="family-printable-readiness-list">
              ${resources.map(resource => `
                <article class="family-printable-readiness-item">
                  <div class="family-printable-readiness-main">
                    <label class="family-printable-ready-state">
                      <input type="checkbox" checked disabled>
                      <span><strong>Ready</strong> for ${esc(resource.title)}</span>
                    </label>

                    <div class="family-printable-readiness-meta">
                      ${esc(resource.flight)}
                      ${resource.status.readyAt ? ` · Ready ${esc(dateLabel(resource.status.readyAt))}` : ""}
                    </div>

                    ${
                      Array.isArray(resource.status.readyEvidenceTargetLabels) &&
                      resource.status.readyEvidenceTargetLabels.length
                        ? `
                          <div class="family-printable-readiness-reason">
                            <strong>
                              ${
                                resource.kind === "roll-build"
                                  ? "Build-ready affix:"
                                  : "Relevant progress:"
                              }
                            </strong>
                            ${esc(resource.status.readyEvidenceTargetLabels.join(" · "))}
                          </div>
                        `
                        : ""
                    }
                  </div>

                  <div class="family-printable-readiness-actions">
                    <a
                      class="family-printable-open"
                      href="${esc(resource.href)}"
                      target="_blank"
                      rel="noopener"
                    >Open printable</a>

                    <label class="family-printable-completed-state">
                      <input
                        type="checkbox"
                        data-family-printable-completed="${esc(resource.id)}"
                        ${resource.status.completed ? "checked" : ""}
                      >
                      Completed
                    </label>
                  </div>
                </article>
              `).join("")}
            </div>
          `
          : `
            <p class="family-printable-readiness-empty">
              No supported family printable has reached Ready status yet.
              It will appear here when saved progression reaches an eligible family task.
            </p>
          `
      }
    `;

    card
      .querySelectorAll("[data-family-printable-completed]")
      .forEach(box => {
        box.addEventListener("change", event => {
          api.setActiveCompleted(
            event.currentTarget.dataset.familyPrintableCompleted,
            event.currentTarget.checked
          );
          render();
        });
      });
  }

  function bind() {
    document.getElementById("studentSelect")?.addEventListener("change", () => {
      window.setTimeout(render, 0);
    });

    window.addEventListener("firstvoloprogresschange", render);
    window.addEventListener("focus", render);

    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind, {once:true});
  } else {
    bind();
  }
})();
