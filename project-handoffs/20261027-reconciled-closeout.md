# First Volo — reconciled October 27 closeout and handoff

This supersedes the earlier incremental October 27 summaries.

## Outcome

Content, interface and documentation updates are published. Full Morphology authenticated pilot QA is not signed off. Live earning and basic two-way synchronization now passed. Remaining acceptance work is listed below.

## Completed today

### Story Builder instructional system

Reviewed/applied the prepared full-repository update; three prompts plus independently selectable Sentence Help and More Help; both Sentence Formulation pathways, eight relationship choices and five grammatical-support options. Preserved retry, reconnection, student meaning and Whole → Part → Whole.

### Story Builder clinical wording and Thinking

Applied 35 approved prompt sequences without requiring a successful ending, a lesson learned or unsupported character knowledge. Added optional Explore Thinking, saved with planner work and inserted into writing only by an explicit action. Educator approved initial use; detailed SLP review remains later.

### Story Builder interface and materials

Separated Teach with a learner, Set up a student’s view and student sign-in. Picture controls sit under Story elements & picture ideas, with own/pictures/both separate from labels. Next-step action is after the work area. Student goal precedes one closed Educator guidance dropdown. Updated guide, resources, target builder and three static planner PDFs.

### Story Builder saving and verification

47 tests pass. Fictional teaching draft reopened with writing and own-ideas setting intact. Synthetic student-support form tests cover all three modes and label behavior. Supabase picture_idea_mode and protected v2 RPCs applied; older settings default to both. Database RLS/grants/default/unsigned-rejection checks passed. Full authenticated fictional student save/reopen is still unverified.

### Morphology storage and navigation correction

Fixed educator progress-store alignment, empty assessment learner selectors and About → Research link. An explicit fictional-learner cloud backup succeeded. This did not add cross-device synchronization for browser-local assessment records.

### Morphology practice and rewards availability

Added 33 contextual Figure It Out items across 27 targets, including six new lexical entries: enclose, bendable, celebration, inset, claimant and absentee. Repaired semantic-ID scoring routes; kept protected assessment words excluded. Automated checks cover 95 active word parts and 32 reward-set/Flight combinations. Actual Flight C Prefixes token earned through scored practice; saved, reopened and restored across Chrome and Safari. Readiness remains 1/16 after an additional session: no duplicate award observed in this tested path.

### Morphology inventories and language accessibility

Reconciled the master lexical and Learn/Activity workbooks plus exact 33-item CSV. Corrected absentee usage and preserved required base/word-family context. Reviewed 120 authored Learn examples/checks; simplified 32 entries across 20 words, including valid → a reason that makes sense. 67 script tests plus 5 Flight tests pass. Exact wording audit is in Git; no new words or assessment items were added by that wording pass.

### Live Morphology QA

Fictional MORPHOLOGY QA learner only. Earned a token through actual scored activities; Chrome-to-Safari learner/progress/reward restoration passed. Completed a separate Safari Meaning session at 2/3, backed up, and verified that exact session in Chrome. Chrome shows 9 completed sessions plus 2 legitimate interrupted sessions; 1/16 learning sets ready, with no duplicate reward observed.

### Assessment and report checks

Flight A full digital Pre Form A: 13/14 objective; educator reasoning 4/4. Post Form B paper entry: 14/14 and 4/4, correct +7 percentage-point comparison. Both reopen. Representative Flight B paper report 13/14 and 3/4, Flight C paper report 14/14 and 4/4 reopen. All results are fictional instructional QA. Inspected all four pages of exported Flight A Post report: readable, no clipping or split reasoning, anonymous code rather than learner label.

### Website and account navigation

Published distinct First Volo website and My First Volo / Sign in links on 5 Story Builder, 17 Morphology and 29 Primo pages. Primo explicitly approved and pushed as 0fe5210. Story 9b32afe; Morphology 0a13ae3. Tests: Story 47 pass; Morphology 72 pass; Primo 14 pass, 2 live-only skipped.

### Responsive correction

Found and fixed About panel overflow at phone/tablet widths; local checks at 375, 768 and 1280px now have equal viewport/scroll widths. Published Morphology cecec3a. Assessment setup and Learn page checks at those widths also had no page overflow. Remaining responsive surfaces still need coverage.

