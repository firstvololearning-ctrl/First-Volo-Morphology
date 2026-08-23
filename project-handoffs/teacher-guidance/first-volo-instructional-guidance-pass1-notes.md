# First Volo Morphology — Dynamic Instructional Guidance, Pass 1

## Implemented in the module

- Backward-compatible normalization of existing progress responses.
- Preserves existing `correct` as independent / first-check performance.
- Adds instructional metadata fields:
  - `independentCorrect`
  - `difficultyType`
  - `linguisticRole`
  - `supportingTargetRoles`
  - `accessSupportsUsed`
  - `instructionalScaffoldsUsed`
  - `supportHistory`
  - `outcomeAfterSupport`
- Adds APIs for recording educator support without rewriting the original independent result.
- Separates access support from morphology scaffolding.
- Reads the most recent saved student work.
- Generates a structured next-session handoff using:
  - last Flight
  - vocabulary level
  - study mode
  - activity
  - target / word
  - independent performance
  - difficulty type
  - prior supports
  - success after support
- Generates the four locked session components:
  - Retrieve
  - Teach / Practice
  - Apply
  - Check Transfer
- Keeps protected transfer instructions separate from regular practice.
- Uses the exact `linguisticRole` when supplied; otherwise uses neutral `word part` rather than incorrectly guessing base/root/Greek combining form from Flight.
- Implements the locked support order:
  - attempt → identify barrier → least support → another attempt → fade

## Existing repository facts used

- Progress is stored under `firstVoloMorphologyProgressV1`.
- Existing session data already stores activity, study mode, Flight/grade band, vocabulary level, score/accuracy, and item-level targets/responses.
- The public app deliberately groups Greek combining forms into the blue Roots category for student simplicity, so the educator-facing exact linguistic term cannot safely be inferred from the UI category alone.

## Integration points (not committed)

1. Add `instructional-guidance.js` after `activity-progress.js` in `index.html` so new responses receive the augmented metadata and support-recording API.
2. Add it after `word-inventory.js` and before `progress-tracker.js` on `program-progress.html` so the teacher-facing progress page can generate guidance.
3. Add the teacher-facing Session Guide renderer to Program Progress after the existing Volo Token summary.
4. Wire exact item/family terminology into `linguisticRole`; do not assign role from Flight alone.
5. Wire educator support controls so support events and outcomes can be recorded when they actually occur.

## Tested

The module passed Node syntax checking and a mocked Flight B / `struct` / Figure It Out → Use It scenario. The test verified that a prior non-independent response that became successful after sentence-context support produces a faded-support Retrieve recommendation and preserves protected Transfer guidance.
