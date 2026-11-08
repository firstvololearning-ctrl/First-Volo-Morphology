# Learn and evidence release — November 8, 2026

## Completed

Consolidated the 32-word review into Master Words and Definition Source Queue. Recorded user-supplied definitions, word-part and WVI evidence separately from independently retrieved Etymonline/Merriam-Webster sources. Fourteen WVI levels reported, 18 no-badge observations (bibliographer has no supplied Wordsmyth entry). Exact NGSL 1.2 headwords: circumstance, exclude, friendly, payment, resident, support, unclear. Exact NAWL 1.2: actively, aspect, transplant. Source links, provenance, uncertainty, and misspell mis-origin discrepancy retained. No WVI-to-grade mapping or automatic vocabulary reassignment. Other historical source/clinical gates remain open.

Learn now has optional ordered sections: meet the word part, see an example, try a sentence/word, sort and explain, and an additional eligible word when available. Meet uses the existing picture, an oral connection prompt, a meaning reveal and dedicated pronunciation/meaning playback. Existing whole-example playback remains available. The picture may already display the meaning; this is a supported introduction, not a blind recall test.

Sorts with two or more distinct meanings and at least two words per explained group offer meaning choices or oral explanation, followed by a comparison connecting the words to their target. Oral explanation is self-reported, not recorded, transcribed or automatically scored. Skip is available. Spelling-only rounds without distinct meanings are not forced into an unsuitable meaning quiz. An additional word is drawn only from existing filtered authored cards with context, outside the completed round, with an unambiguous target in that pool. It is additional to this round, not guaranteed unseen in the learner's history. No new mastery or reward claims.

## Wording review

Reviewed the current Learn examples, contexts and feedback for the 32 supplied words plus the core practice uses of actively, precook, support and unclear. Retained contextual distinctions: noun versus adjective resident, adjective versus adverb ly, reversative versus negating un, physical support, payment/send sense of remit, plant-moving sense of transplant, historical spect/circum bridges, opposing-thrust space terms. Existing specialized Challenge placement remains unchanged.

Corrected rewash's explanation: wash again is the meaning; a dirty shirt is the example-specific reason, not a requirement of the definition. Corrected enjoyable's suffix caution to avoid implying -able is generally added to adjectives. Retained stable retro-rocket identifiers and existing accepted hyphenated spelling; Wordsmyth's retrorocket display alternative is documented in evidence notes.

Updated quick-start.html and added a direct Learn-guide link in educator-resources.html. Cache versions updated for changed runtime/style assets.

## Validation

All 14 scripts/*test.js suites pass. Learn UI tests exercise 36 complete sorting rounds, 52 worked families, 60 supported application lessons, wrong answers, oral comparisons, disclosures, focus/navigation and filtered secondary words. Content tests cover 60 Flight/vocabulary/mode combinations; token reachability/protection and existing account/plan tests also pass. Workbook export: prior values/formulas remain unchanged outside the 64 authorized source rows and the appended checkpoint record; no formula errors found in Artifact Tool scan. Changed workbook range visually reviewed.

Browser: actual student UI at narrow sidebar width and educator UI at 1200px were tested with disposable, clearly labelled local fictional Auth fixtures. Completed reveal, worked check, next sentence, sorting, wrong meaning, oral comparison and additional-word comparison in student view; educator view checked section layout and Flight filtering. Fixtures have no live account or cloud connection and are excluded from Git. Production sign-in and cloud saving were not reverified in this change. Production Auth configuration is unchanged.

## Remaining

Broader item-by-item teacher-generated-material and assessment reconciliation is separate. Full independent source verification, utility review and legacy dictionary/WVI backlog are not declared complete. Further gameplay changes beyond Learn/sorting remain future work. These interfaces are teaching-tool design decisions, not validated assessment scales.
