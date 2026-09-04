(() => {
  const LEVELS = ["Foundation", "Expansion", "Advanced"];
  const FLIGHT_LABELS = {
    Foundation: "Flight A",
    Expansion: "Flight B",
    Advanced: "Flight C"
  };

  const studentBar =
    document.getElementById("currentStudentBar");

  if (!studentBar) return;

  const section =
    document.createElement("section");

  section.id = "homeVoloGoals";
  section.className = "home-volo-goals";

  const activitySelector =
    document.querySelector(".activity-selector-section");

  if (activitySelector) {
    activitySelector.insertAdjacentElement(
      "afterend",
      section
    );
  } else {
    studentBar.insertAdjacentElement(
      "afterend",
      section
    );
  }

  function getStudent() {
    return (
      window.FirstVoloActivityProgress
        ?.getActiveStudent?.() || null
    );
  }

  function getStatuses(student) {
    return (
      window.FirstVoloTokens
        ?.evaluateStudent?.(student) || []
    );
  }

  function tokenIsEarned(student, status) {
    return window.FirstVoloTokens
      .isTokenEarned(
        student,
        status.setId
      );
  }

  function levelIsEarned(
    student,
    statuses,
    level
  ) {
    const items =
      statuses.filter(
        (status) =>
          status.collection === level
      );

    return (
      items.length > 0 &&
      items.every(
        (status) =>
          tokenIsEarned(
            student,
            status
          )
      )
    );
  }

  function saveGoals(student, goals) {
    student.voloGoals =
      [...new Set(goals)];

    /*
      Record when the learner intentionally
      changes Goal checkboxes.

      This lets cloud sync distinguish a
      newer check/uncheck from an older copy
      on another device.
    */
    student.voloGoalsUpdatedAt =
      new Date().toISOString();

    window.FirstVoloActivityProgress
      ?.save?.();

    render();
  }

  function makeGoalCard(
    student,
    statuses,
    level
  ) {
    const items =
      statuses.filter(
        (status) =>
          status.collection === level
      );

    const earnedCount =
      items.filter(
        (status) =>
          tokenIsEarned(
            student,
            status
          )
      ).length;

    const badgeEarned =
      levelIsEarned(
        student,
        statuses,
        level
      );

    const card =
      document.createElement("div");

    card.className =
      "home-volo-goal-card " +
      (
        badgeEarned
          ? "is-earned"
          : "is-active"
      );

    const badge =
      document.createElement("div");

    badge.className =
      "home-volo-badge";

    badge.textContent =
      badgeEarned
        ? "✓"
        : (FLIGHT_LABELS[level] || level).slice(-1);

    const content =
      document.createElement("div");

    content.className =
      "home-volo-goal-content";

    const eyebrow =
      document.createElement("small");

    eyebrow.className =
      "home-volo-goal-eyebrow";

    eyebrow.textContent =
      badgeEarned
        ? "Badge earned"
        : "Working toward";

    const title =
      document.createElement("h3");

    title.textContent =
      `${FLIGHT_LABELS[level] || level} Badge`;

    const count =
      document.createElement("div");

    count.className =
      "home-volo-goal-count";

    count.textContent =
      `${earnedCount} of ${items.length} Volo Tokens earned`;

    const slots =
      document.createElement("div");

    slots.className =
      "home-volo-token-slots";

    items.forEach((status) => {
      const earned =
        tokenIsEarned(
          student,
          status
        );

      const slot =
        document.createElement("span");

      slot.className =
        "home-volo-token-slot" +
        (earned ? " is-earned" : "");

      slot.title =
        status.label;

      slot.setAttribute(
        "aria-label",
        `${status.label}: ${
          earned
            ? "earned"
            : "not yet earned"
        }`
      );

      if (earned) {
        const image =
          document.createElement("img");

        image.src =
          "images/volo-token.png";

        image.alt = "";

        slot.append(image);
      }

      slots.append(slot);
    });

    content.append(
      eyebrow,
      title,
      count,
      slots
    );

    card.append(
      badge,
      content
    );

    return card;
  }

  function render() {
    const student =
      getStudent();

    section.innerHTML = "";

    if (!student) {
      section.hidden = true;
      return;
    }

    section.hidden = false;

    const statuses =
      getStatuses(student);

    const goals =
      Array.isArray(student.voloGoals)
        ? student.voloGoals.filter(
            (goal) =>
              LEVELS.includes(goal)
          )
        : [];

    const headingRow =
      document.createElement("div");

    headingRow.className =
      "home-volo-heading-row";

    const headingArea =
      document.createElement("div");

    const heading =
      document.createElement("h2");

    heading.textContent =
      "🏅 My Volo Goal";

    const intro =
      document.createElement("p");

    intro.textContent =
      "Choose the badge or badges you are working toward.";

    headingArea.append(
      heading,
      intro
    );

    const progressLink =
      document.createElement("a");

    progressLink.href =
      "program-progress.html";

    progressLink.className =
      "home-volo-progress-link";

    progressLink.textContent =
      "View Program Progress →";

    headingRow.append(
      headingArea,
      progressLink
    );

    const choices =
      document.createElement("div");

    choices.className =
      "home-volo-goal-choices";

    LEVELS.forEach((level) => {
      const label =
        document.createElement("label");

      label.className =
        "home-volo-goal-choice";

      const input =
        document.createElement("input");

      input.type = "checkbox";
      input.value = level;
      input.checked =
        goals.includes(level);

      const text =
        document.createElement("span");

      text.textContent = level;

      input.addEventListener(
        "change",
        () => {
          const selected =
            [
              ...choices.querySelectorAll(
                'input[type="checkbox"]:checked'
              )
            ].map(
              (item) =>
                item.value
            );

          saveGoals(
            student,
            selected
          );
        }
      );

      label.append(
        input,
        text
      );

      choices.append(label);
    });

    const cards =
      document.createElement("div");

    cards.className =
      "home-volo-goal-cards";

    LEVELS.forEach((level) => {
      const selected =
        goals.includes(level);

      const earned =
        levelIsEarned(
          student,
          statuses,
          level
        );

      if (!selected && !earned) {
        return;
      }

      cards.append(
        makeGoalCard(
          student,
          statuses,
          level
        )
      );
    });

    if (!cards.children.length) {
      const empty =
        document.createElement("p");

      empty.className =
        "home-volo-goal-empty";

      empty.textContent =
        "Choose a badge goal above to begin your Volo collection.";

      cards.append(empty);
    }

    section.append(
      headingRow,
      choices,
      cards
    );
  }

  document
    .getElementById(
      "activityStudentSelect"
    )
    ?.addEventListener(
      "change",
      () => {
        setTimeout(render, 0);
      }
    );

  window.addEventListener(
    "firstvolotokenearned",
    render
  );

  window.addEventListener(
    "storage",
    render


  );

  render();
})();
