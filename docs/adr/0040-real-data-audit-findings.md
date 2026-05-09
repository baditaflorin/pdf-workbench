# 0040 Real-Data Audit Findings

## Status

Accepted

## Context

The v1 app opens demo PDFs and supports local page edits, forms, OCR, text extraction, visible signatures, and exports. The Phase 2 audit showed that real user PDFs are less clean: encrypted government forms, XFA-ish fields, raw AcroForm names, scanned archives, huge publications, mixed RTL text, invoices, papers, and corrupted uploads.

## Decision

Phase 2 Substance will treat the 10 committed real PDFs in `test/fixtures/realdata/` as the grading rubric. The core target is not more feature surface; it is smarter first guesses, explicit confidence, actionable failures, deterministic outputs, and scale honesty inside the same Mode A browser-only architecture.

## Consequences

Every inference change must be tested against fixtures. The postmortem must report before/after pass rate per fixture.

## Alternatives Considered

Synthetic-only tests were rejected because they would reproduce the v1 problem: a polished demo with brittle real-world behavior.
