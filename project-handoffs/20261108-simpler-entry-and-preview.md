# Simpler entry and educator game previews

Follow-up to the basketball release, based on user screenshots:
- Learner picker lives once inside Practice with a learner. Learners & progress remains a separate direct link to records/management. Planning/resources and assessments remain available as disclosures.
- First row offers just prefixes, roots, suffixes. Combined sets are in Combine word parts. Flight/Stretch stay in Adjust practice.
- Open Learn / Open [current activity] is the main next action. The ten alternate activities remain in Choose another activity. Empty workspace is hidden until a word-part set is chosen. Existing saved choices and approved practice plans still work.
- Open games is an actual filled button with hover/active/focus feedback, replacing an unstyled label and explanatory strip.
- Educator and educator-selected modes can Preview game / Preview hoops even for locked sets. Learner unlock calculation and all progress writers remain unchanged. Student mode retains reward locks.

Validation: existing 15 test suites passed during implementation. Browser used fictional local educator/student contexts without cloud clients. Checked moving learner picker, combined set selection, Build Words launch, educator preview for Advanced content, and student-only reward locks. Auth/production account operations were not changed. Local qa-* files excluded from release.

Final user steering: educator home first offers Set up learning (existing plan editor), Practice with a learner (session choices), and Learners & progress (records). Generic educator practice panels remain hidden until entering the practice path; Back to start returns to entry. Student and educator-selected plan routes retain existing behavior. Explicit next-step text names the selected local learner and chosen activity/focus/Flight without implying mastery. Browser confirmed initial practice hidden, practice route opens, next-action text updates, and Back to start hides choices. Existing plan tests continue to pass.
