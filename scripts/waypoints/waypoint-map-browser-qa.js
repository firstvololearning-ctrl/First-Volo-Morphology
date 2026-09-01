#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require("playwright");

const preview =
  process.argv[2] ||
  "http://127.0.0.1:8766/index.html";

const PROGRESS_KEY =
  "firstVoloMorphologyProgressV1";

const SETS = Object.freeze({
  A: [
    "foundation-prefixes-1",
    "foundation-prefixes-2",
    "foundation-suffixes-1",
    "foundation-suffixes-2"
  ],
  B: [
    "expansion-prefixes-1",
    "expansion-prefixes-2",
    "expansion-roots-1",
    "expansion-roots-2",
    "expansion-roots-3",
    "expansion-suffixes-1",
    "expansion-suffixes-2"
  ],
  C: [
    "advanced-prefixes",
    "advanced-roots-1",
    "advanced-roots-2",
    "advanced-roots-3",
    "advanced-suffixes"
  ]
});

function progressData(setIds) {
  return {
    students: [
      {
        id: "waypoint-browser-qa",
        name: "Waypoint QA",
        sessions: [],
        voloTokens: Object.fromEntries(
          setIds.map((setId) => [
            setId,
            {
              setId,
              earnedAt:
                "2026-09-01T00:00:00.000Z"
            }
          ])
        )
      }
    ],
    activeStudentId: "waypoint-browser-qa"
  };
}

function getBrowserExecutable() {
  const candidates = [
    process.env.FIRST_VOLO_BROWSER_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    chromium.executablePath()
  ].filter(Boolean);

  return candidates.find(
    (candidate) => fs.existsSync(candidate)
  ) || null;
}

async function setProgress(page, setIds) {
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );
    },
    {
      key: PROGRESS_KEY,
      value: progressData(setIds)
    }
  );

  await page.reload({
    waitUntil: "domcontentloaded"
  });

  await page.waitForFunction(
    () =>
      Boolean(
        window.FirstVoloMigrationMap &&
        window.FirstVoloWaypointAccess
      )
  );
}

async function openFlight(page, flightValue) {
  await page.selectOption(
    "#gradeBandSelect",
    flightValue
  );

  await page.click(
    ".migration-map-launch-button"
  );

  await page.waitForSelector(
    ".migration-waypoint-section"
  );
}

async function closeMap(page) {
  await page.click(
    ".migration-modal-close"
  );
}

(async () => {
  const executablePath =
    getBrowserExecutable();

  if (!executablePath) {
    throw new Error(
      "No compatible browser executable was found. Set FIRST_VOLO_BROWSER_PATH or install Playwright Chromium."
    );
  }

  const browser = await chromium.launch({
    executablePath,
    headless: true
  });

  const page = await browser.newPage({
    viewport: {
      width: 1440,
      height: 1000
    }
  });

  const pageErrors = [];

  page.on(
    "pageerror",
    (error) => pageErrors.push(error.message)
  );

  await page.goto(preview, {
    waitUntil: "domcontentloaded"
  });

  const allSets = [
    ...SETS.A,
    ...SETS.B,
    ...SETS.C
  ];

  await setProgress(page, allSets);

  for (const [flightValue, expected] of [
    ["2-3", 11],
    ["4-5", 9],
    ["6-8", 13]
  ]) {
    await openFlight(page, flightValue);

    assert.equal(
      await page.locator(
        ".migration-waypoint-word.is-available"
      ).count(),
      expected,
      `${flightValue}: available Waypoint count`
    );

    assert.equal(
      await page.locator(
        ".migration-waypoint-word.is-locked"
      ).count(),
      0,
      `${flightValue}: no locked Waypoints after all tokens`
    );

    const firstLink = page.locator(
      ".migration-waypoint-word.is-available"
    ).first();

    assert.equal(
      await firstLink.getAttribute("target"),
      "_blank",
      `${flightValue}: available Waypoint reopens in a separate tab`
    );

    const pdfPath =
      await firstLink.getAttribute("href");
    const pdfResponse =
      await page.request.get(
        new URL(pdfPath, preview).href
      );

    assert.ok(
      pdfResponse.ok(),
      `${flightValue}: linked Waypoint PDF exists`
    );

    await closeMap(page);
  }

  await setProgress(
    page,
    SETS.B.slice(0, 6)
  );
  await openFlight(page, "4-5");

  assert.equal(
    await page.locator(
      ".migration-waypoint-word.is-available"
    ).count(),
    6,
    "Flight B Village: six eligible Waypoints are available"
  );
  assert.equal(
    await page.locator(
      ".migration-waypoint-word.is-locked"
    ).count(),
    3,
    "Flight B Village: three Coast-paced Waypoints remain locked"
  );
  assert.equal(
    await page.locator(
      ".migration-waypoint-word.is-locked"
    ).allTextContents()
      .then((items) =>
        items.every(
          (text) =>
            !/MICROSCOPIC|PREDICTIVE|PROSPECTIVE/.test(
              text
            )
        )
      ),
    true,
    "Locked Waypoint words stay unnamed"
  );

  await closeMap(page);

  await setProgress(page, []);
  await openFlight(page, "2-3");

  assert.equal(
    await page.locator(
      ".migration-waypoint-word.is-available"
    ).count(),
    0,
    "No-token learner has no available Waypoints"
  );
  assert.equal(
    await page.locator(
      ".migration-waypoint-word.is-locked"
    ).count(),
    11,
    "No-token learner sees eleven unnamed Flight A placeholders"
  );

  const panelBox = await page.locator(
    ".migration-waypoint-section"
  ).boundingBox();
  const modalBox = await page.locator(
    ".migration-modal-content"
  ).boundingBox();

  assert.ok(
    panelBox &&
      modalBox &&
      panelBox.x >= modalBox.x &&
      panelBox.x + panelBox.width <=
        modalBox.x + modalBox.width + 1,
    "Waypoint panel stays within the migration modal"
  );

  assert.deepEqual(
    pageErrors,
    [],
    `Browser page errors: ${pageErrors.join(" | ")}`
  );

  console.log(
    JSON.stringify(
      {
        status: "PASS",
        fullFlightCounts: {
          A: 11,
          B: 9,
          C: 13
        },
        flightBVillage: {
          available: 6,
          coastPacedLocked: 3
        },
        lockedWordsUnnamed: true,
        pdfLinks: "pass",
        browserErrors: 0
      },
      null,
      2
    )
  );

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
