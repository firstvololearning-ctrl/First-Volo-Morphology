const fs = require("fs");
const vm = require("vm");

/* ========================================
   LOAD MASTER METADATA
   ======================================== */

function loadMasterMetadata() {
  const source = fs.readFileSync("word-inventory.js", "utf8");

  const sandbox = {
    window: {}
  };

  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);

  return {
    morphemes:
      sandbox.window.FIRST_VOLO_MORPHEME_INVENTORY || [],
    words:
      sandbox.window.FIRST_VOLO_WORD_INVENTORY || []
  };
}


/* ========================================
   READ LITERAL ARRAYS / OBJECTS
   ======================================== */

function extractLiteral(source, name, opener = "[") {
  const patterns = [
    `const ${name} =`,
    `let ${name} =`,
    `var ${name} =`
  ];

  let start = -1;

  for (const pattern of patterns) {
    const index = source.indexOf(pattern);

    if (index !== -1) {
      start = source.indexOf(opener, index);
      break;
    }
  }

  if (start === -1) {
    return null;
  }

  const closer = opener === "[" ? "]" : "}";

  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i];

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (
      char === '"' ||
      char === "'" ||
      char === "`"
    ) {
      quote = char;
      continue;
    }

    if (char === opener) {
      depth += 1;
    }

    if (char === closer) {
      depth -= 1;

      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }

  return null;
}


function readLiteral(file, name, opener = "[") {
  const source = fs.readFileSync(file, "utf8");
  const literal = extractLiteral(source, name, opener);

  if (!literal) {
    return opener === "[" ? [] : {};
  }

  return vm.runInNewContext(`(${literal})`);
}


/* ========================================
   HELPERS
   ======================================== */

function csvEscape(value) {
  const text =
    value === undefined || value === null
      ? ""
      : String(value);

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n")
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}


function writeCsv(filename, rows, columns) {
  const lines = [];

  lines.push(columns.join(","));

  rows.forEach((row) => {
    lines.push(
      columns
        .map((column) => csvEscape(row[column]))
        .join(",")
    );
  });

  fs.writeFileSync(
    filename,
    lines.join("\n") + "\n"
  );
}


function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[‐-‒–—−]/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/[^a-z0-9]/g, "");
}


/* ========================================
   LOAD BANKS
   ======================================== */

const metadata = loadMasterMetadata();
const morphemes = metadata.morphemes;
const words = metadata.words;

const script = "script.js";

const prefixFind =
  readLiteral(script, "prefixFindQuestions");

const rootFind =
  readLiteral(script, "rootFindQuestions");

const suffixFind =
  readLiteral(script, "suffixFindQuestions");

const findItems = [
  ...prefixFind,
  ...rootFind,
  ...suffixFind
];

const hunt =
  readLiteral(script, "wordHuntQuestions");

const infer =
  readLiteral(script, "inferQuestions");

const rootSuffix =
  readLiteral(script, "rootSuffixBuildWords");

const prefixRootSuffix =
  readLiteral(script, "prefixRootSuffixBuildWords");

const useBank =
  readLiteral(
    "use-it.js",
    "useItSentenceBank",
    "{"
  );

const change =
  readLiteral(
    "change-it.js",
    "changeItQuestions"
  );


/* ========================================
   LOOKUPS
   ======================================== */

const wordByName = new Map(
  words.map((entry) => [
    String(entry.word || "").toLowerCase(),
    entry
  ])
);

const morphemeById = new Map(
  morphemes.map((entry) => [
    entry.id,
    entry
  ])
);


function wordMeta(word) {
  return (
    wordByName.get(
      String(word || "").toLowerCase()
    ) || {}
  );
}


function morphemeVariants(entry) {
  return [
    entry.id,
    entry.label
  ]
    .flatMap((value) =>
      String(value || "").split(/[\\/,]/)
    )
    .map(normalize)
    .filter(Boolean);
}


