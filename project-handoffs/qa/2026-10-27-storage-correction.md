# Focused storage correction — October 27, 2026

Trigger: Program Progress saved MORPHOLOGY QA and three Meaning responses, but explicit cloud backup reported no saved learners. The Flight A/B/C assessment learner lists were also empty.

Generic educator cloud reads now use the shared access runtime's authorized localProgressKey. Restored state writes back to the same captured key, with account-generation guards against delayed results after an educator switch. Student and educator-selected paths keep their explicit scoped keys. Startup remains read-only; explicit backup/actual edits use the existing cloud API. No database, policy, permission, or dependency changes.

All three Flight assessment pages use the authorized educator's practice store, so the correct learner can be selected. New browser-local assessment records are scoped by educator. Existing unscoped records remain untouched; they are not automatically assigned to an account because their ownership cannot be established. These assessment records remain browser-local; this correction does not add cross-device assessment synchronization. Older fictional QA assessments are preserved at their old keys.

Explicit backup distinguishes saved, already-current, empty, and incomplete outcomes. About This Site now links to the existing Research, Standards & Sources page.

## Validation before publication

- 65 script regression tests passed, including actual cloud-module boot/backup/restore mocks using the same scoped storage key as the access runtime.
- Tests verify backup of a newly created learner, cloud-only restoration, isolation from legacy/other educator data, all three assessment selectors and records, blocked saves after educator switch, and rejected late cloud restore after switch.
- 5 target/Flight regression tests passed; Check Transfer 190 applicable pairs ready with zero gaps; instructional protection has zero hard failures.
- Local browser fixtures for Flights A/B/C select MORPHOLOGY QA correctly. Fixtures are outside the repository and have no cloud access.

After publication, verify the actual authenticated educator backup and learner selection. Chrome/Safari restoration, bidirectional progress, token-award duplication, and printed output still need live follow-through where browser access is available. Do not treat unit tests as evidence those browser workflows passed.
