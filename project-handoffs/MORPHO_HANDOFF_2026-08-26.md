# First Volo Morphology — Handoff — 2026-08-26

## Repo

`/Users/asacco/Documents/First Volo Learning/Digital Products/First Volo Morphology`

## Current local architecture checkpoint

Sense-specific targets are now implemented for:

- `un-negation` — un- = not
- `un-reversative` — un- = reverse/remove
- `ly-adverb` — -ly = in a ___ way
- `ly-adjective` — -ly = having qualities of / like
- `ant-ent-agent` — -ant/-ent = a person or thing that does something
- `ant-ent-adjective` — -ant/-ent = describes what someone or something is like or tends to do

Current inventory contains 96 canonical targets.

`ance` and `ence` remain separate canonical IDs with the same current student-facing noun-forming meaning.

## Local commits after origin/main

- `b5fef67` — Add sense-specific morphology target tags
- `bfbfead` — Propagate sense-specific morphology targets
- `8d10adb` — Align un-negation instructional meaning
- `ddc968e` — Align Flight A un-negation assessment wording

Do not push until remaining release checks are complete.

## Audits already green

- system-wide word selector: 0 hard failures
- prompt quality: 0 hard failures
- lexical protection: 0 hard failures
- Word Part rich instruction: 0 hard failures
- Figure It Out / Build support-demand: 0 hard failures
- Build tile audit: 0 failures
- nonapplicable routing: 0 failures
- family printable readiness: 0 hard failures
- Check Transfer leakage/coverage audits: 0 hard failures
- teacher material coverage: 852/852 applicable cells covered
- token assignment: 96 inventory targets, 96 assigned, 0 missing, 0 duplicate

## Known nonblocking token preflight gaps

- `ly-adjective`: only 1/2 application opportunities
- `vert`: only 1/2 application opportunities

Do not invent vocabulary merely to satisfy token preflight.
Token earning has not been enabled.

## Master lexical audit

Canonical tracked workbook:

`audits/lexical/First_Volo_Morphology_Master_Lexical_Audit_2026-08-24.xlsx`

Synchronized on 2026-08-26 to reflect:

- 96 live targets
- completed sense-specific propagation
- corrected Flight A un-negation assessment wording
- current curriculum-map alignment
- separate live `ance` and `ence` IDs
- updated current-status/Handoff/Post-Checkpoint sheets

Historical `Master Words` and `Occurrences` snapshot values were intentionally preserved.

## Repo safety

Never use `git add .`.

Do not stage, delete, or use:

- `images/prefixes old/`
- `images/roots old/`
- `images/suffixes old/`

Unrelated local image work remains intentionally outside morphology commits.

## Next blocking work

1. Regenerate and visually QA paper Pre/Post A/B/C from current assessment source.
2. Audit saved-progress read compatibility for old literal target IDs such as `un`, `ly`, and `ant-ent`.
3. Build the canonical glossary from the current 96-target registry.
4. Run final whole-system propagation audit across online instruction, teacher-led sessions, digital tests, paper tests, printables, curriculum map, glossary, definitions, protection, and artwork.
5. Selectively commit final intentional files.
6. Push/deploy only after final checks are green.

## Separate backlog — not a blocker for current propagation

- 69 candidate-only HOLD rows remain outside live instruction.
- 46 broader Break It Apart target-level gaps remain.
- additional external accessibility/source fields remain queued where explicitly marked.
