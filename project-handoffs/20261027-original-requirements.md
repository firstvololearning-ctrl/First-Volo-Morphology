# First Volo Story Builder — Implement, Review, Test, and Publish Instructional Updates

I want you to continue the instructional redesign of my **First Volo Story Builder** and publish the changes to GitHub.

## 1. Repository and prepared work

**GitHub repository:**\
[https://github.com/firstvololearning-ctrl/First-Volo-Story-Builder](https://github.com/firstvololearning-ctrl/First-Volo-Story-Builder)

**Live application:**\
[https://firstvololearning-ctrl.github.io/First-Volo-Story-Builder/](https://firstvololearning-ctrl.github.io/First-Volo-Story-Builder/)

**Prepared instructional update:**\
[https://chatgpt.com/library?file_id=libfile_2ad35146b4e88191af914d0d1b979522&account_id=personal](https://chatgpt.com/library?file_id=libfile_2ad35146b4e88191af914d0d1b979522\&account_id=personal)

The previous ChatGPT session:

- Examined the full Story Builder repository, not the free sample.
- Developed a revised instructional prompting framework.
- Implemented an initial code update.
- Committed the changes locally as `169f282`.
- Verified that all seven automated test suites passed.
- Could not publish because the environment lacked the necessary GitHub write permissions.

The prepared file is a Git patch containing the changes.

The patch was developed against repository commit `093bffcd479193475dab644e187814830c9d749b`.

**First inspect the current repository and determine whether these changes have already been applied.** Do not apply the patch twice or overwrite newer work. If the repository has advanced, examine and resolve any conflicts carefully.

There are currently no active Story Builder users, so preserving historical instructional-support selections is unnecessary.

## 2. Instructional philosophy

Story Builder is an SLP-oriented narrative language intervention tool.

Preserve its existing **Whole → Part → Whole** teaching sequence:

1. First Tell — Student generates the whole narrative.
2. Work on Target — Educator provides targeted instruction.
3. Tell Again — Student retells the whole narrative, with the option to remove supports.

The tool should support meaningful oral and written language, narrative organization, grammatical formulation, and increasing independence.

It should not pretend to interpret, diagnose, or automatically correct a student's actual language response.

**The educator's professional judgment remains central.**

## 3. Revised prompting sequence

Replace the original rigid five-step hierarchy with:

### Three sequential prompts

**1. Look / Listen Here**

- Direct attention to relevant narrative or linguistic information.
- For Sentence Formulation, encourage examination of the student's spoken or written response.
- Make the wording appropriate to the specific instructional target and story element.

**2. Think About It**

- Elicit an independent attempt, formulation, connection, or revision.
- Do not simply repeat the first prompt.

**3. A Clue**

- Provide a focused semantic, narrative, or linguistic clue.
- Identify what the student should consider without supplying the complete response.

### Two educator-selectable supports

After the first three prompts, provide two separate controls:

**Sentence Help**

- Offers appropriate sentence starters, connecting phrases, or grammatical structures.
- Must preserve the student's intended meaning.
- Should not introduce imaginary story events or require unnecessary sentence complexity.

**More Help**

- Provides more explicit, target-specific instructional assistance.
- May involve breaking down a task, identifying relevant relationships, meaningful choices, or clinician-guided instruction.

The educator may:

- Select either support first.
- Use both when appropriate.
- Stop when the student succeeds.
- Return to an earlier prompt or strategy.
- Have the student retry after receiving assistance.

Do not label the final two options as fixed Levels 4 and 5. They represent different kinds of assistance, not necessarily increasing amounts of support.

Preserve **Try Again** and **Reconnect to the Story**.

## 4. Sentence Formulation: Two pathways

Sentence Formulation must have two educator-selectable pathways.

### Pathway A — Build a Sentence

**Objective:** Help the student organize an intended idea into a complete, grammatically accurate spoken or written sentence.

Prompts should address the grammatical demands of the selected story element.

| **Story element** | **Sentence formulation focus**               |
| ----------------- | -------------------------------------------- |
| Character         | Complete statement about a character         |
| Setting           | Location or time within a complete sentence  |
| Problem           | What happened or went wrong                  |
| Feeling           | Expression of an emotional or internal state |
| Plan              | Intention or goal                            |
| Action/Attempt    | Agent and action                             |
| Item              | Action or description involving an object    |
| Resolution        | Outcome or ending                            |

Do not assume every sentence follows a simple “Who + did what?” structure.

For example, Action/Attempt might use:

- **Look / Listen Here:** “Listen to what you said about the action. Is it a complete sentence?”
- **Think About It:** “Can you tell what the character did in one complete sentence?”
- **A Clue:** “Who did something? What did they do?”
- **Sentence Help:** An appropriate sentence structure or partial starter.
- **More Help:** Educator-guided grammatical support.

Ensure that the prompts provide genuinely different forms of assistance and do not simply repeat the same instruction.

### Pathway B — Expand or Combine Sentences

**Objective:** Help students express meaningful relationships between ideas using appropriate grammatical structures.

Do not equate sentence expansion with merely making a sentence longer.

Prompts must work whether the student has generated two sentences, one sentence, or an incomplete response. Avoid assuming that particular story information has already been expressed.

## 5. Educator-selected sentence relationship menu

Within **Sentence Help → Expand or Combine Sentences**, implement a dropdown allowing the educator to choose the intended relationship.

Include:

| **Relationship**                     | **Possible connecting language**          |
| ------------------------------------ | ----------------------------------------- |
| Time / Sequence                      | when, before, after, while                |
| Cause / Reason                       | because, since                            |
| Result / Consequence                 | so, as a result                           |
| Contrast / Unexpected Outcome        | but, although, even though                |
| Condition                            | if, unless                                |
| Purpose / Intention                  | to, in order to, so that                  |
| Thought / Belief                     | thought that, knew that, wondered whether |
| Description / Additional Information | who, which, that, with                    |

When a relationship is selected, show:

1. The relationship name.
2. Appropriate connecting language.
3. Two or more useful sentence structures where possible.
4. A reminder that the educator should select only language that fits the student's intended meaning.

For example:

**Cause / Reason**

Connecting language: *because, since*

Possible structures:

- “\_\_\_ because \_\_\_.”
- “Because \_\_\_, \_\_\_.”

**Result / Consequence**

Connecting language: *so, as a result*

Possible structures:

- “\_\_\_, so \_\_\_.”
- “As a result of \_\_\_, \_\_\_.”

Keep Cause/Reason and Result/Consequence distinct.

## 6. Educator grammatical-support dropdown

Within **Sentence Formulation → More Help**, provide an educator-only dropdown.

The educator identifies the student's actual grammatical difficulty and selects an appropriate level of assistance.

Include five options:

**1. Focused Cue**

Direct attention to the portion of the sentence requiring revision without identifying or supplying the correct form.

**2. Specific Grammatical Cue**

Identify the grammatical feature needing attention without necessarily supplying the answer.

**3. Choice Between Forms**

Offer two contextually appropriate alternatives, including the correct grammatical form.

**4. Partial Model**

Provide part of the grammatical structure and have the student complete it.

**5. Full Model**

Model the complete intended sentence and have the student reproduce it.

The educator should use the least assistance appropriate to the student's needs but may select any level directly.

The application should provide guidance, not automatically generate grammatical corrections.

After assistance:

- Have the student reformulate the sentence.
- Reduce assistance when feasible.
- Reconnect the sentence to the surrounding narrative.

The same framework may be used in both Sentence Formulation pathways.

## 7. Other instructional targets

Preserve the existing targets:

- Story Organization
- Connections & Cohesion
- Cause & Effect
- Elaboration
- Perspective & Internal State

Review how the revised first-three-prompts-plus-two-options framework works with each.

Do not automatically assume the Sentence Formulation supports will be appropriate for all targets.

In particular:

- Story Organization supports must address story functions and relationships.
- Cohesion supports must distinguish temporal, causal, and referential connections.
- Cause & Effect supports must distinguish causes, intentions, actions, and consequences.
- Elaboration must add meaningful, relevant information—not unnecessary length.
- Perspective supports must avoid assuming thoughts, beliefs, knowledge, or changes of understanding that are not supported by the story.

If existing More Help or Sentence Help prompts do not fulfill their intended purpose, identify them for revision. Do not silently introduce unreviewed instructional content.

## 8. User interface

Keep the design consistent with the current First Volo visual style.

The interface should make clear which content is:

- Student-facing
- Educator-facing
- An optional support
- A sentence structure or example rather than a required response

Ensure that dropdowns and controls:

- Are clearly labeled.
- Work with keyboard navigation.
- Are usable on smaller screens.
- Do not produce overlapping or cut-off content.
- Can be changed without losing the student's story.
- Appear only when relevant to the selected instructional target and pathway.

## 9. Saving and restoration

Verify that the application correctly preserves appropriate instructional settings, including:

- Selected instructional target
- Sentence Formulation pathway
- Selected relationship
- Sentence Help / More Help selections
- Educator grammatical-support level
- Teaching-cycle phase

There are no current active users, so a legacy-data migration is not necessary.

Do not interfere with existing story-writing or story-saving functionality.

## 10. Testing and quality assurance

Before publishing:

1. Review the patch and compare it with the latest repository.
2. Inspect the implementation for incomplete or inconsistent changes.
3. Run all existing automated tests.
4. Verify the new instructional controls.
5. Test both Sentence Formulation pathways.
6. Test every relationship-menu option.
7. Test each grammatical-support dropdown level.
8. Test switching between Sentence Help and More Help.
9. Confirm the student can retry and reconnect to the narrative.
10. Check the visual layout at desktop and mobile widths.
11. Verify that First Tell and Tell Again still work correctly.
12. Confirm that saving, reopening, and restoring a story work.
13. Check for JavaScript errors.
14. Verify that student and educator views expose only the intended guidance.

Add or update automated tests where appropriate.

Pay special attention to whether the actual prompt wording is instructionally coherent—not merely whether the buttons work.

## 11. GitHub publication

Once the implementation has been reviewed and tested:

- Publish the changes to the full `First-Volo-Story-Builder` repository.
- Use the authenticated GitHub environment.
- Do not modify the free-sample repository.
- Do not force-push or overwrite unrelated changes.
- Verify that GitHub Pages successfully deploys the intended commit.
- Open the live application and verify the updated functionality, including authenticated educator controls where access is available.

If a permission or authentication blocker remains, stop and explain exactly what is needed.

## 12. Final report

After completing the work, tell me:

1. What was changed.
2. Which instructional prompts or features were refined beyond the prepared patch.
3. What was tested and the results.
4. Whether the changes were successfully published.
5. Whether GitHub Pages deployed.
6. Which features still need instructional or visual review.

Provide the GitHub commit link and live Story Builder link if publication succeeds.

**Important: The goal is a clinically meaningful instructional support system—not simply adding more prompts. Preserve the student's intended meaning, support educator judgment, and maintain the Whole → Part → Whole narrative teaching approach.**













































# First Volo Morphology — QA Handoff

**Date:** October 27, 2026

## Objective

Complete the remaining authenticated browser testing for First Volo Morphology. Do not repeat the comprehensive instructional or repository audits that have already been completed.

**Repository:** [https://github.com/firstvololearning-ctrl/First-Volo-Morphology](https://github.com/firstvololearning-ctrl/First-Volo-Morphology)

**Live website:** [https://firstvololearning-ctrl.github.io/First-Volo-Morphology/](https://firstvololearning-ctrl.github.io/First-Volo-Morphology/)

## 1. Work already completed

The October 27 review confirmed:

- **Use It and Change It are implemented.**
- All nine scored activities were tested in the August 18 browser audit.
- The previously identified 13 Check Transfer target × grade-band gaps were addressed in an August 21 commit.
- Program Progress is implemented.
- Digital and printable Pre/Post assessments exist for Flights A, B, and C.
- Subsequent commits improved cloud synchronization and educator-specific progress handling.
- The October 26 commit corrected pending Flight assignments identified during an audit.

Do not rebuild these features or repeat the original audit unless new evidence indicates a problem.

## 2. Current blocker

Authenticated testing could not be completed in the previous session because Morphology requires educator sign-in.

A secure browser handoff was offered so Alexis could sign in herself.

At the beginning of the next session:

1. Check whether Alexis is signed in to My First Volo.
2. Confirm that Morphology recognizes the educator account.
3. Use an existing authenticated session when available.
4. Do not request passwords or verification codes in chat.

## 3. Priority A — Cross-browser cloud restoration

Use a fictional learner named `MORPHOLOGY QA`.

### Chrome

1. Sign in as educator.
2. Create or select the fictional test learner.
3. Open the Meaning activity.
4. Complete three items, including correct and incorrect responses.
5. Verify that the responses save.
6. Open Program Progress and document the saved results.

### Safari

1. Sign in using the same educator account.
2. Confirm the fictional learner appears.
3. Verify that the saved Meaning session and progress restore without manually recreating them.

**Pass criterion:** Learner information and saved progress agree across browsers.

Do not use real student data for this test.

## 4. Priority B — Bidirectional saving and synchronization

1. In Safari, complete additional activity items.
2. Confirm the new results save.
3. Return to Chrome and reload.
4. Verify the new progress appears.
5. Confirm that opening the application does not overwrite existing progress.
6. Check that results remain associated with the correct learner.

Record any discrepancy with the activity name, browser, action performed, expected result, and observed result.

## 5. Priority C — Goals and Volo Tokens

1. Record baseline Goals and Volo Tokens for the fictional learner.
2. Complete an activity eligible for progress or rewards.
3. Verify the change follows the application's actual rules.
4. Reload the page.
5. Confirm the updated values persist.
6. Check the second browser.
7. Ensure rewards are not duplicated merely by reopening the activity.

Review the reward rules before determining the expected numerical change.

## 6. Priority D — Progress monitoring

Test the complete instructional assessment workflow:

1. Administer a fictional Flight A Pre/Form A.
2. Confirm responses and scores save correctly.
3. Administer Post/Form B.
4. Check that the correct forms and learner are compared.
5. Test printing.
6. Test entering paper assessment results.
7. Verify persistence after reload and sign-in.
8. Repeat representative checks for Flights B and C.

Confirm that results remain instructional progress-monitoring data and are not presented as standardized diagnostic scores.

## 7. Priority E — Navigation

Verify:

- About This Site opens correctly.
- About → Research navigation works.
- Educator Resources opens.
- Program Progress opens.
- Returning to the main activity does not unexpectedly lose the selected learner or saved work.

## 8. Priority F — Responsive layout

Check approximately:

- Phone: 375 px width
- Tablet: 768 px width
- Desktop: 1280 px width

Inspect:

- Activity cards
- Word-part displays
- Answer choices
- Dropdowns
- Modals
- Progress information
- Printable controls
- Header/navigation

Record clipped text, overlapping elements, unintended horizontal scrolling, or controls that are difficult to use.

## 9. Automated regression tests

Run the repository's current test and audit scripts.

Specifically:

- Rerun Check Transfer grade-band coverage.
- Confirm the previously resolved 13 gaps have not returned.
- Run relevant instructional protection and progress tests.
- Investigate failures without reworking passing features.

## 10. Testing documentation

Keep a concise checklist with:

| **Area**                      | **Status**                                  | **Evidence**     | **Action required** |
| ----------------------------- | ------------------------------------------- | ---------------- | ------------------- |
| Cross-browser restoration     | Not yet verified                            | —                | Test                |
| Bidirectional synchronization | Not yet verified                            | —                | Test                |
| Goals/Volo Tokens             | Not yet verified                            | —                | Test                |
| Pre/Post assessment workflow  | Not yet verified end-to-end                 | —                | Test                |
| About → Research              | Not yet verified                            | —                | Test                |
| Responsive layout             | Not yet verified                            | —                | Test                |
| Check Transfer regression     | Completion committed; current rerun pending | August 21 commit | Rerun               |

Use **Pass, Fail, Blocked, or Not Tested**. Do not mark a test passed merely because the code exists.

## 11. Change policy

Begin with read-only verification and testing.

If a bug is discovered:

1. Document the exact reproduction steps.
2. Identify the cause.
3. Explain the proposed fix.
4. Implement a narrowly scoped correction when authorized.
5. Run regression tests.
6. Verify the behavior in the browser.
7. Publish only tested changes.

Preserve unrelated work and avoid destructive repository operations.

## 12. Final deliverable

Provide:

- A QA pass/fail summary
- Confirmed remaining defects
- Screenshots of relevant visual failures, if any
- Recommended fixes ranked by priority
- Items that require educator judgment or further testing
- A clear statement of whether Morphology is ready for pilot use

**Important:** This is a focused QA closeout, not a request for another comprehensive Morphology audit or a redesign of the instructional program.