## Original checklist reconciliation

### Story Builder original implementation and publication — Pass

Evidence: 47 automated tests; published code a14db27; prior sentence pathways, relationships/supports and state restoration covered by tests. Authenticated educator and local browser checks completed.

Next: Retain later detailed clinical review; do not infer full student/cloud acceptance from educator tests.

### Story Builder actual student path and new picture settings — Not Tested

Evidence: Synthetic form/setting tests and database access checks passed; educator account has no active shared students.

Next: Use an authorized fictional student sign-in; save options, reopen and verify own/pictures/both, labels, goal and available help. No real learner needed.

### Morphology Priority A: Chrome → Safari restoration — Pass — basic restoration

Evidence: Same-account fictional learner, prior activity evidence and one earned set restored from Chrome into Safari without recreating the learner.

Next: Expand acceptance to conflicts, offline/reconnection and account switching before deployment.

### Morphology Priority B: bidirectional saving — Pass — basic round trip

Evidence: Safari Meaning 3/3 answered, 2/3 correct; explicit backup current. Chrome restored that exact score and retained prior interrupted evidence.

Next: Test simultaneous edits, stale-browser startup, deletion and account isolation separately.

### Morphology Priority C: Goals and Volo Tokens — Pass — tested award path

Evidence: Actual Flight C Prefixes token earned through practice; retained on reopen and both browsers. A further completed session left readiness at 1/16.

Next: Broaden to other set/Flight paths; do not claim every reward was live-earned.

### Morphology Priority D: full Pre/Post workflow — Partial

Evidence: Flight A digital Pre, paper Post, educator reasoning scoring, correct comparison and reopen passed; representative B/C paper reports passed.

Next: Remaining: full digital Post, sign-out/re-entry persistence expectations and any untested form paths.

### Morphology printing within Priority D — Partial

Evidence: Four-page exported Flight A Post report inspected: readable and unclipped; anonymous code, correct comparison.

Next: Student forms, page breaks across other forms and answer-key separation still need print-output checks.

### Morphology Priority E: navigation — Partial

Evidence: About/Research, resources, Program Progress and assessment paths exercised. Website/account links added across three products.

Next: Finish systematic return-path/retained-learner checks and representative nested Primo page verification.

### Morphology Priority F: responsive layout — Partial

Evidence: Assessment setup and main Learn checked at 375/768/1280. About overflow fixed and locally verified at all three sizes.

Next: Complete progress, interactive choices/modals, keyboard and other relevant surfaces; verify published fix.

### Morphology regression/protection/Check Transfer — Pass

Evidence: 72 current automated checks; most recent recorded transfer audit covers 190 applicable pairs with no gaps; protection audit had zero hard failures. New wording pass changed no assessment bank or word IDs.

Next: Rerun relevant checks after subsequent fixes; automated coverage is not proof of all live QA.

### Clinical/source review queues — Not Tested

Evidence: Story wording approved for initial use. Dictionary spot checks and inventory source conditions recorded; not every new item has a completed external source review.

Next: Educator fine review of Story prompts; finish outstanding Morphology lexical/source and accessibility checks. The Learn wording pass does not cover every activity or protected assessment.

## Next work, in order

1. Finish student-form printing and answer-key separation; the inspected educator report alone does not close printing.
2. Finish remaining Morphology responsive/navigation and assessment paths; basic earning and two-way sync now passed.
3. Run authorized fictional Story Builder student save/reopen for picture/label/goal/help choices.
4. Complete outstanding clinical/source review, including the older segmentation queue.
5. Reconcile the original September readiness checklist; no meeting is assumed.

## Older four-project checklist

### Primo layouts/assets

Still open from October 26; not worked on today.

Review chat-mat styling and Christmas download placement; select final food/conversation/meal images, clothing materials and worksheet/ZIP/script assets before archiving alternates.

### Primo source/dependency

Still open; not reverified today.

Reconcile accepted local differences against current main; pin and test one exact Supabase SDK version in a separate maintenance change.

### Morphology older local divergence

Still open; today’s scoped storage fix does not reconcile the old folders.

Compare older local account/cloud code with the shared account system; review changed artwork, Waypoint wording and unique local history individually.

