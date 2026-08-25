# First Volo Morphology — Handoff
## 2026-08-24

## DONE

### Master lexical audit
- Master workbook saved in repo:
  `audits/lexical/First_Volo_Morphology_Master_Lexical_Audit_2026-08-24.xlsx`
- Workbook contains the current lexical/content-control snapshot.
- Major morphology research and architecture decisions are recorded there.
- Source enrichment is still incomplete; do not treat all dictionary/list fields as finished.

### Five corrected tiles installed in ACTIVE folders
Active folders only:
- `images/prefixes/`
- `images/roots/`
- `images/suffixes/`

Installed:
- `images/roots/pend-pens.png`
- `images/suffixes/er-agent.png`
- `images/suffixes/or-agent.png`
- `images/suffixes/er-more.png`
- `images/suffixes/er-or.png`

DO NOT use:
- `images/prefixes old/`
- `images/roots old/`
- `images/suffixes old/`

Audit found no active references to those old folders.

### pend/pens architecture
Overall target:
`pend/pens = hang; weigh/consider`

Important:
- Keep word-specific sense selection.
- `pendant` and `suspend` may correctly use `knownMeaning: "hang"`.
- Do NOT replace every word-specific pend/pens sense with both meanings.

Updated central/student target language:
- `word-inventory.js`
- `script.js`

### Agent -er/-or architecture
Target meaning:
`a person or thing that does something`

Keep separate from comparative:
- agent `-er`
- agent `-or`
- combined agent family `-er/-or`
- comparative `-er = more`

Updated:
- central inventory
- student lessons
- individual -er/-or lesson assets
- Flight A Pre/Post source
- teacher/material-family sources
- printable family configs

Separate -or now uses:
`images/suffixes/or-agent.png`

### Formal Flight A Pre/Post
`flight-a-assessment.js`
old:
`one who does something`

new:
`a person or thing that does something`

Four assessment-language occurrences corrected.
Core JS syntax check passed.

### Teacher/material-family sources
Corrected stale agent wording in:
- `instructional-material-families.js`
- `instructional-material-families.json`

Audit after correction:
- no stale `one who; person or thing that`
- no stale `one who; person who`
- no stale generic `person or thing that`
- no old `images/suffixes/or.png` agent reference

### Printable source configs
Corrected:
- `printable-configs/cook.py`
- `printable-configs/view.py`
- `printable-configs/port.py`
- `printable-configs/tract.py`

TRACT now points to:
`images/suffixes/or-agent.png`

Python config syntax passed.

### Build & Discover regeneration
Successfully regenerated REVIEW copies for:
- COOK
- VIEW
- PORT
- TRACT

Generator QA for all:
- exact repo PNGs used
- 4 pages
- correct US Letter dimensions
- card size 2.22 x 1.08 in
- Mat B clearance 0.29 in
- no artwork substitution

Review outputs:
- `generated-printables/COOK_Build_and_Discover.pdf`
- `generated-printables/VIEW_Build_and_Discover.pdf`
- `generated-printables/PORT_Build_and_Discover.pdf`
- `generated-printables/TRACT_Build_and_Discover.pdf`

Published PDFs were NOT overwritten.

---

## DOING / NEXT IMMEDIATE STEP

### 1. VISUAL QA THE FOUR GENERATED PDFs
Open:
- COOK
- VIEW
- PORT
- TRACT

Check especially:
- purple suffix tile styling
- correct new -er tile
- correct new -or tile in TRACT
- no old artwork
- no clipping
- correct wording
- page/card layout intact

DO NOT publish/copy generated PDFs until visually approved.

### 2. After visual approval
Copy approved generated family PDFs into the appropriate published printable locations.

Then re-run printable/browser QA.

---

## TO DO — IN ORDER

### 3. Finish remaining architecture propagation
Do not mix these casually into the -er/-or patch.

Still needs deliberate propagation/audit:
- `un-` split:
  - negation = not
  - reversative = reverse/remove/do opposite
- `-ant/-ent`:
  - adjective function
  - agent/instrument noun function
- `-ance/-ence`:
  - one noun-forming family
- `-ly`:
  - adverb
  - adjective
- other settled root/affix corrections recorded in master audit
- corrected tile references for all settled targets

### 4. Central registry first
Update one canonical source of truth before hand-fixing lessons.

Registry needs:
- target IDs
- meanings
- allomorphs/stem variants
- lexical families
- approved segmentation
- word-specific target sense
- Literal meaning from the parts
- non-target support
- candidate/guided/fresh/protected role
- exact/family protection

### 5. Propagate from registry
Then refresh:
1. student online lessons
2. teacher-guided sessions
3. digital Pre/Post A/B/C
4. paper/print Pre/Post
5. print/session materials
6. digital consolidation/practice
7. paper mats
8. Curriculum Map / scope and sequence

### 6. Glossary
Build canonical glossary dataset supporting:
- alphabetical sort
- Flight sort
- word-part/type sort
- corrected tile
- approved meaning
- examples
- forms students may see

Use same data for online + printable glossary.

### 7. Final audits
Re-run:
- lexical protection
- lexical-family freshness
- instructional language
- segmentation
- target-sense fit
- non-target support
- guided depth
- fresh Apply
- protected Transfer
- formal assessment separation
- runtime
- UI
- browser/print preview

---

## IMPORTANT PROTECTION / INSTRUCTION RULES

Instructional sequence:
independent attempt → identify barrier → least support → retry same demand → fade support

Teacher-guided instruction may provide meanings of NON-TARGET parts after the initial attempt.

Keep separate:
- guided teaching
- fresh Apply
- protected Transfer
- formal assessment

Do not use protected exact words or close lexical-family equivalents as ordinary instructional evidence.

Do not fake-decompose words.

Etymological family membership does not automatically mean a word is appropriate for present-day instructional decomposition.

Preferred instructional label:
`Literal meaning from the parts.`

---

## REPO STATUS NOTE

There are additional pre-existing modified/untracked tile files in the working tree from earlier architecture work, including several roots/suffixes and new split-family tiles.

DO NOT:
- `git add .`
- stage `images/* old/`
- assume every currently modified image belongs to this checkpoint

This checkpoint intentionally stages only the lexical workbook + five final tiles + agent/pend lesson/assessment/material-source corrections + this handoff.

