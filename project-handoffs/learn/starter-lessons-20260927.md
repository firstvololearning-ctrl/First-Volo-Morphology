# Three starter Learn lessons

Local review only. Nothing deployed or pushed by this step.

## Implemented

- Unpack, unroll and friendly each have a worked model, guided meaning question, and a new-sentence question.
- Wrong choices provide explanations without advancing. Correct choices reveal the next step. Completion appears only after the new-sentence question is answered correctly.
- Unpack leads to unroll within the reversative un- card; friendly remains under adjective -ly.
- Secondary lessons obey the same vocabulary/protection checks as primary lessons. A newly protected unroll disappears from navigation.
- Keyboard focus moves into the new sentence and next example; initial scrolling is immediate to avoid moving controls during pointer selection.
- Model sentences and questions are original; source-faithful Wordsmyth sense notes are in the existing master workbook. No WVI is assigned to unpack/unroll. Friendly WVI 1 is user-reported. Neither missing scores nor dictionary display levels were converted into grade claims.

## Verification

- 60 flight/vocabulary/mode combinations passed existing content checks.
- 12 full root/suffix sorting rounds and 12 original worked examples passed UI regression checks.
- All three two-step starter flows passed wrong-answer, correct-answer, completion and navigation checks. Tests use the actual renderer.
- Existing registry audit: 271 protected lexemes; 2,883 teacher recipes; zero hard failures or prompt-language collisions.
- Static CSP review: 69 ecosystem HTML pages, zero failures. Added interactions use external event listeners.
- Local browser preview: desktop pointer retries/advancement, phone-width pointer retry, keyboard new-sentence completion and next-example navigation verified. At 390px viewport, document scroll width was 390px; answer buttons were approximately 51px high. Browser error log empty.

## Review limits and next work

Local preview isolates the actual lesson renderer and data from production services; it is not an authenticated product session. Preview audio uses browser speech synthesis; production audio quality/playback and saved progress are not established by these checks. No database writes occur. Progress in these lesson checks resets when the card is reopened.

The broader draft and its supplemental example list still contain candidates whose research is incomplete. Completing these three lesson flows does not approve the other candidates, grade placements, or whole Learn curriculum. Teacher review and remaining lexical-list checks precede release.

Preview build helper: `work/build-learn-preview.cjs` in the parent task workspace. It copies only selected assets into a local-only preview directory. The local preview is served at http://127.0.0.1:8765 while its server is running.
