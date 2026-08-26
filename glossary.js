"use strict";

(function () {
  const morphemes =
    Array.isArray(
      window.FIRST_VOLO_MORPHEME_INVENTORY
    )
      ? window.FIRST_VOLO_MORPHEME_INVENTORY
      : [];

  const tokenSets =
    Array.isArray(
      window.FIRST_VOLO_TOKEN_SETS
    )
      ? window.FIRST_VOLO_TOKEN_SETS
      : [];

  const searchInput =
    document.getElementById(
      "glossarySearch"
    );

  const flightFilter =
    document.getElementById(
      "flightFilter"
    );

  const typeFilter =
    document.getElementById(
      "typeFilter"
    );

  const sortSelect =
    document.getElementById(
      "sortGlossary"
    );

  const body =
    document.getElementById(
      "glossaryBody"
    );

  const count =
    document.getElementById(
      "glossaryCount"
    );

  const empty =
    document.getElementById(
      "emptyGlossary"
    );

  const clearButton =
    document.getElementById(
      "clearGlossaryFilters"
    );

  const printButton =
    document.getElementById(
      "printGlossaryButton"
    );

  const collectionToFlight = {
    Foundation: "A",
    Expansion: "B",
    Advanced: "C"
  };

  const typeOrder = {
    prefix: 0,
    root: 1,
    suffix: 2
  };

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function titleCase(value) {
    const text =
      String(value || "");

    if (!text) {
      return "";
    }

    return (
      text.charAt(0).toUpperCase() +
      text.slice(1)
    );
  }

  function buildFlightMap() {
    const memberships =
      new Map();

    tokenSets.forEach((set) => {
      const flight =
        collectionToFlight[
          set?.collection
        ];

      if (!flight) {
        return;
      }

      const ids =
        Array.isArray(
          set?.morphemeIds
        )
          ? set.morphemeIds
          : [];

      ids.forEach((id) => {
        if (!memberships.has(id)) {
          memberships.set(
            id,
            []
          );
        }

        memberships
          .get(id)
          .push(flight);
      });
    });

    return memberships;
  }

  const flightMemberships =
    buildFlightMap();

  function flightFor(item) {
    const memberships =
      flightMemberships.get(
        item.id
      ) || [];

    if (memberships.length === 1) {
      return memberships[0];
    }

    const bandMap = {
      "2-3": "A",
      "4-5": "B",
      "6-8": "C"
    };

    return (
      bandMap[item.introBand] ||
      "?"
    );
  }

  const rows =
    morphemes.map((item) => ({
      ...item,
      flight: flightFor(item)
    }));

  function searchText(item) {
    return normalize([
      item.id,
      item.label,
      item.meaning,
      item.type,
      item.currentExamples,
      `flight ${item.flight}`
    ].join(" "));
  }

  function compareText(
    left,
    right
  ) {
    return String(left || "")
      .localeCompare(
        String(right || ""),
        undefined,
        {
          numeric: true,
          sensitivity: "base"
        }
      );
  }

  function sortedRows(items) {
    const sortValue =
      sortSelect.value;

    return items
      .slice()
      .sort((a, b) => {
        if (
          sortValue ===
          "wordPart"
        ) {
          return (
            compareText(
              a.label,
              b.label
            ) ||
            compareText(
              a.meaning,
              b.meaning
            )
          );
        }

        if (
          sortValue ===
          "type"
        ) {
          return (
            (typeOrder[a.type] ?? 9) -
              (typeOrder[b.type] ?? 9) ||
            compareText(
              a.label,
              b.label
            )
          );
        }

        if (
          sortValue ===
          "meaning"
        ) {
          return (
            compareText(
              a.meaning,
              b.meaning
            ) ||
            compareText(
              a.label,
              b.label
            )
          );
        }

        return (
          compareText(
            a.flight,
            b.flight
          ) ||
          (typeOrder[a.type] ?? 9) -
            (typeOrder[b.type] ?? 9) ||
          compareText(
            a.label,
            b.label
          )
        );
      });
  }

  function makeCell(
    className = ""
  ) {
    const cell =
      document.createElement(
        "td"
      );

    if (className) {
      cell.className =
        className;
    }

    return cell;
  }

  function makeRow(item) {
    const tr =
      document.createElement(
        "tr"
      );

    const tileCell =
      makeCell("tile-cell");

    const image =
      document.createElement(
        "img"
      );

    image.className =
      "tile-image";

    image.src =
      item.imagePath;

    image.alt =
      `${item.label} morphology tile`;

    tileCell.append(image);

    const wordPartCell =
      makeCell("word-part");

    const label =
      document.createElement(
        "strong"
      );

    label.textContent =
      item.label;

    const id =
      document.createElement(
        "small"
      );

    id.className =
      "target-id";

    id.textContent =
      item.id;

    wordPartCell.append(
      label,
      id
    );

    const meaningCell =
      makeCell("meaning");

    meaningCell.textContent =
      item.meaning || "—";

    const typeCell =
      makeCell();

    const typeBadge =
      document.createElement(
        "span"
      );

    typeBadge.className =
      "type-badge";

    typeBadge.textContent =
      titleCase(item.type);

    typeCell.append(
      typeBadge
    );

    const flightCell =
      makeCell();

    const flightBadge =
      document.createElement(
        "span"
      );

    flightBadge.className =
      "flight-badge";

    flightBadge.textContent =
      item.flight === "?"
        ? "Unassigned"
        : `Flight ${item.flight}`;

    flightCell.append(
      flightBadge
    );

    const examplesCell =
      makeCell("examples");

    if (
      String(
        item.currentExamples || ""
      ).trim()
    ) {
      examplesCell.textContent =
        item.currentExamples;
    } else {
      const noExamples =
        document.createElement(
          "span"
        );

      noExamples.className =
        "no-examples";

      noExamples.textContent =
        "No approved examples yet";

      examplesCell.append(
        noExamples
      );
    }

    tr.append(
      tileCell,
      wordPartCell,
      meaningCell,
      typeCell,
      flightCell,
      examplesCell
    );

    return tr;
  }

  function filteredRows() {
    const query =
      normalize(
        searchInput.value
      );

    const flight =
      flightFilter.value;

    const type =
      typeFilter.value;

    return rows.filter(
      (item) => {
        if (
          flight !== "all" &&
          item.flight !== flight
        ) {
          return false;
        }

        if (
          type !== "all" &&
          item.type !== type
        ) {
          return false;
        }

        if (
          query &&
          !searchText(item)
            .includes(query)
        ) {
          return false;
        }

        return true;
      }
    );
  }

  function render() {
    const visible =
      sortedRows(
        filteredRows()
      );

    body.replaceChildren(
      ...visible.map(
        makeRow
      )
    );

    count.textContent =
      visible.length ===
      morphemes.length
        ? `${visible.length} word parts`
        : `${visible.length} of ${morphemes.length} word parts`;

    empty.hidden =
      visible.length > 0;
  }

  function clearFilters() {
    searchInput.value = "";
    flightFilter.value =
      "all";
    typeFilter.value =
      "all";
    sortSelect.value =
      "flight";

    render();
  }

  [
    searchInput,
    flightFilter,
    typeFilter,
    sortSelect
  ].forEach((control) => {
    control.addEventListener(
      control ===
        searchInput
        ? "input"
        : "change",
      render
    );
  });

  clearButton.addEventListener(
    "click",
    clearFilters
  );

  printButton.addEventListener(
    "click",
    () => {
      window.print();
    }
  );

  render();

  window.FirstVoloGlossary = {
    count:
      morphemes.length,

    rows:
      rows.map(
        (item) => ({
          id: item.id,
          label: item.label,
          meaning: item.meaning,
          type: item.type,
          flight: item.flight,
          examples:
            item.currentExamples,
          imagePath:
            item.imagePath
        })
      )
  };
})();