### Morphology Break It Apart segmentation

Still open; distinct from reward availability repair.

Review the 49 candidate segmentation findings instructionally and author defensible analyses or explicit not-applicable decisions. They are not 49 proven broken activities; do not weaken validation to clear the report.

### Sentence Builder release acceptance

Source backup completed October 26; launch checks still open.

Private source backed up as f9beee3. Complete positive hosted fictional save/reload, cross-educator/group workflows, recovery/deletion replay, missing database fixtures and hosted frontend acceptance before public launch.

### All projects: reproducible tests and hosting

Still open from the older audit; not reverified today.

Package test dependencies/fixtures and CI; inspect delivery-layer framing headers. Add direct Story learner-library conflict/deletion/permission/account-switch behavior coverage where absent. Today’s passing suites do not close that audit finding.

### Folder/source ownership cleanup

Backups done; reconciliation/retirement still open.

Keep older folders and deletion-heavy Morpho worktrees intact until unique work is accounted for. October 26 backups and private Sentence source backup are completed historical items, not new work today.

## Save and publication status

Source/content, workbooks, wording audit, SQL record and handoff are preserved in Git. Navigation source pushed: Story 9b32afe, Morphology 0a13ae3, Primo 0fe5210. Morphology responsive fix pushed cecec3a. New picture setting and protected v2 APIs are in Supabase. Fictional Morphology learner/progress/reward backup and basic two-way restoration verified. Browser-local assessment records are separate; do not imply those are cloud-synced. Unexported drafts are not guaranteed backups. Generated curriculum-map CSVs remain reproducible untracked reports, not missing source.

## Constraints and blockers

No live learners: use fictional QA only. Basic round-trip success is not conflict/deletion/offline/account-switch acceptance. Authenticated Story student settings acceptance is pending. Do not use arbitrary existing learner records or request passwords in chat. Earlier rejected arbitrary-record test was not run. Full pilot readiness remains unsigned.

## Sources reconciled

- October 27 uploaded Pasted markdown(20261027-193500).md — original Story implementation checklist and Morphology priorities A–F.
- October 26 remaining-work.html and official-release-summary.html, latest saved revision 21:27, from Audit four project repositories — broader carry-forward queue. These older open items were reconciled, not newly re-audited today.
- Current October 27 repository handoffs, test logs, publishing checks and exact Morphology accessibility audit.


# First Volo — original September checklist status, October 27

This compares the original September 7 checklist, September 9 R6 update, September 23 reconciliation, and September 26–28 preparation checklist with October 26–27 evidence. It is an evidence reconciliation, not a new live infrastructure, legal or security audit. No district meeting is assumed. “Open” means no later completion evidence was established here, not proof that nothing was done elsewhere.

## Deletion and failure alerts — Completed within recorded tests

Evidence: September 7 ordinary deletion/access revocation, recovery window and failure-alert receipt recorded.

Remaining: Keep completed. Broader provider copies, contract-specific handling and current operational health were not rechecked today.

## Parent records and retention tools — Built; operational release still partial

Evidence: Encrypted delivery/operator tools, notice transport and later receipt confirmation recorded.

Remaining: Actual authority verification/fulfillment, mailbox cleanup, remaining retention periods and controlled automatic product-deletion release are not established as complete.

## Independent deletion-history archives — Recorded staging completion

Evidence: September 15 independent cloud archive and hourly schedules; September 21/26 verification receipts.

Remaining: This supersedes the early September “no unattended upload verified” item for that staging scope. Full production recovery and alert/key operations remain separate.

## Full database backup and off-device copy — File verification completed September 26

Evidence: Encrypted full logical backup plus private Google Cloud copy downloaded, decrypted, hash checked and decoded; spare-key availability owner confirmed.

Remaining: Do not redo this achievement. A successful complete restore using the spare key and later-deletion reconciliation still needs evidence.

## Safe staging and reproducible setup — Open in latest September evidence

Evidence: Separate staging exists; diagnosis completed. September 28 still records MIGRATIONS_FAILED and six placeholder services.

Remaining: Clean install/upgrade/rollback and actual isolated services; no later completion evidence found in today’s comparison.

## Collection permission everywhere — Open in latest September evidence

