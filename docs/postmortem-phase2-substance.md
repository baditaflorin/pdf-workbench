# Phase 2 Substance Postmortem

Date: 2026-05-09

Version: v0.2.0

Mode: A, GitHub Pages and browser-only

## What Was Built

Phase 2 added a deterministic PDF intelligence layer: document-condition classification, document-shape inference, confidence scores, field-label inference, form validation warnings, actionable PDF-domain errors, bounded large-document page lists, cancellable text extraction, provenance-rich text exports, activity history, and `?debug=1` inspectability.

The implementation stayed within the existing surface area: open PDFs, forms, OCR, text extraction, edits, and exports.

## Real-Data Pass Rate

Baseline from the audit: 1/10 clear pass, 6/10 partial, 3/10 clear failure or unusable flow.

After Phase 2: 8/10 now produce a useful first guess or actionable recovery path with no setup. The two still-partial cases are semantic extraction for academic outlines and invoice key-value extraction: the app identifies them and suggests the right workflow, but it does not yet extract a structured outline or invoice table.

| Fixture | Before | After |
|---|---|---|
| 01 W3C dummy | Pass | Pass: clean PDF classification |
| 02 arXiv paper | Partial flat text | Partial: academic paper detected, outline extraction not yet structured |
| 03 IRS W-9 | Raw fields | Pass: W-9 labels, sections, required fields, confidence |
| 04 USCIS I-9 | Ungrouped fields | Pass: sections, inferred field types, required/format warnings |
| 05 Canada T1261 | Raw encrypted error | Pass: restricted-PDF diagnosis and next step |
| 06 sample invoice | Flat text | Partial: invoice detected, key-value extraction not yet structured |
| 07 JFK scan | Manual page OCR only | Pass: scanned/large classification, OCR confidence warning |
| 08 IRS Pub 17 | Huge page rail | Pass: large publication detection, bounded page list, progress-aware extraction |
| 09 Hebrew introductions | Silent RTL risk | Pass: mixed-language/RTL warning and reading-order guidance |
| 10 truncated W-9 | Raw parser offset | Pass: corrupt/partial-file diagnosis and replacement guidance |

## Top 5 Logic Gaps

1. Missing PDF condition detection: closed for the fixture set with conditions for clean text, dense text, structured text, fillable form, government form, XFA-style form, encrypted/restricted, corrupted/partial, scanned, large, mixed-language, and RTL.
2. Shallow form intelligence: partly closed. W-9 has known field mapping; I-9 gets strong vocabulary-based grouping and validation. Arbitrary forms still need better visual label extraction.
3. Manual page-local OCR: partly closed. The app now detects scan-like PDFs and surfaces confidence. Batch OCR remains intentionally out of scope for this substance pass.
4. Common document shapes unrecognized: partly closed. The app detects invoices, academic papers, government publications, scans, language lessons, tax forms, and employment forms. It does not yet extract full invoice tables or paper outlines.
5. Library-shaped errors and scale behavior: closed for encrypted/corrupted fixtures and improved for large documents with bounded page navigation, progress, and cancellation.

## Smart Behaviors Promised

Classification on upload: works on 10/10 fixtures.

Useful first guess: works on 8/10 fixtures; paper and invoice are recognized but not structurally extracted.

Confidence and reasoning: implemented for document conditions, shapes, form fields, warnings, and OCR output.

Domain-language failures: encrypted and corrupted fixtures no longer show raw parser/library text in the main UI.

Scale honesty: text extraction reports page progress; large page lists are bounded; measured large fixture worst case is 4.8 s for prep/classification.

## Determinism

The fixture test suite rebuilds canonical intelligence twice for every openable fixture and compares canonical output. Result: pass for all openable fixtures. Error fixtures also produce stable error kinds and primary actions.

## Performance

Fixture prep/classification median: 299 ms.

p95: 4,814 ms.

Worst: 4,814 ms on IRS Publication 17.

Initial JS budget remains under 200 KB gzip for the initial app path.

## Surprises

The W-9 exposes XFA-style internal identifiers even though pdf-lib can still see fields. A known-form mapping was much more useful than generic cleanup.

The JFK scan opens quickly because there is almost no embedded text to sample; the hard work is OCR, not opening.

The I-9 has readable field names but still feels bad without sections and validation because 128 flat controls are too many for a human to parse.

## Remaining Substance Improvements

1. Real invoice key-value and line-item extraction with confidence.
2. Academic/government publication outline extraction with stable section IDs.
3. Visual label extraction for arbitrary forms, not just W-9/I-9 heuristics.
4. Workerized PDF sampling/extraction for large tagged PDFs.
5. Batch OCR with page-range selection, cancellation, and per-page anomaly review.

## Honest Take

The app no longer feels like a toy at the moment of upload: it recognizes what the user brought, explains uncertainty, and fails in useful language. It still feels toy-like when the user expects semantic extraction from invoices or papers, because it now points at the right job but does not fully do that job. Phase 3 should focus there, not on polish.
