"use strict";

const fs = require("fs");
const vm = require("vm");

function extractLiteral(source, name, opener) {
  const marker = `const ${name} =`;
  const startMarker = source.indexOf(marker);

  if (startMarker < 0) {
    return null;
  }

  const start = source.indexOf(opener, startMarker);

  if (start < 0) {
    return null;
  }

  const closer = opener === "[" ? "]" : "}";
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (ch === "\\") {
        escaped = true;
        continue;
      }

      if (ch === quote) {
        quote = null;
      }

      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === opener) depth += 1;

    if (ch === closer) {
      depth -= 1;

      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }

  return null;
}

function readLiteral(file, name, opener = "[") {
  if (!fs.existsSync(file)) return null;

  const source = fs.readFileSync(file, "utf8");
  const literal = extractLiteral(source, name, opener);

  if (!literal) return null;

  try {
    return vm.runInNewContext(`(${literal})`);
  } catch (error) {
    console.log(`Could not evaluate ${name}: ${error.message}`);
    return null;
  }
}

function loadInventory() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync("word-inventory.js", "utf8"),
    context
  );
  return context.window.FIRST_VOLO_WORD_INVENTORY || [];
}

function countBy(items, getter) {
  const counts = {};

  (items || []).forEach((item) => {
    const value = getter(item) || "unknown";
    counts[value] = (counts[value] || 0) + 1;
  });

  return counts;
}