function morphemeFromLabel(value, type = "") {
  const target = normalize(value);

  return morphemes.find((entry) => {
    if (type && entry.type !== type) {
      return false;
    }

    return morphemeVariants(entry)
      .includes(target);
  });
}


function segmentationParts(segmentation) {
  return String(segmentation || "")
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean);
}


function morphemesInSegmentation(segmentation) {
  const ids = new Set();

  segmentationParts(segmentation)
    .forEach((part) => {
      const target = normalize(part);

      morphemes.forEach((entry) => {
        if (
          morphemeVariants(entry)
            .includes(target)
        ) {
          ids.add(entry.id);
        }
      });
    });

  return [...ids];
}


/* ========================================
   WORD-PART INVENTORY
   ======================================== */

const wordPartRows = morphemes.map((entry) => ({
  Type: entry.type,
  ID: entry.id,
  "Word Part": entry.label,
  Meaning: entry.meaning,
  "Introduction Band": entry.introBand,
  "CCSS Skill": entry.ccssSkill,
  "Intro Confidence": entry.introBandConfidence,
  "Current Examples": entry.currentExamples,
  "Placement Rationale": entry.placementRationale
}));


/* ========================================
   PRACTICE INVENTORY
   ======================================== */

const practiceRows = [];

function addPracticeRow({
  activity,
  word = "",
  type = "",
  targetId = "",
  targetLabel = "",
  targetRole = "",
  gradeBand = "",
  vocabLevel = "",
  gradeBasis = "",
  vocabBasis = "",
  details = ""
}) {
  practiceRows.push({
    Activity: activity,
    Word: word,
    "Target Type": type,
    "Target ID": targetId,
    "Target / Word Part": targetLabel,
    "Target Role": targetRole,
    "Grade Band": gradeBand,
    "Vocabulary Level": vocabLevel,
    "Grade Basis": gradeBasis,
    "Vocabulary Basis": vocabBasis,
    Details: details
  });
}


/* Meaning + Word Part:
   generated directly from morpheme inventory */

morphemes.forEach((entry) => {
  ["Meaning", "Word Part"].forEach((activity) => {
    addPracticeRow({
      activity,
      type: entry.type,
      targetId: entry.id,
      targetLabel: entry.label,
      targetRole: "direct",
      gradeBand: entry.introBand,
      vocabLevel: "N/A",
      gradeBasis: "morpheme introBand",
      vocabBasis: "not word-based",
      details: entry.meaning
    });
  });
});


/* Find */

findItems.forEach((item) => {
  const meta = wordMeta(item.word);
  const morph =
    morphemeById.get(item.itemId) || {};

  addPracticeRow({
    activity: "Find",
    word: item.word,
    type: item.type,
    targetId: item.itemId,
    targetLabel:
      morph.label || item.answer || item.target,
    targetRole: "direct",
    gradeBand: meta.practiceBand || "",
    vocabLevel: meta.vocabLevel || "",
    gradeBasis: "word practiceBand",
    vocabBasis: "word vocabLevel",
    details: item.definition || ""
  });
});


/* Word Hunt:
   target is direct; individual word set can span
   multiple word-level bands, so preserve that
   rather than inventing one vocabulary level. */

hunt.forEach((item) => {
  const morph =
    morphemeById.get(item.itemId) ||
    morphemeFromLabel(item.label, item.type) ||
    {};

  const correctWords =
    (item.words || [])
      .filter((word) => word.correct)
      .map((word) => word.word);

  const gradeBands = [
    ...new Set(
      correctWords
        .map((word) => wordMeta(word).practiceBand)
        .filter(Boolean)
    )
  ];

  const vocabLevels = [
    ...new Set(
      correctWords
        .map((word) => wordMeta(word).vocabLevel)
        .filter(Boolean)
    )
  ];

  addPracticeRow({
    activity: "Word Hunt",
    type: item.type,
    targetId: item.itemId,
    targetLabel: item.label,
    targetRole: "direct",
    gradeBand:
      morph.introBand ||
      gradeBands.join(" / "),
    vocabLevel:
      vocabLevels.length
        ? vocabLevels.join(" / ")
        : "mixed / not explicitly banded",
    gradeBasis: morph.introBand
      ? "morpheme introBand"
      : "correct-word practice bands",
    vocabBasis: "correct-word vocabulary mix",
    details:
      `${item.meaning}; correct words: ` +
      correctWords.join(", ")
  });
});