Evidence: Selected ownership/withdrawal paths tested; specific direct-table/educator gaps identified September 28.

Remaining: Prove withdrawal stops ordinary reads/writes, educator-on-behalf collection and delayed/offline saves. Today’s Story setting RPCs do not close the system-wide gap.

## Complete authenticated product journey — Partial; improved today

Evidence: Morphology actual earning, saving/reopening and basic Chrome↔Safari progress/reward sync now passed. Story educator draft and mocked student settings passed.

Remaining: Story actual authorized fictional-student path; Primo full path; account isolation, withdrawal, export/delete, offline/conflict/recovery and production acceptance across included products.

## Sentence Structure staging acceptance — Recorded selected completion; later release work open

Evidence: September 22–23 Google/second educator, individual/group save, cue separation, withdrawal and isolation tests passed on staging.

Remaining: Keep those checked off. October 26 still carries hosted candidate/recovery/deletion and database fixture acceptance; do not call the whole product newly untested.

## Browser security release — Completed for dated release

Evidence: September 26 four repositories, successful deployments and 74 matching files; September 28 source checks recorded.

Remaining: Current/new surfaces, response-layer framing protections and linked resources still need their stated checks. Today’s navigation changes are not a fresh security audit.

## Repository release safeguards — Open / not reverified today

Evidence: September 28 identified main-branch protections, Story scanning/push protection, dependency and linked-page work.

Remaining: Verify/configure required checks and repository safeguards; resolve linked-page decisions and exact dependency versions. Do not assume resolved from a successful push.

## Morphology Learn expansion and protected words — Substantial implementation; final review partial

Evidence: Current product includes Learn expansion; current 72 automated checks and protection/coverage evidence. 120 authored examples reviewed, 32 wording revisions; 33 practice contexts added and inventories updated.

Remaining: Match all original per-flight sorting/card promises against current release; finish external/clinical source queue and older 49 candidate segmentation decisions. 95 active word parts differs from September’s 96-card baseline; reconcile retired/pending scope rather than assume equivalence.

## Morphology full UI/print acceptance — Partial

Evidence: Actual token path and basic two-way sync passed. Flight A digital Pre/paper Post and B/C representative paper results reopen; inspected four-page educator report.

Remaining: Student forms/answer-key separation, remaining digital form paths, navigation and interactive responsive/keyboard/audio coverage. One tested reward path does not prove all sets.

## Accessibility, devices and support — Partial

Evidence: Simpler Learn wording, Story UI/material updates and selected phone/tablet checks completed; About overflow fixed.

Remaining: Full keyboard/assistive-technology, vision/hearing/mobility/cognitive checks; managed Chromebook/network testing; consistent training and support commitments.

## Consent, notices, providers and retention decisions — Prepared / not established complete

Evidence: September program/draft notices, provider questions and selected gates exist. No new legal/operational approval evidence reviewed today.

Remaining: Resolve actual learner-use authority, consent method, exact inventory/provider assurances, final notices, retention/copy handling and practical requests. Historical disabled controls must be rechecked before describing current state.

## Institutional identity, roles, interoperability and agreements — Open in recorded checklist

Evidence: Selected Google authentication tested on Sentence staging. This is not district provisioning, role hierarchy or roster integration.

Remaining: Original institutional track remains conditional on intended scope: accepted SSO/roster route, admin/staff/student permissions, agreements and purchasing when applicable. No meeting is scheduled or assumed.

## Operations, incidents and paid-file protection — Open / partial evidence

Evidence: Written program, some administrator recovery/MFA confirmations and backup foundations recorded.

Remaining: Current device/admin evidence, provider/security findings, incident/privacy-request exercise, service/secret recovery, and decision on public static paid assets. A browser sign-in gate does not make public files private.

## Source checkpoints

- September 7 Complete Progress and Checklists R3; September 9 Progress and Readiness R6.
- September 23 Earlier Checklist Reconciliation and Progress/Remaining Work.
- September 26 Preparation Checklist; September 28 First Volo Next Steps (six security and six Morpho workstreams).
- October 26 four-repository remaining work; current October 27 handoff and live QA evidence.

These source files remain preserved in their original local folders. Completed dated tests stay complete for their stated version and scope.
