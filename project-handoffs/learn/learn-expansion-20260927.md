# Learn expansion — September 27, 2026

Local review branch: `codex/morphology-learn-expansion-20260927`. Not deployed.

## Changed behavior

- Roots and suffixes now use Sort It: six configured groups each, filtered by flight, vocabulary, and the central protected-word registry. A round needs at least two nonempty targets and four eligible cards. Words belonging to two displayed families are omitted rather than assigned an arbitrary answer.
- Ten Learn-only examples fill sparse entries for reversative un-, adjective -ly, agent -ant/-ent, and adjective -ant/-ent. These supplement rather than replace the original inventory; proposed word placements follow the existing target bands and are editorial recommendations, not verified grade norms.
- Twelve selected cards have an original worked explanation, a sentence, a two-choice meaning check, explanatory retry feedback, and spoken explanation text through the existing audio interface. Availability follows the selected word filters.
- Explore instructions change when Sort It is selected. Keyboard focus moves to the next unplaced card or next-round control.
- Existing prefix rounds now exclude protected/filtered words. When none survives, three configured prefix-family fallback groups draw from safe Learn examples. No protected registry entries or assessment materials were changed.

The addition is intentionally confined to Learn. New word metadata does not change other activities, grading, or the master word inventory. Existing words use master metadata first. Some flight/vocabulary combinations have no compatible round; the interface says so rather than ignoring the settings. Rich explanations cover twelve cards, not all 96.

## Content review references

Sentences, explanations, and choices are original. The following dictionary entries were consulted for the meanings and grammatical uses of new examples; no dictionary sentences were copied:

- [Friendly](https://www.merriam-webster.com/dictionary/friendly): adjective use in the selected sentence. The activity does not claim every use of “friendly” is adjectival.
- [Contestant](https://www.merriam-webster.com/dictionary/contestant): person participating in a contest.
- [Persistent](https://www.merriam-webster.com/dictionary/persistent): continuing/keeping at an action.
- [Tolerant](https://www.merriam-webster.com/dictionary/tolerant).

Worked examples distinguish agent -er from comparative -er and adjective -ly from adverb -ly. Writer explicitly models final-e removal. Geology shows geo + -logy without doubling the combining o.

## Validation

- `node scripts/morphology-learn-content-test.js`: 40 root/suffix flight-vocabulary combinations, twelve worked examples, ten new words, exclusions, segmentation, duplicate destinations, and empty banks.
- `NODE_PATH=/path/to/jsdom/node_modules node scripts/morphology-learn-ui-test.js`: jsdom 26; twelve entire sorting rounds, wrong/correct actions, next-round wrap, focus, twelve worked-example checks, audio text, filter suppression, prefix fallback, script order and absence of inline handlers. Uses the actual Learn renderers and actual banks; surrounding application/audio services are fixtures.
- Existing central sign-in and visible Flight-label checks passed.
- Existing instructional-protection audit: 2,883 teacher recipes, 271 protected words, zero hard protection failures.
- Static CSP review: all 69 ecosystem HTML pages passed. The new script is same-origin; no inline handlers were introduced or CSP protections relaxed.

Live visual/mobile testing, actual audio playback, authenticated production flows, and teacher acceptance of the new instructional content remain unverified. No live browser control permissions were used and no data services were changed.