/* Break It Apart:
   whole-word structure task; morphemes are supporting,
   not treated as individually assessed primary targets. */

const breakExcludedWords = new Set([
  "attract",
  "biology",
  "dermal",
  "perspective",
  "running",
  "rupture",
  "spectator",
  "structure",
  "writing"
]);

function breakSurfaceParts(segmentation) {
  return String(segmentation || "")
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) =>
      part.replace(/^-+|-+$/g, "")
    );
}

function breakBoundaryPositions(parts) {
  const boundaries = [];
  let position = 0;

  parts.slice(0, -1).forEach((part) => {
    position += part.length;
    boundaries.push(position);
  });

  return boundaries;
}

function breakSplitWord(word, boundaries) {
  const parts = [];
  let start = 0;

  boundaries.forEach((boundary) => {
    parts.push(word.slice(start, boundary));
    start = boundary;
  });

  parts.push(word.slice(start));
  return parts;
}

function breakDistractors(word, correctParts) {
  const correctBoundaries =
    breakBoundaryPositions(correctParts);

  const correctDisplay =
    correctParts.join(" + ");

  const distractors = [];
  const seen = new Set([correctDisplay]);

  function addCandidate(boundaries) {
    const sorted =
      [...boundaries].sort((a, b) => a - b);

    if (
      sorted.some(
        (boundary, index) =>
          boundary <= 0 ||
          boundary >= word.length ||
          (
            index > 0 &&
            boundary <= sorted[index - 1]
          )
      )
    ) {
      return;
    }

    const parts =
      breakSplitWord(word, sorted);

    if (parts.some((part) => !part)) {
      return;
    }

    const display = parts.join(" + ");

    if (seen.has(display)) {
      return;
    }

    seen.add(display);
    distractors.push(display);
  }

  if (correctBoundaries.length === 1) {
    const correctBoundary =
      correctBoundaries[0];

    for (
      let distance = 1;
      distance < word.length &&
      distractors.length < 3;
      distance += 1
    ) {
      addCandidate([
        correctBoundary - distance
      ]);

      if (distractors.length < 3) {
        addCandidate([
          correctBoundary + distance
        ]);
      }
    }
  }

  if (correctBoundaries.length === 2) {
    const [first, second] =
      correctBoundaries;

    const shifts = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [1, 1],
      [-1, 1],
      [1, -1],
      [-2, 0],
      [2, 0],
      [0, -2],
      [0, 2]
    ];

    shifts.forEach(
      ([firstShift, secondShift]) => {
        if (distractors.length >= 3) {
          return;
        }

        addCandidate([
          first + firstShift,
          second + secondShift
        ]);
      }
    );
  }

  return distractors.slice(0, 3);
}

const breakItems = words
  .filter(
    (entry) =>
      entry.status === "current" &&
      !breakExcludedWords.has(
        String(entry.word || "").toLowerCase()
      ) &&
      typeof entry.segmentation === "string" &&
      entry.segmentation.trim() &&
      !entry.segmentation.includes(";")
  )
  .map((entry) => ({
    entry,
    surfaceParts:
      breakSurfaceParts(
        entry.segmentation
      )
  }))
  .filter(({ entry, surfaceParts }) => {
    if (
      surfaceParts.length !== 2 &&
      surfaceParts.length !== 3
    ) {
      return false;
    }

    return (
      surfaceParts.join("").toLowerCase() ===
      entry.word.toLowerCase()
    );
  })
  .filter(({ entry, surfaceParts }) =>
    breakDistractors(
      entry.word,
      surfaceParts
    ).length === 3
  );