function formatCounts(counts) {
  return Object.entries(counts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}: ${value}`)
    .join(" | ");
}


const breakApartExcludedWordsAudit = new Set([
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

function getBreakSurfacePartsAudit(segmentation) {
  return String(segmentation || "")
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.replace(/^-+|-+$/g, ""));
}

function getBreakBoundaryPositionsAudit(parts) {
  const boundaries = [];
  let position = 0;

  parts.slice(0, -1).forEach((part) => {
    position += part.length;
    boundaries.push(position);
  });

  return boundaries;
}

function splitWordAtBoundariesAudit(word, boundaries) {
  const parts = [];
  let start = 0;

  boundaries.forEach((boundary) => {
    parts.push(word.slice(start, boundary));
    start = boundary;
  });

  parts.push(word.slice(start));

  return parts;
}

function createBreakDistractorsAudit(word, correctParts) {
  const correctBoundaries =
    getBreakBoundaryPositionsAudit(correctParts);

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
      splitWordAtBoundariesAudit(word, sorted);

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
    const correctBoundary = correctBoundaries[0];

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
    const [first, second] = correctBoundaries;

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

function createBreakAuditItems(inventory) {
  return (inventory || [])
    .filter(
      (entry) =>
        entry.status === "current" &&
        !breakApartExcludedWordsAudit.has(
          String(entry.word || "").toLowerCase()
        ) &&
        typeof entry.segmentation === "string" &&
        entry.segmentation.trim() &&
        !entry.segmentation.includes(";")
    )
    .map((entry) => ({
      entry,
      surfaceParts:
        getBreakSurfacePartsAudit(
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
    .map(({ entry, surfaceParts }) => {
      const correct =
        surfaceParts.join(" + ");

      const distractors =
        createBreakDistractorsAudit(
          entry.word,
          surfaceParts
        );

      return {
        word: entry.word,
        segmentation: entry.segmentation,
        definition: entry.definition || "",
        correct,
        choices: [
          correct,
          ...distractors
        ]
      };
    })
    .filter(
      (question) =>
        question.choices.length === 4
    );
}

const script = "script.js";

const prefixes = readLiteral(script, "prefixes") || [];
const roots = readLiteral(script, "roots") || [];
const suffixes = readLiteral(script, "suffixes") || [];

const prefixFind = readLiteral(script, "prefixFindQuestions") || [];
const rootFind = readLiteral(script, "rootFindQuestions") || [];
const suffixFind = readLiteral(script, "suffixFindQuestions") || [];

const hunt = readLiteral(script, "wordHuntQuestions") || [];
const infer = readLiteral(script, "inferQuestions") || [];

const rootSuffix =
  readLiteral(script, "rootSuffixBuildWords") || [];

const prefixRootSuffix =
  readLiteral(script, "prefixRootSuffixBuildWords") || [];

const useBank =
  readLiteral("use-it.js", "useItSentenceBank", "{") || {};

const change =
  readLiteral("change-it.js", "changeItQuestions") || [];

const inventory = loadInventory();
const breakItems = createBreakAuditItems(inventory);
const inventoryByWord = new Map(
  inventory.map((item) => [item.word, item])
);

function wordMeta(word) {
  return inventoryByWord.get(word) || {};
}

function gradeCounts(items, getWord = (item) => item.word) {
  return countBy(items, (item) =>
    wordMeta(getWord(item)).practiceBand
  );
}

function vocabCounts(items, getWord = (item) => item.word) {
  return countBy(items, (item) =>
    wordMeta(getWord(item)).vocabLevel
  );
}

function section(title) {
  console.log(`\n=== ${title} ===`);
}

section("MORPHEME INVENTORY");
console.log(`Prefixes: ${prefixes.length}`);
console.log(`Roots: ${roots.length}`);
console.log(`Suffixes: ${suffixes.length}`);
console.log(
  `TOTAL MORPHEME CARDS: ${
    prefixes.length + roots.length + suffixes.length
  }`
);

section("ACTIVITY BANK SIZE");
console.log(
  `Find: ${
    prefixFind.length + rootFind.length + suffixFind.length
  } total`
);
console.log(
  `  Prefix ${prefixFind.length} | Root ${rootFind.length} | Suffix ${suffixFind.length}`
);
console.log(`Word Hunt: ${hunt.length}`);
console.log(`Meaning: generated from ${prefixes.length + roots.length + suffixes.length} morpheme cards`);
console.log(`Word Part: generated from ${prefixes.length + roots.length + suffixes.length} morpheme cards`);
console.log(`Break It Apart: ${breakItems.length}`);
console.log(`Figure It Out: ${infer.length}`);
console.log(`Build — Root + Suffix: ${rootSuffix.length}`);
console.log(
  `Build — Prefix + Root + Suffix: ${prefixRootSuffix.length}`
);

const allBuild = [...rootSuffix, ...prefixRootSuffix];
const useItems = allBuild.filter((item) =>
  Object.prototype.hasOwnProperty.call(useBank, item.word)
);

console.log(`Use It: ${useItems.length}`);
console.log(`Change It: ${change.length}`);

section("WORD-BASED COVERAGE BY GRADE BAND");

const banks = [
  ["Find", [...prefixFind, ...rootFind, ...suffixFind]],
  ["Figure It Out", infer],
  ["Break It Apart", breakItems],
  ["Build", allBuild],
  ["Use It", useItems]
];

banks.forEach(([name, items]) => {
  console.log(`${name}: ${formatCounts(gradeCounts(items))}`);
});

console.log(
  `Change It: ${formatCounts(countBy(change, (item) => item.practiceBand))}`
);

section("WORD-BASED COVERAGE BY VOCABULARY LEVEL");

banks.forEach(([name, items]) => {
  console.log(`${name}: ${formatCounts(vocabCounts(items))}`);
});

console.log(
  `Change It: ${formatCounts(countBy(change, (item) => item.vocabLevel))}`
);

section("WORD HUNT TARGETS BY TYPE");
console.log(formatCounts(countBy(hunt, (item) => item.type)));

section("FIGURE IT OUT TARGETS BY TYPE");
console.log(formatCounts(countBy(infer, (item) => item.type)));

section("CHANGE IT SUFFIX COVERAGE");
console.log(
  formatCounts(countBy(change, (item) => item.suffix))
);

section("FIND COVERAGE BY TARGET");

const allFind = [...prefixFind, ...rootFind, ...suffixFind];

const findTargetCounts = countBy(
  allFind,
  (item) => item.itemId || item.target || item.answer
);

Object.entries(findTargetCounts)
  .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
  .forEach(([target, count]) => {
    if (count <= 2) {
      console.log(`${target}: ${count}`);
    }
  });

section("FIGURE IT OUT COVERAGE BY WORD PART");

const inferTargetCounts = countBy(
  infer,
  (item) => item.knownLabel
);

Object.entries(inferTargetCounts)
  .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
  .forEach(([target, count]) => {
    console.log(`${target}: ${count}`);
  });

section("USE IT COVERAGE BY GRADE + VOCAB");

["2-3", "4-5", "6-8"].forEach((band) => {
  const matches = useItems.filter(
    (item) => wordMeta(item.word).practiceBand === band
  );

  console.log(
    `${band}: ${matches.length} total — ` +
    formatCounts(vocabCounts(matches))
  );
});

section("CHANGE IT COVERAGE BY GRADE + VOCAB");

["2-3", "4-5", "6-8"].forEach((band) => {
  const matches = change.filter(
    (item) => item.practiceBand === band
  );

  console.log(
    `${band}: ${matches.length} total — ` +
    formatCounts(countBy(matches, (item) => item.vocabLevel))
  );
});

section("AUTOMATIC FLAGS");

function flag(name, count, target = 10) {
  if (count < 3) {
    console.log(`CRITICAL: ${name} has only ${count}`);
  } else if (count < 6) {
    console.log(`THIN: ${name} has only ${count}`);
  } else if (count < target) {
    console.log(`WATCH: ${name} has ${count}`);
  }
}

["2-3", "4-5", "6-8"].forEach((band) => {
  flag(
    `Use It ${band}`,
    useItems.filter(
      (item) => wordMeta(item.word).practiceBand === band
    ).length
  );

  flag(
    `Change It ${band}`,
    change.filter(
      (item) => item.practiceBand === band
    ).length
  );

  flag(
    `Figure It Out ${band}`,
    infer.filter(
      (item) => wordMeta(item.word).practiceBand === band
    ).length
  );

  flag(
    `Break It Apart ${band}`,
    breakItems.filter(
      (item) => wordMeta(item.word).practiceBand === band
    ).length
  );
});

console.log("\nAudit complete.");
