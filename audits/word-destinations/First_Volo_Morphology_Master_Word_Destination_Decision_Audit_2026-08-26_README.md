# First Volo Morphology — Master Word Destination / Decision Audit

Generated: 2026-08-26T19:16:22.841Z

## Decision path

**Word → instructional target (when applicable) + word morphemes → protection → actual runtime pool → stage → delivery/destination**

## What this audit distinguishes

- **ACTUAL_FIXED** — formal assessment, Migration Challenge, or Check Transfer placement.
- **AUTHORED_ELIGIBLE** — an ordinary digital word is authored and may render when filters match.
- **AUTHORED_FILTERED_PROTECTED** — the word still exists in digital source data but is blocked at runtime by the central protection rule.
- **GENERATED_ELIGIBLE** — the word is generated from canonical inventory/runtime logic.
- **ELIGIBLE_DYNAMIC** — teacher-led content may select the word dynamically.
- **HISTORY_DEPENDENT** — Retrieve may reuse the word only because it was previously encountered and saved.
- **NOT_APPLICABLE** — the target/activity is intentionally skipped.
- **BLOCKED_PROTECTED** — the word must not enter ordinary practice.

## Important structural rules

1. A word is **not forced into one bucket**, and its complete morpheme decomposition is **not** treated as a required target/activity cell.
2. Formal Pre/Post, Migration Challenge, and Check Transfer are separate protected pools.
3. **Figure It Out is included explicitly** as internal activity id `infer`.
4. Digital **Meaning** and **Word Part** are target-level activities and therefore do not have a fixed whole-word pool.
5. Teacher-led **Retrieve** is history-dependent, not a fixed word bank.
6. Teacher-led Part A, Part B, and Optional Practice are dynamic selections from the ordinary unprotected item bank.
7. Print family resources are audited from the shared family configuration.
8. Student Digital Change It and Teacher-Led Change It are separate systems and can legitimately have different coverage.
9. Student Digital pool health is evaluated against the runtime selection unit: Learn target examples; Find/Figure It Out study × Flight × vocabulary; Build pattern × Flight × vocabulary; Use It active Build pattern; Word Hunt/Change It whole question.

## Summary

- Canonical targets: 96
- Master inventory entries: 364
- Unique words audited: 627
- Destination rows: 18703
- Formal protected words: 50
- Migration protected words: 30
- Check Transfer protected words: 190
- Hard failures: 0
- Review flags: 0
- Informational flags: 230
- Student Digital runtime pools: 258
- Runtime pools empty after protection: 0
- Runtime pools intentionally unavailable: 2
- Learn example subpools empty after protection: 11
- Runtime pools with one viable word after protection: 36

## Output files

- `First_Volo_Morphology_Master_Word_Destination_Decision_Audit_2026-08-26.json`
- `First_Volo_Morphology_Master_Word_Destination_Decision_Audit_2026-08-26_Destination_Matrix.csv`
- `First_Volo_Morphology_Master_Word_Destination_Decision_Audit_2026-08-26_Word_Master.csv`
- `First_Volo_Morphology_Master_Word_Destination_Decision_Audit_2026-08-26_Target_Exceptions.csv`
- `First_Volo_Morphology_Master_Word_Destination_Decision_Audit_2026-08-26_Findings.csv`
- `First_Volo_Morphology_Master_Word_Destination_Decision_Audit_2026-08-26_Runtime_Pool_Health.csv`
- `First_Volo_Morphology_Master_Word_Destination_Decision_Audit_2026-08-26_Protected_Source_Cleanup.csv`
