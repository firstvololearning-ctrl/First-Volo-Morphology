# Four supported exposure activities

Implemented the user-approved next batch in the local Learn draft:

| Flight | Contrast | Parts | Words |
|---|---|---|---|
| A | Before / too little | pre, under | preschool, precook / undercook, underpaid |
| B | Sound / heat | phon, therm | phonics, telephone / thermal, geothermal |
| B | Looking / measuring | scop, metr | microscope, telescope / metric, diameter |
| C | Hearing / skin | aud, derm | audio, audience / dermal, dermatology |

Eight previously card-only entries gain meaning-sort exposure. All sixteen words already exist in the canonical inventory and pass their respective Standard Words/flight and current protection filters. No word placement, WVI or source approval changed. Original contexts and explanations teach the relevant sense; under- is deliberately too little, not below. Pictures and meanings stay visible, with retry explanations and no score/mastery claim.

The review page at http://localhost:8765/meaning-sort/ now offers seven curated contrasts. It uses the production sorting renderer with isolated content and no auth/database services. These four rounds are also integrated in the app's local draft, not just the preview.

Validation: content tests cover 60 flight/vocabulary/type combinations; UI tests pass all 22 root/suffix/prefix rounds including wrong-answer retry, completion and navigation, plus prior worked examples/starter flows. Browser confirms the new selector and Flight C art/layout. Source syntax and diff-whitespace checks pass. Existing word ledger values preserved; only Post-Checkpoint Updates A35:E35 added and synchronized to the repository workbook. Remaining source checks remain pending.

Not published to production. The earlier audit files are historical snapshots before this batch; do not treat their gap counts as updated totals.