breakItems.forEach(({ entry, surfaceParts }) => {
  const supporting =
    morphemesInSegmentation(
      entry.segmentation
    );

  addPracticeRow({
    activity: "Break It Apart",
    word: entry.word,
    type: "word structure",
    targetId: supporting.join(" | "),
    targetLabel: supporting
      .map((id) =>
        morphemeById.get(id)?.label || id
      )
      .join(" | "),
    targetRole: "supporting / word structure",
    gradeBand: entry.practiceBand || "",
    vocabLevel: entry.vocabLevel || "",
    gradeBasis: "word practiceBand",
    vocabBasis: "word vocabLevel",
    details:
      surfaceParts.join(" + ")
  });
});


/* Figure It Out */

infer.forEach((item) => {
  const meta = wordMeta(item.word);

  const morph =
    morphemeFromLabel(
      item.knownLabel,
      item.type
    ) || {};

  addPracticeRow({
    activity: "Figure It Out",
    word: item.word,
    type: item.type,
    targetId: morph.id || "",
    targetLabel: item.knownLabel,
    targetRole: "direct",
    gradeBand: meta.practiceBand || "",
    vocabLevel: meta.vocabLevel || "",
    gradeBasis: "word practiceBand",
    vocabBasis: "word vocabLevel",
    details: item.definition || item.correct || ""
  });
});


/* Build */

[
  ...rootSuffix,
  ...prefixRootSuffix
].forEach((item) => {
  const meta = wordMeta(item.word);

  const supporting =
    morphemesInSegmentation(
      meta.segmentation
    );

  addPracticeRow({
    activity: "Build",
    word: item.word,
    type: "construction",
    targetId: supporting.join(" | "),
    targetLabel: supporting
      .map((id) =>
        morphemeById.get(id)?.label || id
      )
      .join(" | "),
    targetRole: "supporting / construction",
    gradeBand: meta.practiceBand || "",
    vocabLevel: meta.vocabLevel || "",
    gradeBasis: "word practiceBand",
    vocabBasis: "word vocabLevel",
    details: meta.segmentation || ""
  });
});


/* Use It:
   same eligibility as the live activity:
   a Build item must also have a sentence-bank entry. */

const allBuild = [
  ...rootSuffix,
  ...prefixRootSuffix
];

const useItems = allBuild.filter((item) =>
  Object.prototype.hasOwnProperty.call(
    useBank,
    item.word
  )
);

useItems.forEach((item) => {
  const word = item.word;
  const sentence = useBank[word];
  const meta = wordMeta(word);

  const supporting =
    morphemesInSegmentation(
      meta.segmentation
    );

  addPracticeRow({
    activity: "Use It",
    word,
    type: "application",
    targetId: supporting.join(" | "),
    targetLabel: supporting
      .map((id) =>
        morphemeById.get(id)?.label || id
      )
      .join(" | "),
    targetRole: "supporting / application",
    gradeBand: meta.practiceBand || "",
    vocabLevel: meta.vocabLevel || "",
    gradeBasis: "word practiceBand",
    vocabBasis: "word vocabLevel",
    details:
      typeof sentence === "string"
        ? sentence
        : JSON.stringify(sentence)
  });
});


/* Change It */

change.forEach((item) => {
  const word =
    item.answer ||
    item.word ||
    item.targetWord ||
    "";

  const meta = wordMeta(word);

  const suffixLabel =
    item.suffix ||
    item.targetSuffix ||
    "";

  const morph =
    morphemeFromLabel(
      suffixLabel,
      "suffix"
    ) || {};

  addPracticeRow({
    activity: "Change It",
    word,
    type: "suffix",
    targetId: morph.id || suffixLabel,
    targetLabel: suffixLabel,
    targetRole: "direct",
    gradeBand:
      item.practiceBand ||
      meta.practiceBand ||
      "",
    vocabLevel:
      item.vocabLevel ||
      meta.vocabLevel ||
      "",
    gradeBasis:
      item.practiceBand
        ? "question metadata"
        : "word practiceBand",
    vocabBasis:
      item.vocabLevel
        ? "question metadata"
        : "word vocabLevel",
    details:
      item.prompt ||
      item.sentence ||
      ""
  });
});


