# Phase 2 Substance Plan

Status: accepted by user instruction to continue and fully implement

Baseline: v0.1.0, commit c567efd.

## Ranked Substance Items

The order is by impact on the 10 real-data fixtures, not implementation novelty.

| Rank | Catalog item | Implementation target | Fixtures improved |
|---|---:|---|---|
| 1 | 6 | Auto-detect PDF condition and document shape on upload. | 2-10 |
| 2 | 8 | Show a useful first guess immediately after open. | 2-9 |
| 3 | 32 | Replace raw parser/library errors with actionable PDF-domain errors. | 5, 10 |
| 4 | 7 | Infer form field labels, field type, section, requiredness, and confidence. | 3, 4 |
| 5 | 12 | Validate tax IDs, dates, emails, signatures, and required form fields. | 3, 4 |
| 6 | 16 | Add confidence scores to every inference and show them in UI/export. | 2-9 |
| 7 | 19 | Explain inference decisions in short domain language. | 2-9 |
| 8 | 13 | Recognize forms, invoices, academic papers, government publications, scanned archives, and mixed-language lessons. | 2, 3, 4, 6, 7, 8, 9 |
| 9 | 1 | Assert the inference engine against the 10 real-data fixtures plus synthetic edge cases. | 1-10 |
| 10 | 4 | Detect partial/corrupted PDFs and degrade with replacement guidance. | 10 |
| 11 | 5 | Treat malformed PDFs and unusual field names as expected inputs, not crashes. | 3, 10 |
| 12 | 2 | Normalize whitespace, RTL/script signals, dates, and numeric-ish form values at boundaries. | 2, 3, 4, 6, 9 |
| 13 | 3 | Define and test large-document budgets and large-file UI behavior. | 7, 8 |
| 14 | 24 | Enumerate app states and map each state to a deliberate UI/status. | 5, 7, 8, 10 |
| 15 | 25 | Ensure every error/busy/empty/loaded state has an exit action. | 5, 7, 10 |
| 16 | 26 | Add cancellation for long text extraction/OCR flows where browser APIs allow it. | 7, 8 |
| 17 | 27 | Guard against duplicate run clicks and stale async updates. | 7, 8 |
| 18 | 28 | Measure fixture performance and record before/after numbers. | 1-10 |
| 19 | 31 | Cache expensive derived document intelligence in project state. | 2, 7, 8 |
| 20 | 35 | Make canonical intelligence/export metadata deterministic. | 1-10 |
| 21 | 37 | Add a `?debug=1` inspectability panel for inferred state and timings. | 1-10 |
| 22 | 38 | Add provenance metadata to text/Markdown/HTML exports. | 1-10 |
| 23 | 11 | Rewrite surfaced labels/errors in document-domain vocabulary. | 3, 5, 10 |
| 24 | 14 | Include document shape, source identifier, schema version, confidence, and parameters in exports. | 1-10 |
| 25 | 18 | Surface anomalies such as low OCR confidence, scanned pages, raw field names, and huge page counts. | 3, 7, 8, 9 |

## Acceptance Gates

1. `make test`, `make build`, and `make smoke` pass.
2. Real-data fixture tests pass for all 10 inputs.
3. The app labels all 10 fixture conditions correctly.
4. No raw pdf-lib/pdf.js parser text is shown to the user for the encrypted/corrupted fixtures.
5. The Phase 2 postmortem records before/after pass rate, determinism, and performance.

## Explicit Non-Changes

The deployment mode remains Mode A. There is no backend, no server OCR, no account system, no cloud sync, no cryptographic signature implementation, and no visual-polish phase work.
