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
    ["diverting", "Workers are diverting traffic near the closed road."],
    ["vocation", "Teaching became her vocation after she finished college."],
    ["enactment", "The enactment of the new rule happened on Monday."],
    ["dictation", "During dictation, the students listened and wrote in their notebooks."],
    ["deformable", "The engineer tested the deformable material by pressing it."],
    ["seismograph", "The seismograph was running when the ground shook."],
    ["autoimmune", "The doctor discussed an autoimmune condition with the family."],
    ["bibliometrics", "The librarian used bibliometrics during a research project."],
    ["dermatological", "She made a dermatological appointment at the clinic."],
    ["endoscope", "The doctor prepared an endoscope before the procedure."],
    ["barometer", "The class checked the barometer before going outside."],
    ["odometer", "The driver checked the odometer before starting the trip."],
    ["thermoregulation", "The coach talked about thermoregulation during practice on a hot day."],
    ["thermodynamic", "The class observed a thermodynamic change during the lab."],
    ["geosphere", "The class labeled the geosphere on a science diagram."],
    ["terrarium", "The class placed a terrarium near the window."],
    ["tidal", "The class recorded tidal changes at the beach."],
    ["aquatic", "The aquarium has several aquatic plants."],
    ["solidify", "The mixture began to solidify after it was left on the table."],
    ["porous", "Water moved slowly through the porous rock."],
    ["hazardous", "Students wore gloves while handling the hazardous material."],
    ["cookware", "Maya put the cookware in the kitchen cabinet."],
    ["telemetry", "The spacecraft used telemetry during the mission."],
    ["dermatitis", "The doctor examined the dermatitis on Maya's arm."],
    ["viewfinder", "Maya checked the viewfinder before taking the picture."]
  ]);

for (const [word, expectedSentence] of required) {
  const pattern =
    new RegExp(
      `word:\\s*"${word}"[\\s\\S]{0,500}?sentence:\\s*"([^"]*)"`
    );

  const match =
    source.match(pattern);

  if (!match || match[1] !== expectedSentence) {
    failures.push(
      `${word}: required second-pass context is missing`
    );
  }
}

const bannedPairs = [
  ["diverting", /\bturn(?:ing|ed)?\b|\baway\b/i],
  ["vocation", /\bwork\b|\bcalled\b/i],
  ["dictation", /\bwords?\b|\bsaid\b/i],
  ["deformable", /\bshape\b|\bchanged?\b/i],
  ["seismograph", /\brecords?\b|\bearthquake\b/i],
  ["endoscope", /\blook\b|\binside\b/i],
  ["barometer", /\bpressure\b|\bmeasures?\b/i],
  ["odometer", /\bmeasures?\b|\btraveled\b/i],
  ["geosphere", /\bsolid\b|\bearth\b/i],
  ["solidify", /\bbecome\b|\bsolid\b/i],
  ["porous", /\bholes?\b/i],
  ["hazardous", /\bdangerous\b|\bquality\b/i],
  ["cookware", /\bcooking\b/i],
  ["telemetry", /\bmeasurements?\b|\baway\b/i],
  ["dermatitis", /\binflammation\b|\bskin\b/i]
];

for (const [word, banned] of bannedPairs) {
  const pattern =
    new RegExp(
      `word:\\s*"${word}"[\\s\\S]{0,500}?sentence:\\s*"([^"]*)"`
    );

  const match =
    source.match(pattern);

  if (match && banned.test(match[1])) {
    failures.push(
      `${word}: context still contains a known giveaway token -> ${match[1]}`
    );
  }
}

console.log(
  "=== Check Transfer second-pass target leakage audit ==="
);
console.log(
  `Curated second-pass contexts checked: ${required.size}`
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
    "Second-pass target leakage cleanup complete: true"
  );
}