/* ========================================
   COVERAGE MATRIX
   ======================================== */

const activityNames = [
  "Meaning",
  "Word Part",
  "Find",
  "Word Hunt",
  "Break It Apart",
  "Figure It Out",
  "Build",
  "Use It",
  "Change It"
];

const coverage = new Map();

morphemes.forEach((entry) => {
  const row = {
    Type: entry.type,
    ID: entry.id,
    "Morpheme / Word Part": entry.label,
    "Morpheme Meaning": entry.meaning,
    "Introduction Band": entry.introBand
  };

  activityNames.forEach((activity) => {
    row[activity] = 0;
  });

  row["Direct Practice Total"] = 0;
  row["Supporting Practice Total"] = 0;

  coverage.set(entry.id, row);
});


practiceRows.forEach((item) => {
  const ids = String(item["Target ID"] || "")
    .split("|")
    .map((id) => id.trim())
    .filter(Boolean);

  ids.forEach((id) => {
    const row = coverage.get(id);

    if (!row) {
      return;
    }

    if (
      activityNames.includes(item.Activity)
    ) {
      row[item.Activity] += 1;
    }

    if (
      item["Target Role"] === "direct"
    ) {
      row["Direct Practice Total"] += 1;
    } else {
      row["Supporting Practice Total"] += 1;
    }
  });
});


/* ========================================
   SUMMARY
   ======================================== */

const summaryMap = new Map();

practiceRows.forEach((row) => {
  const key = [
    row["Grade Band"] || "Unspecified",
    row["Vocabulary Level"] || "Unspecified",
    row.Activity
  ].join("|||");

  summaryMap.set(
    key,
    (summaryMap.get(key) || 0) + 1
  );
});

const summaryRows = [
  ...summaryMap.entries()
].map(([key, count]) => {
  const [
    gradeBand,
    vocabLevel,
    activity
  ] = key.split("|||");

  return {
    "Grade Band": gradeBand,
    "Vocabulary Level": vocabLevel,
    Activity: activity,
    "Question / Item Count": count
  };
});


/* ========================================
   WRITE FILES
   ======================================== */

writeCsv(
  "curriculum-map-word-parts.csv",
  wordPartRows,
  [
    "Type",
    "ID",
    "Word Part",
    "Meaning",
    "Introduction Band",
    "CCSS Skill",
    "Intro Confidence",
    "Current Examples",
    "Placement Rationale"
  ]
);

writeCsv(
  "curriculum-map-practice.csv",
  practiceRows,
  [
    "Activity",
    "Word",
    "Target Type",
    "Target ID",
    "Target / Word Part",
    "Target Role",
    "Grade Band",
    "Vocabulary Level",
    "Grade Basis",
    "Vocabulary Basis",
    "Details"
  ]
);

writeCsv(
  "curriculum-map-summary.csv",
  summaryRows,
  [
    "Grade Band",
    "Vocabulary Level",
    "Activity",
    "Question / Item Count"
  ]
);

writeCsv(
  "curriculum-map-coverage.csv",
  [...coverage.values()],
  [
    "Type",
    "ID",
    "Morpheme / Word Part",
    "Morpheme Meaning",
    "Introduction Band",
    ...activityNames,
    "Direct Practice Total",
    "Supporting Practice Total"
  ]
);

console.log("");
console.log("Curriculum map generated.");
console.log(`Word parts: ${wordPartRows.length}`);
console.log(`Practice rows: ${practiceRows.length}`);
console.log(`Summary rows: ${summaryRows.length}`);
console.log(`Coverage rows: ${coverage.size}`);
console.log("");
console.log("Created:");
console.log("  curriculum-map-word-parts.csv");
console.log("  curriculum-map-practice.csv");
console.log("  curriculum-map-summary.csv");
console.log("  curriculum-map-coverage.csv");
