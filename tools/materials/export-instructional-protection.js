"use strict";

const fs =
  require("fs");

const path =
  require("path");

const ROOT =
  path.resolve(
    __dirname,
    "../.."
  );

const protectionPath =
  path.join(
    ROOT,
    "project-handoffs",
    "connected-text",
    "first-volo-excerpt-protection-registry-v2.json"
  );

const transferPath =
  path.join(
    ROOT,
    "transfer-challenge-data.js"
  );

const handoff =
  JSON.parse(
    fs.readFileSync(
      protectionPath,
      "utf8"
    )
  );

const transfer =
  require(
    transferPath
  );

const formalByFlight =
  handoff
    ?.pools
    ?.formal_pre_post
    ?.verifiedWordsDuringThisAudit ||
  {};

const formalWords = [
  ...new Set(
    Object.values(
      formalByFlight
    )
      .flat()
      .map(
        word =>
          String(word)
            .toLowerCase()
      )
  )
].sort();

const migrationWords =
  transfer
    .getReservedWords()
    .map(
      word =>
        String(word)
          .toLowerCase()
    )
    .sort();

const payload = {
  version:
    "instructional-protection-v1",

  formalPrePost:
    formalWords,

  migrationChallenge:
    migrationWords,

  connectedTextTransfer:
    [],

  principle:
    "Formal assessment targets, Migration Challenge words, and Session Guide Check Transfer words remain separate from ordinary instructional materials."
};

fs.writeFileSync(
  path.join(
    ROOT,
    "instructional-protection-registry.json"
  ),
  JSON.stringify(
    payload,
    null,
    2
  ) + "\n"
);

fs.writeFileSync(
  path.join(
    ROOT,
    "instructional-protection-registry.js"
  ),
  `"use strict";\n\nwindow.FirstVoloInstructionalProtection = ${JSON.stringify(
    payload,
    null,
    2
  )};\n`
);

console.log(
  `✓ Formal protected words: ${formalWords.length}`
);

console.log(
  `✓ Migration Challenge protected words: ${migrationWords.length}`
);

console.log(
  "✓ Protection registry exported from authoritative sources"
);
