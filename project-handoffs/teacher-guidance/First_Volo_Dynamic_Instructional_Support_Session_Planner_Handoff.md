# First Volo Morphology — Dynamic Instructional Support & Session Planner Handoff

**Current working state: August 20, 2026**

This Markdown companion is intended for copying into a new development thread. The DOCX is the human-readable formatted handoff.

## Executive decisions and current state

- Locked architecture: Retrieve → Teach/Practice → Apply → Check Transfer.
- Build sessions around the learner, not around finishing every activity.
- Current teacher card is a decision shell, not the full lesson. Next major build = instructional-session-planner.js.
- Branch: cloud-saving-foundation-20260817. Last confirmed pushed checkpoint: 431ca91. Teacher-guidance work is local-only/uncommitted.
- One Migration Challenge system; two parallel forms are retry forms, not two challenges. No teacher packets built. Do not merge to main yet.

## Non-negotiable support logic

- Independent attempt → identify barrier → least support → another attempt → fade.
- Access supports are separate from morphology scaffolds.
- Existing correct/independentCorrect remains first-attempt performance; support never rewrites it.
- Online boundary: clarify directions, decode nonessential words, or model task mechanics with a different example; do not solve the actual morphology item.

## Difficulty states

- independent; meaning; identify; connect; infer; context; retrieval; directions; decoding.

## Planner output

- Actual cumulative Retrieve prompts/items; exact Teach/Practice task and online activity; productive Apply word/excerpt; protected Check Transfer item; relevant conditional support ladder; fade rule; materials manifest; recording fields; print payload.

## Terminology

- Use item/family-specific role. Examples: COOK can be BASE WORD; struct = ROOT; Greek elements may be GREEK COMBINING FORM. Never infer role from Flight. Fallback = word part.

## Protection

- Keep formal pre/post, Migration Challenge, and Session Check Transfer pools separate.
- Migration Challenge: 5 items, pass 4/5, untimed, no hints, no Token/practice/formal-assessment effect, alternate form after failure, passed persists.
- Current reserved words: Flight A pregame/misplace/fearless/rebuild/readable | overcook/kindness/midpoint/unfair/speechless; Flight B export/biology/classify/semicircle/portable | manuscript/modernize/visible/thermometer/poetic; Flight C credence/detract/subsequent/acceptance/abnormal | evaluate/intervene/projection/dependent/retroactive.
- Authoritative correction: credence is current; older handoff “credible” is stale.

## Next build order

- 1) audit/checkpoint local logic; 2) add Change It to rules; 3) exact terminology registry; 4) instructional-session-planner.js; 5) protected eligible word selector; 6) materials resolver; 7) excerpt-bank Apply integration; 8) session Check Transfer pool; 9) full UI render; 10) support/adherence recording; 11) multi-session instructional memory; 12) Print Session; 13) edge tests; 14) remove transferTest bypass and normal-flow validation before merge.

## Full handoff

See the accompanying DOCX for the complete activity matrix, difficulty mapping, scaffold ladders, transition table, data schema, material/print requirements, edge cases, acceptance tests, source precedence, and continuation prompt.