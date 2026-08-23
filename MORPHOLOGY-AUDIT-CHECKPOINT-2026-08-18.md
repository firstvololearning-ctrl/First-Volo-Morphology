# First Volo Morphology — Audit Checkpoint
Date: 2026-08-18

Branch:
cloud-saving-foundation-20260817

## Completed and verified

- Current `main` merged into the cloud/audit branch.
- Learner terminology cleanup completed.
- Program Progress direct/application evidence classification corrected.
- All 9 scored activities verified in the browser:
  - Find
  - Word Hunt
  - Meaning
  - Word Part
  - Break It Apart
  - Figure It Out
  - Build Words
  - Use It
  - Change It
- Correct and incorrect responses save.
- Partial sessions save and survive reload.
- Build records first-check independence correctly.
- Learn remains separate from scored evidence.
- Program Progress displays:
  - Direct evidence for Find, Word Hunt, Meaning, Word Part.
  - Application evidence for Break It Apart, Figure It Out, Build Words, Use It, Change It.
- Signed-out local-only persistence verified.
- Learner rename verified.
- Clear Progress verified and remains cleared after reload.
- Delete Learner verified and deleted learner does not return after reload.
- Signing into First Volo Cloud did not overwrite existing local learner/progress data.

## Cloud test still in progress

Cross-browser cloud restore has NOT yet been fully verified.

Test learner:
CLOUD AUDIT

Expected final test:
1. Request one fresh magic link from Chrome.
2. Open that fresh link in Chrome, not Safari.
3. Confirm Chrome becomes signed in.
4. Confirm CLOUD AUDIT and its saved Meaning session restore into Chrome.

Current obstacle:
Repeated magic-link requests triggered a temporary resend/rate-limit condition, and previously used links return to localhost without creating a Chrome session.

Do not count cross-browser/cloud restore as passed until the fresh-link Chrome test succeeds.

## Additional audit note

The current sign-in UI gives a generic:
"The sign-in email could not be sent."

Consider improving this later so rate-limit/resend failures give a clearer user-facing message.

## Remaining audit items after cloud restore

- Verify signed-in cloud behavior after true cross-browser restore.
- Verify Goals and Volo Tokens through relevant save/sync paths.
- Verify About → Research navigation in browser.
- Final phone/tablet layout regression.
- Final overall Morphology audit closeout before beginning shared learner access/Home Access architecture.
