# Learn sort audio — 2026-09-27

Local draft only; not committed or deployed.

Added on-demand listening for instructions, word-part meanings, whole words with their example sentences, and current feedback to the shared Learn sort renderer. Separate listen buttons do not select or submit answers. Stop audio is available; unsupported browsers disable playback controls. Uses existing instructional audio and controlled morpheme pronunciations, with existing speech fallback. No autoplay or lexical changes.

Validation: 22-round Learn UI regression passed. New morphology-learn-audio-test.js passed playback routing, controlled descriptors, listening without selecting, feedback, placed-card control hiding, stop, unsupported state, and no nested buttons. Script syntax and targeted whitespace checks passed. Refreshed localhost preview, activated geology listening and stop via keyboard; answer remained unselected. Browser reported no warning/error logs. Actual audible voice quality has not been independently assessed.

Preview: http://localhost:8765/meaning-sort/
Evidence: outputs/learn-audit/Meaning-Sort-Audio-Preview.png in the parent workspace.
