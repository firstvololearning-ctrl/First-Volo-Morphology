"use strict";

global.window =
  global;

for (
  const file
  of [
    "./word-inventory.js",
    "./instructional-protection-registry.js",
    "./instructional-check-transfer.js"
  ]
) {
  try {
    require(file);
  } catch (error) {
    console.error(
      `Could not load ${file}:`
    );
    console.error(
      error.message
    );
    process.exit(1);
  }
}

const registry =
  global.FirstVoloInstructionalProtection ||
  null;

const items =
  Array.isArray(
    registry?.checkTransferItems
  )
    ? registry.checkTransferItems
    : [];

const unique = [];
const keys = new Set();

for (
  const item
  of items
) {
  const word =
    String(
      item?.word ||
      ""
    )
      .trim();

  const context =
    String(
      item?.sentence ||
      item?.context ||
      item?.prompt ||
      ""
    )
      .trim();

  const meaning =
    String(
      item?.expectedMeaning ||
      item?.meaning ||
      item?.definition ||
      ""
    )
      .trim();

  if (
    !word ||
    !context
  ) {
    continue;
  }

  const key =
    `${word.toLowerCase()}|||${context.toLowerCase()}`;

  if (
    keys.has(
      key
    )
  ) {
    continue;
  }

  keys.add(
    key
  );

  unique.push({
    word,
    context,
    meaning
  });
}

const suffixes = [
  "ization",
  "ation",
  "ition",
  "ment",
  "ness",
  "able",
  "ible",
  "ive",
  "ous",
  "ity",
  "al",
  "ant",
  "ent",
  "er",
  "or",
  "ing",
  "ed",
  "ly",
  "s"
];

const stopWords =
  new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "is",
    "are",
    "was",
    "were",
    "be",
    "being",
    "been",
    "this",
    "that",
    "it",
    "its",
    "as",
    "at",
    "by",
    "from",
    "when",
    "what",
    "someone",
    "something"
  ]);

function tokens(text) {
  return (
    String(
      text
    )
      .toLowerCase()
      .match(
        /[a-z]+/g
      ) ||
    []
  );
}

function likelyBase(word) {
  const clean =
    String(
      word
    )
      .toLowerCase()
      .replace(
        /[^a-z]/g,
        ""
      );

  for (
    const suffix
    of suffixes
  ) {
    if (
      clean.endsWith(
        suffix
      ) &&
      clean.length -
        suffix.length >=
        4
    ) {
      return clean.slice(
        0,
        clean.length -
          suffix.length
      );
    }
  }

  return null;
}

const hard = [];
const informational = [];

for (
  const record
  of unique
) {
  const contextTokens =
    tokens(
      record.context
    );

  const base =
    likelyBase(
      record.word
    );

  if (
    base &&
    contextTokens.includes(
      base
    )
  ) {
    hard.push({
      word:
        record.word,
      base,
      context:
        record.context,
      reason:
        "context repeats a likely morphological base"
    });
  }

  if (
    record.meaning
  ) {
    const meaningWords =
      tokens(
        record.meaning
      )
        .filter(
          token =>
            token.length >=
              4 &&
            !stopWords.has(
              token
            )
        );

    const overlap =
      [
        ...new Set(
          meaningWords
        )
      ]
        .filter(
          token =>
            contextTokens.includes(
              token
            )
        );

    if (
      overlap.length >=
      2
    ) {
      informational.push({
        word:
          record.word,
        overlap,
        context:
          record.context,
        meaning:
          record.meaning
      });
    }
  }
}

console.log(
  "=== Check Transfer context leakage audit ==="
);

console.log(
  `Transfer records discovered: ${unique.length}`
);

console.log(
  `Hard base-repetition flags: ${hard.length}`
);

console.log(
  `Meaning-overlap review flags: ${informational.length}`
);

hard
  .slice(
    0,
    40
  )
  .forEach(
    item => {
      console.log(
        `- HARD ${item.word}: repeats likely base "${item.base}" | ${item.context}`
      );
    }
  );

informational
  .slice(
    0,
    40
  )
  .forEach(
    item => {
      console.log(
        `- REVIEW ${item.word}: meaning/context overlap [${item.overlap.join(", ")}]`
      );
    }
  );

if (
  !unique.length
) {
  console.log(
    "No Check Transfer items were exposed through FirstVoloInstructionalProtection.checkTransferItems."
  );

  process.exitCode =
    1;
} else if (
  hard.length
) {
  console.log(
    "Context leakage review complete: false — hard base-repetition flags need correction."
  );

  process.exitCode =
    2;
} else {
  console.log(
    "Context leakage hard check complete: true"
  );
}
