"use strict";

const fs = require("fs");

const source =
  fs.readFileSync(
    "instructional-check-transfer.js",
    "utf8"
  );

const failures = [];

const required =
  new Map([
    ["ct-pre-01", "Maya used a prewrite page for her essay."],
    ["ct-ten-02", "The soil stayed moist because it was retentive."],
    ["ct-tract-01", "The rough tires gave the bicycle better traction on the wet road."],
    ["ct-tract-02", "The turtle's retraction of its head happened when it heard a loud sound."],
    ["ct-val-01", "The expert completed a valuation before the painting was sold."],
    ["ct-vert-01", "The old factory was converted into apartments last year."],
    ["ct-voc-02", "The ceremony began with an invocation led by the principal."],
    ["ct-act-02", "Closing the blinds can counteract the afternoon heat and keep the room cooler."],
    ["ct-aud-02", "The lesson included an auditory clue along with a picture."],
    ["ct-cred-02", "The visitor showed a credential at the front desk."],
    ["ct-dict-01", "The teacher will dictate the sentence while students write."],
    ["ct-form-01", "The early sketch was formative for the final design."],
    ["ct-graph-02", "The museum displayed a photographic poster from the event."],
    ["ct-auto-01", "The aircraft used autopilot during part of the flight."],
    ["ct-biblio-01", "The counselor suggested bibliotherapy during a weekly group."],
    ["ct-geo-02", "The class drew a geocentric model during science."],
    ["ct-terr-01", "The rover was designed for terrestrial travel instead of ocean travel."],
    ["ct-ic-02", "The island contains volcanic rock near the mountain."],
    ["ct-ist-02", "The violinist walked onto the stage before the concert."],
    ["ct-ize-01", "The lab will sterilize the tools before the experiment."],
    ["ct-ize-02", "The library will digitize the old photographs this summer."],
    ["ct-ness-02", "The team's readiness impressed the coach before the game."],
    ["ct-able-ible-02", "The teacher chose washable paint for art class."],
    ["ct-ful-01", "The resourceful student was chosen to help with the class project."],
    ["ct-ful-02", "The colorful mural covered the wall."],
    ["ct-ant-ent-02", "The absorbent towel was kept beside the sink."],
    ["ct-cook-02", "Maya opened the cookbook to choose a recipe."]
  ]);

for (const [id, expectedSentence] of required) {
  const idToken =
    `id: "${id}"`;

  const start =
    source.indexOf(
      idToken
    );

  if (start < 0) {
    failures.push(
      `${id}: item id not found`
    );
    continue;
  }

  const chunk =
    source.slice(
      start,
      start + 900
    );

  const expectedToken =
    `sentence: "${expectedSentence}"`;

  if (!chunk.includes(expectedToken)) {
    failures.push(
      `${id}: required V1.3.1 sentence is missing`
    );
  }
}

const oldGiveaways = [
  "pulled the head back",
  "how much the painting was worth",
  "turning it into a new kind of space",
  "called on the group",
  "they could act on immediately",
  "had to hear rather than see",
  "could be trusted to enter",
  "by saying it aloud",
  "helped shape the final design",
  "by itself",
  "Earth at the center",
  "on land rather than in water",
  "activity from a volcano",
  "making digital copies",
  "they were ready to begin",
  "it can be washed off",
  "several useful ways",
  "full of many bright colors",
  "quality of soaking up",
  "directions for cooking"
];

for (const phrase of oldGiveaways) {
  if (source.includes(phrase)) {
    failures.push(
      `old giveaway phrase remains: ${phrase}`
    );
  }
}

console.log(
  "=== Check Transfer final review cleanup audit V1.3.2 ==="
);
console.log(
  `Curated contexts checked: ${required.size}`
);
console.log(
  `Hard failures: ${failures.length}`
);

if (failures.length) {
  failures.forEach(
    failure =>
      console.log(`- ${failure}`)
  );
  process.exitCode = 1;
} else {
  console.log(
    "Final review cleanup complete: true"
  );
}
