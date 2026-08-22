"use strict";

const fs = require("fs");

const source =
  fs.readFileSync(
    "instructional-check-transfer.js",
    "utf8"
  );

const failures = [];
const reviews = [];

const recordPattern =
  /id:\s*"(ct-[^"]+)"[\s\S]{0,900}?word:\s*"([^"]+)"[\s\S]{0,900}?sentence:\s*"([^"]+)"[\s\S]{0,900}?expectedMeaning:\s*"([^"]+)"/g;

const records = [];
let match;

while (
  (
    match =
      recordPattern.exec(
        source
      )
  )
) {
  records.push({
    id: match[1],
    word: match[2],
    sentence: match[3],
    expectedMeaning: match[4]
  });
}

if (records.length < 190) {
  failures.push(
    `Expected at least 190 protected Check Transfer records; parsed ${records.length}.`
  );
}

const explicitDefinitionPatterns = [
  /\bmeans?\b/i,
  /,\s*or\s+(?:the|an|a|ability|act|process|quality|state)\b/i,
  /,\s*(?:a|an|the)\s+(?:person|thing|machine|device|process|quality|state|act|result)\b/i,
  /\bis\s+the\s+study\s+of\b/i,
  /\bis\s+(?:a|an)\s+(?:person|thing|machine|device)\s+(?:who|that)\b/i,
  /\bmeaning\s+it\b/i,
  /\bwas\s+the\s+(?:process|result|act)\s+of\b/i
];

const stop = new Set([
  "a","an","the","of","to","in","on","for","and","or","is","are","was","were",
  "be","being","been","that","this","it","its","from","with","as","something",
  "someone","thing","person","act","action","process","result","related","able",
  "one","into","out","by","at","than","who","which","what"
]);

function tokens(value) {
  return String(value || "")
    .toLowerCase()
    .replace(
      /[^a-z0-9'-]+/g,
      " "
    )
    .split(/\s+/)
    .map(
      token =>
        token.replace(
          /^'+|'+$/g,
          ""
        )
    )
    .filter(Boolean);
}

function stem(token) {
  return token
    .replace(
      /(ing|ed|es|s)$/i,
      ""
    );
}

for (const record of records) {
  const sentence =
    record.sentence;

  for (
    const pattern
    of explicitDefinitionPatterns
  ) {
    if (pattern.test(sentence)) {
      failures.push(
        `${record.id} ${record.word}: direct-definition style context -> ${sentence}`
      );
      break;
    }
  }

  const sentenceTokens =
    tokens(sentence)
      .filter(
        token =>
          token !==
          record.word.toLowerCase()
      );

  const meaningTokens =
    tokens(
      record.expectedMeaning
    )
      .filter(
        token =>
          !stop.has(token) &&
          token.length >= 4
      );

  const sentenceStems =
    new Set(
      sentenceTokens.map(stem)
    );

  const overlap =
    [
      ...new Set(
        meaningTokens.filter(
          token =>
            sentenceStems.has(
              stem(token)
            )
        )
      )
    ];

  if (overlap.length) {
    reviews.push({
      type: "meaning-overlap",
      id: record.id,
      word: record.word,
      detail:
        overlap.join(", "),
      sentence
    });
  }

  const wordCount =
    sentenceTokens.length + 1;

  if (wordCount > 22) {
    reviews.push({
      type: "sentence-length",
      id: record.id,
      word: record.word,
      detail:
        `${wordCount} words`,
      sentence
    });
  }

  const longOtherWords =
    [
      ...new Set(
        sentenceTokens.filter(
          token =>
            token.length >= 12
        )
      )
    ];

  if (longOtherWords.length) {
    reviews.push({
      type: "accessibility",
      id: record.id,
      word: record.word,
      detail:
        longOtherWords.join(", "),
      sentence
    });
  }
}

const required = new Map([
  [
    "ct-mot-01",
    "The conductor inspected the locomotive before the train left the station."
  ],
  [
    "ct-mot-02",
    "The scientist watched the cells' motility under a microscope."
  ],
  [
    "ct-over-01",
    "Maya stopped pouring so she would not overfill the cup."
  ],
  [
    "ct-less-02",
    "The cleaner was odorless even after the bottle was opened."
  ]
]);

for (
  const [
    id,
    expectedSentence
  ]
  of required
) {
  const record =
    records.find(
      item =>
        item.id === id
    );

  if (
    !record ||
    record.sentence !==
      expectedSentence
  ) {
    failures.push(
      `${id}: required revised context is missing`
    );
  }
}

console.log(
  "=== Check Transfer context quality audit ==="
);
console.log(
  `Protected records parsed: ${records.length}`
);
console.log(
  "Policy: accessible surrounding vocabulary + no direct definition + morphology still contributes meaning"
);
console.log(
  `Hard failures: ${failures.length}`
);
console.log(
  `Review flags: ${reviews.length}`
);

const byType = {};

for (const item of reviews) {
  byType[item.type] =
    (
      byType[item.type] ||
      0
    ) +
    1;
}

console.log(
  "Review counts:",
  byType
);

reviews
  .slice(
    0,
    80
  )
  .forEach(
    item => {
      console.log(
        `- REVIEW ${item.type} ${item.id} ${item.word}: ${item.detail} :: ${item.sentence}`
      );
    }
  );

if (failures.length) {
  failures.forEach(
    failure =>
      console.log(
        `- HARD ${failure}`
      )
  );

  process.exitCode = 1;
} else {
  console.log(
    "Check Transfer context quality hard gate complete: true"
  );
}
