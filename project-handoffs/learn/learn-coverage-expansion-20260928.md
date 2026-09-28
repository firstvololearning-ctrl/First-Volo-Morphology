> Release update: this historical pre-release review is superseded by release-20260928.md for publication status.

# Morpho Learn expansion — September 28, 2026

Implemented in the existing local candidate. This is a local, tested instructional expansion; it has not been committed, pushed, or deployed. The published-source audit remains accurate for its stated branch.

## What changed

| Measure | Before this expansion | After |
|---|---:|---:|
| Families with a worked lesson | 12 | 39 |
| Worked lessons including secondary examples | 13 | 40 |
| Lessons with a new-sentence application | 3 | 40 |
| Sorting rounds, all flights / Standard | 35 | 36 |
| Flight C prefix rounds / Standard | 0 | 1 |
| Families with no active teaching in their own Standard flight | 27 total across flights | 0 |
| Cards with no usable examples in their own Standard flight | 4 total across flights | 0 |

All 96 families now have a usable example and either a guided lesson or a reachable sorting activity in their assigned Standard flight. This does not mean all 96 have a worked lesson, nor that every narrow vocabulary filter has the same coverage.

The new lessons model the word meaning, ask a two-choice guided question, and then ask a question in a different sentence. Wrong answers receive explanatory feedback and cannot advance. Completion explicitly says guided practice; it does not award mastery. Historical and figurative relationships are explained without pretending every word is a freely buildable combination. Existing word placements and protected assessment words remain in force.

## Verified

- Content checks pass across 60 flight/vocabulary/activity combinations.
- All 36 sorting rounds complete in the actual renderer test.
- All 40 two-step lessons pass incorrect-answer, correct-answer, continuation and completion checks.
- Secondary-example navigation, focus, lesson audio text, and reserved-word exclusion pass.
- Existing audio routing tests pass: listening does not submit an answer, placed controls hide, stop/unavailable states work.
- Both changed production JavaScript files pass syntax checks.
- Browser review confirms Flight C prefix cards, helpful wrong-answer feedback, correct placement, and guided-lesson progression in the local review harness.

Tests use the current production renderer and content. The browser harness deliberately omits authentication, student records and persistence. These checks do not establish production deployment, speech pronunciation quality, learning gains, or independent mastery.

## Remaining instructional review, in simple terms

1. **Try the lessons with learners.** Watch whether they can explain the meaning, rather than just choose between two answers. A new sentence with the same taught word is supported application, not proof of transfer to an unfamiliar word.
2. **Review nine new word placements.** Their meanings have dictionary support, but their flight and vocabulary labels are editorial recommendations. They do not have newly verified WVI, NGSL, AWL, NAWL or learner-performance evidence. Preserve the existing master lexical workbook as the review ledger; no normative fields were invented or workbook rows overwritten in this change.
3. **Expand variety selectively.** Seven cards still have one eligible example in their own Standard flight: sub, ion and ment in A; circum and spect in B; mit and biblio in C. They now have active teaching. Add further examples only after lexical and assessment-protection review; do not lower existing difficulty labels just to fill a count.
4. **Release the local candidate through the normal review process.** This change does not resolve the separate ecosystem security/readiness findings or establish that the published branch contains Learn.

## New word source notes

The nine new Learn-only words are enlarge, endanger, lovable, enjoyable, transplant, exclude, ablate, retro-rocket and retrofire. Definitions and sentences in the lessons are original teaching text. Source checks support word meaning, not grade placement.

- [enlarge](https://www.merriam-webster.com/dictionary/enlarge) and [endanger](https://www.merriam-webster.com/dictionary/endanger): make larger / put in danger; provisional Flight A familiar.
- [lovable](https://www.merriam-webster.com/dictionary/lovable) and [enjoyable](https://www.merriam-webster.com/dictionary/enjoyable): adjective examples; provisional Flight A familiar.
- [transplant](https://www.merriam-webster.com/dictionary/transplant) and [exclude](https://www.merriam-webster.com/dictionary/exclude): moving a plant / leaving out; provisional Flight B academic.
- [ablate](https://www.merriam-webster.com/dictionary/ablate): remove material; provisional Flight C academic with explicit context.
- [retro-rocket](https://www.merriam-webster.com/dictionary/retro-rocket) and [retrofire](https://www.merriam-webster.com/dictionary/retrofire): a slowing rocket / igniting that rocket; provisional Flight C academic with explicit space context. Retrofire is not taught as simply firing backward.

Previously reviewed words reused as additional examples retain their master-inventory labels: precook, transform, construct, biologist, support, eruption, playful, harmless and endless.

## Scope and handoff

Changed this turn: learn-content.js; one completion sentence in script.js; content and UI regression tests. The assessment banks, protection registry, inventory, scoring, authentication and master workbook were not edited. Pre-existing local changes are preserved. The accompanying patch is relative to the local draft at the start of this expansion, not the published branch: applying it to the published branch alone will not provide the earlier Learn work.

Local review: http://127.0.0.1:8776/ (available while the preview server runs).
